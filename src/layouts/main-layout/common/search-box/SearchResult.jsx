'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  inputBaseClasses,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from './SearchTextField';

const quickLinks = [
  {
    label: 'Contacts',
    description: 'People, phone numbers, emails, and linked companies',
    href: paths.contacts,
    icon: 'material-symbols:contacts-outline-rounded',
  },
  {
    label: 'Deals',
    description: 'Pipeline, amounts, stages, and close dates',
    href: paths.deals,
    icon: 'material-symbols:handshake-outline-rounded',
  },
  {
    label: 'Add Contact',
    description: 'Create a contact, company, lead, or equipment interest',
    href: paths.addContact,
    icon: 'material-symbols:person-add-outline-rounded',
  },
];

const searchChips = ['tractor', 'combine', 'quote', 'follow up', 'trade-in'];

const SearchResult = ({ handleClose }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const runSearch = (value = query) => {
    const cleanQuery = value.trim();

    if (!cleanQuery) {
      router.push(paths.crmSearch);
    } else {
      router.push(`${paths.crmSearch}?q=${encodeURIComponent(cleanQuery)}`);
    }

    handleClose();
  };

  return (
    <>
      <SearchField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
        handleClose={handleClose}
      />
      <SimpleBar style={{ maxHeight: 520, minHeight: 0, width: '100%' }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {searchChips.map((chip) => (
              <Chip
                key={chip}
                label={chip}
                variant="soft"
                color="neutral"
                component="button"
                onClick={() => runSearch(chip)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>
        <Divider />
        <ResultItemSection title="AgRM">
          <List sx={{ pt: 0, pb: 2 }}>
            {quickLinks.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  underline="none"
                  onClick={handleClose}
                  sx={(theme) => ({
                    gap: 1,
                    py: 1,
                    px: 3,
                    borderRadius: 0,
                    '&:hover': { bgcolor: 'background.menuElevation1' },
                    color: theme.vars.palette.text.primary,
                  })}
                >
                  <ListItemIcon>
                    <IconifyIcon icon={item.icon} fontSize={28} color="primary.main" />
                  </ListItemIcon>
                  <ListItemText
                    sx={{ my: 0 }}
                    primary={item.label}
                    secondary={item.description}
                    slotProps={{
                      primary: {
                        variant: 'subtitle2',
                        color: 'text.primary',
                        mb: 0.25,
                      },
                      secondary: {
                        variant: 'caption',
                        color: 'text.disabled',
                        fontWeight: 'medium',
                        component: 'p',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </ResultItemSection>
        <Box sx={{ px: 3, py: 2 }}>
          <Button
            fullWidth
            variant="soft"
            color="neutral"
            onClick={() => runSearch()}
            endIcon={<IconifyIcon icon="material-symbols:arrow-forward-rounded" />}
          >
            Open CRM Search
          </Button>
        </Box>
      </SimpleBar>
    </>
  );
};

export const SearchField = ({ value, onChange, onSubmit, handleClose }) => {
  const initialFocusRef = useRef(null);

  useEffect(() => {
    initialFocusRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <Box component="form" onSubmit={onSubmit}>
      <SearchTextField
        fullWidth
        value={value}
        onChange={onChange}
        placeholder="Search AgRM"
        sx={{
          [`& .${inputBaseClasses.root}`]: {
            borderRadius: '4px 4px 0 0',
            border: 1,
            borderColor: 'transparent',
            [`&.${inputBaseClasses.focused}`]: {
              outline: 'none',
              border: 1,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderColor: 'primary.main',
              boxShadow: 'none',
            },
          },
        }}
        slotProps={{
          input: {
            inputProps: {
              ref: initialFocusRef,
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" size="small" edge="end" aria-label="Search">
                  <IconifyIcon icon="material-symbols:arrow-forward-rounded" color="primary.main" />
                </IconButton>
                <IconButton size="small" edge="end" onClick={handleClose} aria-label="Close search">
                  <IconifyIcon icon="material-symbols:close-rounded" color="grey.500" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
};

const ResultItemSection = ({ title, children }) => {
  return (
    <Box>
      <Box sx={{ my: 2, px: 3 }}>
        <Typography
          variant="caption"
          component="h6"
          sx={{
            fontWeight: 'medium',
            color: 'text.disabled',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
      <Divider />
    </Box>
  );
};

export default SearchResult;
