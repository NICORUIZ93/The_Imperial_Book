# Módulo 6: I/O, NIO.2 y serialización


## Aprende construyendo

### Tema 1: NIO.2 — Path y Files · Intermedio · 45 min

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version` y `mvn --version`.

**Al terminar podrás:** leer y escribir archivos con `Path`/`Files`, validando que la ruta resuelta permanezca dentro de un directorio permitido.

#### Aprende

Una plataforma de entregas procesa comprobantes subidos por el usuario; si el nombre de archivo llega con `../../etc/passwd`, resolverlo sin validar permitiría leer archivos fuera del directorio de comprobantes.

**¿Por qué es importante?** NIO.2 ofrece una API más expresiva y con mejor manejo de errores que la antigua clase `File`, simplificando operaciones comunes de archivos que antes requerían código considerablemente más verboso.

`Path` representa una ubicación; `Files` ofrece operaciones explícitas de alto nivel. Validar que la ruta resuelta (`normalize()`) siga dentro del directorio permitido evita un path traversal.

`Path ruta = Path.of("datos.txt"); String contenido = Files.readString(ruta);` representa la API moderna de manejo de archivos introducida en Java 7 (NIO.2), reemplazando gradualmente a la antigua clase `File` (presente desde las primeras versiones de Java), que tenía limitaciones notables: métodos que devolvían simplemente `false` ante un error sin indicar la causa específica (en vez de lanzar una excepción descriptiva), y una API considerablemente menos expresiva para operaciones comunes como copiar, mover, o recorrer directorios recursivamente.

`Files` ofrece métodos de alto nivel considerablemente más convenientes que sus equivalentes con `File`: `Files.exists(ruta)` (verificar existencia), `Files.copy(origen, destino)` (copiar), `Files.walk(directorio)` (recorrer recursivamente un árbol de directorios como un stream, Módulo 4, en vez de una API recursiva manual más verbosa), y `Files.writeString(ruta, "nuevo contenido")` para escribir directamente sin necesidad de gestionar manualmente un `Writer` o `OutputStream` para el caso simple de escribir contenido de texto completo de una sola vez.

**Analogía:** la antigua clase `File` es como un mapa antiguo y básico que solo indica si un camino existe o no, sin más detalle; NIO.2 con `Path`/`Files` es como un sistema de navegación moderno que no solo confirma la existencia de un camino, sino que ofrece rutas alternativas expresivas y detalles específicos sobre cualquier problema encontrado en el trayecto.

**Conceptos clave:** API moderna frente a la clase File legada, operaciones expresivas.

**Código del ejemplo:**

```java
Path ruta = Path.of("datos.txt");
String contenido = Files.readString(ruta);
Files.writeString(ruta, "nuevo contenido");
```

La validación contra *path traversal* que exigen la demostración y la práctica guiada se apoya exactamente en este patrón: resolver la ruta recibida contra un directorio base conocido, normalizarla, y confirmar que el resultado normalizado todavía comienza dentro de ese directorio base antes de leer nada.

```java
Path resuelta = directorioBase.resolve(nombreArchivo).normalize();
if (!resuelta.startsWith(directorioBase)) {
    throw new IllegalArgumentException("Ruta fuera del directorio permitido: " + nombreArchivo);
}
```

Con `nombreArchivo = "../../../etc/passwd"`, `resolve` seguido de `normalize()` produce una ruta que sale de `directorioBase`; `startsWith` lo detecta antes de que `Files.readString` llegue a ejecutarse, y el método lanza `IllegalArgumentException` en vez de leer un archivo fuera del directorio permitido.

Este validador de rutas es exactamente lo que necesitará cualquier endpoint del proyecto integrador de este track que reciba un nombre de archivo desde afuera (subir un comprobante, descargar un reporte).

**Cuándo no usarlo:** validar manualmente contra path traversal como aquí es necesario cuando el nombre de archivo viene de una fuente externa no confiable; para una ruta construida enteramente por el propio código, sin ningún componente proporcionado por el usuario, esta validación es innecesaria.

**Implicación práctica:** Aceptar un nombre de archivo externo sin validar que la ruta resuelta permanezca dentro del directorio permitido es exactamente el tipo de vulnerabilidad (path traversal) que permite leer archivos arbitrarios del sistema, no solo los comprobantes esperados.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-nio-path-traversal
cd ejemplo-nio-path-traversal
mkdir -p src/main/java/academia/archivos
```

