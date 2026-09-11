'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import {
  formatLeadStatus,
  leadStatuses,
} from 'components/sections/crm/constants';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
mapboxgl.accessToken = mapboxToken;

const filters = [
  { value: 'all', label: 'All' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
];

const CrmMap = () => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const droppedLeadMarkerRef = useRef(null);
  const geocodeCacheRef = useRef(new Map());
  const [records, setRecords] = useState([]);
  const [mappedRecords, setMappedRecords] = useState([]);
  const [unmappedRecords, setUnmappedRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isDroppingLeadPin, setIsDroppingLeadPin] = useState(false);
  const [leadPin, setLeadPin] = useState(null);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('agrm-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => fetchRecords())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => fetchRecords())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchRecords())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-97.5164, 35.4676],
      zoom: 4,
      scrollZoom: true,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isDroppingLeadPin) return undefined;

    const handleMapClick = (event) => {
      const pin = {
        latitude: Number(event.lngLat.lat.toFixed(6)),
        longitude: Number(event.lngLat.lng.toFixed(6)),
      };

      setLeadPin(pin);
      setIsLeadDialogOpen(true);
      setIsDroppingLeadPin(false);
    };

    mapRef.current.getCanvas().style.cursor = 'crosshair';
    mapRef.current.once('click', handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.getCanvas().style.cursor = '';
      }
    };
  }, [isDroppingLeadPin]);

  useEffect(() => {
    if (!mapRef.current) return;

    droppedLeadMarkerRef.current?.remove();
    droppedLeadMarkerRef.current = null;

    if (!leadPin) return;

    const node = document.createElement('div');
    node.style.width = '30px';
    node.style.height = '30px';
    node.style.borderRadius = '50%';
    node.style.background = '#ffab00';
    node.style.border = '3px solid #ffffff';
    node.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';

    droppedLeadMarkerRef.current = new mapboxgl.Marker({ element: node })
      .setLngLat([leadPin.longitude, leadPin.latitude])
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: [leadPin.longitude, leadPin.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 12),
      duration: 500,
    });
  }, [leadPin]);

  useEffect(() => {
    geocodeRecords(records);
  }, [records]);

  const visibleMappedRecords = useMemo(
    () => mappedRecords.filter((record) => filter === 'all' || record.kind === filter),
    [filter, mappedRecords],
  );

  const visibleUnmappedRecords = useMemo(
    () => unmappedRecords.filter((record) => filter === 'all' || record.kind === filter),
    [filter, unmappedRecords],
  );

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    visibleMappedRecords.forEach((record) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.style.border = '0';
      node.style.background = 'transparent';
      node.style.padding = '0';
      node.style.cursor = 'pointer';

      createRoot(node).render(
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: record.kind === 'lead' ? 'warning.main' : 'primary.main',
            color: 'common.white',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 3,
          }}
        >
          <IconifyIcon icon={record.kind === 'lead' ? 'material-symbols:filter-alt-rounded' : 'material-symbols:person-pin-circle-rounded'} fontSize={21} />
        </Box>,
      );

      const marker = new mapboxgl.Marker({ element: node })
        .setLngLat(record.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(popupHtml(record)))
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    if (visibleMappedRecords.length) {
      const bounds = new mapboxgl.LngLatBounds();
      visibleMappedRecords.forEach((record) => bounds.extend(record.coordinates));
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 600 });
    }
  }, [visibleMappedRecords]);

  const fetchRecords = async () => {
    setError(null);
    setIsLoading(true);

    const [contactsResult, leadsResult] = await Promise.all([
      supabase
        .from('contacts')
        .select(
          `
          id,
          first_name,
          last_name,
          title,
          account_number,
          email,
          phone,
          mobile_phone,
          address_line1,
          address_line2,
          city,
          region,
          postal_code,
          country,
          latitude,
          longitude,
          companies(id, name, address_line1, address_line2, city, region, postal_code, country, latitude, longitude)
        `,
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('leads')
        .select(
          `
          id,
          source,
          account_number,
          status,
          priority,
          estimated_budget,
          next_follow_up_at,
          latitude,
          longitude,
          contacts(id, first_name, last_name, address_line1, address_line2, city, region, postal_code, country, latitude, longitude),
          companies(id, name, address_line1, address_line2, city, region, postal_code, country, latitude, longitude)
        `,
        )
        .neq('status', 'converted')
        .order('created_at', { ascending: false }),
    ]);

    const queryError = contactsResult.error || leadsResult.error;
    if (queryError) {
      setError(queryError.message);
      setRecords([]);
    } else {
      setRecords([
        ...(contactsResult.data || []).map(contactToMapRecord),
        ...(leadsResult.data || []).map(leadToMapRecord),
      ]);
    }

    setIsLoading(false);
  };

  const geocodeRecords = async (nextRecords) => {
    if (!mapboxToken) {
      setMappedRecords([]);
      setUnmappedRecords(nextRecords);
      return;
    }

    setIsGeocoding(true);

    const results = await Promise.all(
      nextRecords.map(async (record) => {
        if (record.coordinates) return record;
        if (!record.address) return { ...record, coordinates: null };
        const cacheKey = record.address.toLowerCase();

        if (geocodeCacheRef.current.has(cacheKey)) {
          return { ...record, coordinates: geocodeCacheRef.current.get(cacheKey) };
        }

        const coordinates = await geocodeAddress(record.address);
        geocodeCacheRef.current.set(cacheKey, coordinates);
        return { ...record, coordinates };
      }),
    );

    setMappedRecords(results.filter((record) => record.coordinates));
    setUnmappedRecords(results.filter((record) => !record.coordinates));
    setIsGeocoding(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="CRM Map"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Map', active: true },
          ]}
          actionComponent={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant={isDroppingLeadPin ? 'contained' : 'soft'}
                color={isDroppingLeadPin ? 'warning' : 'neutral'}
                disabled={!mapboxToken}
                onClick={() => setIsDroppingLeadPin((value) => !value)}
                startIcon={<IconifyIcon icon="material-symbols:add-location-alt-outline-rounded" />}
              >
                Drop Lead Pin
              </Button>
              <Button href={paths.addContact} component={Link} underline="none" variant="contained" startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}>
                Add Contact / Lead
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: 'auto minmax(0, 1fr)',
              minHeight: { xs: 820, lg: 720 },
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                gap: 2,
                alignItems: 'center',
                p: { xs: 2, sm: 2.5 },
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6">Territory View</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {visibleMappedRecords.length} records on the map, {visibleUnmappedRecords.length} missing a usable location
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 132px) 150px' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <MapStat label="On Map" value={visibleMappedRecords.length} color="primary.main" />
                <MapStat label="Needs Location" value={visibleUnmappedRecords.length} color="warning.main" />
                <TextField select label="Show" value={filter} onChange={(event) => setFilter(event.target.value)} size="small">
                  {filters.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ m: 2.5, mb: 0 }}>{error}</Alert>}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px', xl: 'minmax(0, 1fr) 410px' },
                minHeight: 0,
              }}
            >
              <Box sx={{ minHeight: { xs: 430, lg: 0 }, position: 'relative', minWidth: 0 }}>
                {!mapboxToken ? (
                  <Alert severity="warning" sx={{ m: 3 }}>
                    Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment to enable the CRM map.
                  </Alert>
                ) : (
                  <Box ref={mapContainerRef} sx={{ position: 'absolute', inset: 0 }} />
                )}
                {(isLoading || isGeocoding) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: 16,
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 1.5,
                      py: 1,
                      boxShadow: 1,
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2">Loading locations</Typography>
                  </Box>
                )}
                {isDroppingLeadPin && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: isLoading || isGeocoding ? 68 : 16,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 1.5,
                      py: 1,
                      boxShadow: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <IconifyIcon icon="material-symbols:add-location-alt-outline-rounded" />
                      <Typography variant="body2">Click the map to place a lead pin.</Typography>
                    </Stack>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateRows: 'auto minmax(0, 1fr)',
                  minHeight: { xs: 360, lg: 0 },
                  borderLeft: { lg: 1 },
                  borderTop: { xs: 1, lg: 0 },
                  borderColor: 'divider',
                  bgcolor: 'background.elevation1',
                  minWidth: 0,
                }}
              >
                <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Records
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Select a row to open the CRM record.
                  </Typography>
                </Box>

                <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
                  <Box>
                    {visibleMappedRecords.map((record) => (
                      <MapRecordRow key={record.id} record={record} />
                    ))}
                    {!visibleMappedRecords.length && <EmptyState label="No mapped records yet" />}
                  </Box>

                  {visibleUnmappedRecords.length > 0 && (
                    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ px: 2.5, pt: 2, pb: 0.75 }}>
                        Needs Location
                      </Typography>
                      {visibleUnmappedRecords.slice(0, 8).map((record) => (
                        <MapRecordRow key={record.id} record={record} compact />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>
      <CreateLeadFromPinDialog
        open={isLeadDialogOpen}
        pin={leadPin}
        supabase={supabase}
        onClose={() => {
          setIsLeadDialogOpen(false);
          setLeadPin(null);
        }}
        onSaved={(leadId) => {
          setIsLeadDialogOpen(false);
          setLeadPin(null);
          fetchRecords();
          router.push(paths.leadDetails(leadId));
        }}
      />
    </Grid>
  );
};

function MapStat({ label, value, color }) {
  return (
    <Box
      sx={{
        minWidth: 120,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        px: 1.5,
        py: 1.25,
      }}
    >
      <Typography variant="h5" sx={{ color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {label}
      </Typography>
    </Box>
  );
}

function contactToMapRecord(contact) {
  const address = formatAddress(contact) || formatAddress(contact.companies);
  const coordinates = getCoordinates(contact) || getCoordinates(contact.companies);

  return {
    id: `contact-${contact.id}`,
    kind: 'contact',
    title: contactName(contact),
    subtitle: [contact.account_number, contact.title, contact.companies?.name].filter(Boolean).join(' · '),
    address,
    coordinates,
    href: paths.contactDetails(contact.id),
  };
}

function leadToMapRecord(lead) {
  const address = formatAddress(lead.contacts) || formatAddress(lead.companies);
  const coordinates = getCoordinates(lead) || getCoordinates(lead.contacts) || getCoordinates(lead.companies);

  return {
    id: `lead-${lead.id}`,
    kind: 'lead',
    title: lead.companies?.name || (lead.contacts ? contactName(lead.contacts) : '') || (lead.account_number ? `Account ${lead.account_number}` : '') || lead.source || 'Lead',
    subtitle: [formatLeadStatus(lead.status), lead.account_number, lead.source, formatCurrency(lead.estimated_budget)].filter((value) => value && value !== '-').join(' · '),
    address,
    coordinates,
    href: paths.leadDetails(lead.id),
  };
}

async function geocodeAddress(address) {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`);
  url.searchParams.set('access_token', mapboxToken);
  url.searchParams.set('country', 'US');
  url.searchParams.set('limit', '1');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return data.features?.[0]?.center || null;
  } catch {
    return null;
  }
}

function MapRecordRow({ record, compact = false }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 2.5,
        py: compact ? 1.25 : 1.75,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'background-color 120ms ease',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: 1,
            bgcolor: record.kind === 'lead' ? 'warning.lighter' : 'primary.lighter',
            color: record.kind === 'lead' ? 'warning.dark' : 'primary.dark',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconifyIcon icon={record.kind === 'lead' ? 'material-symbols:filter-alt-rounded' : 'material-symbols:person-pin-circle-rounded'} fontSize={20} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.25, minWidth: 0 }}>
            <Link href={record.href} underline="hover" sx={{ color: 'text.primary', fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.title}
            </Link>
            <Chip label={record.kind === 'lead' ? 'Lead' : 'Contact'} size="small" color={record.kind === 'lead' ? 'warning' : 'primary'} variant="soft" sx={{ flexShrink: 0 }} />
          </Stack>
          {!compact && record.subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.subtitle}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
            {record.address || formatCoordinates(record.coordinates) || 'No location'}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function CreateLeadFromPinDialog({ open, pin, supabase, onClose, onSaved }) {
  const [form, setForm] = useState({
    source: 'Map pin',
    accountNumber: '',
    status: 'new',
    priority: 3,
    estimatedBudget: '',
    nextFollowUpAt: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        source: 'Map pin',
        accountNumber: '',
        status: 'new',
        priority: 3,
        estimatedBudget: '',
        nextFollowUpAt: '',
        notes: '',
      });
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!pin) return;

    setIsSaving(true);
    setError(null);

    const { data: userResult, error: userError } = await supabase.auth.getUser();

    if (userError || !userResult.user) {
      setError('Could not confirm the signed-in user.');
      setIsSaving(false);
      return;
    }

    const { data, error: saveError } = await supabase
      .from('leads')
      .insert({
        owner_id: userResult.user.id,
        source: cleanText(form.source) || 'Map pin',
        account_number: cleanText(form.accountNumber),
        status: form.status,
        priority: Number(form.priority) || 3,
        estimated_budget: form.estimatedBudget || null,
        next_follow_up_at: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : null,
        latitude: pin.latitude,
        longitude: pin.longitude,
        notes: cleanText(form.notes),
      })
      .select('id')
      .single();

    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    onSaved(data.id);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Lead From Pin</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">
            Lead location: {pin ? `${pin.latitude}, ${pin.longitude}` : 'No pin selected'}
          </Alert>
          <TextField label="Lead Source" value={form.source} onChange={handleField(setForm, 'source')} fullWidth />
          <TextField label="Account Number" value={form.accountNumber} onChange={handleField(setForm, 'accountNumber')} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: 0 }}>
            <TextField select label="Status" value={form.status} onChange={handleField(setForm, 'status')} fullWidth>
              {leadStatuses.filter((status) => status !== 'converted').map((status) => (
                <MenuItem key={status} value={status}>
                  {formatLeadStatus(status)}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Priority" type="number" value={form.priority} onChange={handleField(setForm, 'priority')} fullWidth inputProps={{ min: 1, max: 5 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: 0 }}>
            <TextField label="Estimated Budget" type="number" value={form.estimatedBudget} onChange={handleField(setForm, 'estimatedBudget')} fullWidth />
            <TextField label="Next Follow-up" type="datetime-local" value={form.nextFollowUpAt} onChange={handleField(setForm, 'nextFollowUpAt')} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          </Stack>
          <TextField label="Notes" value={form.notes} onChange={handleField(setForm, 'notes')} fullWidth multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving} disabled={!pin}>
          Create Lead
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmptyState({ label }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
      {label}
    </Typography>
  );
}

function popupHtml(record) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 220px;">
      <strong>${escapeHtml(record.title)}</strong>
      <div style="margin-top: 4px; color: #637381;">${escapeHtml(record.subtitle || record.kind)}</div>
      <div style="margin-top: 6px; color: #637381;">${escapeHtml(record.address || formatCoordinates(record.coordinates) || '')}</div>
      <a href="${record.href}" style="display: inline-block; margin-top: 8px;">Open ${record.kind}</a>
    </div>
  `;
}

function formatAddress(record) {
  if (!record) return '';

  return [
    record.address_line1,
    record.address_line2,
    record.city,
    record.region,
    record.postal_code,
    record.country,
  ]
    .filter(Boolean)
    .join(', ');
}

function getCoordinates(record) {
  if (record?.latitude === null || record?.longitude === null || typeof record?.latitude === 'undefined' || typeof record?.longitude === 'undefined') return null;

  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return [longitude, latitude];
}

function formatCoordinates(coordinates) {
  if (!coordinates) return '';
  return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Unnamed contact';
}

function formatCurrency(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

function formatEnum(value) {
  if (!value) return '-';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanText(value) {
  const cleaned = typeof value === 'string' ? value.trim() : value;
  return cleaned || null;
}

function handleField(setter, field) {
  return (event) => {
    setter((current) => ({ ...current, [field]: event.target.value }));
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default CrmMap;
