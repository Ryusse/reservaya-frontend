import { createFormHook } from "@tanstack/react-form";

import { NumberField } from "#/components/ui/number-field";
import { SubmitButton } from "#/components/ui/submit-button";
import { TextField } from "#/components/ui/text-field";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		NumberField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
