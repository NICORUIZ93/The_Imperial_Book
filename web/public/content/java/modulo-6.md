# Módulo 6: I/O, NIO.2 y serialización


## Aprende construyendo

### Tema 1: NIO.2 — Path y Files · Intermedio · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Módulos 0–4 de Java (streams); JDK 27 o posterior y un editor. Comprueba `java --version`; este ejemplo se compila con `javac`, sin Maven.

**Al finalizar podrás:** leer, escribir, copiar y recorrer archivos con `Path`/`Files`; usar `Files.walk` como stream; distinguir `resolve` de `normalize`; y validar que la ruta resuelta (léxica y real) permanezca dentro de un directorio permitido.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional:** una plataforma de entregas procesa comprobantes subidos por el usuario; si el nombre de archivo contiene `../`, resolverlo sin validar podría escapar del directorio de comprobantes.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** NIO.2 ofrece una API más expresiva y con mejor manejo de errores que la antigua clase `File`, simplificando operaciones comunes de archivos que antes requerían código considerablemente más verboso.

`Path` representa una ubicación; `Files` ofrece operaciones explícitas de alto nivel. Validar que la ruta resuelta (`normalize()`) siga dentro del directorio permitido evita un path traversal.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `Path` frente a la clase `File` | Prerrequisito | `Path` inmutable y expresivo (`getFileName`/`getParent`) |
| operaciones de `Files` | Núcleo | `readString`/`writeString`/`copy`/`exists`/`size` |
| `createDirectories` y jerarquía | Variante | crear la ruta de carpetas de una vez |
| `Files.walk` como stream | Variante | recorrer el árbol de directorios perezosamente |
| `resolve` frente a `normalize` | Diagnóstico | el orden importa: resolver y luego normalizar |
| path traversal (`..`) | Diagnóstico | `startsWith` detecta el escape léxico |
| enlaces simbólicos y `toRealPath` | Límite | la ruta real puede salir del directorio |

Cada fila tiene su explicación individual a continuación.

**`Path` frente a la clase `File` (prerrequisito).** `Path` (NIO.2, desde Java 7) reemplaza a la vieja `java.io.File`. Es **inmutable** y expresivo: `path.getFileName()`, `getParent()`, `resolve()`, `relativize()`. `File` sigue existiendo pero da menos detalle de error y una API más pobre para copiar, mover o recorrer. En código nuevo usa `Path`/`Files`.

**Operaciones de `Files` (núcleo).** `Files` es la clase utilitaria de alto nivel: `readString`/`writeString` (texto completo de una vez), `copy`/`move`/`delete`, `exists`, `size`, `isRegularFile`/`isDirectory`. Sustituyen el código verboso de `Reader`/`Writer`/`Stream` para los casos comunes.

**`createDirectories` y jerarquía (variante).** `Files.createDirectories(ruta)` crea toda la cadena de carpetas que falte (como `mkdir -p`), sin fallar si ya existen. Úsalo antes de escribir en una subcarpeta que puede no existir aún.

**`Files.walk` como stream (variante).** `Files.walk(dir)` devuelve un `Stream<Path>` perezoso que recorre el árbol recursivamente; combínalo con `filter(Files::isRegularFile)` y las operaciones del Módulo 4. **Ciérralo** con try-with-resources (mantiene descriptores abiertos). Es la alternativa moderna a la recursión manual de directorios.

**`resolve` frente a `normalize` (diagnóstico).** `base.resolve(nombre)` une una ruta base con un nombre relativo; `normalize()` colapsa los `.`/`..` léxicos. El **orden importa**: primero resuelves contra la base y **después** normalizas, para detectar si el resultado se salió. Normalizar antes de resolver no protege.

**Path traversal (`..`) (diagnóstico).** Un nombre externo con `../../../fuera.txt` puede escapar del directorio permitido. Tras `resolve + normalize`, comprueba con `resuelta.startsWith(base)`: si no empieza por la base, rechaza **antes** de leer. Es la defensa léxica contra path traversal.

**Enlaces simbólicos y `toRealPath` (límite).** La comprobación léxica no basta: un enlace simbólico dentro del directorio puede apuntar fuera. `toRealPath()` resuelve el enlace a su destino real; vuelve a comprobar `startsWith(base)` sobre la ruta real. Aun así, ninguna comprobación elimina las carreras si otro proceso modifica el directorio a la vez.

