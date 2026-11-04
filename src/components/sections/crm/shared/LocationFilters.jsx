import { Autocomplete, Stack, TextField } from "@mui/material";
import { locationOptions } from "./locationFilters";

export default function LocationFilters({ records, value, onChange }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
      {["city", "county"].map((field) => (
        <Autocomplete
          key={field}
          options={locationOptions(records, field)}
          value={value[field] || null}
          onChange={(_, selection) => onChange(field, selection || "")}
          sx={{ width: { xs: 1, sm: 240 } }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={field === "city" ? "City" : "County"}
              placeholder="All"
            />
          )}
        />
      ))}
    </Stack>
  );
}
