import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(1, "Mensagem é obrigatória"),
  scheduledAt: z.string().min(1, "Data e hora são obrigatórias"),
  contactIds: z.array(z.string()).min(1, "Selecione pelo menos um contato"),
});

export type MessageSchemaType = z.infer<typeof messageSchema>;
