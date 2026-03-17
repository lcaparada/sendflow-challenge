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
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HubIcon from "@mui/icons-material/Hub";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Connection } from "../types";
import {
  createConnection,
  deleteConnection,
  subscribeToConnections,
  updateConnection,
} from "../functions";

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
        await createConnection(name.trim());
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
    <Box sx={{ animation: "fadeUp 0.4s ease-out both" }}>
      <Box className="flex items-center justify-between mb-8">
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#1a1a2e", lineHeight: 1.2 }}
          >
            Conexões
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            {connections.length} conexão{connections.length !== 1 ? "es" : ""}{" "}
            cadastrada{connections.length !== 1 ? "s" : ""}
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
          Nova conexão
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center mt-24">
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : connections.length === 0 ? (
        <Box
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          sx={{ border: "2px dashed #e5e7eb", background: "#fafafa" }}
        >
          <Box
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            sx={{ background: "linear-gradient(135deg, #ede9fe, #f3e8ff)" }}
          >
            <HubIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#374151", mb: 1 }}
          >
            Nenhuma conexão ainda
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
            Crie sua primeira conexão para começar
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
            Nova conexão
          </Button>
        </Box>
      ) : (
        <Box
          className="grid gap-4"
          sx={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            display: "grid",
          }}
        >
          {connections.map((conn, i) => (
            <Card
              key={conn.id}
              sx={{
                borderRadius: 3,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                animation: `fadeUp 0.4s ease-out ${i * 0.05}s both`,
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
                  transform: "translateY(-2px)",
                  borderColor: "#c4b5fd",
                },
              }}
              onClick={() => navigate(`/connections/${conn.id}/contacts`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box className="flex items-start justify-between">
                  <Box className="flex items-center gap-3 flex-1 min-w-0">
                    <Box
                      className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                      sx={{
                        background: "linear-gradient(135deg, #ede9fe, #f3e8ff)",
                      }}
                    >
                      <HubIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />
                    </Box>
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
                        {conn.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        Criada em {conn.createdAt.toLocaleDateString("pt-BR")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    className="flex gap-0.5 shrink-0 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(conn)}
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
                        onClick={() => handleDelete(conn.id)}
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

                <Box
                  className="flex items-center justify-between mt-4 pt-3"
                  sx={{ borderTop: "1px solid #f3f4f6" }}
                >
                  <Chip
                    label="Ativa"
                    size="small"
                    sx={{
                      background: "#dcfce7",
                      color: "#16a34a",
                      fontWeight: 600,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                  <Box
                    className="flex items-center gap-1"
                    sx={{ color: "#6366f1", fontSize: 13, fontWeight: 600 }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ color: "#6366f1" }}
                    >
                      Acessar
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: "#6366f1" }} />
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
          {editing ? "Editar conexão" : "Nova conexão"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": { borderColor: "#6366f1" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
              },
              "& label.Mui-focused": { color: "#6366f1" },
            }}
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
            disabled={!name.trim() || saving}
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

export default ConnectionsPage;
