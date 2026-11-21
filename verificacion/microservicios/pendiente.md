# Pendiente de verificar en el Mac del dueño (specs/018)

Una línea por bloque que no se pudo ejecutar en este entorno, con archivo:línea.

- docs/microservicios/08-herramientas-y-versiones.md:131 — `clinic` 13.0.0 (última publicación 2023-06-28): se instala y responde `clinic --version` → `v13.0.0` en Node 22.23.5 (comprobado aquí el 2026-11-19); falta probar `clinic doctor` con Node 26.13.1.

## Fase 0 · Módulos 0.1–0.5 (modulo-0 … modulo-4, fichas F001–F016)

Todo el código Java se ejecutó aquí con JDK 25.0.5 y todos los laboratorios pasaron (`verificar.sh` de modulo-0 a modulo-4) con **Node 22.23.5**: este entorno no permite instalar Node 26. Ya se repitieron en el Mac del dueño con Node 26.13.1 (sección 2026-11-21).

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

## Fase 1 · Módulos 7 y 8 (modulo-11 y modulo-12, fichas F052–F060)

Maven Central y los registros de Docker están bloqueados aquí. **Sí se ejecutó** con JDK 25.0.5: las 9 demostraciones
de `jdk/` (`./verificar.sh --solo-jdk` en ambos módulos termina en `RESULTADO: OK`; sus salidas están pegadas en las
fichas), el log de 404 de `python3 -m http.server`, la cadena de causas de `HttpClient` contra `http://catalogo`,
`servicios-falsos.py`, el `command` y el healthcheck del servicio `inventario` del compose de modulo-12 (en
`ubuntu:24.04` con el JDK 25 local montado, en lugar de `eclipse-temurin:25-jdk`) y la lógica de `caos/experimento.sh`
contra una API falsa en Python. Los `docker-compose.yml` pasan `docker compose config -q` y todo el Java de Spring
pasa el analizador sintáctico de javac 25 (sin compilar contra las dependencias). Coordenadas comprobadas en
repo1.maven.org el 2026-11-19: `spring-cloud-dependencies` 2025.1.4, `resilience4j-spring-boot4` 2.4.0 (depende de
`resilience4j-spring6` → circuitbreaker, retry, ratelimiter, bulkhead, timelimiter), `spring-boot-starter-aspectj`
4.1.3, `testcontainers-consul` y `testcontainers-toxiproxy` 2.0.5, `toxiproxy-java` 2.1.11; imágenes
`hashicorp/consul:2.1.0` (Docker Hub), `ghcr.io/shopify/toxiproxy:2.13.0` y `eclipse-temurin:25-jdk` existen.

- **Corrida en el Mac (2026-11-19), 2 fallos en modulo-11, corregidos aquí sin poder re-ejecutar:**
  (1) `EurekaRegistroTest` → `Failed to start bean 'eurekaAutoServiceRegistration'` / NPE en `getEurekaClient()`. Causa leída en las fuentes de Spring Cloud Netflix 5.0.3: el starter del servidor trae Jersey 3 (`org.glassfish.jersey.client.JerseyClient`), con `eureka.client.jersey.enabled` por defecto `true` se desactiva la rama `RestClient` de `DiscoveryClientOptionalArgsConfiguration` y nadie crea `TransportClientFactories`, que el `eurekaClient` (`@Lazy`) exige. Arreglo: `eureka.client.jersey.enabled: false` en `catalogo.yml` y `servidor.yml`; documentado como error común de F052. Re-ejecutar `cd f052-eureka && ../mvnw test` y confirmar la línea `Eureka HTTP Client uses RestClient`.
  (2) Bloque Consul: «catalogo no apareció sano». El log se borraba (`rm -f target-consul.log`), así que la causa no se pudo leer. Ahora `verificar.sh` guarda todo en `modulo-11/logs/` (`consul-app.log`, `consul-chequeos.json` con el `Output` del chequeo HTTP que hizo Consul, `consul-servicios.json`, `consul-app-health.json`, `consul-contenedor.log`, `maven-test.log`, informes de surefire), espera 90 s, detecta si la app murió y, si falla, imprime los chequeos y las últimas 20 líneas de la app. Según el código de Spring Cloud Consul 5.0.4, la URL del chequeo es `http://<hostname>:<server.port>/actuator/health` con `hostname=host.docker.internal` cuando `prefer-ip-address=false` (lo que pasa el script): re-ejecutar y enviar `logs/consul-chequeos.json` y `logs/consul-app.log`.
- **Segunda corrida en el Mac:** Eureka pasa; Consul estaba sano y el fallo era el `grep` (Consul escribe `"Service": "catalogo"` con espacio): corregido por el coordinador con `grep -qE '"Service": *"catalogo"'`, la ficha F052 usa ahora `jq` y `caos/experimento.sh` tolera el espacio. `ConfigServerTest` (2 tests) fallaba con `Incorrect ConfigDataLocationResolver chosen ... StandardConfigDataLocationResolver`: según las fuentes de Spring Cloud Config 5.0.6, `ConfigServerBootstrapApplicationListener` (jar del servidor) fija `spring.cloud.config.enabled=false` y `ConfigServerConfigDataLocationResolver.isResolvable` exige `true`. Arreglo: `CatalogoConfigApp.arrancar` define `spring.cloud.config.enabled=true` como propiedad por defecto; error común de F054 actualizado. El texto `Could not locate PropertySource and the fail fast property is set, failing` (`ConfigClientFailFastException`) está confirmado en `ConfigServerConfigDataLoader`. Re-ejecutar `cd f054-config && ../mvnw test`.
- examples/microservicios/modulo-11/verificar.sh:1 — `./verificar.sh` completo: Consul 2.1.0 `healthy`, `f052-consul` registrado y **sano** en Consul con `hostname=host.docker.internal` (que el chequeo HTTP desde el contenedor llegue al Mac) y `./mvnw -q test` de las 6 carpetas (9 tests).
- web/public/content/microservices/modulo-11.md:560 — F052: arranque de Eureka con `-Dspring-boot.run.main-class` y `spring.config.name` por `defaultProperties`; salida de `/instancias/catalogo` y panel `CATALOGO UP (2)`; desregistro al `Ctrl+C` y expulsión tras `kill -9` (15 s + expulsor de 2 s).
- web/public/content/microservices/modulo-11.md:583 — F052: Consul con `-ui`, `extra_hosts: host-gateway` y la consulta `/v1/health/service/catalogo?passing=true`.
- web/public/content/microservices/modulo-11.md:707 — F052: `EurekaRegistroTest` (que el cliente Eureka 5.0.3 registre las dos instancias en < 30 s con `use-read-only-response-cache: false`) y `ConsulRegistroTest` → 1 test cada uno; que `getServices()` incluya `consul`.
- web/public/content/microservices/modulo-11.md:726 — F052: texto exacto de los WARN de `RetryableEurekaHttpClient` / `DiscoveryClient` con una `defaultZone` equivocada (Eureka 5.0.3 con RestClient) y que `defaultzone` en minúsculas no funcione.
- web/public/content/microservices/modulo-11.md:1150 — F053: Spring Cloud Gateway 5.0.4 con el prefijo `spring.cloud.gateway.server.webflux.routes` (comprobado en la documentación), `X-Gateway` y `X-Request-Id` en la respuesta; código exacto (500 o 503) y cuerpo con el servicio apagado (línea 1171).
- web/public/content/microservices/modulo-11.md:1251 — F053: `GatewayTest` → 3 tests (que `@Value("${local.server.port}")` funcione en Boot 4.1 y que `AddResponseHeader` se aplique también al 404 del servicio); mensajes DEBUG `Route matched` / `No RouteDefinition found`.
- web/public/content/microservices/modulo-11.md:1770 — F054: JSON de `/catalogo/prod` (nombres de `propertySources` en modo `native` con `file:./config-repo/`), `/ajustes` con perfil prod, respuesta de `POST /actuator/refresh` (lista de claves) y fallo con `Could not locate PropertySource and the fail fast property is set, failing` (línea 1807); que `spring.cloud.config.import-check.enabled=false` baste para el servidor.
- web/public/content/microservices/modulo-11.md:1877 — F054: `ConfigServerTest` → 2 tests (dos apps con `spring.config.name` distinto en la misma JVM; `@RefreshScope` en una clase anidada estática).
- web/public/content/microservices/modulo-11.md:1895 — F054: líneas de log del cliente `Fetching config from server at` y `Located environment: name=..., profiles=[...]` en Spring Cloud Config 5.0.6.
- web/public/content/microservices/modulo-11.md:2325 — F055: salida del `CommandLineRunner` con `--demo.llamadas=6` (rotación 2-2-2) y `ERROR ResourceAccessException` con una instancia caída; que `configurations: health-check` filtre la caída con `RestClient` (si exige `RestTemplate`/WebClient, ajustar el texto de la línea 2343).
- web/public/content/microservices/modulo-11.md:2417 — F055: `BalanceoTest` → 1 test; texto del WARN de la caché por defecto de LoadBalancer.
- web/public/content/microservices/modulo-11.md:2939 — F056: los dos BFF con `servicios-falsos.py` (la tarjeta móvil con 5 campos; el orden de las claves con Jackson 3) y `BffTest` → 1 test (línea 3043) con `msMovil < 250`.
- examples/microservicios/modulo-12/verificar.sh:1 — `./verificar.sh` completo: `docker compose up -d --wait` (inventario en `eclipse-temurin:25-jdk` + Toxiproxy 2.13.0 con `-config`), las cuatro mediciones (`sano 200`, `lento 200 1.5…`, `caido 000`, `sano 200`) y `./mvnw -q test` de las 4 carpetas (13 tests).
- web/public/content/microservices/modulo-12.md:956 — F057: respuestas de `/pedidos/stock/7` con Toxiproxy `caido` (primera con `ResourceAccessException`, siguientes con `CallNotPermittedException`), ruta JSON `.components.circuitBreakers.details.inventario.details.state` en `/actuator/health`, eventos en `/actuator/circuitbreakerevents`, 504 del TimeLimiter (que `@ExceptionHandler(TimeoutException)` lo capture en un controlador que devuelve `CompletableFuture`) y 200/200/503 del Bulkhead.
- web/public/content/microservices/modulo-12.md:1123 — F057: `PatronesTest` → 5 tests con `resilience4j-spring-boot4` 2.4.0 sobre Boot 4.1.3 (orden de aspectos Retry exterior, `ignore-exceptions` de `CallNotPermittedException`, Bulkhead `containsExactly("OK","OK","BulkheadFull","BulkheadFull")`, TimeLimiter entre 450 y 900 ms).
- web/public/content/microservices/modulo-12.md:1143 — F057: el error común (fallback en `@CircuitBreaker` con `@Retry` exterior → 1 sola llamada, `fuente=fallback: ServiceUnavailable`) y el `kind` `successful_without_retry` en `/actuator/metrics/resilience4j.retry.calls`.
- web/public/content/microservices/modulo-12.md:1692 — F058: BFF apuntando a Toxiproxy `lento 1500` → degradado en ~0,75 s; deadline de 300 ms y vencido (504 `SIN_PRESUPUESTO`) con `ahora_ms` en el Mac.
- web/public/content/microservices/modulo-12.md:1817 — F058: `PresupuestoTest` → 3 tests (conversión de `800ms` a `Duration` en `@Value`, `X-Deadline` recibido = deadline − 50, degradado en < 1000 ms).
- web/public/content/microservices/modulo-12.md:2369 — F059: respuestas con Toxiproxy `caido` (cache con `edadMs`, defecto para el 99, 503 + `Retry-After: 30` en la reserva) y el circuito abierto tras el paso 3 (`cache (circuito abierto)`).
- web/public/content/microservices/modulo-12.md:2480 — F059: `FallbacksTest` → 4 tests (elección del fallback por tipo de excepción en Resilience4j 2.4.0).
- web/public/content/microservices/modulo-12.md:3088 — F060: JSON de `GET /proxies/inventario` (forma exacta de `listen`), tiempos de `lento`, `caido` y `cuelga` (línea 3099), y `caos/experimento.sh 600 300` contra `f060-caos` → `CONFIRMADA`; con `--inventario.timeout=5s` → `REFUTADA` (línea 3113).
- web/public/content/microservices/modulo-12.md:3232 — F060: `ExperimentoCaosTest` → 1 test (`Testcontainers.exposeHostPorts` + `host.testcontainers.internal` desde Toxiproxy en Docker Desktop, API de toxiproxy-java 2.1.11, p95 < 300 ms con 600 ms de latencia).
- web/public/content/microservices/modulo-12.md:3251 — F060: línea `Accepted client` en `docker compose logs toxiproxy` y `GET /metrics` de Toxiproxy 2.13.0.
- examples/microservicios/modulo-11/verificar.sh:1 y examples/microservicios/modulo-12/verificar.sh:1 — las demostraciones `jdk/` pasaron con JDK 25.0.5 en Linux; repetirlas en macOS (tiempos de `Bff.java`: móvil < 240 ms y web < 400 ms; `Caos.java` p95 < 300 ms en v2).

