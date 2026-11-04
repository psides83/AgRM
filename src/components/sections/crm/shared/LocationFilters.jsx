import { Autocomplete, Stack, TextField } from "@mui/material";
import { locationOptions } from "./locationFilterUtils";

export default function LocationFilters({ records, value, onChange }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
      {["city", "county"].map((field) => (
        <Autocomplete
          key={field}
          multiple
          disableCloseOnSelect
          filterSelectedOptions
          options={locationOptions(records, field)}
          value={value[field] || []}
          onChange={(_, selection) => onChange(field, selection)}
          sx={{ width: { xs: 1, sm: 320 } }}
          renderInput={(params) => (
            <TextField
              {...params}
              slotProps={{
                input: params.InputProps,
                htmlInput: params.inputProps,
              }}
              label={field === "city" ? "City" : "County"}
              placeholder="All"
            />
          )}
        />
      ))}
    </Stack>
  );
}
