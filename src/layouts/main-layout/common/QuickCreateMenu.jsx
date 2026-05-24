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

const leadStatuses = ['new', 'working', 'qualified', 'unqualified', 'converted'];
const dealStages = ['lead', 'quoted', 'negotiation', 'won', 'lost'];
const activityTypes = ['call', 'email', 'meeting', 'text', 'task', 'site_visit', 'demo', 'other'];
const activityDirections = ['outbound', 'inbound', 'internal'];

const createItems = [
  { key: 'contact', label: 'Contact', description: 'Create a person and optional company', icon: 'material-symbols:person-add-outline-rounded' },
  { key: 'lead', label: 'Lead', description: 'Create a lead linked to a contact or company', icon: 'material-symbols:add-notes-outline-rounded' },
  { key: 'deal', label: 'Deal', description: 'Create a deal in the pipeline', icon: 'material-symbols:handshake-outline-rounded' },
  { key: 'activity', label: 'Activity', description: 'Create a call, meeting, task, or follow-up', icon: 'material-symbols:edit-note-outline-rounded' },
];

const emptyContactForm = { firstName: '', lastName: '', title: '', email: '', phone: '', mobilePhone: '', companyName: '', notes: '' };
const emptyLeadForm = { contactId: '', companyId: '', source: '', status: 'new', priority: 3, estimatedBudget: '', nextFollowUpAt: '', notes: '' };
const emptyDealForm = { leadId: '', contactId: '', companyId: '', name: '', stage: 'lead', amount: '', probability: 25, expectedCloseDate: '', notes: '' };
const emptyActivityForm = { relatedType: 'contact', relatedId: '', type: 'call', direction: 'outbound', subject: '', body: '', occurredAt: '', dueAt: '' };

const QuickCreateMenu = ({ type = 'default' }) => {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const open = Boolean(anchorEl);
  const compact = type !== 'default';

  const fetchOptions = async () => {
    const [contactsResult, companiesResult, leadsResult, dealsResult] = await Promise.all([
      supabase.from('contacts').select('id, first_name, last_name, company_id, companies(id, name)').order('last_name', { ascending: true }).limit(200),
      supabase.from('companies').select('id, name').order('name', { ascending: true }).limit(200),
      supabase.from('leads').select('id, source, status, contact_id, company_id, contacts(id, first_name, last_name), companies(id, name)').neq('status', 'converted').order('created_at', { ascending: false }).limit(200),
      supabase.from('deals').select('id, name, stage, contact_id, company_id, lead_id, contacts(id, first_name, last_name), companies(id, name)').order('updated_at', { ascending: false }).limit(200),
    ]);

    if (!contactsResult.error) setContacts(contactsResult.data || []);
    if (!companiesResult.error) setCompanies(companiesResult.data || []);
    if (!leadsResult.error) setLeads(leadsResult.data || []);
    if (!dealsResult.error) setDeals(dealsResult.data || []);
  };

  useEffect(() => {
    fetchOptions();
  }, [supabase]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const openDialog = (key) => {
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

      <CreateContactDialog open={dialog === 'contact'} onClose={() => setDialog(null)} supabase={supabase} companies={companies} onCreated={(id) => router.push(paths.contactDetails(id))} />
      <CreateLeadDialog open={dialog === 'lead'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} companies={companies} onCreated={(id) => router.push(paths.leadDetails(id))} />
      <CreateDealDialog open={dialog === 'deal'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} companies={companies} leads={leads} onCreated={(id) => router.push(paths.dealDetails(id))} />
      <CreateActivityDialog open={dialog === 'activity'} onClose={() => setDialog(null)} supabase={supabase} contacts={contacts} companies={companies} leads={leads} deals={deals} onCreated={() => router.refresh()} />
    </>
  );
};

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
          <TextField label="Source" value={form.source} onChange={handleField(setForm, 'source')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>{leadStatuses.map((status) => <MenuItem key={status} value={status}>{formatEnum(status)}</MenuItem>)}</TextField>
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
          <Autocomplete options={leads} value={lead} onChange={handleLeadChange} getOptionLabel={leadOptionLabel} isOptionEqualToValue={(option, value) => option.id === value.id} renderInput={(params) => <TextField {...params} label="Related Lead" placeholder="Search leads" />} />
          <Autocomplete options={contacts} value={contact} onChange={(_event, value) => setContact(value)} getOptionLabel={contactOptionLabel} isOptionEqualToValue={(option, value) => option.id === value.id} disabled={Boolean(lead?.contact_id)} renderInput={(params) => <TextField {...params} label="Contact" placeholder="Search contacts" />} />
          <Autocomplete options={companies} value={company} onChange={(_event, value) => setCompany(value)} getOptionLabel={(option) => option?.name || ''} isOptionEqualToValue={(option, value) => option.id === value.id} disabled={Boolean(lead?.company_id || contact?.company_id)} renderInput={(params) => <TextField {...params} label="Company" placeholder="Search companies" />} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Stage" value={form.stage} onChange={handleField(setForm, 'stage')} fullWidth>{dealStages.map((stage) => <MenuItem key={stage} value={stage}>{formatEnum(stage)}</MenuItem>)}</TextField>
            <TextField label="Probability" type="number" value={form.probability} onChange={handleField(setForm, 'probability')} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Amount" type="number" value={form.amount} onChange={handleField(setForm, 'amount')} fullWidth />
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

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || '';
}

function contactOptionLabel(contact) {
  return [contactName(contact), contact?.companies?.name].filter(Boolean).join(' - ');
}

function entityName(record) {
  return contactName(record?.contacts) || record?.companies?.name || record?.name || 'CRM record';
}

function leadOptionLabel(lead) {
  return [entityName(lead), lead?.source || formatEnum(lead?.status)].filter(Boolean).join(' - ');
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
