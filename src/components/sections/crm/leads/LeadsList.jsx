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
  equipmentCategoryIcons,
  formatLeadStatus,
  leadStatuses,
} from 'components/sections/crm/constants';

const emptyFilters = {
  search: '',
  queue: 'active',
  status: 'all',
  followUp: 'all',
  sort: 'call_priority',
};

const callResults = [
  { value: 'no_answer', label: 'No Answer' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'bad_number', label: 'Bad Number' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
];

const LeadsList = () => {
  const supabase = useMemo(() => createClient(), []);
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingLead, setEditingLead] = useState(null);
  const [callLead, setCallLead] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
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
        contact_id,
        company_id,
        first_name,
        last_name,
        company_name,
        phone,
        mobile_phone,
        home_phone,
        email,
        address_line1,
        city,
        county,
        region,
        postal_code,
        branch,
        import_source,
        call_result,
        call_attempt_count,
        last_contacted_at,
        visited,
        last_visited_at,
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
      const leadRows = data || [];
      const latestCallByLead = await fetchLatestCallsByLead(supabase, leadRows);
      setLeads(
        leadRows.map((lead) => ({
          ...lead,
          latest_call_activity: latestCallByLead.get(lead.id) || null,
        })),
      );
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => fetchLeads(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredLeads = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const visibleLeads = leads.filter((lead) => {
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
        lead.first_name,
        lead.last_name,
        lead.company_name,
        lead.phone,
        lead.mobile_phone,
        lead.home_phone,
        lead.email,
        lead.address_line1,
        lead.city,
        lead.county,
        lead.region,
        lead.postal_code,
        lead.branch,
        lead.import_source,
        lead.call_result,
        lead.last_contacted_at,
        lead.latest_call_activity?.subject,
        lead.latest_call_activity?.body,
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
        leadMatchesQueueFilter(lead, filters.queue) &&
        (filters.status === 'all' || lead.status === filters.status) &&
        leadMatchesFollowUpFilter(lead, filters.followUp)
      );
    });

    return sortLeadsForQueue(visibleLeads, filters.sort);
  }, [leads, filters]);

  const followUpCounts = useMemo(() => leadFollowUpCounts(leads), [leads]);
  const queueCounts = useMemo(() => leadQueueCounts(leads), [leads]);
  const outcomeStats = useMemo(() => leadOutcomeStats(leads), [leads]);
  const filteredLeadIds = useMemo(
    () => filteredLeads.map((lead) => lead.id),
    [filteredLeads],
  );
  const selectedVisibleCount = selectedIds.filter((id) =>
    filteredLeadIds.includes(id),
  ).length;

  const handleLeadSaved = () => {
    setEditingLead(null);
    fetchLeads();
  };

  const handleSelectAllVisible = (event) => {
    if (event.target.checked) {
      setSelectedIds((current) => [
        ...new Set([...current, ...filteredLeadIds]),
      ]);
    } else {
      setSelectedIds((current) =>
        current.filter((id) => !filteredLeadIds.includes(id)),
      );
    }
  };

  const handleSelectLead = (leadId) => (event) => {
    setSelectedIds((current) =>
      event.target.checked
        ? [...new Set([...current, leadId])]
        : current.filter((id) => id !== leadId),
    );
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
              <Typography variant="h6">Lead call queue</Typography>
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
                label="Queue"
                value={filters.queue}
                onChange={handleFilter('queue')}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="active">
                  Active ({queueCounts.active})
                </MenuItem>
                <MenuItem value="needs_call">
                  Needs Call ({queueCounts.needsCall})
                </MenuItem>
                <MenuItem value="called">
                  Called ({queueCounts.called})
                </MenuItem>
                <MenuItem value="converted">
                  Converted ({queueCounts.converted})
                </MenuItem>
                <MenuItem value="closed">
                  Closed Out ({queueCounts.closed})
                </MenuItem>
                <MenuItem value="all">All ({leads.length})</MenuItem>
              </TextField>
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
              <TextField
                select
                label="Sort"
                value={filters.sort}
                onChange={handleFilter('sort')}
                sx={{ minWidth: 190 }}
              >
                <MenuItem value="call_priority">Call Priority</MenuItem>
                <MenuItem value="follow_up">Follow-up Date</MenuItem>
                <MenuItem value="lead_priority">Lead Priority</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
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
              label="Needs Call"
              value={queueCounts.needsCall}
              color={queueCounts.needsCall ? 'primary' : 'neutral'}
              onClick={() =>
                setFilters((prev) => ({ ...prev, queue: 'needs_call' }))
              }
            />
            <LeadSummaryChip
              label="Overdue"
              value={followUpCounts.overdue}
              color={followUpCounts.overdue ? 'error' : 'neutral'}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  queue: 'all',
                  followUp: 'overdue',
                }))
              }
            />
            <LeadSummaryChip
              label="Due Today"
              value={followUpCounts.today}
              color={followUpCounts.today ? 'warning' : 'neutral'}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  queue: 'all',
                  followUp: 'today',
                }))
              }
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

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', mt: 1 }}
          >
            <LeadSummaryChip
              label="Calls"
              value={outcomeStats.calls}
              color={outcomeStats.calls ? 'info' : 'neutral'}
            />
            <LeadSummaryChip
              label="Reached"
              value={outcomeStats.reached}
              color={outcomeStats.reached ? 'success' : 'neutral'}
            />
            <LeadSummaryChip
              label="Converted"
              value={outcomeStats.converted}
              color={outcomeStats.converted ? 'primary' : 'neutral'}
            />
            <LeadSummaryChip
              label="Bad Numbers"
              value={outcomeStats.badNumbers}
              color={outcomeStats.badNumbers ? 'error' : 'neutral'}
            />
            <LeadSummaryChip
              label="Reach Rate"
              value={`${outcomeStats.reachRate}%`}
              color={outcomeStats.reachRate ? 'success' : 'neutral'}
            />
            <LeadSummaryChip
              label="Conversion Rate"
              value={`${outcomeStats.conversionRate}%`}
              color={outcomeStats.conversionRate ? 'primary' : 'neutral'}
            />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {selectedIds.length > 0 && (
            <BulkLeadActions
              selectedCount={selectedIds.length}
              supabase={supabase}
              selectedIds={selectedIds}
              onClear={() => setSelectedIds([])}
              onSaved={() => {
                setSelectedIds([]);
                fetchLeads();
              }}
            />
          )}

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        filteredLeadIds.length > 0 &&
                        selectedVisibleCount === filteredLeadIds.length
                      }
                      indeterminate={
                        selectedVisibleCount > 0 &&
                        selectedVisibleCount < filteredLeadIds.length
                      }
                      onChange={handleSelectAllVisible}
                    />
                  </TableCell>
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
                      selected={selectedIds.includes(lead.id)}
                      onSelect={handleSelectLead(lead.id)}
                      onEdit={setEditingLead}
                      onLogCall={setCallLead}
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
      <QuickLogCallDialog
        open={Boolean(callLead)}
        lead={callLead}
        onClose={() => setCallLead(null)}
        onSaved={() => {
          setCallLead(null);
          fetchLeads();
        }}
        supabase={supabase}
      />
    </Grid>
  );

  function handleFilter(key) {
    return (event) =>
      setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  }
};

