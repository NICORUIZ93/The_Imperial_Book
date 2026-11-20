# Laboratorio · Módulo 2 · APIs REST y persistencia

Lección: [`web/public/content/microservices/modulo-6.md`](../../../web/public/content/microservices/modulo-6.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un subproyecto Gradle (Kotlin DSL) con el código y el test de una ficha.

| Carpeta | Ficha | Base de datos |
|---|---|---|
| `f025-spring-mvc` | Spring MVC: DispatcherServlet, Controllers, Validación | — |
| `f026-dtos-jackson` | DTOs, @JsonProperty, Jackson | — |
| `f027-controller-advice` | Manejo global de excepciones (@ControllerAdvice) | — |
| `f028-jpa` | Spring Data JPA, Hibernate, entidades, relaciones, transacciones | PostgreSQL `f028` |
| `f029-criteria-specifications` | Criteria API y Specifications | PostgreSQL `f029` |
| `f030-flyway`, `f030-liquibase` | Flyway/Liquibase | PostgreSQL `f030_flyway`, `f030_liquibase` |
| `f031-postgresql-mysql` | PostgreSQL y MySQL | PostgreSQL `f031` y MySQL `f031` |

## Versiones

JDK 25 LTS (25.0.5) · Spring Boot 4.1.3 (Spring Framework 7, Jackson 3.1, Hibernate ORM 7.4.15, Spring Data JPA
4.1.3, Hibernate Validator 9.1.6, HikariCP 7.0.2) · Flyway 12.4.0 · Liquibase 5.0.4 · drivers PostgreSQL 42.7.14 y
MySQL Connector/J 26.10.0 · imágenes `postgres:18.7` y `mysql:9.7.4` · Gradle 9.9.2 por el wrapper (`./gradlew`).

## Ejecutar

```bash
cd examples/microservicios/modulo-6
./verificar.sh
```

El script muestra la versión de Java y de Docker Compose, hace `docker compose up -d --wait`, ejecuta `./gradlew -q test`
en las 8 carpetas, imprime `RESULTADO: OK · Módulo 2 (APIs REST y persistencia) verificado` y termina con
`docker compose down`.

Para trabajar una ficha a mano:

```bash
docker compose up -d --wait        # PostgreSQL :5432 y MySQL :3306, usuario/contraseña tienda/tienda
cd f028-jpa && ../gradlew test
docker compose down                # borra contenedores y datos (no hay volúmenes)
```

`initdb/postgres.sql` crea una base por ficha y `initdb/mysql.sql` crea la base `practica` para el mini-laboratorio de
F031. Si los puertos 5432 o 3306 están ocupados por bases locales, detenlas antes de `docker compose up`.

## Build: Gradle (equivalencia con Maven)

Este laboratorio se construye con Gradle 9.9.2 (Kotlin DSL) por el wrapper `./gradlew`; las versiones están en el
catálogo `gradle/libs.versions.toml`. Hasta el 2026-11-20 usaba Maven: `./mvnw test` → `./gradlew test` ·
`./mvnw -pl <carpeta> test` → `./gradlew :<carpeta>:test` · `./mvnw package -DskipTests` → `./gradlew bootJar` ·
`./mvnw spring-boot:run` → `./gradlew bootRun` · `target/` → `build/` · `pom.xml` → `build.gradle.kts`.
