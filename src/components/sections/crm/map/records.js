import paths from 'routes/paths';
import { formatLeadStatus } from 'components/sections/crm/constants';

export async function fetchMapRecords(supabase) {
  const [contactsResult, leadsResult, companiesResult] = await Promise.all([
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
      .order('created_at', { ascending: false }),
    supabase.from('companies')
      .select('id, name, account_number, address_line1, address_line2, city, region, postal_code, country, latitude, longitude')
      .order('name'),
  ]);

  const queryError = contactsResult.error || leadsResult.error || companiesResult.error;
  if (queryError) throw queryError;
  return [
    ...(contactsResult.data || []).map(contactToMapRecord),
    ...(leadsResult.data || []).map(leadToMapRecord),
    ...(companiesResult.data || []).map(companyToMapRecord),
  ];
}

function companyToMapRecord(company) {
  return {
    id: `company-${company.id}`,
    kind: 'company',
    title: company.name,
    subtitle: company.account_number,
    address: formatAddress(company),
    coordinates: getCoordinates(company),
    href: paths.companyDetails(company.id),
  };
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
    converted: lead.status === 'converted',
    title: lead.companies?.name || (lead.contacts ? contactName(lead.contacts) : '') || (lead.account_number ? `Account ${lead.account_number}` : '') || lead.source || 'Lead',
    subtitle: [formatLeadStatus(lead.status), lead.account_number, lead.source, formatCurrency(lead.estimated_budget)].filter((value) => value && value !== '-').join(' · '),
    address,
    coordinates,
    href: paths.leadDetails(lead.id),
  };
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

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Unnamed contact';
}

function formatCurrency(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}
