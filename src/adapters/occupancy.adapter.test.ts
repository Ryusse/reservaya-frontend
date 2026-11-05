import { describe, expect, it } from "vitest";

import { type OccupancyResponse, toOccupancyReport } from "./occupancy.adapter";

const response: OccupancyResponse = {
	from: "2026-11-03",
	to: "2026-11-03",
	days: 1,
	summary: {
		occupancy_rate: 0.5,
		reservations: 2,
		underused_spaces: 1,
		high_demand_spaces: 0,
	},
	spaces: [
		{
			id: 4,
			name: "Cabina Individual 2",
			space_type: "private_space",
			capacity: 1,
			occupancy_rate: 0.5,
			reservations: 2,
			classification: "normal",
			hours: [{ hour: 9, occupancy_rate: 1 }],
			days: [{ date: "2026-11-03", occupancy_rate: 0.5 }],
		},
	],
};

describe("occupancy.adapter", () => {
	it("maps snake_case fields to the frontend model", () => {
		expect(toOccupancyReport(response)).toEqual({
			from: "2026-11-03",
			to: "2026-11-03",
			days: 1,
			summary: {
				occupancyRate: 0.5,
				reservations: 2,
				underusedSpaces: 1,
				highDemandSpaces: 0,
			},
			spaces: [
				{
					id: 4,
					name: "Cabina Individual 2",
					spaceType: "private_space",
					capacity: 1,
					occupancyRate: 0.5,
					reservations: 2,
					classification: "normal",
					hours: [{ hour: 9, occupancyRate: 1 }],
					days: [{ date: "2026-11-03", occupancyRate: 0.5 }],
				},
			],
		});
	});

	it("falls back to normal for unknown classifications and shared_space for unknown types", () => {
		const result = toOccupancyReport({
			...response,
			spaces: [
				{
					...response.spaces[0],
					space_type: "weird",
					classification: "weird",
				},
			],
		});

		expect(result.spaces[0].classification).toBe("normal");
		expect(result.spaces[0].spaceType).toBe("shared_space");
	});
});
