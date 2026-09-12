import { Field, Input } from "@chakra-ui/react";
import type { ComponentProps } from "react";

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

type TextFieldProps = {
	label: string;
	helperText?: string;
} & Omit<ComponentProps<typeof Input>, "value" | "onChange" | "onBlur">;

export function TextField({
	label,
	helperText,
	...inputProps
}: TextFieldProps) {
	const field = useFieldContext<string>();
	const errors = field.state.meta.errors;
	const invalid = field.state.meta.isTouched && errors.length > 0;

	return (
		<Field.Root invalid={invalid}>
			<Field.Label>{label}</Field.Label>
			<Input
				value={field.state.value}
				onChange={(event) => field.handleChange(event.target.value)}
				onBlur={field.handleBlur}
				{...inputProps}
			/>
			{helperText ? <Field.HelperText>{helperText}</Field.HelperText> : null}
			<Field.ErrorText>{fieldErrorMessage(errors)}</Field.ErrorText>
		</Field.Root>
	);
}
