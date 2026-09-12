'use client';

import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { languages } from 'locales/languages';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_LOCALE } from 'reducers/SettingsReducer';
import IconifyIcon from 'components/base/IconifyIcon';
import ThemeList from 'components/settings-panel/theme-preset/ThemeList';
import AccountTabPanelSection from '../common/AccountTabPanelSection';

const PreferencesTabPanel = () => {
  const {
    config: { locale },
    configDispatch,
  } = useSettingsContext();

  const handleLanguageChange = (language) => {
    configDispatch({
      type: SET_LOCALE,
      payload: language.locale,
    });
  };

  return (
    <Stack direction="column" divider={<Divider />} spacing={5}>
      <AccountTabPanelSection
        title="Language"
        subtitle="Choose the language and regional formatting used throughout the app."
        icon="material-symbols:translate-rounded"
      >
        <Paper variant="outlined">
          <List disablePadding>
            {languages.map((language) => {
              const selected = locale === language.locale;

              return (
                <ListItemButton
                  key={language.locale}
                  selected={selected}
                  onClick={() => handleLanguageChange(language)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <IconifyIcon icon={language.icon} sx={{ fontSize: 24 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={language.label}
                    secondary={language.locale}
                    slotProps={{
                      primary: { fontWeight: 700 },
                      secondary: { variant: 'caption' },
                    }}
                  />
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {language.currencySymbol}
                    </Typography>
                    {selected && (
                      <IconifyIcon
                        icon="material-symbols:check-circle-rounded"
                        sx={{ color: 'primary.main', fontSize: 22 }}
                      />
                    )}
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
      </AccountTabPanelSection>

      <AccountTabPanelSection
        title="Appearance"
        subtitle="Set display mode, color theme, and primary color from one place."
        icon="material-symbols:palette-outline-rounded"
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <ThemeList />
        </Paper>
      </AccountTabPanelSection>
    </Stack>
  );
};

export default PreferencesTabPanel;
