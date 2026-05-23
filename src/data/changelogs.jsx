import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from '@mui/material/Link';
import paths from 'routes/paths';
import Code from 'components/base/Code';
import IconifyIcon from 'components/base/IconifyIcon';

export const changelog = [
  {
    version: 'V1.12.0',
    title: 'Stellar Eclipse',
    publish: '05 April, 2026',
    badgeTitle: 'Latest',
    logs: {
      New: [
        {
          text: (
            <>
              App: <b>Member</b>
            </>
          ),
        },
        { text: 'Page', link: paths.members },
        { text: 'Page', link: paths.memberProfile },
        { text: 'Page', link: paths.memberNewMember },
        {
          text: (
            <>
              Added new <strong>organizational chart</strong>:{' '}
              <Code>src/components/base/OrganizationalChart.jsx</Code>.
            </>
          ),
        },
      ],
      Updates: [{ text: 'Upgrade Next.js to 16.2.1 and Vite to 8.' }],
    },
  },
  {
    version: 'V1.11.0',
    title: 'Zenith Arc',
    publish: '11 March, 2026',
    logs: {
      New: [
        {
          text: (
            <>
              App: <b>HRM</b>
            </>
          ),
        },
        { text: 'Page', link: paths.hrmRoot },
        { text: 'Page', link: paths.hrmPayrollRoot },
        { text: 'Page', link: paths.hrmPayrollDashboard },
        { text: 'Page', link: paths.hrmPayrollRun },
        { text: 'Page', link: paths.hrmPayrollReview },
        { text: 'Page', link: paths.hrmPerformanceRoot },
        { text: 'Page', link: paths.hrmPerformanceGoals },
        { text: 'Page', link: paths.hrmPerformanceNewGoal },
        { text: 'Page', link: paths.hrmPerformanceAppraisalList },
        { text: 'Page', link: paths.hrmPerformanceAppraisalCycle },
        { text: 'Page', link: paths.hrmPerformanceFeedback },
      ],
      Updates: [
        {
          text: 'Updated all third-party packages to their latest stable and compatible versions.',
        },
        {
          text: (
            <>
              <strong>Starter Apps</strong>: Added new documentation for adding theme presets. See{' '}
              <Link href={`${paths.theming}`} underline="hover">
                Theming Documentation
              </Link>{' '}
              for the &quot;Starter Apps - Add a Theme Preset&quot; guide.
            </>
          ),
        },
      ],
    },
  },
  {
    version: 'V1.10.0',
    title: 'Nova Drift',
    publish: '11 February, 2026',
    logs: {
      Features: [
        {
          text: (
            <>
              Added a new <strong>Font Family Options Switcher</strong> with pre-made font families
              such as <i>Plus Jakarta Sans</i> (Base font), <i>Inter</i>, <i>Roboto</i>,{' '}
              <i>DM Sans</i> etc.
            </>
          ),
        },
        {
          text: (
            <>
              Introduced a <strong>Font Size</strong> slider that changes the base font size (16px
              by default).
            </>
          ),
        },
      ],
      Fixes: [
        {
          text: (
            <>
              Fixed some issues related to the <Code>FileUploader</Code> component.
            </>
          ),
        },
        { text: 'Minor UI and behavior bugs fix' },
      ],
      Updates: [
        {
          text: (
            <>
              Documentation updated for the <Code>FileUploader</Code> component, the{' '}
              <Code>Configuration</Code> and the <Code>Layouts</Code>.
            </>
          ),
        },
      ],
    },
  },
  {
    version: 'V1.9.0',
    title: 'Ion Burst',
    publish: '03 February, 2026',
    logs: {
      New: [
        {
          text: (
            <>
              App: <b>Content</b>
            </>
          ),
        },
        { text: 'Page', link: paths.content },
        { text: 'Page', link: paths.contentSearch },
        { text: 'Page', link: paths.contentTopics },
        { text: 'Page', link: { href: paths.blogDetails('1'), linkText: `/apps/content/blogs` } },
        {
          text: 'Page',
          link: { href: paths.podcastDetails('1'), linkText: `/apps/content/podcasts` },
        },
        { text: 'Page', link: { href: paths.videoDetails('1'), linkText: `/apps/content/videos` } },
        { text: 'Page', link: paths.createBlog },
        { text: 'Page', link: paths.uploadMedia },
      ],
    },
  },
  {
    version: 'V1.8.0',
    title: 'Prism Flux',
    publish: '8 January, 2026',
    warning: (
      <Alert
        severity="info"
        icon={<IconifyIcon icon="material-symbols:info-outline-rounded" />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Important Theme System Update</AlertTitle>
        This version introduces a new <strong>Theme Preset System</strong>. Please see the{' '}
        <Link href="/documentation/theming" underline="hover">
          Theming Documentation
        </Link>{' '}
        for details.
      </Alert>
    ),
    logs: {
      Features: [
        {
          text: (
            <>
              Added a new <strong>Theme Preset System</strong> with ready-made visual styles such as
              Luxury, Retro, Arctic, and Nature. Each preset comes with its own color foundations
              and lets you customize the primary color without breaking consistency.
            </>
          ),
        },
        {
          text: (
            <>
              Introduced a <strong>Vision Mode</strong> toggle that works across every preset.
            </>
          ),
        },
      ],
      Updates: [
        {
          text: (
            <>
              <Code>Next.js</Code>: Upgraded to <Code>v16.1.0</Code> in all Next.js applications
              (next-js, next-ts, next-js-starter, next-ts-starter). This includes performance
              improvements, new features, and security updates. Please refer to the{' '}
              <Link
                href="https://nextjs.org/docs/app/guides/upgrading/version-16"
                target="_blank"
                underline="hover"
              >
                Next.js 16 Upgrade Guide
              </Link>{' '}
              for migration details.
            </>
          ),
        },
        {
          text: (
            <>
              Resolved security vulnerabilities: Fixed critical security issues in{' '}
              <Code>React</Code> and <Code>Next.js</Code> related to React Server Components. This
              includes fixes for Denial of Service (CVE-2025-55184, CVE-2025-67779) and Source Code
              Exposure (CVE-2025-55183) vulnerabilities. See{' '}
              <Link
                href="https://nextjs.org/blog/security-update-2025-12-11"
                target="_blank"
                underline="hover"
              >
                Next.js Security Update
              </Link>{' '}
              and{' '}
              <Link
                href="https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components"
                target="_blank"
                underline="hover"
              >
                React Security Advisory
              </Link>{' '}
              for details.
            </>
          ),
        },
        {
          text: 'Documentation now includes a step-by-step guide for creating custom presets and overriding primary colors.',
        },
      ],
    },
  },
  {
    version: 'V1.7.0',
    title: 'Solar Drift',
    publish: '10 November, 2025',
    logs: {
      New: [
        { text: 'Dashboard', link: paths.hiring },
        { text: 'App', link: paths.hiringJobOpening },
        { text: 'App', link: paths.hiringPipeline },
        { text: 'App', link: paths.hiringNewOpening },
        { text: 'App', link: paths.hiringCandidateDetails },
        { text: 'App', link: paths.hiringJobList },
        { text: 'App', link: paths.hiringJobDetails() },
        { text: 'App', link: paths.hiringJobApplication },
      ],
    },
  },
  {
    version: 'V1.6.0',
    title: 'Plasma Wave',
    publish: '21 October, 2025',
    warning: (
      <Alert
        severity="info"
        icon={<IconifyIcon icon="material-symbols:info-outline-rounded" />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Important Update</AlertTitle>
        All static <strong>assets</strong> (images, videos, and audio) are now served via a custom{' '}
        <strong>CDN</strong>. This improves load performance and reduces the overall template size.
      </Alert>
    ),
    logs: {
      Updates: [
        {
          text: (
            <>
              Implemented a <strong>CDN-based assets system</strong> — all static files are now
              served from dedicated CDN.
            </>
          ),
        },
        {
          text: (
            <>
              Updated the <Code>Image</Code> base component in the <Code>next-js</Code> and{' '}
              <Code>next-ts</Code> apps.
            </>
          ),
        },
        {
          text: 'Updated all third-party packages to their latest stable and compatible versions.',
        },
      ],
      Fixes: [
        {
          text: (
            <>
              Updated <Code>ToggleButton</Code> color to improve visual consistency
            </>
          ),
        },
        { text: 'Minor UI and behavior bugs fix' },
      ],
    },
  },
  {
    version: 'V1.5.0',
    title: 'Neon Flare',
    publish: '17 September, 2025',
    logs: {
      New: [
        { text: 'App', link: paths.invoiceList },
        { text: 'App', link: paths.createInvoice },
        { text: 'App', link: paths.invoicePreview },
        { text: 'Page', link: paths.landingHomepage },
        { text: 'Page', link: paths.landing404 },
        { text: 'Page', link: paths.landingAbout },
        { text: 'Page', link: paths.landingComingSoon },
        { text: 'Page', link: paths.landingContact },
        { text: 'Page', link: paths.landingFaq },
        { text: 'Page', link: paths.landingMaintenance },
      ],
      Updates: [
        { text: 'Updated Sidenav collapse button.' },
        { text: 'Updated Ecommerce dashboard.' },
        { text: 'React-datepicker: Upgraded to v8.7.0' },
      ],
      Fixes: [{ text: 'Minor UI and behavior bugs fix and performance improvements.' }],
    },
  },
  {
    version: 'V1.4.1',
    title: 'Aqua Rift',
    publish: '13 August, 2025',
    logs: {
      Fixes: [
        {
          text: 'Switched ECharts to v5.6.0 for consistent visuals and better compatibility.',
        },
        {
          text: 'Minor UI fixes',
        },
      ],
    },
  },
  {
    version: 'V1.4.0',
    title: 'Ember Light',
    publish: '12 August, 2025',
    warning: (
      <Alert
        severity="info"
        icon={<IconifyIcon icon="material-symbols:info-outline-rounded" />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Important Update</AlertTitle>
        AgRM now comes with a fully integrated <strong>Next.js</strong> version. The updated
        package contains full <strong>Next.js</strong> implementations in both TS and JS formats.
      </Alert>
    ),
    logs: {
      New: [
        {
          text: (
            <>
              Added <Code>Next.js</Code> full version (TypeScript & JavaScript).
            </>
          ),
        },
        {
          text: <>Added a live showcase page for layout, theme, and component exploration.</>,
        },
      ],
      Fixes: [
        {
          text: 'Kanban: Fixed infrequent crash due to undefined drag property.',
        },
        {
          text: 'Resolved multiple layout flickering issues, including searchbox, icons, and sidenav.',
        },
        {
          text: 'Reduced bundle size for improved load performance and efficiency.',
        },
        {
          text: 'Minor UI and behavior bugs fix and performance improvements.',
        },
      ],
    },
  },
  {
    version: 'V1.3.1',
    title: 'Frostbite',
    publish: '29 June, 2025',
    logs: {
      Fixes: [
        {
          text: (
            <>
              Dependency Conflicts: Resolved <Code>@mui/icons-material</Code> peer dependency
              mismatch with <Code>@mui/material</Code>.
            </>
          ),
        },
        {
          text: (
            <>
              TipTap Compatibility: Upgraded all <Code>@tiptap/*</Code> packages to{' '}
              <Code>^2.23.0</Code> to fix build error caused by missing <Code>canInsertNode</Code>{' '}
              export.
            </>
          ),
        },
        {
          text: (
            <>
              Added <Code>^</Code> to all package versions in <Code>package.json</Code> to allow
              future minor and patch updates.
            </>
          ),
        },
      ],
    },
  },
  {
    version: 'V1.3.0',
    title: 'Cyber Nova',
    publish: '19 June, 2025',
    warning: (
      <Alert
        severity="info"
        icon={<IconifyIcon icon="material-symbols:info-outline-rounded" />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Important Update</AlertTitle>
        Now compatible with <strong>React 19</strong> and <strong>Material UI v7</strong>. Please
        refer to the{' '}
        <Link
          href="https://react.dev/blog/2024/04/25/react-19-upgrade-guide"
          target="_blank"
          underline="hover"
        >
          Upgrade Guide
        </Link>{' '}
        for migration steps.
      </Alert>
    ),
    logs: {
      Updates: [
        {
          text: (
            <>
              Added <Code>React 19</Code> compatibility with <Code>Material UI v7</Code>
            </>
          ),
        },
        {
          text: (
            <>
              Removed the <Code>forwardRef</Code> and adjusted the types support.
            </>
          ),
        },

        {
          text: (
            <>
              Upgraded to <Code>React Router v7</Code>
            </>
          ),
          link: {
            href: 'https://reactrouter.com/upgrading/v6#upgrade-to-v7',
            linkText: 'See Migration Guide',
          },
        },
        {
          text: 'Updated all third-party packages to their latest stable and compatible versions',
        },
        {
          text: 'Refactored Suspense boundaries to align with React Router’s dynamic fallback handling',
        },
      ],
      Fixes: [
        {
          text: 'Minor UI and behavior bugs fix and performance improvements.',
        },
      ],
    },
  },
  {
    version: 'V1.2.0',
    title: 'Stormforge',
    publish: '04 June, 2025',
    warning: (
      <Alert
        severity="info"
        icon={<IconifyIcon icon="material-symbols:info-outline-rounded" />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Important Theme System Update</AlertTitle>
        This version introduces CSS variables for all theme values. Please see the{' '}
        <Link href="/documentation/theming#css-variable-upgrade-guide" underline="hover">
          Upgrade Guide
        </Link>{' '}
        for migration instructions and breaking changes.
      </Alert>
    ),
    logs: {
      New: [
        { text: 'Dashboard', link: '/dashboard/time-tracker' },
        { text: 'App', link: '/file-manager' },
        { text: 'App', link: '/apps/calendar' },
        { text: 'App', link: '/apps/scheduler' },
        { text: 'New Account pages', link: '/account' },
        {
          text: 'Migrating to CSS variable-based theming',
          link: {
            href: '/documentation/theming#css-variable-upgrade-guide',
            linkText: 'CSS variable upgrade guide',
          },
        },
        {
          text: (
            <>
              New <Code>ColorPicker</Code> component for selecting and formatting colors with alpha
              transparency
            </>
          ),
        },
        {
          text: (
            <>
              Package: <Code>@uiw/react-color</Code>
            </>
          ),
        },
        {
          text: (
            <>
              Package: <Code>react-device-detect</Code>
            </>
          ),
        },
      ],
      Features: [
        {
          text: (
            <>
              Added support for <Code>theme.vars</Code> in all MUI components for color and spacing
              tokens
            </>
          ),
        },
        {
          text: (
            <>
              Introduced <Code>cssVarRgba()</Code> utility for alpha transparency with full variable
              support
            </>
          ),
        },
      ],
      Updates: [
        {
          text: (
            <>
              Refactored dark mode logic to use <Code>useThemeMode()</Code> for consistent theme
              detection
            </>
          ),
        },
        {
          text: (
            <>
              Replaced <Code>alpha()</Code> usage with <Code>cssVarRgba()</Code> to improve SSR and
              runtime compatibility
            </>
          ),
        },
        {
          text: (
            <>
              Used <Code>getThemeColor()</Code> utility to resolve CSS variable-based colors at
              runtime in all ECharts
            </>
          ),
        },
        {
          text: 'Updated deprecated MUI component APIs',
          link: {
            href: 'https://mui.com/material-ui/migration/migrating-from-deprecated-apis/',
            linkText: 'Migration Guide',
          },
        },
        {
          text: (
            <>
              <Code>svelte-gantt</Code>: Upgraded to v4.5.0
            </>
          ),
        },
      ],
      Fixes: [
        {
          text: 'Fixed theme mode switch flickering issue',
        },
        {
          text: 'Fixed issue related to threadline not appearing in some browsers in the Social app',
        },
        { text: 'Fixed various RTL and browser compatibility issues' },
      ],
    },
  },
  {
    version: 'V1.1.0',
    title: 'Frostbeam',
    publish: '29 April, 2025',
    logs: {
      New: [
        { text: 'Dashboard', link: '/dashboard/analytics' },
        { text: 'Dashboard', link: '/dashboard/hrm' },
        { text: 'App', link: '/apps/social' },
        { text: 'Page', link: '/crm/deals' },
        { text: 'Page', link: '/crm/lead-details' },
        { text: 'Page', link: '/crm/deal-details' },
        { text: 'Page', link: '/crm/add-contact' },
        { text: 'Page', link: '/pricing/table' },
        { text: 'Page', link: '/ecommerce/admin/create-order' },
      ],
      Features: [
        { text: 'Added support for documentation search' },
        { text: 'New starter templates available for JavaScript and TypeScript' },
      ],
      Fixes: [
        { text: 'Resolved some RTL issues' },
        { text: 'Improved mobile responsiveness' },
        { text: 'Kanban: Items can be dragged properly in compact mod' },
      ],
      Updates: [
        { text: '@mui/material: Upgraded to v7.0.2' },
        { text: '@mui/system: Upgraded to v7.0.2' },
        { text: '@mui/utils: Upgraded to v7.0.2' },
        { text: '@mui/x-data-grid: Upgraded to v8.0.0' },
        { text: '@mui/x-date-pickers: Upgraded to v8.0.0' },
        { text: 'Updated component docs' },
      ],
    },
  },
];
