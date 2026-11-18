import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import paths from 'routes/paths';
import { addTarget, methods } from './gameplanData';

export default function AddToGameplanDialog({ record, supabase, days, daysError, loading, selectedDate, onClose, onSaved }) {
  const [date, setDate] = useState('');
  const [method, setMethod] = useState('Visit');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const day = date || (days.includes(selectedDate) ? selectedDate : days[0]) || '';

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const { error } = await addTarget(supabase, day, {
        [`${record.kind}_id`]: record.id.slice(record.kind.length + 1),
        method,
      });
      if (error) throw error;
      await onSaved(day);
      onClose();
    } catch (error) {
      setError(error.code === '23505' ? 'This activity is already on that gameplan.' : error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add to gameplan</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <Typography>{record.title}</Typography>
          {(error || daysError) && <Alert severity="error">{error || daysError}</Alert>}
          {loading && <Typography role="status">Loading saved plans…</Typography>}
          {!loading && !daysError && !days.length && (
            <Alert severity="info" action={<Button href={paths.crmGameplan}>Open planner</Button>}>
              Create a gameplan first.
            </Alert>
          )}
          {days.length > 0 && <>
            <TextField select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} fullWidth label="Gameplan date" value={day} onChange={(event) => setDate(event.target.value)}>
              {days.map((value) => <option key={value} value={value}>{value}</option>)}
            </TextField>
            <TextField select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} fullWidth label="Activity" value={method} onChange={(event) => setMethod(event.target.value)}>
              {methods.map((value) => <option key={value} value={value}>{value}</option>)}
            </TextField>
          </>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={busy || !day || Boolean(daysError)} onClick={save}>Add target</Button>
      </DialogActions>
    </Dialog>
  );
}

