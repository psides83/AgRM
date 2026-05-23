'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton, { listItemButtonClasses } from '@mui/material/ListItemButton';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import useHashScrollIntoView from 'hooks/useHashScrollIntoView';
import { kebabCase } from 'lib/utils';
import { useSettingsContext } from 'providers/SettingsProvider';
import { HashLinkBehavior } from 'theme/components/Link';
import ScrollSpy from 'components/scroll-spy';
import ScrollSpyNavItem from 'components/scroll-spy/ScrollSpyNavItem';
import DocPageHeader from './DocPageHeader';

const DocPageLayout = ({ children, sideNavItems, pageHeaderProps }) => {
  const [navItems, setNavItems] = useState([]);
  const {
    config: { topnavType },
  } = useSettingsContext();

  useHashScrollIntoView();

  useEffect(() => {
    if (sideNavItems) {
      setNavItems(sideNavItems);
    } else {
      const items = [];
      const recursiveMap = (children) => {
        React.Children.forEach(children, (child) => {
          if (React.isValidElement(child) && typeof child.type !== 'string') {
            const props = child.props;
            const title = props.title;
            const sideNavLabel = props.sideNavLabel;

            if (
              //@ts-ignore
              child.type?.componentName === 'DocSection' &&
              title
            ) {
              items.push({
                url: '#' + kebabCase(title),
                label: sideNavLabel ?? title,
                subItem: [],
              });
            }

            if (
              //@ts-ignore
              child.type?.componentName === 'DocNestedSection' &&
              title
            ) {
              const lastItem = items[items.length - 1];
              if (lastItem?.subItem) {
                lastItem.subItem.push({
                  url: '#' + kebabCase(title),
                  label: sideNavLabel ?? title,
                  subItem: [],
                });
              }
            }

            if (props.children) {
              recursiveMap(props.children);
            }
          }
        });
      };

      recursiveMap(children);

      setNavItems(items);
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ScrollSpy offset={400}>
        {pageHeaderProps && <DocPageHeader {...pageHeaderProps} />}
        <Grid container sx={{ alignItems: 'stretch', flex: 1, minHeight: 0 }}>
          <Grid
            sx={{
              order: { md: 1 },
              display: 'flex',
            }}
            size={{
              xs: 12,
              md: 4,
              lg: 3,
            }}
          >
            <Paper background={1} sx={{ height: 1, width: 1, p: { xs: 3, md: 5 } }}>
              <List
                dense
                sx={{
                  width: '100%',
                  position: 'sticky',
                  top: ({ mixins }) =>
                    Object.keys(mixins.topbar[topnavType]).reduce((acc, key) => {
                      const breakpoint = key;
                      acc[breakpoint] = Number(mixins.topbar[topnavType][breakpoint]) + 40;

                      return acc;
                    }, {}),
                  [`& .${listItemButtonClasses.root}`]: {
                    ml: 2,
                    mb: 1,
                    [`& .${listItemTextClasses.root}`]: {
                      ml: 2,
                      mt: 0,
                    },
                    '&::before': {
                      content: '"•"',
                      verticalAlign: 'top',
                      ml: -2,
                    },
                  },
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                disablePadding
                subheader={
                  <ListSubheader
                    component="div"
                    id="nested-list-subheader"
                    sx={{
                      background: 'transparent',
                      typography: 'subtitle2',
                      fontWeight: 700,
                      color: 'text.primary',
                      px: 0,
                      mb: 2,
                    }}
                  >
                    On this page
                  </ListSubheader>
                }
              >
                {navItems.map((item) => (
                  <Fragment key={item.url}>
                    <NavItemButton item={item} />
                    {!!item.subItem?.length && (
                      <List
                        component="div"
                        dense
                        disablePadding
                        sx={{
                          pl: 2,
                        }}
                      >
                        {item.subItem?.map((child) => (
                          <NavItemButton key={child.url} item={child} />
                        ))}
                      </List>
                    )}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid
            sx={{ display: 'flex', flexDirection: 'column' }}
            size={{
              xs: 12,
              md: 8,
              lg: 9,
            }}
          >
            {children}
          </Grid>
        </Grid>
      </ScrollSpy>
    </Box>
  );
};

const NavItemButton = ({ item }) => {
  return (
    <ScrollSpyNavItem>
      {({ activeElemId }) => (
        <ListItemButton
          key={item.label}
          LinkComponent={HashLinkBehavior}
          href={item.url}
          sx={{
            p: 0,
            mb: 0.5,
            ml: 1,
            display: 'list-item',
            '&::marker': {
              paddingRight: 0.5,
            },
            [`&.${listItemButtonClasses.selected}`]: {
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'transparent',
              },
            },
          }}
          disableRipple
          selected={item.url === `#${activeElemId}`}
        >
          <ListItemText
            primary={item.label}
            slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }}
            sx={{ display: 'inline-block', ml: -1 }}
          />
        </ListItemButton>
      )}
    </ScrollSpyNavItem>
  );
};

export default DocPageLayout;
