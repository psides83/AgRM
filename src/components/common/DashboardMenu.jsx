'use client';
import { useState } from 'react';
import { Button, Menu, MenuItem, listClasses, menuClasses } from '@mui/material';
import EllipsisHorizontalIcon from 'components/icons/EllipsisHorizontalIcon';

const defaultItems = [
  {
    label: 'Sync',
  },
  {
    label: 'Export',
  },
  {
    label: 'Remove',
    sx: { color: 'error.main' },
  },
];

const DashboardMenu = ({
  menuItems = defaultItems,
  icon = <EllipsisHorizontalIcon />,
  size = 'small',
  variant = 'text',
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  disabled = false,
  shape = 'square',
  color = 'neutral',
  sx,
  ...rest
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        sx={{ color: 'text.primary', ...sx }}
        shape={shape}
        color={color}
        size={size}
        variant={variant}
        disabled={disabled}
        aria-label="more"
        id="action-button"
        aria-controls={open ? 'actions-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        {...rest}
      >
        {icon}
      </Button>

      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
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
        {menuItems.map(({ label, onClick, ...rest }) => (
          <MenuItem
            key={label}
            onClick={(e) => {
              if (onClick) {
                onClick(e);
              }
              handleClose(e);
            }}
            {...rest}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DashboardMenu;
