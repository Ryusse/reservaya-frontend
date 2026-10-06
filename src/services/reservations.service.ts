import { toReservationPayload } from "#/adapters/reservation.adapter";
import { http } from "#/lib/http";
import type { NewReservation } from "#/models/reservation";

export const reservationsService = {
	async create(input: NewReservation): Promise<void> {
		await http.post("/reservations", toReservationPayload(input));
	},
};
