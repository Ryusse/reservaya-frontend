import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { authService } from "#/services/auth.service";
import { setUser } from "#/stores/session.store";
import { useLogin } from "./use-login";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

vi.mock("#/services/auth.service", () => ({
	authService: {
		login: vi.fn(),
	},
}));

vi.mock("#/stores/session.store", () => ({
	setUser: vi.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) =>
	React.createElement(QueryClientProvider, { client: queryClient }, children);

describe("useLogin", () => {
	it("calls authService.login and sets user on success", async () => {
		const mockUser = {
			id: 1,
			name: "Test",
			email: "test@example.com",
			role: "user",
		};
		vi.mocked(authService.login).mockResolvedValue(mockUser as any);

		const { result } = renderHook(() => useLogin(), { wrapper });

		result.current.mutate({
			email: "test@example.com",
			password: "password123",
		});

		await waitFor(() => {
			expect(authService.login).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
			expect(setUser).toHaveBeenCalledWith(mockUser);
		});
	});
});
