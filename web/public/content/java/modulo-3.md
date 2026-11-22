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

Vas a leer la edad de una persona desde texto. Pueden ocurrir dos problemas distintos: el texto no es un número (error de datos/uso) o un archivo que debías leer no está disponible (error externo recuperable). Tratar ambos igual suele generar mal manejo de errores.

**Fundamento técnico y modelo mental**

**Definición formal.** En Java, una *excepción* es un objeto que representa una condición anómala durante la ejecución. La jerarquía principal es `Throwable` → `Error` y `Exception`; dentro de `Exception`, las subclases de `RuntimeException` son *unchecked* y el resto son *checked*.

**Contrato / invariantes / reglas.** Las checked exceptions deben ser manejadas (`catch`) o declaradas (`throws`) en tiempo de compilación. Las unchecked no requieren declaración obligatoria. `Error` representa condiciones graves del runtime que normalmente no deben manejarse. Capturar una excepción solo tiene sentido si se puede recuperar, agregar contexto o traducir la falla; silenciarla rompe la trazabilidad. `finally` se ejecuta al salir del bloque try/catch salvo terminación anómala de la JVM.

**Modelo mental.** Checked: el compilador te obliga a reconocer un riesgo externo previsible. Unchecked: suele indicar bug o precondición violada. Error: el piso se está moviendo, no es un flujo normal.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

Crea `ParseoEdad.java`:

```java
public class ParseoEdad {
    public static int parsearEdad(String texto) {
        if (texto == null || texto.isBlank()) {
            throw new IllegalArgumentException("La edad es obligatoria");
        }
        int edad = Integer.parseInt(texto.trim());
        if (edad < 0 || edad > 120) {
            throw new IllegalArgumentException("Edad fuera de rango: " + edad);
        }
        return edad;
    }

    public static void main(String[] args) {
        String[] entradas = {"25", "-3", "abc", ""};
        for (String entrada : entradas) {
            try {
                System.out.println("OK: " + parsearEdad(entrada));
            } catch (IllegalArgumentException e) {
                System.out.println("ERROR: " + entrada + " -> " + e.getMessage());
            }
        }
    }
}
```

**Desglose del código**

- `NumberFormatException` es unchecked y subclase de `IllegalArgumentException` en la jerarquía? No: `NumberFormatException` extiende `IllegalArgumentException`, por eso el catch de `IllegalArgumentException` la cubre.
- Validar precondiciones temprano evita propagar estado inválido.
- El mensaje incluye el dato problemático; eso facilita depurar sin ocultar la excepción.
- No se usa `catch (Exception e) {}` porque silenciaría fallos.

**Ejecución y salida real**

```bash
javac ParseoEdad.java
java ParseoEdad
```

```text
OK: 25
ERROR: -3 -> Edad fuera de rango: -3
ERROR: abc -> For input string: "abc"
ERROR:  -> La edad es obligatoria
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `catch (Exception e) {}` | Tragaste la excepción | Registra, propaga o maneja con criterio |
| El programa sigue con estado corrupto | Capturaste sin recuperar correctamente | Falla rápido o devuelve un error explícito |
| Usas checked para todo | API difícil de usar | Usa checked cuando el llamador puede recuperarse razonablemente |

**Verificación rápida**

```bash
javac ParseoEdad.java && java ParseoEdad
```

Agrega una entrada `"120"` y otra `"121"` para confirmar los límites.

### Tema 2: try-with-resources · Básico · 40 min

**Caso guía**

Tu programa lee un archivo de texto. Si ocurre un error a mitad de lectura, el archivo debe cerrarse igual. Hacerlo manualmente con `finally` es posible, pero verboso y fácil de romper.

**Fundamento técnico y modelo mental**

**Definición formal.** `try-with-resources` es una forma de `try` que declara uno o más recursos que implementan `AutoCloseable` (o `Closeable`) y garantiza su cierre al salir del bloque.

**Contrato / invariantes / reglas.** El cierre ocurre en orden inverso al de declaración, tanto en finalización normal como por excepción. Si el cuerpo lanza excepción y `close()` también, la excepción de cierre se suprime y se adjunta como *suppressed exception*. El recurso debe ser efectivamente final o final. Esto implementa manejo determinista de liberación de recursos, no recolección por GC.

**Modelo mental.** Es pedir un libro en la biblioteca con devolución automática al salir por la puerta, aunque tropieces en el pasillo.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

Crea `LeerArchivo.java`:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class LeerArchivo {
    public static void main(String[] args) throws IOException {
        Path ruta = Path.of("guias.txt");
        Files.write(ruta, List.of("G-1,Madrid", "G-2,Bogotá", "G-3,Lima"));

        try (var lineas = Files.lines(ruta)) {
            lineas.filter(l -> l.contains("Bogotá"))
                  .forEach(System.out::println);
        }

        System.out.println("Existe: " + Files.exists(ruta));
        Files.deleteIfExists(ruta);
    }
}
```