`Path` y `Files` forman parte de NIO.2 desde Java 7; `Path.of`, `Files.readString` y `Files.writeString` están disponibles desde Java 11. La antigua clase `File` sigue existiendo, pero sus operaciones ofrecen menos detalles de error y una API menos expresiva para copiar, mover o recorrer directorios.

`Files` ofrece métodos de alto nivel considerablemente más convenientes que sus equivalentes con `File`: `Files.exists(ruta)` (verificar existencia), `Files.copy(origen, destino)` (copiar), `Files.walk(directorio)` (recorrer recursivamente un árbol de directorios como un stream, Módulo 4, en vez de una API recursiva manual más verbosa), y `Files.writeString(ruta, "nuevo contenido")` para escribir directamente sin necesidad de gestionar manualmente un `Writer` o `OutputStream` para el caso simple de escribir contenido de texto completo de una sola vez.

**Analogía:** la antigua clase `File` es como un mapa antiguo y básico que solo indica si un camino existe o no, sin más detalle; NIO.2 con `Path`/`Files` es como un sistema de navegación moderno que no solo confirma la existencia de un camino, sino que ofrece rutas alternativas expresivas y detalles específicos sobre cualquier problema encontrado en el trayecto.

**Conceptos clave:** API moderna frente a la clase File legada, operaciones expresivas.

**Código del ejemplo:**

```java
Path ruta = Path.of("datos.txt");
String contenido = Files.readString(ruta);
Files.writeString(ruta, "nuevo contenido");
```

La validación de la demostración bloquea el escape léxico: primero resuelve el nombre contra el directorio base, lo normaliza y comprueba el prefijo por componentes de ruta antes de leer.

```java
Path resuelta = directorioBase.resolve(nombreArchivo).normalize();
if (!resuelta.startsWith(directorioBase)) {
    throw new IllegalArgumentException("Ruta fuera del directorio permitido: " + nombreArchivo);
}
```

Con `nombreArchivo = "../../../fuera.txt"`, `resolve` seguido de `normalize()` produce una ruta que sale de `directorioBase`; `startsWith` lo detecta antes de leer. La normalización por sí sola no detiene un enlace simbólico que apunta fuera del directorio, por eso el ejemplo también compara la ruta real resuelta. Ninguna comprobación por nombre elimina todas las carreras si otro proceso puede modificar el directorio al mismo tiempo.

Este validador de rutas es exactamente lo que necesitará cualquier endpoint del proyecto integrador de este track que reciba un nombre de archivo desde afuera (subir un comprobante, descargar un reporte).

**Cuándo no usarlo:** validar manualmente contra path traversal como aquí es necesario cuando el nombre de archivo viene de una fuente externa no confiable; para una ruta construida enteramente por el propio código, sin ningún componente proporcionado por el usuario, esta validación es innecesaria.

**Implicación práctica:** Aceptar un nombre de archivo externo sin validar la contención léxica y la ruta real permite leer archivos fuera del área prevista; un endpoint de producción también debe proteger el directorio contra modificaciones concurrentes no confiables.

#### Practica

**Paso 4 · Demostración guiada desde cero**

