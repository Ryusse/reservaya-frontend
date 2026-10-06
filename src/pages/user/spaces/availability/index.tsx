import {
	Field,
	Flex,
	Heading,
	Input,
	NativeSelect,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { ReservationModal } from "#/components/reservations/reservation-modal";
import { AvailabilityView } from "#/components/spaces/availability-view";
import { useSpaceAvailability } from "#/hooks/use-space-availability";
import { useSpaces } from "#/hooks/use-spaces";
import { apiErrors } from "#/lib/api-error";
import type { AvailabilityBlock } from "#/models/availability";

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function maxAdvanceDate(): string {
	const date = new Date();
	date.setDate(date.getDate() + 7);
	return date.toISOString().slice(0, 10);
}

export function UserSpaceAvailabilityPage() {
	const spaces = useSpaces();

	const [spaceId, setSpaceId] = useState<number>(0);
	const [date, setDate] = useState<string>(today());
	const [reservingBlock, setReservingBlock] =
		useState<AvailabilityBlock | null>(null);

	const availability = useSpaceAvailability(
		spaceId,
		date,
		spaceId !== 0 && date !== "",
	);

	return (
		<Stack gap="8" maxW="4xl">
			<Heading size="2xl">Reservar espacio</Heading>

			<Stack direction={{ base: "column", md: "row" }} gap="6" align="stretch">
				<Flex flex="1">
					<Field.Root>
						<Field.Label>1. Elige un espacio</Field.Label>
						<NativeSelect.Root>
							<NativeSelect.Field
								value={spaceId}
								onChange={(e) => setSpaceId(Number(e.target.value))}
							>
								<option value={0} disabled>
									Selecciona una sala...
								</option>
								{spaces.data?.map((space) => (
									<option key={space.id} value={space.id}>
										{space.name}
									</option>
								))}
							</NativeSelect.Field>
							<NativeSelect.Indicator />
						</NativeSelect.Root>
					</Field.Root>
				</Flex>

				<Flex flex="1">
					<Field.Root>
						<Field.Label>2. Selecciona la fecha</Field.Label>
						<Input
							type="date"
							min={today()}
							max={maxAdvanceDate()}
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</Field.Root>
				</Flex>
			</Stack>

			{spaceId === 0 ? null : availability.isPending ? (
				<Spinner />
			) : availability.isError ? (
				<Stack gap="1">
					{apiErrors(availability.error).map((message) => (
						<Text key={message} color="fg.error">
							{message}
						</Text>
					))}
				</Stack>
			) : (
				<Stack gap="4">
					<Heading size="md" color="fg.muted">
						Horarios disponibles
					</Heading>
					<AvailabilityView
						availability={availability.data}
						onReserve={setReservingBlock}
					/>
					{/* Aquí irá la tabla CRUD de reservas en la próxima HU */}
				</Stack>
			)}

			{availability.data ? (
				<ReservationModal
					space={availability.data.space}
					date={date}
					block={reservingBlock}
					onClose={() => setReservingBlock(null)}
				/>
			) : null}
		</Stack>
	);
}
