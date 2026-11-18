# Archivos y notificaciones tras commit: RutaFlow

Laboratorio local e independiente con Java 25, Spring Boot 4.1.2, Spring MVC,
H2 y seis pruebas. Ejecuta un `POST multipart/form-data` real con MockMvc; no
requiere Docker.

```bash
./mvnw -q test
```

El endpoint acepta PNG/JPEG que `ImageIO` puede leer, compara el formato real
con el MIME enviado por el cliente, limita bytes y dimensiones, guarda los bytes
en un almacén en memoria con una clave aleatoria, guarda metadatos en H2 y
produce un evento que un listener entrega al `PushGateway` solo después del
commit. Las pruebas también provocan un rollback y verifican que no quedan fila,
objeto ni notificación.

## Límites intencionales

- `InMemoryImageObjectStore`, H2 y `RecordingPushGateway` son adaptadores de
  demostración: los datos desaparecen al reiniciar. No se integra S3, FCM, APNs,
  escaneo antivirus ni CDN.
- `@TransactionalEventListener(AFTER_COMMIT)` evita avisar antes de confirmar la
  transacción, pero el evento no es durable. Si el proceso cae después del
  commit, puede perderse el push. En producción guarda un outbox en la misma
  transacción y procesa/reintenta con idempotencia (continúa en M13).
- Decodificar PNG/JPEG y rechazar MIME inconsistente son controles útiles, no
  una garantía de archivo seguro. Falta autorización real por envío, cuota por
  usuario, políticas de conservación, protección de descarga y revisión de
  amenazas. Mantén los objetos fuera del webroot, usa nombres generados y aplica
  defensa en profundidad antes de exponer archivos.

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
