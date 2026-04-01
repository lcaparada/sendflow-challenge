import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import LoginPage from "./pages/login.page";
import RegisterPage from "./pages/register.page";
import ConnectionsPage from "./pages/connections.page";
import ContactsPage from "./pages/contacts.page";
import MessagesPage from "./pages/messages.page";
import Layout from "./components/layout";
import ProtectedRoute from "./components/protected-route";
import { useAuth } from "./hooks/use-auth";

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
