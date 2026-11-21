// Módulo 9 (modulo-13) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todas las fichas con Spring.
// F068 necesita Vault encendido y VAULT_TOKEN (lo prepara verificar.sh). F067 (mTLS) no tiene build, y F069 conserva
// sus pom.xml porque son el material que leen Trivy, Snyk y MiniEscaner: ver README.
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

rootProject.name = "modulo-13-laboratorios"

include(
    "f061-filter-chain",
    "f062-jwt",
    "f063-oauth2-oidc",
    "f064-keycloak",
    "f065-rbac-scopes",
    "f066-token-exchange",
    "f068-vault",
)
