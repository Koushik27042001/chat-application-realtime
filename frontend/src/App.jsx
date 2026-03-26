import { Navigate, Route, Routes } from "react-router-dom";

import Loader from "./components/Loader";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanelLogin from "./pages/AdminPanelLogin";
import Chat from "./pages/Chat";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import OtpReset from "./pages/OtpReset";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isHydrated, token } = useAuth();

  if (!isHydrated) {
    return <Loader label="Restoring your workspace..." fullScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isHydrated, token } = useAuth();

  if (!isHydrated) {
    return <Loader label="Preparing chat..." fullScreen />;
  }

  if (token) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isHydrated, token, user } = useAuth();

  if (!isHydrated) {
    return <Loader label="Verifying access..." fullScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/otp-reset" element={<OtpReset />} />
      <Route path="/admin/:panelSecret/login" element={<AdminPanelLogin />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default App;
