'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import CrmFilesPanel from 'components/sections/crm/shared/CrmFilesPanel';

const dealStages = ['lead', 'quoted', 'negotiation', 'won', 'lost'];
const activityTypes = ['call', 'email', 'meeting', 'text', 'task', 'site_visit', 'demo', 'other'];
const activityDirections = ['outbound', 'inbound', 'internal'];
const equipmentCategories = ['tractor', 'combine', 'planter', 'sprayer', 'hay', 'tillage', 'utility_vehicle', 'attachment', 'other'];
const equipmentConditions = ['new', 'used', 'either'];
const equipmentAvailability = ['availability_unknown', 'in_stock_auburn', 'in_stock_transfer', 'pending', 'unavailable'];
const equipmentStatuses = ['equipment_added', 'setup_required', 'transfer_required', 'order_required', 'setup_requested', 'transfer_requested', 'order_placed', 'transfer_in_progress', 'order_in_progress', 'setup_in_progress', 'ready', 'delivered'];

const DealDetails = ({ dealId }) => {
  const supabase = useMemo(() => createClient(), []);
  const [deal, setDeal] = useState(null);
  const [equipmentInterests, setEquipmentInterests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);

  const fetchDetails = async () => {
    if (!dealId) {
      setError('Deal ID is missing.');
      setIsLoading(false);
      return;
    }

    setError(null);

    const [dealResult, equipmentResult, activitiesResult, notesResult] = await Promise.all([
      supabase
        .from('deals')
        .select(
          `
          *,
          contacts(id, first_name, last_name, title, email, phone, mobile_phone),
          companies(id, name, company_type, website, phone, email, city, region),
          leads(id, status, source, priority, estimated_budget, next_follow_up_at)
        `
        )
        .eq('id', dealId)
        .single(),
      supabase.from('equipment_interests').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }),
      supabase.from('activities').select('*').eq('deal_id', dealId).order('occurred_at', { ascending: false }),
      supabase.from('notes').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }),
    ]);

    const queryError = [dealResult.error, equipmentResult.error, activitiesResult.error, notesResult.error].find(Boolean);

    if (queryError) {
      setError(queryError.message);
    } else {
      setDeal(dealResult.data);
      setEquipmentInterests(equipmentResult.data || []);
      setActivities(activitiesResult.data || []);
      setNotes(notesResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();

    if (!dealId) return undefined;

    const channel = supabase
      .channel(`agrm-deal-detail-${dealId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals', filter: `id=eq.${dealId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_interests', filter: `deal_id=eq.${dealId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `deal_id=eq.${dealId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `deal_id=eq.${dealId}` }, () => fetchDetails())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, supabase]);

  const timelineItems = useMemo(
    () =>
      [
        ...activities.map((activity) => ({
          id: `activity-${activity.id}`,
          activityId: activity.id,
          type: activity.type,
          title: activity.subject || formatEnum(activity.type),
          body: activity.body,
          date: activity.occurred_at || activity.created_at,
          dueAt: activity.due_at,
          completedAt: activity.completed_at,
        })),
        ...notes.map((note) => ({
          id: `note-${note.id}`,
          type: 'note',
          title: 'Note',
          body: note.body,
          date: note.created_at,
        })),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [activities, notes]
  );

  if (isLoading) {
    return <Typography sx={{ py: 4 }}>Loading deal...</Typography>;
  }

  if (error || !deal) {
    return <Alert severity="error">{error || 'Deal not found.'}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title={deal.name}
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Deals', url: paths.deals },
            { label: 'Deal detail', active: true },
          ]}
          actionComponent={
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button variant="soft" color="neutral" onClick={() => setDialog('activity')} startIcon={<IconifyIcon icon="material-symbols:add-call-outline-rounded" />}>
                Add Activity
              </Button>
              <Button variant="soft" color="neutral" onClick={() => setDialog('note')} startIcon={<IconifyIcon icon="material-symbols:note-add-outline-rounded" />}>
                Add Note
              </Button>
              <Button variant="contained" onClick={() => setDialog('edit')} startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}>
                Edit Deal
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
                <Chip label={formatEnum(deal.stage)} variant="soft" color={deal.stage === 'won' ? 'success' : deal.stage === 'lost' ? 'error' : 'primary'} />
                <Chip label={formatCurrency(deal.amount)} variant="soft" color="neutral" />
                <Chip label={`${deal.probability || 0}% probability`} variant="soft" color="neutral" />
              </Stack>
              <Typography variant="h3" sx={{ mb: 1, overflowWrap: 'anywhere' }}>
                {deal.name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {entityName(deal)}{deal.companies?.name ? ` · ${deal.companies.name}` : ''}
              </Typography>
            </Box>
            <Stack direction="column" spacing={1} sx={{ minWidth: { md: 220 } }}>
              <InfoPill label="Expected Close" value={formatDate(deal.expected_close_date)} />
              <InfoPill label="Last Updated" value={formatDateTime(deal.updated_at)} />
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack direction="column" spacing={3}>
          <DealInfoCard deal={deal} />
          <LinkedRecordsCard deal={deal} />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack direction="column" spacing={3}>
          <EquipmentCard equipmentInterests={equipmentInterests} onAdd={() => setDialog('equipment')} />
          <CrmFilesPanel recordType="deal" recordId={deal.id} />
          <TimelineCard items={timelineItems} onAddActivity={() => setDialog('activity')} onAddNote={() => setDialog('note')} supabase={supabase} onSaved={fetchDetails} />
        </Stack>
      </Grid>

      <EditDealDialog open={dialog === 'edit'} deal={deal} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddNoteDialog open={dialog === 'note'} deal={deal} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddActivityDialog open={dialog === 'activity'} deal={deal} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddEquipmentDialog open={dialog === 'equipment'} deal={deal} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
    </Grid>
  );
};

function InfoPill({ label, value }) {
  return (
    <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Box>
  );
}

function SectionTitle({ title, icon, action }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary', fontSize: 22 }} />
        <Typography variant="h6">{title}</Typography>
      </Stack>
      {action}
    </Stack>
  );
}

function DealInfoCard({ deal }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Deal Info" icon="material-symbols:request-quote-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        <InfoRow label="Stage" value={formatEnum(deal.stage)} />
        <InfoRow label="Amount" value={formatCurrency(deal.amount)} />
        <InfoRow label="Probability" value={`${deal.probability || 0}%`} />
        <InfoRow label="Expected Close" value={formatDate(deal.expected_close_date)} />
        <InfoRow label="Closed At" value={formatDateTime(deal.closed_at)} />
        <InfoRow label="Lost Reason" value={deal.lost_reason} />
        <InfoRow label="Created" value={formatDateTime(deal.created_at)} />
      </Stack>
      {deal.notes && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Notes</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>{deal.notes}</Typography>
        </>
      )}
    </Paper>
  );
}

