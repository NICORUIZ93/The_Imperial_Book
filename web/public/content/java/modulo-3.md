# Módulo 3: Excepciones y manejo de recursos

Los errores son parte normal de un programa: un archivo no existe, una entrada es inválida, una conexión falla, un estado no permite una operación. Ignorarlos o manejarlos mal produce bugs silenciosos y recursos abiertos. Este módulo enseña a distinguir tipos de excepciones, crear excepciones propias, usar `try-with-resources` y diseñar un manejo de errores que se pueda depurar.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Diferenciar checked y unchecked y elegir cuándo usar cada una |
| 2 | Liberar recursos correctamente con `try-with-resources` |
| 3 | Crear excepciones personalizadas sin ocultar la causa real |

## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions · Básico · 35 min

**Caso guía**

Vas a leer la edad de una persona desde texto. Pueden ocurrir dos problemas distintos: el texto no es un número (error de datos/uso) o un archivo que debías leer no está disponible (error externo recuperable). Tratar ambos igual suele generar mal manejo de errores.

**Concepto clave / modelo mental**

| Tipo | Hereda de | El compilador exige manejarla | Uso típico |
|---|---|---|---|
| Checked | `Exception` (no `RuntimeException`) | Sí: `try/catch` o `throws` | I/O, red, acceso a recursos externos |
| Unchecked | `RuntimeException` | No | Errores de programación, argumentos inválidos, estado inválido |
| Error | `Error` | No | Fallos graves de JVM/sistema; normalmente no se manejan |

No captures excepciones solo para “que no falle”. Captura cuando puedes recuperarte, agregar contexto útil o convertir la falla en una respuesta clara.

**Implementación desde cero**

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

- `NumberFormatException` es unchecked; ocurre cuando `Integer.parseInt` no puede convertir el texto.
- `IllegalArgumentException` también es unchecked; la usamos para señalar datos inválidos.
- El `catch` múltiple evita duplicar manejo cuando la respuesta es la misma.
- El mensaje incluye el dato problemático; eso facilita depurar sin ocultar la excepción.

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

**Concepto clave / modelo mental**

`try-with-resources` cierra automáticamente cualquier recurso que implemente `AutoCloseable` o `Closeable`. Se cierra al salir del bloque `try`, tanto si hubo éxito como si hubo excepción.

```java
try (BufferedReader br = Files.newBufferedReader(path)) {
    // usar recurso
} catch (IOException e) {
    // manejar error
}
// aquí br ya está cerrado
```

Ventajas:

- menos código de limpieza;
- evita fugas por olvidar `close()`;
- maneja correctamente excepciones suprimidas cuando falla el cierre.

**Implementación desde cero**

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
- `var` reduce ruido, pero el tipo real importa: aquí es un stream autocerrable.
- `IOException` es checked; en este ejemplo simple la propagamos con `throws` para mantener el foco en el recurso.

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

**Concepto clave / modelo mental**

Crea una excepción personalizada cuando:

- representa un concepto del dominio;
- el llamador necesita distinguirla;
- quieres agregar contexto útil.

Evita crear excepciones por cada detalle trivial. Y nunca “tragues” excepciones con un `catch` vacío: pierdes la causa real.

```java
try {
    ...
} catch (Exception e) {
    // MAL: silencio
}
```

Si no puedes recuperarte, propaga. Si puedes recuperarte, maneja y deja trazabilidad.

**Implementación desde cero**

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

    public Cuenta(double saldoInicial) {
        this.saldo = saldoInicial;
    }

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

- `SaldoInsuficienteException` extiende `RuntimeException`: es una regla de dominio que la capa llamadora puede decidir manejar.
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

## Cierre del módulo

Ahora puedes distinguir fallos técnicos de fallos de dominio, cerrar recursos de forma segura y comunicar errores con contexto. En el siguiente módulo usarás estas bases junto con Streams y Optional para escribir código más declarativo sin perder claridad ante datos ausentes o transformaciones complejas.

### Tema 4: Incremento del proyecto: leer guías y respetar capacidad · Intermedio · 25 min

**Caso guía**

El importador de guías lee un archivo y debe rechazar guías con datos inválidos o cuando la capacidad se excede. Aquí se combinan I/O, validación y excepciones de dominio.

**Concepto clave / modelo mental**

- Usa `try-with-resources` para leer el archivo.
- Valida formato y reglas de negocio; lanza excepciones con mensajes claros.
- Separa error técnico (I/O) de error de dominio (capacidad, datos inválidos).

**Implementación desde cero**

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
