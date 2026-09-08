'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Link,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
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

const ContactDetailsClient = ({ contactId }) => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [contact, setContact] = useState(null);
  const [leads, setLeads] = useState([]);
  const [equipmentInterests, setEquipmentInterests] = useState([]);
  const [equipmentLocations, setEquipmentLocations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [contactMenuAnchor, setContactMenuAnchor] = useState(null);

  const fetchDetails = async () => {
    setError(null);

    const [
      contactResult,
      leadsResult,
      equipmentResult,
      activitiesResult,
      notesResult,
      tasksResult,
      locationsResult,
    ] = await Promise.all([
      supabase
        .from('contacts')
        .select(
          `
            *,
            companies (
              id,
              name,
              company_type,
              account_number,
              website,
              phone,
              email,
              address_line1,
              address_line2,
              city,
              county,
              region,
              postal_code,
              country,
              latitude,
              longitude,
              notes
            )
          `,
        )
        .eq('id', contactId)
        .single(),
      supabase
        .from('leads')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      supabase
        .from('equipment_interests')
        .select('*, equipment_locations(id, name, city, region)')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      supabase
        .from('activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('occurred_at', { ascending: false }),
      supabase
        .from('notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      supabase
        .from('equipment_locations')
        .select('id, name, city, region')
        .order('name', { ascending: true }),
    ]);

    const queryError = [
      contactResult.error,
      leadsResult.error,
      equipmentResult.error,
      activitiesResult.error,
      notesResult.error,
      locationsResult.error,
    ].find(Boolean);

    if (queryError) {
      setError(queryError.message);
    } else {
      setContact(contactResult.data);
      setLeads(leadsResult.data || []);
      setEquipmentInterests(equipmentResult.data || []);
      setActivities(activitiesResult.data || []);
      setNotes(notesResult.data || []);
      setTasks(tasksResult.error ? [] : tasksResult.data || []);
      setEquipmentLocations(locationsResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();

    const channel = supabase
      .channel(`agrm-contact-${contactId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `id=eq.${contactId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `contact_id=eq.${contactId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_interests',
          filter: `contact_id=eq.${contactId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `contact_id=eq.${contactId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `contact_id=eq.${contactId}`,
        },
        () => fetchDetails(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `contact_id=eq.${contactId}`,
        },
        () => fetchDetails(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, supabase]);

  const timelineItems = useMemo(() => {
    const noteItems = notes.map((note) => ({
      id: `note-${note.id}`,
      noteId: note.id,
      type: 'note',
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

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Loading contact...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!contact) {
    return <Alert severity="warning">Contact not found.</Alert>;
  }

  const company = contact.companies;
  const contactName = [contact.first_name, contact.last_name]
    .filter(Boolean)
    .join(' ');
  const primaryPhone = formatPhone(contact.mobile_phone || contact.phone);
  const contactPhone = cleanPhone(contact.mobile_phone || contact.phone);
  const canCall = Boolean(contactPhone);
  const canEmail = Boolean(contact.email);

  const handleContactAction = (action) => {
    setContactMenuAnchor(null);

    if (action === 'call' && canCall) {
      window.location.href = `tel:${contactPhone}`;
    }

    if (action === 'email' && canEmail) {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader
            title={contactName}
            breadcrumb={[
              { label: 'Home', url: paths.crm },
              { label: 'Contacts', url: paths.contacts },
              { label: 'Contact detail', active: true },
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
              <Stack direction="column" spacing={2} sx={{ minWidth: 0 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { sm: 'center' } }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="h5">{getInitials(contact)}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                      {contactName}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary' }}
                    >
                      {[contact.title, company?.name]
                        .filter(Boolean)
                        .join(' at ') || 'Contact'}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ flexWrap: 'wrap', mt: 1 }}
                    >
                      {contact.account_number && (
                        <Chip
                          label={`Account ${contact.account_number}`}
                          size="small"
                          variant="soft"
                          color="primary"
                        />
                      )}
                      {contact.email && (
                        <Chip
                          label={contact.email}
                          size="small"
                          variant="soft"
                          color="neutral"
                        />
                      )}
                      {primaryPhone && (
                        <Chip
                          label={primaryPhone}
                          size="small"
                          variant="soft"
                          color="neutral"
                        />
                      )}
                      {[contact.city, contact.region].filter(Boolean).length >
                        0 && (
                        <Chip
                          label={[contact.city, contact.region]
                            .filter(Boolean)
                            .join(', ')}
                          size="small"
                          variant="soft"
                          color="neutral"
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
                {(contact.tags || []).length > 0 && (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    useFlexGap
                    sx={{ flexWrap: 'wrap' }}
                  >
                    {contact.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('edit-contact')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:edit-outline-rounded" />
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(event) => setContactMenuAnchor(event.currentTarget)}
                  startIcon={
                    <IconifyIcon icon="material-symbols:contact-phone-outline-rounded" />
                  }
                  disabled={!canCall && !canEmail}
                >
                  Contact
                </Button>
                <Menu
                  anchorEl={contactMenuAnchor}
                  open={Boolean(contactMenuAnchor)}
                  onClose={() => setContactMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                  <MenuItem
                    disabled={!canCall}
                    onClick={() => handleContactAction('call')}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <IconifyIcon icon="material-symbols:call-outline-rounded" />
                      <span>Call</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem
                    disabled={!canEmail}
                    onClick={() => handleContactAction('email')}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <IconifyIcon icon="material-symbols:mail-outline-rounded" />
                      <span>Email</span>
                    </Stack>
                  </MenuItem>
                </Menu>
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
                  onClick={() => setDialog('lead')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:add-notes-outline-rounded" />
                  }
                >
                  Add Lead
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
              title="Contact Info"
              icon="material-symbols:contacts-outline-rounded"
            >
              <InfoRow label="Role" value={contact.title} />
              <InfoRow label="Account Number" value={contact.account_number} />
              <InfoRow label="Email" value={contact.email} />
              <InfoRow label="Phone" value={formatPhone(contact.phone)} />
              <InfoRow
                label="Mobile"
                value={formatPhone(contact.mobile_phone)}
              />
              <InfoRow
                label="Location"
                value={[contact.city, contact.region, contact.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              />
              {contact.notes && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 2,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {contact.notes}
                </Typography>
              )}
            </InfoCard>

            <InfoCard
              title="Linked Company"
              icon="material-symbols:business-center-outline-rounded"
            >
              {company ? (
                <>
                  <InfoRow
                    label="Name"
                    value={
                      <Link
                        href={paths.companyDetails(company.id)}
                        underline="hover"
                        sx={{ color: 'text.primary', fontWeight: 700 }}
                      >
                        {company.name}
                      </Link>
                    }
                  />
                  <InfoRow label="Type" value={company.company_type} />
                  <InfoRow label="Email" value={company.email} />
                  <InfoRow label="Phone" value={formatPhone(company.phone)} />
                  <InfoRow
                    label="Location"
                    value={[company.city, company.region, company.postal_code]
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
                  {company.website && (
                    <Link
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {company.website}
                    </Link>
                  )}
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
            <LeadsCard leads={leads} />
            <EquipmentCard equipmentInterests={equipmentInterests} />
            <TasksCard
              tasks={tasks}
              supabase={supabase}
              onSaved={fetchDetails}
            />
            <CrmFilesPanel recordType="contact" recordId={contact.id} />
            <TimelineCard items={timelineItems} />
          </Stack>
        </Grid>
      </Grid>

      <AddLeadDialog
        open={dialog === 'lead'}
        contact={contact}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddNoteDialog
        open={dialog === 'note'}
        contact={contact}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddActivityDialog
        open={dialog === 'activity'}
        contact={contact}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddTaskDialog
        open={dialog === 'task'}
        record={contact}
        recordType="contact"
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <AddEquipmentDialog
        open={dialog === 'equipment'}
        contact={contact}
        leads={leads}
        locations={equipmentLocations}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <EditContactDialog
        open={dialog === 'edit-contact'}
        contact={contact}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        onDelete={() => setDialog('delete-contact')}
        supabase={supabase}
      />
      <DeleteContactDialog
        open={dialog === 'delete-contact'}
        contact={contact}
        supabase={supabase}
        onClose={() => setDialog(null)}
        onDeleted={() => router.push(paths.contacts)}
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
        sx={{ textAlign: 'right', fontWeight: 600, overflowWrap: 'anywhere' }}
      >
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function LeadsCard({ leads }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle
        title="Related Leads"
        icon="material-symbols:filter-alt-outline-rounded"
      />
      <Stack direction="column" spacing={1.5}>
        {leads.length ? (
          leads.map((lead) => (
            <RecordRow
              key={lead.id}
              href={paths.leadDetails(lead.id)}
              title={lead.source || 'Lead'}
              subtitle={`Budget ${formatCurrency(lead.estimated_budget)} · Follow-up ${formatDateTime(lead.next_follow_up_at)}`}
              chip={formatEnum(lead.status)}
            />
          ))
        ) : (
          <EmptyState label="No leads yet" />
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
    if (open) {
      setForm({
        type: activity?.type || 'call',
        direction: activity?.direction || 'outbound',
        subject: activity?.title || '',
        body: activity?.body || '',
        occurredAt: toDateTimeLocal(activity?.date),
        dueAt: toDateTimeLocal(activity?.dueAt),
      });
    }
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
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
  const titleNode = href ? (
    <Link
      href={href}
      underline="hover"
      sx={{ color: 'text.primary', fontWeight: 700 }}
    >
      {title}
    </Link>
  ) : (
    title
  );

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {titleNode}
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

function EditContactDialog({
  open,
  contact,
  onClose,
  onSaved,
  onDelete,
  supabase,
}) {
  const [form, setForm] = useState(() => contactToForm(contact));
  const [companies, setCompanies] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(contactToForm(contact));
      setError(null);

      supabase
        .from('companies')
        .select(
          'id, name, company_type, account_number, website, phone, email, address_line1, address_line2, city, county, region, postal_code, country, latitude, longitude, notes',
        )
        .order('name', { ascending: true })
        .limit(500)
        .then(({ data }) => setCompanies(data || []));
    }
  }, [contact, open, supabase]);

  const companyOptions = useMemo(
    () => mergeCompanyOptions(companies, contact?.companies),
    [companies, contact?.companies],
  );
  const selectedCompany =
    form.companyAssociationMode === 'existing'
      ? companyOptions.find((company) => company.id === form.existingCompanyId)
      : null;

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    let companyId = null;

    if (form.companyAssociationMode === 'existing') {
      if (!cleanText(form.existingCompanyId)) {
        setError('Select a company or choose No Company.');
        setIsSaving(false);
        return;
      }
      companyId = form.existingCompanyId;
    }

    if (form.companyAssociationMode === 'create') {
      if (!cleanText(form.newCompanyName)) {
        setError('Company name is required to create a company.');
        setIsSaving(false);
        return;
      }

      try {
        companyId = await saveCompanyFromContactEdit(supabase, form);
      } catch (error) {
        setError(error.message);
        setIsSaving(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        company_id: companyId,
        first_name: cleanText(form.firstName),
        last_name: cleanText(form.lastName),
        title: cleanText(form.title),
        account_number: cleanText(form.accountNumber),
        email: cleanText(form.email),
        phone: cleanPhone(form.phone),
        mobile_phone: cleanPhone(form.mobilePhone),
        address_line1: cleanText(form.addressLine1),
        address_line2: cleanText(form.addressLine2),
        city: cleanText(form.city),
        county: cleanText(form.county),
        region: cleanText(form.region),
        postal_code: cleanText(form.postalCode),
        country: cleanText(form.country) || 'US',
        latitude: cleanNumber(form.latitude),
        longitude: cleanNumber(form.longitude),
        tags: parseTags(form.tags),
        notes: cleanText(form.notes),
      })
      .eq('id', contact.id);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    await fillMissingContactCompanyAssociations(
      supabase,
      contact.id,
      companyId,
    );

    setIsSaving(false);
    onSaved();
    onClose();
  };

  const handleUseCompanyField = (key, fields) => (event) => {
    const checked = event.target.checked;
    setForm((prev) => ({
      ...prev,
      [key]: checked,
      ...(checked ? fieldsFromCompany(selectedCompany, fields) : {}),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Contact</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
            <TextField
              select
              label="Company"
              value={form.companyAssociationMode}
              onChange={handleField(setForm, 'companyAssociationMode')}
              fullWidth
            >
              <MenuItem value="existing">Use Existing Company</MenuItem>
              <MenuItem value="create">Create New Company</MenuItem>
              <MenuItem value="none">No Company</MenuItem>
            </TextField>
            {form.companyAssociationMode === 'existing' && (
              <TextField
                select
                label="Existing Company"
                value={form.existingCompanyId}
                onChange={handleField(setForm, 'existingCompanyId')}
                fullWidth
              >
                <MenuItem value="">Select a company</MenuItem>
                {companyOptions.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {companyLabel(company)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
          {form.companyAssociationMode === 'create' && (
            <>
              <TextField
                label="New Company Name"
                value={form.newCompanyName}
                onChange={handleField(setForm, 'newCompanyName')}
                fullWidth
                required
              />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ minWidth: 0 }}
              >
                <TextField
                  label="Company Type"
                  value={form.newCompanyType}
                  onChange={handleField(setForm, 'newCompanyType')}
                  fullWidth
                />
                <TextField
                  label="Company Account Number"
                  value={form.newCompanyAccountNumber}
                  onChange={handleField(setForm, 'newCompanyAccountNumber')}
                  fullWidth
                />
              </Stack>
            </>
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <FormControlLabel
            control={
              <Checkbox
                checked={form.sameAccountNumberAsCompany}
                onChange={handleUseCompanyField('sameAccountNumberAsCompany', [
                  'accountNumber',
                ])}
                disabled={!selectedCompany}
              />
            }
            label="Use company account number"
          />
          <TextField
            label="Account Number"
            value={form.accountNumber}
            onChange={handleField(setForm, 'accountNumber')}
            fullWidth
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.sameEmailAsCompany}
                  onChange={handleUseCompanyField('sameEmailAsCompany', [
                    'email',
                  ])}
                  disabled={!selectedCompany}
                />
              }
              label="Use company email"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.samePhoneAsCompany}
                  onChange={handleUseCompanyField('samePhoneAsCompany', [
                    'phone',
                  ])}
                  disabled={!selectedCompany}
                />
              }
              label="Use company phone"
            />
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <FormControlLabel
            control={
              <Checkbox
                checked={form.sameAddressAsCompany}
                onChange={handleUseCompanyField(
                  'sameAddressAsCompany',
                  addressFields,
                )}
                disabled={!selectedCompany}
              />
            }
            label="Use company address"
          />
          <TextField
            label="Address Line 1"
            value={form.addressLine1}
            onChange={handleField(setForm, 'addressLine1')}
            fullWidth
          />
          <TextField
            label="Address Line 2"
            value={form.addressLine2}
            onChange={handleField(setForm, 'addressLine2')}
            fullWidth
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
            <TextField
              label="City"
              value={form.city}
              onChange={handleField(setForm, 'city')}
              fullWidth
            />
            <TextField
              label="County"
              value={form.county}
              onChange={handleField(setForm, 'county')}
              fullWidth
            />
            <TextField
              label="State / Region"
              value={form.region}
              onChange={handleField(setForm, 'region')}
              fullWidth
            />
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.sameCoordinatesAsCompany}
                onChange={handleUseCompanyField(
                  'sameCoordinatesAsCompany',
                  coordinateFields,
                )}
                disabled={!selectedCompany}
              />
            }
            label="Use company coordinates"
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
            <TextField
              label="Postal Code"
              value={form.postalCode}
              onChange={handleField(setForm, 'postalCode')}
              fullWidth
            />
            <TextField
              label="Country"
              value={form.country}
              onChange={handleField(setForm, 'country')}
              fullWidth
            />
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
            label="Tags"
            value={form.tags}
            onChange={handleField(setForm, 'tags')}
            helperText="Separate tags with commas."
            fullWidth
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleField(setForm, 'notes')}
            fullWidth
            multiline
            rows={4}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          color="error"
          variant="soft"
          onClick={onDelete}
          startIcon={
            <IconifyIcon icon="material-symbols:delete-outline-rounded" />
          }
        >
          Delete Contact
        </Button>
        <Stack direction="row" spacing={1}>
          <Button color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} loading={isSaving}>
            Save Changes
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function DeleteContactDialog({ open, contact, supabase, onClose, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleDelete = async () => {
    if (!contact?.id) return;

    setIsDeleting(true);
    setError(null);

    const companyId = contact.company_id;
    let shouldDeleteCompany = false;

    if (companyId) {
      const { count, error: countError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .neq('id', contact.id);

      if (countError) {
        setError(countError.message);
        setIsDeleting(false);
        return;
      }

      shouldDeleteCompany = count === 0;
    }

    const { error: contactError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contact.id);

    if (contactError) {
      setError(contactError.message);
      setIsDeleting(false);
      return;
    }

    if (shouldDeleteCompany) {
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (companyError) {
        setError(companyError.message);
        setIsDeleting(false);
        return;
      }
    }

    setIsDeleting(false);
    onDeleted();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete Contact</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will delete the contact and their activity history. If their
            linked company has no other contacts, the company will be deleted
            too.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          loading={isDeleting}
          onClick={handleDelete}
        >
          Delete Contact
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddLeadDialog({ open, contact, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    source: '',
    status: 'new',
    accountNumber: '',
    priority: 3,
    estimatedBudget: '',
    nextFollowUpAt: '',
    latitude: '',
    longitude: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateConfirmation, setDuplicateConfirmation] = useState(null);

  const handleSave = async (options = {}) => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();

    if (!options.skipDuplicateCheck) {
      const matches = await findPotentialDuplicates(supabase, [
        {
          type: 'lead',
          record: {
            source: form.source,
            accountNumber: form.accountNumber,
            contactId: contact.id,
            companyId: contact.company_id,
          },
        },
      ]);

      if (matches.length) {
        setDuplicateConfirmation({ matches });
        setIsSaving(false);
        return;
      }
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        owner_id: userResult.user.id,
        contact_id: contact.id,
        company_id: contact.company_id,
        source: cleanText(form.source),
        account_number: cleanText(form.accountNumber),
        status: form.status,
        priority: Number(form.priority) || 3,
        estimated_budget: form.estimatedBudget || null,
        next_follow_up_at: form.nextFollowUpAt || null,
        latitude: cleanNumber(form.latitude),
        longitude: cleanNumber(form.longitude),
        notes: cleanText(form.notes),
      })
      .select('id')
      .single();

    if (error) {
      setIsSaving(false);
      return;
    }

    const noteBody = cleanText(form.notes);
    if (noteBody) {
      const { error: noteError } = await supabase.from('notes').insert({
        owner_id: userResult.user.id,
        contact_id: contact.id,
        company_id: contact.company_id,
        lead_id: lead.id,
        body: noteBody,
      });

      if (noteError) {
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setForm({
      source: '',
      status: 'new',
      accountNumber: '',
      priority: 3,
      estimatedBudget: '',
      nextFollowUpAt: '',
      latitude: '',
      longitude: '',
      notes: '',
    });
    setDuplicateConfirmation(null);
    onSaved();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Lead</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
            <TextField
              label="Source"
              value={form.source}
              onChange={handleField(setForm, 'source')}
              fullWidth
            />
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
                  {status}
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
              label="Estimated Budget"
              type="number"
              value={form.estimatedBudget}
              onChange={handleField(setForm, 'estimatedBudget')}
              fullWidth
            />
            <TextField
              label="Next Follow-up"
              type="datetime-local"
              value={form.nextFollowUpAt}
              onChange={handleField(setForm, 'nextFollowUpAt')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ minWidth: 0 }}
            >
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
          <Button
            variant="contained"
            onClick={() => handleSave()}
            loading={isSaving}
          >
            Save Lead
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

function AddNoteDialog({ open, contact, onClose, onSaved, supabase }) {
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!body.trim()) return;

    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('notes').insert({
      owner_id: userResult.user.id,
      contact_id: contact.id,
      company_id: contact.company_id,
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

function AddActivityDialog({ open, contact, onClose, onSaved, supabase }) {
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
    if (open) {
      setForm({
        type: 'call',
        direction: 'outbound',
        subject: '',
        body: '',
        occurredAt: toDateTimeLocal(new Date().toISOString()),
        dueAt: '',
      });
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('activities').insert({
      owner_id: userResult.user.id,
      contact_id: contact.id,
      company_id: contact.company_id,
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
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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

function AddEquipmentDialog({
  open,
  contact,
  leads,
  locations,
  onClose,
  onSaved,
  supabase,
}) {
  const [form, setForm] = useState({
    leadId: '',
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
      contact_id: contact.id,
      lead_id: form.leadId || null,
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
        leadId: '',
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
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          <TextField
            select
            label="Related Lead"
            value={form.leadId}
            onChange={handleField(setForm, 'leadId')}
            fullWidth
          >
            <MenuItem value="">No specific lead</MenuItem>
            {leads.map((lead) => (
              <MenuItem key={lead.id} value={lead.id}>
                {lead.source || lead.status} - {formatDateTime(lead.created_at)}
              </MenuItem>
            ))}
          </TextField>
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ minWidth: 0 }}
          >
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

function handleField(setForm, key) {
  return (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
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

const addressFields = [
  'addressLine1',
  'addressLine2',
  'city',
  'county',
  'region',
  'postalCode',
  'country',
];
const coordinateFields = ['latitude', 'longitude'];

function fieldsFromCompany(company, fields) {
  const values = {
    accountNumber: company?.account_number || '',
    email: company?.email || '',
    phone: formatPhone(company?.phone) || '',
    addressLine1: company?.address_line1 || '',
    addressLine2: company?.address_line2 || '',
    city: company?.city || '',
    county: company?.county || '',
    region: company?.region || '',
    postalCode: company?.postal_code || '',
    country: company?.country || 'US',
    latitude: company?.latitude ?? '',
    longitude: company?.longitude ?? '',
  };

  return fields.reduce(
    (selected, field) => ({ ...selected, [field]: values[field] }),
    {},
  );
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

function contactToForm(contact) {
  return {
    companyAssociationMode: contact?.company_id ? 'existing' : 'none',
    existingCompanyId: contact?.company_id || '',
    newCompanyName: '',
    newCompanyType: '',
    newCompanyAccountNumber: contact?.account_number || '',
    firstName: contact?.first_name || '',
    lastName: contact?.last_name || '',
    title: contact?.title || '',
    accountNumber: contact?.account_number || '',
    sameAccountNumberAsCompany: false,
    email: contact?.email || '',
    sameEmailAsCompany: false,
    phone: formatPhone(contact?.phone) || '',
    samePhoneAsCompany: false,
    mobilePhone: formatPhone(contact?.mobile_phone) || '',
    sameAddressAsCompany: false,
    addressLine1: contact?.address_line1 || '',
    addressLine2: contact?.address_line2 || '',
    city: contact?.city || '',
    county: contact?.county || '',
    region: contact?.region || '',
    postalCode: contact?.postal_code || '',
    country: contact?.country || 'US',
    sameCoordinatesAsCompany: false,
    latitude: contact?.latitude ?? '',
    longitude: contact?.longitude ?? '',
    tags: (contact?.tags || []).join(', '),
    notes: contact?.notes || '',
  };
}

async function saveCompanyFromContactEdit(supabase, form) {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    throw new Error('You need to be logged in to create a company.');
  }

  const payload = {
    owner_id: userResult.user.id,
    name: cleanText(form.newCompanyName),
    company_type: cleanText(form.newCompanyType),
    account_number: cleanText(form.newCompanyAccountNumber),
    phone: cleanPhone(form.phone),
    email: cleanText(form.email),
    address_line1: cleanText(form.addressLine1),
    address_line2: cleanText(form.addressLine2),
    city: cleanText(form.city),
    county: cleanText(form.county),
    region: cleanText(form.region),
    postal_code: cleanText(form.postalCode),
    country: cleanText(form.country) || 'US',
    latitude: cleanNumber(form.latitude),
    longitude: cleanNumber(form.longitude),
  };

  const { data, error } = await supabase
    .from('companies')
    .upsert(payload, { onConflict: 'owner_id,name' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function fillMissingContactCompanyAssociations(
  supabase,
  contactId,
  companyId,
) {
  if (!contactId || !companyId) return;

  await Promise.all([
    supabase
      .from('leads')
      .update({ company_id: companyId })
      .eq('contact_id', contactId)
      .is('company_id', null),
    supabase
      .from('activities')
      .update({ company_id: companyId })
      .eq('contact_id', contactId)
      .is('company_id', null),
    supabase
      .from('notes')
      .update({ company_id: companyId })
      .eq('contact_id', contactId)
      .is('company_id', null),
    supabase
      .from('tasks')
      .update({ company_id: companyId })
      .eq('contact_id', contactId)
      .is('company_id', null),
    supabase
      .from('deals')
      .update({ company_id: companyId })
      .eq('contact_id', contactId)
      .is('company_id', null),
  ]);
}

function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function companyLabel(company) {
  return [company.name, company.city, company.region]
    .filter(Boolean)
    .join(' - ');
}

function mergeCompanyOptions(companies, currentCompany) {
  if (!currentCompany?.id) return companies;
  if (companies.some((company) => company.id === currentCompany.id)) {
    return companies;
  }
  return [currentCompany, ...companies];
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

function getInitials(contact) {
  return (
    [contact?.first_name?.[0], contact?.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'A'
  );
}

function formatCurrency(value) {
  if (!value) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDateTime(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export default ContactDetailsClient;
