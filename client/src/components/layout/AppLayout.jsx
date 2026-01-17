import { Layout } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

const { Content } = Layout;

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <Layout className="app-layout">
      {!isAdminPath && <Header />}
      <Content className="app-content">{children}</Content>
      {!isAdminPath && <Footer />}
    </Layout>
  );
};

export default AppLayout;
