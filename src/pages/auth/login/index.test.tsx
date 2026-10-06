import { render, screen, fireEvent } from "#/lib/test-utils";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from "./index";
import { useLogin } from "#/hooks/use-login";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, style }: any) => <a href={to} style={style}>{children}</a>,
	useNavigate: () => vi.fn(),
}));

vi.mock("#/hooks/use-login", () => ({
	useLogin: vi.fn(),
}));

describe("LoginPage", () => {
	it("renders the login form correctly", () => {
		vi.mocked(useLogin).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			isError: false,
			error: null,
		} as any);

		render(<LoginPage />);

		expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
		expect(screen.getByLabelText("Correo")).toBeInTheDocument();
		expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Regístrate" })).toBeInTheDocument();
	});

	it("calls login mutation when submitted with valid data", async () => {
		const mutateMock = vi.fn();
		vi.mocked(useLogin).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isError: false,
			error: null,
		} as any);

		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText("Correo"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Contraseña"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

		await vi.waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
		});
	});

	it("displays an error message when login fails", () => {
		vi.mocked(useLogin).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			isError: true,
			error: { isAxiosError: true, response: { data: { error: "Credenciales inválidas" } } },
		} as any);

		render(<LoginPage />);

		expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
	});
});
