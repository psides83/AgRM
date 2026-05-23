import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getTagChipColor } from 'data/hrm/performance-management';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';

const TitleSection = ({ goal, onClose }) => {
  return (
    <DialogTitle
      component={Stack}
      direction="column"
      sx={{
        pt: { xs: 3, sm: 5 },
        pb: 3,
        px: { xs: 3, sm: 5 },
        gap: 2,
      }}
    >
      <Stack gap={2}>
        <Typography
          variant="h6"
          sx={({ breakpoints }) => ({
            lineHeight: '32px',
            lineClamp: 3,
            [breakpoints.up('sm')]: { lineClamp: 2 },
          })}
        >
          {goal.title}
        </Typography>
        <Stack gap={1}>
          <DashboardMenu />
          <Button color="neutral" shape="square" size="small" onClick={onClose}>
            <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20 }} />
          </Button>
        </Stack>
      </Stack>

      <Stack gap={1}>
        {goal.tags.map((tag, index) => (
          <Chip key={index} label={tag} color={getTagChipColor(tag)} />
        ))}
      </Stack>
    </DialogTitle>
  );
};

export default TitleSection;
