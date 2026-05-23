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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';

const leadStatuses = ['new', 'working', 'qualified', 'unqualified', 'converted'];
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
      type: activity.type,
      title: activity.subject,
      body: activity.body,
      date: activity.occurred_at,
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

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader
            title={`${contact.first_name} ${contact.last_name}`}
            breadcrumb={[
              { label: 'Home', url: paths.crm },
              { label: 'Contacts', url: paths.contacts },
              { label: 'Contact detail', active: true },
            ]}
            actionComponent={
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => setDialog('edit-contact')}
                  startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}
                >
                  Edit Contact
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
                  Add Equipment Interest
                </Button>
              </Stack>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <InfoCard title="Contact Info" icon="material-symbols:contacts-outline-rounded">
              <InfoRow label="Name" value={`${contact.first_name} ${contact.last_name}`} />
              <InfoRow label="Role" value={contact.title} />
              <InfoRow label="Email" value={contact.email} />
              <InfoRow label="Phone" value={contact.phone} />
              <InfoRow label="Mobile" value={contact.mobile_phone} />
              <InfoRow
                label="Location"
                value={[contact.city, contact.region, contact.postal_code].filter(Boolean).join(', ')}
              />
              {(contact.tags || []).length > 0 && (
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
                  {contact.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="soft" />
                  ))}
                </Stack>
              )}
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
          <Stack spacing={3}>
            <LeadsCard leads={leads} />
            <EquipmentCard equipmentInterests={equipmentInterests} />
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
      <Stack spacing={1.25}>{children}</Stack>
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
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function LeadsCard({ leads }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Related Leads" icon="material-symbols:filter-alt-outline-rounded" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Next Follow-up</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length ? (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Chip label={lead.status} size="small" variant="soft" color="primary" />
                  </TableCell>
                  <TableCell>{lead.source || '-'}</TableCell>
                  <TableCell>{formatCurrency(lead.estimated_budget)}</TableCell>
                  <TableCell>{formatDateTime(lead.next_follow_up_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRow colSpan={4} label="No leads yet" />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function EquipmentCard({ equipmentInterests }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Equipment Interests" icon="material-symbols:agriculture-outline-rounded" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Trade-in</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipmentInterests.length ? (
              equipmentInterests.map((interest) => (
                <TableRow key={interest.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {[interest.make, interest.model].filter(Boolean).join(' ') || interest.category}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {interest.category}
                    </Typography>
                  </TableCell>
                  <TableCell>{interest.condition}</TableCell>
                  <TableCell>
                    {[formatCurrency(interest.price_min), formatCurrency(interest.price_max)]
                      .filter((value) => value !== '-')
                      .join(' - ') || '-'}
                  </TableCell>
                  <TableCell>{interest.trade_in ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRow colSpan={4} label="No equipment interests yet" />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function TimelineCard({ items }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Activities & Notes" icon="material-symbols:history-rounded" />
      <Stack divider={<Divider flexItem />} spacing={2}>
        {items.length ? (
          items.map((item) => (
            <Box key={item.id}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2">{item.title}</Typography>
                <Chip label={item.type} size="small" variant="soft" />
              </Stack>
              {item.body && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  {item.body}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {formatDateTime(item.date)}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No activities or notes yet.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function EmptyRow({ colSpan, label }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          {label}
        </Typography>
      </TableCell>
    </TableRow>
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

export default ContactDetailsClient;
