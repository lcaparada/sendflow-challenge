import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HubIcon from "@mui/icons-material/Hub";
import { useNavigate } from "react-router-dom";
import {
  deleteConnection,
  useConnections,
  type ConnectionType,
} from "..";
import { useAuth } from "../../hooks";
import {
  ConfirmDialog,
  ConnectionCard,
  ConnectionFormDialog,
  EmptyState,
  LoadingIndicator,
  PageWrapper,
  openDialog,
} from "../../components";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(20);

  const [connections, loading] = useConnections(user?.uid ?? "", pageSize);

  const hasMore = connections.length === pageSize;

  function handleCreate() {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ConnectionFormDialog editing={null} />
      ),
    });
  }

  function handleEdit(connection: ConnectionType) {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ConnectionFormDialog editing={connection} />
      ),
    });
  }

  function handleDelete(id: string) {
    openDialog({
      maxWidth: "xs",
      fullWidth: true,
      slotProps: { paper: { sx: { borderRadius: 3 } } },
      children: (
        <ConfirmDialog
          title="Excluir conexão"
          description="Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita."
          onConfirm={() => deleteConnection(id)}
        />
      ),
    });
  }

  return (
    <PageWrapper
      title="Conexões"
      description={`${connections.length} conexão${connections.length !== 1 ? "es" : ""} cadastrada${connections.length !== 1 ? "s" : ""}`}
      button={{ icon: <AddIcon />, label: "Nova conexão", onClick: handleCreate }}
    >
      {loading ? (
        <LoadingIndicator />
      ) : connections.length === 0 ? (
        <EmptyState
          icon={<HubIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para começar"
          addLabel="Nova conexão"
          onAdd={handleCreate}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 2,
          }}
        >
          {connections.map((conn, i) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              index={i}
              onClick={() => navigate(`/connections/${conn.id}/contacts`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
    </PageWrapper>
  );
}
