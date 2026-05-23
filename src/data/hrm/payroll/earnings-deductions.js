import { users } from 'data/users';

export const earningsDeductions = [
  {
    id: 1,
    employee: { ...users[0], wage: '$12,500/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 10 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 1000 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 2,
    employee: { ...users[1], wage: '$15,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 50 },
      { label: 'Housing allowance', amount: 35 },
      { label: 'Housing allowance', amount: 35 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 500 },
      { label: 'Benefit', amount: 200 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 3,
    employee: { ...users[2], wage: '$18,000/yr' },
    hours: { regular: 40, overtime: 0 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
    ],
    deduction: [{ label: 'Tax', amount: 1000 }],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 4,
    employee: { ...users[3], wage: '$25,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 1000 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 500 },
      { label: 'Benefit', amount: 100 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 5,
    employee: { ...users[4], wage: '$22,500/yr' },
    hours: { regular: 40, overtime: 0 },
    extraPay: [
      { label: 'Bonus', amount: 200 },
      { label: 'Commission', amount: 1000 },
    ],
    deduction: [{ label: 'Tax', amount: 1000 }],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 6,
    employee: { ...users[5], wage: '$30.00/hr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [{ label: 'Bonus', amount: 1000 }],
    deduction: [{ label: 'Benefit', amount: 1000 }],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 7,
    employee: { ...users[6], wage: '$20,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 1000 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 1000 },
      { label: 'Benefit', amount: 1000 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 8,
    employee: { ...users[7], wage: '$12,500/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 10 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 1000 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 9,
    employee: { ...users[8], wage: '$15,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 50 },
      { label: 'Housing allowance', amount: 35 },
      { label: 'Housing allowance', amount: 35 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 500 },
      { label: 'Benefit', amount: 200 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 10,
    employee: { ...users[9], wage: '$18,000/yr' },
    hours: { regular: 40, overtime: 0 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
    ],
    deduction: [{ label: 'Tax', amount: 1000 }],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 11,
    employee: { ...users[10], wage: '$25,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 1000 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 500 },
      { label: 'Benefit', amount: 100 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 12,
    employee: { ...users[11], wage: '$22,500/yr' },
    hours: { regular: 40, overtime: 0 },
    extraPay: [
      { label: 'Bonus', amount: 200 },
      { label: 'Commission', amount: 1000 },
    ],
    deduction: [{ label: 'Tax', amount: 1000 }],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 13,
    employee: { ...users[12], wage: '$30.00/hr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [{ label: 'Bonus', amount: 1000 }],
    deduction: [{ label: 'Benefit', amount: 1000 }],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 14,
    employee: { ...users[13], wage: '$20,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 1000 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 1000 },
      { label: 'Benefit', amount: 1000 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 15,
    employee: { ...users[14], wage: '$12,500/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 1000 },
      { label: 'Housing allowance', amount: 10 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 1000 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
  {
    id: 16,
    employee: { ...users[15], wage: '$15,000/yr' },
    hours: { regular: 40, overtime: 10 },
    extraPay: [
      { label: 'Bonus', amount: 1000 },
      { label: 'Commission', amount: 50 },
      { label: 'Housing allowance', amount: 35 },
      { label: 'Housing allowance', amount: 35 },
    ],
    deduction: [
      { label: 'Tax', amount: 1000 },
      { label: 'Home loan', amount: 500 },
      { label: 'Benefit', amount: 200 },
    ],
    netPayType: { amount: 20000, type: 'Direct Deposit' },
  },
];
