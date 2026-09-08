'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';

function OpenTasksPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        body,
        due_at,
        created_at,
        contact_id,
        company_id,
        lead_id,
        contacts(id, first_name, last_name),
        companies(id, name),
        leads(id, source, contacts(id, first_name, last_name), companies(id, name))
      `,
      )
      .is('completed_at', null)
      .order('due_at', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(12);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setError(null);
    setTasks(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('crm-dashboard-open-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        fetchTasks,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, supabase]);

  const handleComplete = async (taskId) => {
    setLoadingId(taskId);
    const { error: saveError } = await supabase
      .from('tasks')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', taskId);

    setLoadingId(null);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <SectionTitle
        title="Open tasks"
        icon="material-symbols:task-alt-rounded"
      />
      <Stack direction="column" spacing={1.5}>
        {error && <Alert severity="error">{error}</Alert>}
        {tasks.length ? (
          tasks.map((task) => (
            <Stack
              key={task.id}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'flex-start',
                py: 1.25,
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 0 },
              }}
            >
              <Checkbox
                checked={false}
                disabled={loadingId === task.id}
                onChange={() => handleComplete(task.id)}
                sx={{ p: 0.25, mt: 0.25 }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.25 }}
                >
                  <Link
                    href={taskHref(task)}
                    underline="hover"
                    sx={{ color: 'text.primary', fontWeight: 700 }}
                  >
                    {task.title || 'Task'}
                  </Link>
                  {task.due_at && (
                    <Chip
                      size="small"
                      label={`Due ${formatDateTime(task.due_at)}`}
                      color={isPastDue(task.due_at) ? 'error' : 'primary'}
                      variant="soft"
                    />
                  )}
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}
                >
                  {taskEntityName(task)}
                  {task.body ? ` - ${truncate(task.body, 110)}` : ''}
                </Typography>
              </Box>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No open tasks.
          </Typography>
        )}
      </Stack>
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

function taskEntityName(task) {
  const leadName = task.leads ? entityName(task.leads) : '';
  const contactName = task.contacts
    ? entityName({ contacts: task.contacts })
    : '';

  return leadName || contactName || task.companies?.name || 'CRM record';
}

function entityName(record) {
  const contact = record.contacts
    ? [record.contacts.first_name, record.contacts.last_name]
        .filter(Boolean)
        .join(' ')
    : '';

  return contact || record.companies?.name || record.name || 'CRM record';
}

function taskHref(task) {
  if (task.lead_id) return paths.leadDetails(task.lead_id);
  if (task.contact_id) return paths.contactDetails(task.contact_id);
  if (task.company_id) return paths.companyDetails(task.company_id);
  return paths.crmRoot;
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

function isPastDue(value) {
  return value ? new Date(value).getTime() < Date.now() : false;
}

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) return value || '';
  return `${value.slice(0, maxLength - 1)}...`;
}

export default OpenTasksPanel;
