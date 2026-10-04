import type { Space } from "#/models/space";

export type AvailabilityBlockStatus = "available" | "booked";

export type AvailabilityBlock = {
	startTime: string;
	endTime: string;
	status: AvailabilityBlockStatus;
	seatsAvailable?: number;
};

export type SpaceAvailability = {
	space: Space;
	date: string;
	available: boolean;
	blocks: AvailabilityBlock[];
};
