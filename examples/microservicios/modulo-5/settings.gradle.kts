// Módulo 1 (modulo-5) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todas las fichas.
// Cada carpeta fNNN-* es un subproyecto con su propio build.gradle.kts; las versiones viven en
// gradle/libs.versions.toml (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
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

rootProject.name = "modulo-5-laboratorios"

include(
    "f017-java-moderno",
    "f018-virtual-threads",
    "f019-ioc-di",
    "f020-autoconfiguracion",
    "f022-perfiles",
    "f023-crac",
    "f024-graalvm-native",
)

// F021 enseña el multi-proyecto: es un build completo (con su settings.gradle.kts) que se incluye
// como build compuesto. Se puede abrir y construir solo: cd f021-multimodulo && ../gradlew build
includeBuild("f021-multimodulo")
