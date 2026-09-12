import { Card, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";

import { useAppForm } from "#/hooks/form";
import { useRegister } from "#/hooks/use-register";
import { apiErrors } from "#/lib/api-error";
import { registrationSchema } from "#/models/registration";

export function RegisterPage() {
	const register = useRegister();

	const form = useAppForm({
		defaultValues: { name: "", email: "", password: "" },
		validators: { onChange: registrationSchema },
		onSubmit: ({ value }) => register.mutate(value),
	});

	return (
		<Container maxW="sm" py="16">
			<Card.Root>
				<Card.Header>
					<Heading size="xl">Crear cuenta</Heading>
				</Card.Header>
				<Card.Body>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							form.handleSubmit();
						}}
					>
						<Stack gap="4">
							<form.AppField name="name">
								{(field) => (
									<field.TextField label="Nombre" autoComplete="name" />
								)}
							</form.AppField>
							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="Correo"
										type="email"
										autoComplete="email"
									/>
								)}
							</form.AppField>
							<form.AppField name="password">
								{(field) => (
									<field.TextField
										label="Contraseña"
										type="password"
										autoComplete="new-password"
										helperText="Al menos 6 caracteres."
									/>
								)}
							</form.AppField>

							{register.isError ? (
								<Stack gap="1">
									{apiErrors(register.error).map((message) => (
										<Text key={message} color="fg.error" fontSize="sm">
											{message}
										</Text>
									))}
								</Stack>
							) : null}

							<form.AppForm>
								<form.SubmitButton loading={register.isPending}>
									Registrarme
								</form.SubmitButton>
							</form.AppForm>

							<Text fontSize="sm" color="fg.muted">
								¿Ya tienes cuenta?{" "}
								<RouterLink to="/login" style={{ textDecoration: "underline" }}>
									Inicia sesión
								</RouterLink>
							</Text>
						</Stack>
					</form>
				</Card.Body>
			</Card.Root>
		</Container>
	);
}
