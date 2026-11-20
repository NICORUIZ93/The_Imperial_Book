# Laboratorio · Módulo 3 · Testing y calidad

Lección: [`web/public/content/microservices/modulo-7.md`](../../../web/public/content/microservices/modulo-7.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un subproyecto Gradle (Kotlin DSL) con el código y los tests de una ficha.

| Carpeta | Ficha | Necesita |
|---|---|---|
| `f032-junit-mockito-mockmvc` | JUnit 5, Mockito, MockMvc (11 tests) | JDK + Maven Central |
| `f033-testcontainers` | Testcontainers (3 tests contra `postgres:18.7`) | JDK + Docker |
| `f034-pact-consumidor` + `f034-pact-proveedor` | Contract Testing con Pact y Pact Broker | JDK; el broker con Docker Compose |
| `f035-archunit` | ArchUnit (4 reglas) | JDK |
| `f036-sonarqube` | SonarQube (6 tests + análisis) | JDK; SonarQube con Docker Compose |

## Versiones

JDK 25 LTS · Spring Boot 4.1.3 (JUnit Jupiter 6.0.3, Mockito 5.23.0, AssertJ 3.27.7, Testcontainers 2.0.5, todas
gestionadas por el BOM) · Pact JVM 4.7.7 · ArchUnit 1.5.1 (`archunit-junit6`) · JaCoCo 0.8.15 · SonarScanner for
Gradle 7.5.0.8588 · imágenes `postgres:18.7`, `pactfoundation/pact-broker:3.2.0-pactbroker2.124.0` y
`sonarqube:26.11.0.134175-community` · Gradle 9.9.2 por el wrapper (`gradle/wrapper/gradle-wrapper.properties`).

## Ejecutar

```bash
cd examples/microservicios/modulo-7
./verificar.sh            # todo: tests, Pact Broker (publish + verify + can-i-deploy) y SonarQube
./verificar.sh --rapido   # solo los tests (Docker hace falta igual para Testcontainers)
```

Termina con `RESULTADO: OK · Módulo 3 (Testing y calidad) verificado`.

A mano, ficha por ficha:

```bash
cd f032-junit-mockito-mockmvc && ../gradlew test                         # F032
cd f033-testcontainers && ../gradlew test                                # F033 (Docker encendido)
./gradlew :f034-pact-consumidor:test :f034-pact-proveedor:test              # F034 sin broker (desde esta carpeta)
docker compose up -d --wait pact-broker                               # F034 con broker: http://localhost:9292
./gradlew :f034-pact-consumidor:pactPublish
./gradlew :f034-pact-proveedor:test --tests ContratoDesdeBrokerManual -Pbroker -Ppact.verifier.publishResults=true
./gradlew :f034-pact-consumidor:canIDeploy -Ppacticipant=tienda-web -PpacticipantVersion=1.0.0
cd f035-archunit && ../gradlew test                                      # F035
docker compose up -d sonarqube && f036-sonarqube/sonar/analizar.sh    # F036: http://localhost:9000
docker compose down
```

## Estado de verificación

Ver [`verificacion/microservicios/pendiente.md`](../../../verificacion/microservicios/pendiente.md): este laboratorio
necesita Maven Central y registros de Docker, que no están disponibles en el entorno donde se escribió.

## Build: Gradle (equivalencia con Maven)

Este laboratorio se construye con Gradle 9.9.2 (Kotlin DSL) por el wrapper `./gradlew`; las versiones están en el
catálogo `gradle/libs.versions.toml`. Hasta el 2026-11-20 usaba Maven: `./mvnw test` → `./gradlew test` ·
`./mvnw -pl <carpeta> test` → `./gradlew :<carpeta>:test` · `./mvnw package -DskipTests` → `./gradlew bootJar` ·
`./mvnw spring-boot:run` → `./gradlew bootRun` · `target/` → `build/` · `pom.xml` → `build.gradle.kts`.
