import AppLayout from "./components/layout/AppLayout";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </>
  );
}

export default App;
