'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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

const leadStatuses = ['new', 'working', 'qualified', 'unqualified', 'converted'];
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
};

const LeadsList = () => {
  const supabase = useMemo(() => createClient(), []);
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
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
          trade_in
        )
      `
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => fetchLeads())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => fetchLeads())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_interests' }, () => fetchLeads())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredLeads = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return leads.filter((lead) => {
      const equipmentText = (lead.equipment_interests || [])
        .map((item) => [item.category, item.make, item.model, item.model_year, item.stock_number, item.serial_number].filter(Boolean).join(' '))
        .join(' ');

      const text = [
        lead.source,
        lead.account_number,
        lead.status,
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

      return (!search || text.includes(search)) && (filters.status === 'all' || lead.status === filters.status);
    });
  }, [leads, filters]);

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
              <Button href={paths.crmImport} component={Link} underline="none" variant="soft" color="neutral" startIcon={<IconifyIcon icon="material-symbols:upload-file-outline-rounded" />}>
                Import CSV
              </Button>
              <Button href={paths.addContact} component={Link} underline="none" variant="contained" startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}>
                Add Contact / Lead
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'center' } }}>
            <Box>
              <Typography variant="h6">Lead pipeline</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredLeads.length} shown from {leads.length} total lead{leads.length === 1 ? '' : 's'}
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
              <TextField select label="Status" value={filters.status} onChange={handleFilter('status')} sx={{ minWidth: 180 }}>
                <MenuItem value="all">All</MenuItem>
                {leadStatuses.map((status) => <MenuItem key={status} value={status}>{formatEnum(status)}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Equipment Interest</TableCell>
                  <TableCell>Budget / Follow-up</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading leads..." />
                ) : filteredLeads.length ? (
                  filteredLeads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
                ) : (
                  <EmptyRow label={filters.search || filters.status !== 'all' ? 'No leads match these filters' : 'No leads yet'} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  function handleFilter(key) {
    return (event) => setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  }
};

function LeadRow({ lead }) {
  const equipment = lead.equipment_interests || [];
  const primaryEquipment = equipment[0];

  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 220 }}>
        <Link href={paths.leadDetails(lead.id)} underline="hover" sx={{ color: 'text.primary', fontWeight: 700 }}>
          {lead.source || 'Lead'}
        </Link>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {[lead.account_number ? `Account ${lead.account_number}` : null, `Created ${formatDate(lead.created_at)}`].filter(Boolean).join(' · ')}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        {lead.contacts?.id ? (
          <Link href={paths.contactDetails(lead.contacts.id)} underline="hover" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {contactName(lead.contacts)}
          </Link>
        ) : (
          <Typography variant="body2">No contact linked</Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {lead.companies?.id ? (
            <Link href={paths.companyDetails(lead.companies.id)} underline="hover" sx={{ color: 'text.secondary' }}>
              {lead.companies.name}
            </Link>
          ) : (
            lead.contacts?.account_number || lead.contacts?.mobile_phone || lead.contacts?.phone || lead.contacts?.email || 'No company'
          )}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <Stack spacing={0.75} alignItems="flex-start">
          <Chip label={formatEnum(lead.status)} size="small" variant="soft" color={leadStatusColor(lead.status)} />
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
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {equipmentName(primaryEquipment)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {[formatEnum(primaryEquipment.category), formatEnum(primaryEquipment.condition), equipmentBudget(primaryEquipment)].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
            </Stack>
            {equipment.length > 1 && (
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {equipment.slice(1, 4).map((item) => (
                  <Chip key={item.id} label={equipmentName(item)} size="small" variant="soft" color="neutral" />
                ))}
                {equipment.length > 4 && <Chip label={`+${equipment.length - 4} more`} size="small" variant="soft" color="neutral" />}
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
        <Typography variant="body2">{formatCurrency(lead.estimated_budget)}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {lead.next_follow_up_at ? `Follow up ${formatDateTime(lead.next_follow_up_at)}` : 'No follow-up set'}
        </Typography>
      </TableCell>
    </TableRow>
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
      <Box component="img" src={src} alt="" aria-hidden sx={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} />
    </Box>
  );
}

function EmptyRow({ label }) {
  return (
    <TableRow>
      <TableCell colSpan={5}>
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Unnamed contact';
}

function equipmentName(item) {
  return [item.model_year, item.make, item.model].filter(Boolean).join(' ') || item.stock_number || item.serial_number || formatEnum(item.category);
}

function equipmentBudget(item) {
  if (item.quote_price) return `Quote ${formatCurrency(item.quote_price)}`;
  return [formatCurrency(item.price_min), formatCurrency(item.price_max)].filter((value) => value !== '-').join(' - ') || null;
}

function leadStatusColor(status) {
  if (status === 'qualified') return 'success';
  if (status === 'working') return 'info';
  if (status === 'converted') return 'primary';
  if (status === 'unqualified') return 'error';
  return 'neutral';
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return '-';
  if (value === 'fit_confirmed') return 'Equipment Fit Confirmed';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default LeadsList;
