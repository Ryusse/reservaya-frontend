import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Provider } from "#/components/ui/provider";
import type { SpaceAvailability } from "#/models/availability";
import { AvailabilityView } from "./index";

const mockSpace = {
	id: 1,
	name: "Sala A",
	capacity: 10,
	location: "Piso 1",
	startTime: "08:00",
	endTime: "18:00",
	status: "active" as const,
	spaceType: "shared_space" as const,
};

describe("AvailabilityView", () => {
	it("shows 'not available' message when space is not available", () => {
		const data: SpaceAvailability = {
			space: mockSpace,
			date: "2026-10-10",
			available: false,
			blocks: [],
		};

		render(<AvailabilityView availability={data} />, { wrapper: Provider });

		expect(
			screen.getByText("Este espacio no está disponible."),
		).toBeInTheDocument();
	});

	it("renders free, partial, and full blocks with correct colors and labels", () => {
		const data: SpaceAvailability = {
			space: mockSpace,
			date: "2026-10-10",
			available: true,
			blocks: [
				{
					startTime: "08:00",
					endTime: "10:00",
					status: "free",
					seatsAvailable: 10,
				},
				{
					startTime: "10:00",
					endTime: "12:00",
					status: "partial",
					seatsAvailable: 5,
				},
				{
					startTime: "12:00",
					endTime: "14:00",
					status: "full",
					seatsAvailable: 0,
				},
			],
		};

		render(<AvailabilityView availability={data} />, { wrapper: Provider });

		// Check times
		expect(screen.getByText("08:00–10:00")).toBeInTheDocument();
		expect(screen.getByText("10:00–12:00")).toBeInTheDocument();
		expect(screen.getByText("12:00–14:00")).toBeInTheDocument();

		// Check seats
		expect(screen.getByText("10 cupos disponibles")).toBeInTheDocument();
		expect(screen.getByText("5 cupos disponibles")).toBeInTheDocument();
		expect(screen.getByText("0 cupos disponibles")).toBeInTheDocument();

		// Check badges
		expect(screen.getByText("Disponible")).toBeInTheDocument();
		expect(screen.getByText("Parcial")).toBeInTheDocument();
		expect(screen.getByText("Ocupado")).toBeInTheDocument();
	});
});
