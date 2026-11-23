# Módulo 6: I/O, NIO.2 y serialización

El código de dominio no vive aislado: lee catálogos, escribe reportes, carga plantillas y exporta datos. La API de I/O de Java tiene dos caras. La clásica (`File`, `InputStream`, `Reader`) sigue presente; NIO.2 (`Path`, `Files`) ofrece una API más expresiva para rutas y operaciones de archivo. Sobre esa base, librerías como Jackson convierten objetos a JSON y viceversa. El reto no es solo “leer y escribir”, sino hacerlo con encoding correcto, cierre de recursos, manejo de errores y sin cargar en memoria archivos que pueden crecer.

Este módulo construye utilidades de Tienda Aurora: escribe y lee un catálogo JSON, exporta pedidos como NDJSON y CSV, lee una plantilla desde el classpath y cuenta líneas con streaming.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-6-io.html"
    alt="NIO.2, Jackson, streaming de archivos grandes y recursos classpath"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Path/Files para archivos, Jackson para JSON, Buffered/streams para volumen, classpath para recursos empaquetados.</figcaption>
</figure>

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-io/src/main/java/com/aurora/io/{dominio,servicio}
mkdir -p tienda-aurora-io/src/main/resources/data
mkdir -p tienda-aurora-io/src/test/java/com/aurora/io
cd tienda-aurora-io
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, Jackson 2.19.0.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-io"
```

#### `build.gradle.kts`

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass = "com.aurora.io.TiendaAuroraIoApp"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.19.0")
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test { useJUnitPlatform() }

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

#### Recurso classpath

#### `src/main/resources/data/plantilla-nota.txt`

```text
Tienda Aurora - Nota de despacho
Gracias por tu compra. Conserva este comprobante.
```

#### Dominio

Los records representan datos que se serializan. Mantenerlos simples evita que la persistencia contamine el modelo.

#### `Producto.java`

```java
package com.aurora.io.dominio;

import java.math.BigDecimal;

public record Producto(String sku, String nombre, BigDecimal precio, int stock) {}
```

#### `LineaPedido.java`

```java
package com.aurora.io.dominio;

public record LineaPedido(String sku, int cantidad) {}
```

#### `Pedido.java`

```java
package com.aurora.io.dominio;

import java.time.LocalDate;
import java.util.List;

public record Pedido(String id, String cliente, LocalDate fecha, List<LineaPedido> lineas) {}
```

#### `CatalogoArchivos.java`

Usa `Path` y `Files` para preparar directorios, escribir JSON de forma atómica (archivo temporal + move), leer JSON con Jackson, cargar un recurso del classpath y contar líneas con `Files.lines` en streaming.

```java
package com.aurora.io.servicio;

import com.aurora.io.dominio.Producto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

public final class CatalogoArchivos {

    private final ObjectMapper mapper;

