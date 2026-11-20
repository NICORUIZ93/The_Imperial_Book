// F034 · Contract Testing con Pact (lado CONSUMIDOR "tienda-web"). Pact JVM 4.7.7, Spring Boot 4.1.3, JDK 25.
// ../gradlew test          -> genera build/pacts/tienda-web-catalogo.json
// ../gradlew pactPublish   -> lo sube al Pact Broker de docker-compose.yml (http://localhost:9292)
plugins {
    java
    // Plugin de Pact: tareas pactPublish y canIDeploy contra el broker
    alias(libs.plugins.pact)
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
    implementation(platform(libs.spring.boot.dependencies))
    // RestClient (spring-web 7) + Jackson 3 para el cliente HTTP
    implementation(libs.spring.boot.starter.webmvc)
    testImplementation(libs.spring.boot.starter.test)
    // Pact para JUnit Jupiter: servidor simulado + escritura del contrato
    testImplementation(libs.pact.consumer.junit5)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    options.compilerArgs.add("-parameters")   // el plugin de Boot lo añade solo; aquí no está aplicado
}

tasks.withType<Test> {
    useJUnitPlatform()
    // Carpeta donde Pact escribe el contrato (el proveedor lo lee de aquí con @PactFolder)
    systemProperty("pact.rootDir", layout.buildDirectory.dir("pacts").get().asFile.path)
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}

pact {
    broker {
        // se puede cambiar desde la línea de comandos con -PpactBrokerUrl=...
        pactBrokerUrl = providers.gradleProperty("pactBrokerUrl").getOrElse("http://localhost:9292")
    }
    publish {
        // build/pacts es también el valor por defecto del plugin; la versión publicada es la del proyecto (1.0.0)
        pactDirectory = layout.buildDirectory.dir("pacts").get().asFile.path
    }
}
