import { useMutation, useQueryClient } from "@tanstack/react-query";

import { spaceAvailabilityQueryKey } from "#/hooks/use-space-availability";
import type { NewReservation } from "#/models/reservation";
import { reservationsService } from "#/services/reservations.service";

import { reservationsQueryKey } from "./use-reservations";

export function useCreateReservation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: NewReservation) => reservationsService.create(input),
		onSuccess: (_data, input) =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: spaceAvailabilityQueryKey(input.spaceId, input.date),
				}),
				queryClient.invalidateQueries({ queryKey: reservationsQueryKey }),
			]),
	});
}
