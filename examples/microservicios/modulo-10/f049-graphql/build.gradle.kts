// F049 · GraphQL con Spring for GraphQL 2.0 (graphql-java 25)
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
    // Spring for GraphQL 2.0.7 + graphql-java 25.1 (gestionados por Boot 4.1.3)
    implementation(libs.spring.boot.starter.graphql)
    // Transporte HTTP: POST /graphql y GraphiQL en /graphiql
    implementation(libs.spring.boot.starter.webmvc)
    // @GraphQlTest y GraphQlTester
    testImplementation(libs.spring.boot.starter.graphql.test)
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
