import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import UnifiedDashboard from "./components/UnifiedDashboard";
import Login from "./components/Login";
import ActivateAccount from "./components/ActivateAccount";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import "./App.css";
import "./styles/Dashboards.css";

function AppContent() {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const publicPages = {
    "/activate-account": <ActivateAccount />,
    "/signup": <Signup />,
    "/login": <Login />,
    "/forgot-password": <ForgotPassword />,
    "/reset-password": <ResetPassword />,
  };

  if (publicPages[currentPath]) {
    return publicPages[currentPath];
  }

  if (user) {
    return <UnifiedDashboard />;
  }

  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
