import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
import { createClient } from 'lib/supabase/server';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';

const dealStages = ['lead', 'quoted', 'negotiation', 'won', 'lost'];

const metricCards = [
  {
    key: 'contacts',
    label: 'Contacts',
    icon: 'material-symbols:contacts-outline-rounded',
    color: 'primary.main',
  },
  {
    key: 'openLeads',
    label: 'Open leads',
    icon: 'material-symbols:filter-alt-outline-rounded',
    color: 'warning.main',
  },
  {
    key: 'openDeals',
    label: 'Open deals',
    icon: 'material-symbols:handshake-outline-rounded',
    color: 'info.main',
  },
  {
    key: 'equipmentInterests',
    label: 'Equipment interests',
    icon: 'material-symbols:agriculture-outline-rounded',
    color: 'success.main',
  },
];

async function getCount(supabase, table, filters = []) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  filters.forEach(([method, ...args]) => {
    query = query[method](...args);
  });

  const { count, error } = await query;

  if (error) throw error;

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
    openLeads,
    openDeals,
    equipmentInterests,
    leadsResult,
    leadFollowUpsResult,
    activityFollowUpsResult,
    dealsResult,
    activitiesResult,
    notesResult,
  ] = await Promise.all([
    getCount(supabase, 'contacts'),
    getCount(supabase, 'leads', [['neq', 'status', 'converted']]),
    getCount(supabase, 'deals', [['not', 'stage', 'in', '("won","lost")']]),
    getCount(supabase, 'equipment_interests'),
    supabase
      .from('leads')
      .select(
        `
        id,
        status,
        source,
        priority,
        estimated_budget,
        next_follow_up_at,
        created_at,
        contacts(id, first_name, last_name),
        companies(id, name)
      `
      )
      .neq('status', 'converted')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('leads')
      .select(
        `
        id,
        status,
        next_follow_up_at,
        contacts(id, first_name, last_name),
        companies(id, name)
      `
      )
      .neq('status', 'converted')
      .not('next_follow_up_at', 'is', null)
      .order('next_follow_up_at', { ascending: true })
      .limit(8),
    supabase
      .from('activities')
      .select(
        `
        id,
        type,
        subject,
        due_at,
        contact_id,
        company_id,
        lead_id,
        deal_id,
        contacts(id, first_name, last_name),
        companies(id, name),
        deals(id, name)
      `
      )
      .is('completed_at', null)
      .not('due_at', 'is', null)
      .order('due_at', { ascending: true })
      .limit(8),
    supabase
      .from('deals')
      .select(
        `
        id,
        name,
        stage,
        amount,
        probability,
        expected_close_date,
        contacts(id, first_name, last_name),
        companies(id, name)
      `
      )
      .order('updated_at', { ascending: false })
      .limit(12),
    supabase
      .from('activities')
      .select(
        `
        id,
        type,
        subject,
        body,
        occurred_at,
        contacts(id, first_name, last_name),
        companies(id, name),
        deals(id, name)
      `
      )
      .order('occurred_at', { ascending: false })
      .limit(6),
    supabase
      .from('notes')
      .select(
        `
        id,
        body,
        pinned,
        created_at,
        contacts(id, first_name, last_name),
        companies(id, name),
        deals(id, name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const queryError = [
    leadsResult.error,
    leadFollowUpsResult.error,
    activityFollowUpsResult.error,
    dealsResult.error,
    activitiesResult.error,
    notesResult.error,
  ].find(Boolean);

  if (queryError) throw queryError;

  const followUps = [
    ...(leadFollowUpsResult.data || []).map((lead) => ({
      id: `lead-${lead.id}`,
      type: 'lead',
      label: entityName(lead),
      subject: 'Lead follow-up',
      dueAt: lead.next_follow_up_at,
      status: lead.status,
      href: paths.leadDetails(lead.id),
    })),
    ...(activityFollowUpsResult.data || []).map((activity) => ({
      id: `activity-${activity.id}`,
      type: activity.type,
      label: entityName(activity),
      subject: activity.subject,
      dueAt: activity.due_at,
      status: activity.type,
      href: activityHref(activity),
    })),
  ]
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 6);

  const timeline = [
    ...(activitiesResult.data || []).map((activity) => ({
      id: `activity-${activity.id}`,
      kind: activity.type,
      title: activity.subject,
      body: activity.body,
      at: activity.occurred_at,
      entity: entityName(activity),
      icon: activityIcon(activity.type),
    })),
    ...(notesResult.data || []).map((note) => ({
      id: `note-${note.id}`,
      kind: note.pinned ? 'pinned note' : 'note',
      title: note.pinned ? 'Pinned note' : 'Note',
      body: note.body,
      at: note.created_at,
      entity: entityName(note),
      icon: 'material-symbols:sticky-note-2-outline-rounded',
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return {
    user,
    counts: {
      contacts,
      openLeads,
      openDeals,
      equipmentInterests,
    },
    leads: leadsResult.data || [],
    deals: dealsResult.data || [],
    followUps,
    timeline,
  };
}

const CRM = async () => {
  let data;

  try {
    data = await getDashboardData();
  } catch (error) {
    return <Alert severity="error">Could not load CRM dashboard data. {error.message}</Alert>;
  }

  if (!data.user) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={3}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}
          >
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                AgRM dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Leads, follow-ups, deals, and recent relationship activity.
              </Typography>
            </Box>
            <Stack direction="column" spacing={2} sx={{ width: { xs: 1, lg: 460 } }}>
              <CRMSearchForm />
              <QuickActions />
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {metricCards.map((metric) => (
        <Grid key={metric.key} size={{ xs: 12, sm: 6, xl: 3 }}>
          <Paper sx={{ p: 3, height: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <IconifyIcon icon={metric.icon} sx={{ fontSize: 34, color: metric.color }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
        <OpenLeads leads={data.leads} />
      </Grid>

      <Grid size={{ xs: 12, xl: 5 }}>
        <FollowUps followUps={data.followUps} />
      </Grid>

      <Grid size={{ xs: 12, xl: 5 }}>
        <DealsByStage deals={data.deals} />
      </Grid>

      <Grid size={{ xs: 12, xl: 7 }}>
        <RecentTimeline items={data.timeline} />
      </Grid>
    </Grid>
  );
};

function CRMSearchForm() {
  return (
    <Stack component="form" action={paths.crmSearch} method="get" direction="row" spacing={1}>
      <TextField
        name="q"
        size="small"
        label="Search CRM"
        placeholder="Contacts, companies, deals..."
        fullWidth
      />
      <Button type="submit" variant="soft" color="neutral" startIcon={<IconifyIcon icon="material-symbols:search-rounded" />}>
        Search
      </Button>
    </Stack>
  );
}

function QuickActions() {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button
        href={paths.addContact}
        component={Link}
        underline="none"
        variant="contained"
        startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
      >
        Add Contact
      </Button>
      <Button
        href={paths.addContact}
        component={Link}
        underline="none"
        variant="soft"
        color="neutral"
        startIcon={<IconifyIcon icon="material-symbols:add-task-outline-rounded" />}
      >
        Add Lead
      </Button>
      <Button
        href={paths.contacts}
        component={Link}
        underline="none"
        variant="soft"
        color="neutral"
        startIcon={<IconifyIcon icon="material-symbols:edit-note-outline-rounded" />}
      >
        Add Note
      </Button>
    </Stack>
  );
}

function OpenLeads({ leads }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <SectionTitle title="Recent open leads" icon="material-symbols:filter-alt-outline-rounded" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Lead</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Follow-up</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length ? (
              leads.map((lead) => (
                <TableRow key={lead.id} hover>
                  <TableCell>
                    <Link
                      href={paths.leadDetails(lead.id)}
                      underline="hover"
                      sx={{ color: 'text.primary', fontWeight: 700 }}
                    >
                      {entityName(lead)}
                    </Link>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {lead.source || 'No source'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={formatEnum(lead.status)} color="primary" variant="soft" />
                  </TableCell>
                  <TableCell>{lead.priority || '-'}</TableCell>
                  <TableCell>{formatCurrency(lead.estimated_budget)}</TableCell>
                  <TableCell>{formatDateTime(lead.next_follow_up_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRow colSpan={5} label="No open leads yet" />
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
      <Stack direction="column" spacing={1.5}>
        {followUps.length ? (
          followUps.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="subtitle2">
                  <Link href={item.href} underline="hover" color="text.primary">
                    {item.label}
                  </Link>
                </Typography>
                <Chip size="small" label={formatEnum(item.status)} color="primary" variant="soft" />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.subject}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatDateTime(item.dueAt)}
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

function DealsByStage({ deals }) {
  const stageSummary = dealStages.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage);
    const amount = stageDeals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

    return {
      stage,
      count: stageDeals.length,
      amount,
    };
  });

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <SectionTitle title="Deals by stage" icon="material-symbols:view-kanban-outline-rounded" />
      <Stack direction="column" spacing={1.5}>
        {stageSummary.map((stage) => (
          <Box key={stage.stage}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="subtitle2">{formatEnum(stage.stage)}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {stage.count} / {formatCurrency(stage.amount)}
              </Typography>
            </Stack>
            <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'background.elevation2', overflow: 'hidden' }}>
              <Box
                sx={{
                  width: `${stage.count ? Math.min(100, stage.count * 18) : 2}%`,
                  height: 1,
                  bgcolor: stage.stage === 'lost' ? 'error.main' : stage.stage === 'won' ? 'success.main' : 'primary.main',
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function RecentTimeline({ items }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <SectionTitle title="Recent activities and notes" icon="material-symbols:history-rounded" />
      <Stack direction="column" divider={<Divider />} spacing={2}>
        {items.length ? (
          items.map((item) => (
            <Stack key={item.id} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <IconifyIcon icon={item.icon} sx={{ color: 'text.secondary', fontSize: 22, mt: 0.25 }} />
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Chip size="small" label={formatEnum(item.kind)} variant="soft" color="neutral" />
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
                  {item.entity}
                  {item.body ? ` - ${truncate(item.body, 120)}` : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatDateTime(item.at)}
                </Typography>
              </Box>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No recent activity yet.
          </Typography>
        )}
      </Stack>
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

function entityName(record) {
  const contactName = record.contacts
    ? [record.contacts.first_name, record.contacts.last_name].filter(Boolean).join(' ')
    : '';

  return contactName || record.companies?.name || record.deals?.name || record.name || 'CRM record';
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
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) return value || '';
  return `${value.slice(0, maxLength - 1)}...`;
}

function activityIcon(type) {
  const icons = {
    call: 'material-symbols:call-outline-rounded',
    text: 'material-symbols:sms-outline-rounded',
    email: 'material-symbols:mail-outline-rounded',
    visit: 'material-symbols:location-on-outline-rounded',
    demo: 'material-symbols:agriculture-outline-rounded',
    quote: 'material-symbols:request-quote-outline-rounded',
    task: 'material-symbols:task-alt-rounded',
    note: 'material-symbols:sticky-note-2-outline-rounded',
  };

  return icons[type] || 'material-symbols:history-rounded';
}

function activityHref(activity) {
  if (activity.deal_id) return paths.dealDetails(activity.deal_id);
  if (activity.lead_id) return paths.leadDetails(activity.lead_id);
  if (activity.contact_id) return paths.contactDetails(activity.contact_id);
  if (activity.company_id) return paths.companyDetails(activity.company_id);
  return paths.crm;
}

export default CRM;
