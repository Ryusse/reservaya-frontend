import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import {
	formatPercent,
	heatBackground,
	heatLegend,
	heatLevel,
} from "#/lib/occupancy";
import type { OccupancySpace } from "#/models/occupancy";

type OccupancyHeatmapProps = {
	spaces: OccupancySpace[];
};

export function OccupancyHeatmap({ spaces }: OccupancyHeatmapProps) {
	const hours = [
		...new Set(spaces.flatMap((space) => space.hours.map((h) => h.hour))),
	].sort((a, b) => a - b);

	return (
		<Stack gap="3">
			<Box overflowX="auto" pb="2">
				<Stack gap="1" minW="max-content">
					<Flex gap="1" pl="160px">
						{hours.map((hour) => (
							<Box key={hour} w="9" textAlign="center">
								<Text fontSize="xs" color="fg.muted">
									{String(hour).padStart(2, "0")}
								</Text>
							</Box>
						))}
					</Flex>
					{spaces.map((space) => {
						const byHour = new Map(
							space.hours.map((h) => [h.hour, h.occupancyRate]),
						);
						return (
							<Flex key={space.id} align="center" gap="1">
								<Text w="160px" pr="3" fontSize="sm" truncate>
									{space.name}
								</Text>
								{hours.map((hour) => {
									const rate = byHour.get(hour);
									if (rate === undefined) {
										return (
											<Box
												key={hour}
												w="9"
												h="9"
												rounded="sm"
												borderWidth="1px"
												borderStyle="dashed"
												aria-label={`${space.name}, ${hour}:00 fuera de horario`}
											/>
										);
									}
									const background = heatBackground(heatLevel(rate));
									const label = `${space.name}, ${String(hour).padStart(2, "0")}:00: ${formatPercent(rate)} ocupado`;
									return (
										<Box
											key={hour}
											role="img"
											aria-label={label}
											title={label}
											w="9"
											h="9"
											rounded="sm"
											colorPalette="blue"
											bg={background}
										/>
									);
								})}
							</Flex>
						);
					})}
				</Stack>
			</Box>
			<Flex gap="4" wrap="wrap" align="center">
				<Text fontSize="sm" color="fg.muted">
					Ocupación:
				</Text>
				{heatLegend.map((step) => (
					<Flex key={step.label} align="center" gap="2">
						<Box
							w="4"
							h="4"
							rounded="sm"
							colorPalette="blue"
							bg={heatBackground(step.level)}
						/>
						<Text fontSize="sm" color="fg.muted">
							{step.label}
						</Text>
					</Flex>
				))}
			</Flex>
		</Stack>
	);
}
