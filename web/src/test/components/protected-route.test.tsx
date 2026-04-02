import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../components/protected-route";

vi.mock("../../hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../hooks/use-auth";

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  it("shows loading spinner while auth is loading", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });
    renderProtectedRoute();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "user-1" } as never,
      loading: false,
    });
    renderProtectedRoute();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /login when user is not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });
    renderProtectedRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("does not render children while loading", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });
    renderProtectedRoute();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