function LinkedRecordsCard({ deal }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Linked Records" icon="material-symbols:link-rounded" />
      <Stack direction="column" spacing={1.5}>
        <RecordRow
          title={deal.contacts ? contactName(deal.contacts) : 'No linked contact'}
          subtitle={deal.contacts ? [deal.contacts.title, deal.contacts.email, deal.contacts.mobile_phone || deal.contacts.phone].filter(Boolean).join(' · ') : 'Add a contact link later from edit support.'}
          href={deal.contact_id ? paths.contactDetails(deal.contact_id) : null}
        />
        <RecordRow
          title={deal.companies?.name || 'No linked company'}
          subtitle={deal.companies ? [formatEnum(deal.companies.company_type), deal.companies.city, deal.companies.region].filter(Boolean).join(' · ') : 'Company linkage is optional.'}
          href={deal.company_id ? paths.companyDetails(deal.company_id) : null}
        />
        <RecordRow
          title={deal.leads ? `Lead: ${formatEnum(deal.leads.status)}` : 'No linked lead'}
          subtitle={deal.leads ? [deal.leads.source, `Priority ${deal.leads.priority || '-'}`, `Budget ${formatCurrency(deal.leads.estimated_budget)}`].filter(Boolean).join(' · ') : 'Deals can stand alone without a lead.'}
          href={deal.lead_id ? paths.leadDetails(deal.lead_id) : null}
        />
      </Stack>
    </Paper>
  );
}

function EquipmentCard({ equipmentInterests, onAdd }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle
        title="Equipment Interests"
        icon="material-symbols:agriculture-outline-rounded"
        action={<Button size="small" variant="soft" color="neutral" onClick={onAdd} startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}>Add</Button>}
      />
      <Stack direction="column" spacing={1.5}>
        {equipmentInterests.length ? equipmentInterests.map((interest) => {
          const equipmentName = [interest.model_year, interest.make, interest.model].filter(Boolean).join(' ');
          const budget = [formatCurrency(interest.price_min), formatCurrency(interest.price_max)].filter((value) => value !== '-').join(' - ') || '-';
          return <RecordRow key={interest.id} title={equipmentName || formatEnum(interest.category)} subtitle={`${formatEnum(interest.category)} · ${formatEnum(interest.condition)} · Budget ${budget}`} chip={interest.trade_in ? 'Trade-in' : null} />;
        }) : <EmptyState label="No equipment interests yet" />}
      </Stack>
    </Paper>
  );
}

