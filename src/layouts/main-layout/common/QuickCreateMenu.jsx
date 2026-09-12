'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  activityDirections,
  activityTypes,
  dealStages,
  equipmentCategories,
  equipmentStatuses,
  formatLeadStatus,
  leadStatuses,
} from 'components/sections/crm/constants';

const equipmentConditions = ['new', 'used', 'either'];
const equipmentAvailability = [
  'availability_unknown',
  'in_stock',
  'pending',
  'unavailable',
];

const createItems = [
  { key: 'company', label: 'Company', description: 'Create a business account', icon: 'material-symbols:business-center-outline-rounded' },
  { key: 'contact', label: 'Contact', description: 'Create a person and optional company', icon: 'material-symbols:person-add-outline-rounded' },
  { key: 'lead', label: 'Lead', description: 'Track a possible customer or account', icon: 'material-symbols:post-add-rounded' },
  { key: 'deal', label: 'Deal', description: 'Create a deal in the pipeline', icon: 'material-symbols:handshake-outline-rounded' },
  { key: 'task', label: 'Task', description: 'Add a due task for a contact or lead', icon: 'material-symbols:assignment-outline' },
  { key: 'activity', label: 'Activity', description: 'Create a call, meeting, demo, or follow-up', icon: 'material-symbols:edit-note-outline-rounded' },
  { key: 'equipment', label: 'Equipment Interest', description: 'Capture equipment need and status', icon: 'material-symbols:inventory-2-outline-rounded' },
  { key: 'import', label: 'Import CRM Data', description: 'Upload and map contacts or leads', icon: 'material-symbols:upload-file-outline-rounded', href: paths.crmImport },
];

const emptyCompanyForm = { name: '', companyType: '', website: '', email: '', phone: '', city: '', region: '', notes: '' };
const emptyContactForm = { firstName: '', lastName: '', title: '', email: '', phone: '', mobilePhone: '', companyName: '', notes: '' };
const emptyLeadForm = { contactId: '', companyId: '', source: '', status: 'new', priority: 3, estimatedBudget: '', nextFollowUpAt: '', notes: '' };
const emptyDealForm = { leadId: '', contactId: '', companyId: '', name: '', stage: 'needs_discovery', amount: '', margin: '', probability: 25, expectedCloseDate: '', notes: '' };
const emptyTaskForm = { relatedType: 'contact', relatedId: '', title: '', body: '', dueAt: '' };
const emptyActivityForm = { relatedType: 'contact', relatedId: '', type: 'call', direction: 'outbound', subject: '', body: '', occurredAt: '', dueAt: '' };
const emptyEquipmentForm = {
  relatedType: 'contact',
  relatedId: '',
  category: 'tractor',
  make: '',
  model: '',
  modelYear: '',
  condition: 'either',
  availability: 'availability_unknown',
  status: 'not_started',
  locationId: '',
  quotePrice: '',
  priceMin: '',
  priceMax: '',
  tradeIn: 'false',
  notes: '',
};

