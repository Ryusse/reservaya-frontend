import { Card, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";

import { useAppForm } from "#/hooks/form";
import { useLogin } from "#/hooks/use-login";
import { credentialsSchema } from "#/models/credentials";

export function LoginPage() {
	const login = useLogin();

	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		validators: { onChange: credentialsSchema },
		onSubmit: ({ value }) => login.mutate(value),
	});

	return (
		<Container maxW="sm" py="16">
			<Card.Root>
				<Card.Header>
					<Heading size="xl">Iniciar sesión</Heading>
				</Card.Header>
				<Card.Body>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							form.handleSubmit();
						}}
					>
						<Stack gap="4">
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
										autoComplete="current-password"
									/>
								)}
							</form.AppField>

							{login.isError ? (
								<Text color="fg.error" fontSize="sm">
									Correo o contraseña inválidos
								</Text>
							) : null}

							<form.AppForm>
								<form.SubmitButton loading={login.isPending}>
									Entrar
								</form.SubmitButton>
							</form.AppForm>

							<Text fontSize="sm" color="fg.muted">
								¿No tienes cuenta?{" "}
								<RouterLink
									to="/register"
									style={{ textDecoration: "underline" }}
								>
									Regístrate
								</RouterLink>
							</Text>
						</Stack>
					</form>
				</Card.Body>
			</Card.Root>
		</Container>
	);
}
