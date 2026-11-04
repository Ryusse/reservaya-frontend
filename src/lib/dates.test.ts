import { describe, expect, it } from "vitest";

import { maxAdvanceIso, toIsoDate } from "./dates";

describe("dates", () => {
	it("toIsoDate uses the local calendar day, not the UTC day", () => {
		const localEvening = new Date(2026, 10, 3, 21, 30);

		expect(toIsoDate(localEvening)).toBe("2026-11-03");
	});

	it("maxAdvanceIso returns a date the given number of days ahead", () => {
		const expected = new Date();
		expected.setDate(expected.getDate() + 7);

		expect(maxAdvanceIso(7)).toBe(toIsoDate(expected));
	});
});
