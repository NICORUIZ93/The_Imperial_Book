# Pendiente de verificar en el Mac del dueño (specs/018)

Una línea por bloque que no se pudo ejecutar en este entorno, con archivo:línea.

- docs/microservicios/08-herramientas-y-versiones.md:131 — `clinic` 13.0.0 (última publicación 2023-06-28): se instala y responde `clinic --version` → `v13.0.0` en Node 22.23.5 (comprobado aquí el 2026-11-19); falta probar `clinic doctor` con Node 26.13.1.

## Fase 0 · Módulos 0.1–0.5 (modulo-0 … modulo-4, fichas F001–F016)

Todo el código Java se ejecutó aquí con JDK 25.0.5 y todos los laboratorios pasaron (`verificar.sh` de modulo-0 a modulo-4) con **Node 22.23.5**: este entorno no permite instalar Node 26. Falta repetirlos con Node 26.13.1.

- examples/microservicios/modulo-0/verificar.sh:1 — repetir con Node 26.13.1 (8 tests pasaron con Node 22.23.5).
- examples/microservicios/modulo-1/verificar.sh:1 — repetir con Node 26.13.1 (11 tests pasaron con Node 22.23.5).
- examples/microservicios/modulo-2/verificar.sh:1 — repetir con Node 26.13.1 (Node 10 tests y Java 9 comprobaciones pasaron con Node 22.23.5 y JDK 25.0.5).
- examples/microservicios/modulo-3/verificar.sh:1 — repetir con Node 26.13.1 y Git del Mac (pasó con Node 22.23.5, Git 2.43.0, bash 5.2.21).
- examples/microservicios/modulo-4/verificar.sh:1 — ejecutar `./verificar.sh --compose`: aquí no hay acceso a Docker Hub, así que no se construyeron `java/Dockerfile` (eclipse-temurin:25-jdk) ni `node/Dockerfile` (node:26-alpine) ni se levantó `docker-compose.yml` (solo se validó con `docker compose config -q`). Las etiquetas existen en Docker Hub (API v2, consultada el 2026-11-19). La parte de Docker básico (ubuntu:24.04) sí pasó.
- web/public/content/microservices/modulo-4.md:697 — `FROM eclipse-temurin:25-jdk`: construir y comprobar `curl localhost:8080/hola` → `Hola Mundo desde Java`.
- web/public/content/microservices/modulo-4.md:711 — `FROM node:26-alpine`: construir y comprobar `curl localhost:3000/hola` → `Hola Mundo desde Node.js` (y que `docker compose down` detiene hola-node con código 0 gracias al manejador de SIGTERM).
- web/public/content/microservices/modulo-4.md:763 — salida de `docker compose ps` en el paso 3 del laboratorio de Docker básico (descrita, no pegada).
- web/public/content/microservices/modulo-4.md:774 — en el Mac `ubuntu:24.04` recién descargada mostrará el número de parche (p. ej. `Ubuntu 24.04.3 LTS`); la imagen local de este entorno dice `Ubuntu 24.04 LTS`. `verificar.sh` ya compara solo `Ubuntu 24.04`.
- web/public/content/microservices/modulo-4.md:473 — `node hola.js` debe imprimir `Hola Mundo desde Node.js 26` (aquí, con Node 22, imprime 22).
- web/public/content/microservices/modulo-4.md:86 — instalación del JDK: comprobar el instalador de Temurin 25 en adoptium.net, el identificador `25.0.x-tem` de `sdk list java` (línea 88) y que `apt install openjdk-25-jdk` existe en Ubuntu (línea 89; en Ubuntu 24.04 de este entorno está disponible).
- web/public/content/microservices/modulo-4.md:356 — instalación de Node: `nvm install 26` y `nvm use 26` en el Mac.
- web/public/content/microservices/modulo-3.md:926 — texto exacto del error de `JSON.parse` con Node 26 (aquí, V8 de Node 22: `Expected property name or '}' in JSON at position 1 (line 1 column 2)`).
- web/public/content/microservices/modulo-3.md:1471 — texto exacto de `node --env-file=.env` sin archivo en Node 26 (aquí: `node: .env: not found`, código 9).
- web/public/content/microservices/modulo-3.md:442 — mensaje de zsh en macOS para un guion sin permiso de ejecución (`zsh: permission denied: ./contar-errores.sh`); aquí no hay zsh, se pegó la salida de bash.
- web/public/content/microservices/modulo-0.md:456 — en macOS, `EADDRINUSE` puede mostrar `:::3000` en lugar de `0.0.0.0:3000`.
- web/public/content/microservices/modulo-0.md:494 — salida de `lsof -i :3000` en macOS (descrita, no pegada).
- web/public/content/microservices/modulo-0.md:786 — nota sobre Windows PowerShell 5.1 (`curl` como alias y comillas internas): no hay Windows en este entorno.
- web/public/content/microservices/modulo-2.md:357 — `chcp 65001` en Windows para ver tildes en la salida de Java: no hay Windows en este entorno (la reproducción con `LANG=POSIX` y el arreglo `-Dstdout.encoding=UTF-8` sí se ejecutaron).
- docs/microservicios/08-herramientas-y-versiones.md:49 — este entorno trae Docker Compose v5.7.1; la checklist dice v5.6.1. Los laboratorios piden «v5.6.1 o posterior».

