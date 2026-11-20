// F034 · Contract Testing con Pact (lado PROVEEDOR "catalogo"). Pact JVM 4.7.7, Spring Boot 4.1.3, JDK 25.
// ../gradlew test   -> verifica el contrato que dejó ../f034-pact-consumidor/build/pacts (sin broker)
// ../gradlew test --tests ContratoDesdeBrokerManual -Pbroker -Ppact.verifier.publishResults=true
//                   -> lo descarga del Pact Broker (localhost:9292) y publica el resultado
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
    implementation(libs.spring.boot.starter.webmvc)
    testImplementation(libs.spring.boot.starter.test)
    // Verificador de Pact para JUnit Jupiter (@Provider, @State, @PactFolder, @PactBroker)
    testImplementation(libs.pact.provider.junit5)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    // El contrato lo genera el test del consumidor: tiene que ejecutarse antes
    dependsOn(":f034-pact-consumidor:test")
    // Pact lee estas propiedades de la JVM de los TESTS: Gradle no les pasa solo lo que escribes en la línea de
    // comandos. Se pueden cambiar con -Ppactbroker.host=..., -Ppactbroker.port=... y -Ppact.verifier.publishResults=true
    systemProperty("pactbroker.host", providers.gradleProperty("pactbroker.host").getOrElse("localhost"))
    systemProperty("pactbroker.port", providers.gradleProperty("pactbroker.port").getOrElse("9292"))
    systemProperty("pact.verifier.publishResults", providers.gradleProperty("pact.verifier.publishResults").getOrElse("false"))
    systemProperty("pact.provider.version", version.toString())
    // Gradle ejecuta todas las clases con tests (Surefire, en Maven, solo las *Test). ContratoDesdeBrokerManual
    // necesita el broker encendido: queda fuera salvo que la pidas con -Pbroker
    if (!providers.gradleProperty("broker").isPresent) {
        exclude("**/*Manual.class")
    }
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
