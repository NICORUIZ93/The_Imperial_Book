# Módulo 6: I/O, NIO.2 y serialización


## Aprende construyendo

### Tema 1: NIO.2 — Path y Files

#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer y escribir archivos con `Path`/`Files`, validando que la ruta resuelta permanezca dentro de un directorio permitido. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version y mvn --version.

#### Paso 2 · Contexto y caso real
Una plataforma de entregas procesa comprobantes subidos por el usuario; si el nombre de archivo llega con `../../etc/passwd`, resolverlo sin validar permitiría leer archivos fuera del directorio de comprobantes.

#### Paso 3 · Teoría, modelo mental y analogía
`Path` representa una ubicación; `Files` ofrece operaciones explícitas de alto nivel. Validar que la ruta resuelta (`normalize()`) siga dentro del directorio permitido evita un path traversal. La analogía: un archivador con permisos, donde conocer el nombre de un cajón no autoriza abrirlo.

**Evidencia de aprendizaje:** entrega `LectorComprobantes` con su validación de directorio base, la prueba de traversal (`../../../etc/passwd`) correctamente rechazada, y la lectura válida de un comprobante real.
**Conceptos clave:** API moderna frente a la clase File legada, operaciones expresivas.

Este validador de rutas es exactamente lo que necesitará cualquier endpoint del proyecto integrador de este track que reciba un nombre de archivo desde afuera (subir un comprobante, descargar un reporte).

**Cuándo no usarlo:** validar manualmente contra path traversal como aquí es necesario cuando el nombre de archivo viene de una fuente externa no confiable; para una ruta construida enteramente por el propio código, sin ningún componente proporcionado por el usuario, esta validación es innecesaria.

`Path ruta = Path.of("datos.txt"); String contenido = Files.readString(ruta);` representa la API moderna de manejo de archivos introducida en Java 7 (NIO.2), reemplazando gradualmente a la antigua clase `File` (presente desde las primeras versiones de Java), que tenía limitaciones notables: métodos que devolvían simplemente `false` ante un error sin indicar la causa específica (en vez de lanzar una excepción descriptiva), y una API considerablemente menos expresiva para operaciones comunes como copiar, mover, o recorrer directorios recursivamente.

`Files` ofrece métodos de alto nivel considerablemente más convenientes que sus equivalentes con `File`: `Files.exists(ruta)` (verificar existencia), `Files.copy(origen, destino)` (copiar), `Files.walk(directorio)` (recorrer recursivamente un árbol de directorios como un stream, Módulo 4, en vez de una API recursiva manual más verbosa), y `Files.writeString(ruta, "nuevo contenido")` para escribir directamente sin necesidad de gestionar manualmente un `Writer` o `OutputStream` para el caso simple de escribir contenido de texto completo de una sola vez.

**Analogía:** la antigua clase `File` es como un mapa antiguo y básico que solo indica si un camino existe o no, sin más detalle; NIO.2 con `Path`/`Files` es como un sistema de navegación moderno que no solo confirma la existencia de un camino, sino que ofrece rutas alternativas expresivas y detalles específicos sobre cualquier problema encontrado en el trayecto.

**¿Por qué es importante?** NIO.2 ofrece una API más expresiva y con mejor manejo de errores que la antigua clase `File`, simplificando operaciones comunes de archivos que antes requerían código considerablemente más verboso.

**Código del ejemplo:**

```java
Path ruta = Path.of("datos.txt");
String contenido = Files.readString(ruta);
Files.writeString(ruta, "nuevo contenido");
```

La validación contra *path traversal* que exigen la Demostración guiada (Paso 4) y la Práctica guiada (Paso 5) se apoya exactamente en este patrón: resolver la ruta recibida contra un directorio base conocido, normalizarla, y confirmar que el resultado normalizado todavía comienza dentro de ese directorio base antes de leer nada.

```java
Path resuelta = directorioBase.resolve(nombreArchivo).normalize();
if (!resuelta.startsWith(directorioBase)) {
    throw new IllegalArgumentException("Ruta fuera del directorio permitido: " + nombreArchivo);
}
```

