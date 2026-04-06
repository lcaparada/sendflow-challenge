import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MessageFormDialog } from "../../components/message-form-dialog/MessageFormDialog";
import type { ContactType, MessageType } from "../../modules";

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

const makeMessage = (overrides: Partial<MessageType> = {}): MessageType => ({
  id: "msg-1",
  userId: "user-1",
  connectionId: "conn-1",
  contactIds: ["contact-1"],
  content: "Mensagem existente",
  status: "scheduled",
  scheduledAt: new Date("2030-06-15T10:00:00"),
  createdAt: new Date(),
  ...overrides,
});

describe("MessageFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Nova mensagem' title when editing is null", () => {
    render(
      <MessageFormDialog
        open={true}
        editing={null}
        contacts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Nova mensagem")).toBeInTheDocument();
  });

  it("renders 'Editar mensagem' title when editing is provided", () => {
    render(
      <MessageFormDialog
        open={true}
        editing={makeMessage()}
        contacts={[makeContact()]}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Editar mensagem")).toBeInTheDocument();
  });

  it("pre-fills content when editing", async () => {
    render(
      <MessageFormDialog
        open={true}
        editing={makeMessage({ content: "Mensagem existente" })}
        contacts={[makeContact()]}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue("Mensagem existente")).toBeInTheDocument();
    });
  });

  it("renders list of contacts", () => {
    render(
      <MessageFormDialog
        open={true}
        editing={null}
        contacts={[
          makeContact({ id: "c1", name: "Alice" }),
          makeContact({ id: "c2", name: "Bob" }),
        ]}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows empty contacts message when no contacts", () => {
    render(
      <MessageFormDialog
        open={true}
        editing={null}
        contacts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText(/nenhum contato nesta conexão/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <MessageFormDialog
        open={true}
        editing={null}
        contacts={[]}
        onClose={onClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("toggles contact selection when checkbox is clicked", async () => {
    render(
      <MessageFormDialog
        open={true}
        editing={null}
        contacts={[makeContact({ id: "c1", name: "Alice" })]}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    const checkbox = screen.getByLabelText(/alice/i);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it("calls onSubmit with correct data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <MessageFormDialog
        open={true}
        editing={null}
        contacts={[makeContact({ id: "c1", name: "Alice" })]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    await waitFor(() => screen.getByRole("textbox", { name: /mensagem/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /mensagem/i }), {
      target: { value: "Minha mensagem" },
    });
    fireEvent.change(screen.getByDisplayValue(""), {
      target: { value: "2030-06-01T10:00" },
    });
    fireEvent.click(screen.getByLabelText(/alice/i));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { content: "Minha mensagem", scheduledAt: "2030-06-01T10:00", contactIds: ["c1"] },
        expect.anything(),
      );
    });
  });
});
