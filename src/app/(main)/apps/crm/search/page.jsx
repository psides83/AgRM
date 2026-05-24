import CRMSearch from 'components/sections/crm/search';

const Page = async ({ searchParams }) => {
  const params = await searchParams;

  return <CRMSearch query={params?.q || ''} />;
};

export default Page;