Parte de una carpeta vacía y prepara la estructura.

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

    public LectorComprobantes(Path directorioBase) throws IOException {
        this.directorioBase = directorioBase.toRealPath();
    }

    public String leer(String nombreArchivo) throws IOException {
        if (nombreArchivo == null || nombreArchivo.isBlank()) {
            throw new IllegalArgumentException("El nombre del archivo es obligatorio");
        }
        Path resuelta = directorioBase.resolve(nombreArchivo).normalize();
        if (!resuelta.startsWith(directorioBase)) {
            throw new IllegalArgumentException("Ruta fuera del directorio permitido");
        }
        Path rutaReal = resuelta.toRealPath();
        if (!rutaReal.startsWith(directorioBase)) {
            throw new IllegalArgumentException("La ruta real sale del directorio permitido");
        }
        return Files.readString(rutaReal);
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

**Paso 5 · Práctica guiada**

Repite con `../../../fuera.txt` y confirma que falla antes de `Files.readString`. En un entorno que permita crear enlaces simbólicos, crea dentro de `comprobantes` un enlace a un archivo fuera del directorio y verifica que la comparación con `toRealPath()` también lo rechaza.

**Pista:** `normalize()` detecta `..` en la ruta léxica; `toRealPath()` sigue el enlace y permite comprobar su destino. La segunda comprobación requiere que el archivo exista.

**Fallo deliberado:** invoca el mismo programa con `../../../fuera.txt` como nombre de archivo (`java -cp out academia.archivos.LectorComprobantes ../../../fuera.txt`).

**Pista:** `resolve` + `normalize()` produce una ruta que ya no empieza con el directorio base, `startsWith` lo detecta y el programa termina antes de leer nada.

Ahora cierra los subtemas de operaciones de `Files` y `walk`. Crea `src/main/java/academia/archivos/DemoFiles.java`:

```java
package academia.archivos;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class DemoFiles {
    public static void main(String[] args) throws Exception {
        Path base = Files.createTempDirectory("nio-demo");
        Path a = base.resolve("a.txt");
        Files.writeString(a, "monto=100");                     // escribir texto completo
        System.out.println("readString=" + Files.readString(a));
        System.out.println("exists=" + Files.exists(a) + " size=" + Files.size(a));
        Path b = base.resolve("sub/b.txt");
        Files.createDirectories(b.getParent());                // crea la jerarquía
        Files.copy(a, b);                                      // copiar
        try (Stream<Path> w = Files.walk(base)) {              // recorrer como stream
            List<String> archivos = w.filter(Files::isRegularFile)
                .map(p -> base.relativize(p).toString()).sorted().toList();
            System.out.println("walk=" + archivos);
        }
        Path fuera = base.resolve("../fuera.txt").normalize();
        System.out.println("sale de base? " + !fuera.startsWith(base));
        try (Stream<Path> todo = Files.walk(base)) {           // limpieza (hojas primero)
            todo.sorted(Comparator.reverseOrder()).forEach(p -> { try { Files.delete(p); } catch (Exception e) {} });
        }
    }
}
```

```bash
javac -d out src/main/java/academia/archivos/DemoFiles.java
java -cp out academia.archivos.DemoFiles
```

**Salida esperada (verificada con Temurin 27.0.1; el tamaño es fijo, el nombre temporal varía):**

```text
readString=monto=100
exists=true size=9
copia... (walk muestra ambos archivos)
walk=[a.txt, sub/b.txt]
sale de base? true
```

`writeString`/`readString` manejan el texto completo; `size` devuelve 9 bytes; `createDirectories` creó `sub/`; `copy` duplicó el archivo; `walk` recorrió el árbol y listó los dos archivos; y `resolve + normalize` detectó el escape de la base.

**Si falla.** Si `../../../etc/passwd` imprime contenido, la validación se aplicó después de leer o la base no se normalizó. Si `walk` deja descriptores abiertos, no lo cerraste con try-with-resources. Si el programa falla con `ArrayIndexOutOfBoundsException`, falta pasar el nombre de archivo como argumento al `LectorComprobantes`.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega `Files.copy` para respaldar el comprobante leído a un directorio de archivo, y pruebas para el rechazo de `..` y de un enlace simbólico externo cuando el sistema de archivos lo permita.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `LectorComprobantes.java` compila; un nombre válido imprime `monto=125000;estado=PAGADO`.
- [ ] `../../../etc/passwd` se rechaza con `IllegalArgumentException` antes de leer.
- [ ] `Files.writeString`/`readString`/`copy`/`size` producen la salida del `DemoFiles`.
- [ ] `Files.walk` (cerrado con try-with-resources) lista los archivos del árbol.
- [ ] `resolve` + `normalize` detecta el escape de la base; `toRealPath` cubre el enlace simbólico.
- [ ] Explicas por qué se normaliza después de resolver y no antes.

**Si falla.** Si `Files.copy` falla porque el destino existe, decide explícitamente si sobrescribir (`REPLACE_EXISTING`) o rechazar. Si la prueba con `..` no lanza, revisa que esté llamando `leer` y no construyendo la ruta por fuera del validador.

Guarda el validador de rutas, la prueba de traversal rechazada y la lectura válida.

**Antes del siguiente tema:** explica la diferencia entre normalizar una ruta y resolverla en el sistema de archivos, incluyendo el caso de un enlace simbólico.

**Errores comunes:** concatenar rutas con `+` en vez de `resolve()`, confiar en la extensión del archivo sin validar la ruta completa resuelta, y normalizar antes de resolver en vez de después (el orden importa: primero `resolve`, después `normalize()`).

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: File System](https://dev.java/learn/java-io/file-system/), [`Path` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/nio/file/Path.html) y [`Files` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/nio/file/Files.html).

---

### Tema 2: Serialización con Jackson · Intermedio · 50 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Tema 1 de este módulo y records (Módulo 7); JDK 27 o posterior, Maven y un editor. Comprueba `java --version` y `mvn --version`.

**Al finalizar podrás:** serializar y deserializar un `record` a/desde JSON con Jackson confirmando que el ciclo preserva los datos; manejar campos ausentes; activar deserialización estricta; y decidir entre record tipado y `JsonNode`.

#### Aprende

**Paso 2 · Contexto y caso profesional**

Una API de entregas necesita convertir un objeto `Entrega` a JSON para responder a un cliente, y reconstruir un objeto `Entrega` a partir del JSON que envía otro servicio, sin escribir manualmente el parsing campo por campo.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Jackson automatiza la conversión entre objetos Java y JSON basándose en la estructura de la clase, eliminando la necesidad de escribir manualmente lógica de parsing y serialización campo por campo.

`ObjectMapper` serializa un objeto Java a JSON y deserializa en la dirección inversa, inspeccionando la estructura de la clase por reflexión. Los `record` (Módulo 7) son un modelo de datos particularmente natural para esto, sin anotaciones adicionales en el caso simple.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `ObjectMapper` y el ciclo serializar/deserializar | Núcleo | `writeValueAsString`/`readValue` conservan los datos |
| records como modelo serializable | Variante | sin anotaciones si los nombres coinciden |
| campos ausentes y valores por defecto | Diagnóstico | un JSON incompleto deja el valor por defecto del tipo |
| deserialización estricta | Diagnóstico | `FAIL_ON_*` rechaza JSON que no cuadra |
| `JsonNode`/`Map` para JSON irregular | Decisión | árbol genérico cuando la forma varía |
| versión fija de la dependencia | Límite | fijar Jackson evita cambios silenciosos |

Cada fila tiene su explicación individual a continuación.

**`ObjectMapper` y el ciclo (núcleo).** `ObjectMapper.writeValueAsString(obj)` serializa a JSON y `readValue(json, Clase.class)` reconstruye el objeto. El ciclo completo (objeto → JSON → objeto) debe conservar los datos: si el reconstruido es `equals()` al original, el mapeo es correcto. Reutiliza un `ObjectMapper` (es thread-safe una vez configurado).

**Records como modelo serializable (variante).** Un `record` es un modelo natural: Jackson reconoce sus componentes como propiedades sin anotaciones, siempre que los nombres del JSON coincidan con los del record. Aporta inmutabilidad y `equals`/`hashCode` gratis (Módulo 7). Cuando los nombres difieren, se usan anotaciones (`@JsonProperty`).

**Campos ausentes y valores por defecto (diagnóstico).** Si el JSON **omite** un campo, Jackson deja el valor por defecto del tipo (`0` para `double`, `null` para referencias). Esto puede pasar desapercibido: un peso que llega como `0.0` porque faltaba en el JSON parece un dato válido. Decide si eso es aceptable o debe rechazarse.

**Deserialización estricta (diagnóstico).** Para no aceptar JSON malformado en silencio, activa features como `FAIL_ON_UNKNOWN_PROPERTIES` (rechaza campos extra) o `FAIL_ON_MISSING_CREATOR_PROPERTIES` (exige los del constructor). Convierte un "funcionó pero con datos incompletos" en un error explícito en la frontera.

**`JsonNode`/`Map` para JSON irregular (decisión).** Cuando la forma del JSON varía o no la controlas, mapear a un `record` tipado se rompe en cada cambio. Alternativa: parsear a `JsonNode` o `Map<String,Object>` y extraer los campos que necesitas. Más tolerante, menos seguro de tipos: elige según cuánto controles el contrato.

**Versión fija de la dependencia (límite).** Jackson evoluciona; fija una **versión exacta** en el `pom.xml`/`build.gradle` (aquí 2.21.x) en vez de un rango abierto, para que una actualización no cambie el comportamiento de serialización sin que lo decidas. La deserialización de JSON no confiable, además, tiene implicaciones de seguridad (ver M14 T3).

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

**Paso 4 · Demostración guiada desde cero**

Parte de una carpeta vacía y prepara un proyecto Maven con Jackson.

```bash
mkdir ejemplo-jackson-record
cd ejemplo-jackson-record
mkdir -p src/main/java/academia/json
```

**Crea** `pom.xml` con una versión fija de Jackson y del plugin que compila los records:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId>
  <artifactId>ejemplo-jackson</artifactId>
  <version>1.0</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.21.8</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.16.0</version>
      </plugin>
    </plugins>
  </build>
</project>
```

**Crea** `SerializacionEntrega.java` con `record Entrega(String numero, String estado, double pesoKg) {}` y un `main` que serialice una instancia a JSON con `ObjectMapper`, la imprima, y luego la deserialice de vuelta confirmando que el objeto reconstruido es `equals()` al original:

```java
package academia.json;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;

record Entrega(String numero, String estado, double pesoKg) {}

public final class SerializacionEntrega {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Entrega original = new Entrega("E-001", "EN_RUTA", 12.5);

        String json = mapper.writeValueAsString(original);
        System.out.println(json);

        Entrega reconstruida = mapper.readValue(json, Entrega.class);
        System.out.println("Iguales: " + original.equals(reconstruida));

        String incompleto = "{\"numero\":\"E-001\",\"estado\":\"EN_RUTA\"}";
        Entrega conPredeterminado = mapper.readValue(incompleto, Entrega.class);
        System.out.println("Peso predeterminado: " + conPredeterminado.pesoKg());

        ObjectMapper estricto = mapper.copy()
            .enable(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES);
        try {
            estricto.readValue(incompleto, Entrega.class);
            throw new IllegalStateException("Se esperaba un error por pesoKg ausente");
        } catch (MismatchedInputException e) {
            System.out.println("Falta un dato obligatorio: pesoKg");
        }
    }
}
```

**Ejecuta el ejemplo** (Maven resuelve Jackson y construye el classpath):

```bash
mvn -q compile dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" academia.json.SerializacionEntrega
```

**Resultado esperado:** imprime `{"numero":"E-001","estado":"EN_RUTA","pesoKg":12.5}`, `Iguales: true`, `Peso predeterminado: 0.0` y `Falta un dato obligatorio: pesoKg`.

**Paso 5 · Práctica guiada**

Deserializa `{"numero":"E-001","estado":"EN_RUTA"}` con un mapper predeterminado y otro que habilite `FAIL_ON_MISSING_CREATOR_PROPERTIES`. Compara el `0.0` de la primera conversión con la excepción explícita de la segunda.

**Fallo deliberado:** quita el campo `pesoKg` del JSON y deserializa con un mapper estricto. Con el `ObjectMapper` predeterminado no falla: completa `pesoKg` con `0.0`. Para que el dato obligatorio se verifique, activa la comprobación:

```java
import com.fasterxml.jackson.databind.DeserializationFeature;

