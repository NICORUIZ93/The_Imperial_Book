# Módulo 6: I/O, NIO.2 y serialización

Casi toda aplicación real lee o escribe datos: archivos, JSON, configuración, reportes, cargas masivas. Java ofrece `java.io` clásico y la API moderna NIO.2 (`java.nio.file`). Este módulo enseña a manipular archivos con `Path/Files`, serializar JSON con Jackson y procesar archivos grandes sin cargar todo en memoria.

**Entorno de referencia verificado (2026-05-22):** JDK 27. Jackson 2.18.2 verificado descargando JARs desde Maven Central.

## Aprende construyendo

### Tema 1: NIO.2 — Path y Files · Intermedio · 40 min

Necesitas guardar un reporte, leerlo, crear directorios y listar archivos. Las rutas como strings son frágiles entre sistemas operativos; NIO.2 ofrece una API más robusta.

#### NIO.2 (`java.nio.file`)

**Definición formal.** API moderna de I/O de archivos introducida en Java 7, centrada en `Path`, `Files` y proveedores de sistema de archivos.

**Para qué sirve.** Operaciones ricas y portables sobre archivos/directorios: crear, copiar, mover, listar, leer, escribir.

**Cuándo usarlo y cuándo no.** Úsalo en código nuevo. Usa `java.io.File` solo por compatibilidad con APIs legadas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m6-t1-nio && cd /tmp/java-m6-t1-nio
```

```java
import java.nio.file.*;
public class DemoNio2 {
    public static void main(String[] args) throws Exception {
        Path p = Path.of("demo.txt");
        Files.writeString(p, "hola");
        System.out.println(Files.exists(p));
        Files.deleteIfExists(p);
    }
}
```

**Caso de uso real.** Generar reportes en disco temporal y limpiarlos.

**Error común.** Asumir que el directorio padre existe. Síntoma: `NoSuchFileException`. Corrección: `Files.createDirectories`.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### `Path`

**Definición formal.** Objeto inmutable que representa una ruta en el sistema de archivos. No implica que exista.

**Para qué sirve.** Construir rutas portables con `Path.of`, `resolve`, `normalize`.

**Cuándo usarlo y cuándo no.** Úsalo siempre para rutas. No concatenes strings con `/` o `\`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m6-t1-path && cd /tmp/java-m6-t1-path
```

```java
import java.nio.file.*;
public class DemoPath {
    public static void main(String[] args) {
        Path base = Path.of("salida");
        Path archivo = base.resolve("reporte.txt");
        System.out.println(archivo.toString().endsWith("reporte.txt"));
    }
}
```

**Caso de uso real.** Componer ruta de exportación `base/fecha/archivo.csv`.

**Error común.** Usar concatenación de strings. Síntoma: rutas rotas en otro SO. Corrección: `Path.of(...).resolve(...)`.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### `Files`

**Definición formal.** Clase utilitaria con operaciones estáticas sobre archivos y directorios.

**Para qué sirve.** Leer/escribir/copiar/mover/listar/check existencia/permisos.

**Cuándo usarlo y cuándo no.** Úsalo para operaciones comunes. Cierra streams devueltos por `Files.list/walk/lines`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m6-t1-files && cd /tmp/java-m6-t1-files
```

```java
import java.nio.file.*;
import java.util.*;
public class DemoFiles {
    public static void main(String[] args) throws Exception {
        Path dir = Path.of("d");
        Files.createDirectories(dir);
        Files.writeString(dir.resolve("a.txt"), "A");
        try (var s = Files.list(dir)) { System.out.println(s.count()); }
        Files.deleteIfExists(dir.resolve("a.txt"));
        Files.deleteIfExists(dir);
    }
}
```

**Caso de uso real.** Listar archivos pendientes de procesar.

**Error común.** No cerrar `Files.list`. Síntoma: fuga de descriptor en algunos SO. Corrección: try-with-resources.

**Verificación (JDK 27, 2026-05-22).** Salida: `1`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m6-t1 && cd /tmp/java-m6-t1
```

```java
import java.io.IOException;
import java.nio.file.*;
public class DemoNio {
    public static void main(String[] args) throws IOException {
        Path dir = Path.of("salida");
        Files.createDirectories(dir);
        Path archivo = dir.resolve("reporte.txt");
        Files.writeString(archivo, "id,total\nG-1,100\n");
        System.out.println(Files.exists(archivo));
        System.out.println(Files.readString(archivo).trim());
        try (var paths = Files.list(dir)) {
            paths.forEach(p -> System.out.println(p.getFileName()));
        }
        Files.deleteIfExists(archivo);
        Files.deleteIfExists(dir);
    }
}
```

#### Recorrido del código

`Path.of/resolve` construyen rutas portables. `createDirectories` asegura el directorio. `writeString/readString` simplifican archivos pequeños. `Files.list` se cierra con try-with-resources.

#### Ejecución y salida real

```bash
javac DemoNio.java
java DemoNio
```

