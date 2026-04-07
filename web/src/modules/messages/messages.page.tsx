import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import { useParams } from "react-router-dom";
import { deleteMessage, useContacts, useMessages, type MessageType } from "..";
import { useAuth } from "../../hooks";
import {
  ConfirmDialog,
  EmptyState,
  LoadingIndicator,
  MessageCard,
  MessageFormDialog,
  PageWrapper,
  TabsMessagesFilter,
  openDialog,
  type FilterTab,
} from "../../components";

export default function MessagesPage() {
  const { user } = useAuth();

  const { connectionId } = useParams<{ connectionId: string }>();

  const [contacts] = useContacts(user?.uid ?? "", connectionId ?? "");

  const [filter, setFilter] = useState<FilterTab>("all");
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

  function openCreateMessageDialog() {
    openDialog({
      maxWidth: "sm",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <MessageFormDialog
          editing={null}
          contacts={contacts}
          connectionId={connectionId!}
        />
      ),
    });
  }

  function openEditMessageDialog(message: MessageType) {
    openDialog({
      maxWidth: "sm",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <MessageFormDialog
          editing={message}
          contacts={contacts}
          connectionId={connectionId!}
        />
      ),
    });
  }

  function openDeleteMessageDialog(id: string) {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ConfirmDialog
          title="Excluir mensagem"
          description="Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita."
          onConfirm={() => deleteMessage(id)}
        />
      ),
    });
  }

  return (
    <PageWrapper
      title="Mensagens"
      description={`${messages.length} mensagem${messages.length !== 1 ? "s" : ""} cadastrada${messages.length !== 1 ? "s" : ""}`}
      button={{
        icon: <AddIcon />,
        label: "Nova mensagem",
        onClick: openCreateMessageDialog,
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
          onAdd={filter === "all" ? openCreateMessageDialog : undefined}
        />
      ) : (
        <Box className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <MessageCard
              key={msg.id}
              message={msg}
              index={i}
              contacts={contacts}
              onEdit={openEditMessageDialog}
              onDelete={openDeleteMessageDialog}
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
    </PageWrapper>
  );
}
