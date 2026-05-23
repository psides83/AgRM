'use client';

import { Box, Link, ListItem, ListItemText, Typography, listItemClasses } from '@mui/material';
import AnchorLinkContainer from 'components/base/AnchorLinkContainer';
import Code from 'components/base/Code';
import CodeBlock from 'components/common/CodeBlock';
import DocNestedSection from 'components/docs/DocNestedSection';
import DocPageLayout from 'components/docs/DocPageLayout';
import DocSection, { DocList, DocSubtitle } from 'components/docs/DocSection';
import ThemePresetList from './components/ThemePresetList';

const Theming = () => {
  return (
    <DocPageLayout
      pageHeaderProps={{
        title: 'Theming',
        descriptionEl: (
          <Typography sx={{ color: 'text.secondary' }}>
            AgRM's theming is built by following the official MUI theme{' '}
            <Link href="https://mui.com/material-ui/customization/theming/" target="_blank">
              customization
            </Link>{' '}
            guidelines. The theme is tailored using custom settings, with additional configurations
            carefully crafted to align with AgRM's design principles.
          </Typography>
        ),
      }}
    >
      <DocSection title="AgRM Theme Configuration">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          AgRM's theme is built on the Mui default theme. The theme configuration variables are
          centralized in the <Code>src/theme</Code> directory, where various aspects like color
          palettes, typography, shadows, and global styles are organized. The theme structure is
          organized as follows:
        </Typography>
        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/colors/base.js</Code> - Base color definitions (grey, blue, purple,
              etc.)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/colors/</Code> - Preset theme color definitions (luxury, retro,
              arctic, nature, ember, dracula, midnight)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/palettes/</Code> - Palette configurations for all themes
              (light.js/dark.js for default, luxury.js, retro.js, arctic.js, nature.js, ember.js,
              dracula.js, midnight.js)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/palettes/index.js</Code> - Exports lightPalettes and darkPalettes
              mappings
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/primaryColorOverride.js</Code> - Primary color override system and
              predefined color groups
            </ListItemText>
          </ListItem>
        </DocList>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          The main theme is generated in <Code>src/theme/theme.js</Code>, taking advantage of modern{' '}
          <Link
            href="https://mui.com/material-ui/customization/css-theme-variables/overview/"
            target="_blank"
          >
            CSS variable
          </Link>{' '}
          features.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          The custom theme is injected into the MUI theme through the <Code>ThemeProvider</Code>{' '}
          located in <Code>src/providers/ThemeProvider.jsx</Code>. The entire app is wrapped by this
          <Code>ThemeProvider</Code> in <Code>src/app/layout.jsx</Code>. Within the{' '}
          <Code>ThemeProvider</Code>, RTL support, theme storage key configuration etc. are
          configured, ensuring that the app's visual style adapts according to user preferences and
          settings.
        </Typography>
      </DocSection>
      <DocSection title="CSS Variable Upgrade Guide">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          AgRM now uses <strong>CSS variables</strong> for all core theme tokens, including colors
          and shadows.This modern approach enables:
        </Typography>

        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <ListItemText disableTypography>
              Instant theme switching without page reload
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              Clear visualization of theme tokens in browser dev tools
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              Enhanced dark mode support with no SSR flickering
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              Flexibility for multiple color schemes beyond light/dark
            </ListItemText>
          </ListItem>
        </DocList>

        <DocSubtitle>Color and Shadow Access</DocSubtitle>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Use the new <Code>theme.vars</Code> path to access CSS variable-compliant tokens.
        </Typography>
        <CodeBlock
          code={`// 🔴 Old
color: theme.palette.common.white;

// 🟢 New
color: theme.vars.palette.common.white;

// 🔴 Old
boxShadow: theme.shadows[2];

// 🟢 New
boxShadow: theme.vars.shadows[2];`}
        />

        <DocSubtitle>Alpha Transparency with CSS Variables</DocSubtitle>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Replace the <Code>alpha()</Code> utility with <Code>cssVarRgba()</Code>. Use theme color
          channels to apply alpha transparency while preserving full CSS variable compatibility.
        </Typography>
        <CodeBlock
          code={`// 🔴 Old
import { alpha } from '@mui/material/styles';
alpha(theme.palette.text.primary, 0.2);

// 🟢 New
import { cssVarRgba } from 'lib/utils';
cssVarRgba(theme.vars.palette.text.primaryChannel, 0.2);`}
        />
        <DocSubtitle>The useThemeMode Hook</DocSubtitle>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          The <Code>useThemeMode()</Code> hook provides a simple way to manage theme mode (light or
          dark) and theme presets. It builds on MUI's <Code>useColorScheme()</Code> and provides
          access to the current mode, preset, and functions for switching themes.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          The hook returns <Code>mode</Code> (current mode: 'light' or 'dark'), <Code>isDark</Code>{' '}
          (boolean indicating if dark mode is active), <Code>themePreset</Code> (current preset
          name), <Code>setThemeMode</Code> (function to toggle or set light/dark mode),{' '}
          <Code>setThemePreset</Code> (function to switch to a specific preset), and{' '}
          <Code>resetTheme</Code> (function to reset to default).
        </Typography>
        <CodeBlock
          code={`import { useThemeMode } from 'hooks/useThemeMode';

const MyComponent = () => {
  const { 
    mode,           // Current mode: 'light' | 'dark'
    isDark,         // Boolean: true if dark mode is active
    themePreset,    // Current preset: 'default-light' | 'default-dark' | 'luxury' | 'retro' | etc.
    setThemeMode,   // Function to toggle or set mode: setThemeMode('light' | 'dark') or setThemeMode() to toggle
    setThemePreset, // Function to change preset: setThemePreset('luxury')
    resetTheme      // Function to reset to default light theme
  } = useThemeMode();

  return (
    <Box>
      <Typography>Dark Mode: {isDark ? 'Active' : 'Inactive'}</Typography>
      <Button onClick={() => setThemeMode()}>Toggle Theme</Button>
      <Button onClick={() => setThemeMode('dark')}>Dark Mode</Button>
      <Button onClick={() => setThemePreset('luxury')}>Luxury Theme</Button>
    </Box>
  );
};`}
        />

        <DocSubtitle>Dark Mode Styling</DocSubtitle>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Use <Code>theme.applyStyles('dark', ...)</Code> to target dark mode overrides directly in
          your style functions.
        </Typography>
        <CodeBlock
          code={`// 🔴 Old
<Box
  sx={(theme) => ({
    color: theme.palette.mode === 'light'
      ? theme.palette.primary.main
      : theme.palette.primary.light,
    backgroundColor: theme.palette.mode === 'light'
      ? theme.palette.background.paper
      : theme.palette.background.default,
  })}
/>

// 🟢 New
<Box
  sx={(theme) => ({
    color: theme.vars.palette.primary.main,
    backgroundColor: theme.vars.palette.background.paper,
    ...theme.applyStyles('dark', {
      color: theme.vars.palette.primary.light,
      backgroundColor: theme.vars.palette.background.default,
    }),
  })}
/>`}
        />

        <DocSubtitle>Related Documentation</DocSubtitle>
        <DocList sx={{ color: 'text.secondary' }}>
          <ListItem>
            <DocSubtitle component="span" sx={{ color: 'text.primary' }}>
              Basic Usage:{' '}
            </DocSubtitle>
            <Link
              href="https://mui.com/material-ui/customization/css-theme-variables/usage/"
              target="_blank"
              rel="noopener"
            >
              Getting Started with CSS Variables
            </Link>
          </ListItem>
          <ListItem>
            <DocSubtitle component="span" sx={{ color: 'text.primary' }}>
              Configuration:{' '}
            </DocSubtitle>
            <Link
              href="https://mui.com/material-ui/customization/css-theme-variables/configuration/"
              target="_blank"
              rel="noopener"
            >
              Configuration: Theming with CSS Variables
            </Link>
          </ListItem>
          <ListItem>
            <DocSubtitle component="span" sx={{ color: 'text.primary' }}>
              Migration Guide:{' '}
            </DocSubtitle>
            <Link
              href="https://mui.com/material-ui/migration/upgrade-to-v7/#theme-behavior-changes"
              target="_blank"
              rel="noopener"
            >
              CSS Variables & Dark Mode
            </Link>
          </ListItem>
        </DocList>
      </DocSection>
      <DocSection title="Color Palette">
        <Typography
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          To create a visually appealing interface, AgRM uses custom colors instead of default Mui
          colors. Base color definitions are stored in <Code>src/theme/colors/base.js</Code>. Preset
          theme colors (luxury, retro, arctic, nature, ember, dracula, midnight) are organized in{' '}
          <Code>src/theme/colors/</Code> (e.g., <Code>luxury.js</Code>, <Code>retro.js</Code>,{' '}
          <Code>ember.js</Code>, <Code>dracula.js</Code>, <Code>midnight.js</Code>). These colors
          are then used to create separate light and dark theme <Code>palette</Code> definitions in{' '}
          <Code>src/theme/palettes/</Code>, which extend the default MUI palette with additional
          customization.
        </Typography>
        <DocSubtitle sx={{ mb: 2 }}>Additional Theme Palette Customizations</DocSubtitle>
        <Typography
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          AgRM extends the default MUI theme palette with several additional options to better
          align with its design needs. Below are the key customizations:
        </Typography>{' '}
        <DocList
          sx={{
            listStyleType: 'decimal',
            [`& .${listItemClasses.root}`]: {
              py: 1,
            },
          }}
        >
          <ListItem>
            <DocSubtitle>Neutral Palette</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <Typography>
                  A new neutral color option is added alongside the default <Code>primary</Code>,
                  <Code>secondary</Code>, <Code>error</Code>, <Code>warning</Code>,{' '}
                  <Code>info</Code>, and <Code>success</Code> palettes. This can be used for
                  elements that require a more subdued color tone.
                </Typography>
              </ListItem>
            </DocList>
          </ListItem>
          <ListItem>
            <DocSubtitle>Additional Color Palettes</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <Typography>
                  Like the default <Code>grey</Code> palette, additional chart color palettes have
                  been added: <Code>chGrey</Code>, <Code>chRed</Code>, <Code>chBlue</Code>,{' '}
                  <Code>chGreen</Code>, <Code>chOrange</Code>, <Code>chLightBlue</Code>, and{' '}
                  <Code>chPurple</Code>. These palettes are introduced primarily for use in charts
                  but can be applied anywhere in the UI.
                </Typography>
              </ListItem>
            </DocList>
          </ListItem>
          <ListItem>
            <DocSubtitle>Extended Color Shades</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <Typography>
                  Two additional color options, <Code>lighter</Code> and <Code>darker</Code>, are
                  introduced for each palette color. These are added alongside the default{' '}
                  <Code>main</Code>, <Code>light</Code>, <Code>dark</Code>, and{' '}
                  <Code>contrastText</Code> shades, providing more flexibility in color application.
                </Typography>
              </ListItem>
            </DocList>
          </ListItem>
          <ListItem>
            <DocSubtitle>Background Palette Enhancements</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <ListItemText disableTypography>
                  The background palette is extended with several new options:
                </ListItemText>
                <DocList sx={{ py: 0 }}>
                  <ListItem>
                    <ListItemText sx={{ py: '0 !important' }} disableTypography>
                      elevation1, elevation2, elevation3, elevation4
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemText sx={{ py: '0 !important' }} disableTypography>
                      menu, menuElevation1, menuElevation2
                    </ListItemText>
                  </ListItem>
                </DocList>
              </ListItem>
            </DocList>
            <Typography sx={{ color: 'text.secondary' }}>
              These can be used to create nuanced background effects and improve visual depth in the
              UI.
            </Typography>
          </ListItem>
          <ListItem>
            <DocSubtitle>Custom Divider Colors</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <ListItemText disableTypography>
                  Additional divider options are added: <Code>dividerLight</Code> provides an
                  alternative lighter divider color, and <Code>menuDivider</Code> offers a
                  specialized divider color for menu components. These can be useful in various
                  design contexts.
                </ListItemText>
              </ListItem>
            </DocList>
          </ListItem>
          <ListItem>
            <DocSubtitle>Vibrant Palette</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <Typography>
                  A new <Code>vibrant</Code> palette is added with hover effects and text
                  variations: <Code>listItemHover</Code>, <Code>buttonHover</Code>,{' '}
                  <Code>textFieldHover</Code>, <Code>text.secondary</Code>,{' '}
                  <Code>text.disabled</Code>, and <Code>overlay</Code>. These provide consistent
                  hover states and text opacity across the UI.
                </Typography>
              </ListItem>
            </DocList>
          </ListItem>
          <ListItem>
            <DocSubtitle>Common Palette</DocSubtitle>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <Typography>
                  A <Code>common</Code> palette is added with <Code>white</Code> and{' '}
                  <Code>black</Code> color definitions, along with their corresponding channel
                  values (<Code>whiteChannel</Code>, <Code>blackChannel</Code>) for use with CSS
                  variables and alpha transparency.
                </Typography>
              </ListItem>
            </DocList>
          </ListItem>
        </DocList>
      </DocSection>
      <DocSection title="Theme Presets">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          AgRM supports multiple theme presets beyond the default light/dark setup. Preset themes
          are full color systems with their own fixed modes, providing distinct visual identities.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Available presets include <Code>luxury</Code>, <Code>retro</Code>, <Code>arctic</Code>,{' '}
          <Code>nature</Code> (light presets), and <Code>ember</Code>, <Code>dracula</Code>,{' '}
          <Code>midnight</Code> (dark presets). Click on any theme card below to switch to that
          theme and see it in action:
        </Typography>
        <Box sx={{ mb: 4 }}>
          <ThemePresetList />
        </Box>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>Each preset requires:</Typography>
        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <ListItemText disableTypography>
              Color definitions in <Code>src/theme/colors/</Code> (e.g., <Code>luxury.js</Code>)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              Palette configuration in <Code>src/theme/palettes/</Code> (e.g.,{' '}
              <Code>luxury.js</Code>)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              Type definition in <Code>src/config.js</Code> (added to <Code>ThemePreset</Code> type)
            </ListItemText>
          </ListItem>
        </DocList>
        <DocList
          sx={{
            px: 0,
            listStyleType: 'decimal',
            [`& .${listItemClasses.root}`]: {
              display: 'block',
              py: 1,
            },
          }}
        >
          <DocNestedSection
            component={ListItem}
            id="create-custom-preset"
            title="Create custom preset"
            titleEl={
              <AnchorLinkContainer hashHref="create-custom-preset" anchorSize="small">
                <DocSubtitle sx={{ fontSize: 'h6.fontSize' }}>Create a Custom Preset</DocSubtitle>
              </AnchorLinkContainer>
            }
          >
            <Typography sx={{ color: 'text.secondary', mb: 1 }}>
              Below is a clear step-by-step guide using “Ocean” as the example template.
            </Typography>
            <DocList sx={{ color: 'text.secondary' }}>
              <ListItem>
                <Typography sx={{ mb: 1 }}>
                  <strong>Step 1: Add Preset Name to Type</strong>
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Update the <Code>ThemePreset</Code> type in <Code>src/config.js</Code> to include
                  your new preset name.
                </Typography>
                <CodeBlock
                  code={`// src/config.js
export type ThemePreset =
  | 'default-light'
  | 'default-dark'
  | 'luxury'
  | 'retro'
  | 'arctic'
  | 'nature'
  | 'ember'
  | 'dracula'
  | 'midnight'
  | 'ocean';  // Add your new preset`}
                />
              </ListItem>
              <ListItem>
                <Typography sx={{ mb: 1 }}>
                  <strong>Step 2: Create Color Definitions</strong>
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Create <Code>src/theme/colors/ocean.js</Code> and define 50–950 shade scales for
                  all semantic colors (primary, secondary, neutral, error, warning, success, info).
                  Follow the pattern from existing presets like <Code>luxury.js</Code>.
                </Typography>
                <CodeBlock
                  code={`// src/theme/colors/ocean.js
export const oceanPrimary = {
  50: '#E0F2FE',
  100: '#BAE6FD',
  200: '#7DD3FC',
  300: '#38BDF8',
  400: '#0EA5E9',
  500: '#0284C7',  // Main color
  600: '#0369A1',
  700: '#075985',
  800: '#0C4A6E',
  900: '#082F49',
  950: '#0C1D2E',
};

export const oceanSecondary = {
  50: '#E0F7FA',
  100: '#B3EBF2',
  // ... continue for all shades
  950: '#0A1F26',
};

// Repeat for: oceanNeutral, oceanError, oceanWarning, oceanSuccess, oceanInfo`}
                />
              </ListItem>
              <ListItem>
                <Typography sx={{ mb: 1 }}>
                  <strong>Step 3: Create Palette Configuration</strong>
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Create <Code>src/theme/palettes/ocean.js</Code>. Use{' '}
                  <Code>generatePaletteChannel()</Code> to create palette tokens. Export both the
                  palette and main colors. For light presets, use lighter shades for lighter
                  variants; for dark presets, use darker shades.
                </Typography>
                <CodeBlock
                  code={`// src/theme/palettes/ocean.js
import { PaletteOptions } from '@mui/material/styles';
import { generatePaletteChannel } from 'lib/utils';
import { basic } from '../colors/base';
import {
  oceanPrimary,
  oceanSecondary,
  oceanNeutral,
  oceanError,
  oceanWarning,
  oceanSuccess,
  oceanInfo,
} from '../colors/ocean';

// Export main colors (used for color picker display)
export const oceanPaletteMainColors = {
  primary: oceanPrimary[500],
  secondary: oceanSecondary[500],
  error: oceanError[500],
  warning: oceanWarning[500],
  success: oceanSuccess[500],
  neutral: oceanNeutral[800],
  paper: '#F0F9FF',  // Light background color
} as const;

const common = generatePaletteChannel({ white: basic.white, black: basic.black });
const grey = generatePaletteChannel(oceanNeutral);

// Generate palette channels for each color
const primary = generatePaletteChannel({
  lighter: oceanPrimary[50],
  light: oceanPrimary[400],
  main: oceanPrimary[500],
  dark: oceanPrimary[600],
  darker: oceanPrimary[900],
  contrastText: oceanSecondary[50],
});

const secondary = generatePaletteChannel({
  lighter: oceanSecondary[50],
  light: oceanSecondary[300],
  main: oceanSecondary[500],
  dark: oceanSecondary[700],
  darker: oceanSecondary[900],
  contrastText: oceanSecondary[50],
});

// ... repeat for error, warning, success, info

export const oceanPalette: PaletteOptions = {
  // ... complete palette configuration
  primary,
  secondary,
  // ... other colors
};`}
                />
              </ListItem>
              <ListItem>
                <Typography sx={{ mb: 1 }}>
                  <strong>Step 4: Register in Palettes Index</strong>
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Import and add your preset to <Code>lightPalettes</Code> or{' '}
                  <Code>darkPalettes</Code> in <Code>src/theme/palettes/index.js</Code>.
                </Typography>
                <CodeBlock
                  code={`// src/theme/palettes/index.js
import { oceanPalette } from './ocean';

// For light presets, add to lightPalettes:
export const lightPalettes: Partial<Record<ThemePreset, PaletteOptions>> = {
  'default-light': lightPalette,
  luxury: luxuryPalette,
  retro: retroPalette,
  arctic: arcticPalette,
  nature: naturePalette,
  ocean: oceanPalette,  // Add your preset here
};

// For dark presets, add to darkPalettes:
export const darkPalettes: Partial<Record<ThemePreset, PaletteOptions>> = {
  'default-dark': darkPalette,
  ember: emberPalette,
  dracula: draculaPalette,
  midnight: midnightPalette,
  // ocean would go here if it were a dark preset
};`}
                />
              </ListItem>
              <ListItem>
                <Typography sx={{ mb: 1 }}>
                  <strong>Step 5: Add to Primary Color Override (Optional)</strong>
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  If you want the preset's primary color to be available in the color picker, add it
                  to <Code>COLOR_GROUPS</Code> in <Code>src/theme/primaryColorOverride.js</Code>.
                </Typography>
                <CodeBlock
                  code={`// src/theme/primaryColorOverride.js
import { oceanPrimary } from './colors/ocean';

export const COLOR_GROUPS: ColorGroup[] = [
  // ... existing colors
  { key: 'ocean', main: oceanPrimary[500], palette: oceanPrimary },
];`}
                />
              </ListItem>
            </DocList>
          </DocNestedSection>

          <DocNestedSection
            component={ListItem}
            id="remove-presets"
            title="Remove presets"
            titleEl={
              <AnchorLinkContainer hashHref="remove-presets" anchorSize="small">
                <DocSubtitle>Remove Presets</DocSubtitle>
              </AnchorLinkContainer>
            }
          >
            <Typography sx={{ color: 'text.secondary', mb: 1 }}>
              To remove a preset, simply use this checklist:
            </Typography>

            <DocList sx={{ color: 'text.secondary', listStyleType: 'disc', ml: 2.5 }}>
              <ListItem>
                <Typography>
                  Remove the preset name from <Code>ThemePreset</Code> type in{' '}
                  <Code>src/config.js</Code>.
                </Typography>
              </ListItem>

              <ListItem>
                <Typography>
                  Delete its color file from <Code>src/theme/colors/</Code> (e.g.,{' '}
                  <Code>ocean.js</Code>).
                </Typography>
              </ListItem>

              <ListItem>
                <Typography>
                  Delete its palette file from <Code>src/theme/palettes/</Code> (e.g.,{' '}
                  <Code>ocean.js</Code>).
                </Typography>
              </ListItem>

              <ListItem>
                <Typography>
                  Remove its entry from <Code>src/theme/palettes/index.js</Code> (remove from{' '}
                  <Code>lightPalettes</Code> or <Code>darkPalettes</Code> and remove the import).
                </Typography>
              </ListItem>

              <ListItem>
                <Typography>
                  Remove from <Code>COLOR_GROUPS</Code> in{' '}
                  <Code>src/theme/primaryColorOverride.js</Code> if it was added there.
                </Typography>
              </ListItem>

              <ListItem>
                <Typography>
                  Search and remove any remaining imports or references across the project.
                </Typography>
              </ListItem>
            </DocList>
          </DocNestedSection>
        </DocList>
      </DocSection>

      <DocSection title="Dynamic Primary Color Override">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          AgRM supports dynamic primary color override, allowing users to change the primary color
          without switching entire themes. This feature is integrated into the theme system and can
          be used via the settings panel or programmatically.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          The primary color override system is defined in{' '}
          <Code>src/theme/primaryColorOverride.js</Code>. Predefined colors with full shade palettes
          are defined in <Code>COLOR_GROUPS</Code>. The override is applied during theme creation in{' '}
          <Code>src/theme/theme.js</Code> via the <Code>applyPrimaryOverride()</Code> function.
        </Typography>
        <DocSubtitle>How It Works</DocSubtitle>
        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <ListItemText disableTypography>
              Predefined colors from <Code>COLOR_GROUPS</Code> use their complete shade palettes for
              consistent color application.
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              The <Code>chBlue</Code> channel palette is automatically updated to match the new
              primary color, ensuring consistency across charts and specialized components. In dark
              mode, the <Code>chBlue</Code> palette is inverted to maintain proper contrast.
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              The override is stored in the settings context and persists across sessions.
            </ListItemText>
          </ListItem>
        </DocList>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          To set a primary color override programmatically, dispatch <Code>SET_PRIMARY_COLOR</Code>{' '}
          action with a hex color string from <Code>COLOR_GROUPS</Code>, or <Code>null</Code> to
          reset to the theme default.
        </Typography>
        <CodeBlock
          code={`import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_PRIMARY_COLOR } from 'reducers/SettingsReducer';
import { COLOR_GROUPS } from 'theme/primaryColorOverride';

const MyComponent = () => {
  const { configDispatch } = useSettingsContext();
  
  const handleColorChange = (colorKey) => {
    const colorGroup = COLOR_GROUPS.find(group => group.key === colorKey);
    if (colorGroup) {
      configDispatch({ 
        type: SET_PRIMARY_COLOR, 
        payload: colorGroup.main 
      });
    }
  };
  
  const resetColor = () => {
    configDispatch({ 
      type: SET_PRIMARY_COLOR, 
      payload: null 
    });
  };
  
  return (
    <Box>
      <Button onClick={() => handleColorChange('luxury')}>
        Use Luxury Primary
      </Button>
      <Button onClick={resetColor}>Reset to Default</Button>
    </Box>
  );
};`}
        />
        <DocSubtitle>Adding a Custom Primary Color</DocSubtitle>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          To add a custom primary color, create a new color palette and add it to{' '}
          <Code>COLOR_GROUPS</Code> in <Code>src/theme/primaryColorOverride.js</Code>:
        </Typography>
        <CodeBlock
          code={`// src/theme/colors/base.js (or create a new file)
export const lime = {
  50: '#F4FCE3',
  100: '#E9FAC8',
  200: '#D8F5A2',
  300: '#C0EB75',
  400: '#A9E34B',
  500: '#94D82D',  // Main color
  600: '#82C91E',
  700: '#74B816',
  800: '#66A80F',
  900: '#5C940D',
  950: '#2E4A06',
};

// src/theme/primaryColorOverride.js
import { lime } from './colors/base';

export const COLOR_GROUPS: ColorGroup[] = [
  // ... existing colors
  { 
    key: 'lime',           // Unique identifier
    main: lime[500],        // Main color (hex string)
    palette: lime,          // Full shade palette (50-950) - required
  },
];`}
        />
        <Typography sx={{ color: 'text.secondary', mt: 2, mb: 2 }}>
          The <Code>palette</Code> property is required and must contain shade values from 50 to
          950. Once added to <Code>COLOR_GROUPS</Code>, the color will be available in the color
          picker UI.
        </Typography>
      </DocSection>

      <DocSection title="Starter Apps - Add a Theme Preset">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Starters use the same theme structure as the full app, with light/dark mode only. To add a
          new preset (for example 'luxury'), follow the steps below.
        </Typography>
        <Typography
          component="span"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
        >
          1. Extend ThemePreset in config
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
          Add the preset name to <Code>ThemePreset</Code> in <Code>src/config.js</Code>.
        </Typography>
        <CodeBlock
          code={`// src/config.js
export type ThemePreset = 'default-light' | 'default-dark' | 'luxury';`}
        />
        <Typography
          component="span"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, mt: 2 }}
        >
          2. Create color and palette files
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
          Add <Code>src/theme/colors/&lt;name&gt;.js</Code> with color tokens (e.g. primary,
          secondary, neutral, error, success, warning, info; each with 50–950 shades). Then add{' '}
          <Code>src/theme/palettes/&lt;name&gt;.js</Code> using the same structure and keys as your
          existing <Code>light.js</Code> or <Code>dark.js</Code>.
        </Typography>
        <Typography
          component="span"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, mt: 2 }}
        >
          3. Register in palettes index
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
          In <Code>src/theme/palettes/index.js</Code>, add the preset to <Code>lightPalettes</Code>{' '}
          or <Code>darkPalettes</Code> and add a label to <Code>THEME_DISPLAY_NAMES</Code>.
        </Typography>
        <CodeBlock
          code={`// src/theme/palettes/index.js
import { luxuryPalette } from './luxury';

export const THEME_DISPLAY_NAMES: Partial<Record<ThemePreset, string>> = {
  'default-light': 'Light',
  'default-dark': 'Dark',
  luxury: 'Luxury',
};

export const lightPalettes: Partial<Record<ThemePreset, PaletteOptions>> = {
  'default-light': lightPalette,
  luxury: luxuryPalette,
};

// In the settings panel, render presets from Object.keys(lightPalettes) / Object.keys(darkPalettes)
// and call setThemePreset(preset).`}
        />
        <Typography sx={{ color: 'text.secondary', mt: 2, mb: 2 }}>
          The new preset is then available to <Code>createTheme</Code> via <Code>preset</Code>. Add
          controls in your settings panel that call <Code>setThemePreset(preset)</Code> for each
          preset. If a preset exists in <Code>lightPalettes</Code> (or in <Code>darkPalettes</Code>
          ), selecting it will switch the app to that mode.
        </Typography>

        <DocSubtitle>Key Files to Reference</DocSubtitle>
        <DocList sx={{ color: 'text.secondary' }}>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/colors/</Code>, <Code>src/theme/palettes/</Code> - Color tokens and
              palette structure; use existing light/dark palette files as the pattern
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/theme/theme.js</Code> - createTheme (starters use light/dark only; full app
              may add primaryColor override)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <Code>src/providers/ThemeProvider.jsx</Code>, <Code>src/hooks/useThemeMode.jsx</Code>{' '}
              - Theme creation and setThemePreset
            </ListItemText>
          </ListItem>
        </DocList>
      </DocSection>

      <DocSection title="Light/Dark Mode Only">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          AgRM's theme system supports light and dark modes by default. Custom presets and primary
          color overrides are optional features that can be removed for a simpler setup.
        </Typography>
        <DocSubtitle>Removing Custom Presets</DocSubtitle>
        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <Typography>
              <strong>1. Remove custom preset imports</strong> - In{' '}
              <Code>src/theme/palettes/index.js</Code>, remove custom preset imports and
              registrations:
            </Typography>
            <CodeBlock
              code={`// src/theme/palettes/index.js
import { darkPalette, lightPalette } from './base';

export const lightPalettes: Partial<Record<ThemePreset, PaletteOptions>> = {
  'default-light': lightPalette,
};

export const darkPalettes: Partial<Record<ThemePreset, PaletteOptions>> = {
  'default-dark': darkPalette,
};`}
            />
          </ListItem>
          <ListItem>
            <Typography>
              <strong>2. Remove custom preset UI</strong> - In{' '}
              <Code>src/components/settings-panel/theme-preset/ThemeList.jsx</Code>, remove custom
              themes rendering.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <strong>3. Remove from ThemePresetList</strong> - In{' '}
              <Code>src/docs/documentation/components/ThemePresetList.jsx</Code>, remove custom
              preset imports, display names, and UI rendering.
            </Typography>
          </ListItem>
        </DocList>
        <DocSubtitle>Removing Primary Color Override</DocSubtitle>
        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <Typography>
              <strong>1. Remove from theme creation</strong> - In <Code>src/theme/theme.js</Code>,
              remove <Code>applyPrimaryOverride</Code> import and calls:
            </Typography>
            <CodeBlock
              code={`// src/theme/theme.js
// Remove: import { applyPrimaryOverride } from './primaryColorOverride';

colorSchemes: {
  light: {
    palette: lightPalettes[preset] ?? lightPalettes['default-light'],
    // Remove: applyPrimaryOverride(...)
  },
  dark: {
    palette: darkPalettes[preset] ?? darkPalettes['default-dark'],
    // Remove: applyPrimaryOverride(...)
  },
}`}
            />
          </ListItem>
          <ListItem>
            <Typography>
              <strong>2. Remove from ThemeProvider</strong> - In{' '}
              <Code>src/providers/ThemeProvider.jsx</Code>, remove <Code>primaryColor</Code> from
              theme creation and dependencies.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <strong>3. Remove UI component</strong> - In{' '}
              <Code>src/components/settings-panel/theme-preset/ThemeList.jsx</Code>, remove{' '}
              <Code>PrimaryColorPicker</Code> component.
            </Typography>
          </ListItem>
        </DocList>
      </DocSection>

      <DocSection title="Vision Mode (Accessibility)">
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          AgRM includes a comprehensive vision mode system to improve accessibility for users with
          color vision deficiencies. The <Code>VisionModeProvider</Code> in{' '}
          <Code>src/providers/VisionModeProvider.jsx</Code> applies CSS filters to simulate various
          types of color blindness, allowing developers and users to preview how the interface
          appears to users with different vision conditions.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          Vision modes are applied globally via SVG filters injected into the document. The provider
          manages the active vision mode state and applies it through a <Code>data-vision</Code>{' '}
          attribute on the document root element.
        </Typography>
        <DocSubtitle>Available Vision Modes</DocSubtitle>
        <DocList sx={{ mb: 2 }}>
          <ListItem>
            <ListItemText disableTypography>
              <strong>Normal</strong> - Shows all colors normally (no filter applied)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <strong>Protanopia</strong> - Difficulty seeing red shades (red-green color blindness,
              red-deficient)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <strong>Deuteranopia</strong> - Difficulty seeing green shades (red-green color
              blindness, green-deficient)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <strong>Tritanopia</strong> - Difficulty seeing blue shades (blue-yellow color
              blindness)
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText disableTypography>
              <strong>Achromatopsia</strong> - Complete color blindness (shows only black and white)
            </ListItemText>
          </ListItem>
        </DocList>
        <DocSubtitle>Using Vision Mode</DocSubtitle>
        <CodeBlock
          code={`import { useVisionMode, VisionMode } from 'providers/VisionModeProvider';

const VisionModeSwitcher = () => {
  const { mode, setMode } = useVisionMode();

  return (
    <Box>
      <Typography>Current Vision Mode: {mode}</Typography>
      <Button onClick={() => setMode('normal')}>Normal</Button>
      <Button onClick={() => setMode('protanopia')}>Protanopia</Button>
      <Button onClick={() => setMode('deuteranopia')}>Deuteranopia</Button>
      <Button onClick={() => setMode('tritanopia')}>Tritanopia</Button>
      <Button onClick={() => setMode('achromatopsia')}>Achromatopsia</Button>
    </Box>
  );
};`}
        />
        <Typography sx={{ color: 'text.secondary', mt: 2 }}>
          The vision mode is persisted in local storage and automatically applied when the app
          loads. The <Code>VisionModePanel</Code> component in{' '}
          <Code>src/components/settings-panel/VisionModePanel.jsx</Code> provides a user-friendly
          interface for selecting vision modes in the settings panel.
        </Typography>
      </DocSection>

      <DocSection title="Component Customization">
        <Typography
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          In AgRM, component customization follows the MUI{' '}
          <Link href="https://mui.com/material-ui/customization/theme-components/" target="_blank">
            Global Theme Overrides
          </Link>{' '}
          approach. All overridden components are located in the <Code>src/theme/components</Code>{' '}
          folder. These components are imported and used to create the <Code>theme</Code>, along
          with other theme customization properties, in <Code>src/theme/theme.js</Code>.
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          To customize or add additional functionality, modify or add files within the{' '}
          <Code>components</Code>
          folder and ensure that these changes are incorporated into the <Code>theme.js</Code> file.
          This approach centralizes component customization, making it easier to manage and extend
          the theme.
        </Typography>
      </DocSection>
      <DocSection title="Custom Styles and Third-Party Library Customization">
        <Typography
          sx={{
            color: 'text.secondary',
            mb: 2,
          }}
        >
          For custom styles, CSS rules, third-party library style customizations, and keyframe
          animations, all <Code>JSS (JavaScript Style Sheets)</Code> styles are inside the
          <Code>src/theme/styles</Code> folder. These styles are then imported into
          <Code>src/theme/components/CssBaseline.jsx</Code> and applied using MUI's{' '}
          <Code>styleOverrides</Code>.
        </Typography>
        <DocSubtitle>Example Usage:</DocSubtitle>
        <CodeBlock
          sx={{ mb: 0 }}
          code={`//src/theme/styles/simplebar.js
import 'simplebar-react/dist/simplebar.min.css';

const simplebar = (theme) => ({
  '& .simplebar-track': {
    '&.simplebar-vertical': {
      '& .simplebar-scrollbar': {
        '&:before': {
          backgroundColor: theme.vars.palette.background.elevation4,
        },
        ...
      },
    },
  },
});
export default simplebar;

//src/theme/components/CssBaseline.jsx
const CssBaseline = {
  defaultProps: {},
  styleOverrides: (theme) => ({
   // other custom styles
    ...simplebar(theme),
  }),
};`}
        />
      </DocSection>
    </DocPageLayout>
  );
};

export default Theming;
