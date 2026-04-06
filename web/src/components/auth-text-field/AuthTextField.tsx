import { TextField, type TextFieldProps } from "@mui/material";

export function AuthTextField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          "&:hover fieldset": { borderColor: "#6366f1" },
          "&.Mui-focused fieldset": { borderColor: "#6366f1" },
        },
        "& label.Mui-focused": { color: "#6366f1" },
        ...props.sx,
      }}
    />
  );
}
