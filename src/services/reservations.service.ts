import type { ReservationResponse } from "#/adapters/reservation.adapter";
import {
	toReservation,
	toReservationPayload,
} from "#/adapters/reservation.adapter";
import { http } from "#/lib/http";
import type { NewReservation, Reservation } from "#/models/reservation";

export const reservationsService = {
	async list(): Promise<Reservation[]> {
		const { data } = await http.get<ReservationResponse[]>("/reservations");
		return data.map(toReservation);
	},

	async create(input: NewReservation): Promise<void> {
		await http.post("/reservations", toReservationPayload(input));
	},

	async cancel(id: number): Promise<void> {
		await http.patch(`/reservations/${id}/cancel`, {});
	},
};
