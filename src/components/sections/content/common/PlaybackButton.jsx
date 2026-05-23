import { useState } from 'react';
import { Button, Menu, MenuItem, Typography, listClasses, menuClasses } from '@mui/material';

const PlaybackButton = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Button
        size="small"
        variant="soft"
        color="neutral"
        aria-label="speed"
        id="action-button"
        aria-controls={open ? 'actions-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        1x
      </Button>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          [`& .${menuClasses.paper}`]: {
            [`& .${listClasses.root}`]: {
              minWidth: 120,
            },
          },
        }}
        slotProps={{
          list: {
            'aria-labelledby': 'action-button',
          },
        }}
      >
        {['2x', '1.75x', '1.25x', '1x', '0.5x'].map((item, i) => (
          <MenuItem onClick={handleClose} key={i}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                color: item === '1x' ? 'text.disabled' : 'text.primary',
              }}
            >
              {item}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default PlaybackButton;
