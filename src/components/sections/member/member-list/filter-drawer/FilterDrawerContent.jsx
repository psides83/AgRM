'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Slider,
  Stack,
  Typography,
  checkboxClasses,
  formControlLabelClasses,
  formLabelClasses,
  styled,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';

const FilterDrawerContent = ({ handleClose }) => {
  return (
    <Box
      component="aside"
      sx={{
        px: 3,
        py: 2,
      }}
    >
      <Stack sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Filter</Typography>
        <Button shape="circle" color="neutral" onClick={handleClose}>
          <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
        </Button>
      </Stack>
      <Stack direction="column" gap={1}>
        <FilterSelectField
          label="Department"
          options={[
            { label: 'All', value: 'all' },
            { label: 'Design', value: 'design' },
            { label: 'Engineering', value: 'engineering' },
            { label: 'HR', value: 'hr' },
            { label: 'Marketing', value: 'marketing' },
          ]}
        />
        <FilterSelectField
          label="Team"
          options={[
            { label: 'All', value: 0 },
            { label: 'One Go', value: 1 },
            { label: 'CodeCrafters', value: 2 },
            { label: 'Kernel Kings', value: 3 },
            { label: 'Brainy Bytes', value: 4 },
            { label: 'Pixel Thinkers', value: 5 },
          ]}
        />

        <FilterFieldset
          label="Employment"
          options={[
            { label: 'Full-Time', value: false },
            { label: 'Part-Time', value: false },
            { label: 'Intern', value: false },
            { label: 'Contractor', value: false },
          ]}
        />

        <FilterFieldset
          label="Status"
          options={[
            { label: 'Active', value: false },
            { label: 'Probation', value: false },
            { label: 'Contract', value: false },
            { label: 'Intern', value: false },
            { label: 'Resigned', value: false },
          ]}
        />

        <FilterFieldset
          label="Gender"
          options={[
            { label: 'Male', value: false },
            { label: 'Female', value: false },
            { label: 'Other', value: false },
          ]}
        />

        <FilterFieldset
          label="Religion"
          options={[
            { label: 'Islam', value: false },
            { label: 'Hinduism', value: false },
            { label: 'Christianity', value: false },
            { label: 'Buddhism', value: false },
            { label: 'Other', value: false },
          ]}
        />

        <FilterRangeField label="Pay Range" range={[10, 100]} valueText={(value) => `$${value}`} />
      </Stack>
    </Box>
  );
};
export default FilterDrawerContent;
const FilterSelectField = ({ label, options, defaultValue = options[0].value }) => {
  return (
    <StyledTextField
      select
      label={label}
      defaultValue={defaultValue}
      fullWidth
      sx={{
        [`& .${formLabelClasses.root}`]: { color: 'text.primary' },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </StyledTextField>
  );
};
const FilterFieldset = ({ label, options }) => {
  const [state, setState] = useState(
    options.reduce(
      (acc, option) => ({
        ...acc,
        [option.label]: option.value,
      }),
      {},
    ),
  );
  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };
  return (
    <FormControl component="fieldset" variant="standard" sx={{ px: 2 }}>
      <StyledFormLabel>{label}</StyledFormLabel>
      <FormGroup sx={{ pl: 2 }}>
        {Object.entries(state).map(([key, value]) => (
          <StyledFormControlLabel
            key={key}
            control={<Checkbox checked={value} onChange={handleChange} name={key} />}
            label={key}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};
const FilterRangeField = ({ label, range, valueText }) => {
  const [value, setValue] = useState(range);
  const handleChange = (_, newValue) => setValue(newValue);
  return (
    <FormControl component="fieldset" variant="standard" sx={{ px: 2 }}>
      <StyledFormLabel>{label}</StyledFormLabel>
      <FormGroup sx={{ pl: 2 }}>
        <Slider
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          valueLabelFormat={valueText}
          getAriaValueText={valueText}
        />
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ fontFamily: 'Urbanist', color: 'text.secondary' }}>
            {valueText(range[0])}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Urbanist', color: 'text.secondary' }}>
            {valueText(range[1])}
          </Typography>
        </Stack>
      </FormGroup>
    </FormControl>
  );
};
const StyledFormLabel = styled(FormLabel)(({ theme: { typography, vars, spacing } }) => ({
  fontSize: typography.caption.fontSize,
  fontWeight: 500,
  lineHeight: '14px',
  color: vars.palette.text.primary,
  paddingTop: spacing(1),
  paddingBottom: spacing(1),
}));
const StyledFormControlLabel = styled(FormControlLabel)(({ theme: { typography, spacing } }) => ({
  [`& .${formControlLabelClasses.label}`]: {
    fontSize: typography.caption.fontSize,
    alignSelf: 'center',
    marginTop: '0 !important',
  },
  [`& .${checkboxClasses.root}`]: { padding: spacing(0.875), alignSelf: 'center' },
}));
