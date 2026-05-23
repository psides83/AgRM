'use client';

import { Stack } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import EmailProvider from 'providers/EmailProvider';

const EmailLayout = ({ children }) => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upSm = up('sm');

  return (
    <EmailProvider>
      <Stack
        sx={({ mixins }) => ({
          height: mixins.contentHeight(
            topbarHeight,
            (upSm ? mixins.footer.sm : mixins.footer.xs) + 1,
          ),
        })}
      >
        {children}
      </Stack>
    </EmailProvider>
  );
};

export default EmailLayout;
