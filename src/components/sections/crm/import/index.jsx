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

const googleSavedCollectionFieldMap = {
  title: 'companyName',
  item_content_url: 'website',
  tags: 'tags',
  note: 'notes',
  comment: 'leadNotes',
};

const googleImportActions = [
  { value: 'create_lead', label: 'Create Lead' },
  { value: 'create_contact', label: 'Create Contact' },
  { value: 'attach_lead', label: 'Add to Lead' },
  { value: 'attach_contact', label: 'Add to Contact' },
  { value: 'skip', label: 'Skip' },
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
  county: 'County',
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
  initialContactDate: 'Initial Contact Date',
  initialContactNotes: 'Initial Contact Notes',
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
  county: ['county', 'parish'],
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
  initialContactDate: ['initialcontactdate', 'initial_contact_date', 'firstcontactdate', 'first_contact_date'],
  initialContactNotes: ['initialcontactnotes', 'initial_contact_notes', 'firstcontactnotes', 'first_contact_notes'],
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
  const [fileTypeLabel, setFileTypeLabel] = useState('');
  const [headers, setHeaders] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [previewRows, setPreviewRows] = useState([]);
  const [crmTargets, setCrmTargets] = useState({ contacts: [], leads: [] });
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isGoogleSavedCollection = fileTypeLabel === 'Google saved collections';
  const duplicateCount = previewRows.filter((row) => row.duplicates.length).length;
  const importableCount = previewRows.filter((row) => isImportableRow(row, includeDuplicates)).length;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileTypeLabel('');
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const text = await file.text();
      const { headers: nextHeaders, rows } = parseCsv(text);
      const isGoogleSavedCollection = isGoogleSavedCollectionsCsv(nextHeaders);
      const nextFieldMap = isGoogleSavedCollection ? buildGoogleSavedCollectionFieldMap(nextHeaders) : buildFieldMap(nextHeaders);
      const nextPreviewRows = rows.slice(0, 250).map((row, index) => normalizeImportRow(row, nextHeaders, nextFieldMap, importType, index, { isGoogleSavedCollection }));
      const rowsWithDuplicates = await markDuplicates(supabase, nextPreviewRows);

      setHeaders(nextHeaders);
      setFieldMap(nextFieldMap);
      setFileTypeLabel(isGoogleSavedCollection ? 'Google saved collections' : 'CSV');
      setPreviewRows(rowsWithDuplicates);
      setCrmTargets(isGoogleSavedCollection ? await fetchCrmTargets(supabase) : { contacts: [], leads: [] });
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

      const stats = { contacts: 0, leads: 0, mapUpdates: 0, skipped: 0 };
      const rowsToImport = previewRows.filter((row) => isImportableRow(row, includeDuplicates));
      stats.skipped = previewRows.length - rowsToImport.length;

      for (const row of rowsToImport) {
        if (row.isGoogleSavedCollection) {
          const googleStats = await saveGoogleSavedCollectionRow(supabase, userResult.user.id, row);
          stats.contacts += googleStats.contacts;
          stats.leads += googleStats.leads;
          stats.mapUpdates += googleStats.mapUpdates;
          continue;
        }

        const companyId = await saveCompany(supabase, userResult.user.id, row);
        const contactId = await saveContact(supabase, userResult.user.id, companyId, row);

        if (contactId) {
          stats.contacts += 1;
        }

        let leadId = null;
        if (row.shouldCreateLead) {
          leadId = await saveLead(supabase, userResult.user.id, companyId, contactId, row);
          stats.leads += 1;
        }

        await saveInitialContactActivity(supabase, userResult.user.id, companyId, contactId, leadId, row);
      }

      setResult(stats);
    } catch (nextError) {
      setError(nextError.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const updateGoogleImportRow = (rowIndex, changes) => {
    setPreviewRows((rows) => rows.map((row) => (row.index === rowIndex ? { ...row, ...changes } : row)));
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
              Import Records
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
        <Stack direction="column" spacing={3} sx={{ minWidth: 0 }}>
          <Paper
            sx={{
              width: 1,
              maxWidth: 1,
              overflow: 'hidden',
              p: { xs: 2, md: 3 },
            }}
          >
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
                <Typography variant="h6">{fileName ? `${fileTypeLabel || 'CSV'} loaded` : 'Upload File'}</Typography>
                <Typography variant="body2" noWrap={Boolean(fileName)} title={fileName || undefined} sx={{ maxWidth: { xs: 1, md: 560 }, color: 'text.secondary' }}>
                  {fileName || 'Upload a CSV or Google Saved Collections export.'}
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
                  Choose File
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
              {result.leads === 1 ? '' : 's'}
              {result.mapUpdates ? `, and updated ${result.mapUpdates} map ${result.mapUpdates === 1 ? 'record' : 'records'}` : ''}. Skipped {result.skipped} row
              {result.skipped === 1 ? '' : 's'}.
            </Alert>
          )}

          {headers.length > 0 && (
            <Stack direction="column" spacing={3} sx={{ minWidth: 0 }}>
              <Paper
                sx={{
                  width: 1,
                  maxWidth: 1,
                  overflow: 'hidden',
                  p: { xs: 2, md: 3 },
                }}
              >
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

              <Paper
                sx={{
                  width: 1,
                  maxWidth: 1,
                  overflow: 'hidden',
                  p: { xs: 2, md: 3 },
                }}
              >
                <Stack direction="column" spacing={1.5} sx={{ minWidth: 0 }}>
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
                  <Table sx={{ minWidth: isGoogleSavedCollection ? 1360 : 1060, tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 72 }}>Row</TableCell>
                        <TableCell sx={{ width: 160 }}>Account #</TableCell>
                        <TableCell sx={{ width: 260 }}>Contact</TableCell>
                        <TableCell sx={{ width: 260 }}>Company</TableCell>
                        <TableCell sx={{ width: isGoogleSavedCollection ? 220 : 180 }}>{isGoogleSavedCollection ? 'Action' : 'Lead'}</TableCell>
                        {isGoogleSavedCollection && <TableCell sx={{ width: 260 }}>Target</TableCell>}
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
                          {isGoogleSavedCollection ? (
                            <>
                              <TableCell>
                                <TextField
                                  select
                                  size="small"
                                  value={row.googleAction || 'create_lead'}
                                  onChange={(event) => updateGoogleImportRow(row.index, { googleAction: event.target.value, googleTargetId: '' })}
                                  fullWidth
                                >
                                  {googleImportActions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell>
                                <GoogleTargetSelect row={row} crmTargets={crmTargets} onChange={(googleTargetId) => updateGoogleImportRow(row.index, { googleTargetId })} />
                              </TableCell>
                            </>
                          ) : (
                            <PreviewTableCell value={row.shouldCreateLead ? [row.leadAccountNumber, row.leadSource || 'Lead'].filter(Boolean).join(' · ') : '-'} />
                          )}
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

function GoogleTargetSelect({ row, crmTargets, onChange }) {
  const action = row.googleAction || 'create_lead';
  const options = action === 'attach_contact' ? crmTargets.contacts : action === 'attach_lead' ? crmTargets.leads : [];
  const disabled = !['attach_contact', 'attach_lead'].includes(action);

  return (
    <TextField select size="small" value={disabled ? '' : row.googleTargetId || ''} onChange={(event) => onChange(event.target.value)} disabled={disabled} fullWidth>
      <MenuItem value="">{disabled ? 'Not needed' : 'Select target'}</MenuItem>
      {options.map((target) => (
        <MenuItem key={target.id} value={target.id}>
          {target.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function RowStatus({ row }) {
  if (!row.isValid) return <Chip label={row.errors.join(', ')} size="small" color="warning" variant="soft" />;
  if (row.googleAction === 'skip') return <Chip label="Skipped" size="small" color="neutral" variant="soft" />;
  if (['attach_contact', 'attach_lead'].includes(row.googleAction) && !row.googleTargetId) return <Chip label="Select target" size="small" color="warning" variant="soft" />;
  if (row.duplicates.length) return <Chip label="Possible duplicate" size="small" color="warning" variant="soft" />;
  return <Chip label="Ready" size="small" color="success" variant="soft" />;
}

function isImportableRow(row, includeDuplicates) {
  if (!row.isValid) return false;
  if (row.googleAction === 'skip') return false;
  if (['attach_contact', 'attach_lead'].includes(row.googleAction) && !row.googleTargetId) return false;
  return includeDuplicates || !row.duplicates.length || ['attach_contact', 'attach_lead'].includes(row.googleAction);
}

async function fetchCrmTargets(supabase) {
  const [contactsResult, leadsResult] = await Promise.all([
    supabase.from('contacts').select('id, first_name, last_name, account_number, email, companies(name)').order('created_at', { ascending: false }).limit(250),
    supabase
      .from('leads')
      .select('id, source, account_number, status, contacts(first_name, last_name), companies(name)')
      .neq('status', 'converted')
      .order('created_at', { ascending: false })
      .limit(250),
  ]);

  if (contactsResult.error) throw contactsResult.error;
  if (leadsResult.error) throw leadsResult.error;

  return {
    contacts: (contactsResult.data || []).map((contact) => ({
      id: contact.id,
      label: [contactName(contact), contact.account_number, contact.companies?.name, contact.email].filter(Boolean).join(' - '),
    })),
    leads: (leadsResult.data || []).map((lead) => ({
      id: lead.id,
      label: [lead.contacts ? contactName(lead.contacts) : lead.companies?.name || lead.source || 'Lead', lead.account_number, lead.status].filter(Boolean).join(' - '),
    })),
  };
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

function normalizeImportRow(rawRow, headers, fieldMap, importType, index, options = {}) {
  const row = {
    index,
    raw: rawRow,
    duplicates: [],
    errors: [],
    isGoogleSavedCollection: Boolean(options.isGoogleSavedCollection),
  };

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

  if (row.isGoogleSavedCollection) {
    const coordinates = parseGoogleMapsCoordinates(row.website);
    row.companyName = row.companyName || row.fullName || '';
    row.notes = buildSavedCollectionNotes(row);
    row.leadNotes = row.notes;
    row.leadSource = 'Google saved collection';
    row.googleAction = defaultGoogleAction(importType);
    row.latitude = coordinates?.latitude ?? row.latitude;
    row.longitude = coordinates?.longitude ?? row.longitude;
    row.leadLatitude = coordinates?.latitude ?? row.leadLatitude;
    row.leadLongitude = coordinates?.longitude ?? row.leadLongitude;

    if (importType === 'contacts') {
      const nameParts = row.companyName.split(/\s+/).filter(Boolean);
      row.firstName = nameParts.shift() || row.companyName;
      row.lastName = nameParts.join(' ') || 'Saved place';
      row.title = 'Google saved place';
    }

    if (!row.companyName) {
      row.errors.push('Saved entry needs a title');
    }
  }

  row.country = row.country || 'US';
  row.leadStatus = normalizeLeadStatus(row.leadStatus) || 'new';
  row.priority = normalizePriority(row.priority);
  row.tags = parseList(row.tags);
  row.latitude = cleanNumber(row.latitude);
  row.longitude = cleanNumber(row.longitude);
  row.leadLatitude = cleanNumber(row.leadLatitude);
  row.leadLongitude = cleanNumber(row.leadLongitude);
  row.initialContactDate = cleanDateTime(row.initialContactDate);

  row.shouldCreateContact = (importType !== 'leads' && !row.isGoogleSavedCollection) || Boolean(row.firstName || row.lastName || row.accountNumber || row.email || row.phone || row.mobilePhone);
  row.shouldCreateLead = importType !== 'contacts' && (hasLeadData(row) || (importType === 'leads' && hasCustomerData(row)));

  if (row.shouldCreateContact && (!row.firstName || !row.lastName)) {
    row.errors.push('Contact needs first and last name');
  }

  if (row.initialContactDate === false) {
    row.errors.push('Initial contact date is invalid');
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
        county: cleanText(row.county),
        region: cleanText(row.region),
        postal_code: cleanText(row.postalCode),
        country: cleanText(row.country) || 'US',
        latitude: row.latitude,
        longitude: row.longitude,
        notes: cleanText(row.notes),
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
      county: cleanText(row.county),
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
  const { data, error } = await supabase
    .from('leads')
    .insert({
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
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function saveGoogleSavedCollectionRow(supabase, ownerId, row) {
  const action = row.googleAction || 'create_lead';

  if (action === 'create_lead') {
    const companyId = await saveCompany(supabase, ownerId, row);
    await saveLead(supabase, ownerId, companyId, null, { ...row, shouldCreateLead: true });
    return { contacts: 0, leads: 1, mapUpdates: 0 };
  }

  if (action === 'create_contact') {
    const companyId = await saveCompany(supabase, ownerId, row);
    await saveContact(supabase, ownerId, companyId, googleRowToContact(row));
    return { contacts: 1, leads: 0, mapUpdates: 0 };
  }

  if (action === 'attach_contact') {
    await attachGoogleMapDataToContact(supabase, ownerId, row.googleTargetId, row);
    return { contacts: 0, leads: 0, mapUpdates: 1 };
  }

  if (action === 'attach_lead') {
    await attachGoogleMapDataToLead(supabase, ownerId, row.googleTargetId, row);
    return { contacts: 0, leads: 0, mapUpdates: 1 };
  }

  return { contacts: 0, leads: 0, mapUpdates: 0 };
}

async function attachGoogleMapDataToContact(supabase, ownerId, contactId, row) {
  const { data: contact, error: contactError } = await supabase.from('contacts').select('id, company_id, notes, tags, latitude, longitude').eq('id', contactId).single();
  if (contactError) throw contactError;

  const { error: updateError } = await supabase
    .from('contacts')
    .update({
      notes: appendText(contact.notes, buildSavedCollectionNotes(row)),
      tags: mergeTags(contact.tags, row.tags),
      latitude: row.latitude ?? contact.latitude,
      longitude: row.longitude ?? contact.longitude,
    })
    .eq('id', contactId);

  if (updateError) throw updateError;
  await updateCompanyMapUrl(supabase, contact.company_id, row.website);
  await insertGoogleMapNote(supabase, ownerId, { contactId, companyId: contact.company_id }, row);
}

async function attachGoogleMapDataToLead(supabase, ownerId, leadId, row) {
  const { data: lead, error: leadError } = await supabase.from('leads').select('id, contact_id, company_id, notes, latitude, longitude').eq('id', leadId).single();
  if (leadError) throw leadError;

  const { error: updateError } = await supabase
    .from('leads')
    .update({
      notes: appendText(lead.notes, buildSavedCollectionNotes(row)),
      latitude: row.leadLatitude ?? row.latitude ?? lead.latitude,
      longitude: row.leadLongitude ?? row.longitude ?? lead.longitude,
    })
    .eq('id', leadId);

  if (updateError) throw updateError;
  await updateCompanyMapUrl(supabase, lead.company_id, row.website);
  await insertGoogleMapNote(supabase, ownerId, { leadId, contactId: lead.contact_id, companyId: lead.company_id }, row);
}

async function updateCompanyMapUrl(supabase, companyId, website) {
  if (!companyId || !cleanText(website)) return;

  const { error } = await supabase
    .from('companies')
    .update({ website: cleanText(website) })
    .eq('id', companyId);
  if (error) throw error;
}

async function insertGoogleMapNote(supabase, ownerId, target, row) {
  const body = buildSavedCollectionNotes(row);
  if (!body) return;

  const { error } = await supabase.from('notes').insert({
    owner_id: ownerId,
    contact_id: target.contactId || null,
    company_id: target.companyId || null,
    lead_id: target.leadId || null,
    body,
  });

  if (error) throw error;
}

async function saveInitialContactActivity(supabase, ownerId, companyId, contactId, leadId, row) {
  if (!row.initialContactDate && !row.initialContactNotes) return;
  if (!contactId && !companyId && !leadId) return;

  const { error } = await supabase.from('activities').insert({
    owner_id: ownerId,
    company_id: companyId,
    contact_id: contactId,
    lead_id: leadId,
    type: 'call',
    direction: 'inbound',
    subject: row.leadSource ? `Initial contact - ${row.leadSource}` : 'Initial contact',
    body: cleanText(row.initialContactNotes),
    occurred_at: row.initialContactDate || new Date().toISOString(),
  });

  if (error) throw error;
}

function buildFieldMap(headers) {
  return headers.reduce((map, header) => {
    const field = detectField(header);
    return field ? { ...map, [header]: field } : map;
  }, {});
}

function buildGoogleSavedCollectionFieldMap(headers) {
  return headers.reduce((map, header) => {
    const normalized = normalizeHeaderWithUnderscores(header);
    const field = googleSavedCollectionFieldMap[normalized] || detectField(header);
    return field ? { ...map, [header]: field } : map;
  }, {});
}

function isGoogleSavedCollectionsCsv(headers) {
  const normalizedHeaders = headers.map(normalizeHeaderWithUnderscores);
  return normalizedHeaders.includes('title') && normalizedHeaders.includes('item_content_url');
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

  const headerIndex = findHeaderRowIndex(lines);
  const headers = lines[headerIndex].map((header) => cleanText(header)).filter(Boolean);
  const rows = lines.slice(headerIndex + 1).map((values) =>
    headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {}),
  );

  return { headers, rows };
}

function findHeaderRowIndex(lines) {
  const index = lines.findIndex((row) => {
    const normalizedHeaders = row.map(normalizeHeaderWithUnderscores);
    return normalizedHeaders.includes('title') && normalizedHeaders.includes('item_content_url');
  });

  return index === -1 ? 0 : index;
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

function normalizeHeaderWithUnderscores(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function cleanNumber(value) {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanDateTime(value) {
  const text = cleanText(value);
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString();
}

function parseList(value) {
  return String(value || '')
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSavedCollectionNotes(row) {
  const parts = [...new Set([cleanText(row.notes), cleanText(row.leadNotes)].filter(Boolean))];
  const mapLine = cleanText(row.website) ? `Google Maps: ${cleanText(row.website)}` : null;

  if (mapLine && !parts.some((part) => part.includes(mapLine))) {
    parts.push(mapLine);
  }

  return parts.join('\n');
}

function googleRowToContact(row) {
  const nameParts = String(row.companyName || '')
    .split(/\s+/)
    .filter(Boolean);

  return {
    ...row,
    shouldCreateContact: true,
    firstName: row.firstName || nameParts.shift() || row.companyName,
    lastName: row.lastName || nameParts.join(' ') || 'Saved place',
    title: row.title || 'Google saved place',
  };
}

function defaultGoogleAction(importType) {
  return importType === 'contacts' ? 'create_contact' : 'create_lead';
}

function appendText(currentValue, nextValue) {
  const current = cleanText(currentValue);
  const next = cleanText(nextValue);

  if (!current) return next;
  if (!next || current.includes(next)) return current;
  return `${current}\n\n${next}`;
}

function mergeTags(currentTags, nextTags) {
  return [...new Set([...(Array.isArray(currentTags) ? currentTags : []), ...(Array.isArray(nextTags) ? nextTags : [])].filter(Boolean))];
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') || 'Contact';
}

function parseGoogleMapsCoordinates(value) {
  const url = cleanText(value);
  if (!url) return null;

  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) return toCoordinatePair(atMatch[1], atMatch[2]);

  const dataMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataMatch) return toCoordinatePair(dataMatch[1], dataMatch[2]);

  return null;
}

function toCoordinatePair(latitudeValue, longitudeValue) {
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
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
