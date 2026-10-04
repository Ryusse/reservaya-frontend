import { Field, NativeSelect } from "@chakra-ui/react";
import type { ReactNode } from "react";

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

type SelectFieldProps = {
	label: string;
	children: ReactNode;
};

export function SelectField({ label, children }: SelectFieldProps) {
	const field = useFieldContext<number>();
	const errors = field.state.meta.errors;
	const invalid = field.state.meta.isTouched && errors.length > 0;

	return (
		<Field.Root invalid={invalid}>
			<Field.Label>{label}</Field.Label>
			<NativeSelect.Root>
				<NativeSelect.Field
					value={field.state.value}
					onChange={(event) => field.handleChange(Number(event.target.value))}
					onBlur={field.handleBlur}
				>
					{children}
				</NativeSelect.Field>
				<NativeSelect.Indicator />
			</NativeSelect.Root>
			<Field.ErrorText>{fieldErrorMessage(errors)}</Field.ErrorText>
		</Field.Root>
	);
}
