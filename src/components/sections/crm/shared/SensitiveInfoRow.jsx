"use client";

import { useEffect, useState } from "react";
import {
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import IconifyIcon from "components/base/IconifyIcon";

const REVEAL_DURATION_MS = 60_000;

const SensitiveInfoRow = ({
  label,
  maskedValue,
  endpoint,
  format,
  revealByDefault = false,
}) => {
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isVisible = value !== null;

  useEffect(() => {
    if (!isVisible || revealByDefault) return undefined;

    const timeout = window.setTimeout(() => setValue(null), REVEAL_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [isVisible, revealByDefault]);

  useEffect(() => {
    if (!revealByDefault) return undefined;

    let isActive = true;
    setIsLoading(true);
    setError(null);

    fetchSensitiveValue(endpoint)
      .then((revealedValue) => {
        if (isActive) setValue(revealedValue);
      })
      .catch((revealError) => {
        if (isActive) setError(revealError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [endpoint, revealByDefault]);

  const handleToggle = async () => {
    if (isVisible) {
      setValue(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setValue(await fetchSensitiveValue(endpoint));
    } catch (revealError) {
      setError(revealError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", justifyContent: "flex-end", minWidth: 0 }}
      >
        <Typography
          variant="body2"
          color={error ? "error" : "text.primary"}
          sx={{ textAlign: "right", fontWeight: 600, overflowWrap: "anywhere" }}
        >
          {error ||
            (isVisible ? formatSensitiveValue(value, format) : maskedValue)}
        </Typography>
        {revealByDefault ? (
          isLoading && <CircularProgress size={18} />
        ) : (
          <Tooltip title={isVisible ? `Hide ${label}` : `Reveal ${label}`}>
            <span>
              <IconButton
                size="small"
                onClick={handleToggle}
                disabled={isLoading}
                aria-label={isVisible ? `Hide ${label}` : `Reveal ${label}`}
              >
                {isLoading ? (
                  <CircularProgress size={18} />
                ) : (
                  <IconifyIcon
                    icon={
                      isVisible
                        ? "material-symbols:visibility-off-outline-rounded"
                        : "material-symbols:visibility-outline-rounded"
                    }
                    sx={{ fontSize: 20 }}
                  />
                )}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};

async function fetchSensitiveValue(endpoint) {
  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Could not reveal this value.");
  }

  return result.value;
}

function formatSensitiveValue(value, format) {
  if (!value) return "-";

  if (format === "ssn") {
    const digits = value.replace(/\D/g, "");
    return digits.length === 9
      ? `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
      : value;
  }

  if (format === "ein") {
    const digits = value.replace(/\D/g, "");
    return digits.length === 9
      ? `${digits.slice(0, 2)}-${digits.slice(2)}`
      : value;
  }

  return value;
}

export default SensitiveInfoRow;
