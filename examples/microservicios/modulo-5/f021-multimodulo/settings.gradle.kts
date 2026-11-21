// F021 · Multi-module Spring Boot projects: settings.gradle.kts declara QUÉ proyectos forman el build.
// Es el equivalente del POM padre con <modules> de Maven.
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
    versionCatalogs {
        // Reutiliza el catálogo del laboratorio (modulo-5/gradle/libs.versions.toml): versiones en un solo sitio
        create("libs") {
            from(files("../gradle/libs.versions.toml"))
        }
    }
}

rootProject.name = "f021-multimodulo"

// Orden indiferente: Gradle calcula el grafo de tareas a partir de las dependencias entre proyectos
include("tienda-dominio", "tienda-api")
