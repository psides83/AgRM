'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

function AddTaskDialog({
  open,
  record,
  recordType,
  onClose,
  onSaved,
  supabase,
}) {
  const [form, setForm] = useState({
    subject: '',
    body: '',
    dueAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        subject: '',
        body: '',
        dueAt: '',
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const { data: userResult, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userResult.user) {
      setIsSaving(false);
      setError(userError?.message || 'Could not confirm the signed-in user.');
      return;
    }

    const task = {
      owner_id: userResult.user.id,
      title: cleanText(form.subject) || 'Task',
      body: preserveText(form.body),
      due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      completed_at: null,
    };

    if (recordType === 'lead') {
      task.lead_id = record.id;
      task.contact_id = record.contact_id || null;
      task.company_id = record.company_id || null;
    } else {
      task.contact_id = record.id;
      task.company_id = record.company_id || null;
    }

    const { error: saveError } = await supabase.from('tasks').insert(task);
    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Task"
            value={form.subject}
            onChange={handleChange('subject')}
            fullWidth
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
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Save Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function cleanText(value) {
  return value?.trim() || null;
}

function preserveText(value) {
  const text = value?.trimEnd();
  return text ? text : null;
}

export default AddTaskDialog;