**Desglose del código**

- `Files.lines(...)` devuelve un `Stream<String>` que debe cerrarse porque mantiene abierto el archivo.
- `try (var lineas = Files.lines(ruta))` garantiza el cierre.
- `IOException` es checked; en este ejemplo simple se propaga con `throws`.
- `Files.deleteIfExists` limpia el archivo de prueba.

**Ejecución y salida real**

```bash
javac LeerArchivo.java
java LeerArchivo
```

```text
G-2,Bogotá
Existe: true
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Fuga de descriptores de archivo | Abriste stream/recurso y no lo cerraste | Usa `try-with-resources` |
| `IOException` no manejada | Olvidaste `catch` o `throws` | Maneja donde puedas recuperarte o propaga con contexto |
| Cerrar manualmente en `finally` con código frágil | Lógica de cierre compleja | Prefiere `AutoCloseable` y try-with-resources |

**Verificación rápida**

```bash
javac LeerArchivo.java && java LeerArchivo
```

Cambia la ruta a un archivo inexistente y observa la excepción. Luego decide si en tu caso conviene capturarla y mostrar un mensaje claro.

### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 35 min

**Caso guía**

En un proceso de retiro bancario, “saldo insuficiente” no es lo mismo que un `NullPointerException` o un error de disco. Necesitas un error de dominio claro para que la capa superior pueda reaccionar correctamente.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *excepción personalizada* es un tipo definido por el dominio que extiende `Exception`/`RuntimeException` para representar una condición de error específica. *Envolver* (wrapping) una excepción consiste en lanzar una nueva excepción preservando la causa original (`cause`).

**Contrato / invariantes / reglas.** Una excepción de dominio debe tener nombre significativo, mensaje útil y, cuando corresponda, la causa original (`super(message, cause)`). No se deben capturar excepciones sin acción (`catch` vacío). Si se captura, se debe recuperar, registrar con contexto, traducir o relanzar. Mantener la causa preserva la traza de diagnóstico.

**Modelo mental.** Una excepción personalizada es una etiqueta precisa en la caja de fallos: no dice solo “algo salió mal”, dice “qué salió mal” y conserva la evidencia.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

Crea `SaldoInsuficienteException.java`:

```java
public class SaldoInsuficienteException extends RuntimeException {
    private final double saldo;
    private final double monto;

    public SaldoInsuficienteException(double saldo, double monto) {
        super("Saldo insuficiente: saldo=" + saldo + ", monto=" + monto);
        this.saldo = saldo;
        this.monto = monto;
    }

    public double getSaldo() { return saldo; }
    public double getMonto() { return monto; }
}
```

Crea `Cuenta.java`:

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

Crea `DemoExcepcion.java`:

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

**Desglose del código**

- `SaldoInsuficienteException` extiende `RuntimeException`: representa una regla de dominio.
- La excepción guarda contexto (`saldo`, `monto`) útil para diagnóstico o respuesta.
- El `catch` no oculta el problema; lo traduce a una reacción clara.
- `IllegalArgumentException` se usa para entrada inválida; son errores distintos.

**Ejecución y salida real**

```bash
javac SaldoInsuficienteException.java Cuenta.java DemoExcepcion.java
java DemoExcepcion
```

```text
Error de negocio: Saldo insuficiente: saldo=100.0, monto=150.0
Saldo actual: 100.0
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `catch` vacío | Quisiste “silenciar” el error | Registra, maneja o relanza con contexto |
| Excepción genérica para todo | Perdió sentido el dominio | Crea excepciones de dominio cuando aporten claridad |
| Pierdes la causa original | Creas una nueva excepción sin `cause` | Usa `super(mensaje, cause)` al envolver |

