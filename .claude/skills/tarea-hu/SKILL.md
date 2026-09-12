---
name: tarea-hu
description: Flujo completo para implementar una tarea de una Historia de Usuario en reservaya-frontend, siguiendo GitFlow (rama desde el issue, código, tests, PR contra dev).
---

# Implementar una tarea de HU

Usar cuando haya que desarrollar un issue `[FE]`/`[QA]` hijo de una historia (HU) o habilitador (HT).

## Pasos

1. **Rama desde el issue** (nunca empezar sin esto):
   ```bash
   gh issue develop <N> --base dev --name feature/<ID>-<slug>
   git fetch origin && git switch feature/<ID>-<slug>
   ```
   `<ID>` = `HU01`, `HT04`, … · `<slug>` = kebab-case corto. Mover el issue a **In Progress** en el Project.

2. **Implementar** respetando `CLAUDE.md`:
   - Sin comentarios en código (solo pragmas funcionales).
   - Dirección de dependencias: `routes -> pages -> hooks -> services -> adapters -> lib/http -> API`.
   - Una carpeta por componente con `index.tsx`, kebab-case, sin barrels.
   - UI con **Chakra UI v3**; formularios con **TanStack Form + Zod**; estado global con **TanStack Store**; server state con **TanStack Query**.

3. **Tests**:
   ```bash
   pnpm check    # tipos + lint + format (Biome)
   pnpm test     # Vitest
   ```
   Todo en verde antes de continuar. Si el cambio es visual o de flujo, probarlo también en `pnpm dev`.

4. **Commit** — Conventional Commits con scope, footer `Refs #<N>`. Sin `Co-authored-by` ni trailers. **Preguntar antes de commitear.**

5. **PR contra `dev`**:
   ```bash
   gh pr create --base dev --assignee Ryusse \
     --label "type:tarea,area:frontend,sprint:<n>" \
     --title "<HU/HT> · <desc>" --body-file <archivo>
   ```
   Cuerpo con: qué hace, cómo probar, `Closes #<N>`, checklist DoD (`.github/pull_request_template.md`). Mover el issue a **In Review**.

6. **Merge squash a `dev`**. Como `dev` no es la rama por defecto, `Closes #<N>` no cierra el issue: **cerrarlo a mano** y moverlo a **Done**. Borrar la rama.

## Referencias

- `docs/gitflow.md`
- Tablero: https://github.com/users/Ryusse/projects/10
