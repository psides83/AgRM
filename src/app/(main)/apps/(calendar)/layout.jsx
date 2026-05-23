import CalendarProvider from 'providers/CalendarProvider';

const Layout = ({ children }) => {
  return <CalendarProvider>{children}</CalendarProvider>;
};

export default Layout;