function TimelineCard({ items, onAddActivity, onAddNote, supabase, onSaved }) {
  const handleComplete = async (activityId) => {
    const { error } = await supabase.from('activities').update({ completed_at: new Date().toISOString() }).eq('id', activityId);
    if (!error) onSaved();
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle
        title="Activities & Notes"
        icon="material-symbols:history-rounded"
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="soft" color="neutral" onClick={onAddActivity}>Activity</Button>
            <Button size="small" variant="soft" color="neutral" onClick={onAddNote}>Note</Button>
          </Stack>
        }
      />
      <Stack direction="column" divider={<Divider flexItem />} spacing={2}>
        {items.length ? items.map((item) => (
          <Box key={item.id}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="subtitle2">{item.title}</Typography>
                {item.completedAt && <Chip label="Complete" size="small" variant="soft" color="success" />}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Chip label={formatEnum(item.type)} size="small" variant="soft" />
                {item.activityId && !item.completedAt && (
                  <Button size="small" variant="soft" color="success" onClick={() => handleComplete(item.activityId)}>
                    Complete
                  </Button>
                )}
              </Stack>
            </Stack>
            {item.body && <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, overflowWrap: 'anywhere' }}>{item.body}</Typography>}
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {formatDateTime(item.date)}
              {item.dueAt ? ` · Due ${formatDateTime(item.dueAt)}` : ''}
            </Typography>
          </Box>
        )) : <EmptyState label="No activities or notes yet" />}
      </Stack>
    </Paper>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Stack>
  );
}

function RecordRow({ title, subtitle, chip, href }) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {href ? <Link href={href} underline="hover" color="text.primary">{title}</Link> : title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>{subtitle || '-'}</Typography>
        </Box>
        {chip && <Chip label={chip} size="small" variant="soft" color="primary" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />}
      </Stack>
    </Box>
  );
}

