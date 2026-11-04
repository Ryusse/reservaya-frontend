import { toSpaceType } from "#/adapters/space.adapter";
import type {
	NewReservation,
	Reservation,
	ReservationStatus,
} from "#/models/reservation";

export type ReservationResponse = {
	id: number;
	date: string;
	start_time: string;
	end_time: string;
	status: string;
	seats_reserved: number;
	cancellable: boolean;
	space: {
		id: number;
		name: string;
		location: string;
		space_type: string;
		status: string;
	};
};

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

export function toReservation(data: ReservationResponse): Reservation {
	return {
		id: data.id,
		date: data.date,
		startTime: data.start_time,
		endTime: data.end_time,
		status: (data.status === "cancelled"
			? "cancelled"
			: "confirmed") as ReservationStatus,
		seatsReserved: data.seats_reserved,
		cancellable: data.cancellable,
		space: {
			id: data.space.id,
			name: data.space.name,
			location: data.space.location,
			spaceType: toSpaceType(data.space.space_type),
		},
	};
}
