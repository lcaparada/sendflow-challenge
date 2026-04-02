import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContactFormDialog } from "../../components/contacts/contact-form-dialog";
import type { ContactType } from "../../modules";

vi.mock("../../lib/firebase", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
}));

const makeContact = (overrides: Partial<ContactType> = {}): ContactType => ({
  id: "contact-1",
  userId: "user-1",
  connectionId: "conn-1",
  name: "Alice Silva",
  phone: "(11) 91234-5678",
  createdAt: new Date(),
  ...overrides,
});

describe("ContactFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Novo contato' title when editing is null", () => {
    render(
      <ContactFormDialog
        open={true}
        editing={null}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Novo contato")).toBeInTheDocument();
  });

  it("renders 'Editar contato' title when editing is provided", () => {
    render(
      <ContactFormDialog
        open={true}
        editing={makeContact()}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Editar contato")).toBeInTheDocument();
  });

  it("pre-fills fields when editing", async () => {
    render(
      <ContactFormDialog
        open={true}
        editing={makeContact({ name: "Alice Silva", phone: "(11) 91234-5678" })}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue("Alice Silva")).toBeInTheDocument();
      expect(screen.getByDisplayValue("(11) 91234-5678")).toBeInTheDocument();
    });
  });

  it("does not render dialog content when open is false", () => {
    render(
      <ContactFormDialog
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
      <ContactFormDialog
        open={true}
        editing={null}
        onClose={onClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onSubmit with name and phone when saved", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactFormDialog
        open={true}
        editing={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    await waitFor(() => screen.getByLabelText(/^nome/i));
    fireEvent.change(screen.getByLabelText(/^nome/i), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: "(11) 98765-4321" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { name: "João Silva", phone: "(11) 98765-4321" },
        expect.anything(),
      );
    });
  });

  it("shows validation error when name is empty", async () => {
    render(
      <ContactFormDialog
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
