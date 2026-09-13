import { describe, expect, it } from "vitest";

import { registrationSchema } from "./registration";

describe("registrationSchema (HU03 · Registro de nuevo usuario)", () => {
	it("accepts a valid registration", () => {
		const result = registrationSchema.safeParse({
			name: "Ana Pérez",
			email: "ana@example.com",
			password: "secreto123",
		});

		expect(result.success).toBe(true);
	});

	it("requires a non-blank name", () => {
		const result = registrationSchema.safeParse({
			name: "   ",
			email: "ana@example.com",
			password: "secreto123",
		});

		expect(result.success).toBe(false);
	});

	it("rejects an invalid email", () => {
		const result = registrationSchema.safeParse({
			name: "Ana",
			email: "no-es-un-correo",
			password: "secreto123",
		});

		expect(result.success).toBe(false);
	});

	it("requires at least 6 characters for the password", () => {
		const result = registrationSchema.safeParse({
			name: "Ana",
			email: "ana@example.com",
			password: "123",
		});

		expect(result.success).toBe(false);
	});
});
