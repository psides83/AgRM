'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const dealStages = ['lead', 'quoted', 'negotiation', 'won', 'lost'];

const emptyDealForm = {
  name: '',
  stage: 'lead',
  amount: '',
  probability: 0,
  expectedCloseDate: '',
  contactId: '',
  leadId: '',
  notes: '',
};

const Deals = () => {
  const supabase = useMemo(() => createClient(), []);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchDeals = async () => {
    setError(null);

    const { data, error: queryError } = await supabase
      .from('deals')
      .select(
        `
        id,
        name,
        stage,
        amount,
        probability,
        expected_close_date,
        notes,
        updated_at,
        contacts(id, first_name, last_name),
        companies(id, name),
        leads(id, status, source)
      `
      )
      .order('updated_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setDeals(data || []);
    }

    setIsLoading(false);
  };

  const fetchDealOptions = async () => {
    const [contactsResult, leadsResult] = await Promise.all([
      supabase
        .from('contacts')
        .select('id, first_name, last_name, company_id, companies(id, name)')
        .order('last_name', { ascending: true }),
      supabase
        .from('leads')
        .select('id, status, source, contact_id, company_id, contacts(id, first_name, last_name), companies(id, name)')
        .neq('status', 'converted')
        .order('created_at', { ascending: false }),
    ]);

    if (!contactsResult.error) {
      setContacts(contactsResult.data || []);
    }

    if (!leadsResult.error) {
      setLeads(leadsResult.data || []);
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchDealOptions();

    const channel = supabase
      .channel('agrm-deals-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => fetchDeals())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => fetchDealOptions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchDealOptions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const dealsByStage = useMemo(
    () =>
      dealStages.map((stage) => ({
        stage,
        deals: deals.filter((deal) => deal.stage === stage),
      })),
    [deals]
  );

  const handleStageChange = async (dealId, stage) => {
    const { error: updateError } = await supabase.from('deals').update({ stage }).eq('id', dealId);

    if (updateError) {
      setError(updateError.message);
    } else {
      fetchDeals();
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Deals"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Deals', active: true },
          ]}
          actionComponent={
            <Button
              variant="contained"
              onClick={() => setDialogOpen(true)}
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            >
              Add Deal
            </Button>
          }
        />
      </Grid>

      <Grid size={12}>
        {error && <Alert severity="error">{error}</Alert>}
      </Grid>

      <Grid size={12}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(5, minmax(220px, 1fr))',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {dealsByStage.map((column) => (
            <StageColumn
              key={column.stage}
              stage={column.stage}
              deals={column.deals}
              isLoading={isLoading}
              onStageChange={handleStageChange}
            />
          ))}
        </Box>
      </Grid>

      <CreateDealDialog
        open={dialogOpen}
        contacts={contacts}
        leads={leads}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          fetchDeals();
        }}
        supabase={supabase}
      />
    </Grid>
  );
};

function StageColumn({ stage, deals, isLoading, onStageChange }) {
  const total = deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

  return (
    <Paper sx={{ p: 2, minHeight: 240 }}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6">{formatEnum(stage)}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {deals.length} deal{deals.length === 1 ? '' : 's'} · {formatCurrency(total)}
          </Typography>
        </Box>
        <Chip label={deals.length} size="small" variant="soft" color="primary" />
      </Stack>

      <Stack direction="column" spacing={1.5}>
        {isLoading ? (
          <EmptyState label="Loading deals..." />
        ) : deals.length ? (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onStageChange={onStageChange} />
          ))
        ) : (
          <EmptyState label="No deals" />
        )}
      </Stack>
    </Paper>
  );
}

