// Módulo 3 (modulo-7) · Build multi-proyecto: "./gradlew test" ejecuta los tests de las 5 fichas (F032–F036).
// El orden importa y está declarado: el test del proveedor de Pact depende del test del consumidor (que genera el
// contrato). F033 (Testcontainers) necesita Docker en marcha; Pact Broker y SonarQube se levantan con docker-compose.yml.
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

rootProject.name = "modulo-7-laboratorios"

include(
    "f032-junit-mockito-mockmvc",
    "f033-testcontainers",
    "f034-pact-consumidor",
    "f034-pact-proveedor",
    "f035-archunit",
    "f036-sonarqube",
)
