# Módulo 6: I/O, NIO.2 y serialización


## Aprende construyendo

### Tema 1: NIO.2 — Path y Files

**¿Por qué es importante?** Las rutas recibidas desde afuera pueden apuntar a archivos que la aplicación no debería leer.

#### Subtema 1.1: Lee y escribe un archivo pequeño · 10 min

**1. Contexto**

El motor debe guardar un comprobante de prueba y luego leerlo.

**2. Hazlo tú**

Crea `src/Archivos.java`:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Archivos {
    public static void main(String[] args) throws IOException {
        Path comprobante = Path.of("datos", "RT-1.txt");
        Files.createDirectories(comprobante.getParent());
        Files.writeString(comprobante, "RT-1;ENTREGADO");
        System.out.println(Files.readString(comprobante));
    }
}
```

Desde la carpeta del proyecto ejecuta:

```bash
javac -d out src/Archivos.java
java -cp out Archivos
```

**Resultado esperado:** crea `datos/RT-1.txt` e imprime `RT-1;ENTREGADO`.

**Fallo deliberado:** reemplaza `createDirectories` por nada y borra la carpeta `datos`. **Diagnóstico:** no existe el directorio padre; créalo antes de escribir el archivo.

**3. Entiende**

`Path` describe una ruta; `Files` realiza la operación sobre el sistema de archivos.

**4. Cierra**

Guarda el archivo y señala qué llamada creó la carpeta.

#### Subtema 1.2: Rechaza una ruta que sale del directorio · 10 min

**1. Contexto**

Un nombre como `../../secreto.txt` no debe permitir salir de la carpeta de comprobantes.

**2. Hazlo tú**

Crea `src/ComprobanteSeguro.java`:

```java
import java.nio.file.Path;

public class ComprobanteSeguro {
    static Path resolver(Path base, String nombre) {
        Path raiz = base.toAbsolutePath().normalize();
        Path destino = raiz.resolve(nombre).normalize();
        if (!destino.startsWith(raiz)) {
            throw new IllegalArgumentException("Ruta fuera de comprobantes");
        }
        return destino;
    }

    public static void main(String[] args) {
        System.out.println(resolver(Path.of("comprobantes"), args[0]));
    }
}
```

Compila y ejecuta:

```bash
javac -d out src/ComprobanteSeguro.java
java -cp out ComprobanteSeguro RT-1.txt
```

Repite con `../../secreto.txt` como argumento.

**Resultado esperado:** el nombre simple queda dentro de `comprobantes`; el otro se rechaza antes de leer.

**Fallo deliberado:** quita `normalize()`. **Diagnóstico:** segmentos `..` pueden seguir en la ruta y evadir la comparación; normaliza después de resolver.

**3. Entiende**

Valida la ruta resuelta y normalizada, no solo el texto que escribió la persona. En aplicaciones sensibles también considera enlaces simbólicos y permisos del sistema.

**4. Cierra**

Conserva la salida válida y el error de ruta externa.

#### Subtema 1.3: Recorre una carpeta y cierra el stream · 10 min

**1. Contexto**

Un reporte puede necesitar listar comprobantes sin abrirlos todos.

**2. Hazlo tú**

En `src/Listar.java`, recorre `datos` con `Files.list` dentro de try-with-resources e imprime cada nombre:

```java
try (var archivos = Files.list(Path.of("datos"))) {
    archivos.map(Path::getFileName).forEach(System.out::println);
}
```

Integra el bloque en una clase con `main`, crea dos archivos usando el Tema 1 y ejecuta:

```bash
javac -d out src/Listar.java
java -cp out Listar
```

**Resultado esperado:** aparecen los nombres de ambos comprobantes; el stream del directorio queda cerrado.

**Fallo deliberado:** usa `Files.walk` para recorrer una carpeta enorme sin cerrar su stream. **Diagnóstico:** los streams de archivos administran recursos del sistema; envuélvelos en try-with-resources.

**3. Entiende**

`Files.list` y `Files.walk` devuelven streams que deben cerrarse. Para un directorio directo usa `list`; `walk` también visita subdirectorios.

**4. Cierra**

Explica por qué este stream se cierra como un archivo. Fuente oficial: [Path y Files](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html).

**Proyecto integrador:** valida la carpeta de comprobantes y lista los archivos que puede procesar. **Límite:** la comprobación de ruta no sustituye los permisos del sistema operativo. **Práctica:** modifica `ComprobanteSeguro.java` para aceptar un segundo argumento con la carpeta base y confirma que sigue rechazando rutas que escapan de esa carpeta con `../`.

### Tema 2: Serialización con Jackson

**¿Por qué es importante?** Los servicios intercambian JSON; convertirlo con tipos claros hace más fácil detectar datos inválidos.

#### Subtema 2.1: Convierte un record a JSON y de vuelta · 10 min

**1. Contexto**

La aplicación debe enviar los datos de una entrega como JSON y reconstruir el tipo al recibirlos.

**2. Hazlo tú**

En la raíz de una carpeta vacía crea este `pom.xml` para que el ejemplo compile sin pasos implícitos. Requiere JDK 25 y Maven:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId><artifactId>io-json</artifactId><version>1.0</version>
  <properties><maven.compiler.release>25</maven.compiler.release><project.build.sourceEncoding>UTF-8</project.build.sourceEncoding></properties>
  <dependencies><dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.22.4</version></dependency></dependencies>
  <build><plugins>
    <plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-compiler-plugin</artifactId><version>3.16.0</version></plugin>
    <plugin><groupId>org.codehaus.mojo</groupId><artifactId>exec-maven-plugin</artifactId><version>3.6.4</version></plugin>
  </plugins></build>
</project>
```

