import { Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

import { CancelReservationDialog } from "#/components/reservations/cancel-reservation-dialog";
import { ReservationList } from "#/components/reservations/reservation-list";
import { useReservations } from "#/hooks/use-reservations";
import type { Reservation } from "#/models/reservation";

export function UserReservationsPage() {
	const reservations = useReservations();
	const [toCancel, setToCancel] = useState<Reservation | null>(null);

	return (
		<>
			<Stack gap="6" maxW="3xl">
				<Heading size="2xl">Mis reservas</Heading>

				{reservations.isPending ? (
					<Spinner />
				) : reservations.isError ? (
					<Text color="fg.error">No se pudieron cargar tus reservas</Text>
				) : reservations.data.length === 0 ? (
					<Text color="fg.muted">Aún no tienes reservas.</Text>
				) : (
					<ReservationList
						reservations={reservations.data}
						onCancel={setToCancel}
					/>
				)}
			</Stack>

			<CancelReservationDialog
				key={toCancel?.id ?? "none"}
				reservation={toCancel}
				onClose={() => setToCancel(null)}
			/>
		</>
	);
}
