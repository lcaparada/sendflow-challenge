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
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  createConnection,
  updateConnection,
  deleteConnection,
  subscribeToConnections,
  type Connection,
} from "../../functions/connections";

const ConnectionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToConnections(user.uid, (data) => {
      setConnections(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDialogOpen(true);
  };

  const openEdit = (connection: Connection) => {
    setEditing(connection);
    setName(connection.name);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setName("");
    setEditing(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      if (editing) {
        await updateConnection(editing.id, name.trim());
      } else {
        await createConnection(user.uid, name.trim());
      }
      closeDialog();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta conexão?")) return;
    await deleteConnection(id);
  };

  return (
    <Box>
      <Box className="flex items-center justify-between mb-6">
        <Typography variant="h5" fontWeight={700}>
          Conexões
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova conexão
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center mt-16">
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        <Typography color="text.secondary">
          Nenhuma conexão cadastrada. Crie a primeira!
        </Typography>
      ) : (
        <List disablePadding className="bg-white rounded-lg shadow">
          {connections.map((conn, i) => (
            <ListItem
              key={conn.id}
              divider={i < connections.length - 1}
              secondaryAction={
                <Box className="flex gap-1">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => openEdit(conn)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => handleDelete(conn.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Acessar">
                    <IconButton
                      onClick={() => navigate(`/connections/${conn.id}/contacts`)}
                      color="primary"
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemButton
                disableRipple
                onClick={() => navigate(`/connections/${conn.id}/contacts`)}
                sx={{ cursor: "default", "&:hover": { backgroundColor: "transparent" } }}
              >
                <ListItemText
                  primary={conn.name}
                  secondary={`Criada em ${conn.createdAt.toLocaleDateString("pt-BR")}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Editar conexão" : "Nova conexão"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name.trim() || saving}
          >
            {saving ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConnectionsPage;
