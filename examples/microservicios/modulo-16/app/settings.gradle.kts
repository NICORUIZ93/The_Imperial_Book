// Módulo 12 (modulo-16) · Build de un solo proyecto: el servicio «catalogo», la misma imagen que usan las 8 fichas
// (Dockerfile, Compose, Kubernetes, probes, HPA, Helm, Blue-Green/Canary y Argo CD).
// El build completo (wrapper incluido) vive en app/ porque app/ es el contexto de "docker build".
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

rootProject.name = "catalogo"