Con `nombreArchivo = "../../../etc/passwd"`, `resolve` seguido de `normalize()` produce una ruta que sale de `directorioBase`; `startsWith` lo detecta antes de que `Files.readString` llegue a ejecutarse, y el método lanza `IllegalArgumentException` en vez de leer un archivo fuera del directorio permitido.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-nio-path-traversal
cd ejemplo-nio-path-traversal
mkdir -p src/main/java/academia/archivos
```
Crea `LectorComprobantes.java` con un método que reciba un nombre de archivo, lo resuelva contra un directorio base permitido con `Path.resolve` + `normalize()`, y rechace la lectura si el resultado queda fuera de ese directorio:
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
Compila y ejecuta:
```bash
javac -d out src/main/java/academia/archivos/LectorComprobantes.java
java -cp out academia.archivos.LectorComprobantes comprobante-001.txt
```
**Resultado esperado:** crea `comprobantes/comprobante-001.txt` si no existe e imprime `monto=125000;estado=PAGADO`.

#### Paso 5 · Práctica guiada
Pista: invoca el mismo programa con `../../../etc/passwd` como nombre de archivo (`java -cp out academia.archivos.LectorComprobantes ../../../etc/passwd`) para provocar un fallo deliberado de validación. Resultado esperado: `resolve` + `normalize()` produce una ruta que ya no empieza con el directorio base, `startsWith` lo detecta, y el programa termina con `IllegalArgumentException: Ruta fuera del directorio permitido: ../../../etc/passwd` sin haber intentado leer ningún archivo fuera del directorio de comprobantes.

#### Paso 6 · Práctica independiente
Agrega `Files.copy` para respaldar el comprobante leído a un directorio de archivo, y una prueba que confirme que un nombre con `..` es rechazado antes de tocar el sistema de archivos.

#### Paso 7 · Cierre y evidencia
Guarda el validador de rutas, la prueba de traversal rechazada y la lectura válida; como siguiente paso estudia serialización con Jackson. Errores comunes: concatenar rutas con `+` en vez de `resolve()`, confiar en la extensión del archivo sin validar la ruta completa resuelta, y normalizar antes de resolver en vez de después (el orden importa: primero `resolve`, después `normalize()`). Fuentes oficiales: https://dev.java/learn/java-io/file-system/ y https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html.
**¿Por qué es importante?** Porque aceptar un nombre de archivo externo sin validar que la ruta resuelta permanezca dentro del directorio permitido es exactamente el tipo de vulnerabilidad (path traversal) que permite leer archivos arbitrarios del sistema, no solo los comprobantes esperados.

### Tema 2: Serialización con Jackson

#### Paso 1 · Objetivo y preparación
Al finalizar podrás serializar y deserializar un `record` a/desde JSON con Jackson, confirmando que el ciclo completo preserva los datos. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version y mvn --version.

#### Paso 2 · Contexto y caso real
Una API de entregas necesita convertir un objeto `Entrega` a JSON para responder a un cliente, y reconstruir un objeto `Entrega` a partir del JSON que envía otro servicio, sin escribir manualmente el parsing campo por campo.

#### Paso 3 · Teoría, modelo mental y analogía
`ObjectMapper` serializa un objeto Java a JSON y deserializa en la dirección inversa, inspeccionando la estructura de la clase por reflexión. Los `record` (Módulo 7) son un modelo de datos particularmente natural para esto, sin anotaciones adicionales en el caso simple. La analogía: un traductor bidireccional entre dos idiomas que traduce automáticamente basándose en la estructura conocida de cada objeto.

**Evidencia de aprendizaje:** entrega el `record Entrega` serializado a JSON, la deserialización que reconstruye un objeto `equals()` al original, y el error de Jackson al faltar un campo obligatorio.
**Conceptos clave:** `ObjectMapper`, serializar/deserializar, records como modelos de datos.

Cada respuesta de API del proyecto integrador de este track usará esta misma combinación (`record` + Jackson) para convertir entidades de dominio a JSON y viceversa.

**Cuándo no usarlo:** para un JSON con forma muy irregular o que cambia con frecuencia sin control, mapearlo directamente a un `record` tipado puede romperse en cada cambio; en ese caso, parsear a una estructura genérica (`Map`/`JsonNode`) y extraer campos según se necesiten es más tolerante a variaciones.

Jackson es la librería estándar de facto para convertir objetos Java a JSON y viceversa: `ObjectMapper mapper = new ObjectMapper(); String json = mapper.writeValueAsString(new Persona("Ana", 28));` serializa un objeto Java (aquí, un `record Persona(String nombre, int edad) {}`, Módulo 7) a su representación JSON equivalente, mientras `mapper.readValue(json, Persona.class)` realiza la operación inversa, reconstruyendo un objeto Java a partir de una cadena JSON, inspeccionando por reflexión la estructura de la clase de destino para determinar cómo mapear cada campo del JSON a su propiedad correspondiente.

Usar records (Módulo 7) como modelos de datos serializables con Jackson es una combinación particularmente natural: los records ya proporcionan constructores, getters y `equals`/`hashCode` generados automáticamente sin boilerplate manual, y Jackson los soporta de forma nativa desde versiones recientes, reconociendo automáticamente los componentes del record como las propiedades a serializar/deserializar, sin necesidad de anotaciones adicionales en el caso simple donde los nombres de los campos JSON coinciden directamente con los nombres de los componentes del record.

**Analogía:** Jackson es como un traductor bidireccional especializado entre dos idiomas (objetos Java y JSON), capaz de traducir automáticamente en ambas direcciones basándose en la estructura conocida de cada objeto, sin que el desarrollador tenga que escribir manualmente las reglas de traducción para cada campo individual.

**¿Por qué es importante?** Jackson automatiza la conversión entre objetos Java y JSON basándose en la estructura de la clase, eliminando la necesidad de escribir manualmente lógica de parsing y serialización campo por campo.

**Código del ejemplo:**

```java
record Persona(String nombre, int edad) {}

ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new Persona("Ana", 28));
Persona persona = mapper.readValue(json, Persona.class);
```

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-jackson-record
cd ejemplo-jackson-record
mkdir -p src/main/java/academia/json
```
Crea `SerializacionEntrega.java` con `record Entrega(String numero, String estado, double pesoKg) {}` y un `main` que serialice una instancia a JSON con `ObjectMapper`, la imprima, y luego la deserialice de vuelta confirmando que el objeto reconstruido es `equals()` al original. Compila y ejecuta:
```bash
javac -d out src/main/java/academia/json/SerializacionEntrega.java
java -cp out academia.json.SerializacionEntrega
```

