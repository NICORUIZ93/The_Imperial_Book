# Outbox para conservar la intención

## Contexto

Guardar el envío y publicar su evento son escrituras a sistemas distintos.

## Decisión

Guardar envío e intención en una transacción SQL y despachar con reintentos.

## Alternativas

- **Publicación directa:** deja ventana entre commit y envío.
- **Transacción distribuida:** añade coordinación y requisitos no aceptados aquí.

## Consecuencias

Recuperación de pendientes a cambio de dispatcher, limpieza y deduplicación; puede duplicar eventos.

## Estado

Propuesta didáctica; requiere decisión del equipo antes de aplicarse.
