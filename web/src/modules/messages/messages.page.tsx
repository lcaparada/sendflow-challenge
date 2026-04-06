import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import { useParams } from "react-router-dom";

import {
  createMessage,
  deleteMessage,
  updateMessage,
  useContacts,
  useMessages,
  type MessageSchemaType,
  type MessageType,
} from "..";
import { useAuth } from "../../hooks";
import {
  ConfirmDialog,
  EmptyState,
  LoadingIndicator,
  MessageCard,
  MessageFormDialog,
  PageWrapper,
  TabsMessagesFilter,
  type FilterTab,
} from "../../components";

export default function MessagesPage() {
  const { user } = useAuth();

  const { connectionId } = useParams<{ connectionId: string }>();

  const [contacts] = useContacts(user?.uid ?? "", connectionId ?? "");

  const [filter, setFilter] = useState<FilterTab>("all");
  const [formDialog, setFormDialog] = useState<{
    message: MessageType | null;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    loading: boolean;
  } | null>(null);
  const [pageSize, setPageSize] = useState(20);

  const [messages, loading] = useMessages(
    user?.uid ?? "",
    connectionId ?? "",
    pageSize,
    filter !== "all" ? filter : undefined,
  );

  const hasMore = messages.length === pageSize;

  function handleFilterChange(next: FilterTab) {
    setFilter(next);
    setPageSize(20);
  }

  function openCreate() {
    setFormDialog({ message: null });
  }

  function openEdit(message: MessageType) {
    setFormDialog({ message });
  }

  function closeDialog() {
    setFormDialog(null);
  }

  async function onSubmit(data: MessageSchemaType) {
    if (!user || !connectionId) return;
    const date = new Date(data.scheduledAt);
    if (formDialog?.message) {
      await updateMessage(
        formDialog.message.id,
        data.contactIds,
        data.content,
        date,
      );
    } else {
      await createMessage(connectionId, data.contactIds, data.content, date);
    }
    closeDialog();
  }

  async function handleConfirmDelete() {
    if (!deleteDialog) return;
    setDeleteDialog({ ...deleteDialog, loading: true });
    try {
      await deleteMessage(deleteDialog.id);
      setDeleteDialog(null);
    } catch {
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  }

  return (
    <PageWrapper
      title="Mensagens"
      description={`${messages.length} mensagem${messages.length !== 1 ? "s" : ""} cadastrada${messages.length !== 1 ? "s" : ""}`}
      button={{
        icon: <AddIcon />,
        label: "Nova mensagem",
        onClick: openCreate,
      }}
    >
      <TabsMessagesFilter filter={filter} onSelectFilter={handleFilterChange} />

      {loading ? (
        <LoadingIndicator />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<SendIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />}
          title="Nenhuma mensagem encontrada"
          description={
            filter === "all"
              ? "Crie a primeira mensagem desta conexão"
              : `Nenhuma mensagem ${filter === "scheduled" ? "agendada" : "enviada"} ainda`
          }
          addLabel={filter === "all" ? "Nova mensagem" : undefined}
          onAdd={filter === "all" ? openCreate : undefined}
        />
      ) : (
        <Box className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <MessageCard
              key={msg.id}
              message={msg}
              index={i}
              contacts={contacts}
              onEdit={openEdit}
              onDelete={(id) => setDeleteDialog({ id, loading: false })}
            />
          ))}
          {hasMore && (
            <Button
              variant="outlined"
              onClick={() => setPageSize((prev) => prev + 20)}
              sx={{
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

      <MessageFormDialog
        open={formDialog !== null}
        editing={formDialog?.message ?? null}
        contacts={contacts}
        onClose={closeDialog}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={deleteDialog !== null}
        loading={deleteDialog?.loading ?? false}
        title="Excluir mensagem"
        description="Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita."
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageWrapper>
  );
}
