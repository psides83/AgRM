'use client';

import { apiEndpoints } from 'routes/paths';
import useSWR from 'swr';
import { productFetcher } from '../dummyFetcher';

// import axiosFetcher from 'services/axios/axiosFetcher';

export const useGetProduct = (productId, config) => {
  const swr = useSWR(
    [apiEndpoints.getProduct(productId), { productId }],
    //In your real project use axiosFetcher instead of dummy productFetcher
    productFetcher,
    {
      suspense: false,
      revalidateOnMount: true,
      ...config,
    },
  );

  return swr;
};
