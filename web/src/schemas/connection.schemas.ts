import { z } from "zod";

export const connectionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export type ConnectionSchemaType = z.infer<typeof connectionSchema>;
