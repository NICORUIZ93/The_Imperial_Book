# Kafka para asignación

## Contexto

La API no debe esperar a la asignación; el equipo necesita retención y replay por consumidor.

## Decisión

Proponer Kafka para publicar solicitudes de asignación.

## Alternativas

- **HTTP directo:** sencillo, pero acopla disponibilidad y tiempo de respuesta.
- **Cola RabbitMQ:** apropiada para trabajo pendiente; evaluar replay requerido.

## Consecuencias

Retención y grupos independientes a cambio de operar broker, offsets, contratos e idempotencia.

## Estado

Propuesta didáctica; requiere decisión del equipo antes de aplicarse.