**Crea** `LectorComprobantes.java` con un método que reciba un nombre de archivo, lo resuelva contra un directorio base permitido con `Path.resolve` + `normalize()`, y rechace la lectura si el resultado queda fuera de ese directorio:

```java
package academia.archivos;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public final class LectorComprobantes {
    private final Path directorioBase;

    public LectorComprobantes(Path directorioBase) {
        this.directorioBase = directorioBase.toAbsolutePath().normalize();
    }

    public String leer(String nombreArchivo) throws IOException {
        Path resuelta = directorioBase.resolve(nombreArchivo).normalize();
        if (!resuelta.startsWith(directorioBase)) {
            throw new IllegalArgumentException("Ruta fuera del directorio permitido: " + nombreArchivo);
        }
        return Files.readString(resuelta);
    }

    public static void main(String[] args) throws IOException {
        Path base = Path.of("comprobantes").toAbsolutePath().normalize();
        Files.createDirectories(base);
        Path demo = base.resolve("comprobante-001.txt");
        if (!Files.exists(demo)) {
            Files.writeString(demo, "monto=125000;estado=PAGADO");
        }
        System.out.println(new LectorComprobantes(base).leer(args[0]));
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/archivos/LectorComprobantes.java
java -cp out academia.archivos.LectorComprobantes comprobante-001.txt
```

**Resultado esperado:** crea `comprobantes/comprobante-001.txt` si no existe e imprime `monto=125000;estado=PAGADO`.

**Fallo deliberado:** invoca el mismo programa con `../../../etc/passwd` como nombre de archivo (`java -cp out academia.archivos.LectorComprobantes ../../../etc/passwd`).

**Pista:** `resolve` + `normalize()` produce una ruta que ya no empieza con el directorio base, `startsWith` lo detecta, y el programa termina antes de leer nada.

**Si falla.** Si la ruta `../../../etc/passwd` imprime contenido, la validación se aplicó después de leer o el directorio base no se normalizó al construirlo. Si el programa falla con `ArrayIndexOutOfBoundsException`, falta pasar el nombre de archivo como argumento. Si `startsWith` rechaza una ruta válida, compara rutas absolutas normalizadas, no relativas.

#### Aplica

Agrega `Files.copy` para respaldar el comprobante leído a un directorio de archivo, y una prueba que confirme que un nombre con `..` es rechazado antes de tocar el sistema de archivos.

**Checklist de salida.**

- [ ] `LectorComprobantes.java` compila y ejecuta con `javac` y `java -cp out`.
- [ ] Un nombre válido imprime `monto=125000;estado=PAGADO`.
- [ ] `../../../etc/passwd` se rechaza con `IllegalArgumentException` antes de leer.
- [ ] `Files.copy` respalda el comprobante a un directorio de archivo.
- [ ] La prueba con `..` verifica el rechazo sin tocar el sistema de archivos.
- [ ] Explicas por qué se normaliza después de resolver y no antes.

**Si falla.** Si `Files.copy` falla porque el destino existe, decide explícitamente si sobrescribir (`REPLACE_EXISTING`) o rechazar. Si la prueba con `..` no lanza, revisa que esté llamando `leer` y no construyendo la ruta por fuera del validador.

Guarda el validador de rutas, la prueba de traversal rechazada y la lectura válida.

**Errores comunes:** concatenar rutas con `+` en vez de `resolve()`, confiar en la extensión del archivo sin validar la ruta completa resuelta, y normalizar antes de resolver en vez de después (el orden importa: primero `resolve`, después `normalize()`).

