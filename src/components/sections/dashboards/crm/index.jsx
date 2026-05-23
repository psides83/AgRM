import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { createClient } from 'lib/supabase/server';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';

const metricCards = [
  {
    key: 'contacts',
    label: 'Contacts',
    icon: 'material-symbols:contacts-outline-rounded',
    color: 'primary.main',
  },
  {
    key: 'companies',
    label: 'Companies',
    icon: 'material-symbols:business-center-outline-rounded',
    color: 'success.main',
  },
  {
    key: 'leads',
    label: 'Open leads',
    icon: 'material-symbols:filter-alt-outline-rounded',
    color: 'warning.main',
  },
  {
    key: 'deals',
    label: 'Deals',
    icon: 'material-symbols:handshake-outline-rounded',
    color: 'info.main',
  },
];

async function getCount(supabase, table, filters = []) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  filters.forEach(([column, operator, value]) => {
    query = query[operator](column, value);
  });

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null };
  }

  const [
    contacts,
    companies,
    leads,
    deals,
    equipmentInterests,
    recentContacts,
    recentCompanies,
    followUps,
  ] = await Promise.all([
    getCount(supabase, 'contacts'),
    getCount(supabase, 'companies'),
    getCount(supabase, 'leads', [['status', 'neq', 'converted']]),
    getCount(supabase, 'deals', [['stage', 'neq', 'won']]),
    getCount(supabase, 'equipment_interests'),
    supabase
      .from('contacts')
      .select('id, first_name, last_name, email, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('companies')
      .select('id, name, company_type, city, region, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('leads')
      .select('id, status, source, next_follow_up_at, contacts(first_name, last_name), companies(name)')
      .not('next_follow_up_at', 'is', null)
      .order('next_follow_up_at', { ascending: true })
      .limit(5),
  ]);

  const queryError = [recentContacts.error, recentCompanies.error, followUps.error].find(Boolean);

  if (queryError) {
    throw queryError;
  }

  return {
    user,
    counts: {
      contacts,
      companies,
      leads,
      deals,
      equipmentInterests,
    },
    recentContacts: recentContacts.data || [],
    recentCompanies: recentCompanies.data || [],
    followUps: followUps.data || [],
  };
}

const CRM = async () => {
  let data;

  try {
    data = await getDashboardData();
  } catch (error) {
    return (
      <Alert severity="error">
        Could not load CRM dashboard data. {error.message}
      </Alert>
    );
  }

  if (!data.user) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
          >
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                AgRM dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Start with contacts and companies, then build leads and deals around those relationships.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                href={paths.addContact}
                component={Link}
                underline="none"
                variant="contained"
                startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
              >
                Add contact
              </Button>
              <Button
                href={paths.deals}
                component={Link}
                underline="none"
                variant="soft"
                color="neutral"
                startIcon={<IconifyIcon icon="material-symbols:view-kanban-outline-rounded" />}
              >
                Deals
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {metricCards.map((metric) => (
        <Grid key={metric.key} size={{ xs: 12, sm: 6, xl: 3 }}>
          <Paper sx={{ p: 3, height: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <IconifyIcon icon={metric.icon} sx={{ fontSize: 36, color: metric.color }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {data.counts[metric.key]}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {metric.label}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}

      <Grid size={{ xs: 12, xl: 7 }}>
        <RecentContacts contacts={data.recentContacts} />
      </Grid>

      <Grid size={{ xs: 12, xl: 5 }}>
        <FollowUps followUps={data.followUps} />
      </Grid>

      <Grid size={12}>
        <RecentCompanies companies={data.recentCompanies} />
      </Grid>
    </Grid>
  );
};

function RecentContacts({ contacts }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <SectionTitle title="Recent contacts" icon="material-symbols:contacts-outline-rounded" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.length ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.first_name} {contact.last_name}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.phone || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRow colSpan={3} label="No contacts yet" />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function FollowUps({ followUps }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <SectionTitle title="Upcoming follow-ups" icon="material-symbols:event-upcoming-outline-rounded" />
      <Stack spacing={1.5}>
        {followUps.length ? (
          followUps.map((lead) => (
            <Box
              key={lead.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="subtitle2">
                  {lead.contacts
                    ? `${lead.contacts.first_name} ${lead.contacts.last_name}`
                    : lead.companies?.name || 'Lead follow-up'}
                </Typography>
                <Chip size="small" label={lead.status} color="primary" variant="soft" />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatDateTime(lead.next_follow_up_at)}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No scheduled follow-ups yet.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function RecentCompanies({ companies }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <SectionTitle title="Recent companies" icon="material-symbols:business-center-outline-rounded" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length ? (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.company_type || '-'}</TableCell>
                  <TableCell>{[company.city, company.region].filter(Boolean).join(', ') || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRow colSpan={3} label="No companies yet" />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function SectionTitle({ title, icon }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
      <IconifyIcon icon={icon} sx={{ color: 'text.secondary', fontSize: 22 }} />
      <Typography variant="h6">{title}</Typography>
    </Stack>
  );
}

function EmptyRow({ colSpan, label }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function formatDateTime(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default CRM;
