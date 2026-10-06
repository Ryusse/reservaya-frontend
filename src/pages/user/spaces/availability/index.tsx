import { Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

import { AvailabilityView } from "#/components/spaces/availability-view";
import { useAppForm } from "#/hooks/form";
import { useSpaceAvailability } from "#/hooks/use-space-availability";
import { useSpaces } from "#/hooks/use-spaces";
import { apiErrors } from "#/lib/api-error";

type AvailabilityQuery = {
	spaceId: number;
	date: string;
};

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
	const [query, setQuery] = useState<AvailabilityQuery | null>(null);

	const form = useAppForm({
		defaultValues: { spaceId: 0, date: today() } as AvailabilityQuery,
		onSubmit: ({ value }) => setQuery(value),
	});

	const availability = useSpaceAvailability(
		query?.spaceId ?? 0,
		query?.date ?? "",
		query !== null,
	);

	return (
		<Stack gap="6" maxW="2xl">
			<Heading size="2xl">Disponibilidad de espacios</Heading>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
				<Stack gap="4">
					<form.AppField name="spaceId">
						{(field) => (
							<field.SelectField label="Espacio">
								<option value={0} disabled>
									Elige un espacio
								</option>
								{spaces.data?.map((space) => (
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
								min={today()}
								max={maxAdvanceDate()}
							/>
						)}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton>Consultar</form.SubmitButton>
					</form.AppForm>
				</Stack>
			</form>

			{query === null ? null : availability.isPending ? (
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
				<AvailabilityView availability={availability.data} />
			)}
		</Stack>
	);
}
