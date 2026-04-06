import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  act,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ContactsPage from "../../modules/contacts/contacts.page";
import type { ContactType } from "../../modules";

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
    useContacts: vi.fn(),
    searchContacts: vi.fn(),
    checkPhoneDuplicate: vi.fn().mockResolvedValue(false),
    createContact: vi.fn().mockResolvedValue(undefined),
    updateContact: vi.fn().mockResolvedValue(undefined),
    deleteContact: vi.fn().mockResolvedValue(undefined),
  };
});

import {
  useContacts,
  searchContacts,
  checkPhoneDuplicate,
  createContact,
  updateContact,
  deleteContact,
} from "../../modules";

const makeContact = (overrides: Partial<ContactType> = {}): ContactType => ({
  id: "contact-1",
  userId: "user-1",
  connectionId: "conn-1",
  name: "John Doe",
  phone: "(11) 91234-5678",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

const renderWithContacts = (contacts: ContactType[] = [], loading = false) => {
  vi.mocked(useContacts).mockReturnValue([contacts, loading, null]);
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

  it("shows loading indicator while fetching", () => {
    renderWithContacts([], true);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows empty state when there are no contacts", () => {
    renderWithContacts([]);
    expect(screen.getByText(/nenhum contato ainda/i)).toBeInTheDocument();
  });

  it("renders a list of contacts", () => {
    renderWithContacts([
      makeContact({ id: "1", name: "Alice" }),
      makeContact({ id: "2", name: "Bob" }),
    ]);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("calls searchContacts after debounce when typing in search", async () => {
    vi.useFakeTimers();
    vi.mocked(searchContacts).mockResolvedValue([]);
    renderWithContacts([makeContact({ id: "1", name: "Alice" })]);

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
      target: { value: "ali" },
    });

    expect(searchContacts).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    vi.useRealTimers();
    expect(searchContacts).toHaveBeenCalledWith("user-1", "conn-1", "ali");
  });

  it("shows no results message when search has no matches", async () => {
    vi.useFakeTimers();
    vi.mocked(searchContacts).mockResolvedValue([]);
    renderWithContacts([makeContact({ id: "1", name: "Alice" })]);

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
      target: { value: "xyz" },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/nenhum resultado para/i)).toBeInTheDocument();
    });
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
      target: { value: "(11) 99999-9999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(createContact).toHaveBeenCalledWith(
        "conn-1",
        "Jane",
        "(11) 99999-9999",
      );
    });
  });

  it("opens edit dialog pre-filled with contact data", async () => {
    renderWithContacts([
      makeContact({ name: "John Doe", phone: "(11) 91234-5678" }),
    ]);
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("(11) 91234-5678")).toBeInTheDocument();
    });
  });

  it("calls updateContact on save when editing", async () => {
    renderWithContacts([
      makeContact({
        id: "contact-1",
        name: "Old Name",
        phone: "(11) 91234-5678",
      }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    await waitFor(() => screen.getByDisplayValue("Old Name"));

    fireEvent.change(screen.getByDisplayValue("Old Name"), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(updateContact).toHaveBeenCalledWith(
        "contact-1",
        "New Name",
        "(11) 91234-5678",
      );
    });
  });

  it("does not call createContact when phone is duplicate", async () => {
    vi.mocked(checkPhoneDuplicate).mockResolvedValueOnce(true);

    const handler = () => {};
    process.on("unhandledRejection", handler);

    renderWithContacts([]);
    fireEvent.click(
      screen.getAllByRole("button", { name: /novo contato/i })[0],
    );

    await waitFor(() => screen.getByLabelText(/^nome/i));
    fireEvent.change(screen.getByLabelText(/^nome/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: "(11) 99999-9999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(checkPhoneDuplicate).toHaveBeenCalled();
    });
    expect(createContact).not.toHaveBeenCalled();

    process.off("unhandledRejection", handler);
  });

  it("opens confirm dialog when clicking delete", async () => {
    renderWithContacts([makeContact()]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/excluir contato/i)).toBeInTheDocument();
    });
  });

  it("calls deleteContact after confirm", async () => {
    renderWithContacts([makeContact({ id: "contact-1" })]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => screen.getByRole("dialog"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(deleteContact).toHaveBeenCalledWith("contact-1");
    });
  });

  it("does not delete when confirm dialog is cancelled", async () => {
    renderWithContacts([makeContact()]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => screen.getByRole("dialog"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /cancelar/i }));

    expect(deleteContact).not.toHaveBeenCalled();
  });
});
