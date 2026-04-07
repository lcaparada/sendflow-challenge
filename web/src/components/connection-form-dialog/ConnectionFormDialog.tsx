import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  connectionSchema,
  createConnection,
  updateConnection,
  type ConnectionSchemaType,
  type ConnectionType,
} from "../../modules";
import { useCloseDialog } from "../dialog/DialogContext";

type ConnectionFormDialogProps = {
  editing: ConnectionType | null;
};

export function ConnectionFormDialog({ editing }: ConnectionFormDialogProps) {
  const close = useCloseDialog();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionSchemaType>({
    resolver: zodResolver(connectionSchema),
    defaultValues: { name: editing?.name ?? "" },
  });

  async function handleFormSubmit(data: ConnectionSchemaType) {
    if (editing) {
      await updateConnection(editing.id, data.name);
    } else {
      await createConnection(data.name);
    }
    close();
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
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
          onClick={() => close()}
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
          {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
        </Button>
      </DialogActions>
    </Box>
  );
}
