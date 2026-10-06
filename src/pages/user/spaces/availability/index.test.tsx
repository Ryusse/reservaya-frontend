import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Provider } from "#/components/ui/provider";
import { spacesService } from "#/services/spaces.service";
import { UserSpaceAvailabilityPage } from "./index";

vi.mock("#/services/spaces.service", () => ({
	spacesService: {
		list: vi.fn(),
		getAvailability: vi.fn(),
	},
}));

describe("UserSpaceAvailabilityPage", () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	const renderPage = () =>
		render(
			<QueryClientProvider client={queryClient}>
				<Provider>
					<UserSpaceAvailabilityPage />
				</Provider>
			</QueryClientProvider>,
		);

	it("renders the form and fetches spaces", async () => {
		vi.mocked(spacesService.list).mockResolvedValue([
			{
				id: 1,
				name: "Sala A",
				capacity: 10,
				location: "Piso 1",
				startTime: "08:00",
				endTime: "18:00",
				status: "active",
				spaceType: "shared_space",
			},
		]);

		renderPage();

		expect(screen.getByText("Reservar espacio")).toBeInTheDocument();

		// Wait for the spaces to load in the select
		await waitFor(() => {
			expect(screen.getByText("Sala A")).toBeInTheDocument();
		});
	});

	it("fetches availability reactively when space and date change", async () => {
		vi.mocked(spacesService.list).mockResolvedValue([
			{
				id: 1,
				name: "Sala A",
				capacity: 10,
				location: "Piso 1",
				startTime: "08:00",
				endTime: "18:00",
				status: "active",
				spaceType: "shared_space",
			},
		]);

		vi.mocked(spacesService.getAvailability).mockResolvedValue({
			space: {} as any,
			date: "2026-10-10",
			available: true,
			blocks: [
				{
					startTime: "08:00",
					endTime: "10:00",
					status: "free",
					seatsAvailable: 10,
				},
			],
		});

		renderPage();

		await waitFor(() => {
			expect(screen.getByText("Sala A")).toBeInTheDocument();
		});

		// Select space
		const select = screen.getByLabelText("1. Elige un espacio");
		fireEvent.change(select, { target: { value: "1" } });

		// Set date
		const dateInput = screen.getByLabelText("2. Selecciona la fecha");
		fireEvent.change(dateInput, { target: { value: "2026-10-10" } });

		// Check if getAvailability was called (reactively, without button)
		await waitFor(() => {
			expect(spacesService.getAvailability).toHaveBeenCalledWith(
				1,
				"2026-10-10",
			);
			expect(screen.getByText("08:00–10:00")).toBeInTheDocument();
			expect(screen.getByText("Disponible")).toBeInTheDocument();
		});
	});
});
