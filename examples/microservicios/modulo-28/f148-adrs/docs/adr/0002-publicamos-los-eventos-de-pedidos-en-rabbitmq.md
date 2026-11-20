# ADR-0002: Publicamos los eventos de pedidos en RabbitMQ

- **Estado:** Reemplazado por ADR-0003
- **Fecha:** 2026-11-05
- **Decisores:** equipo de la tienda
- **Módulos o servicios afectados:** pedidos, inventario, notificaciones

## Contexto

Pedidos debe avisar a inventario y a notificaciones sin llamarlos de forma síncrona. Carga esperada: 20 pedidos/s en
pico. Solo hay consumidores que procesan cada evento una vez.

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. RabbitMQ con colas de quórum | El equipo ya lo conoce (Módulo 22), confirmaciones y reintentos sencillos | No guarda el historial para releer eventos | 1 nodo pequeño |
| B. Kafka | Retención y relectura, mucho caudal | Más piezas que operar para 20 eventos/s | 3 brokers |

## Decisión

Usamos RabbitMQ: cubre el caudal con margen y el equipo lo opera desde el Módulo 22.

## Consecuencias

- **Positivas:** puesta en marcha en una semana.
- **Negativas (trade-off aceptado):** si un servicio nuevo necesita releer eventos pasados, no podrá.
- **Riesgos y mitigación:** pérdida de mensajes → publisher confirms y colas de quórum.

## Fitness function

Alerta si la cola `pedidos.creados` supera 1000 mensajes pendientes durante 10 minutos.

## Cuándo revisar esta decisión

Si aparece un consumidor que necesite reprocesar el historial de eventos.
