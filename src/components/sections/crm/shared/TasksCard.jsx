'use client';

import { useEffect, useState } from 'react';
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
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

function TasksCard({ tasks, supabase, onSaved }) {
  const [editingTask, setEditingTask] = useState(null);

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
              <Tooltip title="Edit task">
                <IconButton
                  size="small"
                  aria-label={`Edit ${task.title}`}
                  onClick={() => setEditingTask(task)}
                >
                  <IconifyIcon icon="material-symbols:edit-outline" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No tasks yet.
          </Typography>
        )}
      </Stack>

      <EditTaskDialog
        open={Boolean(editingTask)}
        task={editingTask}
        supabase={supabase}
        onClose={() => setEditingTask(null)}
        onSaved={() => {
          setEditingTask(null);
          onSaved();
        }}
      />
    </Paper>
  );
}

function EditTaskDialog({ open, task, supabase, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', body: '', dueAt: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !task) return;

    setForm({
      title: task.title || '',
      body: task.body || '',
      dueAt: toDateTimeLocal(task.due_at),
    });
    setError(null);
  }, [open, task]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async () => {
    if (!task?.id) return;

    setIsSaving(true);
    setError(null);

    const { error: saveError } = await supabase
      .from('tasks')
      .update({
        title: cleanText(form.title) || 'Task',
        body: preserveText(form.body),
        due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      })
      .eq('id', task.id);

    setIsSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }

    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Task"
            value={form.title}
            onChange={handleChange('title')}
            fullWidth
            autoFocus
          />
          <TextField
            label="Details"
            value={form.body}
            onChange={handleChange('body')}
            fullWidth
            multiline
            rows={4}
          />
          <TextField
            label="Due At"
            type="datetime-local"
            value={form.dueAt}
            onChange={handleChange('dueAt')}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Task
        </Button>
      </DialogActions>
    </Dialog>
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

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function cleanText(value) {
  return value?.trim() || null;
}

function preserveText(value) {
  const text = value?.trimEnd();
  return text ? text : null;
}

export default TasksCard;
