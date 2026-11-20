// F052 · Service Discovery con Consul: el mismo catálogo registrado en Consul 2.1
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
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${libs.versions.spring.cloud.get()}")
    }
}

dependencies {
    // Cliente de Consul 5.0.4: registro + chequeo de salud + DiscoveryClient
    implementation(libs.spring.cloud.starter.consul.discovery)
    // API HTTP del catálogo
    implementation(libs.spring.boot.starter.webmvc)
    // Consul llama a /actuator/health cada 10 s para saber si la instancia está sana
    implementation(libs.spring.boot.starter.actuator)
    // Testcontainers 2.0.5 (gestionado por Boot): Consul real en el test
    testImplementation(libs.testcontainers.junit.jupiter)
    testImplementation(libs.testcontainers.consul)
    testImplementation(libs.spring.boot.starter.test)
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
