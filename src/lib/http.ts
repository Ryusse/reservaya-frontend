import axios from "axios";

import { env } from "#/env";
import { clearUser } from "#/stores/session.store";

export const http = axios.create({
	baseURL: env.VITE_API_URL,
	headers: { Accept: "application/json" },
	withCredentials: true,
});

http.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			clearUser();
		}
		return Promise.reject(error);
	},
);
