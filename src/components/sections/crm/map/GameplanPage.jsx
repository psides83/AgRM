'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import { createClient } from 'lib/supabase/client';
import paths from 'routes/paths';
import Gameplan from './Gameplan';
import { fetchGameplanTargets, createGameplan, localDay, useGameplanDays } from './gameplanData';
import { fetchMapRecords } from './records';

export default function GameplanPage() {
  const supabase = useMemo(() => createClient(), []);
  const { days, error: daysError, loading, reload } = useGameplanDays(supabase);
  const [newDate, setNewDate] = useState(localDay);
  const [selectedDate, selectDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [records, setRecords] = useState([]);
  const [recordsError, setRecordsError] = useState('');

  const date = selectedDate || (days.includes(newDate) ? newDate : days[0]) || '';

  useEffect(() => {
    let active = true;
    fetchMapRecords(supabase).then(
      (data) => { if (active) setRecords(data); },
      (error) => { if (active) setRecordsError(error.message); },
    );
    return () => { active = false; };
  }, [supabase]);

  async function create() {
    setSaving(true);
    setSaveError('');
    try {
      const { error } = await createGameplan(supabase, newDate);
      if (error) throw error;
      await reload();
      selectDate(newDate);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Daily Gameplan" breadcrumb={[{ label: 'Home', url: paths.crm }, { label: 'Daily Gameplan', active: true }]}
          actionComponent={<Button variant="outlined" href={date ? `${paths.crmMap}?gameplan=${date}` : paths.crmMap}>Open map</Button>} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2.5, display: 'grid', gap: 2 }}>
          <Typography variant="h6">Your plans</Typography>
          {(daysError || saveError) && <Alert severity="error">{daysError || saveError}</Alert>}
          {days.length > 0 && (
            <TextField select fullWidth label="Saved gameplan" value={days.includes(date) ? date : ''} onChange={(event) => selectDate(event.target.value)}>
              {days.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
            </TextField>
          )}
          <TextField fullWidth type="date" label="Plan date" value={newDate}
            onChange={(event) => setNewDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Button variant="contained" disabled={!newDate || saving || loading} onClick={create}>
            {days.includes(newDate) ? 'Open gameplan' : 'Create gameplan'}
          </Button>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper>
          {recordsError && <Alert severity="error">{recordsError}</Alert>}
          {date ? <Plan key={date} date={date} supabase={supabase} records={records} onDaysChange={reload} /> :
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">{loading ? 'Loading gameplans…' : 'Choose a day to get started'}</Typography>
              <Typography color="text.secondary">Create a plan to organize your visits, calls, and emails.</Typography>
            </Box>}
        </Paper>
      </Grid>
    </Grid>
  );
}

function Plan({ date, supabase, records, onDaysChange }) {
  const [result, setResult] = useState(null);

  const reload = useMemo(() => async () => {
    const { data, error } = await fetchGameplanTargets(supabase, date);
    setResult({ targets: data || [], error: error?.message });
  }, [date, supabase]);

  useEffect(() => { reload(); }, [reload]);

  return <Gameplan date={date} supabase={supabase} records={records} targets={result?.targets || []}
    loading={!result} loadError={result?.error} onChange={reload} onDaysChange={onDaysChange} />;
}
