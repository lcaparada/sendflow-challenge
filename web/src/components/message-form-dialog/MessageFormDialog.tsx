import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createMessage,
  messageSchema,
  updateMessage,
  type ContactType,
  type MessageSchemaType,
  type MessageType,
} from "../../modules";
import { formatToDatetimeLocal, getInitials, toDate } from "../../utils";
import { useCloseDialog } from "../dialog/DialogContext";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#6366f1" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
  },
  "& label.Mui-focused": { color: "#6366f1" },
};

type MessageFormDialogProps = {
  editing: MessageType | null;
  contacts: ContactType[];
  connectionId: string;
};

export function MessageFormDialog({
  editing,
  contacts,
  connectionId,
}: MessageFormDialogProps) {
  const close = useCloseDialog();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MessageSchemaType>({
    resolver: zodResolver(messageSchema),
    defaultValues: editing
      ? {
          content: editing.content,
          scheduledAt: formatToDatetimeLocal(toDate(editing.scheduledAt)),
          contactIds: editing.contactIds,
        }
      : { content: "", scheduledAt: "", contactIds: [] },
  });

  const selectedContacts = useWatch({ control, name: "contactIds", defaultValue: [] });

  function toggleContact(id: string) {
    const current = selectedContacts ?? [];
    setValue(
      "contactIds",
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldValidate: true },
    );
  }

  async function handleFormSubmit(data: MessageSchemaType) {
    if (editing) {
      await updateMessage(editing.id, data.contactIds, data.content, new Date(data.scheduledAt));
    } else {
      await createMessage(connectionId, data.contactIds, data.content, new Date(data.scheduledAt));
    }
    close();
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {editing ? "Editar mensagem" : "Nova mensagem"}
      </DialogTitle>

      <DialogContent className="flex flex-col gap-3">
        <TextField
          label="Mensagem"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          autoFocus
          error={!!errors.content}
          helperText={errors.content?.message}
          {...register("content")}
          sx={textFieldSx}
        />

        <Box>
          <Box className="flex items-center justify-between mb-1">
            <Typography variant="body2" fontWeight={600} sx={{ color: "#374151" }}>
              Data e hora de envio
            </Typography>
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() =>
                setValue("scheduledAt", formatToDatetimeLocal(new Date()), {
                  shouldValidate: true,
                })
              }
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 11,
                px: 1.5,
                py: 0.3,
                borderColor: "#6366f1",
                color: "#6366f1",
                "&:hover": { background: "#ede9fe", borderColor: "#6366f1" },
              }}
            >
              Agora
            </Button>
          </Box>
          <TextField
            type="datetime-local"
            fullWidth
            error={!!errors.scheduledAt}
            helperText={errors.scheduledAt?.message}
            {...register("scheduledAt")}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={textFieldSx}
          />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: "#374151", mb: 1 }}>
            Contatos{" "}
            {selectedContacts.length > 0 && (
              <Chip
                label={selectedContacts.length}
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 11,
                  height: 20,
                  ml: 0.5,
                }}
              />
            )}
          </Typography>

          {contacts.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Nenhum contato nesta conexão.
            </Typography>
          ) : (
            <Box
              className="flex flex-col gap-1 rounded-xl p-2"
              sx={{ border: "1px solid #f0f0f0", maxHeight: 200, overflowY: "auto" }}
            >
              {contacts.map((contact) => {
                const checked = selectedContacts.includes(contact.id);
                return (
                  <FormControlLabel
                    key={contact.id}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleContact(contact.id)}
                        size="small"
                        sx={{
                          color: "#d1d5db",
                          "&.Mui-checked": { color: "#6366f1" },
                        }}
                      />
                    }
                    label={
                      <Box className="flex items-center gap-2">
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: 10,
                            fontWeight: 700,
                            background: checked
                              ? "linear-gradient(135deg, #6366f1, #a855f7)"
                              : "#e5e7eb",
                            color: checked ? "white" : "#9ca3af",
                          }}
                        >
                          {getInitials(contact.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                            {contact.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                            {contact.phone}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{
                      mx: 0,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      "&:hover": { background: "#fafafa" },
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
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
