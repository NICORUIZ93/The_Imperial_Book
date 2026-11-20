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
