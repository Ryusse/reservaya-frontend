import { createFileRoute } from "@tanstack/react-router";

import { UserReservationsPage } from "#/pages/user/reservations";

export const Route = createFileRoute("/_authed/reservations")({
	component: UserReservationsPage,
});
