'use client';

import { localDay, targetKey, useGameplanDays, addTarget, methods } from './gameplanData';
import { fetchMapRecords } from './records';
import useListState from 'hooks/useListState';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import styles from './map.module.css';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import {
  formatLeadStatus,
  leadStatuses,
} from 'components/sections/crm/constants';

const emptyTargets = [];
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
mapboxgl.accessToken = mapboxToken;

const filters = [
  { value: 'all', label: 'All' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
  { value: 'company', label: 'Companies' },
  { value: 'gameplan', label: 'Daily Gameplan' },
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
  const [mapBounds, setMapBounds] = useState(null);
  const [unmappedRecords, setUnmappedRecords] = useState([]);
  const [filter, setFilter, filterRestored] = useListState('crm/map/index:filter', 'all');
  const [isDroppingLeadPin, setIsDroppingLeadPin] = useState(false);
  const [leadPin, setLeadPin] = useState(null);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(null);

  const [planDate, setPlanDate] = useState(() => {
    const date = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('gameplan');
    return /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : localDay();
  });
  const [pinTarget, setPinTarget] = useState(null);
  const [addedMessage, setAddedMessage] = useState('');
  const { days, error: daysError, loading: daysLoading } = useGameplanDays(supabase, filter === 'gameplan' || Boolean(pinTarget));
  useEffect(() => {
    if (!filterRestored) return;
    const date = new URLSearchParams(window.location.search).get('gameplan');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setPlanDate(date);
      setFilter('gameplan');
    }
  }, [filterRestored, setFilter]);
  const [plan, setPlan] = useState(null);
  const planRequest = useRef(0);
  const activePlanDate = useRef(null);
  const targets = plan?.date === planDate ? plan.targets : emptyTargets;
  const planError = plan?.date === planDate ? plan.error : null;

  const loadPlan = useCallback(async () => {
    if (activePlanDate.current !== planDate) return;
    const request = ++planRequest.current;
    const { data, error } = await supabase.from('crm_gameplan_targets').select('*')
      .eq('plan_date', planDate).order('position').order('id');
    if (request === planRequest.current) {
      setPlan({ date: planDate, targets: data || [], error: error?.message });
    }
  }, [planDate, supabase]);

  useEffect(() => {
    if (filter !== 'gameplan') return undefined;
    activePlanDate.current = planDate;
    if (days.includes(planDate)) loadPlan();
    else if (days.length) setPlanDate(days[0]);
    return () => {
      activePlanDate.current = null;
      planRequest.current += 1;
    };
  }, [days, filter, loadPlan, planDate]);

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
    const map = mapRef.current;
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(map.getContainer());
    const updateBounds = () => setMapBounds(map.getBounds());
    map.on('moveend', updateBounds);
    map.on('resize', updateBounds);
    updateBounds();

    return () => {
      resizeObserver.disconnect();
      map.off('moveend', updateBounds);
      map.off('resize', updateBounds);
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

  const planPositions = useMemo(() => {
    const positions = new Map();
    for (const [index, target] of targets.entries()) {
      const key = targetKey(target);
      positions.set(key, [...(positions.get(key) || []), index + 1]);
    }
    return positions;
  }, [targets]);
  const isVisible = useCallback((record) => filter === 'gameplan'
    ? planPositions.has(record.id)
    : !record.converted && (filter === 'all' || record.kind === filter), [filter, planPositions]);

  const visibleMappedRecords = useMemo(
    () => mappedRecords.filter(isVisible),
    [isVisible, mappedRecords],
  );

  const recordsInView = useMemo(
    () => mapBounds
      ? visibleMappedRecords.filter((record) => mapBounds.contains(record.coordinates))
      : [],
    [mapBounds, visibleMappedRecords],
  );

  const visibleUnmappedRecords = useMemo(
    () => unmappedRecords.filter(isVisible),
    [isVisible, unmappedRecords],
  );

  useEffect(() => {
    if (!mapRef.current) return;

    visibleMappedRecords.forEach((record) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.style.border = '0';
      node.style.background = 'transparent';
      node.style.padding = '0';
      node.style.cursor = 'pointer';

      const root = createRoot(node);
      const positions = filter === 'gameplan' ? planPositions.get(record.id) : null;
      const showIcon = record.kind === 'company' || !positions;
      node.setAttribute('aria-label', record.title);
      root.render(
        <Box
          sx={{
            width: positions ? 'auto' : 34,
            minWidth: 34,
            px: positions ? 0.75 : 0,
            height: 34,
            borderRadius: '50%',
            bgcolor: record.kind === 'lead' ? 'warning.main' : 'primary.main',
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            boxShadow: 3,
          }}
        >
          {showIcon && <IconifyIcon icon={recordIcon(record.kind)} fontSize={21} />}
          {positions && <span>{positions.join(', ')}</span>}
        </Box>,
      );

      const marker = new mapboxgl.Marker({ element: node })
        .setLngLat(record.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setDOMContent(popupContent(record, setPinTarget)))
        .addTo(mapRef.current);

      markersRef.current.push({ marker, root });
    });

    if (visibleMappedRecords.length) {
      const bounds = new mapboxgl.LngLatBounds();
      visibleMappedRecords.forEach((record) => bounds.extend(record.coordinates));
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 600 });
    }
    return () => {
      markersRef.current.forEach(({ marker, root }) => {
        marker.remove();
        queueMicrotask(() => root.unmount());
      });
      markersRef.current = [];
    };
  }, [filter, planPositions, visibleMappedRecords]);

  const fetchRecords = async () => {
    setError(null);
    setIsLoading(true);
    try {
      setRecords(await fetchMapRecords(supabase));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
              <Button href={paths.crmGameplan} variant="outlined">Daily Gameplan</Button>
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
              gridTemplateRows: 'auto auto minmax(0, 1fr)',
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
                <Typography variant="h6">{filter === 'gameplan' ? 'Gameplan Map' : 'Territory View'}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {recordsInView.length} records in view, {visibleUnmappedRecords.length} missing a usable location
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
                <MapStat label="In View" value={recordsInView.length} color="primary.main" />
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

            <Box>
            {filter === 'gameplan' && !daysLoading && !daysError && !days.length && (
              <Alert severity="info" action={<Button href={paths.crmGameplan}>Open planner</Button>} sx={{ m: 2 }}>
                Create a gameplan to filter the map by date.
              </Alert>
            )}
            {filter === 'gameplan' && days.length > 0 && (
              <TextField select size="small" label="Gameplan date" value={days.includes(planDate) ? planDate : ''}
                onChange={(event) => setPlanDate(event.target.value)} sx={{ m: 2, minWidth: 200 }}>
                {days.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
              </TextField>
            )}
            {filter === 'gameplan' && (planError || daysError) && <Alert severity="error">{planError || daysError}</Alert>}
            {addedMessage && <Alert severity="success" onClose={() => setAddedMessage('')}>{addedMessage}</Alert>}
            {error && <Alert severity="error" sx={{ m: 2.5, mb: 0 }}>{error}</Alert>}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px', xl: 'minmax(0, 1fr) 410px' },
                minHeight: 0,
              }}
            >
              <Box sx={{ minHeight: { xs: 430, lg: 0 }, position: 'relative', minWidth: 0, overflow: 'hidden' }}>
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
                    Records in view
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Select a row to open the CRM record.
                  </Typography>
                </Box>

                <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
                  <Box>
                    {recordsInView.map((record) => (
                      <MapRecordRow key={record.id} record={record} onAdd={setPinTarget} />
                    ))}
                    {!recordsInView.length && <EmptyState label="No records in this map area" />}
                  </Box>

                  {visibleUnmappedRecords.length > 0 && (
                    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ px: 2.5, pt: 2, pb: 0.75 }}>
                        Needs Location
                      </Typography>
                      {visibleUnmappedRecords.slice(0, 8).map((record) => (
                        <MapRecordRow key={record.id} record={record} compact onAdd={setPinTarget} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>
      {pinTarget && <AddToGameplanDialog record={pinTarget} supabase={supabase} days={days}
        daysError={daysError} loading={daysLoading} selectedDate={planDate} onClose={() => setPinTarget(null)}
        onSaved={async (day) => {
          setAddedMessage(`Added to the ${day} gameplan.`);
          if (day === planDate) await loadPlan();
        }} />}
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

function AddToGameplanDialog({ record, supabase, days, daysError, loading, selectedDate, onClose, onSaved }) {
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
            <TextField select fullWidth label="Gameplan date" value={day} onChange={(event) => setDate(event.target.value)}>
              {days.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Activity" value={method} onChange={(event) => setMethod(event.target.value)}>
              {methods.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
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

function recordIcon(kind) {
  return {
    lead: 'material-symbols:filter-alt-rounded',
    contact: 'material-symbols:person-pin-circle-rounded',
    company: 'material-symbols:business-rounded',
  }[kind];
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

function MapRecordRow({ record, compact = false, onAdd }) {
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
          <IconifyIcon icon={recordIcon(record.kind)} fontSize={20} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.25, minWidth: 0 }}>
            <Link href={record.href} underline="hover" sx={{ color: 'text.primary', fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.title}
            </Link>
            <Chip label={({ lead: 'Lead', contact: 'Contact', company: 'Company' })[record.kind]} size="small" color={record.kind === 'lead' ? 'warning' : 'primary'} variant="soft" sx={{ flexShrink: 0 }} />
          </Stack>
          {!compact && record.subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.subtitle}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
            {record.address || formatCoordinates(record.coordinates) || 'No location'}
          </Typography>
          <Button size="small" onClick={() => onAdd(record)}>Add to gameplan</Button>
        </Box>
      </Stack>
    </Box>
  );
}

function CreateLeadFromPinDialog({ open, pin, supabase, onClose, onSaved }) {
  const [form, setForm] = useState({
    source: 'Map pin',
    accountNumber: '',
    status: 'not_contacted',
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
        status: 'not_contacted',
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

function popupContent(record, onAdd) {
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 220px;">
      <strong>${escapeHtml(record.title)}</strong>
      <div style="margin-top: 4px; color: #637381;">${escapeHtml(record.subtitle || record.kind)}</div>
      <div style="margin-top: 6px; color: #637381;">${escapeHtml(record.address || formatCoordinates(record.coordinates) || '')}</div>
      <a href="${record.href}" style="display: inline-block; margin-top: 8px;">Open ${record.kind}</a>
    </div>
  `;
  const add = document.createElement('button');
  add.type = 'button';
  add.textContent = 'Add to gameplan';
  add.className = styles.addToGameplan;
  add.addEventListener('click', () => onAdd(record));
  container.append(add);
  return container;
}

function formatCoordinates(coordinates) {
  if (!coordinates) return '';
  return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
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
