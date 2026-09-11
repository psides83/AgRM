'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import { equipmentStatuses } from 'components/sections/crm/constants';

const equipmentCategories = [
  'tractor',
  'combine',
  'planter',
  'sprayer',
  'hay',
  'tillage',
  'utility_vehicle',
  'attachment',
  'other',
];
const equipmentConditions = ['new', 'used', 'either'];
const equipmentAvailability = [
  'availability_unknown',
  'in_stock',
  'pending',
  'unavailable',
];
const equipmentCategoryIcons = {
  tractor: '/deere-icons/tractor-row-crop.svg',
  combine: '/deere-icons/combine.svg',
  planter: '/deere-icons/planting-planter.svg',
  sprayer: '/deere-icons/sprayer.svg',
  hay: '/deere-icons/hay-baler.svg',
  tillage: '/deere-icons/tillage.svg',
  utility_vehicle: '/deere-icons/xuv-gator.svg',
  attachment: '/deere-icons/3-point-rotary-cutter.svg',
  other: '/deere-icons/generic-equipment.svg',
};

const emptyFilters = {
  search: '',
  category: 'all',
  condition: 'all',
  availability: 'all',
  locationId: 'all',
  status: 'all',
  tradeIn: 'all',
};

const emptyForm = {
  relatedType: 'contact',
  relatedId: '',
  category: 'tractor',
  make: '',
  model: '',
  modelYear: '',
  stockNumber: '',
  serialNumber: '',
  condition: 'either',
  availability: 'availability_unknown',
  locationId: '',
  status: 'not_started',
  quotePrice: '',
  priceMin: '',
  priceMax: '',
  tradeIn: 'false',
  notes: '',
};

