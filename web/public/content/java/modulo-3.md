# Módulo 3: Excepciones y manejo de recursos


## Aprende construyendo

### Tema 1: Checked vs unchecked exceptions · Básico · 40 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** decidir cuándo declarar una excepción checked con `throws` y cuándo dejar que una unchecked se propague sin declaración.

#### Aprende

Leer un archivo de configuración puede fallar por una condición externa previsible (el archivo no existe); acceder a una posición fuera de rango de una lista es, en cambio, casi siempre un bug del propio código, no una condición externa a manejar en cada punto.

**¿Por qué es importante?** El compilador obliga a manejar las checked exceptions porque representan condiciones externas previsibles que el desarrollador debe considerar explícitamente; las unchecked no se obligan porque típicamente indican bugs de programación, no condiciones externas esperables en cada punto del código.

Las checked exceptions obligan al compilador a verificar que el código las declare o las maneje; las unchecked no imponen esa obligación porque típicamente señalan errores de programación.

Las excepciones checked (como `IOException`) son verificadas por el compilador: cualquier método que pueda lanzar una excepción checked debe declararlo explícitamente en su firma con `throws` (`void leerArchivo() throws IOException { ... }`), y cualquier código que invoque ese método está obligado, también verificado en tiempo de compilación, a manejar esa excepción con un `try`/`catch` o a propagarla declarándola también con `throws` en su propia firma, sin excepción posible — el código simplemente no compila si se omite ese manejo obligatorio.

Las excepciones unchecked (subclases de `RuntimeException`, como `IndexOutOfBoundsException` o `NullPointerException`) no requieren esa declaración obligatoria ni ese manejo verificado por el compilador, reflejando una distinción de diseño deliberada: las excepciones checked típicamente representan condiciones externas previsibles y recuperables (un archivo que podría no existir, una conexión de red que podría fallar), donde forzar al desarrollador a considerar explícitamente ese caso mediante el compilador tiene sentido; las excepciones unchecked típicamente representan errores de programación (acceder a un índice fuera de rango, invocar un método sobre una referencia nula) que en la mayoría de los casos indican un bug en el código, no una condición externa esperable que deba manejarse explícitamente en cada punto de la aplicación.

**Analogía:** una excepción checked es como un formulario de aduana obligatorio que debes completar explícitamente antes de continuar tu viaje, verificado activamente antes de que puedas proceder; una excepción unchecked es como una alarma de incendio que puede activarse en cualquier momento sin que nadie la haya anticipado explícitamente en cada paso del edificio, indicando generalmente que algo salió estructuralmente mal, no una condición externa rutinaria esperada.

**Conceptos clave:** obligación de manejo verificada en compilación, indicación de bug.

**Código del ejemplo:**

```java
// checked: el compilador OBLIGA a manejarla o declararla con throws
void leerArchivo() throws IOException { ... }

// unchecked (RuntimeException): no es obligatorio manejarla, suele indicar un bug
int x = lista.get(100); // IndexOutOfBoundsException si la lista tiene menos elementos
```

Distinguir qué falla es una condición externa recuperable (checked) de qué es un bug (unchecked) es la misma decisión que tomarás en cada capa del proyecto integrador de este track al diseñar su manejo de errores.

**Cuándo no usarlo:** declarar `throws` para una excepción checked en cada capa intermedia que solo la propaga sin manejarla realmente ensucia la firma de métodos que no aportan ningún manejo real; en esos casos, envolver la excepción checked en una unchecked propia (Tema 3) en la capa que sí puede decidir algo suele ser más limpio.

**Implicación práctica:** Forzar al compilador a verificar una excepción checked solo tiene sentido para condiciones externas genuinamente recuperables; aplicar esa misma obligación a algo que en realidad es un bug de programación solo ensucia la firma de los métodos sin ganar nada.

#### Practica

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

#### Aplica

Clasifica en una tabla tres excepciones más de la biblioteca estándar (`FileNotFoundException`, `NullPointerException`, `NumberFormatException`) como checked o unchecked, y explica en una frase por qué esa clasificación tiene sentido para cada una.

**Checklist de salida.**

- [ ] `LectorConfig.java` compila con `throws IOException` en `leer`.
- [ ] Ejecutar con una ruta inexistente muestra el mensaje del `catch`.
- [ ] La lista vacía produce `IndexOutOfBoundsException` sin declaración previa.
- [ ] Al quitar `throws IOException`, el compilador rechaza el código.
- [ ] La tabla clasifica correctamente las tres excepciones.
- [ ] Explicas la diferencia entre condición externa y bug de programación.

**Si falla.** Si `FileNotFoundException` te genera dudas, recuerda que es subclase de `IOException` y por tanto checked. Si `NumberFormatException` no compila al capturarla, es unchecked y el compilador no la exige, pero puede capturarse igual.

Guarda el código, la salida del `throws` obligatorio y la excepción unchecked no declarada.

**Errores comunes:** declarar `throws Exception` genérico en vez de la excepción checked específica, envolver cada excepción unchecked en un `try/catch` "por si acaso" sin que exista una recuperación real posible, y tratar una `NullPointerException` como si fuera una condición externa recuperable en vez de un bug a corregir.

