import CompanyDetails from 'components/sections/crm/company-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return <CompanyDetails companyId={id} />;
};

export default Page;
