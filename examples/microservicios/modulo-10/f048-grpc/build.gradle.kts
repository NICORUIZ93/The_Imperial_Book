// F048 · gRPC: Protocol Buffers, servicios, streaming (soporte gRPC nativo de Spring Boot 4.1)
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
    // Genera las clases Java desde src/main/proto. El plugin de Boot reacciona a este plugin y fija protoc
    // (protobuf-java 4.36.2) y protoc-gen-grpc-java (grpc-java 1.84.1): aquí solo se activa.
    alias(libs.plugins.protobuf)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Servidor gRPC (Netty, grpc-java 1.84.1, Spring gRPC 1.1.2, reflexión y health)
    implementation(libs.spring.boot.starter.grpc.server)
    // Cliente gRPC (GrpcChannelFactory) para la consola y los tests
    implementation(libs.spring.boot.starter.grpc.client)
    // @AutoConfigureTestGrpcTransport: servidor y canal en proceso para los tests
    testImplementation(libs.spring.boot.starter.grpc.client.test)
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

protobuf {
    plugins {
        create("grpc")   // activa el generador de stubs gRPC; artefacto y versión los pone el plugin de Boot
    }
}

// ../gradlew -q bootRun -Pprincipal=academia.grpc.ClienteDeConsola arranca otra clase con main
// (en Maven: -Dspring-boot.run.main-class=...). Sin la propiedad, Boot busca la clase @SpringBootApplication.
springBoot {
    providers.gradleProperty("principal").orNull?.let { mainClass = it }
}
