import { createFileRoute, redirect } from "@tanstack/react-router";

import { parseOccupancySearch } from "#/lib/occupancy";
import { Role } from "#/models/role";
import { AdminOccupancyPage } from "#/pages/admin/occupancy";

export const Route = createFileRoute("/_authed/occupancy")({
	validateSearch: parseOccupancySearch,
	beforeLoad: ({ context }) => {
		if (context.auth.role !== Role.Admin) {
			throw redirect({ to: "/" });
		}
	},
	component: OccupancyRoute,
});

function OccupancyRoute() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<AdminOccupancyPage
			search={search}
			onSearchChange={(next) => navigate({ search: next })}
		/>
	);
}
