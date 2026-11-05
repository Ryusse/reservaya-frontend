import { z } from "zod";

import type { Space } from "#/models/space";

export type NewReservation = {
	spaceId: number;
	date: string;
	startTime: string;
	endTime: string;
	seatsReserved: number;
};

export type ReservationStatus = "confirmed" | "cancelled";

export type ReservationSpace = Pick<
	Space,
	"id" | "name" | "location" | "spaceType"
>;

export type Reservation = {
	id: number;
	date: string;
	startTime: string;
	endTime: string;
	status: ReservationStatus;
	seatsReserved: number;
	cancellable: boolean;
	space: ReservationSpace;
};

export function reservationChangeSchema(spaces: Space[]) {
	return z
		.object({
			spaceId: z.number().int().positive("Selecciona un espacio"),
			date: z.string().min(1, "La fecha es obligatoria"),
			startTime: z.string().min(1, "La hora de inicio es obligatoria"),
			endTime: z.string().min(1, "La hora de fin es obligatoria"),
			seatsReserved: z.number().int().min(1, "Debe reservar al menos 1 cupo"),
		})
		.superRefine((values, context) => {
			if (values.endTime <= values.startTime) {
				context.addIssue({
					code: "custom",
					path: ["endTime"],
					message: "La hora de fin debe ser posterior a la de inicio",
				});
			}

			const capacity = spaces.find(
				(space) => space.id === values.spaceId,
			)?.capacity;

			if (capacity !== undefined && values.seatsReserved > capacity) {
				context.addIssue({
					code: "custom",
					path: ["seatsReserved"],
					message: `No hay más de ${capacity} cupos en este espacio`,
				});
			}
		});
}
