import AutocompleteTextField from 'components/base/AutocompleteTextField';
import { distanceFrom, geocodeAddress, getDirectionsLinks } from './navigation';
import paths from 'routes/paths';
import { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Chip, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { addTarget, createGameplan, methods, targetKey } from './gameplanData';

export default function Gameplan({ supabase, date, records, targets, onDaysChange, onChange, loading, loadError }) {
  const [origin, setOrigin] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  function showDistances() {
    if (!navigator.geolocation) {
      setLocationError('Location is unavailable in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setOrigin(coords); setLocating(false); },
      () => { setLocationError('Could not get your location. Check your browser permissions.'); setLocating(false); },
      { timeout: 10000, maximumAge: 10000 },
    );
  }

  const [record, setRecord] = useState(null);
  const [method, setMethod] = useState('Visit');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const table = () => supabase.from('crm_gameplan_targets');

  async function run(action, success) {
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await action();
      if (error) throw error;
      await onChange();
      if (success) setMessage({ severity: 'success', text: success });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error.code === '23505' ? 'This target already has that activity on the selected day.' : error.message,
      });
    } finally {
      setBusy(false);
    }
  }

  function move(index, offset) {
    const ids = targets.map(({ id }) => id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    return run(() => supabase.rpc('reorder_crm_gameplan', { target_date: date, ordered_ids: ids }));
  }

  function logOutcome(target, record) {
    return run(async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return { error };
      if (!data.user) return { error: new Error('Sign in to log an activity.') };

      const { lead_id, contact_id, company_id, method, outcome } = target;
      return supabase.from('activities').insert({
        owner_id: data.user.id,
        gameplan_target_id: target.id,
        lead_id,
        contact_id: contact_id || record.contact?.id || null,
        company_id: company_id || record.company?.id || null,
        type: method === 'Other' ? 'note' : method.toLowerCase(),
        direction: method === 'Other' ? null : 'outbound',
        subject: `${method} outcome · ${record.title}`,
        body: outcome,
        completed_at: new Date().toISOString(),
      });
    }, 'Outcome logged in CRM Activities.');
  }

  const disabled = busy || loading || Boolean(loadError);

  return (
    <Stack direction="column" spacing={2} sx={{ p: 2 }}>
      <Typography variant="h6">Targets</Typography>
      {targets.length > 0 && (
        <Button sx={{ alignSelf: 'flex-start' }} size="small" disabled={locating} onClick={showDistances}>
          {locating ? 'Getting location…' : origin ? 'Refresh distances' : 'Show distances'}
        </Button>
      )}
      {locationError && <Alert severity="error">{locationError}</Alert>}
      <Typography variant="body2" color="text.secondary">
        Build your private list in the order you want to work it. Targets without a location stay in the list.
      </Typography>
      {loadError && <Alert severity="error" action={<Button onClick={onChange}>Retry</Button>}>{loadError}</Alert>}
      {message && <Alert severity={message.severity}>{message.text}</Alert>}
      <Autocomplete
        options={records}
        value={record}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionKey={(option) => option.id}
        getOptionLabel={(option) => `${option.title} · ${option.kind}${option.address ? ` · ${option.address}` : ''}`}
        onChange={(_, value) => setRecord(value)}
        renderInput={(params) => <AutocompleteTextField params={params} size="small" label="Find a lead, contact, or company" />}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(140px, 1fr) auto' }, gap: 1 }}>
        <TextField select size="small" label="Activity" value={method} onChange={(event) => setMethod(event.target.value)} sx={{ flex: 1 }}>
          {methods.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
        <Button variant="contained" disabled={disabled || !record} onClick={() => run(
          () => addTarget(supabase, date, { [`${record.kind}_id`]: record.id.slice(record.kind.length + 1), method }),
        )}>Add target</Button>
      </Box>
      {loading && <Typography role="status">Loading gameplan…</Typography>}
      {!loading && !loadError && !targets.length && <Typography color="text.secondary">No targets planned for this day.</Typography>}
      <Stack direction="column" component="ol" spacing={1.5} sx={{ m: 0, pl: 3 }}>
        {targets.map((target, index) => {
          const key = targetKey(target);
          return (
            <Box component="li" key={target.id}>
              <Target
                target={target}
                origin={origin}
                record={records.find((item) => item.id === key)}

                disabled={disabled}
                first={index === 0}
                last={index === targets.length - 1}
                move={(offset) => move(index, offset)}
                remove={() => run(() => table().delete().eq('id', target.id))}
                save={(outcome) => run(() => table().update({ outcome }).eq('id', target.id), 'Outcome saved.')}
                logOutcome={logOutcome}
                followUp={(day) => run(async () => {
                  const { lead_id, contact_id, company_id, method } = target;
                  const { error } = await createGameplan(supabase, day);
                  if (error) return { error };
                  await onDaysChange();
                  return addTarget(supabase, day, { lead_id, contact_id, company_id, method });
                }, `Follow-up scheduled for ${day}.`)}
              />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

function Target({ target, record, origin, disabled, first, last, move, remove, save, logOutcome, followUp }) {
  const address = record?.address;
  const storedCoordinates = record?.coordinates;
  const [resolved, setResolved] = useState(null);
  const showDistance = Boolean(origin);

  useEffect(() => {
    if (!showDistance || storedCoordinates || !address || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return;
    let active = true;
    geocodeAddress(address).then((coordinates) => {
      if (active) setResolved({ address, coordinates });
    });
    return () => { active = false; };
  }, [address, showDistance, storedCoordinates]);

  const coordinates = storedCoordinates || (resolved?.address === address ? resolved?.coordinates : null);
  const distance = origin && coordinates ? distanceFrom(origin, coordinates) : null;
  const directions = record ? getDirectionsLinks({ ...record, coordinates }) : null;

  const [outcome, setOutcome] = useState(target.outcome);
  const outcomeLogged = Boolean(target.activities?.length);
  const [followUpDate, setFollowUpDate] = useState('');
  useEffect(() => setOutcome(target.outcome), [target.outcome]);

  return (
    <Stack direction="column" spacing={1} sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle2">
        {record ? <Link recordPreview href={record.href}>{record.title}</Link> : 'CRM record unavailable'} · {target.method}
      </Typography>
      {record?.company && (
        <Typography variant="body2">
          Company: <Link recordPreview href={paths.companyDetails(record.company.id)}>{record.company.name}</Link>
        </Typography>
      )}
      {record?.contact && (
        <Typography variant="body2">
          Contact: <Link recordPreview href={paths.contactDetails(record.contact.id)}>{record.contact.name}</Link>
        </Typography>
      )}
      {record?.kind === 'lead' && record.subtitle && (
        <Typography variant="body2" color="text.secondary">{record.subtitle}</Typography>
      )}
      {record?.kind === 'contact' && (record.jobTitle || record.accountNumber) && (
        <Typography variant="body2" color="text.secondary">
          {[record.jobTitle, record.accountNumber && `Account ${record.accountNumber}`].filter(Boolean).join(' · ')}
        </Typography>
      )}
      {record?.relatedLeads?.map((lead) => (
        <Typography key={lead.id} variant="body2">
          <Link recordPreview href={lead.href}>Lead details</Link>{lead.subtitle && ` · ${lead.subtitle}`}
        </Typography>
      ))}
      {record?.address && <Typography variant="caption">{record.address}</Typography>}
      {distance !== null && (
        <Typography variant="caption" color="text.secondary">
          {distance < 0.1 ? '<0.1' : distance.toFixed(1)} mi away (straight line)
        </Typography>
      )}
      {directions && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" href={directions.google} target="_blank" rel="noopener noreferrer">
            Google Maps
          </Button>
          <Button size="small" variant="outlined" href={directions.apple} target="_blank" rel="noopener noreferrer">
            Apple Maps
          </Button>
        </Stack>
      )}

      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
        <Button size="small" disabled={disabled || first} onClick={() => move(-1)}>Move up</Button>
        <Button size="small" disabled={disabled || last} onClick={() => move(1)}>Move down</Button>
        <Button size="small" color="error" disabled={disabled} onClick={remove}>Remove</Button>
      </Stack>
      <TextField label="Outcome" size="small" multiline value={outcome} onChange={(event) => setOutcome(event.target.value)} />
      <Button size="small" disabled={disabled || outcome.trim() === target.outcome} onClick={() => save(outcome.trim())}>Save outcome</Button>
      {outcomeLogged && (
        <Chip label="Logged as activity" color="success" size="small" sx={{ alignSelf: 'flex-start' }} />
      )}
      {target.activityLinkUnavailable && target.outcome.trim() && (
        <Typography variant="body2" color="text.secondary">
          Activity logging is temporarily unavailable.
        </Typography>
      )}
      {!target.activityLinkUnavailable && !outcomeLogged && record && target.outcome.trim() && (
        <Button size="small" variant="outlined"
          disabled={disabled || outcome.trim() !== target.outcome}
          onClick={() => logOutcome(target, record)}>
          Log outcome as activity
        </Button>
      )}
      <TextField type="date" size="small" label="Follow-up date" value={followUpDate}
        onChange={(event) => setFollowUpDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <Button size="small" disabled={disabled || followUpDate <= target.plan_date}
        onClick={() => followUp(followUpDate)}>Schedule follow-up</Button>
    </Stack>
  );
}
