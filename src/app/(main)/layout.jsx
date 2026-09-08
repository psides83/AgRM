import { redirect } from 'next/navigation';
import MainLayout from 'layouts/main-layout';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/server';

const Layout = async ({ children }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(paths.defaultJwtLogin);
  }

  return <MainLayout>{children}</MainLayout>;
};

export default Layout;
