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
import type { Space } from "#/models/space";
import { reservationsService } from "#/services/reservations.service";
import { spacesService } from "#/services/spaces.service";
import { UserReservationsPage } from "./index";

vi.mock("#/services/reservations.service", () => ({
	reservationsService: {
		list: vi.fn(),
		update: vi.fn(),
		cancel: vi.fn(),
	},
}));

vi.mock("#/services/spaces.service", () => ({
	spacesService: {
		list: vi.fn(),
	},
}));

const salaB: Space = {
	id: 3,
	name: "Sala B",
	capacity: 5,
	location: "Piso 2",
	startTime: "08:00",
	endTime: "18:00",
	status: "active",
	spaceType: "shared_space",
};

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
		spaceType: "shared_space",
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
		vi.mocked(spacesService.list).mockResolvedValue([salaB]);
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

	it("only offers cancel and edit for reservations that can still change", async () => {
		vi.mocked(reservationsService.list).mockResolvedValue([upcoming, started]);

		renderPage();

		await screen.findByText("Sala B");
		expect(screen.getByText("Sala C")).toBeInTheDocument();
		expect(
			screen.getAllByRole("button", { name: "Cancelar reserva" }),
		).toHaveLength(1);
		expect(screen.getAllByRole("button", { name: "Modificar" })).toHaveLength(
			1,
		);
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

	it("submits the edited reservation with the new start time", async () => {
		vi.mocked(reservationsService.list).mockResolvedValue([upcoming]);
		vi.mocked(reservationsService.update).mockResolvedValue(undefined);

		renderPage();

		fireEvent.click(await screen.findByRole("button", { name: "Modificar" }));
		const dialog = await screen.findByRole("dialog");
		await within(dialog).findByRole("option", { name: "Sala B" });

		fireEvent.change(within(dialog).getByLabelText("Hora de inicio"), {
			target: { value: "09:30" },
		});
		fireEvent.click(
			within(dialog).getByRole("button", { name: "Guardar cambios" }),
		);

		await waitFor(() => {
			expect(reservationsService.update).toHaveBeenCalledWith(1, {
				spaceId: 3,
				date: "2026-11-10",
				startTime: "09:30",
				endTime: "10:00",
				seatsReserved: 1,
			});
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
