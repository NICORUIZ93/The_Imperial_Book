// F057 · Resilience4j: Circuit Breaker, Retry, RateLimiter, Bulkhead y TimeLimiter en el servicio "pedidos"
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
    // API HTTP de pedidos
    implementation(libs.spring.boot.starter.webmvc)
    // RestClient para llamar al inventario
    implementation(libs.spring.boot.starter.restclient)
    // /actuator/circuitbreakers, /actuator/health con el estado del circuito
    implementation(libs.spring.boot.starter.actuator)
    // Las anotaciones de Resilience4j son aspectos: necesitan AspectJ (en Boot 4 sustituye a spring-boot-starter-aop)
    implementation(libs.spring.boot.starter.aspectj)
    // Resilience4j 2.4.0: anotaciones @CircuitBreaker, @Retry, @RateLimiter, @Bulkhead, @TimeLimiter (soporte de Spring Boot 4)
    implementation(libs.resilience4j.spring.boot4)
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