function LeadRow({ lead, selected, onSelect, onEdit, onLogCall }) {
  const equipment = lead.equipment_interests || [];
  const primaryEquipment = equipment[0];
  const followUpStatus = leadFollowUpStatus(lead);

  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={onSelect} />
      </TableCell>
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
            lead.import_source || lead.source,
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
          <Typography variant="body2">{prospectName(lead)}</Typography>
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
            lead.company_name ||
            lead.branch ||
            formatPhone(
              lead.mobile_phone ||
                lead.phone ||
                lead.home_phone ||
                lead.contacts?.mobile_phone ||
                lead.contacts?.phone,
            ) ||
            lead.email ||
            lead.contacts?.account_number ||
            lead.contacts?.email ||
            'No company'
          )}
        </Typography>
        {(lead.call_result || lead.visited) && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block' }}
          >
            {[lead.call_result, lead.visited ? 'Visited' : null]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        )}
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
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mt: 0.75 }}
        >
          {lead.latest_call_activity?.occurred_at || lead.last_contacted_at
            ? `Last call ${formatDateTime(
                lead.latest_call_activity?.occurred_at ||
                  lead.last_contacted_at,
              )}`
            : 'Never called'}
        </Typography>
        {lead.latest_call_activity?.body && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 0.5,
              maxWidth: 260,
            }}
          >
            {truncateText(lead.latest_call_activity.body, 90)}
          </Typography>
        )}
        <Chip
          label={leadQueueReason(lead)}
          size="small"
          variant="soft"
          color={leadQueueReasonColor(lead)}
          sx={{ mt: 0.75 }}
        />
      </TableCell>
      <TableCell align="right" sx={{ minWidth: 210 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}
        >
          <Button
            size="small"
            variant="contained"
            startIcon={
              <IconifyIcon icon="material-symbols:add-call-outline-rounded" />
            }
            onClick={() => onLogCall(lead)}
          >
            Call
          </Button>
          <Button
            size="small"
            variant="soft"
            color="neutral"
            startIcon={<IconifyIcon icon="material-symbols:edit-outline" />}
            onClick={() => onEdit(lead)}
          >
            Edit
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function EditLeadDialog({ open, lead, onClose, onSaved, supabase }) {
  const [form, setForm] = useState({
    status: 'not_contacted',
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
      status: lead?.status || 'not_contacted',
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

function QuickLogCallDialog({ open, lead, onClose, onSaved, supabase }) {
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
    if (!lead?.id) return;

    setIsSaving(true);
    setError(null);

    const { data: userResult, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setError('You need to be logged in to log a call.');
      setIsSaving(false);
      return;
    }

    const occurredAt = new Date().toISOString();
    const resultLabel = callResultLabel(form.result);
    const nextFollowUpAt = form.nextFollowUpAt
      ? new Date(form.nextFollowUpAt).toISOString()
      : null;

    const { error: activityError } = await supabase.from('activities').insert({
      owner_id: userResult.user.id,
      lead_id: lead.id,
      contact_id: lead.contacts?.id || null,
      company_id: lead.companies?.id || null,
      type: 'call',
      direction: 'outbound',
      subject: resultLabel,
      body: cleanText(form.notes),
      occurred_at: occurredAt,
      due_at: nextFollowUpAt,
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
        status: leadStatusFromCallResult(form.result, lead.status),
        call_result: resultLabel,
        call_attempt_count: Number(lead.call_attempt_count || 0) + 1,
        last_contacted_at: occurredAt,
        next_follow_up_at: nextFollowUpAt || lead.next_follow_up_at,
      })
      .eq('id', lead.id);

    setIsSaving(false);

    if (leadError) {
      setError(leadError.message);
      return;
    }

    if (form.createTask === 'true' && nextFollowUpAt) {
      const { error: taskError } = await supabase.from('tasks').insert({
        owner_id: userResult.user.id,
        lead_id: lead.id,
        contact_id: lead.contacts?.id || null,
        company_id: lead.companies?.id || null,
        title: `Follow up with ${leadDisplayName(lead)}`,
        body: cleanText(form.notes) || `Previous call result: ${resultLabel}`,
        due_at: nextFollowUpAt,
      });

      if (taskError) {
        setError(taskError.message);
        return;
      }
    }

    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Log Lead Call</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box>
            <Typography variant="subtitle2">
              {lead ? leadDisplayName(lead) : 'Lead'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {lead
                ? [
                    formatPhone(lead.mobile_phone || lead.phone || lead.home_phone),
                    lead.email,
                    lead.branch,
                  ]
                    .filter(Boolean)
                    .join(' - ') || 'No phone or email on this lead'
                : ''}
            </Typography>
          </Box>
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

function BulkLeadActions({
  selectedCount,
  selectedIds,
  supabase,
  onClear,
  onSaved,
}) {
  const [form, setForm] = useState({
    status: '',
    nextFollowUpAt: '',
    branch: '',
    source: '',
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const hasChanges = Boolean(
    form.status || form.nextFollowUpAt || form.branch.trim() || form.source.trim(),
  );

  const handleApply = async () => {
    if (!hasChanges || !selectedIds.length) return;

    const payload = {};
    if (form.status) payload.status = form.status;
    if (form.nextFollowUpAt) {
      payload.next_follow_up_at = new Date(form.nextFollowUpAt).toISOString();
    }
    if (form.branch.trim()) payload.branch = cleanText(form.branch);
    if (form.source.trim()) payload.source = cleanText(form.source);

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('leads')
      .update(payload)
      .in('id', selectedIds);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setForm({ status: '', nextFollowUpAt: '', branch: '', source: '' });
    onSaved();
  };

  const applyStatusPreset = (status) => {
    setForm((prev) => ({ ...prev, status }));
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;

    setIsSaving(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .in('id', selectedIds);

    setIsSaving(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setDeleteOpen(false);
    onSaved();
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{ mt: 3, p: 2, borderColor: 'primary.light' }}
      >
        <Stack direction="column" spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
            }}
          >
            <Box>
              <Typography variant="subtitle2">
                {selectedCount} selected lead{selectedCount === 1 ? '' : 's'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Apply only the fields you fill in.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button color="neutral" variant="soft" onClick={onClear}>
                Clear
              </Button>
              <Button
                variant="soft"
                color="error"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                disabled={!hasChanges}
                loading={isSaving}
                onClick={handleApply}
              >
                Apply
              </Button>
            </Stack>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="soft"
              color="error"
              onClick={() => applyStatusPreset('not_a_fit')}
            >
              Close as Not a Fit
            </Button>
            <Button
              size="small"
              variant="soft"
              color="error"
              onClick={() => applyStatusPreset('bad_number')}
            >
              Mark Bad Number
            </Button>
            <Button
              size="small"
              variant="soft"
              color="error"
              onClick={() => applyStatusPreset('do_not_contact')}
            >
              Mark Do Not Contact
            </Button>
            <Button
              size="small"
              variant="soft"
              color="info"
              onClick={() => applyStatusPreset('attempted')}
            >
              Mark Attempted
            </Button>
          </Stack>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={handleField(setForm, 'status')}
              sx={{ minWidth: { lg: 220 } }}
            >
              <MenuItem value="">Do not change</MenuItem>
              {leadStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatLeadStatus(status)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Next Follow-up"
              type="datetime-local"
              value={form.nextFollowUpAt}
              onChange={handleField(setForm, 'nextFollowUpAt')}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { lg: 240 } }}
            />
            <TextField
              label="Branch"
              value={form.branch}
              onChange={handleField(setForm, 'branch')}
              sx={{ minWidth: { lg: 180 } }}
            />
            <TextField
              label="Lead Source"
              value={form.source}
              onChange={handleField(setForm, 'source')}
              sx={{ minWidth: { lg: 220 } }}
            />
          </Stack>
        </Stack>
      </Paper>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Selected Leads?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will permanently delete {selectedCount} selected lead
            {selectedCount === 1 ? '' : 's'}. Lead activities, notes, files,
            equipment interests, and tasks will be removed with them. Any deals
            linked to these leads will stay, but their lead link will be
            cleared.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="neutral" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" loading={isSaving} onClick={handleDelete}>
            Delete Leads
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
      <TableCell colSpan={7}>
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

function LeadSummaryChip({ label, value, color, onClick }) {
  return (
    <Chip
      label={`${label}: ${value}`}
      size="small"
      variant="soft"
      color={color}
      onClick={onClick}
      sx={onClick ? { cursor: 'pointer' } : undefined}
    />
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

async function fetchLatestCallsByLead(supabase, leads) {
  const leadIds = leads.map((lead) => lead.id).filter(Boolean);
  if (!leadIds.length) return new Map();

  const { data, error } = await supabase
    .from('activities')
    .select('id, lead_id, subject, body, occurred_at')
    .in('lead_id', leadIds)
    .eq('type', 'call')
    .order('occurred_at', { ascending: false })
    .limit(500);

  if (error) return new Map();

  return (data || []).reduce((latestByLead, activity) => {
    if (activity.lead_id && !latestByLead.has(activity.lead_id)) {
      latestByLead.set(activity.lead_id, activity);
    }
    return latestByLead;
  }, new Map());
}

const followUpPresets = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '30 Days', days: 30 },
];

function handleField(setForm, key) {
  return (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
}

function cleanText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function truncateText(value, maxLength) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
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
    prospectName(lead) ||
    (lead.account_number ? `Account ${lead.account_number}` : '') ||
    lead.source ||
    'Lead'
  );
}

function prospectName(lead) {
  return (
    [lead?.first_name, lead?.last_name].filter(Boolean).join(' ') ||
    lead?.company_name ||
    ''
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
  if (['contacted', 'relationship_started', 'qualified'].includes(status))
    return 'success';
  if (['attempted', 'working'].includes(status)) return 'info';
  if (status === 'converted') return 'primary';
  if (['not_a_fit', 'bad_number', 'do_not_contact', 'unqualified'].includes(status))
    return 'error';
  return 'neutral';
}

function leadMatchesQueueFilter(lead, filter) {
  if (filter === 'all') return true;
  if (filter === 'converted') return lead.status === 'converted';
  if (filter === 'closed') return isClosedLeadStatus(lead.status);
  if (filter === 'called') return Boolean(lead.last_contacted_at);
  if (filter === 'needs_call') {
    return (
      !isInactiveLeadStatus(lead.status) &&
      (!lead.last_contacted_at ||
        ['overdue', 'today'].includes(leadFollowUpStatus(lead)))
    );
  }
  return !isInactiveLeadStatus(lead.status);
}

function isClosedLeadStatus(status) {
  return ['not_a_fit', 'bad_number', 'do_not_contact', 'unqualified'].includes(
    status,
  );
}

function isInactiveLeadStatus(status) {
  return status === 'converted' || isClosedLeadStatus(status);
}

function leadQueueCounts(leads) {
  return leads.reduce(
    (counts, lead) => {
      if (leadMatchesQueueFilter(lead, 'active')) counts.active += 1;
      if (leadMatchesQueueFilter(lead, 'needs_call')) counts.needsCall += 1;
      if (leadMatchesQueueFilter(lead, 'called')) counts.called += 1;
      if (leadMatchesQueueFilter(lead, 'converted')) counts.converted += 1;
      if (leadMatchesQueueFilter(lead, 'closed')) counts.closed += 1;
      return counts;
    },
    { active: 0, needsCall: 0, called: 0, converted: 0, closed: 0 },
  );
}

function leadOutcomeStats(leads) {
  const stats = leads.reduce(
    (totals, lead) => {
      const attempts = Number(lead.call_attempt_count || 0);
      totals.calls += attempts;
      if (['Contacted', 'Interested'].includes(lead.call_result)) {
        totals.reached += 1;
      }
      if (lead.status === 'converted') totals.converted += 1;
      if (lead.status === 'bad_number' || lead.call_result === 'Bad Number') {
        totals.badNumbers += 1;
      }
      return totals;
    },
    { calls: 0, reached: 0, converted: 0, badNumbers: 0 },
  );

  const workedLeads = leads.filter(
    (lead) => Number(lead.call_attempt_count || 0) > 0 || lead.last_contacted_at,
  ).length;

  return {
    ...stats,
    reachRate: workedLeads ? Math.round((stats.reached / workedLeads) * 100) : 0,
    conversionRate: leads.length
      ? Math.round((stats.converted / leads.length) * 100)
      : 0,
  };
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

function sortLeadsForQueue(leads, sort) {
  return [...leads].sort((a, b) => {
    if (sort === 'follow_up') {
      return compareNullableDates(a.next_follow_up_at, b.next_follow_up_at);
    }

    if (sort === 'lead_priority') {
      return (
        Number(a.priority || 999) - Number(b.priority || 999) ||
        compareNullableDates(a.next_follow_up_at, b.next_follow_up_at) ||
        compareNewest(a, b)
      );
    }

    if (sort === 'newest') return compareNewest(a, b);
    if (sort === 'oldest') return compareOldest(a, b);

    return (
      leadCallPriorityScore(a) - leadCallPriorityScore(b) ||
      compareNullableDates(a.next_follow_up_at, b.next_follow_up_at) ||
      Number(a.priority || 999) - Number(b.priority || 999) ||
      compareOldest(a, b)
    );
  });
}

function leadCallPriorityScore(lead) {
  if (isInactiveLeadStatus(lead.status)) return 90;
  const followUpStatus = leadFollowUpStatus(lead);
  if (followUpStatus === 'overdue') return 0;
  if (followUpStatus === 'today') return 1;
  if (!lead.last_contacted_at) return 2;
  if (followUpStatus === 'upcoming') return 3;
  if (lead.status === 'attempted') return 4;
  return 5;
}

function leadQueueReason(lead) {
  if (isClosedLeadStatus(lead.status)) return 'Closed out';
  if (lead.status === 'converted') return 'Converted';

  const followUpStatus = leadFollowUpStatus(lead);
  if (followUpStatus === 'overdue') return 'Call overdue';
  if (followUpStatus === 'today') return 'Call today';
  if (!lead.last_contacted_at) return 'First call';
  if (followUpStatus === 'upcoming') return 'Scheduled';
  if (lead.status === 'attempted') return 'Retry';
  return 'Active';
}

function leadQueueReasonColor(lead) {
  const reason = leadQueueReason(lead);
  if (reason === 'Call overdue') return 'error';
  if (reason === 'Call today') return 'warning';
  if (reason === 'First call') return 'primary';
  if (reason === 'Scheduled') return 'info';
  if (['Closed out', 'Converted'].includes(reason)) return 'neutral';
  return 'success';
}

function compareNullableDates(a, b) {
  const aTime = dateTimeValue(a);
  const bTime = dateTimeValue(b);
  if (aTime === null && bTime === null) return 0;
  if (aTime === null) return 1;
  if (bTime === null) return -1;
  return aTime - bTime;
}

function compareNewest(a, b) {
  return dateTimeValue(b.created_at) - dateTimeValue(a.created_at);
}

function compareOldest(a, b) {
  return dateTimeValue(a.created_at) - dateTimeValue(b.created_at);
}

function dateTimeValue(value) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
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

function toPresetDateTimeLocal(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return toDateTimeLocal(date.toISOString());
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
