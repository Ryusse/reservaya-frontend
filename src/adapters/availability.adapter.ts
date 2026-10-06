import type { SpaceResponse } from "#/adapters/space.adapter";
import { toSpace } from "#/adapters/space.adapter";
import type {
	AvailabilityBlock,
	AvailabilityBlockStatus,
	SpaceAvailability,
} from "#/models/availability";

export type AvailabilityBlockResponse = {
	start_time: string;
	end_time: string;
	status: AvailabilityBlockStatus;
	seats_available?: number;
};

export type SpaceShowResponse = SpaceResponse & {
	date: string;
	available?: boolean;
	reservations: unknown[];
	availability: AvailabilityBlockResponse[];
};

export function toAvailabilityBlock(
	data: AvailabilityBlockResponse,
): AvailabilityBlock {
	return {
		startTime: data.start_time,
		endTime: data.end_time,
		status: data.status,
		...(data.seats_available !== undefined
			? { seatsAvailable: data.seats_available }
			: {}),
	};
}

export function toSpaceAvailability(
	data: SpaceShowResponse,
): SpaceAvailability {
	return {
		space: toSpace(data),
		date: data.date,
		available: data.available ?? true,
		blocks: data.availability.map(toAvailabilityBlock),
	};
}
