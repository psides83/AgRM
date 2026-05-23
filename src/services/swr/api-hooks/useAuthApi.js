import { apiEndpoints } from 'routes/paths';
import axiosFetcher from 'services/axios/axiosFetcher';
import { sendPasswordResetLinkFetcher } from 'services/swr/dummyFetcher';
import useSWRMutation from 'swr/mutation';

export const useSendPasswordResetLink = () => {
  const mutation = useSWRMutation(
    [apiEndpoints.forgotPassword, { method: 'post' }],
    // axiosFetcher,
    sendPasswordResetLinkFetcher,
  );

  return mutation;
};

export const useResetPassword = () => {
  const mutation = useSWRMutation([apiEndpoints.setPassword, { method: 'post' }], axiosFetcher);

  return mutation;
};
