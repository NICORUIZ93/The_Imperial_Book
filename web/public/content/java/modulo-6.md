# Módulo 6: I/O, NIO.2 y serialización

Casi toda aplicación real lee o escribe datos: archivos, JSON, configuración, reportes, cargas masivas. Java ofrece `java.io` clásico y la API moderna NIO.2 (`java.nio.file`). Este módulo enseña a manipular archivos con `Path/Files`, serializar objetos con Jackson y procesar archivos grandes sin cargar todo en memoria.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Crear, leer, mover y listar archivos con NIO.2 |
| 2 | Serializar/deserializar JSON con Jackson |
| 3 | Procesar archivos grandes y leer recursos del classpath |

## Aprende construyendo

### Tema 1: NIO.2 — Path y Files · Intermedio · 40 min

**Caso guía**

Necesitas guardar un reporte, leerlo, crear directorios si no existen y listar archivos generados. Hacerlo con rutas como strings suele producir bugs por separadores y falta de validaciones.

**Concepto clave / modelo mental**

NIO.2 se basa en dos tipos:

- `Path`: representa una ruta. No implica que el archivo exista.
- `Files`: operaciones sobre archivos/directorios: leer, escribir, copiar, mover, borrar, listar.

Usa `Path.of(...)` en vez de concatenar strings. Prefiere métodos `Files.readString/writeString` para textos pequeños y streams/buffer para archivos grandes.

**Implementación desde cero**

```java
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

public class DemoNio {
    public static void main(String[] args) throws IOException {
        Path dir = Path.of("salida");
        Files.createDirectories(dir);

        Path archivo = dir.resolve("reporte.txt");
        Files.writeString(archivo, "id,total\nG-1,100\nG-2,150\n");
        System.out.println(Files.exists(archivo));

        String contenido = Files.readString(archivo);
        System.out.println(contenido.trim());

        try (var paths = Files.list(dir)) {
            paths.forEach(p -> System.out.println("archivo: " + p.getFileName()));
        }

        Files.deleteIfExists(archivo);
        Files.deleteIfExists(dir);
    }
}
```

**Desglose del código**

- `Path.of("salida")` crea una ruta relativa al directorio de trabajo.
- `resolve` une rutas de forma segura.
- `Files.writeString/readString` son convenientes para archivos de texto pequeños.
- `Files.list` devuelve un stream que debe cerrarse; por eso va en try-with-resources.
- `deleteIfExists` evita fallo si el archivo ya no está.

**Ejecución y salida real**

```text
true
id,total
G-1,100
G-2,150
archivo: reporte.txt
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `NoSuchFileException` | Ruta incorrecta o archivo no creado | Verifica con `exists`, crea directorios con `createDirectories` |
| `FileAlreadyExistsException` | `createFile/createDirectory` sobre algo existente | Usa `createDirectories` o `deleteIfExists` según caso |
| Fuga de recursos con `Files.list/walk` | No cerraste el stream | Usa try-with-resources |

**Verificación rápida**

```bash
javac DemoNio.java && java DemoNio
```

Cambia `Path.of("salida")` a una ruta anidada como `Path.of("tmp","salida")` y confirma que `createDirectories` crea la estructura.

### Tema 2: Serialización con Jackson · Intermedio · 40 min

**Caso guía**

Recibes y envías datos en JSON. Quieres convertir un objeto Java a JSON y volver a objeto sin escribir parsing manual.

**Concepto clave / modelo mental**

Serializar es convertir un objeto en un formato transportable (JSON). Deserializar es el proceso inverso. Jackson es una biblioteca común para esto en Java.

Piezas clave:

- `ObjectMapper`: motor de conversión.
- POJO o `record`: estructura de datos.
- Anotaciones como `@JsonProperty`, `@JsonIgnore` cuando el nombre o visibilidad no coincide.

> **Nota:** este ejemplo requiere la dependencia Jackson en el classpath. Con Maven: `com.fasterxml.jackson.core:jackson-databind`.

**Implementación desde cero**

```java
import com.fasterxml.jackson.databind.ObjectMapper;

