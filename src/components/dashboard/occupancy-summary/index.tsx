import { Box, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { formatPercent } from "#/lib/occupancy";
import type { OccupancySummary } from "#/models/occupancy";

type OccupancySummaryProps = {
	summary: OccupancySummary;
};

export function OccupancySummaryCards({ summary }: OccupancySummaryProps) {
	const cards = [
		{ label: "Ocupación global", value: formatPercent(summary.occupancyRate) },
		{ label: "Reservas confirmadas", value: String(summary.reservations) },
		{ label: "Espacios subutilizados", value: String(summary.underusedSpaces) },
		{
			label: "Espacios con alta demanda",
			value: String(summary.highDemandSpaces),
		},
	];

	return (
		<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
			{cards.map((card) => (
				<Box key={card.label} borderWidth="1px" rounded="md" p="4">
					<Stack gap="1">
						<Text color="fg.muted" fontSize="sm">
							{card.label}
						</Text>
						<Text fontSize="2xl" fontWeight="semibold">
							{card.value}
						</Text>
					</Stack>
				</Box>
			))}
		</SimpleGrid>
	);
}
