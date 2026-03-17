import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
});

export type ContactSchemaType = z.infer<typeof contactSchema>;
