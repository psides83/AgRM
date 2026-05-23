import { useMemo } from 'react';
import { Paper } from '@mui/material';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { tooltipFormatterList } from 'helpers/echart-utils';
import { getPastDates } from 'lib/utils';
import { allPalettes, lightPalettes } from 'theme/palettes';
import ReactEchart from 'components/base/ReactEchart';
import { getThemePrimaryColors } from 'components/sections/dashboards/e-commerce/promo-slider/utils';

const data = {
  currentYear: [0, 400, 250, 300, 80, 600],
  lastYear: [100, 250, 150, 200, 400, 250],
};

echarts.use([TooltipComponent, GridComponent, LineChart, CanvasRenderer]);

const LineChartCard = ({ themePreset }) => {
  const isDark = !(themePreset in lightPalettes);

  const primaryPalette = getThemePrimaryColors(themePreset);
  const primaryColor = primaryPalette[isDark ? 400 : 500];

  const themePalette = allPalettes[themePreset];
  const neutralColor = themePalette.neutral.main;

  const getOptions = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        confine: false,
        position: (point, params, dom, rect, size) => {
          const [x, y] = point;
          const [tooltipWidth, tooltipHeight] = size.contentSize;
          const [chartWidth, chartHeight] = size.viewSize;

          const posX = x + tooltipWidth > chartWidth ? x - tooltipWidth - 10 : x + 10;
          const posY = Math.max(
            10,
            Math.min(y - tooltipHeight / 2, chartHeight - tooltipHeight - 10),
          );

          return [posX, posY];
        },
        formatter: (params) => tooltipFormatterList(params, true),
      },
      xAxis: {
        type: 'category',
        data: getPastDates(7).map((date) => dayjs(date).format('MMM DD')),
        show: false,
        boundaryGap: false,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        show: false,
        type: 'value',
        boundaryGap: false,
        axisLabel: {
          show: false,
        },
      },
      series: [
        {
          name: 'Current year',
          type: 'line',
          data: data.currentYear,
          showSymbol: false,
          symbol: 'circle',
          zlevel: 1,
          lineStyle: {
            width: 3,
            color: primaryColor,
          },
          emphasis: {
            lineStyle: {
              color: primaryColor,
            },
          },
          itemStyle: {
            color: primaryColor,
          },
        },
        {
          name: 'Last year',
          type: 'line',
          data: data.lastYear,
          showSymbol: false,
          symbol: 'circle',
          lineStyle: {
            width: 1,
            color: neutralColor,
          },
          emphasis: {
            lineStyle: {
              color: neutralColor,
            },
          },
          itemStyle: {
            color: neutralColor,
          },
        },
      ],
      grid: {
        outerBoundsMode: 'same',
        outerBoundsContain: 'axisLabel',
        right: -30,
        left: 5,
        bottom: 5,
        top: 5,
      },
    }),
    [primaryColor, neutralColor, data, themePreset],
  );

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 4,
        p: 5,
        outline: 'none',
        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.grey[950]}`,
      }}
    >
      <ReactEchart echarts={echarts} option={getOptions} sx={{ height: '200px !important' }} />
    </Paper>
  );
};

export default LineChartCard;
