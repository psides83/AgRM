import { useMemo } from 'react';
import { Paper, alpha } from '@mui/material';
import { userByOSData } from 'data/analytics/dashboard';
import { PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { allPalettes } from 'theme/palettes';
import ReactEchart from 'components/base/ReactEchart';

echarts.use([TooltipComponent, GridComponent, PieChart, CanvasRenderer, LegendComponent]);

const PieChartCard = ({ sx, ref, themePreset }) => {
  const palette = useMemo(() => allPalettes[themePreset], [themePreset]);

  const categoryColors = useMemo(
    () => ({
      Desktop: {
        main: alpha(palette.chBlue['200'], 0.8),
        children: [
          alpha(palette.chBlue['400'], 0.8),
          alpha(palette.chBlue['300'], 0.8),
          alpha(palette.chBlue['200'], 0.8),
          alpha(palette.chBlue['100'], 0.8),
        ],
      },
      Tablet: {
        main: alpha(palette.chLightBlue['200'], 0.8),
        children: [alpha(palette.chLightBlue['300'], 0.8), alpha(palette.chLightBlue['200'], 0.8)],
      },
      Mobile: {
        main: alpha(palette.chOrange['200'], 0.8),
        children: [alpha(palette.chOrange['100'], 0.8), alpha(palette.chOrange['200'], 0.8)],
      },
    }),
    [palette],
  );

  const processedData = useMemo(
    () => ({
      outer: userByOSData.map(({ name, value }) => {
        const color = categoryColors[name]?.main ?? alpha(palette.grey['400'], 0.8);

        return {
          name,
          value,
          itemStyle: {
            color,
          },
          emphasis: {
            itemStyle: {
              color,
            },
          },
        };
      }),
      inner: userByOSData.flatMap(({ name, value, children = [] }) =>
        children.map((child, idx) => {
          const color = categoryColors[name]?.children[idx] ?? alpha(palette.grey['300'], 0.7);

          return {
            ...child,
            parentName: name,
            parentValue: value,
            itemStyle: {
              color,
            },
            emphasis: {
              itemStyle: {
                color,
              },
            },
          };
        }),
      ),
    }),
    [categoryColors, palette],
  );

  const getOptions = useMemo(
    () => ({
      tooltip: {
        formatter: (params) => {
          const { seriesIndex, name, value } = params;

          if (seriesIndex === 0) {
            return `${name}: ${value}%`;
          }

          const parentValue = params.data.parentValue;
          const relativePercentage = ((value / parentValue) * 100).toFixed(1);

          return `${name}: ${relativePercentage}% of ${params.data.parentName} users`;
        },
      },

      legend: {
        data: ['Desktop', 'Tablet', 'Mobile'],
        show: false,
      },

      series: [
        {
          name: 'User by OS',
          type: 'pie',
          radius: ['55%', '85%'],
          selectedMode: 'single',
          padAngle: 2,
          itemStyle: {
            borderRadius: 4,
          },
          emphasis: {
            scaleSize: 2,
          },
          label: {
            show: false,
          },
          labelLine: { show: false },
          data: processedData.outer,
          select: {
            disabled: true,
          },
        },
        {
          name: 'Usersss by OS',
          type: 'pie',
          radius: ['90%', '96%'],
          barWidth: 10,
          padAngle: 1,
          itemStyle: {
            borderRadius: 2,
          },
          emphasis: {
            scaleSize: 2,
          },
          label: {
            show: false,
          },
          labelLine: { show: false },
          data: processedData.inner,
          select: {
            disabled: true,
          },
        },
      ],
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
    }),
    [processedData],
  );

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 5,
        height: 214,
        width: 240,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <ReactEchart
        ref={ref}
        echarts={echarts}
        option={getOptions}
        sx={{ height: '134px !important', width: 134, ...sx }}
      />
    </Paper>
  );
};

export default PieChartCard;
