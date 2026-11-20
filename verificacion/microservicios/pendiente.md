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
