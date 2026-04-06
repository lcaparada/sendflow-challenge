import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConnectionFormDialog } from "../../components/connection-form-dialog/ConnectionFormDialog";
import type { ConnectionType } from "../../modules";

vi.mock("../../lib/firebase", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
}));

const makeConnection = (overrides: Partial<ConnectionType> = {}): ConnectionType => ({
  id: "conn-1",
  userId: "user-1",
  name: "Minha Conexão",
  createdAt: new Date(),
  ...overrides,
});

describe("ConnectionFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Nova conexão' title when editing is null", () => {
    render(
      <ConnectionFormDialog
        open={true}
        editing={null}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Nova conexão")).toBeInTheDocument();
  });

  it("renders 'Editar conexão' title when editing is provided", () => {
    render(
      <ConnectionFormDialog
        open={true}
        editing={makeConnection()}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Editar conexão")).toBeInTheDocument();
  });

  it("pre-fills name field when editing", async () => {
    render(
      <ConnectionFormDialog
        open={true}
        editing={makeConnection({ name: "Conexão Existente" })}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue("Conexão Existente")).toBeInTheDocument();
    });
  });

  it("does not render dialog content when open is false", () => {
    render(
      <ConnectionFormDialog
        open={false}
        editing={null}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ConnectionFormDialog
        open={true}
        editing={null}
        onClose={onClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onSubmit with form data when saved", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ConnectionFormDialog
        open={true}
        editing={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    await waitFor(() => screen.getByLabelText(/nome da conexão/i));
    fireEvent.change(screen.getByLabelText(/nome da conexão/i), {
      target: { value: "Nova Conexão" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: "Nova Conexão" }, expect.anything());
    });
  });

  it("shows validation error when name is empty", async () => {
    render(
      <ConnectionFormDialog
        open={true}
        editing={null}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });
});
