# Módulo 3: Excepciones y manejo de recursos

Los errores son parte normal de un programa: un archivo no existe, una entrada es inválida, una conexión falla, un estado no permite una operación. Ignorarlos o manejarlos mal produce bugs silenciosos y recursos abiertos. Este módulo enseña a distinguir tipos de excepciones, crear excepciones propias, usar `try-with-resources` y diseñar un manejo de errores que se pueda depurar.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Diferenciar checked y unchecked y elegir cuándo usar cada una |
| 2 | Liberar recursos correctamente con `try-with-resources` |
| 3 | Crear excepciones personalizadas sin ocultar la causa real |
| 4 | Aplicar manejo de errores al importador de guías |

## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions · Básico · 35 min

**Caso guía**

Lees edad desde texto: `"abc"` es un dato inválido (bug/precondición) y un archivo ausente es un fallo externo recuperable. Tratarlos igual crea mal manejo de errores.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Checked exceptions** | Subclases de `Exception` no derivadas de `RuntimeException`; el compilador exige manejar o declarar (`throws`). | Forzar decisión ante fallos externos recuperables (I/O, red, SQL). | Cuando el llamador puede recuperarse razonablemente. | Usarlas para todo, complicando APIs. |
| **Unchecked exceptions** | `RuntimeException` y subclases; no requieren `throws`. | Señalar bugs, precondiciones violadas, estados inválidos. | Validaciones, argumentos inválidos, errores de programación. | Capturarlas masivamente y ocultar bugs. |
| **Jerarquía `Throwable`** | `Throwable` → `Error` / `Exception` → `RuntimeException`... | Clasificar fallos y decidir manejo. | Diseñar catch/throws. | Capturar `Throwable`/`Exception` sin criterio. |
| **`throw`/`throws`/`try-catch-finally`** | `throw` lanza; `throws` declara; `try-catch-finally` maneja/limpia. | Control de flujo de error y limpieza. | Propagar o manejar con contexto. | `catch` vacío; perder causa. |

**Contrato / invariantes / reglas.** Checked: manejar o declarar. Unchecked: opcional declarar, pero documentar si es relevante. `Error` no se maneja normalmente. `finally` se ejecuta al salir del try/catch salvo terminación anómala de JVM. Captura solo si puedes recuperar, traducir o agregar contexto.

**Modelo mental.** Checked = riesgo externo que el compilador te obliga a mirar; unchecked = bug/precondición rota; `Error` = fallo grave del entorno.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

`ParseoEdad.java`:

```java
import java.io.IOException;
import java.nio.file.*;

public class ParseoEdad {
    static int parsearEdad(String texto) { // unchecked para datos inválidos
        if (texto == null || texto.isBlank()) throw new IllegalArgumentException("La edad es obligatoria");
        int edad = Integer.parseInt(texto.trim()); // NumberFormatException (unchecked)
        if (edad < 0 || edad > 120) throw new IllegalArgumentException("Edad fuera de rango: " + edad);
        return edad;
    }

    static String leerPrimeraLinea(Path ruta) throws IOException { // checked: fallo externo I/O
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
        System.out.println("Archivo: " + parsearEdad(leerPrimeraLinea(ruta))); // checked + unchecked
        Files.deleteIfExists(ruta);
    }
}
```

**Ejecución y salida real**

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

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `catch (Exception e) {}` | Silenciaste fallo | Registrar, traducir o relanzar |
| `unreported exception IOException` | Checked no manejada/declarada | `try-catch` o `throws` |
| Usas checked para validación de argumentos | API ruidosa | Usa `IllegalArgumentException` (unchecked) |

**Verificación rápida:** elimina el `throws IOException` y observa el error de compilación; añade `"121"` y confirma rechazo.


### Tema 2: try-with-resources · Básico · 40 min

**Caso guía**

Lees un archivo línea a línea. Si falla a mitad, el archivo debe cerrarse igual para no filtrar descriptores.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Regla | Error común |
|---|---|---|---|---|
| **`try-with-resources`** | Forma de `try` que declara recursos `AutoCloseable` y garantiza cierre al salir. | Liberar recursos determinísticamente. | Usar para archivos, streams, conexiones, JDBC. | Olvidar cerrar y fugar recursos. |
| **`AutoCloseable`/`Closeable`** | Interfaces con `close()`. `Closeable` (I/O) restringe a `IOException`. | Contrato de liberación. | Recurso debe ser final o efectivamente final. | Cerrar manualmente mal en `finally`. |
| **Cierre inverso + suppressed** | Se cierran en orden inverso. Si cuerpo y `close()` lanzan, la de cierre se suprime en la primaria. | No perder excepción principal. | Inspeccionar `getSuppressed()` si hace falta. | Ignorar excepción de cierre. |
| **Limpieza determinista** | Liberación en punto conocido, no depende de GC. | Evitar leaks de FDs/conexiones. | No confiar en finalize/GC. | “El GC lo cierra”. |

**Modelo mental.** Biblioteca con devolución automática al salir por la puerta, aunque tropieces.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

`LeerArchivo.java`:

```java
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Stream;

public class LeerArchivo {
    public static void main(String[] args) throws IOException {
        Path ruta = Path.of("guias.txt");
        Files.write(ruta, List.of("G-1,Madrid", "G-2,Bogotá", "G-3,Lima"));
        try (Stream<String> lineas = Files.lines(ruta)) { // AutoCloseable
            lineas.filter(l -> l.contains("Bogotá")).forEach(System.out::println);
        } // cierre garantizado aquí
        System.out.println("Existe: " + Files.exists(ruta));
        Files.deleteIfExists(ruta);
    }
}
```

**Ejecución y salida real**

```bash
javac LeerArchivo.java
java LeerArchivo
```