## Fase 1 · Módulos 1 y 2 (modulo-5 y modulo-6, fichas F017–F031)

Maven Central está bloqueado aquí: ningún proyecto con Spring Boot se pudo compilar. Se ejecutó todo lo que no depende de Spring (F017 y F018 completos con JDK 25.0.5 y JUnit 5.10 de Ubuntu, el SQL de F030 y F031 en PostgreSQL 16 y MySQL 8.0.46, los errores de `javac`, de la JVM y de Maven pegados en las fichas) y se validaron los `docker-compose.yml` con `docker compose config -q`. Versiones alineadas con docs/microservicios/08-herramientas-y-versiones.md (Spring Boot 4.1.3; si el repositorio aún no la tiene, 4.1.2).

- web/public/content/microservices/modulo-5.md:416 — F017: `../mvnw test` con Maven Central (Spring Boot 4.1.3 como parent, JUnit Jupiter 6.0.3) → `Tests run: 6`. Aquí los 6 tests pasaron con JDK 25.0.5 y JUnit 5.10 de Ubuntu (consola standalone); el `main` y los dos errores se ejecutaron y se pegó la salida real.
- web/public/content/microservices/modulo-5.md:769 — F018: `../mvnw test` → `Tests run: 4` con Maven. Aquí pasaron los 4 con JDK 25.0.5 + JUnit 5.10; la salida del `main` y el `OutOfMemoryError: unable to create native thread` (`ulimit -u 2000`) son reales.
- web/public/content/microservices/modulo-5.md:1156 — F019: compilar con Spring Boot 4.1.3 (Maven Central bloqueado aquí), comprobar las 11 líneas del output esperado (orden del ciclo de vida, `Beans propios: [...]`) y que no aparezcan WARN; `CicloDeVidaTest` → `Tests run: 1`.
- web/public/content/microservices/modulo-5.md:1261 — F019: texto exacto del FailureAnalyzer con dos `Notificador` (rutas `defined in file [...]` y la línea `Action`), y el de «required a bean of type 'academia.ioc.Notificador' that could not be found» de la pregunta de comprobación.
- web/public/content/microservices/modulo-5.md:1628 — F020: fragmento exacto del Conditions Evaluation Report para `SaludoAutoConfiguration` (y si la `Condition` propia aparece en Negative matches); `NoSuchBeanDefinitionException` con `--saludo.habilitado=false`; `SaludoAutoConfigurationTest` → `Tests run: 6`.
- web/public/content/microservices/modulo-5.md:2061 — F021: `../mvnw package` con Boot 4.1.3 (aquí solo se capturó el reactor y el error de ciclo con Maven 3.9.11 y POMs sin Spring); `curl .../descuentos?total=250000 | jq .descuento` → `25000`; `-pl tienda-api -am test` ejecuta 4 tests; probar el wrapper con Maven 3.10.1.
- web/public/content/microservices/modulo-5.md:2443 — F022: las cuatro salidas del laboratorio (sin perfil, prod con TIENDA_BD_URL, precedencia variable/argumento) y `PerfilesTest` → `Tests run: 5`.
- web/public/content/microservices/modulo-5.md:2568 — F022: formato exacto del fallo de validación (nombre `tienda.bd-url` frente a `tienda.bdUrl`, `Origin ... 6:11`, texto de `Reason` en el idioma del Mac).
- web/public/content/microservices/modulo-5.md:2899 — F023: checkpoint y restore con `azul/zulu-openjdk:25-jdk-crac` en Docker Desktop (capacidades CHECKPOINT_RESTORE y SYS_PTRACE suficientes o hace falta `privileged`), archivos `*.img`, línea `Restored CracApp in ...` y `/hola` con `"aperturas": 1`; `CicloCheckpointTest` → `Tests run: 1`. El error `Unrecognized VM option 'CRaCCheckpointTo=...'` sí es real (OpenJDK 25.0.5).
- web/public/content/microservices/modulo-5.md:3290 — F024: build nativo en `ghcr.io/graalvm/native-image-community:25` (que el wrapper descargue Maven dentro del contenedor: necesita `curl` en la imagen), `file` del binario, `Started NativoApp in 0.0…`, `/impuesto` → 19000; `NativoTest` → `Tests run: 2`.
- web/public/content/microservices/modulo-5.md:3382 — F024: mensaje exacto del binario sin `@ImportRuntimeHints` (`ClassNotFoundException` o `MissingReflectionRegistrationError` según los valores por defecto de GraalVM 25).
- examples/microservicios/modulo-5/verificar.sh:1 — `./verificar.sh` y `./verificar.sh --docker` completos en el Mac (JDK 25.0.5, Maven 3.10.1 por el wrapper, Docker Compose v5).
- web/public/content/microservices/modulo-6.md:344 — F025: salidas de `curl` (201 + Location, cuerpo con `jq -cS`, 400/404/415) y líneas WARN de `DefaultHandlerExceptionResolver`; `ProductoControllerTest` → `Tests run: 4`.
- web/public/content/microservices/modulo-6.md:454 — F025: texto exacto del WARN del 415 en Spring Framework 7.0.11.
- web/public/content/microservices/modulo-6.md:799 — F026: respuesta de `POST /clientes` con `jq -cS`, teléfono y 400 en camelCase; `ClienteJsonTest` → `Tests run: 3`. El error de `javac` con `com.fasterxml.jackson.databind` es real (javac 25).
- web/public/content/microservices/modulo-6.md:1249 — F027: cuerpo exacto del ProblemDetail 404 (que Spring 7 rellene `instance`), salida de errores por campo, 500 genérico; `ManejadorGlobalTest` → `Tests run: 3`.
- web/public/content/microservices/modulo-6.md:1368 — F027: texto exacto del error al extender `ResponseEntityExceptionHandler` y declarar otro handler de `MethodArgumentNotValidException`.
- web/public/content/microservices/modulo-6.md:1908 — F028: SQL que imprime Hibernate 7.4.15 (insert/update/select con join) y la línea final; `PedidoJpaTest` → `Tests run: 4` contra `postgres:18.7`; `docker compose ps` con ambos servicios `healthy`.
- web/public/content/microservices/modulo-6.md:2016 — F028: texto exacto de `LazyInitializationException` en Hibernate 7.4.15.
- web/public/content/microservices/modulo-6.md:2431 — F029: forma del `where` generado y las cuatro líneas de salida (promedio `46500.0`); `ConsultasTest` → `Tests run: 4`.
- web/public/content/microservices/modulo-6.md:2533 — F029: tipo y texto exactos de la excepción con un atributo mal escrito (Hibernate 7.4.15, envuelta por Spring).
- web/public/content/microservices/modulo-6.md:2983 — F030: logs de Flyway 12.4.0 (migrado a versión 2 / esquema al día) y salida del runner; Liquibase 5.0.4 → `ChangeSet ... · EXECUTED`; tests 3 + 2. El SQL de V1 y V2 se ejecutó aquí en PostgreSQL 16 (incluido el rechazo del `CHECK`).
- web/public/content/microservices/modulo-6.md:3123 — F030: texto exacto de `FlywayValidateException` en Flyway 12.4.0 (los checksums del ejemplo son ilustrativos y el texto lo avisa).
- web/public/content/microservices/modulo-6.md:3565 — F031: salida con ambos perfiles (`version()` de las imágenes 18.7 y 9.7.4), consultas a mano con `docker compose exec`, y `PostgresTest` + `MysqlTest` → 6 tests; que `ddl-auto=validate` acepte el esquema de ambos motores. El SQL (migraciones, upserts, collation y errores de sintaxis cruzados) se ejecutó aquí en PostgreSQL 16 y MySQL 8.0.46.
- examples/microservicios/modulo-6/verificar.sh:1 — `./verificar.sh` completo en el Mac: `docker compose up -d --wait` con `postgres:18.7` y `mysql:9.7.4` (scripts de `initdb/` y healthchecks), 29 tests en las 8 carpetas, `docker compose down`.

