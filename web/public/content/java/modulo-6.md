# Módulo 6: I/O, NIO.2 y serialización


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 6 — mapa visual](/visuals/temas/java/modulo-6-genericos.html)

Lectura: Los genéricos mueven errores de tipo a compile-time y eliminan casts inseguros.


Tienda Aurora no vive solo en memoria. El catálogo se carga desde archivos, los pedidos se exportan para integraciones, los reportes se generan como CSV y los recursos empaquetados viajan dentro de la aplicación. Cuando el I/O está mal hecho, aparecen bugs silenciosos: rutas que solo funcionan en la máquina del desarrollador, archivos medio escritos, JSON inválido, encoding inconsistente o cargas completas de archivos enormes en memoria.

Este módulo construye `tienda-aurora-io`, una app de consola que usa NIO.2 para trabajar con rutas y archivos, Jackson para serializar JSON, y streams/lectura por líneas para tratar archivos como secuencias. También muestra la diferencia entre leer un archivo del sistema de archivos y leer un recurso del classpath.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, Jackson Databind 2.19.0, Jackson JSR310 2.19.0, macOS arm64. El proyecto se compiló con `./gradlew -q build`. La salida de `demo` y los archivos generados son reales.

## Proyecto desde cero: tienda-aurora-io

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-java-m6/src/main/java/com/aurora/io/{dominio,servicio}
mkdir -p tienda-aurora-java-m6/src/test/java/com/aurora/io
cd tienda-aurora-java-m6
gradle wrapper --gradle-version 9.9.1
```

## Estructura del proyecto

```text
tienda-aurora-io/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        ├── java/com/aurora/io/
        │   ├── TiendaAuroraIoApp.java
        │   ├── dominio/
        │   │   ├── LineaPedido.java
        │   │   ├── Pedido.java
        │   │   └── Producto.java
        │   └── servicio/
        │       ├── CatalogoArchivos.java
        │       └── ReportePedidos.java
        └── resources/
            └── data/
                └── plantilla-nota.txt
```

## build.gradle.kts

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
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-io"
```

## Código completo

Nombre del proyecto Gradle.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-io"
```

Configura Java 25 y la app de consola. Añade Jackson Databind y el módulo JSR-310 para serializar `LocalDate`. La dependencia es de runtime/compilación normal porque el código importa clases de Jackson.

**Archivo:** `build.gradle.kts`

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
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

Recurso empaquetado en el classpath. No se lee por ruta del sistema de archivos del proyecto, sino como recurso del classpath; eso lo hace válido cuando la app corre desde el JAR o desde el directorio de clases.

**Archivo:** `src/main/resources/data/plantilla-nota.txt`

```text
Tienda Aurora - Nota de despacho
Gracias por tu compra. Conserva este comprobante.
```

Record simple para el catálogo. Jackson puede serializarlo y deserializarlo por nombres de componentes.

**Archivo:** `src/main/java/com/aurora/io/dominio/Producto.java`

```java
package com.aurora.io.dominio;

import java.math.BigDecimal;

public record Producto(String sku, String nombre, BigDecimal precio, int stock) {}
```

Línea de pedido con SKU y cantidad.

**Archivo:** `src/main/java/com/aurora/io/dominio/LineaPedido.java`

```java
package com.aurora.io.dominio;

public record LineaPedido(String sku, int cantidad) {}
```

Pedido con fecha `LocalDate`. Por eso el `ObjectMapper` registra `JavaTimeModule`.

**Archivo:** `src/main/java/com/aurora/io/dominio/Pedido.java`

```java
package com.aurora.io.dominio;

import java.time.LocalDate;
import java.util.List;

public record Pedido(String id, String cliente, LocalDate fecha, List<LineaPedido> lineas) {}
```

Servicio de I/O para catálogo y utilidades de archivos. Usa NIO.2 (`Path`, `Files`, `createDirectories`, `move`, `list`, `lines`) y Jackson para JSON. El método `escribirCatalogo` escribe a un temporal y luego hace `move` atómico para evitar dejar un archivo medio escrito.

**Archivo:** `src/main/java/com/aurora/io/servicio/CatalogoArchivos.java`

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

Exporta pedidos a NDJSON y resumen CSV. NDJSON escribe un objeto JSON por línea, lo que permite procesar archivos grandes línea por línea. El CSV se escribe con `BufferedWriter` para no construir todo en memoria.

**Archivo:** `src/main/java/com/aurora/io/servicio/ReportePedidos.java`

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

CLI que prepara directorios, escribe/lee catálogo, exporta reportes y lee la plantilla del classpath. Los comandos devuelven salidas verificables.

**Archivo:** `src/main/java/com/aurora/io/TiendaAuroraIoApp.java`

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

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
./gradlew -q run --args="demo build/aurora-io"
```

