import { Badge, Button, Flex, Stack, Text } from "@chakra-ui/react";

import type { Reservation, ReservationStatus } from "#/models/reservation";

const statusLabel: Record<ReservationStatus, string> = {
	confirmed: "Confirmada",
	cancelled: "Cancelada",
};

const statusPalette: Record<ReservationStatus, string> = {
	confirmed: "green",
	cancelled: "gray",
};

type ReservationListProps = {
	reservations: Reservation[];
	onCancel: (reservation: Reservation) => void;
};

export function ReservationList({
	reservations,
	onCancel,
}: ReservationListProps) {
	return (
		<Stack gap="3">
			{reservations.map((reservation) => (
				<Flex
					key={reservation.id}
					direction={{ base: "column", md: "row" }}
					justify="space-between"
					align={{ base: "stretch", md: "center" }}
					gap="3"
					borderWidth="1px"
					rounded="md"
					px="4"
					py="3"
				>
					<Stack gap="0.5" minW="0">
						<Text fontWeight="medium" truncate>
							{reservation.space.name}
						</Text>
						<Text color="fg.muted" fontSize="sm">
							{reservation.date} · {reservation.startTime}–{reservation.endTime}
						</Text>
					</Stack>
					<Flex
						direction={{ base: "column", md: "row" }}
						align={{ base: "stretch", md: "center" }}
						gap="3"
					>
						<Badge
							colorPalette={statusPalette[reservation.status]}
							alignSelf={{ base: "flex-start", md: "center" }}
						>
							{statusLabel[reservation.status]}
						</Badge>
						{reservation.cancellable ? (
							<Button
								size="sm"
								variant="outline"
								colorPalette="red"
								onClick={() => onCancel(reservation)}
							>
								Cancelar reserva
							</Button>
						) : null}
					</Flex>
				</Flex>
			))}
		</Stack>
	);
}