function EditDealDialog({ open, deal, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    name: deal?.name || '',
    stage: deal?.stage || 'lead',
    amount: deal?.amount || '',
    probability: deal?.probability || 0,
    expectedCloseDate: deal?.expected_close_date || '',
    lostReason: deal?.lost_reason || '',
    notes: deal?.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: deal?.name || '',
        stage: deal?.stage || 'lead',
        amount: deal?.amount || '',
        probability: deal?.probability || 0,
        expectedCloseDate: deal?.expected_close_date || '',
        lostReason: deal?.lost_reason || '',
        notes: deal?.notes || '',
      });
    }
  }, [deal, open]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      stage: form.stage,
      amount: form.amount || null,
      probability: Number(form.probability) || 0,
      expected_close_date: form.expectedCloseDate || null,
      closed_at: ['won', 'lost'].includes(form.stage) ? deal.closed_at || new Date().toISOString() : null,
      lost_reason: form.stage === 'lost' ? cleanText(form.lostReason) : null,
      notes: cleanText(form.notes),
    };
    const { error } = await supabase.from('deals').update(payload).eq('id', deal.id);
    setIsSaving(false);
    if (!error) {
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Deal</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <TextField label="Deal Name" value={form.name} onChange={handleField(setForm, 'name')} fullWidth required />
          <TextField select label="Stage" value={form.stage} onChange={handleField(setForm, 'stage')} fullWidth>
            {dealStages.map((stage) => <MenuItem key={stage} value={stage}>{formatEnum(stage)}</MenuItem>)}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Amount" type="number" value={form.amount} onChange={handleField(setForm, 'amount')} fullWidth />
            <TextField label="Probability" type="number" value={form.probability} onChange={handleField(setForm, 'probability')} slotProps={{ htmlInput: { min: 0, max: 100 } }} fullWidth />
          </Stack>
          <TextField label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={handleField(setForm, 'expectedCloseDate')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          {form.stage === 'lost' && <TextField label="Lost Reason" value={form.lostReason} onChange={handleField(setForm, 'lostReason')} fullWidth multiline rows={2} />}
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddNoteDialog({ open, deal, onClose, onSaved, supabase }) {
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!body.trim()) return;
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('notes').insert({ owner_id: userResult.user.id, deal_id: deal.id, lead_id: deal.lead_id, contact_id: deal.contact_id, company_id: deal.company_id, body: body.trim() });
    setIsSaving(false);
    if (!error) {
      setBody('');
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Note</DialogTitle>
      <DialogContent>
        <TextField label="Note" value={body} onChange={(event) => setBody(event.target.value)} fullWidth multiline rows={5} sx={{ mt: 1 }} />
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Note</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddActivityDialog({ open, deal, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ type: 'call', direction: 'outbound', subject: '', body: '', occurredAt: toDateTimeLocal(new Date().toISOString()), dueAt: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ type: 'call', direction: 'outbound', subject: '', body: '', occurredAt: toDateTimeLocal(new Date().toISOString()), dueAt: '' });
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('activities').insert({
      owner_id: userResult.user.id,
      deal_id: deal.id,
      lead_id: deal.lead_id,
      contact_id: deal.contact_id,
      company_id: deal.company_id,
      type: form.type,
      direction: form.direction,
      subject: cleanText(form.subject) || formatEnum(form.type),
      body: cleanText(form.body),
      occurred_at: form.occurredAt ? new Date(form.occurredAt).toISOString() : new Date().toISOString(),
      due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
    });
    setIsSaving(false);
    if (!error) {
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Activity</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Type" value={form.type} onChange={handleField(setForm, 'type')} fullWidth>
              {activityTypes.map((type) => <MenuItem key={type} value={type}>{formatEnum(type)}</MenuItem>)}
            </TextField>
            <TextField select label="Direction" value={form.direction} onChange={handleField(setForm, 'direction')} fullWidth>
              {activityDirections.map((direction) => <MenuItem key={direction} value={direction}>{formatEnum(direction)}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Subject" value={form.subject} onChange={handleField(setForm, 'subject')} fullWidth />
          <TextField label="Details" value={form.body} onChange={handleField(setForm, 'body')} fullWidth multiline rows={3} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Occurred At" type="datetime-local" value={form.occurredAt} onChange={handleField(setForm, 'occurredAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Due At" type="datetime-local" value={form.dueAt} onChange={handleField(setForm, 'dueAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Activity</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddEquipmentDialog({ open, deal, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ category: 'tractor', make: '', model: '', condition: 'either', availability: 'availability_unknown', status: 'equipment_added', priceMin: '', priceMax: '', tradeIn: 'false', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('equipment_interests').insert({
      owner_id: userResult.user.id,
      deal_id: deal.id,
      lead_id: deal.lead_id,
      contact_id: deal.contact_id,
      category: form.category,
      make: cleanText(form.make),
      model: cleanText(form.model),
      condition: form.condition,
      availability: form.availability,
      status: form.status,
      price_min: form.priceMin || null,
      price_max: form.priceMax || null,
      trade_in: form.tradeIn === 'true',
      notes: cleanText(form.notes),
    });
    setIsSaving(false);
    if (!error) {
      setForm({ category: 'tractor', make: '', model: '', condition: 'either', availability: 'availability_unknown', status: 'equipment_added', priceMin: '', priceMax: '', tradeIn: 'false', notes: '' });
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Equipment Interest</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <TextField select label="Category" value={form.category} onChange={handleField(setForm, 'category')} fullWidth>
            {equipmentCategories.map((category) => <MenuItem key={category} value={category}>{formatEnum(category)}</MenuItem>)}
          </TextField>
          <TextField label="Make" value={form.make} onChange={handleField(setForm, 'make')} fullWidth />
          <TextField label="Model" value={form.model} onChange={handleField(setForm, 'model')} fullWidth />
          <TextField select label="Condition" value={form.condition} onChange={handleField(setForm, 'condition')} fullWidth>
            {equipmentConditions.map((condition) => <MenuItem key={condition} value={condition}>{formatEnum(condition)}</MenuItem>)}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Availability" value={form.availability} onChange={handleField(setForm, 'availability')} fullWidth>
              {equipmentAvailability.map((availability) => <MenuItem key={availability} value={availability}>{formatEnum(availability)}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>
              {equipmentStatuses.map((status) => <MenuItem key={status} value={status}>{formatEnum(status)}</MenuItem>)}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Price Min" type="number" value={form.priceMin} onChange={handleField(setForm, 'priceMin')} fullWidth />
            <TextField label="Price Max" type="number" value={form.priceMax} onChange={handleField(setForm, 'priceMax')} fullWidth />
          </Stack>
          <TextField select label="Trade-in" value={form.tradeIn} onChange={handleField(setForm, 'tradeIn')} fullWidth>
            <MenuItem value="false">No</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
          </TextField>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Interest</Button>
      </DialogActions>
    </Dialog>
  );
}

function EmptyState({ label }) {
  return <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>{label}</Typography>;
}

function handleField(setForm, key) {
  return (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Unnamed contact';
}

function entityName(record) {
  return record.contacts ? contactName(record.contacts) : record.companies?.name || 'Deal';
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function formatCurrency(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return '-';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default DealDetails;
