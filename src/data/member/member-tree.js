import { membersListData } from './member-list';

const m = (idNo) => membersListData.find((m) => m.idNo === idNo);

export const membersTreeData = {
  id: 'EMP001',
  data: m('EMP001'),
  children: [
    {
      id: 'EMP002',
      data: m('EMP002'),
      children: [
        {
          id: 'EMP008',
          data: m('EMP008'),
        },
        {
          id: 'EMP014',
          data: m('EMP014'),
        },
        {
          id: 'EMP015',
          data: m('EMP015'),
        },
      ],
    },
    {
      id: 'EMP004',
      data: m('EMP004'),
      children: [
        {
          id: 'EMP011',
          data: m('EMP011'),
        },
      ],
    },
    {
      id: 'EMP003',
      data: m('EMP003'),
      children: [
        {
          id: 'EMP012',
          data: m('EMP012'),
        },
        {
          id: 'EMP013',
          data: m('EMP013'),
        },
      ],
    },
    {
      id: 'EMP007',
      data: m('EMP007'),
    },
    {
      id: 'EMP006',
      data: m('EMP006'),
    },
  ],
};
