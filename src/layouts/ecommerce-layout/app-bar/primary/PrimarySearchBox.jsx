'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  inputBaseClasses,
  listClasses,
} from '@mui/material';
import SearchTextField from 'layouts/main-layout/common/search-box/SearchTextField';
import { kebabCase } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';

const searchCategories = ['All', 'Popular', 'New', 'Discounted', 'Top Rated', 'Featured'];

const PrimarySearchBox = () => {
  const [searchMenuAnchorEl, setSearchMenuAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(searchCategories[0]);

  const handleSearchMenuClick = (event) => {
    setSearchMenuAnchorEl(event.currentTarget);
  };

  const handleSearchMenuClose = () => {
    setSearchMenuAnchorEl(null);
  };

  return (
    <Stack spacing={0.5} sx={{ width: 1, maxWidth: { lg: 602 } }}>
      <Box
        sx={({ vars }) => ({
          display: 'flex',
          alignItems: 'center',
          width: 1,
          borderRadius: 6,
          backgroundColor: 'action.hover',
          overflow: 'hidden',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          border: '1px solid transparent',
          '&:has(form:hover):not(:has(form:focus-within))': {
            backgroundColor: 'background.elevation3',
            '& > button': {
              bgcolor: vars.palette.background.elevation3,
            },
          },
          [`&:has(.${inputBaseClasses.root}.${inputBaseClasses.focused})`]: {
            backgroundColor: 'primary.lighter',
            borderColor: 'primary.main',
            '& > button': {
              bgcolor: 'primary.lighter',
            },
          },
        })}
      >
        <Button
          disableRipple
          color="neutral"
          variant="text"
          onClick={handleSearchMenuClick}
          sx={({ vars }) => ({
            flexShrink: 0,
            pr: 0.5,
            py: 1,
            borderRadius: 0,
            minWidth: 'auto',
            fontSize: 14,
            fontWeight: 600,
            color: 'text.secondary',
            display: { xs: 'none', md: 'flex' },
            transition: 'color 0.2s ease, background-color 0.2s ease',
            bgcolor: vars.palette.background.elevation2,
            '&:hover': {
              color: vars.palette.text.primary,
            },
          })}
        >
          {selectedCategory}
          <IconifyIcon icon="material-symbols:expand-more-rounded" sx={{ fontSize: 18, ml: 0.5 }} />
        </Button>
        <Menu
          anchorEl={searchMenuAnchorEl}
          open={Boolean(searchMenuAnchorEl)}
          onClose={handleSearchMenuClose}
          onClick={handleSearchMenuClose}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          sx={{
            [`& .${listClasses.root}`]: {
              minWidth: 160,
            },
          }}
        >
          {searchCategories.map((category) => (
            <MenuItem
              key={kebabCase(category)}
              onClick={() => {
                setSelectedCategory(category);
              }}
            >
              <ListItemText primary={category} />
            </MenuItem>
          ))}
        </Menu>
        <SearchTextField
          component="form"
          sx={{
            flexGrow: 1,
            [`& .${inputBaseClasses.root}`]: {
              p: 0,
              borderRadius: 0,
              border: 'none',
              '&:after': {
                display: 'none',
              },
              '&.Mui-focused': {
                boxShadow: 'none',
              },
              '&.Mui-focused:hover': {
                bgcolor: 'transparent !important',
              },
              '&.Mui-active': {
                bgcolor: 'transparent !important',
              },
            },
            [`& .${inputBaseClasses.input}`]: {
              pl: { xs: '16px !important', md: '8px !important' },
            },
          }}
          placeholder="Search product"
          slotProps={{
            input: {
              inputProps: {
                style: { fontSize: 14 },
              },
              startAdornment: null,
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 2 }}>
                  <IconifyIcon
                    icon="material-symbols:search-rounded"
                    sx={{ fontSize: 20, color: 'text.secondary' }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Stack>
  );
};

export default PrimarySearchBox;
