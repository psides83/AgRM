'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Link,
  LinearProgress,
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
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import IconifyIcon from 'components/base/IconifyIcon';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';
import { findPotentialDuplicates } from 'components/sections/crm/shared/duplicateRecords';

const importTypes = [
  { value: 'contacts', label: 'Contacts' },
  { value: 'leads', label: 'Leads' },
  { value: 'contacts_and_leads', label: 'Contacts and Leads' },
];

const fieldLabels = {
  firstName: 'First Name',
  lastName: 'Last Name',
  fullName: 'Full Name',
  title: 'Title',
  accountNumber: 'Account Number',
  email: 'Email',
  phone: 'Phone',
  mobilePhone: 'Mobile Phone',
  tags: 'Tags',
  companyName: 'Company Name',
  companyType: 'Company Type',
  website: 'Website',
  companyPhone: 'Company Phone',
  companyEmail: 'Company Email',
  addressLine1: 'Address',
  addressLine2: 'Address 2',
  city: 'City',
  region: 'State / Region',
  postalCode: 'Postal Code',
  country: 'Country',
  latitude: 'Latitude',
  longitude: 'Longitude',
  notes: 'Contact Notes',
  leadSource: 'Lead Source',
  leadAccountNumber: 'Lead Account Number',
  leadStatus: 'Lead Status',
  priority: 'Priority',
  estimatedBudget: 'Estimated Budget',
  targetPurchaseDate: 'Target Purchase Date',
  lastContactedAt: 'Last Contacted',
  nextFollowUpAt: 'Next Follow-up',
  leadLatitude: 'Lead Latitude',
  leadLongitude: 'Lead Longitude',
  leadNotes: 'Lead Notes',
};

const fieldAliases = {
  firstName: ['first', 'firstname', 'first_name', 'givenname', 'given_name'],
  lastName: ['last', 'lastname', 'last_name', 'surname', 'familyname', 'family_name'],
  fullName: ['name', 'fullname', 'full_name', 'contact', 'contactname', 'contact_name', 'customer', 'customername'],
  title: ['title', 'jobtitle', 'job_title', 'role', 'position'],
  accountNumber: [
    'account',
    'accountnu',
    'accountnum',
    'account_num',
    'accountno',
    'account_no',
    'accountnbr',
    'account_nbr',
    'accountnumber',
    'account_number',
    'acct',
    'acctnum',
    'acct_num',
    'acctno',
    'acct_no',
    'acctnbr',
    'acct_nbr',
    'acctnumber',
    'acct_number',
    'custnum',
    'cust_num',
    'custno',
    'cust_no',
    'custnbr',
    'cust_nbr',
    'custnumber',
    'cust_number',
    'customernum',
    'customer_num',
    'customerno',
    'customer_no',
    'customernbr',
    'customer_nbr',
    'customernumber',
    'customer_number',
  ],
  email: ['email', 'emailaddress', 'email_address', 'contactemail', 'contact_email'],
  phone: ['phone', 'phonenumber', 'phone_number', 'officephone', 'office_phone', 'workphone', 'work_phone'],
  mobilePhone: ['mobile', 'mobilephone', 'mobile_phone', 'cell', 'cellphone', 'cell_phone'],
  tags: ['tags', 'tag', 'labels', 'categories'],
  companyName: ['company', 'companyname', 'company_name', 'business', 'businessname', 'account', 'accountname', 'organization', 'organisation'],
  companyType: ['companytype', 'company_type', 'businesstype', 'business_type', 'accounttype', 'account_type'],
  website: ['website', 'site', 'url', 'web'],
  companyPhone: ['companyphone', 'company_phone', 'businessphone', 'business_phone', 'accountphone', 'account_phone'],
  companyEmail: ['companyemail', 'company_email', 'businessemail', 'business_email', 'accountemail', 'account_email'],
  addressLine1: ['address', 'address1', 'address_1', 'street', 'streetaddress', 'street_address', 'mailingaddress'],
  addressLine2: ['address2', 'address_2', 'suite', 'unit', 'apt', 'apartment'],
  city: ['city', 'town'],
  region: ['state', 'region', 'province', 'st'],
  postalCode: ['zip', 'zipcode', 'zip_code', 'postal', 'postalcode', 'postal_code'],
  country: ['country'],
  latitude: ['lat', 'latitude', 'contactlat', 'contact_lat', 'contactlatitude'],
  longitude: ['lng', 'lon', 'long', 'longitude', 'contactlng', 'contact_lng', 'contactlongitude'],
  notes: ['notes', 'note', 'contactnotes', 'contact_notes', 'comments', 'comment'],
  leadSource: ['source', 'leadsource', 'lead_source', 'origin'],
  leadAccountNumber: ['leadaccount', 'lead_account', 'leadaccountnumber', 'lead_account_number', 'leadacct', 'lead_acct', 'leadcustomernumber', 'lead_customer_number'],
  leadStatus: ['status', 'leadstatus', 'lead_status'],
  priority: ['priority', 'leadpriority', 'lead_priority'],
  estimatedBudget: ['budget', 'estimatedbudget', 'estimated_budget', 'amount', 'dealamount', 'deal_amount'],
  targetPurchaseDate: ['targetpurchasedate', 'target_purchase_date', 'purchasedate', 'purchase_date'],
  lastContactedAt: ['lastcontacted', 'last_contacted', 'lastcontactedat', 'last_contacted_at'],
  nextFollowUpAt: ['nextfollowup', 'next_follow_up', 'nextfollowupat', 'next_follow_up_at', 'followup', 'follow_up'],
  leadLatitude: ['leadlat', 'lead_lat', 'leadlatitude', 'lead_latitude'],
  leadLongitude: ['leadlng', 'lead_lng', 'leadlongitude', 'lead_longitude'],
  leadNotes: ['leadnotes', 'lead_notes', 'leadcomment', 'lead_comment'],
};

