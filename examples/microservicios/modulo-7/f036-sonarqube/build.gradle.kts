// F036 · SonarQube Community Build 26.11 + JaCoCo 0.8.15 + SonarScanner for Gradle 7.5.0.8588 (Spring Boot 4.1.3, JDK 25)
// ../gradlew check                   -> tests + informe de cobertura build/reports/jacoco/test/jacocoTestReport.xml
// ./sonar/analizar.sh                -> crea un token en el SonarQube de docker-compose.yml, analiza y comprueba el Quality Gate
plugins {
    java
    // JaCoCo viene con Gradle: agente durante los tests + informe XML que SonarQube importa
    jacoco
    // Versión fija del escáner (SonarScanner for Gradle): añade la tarea sonar
    alias(libs.plugins.sonarqube)
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
    implementation(libs.spring.boot.starter)
    testImplementation(libs.spring.boot.starter.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    options.compilerArgs.add("-parameters")   // el plugin de Boot lo añade solo; aquí no está aplicado
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    finalizedBy(tasks.jacocoTestReport)   // cada ejecución de los tests deja el informe de cobertura
}

jacoco {
    toolVersion = libs.versions.jacoco.get()
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required = true   // build/reports/jacoco/test/jacocoTestReport.xml: el que lee SonarQube
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestReport)   // "check" = tests + informe (en Maven, "verify")
}

// Lo que lee el escáner (se puede sobrescribir con -Dsonar.xxx=... en la línea de comandos)
sonar {
    properties {
        property("sonar.host.url", "http://localhost:9000")
        property("sonar.projectKey", "f036-sonarqube")
        property("sonar.coverage.jacoco.xmlReportPaths",
            layout.buildDirectory.file("reports/jacoco/test/jacocoTestReport.xml").get().asFile.path)
        // El build espera la decisión del Quality Gate y FALLA si no pasa
        property("sonar.qualitygate.wait", "true")
    }
}
