import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import {
  checkPhoneDuplicate,
  createContact,
  deleteContact,
  searchContacts,
  updateContact,
  useContacts,
  type ContactSchemaType,
  type ContactType,
} from "../modules";
import { useAuth } from "../hooks";
import {
  ContactCard,
  ContactEmptyState,
  ContactFormDialog,
  DeleteContactDialog,
  PageWrapper,
} from "../components";

const ContactsPage = () => {
  const { user } = useAuth();
  const { connectionId } = useParams<{ connectionId: string }>();
  const [contacts, loading] = useContacts(user?.uid ?? "", connectionId ?? "");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ContactType[]>([]);
  const [searching, setSearching] = useState(false);
  const [formDialog, setFormDialog] = useState<{ contact: ContactType | null } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; loading: boolean } | null>(null);

  const displayed = search.trim() ? searchResults : contacts;

  const openCreate = () => setFormDialog({ contact: null });
  const openEdit = (contact: ContactType) => setFormDialog({ contact });
  const closeDialog = () => setFormDialog(null);

  const onSubmit = async (data: ContactSchemaType) => {
    if (!user || !connectionId) return;
    const isDuplicate = await checkPhoneDuplicate(
      user.uid,
      data.phone,
      formDialog?.contact?.id,
    );
    if (isDuplicate)
      throw new Error("Este número já está cadastrado para outro contato.");
    if (formDialog?.contact) {
      await updateContact(formDialog.contact.id, data.name, data.phone);
    } else {
      await createContact(connectionId, data.name, data.phone);
    }
    closeDialog();
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
    setDeleteDialog({ ...deleteDialog, loading: true });
    try {
      await deleteContact(deleteDialog.id);
      setDeleteDialog(null);
    } catch {
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  useEffect(() => {
    if (!search.trim() || !user || !connectionId) return;
    const timeout = setTimeout(async () => {
      setSearching(true);
      const results = await searchContacts(user.uid, connectionId, search.trim());
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, user, connectionId]);

  return (
    <PageWrapper
      title="Contatos"
      description={`${contacts.length} contato${contacts.length !== 1 ? "s" : ""} cadastrado${contacts.length !== 1 ? "s" : ""}`}
      button={{ icon: <AddIcon />, label: "Novo contato", onClick: openCreate }}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar por nome ou telefone...",
        show: !loading && contacts.length > 0,
      }}
    >
      {loading || searching ? (
        <Box className="flex justify-center mt-24">
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : contacts.length === 0 ? (
        <ContactEmptyState onAdd={openCreate} />
      ) : displayed.length === 0 ? (
        <Typography sx={{ color: "#9ca3af", mt: 4 }}>
          Nenhum resultado para "{search}"
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 2,
          }}
        >
          {displayed.map((contact, i) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              index={i}
              onEdit={openEdit}
              onDelete={(id) => setDeleteDialog({ id, loading: false })}
            />
          ))}
        </Box>
      )}

      <ContactFormDialog
        open={formDialog !== null}
        editing={formDialog?.contact ?? null}
        onClose={closeDialog}
        onSubmit={onSubmit}
      />

      <DeleteContactDialog
        open={deleteDialog !== null}
        deleting={deleteDialog?.loading ?? false}
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageWrapper>
  );
};

export default ContactsPage;
