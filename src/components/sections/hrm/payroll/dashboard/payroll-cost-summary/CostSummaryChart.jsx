import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { tooltipFormatterList } from 'helpers/echart-utils';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';

echarts.use([LegendComponent, TooltipComponent, BarChart, CanvasRenderer, GridComponent]);

const MIN_BAR_WIDTH = 44;
const MOBILE_CHART_MIN_WIDTH = 320;

const CostSummaryChart = ({ ref, data, sx }) => {
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { down } = useBreakpoints();
  const downSm = down('sm');

  const chartSx = useMemo(
    () => ({
      ...sx,
      ...(downSm && {
        minWidth: Math.max(MOBILE_CHART_MIN_WIDTH, data.length * MIN_BAR_WIDTH),
      }),
    }),
    [downSm, data.length, sx],
  );

  const option = useMemo(
    () => ({
      grid: { left: 25, right: 0, top: 10, bottom: 50 },
      tooltip: {
        formatter: (params) => tooltipFormatterList(params),
      },
      legend: {
        show: false,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.period),
        axisLabel: {
          rotate: 0,
          margin: 35,
          fontSize: 12,
          align: 'center',
          color: getThemeColor(vars.palette.text.secondary),
          fontFamily: typography.fontFamily,
          padding: [0, 0, 0, 5],
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: getThemeColor(vars.palette.text.disabled) },
        splitLine: {
          lineStyle: {
            color: getThemeColor(vars.palette.chGrey[200]),
          },
        },
      },
      series: [
        {
          name: 'Net Pay',
          type: 'bar',
          stack: 'total',
          barMaxWidth: 32,
          data: data.map((item) => item.stats.netPay),
          itemStyle: {
            borderWidth: 1,
            borderColor: vars.palette.background.elevation1,
            borderRadius: [0, 0, 0, 0],
            color: getThemeColor(vars.palette.chBlue[200]),
          },
        },
        {
          name: 'Tax',
          type: 'bar',
          stack: 'total',
          barMaxWidth: 32,
          data: data.map((item) => item.stats.tax),
          itemStyle: {
            borderWidth: 1,
            borderColor: getThemeColor(vars.palette.background.elevation1),
            borderRadius: [0, 0, 0, 0],
            color: getThemeColor(vars.palette.chLightBlue[200]),
          },
        },
        {
          name: 'Extra Pay',
          type: 'bar',
          stack: 'total',
          barMaxWidth: 32,
          data: data.map((item) => item.stats.extraPay),
          itemStyle: {
            borderWidth: 1,
            borderColor: getThemeColor(vars.palette.background.elevation1),
            borderRadius: [0, 0, 0, 0],
            color: getThemeColor(vars.palette.chLightBlue[100]),
          },
        },
        {
          name: 'Oth. Deduction',
          type: 'bar',
          stack: 'total',
          barMaxWidth: 32,
          data: data.map((item) => item.stats.otherDeduction),
          itemStyle: {
            borderWidth: 1,
            borderColor: getThemeColor(vars.palette.background.elevation1),
            borderRadius: [5, 5, 0, 0],
            color: getThemeColor(vars.palette.chOrange[100]),
          },
        },
      ],
    }),
    [vars.palette, data, getThemeColor, typography.fontFamily],
  );

  return <ReactEchart ref={ref} echarts={echarts} option={option} sx={chartSx} />;
};

export default CostSummaryChart;