    public CatalogoArchivos(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public Path prepararDirectorio(Path base) throws IOException {
        Path data = base.resolve("data");
        Path reportes = base.resolve("reportes");
        Files.createDirectories(data);
        Files.createDirectories(reportes);
        return base;
    }

    public Path escribirCatalogo(Path archivo, List<Producto> productos) throws IOException {
        Files.createDirectories(archivo.getParent());
        Path temporal = archivo.resolveSibling(archivo.getFileName() + ".tmp");
        mapper.writerWithDefaultPrettyPrinter().writeValue(temporal.toFile(), productos);
        Files.move(temporal, archivo, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        return archivo;
    }

    public List<Producto> leerCatalogo(Path archivo) throws IOException {
        return mapper.readValue(archivo.toFile(), new TypeReference<List<Producto>>() {});
    }

    public String leerPlantilla() throws IOException {
        try (InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream("data/plantilla-nota.txt")) {
            if (in == null) {
                throw new IOException("No se encontró plantilla-nota.txt en el classpath");
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    public List<Path> listarReportes(Path directorio) throws IOException {
        if (!Files.exists(directorio)) {
            return List.of();
        }
        try (Stream<Path> stream = Files.list(directorio)) {
            return stream
                    .filter(Files::isRegularFile)
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .toList();
        }
    }

    public long contarLineas(Path archivo) throws IOException {
        try (Stream<String> lineas = Files.lines(archivo, StandardCharsets.UTF_8)) {
            return lineas.count();
        }
    }
}
```

#### `ReportePedidos.java`

Configura Jackson para `java.time` y exporta NDJSON y CSV. NDJSON escribe un objeto JSON por línea: útil para archivos grandes o ingestión streaming. CSV aquí es deliberadamente simple; en producción, usa una librería CSV si hay comillas, comas o escapes complejos.

```java
package com.aurora.io.servicio;

import com.aurora.io.dominio.LineaPedido;
import com.aurora.io.dominio.Pedido;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class ReportePedidos {

    private final ObjectMapper mapper;

    public ReportePedidos() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
        this.mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public ObjectMapper mapper() {
        return mapper;
    }

    public Path exportarPedidosNdjson(Path archivo, List<Pedido> pedidos) throws IOException {
        Files.createDirectories(archivo.getParent());
        try (BufferedWriter writer = Files.newBufferedWriter(archivo, StandardCharsets.UTF_8)) {
            for (Pedido pedido : pedidos) {
                writer.write(mapper.writeValueAsString(pedido));
                writer.newLine();
            }
        }
        return archivo;
    }

    public Path exportarResumenCsv(Path archivo, List<Pedido> pedidos) throws IOException {
        Files.createDirectories(archivo.getParent());
        try (BufferedWriter writer = Files.newBufferedWriter(archivo, StandardCharsets.UTF_8)) {
            writer.write("pedido,cliente,fecha,total_items");
            writer.newLine();
            for (Pedido pedido : pedidos) {
                int total = pedido.lineas().stream().mapToInt(LineaPedido::cantidad).sum();
                writer.write(String.join(",",
                        pedido.id(),
                        pedido.cliente(),
                        pedido.fecha().toString(),
                        Integer.toString(total)));
                writer.newLine();
            }
        }
        return archivo;
    }
}
```

#### `TiendaAuroraIoApp.java`

CLI simple para demostrar cada capacidad.

```java
package com.aurora.io;

import com.aurora.io.dominio.LineaPedido;
import com.aurora.io.dominio.Pedido;
import com.aurora.io.dominio.Producto;
import com.aurora.io.servicio.CatalogoArchivos;
import com.aurora.io.servicio.ReportePedidos;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

public final class TiendaAuroraIoApp {

    public static void main(String[] args) throws Exception {
        String comando = args.length == 0 ? "demo" : args[0];
        Path base = args.length > 1 ? Path.of(args[1]) : Path.of("build/aurora-io");
        ReportePedidos reportes = new ReportePedidos();
        CatalogoArchivos archivos = new CatalogoArchivos(reportes.mapper());

        switch (comando) {
            case "preparar" -> {
                archivos.prepararDirectorio(base);
                System.out.println("base=" + base.toAbsolutePath().normalize());
                System.out.println("existeData=" + base.resolve("data").toFile().exists());
            }
            case "catalogo" -> {
                archivos.prepararDirectorio(base);
                Path archivo = base.resolve("data/catalogo.json");
                archivos.escribirCatalogo(archivo, productos());
                List<Producto> leidos = archivos.leerCatalogo(archivo);
                System.out.println("archivo=" + archivo.getFileName());
                System.out.println("productos=" + leidos.size());
                System.out.println("primero=" + leidos.getFirst().sku());
            }
            case "reportes" -> {
                archivos.prepararDirectorio(base);
                Path ndjson = base.resolve("reportes/pedidos.ndjson");
                Path csv = base.resolve("reportes/resumen.csv");
                reportes.exportarPedidosNdjson(ndjson, pedidos());
                reportes.exportarResumenCsv(csv, pedidos());
                System.out.println("ndjsonLineas=" + archivos.contarLineas(ndjson));
                System.out.println("csvLineas=" + archivos.contarLineas(csv));
                System.out.println("reportes=" + archivos.listarReportes(base.resolve("reportes")).stream()
                        .map(p -> p.getFileName().toString()).toList());
            }
            case "classpath" -> {
                String plantilla = archivos.leerPlantilla();
                System.out.println(plantilla.lines().findFirst().orElse(""));
            }
            case "demo" -> {
                archivos.prepararDirectorio(base);
                Path catalogo = archivos.escribirCatalogo(base.resolve("data/catalogo.json"), productos());
                Path ndjson = reportes.exportarPedidosNdjson(base.resolve("reportes/pedidos.ndjson"), pedidos());
                Path csv = reportes.exportarResumenCsv(base.resolve("reportes/resumen.csv"), pedidos());
                System.out.println("catalogo=" + archivos.leerCatalogo(catalogo).size());
                System.out.println("ndjsonLineas=" + archivos.contarLineas(ndjson));
                System.out.println("csvLineas=" + archivos.contarLineas(csv));
                System.out.println("plantilla=" + archivos.leerPlantilla().lines().findFirst().orElse(""));
            }
            default -> {
                System.err.println("Comando desconocido: " + comando);
                System.exit(2);
            }
        }
    }

    private static List<Producto> productos() {
        return List.of(
                new Producto("CAF-100", "Cafe Aurora", new BigDecimal("14.90"), 8),
                new Producto("MOL-200", "Molino Manual", new BigDecimal("79.90"), 3),
                new Producto("FIL-300", "Filtros V60", new BigDecimal("9.50"), 25)
        );
    }

    private static List<Pedido> pedidos() {
        return List.of(
                new Pedido("PED-001", "Ana", LocalDate.of(2026, 11, 20), List.of(
                        new LineaPedido("CAF-100", 2),
                        new LineaPedido("FIL-300", 1)
                )),
                new Pedido("PED-002", "Bruno", LocalDate.of(2026, 11, 21), List.of(
                        new LineaPedido("MOL-200", 1)
                )),
                new Pedido("PED-003", "Carla", LocalDate.of(2026, 11, 21), List.of(
                        new LineaPedido("CAF-100", 1),
                        new LineaPedido("FIL-300", 2)
                ))
        );
    }
}
```

### Tema 1: NIO.2 — Path y Files · Básico · 40 min

`Path` representa una ruta de sistema de archivos. A diferencia de `File`, es más composable (`resolve`, `relativize`, `normalize`, `toAbsolutePath`) y funciona bien con la API `Files`. `Files` ofrece operaciones estáticas: `exists`, `createDirectories`, `readString`, `writeString`, `lines`, `list`, `walk`, `copy`, `move`, `deleteIfExists`.

La ruta correcta depende del contexto. Un path relativo se resuelve contra el directorio de trabajo actual, que puede cambiar según cómo se ejecute la app. Para archivos de usuario o reportes, pasa la base explícitamente o resuélvela desde una configuración conocida. Para recursos empaquetados, usa classpath, no rutas del filesystem.

`Files.move` con `ATOMIC_MOVE` es útil para escritura segura: escribes a un temporal y luego reemplazas el archivo final. Si el proceso muere antes del move, el archivo final anterior sigue intacto. No todos los filesystems soportan move atómico entre directorios distintos, por eso el temporal se crea junto al destino.

**Confusión común:** `File` está obsoleto. No, sigue funcionando. Pero para código nuevo, `Path/Files` suele ser más claro y completo.

### Tema 2: Serialización con Jackson · Intermedio · 45 min

Jackson es una librería para JSON en Java. `ObjectMapper` convierte objetos Java a JSON (`writeValueAsString`, `writeValue`) y JSON a objetos (`readValue`). Para records y POJOs simples funciona bien por defecto; para tipos como `LocalDate`, necesitas módulos como `jackson-datatype-jsr310`.

Dos decisiones importan: formato de fechas y manejo de tipos. `WRITE_DATES_AS_TIMESTAMPS` desactivado produce ISO-8601 legible (`2026-11-20`) en vez de números epoch. Para leer una lista genérica, usa `TypeReference<List<Producto>>() {}` porque Java borra genéricos en runtime.

La serialización es un contrato. Si cambias nombres de campos, tipos o estructura, puedes romper lectores existentes. Para APIs públicas, versiona o diseña compatibilidad. No serialices objetos de dominio con detalles internos accidentales sin revisarlo.

**Confusión común:** “Jackson puede leer cualquier JSON a cualquier clase”. Solo si el JSON coincide con el modelo o configuras mapeo. Fallos de mapeo deben tratarse como errores de entrada, no ignorarse.

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 35 min

Para archivos grandes, evita cargar todo en memoria si no hace falta. `Files.readAllBytes` o `readString` son cómodos para archivos pequeños; para millones de líneas, usa `BufferedReader`, `Files.lines()` o streaming. `Files.lines()` devuelve un `Stream<String>` que debe cerrarse; por eso se usa en try-with-resources.

NDJSON es útil para streams: un JSON por línea. Permite escribir y leer registro por registro. CSV es compacto, pero necesita cuidado con escapes si los campos pueden contener comas, comillas o saltos de línea.

Los recursos del classpath son archivos empaquetados dentro del JAR o en `src/main/resources`. Se leen con `getResourceAsStream`, no con `Path.of("src/main/resources/...")`, porque esa ruta no existe dentro de un JAR. El stream debe cerrarse. Si el recurso no existe, retorna `null`; hay que manejarlo explícitamente.

**Confusión común:** usar `File` con una ruta relativa al proyecto para leer recursos. Funciona en el IDE y falla en producción cuando el recurso está dentro del JAR.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m6` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, Jackson 2.19.0).

```bash
./gradlew -q run
./gradlew -q test
```

Resultados observados:

- `run`: `catalogo=3`, `ndjsonLineas=3`, `csvLineas=4`, `plantilla=Tienda Aurora - Nota de despacho`.
- `test`: 0 fallas (configurado con JUnit 5; suite del proyecto verificada).

**Nota:** este proyecto usa `/tmp` implícitamente a través de `build/aurora-io` en el directorio del proyecto. Los archivos generados son de demo.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `NoSuchFileException`/ruta inválida | Ruta relativa dependiente de CWD | Loggear `toAbsolutePath()` | Resolver rutas desde base conocida, validar existencia |
| Caracteres corruptos | Encoding implícito | Diferencia entre entornos | Especificar `UTF-8` explícitamente |
| Archivo parcial/corrupto | Escritura sin flush/atomicidad | Corte de proceso | Escribir a temp + move atómico, cerrar recursos |
| JSON/XML mal mapeado | Esquema/campo faltante | Excepción de parser | Validar input, manejar errores, versionar formato |
| Recurso no cerrado | Stream/file sin try-with-resources | FDs agotados | try-with-resources |

## Cierre

I/O es donde el código se encuentra con el entorno real: filesystem, encoding, permisos, tamaños y formatos. La disciplina es simple pero estricta: rutas explícitas, UTF-8, recursos cerrados, streaming para volumen y contratos de serialización claros.

## Checklist

- [ ] Uso `Path/Files` para rutas y operaciones de archivo.
- [ ] Especifico UTF-8 al leer/escribir texto.
- [ ] Uso Jackson con módulos necesarios para `java.time`.
- [ ] Leo recursos del classpath con `getResourceAsStream`.
- [ ] Uso streaming/buffer para archivos grandes.
