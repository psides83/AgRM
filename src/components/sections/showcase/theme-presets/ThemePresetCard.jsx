import { memo } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import NestedThemeProvider from 'components/base/NestedThemeProvider';
import { AiTools } from 'components/sections/dashboards/e-commerce/promo-slider/illustrations/Ai-tools';
import { Rocket } from 'components/sections/dashboards/e-commerce/promo-slider/illustrations/Rocket';
import BarChartCard from './cards/BarChartCard';
import ButtonsCard from './cards/ButtonsCard';
import CheckboxesCard from './cards/CheckboxesCard';
import ChipsCard from './cards/ChipsCard';
import LineChartCard from './cards/LineChartCard';
import ListCard from './cards/ListCard';
import MeetingCard from './cards/MeetingCard';
import MenuCard from './cards/MenuCard';
import PieChartCard from './cards/PieChartCard';
import SaleFunnelChartCard from './cards/SaleFunnelChartCard';
import SlideCard from './cards/SlideCard';
import ThemeCard from './cards/ThemeCard';

const ThemePresetCard = memo(({ themePreset }) => {
  return (
    <NestedThemeProvider preset={themePreset}>
      <Grid
        container
        spacing={1}
        columns={5}
        alignItems="center"
        justifyContent="center"
        flexWrap="nowrap"
        sx={{
          contain: 'layout style paint',
        }}
      >
        <Grid container size={1} gap={1} sx={{ width: 240, flexShrink: 0 }}>
          <Grid size={12}>
            <SaleFunnelChartCard themePreset={themePreset} />
          </Grid>
          <Grid size={12}>
            <PieChartCard themePreset={themePreset} />
          </Grid>
        </Grid>

        <Grid container size={1} gap={1} sx={{ width: 240, flexShrink: 0 }}>
          <Grid size={12}>
            <Box
              sx={{
                borderRadius: 4,
                bgcolor: 'background.elevation1',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
              }}
            >
              <AiTools themePreset={themePreset} ignoreGlobalOverride />
            </Box>
          </Grid>
          <Grid size={12}>
            <MenuCard themePreset={themePreset} />
          </Grid>
          <Grid size={12}>
            <CheckboxesCard />
          </Grid>
        </Grid>

        <Grid container size={1} gap={1} sx={{ width: 300, flexShrink: 0 }}>
          <Grid size={12}>
            <LineChartCard themePreset={themePreset} />
          </Grid>
          <Grid size={12}>
            <ThemeCard themePreset={themePreset} />
          </Grid>
          <Grid size={12}>
            <ListCard />
          </Grid>
        </Grid>

        <Grid container size={1} gap={1} sx={{ width: 240, flexShrink: 0 }}>
          <Grid size={12}>
            <ButtonsCard />
          </Grid>
          <Grid size={12}>
            <SlideCard />
          </Grid>
          <Grid size={12}>
            <Paper
              background={1}
              sx={{
                borderRadius: 4,
                p: 3,
                width: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
              }}
            >
              <Rocket themePreset={themePreset} ignoreGlobalOverride />
            </Paper>
          </Grid>
          <Grid size={12}>
            <ChipsCard />
          </Grid>
        </Grid>

        <Grid container size={1} gap={1} sx={{ width: 240, flexShrink: 0 }}>
          <Grid size={12}>
            <BarChartCard themePreset={themePreset} />
          </Grid>
          <Grid size={12}>
            <MeetingCard />
          </Grid>
        </Grid>
      </Grid>
    </NestedThemeProvider>
  );
});

export default ThemePresetCard;
