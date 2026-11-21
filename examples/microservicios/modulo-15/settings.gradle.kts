// Módulo 11 (modulo-15) · Build multi-proyecto: "./gradlew test" ejecuta los tests de las 6 fichas (F075–F080).
// Los tests usan los brokers de docker-compose.yml: arráncalos antes con "docker compose up -d --wait".
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
        // F077: el serializador de Confluent no está en Maven Central, vive en el repositorio de Confluent
        maven {
            name = "confluent"
            url = uri("https://packages.confluent.io/maven/")
        }
    }
}

rootProject.name = "modulo-15-laboratorios"

include(
    "f075-kafka-particiones",
    "f076-exactly-once",
    "f077-schema-registry-avro",
    "f078-dead-letter-topics",
    "f079-rabbitmq-confirms-dlq",
    "f080-nats",
)
