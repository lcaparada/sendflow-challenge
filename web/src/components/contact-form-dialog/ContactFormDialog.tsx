import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";
import { useEffect } from "react";
import {
  contactSchema,
  type ContactSchemaType,
  type ContactType,
} from "../../modules";

type ContactFormDialogProps = {
  open: boolean;
  editing: ContactType | null;
  onClose: () => void;
  onSubmit: (data: ContactSchemaType) => Promise<void>;
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#6366f1" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
  },
  "& label.Mui-focused": { color: "#6366f1" },
};

export function ContactFormDialog({
  open,
  editing,
  onClose,
  onSubmit,
}: ContactFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactSchemaType>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? { name: editing.name, phone: editing.phone }
          : { name: "", phone: "" },
      );
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
          {editing ? "Editar contato" : "Novo contato"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <TextField
            label="Nome"
            fullWidth
            autoFocus
            placeholder="Digite o nome do contato"
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={textFieldSx}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                label="Telefone"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
                value={field.value}
                onChange={field.onChange}
                inputRef={field.ref}
                slotProps={{
                  input: {
                    inputComponent: IMaskInput as never,
                    inputProps: {
                      mask: [
                        { mask: "(00) 0000-0000" },
                        { mask: "(00) 00000-0000" },
                      ],
                      onAccept: (value: string) => field.onChange(value),
                      placeholder: "(21) 98812-6131",
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
              />
            )}
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
