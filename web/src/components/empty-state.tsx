import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
};

export function EmptyState({
  icon,
  title,
  description,
  addLabel,
  onAdd,
}: EmptyStateProps) {
  return (
    <Box
      className="flex flex-col items-center justify-center py-24 rounded-2xl"
      sx={{ border: "2px dashed #e5e7eb", background: "#fafafa" }}
    >
      <Box
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
        sx={{ background: "linear-gradient(135deg, #ede9fe, #f3e8ff)" }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ color: "#374151", mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
        {description}
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
        {addLabel}
      </Button>
    </Box>
  );
}
