import { z } from "zod";

export const registrationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre es obligatorio")
		.max(50, "El nombre es demasiado largo")
		.regex(/^[^<>]*$/, "El nombre contiene caracteres inválidos (XSS risk)"),
	email: z.string().email("Correo inválido").max(100, "Correo demasiado largo"),
	password: z
		.string()
		.min(6, "Mínimo 6 caracteres")
		.max(64, "Máximo 64 caracteres")
		.regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
		.regex(/[0-9]/, "Debe contener al menos un número"),
});

export type Registration = z.infer<typeof registrationSchema>;