Crea `src/main/java/EntregaJson.java`:

```java
import com.fasterxml.jackson.databind.ObjectMapper;

public class EntregaJson {
    record Envio(String guia, String estado) {}

    public static void main(String[] args) throws Exception {
        var mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(new Envio("RT-1", "EN_RUTA"));
        System.out.println(json);
        Envio recibido = mapper.readValue(json, Envio.class);
        System.out.println(recibido.guia() + " " + recibido.estado());
    }
}
```

Ejecuta:

```bash
mvn -q compile exec:java -Dexec.mainClass=EntregaJson
```

**Resultado esperado:** aparece el JSON y luego `RT-1 EN_RUTA`.

**Fallo deliberado:** cambia `guia` por `codigo` en el JSON antes de deserializar. **Diagnóstico:** el tipo espera un campo llamado `guia`; verifica el contrato o documenta un alias.

**3. Entiende**

`ObjectMapper` convierte objetos a JSON y JSON a objetos. El record limita los campos que acepta tu código.

**4. Cierra**

Conserva el JSON producido y el objeto reconstruido.

#### Subtema 2.2: Rechaza JSON mal formado · 10 min

**1. Contexto**

Un cuerpo HTTP puede estar truncado o tener comillas sin cerrar.

**2. Hazlo tú**

En `src/main/java/EntregaJson.java` intenta deserializar el texto `{"guia":` y captura `JsonProcessingException` para imprimir `JSON inválido`.

```java
try {
    mapper.readValue("{\"guia\":", Envio.class);
} catch (com.fasterxml.jackson.core.JsonProcessingException invalido) {
    System.out.println("JSON inválido");
}
```

Vuelve a ejecutar:

```bash
mvn -q compile exec:java -Dexec.mainClass=EntregaJson
```

**Resultado esperado:** el programa informa el JSON inválido en vez de ocultar la excepción.

**Fallo deliberado:** captura `Exception` y no imprimas ni propagues nada. **Diagnóstico:** el error queda invisible; maneja el error de formato en el límite HTTP y registra el contexto interno necesario.

**3. Entiende**

Un JSON sintácticamente mal formado no se puede convertir. No devuelvas el stack trace al cliente.

**4. Cierra**

Guarda la respuesta para el cuerpo inválido.

#### Subtema 2.3: Decide qué hacer con campos nuevos · 10 min

**1. Contexto**

Una versión nueva del servicio puede agregar un campo que una versión vieja no conoce.

