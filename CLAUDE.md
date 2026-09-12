# CLAUDE.md

Project context for Claude Code. Keep it short and up to date. **This file is always written in English.**

## What it is

**ReservaYa — Frontend**: independent SPA/SSR app for booking physical spaces, built with
**TanStack Start** (Router + Query + Form + Store) and **Chakra UI v3**. Consumes the REST API of
[`reservaya`](https://github.com/Ryusse/reservaya) (Rails), which is a separate repository — API
and frontend are independent layers (RNF07). Both repos share the same GitHub Project:
https://github.com/users/Ryusse/projects/10.

This repo replaces the React app that used to live at `reservaya/app/javascript/` (kept there,
frozen, on branch `old`, for reference).

## Running it

```bash
pnpm install
pnpm dev              # -> http://localhost:3000, proxies/calls the Rails API via VITE_API_URL
```

The Rails API (`reservaya`) must be running separately (see its own `CLAUDE.md`).

## Auth

Session lives in an httpOnly encrypted cookie set by `POST /session` on the Rails API
(`reservaya_session`, cross-site: `SameSite=None; Secure`). This SPA never handles the JWT
directly. The `http` client sends `withCredentials: true`; the API must respond with
`Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin` (no
wildcard) for this to work cross-origin.

## Frontend architecture (`src/`)

Layered, dependencies point inward — `routes -> pages -> hooks -> services -> adapters -> lib/http -> API`:

| Folder | Holds |
|---|---|
| `models/` | domain types (User, Session, Space, Reservation) |
| `adapters/` | map raw API responses <-> models (dates, enums, snake_case -> camelCase) |
| `lib/` | `http` (axios, `withCredentials`, 401 handling), `env`, config |
| `services/` | business logic + API calls |
| `hooks/` | encapsulate `services` + TanStack Query/Form for components: `useSpaces`, `useLogin`, … |
| `stores/` | global client state with **TanStack Store** (session: user, role, load status — no token) |
| `components/ui/` | **Chakra UI** snippets (`provider`, `color-mode`, `toaster`, `tooltip`) + shared form field components built on Chakra. Feature components: `components/<module>/` |
| `pages/` | route containers, compose `hooks` + `components` |
| `routes/` | **TanStack Router** file-based tree (TanStack Start), role guards |

State:
- **Global/client**: TanStack Store (`stores/`) — only what's truly shared and doesn't fit the URL (session).
- **Server/cache**: TanStack Query, through `hooks/`.
- **Forms**: TanStack Form (`useAppForm`, see `hooks/form.ts` / `hooks/form-context.ts`) with Zod schemas for validation, rendered with Chakra field components — never raw `useState` forms.
- **URL**: TanStack Router (search params, path params).

Composition: `src/routes/__root.tsx` (`shellComponent`, full HTML doc, Chakra `<Provider>`, session
bootstrap) -> route tree. There is no separate `App.tsx`/manual `RouterProvider` — TanStack Start
owns that.

## Tests & lint

```bash
pnpm check    # Biome (lint + format check + import sort) + types
pnpm lint     # Biome lint only
pnpm test     # Vitest (jsdom) — *.test.ts(x) next to the source
```

Lint/format is **Biome** (`biome.json`). `src/routeTree.gen.ts` is excluded (generated, don't edit).

## Git workflow

Full details in `docs/gitflow.md`. Summary:

1. Branch **from the issue**: `gh issue develop <N> --base dev --name feature/<ID>-<slug>`
2. Locally: `git fetch origin && git switch feature/<ID>-<slug>`
3. Develop.
4. **Commits = Conventional Commits**: `<type>(<scope>): <desc>` — types `feat|fix|refactor|test|docs|chore|ci|build`, scope by module (`auth`, `spaces`, `forms`, `http`, `router`, `ui`, …). Reference the issue with `Refs #<N>` in the footer.
5. `git push -u origin <branch>` -> open the PR -> review -> squash merge -> close the issue by hand + move to Done on the Project (squash merge into `dev`, a non-default branch, doesn't auto-close).

**PR — always**:
- **Full description**: what it does, why, how to test, and `Closes #<N>`. Use `.github/pull_request_template.md` (DoD checklist).
- **Assigned to `Ryusse`** (`--assignee Ryusse`).
- **Labels** as applicable: `type:*`, `area:*`, `sprint:*`.

**Never** add `Co-authored-by`, "Generated with", or any tool trailer/attribution — not in commits, not in the PR body.

## Rules for Claude

- **No comments in code** (any language). Code is explained by clear names. Only exceptions: functional directives (linter/TS pragmas that change behavior).
- When **done implementing**, always ask before committing. Never commit without explicit confirmation.
- Commits in Conventional Commits, with scope, **no `Co-authored-by` or trailers**.
- Do not start an issue without first: branch from the issue -> `git fetch` -> `git switch` (see `docs/gitflow.md`).
- Respect the dependency direction: `components/ui` never calls `services` or `stores`.
- **One folder per page / feature component**: `index.tsx` in its own folder, kebab-case name, PascalCase export.
  - Pages: `pages/<module>/<page>/` (a *module* = feature area: `auth`, `spaces`, …); top-level pages without a module go in `pages/<page>/`.
  - Module-specific components: `components/<module>/<name>/`.
  - `components/ui/` holds Chakra snippets (flat `.tsx` files, as the Chakra CLI generates them).
  - Route files in `routes/` only define the route and import the page component from `pages/`.
- **No barrel / `index.ts` re-export files.** Import directly.
- **UI = Chakra UI v3.** Style with Chakra props/recipes. No Tailwind, no CSS Modules, no `cn`/`clsx`/`tailwind-merge`. Add Chakra snippets with `pnpm dlx @chakra-ui/cli snippet add <name> --tsx --outdir src/components/ui`.
- **Forms = TanStack Form + Zod.** No manual `useState` + `onChange` form wiring — use `useAppForm` with Chakra-based field components (`components/ui/`) and a Zod schema per form.
- This file (`CLAUDE.md`) is always written in English.
