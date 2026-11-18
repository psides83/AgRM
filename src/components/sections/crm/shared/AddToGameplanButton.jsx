'use client';

import { useMemo, useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { createClient } from 'lib/supabase/client';
import AddToGameplanDialog from '../map/AddToGameplanDialog';
import { localDay, useGameplanDays } from '../map/gameplanData';

export default function AddToGameplanButton({ kind, id, title }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>Add to gameplan</Button>
      {open && <GameplanPicker record={{ kind, id: `${kind}-${id}`, title }}
        onClose={() => setOpen(false)} onSaved={(day) => setMessage(`Added to the ${day} gameplan.`)} />}
      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage('')}>
        <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>
      </Snackbar>
    </>
  );
}

function GameplanPicker({ record, onClose, onSaved }) {
  const supabase = useMemo(() => createClient(), []);
  const { days, error, loading } = useGameplanDays(supabase);

  return <AddToGameplanDialog record={record} supabase={supabase} days={days}
    daysError={error} loading={loading} selectedDate={localDay()} onClose={onClose} onSaved={onSaved} />;
}
