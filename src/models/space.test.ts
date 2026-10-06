import { describe, expect, it } from "vitest";

import { newSpaceSchema } from "./space";

describe("newSpaceSchema (HU01 · Registro de espacios / HU02 · Modificación de espacio)", () => {
	const valid = {
		name: "Sala A",
		location: "Piso 2",
		capacity: 10,
		startTime: "08:00",
		endTime: "17:00",
	};

	it("accepts a valid space", () => {
		expect(newSpaceSchema.safeParse(valid).success).toBe(true);
	});

	it("requires a non-blank name", () => {
		const result = newSpaceSchema.safeParse({ ...valid, name: "   " });
		expect(result.success).toBe(false);
	});

	it("requires a non-blank location", () => {
		const result = newSpaceSchema.safeParse({ ...valid, location: "" });
		expect(result.success).toBe(false);
	});

	it("rejects a capacity of 0 or less", () => {
		expect(newSpaceSchema.safeParse({ ...valid, capacity: 0 }).success).toBe(
			false,
		);
		expect(newSpaceSchema.safeParse({ ...valid, capacity: -1 }).success).toBe(
			false,
		);
	});

	it("requires both start and end time", () => {
		expect(newSpaceSchema.safeParse({ ...valid, startTime: "" }).success).toBe(
			false,
		);
		expect(newSpaceSchema.safeParse({ ...valid, endTime: "" }).success).toBe(
			false,
		);
	});
});
