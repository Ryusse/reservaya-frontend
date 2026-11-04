import { describe, expect, it } from "vitest";

import {
	type ReservationResponse,
	toReservation,
	toReservationPayload,
} from "./reservation.adapter";

const response: ReservationResponse = {
	id: 7,
	date: "2026-11-10",
	start_time: "09:00",
	end_time: "10:30",
	status: "confirmed",
	seats_reserved: 2,
	cancellable: true,
	space: {
		id: 3,
		name: "Sala B",
		location: "Piso 2",
		space_type: "shared_space",
		status: "active",
	},
};

describe("reservation.adapter", () => {
	it("toReservation maps snake_case fields and the nested space", () => {
		expect(toReservation(response)).toEqual({
			id: 7,
			date: "2026-11-10",
			startTime: "09:00",
			endTime: "10:30",
			status: "confirmed",
			seatsReserved: 2,
			cancellable: true,
			space: {
				id: 3,
				name: "Sala B",
				location: "Piso 2",
				spaceType: "shared_space",
			},
		});
	});

	it("toReservation keeps a cancelled status and a non-cancellable flag", () => {
		const result = toReservation({
			...response,
			status: "cancelled",
			cancellable: false,
		});

		expect(result.status).toBe("cancelled");
		expect(result.cancellable).toBe(false);
	});

	it("toReservation falls back to shared_space for unknown space types", () => {
		const result = toReservation({
			...response,
			space: { ...response.space, space_type: "unknown" },
		});

		expect(result.space.spaceType).toBe("shared_space");
	});

	it("toReservationPayload wraps the create input under reservation", () => {
		expect(
			toReservationPayload({
				spaceId: 3,
				date: "2026-11-10",
				startTime: "09:00",
				endTime: "10:00",
				seatsReserved: 1,
			}),
		).toEqual({
			reservation: {
				space_id: 3,
				date: "2026-11-10",
				start_time: "09:00",
				end_time: "10:00",
				seats_reserved: 1,
			},
		});
	});
});
