import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import CandidateDetails from 'components/sections/hiring/admin/candidate-details';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.hiringPipeline} fallbackLabel="Pipeline" />
      <CandidateDetails />
    </>
  );
};

export default Page;
