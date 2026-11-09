# Event Sourcing con replay en Spring Boot

El `OrderEventStore` conserva un stream local de hechos inmutables. El estado
actual no se guarda aparte: `OrderState.replay` lo reconstruye desde el
principio y rechaza una transición inválida. El test inicia Spring Boot, añade
tres eventos al stream, vuelve a leerlos y comprueba estado, historial y motivo
de cancelación.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw -q test
```

## Archivos

- `src/main/java/academia/rutaflow/eventsourcing/OrderEvent.java`: hechos
  inmutables del pedido.
- `OrderEventStore.java`: stream append-only en memoria; valida antes de añadir.
- `OrderState.java`: estado derivado y reglas de transición.
- `src/test/java/academia/rutaflow/eventsourcing/OrderReplayTest.java`: replay,
  orden inválido e historial vacío.

El stream desaparece al reiniciar el proceso. No es almacenamiento durable,
no coordina varias réplicas y no implementa snapshots, versionado de eventos ni
proyección a otras bases. En una aplicación real, guarda el stream en un
almacenamiento duradero y controla concurrencia/versiones al escribir. Reproducir
eventos tampoco debe volver a enviar efectos externos; esos efectos requieren
separación y controles propios.
