import AppLayout from "./components/layout/AppLayout";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
