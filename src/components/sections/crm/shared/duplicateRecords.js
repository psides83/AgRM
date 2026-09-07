export async function findPotentialDuplicates(supabase, checks) {
  const results = await Promise.all(
    checks
      .filter((check) => check?.type && check?.record)
      .map((check) => findMatchesForType(supabase, check)),
  );

  return results.flat().filter(Boolean);
}

async function findMatchesForType(supabase, check) {
  if (check.type === 'company') return findCompanyMatches(supabase, check.record);
  if (check.type === 'contact') return findContactMatches(supabase, check.record);
  if (check.type === 'lead') return findLeadMatches(supabase, check.record);
  return [];
}

async function findCompanyMatches(supabase, company) {
  if (!hasText(company.name)) return [];

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, phone, email, city, region, postal_code')
    .limit(200);

  if (error) throw error;

  return (data || [])
    .map((candidate) => {
      const reasons = [
        exactText(company.name, candidate.name) && 'same name',
        similarText(company.name, candidate.name) && 'similar name',
        sameValue(company.email, candidate.email) && 'same email',
        samePhone(company.phone, candidate.phone) && 'same phone',
      ].filter(Boolean);

      return reasons.length
        ? {
            type: 'company',
            title: candidate.name,
            subtitle: [candidate.city, candidate.region, candidate.postal_code].filter(Boolean).join(', '),
            reasons,
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 5);
}

async function findContactMatches(supabase, contact) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  if (!hasText(fullName) && !hasText(contact.accountNumber) && !hasText(contact.email) && !hasText(contact.phone) && !hasText(contact.mobilePhone)) {
    return [];
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, title, account_number, email, phone, mobile_phone, companies(id, name)')
    .limit(300);

  if (error) throw error;

  return (data || [])
    .map((candidate) => {
      const candidateName = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ');
      const reasons = [
        exactText(fullName, candidateName) && 'same name',
        similarText(fullName, candidateName) && 'similar name',
        sameValue(contact.accountNumber, candidate.account_number) && 'same account number',
        sameValue(contact.email, candidate.email) && 'same email',
        samePhone(contact.phone, candidate.phone) && 'same phone',
        samePhone(contact.mobilePhone, candidate.mobile_phone) && 'same mobile phone',
      ].filter(Boolean);

      return reasons.length
        ? {
            type: 'contact',
            title: candidateName || 'Unnamed contact',
            subtitle: [candidate.account_number, candidate.title, candidate.companies?.name].filter(Boolean).join(' · '),
            reasons,
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 5);
}

async function findLeadMatches(supabase, lead) {
  if (!hasText(lead.source) && !hasText(lead.accountNumber) && !lead.contactId && !lead.companyId) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('id, source, account_number, status, contact_id, company_id, contacts(id, first_name, last_name), companies(id, name)')
    .neq('status', 'converted')
    .limit(300);

  if (error) throw error;

  return (data || [])
    .map((candidate) => {
      const candidateName = candidate.contacts
        ? [candidate.contacts.first_name, candidate.contacts.last_name].filter(Boolean).join(' ')
        : candidate.companies?.name;
      const reasons = [
        lead.contactId && lead.contactId === candidate.contact_id && 'same contact has an open lead',
        lead.companyId && lead.companyId === candidate.company_id && 'same company has an open lead',
        sameValue(lead.accountNumber, candidate.account_number) && 'same account number',
        hasText(lead.source) && exactText(lead.source, candidate.source) && 'same source',
        hasText(lead.source) && similarText(lead.source, candidate.source) && 'similar source',
      ].filter(Boolean);

      return reasons.length
        ? {
            type: 'lead',
            title: candidateName || candidate.source || 'Open lead',
            subtitle: [candidate.status, candidate.account_number, candidate.source].filter(Boolean).join(' · '),
            reasons,
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 5);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function exactText(left, right) {
  return normalizeText(left) && normalizeText(left) === normalizeText(right);
}

function similarText(left, right) {
  const leftText = normalizeText(left);
  const rightText = normalizeText(right);

  if (!leftText || !rightText || leftText === rightText) return false;
  if (leftText.includes(rightText) || rightText.includes(leftText)) return Math.min(leftText.length, rightText.length) >= 5;

  const leftTokens = new Set(leftText.split(' ').filter(Boolean));
  const rightTokens = new Set(rightText.split(' ').filter(Boolean));
  const sharedTokens = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const totalTokens = new Set([...leftTokens, ...rightTokens]).size;

  return totalTokens > 0 && sharedTokens / totalTokens >= 0.6;
}

function sameValue(left, right) {
  return normalizeText(left) && normalizeText(left) === normalizeText(right);
}

function samePhone(left, right) {
  const leftPhone = normalizePhone(left);
  const rightPhone = normalizePhone(right);
  return leftPhone.length >= 7 && leftPhone === rightPhone;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}