## Fase 1 · Módulo 3 · Testing y calidad (modulo-7, fichas F032–F036)

Aquí no hay Maven Central ni Docker Hub: nada de Maven se compiló ni ejecutó. Todos los `pom.xml` usan Spring Boot **4.1.3** (si aún no está en Maven Central, bajar a 4.1.2 como dice 08-herramientas-y-versiones.md). Los POM se validaron como XML y `docker compose config -q` pasó. Los mensajes de error citados se tomaron del código fuente de cada herramienta (Mockito, Spring, Testcontainers, Pact JVM, ArchUnit) en GitHub; el SQL de F033 se ejecutó aquí en PostgreSQL 16.15 (falta 18.7).

- examples/microservicios/modulo-7/verificar.sh:1 — ejecutar completo (sin `--rapido`): tests de las 6 carpetas, Pact Broker (publish, verificación desde broker con publishResults, can-i-deploy) y SonarQube.
- web/public/content/microservices/modulo-7.md:552 — F032: confirmar `Tests run: 8` + `3` = 11 y el formato del fallo del paso 3 (línea 596).
- web/public/content/microservices/modulo-7.md:646 — F032: copiar la traza real del `@WebMvcTest` sin `@MockitoBean` (texto armado con los mensajes de Spring; la primera línea puede variar).
- web/public/content/microservices/modulo-7.md:1070 — F033: salida real de `docker ps` (imagen y etiqueta de Ryuk) y líneas `tc.postgres:18.7` del log.
- web/public/content/microservices/modulo-7.md:1093 — F033: confirmar el fallo con PostgreSQL 18.7 (mensaje comprobado aquí en 16.15) y el tipo de excepción (`BadSqlGrammarException`).
- examples/microservicios/modulo-7/f033-testcontainers/src/test/java/academia/contenedores/ContenedoresAppDeDesarrollo.java:1 — comprobar `../mvnw spring-boot:test-run` (puede necesitar `-Dspring-boot.test-run.main-class=academia.contenedores.ContenedoresAppDeDesarrollo`).
- web/public/content/microservices/modulo-7.md:1776 — F034: contenido real del pact V4 generado y que Pact JVM 4.7.7 (artefactos `junit5`) funciona sobre JUnit Platform 6.0.3 de Boot 4.1.3.
- web/public/content/microservices/modulo-7.md:1792 — F034: salida real del reportero de consola del proveedor.
- web/public/content/microservices/modulo-7.md:1812 — F034: salida de `pact:publish`, del proveedor con `@PactBroker` y de `pact:can-i-deploy` (texto del motivo del broker); captura del broker en :9292; imagen `pactfoundation/pact-broker:3.2.0-pactbroker2.124.0` con PostgreSQL 18.7 y su healthcheck con Ruby.
- web/public/content/microservices/modulo-7.md:1822 — F034: confirmar el mensaje al renombrar `precio` (texto de `Matching.kt`).
- web/public/content/microservices/modulo-7.md:2244 — F035: confirmar que `archunit-junit6` 1.5.1 descubre las 4 reglas con Surefire y pegar las líneas reales de la violación.
- web/public/content/microservices/modulo-7.md:2659 — F036: respuesta real de `/api/system/status`, `f036-sonarqube/sonar/analizar.sh` completo (cambio de clave, token, Quality Gate `OK` en el primer análisis, medidas) y el hotspot `java:S2068` del paso 4.
- examples/microservicios/modulo-7/f036-sonarqube/pom.xml:1 — confirmar JaCoCo 0.8.15 con JDK 25 y que sonar-maven-plugin 5.8.0.7211 descarga el motor de SonarQube 26.11.

