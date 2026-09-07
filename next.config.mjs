import bundleAnalyzer from '@next/bundle-analyzer';

const IsDEV = process.env.NEXT_PUBLIC_DEV_MODE === 'dev';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: '/showcase', destination: '/dashboard/crm', permanent: false },
      { source: '/dashboard/ecommerce', destination: '/dashboard/crm', permanent: false },
      { source: '/dashboard/project', destination: '/dashboard/crm', permanent: false },
      { source: '/dashboard/analytics', destination: '/dashboard/crm', permanent: false },
      { source: '/dashboard/hrm', destination: '/dashboard/crm', permanent: false },
      { source: '/dashboard/time-tracker', destination: '/dashboard/crm', permanent: false },
      { source: '/dashboard/hiring', destination: '/dashboard/crm', permanent: false },
      { source: '/apps/ecommerce/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/hrm/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/invoice/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/email/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/events/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/kanban/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/hiring/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/member/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/content/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/chat/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/social/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/file-manager/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/calendar/:path*', destination: '/apps/crm', permanent: false },
      { source: '/apps/scheduler/:path*', destination: '/apps/crm', permanent: false },
      { source: '/pages/starter', destination: '/dashboard/crm', permanent: false },
      { source: '/pages/notifications', destination: '/dashboard/crm', permanent: false },
      { source: '/pages/faq', destination: '/dashboard/crm', permanent: false },
      { source: '/pages/coming-soon', destination: '/dashboard/crm', permanent: false },
      { source: '/pages/landing/:path*', destination: '/dashboard/crm', permanent: false },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: IsDEV,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9001',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'prium.github.io',
        pathname: '/aurora/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@iconify/react', 'lodash', '@mui/x-date-pickers', '@mui/lab'],
  },
};

export default withBundleAnalyzer(nextConfig);
