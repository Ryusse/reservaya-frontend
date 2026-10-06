import { describe, expect, it } from "vitest";

import { toSpaceAvailability } from "./availability.adapter";

describe("availability.adapter", () => {
	it("maps a shared space response with seats_available into camelCase blocks", () => {
		const result = toSpaceAvailability({
			id: 1,
			name: "Sala A",
			capacity: 10,
			location: "Building A, Floor 1",
			start_time: "08:00",
			end_time: "18:00",
			status: "active",
			space_type: "shared_space",
			date: "2026-09-20",
			reservations: [],
			availability: [
				{
					start_time: "08:00",
					end_time: "10:00",
					status: "free",
					seats_available: 10,
				},
				{
					start_time: "10:00",
					end_time: "12:00",
					status: "free",
					seats_available: 6,
				},
			],
		});

		expect(result.space.id).toBe(1);
		expect(result.date).toBe("2026-09-20");
		expect(result.available).toBe(true);
		expect(result.blocks).toEqual([
			{
				startTime: "08:00",
				endTime: "10:00",
				status: "free",
				seatsAvailable: 10,
			},
			{
				startTime: "10:00",
				endTime: "12:00",
				status: "free",
				seatsAvailable: 6,
			},
		]);
	});

	it("omits seatsAvailable for a private space block", () => {
		const result = toSpaceAvailability({
			id: 2,
			name: "Sala B",
			capacity: 1,
			location: "Building A, Floor 2",
			start_time: "08:00",
			end_time: "18:00",
			status: "active",
			space_type: "private_space",
			date: "2026-09-20",
			reservations: [],
			availability: [
				{ start_time: "08:00", end_time: "18:00", status: "full" },
			],
		});

		expect(result.blocks).toEqual([
			{ startTime: "08:00", endTime: "18:00", status: "full" },
		]);
		expect(result.blocks[0]).not.toHaveProperty("seatsAvailable");
	});

	it("maps an inactive space to available: false with no blocks", () => {
		const result = toSpaceAvailability({
			id: 3,
			name: "Sala C",
			capacity: 5,
			location: "Building B, Floor 1",
			start_time: "08:00",
			end_time: "18:00",
			status: "inactive",
			space_type: "shared_space",
			date: "2026-09-20",
			available: false,
			reservations: [],
			availability: [],
		});

		expect(result.available).toBe(false);
		expect(result.blocks).toEqual([]);
	});
});
