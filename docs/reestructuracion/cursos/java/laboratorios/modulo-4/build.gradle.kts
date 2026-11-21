// M4 · build de rutaflow-nucleo: el manifiesto de carga. Kotlin DSL, toolchain de Java 25 y catalogo de versiones.
// En este curso solo se usa; por que funciona asi se estudia en el curso de Gradle.
plugins {
    application
}

group = "rutaflow"
version = "0.5.0"

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(libs.versions.java.get().toInt())
    }
}

dependencies {
    testImplementation(platform(libs.junit.bom))
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.platform.launcher)
}

application {
    mainClass = "rutaflow.nucleo.Manifiesto"
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    // `release` fija contra que API se compila y que formato de clase sale, pase lo que pase con el toolchain.
    options.release = libs.versions.java.get().toInt()
}

tasks.named<JavaExec>("run") {
    systemProperty("stdout.encoding", "UTF-8")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "failed", "skipped")
    }
    systemProperty("stdout.encoding", "UTF-8")
}

tasks.jar {
    manifest {
        attributes("Main-Class" to application.mainClass.get())
    }
}
