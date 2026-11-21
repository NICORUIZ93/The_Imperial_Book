// Módulo 32 (modulo-36) · Proyecto final, versión Spring Boot (Fase 1). Build multi-proyecto: "./gradlew test"
// ejecuta los tests. La simulación de Gatling (carga/) no tiene tests: se lanza aparte con
// "./gradlew :carga:gatlingRun" porque necesita el sistema en marcha.
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

rootProject.name = "modulo-36-proyecto-final"

include(
    "pagos-externo",
    "reservas",
    "gateway",
    "carga",
)
