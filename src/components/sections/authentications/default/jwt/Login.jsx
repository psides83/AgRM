'use client';

import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const handleLogin = async (data) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.defaultJwtSignup}
      forgotPasswordLink={paths.defaultJwtForgotPassword}
      socialAuth={false}
    />
  );
};

export default Login;
