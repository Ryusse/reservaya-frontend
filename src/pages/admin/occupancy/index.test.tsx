import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Provider } from "#/components/ui/provider";
import type { OccupancyReport } from "#/models/occupancy";
import type { Space } from "#/models/space";
import { dashboardService } from "#/services/dashboard.service";
import { spacesService } from "#/services/spaces.service";
import { AdminOccupancyPage } from "./index";

vi.mock("#/services/dashboard.service", () => ({
	dashboardService: { getOccupancy: vi.fn() },
}));

vi.mock("#/services/spaces.service", () => ({
	spacesService: { list: vi.fn() },
}));

const cabina: Space = {
	id: 4,
	name: "Cabina Individual 2",
	capacity: 1,
	location: "Piso 1",
	startTime: "07:00",
	endTime: "21:00",
	status: "active",
	spaceType: "private_space",
};

const report: OccupancyReport = {
	from: "2026-11-03",
	to: "2026-11-03",
	days: 1,
	summary: {
		occupancyRate: 0.1,
		reservations: 1,
		underusedSpaces: 1,
		highDemandSpaces: 0,
	},
	spaces: [
		{
			id: 4,
			name: "Cabina Individual 2",
			spaceType: "private_space",
			capacity: 1,
			occupancyRate: 0.1,
			reservations: 1,
			classification: "underused",
			hours: [
				{ hour: 9, occupancyRate: 1 },
				{ hour: 10, occupancyRate: 0 },
			],
			days: [{ date: "2026-11-03", occupancyRate: 0.1 }],
		},
	],
};

describe("AdminOccupancyPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(spacesService.list).mockResolvedValue([cabina]);
	});

	const renderPage = (
		search = { from: "2026-11-03", to: "2026-11-03" },
		onSearchChange = vi.fn(),
	) => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		return render(
			<QueryClientProvider client={queryClient}>
				<Provider>
					<AdminOccupancyPage search={search} onSearchChange={onSearchChange} />
				</Provider>
			</QueryClientProvider>,
		);
	};

	it("shows the summary, the heatmap cells and the per-space table", async () => {
		vi.mocked(dashboardService.getOccupancy).mockResolvedValue(report);

		renderPage();

		expect(await screen.findByText("Ocupación global")).toBeInTheDocument();
		expect(screen.getAllByText("10 %").length).toBeGreaterThan(0);
		expect(
			screen.getByRole("img", {
				name: "Cabina Individual 2, 09:00: 100 % ocupado",
			}),
		).toBeInTheDocument();
		expect(screen.getByText("Subutilizado")).toBeInTheDocument();
	});

	it("does not query the API for an invalid period", async () => {
		renderPage({ from: "2026-11-05", to: "2026-11-01" });

		expect(
			await screen.findByText(
				"La fecha inicial no puede ser posterior a la final",
			),
		).toBeInTheDocument();
		expect(dashboardService.getOccupancy).not.toHaveBeenCalled();
	});

	it("shows an empty message when no space has an operating window", async () => {
		vi.mocked(dashboardService.getOccupancy).mockResolvedValue({
			...report,
			spaces: [],
		});

		renderPage();

		expect(
			await screen.findByText("No hay espacios con horario configurado."),
		).toBeInTheDocument();
	});

	it("writes the new start date into the URL search state", async () => {
		vi.mocked(dashboardService.getOccupancy).mockResolvedValue(report);
		const onSearchChange = vi.fn();

		renderPage(undefined, onSearchChange);

		fireEvent.change(await screen.findByLabelText("Desde"), {
			target: { value: "2026-11-02" },
		});

		await waitFor(() => {
			expect(onSearchChange).toHaveBeenCalledWith(
				expect.objectContaining({ from: "2026-11-02" }),
			);
		});
	});
});
