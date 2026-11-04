import { Button, Dialog, Portal, Text } from "@chakra-ui/react";

import { toaster } from "#/components/ui/toaster";
import { useCancelReservation } from "#/hooks/use-cancel-reservation";
import { apiErrors } from "#/lib/api-error";
import type { Reservation } from "#/models/reservation";

type CancelReservationDialogProps = {
	reservation: Reservation | null;
	onClose: () => void;
};

export function CancelReservationDialog({
	reservation,
	onClose,
}: CancelReservationDialogProps) {
	const cancel = useCancelReservation();

	const handleConfirm = () => {
		if (!reservation) return;

		cancel.mutate(reservation.id, {
			onSuccess: () => {
				toaster.create({
					type: "success",
					title: "Reserva cancelada",
					description: "El horario quedó libre para otros usuarios.",
				});
				onClose();
			},
		});
	};

	return (
		<Dialog.Root
			role="alertdialog"
			open={reservation !== null}
			onOpenChange={(event) => (event.open ? undefined : onClose())}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Cancelar reserva</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								¿Cancelar la reserva de «{reservation?.space.name}» del{" "}
								{reservation?.date} de {reservation?.startTime} a{" "}
								{reservation?.endTime}? El horario quedará libre para otros
								usuarios.
							</Text>
							{cancel.isError ? (
								<Text mt="3" color="fg.error" fontSize="sm">
									{apiErrors(cancel.error)[0]}
								</Text>
							) : null}
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Volver</Button>
							</Dialog.ActionTrigger>
							<Button
								colorPalette="red"
								loading={cancel.isPending}
								onClick={handleConfirm}
							>
								Cancelar reserva
							</Button>
						</Dialog.Footer>
						<Dialog.CloseTrigger />
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
