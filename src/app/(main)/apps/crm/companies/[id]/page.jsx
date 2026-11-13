import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import CompanyDetails from 'components/sections/crm/company-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return (
    <>
      <BackToListButton fallbackHref={paths.companies} fallbackLabel="Companies" />
      <CompanyDetails companyId={id} />
    </>
  );
};

export default Page;
