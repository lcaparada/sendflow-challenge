import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type PageWrapperProps = {
  title: string;
  description: string;
  button?: {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    show?: boolean;
  };
  children: React.ReactNode;
};

export function PageWrapper({
  title,
  button,
  children,
  description,
  search,
}: PageWrapperProps) {
  return (
    <Box sx={{ animation: "fadeUp 0.4s ease-out both" }}>
      <Box className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#1a1a2e", lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
        {button && (
          <Button
            variant="contained"
            startIcon={button.icon}
            onClick={button.onClick}
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
            {button.label}
          </Button>
        )}
      </Box>
      {search?.show && (
        <TextField
          placeholder={search.placeholder ?? "Buscar..."}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          size="small"
          sx={{
            mb: 4,
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": { borderColor: "#6366f1" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
          }}
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
      {children}
    </Box>
  );
}