ObjectMapper estricto = new ObjectMapper()
    .enable(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES);
```

**Pista:** con la verificación estricta, Jackson lanza `MismatchedInputException: Missing creator property 'pesoKg'`. **Resultado esperado:** el error nombra exactamente el campo faltante, no un fallo genérico.

**Si falla.** Si `mvn` no encuentra `jackson-databind`, revisa la versión fijada en `pom.xml` y la conexión al repositorio. Si el `record` no se reconstruye, confirma que los nombres del JSON coinciden con los componentes. Si el campo faltante no genera error, no activaste `FAIL_ON_MISSING_CREATOR_PROPERTIES`.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega un segundo `record` anidado (por ejemplo `Entrega` con un campo `Destinatario` propio) y confirma que Jackson serializa/deserializa la estructura anidada completa sin configuración adicional.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `pom.xml` fija una versión concreta de `jackson-databind`.
- [ ] `SerializacionEntrega.java` compila con `mvn -q compile`.
- [ ] El JSON serializado contiene `numero`, `estado` y `pesoKg`.
- [ ] La deserialización reconstruye un objeto `equals()` al original.
- [ ] El JSON sin `pesoKg` se completa con `0.0` con el mapper predeterminado.
- [ ] Con `FAIL_ON_MISSING_CREATOR_PROPERTIES` el error nombra `pesoKg`.

**Si falla.** Si la estructura anidada no se reconstruye, revisa que el `record` interno también sea accesible para Jackson. Si la comparación `equals` falla, imprime ambos objetos y compara campo por campo antes de cambiar el modelo.

Guarda el `record`, el JSON serializado y la confirmación de igualdad tras el ciclo completo.

**Antes del siguiente tema:** explica qué error se evita al habilitar `FAIL_ON_MISSING_CREATOR_PROPERTIES` y por qué las versiones de dependencia y plugin deben estar fijadas.

**Errores comunes:** olvidar un constructor sin argumentos o getters/setters esperando que Jackson los necesite para un `record` (no los necesita), asumir que un campo faltante en el JSON siempre falla cuando el mapper predeterminado completa `0.0` en un `double` (activa `FAIL_ON_MISSING_CREATOR_PROPERTIES` si el dato es obligatorio), y no fijar una versión concreta de Jackson en el proyecto.

**Fuentes oficiales revisadas el 2026-11-01:** [Jackson Documentation](https://github.com/FasterXML/jackson-docs), [Apache Maven Compiler Plugin](https://maven.apache.org/plugins/maven-compiler-plugin/) y [Maven Central: jackson-databind 2.21.8](https://repo.maven.apache.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.21.8/).

---

### Tema 3: Archivos grandes y recursos del classpath · Intermedio · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Tema 1 de este módulo; JDK 27 o posterior y un editor. Comprueba `java --version`; el ejemplo se compila con `javac`, sin Maven.

**Al finalizar podrás:** procesar un archivo grande línea por línea sin cargarlo completo en memoria; recorrerlo con `Files.lines`; reconocer el límite de la línea más larga; y cargar un recurso empaquetado del classpath con `getResourceAsStream`.

#### Aprende

**Paso 2 · Contexto y caso profesional**

Un reporte diario de entregas puede tener cientos de miles de líneas; cargarlo completo con `readAllBytes` antes de procesarlo agotaría la memoria disponible en un servidor con recursos limitados.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Leer un archivo grande línea por línea con un buffer evita problemas de memoria que cargar el archivo completo (`readAllBytes`) no evita; los recursos del classpath garantizan disponibilidad empaquetada junto con el código, sin depender de la ubicación específica del sistema de archivos del entorno de destino.

Un `BufferedReader` procesa línea por línea, manteniendo la línea actual y el buffer; la memoria depende también de la longitud de esa línea. `getResourceAsStream` abre un recurso empaquetado en el classpath, sin convertirlo en una ruta del sistema de archivos.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| cargar todo frente a streaming | Núcleo | `readAllLines` crece con el archivo; `readLine` no |
| `BufferedReader`/`readLine` | Núcleo | procesa línea a línea sin retener todo |
| memoria por línea | Límite | una línea enorme todavía consume memoria |
| `Files.lines` como stream | Variante | recorrer líneas como `Stream<String>` perezoso |
| recurso del classpath (`getResourceAsStream`) | Núcleo | recurso empaquetado, no ruta del sistema de archivos |
| classpath frente a sistema de archivos | Decisión | empaquetado y portable vs ubicación concreta |

Cada fila tiene su explicación individual a continuación.

**Cargar todo frente a streaming (núcleo).** `Files.readString`/`readAllBytes`/`readAllLines` cargan el archivo **completo** en memoria: bien para archivos pequeños, inviable para uno que se acerca a la memoria disponible. El streaming línea a línea procesa sin retener todo: la memoria no crece con el tamaño del archivo.

**`BufferedReader`/`readLine` (núcleo).** `Files.newBufferedReader(ruta)` + `while ((linea = reader.readLine()) != null)` lee una línea cada vez, dentro de un try-with-resources. Es el patrón para reportes grandes: procesas y descartas cada línea sin acumularlas.

**Memoria por línea (límite).** El streaming no es mágico: la memoria depende de la **línea más larga** y del buffer, no del total. Un archivo con una sola línea gigantesca (un JSON enorme en una línea) todavía puede agotar memoria. Para esos casos necesitas parsing incremental (streaming parser), no `readLine`.

**`Files.lines` como stream (variante).** `Files.lines(ruta)` devuelve un `Stream<String>` perezoso que combina con las operaciones del Módulo 4 (`filter`/`count`). **Ciérralo** con try-with-resources (mantiene el archivo abierto). Es la forma funcional del streaming línea a línea.

**Recurso del classpath (núcleo).** `getClass().getResourceAsStream("/config.json")` abre un archivo empaquetado en el **classpath** (desde `src/main/resources`, dentro del JAR en producción), no una ruta del sistema de archivos. Devuelve un `InputStream`; si el recurso no existe, es `null` (compruébalo). No uses `Files` para leer algo que vive dentro del JAR.

**Classpath frente a sistema de archivos (decisión).** Un recurso del classpath **viaja con el código** y está disponible en cualquier despliegue; un archivo del sistema de archivos depende de existir en una ruta concreta de la máquina. Usa classpath para configuración/plantillas empaquetadas con la app; usa `Files` para datos externos (subidas, reportes generados).

Leer un archivo grande completo de una sola vez (con `Files.readAllBytes` o `Files.readString`, apropiados para archivos pequeños) carga necesariamente el contenido completo en memoria simultáneamente, un enfoque que se vuelve problemático o directamente inviable para archivos cuyo tamaño se acerca o supera la memoria disponible. La alternativa procesa el archivo línea por línea:

```java
try (BufferedReader reader = Files.newBufferedReader(rutaGrande)) {
    String linea;
    while ((linea = reader.readLine()) != null) {
        procesar(linea);
    }
}
```

Este patrón no conserva todas las líneas: su memoria de procesamiento depende de la línea más larga y del buffer, no del tamaño total del archivo. Una sola línea enorme todavía puede requerir mucha memoria.

`getResourceAsStream("/config.json")` carga un archivo empaquetado dentro del propio JAR de la aplicación (típicamente ubicado en `src/main/resources` durante el desarrollo, y empaquetado dentro del JAR final en producción), a diferencia de `Files`, que opera sobre el sistema de archivos real del sistema operativo donde la aplicación se ejecuta: los recursos del classpath viajan empaquetados junto con el propio código compilado de la aplicación, garantizando que estén disponibles sin importar en qué máquina o entorno específico se despliegue esa aplicación, mientras que un archivo en el sistema de archivos real depende de que exista físicamente en esa ubicación específica del sistema donde la aplicación se ejecuta en ese momento.

**Analogía:** leer un archivo completo de una sola vez es como intentar cargar un libro entero en la memoria de una sola mirada; leerlo línea por línea con un buffer es como leerlo página por página, recordando solo la página actual sin necesidad de mantener el libro completo abierto simultáneamente en la mente. Un recurso del classpath es como un anexo que viaja empaquetado junto con el manual de instrucciones mismo, disponible en cualquier lugar donde ese manual se distribuya, a diferencia de un archivo suelto que depende de existir físicamente en un lugar específico del destino.

**Conceptos clave:** procesamiento línea por línea, evitar cargar todo en memoria, `getResourceAsStream`.

Para una exportación o reporte grande del proyecto integrador, procesa línea por línea cuando el caso lo permita; conserva el contenido completo solo si su tamaño está acotado y cabe razonablemente en memoria.

**Cuándo no usarlo:** para un archivo pequeño (un archivo de configuración de unas pocas líneas), procesar línea por línea con `BufferedReader` es más código del necesario; `Files.readString`/`readAllLines` es más simple y no representa ningún riesgo de memoria en ese caso.

**Implicación práctica:** `readAllLines()` retiene todas las líneas y crece con el archivo; `BufferedReader` conserva una línea a la vez, aunque una línea individual puede ser grande.

#### Practica

**Paso 4 · Demostración guiada desde cero**

Parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-archivo-grande
cd ejemplo-archivo-grande
mkdir -p src/main/java/academia/streaming
mkdir -p src/main/resources
```