function DealCard({ deal, onStageChange }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: 'background.elevation1',
      }}
    >
      <Stack direction="column" spacing={1.25}>
        <Box>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            <Link href={paths.dealDetails(deal.id)} underline="hover" color="text.primary">
              {deal.name}
            </Link>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {entityName(deal)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip label={formatCurrency(deal.amount)} size="small" variant="soft" color="neutral" />
          <Chip label={`${deal.probability || 0}%`} size="small" variant="soft" color="neutral" />
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Close: {formatDate(deal.expected_close_date)}
        </Typography>

        <TextField
          select
          size="small"
          label="Stage"
          value={deal.stage}
          onChange={(event) => onStageChange(deal.id, event.target.value)}
          fullWidth
        >
          {dealStages.map((stage) => (
            <MenuItem key={stage} value={stage}>
              {formatEnum(stage)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  );
}

function CreateDealDialog({ open, contacts, leads, onClose, onSaved, supabase }) {
  const [form, setForm] = useState(emptyDealForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyDealForm);
      setError(null);
    }
  }, [open]);

  const selectedContact = contacts.find((contact) => contact.id === form.contactId);
  const selectedLead = leads.find((lead) => lead.id === form.leadId);
  const derivedContact = selectedLead?.contact_id
    ? contacts.find((contact) => contact.id === selectedLead.contact_id)
    : null;

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Deal name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('You need to be logged in to create a deal.');
      setIsSaving(false);
      return;
    }

    const contactId = selectedLead?.contact_id || form.contactId || null;
    const companyId = selectedLead?.company_id || selectedContact?.company_id || null;

    const { error: insertError } = await supabase.from('deals').insert({
      owner_id: user.id,
      lead_id: form.leadId || null,
      contact_id: contactId,
      company_id: companyId,
      name: form.name.trim(),
      stage: form.stage,
      amount: form.amount || null,
      probability: Number(form.probability) || 0,
      expected_close_date: form.expectedCloseDate || null,
      notes: cleanText(form.notes),
    });

    setIsSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Deal</DialogTitle>
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
          <TextField select label="Stage" value={form.stage} onChange={handleField(setForm, 'stage')} fullWidth>
            {dealStages.map((stage) => (
              <MenuItem key={stage} value={stage}>
                {formatEnum(stage)}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={leads}
            value={selectedLead || null}
            onChange={(_event, value) => {
              setForm((prev) => ({
                ...prev,
                leadId: value?.id || '',
                contactId: value?.contact_id || prev.contactId,
              }));
            }}
            getOptionLabel={(option) => leadOptionLabel(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No leads found"
            renderInput={(params) => (
              <TextField {...params} label="Related Lead" placeholder="Search leads" fullWidth />
            )}
          />
          <Autocomplete
            options={contacts}
            value={derivedContact || selectedContact || null}
            onChange={(_event, value) => {
              setForm((prev) => ({ ...prev, contactId: value?.id || '' }));
            }}
            getOptionLabel={(option) => contactOptionLabel(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No contacts found"
            disabled={Boolean(selectedLead?.contact_id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Contact"
                placeholder="Search contacts"
                helperText={selectedLead?.contact_id ? 'Contact is set by the selected lead.' : undefined}
                fullWidth
              />
            )}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Amount" type="number" value={form.amount} onChange={handleField(setForm, 'amount')} fullWidth />
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
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Deal
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmptyState({ label }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
      {label}
    </Typography>
  );
}

function handleField(setForm, key) {
  return (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
}

function entityName(record) {
  const contact = record.contacts;
  const name = contact ? contactName(contact) : '';
  return name || record.companies?.name || record.name || 'No linked contact';
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Unnamed contact';
}

function leadOptionLabel(lead) {
  if (!lead) return '';

  return [entityName(lead), lead.source || formatEnum(lead.status), lead.companies?.name]
    .filter(Boolean)
    .join(' · ');
}

function contactOptionLabel(contact) {
  if (!contact) return '';

  return [contactName(contact), contact.companies?.name].filter(Boolean).join(' · ');
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '-';

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

function formatEnum(value) {
  if (!value) return '-';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export default Deals;
