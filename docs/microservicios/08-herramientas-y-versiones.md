ESTADO: completo

# 8 · Checklist de herramientas y versiones

> Entregable 8 del prompt del dueño. Regla de specs/018: se usa **la versión estable (GA) más reciente** de
> cada herramienta el día de escribir, comprobada en su fuente oficial; si la más reciente no es compatible con el
> resto del curso, se usa **la más reciente compatible** y se explica por qué. Los mínimos del prompt (Java 21,
> Spring Boot 3.3+, Node 20 LTS, NestJS 10+, Kafka 3.6+, Temporal 1.22+, Kubernetes 1.28+, Keycloak 24+,
> Testcontainers 1.19+) quedan como **suelo de referencia**, no como objetivo.
>
> **Fecha de consulta de todas las filas: 2026-11-19.** Las versiones de paquetes npm se leyeron del registro
> oficial (`https://registry.npmjs.org/<paquete>`, campo `dist-tags.latest` y `time`). Las de GitHub, del botón
> *Latest release* del repositorio oficial. Cuando una página no muestra el año de la publicación, la columna
> «Publicada» lo indica con «(año no visible)».

## Cómo usar esta checklist

1. Marca cada casilla cuando el comando de comprobación te devuelva la versión indicada (o un parche posterior de
   la misma línea).
2. No mezcles líneas: en la Fase 1 todo lo de Spring lo fija el BOM de Spring Boot y de Spring Cloud; en la
   Fase 2 todo lo de NestJS lo fija la línea `^12`.
3. Si al empezar un módulo ves una versión más nueva, revisa la columna «Por qué» antes de subir: casi siempre
   hay una dependencia que no la acepta todavía.

## Decisiones de compatibilidad (léelas primero)

| Decisión | Más reciente GA | Elegida | Por qué |
|---|---|---|---|
| **Java** | JDK 27 (GA 2026-09-15, no LTS) | **JDK 25 LTS (25.0.5)** | Spring Boot 4.1 acepta hasta Java 27, pero **GraalVM** solo publica distribuciones sobre JDK 25 (línea 25.x hasta 2027-02) y **Azul Zulu con CRaC** se ofrece para 17, 21, 24, 25 y 26, no 27. Los temas «CRaC» y «GraalVM Native Image» del Módulo 1 exigen el mismo JDK para todo el curso, así que se usa la LTS 25. |
| **Spring Boot** | 4.2.0 (etiqueta `v4.2.0` del 2026-11-19) | **4.1.3** | La línea 4.2 no tiene todavía un Spring Cloud GA: Spring Cloud 2026.0 (Paddington) va por hitos y Spring Cloud 2025.1.x solo soporta Spring Boot 4.0.x y 4.1.x. Los Módulos 7, 8 y 9 necesitan Spring Cloud (Gateway, Eureka, Config, LoadBalancer, CircuitBreaker). |
| **Spring Cloud** | 2025.1.4 (Oakwood) | **2025.1.4** | Compatible con Spring Boot 4.1.x desde 2025.1.2. |
| **Librerías Java (Kafka client, Flyway, Liquibase, Testcontainers, Hibernate, JUnit, Mockito, Micrometer, OpenTelemetry API…)** | p. ej. Flyway 13.13.0, Micrometer 1.18.0 | **las que gestiona el BOM de Spring Boot 4.1.3** | Spring Boot prueba sus autoconfiguraciones con esas versiones exactas. Flyway 13 y Micrometer 1.18 llegan con Spring Boot 4.2, no con 4.1. Nunca fijes a mano una versión que el BOM ya gestiona. |
| **Node.js** | Node 26 (LTS, 26.13.1) | **Node 26 LTS** | Es la LTS más reciente. Todas las dependencias de la Fase 2 la aceptan (Testcontainers `>=22.22`, opossum `^26 \|\| ^24 \|\| ^22`, @nestjs/schematics `>=26.0.0`, Prisma `>=24.0`). Node 20 (mínimo del prompt) está en fin de vida (último: 20.20.2). |
| **TypeScript** | 7.0.2 | **6.0.3** | `@nestjs/cli` 12.0.13 trae `typescript ~6.0.2` como dependencia y `ts-jest` 29.4.15 declara `typescript >=4.3 <7`. Toda la Fase 2 usa la misma versión para no tener dos compiladores. |
| **Kafka (broker)** | 4.4.0 (2026-10-22) | **4.4.0** | El cliente Java de Spring Boot 4.1.3 es `kafka-clients` 4.2.2; los clientes 4.x hablan con brokers 4.4 sin problema. Confluent Platform 8.4 (Schema Registry) está basada en Kafka 4.4.x. |
| **Kubernetes** | 1.37.1 (2026-09-15) | **1.37** | Helm 4.3 soporta 1.34–1.37 e Istio 1.32 soporta 1.33–1.37. |
| **Prisma** | `latest` de npm apunta a `8.0.0-rc.34` (pre-release) | **7.10.1** | La etiqueta `latest` de npm es una release candidate; la estable más reciente es 7.10.1. |
| **Cliente NATS para Node** | paquete `nats` 2.29.3 (deprecado) | **`@nats-io/transport-node` 3.5.0** | npm marca `nats` como «Package moved. Use @nats-io/transport-node». |
| **Linkerd** | stable 2.20 (2026-06-23, solo artefactos de proveedores) | **edge-26.11.2** para el laboratorio | El proyecto open source ya no publica artefactos estables; la estable la distribuye Buoyant Enterprise. Para un laboratorio gratuito se usa la edge; si prefieres solo GA, usa Istio 1.32 en el Módulo 27. |

