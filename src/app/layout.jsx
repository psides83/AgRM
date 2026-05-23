import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import 'locales/i18n';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import { AuthProvider } from 'providers/AuthProvider';
import LocalizationProvider from 'providers/LocalizationProvider';
import NotistackProvider from 'providers/NotistackProvider';
import SettingsProvider from 'providers/SettingsProvider';
import ThemeProvider from 'providers/ThemeProvider';
import VisionModeProvider from 'providers/VisionModeProvider';
import { plusJakartaSans, splineSansMono } from 'theme/typography';
import App from './App';

export const metadata = {
  title: 'AgRM',
  description: 'Ag equipment sales CRM',
  icons: [
    {
      rel: 'icon',
      url: `/favicon.ico`,
    },
  ],
};

export default async function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${plusJakartaSans.className} ${splineSansMono.className}`}
    >
      <body>
        <InitColorSchemeScript attribute="data-agrm-color-scheme" modeStorageKey="agrm-mode" />
        <AppRouterCacheProvider>
          <AuthProvider>
            <SettingsProvider>
              <LocalizationProvider>
                <ThemeProvider>
                  <VisionModeProvider>
                    <NotistackProvider>
                      <BreakpointsProvider>
                        <App>{children}</App>
                      </BreakpointsProvider>
                    </NotistackProvider>
                  </VisionModeProvider>
                </ThemeProvider>
              </LocalizationProvider>
            </SettingsProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