**Fuente oficial:** [dev.java: File System](https://dev.java/learn/java-io/file-system/) y [Java API: Path](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html).

---

### Tema 2: Serialización con Jackson · Intermedio · 50 min

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version` y `mvn --version`.

**Al terminar podrás:** serializar y deserializar un `record` a/desde JSON con Jackson, confirmando que el ciclo completo preserva los datos.

#### Aprende

Una API de entregas necesita convertir un objeto `Entrega` a JSON para responder a un cliente, y reconstruir un objeto `Entrega` a partir del JSON que envía otro servicio, sin escribir manualmente el parsing campo por campo.

**¿Por qué es importante?** Jackson automatiza la conversión entre objetos Java y JSON basándose en la estructura de la clase, eliminando la necesidad de escribir manualmente lógica de parsing y serialización campo por campo.

`ObjectMapper` serializa un objeto Java a JSON y deserializa en la dirección inversa, inspeccionando la estructura de la clase por reflexión. Los `record` (Módulo 7) son un modelo de datos particularmente natural para esto, sin anotaciones adicionales en el caso simple.

Jackson es la librería estándar de facto para convertir objetos Java a JSON y viceversa: `ObjectMapper mapper = new ObjectMapper(); String json = mapper.writeValueAsString(new Persona("Ana", 28));` serializa un objeto Java (aquí, un `record Persona(String nombre, int edad) {}`, Módulo 7) a su representación JSON equivalente, mientras `mapper.readValue(json, Persona.class)` realiza la operación inversa, reconstruyendo un objeto Java a partir de una cadena JSON, inspeccionando por reflexión la estructura de la clase de destino para determinar cómo mapear cada campo del JSON a su propiedad correspondiente.

Usar records (Módulo 7) como modelos de datos serializables con Jackson es una combinación particularmente natural: los records ya proporcionan constructores, getters y `equals`/`hashCode` generados automáticamente sin boilerplate manual, y Jackson los soporta de forma nativa desde versiones recientes, reconociendo automáticamente los componentes del record como las propiedades a serializar/deserializar, sin necesidad de anotaciones adicionales en el caso simple donde los nombres de los campos JSON coinciden directamente con los nombres de los componentes del record.

**Analogía:** Jackson es como un traductor bidireccional especializado entre dos idiomas (objetos Java y JSON), capaz de traducir automáticamente en ambas direcciones basándose en la estructura conocida de cada objeto, sin que el desarrollador tenga que escribir manualmente las reglas de traducción para cada campo individual.

**Conceptos clave:** `ObjectMapper`, serializar/deserializar, records como modelos de datos.

**Código del ejemplo:**

```java
record Persona(String nombre, int edad) {}

ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new Persona("Ana", 28));
Persona persona = mapper.readValue(json, Persona.class);
```

Cada respuesta de API del proyecto integrador de este track usará esta misma combinación (`record` + Jackson) para convertir entidades de dominio a JSON y viceversa.

**Cuándo no usarlo:** para un JSON con forma muy irregular o que cambia con frecuencia sin control, mapearlo directamente a un `record` tipado puede romperse en cada cambio; en ese caso, parsear a una estructura genérica (`Map`/`JsonNode`) y extraer campos según se necesiten es más tolerante a variaciones.

**Implicación práctica:** Serializar y deserializar manualmente campo por campo es repetitivo y propenso a errores de sincronización entre el modelo Java y el JSON; Jackson automatiza esa conversión inspeccionando la estructura real del `record`, y falla con un mensaje específico cuando algo no coincide.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara un proyecto Maven con Jackson.

```bash
mkdir ejemplo-jackson-record
cd ejemplo-jackson-record
mkdir -p src/main/java/academia/json
```

**Crea** `pom.xml` con la dependencia de Jackson fijada a una versión concreta:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId>
  <artifactId>ejemplo-jackson</artifactId>
  <version>1.0</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.21.5</version>
    </dependency>
  </dependencies>
</project>
```

