// Módulo 12 · Servicio «catalogo» que se empaqueta, se orquesta y se despliega (Spring Boot 4.1.3, JDK 25)
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
    // Spring MVC 7 + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // /actuator/health/liveness y /actuator/health/readiness para las probes de Kubernetes
    implementation(libs.spring.boot.starter.actuator)
    testImplementation(libs.spring.boot.starter.test)
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

// build/libs/catalogo.jar: el Dockerfile lo busca con este nombre (en Maven, <finalName>catalogo</finalName>)
tasks.bootJar {
    archiveFileName = "catalogo.jar"
}

// Descarga las dependencias sin compilar: en el Dockerfile, la capa que las contiene se reutiliza mientras
// no cambien los archivos de build (en Maven, dependency:go-offline).
tasks.register("descargarDependencias") {
    group = "build setup"
    description = "Resuelve y descarga las dependencias de compilación y de ejecución"
    val rutas = configurations.compileClasspath.get() + configurations.runtimeClasspath.get()
    doLast {
        println("Dependencias descargadas: ${rutas.files.size}")
    }
}
