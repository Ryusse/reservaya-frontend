import { useMutation, useQueryClient } from "@tanstack/react-query";

import { spacesQueryKey } from "#/hooks/use-spaces";
import type { NewReservation } from "#/models/reservation";
import { reservationsService } from "#/services/reservations.service";

import { reservationsQueryKey } from "./use-reservations";

type UpdateReservationInput = {
	id: number;
	input: NewReservation;
};

export function useUpdateReservation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: UpdateReservationInput) =>
			reservationsService.update(id, input),
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: reservationsQueryKey }),
				queryClient.invalidateQueries({ queryKey: spacesQueryKey }),
			]),
	});
}
