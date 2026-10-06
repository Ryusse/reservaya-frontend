import type { NewReservation } from "#/models/reservation";

export function toReservationPayload(input: NewReservation) {
	return {
		reservation: {
			space_id: input.spaceId,
			date: input.date,
			start_time: input.startTime,
			end_time: input.endTime,
			seats_reserved: input.seatsReserved,
		},
	};
}
