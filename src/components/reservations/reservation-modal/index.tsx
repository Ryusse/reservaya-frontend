import { Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";
import { z } from "zod";
import { toaster } from "#/components/ui/toaster";
import { useAppForm } from "#/hooks/form";
import { useCreateReservation } from "#/hooks/use-create-reservation";
import { apiErrors } from "#/lib/api-error";
import type { AvailabilityBlock } from "#/models/availability";
import type { Space } from "#/models/space";

type ReservationModalProps = {
	space: Space;
	date: string;
	block: AvailabilityBlock | null;
	onClose: () => void;
};

export function ReservationModal({
	space,
	date,
	block,
	onClose,
}: ReservationModalProps) {
	return (
		<Dialog.Root
			open={block !== null}
			onOpenChange={(event) => (event.open ? undefined : onClose())}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Reservar {space.name}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							{block ? (
								<ReservationForm
									key={`${block.startTime}-${block.endTime}`}
									space={space}
									date={date}
									block={block}
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

function reservationFormSchema(block: AvailabilityBlock, space: Space) {
	const maxSeats =
		space.spaceType === "shared_space"
			? (block.seatsAvailable ?? space.capacity)
			: space.capacity;

	return z
		.object({
			startTime: z.string().min(1, "La hora de inicio es obligatoria"),
			endTime: z.string().min(1, "La hora de fin es obligatoria"),
			seatsReserved: z
				.number()
				.int()
				.min(1, "Debe reservar al menos 1 cupo")
				.max(maxSeats, `No hay más de ${maxSeats} cupos disponibles`),
		})
		.refine(
			(values) =>
				values.startTime >= block.startTime && values.endTime <= block.endTime,
			{
				message: "El horario debe estar dentro del bloque disponible",
				path: ["endTime"],
			},
		)
		.refine((values) => values.endTime > values.startTime, {
			message: "La hora de fin debe ser posterior a la de inicio",
			path: ["endTime"],
		});
}

type ReservationFormProps = {
	space: Space;
	date: string;
	block: AvailabilityBlock;
	onDone: () => void;
};

function ReservationForm({ space, date, block, onDone }: ReservationFormProps) {
	const createReservation = useCreateReservation();

	const form = useAppForm({
		defaultValues: {
			startTime: block.startTime,
			endTime: block.endTime,
			seatsReserved: 1,
		},
		validators: { onChange: reservationFormSchema(block, space) },
		onSubmit: ({ value }) =>
			createReservation.mutate(
				{
					spaceId: space.id,
					date,
					startTime: value.startTime,
					endTime: value.endTime,
					seatsReserved: value.seatsReserved,
				},
				{
					onSuccess: () => {
						toaster.create({
							type: "success",
							title: "Reserva confirmada",
							description: "Tu reserva se ha creado exitosamente.",
						});
						onDone();
					},
					onError: (error) => {
						toaster.create({
							type: "error",
							title: "No se pudo reservar",
							description: apiErrors(error)[0],
						});
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
					Estás reservando <strong>{space.name}</strong> para el día{" "}
					<strong>{date}</strong>. Horario disponible: {block.startTime}–
					{block.endTime}.
				</Text>

				<Flex gap="4">
					<form.AppField name="startTime">
						{(field) => (
							<field.TextField
								label="Hora de inicio"
								type="time"
								min={block.startTime}
								max={block.endTime}
							/>
						)}
					</form.AppField>
					<form.AppField name="endTime">
						{(field) => (
							<field.TextField
								label="Hora de fin"
								type="time"
								min={block.startTime}
								max={block.endTime}
							/>
						)}
					</form.AppField>
				</Flex>

				{space.spaceType === "shared_space" ? (
					<form.AppField name="seatsReserved">
						{(field) => (
							<field.NumberField
								label="Cantidad de cupos"
								min={1}
								max={block.seatsAvailable ?? space.capacity}
							/>
						)}
					</form.AppField>
				) : null}

				<Flex justify="flex-end" gap="3">
					<Button
						variant="outline"
						onClick={onDone}
						disabled={createReservation.isPending}
					>
						Cancelar
					</Button>
					<form.AppForm>
						<form.SubmitButton loading={createReservation.isPending}>
							Confirmar reserva
						</form.SubmitButton>
					</form.AppForm>
				</Flex>
			</Stack>
		</form>
	);
}
