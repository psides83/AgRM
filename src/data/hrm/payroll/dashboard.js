export const currentPayrollRun = {
  start: '2025-03-01',
  end: '2025-03-31',
  payDate: '2025-03-25',
  paySchedule: 'Monthly',
  approvePayroll: '2025-03-25',
  employeeNo: 27,
};

export const paySummaryKpis = [
  { id: 1, title: 'Gross Pay', value: '$8.2M', icon: 'material-symbols:request-quote-outline' },
  { id: 2, title: 'Employee Pay', value: '$7.2M', icon: 'material-symbols:payments-outline' },
  { id: 3, title: 'Tax', value: '$1.2M', icon: 'material-symbols:attach-money' },
  { id: 4, title: 'Employees', value: '100', icon: 'material-symbols:person-outline' },
];

export const payrollHistoryData = [
  { id: 1, start: '2025-02-01', end: '2025-02-28', status: 'pending' },
  { id: 2, start: '2025-01-01', end: '2025-01-31', status: 'completed' },
  { id: 3, start: '2024-12-01', end: '2024-12-31', status: 'completed' },
  { id: 4, start: '2024-11-01', end: '2024-11-30', status: 'completed' },
  { id: 5, start: '2024-10-01', end: '2024-10-31', status: 'completed' },
  { id: 6, start: '2024-09-01', end: '2024-09-30', status: 'completed' },
];

export const payrollCostSummaryData = [
  { period: 'Jan', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  { period: 'Feb', stats: { netPay: 20, tax: 9, extraPay: 3, otherDeduction: 2 } },
  { period: 'Mar', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  { period: 'Apr', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 1 } },
  { period: 'May', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  { period: 'Jun', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  { period: 'Jul', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 3 } },
  { period: 'Aug', stats: { netPay: 20, tax: 8, extraPay: 4, otherDeduction: 2 } },
  { period: 'Sep', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 3 } },
  { period: 'Oct', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  { period: 'Nov', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  { period: 'Dec', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
];

export const costSummaryData = {
  previous_year: [
    { period: 'Jan', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Feb', stats: { netPay: 20, tax: 9, extraPay: 3, otherDeduction: 2 } },
    { period: 'Mar', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Apr', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 1 } },
    { period: 'May', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Jun', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Jul', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 3 } },
    { period: 'Aug', stats: { netPay: 20, tax: 8, extraPay: 4, otherDeduction: 2 } },
    { period: 'Sep', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 3 } },
    { period: 'Oct', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Nov', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Dec', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  ],
  this_year: [
    { period: 'Jan', stats: { netPay: 20, tax: 9, extraPay: 3, otherDeduction: 2 } },
    { period: 'Feb', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Mar', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 1 } },
    { period: 'Apr', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'May', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Jun', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 3 } },
    { period: 'Jul', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Aug', stats: { netPay: 20, tax: 8, extraPay: 4, otherDeduction: 2 } },
    { period: 'Sep', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Oct', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
    { period: 'Nov', stats: { netPay: 10, tax: 5, extraPay: 2, otherDeduction: 3 } },
    { period: 'Dec', stats: { netPay: 25, tax: 6, extraPay: 3, otherDeduction: 3 } },
  ],
};
