import { BehaviorSubject } from "rxjs";
import type { DialogProps } from "@mui/material";

export type DialogEntry = Omit<DialogProps, "open"> & {
  key: string;
  onDialogClose?: (params?: unknown) => void;
};

export const dialogs$ = new BehaviorSubject<DialogEntry[]>([]);

export function openDialog(
  props: Omit<DialogEntry, "key">,
) {
  const entry: DialogEntry = { ...props, key: crypto.randomUUID() };
  dialogs$.next([...dialogs$.value, entry]);
}

export function closeDialog(dialog: Pick<DialogEntry, "key">) {
  dialogs$.next(dialogs$.value.filter((d) => d.key !== dialog.key));
}
