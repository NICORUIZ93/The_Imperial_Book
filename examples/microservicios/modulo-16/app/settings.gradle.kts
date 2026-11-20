// Módulo 12 (modulo-16) · Build de un solo proyecto: el servicio «catalogo», la misma imagen que usan las 8 fichas
// (Dockerfile, Compose, Kubernetes, probes, HPA, Helm, Blue-Green/Canary y Argo CD).
// El build completo (wrapper incluido) vive en app/ porque app/ es el contexto de "docker build".
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

rootProject.name = "catalogo"
