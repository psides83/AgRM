import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import ContactDetails from 'components/sections/crm/contact-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return (
    <>
      <BackToListButton fallbackHref={paths.contacts} fallbackLabel="Contacts" />
      <ContactDetails contactId={id} />
    </>
  );
};

export default Page;
