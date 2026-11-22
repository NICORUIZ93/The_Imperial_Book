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

**Fundamento técnico y modelo mental**

**Definición formal.** NIO.2 (`java.nio.file`) es la API moderna de I/O de archivos. `Path` representa una ruta del sistema de archivos; `Files` provee operaciones estáticas sobre archivos/directorios. `IOException` y sus subtipos representan fallos de I/O checked.

**Contrato / invariantes / reglas.** `Path` no implica existencia; es una abstracción de ruta. Métodos como `Files.list`, `Files.walk` y `Files.lines` devuelven streams que deben cerrarse. Las operaciones pueden fallar por permisos, ausencia, existencia previa o concurrencia externa del FS. Las rutas deben construirse con `Path.of/resolve` para evitar concatenación frágil dependiente de plataforma.

**Modelo mental.** `Path` es la dirección; `Files` es el servicio postal/archivo que actúa sobre esa dirección.

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
        System.out.println(Files.readString(archivo).trim());

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

**Fundamento técnico y modelo mental**

**Definición formal.** La *serialización* es la transformación de un objeto en una representación externa (JSON, bytes, etc.); la *deserialización* es la transformación inversa. Jackson es una biblioteca de data-binding/streaming para JSON en Java.

**Contrato / invariantes / reglas.** El mapeo depende de nombres de propiedades, constructores/accesores, configuración de `ObjectMapper` y módulos registrados. La deserialización debe tratar datos no confiables con cuidado (validación, límites, tipos permitidos). La compatibilidad de esquema/versión es un contrato entre productor y consumidor. Este ejemplo requiere dependencia externa en classpath.

> **Nota:** requiere `com.fasterxml.jackson.core:jackson-databind`.

**Modelo mental.** Serializar es empaquetar un objeto en una caja estándar (JSON); deserializar es reconstruirlo siguiendo la etiqueta de la caja.

**Implementación desde cero**

Desde carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-06-jackson && cd ~/academia-java/modulo-06-jackson
curl -L -o jackson-databind.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.18.2/jackson-databind-2.18.2.jar
curl -L -o jackson-core.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.18.2/jackson-core-2.18.2.jar
curl -L -o jackson-annotations.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.18.2/jackson-annotations-2.18.2.jar
```

Crea `DemoJackson.java`:

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
- Fallos de mapeo suelen indicar nombres/tipos incompatibles o configuración faltante.

**Ejecución y salida real**

```bash
javac -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoJackson.java
java -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoJackson
```

Salida esperada:

```text
{"id":"G-1","destino":"Madrid","pesoKg":3}
G-1
Madrid
3
```

> En Windows usa `;` como separador de classpath.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ClassNotFoundException`/NoClassDefFound | Jackson no está en el classpath | Agrega la dependencia correcta |
| Propiedades no mapean | Nombre JSON distinto al campo | Usa `@JsonProperty` o configura naming strategy |
| Falla al deserializar record/POJO | Falta constructor/configuración | Verifica compatibilidad de Jackson y estructura del tipo |

**Verificación rápida**

Compila y ejecuta con Jackson en el classpath. Cambia una clave JSON y observa el error de mapeo.

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 40 min

**Caso guía**

Debes procesar un archivo grande línea por línea sin cargarlo entero en memoria. Además, necesitas leer una plantilla de configuración empaquetada dentro del JAR.

**Fundamento técnico y modelo mental**

**Definición formal.** El *procesamiento en streaming* lee datos incrementalmente, manteniendo uso de memoria acotado. El *classpath* es el conjunto de ubicaciones desde donde el cargador de clases busca clases y recursos.

**Contrato / invariantes / reglas.** `BufferedReader`/`Files.lines` permiten procesar línea por línea; `readAllBytes/readString` cargan todo en memoria y no escalan para archivos grandes. `getResourceAsStream` devuelve `null` si el recurso no existe. Los streams deben cerrarse. La codificación debe explicitarse cuando importa (`StandardCharsets.UTF_8`).

**Modelo mental.** Archivo grande: no te tragas el libro entero, lees página por página. Recurso de classpath: está dentro del paquete entregado, no en una ruta cualquiera del disco.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-06 && cd ~/academia-java/modulo-06
```

Crea `DemoArchivoGrande.java`:

```java
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.stream.*;

public class DemoArchivoGrande {
    public static void main(String[] args) throws Exception {
        Path path = Path.of("grande.txt");
        Files.writeString(path, "linea-1\nlinea-2\nlinea-3\n", StandardCharsets.UTF_8);

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("3")) System.out.println(line);
            }
        }

        try (InputStream in = DemoArchivoGrande.class.getResourceAsStream("/config.txt")) {
            if (in != null) {
                String text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
                System.out.println(text.trim());
            } else {
                System.out.println("recurso no encontrado");
            }
        }
    }
}
```

Para probar el recurso del classpath, crea `config.txt` y ejecútalo con el directorio actual en classpath:

```bash
echo "modo=demo" > config.txt
javac DemoArchivoGrande.java
java -cp . DemoArchivoGrande
```

**Desglose del código**

- `Files.newBufferedReader` lee eficientemente línea por línea.
- El `while` procesa sin guardar todo el archivo en una lista.
- `getResourceAsStream("/config.txt")` busca en la raíz del classpath; por eso se usa `-cp .`.
- `readAllBytes()` es aceptable para recursos pequeños; no lo uses con archivos enormes.

**Ejecución y salida real**

```text
linea-3
modo=demo
```

Si eliminas `config.txt` del classpath, la segunda línea será `recurso no encontrado`.

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
