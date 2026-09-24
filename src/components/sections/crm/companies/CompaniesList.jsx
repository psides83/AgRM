"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";
import IconifyIcon from "components/base/IconifyIcon";
import PageHeader from "components/sections/ecommerce/admin/common/PageHeader";
import {
  cleanPhone,
  formatPhone,
  handlePhoneChange,
} from "components/sections/crm/shared/phoneFormat";
import { createClient } from "lib/supabase/client";
import paths from "routes/paths";

const emptyCompanyForm = {
  name: "",
  companyType: "",
  ein: "",
  agTaxExemptNumber: "",
  accountNumber: "",
  website: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  region: "",
  postalCode: "",
  country: "US",
  latitude: "",
  longitude: "",
  notes: "",
};

const CompaniesList = () => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "createdAt", direction: "desc" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchCompanies = async () => {
    setError(null);

    const [companiesResult, contactsResult, linksResult, activitiesResult] =
      await Promise.all([
        supabase
          .from("companies")
          .select(
            "id, name, company_type, account_number, website, email, phone, city, region, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("contacts")
          .select("id, company_id, first_name, last_name, title")
          .not("company_id", "is", null)
          .order("last_name", { ascending: true }),
        supabase
          .from("contact_companies")
          .select(
            "company_id, is_primary, contacts(id, first_name, last_name, title)",
          )
          .order("is_primary", { ascending: false }),
        supabase
          .from("activities")
          .select("id, company_id, type, subject, occurred_at, created_at")
          .not("company_id", "is", null)
          .order("occurred_at", { ascending: false }),
      ]);

    const queryError =
      companiesResult.error ||
      contactsResult.error ||
      linksResult.error ||
      activitiesResult.error;

    if (queryError) {
      setError(queryError.message);
    } else {
      const contactsByCompany = linkedContactsByCompany(
        contactsResult.data || [],
        linksResult.data || [],
      );
      const latestActivityByCompany = latestActivitiesByCompany(
        activitiesResult.data || [],
      );

      setCompanies(
        (companiesResult.data || []).map((company) => ({
          ...company,
          linkedContacts: contactsByCompany.get(company.id) || [],
          latestActivity: latestActivityByCompany.get(company.id) || null,
        })),
      );
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();

    const channel = supabase
      .channel("agrm-companies-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "companies" },
        () => fetchCompanies(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        () => fetchCompanies(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_companies" },
        () => fetchCompanies(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        () => fetchCompanies(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return companies;

    return companies.filter((company) => {
      const values = [
        company.name,
        company.company_type,
        company.account_number,
        company.website,
        company.email,
        company.phone,
        company.city,
        company.region,
        company.latestActivity?.type,
        company.latestActivity?.subject,
        ...company.linkedContacts.flatMap((contact) => [
          contact.first_name,
          contact.last_name,
          contact.title,
        ]),
      ];

      return values
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [companies, search]);

  const sortedCompanies = useMemo(
    () => [...filteredCompanies].sort((a, b) => compareCompanies(a, b, sort)),
    [filteredCompanies, sort],
  );

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Companies"
          breadcrumb={[
            { label: "Home", url: paths.crm },
            { label: "Companies", active: true },
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
                variant="contained"
                size="large"
                startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
                onClick={() => setCreateOpen(true)}
              >
                Add Company
              </Button>
            </Stack>
          }
        />
      </Grid>

      <Grid size={12}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <Box>
              <Typography variant="h6">Company accounts</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {companies.length} total compan
                {companies.length === 1 ? "y" : "ies"}
              </Typography>
            </Box>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search companies, contacts, phones..."
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
                    label="Company"
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
                    label="Type"
                    sortKey="type"
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
                    label="People"
                    sortKey="people"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Last Activity"
                    sortKey="lastActivity"
                    activeSort={sort}
                    onSort={handleSort}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <EmptyRow label="Loading companies..." />
                ) : sortedCompanies.length ? (
                  sortedCompanies.map((company) => (
                    <TableRow key={company.id} hover>
                      <TableCell>
                        <Link
                          href={paths.companyDetails(company.id)}
                          underline="hover"
                          sx={{ color: "text.primary", fontWeight: 700 }}
                        >
                          {company.name}
                        </Link>
                        {company.website && (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", display: "block" }}
                          >
                            {company.website}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{company.account_number || "-"}</TableCell>
                      <TableCell>
                        {formatEnum(company.company_type) || "-"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {company.email || "-"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {formatPhone(company.phone) || "No phone"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {[company.city, company.region]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        {company.linkedContacts.length ? (
                          <Stack spacing={0.25}>
                            {company.linkedContacts
                              .slice(0, 2)
                              .map((contact) => (
                                <Link
                                  key={contact.id}
                                  href={paths.contactDetails(contact.id)}
                                  underline="hover"
                                  sx={{
                                    color: "text.primary",
                                    fontWeight: 600,
                                  }}
                                >
                                  {contactName(contact)}
                                </Link>
                              ))}
                            {company.linkedContacts.length > 2 && (
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                +{company.linkedContacts.length - 2} more
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="body2">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(
                            company.latestActivity?.occurred_at ||
                              company.latestActivity?.created_at,
                          )}
                        </Typography>
                        {company.latestActivity && (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {[
                              formatEnum(company.latestActivity.type),
                              company.latestActivity.subject,
                            ]
                              .filter(Boolean)
                              .join(" - ")}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow
                    label={
                      search ? "No matching companies" : "No companies yet"
                    }
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <CreateCompanyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(companyId) => router.push(paths.companyDetails(companyId))}
        supabase={supabase}
      />
    </Grid>
  );
};

function CreateCompanyDialog({ open, onClose, onCreated, supabase }) {
  const [form, setForm] = useState(emptyCompanyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(emptyCompanyForm);
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    const ein = form.ein.replace(/\D/g, "");
    if (ein && ein.length !== 9) {
      setError("EIN must have 9 digits.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setIsSaving(false);
      setError(
        authError?.message || "You must be signed in to create a company.",
      );
      return;
    }

    const { data, error: insertError } = await supabase
      .from("companies")
      .insert({
        owner_id: authData.user.id,
        name: form.name.trim(),
        company_type: cleanText(form.companyType),
        account_number: cleanText(form.accountNumber),
        website: cleanText(form.website),
        email: cleanText(form.email),
        phone: cleanPhone(form.phone),
        address_line1: cleanText(form.addressLine1),
        address_line2: cleanText(form.addressLine2),
        city: cleanText(form.city),
        county: cleanText(form.county),
        region: cleanText(form.region),
        postal_code: cleanText(form.postalCode),
        country: cleanText(form.country) || "US",
        latitude: cleanNumber(form.latitude),
        longitude: cleanNumber(form.longitude),
        notes: cleanText(form.notes),
      })
      .select("id")
      .single();

    if (insertError) {
      setIsSaving(false);
      setError(insertError.message);
      return;
    }

    try {
      await saveCompanySensitiveFields(data.id, {
        ein,
        agTaxExemptNumber: form.agTaxExemptNumber,
      });
    } catch (sensitiveError) {
      setIsSaving(false);
      setError(sensitiveError.message);
      return;
    }

    setIsSaving(false);

    onClose();
    onCreated(data.id);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>Add Company</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <CompanyFormSection title="Company Details">
            <TextField
              label="Company Name"
              value={form.name}
              onChange={handleField(setForm, "name")}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Company Type"
              placeholder="Farm, contractor, municipality..."
              value={form.companyType}
              onChange={handleField(setForm, "companyType")}
              fullWidth
            />
            <TextField
              label="Account Number"
              value={form.accountNumber}
              onChange={handleField(setForm, "accountNumber")}
              fullWidth
            />
            <TextField
              label="Employer Identification Number (EIN)"
              value={form.ein}
              onChange={handleField(setForm, "ein")}
              helperText="Stored encrypted; only the last four is shown later."
              slotProps={{
                htmlInput: {
                  autoComplete: "new-password",
                  inputMode: "numeric",
                  "data-1p-ignore": "true",
                  "data-bwignore": "true",
                  "data-form-type": "other",
                  "data-lpignore": "true",
                  style: { WebkitTextSecurity: "disc" },
                },
              }}
              fullWidth
            />
            <TextField
              label="Ag Tax-Exempt Number"
              value={form.agTaxExemptNumber}
              onChange={handleField(setForm, "agTaxExemptNumber")}
              helperText="Stored encrypted; only the last four is shown later."
              slotProps={{
                htmlInput: {
                  autoComplete: "new-password",
                  "data-1p-ignore": "true",
                  "data-bwignore": "true",
                  "data-form-type": "other",
                  "data-lpignore": "true",
                  style: { WebkitTextSecurity: "disc" },
                },
              }}
              fullWidth
            />
            <TextField
              label="Website"
              value={form.website}
              onChange={handleField(setForm, "website")}
              fullWidth
            />
            <TextField
              label="Company Phone"
              value={form.phone}
              onChange={handlePhoneChange(setForm, "phone")}
              fullWidth
            />
            <TextField
              label="Company Email"
              type="email"
              value={form.email}
              onChange={handleField(setForm, "email")}
              fullWidth
            />
          </CompanyFormSection>

          <CompanyFormSection title="Company Address">
            <TextField
              label="Address Line 1"
              value={form.addressLine1}
              onChange={handleField(setForm, "addressLine1")}
              fullWidth
            />
            <TextField
              label="Address Line 2"
              value={form.addressLine2}
              onChange={handleField(setForm, "addressLine2")}
              fullWidth
            />
            <TextField
              label="City"
              value={form.city}
              onChange={handleField(setForm, "city")}
              fullWidth
            />
            <TextField
              label="County"
              value={form.county}
              onChange={handleField(setForm, "county")}
              fullWidth
            />
            <TextField
              label="State / Region"
              value={form.region}
              onChange={handleField(setForm, "region")}
              fullWidth
            />
            <TextField
              label="Postal Code"
              value={form.postalCode}
              onChange={handleField(setForm, "postalCode")}
              fullWidth
            />
            <TextField
              label="Country"
              value={form.country}
              onChange={handleField(setForm, "country")}
              fullWidth
            />
            <TextField
              label="Latitude"
              type="number"
              value={form.latitude}
              onChange={handleField(setForm, "latitude")}
              fullWidth
            />
            <TextField
              label="Longitude"
              type="number"
              value={form.longitude}
              onChange={handleField(setForm, "longitude")}
              fullWidth
            />
          </CompanyFormSection>

          <CompanyFormSection title="Company Notes">
            <TextField
              label="Company Notes"
              value={form.notes}
              onChange={handleField(setForm, "notes")}
              fullWidth
              multiline
              rows={4}
            />
          </CompanyFormSection>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="neutral" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} loading={isSaving}>
          Add Company
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CompanyFormSection({ title, children }) {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Divider />
      </Box>
      {children}
    </Stack>
  );
}

function EmptyRow({ label }) {
  return (
    <TableRow>
      <TableCell colSpan={7}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center", py: 5 }}
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
        direction={activeSort.key === sortKey ? activeSort.direction : "asc"}
        onClick={() => onSort(sortKey)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function linkedContactsByCompany(directContacts, links) {
  const contactsByCompany = new Map();

  const addContact = (companyId, contact) => {
    if (!companyId || !contact?.id) return;
    const contacts = contactsByCompany.get(companyId) || [];
    if (!contacts.some((item) => item.id === contact.id))
      contacts.push(contact);
    contactsByCompany.set(companyId, contacts);
  };

  directContacts.forEach((contact) => addContact(contact.company_id, contact));
  links.forEach((link) => addContact(link.company_id, link.contacts));

  return contactsByCompany;
}

function latestActivitiesByCompany(activities) {
  return activities.reduce((latestByCompany, activity) => {
    if (!activity.company_id || latestByCompany.has(activity.company_id)) {
      return latestByCompany;
    }
    latestByCompany.set(activity.company_id, activity);
    return latestByCompany;
  }, new Map());
}

function compareCompanies(a, b, sort) {
  const direction = sort.direction === "asc" ? 1 : -1;
  const aValue = sortValue(a, sort.key);
  const bValue = sortValue(b, sort.key);

  if (sort.key === "lastActivity" || sort.key === "createdAt") {
    return (dateValue(aValue) - dateValue(bValue)) * direction;
  }

  return (
    String(aValue || "").localeCompare(String(bValue || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * direction
  );
}

function sortValue(company, key) {
  if (key === "name") return company.name;
  if (key === "account") return company.account_number;
  if (key === "type") return company.company_type;
  if (key === "contact")
    return [company.email, company.phone].filter(Boolean).join(" ");
  if (key === "location")
    return [company.city, company.region].filter(Boolean).join(" ");
  if (key === "people")
    return company.linkedContacts.map(contactName).join(" ");
  if (key === "lastActivity") {
    return (
      company.latestActivity?.occurred_at ||
      company.latestActivity?.created_at ||
      null
    );
  }
  return company.created_at;
}

function contactName(contact) {
  return (
    [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ||
    "Contact"
  );
}

function dateValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function handleField(setter, field) {
  return (event) => {
    setter((current) => ({ ...current, [field]: event.target.value }));
  };
}

function cleanText(value) {
  const cleaned = String(value || "").trim();
  return cleaned || null;
}

function cleanNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function saveCompanySensitiveFields(companyId, form) {
  const ein = cleanText(form.ein);
  const agTaxExemptNumber = cleanText(form.agTaxExemptNumber);

  if (!ein && !agTaxExemptNumber) return;

  const response = await fetch(`/api/crm/company-sensitive/${companyId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(ein ? { ein } : {}),
      ...(agTaxExemptNumber ? { agTaxExemptNumber } : {}),
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Could not save sensitive company data.");
  }
}

export default CompaniesList;
