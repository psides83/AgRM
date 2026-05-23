import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import paths from 'routes/paths';

const BottomActions = () => {
  const { push } = useRouter();
  const { down } = useBreakpoints();
  const downSm = down('sm');

  const saveLabel = downSm ? 'Save' : 'Save for Later';
  const calculateLabel = downSm ? 'Calculate' : 'Calculate Payroll';

  return (
    <Stack gap={2} sx={{ justifyContent: downSm ? 'space-between' : 'flex-end' }}>
      <Button color="neutral" sx={{ flexShrink: 0 }}>
        Cancel
      </Button>
      <Stack gap={1}>
        <Button variant="soft" color="neutral">
          {saveLabel}
        </Button>
        <Button variant="contained" onClick={() => push(paths.hrmPayrollReview)}>
          {calculateLabel}
        </Button>
      </Stack>
    </Stack>
  );
};

export default BottomActions;
