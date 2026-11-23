"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
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
  const [touchPreview, setTouchPreview] = useState(false);
  const pointerType = useRef(null);
  const trigger = useRef(null);
  const card = useRef(null);

  useEffect(() => {
    if (!open || !touchPreview) return;
    const dismissOutside = (event) => {
      if (
        !trigger.current?.contains(event.target) &&
        !card.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const dismissEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open, touchPreview]);

  const previewLink = cloneElement(children, {
    onPointerDown: (event) => {
      pointerType.current = event.pointerType;
      trigger.current = event.currentTarget;
      if (event.pointerType === "touch") setTouchPreview(true);
      else setTouchPreview(false);
      children.props.onPointerDown?.(event);
    },
    onClick: (event) => {
      const isTouch =
        event.nativeEvent.pointerType === "touch" ||
        (event.detail !== 0 && pointerType.current === "touch");
      if (
        isTouch &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        if (!open) {
          event.preventDefault();
          setTouchPreview(true);
          setOpen(true);
          return;
        }
        setOpen(false);
      }
      children.props.onClick?.(event);
    },
  });

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
      onOpen={() => {
        if (!touchPreview) setOpen(true);
      }}
      onClose={() => {
        if (!touchPreview) setOpen(false);
      }}
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
            boxShadow: 4,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            boxSizing: "border-box",
            maxHeight: "calc(100vh - 32px)",
            "@supports (height: 100dvh)": { maxHeight: "calc(100dvh - 32px)" },
            overflowY: "auto",
            ...(touchPreview && {
              "& a": {
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-end",
              },
            }),
          },
        },
      }}
      title={
        <Box ref={card} aria-live="polite">
          {touchPreview && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Tap the original link again to open
              </Typography>
              <IconButton
                aria-label="Close preview"
                onClick={() => setOpen(false)}
                sx={{ width: 44, height: 44, flexShrink: 0 }}
              >
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{ fontSize: 24, lineHeight: 1 }}
                >
                  ×
                </Box>
              </IconButton>
            </Stack>
          )}
          {!result ? (
            <Stack
              direction="column"
              spacing={1}
              aria-label={`Loading ${label.toLowerCase()} details`}
            >
              <Skeleton variant="rounded" width="65%" height={32} />
              <Skeleton width="90%" />
              <Skeleton width="80%" />
            </Stack>
          ) : !record ? (
            <Typography variant="body2">
              Unable to load {label.toLowerCase()} details.
            </Typography>
          ) : (
            <Stack direction="column" spacing={1.5}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      overflowWrap: "anywhere",
                      lineHeight: 1.35,
                    }}
                  >
                    {name}
                  </Typography>
                  {(record.title ||
                    record.company_type ||
                    (table === "leads" && record.company_name !== name)) && (
                    <Typography variant="body2" color="text.secondary">
                      {record.title ||
                        record.company_type ||
                        record.company_name}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Divider />
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
              <Box sx={{ pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                <AddressInfoRow record={record} />
              </Box>
            </Stack>
          )}
        </Box>
      }
    >
      {previewLink}
    </Tooltip>
  );
}

function PreviewRow({ label, value, href }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "64px minmax(0, 1fr)",
        gap: 2,
        alignItems: "baseline",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      {value ? (
        <Link
          href={href}
          variant="body2"
          sx={{
            overflowWrap: "anywhere",
            textAlign: "right",
            minWidth: 0,
            fontWeight: 500,
          }}
        >
          {value}
        </Link>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "right" }}
        >
          Not provided
        </Typography>
      )}
    </Box>
  );
}
