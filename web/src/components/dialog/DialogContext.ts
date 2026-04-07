import { createContext, useContext } from "react";

export const DialogCloseContext = createContext<(params?: unknown) => void>(
  () => {},
);

export function useCloseDialog<T = void>() {
  const close = useContext(DialogCloseContext);

  if (!close) {
    throw new Error("useCloseDialog must be used inside a DialogApp");
  }

  return close as (params?: T) => void;
}