```text
true
id,total
G-1,100
reporte.txt
```

#### Errores frecuentes

Concatenar rutas, no cerrar streams, ignorar `IOException`.

#### Verificación

Cambiar a `Path.of("tmp","salida")` y confirmar creación anidada.


### Tema 2: Serialización con Jackson · Intermedio · 40 min

Recibes y envías JSON. Quieres mapear Java↔JSON sin parsing manual frágil.

#### Serialización

**Definición formal.** Transformar un objeto en una representación externa (JSON, bytes, etc.).

**Para qué sirve.** Enviar/guardar datos en APIs, archivos o mensajes.

**Cuándo usarlo y cuándo no.** Úsalo para intercambio de datos. No serialices campos sensibles sin control.

**Ejemplo mínimo enfocado (ejecutable, con Jackson 2.18.2 en classpath).**

```bash
mkdir -p /tmp/java-m6-t2-ser && cd /tmp/java-m6-t2-ser
curl -sL -o jackson-databind.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.18.2/jackson-databind-2.18.2.jar
curl -sL -o jackson-core.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.18.2/jackson-core-2.18.2.jar
curl -sL -o jackson-annotations.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.18.2/jackson-annotations-2.18.2.jar
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;
record Guia(String codigo) {}
public class DemoSer {
    public static void main(String[] args) throws Exception {
        System.out.println(new ObjectMapper().writeValueAsString(new Guia("G1")));
    }
}
```

**Caso de uso real.** Responder JSON desde un endpoint.

**Error común.** Exponer secretos al serializar. Corrección: DTOs específicos, `@JsonIgnore` o filtrado.

**Verificación (JDK 27, Jackson 2.18.2, 2026-05-22).**

```bash
javac -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoSer.java
java -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoSer
```

```text
{"codigo":"G1"}
```

#### Deserialización

**Definición formal.** Reconstruir un objeto desde una representación externa.

**Para qué sirve.** Leer input JSON de clientes, archivos o mensajes.

**Cuándo usarlo y cuándo no.** Úsalo con validación. No confíes ciegamente en input externo.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import com.fasterxml.jackson.databind.ObjectMapper;
record Guia(String codigo) {}
public class DemoDeser {
    public static void main(String[] args) throws Exception {
        Guia g = new ObjectMapper().readValue("{\"codigo\":\"G1\"}", Guia.class);
        System.out.println(g.codigo());
    }
}
```

**Caso de uso real.** Recibir body JSON en un POST.

**Error común.** Cambiar esquema sin compatibilidad. Síntoma: error de deserialización. Corrección: versionado, campos opcionales, configuración de ignorar desconocidos con criterio.

**Verificación (JDK 27, Jackson 2.18.2, 2026-05-22).** Salida: `G1`.

#### Jackson `ObjectMapper` y contrato de esquema

**Definición formal.** `ObjectMapper` es el punto principal de Jackson para data-binding JSON. El contrato de esquema es la estructura esperada de nombres/tipos/obligatoriedad.

**Para qué sirve.** Mapear JSON↔POJO/record de forma consistente.

**Cuándo usarlo y cuándo no.** Úsalo para JSON en Java. Valida el esquema/negocio; Jackson no reemplaza validación.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import com.fasterxml.jackson.databind.ObjectMapper;
record Guia(String codigo, String ciudad, double peso) {}
public class DemoMapper {
    public static void main(String[] args) throws Exception {
        ObjectMapper m = new ObjectMapper();
        String json = m.writeValueAsString(new Guia("G-1","Madrid",2.5));
        Guia g = m.readValue(json, Guia.class);
        System.out.println(g.ciudad());
    }
}
```

**Caso de uso real.** Contratos JSON entre microservicios.

**Error común.** Confiar en deserialización sin validación. Corrección: Bean Validation/reglas de dominio después de parsear.

**Verificación (JDK 27, Jackson 2.18.2, 2026-05-22).** Salida: `Madrid`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m6-t2 && cd /tmp/java-m6-t2
# descargar jars Jackson 2.18.2 (databind, core, annotations)
```

```java
public record Guia(String codigo, String ciudad, double peso) {}
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;
public class DemoJackson {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Guia guia = new Guia("G-1", "Madrid", 2.5);
        String json = mapper.writeValueAsString(guia);
        System.out.println(json);
        Guia leida = mapper.readValue(json, Guia.class);
        System.out.println(leida.codigo());
    }
}
```

#### Recorrido del código

`ObjectMapper` serializa el record a JSON y lo reconstruye. El record define el contrato de campos.

#### Ejecución y salida real

```bash
javac -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" Guia.java DemoJackson.java
java -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoJackson
```

```text
{"codigo":"G-1","ciudad":"Madrid","peso":2.5}
G-1
```

#### Errores frecuentes

Falta de dependencia, esquema incompatible, confiar en input sin validar.

#### Verificación

Cambiar un nombre de campo y observar el efecto al deserializar.


### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 40 min

Cuando el archivo crece, `readAllLines` o cargar todo en memoria deja de ser viable. Además, algunos recursos vienen empaquetados dentro del JAR.

#### Streams de líneas (`Files.lines`)

**Definición formal.** `Files.lines(Path)` devuelve un `Stream<String>` perezoso sobre las líneas del archivo, que debe cerrarse.

**Para qué sirve.** Procesar archivos grandes línea a línea sin cargar todo en memoria.

**Cuándo usarlo y cuándo no.** Úsalo para archivos grandes o procesamiento secuencial. Para archivos pequeños, `readAllLines` puede ser simple.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m6-t3-lines && cd /tmp/java-m6-t3-lines
```

