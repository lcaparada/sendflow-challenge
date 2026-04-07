import { Dialog } from "@mui/material";
import { dialogs$, closeDialog } from "./DialogFacade";
import { DialogCloseContext } from "./DialogContext";
import { useBehavior } from "../../hooks/useBehavior";

export function DialogApp() {
  const dialogs = useBehavior(dialogs$);

  return (
    <>
      {dialogs.map((dialog) => {
        const { key, onDialogClose, ...props } = dialog;

        const close = (params?: unknown) => {
          onDialogClose?.(params);
          closeDialog({ key });
        };

        return (
          <DialogCloseContext.Provider key={key} value={close}>
            <Dialog {...props} open onClose={() => close()} />
          </DialogCloseContext.Provider>
        );
      })}
    </>
  );
}