**Crea** `SerializacionEntrega.java` con `record Entrega(String numero, String estado, double pesoKg) {}` y un `main` que serialice una instancia a JSON con `ObjectMapper`, la imprima, y luego la deserialice de vuelta confirmando que el objeto reconstruido es `equals()` al original:

```java
package academia.json;

import com.fasterxml.jackson.databind.ObjectMapper;

record Entrega(String numero, String estado, double pesoKg) {}

public final class SerializacionEntrega {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Entrega original = new Entrega("E-001", "EN_RUTA", 12.5);

        String json = mapper.writeValueAsString(original);
        System.out.println(json);

        Entrega reconstruida = mapper.readValue(json, Entrega.class);
        System.out.println("Iguales: " + original.equals(reconstruida));
    }
}
```

**Ejecuta el ejemplo** (Maven resuelve Jackson y construye el classpath):

```bash
mvn -q compile dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" academia.json.SerializacionEntrega
```

**Resultado esperado:** imprime `{"numero":"E-001","estado":"EN_RUTA","pesoKg":12.5}` y luego `Iguales: true`.

**Fallo deliberado:** quita el campo `pesoKg` del JSON y deserializa con un mapper estricto. Con el `ObjectMapper` predeterminado no falla: completa `pesoKg` con `0.0`. Para que el dato obligatorio se verifique, activa la comprobación:

```java
ObjectMapper estricto = new ObjectMapper()
    .enable(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES);
```

**Pista:** con la verificación estricta, Jackson lanza `MismatchedInputException: Missing creator property 'pesoKg'`. **Resultado esperado:** el error nombra exactamente el campo faltante, no un fallo genérico.

**Si falla.** Si `mvn` no encuentra `jackson-databind`, revisa la versión fijada en `pom.xml` y la conexión al repositorio. Si el `record` no se reconstruye, confirma que los nombres del JSON coinciden con los componentes. Si el campo faltante no genera error, no activaste `FAIL_ON_MISSING_CREATOR_PROPERTIES`.

#### Aplica

Agrega un segundo `record` anidado (por ejemplo `Entrega` con un campo `Destinatario` propio) y confirma que Jackson serializa/deserializa la estructura anidada completa sin configuración adicional.

**Checklist de salida.**

- [ ] `pom.xml` fija una versión concreta de `jackson-databind`.
- [ ] `SerializacionEntrega.java` compila con `mvn -q compile`.
- [ ] El JSON serializado contiene `numero`, `estado` y `pesoKg`.
- [ ] La deserialización reconstruye un objeto `equals()` al original.
- [ ] El JSON sin `pesoKg` se completa con `0.0` con el mapper predeterminado.
- [ ] Con `FAIL_ON_MISSING_CREATOR_PROPERTIES` el error nombra `pesoKg`.

**Si falla.** Si la estructura anidada no se reconstruye, revisa que el `record` interno también sea accesible para Jackson. Si la comparación `equals` falla, imprime ambos objetos y compara campo por campo antes de cambiar el modelo.

Guarda el `record`, el JSON serializado y la confirmación de igualdad tras el ciclo completo.

**Errores comunes:** olvidar un constructor sin argumentos o getters/setters esperando que Jackson los necesite para un `record` (no los necesita), asumir que un campo faltante en el JSON siempre falla cuando el mapper predeterminado completa `0.0` en un `double` (activa `FAIL_ON_MISSING_CREATOR_PROPERTIES` si el dato es obligatorio), y no fijar una versión concreta de Jackson en el proyecto.

