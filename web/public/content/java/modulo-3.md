# Módulo 3: Excepciones y manejo de recursos

Los errores son parte normal de un programa: un archivo no existe, una entrada es inválida, una conexión falla o un estado no permite una operación. Ignorarlos o manejarlos mal produce bugs silenciosos, datos corruptos y recursos abiertos. Este módulo enseña a distinguir tipos de excepciones, liberar recursos correctamente, crear excepciones con semántica de dominio y aplicar esas reglas en un flujo de importación.

**Entorno de referencia verificado (2026-05-22):** JDK 27 (`java -version` / `javac -version`).

## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions · Básico · 35 min

Lees edad desde texto: `"abc"` es un dato inválido; un archivo ausente es un fallo externo. Tratarlos igual crea mal manejo de errores. La jerarquía de excepciones de Java existe para modelar esta diferencia.

#### Checked exceptions

**Definición formal.** Son subclases de `Exception` que no heredan de `RuntimeException`. El compilador exige manejarlas con `try-catch` o declararlas con `throws`.

**Para qué sirve.** Obliga a quien llama a decidir ante fallos externos recuperables: I/O, red, SQL, archivos.

**Cuándo usarla y cuándo no.** Úsala cuando el llamador puede recuperarse razonablemente. No la uses para validaciones de argumentos o bugs de programación; eso vuelve ruidosas las APIs.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t1-checked && cd /tmp/java-m3-t1-checked
```

```java
import java.io.IOException;
import java.nio.file.*;

public class DemoChecked {
    static String leer(Path p) throws IOException { return Files.readString(p); }
    public static void main(String[] args) throws Exception {
        Path p = Path.of("t.txt");
        Files.writeString(p, "ok");
        System.out.println(leer(p));
        Files.deleteIfExists(p);
    }
}
```

**Caso de uso real.** Leer configuración desde archivo: el llamador puede usar un valor por defecto o detener el arranque con mensaje claro.

**Error común.** Capturar `IOException` vacío. Síntoma: el programa continúa como si nada hubiera pasado. Corrección: registrar, traducir o relanzar con contexto.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoChecked.java
java DemoChecked
```

```text
ok
```

#### Unchecked exceptions

**Definición formal.** Son `RuntimeException` y sus subclases. El compilador no obliga a capturarlas ni declararlas.

**Para qué sirve.** Señalan bugs, precondiciones violadas o estados inválidos que normalmente no se recuperan localmente.

