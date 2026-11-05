import type {
	OccupancyClassification,
	OccupancyReport,
	OccupancySpace,
} from "#/models/occupancy";

export type OccupancyResponse = {
	from: string;
	to: string;
	days: number;
	summary: {
		occupancy_rate: number;
		reservations: number;
		underused_spaces: number;
		high_demand_spaces: number;
	};
	spaces: {
		id: number;
		name: string;
		space_type: string;
		capacity: number;
		occupancy_rate: number;
		reservations: number;
		classification: string;
		hours: { hour: number; occupancy_rate: number }[];
		days: { date: string; occupancy_rate: number }[];
	}[];
};

function toClassification(value: string): OccupancyClassification {
	if (value === "underused" || value === "high_demand") return value;
	return "normal";
}

function toSpace(data: OccupancyResponse["spaces"][number]): OccupancySpace {
	return {
		id: data.id,
		name: data.name,
		spaceType:
			data.space_type === "private_space" ? "private_space" : "shared_space",
		capacity: data.capacity,
		occupancyRate: data.occupancy_rate,
		reservations: data.reservations,
		classification: toClassification(data.classification),
		hours: data.hours.map((hour) => ({
			hour: hour.hour,
			occupancyRate: hour.occupancy_rate,
		})),
		days: data.days.map((day) => ({
			date: day.date,
			occupancyRate: day.occupancy_rate,
		})),
	};
}

export function toOccupancyReport(data: OccupancyResponse): OccupancyReport {
	return {
		from: data.from,
		to: data.to,
		days: data.days,
		summary: {
			occupancyRate: data.summary.occupancy_rate,
			reservations: data.summary.reservations,
			underusedSpaces: data.summary.underused_spaces,
			highDemandSpaces: data.summary.high_demand_spaces,
		},
		spaces: data.spaces.map(toSpace),
	};
}
