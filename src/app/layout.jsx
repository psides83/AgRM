import { getServerSession } from 'next-auth';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { authOptions } from 'lib/next-auth/nextAuthOptions';
import 'locales/i18n';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import LocalizationProvider from 'providers/LocalizationProvider';
import NotistackProvider from 'providers/NotistackProvider';
import { SessionProvider } from 'providers/SessionProvider';
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
  const session = await getServerSession(authOptions);

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${plusJakartaSans.className} ${splineSansMono.className}`}
    >
      <body>
        <InitColorSchemeScript attribute="data-agrm-color-scheme" modeStorageKey="agrm-mode" />
        <AppRouterCacheProvider>
          <SessionProvider session={session}>
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
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
