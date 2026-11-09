# Consultas espaciales MySQL: RutaFlow

Laboratorio JDBC pequeño para practicar SRID 4326, distancia esférica y planes de índice usando MySQL real con Testcontainers.

## Requisitos

- JDK 25
- Docker, o Podman Machine en macOS
- Internet la primera vez para descargar Maven, dependencias e imagen MySQL 8.0.36

## Ejecutar pruebas

Con Docker iniciado:

```bash
./mvnw -q test
```

Con Podman Machine en macOS:

```bash
DOCKER_HOST="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_RYUK_DISABLED=true ./mvnw -q test
```

Las tres pruebas crean una tabla `POINT NOT NULL SRID 4326` con índice espacial. Comprueban distancia Bogotá–Medellín, el `key` mostrado por `EXPLAIN FORCE INDEX`, y el orden de ejes predeterminado de SRID 4326. La ruta de prueba en macOS desactiva Ryuk porque Podman Machine no puede montar dentro del contenedor su socket Unix del host; el test detiene el contenedor MySQL al terminar.

La consulta de distancia usa `axis-order=long-lat` de forma explícita porque las coordenadas de entrada están en longitud-latitud, mientras que SRID 4326 define latitud-longitud como orden predeterminado. `FORCE INDEX` hace reproducible la demostración del índice; no es una recomendación de producción.
