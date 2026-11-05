# Pruebas Sprint 3 · HU06, HU07, HU08

Informe de validación de las historias del Sprint 3 contra el APF
(`Avance_del_Proyecto_Final_APF2.docx`). Cada escenario indica su evidencia:
**Auto** = prueba automatizada del repositorio, **Nav** = prueba manual en
Chrome, **API** = petición directa al backend con la sesión del usuario.

Entorno: backend `reservaya-backend` en `dev` (API en `localhost:3301`),
frontend `reservaya-frontend` en `dev` (`localhost:3000`), base PostgreSQL
local con datos de demostración del seed.

## Resumen

| HU | Puntos | Criterios CA1–CA2 | Escenarios 1–4 | Hallazgos |
|---|---|---|---|---|
| HU06 · Cancelación | 3 | Cumple | Cumple | Mensajes corregidos (#127) |
| HU07 · Modificación | 5 | Cumple | Cumple | Concurrencia probada (#129) |
| HU08 · Dashboard | 5 | Cumple | Cumple | Filtro por horario agregado (#128, #48) |

## HU06 · Cancelación de reservas

| Escenario APF | Evidencia | Resultado |
|---|---|---|
| 1. Cancelación exitosa | Nav: reserva de prueba confirmada, confirmación en el diálogo, estado pasa a *Cancelada* y pierde sus botones | ✅ |
| 2. Reserva inexistente | API: `PATCH /reservations/0/cancel` → 404 "La reserva no existe" | ✅ |
| 3. Reserva de otro usuario | API: cancelar y modificar una reserva de `usuario2` → 403 "No autorizado" | ✅ |
| 4. Reserva ya cancelada | API: cancelar una reserva cancelada → 422 "La reserva ya está cancelada" | ✅ |
| CA1. Libera el espacio | Nav: tras cancelar, Cabina Individual 1 el 5 de noviembre vuelve a 07:00–21:00 disponible | ✅ |
| CA2. No cancelar reservas ajenas | API: 403 (ver escenario 3) | ✅ |
| Reserva ya iniciada | Nav/API: una reserva que ya comenzó no muestra botones; cancelar responde 422 | ✅ |

Pruebas automatizadas relacionadas: `spec/requests/reservations_spec.rb`
(PATCH cancel: éxito, 404, 403, 422) y `spec/models/reservation_spec.rb`
(`cancel`, `started?`). Mensajes corregidos en #127 (PR #130).

## HU07 · Modificación de reservas

| Escenario APF | Evidencia | Resultado |
|---|---|---|
| 1. Modificación exitosa | Nav: reserva movida de 14:00–15:00 a 14:30–15:30 en el mismo espacio | ✅ |
| 1b. Cambio de espacio | Nav: reserva de Cabina Individual 1 cambiada a Cabina Individual 2 (6 nov, 14:00–15:00), confirmada | ✅ |
| 2. Nuevo horario ocupado | Nav: intento de mover a un horario con otra reserva propia → "No puede tener reservas cruzadas en el mismo horario"; la reserva original no cambia | ✅ |
| 3. Reserva de otro usuario | API: `PATCH /reservations/44` de `usuario2` → 403 | ✅ |
| 4. Datos inválidos | Nav: hora de fin anterior al inicio y cupos sobre la capacidad → errores en el formulario; *Guardar cambios* deshabilitado | ✅ |
| CA1. Se actualiza solo si el horario está libre | Auto: `reservation_booking_spec.rb` (conflicto, espacio distinto, rollback) | ✅ |
| CA2. Si no hay disponibilidad, la original queda igual | Nav/Auto: la reserva original mantiene su horario tras el conflicto | ✅ |
| T07. Excluir la reserva original de la validación | Nav: mover 14:00–15:00 a 14:30–15:30 (solapa solo con sí misma) → se guarda | ✅ |

**RNF05 · Concurrencia.** `spec/services/reservation_booking_concurrency_spec.rb`
ejecuta dos reservas simultáneas del mismo horario con conexiones reales de
PostgreSQL: solo una se confirma. Estable en 5 de 5 ejecuciones. Sin
`lock!` en `ReservationBooking`, la prueba falla en 3 de 3 (ver #129, PR #132).

## HU08 · Dashboard de ocupación

| Escenario APF | Evidencia | Resultado |
|---|---|---|
| 1. Visualización por periodo | Nav: noviembre con resumen, mapa de calor, tabla y promedio diario | ✅ |
| 2. Periodo sin reservas | Nav: enero 2026 → ceros y los espacios listados, sin error | ✅ |
| 3. Filtro por espacio | Nav: `spaceId=4` → una fila; la URL conserva el filtro | ✅ |
| 4. Datos actualizados | Nav/API: al cancelar la reserva 1 → 0 al recargar; reserva creada aparece en el conteo | ✅ |
| CA1. Por espacio, horario y día | Nav: mapa de calor por hora, tabla por espacio, promedio por día | ✅ |
| CA2. Consistencia con las reservas | API vs cálculo independiente en la base (Cabina Individual 1, noviembre): tasa 0.0048, 2 reservas, 2 h usadas sobre 420 h disponibles. Hora 12: 0.0167 (coincide) | ✅ |
| Filtro por horario (APF, resumen de HU08) | Nav/API: `fromHour=9&toHour=12` → solo horas 09–12; rango invertido → mensaje y sin consulta | ✅ (#128, #48) |
| Alta demanda (≥ 75 %) | Nav: Cabina Individual 2 el 7 de noviembre, 100 %, clasificación *Alta demanda*, indicador en 1 | ✅ |
| Solo administradores (T12) | API: usuario normal → 403. Nav: `/occupancy` redirige a Inicio | ✅ |
| Responsive (RNF03) | Nav: iframe de 390 px, sin scroll horizontal de página | ✅ (no es teléfono real) |

Pruebas automatizadas: `spec/services/occupancy_report_spec.rb`,
`spec/requests/dashboard_spec.rb`, `spec/requests/api/dashboard_swagger_spec.rb`,
y el script de auditoría `db/sql/audit/09_occupancy_by_hour.sql` (validado con un caso
conocido en una transacción que se revierte).

## Hallazgos y correcciones del Sprint 3

| Hallazgo | Corrección | Issue / PR |
|---|---|---|
| Mensajes de cancelación distintos del APF | Textos alineados con los escenarios 2 y 4 | #127 · backend #130 |
| Falta el filtro por horario que pide el APF | `from_hour` y `to_hour` en la API y selectores en la UI | #128 · backend #131 · #48 · frontend #50 |
| Sin prueba de concurrencia real (RNF05) | Prueba con hilos y PostgreSQL | #129 · backend #132 |
| Sin informe QA de Sprint 3 | Este documento | #49 |
| Dashboard `/dashboard` no respondía | Ruta y acción corregidas | `dev` (HU08) |
| Espacios inactivos en el reporte | Excluidos | `dev` (HU08) |
| Base de cola compartía migraciones (CI fallaba) | `migrations_paths: db/queue_migrate` | `dev` (HU08) |

## Pendiente de la verificación manual

- Probar en un teléfono real los flujos de HU06, HU07 y HU08. Se validó con
  ventanas de 390 px.
- Revisión de código por otro integrante antes de mergear los PRs de
  Sprint 3, según la plantilla de Definition of Done.