**Verificación rápida**

```bash
javac SaldoInsuficienteException.java Cuenta.java DemoExcepcion.java
java DemoExcepcion
```

Agrega un `catch (Exception e) {}` temporalmente y compara: el fallo se vuelve invisible. Esa es la razón de no tragar excepciones.

### Tema 4: Incremento del proyecto: leer guías y respetar capacidad · Intermedio · 25 min

**Caso guía**

El importador de guías lee un archivo y debe rechazar guías con datos inválidos o cuando la capacidad se excede. Aquí se combinan I/O, validación y excepciones de dominio.

**Fundamento técnico y modelo mental**

**Definición formal.** La validación de entrada es la verificación de precondiciones sobre datos externos antes de incorporarlos al estado del sistema. La separación entre errores técnicos (I/O) y de dominio (reglas de negocio) permite decisiones de manejo distintas.

**Contrato / invariantes / reglas.** `IOException` representa fallos de I/O checked. `IllegalArgumentException`/`IllegalStateException` representan violaciones de precondición/estado en este ejemplo. El recurso de lectura debe cerrarse con try-with-resources. La operación debe fallar de forma explícita ante datos inválidos; no debe devolver resultados parciales silenciosos.

**Modelo mental.** El importador es un control de aduana: verifica formato, capacidad y deja registro claro si algo no entra.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-3 && cd ~/academia-java/modulo-3
```

Crea `ImportadorGuias.java`:
```java
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

public class ImportadorGuias {
    public static List<String> importar(Path ruta, int capacidad) throws IOException {
        if (capacidad <= 0) throw new IllegalArgumentException("Capacidad inválida");
        List<String> guias = new ArrayList<>();
        try (var lineas = Files.lines(ruta)) {
            for (String linea : (Iterable<String>) lineas::iterator) {
                if (linea.isBlank() || !linea.contains(",")) {
                    throw new IllegalArgumentException("Línea inválida: " + linea);
                }
                if (guias.size() >= capacidad) {
                    throw new IllegalStateException("Capacidad excedida: " + capacidad);
                }
                guias.add(linea.trim());
            }
        }
        return guias;
    }

    public static void main(String[] args) throws IOException {
        Path ruta = Path.of("guias.csv");
        Files.write(ruta, List.of("G-1,Madrid", "G-2,Bogotá"));
        System.out.println(importar(ruta, 5));
        Files.deleteIfExists(ruta);
    }
}
```

**Desglose del código**

- `Files.lines` se cierra con `try-with-resources`.
- `IllegalArgumentException` señala datos/capacidad inválidos.
- `IllegalStateException` señala que no se puede aceptar más guías.
- `IOException` se propaga porque el llamador debe decidir cómo reaccionar ante falla de I/O.

**Ejecución y salida real**

```text
[G-1,Madrid, G-2,Bogotá]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Archivo queda abierto | No usaste try-with-resources | Envuelve el stream/recurso |
| Error genérico sin contexto | Mensaje pobre | Incluye línea/dato/capacidad en la excepción |
| Se traga la excepción y devuelve lista parcial | `catch` vacío | Falla o reporta el error explícitamente |

**Verificación rápida**

```bash
javac ImportadorGuias.java && java ImportadorGuias
```

Prueba con capacidad `1` y verifica que se lanza `IllegalStateException`.

## Cierre del módulo

Ahora puedes distinguir fallos técnicos de fallos de dominio, cerrar recursos de forma segura y comunicar errores con contexto. En el siguiente módulo usarás estas bases junto con Streams y Optional para escribir código más declarativo sin perder claridad ante datos ausentes o transformaciones complejas.