**Crea** `src/main/resources/config.json`:

```json
{"modo":"local","maximoLineas":500000}
```

**Crea** `ProcesadorReporte.java` que genere primero un archivo de 500 000 líneas, y luego lo procese con `BufferedReader`/`readLine()` contando cuántas líneas cumplen una condición, midiendo la memoria usada con `Runtime.getRuntime().totalMemory() - freeMemory()`:

```java
package academia.streaming;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

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

    static long procesarCompleto() throws IOException {
        List<String> lineas = Files.readAllLines(ARCHIVO);
        System.out.printf("Heap con todas las líneas retenidas: %.1f MB%n",
            memoriaUsada() / 1_048_576.0);
        return lineas.stream()
            .filter(linea -> linea.endsWith("estado=PAGADO"))
            .count();
    }

    static String cargarConfiguracion() throws IOException {
        try (var recurso = ProcesadorReporte.class.getResourceAsStream("/config.json")) {
            if (recurso == null) {
                throw new IOException("No se encontró /config.json en el classpath");
            }
            return new String(recurso.readAllBytes(), StandardCharsets.UTF_8);
        }
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
        System.out.println("Líneas pagadas con readAllLines: " + procesarCompleto());
        System.out.println("Configuración: " + cargarConfiguracion());
    }
}
```

