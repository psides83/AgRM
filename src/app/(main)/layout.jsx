import MainLayout from 'layouts/main-layout';
import MainAuthGuard from 'layouts/main-layout/MainAuthGuard';

const Layout = ({ children }) => {
  return (
    <MainAuthGuard>
      <MainLayout>{children}</MainLayout>
    </MainAuthGuard>
  );
};

export default Layout;
