import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import LeadDetails from 'components/sections/crm/lead-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return (
    <>
      <BackToListButton fallbackHref={paths.leads} fallbackLabel="Leads" />
      <LeadDetails leadId={id} />
    </>
  );
};

export default Page;
