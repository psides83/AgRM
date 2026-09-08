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
import AddTaskDialog from 'components/sections/crm/shared/AddTaskDialog';
import TasksCard from 'components/sections/crm/shared/TasksCard';
import {
  activityDirections,
  activityTypes,
  dealStages,
  equipmentStatuses,
} from 'components/sections/crm/constants';
import DuplicateRecordDialog from 'components/sections/crm/shared/DuplicateRecordDialog';
import { findPotentialDuplicates } from 'components/sections/crm/shared/duplicateRecords';
import {
  cleanPhone,
  formatPhone,
  handlePhoneChange,
} from 'components/sections/crm/shared/phoneFormat';

const leadStatuses = [
  'new',
  'working',
  'qualified',
  'unqualified',
  'converted',
];
const equipmentCategories = [
  'tractor',
  'combine',
  'planter',
  'sprayer',
  'hay',
  'tillage',
  'utility_vehicle',
  'attachment',
  'other',
];
const equipmentConditions = ['new', 'used', 'either'];
const equipmentAvailability = [
  'availability_unknown',
  'in_stock',
  'pending',
  'unavailable',
];

const LeadDetails = ({ leadId }) => {
  const supabase = useMemo(() => createClient(), []);
  const [lead, setLead] = useState(null);
  const [equipmentInterests, setEquipmentInterests] = useState([]);
  const [equipmentLocations, setEquipmentLocations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);

  const fetchDetails = async () => {
    setError(null);

    const leadResult = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadResult.error) {
      setError(leadResult.error.message);
      setIsLoading(false);
      return;
    }

    const [
      contactResult,
      companyResult,
      equipmentResult,
      dealsResult,
      activitiesResult,
      notesResult,
      tasksResult,
      locationsResult,
    ] = await Promise.all([
      leadResult.data.contact_id
        ? supabase
            .from('contacts')
            .select('*')
            .eq('id', leadResult.data.contact_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      leadResult.data.company_id
        ? supabase
            .from('companies')
            .select('*')
            .eq('id', leadResult.data.company_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from('equipment_interests')
        .select('*, equipment_locations(id, name, city, region)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('deals')
        .select('*')
        .eq('lead_id', leadId)
        .order('updated_at', { ascending: false }),
      supabase
        .from('activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('occurred_at', { ascending: false }),
      supabase
        .from('notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('equipment_locations')
        .select('id, name, city, region')
        .order('name', { ascending: true }),
    ]);

    setLead({
      ...leadResult.data,
      contacts: contactResult.error ? null : contactResult.data,
      companies: companyResult.error ? null : companyResult.data,
    });
    setEquipmentInterests(
      equipmentResult.error ? [] : equipmentResult.data || [],
    );
    setDeals(dealsResult.error ? [] : dealsResult.data || []);
    setActivities(activitiesResult.error ? [] : activitiesResult.data || []);
    setNotes(notesResult.error ? [] : notesResult.data || []);
    setTasks(tasksResult.error ? [] : tasksResult.data || []);
    setEquipmentLocations(
      locationsResult.error ? [] : locationsResult.data || [],
    );

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();

    const channel = supabase
      .channel(`agrm-lead-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_interests',
          filter: `lead_id=eq.${leadId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
          filter: `lead_id=eq.${leadId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `lead_id=eq.${leadId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `lead_id=eq.${leadId}`,
        },
        () => fetchDetails(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, supabase]);

  const timelineItems = useMemo(() => {
    const noteItems = notes.map((note) => ({
      id: `note-${note.id}`,
      noteId: note.id,
      type: note.pinned ? 'pinned note' : 'note',
      title: note.pinned ? 'Pinned note' : 'Note',
      body: note.body,
      date: note.created_at,
    }));

    const activityItems = activities.map((activity) => ({
      id: `activity-${activity.id}`,
      activityId: activity.id,
      type: activity.type,
      direction: activity.direction,
      title: activity.subject,
      body: activity.body,
      date: activity.occurred_at,
      dueAt: activity.due_at,
      completedAt: activity.completed_at,
    }));

    return [...noteItems, ...activityItems].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
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
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', lg: 'center' },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', mb: 1 }}
                >
                  <Chip
                    label={formatEnum(lead.status)}
                    color="primary"
                    variant="soft"
                  />
                  <Chip
                    label={`Priority ${lead.priority}`}
                    color="neutral"
                    variant="soft"
                  />
                  <Chip
                    label={formatCurrency(lead.estimated_budget)}
                    color="neutral"
                    variant="soft"
                  />
                </Stack>
                <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                  {title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {[lead.source, company?.name].filter(Boolean).join(' · ') ||
                    'Lead'}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {contact ? (
                  <Button
                    component={Link}
                    href={paths.contactDetails(contact.id)}
                    underline="none"
                    variant="soft"
                    color="neutral"
                    startIcon={
                      <IconifyIcon icon="material-symbols:person-outline-rounded" />
                    }
                  >
                    Open Contact
                  </Button>
                ) : (
                  <Button
                    variant="soft"
                    color="neutral"
                    onClick={() => setDialog('contact')}
                    startIcon={
                      <IconifyIcon icon="material-symbols:person-add-outline-rounded" />
                    }
                  >
                    Convert to Contact
                  </Button>
                )}
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('status')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:tune-rounded" />
                  }
                >
                  Update Lead
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('note')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:note-add-outline-rounded" />
                  }
                >
                  Add Note
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('activity')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:add-call-outline-rounded" />
                  }
                >
                  Add Activity
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('task')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:add-task-outline-rounded" />
                  }
                >
                  Add Task
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('deal')}
                  disabled={lead.status === 'converted'}
                  startIcon={
                    <IconifyIcon icon="material-symbols:currency-exchange-rounded" />
                  }
                >
                  Create Deal
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setDialog('equipment')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:agriculture-outline-rounded" />
                  }
                >
                  Add Interest
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="column" spacing={3}>
            <InfoCard
              title="Lead Info"
              icon="material-symbols:filter-alt-outline-rounded"
            >
              <InfoRow label="Status" value={formatEnum(lead.status)} />
              <InfoRow label="Source" value={lead.source} />
              <InfoRow label="Account Number" value={lead.account_number} />
              <InfoRow label="Priority" value={lead.priority} />
              <InfoRow
                label="Budget"
                value={formatCurrency(lead.estimated_budget)}
              />
              <InfoRow
                label="Target purchase"
                value={formatDate(lead.target_purchase_date)}
              />
              <InfoRow
                label="Next follow-up"
                value={formatDateTime(lead.next_follow_up_at)}
              />
              {lead.notes && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 2,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {lead.notes}
                </Typography>
              )}
            </InfoCard>

            <InfoCard
              title="Contact & Company"
              icon="material-symbols:contacts-outline-rounded"
            >
              {contact ? (
                <>
                  <InfoRow label="Contact" value={contactName(contact)} />
                  <InfoRow label="Role" value={contact.title} />
                  <InfoRow
                    label="Account Number"
                    value={contact.account_number}
                  />
                  <InfoRow label="Email" value={contact.email} />
                  <InfoRow
                    label="Phone"
                    value={formatPhone(contact.mobile_phone || contact.phone)}
                  />
                  <Button
                    component={Link}
                    href={paths.contactDetails(contact.id)}
                    underline="none"
                    variant="soft"
                    color="neutral"
                    sx={{ mt: 1 }}
                  >
                    Open Contact
                  </Button>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No contact linked.
                </Typography>
              )}
              <Divider />
              {company ? (
                <>
                  <InfoRow label="Company" value={company.name} />
                  <InfoRow label="Type" value={company.company_type} />
                  <InfoRow label="Phone" value={formatPhone(company.phone)} />
                  <InfoRow
                    label="Location"
                    value={[company.city, company.region]
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <Button
                    component={Link}
                    href={paths.companyDetails(company.id)}
                    underline="none"
                    variant="soft"
                    color="neutral"
                    sx={{ mt: 1 }}
                  >
                    Open Company
                  </Button>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No company linked.
                </Typography>
              )}
            </InfoCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="column" spacing={3}>
            <DealsCard deals={deals} />
            <EquipmentCard equipmentInterests={equipmentInterests} />
            <TasksCard
              tasks={tasks}
              supabase={supabase}
              onSaved={fetchDetails}
            />
            <CrmFilesPanel recordType="lead" recordId={lead.id} />
            <TimelineCard items={timelineItems} />
          </Stack>
        </Grid>
      </Grid>

      <UpdateLeadDialog
        open={dialog === 'status'}
        lead={lead}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddNoteDialog
        open={dialog === 'note'}
        lead={lead}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddActivityDialog
        open={dialog === 'activity'}
        lead={lead}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddTaskDialog
        open={dialog === 'task'}
        record={lead}
        recordType="lead"
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <ConvertLeadToContactDialog
        open={dialog === 'contact'}
        lead={lead}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <ConvertLeadDialog
        open={dialog === 'deal'}
        lead={lead}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddEquipmentDialog
        open={dialog === 'equipment'}
        lead={lead}
        locations={equipmentLocations}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
    </>
  );
};

