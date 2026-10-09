import { Link, Stack, Typography } from "@mui/material";
import { formatAddress } from "./addressFormat";

export default function AddressInfoRow({ record }) {
  const address = formatAddress(record);
  const query = encodeURIComponent(address);

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Address
      </Typography>
      <Stack spacing={0.5} sx={{ minWidth: 0, alignItems: "flex-end" }}>
        <Typography
          variant="body2"
          sx={{ textAlign: "right", fontWeight: 600, overflowWrap: "anywhere" }}
        >
          {address || "-"}
        </Typography>
        {address && (
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
          >
            <Link
              href={`https://maps.apple.com/?address=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              aria-label={`Open ${address} in Apple Maps`}
            >
              Apple Maps
            </Link>
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              aria-label={`Open ${address} in Google Maps`}
            >
              Google Maps
            </Link>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
