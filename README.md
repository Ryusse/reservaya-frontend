# ReservaYa — Frontend

SPA de reservas de espacios, construida con **TanStack Start** (Router + Query + Form + Store)
y **Chakra UI v3**, consumiendo la API REST de [reservaya](https://github.com/Ryusse/reservaya)
(Rails). Ver `CLAUDE.md` para arquitectura, convenciones y flujo de trabajo.

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

```bash
pnpm check      # tipos + lint + format (Biome)
pnpm lint       # Biome lint
pnpm format     # Biome format
pnpm build      # build de producción
pnpm start      # servir el build (.output/server/index.mjs)
```

## Pruebas

| Capa | Dónde | Cómo |
|---|---|---|
| Integrales (SPA + API) | [`docs/qa/pruebas-integrales.md`](docs/qa/pruebas-integrales.md) | Front `:3000` + API `:3100`, escenarios PI-00…PI-22 |
| Funcionales de API (Sprint 1) | [`reservaya/docs/qa/sprint-1.md`](https://github.com/Ryusse/reservaya/blob/dev/docs/qa/sprint-1.md) | `bin/rails test` en el backend |
| Unitarias del front | issue #9 (pendiente) | `pnpm test` (Vitest) |

## Variables de entorno

Ver `src/env.ts` (validadas con `@t3-oss/env-core` + Zod) y `.env.example`.

| Variable | Uso |
|---|---|
| `VITE_API_URL` | Base URL de la API de `reservaya`. Default de desarrollo: `http://localhost:3100`. En producción, la URL del servicio de Railway del backend. |
| `VITE_APP_TITLE` | Opcional, título de la app. |

## Despliegue (Railway)

Este repo se despliega como su propio servicio en Railway, independiente del backend
(`reservaya`), que vive en otro servicio/proyecto con su propia URL.

1. Crear el servicio en Railway apuntando a este repo, rama `main`.
2. Railpack detecta `pnpm` y los scripts (`build`/`start`) automáticamente — no hace falta
   Dockerfile.
3. Configurar `VITE_API_URL` en las variables de entorno del servicio, con la URL del
   servicio de `reservaya` en Railway.
4. Deploy. Railway expone su propio dominio (`*.up.railway.app` o uno custom).

El backend, a su vez, debe permitir este origen en CORS y setear la cookie de sesión
`SameSite=None; Secure` (ver `reservaya#63`) para que la sesión funcione cross-origin.
