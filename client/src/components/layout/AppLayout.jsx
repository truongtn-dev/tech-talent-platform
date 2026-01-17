import { Layout } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

const { Content } = Layout;

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isModulePath =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/recruiter") ||
    location.pathname.startsWith("/interviewer");

  return (
    <Layout className="app-layout">
      {!isModulePath && <Header />}
      <Content className="app-content">{children}</Content>
      {!isModulePath && <Footer />}
    </Layout>
  );
};

export default AppLayout;
