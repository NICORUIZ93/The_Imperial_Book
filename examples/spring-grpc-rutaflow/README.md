# Spring gRPC · RutaFlow

Servicio de tarifas con Spring Boot 4.1.2, generación Java desde `tarifa.proto`
y un test que hace una llamada por un canal gRPC sobre puerto TCP local. No usa
un benchmark: confirma contrato, generación, registro del servidor y respuesta
de cliente en una red local.

## Ejecutar

```bash
./mvnw -q clean test
```

El plugin Protobuf genera mensajes y stub desde `src/main/proto/tarifa.proto`.
El test selecciona un puerto local disponible, levanta el servidor Spring gRPC
y llama al stub cliente; 10 km deben devolver `monto=15000`.

## Revisar el contrato

`distancia_km = 1` y `monto = 1` son tags del formato binario. Si eliminas un
campo de una versión publicada, conserva su tag y nombre como `reserved`; no
reasignes el mismo tag a un dato con otro significado. Un cliente antiguo puede
decodificar el número sin saber que ahora representa otra unidad.

## Qué demuestra y qué no

La prueba usa un proceso de prueba con servidor real en socket y cliente gRPC;
no mide latencia comparada con REST/JSON, no prueba varias réplicas, seguridad,
TLS ni compatibilidad entre versiones del esquema. Mide el comportamiento del
servicio local y valida que el cliente generado completa una llamada gRPC.

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
