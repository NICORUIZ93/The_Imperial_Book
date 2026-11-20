// F043 · Spring Modulith
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

dependencyManagement {
    imports {
        mavenBom("org.springframework.modulith:spring-modulith-bom:${libs.versions.spring.modulith.get()}")
    }
}

dependencies {
    // API de módulos (ApplicationModules) y verificación de la estructura
    implementation(libs.spring.modulith.starter.core)
    // @ApplicationModuleListener vive en spring-modulith-events-api: el starter core NO lo incluye
    implementation(libs.spring.modulith.events.api)
    // @ApplicationModuleListener es un listener transaccional: necesita un gestor de transacciones
    implementation(libs.spring.boot.starter.jdbc)
    runtimeOnly(libs.h2)
    // @ApplicationModuleTest, Scenario y spring-boot-starter-test
    testImplementation(libs.spring.modulith.starter.test)
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