const CRMImport = () => {
  const supabase = useMemo(() => createClient(), []);
  const [importType, setImportType] = useState('contacts_and_leads');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [previewRows, setPreviewRows] = useState([]);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const duplicateCount = previewRows.filter((row) => row.duplicates.length).length;
  const importableCount = previewRows.filter((row) => row.isValid && (includeDuplicates || !row.duplicates.length)).length;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const text = await file.text();
      const { headers: nextHeaders, rows } = parseCsv(text);
      const nextFieldMap = buildFieldMap(nextHeaders);
      const nextPreviewRows = rows.slice(0, 250).map((row, index) => normalizeImportRow(row, nextHeaders, nextFieldMap, importType, index));
      const rowsWithDuplicates = await markDuplicates(supabase, nextPreviewRows);

      setHeaders(nextHeaders);
      setFieldMap(nextFieldMap);
      setPreviewRows(rowsWithDuplicates);
    } catch (nextError) {
      setError(nextError.message || 'Could not read this CSV file.');
    } finally {
      setIsAnalyzing(false);
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    setError(null);
    setResult(null);
    setIsImporting(true);

    try {
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError || !userResult.user) throw new Error('You need to be logged in to import records.');

      const stats = { contacts: 0, leads: 0, skipped: 0 };
      const rowsToImport = previewRows.filter((row) => row.isValid && (includeDuplicates || !row.duplicates.length));
      stats.skipped = previewRows.length - rowsToImport.length;

      for (const row of rowsToImport) {
        const companyId = await saveCompany(supabase, userResult.user.id, row);
        const contactId = await saveContact(supabase, userResult.user.id, companyId, row);

        if (contactId) {
          stats.contacts += 1;
        }

        if (row.shouldCreateLead) {
          await saveLead(supabase, userResult.user.id, companyId, contactId, row);
          stats.leads += 1;
        }
      }

      setResult(stats);
    } catch (nextError) {
      setError(nextError.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Box sx={{ width: 1, maxWidth: 1, minWidth: 0, overflow: 'hidden' }}>
      <Box
        component="header"
        sx={{
          px: { xs: 2, md: 5 },
          py: 3,
          borderBottom: 1,
          borderColor: 'dividerLight',
          bgcolor: 'background.default',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-end' },
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <PageBreadcrumb
              items={[
                { label: 'Home', url: paths.crm },
                { label: 'Import', active: true },
              ]}
              sx={{ mb: 1 }}
            />
            <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 36 } }}>
              Import CSV
            </Typography>
          </Box>
          <Button
            href={paths.addContact}
            component={Link}
            underline="none"
            variant="soft"
            color="neutral"
            startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Add Manually
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 2, md: 3 } }}>
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Paper sx={{ width: 1, maxWidth: 1, overflow: 'hidden', p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                minWidth: 0,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6">{fileName ? 'CSV loaded' : 'CSV Upload'}</Typography>
                <Typography variant="body2" noWrap={Boolean(fileName)} title={fileName || undefined} sx={{ maxWidth: { xs: 1, md: 560 }, color: 'text.secondary' }}>
                  {fileName || 'Column headers are matched automatically before import.'}
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexShrink: 0 }}>
                <TextField select label="Import Type" value={importType} onChange={(event) => setImportType(event.target.value)} sx={{ minWidth: { xs: 1, sm: 220 } }}>
                  {importTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button component="label" variant="contained" startIcon={<IconifyIcon icon="material-symbols:upload-file-rounded" />} sx={{ minHeight: 48 }}>
                  Choose CSV
                  <Box component="input" type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {isAnalyzing && <LinearProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity="success">
              Imported {result.contacts} contact
              {result.contacts === 1 ? '' : 's'} and {result.leads} lead
              {result.leads === 1 ? '' : 's'}. Skipped {result.skipped} row
              {result.skipped === 1 ? '' : 's'}.
            </Alert>
          )}

          {headers.length > 0 && (
            <Stack spacing={3} sx={{ minWidth: 0 }}>
              <Paper sx={{ width: 1, maxWidth: 1, overflow: 'hidden', p: { xs: 2, md: 3 } }}>
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  spacing={2}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', lg: 'center' },
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(4, minmax(0, 1fr))',
                      },
                      gap: 1.5,
                      flex: '1 1 auto',
                      minWidth: 0,
                    }}
                  >
                    <SummaryStat label="Rows" value={previewRows.length} />
                    <SummaryStat label="Ready" value={importableCount} color="success" />
                    <SummaryStat label="Review" value={previewRows.filter((row) => !row.isValid).length} color="warning" />
                    <SummaryStat label="Duplicates" value={duplicateCount} color="warning" />
                  </Box>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{
                      alignItems: { xs: 'stretch', sm: 'center' },
                      flexShrink: 0,
                    }}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={includeDuplicates} onChange={(event) => setIncludeDuplicates(event.target.checked)} />}
                      label="Include possible duplicates"
                      sx={{ m: 0 }}
                    />
                    <Button variant="contained" onClick={handleImport} loading={isImporting} disabled={!importableCount || isAnalyzing} sx={{ minHeight: 44 }}>
                      Import {importableCount} Row
                      {importableCount === 1 ? '' : 's'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              <Paper sx={{ width: 1, maxWidth: 1, overflow: 'hidden', p: { xs: 2, md: 3 } }}>
                <Stack spacing={1.5} sx={{ minWidth: 0 }}>
                  <SectionHeader title="Detected Fields" />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))',
                        xl: 'repeat(4, minmax(0, 1fr))',
                      },
                      gap: 1,
                      maxHeight: { xs: 260, lg: 188 },
                      overflowY: 'auto',
                      pr: 0.5,
                      minWidth: 0,
                    }}
                  >
                    {headers.map((header) => (
                      <FieldMapping key={header} header={header} field={fieldMap[header]} />
                    ))}
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ width: 1, maxWidth: 1, overflow: 'hidden', p: 0 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    px: { xs: 2, md: 3 },
                    py: 2,
                    borderBottom: 1,
                    borderColor: 'dividerLight',
                  }}
                >
                  <SectionHeader title="Preview Rows" />
                  {previewRows.length > 25 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Showing 25 of {previewRows.length} rows.
                    </Typography>
                  )}
                </Stack>
                <TableContainer sx={{ width: 1, maxWidth: 1, overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 1060, tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 72 }}>Row</TableCell>
                        <TableCell sx={{ width: 160 }}>Account #</TableCell>
                        <TableCell sx={{ width: 260 }}>Contact</TableCell>
                        <TableCell sx={{ width: 260 }}>Company</TableCell>
                        <TableCell sx={{ width: 180 }}>Lead</TableCell>
                        <TableCell sx={{ width: 128 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewRows.slice(0, 25).map((row) => (
                        <TableRow key={row.index}>
                          <TableCell>{row.index + 1}</TableCell>
                          <PreviewTableCell value={row.accountNumber || '-'} />
                          <PreviewTableCell value={[row.firstName, row.lastName].filter(Boolean).join(' ') || '-'} secondary={row.email || row.phone || row.mobilePhone} />
                          <PreviewTableCell value={row.companyName || '-'} />
                          <PreviewTableCell value={row.shouldCreateLead ? [row.leadAccountNumber, row.leadSource || 'Lead'].filter(Boolean).join(' · ') : '-'} />
                          <TableCell>
                            <RowStatus row={row} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

function SectionHeader({ title }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  );
}

function SummaryStat({ label, value, color = 'primary' }) {
  const palette =
    color === 'success'
      ? {
          borderColor: 'success.light',
          bgcolor: 'success.lighter',
          color: 'success.dark',
        }
      : color === 'warning'
        ? {
            borderColor: 'warning.light',
            bgcolor: 'warning.lighter',
            color: 'warning.dark',
          }
        : {
            borderColor: 'primary.light',
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
          };

  return (
    <Box
      sx={{
        minWidth: 0,
        border: 1,
        borderColor: palette.borderColor,
        borderRadius: 1,
        px: 2,
        py: 1.5,
        bgcolor: palette.bgcolor,
      }}
    >
      <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ lineHeight: 1.2, color: palette.color }}>
        {value}
      </Typography>
    </Box>
  );
}

function FieldMapping({ header, field }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0,
        border: 1,
        borderColor: 'dividerLight',
        borderRadius: 1,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography
        variant="body2"
        noWrap
        title={header}
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {header}
      </Typography>
      <Chip
        label={field ? fieldLabels[field] : 'Ignored'}
        size="small"
        variant="soft"
        color={field ? 'primary' : 'neutral'}
        sx={{
          flexShrink: 0,
          maxWidth: 160,
          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
    </Stack>
  );
}

function PreviewTableCell({ value, secondary }) {
  return (
    <TableCell sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" noWrap title={value} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Typography>
      {secondary && (
        <Typography
          variant="caption"
          noWrap
          title={secondary}
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'text.secondary',
          }}
        >
          {secondary}
        </Typography>
      )}
    </TableCell>
  );
}

