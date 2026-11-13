import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import Invoice from 'components/sections/ecommerce/admin/invoice';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.adminInvoiceList} fallbackLabel="Invoices" />
      <Invoice />
    </>
  );
};

export default Page;
