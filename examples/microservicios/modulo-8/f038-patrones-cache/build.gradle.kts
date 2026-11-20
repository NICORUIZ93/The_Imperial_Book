// F038 · Patrones: Read-Through, Write-Behind, Write-Through (Spring Boot 4.1.3, JDK 25, Redis 8.10.2)
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
    // JdbcClient + HikariCP para hablar con PostgreSQL
    implementation(libs.spring.boot.starter.jdbc)
    // Driver JDBC de PostgreSQL 42.7.14 (gestionado por Boot)
    runtimeOnly(libs.postgresql)
    // Abstracción de caché de Spring (@Cacheable, @CacheEvict...)
    implementation(libs.spring.boot.starter.cache)
    // Spring Data Redis 4.1.3 + Lettuce 7.5.2: con esto Boot crea un RedisCacheManager
    implementation(libs.spring.boot.starter.data.redis)
    // JUnit Jupiter 6.0.3, AssertJ 3.27.7, Mockito 5.23.0
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
