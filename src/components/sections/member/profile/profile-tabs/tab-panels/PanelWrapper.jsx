import { Button, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const PanelWrapper = ({ title, children, sx }) => {
  return (
    <Stack direction="column" gap={3} sx={{ ...sx }}>
      <Paper background={2} sx={{ px: 2, py: 1, borderRadius: 2, outline: 0 }}>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>

          <Button shape="square" variant="soft" size="small" color="neutral">
            <IconifyIcon icon="material-symbols:edit-outline" sx={{ fontSize: 18 }} />
          </Button>
        </Stack>
      </Paper>

      {children}
    </Stack>
  );
};
export default PanelWrapper;
