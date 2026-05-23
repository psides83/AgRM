import { Button, Grid, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { fontFamilies } from 'config';
import { kebabCase } from 'lib/utils';
import { useSettingsContext } from 'providers/SettingsProvider';
import IconifyIcon from 'components/base/IconifyIcon';

const FontFamilyPanel = () => {
  const {
    config: { fontFamily },
    setConfig,
  } = useSettingsContext();

  const handleChange = (newValue) => setConfig({ fontFamily: newValue });

  return (
    <Grid container spacing={1}>
      {fontFamilies.map((font) => (
        <Grid key={kebabCase(font)} size={6}>
          <FontFamilyItem
            active={fontFamily === font}
            fontFamily={font}
            onClick={() => handleChange(font)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default FontFamilyPanel;

const FontFamilyItem = ({ active, fontFamily, sx, ...props }) => {
  return (
    <FontButton
      {...props}
      sx={{
        ...sx,
        bgcolor: ({ vars }) =>
          active ? vars.palette.primary.lighter : vars.palette.background.elevation1,
      }}
      fontFamily={fontFamily}
    >
      {active && <TickIcon icon="material-symbols:check-circle-rounded" />}
      <IconifyIcon
        icon="material-symbols:match-case-rounded"
        sx={{ fontSize: 32, color: active ? 'primary.main' : 'text.secondary' }}
      />
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: active ? 500 : 400,
          fontFamily,
          color: active ? 'primary.main' : 'text.secondary',
          lineClamp: 2,
        }}
      >
        {fontFamily.split(',')[0].replaceAll("'", '')}
      </Typography>
    </FontButton>
  );
};

const FontButton = styled((props) => <Button color="neutral" fullWidth {...props} />)(
  ({ theme, fontFamily }) => ({
    padding: theme.spacing(1),
    paddingTop: theme.spacing(1.5),
    gap: theme.spacing(1),
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    borderRadius: Number(theme.shape.borderRadius) * 2,
    position: 'relative',
    fontFamily: fontFamily,
  }),
);

const TickIcon = styled(IconifyIcon)(({ theme }) => ({
  color: theme.vars.palette.primary.main,
  fontSize: 20,
  position: 'absolute',
  top: 4,
  left: 4,
}));
