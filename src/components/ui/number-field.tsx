import { Field, Input } from "@chakra-ui/react";

import { useFieldContext } from "#/hooks/form-context";

function fieldErrorMessage(errors: unknown[]): string {
	return errors
		.map((error) =>
			typeof error === "string"
				? error
				: ((error as { message?: string })?.message ?? ""),
		)
		.filter(Boolean)
		.join(", ");
}

type NumberFieldProps = {
	label: string;
	min?: number;
};

export function NumberField({ label, min }: NumberFieldProps) {
	const field = useFieldContext<number>();
	const errors = field.state.meta.errors;
	const invalid = field.state.meta.isTouched && errors.length > 0;

	return (
		<Field.Root invalid={invalid}>
			<Field.Label>{label}</Field.Label>
			<Input
				type="number"
				min={min}
				value={field.state.value}
				onChange={(event) => field.handleChange(Number(event.target.value))}
				onBlur={field.handleBlur}
			/>
			<Field.ErrorText>{fieldErrorMessage(errors)}</Field.ErrorText>
		</Field.Root>
	);
}