**Cuándo usarla y cuándo no.** Úsalas para validaciones de argumentos (`IllegalArgumentException`), estado inválido (`IllegalStateException`) o errores de programación. No las captures masivamente para “que no falle”.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t1-unchecked && cd /tmp/java-m3-t1-unchecked
```

```java
public class DemoUnchecked {
    static int edad(String t) {
        if (t == null || t.isBlank()) throw new IllegalArgumentException("obligatoria");
        return Integer.parseInt(t);
    }
    public static void main(String[] args) {
        try { edad(""); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** Validación de DTO: si falta un campo obligatorio, se rechaza la operación con excepción clara.

**Error común.** `catch (RuntimeException e) {}`. Síntoma: bugs ocultos y estado inconsistente. Corrección: dejar fallar o manejar en frontera con logging/contexto.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoUnchecked.java
java DemoUnchecked
```

```text
obligatoria
```

#### Jerarquía `Throwable`

**Definición formal.** `Throwable` es la raíz. Se divide en `Error` (fallos graves del entorno, como `OutOfMemoryError`) y `Exception`. Dentro de `Exception`, `RuntimeException` y sus subclases son unchecked.

**Para qué sirve.** Permite clasificar fallos y decidir estrategia: manejar, traducir, declarar o dejar propagar.

**Cuándo usarla y cuándo no.** Captura tipos específicos. No captures `Throwable` o `Exception` sin criterio; puedes ocultar bugs o errores graves.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t1-jerarquia && cd /tmp/java-m3-t1-jerarquia
```

```java
public class DemoJerarquia {
    public static void main(String[] args) {
        try { Integer.parseInt("abc"); }
        catch (RuntimeException e) { System.out.println(e.getClass().getSimpleName()); }
    }
}
```

**Caso de uso real.** Una capa de frontera traduce excepciones técnicas conocidas a respuestas HTTP, pero deja pasar bugs inesperados con logging.

**Error común.** `catch (Exception e)` en todo. Síntoma: se tratan igual fallos recuperables y bugs. Corrección: capturar tipos concretos.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoJerarquia.java
java DemoJerarquia
```

```text
NumberFormatException
```

#### `throw`, `throws`, `try-catch-finally`

**Definición formal.** `throw` lanza una excepción. `throws` declara que un método puede lanzar una checked exception. `try-catch-finally` permite manejar errores y ejecutar limpieza.

**Para qué sirve.** Controlan el flujo de error y la liberación de lógica de limpieza. `finally` se ejecuta al salir del `try/catch` salvo terminación anómala de JVM.

**Cuándo usarlo y cuándo no.** Usa `throw` para señalar la violación; `throws` para delegar checked; `try-catch` solo si puedes recuperar, traducir o agregar contexto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t1-throw && cd /tmp/java-m3-t1-throw
```

```java
public class DemoThrow {
    static void validar(int n) { if (n < 0) throw new IllegalArgumentException("negativo"); }
    public static void main(String[] args) {
        try { validar(-1); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
        finally { System.out.println("fin"); }
    }
}
```

**Caso de uso real.** Validar precondición al inicio de un servicio y garantizar cierre de un recurso en `finally` o, mejor, con try-with-resources.

**Error común.** Capturar y no relanzar perdiendo el contexto. Síntoma: fallo aguas arriba sin causa visible. Corrección: `throw new X("contexto", e)`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoThrow.java
java DemoThrow
```

```text
negativo
fin
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m3-t1 && cd /tmp/java-m3-t1
```

```java
import java.io.IOException;
import java.nio.file.*;

public class ParseoEdad {
    static int parsearEdad(String texto) {
        if (texto == null || texto.isBlank()) throw new IllegalArgumentException("La edad es obligatoria");
        int edad = Integer.parseInt(texto.trim());
        if (edad < 0 || edad > 120) throw new IllegalArgumentException("Edad fuera de rango: " + edad);
        return edad;
    }

    static String leerPrimeraLinea(Path ruta) throws IOException {
        return Files.readAllLines(ruta).get(0);
    }

    public static void main(String[] args) throws Exception {
        for (String entrada : new String[]{"25", "-3", "abc", ""}) {
            try {
                System.out.println("OK: " + parsearEdad(entrada));
            } catch (IllegalArgumentException e) {
                System.out.println("ERROR: " + e.getMessage());
            }
        }
        Path ruta = Path.of("edad.txt");
        Files.writeString(ruta, "30");
        System.out.println("Archivo: " + parsearEdad(leerPrimeraLinea(ruta)));
        Files.deleteIfExists(ruta);
    }
}
```

#### Recorrido del código

`parsearEdad` usa unchecked para datos inválidos: el llamador pasó una entrada que no cumple la precondición. `leerPrimeraLinea` declara `throws IOException` porque la falla proviene de I/O externo. El `main` maneja la validación por entrada y delega el caso I/O con `throws Exception` para el ejemplo.

#### Ejecución y salida real

```bash
javac ParseoEdad.java
java ParseoEdad
```

```text
OK: 25
ERROR: Edad fuera de rango: -3
ERROR: For input string: "abc"
ERROR: La edad es obligatoria
Archivo: 30
```

#### Errores frecuentes

Tratar todo como checked genera APIs ruidosas; tratar todo como unchecked sin validar genera fallos tardíos. Capturar y silenciar excepciones oculta la causa real.

#### Verificación

Cambiar `parsearEdad` para no validar y observar cómo falla más tarde; eliminar `throws IOException` para ver el error de compilación.

### Tema 2: try-with-resources · Básico · 40 min

Lees un archivo línea a línea. Si falla a mitad, el archivo debe cerrarse igual para no filtrar descriptores. Cerrar manualmente con `finally` es posible, pero verboso y propenso a errores.

#### `try-with-resources`

**Definición formal.** Es una forma de `try` que declara uno o más recursos y los cierra automáticamente al salir del bloque, normal o excepcionalmente.

**Para qué sirve.** Garantiza liberación determinista de recursos como archivos, streams, sockets o conexiones JDBC.

**Cuándo usarlo y cuándo no.** Úsalo siempre que el recurso implemente `AutoCloseable`. No confíes en el GC para liberar recursos externos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t2-twr && cd /tmp/java-m3-t2-twr
```

```java
import java.nio.file.*;
public class DemoTry {
    public static void main(String[] args) throws Exception {
        Path p = Path.of("a.txt"); Files.writeString(p, "hola");
        try (var r = Files.newBufferedReader(p)) { System.out.println(r.readLine()); }
        Files.deleteIfExists(p);
    }
}
```

**Caso de uso real.** Leer CSV o consultar BD con `Connection/PreparedStatement/ResultSet` en try-with-resources.

**Error común.** Abrir el recurso fuera del `try-with-resources`. Síntoma: leak si ocurre excepción antes del cierre. Corrección: declarar el recurso en el encabezado del `try`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoTry.java
java DemoTry
```

```text
hola
```

#### `AutoCloseable` y `Closeable`

**Definición formal.** `AutoCloseable` define `close()`. `Closeable` extiende `AutoCloseable` para I/O y declara `close()` lanzando `IOException`.

**Para qué sirve.** Proporciona el contrato que permite a try-with-resources cerrar el recurso.

**Cuándo usarlo y cuándo no.** Implementa `AutoCloseable` cuando tu clase posea un recurso que deba liberarse. No uses `close()` como sustituto de lógica de negocio; debe liberar recursos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t2-auto && cd /tmp/java-m3-t2-auto
```

```java
class Recurso implements AutoCloseable {
    private final String n;
    Recurso(String n) { this.n = n; System.out.println("abre " + n); }
    public void close() { System.out.println("cierra " + n); }
}
public class DemoAutoCloseable {
    public static void main(String[] args) {
        try (Recurso r = new Recurso("R1")) { System.out.println("uso"); }
    }
}
```

**Caso de uso real.** Wrappers de clientes, locks o archivos temporales que necesitan liberación explícita.

**Error común.** Implementar `close()` que puede fallar y no documentarlo. Síntoma: fallos ocultos al liberar. Corrección: definir claramente el contrato y excepciones.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoAutoCloseable.java
java DemoAutoCloseable
```

```text
abre R1
uso
cierra R1
```

#### Cierre en orden inverso y excepciones suprimidas

**Definición formal.** Los recursos se cierran en orden inverso al de declaración. Si el cuerpo lanza una excepción y `close()` lanza otra, la de cierre se agrega como suprimida (`getSuppressed()`).

**Para qué sirve.** Preserva la excepción principal sin perder evidencia del fallo al cerrar.

**Cuándo tenerlo en cuenta.** Cuando depures fallos de I/O o transacciones; inspecciona excepciones suprimidas si el cierre también falló.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t2-suppressed && cd /tmp/java-m3-t2-suppressed
```

```java
class R implements AutoCloseable {
    public void close() throws Exception { throw new Exception("close"); }
}
public class DemoSuppressed {
    public static void main(String[] args) {
        try (R r = new R()) { throw new Exception("body"); }
        catch (Exception e) {
            System.out.println(e.getMessage());
            System.out.println(e.getSuppressed().length);
        }
    }
}
```

**Caso de uso real.** Una transacción falla en el cuerpo y el rollback en `close()` también falla; la causa principal debe conservarse.

**Error común.** Loguear solo la excepción de cierre y perder la original. Síntoma: diagnóstico equivocado. Corrección: inspeccionar causa y suprimidas.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoSuppressed.java
java DemoSuppressed
```

```text
body
1
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m3-t2 && cd /tmp/java-m3-t2
```

```java
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

public class Lector {
    static List<String> leer(Path ruta) throws IOException {
        List<String> lineas = new ArrayList<>();
        try (var reader = Files.newBufferedReader(ruta)) {
            String linea;
            while ((linea = reader.readLine()) != null) lineas.add(linea);
        }
        return lineas;
    }
    public static void main(String[] args) throws Exception {
        Path ruta = Path.of("datos.txt");
        Files.write(ruta, List.of("A","B"));
        System.out.println(leer(ruta));
        Files.deleteIfExists(ruta);
    }
}
```

#### Recorrido del código

`BufferedReader` se declara en el try-with-resources. Java garantiza su cierre al salir del bloque, incluso si `readLine()` o el procesamiento lanzan excepción. El método declara `IOException` porque es una falla externa.

#### Ejecución y salida real

```bash
javac Lector.java
java Lector
```

```text
[A, B]
```

#### Errores frecuentes

Cerrar manualmente y olvidar el `finally` deja recursos abiertos. Capturar `IOException` y no actuar oculta errores de lectura. Usar el GC como estrategia de liberación es incorrecto para recursos externos.

#### Verificación

Eliminar el try-with-resources y verificar que el código sigue compilando pero pierde la garantía; preferir siempre la forma segura.


### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 35 min

“Saldo insuficiente” es una regla de negocio; no es lo mismo que `NullPointerException` o un fallo de disco. Necesitas un tipo de error claro y no debes ocultar la causa real.

#### Excepciones personalizadas

**Definición formal.** Una excepción personalizada es un tipo que extiende `Exception`, `RuntimeException` u otro tipo de excepción para representar un fallo específico del dominio o de la capa técnica.

**Para qué sirve.** Comunica semántica y puede transportar datos útiles (saldo, id, monto). Facilita manejo diferenciado.

**Cuándo usarla y cuándo no.** Úsala cuando el tipo de error tenga significado propio para el llamador o la frontera. No crees excepciones genéricas sin valor semántico.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t3-custom && cd /tmp/java-m3-t3-custom
```

```java
class SaldoInsuficienteException extends RuntimeException {
    SaldoInsuficienteException(double saldo, double monto) {
        super("saldo=" + saldo + ", monto=" + monto);
    }
}
public class DemoCustom {
    public static void main(String[] args) {
        try { throw new SaldoInsuficienteException(100, 150); }
        catch (SaldoInsuficienteException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** `UsuarioNoEncontradoException`, `CapacidadExcedidaException`, `ConflictoDeVersionException`.

**Error común.** Crear `MiException extends Exception` sin mensaje ni causa. Síntoma: no agrega información. Corrección: nombre claro, mensaje útil, datos y `cause` cuando envuelve.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoCustom.java
java DemoCustom
```

```text
saldo=100.0, monto=150.0
```

#### No tragar excepciones

**Definición formal.** “Tragar” una excepción es capturarla y no hacer nada útil: catch vacío, log sin contexto, o continuar como si la operación hubiera tenido éxito.

**Para qué sirve evitarlo.** Preserva trazabilidad, estado correcto y diagnóstico. Una excepción es una señal; ignorarla produce bugs silenciosos.

**Cuándo manejar y cuándo propagar.** Maneja si puedes recuperar o traducir con contexto. Propaga si no puedes decidir correctamente en ese nivel.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t3-notraga && cd /tmp/java-m3-t3-notraga
```

```java
public class DemoNoTragar {
    static int parsear(String s) {
        try { return Integer.parseInt(s); }
        catch (NumberFormatException e) {
            throw new IllegalArgumentException("edad inválida: " + s, e);
        }
    }
    public static void main(String[] args) {
        try { parsear("abc"); }
        catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
            System.out.println(e.getCause().getClass().getSimpleName());
        }
    }
}
```

**Caso de uso real.** Una capa de aplicación traduce una excepción técnica a una de dominio, conservando la causa.

**Error común.** `catch (Exception e) {}`. Síntoma: la operación falla y nadie sabe por qué. Corrección: registrar con contexto, traducir con `cause` o relanzar.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoNoTragar.java
java DemoNoTragar
```

```text
edad inválida: abc
NumberFormatException
```

#### Wrapping y causa (`cause`)

**Definición formal.** Wrapping es lanzar una nueva excepción que encapsula la excepción original como causa (`super(message, cause)` o `initCause`).

**Para qué sirve.** Traduce errores entre capas sin perder la evidencia original.

**Cuándo usarlo y cuándo no.** Úsalo en fronteras de capa (persistencia -> dominio, I/O -> servicio). No pierdas la causa; no envuelvas sin agregar valor.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t3-wrap && cd /tmp/java-m3-t3-wrap
```

```java
import java.io.*;
public class DemoWrapping {
    static void cargar() {
        try { throw new IOException("disco"); }
        catch (IOException e) { throw new UncheckedIOException("falló carga", e); }
    }
    public static void main(String[] args) {
        try { cargar(); }
        catch (UncheckedIOException e) { System.out.println(e.getCause().getMessage()); }
    }
}
```

**Caso de uso real.** Un repositorio convierte `SQLException`/`IOException` en una excepción de infraestructura con contexto.

**Error común.** `throw new RuntimeException("falló")` sin causa. Síntoma: se pierde el stack/causa raíz. Corrección: incluir `e` como causa.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoWrapping.java
java DemoWrapping
```

```text
disco
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m3-t3 && cd /tmp/java-m3-t3
```

```java
public class SaldoInsuficienteException extends RuntimeException {
    private final double saldo; private final double monto;
    public SaldoInsuficienteException(double saldo, double monto) {
        super("Saldo insuficiente: saldo=" + saldo + ", monto=" + monto);
        this.saldo = saldo; this.monto = monto;
    }
    public double getSaldo() { return saldo; }
}
```

```java
public class Cuenta {
    private double saldo;
    public Cuenta(double saldoInicial) { this.saldo = saldoInicial; }
    public void retirar(double monto) {
        if (monto <= 0) throw new IllegalArgumentException("Monto inválido");
        if (monto > saldo) throw new SaldoInsuficienteException(saldo, monto);
        saldo -= monto;
    }
}
```

```java
public class DemoExcepcion {
    public static void main(String[] args) {
        Cuenta cuenta = new Cuenta(100);
        try { cuenta.retirar(150); }
        catch (SaldoInsuficienteException e) { System.out.println("Error de negocio: " + e.getMessage()); }
    }
}
```

#### Recorrido del código

`SaldoInsuficienteException` da semántica de dominio y datos. `Cuenta` valida precondiciones y reglas. `DemoExcepcion` maneja el caso de negocio en la frontera, sin tragar la excepción.

#### Ejecución y salida real

```bash
javac SaldoInsuficienteException.java Cuenta.java DemoExcepcion.java
java DemoExcepcion
```

```text
Error de negocio: Saldo insuficiente: saldo=100.0, monto=150.0
```

#### Errores frecuentes

Catch vacío, pérdida de causa, o usar excepciones genéricas para todo. Cada una oculta información necesaria para diagnosticar.

#### Verificación

Probar catch vacío en un ejemplo controlado y observar el bug silencioso; luego reemplazar por traducción con causa.


### Tema 4: Incremento del proyecto: leer guías y respetar capacidad · Intermedio · 25 min

Importas guías desde CSV: debes validar formato, respetar capacidad y cerrar el archivo aunque falle. Aquí se combinan I/O, try-with-resources y excepciones de dominio/validación.

#### Lectura de guías con I/O seguro

**Definición formal.** Leer guías significa consumir datos externos desde un archivo o stream, parsearlos y convertirlos a objetos/valores del dominio.

**Para qué sirve.** Permite ingresar datos reales al sistema sin acoplar el dominio a la consola.

**Cuándo usarlo y cuándo no.** Úsalo con try-with-resources. No cargues archivos grandes completos en memoria si un stream basta; para este ejercicio, el tamaño es pequeño.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t4-io && cd /tmp/java-m3-t4-io
```

```java
import java.nio.file.*;
import java.util.*;
public class DemoIO {
    public static void main(String[] args) throws Exception {
        Path p = Path.of("g.csv");
        Files.write(p, List.of("G1,A", "G2,B"));
        try (var lines = Files.lines(p)) { lines.forEach(System.out::println); }
        Files.deleteIfExists(p);
    }
}
```

**Caso de uso real.** Importación de CSV en un backoffice o proceso batch.

**Error común.** No cerrar el stream/reader. Síntoma: fugas de descriptores. Corrección: try-with-resources.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoIO.java
java DemoIO
```

```text
G1,A
G2,B
```

#### Respetar capacidad

**Definición formal.** La capacidad es un invariante de dominio que limita cuántos elementos pueden aceptarse.

**Para qué sirve.** Protege reglas de negocio y recursos. Evita sobrecupo.

**Cuándo aplicarlo.** Antes de insertar/aceptar el elemento. Si se excede, fallar de forma explícita.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t4-cap && cd /tmp/java-m3-t4-cap
```

```java
import java.util.*;
public class DemoCapacidad {
    public static void main(String[] args) {
        int capacidad = 1;
        List<String> guias = new ArrayList<>();
        for (String g : List.of("G1","G2")) {
            if (guias.size() >= capacidad) { System.out.println("Capacidad excedida: " + capacidad); break; }
            guias.add(g);
        }
        System.out.println(guias);
    }
}
```

**Caso de uso real.** Límite de cupos, lote máximo, tamaño de batch.

**Error común.** Aceptar sobrecupo y “avisar después”. Síntoma: estado inválido. Corrección: validar antes de mutar.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoCapacidad.java
java DemoCapacidad
```

```text
Capacidad excedida: 1
[G1]
```

#### Separar errores técnicos y de dominio

**Definición formal.** Errores técnicos provienen de infraestructura (I/O, red); errores de dominio/validación provienen de reglas o datos inválidos. Se modelan con tipos y mensajes distintos.

**Para qué sirve.** Permite manejar cada caso en la capa correcta: reintentar I/O, rechazar entrada inválida, informar regla de negocio.

**Cuándo usarlo.** Siempre en fronteras de importación. No mezcles `IOException` con validación de formato en un solo mensaje ambiguo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m3-t4-separar && cd /tmp/java-m3-t4-separar
```

```java
public class DemoSeparar {
    static void validar(String linea) {
        if (!linea.contains(",")) throw new IllegalArgumentException("Línea inválida: " + linea);
    }
    public static void main(String[] args) {
        try { validar("G1"); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

**Caso de uso real.** API que responde 400 por input inválido y 503 por dependencia externa caída.

**Error común.** Devolver lista parcial silenciosa. Síntoma: datos incompletos sin error. Corrección: fallar explícitamente o reportar rechazos con criterio claro.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoSeparar.java
java DemoSeparar
```

```text
Línea inválida: G1
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m3-t4 && cd /tmp/java-m3-t4
```

```java
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class ImportadorGuias {
    public static List<String> importar(Path ruta, int capacidad) throws IOException {
        if (capacidad <= 0) throw new IllegalArgumentException("Capacidad inválida");
        List<String> guias = new ArrayList<>();
        try (Stream<String> lineas = Files.lines(ruta)) {
            for (String linea : (Iterable<String>) lineas::iterator) {
                if (linea.isBlank() || !linea.contains(",")) throw new IllegalArgumentException("Línea inválida: " + linea);
                if (guias.size() >= capacidad) throw new IllegalStateException("Capacidad excedida: " + capacidad);
                guias.add(linea.trim());
            }
        }
        return guias;
    }

    public static void main(String[] args) throws IOException {
        Path ruta = Path.of("guias.csv");
        Files.write(ruta, List.of("G-1,Madrid", "G-2,Bogotá"));
        System.out.println(importar(ruta, 5));
        try { importar(ruta, 1); }
        catch (IllegalStateException e) { System.out.println(e.getMessage()); }
        Files.deleteIfExists(ruta);
    }
}
```

#### Recorrido del código

`Files.lines` se abre en try-with-resources. Se valida formato antes de aceptar la línea. Se valida capacidad antes de insertar. `IOException` se declara porque es fallo técnico de I/O; `IllegalArgumentException` e `IllegalStateException` modelan validación y regla de dominio.

#### Ejecución y salida real

```bash
javac ImportadorGuias.java
java ImportadorGuias
```

```text
[G-1,Madrid, G-2,Bogotá]
Capacidad excedida: 1
```

#### Errores frecuentes

Tragar excepciones y devolver parcial; no cerrar recursos; mezclar errores técnicos con mensajes ambiguos. Todas se evitan con try-with-resources, validación temprana y excepciones claras.

#### Verificación

Cambiar la capacidad a 1 y confirmar `IllegalStateException`. Crear una línea inválida y confirmar `IllegalArgumentException`.

## Cierre del módulo

Puedes distinguir fallos técnicos de fallos de dominio, cerrar recursos de forma segura y comunicar errores con contexto. En el siguiente módulo usarás estas bases junto con Streams y Optional.
