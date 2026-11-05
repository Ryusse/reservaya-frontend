import {
	Field,
	Flex,
	Heading,
	Input,
	NativeSelect,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";

import { OccupancyDaily } from "#/components/dashboard/occupancy-daily";
import { OccupancyHeatmap } from "#/components/dashboard/occupancy-heatmap";
import { OccupancySummaryCards } from "#/components/dashboard/occupancy-summary";
import { OccupancyTable } from "#/components/dashboard/occupancy-table";
import { useOccupancy } from "#/hooks/use-occupancy";
import { useSpaces } from "#/hooks/use-spaces";
import { apiErrors } from "#/lib/api-error";
import {
	currentMonthRange,
	hourRangeError,
	MAX_PERIOD_DAYS,
	periodError,
} from "#/lib/occupancy";
import type { OccupancySearch } from "#/models/occupancy";

const hourOptions = [...Array(24).keys()].map((hour) => (
	<option key={hour} value={hour}>
		{String(hour).padStart(2, "0")}:00
	</option>
));

type AdminOccupancyPageProps = {
	search: OccupancySearch;
	onSearchChange: (next: OccupancySearch) => void;
};

export function AdminOccupancyPage({
	search,
	onSearchChange,
}: AdminOccupancyPageProps) {
	const defaults = currentMonthRange();
	const from = search.from ?? defaults.from;
	const to = search.to ?? defaults.to;
	const validationError = periodError(from, to);
	const fromHour = search.fromHour ?? 0;
	const toHour = search.toHour ?? 23;
	const hourError = hourRangeError(fromHour, toHour);
	const invalid = validationError ?? hourError;

	const spaces = useSpaces();
	const occupancy = useOccupancy(
		{
			from,
			to,
			spaceId: search.spaceId,
			fromHour: search.fromHour,
			toHour: search.toHour,
		},
		invalid === null,
	);

	return (
		<Stack gap="6" maxW="5xl">
			<Heading size="2xl">Ocupación de espacios</Heading>

			<Flex gap="4" wrap="wrap" align="end">
				<Field.Root maxW="200px">
					<Field.Label>Desde</Field.Label>
					<Input
						type="date"
						value={from}
						onChange={(event) =>
							onSearchChange({
								...search,
								from: event.target.value || undefined,
							})
						}
					/>
				</Field.Root>
				<Field.Root maxW="200px">
					<Field.Label>Hasta</Field.Label>
					<Input
						type="date"
						value={to}
						onChange={(event) =>
							onSearchChange({ ...search, to: event.target.value || undefined })
						}
					/>
				</Field.Root>
				<Field.Root maxW="260px">
					<Field.Label>Espacio</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={search.spaceId ?? 0}
							onChange={(event) => {
								const spaceId = Number(event.target.value);
								onSearchChange({
									...search,
									spaceId: spaceId > 0 ? spaceId : undefined,
								});
							}}
						>
							<option value={0}>Todos los espacios</option>
							{spaces.data?.map((space) => (
								<option key={space.id} value={space.id}>
									{space.name}
								</option>
							))}
						</NativeSelect.Field>
						<NativeSelect.Indicator />
					</NativeSelect.Root>
				</Field.Root>
				<Field.Root maxW="130px">
					<Field.Label>Desde hora</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={fromHour}
							onChange={(event) =>
								onSearchChange({
									...search,
									fromHour: Number(event.target.value),
								})
							}
						>
							{hourOptions}
						</NativeSelect.Field>
						<NativeSelect.Indicator />
					</NativeSelect.Root>
				</Field.Root>
				<Field.Root maxW="130px">
					<Field.Label>Hasta hora</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={toHour}
							onChange={(event) =>
								onSearchChange({
									...search,
									toHour: Number(event.target.value),
								})
							}
						>
							{hourOptions}
						</NativeSelect.Field>
						<NativeSelect.Indicator />
					</NativeSelect.Root>
				</Field.Root>
			</Flex>

			{invalid ? (
				<Text color="fg.error">{invalid}</Text>
			) : occupancy.isPending ? (
				<Spinner />
			) : occupancy.isError ? (
				<Stack gap="1">
					{apiErrors(occupancy.error).map((message) => (
						<Text key={message} color="fg.error">
							{message}
						</Text>
					))}
				</Stack>
			) : occupancy.data.spaces.length === 0 ? (
				<Text color="fg.muted">No hay espacios con horario configurado.</Text>
			) : (
				<>
					<OccupancySummaryCards summary={occupancy.data.summary} />
					<Stack gap="3">
						<Heading size="md">Ocupación por hora</Heading>
						<OccupancyHeatmap spaces={occupancy.data.spaces} />
					</Stack>
					<Stack gap="3">
						<Heading size="md">Detalle por espacio</Heading>
						<OccupancyTable spaces={occupancy.data.spaces} />
					</Stack>
					<Stack gap="3">
						<Heading size="md">Promedio por día</Heading>
						<Text color="fg.muted" fontSize="sm">
							Promedio de los espacios del reporte. Máximo {MAX_PERIOD_DAYS}{" "}
							días.
						</Text>
						<OccupancyDaily spaces={occupancy.data.spaces} />
					</Stack>
				</>
			)}
		</Stack>
	);
}
