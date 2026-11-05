import { describe, expect, it } from "vitest";

import { reservationChangeSchema } from "#/models/reservation";
import type { Space } from "#/models/space";

const spaces: Space[] = [
	{
		id: 1,
		name: "Sala A",
		capacity: 4,
		location: "Piso 1",
		startTime: "08:00",
		endTime: "18:00",
		status: "active",
		spaceType: "shared_space",
	},
];

const valid = {
	spaceId: 1,
	date: "2026-11-10",
	startTime: "09:00",
	endTime: "10:00",
	seatsReserved: 2,
};

describe("reservationChangeSchema", () => {
	it("accepts a valid change", () => {
		expect(reservationChangeSchema(spaces).safeParse(valid).success).toBe(true);
	});

	it("rejects an end time that is not after the start time", () => {
		const result = reservationChangeSchema(spaces).safeParse({
			...valid,
			endTime: "09:00",
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			"La hora de fin debe ser posterior a la de inicio",
		);
	});

	it("rejects more seats than the chosen space capacity", () => {
		const result = reservationChangeSchema(spaces).safeParse({
			...valid,
			seatsReserved: 5,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			"No hay más de 4 cupos en este espacio",
		);
	});

	it("requires at least one seat", () => {
		const result = reservationChangeSchema(spaces).safeParse({
			...valid,
			seatsReserved: 0,
		});

		expect(result.success).toBe(false);
	});
});
