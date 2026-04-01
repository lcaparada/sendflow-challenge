import { Box, CircularProgress } from "@mui/material";
import { cn } from "../lib";

export function LoadingIndicator({
  className,
  ...boxProps
}: React.ComponentProps<"div">) {
  return (
    <Box className={cn("flex justify-center mt-24", className)} {...boxProps}>
      <CircularProgress sx={{ color: "#6366f1" }} />
    </Box>
  );
}
