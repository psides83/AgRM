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

const leadStatuses = ['new', 'working', 'qualified', 'unqualified', 'converted'];
const dealStages = ['lead', 'quoted', 'negotiation', 'won', 'lost'];
const activityTypes = ['call', 'email', 'meeting', 'text', 'task', 'site_visit', 'demo', 'other'];
const activityDirections = ['outbound', 'inbound', 'internal'];
const equipmentCategories = ['tractor', 'combine', 'planter', 'sprayer', 'hay', 'tillage', 'utility_vehicle', 'attachment', 'other'];
const equipmentConditions = ['new', 'used', 'either'];

const LeadDetails = ({ leadId }) => {
  const supabase = useMemo(() => createClient(), []);
  const [lead, setLead] = useState(null);
  const [equipmentInterests, setEquipmentInterests] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);

  const fetchDetails = async () => {
    setError(null);

    const [leadResult, equipmentResult, dealsResult, activitiesResult, notesResult] = await Promise.all([
      supabase
        .from('leads')
        .select(
          `
          *,
          contacts(id, first_name, last_name, title, email, phone, mobile_phone),
          companies(id, name, company_type, website, phone, email, city, region)
        `
        )
        .eq('id', leadId)
        .single(),
      supabase.from('equipment_interests').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabase.from('deals').select('*').eq('lead_id', leadId).order('updated_at', { ascending: false }),
      supabase.from('activities').select('*').eq('lead_id', leadId).order('occurred_at', { ascending: false }),
      supabase.from('notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
    ]);

    const queryError = [leadResult.error, equipmentResult.error, dealsResult.error, activitiesResult.error, notesResult.error].find(Boolean);

    if (queryError) {
      setError(queryError.message);
    } else {
      setLead(leadResult.data);
      setEquipmentInterests(equipmentResult.data || []);
      setDeals(dealsResult.data || []);
      setActivities(activitiesResult.data || []);
      setNotes(notesResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();

    const channel = supabase
      .channel(`agrm-lead-${leadId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `id=eq.${leadId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_interests', filter: `lead_id=eq.${leadId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals', filter: `lead_id=eq.${leadId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `lead_id=eq.${leadId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `lead_id=eq.${leadId}` }, () => fetchDetails())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, supabase]);

  const timelineItems = useMemo(() => {
    const noteItems = notes.map((note) => ({
      id: `note-${note.id}`,
      type: note.pinned ? 'pinned note' : 'note',
      title: note.pinned ? 'Pinned note' : 'Note',
      body: note.body,
      date: note.created_at,
    }));

    const activityItems = activities.map((activity) => ({
      id: `activity-${activity.id}`,
      activityId: activity.id,
      type: activity.type,
      title: activity.subject,
      body: activity.body,
      date: activity.occurred_at,
      dueAt: activity.due_at,
      completedAt: activity.completed_at,
    }));

    return [...noteItems, ...activityItems].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activities, notes]);

  if (isLoading) return <Typography sx={{ p: 3 }}>Loading lead...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!lead) return <Alert severity="warning">Lead not found.</Alert>;

  const contact = lead.contacts;
  const company = lead.companies;
  const title = entityName(lead);

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader
            title={title}
            breadcrumb={[
              { label: 'Home', url: paths.crm },
              { label: 'Contacts', url: paths.contacts },
              { label: 'Lead detail', active: true },
            ]}
          />
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={3}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
                  <Chip label={formatEnum(lead.status)} color="primary" variant="soft" />
                  <Chip label={`Priority ${lead.priority}`} color="neutral" variant="soft" />
                  <Chip label={formatCurrency(lead.estimated_budget)} color="neutral" variant="soft" />
                </Stack>
                <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                  {title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {[lead.source, company?.name].filter(Boolean).join(' · ') || 'Lead'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button variant="soft" color="neutral" onClick={() => setDialog('status')} startIcon={<IconifyIcon icon="material-symbols:tune-rounded" />}>
                  Update Lead
                </Button>
                <Button variant="soft" color="neutral" onClick={() => setDialog('note')} startIcon={<IconifyIcon icon="material-symbols:note-add-outline-rounded" />}>
                  Add Note
                </Button>
                <Button variant="soft" color="neutral" onClick={() => setDialog('activity')} startIcon={<IconifyIcon icon="material-symbols:add-call-outline-rounded" />}>
                  Add Activity
                </Button>
                <Button variant="soft" color="neutral" onClick={() => setDialog('convert')} disabled={lead.status === 'converted'} startIcon={<IconifyIcon icon="material-symbols:currency-exchange-rounded" />}>
                  Convert
                </Button>
                <Button variant="contained" onClick={() => setDialog('equipment')} startIcon={<IconifyIcon icon="material-symbols:agriculture-outline-rounded" />}>
                  Add Interest
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="column" spacing={3}>
            <InfoCard title="Lead Info" icon="material-symbols:filter-alt-outline-rounded">
              <InfoRow label="Status" value={formatEnum(lead.status)} />
              <InfoRow label="Source" value={lead.source} />
              <InfoRow label="Priority" value={lead.priority} />
              <InfoRow label="Budget" value={formatCurrency(lead.estimated_budget)} />
              <InfoRow label="Target purchase" value={formatDate(lead.target_purchase_date)} />
              <InfoRow label="Next follow-up" value={formatDateTime(lead.next_follow_up_at)} />
              {lead.notes && <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>{lead.notes}</Typography>}
            </InfoCard>

            <InfoCard title="Contact & Company" icon="material-symbols:contacts-outline-rounded">
              {contact ? (
                <>
                  <InfoRow label="Contact" value={contactName(contact)} />
                  <InfoRow label="Role" value={contact.title} />
                  <InfoRow label="Email" value={contact.email} />
                  <InfoRow label="Phone" value={contact.mobile_phone || contact.phone} />
                  <Button component={Link} href={paths.contactDetails(contact.id)} underline="none" variant="soft" color="neutral" sx={{ mt: 1 }}>
                    Open Contact
                  </Button>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No contact linked.</Typography>
              )}
              <Divider />
              {company ? (
                <>
                  <InfoRow label="Company" value={company.name} />
                  <InfoRow label="Type" value={company.company_type} />
                  <InfoRow label="Phone" value={company.phone} />
                  <InfoRow label="Location" value={[company.city, company.region].filter(Boolean).join(', ')} />
                  <Button component={Link} href={paths.companyDetails(company.id)} underline="none" variant="soft" color="neutral" sx={{ mt: 1 }}>
                    Open Company
                  </Button>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No company linked.</Typography>
              )}
            </InfoCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="column" spacing={3}>
            <DealsCard deals={deals} />
            <EquipmentCard equipmentInterests={equipmentInterests} />
            <CrmFilesPanel recordType="lead" recordId={lead.id} />
            <TimelineCard items={timelineItems} supabase={supabase} onSaved={fetchDetails} />
          </Stack>
        </Grid>
      </Grid>

      <UpdateLeadDialog open={dialog === 'status'} lead={lead} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddNoteDialog open={dialog === 'note'} lead={lead} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddActivityDialog open={dialog === 'activity'} lead={lead} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <ConvertLeadDialog open={dialog === 'convert'} lead={lead} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddEquipmentDialog open={dialog === 'equipment'} lead={lead} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
    </>
  );
};

function InfoCard({ title, icon, children }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title={title} icon={icon} />
      <Stack direction="column" spacing={1.25}>{children}</Stack>
    </Paper>
  );
}

function SectionTitle({ title, icon }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
      <IconifyIcon icon={icon} sx={{ color: 'text.secondary', fontSize: 22 }} />
      <Typography variant="h6">{title}</Typography>
    </Stack>
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

function DealsCard({ deals }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Related Deals" icon="material-symbols:handshake-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        {deals.length ? deals.map((deal) => (
          <RecordRow key={deal.id} title={deal.name} href={paths.dealDetails(deal.id)} subtitle={`${formatEnum(deal.stage)} · ${formatCurrency(deal.amount)} · Close ${formatDate(deal.expected_close_date)}`} chip={`${deal.probability || 0}%`} />
        )) : <EmptyState label="No deals yet" />}
      </Stack>
    </Paper>
  );
}

function EquipmentCard({ equipmentInterests }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Equipment Interests" icon="material-symbols:agriculture-outline-rounded" />
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

function TimelineCard({ items, supabase, onSaved }) {
  const handleComplete = async (activityId) => {
    const { error } = await supabase.from('activities').update({ completed_at: new Date().toISOString() }).eq('id', activityId);
    if (!error) onSaved();
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Activities & Notes" icon="material-symbols:history-rounded" />
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

function RecordRow({ title, subtitle, chip, href }) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {href ? <Link href={href} underline="hover" color="text.primary">{title}</Link> : title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>{subtitle}</Typography>
        </Box>
        {chip && <Chip label={chip} size="small" variant="soft" color="primary" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />}
      </Stack>
    </Box>
  );
}

function UpdateLeadDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ status: lead?.status || 'new', priority: lead?.priority || 3, nextFollowUpAt: '', notes: lead?.notes || '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ status: lead?.status || 'new', priority: lead?.priority || 3, nextFollowUpAt: toDateTimeLocal(lead?.next_follow_up_at), notes: lead?.notes || '' });
  }, [lead, open]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('leads').update({ status: form.status, priority: Number(form.priority) || 3, next_follow_up_at: form.nextFollowUpAt || null, notes: cleanText(form.notes) }).eq('id', lead.id);
    setIsSaving(false);
    if (!error) {
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>
            {leadStatuses.map((status) => <MenuItem key={status} value={status}>{formatEnum(status)}</MenuItem>)}
          </TextField>
          <TextField label="Priority" type="number" value={form.priority} onChange={handleField(setForm, 'priority')} fullWidth />
          <TextField label="Next Follow-up" type="datetime-local" value={form.nextFollowUpAt} onChange={handleField(setForm, 'nextFollowUpAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
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

function AddNoteDialog({ open, lead, onClose, onSaved, supabase }) {
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!body.trim()) return;
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('notes').insert({ owner_id: userResult.user.id, lead_id: lead.id, contact_id: lead.contact_id, company_id: lead.company_id, body: body.trim() });
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

function AddActivityDialog({ open, lead, onClose, onSaved, supabase }) {
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
      lead_id: lead.id,
      contact_id: lead.contact_id,
      company_id: lead.company_id,
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

function ConvertLeadDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState(() => leadToDealForm(lead));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(leadToDealForm(lead));
      setError(null);
    }
  }, [lead, open]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Deal name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setError('You need to be logged in to convert a lead.');
      setIsSaving(false);
      return;
    }

    const { error: dealError } = await supabase.from('deals').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      contact_id: lead.contact_id,
      company_id: lead.company_id,
      name: form.name.trim(),
      stage: form.stage,
      amount: form.amount || null,
      probability: Number(form.probability) || 0,
      expected_close_date: form.expectedCloseDate || null,
      notes: cleanText(form.notes),
    });

    if (dealError) {
      setError(dealError.message);
      setIsSaving(false);
      return;
    }

    const { error: leadError } = await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id);
    if (leadError) {
      setError(leadError.message);
      setIsSaving(false);
      return;
    }

    await supabase.from('notes').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      contact_id: lead.contact_id,
      company_id: lead.company_id,
      body: `Converted lead to deal: ${form.name.trim()}`,
    });

    setIsSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Convert Lead to Deal</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Deal Name" value={form.name} onChange={handleField(setForm, 'name')} fullWidth required />
          <TextField select label="Stage" value={form.stage} onChange={handleField(setForm, 'stage')} fullWidth>
            {dealStages.map((stage) => <MenuItem key={stage} value={stage}>{formatEnum(stage)}</MenuItem>)}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Amount" type="number" value={form.amount} onChange={handleField(setForm, 'amount')} fullWidth />
            <TextField label="Probability" type="number" value={form.probability} onChange={handleField(setForm, 'probability')} slotProps={{ htmlInput: { min: 0, max: 100 } }} fullWidth />
          </Stack>
          <TextField label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={handleField(setForm, 'expectedCloseDate')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will create a deal linked to this lead, contact, and company, then mark the lead as converted.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Convert Lead</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddEquipmentDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ category: 'tractor', make: '', model: '', condition: 'either', priceMin: '', priceMax: '', tradeIn: 'false', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('equipment_interests').insert({ owner_id: userResult.user.id, lead_id: lead.id, contact_id: lead.contact_id, category: form.category, make: cleanText(form.make), model: cleanText(form.model), condition: form.condition, price_min: form.priceMin || null, price_max: form.priceMax || null, trade_in: form.tradeIn === 'true', notes: cleanText(form.notes) });
    setIsSaving(false);
    if (!error) {
      setForm({ category: 'tractor', make: '', model: '', condition: 'either', priceMin: '', priceMax: '', tradeIn: 'false', notes: '' });
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
  return record.contacts ? contactName(record.contacts) : record.companies?.name || 'Lead';
}

function leadToDealForm(lead) {
  const contact = lead?.contacts ? contactName(lead.contacts) : '';
  const company = lead?.companies?.name || '';
  const baseName = [contact || company, lead?.source].filter(Boolean).join(' - ');

  return {
    name: baseName || 'New deal',
    stage: 'lead',
    amount: lead?.estimated_budget || '',
    probability: 25,
    expectedCloseDate: lead?.target_purchase_date || '',
    notes: lead?.notes || '',
  };
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

export default LeadDetails;
