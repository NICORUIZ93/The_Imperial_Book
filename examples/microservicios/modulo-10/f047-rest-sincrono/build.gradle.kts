// F047 · REST síncrono: RestTemplate, WebClient, OpenFeign (y RestClient + @HttpExchange)
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
    // Servidor MVC (el servicio de pedidos expone su propia API)
    implementation(libs.spring.boot.starter.webmvc)
    // RestTemplateBuilder, RestClient.Builder y clientes @HttpExchange
    implementation(libs.spring.boot.starter.restclient)
    // WebClient.Builder (Reactor Netty)
    implementation(libs.spring.boot.starter.webclient)
    // OpenFeign declarativo
    implementation(libs.spring.cloud.starter.openfeign)
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