## Fase 0 y base común

| ✔ | Herramienta | Mínimo del prompt | Versión elegida | Publicada | Comprobación | Fuente oficial |
|---|---|---|---|---|---|---|
| ☐ | Java (OpenJDK) | Java 21 | **25.0.5 (LTS)** — JDK 27 es la GA más nueva, ver decisiones | 25 GA 2025-09-16; 25.0.5 en la CPU de octubre de 2026 | `java -version` | https://openjdk.org/projects/jdk/ · https://www.oracle.com/java/technologies/javase/25u-relnotes.html · https://www.infoq.com/news/2026/09/java27-released |
| ☐ | Node.js | Node 20 LTS | **26.13.1 (LTS «Lithium»)** | 2026-11-10 | `node -v` | https://nodejs.org/en/about/previous-releases |
| ☐ | Git | — | la que traiga tu sistema (2.4x) | — | `git --version` | https://git-scm.com/downloads |
| ☐ | Docker Engine | — | **29.10.0** | 2026-11-16 | `docker version` | https://docs.docker.com/engine/release-notes/ |
| ☐ | Docker Compose | — | **v5.6.1** | 21 oct (año no visible) | `docker compose version` | https://github.com/docker/compose/releases/latest |
| ☐ | Maven | — | **3.10.1** (Maven 4 sigue en `4.0.0-rc-7`, no apto para producción) | — | `mvn -v` | https://maven.apache.org/download.cgi |
| ☐ | Gradle (build de la pista Spring desde el 2026-11-20; Maven queda como equivalencia) | — | **9.9.2** por el wrapper (corre en JVM 17–27) | 2026-11-19 | `./gradlew -v` | https://docs.gradle.org/current/userguide/compatibility.html |

## Fase 1 · Spring Boot

