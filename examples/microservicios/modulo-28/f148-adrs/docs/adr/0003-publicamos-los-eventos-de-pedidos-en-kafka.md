# ADR-0003: Publicamos los eventos de pedidos en Kafka

- **Estado:** Aceptado
- **Fecha:** 2026-11-18
- **Decisores:** equipo de la tienda y equipo de analítica
- **Reemplaza a:** ADR-0002
- **Módulos o servicios afectados:** pedidos, inventario, notificaciones, analítica

## Contexto

Se cumplió la condición de revisión del ADR-0002: analítica necesita reprocesar 90 días de pedidos para recalcular
sus modelos, y RabbitMQ borra cada mensaje al confirmarlo. La carga sigue siendo de 20 pedidos/s en pico.

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. Kafka con retención de 90 días | Relectura por offset, varios grupos de consumidores | Operar un clúster de 3 brokers | 3 brokers pequeños |
| B. Seguir con RabbitMQ y copiar a un almacén para analítica | Sin cambios para los servicios actuales | Dos fuentes de verdad, retraso en analítica | Un job ETL |
| C. RabbitMQ Streams | Mismo producto que ya operamos, admite relectura | Menos ecosistema de conectores que Kafka | Igual que hoy |

## Decisión

Usamos Kafka con retención de 90 días para `pedidos.v1`, porque analítica necesita relectura y los conectores
de Kafka Connect que ya usa.

## Consecuencias

- **Positivas:** cualquier servicio nuevo puede leer desde el principio del tema.
- **Negativas (trade-off aceptado):** más operación y la migración de los dos consumidores actuales.
- **Riesgos y mitigación:** duplicados al migrar → consumidores idempotentes (Módulo 25).

## Fitness function

Alerta si el *lag* del grupo `inventario` supera 10 000 mensajes durante 10 minutos.

## Cuándo revisar esta decisión

Si el coste del clúster supera el 15 % del presupuesto de infraestructura de la tienda.
