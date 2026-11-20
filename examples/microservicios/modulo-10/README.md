# Laboratorio · Módulo 6 · Comunicación entre servicios

Lección: [`web/public/content/microservices/modulo-10.md`](../../../web/public/content/microservices/modulo-10.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un subproyecto Gradle (Kotlin DSL) con el código y los tests de una ficha.

| Carpeta | Ficha | Infraestructura |
|---|---|---|
| `f047-rest-sincrono` | REST síncrono: RestTemplate, WebClient, OpenFeign (y RestClient + `@HttpExchange`) | — (`inventario-falso/InventarioFalso.java` para el laboratorio manual) |
| `f048-grpc` | gRPC: Protocol Buffers, servicios, streaming | — (transporte en proceso en los tests) |
| `f049-graphql` | GraphQL con Spring for GraphQL | — |
| `f050-mensajeria` | Mensajería asíncrona: RabbitMQ y Kafka (introducción) | RabbitMQ 4.4.1 y Kafka 4.4.0 |
| `f051-sync-async` | Sync vs async: criterios de decisión | — |

## Versiones

JDK 25 LTS (25.0.5) · Spring Boot 4.1.3 (Spring Framework 7.0.11, Jackson 3.1.8, Spring gRPC 1.1.2, grpc-java
1.84.1, Protobuf Java 4.36.2, Spring for GraphQL 2.0.7 con graphql-java 25.1, Spring AMQP 4.1.3, Spring for Apache
Kafka 4.1.3, kafka-clients 4.2.2) · Spring Cloud 2025.1.4 (OpenFeign 5.0.4) · imágenes `rabbitmq:4.4.1-management` y
`apache/kafka:4.4.0` · Gradle 9.9.2 por el wrapper (`./gradlew`). Para `f048-grpc/protobuf/demo-binario.sh`: el `protoc` del
PATH (`brew install protobuf`), el que descarga el build de Gradle de `f048-grpc` en `~/.gradle` o, si no
hay ninguno, un entorno virtual propio en `f048-grpc/protobuf/.venv` con `grpcio-tools==1.84.1` (ruedas para Python
3.10–3.15) que el script crea solo.

## Ejecutar

```bash
cd examples/microservicios/modulo-10
./verificar.sh
```

El script hace `docker compose up -d --wait` (RabbitMQ en :5672 y :15672, Kafka en :9092), ejecuta
`./gradlew -q --continue test` en las 5 carpetas, comprueba el contrato Protocol Buffers con `demo-binario.sh`, imprime
`RESULTADO: OK · Módulo 6 (Comunicación entre servicios) verificado` y termina con `docker compose down`.

Para trabajar una ficha a mano:

```bash
cd f048-grpc && ../gradlew test                   # F047, F048, F049 y F051 no necesitan Docker
docker compose up -d --wait                    # brokers para F050
cd f050-mensajeria && ../gradlew test
docker compose down
```

La consola web de RabbitMQ queda en http://localhost:15672 (usuario y contraseña `academia`).

## Build: Gradle (equivalencia con Maven)

Este laboratorio se construye con Gradle 9.9.2 (Kotlin DSL) por el wrapper `./gradlew`; las versiones están en el
catálogo `gradle/libs.versions.toml`. Hasta el 2026-11-20 usaba Maven: `./mvnw test` → `./gradlew test` ·
`./mvnw -pl <carpeta> test` → `./gradlew :<carpeta>:test` · `./mvnw package -DskipTests` → `./gradlew bootJar` ·
`./mvnw spring-boot:run` → `./gradlew bootRun` · `target/` → `build/` · `pom.xml` → `build.gradle.kts`.
