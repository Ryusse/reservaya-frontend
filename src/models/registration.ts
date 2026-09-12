import { z } from "zod";

export const registrationSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio"),
	email: z.email("Correo inválido"),
	password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type Registration = z.infer<typeof registrationSchema>;