## Fase 1 · Módulo 4 · Caching y rendimiento (modulo-8, fichas F037–F040)

Los simuladores de Python (`simuladores/*.py`, 9 tests) **se ejecutaron aquí** con Python 3.13.18 contra 4 `redis-server` 7.0.15 locales (sin persistencia, puertos 6379–6382) y sus salidas están pegadas en la lección. Falta todo lo de Maven y los contenedores `redis:8.10.2`/`postgres:18.7`.

- examples/microservicios/modulo-8/verificar.sh:1 — ejecutar completo (compose, 9 tests de Python, tests de Maven de F037–F040).
- web/public/content/microservices/modulo-8.md:621 — F037: tiempos reales de `curl` y la salida de `--scan`/`TTL`/`GET` (`\xac\xed\x00\x05`) con el Redis del compose.
- web/public/content/microservices/modulo-8.md:699 — F037: confirmar la cadena de causas al quitar `Serializable` (textos tomados del código de Spring Data Redis y Spring Framework).
- web/public/content/microservices/modulo-8.md:1430 — F038: pasos 2 y 3 con la app y `docker compose restart redis` (XLEN 0 comprobado aquí con un redis-server sin persistencia).
- web/public/content/microservices/modulo-8.md:1562 — F038: salida ilustrativa del error común (write-through dentro de `@Transactional`), no ejecutada.
- examples/microservicios/modulo-8/f039-redlock-fencing/src/test/java/academia/redlock/RedlockFencingTest.java:1 — F039: confirmar con Lettuce 7.5.2 que un nodo caído (puerto 6399) falla rápido con los timeouts de 100 ms y que la validez queda entre 800 y 988 ms.
- web/public/content/microservices/modulo-8.md:2921 — F040: valores impresos por `StampedeTest` y `Tests run: 22`; la afirmación sobre `@Cacheable(sync = true)` y `lockingRedisCacheWriter` se tomó del código de `DefaultRedisCacheWriter` (rama main) y conviene comprobarla en 4.1.3.