| ✔ | Herramienta | Mínimo del prompt | Versión elegida | Publicada | Comprobación | Fuente oficial |
|---|---|---|---|---|---|---|
| ☐ | Spring Boot | 3.3+ | **4.1.3** (la GA más reciente es 4.2.0; ver decisiones) | 4.1.0 el 2026-06-10; 4.1.2 el 22 oct; 4.1.3 figura como GA en docs.spring.io/spring-boot/4.1 al consultar el 2026-11-19 (si tu repositorio Maven aún no la tiene, usa 4.1.2) | `<parent>` del `pom.xml` | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html · https://github.com/spring-projects/spring-boot/releases |
| ☐ | Spring Framework | — | **7.0.11** (gestionada por Boot) | — | `mvn dependency:tree \| grep spring-core` | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html |
| ☐ | Spring Cloud | — | **2025.1.4 (Oakwood)** | — | BOM `spring-cloud-dependencies` | https://spring.io/projects/spring-cloud · https://docs.spring.io/spring-cloud-release/reference/index.html |
| ☐ | Spring Cloud Gateway | — | **5.0.4** (del tren 2025.1.4) | — | árbol de dependencias | https://docs.spring.io/spring-cloud-release/reference/index.html |
| ☐ | Eureka (Spring Cloud Netflix) | — | **5.0.3** (del tren 2025.1.4) | — | árbol de dependencias | https://docs.spring.io/spring-cloud-release/reference/index.html |
| ☐ | Spring Cloud Config / Consul / OpenFeign / Commons (LoadBalancer) / CircuitBreaker | — | **5.0.6 / 5.0.4 / 5.0.4 / 5.0.4 / 5.0.3** | — | árbol de dependencias | https://docs.spring.io/spring-cloud-release/reference/index.html |
| ☐ | Spring for GraphQL | — | **2.0.7** (gestionada) | — | árbol de dependencias | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html |
| ☐ | Spring gRPC | — | **1.1.2** (gestionada) · grpc-java **1.84.1** (gestionada; la más nueva es v1.85.1) | — | árbol de dependencias | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html · https://github.com/grpc/grpc-java/releases/latest |
| ☐ | Spring Modulith | — | **2.1.3** (construida sobre Spring Boot 4.1.3) | — | árbol de dependencias | https://spring.io/projects/spring-modulith |
| ☐ | Spring Security | — | **7.1.3** (gestionada) | — | árbol de dependencias | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html |
| ☐ | Spring Kafka / Spring AMQP | — | **4.1.3 / 4.1.3** (gestionadas) | — | árbol de dependencias | ídem |
| ☐ | Hibernate ORM | — | **7.4.15.Final** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | Jackson | — | **3.1.8** (`tools.jackson.core`; Jackson 2.21.8 queda para compatibilidad) | — | árbol de dependencias | ídem |
| ☐ | JUnit 5 → JUnit Jupiter | JUnit 5 | **6.0.3** (gestionada; JUnit 6 sigue usando la API Jupiter que enseña el Módulo 3) | — | árbol de dependencias | ídem |
| ☐ | Mockito | — | **5.23.0** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | AssertJ | — | **3.27.7** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | Testcontainers (Java) | 1.19+ | **2.0.5** (gestionada por Boot y última *Latest release* del repo) | 20 abr (año no visible) | árbol de dependencias | https://github.com/testcontainers/testcontainers-java/releases/latest |
| ☐ | Pact JVM | — | **4.7.7** | 4 nov (año no visible) | árbol de dependencias | https://github.com/pact-foundation/pact-jvm/releases/latest |
| ☐ | Pact Broker | — | **2.124.0** | 11 nov (año no visible) | `GET /diagnostic/status/heartbeat` | https://github.com/pact-foundation/pact_broker/releases/latest |
| ☐ | ArchUnit | — | **1.5.1** | 25 sep (año no visible) | árbol de dependencias | https://github.com/TNG/ArchUnit/releases/latest |
| ☐ | SonarQube | — | **Community Build 26.11.0.134175** (gratuita) · Server LTA 2026.5.5 | — | `GET /api/server/version` | https://www.sonarsource.com/products/sonarqube/downloads/ |
| ☐ | Flyway | — | **12.4.0** (gestionada por Boot 4.1.3; la más nueva es 13.13.0 del 2026-11-19, que llega con Boot 4.2) | — | árbol de dependencias | https://documentation.red-gate.com/fd/release-notes-for-flyway-engine-179732572.html |
| ☐ | Liquibase | — | **5.0.4** (gestionada y última Community) | 2026-08-20 | árbol de dependencias | https://www.liquibase.com/download-community |
| ☐ | Driver PostgreSQL JDBC / MySQL Connector/J / MongoDB Java | — | **42.7.14 / 26.10.0 / 5.8.1** (gestionados) | — | árbol de dependencias | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html |
| ☐ | Resilience4j | — | **2.4.0** | 14 mar (año no visible) | árbol de dependencias | https://github.com/resilience4j/resilience4j/releases/latest |
| ☐ | Micrometer / Micrometer Tracing | — | **1.17.3 / 1.7.3** (gestionadas; 1.18.0 llega con Boot 4.2) | — | árbol de dependencias | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html |
| ☐ | OpenTelemetry API (Java) / agente Java | — | **1.62.0** (gestionada) / agente **v2.33.1** | agente: 26 oct (año no visible) | `java -javaagent:... -version` | ídem · https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest |
| ☐ | Zipkin Reporter | — | **3.5.3** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | Lettuce (cliente Redis) | — | **7.5.2.RELEASE** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | RabbitMQ Java client | — | **5.37.1** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | Kafka client Java | — | **4.2.2** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | Protobuf Java | — | **4.36.2** (gestionada) | — | árbol de dependencias | ídem |
| ☐ | Tomcat embebido | — | **11.0.27** (gestionada) | — | log de arranque | ídem |
| ☐ | GraalVM Community (Native Image) | — | **GraalVM CE para JDK 25** (línea 25.x; feature release del 2026-11-03) con Native Build Tools 1.1.14 | 2026-11-03 | `native-image --version` | https://www.graalvm.org/release-calendar/ · https://docs.spring.io/spring-boot/system-requirements.html |
| ☐ | CRaC | — | **Azul Zulu 25 con CRaC** (CRaC completo solo en Linux x64/ARM64; en macOS y Windows es simulado, solo para desarrollo) | — | `java -XX:CRaCCheckpointTo=cr -version` | https://docs.azul.com/crac/azul-zulu-zing-crac-compared |
| ☐ | Gatling | — | **3.16.1** · `gatling-maven-plugin` **4.21.12** | 3.16.1 el 2026-11-16 (`maven-metadata.xml` de `io.gatling:gatling-core`); plugin 4.21.12 el 2026-09-07 | `mvn gatling:test` | https://github.com/gatling/gatling/releases/latest · https://repo1.maven.org/maven2/io/gatling/gatling-maven-plugin/maven-metadata.xml |
| ☐ | Temporal Java SDK (`temporal-sdk`, `temporal-testing`) | — | **1.41.1** (consultado el 2026-11-20; la *Latest release* de GitHub vista el 2026-11-19 era 1.40.0) | 2026-11-16 | árbol de dependencias | https://repo1.maven.org/maven2/io/temporal/temporal-sdk/maven-metadata.xml · https://github.com/temporalio/sdk-java/releases/latest |

