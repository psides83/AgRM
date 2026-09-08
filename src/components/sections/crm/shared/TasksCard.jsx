'use client';

import {
  Box,
  Checkbox,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

function TasksCard({ tasks, supabase, onSaved }) {
  const handleComplete = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', taskId);

    if (!error) onSaved();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!!a.completed_at !== !!b.completed_at) return a.completed_at ? 1 : -1;
    if (a.due_at && b.due_at) return new Date(a.due_at) - new Date(b.due_at);
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <IconifyIcon
          icon="material-symbols:task-alt-rounded"
          sx={{ color: 'text.secondary', fontSize: 22 }}
        />
        <Typography variant="h6">Tasks</Typography>
      </Stack>

      <Stack direction="column" divider={<Divider flexItem />} spacing={2}>
        {sortedTasks.length ? (
          sortedTasks.map((task) => (
            <Stack
              key={task.id}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'flex-start' }}
            >
              <Checkbox
                checked={!!task.completed_at}
                disabled={!!task.completed_at}
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
                  <Typography
                    variant="subtitle2"
                    sx={{
                      textDecoration: task.completed_at
                        ? 'line-through'
                        : 'none',
                      color: task.completed_at
                        ? 'text.secondary'
                        : 'text.primary',
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.completed_at && (
                    <Chip
                      size="small"
                      label="Complete"
                      color="success"
                      variant="soft"
                    />
                  )}
                  {task.due_at && !task.completed_at && (
                    <Chip
                      size="small"
                      label={`Due ${formatDateTime(task.due_at)}`}
                      color={isPastDue(task.due_at) ? 'error' : 'primary'}
                      variant="soft"
                    />
                  )}
                </Stack>
                {task.body && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {task.body}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No tasks yet.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
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

export default TasksCard;
