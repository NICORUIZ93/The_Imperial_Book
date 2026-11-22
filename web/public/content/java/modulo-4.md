# Módulo 4: Streams y programación funcional

Procesar colecciones con bucles `for` funciona, pero cuando la lógica crece aparecen tuberías imperativas difíciles de leer. La Stream API permite expresar transformaciones de forma declarativa. Este módulo cubre streams, `Optional`, gatherers y paralelismo, con criterio sobre cuándo usarlos y cuándo no.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Stream API — map, filter, reduce, collect · Intermedio · 45 min

De una lista de empleados quieres nombres en mayúsculas de quienes ganan más de 2000, ordenados, y además total y máximo salarial. Quieres expresar intención, no mecánica de bucles.

#### Stream API

**Definición formal.** La Stream API procesa secuencias de elementos mediante un pipeline de operaciones intermedias y una terminal.

**Para qué sirve.** Expresa transformaciones declarativas sobre datos: filtrar, proyectar, agrupar, acumular.

**Cuándo usarla y cuándo no.** Úsala cuando el pipeline sea más claro que el bucle equivalente. No la fuerces para lógica simple con efectos secundarios complejos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t1-stream && cd /tmp/java-m4-t1-stream
```

```java
import java.util.*;
public class DemoStream {
    public static void main(String[] args) {
        long c = List.of(1,2,3,4).stream().filter(n -> n % 2 == 0).count();
        System.out.println(c);
    }
}
```

**Caso de uso real.** Filtrar pedidos pagados y obtener IDs para un reporte.

**Error común.** Olvidar la operación terminal. Síntoma: el pipeline no ejecuta. Corrección: agregar `collect`, `reduce`, `count`, `forEach`, etc.

**Verificación (JDK 27, 2026-05-22).** Salida: `2`.

#### `map`

**Definición formal.** Operación intermedia que transforma cada elemento en otro valor.

**Para qué sirve.** Proyectar o cambiar forma: `Empleado` -> nombre, `String` -> mayúsculas.

**Cuándo usarlo y cuándo no.** Úsalo para transformaciones puras. Evita efectos secundarios dentro de `map`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t1-map && cd /tmp/java-m4-t1-map
```

```java
import java.util.*;
public class DemoMap {
    public static void main(String[] args) {
        System.out.println(List.of("a","b").stream().map(String::toUpperCase).toList());
    }
}
```

**Caso de uso real.** Convertir entidades a DTOs en una respuesta.

**Error común.** Mutar objetos externos desde `map`. Síntoma: bugs difíciles en paralelo. Corrección: mantener la lambda pura.

**Verificación (JDK 27, 2026-05-22).** Salida: `[A, B]`.

#### `filter`

**Definición formal.** Operación intermedia que conserva solo los elementos que cumplen un predicado.

**Para qué sirve.** Seleccionar elementos según una regla.

**Cuándo usarlo y cuándo no.** Úsalo para reglas de inclusión. Evita predicados que dependan de estado mutable compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t1-filter && cd /tmp/java-m4-t1-filter
```

```java
import java.util.*;
public class DemoFilter {
    public static void main(String[] args) {
        System.out.println(List.of(1,2,3,4).stream().filter(n -> n % 2 == 0).toList());
    }
}
```

**Caso de uso real.** Seleccionar transacciones con monto mayor a un umbral.

**Error común.** Usar `filter` con predicado costoso y no medido en streams enormes. Corrección: evaluar costo y orden del pipeline.

**Verificación (JDK 27, 2026-05-22).** Salida: `[2, 4]`.

#### `reduce`

**Definición formal.** Operación terminal que combina elementos en un solo resultado usando identidad y función acumuladora asociativa.

**Para qué sirve.** Acumular suma, máximo, concatenación u otro agregado.

**Cuándo usarlo y cuándo no.** Úsalo cuando no haya un colector u operación directa más clara. En paralelo, la función debe ser asociativa y la identidad correcta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t1-reduce && cd /tmp/java-m4-t1-reduce
```

```java
import java.util.*;
public class DemoReduce {
    public static void main(String[] args) {
        System.out.println(List.of(1,2,3).stream().reduce(0, Integer::sum));
    }
}
```

