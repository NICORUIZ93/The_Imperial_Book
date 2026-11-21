// Módulo 4 (modulo-8) · Build multi-proyecto: "./gradlew test" ejecuta los tests de las 4 fichas (F037–F040).
// Todas necesitan "docker compose up -d --wait" antes (Redis 8.10.2 x4 y PostgreSQL 18.7).
// Cada carpeta tiene su propio build.gradle.kts; las versiones viven en gradle/libs.versions.toml
// (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

// Sin esto, un alumno sin JDK 25 instalado ve el build morir en la configuración, antes de cualquier test.
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "modulo-8-laboratorios"

include(
    "f037-cache-redis",
    "f038-patrones-cache",
    "f039-redlock-fencing",
    "f040-cache-stampede",
)
