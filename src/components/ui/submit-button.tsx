import { Button } from "@chakra-ui/react";
import type { ComponentProps } from "react";

import { useFormContext } from "#/hooks/form-context";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type">;

export function SubmitButton({
	children,
	loading,
	...props
}: SubmitButtonProps) {
	const form = useFormContext();

	return (
		<form.Subscribe
			selector={(state) => [state.canSubmit, state.isSubmitting] as const}
		>
			{([canSubmit, isSubmitting]) => (
				<Button
					type="submit"
					disabled={!canSubmit}
					loading={loading || isSubmitting}
					{...props}
				>
					{children}
				</Button>
			)}
		</form.Subscribe>
	);
}
