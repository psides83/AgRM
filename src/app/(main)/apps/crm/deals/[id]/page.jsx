import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import DealDetails from 'components/sections/crm/deal-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return (
    <>
      <BackToListButton fallbackHref={paths.deals} fallbackLabel="Deals" />
      <DealDetails dealId={id} />
    </>
  );
};

export default Page;
