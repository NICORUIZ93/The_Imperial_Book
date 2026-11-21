// Módulo 10 (modulo-14) · Build multi-proyecto: "./gradlew test" ejecuta los tests de F070, F071 (con OpenTelemetry) y F072.
// F073 (Grafana) y F074 (reglas de Prometheus) no tienen build de Gradle: ver README y verificar.sh.
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

rootProject.name = "modulo-14-laboratorios"

include(
    "f070-micrometer-prometheus",
    "f071-tracing",
    "f072-logging-estructurado",
)