**Caso de uso real.** Totalizar importes o calcular un score agregado.

**Error común.** Identidad incorrecta o función no asociativa. Síntoma: resultado errado, especialmente en paralelo. Corrección: respetar contrato de `reduce`.

**Verificación (JDK 27, 2026-05-22).** Salida: `6`.

#### `collect`

**Definición formal.** Operación terminal que materializa el resultado en una colección, mapa u otra estructura mutable mediante un `Collector`.

**Para qué sirve.** Obtener `List`, `Set`, `Map`, `groupingBy`, `joining`, etc.

**Cuándo usarlo y cuándo no.** Úsalo al final del pipeline. No asumas que el stream se puede reutilizar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t1-collect && cd /tmp/java-m4-t1-collect
```

```java
import java.util.*; import java.util.stream.*;
public class DemoCollect {
    public static void main(String[] args) {
        System.out.println(List.of("a","b","a").stream().collect(Collectors.toSet()).size());
    }
}
```

**Caso de uso real.** Agrupar ventas por región o recolectar IDs únicos.

**Error común.** Intentar reutilizar un stream consumido. Síntoma: `IllegalStateException`. Corrección: crear un nuevo stream.

**Verificación (JDK 27, 2026-05-22).** Salida: `2`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m4-t1 && cd /tmp/java-m4-t1
```

```java
import java.util.*;
import java.util.stream.*;
public class DemoStreams {
    record Empleado(String nombre, int salario) {}
    public static void main(String[] args) {
        List<Empleado> empleados = List.of(
            new Empleado("Ada", 3000), new Empleado("Linus", 1800),
            new Empleado("Grace", 2500), new Empleado("Ken", 1500));
        List<String> nombres = empleados.stream()
            .filter(e -> e.salario() > 2000)
            .map(Empleado::nombre)
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.toList());
        System.out.println(nombres);
        int total = empleados.stream().mapToInt(Empleado::salario).sum();
        int max = empleados.stream().mapToInt(Empleado::salario).reduce(0, Integer::max);
        System.out.println(total);
        System.out.println(max);
    }
}
```

#### Recorrido del código

`filter` selecciona salarios altos; `map` proyecta y transforma; `sorted` ordena; `collect` materializa. `mapToInt` evita boxing en agregaciones numéricas. `reduce` calcula máximo respetando identidad.

#### Ejecución y salida real

```bash
javac DemoStreams.java
java DemoStreams
```

```text
[ADA, GRACE]
8800
3000
```

#### Errores frecuentes

Reutilizar streams, usar side effects en lambdas, o aplicar `reduce` con identidad/función incorrecta.

#### Verificación

Cambiar el filtro a `>= 2000` y confirmar que el resultado incluye los nombres esperados.


### Tema 2: Optional — evitar null explícitamente · Intermedio · 35 min

Buscas usuario por email. Puede no existir. Devolver `null` obliga a recordar checks; olvidarlos produce NPE lejos del origen.

#### `Optional<T>`

**Definición formal.** `Optional<T>` es un contenedor que puede contener un valor no nulo o estar vacío.

**Para qué sirve.** Hace explícita la ausencia en la firma de retorno, especialmente en búsquedas.

**Cuándo usarlo y cuándo no.** Úsalo en retornos donde la ausencia es normal. No lo uses como campo de entidad por defecto ni como parámetro en todas partes; puede agregar ruido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t2-optional && cd /tmp/java-m4-t2-optional
```

```java
import java.util.*;
public class DemoOptional {
    public static void main(String[] args) {
        Optional<String> o = Optional.of("Ada");
        System.out.println(o.map(String::toUpperCase).orElse("X"));
    }
}
```

**Caso de uso real.** `findByEmail` devuelve `Optional<Usuario>`.

**Error común.** Llamar `get()` sin verificar. Síntoma: `NoSuchElementException`. Corrección: `orElse`, `orElseThrow`, `map`, `ifPresent`.

**Verificación (JDK 27, 2026-05-22).** Salida: `ADA`.

#### `orElse`, `orElseGet`, `orElseThrow`

**Definición formal.** Métodos para extraer el valor o definir una política ante ausencia: valor por defecto, cálculo diferido o excepción.

**Para qué sirve.** Define qué hacer cuando no hay valor, de forma explícita.

**Cuándo usarlo y cuándo no.** `orElse` para valores baratos; `orElseGet` para cálculo diferido; `orElseThrow` cuando la ausencia es error.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t2-orelse && cd /tmp/java-m4-t2-orelse
```

