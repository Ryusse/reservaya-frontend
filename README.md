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

## Variables de entorno

Ver `src/env.ts` (validadas con `@t3-oss/env-core` + Zod).
