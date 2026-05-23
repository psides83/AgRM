'use client';

import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import ForgotPasswordForm from 'components/sections/authentications/common/ForgotPasswordForm';

const ForgotPassword = () => {
  const handleSendResetLink = async (data) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}${paths.defaultJwtSetPassword}`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Password reset link sent.' };
  };

  return <ForgotPasswordForm handleSendResetLink={handleSendResetLink} />;
};

export default ForgotPassword;