**Fuente oficial:** [dev.java: File System](https://dev.java/learn/java-io/file-system/) y [Jackson Documentation](https://github.com/FasterXML/jackson-docs).

---

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 45 min

**Prerrequisito:** JDK 27, Maven y un editor. Comprueba `java --version` y `mvn --version`.

**Al terminar podrás:** procesar un archivo grande línea por línea sin cargarlo completo en memoria, y cargar un recurso empaquetado en el classpath.

#### Aprende

Un reporte diario de entregas puede tener cientos de miles de líneas; cargarlo completo con `readAllBytes` antes de procesarlo agotaría la memoria disponible en un servidor con recursos limitados.

**¿Por qué es importante?** Leer un archivo grande línea por línea con un buffer evita problemas de memoria que cargar el archivo completo (`readAllBytes`) no evita; los recursos del classpath garantizan disponibilidad empaquetada junto con el código, sin depender de la ubicación específica del sistema de archivos del entorno de destino.

Un `BufferedReader` procesa línea por línea, manteniendo en memoria solo la línea actual; `getResourceAsStream` carga un recurso empaquetado en el propio JAR, disponible sin importar dónde se despliegue la aplicación.

Leer un archivo grande completo de una sola vez (con `Files.readAllBytes` o `Files.readString`, apropiados para archivos pequeños) carga necesariamente el contenido completo en memoria simultáneamente, un enfoque que se vuelve problemático o directamente inviable para archivos cuyo tamaño se acerca o supera la memoria disponible. La alternativa procesa el archivo línea por línea:

```java
try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) {
    String linea;
    while ((linea = reader.readLine()) != null) {
        procesar(linea);
    }
}
```

Este patrón mantiene en memoria en cualquier momento dado únicamente la línea actual (más el buffer interno de lectura), sin importar cuán grande sea el archivo completo en su totalidad.

`getResourceAsStream("/config.json")` carga un archivo empaquetado dentro del propio JAR de la aplicación (típicamente ubicado en `src/main/resources` durante el desarrollo, y empaquetado dentro del JAR final en producción), a diferencia de `Files`, que opera sobre el sistema de archivos real del sistema operativo donde la aplicación se ejecuta: los recursos del classpath viajan empaquetados junto con el propio código compilado de la aplicación, garantizando que estén disponibles sin importar en qué máquina o entorno específico se despliegue esa aplicación, mientras que un archivo en el sistema de archivos real depende de que exista físicamente en esa ubicación específica del sistema donde la aplicación se ejecuta en ese momento.

**Analogía:** leer un archivo completo de una sola vez es como intentar cargar un libro entero en la memoria de una sola mirada; leerlo línea por línea con un buffer es como leerlo página por página, recordando solo la página actual sin necesidad de mantener el libro completo abierto simultáneamente en la mente. Un recurso del classpath es como un anexo que viaja empaquetado junto con el manual de instrucciones mismo, disponible en cualquier lugar donde ese manual se distribuya, a diferencia de un archivo suelto que depende de existir físicamente en un lugar específico del destino.

**Conceptos clave:** procesamiento línea por línea, evitar cargar todo en memoria, `getResourceAsStream`.

Cualquier exportación o reporte grande del proyecto integrador de este track deberá procesarse línea por línea como aquí, nunca cargando el archivo completo en memoria primero.

**Cuándo no usarlo:** para un archivo pequeño (un archivo de configuración de unas pocas líneas), procesar línea por línea con `BufferedReader` es más código del necesario; `Files.readString`/`readAllLines` es más simple y no representa ningún riesgo de memoria en ese caso.

**Implicación práctica:** Cargar un archivo de cientos de miles de líneas completo en memoria antes de procesarlo puede agotar la memoria disponible, mientras que procesarlo línea por línea mantiene un uso de memoria acotado sin importar el tamaño real del archivo.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-archivo-grande
cd ejemplo-archivo-grande
mkdir -p src/main/java/academia/streaming
```

**Crea** `ProcesadorReporte.java` que genere primero un archivo de 500 000 líneas, y luego lo procese con `BufferedReader`/`readLine()` contando cuántas líneas cumplen una condición, midiendo la memoria usada con `Runtime.getRuntime().totalMemory() - freeMemory()`:

```java
package academia.streaming;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public final class ProcesadorReporte {
    static final Path ARCHIVO = Path.of("reporte-entregas.txt");

    static void generar(long lineas) throws IOException {
        try (var escritor = Files.newBufferedWriter(ARCHIVO)) {
            for (long i = 1; i <= lineas; i++) {
                escritor.write("ENTREGA-" + i + ";estado=" + (i % 2 == 0 ? "PAGADO" : "PENDIENTE"));
                escritor.newLine();
            }
        }
    }

    static long procesar() throws IOException {
        long pagadas = 0;
        try (BufferedReader reader = Files.newBufferedReader(ARCHIVO)) {
            String linea;
            while ((linea = reader.readLine()) != null) {
                if (linea.endsWith("estado=PAGADO")) {
                    pagadas++;
                }
            }
        }
        return pagadas;
    }

    static long memoriaUsada() {
        Runtime runtime = Runtime.getRuntime();
        return runtime.totalMemory() - runtime.freeMemory();
    }

    public static void main(String[] args) throws IOException {
        generar(500_000);
        long antes = memoriaUsada();
        long pagadas = procesar();
        long despues = memoriaUsada();
        System.out.println("Líneas pagadas: " + pagadas);
        System.out.printf("Memoria antes: %.1f MB%n", antes / 1_048_576.0);
        System.out.printf("Memoria después: %.1f MB%n", despues / 1_048_576.0);
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/streaming/ProcesadorReporte.java
java -cp out academia.streaming.ProcesadorReporte
```

**Resultado esperado:** `Líneas pagadas: 250000` y un uso de memoria que se mantiene en el mismo orden de magnitud antes y después de procesar; el archivo en disco tiene 500 000 líneas.

**Fallo deliberado:** reemplaza `BufferedReader`/`readLine()` por `Files.readAllLines()` (que carga todo en una lista en memoria) y compara el uso de memoria medido.

**Pista:** `BufferedReader` mantiene un uso de memoria aproximadamente constante, `readAllLines()` crece con el tamaño del archivo. **Resultado esperado:** la diferencia de memoria se hace visible con 500 000 líneas.

**Si falla.** Si el conteo no es 250 000, la condición de paridad o el sufijo de estado cambiaron. Si la memoria sube en ambas versiones, la medición incluye la generación del archivo: mide solo alrededor de `procesar()`. Si el archivo no se crea, revisa permisos del directorio de trabajo.

#### Aplica

Agrega un `config.json` en `src/main/resources` y cárgalo con `getResourceAsStream("/config.json")`; confirma que funciona igual después de empaquetar la aplicación en un JAR.

**Checklist de salida.**

- [ ] `ProcesadorReporte.java` compila y ejecuta con `javac` y `java -cp out`.
- [ ] El archivo generado tiene 500 000 líneas.
- [ ] El conteo de líneas pagadas es 250 000.
- [ ] `BufferedReader` mantiene la memoria acotada frente a `readAllLines()`.
- [ ] `getResourceAsStream("/config.json")` carga el recurso empaquetado.
- [ ] El recurso sigue disponible después de empaquetar en un JAR.

**Si falla.** Si `getResourceAsStream` devuelve `null`, el recurso no está en `src/main/resources` o la ruta no empieza con `/`. Si el JAR no incluye el recurso, confirma que Maven lo empaqueta desde `src/main/resources`.

Guarda ambas mediciones de memoria y la carga del recurso del classpath.

**Errores comunes:** leer todo el archivo con `readAllBytes`/`readAllLines` sin considerar su tamaño real, olvidar que `getResourceAsStream` devuelve `null` (no lanza excepción) si el recurso no existe en el classpath, y no cerrar el `BufferedReader` con try-with-resources dejando el descriptor de archivo abierto.

**Fuente oficial:** [dev.java: File System](https://dev.java/learn/java-io/file-system/) y [Java API: BufferedReader](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html).

---

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
