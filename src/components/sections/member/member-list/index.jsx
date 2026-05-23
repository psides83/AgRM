'use client';

import { useState } from 'react';
import { Box, styled } from '@mui/material';
import { membersListData } from 'data/member/member-list';
import { membersTreeData } from 'data/member/member-tree';
import TopActionsSection from './TopActionsSection';
import MembersGridView from './grid-view';
import MembersListView from './list-view';
import MembersOrgChartView from './org-chart-view';

const MemberListMain = ({ toggleDrawer, isDrawerOpen }) => {
  const [tab, setTab] = useState('list');
  const handleChange = (_event, view) => setTab(view);
  return (
    <MemberListMainWrapper>
      <TopActionsSection
        tab={tab}
        handleChange={handleChange}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
      />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tab === 'list' && <MembersListView data={membersListData} />}
        {tab === 'grid' && <MembersGridView data={membersListData} />}
        {tab === 'org-chart' && <MembersOrgChartView data={membersTreeData} />}
      </Box>
    </MemberListMainWrapper>
  );
};

export default MemberListMain;

const MemberListMainWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: `${theme.spacing(0)} ${theme.spacing(3)} ${theme.spacing(5)}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(5),
  minHeight: 0,
  [theme.breakpoints.up('md')]: {
    padding: `${theme.spacing(0)} ${theme.spacing(5)} ${theme.spacing(5)}`,
  },
}));

export const getStatusChipColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Resigned':
      return 'error';
    case 'Intern':
      return 'warning';
    case 'Contract':
      return 'neutral';
    case 'Probation':
      return 'info';
    default:
      return 'primary';
  }
};
