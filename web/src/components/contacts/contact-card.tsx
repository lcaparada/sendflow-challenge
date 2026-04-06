import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";
import type { ContactType } from "../../modules";
import { getInitials } from "../../utils";

interface ContactCardProps {
  contact: ContactType;
  index: number;
  onEdit: (contact: ContactType) => void;
  onDelete: (id: string) => void;
}

export function ContactCard(props: ContactCardProps) {
  const { contact, index, onDelete, onEdit } = props;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        animation: `fadeUp 0.4s ease-out ${index * 0.04}s both`,
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
                flexShrink: 0,
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
                aria-label="Editar"
                size="small"
                onClick={() => onEdit(contact)}
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
                onClick={() => onDelete(contact.id)}
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
