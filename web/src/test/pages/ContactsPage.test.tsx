import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ContactsPage from "../../pages/ContactsPage";
import type { Contact } from "../../types";

vi.mock("../../web/hooks/useAuth", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
}));

vi.mock("../../functions", () => ({
  subscribeToContacts: vi.fn(),
  createContact: vi.fn().mockResolvedValue(undefined),
  updateContact: vi.fn().mockResolvedValue(undefined),
  deleteContact: vi.fn().mockResolvedValue(undefined),
}));

import {
  subscribeToContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../../functions";

const makeContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: "contact-1",
  userId: "user-1",
  connectionId: "conn-1",
  name: "John Doe",
  phone: "+55 11 91234-5678",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

const renderWithContacts = (contacts: Contact[] = []) => {
  vi.mocked(subscribeToContacts).mockImplementation(
    (_uid, _connId, callback) => {
      callback(contacts);
      return vi.fn();
    },
  );
  return render(
    <MemoryRouter initialEntries={["/connections/conn-1/contacts"]}>
      <Routes>
        <Route
          path="/connections/:connectionId/contacts"
          element={<ContactsPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ContactsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when there are no contacts", () => {
    renderWithContacts([]);
    expect(screen.getByText(/nenhum contato ainda/i)).toBeInTheDocument();
  });

  it("renders a list of contacts", () => {
    renderWithContacts([
      makeContact({ id: "1", name: "Alice", phone: "+55 11 1111-1111" }),
      makeContact({ id: "2", name: "Bob", phone: "+55 11 2222-2222" }),
    ]);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("filters contacts by name search", async () => {
    renderWithContacts([
      makeContact({ id: "1", name: "Alice" }),
      makeContact({ id: "2", name: "Bob" }),
    ]);

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
      target: { value: "alice" },
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("opens create dialog when clicking the button", async () => {
    renderWithContacts([]);
    fireEvent.click(
      screen.getAllByRole("button", { name: /novo contato/i })[0],
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("calls createContact on save", async () => {
    renderWithContacts([]);
    fireEvent.click(
      screen.getAllByRole("button", { name: /novo contato/i })[0],
    );

    await waitFor(() => screen.getByLabelText(/^nome/i));
    fireEvent.change(screen.getByLabelText(/^nome/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: "+55 11 99999-9999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(createContact).toHaveBeenCalledWith(
        "user-1",
        "conn-1",
        "Jane",
        "+55 11 99999-9999",
      );
    });
  });

  it("opens edit dialog pre-filled with contact data", async () => {
    renderWithContacts([
      makeContact({ name: "John Doe", phone: "+55 11 91234-5678" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("+55 11 91234-5678")).toBeInTheDocument();
    });
  });

  it("calls updateContact on save when editing", async () => {
    renderWithContacts([
      makeContact({ id: "contact-1", name: "Old Name", phone: "111" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    await waitFor(() => screen.getByDisplayValue("Old Name"));

    fireEvent.change(screen.getByDisplayValue("Old Name"), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(updateContact).toHaveBeenCalledWith(
        "contact-1",
        "New Name",
        "111",
      );
    });
  });

  it("calls deleteContact after confirm", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithContacts([makeContact({ id: "contact-1" })]);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      expect(deleteContact).toHaveBeenCalledWith("contact-1");
    });
  });

  it("does not delete when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithContacts([makeContact()]);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(deleteContact).not.toHaveBeenCalled();
  });
});
