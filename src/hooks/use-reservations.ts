import { useQuery } from "@tanstack/react-query";

import { reservationsService } from "#/services/reservations.service";

export const reservationsQueryKey = ["reservations"] as const;

export function useReservations() {
	return useQuery({
		queryKey: reservationsQueryKey,
		queryFn: reservationsService.list,
	});
}
