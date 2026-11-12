# Módulo 3: Excepciones y manejo de recursos


## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions · Básico · 40 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Módulos 0–2 de Java (clases, colecciones); JDK 27 o posterior. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** ubicar una excepción en la jerarquía `Throwable`; decidir checked (`throws`) frente a unchecked; usar `try`/`catch`/`finally`, multicatch y el orden correcto de `catch`; y explicar por qué un `Error` no se captura.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** al cargar configuración puede faltar un archivo por una condición externa; leer una posición inválida de una lista suele indicar un error de lógica. La capa que decide si reintentar, informar o propagar debe distinguir ambos casos.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** El compilador obliga a manejar las checked exceptions porque representan condiciones externas previsibles que el desarrollador debe considerar explícitamente; las unchecked no se obligan porque típicamente indican bugs de programación, no condiciones externas esperables en cada punto del código.

Las checked exceptions obligan al compilador a verificar que el código las declare o las maneje; las unchecked no imponen esa obligación porque típicamente señalan errores de programación.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| jerarquía `Throwable`/`Error`/`Exception`/`RuntimeException` | Prerrequisito | dónde encaja cada excepción determina si es checked |
| checked y `throws` | Núcleo | el compilador obliga a declarar o manejar |
| unchecked (`RuntimeException`) | Núcleo | no se declaran; señalan bugs |
| `try`/`catch`/`finally` | Núcleo | `finally` corre haya o no excepción |
| orden de `catch` (específico antes que general) | Diagnóstico | invertirlo no compila (`already been caught`) |
| multicatch (`A | B`) | Variante | un bloque para tipos sin relación de herencia |
| `Error` y qué no capturar | Límite | `OutOfMemoryError` no es una condición recuperable normal |

Cada fila tiene su explicación individual a continuación.

**Jerarquía `Throwable`/`Error`/`Exception`/`RuntimeException` (prerrequisito).** Todo lo lanzable hereda de `Throwable`. Debajo hay dos ramas: `Error` (fallos graves de la JVM, como `OutOfMemoryError`) y `Exception`. Dentro de `Exception`, `RuntimeException` y sus subclases son **unchecked**; el resto de `Exception` son **checked**. Saber dónde encaja una excepción es lo que determina si el compilador te obliga a manejarla.

**Checked y `throws` (núcleo).** Una excepción checked (como `IOException`) obliga: el método que puede lanzarla la declara con `throws`, y quien lo invoca debe capturarla o volver a declararla. El código no compila si se omite. Representan condiciones externas previsibles (archivo ausente, red caída).

**Unchecked (`RuntimeException`) (núcleo).** Las subclases de `RuntimeException` (`NullPointerException`, `IndexOutOfBoundsException`) no se declaran ni se obliga a capturarlas, porque suelen indicar **bugs** del programa, no condiciones externas esperables en cada punto.

**`try`/`catch`/`finally` (núcleo).** `try` delimita el código que puede fallar, `catch` maneja un tipo de excepción, y `finally` se ejecuta **siempre** (haya excepción o no, incluso si hay `return`), ideal para liberar recursos. En el Tema 2 verás que try-with-resources lo hace mejor para recursos.

**Orden de `catch` (diagnóstico).** Si usas varios `catch`, el **más específico va primero**. Poner `catch (Exception)` antes de `catch (IOException)` no compila: `exception IOException has already been caught`, porque el general ya habría capturado todo y el específico sería inalcanzable.

**Multicatch (variante).** `catch (NumberFormatException | NullPointerException e)` maneja en un solo bloque dos tipos **sin relación de herencia** entre sí, cuando la reacción es la misma. No puedes combinar un tipo con su propia subclase (sería redundante).

**`Error` y qué no capturar (límite).** Los `Error` (como `OutOfMemoryError`, `StackOverflowError`) señalan fallos del entorno de ejecución de los que normalmente **no** puedes recuperarte. No los captures "por si acaso": déjalos propagar. Capturar `Throwable` para "atraparlo todo" oculta estos fallos y suele empeorar el diagnóstico.

Las excepciones checked (como `IOException`) son verificadas por el compilador: cualquier método que pueda lanzar una excepción checked debe declararlo explícitamente en su firma con `throws` (`void leerArchivo() throws IOException { ... }`), y cualquier código que invoque ese método está obligado, también verificado en tiempo de compilación, a manejar esa excepción con un `try`/`catch` o a propagarla declarándola también con `throws` en su propia firma, sin excepción posible — el código simplemente no compila si se omite ese manejo obligatorio.

