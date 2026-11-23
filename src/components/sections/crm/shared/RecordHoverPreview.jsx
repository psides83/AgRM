"use client";

import { useEffect, useState } from "react";
import { Box, Link, Stack, Tooltip, Typography } from "@mui/material";
import { createClient } from "lib/supabase/client";
import AddressInfoRow from "./AddressInfoRow";
import { formatPhone } from "./phoneFormat";

const addressFields =
  "address_line1,address_line2,city,county,region,postal_code,country";
const fields = {
  contacts: `first_name,last_name,title,email,phone,mobile_phone,${addressFields}`,
  leads: `first_name,last_name,company_name,email,phone,mobile_phone,home_phone,${addressFields}`,
  companies: `name,company_type,email,phone,${addressFields}`,
};

// Match only individual CRM records, leaving list and external links alone.
export function getPreviewRecord(href) {
  const pathname =
    typeof href === "string" ? href.split(/[?#]/)[0] : href?.pathname;
  const match = pathname?.match(
    /^\/apps\/crm\/(contacts|leads|companies)\/([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})\/?$/i,
  );
  return match ? { table: match[1], id: match[2] } : null;
}

export default function RecordHoverPreview({ table, id, children }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setResult(null);

    async function load() {
      try {
        const { data, error } = await createClient()
          .from(table)
          .select(fields[table])
          .eq("id", id)
          .maybeSingle();
        if (active) setResult({ data: error ? null : data });
      } catch {
        if (active) setResult({ data: null });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [open, table, id]);

  const record = result?.data;
  const label =
    table === "companies" ? "Company" : table === "leads" ? "Lead" : "Contact";
  const name =
    record?.name ||
    [record?.first_name, record?.last_name].filter(Boolean).join(" ") ||
    record?.company_name ||
    label;

  return (
    <Tooltip
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      describeChild
      disableTouchListener
      enterDelay={250}
      leaveDelay={150}
      placement="bottom-start"
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: 8,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            width: 340,
            maxWidth: "calc(100vw - 32px)",
            boxSizing: "border-box",
          },
        },
      }}
      title={
        <Box aria-live="polite">
          {!result ? (
            <Typography variant="body2">
              Loading {label.toLowerCase()} details…
            </Typography>
          ) : !record ? (
            <Typography variant="body2">
              Unable to load {label.toLowerCase()} details.
            </Typography>
          ) : (
            <Stack direction="column" spacing={1.25}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                >
                  {name}
                </Typography>
                {(record.title ||
                  record.company_type ||
                  (table === "leads" && record.company_name !== name)) && (
                  <Typography variant="body2" color="text.secondary">
                    {record.title || record.company_type || record.company_name}
                  </Typography>
                )}
              </Box>
              <PreviewRow
                label="Email"
                value={record.email}
                href={record.email ? `mailto:${record.email}` : undefined}
              />
              <PreviewRow
                label="Phone"
                value={formatPhone(record.phone)}
                href={record.phone ? `tel:${record.phone}` : undefined}
              />
              {record.mobile_phone && (
                <PreviewRow
                  label="Mobile"
                  value={formatPhone(record.mobile_phone)}
                  href={`tel:${record.mobile_phone}`}
                />
              )}
              {record.home_phone && (
                <PreviewRow
                  label="Home"
                  value={formatPhone(record.home_phone)}
                  href={`tel:${record.home_phone}`}
                />
              )}
              <AddressInfoRow record={record} />
            </Stack>
          )}
        </Box>
      }
    >
      {children}
    </Tooltip>
  );
}

function PreviewRow({ label, value, href }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      {value ? (
        <Link
          href={href}
          variant="body2"
          sx={{ overflowWrap: "anywhere", textAlign: "right", minWidth: 0 }}
        >
          {value}
        </Link>
      ) : (
        <Typography variant="body2">-</Typography>
      )}
    </Stack>
  );
}
