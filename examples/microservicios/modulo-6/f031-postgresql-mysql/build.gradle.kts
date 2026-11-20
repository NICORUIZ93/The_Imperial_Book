// F031 · PostgreSQL y MySQL: la misma app en los dos motores
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
    // Spring Data JPA + Hibernate 7
    implementation(libs.spring.boot.starter.data.jpa)
    // Flyway 12 gestionado por Boot
    implementation(libs.spring.boot.starter.flyway)
    // Soporte de Flyway para PostgreSQL
    implementation(libs.flyway.database.postgresql)
    // Soporte de Flyway para MySQL
    implementation(libs.flyway.mysql)
    // Driver JDBC de PostgreSQL 42.7.x
    runtimeOnly(libs.postgresql)
    // Driver JDBC de MySQL (Connector/J 26.10.x)
    runtimeOnly(libs.mysql.connector.j)
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
