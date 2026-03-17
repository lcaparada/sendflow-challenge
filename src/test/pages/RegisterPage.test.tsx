import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../../pages/RegisterPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../functions/auth", () => ({
  register: vi.fn(),
}));

import { register } from "../../functions/auth";

const renderPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );

const fillForm = (email: string, password: string, confirm: string) => {
  fireEvent.change(screen.getByLabelText(/^e-mail/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^senha/i), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
    target: { value: confirm },
  });
};

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderPage();
    expect(screen.getByLabelText(/^e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    renderPage();
    fillForm("user@test.com", "123456", "654321");
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    });
    expect(register).not.toHaveBeenCalled();
  });

  it("shows error when password is shorter than 6 characters", async () => {
    renderPage();
    fillForm("user@test.com", "123", "123");
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
    });
    expect(register).not.toHaveBeenCalled();
  });

  it("navigates to /connections on successful registration", async () => {
    vi.mocked(register).mockResolvedValueOnce(undefined as never);
    renderPage();
    fillForm("user@test.com", "123456", "123456");
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/connections");
    });
  });

  it("shows error when Firebase registration fails", async () => {
    vi.mocked(register).mockRejectedValueOnce(
      new Error("email already in use"),
    );
    renderPage();
    fillForm("existing@test.com", "123456", "123456");
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/não foi possível criar a conta/i),
      ).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
