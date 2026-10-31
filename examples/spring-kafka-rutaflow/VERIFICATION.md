# Verificación del laboratorio — 2026-10-30

Desde `examples/spring-kafka-rutaflow/`: `mvn -B verify` terminó con código 0.
Se compilaron las fuentes y se generó el JAR ejecutable. Siete pruebas pasaron, sin fallos,
errores ni omisiones, con Kafka embebido y H2 en modo PostgreSQL:

- Rollback conjunto de envío y outbox.
- Publicación con key de agregado y consumo confirmado de una segunda copia sin repetir efecto.
- Rollback de inbox cuando falla la proyección y procesamiento posterior del mismo ID.
- Reintento de un fallo transitorio del consumidor.
- Recuperación de evento inválido en DLT.
- Conservación exacta de bytes de JSON malformado en DLT.
- Publicación fallida simulada, liberación del lease y recuperación del outbox.

La prueba de JSON malformado falló antes de corregir el serializador: esperaba 12 bytes y
recibía 18 por conversión JSON/base64. `EventOrBytesSerializer` conserva `byte[]` y delega
los objetos al serializador JSON. El recuperador propaga fallos de envío a DLT.
La prueba de deduplicación ahora espera el resultado de la segunda llamada al consumidor;
los conteos por sí solos podían pasar antes de que esa llamada ocurriera.

## Límites de esta evidencia

Ejecución local con JDK 27.0.1.0.3 (Homebrew), Maven 3.10.0, destino Java 25, Spring Boot 4.1.1. Docker no tenía daemon disponible:
no se ejecutó Compose, PostgreSQL real ni la secuencia HTTP manual. La simulación del fallo de
publicación no demuestra comportamiento ante una interrupción real de red. No se probaron
varios dispatchers, renovación del lease, pérdida de nodos ni operación de replay de DLT.
No se ejecutaron pruebas de navegador ni revisión pedagógica humana. No se leyeron nuevos
libros del disco externo durante este incremento.

Fuentes: [manejo de errores de Spring Kafka](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html)
y fuentes/test del propio laboratorio. Los siete casos se encuentran en
`src/test/java/com/academia/rutaflow/KafkaFlowIntegrationTest.java`.
