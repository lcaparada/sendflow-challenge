import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConnectionsPage from "../../pages/ConnectionsPage";
import type { Connection } from "../../types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../web/hooks/useAuth", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
}));

vi.mock("../../functions", () => ({
  subscribeToConnections: vi.fn(),
  createConnection: vi.fn().mockResolvedValue(undefined),
  updateConnection: vi.fn().mockResolvedValue(undefined),
  deleteConnection: vi.fn().mockResolvedValue(undefined),
}));

import {
  subscribeToConnections,
  createConnection,
  updateConnection,
  deleteConnection,
} from "../../functions";

const makeConnection = (overrides: Partial<Connection> = {}): Connection => ({
  id: "conn-1",
  userId: "user-1",
  name: "My Connection",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

const renderWithConnections = (connections: Connection[] = []) => {
  vi.mocked(subscribeToConnections).mockImplementation((_uid, callback) => {
    callback(connections);
    return vi.fn();
  });
  return render(
    <MemoryRouter>
      <ConnectionsPage />
    </MemoryRouter>,
  );
};

describe("ConnectionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when there are no connections", () => {
    renderWithConnections([]);
    expect(screen.getByText(/nenhuma conexão ainda/i)).toBeInTheDocument();
  });

  it("renders a list of connections", () => {
    renderWithConnections([
      makeConnection({ id: "1", name: "Connection A" }),
      makeConnection({ id: "2", name: "Connection B" }),
    ]);
    expect(screen.getByText("Connection A")).toBeInTheDocument();
    expect(screen.getByText("Connection B")).toBeInTheDocument();
  });

  it("opens create dialog when clicking the button", async () => {
    renderWithConnections([]);
    fireEvent.click(
      screen.getAllByRole("button", { name: /nova conexão/i })[0],
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("calls createConnection on save", async () => {
    renderWithConnections([]);
    fireEvent.click(
      screen.getAllByRole("button", { name: /nova conexão/i })[0],
    );

    await waitFor(() => screen.getByLabelText(/nome da conexão/i));
    fireEvent.change(screen.getByLabelText(/nome da conexão/i), {
      target: { value: "New Connection" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(createConnection).toHaveBeenCalledWith("user-1", "New Connection");
    });
  });

  it("opens edit dialog pre-filled with connection name", async () => {
    renderWithConnections([makeConnection({ name: "Edit Me" })]);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Edit Me")).toBeInTheDocument();
    });
  });

  it("calls updateConnection on save when editing", async () => {
    renderWithConnections([makeConnection({ id: "conn-1", name: "Old Name" })]);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    await waitFor(() => screen.getByDisplayValue("Old Name"));

    fireEvent.change(screen.getByDisplayValue("Old Name"), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(updateConnection).toHaveBeenCalledWith("conn-1", "New Name");
    });
  });

  it("calls deleteConnection after confirm", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithConnections([makeConnection({ id: "conn-1" })]);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      expect(deleteConnection).toHaveBeenCalledWith("conn-1");
    });
  });

  it("does not delete when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithConnections([makeConnection({ id: "conn-1" })]);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(deleteConnection).not.toHaveBeenCalled();
  });

  it("navigates to contacts when clicking a connection card", () => {
    renderWithConnections([makeConnection({ id: "conn-1" })]);
    fireEvent.click(screen.getByText("My Connection"));
    expect(mockNavigate).toHaveBeenCalledWith("/connections/conn-1/contacts");
  });
});
