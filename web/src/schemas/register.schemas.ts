import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
