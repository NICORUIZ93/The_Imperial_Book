// F066 · Token Exchange (RFC 8693): pedidos canjea el token de ana para llamar a pagos
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
    // Spring MVC + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // Resource server: valida JWT con Nimbus
    implementation(libs.spring.boot.starter.security.oauth2.resource.server)
    // RestClient
    implementation(libs.spring.boot.starter.restclient)
    // MockMvc, JUnit Jupiter 6, AssertJ
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // httpBasic(), jwt(), oidcLogin() para MockMvc
    testImplementation(libs.spring.boot.starter.security.test)
    // Pruebas del resource server
    testImplementation(libs.spring.boot.starter.security.oauth2.resource.server.test)
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
