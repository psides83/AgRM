'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material';
import { dealStages } from 'components/sections/crm/constants';
import paths from 'routes/paths';

export default function EquipmentDealDialog({
  supabase, contactId, leadId = null, items, deals = [], onClose,
}) {
  const router = useRouter();
  const item = items.length === 1 ? items[0] : null;
  const [name, setName] = useState(item
    ? [item.model_year, item.make, item.model].filter(Boolean).join(' ') || item.category.replace(/_/g, ' ')
    : '');
  const [stage, setStage] = useState(dealStages[0]);
  const [dealId, setDealId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || (!dealId && !name.trim())) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: saveError } = await supabase.rpc('assign_deal_equipment', {
        p_deal_id: dealId || null,
        p_contact_id: contactId || null,
        p_lead_id: leadId,
        p_name: name,
        p_stage: stage,
        p_equipment_ids: items.map((equipment) => equipment.id),
      });
      if (saveError) throw saveError;
      onClose();
      router.push(paths.dealDetails(data));
    } catch (saveError) {
      setError(saveError.message || 'Unable to save the deal.');
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="equipment-deal-title"
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit } }}
    >
      <DialogTitle id="equipment-deal-title">{items.length ? 'Add Equipment to Deal' : 'Add Deal'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {items.length > 0 && deals.length > 0 && (
            <TextField select label="Deal" value={dealId} onChange={(event) => setDealId(event.target.value)}>
              <MenuItem value="">Create a new deal</MenuItem>
              {deals.map((deal) => <MenuItem key={deal.id} value={deal.id}>{deal.name}</MenuItem>)}
            </TextField>
          )}
          {!dealId && (
            <>
              <TextField autoFocus required label="Deal Name" value={name} onChange={(event) => setName(event.target.value)} />
              <TextField select label="Stage" value={stage} onChange={(event) => setStage(event.target.value)}>
                {dealStages.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value === 'fit_confirmed' ? 'Equipment Fit Confirmed' : value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" loading={saving} disabled={!dealId && !name.trim()}>
          {dealId ? 'Add to Deal' : 'Create Deal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