function RowStatus({ row }) {
  if (!row.isValid) return <Chip label={row.errors.join(', ')} size="small" color="warning" variant="soft" />;
  if (row.duplicates.length) return <Chip label="Possible duplicate" size="small" color="warning" variant="soft" />;
  return <Chip label="Ready" size="small" color="success" variant="soft" />;
}

async function markDuplicates(supabase, rows) {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.isValid) return row;

      const checks = [];
      if (row.companyName) {
        checks.push({
          type: 'company',
          record: {
            name: row.companyName,
            email: row.companyEmail,
            phone: row.companyPhone,
          },
        });
      }
      if (row.shouldCreateContact) {
        checks.push({
          type: 'contact',
          record: {
            firstName: row.firstName,
            lastName: row.lastName,
            accountNumber: row.accountNumber,
            email: row.email,
            phone: row.phone,
            mobilePhone: row.mobilePhone,
          },
        });
      }
      if (row.shouldCreateLead) {
        checks.push({
          type: 'lead',
          record: {
            source: row.leadSource,
            accountNumber: row.leadAccountNumber,
          },
        });
      }

      const duplicates = checks.length ? await findPotentialDuplicates(supabase, checks) : [];
      return { ...row, duplicates };
    }),
  );
}

function normalizeImportRow(rawRow, headers, fieldMap, importType, index) {
  const row = { index, raw: rawRow, duplicates: [], errors: [] };

  headers.forEach((header) => {
    const field = fieldMap[header];
    if (!field) return;
    row[field] = cleanText(rawRow[header]) || '';
  });

  if (!row.firstName && !row.lastName && row.fullName) {
    const nameParts = row.fullName.split(/\s+/).filter(Boolean);
    row.firstName = nameParts.shift() || '';
    row.lastName = nameParts.join(' ');
  }

  row.country = row.country || 'US';
  row.leadStatus = normalizeLeadStatus(row.leadStatus) || 'new';
  row.priority = normalizePriority(row.priority);
  row.tags = parseList(row.tags);
  row.latitude = cleanNumber(row.latitude);
  row.longitude = cleanNumber(row.longitude);
  row.leadLatitude = cleanNumber(row.leadLatitude);
  row.leadLongitude = cleanNumber(row.leadLongitude);

  row.shouldCreateContact = importType !== 'leads' || Boolean(row.firstName || row.lastName || row.accountNumber || row.email || row.phone || row.mobilePhone);
  row.shouldCreateLead = importType !== 'contacts' && (hasLeadData(row) || (importType === 'leads' && hasCustomerData(row)));

  if (row.shouldCreateContact && (!row.firstName || !row.lastName)) {
    row.errors.push('Contact needs first and last name');
  }

  if (!row.shouldCreateContact && !row.shouldCreateLead) {
    row.errors.push('No contact or lead data found');
  }

  row.isValid = row.errors.length === 0;
  return row;
}

