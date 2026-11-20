// F071 · OpenTelemetry + Zipkin/Jaeger: trazas distribuidas entre pedidos e inventario.
// Por defecto (-Ptrazas=otel): Micrometer Tracing + OpenTelemetry, exporta por OTLP a Jaeger.
// Con "-Ptrazas=zipkin": Micrometer Tracing + Brave, exporta a Zipkin. Nunca los dos a la vez.
// (En Maven eran los perfiles "otel", activo por defecto, y "zipkin" con -Pzipkin.)
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

// Propiedad de proyecto que elige el puente de trazas: es el equivalente de un perfil de Maven
val trazas = providers.gradleProperty("trazas").getOrElse("otel")

dependencies {
    // Spring MVC + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // RestClient.Builder autoconfigurado: propaga traceparent solo
    implementation(libs.spring.boot.starter.restclient)
    // Actuator: /actuator/health
    implementation(libs.spring.boot.starter.actuator)
    if (trazas == "zipkin") {
        // Micrometer Tracing + Brave + exportador a Zipkin
        implementation(libs.spring.boot.starter.zipkin)
        testImplementation(libs.spring.boot.starter.zipkin.test)
    } else {
        // Micrometer Tracing + OpenTelemetry + exportador OTLP
        implementation(libs.spring.boot.starter.opentelemetry)
        testImplementation(libs.spring.boot.starter.opentelemetry.test)
    }
    // MockMvc, JUnit Jupiter 6, AssertJ
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
