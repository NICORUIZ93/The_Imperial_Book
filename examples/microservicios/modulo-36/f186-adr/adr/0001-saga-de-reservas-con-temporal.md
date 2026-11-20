# ADR-0001: Orquestamos la saga de reservas con Temporal

- **Estado:** Aceptado
- **Fecha:** 2026-11-20
- **Decisores:** equipo de reservas (proyecto final del Módulo 32)
- **Módulos o servicios afectados:** reservas, inventario, pagos (proveedor externo)

## Contexto

Una reserva toca tres sitios que no comparten base de datos: el inventario de plazas, el proveedor de pagos externo
(no es nuestro: solo ofrece HTTP con `Idempotency-Key`) y el registro de la reserva. Si el cobro sale bien y la
confirmación falla, hay que reembolsar y liberar la plaza. Objetivo: 0 reservas cobradas sin plaza y 0 plazas
bloqueadas sin cobro, con picos de 60 reservas/s.

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. Saga orquestada con Temporal (workflow + actividades idempotentes) | estado durable: retoma tras una caída; reintentos y timeouts declarativos; historial visible en la UI | un componente más que operar (o Temporal Cloud); el workflow debe ser determinista | 1 clúster Temporal o Temporal Cloud |
| B. Saga coreografiada con eventos (RabbitMQ/Kafka) | sin orquestador central | el flujo queda repartido en 3 servicios; difícil saber en qué paso va una reserva | ninguno extra si ya hay broker |
| C. Transacción distribuida (2PC/XA) | atomicidad «de libro» | el proveedor externo no participa en 2PC; bloqueos (Módulo 25) | no aplicable |

## Decisión

Opción A: la saga vive en `reservaWorkflow` (f182-saga-temporal/workflows.js) y cada paso es una actividad idempotente
con su compensación.

## Consecuencias

- **Positivas:** una reserva nunca queda a medias; los fallos del proveedor se reintentan con backoff.
- **Negativas (trade-off aceptado):** operar Temporal; aprender sus reglas de determinismo.
- **Riesgos y mitigación:** código no determinista en el workflow → `bundle.test.js` en CI (el empaquetador lo rechaza).

## Fitness function

`node --test f182-saga-temporal/saga.test.js f182-saga-temporal/bundle.test.js` en cada PR: las compensaciones se
ejecutan en orden inverso y el workflow pasa el empaquetador de Temporal.

## Cuándo revisar esta decisión

Si el flujo se reduce a un solo paso remoto (no hay nada que compensar) o si el equipo no puede operar Temporal.