## Fase 1 · Módulos 5 y 6 (modulo-9 y modulo-10, fichas F041–F051)

Aquí no hay Maven Central (todo `./mvnw` queda pendiente) ni acceso a Docker Hub. Sí se ejecutó con **JDK 25.0.5**:
todo el Java puro (F041, dominio de F042, revisor de F044, `TablaDeRutas`/`CapaAnticorrupcion` de F045, criterios de
F051) con sus tests JUnit (JUnit Platform 1.9.1 local: 5 + 6 + 2 + 7 + 4 tests en verde), los servidores falsos de F045
y F047, los guiones SQL de F046 sobre **PostgreSQL 16.15** local (no 18.7), el driver JDBC 42.7.2 contra ese servidor,
`demo-binario.sh` de F048 con `protoc` 35.1 de grpcio-tools 1.84.1, y la validación del esquema y las 4 consultas de
F049 con `graphql` 16 (JavaScript). `docker compose config -q` pasa en ambos módulos. Versiones alineadas con la etiqueta v4.1.3 de spring-boot
(Spring Framework 7.0.11, Jackson 3.1.8, Spring AMQP/Kafka 4.1.3, kafka-clients 4.2.2, Spring gRPC 1.1.2, grpc-java 1.84.1,
protobuf-maven-plugin 5.1.12, Spring for GraphQL 2.0.7, graphql-java 25.1, JUnit Jupiter 6.0.3); Spring Modulith **2.1.3**
(construida sobre Boot 4.1.3, publicada en Maven Central) y Spring Cloud 2025.1.4 (acepta Boot 4.0.x y 4.1.x).

