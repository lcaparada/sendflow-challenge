import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getInitials, toDate } from "../../utils";
import type { ContactType, MessageType } from "../../modules";

type MessageCardProps = {
  message: MessageType;
  index: number;
  contacts: ContactType[];
  onEdit: (message: MessageType) => void;
  onDelete: (id: string) => void;
};

export function MessageCard({
  message,
  index,
  contacts,
  onEdit,
  onDelete,
}: MessageCardProps) {
  const isSent = message.status === "sent";

  function contactName(id: string) {
    return contacts.find((c) => c.id === id)?.name ?? "Contato removido";
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        animation: `fadeUp 0.4s ease-out ${index * 0.04}s both`,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(99,102,241,0.12)",
          borderColor: "#c4b5fd",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box className="flex items-start justify-between gap-3">
          <Box
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            sx={{
              background: isSent
                ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                : "linear-gradient(135deg, #fef3c7, #fde68a)",
            }}
          >
            {isSent ? (
              <CheckCircleIcon sx={{ fontSize: 20, color: "#16a34a" }} />
            ) : (
              <ScheduleIcon sx={{ fontSize: 20, color: "#d97706" }} />
            )}
          </Box>

          <Box className="flex-1 min-w-0">
            <Box className="flex items-center gap-2 mb-1 flex-wrap">
              <Typography
                fontWeight={600}
                sx={{ color: "#1a1a2e", fontSize: 15, lineHeight: 1.4 }}
              >
                {message.content}
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
                <CheckCircleIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
              ) : (
                <ScheduleIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
              )}
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                {isSent ? "Enviada em" : "Agendada para"}{" "}
                {toDate(message.scheduledAt).toLocaleString("pt-BR")}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box className="flex flex-wrap gap-1">
              {message.contactIds.map((id) => {
                const name = contactName(id);
                const removed = name === "Contato removido";
                return (
                  <Box key={id} className="flex items-center gap-1">
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: 9,
                        fontWeight: 700,
                        background: removed
                          ? "#e5e7eb"
                          : "linear-gradient(135deg, #6366f1, #a855f7)",
                      }}
                    >
                      {removed ? "?" : getInitials(name)}
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        color: removed ? "#9ca3af" : "#6b7280",
                        fontWeight: 500,
                        fontStyle: removed ? "italic" : "normal",
                      }}
                    >
                      {name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box className="flex gap-0.5 shrink-0">
            {!isSent && (
              <Tooltip title="Editar">
                <IconButton
                  aria-label="Editar"
                  size="small"
                  onClick={() => onEdit(message)}
                  sx={{
                    color: "#9ca3af",
                    "&:hover": { color: "#6366f1", background: "#ede9fe" },
                  }}
                >
                  <EditIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Excluir">
              <IconButton
                aria-label="Excluir"
                size="small"
                onClick={() => onDelete(message.id)}
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
      </CardContent>
    </Card>
  );
}
