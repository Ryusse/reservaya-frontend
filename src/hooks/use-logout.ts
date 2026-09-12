import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authService } from "#/services/auth.service";
import { clearUser } from "#/stores/session.store";

export function useLogout() {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => authService.logout(),
		onSettled: () => {
			clearUser();
			navigate({ to: "/login" });
		},
	});
}
