import { formControlLabelClasses, radioClasses, RadioGroup } from '@mui/material';

const SettingsPanelRadioGroup = ({ children, ...rest }) => {
  return (
    <RadioGroup
      sx={{
        flexDirection: 'row',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        [`& .${formControlLabelClasses.root}`]: {
          margin: 0,
        },
        [`& .${radioClasses.root}`]: {
          display: 'none',
        },
      }}
      {...rest}
    >
      {children}
    </RadioGroup>
  );
};

export default SettingsPanelRadioGroup;