```text
catalogo=3
ndjsonLineas=3
csvLineas=4
plantilla=Tienda Aurora - Nota de despacho
```

Archivo generado `data/catalogo.json`:

```json
[ {
  "sku" : "CAF-100",
  "nombre" : "Cafe Aurora",
  "precio" : 14.90,
  "stock" : 8
}, {
  "sku" : "MOL-200",
  "nombre" : "Molino Manual",
  "precio" : 79.90,
  "stock" : 3
}, {
  "sku" : "FIL-300",
  "nombre" : "Filtros V60",
  "precio" : 9.50,
  "stock" : 25
} ]
```

Archivo generado `reportes/pedidos.ndjson`:

```text
{"id":"PED-001","cliente":"Ana","fecha":"2026-11-20","lineas":[{"sku":"CAF-100","cantidad":2},{"sku":"FIL-300","cantidad":1}]}
{"id":"PED-002","cliente":"Bruno","fecha":"2026-11-21","lineas":[{"sku":"MOL-200","cantidad":1}]}
{"id":"PED-003","cliente":"Carla","fecha":"2026-11-21","lineas":[{"sku":"CAF-100","cantidad":1},{"sku":"FIL-300","cantidad":2}]}
```

Archivo generado `reportes/resumen.csv`:

```csv
pedido,cliente,fecha,total_items
PED-001,Ana,2026-11-20,3
PED-002,Bruno,2026-11-21,1
PED-003,Carla,2026-11-21,3
```

## Conceptos cubiertos

### Tema 1: NIO.2 — Path y Files · Intermedio · 40 min

NIO.2 es la API moderna de archivos de Java, en los paquetes `java.nio.file`. Su pieza central es `Path`, que representa una ruta. A diferencia de `File`, `Path` trabaja bien con el sistema de archivos moderno, se compone con `resolve`, y se usa junto con la clase utilitaria `Files`.

En el proyecto, `prepararDirectorio` crea la estructura base:

```java
Path data = base.resolve("data");
Path reportes = base.resolve("reportes");
Files.createDirectories(data);
Files.createDirectories(reportes);
return base;
```

`resolve` no toca el disco; solo construye una ruta hija. `Files.createDirectories` sí toca el disco y es idempotente: si el directorio ya existe, no falla. Eso lo hace seguro para inicialización.

El caso más importante es escribir sin dejar archivos corruptos. `escribirCatalogo` serializa primero a un archivo temporal y luego mueve:

```java
Path temporal = archivo.resolveSibling(archivo.getFileName() + ".tmp");
mapper.writerWithDefaultPrettyPrinter().writeValue(temporal.toFile(), productos);
Files.move(temporal, archivo, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
```

Este patrón evita que un proceso que falla a mitad de escritura deje `catalogo.json` incompleto. La escritura ocurre en el temporal; el reemplazo final es un movimiento. `ATOMIC_MOVE` pide al sistema de archivos que haga el reemplazo como operación atómica cuando sea posible. Si el filesystem o el destino no lo soporta, hay que tener un plan de fallback; en este entorno local funcionó correctamente.

NIO.2 también sirve para listar y leer. `listarReportes` usa `Files.list` con try-with-resources porque el stream devuelto por `Files.list` mantiene un handle del directorio. Si no se cierra, se filtra un recurso del sistema. `contarLineas` usa `Files.lines`, que también debe cerrarse.

### Tema 2: Serialización con Jackson · Intermedio · 40 min

Serializar es convertir un objeto en un formato que se pueda guardar o enviar. Deserializar es el camino inverso. En aplicaciones Java modernas, JSON es el formato más común para APIs y archivos de intercambio; Jackson es una biblioteca ampliamente usada para eso.

En este proyecto, `ReportePedidos` configura el `ObjectMapper`:

```java
this.mapper = new ObjectMapper();
this.mapper.registerModule(new JavaTimeModule());
this.mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
```

`ObjectMapper` es el punto central de Jackson. Sabe convertir objetos Java a JSON y viceversa. Por defecto, Jackson no siempre representa fechas Java Time como uno espera; registrar `JavaTimeModule` y desactivar `WRITE_DATES_AS_TIMESTAMPS` hace que `LocalDate` se serialice como `"2026-11-20"` en vez de un número/timestamp.

