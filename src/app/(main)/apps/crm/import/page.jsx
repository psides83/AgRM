import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import CRMImport from 'components/sections/crm/import';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.contacts} fallbackLabel="Contacts" />
      <CRMImport />
    </>
  );
};

export default Page;