#### Paso 5 · Práctica guiada
Pista: modifica deliberadamente el JSON de entrada para que le falte el campo `pesoKg` y provoca un fallo de deserialización; lee el mensaje de Jackson e identifica qué campo falta. Resultado esperado: el error señala exactamente el campo faltante, no un fallo genérico.

#### Paso 6 · Práctica independiente
Agrega un segundo `record` anidado (por ejemplo `Entrega` con un campo `Destinatario` propio) y confirma que Jackson serializa/deserializa la estructura anidada completa sin configuración adicional.

#### Paso 7 · Cierre y evidencia
Guarda el `record`, el JSON serializado y la confirmación de igualdad tras el ciclo completo; como siguiente paso estudia archivos grandes y recursos del classpath. Errores comunes: olvidar un constructor sin argumentos o getters/setters esperando que Jackson los necesite para un `record` (no los necesita), asumir que un campo faltante en el JSON se completa con un valor por defecto silencioso en vez de fallar, y no fijar una versión concreta de Jackson en el proyecto. Fuentes oficiales: https://dev.java/learn/java-io/file-system/ y https://github.com/FasterXML/jackson-docs.
**¿Por qué es importante?** Porque serializar y deserializar manualmente campo por campo es repetitivo y propenso a errores de sincronización entre el modelo Java y el JSON; Jackson automatiza esa conversión inspeccionando la estructura real del `record`, y falla con un mensaje específico cuando algo no coincide.

### Tema 3: Archivos grandes y recursos del classpath

#### Paso 1 · Objetivo y preparación
Al finalizar podrás procesar un archivo grande línea por línea sin cargarlo completo en memoria, y cargar un recurso empaquetado en el classpath. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version y mvn --version.