```java
import java.util.*;
public class DemoOrElse {
    public static void main(String[] args) {
        Optional<String> o = Optional.empty();
        System.out.println(o.orElse("DEF"));
        try { o.orElseThrow(); }
        catch (NoSuchElementException e) { System.out.println("vacío"); }
    }
}
```

**Caso de uso real.** Configuración opcional: valor por defecto o error si es obligatoria.

**Error común.** Usar `orElse` con creación costosa. Síntoma: costo innecesario. Corrección: `orElseGet`.

**Verificación (JDK 27, 2026-05-22).** Salida: `DEF` y `vacío`.

#### `map` y `flatMap` en Optional

**Definición formal.** `map` transforma el valor si existe. `flatMap` evita `Optional<Optional<T>>` cuando la función ya devuelve `Optional`.

**Para qué sirve.** Componer transformaciones seguras sin `if (x != null)` anidados.

**Cuándo usarlo y cuándo no.** Usa `map` cuando la función devuelve valor normal; `flatMap` cuando devuelve `Optional`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t2-flat && cd /tmp/java-m4-t2-flat
```

```java
import java.util.*;
public class DemoFlat {
    static Optional<String> buscar(boolean ok) { return ok ? Optional.of("Ada") : Optional.empty(); }
    public static void main(String[] args) {
        System.out.println(Optional.of(true).flatMap(DemoFlat::buscar).orElse("N"));
    }
}
```

**Caso de uso real.** Buscar usuario y luego buscar su perfil opcional.

**Error común.** Usar `map` donde corresponde `flatMap`. Síntoma: tipo `Optional<Optional<T>>`. Corrección: `flatMap`.

**Verificación (JDK 27, 2026-05-22).** Salida: `Ada`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m4-t2 && cd /tmp/java-m4-t2
```

```java
import java.util.*;
public class DemoOptional {
    record Usuario(String email, String nombre) {}
    static Optional<Usuario> buscar(String email, List<Usuario> usuarios) {
        return usuarios.stream().filter(u -> u.email().equalsIgnoreCase(email)).findFirst();
    }
    public static void main(String[] args) {
        List<Usuario> usuarios = List.of(new Usuario("ada@example.com","Ada"));
        System.out.println(buscar("ada@example.com", usuarios).map(Usuario::nombre).orElse("DESCONOCIDO"));
        System.out.println(buscar("nadie@example.com", usuarios).map(Usuario::nombre).orElseGet(() -> "DESCONOCIDO"));
        try { buscar("nadie@example.com", usuarios).orElseThrow(); }
        catch (NoSuchElementException e) { System.out.println("No encontrado"); }
    }
}
```

#### Recorrido del código

`buscar` devuelve `Optional` para hacer explícita la ausencia. `map` transforma solo si hay valor. `orElseGet` evita cómputo innecesario. `orElseThrow` hace visible la ausencia como error.

#### Ejecución y salida real

```bash
javac DemoOptional.java
java DemoOptional
```

```text
Ada
DESCONOCIDO
No encontrado
```

#### Errores frecuentes

Usar `get()`, devolver `Optional.of(null)` (lanza NPE; usar `ofNullable`), o usar Optional para todo.

#### Verificación

Probar con `orElseThrow(() -> new IllegalArgumentException("email no encontrado"))`.

### Tema 3: Stream Gatherers (Java 24) · Avanzado · 40 min

Necesitas ventanas deslizantes o lotes fijos en un pipeline. Antes, se resolvía con bucles manuales incómodos. Los gatherers permiten operaciones intermedias personalizadas.

#### Stream Gatherers

**Definición formal.** API de Java 24 (`java.util.stream.Gatherer`, `Stream.gather`) para definir operaciones intermedias que pueden emitir 0..N elementos por entrada.

**Para qué sirve.** Extiende el pipeline cuando `map/filter/flatMap` no expresan bien la operación.

