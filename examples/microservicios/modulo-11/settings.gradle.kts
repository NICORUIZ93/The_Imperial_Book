// Módulo 7 (modulo-11) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todos los subproyectos.
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

rootProject.name = "modulo-11-laboratorios"

include(
    "f052-eureka",
    "f052-consul",
    "f053-gateway",
    "f054-config",
    "f055-loadbalancer",
    "f056-bff",
)
