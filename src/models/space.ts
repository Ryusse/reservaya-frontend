import { z } from "zod";

export type SpaceStatus = "active" | "inactive";

export type Space = {
	id: number;
	name: string;
	capacity: number;
	location: string;
	startTime: string | null;
	endTime: string | null;
	status: SpaceStatus;
};

export const newSpaceSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio"),
	location: z.string().trim().min(1, "La ubicación es obligatoria"),
	capacity: z.number().int().min(1, "La capacidad debe ser al menos 1"),
	startTime: z.string().min(1, "La hora de apertura es obligatoria"),
	endTime: z.string().min(1, "La hora de cierre es obligatoria"),
});

export type NewSpace = z.infer<typeof newSpaceSchema>;
