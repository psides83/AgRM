'use client';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
} from '@mui/material';
import dayjs from 'dayjs';
import useNumberFormat from 'hooks/useNumberFormat';
import DashboardMenu from 'components/common/DashboardMenu';

const JobInfoTable = ({ data }) => {
  const { currencyFormat } = useNumberFormat();
  return (
    <div>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Job Information
      </Typography>

      <TableContainer component={Box} sx={{ borderRadius: 0, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHead
            sx={{
              [`& .${tableCellClasses.root}.${tableCellClasses.head}`]: {
                '&:first-of-type': {
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                },
                '&:last-of-type': {
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                },
              },
            }}
          >
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap', width: '1%' }}>Date</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell align="right">
                <DashboardMenu />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              [`& .${tableCellClasses.root}.${tableCellClasses.body}`]: {
                '&#job-date, &#job-department, &#job-salary, &#job-supervisor': {
                  fontWeight: 500,
                  color: 'text.primary',
                },
              },
            }}
          >
            {data.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  '&:last-of-type': {
                    [`& .${tableCellClasses.root}`]: { borderBottom: 0 },
                  },
                }}
              >
                <TableCell id="job-date" sx={{ whiteSpace: 'nowrap' }}>
                  {dayjs(item.date).format('DD MMM, YYYY')}
                </TableCell>
                <TableCell id="job-designation">{item.designation}</TableCell>
                <TableCell id="job-team">{item.team}</TableCell>
                <TableCell id="job-department">{item.department}</TableCell>
                <TableCell id="job-salary">
                  {currencyFormat(item.salary, { maximumFractionDigits: 0 })}/mo
                </TableCell>
                <TableCell id="job-supervisor">{item.supervisor}</TableCell>
                <TableCell id="job-action" align="right">
                  <DashboardMenu />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
export default JobInfoTable;
