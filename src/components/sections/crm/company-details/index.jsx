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
const equipmentCategories = ['tractor', 'combine', 'planter', 'sprayer', 'hay', 'tillage', 'utility_vehicle', 'attachment', 'other'];
const equipmentConditions = ['new', 'used', 'either'];

const CompanyDetails = ({ companyId }) => {
  const supabase = useMemo(() => createClient(), []);
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [equipmentInterests, setEquipmentInterests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);

  const fetchDetails = async () => {
    if (!companyId) {
      setError('Company ID is missing.');
      setIsLoading(false);
      return;
    }

    setError(null);

    const [companyResult, contactsResult, leadsResult, dealsResult, activitiesResult, notesResult] =
      await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).single(),
        supabase.from('contacts').select('*').eq('company_id', companyId).order('last_name', { ascending: true }),
        supabase.from('leads').select('*, contacts(id, first_name, last_name)').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('deals').select('*, contacts(id, first_name, last_name), leads(id, status, source)').eq('company_id', companyId).order('updated_at', { ascending: false }),
        supabase.from('activities').select('*').eq('company_id', companyId).order('occurred_at', { ascending: false }),
        supabase.from('notes').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
      ]);

    const queryError = [companyResult.error, contactsResult.error, leadsResult.error, dealsResult.error, activitiesResult.error, notesResult.error].find(Boolean);

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    const contactIds = (contactsResult.data || []).map((contact) => contact.id);
    const leadIds = (leadsResult.data || []).map((lead) => lead.id);
    const dealIds = (dealsResult.data || []).map((deal) => deal.id);
    const equipmentFilters = [
      contactIds.length ? `contact_id.in.(${contactIds.join(',')})` : null,
      leadIds.length ? `lead_id.in.(${leadIds.join(',')})` : null,
      dealIds.length ? `deal_id.in.(${dealIds.join(',')})` : null,
    ].filter(Boolean);

    let equipmentResult = { data: [], error: null };
    if (equipmentFilters.length) {
      equipmentResult = await supabase
        .from('equipment_interests')
        .select('*')
        .or(equipmentFilters.join(','))
        .order('created_at', { ascending: false });
    }

    if (equipmentResult.error) {
      setError(equipmentResult.error.message);
    } else {
      setCompany(companyResult.data);
      setContacts(contactsResult.data || []);
      setLeads(leadsResult.data || []);
      setDeals(dealsResult.data || []);
      setActivities(activitiesResult.data || []);
      setNotes(notesResult.data || []);
      setEquipmentInterests(equipmentResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetails();

    if (!companyId) return undefined;

    const channel = supabase
      .channel(`agrm-company-${companyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies', filter: `id=eq.${companyId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `company_id=eq.${companyId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `company_id=eq.${companyId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals', filter: `company_id=eq.${companyId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `company_id=eq.${companyId}` }, () => fetchDetails())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `company_id=eq.${companyId}` }, () => fetchDetails())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, supabase]);

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
          title: note.pinned ? 'Pinned note' : 'Note',
          body: note.body,
          date: note.created_at,
        })),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [activities, notes]
  );

  const openDeals = deals.filter((deal) => !['won', 'lost'].includes(deal.stage));
  const pipelineValue = openDeals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

  if (isLoading) return <Typography sx={{ p: 3 }}>Loading company...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!company) return <Alert severity="warning">Company not found.</Alert>;

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title={company.name}
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Contacts', url: paths.contacts },
            { label: 'Company detail', active: true },
          ]}
          actionComponent={
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button variant="soft" color="neutral" onClick={() => setDialog('edit')} startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}>
                Edit
              </Button>
              <Button variant="soft" color="neutral" onClick={() => setDialog('contact')} startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}>
                Add Contact
              </Button>
              <Button variant="soft" color="neutral" onClick={() => setDialog('lead')} startIcon={<IconifyIcon icon="material-symbols:add-notes-outline-rounded" />}>
                Add Lead
              </Button>
              <Button variant="soft" color="neutral" onClick={() => setDialog('note')} startIcon={<IconifyIcon icon="material-symbols:note-add-outline-rounded" />}>
                Add Note
              </Button>
              <Button variant="soft" color="neutral" onClick={() => setDialog('activity')} startIcon={<IconifyIcon icon="material-symbols:add-call-outline-rounded" />}>
                Add Activity
              </Button>
              <Button variant="contained" onClick={() => setDialog('equipment')} startIcon={<IconifyIcon icon="material-symbols:agriculture-outline-rounded" />}>
                Add Interest
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
                {company.company_type && <Chip label={formatEnum(company.company_type)} variant="soft" color="primary" />}
                <Chip label={`${contacts.length} contact${contacts.length === 1 ? '' : 's'}`} variant="soft" color="neutral" />
                <Chip label={`${openDeals.length} open deal${openDeals.length === 1 ? '' : 's'}`} variant="soft" color="neutral" />
                <Chip label={formatCurrency(pipelineValue)} variant="soft" color="neutral" />
              </Stack>
              <Typography variant="h3" sx={{ overflowWrap: 'anywhere' }}>{company.name}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {[company.city, company.region, company.postal_code].filter(Boolean).join(', ') || 'Company account'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {company.phone && <Chip label={company.phone} variant="soft" color="neutral" />}
              {company.email && <Chip label={company.email} variant="soft" color="neutral" />}
              {company.website && <Button href={company.website} target="_blank" rel="noreferrer" variant="soft" color="neutral" startIcon={<IconifyIcon icon="material-symbols:open-in-new-rounded" />}>Website</Button>}
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack direction="column" spacing={3}>
          <InfoCard title="Company Info" icon="material-symbols:business-center-outline-rounded">
            <InfoRow label="Type" value={formatEnum(company.company_type)} />
            <InfoRow label="Email" value={company.email} />
            <InfoRow label="Phone" value={company.phone} />
            <InfoRow label="Website" value={company.website} />
            <InfoRow label="Address" value={[company.address_line1, company.address_line2].filter(Boolean).join(', ')} />
            <InfoRow label="Location" value={[company.city, company.region, company.postal_code].filter(Boolean).join(', ')} />
            <InfoRow label="Country" value={company.country} />
            {company.notes && <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, overflowWrap: 'anywhere' }}>{company.notes}</Typography>}
          </InfoCard>

          <ContactsCard contacts={contacts} />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack direction="column" spacing={3}>
          <LeadsCard leads={leads} />
          <DealsCard deals={deals} />
          <EquipmentCard equipmentInterests={equipmentInterests} />
          <CrmFilesPanel recordType="company" recordId={company.id} />
          <TimelineCard items={timelineItems} supabase={supabase} onSaved={fetchDetails} />
        </Stack>
      </Grid>

      <AddContactDialog open={dialog === 'contact'} company={company} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <EditCompanyDialog open={dialog === 'edit'} company={company} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddLeadDialog open={dialog === 'lead'} company={company} contacts={contacts} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddNoteDialog open={dialog === 'note'} company={company} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddActivityDialog open={dialog === 'activity'} company={company} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
      <AddEquipmentDialog open={dialog === 'equipment'} contacts={contacts} leads={leads} deals={deals} onClose={() => setDialog(null)} onSaved={fetchDetails} supabase={supabase} />
    </Grid>
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
      <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Stack>
  );
}