public class DemoJackson {
    record Guia(String id, String destino, int pesoKg) {}

    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Guia guia = new Guia("G-1", "Madrid", 3);

        String json = mapper.writeValueAsString(guia);
        System.out.println(json);

        Guia leida = mapper.readValue(json, Guia.class);
        System.out.println(leida.id());
        System.out.println(leida.destino());
        System.out.println(leida.pesoKg());
    }
}
```

**Desglose del código**

- `writeValueAsString` serializa el objeto a JSON.
- `readValue` deserializa el JSON al tipo indicado.
- Un `record` funciona bien como DTO simple.
- Jackson necesita acceso a campos/componentes o configuración adecuada; si falla la deserialización, revisa nombres, constructor y módulos.

**Ejecución y salida real**

```text
{"id":"G-1","destino":"Madrid","pesoKg":3}
G-1
Madrid
3
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ClassNotFoundException`/NoClassDefFound | Jackson no está en el classpath | Agrega la dependencia correcta |
| Propiedades no mapean | Nombre JSON distinto al campo | Usa `@JsonProperty` o configura naming strategy |
| Falla al deserializar record/POJO | Falta constructor/configuración | Verifica compatibilidad de Jackson y estructura del tipo |

**Verificación rápida**

Compila y ejecuta con Jackson en el classpath. Cambia una clave JSON y observa el error de mapeo; eso te enseña a leer fallos de deserialización.

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 40 min

**Caso guía**

Debes procesar un archivo grande línea por línea sin cargarlo entero en memoria. Además, necesitas leer una plantilla de configuración empaquetada dentro del JAR.

**Concepto clave / modelo mental**

- Para archivos grandes, usa streaming: `BufferedReader`, `Files.lines`, o lectura por chunks.
- Para recursos empaquetados en el classpath, no uses rutas del sistema de archivos; usa `getResourceAsStream`.
- Los streams de I/O deben cerrarse.

**Implementación desde cero**

```java
import java.io.*;
import java.nio.file.*;
import java.util.stream.*;

public class DemoArchivoGrande {
    public static void main(String[] args) throws Exception {
        Path ruta = Path.of("grande.txt");
        Files.write(ruta, IntStream.rangeClosed(1, 5)
            .mapToObj(i -> "linea-" + i)
            .toList());

        try (BufferedReader br = Files.newBufferedReader(ruta)) {
            String linea;
            while ((linea = br.readLine()) != null) {
                if (linea.endsWith("3")) {
                    System.out.println(linea);
                }
            }
        }

        try (InputStream in = DemoArchivoGrande.class.getResourceAsStream("/config.txt")) {
            if (in != null) {
                System.out.println(new String(in.readAllBytes()).trim());
            } else {
                System.out.println("recurso no encontrado");
            }
        }

        Files.deleteIfExists(ruta);
    }
}
```

**Desglose del código**

- `Files.newBufferedReader` lee eficientemente línea por línea.
- El `while` procesa sin guardar todo el archivo en una lista.
- `getResourceAsStream("/config.txt")` busca en el classpath; la ruta empieza en la raíz del classpath.
- `readAllBytes()` es aceptable para recursos pequeños; no lo uses con archivos enormes.

**Ejecución y salida real**

```text
linea-3
recurso no encontrado
```

Si agregas `config.txt` al classpath, imprimirá su contenido.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `OutOfMemoryError` con archivo grande | Cargaste todo en memoria | Usa lectura por streaming |
| `NullPointerException` al leer recurso | `getResourceAsStream` devolvió `null` | Verifica ruta y que el recurso esté empaquetado |
| Caracteres raros | Codificación incorrecta | Especifica charset (`StandardCharsets.UTF_8`) |

**Verificación rápida**

```bash
javac DemoArchivoGrande.java && java DemoArchivoGrande
```

Genera un archivo con más líneas y confirma que no necesitas cambiar la lógica para procesarlo línea por línea.

## Cierre del módulo

Ahora puedes trabajar con archivos modernos usando NIO.2, convertir datos con Jackson y procesar archivos grandes sin desperdiciar memoria. El siguiente módulo aborda logging y depuración, clave para entender qué hace tu programa cuando ya no estás mirando la consola.
