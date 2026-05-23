import { users } from 'data/users';

export const payRunSummary = {
  payrollCost: '$8.2M',
  costDetails: [
    { label: 'Employee Pay', value: '$ 7.2M' },
    { label: 'Work Hours', value: '1200 Hrs' },
    { label: 'Employees', value: '27' },
    { label: 'Tax Paid', value: '$ 2.2M' },
  ],
};

export const payrollTotals = [
  {
    id: 1,
    name: 'Direct Deposit',
    autoPay: 9310.05,
    manualPay: 0,
  },
  {
    id: 2,
    name: 'Printed Checks',
    autoPay: 0,
    manualPay: 12716.88,
  },
  {
    id: 3,
    name: 'Taxes',
    autoPay: 9085.41,
    manualPay: 0,
  },
  {
    id: 4,
    name: 'Payroll Deductions',
    autoPay: 3296.09,
    manualPay: 0,
  },
  {
    id: 5,
    name: 'Processing Fees',
    autoPay: 140,
    manualPay: 556.47,
  },
  {
    id: 6,
    name: 'Additional Charges',
    autoPay: 73.23,
    manualPay: 0,
  },
];

export const employeeSummaryData = [
  {
    id: 1,
    employee: { ...users[3], empId: 'EMP002' },
    totalHours: 150,
    totalGross: 10000,
    totalDeduction: 1000,
  },
  {
    id: 2,
    employee: { ...users[15], empId: 'EMP006' },
    totalHours: 172,
    totalGross: 8000,
    totalDeduction: 500,
  },
  {
    id: 3,
    employee: { ...users[5], empId: 'EMP007' },
    totalHours: 160,
    totalGross: 10000,
    totalDeduction: 500,
  },
  {
    id: 4,
    employee: { ...users[14], empId: 'EMP003' },
    totalHours: 155,
    totalGross: 6000,
    totalDeduction: 600,
  },
  {
    id: 5,
    employee: { ...users[1], empId: 'EMP005' },
    totalHours: 165,
    totalGross: 20000,
    totalDeduction: 500,
  },
  {
    id: 6,
    employee: { ...users[6], empId: 'EMP004' },
    totalHours: 170,
    totalGross: 16000,
    totalDeduction: 400,
  },
];

export const taxSummaryData = [
  {
    id: 1,
    employees: 'Federal Income Tax',
    employeeTaxes: 10000,
    companyTaxes: 500,
  },
  {
    id: 2,
    employees: 'Social Security',
    employeeTaxes: 10000,
    companyTaxes: 500,
  },
  {
    id: 3,
    employees: 'Medicare',
    employeeTaxes: 10000,
    companyTaxes: 500,
  },
  {
    id: 4,
    employees: 'Additional Medicare',
    employeeTaxes: 10000,
    companyTaxes: 500,
  },
  {
    id: 5,
    employees: 'CA ETT',
    employeeTaxes: 10000,
    companyTaxes: 500,
  },
  {
    id: 6,
    employees: 'CA SDI',
    employeeTaxes: 10000,
    companyTaxes: 500,
  },
];
