import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "#/components/layout/app-shell";

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context }) => {
		// Evitamos redirigir desde el servidor (SSR) porque no tiene las cookies del usuario
		if (typeof document !== "undefined" && !context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	component: AuthedLayout,
});

function AuthedLayout() {
	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
