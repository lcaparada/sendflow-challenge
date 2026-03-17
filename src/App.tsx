import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import LoginPage from "./web/pages/LoginPage";
import RegisterPage from "./web/pages/RegisterPage";
import ConnectionsPage from "./web/pages/ConnectionsPage";
import ContactsPage from "./web/pages/ContactsPage";
import MessagesPage from "./web/pages/MessagesPage";
import Layout from "./web/components/Layout";
import ProtectedRoute from "./web/components/ProtectedRoute";
import { useAuth } from "./web/hooks/useAuth";

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <Layout>
              <ConnectionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections/:connectionId/contacts"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections/:connectionId/messages"
        element={
          <ProtectedRoute>
            <Layout>
              <MessagesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/connections" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
