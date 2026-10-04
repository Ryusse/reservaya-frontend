import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { http } from "#/lib/http";
import { spacesService } from "./spaces.service";

vi.mock("#/lib/http", () => ({
	http: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

function axiosError(status: number, data: unknown) {
	return new AxiosError(
		"Request failed",
		String(status),
		undefined,
		undefined,
		{
			status,
			data,
			statusText: "",
			headers: {},
			config: { headers: new AxiosHeaders() },
		},
	);
}

describe("spacesService.getAvailability", () => {
	beforeEach(() => {
		vi.mocked(http.get).mockReset();
	});

	it("calls GET /spaces/:id with the date param and maps the response", async () => {
		vi.mocked(http.get).mockResolvedValue({
			data: {
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
						end_time: "18:00",
						status: "available",
						seats_available: 10,
					},
				],
			},
		});

		const result = await spacesService.getAvailability(1, "2026-09-20");

		expect(http.get).toHaveBeenCalledWith("/spaces/1", {
			params: { date: "2026-09-20" },
		});
		expect(result.available).toBe(true);
		expect(result.blocks).toEqual([
			{
				startTime: "08:00",
				endTime: "18:00",
				status: "available",
				seatsAvailable: 10,
			},
		]);
	});

	it("rejects with the 404 error when the space does not exist", async () => {
		vi.mocked(http.get).mockRejectedValue(
			axiosError(404, { error: "No encontrado" }),
		);

		await expect(
			spacesService.getAvailability(999, "2026-09-20"),
		).rejects.toMatchObject({
			response: { status: 404 },
		});
	});

	it("rejects with the 422 error for an out-of-range date", async () => {
		vi.mocked(http.get).mockRejectedValue(
			axiosError(422, {
				errors: ["date debe estar dentro de los próximos 7 días"],
			}),
		);

		await expect(
			spacesService.getAvailability(1, "2026-12-31"),
		).rejects.toMatchObject({
			response: { status: 422 },
		});
	});
});
