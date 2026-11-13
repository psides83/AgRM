import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import LeadDetails from 'components/sections/crm/lead-details';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.leads} fallbackLabel="Leads" />
      <LeadDetails />
    </>
  );
};

export default Page;
