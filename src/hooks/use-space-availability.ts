import { useQuery } from "@tanstack/react-query";

import { spacesService } from "#/services/spaces.service";

export const spaceAvailabilityQueryKey = (spaceId: number, date: string) =>
	["spaces", spaceId, "availability", date] as const;

export function useSpaceAvailability(
	spaceId: number,
	date: string,
	enabled = true,
) {
	return useQuery({
		queryKey: spaceAvailabilityQueryKey(spaceId, date),
		queryFn: () => spacesService.getAvailability(spaceId, date),
		enabled,
	});
}
