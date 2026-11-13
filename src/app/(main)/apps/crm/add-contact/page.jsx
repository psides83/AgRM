import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import AddContact from 'components/sections/crm/add-contact';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.contacts} fallbackLabel="Contacts" />
      <AddContact />
    </>
  );
};

export default Page;
