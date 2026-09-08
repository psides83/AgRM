'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';

function MainAuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const query = searchParams.toString();
    const callbackUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(
      `${paths.defaultJwtLogin}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  if (isLoading || !isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
}

export default MainAuthGuard;
