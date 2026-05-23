import { Button, Stack } from '@mui/material';
import { navItems } from 'data/showcase';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { GradientButton } from '../../common';

const HeaderNav = ({ registerNavItemRef }) => {
  const { up } = useBreakpoints();
  const upMd = up('md');

  return (
    <Stack sx={{ gap: 2, alignItems: 'center' }}>
      {upMd &&
        navItems.map(({ label, href }) => (
          <Button
            key={label}
            ref={registerNavItemRef}
            size="medium"
            variant="text"
            color="neutral"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ p: 1.5, color: 'common.white' }}
          >
            {label}
          </Button>
        ))}

      <GradientButton
        ref={registerNavItemRef}
        href="https://mui.com/store/items/aurora/"
        color="neutral"
        sx={{ width: { xs: 160 }, height: { xs: 52 } }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Purchase
      </GradientButton>
    </Stack>
  );
};

export default HeaderNav;
