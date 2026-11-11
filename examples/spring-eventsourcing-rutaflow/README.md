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

## Alternativa Gradle

Desde esta misma carpeta, con JDK 25:

```bash
./gradlew clean classes test
```

Usa las mismas fuentes y pruebas del laboratorio. Consulta la [guía del curso](../../docs/SPRING-BOOT-GRADLE.md)
para perfiles, filtros de tests, procesadores y tareas especiales. Los resultados
JUnit de Gradle están en `build/test-results/`; una compilación sin tests no
acredita el escenario de integración. Los scripts que llaman a `mvnw` siguen
usando Maven y su carpeta `target/`.
