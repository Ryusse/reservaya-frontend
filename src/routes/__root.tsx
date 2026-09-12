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
import { sessionStore, setUser, useSessionStore } from "#/stores/session.store";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: () => {
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

	useEffect(() => {
		authService.me().then(setUser);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run only when auth or status changes, not on every router identity change
	useEffect(() => {
		if (status === "ready") router.invalidate();
	}, [auth.isAuthenticated, auth.role, status]);

	return (
		<QueryClientProvider client={queryClient}>
			{status === "loading" ? (
				<Center h="100dvh">
					<Spinner size="xl" />
				</Center>
			) : (
				<Outlet />
			)}
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
