import { describe, expect, it } from "vitest";

import {
	currentMonthRange,
	heatBackground,
	heatLevel,
	hourRangeError,
	MAX_PERIOD_DAYS,
	parseOccupancySearch,
	periodDays,
	periodError,
} from "./occupancy";

describe("occupancy helpers", () => {
	it("currentMonthRange covers the whole month of the given date", () => {
		expect(currentMonthRange(new Date(2026, 10, 15))).toEqual({
			from: "2026-11-01",
			to: "2026-11-30",
		});
	});

	it("periodDays counts both ends inclusively", () => {
		expect(periodDays("2026-11-03", "2026-11-03")).toBe(1);
		expect(periodDays("2026-11-01", "2026-11-30")).toBe(30);
	});

	it("accepts a period of exactly the maximum length", () => {
		const to = new Date(Date.UTC(2026, 10, 1 + MAX_PERIOD_DAYS - 1))
			.toISOString()
			.slice(0, 10);

		expect(periodError("2026-11-01", to)).toBeNull();
	});

	it("rejects a period longer than the maximum", () => {
		expect(periodError("2026-01-01", "2026-06-01")).toBe(
			`El periodo no puede superar ${MAX_PERIOD_DAYS} días`,
		);
	});

	it("rejects an inverted period and malformed dates", () => {
		expect(periodError("2026-11-05", "2026-11-01")).toBe(
			"La fecha inicial no puede ser posterior a la final",
		);
		expect(periodError("no-es-fecha", "2026-11-01")).toBe(
			"Fecha inválida. Usa el formato AAAA-MM-DD",
		);
	});

	it("maps occupancy rates to heat levels at the classification thresholds", () => {
		expect(heatLevel(0)).toBe(0);
		expect(heatLevel(0.01)).toBe(1);
		expect(heatLevel(0.249)).toBe(1);
		expect(heatLevel(0.25)).toBe(2);
		expect(heatLevel(0.749)).toBe(2);
		expect(heatLevel(0.75)).toBe(3);
		expect(heatLevel(1)).toBe(3);
	});

	it("paints zero occupancy neutral and the rest in the blue scale", () => {
		expect(heatBackground(0)).toBe("bg.muted");
		expect(heatBackground(1)).toBe("colorPalette.subtle");
		expect(heatBackground(3)).toBe("colorPalette.solid");
	});

	it("parses hour params and drops values outside 0 to 23", () => {
		expect(parseOccupancySearch({ fromHour: 9, toHour: "18" })).toMatchObject({
			fromHour: 9,
			toHour: 18,
		});
		expect(parseOccupancySearch({ fromHour: 24, toHour: "x" })).toMatchObject({
			fromHour: undefined,
			toHour: undefined,
		});
	});

	it("rejects an inverted hour range", () => {
		expect(hourRangeError(15, 9)).toBe(
			"La hora inicial no puede ser posterior a la final",
		);
		expect(hourRangeError(9, 15)).toBeNull();
	});

	it("parses search params and drops invalid values", () => {
		expect(
			parseOccupancySearch({ from: "2026-11-01", to: "bad", spaceId: "4" }),
		).toEqual({ from: "2026-11-01", to: undefined, spaceId: 4 });

		expect(parseOccupancySearch({ spaceId: "0" })).toEqual({
			from: undefined,
			to: undefined,
			spaceId: undefined,
		});
	});
});
