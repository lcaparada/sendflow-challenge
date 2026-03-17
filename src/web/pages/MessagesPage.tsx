import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  createMessage,
  updateMessage,
  deleteMessage,
  subscribeToMessages,
  startMessageScheduler,
  type Message,
} from "../../functions/messages";
import { subscribeToContacts, type Contact } from "../../functions/contacts";

type FilterTab = "all" | "scheduled" | "sent";

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

  useEffect(() => {
    const cleanup = startMessageScheduler(messages);
    return cleanup;
  }, [messages]);

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
          user.uid,
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

  return (
    <Box>
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h5" fontWeight={700}>
          Mensagens
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Nova mensagem
        </Button>
      </Box>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} className="mb-4">
        <Tab label="Todas" value="all" />
        <Tab label="Agendadas" value="scheduled" />
        <Tab label="Enviadas" value="sent" />
      </Tabs>

      {loading ? (
        <Box className="flex justify-center mt-16">
          <CircularProgress />
        </Box>
      ) : filteredMessages.length === 0 ? (
        <Typography color="text.secondary">
          Nenhuma mensagem encontrada.
        </Typography>
      ) : (
        <List disablePadding className="bg-white rounded-lg shadow">
          {filteredMessages.map((msg, i) => (
            <ListItem
              key={msg.id}
              divider={i < filteredMessages.length - 1}
              alignItems="flex-start"
              secondaryAction={
                <Box className="flex gap-1">
                  {msg.status === "scheduled" && (
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEdit(msg)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Excluir">
                    <IconButton
                      onClick={() => handleDelete(msg.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box className="flex items-center gap-2 flex-wrap">
                    <Typography variant="body1">{msg.content}</Typography>
                    <Chip
                      label={msg.status === "sent" ? "Enviada" : "Agendada"}
                      color={msg.status === "sent" ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box className="mt-1">
                    <Typography variant="caption" display="block">
                      {msg.status === "scheduled"
                        ? "Agendada para"
                        : "Enviada em"}
                      : {msg.scheduledAt.toLocaleString("pt-BR")}
                    </Typography>
                    <Box className="flex flex-wrap gap-1 mt-1">
                      {msg.contactIds.map((id) => (
                        <Chip
                          key={id}
                          label={contactName(id)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Editar mensagem" : "Nova mensagem"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <TextField
            label="Mensagem"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            autoFocus
          />
          <TextField
            label="Data e hora de envio"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">Contatos</FormLabel>
            <FormGroup>
              {contacts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum contato nesta conexão.
                </Typography>
              ) : (
                contacts.map((contact) => (
                  <FormControlLabel
                    key={contact.id}
                    control={
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContact(contact.id)}
                      />
                    }
                    label={`${contact.name} — ${contact.phone}`}
                  />
                ))
              )}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !content.trim() ||
              selectedContacts.length === 0 ||
              !scheduledAt ||
              saving
            }
          >
            {saving ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessagesPage;
