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
  TextField,
  Tooltip,
  Typography,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContactsIcon from "@mui/icons-material/Contacts";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Contact } from "../types";
import {
  createContact,
  deleteContact,
  subscribeToContacts,
  updateContact,
} from "../functions";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#6366f1" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
  },
  "& label.Mui-focused": { color: "#6366f1" },
};

const ContactsPage = () => {
  const { user } = useAuth();
  const { connectionId } = useParams<{ connectionId: string }>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

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
        await createContact(connectionId, name.trim(), phone.trim());
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

  const getInitials = (n: string) =>
    n
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <Box sx={{ animation: "fadeUp 0.4s ease-out both" }}>
      <Box className="flex items-center justify-between mb-8">
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#1a1a2e", lineHeight: 1.2 }}
          >
            Contatos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            {contacts.length} contato{contacts.length !== 1 ? "s" : ""}{" "}
            cadastrado{contacts.length !== 1 ? "s" : ""}
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
          Novo contato
        </Button>
      </Box>

      {!loading && contacts.length > 0 && (
        <TextField
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mb: 4, width: "100%", ...textFieldSx }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {loading ? (
        <Box className="flex justify-center mt-24">
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : contacts.length === 0 ? (
        <Box
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          sx={{ border: "2px dashed #e5e7eb", background: "#fafafa" }}
        >
          <Box
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            sx={{ background: "linear-gradient(135deg, #ede9fe, #f3e8ff)" }}
          >
            <ContactsIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#374151", mb: 1 }}
          >
            Nenhum contato ainda
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
            Adicione o primeiro contato desta conexão
          </Typography>
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
                background: "linear-gradient(135deg, #4f52e0 0%, #7c3aed 100%)",
              },
            }}
          >
            Novo contato
          </Button>
        </Box>
      ) : filtered.length === 0 ? (
        <Typography sx={{ color: "#9ca3af", mt: 4 }}>
          Nenhum resultado para "{search}"
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {filtered.map((contact, i) => (
            <Card
              key={contact.id}
              sx={{
                borderRadius: 3,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
                animation: `fadeUp 0.4s ease-out ${i * 0.04}s both`,
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
                  transform: "translateY(-2px)",
                  borderColor: "#c4b5fd",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-3 min-w-0">
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        fontSize: 14,
                        fontWeight: 700,
                        shrink: 0,
                      }}
                    >
                      {getInitials(contact.name)}
                    </Avatar>
                    <Box className="min-w-0">
                      <Typography
                        fontWeight={700}
                        sx={{
                          color: "#1a1a2e",
                          fontSize: 15,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {contact.name}
                      </Typography>
                      <Box className="flex items-center gap-1 mt-0.5">
                        <PhoneIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {contact.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="flex gap-0.5 shrink-0 ml-2">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(contact)}
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
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(contact.id)}
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
          ))}
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? "Editar contato" : "Novo contato"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldSx}
          />
          <TextField
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            placeholder="+55 11 91234-5678"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldSx}
          />
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
            disabled={!name.trim() || !phone.trim() || saving}
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

export default ContactsPage;