## Fase 1 · Módulos 9 y 10 (modulo-13 y modulo-14, fichas F061–F074)

Aquí no hay Maven Central, Docker Hub, quay.io ni kind/Istio: nada de Spring, Keycloak, Vault, Trivy, Prometheus, Grafana, Jaeger ni Zipkin se ejecutó. Sí se ejecutaron con **JDK 25.0.5**, OpenSSL 3.0.13 y Python 3.13 todas las demostraciones de `jdk/` (salidas pegadas tal cual): `./verificar.sh --solo-jdk` terminó en `RESULTADO: OK` en ambos módulos. Comprobaciones cruzadas hechas aquí: el token HS256 de `JwtFirmas.java` verificado con PyJWT 2.15.0, el vector S256 del RFC 7636 (apéndice B), la exposición de `MetricasPrometheus.java` leída con `prometheus_client` 0.26.0, `target/logs.jsonl` y `target/spans-zipkin.json` validados con `json`/`jq`, `docker compose config -q` y `yaml.safe_load` de todos los YAML. Datos de producto tomados de fuentes oficiales: arquitectura de Spring Security (docs.spring.io/spring-security/reference/servlet/architecture.html), starters de Boot 4.1 (`spring-boot-starter-security-oauth2-resource-server`, `-opentelemetry`, `-zipkin`, `-micrometer-metrics-test`…), propiedades de trazas y logging estructurado de Boot 4.1, `@AutoConfigureMetrics`/`@AutoConfigureTracing`, token exchange estándar de Keycloak (keycloak.org/securing-apps/token-exchange), Spring Cloud Vault 5.0.3, tarea de migración a mTLS de Istio y avisos GHSA-jfh8-c2jp-5v3q y GHSA-mjmj-j48q-9wg2.

- examples/microservicios/modulo-13/verificar.sh:1 — `./verificar.sh` completo (Keycloak 26.8.2, Vault 2.2.0, Trivy 0.76.1 y los tests de F061–F066 y F068) y `./verificar.sh --mtls` (kind + Istio; `run.sh` no lo lanza: ejecutarlo a mano).
- examples/microservicios/modulo-13/keycloak/tienda-realm.json:1 — que el realm importe con `clientScopes` propios (`basic` con `oidc-sub-mapper`, `profile`, `roles` con `oidc-usermodel-realm-role-mapper`, `pedidos:*` y `pagos:cobrar` con `oidc-audience-mapper`) y que `"attributes": {"standard.token.exchange.enabled": "true"}` active el canje en el cliente `pedidos`.
- web/public/content/microservices/modulo-13.md:420 — F061: línea `Will secure any request with [...]` (que termine en `ExceptionTranslationFilter, AuditoriaFilter, AuthorizationFilter`), salida de los cuatro `curl` (`401 Basic realm="Realm"`) y `CadenaDeFiltrosTest` + `CadenaVulnerableTest` → `Tests run: 6`; que `@Autowired FilterChainProxy` se inyecte.
- web/public/content/microservices/modulo-13.md:546 — F061: texto exacto de las líneas TRACE del `CsrfFilter` (`Invoking CsrfFilter (n/m)`, `Invalid CSRF token found for ...`).
- web/public/content/microservices/modulo-13.md:1035 — F062: `Rs256Test` + `Hs256Test` → `Tests run: 8`; que `@Value RSAPublicKey` convierta `classpath:claves/publica.pem`, que `NimbusJwtEncoder(new ImmutableSecret<>(...))` firme HS256 y la cabecera exacta `WWW-Authenticate: Bearer error="invalid_token", ...`.
- web/public/content/microservices/modulo-13.md:1048 — F062: texto exacto del 401 cuando el `kid` no está en la JWKS.
- web/public/content/microservices/modulo-13.md:1391 — F063: `.well-known/openid-configuration` del realm (`code_challenge_methods_supported` con `S256`), login real de ana en el navegador con el perfil `keycloak` y `OidcLoginTest` → `Tests run: 3` (redirección relativa `/oauth2/authorization/keycloak` de Spring Security 7).
- web/public/content/microservices/modulo-13.md:1493 — F063: texto de la pantalla de error de Keycloak y del evento `LOGIN_ERROR` con `invalid_redirect_uri`.
- web/public/content/microservices/modulo-13.md:1813 — F064: líneas de importación y arranque en `docker compose logs keycloak`, healthcheck con `/dev/tcp` en el puerto 9000, salida real de `VerToken.java` con un token de Keycloak (orden de `scope`, `azp`, `aud`) y `200/403/401` contra `f064-keycloak`; `ResourceServerKeycloakTest` → `Tests run: 6`.
- web/public/content/microservices/modulo-13.md:2299 — F065: matriz con tokens reales (`201/403`, `403/403`, `403/403`) y `MatrizDeAutorizacionTest` → `Tests run: 12`.
- web/public/content/microservices/modulo-13.md:2709 — F066: respuesta real del canje en Keycloak 26.8.2 (`issued_token_type`, `expires_in` 300, `aud` `pagos`, `azp` `pedidos`, `scope` `pagos:cobrar`), errores con `audience=inventario` y sin `pedidos` en el `aud` (línea 2781: evento `TOKEN_EXCHANGE_ERROR`), e `IntercambioTest` → `Tests run: 2`.
- web/public/content/microservices/modulo-13.md:3105 — F067: `mtls-kind/instalar.sh` (Istio `ISTIO_VERSION=1.32.0`: confirmar el parche vigente de la 1.32, muestras `samples/httpbin` y `samples/curl`) y `verificar-mtls.sh` → `RESULTADO: OK`; `403 RBAC: access denied` con `k8s/solo-pedidos.yaml` modificado.
- web/public/content/microservices/modulo-13.md:3487 — F068: `vault/sembrar.sh` (token `hvs.`), `VaultKv.java` → `HTTP 200` y versión 1, `403 permission denied` al escribir y al leer otra ruta, huella `sha256:4cf1a3d364d5` (calculada aquí), que Spring Cloud Vault lea `secret/f068-pagos` con la política mínima (incluido `kv.backend-version=2`) y `SecretoDesdeVaultTest` → `Tests run: 2`. La `ConnectException` sin Vault sí se ejecutó aquí.
- web/public/content/microservices/modulo-13.md:3899 — F069: tabla real de `trivy fs` sobre `antes/` (Trivy resuelve `pom.xml` contra Maven Central) y `exit 1`, `despues/` con `exit 0` (confirmar que log4j-core 2.24.3 y snakeyaml 2.4 no tienen HIGH/CRITICAL a esa fecha), `trivy config` con el hallazgo de `USER` root (línea 3912) y salida de `snyk test` (línea 3922).
- web/public/content/microservices/modulo-14.md:343 — F070: líneas reales de `/actuator/prometheus` (orden de etiquetas y formato `1` o `1.0`, que los tests ya toleran), consultas a Prometheus y objetivo `UP`; `RegistroPrometheusTest` + `ActuatorPrometheusTest` → `Tests run: 2`.
- web/public/content/microservices/modulo-14.md:799 — F071: `ZIPKIN_URL=http://localhost:9411 java jdk/TrazasW3C.java` → `202` y traza visible en Zipkin 3.6.1; dos instancias de `f071-tracing` con trazas en Jaeger 2.22.0 (`/api/services`) y con `-Pzipkin` en Zipkin; `PropagacionTest` → `Tests run: 1` con ambos perfiles (`@AutoConfigureTracing` de `spring-boot-starter-opentelemetry-test` y `-zipkin-test`).
- web/public/content/microservices/modulo-14.md:925 — F071: texto exacto del aviso del exportador OTLP cuando Jaeger no está.
- web/public/content/microservices/modulo-14.md:1173 — F072: líneas ECS reales de Spring Boot 4.1.3 (que `"log":{"level":...}` y `"service":{"name":...}` salgan anidados, MDC y `addKeyValue` como campos de primer nivel) y `LogsJsonTest` → `Tests run: 2`.
- web/public/content/microservices/modulo-14.md:1636 — F073: aprovisionamiento en Grafana 13.2.4 (carpeta `Tienda`, 7 paneles, `schemaVersion` 41 aceptado o migrado, salud de la fuente `prometheus`), captura descrita del dashboard con carga.
- web/public/content/microservices/modulo-14.md:1932 — F074: `promtool test rules reglas_test.yml` con Prometheus v3.15.1 → `SUCCESS` (comparación de `0.9` con tolerancia, ventanas abiertas por la izquierda) y la alerta en `pending` → `firing` con `./carga.sh 240 5` (línea 1943).
- examples/microservicios/modulo-14/verificar.sh:1 — `./verificar.sh` completo (promtool, Grafana, Zipkin, f070 raspado por Prometheus con `host.docker.internal`, f071 en Jaeger, tests Maven de F070–F072 y F071 con `-Pzipkin`).

## Fase 2 · Módulos 13 y 14 (modulo-17 y modulo-18, fichas F089–F100)

Aquí **sí** se pudo usar **Node.js 26.13.1** (binario del paquete npm `node@26.13.1`, con npm 10.9.9): los dos laboratorios pasaron completos con él (`./verificar.sh` → 24 y 26 tests, todos los programas y comprobaciones con curl en verde). Los 24 tests de modulo-17 también pasaron con Node 22.23.5. Queda repetirlos en el Mac (macOS, bash 3.2, npm 11 de Node 26) y confirmar lo que depende de la plataforma:

- examples/microservicios/modulo-17/verificar.sh:1 — `./verificar.sh` y `./verificar.sh --clinic` en el Mac (aquí: Linux x64, Node 26.13.1, ambos en verde).
- web/public/content/microservices/modulo-17.md:1375 — clinic 13.0.0 con Node 26.13.1: aquí `doctor`, `flame` y `bubbleprof` generaron su HTML con `NO_INSIGHT=1` (sin esa variable y sin TTY sale con 0 sin hacer nada: comprobado con Node 26.13.1 y 22.23.5). Falta confirmar en macOS que `clinic flame` (usa 0x) funciona y abrir los informes para confirmar la descripción (doctor marcó Event Loop delay y heapUsed, categoría «gc»).
- web/public/content/microservices/modulo-17.md:2329 — F095 paso 3 con `node:26-alpine` en Docker Desktop: aquí no hay Docker Hub y se ejecutó con el binario de Node 26.13.1 montado en `ubuntu:24.04` (10 s y 137 sin manejador; 0 s y 0 con manejador). Confirmar los mismos tiempos y códigos.
- web/public/content/microservices/modulo-17.md:1 — los milisegundos, latidos de `comparar.js`, mezcla `timeout/immediate` y porcentajes del perfil de CPU cambian con la máquina; el test de latidos del Worker usa fib(34): confirmar que en el Mac (más rápido) `latidos > 0` sigue cumpliéndose.
- examples/microservicios/modulo-17/verificar.sh:24 — en el Mac `npm ci` lo hará npm 11 (el de Node 26); el lockfile v3 se generó con npm 10.9.9.
- web/public/content/microservices/modulo-18.md:813 — log de arranque de Nest y `getUrl()` en macOS (aquí `http://127.0.0.1:3097`; en el Mac puede ser `http://[::1]:3097`; los tests ya lo normalizan).
- web/public/content/microservices/modulo-18.md:2104 — F100 paso 3: la captura de Swagger UI está descrita a partir del documento generado (no hay navegador aquí); confirmar a ojo en http://localhost:3100/docs. El POST del ejemplo sí se comprobó con curl (201).
- examples/microservicios/modulo-18/verificar.sh:1 — `./verificar.sh` en el Mac (aquí: Linux x64, Node 26.13.1, 26 tests y 10 comprobaciones con curl en verde).

## Fase 1 · Módulo 11 · Mensajería avanzada (modulo-15, fichas F075–F080)

Aquí no hay Maven Central ni Docker Hub: no se compiló ni ejecutó nada de Spring. Sí se ejecutó: `jdk/Particionador.java` con JDK 25.0.5 (salida pegada; murmur2 coincide con los vectores de `UtilsTest` de Kafka 4.2.2 y las particiones con `kafka-python` 3.0.13), los bytes Avro y la resolución v1→v2 con `fastavro` 1.13.1, la topología de F079 con `pika` contra RabbitMQ **3.12.1** local (ack, 312 NO_ROUTE, `rejected`, `delivery_limit` tras 4 intentos con `basic.reject`) y los patrones de F080 con `nats-py` 2.17.0 contra nats-server **2.10.7** local. Las 37 clases Java pasan el análisis sintáctico de javac 25; los POM son XML válido; `docker compose config -q` pasa. Las APIs de Spring Kafka/AMQP, kafka-clients, jnats y Avro se comprobaron en su código fuente (etiquetas v4.1.3, 4.2.2, main y release-1.12.2). Ejecutar `run.sh` con `LIMITE_LAB=3600`.

