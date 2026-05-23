import { Controller, useFormContext } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const AssignResponsibility = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <Stack direction="column" gap={2}>
      <Stack justifyContent="space-between">
        <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
          Assign Responsibility
        </Typography>
        <Controller
          control={control}
          name="assignResponsibility.mode"
          render={({ field }) => (
            <RadioGroup row sx={{ gap: 3 }} {...field}>
              <FormControlLabel
                label="Single"
                value="single"
                control={<Radio />}
                sx={{
                  mr: 0,
                }}
              />
              <FormControlLabel
                label="Bulk"
                value="bulk"
                control={<Radio />}
                sx={{
                  mr: 0,
                }}
              />
            </RadioGroup>
          )}
        />
      </Stack>
      <Grid container columnSpacing={1} rowSpacing={2}>
        <Grid size={6}>
          <TextField
            label="Department"
            fullWidth
            defaultValue="Engineering"
            select
            error={!!errors.assignResponsibility?.department}
            helperText={errors.assignResponsibility?.department?.message}
            {...register('assignResponsibility.department')}
          >
            <MenuItem value="Engineering">Engineering</MenuItem>
            <MenuItem value="Design">Design</MenuItem>
            <MenuItem value="Support">Support</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="HRM">HRM</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            label="Team"
            fullWidth
            defaultValue="AgRM"
            select
            error={!!errors.assignResponsibility?.team}
            helperText={errors.assignResponsibility?.team?.message}
            {...register('assignResponsibility.team')}
          >
            <MenuItem value="AgRM">AgRM</MenuItem>
            <MenuItem value="Falcon">Falcon</MenuItem>
            <MenuItem value="Phoenix">Phoenix</MenuItem>
            <MenuItem value="HummingBird">HummingBird</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            label="Employee job titles"
            fullWidth
            defaultValue="Frontend Developer"
            select
            error={!!errors.assignResponsibility?.jobTitle}
            helperText={errors.assignResponsibility?.jobTitle?.message}
            {...register('assignResponsibility.jobTitle')}
          >
            <MenuItem value="Frontend Developer">Frontend Developer</MenuItem>
            <MenuItem value="QA Engineer">QA Engineer</MenuItem>
            <MenuItem value="Data Analyst">Data Analyst</MenuItem>
          </TextField>
        </Grid>
        <Grid size={6}>
          <TextField
            label="Additional Employee"
            fullWidth
            error={!!errors.assignResponsibility?.additionalEmployee}
            helperText={errors.assignResponsibility?.additionalEmployee?.message}
            {...register('assignResponsibility.additionalEmployee')}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AssignResponsibility;
