import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HubIcon from "@mui/icons-material/Hub";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  createConnection,
  deleteConnection,
  updateConnection,
  useConnections,
  type ConnectionSchemaType,
  type ConnectionType,
} from "../modules";
import { useAuth } from "../hooks";
import {
  ConfirmDialog,
  ConnectionCard,
  ConnectionFormDialog,
  EmptyState,
  LoadingIndicator,
  PageWrapper,
} from "../components";

const ConnectionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(20);
  const [connections, loading] = useConnections(user?.uid ?? "", pageSize);
  const hasMore = connections.length === pageSize;

  const [formDialog, setFormDialog] = useState<{
    connection: ConnectionType | null;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    loading: boolean;
  } | null>(null);

  const openCreate = () => setFormDialog({ connection: null });
  const openEdit = (connection: ConnectionType) =>
    setFormDialog({ connection });
  const closeDialog = () => setFormDialog(null);

  const onSubmit = async (data: ConnectionSchemaType) => {
    if (!user) return;
    if (formDialog?.connection) {
      await updateConnection(formDialog.connection.id, data.name);
    } else {
      await createConnection(data.name);
    }
    closeDialog();
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
    setDeleteDialog({ ...deleteDialog, loading: true });
    try {
      await deleteConnection(deleteDialog.id);
      setDeleteDialog(null);
    } catch {
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  return (
    <PageWrapper
      title="Conexões"
      description={`${connections.length} conexão${connections.length !== 1 ? "es" : ""} cadastrada${connections.length !== 1 ? "s" : ""}`}
      button={{ icon: <AddIcon />, label: "Nova conexão", onClick: openCreate }}
    >
      {loading ? (
        <LoadingIndicator />
      ) : connections.length === 0 ? (
        <EmptyState
          icon={<HubIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para começar"
          addLabel="Nova conexão"
          onAdd={openCreate}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 2,
          }}
        >
          {connections.map((conn, i) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              index={i}
              onClick={() => navigate(`/connections/${conn.id}/contacts`)}
              onEdit={openEdit}
              onDelete={(id) => setDeleteDialog({ id, loading: false })}
            />
          ))}
          {hasMore && (
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

      <ConnectionFormDialog
        open={formDialog !== null}
        editing={formDialog?.connection ?? null}
        onClose={closeDialog}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={deleteDialog !== null}
        loading={deleteDialog?.loading ?? false}
        title="Excluir conexão"
        description="Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita."
        onClose={() => setDeleteDialog(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageWrapper>
  );
};

export default ConnectionsPage;
