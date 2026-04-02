import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactCard } from "../../components/contacts/contact-card";
import type { ContactType } from "../../modules";

const makeContact = (overrides: Partial<ContactType> = {}): ContactType => ({
  id: "contact-1",
  userId: "user-1",
  connectionId: "conn-1",
  name: "Alice Silva",
  phone: "(11) 91234-5678",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

describe("ContactCard", () => {
  it("renders contact name", () => {
    render(
      <ContactCard
        contact={makeContact()}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Alice Silva")).toBeInTheDocument();
  });

  it("renders contact phone", () => {
    render(
      <ContactCard
        contact={makeContact()}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("(11) 91234-5678")).toBeInTheDocument();
  });

  it("renders initials in avatar", () => {
    render(
      <ContactCard
        contact={makeContact({ name: "Alice Silva" })}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("calls onEdit with the contact when edit button is clicked", () => {
    const onEdit = vi.fn();
    const contact = makeContact();
    render(
      <ContactCard contact={contact} index={0} onEdit={onEdit} onDelete={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(contact);
  });

  it("calls onDelete with contact id when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <ContactCard
        contact={makeContact({ id: "contact-1" })}
        index={0}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onDelete).toHaveBeenCalledWith("contact-1");
  });
});
