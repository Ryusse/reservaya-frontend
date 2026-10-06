import type { SpaceShowResponse } from "#/adapters/availability.adapter";
import { toSpaceAvailability } from "#/adapters/availability.adapter";
import type { SpaceResponse } from "#/adapters/space.adapter";
import { toSpace, toSpacePayload } from "#/adapters/space.adapter";
import { http } from "#/lib/http";
import type { SpaceAvailability } from "#/models/availability";
import type { NewSpace, Space } from "#/models/space";

export const spacesService = {
	async list(): Promise<Space[]> {
		const { data } = await http.get<SpaceResponse[]>("/spaces");
		return data.map(toSpace);
	},

	async create(input: NewSpace): Promise<Space> {
		const { data } = await http.post<SpaceResponse>(
			"/spaces",
			toSpacePayload(input),
		);
		return toSpace(data);
	},

	async update(id: number, input: NewSpace): Promise<Space> {
		const { data } = await http.patch<SpaceResponse>(
			`/spaces/${id}`,
			toSpacePayload(input),
		);
		return toSpace(data);
	},

	async deactivate(id: number): Promise<void> {
		await http.patch(`/spaces/${id}`, { space: { status: "inactive" } });
	},

	async getAvailability(id: number, date: string): Promise<SpaceAvailability> {
		const { data } = await http.get<SpaceShowResponse>(`/spaces/${id}`, {
			params: { date },
		});
		return toSpaceAvailability(data);
	},
};
