import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Provider } from "#/components/ui/provider";
import type { Reservation } from "#/models/reservation";
import { reservationsService } from "#/services/reservations.service";
import { UserReservationsPage } from "./index";

vi.mock("#/services/reservations.service", () => ({
	reservationsService: {
		list: vi.fn(),
		cancel: vi.fn(),
	},
}));

const upcoming: Reservation = {
	id: 1,
	date: "2026-11-10",
	startTime: "09:00",
	endTime: "10:00",
	status: "confirmed",
	seatsReserved: 1,
	cancellable: true,
	space: {
		id: 3,
		name: "Sala B",
		location: "Piso 2",
		spaceType: "private_space",
	},
};

const started: Reservation = {
	...upcoming,
	id: 2,
	startTime: "07:00",
	endTime: "08:00",
	cancellable: false,
	space: { ...upcoming.space, name: "Sala C" },
};

describe("UserReservationsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderPage = () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		return render(
			<QueryClientProvider client={queryClient}>
				<Provider>
					<UserReservationsPage />
				</Provider>
			</QueryClientProvider>,
		);
	};

	it("shows an empty state when the user has no reservations", async () => {
		vi.mocked(reservationsService.list).mockResolvedValue([]);

		renderPage();

		expect(
			await screen.findByText("Aún no tienes reservas."),
		).toBeInTheDocument();
	});

	it("only offers cancel for reservations that can still be cancelled", async () => {
		vi.mocked(reservationsService.list).mockResolvedValue([upcoming, started]);

		renderPage();

		await screen.findByText("Sala B");
		expect(screen.getByText("Sala C")).toBeInTheDocument();
		expect(
			screen.getAllByRole("button", { name: "Cancelar reserva" }),
		).toHaveLength(1);
	});

	it("cancels a reservation after confirmation", async () => {
		vi.mocked(reservationsService.list).mockResolvedValue([upcoming]);
		vi.mocked(reservationsService.cancel).mockResolvedValue(undefined);

		renderPage();

		fireEvent.click(
			await screen.findByRole("button", { name: "Cancelar reserva" }),
		);
		const dialog = await screen.findByRole("alertdialog");
		fireEvent.click(
			within(dialog).getByRole("button", { name: "Cancelar reserva" }),
		);

		await waitFor(() => {
			expect(reservationsService.cancel).toHaveBeenCalledWith(1);
		});
	});

	it("shows an error when the reservations cannot be loaded", async () => {
		vi.mocked(reservationsService.list).mockRejectedValue(new Error("boom"));

		renderPage();

		expect(
			await screen.findByText("No se pudieron cargar tus reservas"),
		).toBeInTheDocument();
	});
});
