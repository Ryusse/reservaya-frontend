import { useMutation, useQueryClient } from "@tanstack/react-query";

import { spacesQueryKey } from "#/hooks/use-spaces";
import { reservationsService } from "#/services/reservations.service";

import { reservationsQueryKey } from "./use-reservations";

export function useCancelReservation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => reservationsService.cancel(id),
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: reservationsQueryKey }),
				queryClient.invalidateQueries({ queryKey: spacesQueryKey }),
			]),
	});
}
