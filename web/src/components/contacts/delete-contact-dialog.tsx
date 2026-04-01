import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type DeleteContactDialogProps = {
  open: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteContactDialog({
  open,
  deleting,
  onClose,
  onConfirm,
}: DeleteContactDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningAmberRoundedIcon sx={{ color: "#ef4444" }} />
        Excluir contato
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "#6b7280" }}>
          Tem certeza que deseja excluir este contato? Esta ação não pode ser
          desfeita.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: 2, textTransform: "none", color: "#6b7280" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={deleting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            background: "#ef4444",
            "&:hover": { background: "#dc2626" },
          }}
        >
          {deleting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Excluir"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
