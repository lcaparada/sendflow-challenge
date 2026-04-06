import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageCard } from "../../components/message-card/MessageCard";
import type { ContactType, MessageType } from "../../modules";

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
  content: "Olá, tudo bem?",
  status: "scheduled",
  scheduledAt: new Date("2030-06-15T10:00:00"),
  createdAt: new Date(),
  ...overrides,
});

describe("MessageCard", () => {
  it("renders message content", () => {
    render(
      <MessageCard
        message={makeMessage()}
        index={0}
        contacts={[makeContact()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Olá, tudo bem?")).toBeInTheDocument();
  });

  it("shows 'Agendada' chip for scheduled messages", () => {
    render(
      <MessageCard
        message={makeMessage({ status: "scheduled" })}
        index={0}
        contacts={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Agendada")).toBeInTheDocument();
  });

  it("shows 'Enviada' chip for sent messages", () => {
    render(
      <MessageCard
        message={makeMessage({ status: "sent" })}
        index={0}
        contacts={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Enviada")).toBeInTheDocument();
  });

  it("shows edit button only for scheduled messages", () => {
    render(
      <MessageCard
        message={makeMessage({ status: "scheduled" })}
        index={0}
        contacts={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("does not show edit button for sent messages", () => {
    render(
      <MessageCard
        message={makeMessage({ status: "sent" })}
        index={0}
        contacts={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });

  it("calls onEdit with the message when edit button is clicked", () => {
    const onEdit = vi.fn();
    const message = makeMessage();
    render(
      <MessageCard
        message={message}
        index={0}
        contacts={[]}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(message);
  });

  it("calls onDelete with message id when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <MessageCard
        message={makeMessage({ id: "msg-1" })}
        index={0}
        contacts={[]}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onDelete).toHaveBeenCalledWith("msg-1");
  });

  it("renders contact name when contact is found", () => {
    render(
      <MessageCard
        message={makeMessage({ contactIds: ["contact-1"] })}
        index={0}
        contacts={[makeContact({ id: "contact-1", name: "Alice Silva" })]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Alice Silva")).toBeInTheDocument();
  });

  it("shows 'Contato removido' for unknown contact ids", () => {
    render(
      <MessageCard
        message={makeMessage({ contactIds: ["unknown-id"] })}
        index={0}
        contacts={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Contato removido")).toBeInTheDocument();
  });
});
