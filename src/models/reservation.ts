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
