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
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import {
  activityDirections,
  activityTypes,
} from 'components/sections/crm/constants';

const emptyFilters = {
  search: '',
  type: 'all',
  direction: 'all',
  status: 'open',
};

const emptyExportRange = {
  startDate: '',
  endDate: '',
};

const ActivitiesPage = () => {
  const supabase = useMemo(() => createClient(), []);
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [exportRange, setExportRange] = useState(emptyExportRange);
  const [sort, setSort] = useState({ key: 'date', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    setError(null);

    const { data, error: queryError } = await supabase
      .from('activities')
      .select(
        `
        id,
        contact_id,
        company_id,
        lead_id,
        deal_id,
        type,
        direction,
        subject,
        body,
        occurred_at,
        due_at,
        completed_at,
        created_at,
        contacts(id, first_name, last_name, city, region, companies(id, name)),
        companies(id, name, city, region),
        leads(id, source, status, contacts(id, first_name, last_name, city, region), companies(id, name, city, region)),
        deals(id, name, stage, contacts(id, first_name, last_name, city, region), companies(id, name, city, region))
      `,
      )
      .order('occurred_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setActivities(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('agrm-activities-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => fetchActivities(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredActivities = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return activities.filter((activity) => {
      const text = [
        activity.type,
        activity.direction,
        activity.subject,
        activity.body,
        recordLabel(activity),
        companyLabel(activity),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!search || text.includes(search)) &&
        (filters.type === 'all' || activity.type === filters.type) &&
        (filters.direction === 'all' ||
          activity.direction === filters.direction) &&
        (filters.status === 'all' ||
          (filters.status === 'open' && !activity.completed_at) ||
          (filters.status === 'complete' && activity.completed_at) ||
          (filters.status === 'overdue' &&
            !activity.completed_at &&
            activity.due_at &&
            new Date(activity.due_at) < new Date()))
      );
    });
  }, [activities, filters]);

  const sortedActivities = useMemo(
    () => [...filteredActivities].sort((a, b) => compareActivities(a, b, sort)),
    [filteredActivities, sort],
  );

  const handleFilter = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleExportRange = (key) => (event) => {
    setExportRange((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleComplete = async (activityId) => {
    const { error: updateError } = await supabase
      .from('activities')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activityId);

    if (updateError) {
      setError(updateError.message);
    } else {
      fetchActivities();
    }
  };

  const handleExport = () => {
    const exportRows = activities
      .filter((activity) => activityInExportRange(activity, exportRange))
      .sort((a, b) => dateValue(activityDate(a)) - dateValue(activityDate(b)));

    if (!exportRows.length) {
      setError('No activities found for that export date range.');
      return;
    }

    downloadCsv(
      `activities-${exportRange.startDate || 'all'}-${exportRange.endDate || 'all'}.csv`,
      activityExportCsv(exportRows),
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Activities"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Activities', active: true },
          ]}
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', xl: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h6">Activity list</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {filteredActivities.length} shown from {activities.length} total
                activit{activities.length === 1 ? 'y' : 'ies'}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                value={filters.search}
                onChange={handleFilter('search')}
                placeholder="Search activities, contacts, companies..."
                sx={{ width: { xs: 1, md: 360 } }}
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
              <FilterSelect
                label="Type"
                value={filters.type}
                onChange={handleFilter('type')}
                options={activityTypes}
              />
              <FilterSelect
                label="Direction"
                value={filters.direction}
                onChange={handleFilter('direction')}
                options={activityDirections}
              />
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={handleFilter('status')}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { md: 'center' } }}
            >
              <Box sx={{ minWidth: { md: 220 }, flexGrow: 1 }}>
                <Typography variant="subtitle2">Export CSV</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Date, Company, Contact, Location, Notes
                </Typography>
              </Box>
              <TextField
                label="Start Date"
                type="date"
                value={exportRange.startDate}
                onChange={handleExportRange('startDate')}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="End Date"
                type="date"
                value={exportRange.endDate}
                onChange={handleExportRange('endDate')}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 160 }}
              />
              <Button
                variant="contained"
                onClick={handleExport}
                startIcon={
                  <IconifyIcon icon="material-symbols:download-rounded" />
                }
              >
                Export CSV
              </Button>
            </Stack>
          </Paper>

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <SortableHeader
                    label="Activity"
                    sortKey="activity"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Linked To"
                    sortKey="linkedTo"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Direction"
                    sortKey="direction"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Dates"
                    sortKey="date"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading activities..." />
                ) : sortedActivities.length ? (
                  sortedActivities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      onComplete={handleComplete}
                    />
                  ))
                ) : (
                  <EmptyRow label="No activities match these filters" />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

function ActivityRow({ activity, onComplete }) {
  const href = recordHref(activity);
  const isComplete = Boolean(activity.completed_at);
  const isOverdue =
    !isComplete && activity.due_at && new Date(activity.due_at) < new Date();

  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 300 }}>
        <Stack spacing={0.75} alignItems="flex-start">
          <Chip
            label={formatEnum(activity.type)}
            size="small"
            variant="soft"
            color={activityTypeColor(activity.type)}
          />
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {activity.subject || formatEnum(activity.type)}
          </Typography>
          {activity.body && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {activity.body}
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        {href ? (
          <Link
            href={href}
            underline="hover"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {recordLabel(activity)}
          </Link>
        ) : (
          <Typography variant="body2">{recordLabel(activity)}</Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {companyLabel(activity) || '-'}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 130 }}>
        <Typography variant="body2">
          {formatEnum(activity.direction) || '-'}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 190 }}>
        <Typography variant="body2">
          {formatDateTime(activity.occurred_at || activity.created_at)}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: isOverdue ? 'error.main' : 'text.secondary' }}
        >
          {activity.due_at
            ? `Due ${formatDateTime(activity.due_at)}`
            : 'No due date'}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <Stack spacing={1} alignItems="flex-start">
          <Chip
            label={isComplete ? 'Complete' : isOverdue ? 'Overdue' : 'Open'}
            size="small"
            variant="soft"
            color={isComplete ? 'success' : isOverdue ? 'error' : 'neutral'}
          />
          {!isComplete && (
            <Button
              size="small"
              variant="soft"
              color="success"
              onClick={() => onComplete(activity.id)}
            >
              Complete
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={onChange}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="all">All</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {formatEnum(option)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function EmptyRow({ label }) {
  return (
    <TableRow>
      <TableCell colSpan={5}>
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

function SortableHeader({ label, sortKey, activeSort, onSort }) {
  return (
    <TableCell
      sortDirection={activeSort.key === sortKey ? activeSort.direction : false}
    >
      <TableSortLabel
        active={activeSort.key === sortKey}
        direction={activeSort.key === sortKey ? activeSort.direction : 'asc'}
        onClick={() => onSort(sortKey)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function compareActivities(a, b, sort) {
  const direction = sort.direction === 'asc' ? 1 : -1;
  const aValue = activitySortValue(a, sort.key);
  const bValue = activitySortValue(b, sort.key);

  if (sort.key === 'date') {
    return (dateValue(aValue) - dateValue(bValue)) * direction;
  }

  if (sort.key === 'status') {
    return (Number(aValue) - Number(bValue)) * direction;
  }

  return (
    String(aValue || '').localeCompare(String(bValue || ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    }) * direction
  );
}

function activitySortValue(activity, key) {
  if (key === 'activity') {
    return [activity.type, activity.subject].filter(Boolean).join(' ');
  }
  if (key === 'linkedTo') {
    return [recordLabel(activity), companyLabel(activity)]
      .filter(Boolean)
      .join(' ');
  }
  if (key === 'direction') return activity.direction;
  if (key === 'date') return activityDate(activity);
  if (key === 'status') return activityStatusRank(activity);
  return activityDate(activity);
}

function activityStatusRank(activity) {
  if (activity.completed_at) return 3;
  if (activity.due_at && new Date(activity.due_at) < new Date()) return 1;
  return 2;
}

function dateValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function activityInExportRange(activity, range) {
  const date = activityDate(activity);
  if (!date) return false;

  const activityDay = new Date(date);
  const start = range.startDate ? startOfDay(range.startDate) : null;
  const end = range.endDate ? endOfDay(range.endDate) : null;

  return (!start || activityDay >= start) && (!end || activityDay <= end);
}

function activityDate(activity) {
  return activity.occurred_at || activity.created_at;
}

function startOfDay(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfDay(value) {
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function activityExportCsv(activities) {
  const headers = ['Date', 'Company', 'Contact', 'Location', 'Notes'];
  const rows = activities.map((activity) => [
    formatExportDate(activityDate(activity)),
    companyLabel(activity),
    exportContactName(activity),
    exportLocation(activity),
    exportNotes(activity),
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

function csvCell(value) {
  const text = String(value || '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatExportDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function exportContactName(activity) {
  return (
    contactName(activity.contacts) ||
    contactName(activity.leads?.contacts) ||
    contactName(activity.deals?.contacts) ||
    ''
  );
}

function exportLocation(activity) {
  const contactLocation =
    locationText(activity.contacts) ||
    locationText(activity.leads?.contacts) ||
    locationText(activity.deals?.contacts);
  const companyLocation =
    locationText(activity.companies) ||
    locationText(activity.leads?.companies) ||
    locationText(activity.deals?.companies) ||
    locationText(activity.contacts?.companies);

  return contactLocation || companyLocation || '';
}

function locationText(record) {
  return [record?.city, record?.region].filter(Boolean).join(', ');
}

function exportNotes(activity) {
  return [activity.subject, activity.body].filter(Boolean).join('\n\n');
}

function recordHref(activity) {
  if (activity.deal_id) return paths.dealDetails(activity.deal_id);
  if (activity.lead_id) return paths.leadDetails(activity.lead_id);
  if (activity.contact_id) return paths.contactDetails(activity.contact_id);
  if (activity.company_id) return paths.companyDetails(activity.company_id);
  return null;
}

function recordLabel(activity) {
  if (activity.deals) return activity.deals.name;
  if (activity.leads) {
    return (
      activity.leads.source ||
      contactName(activity.leads.contacts) ||
      activity.leads.companies?.name ||
      'Lead'
    );
  }
  if (activity.contacts) return contactName(activity.contacts);
  if (activity.companies) return activity.companies.name;
  return 'CRM record';
}

function companyLabel(activity) {
  return (
    activity.companies?.name ||
    activity.deals?.companies?.name ||
    activity.leads?.companies?.name ||
    activity.contacts?.companies?.name ||
    ''
  );
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ');
}

function activityTypeColor(type) {
  if (type === 'call' || type === 'text' || type === 'email') return 'info';
  if (type === 'task') return 'warning';
  if (type === 'quote' || type === 'demo') return 'success';
  return 'neutral';
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
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default ActivitiesPage;
