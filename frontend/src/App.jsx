import { useAuth } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import Header from "./components/layout/Header";
import Spinner from "./components/ui/Spinner";
import { useLocation } from "react-router-dom";

function App() {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#f1f5f9" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" } },
        }}
      />

      {!isAuthPage && isAuthenticated && <Header />}

      <main className={`${!isAuthPage && isAuthenticated ? "pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" : ""}`}>
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
