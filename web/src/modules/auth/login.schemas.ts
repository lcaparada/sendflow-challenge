import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
