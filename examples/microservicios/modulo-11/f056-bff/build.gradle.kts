// F056 · BFF pattern: un backend para la app móvil y otro para la web
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
    // API HTTP de cada BFF
    implementation(libs.spring.boot.starter.webmvc)
    // RestClient para llamar a catálogo, inventario y reseñas
    implementation(libs.spring.boot.starter.restclient)
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
