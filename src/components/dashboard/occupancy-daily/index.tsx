import { Flex, Progress, Stack, Text } from "@chakra-ui/react";
import { formatPercent } from "#/lib/occupancy";
import type { OccupancySpace } from "#/models/occupancy";

type OccupancyDailyProps = {
	spaces: OccupancySpace[];
};

export function OccupancyDaily({ spaces }: OccupancyDailyProps) {
	const dates = spaces[0]?.days.map((day) => day.date) ?? [];

	const averages = dates.map((date) => {
		const rates = spaces
			.map(
				(space) => space.days.find((day) => day.date === date)?.occupancyRate,
			)
			.filter((rate): rate is number => rate !== undefined);
		const average =
			rates.length === 0
				? 0
				: rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
		return { date, average };
	});

	return (
		<Stack gap="2">
			{averages.map(({ date, average }) => (
				<Flex key={date} align="center" gap="4">
					<Text w="110px" fontSize="sm">
						{date}
					</Text>
					<Progress.Root
						value={Math.round(average * 100)}
						size="sm"
						flex="1"
						colorPalette="blue"
					>
						<Progress.Track>
							<Progress.Range />
						</Progress.Track>
					</Progress.Root>
					<Text fontSize="sm" minW="3ch" textAlign="end">
						{formatPercent(average)}
					</Text>
				</Flex>
			))}
		</Stack>
	);
}
