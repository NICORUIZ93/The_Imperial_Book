# ADR-0002: Pasamos el cobro a una cola a 18 cobros/s porque el proveedor de pagos limita a 20 peticiones/s

- **Estado:** Aceptado (reemplaza la parte de cobro inmediato del ADR-0001)
- **Fecha:** 2026-11-20
- **Decisores:** equipo de reservas
- **Módulos o servicios afectados:** reservas (workflow y workers), gateway, interfaz de usuario

## Contexto

Restricción sobrevenida: el proveedor de pagos limita a **20 peticiones/s** por cliente y responde **429** con
`Retry-After: 1`. El test de carga con Gatling (60 reservas/s durante 20 s, 1352 reservas) sigue en verde para la API
(p99 de 10 ms, 0 % de errores), pero el resumen del sistema muestra **859 de 1352 reservas canceladas (63,5 %)** y
3027 respuestas 429 del proveedor. Con el pico de 5 s de `f185-restriccion-sobrevenida/antes.js` se pierden unas 180 de
300 ventas (60 %).

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. Cola de cobros a 18/s (cola «cobros» de Temporal con `maxTaskQueueActivitiesPerSecond: 18`) | absorbe el pico sin perder ventas; 0 respuestas 429; reintentos durables | la reserva queda «pago en proceso» hasta 11,6 s en p99 con un pico de 5 s | 1 worker más |
| B. Rate limiting en el gateway a 20 reservas/s | sencillo; ya existe el gateway | rechaza clientes en los picos: pierde las mismas ventas, solo que antes | ninguno |
| C. Contratar el plan superior del proveedor | sin cambios de código | coste mensual fijo; sube el límite pero no lo elimina | según contrato |

## Decisión

Opción A: el cobro sale de la ruta síncrona a la cola «cobros», despachada a 18 cobros/s (un 10 % por debajo del
límite, para dejar sitio a los reembolsos y a la deriva de reloj).

## Consecuencias

- **Positivas:** 300 de 300 reservas confirmadas en el pico de 5 s, 0 respuestas 429, como mucho 18 cobros en un segundo.
- **Negativas (trade-off aceptado):** la interfaz muestra «Pago en proceso»; un pico largo hace crecer la cola
  (1352 reservas en 25 s tardan unos 75 s en cobrarse).
- **Riesgos y mitigación:** cola creciente si el pico dura mucho → alerta por profundidad de cola; el `scheduleToCloseTimeout`
  de 10 minutos cancela y compensa una reserva que no se pudo cobrar.

## Fitness function

`node --test f186-adr/fitness.test.js` en CI: con el proveedor limitado, 0 respuestas 429, 0 reservas canceladas y p99
desde la reserva hasta el cobro por debajo de 60 s. En producción: alerta si la cola de cobros supera 2000 tareas o si el
p99 hasta el cobro supera 60 s.

## Cuándo revisar esta decisión

Si el proveedor sube el límite por encima del pico medido, si el negocio exige confirmación de pago inmediata o si la
cola supera 2000 tareas más de una vez al mes.