- examples/microservicios/modulo-15/verificar.sh:1 — (primera pasada en el Mac, 2026-11-19: fallaron Schema Registry «unhealthy», F076 y F077; corregido: registro comprobado desde el host con diagnóstico, `get()` tras el `send` en F076 y `org.apache.avro.SERIALIZABLE_PACKAGES` en F077) volver a ejecutar completo: 4 brokers healthy (`apache/kafka:4.4.0` con dos listeners, `confluentinc/cp-schema-registry:8.4.1` con healthcheck `curl`, `rabbitmq:4.4.1-management`, `nats:2.15.3-alpine` con `wget`), 3+2+5+1+4+4 = 19 tests y las 5 comprobaciones con CLI.
- web/public/content/microservices/modulo-15.md:794 — F075: nombres reales de hilos (`inventario-N-C-1`) y `clientId` del AdminClient; salida de `kafka-consumer-groups --describe` (10/40/10) y de `--members` con concurrency 4.
- web/public/content/microservices/modulo-15.md:1274 — F076: que el listener se ejecuta 2 veces y read_committed/read_uncommitted dan 1/2 con Spring Kafka 4.1.3 y `transaction-id-prefix` con `${random.uuid}`; salida de `kafka-dump-log.sh` (isControl/endTxnMarker).
- web/public/content/microservices/modulo-15.md:1815 — F077: formato de `GenericData.Record.toString()` en Avro 1.12.2, que `kafka-avro-serializer` 8.4.1 convive con kafka-clients 4.2.2 del BOM, respuestas JSON del registro (con y sin `verbose`), texto del 409 y el `AvroTypeException` del paso 4 (tomado de `Resolver.java`).
- web/public/content/microservices/modulo-15.md:2493 — F078: log de intentos, salida de `kafka-console-consumer` con `print.headers` (orden de campos) y las 10 entregas + `Backoff ... exhausted` sin el bean.
- web/public/content/microservices/modulo-15.md:3059 — F079: repetir con RabbitMQ **4.4.1** (aquí 3.12.1): 4 intentos con delivery-limit 3 vía `basic.reject` de Spring AMQP 4.1.3, `x-death` y la captura de la consola (columna Features).
- web/public/content/microservices/modulo-15.md:3508 — F080: tests con jnats 2.26.4 contra NATS 2.15.3 (aquí nats-py contra 2.10.7); fallo del contexto sin `-js` (paso 3).

## Fase 1 · Módulo 12 · Docker, Kubernetes y despliegue (modulo-16, fichas F081–F088)

Aquí no hay Maven Central, Docker Hub, kind, kubectl, Helm ni acceso a GitHub para Argo CD. Sí se ejecutó: `SondaSalud` con JDK 25.0.5 (exit 0 con 200, 1 con 404 o sin servidor), validación estricta de `k8s/**` contra Kubernetes 1.37 (`kubernetes-validate` 1.37.0, incluida la acción `preStop.sleep`), `docker compose config -q`, `shellcheck` de `verificar.sh` y `pruebas/*.sh`, y `verificar.sh` sin herramientas (sigue ante los fallos y los lista). El NPE de F080 se reprodujo con JDK 25.0.5. Etiquetas comprobadas en Docker Hub/GitHub el 2026-11-19: `maven:3.10.0-eclipse-temurin-25`, `nginx:1.30.6-alpine`, `busybox:1.37.0`, kind v0.33.0 (nodo v1.37.0 por digest), metrics-server v0.9.0, `install.yaml` de Argo CD v3.5.6; distroless `java25-debian13` según su README (no se pudo consultar gcr.io).

- examples/microservicios/modulo-16/verificar.sh:1 — (primera pasada en el Mac: abortó por `$esperado»` en bash 3.2; corregido con `${esperado}` en todos los .sh; segunda pasada: F084 eligió un pod en Terminating del ReplicaSet anterior, corregido con `pods_asentados`/`pods_vivos`) ejecutar completo con Docker Desktop (6 GB), kind v0.33.0, kubectl 1.37 y Helm 4.3.1; puede pasar de 40 min la primera vez (`LIMITE_LAB=3600`).
- examples/microservicios/modulo-16/app/Dockerfile:1 — construir: `dependency:go-offline` con Boot 4.1.3, que la capa `application/` deja `/app/catalogo.jar` (lo usan ENTRYPOINT y el healthcheck de Compose con `java -cp`), que `java` está en el PATH de distroless y el usuario que muestra `docker inspect` (`65532` o `nonroot`).
- web/public/content/microservices/modulo-16.md:765 — F081: tamaños reales de las dos imágenes, código 143 en `docker stop`, aviso `JSONArgsRecommended` y el fallo con ENTRYPOINT en forma shell; que `kind load` funciona con `--provenance=false`.
- web/public/content/microservices/modulo-16.md:1089 — F082: `docker compose ps`, JSON de `/api/info` (orden de campos con Jackson 3), secreto por `configtree` con nombre de archivo `catalogo.clave-api` y el healthcheck con curl que nunca pasa.
- web/public/content/microservices/modulo-16.md:1534 — F083: salidas de `kubectl get` y del `ImagePullBackOff`.
- web/public/content/microservices/modulo-16.md:1882 — F084: probes en kind, eventos del kubelet y el reto de 90 s (se razonó desde el orden de `SpringApplication.run` en el código de Boot 4.1.3).
- web/public/content/microservices/modulo-16.md:2210 — F085: metrics-server v0.9.0 con `--kubelet-insecure-tls`, valores del HPA (ilustrativos) y textos de eventos.
- web/public/content/microservices/modulo-16.md:2690 — F086: `helm lint/template/install/test/upgrade/rollback/history` con Helm 4.3.1 (no se pudo renderizar el chart aquí) y el error del paso 4.
- web/public/content/microservices/modulo-16.md:3159 — F087: proporción real del canario (la prueba acepta 5–50 de 100).
- web/public/content/microservices/modulo-16.md:3483 — F088: Argo CD v3.5.6 en kind, `Synced Healthy` de guestbook y el selfHeal tras `kubectl scale`.
- Corrida en el Mac del 2026-11-20 (Módulos 9 y 10): funcionaron Keycloak (token de ana, canje a `aud=pagos`, F064 `200-403-401`), Vault, Trivy, Grafana, Zipkin y Prometheus. Corregido tras esa corrida y **por repetir**: `CadenaDeFiltrosTest` (cabecera real `Basic realm="Realm", charset="UTF-8"`), patrones de `RegistroPrometheusTest`/`ActuatorPrometheusTest` (la etiqueta `uri="/pedidos/{id}"` contiene `}`), `reglas_test.yml` (`round(p99 * 1000)` = 900 en vez de `0.9` exacto) y los falsos `FALLA: empaquetar …` de `verificar.sh` (`wait` devolvía 143).
- examples/microservicios/modulo-14/verificar.sh:60 — F071 en Jaeger sigue **sin confirmar**: en el Mac la petición respondió pero la lista de servicios salió vacía. El script ahora espera a la UI, repite la petición hasta 60 s, consulta `/api/v3/services` (forma `{"services":[...]}` por confirmar) y `/api/services`, y si falla deja `logs/f071-pedidos.log`, `logs/f071-inventario.log` y `logs/jaeger.log`. La configuración de Spring (starter `spring-boot-starter-opentelemetry`, `management.opentelemetry.tracing.export.otlp.endpoint=http://localhost:4318/v1/traces`, muestreo 1.0) coincide con la documentación de Boot 4.1; si vuelve a fallar, el motivo estará en esos logs.

## Fase 2 · Módulos 15 y 16 (modulo-19 y modulo-20, fichas F101–F108)

**Corrida en el Mac del dueño (2026-11-20), `./verificar.sh --compose`: ambos `RESULTADO: OK`** con Node.js 26.13.1, npm 11.20.0, Docker Compose v5.7.1 (Docker Engine 29.9.3), `mongo:9.0.8`, `postgres:18.7` y Pact Broker 2.124.0. Modulo-19: 23 tests (F101 4+4, F102 Sequelize 3, Prisma 3, F103 4, F104 5), `prisma generate` y las demos. Modulo-20: `tsc`, 24 tests unitarios, cobertura, los tres errores comunes, Pact completo (consumidor, proveedor, error común, `publish`, verificación desde el broker, `can-i-deploy`) y Testcontainers con `postgres:18.7` y Ryuk. Las salidas de las lecciones se reemplazaron por las del Mac (logs en `salidas-m15a18/logs-modulo-19` y `logs-modulo-20`): demo de F101, `repositorio.test.js` (`pass 4`), `error-buffering.js` (en macOS el `ECONNREFUSED` junta `::1` y `127.0.0.1`), `prisma generate` y tests de Prisma, demo de Prisma (6 líneas, `código P2002`), tests de F103 y F104 contra 18.7 (mismos mensajes que en 16.15), demo de F104 (`max=20 → 100 ms`, texto de la captura corregido), proveedor de Pact (avisos `DEP0060` de http-proxy y `pact_matching::metrics` explicados), error común de Pact, `publish`, verificación desde el broker, `can-i-deploy` y F108 (`Time: 2.766 s`, texto de la captura corregido).

Sigue pendiente (no lo registra `verificar.sh`):

- web/public/content/microservices/modulo-19.md:429 — F101 paso 3: formato de la salida de `mongosh --eval "…toArray()"` dentro de `mongo:9.0.8`.
- web/public/content/microservices/modulo-19.md:440 — F101 paso 4: `node f101-mongoose/demo.js` con `docker compose stop mongo` (en macOS el mensaje probablemente junte `::1:27019` y `127.0.0.1:27019`, como en el error común).
- web/public/content/microservices/modulo-19.md:1667 — F103 paso 3: texto de `psql` dentro del contenedor de PostgreSQL 18.7 (`FATAL:  permission denied for database` + `DETAIL:  User does not have CONNECT privilege.`; pegado de 16.15).
- web/public/content/microservices/modulo-19.md:2290 — F104: `remaining connection slots are reserved for roles with the SUPERUSER attribute` es el mensaje de PostgreSQL 16.15; comprobar el texto en 18.7.
- web/public/content/microservices/modulo-19.md:764 — confirmar que `prisma migrate dev/deploy` y `prisma db push` siguen llamándose así en Prisma 7.10.1 (`npx prisma --help`).
- web/public/content/microservices/modulo-20.md:1639 — F107: captura de la interfaz del broker en `http://localhost:9220` (descrita, no vista).
- web/public/content/microservices/modulo-20.md:2072 — F108 pasos 2–4: `docker ps` con `postgres:18.7` y `testcontainers/ryuk`, `0` contenedores al terminar y `duplicate key value violates unique constraint "pedidos_pkey"` al quitar `ON CONFLICT`.
- web/public/content/microservices/modulo-20.md:2120 — F108: `Could not find a working container runtime strategy` es salida real de Linux (usuario sin permiso sobre el socket); confirmar el mensaje con Docker Desktop apagado en macOS.
- examples/microservicios/modulo-20/jest.config.js:15 — `reporters: ['default']`: Jest 30.5.2 cambia a un reportero resumido cuando detecta un asistente de IA (`AI_AGENT`, `CLAUDECODE`…); con esta línea la salida es la de la lección también si `run.sh` se lanza desde un asistente.

## Fase 2 · Módulos 17 y 18 (modulo-21 y modulo-22, fichas F109–F118)