function ContactsCard({ contacts }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Contacts" icon="material-symbols:contacts-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        {contacts.length ? contacts.map((contact) => (
          <RecordRow
            key={contact.id}
            href={paths.contactDetails(contact.id)}
            title={contactName(contact)}
            subtitle={[contact.title, contact.email, contact.mobile_phone || contact.phone].filter(Boolean).join(' · ')}
          />
        )) : <EmptyState label="No contacts yet" />}
      </Stack>
    </Paper>
  );
}

function LeadsCard({ leads }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Related Leads" icon="material-symbols:filter-alt-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        {leads.length ? leads.map((lead) => (
          <RecordRow
            key={lead.id}
            href={paths.leadDetails(lead.id)}
            title={lead.source || contactName(lead.contacts) || 'Lead'}
            subtitle={`Budget ${formatCurrency(lead.estimated_budget)} · Follow-up ${formatDateTime(lead.next_follow_up_at)}`}
            chip={formatEnum(lead.status)}
          />
        )) : <EmptyState label="No leads yet" />}
      </Stack>
    </Paper>
  );
}

function DealsCard({ deals }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Related Deals" icon="material-symbols:handshake-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        {deals.length ? deals.map((deal) => (
          <RecordRow
            key={deal.id}
            href={paths.dealDetails(deal.id)}
            title={deal.name}
            subtitle={`${contactName(deal.contacts)} · ${formatCurrency(deal.amount)} · Close ${formatDate(deal.expected_close_date)}`}
            chip={formatEnum(deal.stage)}
          />
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
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>{subtitle || '-'}</Typography>
        </Box>
        {chip && <Chip label={chip} size="small" variant="soft" color="primary" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />}
      </Stack>
    </Box>
  );
}

function EditCompanyDialog({ open, company, onClose, onSaved, supabase }) {
  const [form, setForm] = useState(() => companyToForm(company));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(companyToForm(company));
      setError(null);
    }
  }, [company, open]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('companies')
      .update({
        name: form.name.trim(),
        company_type: cleanText(form.companyType),
        website: cleanText(form.website),
        phone: cleanText(form.phone),
        email: cleanText(form.email),
        address_line1: cleanText(form.addressLine1),
        address_line2: cleanText(form.addressLine2),
        city: cleanText(form.city),
        region: cleanText(form.region),
        postal_code: cleanText(form.postalCode),
        country: cleanText(form.country) || 'US',
        notes: cleanText(form.notes),
      })
      .eq('id', company.id);

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
      <DialogTitle>Edit Company</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Company Name" value={form.name} onChange={handleField(setForm, 'name')} fullWidth required />
            <TextField label="Company Type" value={form.companyType} onChange={handleField(setForm, 'companyType')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Website" value={form.website} onChange={handleField(setForm, 'website')} fullWidth />
            <TextField label="Email" type="email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
          </Stack>
          <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Address Line 1" value={form.addressLine1} onChange={handleField(setForm, 'addressLine1')} fullWidth />
            <TextField label="Address Line 2" value={form.addressLine2} onChange={handleField(setForm, 'addressLine2')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="City" value={form.city} onChange={handleField(setForm, 'city')} fullWidth />
            <TextField label="State / Region" value={form.region} onChange={handleField(setForm, 'region')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Postal Code" value={form.postalCode} onChange={handleField(setForm, 'postalCode')} fullWidth />
            <TextField label="Country" value={form.country} onChange={handleField(setForm, 'country')} fullWidth />
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={4} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Company</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddContactDialog({ open, company, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '', email: '', phone: '', mobilePhone: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ firstName: '', lastName: '', title: '', email: '', phone: '', mobilePhone: '', notes: '' });
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const { data: userResult } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from('contacts').insert({
      owner_id: userResult.user.id,
      company_id: company.id,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      title: cleanText(form.title),
      email: cleanText(form.email),
      phone: cleanText(form.phone),
      mobile_phone: cleanText(form.mobilePhone),
      notes: cleanText(form.notes),
    });
    setIsSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="First Name" value={form.firstName} onChange={handleField(setForm, 'firstName')} fullWidth required />
            <TextField label="Last Name" value={form.lastName} onChange={handleField(setForm, 'lastName')} fullWidth required />
          </Stack>
          <TextField label="Title" value={form.title} onChange={handleField(setForm, 'title')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Email" type="email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
            <TextField label="Mobile Phone" value={form.mobilePhone} onChange={handleField(setForm, 'mobilePhone')} fullWidth />
          </Stack>
          <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Contact</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddLeadDialog({ open, company, contacts, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ contactId: '', source: '', status: 'new', priority: 3, estimatedBudget: '', targetPurchaseDate: '', nextFollowUpAt: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ contactId: contacts[0]?.id || '', source: '', status: 'new', priority: 3, estimatedBudget: '', targetPurchaseDate: '', nextFollowUpAt: '', notes: '' });
  }, [contacts, open]);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('leads').insert({
      owner_id: userResult.user.id,
      company_id: company.id,
      contact_id: form.contactId || null,
      source: cleanText(form.source),
      status: form.status,
      priority: Number(form.priority) || 3,
      estimated_budget: form.estimatedBudget || null,
      target_purchase_date: form.targetPurchaseDate || null,
      next_follow_up_at: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : null,
      notes: cleanText(form.notes),
    });
    setIsSaving(false);
    if (!error) {
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <TextField select label="Contact" value={form.contactId} onChange={handleField(setForm, 'contactId')} fullWidth>
            <MenuItem value="">No contact</MenuItem>
            {contacts.map((contact) => <MenuItem key={contact.id} value={contact.id}>{contactName(contact)}</MenuItem>)}
          </TextField>
          <TextField label="Source" value={form.source} onChange={handleField(setForm, 'source')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>
              {leadStatuses.map((status) => <MenuItem key={status} value={status}>{formatEnum(status)}</MenuItem>)}
            </TextField>
            <TextField label="Priority" type="number" value={form.priority} onChange={handleField(setForm, 'priority')} fullWidth />
          </Stack>
          <TextField label="Estimated Budget" type="number" value={form.estimatedBudget} onChange={handleField(setForm, 'estimatedBudget')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Target Purchase Date" type="date" value={form.targetPurchaseDate} onChange={handleField(setForm, 'targetPurchaseDate')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Next Follow-up" type="datetime-local" value={form.nextFollowUpAt} onChange={handleField(setForm, 'nextFollowUpAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Save Lead</Button>
      </DialogActions>
    </Dialog>
  );
}

function AddNoteDialog({ open, company, onClose, onSaved, supabase }) {
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!body.trim()) return;
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('notes').insert({ owner_id: userResult.user.id, company_id: company.id, body: body.trim() });
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

function AddActivityDialog({ open, company, onClose, onSaved, supabase }) {
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
      company_id: company.id,
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

function AddEquipmentDialog({ open, contacts, leads, deals, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({ relatedType: 'contact', relatedId: '', category: 'tractor', make: '', model: '', condition: 'either', priceMin: '', priceMax: '', tradeIn: 'false', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const relatedOptions = form.relatedType === 'lead' ? leads : form.relatedType === 'deal' ? deals : contacts;

  useEffect(() => {
    if (open) setForm((prev) => ({ ...prev, relatedId: contacts[0]?.id || '' }));
  }, [contacts, open]);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase.from('equipment_interests').insert({
      owner_id: userResult.user.id,
      contact_id: form.relatedType === 'contact' ? form.relatedId || null : null,
      lead_id: form.relatedType === 'lead' ? form.relatedId || null : null,
      deal_id: form.relatedType === 'deal' ? form.relatedId || null : null,
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
      onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Equipment Interest</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Link To" value={form.relatedType} onChange={(event) => setForm((prev) => ({ ...prev, relatedType: event.target.value, relatedId: '' }))} fullWidth>
              <MenuItem value="contact">Contact</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="deal">Deal</MenuItem>
            </TextField>
            <TextField select label="Related Record" value={form.relatedId} onChange={handleField(setForm, 'relatedId')} fullWidth>
              {relatedOptions.map((option) => <MenuItem key={option.id} value={option.id}>{relatedOptionLabel(option, form.relatedType)}</MenuItem>)}
            </TextField>
          </Stack>
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
        <Button variant="contained" onClick={handleSave} loading={isSaving} disabled={!form.relatedId}>Save Interest</Button>
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
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || '';
}

function relatedOptionLabel(option, type) {
  if (type === 'deal') return option.name;
  if (type === 'lead') return [option.source || 'Lead', formatEnum(option.status)].filter(Boolean).join(' · ');
  return contactName(option);
}

function companyToForm(company) {
  return {
    name: company?.name || '',
    companyType: company?.company_type || '',
    website: company?.website || '',
    phone: company?.phone || '',
    email: company?.email || '',
    addressLine1: company?.address_line1 || '',
    addressLine2: company?.address_line2 || '',
    city: company?.city || '',
    region: company?.region || '',
    postalCode: company?.postal_code || '',
    country: company?.country || 'US',
    notes: company?.notes || '',
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

export default CompanyDetails;
