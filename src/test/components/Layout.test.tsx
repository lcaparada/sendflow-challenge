import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Layout from "../../web/components/Layout";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../functions/auth", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

import { logout } from "../../functions/auth";

const renderAtPath = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/connections" element={<Layout><div>Page Content</div></Layout>} />
        <Route
          path="/connections/:connectionId/contacts"
          element={<Layout><div>Page Content</div></Layout>}
        />
        <Route
          path="/connections/:connectionId/messages"
          element={<Layout><div>Page Content</div></Layout>}
        />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the brand name", () => {
    renderAtPath("/connections");
    expect(screen.getByText("SendFlow")).toBeInTheDocument();
  });

  it("renders children content", () => {
    renderAtPath("/connections");
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("always shows Conexões nav item", () => {
    renderAtPath("/connections");
    expect(screen.getByText("Conexões")).toBeInTheDocument();
  });

  it("always shows Sair button", () => {
    renderAtPath("/connections");
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("hides Contatos and Mensagens when no connection is selected", () => {
    renderAtPath("/connections");
    expect(screen.queryByText("Contatos")).not.toBeInTheDocument();
    expect(screen.queryByText("Mensagens")).not.toBeInTheDocument();
  });

  it("shows Contatos and Mensagens when a connection is selected", () => {
    renderAtPath("/connections/conn-1/contacts");
    expect(screen.getByText("Contatos")).toBeInTheDocument();
    expect(screen.getByText("Mensagens")).toBeInTheDocument();
  });

  it("navigates to /connections when clicking Conexões", () => {
    renderAtPath("/connections");
    fireEvent.click(screen.getByText("Conexões"));
    expect(mockNavigate).toHaveBeenCalledWith("/connections");
  });

  it("navigates to contacts when clicking Contatos", () => {
    renderAtPath("/connections/conn-1/contacts");
    fireEvent.click(screen.getByText("Contatos"));
    expect(mockNavigate).toHaveBeenCalledWith("/connections/conn-1/contacts");
  });

  it("navigates to messages when clicking Mensagens", () => {
    renderAtPath("/connections/conn-1/messages");
    fireEvent.click(screen.getByText("Mensagens"));
    expect(mockNavigate).toHaveBeenCalledWith("/connections/conn-1/messages");
  });

  it("calls logout and navigates to /login when clicking Sair", async () => {
    renderAtPath("/connections");
    fireEvent.click(screen.getByText("Sair"));
    await vi.waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