- examples/microservicios/modulo-9/verificar.sh:1 — ejecutar completo: `postgres:18.7` con `initdb/01-bd-por-servicio.sql` (healthcheck con `PGPASSWORD`), `./mvnw -q test` en F041–F046 (5 + 7 + 2 + 5 + 10 + 2 = 31 tests) y los tres guiones SQL.
- examples/microservicios/modulo-10/verificar.sh:1 — ejecutar completo: `rabbitmq:4.4.1-management` y `apache/kafka:4.4.0` healthy (healthchecks `rabbitmq-diagnostics -q ping` y `kafka-topics.sh --list`), `./mvnw -q test` en F047–F051 (3 + 4 + 4 + 3 + 6 = 20 tests) y `demo-binario.sh` con el `protoc` del Mac.
- web/public/content/microservices/modulo-9.md:1432 — F043: formato real de `ApplicationModule.toString(modules)` (nombre mostrado tras `# `, viñetas de dependencias y beans) y la línea de descripción que sigue a `Module 'inventario' depends on non-exposed type ...` en el paso 2.
- web/public/content/microservices/modulo-9.md:1438 — F043: que `InventarioTest` (modo STANDALONE con `Scenario.publish`) recibe el evento con `@ApplicationModuleListener` + `@EnableAsync` y H2 como gestor de transacciones.
- web/public/content/microservices/modulo-9.md:1895 — F044: orden de los campos del record en el JSON con Jackson 3.1 (`SORT_PROPERTIES_ALPHABETICALLY` está activo por defecto en Jackson 3, pero las propiedades del constructor del record van primero en orden de declaración según `POJOPropertiesCollector`); texto del log de *graceful shutdown* al hacer `kill`.
- web/public/content/microservices/modulo-9.md:1898 — F044: informe `APPLICATION FAILED TO START` con `TIENDA_MONEDA=pesos` (propiedad, valor, origen y motivo).
- web/public/content/microservices/modulo-9.md:2476 — F045: respuestas de la fachada (`X-Servido-Por`, cuerpo) con `spring-boot:run` y el cambio por `STRANGLER_RUTAS`.
- web/public/content/microservices/modulo-9.md:3024 — F046: respuesta JSON de `/facturas/E-1` (orden de campos con Jackson 3) y mensajes de `psql` con PostgreSQL 18.7 dentro del contenedor.
- web/public/content/microservices/modulo-10.md:473 — F047: los cuatro clientes con `spring-boot:run`; Feign 5.0.4 con Jackson 3 deserializando el record; tipo de excepción de timeout de RestTemplate (el *request factory* que elige Boot con Reactor Netty en el classpath) y de Feign (`RetryableException`).
- web/public/content/microservices/modulo-10.md:1036 — F048: generación con `protobuf-maven-plugin` 5.1.12 desde el *parent* de Boot 4.1.3, arranque en :9090, salida de `ClienteDeConsola` y de `grpcurl`; mensaje exacto de `UNIMPLEMENTED`/`UNAVAILABLE` en grpc-java 1.84.1.
- web/public/content/microservices/modulo-10.md:1539 — F049: respuestas de `curl` a `/graphql`, mensaje de validación de graphql-java 25.1 para `costo` e informe de inspección del esquema al arrancar.
- web/public/content/microservices/modulo-10.md:2073 — F050: estado `healthy`, JSON con `"particion":null` (inclusión de nulos por defecto en Jackson 3), líneas de log, salida de `kafka-console-consumer.sh` con `--timeout-ms` y el reenvío desde la consola web de RabbitMQ.
- web/public/content/microservices/modulo-10.md:2536 — F051: tiempos de `curl` 201 frente a 202 y que `SyncAsyncTest` (umbral de 250 ms) es estable en el Mac.
- web/public/content/microservices/modulo-8.md:717 — F037/F038: corregido el fallo del Mac (`cacheEvictBorra…` línea 45) con `immediateWrites()` en `CacheConfig` (Spring Data Redis 4 hace put/evict/clear asíncronos con Lettuce, según `DefaultRedisCacheWriter`); repetir `./verificar.sh` (ahora con `-fae`).
- examples/microservicios/modulo-9/f043-modulith/pom.xml:1 — corregido tras la prueba en el Mac (falta de `org.springframework.modulith.events`): se agregó `spring-modulith-events-api` (el starter core de Modulith 2.1.3 no lo trae); repetir `./verificar.sh`, que ahora usa `-fae`.
- examples/microservicios/modulo-10/f051-sync-async/src/main/java/academia/decision/Notificador.java:1 — corregido tras el NPE del Mac (`this.notificador.enviados` es null en el proxy CGLIB que crea `@Async`): el contador es privado y se lee con `enviados()`; repetir `SyncAsyncTest`.
- examples/microservicios/modulo-10/f048-grpc/protobuf/demo-binario.sh:1 — corregido tras la segunda corrida del Mac (Python 3.15 de Homebrew sin grpcio-tools): ya no usa paquetes globales; busca `protoc` en el PATH, luego el que descargó Maven en `~/.m2/repository/com/google/protobuf/protoc/4.36.2/` y por último crea `protobuf/.venv` con grpcio-tools 1.84.1 (rueda cp315 para macOS en PyPI). Aquí se probaron la rama del venv y la de `~/.m2` (con un ejecutable simulado); falta confirmar en el Mac el nombre real del archivo `protoc-4.36.2-osx-aarch_64.exe`.
- examples/microservicios/modulo-9/f044-doce-factores/src/test/java/academia/factores/DoceFactoresTest.java:1 — corregido tras «Expecting code to raise a throwable.»: `SpringApplicationBuilder.properties(...)` fija propiedades por defecto (menor prioridad) y `application.properties` las tapaba; ahora el valor inválido va como argumento `--tienda.moneda=pesos`. Repetir el test.
