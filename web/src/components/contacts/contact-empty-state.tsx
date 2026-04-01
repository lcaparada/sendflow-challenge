import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContactsIcon from "@mui/icons-material/Contacts";

type ContactEmptyStateProps = {
  onAdd: () => void;
};

export function ContactEmptyState({ onAdd }: ContactEmptyStateProps) {
  return (
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
        onClick={onAdd}
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
  );
}
