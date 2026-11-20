// Módulo 2 (modulo-6) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todas las fichas.
// Las fichas F028–F031 necesitan "docker compose up -d --wait" antes de los tests.
// Cada carpeta tiene su propio build.gradle.kts; las versiones viven en gradle/libs.versions.toml
// (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "modulo-6-laboratorios"

include(
    "f025-spring-mvc",
    "f026-dtos-jackson",
    "f027-controller-advice",
    "f028-jpa",
    "f029-criteria-specifications",
    "f030-flyway",
    "f030-liquibase",
    "f031-postgresql-mysql",
)