function InfoCard({ title, icon, children }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title={title} icon={icon} />
      <Stack direction="column" spacing={1.25}>
        {children}
      </Stack>
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
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, textAlign: 'right', overflowWrap: 'anywhere' }}
      >
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function DealsCard({ deals }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle
        title="Related Deals"
        icon="material-symbols:handshake-outline-rounded"
      />
      <Stack direction="column" spacing={1.5}>
        {deals.length ? (
          deals.map((deal) => (
            <RecordRow
              key={deal.id}
              title={deal.name}
              href={paths.dealDetails(deal.id)}
              subtitle={`${formatEnum(deal.stage)} · ${formatCurrency(deal.amount)} · Close ${formatDate(deal.expected_close_date)}`}
              chip={`${deal.probability || 0}%`}
            />
          ))
        ) : (
          <EmptyState label="No deals yet" />
        )}
      </Stack>
    </Paper>
  );
}

function EquipmentCard({ equipmentInterests }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle
        title="Equipment Interests"
        icon="material-symbols:agriculture-outline-rounded"
      />
      <Stack direction="column" spacing={1.5}>
        {equipmentInterests.length ? (
          equipmentInterests.map((interest) => {
            const equipmentName = [
              interest.model_year,
              interest.make,
              interest.model,
            ]
              .filter(Boolean)
              .join(' ');
            const budget =
              [
                formatCurrency(interest.price_min),
                formatCurrency(interest.price_max),
              ]
                .filter((value) => value !== '-')
                .join(' - ') || '-';
            return (
              <RecordRow
                key={interest.id}
                title={equipmentName || formatEnum(interest.category)}
                subtitle={[
                  formatEnum(interest.category),
                  formatEnum(interest.condition),
                  locationLabel(interest.equipment_locations),
                  `Budget ${budget}`,
                ]
                  .filter((value) => value && value !== 'No Location')
                  .join(' · ')}
                chip={interest.trade_in ? 'Trade-in' : null}
              />
            );
          })
        ) : (
          <EmptyState label="No equipment interests yet" />
        )}
      </Stack>
    </Paper>
  );
}