Las excepciones unchecked (subclases de `RuntimeException`, como `IndexOutOfBoundsException` o `NullPointerException`) no requieren esa declaración obligatoria ni ese manejo verificado por el compilador, reflejando una distinción de diseño deliberada: las excepciones checked típicamente representan condiciones externas previsibles y recuperables (un archivo que podría no existir, una conexión de red que podría fallar), donde forzar al desarrollador a considerar explícitamente ese caso mediante el compilador tiene sentido; las excepciones unchecked típicamente representan errores de programación (acceder a un índice fuera de rango, invocar un método sobre una referencia nula) que en la mayoría de los casos indican un bug en el código, no una condición externa esperable que deba manejarse explícitamente en cada punto de la aplicación.

**Analogía:** una excepción checked es como un formulario de aduana obligatorio que debes completar explícitamente antes de continuar tu viaje, verificado activamente antes de que puedas proceder; una excepción unchecked es como una alarma de incendio que puede activarse en cualquier momento sin que nadie la haya anticipado explícitamente en cada paso del edificio, indicando generalmente que algo salió estructuralmente mal, no una condición externa rutinaria esperada.

**Conceptos clave:** obligación de manejo verificada en compilación, indicación de bug.

**Código del ejemplo:**

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

final class TiposDeExcepcion {
    static String leerArchivo(Path ruta) throws IOException {
        return Files.readString(ruta);
    }

    static String elemento(List<String> elementos, int indice) {
        return elementos.get(indice);
    }
}
```

Distinguir qué falla es una condición externa recuperable (checked) de qué es un bug (unchecked) es la misma decisión que tomarás en cada capa del proyecto integrador de este track al diseñar su manejo de errores.

**Cuándo no usarlo:** declarar `throws` para una excepción checked en cada capa intermedia que solo la propaga sin manejarla realmente ensucia la firma de métodos que no aportan ningún manejo real; en esos casos, envolver la excepción checked en una unchecked propia (Tema 3) en la capa que sí puede decidir algo suele ser más limpio.

**Implicación práctica:** Forzar al compilador a verificar una excepción checked solo tiene sentido para condiciones externas genuinamente recuperables; aplicar esa misma obligación a algo que en realidad es un bug de programación solo ensucia la firma de los métodos sin ganar nada.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-checked-unchecked
cd ejemplo-checked-unchecked
mkdir -p src/main/java/academia/excepciones
```

**Crea** `src/main/java/academia/excepciones/LectorConfig.java` con un método `leer(String ruta) throws IOException` y un `main` que además provoque una `IndexOutOfBoundsException` accediendo a una lista vacía:

```java
package academia.excepciones;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public final class LectorConfig {
    static String leer(String ruta) throws IOException {
        return Files.readString(Path.of(ruta));
    }
}

final class Main {
    public static void main(String[] args) {
        String ruta = args.length > 0 ? args[0] : "config.properties";
        try {
            System.out.println(LectorConfig.leer(ruta));
        } catch (IOException e) {
            System.out.println("No se pudo leer " + ruta + ": " + e.getMessage());
        }

        List<String> vacia = new ArrayList<>();
        System.out.println(vacia.get(0));
    }
}
```

**Ejecuta el ejemplo** (compila y ejecuta con un archivo que no existe):

```bash
javac -d out src/main/java/academia/excepciones/LectorConfig.java
java -cp out academia.excepciones.Main config.properties
```

**Resultado esperado:** el `catch` informa que no se pudo leer `config.properties` y, después, la JVM muestra el rastro de `IndexOutOfBoundsException` porque esa segunda falla no está capturada.

**Fallo deliberado:** quita `throws IOException` de la firma de `leer` y recompila. El compilador rechaza el código porque `Files.readString` lanza una excepción checked que ya no está declarada; restaura `throws` y confirma que el acceso a `vacia.get(0)` sigue sin exigir ninguna declaración.

**Pista:** el error de compilación aparece dentro de `leer`, no en la llamada del `main`. **Resultado esperado:** confirmas que el mismo `try/catch` no es exigido para la `IndexOutOfBoundsException`.

**Si falla.** Si el programa no imprime el mensaje del `catch`, el archivo existe y la lectura funcionó: cambia el argumento por una ruta inexistente. Si la `IndexOutOfBoundsException` no aparece, la lista tiene elementos en la posición 0. Si al quitar `throws` el compilador no se queja, estás compilando otra versión del archivo.

**Paso 5 · Práctica guiada**

Cambia la lista vacía por una lista con `"RF-1"` y accede a los índices 0 y 1 en ejecuciones separadas. Antes de ejecutar, predice cuál índice funciona y cuál lanza `IndexOutOfBoundsException`; explica por qué el compilador no te obliga a capturar esta última.

**Pista:** el índice válido único es 0. Si el acceso inválido se captura como `IOException`, el tipo de la excepción no coincide con la condición producida.

Ahora cierra los subtemas de orden de catch, multicatch, finally y jerarquía. Crea `src/main/java/academia/excepciones/Demo.java`:

