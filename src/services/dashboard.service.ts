import type { OccupancyResponse } from "#/adapters/occupancy.adapter";
import { toOccupancyReport } from "#/adapters/occupancy.adapter";
import { http } from "#/lib/http";
import type { OccupancyQuery, OccupancyReport } from "#/models/occupancy";

export const dashboardService = {
	async getOccupancy(query: OccupancyQuery): Promise<OccupancyReport> {
		const { data } = await http.get<OccupancyResponse>("/dashboard/occupancy", {
			params: {
				from: query.from,
				to: query.to,
				space_id: query.spaceId,
			},
		});
		return toOccupancyReport(data);
	},
};
