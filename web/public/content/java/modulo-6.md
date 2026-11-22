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

Necesitas guardar un reporte, leerlo, crear directorios si no existen y listar archivos generados. Las rutas como strings son frágiles entre OS; necesitas la API moderna.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **NIO.2 (`java.nio.file`)** | API moderna de I/O de archivos de Java (Java 7+). | Operaciones ricas y seguras sobre FS. | Nuevo código de archivos. | Mezclar `File` legacy sin necesidad. |
| **`Path`** | Abstracción inmutable de ruta (no implica existencia). | Construir rutas portables. | Siempre para rutas. | Concatenar strings con `/` o `\`. |
| **`Files`** | Utilidad estática para operar sobre archivos/directorios. | Leer/escribir/copiar/mover/listar. | Operaciones comunes de FS. | No cerrar streams de `list/walk/lines`. |
| **`IOException` checked** | Excepción por fallo de I/O (permisos, inexistencia, etc.). | Señalar fallo externo recuperable. | Manejar o declarar con contexto. | Tragar excepción. |

**Contrato / invariantes / reglas.** `resolve` compone rutas; `normalize` limpia `..`. `Files.list/walk/lines` devuelven `Stream` que debe cerrarse. `createDirectories` es idempotente si ya existe como directorio. Operaciones pueden fallar por race conditions del FS: maneja excepciones.

**Modelo mental.** `Path` = dirección; `Files` = oficina que actúa sobre esa dirección.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-6 && cd ~/academia-java/modulo-6
```

`DemoNio.java`:

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

**Ejecución y salida real**

```bash
javac DemoNio.java
java DemoNio
```

```text
true
id,total
G-1,100
G-2,150
archivo: reporte.txt
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `NoSuchFileException` | Ruta inexistente | `exists`/`createDirectories` |
| Fuga de recurso | No cerraste `Files.list/walk` | try-with-resources |
| Ruta rota en Windows/Linux | Concatenación manual | `Path.of/resolve` |

**Verificación rápida:** cambia a `Path.of("tmp","salida")` y confirma creación anidada.


### Tema 2: Serialización con Jackson · Intermedio · 40 min

**Caso guía**

Recibes y envías JSON. Quieres mapear objeto Java↔JSON sin parsing manual frágil.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Serialización** | Transformar objeto en representación externa (JSON). | Enviar/guardar datos. | APIs, mensajes, archivos. | Exponer campos sensibles. |
| **Deserialización** | Reconstruir objeto desde representación externa. | Leer input externo. | APIs, config, mensajes. | Confiar ciegamente en input. |
| **Jackson `ObjectMapper`** | Biblioteca de data-binding JSON para Java. | Mapear JSON↔POJO/record. | JSON en backend Java. | Falta dependencia/módulo/config. |
| **Contrato de esquema** | Estructura esperada (nombres/tipos/obligatoriedad). | Compatibilidad productor/consumidor. | Evolución de APIs. | Cambiar campo sin versionar/manejar compatibilidad. |

**Contrato / invariantes / reglas.** Requiere dependencias Jackson en classpath. `writeValueAsString` serializa; `readValue` deserializa. Data-binding depende de nombres, constructores/accesores y configuración. Valida datos no confiables; la deserialización no sustituye validación de negocio.

**Modelo mental.** Serializar = empaquetar en caja estándar etiquetada; deserializar = reconstruir desde la etiqueta.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-06-jackson && cd ~/academia-java/modulo-06-jackson
curl -L -o jackson-databind.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.18.2/jackson-databind-2.18.2.jar
curl -L -o jackson-core.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.18.2/jackson-core-2.18.2.jar
curl -L -o jackson-annotations.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.18.2/jackson-annotations-2.18.2.jar
```

`DemoJackson.java`:

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

**Ejecución y salida real**

```bash
javac -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoJackson.java
java -cp ".:jackson-databind.jar:jackson-core.jar:jackson-annotations.jar" DemoJackson
```

```text
{"id":"G-1","destino":"Madrid","pesoKg":3}
G-1
Madrid
3
```

(Windows: usa `;` en classpath).

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `NoClassDefFoundError` | Jackson no en classpath | Agrega jars/dependencias |
| Campo no mapea | Nombre/tipo distinto | `@JsonProperty`, validar esquema |
| Falla deserialización | Constructor/tipo incompatible | Ajusta DTO/config ObjectMapper |

**Verificación rápida:** cambia `pesoKg` a string en JSON y observa el error de mapeo.


### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 40 min

**Caso guía**

Procesas un archivo grande línea por línea sin cargarlo en memoria y lees una plantilla pequeña empaquetada en el classpath.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Archivos grandes (streaming)** | Lectura incremental línea a línea/bloques sin cargar todo. | Memoria acotada. | Logs, CSV, cargas masivas. | `readAllBytes` en archivo enorme. |
| **`BufferedReader`/`Files.lines`** | APIs para lectura eficiente por líneas. | Procesar secuencialmente. | Filtros, ETL simple. | No cerrar `Files.lines`. |
| **Recursos del classpath** | Recursos empaquetados accesibles por classloader (`getResourceAsStream`). | Config/plantillas dentro del JAR/app. | Defaults, templates read-only. | Buscar en FS cuando está en classpath. |
| **Codificación (`UTF-8`)** | Mapeo bytes↔caracteres. | Evitar corrupción de texto. | Siempre especificar en I/O texto. | Depender de charset por defecto. |

**Contrato / invariantes / reglas.** `getResourceAsStream` devuelve `null` si no existe: validar. Streams se cierran. Para recursos pequeños `readAllBytes` está bien; para archivos grandes, no. `Files.lines` es lazy pero requiere cierre.

**Modelo mental.** Archivo grande = leer página por página; recurso classpath = archivo dentro del paquete entregado.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-06 && cd ~/academia-java/modulo-06
```

`DemoArchivoGrande.java`:

```java
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

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
            if (in != null) System.out.println(new String(in.readAllBytes(), StandardCharsets.UTF_8).trim());
            else System.out.println("recurso no encontrado");
        }
    }
}
```

```bash
echo "modo=demo" > config.txt
javac DemoArchivoGrande.java
java -cp . DemoArchivoGrande
```

**Ejecución y salida real**

```text
linea-3
modo=demo
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `OutOfMemoryError` | Cargaste todo | Streaming línea a línea |
| `NullPointerException` recurso | No está en classpath/ruta mal | Verifica ruta y `-cp` |
| Caracteres raros | Charset implícito | `StandardCharsets.UTF_8` |

**Verificación rápida:** elimina `config.txt` del classpath y confirma “recurso no encontrado”.


## Cierre del módulo

Ahora puedes trabajar con archivos modernos usando NIO.2, convertir datos con Jackson y procesar archivos grandes sin desperdiciar memoria. El siguiente módulo aborda logging y depuración, clave para entender qué hace tu programa cuando ya no estás mirando la consola.
