import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  connectionSchema,
  type ConnectionSchemaType,
  type ConnectionType,
} from "../../modules";

type ConnectionFormDialogProps = {
  open: boolean;
  editing: ConnectionType | null;
  onClose: () => void;
  onSubmit: (data: ConnectionSchemaType) => Promise<void>;
};

export function ConnectionFormDialog({
  open,
  editing,
  onClose,
  onSubmit,
}: ConnectionFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionSchemaType>({
    resolver: zodResolver(connectionSchema),
  });

  useEffect(() => {
    if (open) {
      reset({ name: editing?.name ?? "" });
    }
  }, [open, editing, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? "Editar conexão" : "Nova conexão"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da conexão"
            fullWidth
            autoFocus
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
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
            type="button"
            onClick={onClose}
            sx={{ borderRadius: 2, textTransform: "none", color: "#6b7280" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
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
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
