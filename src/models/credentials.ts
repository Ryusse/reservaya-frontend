import { z } from "zod";

export const credentialsSchema = z.object({
	email: z.string().email("Correo inválido").max(100, "Correo demasiado largo"),
	password: z
		.string()
		.min(1, "La contraseña es obligatoria")
		.max(64, "Máximo 64 caracteres"),
});

export type Credentials = z.infer<typeof credentialsSchema>;
