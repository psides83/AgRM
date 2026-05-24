import LeadDetails from 'components/sections/crm/lead-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return <LeadDetails leadId={id} />;
};

export default Page;
