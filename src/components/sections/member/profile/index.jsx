import Box from '@mui/material/Box';
import { profileSummaryData } from 'data/member/profile';
import ProfileSummary from './ProfileSummary';
import ProfileTabsSection from './profile-tabs';

const MemberProfileMain = () => {
  return (
    <Box sx={{ px: { xs: 1, sm: 4, md: 5 }, mt: -2.25, position: 'relative', zIndex: 1 }}>
      <ProfileSummary data={profileSummaryData} sx={{ mb: 2 }} />
      <ProfileTabsSection />
    </Box>
  );
};
export default MemberProfileMain;
