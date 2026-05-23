import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete, Checkbox, Typography } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';

const TOPIC_OPTIONS = [
  'Artificial Intelligence',
  'Budgeting',
  'Creativity',
  'Fitness',
  'Growth',
  'Health',
  'Innovation',
  'Marketing',
  'Technology',
  'Business',
  'Education',
  'Science',
];

const Topics = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Topics
      </Typography>

      <Controller
        name="topics"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <Autocomplete
            {...field}
            multiple
            freeSolo
            options={TOPIC_OPTIONS}
            onChange={(_, newValue) => field.onChange(newValue)}
            disableCloseOnSelect
            filterOptions={(options, params) => {
              const filtered = options.filter((option) =>
                option.toLowerCase().includes(params.inputValue.toLowerCase()),
              );

              const { inputValue } = params;
              const isExisting = options.some((option) => inputValue === option);
              if (inputValue !== '' && !isExisting) {
                filtered.push(`Add "${inputValue}"`);
              }

              return filtered;
            }}
            getOptionLabel={(option) => {
              if (option.startsWith('Add "')) {
                return option.slice(5, -1);
              }
              return option;
            }}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                placeholder="Select"
                error={!!errors.topics}
                helperText={errors.topics?.message}
              />
            )}
            renderOption={({ key, ...props }, option, { selected }) => {
              const isAddOption = option.startsWith('Add "');
              return (
                <li key={key} {...props}>
                  {!isAddOption && <Checkbox checked={selected} sx={{ mr: 1 }} />}
                  {isAddOption ? <Typography color="primary.main">{option}</Typography> : option}
                </li>
              );
            }}
          />
        )}
      />
    </div>
  );
};

export default Topics;
