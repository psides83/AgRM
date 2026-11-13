import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import JobDetails from 'components/sections/hiring/candidate/job-details';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.hiringJobList} fallbackLabel="Jobs" />
      <JobDetails />
    </>
  );
};

export default Page;