function TimelineCard({ items }) {
  const [editingItem, setEditingItem] = useState(null);

  return (
    <>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <SectionTitle
          title="Activities & Notes"
          icon="material-symbols:history-rounded"
        />
        <Stack direction="column" divider={<Divider flexItem />} spacing={2}>
          {items.length ? (
            items.map((item) => (
              <Box key={item.id}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ justifyContent: 'space-between', mb: 0.5 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    <Typography variant="subtitle2">{item.title}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignSelf: { xs: 'flex-start', sm: 'center' },
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={formatEnum(item.type)}
                      size="small"
                      variant="soft"
                    />
                    <Button
                      size="small"
                      variant="soft"
                      color="neutral"
                      onClick={() => setEditingItem(item)}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Stack>
                {item.body && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 0.5,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.body}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {formatDateTime(item.date)}
                  {item.dueAt ? ` · Due ${formatDateTime(item.dueAt)}` : ''}
                </Typography>
              </Box>
            ))
          ) : (
            <EmptyState label="No activities or notes yet" />
          )}
        </Stack>
      </Paper>
      <EditNoteDialog
        open={Boolean(editingItem?.noteId)}
        note={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={() => {
          setEditingItem(null);
          onSaved();
        }}
        supabase={supabase}
      />
      <EditActivityDialog
        open={Boolean(editingItem?.activityId)}
        activity={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={() => {
          setEditingItem(null);
          onSaved();
        }}
        supabase={supabase}
      />
    </>
  );
}

function EditNoteDialog({ open, note, onClose, onSaved, supabase }) {
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) setBody(note?.body || '');
  }, [note, open]);

  const handleSave = async () => {
    if (!note?.noteId || !body.trim()) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('notes')
      .update({ body })
      .eq('id', note.noteId);
    setIsSaving(false);

    if (!error) onSaved();
  };

  const handleDelete = async () => {
    if (!note?.noteId || !window.confirm('Delete this note?')) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', note.noteId);
    setIsDeleting(false);

    if (!error) onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Note</DialogTitle>
      <DialogContent>
        <TextField
          label="Note"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          fullWidth
          multiline
          rows={5}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          color="error"
          variant="soft"
          onClick={handleDelete}
          loading={isDeleting}
        >
          Delete Note
        </Button>
        <Stack direction="row" spacing={1}>
          <Button color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} loading={isSaving}>
            Save Note
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function EditActivityDialog({ open, activity, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    body: '',
    occurredAt: '',
    dueAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open)
      setForm({
        type: activity?.type || 'call',
        direction: activity?.direction || 'outbound',
        subject: activity?.title || '',
        body: activity?.body || '',
        occurredAt: toDateTimeLocal(activity?.date),
        dueAt: toDateTimeLocal(activity?.dueAt),
      });
  }, [activity, open]);

  const handleSave = async () => {
    if (!activity?.activityId) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('activities')
      .update({
        type: form.type,
        direction: form.direction,
        subject: cleanText(form.subject) || formatEnum(form.type),
        body: preserveText(form.body),
        occurred_at: form.occurredAt
          ? new Date(form.occurredAt).toISOString()
          : new Date().toISOString(),
        due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      })
      .eq('id', activity.activityId);
    setIsSaving(false);

    if (!error) onSaved();
  };

  const handleDelete = async () => {
    if (!activity?.activityId || !window.confirm('Delete this activity?'))
      return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activity.activityId);
    setIsDeleting(false);

    if (!error) onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Activity</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={handleField(setForm, 'type')}
              fullWidth
            >
              {activityTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {formatEnum(type)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Direction"
              value={form.direction}
              onChange={handleField(setForm, 'direction')}
              fullWidth
            >
              {activityDirections.map((direction) => (
                <MenuItem key={direction} value={direction}>
                  {formatEnum(direction)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Subject"
            value={form.subject}
            onChange={handleField(setForm, 'subject')}
            fullWidth
          />
          <TextField
            label="Details"
            value={form.body}
            onChange={handleField(setForm, 'body')}
            fullWidth
            multiline
            rows={3}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Occurred At"
              type="datetime-local"
              value={form.occurredAt}
              onChange={handleField(setForm, 'occurredAt')}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Due At"
              type="datetime-local"
              value={form.dueAt}
              onChange={handleField(setForm, 'dueAt')}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          color="error"
          variant="soft"
          onClick={handleDelete}
          loading={isDeleting}
        >
          Delete Activity
        </Button>
        <Stack direction="row" spacing={1}>
          <Button color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} loading={isSaving}>
            Save Activity
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function RecordRow({ title, subtitle, chip, href }) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {href ? (
              <Link href={href} underline="hover" color="text.primary">
                {title}
              </Link>
            ) : (
              title
            )}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}
          >
            {subtitle}
          </Typography>
        </Box>
        {chip && (
          <Chip
            label={chip}
            size="small"
            variant="soft"
            color="primary"
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          />
        )}
      </Stack>
    </Box>
  );
}

function UpdateLeadDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    accountNumber: lead?.account_number || '',
    status: lead?.status || 'new',
    priority: lead?.priority || 3,
    nextFollowUpAt: '',
    latitude: '',
    longitude: '',
    notes: lead?.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open)
      setForm({
        accountNumber: lead?.account_number || '',
        status: lead?.status || 'new',
        priority: lead?.priority || 3,
        nextFollowUpAt: toDateTimeLocal(lead?.next_follow_up_at),
        latitude: lead?.latitude ?? '',
        longitude: lead?.longitude ?? '',
        notes: lead?.notes || '',
      });
  }, [lead, open]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('leads')
      .update({
        account_number: cleanText(form.accountNumber),
        status: form.status,
        priority: Number(form.priority) || 3,
        next_follow_up_at: form.nextFollowUpAt || null,
        latitude: cleanNumber(form.latitude),
        longitude: cleanNumber(form.longitude),
        notes: cleanText(form.notes),
      })
      .eq('id', lead.id);
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
          <TextField
            label="Account Number"
            value={form.accountNumber}
            onChange={handleField(setForm, 'accountNumber')}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={handleField(setForm, 'status')}
            fullWidth
          >
            {leadStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {formatEnum(status)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Priority"
            type="number"
            value={form.priority}
            onChange={handleField(setForm, 'priority')}
            fullWidth
          />
          <TextField
            label="Next Follow-up"
            type="datetime-local"
            value={form.nextFollowUpAt}
            onChange={handleField(setForm, 'nextFollowUpAt')}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              value={form.latitude}
              onChange={handleField(setForm, 'latitude')}
              fullWidth
            />
            <TextField
              label="Longitude"
              type="number"
              value={form.longitude}
              onChange={handleField(setForm, 'longitude')}
              fullWidth
            />
          </Stack>
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleField(setForm, 'notes')}
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Changes
        </Button>
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
    const { error } = await supabase.from('notes').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      contact_id: lead.contact_id,
      company_id: lead.company_id,
      body,
    });
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
        <TextField
          label="Note"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          fullWidth
          multiline
          rows={5}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Note
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddActivityDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    body: '',
    occurredAt: toDateTimeLocal(new Date().toISOString()),
    dueAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open)
      setForm({
        type: 'call',
        direction: 'outbound',
        subject: '',
        body: '',
        occurredAt: toDateTimeLocal(new Date().toISOString()),
        dueAt: '',
      });
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
      body: preserveText(form.body),
      occurred_at: form.occurredAt
        ? new Date(form.occurredAt).toISOString()
        : new Date().toISOString(),
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
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={handleField(setForm, 'type')}
              fullWidth
            >
              {activityTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {formatEnum(type)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Direction"
              value={form.direction}
              onChange={handleField(setForm, 'direction')}
              fullWidth
            >
              {activityDirections.map((direction) => (
                <MenuItem key={direction} value={direction}>
                  {formatEnum(direction)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Subject"
            value={form.subject}
            onChange={handleField(setForm, 'subject')}
            fullWidth
          />
          <TextField
            label="Details"
            value={form.body}
            onChange={handleField(setForm, 'body')}
            fullWidth
            multiline
            rows={3}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Occurred At"
              type="datetime-local"
              value={form.occurredAt}
              onChange={handleField(setForm, 'occurredAt')}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Due At"
              type="datetime-local"
              value={form.dueAt}
              onChange={handleField(setForm, 'dueAt')}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Activity
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConvertLeadToContactDialog({
  open,
  lead,
  onClose,
  onSaved,
  supabase,
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    title: '',
    accountNumber: '',
    email: '',
    phone: '',
    mobilePhone: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateConfirmation, setDuplicateConfirmation] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        firstName: '',
        lastName: '',
        title: '',
        accountNumber: '',
        email: '',
        phone: '',
        mobilePhone: '',
        notes: '',
      });
      setError(null);
      setDuplicateConfirmation(null);
    }
  }, [open]);

  const handleSave = async (options = {}) => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data: userResult, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setError('You need to be logged in to create a contact.');
      setIsSaving(false);
      return;
    }

    if (!options.skipDuplicateCheck) {
      const matches = await findPotentialDuplicates(supabase, [
        {
          type: 'contact',
          record: {
            firstName: form.firstName,
            lastName: form.lastName,
            accountNumber: form.accountNumber,
            email: form.email,
            phone: form.phone,
            mobilePhone: form.mobilePhone,
          },
        },
      ]);

      if (matches.length) {
        setDuplicateConfirmation({ matches });
        setIsSaving(false);
        return;
      }
    }

    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        owner_id: userResult.user.id,
        company_id: lead.company_id,
        first_name: cleanText(form.firstName),
        last_name: cleanText(form.lastName),
        title: cleanText(form.title),
        account_number: cleanText(form.accountNumber),
        email: cleanText(form.email),
        phone: cleanPhone(form.phone),
        mobile_phone: cleanPhone(form.mobilePhone),
        notes: cleanText(form.notes),
      })
      .select('id')
      .single();

    if (contactError) {
      setError(contactError.message);
      setIsSaving(false);
      return;
    }

    const { error: leadError } = await supabase
      .from('leads')
      .update({ contact_id: contact.id })
      .eq('id', lead.id);

    if (leadError) {
      setError(leadError.message);
      setIsSaving(false);
      return;
    }

    const noteBody = cleanText(form.notes);
    if (noteBody) {
      const { error: noteError } = await supabase.from('notes').insert({
        owner_id: userResult.user.id,
        contact_id: contact.id,
        company_id: lead.company_id,
        lead_id: lead.id,
        body: noteBody,
      });

      if (noteError) {
        setError(noteError.message);
        setIsSaving(false);
        return;
      }
    }

    await supabase.from('activities').insert({
      owner_id: userResult.user.id,
      contact_id: contact.id,
      company_id: lead.company_id,
      lead_id: lead.id,
      type: 'note',
      direction: 'inbound',
      subject: 'Lead converted to contact',
      body: noteBody,
      occurred_at: new Date().toISOString(),
    });

    setIsSaving(false);
    setDuplicateConfirmation(null);
    onSaved();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Convert Lead to Contact</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={handleField(setForm, 'firstName')}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={handleField(setForm, 'lastName')}
                fullWidth
                required
              />
            </Stack>
            <TextField
              label="Title / Role"
              value={form.title}
              onChange={handleField(setForm, 'title')}
              fullWidth
            />
            <TextField
              label="Account Number"
              value={form.accountNumber}
              onChange={handleField(setForm, 'accountNumber')}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleField(setForm, 'email')}
                fullWidth
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={handlePhoneChange(setForm, 'phone')}
                fullWidth
              />
            </Stack>
            <TextField
              label="Mobile Phone"
              value={form.mobilePhone}
              onChange={handlePhoneChange(setForm, 'mobilePhone')}
              fullWidth
            />
            <TextField
              label="Initial Notes"
              value={form.notes}
              onChange={handleField(setForm, 'notes')}
              fullWidth
              multiline
              rows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave()}
            loading={isSaving}
          >
            Create Contact
          </Button>
        </DialogActions>
      </Dialog>
      <DuplicateRecordDialog
        open={Boolean(duplicateConfirmation)}
        matches={duplicateConfirmation?.matches || []}
        onCancel={() => setDuplicateConfirmation(null)}
        onConfirm={() => handleSave({ skipDuplicateCheck: true })}
      />
    </>
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

    const { data: userResult, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setError('You need to be logged in to convert a lead.');
      setIsSaving(false);
      return;
    }

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
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
      })
      .select('id')
      .single();

    if (dealError) {
      setError(dealError.message);
      setIsSaving(false);
      return;
    }

    const { error: leadError } = await supabase
      .from('leads')
      .update({ status: 'converted' })
      .eq('id', lead.id);
    if (leadError) {
      setError(leadError.message);
      setIsSaving(false);
      return;
    }

    await supabase.from('notes').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      deal_id: deal.id,
      contact_id: lead.contact_id,
      company_id: lead.company_id,
      body:
        cleanText(form.notes) || `Created deal from lead: ${form.name.trim()}`,
    });

    setIsSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Deal from Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Deal Name"
            value={form.name}
            onChange={handleField(setForm, 'name')}
            fullWidth
            required
          />
          <TextField
            select
            label="Stage"
            value={form.stage}
            onChange={handleField(setForm, 'stage')}
            fullWidth
          >
            {dealStages.map((stage) => (
              <MenuItem key={stage} value={stage}>
                {formatEnum(stage)}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={handleField(setForm, 'amount')}
              fullWidth
            />
            <TextField
              label="Probability"
              type="number"
              value={form.probability}
              onChange={handleField(setForm, 'probability')}
              slotProps={{ htmlInput: { min: 0, max: 100 } }}
              fullWidth
            />
          </Stack>
          <TextField
            label="Expected Close Date"
            type="date"
            value={form.expectedCloseDate}
            onChange={handleField(setForm, 'expectedCloseDate')}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleField(setForm, 'notes')}
            fullWidth
            multiline
            rows={3}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will create a deal linked to this lead, contact, and company,
            then mark the lead as converted.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Create Deal
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddEquipmentDialog({
  open,
  lead,
  locations,
  onClose,
  onSaved,
  supabase,
}) {
  const [form, setForm] = useState({
    category: 'tractor',
    make: '',
    model: '',
    stockNumber: '',
    serialNumber: '',
    condition: 'either',
    availability: 'availability_unknown',
    locationId: '',
    status: 'not_started',
    quotePrice: '',
    priceMin: '',
    priceMax: '',
    tradeIn: 'false',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('equipment_interests').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      contact_id: lead.contact_id,
      category: form.category,
      make: cleanText(form.make),
      model: cleanText(form.model),
      stock_number: cleanText(form.stockNumber),
      serial_number: cleanText(form.serialNumber),
      condition: form.condition,
      availability: normalizeAvailability(form.availability),
      equipment_location_id: form.locationId || null,
      status: form.status,
      quote_price: form.quotePrice || null,
      price_min: form.priceMin || null,
      price_max: form.priceMax || null,
      trade_in: form.tradeIn === 'true',
      notes: cleanText(form.notes),
    });
    setIsSaving(false);
    if (!error) {
      setForm({
        category: 'tractor',
        make: '',
        model: '',
        stockNumber: '',
        serialNumber: '',
        condition: 'either',
        availability: 'availability_unknown',
        locationId: '',
        status: 'not_started',
        quotePrice: '',
        priceMin: '',
        priceMax: '',
        tradeIn: 'false',
        notes: '',
      });
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Equipment Interest</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Category"
            value={form.category}
            onChange={handleField(setForm, 'category')}
            fullWidth
          >
            {equipmentCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {formatEnum(category)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Make"
            value={form.make}
            onChange={handleField(setForm, 'make')}
            fullWidth
          />
          <TextField
            label="Model"
            value={form.model}
            onChange={handleField(setForm, 'model')}
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Stock Number"
              value={form.stockNumber}
              onChange={handleStockField(setForm)}
              inputProps={{ maxLength: 6 }}
              fullWidth
            />
            <TextField
              label="Serial Number"
              value={form.serialNumber}
              onChange={handleUppercaseField(setForm, 'serialNumber')}
              fullWidth
            />
          </Stack>
          <TextField
            select
            label="Condition"
            value={form.condition}
            onChange={handleField(setForm, 'condition')}
            fullWidth
          >
            {equipmentConditions.map((condition) => (
              <MenuItem key={condition} value={condition}>
                {formatEnum(condition)}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Availability"
              value={normalizeAvailability(form.availability)}
              onChange={handleField(setForm, 'availability')}
              fullWidth
            >
              {equipmentAvailability.map((availability) => (
                <MenuItem key={availability} value={availability}>
                  {formatEnum(availability)}
                </MenuItem>
              ))}
            </TextField>
            <LocationSelect
              label="Location"
              value={form.locationId}
              onChange={handleField(setForm, 'locationId')}
              locations={locations}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={handleField(setForm, 'status')}
              fullWidth
            >
              {equipmentStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatEnum(status)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Quote Price"
              type="number"
              value={form.quotePrice}
              onChange={handleField(setForm, 'quotePrice')}
              fullWidth
            />
            <TextField
              label="Price Min"
              type="number"
              value={form.priceMin}
              onChange={handleField(setForm, 'priceMin')}
              fullWidth
            />
            <TextField
              label="Price Max"
              type="number"
              value={form.priceMax}
              onChange={handleField(setForm, 'priceMax')}
              fullWidth
            />
          </Stack>
          <TextField
            select
            label="Trade-in"
            value={form.tradeIn}
            onChange={handleField(setForm, 'tradeIn')}
            fullWidth
          >
            <MenuItem value="false">No</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
          </TextField>
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleField(setForm, 'notes')}
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Interest
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmptyState({ label }) {
  return (
    <Typography
      variant="body2"
      sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
    >
      {label}
    </Typography>
  );
}

function handleField(setForm, key) {
  return (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
}

function LocationSelect({ label = 'Location', value, onChange, locations }) {
  return (
    <TextField select label={label} value={value} onChange={onChange} fullWidth>
      <MenuItem value="">No Location</MenuItem>
      {locations.map((location) => (
        <MenuItem key={location.id} value={location.id}>
          {locationLabel(location)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function locationLabel(location) {
  if (!location) return 'No Location';
  return [
    location.name,
    location.city && location.region
      ? `${location.city}, ${location.region}`
      : null,
  ]
    .filter(Boolean)
    .join(' - ');
}

function normalizeAvailability(value) {
  if (['in_stock_auburn', 'in_stock_transfer'].includes(value))
    return 'in_stock';
  return value || 'availability_unknown';
}

function handleStockField(setForm) {
  return (event) =>
    setForm((prev) => ({
      ...prev,
      stockNumber: event.target.value.replace(/\D/g, '').slice(0, 6),
    }));
}

function handleUppercaseField(setForm, key) {
  return (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value.toUpperCase() }));
}

function contactName(contact) {
  return (
    [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') ||
    'Unnamed contact'
  );
}

function entityName(record) {
  return record.contacts
    ? contactName(record.contacts)
    : record.companies?.name || 'Lead';
}

function leadToDealForm(lead) {
  const contact = lead?.contacts ? contactName(lead.contacts) : '';
  const company = lead?.companies?.name || '';
  const baseName = [contact || company, lead?.source]
    .filter(Boolean)
    .join(' - ');

  return {
    name: baseName || 'New deal',
    stage: 'needs_discovery',
    amount: lead?.estimated_budget || '',
    probability: 25,
    expectedCloseDate: lead?.target_purchase_date || '',
    notes: lead?.notes || '',
  };
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function preserveText(value) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function cleanNumber(value) {
  if (value === '' || value === null || typeof value === 'undefined')
    return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatCurrency(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return '-';
  if (value === 'fit_confirmed') return 'Equipment Fit Confirmed';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default LeadDetails;
