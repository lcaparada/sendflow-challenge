import { useState } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import type { UseFormRegisterReturn } from "react-hook-form";
import { AuthTextField } from "./auth-text-field";

type PasswordFieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  helperText?: string;
};

export function PasswordField({
  label,
  registration,
  error,
  helperText,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <AuthTextField
      label={label}
      type={show ? "text" : "password"}
      placeholder="******"
      fullWidth
      error={!!error}
      helperText={error ?? helperText}
      {...registration}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: "#9ca3af", fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShow((v) => !v)} edge="end" size="small">
                {show ? (
                  <VisibilityOff sx={{ fontSize: 20, color: "#9ca3af" }} />
                ) : (
                  <Visibility sx={{ fontSize: 20, color: "#9ca3af" }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
