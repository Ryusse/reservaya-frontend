# Flujo de trabajo (Git)

Mismo flujo que [`reservaya`](https://github.com/Ryusse/reservaya/blob/dev/docs/gitflow.md),
aplicado a este repo.

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Entregables. Solo recibe merge de `dev` en cada hito. |
| `dev` | Integración del sprint activo. |
| `feature/<ID>-<slug>` | Una por issue de desarrollo (`feature/HT04-chakra-ui`). |
| `bugfix/<slug>` | Corrección de defectos hallados en pruebas. |

## Por cada issue

1. **Crear la rama desde el issue** (queda enlazada → el merge del PR cierra el issue):
   ```bash
   gh issue develop <N> --base dev --name feature/<ID>-<slug>
   ```
   (o en la web: issue → *Development* → *Create a branch* → base `dev`)

2. **Traerla y cambiarse en local**:
   ```bash
   git fetch origin
   git switch feature/<ID>-<slug>
   ```

3. Desarrollar la issue.

4. **Commits**: Conventional Commits (ver abajo).

5. **Push y PR**:
   ```bash
   git push -u origin feature/<ID>-<slug>
   gh pr create --base dev --assignee Ryusse \
     --label "type:...,area:...,sprint:..." \
     --title "<tipo>(<scope>): ..." --body-file <descripcion.md>
   ```
   El PR **siempre**:
   - descripción completa (qué, por qué, cómo probar) + `Closes #<N>`, con el checklist de `.github/pull_request_template.md` (Definition of Done);
   - **asignado a `Ryusse`**;
   - con las **labels** que correspondan (`type:*`, `area:*`, `sprint:*`);
   - **sin** atribuciones de herramientas ni `Co-authored-by` (ni en commits ni en el cuerpo).

6. Review de otro integrante → **merge (squash)** → como `dev` no es la rama por defecto, `Closes #<N>` no cierra el issue: **cerrarlo a mano** y moverlo a *Done* en el [Project #10](https://github.com/users/Ryusse/projects/10).

## Commits — Conventional Commits

```
<tipo>(<scope>): <descripción imperativa, minúscula, sin punto final>
```

- **tipos**: `feat` · `fix` · `refactor` · `test` · `docs` · `chore` · `ci` · `build` · `perf` · `style`
- **scope**: el módulo o capa afectada — `router`, `auth`, `spaces`, `forms`, `http`, `ui`, …
- descripción ≤ 72 caracteres
- cuerpo opcional: qué y por qué
- referencia al issue en el pie con `Refs #<N>` (el `Closes #<N>` va en el PR, no en cada commit)
- **sin `Co-authored-by` ni trailers de herramientas**

Ejemplos:
```
feat(forms): validar espacio con TanStack Form + Zod
chore(ui): agregar snippets de Chakra UI (provider, color-mode, toaster)
fix(http): reenviar cookie de sesión en llamadas cross-origin
docs: guía de gitflow
```
