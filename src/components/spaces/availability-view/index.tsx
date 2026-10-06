import { Badge, Flex, Stack, Text } from "@chakra-ui/react";

import type { SpaceAvailability } from "#/models/availability";

type AvailabilityViewProps = {
	availability: SpaceAvailability;
};

export function AvailabilityView({ availability }: AvailabilityViewProps) {
	if (!availability.available) {
		return <Text color="fg.muted">Este espacio no está disponible.</Text>;
	}

	return (
		<Stack gap="2">
			{availability.blocks.map((block) => {
				const isFree = block.status === "free";
				const isPartial = block.status === "partial";
				const colorPalette = isFree ? "green" : isPartial ? "yellow" : "red";
				const label = isFree ? "Disponible" : isPartial ? "Parcial" : "Ocupado";

				return (
					<Flex
						key={`${block.startTime}-${block.endTime}`}
						justify="space-between"
						align="center"
						borderWidth="1px"
						rounded="md"
						px="4"
						py="2"
					>
						<Text>
							{block.startTime}–{block.endTime}
						</Text>
						<Flex align="center" gap="3">
							{block.seatsAvailable !== undefined ? (
								<Text color="fg.muted" fontSize="sm">
									{block.seatsAvailable} cupos disponibles
								</Text>
							) : null}
							<Badge colorPalette={colorPalette}>{label}</Badge>
						</Flex>
					</Flex>
				);
			})}
		</Stack>
	);
}
