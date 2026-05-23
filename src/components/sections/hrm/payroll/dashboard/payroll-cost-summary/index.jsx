import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { costSummaryData } from 'data/hrm/payroll/dashboard';
import useToggleChartLegends from 'hooks/useToggleChartLegends';
import DashboardSelectMenu from 'components/common/DashboardSelectMenu';
import SectionHeader from 'components/common/SectionHeader';
import CostSummaryChart from './CostSummaryChart';

const chartLegends = [
  {
    label: 'Net Pay',
    color: 'chBlue.200',
  },
  {
    label: 'Tax',
    color: 'chLightBlue.200',
  },
  {
    label: 'Extra Pay',
    color: 'chLightBlue.100',
  },
  {
    label: 'Oth. Deduction',
    color: 'chOrange.100',
  },
];

const PayrollCostSummary = () => {
  const [data, setData] = useState(costSummaryData.previous_year);
  const chartRef = useRef(null);
  const { legendState, handleLegendToggle } = useToggleChartLegends(chartRef);

  return (
    <Paper sx={{ p: { xs: 3, md: 5 }, height: 1 }}>
      <SectionHeader
        title="Payroll Cost Summary"
        subTitle="Analayze payroll components at a glance"
        actionComponent={
          <DashboardSelectMenu
            defaultValue="previous_year"
            size="medium"
            options={[
              {
                label: 'Previous Year',
                value: 'previous_year',
              },
              {
                label: 'This Year',
                value: 'this_year',
              },
            ]}
            onChange={(value) => setData(costSummaryData[value])}
          />
        }
      />
      <Stack direction="column" gap={2}>
        <Stack
          sx={{
            gap: 2,
            alignItems: 'center',
            justifyContent: { xl: 'flex-end' },
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.5 }}
          >
            Reasons:
          </Typography>
          <Stack sx={{ gap: 2, alignItems: 'center' }}>
            {chartLegends.map(({ label, color }) => (
              <ButtonBase
                key={label}
                disableRipple
                onClick={() => handleLegendToggle(label)}
                sx={{
                  gap: 0.75,
                  alignItems: 'center',
                  opacity: legendState[label] ? 0.5 : 1,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: color,
                    borderRadius: 1,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{
                    textOverflow: 'ellipsis',
                    fontWeight: 500,
                    maxWidth: 1,
                  }}
                >
                  {label}
                </Typography>
              </ButtonBase>
            ))}
          </Stack>
        </Stack>

        <Box
          sx={{
            overflowX: 'auto',
          }}
        >
          <CostSummaryChart
            ref={chartRef}
            data={data}
            sx={{ height: '100% !important', minHeight: { xs: 365 }, width: 1 }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default PayrollCostSummary;
