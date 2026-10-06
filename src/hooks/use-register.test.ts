import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import React from "react";

import { useRegister } from "./use-register";
import { authService } from "#/services/auth.service";
import { setUser } from "#/stores/session.store";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("#/services/auth.service", () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock("#/stores/session.store", () => ({
  setUser: vi.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);

describe("useRegister", () => {
  it("calls authService.register and sets user on success", async () => {
    const mockUser = { id: 1, name: "Test", email: "test@example.com", role: "user" };
    vi.mocked(authService.register).mockResolvedValue(mockUser as any);

    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate({ name: "Test", email: "test@example.com", password: "Password123" });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({ name: "Test", email: "test@example.com", password: "Password123" });
      expect(setUser).toHaveBeenCalledWith(mockUser);
    });
  });
});
