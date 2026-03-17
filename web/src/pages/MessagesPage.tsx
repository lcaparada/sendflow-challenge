import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Contact, Message } from "../types";
import {
  createMessage,
  deleteMessage,
  subscribeToContacts,
  subscribeToMessages,
  updateMessage,
} from "../functions";

type FilterTab = "all" | "scheduled" | "sent";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#6366f1" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
  },
  "& label.Mui-focused": { color: "#6366f1" },
};

const MessagesPage = () => {
  const { user } = useAuth();
  const { connectionId } = useParams<{ connectionId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Message | null>(null);
  const [content, setContent] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !connectionId) return;

    const unsubMessages = subscribeToMessages(
      user.uid,
      connectionId,
      (data) => {
        setMessages(data);
        setLoading(false);
      },
    );

    const unsubContacts = subscribeToContacts(
      user.uid,
      connectionId,
      setContacts,
    );

    return () => {
      unsubMessages();
      unsubContacts();
    };
  }, [user, connectionId]);

  const filteredMessages = messages.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const openCreate = () => {
    setEditing(null);
    setContent("");
    setSelectedContacts([]);
    setScheduledAt("");
    setDialogOpen(true);
  };

  const openEdit = (message: Message) => {
    setEditing(message);
    setContent(message.content);
    setSelectedContacts(message.contactIds);
    setScheduledAt(toDatetimeLocal(message.scheduledAt));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (
      !content.trim() ||
      selectedContacts.length === 0 ||
      !scheduledAt ||
      !user ||
      !connectionId
    )
      return;
    setSaving(true);
    try {
      const date = new Date(scheduledAt);
      if (editing) {
        await updateMessage(editing.id, selectedContacts, content.trim(), date);
      } else {
        await createMessage(
          connectionId,
          selectedContacts,
          content.trim(),
          date,
        );
      }
      closeDialog();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta mensagem?")) return;
    await deleteMessage(id);
  };

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toDatetimeLocal = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const contactName = (id: string) =>
    contacts.find((c) => c.id === id)?.name ?? id;

  const getInitials = (n: string) =>
    n
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const tabCounts = {
    all: messages.length,
    scheduled: messages.filter((m) => m.status === "scheduled").length,
    sent: messages.filter((m) => m.status === "sent").length,
  };

  return (
    <Box sx={{ animation: "fadeUp 0.4s ease-out both" }}>
      {/* Header */}
      <Box className="flex items-center justify-between mb-6">
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#1a1a2e", lineHeight: 1.2 }}
          >
            Mensagens
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            {messages.length} mensagem{messages.length !== 1 ? "s" : ""} no
            total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            py: 1.2,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f52e0 0%, #7c3aed 100%)",
              boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Nova mensagem
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4, borderBottom: "1px solid #f0f0f0" }}>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              minHeight: 44,
            },
            "& .Mui-selected": { color: "#6366f1" },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              height: 3,
              borderRadius: 2,
            },
          }}
        >
          {(["all", "scheduled", "sent"] as FilterTab[]).map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={
                <Box className="flex items-center gap-2">
                  <span>
                    {tab === "all"
                      ? "Todas"
                      : tab === "scheduled"
                        ? "Agendadas"
                        : "Enviadas"}
                  </span>
                  <Box
                    sx={{
                      background:
                        filter === tab
                          ? "linear-gradient(135deg, #6366f1, #a855f7)"
                          : "#f3f4f6",
                      color: filter === tab ? "white" : "#9ca3af",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      px: 0.8,
                      py: 0.1,
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {tabCounts[tab]}
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        <Box className="flex justify-center mt-24">
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : filteredMessages.length === 0 ? (
        <Box
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          sx={{ border: "2px dashed #e5e7eb", background: "#fafafa" }}
        >
          <Box
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            sx={{ background: "linear-gradient(135deg, #ede9fe, #f3e8ff)" }}
          >
            <SendIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#374151", mb: 1 }}
          >
            Nenhuma mensagem encontrada
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
            {filter === "all"
              ? "Crie a primeira mensagem desta conexão"
              : `Nenhuma mensagem ${filter === "scheduled" ? "agendada" : "enviada"} ainda`}
          </Typography>
          {filter === "all" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f52e0 0%, #7c3aed 100%)",
                },
              }}
            >
              Nova mensagem
            </Button>
          )}
        </Box>
      ) : (
        <Box className="flex flex-col gap-3">
          {filteredMessages.map((msg, i) => {
            const isSent = msg.status === "sent";
            return (
              <Card
                key={msg.id}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  animation: `fadeUp 0.4s ease-out ${i * 0.04}s both`,
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(99,102,241,0.12)",
                    borderColor: "#c4b5fd",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box className="flex items-start justify-between gap-3">
                    {/* Icon */}
                    <Box
                      className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                      sx={{
                        background: isSent
                          ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                          : "linear-gradient(135deg, #fef3c7, #fde68a)",
                      }}
                    >
                      {isSent ? (
                        <CheckCircleIcon
                          sx={{ fontSize: 20, color: "#16a34a" }}
                        />
                      ) : (
                        <ScheduleIcon sx={{ fontSize: 20, color: "#d97706" }} />
                      )}
                    </Box>

                    {/* Content */}
                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-center gap-2 mb-1 flex-wrap">
                        <Typography
                          fontWeight={600}
                          sx={{
                            color: "#1a1a2e",
                            fontSize: 15,
                            lineHeight: 1.4,
                          }}
                        >
                          {msg.content}
                        </Typography>
                        <Chip
                          label={isSent ? "Enviada" : "Agendada"}
                          size="small"
                          sx={{
                            background: isSent ? "#dcfce7" : "#fef3c7",
                            color: isSent ? "#16a34a" : "#d97706",
                            fontWeight: 700,
                            fontSize: 11,
                            height: 22,
                          }}
                        />
                      </Box>

                      <Box className="flex items-center gap-1 mb-2">
                        {isSent ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 13, color: "#9ca3af" }}
                          />
                        ) : (
                          <ScheduleIcon
                            sx={{ fontSize: 13, color: "#9ca3af" }}
                          />
                        )}
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          {isSent ? "Enviada em" : "Agendada para"}{" "}
                          {msg.scheduledAt.toLocaleString("pt-BR")}
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box className="flex flex-wrap gap-1">
                        {msg.contactIds.map((id) => (
                          <Box key={id} className="flex items-center gap-1">
                            <Avatar
                              sx={{
                                width: 20,
                                height: 20,
                                fontSize: 9,
                                fontWeight: 700,
                                background:
                                  "linear-gradient(135deg, #6366f1, #a855f7)",
                              }}
                            >
                              {getInitials(contactName(id))}
                            </Avatar>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280", fontWeight: 500 }}
                            >
                              {contactName(id)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box className="flex gap-0.5 shrink-0">
                      {!isSent && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(msg)}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": {
                                color: "#6366f1",
                                background: "#ede9fe",
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(msg.id)}
                          sx={{
                            color: "#9ca3af",
                            "&:hover": {
                              color: "#ef4444",
                              background: "#fee2e2",
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? "Editar mensagem" : "Nova mensagem"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-3">
          <TextField
            label="Mensagem"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            autoFocus
            sx={textFieldSx}
          />
          <Box>
            <Box className="flex items-center justify-between mb-1">
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: "#374151" }}
              >
                Data e hora de envio
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setScheduledAt(toDatetimeLocal(new Date()))}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 11,
                  px: 1.5,
                  py: 0.3,
                  borderColor: "#6366f1",
                  color: "#6366f1",
                  "&:hover": { background: "#ede9fe", borderColor: "#6366f1" },
                }}
              >
                Agora
              </Button>
            </Box>
            <TextField
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={textFieldSx}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: "#374151", mb: 1 }}
            >
              Contatos{" "}
              {selectedContacts.length > 0 && (
                <Chip
                  label={selectedContacts.length}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 11,
                    height: 20,
                    ml: 0.5,
                  }}
                />
              )}
            </Typography>

            {contacts.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Nenhum contato nesta conexão.
              </Typography>
            ) : (
              <Box
                className="flex flex-col gap-1 rounded-xl p-2"
                sx={{
                  border: "1px solid #f0f0f0",
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {contacts.map((contact) => {
                  const checked = selectedContacts.includes(contact.id);
                  return (
                    <FormControlLabel
                      key={contact.id}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={() => toggleContact(contact.id)}
                          size="small"
                          sx={{
                            color: "#d1d5db",
                            "&.Mui-checked": { color: "#6366f1" },
                          }}
                        />
                      }
                      label={
                        <Box className="flex items-center gap-2">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: 10,
                              fontWeight: 700,
                              background: checked
                                ? "linear-gradient(135deg, #6366f1, #a855f7)"
                                : "#e5e7eb",
                              color: checked ? "white" : "#9ca3af",
                            }}
                          >
                            {getInitials(contact.name)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ lineHeight: 1.2 }}
                            >
                              {contact.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#9ca3af" }}
                            >
                              {contact.phone}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{
                        mx: 0,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1.5,
                        "&:hover": { background: "#fafafa" },
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={closeDialog}
            sx={{ borderRadius: 2, textTransform: "none", color: "#6b7280" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !content.trim() ||
              selectedContacts.length === 0 ||
              !scheduledAt ||
              saving
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4f52e0 0%, #7c3aed 100%)",
              },
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessagesPage;
