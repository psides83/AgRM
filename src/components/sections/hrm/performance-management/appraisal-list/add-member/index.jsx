import { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import AddMemberDialog from './AddMemberDialog';

const AddMember = () => {
  const { only } = useBreakpoints();
  const [open, setOpen] = useState(false);

  const isXs = only('xs');

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  return (
    <Fragment>
      <Button
        variant="contained"
        onClick={handleOpen}
        fullWidth={isXs}
        startIcon={<IconifyIcon icon="material-symbols:add" />}
        sx={{ ml: { md: 1 }, flexGrow: 1 }}
      >
        Add Member
      </Button>
      <AddMemberDialog open={open} onClose={handleClose} handleClose={handleClose} />
    </Fragment>
  );
};

export default AddMember;
