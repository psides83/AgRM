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
const activityTypes = ['call', 'email', 'meeting', 'text', 'task', 'site_visit', 'demo', 'other'];
const activityDirections = ['outbound', 'inbound', 'internal'];
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

const ContactDetailsClient = ({ contactId }) => {
  const supabase = useMemo(() => createClient(), []);
  const [contact, setContact] = useState(null);
  const [leads, setLeads] = useState([]);
  const [equipmentInterests, setEquipmentInterests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);

  const fetchDetails = async () => {
    setError(null);

    const [contactResult, leadsResult, equipmentResult, activitiesResult, notesResult] =
      await Promise.all([
        supabase
          .from('contacts')
          .select(
            `
            *,
            companies (
              id,
              name,
              company_type,
              website,
              phone,
              email,
              address_line1,
              city,
              region,
              postal_code,
              notes
            )
          `
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
          .select('*')
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
      ]);

    const queryError = [
      contactResult.error,
      leadsResult.error,
      equipmentResult.error,
      activitiesResult.error,
      notesResult.error,
    ].find(Boolean);

    if (queryError) {
      setError(queryError.message);
    } else {
      setContact(contactResult.data);
      setLeads(leadsResult.data || []);
      setEquipmentInterests(equipmentResult.data || []);
      setActivities(activitiesResult.data || []);
      setNotes(notesResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();

    const channel = supabase
      .channel(`agrm-contact-${contactId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts', filter: `id=eq.${contactId}` },
        () => fetchDetails()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `contact_id=eq.${contactId}` },
        () => fetchDetails()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_interests',
          filter: `contact_id=eq.${contactId}`,
        },
        () => fetchDetails()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `contact_id=eq.${contactId}` },
        () => fetchDetails()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `contact_id=eq.${contactId}` },
        () => fetchDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, supabase]);

  const timelineItems = useMemo(() => {
    const noteItems = notes.map((note) => ({
      id: `note-${note.id}`,
      type: 'note',
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
  const contactName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
  const primaryPhone = contact.mobile_phone || contact.phone;

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
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}
            >
              <Stack direction="column" spacing={2} sx={{ minWidth: 0 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
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
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {[contact.title, company?.name].filter(Boolean).join(' at ') || 'Contact'}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
                      {contact.email && <Chip label={contact.email} size="small" variant="soft" color="neutral" />}
                      {primaryPhone && <Chip label={primaryPhone} size="small" variant="soft" color="neutral" />}
                      {[contact.city, contact.region].filter(Boolean).length > 0 && (
                        <Chip
                          label={[contact.city, contact.region].filter(Boolean).join(', ')}
                          size="small"
                          variant="soft"
                          color="neutral"
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
                {(contact.tags || []).length > 0 && (
                  <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    {contact.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="soft" color="primary" />
                    ))}
                  </Stack>
                )}
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('edit-contact')}
                  startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}
                >
                  Edit
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('activity')}
                  startIcon={<IconifyIcon icon="material-symbols:add-call-outline-rounded" />}
                >
                  Add Activity
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('lead')}
                  startIcon={<IconifyIcon icon="material-symbols:add-notes-outline-rounded" />}
                >
                  Add Lead
                </Button>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('note')}
                  startIcon={<IconifyIcon icon="material-symbols:note-add-outline-rounded" />}
                >
                  Add Note
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setDialog('equipment')}
                  startIcon={<IconifyIcon icon="material-symbols:agriculture-outline-rounded" />}
                >
                  Add Interest
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="column" spacing={3}>
            <InfoCard title="Contact Info" icon="material-symbols:contacts-outline-rounded">
              <InfoRow label="Role" value={contact.title} />
              <InfoRow label="Email" value={contact.email} />
              <InfoRow label="Phone" value={contact.phone} />
              <InfoRow label="Mobile" value={contact.mobile_phone} />
              <InfoRow
                label="Location"
                value={[contact.city, contact.region, contact.postal_code].filter(Boolean).join(', ')}
              />
              {contact.notes && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  {contact.notes}
                </Typography>
              )}
            </InfoCard>

            <InfoCard title="Linked Company" icon="material-symbols:business-center-outline-rounded">
              {company ? (
                <>
                  <InfoRow label="Name" value={company.name} />
                  <InfoRow label="Type" value={company.company_type} />
                  <InfoRow label="Email" value={company.email} />
                  <InfoRow label="Phone" value={company.phone} />
                  <InfoRow
                    label="Location"
                    value={[company.city, company.region, company.postal_code].filter(Boolean).join(', ')}
                  />
                  <Button component={Link} href={paths.companyDetails(company.id)} underline="none" variant="soft" color="neutral" sx={{ mt: 1 }}>
                    Open Company
                  </Button>
                  {company.website && (
                    <Link href={company.website} target="_blank" rel="noreferrer">
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
            <CrmFilesPanel recordType="contact" recordId={contact.id} />
            <TimelineCard items={timelineItems} supabase={supabase} onSaved={fetchDetails} />
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
      <AddEquipmentDialog
        open={dialog === 'equipment'}
        contact={contact}
        leads={leads}
        onClose={() => setDialog(null)}
        onSaved={fetchDetails}
        supabase={supabase}
      />
      <EditContactDialog
        open={dialog === 'edit-contact'}
        contact={contact}
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
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600, overflowWrap: 'anywhere' }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function LeadsCard({ leads }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Related Leads" icon="material-symbols:filter-alt-outline-rounded" />
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
      <SectionTitle title="Equipment Interests" icon="material-symbols:agriculture-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        {equipmentInterests.length ? (
          equipmentInterests.map((interest) => {
            const equipmentName = [interest.model_year, interest.make, interest.model].filter(Boolean).join(' ');
            const budget =
              [formatCurrency(interest.price_min), formatCurrency(interest.price_max)]
                .filter((value) => value !== '-')
                .join(' - ') || '-';

            return (
              <RecordRow
                key={interest.id}
                title={equipmentName || formatEnum(interest.category)}
                subtitle={`${formatEnum(interest.category)} · ${formatEnum(interest.condition)} · Budget ${budget}`}
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
  const handleComplete = async (activityId) => {
    const { error } = await supabase.from('activities').update({ completed_at: new Date().toISOString() }).eq('id', activityId);
    if (!error) onSaved();
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Activities & Notes" icon="material-symbols:history-rounded" />
      <Stack direction="column" divider={<Divider flexItem />} spacing={2}>
        {items.length ? (
          items.map((item) => (
            <Box key={item.id}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between', mb: 0.5 }}
              >
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
              {item.body && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, overflowWrap: 'anywhere' }}>
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
  );
}

function RecordRow({ title, subtitle, chip, href }) {
  const titleNode = href ? (
    <Link href={href} underline="hover" sx={{ color: 'text.primary', fontWeight: 700 }}>
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {titleNode}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
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
    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
      {label}
    </Typography>
  );
}

function EditContactDialog({ open, contact, onClose, onSaved, supabase }) {
  const [form, setForm] = useState(() => contactToForm(contact));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(contactToForm(contact));
      setError(null);
    }
  }, [contact, open]);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        first_name: cleanText(form.firstName),
        last_name: cleanText(form.lastName),
        title: cleanText(form.title),
        email: cleanText(form.email),
        phone: cleanText(form.phone),
        mobile_phone: cleanText(form.mobilePhone),
        address_line1: cleanText(form.addressLine1),
        address_line2: cleanText(form.addressLine2),
        city: cleanText(form.city),
        region: cleanText(form.region),
        postal_code: cleanText(form.postalCode),
        country: cleanText(form.country) || 'US',
        tags: parseTags(form.tags),
        notes: cleanText(form.notes),
      })
      .eq('id', contact.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Contact</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
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
          <TextField label="Title / Role" value={form.title} onChange={handleField(setForm, 'title')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Email" type="email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
          </Stack>
          <TextField label="Mobile Phone" value={form.mobilePhone} onChange={handleField(setForm, 'mobilePhone')} fullWidth />
          <TextField label="Address Line 1" value={form.addressLine1} onChange={handleField(setForm, 'addressLine1')} fullWidth />
          <TextField label="Address Line 2" value={form.addressLine2} onChange={handleField(setForm, 'addressLine2')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="City" value={form.city} onChange={handleField(setForm, 'city')} fullWidth />
            <TextField label="State / Region" value={form.region} onChange={handleField(setForm, 'region')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Postal Code" value={form.postalCode} onChange={handleField(setForm, 'postalCode')} fullWidth />
            <TextField label="Country" value={form.country} onChange={handleField(setForm, 'country')} fullWidth />
          </Stack>
          <TextField
            label="Tags"
            value={form.tags}
            onChange={handleField(setForm, 'tags')}
            helperText="Separate tags with commas."
            fullWidth
          />
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={4} />
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

function AddLeadDialog({ open, contact, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    source: '',
    status: 'new',
    priority: 3,
    estimatedBudget: '',
    nextFollowUpAt: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('leads').insert({
      owner_id: userResult.user.id,
      contact_id: contact.id,
      company_id: contact.company_id,
      source: cleanText(form.source),
      status: form.status,
      priority: Number(form.priority) || 3,
      estimated_budget: form.estimatedBudget || null,
      next_follow_up_at: form.nextFollowUpAt || null,
      notes: cleanText(form.notes),
    });

    setIsSaving(false);

    if (!error) {
      setForm({ source: '', status: 'new', priority: 3, estimatedBudget: '', nextFollowUpAt: '', notes: '' });
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Lead</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Source" value={form.source} onChange={handleField(setForm, 'source')} fullWidth />
          <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>
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
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Lead
        </Button>
      </DialogActions>
    </Dialog>
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
      body: body.trim(),
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
      setForm({ type: 'call', direction: 'outbound', subject: '', body: '', occurredAt: toDateTimeLocal(new Date().toISOString()), dueAt: '' });
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

function AddEquipmentDialog({ open, contact, leads, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    leadId: '',
    category: 'tractor',
    make: '',
    model: '',
    condition: 'either',
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
      condition: form.condition,
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
        condition: 'either',
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
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField select label="Related Lead" value={form.leadId} onChange={handleField(setForm, 'leadId')} fullWidth>
            <MenuItem value="">No specific lead</MenuItem>
            {leads.map((lead) => (
              <MenuItem key={lead.id} value={lead.id}>
                {lead.source || lead.status} - {formatDateTime(lead.created_at)}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Category" value={form.category} onChange={handleField(setForm, 'category')} fullWidth>
            {equipmentCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Make" value={form.make} onChange={handleField(setForm, 'make')} fullWidth />
          <TextField label="Model" value={form.model} onChange={handleField(setForm, 'model')} fullWidth />
          <TextField select label="Condition" value={form.condition} onChange={handleField(setForm, 'condition')} fullWidth>
            {equipmentConditions.map((condition) => (
              <MenuItem key={condition} value={condition}>
                {condition}
              </MenuItem>
            ))}
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

function contactToForm(contact) {
  return {
    firstName: contact?.first_name || '',
    lastName: contact?.last_name || '',
    title: contact?.title || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    mobilePhone: contact?.mobile_phone || '',
    addressLine1: contact?.address_line1 || '',
    addressLine2: contact?.address_line2 || '',
    city: contact?.city || '',
    region: contact?.region || '',
    postalCode: contact?.postal_code || '',
    country: contact?.country || 'US',
    tags: (contact?.tags || []).join(', '),
    notes: contact?.notes || '',
  };
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

function getInitials(contact) {
  return [contact?.first_name?.[0], contact?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'A';
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
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default ContactDetailsClient;
