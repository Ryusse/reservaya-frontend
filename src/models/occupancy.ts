export type OccupancyClassification = "underused" | "normal" | "high_demand";

export type OccupancyHour = {
	hour: number;
	occupancyRate: number;
};

export type OccupancyDay = {
	date: string;
	occupancyRate: number;
};

export type OccupancySpace = {
	id: number;
	name: string;
	spaceType: "private_space" | "shared_space";
	capacity: number;
	occupancyRate: number;
	reservations: number;
	classification: OccupancyClassification;
	hours: OccupancyHour[];
	days: OccupancyDay[];
};

export type OccupancySummary = {
	occupancyRate: number;
	reservations: number;
	underusedSpaces: number;
	highDemandSpaces: number;
};

export type OccupancyReport = {
	from: string;
	to: string;
	days: number;
	summary: OccupancySummary;
	spaces: OccupancySpace[];
};

export type OccupancySearch = {
	from?: string;
	to?: string;
	spaceId?: number;
};

export type OccupancyQuery = {
	from: string;
	to: string;
	spaceId?: number;
};
