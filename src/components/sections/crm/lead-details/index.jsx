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
import { useAuth } from 'providers/AuthProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import CrmFilesPanel from 'components/sections/crm/shared/CrmFilesPanel';
import AddTaskDialog from 'components/sections/crm/shared/AddTaskDialog';
import TasksCard from 'components/sections/crm/shared/TasksCard';
import { calculateCommission } from 'components/sections/crm/shared/commission';
import {
  activityDirections,
  activityTypes,
  dealStages,
  equipmentCategories,
  equipmentStatuses,
  formatLeadStatus,
  leadStatuses,
} from 'components/sections/crm/constants';
import DuplicateRecordDialog from 'components/sections/crm/shared/DuplicateRecordDialog';
import { findPotentialDuplicates } from 'components/sections/crm/shared/duplicateRecords';
import {
  cleanPhone,
  formatPhone,
  handlePhoneChange,
} from 'components/sections/crm/shared/phoneFormat';

const equipmentConditions = ['new', 'used', 'either'];
const equipmentAvailability = [
  'availability_unknown',
  'in_stock',
  'pending',
  'unavailable',
];

const callResults = [
  { value: 'no_answer', label: 'No Answer' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'bad_number', label: 'Bad Number' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
];

const LeadDetails = ({ leadId }) => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { profile } = useAuth();
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
  const [actionAnchorEl, setActionAnchorEl] = useState(null);

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
  const actionsOpen = Boolean(actionAnchorEl);

  const handleActionMenuOpen = (event) => {
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
  };

  const openDialog = (key) => {
    handleActionMenuClose();
    setDialog(key);
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader
            title={title}
            breadcrumb={[
              { label: 'Home', url: paths.crm },
              { label: 'Leads', url: paths.leads },
              { label: 'Lead Details', active: true },
            ]}
          />
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2.5}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', lg: 'flex-start' },
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
                    label={formatLeadStatus(lead.status)}
                    color="primary"
                    variant="soft"
                  />
                  <Chip
                    label={`Priority ${lead.priority}`}
                    color="neutral"
                    variant="soft"
                  />
                  {lead.estimated_budget && (
                    <Chip
                      label={formatCurrency(lead.estimated_budget)}
                      color="neutral"
                      variant="soft"
                    />
                  )}
                </Stack>
                <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                  {title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {leadHeaderSubtitle(lead, contact, company, title)}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'flex-start', lg: 'flex-end' },
                  minWidth: { lg: 360 },
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => openDialog('call')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:add-call-outline-rounded" />
                  }
                >
                  Log Call
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => openDialog('equipment')}
                  startIcon={
                    <IconifyIcon icon="material-symbols:agriculture-outline-rounded" />
                  }
                >
                  Add Interest
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => openDialog('deal')}
                  disabled={lead.status === 'converted'}
                  startIcon={
                    <IconifyIcon icon="material-symbols:currency-exchange-rounded" />
                  }
                >
                  Create Deal
                </Button>
                {!contact && (
                  <Button
                    variant="soft"
                    color="neutral"
                    onClick={() => openDialog('contact')}
                    startIcon={
                      <IconifyIcon icon="material-symbols:person-add-outline-rounded" />
                    }
                  >
                    Create Contact
                  </Button>
                )}
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={handleActionMenuOpen}
                  endIcon={
                    <IconifyIcon icon="material-symbols:keyboard-arrow-down-rounded" />
                  }
                >
                  More
                </Button>
                <Menu
                  anchorEl={actionAnchorEl}
                  open={actionsOpen}
                  onClose={handleActionMenuClose}
                  slotProps={{ paper: { sx: { minWidth: 220 } } }}
                >
                  {contact && (
                    <MenuItem
                      component={Link}
                      href={paths.contactDetails(contact.id)}
                      underline="none"
                      onClick={handleActionMenuClose}
                    >
                      <IconifyIcon
                        icon="material-symbols:person-outline-rounded"
                        sx={{ mr: 1.25, fontSize: 20 }}
                      />
                      Open Contact
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => openDialog('status')}>
                    <IconifyIcon
                      icon="material-symbols:tune-rounded"
                      sx={{ mr: 1.25, fontSize: 20 }}
                    />
                    Update Lead
                  </MenuItem>
                  <MenuItem onClick={() => openDialog('activity')}>
                    <IconifyIcon
                      icon="material-symbols:add-call-outline-rounded"
                      sx={{ mr: 1.25, fontSize: 20 }}
                    />
                    Add Activity
                  </MenuItem>
                  <MenuItem onClick={() => openDialog('task')}>
                    <IconifyIcon
                      icon="material-symbols:add-task-outline-rounded"
                      sx={{ mr: 1.25, fontSize: 20 }}
                    />
                    Add Task
                  </MenuItem>
                  <MenuItem onClick={() => openDialog('note')}>
                    <IconifyIcon
                      icon="material-symbols:note-add-outline-rounded"
                      sx={{ mr: 1.25, fontSize: 20 }}
                    />
                    Add Note
                  </MenuItem>
                </Menu>
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
              <InfoRow
                label="Lead Status"
                value={formatLeadStatus(lead.status)}
              />
              <InfoRow label="Source" value={lead.source} />
              <InfoRow label="Import Source" value={lead.import_source} />
              <InfoRow label="Branch" value={lead.branch} />
              <InfoRow label="Account Number" value={lead.account_number} />
              <InfoRow label="Priority" value={lead.priority} />
              <InfoRow label="Call Result" value={lead.call_result} />
              <InfoRow
                label="Call Attempts"
                value={lead.call_attempt_count}
              />
              <InfoRow
                label="Last Contacted"
                value={formatDateTime(lead.last_contacted_at)}
              />
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
                <>
                  <InfoRow label="Prospect" value={prospectName(lead)} />
                  <InfoRow label="Email" value={lead.email} />
                  <InfoRow
                    label="Phone"
                    value={formatPhone(
                      lead.mobile_phone || lead.phone || lead.home_phone,
                    )}
                  />
                  <InfoRow label="Home" value={formatPhone(lead.home_phone)} />
                  <InfoRow
                    label="Location"
                    value={[lead.city, lead.region, lead.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <Button
                    variant="soft"
                    color="neutral"
                    sx={{ mt: 1 }}
                    onClick={() => openDialog('contact')}
                  >
                    Convert to Contact
                  </Button>
                </>
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
                <>
                  <InfoRow label="Prospect Company" value={lead.company_name} />
                  <InfoRow
                    label="Address"
                    value={[
                      lead.address_line1,
                      lead.city,
                      lead.region,
                      lead.postal_code,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                </>
              )}
            </InfoCard>

            <SourceDetailsCard details={lead.source_details} />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="column" spacing={3}>
            <EquipmentCard equipmentInterests={equipmentInterests} />
          <DealsCard deals={deals} commissionRate={profile?.commission_rate} />
            <TasksCard
              tasks={tasks}
              supabase={supabase}
              onSaved={fetchDetails}
            />
            <CrmFilesPanel recordType="lead" recordId={lead.id} />
            <TimelineCard
              items={timelineItems}
              supabase={supabase}
              onSaved={fetchDetails}
            />
          </Stack>
        </Grid>
      </Grid>

      <UpdateLeadDialog
        open={dialog === 'status'}
        lead={lead}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        onDelete={() => setDialog('delete')}
        supabase={supabase}
      />
      <DeleteLeadDialog
        open={dialog === 'delete'}
        lead={lead}
        onClose={() => setDialog(null)}
        onDeleted={() => router.push(paths.leads)}
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
      <LogCallDialog
        open={dialog === 'call'}
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

function SourceDetailsCard({ details }) {
  const items = Object.entries(details || {})
    .map(([key, detail]) => ({
      key,
      label: detail?.label || formatEnum(key),
      value: detail?.value,
    }))
    .filter((item) => item.value);

  if (!items.length) return null;

  return (
    <InfoCard
      title="Imported Details"
      icon="material-symbols:database-outline-rounded"
    >
      {items.map((item) => (
        <InfoRow key={item.key} label={item.label} value={item.value} />
      ))}
    </InfoCard>
  );
}

function DealsCard({ deals, commissionRate }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle
        title="Deals From This Lead"
        icon="material-symbols:handshake-outline-rounded"
      />
      <Stack direction="column" spacing={1.5}>
        {deals.length ? (
          deals.map((deal) => (
            <RecordRow
              key={deal.id}
              title={deal.name}
              href={paths.dealDetails(deal.id)}
              subtitle={`${formatEnum(deal.stage)} · Sales ${formatCurrency(deal.amount)} · Margin ${formatCurrency(deal.margin)} · Commission ${formatCurrency(calculateCommission(deal.margin, commissionRate))} · Close ${formatDate(deal.expected_close_date)}`}
              chip={`${deal.probability || 0}%`}
            />
          ))
        ) : (
          <EmptyState label="No deals created from this lead yet" />
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

function TimelineCard({ items, supabase, onSaved }) {
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

function UpdateLeadDialog({ open, lead, onClose, onSaved, onDelete, supabase }) {
  const [form, setForm] = useState({
    accountNumber: lead?.account_number || '',
    status: lead?.status || 'not_contacted',
    priority: lead?.priority || 3,
    nextFollowUpAt: '',
    latitude: '',
    longitude: '',
    notes: lead?.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setForm({
        accountNumber: lead?.account_number || '',
        status: lead?.status || 'not_contacted',
        priority: lead?.priority || 3,
        nextFollowUpAt: toDateTimeLocal(lead?.next_follow_up_at),
        latitude: lead?.latitude ?? '',
        longitude: lead?.longitude ?? '',
        notes: lead?.notes || '',
      });
    }
  }, [lead, open]);

  const handleSave = async () => {
    if (!lead?.id) return;

    setIsSaving(true);
    setError(null);
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

    if (error) {
      setError(error.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Account Number"
            value={form.accountNumber}
            onChange={handleField(setForm, 'accountNumber')}
            fullWidth
          />
          <TextField
            select
            label="Lead Status"
            value={form.status}
            onChange={handleField(setForm, 'status')}
            fullWidth
          >
            {leadStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {formatLeadStatus(status)}
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
      <DialogActions
        sx={{ justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
      >
        <Button
          color="error"
          onClick={onDelete}
          startIcon={
            <IconifyIcon icon="material-symbols:delete-outline-rounded" />
          }
        >
          Delete Lead
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

function DeleteLeadDialog({ open, lead, onClose, onDeleted, supabase }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleDelete = async () => {
    if (!lead?.id) return;

    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', lead.id);

    setIsDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    onDeleted();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will delete the lead and lead-level history, including linked
            activities, notes, tasks, files, and equipment interests. Deals
            created from this lead will remain, but their lead link will be
            removed where the database allows it.
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
          Delete Lead
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

function LogCallDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    result: 'no_answer',
    notes: '',
    nextFollowUpAt: '',
    createTask: 'true',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm({
      result: 'no_answer',
      notes: '',
      nextFollowUpAt: '',
      createTask: 'true',
    });
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const { data: userResult, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setError('You need to be logged in to log a call.');
      setIsSaving(false);
      return;
    }

    const resultLabel = callResultLabel(form.result);
    const occurredAt = new Date().toISOString();
    const nextStatus = leadStatusFromCallResult(form.result, lead.status);

    const { error: activityError } = await supabase.from('activities').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      contact_id: lead.contact_id,
      company_id: lead.company_id,
      type: 'call',
      direction: 'outbound',
      subject: resultLabel,
      body: preserveText(form.notes),
      occurred_at: occurredAt,
      due_at: form.nextFollowUpAt
        ? new Date(form.nextFollowUpAt).toISOString()
        : null,
      completed_at: occurredAt,
    });

    if (activityError) {
      setError(activityError.message);
      setIsSaving(false);
      return;
    }

    const { error: leadError } = await supabase
      .from('leads')
      .update({
        status: nextStatus,
        call_result: resultLabel,
        call_attempt_count: Number(lead.call_attempt_count || 0) + 1,
        last_contacted_at: occurredAt,
        next_follow_up_at: form.nextFollowUpAt
          ? new Date(form.nextFollowUpAt).toISOString()
          : lead.next_follow_up_at,
      })
      .eq('id', lead.id);

    if (leadError) {
      setError(leadError.message);
      setIsSaving(false);
      return;
    }

    if (form.createTask === 'true' && form.nextFollowUpAt) {
      const dueAt = new Date(form.nextFollowUpAt).toISOString();
      const { error: taskError } = await supabase.from('tasks').insert({
        owner_id: userResult.user.id,
        lead_id: lead.id,
        contact_id: lead.contact_id,
        company_id: lead.company_id,
        title: `Follow up with ${entityName(lead)}`,
        body: preserveText(form.notes) || `Previous call result: ${resultLabel}`,
        due_at: dueAt,
      });

      if (taskError) {
        setError(taskError.message);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Log Lead Call</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {[
              prospectName(lead) || entityName(lead),
              formatPhone(lead.mobile_phone || lead.phone || lead.home_phone),
            ]
              .filter(Boolean)
              .join(' - ')}
          </Typography>
          <TextField
            select
            label="Call Result"
            value={form.result}
            onChange={handleField(setForm, 'result')}
            fullWidth
          >
            {callResults.map((result) => (
              <MenuItem key={result.value} value={result.value}>
                {result.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Next Follow-up"
            type="datetime-local"
            value={form.nextFollowUpAt}
            onChange={handleField(setForm, 'nextFollowUpAt')}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <FollowUpPresetButtons
            onSelect={(nextFollowUpAt) =>
              setForm((prev) => ({ ...prev, nextFollowUpAt }))
            }
          />
          <TextField
            select
            label="Follow-up Task"
            value={form.createTask}
            onChange={handleField(setForm, 'createTask')}
            fullWidth
          >
            <MenuItem value="true">Create task when follow-up is set</MenuItem>
            <MenuItem value="false">Only update lead follow-up date</MenuItem>
          </TextField>
          <TextField
            label="Call Notes"
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
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Call
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
    contactMode: 'create',
    existingContactId: '',
    companyMode: 'create',
    existingCompanyId: '',
    createSecondaryContact: 'false',
    companyName: '',
    firstName: '',
    lastName: '',
    title: '',
    accountNumber: '',
    email: '',
    phone: '',
    mobilePhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    region: '',
    postalCode: '',
    notes: '',
    qualifyingActivityType: 'call',
    qualifyingActivityDirection: 'outbound',
    qualifyingActivitySubject: 'Qualified lead contact',
    qualifyingActivityNotes: '',
    qualifyingActivityOccurredAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateConfirmation, setDuplicateConfirmation] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (open) {
      const secondary = secondaryContactFromLead(lead);
      setForm({
        contactMode: 'create',
        existingContactId: '',
        companyMode: lead?.company_id ? 'existing' : 'create',
        existingCompanyId: lead?.company_id || '',
        createSecondaryContact: secondary.firstName ? 'true' : 'false',
        companyName: lead?.company_name || '',
        firstName: lead?.first_name || '',
        lastName: lead?.last_name || '',
        title: '',
        accountNumber: lead?.account_number || '',
        email: lead?.email || '',
        phone: formatPhone(lead?.phone || lead?.home_phone),
        mobilePhone: formatPhone(lead?.mobile_phone),
        addressLine1: lead?.address_line1 || '',
        addressLine2: lead?.address_line2 || '',
        city: lead?.city || '',
        county: lead?.county || '',
        region: lead?.region || '',
        postalCode: lead?.postal_code || '',
        notes: lead?.notes || '',
        qualifyingActivityType: 'call',
        qualifyingActivityDirection: 'outbound',
        qualifyingActivitySubject: lead?.call_result
          ? `Qualified lead: ${lead.call_result}`
          : 'Qualified lead contact',
        qualifyingActivityNotes: '',
        qualifyingActivityOccurredAt: toDateTimeLocal(
          lead?.last_contacted_at || new Date().toISOString(),
        ),
      });
      setError(null);
      setDuplicateConfirmation(null);
    }
  }, [lead, open]);

  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      const [contactsResult, companiesResult] = await Promise.all([
        supabase
          .from('contacts')
          .select(
            'id, first_name, last_name, account_number, email, phone, mobile_phone, company_id, companies(id, name)',
          )
          .order('last_name', { ascending: true })
          .limit(300),
        supabase
          .from('companies')
          .select('id, name, account_number, city, region')
          .order('name', { ascending: true })
          .limit(300),
      ]);

      if (!contactsResult.error) setContacts(contactsResult.data || []);
      if (!companiesResult.error) setCompanies(companiesResult.data || []);
    };

    fetchOptions();
  }, [open, supabase]);

  const handleSave = async (options = {}) => {
    if (
      form.contactMode === 'create' &&
      (!form.firstName.trim() || !form.lastName.trim())
    ) {
      setError('First name and last name are required.');
      return;
    }

    if (form.contactMode === 'existing' && !form.existingContactId) {
      setError('Select an existing contact.');
      return;
    }

    if (form.companyMode === 'existing' && !form.existingCompanyId) {
      setError('Select an existing company or switch to Create Company.');
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

    if (form.contactMode === 'create' && !options.skipDuplicateCheck) {
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

    const existingContact = contacts.find(
      (contact) => contact.id === form.existingContactId,
    );
    let companyId =
      form.companyMode === 'none'
        ? null
        : form.companyMode === 'existing'
        ? form.existingCompanyId
        : lead.company_id || null;

    if (!companyId && form.contactMode === 'existing') {
      companyId = existingContact?.company_id || null;
    }

    if (form.companyMode === 'create' && cleanText(form.companyName)) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .upsert(
          {
            owner_id: userResult.user.id,
            name: cleanText(form.companyName),
            account_number: cleanText(form.accountNumber),
            email: cleanText(form.email),
            phone: cleanPhone(form.phone || form.mobilePhone),
            address_line1: cleanText(form.addressLine1),
            address_line2: cleanText(form.addressLine2),
            city: cleanText(form.city),
            county: cleanText(form.county),
            region: cleanText(form.region),
            postal_code: cleanText(form.postalCode),
            country: lead.country || 'US',
            notes: cleanText(lead.notes),
          },
          { onConflict: 'owner_id,name' },
        )
        .select('id')
        .single();

      if (companyError) {
        setError(companyError.message);
        setIsSaving(false);
        return;
      }

      companyId = company.id;
    }

    let contact = existingContact ? { id: existingContact.id } : null;

    if (form.contactMode === 'create') {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          owner_id: userResult.user.id,
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
          country: lead.country || 'US',
          latitude: lead.latitude,
          longitude: lead.longitude,
          notes: cleanText(form.notes),
        })
        .select('id')
        .single();

      if (contactError) {
        setError(contactError.message);
        setIsSaving(false);
        return;
      }

      contact = newContact;
    } else if (companyId && existingContact?.company_id !== companyId) {
      const { error: updateContactError } = await supabase
        .from('contacts')
        .update({ company_id: companyId })
        .eq('id', existingContact.id);

      if (updateContactError) {
        setError(updateContactError.message);
        setIsSaving(false);
        return;
      }
    }

    const { error: leadError } = await supabase
      .from('leads')
      .update({
        contact_id: contact.id,
        company_id: companyId,
        status: 'converted',
      })
      .eq('id', lead.id);

    if (leadError) {
      setError(leadError.message);
      setIsSaving(false);
      return;
    }

    const { error: activityRolloverError } = await supabase
      .from('activities')
      .update({
        contact_id: contact.id,
        company_id: companyId,
      })
      .eq('lead_id', lead.id);

    if (activityRolloverError) {
      setError(activityRolloverError.message);
      setIsSaving(false);
      return;
    }

    const secondary = secondaryContactFromLead(lead);
    if (
      form.createSecondaryContact === 'true' &&
      secondary.firstName &&
      companyId
    ) {
      const { error: secondaryError } = await supabase.from('contacts').insert({
        owner_id: userResult.user.id,
        company_id: companyId,
        first_name: cleanText(secondary.firstName),
        last_name: cleanText(secondary.lastName) || 'Unknown',
        title: cleanText(secondary.title),
        phone: cleanPhone(secondary.phone),
        email: cleanText(secondary.email),
        notes: `Created from secondary contact on lead ${entityName(lead)}.`,
      });

      if (secondaryError) {
        setError(secondaryError.message);
        setIsSaving(false);
        return;
      }
    }

    const qualifyingOccurredAt = form.qualifyingActivityOccurredAt
      ? new Date(form.qualifyingActivityOccurredAt).toISOString()
      : new Date().toISOString();
    const qualifyingSubject =
      cleanText(form.qualifyingActivitySubject) || 'Qualified lead contact';
    const qualifyingBody = preserveText(
      form.qualifyingActivityNotes ||
        `Lead qualified and converted to contact: ${entityName(lead)}.`,
    );

    const { error: qualifyingActivityError } = await supabase
      .from('activities')
      .insert({
        owner_id: userResult.user.id,
        contact_id: contact.id,
        company_id: companyId,
        lead_id: lead.id,
        type: form.qualifyingActivityType,
        direction: form.qualifyingActivityDirection,
        subject: qualifyingSubject,
        body: qualifyingBody,
        occurred_at: qualifyingOccurredAt,
        completed_at: qualifyingOccurredAt,
      });

    if (qualifyingActivityError) {
      setError(qualifyingActivityError.message);
      setIsSaving(false);
      return;
    }

    const noteBody = conversionNoteBody(lead, form);
    if (noteBody) {
      const { error: noteError } = await supabase.from('notes').insert({
        owner_id: userResult.user.id,
        contact_id: contact.id,
        company_id: companyId,
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
      company_id: companyId,
      lead_id: lead.id,
      type: 'note',
      direction: 'inbound',
      subject:
        form.contactMode === 'existing'
          ? 'Lead linked to existing contact'
          : 'Lead contact created',
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
            <TextField
              select
              label="Contact"
              value={form.contactMode}
              onChange={handleField(setForm, 'contactMode')}
              fullWidth
            >
              <MenuItem value="create">Create New Contact</MenuItem>
              <MenuItem value="existing">Use Existing Contact</MenuItem>
            </TextField>
            {form.contactMode === 'existing' && (
              <TextField
                select
                label="Existing Contact"
                value={form.existingContactId}
                onChange={handleField(setForm, 'existingContactId')}
                fullWidth
              >
                <MenuItem value="">Select contact</MenuItem>
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    {contactOptionLabel(contact)}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              select
              label="Company"
              value={form.companyMode}
              onChange={handleField(setForm, 'companyMode')}
              fullWidth
            >
              <MenuItem value="create">Create / Update From Lead</MenuItem>
              <MenuItem value="existing">Use Existing Company</MenuItem>
              <MenuItem value="none">No Company</MenuItem>
            </TextField>
            {form.companyMode === 'existing' && (
              <TextField
                select
                label="Existing Company"
                value={form.existingCompanyId}
                onChange={handleField(setForm, 'existingCompanyId')}
                fullWidth
              >
                <MenuItem value="">Select company</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {companyOptionLabel(company)}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Company"
              value={form.companyName}
              onChange={handleField(setForm, 'companyName')}
              fullWidth
              disabled={form.companyMode !== 'create'}
            />
            {form.contactMode === 'create' && (
              <>
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
              </>
            )}
            {form.companyMode === 'create' && (
              <>
              <TextField
                label="Address"
                value={form.addressLine1}
                onChange={handleField(setForm, 'addressLine1')}
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="State"
                value={form.region}
                onChange={handleField(setForm, 'region')}
                fullWidth
              />
              <TextField
                label="Zip"
                value={form.postalCode}
                onChange={handleField(setForm, 'postalCode')}
                fullWidth
              />
              </Stack>
              </>
            )}
            {secondaryContactFromLead(lead).firstName && (
              <TextField
                select
                label="Secondary Contact"
                value={form.createSecondaryContact}
                onChange={handleField(setForm, 'createSecondaryContact')}
                fullWidth
              >
                <MenuItem value="true">
                  Create {secondaryContactLabel(lead)}
                </MenuItem>
                <MenuItem value="false">Preserve in notes only</MenuItem>
              </TextField>
            )}
            <TextField
              label="Relationship Notes"
              value={form.notes}
              onChange={handleField(setForm, 'notes')}
              fullWidth
              multiline
              rows={4}
            />
            <Divider />
            <Typography variant="subtitle2">Qualifying Contact Activity</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Contact Method"
                value={form.qualifyingActivityType}
                onChange={handleField(setForm, 'qualifyingActivityType')}
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
                value={form.qualifyingActivityDirection}
                onChange={handleField(setForm, 'qualifyingActivityDirection')}
                fullWidth
              >
                {activityDirections.map((direction) => (
                  <MenuItem key={direction} value={direction}>
                    {formatEnum(direction)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Activity Subject"
                value={form.qualifyingActivitySubject}
                onChange={handleField(setForm, 'qualifyingActivitySubject')}
                fullWidth
              />
              <TextField
                label="Activity Date"
                type="datetime-local"
                value={form.qualifyingActivityOccurredAt}
                onChange={handleField(setForm, 'qualifyingActivityOccurredAt')}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
            <TextField
              label="Activity Notes"
              value={form.qualifyingActivityNotes}
              onChange={handleField(setForm, 'qualifyingActivityNotes')}
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
            Convert Lead
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
        margin: form.margin || null,
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
              label="Sales Amount"
              type="number"
              value={form.amount}
              onChange={handleField(setForm, 'amount')}
              fullWidth
            />
            <TextField
              label="Margin"
              type="number"
              value={form.margin}
              onChange={handleField(setForm, 'margin')}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
            then mark this record as a reliable customer.
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

function FollowUpPresetButtons({ onSelect }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {followUpPresets.map((preset) => (
        <Button
          key={preset.label}
          size="small"
          variant="soft"
          color="neutral"
          onClick={() => onSelect(toPresetDateTimeLocal(preset.days))}
        >
          {preset.label}
        </Button>
      ))}
    </Stack>
  );
}

const followUpPresets = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '30 Days', days: 30 },
];

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
  return (
    record.companies?.name ||
    (record.contacts ? contactName(record.contacts) : '') ||
    prospectName(record) ||
    record.company_name ||
    (record.account_number ? `Account ${record.account_number}` : '') ||
    record.source ||
    'Lead'
  );
}

function leadHeaderSubtitle(lead, contact, company, title) {
  return (
    [
      lead.account_number ? `Account ${lead.account_number}` : null,
      lead.import_source || lead.source,
      contact ? contactName(contact) : null,
      !contact ? prospectName(lead) : null,
      company?.name !== title ? company?.name : null,
      !company && lead.company_name !== title ? lead.company_name : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Lead'
  );
}

function leadToDealForm(lead) {
  const contact = lead?.contacts ? contactName(lead.contacts) : '';
  const company = lead?.companies?.name || lead?.company_name || '';
  const baseName = [contact || company, lead?.source]
    .filter(Boolean)
    .join(' - ');

  return {
    name: baseName || 'New deal',
    stage: 'needs_discovery',
    amount: lead?.estimated_budget || '',
    margin: '',
    probability: 25,
    expectedCloseDate: lead?.target_purchase_date || '',
    notes: lead?.notes || '',
  };
}

function contactOptionLabel(contact) {
  return [
    contactName(contact),
    contact.account_number,
    contact.companies?.name,
    contact.email,
    formatPhone(contact.mobile_phone || contact.phone),
  ]
    .filter(Boolean)
    .join(' - ');
}

function companyOptionLabel(company) {
  return [
    company.name,
    company.account_number,
    [company.city, company.region].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(' - ');
}

function conversionNoteBody(lead, form) {
  const sourceDetails = Object.values(lead?.source_details || {})
    .map((detail) => `${detail.label}: ${detail.value}`)
    .join('\n');
  const secondary = secondaryContactFromLead(lead);
  const secondaryLine = secondary.firstName
    ? `Secondary contact: ${[
        [secondary.firstName, secondary.lastName].filter(Boolean).join(' '),
        secondary.title,
        secondary.phone,
        secondary.email,
      ]
        .filter(Boolean)
        .join(' - ')}`
    : null;

  return [
    `Converted from lead: ${entityName(lead)}`,
    lead.import_source ? `Import source: ${lead.import_source}` : null,
    lead.source ? `Lead source: ${lead.source}` : null,
    lead.call_result ? `Last call result: ${lead.call_result}` : null,
    form.contactMode === 'existing'
      ? 'Linked to an existing contact.'
      : 'Created a new contact.',
    form.companyMode === 'existing'
      ? 'Linked to an existing company.'
      : form.companyMode === 'create' && cleanText(form.companyName)
        ? `Created or updated company: ${form.companyName}`
        : 'No company linked.',
    secondaryLine,
    cleanText(form.notes),
    sourceDetails ? `Imported source details:\n${sourceDetails}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function secondaryContactFromLead(lead) {
  const details = lead?.source_details || {};
  return {
    firstName: details.secondaryFirstName?.value || '',
    lastName: details.secondaryLastName?.value || '',
    title: details.secondaryTitle?.value || '',
    phone: details.secondaryPhone?.value || '',
    email: details.secondaryEmail?.value || '',
  };
}

function secondaryContactLabel(lead) {
  const secondary = secondaryContactFromLead(lead);
  const name = [secondary.firstName, secondary.lastName]
    .filter(Boolean)
    .join(' ');
  return name || 'secondary contact';
}

function prospectName(lead) {
  return [lead?.first_name, lead?.last_name].filter(Boolean).join(' ');
}

function callResultLabel(value) {
  return callResults.find((result) => result.value === value)?.label || value;
}

function leadStatusFromCallResult(result, currentStatus) {
  if (['bad_number', 'do_not_contact', 'not_interested'].includes(result)) {
    if (result === 'bad_number') return 'bad_number';
    if (result === 'do_not_contact') return 'do_not_contact';
    return 'not_a_fit';
  }
  if (result === 'interested') return 'relationship_started';
  if (result === 'contacted') return 'contacted';
  if (['left_voicemail', 'no_answer'].includes(result)) return 'attempted';
  return currentStatus || 'not_contacted';
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

function toPresetDateTimeLocal(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return toDateTimeLocal(date.toISOString());
}

export default LeadDetails;