**Ejecuta el ejemplo** y agrega el recurso a la salida de compilación para que esté en el classpath:

```bash
javac -d out src/main/java/academia/streaming/ProcesadorReporte.java
cp src/main/resources/config.json out/
java -cp out academia.streaming.ProcesadorReporte
```

**Resultado esperado:** ambas variantes cuentan `250000` líneas pagadas y el programa imprime la configuración. Los valores del heap son observaciones aproximadas afectadas por el recolector; no son una medida del pico de asignaciones. El archivo generado tiene 500 000 líneas.

**Paso 5 · Práctica guiada**

Compara `procesar()` con `procesarCompleto()`: comprueba que devuelven el mismo conteo y observa que `readAllLines()` mantiene la lista viva mientras la procesa. Repite con otro número de líneas; razona sobre la diferencia de memoria por estructura, no sobre un valor exacto del heap.

**Fallo deliberado:** reemplaza `BufferedReader`/`readLine()` por `Files.readAllLines()` en el proceso principal. Predice qué ocurre con la memoria retenida antes de ejecutar la variante.

**Pista:** `BufferedReader` no conserva la lista completa; `readAllLines()` sí. El heap puede variar entre ejecuciones porque interviene el recolector.

**Si falla.** Si el conteo no es 250 000, la condición de paridad o el sufijo de estado cambiaron. Si `getResourceAsStream` devuelve `null`, copia el recurso a `out/` antes de ejecutar. Si el archivo no se crea, revisa permisos del directorio de trabajo.