```java
import java.nio.file.*;
import java.util.stream.*;
public class DemoLines {
    public static void main(String[] args) throws Exception {
        Path p = Path.of("d.csv");
        Files.writeString(p, "a\nb\nc\n");
        try (Stream<String> s = Files.lines(p)) { System.out.println(s.count()); }
        Files.deleteIfExists(p);
    }
}
```

**Caso de uso real.** Contar/importar registros de un CSV grande.

**Error común.** No cerrar el stream. Síntoma: fuga de descriptor. Corrección: try-with-resources.

**Verificación (JDK 27, 2026-05-22).** Salida: `3`.

#### Lectura perezosa / no cargar todo en memoria

**Definición formal.** Procesar datos bajo demanda, manteniendo solo la porción actual en memoria.

**Para qué sirve.** Escalar a archivos grandes con memoria acotada.

**Cuándo usarlo.** Cuando el tamaño puede exceder memoria cómoda o no se necesita todo a la vez.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m6-t3-lazy && cd /tmp/java-m6-t3-lazy
```

```java
import java.nio.file.*;
import java.util.stream.*;
public class DemoLazy {
    public static void main(String[] args) throws Exception {
        Path p = Path.of("d.csv");
        Files.writeString(p, "1\n2\n3\n4\n");
        try (Stream<String> s = Files.lines(p)) {
            System.out.println(s.filter(x -> Integer.parseInt(x) % 2 == 0).count());
        }
        Files.deleteIfExists(p);
    }
}
```

**Caso de uso real.** Filtrar errores en un log grande.

**Error común.** Usar `Files.readAllLines` en GBs. Síntoma: `OutOfMemoryError`. Corrección: stream perezoso.

**Verificación (JDK 27, 2026-05-22).** Salida: `2`.

#### Recursos del classpath

**Definición formal.** Recursos empaquetados junto con clases (en JAR o directorio de clases), accesibles por `ClassLoader.getResourceAsStream`.

**Para qué sirve.** Leer configuración/plantillas incluidas en la aplicación.

**Cuándo usarlo y cuándo no.** Úsalo para recursos read-only empaquetados. No lo uses para archivos que el usuario debe modificar en runtime.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m6-t3-cp && cd /tmp/java-m6-t3-cp
mkdir -p resources
echo "hola" > resources/saludo.txt
```

```java
import java.io.*;
public class DemoClasspath {
    public static void main(String[] args) throws Exception {
        try (InputStream is = DemoClasspath.class.getClassLoader().getResourceAsStream("saludo.txt")) {
            System.out.println(new String(is.readAllBytes()).trim());
        }
    }
}
```

**Caso de uso real.** Leer plantilla SQL o JSON por defecto.

**Error común.** Tratar recurso de classpath como `Path` de archivo físico en JAR. Síntoma: falla en empaquetado. Corrección: `getResourceAsStream`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoClasspath.java
java -cp ".:resources" DemoClasspath
```

```text
hola
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m6-t3 && cd /tmp/java-m6-t3
```

```java
import java.io.IOException;
import java.nio.file.*;
import java.util.stream.*;
public class Lineas {
    public static void main(String[] args) throws IOException {
        Path csv = Path.of("guias.csv");
        Files.writeString(csv, "G-1,100\nG-2,200\nG-3,300\n");
        try (Stream<String> lineas = Files.lines(csv)) {
            long total = lineas.filter(l -> !l.isBlank()).count();
            System.out.println(total);
        }
        Files.deleteIfExists(csv);
    }
}
```

#### Recorrido del código

`Files.lines` crea un stream perezoso. El try-with-resources garantiza cierre. Solo se mantiene la línea actual en procesamiento.

#### Ejecución y salida real

```bash
javac Lineas.java
java Lineas
```

```text
3
```

#### Errores frecuentes

Cargar todo el archivo, no cerrar stream, o leer recursos de classpath como archivo físico.

#### Verificación

Generar un archivo mayor y confirmar que el conteo sigue correcto sin cambiar el enfoque.

## Cierre del módulo

NIO.2 da rutas portables y operaciones seguras de archivos; Jackson resuelve el mapeo JSON con un contrato explícito; y los streams perezosos permiten procesar archivos grandes con memoria acotada. La regla operativa es cerrar recursos, validar entradas y elegir la API según tamaño y origen del dato.
