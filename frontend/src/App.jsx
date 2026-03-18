import { Navigate, Route, Routes } from "react-router-dom";

import Loader from "./components/Loader";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
