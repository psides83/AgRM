import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import OrderDetails from 'components/sections/ecommerce/customer/order-details';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.orderList} fallbackLabel="Orders" />
      <OrderDetails />
    </>
  );
};

export default Page;