Para leer el catálogo se usa un `TypeReference`:

```java
return mapper.readValue(archivo.toFile(), new TypeReference<List<Producto>>() {});
```

El `TypeReference` es necesario porque en tiempo de ejecución Java borra los genéricos por type erasure. Si pidieras solo `List.class`, Jackson no sabría que los elementos son `Producto`. El `TypeReference` preserva esa información de tipo.

También hay que ser cuidadoso con lo que se serializa. No serialices secretos, tokens, contraseñas ni datos internos que no quieres exponer. Y cuando deserialices datos externos, valida el resultado: un JSON bien formado puede seguir siendo un dato de negocio inválido. Jackson resuelve el formato; tu dominio debe resolver las reglas.

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 40 min

No todos los archivos deben cargarse completos en memoria. Un CSV de millones de filas o un NDJSON de eventos puede agotar el heap si haces `readAllBytes` o `readAllLines` sin necesidad. La alternativa es procesar por flujo o por línea.

En `ReportePedidos.exportarPedidosNdjson`, cada pedido se escribe como una línea JSON independiente:

```java
try (BufferedWriter writer = Files.newBufferedWriter(archivo, StandardCharsets.UTF_8)) {
    for (Pedido pedido : pedidos) {
        writer.write(mapper.writeValueAsString(pedido));
        writer.newLine();
    }
}
```

NDJSON (newline-delimited JSON) es útil para exportaciones grandes porque permite leer un registro por línea sin parsear un arreglo JSON gigante completo. El `BufferedWriter` amortigua escrituras y el try-with-resources garantiza el cierre.

Para contar líneas se usa `Files.lines`:

```java
try (Stream<String> lineas = Files.lines(archivo, StandardCharsets.UTF_8)) {
    return lineas.count();
}
```

`Files.lines` devuelve un stream perezoso que lee conforme avanza. Es apropiado para procesar archivos línea por línea. Aun así, hay que cerrarlo; por eso está dentro de try-with-resources.

El classpath es otro origen de datos. Un recurso del classpath no es “un archivo en src/main/resources” cuando la app está empaquetada; es una entrada accesible por el classloader. Por eso `leerPlantilla()` usa:

```java
try (InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream("data/plantilla-nota.txt")) {
    if (in == null) {
        throw new IOException("No se encontró plantilla-nota.txt en el classpath");
    }
    return new String(in.readAllBytes(), StandardCharsets.UTF_8);
}
```

Este enfoque funciona en desarrollo y también cuando el recurso está dentro de un JAR. El error común es usar `new File("src/main/resources/...")`, que solo funciona en el árbol fuente y se rompe al empaquetar o ejecutar desde otro directorio.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m6` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run --args="demo"
```

Resultados observados:

- `test`: 0 fallas.
- `demo`: `catalogo=3`, `ndjsonLineas=3`, `csvLineas=4`, `plantilla=Tienda Aurora - Nota de despacho`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `NoSuchFileException`/ruta inválida | Ruta relativa dependiente de CWD | Loggear `toAbsolutePath()` | Resolver rutas desde base conocida, validar existencia |
| Caracteres corruptos | Encoding implícito | Diferencia entre entornos | Especificar `UTF-8` explícitamente |
| Archivo parcial/corrupto | Escritura sin flush/atomicidad | Corte de proceso | Escribir a temp + move atómico, cerrar recursos |
| JSON/XML mal mapeado | Esquema/campo faltante | Excepción de parser | Validar input, manejar errores, versionar formato |
| Recurso no cerrado | Stream/file sin try-with-resources | FDs agotados | try-with-resources |

## Cierre

El I/O profesional en Java combina tres hábitos: usar NIO.2 para rutas y operaciones de archivo claras, serializar con un contrato explícito, y tratar archivos grandes como flujos en vez de cargar todo en memoria por reflejo. Los recursos del classpath se leen por classloader, no por rutas frágiles al árbol fuente. Cada escritura debe considerar atomicidad, encoding y cierre de recursos.

## Checklist

- Uso `Path` y `Files` en lugar de manipular rutas como strings frágiles.
- Cierro streams de `Files.list` y `Files.lines` con try-with-resources.
- Configuro Jackson explícitamente para tipos como `LocalDate` y valido datos deserializados.
- Uso escritura temporal + `move` cuando necesito evitar archivos medio escritos.
- Leo recursos del classpath con `getResourceAsStream`, no con rutas al directorio `src`.
- Para archivos grandes, prefiero procesamiento por líneas/stream antes que cargar todo en memoria.
