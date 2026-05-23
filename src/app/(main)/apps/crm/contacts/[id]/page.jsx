import ContactDetails from 'components/sections/crm/contact-details';

const Page = async ({ params }) => {
  const { id } = await params;

  return <ContactDetails contactId={id} />;
};

export default Page;