## Fase 2 · Node.js (versiones del registro npm)

| ✔ | Paquete | Mínimo del prompt | Versión elegida | Publicada | Nota |
|---|---|---|---|---|---|
| ☐ | `typescript` | — | **6.0.3** (la más nueva es 7.0.2) | 2026-04-16 | ver decisiones |
| ☐ | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/microservices`, `@nestjs/testing` | NestJS 10+ | **12.5.1** | 2026-11-16 | `engines.node >= 20` |
| ☐ | `@nestjs/cli` | — | **12.0.13** | 2026-11-13 | trae `typescript ~6.0.2` |
| ☐ | `@nestjs/cqrs` | — | **12.1.3** | 2026-11-13 | Módulo 22 |
| ☐ | `@nestjs/swagger` | — | **12.1.2** | 2026-11-13 | OpenAPI |
| ☐ | `express` | — | **5.3.0** | 2026-10-09 | la línea 4 queda en `latest-4` (4.22.3) |
| ☐ | `zod` / `class-validator` / `class-transformer` | — | **4.6.7 / 0.15.1 / 0.5.1** | 2026-10-12 / 2026-02-26 / — | |
| ☐ | `swagger-ui-express` | — | **5.0.1** | 2024-05-31 | |
| ☐ | `mongoose` / `mongodb` | — | **9.12.2 / 7.9.1** | 2026-11-16 / 2026-11-19 | |
| ☐ | `prisma` y `@prisma/client` | — | **7.10.1** | 2026-10-15 | `latest` de `prisma` es una RC |
| ☐ | `sequelize` / `pg` / `mysql2` | — | **6.37.8 / 8.23.1 / 3.24.6** | 2026-03-07 / 2026-09-30 / 2026-10-13 | |
| ☐ | `jest` / `ts-jest` | — | **30.5.2 / 29.4.15** | 2026-09-18 / — | |
| ☐ | `supertest` | — | **7.3.2** | 2026-11-07 | |
| ☐ | `@pact-foundation/pact` | — | **17.1.4** | 2026-09-07 | `engines.node >= 22` |
| ☐ | `testcontainers` (+ `@testcontainers/kafka`…) | 1.19+ | **12.2.2** | 2026-11-19 | `engines.node >= 22.22` |
| ☐ | `dotenv` | — | **18.0.10** | 2026-11-09 | Node 26 también trae `--env-file` |
| ☐ | `consul` | — | **2.0.1** | 2024-10-21 | |
| ☐ | `axios` | — | **1.21.1** | 2026-11-09 | `fetch` es nativo en Node 26 |
| ☐ | `@grpc/grpc-js` / `@grpc/proto-loader` | — | **1.14.7 / 0.8.1** | 2026-10-29 / 2026-05-07 | |
| ☐ | `@apollo/server` | — | **5.5.2** | 2026-11-11 | |
| ☐ | `kafkajs` | — | **2.2.4** | 2023-02-27 | sin publicaciones desde 2023; alternativa mantenida: `@confluentinc/kafka-javascript` 1.11.0 (2026-10-07) |
| ☐ | `amqplib` | — | **2.4.0** | 2026-11-16 | |
| ☐ | `@nats-io/transport-node` / `@nats-io/jetstream` | — | **3.5.0** | 2026-11-16 | `engines.node >= 22` |
| ☐ | `opossum` / `cockatiel` | — | **10.0.0 / 4.0.0** | 2026-06-24 / 2026-05-26 | |
| ☐ | `redis` / `ioredis` / `rate-limiter-flexible` | — | **6.3.1 / 6.0.0 / 11.5.0** | 2026-10-29 / 2026-07-31 / 2026-11-15 | |
| ☐ | `jsonwebtoken` | — | **9.0.3** | 2025-12-04 | |
| ☐ | `passport` / `passport-jwt` | — | **0.7.0 / 4.0.1** | 2023-11-27 / 2022-12-24 | son las últimas publicadas |
| ☐ | `helmet` / `cors` | — | **8.3.0 / 2.8.6** | 2026-07-12 / 2026-01-22 | |
| ☐ | `@aws-sdk/client-secrets-manager` / `@azure/keyvault-secrets` / `node-vault` | — | **3.1173.0 / 4.12.0 / 0.13.0** | 2026-11-19 / 2026-10-27 / 2026-10-11 | |
| ☐ | `@opentelemetry/api` / `@opentelemetry/sdk-node` / `@opentelemetry/auto-instrumentations-node` | — | **1.10.0 / 0.301.2 / 0.83.1** | 2026-10-20 / 2026-11-12 / 2026-11-12 | |
| ☐ | `pino` / `winston` | — | **10.4.0 / 3.19.0** | 2026-10-02 / 2025-12-07 | |
| ☐ | `@prometheus-io/client` (antes `prom-client`) | — | **0.16.1** | 2026-08-27 | npm marca `prom-client` 15.1.3 (2024-06-27) como deprecado: «prom-client has been replaced by @prometheus-io/client»; misma API (Módulo 21) |
| ☐ | `clinic` (clinic.js) | — | **13.0.0** | 2023-06-28 | sin publicaciones desde 2023: `doctor`, `flame` y `bubbleprof` funcionan con Node 26.13.1 en Linux (comprobado el 2026-11-19) si se exporta `NO_INSIGHT=1` (sin TTY, la pregunta de telemetría hace que salga sin hacer nada); `perf_hooks` y `node --cpu-prof` son la alternativa integrada (Módulo 13) |
| ☐ | `@temporalio/client` / `@temporalio/worker` | — | **1.26.0** | 2026-11-17 | |
| ☐ | `@gatling.io/cli` / `@gatling.io/core` / `@gatling.io/http` (Gatling JS) | — | **3.16.101** (motor Gatling 3.16.1; necesita Java 17+ y descarga su bundle a `~/.gatling` la primera vez) | 2026-11-17 | Módulo 32 (consultado el 2026-11-20) |
| ☐ | `@kurrent/kurrentdb-client` (antes `@eventstore/db-client`, que no publica desde 2024-05-10) | — | **1.3.3** | 2026-11-19 | Módulo 22 |
| ☐ | `snyk` (CLI) | — | **1.1309.0** | 2026-11-19 | `npx snyk --version` |
| ☐ | `vitest` (opcional) | — | **5.1.1** | 2026-11-18 | |

## Infraestructura (imágenes de Docker Compose y clúster)

| ✔ | Herramienta | Mínimo del prompt | Versión elegida | Publicada | Comprobación | Fuente oficial |
|---|---|---|---|---|---|---|
| ☐ | Apache Kafka | 3.6+ | **4.4.0** (modo KRaft, sin ZooKeeper) | 2026-10-22 | `kafka-topics.sh --version` | https://kafka.apache.org/community/downloads/ |
| ☐ | Confluent Schema Registry | — | **Confluent Platform 8.4.1** (Kafka 4.4.x; Java 17, 21 o 25) | 2026-10-27 | `GET /` del registry | https://docs.confluent.io/platform/current/installation/versions-interoperability.html |
| ☐ | Debezium | — | **3.7.1.Final** (Kafka Connect 3.1+; Java 17+) | 2026-11-06 | `GET /connector-plugins` | https://debezium.io/releases/ |
| ☐ | RabbitMQ | — | **4.4.1** | 2026-11-16 | `rabbitmq-diagnostics server_version` | https://www.rabbitmq.com/release-information |
| ☐ | NATS Server | — | **v2.15.3** (imagen `nats:2.15.3-alpine`, Docker Hub 2026-11-12) | v2.15.1 el 9 oct; 2.15.3 en noviembre (año no visible) | `nats-server --version` | https://github.com/nats-io/nats-server/releases/latest |
| ☐ | Redis Open Source | — | **8.10.2** | 17 sep (año no visible) | `redis-server --version` | https://redis.io/downloads/ · https://github.com/redis/redis/releases/latest |
| ☐ | PostgreSQL | — | **18.7** | 18 GA 2025-09-25 | `psql --version` | https://www.postgresql.org/support/versioning/ |
| ☐ | MySQL Community | — | **9.7.4 LTS** (la más nueva es la innovation 26.10.0; para un curso se prefiere la LTS más reciente, y Connector/J 26.10.0 soporta ambas) | — | `mysql --version` | https://dev.mysql.com/downloads/mysql/ |
| ☐ | MongoDB | — | **9.0.8** | 2026-11-10 | `mongod --version` | https://www.mongodb.com/docs/manual/release-notes/9.0/ |
| ☐ | KurrentDB (antes EventStoreDB) | — | **26.1.3** | 2026-10-02 | `GET /info` | https://docs.kurrent.io/server/v26.1/release-schedule/release-notes |
| ☐ | Temporal Server | 1.22+ | **v1.32.1** | 8 oct (año no visible) | `temporal operator cluster describe` | https://github.com/temporalio/temporal/releases/latest |
| ☐ | Keycloak | 24+ | **26.8.2** | 2026-11-05 | página de administración | https://www.keycloak.org/downloads · https://www.keycloak.org/blog |
| ☐ | HashiCorp Vault | — | **v2.2.0** | 2026-10-15 | `vault version` | https://github.com/hashicorp/vault/releases/latest |
| ☐ | HashiCorp Consul | — | **v2.1.0** | 2026-10-21 | `consul version` | https://github.com/hashicorp/consul/releases/latest |
| ☐ | Toxiproxy | — | **v2.13.0** | 14 oct (año no visible) | `toxiproxy-server --version` | https://github.com/Shopify/toxiproxy/releases/latest |
| ☐ | Prometheus | — | **v3.15.1** | 2026-10-21 | `prometheus --version` | https://github.com/prometheus/prometheus/releases/latest |
| ☐ | Grafana (OSS) | — | **v13.2.4** | 13 oct (año no visible) | `grafana server -v` | https://github.com/grafana/grafana/releases/latest |
| ☐ | Grafana Loki | — | **v3.7.9** | 2026-10-20 | `loki --version` | https://github.com/grafana/loki/releases/latest |
| ☐ | OpenTelemetry Collector | — | **v0.163.2** | 21 oct (año no visible) | `otelcol --version` | https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest |
| ☐ | Zipkin | — | **3.6.1** | 8 abr (año no visible) | `GET /health` | https://github.com/openzipkin/zipkin/releases/latest |
| ☐ | Jaeger | — | **v2.22.0** | 6 oct (año no visible) | `GET /` en el puerto 16686 | https://github.com/jaegertracing/jaeger/releases/latest |
| ☐ | ELK (Elasticsearch, Logstash, Kibana) | — | **9.5.6** (las tres van en la misma versión) | 2026-11-02 | `GET /` de Elasticsearch | https://www.elastic.co/downloads/elasticsearch |
| ☐ | Kubernetes | 1.28+ | **1.37.1** | 2026-09-15 | `kubectl version` | https://kubernetes.io/releases/ |
| ☐ | Helm | — | **4.3.1** (soporta Kubernetes 1.34–1.37) | — | `helm version` | https://helm.sh/docs/topics/version_skew/ |
| ☐ | Argo CD | — | **v3.5.6** | 20 oct (año no visible) | `argocd version` | https://github.com/argoproj/argo-cd/releases/latest |
| ☐ | Istio | — | **1.32** (soporta Kubernetes 1.33–1.37) | 2026-11-09 | `istioctl version` | https://istio.io/latest/docs/releases/supported-releases/ |
| ☐ | Linkerd | — | **edge-26.11.2** (ver decisiones; stable 2.20 solo por proveedores) | — | `linkerd version` | https://linkerd.io/releases/ |
| ☐ | Trivy | — | **v0.76.1** | 21 oct (año no visible) | `trivy --version` | https://github.com/aquasecurity/trivy/releases/latest |
| ☐ | Snyk CLI | — | **1.1309.0** | 2026-11-19 | `snyk --version` | https://registry.npmjs.org/snyk |
| ☐ | GitHub Actions | — | servicio (sin versión); acciones fijadas por SHA en cada laboratorio | — | — | https://docs.github.com/actions |

## Mínimos del prompt frente a lo elegido

| Mínimo del prompt | Elegido | ¿Cumple? |
|---|---|---|
| Java 21 | Java 25 LTS | Sí |
| Spring Boot 3.3+ | Spring Boot 4.1.3 | Sí |
| Node 20 LTS | Node 26 LTS | Sí (Node 20 ya está en fin de vida) |
| NestJS 10+ | NestJS 12.5.1 | Sí |
| Kafka 3.6+ | Kafka 4.4.0 | Sí |
| Temporal 1.22+ | Temporal Server 1.32.1 | Sí |
| Kubernetes 1.28+ | Kubernetes 1.37.1 | Sí |
| Keycloak 24+ | Keycloak 26.8.2 | Sí |
| Testcontainers 1.19+ | Java 2.0.5 · Node 12.2.2 | Sí |

## Cómo consigue el build el JDK 25

Cada `build.gradle.kts` del curso declara `JavaLanguageVersion.of(25)`. Eso es una **exigencia**, no una
instalación: si en la máquina no hay un JDK 25 localizado por Gradle, el build muere en la **configuración**,
antes de compilar ni ejecutar un solo test. Medido aquí el 2026-11-21 con JDK 27 y 26 instalados y ninguno 25:

```
* What went wrong:
A problem occurred configuring project ':f024-graalvm-native'.
> Failed to calculate the value of task ':f024-graalvm-native:compileTestJava' property 'javaCompiler'.
   > Cannot find a Java installation on your machine (Mac OS X 27.2 aarch64) matching: {languageVersion=25, …}.
     Toolchain download repositories have not been configured.