const QuickCreateMenu = ({ type = 'default' }) => {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [equipmentLocations, setEquipmentLocations] = useState([]);
  const open = Boolean(anchorEl);
  const compact = type !== 'default';

  const fetchOptions = async () => {
    try {
      const [contactsResult, companiesResult, leadsResult, dealsResult, locationsResult] = await Promise.all([
        supabase.from('contacts').select('id, first_name, last_name, company_id, companies(id, name)').order('last_name', { ascending: true }).limit(200),
        supabase.from('companies').select('id, name').order('name', { ascending: true }).limit(200),
        supabase.from('leads').select('id, source, account_number, status, contact_id, company_id, contacts(id, first_name, last_name), companies(id, name)').neq('status', 'converted').order('created_at', { ascending: false }).limit(200),
        supabase.from('deals').select('id, name, stage, contact_id, company_id, lead_id, contacts(id, first_name, last_name), companies(id, name)').order('updated_at', { ascending: false }).limit(200),
        supabase.from('equipment_locations').select('id, name, city, region').order('name', { ascending: true }).limit(200),
      ]);

      if (!contactsResult.error) setContacts(contactsResult.data || []);
      if (!companiesResult.error) setCompanies(companiesResult.data || []);
      if (!leadsResult.error) setLeads(leadsResult.data || []);
      if (!dealsResult.error) setDeals(dealsResult.data || []);
      if (!locationsResult.error) setEquipmentLocations(locationsResult.data || []);
    } catch {
      setContacts([]);
      setCompanies([]);
      setLeads([]);
      setDeals([]);
      setEquipmentLocations([]);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [supabase]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const openDialog = (key) => {
    const item = createItems.find((createItem) => createItem.key === key);
    if (item?.href) {
      handleClose();
      router.push(item.href);
      return;
    }

    handleClose();
    setDialog(key);
    fetchOptions();
  };

  return (
    <>
      <Button
        color="primary"
        variant="contained"
        size={compact ? 'small' : 'medium'}
        shape={compact ? 'circle' : undefined}
        onClick={handleOpen}
        startIcon={!compact && <IconifyIcon icon="material-symbols:add-rounded" />}
        aria-label="Create CRM record"
      >
        {compact ? <IconifyIcon icon="material-symbols:add-rounded" /> : 'Create'}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} slotProps={{ paper: { sx: { minWidth: 300 } } }}>
        {createItems.map((item) => (
          <MenuItem key={item.key} onClick={() => openDialog(item.key)} sx={{ gap: 1.25, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ minWidth: 32, pt: 0.25 }}>
              <IconifyIcon icon={item.icon} fontSize={22} />
            </ListItemIcon>
            <ListItemText primary={item.label} secondary={item.description} slotProps={{ primary: { variant: 'subtitle2' }, secondary: { variant: 'caption' } }} />
          </MenuItem>
        ))}
      </Menu>

      <CreateCompanyDialog open={dialog === 'company'} onClose={() => setDialog(null)} supabase={supabase} onCreated={(id) => router.push(paths.companyDetails(id))} />
      <CreateContactDialog open={dialog === 'contact'} onClose={() => setDialog(null)} supabase={supabase} companies={companies} onCreated={(id) => router.push(paths.contactDetails(id))} />
      <CreateLeadDialog open={dialog === 'lead'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} companies={companies} onCreated={(id) => router.push(paths.leadDetails(id))} />
      <CreateDealDialog open={dialog === 'deal'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} companies={companies} leads={leads} onCreated={(id) => router.push(paths.dealDetails(id))} />
      <CreateTaskDialog open={dialog === 'task'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} leads={leads} onCreated={() => router.refresh()} />
      <CreateActivityDialog open={dialog === 'activity'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} companies={companies} leads={leads} deals={deals} onCreated={() => router.refresh()} />
      <CreateEquipmentDialog open={dialog === 'equipment'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} leads={leads} deals={deals} locations={equipmentLocations} onCreated={() => router.push(paths.equipment)} />
    </>
  );
};

function CreateCompanyDialog({ open, onClose, supabase, onCreated }) {
  const [form, setForm] = useState(emptyCompanyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyCompanyForm);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const user = await getUserOrThrow(supabase);
    const { data, error: insertError } = await supabase.from('companies').insert({
      owner_id: user.id,
      name: form.name.trim(),
      company_type: cleanText(form.companyType),
      website: cleanText(form.website),
      email: cleanText(form.email),
      phone: cleanText(form.phone),
      city: cleanText(form.city),
      region: cleanText(form.region),
      notes: cleanText(form.notes),
    }).select('id').single();

    setIsSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Company</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Company Name" value={form.name} onChange={handleField(setForm, 'name')} fullWidth required />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Company Type" value={form.companyType} onChange={handleField(setForm, 'companyType')} fullWidth />
            <TextField label="Website" value={form.website} onChange={handleField(setForm, 'website')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Email" type="email" value={form.email} onChange={handleField(setForm, 'email')} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={handleField(setForm, 'phone')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="City" value={form.city} onChange={handleField(setForm, 'city')} fullWidth />
            <TextField label="State/Region" value={form.region} onChange={handleField(setForm, 'region')} fullWidth />
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Company</Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateContactDialog({ open, onClose, supabase, companies, onCreated }) {
  const [form, setForm] = useState(emptyContactForm);
  const [company, setCompany] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyContactForm);
      setCompany(null);
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
    const user = await getUserOrThrow(supabase);
    let companyId = company?.id || null;

    if (!companyId && form.companyName.trim()) {
      const { data, error: companyError } = await supabase.from('companies').insert({ owner_id: user.id, name: form.companyName.trim() }).select('id').single();
      if (companyError) {
        setError(companyError.message);
        setIsSaving(false);
        return;
      }
      companyId = data.id;
    }

    const { data, error: insertError } = await supabase.from('contacts').insert({
      owner_id: user.id,
      company_id: companyId,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      title: cleanText(form.title),
      email: cleanText(form.email),
      phone: cleanText(form.phone),
      mobile_phone: cleanText(form.mobilePhone),
      notes: cleanText(form.notes),
    }).select('id').single();

    setIsSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Contact</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="First Name" value={form.firstName} onChange={handleField(setForm, 'firstName')} fullWidth required />
            <TextField label="Last Name" value={form.lastName} onChange={handleField(setForm, 'lastName')} fullWidth required />
          </Stack>
          <Autocomplete options={companies} value={company} onChange={(_event, value) => setCompany(value)} getOptionLabel={(option) => option?.name || ''} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Existing Company" placeholder="Search companies" />} />
          {!company && <TextField label="New Company Name" value={form.companyName} onChange={handleField(setForm, 'companyName')} fullWidth />}
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
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Contact</Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateLeadDialog({ open, onClose, supabase, contacts, companies, onCreated }) {
  const [form, setForm] = useState(emptyLeadForm);
  const [contact, setContact] = useState(null);
  const [company, setCompany] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyLeadForm);
      setContact(null);
      setCompany(null);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const user = await getUserOrThrow(supabase);
    const companyId = contact?.company_id || company?.id || null;
    const { data, error: insertError } = await supabase.from('leads').insert({
      owner_id: user.id,
      contact_id: contact?.id || null,
      company_id: companyId,
      source: cleanText(form.source),
      status: form.status,
      priority: Number(form.priority) || 3,
      estimated_budget: form.estimatedBudget || null,
      next_follow_up_at: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : null,
      notes: cleanText(form.notes),
    }).select('id').single();

    setIsSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onClose();
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Autocomplete options={contacts} value={contact} onChange={(_event, value) => setContact(value)} getOptionLabel={contactOptionLabel} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Contact" placeholder="Search contacts" />} />
          <Autocomplete options={companies} value={company} onChange={(_event, value) => setCompany(value)} getOptionLabel={(option) => option?.name || ''} isOptionEqualToValue={(option, value) => option.id === value.id} disabled={Boolean(contact?.company_id)} renderInput={(params) => <TextField {...params} label="Company" placeholder="Search companies" helperText={contact?.company_id ? 'Company is set by the selected contact.' : undefined} />} />
          <TextField label="Lead Source" value={form.source} onChange={handleField(setForm, 'source')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Lead Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>{leadStatuses.map((status) => <MenuItem key={status} value={status}>{formatLeadStatus(status)}</MenuItem>)}</TextField>
            <TextField label="Priority" type="number" value={form.priority} onChange={handleField(setForm, 'priority')} fullWidth />
          </Stack>
          <TextField label="Estimated Budget" type="number" value={form.estimatedBudget} onChange={handleField(setForm, 'estimatedBudget')} fullWidth />
          <TextField label="Next Follow-up" type="datetime-local" value={form.nextFollowUpAt} onChange={handleField(setForm, 'nextFollowUpAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Lead</Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateDealDialog({ open, onClose, supabase, contacts, companies, leads, onCreated }) {
  const [form, setForm] = useState(emptyDealForm);
  const [lead, setLead] = useState(null);
  const [contact, setContact] = useState(null);
  const [company, setCompany] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyDealForm);
      setLead(null);
      setContact(null);
      setCompany(null);
      setError(null);
    }
  }, [open]);

  const handleLeadChange = (_event, value) => {
    setLead(value);
    if (value) {
      setContact(contacts.find((item) => item.id === value.contact_id) || null);
      setCompany(companies.find((item) => item.id === value.company_id) || null);
      setForm((prev) => ({ ...prev, name: prev.name || [entityName(value), value.source].filter(Boolean).join(' - ') }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Deal name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const user = await getUserOrThrow(supabase);
    const companyId = lead?.company_id || contact?.company_id || company?.id || null;
    const { data, error: insertError } = await supabase.from('deals').insert({
      owner_id: user.id,
      lead_id: lead?.id || null,
      contact_id: lead?.contact_id || contact?.id || null,
      company_id: companyId,
      name: form.name.trim(),
      stage: form.stage,
      amount: form.amount || null,
      margin: form.margin || null,
      probability: Number(form.probability) || 0,
      expected_close_date: form.expectedCloseDate || null,
      notes: cleanText(form.notes),
    }).select('id').single();

    setIsSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onClose();
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Deal</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Deal Name" value={form.name} onChange={handleField(setForm, 'name')} fullWidth required />
          <Autocomplete options={leads} value={lead} onChange={handleLeadChange} getOptionLabel={leadOptionLabel} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Originating Lead" placeholder="Search leads" />} />
          <Autocomplete options={contacts} value={contact} onChange={(_event, value) => setContact(value)} getOptionLabel={contactOptionLabel} isOptionEqualToValue={(option, value) => option.id === value.id} disabled={Boolean(lead?.contact_id)} renderInput={(params) => <TextField {...params} label="Contact" placeholder="Search contacts" />} />
          <Autocomplete options={companies} value={company} onChange={(_event, value) => setCompany(value)} getOptionLabel={(option) => option?.name || ''} isOptionEqualToValue={(option, value) => option.id === value.id} disabled={Boolean(lead?.company_id || contact?.company_id)} renderInput={(params) => <TextField {...params} label="Company" placeholder="Search companies" />} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Stage" value={form.stage} onChange={handleField(setForm, 'stage')} fullWidth>{dealStages.map((stage) => <MenuItem key={stage} value={stage}>{formatEnum(stage)}</MenuItem>)}</TextField>
            <TextField label="Probability" type="number" value={form.probability} onChange={handleField(setForm, 'probability')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Sales Amount" type="number" value={form.amount} onChange={handleField(setForm, 'amount')} fullWidth />
            <TextField label="Margin" type="number" value={form.margin} onChange={handleField(setForm, 'margin')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Expected Close" type="date" value={form.expectedCloseDate} onChange={handleField(setForm, 'expectedCloseDate')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Deal</Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateActivityDialog({ open, onClose, supabase, contacts, companies, leads, deals, onCreated }) {
  const [form, setForm] = useState(emptyActivityForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const options = form.relatedType === 'deal' ? deals : form.relatedType === 'lead' ? leads : form.relatedType === 'company' ? companies : contacts;

  useEffect(() => {
    if (open) {
      setForm({ ...emptyActivityForm, occurredAt: toDateTimeLocal(new Date().toISOString()) });
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.relatedId) {
      setError('Choose a related record.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const user = await getUserOrThrow(supabase);
    const related = options.find((item) => item.id === form.relatedId);
    const payload = {
      owner_id: user.id,
      contact_id: form.relatedType === 'contact' ? form.relatedId : related?.contact_id || null,
      company_id: form.relatedType === 'company' ? form.relatedId : related?.company_id || null,
      lead_id: form.relatedType === 'lead' ? form.relatedId : related?.lead_id || null,
      deal_id: form.relatedType === 'deal' ? form.relatedId : null,
      type: form.type,
      direction: form.direction,
      subject: cleanText(form.subject) || formatEnum(form.type),
      body: cleanText(form.body),
      occurred_at: form.occurredAt ? new Date(form.occurredAt).toISOString() : new Date().toISOString(),
      due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
    };
    const { error: insertError } = await supabase.from('activities').insert(payload);

    setIsSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onClose();
    onCreated();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Activity</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Related Type" value={form.relatedType} onChange={(event) => setForm((prev) => ({ ...prev, relatedType: event.target.value, relatedId: '' }))} fullWidth>
              <MenuItem value="contact">Contact</MenuItem>
              <MenuItem value="company">Company</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="deal">Deal</MenuItem>
            </TextField>
            <Autocomplete options={options} value={options.find((item) => item.id === form.relatedId) || null} onChange={(_event, value) => setForm((prev) => ({ ...prev, relatedId: value?.id || '' }))} getOptionLabel={(option) => relatedOptionLabel(option, form.relatedType)} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Record" placeholder="Search" />} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Type" value={form.type} onChange={handleField(setForm, 'type')} fullWidth>{activityTypes.map((item) => <MenuItem key={item} value={item}>{formatEnum(item)}</MenuItem>)}</TextField>
            <TextField select label="Direction" value={form.direction} onChange={handleField(setForm, 'direction')} fullWidth>{activityDirections.map((item) => <MenuItem key={item} value={item}>{formatEnum(item)}</MenuItem>)}</TextField>
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
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Activity</Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateTaskDialog({ open, onClose, supabase, contacts, leads, onCreated }) {
  const [form, setForm] = useState(emptyTaskForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const options = form.relatedType === 'lead' ? leads : contacts;

  useEffect(() => {
    if (open) {
      setForm(emptyTaskForm);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.relatedId) {
      setError('Choose a contact or lead.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const user = await getUserOrThrow(supabase);
    const related = options.find((item) => item.id === form.relatedId);
    const payload = {
      owner_id: user.id,
      contact_id: form.relatedType === 'contact' ? form.relatedId : related?.contact_id || null,
      company_id: related?.company_id || null,
      lead_id: form.relatedType === 'lead' ? form.relatedId : null,
      title: cleanText(form.title) || 'Task',
      body: preserveText(form.body),
      due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      completed_at: null,
    };

    const { error: insertError } = await supabase.from('tasks').insert(payload);
    setIsSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
    onCreated();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Task</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Related Type" value={form.relatedType} onChange={(event) => setForm((prev) => ({ ...prev, relatedType: event.target.value, relatedId: '' }))} fullWidth>
              <MenuItem value="contact">Contact</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
            </TextField>
            <Autocomplete options={options} value={options.find((item) => item.id === form.relatedId) || null} onChange={(_event, value) => setForm((prev) => ({ ...prev, relatedId: value?.id || '' }))} getOptionLabel={(option) => relatedOptionLabel(option, form.relatedType)} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Record" placeholder="Search" />} />
          </Stack>
          <TextField label="Task" value={form.title} onChange={handleField(setForm, 'title')} fullWidth />
          <TextField label="Details" value={form.body} onChange={handleField(setForm, 'body')} fullWidth multiline rows={3} />
          <TextField label="Due At" type="datetime-local" value={form.dueAt} onChange={handleField(setForm, 'dueAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Task</Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateEquipmentDialog({ open, onClose, supabase, contacts, leads, deals, locations, onCreated }) {
  const [form, setForm] = useState(emptyEquipmentForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const options = form.relatedType === 'deal' ? deals : form.relatedType === 'lead' ? leads : contacts;

  useEffect(() => {
    if (open) {
      setForm(emptyEquipmentForm);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.relatedId) {
      setError('Choose a related record.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const user = await getUserOrThrow(supabase);
    const related = options.find((item) => item.id === form.relatedId);
    const payload = {
      owner_id: user.id,
      contact_id: form.relatedType === 'contact' ? form.relatedId : related?.contact_id || null,
      lead_id: form.relatedType === 'lead' ? form.relatedId : related?.lead_id || null,
      deal_id: form.relatedType === 'deal' ? form.relatedId : null,
      category: form.category,
      make: cleanText(form.make),
      model: cleanText(form.model),
      model_year: form.modelYear || null,
      condition: form.condition,
      availability: form.availability,
      status: form.status,
      equipment_location_id: form.locationId || null,
      quote_price: form.quotePrice || null,
      price_min: form.priceMin || null,
      price_max: form.priceMax || null,
      trade_in: form.tradeIn === 'true',
      notes: cleanText(form.notes),
    };

    const { error: insertError } = await supabase.from('equipment_interests').insert(payload);
    setIsSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
    onCreated();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Equipment Interest</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Related Type" value={form.relatedType} onChange={(event) => setForm((prev) => ({ ...prev, relatedType: event.target.value, relatedId: '' }))} fullWidth>
              <MenuItem value="contact">Contact</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="deal">Deal</MenuItem>
            </TextField>
            <Autocomplete options={options} value={options.find((item) => item.id === form.relatedId) || null} onChange={(_event, value) => setForm((prev) => ({ ...prev, relatedId: value?.id || '' }))} getOptionLabel={(option) => relatedOptionLabel(option, form.relatedType)} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Record" placeholder="Search" />} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Category" value={form.category} onChange={handleField(setForm, 'category')} fullWidth>{equipmentCategories.map((category) => <MenuItem key={category} value={category}>{formatEnum(category)}</MenuItem>)}</TextField>
            <TextField select label="Condition" value={form.condition} onChange={handleField(setForm, 'condition')} fullWidth>{equipmentConditions.map((condition) => <MenuItem key={condition} value={condition}>{formatEnum(condition)}</MenuItem>)}</TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Make" value={form.make} onChange={handleField(setForm, 'make')} fullWidth />
            <TextField label="Model" value={form.model} onChange={handleField(setForm, 'model')} fullWidth />
            <TextField label="Year" type="number" value={form.modelYear} onChange={handleField(setForm, 'modelYear')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Availability" value={form.availability} onChange={handleField(setForm, 'availability')} fullWidth>{equipmentAvailability.map((availability) => <MenuItem key={availability} value={availability}>{formatEnum(availability)}</MenuItem>)}</TextField>
            <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>{equipmentStatuses.map((status) => <MenuItem key={status} value={status}>{formatEnum(status)}</MenuItem>)}</TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Location" value={form.locationId} onChange={handleField(setForm, 'locationId')} fullWidth>
              <MenuItem value="">No Location</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {[location.name, location.city, location.region].filter(Boolean).join(' - ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Quote Price" type="number" value={form.quotePrice} onChange={handleField(setForm, 'quotePrice')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Price Min" type="number" value={form.priceMin} onChange={handleField(setForm, 'priceMin')} fullWidth />
            <TextField label="Price Max" type="number" value={form.priceMax} onChange={handleField(setForm, 'priceMax')} fullWidth />
            <TextField select label="Trade-in" value={form.tradeIn} onChange={handleField(setForm, 'tradeIn')} fullWidth>
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </TextField>
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>Create Equipment Interest</Button>
      </DialogActions>
    </Dialog>
  );
}

async function getUserOrThrow(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('You need to be logged in.');
  return data.user;
}

function handleField(setForm, key) {
  return (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function preserveText(value) {
  const text = value?.trimEnd();
  return text ? text : null;
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || '';
}

function contactOptionLabel(contact) {
  return [contactName(contact), contact?.companies?.name].filter(Boolean).join(' - ');
}

function entityName(record) {
  return (
    record?.companies?.name ||
    contactName(record?.contacts) ||
    (record?.account_number ? `Account ${record.account_number}` : '') ||
    record?.source ||
    record?.name ||
    'Lead'
  );
}

function leadOptionLabel(lead) {
  return [entityName(lead), lead?.source, formatLeadStatus(lead?.status)].filter(Boolean).join(' - ');
}

function relatedOptionLabel(option, type) {
  if (type === 'deal') return option?.name || '';
  if (type === 'lead') return leadOptionLabel(option);
  if (type === 'company') return option?.name || '';
  return contactOptionLabel(option);
}

function formatEnum(value) {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default QuickCreateMenu;
