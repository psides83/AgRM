import { Chip, Tab, Tabs, tabsClasses } from '@mui/material';

const CategoryTabList = ({ contentCategories, value, handleChange }) => (
  <Tabs
    value={value}
    onChange={handleChange}
    variant="scrollable"
    scrollButtons
    allowScrollButtonsMobile
    sx={{
      mb: 5,
      [`& .${tabsClasses.indicator}`]: { display: 'none' },
      [`& .${tabsClasses.scrollButtons}.Mui-disabled`]: { opacity: 0.3 },
    }}
  >
    {contentCategories.map(({ key, label }) => (
      <Tab
        key={key}
        value={key}
        label={<Chip label={label} size="large" color={value === key ? 'primary' : 'default'} />}
        sx={{ p: 0, borderRadius: 4 }}
      />
    ))}
  </Tabs>
);

export default CategoryTabList;
