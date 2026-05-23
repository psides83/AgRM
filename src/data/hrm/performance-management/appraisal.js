import { users } from 'data/users';

export const appraisalList = [
  {
    id: 0,
    member: { ...users[0], empId: 'EMP001' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[1],
    otherEvaluators: [users[2], users[3], users[4]],
    reviewProgress: 83,
    ratings: 1,
  },
  {
    id: 1,
    member: { ...users[1], empId: 'EMP031' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[2],
    otherEvaluators: [users[3], users[4], users[5]],
    reviewProgress: 83,
    ratings: 2,
  },
  {
    id: 2,
    member: { ...users[2], empId: 'EMP035' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[3],
    otherEvaluators: [users[4], users[5], users[6]],
    reviewProgress: 83,
    ratings: 3,
  },
  {
    id: 3,
    member: { ...users[3], empId: 'EMP037' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[4],
    otherEvaluators: [users[5], users[6], users[7]],
    reviewProgress: 83,
    ratings: 2,
  },
  {
    id: 4,
    member: { ...users[4], empId: 'EMP078' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[5],
    otherEvaluators: [users[6], users[7], users[8]],
    reviewProgress: 83,
    ratings: 3,
  },
  {
    id: 5,
    member: { ...users[5], empId: 'EMP071' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[6],
    otherEvaluators: [users[7], users[8], users[9]],
    reviewProgress: 83,
    ratings: 1,
  },
  {
    id: 6,
    member: { ...users[6], empId: 'EMP234' },
    appraisalCycle: '2024',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[7],
    otherEvaluators: [users[8], users[9], users[10]],
    reviewProgress: 83,
    ratings: 4,
  },
  {
    id: 7,
    member: { ...users[7], empId: 'EMP139' },
    appraisalCycle: '2024',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[8],
    otherEvaluators: [users[9], users[10], users[11]],
    reviewProgress: 83,
    ratings: 2,
  },
  {
    id: 8,
    member: { ...users[8], empId: 'EMP079' },
    appraisalCycle: '2024',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[9],
    otherEvaluators: [users[10], users[11], users[12]],
    reviewProgress: 83,
    ratings: 3,
  },
  {
    id: 9,
    member: { ...users[9], empId: 'EMP035' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[10],
    otherEvaluators: [users[11], users[12], users[13]],
    reviewProgress: 83,
    ratings: 3,
  },
  {
    id: 10,
    member: { ...users[10], empId: 'EMP037' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[11],
    otherEvaluators: [users[12], users[13], users[14]],
    reviewProgress: 83,
    ratings: 2,
  },
  {
    id: 11,
    member: { ...users[11], empId: 'EMP058' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[12],
    otherEvaluators: [users[13], users[14], users[15]],
    reviewProgress: 83,
    ratings: 3,
  },
  {
    id: 12,
    member: { ...users[12], empId: 'EMP082' },
    appraisalCycle: '2025',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[13],
    otherEvaluators: [users[14], users[15], users[0]],
    reviewProgress: 83,
    ratings: 1,
  },
  {
    id: 13,
    member: { ...users[13], empId: 'EMP217' },
    appraisalCycle: '2024',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[14],
    otherEvaluators: [users[15], users[0], users[1]],
    reviewProgress: 83,
    ratings: 4,
  },
  {
    id: 14,
    member: { ...users[14], empId: 'EMP139' },
    appraisalCycle: '2024',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[15],
    otherEvaluators: [users[0], users[1], users[2]],
    reviewProgress: 83,
    ratings: 2,
  },
  {
    id: 15,
    member: { ...users[15], empId: 'EMP023' },
    appraisalCycle: '2024',
    fromDate: new Date(2025, 1, 8),
    toDate: new Date(2025, 1, 15),
    mainEvaluator: users[0],
    otherEvaluators: [users[1], users[2], users[3]],
    reviewProgress: 83,
    ratings: 5,
  },
];

export const getStatusChipColor = (tag) => {
  switch (tag) {
    case 'Initiated':
      return 'info';
    case 'In Progress':
      return 'warning';
    case 'Completed':
      return 'success';
    case 'Closed':
      return 'neutral';
  }
};

export const appraisalCycles = [
  {
    id: 1,
    title: 'Bi-Annual Review – H2',
    reviewPeriod: {
      start: new Date(2025, 6, 1), // Jul 1, 2025
      end: new Date(2025, 11, 31), // Dec 31, 2025
    },
    startDate: new Date(2026, 0, 5), // Jan 5, 2026
    endDate: new Date(2026, 0, 25), // Jan 25, 2026
    status: 'Initiated',
  },
  {
    id: 2,
    title: 'Bi-Annual Review – H1',
    reviewPeriod: {
      start: new Date(2025, 0, 1), // Jan 1, 2025
      end: new Date(2025, 5, 30), // Jun 30, 2025
    },
    startDate: new Date(2025, 6, 1), // Jul 1, 2025
    endDate: new Date(2025, 6, 21), // Jul 21, 2025
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Leadership 360 – Q2',
    reviewPeriod: {
      start: new Date(2025, 0, 1), // Jan 1, 2025
      end: new Date(2025, 11, 31), // Dec 31, 2025
    },
    startDate: new Date(2025, 1, 14), // Feb 14, 2025
    endDate: new Date(2025, 1, 14), // Feb 14, 2025
    status: 'In Progress',
  },
  {
    id: 4,
    title: 'Project-Based Review – Alpha',
    reviewPeriod: {
      start: new Date(2025, 0, 1), // Jan 1, 2025
      end: new Date(2025, 0, 31), // Jan 31, 2025
    },
    startDate: new Date(2025, 1, 12), // Feb 12, 2025
    endDate: new Date(2025, 1, 16), // Feb 16, 2025
    status: 'Completed',
  },
  {
    id: 5,
    title: 'Probation Review – Batch A',
    reviewPeriod: {
      start: new Date(2024, 0, 1), // Jan 1, 2024
      end: new Date(2024, 11, 31), // Dec 31, 2024
    },
    startDate: new Date(2025, 0, 10), // Jan 10, 2025
    endDate: new Date(2025, 0, 14), // Jan 14, 2025
    status: 'Completed',
  },
  {
    id: 6,
    title: 'Annual Appraisal 2024',
    reviewPeriod: {
      start: new Date(2024, 0, 1), // Jan 1, 2024
      end: new Date(2024, 11, 31), // Dec 31, 2024
    },
    startDate: new Date(2025, 1, 14), // Feb 14, 2025
    endDate: new Date(2025, 1, 14), // Feb 14, 2025
    status: 'Closed',
  },
  {
    id: 7,
    title: 'Year-End Review',
    reviewPeriod: {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31),
    },
    startDate: new Date(2025, 1, 4), // Feb 4, 2025
    endDate: new Date(2025, 1, 14), // Feb 14, 2025
    status: 'Closed',
  },
  {
    id: 8,
    title: 'Q3 Performance Review',
    reviewPeriod: {
      start: new Date(2024, 7, 1), // Aug 1, 2024
      end: new Date(2024, 11, 31),
    },
    startDate: new Date(2025, 0, 14), // Jan 14, 2025
    endDate: new Date(2023, 1, 15), // Feb 15, 2023 (as in screenshot, older)
    status: 'Closed',
  },
  {
    id: 9,
    title: '9-Month Performance Review',
    reviewPeriod: {
      start: new Date(2024, 2, 1), // Mar 1, 2024
      end: new Date(2024, 11, 31),
    },
    startDate: new Date(2025, 0, 2), // Jan 2, 2025
    endDate: new Date(2025, 0, 10), // Jan 10, 2025
    status: 'Closed',
  },
  {
    id: 10,
    title: 'Q2 Performance Review',
    reviewPeriod: {
      start: new Date(2024, 6, 1), // Jul 1, 2024
      end: new Date(2024, 11, 31),
    },
    startDate: new Date(2025, 0, 14), // Jan 14, 2025
    endDate: new Date(2025, 0, 20), // Jan 20, 2025
    status: 'Closed',
  },
  {
    id: 11,
    title: 'Mid-Year Check-In',
    reviewPeriod: {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 6, 31), // Jul 31, 2024
    },
    startDate: new Date(2024, 7, 14), // Aug 14, 2024
    endDate: new Date(2024, 7, 24), // Aug 24, 2024
    status: 'Closed',
  },
  {
    id: 12,
    title: 'Q1 Performance Review',
    reviewPeriod: {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 5, 31), // Jun 31, 2024 (UI says Jun 31)
    },
    startDate: new Date(2024, 5, 14), // Jun 14, 2024
    endDate: new Date(2024, 6, 14), // Jul 14, 2024
    status: 'Closed',
  },
];
