// F017 · Java moderno: Streams, Lambdas, Optional, Records, Pattern Matching.
// No aplica el plugin de Spring Boot: solo importa su BOM como plataforma para usar la versión
// probada de JUnit; el código no depende de Spring.
plugins {
    java
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // BOM de Spring Boot como plataforma de Gradle: fija las versiones sin aplicar el plugin de Boot
    testImplementation(platform(libs.spring.boot.dependencies))
    testImplementation(libs.junit.jupiter)   // JUnit Jupiter 6.0.3, versión gestionada por Spring Boot 4.1.3
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
