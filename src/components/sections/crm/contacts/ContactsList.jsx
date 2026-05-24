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
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';

const ContactsList = () => {
  const supabase = useMemo(() => createClient(), []);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    setError(null);

    const { data, error: queryError } = await supabase
      .from('contacts')
      .select(
        `
        id,
        first_name,
        last_name,
        title,
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
      `
      )
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setContacts(data || []);
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
        () => fetchContacts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companies' },
        () => fetchContacts()
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
        contact.email,
        contact.phone,
        contact.mobile_phone,
        contact.city,
        contact.region,
        contact.companies?.name,
        contact.companies?.company_type,
        ...(contact.tags || []),
      ];

      return values.filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch);
    });
  }, [contacts, search]);

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
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <Box>
              <Typography variant="h6">Customer relationships</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {contacts.length} total contact{contacts.length === 1 ? '' : 's'}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Tags</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading contacts..." />
                ) : filteredContacts.length ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} hover>
                      <TableCell>
                        <Link
                          href={paths.contactDetails(contact.id)}
                          underline="hover"
                          sx={{ color: 'text.primary', fontWeight: 700 }}
                        >
                          {contact.first_name} {contact.last_name}
                        </Link>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {contact.title || 'No role set'}
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
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {contact.companies.company_type}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{contact.email || '-'}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {contact.mobile_phone || contact.phone || 'No phone'}
                        </Typography>
                      </TableCell>
                      <TableCell>{[contact.city, contact.region].filter(Boolean).join(', ') || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                          {(contact.tags || []).length ? (
                            contact.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="soft" />
                            ))
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              No tags
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow label={search ? 'No matching contacts' : 'No contacts yet'} />
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
      <TableCell colSpan={5}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 5 }}>
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default ContactsList;
