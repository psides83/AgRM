import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { Paper } from '@mui/material';

const checkboxes = [
  { name: 'Chair', count: 65, selected: true },
  { name: 'Divan', count: 20, selected: true },
  { name: 'Sofa', count: 31, selected: false },
  { name: 'Recliner', count: 22, selected: false },
  { name: 'Sectional', count: 15, selected: false },
  { name: 'Accent', count: 8, selected: false },
];

const CheckboxesCard = () => {
  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 2,
        overflow: 'hidden',
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <FormGroup>
        {checkboxes.map((checkbox) => (
          <FormControlLabel
            key={checkbox.name}
            control={<Checkbox defaultChecked={checkbox.selected} />}
            label={`${checkbox.name} (${checkbox.count})`}
          />
        ))}
      </FormGroup>
    </Paper>
  );
};

export default CheckboxesCard;
