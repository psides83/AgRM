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
  InputAdornment,
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
import { formatPhone } from 'components/sections/crm/shared/phoneFormat';
import {
  formatLeadStatus,
  leadStatuses,
} from 'components/sections/crm/constants';
const equipmentCategoryIcons = {
  tractor: '/deere-icons/tractor-row-crop.svg',
  combine: '/deere-icons/combine.svg',
  planter: '/deere-icons/planting-planter.svg',
  sprayer: '/deere-icons/sprayer.svg',
  hay: '/deere-icons/hay-baler.svg',
  tillage: '/deere-icons/tillage.svg',
  utility_vehicle: '/deere-icons/xuv-gator.svg',
  attachment: '/deere-icons/3-point-rotary-cutter.svg',
  other: '/deere-icons/generic-equipment.svg',
};

const emptyFilters = {
  search: '',
  status: 'all',
  followUp: 'all',
};

const LeadsList = () => {
  const supabase = useMemo(() => createClient(), []);
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingLead, setEditingLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    setError(null);

    const { data, error: queryError } = await supabase
      .from('leads')
      .select(
        `
        id,
        source,
        account_number,
        status,
        priority,
        estimated_budget,
        next_follow_up_at,
        notes,
        created_at,
        contacts(id, first_name, last_name, account_number, email, phone, mobile_phone),
        companies(id, name),
        equipment_interests(
          id,
          category,
          make,
          model,
          model_year,
          condition,
          stock_number,
          serial_number,
          availability,
          status,
          quote_price,
          price_min,
          price_max,
          trade_in,
          equipment_locations(id, name, city, region)
        )
      `,
      )
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setLeads(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('agrm-leads-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => fetchLeads(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        () => fetchLeads(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companies' },
        () => fetchLeads(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment_interests' },
        () => fetchLeads(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredLeads = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return leads.filter((lead) => {
      const equipmentText = (lead.equipment_interests || [])
        .map((item) =>
          [
            item.category,
            item.make,
            item.model,
            item.model_year,
            item.stock_number,
            item.serial_number,
            item.equipment_locations?.name,
          ]
            .filter(Boolean)
            .join(' '),
        )
        .join(' ');

      const text = [
        lead.source,
        lead.account_number,
        lead.status,
        formatLeadStatus(lead.status),
        lead.notes,
        contactName(lead.contacts),
        lead.contacts?.email,
        lead.contacts?.phone,
        lead.contacts?.mobile_phone,
        lead.contacts?.account_number,
        lead.companies?.name,
        equipmentText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!search || text.includes(search)) &&
        (filters.status === 'all' || lead.status === filters.status) &&
        leadMatchesFollowUpFilter(lead, filters.followUp)
      );
    });
  }, [leads, filters]);

  const followUpCounts = useMemo(() => leadFollowUpCounts(leads), [leads]);

  const handleLeadSaved = () => {
    setEditingLead(null);
    fetchLeads();
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Leads"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Leads', active: true },
          ]}
          actionComponent={
            <Stack direction="row" spacing={1}>
              <Button
                href={paths.crmImport}
                component={Link}
                underline="none"
                variant="soft"
                color="neutral"
                startIcon={
                  <IconifyIcon icon="material-symbols:upload-file-outline-rounded" />
                }
              >
                Import CSV
              </Button>
              <Button
                href={paths.addContact}
                component={Link}
                underline="none"
                variant="contained"
                startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
              >
                Add Lead
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', lg: 'center' },
            }}
          >
            <Box>
              <Typography variant="h6">Lead pipeline</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredLeads.length} shown from {leads.length} total lead
                {leads.length === 1 ? '' : 's'}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                value={filters.search}
                onChange={handleFilter('search')}
                placeholder="Search leads, contacts, companies, equipment..."
                sx={{ width: { xs: 1, sm: 360 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconifyIcon icon="material-symbols:search-rounded" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={handleFilter('status')}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">All</MenuItem>
                {leadStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {formatLeadStatus(status)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Follow-up"
                value={filters.followUp}
                onChange={handleFilter('followUp')}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="overdue">
                  Overdue ({followUpCounts.overdue})
                </MenuItem>
                <MenuItem value="today">
                  Today ({followUpCounts.today})
                </MenuItem>
                <MenuItem value="upcoming">
                  Upcoming ({followUpCounts.upcoming})
                </MenuItem>
                <MenuItem value="none">
                  No Follow-up ({followUpCounts.none})
                </MenuItem>
              </TextField>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', mt: 2 }}
          >
            <LeadSummaryChip
              label="Overdue"
              value={followUpCounts.overdue}
              color={followUpCounts.overdue ? 'error' : 'neutral'}
            />
            <LeadSummaryChip
              label="Due Today"
              value={followUpCounts.today}
              color={followUpCounts.today ? 'warning' : 'neutral'}
            />
            <LeadSummaryChip
              label="Upcoming"
              value={followUpCounts.upcoming}
              color="info"
            />
            <LeadSummaryChip
              label="No Follow-up"
              value={followUpCounts.none}
              color="neutral"
            />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Contact / Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Equipment Interest</TableCell>
                  <TableCell>Budget / Follow-up</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading leads..." />
                ) : filteredLeads.length ? (
                  filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      onEdit={setEditingLead}
                    />
                  ))
                ) : (
                  <EmptyRow
                    label={
                      filters.search || filters.status !== 'all'
                        ? 'No leads match these filters'
                        : 'No leads yet'
                    }
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <EditLeadDialog
        open={Boolean(editingLead)}
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onSaved={handleLeadSaved}
        supabase={supabase}
      />
    </Grid>
  );

  function handleFilter(key) {
    return (event) =>
      setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  }
};

function LeadRow({ lead, onEdit }) {
  const equipment = lead.equipment_interests || [];
  const primaryEquipment = equipment[0];
  const followUpStatus = leadFollowUpStatus(lead);

  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 220 }}>
        <Link
          href={paths.leadDetails(lead.id)}
          underline="hover"
          sx={{ color: 'text.primary', fontWeight: 700 }}
        >
          {leadDisplayName(lead)}
        </Link>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {[
            lead.account_number ? `Account ${lead.account_number}` : null,
            lead.source,
            `Created ${formatDate(lead.created_at)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        {lead.contacts?.id ? (
          <Link
            href={paths.contactDetails(lead.contacts.id)}
            underline="hover"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {contactName(lead.contacts)}
          </Link>
        ) : (
          <Typography variant="body2">No contact linked</Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {lead.companies?.id ? (
            <Link
              href={paths.companyDetails(lead.companies.id)}
              underline="hover"
              sx={{ color: 'text.secondary' }}
            >
              {lead.companies.name}
            </Link>
          ) : (
            lead.contacts?.account_number ||
            formatPhone(lead.contacts?.mobile_phone || lead.contacts?.phone) ||
            lead.contacts?.email ||
            'No company'
          )}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <Stack spacing={0.75} alignItems="flex-start">
          <Chip
            label={formatLeadStatus(lead.status)}
            size="small"
            variant="soft"
            color={leadStatusColor(lead.status)}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Priority {lead.priority || '-'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ minWidth: 300 }}>
        {primaryEquipment ? (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <EquipmentCategoryIcon category={primaryEquipment.category} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {equipmentName(primaryEquipment)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {[
                    formatEnum(primaryEquipment.category),
                    formatEnum(primaryEquipment.condition),
                    locationLabel(primaryEquipment.equipment_locations),
                    equipmentBudget(primaryEquipment),
                  ]
                    .filter((value) => value && value !== 'No Location')
                    .join(' · ')}
                </Typography>
              </Box>
            </Stack>
            {equipment.length > 1 && (
              <Stack
                direction="row"
                spacing={0.5}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {equipment.slice(1, 4).map((item) => (
                  <Chip
                    key={item.id}
                    label={equipmentName(item)}
                    size="small"
                    variant="soft"
                    color="neutral"
                  />
                ))}
                {equipment.length > 4 && (
                  <Chip
                    label={`+${equipment.length - 4} more`}
                    size="small"
                    variant="soft"
                    color="neutral"
                  />
                )}
              </Stack>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No equipment interest yet
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <Typography variant="body2">
          {formatCurrency(lead.estimated_budget)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {lead.next_follow_up_at
            ? `Follow up ${formatDateTime(lead.next_follow_up_at)}`
            : 'No follow-up set'}
        </Typography>
        {followUpStatus !== 'none' && (
          <Chip
            label={followUpStatusLabel(followUpStatus)}
            size="small"
            variant="soft"
            color={followUpStatusColor(followUpStatus)}
            sx={{ mt: 0.75 }}
          />
        )}
      </TableCell>
      <TableCell align="right" sx={{ minWidth: 110 }}>
        <Button
          size="small"
          variant="soft"
          startIcon={<IconifyIcon icon="material-symbols:edit-outline" />}
          onClick={() => onEdit(lead)}
        >
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
}

function EditLeadDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    status: 'new',
    priority: 3,
    estimatedBudget: '',
    nextFollowUpAt: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setForm({
      status: lead?.status || 'new',
      priority: lead?.priority || 3,
      estimatedBudget: lead?.estimated_budget || '',
      nextFollowUpAt: toDateTimeLocal(lead?.next_follow_up_at),
      notes: lead?.notes || '',
    });
  }, [lead, open]);

  const handleSave = async () => {
    if (!lead?.id) return;

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: form.status,
        priority: Number(form.priority) || 3,
        estimated_budget: form.estimatedBudget || null,
        next_follow_up_at: form.nextFollowUpAt
          ? new Date(form.nextFollowUpAt).toISOString()
          : null,
        notes: cleanText(form.notes),
      })
      .eq('id', lead.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Lead</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              slotProps={{ htmlInput: { min: 1, max: 5 } }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
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

function EquipmentCategoryIcon({ category }) {
  const src = equipmentCategoryIcons[category] || equipmentCategoryIcons.other;

  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1,
        bgcolor: 'background.elevation1',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        aria-hidden
        sx={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }}
      />
    </Box>
  );
}

function EmptyRow({ label }) {
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}
        >
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function LeadSummaryChip({ label, value, color }) {
  return (
    <Chip
      label={`${label}: ${value}`}
      size="small"
      variant="soft"
      color={color}
    />
  );
}

function handleField(setForm, key) {
  return (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
}

function cleanText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function contactName(contact) {
  return (
    [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') ||
    'Unnamed contact'
  );
}

function leadDisplayName(lead) {
  return (
    lead.companies?.name ||
    (lead.contacts ? contactName(lead.contacts) : '') ||
    (lead.account_number ? `Account ${lead.account_number}` : '') ||
    lead.source ||
    'Lead'
  );
}

function equipmentName(item) {
  return (
    [item.model_year, item.make, item.model].filter(Boolean).join(' ') ||
    item.stock_number ||
    item.serial_number ||
    formatEnum(item.category)
  );
}

function equipmentBudget(item) {
  if (item.quote_price) return `Quote ${formatCurrency(item.quote_price)}`;
  return (
    [formatCurrency(item.price_min), formatCurrency(item.price_max)]
      .filter((value) => value !== '-')
      .join(' - ') || null
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

function leadStatusColor(status) {
  if (status === 'qualified') return 'success';
  if (status === 'working') return 'info';
  if (status === 'converted') return 'primary';
  if (status === 'unqualified') return 'error';
  return 'neutral';
}

function leadMatchesFollowUpFilter(lead, filter) {
  if (filter === 'all') return true;
  return leadFollowUpStatus(lead) === filter;
}

function leadFollowUpCounts(leads) {
  return leads.reduce(
    (counts, lead) => {
      counts[leadFollowUpStatus(lead)] += 1;
      return counts;
    },
    { overdue: 0, today: 0, upcoming: 0, none: 0 },
  );
}

function leadFollowUpStatus(lead) {
  if (!lead.next_follow_up_at) return 'none';

  const followUp = new Date(lead.next_follow_up_at);
  if (Number.isNaN(followUp.getTime())) return 'none';

  const now = new Date();
  if (followUp < startOfToday(now)) return 'overdue';
  if (followUp <= endOfToday(now)) return 'today';
  return 'upcoming';
}

function followUpStatusLabel(status) {
  if (status === 'overdue') return 'Overdue';
  if (status === 'today') return 'Due today';
  if (status === 'upcoming') return 'Upcoming';
  return 'No follow-up';
}

function followUpStatusColor(status) {
  if (status === 'overdue') return 'error';
  if (status === 'today') return 'warning';
  if (status === 'upcoming') return 'info';
  return 'neutral';
}

function startOfToday(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfToday(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
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

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return '-';
  if (value === 'fit_confirmed') return 'Equipment Fit Confirmed';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default LeadsList;
