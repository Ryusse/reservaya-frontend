# QA — Pruebas integrales (HT-04)

Pruebas del **sistema junto**: SPA (`reservaya-frontend`) + API Rails (`reservaya`).
No sustituyen las unitarias (Vitest, issue #9) ni los request specs del backend
(`reservaya/docs/qa/sprint-1.md`). Cubren RNF07: capas independientes que se hablan por HTTP.

Mismo formato que Sprint 1. Tras ejecutar, marcar **Resultado** (`✅` / `❌`) y citar evidencia
(captura, log de red, o issue de defecto). El PR de QA que cierre los escenarios se abre
contra `dev`, como [`reservaya#53`](https://github.com/Ryusse/reservaya/pull/53).

Tablero: [Project #10](https://github.com/users/Ryusse/projects/10).

---

## Entorno

| Pieza | Repo | URL local | URL Railway | Cómo levantar |
|---|---|---|---|---|
| API | [`reservaya`](https://github.com/Ryusse/reservaya), rama **`main`** | `http://localhost:3100` | `https://reservaya-api.up.railway.app` | En ese repo: `bin/dev` (o el Procfile). |
| Frontend | este repo | `http://localhost:3000` | `https://reservaya.up.railway.app` | `pnpm install && pnpm dev`. `VITE_API_URL` (`.env.example`). |

> ⚠️ **Esto cambió de backend.** Las versiones anteriores de este plan probaban contra `dev`
> (monorepo viejo). Ahora el backend es el de **`main`** (repo separado, ver
> `reservaya#64`), que tiene un contrato de auth **distinto**:

| | `dev` (viejo, ya no aplica aquí) | `main` (actual) |
|---|---|---|
| Sesión | Cookie httpOnly `reservaya_session` | **Bearer token** (`Authorization: Bearer <jwt>`), sin cookie |
| Restaurar sesión al recargar | `GET /session` | **No existe ese endpoint** |
| Registro público | `POST /register` | **No existe** — `POST /users` exige admin logueado |
| Seed de usuarios | `db/seeds.rb` con admin/user | `db/seeds.rb` está **vacío** |

**🔴 Bloqueo conocido (bloquea casi todo el bloque HT-01/HU03 de abajo):** el frontend
actual (`src/lib/http.ts`) todavía manda `withCredentials: true` y nunca setea el header
`Authorization` — es el código pensado para el backend de `dev`. Contra `main`, **todo
login devuelve 401** porque el token nunca viaja. Esto se cerró como issue
[`reservaya-frontend#18`](https://github.com/Ryusse/reservaya-frontend/issues/18)
("Adaptar auth y spaces a la API real de main") pero se **canceló/pausó** a propósito
(no tocar código de auth por ahora). Los escenarios PI-00c/d, PI-01–02, PI-06–09 y PI-12
de abajo están escritos para cuando ese trabajo se retome — hoy fallan todos por este
motivo, no por bugs puntuales. Antes de correr el pase completo: reabrir #18 o crear uno
nuevo con ese alcance.

**Tampoco hay usuarios para loguear**: `db/seeds.rb` en `main` está vacío. Hace falta
crear un admin a mano (`bin/rails console` → `User.create!(...)`) antes de poder ejecutar
PI-01 en adelante.

Navegador: Chrome/Safari con las dos URLs. DevTools → Red + Application → Local Storage
(el token, si #18 se implementa, vive ahí — no en cookies).

---

## Cómo ejecutar

1. API arriba en `:3100`. Comprobar: `curl -s http://localhost:3100/up`.
2. Front arriba en `:3000`.
3. Recorrer la tabla en orden. Un `❌` abre `bugfix/<slug>` (ver `docs/gitflow.md`) y se
   referencia el ID (`PI-03`, …) en el issue.
4. Al terminar el pase, actualizar esta tabla en el mismo PR (`docs(qa): …`).

No hace falta Playwright todavía: son pruebas de sistema manuales contra el entorno local
(o Railway cuando el DoD pide “disponible en el entorno de pruebas”).

---

## PI-00 · Contrato entre capas (RNF07)

| ID | Escenario | Pasos | Esperado | Resultado | Evidencia |
|---|---|---|---|---|---|
| PI-00a | API viva | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/up` | `200` | ⬜ | |
| PI-00b | Front sirve la SPA | Abrir `http://localhost:3000` | Pantalla de login (o spinner y luego login si no hay sesión) | ⬜ | |
| PI-00c | CORS | En DevTools, `POST http://localhost:3100/session` desde el origin `http://localhost:3000` | `Access-Control-Allow-Origin` es `http://localhost:3000` (no `*`); no hace falta `Allow-Credentials` (no hay cookie) | ⬜ | Depende de `reservaya#63` |
| PI-00d | Token en el cliente | Login OK → Local Storage / estado de la app | Existe el JWT guardado por el store; requests siguientes mandan `Authorization: Bearer <jwt>` | ⬜ | Depende de #18 (pausado) |

---

## HT-01 · Acceso (login, sesión, rol)

Cubre la migración de HT-01 al SPA independiente. Issues FE ya mergeados: #5, #4.
PI-01, 02, 06, 07, 08 requieren #18 (Bearer token) resuelto — hoy dan 401 desde el paso 1.

| ID | Escenario | Pasos | Esperado | Resultado | Evidencia |
|---|---|---|---|---|---|
| PI-01 | Login admin | `/login` → admin creado a mano en consola / `secret123` → Entrar | Redirige a `/admin`. Sidebar muestra **Espacios**, no **Inicio**. Nombre “Administrador” | ⬜ | Bloqueado por #18 |
| PI-02 | Login user | Logout si hace falta. `/login` → usuario `role: user` | Redirige a `/`. Sidebar muestra **Inicio**, no **Espacios** | ⬜ | Bloqueado por #18 |
| PI-03 | Credenciales inválidas | `/login` → password `wrong` | Se queda en login. Mensaje “Correo o contraseña inválidos” | ⬜ | |
| PI-04 | Guard sin sesión | En ventana privada, abrir `http://localhost:3000/` y `…/admin` | Redirect a `/login` (`routes/_authed.tsx`) | ⬜ | No depende de #18, ya debería pasar |
| PI-05 | Guard por rol | Logueado como **user**, ir a `http://localhost:3000/admin` | Redirect a `/` (`routes/_authed/admin.tsx`). El ítem Espacios no está en el sidebar | ⬜ | Bloqueado por #18 |
| PI-06 | Sesión al recargar | Login admin → recargar `/admin` | Sigue autenticado (token restaurado desde `localStorage` al montar) | ⬜ | Bloqueado por #18 — hoy no hay restauración, recargar desloguea |
| PI-07 | Logout | Clic **Cerrar sesión** | Token descartado del cliente (no hay invalidación server-side, `DELETE /session` es un no-op), redirect `/login` | ⬜ | Bloqueado por #18 |
| PI-08 | 401 en API | Con sesión, forzar un token inválido y navegar a Espacios | Interceptor de `http` limpia el store; acaba en `/login` | ⬜ | Bloqueado por #18 |

---

## HU03 · Registro de usuario

**🔴 `main` no tiene registro público todavía** (`POST /register` no existe; crear
usuarios exige admin vía `POST /users`). PI-09/11/12 quedan bloqueados hasta que el
backend agregue ese endpoint — no es un tema de frontend. PI-10 (validación de
formulario) sí se puede correr ya, es puramente client-side.

| ID | Escenario | Pasos | Esperado | Resultado | Evidencia |
|---|---|---|---|---|---|
| PI-09 | Registro OK | `/register` → nombre, email nuevo, password ≥ 6 → Registrarme | `POST /register` 201, auto-login, home de **user** | ⬜ | Bloqueado: falta el endpoint en `main` |
| PI-10 | Validación de formulario | Enviar nombre vacío / correo inválido / password de 3 caracteres | El submit no sale; errores Zod en el campo (sin pegarle a la API) | ⬜ | No depende del backend |
| PI-11 | Email duplicado | Registrar un email ya existente | 422 con mensaje de la API | ⬜ | Bloqueado: falta el endpoint en `main` |
| PI-12 | Público | Network: `POST /register` sin sesión previa | 201. No exige sesión | ⬜ | Bloqueado: falta el endpoint en `main` |

---

## HU01 / HU02 · CRUD de espacios (admin)

Precondición: sesión **admin**. UI: `/admin`.

| ID | Escenario | Pasos | Esperado | Resultado | Evidencia |
|---|---|---|---|---|---|
| PI-13 | Listado | Abrir `/admin` | Tabla con el seed (Sala A, Sala B, Auditorio). `GET /spaces` 200 | ⬜ | |
| PI-14 | Alta OK | **Nuevo espacio** → Nombre `Sala QA`, Ubicación `Piso 4`, Capacidad `4`, 08:00–18:00 → Guardar | El diálogo cierra. La fila aparece. `POST /spaces` 201 | ⬜ | |
| PI-15 | Alta inválida (UI) | Nuevo espacio, nombre vacío / capacidad 0 | No llama a la API; error de Zod en el campo | ⬜ | |
| PI-16 | Alta inválida (API) | Si se fuerza un horario fin < inicio (o el backend responde 422) | El diálogo permanece. Errores de API debajo del form | ⬜ | |
| PI-17 | Editar | En Sala QA → **Editar** → capacidad `8` → Guardar | La tabla muestra 8. `PATCH /spaces/:id` 200 | ⬜ | |
| PI-18 | Dar de baja | Sala QA → **Dar de baja** → confirmar | Sale de la tabla. `GET /spaces` ya no la lista | ⬜ | |
| PI-19 | User no crea espacios | Login user. No hay ruta admin. `POST /spaces` con la cookie de user (curl) | 403 `No autorizado` | ⬜ | |

Curl de apoyo para PI-19 (Bearer token, no cookie — `main` no usa cookies):

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' \
  -d '{"email":"user@test.com","password":"secret123"}' \
  http://localhost:3100/session | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")

curl -s -o /dev/stderr -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"space":{"name":"X","location":"Y","capacity":1,"start_time":"08:00","end_time":"18:00"}}' \
  http://localhost:3100/spaces
```

Esperado: cuerpo 403 y código `403`.

---

## RNF

| ID | RNF | Cómo se verifica aquí | Resultado |
|---|---|---|---|
| PI-20 | RNF03 responsive | Login y `/admin` a 1280px y 375px. Formulario usable, tabla con scroll, sidebar no tapa el contenido | ⬜ |
| PI-21 | RNF04 hash | En la API: `User.find_by(email: "admin@test.com").password_digest` empieza por `$2a$` y no es `secret123` (ya cubierto en Sprint 1; no se re-prueba en el front) | ✅ Sprint 1 |
| PI-22 | RNF07 capas | Front y API en repos y puertos distintos. El front no habla con ActiveRecord; solo `VITE_API_URL` | ⬜ |

HU04–HU10 (disponibilidad, reservas, dashboard, reportes, notificaciones) **no** entran:
aún no están en este frontend (alcance de HT-04, issue #1).

---

## Resumen

| Bloque | IDs | Resultado del pase |
|---|---|---|
| Contrato FE↔API | PI-00a–d | ⬜ |
| HT-01 acceso | PI-01–08 | ⬜ |
| HU03 registro | PI-09–12 | ⬜ |
| HU01/HU02 espacios | PI-13–19 | ⬜ |
| RNF | PI-20–22 | ⬜ |

Al cerrar el pase: 0 defectos abiertos, o cada `❌` con issue `bugfix/` enlazado.

---

## Relación con GitHub

| Qué | Dónde |
|---|---|
| Este plan / evidencia | `docs/qa/pruebas-integrales.md` (este archivo), repo **reservaya-frontend** |
| Pruebas funcionales Sprint 1 (API) | [`reservaya/docs/qa/sprint-1.md`](https://github.com/Ryusse/reservaya/blob/dev/docs/qa/sprint-1.md) |
| Unitarias del front | issue [#9](https://github.com/Ryusse/reservaya-frontend/issues/9) · `pnpm test` / `pnpm tests` (Vitest) — ✅ hecho, 20 tests, PR #25 |
| CI del front | `.github/workflows/ci.yml` — `pnpm check` + `pnpm build` en PRs a `dev`/`main` |
| DoD (APF §5.1) | `.github/pull_request_template.md` — criterios de aceptación + “disponible en el entorno de pruebas” |
| Cómo ramificar el PR de QA | `docs/gitflow.md` · base `dev` · labels `type:tarea, area:qa, sprint:2` |

Cuando este pase esté ejecutado, el PR de documentación (o el de #9 si se unifica) pone
`Closes #<issue-qa>` y mueve la tarjeta a **In Review** en el Project.