**Cuándo usarlo y cuándo no.** Úsalo para ventanas, lotes, scan/fold avanzados. No lo uses para algo ya cubierto por la API estándar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t3-gather && cd /tmp/java-m4-t3-gather
```

```java
import java.util.List; import java.util.stream.Gatherers;
public class DemoGather {
    public static void main(String[] args) {
        System.out.println(List.of(1,2,3,4).stream().gather(Gatherers.windowFixed(2)).toList());
    }
}
```

**Caso de uso real.** Procesar eventos en micro-lotes.

**Error común.** Usar gatherers por moda cuando `map/filter` basta. Corrección: preferir operación estándar si expresa la intención.

**Verificación (JDK 27, 2026-05-22).** Salida: `[[1, 2], [3, 4]]`.

#### `windowSliding`

**Definición formal.** Gatherer que emite ventanas deslizantes de tamaño n, compartiendo elementos entre ventanas consecutivas.

**Para qué sirve.** Análisis por ventana móvil: promedios, tendencias, n-grams.

**Cuándo usarlo y cuándo no.** Úsalo cuando el solapamiento tenga sentido. Si los lotes son independientes, usa `windowFixed`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t3-sliding && cd /tmp/java-m4-t3-sliding
```

```java
import java.util.List; import java.util.stream.Gatherers;
public class DemoSliding {
    public static void main(String[] args) {
        System.out.println(List.of(1,2,3,4,5).stream().gather(Gatherers.windowSliding(3)).toList());
    }
}
```

**Caso de uso real.** Promedio móvil de precios o métricas.

**Error común.** Asumir tamaño constante al final de flujos que no lo garantizan según el gatherer. Corrección: leer el contrato del gatherer.

**Verificación (JDK 27, 2026-05-22).** Salida: `[[1, 2, 3], [2, 3, 4], [3, 4, 5]]`.

#### `windowFixed`

**Definición formal.** Gatherer que emite lotes consecutivos de tamaño fijo, sin solapamiento. El último puede ser menor.

**Para qué sirve.** Procesamiento por bloques/batches.

**Cuándo usarlo y cuándo no.** Úsalo para batching. No asumas que el último lote siempre tiene el tamaño completo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t3-fixed && cd /tmp/java-m4-t3-fixed
```

```java
import java.util.List; import java.util.stream.Gatherers;
public class DemoFixed {
    public static void main(String[] args) {
        System.out.println(List.of(1,2,3,4,5).stream().gather(Gatherers.windowFixed(2)).toList());
    }
}
```

**Caso de uso real.** Insertar registros en BD por lotes.

**Error común.** Ignorar el lote final parcial. Síntoma: pérdida de datos. Corrección: procesar el último lote siempre.

**Verificación (JDK 27, 2026-05-22).** Salida: `[[1, 2], [3, 4], [5]]`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m4-t3 && cd /tmp/java-m4-t3
```

```java
import java.util.List;
import java.util.stream.Gatherers;
public class DemoGatherers {
    public static void main(String[] args) {
        List<Integer> valores = List.of(1, 2, 3, 4, 5);
        System.out.println(valores.stream().gather(Gatherers.windowSliding(3)).toList());
        System.out.println(valores.stream().gather(Gatherers.windowFixed(2)).toList());
    }
}
```

#### Recorrido del código

`windowSliding(3)` crea ventanas solapadas; `windowFixed(2)` crea lotes disjuntos. Ambos son operaciones intermedias insertadas con `gather(...)`.

#### Ejecución y salida real

```bash
javac DemoGatherers.java
java DemoGatherers
```

```text
[[1, 2, 3], [2, 3, 4], [3, 4, 5]]
[[1, 2], [3, 4], [5]]
```

#### Errores frecuentes

Usar gatherers donde basta un collector/operación estándar, o usar JDK < 24 sin verificar.

#### Verificación

Ejecutar con JDK 24+ y confirmar las dos salidas.


### Tema 4: Streams paralelos y referencias a métodos · Intermedio · 35 min

Tienes muchos datos y quieres sumarlos. ¿`parallelStream()` lo hace más rápido? Depende. El paralelismo tiene overhead y riesgos de corrección.

#### Streams paralelos

**Definición formal.** Un stream paralelo divide el trabajo en subtareas, normalmente usando el `ForkJoinPool` común.

