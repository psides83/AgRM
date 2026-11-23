import { Link, Stack, Typography } from "@mui/material";
import { formatAddress, getDirectionsDestination } from "./addressFormat";

export default function AddressInfoRow({ record, label = "Address" }) {
  const address = formatAddress(record);
  const destination = getDirectionsDestination(record);
  const query = encodeURIComponent(destination);

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Stack
        direction="column"
        spacing={0.5}
        sx={{ minWidth: 0, alignItems: "flex-end" }}
      >
        <Typography
          variant="body2"
          sx={{ textAlign: "right", fontWeight: 600, overflowWrap: "anywhere" }}
        >
          {address || "-"}
        </Typography>
        {destination && (
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
          >
            <Link
              href={`https://maps.apple.com/directions?destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              aria-label={`Get directions to ${destination} in Apple Maps`}
            >
              Apple Maps
            </Link>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              aria-label={`Get directions to ${destination} in Google Maps`}
            >
              Google Maps
            </Link>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
