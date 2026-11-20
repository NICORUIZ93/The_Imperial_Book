// F052 · Service Discovery con Eureka: servidor + cliente "catalogo" en un mismo proyecto
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
    // Servidor Eureka 5.0.3 (trae también el cliente Eureka)
    implementation(libs.spring.cloud.starter.netflix.eureka.server)
    // API HTTP del catálogo (Tomcat 11)
    implementation(libs.spring.boot.starter.webmvc)
    // El cliente Eureka usa RestClient para hablar con el servidor
    implementation(libs.spring.boot.starter.restclient)
    // /actuator/health: lo que Eureka publica como estado de la instancia
    implementation(libs.spring.boot.starter.actuator)
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

// Este proyecto tiene varias clases con main. Elige cuál arranca (bootRun) o se empaqueta (bootJar) con
// -Pprincipal=paquete.Clase (en Maven: -Dspring-boot.run.main-class=...). Los tests no lo necesitan.
springBoot {
    providers.gradleProperty("principal").orNull?.let { mainClass = it }
}
