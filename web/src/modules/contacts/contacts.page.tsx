import { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContactsIcon from "@mui/icons-material/Contacts";
import { useParams } from "react-router-dom";
import {
  deleteContact,
  searchContacts,
  useContacts,
  type ContactType,
} from "..";
import { useAuth } from "../../hooks";
import {
  ConfirmDialog,
  ContactCard,
  ContactFormDialog,
  EmptyState,
  PageWrapper,
  openDialog,
} from "../../components";

export default function ContactsPage() {
  const { user } = useAuth();

  const { connectionId } = useParams<{ connectionId: string }>();

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [searchResults, setSearchResults] = useState<ContactType[]>([]);
  const [searching, setSearching] = useState(false);

  const [contacts, loading] = useContacts(
    user?.uid ?? "",
    connectionId ?? "",
    pageSize,
  );

  const hasMore = contacts.length === pageSize;
  const displayed = search.trim() ? searchResults : contacts;

  function openCreateContactDialog() {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ContactFormDialog
          editing={null}
          userId={user!.uid}
          connectionId={connectionId!}
        />
      ),
    });
  }

  function openEditContactDialog(contact: ContactType) {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ContactFormDialog
          editing={contact}
          userId={user!.uid}
          connectionId={connectionId!}
        />
      ),
    });
  }

  function openDeleteContactDialog(id: string) {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ConfirmDialog
          title="Excluir contato"
          description="Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita."
          onConfirm={() => deleteContact(id)}
        />
      ),
    });
  }

  useEffect(() => {
    if (!search.trim() || !user || !connectionId) return;
    const timeout = setTimeout(async () => {
      setSearching(true);
      const results = await searchContacts(
        user.uid,
        connectionId,
        search.trim(),
      );
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, user, connectionId]);

  return (
    <PageWrapper
      title="Contatos"
      description={`${contacts.length} contato${contacts.length !== 1 ? "s" : ""} cadastrado${contacts.length !== 1 ? "s" : ""}`}
      button={{
        icon: <AddIcon />,
        label: "Novo contato",
        onClick: openCreateContactDialog,
      }}
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
        <EmptyState
          icon={<ContactsIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />}
          title="Nenhum contato ainda"
          description="Crie seu primeiro contato para começar"
          addLabel="Novo contato"
          onAdd={openCreateContactDialog}
        />
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
              onEdit={openEditContactDialog}
              onDelete={openDeleteContactDialog}
            />
          ))}
          {hasMore && !search.trim() && (
            <Button
              variant="outlined"
              onClick={() => setPageSize((prev) => prev + 20)}
              sx={{
                gridColumn: "1 / -1",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#c4b5fd",
                color: "#6366f1",
                "&:hover": { borderColor: "#6366f1", background: "#ede9fe" },
              }}
            >
              Carregar mais
            </Button>
          )}
        </Box>
      )}
    </PageWrapper>
  );
}