```java
package academia.excepciones;
import java.io.*;
import java.nio.file.*;

public final class Demo {
    public static void main(String[] args) {
        try {
            Files.readString(Path.of("no-existe.txt"));
        } catch (NoSuchFileException e) {      // específico primero
            System.out.println("especifico: NoSuchFileException");
        } catch (IOException e) {              // general después
            System.out.println("general: IOException");
        } finally {
            System.out.println("finally siempre corre");
        }
        try {
            Integer.parseInt("x");
        } catch (NumberFormatException | NullPointerException e) {  // multicatch
            System.out.println("multicatch: " + e.getClass().getSimpleName());
        }
        RuntimeException re = new IllegalStateException("x");
        System.out.println("es Exception? " + (re instanceof Exception));
    }
}
```

```bash
javac -d out src/main/java/academia/excepciones/Demo.java
java -cp out academia.excepciones.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
especifico: NoSuchFileException
finally siempre corre
multicatch: NumberFormatException
es Exception? true
```

El `catch` específico ganó al general; `finally` corrió; el multicatch atrapó `NumberFormatException`; y `RuntimeException` es una `Exception` (de ahí que el compilador no la obligue, pero se pueda capturar). **Fallo deliberado:** invierte el orden de los `catch` (pon `catch (IOException)` antes de `catch (NoSuchFileException)`, que es su subclase). No compila: `exception NoSuchFileException has already been caught`, porque el general lo captura todo y el específico queda inalcanzable.

#### Aplica

**Paso 6 · Práctica independiente**

Clasifica en una tabla tres excepciones más de la biblioteca estándar (`FileNotFoundException`, `NullPointerException`, `NumberFormatException`) como checked o unchecked, ubica cada una en la jerarquía `Throwable`, y explica en una frase por qué esa clasificación tiene sentido.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `LectorConfig.java` compila con `throws IOException`; quitarlo no compila.
- [ ] Ejecutar con una ruta inexistente muestra el mensaje del `catch`.
- [ ] La lista vacía produce `IndexOutOfBoundsException` sin declaración previa.
- [ ] El `catch` específico gana al general y `finally` siempre corre.
- [ ] El multicatch atrapa `NumberFormatException` con un solo bloque.
- [ ] Invertir el orden de `catch` no compila (`already been caught`).
- [ ] Ubicas `FileNotFoundException`/`NullPointerException`/`NumberFormatException` en la jerarquía.

**Si falla.** Si `FileNotFoundException` te genera dudas, es subclase de `IOException`, luego checked. Si el orden invertido compila, no hay relación de subtipo entre los `catch`. Si `finally` no corre, está fuera del `try`.

Guarda el código, la salida del `Demo`, el `throws` obligatorio, la excepción unchecked no declarada y el error del orden de `catch`.

**Antes del siguiente tema:** explica qué recurso debe liberarse aun cuando una excepción interrumpe el flujo, por qué el `catch` específico va primero, y por qué un `Error` no se captura.

