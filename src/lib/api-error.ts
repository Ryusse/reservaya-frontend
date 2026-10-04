import axios from "axios";

export function apiErrors(error: unknown): string[] {
	if (axios.isAxiosError(error)) {
		if (!error.response) {
			return error.code === "ECONNABORTED"
				? ["El servidor tardó demasiado en responder. Intenta de nuevo."]
				: [
						"No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
					];
		}

		const data = error.response.data as
			| { errors?: unknown; error?: unknown }
			| undefined;
		if (Array.isArray(data?.errors)) return data.errors as string[];
		if (typeof data?.error === "string") return [data.error];

		if (error.response.status >= 500) {
			return ["Ocurrió un error en el servidor. Intenta de nuevo más tarde."];
		}
	}
	return ["Ocurrió un error inesperado"];
}
