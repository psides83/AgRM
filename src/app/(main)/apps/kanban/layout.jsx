import KanbanProvider from 'providers/KanbanProvider';

const Layout = ({ children }) => {
  return <KanbanProvider>{children}</KanbanProvider>;
};

export default Layout;
