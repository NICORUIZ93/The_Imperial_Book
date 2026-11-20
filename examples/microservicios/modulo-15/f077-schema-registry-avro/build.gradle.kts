// F077 · Schema Registry y Avro (Spring Boot 4.1.3, JDK 25, Confluent Platform 8.4.1, Avro 1.12.2)
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

// Configuración aparte para la herramienta que genera código: no entra en el classpath de la aplicación.
// avro-tools es un jar autónomo (se ejecuta con java -jar), por eso no hacen falta sus dependencias transitivas.
val avroTools by configurations.creating {
    isTransitive = false
}

dependencies {
    avroTools(libs.avro.tools)
    implementation(libs.spring.boot.starter.kafka)
    // Avro: el formato binario y las clases generadas
    // Avro: el formato binario y las clases generadas
    implementation(libs.avro)
    // KafkaAvroSerializer / KafkaAvroDeserializer: hablan con Schema Registry
    // KafkaAvroSerializer / KafkaAvroDeserializer: hablan con Schema Registry
    implementation(libs.kafka.avro.serializer)
    testImplementation(libs.spring.boot.starter.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

// Genera academia.avro.Pedido desde src/main/avro/pedido.avsc antes de compilar
// (en Maven: avro-maven-plugin, goal schema, fase generate-sources, stringType String).
val generarAvro by tasks.registering(JavaExec::class) {
    group = "build"
    description = "Genera las clases Java de los esquemas Avro de src/main/avro"
    classpath = avroTools
    mainClass = "org.apache.avro.tool.Main"
    val salida = layout.buildDirectory.dir("generated-sources/avro")
    inputs.dir("src/main/avro")
    outputs.dir(salida)
    // -string: los campos string se generan como java.lang.String (no CharSequence/Utf8)
    args("compile", "-string", "schema", "src/main/avro", salida.get().asFile.path)
}

sourceSets {
    main {
        java {
            srcDir(generarAvro)   // el código generado se compila con el resto y compileJava depende de generarAvro
        }
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
    // Avro 1.12.2 solo carga por nombre las clases de paquetes de confianza (ClassSecurityValidator):
    // sin esta propiedad de sistema falla con SecurityException «Forbidden academia.avro.Pedido!».
    // Aquí para los tests; RegistroApp la fija en main() para la aplicación.
    systemProperty("org.apache.avro.SERIALIZABLE_PACKAGES", "academia.avro")
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
