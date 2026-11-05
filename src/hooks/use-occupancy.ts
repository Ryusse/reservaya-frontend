import { useQuery } from "@tanstack/react-query";

import type { OccupancyQuery } from "#/models/occupancy";
import { dashboardService } from "#/services/dashboard.service";

export const occupancyQueryKey = (query: OccupancyQuery) =>
	[
		"dashboard",
		"occupancy",
		query.from,
		query.to,
		query.spaceId ?? null,
		query.fromHour ?? null,
		query.toHour ?? null,
	] as const;

export function useOccupancy(query: OccupancyQuery, enabled: boolean) {
	return useQuery({
		queryKey: occupancyQueryKey(query),
		queryFn: () => dashboardService.getOccupancy(query),
		enabled,
	});
}
