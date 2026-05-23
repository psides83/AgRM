'use client';

import { useRouter } from 'next/navigation';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';
import SignupForm from 'components/sections/authentications/default/SignupForm';

const SignUp = () => {
  const router = useRouter();

  const handleSignup = async (data) => {
    const [firstName, ...lastNameParts] = data.name.trim().split(/\s+/);
    const lastName = lastNameParts.join(' ');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language,
        },
        emailRedirectTo: `${window.location.origin}${paths.defaultJwtLogin}`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    router.push(paths.defaultJwtLogin);
    return { ok: true };
  };

  return <SignupForm handleSignup={handleSignup} socialAuth={false} />;
};

export default SignUp;
