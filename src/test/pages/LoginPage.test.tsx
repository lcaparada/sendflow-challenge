import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../web/pages/LoginPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../functions/auth", () => ({
  login: vi.fn(),
}));

import { login } from "../../functions/auth";

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    renderPage();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("navigates to /connections on successful login", async () => {
    vi.mocked(login).mockResolvedValueOnce(undefined as never);
    renderPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/connections");
    });
  });

  it("shows error message when login fails", async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error("invalid"));
    renderPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  it("does not navigate when login fails", async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error("invalid"));
    renderPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
