// F044 · 12-Factor App
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Factor VII (port binding): Tomcat 11 embebido dentro del JAR
    implementation(libs.spring.boot.starter.webmvc)
    // Factor III: la configuración se valida al arrancar
    implementation(libs.spring.boot.starter.validation)
    // Factor IX: /actuator/health para que el orquestador sepa si el proceso está listo
    implementation(libs.spring.boot.starter.actuator)
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