**Corrida en el Mac del dueño (2026-11-20), `./verificar.sh --compose`: ambos `RESULTADO: OK`** con Node.js 26.13.1 y npm 11.20.0 (los lockfiles generados con npm 10.9.9 sirvieron para `npm ci`). Modulo-21 contra **Consul 2.1.0** real: los 8 tests de F111 y F112 con `CONSUL_REAL=1`, round-robin 3111/3112, la instancia matada con `kill -9` deja de ofrecerse al vencer el TTL (log del agente: `Check missed TTL, is now critical: check=service:catalogo-3111` justo 3 s después de su único latido), `SinInstancias` y la recarga en caliente de F112. Modulo-22 contra **Kafka 4.4.0, RabbitMQ 4.4.1 y NATS 2.15.3**: kafkajs 2.2.4 funciona con Kafka 4.4 (`createTopics`, productor idempotente, grupos clásicos; 2 tests + productor + consumidor), amqplib (3 tests, demo, `406 PRECONDITION_FAILED` con el mismo texto) y NATS (demo). Cambios en las lecciones: salidas de F111/F112 marcadas como reales y bloques de `CONSUL_REAL=1` añadidos; la captura de la UI de Consul (nombre del check «Service 'catalogo' check» y nota «TTL expired», de memoria) se sustituyó por la línea real del log del agente y por lo que dice la documentación de la API de checks de Consul (developer.hashicorp.com/consul/api-docs/agent/check, v2.1.x: «The minimum timeout is 1 minute, and the process that reaps critical services runs every 30 seconds»; la referencia de health checks da como nombre por defecto `service:<service-id>`, que contradecía lo escrito); quitado «Key/Value → config/pedidos» de la interfaz. F116: salidas reales del productor y del consumidor (las particiones y offsets calculados coincidieron), `kafka.infra.js` con los dos `ERROR` reales de coordinador cargando, los `ERROR` al cerrar con Ctrl+C, nota en la explicación maestra y error común nuevo `TimeoutNegativeWarning` (causa leída en `node_modules/kafkajs/src/network/requestQueue/index.js` 2.2.4 e issue tulios/kafkajs#1751 con PR #1755 y #1768 abiertos; el aviso y `--disable-warning=TimeoutNegativeWarning` se reprodujeron aquí con Node 26.13.1, y Node 22.23.5 no lo emite). F117: salida real con NATS 2.15.3. F114: nota sobre el detalle de `DEADLINE_EXCEEDED` en el Mac (sin `LB pick`).

Sigue pendiente:

- web/public/content/microservices/modulo-21.md:1641 — F111 paso 3: salida del `jq` contra Consul real (`checks: ["passing"]`, que agrupa `serfHealth` y el check del servicio); `verificar.sh` no la registra.
- web/public/content/microservices/modulo-21.md:1677 — F111 paso 4: el bloque `fetch failed … ECONNREFUSED` dentro de la ventana del TTL es de Linux (`errno: -111`); en macOS el texto de la línea 1717 dice `-61` (valor de `ECONNREFUSED` en macOS, no visto en un log).
- web/public/content/microservices/modulo-21.md:1853 — `curl -s localhost:8500/v1/status/leader` → `"127.0.0.1:8300"`: coincide con la dirección de raft del log de Consul 2.1.0 (`Node at 127.0.0.1:8300 [Leader]`), pero el `curl` no se ejecutó.
- web/public/content/microservices/modulo-21.md:2214 — F112 pasos 4 y 5 con Consul real (`PAGOS_TIMEOUT_MS=250` y el aviso al hacer `docker compose stop consul`: `socket hang up` o `ECONNREFUSED`).
- web/public/content/microservices/modulo-21.md:1112 — `git status --short f110-dotenv/` no muestra `.env` (este entorno no es un repositorio Git; `.env` está en el `.gitignore` de la raíz y en el del laboratorio).
- web/public/content/microservices/modulo-22.md:1880 — F116 paso 3: `rabbitmqctl -q list_queues name messages` dentro del contenedor de RabbitMQ 4.4.1 (aquí, `rabbitmqctl` local 3.12.1).
- web/public/content/microservices/modulo-22.md:1947 — consola de RabbitMQ (`http://localhost:15672`, «Ready: 2») y columna *Type* de Exchanges: descritas, no vistas.
- web/public/content/microservices/modulo-22.md:2232 — F116 error común de Kafka: el caso de `advertised.listeners` está descrito, no reproducido.
- web/public/content/microservices/modulo-22.md:1618 — F116 explicación maestra: la API compatible con KafkaJS de `@confluentinc/kafka-javascript` (`.KafkaJS`) y `@platformatic/kafka` se citan de su documentación; no se instalaron ni ejecutaron.
- web/public/content/microservices/modulo-22.md:2510 — F117 paso 1 (`curl localhost:8222/healthz` → `{"status":"ok"}`) y `/connz?subs=1` con NATS 2.15.3: el healthcheck del compose (que hace `grep ok` sobre `/healthz`) pasó, pero la salida exacta no se registró.
- web/public/content/microservices/modulo-22.md:1306 — F115 paso 4: la página de Apollo Server en `http://127.0.0.1:4115/` que carga Apollo Sandbox (aquí solo se comprobó que el HTML referencia `sandbox.cdn.apollographql.com`; no hay navegador con internet).

## Fase 2 · Módulos 19 y 20 (modulo-23 y modulo-24, fichas F119–F129)

Ejecutado aquí con **Node.js 26.13.1** (paquete npm `node@26.13.1`, Linux x64, npm 10.9.9). **Módulo 19:** `MODO=local ./verificar.sh` en verde (25 tests, 5 simulaciones, errores comunes y curl) con **Toxiproxy 2.13.0** (binario oficial de GitHub) y **Redis 7.0.15** local en lugar de `redis:8.10.2-alpine`. **Módulo 20:** `./verificar.sh` sin `--compose` en verde (34 tests y los ataques de las 6 fichas). Docker Hub está bloqueado: no se levantó ningún `docker-compose.yml` (solo `docker compose config -q`), ni MongoDB, ni Floci/Floci-Az, ni Vault.

- examples/microservicios/modulo-23/verificar.sh:1 — ejecutar `./verificar.sh --compose` en el Mac (imágenes `node:26-alpine`, `redis:8.10.2-alpine`, `ghcr.io/shopify/toxiproxy:2.13.0`; healthcheck del inventario con `node -e fetch`). Confirmar que los proxies de `toxiproxy.json` resuelven `inventario:9000` y `redis:6379` dentro de la red de Compose.
- web/public/content/microservices/modulo-23.md:1691 — F121 paso 2: `redis-cli --scan` con Redis 8.10.2 dentro del contenedor (aquí, Redis 7.0.15 local en :16379).
- examples/microservicios/modulo-24/verificar.sh:1 — ejecutar `./verificar.sh --compose` (mongo:9.0.8, floci/floci:2.2.0, floci/floci-az:0.14.0, hashicorp/vault:2.2.0): que `docker compose up --wait` acaba sano (Floci y Floci-Az no tienen healthcheck en el compose; el script espera `/_localstack/health` en :4566 y `/` en :4577: confirmar que esas rutas responden), el ataque NoSQL real, `nosql.integracion.js` (2), `sembrar.js`, `secretos.integracion.js` (3) y `despues.js` con los tres proveedores.
- web/public/content/microservices/modulo-24.md:1781 — F127 paso 2: salida de `ataque.js` contra MongoDB 9.0.8 (escrita a partir del código y de los filtros que registran los tests, no ejecutada): sobre todo las respuestas a `$regex` (401/200/200) y el orden de `["Teclado","Mouse","Prototipo secreto"]`.
- web/public/content/microservices/modulo-24.md:2936 — F129 pasos 2–4: `sembrar.js` contra Floci (CreateSecret/PutSecretValue), Vault dev (KV v2 en `secret/`) y Floci-Az (`setSecret` con la política `forzarHttp` que documenta su suite `sdk-test-node`); los tres adaptadores solo se probaron aquí contra dobles HTTP locales del protocolo.
- web/public/content/microservices/modulo-24.md:3084 — F129: `secretos.integracion.js`, en especial que la `version` cambia tras la rotación en los tres gestores (en Floci-Az, ids de versión de 32 caracteres hex).

## Fase 2 · Módulos 21 y 22 (modulo-25 y modulo-26, fichas F130–F141)

Ejecutado aquí con **Node.js 26.13.1** (`/opt/n26bin`, npm 10.9.9). **Módulo 21:** `./verificar.sh --externo` en verde
(19 tests, demos y errores comunes, más `broker.infra.js` con **RabbitMQ 3.12.1** local en lugar de `rabbitmq:4.4.1`;
Kafka omitido). **Módulo 22:** `./verificar.sh` en verde con **RabbitMQ 3.12.1** y **Redis 7.0.15** locales (35 tests,
demos y errores comunes); MongoDB omitido (no hay binario ni imagen en este entorno). Docker Hub está bloqueado: no se
levantó ningún `docker-compose.yml` (solo `docker compose config -q`). En el Mac:

```bash
cd examples/microservicios/modulo-25 && ./verificar.sh --compose
cd examples/microservicios/modulo-26 && ./verificar.sh --compose
```

- examples/microservicios/modulo-25/verificar.sh:1 — `./verificar.sh --compose` (jaegertracing/jaeger:2.22.0, rabbitmq:4.4.1-management, apache/kafka:4.4.0, grafana/loki:3.7.9, prom/prometheus:v3.15.1, grafana/grafana:13.2.4): que `up --wait` acaba sano (Jaeger, Loki y Grafana no tienen healthcheck) y que pasan Jaeger, `broker.infra.js` con los dos brokers, Loki y PromQL.
- web/public/content/microservices/modulo-25.md:436 — F130 paso 4: Jaeger UI (desplegable *Service* con `pedidos` e `inventario`, traza de 4 spans y 2 servicios, atributos de `validar-pedido`): descrito, no visto.
- web/public/content/microservices/modulo-25.md:900 — F131 paso 4: **kafkajs 2.2.4 contra Kafka 4.4.0** (mismo riesgo que F116 en modulo-22: KIP-896); `productor-kafka.js`/`consumidor-kafka.js` y `BROKER=kafka node --test f131-traceparent/broker.infra.js` nunca ejecutados.
- web/public/content/microservices/modulo-25.md:1599 — F133 pasos 1–5 con Loki 3.7.9: `ready`, `enviadas a Loki: 7 · perdidas: 0`, respuesta de `query_range` con la línea de P-3, vista *Explore* y el mensaje al parar Loki (`[envio-loki] 7 líneas perdidas: fetch failed`). Confirmar también el código de éxito del push (la API documenta el JSON y la marca en ns como string; el test usa 204).
- web/public/content/microservices/modulo-25.md:1974 — F134 pasos 2–3: Prometheus raspa `host.docker.internal:9464` en Docker Desktop, la consulta devuelve `"5"` y el target aparece UP; el p95 en Grafana.
- web/public/content/microservices/modulo-25.md:1 — Grafana 13.2.4: que el aprovisionamiento de `fuentes.yml` crea las tres fuentes y que el campo derivado `trace_id` abre la traza en Jaeger.
- examples/microservicios/modulo-26/verificar.sh:1 — `./verificar.sh --compose` (rabbitmq:4.4.1-management, redis:8.10.2-alpine, mongo:9.0.8): F135 (5 tests), F136 (5), F139 con MongoDB (9) y F140 con MongoDB; healthcheck de mongo con `mongosh`.
- web/public/content/microservices/modulo-26.md:424 — F135 pasos 1–2 con RabbitMQ 4.4.1 y `docker compose exec rabbitmq rabbitmqctl` (aquí, 3.12.1 local con `rabbitmqctl` del sistema); confirmar que 4.4.1 devuelve el return `312 NO_ROUTE` antes del ack y la cabecera `x-death` con `reason: rejected`.
- web/public/content/microservices/modulo-26.md:434 — F135 paso 3: consola de RabbitMQ (pestaña *Queues and Streams*, *Get messages*, cabecera `x-death`): descrita, no vista.
- web/public/content/microservices/modulo-26.md:790 — F136 paso 2: `redis-cli --scan` y `TTL` dentro de `redis:8.10.2-alpine` (aquí, Redis 7.0.15 local).
- web/public/content/microservices/modulo-26.md:2262 — F139 paso 2: **`almacen-mongo.js` nunca se ejecutó contra MongoDB** (driver mongodb 7.9.1 instalado y tipos revisados: `findOneAndUpdate` devuelve el documento). Confirmar demo con `AlmacenEventosMongo`, la salida de `mongosh`, que el error E11000 se traduce a `ConflictoDeConcurrencia` y los 4 tests de la suite `almacén mongo`.
- web/public/content/microservices/modulo-26.md:2270 — F139 paso 3: texto exacto del error `E11000 duplicate key error collection: modulo26.f139_commits index: _id_ dup key: …` en MongoDB 9.0.8 (escrito de memoria del formato habitual).
- web/public/content/microservices/modulo-26.md:2668 — F140 paso 2: `node f140-proyecciones/demo.js` contra MongoDB (misma salida que en memoria).
- examples/microservicios/modulo-25/verificar.sh:1 y examples/microservicios/modulo-26/verificar.sh:1 — en el Mac `npm ci` lo hará npm 11 (el de Node 26); los lockfiles v3 se generaron con npm 10.9.9.

## Fase 2 y 3 · Módulos 23 y 24 (modulo-27 y modulo-28, fichas F142–F151)

Todo el código Node.js, los tests (29 en modulo-27 y 21 en modulo-28) y los scripts de las fichas se ejecutaron aquí con **Node 26.13.1** (`./verificar.sh` sin `--compose` en verde en los dos). Los lockfiles se generaron con npm 10.9.9. Aquí no hay acceso a Docker Hub, kind, kubectl ni GitHub Actions.

- examples/microservicios/modulo-27/verificar.sh:1 — ejecutar `./verificar.sh --compose` en el Mac con Docker Desktop, kind y kubectl: build real de `f142-dockerfile/Dockerfile` sobre `node:26.13.1-alpine` (aquí se construyó con el constructor clásico sobre un **sustituto local** Ubuntu + binario de Node 26.13.1 y usuario `node` uid 1000: pasaron `USER node`, sin TypeScript, HEALTHCHECK `healthy` y el apagado limpio de 5 s), job «imagen» de `simular-ci.js`, clúster kind «curso», metrics-server v0.9.1 con `--kubelet-insecure-tls` y el HPA escalando por encima de 3.
- web/public/content/microservices/modulo-27.md:548 — F142 paso 3: tamaño real de `pedidos:1.0.0` con la base Alpine (aquí 377 MB por el sustituto); confirmar que `# syntax=docker/dockerfile:1` se resuelve con BuildKit y que el HEALTHCHECK funciona en Alpine.
- web/public/content/microservices/modulo-27.md:1048 — F143 paso 3: `kind create cluster` (kind v0.33.0, imagen por defecto `kindest/node:v1.37.0`), `kind load docker-image`, `kubectl apply -f k8s/`, `rollout status` y `get pods,svc,endpointslices` (salida descrita, no pegada); paso 4: rolling update con `set env` y `rollout undo`.
- web/public/content/microservices/modulo-27.md:1182 — F143 error común: salida real de `get endpointslices` con el selector roto y de `describe service`.
- web/public/content/microservices/modulo-27.md:1495 — F144 paso 2: metrics-server v0.9.1 (`components.yaml` de la release y el parche `--kubelet-insecure-tls` para kind), `get hpa -w` y los eventos `SuccessfulRescale` de `describe hpa` (descritos, no pegados).
- web/public/content/microservices/modulo-27.md:1605 — F144 error común: mensajes exactos de `kubectl top pods` sin metrics-server y de `describe hpa` sin `requests.cpu`.
- web/public/content/microservices/modulo-27.md:1950 — F145: `simular-ci.js imagen` con Docker (build, prueba de humo) y ejecución real en GitHub (paso 3, línea 1954): pestaña Actions y paquete en ghcr.io. Los SHA `3d3c42e5aac5ba805825da76410c181273ba90b1` (actions/checkout v7.0.1) y `949feb2413d6458794dcd2491c4babbbce0c15c1` (actions/setup-node v7.1.0) **ya están confirmados** (2026-11-20) con `git ls-remote https://github.com/actions/checkout` y `… setup-node`: coinciden con `refs/tags/v7.0.1` y `refs/tags/v7.1.0` (y con las etiquetas móviles `v7`).
- web/public/content/microservices/modulo-27.md:2433 — F146 paso 3: Blue-Green con `blue-green.yaml` y `kubectl patch service` en kind; `rollout-canary.yaml` con Argo Rollouts v1.10.1 instalado (no se probó ni la instalación ni el plugin `kubectl argo rollouts`).
- web/public/content/microservices/modulo-27.md:2884 — F147 paso 2: Argo CD v3.5.6 (`install.yaml` con `--server-side --force-conflicts`, como indica la guía *Getting Started*), la `Application` contra un repositorio público y el selfHeal real tras `kubectl set image`.
- examples/microservicios/modulo-28/verificar.sh:1 — ejecutar `./verificar.sh --compose`: `node:26.13.1-alpine` montando el laboratorio de solo lectura, `prom/prometheus:v3.15.1` (confirmar la etiqueta y que la imagen trae `wget` para el healthcheck) y las fitness functions con PromQL: v1 con código 0 y v2 con código 1 y `✘ FF3`.
- web/public/content/microservices/modulo-28.md:1869 — F151 paso 2: salida real de `fitness.js --prometheus` para los dos jobs (descrita, no pegada); `medirEnPrometheus` solo se probó contra un doble local de `/api/v1/query`.
- web/public/content/microservices/modulo-28.md:840 — F149: `workspace.dsl` no se ejecutó (sin Structurizr aquí): pegarlo en https://playground.structurizr.com o abrirlo con Structurizr Lite y confirmar que genera las vistas «Contexto» y «Contenedores».

## Fase 3 · Módulos 25 y 26 (modulo-29 y modulo-30, fichas F152–F160)

Ejecutado en el entorno de autoría con Node 26.13.1, PostgreSQL 16.15 local (`wal_level=logical`,
`max_prepared_transactions=10`), RabbitMQ 3.12.1 y NATS Server 2.10.7 locales: `./verificar.sh` de los dos módulos
termina en «RESULTADO: OK» (modulo-29 omite 4 bloques; modulo-30 omite 1). Falta en el Mac:

```bash
cd examples/microservicios/modulo-29 && ./verificar.sh --compose
cd examples/microservicios/modulo-30 && ./verificar.sh --compose
```

- examples/microservicios/modulo-29/verificar.sh:1 — `--compose` con postgres:18.7 (`-c wal_level=logical -c max_prepared_transactions=10`), apache/kafka:4.4.0 y quay.io/debezium/connect:3.7 (tag de la línea 3.7 tomado del tutorial oficial; la estable es 3.7.1.Final): que `up --wait` acaba sano (healthcheck de Connect con `curl` dentro de la imagen) y que pasan F152 Debezium, F154 con Kafka y F155 con Kafka. Confirmar también que las variables `CONNECT_*_STORAGE_REPLICATION_FACTOR` de docker-compose.yml las traduce la imagen de Debezium (si no, Connect pedirá RF 3 con un solo broker).
- web/public/content/microservices/modulo-29.md:494 — F152 paso 3: registrar `conector-outbox.json` y leer `outbox.event.pedido` con `kafka-console-consumer.sh` (cabecera `eventType`, clave `P-1`/`P-2`, payload expandido con `table.expand.json.payload=true`); estado RUNNING en `/connectors/pedidos-outbox/status`.
- web/public/content/microservices/modulo-29.md:558 — F152: `node --test f152-outbox/debezium.infra.js` (espera `pass 1`).
- web/public/content/microservices/modulo-29.md:946 — F153 paso 2: `temporal server start-dev` + `worker.js` + `iniciar.js` (P-1 inestable → COMPLETADA con 3 intentos; P-2 rechazada → COMPENSADA) y el historial en la UI :8233. Aquí no se pudo descargar el servidor (temporal.download bloqueado).
- web/public/content/microservices/modulo-29.md:959 — F153 paso 3: `temporal.infra.js` con `TestWorkflowEnvironment.createLocal()` (descarga el CLI) o `TEMPORAL_ADDRESS`; espera `pass 3` (incluye que `cause.message` de la ActivityFailure sea «tarjeta rechazada»).
- web/public/content/microservices/modulo-29.md:1417 — F154 paso 3: `consumidor-kafka.js` contra Kafka 4.4.0 con kafkajs 2.2.4 (mismo riesgo KIP-896 que F116 y F131).
- web/public/content/microservices/modulo-29.md:1818 — F155 paso 2: `eos-kafka.js` (transacciones de kafkajs 2.2.4 contra Kafka 4.4.0: commit/abort, reentrega de PAGO-2 y lectura `read_committed` vs `read_uncommitted`). Las dos últimas líneas del output esperado se dedujeron del código, no se vieron.
- web/public/content/microservices/modulo-29.md:1 — F156 con PostgreSQL 18.7 (aquí 16.15): textos `canceling statement due to lock timeout`, `WARNING: there is no transaction in progress` y la consulta de `pg_locks WHERE pid IS NULL`.
- examples/microservicios/modulo-30/verificar.sh:1 — `--compose` con apache/kafka:4.4.0, confluentinc/cp-schema-registry:8.4.1, rabbitmq:4.4.1-management y nats:2.15.3-alpine (compose copiado de modulo-15).
- web/public/content/microservices/modulo-30.md:473 — F157 paso 2: `registry.infra.js` (que `registry.encode` de @kafkajs/confluent-schema-registry 4.1.0 dé los mismos bytes que `formato.js`, `is_compatible` false/true y el rechazo de `register`) y `transacciones.js` (nombre del error de fencing con kafkajs 2.2.4 frente a Kafka 4.4.0, que usa PRODUCER_FENCED; kafkajs solo conoce INVALID_PRODUCER_EPOCH) y la línea `read_committed → f157.auditoria:P-1, f157.pedidos:P-1`.
- web/public/content/microservices/modulo-30.md:980 — F158 con RabbitMQ 4.4.1 (aquí 3.12.1): los 4 tests, en especial que `reject(requeue=true)` cuente para `x-delivery-limit` (la documentación de 4.3+ dice que sí y que `nack` no) y el orden de `x-death` (más reciente primero) con `x-first-death-reason: expired`; la salida de `rabbitmqctl list_queues name type messages` y la consola (*Get messages*) descritas.
- web/public/content/microservices/modulo-30.md:1390 — F159 con NATS Server 2.15.3 (aquí 2.10.7): los 5 tests, la demo (aviso MAX_DELIVERIES) y el texto `wrong last sequence: 2` del KV; la salida de `nats stream info` / `nats consumer info` descrita en la línea 1323.

## Fase 3 · Módulos 27 y 28 (modulo-31 y modulo-32, fichas F161–F168)

Todo el código Node.js, los tests (18 en modulo-31, 17 + 1 con `PGURL`; 18 en modulo-32), la PKI con OpenSSL 3.0.13 y los ataques ANTES/DESPUÉS se ejecutaron aquí con **Node 26.13.1** (`./verificar.sh` en verde en los dos). El SQL de Vault (`CREATE ROLE … VALID UNTIL`, login, caducidad, `DROP ROLE`) se ejecutó contra un **PostgreSQL 16** local, no contra 18.7. Lockfiles generados con npm 10.9.9. Aquí no hay acceso a Docker Hub, kind ni a rfc-editor.org/datatracker.ietf.org.

- examples/microservicios/modulo-31/verificar.sh:1 — ejecutar `./verificar.sh --compose` en el Mac: `postgres:18.7` y `hashicorp/vault:2.2.0` (confirmar las etiquetas), `f163-vault/vault/configurar.sh` (confirmar que `database/config` acepta `username=`/`password=` para rellenar `{{username}}`/`{{password}}` de `connection_url`), `node f163-vault/real.js` (login OK y, tras revocar, `password authentication failed`) y `error-comun.js` contra el puerto 15432.
- web/public/content/microservices/modulo-31.md:1845 — F163 paso 2: salida real de `vault read database/creds/pedidos` (formato del `username` que genera Vault 2.2.0) y de `vault lease revoke -prefix database/creds/pedidos` (la documentación da «Success! Revoked any leases with prefix: …»). Confirmar también la ruta `POST /v1/sys/leases/revoke-prefix/:prefix` que usa `doble-vault.js` y `ataque.js` (la de `revoke` y `renew` sí se leyó en la documentación de la API).
- examples/microservicios/modulo-31/pki/generar.sh:1 — ejecutar con el LibreSSL de macOS (`/usr/bin/openssl`): `req -x509 -newkey rsa:2048`, `x509 -req -extfile` y `-signkey` para el intruso; los 18 tests deben seguir pasando.
- web/public/content/microservices/modulo-31.md:676 — F161 paso 3: `./f161-mtls/k8s/probar-istio.sh` en kind con Istio 1.32 (`istioctl install --set profile=default -y`): con `antes.yaml` pedidos y catalogo cobran; con `despues.yaml` catalogo recibe `wget: server returned error: HTTP/1.1 403 Forbidden`. Probar también `f161-mtls/k8s/linkerd/despues.yaml` con Linkerd edge-26.11.2 (no se probó la instalación de Linkerd ni que `Server` acepte `port: http` con el puerto con nombre de `app.yaml`).
- web/public/content/microservices/modulo-31.md:2385 — F164 paso 2: Istio ambient en kind (`istioctl install --set profile=ambient --skip-confirmation`, etiqueta `istio.io/dataplane-mode=ambient`, `istioctl waypoint apply -n tienda --enroll-namespace`), `k8s/ambient.yaml` aplicado; confirmar que la ServiceAccount del waypoint por defecto se llama `waypoint` (principal `cluster.local/ns/tienda/sa/waypoint`) y el exit code 56 de la política L7 sin waypoint. La lista de pods de `istio-system` está descrita, no vista.
- web/public/content/microservices/modulo-31.md:838 — F162: las secciones de RFC 8693 (§2.1, §2.2.1, §2.2.2, §4.1 `act`, §4.4 `may_act`) y de RFC 8705 (§3, `cnf`/`x5t#S256`) se tomaron del Módulo 9 y de fuentes secundarias (borrador draft-mcguinness-oauth-actor-profile-00, documentación de IBM Verify sobre tokens ligados a certificado); rfc-editor.org y datatracker no respondieron desde aquí. Confirmar números de sección y la frase de §4.1 sobre que solo cuenta el actor actual para el control de acceso.
- web/public/content/microservices/modulo-32.md:1 — precios de AWS, revisados el 2026-11-20 contra las páginas oficiales (las tablas siguen sin cargar desde aquí; se leyó el texto y los ejemplos de cada página). **Confirmados:** EKS 0.10 USD/h, Lambda 0.20 USD por millón y 0.0000166667 USD/GB-s (capa gratuita 1 M y 400 000 GB-s), Fargate Linux/x86 0.000011244 y 0.000001235 USD/s (ejemplo 1, N. Virginia), CloudWatch Logs 0.50 USD/GB y 0.03 USD/GB-mes, métricas 0.30 USD (ejemplos «based on US East (N. Virginia)»), X-Ray 0.000005 USD por traza con 100 000 gratis. **Corregido:** el tráfico entre zonas cuesta 0.01 USD/GB **en cada sentido** (página de VPC y blog de AWS «Exploring Data Transfer Costs for AWS Network Load Balancers»); `modelo.js` cobraba un solo sentido y ahora multiplica por 2: la partida pasa de 1.84 a 3.68 USD, el total de 396.30 a 398.14 USD, el costo unitario de 0.1321 a 0.1327 y la infravaloración de 126.00 a 127.84 USD (32.1 %); lección, `verificar.sh` y F168 actualizados y re-ejecutados con Node 26.13.1. **Por confirmar:** NAT gateway 0.045 USD/h y 0.045 USD/GB en la tabla de US East (N. Virginia): la página solo lo da en el ejemplo de US East (Ohio) y un blog de AWS dice «0.045 USD por GB en la mayoría de regiones»; mirarlo en la AWS Pricing Calculator.
- web/public/content/microservices/modulo-32.md:397 — F165 error común: nombre de la agrupación de Cost Explorer donde aparecen NAT gateway y transferencia de datos («EC2-Other»), escrito sin verlo.

## Fase 3 · Módulos 29 y 30 (modulo-33 y modulo-34, fichas F169–F176)

Todo el código Node.js, los tests (17 en modulo-33; 18 en modulo-34, 5 de ellos con PostgreSQL) y las demos se ejecutaron aquí con **Node 26.13.1**, Git 2.43.0, bash 5.2.21 y PostgreSQL 16.15 local: `./verificar.sh` de los dos módulos y `./verificar.sh --compose` de modulo-33 terminaron en `RESULTADO: OK`. El `docker-compose.yml` de modulo-34 se validó con `docker compose config -q`; no se pudo levantar (sin acceso a Docker Hub).

- examples/microservicios/modulo-34/verificar.sh:1 — ejecutar `./verificar.sh --compose` en el Mac (Docker Compose v5, imagen `postgres:18.7`): F175 con PostgreSQL 18.7 debe dar `pass 5` y la misma salida de la demo que con 16.15.
- web/public/content/microservices/modulo-34.md:1091 — F175 paso 2: salida de `docker compose exec postgres psql … -c "SELECT * FROM f175_pedidos" -c "SELECT * FROM f175_stock"` (aquí se comprobó el contenido con el `psql` local, no por `docker compose exec`).
- examples/microservicios/modulo-33/verificar.sh:1 — repetir `./verificar.sh` con bash 3.2 de macOS y el Git de Xcode (`git log --format=@@%s --name-only` debe listar los archivos en el mismo orden alfabético).
- examples/microservicios/modulo-34/verificar.sh:1 — repetir `./verificar.sh` con bash 3.2 de macOS; el test de latencia de F174 exige «al menos 10 veces más lento» (aquí ≈2000–4000 veces) y el de F176 un p95 ≤ 50 ms en `localhost`.

## Fase 3 · Módulos 31 y 32 (modulo-35 y modulo-36, fichas F177–F187)

Ejecutado aquí con **Node 26.13.1**: modulo-35 completo (`./verificar.sh --compose` en verde: 17 tests y los scripts
de F177–F180, con Git 2.43 y `node:sqlite`/SQLite 3.54.1) y modulo-36 (`./verificar.sh` en verde: 26 tests, scripts
de F181–F187, el limitador contra un **Redis 7.0.15 local** —no 8.10.2—, Gatling JS 3.16.101 a 60 reservas/s con y sin
`LIMITE_RPS=20` usando **OpenJDK 21.0.13** —no JDK 25— y `spring/jdk/*.java` con Java 21). El workflow de Temporal se
comprobó solo con `bundleWorkflowCode` (empaquetado), no contra un servidor. Lockfiles con npm 10.9.9. Sin acceso a
Docker Hub, temporal.download ni Maven Central (salvo `maven-metadata.xml` leídos por WebFetch el 2026-11-20).

- examples/microservicios/modulo-36/verificar.sh:1 — ejecutar `./verificar.sh --compose` en el Mac: `redis:8.10.2` con `docker compose up -d --wait` (healthcheck `redis-cli ping`), `limitador-redis.infra.js` (pass 1) y el error común con Redis («3 réplicas con LimitadorRedis:   10 de 100»), Gatling con JDK 25 y `(cd spring && ./mvnw -q test)`.
- web/public/content/microservices/modulo-36.md:1168 — F182 paso 2: `temporal server start-dev` + `proveedor-pagos.js` + `worker.js` + `iniciar.js`. Las tres líneas JSON del output esperado se **dedujeron del código y de los tests** (el orden de claves de `sagaReserva`), no se vieron; la captura de la UI (historial de `reserva-R-3` con `reembolsar` en la cola `cobros`) está descrita, no vista. Probar también «rompe algo» (worker parado, proveedor parado, la saga continúa).
- web/public/content/microservices/modulo-36.md:1290 — F182: `node --test f182-saga-temporal/temporal.infra.js` (createLocal descarga el CLI; o `TEMPORAL_ADDRESS=localhost:7233`), espera `pass 3`. Confirmar que `cause.message` de la ActivityFailure es «tarjeta rechazada: fondos insuficientes» y que `maximumAttempts: 0` con `scheduleToCloseTimeout` se comporta como sin límite de intentos (así lo dice `retry-policy.d.ts` de @temporalio/common 1.26.0).
- web/public/content/microservices/modulo-36.md:1343 — F182 pista Spring: `./mvnw -f spring/reservas/pom.xml test` (ReservaWorkflowTest, espera `Tests run: 3, Failures: 0`). **No se compiló**: confirmar con temporal-sdk 1.41.1 las APIs `io.temporal.workflow.Saga` (`new Saga(new Saga.Options.Builder().setParallelCompensation(false).build())`, `addCompensation(Functions.Proc)`, `compensate()`), `RetryOptions.newBuilder(RetryOptions)`, `setDoNotRetry` con el nombre completo de la clase de la excepción como tipo, `TemporalFailure.getOriginalMessage()`, `WorkerOptions.Builder.setMaxTaskQueueActivitiesPerSecond(double)`, `WorkflowServiceStubsOptions.setTarget` y `WorkflowClient.execute(saga::reservar, …)`. Arrancar también `spring/reservas` y `spring/pagos-externo` con `spring-boot:run` (Spring Boot 4.1.3, `spring-boot-starter-webmvc` y `-restclient`) y probar el POST con `Idempotency-Key`.
- web/public/content/microservices/modulo-36.md:1461 — F182 error común, párrafo de Java: el texto del *non-deterministic error* de Temporal Java al usar reloj o red dentro del workflow está descrito, no visto.
- web/public/content/microservices/modulo-36.md:1686 — F183 pista Spring: `./mvnw -f spring/gateway/pom.xml spring-boot:run` con Redis; comprobar 429 al superar `replenishRate: 50`/`burstCapacity: 100` por `X-Api-Key`, qué estado devuelve sin cabecera (la documentación nombra `deny-empty-key` y `empty-key-status-code`; el valor por defecto no se leyó) y las cabeceras de respuesta del `RedisRateLimiter` (no se nombran en la lección porque la página consultada no las lista). El predicado `Path=/reservas/**, /reservas` (dos patrones separados por coma) está escrito sin probar.
- web/public/content/microservices/modulo-36.md:2155 — F184 pista Spring: `./mvnw -f spring/carga/pom.xml gatling:test` con Gatling 3.16.1 y gatling-maven-plugin 4.21.12 (versiones leídas de `maven-metadata.xml`; la página de docs.gatling.io usa `MANUALLY_REPLACE_WITH_LATEST_VERSION`). Confirmar el DSL Java (`listFeeder(...).circular()`, `percentile(99).lt(300)`) y que `-Dtasa=…` llega a la simulación (con el plugin puede hacer falta `-Dgatling.jvmArgs` o `<jvmArgs>`).
- web/public/content/microservices/modulo-36.md:1782 — F183 paso 1 con `docker compose up -d --wait` y `REDIS_URL=redis://localhost:6379` (aquí se usó `redis-server --port 16379` de Redis 7.0.15; el script Lua usa `TIME` dentro de `EVAL`, permitido desde Redis 5 con replicación de efectos).
- web/public/content/microservices/modulo-35.md:1311 — F180: las referencias a Adam Tornhill (*Your Code as a Crime Scene*, hotspots e indentación como medida de complejidad) y al cuadrante de deuda técnica de Martin Fowler (deliberada/inadvertida, prudente/imprudente) se escribieron sin abrir la fuente aquí; confirmar títulos y términos. La página de Fowler sobre Strangler Fig (https://martinfowler.com/bliki/StranglerFigApplication.html) no se pudo abrir desde aquí.

## 2026-11-21 · Mac del dueño (Temurin 27.0.1.0.2 + Node 26.13.1 + Docker CLI sin daemon)

Ejecutado aquí, con salida en los artefactos del propio build:

- **Causa del «nada funcional» de los laboratorios Gradle**: los `build.gradle.kts` fijan
  `JavaLanguageVersion.of(25)` y sin repositorio de toolchains el build moría **en configuración**, antes de
  cualquier test. Medido: `modulo-5` → `Cannot find a Java installation … {languageVersion=25}` ·
  `BUILD FAILED in 7s`. Arreglo: `org.gradle.toolchains.foojay-resolver-convention` **1.0.0** (versión vista en
  plugins.gradle.org) en los 14 `settings.gradle.kts` del curso.
- `examples/microservicios/modulo-5/verificar.sh` → `RESULTADO: OK · Módulo 1 … verificado` en 46 s. Gradle
  descargó `OpenJDK25U-jdk_aarch64_mac_hotspot_25.0.5.1_2.tar.gz` a `~/.gradle/jdks/` y los logs de Spring
  dicen `using Java 25.0.5.1`. Contado sobre `*/build/test-results/test/TEST-*.xml`: **25 tests, 0 fallos,
  0 errores, 0 omitidos** (f017 6 · f018 4 · f019 1 · f020 6 · f022 5 · f023 1 · f024 2). Con esto se cierran
  los ítems `modulo-5.md:416` (F017 → `Tests run: 6`) y `modulo-5.md:769` (F018 → `Tests run: 4`).
- Configuración de los 11 builds con wrapper tras el arreglo (`./gradlew -q help`, código 0): modulo-5, -6, -7,
  -8, -9, -10, -11, -12, -13, -14, -15. Queda pendiente ejecutar sus tests: todos menos modulo-5 piden Docker.
- **Fallo real hallado y corregido** en `modulo-36/spring/carga/build.gradle.kts`: `simulation = "…"` dentro de
  `gatling { }` era una referencia inexistente (`Unresolved reference 'simulation'`, el build entero no
  configuraba). `javap` sobre `gatling-gradle-plugin-3.16.0.jar` muestra que la extensión solo tiene
  `gatlingVersion, scalaVersion, jvmArgs, systemProperties, environment, includes, excludes,
  includeMainOutput, includeTestOutput, enterprise`; la simulación vive en la **tarea**
  (`GatlingRunTask.setSimulationClassName`). Reescrito a
  `tasks.named<io.gatling.gradle.GatlingRunTask>("gatlingRun") { simulationClassName = … }`: `./gradlew -q help`
  → 0 y `./gradlew :carga:gatlingRun --dry-run` → `BUILD SUCCESSFUL` (la ejecución real sigue pendiente:
  necesita el sistema en marcha).
- `examples/microservicios/modulo-0` … `modulo-3` con `./verificar.sh` bajo **Node 26.13.1**: 8, 11, 10 y 20
  tests Node respectivamente, más las suites de Java/Git/Terminal, **0 fallos** en los cuatro (código 0).
- `examples/microservicios-spring/fase-1/proyecto-maven-tienda`: `mvn -B -ntp test` → **BUILD SUCCESS, 5 tests,
  0 fallos** en 5,5 s (Boot 4.1.3, `java.version 25`, host con JDK 27); `docker compose config` → 0; el POM es
  XML bien formado. Su `verify.sh` (ruta Maven-en-contenedor) **no** pudo ejecutarse: el daemon de Docker está
  caído y el guion sale con código 1, sin fingir éxito.

Sigue pendiente en este entorno: todo lo que necesite `docker compose up` (modulo-4 en adelante, CRaC, GraalVM
nativo, Toxiproxy, Kafka, Keycloak, Kubernetes) y las salidas literales que este Mac no produce (zsh, PowerShell,
`lsof`, números de parche de imágenes).

## Migración de Maven a Gradle (2026-11-20) · modulo-5 … modulo-16 y modulo-36/spring

Decisión del dueño (specs/021 §5): la pista Spring de Microservicios se construye con Gradle (Kotlin DSL, wrapper y
catálogo `gradle/libs.versions.toml`). Se quitaron `pom.xml`, `mvnw`, `mvnw.cmd` y `.mvn/` de esos laboratorios (salvo
`modulo-13/f069-escaneo/*/pom.xml`, que son el material que escanean Trivy, Snyk y `MiniEscaner`).

**Ejecutado aquí de verdad:** con Gradle 8.14.3 local (sin red, corriendo en JDK 21 con toolchain JDK 25.0.x) y JUnit
5.10.1 de `/usr/share/maven-repo`, sobre una copia reducida de modulo-5: `test` de `f017-java-moderno` (6 PASSED),
`f018-virtual-threads` (4 PASSED) y `f021-multimodulo:tienda-dominio` (3 PASSED) a través del build compuesto, `build`
de F021 con `tienda-api` reducido a Java puro, el error real de dependencia circular y el formato de un test fallido.
También `bash -n` de todos los `verificar.sh`, `./verificar.sh --solo-jdk` de modulo-11, 12 y 13 (RESULTADO: OK con JDK
25), `docker compose config -q` de modulo-5 y la sintaxis de los 13 catálogos TOML (y que cada `libs.…` usado existe).

**No ejecutado (el proxy responde 403 a services.gradle.org, plugins.gradle.org y Maven Central; no se rodeó):** ningún
build con Gradle 9.9.2, ni con los plugins de Spring Boot, dependency-management, GraalVM, Protobuf, Pact, SonarQube o
Gatling. Las salidas de Gradle de las lecciones están marcadas «pendiente de verificación en el Mac».

- examples/microservicios/modulo-5/gradle/wrapper/gradle-wrapper.properties:3 — wrapper escrito a mano (los 13 son iguales): `distributionUrl` de Gradle **9.9.2** (versión vigente según https://services.gradle.org/versions/current, leída el 2026-11-20; Spring Boot 4.1.3 admite «Gradle 8.x (8.14 or later) and 9.x», docs.spring.io/spring-boot/4.1/system-requirements.html). **Sin `distributionSha256Sum`**: https://gradle.org/release-checksums/ solo llegaba a 9.9.1 y el `.sha256` de services.gradle.org no se pudo leer. `gradle-wrapper.jar`, `gradlew` y `gradlew.bat` son los de Gradle 9.8.2 ya versionados en el repo (sha256 del jar `3b8a2577…68e98`, igual al oficial de 9.8.2). En el Mac, en cada laboratorio: `./gradlew wrapper --gradle-version 9.9.2 --gradle-distribution-sha256-sum <sha256 oficial>` y `./gradlew --version`.
- examples/microservicios/modulo-5/f024-graalvm-native/build.gradle.kts:8 — plugin `org.graalvm.buildtools.native` 1.1.18 (versión que indica la página de requisitos de Boot 4.1.3; no se pudo abrir plugins.gradle.org para confirmar que existe con ese número). `docker compose --profile native run --rm native-build` ejecuta `../gradlew --no-daemon nativeCompile` dentro de `ghcr.io/graalvm/native-image-community:25`: comprobar que el wrapper corre ahí y que el binario queda en `build/native/nativeCompile/f024-graalvm-native`.
- examples/microservicios/modulo-5/settings.gradle.kts:31 — `includeBuild("f021-multimodulo")` + tarea `test` de la raíz que depende de los tests del build incluido; `f021-multimodulo/settings.gradle.kts` toma el catálogo con `from(files("../gradle/libs.versions.toml"))`. Probado con Gradle 8.14.3; confirmar con 9.9.2 y con el plugin de Boot (que aparezca `tienda-api-1.0.0-plain.jar`).
- examples/microservicios/modulo-7/f034-pact-consumidor/build.gradle.kts:1 — plugin `au.com.dius.pact` 4.7.7: bloque `pact { broker { pactBrokerUrl } publish { pactDirectory } }` en Kotlin DSL, tareas `pactPublish` y `canIDeploy -Ppacticipant=… -PpacticipantVersion=…` (la guía de Pact solo trae ejemplos en Groovy), `systemProperty("pact.rootDir", …)` para que el contrato salga en `build/pacts`, y compatibilidad del plugin con Gradle 9.
- examples/microservicios/modulo-7/f034-pact-proveedor/build.gradle.kts:1 — `exclude("**/*Manual.class")` salvo `-Pbroker`, `dependsOn(":f034-pact-consumidor:test")` y las propiedades `-Ppactbroker.host/-Ppactbroker.port/-Ppact.verifier.publishResults`.
- examples/microservicios/modulo-7/f036-sonarqube/build.gradle.kts:1 — plugin `org.sonarqube` 7.5.0.8588 + `jacoco` (toolVersion 0.8.15): `../gradlew check sonar -Dsonar.token=…` desde `sonar/analizar.sh`, ruta `build/reports/jacoco/test/jacocoTestReport.xml` y `sonar.qualitygate.wait`.
- examples/microservicios/modulo-10/f048-grpc/build.gradle.kts:1 — plugin `com.google.protobuf` 0.9.6 con `protobuf { plugins { create("grpc") } }` (la documentación de Boot lo muestra en Groovy: `grpc {}`); carpeta real del código generado (la lección dice `build/generated/sources/proto`) y `demo-binario.sh`, que ahora busca `protoc` en `~/.gradle/caches/modules-2/files-2.1/com.google.protobuf/protoc/4.36.2`.
- examples/microservicios/modulo-11/f052-eureka/build.gradle.kts:1 — proyectos con dos clases `@SpringBootApplication` (también `f054-config` y `f056-bff`, y el cliente de consola de `modulo-10/f048-grpc`): `springBoot { mainClass }` desde `-Pprincipal=paquete.Clase`. Comprobar que `bootRun -Pprincipal=…` arranca la clase pedida y qué hace `bootJar`/`test` sin la propiedad (con Maven no se empaquetaban).
- examples/microservicios/modulo-14/f071-tracing/build.gradle.kts:20 — los perfiles Maven `otel`/`zipkin` son ahora `-Ptrazas=otel` (por defecto) y `-Ptrazas=zipkin`.
- examples/microservicios/modulo-15/f077-schema-registry-avro/build.gradle.kts:1 — sin plugin de Avro: tarea `generarAvro` (`JavaExec` de `org.apache.avro:avro-tools:1.12.2`, `compile -string schema src/main/avro build/generated-sources/avro`) enlazada con `sourceSets.main.java.srcDir(generarAvro)`; propiedad `org.apache.avro.SERIALIZABLE_PACKAGES` en la tarea `test`; repositorio de Confluent en `settings.gradle.kts`. Confirmar que `avro-tools` se resuelve sin transitivas y que la clase generada es igual a la de `avro-maven-plugin`.
- examples/microservicios/modulo-16/app/Dockerfile:8 — la etapa de compilación pasa de `maven:3.10.0-eclipse-temurin-25` a `eclipse-temurin:25-jdk` con el wrapper (`descargarDependencias` y `bootJar`, jar `build/libs/catalogo.jar`); el build de Gradle vive en `app/` y `verificar.sh` lo llama con `app/gradlew -q -p app test`. Medir de nuevo tamaños y capas `CACHED` (F081).
- examples/microservicios/modulo-36/spring/carga/build.gradle.kts:1 — plugin `io.gatling.gradle` 3.16.0 con `gatlingVersion` 3.16.1; la simulación se movió a `src/gatling/java`. Confirmar la sintaxis Kotlin del bloque `gatling { }`, que el plugin admite Gradle 9 (su documentación dice «tested against Gradle versions ranging from 7.1 to 8.6») y cómo llegan `-Dtasa`/`-Dsegundos` a la simulación.
- web/public/content/microservices/modulo-13.md:3795 — nota de F069: que Trivy escanea proyectos Gradle por `gradle.lockfile` y Snyk ejecutando Gradle está escrito sin probar.
- examples/microservicios/modulo-13/verificar.sh:64 — el paso previo a Trivy ya no usa `./mvnw` (solo `mvn` si está instalado); comprobar que Trivy resuelve `f069-escaneo` igual.

### Re-verificar con Gradle

`bash verificacion/microservicios/run.sh "modulo-N"` (o `./verificar.sh --compose` donde aplique) y revisar las salidas
de Gradle citadas en cada lección:

- modulo-5 (incluye `./verificar.sh --docker`: CRaC con `build/crac` y binario nativo)
- modulo-6
- modulo-7
- modulo-8
- modulo-9
- modulo-10
- modulo-11
- modulo-12
- modulo-13
- modulo-14 (también `-Ptrazas=zipkin`)
- modulo-15
- modulo-16
- modulo-36 (`./verificar.sh --compose`: `(cd spring && ./gradlew -q test)` y `./gradlew :carga:gatlingRun`)


## 2026-11-21 · Lote con Docker arriba (modulo-6 … modulo-12) — 7 módulos en verde

Con el daemon de Docker en marcha se ejecutó `bash verificacion/microservicios/run.sh "modulo-N"` para cada módulo;
`PASS` exige código 0 **y** la línea `RESULTADO: OK` en el log. Contado sobre `*/build/test-results/test/TEST-*.xml`:
**194 tests en total, 0 fallos, 0 omitidos**. Ojo: `verificacion/microservicios/.gitignore` ignora `logs/`, así que los
logs completos se quedan en esta máquina; lo que viaja al repositorio es lo citado literalmente abajo y en las lecciones.

| módulo | resultado | tiempo | tests por ficha |
|---|---|---|---|
| modulo-5 | PASS (mañana, sin Docker) | 46 s | f017 6 · f018 4 · f019 1 · f020 6 · f022 5 · f023 1 · f024 2 = **25** |
| modulo-6 | PASS | 32 s | f025 4 · f026 3 · f027 3 · f028 4 · f029 4 · f030-flyway 3 · f030-liquibase 2 · f031 6 = **29** |
| modulo-7 | PASS | 62 s | f032 11 · f033 3 · f034-consumidor 2 · f034-proveedor 2 · f035 4 · f036 6 = **28** |
| modulo-8 | PASS | 20 s | f037 3 · f038 3 · f039 4 · f040 22 = **32** (+ 9 tests de Python) |
| modulo-9 | PASS | 13 s | f041 5 · f042 7 · f043 2 · f044 5 · f045 10 · f046 2 = **31** |
| modulo-10 | PASS | 27 s | f047 3 · f048 4 · f049 4 · f050 3 · f051 6 = **20** |
| modulo-11 | PASS | 46 s | f052-consul 1 · f052-eureka 1 · f053 3 · f054 2 · f055 1 · f056 1 = **9** |
| modulo-12 | PASS | 45 s | f057 5 · f058 3 · f059 4 · f060 1 = **13** |

Salidas literales nuevas que antes no estaban medidas (útiles para las lecciones):

- **modulo-6**: `Container modulo-6-postgres-1 Healthy` y `modulo-6-mysql-1 Healthy` antes de los tests; los logs
  muestran el `drop table … cascade` de cierre de Hibernate sobre ambos motores.
- **modulo-7 · F034 con Gradle**: `Publishing 'tienda-web-catalogo.json' ... OK`,
  `All required verification results are published and successful` y en `canIDeploy`, `Computer says yes \o/`.
  El plugin `au.com.dius.pact` 4.7.7 funciona sobre Gradle 9.9.2: se cierra el ítem de la línea 440 de arriba.
  Aviso para el alumno: `ContratoDesdeBrokerManual.java` compila con `uses or overrides a deprecated API`.
- **modulo-7 · F036 con Gradle**: `RESULTADO SONAR: OK` — el plugin `org.sonarqube` 7.5.0.8588 + JaCoCo 0.8.15
  analizan con Gradle 9.9.2; se cierra el ítem de la línea 442.
- **modulo-8**: los 9 simuladores corrieron con **Python 3.15.2** (`Ran 9 tests in 2.498s · OK`), no con la 3.13.18
  que citan las lecciones y este registro; hay que actualizar la versión declarada o fijar el intérprete.
- **modulo-11 · demos de JDK puro**: `t=0s instancias de catalogo: {catalogo-1=http://10.0.0.11:8081, catalogo-2=…}`,
  `[registro] expulsada catalogo-2 (sin latido > 3000 ms)` y en el gateway `404 {"error":"SIN_RUTA","ruta":"/api/pagos/1"}`
  y `502 {"error":"SERVICIO_NO_RESPONDE"}`.
- **modulo-12 · demos de JDK puro**: `resultado=TimeoutException tras 518 ms (sin límite habrías esperado 2000 ms)`,
  `intento 1/2: ErrorDelServidor HTTP 503` → `intento 3: OK {"sku":"7","stock":12}`, y el estado del
  CircuitBreaker impreso en cada llamada.

**Qué NO prueba este lote**: que el texto de cada lección coincida con la salida. Los ítems por puntero
(`web/public/content/microservices/modulo-N.md:…`) siguen abiertos hasta pegar la salida real en la ficha, y muchos
citan formato Maven (`Tests run: 8`) cuando el build ya es Gradle: hay que reescribir esas salidas al formato Gradle.

**Corte por reinicio de la máquina**: `modulo-13` quedó interrumpido a mitad (sin `RESULTADO`); avanzó hasta
`-- F064 contra Keycloak real` (`GET /pedidos con ana -> 200 · GET /admin/reportes con ana -> 403 · sin token -> 401`),
el paso de Vault y el encabezado de Trivy. Queda por repetir 13, 14, 15, 16 y 36. El daemon de Docker volvió a caer
con el reinicio, así que nada de eso puede correrse hasta que se levante.

## 2026-11-21 · Cierres de la tarde (wrapper con checksum, F021, F036 y las advertencias de las lecciones)

- **`distributionSha256Sum` añadido a los 13 `gradle-wrapper.properties`** (`modulo-5`…`modulo-11`, `modulo-13`…`modulo-16/app`,
  `modulo-36/spring`). Valor: `971fcd7150ca4ba04852c0b2ca0d2d0ab9468e14b03473eab19528809914c76b`, visto en
  `https://services.gradle.org/distributions/gradle-9.9.2-bin.zip.sha256` y **comprobado por tres vías**: (1) el zip
  oficial descargado aquí pesa 134.970.550 bytes y su `shasum -a 256` da ese valor; (2) con un `GRADLE_USER_HOME` limpio,
  `./gradlew --version` descarga, valida y escribe el marcador `.ok` (Gradle 9.9.2, build 2026-11-19 19:52 UTC);
  (3) prueba negativa: con un suma falsa en una copia fuera del repo, Gradle se niega a arrancar y muestra
  `Expected checksum: '0000…' · Actual checksum: '971fcd71…c76b'`. Se cierra el ítem de la línea 437 (faltaba la suma).
- **F021 multi-módulo con Gradle 9.9.2 + plugin de Spring Boot**: `./gradlew :f021-multimodulo:tienda-api:build` → código 0 y
  aparecen los tres jars que promete la lección: `tienda-dominio-1.0.0.jar` 1.693 B · `tienda-api-1.0.0-plain.jar` 2.171 B ·
  `tienda-api-1.0.0.jar` 19.992.406 B. Números ya pegados en `modulo-5.md` (paso 4 de F021).
- **F036 JaCoCo**: `./gradlew :f036-sonarqube:check` → 0 y `f036-sonarqube/build/reports/jacoco/test/` contiene `html/` y
  `jacocoTestReport.xml`; dentro de `html/`, `index.html`, `jacoco-resources`, `jacoco-sessions.html` y la carpeta de paquete
  `academia.calidad`. Actualizado el paso correspondiente de `modulo-7.md`.
- **Barrido de advertencias obsoletas**: 51 menciones a «salida de Gradle pendiente de verificación en el Mac» en
  `modulo-5`…`modulo-12` se convirtieron en «verificada el 2026-11-21 con Gradle 9.9.2 / Java 25.0.5.1 / Compose v5.7.1»,
  **después** de cruzar cada cifra prometida (`N líneas PASSED`) contra los `TEST-*.xml` medidos: todas coinciden
  (p. ej. f017 6, f032 11, f040 22, f045 10). Se conservó la advertencia en los dos pasos que no se han ejecutado:
  la demo `--docker` de CRaC y la de GraalVM nativo.
- **Chequeo de reconocimiento, no una puerta aflojada**: el formato `PASSED` por test que enseñan las lecciones es real
  porque cada `build.gradle.kts` declara `testLogging { events("passed", "skipped", "failed") }`; verificado con
  `./gradlew :f017-java-moderno:test --rerun-tasks --console=plain` (6 líneas `PASSED` + `BUILD SUCCESSFUL in 1s`).

Correcciones de frescura medidas hoy en `docs/microservicios/08-herramientas-y-versiones.md` (Fase 0):

- **Docker Compose**: la fila decía v5.6.1; `api.github.com/repos/docker/compose/releases/latest` devuelve **v5.8.0**
  publicado 2026-11-17. La casilla sigue ☐ porque en esta Mac `docker compose version` da **v5.7.1**.
- **Maven**: 3.10.1 confirmado en `maven.apache.org/download.cgi`; en esta Mac hay **3.10.0** (Homebrew), casilla ☐.
- **Java, Node, Git, Gradle**: casillas ✔ con el comando y el valor medidos (`v26.13.1`, `2.54.0 Apple Git-157`,
  27.0.1.0.2 en el host con 25.0.5.1 autoaprovisto en los builds, y el Gradle de arriba). Las lecciones que dicen
  «Compose v5.6.1 **o posterior**» (`modulo-4`, `modulo-21`, `modulo-22`, `modulo-27`, READMEs) siguen siendo ciertas:
  es suelo, no pin, así que no se tocaron.

Sigue abierto tras el reinicio de la máquina (daemon de Docker caído): repetir `modulo-13` (se cortó en Trivy),
`modulo-14`, `modulo-15`, `modulo-16` y `modulo-36`, más `modulo-5 --docker` (CRaC/nativo). Bloqueado mientras no
vuelva Docker.

## 2026-11-21 · Lote de la tarde (modulo-13 … modulo-16): dos causas de fallo separadas del laboratorio

Resumen del lote lanzado con `LIMITE_LAB=2400 bash verificacion/microservicios/run.sh "modulo-1[3456]"`, tomado
literal de `/tmp/ms-lote3.log` y de `verificacion/microservicios/logs/`:

| módulo | resultado | duración | medida |
| --- | --- | --- | --- |
| modulo-13 | PASS | 49 s | 39 tests (f061 6 · f062 8 · f063 3 · f064 6 · f065 12 · f066 2 · f068 2); Trivy «antes: exit 1 · después: exit 0» |
| modulo-14 | PASS | 65 s | 32 tests (f070 2 · f071 1 · f072 2 …); perfiles `-Ptrazas=otel` y `-Ptrazas=zipkin`; cardinalidad medida 1000→8000 series frente a 1003→18 series |
| modulo-15 | **FAIL rc=1** | 47 s | 1 ✘ de 16 pasos: «JDK 25». ✔ Compose v5.7.1, simulador del particionador, Kafka+RabbitMQ+NATS healthy, Schema Registry, F075–F080, grupo `inventario` en 3 particiones, `cobros-dlt` con 3 particiones, subject `pedidos-avro-value`, quorum queue y stream `PAGOS` |
| modulo-16 | en curso | — | ✘ en F085 (metrics-server), resto por decidir al cerrar el lote |

**Causa 1 · el chequeo de JDK de modulo-15 miraba el PATH equivocado.** El paso era
`paso "JDK 25" contiene 'version "25' java -version`, y el `java` del PATH de esta Mac es Temurin 27
(`openjdk version "27.0.1.0.2" 2026-10-21`), mientras que los builds usan el 25 que aprovisiona Gradle en
`~/.gradle/jdks/eclipse_adoptium-25-aarch64-os_x.2/jdk-25.0.5.1+2/Contents/Home/bin/java`
(`openjdk version "25.0.5.1" 2026-11-17 LTS`, medido). El laboratorio sí pasaba: fallaba el reconocimiento.
Se corrigió en `examples/microservicios/modulo-15/verificar.sh`: `buscar_jdk25` recorre los candidatos
(carpetas de JDK 25 de `~/.gradle/jdks`, `/Library/Java/JavaVirtualMachines`, `~/Library/Java/JavaVirtualMachines`,
`JAVA_HOME`) y acepta solo el que **declara 25 en su propio `-version`**; ese binario se usa también en el
simulador del particionador, que antes corría con el 27 del PATH. No se aflojó el requisito: sigue exigiendo
`version "25`. Prueba aislada del bloque (13:26): con el HOME real → `OK JDK 25` + `SIMULADOR OK`; con
`HOME=/nonexistent` → `FALLO JDK 25` y se imprime el 27 del PATH. Nota: `/usr/libexec/java_home -v 25`
devuelve en esta máquina la ruta de Temurin 27 con rc=0, así que **no** sirve como prueba de que exista un 25;
por eso la comprobación se hace sobre la salida del propio binario.

**Causa 2 · metrics-server no puede descargar en el nodo kind (entorno, no ficha).** `pruebas/f085-hpa.sh`
aplica `components.yaml` de la release v0.9.0 y luego espera el rollout; el pod quedó en `ImagePullBackOff` con
este mensaje literal (medido con `kubectl get pod -o jsonpath` a las 13:23):

```
failed to pull and unpack image "registry.k8s.io/metrics-server/metrics-server:v0.9.0":
failed to do request: Head "https://registry.k8s.io/v2/metrics-server/metrics-server/manifests/v0.9.0":
proxyconnect tcp: dial tcp 127.0.0.1:49153: connect: connection refused
```

El entorno de esta sesión define `HTTP_PROXY`/`HTTPS_PROXY` apuntando a un proxy local en `127.0.0.1:49153`
(token de por medio, no se copia aquí); kind propaga esas variables al interior del nodo, y dentro del nodo
`127.0.0.1` es el propio nodo, donde nadie escucha. Por eso el `apply` (hecho desde el host) funciona y el
`pull` (hecho por containerd dentro del nodo) no. El host sí tiene salida: `curl -s -o /dev/null -w %{http_code}
https://registry.k8s.io/v2/` devuelve `401` (llega al registro) y `docker pull registry.k8s.io/metrics-server/metrics-server:v0.9.0`
terminó bien (`Digest: sha256:d9862115e7c7881280d3d75ca26bda8ffc0fc213315979575bf23ce9826205c0`).

El arreglo **no** es `kind load docker-image`, que es lo primero que se intenta y tampoco funciona aquí:

```
$ kind load docker-image registry.k8s.io/metrics-server/metrics-server:v0.9.0 --name academia-m12
ERROR: failed to load image: command "docker exec --privileged -i academia-m12-control-plane ctr
--namespace=k8s.io images import --all-platforms --digests --snapshotter=overlayfs -" failed with error: exit status 1
Command Output: ctr: content digest sha256:25d291fde59974547bac6f07fa9d6cf6f5bedd1f19d60c893311c5e741e0a42f: not found
```

kind v0.33.0 no ofrece `--platforms` en `kind load docker-image` (su `--help` solo lista `-h`, `--name` y
`--nodes`), y el `ctr images import --all-platforms` que ejecuta exige el contenido de todas las plataformas
del índice, cuando en el almacén de Docker Desktop solo está la local: `docker image inspect
-f '{{.Os}}/{{.Architecture}}'` → `linux/arm64`. Lo que sí funcionó, medido a las 13:31:

```
$ docker save registry.k8s.io/metrics-server/metrics-server:v0.9.0 \
    | docker exec -i academia-m12-control-plane ctr -n k8s.io images import -
$ docker exec academia-m12-control-plane crictl images | grep metrics
registry.k8s.io/metrics-server/metrics-server   v0.9.0   37ceda8805d2e   20.9MB
```

Con la imagen ya en el nodo basta el `imagePullPolicy: IfNotPresent` del manifiesto oficial: al borrar los pods
atrapados en `ImagePullBackOff`, el pod nuevo pasó a `1/1 Running` en 66 s y las métricas volvieron
(`kubectl top nodes` → `academia-m12-control-plane 184m 1% 1748Mi 22%`; `kubectl top pods -n catalogo` → dos
pods `catalogo-…` a 4m / 150Mi). Ese es el criterio que quedó aplicado en `modulo-16/pruebas/f085-hpa.sh:8-22`
y en `modulo-27/verificar.sh:118-132` (allí con v0.9.1): mirar primero `crictl images`, y si falta la imagen,
bajarla en el host e inyectarla con `docker save | docker exec -i "$(kind get nodes --name …)" ctr -n k8s.io
images import -`.

Pendiente al cerrar el lote: reejecutar modulo-15 y modulo-16 completos (modulo-36 sigue en cola) y registrar
sus `RESULTADO:` literales. Los dos parches están aplicados y probados por piezas (detector de JDK 25 en
positivo y en negativo; carga de la imagen en el nodo y métricas de vuelta), pero **ningún módulo se marca como
verificado** hasta tener su `RESULTADO: OK` entero.

## 2026-11-21 · Estado de `./scripts/validate.sh` al commitear este bloque

El pipeline se detiene en `python3 scripts/validate_lesson_labs.py` (rc=1) con un único mensaje:
`examples/microservicios-spring no lo cita ninguna lección`. Medido con el mismo criterio que el script:

- laboratorios de `examples/` **versionados**: 59 · citados por alguna lección: **59** · huérfanos versionados: **0**.
- el único directorio sin citar existe solo en disco (creado hoy 11:56, pertenece a la corriente de `specs/022`/`specs/023`,
  que aún no lo enlaza desde ninguna lección; sus dos archivos de spec tampoco están versionados).

Es decir: **el árbol que se commitea pasa esa puerta**; la puerta falla por un directorio no versionado de otra sesión
activa. No se tocó ese directorio y no se modificó el detector. Los demás pasos, ejecutados uno a uno, dan rc=0:
`audit_visual_aids` (avisos informativos de capturas pendientes), `audit_lesson_assets: ok`,
`build_zero_to_master_report: al día`, `audit_track_master_prompt: al día`, `build_curriculum_catalog: al día (16 cursos)`,
`validate_fichas: ok` y el recuento de 16 cursos con las cuatro etapas y 0 anclas rotas.
