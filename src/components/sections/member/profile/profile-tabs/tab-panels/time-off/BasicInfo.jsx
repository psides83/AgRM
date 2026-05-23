'use client';
import { useMemo, useRef } from 'react';
import { Box, ButtonBase, Stack, Typography, useTheme } from '@mui/material';
import { PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import useToggleChartLegends from 'hooks/useToggleChartLegends';
import { useSettingsContext } from 'providers/SettingsProvider';
import ReactEchart from 'components/base/ReactEchart';

echarts.use([TooltipComponent, GridComponent, PieChart, CanvasRenderer, LegendComponent]);
const BasicInfo = ({ data }) => {
  const chartRef = useRef(null);
  const { vars, typography } = useTheme();
  const { getThemeColor } = useSettingsContext();
  const { legendState, handleLegendToggle } = useToggleChartLegends(chartRef);
  const colors = [
    getThemeColor(vars.palette.chBlue[200]),
    getThemeColor(vars.palette.chOrange[400]),
    getThemeColor(vars.palette.chLightBlue[300]),
    getThemeColor(vars.palette.chGreen[400]),
  ];
  const getOptions = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: data.map((item) => item.label),
        show: false,
      },
      grid: { outerBoundsMode: 'same', outerBoundsContain: 'axisLabel' },
      series: [
        {
          name: 'Basic Info',
          type: 'pie',
          radius: ['55%', '95%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          color: colors,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: typography.h4.fontSize,
              fontWeight: typography.h4.fontWeight,
              formatter: `{c}`,
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item) => ({ name: item.label, value: item.value })),
        },
      ],
    }),
    [getThemeColor, vars, data, typography],
  );
  return (
    <Stack direction="column" gap={2} sx={{ width: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Basic Info
      </Typography>
      <Stack direction="column" gap={3}>
        <Box>
          <ReactEchart
            ref={chartRef}
            echarts={echarts}
            option={getOptions}
            sx={{ height: '160px !important' }}
          />
        </Box>
        <Stack direction="column" gap={1}>
          {data.map((item, index) => (
            <ButtonBase
              key={index}
              disableRipple
              sx={{
                alignItems: 'center',
                gap: 2,
                opacity: legendState[item.label] ? 0.5 : 1,
              }}
              onClick={() => handleLegendToggle(item.label)}
            >
              <Box
                sx={{
                  width: 4,
                  height: 32,
                  bgcolor: colors[index] || 'primary.main',
                  borderRadius: 0.5,
                }}
              />
              <Stack
                gap={1}
                sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                  {item.value}
                </Typography>
              </Stack>
            </ButtonBase>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
export default BasicInfo;
