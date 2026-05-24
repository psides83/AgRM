import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/server';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';

async function getSearchResults(rawQuery) {
  const query = cleanQuery(rawQuery);

  if (!query) {
    return { query, results: emptyResults() };
  }

  const supabase = await createClient();
  const pattern = `%${query}%`;

  const [contactsResult, companiesResult, leadsResult, dealsResult, equipmentResult] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, first_name, last_name, title, email, phone, mobile_phone, city, region, companies(id, name)')
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},mobile_phone.ilike.${pattern},title.ilike.${pattern}`)
      .order('last_name', { ascending: true })
      .limit(25),
    supabase
      .from('companies')
      .select('id, name, company_type, email, phone, website, city, region')
      .or(`name.ilike.${pattern},company_type.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},city.ilike.${pattern},region.ilike.${pattern}`)
      .order('name', { ascending: true })
      .limit(25),
    supabase
      .from('leads')
      .select('id, source, status, priority, estimated_budget, next_follow_up_at, notes, contacts(id, first_name, last_name), companies(id, name)')
      .or(`source.ilike.${pattern},notes.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('deals')
      .select('id, name, stage, amount, probability, expected_close_date, notes, contacts(id, first_name, last_name), companies(id, name)')
      .or(`name.ilike.${pattern},notes.ilike.${pattern},lost_reason.ilike.${pattern}`)
      .order('updated_at', { ascending: false })
      .limit(25),
    supabase
      .from('equipment_interests')
      .select(
        `
        id,
        contact_id,
        lead_id,
        deal_id,
        category,
        stock_number,
        serial_number,
        make,
        model,
        model_year,
        condition,
        price_min,
        price_max,
        trade_in,
        notes,
        contacts(id, first_name, last_name, companies(id, name)),
        leads(id, source, status, companies(id, name)),
        deals(id, name, stage, companies(id, name))
      `
      )
      .or(`make.ilike.${pattern},model.ilike.${pattern},stock_number.ilike.${pattern},serial_number.ilike.${pattern},notes.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  const queryError = [contactsResult.error, companiesResult.error, leadsResult.error, dealsResult.error, equipmentResult.error].find(Boolean);
  if (queryError) throw queryError;

  return {
    query,
    results: {
      contacts: contactsResult.data || [],
      companies: companiesResult.data || [],
      leads: leadsResult.data || [],
      deals: dealsResult.data || [],
      equipment: equipmentResult.data || [],
    },
  };
}

const CRMSearch = async ({ query: rawQuery }) => {
  let data;

  try {
    data = await getSearchResults(rawQuery);
  } catch (error) {
    return <Alert severity="error">Could not run CRM search. {error.message}</Alert>;
  }

  const { query, results } = data;
  const total = Object.values(results).reduce((sum, items) => sum + items.length, 0);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="CRM Search"
          breadcrumb={[
            { label: 'Home', url: paths.crm },
            { label: 'Search', active: true },
          ]}
        />
      </Grid>

      <Grid size={12}>
        <Paper component="form" action={paths.crmSearch} method="get" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <TextField
              name="q"
              defaultValue={query}
              label="Search CRM"
              placeholder="Search contacts, companies, leads, deals, equipment..."
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" startIcon={<IconifyIcon icon="material-symbols:search-rounded" />}>
              Search
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {query ? `${total} result${total === 1 ? '' : 's'} for "${query}"` : 'Enter a search term to find CRM records.'}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <ResultGroup title="Contacts" icon="material-symbols:contacts-outline-rounded" count={results.contacts.length}>
          {results.contacts.length ? results.contacts.map((contact) => (
            <ResultRow
              key={contact.id}
              href={paths.contactDetails(contact.id)}
              title={contactName(contact)}
              subtitle={[contact.title, contact.companies?.name, contact.email, contact.mobile_phone || contact.phone].filter(Boolean).join(' · ')}
              chip="Contact"
            />
          )) : <EmptyState query={query} label="No matching contacts" />}
        </ResultGroup>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <ResultGroup title="Companies" icon="material-symbols:business-center-outline-rounded" count={results.companies.length}>
          {results.companies.length ? results.companies.map((company) => (
            <ResultRow
              key={company.id}
              href={paths.companyDetails(company.id)}
              title={company.name}
              subtitle={[formatEnum(company.company_type), company.city, company.region, company.email || company.phone].filter(Boolean).join(' · ')}
              chip="Company"
            />
          )) : <EmptyState query={query} label="No matching companies" />}
        </ResultGroup>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <ResultGroup title="Leads" icon="material-symbols:filter-alt-outline-rounded" count={results.leads.length}>
          {results.leads.length ? results.leads.map((lead) => (
            <ResultRow
              key={lead.id}
              href={paths.leadDetails(lead.id)}
              title={entityName(lead)}
              subtitle={[lead.source, `Budget ${formatCurrency(lead.estimated_budget)}`, `Follow-up ${formatDateTime(lead.next_follow_up_at)}`].filter(Boolean).join(' · ')}
              chip={formatEnum(lead.status)}
            />
          )) : <EmptyState query={query} label="No matching leads" />}
        </ResultGroup>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <ResultGroup title="Deals" icon="material-symbols:handshake-outline-rounded" count={results.deals.length}>
          {results.deals.length ? results.deals.map((deal) => (
            <ResultRow
              key={deal.id}
              href={paths.dealDetails(deal.id)}
              title={deal.name}
              subtitle={[entityName(deal), formatCurrency(deal.amount), `Close ${formatDate(deal.expected_close_date)}`].filter(Boolean).join(' · ')}
              chip={formatEnum(deal.stage)}
            />
          )) : <EmptyState query={query} label="No matching deals" />}
        </ResultGroup>
      </Grid>

      <Grid size={12}>
        <ResultGroup title="Equipment Interests" icon="material-symbols:agriculture-outline-rounded" count={results.equipment.length}>
          {results.equipment.length ? results.equipment.map((interest) => (
            <ResultRow
              key={interest.id}
              href={equipmentHref(interest)}
              title={equipmentName(interest)}
              subtitle={[formatEnum(interest.category), formatEnum(interest.condition), equipmentOwner(interest), `Budget ${equipmentBudget(interest)}`].filter(Boolean).join(' · ')}
              chip={interest.trade_in ? 'Trade-in' : 'Interest'}
            />
          )) : <EmptyState query={query} label="No matching equipment interests" />}
        </ResultGroup>
      </Grid>
    </Grid>
  );
};

function ResultGroup({ title, icon, count, children }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconifyIcon icon={icon} sx={{ color: 'text.secondary', fontSize: 22 }} />
          <Typography variant="h6">{title}</Typography>
        </Stack>
        <Chip label={count} size="small" variant="soft" color="primary" />
      </Stack>
      <Stack direction="column" divider={<Divider flexItem />} spacing={1.5}>
        {children}
      </Stack>
    </Paper>
  );
}

function ResultRow({ title, subtitle, chip, href }) {
  return (
    <Box sx={{ py: 0.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            <Link href={href} underline="hover" color="text.primary">
              {title}
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
            {subtitle || '-'}
          </Typography>
        </Box>
        {chip && <Chip label={chip} size="small" variant="soft" color="neutral" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />}
      </Stack>
    </Box>
  );
}

function EmptyState({ query, label }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
      {query ? label : 'Start a search to see results.'}
    </Typography>
  );
}

function emptyResults() {
  return {
    contacts: [],
    companies: [],
    leads: [],
    deals: [],
    equipment: [],
  };
}

function cleanQuery(value) {
  return String(value || '')
    .trim()
    .replace(/[%,]/g, '')
    .slice(0, 80);
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Unnamed contact';
}

function entityName(record) {
  return contactName(record.contacts) !== 'Unnamed contact' ? contactName(record.contacts) : record.companies?.name || record.name || 'CRM record';
}

function equipmentName(interest) {
  return [interest.model_year, interest.make, interest.model].filter(Boolean).join(' ') || interest.stock_number || interest.serial_number || formatEnum(interest.category);
}

function equipmentOwner(interest) {
  if (interest.deals) return interest.deals.name;
  if (interest.leads) return interest.leads.source || interest.leads.companies?.name || 'Lead';
  if (interest.contacts) return contactName(interest.contacts);
  return '';
}

function equipmentHref(interest) {
  if (interest.deal_id) return paths.dealDetails(interest.deal_id);
  if (interest.lead_id) return paths.leadDetails(interest.lead_id);
  if (interest.contact_id) return paths.contactDetails(interest.contact_id);
  return paths.crmSearch;
}

function equipmentBudget(interest) {
  return [formatCurrency(interest.price_min), formatCurrency(interest.price_max)].filter((value) => value !== '-').join(' - ') || '-';
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return '-';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default CRMSearch;
