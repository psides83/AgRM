import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import ProductDetails from 'components/sections/ecommerce/customer/product-details';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.products} fallbackLabel="Products" />
      <ProductDetails />
    </>
  );
};

export default Page;
