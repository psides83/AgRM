'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import {
  cleanPhone,
  formatPhone,
} from 'components/sections/crm/shared/phoneFormat';
import { formatLeadStatus } from 'components/sections/crm/constants';

const importTypes = [
  { value: 'lead_call_list', label: 'Lead Call List' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'leads', label: 'Leads' },
  { value: 'contacts_and_leads', label: 'Contacts and Leads' },
];

const googleSavedCollectionFieldMap = {
  title: 'companyName',
  item_content_url: 'website',
  url: 'website',
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

const mappingProfilesStorageKey = 'agrm-import-mapping-profiles';

const fieldLabels = {
  importSource: 'Import Source',
  firstName: 'First Name',
  lastName: 'Last Name',
  fullName: 'Full Name',
  title: 'Title',
  accountNumber: 'Account Number',
  email: 'Email',
  phone: 'Phone',
  mobilePhone: 'Mobile Phone',
  homePhone: 'Home Phone',
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
  branch: 'Branch',
  madeContact: 'Made Contact',
  callResult: 'Call Result',
  called: 'Called',
  dateCalled: 'Date Called',
  visited: 'Visited',
  dateVisited: 'Date Visited',
  distance: 'Distance',
  workPhone: 'Work Phone',
  equipmentOwned: 'Equipment Owned',
  equipmentSerial: 'Equipment Serial',
  equipmentValue: 'Equipment / Fleet Value',
  equityPercent: 'Equity Percent',
  newUsed: 'New / Used',
  lastInstallment: 'Last Installment',
  apr: 'APR',
  paymentAmount: 'Payment Amount',
  paymentFrequency: 'Payment Frequency',
  buyingProbability: 'Buying Probability',
  loyaltyScore: 'Loyalty Score',
  prospectProfileUrl: 'Prospect Profile URL',
  routeUrl: 'Route URL',
  startAddress: 'Start Address',
  sourceDescription: 'Source Description',
  equipmentYtd: 'Equipment YTD',
  partsYtd: 'Parts YTD',
  serviceYtd: 'Service YTD',
  arTotalAging: 'AR Total Aging',
  secondaryFirstName: 'Secondary First Name',
  secondaryLastName: 'Secondary Last Name',
  secondaryTitle: 'Secondary Title',
  secondaryPhone: 'Secondary Phone',
  secondaryEmail: 'Secondary Email',
};

const fieldAliases = {
  importSource: ['importsource', 'import_source', 'list', 'listname'],
  firstName: ['first', 'firstname', 'first_name', 'givenname', 'given_name'],
  lastName: [
    'last',
    'lastname',
    'last_name',
    'surname',
    'familyname',
    'family_name',
  ],
  fullName: [
    'name',
    'fullname',
    'full_name',
    'contact',
    'contactname',
    'contact_name',
    'customer',
    'customername',
  ],
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
  email: [
    'email',
    'emailaddress',
    'email_address',
    'contactemail',
    'contact_email',
  ],
  phone: [
    'phone',
    'phonenumber',
    'phone_number',
    'officephone',
    'office_phone',
    'workphone',
    'work_phone',
    'work',
  ],
  mobilePhone: [
    'mobile',
    'mobilephone',
    'mobile_phone',
    'cell',
    'cellphone',
    'cell_phone',
  ],
  homePhone: ['home', 'homephone', 'home_phone'],
  tags: ['tags', 'tag', 'labels', 'categories'],
  companyName: [
    'company',
    'companyname',
    'company_name',
    'business',
    'businessname',
    'account',
    'accountname',
    'organization',
    'organisation',
  ],
  companyType: [
    'companytype',
    'company_type',
    'businesstype',
    'business_type',
    'accounttype',
    'account_type',
  ],
  website: ['website', 'site', 'url', 'web'],
  companyPhone: [
    'companyphone',
    'company_phone',
    'businessphone',
    'business_phone',
    'accountphone',
    'account_phone',
  ],
  companyEmail: [
    'companyemail',
    'company_email',
    'businessemail',
    'business_email',
    'accountemail',
    'account_email',
  ],
  addressLine1: [
    'address',
    'address1',
    'address_1',
    'street',
    'streetaddress',
    'street_address',
    'mailingaddress',
  ],
  addressLine2: ['address2', 'address_2', 'suite', 'unit', 'apt', 'apartment'],
  city: ['city', 'town'],
  county: ['county', 'parish'],
  region: ['state', 'region', 'province', 'st'],
  postalCode: [
    'zip',
    'zipcode',
    'zip_code',
    'postal',
    'postalcode',
    'postal_code',
  ],
  country: ['country'],
  latitude: ['lat', 'latitude', 'contactlat', 'contact_lat', 'contactlatitude'],
  longitude: [
    'lng',
    'lon',
    'long',
    'longitude',
    'contactlng',
    'contact_lng',
    'contactlongitude',
  ],
  notes: [
    'notes',
    'note',
    'contactnotes',
    'contact_notes',
    'comments',
    'comment',
  ],
  leadSource: ['source', 'leadsource', 'lead_source', 'origin'],
  leadAccountNumber: [
    'leadaccount',
    'lead_account',
    'leadaccountnumber',
    'lead_account_number',
    'leadacct',
    'lead_acct',
    'leadcustomernumber',
    'lead_customer_number',
  ],
  leadStatus: ['status', 'leadstatus', 'lead_status'],
  priority: ['priority', 'leadpriority', 'lead_priority'],
  estimatedBudget: [
    'budget',
    'estimatedbudget',
    'estimated_budget',
    'amount',
    'dealamount',
    'deal_amount',
  ],
  targetPurchaseDate: [
    'targetpurchasedate',
    'target_purchase_date',
    'purchasedate',
    'purchase_date',
  ],
  initialContactDate: [
    'initialcontactdate',
    'initial_contact_date',
    'firstcontactdate',
    'first_contact_date',
  ],
  initialContactNotes: [
    'initialcontactnotes',
    'initial_contact_notes',
    'firstcontactnotes',
    'first_contact_notes',
  ],
  lastContactedAt: [
    'lastcontacted',
    'last_contacted',
    'lastcontactedat',
    'last_contacted_at',
  ],
  nextFollowUpAt: [
    'nextfollowup',
    'next_follow_up',
    'nextfollowupat',
    'next_follow_up_at',
    'followup',
    'follow_up',
  ],
  leadLatitude: ['leadlat', 'lead_lat', 'leadlatitude', 'lead_latitude'],
  leadLongitude: ['leadlng', 'lead_lng', 'leadlongitude', 'lead_longitude'],
  leadNotes: ['leadnotes', 'lead_notes', 'leadcomment', 'lead_comment'],
  branch: ['branch', 'location'],
  madeContact: ['madecontact', 'made_contact'],
  callResult: ['callresult', 'call_result'],
  called: ['called'],
  dateCalled: ['datecalled', 'date_called'],
  visited: ['visited'],
  dateVisited: ['datevisited', 'date_visited'],
  distance: ['distance'],
  workPhone: ['work', 'workphone', 'work_phone'],
  equipmentOwned: ['equipment'],
  equipmentSerial: ['serial', 'serialnumber', 'serial_number', 'serial#'],
  equipmentValue: ['fleetvalue', 'fleet_value', 'totalcashprice', 'total_cash_price'],
  equityPercent: ['noteequity', 'note_equity', 'noteequity%', 'equitypercent'],
  newUsed: ['nu', 'n/u', 'newused', 'new_used'],
  lastInstallment: ['lastinstallment', 'last_installment'],
  apr: ['apr'],
  paymentAmount: ['averageschedulepayment', 'average_schedule_payment'],
  paymentFrequency: ['paymentfrequency', 'payment_frequency'],
  buyingProbability: ['buyingprobability', 'buying_probability'],
  loyaltyScore: ['loyaltyscore', 'loyalty_score'],
  prospectProfileUrl: ['prospectprofilelink', 'prospect_profile_link'],
  routeUrl: ['route'],
  startAddress: ['startaddress', 'start_address'],
  sourceDescription: ['description'],
  equipmentYtd: ['equipmentytd', 'equipment_ytd'],
  partsYtd: ['partsytd', 'parts_ytd'],
  serviceYtd: ['serviceytd', 'service_ytd'],
  arTotalAging: ['artotalaging', 'ar_total_aging'],
  secondaryFirstName: ['firstname2', 'first_name_2', 'secondaryfirstname'],
  secondaryLastName: ['lastname2', 'last_name_2', 'secondarylastname'],
  secondaryTitle: ['title2', 'title_2', 'secondarytitle'],
  secondaryPhone: ['phone2', 'phone_2', 'secondaryphone'],
  secondaryEmail: ['email2', 'email_2', 'secondaryemail'],
};

const leadSourceProfiles = [
  {
    label: 'Customer history lead list',
    source: 'Customer history import',
    requiredHeaders: ['account_number', 'branch', 'delivery_address'],
    fieldMap: {
      target: 'called',
      made_contact: 'callResult',
      date_of_contact: 'dateCalled',
      notes: 'leadNotes',
      account_number: 'leadAccountNumber',
      branch: 'branch',
      company: 'companyName',
      first_name: 'firstName',
      last_name: 'lastName',
      work: 'phone',
      mobile: 'mobilePhone',
      home: 'homePhone',
      email: 'email',
      delivery_address: 'addressLine1',
      delivery_city: 'city',
      delivery_county: 'county',
      delivery_state: 'region',
      delivery_zip: 'postalCode',
      postal_address: 'addressLine1',
      postal_city: 'city',
      postal_county: 'county',
      postal_state: 'region',
      postal_zip: 'postalCode',
      equipment_ytd_arec: 'equipmentYtd',
      parts_ytd_arec: 'partsYtd',
      service_ytd_arec: 'serviceYtd',
      ar_total_aging_arec: 'arTotalAging',
    },
  },
  {
    label: 'Equity equipment lead list',
    source: 'Equity equipment import',
    requiredHeaders: ['note_equity', 'serial', 'last_installment'],
    fieldMap: {
      transfered_contact: 'fullName',
      customer: 'fullName',
      location: 'branch',
      phone: 'phone',
      made_contact: 'callResult',
      date_of_contact: 'dateCalled',
      notes: 'leadNotes',
      note_equity: 'equityPercent',
      n_u: 'newUsed',
      equipment: 'equipmentOwned',
      serial: 'equipmentSerial',
      total_cash_price: 'equipmentValue',
      last_installment: 'lastInstallment',
      apr: 'apr',
      zip_code: 'postalCode',
      county: 'county',
      average_schedule_payment: 'paymentAmount',
      payment_frequency: 'paymentFrequency',
      settlement_dealer: 'branch',
    },
  },
  {
    label: 'Prospect route lead list',
    source: 'Prospect route import',
    requiredHeaders: ['buyid', 'buyingprobability', 'route'],
    fieldMap: {
      called: 'called',
      date_called: 'dateCalled',
      call_result: 'callResult',
      notes: 'leadNotes',
      visited: 'visited',
      date_visited: 'dateVisited',
      distance: 'distance',
      first_name_1: 'firstName',
      last_name_1: 'lastName',
      title_1: 'title',
      phone: 'phone',
      street: 'addressLine1',
      city: 'city',
      state: 'region',
      zip: 'postalCode',
      county: 'county',
      fleet_value: 'equipmentValue',
      primary_brand: 'equipmentOwned',
      company: 'companyName',
      first_name_2: 'secondaryFirstName',
      last_name_2: 'secondaryLastName',
      title_2: 'secondaryTitle',
      buyid: 'leadAccountNumber',
      buyingprobability: 'buyingProbability',
      description: 'sourceDescription',
      buy_website: 'website',
      prospect_profile_link: 'prospectProfileUrl',
      loyalty_score: 'loyaltyScore',
      udf: 'branch',
      start_address: 'startAddress',
      route: 'routeUrl',
    },
  },
];

const coreImportFields = new Set([
  'firstName',
  'lastName',
  'fullName',
  'companyName',
  'accountNumber',
  'leadAccountNumber',
  'email',
  'phone',
  'mobilePhone',
  'homePhone',
  'addressLine1',
  'addressLine2',
  'city',
  'county',
  'region',
  'postalCode',
  'branch',
  'leadSource',
  'importSource',
  'leadStatus',
  'priority',
  'madeContact',
  'callResult',
  'called',
  'dateCalled',
  'visited',
  'dateVisited',
  'lastContactedAt',
  'nextFollowUpAt',
  'leadNotes',
  'notes',
  'latitude',
  'longitude',
  'leadLatitude',
  'leadLongitude',
]);

const preservedImportFields = new Set([
  'distance',
  'equipmentOwned',
  'equipmentSerial',
  'equipmentValue',
  'equityPercent',
  'newUsed',
  'lastInstallment',
  'apr',
  'paymentAmount',
  'paymentFrequency',
  'buyingProbability',
  'loyaltyScore',
  'prospectProfileUrl',
  'routeUrl',
  'startAddress',
  'sourceDescription',
  'equipmentYtd',
  'partsYtd',
  'serviceYtd',
  'arTotalAging',
  'secondaryFirstName',
  'secondaryLastName',
  'secondaryTitle',
  'secondaryPhone',
  'secondaryEmail',
]);

const CRMImport = () => {
  const supabase = useMemo(() => createClient(), []);
  const [importType, setImportType] = useState('lead_call_list');
  const [fileName, setFileName] = useState('');
  const [fileTypeLabel, setFileTypeLabel] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [headers, setHeaders] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [previewRows, setPreviewRows] = useState([]);
  const [previewFilter, setPreviewFilter] = useState('all');
  const [mappingProfileName, setMappingProfileName] = useState('');
  const [savedMappingProfiles, setSavedMappingProfiles] = useState([]);
  const [crmTargets, setCrmTargets] = useState({ contacts: [], leads: [] });
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [rowCreateDialog, setRowCreateDialog] = useState(null);
  const [mergeDialog, setMergeDialog] = useState(null);
  const [isRowSaving, setIsRowSaving] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [fetchingDetailsRow, setFetchingDetailsRow] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isGoogleSavedCollection = fileTypeLabel === 'Google saved collections';
  const duplicateCount = previewRows.filter(
    (row) => row.duplicates.length,
  ).length;
  const importableCount = previewRows.filter((row) =>
    isImportableRow(row, includeDuplicates),
  ).length;
  const duplicateRows = previewRows.filter((row) => row.duplicates.length);
  const invalidRows = previewRows.filter((row) => !row.isValid);
  const visiblePreviewRows = previewRows.filter((row) => {
    if (previewFilter === 'duplicates') return row.duplicates.length > 0;
    if (previewFilter === 'review') return !row.isValid;
    if (previewFilter === 'ready') return isImportableRow(row, includeDuplicates);
    return true;
  });

  useEffect(() => {
    setSavedMappingProfiles(loadMappingProfiles());
  }, []);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await analyzeCsvText(await file.text(), file.name);
    event.target.value = '';
  };

  const handleGoogleSheetImport = async () => {
    if (!sheetUrl.trim()) return;

    setFileName('Google Sheet');
    setFileTypeLabel('');
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/google-sheets/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not read that Google Sheet.');
      }

      await analyzeCsvText(data.csv, 'Google Sheet');
    } catch (nextError) {
      setError(nextError.message || 'Could not read this Google Sheet.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCsvText = async (text, nextFileName) => {
    setFileName(nextFileName);
    setFileTypeLabel('');
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const { headers: nextHeaders, rows } = parseCsv(text);
      const isGoogleSavedCollection = isGoogleSavedCollectionsCsv(nextHeaders);
      const sourceProfile = detectLeadSourceProfile(nextHeaders);
      const nextFieldMap = isGoogleSavedCollection
        ? buildGoogleSavedCollectionFieldMap(nextHeaders)
        : buildFieldMap(nextHeaders, sourceProfile);
      const nextPreviewRows = rows
        .slice(0, 250)
        .map((row, index) =>
          normalizeImportRow(
            row,
            nextHeaders,
            nextFieldMap,
            importType,
            index,
            { isGoogleSavedCollection, sourceProfile },
          ),
        );
      const rowsWithDuplicates = await markDuplicates(
        supabase,
        nextPreviewRows,
      );

      setHeaders(nextHeaders);
      setFieldMap(nextFieldMap);
      setFileTypeLabel(
        isGoogleSavedCollection
          ? 'Google saved collections'
          : sourceProfile?.label || 'CSV',
      );
      setPreviewRows(rowsWithDuplicates);
      setCrmTargets(
        isGoogleSavedCollection
          ? await fetchCrmTargets(supabase)
          : { contacts: [], leads: [] },
      );
    } catch (nextError) {
      setError(nextError.message || 'Could not read this CSV file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    setError(null);
    setResult(null);
    setIsImporting(true);

    try {
      const { data: userResult, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userResult.user)
        throw new Error('You need to be logged in to import records.');

      const stats = { contacts: 0, leads: 0, mapUpdates: 0, skipped: 0 };
      const rowsToImport = previewRows.filter((row) =>
        isImportableRow(row, includeDuplicates),
      );
      stats.skipped = previewRows.length - rowsToImport.length;

      for (const row of rowsToImport) {
        if (row.isGoogleSavedCollection) {
          const googleStats = await saveGoogleSavedCollectionRow(
            supabase,
            userResult.user.id,
            row,
          );
          stats.contacts += googleStats.contacts;
          stats.leads += googleStats.leads;
          stats.mapUpdates += googleStats.mapUpdates;
          continue;
        }

        const companyId = row.shouldCreateContact
          ? await saveCompany(supabase, userResult.user.id, row)
          : null;
        const contactId = await saveContact(
          supabase,
          userResult.user.id,
          companyId,
          row,
        );

        if (contactId) {
          stats.contacts += 1;
        }

        let leadId = null;
        if (row.shouldCreateLead) {
          leadId = await saveLead(
            supabase,
            userResult.user.id,
            companyId,
            contactId,
            row,
          );
          stats.leads += 1;
        }

        await saveInitialContactActivity(
          supabase,
          userResult.user.id,
          companyId,
          contactId,
          leadId,
          row,
        );
      }

      setResult(stats);
    } catch (nextError) {
      setError(nextError.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const updateGoogleImportRow = (rowIndex, changes) => {
    setPreviewRows((rows) =>
      rows.map((row) =>
        row.index === rowIndex ? { ...row, ...changes } : row,
      ),
    );
  };

  const rebuildPreviewRows = async (nextFieldMap, nextImportType = importType) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const nextRows = previewRows.map((row) =>
        normalizeImportRow(
          row.raw,
          headers,
          nextFieldMap,
          nextImportType,
          row.index,
          {
            isGoogleSavedCollection,
            sourceProfile: row.sourceProfile,
          },
        ),
      );
      setPreviewRows(await markDuplicates(supabase, nextRows));
    } catch (nextError) {
      setError(nextError.message || 'Could not update the field mapping.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFieldMapChange = (header, field) => {
    const nextFieldMap = {
      ...fieldMap,
      [header]: field || null,
    };

    setFieldMap(nextFieldMap);
    rebuildPreviewRows(nextFieldMap);
  };

  const handleSaveMappingProfile = () => {
    const name = mappingProfileName.trim();
    if (!name) {
      setError('Name this mapping before saving it.');
      return;
    }

    const nextProfile = {
      id: name.toLowerCase(),
      name,
      importType,
      fileTypeLabel,
      fieldMap,
      savedAt: new Date().toISOString(),
    };
    const nextProfiles = [
      nextProfile,
      ...savedMappingProfiles.filter(
        (profile) => profile.id !== nextProfile.id,
      ),
    ];

    saveMappingProfiles(nextProfiles);
    setSavedMappingProfiles(nextProfiles);
    setMappingProfileName('');
    setError(null);
  };

  const handleLoadMappingProfile = async (profileId) => {
    const profile = savedMappingProfiles.find(
      (savedProfile) => savedProfile.id === profileId,
    );
    if (!profile) return;

    const nextImportType = profile.importType || importType;
    setImportType(nextImportType);
    setFieldMap(profile.fieldMap || {});
    setMappingProfileName(profile.name || '');
    await rebuildPreviewRows(profile.fieldMap || {}, nextImportType);
  };

  const handleCreateSingleRow = async ({ row, createType, rowFieldMap }) => {
    setError(null);
    setIsRowSaving(true);

    try {
      const { data: userResult, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userResult.user)
        throw new Error('You need to be logged in to import records.');

      const normalizedRow = normalizeImportRow(
        row.raw,
        headers,
        rowFieldMap,
        createType,
        row.index,
        {
          isGoogleSavedCollection: row.isGoogleSavedCollection,
          sourceProfile: row.sourceProfile,
        },
      );
      const createRow = mergeFetchedGoogleDetails(row, normalizedRow);

      if (createType === 'contacts') {
        const contactRow = row.isGoogleSavedCollection
          ? googleRowToContact(createRow)
          : {
              ...createRow,
              shouldCreateContact: true,
              shouldCreateLead: false,
            };
        if (!contactRow.firstName || !contactRow.lastName)
          throw new Error(
            'Choose fields for first and last name before creating a contact.',
          );
        const companyId = await saveCompany(
          supabase,
          userResult.user.id,
          contactRow,
        );
        await saveContact(supabase, userResult.user.id, companyId, contactRow);
        setResult({ contacts: 1, leads: 0, mapUpdates: 0, skipped: 0 });
      } else {
        const leadRow = {
          ...createRow,
          shouldCreateContact: false,
          shouldCreateLead: true,
        };
        const companyId = leadRow.shouldCreateContact
          ? await saveCompany(supabase, userResult.user.id, leadRow)
          : null;
        await saveLead(supabase, userResult.user.id, companyId, null, leadRow);
        setResult({ contacts: 0, leads: 1, mapUpdates: 0, skipped: 0 });
      }

      setRowCreateDialog(null);
    } catch (nextError) {
      setError(nextError.message || 'Could not create this row.');
    } finally {
      setIsRowSaving(false);
    }
  };

  const handleMergeRow = async ({ row, match, values }) => {
    setError(null);
    setIsMerging(true);

    try {
      if (match.type === 'contact') {
        const { error: mergeError } = await supabase
          .from('contacts')
          .update({
            first_name: cleanText(values.firstName),
            last_name: cleanText(values.lastName),
            title: cleanText(values.title),
            account_number: cleanText(values.accountNumber),
            email: cleanText(values.email),
            phone: cleanPhone(values.phone),
            mobile_phone: cleanPhone(values.mobilePhone),
          })
          .eq('id', match.id);

        if (mergeError) throw mergeError;
      }

      if (match.type === 'lead') {
        const { error: mergeError } = await supabase
          .from('leads')
          .update({
            source: cleanText(values.leadSource),
            account_number: cleanText(values.leadAccountNumber),
            status: values.leadStatus || 'not_contacted',
            priority: normalizePriority(values.priority),
            estimated_budget: values.estimatedBudget || null,
            next_follow_up_at: values.nextFollowUpAt || null,
            latitude: cleanNumber(values.leadLatitude ?? values.latitude),
            longitude: cleanNumber(values.leadLongitude ?? values.longitude),
            notes: cleanText(values.leadNotes || values.notes),
          })
          .eq('id', match.id);

        if (mergeError) throw mergeError;
      }

      setPreviewRows((rows) =>
        rows.map((currentRow) =>
          currentRow.index === row.index
            ? {
                ...currentRow,
                mergedInto: {
                  id: match.id,
                  type: match.type,
                  title: match.title,
                },
                duplicates: [],
              }
            : currentRow,
        ),
      );
      setMergeDialog(null);
    } catch (nextError) {
      setError(nextError.message || 'Could not merge this row.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleFetchGoogleDetails = async (row) => {
    setError(null);
    setFetchingDetailsRow(row.index);

    try {
      const response = await fetch('/api/google-places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:
            row.companyName || row.fullName || row.raw.Title || row.raw.title,
          url: row.website,
        }),
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || 'Could not fetch Google place details.');

      setPreviewRows((rows) =>
        rows.map((currentRow) =>
          currentRow.index === row.index
            ? applyGooglePlaceDetails(currentRow, data.place)
            : currentRow,
        ),
      );
    } catch (nextError) {
      setError(nextError.message || 'Could not fetch Google place details.');
    } finally {
      setFetchingDetailsRow(null);
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
              Import Records
            </Typography>
          </Box>
          <Button
            href={paths.addContact}
            component={Link}
            underline="none"
            variant="soft"
            color="neutral"
            startIcon={
              <IconifyIcon icon="material-symbols:person-add-outline-rounded" />
            }
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
                <Typography variant="h6">
                  {fileName
                    ? `${fileTypeLabel || 'CSV'} loaded`
                    : 'Upload File'}
                </Typography>
                <Typography
                  variant="body2"
                  noWrap={Boolean(fileName)}
                  title={fileName || undefined}
                  sx={{ maxWidth: { xs: 1, md: 560 }, color: 'text.secondary' }}
                >
                  {fileName ||
                    'Upload a CSV, paste a shared Google Sheet link, or import a Google Saved Collections export.'}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ flexShrink: 0 }}
              >
                <TextField
                  select
                  label="Import Type"
                  value={importType}
                  onChange={(event) => setImportType(event.target.value)}
                  sx={{ minWidth: { xs: 1, sm: 220 } }}
                >
                  {importTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={
                    <IconifyIcon icon="material-symbols:upload-file-rounded" />
                  }
                  sx={{ minHeight: 48 }}
                >
                  Choose File
                  <Box
                    component="input"
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={handleFile}
                  />
                </Button>
              </Stack>
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <TextField
                label="Google Sheet Link"
                value={sheetUrl}
                onChange={(event) => setSheetUrl(event.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                fullWidth
              />
              <Button
                variant="soft"
                onClick={handleGoogleSheetImport}
                loading={isAnalyzing && fileName === 'Google Sheet'}
                disabled={!sheetUrl.trim() || isAnalyzing}
                startIcon={
                  <IconifyIcon icon="material-symbols:add-link-rounded" />
                }
                sx={{ minHeight: 48, minWidth: { md: 180 } }}
              >
                Load Sheet
              </Button>
            </Stack>
          </Paper>

          {isAnalyzing && <LinearProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <Alert severity="success">
              Imported {result.contacts} contact
              {result.contacts === 1 ? '' : 's'} and {result.leads} lead
              {result.leads === 1 ? '' : 's'}
              {result.mapUpdates
                ? `, and updated ${result.mapUpdates} map ${result.mapUpdates === 1 ? 'record' : 'records'}`
                : ''}
              . Skipped {result.skipped} row
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
                    <SummaryStat
                      label="Ready"
                      value={importableCount}
                      color="success"
                    />
                    <SummaryStat
                      label="Review"
                      value={invalidRows.length}
                      color="warning"
                    />
                    <SummaryStat
                      label="Duplicates"
                      value={duplicateCount}
                      color="warning"
                    />
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
                      control={
                        <Checkbox
                          checked={includeDuplicates}
                          onChange={(event) =>
                            setIncludeDuplicates(event.target.checked)
                          }
                        />
                      }
                      label="Include possible duplicates"
                      sx={{ m: 0 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleImport}
                      loading={isImporting}
                      disabled={!importableCount || isAnalyzing}
                      sx={{ minHeight: 44 }}
                    >
                      Import {importableCount} Row
                      {importableCount === 1 ? '' : 's'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              <ImportReviewPanel
                fileTypeLabel={fileTypeLabel}
                headers={headers}
                fieldMap={fieldMap}
                previewRows={previewRows}
              />

              <Paper
                sx={{
                  width: 1,
                  maxWidth: 1,
                  overflow: 'hidden',
                  p: { xs: 2, md: 3 },
                }}
              >
                <Stack direction="column" spacing={1.5} sx={{ minWidth: 0 }}>
                  <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={2}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', lg: 'center' },
                    }}
                  >
                    <SectionHeader title="Detected Fields" />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        label="Mapping Name"
                        value={mappingProfileName}
                        onChange={(event) =>
                          setMappingProfileName(event.target.value)
                        }
                        size="small"
                        sx={{ minWidth: { sm: 220 } }}
                      />
                      <Button
                        variant="soft"
                        onClick={handleSaveMappingProfile}
                        disabled={!headers.length}
                      >
                        Save Mapping
                      </Button>
                      <TextField
                        select
                        label="Saved Mappings"
                        value=""
                        onChange={(event) =>
                          handleLoadMappingProfile(event.target.value)
                        }
                        size="small"
                        sx={{ minWidth: { sm: 220 } }}
                      >
                        <MenuItem value="">Load mapping</MenuItem>
                        {savedMappingProfiles.map((profile) => (
                          <MenuItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </Stack>
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
                      <FieldMapping
                        key={header}
                        header={header}
                        field={fieldMap[header]}
                        onChange={(field) =>
                          handleFieldMapChange(header, field)
                        }
                      />
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
                  <TextField
                    select
                    label="Preview"
                    value={previewFilter}
                    onChange={(event) => setPreviewFilter(event.target.value)}
                    size="small"
                    sx={{ minWidth: 210 }}
                  >
                    <MenuItem value="all">All Rows ({previewRows.length})</MenuItem>
                    <MenuItem value="duplicates">
                      Duplicates ({duplicateRows.length})
                    </MenuItem>
                    <MenuItem value="review">
                      Needs Review ({invalidRows.length})
                    </MenuItem>
                    <MenuItem value="ready">Ready ({importableCount})</MenuItem>
                  </TextField>
                  {visiblePreviewRows.length > 25 && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Showing 25 of {visiblePreviewRows.length} rows.
                    </Typography>
                  )}
                </Stack>
                <TableContainer
                  sx={{ width: 1, maxWidth: 1, overflowX: 'auto' }}
                >
                  <Table
                    sx={{
                      minWidth: isGoogleSavedCollection ? 1690 : 1390,
                      tableLayout: 'fixed',
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 72 }}>Row</TableCell>
                        <TableCell sx={{ width: 160 }}>Account #</TableCell>
                        <TableCell sx={{ width: 260 }}>Contact</TableCell>
                        <TableCell sx={{ width: 260 }}>Company</TableCell>
                        <TableCell
                          sx={{ width: isGoogleSavedCollection ? 220 : 180 }}
                        >
                          {isGoogleSavedCollection ? 'Action' : 'Lead'}
                        </TableCell>
                        {isGoogleSavedCollection && (
                          <TableCell sx={{ width: 260 }}>Target</TableCell>
                        )}
                        <TableCell sx={{ width: 190 }}>Coordinates</TableCell>
                        <TableCell sx={{ width: 260 }}>Actions</TableCell>
                        <TableCell sx={{ width: 128 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visiblePreviewRows.slice(0, 25).map((row) => (
                        <TableRow key={row.index}>
                          <TableCell>{row.index + 1}</TableCell>
                          <PreviewTableCell value={row.accountNumber || '-'} />
                          <PreviewTableCell
                            value={
                              [row.firstName, row.lastName]
                                .filter(Boolean)
                                .join(' ') || '-'
                            }
                            secondary={
                              row.email || row.phone || row.mobilePhone
                            }
                          />
                          <PreviewTableCell value={row.companyName || '-'} />
                          {isGoogleSavedCollection ? (
                            <>
                              <TableCell>
                                <TextField
                                  select
                                  size="small"
                                  value={row.googleAction || 'create_lead'}
                                  onChange={(event) =>
                                    updateGoogleImportRow(row.index, {
                                      googleAction: event.target.value,
                                      googleTargetId: '',
                                    })
                                  }
                                  fullWidth
                                >
                                  {googleImportActions.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell>
                                <GoogleTargetSelect
                                  row={row}
                                  crmTargets={crmTargets}
                                  onChange={(googleTargetId) =>
                                    updateGoogleImportRow(row.index, {
                                      googleTargetId,
                                    })
                                  }
                                />
                              </TableCell>
                            </>
                          ) : (
                            <PreviewTableCell
                              value={
                                row.shouldCreateLead
                                  ? [
                                      row.leadAccountNumber,
                                      row.leadSource || 'Lead',
                                    ]
                                      .filter(Boolean)
                                      .join(' · ')
                                  : '-'
                              }
                            />
                          )}
                          <TableCell>
                            <CoordinatesCell row={row} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {isGoogleSavedCollection && (
                                <Button
                                  size="small"
                                  variant="soft"
                                  loading={fetchingDetailsRow === row.index}
                                  onClick={() => handleFetchGoogleDetails(row)}
                                >
                                  Fetch
                                </Button>
                              )}
                              {mergeableDuplicates(row).length > 0 && (
                                <Button
                                  size="small"
                                  variant="soft"
                                  color="warning"
                                  onClick={() =>
                                    setMergeDialog({
                                      row,
                                      match: mergeableDuplicates(row)[0],
                                    })
                                  }
                                >
                                  Merge
                                </Button>
                              )}
                              {!row.mergedInto && (
                                <Button
                                  size="small"
                                  variant="soft"
                                  onClick={() =>
                                    setRowCreateDialog({
                                      row,
                                      createType:
                                        row.googleAction === 'create_contact'
                                          ? 'contacts'
                                          : 'leads',
                                      rowFieldMap: { ...fieldMap },
                                    })
                                  }
                                >
                                  Create
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
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
      <CreateRowDialog
        open={Boolean(rowCreateDialog)}
        value={rowCreateDialog}
        headers={headers}
        onClose={() => setRowCreateDialog(null)}
        onChange={(changes) =>
          setRowCreateDialog((current) =>
            current ? { ...current, ...changes } : current,
          )
        }
        onCreate={handleCreateSingleRow}
        loading={isRowSaving}
      />
      <MergeDuplicateDialog
        open={Boolean(mergeDialog)}
        row={mergeDialog?.row}
        initialMatch={mergeDialog?.match}
        matches={mergeableDuplicates(mergeDialog?.row)}
        loading={isMerging}
        onClose={() => setMergeDialog(null)}
        onMerge={handleMergeRow}
      />
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
      <Typography
        variant="caption"
        noWrap
        sx={{ display: 'block', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ lineHeight: 1.2, color: palette.color }}>
        {value}
      </Typography>
    </Box>
  );
}

function ImportReviewPanel({ fileTypeLabel, headers, fieldMap, previewRows }) {
  const review = buildImportReview(headers, fieldMap, previewRows);

  return (
    <Paper sx={{ width: 1, maxWidth: 1, overflow: 'hidden', p: { xs: 2, md: 3 } }}>
      <Stack direction="column" spacing={2} sx={{ minWidth: 0 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
        >
          <Box>
            <SectionHeader title="Import Review" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Detected profile: {fileTypeLabel || 'CSV'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip label={`${review.core.length} core fields`} size="small" variant="soft" color="primary" />
            <Chip label={`${review.preserved.length} preserved`} size="small" variant="soft" color="info" />
            <Chip label={`${review.ignored.length} ignored`} size="small" variant="soft" color="neutral" />
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <ReviewColumn title="Lead Fields" items={review.core} empty="No lead fields mapped" />
          <ReviewColumn title="Preserved Details" items={review.preserved} empty="No source details preserved" />
          <ReviewColumn title="Ignored Columns" items={review.ignored} empty="No ignored columns" muted />
        </Box>

        {review.warnings.length > 0 && (
          <Alert severity="warning">
            <Stack direction="column" spacing={0.5}>
              {review.warnings.map((warning) => (
                <Typography key={warning} variant="body2">
                  {warning}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

function ReviewColumn({ title, items, empty, muted = false }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        border: 1,
        borderColor: 'dividerLight',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {items.length ? (
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {items.map((item) => (
            <Chip
              key={`${item.header}-${item.field || 'ignored'}`}
              label={item.field ? `${item.header} -> ${fieldLabels[item.field] || item.field}` : item.header}
              size="small"
              variant="soft"
              color={muted ? 'neutral' : 'primary'}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {empty}
        </Typography>
      )}
    </Box>
  );
}

function FieldMapping({ header, field, onChange }) {
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
      <TextField
        select
        size="small"
        value={field || ''}
        onChange={(event) => onChange(event.target.value)}
        sx={{
          flexShrink: 0,
          width: 190,
          '& .MuiSelect-select': {
            py: 0.75,
            fontSize: 'caption.fontSize',
          },
        }}
      >
        <MenuItem value="">Ignored</MenuItem>
        {Object.entries(fieldLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}

function PreviewTableCell({ value, secondary }) {
  return (
    <TableCell sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle2"
        noWrap
        title={value}
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
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

function CoordinatesCell({ row }) {
  const hasCoordinates = row.latitude !== null && row.longitude !== null;

  return (
    <Typography
      variant="body2"
      noWrap
      title={hasCoordinates ? `${row.latitude}, ${row.longitude}` : undefined}
      sx={{ color: hasCoordinates ? 'text.primary' : 'text.secondary' }}
    >
      {hasCoordinates ? `${row.latitude}, ${row.longitude}` : 'Not found'}
    </Typography>
  );
}

function CreateRowDialog({
  open,
  value,
  headers,
  onClose,
  onChange,
  onCreate,
  loading,
}) {
  const row = value?.row;
  const createType = value?.createType || 'leads';
  const rowFieldMap = value?.rowFieldMap || {};

  if (!row) return null;

  const fetchedDetails = googleDetailItems(row);

  const handleFieldChange = (header, field) => {
    onChange({
      rowFieldMap: {
        ...rowFieldMap,
        [header]: field || null,
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create From Row {row.index + 1}</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          <TextField
            select
            label="Create"
            value={createType}
            onChange={(event) => onChange({ createType: event.target.value })}
            fullWidth
          >
            <MenuItem value="leads">Lead</MenuItem>
            <MenuItem value="contacts">Contact</MenuItem>
          </TextField>

          {fetchedDetails.length > 0 && (
            <Box
              sx={{
                border: 1,
                borderColor: 'dividerLight',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Fetched Google Details
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {fetchedDetails.map((item) => (
                  <Chip
                    key={item.label}
                    label={`${item.label}: ${item.value}`}
                    size="small"
                    variant="soft"
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(0, 1fr) minmax(220px, 260px)',
              },
              gap: 1,
              minWidth: 0,
            }}
          >
            {headers.map((header) => (
              <Box key={header} sx={{ display: 'contents' }}>
                <Box
                  sx={{
                    minWidth: 0,
                    border: 1,
                    borderColor: 'dividerLight',
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    title={header}
                    sx={{ display: 'block', color: 'text.secondary' }}
                  >
                    {header}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    title={row.raw[header] || ''}
                  >
                    {row.raw[header] || '-'}
                  </Typography>
                </Box>
                <TextField
                  select
                  size="small"
                  label="Goes To"
                  value={rowFieldMap[header] || ''}
                  onChange={(event) =>
                    handleFieldChange(header, event.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="">Ignored</MenuItem>
                  {Object.entries(fieldLabels).map(([field, label]) => (
                    <MenuItem key={field} value={field}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          loading={loading}
          onClick={() => onCreate({ row, createType, rowFieldMap })}
        >
          Create {createType === 'contacts' ? 'Contact' : 'Lead'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function googleDetailItems(row) {
  if (!row) return [];

  return [
    { label: 'Company', value: row.companyName },
    { label: 'Phone', value: row.companyPhone },
    {
      label: 'Address',
      value: [row.addressLine1, row.city, row.region, row.postalCode]
        .filter(Boolean)
        .join(', '),
    },
    { label: 'County', value: row.county },
    {
      label: 'Coordinates',
      value:
        row.latitude !== null && row.longitude !== null
          ? `${row.latitude}, ${row.longitude}`
          : '',
    },
  ].filter((item) => cleanText(item.value));
}

function MergeDuplicateDialog({
  open,
  row,
  initialMatch,
  matches,
  loading,
  onClose,
  onMerge,
}) {
  const [matchKey, setMatchKey] = useState('');
  const [fieldChoices, setFieldChoices] = useState({});

  const selectedMatch =
    matches.find((match) => mergeMatchKey(match) === matchKey) ||
    initialMatch ||
    matches[0];
  const fields = mergeFieldsFor(selectedMatch, row);
  const matchesSignature = matches.map(mergeMatchKey).join('|');

  useEffect(() => {
    if (!open) return;

    const nextMatch = initialMatch || matches[0];
    setMatchKey(mergeMatchKey(nextMatch));
    setFieldChoices(defaultMergeChoices(nextMatch, row));
  }, [initialMatch, matchesSignature, open, row]);

  useEffect(() => {
    if (!open || !selectedMatch) return;
    setFieldChoices(defaultMergeChoices(selectedMatch, row));
  }, [matchKey]);

  if (!row || !selectedMatch) return null;

  const handleChoiceChange = (field, mode) => {
    setFieldChoices((current) => ({
      ...current,
      [field.key]: {
        ...(current[field.key] || {}),
        mode,
        custom:
          mode === 'custom'
            ? current[field.key]?.custom || resolveMergeValue(field, 'import')
            : current[field.key]?.custom || '',
      },
    }));
  };

  const handleCustomChange = (field, value) => {
    setFieldChoices((current) => ({
      ...current,
      [field.key]: {
        ...(current[field.key] || {}),
        mode: 'custom',
        custom: value,
      },
    }));
  };

  const handleMerge = () => {
    const values = fields.reduce((nextValues, field) => {
      const choice = fieldChoices[field.key] || {};
      return {
        ...nextValues,
        [field.key]:
          choice.mode === 'custom'
            ? choice.custom
            : resolveMergeValue(field, choice.mode || 'existing'),
      };
    }, {});

    onMerge({ row, match: selectedMatch, values });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Merge Duplicate Row {row.index + 1}</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} sx={{ pt: 1, minWidth: 0 }}>
          <TextField
            select
            label="Merge Into"
            value={mergeMatchKey(selectedMatch)}
            onChange={(event) => setMatchKey(event.target.value)}
            fullWidth
          >
            {matches.map((match) => (
              <MenuItem key={mergeMatchKey(match)} value={mergeMatchKey(match)}>
                {match.title} - {formatEnum(match.type)}
                {match.reasons.length ? ` (${match.reasons.join(', ')})` : ''}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '150px minmax(0, 1fr) minmax(0, 1fr) 160px',
              },
              gap: 1,
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            {fields.map((field) => {
              const choice = fieldChoices[field.key] || {};
              return (
                <Box key={field.key} sx={{ display: 'contents' }}>
                  <Typography variant="subtitle2">{field.label}</Typography>
                  <MergeValueBox label="Existing" value={field.existing} />
                  <MergeValueBox label="Import" value={field.incoming} />
                  <Stack direction="column" spacing={1} sx={{ minWidth: 0 }}>
                    <TextField
                      select
                      size="small"
                      label="Use"
                      value={choice.mode || 'existing'}
                      onChange={(event) =>
                        handleChoiceChange(field, event.target.value)
                      }
                      fullWidth
                    >
                      <MenuItem value="existing">Existing</MenuItem>
                      <MenuItem value="import">Import</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </TextField>
                    {choice.mode === 'custom' && (
                      <TextField
                        size="small"
                        label="Custom value"
                        value={choice.custom || ''}
                        onChange={(event) =>
                          handleCustomChange(field, event.target.value)
                        }
                        fullWidth
                      />
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" loading={loading} onClick={handleMerge}>
          Save Merge
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MergeValueBox({ label, value }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        border: 1,
        borderColor: 'dividerLight',
        borderRadius: 1,
        px: 1.25,
        py: 0.75,
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

function GoogleTargetSelect({ row, crmTargets, onChange }) {
  const action = row.googleAction || 'create_lead';
  const options =
    action === 'attach_contact'
      ? crmTargets.contacts
      : action === 'attach_lead'
        ? crmTargets.leads
        : [];
  const disabled = !['attach_contact', 'attach_lead'].includes(action);

  return (
    <TextField
      select
      size="small"
      value={disabled ? '' : row.googleTargetId || ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      fullWidth
    >
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
  if (row.mergedInto)
    return (
      <Chip
        label={`Merged ${formatEnum(row.mergedInto.type)}`}
        size="small"
        color="success"
        variant="soft"
      />
    );
  if (!row.isValid)
    return (
      <Chip
        label={row.errors.join(', ')}
        size="small"
        color="warning"
        variant="soft"
      />
    );
  if (row.googleAction === 'skip')
    return <Chip label="Skipped" size="small" color="neutral" variant="soft" />;
  if (
    ['attach_contact', 'attach_lead'].includes(row.googleAction) &&
    !row.googleTargetId
  )
    return (
      <Chip label="Select target" size="small" color="warning" variant="soft" />
    );
  if (row.duplicates.length)
    return (
      <Chip
        label="Possible duplicate"
        size="small"
        color="warning"
        variant="soft"
      />
    );
  return <Chip label="Ready" size="small" color="success" variant="soft" />;
}

function loadMappingProfiles() {
  if (typeof window === 'undefined') return [];

  try {
    const profiles = JSON.parse(
      window.localStorage.getItem(mappingProfilesStorageKey) || '[]',
    );
    return Array.isArray(profiles) ? profiles : [];
  } catch {
    return [];
  }
}

function saveMappingProfiles(profiles) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    mappingProfilesStorageKey,
    JSON.stringify(profiles),
  );
}

function isImportableRow(row, includeDuplicates) {
  if (row.mergedInto) return false;
  if (!row.isValid) return false;
  if (row.googleAction === 'skip') return false;
  if (
    ['attach_contact', 'attach_lead'].includes(row.googleAction) &&
    !row.googleTargetId
  )
    return false;
  return (
    includeDuplicates ||
    !row.duplicates.length ||
    ['attach_contact', 'attach_lead'].includes(row.googleAction)
  );
}

function mergeableDuplicates(row) {
  return (row?.duplicates || []).filter((duplicate) =>
    ['contact', 'lead'].includes(duplicate.type),
  );
}

function mergeMatchKey(match) {
  return match ? `${match.type}:${match.id}` : '';
}

function defaultMergeChoices(match, row) {
  return mergeFieldsFor(match, row).reduce((choices, field) => {
    const existing = cleanText(field.existing);
    const incoming = cleanText(field.incoming);
    return {
      ...choices,
      [field.key]: {
        mode: !existing && incoming ? 'import' : 'existing',
        custom: '',
      },
    };
  }, {});
}

function resolveMergeValue(field, mode) {
  return mode === 'import' ? field.incoming : field.existing;
}

function mergeFieldsFor(match, row) {
  if (!match || !row) return [];
  if (match.type === 'contact') return contactMergeFields(match.record, row);
  if (match.type === 'lead') return leadMergeFields(match.record, row);
  return [];
}

function contactMergeFields(record = {}, row) {
  return [
    {
      key: 'firstName',
      label: 'First Name',
      existing: record.first_name,
      incoming: row.firstName,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      existing: record.last_name,
      incoming: row.lastName,
    },
    {
      key: 'title',
      label: 'Role',
      existing: record.title,
      incoming: row.title,
    },
    {
      key: 'accountNumber',
      label: 'Account #',
      existing: record.account_number,
      incoming: row.accountNumber,
    },
    {
      key: 'email',
      label: 'Email',
      existing: record.email,
      incoming: row.email,
    },
    {
      key: 'phone',
      label: 'Phone',
      existing: formatPhone(record.phone),
      incoming: formatPhone(row.phone),
    },
    {
      key: 'mobilePhone',
      label: 'Mobile',
      existing: formatPhone(record.mobile_phone),
      incoming: formatPhone(row.mobilePhone),
    },
  ];
}

function leadMergeFields(record = {}, row) {
  return [
    {
      key: 'leadSource',
      label: 'Source',
      existing: record.source,
      incoming: row.leadSource || row.source,
    },
    {
      key: 'leadAccountNumber',
      label: 'Account #',
      existing: record.account_number,
      incoming: row.leadAccountNumber || row.accountNumber,
    },
    {
      key: 'leadStatus',
      label: 'Status',
      existing: record.status,
      incoming: row.leadStatus,
    },
    {
      key: 'priority',
      label: 'Priority',
      existing: record.priority,
      incoming: row.priority,
    },
    {
      key: 'estimatedBudget',
      label: 'Budget',
      existing: record.estimated_budget,
      incoming: row.estimatedBudget,
    },
    {
      key: 'nextFollowUpAt',
      label: 'Follow-up',
      existing: record.next_follow_up_at,
      incoming: row.nextFollowUpAt,
    },
    {
      key: 'leadLatitude',
      label: 'Latitude',
      existing: record.latitude,
      incoming: row.leadLatitude ?? row.latitude,
    },
    {
      key: 'leadLongitude',
      label: 'Longitude',
      existing: record.longitude,
      incoming: row.leadLongitude ?? row.longitude,
    },
    {
      key: 'leadNotes',
      label: 'Notes',
      existing: record.notes,
      incoming: row.leadNotes || row.notes,
    },
  ];
}

async function fetchCrmTargets(supabase) {
  const [contactsResult, leadsResult] = await Promise.all([
    supabase
      .from('contacts')
      .select(
        'id, first_name, last_name, account_number, email, companies(name)',
      )
      .order('created_at', { ascending: false })
      .limit(250),
    supabase
      .from('leads')
      .select(
        'id, source, account_number, status, contacts(first_name, last_name), companies(name)',
      )
      .neq('status', 'converted')
      .order('created_at', { ascending: false })
      .limit(250),
  ]);

  if (contactsResult.error) throw contactsResult.error;
  if (leadsResult.error) throw leadsResult.error;

  return {
    contacts: (contactsResult.data || []).map((contact) => ({
      id: contact.id,
      label: [
        contactName(contact),
        contact.account_number,
        contact.companies?.name,
        contact.email,
      ]
        .filter(Boolean)
        .join(' - '),
    })),
    leads: (leadsResult.data || []).map((lead) => ({
      id: lead.id,
      label: [
        lead.companies?.name ||
          (lead.contacts ? contactName(lead.contacts) : '') ||
          (lead.account_number ? `Account ${lead.account_number}` : '') ||
          lead.source ||
          'Lead',
        lead.account_number,
        formatLeadStatus(lead.status),
      ]
        .filter(Boolean)
        .join(' - '),
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
            firstName: row.firstName,
            lastName: row.lastName,
            companyName: row.companyName,
            phone: row.phone || row.workPhone,
            mobilePhone: row.mobilePhone,
            email: row.email,
            addressLine1: row.addressLine1,
            city: row.city,
            region: row.region,
            postalCode: row.postalCode,
          },
        });
      }

      const duplicates = checks.length
        ? await findPotentialDuplicates(supabase, checks)
        : [];
      return { ...row, duplicates };
    }),
  );
}

function normalizeImportRow(
  rawRow,
  headers,
  fieldMap,
  importType,
  index,
  options = {},
) {
  const row = {
    index,
    raw: rawRow,
    duplicates: [],
    errors: [],
    isGoogleSavedCollection: Boolean(options.isGoogleSavedCollection),
    sourceProfile: options.sourceProfile || null,
  };

  headers.forEach((header) => {
    const field = fieldMap[header];
    if (!field) return;
    row[field] = cleanText(rawRow[header]) || '';
  });

  if (!row.companyName && row.fullName && looksLikeCompanyName(row.fullName)) {
    row.companyName = row.fullName;
  }

  if (!row.firstName && !row.lastName && row.fullName && !row.companyName) {
    const parsedName = parsePersonName(row.fullName);
    row.firstName = parsedName.firstName;
    row.lastName = parsedName.lastName;
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
  row.importSource =
    row.importSource || row.sourceProfile?.source || row.sourceProfile?.label;
  row.leadSource = row.leadSource || row.importSource;
  row.callResult = row.callResult || row.madeContact || '';
  row.initialContactDate =
    row.initialContactDate || row.dateCalled || row.dateVisited;
  row.initialContactNotes = row.initialContactNotes || row.callResult;
  row.lastContactedAt = row.lastContactedAt || row.dateCalled;
  row.leadStatus =
    normalizeLeadStatus(row.leadStatus) ||
    inferLeadStatus(row.callResult, row.called, row.madeContact);
  row.priority = normalizePriority(row.priority);
  row.tags = parseList(row.tags);
  row.phone = formatPhone(row.phone);
  row.workPhone = formatPhone(row.workPhone);
  row.mobilePhone = formatPhone(row.mobilePhone);
  row.homePhone = formatPhone(row.homePhone);
  row.secondaryPhone = formatPhone(row.secondaryPhone);
  row.companyPhone = formatPhone(row.companyPhone);
  row.latitude = cleanNumber(row.latitude);
  row.longitude = cleanNumber(row.longitude);
  row.leadLatitude = cleanNumber(row.leadLatitude);
  row.leadLongitude = cleanNumber(row.leadLongitude);
  row.initialContactDate = cleanDateTime(row.initialContactDate);
  row.lastContactedAt = cleanDateTime(row.lastContactedAt);
  row.dateVisited = cleanDateTime(row.dateVisited);
  row.visited = parseBoolean(row.visited);
  row.called = parseBoolean(row.called);
  row.callAttemptCount = row.called || row.callResult ? 1 : 0;
  row.sourceDetails = buildSourceDetails(row);
  row.leadNotes = buildLeadNotes(row);

  row.shouldCreateContact =
    (importType !== 'leads' &&
      importType !== 'lead_call_list' &&
      !row.isGoogleSavedCollection) ||
    Boolean(
      importType !== 'lead_call_list' &&
        (row.firstName ||
          row.lastName ||
          row.accountNumber ||
          row.email ||
          row.phone ||
          row.mobilePhone),
    );
  row.shouldCreateLead =
    importType !== 'contacts' &&
    (hasLeadData(row) || (importType === 'leads' && hasCustomerData(row)));

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
    row.firstName ||
    row.lastName ||
    row.companyName ||
    row.phone ||
    row.mobilePhone ||
    row.email ||
    row.addressLine1 ||
    !['new', 'not_contacted'].includes(row.leadStatus) ||
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

function parsePersonName(value) {
  const text = cleanText(value) || '';
  if (!text) return { firstName: '', lastName: '' };

  if (text.includes(',')) {
    const [lastName, ...firstParts] = text.split(',');
    return {
      firstName: cleanText(firstParts.join(' ')) || '',
      lastName: cleanText(lastName) || '',
    };
  }

  const nameParts = text.split(/\s+/).filter(Boolean);
  return {
    firstName: nameParts.shift() || '',
    lastName: nameParts.join(' '),
  };
}

function looksLikeCompanyName(value) {
  const text = String(value || '').toLowerCase();
  return /\b(llc|l\.l\.c|inc|ltd|corp|company|co|farm|farms|dairy|ranch|livestock|partnership)\b/.test(
    text,
  );
}

function inferLeadStatus(callResult, called, madeContact) {
  const result = normalizeHeader([callResult, madeContact].filter(Boolean).join(' '));

  if (result.includes('badnumber')) return 'bad_number';
  if (result.includes('donotcontact') || result.includes('notafit'))
    return result.includes('donotcontact') ? 'do_not_contact' : 'not_a_fit';
  if (result.includes('leftvoicemail') || result.includes('voicemail'))
    return 'attempted';
  if (result.includes('phone') || result.includes('contacted')) return 'contacted';
  if (parseBoolean(called)) return 'attempted';
  return 'not_contacted';
}

function parseBoolean(value) {
  const normalized = normalizeHeader(value);
  if (['true', 'yes', 'y', '1', 'called', 'visited'].includes(normalized))
    return true;
  if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  return Boolean(value && normalized);
}

function buildSourceDetails(row) {
  const detailFields = [
    ['branch', 'Branch'],
    ['distance', 'Distance'],
    ['equipmentOwned', 'Equipment'],
    ['equipmentSerial', 'Serial #'],
    ['equipmentValue', 'Equipment / fleet value'],
    ['equityPercent', 'Equity %'],
    ['newUsed', 'New / used'],
    ['lastInstallment', 'Last installment'],
    ['apr', 'APR'],
    ['paymentAmount', 'Payment amount'],
    ['paymentFrequency', 'Payment frequency'],
    ['buyingProbability', 'Buying probability'],
    ['loyaltyScore', 'Loyalty score'],
    ['sourceDescription', 'Description'],
    ['prospectProfileUrl', 'Prospect profile'],
    ['startAddress', 'Start address'],
    ['routeUrl', 'Route'],
    ['equipmentYtd', 'Equipment YTD'],
    ['partsYtd', 'Parts YTD'],
    ['serviceYtd', 'Service YTD'],
    ['arTotalAging', 'AR aging'],
    ['secondaryFirstName', 'Secondary first name'],
    ['secondaryLastName', 'Secondary last name'],
    ['secondaryTitle', 'Secondary title'],
    ['secondaryPhone', 'Secondary phone'],
    ['secondaryEmail', 'Secondary email'],
  ];

  return detailFields.reduce((details, [field, label]) => {
    const value = cleanText(row[field]);
    return value ? { ...details, [field]: { label, value } } : details;
  }, {});
}

function buildLeadNotes(row) {
  const sourceLines = Object.values(row.sourceDetails || {}).map(
    (detail) => `${detail.label}: ${detail.value}`,
  );
  const contactLines = [
    row.homePhone ? `Home: ${row.homePhone}` : null,
    secondaryContactLine(row),
    row.callResult ? `Call result: ${row.callResult}` : null,
    row.visited ? 'Visited: yes' : null,
  ];

  return [
    cleanText(row.leadNotes || row.notes),
    ...contactLines,
    ...sourceLines,
  ]
    .filter(Boolean)
    .join('\n');
}

function secondaryContactLine(row) {
  const name = [row.secondaryFirstName, row.secondaryLastName]
    .filter(Boolean)
    .join(' ');
  const detail = [
    name,
    row.secondaryTitle,
    row.secondaryPhone,
    row.secondaryEmail,
  ]
    .filter(Boolean)
    .join(' - ');

  return detail ? `Secondary contact: ${detail}` : null;
}

function hasCustomerData(row) {
  return Boolean(
    row.firstName ||
    row.lastName ||
    row.accountNumber ||
    row.email ||
    row.phone ||
    row.mobilePhone ||
    row.companyName,
  );
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
        account_number: cleanText(row.accountNumber),
        website: cleanText(row.website),
        phone: cleanPhone(row.companyPhone || row.phone),
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
      phone: cleanPhone(row.phone),
      mobile_phone: cleanPhone(row.mobilePhone),
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
      first_name: cleanText(row.firstName),
      last_name: cleanText(row.lastName),
      company_name: cleanText(row.companyName),
      phone: cleanPhone(row.phone || row.workPhone),
      mobile_phone: cleanPhone(row.mobilePhone),
      home_phone: cleanPhone(row.homePhone),
      email: cleanText(row.email),
      address_line1: cleanText(row.addressLine1),
      address_line2: cleanText(row.addressLine2),
      city: cleanText(row.city),
      county: cleanText(row.county),
      region: cleanText(row.region),
      postal_code: cleanText(row.postalCode),
      country: cleanText(row.country) || 'US',
      branch: cleanText(row.branch),
      import_source: cleanText(row.importSource),
      source_details: row.sourceDetails || {},
      call_result: cleanText(row.callResult),
      call_attempt_count: row.callAttemptCount || 0,
      visited: Boolean(row.visited),
      last_visited_at: row.dateVisited || null,
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
    await saveLead(supabase, ownerId, companyId, null, {
      ...row,
      shouldCreateLead: true,
    });
    return { contacts: 0, leads: 1, mapUpdates: 0 };
  }

  if (action === 'create_contact') {
    const companyId = await saveCompany(supabase, ownerId, row);
    await saveContact(supabase, ownerId, companyId, googleRowToContact(row));
    return { contacts: 1, leads: 0, mapUpdates: 0 };
  }

  if (action === 'attach_contact') {
    await attachGoogleMapDataToContact(
      supabase,
      ownerId,
      row.googleTargetId,
      row,
    );
    return { contacts: 0, leads: 0, mapUpdates: 1 };
  }

  if (action === 'attach_lead') {
    await attachGoogleMapDataToLead(supabase, ownerId, row.googleTargetId, row);
    return { contacts: 0, leads: 0, mapUpdates: 1 };
  }

  return { contacts: 0, leads: 0, mapUpdates: 0 };
}

async function attachGoogleMapDataToContact(supabase, ownerId, contactId, row) {
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('id, company_id, notes, tags, latitude, longitude')
    .eq('id', contactId)
    .single();
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
  await insertGoogleMapNote(
    supabase,
    ownerId,
    { contactId, companyId: contact.company_id },
    row,
  );
}

async function attachGoogleMapDataToLead(supabase, ownerId, leadId, row) {
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, contact_id, company_id, notes, latitude, longitude')
    .eq('id', leadId)
    .single();
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
  await insertGoogleMapNote(
    supabase,
    ownerId,
    { leadId, contactId: lead.contact_id, companyId: lead.company_id },
    row,
  );
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

async function saveInitialContactActivity(
  supabase,
  ownerId,
  companyId,
  contactId,
  leadId,
  row,
) {
  if (!row.initialContactDate && !row.initialContactNotes) return;
  if (!contactId && !companyId && !leadId) return;

  const { error } = await supabase.from('activities').insert({
    owner_id: ownerId,
    company_id: companyId,
    contact_id: contactId,
    lead_id: leadId,
    type: 'call',
    direction: 'inbound',
    subject: row.leadSource
      ? `Initial contact - ${row.leadSource}`
      : 'Initial contact',
    body: cleanText(row.initialContactNotes),
    occurred_at: row.initialContactDate || new Date().toISOString(),
  });

  if (error) throw error;
}

function buildFieldMap(headers, sourceProfile = null) {
  return headers.reduce((map, header) => {
    const profileField =
      sourceProfile?.fieldMap?.[normalizeHeaderWithUnderscores(header)];
    const field = profileField || detectField(header);
    return field ? { ...map, [header]: field } : map;
  }, {});
}

function buildGoogleSavedCollectionFieldMap(headers) {
  return headers.reduce((map, header) => {
    const normalized = normalizeHeaderWithUnderscores(header);
    const field =
      googleSavedCollectionFieldMap[normalized] || detectField(header);
    return field ? { ...map, [header]: field } : map;
  }, {});
}

function isGoogleSavedCollectionsCsv(headers) {
  const normalizedHeaders = headers.map(normalizeHeaderWithUnderscores);
  return (
    normalizedHeaders.includes('title') &&
    (normalizedHeaders.includes('item_content_url') ||
      normalizedHeaders.includes('url'))
  );
}

function detectLeadSourceProfile(headers) {
  const normalizedHeaders = headers.map(normalizeHeaderWithUnderscores);
  return (
    leadSourceProfiles.find((profile) =>
      profile.requiredHeaders.every((header) =>
        normalizedHeaders.includes(header),
      ),
    ) || null
  );
}

function detectField(header) {
  const normalized = normalizeHeader(header);
  const tokens = String(header || '')
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .filter(Boolean);
  const hasAccountToken = tokens.some((token) =>
    ['account', 'acct', 'customer', 'cust'].includes(token),
  );
  const hasNumberToken = tokens.some((token) =>
    ['nu', 'num', 'no', 'nbr', 'number', 'id', '#'].includes(token),
  );

  if (
    (hasAccountToken && hasNumberToken) ||
    /^(account|acct|cust|customer)(nu|num|no|nbr|number|id)$/.test(normalized)
  ) {
    return 'accountNumber';
  }

  return (
    Object.entries(fieldAliases).find(([, aliases]) =>
      aliases.map(normalizeHeader).includes(normalized),
    )?.[0] || null
  );
}

function parseCsv(text) {
  const lines = parseCsvRows(text).filter((row) =>
    row.some((value) => cleanText(value)),
  );
  if (lines.length < 2)
    throw new Error('CSV needs a header row and at least one data row.');

  const headerIndex = findHeaderRowIndex(lines);
  const headers = lines[headerIndex]
    .map((header) => cleanText(header))
    .filter(Boolean);
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
    return (
      normalizedHeaders.includes('title') &&
      (normalizedHeaders.includes('item_content_url') ||
        normalizedHeaders.includes('url'))
    );
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
  if (value === '' || value === null || typeof value === 'undefined')
    return null;
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
  const parts = [
    ...new Set(
      [cleanText(row.notes), cleanText(row.leadNotes)].filter(Boolean),
    ),
  ];
  const mapLine = cleanText(row.website)
    ? `Google Maps: ${cleanText(row.website)}`
    : null;

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

function applyGooglePlaceDetails(row, place) {
  const nextRow = {
    ...row,
    companyName: place.name || row.companyName,
    companyPhone: formatPhone(place.phone || row.companyPhone),
    website: place.websiteUri || row.website || place.googleMapsUri,
    addressLine1: place.addressLine1 || row.addressLine1,
    addressLine2: place.addressLine2 || row.addressLine2,
    city: place.city || row.city,
    county: place.county || row.county,
    region: place.region || row.region,
    postalCode: place.postalCode || row.postalCode,
    country: place.country || row.country || 'US',
    latitude: place.latitude ?? row.latitude,
    longitude: place.longitude ?? row.longitude,
    leadLatitude: place.latitude ?? row.leadLatitude,
    leadLongitude: place.longitude ?? row.leadLongitude,
  };
  const detailNotes = [
    place.formattedAddress ? `Address: ${place.formattedAddress}` : null,
    place.googleMapsUri ? `Google Maps: ${place.googleMapsUri}` : null,
    place.placeId ? `Google Place ID: ${place.placeId}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  nextRow.notes = appendText(row.notes, detailNotes);
  nextRow.leadNotes = appendText(row.leadNotes, detailNotes);
  return { ...nextRow, isValid: true, errors: [] };
}

function mergeFetchedGoogleDetails(sourceRow, mappedRow) {
  const googleFields = [
    'companyName',
    'companyPhone',
    'website',
    'addressLine1',
    'addressLine2',
    'city',
    'county',
    'region',
    'postalCode',
    'country',
    'latitude',
    'longitude',
    'leadLatitude',
    'leadLongitude',
  ];

  const mergedRow = { ...mappedRow };
  googleFields.forEach((field) => {
    if (hasFieldValue(sourceRow[field]) && !hasFieldValue(mergedRow[field])) {
      mergedRow[field] = sourceRow[field];
    }
  });

  mergedRow.notes = appendText(mappedRow.notes, sourceRow.notes);
  mergedRow.leadNotes = appendText(mappedRow.leadNotes, sourceRow.leadNotes);

  return mergedRow;
}

function hasFieldValue(value) {
  return value !== null && typeof value !== 'undefined' && value !== '';
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
  return [
    ...new Set(
      [
        ...(Array.isArray(currentTags) ? currentTags : []),
        ...(Array.isArray(nextTags) ? nextTags : []),
      ].filter(Boolean),
    ),
  ];
}

function buildImportReview(headers, fieldMap, previewRows) {
  const mapped = headers
    .map((header) => ({ header, field: fieldMap[header] }))
    .filter((item) => item.field);
  const core = mapped.filter((item) => coreImportFields.has(item.field));
  const preserved = mapped.filter((item) => preservedImportFields.has(item.field));
  const ignored = headers
    .filter((header) => !fieldMap[header])
    .map((header) => ({ header, field: null }));

  return {
    core,
    preserved,
    ignored,
    warnings: importWarnings(previewRows, fieldMap),
  };
}

function importWarnings(previewRows, fieldMap) {
  const warnings = [];
  const rows = previewRows || [];
  const mappedFields = new Set(Object.values(fieldMap).filter(Boolean));
  const missingPhoneCount = rows.filter(
    (row) => !row.phone && !row.mobilePhone && !row.homePhone,
  ).length;
  const missingNameCount = rows.filter(
    (row) => !row.firstName && !row.lastName && !row.companyName,
  ).length;
  const missingAddressCount = rows.filter(
    (row) =>
      !row.addressLine1 &&
      !row.city &&
      !row.region &&
      !row.postalCode &&
      row.latitude === null &&
      row.longitude === null,
  ).length;

  if (!mappedFields.has('phone') && !mappedFields.has('mobilePhone')) {
    warnings.push('No primary phone column is mapped.');
  }
  if (!mappedFields.has('firstName') && !mappedFields.has('fullName')) {
    warnings.push('No primary person name column is mapped.');
  }
  if (missingPhoneCount) {
    warnings.push(`${missingPhoneCount} preview row${missingPhoneCount === 1 ? '' : 's'} have no phone number.`);
  }
  if (missingNameCount) {
    warnings.push(`${missingNameCount} preview row${missingNameCount === 1 ? '' : 's'} have no person or company name.`);
  }
  if (missingAddressCount) {
    warnings.push(`${missingAddressCount} preview row${missingAddressCount === 1 ? '' : 's'} have no address or coordinates.`);
  }

  return warnings.slice(0, 5);
}

function contactName(contact) {
  return (
    [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') ||
    'Contact'
  );
}

function parseGoogleMapsCoordinates(value) {
  const url = cleanText(value);
  if (!url) return null;

  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) return toCoordinatePair(atMatch[1], atMatch[2]);

  const dataMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataMatch) return toCoordinatePair(dataMatch[1], dataMatch[2]);

  const bangMatch = url.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (bangMatch) return toCoordinatePair(bangMatch[2], bangMatch[1]);

  const coordinateTextMatch = safeDecodeURIComponent(url).match(
    /(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  );
  if (coordinateTextMatch)
    return toCoordinatePair(coordinateTextMatch[1], coordinateTextMatch[2]);

  try {
    const parsedUrl = new URL(url);
    const queryValue =
      parsedUrl.searchParams.get('q') ||
      parsedUrl.searchParams.get('query') ||
      parsedUrl.searchParams.get('ll') ||
      parsedUrl.searchParams.get('center');
    const queryMatch = queryValue?.match(
      /(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
    );
    if (queryMatch) return toCoordinatePair(queryMatch[1], queryMatch[2]);
  } catch {
    return null;
  }

  return null;
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toCoordinatePair(latitudeValue, longitudeValue) {
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    return null;
  return { latitude, longitude };
}

function normalizeLeadStatus(value) {
  const normalized = normalizeHeader(value);
  return (
    [
      'not_contacted',
      'attempted',
      'contacted',
      'relationship_started',
      'bad_number',
      'do_not_contact',
      'not_a_fit',
      'converted',
      'new',
      'working',
      'qualified',
      'unqualified',
    ].find(
      (status) => normalizeHeader(status) === normalized,
    ) || null
  );
}

function normalizePriority(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 3;
  return Math.min(Math.max(Math.round(number), 1), 5);
}

export default CRMImport;
