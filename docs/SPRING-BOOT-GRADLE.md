# Spring Boot con Gradle: mismos laboratorios, otra herramienta de build

Java 25 y Gradle Wrapper 9.8.2. Cada laboratorio del inventario
`spring-gradle-labs.json` incluye `build.gradle`, `settings.gradle`, `gradlew`,
`gradlew.bat` y `gradle/wrapper/`. Conserva todos esos archivos al copiarlo.
Las fuentes Java y tests son compartidos con Maven; sus salidas quedan separadas.
El wrapper fija distribución y checksum oficial; no necesitas Gradle global.

## Primera ejecución

Desde la raíz del repositorio:

```bash
cd examples/spring-fundamentos-rutaflow
./gradlew --version
./gradlew clean classes test
```

En PowerShell sustituye `./gradlew` por `.\gradlew.bat`. La versión debe ser
9.8.2 y la JVM, 25. Las cinco pruebas del laboratorio confirman inyección,
scopes, endpoints y perfiles. Los resultados están en `build/reports/tests/test/`
y `build/test-results/test/`; `BUILD SUCCESSFUL` sin tests solo prueba compilación.

Ejecuta el servidor y consulta desde otra terminal:

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

```bash
curl http://localhost:8080/perfil
```

Espera `banner=Desarrollo; entorno=compartido`. Detén el servidor con Ctrl+C.
Como fallo deliberado, escribe `--spring.profiles.active=deev`; la respuesta
volverá a `banner=Base; entorno=compartido`. Restaura el perfil y explica qué
archivo causó el cambio. No necesitas cambiar las clases Java por usar Gradle.

## Cómo seguir las prácticas del curso

El texto original conserva Maven. Si eliges Gradle, usa la misma carpeta y los
mismos archivos Java, SQL, YAML y tests con esta correspondencia:

| Maven de la lección | Gradle del laboratorio |
|---|---|
| `./mvnw clean test` | `./gradlew clean classes test` |
| `./mvnw -Dtest=JwtServiceTest test` | `./gradlew test --tests '*JwtServiceTest'` |
| `./mvnw -Dtest=Clase#metodo test` | `./gradlew test --tests '*Clase.metodo'` |
| `./mvnw spring-boot:run` | `./gradlew bootRun` |
| `-Dspring-boot.run.arguments=--spring.profiles.active=dev` | `bootRun --args='--spring.profiles.active=dev'` |
| `./mvnw -DskipTests package` | `./gradlew classes bootJar` en aplicaciones Boot |
| `./mvnw dependency:tree` | `./gradlew dependencies --configuration runtimeClasspath` |
| `target/` | normalmente `build/` |

En cada tema abre `build.gradle` antes de agregar una dependencia. `implementation`
corresponde a las bibliotecas principales; `testImplementation`, a las de prueba;
`runtimeOnly`, a las necesarias al ejecutar; `annotationProcessor`, al código
que genera Lombok/MapStruct. Los BOM usan `platform(...)`: declarar un BOM no
agrega todas sus bibliotecas. Mantén las coordenadas y versiones del laboratorio;
no pegues un bloque XML dentro del DSL Groovy.

Lombok y MapStruct se ejecutan como procesadores y escriben bajo
`build/generated/sources/annotationProcessor/`. El flag `-parameters` conserva los
nombres que Spring necesita. Las bibliotecas de test usan JUnit Platform con un
launcher explícito. Las llamadas externas y requisitos Docker/Podman de las
lecciones siguen siendo los mismos.

## Infraestructura de las pruebas

Con Docker activo normalmente basta el comando Gradle. En macOS con Podman:

```bash
export DOCKER_HOST="unix://$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')"
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
export TESTCONTAINERS_RYUK_DISABLED=true
./gradlew clean classes test
```

Si desactivas Ryuk y cortas una ejecución, revisa sus contenedores efímeros;
no borres servicios ajenos. Para Redis, arranca el servidor como en M20 y usa:

```bash
REDIS_PORT=16379 ./gradlew test -PredisIntegration --tests '*RedisTarifaTest'
```

Sin esa propiedad la prueba Redis queda omitida. El runner
`python3 scripts/verify_spring_gradle.py` registra cada salida, cantidad de tests,
fallos y omisiones; no sustituye los escenarios con broker, navegador o clúster.

## Casos que requieren tareas especiales

- **Contratos:** desde `examples/spring-cloud-contract-rutaflow`, ejecuta
  `./gradlew clean verifyContracts`. El productor genera su prueba y el JAR
  `stubs`; el consumidor debe usar ese artefacto desde el repositorio aislado
  `build/stub-repository/`, no aceptar uno antiguo de `~/.m2`.
- **gRPC:** `./gradlew clean classes test` genera Java y el stub desde
  `src/main/proto`. Los binarios de protoc y gRPC tienen versiones fijadas.
- **Avro:** el laboratorio usa schemas `.avsc` leídos en runtime y GenericRecord;
  no necesita generar una clase Java Avro. El repositorio Confluent está declarado.
- **AOT:** `./gradlew clean processAot bootJar` genera metadata y empaqueta la
  aplicación AOT para JVM. Sigue la comprobación específica de AOT indicada en
  el informe. Esto no equivale a ejecutar `native-image` ni medir un binario nativo.
- **Capas:** `./gradlew bootJar` crea el JAR. Las instrucciones `java -Djarmode=tools`
  de M11 se aplican al JAR bajo `build/libs/`; los scripts Maven antiguos siguen
  escribiendo en `target/`.
- **Modulith:** `Documenter` conserva su directorio de documentación
  `target/spring-modulith-docs/`; el informe JUnit de Gradle queda en `build/`.

No traduzcas literalmente plugins Maven a una línea de dependencias Gradle.
La matriz de ejecución es `spring-gradle-verification.json`; consulta sus límites
antes de marcar una práctica como comprobada.

## Referencias primarias

[Plugin Boot](https://docs.spring.io/spring-boot/gradle-plugin/getting-started.html),
[AOT Gradle](https://docs.spring.io/spring-boot/gradle-plugin/aot.html),
[Gradle y Java](https://docs.gradle.org/current/userguide/compatibility.html),
[Spring Cloud Contract Gradle](https://docs.spring.io/spring-cloud-contract/reference/gradle-project.html),
[generación Protobuf](https://github.com/google/protobuf-gradle-plugin).
