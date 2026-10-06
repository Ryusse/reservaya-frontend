import { render, screen, fireEvent } from "#/lib/test-utils";
import { describe, expect, it, vi } from "vitest";

import { RegisterPage } from "./index";
import { useRegister } from "#/hooks/use-register";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to, style }: any) => <a href={to} style={style}>{children}</a>,
	useNavigate: () => vi.fn(),
}));

vi.mock("#/hooks/use-register", () => ({
	useRegister: vi.fn(),
}));

describe("RegisterPage", () => {
	it("renders the register form correctly", () => {
		vi.mocked(useRegister).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			isError: false,
			error: null,
		} as any);

		render(<RegisterPage />);

		expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
		expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
		expect(screen.getByLabelText("Correo")).toBeInTheDocument();
		expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Registrarme" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Inicia sesión" })).toBeInTheDocument();
	});

	it("calls register mutation when submitted with valid data", async () => {
		const mutateMock = vi.fn();
		vi.mocked(useRegister).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isError: false,
			error: null,
		} as any);

		render(<RegisterPage />);

		fireEvent.change(screen.getByLabelText("Nombre"), {
			target: { value: "Juan" },
		});
		fireEvent.change(screen.getByLabelText("Correo"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Contraseña"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Registrarme" }));

		await vi.waitFor(() => {
			expect(mutateMock).toHaveBeenCalledWith({
				name: "Juan",
				email: "test@example.com",
				password: "password123",
			});
		});
	});

	it("displays an error message when registration fails", () => {
		vi.mocked(useRegister).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			isError: true,
			error: { isAxiosError: true, response: { data: { errors: ["El correo ya está en uso"] } } },
		} as any);

		render(<RegisterPage />);

		expect(screen.getByText("El correo ya está en uso")).toBeInTheDocument();
	});
});