**Fuente oficial:** [dev.java: Exceptions](https://dev.java/learn/exceptions/) y [The Java Tutorials: Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/).

### Tema 2: try-with-resources · Básico · 40 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** garantizar el cierre de un recurso propio implementando `AutoCloseable`, incluso cuando el bloque `try` termina con una excepción.

#### Aprende

Un lector de reportes de entregas abre un archivo grande; si el procesamiento falla a mitad de camino, el archivo debe cerrarse igual, sin depender de que el desarrollador recuerde escribir un `finally` correcto en cada punto donde se abre un recurso.

**¿Por qué es importante?** try-with-resources garantiza el cierre correcto de un recurso incluso ante una excepción, eliminando la necesidad de un bloque `finally` manual repetitivo y propenso a errores de omisión.

Declarar el recurso dentro del paréntesis del `try` garantiza `close()` automático al salir del bloque, sea por finalización normal o por excepción.

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

**Fallo deliberado:** cambia `reporte.procesar(true)` por `reporte.procesar(false)` y vuelve a ejecutar. El cierre ocurre igual, con o sin excepción; confirma en la salida que el mensaje de cierre aparece en ambos casos. Restaura el `true` al terminar.

**Pista:** si el mensaje `Cerrado` no aparece antes del `catch`, el recurso no se está declarando dentro del paréntesis del `try`. **Resultado esperado:** `close()` se invoca siempre, sea cual sea el camino de salida del bloque.

**Si falla.** Si la clase no compila, revisa que `close()` sea `public` y esté marcado con `@Override`. Si `process` no puede lanzar la excepción, confirma que `IllegalStateException` es unchecked y no requiere `throws`. Si el recurso nunca se cierra, está declarado fuera del `try (...)`.

#### Aplica

Declara dos recursos en el mismo try-with-resources y confirma, mirando el orden de los mensajes en consola, que Java los cierra en el orden inverso al que los abrió.

**Checklist de salida.**

- [ ] `ReporteEntregas.java` compila e implementa `AutoCloseable`.
- [ ] La salida muestra apertura, procesamiento y cierre ante la excepción.
- [ ] El `catch` aparece después del cierre del recurso.
- [ ] Con `procesar(false)`, el cierre también ocurre.
- [ ] Dos recursos se cierran en orden inverso al de apertura.
- [ ] Explicas por qué `finally` manual es más propenso a errores.

**Si falla.** Si el segundo recurso no se cierra, ambos deben declararse dentro del mismo `try (...)` separados por punto y coma. Si el orden de cierre parece el de apertura, estás usando try-with-resources anidados en el orden equivocado.

Guarda la clase `AutoCloseable`, la salida con y sin excepción, y el orden de cierre de dos recursos.

**Errores comunes:** cerrar un recurso manualmente en un `finally` que se salta si el `try` lanza una excepción antes de llegar ahí, olvidar que los recursos se cierran en orden inverso al que se abrieron, y envolver un recurso que no implementa `AutoCloseable` esperando que try-with-resources lo cierre igual.

**Fuente oficial:** [dev.java: Exceptions](https://dev.java/learn/exceptions/) y [The Java Tutorials: Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/).

### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 45 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** definir una excepción propia del dominio y diagnosticar por qué un catch vacío convierte un bug real en invisible.

#### Aprende

Un intento de retirar más saldo del disponible en una billetera de conductor es un error de dominio específico y esperado, distinto de un `RuntimeException` genérico; capturarlo y descartarlo en silencio dejaría que el conductor crea que la operación funcionó cuando en realidad falló.

**¿Por qué es importante?** Las excepciones personalizadas comunican con precisión qué condición de error específica ocurrió; un catch vacío oculta errores reales haciendo el bug correspondiente invisible y mucho más difícil de diagnosticar posteriormente.

Una excepción personalizada (`SaldoInsuficienteException`) comunica con precisión qué condición ocurrió; un catch vacío oculta el error, dejando el bug invisible hasta que sus consecuencias aparezcan mucho después y sin relación aparente con la causa.

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

**Fallo deliberado:** comenta el segundo bloque `try`/`catch` (el que registra) y vuelve a ejecutar. El programa termina sin imprimir nada aunque ambos retiros fallaron; restaura el bloque y confirma que ahora el fallo es visible y diagnosticable.

**Pista:** la salida de error puede verse mezclada con la salida estándar según la terminal; ejecuta con `2>&1` si quieres comparar ambas en el mismo flujo. **Resultado esperado:** el mismo error, pero ahora diagnosticable.

**Si falla.** Si el compilador no acepta `catch (SaldoInsuficienteException e)`, revisa que la clase esté en el mismo paquete y que `retirar` la lance realmente. Si el primer retiro imprime un mensaje, el catch vacío no está vacío. Si el segundo no imprime nada, el registro está en el bloque equivocado.

#### Aplica

Agrega una segunda excepción de dominio (`CuentaBloqueadaException`) y un bloque que capture ambas por separado, reaccionando distinto a cada una en vez de tratarlas como un `Exception` genérico.

**Checklist de salida.**

- [ ] `Billetera.java` compila y extiende `RuntimeException` en la excepción propia.
- [ ] El primer retiro fallido del catch vacío no deja rastro.
- [ ] El segundo retiro imprime un mensaje de error con saldo y monto.
- [ ] Comentar el bloque que registra deja el fallo invisible.
- [ ] `CuentaBloqueadaException` se captura por separado de `SaldoInsuficienteException`.
- [ ] Explicas por qué un catch vacío dificulta el diagnóstico.

**Si falla.** Si ambas excepciones se capturan en el mismo bloque, revisa el orden de los `catch`: el más específico debe ir antes que el más general. Si `CuentaBloqueadaException` no se lanza nunca, falta la condición que la produce en el dominio simulado.

Guarda ambas excepciones, la salida silenciosa del catch vacío y la salida registrada tras corregirlo.

**Errores comunes:** usar un catch vacío "para que no se rompa el programa", capturar `Throwable`/`Exception` genérico en vez del tipo de dominio específico cuando sí se necesita reaccionar distinto a cada caso, y devolver el stack trace completo al cliente final en vez de un mensaje de dominio junto con el registro técnico interno.

**Fuente oficial:** [dev.java: Exceptions](https://dev.java/learn/exceptions/) y [The Java Tutorials: Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/).

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
