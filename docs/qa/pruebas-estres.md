# QA — Pruebas de estrés (APF1 §9.1.7.3)

Objetivo: verificar que la API (`reservaya`, rama `main`) sigue respondiendo de forma
correcta y sin caerse bajo carga concurrente. No sustituye a las pruebas unitarias/request
specs ni a las integrales (`reservaya-frontend/docs/qa/pruebas-integrales.md`).

Referencia: RNF01 (disponibilidad ≥ 99% del horario laboral), RNF02 (consulta de
disponibilidad < 2 s — aplica de lleno cuando exista HU04, hoy se usa como referencia
general de tiempo de respuesta).

---

## Herramienta

**Apache Bench (`ab`)** — viene preinstalado en macOS, no requiere instalar nada.
Alternativa más completa si hace falta más adelante: [k6](https://k6.io/) (escenarios en
JS, rampas de usuarios, mejor reporte de percentiles).

```bash
ab -n <requests> -c <concurrencia> [-H "Authorization: Bearer <token>"] <url>
```

## Entorno

| Pieza | URL local | URL Railway |
|---|---|---|
| API | `http://localhost:3100` | `https://reservaya-api.up.railway.app` |

**Nota:** el deploy de Railway todavía no está arriba (`reservaya#67` sin mergear), así
que el pase de abajo se ejecutó contra un contenedor local con la imagen de producción
real de `main` (mismo Dockerfile, mismo `Gemfile.lock`) y Postgres 18 vía `compose.yml`.
Pendiente: repetir contra `https://reservaya-api.up.railway.app` una vez esté disponible,
para tener también el número con latencia de red real.

---

## Escenarios

| ID | Endpoint | Método | Auth | Carga | Qué mide |
|---|---|---|---|---|---|
| PE-01 | `/up` | GET | No | 500 req, concurrencia 50 | Línea base: healthcheck puro, sin DB. Techo de RPS del proceso Puma/Thruster. |
| PE-02 | `/spaces` | GET | Sí (Bearer) | 500 req, concurrencia 50 | Lectura típica más usada (listado de espacios), con acceso a DB. |
| PE-03 | `/session` | POST | No | 200 req, concurrencia 20 | Login: hashing de contraseña (bcrypt) es la operación más cara de la API — concurrencia baja a propósito porque bcrypt está pensado para ser lento. |
| PE-04 | `/spaces` | GET | Sí (Bearer) | 2000 req, concurrencia 100 | Carga sostenida más agresiva, para ver degradación (RPS y p95 vs. PE-02). |

## Cómo ejecutar

1. Levantar la API: `bin/dev` (o Procfile) en `reservaya`, rama `main`.
2. Conseguir un token para los endpoints autenticados:
   ```bash
   TOKEN=$(curl -s -H 'Content-Type: application/json' \
     -d '{"email":"<admin>","password":"<password>"}' \
     http://localhost:3100/session | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")
   ```
3. Correr cada escenario:
   ```bash
   # PE-01
   ab -n 500 -c 50 http://localhost:3100/up

   # PE-02
   ab -n 500 -c 50 -H "Authorization: Bearer $TOKEN" http://localhost:3100/spaces

   # PE-03 (el body va en un archivo porque ab no soporta JSON inline con -p fácilmente)
   echo '{"email":"<admin>","password":"<password>"}' > /tmp/session.json
   ab -n 200 -c 20 -p /tmp/session.json -T application/json http://localhost:3100/session

   # PE-04
   ab -n 2000 -c 100 -H "Authorization: Bearer $TOKEN" http://localhost:3100/spaces
   ```
4. De la salida de `ab`, registrar en la tabla de abajo: `Requests per second`,
   `Time per request` (mean), `Time per request` (percentiles, sección "Percentage of the
   requests served within a certain time"), y `Failed requests`.

## Resultados

Ejecutado en local (Docker, imagen de producción real de `main`, Postgres 18 vía
`compose.yml`, catálogo de 5 espacios de prueba) el 2026-09-13.

| ID | RPS | Latencia media | p95 | Fallidas | Resultado |
|---|---|---|---|---|---|
| PE-01 (`/up`) | 1022.85 | 48.9 ms | — (no medido, ver nota) | 0 / 500 | ✅ |
| PE-02 (`/spaces`, 500×50) | 777.00 | 64.4 ms | — (no medido, ver nota) | 0 / 500 | ✅ |
| PE-03 (`/session`, 200×20) | 10.72 | 1865.8 ms | — (no medido, ver nota) | 0 / 200 | ✅ (lento por diseño, ver criterios) |
| PE-04 (`/spaces`, 2000×100) | 929.07 | 107.6 ms | 126 ms | 0 / 2000 | ✅ |

Nota: `ab` solo reporta el desglose de percentiles en la corrida más pesada (PE-04); para
PE-01/02/03 no hicieron falta 2000 requests para confirmar 0 fallidas. Si se quiere el p95
de esos tres también, repetir con `-n 2000`.

**Lectura de PE-04**: 0 requests fallidas con 100 conexiones concurrentes, p95 de 126 ms —
la API no se cae ni degrada de forma anómala bajo esta carga. PE-03 confirma que el login
es, por diseño, ~170× más lento que un GET normal (bcrypt), pero sigue respondiendo sin
errores incluso con 20 logins concurrentes.

## Criterios de aceptación

- **0 requests fallidas** en PE-01/02/03 (errores de conexión o 5xx).
- p95 de PE-02 razonable para una lista corta (referencia: < 500 ms en local; en Railway
  con Postgres compartido puede ser mayor, documentar el valor real).
- PE-04 puede mostrar degradación de latencia vs. PE-02 (es carga 4x mayor), pero **no**
  debe mostrar requests fallidas ni el proceso debe reiniciarse — revisar logs de Puma
  (`RAILS_MAX_THREADS`, pool de conexiones a Postgres) si aparecen errores de conexión a
  la base bajo PE-04.
- PE-03 (login) es el más lento por diseño (bcrypt) — no se compara contra PE-01/02, se
  usa solo para confirmar que no colapsa con concurrencia moderada.

## Relación con GitHub

| Qué | Dónde |
|---|---|
| Este plan | `reservaya-frontend/docs/qa/pruebas-estres.md` |
| Issue | [`reservaya-frontend#22`](https://github.com/Ryusse/reservaya-frontend/issues/22) — Sprint 1 |
| Deploy bloqueante | [`reservaya#67`](https://github.com/Ryusse/reservaya/pull/67) |
