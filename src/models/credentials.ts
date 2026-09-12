import { z } from "zod";

export const credentialsSchema = z.object({
	email: z.email("Correo inválido"),
	password: z.string().min(1, "La contraseña es obligatoria"),
});

export type Credentials = z.infer<typeof credentialsSchema>;
