import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConnectionsPage from "../../pages/connections.page";
import type { ConnectionType } from "../../modules";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
  useObservable: vi.fn(),
}));

vi.mock("../../lib/firebase", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
}));

vi.mock("../../modules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../modules")>();
  return {
    ...actual,
    useConnections: vi.fn(),
    createConnection: vi.fn().mockResolvedValue(undefined),
    updateConnection: vi.fn().mockResolvedValue(undefined),
    deleteConnection: vi.fn().mockResolvedValue(undefined),
  };
});

import { useConnections, createConnection, updateConnection, deleteConnection } from "../../modules";

const makeConnection = (overrides: Partial<ConnectionType> = {}): ConnectionType => ({
  id: "conn-1",
  userId: "user-1",
  name: "My Connection",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

const renderWithConnections = (connections: ConnectionType[] = [], loading = false) => {
  vi.mocked(useConnections).mockReturnValue([connections, loading, null]);
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

  it("shows loading indicator while fetching", () => {
    renderWithConnections([], true);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
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

  it("opens create dialog when clicking the header button", async () => {
    renderWithConnections([]);
    fireEvent.click(screen.getAllByRole("button", { name: /nova conexão/i })[0]);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("calls createConnection on save", async () => {
    renderWithConnections([]);
    fireEvent.click(screen.getAllByRole("button", { name: /nova conexão/i })[0]);

    await waitFor(() => screen.getByLabelText(/nome da conexão/i));
    fireEvent.change(screen.getByLabelText(/nome da conexão/i), {
      target: { value: "New Connection" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(createConnection).toHaveBeenCalledWith("New Connection");
    });
  });

  it("opens edit dialog pre-filled with connection name", async () => {
    renderWithConnections([makeConnection({ name: "Edit Me" })]);
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Edit Me")).toBeInTheDocument();
    });
  });

  it("calls updateConnection on save when editing", async () => {
    renderWithConnections([makeConnection({ id: "conn-1", name: "Old Name" })]);

    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    await waitFor(() => screen.getByDisplayValue("Old Name"));

    fireEvent.change(screen.getByDisplayValue("Old Name"), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(updateConnection).toHaveBeenCalledWith("conn-1", "New Name");
    });
  });

  it("opens confirm dialog when clicking delete", async () => {
    renderWithConnections([makeConnection({ id: "conn-1" })]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/excluir conexão/i)).toBeInTheDocument();
    });
  });

  it("calls deleteConnection after confirm", async () => {
    renderWithConnections([makeConnection({ id: "conn-1" })]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => screen.getByRole("dialog"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(deleteConnection).toHaveBeenCalledWith("conn-1");
    });
  });

  it("does not delete when confirm dialog is cancelled", async () => {
    renderWithConnections([makeConnection({ id: "conn-1" })]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => screen.getByRole("dialog"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /cancelar/i }));

    expect(deleteConnection).not.toHaveBeenCalled();
  });

  it("navigates to contacts when clicking a connection card", () => {
    renderWithConnections([makeConnection({ id: "conn-1" })]);
    fireEvent.click(screen.getByText("My Connection"));
    expect(mockNavigate).toHaveBeenCalledWith("/connections/conn-1/contacts");
  });
});
