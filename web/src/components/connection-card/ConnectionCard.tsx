import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HubIcon from "@mui/icons-material/Hub";
import type { ConnectionType } from "../../modules";
import { toDate } from "../../utils";

interface ConnectionCardProps {
  connection: ConnectionType;
  index: number;
  onClick: () => void;
  onEdit: (connection: ConnectionType) => void;
  onDelete: (id: string) => void;
}

export function ConnectionCard(props: ConnectionCardProps) {
  const { connection, index, onClick, onDelete, onEdit } = props;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        animation: `fadeUp 0.4s ease-out ${index * 0.05}s both`,
        "&:hover": {
          boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
          transform: "translateY(-2px)",
          borderColor: "#c4b5fd",
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box className="flex items-start justify-between">
          <Box className="flex items-center gap-3 flex-1 min-w-0">
            <Box
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              sx={{ background: "linear-gradient(135deg, #ede9fe, #f3e8ff)" }}
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
                {connection.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Criada em{" "}
                {toDate(connection.createdAt).toLocaleDateString("pt-BR")}
              </Typography>
            </Box>
          </Box>

          <Box
            className="flex gap-0.5 shrink-0 ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Editar">
              <IconButton
                aria-label="Editar"
                size="small"
                onClick={() => onEdit(connection)}
                sx={{
                  color: "#9ca3af",
                  "&:hover": { color: "#6366f1", background: "#ede9fe" },
                }}
              >
                <EditIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                aria-label="Excluir"
                size="small"
                onClick={() => onDelete(connection.id)}
                sx={{
                  color: "#9ca3af",
                  "&:hover": { color: "#ef4444", background: "#fee2e2" },
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
  );
}