**2. Hazlo tú**

En `src/main/java/EntregaJson.java` prueba `{"guia":"RT-1","estado":"EN_RUTA","zona":"Norte"}` con el record actual. Luego configura `FAIL_ON_UNKNOWN_PROPERTIES` en `false` y repite:

```java
mapper.configure(
    com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
    false);
```

Ejecuta:

```bash
mvn -q compile exec:java -Dexec.mainClass=EntregaJson
```

**Resultado esperado:** la primera deserialización rechaza el campo extra; la segunda lo ignora y lee guía y estado.

**Fallo deliberado:** ignora todos los campos desconocidos sin revisar el contrato de la API. **Diagnóstico:** puedes perder una señal de incompatibilidad; decide entre esquema estricto y compatibilidad según el consumidor.

**3. Entiende**

La tolerancia a campos nuevos facilita despliegues graduales, pero también puede esconder errores de nombre. La decisión depende de quién mantiene el contrato.

**4. Cierra**

Anota si el lector de RutaFlow debe ser estricto o tolerante. Fuentes oficiales: [Jackson Databind](https://github.com/FasterXML/jackson-databind) y [release notes 2.22](https://github.com/FasterXML/jackson/wiki/Jackson-Release-2.22).

**Límite:** la versión indicada es Jackson 2.x; Jackson 3 cambia paquetes y coordenadas. No mezcles imports de las dos versiones.

**Proyecto integrador:** el motor serializa cada guía de entrega a JSON para el API y la reconstruye con el mismo record al leer el cuerpo de la solicitud. **Práctica:** modifica `Envio` para agregar un campo `pesoKg` y confirma que la serialización y la deserialización siguen funcionando con el campo nuevo.

### Tema 3: Archivos grandes y recursos del classpath

**¿Por qué es importante?** Cargar un archivo enorme completo puede agotar la memoria; un recurso del classpath viaja junto al artefacto.

#### Subtema 3.1: Procesa un archivo línea por línea · 10 min

**1. Contexto**

Un reporte diario puede tener cientos de miles de registros. Para contar entregas no necesitas mantener todo el archivo en memoria.

**2. Hazlo tú**

Crea `src/ContarLineas.java`:

```java
import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;

public class ContarLineas {
    public static void main(String[] args) throws Exception {
        long total = 0;
        try (BufferedReader lector = Files.newBufferedReader(Path.of(args[0]))) {
            while (lector.readLine() != null) total++;
        }
        System.out.println(total);
    }
}
```

Crea `reporte.txt` con varias líneas y ejecuta:

```bash
javac -d out src/ContarLineas.java
java -cp out ContarLineas reporte.txt
```

**Resultado esperado:** imprime la cantidad de líneas y no carga una lista con todo el archivo.

**Fallo deliberado:** cambia el código para usar `Files.readAllLines`. **Diagnóstico:** ahora todas las líneas se mantienen en una lista; vuelve a leer una por una para acotar memoria.

**3. Entiende**

`BufferedReader` conserva un buffer y entrega el archivo por partes. `readAllLines` materializa la lista completa.

**4. Cierra**

Registra el número de líneas y el recurso que try-with-resources cerró.

#### Subtema 3.2: Carga un archivo empacado en el JAR · 10 min

**1. Contexto**

La configuración que acompaña al programa debe estar disponible aunque cambie el directorio actual.

**2. Hazlo tú**

Guarda `modo=demo` en `src/main/resources/config.properties`. Crea `src/main/java/ConfigClasspath.java`:

```java
import java.io.InputStream;
import java.util.Properties;

public class ConfigClasspath {
    public static void main(String[] args) throws Exception {
        try (InputStream recurso =
                 ConfigClasspath.class.getResourceAsStream("/config.properties")) {
            if (recurso == null) throw new IllegalStateException("Falta config.properties");
            var propiedades = new Properties();
            propiedades.load(recurso);
            System.out.println(propiedades.getProperty("modo"));
        }
    }
}
```

Empaqueta el recurso junto a la clase con Maven y ejecuta:

```bash
mvn -q package
```

**Resultado esperado:** la salida es `demo` desde el recurso ubicado en el classpath.

**Fallo deliberado:** cambia el nombre por `/config-inexistente.properties`. **Diagnóstico:** `getResourceAsStream` devuelve null si no existe; verifica el nombre y la ubicación bajo resources.

**3. Entiende**

El classpath busca recursos dentro del artefacto; `Path` busca rutas del sistema operativo. No uses ambos como si fueran lo mismo.

**4. Cierra**

Guarda la salida desde la ejecución empaquetada.

#### Subtema 3.3: Elige entre leer todo o transmitir · 10 min

**1. Contexto**

Un archivo de configuración pequeño y un reporte de cientos de miles de filas tienen necesidades distintas.

**2. Hazlo tú**

En `src/ContarLineas.java` ejecuta la versión `BufferedReader` ya creada. Después crea `src/ContarTodo.java` con esta variante completa y corre ambas con el mismo archivo:

```java
import java.nio.file.Files;
import java.nio.file.Path;

public class ContarTodo {
    public static void main(String[] args) throws Exception {
        System.out.println(Files.readAllLines(Path.of(args[0])).size());
    }
}
```

Compila y ejecuta:

```bash
javac -d out src/ContarTodo.java
java -cp out ContarTodo reporte.txt
```

Genera un archivo más grande repitiendo líneas antes de comparar.

**Resultado esperado:** ambas versiones cuentan lo mismo; la lista completa necesita memoria proporcional al archivo, mientras que el lector procesa progresivamente.

**Fallo deliberado:** usa `readAllLines` con el reporte grande y concluye que siempre es más simple. **Diagnóstico:** comprueba el tamaño y memoria disponible; elige la lectura completa solo si el archivo cabe con holgura.

**3. Entiende**

La lectura completa es cómoda para archivos chicos; el streaming mantiene bajo el espacio de trabajo, a cambio de procesar cada fila durante la lectura.

**4. Cierra**

Anota el tamaño del archivo y cuál lectura elegiste. Fuentes oficiales: [BufferedReader](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html) y [recursos de clase](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Class.html#getResourceAsStream(java.lang.String)).

**Proyecto integrador:** procesa comprobantes grandes línea por línea y empaqueta la configuración con el JAR. **Límite:** usa `readAllLines`/`Files.readString` solo cuando el archivo cabe con holgura en memoria; para reportes de cientos de miles de filas o tamaño desconocido, procesa línea por línea con `BufferedReader` en vez de materializar la lista completa. **Práctica:** modifica `ContarLineas.java` para además contar cuántas líneas contienen la palabra `ENTREGADO`, sin dejar de leer el archivo línea por línea.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una utilidad que lea/escriba JSON desde y hacia disco con manejo robusto de errores.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Leer y escribir un archivo de texto con NIO.2 | Ver Tema 1 | `Files.readString`/`writeString` |
| 2 | Serializar y deserializar un objeto con Jackson | Ver Tema 2 | Verifica que los datos coinciden tras el ciclo completo |
| 3 | Leer un archivo grande línea por línea | Ver Tema 3 | Sin cargarlo completo en memoria |
| 4 | Cargar un recurso desde el classpath | Ver Tema 3 | `getResourceAsStream` |
| 5 | Manejar el caso de archivo inexistente | Ver Módulo 3 | Mensaje de error claro, sin catch vacío |

**Verificación:** el laboratorio se considera exitoso si la serialización y deserialización con Jackson preserva exactamente los datos originales, y si la lectura de un archivo grande no consume memoria proporcional al tamaño completo del archivo.

**Errores comunes y soluciones**

- **Usar `Files.readAllBytes` para archivos potencialmente muy grandes.** Usa un `BufferedReader` línea por línea para archivos grandes.
- **Confundir un recurso del classpath con un archivo del sistema de archivos.** Usa `getResourceAsStream` para recursos empaquetados en el JAR, `Files` para archivos externos reales.
- **No manejar el caso de archivo inexistente con un mensaje claro.** Captura la excepción específica y proporciona contexto útil, sin un catch vacío (Módulo 3).

---
