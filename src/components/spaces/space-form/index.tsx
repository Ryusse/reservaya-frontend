import { Stack, Text } from "@chakra-ui/react";

import { useAppForm } from "#/hooks/form";
import type { NewSpace } from "#/models/space";
import { newSpaceSchema } from "#/models/space";

type SpaceFormProps = {
	initialValues?: NewSpace;
	submitLabel?: string;
	pending?: boolean;
	errors?: string[];
	onSubmit: (values: NewSpace) => void;
};

const empty: NewSpace = {
	name: "",
	location: "",
	capacity: 1,
	startTime: "",
	endTime: "",
};

export function SpaceForm({
	initialValues,
	submitLabel = "Guardar",
	pending,
	errors,
	onSubmit,
}: SpaceFormProps) {
	const form = useAppForm({
		defaultValues: initialValues ?? empty,
		validators: { onChange: newSpaceSchema },
		onSubmit: ({ value }) => onSubmit(value),
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<Stack gap="4">
				<form.AppField name="name">
					{(field) => <field.TextField label="Nombre" />}
				</form.AppField>
				<form.AppField name="location">
					{(field) => <field.TextField label="Ubicación" />}
				</form.AppField>
				<form.AppField name="capacity">
					{(field) => <field.NumberField label="Capacidad" min={1} />}
				</form.AppField>
				<form.AppField name="startTime">
					{(field) => <field.TextField label="Hora de apertura" type="time" />}
				</form.AppField>
				<form.AppField name="endTime">
					{(field) => <field.TextField label="Hora de cierre" type="time" />}
				</form.AppField>

				{errors?.length ? (
					<Stack gap="1">
						{errors.map((message) => (
							<Text key={message} color="fg.error" fontSize="sm">
								{message}
							</Text>
						))}
					</Stack>
				) : null}

				<form.AppForm>
					<form.SubmitButton loading={pending}>{submitLabel}</form.SubmitButton>
				</form.AppForm>
			</Stack>
		</form>
	);
}
