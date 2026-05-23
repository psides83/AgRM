import { List, ListItemButton, ListItemText, ListSubheader, Paper } from '@mui/material';
import { blogTableOfContents } from 'data/content/blog';
import { useSettingsContext } from 'providers/SettingsProvider';
import { HashLinkBehavior } from 'theme/components/Link';
import useScrollSpy from './useScollSpy';

const BlogAside = () => {
  const {
    config: { topnavType },
  } = useSettingsContext();

  const sectionIds = blogTableOfContents.map((item) => item.url);
  const activeElemId = useScrollSpy(sectionIds, 300);

  return (
    <Paper sx={{ height: 1, outline: 0 }}>
      <List
        dense
        sx={{
          width: '100%',
          position: 'sticky',
          top: ({ mixins }) =>
            Object.keys(mixins.topbar[topnavType]).reduce((acc, key) => {
              acc[key] = Number(mixins.topbar[topnavType][key]) + 40;
              return acc;
            }, {}),
        }}
        component="nav"
        subheader={
          <ListSubheader
            component="div"
            id="list-subheader"
            sx={{
              background: 'transparent',
              typography: 'body1',
              fontWeight: 600,
              color: 'text.primary',
              px: 0,
              mb: 2,
            }}
          >
            Table of Contents
          </ListSubheader>
        }
      >
        {blogTableOfContents.map((item) => (
          <ListItemButton
            key={item.id}
            LinkComponent={HashLinkBehavior}
            href={`#${item.url}`}
            selected={item.url === activeElemId}
            sx={{
              mb: 0.6,
            }}
          >
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  variant: 'caption',
                  fontWeight: 500,
                  fontSize: '12px !important',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default BlogAside;
