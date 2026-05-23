import { products } from 'data/e-commerce/products';

export const sendPasswordResetLinkFetcher = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('success');
    }, 1000);
  });

export const productFetcher = (args) => {
  const [_url, { productId }] = args;

  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((product) => product.id === Number(productId));

      resolve(product || null);
    }, 1000);
  });
};
