import { Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";

import { toaster } from "#/components/ui/toaster";
import { useAppForm } from "#/hooks/form";
import { useUpdateReservation } from "#/hooks/use-update-reservation";
import { apiErrors } from "#/lib/api-error";
import { maxAdvanceIso, todayIso } from "#/lib/dates";
import {
	type Reservation,
	reservationChangeSchema,
} from "#/models/reservation";
import type { Space } from "#/models/space";

const MAX_ADVANCE_DAYS = 7;

type EditReservationDialogProps = {
	reservation: Reservation | null;
	spaces: Space[];
	onClose: () => void;
};

export function EditReservationDialog({
	reservation,
	spaces,
	onClose,
}: EditReservationDialogProps) {
	return (
		<Dialog.Root
			open={reservation !== null}
			size={{ base: "full", md: "md" }}
			onOpenChange={(event) => (event.open ? undefined : onClose())}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Modificar reserva</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							{reservation ? (
								<EditReservationForm
									key={reservation.id}
									reservation={reservation}
									spaces={spaces}
									onDone={onClose}
								/>
							) : null}
						</Dialog.Body>
						<Dialog.CloseTrigger />
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

type EditReservationFormProps = {
	reservation: Reservation;
	spaces: Space[];
	onDone: () => void;
};

function EditReservationForm({
	reservation,
	spaces,
	onDone,
}: EditReservationFormProps) {
	const updateReservation = useUpdateReservation();

	const form = useAppForm({
		defaultValues: {
			spaceId: reservation.space.id,
			date: reservation.date,
			startTime: reservation.startTime,
			endTime: reservation.endTime,
			seatsReserved: reservation.seatsReserved,
		},
		validators: { onChange: reservationChangeSchema(spaces) },
		onSubmit: ({ value }) =>
			updateReservation.mutate(
				{ id: reservation.id, input: value },
				{
					onSuccess: () => {
						toaster.create({
							type: "success",
							title: "Reserva modificada",
							description: "Los cambios se guardaron.",
						});
						onDone();
					},
				},
			),
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<Stack gap="4">
				<Text color="fg.muted">
					Si el nuevo horario ya está ocupado, la reserva original no cambiará.
				</Text>

				<form.AppField name="spaceId">
					{(field) => (
						<field.SelectField label="Espacio">
							{spaces.map((space) => (
								<option key={space.id} value={space.id}>
									{space.name}
								</option>
							))}
						</field.SelectField>
					)}
				</form.AppField>

				<form.AppField name="date">
					{(field) => (
						<field.TextField
							label="Fecha"
							type="date"
							min={todayIso()}
							max={maxAdvanceIso(MAX_ADVANCE_DAYS)}
						/>
					)}
				</form.AppField>

				<Stack direction={{ base: "column", md: "row" }} gap="4">
					<form.AppField name="startTime">
						{(field) => <field.TextField label="Hora de inicio" type="time" />}
					</form.AppField>
					<form.AppField name="endTime">
						{(field) => <field.TextField label="Hora de fin" type="time" />}
					</form.AppField>
				</Stack>

				<form.AppField name="seatsReserved">
					{(field) => <field.NumberField label="Cupos" min={1} />}
				</form.AppField>

				{updateReservation.isError ? (
					<Text color="fg.error" fontSize="sm">
						{apiErrors(updateReservation.error)[0]}
					</Text>
				) : null}

				<Flex
					justify="flex-end"
					gap="3"
					direction={{ base: "column-reverse", md: "row" }}
				>
					<Button
						variant="outline"
						onClick={onDone}
						disabled={updateReservation.isPending}
					>
						Volver
					</Button>
					<form.AppForm>
						<form.SubmitButton loading={updateReservation.isPending}>
							Guardar cambios
						</form.SubmitButton>
					</form.AppForm>
				</Flex>
			</Stack>
		</form>
	);
}