const Equipment = () => {
  const supabase = useMemo(() => createClient(), []);
  const [equipment, setEquipment] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [equipmentLocations, setEquipmentLocations] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchEquipment = async () => {
    setError(null);

    const { data, error: queryError } = await supabase
      .from('equipment_interests')
      .select(
        `
        *,
        contacts(id, first_name, last_name, title, companies(id, name)),
        leads(id, source, status, companies(id, name), contacts(id, first_name, last_name, title)),
        deals(id, name, stage, companies(id, name), contacts(id, first_name, last_name, title)),
        equipment_locations(id, name, city, region)
      `,
      )
      .order('updated_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setEquipment(data || []);
    }

    setIsLoading(false);
  };

  const fetchOptions = async () => {
    const [contactsResult, leadsResult, dealsResult, locationsResult] =
      await Promise.all([
        supabase
          .from('contacts')
          .select(
            'id, first_name, last_name, title, company_id, companies(id, name)',
          )
          .order('last_name', { ascending: true })
          .limit(300),
        supabase
          .from('leads')
          .select(
            'id, source, status, contact_id, company_id, contacts(id, first_name, last_name, title), companies(id, name)',
          )
          .order('created_at', { ascending: false })
          .limit(300),
        supabase
          .from('deals')
          .select(
            'id, name, stage, contact_id, company_id, lead_id, contacts(id, first_name, last_name, title), companies(id, name)',
          )
          .order('updated_at', { ascending: false })
          .limit(300),
        supabase
          .from('equipment_locations')
          .select('id, name, city, region')
          .order('name', { ascending: true }),
      ]);

    if (!contactsResult.error) setContacts(contactsResult.data || []);
    if (!leadsResult.error) setLeads(leadsResult.data || []);
    if (!dealsResult.error) setDeals(dealsResult.data || []);
    if (!locationsResult.error)
      setEquipmentLocations(locationsResult.data || []);
  };

  useEffect(() => {
    fetchEquipment();
    fetchOptions();

    const channel = supabase
      .channel('agrm-equipment-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment_interests' },
        () => fetchEquipment(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredEquipment = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return equipment.filter((item) => {
      const text = [
        item.make,
        item.model,
        item.model_year,
        item.stock_number,
        item.serial_number,
        item.notes,
        item.contacts ? contactName(item.contacts) : '',
        item.contacts?.companies?.name,
        item.leads?.source,
        item.leads?.companies?.name,
        item.deals?.name,
        item.deals?.companies?.name,
        item.equipment_locations?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!search || text.includes(search)) &&
        (filters.category === 'all' || item.category === filters.category) &&
        (filters.condition === 'all' || item.condition === filters.condition) &&
        (filters.availability === 'all' ||
          item.availability === filters.availability) &&
        (filters.locationId === 'all' ||
          item.equipment_location_id === filters.locationId) &&
        (filters.status === 'all' || item.status === filters.status) &&
        (filters.tradeIn === 'all' || String(item.trade_in) === filters.tradeIn)
      );
    });
  }, [equipment, filters]);

  const handleQuickUpdate = async (itemId, field, value) => {
    const { error: updateError } = await supabase
      .from('equipment_interests')
      .update({ [field]: value })
      .eq('id', itemId);
    if (updateError) {
      setError(updateError.message);
    } else {
      fetchEquipment();
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('equipment_interests')
      .delete()
      .eq('id', deleteItem.id);

    setIsDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setDeleteItem(null);
    fetchEquipment();
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Equipment"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Equipment', active: true },
          ]}
          actionComponent={
            <Button
              variant="contained"
              onClick={openCreateDialog}
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            >
              Add Equipment Interest
            </Button>
          }
        />
      </Grid>

      <Grid size={12}>{error && <Alert severity="error">{error}</Alert>}</Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
            <TextField
              label="Search Equipment"
              value={filters.search}
              onChange={handleFilter('search')}
              placeholder="Make, model, stock, serial, customer..."
              fullWidth
            />
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={handleFilter('category')}
              options={equipmentCategories}
            />
            <FilterSelect
              label="Condition"
              value={filters.condition}
              onChange={handleFilter('condition')}
              options={equipmentConditions}
            />
            <FilterSelect
              label="Availability"
              value={filters.availability}
              onChange={handleFilter('availability')}
              options={equipmentAvailability}
            />
            <LocationSelect
              label="Location"
              value={filters.locationId}
              onChange={handleFilter('locationId')}
              locations={equipmentLocations}
              includeAll
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={handleFilter('status')}
              options={equipmentStatuses}
            />
            <TextField
              select
              label="Trade-in"
              value={filters.tradeIn}
              onChange={handleFilter('tradeIn')}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Customer / Record</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Trade / Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading equipment..." />
                ) : filteredEquipment.length ? (
                  filteredEquipment.map((item) => (
                    <EquipmentRow
                      key={item.id}
                      item={item}
                      locations={equipmentLocations}
                      onQuickUpdate={handleQuickUpdate}
                      onEdit={openEditDialog}
                      onDelete={setDeleteItem}
                    />
                  ))
                ) : (
                  <EmptyRow label="No equipment interests match these filters" />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <AddEquipmentDialog
        open={dialogOpen}
        item={editingItem}
        contacts={contacts}
        leads={leads}
        deals={deals}
        locations={equipmentLocations}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          fetchEquipment();
        }}
        supabase={supabase}
      />

      <Dialog
        open={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Equipment Interest?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This removes{' '}
            {deleteItem ? equipmentName(deleteItem) : 'this equipment interest'}{' '}
            from the CRM record.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="neutral" onClick={() => setDeleteItem(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );

  function handleFilter(key) {
    return (event) =>
      setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  }
};

function EquipmentRow({ item, locations, onQuickUpdate, onEdit, onDelete }) {
  const owner = equipmentOwner(item);
  const href = equipmentHref(item);

  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <EquipmentCategoryIcon category={item.category} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {equipmentName(item)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {[
                formatEnum(item.category),
                formatEnum(item.condition),
                item.stock_number ? `Stock ${item.stock_number}` : null,
                item.serial_number ? `Serial ${item.serial_number}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Link
          href={href}
          underline="hover"
          sx={{ color: 'text.primary', fontWeight: 700 }}
        >
          {owner}
        </Link>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {relatedType(item)}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 190 }}>
        <TextField
          select
          size="small"
          value={normalizeAvailability(item.availability)}
          onChange={(event) =>
            onQuickUpdate(item.id, 'availability', event.target.value)
          }
          fullWidth
        >
          {equipmentAvailability.map((availability) => (
            <MenuItem key={availability} value={availability}>
              {formatEnum(availability)}
            </MenuItem>
          ))}
        </TextField>
        <LocationSelect
          size="small"
          value={item.equipment_location_id || ''}
          onChange={(event) =>
            onQuickUpdate(
              item.id,
              'equipment_location_id',
              event.target.value || null,
            )
          }
          locations={locations}
          sx={{ mt: 1 }}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 190 }}>
        <TextField
          select
          size="small"
          value={item.status || 'not_started'}
          onChange={(event) =>
            onQuickUpdate(item.id, 'status', event.target.value)
          }
          fullWidth
        >
          {equipmentStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {formatEnum(status)}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>{equipmentBudget(item)}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={item.trade_in ? 'Yes' : 'No'}
            size="small"
            variant="soft"
            color={item.trade_in ? 'warning' : 'neutral'}
          />
          <Button
            size="small"
            color="neutral"
            onClick={() => onEdit(item)}
            startIcon={
              <IconifyIcon icon="material-symbols:edit-outline-rounded" />
            }
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(item)}
            startIcon={
              <IconifyIcon icon="material-symbols:delete-outline-rounded" />
            }
          >
            Delete
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={onChange}
      sx={{ minWidth: 170 }}
    >
      <MenuItem value="all">All</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {label === 'Category' ? (
            <CategoryOption category={option} />
          ) : (
            formatEnum(option)
          )}
        </MenuItem>
      ))}
    </TextField>
  );
}

function LocationSelect({
  label = 'Location',
  value,
  onChange,
  locations,
  includeAll = false,
  size,
  sx,
}) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={onChange}
      size={size}
      sx={{ minWidth: 190, ...sx }}
      fullWidth
    >
      {includeAll && <MenuItem value="all">All</MenuItem>}
      {!includeAll && <MenuItem value="">No Location</MenuItem>}
      {locations.map((location) => (
        <MenuItem key={location.id} value={location.id}>
          {locationLabel(location)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function CategoryOption({ category }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <EquipmentCategoryIcon category={category} size={28} />
      <Typography variant="body2">{formatEnum(category)}</Typography>
    </Stack>
  );
}

function locationLabel(location) {
  return [
    location.name,
    location.city && location.region
      ? `${location.city}, ${location.region}`
      : null,
  ]
    .filter(Boolean)
    .join(' - ');
}

function EquipmentCategoryIcon({ category, size = 38 }) {
  const src = equipmentCategoryIcons[category] || equipmentCategoryIcons.other;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1,
        bgcolor: 'background.elevation1',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        aria-hidden
        sx={{
          width: Math.round(size * 0.72),
          height: Math.round(size * 0.72),
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
}

function AddEquipmentDialog({
  open,
  item,
  contacts,
  leads,
  deals,
  locations,
  onClose,
  onSaved,
  supabase,
}) {
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = Boolean(item);

  const options =
    form.relatedType === 'lead'
      ? leads
      : form.relatedType === 'deal'
        ? deals
        : contacts;
  const selectedRecord =
    options.find((option) => option.id === form.relatedId) || null;

  useEffect(() => {
    if (open) {
      setForm(item ? formFromEquipment(item) : emptyForm);
      setError(null);
    }
  }, [open, item]);

  const handleSave = async () => {
    if (!isEditing && !form.relatedId) {
      setError('Choose a related record.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('You need to be logged in to add equipment.');
      setIsSaving(false);
      return;
    }

    const payload = {
      contact_id:
        form.relatedType === 'contact'
          ? form.relatedId
          : selectedRecord?.contact_id || null,
      lead_id:
        form.relatedType === 'lead'
          ? form.relatedId
          : selectedRecord?.lead_id || null,
      deal_id: form.relatedType === 'deal' ? form.relatedId : null,
      category: form.category,
      make: cleanText(form.make),
      model: cleanText(form.model),
      model_year: form.modelYear || null,
      stock_number: cleanText(form.stockNumber),
      serial_number: cleanText(form.serialNumber),
      condition: form.condition,
      availability: normalizeAvailability(form.availability),
      equipment_location_id: form.locationId || null,
      status: form.status,
      quote_price: form.quotePrice || null,
      price_min: form.priceMin || null,
      price_max: form.priceMax || null,
      trade_in: form.tradeIn === 'true',
      notes: cleanText(form.notes),
    };

    if (isEditing) {
      delete payload.contact_id;
      delete payload.lead_id;
      delete payload.deal_id;
    }

    const { error: saveError } = isEditing
      ? await supabase
          .from('equipment_interests')
          .update(payload)
          .eq('id', item.id)
      : await supabase
          .from('equipment_interests')
          .insert({ ...payload, owner_id: user.id });

    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditing ? 'Edit Equipment Interest' : 'Add Equipment Interest'}
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {!isEditing && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Link To"
                value={form.relatedType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    relatedType: event.target.value,
                    relatedId: '',
                  }))
                }
                fullWidth
              >
                <MenuItem value="contact">Contact</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="deal">Deal</MenuItem>
              </TextField>
              <Autocomplete
                options={options}
                value={selectedRecord}
                onChange={(_event, value) =>
                  setForm((prev) => ({ ...prev, relatedId: value?.id || '' }))
                }
                getOptionLabel={(option) =>
                  relatedOptionLabel(option, form.relatedType)
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Related Record"
                    placeholder="Search"
                  />
                )}
                fullWidth
              />
            </Stack>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={handleField(setForm, 'category')}
              fullWidth
            >
              {equipmentCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  <CategoryOption category={category} />
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Condition"
              value={form.condition}
              onChange={handleField(setForm, 'condition')}
              fullWidth
            >
              {equipmentConditions.map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {formatEnum(condition)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Make"
              value={form.make}
              onChange={handleField(setForm, 'make')}
              fullWidth
            />
            <TextField
              label="Model"
              value={form.model}
              onChange={handleField(setForm, 'model')}
              fullWidth
            />
            <TextField
              label="Year"
              type="number"
              value={form.modelYear}
              onChange={handleField(setForm, 'modelYear')}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Stock Number"
              value={form.stockNumber}
              onChange={handleStockField(setForm)}
              inputProps={{ maxLength: 6 }}
              fullWidth
            />
            <TextField
              label="Serial Number"
              value={form.serialNumber}
              onChange={handleUppercaseField(setForm, 'serialNumber')}
              fullWidth
            />
            <TextField
              label="Quote Price"
              type="number"
              value={form.quotePrice}
              onChange={handleField(setForm, 'quotePrice')}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Availability"
              value={form.availability}
              onChange={handleField(setForm, 'availability')}
              fullWidth
            >
              {equipmentAvailability.map((availability) => (
                <MenuItem key={availability} value={availability}>
                  {formatEnum(availability)}
                </MenuItem>
              ))}
            </TextField>
            <LocationSelect
              label="Location"
              value={form.locationId}
              onChange={handleField(setForm, 'locationId')}
              locations={locations}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={handleField(setForm, 'status')}
              fullWidth
            >
              {equipmentStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatEnum(status)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Price Min"
              type="number"
              value={form.priceMin}
              onChange={handleField(setForm, 'priceMin')}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Price Max"
              type="number"
              value={form.priceMax}
              onChange={handleField(setForm, 'priceMax')}
              fullWidth
            />
            <TextField
              select
              label="Trade-in"
              value={form.tradeIn}
              onChange={handleField(setForm, 'tradeIn')}
              fullWidth
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </TextField>
          </Stack>
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleField(setForm, 'notes')}
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          {isEditing ? 'Save Changes' : 'Save Interest'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmptyRow({ label }) {
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}
        >
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function handleField(setForm, key) {
  return (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
}

function handleStockField(setForm) {
  return (event) =>
    setForm((prev) => ({
      ...prev,
      stockNumber: event.target.value.replace(/\D/g, '').slice(0, 6),
    }));
}

function handleUppercaseField(setForm, key) {
  return (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value.toUpperCase() }));
}

function formFromEquipment(item) {
  return {
    relatedType: item.deal_id ? 'deal' : item.lead_id ? 'lead' : 'contact',
    relatedId: item.deal_id || item.lead_id || item.contact_id || '',
    category: item.category || 'tractor',
    make: item.make || '',
    model: item.model || '',
    modelYear: item.model_year || '',
    stockNumber: item.stock_number || '',
    serialNumber: item.serial_number || '',
    condition: item.condition || 'either',
    availability: normalizeAvailability(item.availability),
    locationId: item.equipment_location_id || '',
    status: item.status || 'not_started',
    quotePrice: item.quote_price || '',
    priceMin: item.price_min || '',
    priceMax: item.price_max || '',
    tradeIn: String(Boolean(item.trade_in)),
    notes: item.notes || '',
  };
}

function equipmentName(item) {
  return (
    [item.model_year, item.make, item.model].filter(Boolean).join(' ') ||
    item.stock_number ||
    item.serial_number ||
    formatEnum(item.category)
  );
}

function equipmentOwner(item) {
  if (item.deals) return item.deals.name;
  if (item.leads)
    return (
      item.leads.source ||
      contactName(item.leads.contacts) ||
      item.leads.companies?.name ||
      'Lead'
    );
  if (item.contacts) return contactName(item.contacts);
  return 'CRM record';
}

function equipmentHref(item) {
  if (item.deal_id) return paths.dealDetails(item.deal_id);
  if (item.lead_id) return paths.leadDetails(item.lead_id);
  if (item.contact_id) return paths.contactDetails(item.contact_id);
  return paths.equipment;
}

function relatedType(item) {
  if (item.deal_id) {
    return compactUnique([
      'Deal',
      item.deals?.contacts?.title,
      item.deals?.companies?.name,
    ]).join(' · ');
  }
  if (item.lead_id) {
    return compactUnique([
      'Lead',
      item.leads?.contacts?.title,
      item.leads?.companies?.name,
    ]).join(' · ');
  }
  if (item.contact_id) {
    return (
      compactUnique([
        item.contacts?.title,
        item.contacts?.companies?.name,
      ]).join(' · ') || 'Contact'
    );
  }
  return '-';
}

function relatedOptionLabel(option, type) {
  if (type === 'deal')
    return [
      option.name,
      contactName(option.contacts),
      option.contacts?.title,
      option.companies?.name,
    ]
      .filter(Boolean)
      .join(' - ');
  if (type === 'lead')
    return [
      option.source || 'Lead',
      contactName(option.contacts),
      option.contacts?.title,
      option.companies?.name,
    ]
      .filter(Boolean)
      .join(' - ');
  return [contactName(option), option.title, option.companies?.name]
    .filter(Boolean)
    .join(' - ');
}

function contactName(contact) {
  return (
    [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || ''
  );
}

function compactUnique(values) {
  return values.filter(
    (value, index, list) => value && list.indexOf(value) === index,
  );
}

function equipmentBudget(item) {
  if (item.quote_price) return `Quote ${formatCurrency(item.quote_price)}`;
  return (
    [formatCurrency(item.price_min), formatCurrency(item.price_max)]
      .filter((value) => value !== '-')
      .join(' - ') || '-'
  );
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatEnum(value) {
  if (!value) return '-';
  if (value === 'fit_confirmed') return 'Equipment Fit Confirmed';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeAvailability(value) {
  if (['in_stock_auburn', 'in_stock_transfer'].includes(value))
    return 'in_stock';
  return value || 'availability_unknown';
}

export default Equipment;
