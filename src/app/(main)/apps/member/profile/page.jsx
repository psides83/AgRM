import paths from 'routes/paths';
import BackToListButton from 'components/base/BackToListButton';
import MemberProfile from 'components/sections/member/views/MemberProfile';

const Page = () => (
  <>
    <BackToListButton fallbackHref={paths.members} fallbackLabel="Members" />
    <MemberProfile />
  </>
);

export default Page;
