'use client';

import useListState from 'hooks/useListState';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TablePagination,
  TextField,
} from '@mui/material';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import TasksCard from 'components/sections/crm/shared/TasksCard';
import { createClient } from 'lib/supabase/client';
import paths from 'routes/paths';

const pageSize = 25;

const sortOptions = {
  dueFirst: {
    label: 'Due date (earliest first)',
    column: 'due_at',
    ascending: true,
  },
  dueLast: {
    label: 'Due date (latest first)',
    column: 'due_at',
    ascending: false,
  },
  newest: { label: 'Newest created', column: 'created_at', ascending: false },
  oldest: { label: 'Oldest created', column: 'created_at', ascending: true },
  title: { label: 'Title (A–Z)', column: 'title', ascending: true },
};

function getRelatedRecord(task) {
  const contact = task.leads?.contacts ?? task.contacts;
  const name =
    [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') ||
    task.leads?.companies?.name ||
    task.companies?.name;

  if (task.lead_id)
    return { href: paths.leadDetails(task.lead_id), name: name || 'View lead' };
  if (task.contact_id)
    return {
      href: paths.contactDetails(task.contact_id),
      name: name || 'View contact',
    };
  if (task.company_id)
    return {
      href: paths.companyDetails(task.company_id),
      name: name || 'View company',
    };
  return null;
}

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), []);
  const [filters, setFilters] = useListState('crm/tasks/index:filters', {
    search: '',
    status: 'open',
    sort: 'dueFirst',
  });
  const [page, setPage] = useListState('crm/tasks/index:page', 0);
  const [result, setResult] = useState({ tasks: [], count: 0, error: null });
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  const changeFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    setPage(0);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadTasks = async () => {
      const { column, ascending } = sortOptions[filters.sort];
      const search = filters.search.trim();
      let query = supabase
        .from('tasks')
        .select(
          `
          id, title, body, due_at, completed_at, created_at, contact_id, company_id, lead_id,
          contacts(first_name, last_name), companies(name),
          leads(contacts(first_name, last_name), companies(name))
        `,
          { count: 'exact' },
        )
        .order(column, { ascending, nullsFirst: false })
        .order('id')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filters.status === 'completed')
        query = query.not('completed_at', 'is', null);
      if (filters.status === 'open' || filters.status === 'overdue') {
        query = query.is('completed_at', null);
      }
      if (filters.status === 'overdue')
        query = query.lt('due_at', new Date().toISOString());
      if (search)
        query = query.ilike('title', `%${search.replace(/[\\%_]/g, '\\$&')}%`);

      const { data, count, error } = await query;
      if (!active) return;

      const lastPage = Math.max(0, Math.ceil((count ?? 0) / pageSize) - 1);
      if (count !== null && page > lastPage) {
        setPage(lastPage);
        return;
      }

      setResult({
        tasks: data ?? [],
        count: count ?? 0,
        error: error?.message,
      });
      setLoading(false);
    };

    const timeout = setTimeout(loadTasks, 200);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [filters, page, revision, supabase]);

  return (
    <Stack direction="column" spacing={3}>
      <PageHeader
        title="Tasks"
        breadcrumb={[
          { label: 'Home', url: paths.crm },
          { label: 'Tasks', active: true },
        ]}
      />
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction="column" spacing={2}>
          <TextField
            label="Search by task title"
            value={filters.search}
            onChange={changeFilter('search')}
            fullWidth
          />
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            }}
          >
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={changeFilter('status')}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="all">All tasks</MenuItem>
            </TextField>
            <TextField
              select
              label="Sort by"
              value={filters.sort}
              onChange={changeFilter('sort')}
            >
              {Object.entries(sortOptions).map(([value, { label }]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </Paper>

      {loading && <LinearProgress aria-label="Loading tasks" />}
      {!loading && result.error && (
        <Alert severity="error">{result.error}</Alert>
      )}
      <Box hidden={loading || Boolean(result.error)}>
        <TasksCard
          tasks={result.tasks}
          supabase={supabase}
          onSaved={() => setRevision((current) => current + 1)}
          preserveOrder
          getRelatedRecord={getRelatedRecord}
          emptyMessage="No tasks match your filters."
        />
        {result.count > pageSize && (
          <TablePagination
            component="div"
            count={result.count}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
          />
        )}
      </Box>
    </Stack>
  );
}
