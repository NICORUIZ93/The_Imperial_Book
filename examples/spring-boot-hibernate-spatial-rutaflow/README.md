# JTS, Hibernate Spatial y bloqueo optimista

Ejemplo Spring Boot 4.1.2 con Java 25. Persiste un `Point` JTS en MySQL 8.0.36 y muestra cómo `@Version` detecta una actualización basada en una lectura obsoleta.

## Ejecutar

Requiere Docker o Podman Machine con la imagen MySQL disponible. Desde esta carpeta:

```bash
./mvnw -q test
```

En macOS con Podman Machine:

```bash
DOCKER_HOST="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_RYUK_DISABLED=true ./mvnw -q test
```

Las dos pruebas comprueban el ida y vuelta de coordenadas/SRID y un conflicto real entre dos copias del mismo registro. `create-drop` solo configura el esquema del laboratorio; un sistema real necesita migraciones y reglas de recuperación para el conflicto.

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