BUILD FAILED in 7s
```

El arreglo es el resolver oficial de Gradle, en el `settings.gradle.kts` de los 14 builds del curso
(`examples/microservicios/modulo-5` … `modulo-16/app`, `modulo-36/spring` y `modulo-5/f021-multimodulo`):

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
```

Versión confirmada en la fuente primaria (plugins.gradle.org, 2026-11-21); Gradle la pide explícitamente en la
frase «Toolchain download repositories have not been configured». Con el resolver, el `./verificar.sh` de
`modulo-5` pasó de fallar en 7 s a `RESULTADO: OK` en 46 s: Gradle descargó
`OpenJDK25U-jdk_aarch64_mac_hotspot_25.0.5.1_2.tar.gz` a `~/.gradle/jdks/` y los logs de Spring arrancaron
`using Java 25.0.5.1`. Coste: la primera vez baja el JDK (≈200 MB) además de las dependencias; luego queda en
caché. Alternativas que **no** se usaron: instalar JDK 25 a mano en cada máquina (el alumno no instala nada,
regla del curso) y relajar el toolchain a 26/27 (rompería CRaC y GraalVM, que solo publican builds sobre 25).

## Diferencias con `docs/VERSIONES.md`

Este curso sigue su propia línea (specs/018). Coincide con `docs/VERSIONES.md` en JDK 25, Kubernetes 1.37 y
Docker 29, y se separa en: **Node 26** (VERSIONES dice Node 24) y **TypeScript 6.0** (VERSIONES dice 7.x en
general, pero la cadena de NestJS 12 aún no acepta TypeScript 7).

## Cuándo revisar esta tabla

- Cuando salga **Spring Cloud 2026.0 GA**: sube a Spring Boot 4.2.x y vuelve a leer el BOM (Flyway 13,
  Micrometer 1.18, Spring Framework 7.1).
- Cuando **GraalVM** y **Azul Zulu CRaC** publiquen builds sobre un JDK más nuevo que 25.
- Cuando `@nestjs/cli` y `ts-jest` acepten TypeScript 7.
