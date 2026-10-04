import { useQuery } from "@tanstack/react-query";

import { spacesService } from "#/services/spaces.service";

export function useSpaceAvailability(
	spaceId: number,
	date: string,
	enabled = true,
) {
	return useQuery({
		queryKey: ["spaces", spaceId, "availability", date],
		queryFn: () => spacesService.getAvailability(spaceId, date),
		enabled,
	});
}
