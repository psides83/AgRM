import { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';

const methods = ['Visit', 'Call', 'Email', 'Other'];
export const targetKey = (target) =>
  target.lead_id ? `lead-${target.lead_id}` :
  target.contact_id ? `contact-${target.contact_id}` : `company-${target.company_id}`;

export function localDay() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, '0')).join('-');
}

export default function Gameplan({ supabase, date, records, targets, unmapped, onChange, loading, loadError }) {
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

  async function add(day, fields) {
    const { data, error } = await table().select('position').eq('plan_date', day)
      .order('position', { ascending: false }).limit(1);
    if (error) return { error };
    return table().insert({ ...fields, plan_date: day, position: (data[0]?.position ?? -1) + 1 });
  }

  function move(index, offset) {
    const ids = targets.map(({ id }) => id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    return run(() => supabase.rpc('reorder_crm_gameplan', { target_date: date, ordered_ids: ids }));
  }

  const disabled = busy || loading || Boolean(loadError);

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h6">Daily Gameplan</Typography>
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
        renderInput={(params) => <TextField {...params} size="small" label="Find a lead, contact, or company" />}
      />
      <Stack direction="row" spacing={1}>
        <TextField select size="small" label="Activity" value={method} onChange={(event) => setMethod(event.target.value)} sx={{ flex: 1 }}>
          {methods.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
        <Button variant="contained" disabled={disabled || !record} onClick={() => run(
          () => add(date, { [`${record.kind}_id`]: record.id.slice(record.kind.length + 1), method }),
        )}>Add target</Button>
      </Stack>
      {loading && <Typography role="status">Loading gameplan…</Typography>}
      {!loading && !loadError && !targets.length && <Typography color="text.secondary">No targets planned for this day.</Typography>}
      <Stack component="ol" spacing={1.5} sx={{ m: 0, pl: 3 }}>
        {targets.map((target, index) => {
          const key = targetKey(target);
          return (
            <Box component="li" key={target.id}>
              <Target
                target={target}
                record={records.find((item) => item.id === key)}
                needsLocation={unmapped.some((item) => item.id === key)}
                disabled={disabled}
                first={index === 0}
                last={index === targets.length - 1}
                move={(offset) => move(index, offset)}
                remove={() => run(() => table().delete().eq('id', target.id))}
                save={(outcome) => run(() => table().update({ outcome }).eq('id', target.id), 'Outcome saved.')}
                followUp={(day) => run(() => {
                  const { lead_id, contact_id, company_id, method } = target;
                  return add(day, { lead_id, contact_id, company_id, method });
                }, `Follow-up scheduled for ${day}.`)}
              />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

function Target({ target, record, needsLocation, disabled, first, last, move, remove, save, followUp }) {
  const [outcome, setOutcome] = useState(target.outcome);
  const [followUpDate, setFollowUpDate] = useState('');
  useEffect(() => setOutcome(target.outcome), [target.outcome]);

  return (
    <Stack spacing={1} sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle2">
        {record ? <Link href={record.href}>{record.title}</Link> : 'CRM record unavailable'} · {target.method}
      </Typography>
      {record?.address && <Typography variant="caption">{record.address}</Typography>}
      {needsLocation && <Typography variant="caption" color="text.secondary">No map pin</Typography>}
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
        <Button size="small" disabled={disabled || first} onClick={() => move(-1)}>Move up</Button>
        <Button size="small" disabled={disabled || last} onClick={() => move(1)}>Move down</Button>
        <Button size="small" color="error" disabled={disabled} onClick={remove}>Remove</Button>
      </Stack>
      <TextField label="Outcome" size="small" multiline value={outcome} onChange={(event) => setOutcome(event.target.value)} />
      <Button size="small" disabled={disabled || outcome.trim() === target.outcome} onClick={() => save(outcome.trim())}>Save outcome</Button>
      <TextField type="date" size="small" label="Follow-up date" value={followUpDate}
        onChange={(event) => setFollowUpDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <Button size="small" disabled={disabled || followUpDate <= target.plan_date}
        onClick={() => followUp(followUpDate)}>Schedule follow-up</Button>
    </Stack>
  );
}