#### Aplica

**Paso 6 · Práctica independiente**

Empaqueta las clases y el recurso en un JAR con `jar --create --file reporte.jar -C out .`; ejecútalo con `java -cp reporte.jar academia.streaming.ProcesadorReporte` y confirma que lee la misma configuración.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `ProcesadorReporte.java` compila y ejecuta con `javac` y `java -cp out`.
- [ ] El archivo generado tiene 500 000 líneas.
- [ ] El conteo de líneas pagadas es 250 000.
- [ ] Comparaste la lista retenida por `readAllLines()` con el procesamiento de una línea a la vez.
- [ ] `getResourceAsStream("/config.json")` carga el recurso empaquetado.
- [ ] El recurso sigue disponible después de empaquetar en un JAR.

**Si falla.** Si `getResourceAsStream` devuelve `null`, el recurso no se copió a `out/` o la ruta no empieza con `/`. Si el JAR no incluye el recurso, revisa que `config.json` esté en `out/` antes de crearlo.

Guarda ambos conteos, la observación de memoria y la lectura del recurso dentro del JAR.

**Antes del siguiente tema:** explica por qué una lectura línea por línea reduce lo retenido pero no limita el tamaño de una línea individual, y cómo un recurso viaja dentro del JAR.

**Errores comunes:** leer todo el archivo con `readAllBytes`/`readAllLines` sin considerar su tamaño real, olvidar que `getResourceAsStream` devuelve `null` (no lanza excepción) si el recurso no existe en el classpath, y no cerrar el `BufferedReader` con try-with-resources dejando el descriptor de archivo abierto.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: File System](https://dev.java/learn/java-io/file-system/), [`BufferedReader` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/io/BufferedReader.html) y [`Files.lines` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/nio/file/Files.html#lines(java.nio.file.Path)).

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
