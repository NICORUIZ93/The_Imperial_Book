# Un PostgreSQL Testcontainers compartido entre clases

Java 25 y Testcontainers 2.0.5 arrancan un PostgreSQL en el bloque estático de
`SharedPostgres`. Dos clases de prueba heredan la misma referencia, ejecutan
`SELECT 1` y guardan el ID real del contenedor. Al terminar la segunda clase,
`@AfterAll` comprueba que ambas observaron el mismo ID.

## Ejecutar

Con Docker compatible disponible:

```bash
./mvnw -q test
```

En macOS con Podman Machine:

```bash
DOCKER_HOST="unix://$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
TESTCONTAINERS_RYUK_DISABLED=true \
./mvnw -q test
```

Verifica en los dos logs el mismo prefijo de ID (`FirstRepositoryTest usa...` y
`SecondRepositoryTest usa...`); la aserción heredada compara ambos valores al
completar las clases. `junit-platform.properties` desactiva ejecución paralela.
No configures varios forks de Surefire: un fork distinto tendría otra JVM y
otro contenedor.

Para comparar el alcance, ejecuta `./mvnw -q -Dtest=FirstRepositoryTest test`
y luego `./mvnw -q -Dtest=SecondRepositoryTest test`: al ser ejecuciones
separadas, cada una crea un contenedor distinto. En una sola `./mvnw -q test`
las dos clases comparten el ID.

## Alcance y cuidado

- El singleton vive solo en la misma JVM/ejecución de pruebas. No es el modo de
  reutilización persistente `withReuse(true)` entre ejecuciones locales.
- Las dos pruebas hacen solo `SELECT 1`, así que no comparten modificaciones de
  datos. Si una clase inserta filas, limpia sus datos o usa esquemas aislados.
- El inicio estático de PostgreSQL cuesta tiempo y un error de inicio afecta a
  todas las clases herederas. Usa este patrón cuando el costo medido de crear
  contenedores por clase sea significativo; `@Container` estático sigue siendo
  una buena opción para compartir dentro de una sola clase.
- Testcontainers limpia el singleton al finalizar la JVM a través del
  mecanismo de limpieza configurado. Con Podman rootless se desactiva Ryuk según
  la configuración indicada arriba.

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
