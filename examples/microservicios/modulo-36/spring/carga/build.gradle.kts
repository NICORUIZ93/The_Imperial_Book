// Test de carga del proyecto con Gatling 3.16.1 (Java DSL) y el plugin de Gatling para Gradle 3.16.0
// (plugins.gradle.org/plugin/io.gatling.gradle, consultado el 2026-11-20).
// Ejecuta con el sistema en marcha: ./gradlew :carga:gatlingRun
// El plugin busca las simulaciones en src/gatling/java (en Maven estaban en src/test/java).
plugins {
    java
    alias(libs.plugins.gatling)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

gatling {
    // El plugin trae Gatling 3.16.0 por defecto; se fija la misma 3.16.1 que usaba el build de Maven
    gatlingVersion = libs.versions.gatling.get()
}

// La simulación se elige en la TAREA, no en la extensión: GatlingRunTask expone
// getSimulationClassName/setSimulationClassName (javap sobre gatling-gradle-plugin-3.16.0.jar).
// Equivale a <simulationClass> del POM de Maven.
tasks.named<io.gatling.gradle.GatlingRunTask>("gatlingRun") {
    simulationClassName = "academia.carga.ReservasSimulation"
}