#### Paso 2 · Contexto y caso real
Un reporte diario de entregas puede tener cientos de miles de líneas; cargarlo completo con `readAllBytes` antes de procesarlo agotaría la memoria disponible en un servidor con recursos limitados.

#### Paso 3 · Teoría, modelo mental y analogía
Un `BufferedReader` procesa línea por línea, manteniendo en memoria solo la línea actual; `getResourceAsStream` carga un recurso empaquetado en el propio JAR, disponible sin importar dónde se despliegue la aplicación. La analogía: leer un libro página por página en vez de intentar sostenerlo completo en la memoria de una sola mirada.

**Evidencia de aprendizaje:** entrega la medición de memoria con `BufferedReader` (constante) frente a `readAllLines()` (creciente), y la carga exitosa de un recurso del classpath tras empaquetar la aplicación en un JAR.
**Conceptos clave:** procesamiento línea por línea, evitar cargar todo en memoria, `getResourceAsStream`.

Cualquier exportación o reporte grande del proyecto integrador de este track deberá procesarse línea por línea como aquí, nunca cargando el archivo completo en memoria primero.

**Cuándo no usarlo:** para un archivo pequeño (un archivo de configuración de unas pocas líneas), procesar línea por línea con `BufferedReader` es más código del necesario; `Files.readString`/`readAllLines` es más simple y no representa ningún riesgo de memoria en ese caso.

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

**¿Por qué es importante?** Leer un archivo grande línea por línea con un buffer evita problemas de memoria que cargar el archivo completo (`readAllBytes`) no evita; los recursos del classpath garantizan disponibilidad empaquetada junto con el código, sin depender de la ubicación específica del sistema de archivos del entorno de destino.

**Código del ejemplo:**

```java
try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) {
    String linea;
    while ((linea = reader.readLine()) != null) {
        procesar(linea); // procesa línea por línea, sin cargar el archivo completo en memoria
    }
}

try (InputStream in = getClass().getResourceAsStream("/config.json")) {
    String config = new String(in.readAllBytes());
}
```

---

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-archivo-grande
cd ejemplo-archivo-grande
mkdir -p src/main/java/academia/streaming
```
Crea `ProcesadorReporte.java` que genere primero un archivo de 500 000 líneas, y luego lo procese con `BufferedReader`/`readLine()` contando cuántas líneas cumplen una condición, midiendo la memoria usada con `Runtime.getRuntime().totalMemory() - freeMemory()`. Compila y ejecuta:
```bash
javac -d out src/main/java/academia/streaming/ProcesadorReporte.java
java -cp out academia.streaming.ProcesadorReporte
```

#### Paso 5 · Práctica guiada
Pista: reemplaza deliberadamente `BufferedReader`/`readLine()` por `Files.readAllLines()` (que carga todo en una lista en memoria) para provocar un fallo de expectativa en el uso de memoria medido; compara ambos números. Resultado esperado: `BufferedReader` mantiene un uso de memoria aproximadamente constante, `readAllLines()` crece con el tamaño del archivo.

#### Paso 6 · Práctica independiente
Agrega un `config.json` en `src/main/resources` y cárgalo con `getResourceAsStream("/config.json")`; confirma que funciona igual después de empaquetar la aplicación en un JAR.

#### Paso 7 · Cierre y evidencia
Guarda ambas mediciones de memoria y la carga del recurso del classpath; como siguiente paso estudia records y pattern matching. Errores comunes: leer todo el archivo con `readAllBytes`/`readAllLines` sin considerar su tamaño real, olvidar que `getResourceAsStream` devuelve `null` (no lanza excepción) si el recurso no existe en el classpath, y no cerrar el `BufferedReader` con try-with-resources dejando el descriptor de archivo abierto. Fuentes oficiales: https://dev.java/learn/java-io/file-system/ y https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html.
**¿Por qué es importante?** Porque cargar un archivo de cientos de miles de líneas completo en memoria antes de procesarlo puede agotar la memoria disponible, mientras que procesarlo línea por línea mantiene un uso de memoria acotado sin importar el tamaño real del archivo.

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
