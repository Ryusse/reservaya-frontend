import { createFileRoute } from "@tanstack/react-router";

import { UserSpaceAvailabilityPage } from "#/pages/user/spaces/availability";

export const Route = createFileRoute("/_authed/spaces")({
	component: UserSpaceAvailabilityPage,
});
