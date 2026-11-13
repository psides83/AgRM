import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import Order from 'components/sections/ecommerce/admin/order';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.adminOrderList} fallbackLabel="Orders" />
      <Order />
    </>
  );
};

export default Page;
