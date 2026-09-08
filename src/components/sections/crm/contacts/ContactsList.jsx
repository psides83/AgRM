'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import { formatPhone } from 'components/sections/crm/shared/phoneFormat';

const ContactsList = () => {
  const supabase = useMemo(() => createClient(), []);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    setError(null);

    const [contactsResult, activitiesResult] = await Promise.all([
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
        city,
        region,
        tags,
        created_at,
        companies (
          id,
          name,
          company_type
        )
      `,
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('activities')
        .select('id, contact_id, type, subject, occurred_at, created_at')
        .not('contact_id', 'is', null)
        .order('occurred_at', { ascending: false }),
    ]);

    const queryError = contactsResult.error || activitiesResult.error;

    if (queryError) {
      setError(queryError.message);
    } else {
      const latestActivityByContact = latestActivitiesByContact(
        activitiesResult.data || [],
      );
      setContacts(
        (contactsResult.data || []).map((contact) => ({
          ...contact,
          latestActivity: latestActivityByContact.get(contact.id) || null,
        })),
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchContacts();

    const channel = supabase
      .channel('agrm-contacts-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        () => fetchContacts(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companies' },
        () => fetchContacts(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => fetchContacts(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return contacts;
    }

    return contacts.filter((contact) => {
      const values = [
        contact.first_name,
        contact.last_name,
        contact.title,
        contact.account_number,
        contact.email,
        contact.phone,
        contact.mobile_phone,
        contact.city,
        contact.region,
        contact.companies?.name,
        contact.companies?.company_type,
        contact.latestActivity?.type,
        contact.latestActivity?.subject,
        ...(contact.tags || []),
      ];

      return values
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [contacts, search]);

  const sortedContacts = useMemo(
    () => [...filteredContacts].sort((a, b) => compareContacts(a, b, sort)),
    [filteredContacts, sort],
  );

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Contacts"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Contacts', active: true },
          ]}
          actionComponent={
            <Stack direction="row" spacing={1}>
              <Button
                href={paths.crmImport}
                component={Link}
                underline="none"
                variant="soft"
                color="neutral"
                size="large"
                startIcon={
                  <IconifyIcon icon="material-symbols:upload-file-outline-rounded" />
                }
              >
                Import CSV
              </Button>
              <Button
                href={paths.addContact}
                component={Link}
                underline="none"
                variant="contained"
                size="large"
                startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
              >
                Add Contact
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >
            <Box>
              <Typography variant="h6">Customer relationships</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {contacts.length} total contact
                {contacts.length === 1 ? '' : 's'}
              </Typography>
            </Box>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search contacts, companies, phones..."
              sx={{ width: { xs: 1, md: 360 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="material-symbols:search-rounded" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <SortableHeader
                    label="Name"
                    sortKey="name"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Account"
                    sortKey="account"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Company"
                    sortKey="company"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Contact"
                    sortKey="contact"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Location"
                    sortKey="location"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Last Activity"
                    sortKey="lastActivity"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Tags"
                    sortKey="tags"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading contacts..." />
                ) : sortedContacts.length ? (
                  sortedContacts.map((contact) => (
                    <TableRow key={contact.id} hover>
                      <TableCell>
                        <Link
                          href={paths.contactDetails(contact.id)}
                          underline="hover"
                          sx={{ color: 'text.primary', fontWeight: 700 }}
                        >
                          {contact.first_name} {contact.last_name}
                        </Link>
                        {contact.title && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {contact.title}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {contact.account_number || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {contact.companies?.id ? (
                          <Link
                            href={paths.companyDetails(contact.companies.id)}
                            underline="hover"
                            sx={{ color: 'text.primary', fontWeight: 600 }}
                          >
                            {contact.companies.name}
                          </Link>
                        ) : (
                          <Typography variant="body2">-</Typography>
                        )}
                        {contact.companies?.company_type && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {contact.companies.company_type}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {contact.email || '-'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {formatPhone(contact.mobile_phone || contact.phone) ||
                            'No phone'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {[contact.city, contact.region]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(
                            contact.latestActivity?.occurred_at ||
                              contact.latestActivity?.created_at,
                          )}
                        </Typography>
                        {contact.latestActivity && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {[
                              formatEnum(contact.latestActivity.type),
                              contact.latestActivity.subject,
                            ]
                              .filter(Boolean)
                              .join(' - ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          useFlexGap
                          sx={{ flexWrap: 'wrap' }}
                        >
                          {(contact.tags || []).length ? (
                            contact.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="soft"
                              />
                            ))
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              No tags
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow
                    label={search ? 'No matching contacts' : 'No contacts yet'}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

function EmptyRow({ label }) {
  return (
    <TableRow>
      <TableCell colSpan={7}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', textAlign: 'center', py: 5 }}
        >
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function SortableHeader({ label, sortKey, activeSort, onSort }) {
  return (
    <TableCell
      sortDirection={activeSort.key === sortKey ? activeSort.direction : false}
    >
      <TableSortLabel
        active={activeSort.key === sortKey}
        direction={activeSort.key === sortKey ? activeSort.direction : 'asc'}
        onClick={() => onSort(sortKey)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function latestActivitiesByContact(activities) {
  return activities.reduce((latestByContact, activity) => {
    if (!activity.contact_id || latestByContact.has(activity.contact_id)) {
      return latestByContact;
    }

    latestByContact.set(activity.contact_id, activity);
    return latestByContact;
  }, new Map());
}

function compareContacts(a, b, sort) {
  const direction = sort.direction === 'asc' ? 1 : -1;
  const aValue = sortValue(a, sort.key);
  const bValue = sortValue(b, sort.key);

  if (sort.key === 'lastActivity' || sort.key === 'createdAt') {
    return (dateValue(aValue) - dateValue(bValue)) * direction;
  }

  return (
    String(aValue || '').localeCompare(String(bValue || ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    }) * direction
  );
}

function sortValue(contact, key) {
  if (key === 'name') {
    return [contact.last_name, contact.first_name].filter(Boolean).join(' ');
  }
  if (key === 'account') return contact.account_number;
  if (key === 'company') return contact.companies?.name;
  if (key === 'contact') {
    return [contact.email, formatPhone(contact.mobile_phone || contact.phone)]
      .filter(Boolean)
      .join(' ');
  }
  if (key === 'location') {
    return [contact.city, contact.region].filter(Boolean).join(' ');
  }
  if (key === 'lastActivity') {
    return (
      contact.latestActivity?.occurred_at ||
      contact.latestActivity?.created_at ||
      null
    );
  }
  if (key === 'tags') return (contact.tags || []).join(' ');
  return contact.created_at;
}

function dateValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default ContactsList;
