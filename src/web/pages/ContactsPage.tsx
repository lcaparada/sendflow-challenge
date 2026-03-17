import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  createContact,
  updateContact,
  deleteContact,
  subscribeToContacts,
  type Contact,
} from "../../functions/contacts";

const ContactsPage = () => {
  const { user } = useAuth();
  const { connectionId } = useParams<{ connectionId: string }>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !connectionId) return;
    const unsubscribe = subscribeToContacts(user.uid, connectionId, (data) => {
      setContacts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user, connectionId]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setPhone("");
    setDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setName("");
    setPhone("");
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !user || !connectionId) return;
    setSaving(true);
    try {
      if (editing) {
        await updateContact(editing.id, name.trim(), phone.trim());
      } else {
        await createContact(user.uid, connectionId, name.trim(), phone.trim());
      }
      closeDialog();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este contato?")) return;
    await deleteContact(id);
  };

  return (
    <Box>
      <Box className="flex items-center justify-between mb-6">
        <Typography variant="h5" fontWeight={700}>
          Contatos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo contato
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center mt-16">
          <CircularProgress />
        </Box>
      ) : contacts.length === 0 ? (
        <Typography color="text.secondary">
          Nenhum contato cadastrado. Adicione o primeiro!
        </Typography>
      ) : (
        <List disablePadding className="bg-white rounded-lg shadow">
          {contacts.map((contact, i) => (
            <ListItem
              key={contact.id}
              divider={i < contacts.length - 1}
              secondaryAction={
                <Box className="flex gap-1">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => openEdit(contact)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => handleDelete(contact.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={contact.name}
                secondary={contact.phone}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Editar contato" : "Novo contato"}</DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
          />
          <TextField
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            placeholder="+55 11 91234-5678"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name.trim() || !phone.trim() || saving}
          >
            {saving ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactsPage;
