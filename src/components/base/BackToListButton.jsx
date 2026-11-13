'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { PreviousPageContext } from 'providers/PreviousPageProvider';

export default function BackToListButton({ fallbackHref, fallbackLabel }) {
  const router = useRouter();
  const previousPage = useContext(PreviousPageContext);

  return (
    <Button
      href={previousPage || fallbackHref}
      onClick={(event) => {
        if (
          !previousPage ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        router.back();
      }}
      startIcon={<IconifyIcon icon="material-symbols:arrow-back-rounded" />}
      sx={{ mb: 2, alignSelf: 'flex-start' }}
    >
      {!previousPage || previousPage.split(/[?#]/)[0] === fallbackHref
        ? `Back to ${fallbackLabel}`
        : 'Back'}
    </Button>
  );
}
