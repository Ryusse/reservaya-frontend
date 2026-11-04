import { Badge, Flex, Progress, Table, Text } from "@chakra-ui/react";
import {
	classificationLabel,
	classificationPalette,
	formatPercent,
} from "#/lib/occupancy";
import type { OccupancySpace } from "#/models/occupancy";

type OccupancyTableProps = {
	spaces: OccupancySpace[];
};

const spaceTypeLabel = {
	private_space: "Privado",
	shared_space: "Compartido",
} as const;

export function OccupancyTable({ spaces }: OccupancyTableProps) {
	return (
		<Table.ScrollArea borderWidth="1px" rounded="md">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeader>Espacio</Table.ColumnHeader>
						<Table.ColumnHeader>Tipo</Table.ColumnHeader>
						<Table.ColumnHeader>Reservas</Table.ColumnHeader>
						<Table.ColumnHeader>Ocupación</Table.ColumnHeader>
						<Table.ColumnHeader>Clasificación</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{spaces.map((space) => (
						<Table.Row key={space.id}>
							<Table.Cell>
								<Text fontWeight="medium">{space.name}</Text>
							</Table.Cell>
							<Table.Cell>{spaceTypeLabel[space.spaceType]}</Table.Cell>
							<Table.Cell>{space.reservations}</Table.Cell>
							<Table.Cell minW="180px">
								<Flex align="center" gap="3">
									<Progress.Root
										colorPalette="blue"
										value={Math.round(space.occupancyRate * 100)}
										size="sm"
										flex="1"
									>
										<Progress.Track>
											<Progress.Range />
										</Progress.Track>
									</Progress.Root>
									<Text fontSize="sm" minW="3ch" textAlign="end">
										{formatPercent(space.occupancyRate)}
									</Text>
								</Flex>
							</Table.Cell>
							<Table.Cell>
								<Badge
									colorPalette={classificationPalette(space.classification)}
								>
									{classificationLabel(space.classification)}
								</Badge>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Table.ScrollArea>
	);
}