**Para qué sirve.** Aprovecha varios núcleos en operaciones CPU-bound, divisibles y grandes.

**Cuándo usarlo y cuándo no.** Úsalo solo tras medir y confirmar corrección. Evítalo en colecciones pequeñas, operaciones baratas o I/O bloqueante.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t4-parallel && cd /tmp/java-m4-t4-parallel
```

```java
import java.util.stream.*;
public class DemoParallel {
    public static void main(String[] args) {
        long s = IntStream.rangeClosed(1, 1000).parallel().sum();
        System.out.println(s);
    }
}
```

**Caso de uso real.** Cálculo intensivo sobre un gran conjunto en memoria.

**Error común.** Usar paralelo por defecto. Síntoma: más lento o bugs por estado compartido. Corrección: medir con JMH/datos reales y mantener lambdas puras.

**Verificación (JDK 27, 2026-05-22).** Salida: `500500`.

#### Referencias a métodos

**Definición formal.** Sintaxis compacta para lambdas que llaman a un método existente: `obj::met`, `Clase::met`, `Clase::new`.

**Para qué sirve.** Mejora legibilidad cuando la firma coincide.

**Cuándo usarlo y cuándo no.** Úsala cuando sea más clara que la lambda. Si la lambda es más explícita, no fuerces la referencia.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t4-ref && cd /tmp/java-m4-t4-ref
```

```java
import java.util.stream.*;
public class DemoRef {
    public static void main(String[] args) {
        System.out.println(Stream.of("a","b").map(String::toUpperCase).toList());
    }
}
```

**Caso de uso real.** `map(String::trim)`, `forEach(System.out::println)`, `map(UsuarioDto::new)`.

**Error común.** Usar referencias a métodos donde la lambda necesita lógica adicional. Síntoma: código forzado. Corrección: elegir la forma más legible.

**Verificación (JDK 27, 2026-05-22).** Salida: `[A, B]`.

#### Corrección y medición

**Definición formal.** Corrección significa que el resultado paralelo es igual al secuencial. Medición significa comparar con datos realistas, preferentemente con JMH; `nanoTime` solo sirve como aproximación gruesa.

**Para qué sirve.** Evita optimizaciones que rompen el resultado o no mejoran rendimiento.

**Cuándo usarlo.** Siempre antes de adoptar `parallelStream()`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m4-t4-medicion && cd /tmp/java-m4-t4-medicion
```

```java
import java.util.stream.*;
public class DemoMedicion {
    public static void main(String[] args) {
        long sec = IntStream.rangeClosed(1, 1_000_000).asLongStream().sum();
        long par = IntStream.rangeClosed(1, 1_000_000).parallel().asLongStream().sum();
        System.out.println(sec == par);
    }
}
```

**Caso de uso real.** Validar que una agregación paralela produce el mismo total antes de medir tiempos.

**Error común.** Mirar solo tiempo y no corrección. Síntoma: resultado rápido pero erróneo. Corrección: comprobar igualdad primero.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m4-t4 && cd /tmp/java-m4-t4
```

```java
import java.util.*;
import java.util.stream.*;
public class DemoParallel {
    public static void main(String[] args) {
        List<Integer> datos = IntStream.rangeClosed(1, 1_000_000).boxed().toList();
        long sec = datos.stream().mapToLong(Integer::longValue).sum();
        long par = datos.parallelStream().mapToLong(Integer::longValue).sum();
        System.out.println(sec == par);
    }
}
```

#### Recorrido del código

`Integer::longValue` es referencia a método. El stream secuencial y paralelo calculan la misma suma. La verificación de corrección va antes que cualquier conclusión de rendimiento.

#### Ejecución y salida real

```bash
javac DemoParallel.java
java DemoParallel
```

```text
true
```

#### Errores frecuentes

Mutar estado compartido, bloquear el pool común con I/O, o asumir que paralelo siempre gana. Medir y mantener pureza.

#### Verificación

Ejecutar varias veces y confirmar `true`. Solo después comparar tiempos con un benchmark adecuado.

## Cierre del módulo

Puedes transformar colecciones con streams, modelar ausencia con `Optional`, aplicar gatherers cuando el pipeline lo justifica y evaluar paralelismo con corrección antes que con intuición.
