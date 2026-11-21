// M0 · Tema 7 · build de rutaflow-nucleo. Kotlin DSL, toolchain de Java 25 y catálogo de versiones.
// En este curso solo se usa; por qué funciona así se estudia en el curso de Gradle.
plugins {
    application
}

group = "rutaflow"
version = "0.1.0"

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
    mainClass = "rutaflow.nucleo.Cotizador"
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    // El toolchain decide con qué JDK se compila; `release` fija contra qué API y con qué formato de clase
    // sale el .class. Sin esta línea, en una máquina con JDK 27 el proyecto compilado aquí daría formato 71
    // y el módulo promete 69. Con ella, el número 69 no depende de qué JDK esté instalado.
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
}

tasks.jar {
    manifest {
        attributes("Main-Class" to application.mainClass.get())
    }
}
