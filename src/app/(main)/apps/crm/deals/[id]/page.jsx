import DealDetails from 'components/sections/crm/deal-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return <DealDetails dealId={id} />;
};

export default Page;
