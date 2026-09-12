import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

import type { User } from "#/models/user";

type SessionStatus = "loading" | "ready";

export type SessionState = {
	user: User | null;
	status: SessionStatus;
};

export const sessionStore = new Store<SessionState>({
	user: null,
	status: "loading",
});

export function setUser(user: User | null) {
	sessionStore.setState(() => ({ user, status: "ready" }));
}

export function clearUser() {
	sessionStore.setState(() => ({ user: null, status: "ready" }));
}

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
	return useStore(sessionStore, selector);
}
