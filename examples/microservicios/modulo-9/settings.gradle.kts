// Módulo 5 (modulo-9) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todos los subproyectos.
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

rootProject.name = "modulo-9-laboratorios"

include(
    "f041-estilos",
    "f042-ddd",
    "f043-modulith",
    "f044-doce-factores",
    "f045-strangler-fig",
    "f046-bd-por-servicio",
)
