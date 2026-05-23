import { useMemo } from 'react';
import { Paper } from '@mui/material';
import { saleFunnelData } from 'data/crm/dashboard';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { tooltipFormatterList } from 'helpers/echart-utils';
import { allPalettes } from 'theme/palettes';
import ReactEchart from 'components/base/ReactEchart';
import { getThemePrimaryColors } from 'components/sections/dashboards/e-commerce/promo-slider/utils';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer, LegendComponent]);

const SaleFunnelChartCard = ({ themePreset }) => {
  const primaryPalette = getThemePrimaryColors(themePreset);

  const themePalette = allPalettes[themePreset];
  const textSecondaryColor = themePalette.text.secondary;
  const backgroundElevation2Color = themePalette.background.elevation2;

  const getOptions = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        formatter: (params) => tooltipFormatterList(params),
      },
      legend: {
        data: Object.keys(saleFunnelData).flat(),
        show: false,
      },
      xAxis: {
        type: 'value',
        show: false,
        inverse: true,
      },
      yAxis: {
        type: 'category',
        data: Object.keys(saleFunnelData)
          .flat()
          .map((item) => item[0].toUpperCase() + item.slice(1)),
        axisLabel: {
          show: true,
          align: 'left',
          margin: 100,
          color: textSecondaryColor,
          fontSize: 12,
          fontWeight: 500,
        },
        axisTick: false,
        axisLine: false,
        inverse: true,
        boundaryGap: true,
      },
      series: [
        {
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            borderRadius: 4,
            color: backgroundElevation2Color,
          },
          data: Object.values(saleFunnelData).flat(),
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 500,
            formatter: (params) => `${Number(params.value)}%`,
          },
          emphasis: {
            disabled: true,
          },
          itemStyle: {
            borderRadius: 4,
            color: (params) => {
              const colors = [
                primaryPalette[100],
                primaryPalette[200],
                primaryPalette[300],
                primaryPalette[400],
                primaryPalette[500],
              ];

              return colors[params.dataIndex] || primaryPalette[500];
            },
          },
          barWidth: 28,
          barGap: 16,
        },
      ],
      grid: { left: 100, right: 0, top: 0, bottom: 0, outerBoundsMode: 'none' },
    }),
    [primaryPalette, textSecondaryColor, backgroundElevation2Color, saleFunnelData, themePreset],
  );

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 2,
        height: 265,
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <ReactEchart
        echarts={echarts}
        option={getOptions}
        sx={{ overflow: 'visible', height: '100% !important' }}
      />
    </Paper>
  );
};

export default SaleFunnelChartCard;
