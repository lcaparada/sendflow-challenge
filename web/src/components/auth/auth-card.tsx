import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface AuthCardProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  isSubmitting: boolean;
  error?: string;
  footer: { text: string; linkLabel: string; to: string };
  onSubmit: React.SubmitEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}

export function AuthCard(props: AuthCardProps) {
  const {
    footer,
    isSubmitting,
    onSubmit,
    submitLabel,
    subtitle,
    title,
    error,
    children,
  } = props;

  return (
    <>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color: "#1a1a2e", mb: 1 }}
      >
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: "#6b7280", mb: 4 }}>
        {subtitle}
      </Typography>

      {error && (
        <Alert
          severity="error"
          className="mb-4"
          sx={{ borderRadius: 2, animation: "shake 0.4s ease-out" }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
          sx={{
            mt: 1,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: 16,
            textTransform: "none",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            transition: "all 0.2s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #4f52e0 0%, #7c3aed 100%)",
              boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
              transform: "translateY(-1px)",
            },
            "&:active": { transform: "translateY(0)" },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            submitLabel
          )}
        </Button>
      </Box>

      <Typography
        variant="body2"
        className="pt-6 text-center"
        sx={{ color: "#6b7280" }}
      >
        {footer.text}{" "}
        <Link
          component={RouterLink}
          to={footer.to}
          sx={{
            color: "#6366f1",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {footer.linkLabel}
        </Link>
      </Typography>
    </>
  );
}
