import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  listItemTextClasses,
} from '@mui/material';
import { cssVarRgba } from 'lib/utils';
import sitemap from 'routes/sitemap';
import { lightPalettes } from 'theme/palettes';
import IconifyIcon from 'components/base/IconifyIcon';

const MenuCard = ({ themePreset }) => {
  const isDark = !(themePreset in lightPalettes);

  const homepageMenu = sitemap.find((item) => item.id === 'homepage');
  const menuItems = homepageMenu?.items || [];

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 2,
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <List disablePadding>
        {menuItems.map((item, index) => {
          const isSelected = index === 0;

          return (
            <ListItem key={item.key || item.pathName} disablePadding>
              <ListItemButton
                sx={[
                  (theme) => ({
                    p: theme.spacing('3.5px', 2),
                    borderRadius: 2,
                    '&.Mui-selected': {
                      [`& .${listItemTextClasses.primary}`]: {
                        color: 'primary.main',
                      },
                    },
                  }),
                  isSelected && {
                    backgroundColor: ({ vars }) =>
                      cssVarRgba(vars.palette.primary.mainChannel, isDark ? 0.2 : 0.1),
                    '&:hover': {
                      backgroundColor: ({ vars }) =>
                        cssVarRgba(vars.palette.primary.mainChannel, isDark ? 0.2 : 0.1),
                    },
                  },
                ]}
                selected={isSelected}
              >
                {item.icon && (
                  <ListItemIcon
                    sx={{
                      '& .iconify': {
                        fontSize: 14,
                      },
                    }}
                  >
                    <IconifyIcon icon={item.icon} sx={item.iconSx} />
                  </ListItemIcon>
                )}
                <ListItemText
                  sx={{
                    [`& .${listItemTextClasses.primary}`]: {
                      typography: 'caption',
                      fontWeight: 'medium',
                      lineHeight: 1.3,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  {item.name}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default MenuCard;
