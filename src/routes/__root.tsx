import { Center, Spinner } from "@chakra-ui/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { Provider } from "#/components/ui/provider";
import { useApiErrors } from "#/hooks/use-api-errors";
import type { SessionInfo } from "#/hooks/use-session";
import { useSession } from "#/hooks/use-session";
import { authService } from "#/services/auth.service";
import { clearUser, sessionStore, setUser, useSessionStore } from "#/stores/session.store";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		// Solo bloqueamos y verificamos la sesión en el cliente
		if (typeof document !== "undefined" && sessionStore.state.status === "loading") {
			try {
				const user = await authService.me();
				setUser(user);
			} catch {
				clearUser();
			}
		}

		const { user } = sessionStore.state;
		const auth: SessionInfo = {
			user,
			role: user?.role ?? null,
			isAuthenticated: user !== null,
		};
		return { auth };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "ReservaYa" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const { queryClient } = Route.useRouteContext();
	const router = useRouter();
	const auth = useSession();
	const status = useSessionStore((s) => s.status);

	useApiErrors();

	// Invalida el router si cambia el auth state client-side
	useEffect(() => {
		if (status === "ready") router.invalidate();
	}, [auth.isAuthenticated, auth.role, status, router]);

	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
		</QueryClientProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<Provider>{children}</Provider>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