function hasLeadData(row) {
  return Boolean(
    row.leadSource ||
    row.leadAccountNumber ||
    row.leadStatus !== 'new' ||
    row.priority !== 3 ||
    row.estimatedBudget ||
    row.targetPurchaseDate ||
    row.lastContactedAt ||
    row.nextFollowUpAt ||
    row.leadNotes ||
    row.leadLatitude !== null ||
    row.leadLongitude !== null,
  );
}

function hasCustomerData(row) {
  return Boolean(row.firstName || row.lastName || row.accountNumber || row.email || row.phone || row.mobilePhone || row.companyName);
}

async function saveCompany(supabase, ownerId, row) {
  if (!row.companyName) return null;

  const { data, error } = await supabase
    .from('companies')
    .upsert(
      {
        owner_id: ownerId,
        name: row.companyName,
        company_type: cleanText(row.companyType),
        website: cleanText(row.website),
        phone: cleanText(row.companyPhone || row.phone),
        email: cleanText(row.companyEmail),
        address_line1: cleanText(row.addressLine1),
        address_line2: cleanText(row.addressLine2),
        city: cleanText(row.city),
        region: cleanText(row.region),
        postal_code: cleanText(row.postalCode),
        country: cleanText(row.country) || 'US',
        latitude: row.latitude,
        longitude: row.longitude,
      },
      { onConflict: 'owner_id,name' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function saveContact(supabase, ownerId, companyId, row) {
  if (!row.shouldCreateContact) return null;

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      owner_id: ownerId,
      company_id: companyId,
      first_name: row.firstName,
      last_name: row.lastName,
      title: cleanText(row.title),
      account_number: cleanText(row.accountNumber),
      email: cleanText(row.email),
      phone: cleanText(row.phone),
      mobile_phone: cleanText(row.mobilePhone),
      address_line1: cleanText(row.addressLine1),
      address_line2: cleanText(row.addressLine2),
      city: cleanText(row.city),
      region: cleanText(row.region),
      postal_code: cleanText(row.postalCode),
      country: cleanText(row.country) || 'US',
      latitude: row.latitude,
      longitude: row.longitude,
      tags: row.tags,
      notes: cleanText(row.notes),
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function saveLead(supabase, ownerId, companyId, contactId, row) {
  const { error } = await supabase.from('leads').insert({
    owner_id: ownerId,
    company_id: companyId,
    contact_id: contactId,
    source: cleanText(row.leadSource),
    account_number: cleanText(row.leadAccountNumber),
    status: row.leadStatus,
    priority: row.priority,
    estimated_budget: row.estimatedBudget || null,
    target_purchase_date: row.targetPurchaseDate || null,
    last_contacted_at: row.lastContactedAt || null,
    next_follow_up_at: row.nextFollowUpAt || null,
    latitude: row.leadLatitude ?? row.latitude,
    longitude: row.leadLongitude ?? row.longitude,
    notes: cleanText(row.leadNotes || row.notes),
  });

  if (error) throw error;
}

function buildFieldMap(headers) {
  return headers.reduce((map, header) => {
    const field = detectField(header);
    return field ? { ...map, [header]: field } : map;
  }, {});
}

function detectField(header) {
  const normalized = normalizeHeader(header);
  const tokens = String(header || '')
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .filter(Boolean);
  const hasAccountToken = tokens.some((token) => ['account', 'acct', 'customer', 'cust'].includes(token));
  const hasNumberToken = tokens.some((token) => ['nu', 'num', 'no', 'nbr', 'number', 'id', '#'].includes(token));

  if ((hasAccountToken && hasNumberToken) || /^(account|acct|cust|customer)(nu|num|no|nbr|number|id)$/.test(normalized)) {
    return 'accountNumber';
  }

  return Object.entries(fieldAliases).find(([, aliases]) => aliases.map(normalizeHeader).includes(normalized))?.[0] || null;
}

function parseCsv(text) {
  const lines = parseCsvRows(text).filter((row) => row.some((value) => cleanText(value)));
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row.');

  const headers = lines[0].map((header) => cleanText(header)).filter(Boolean);
  const rows = lines.slice(1).map((values) =>
    headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {}),
  );

  return { headers, rows };
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value);
  rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function cleanNumber(value) {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseList(value) {
  return String(value || '')
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeLeadStatus(value) {
  const normalized = normalizeHeader(value);
  return ['new', 'working', 'qualified', 'unqualified', 'converted'].find((status) => normalizeHeader(status) === normalized) || null;
}

function normalizePriority(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 3;
  return Math.min(Math.max(Math.round(number), 1), 5);
}

export default CRMImport;
