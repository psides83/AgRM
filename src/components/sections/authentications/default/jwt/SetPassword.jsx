'use client';

import { createClient } from 'lib/supabase/client';
import SetPasswordForm from 'components/sections/authentications/default/SetPassworForm';

const SetPassword = () => {
  const handleSetPassword = async (data) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Password updated.' };
  };

  return <SetPasswordForm handleSetPassword={handleSetPassword} />;
};

export default SetPassword;