**Errores comunes:** declarar `throws Exception` genérico; capturar `Throwable`/`Error` ocultando fallos graves; poner el `catch` general antes del específico; y tratar una `NullPointerException` como condición externa recuperable.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: Exceptions](https://dev.java/learn/exceptions/), [`Throwable` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Throwable.html) y [The Java Tutorials: Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/).

### Tema 2: try-with-resources · Básico · 40 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Tema 1 de este módulo (`try`/`catch`); JDK 27 o posterior. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** implementar `AutoCloseable`; garantizar el cierre ante excepción; cerrar varios recursos en orden inverso; e identificar una suppressed exception cuando el cuerpo y el `close()` fallan.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** un proceso lee un reporte de entregas y falla al validar una fila. El descriptor del archivo debe cerrarse tanto en la ruta normal como en la de error, sin duplicar limpieza en cada rama.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** try-with-resources garantiza el cierre correcto de un recurso incluso ante una excepción, eliminando la necesidad de un bloque `finally` manual repetitivo y propenso a errores de omisión.

Declarar el recurso dentro del paréntesis del `try` garantiza `close()` automático al salir del bloque, sea por finalización normal o por excepción.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `AutoCloseable` y `close()` | Núcleo | una clase propia se cierra sola en el `try` |
| cierre garantizado ante excepción | Núcleo | `close()` corre aunque el cuerpo lance |
| múltiples recursos y orden inverso | Variante | se cierran en orden contrario al de apertura |
| suppressed exceptions | Diagnóstico | si el cuerpo y el `close()` fallan, el segundo queda "suprimido" |
| try-with-resources frente a `finally` manual | Decisión | menos código y sin olvidos |

Cada fila tiene su explicación individual a continuación.

**`AutoCloseable` y `close()` (núcleo).** Cualquier clase que implemente `AutoCloseable` (un único método `close()`) puede ir en el paréntesis del `try (...)`. Java llama a `close()` por ti al salir del bloque. No se limita a archivos: una conexión, un lock o un handle propio se benefician igual.

**Cierre garantizado ante excepción (núcleo).** La garantía clave: `close()` se invoca **salgas como salgas** del bloque, incluso si el cuerpo lanza. Por eso el mensaje de cierre aparece **antes** de que el `catch` externo maneje el error.

**Múltiples recursos y orden inverso (variante).** Puedes declarar varios recursos separados por `;` en el mismo `try`. Se cierran en **orden inverso** al de apertura (el último abierto se cierra primero), igual que desapilar: importa cuando un recurso depende de otro.

**Suppressed exceptions (diagnóstico).** Si el cuerpo lanza una excepción **y** además `close()` lanza otra, Java conserva la del cuerpo como principal y adjunta la del cierre como **suprimida**, accesible con `getSuppressed()`. Así no pierdes la causa original. Un `finally` manual, en cambio, tiende a que la excepción del cierre **tape** la del cuerpo.

**Try-with-resources frente a `finally` manual (decisión).** El patrón antiguo (`finally` con comprobación de `null` y `close()` dentro de otro `try`) es verboso y fácil de escribir mal, y puede ocultar la excepción original. Usa try-with-resources siempre que el recurso sea `AutoCloseable`; reserva `finally` para limpieza que no sea de un recurso cerrable.

`try (BufferedReader reader = Files.newBufferedReader(ruta)) { String linea = reader.readLine(); }` declara un recurso dentro del propio paréntesis del `try`, garantizando que Java invoque automáticamente `reader.close()` al finalizar el bloque, sin necesidad de un bloque `finally` manual explícito para ese propósito, y crucialmente incluso si ocurre una excepción dentro del bloque `try`: el cierre del recurso está garantizado sin importar cómo se abandone el bloque (normalmente, o mediante una excepción propagada).

Cualquier clase que implemente la interfaz `AutoCloseable` (que declara un único método `close()`) puede usarse dentro de un try-with-resources, no solo las clases estándar de manejo de archivos: escribir una clase propia que gestione algún recurso externo (una conexión, un handle del sistema operativo) e implementar `AutoCloseable` en ella permite que también se beneficie de esta garantía automática de cierre, sin tener que escribir manualmente el patrón repetitivo de un bloque `finally` que verifica si el recurso no es nulo antes de cerrarlo, un patrón considerablemente más verboso y propenso a errores que el equivalente moderno con try-with-resources.

**Analogía:** try-with-resources es como un sistema de préstamo de bicicletas que garantiza automáticamente que la bicicleta se devuelva a su estación correspondiente al finalizar el recorrido, incluso si el ciclista tuvo un percance en el camino, sin depender de que el ciclista recuerde manualmente devolverla por su cuenta en cada situación posible.

**Conceptos clave:** `AutoCloseable`, cierre garantizado incluso ante error.

**Código del ejemplo:**

```java
try (BufferedReader reader = Files.newBufferedReader(ruta)) {
    String linea = reader.readLine();
} // reader.close() se llama automáticamente, incluso si hay una excepción
```

Cualquier recurso propio del proyecto integrador de este track (una conexión, un archivo temporal) que necesite liberarse siempre debe implementar `AutoCloseable` y abrirse dentro de un try-with-resources, nunca con un `finally` manual.

**Cuándo no usarlo:** try-with-resources requiere que el recurso implemente `AutoCloseable`; para un objeto que no gestiona ningún recurso externo (memoria, archivos, conexiones) y que el recolector de basura puede liberar normalmente, no hay nada que cerrar y esta técnica no aplica.

**Implicación práctica:** Un recurso que no se cierra ante una excepción (un archivo, una conexión) se queda abierto indefinidamente, y un `finally` manual escrito a mano es fácil de olvidar o de escribir mal, mientras que try-with-resources garantiza el cierre sin ese riesgo.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-try-with-resources
cd ejemplo-try-with-resources
mkdir -p src/main/java/academia/recursos
```

**Crea** `src/main/java/academia/recursos/ReporteEntregas.java` con una clase propia que implemente `AutoCloseable`, registre cuándo se abre y cuándo se cierra, y lance una excepción a mitad del bloque:

```java
package academia.recursos;

public final class ReporteEntregas implements AutoCloseable {
    private final String nombre;

    ReporteEntregas(String nombre) {
        this.nombre = nombre;
        System.out.println("Abierto: " + nombre);
    }

    void procesar(boolean falla) {
        System.out.println("Procesando: " + nombre);
        if (falla) {
            throw new IllegalStateException("Fallo a mitad del procesamiento");
        }
    }

    @Override
    public void close() {
        System.out.println("Cerrado: " + nombre);
    }

    public static void main(String[] args) {
        try (ReporteEntregas reporte = new ReporteEntregas("entregas.csv")) {
            reporte.procesar(true);
        } catch (IllegalStateException e) {
            System.out.println("Capturado: " + e.getMessage());
        }
    }
}
```

**Ejecuta el ejemplo** (el bloque `try` termina con una excepción):

```bash
javac -d out src/main/java/academia/recursos/ReporteEntregas.java
java -cp out academia.recursos.ReporteEntregas
```

**Resultado esperado:** `Abierto: entregas.csv`, `Procesando: entregas.csv`, `Cerrado: entregas.csv` y recién después `Capturado: Fallo a mitad del procesamiento`: el cierre ocurre antes de que el `catch` maneje el error.

**Paso 5 · Práctica guiada**

**Fallo deliberado:** cambia `reporte.procesar(true)` por `reporte.procesar(false)` y vuelve a ejecutar. El cierre ocurre igual, con o sin excepción; confirma en la salida que el mensaje de cierre aparece en ambos casos. Restaura el `true` al terminar.

**Pista:** si el mensaje `Cerrado` no aparece antes del `catch`, el recurso no se está declarando dentro del paréntesis del `try`. **Resultado esperado:** `close()` se invoca siempre, sea cual sea el camino de salida del bloque.

Ahora cierra los subtemas de orden inverso y suppressed. Crea `src/main/java/academia/recursos/Demo.java`:

```java
package academia.recursos;

public final class Demo {
    static final class Recurso implements AutoCloseable {
        final String n; Recurso(String n) { this.n = n; System.out.println("abre " + n); }
        @Override public void close() { System.out.println("cierra " + n); }
    }
    public static void main(String[] args) {
        try (Recurso a = new Recurso("A"); Recurso b = new Recurso("B")) {   // orden inverso al cerrar
            System.out.println("cuerpo");
        }
        System.out.println("---");
        try (AutoCloseable r = () -> { throw new RuntimeException("fallo al cerrar"); }) {
            throw new RuntimeException("fallo en el cuerpo");
        } catch (Exception e) {
            System.out.println("principal: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) System.out.println("suppressed: " + s.getMessage());
        }
    }
}
```

```bash
javac -d out src/main/java/academia/recursos/Demo.java
java -cp out academia.recursos.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
abre A
abre B
cuerpo
cierra B
cierra A
---
principal: fallo en el cuerpo
suppressed: fallo al cerrar
```

`B` se cierra antes que `A` (orden inverso al de apertura); y cuando el cuerpo **y** el `close()` fallan, la excepción del cuerpo es la principal y la del cierre queda **suprimida** (`getSuppressed()`), sin perderse. Un `finally` manual habría dejado que la del cierre tapara la original.

**Si falla.** Si la clase no compila, `close()` debe ser `public`. Si el orden de cierre parece el de apertura, revisa que ambos recursos estén en el mismo `try (...)`. Si no ves la suppressed, confirma que tanto el cuerpo como el `close()` lanzan.

#### Aplica

**Paso 6 · Práctica independiente**

Convierte el patrón antiguo en moderno: escribe primero un método que abra un recurso y lo cierre en un `finally` manual (con comprobación de `null`), y reescríbelo con try-with-resources. Compara ambos en líneas de código y explica qué olvido evita la versión moderna.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `ReporteEntregas.java` compila e implementa `AutoCloseable`.
- [ ] El cierre ocurre antes del `catch`, tanto con `procesar(true)` como con `procesar(false)`.
- [ ] Dos recursos se cierran en orden inverso al de apertura (`cierra B`, luego `cierra A`).
- [ ] Cuando el cuerpo y el `close()` fallan, la del cierre queda como suppressed.
- [ ] `getSuppressed()` recupera la excepción del cierre sin perder la principal.
- [ ] Explicas por qué `finally` manual es más propenso a errores.

**Si falla.** Si el segundo recurso no se cierra, ambos deben estar en el mismo `try (...)` separados por `;`. Si el orden de cierre parece el de apertura, revisa la declaración. Si no ves la suppressed, el cuerpo o el `close()` no está lanzando.

Guarda la clase `AutoCloseable`, la salida con y sin excepción, el orden de cierre inverso y la suppressed exception.

**Antes del siguiente tema:** explica cuándo se invoca `close()`, en qué orden se cierran varios recursos, y qué es una suppressed exception.

**Errores comunes:** cerrar en un `finally` que se salta antes de abrirse el recurso; olvidar el orden inverso de cierre; dejar que la excepción del `close()` tape la del cuerpo; y usar try-with-resources con algo que no implementa `AutoCloseable`.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: Exceptions](https://dev.java/learn/exceptions/), [`AutoCloseable` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/AutoCloseable.html) y [The Java Tutorials: try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html).

### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Temas 1–2 de este módulo; JDK 27 o posterior. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** definir una excepción de dominio; decidir checked frente a unchecked; encadenar la causa y envolver checked en unchecked sin perder el origen; y diagnosticar por qué un catch vacío o un relanzamiento sin causa hacen invisible un bug.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** un retiro supera el saldo disponible. La aplicación debe informar la regla de dominio incumplida y conservar contexto para el diagnóstico; un `catch` vacío hace parecer que la operación terminó correctamente.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Las excepciones personalizadas comunican con precisión qué condición de error específica ocurrió; un catch vacío oculta errores reales haciendo el bug correspondiente invisible y mucho más difícil de diagnosticar posteriormente.

Una excepción personalizada (`SaldoInsuficienteException`) comunica con precisión qué condición ocurrió; un catch vacío oculta el error, dejando el bug invisible hasta que sus consecuencias aparezcan mucho después y sin relación aparente con la causa.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| excepción de dominio propia | Núcleo | `SaldoInsuficienteException` expresa la regla violada |
| checked frente a unchecked para dominio | Decisión | extender `RuntimeException` o `Exception` según el caso |
| encadenamiento de causa (`cause`) | Núcleo | el constructor `(mensaje, Throwable)` conserva el origen |
| wrapping checked → unchecked | Variante | envolver `IOException` sin ensuciar cada firma |
| no tragar: el catch vacío | Diagnóstico | un `catch {}` hace invisible el fallo |
| preservar el rastro al relanzar | Diagnóstico | relanzar sin causa pierde el stack original |

Cada fila tiene su explicación individual a continuación.

**Excepción de dominio propia (núcleo).** Una clase como `SaldoInsuficienteException` nombra **qué regla de negocio** se incumplió, en vez de un `RuntimeException` genérico. Permite que quien la captura reaccione distinto según el tipo, sin inspeccionar el texto del mensaje.

**Checked frente a unchecked para dominio (decisión).** Extiende `RuntimeException` (unchecked) cuando la condición es un error que el llamador normalmente **no** puede recuperar en el acto (regla de negocio violada), que es lo más común en dominios modernos. Extiende `Exception` (checked) solo si quieres **obligar** al llamador a tratar el caso. La tendencia actual favorece unchecked de dominio para no contaminar firmas.

**Encadenamiento de causa (núcleo).** Al crear una excepción, pásale la original como **causa** con el constructor `(String mensaje, Throwable causa)`. Así `getCause()` recupera el origen y el stack trace muestra "caused by:". Conservar la causa es lo que hace diagnosticable un fallo que cruzó varias capas.

**Wrapping checked → unchecked (variante).** Cuando una capa baja lanza una checked (`IOException`) pero las capas intermedias no pueden hacer nada útil, **envuélvela** en una unchecked de dominio (`throw new ConfigException(msg, e)`) **conservando la causa**. Evita propagar `throws IOException` por toda la pila sin aportar manejo real.

**No tragar: el catch vacío (diagnóstico).** `catch (Exception e) {}` es el antipatrón de "tragar" la excepción: el fallo desaparece sin rastro y el bug aparece después, lejos de su causa. Como mínimo registra (`log.error(...)`) y decide explícitamente: relanzar, manejar, o ignorar con una razón comentada.

**Preservar el rastro al relanzar (diagnóstico).** Si capturas y relanzas una excepción nueva **sin** pasar la causa (`throw new RuntimeException("falló")`), `getCause()` queda `null` y pierdes el stack original. Siempre encadena la causa al relanzar; es la diferencia entre un error rastreable y uno ciego.

Definir una excepción personalizada específica del dominio de la aplicación (`class SaldoInsuficienteException extends RuntimeException { SaldoInsuficienteException(String mensaje) { super(mensaje); } }`) permite comunicar de forma mucho más precisa y expresiva qué condición de error específica ocurrió, en comparación con lanzar una excepción genérica de propósito general (como `RuntimeException` directamente, o `IllegalStateException`), facilitando además que el código que captura esa excepción específica pueda reaccionar de forma diferenciada según el tipo exacto de excepción capturado, en vez de tener que inspeccionar el mensaje de texto de una excepción genérica para determinar qué condición específica ocurrió realmente.

Un catch vacío (`try { operacionRiesgosa(); } catch (Exception e) { }`) es un antipatrón grave conocido como "tragar" la excepción: el error ocurrido desaparece silenciosamente sin ningún registro ni indicación de que algo falló, haciendo que el bug correspondiente se vuelva invisible y extremadamente difícil de diagnosticar más adelante, cuando sus consecuencias downstream eventualmente se manifiesten de forma confusa y aparentemente no relacionada con su causa raíz real; la práctica correcta como mínimo registra el error (`log.error("Falló la operación", e)`) antes de decidir explícitamente si relanzarlo, manejarlo apropiadamente, o (en casos verdaderamente justificados y documentados) ignorarlo deliberadamente con una razón explícita comentada.

**Analogía:** un catch vacío es como desactivar silenciosamente la alarma de incendio de un edificio sin investigar qué la activó, dejando que el problema real subyacente (que sí existe y sigue sin resolverse) permanezca completamente invisible hasta que eventualmente cause un daño mucho mayor y más difícil de rastrear hasta su causa original.

**Conceptos clave:** modelar errores de dominio, antipatrón del catch vacío.

**Código del ejemplo:**

```java
class SaldoInsuficienteException extends RuntimeException {
    SaldoInsuficienteException(String mensaje) { super(mensaje); }
}
if (saldo < monto) throw new SaldoInsuficienteException("Saldo: " + saldo);

// MAL: oculta el error, hace el bug invisible
try { operacionRiesgosa(); } catch (Exception e) { }
// BIEN: al menos registra el error antes de decidir qué hacer
try { operacionRiesgosa(); } catch (Exception e) {
    log.error("Falló la operación", e);
    throw e; // o maneja explícitamente
}
```

Cada regla de negocio violable del proyecto integrador de este track (saldo insuficiente, cuenta bloqueada, entrega duplicada) debería tener su propia excepción de dominio, nunca un `RuntimeException` genérico ni un catch vacío que la oculte.

**Cuándo no usarlo:** crear una excepción de dominio propia para un error que solo ocurre en un único lugar y nunca necesita reacción diferenciada es ceremonia innecesaria; una `IllegalArgumentException` genérica con un mensaje claro puede bastar en ese caso.

**Implicación práctica:** Una excepción de dominio específica permite reaccionar distinto según qué regla de negocio se violó, mientras que un catch vacío convierte cualquier error real en un bug invisible que solo se descubre mucho después, por sus consecuencias, no por su causa.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-excepcion-dominio
cd ejemplo-excepcion-dominio
mkdir -p src/main/java/academia/billetera
```

**Crea** `src/main/java/academia/billetera/Billetera.java` con `SaldoInsuficienteException`, un método `retirar(double monto)` que la lance y un `main` que primero capture con un catch vacío y luego registre el error:

```java
package academia.billetera;

class SaldoInsuficienteException extends RuntimeException {
    SaldoInsuficienteException(String mensaje) { super(mensaje); }
}

public final class Billetera {
    private double saldo;

    Billetera(double saldoInicial) { this.saldo = saldoInicial; }

    void retirar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto debe ser positivo");
        }
        if (saldo < monto) {
            throw new SaldoInsuficienteException("Saldo: " + saldo + ", monto: " + monto);
        }
        saldo -= monto;
    }
}

final class Main {
    public static void main(String[] args) {
        Billetera billetera = new Billetera(100);

        try {
            billetera.retirar(150);
        } catch (SaldoInsuficienteException e) {
            // catch vacío: el fallo no deja rastro
        }

        try {
            billetera.retirar(150);
        } catch (SaldoInsuficienteException e) {
            System.err.println("Falló el retiro: " + e.getMessage());
        }
    }
}
```

**Ejecuta el ejemplo** (compara el catch vacío con el catch que registra):

```bash
javac -d out src/main/java/academia/billetera/Billetera.java
java -cp out academia.billetera.Main
```

**Resultado esperado:** el primer retiro fallido no deja ningún rastro; el segundo imprime `Falló el retiro: Saldo: 100.0, monto: 150.0` en la salida de error. La diferencia entre ambos intentos es exactamente el problema del catch vacío.

**Paso 5 · Práctica guiada**

Ahora cierra el subtema de **encadenamiento de causa** y wrapping checked→unchecked. Crea `src/main/java/academia/billetera/Demo.java`:

```java
package academia.billetera;
import java.io.*;
import java.nio.file.*;

public final class Demo {
    static final class ConfigException extends RuntimeException {
        ConfigException(String m, Throwable causa) { super(m, causa); }   // conserva la causa
    }
    static void cargar(String ruta) {
        try {
            Files.readString(Path.of(ruta));
        } catch (IOException e) {
            throw new ConfigException("No se pudo cargar " + ruta, e);     // wrap checked→unchecked
        }
    }
    public static void main(String[] args) {
        try {
            cargar("no-existe.properties");
        } catch (ConfigException e) {
            System.out.println("mensaje: " + e.getMessage());
            System.out.println("causa: " + e.getCause().getClass().getSimpleName());
        }
    }
}
```

```bash
javac -d out src/main/java/academia/billetera/Demo.java
java -cp out academia.billetera.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
mensaje: No se pudo cargar no-existe.properties
causa: NoSuchFileException
```

La `IOException` original quedó envuelta en `ConfigException` **conservando la causa** (`getCause()`), así el stack trace muestra "caused by:". **Fallo deliberado:** relanza sin pasar la causa (`throw new ConfigException("...", null)` o `throw new RuntimeException("falló")`) y comprueba que `getCause()` es `null`: perdiste el origen del fallo. Vuelve a encadenar la causa.

**Si falla.** Si `getCause()` es `null`, no pasaste la causa al constructor. Si la `ConfigException` no compila, su constructor debe declarar `(String, Throwable)` y llamar `super(m, causa)`. Si no se lanza nada, la ruta existe.

**Paso 5 · Práctica guiada**

**Fallo deliberado:** comenta el segundo bloque `try`/`catch` (el que registra) y vuelve a ejecutar. El programa termina sin imprimir nada aunque ambos retiros fallaron; restaura el bloque y confirma que ahora el fallo es visible y diagnosticable.

**Pista:** la salida de error puede verse mezclada con la salida estándar según la terminal; ejecuta con `2>&1` si quieres comparar ambas en el mismo flujo. **Resultado esperado:** el mismo error, pero ahora diagnosticable.

**Si falla.** Si el compilador no acepta `catch (SaldoInsuficienteException e)`, revisa que la clase esté en el mismo paquete y que `retirar` la lance realmente. Si el primer retiro imprime un mensaje, el catch vacío no está vacío. Si el segundo no imprime nada, el registro está en el bloque equivocado.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega una segunda excepción de dominio (`CuentaBloqueadaException`) y un bloque que capture ambas por separado, reaccionando distinto a cada una en vez de tratarlas como un `Exception` genérico.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Billetera.java` compila y la excepción de dominio extiende `RuntimeException`.
- [ ] El retiro con catch vacío no deja rastro; con registro imprime saldo y monto.
- [ ] `ConfigException` envuelve una `IOException` conservando la causa (`getCause()`).
- [ ] Relanzar sin pasar la causa deja `getCause()` en `null` y pierde el origen.
- [ ] `CuentaBloqueadaException` se captura por separado de `SaldoInsuficienteException`.
- [ ] Explicas por qué un catch vacío y un relanzamiento sin causa dificultan el diagnóstico.

**Si falla.** Si `getCause()` es `null`, no encadenaste la causa. Si ambas excepciones caen en el mismo `catch`, revisa el orden (específico antes que general). Si `CuentaBloqueadaException` no se lanza, falta su condición.

Guarda ambas excepciones, la salida silenciosa del catch vacío, la salida registrada y la cadena de causa conservada.

**Antes del siguiente tema:** explica qué información añade una excepción de dominio, por qué debes encadenar la causa al envolver, y qué decisión explícita toma cada `catch`.

**Errores comunes:** usar un catch vacío "para que no se rompa"; relanzar sin pasar la causa; capturar `Exception` genérico cuando necesitas reaccionar distinto; y devolver el stack trace completo al cliente en vez de un mensaje de dominio con registro técnico interno.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: Exceptions](https://dev.java/learn/exceptions/), [`Throwable(String, Throwable)` — causa (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Throwable.html#%3Cinit%3E(java.lang.String,java.lang.Throwable)) y [The Java Tutorials: Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un lector de archivos con manejo robusto de excepciones y try-with-resources.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Provocar una excepción checked y una unchecked | Ver Tema 1 | Compara cómo el compilador trata cada una |
| 2 | Leer un archivo con try-with-resources | Ver Tema 2 | Verifica el cierre automático incluso ante error |
| 3 | Crear `SaldoInsuficienteException` | Ver Tema 3 | Extiende `RuntimeException` |
| 4 | Escribir un catch vacío y explicar el problema | Ver Tema 3 | Antipatrón de tragar excepciones |
| 5 | Corregir el catch vacío registrando el error | Ver Tema 3 | Decide explícitamente relanzar o manejar |

**Verificación:** el laboratorio se considera exitoso si el lector de archivos cierra correctamente el recurso incluso cuando el archivo no existe, y si ninguna excepción se descarta silenciosamente sin al menos un registro explícito del error.

**Errores comunes y soluciones**

- **Olvidar declarar `throws` para una excepción checked.** El compilador exige declararla o manejarla con try/catch.
- **Cerrar recursos manualmente en un `finally` en vez de usar try-with-resources.** Prefiere try-with-resources para código más simple y con la misma garantía.
- **Capturar `Exception` genérico y descartarlo silenciosamente.** Registra siempre el error como mínimo, y decide explícitamente cómo proceder.

---