```text
G-2,Bogotá
Existe: true
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Fuga de file descriptors | No cerraste stream | `try-with-resources` |
| Excepción de close oculta la real | Manejo manual incorrecto | Usa try-with-resources; revisa suppressed |
| `IOException` no manejada | Checked | `catch` o `throws` con contexto |

**Verificación rápida:** cambia a ruta inexistente y maneja la `IOException` con mensaje claro.


### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 35 min

**Caso guía**

“Saldo insuficiente” es una regla de negocio; no es lo mismo que `NullPointerException` o un fallo de disco. Necesitas un tipo de error claro y no debes ocultar excepciones.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Regla | Error común |
|---|---|---|---|---|
| **Excepciones personalizadas** | Tipo que extiende `Exception`/`RuntimeException` para representar error de dominio/técnico específico. | Comunicar semántica y datos del fallo. | Nombre claro, mensaje útil, campos relevantes, `cause` si envuelve. | Crear excepciones genéricas sin valor. |
| **No tragar excepciones** | Antipatrón: `catch` vacío o log sin acción ante fallo irrecuperable. | Preservar trazabilidad y estado correcto. | Recuperar, traducir, registrar con contexto, o relanzar. | `catch(Exception e){}`. |
| **Wrapping/cause** | Lanzar nueva excepción con causa original (`super(msg,cause)`). | Traducir capa manteniendo evidencia. | No perder la causa. | `throw new X("falló")` sin causa. |
| **Checked vs unchecked de dominio** | Checked si llamador puede recuperarse; unchecked si es bug/precondición o regla que se maneja en frontera. | Diseñar API usable. | Ser consistente y documentar. | Checked para todo. |

**Modelo mental.** Excepción personalizada = etiqueta precisa en la caja de fallos; la causa es la evidencia dentro de la caja.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

`SaldoInsuficienteException.java`:

```java
public class SaldoInsuficienteException extends RuntimeException {
    private final double saldo; private final double monto;
    public SaldoInsuficienteException(double saldo, double monto) {
        super("Saldo insuficiente: saldo=" + saldo + ", monto=" + monto);
        this.saldo = saldo; this.monto = monto;
    }
    public double getSaldo() { return saldo; } public double getMonto() { return monto; }
}
```

`Cuenta.java`:

```java
public class Cuenta {
    private double saldo;
    public Cuenta(double saldoInicial) { this.saldo = saldoInicial; }
    public void retirar(double monto) {
        if (monto <= 0) throw new IllegalArgumentException("Monto inválido");
        if (monto > saldo) throw new SaldoInsuficienteException(saldo, monto);
        saldo -= monto;
    }
    public double getSaldo() { return saldo; }
}
```

`DemoExcepcion.java`:

```java
public class DemoExcepcion {
    public static void main(String[] args) {
        Cuenta cuenta = new Cuenta(100);
        try {
            cuenta.retirar(150);
        } catch (SaldoInsuficienteException e) {
            System.out.println("Error de negocio: " + e.getMessage());
            System.out.println("Saldo actual: " + e.getSaldo());
        }
    }
}
```

**Ejecución y salida real**

```bash
javac SaldoInsuficienteException.java Cuenta.java DemoExcepcion.java
java DemoExcepcion
```

```text
Error de negocio: Saldo insuficiente: saldo=100.0, monto=150.0
Saldo actual: 100.0
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Bug invisible | Catch vacío | Registrar/relanzar/manejar |
| Pierdes causa raíz | No usaste `cause` | `super(msg, cause)` |
| Excepción genérica | Sin semántica de dominio | Excepción personalizada cuando aporta claridad |

**Verificación rápida:** prueba catch vacío y observa cómo el fallo desaparece; eso es lo que no debe pasar.


### Tema 4: Incremento del proyecto: leer guías y respetar capacidad · Intermedio · 25 min

**Caso guía**

Importas guías desde CSV: debes validar formato, respetar capacidad y cerrar el archivo aunque falle.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Regla | Error común |
|---|---|---|---|---|
| **Leer guías (I/O)** | Cargar datos externos desde archivo con `Files.lines`/`BufferedReader`. | Ingestar datos reales. | Try-with-resources. | Fuga de recurso. |
| **Respetar capacidad** | Invariante de dominio: no aceptar más elementos que el límite. | Proteger reglas de negocio. | Validar antes de insertar. | Aceptar sobrecupo. |
| **Separar errores técnicos/dominio** | I/O checked (`IOException`) vs validación/estado (`IllegalArgumentException/IllegalStateException`). | Manejo diferenciado por capa. | No tragar ni mezclar semántica. | Devolver lista parcial silenciosa. |

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

`ImportadorGuias.java`:

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
        try { importar(ruta, 1); } catch (IllegalStateException e) { System.out.println(e.getMessage()); }
        Files.deleteIfExists(ruta);
    }
}
```

**Ejecución y salida real**

```bash
javac ImportadorGuias.java
java ImportadorGuias
```

```text
[G-1,Madrid, G-2,Bogotá]
Capacidad excedida: 1
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Lista parcial | Catch vacío / no fallar | Falla explícita |
| Recurso abierto | Sin try-with-resources | Usar try-with-resources |
| Error ambiguo | Mensaje pobre | Incluir dato/línea/capacidad |

**Verificación rápida:** capacidad 1 con 2 líneas debe lanzar `IllegalStateException`.


## Cierre del módulo

Ahora puedes distinguir fallos técnicos de fallos de dominio, cerrar recursos de forma segura y comunicar errores con contexto. En el siguiente módulo usarás estas bases junto con Streams y Optional para escribir código más declarativo sin perder claridad ante datos ausentes o transformaciones complejas.
