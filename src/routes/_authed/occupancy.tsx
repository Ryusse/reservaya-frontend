import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "#/hooks/use-session";
import { parseOccupancySearch } from "#/lib/occupancy";
import { Role } from "#/models/role";
import { AdminOccupancyPage } from "#/pages/admin/occupancy";
import { useSessionStore } from "#/stores/session.store";

export const Route = createFileRoute("/_authed/occupancy")({
	validateSearch: parseOccupancySearch,
	component: OccupancyRoute,
});

function OccupancyRoute() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const status = useSessionStore((s) => s.status);
	const { role } = useSession();

	if (status === "loading") {
		return null;
	}

	if (role !== Role.Admin) {
		return <Navigate to="/" />;
	}

	return (
		<AdminOccupancyPage
			search={search}
			onSearchChange={(next) => navigate({ search: next })}
		/>
	);
}
