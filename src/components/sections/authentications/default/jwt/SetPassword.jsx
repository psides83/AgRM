'use client';

import { useResetPassword } from 'services/swr/api-hooks/useAuthApi';
import SetPasswordForm from 'components/sections/authentications/default/SetPassworForm';

const SetPassword = () => {
  const { trigger: resetPassword } = useResetPassword();

  const handleSetPassword = async (data) => {
    return await resetPassword(data).catch((error) => {
      throw new Error(error.data.message);
    });
  };

  return <SetPasswordForm handleSetPassword={handleSetPassword} />;
};

export default SetPassword;
