# Módulo 4: Streams y programación funcional

Procesar colecciones con bucles `for` funciona, pero cuando la lógica crece aparecen tuberías de código imperativo difíciles de leer: filtrar, transformar, agrupar, ordenar, acumular. La Stream API permite expresar esas transformaciones de forma declarativa. Este módulo cubre streams, `Optional`, gatherers y paralelismo, con criterio sobre cuándo usarlos y cuándo no.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Crear pipelines con `filter`, `map`, `collect` y `reduce` |
| 2 | Usar `Optional` para modelar ausencia sin `null` |
| 3 | Aplicar gatherers de Java 24 para operaciones avanzadas |
| 4 | Evaluar streams paralelos con medición, no por intuición |

## Aprende construyendo

### Tema 1: Stream API — map, filter, reduce, collect · Intermedio · 45 min

**Caso guía**

De una lista de empleados, quieres nombres en mayúsculas de quienes ganan >2000, ordenados, y además total y máximo salarial. Quieres expresar intención, no mecánica de bucles.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Stream API** | API para procesar secuencias con operaciones agregadas. | Pipelines declarativos sobre datos. | Transformar/filtrar/agregar colecciones. | Usarla para todo, incluso lógica simple/legible con bucle. |
| **`map`** | Operación intermedia que transforma cada elemento. | Proyección/cambio de forma. | `Empleado`→`nombre`, `String`→`upper`. | Efectos secundarios dentro de map. |
| **`filter`** | Operación intermedia que conserva elementos que cumplen predicado. | Selección. | Reglas de inclusión. | Predicados con estado mutable compartido. |
| **`reduce`** | Operación terminal que combina elementos en un resultado. | Acumulación (suma, max, concatenación). | Cuando no hay colector directo. | Usar función no asociativa en paralelo. |
| **`collect`** | Operación terminal que materializa en colección/mapa/resultado mutable. | Obtener `List`, `Map`, `groupingBy`. | Fin de pipeline. | Mutar fuente; asumir stream reutilizable. |

**Contrato / invariantes / reglas.** Stream es perezoso: intermedias no ejecutan sin terminal. Un stream se consume una vez. Operaciones preferentemente stateless/no interferentes. `reduce` requiere identidad + acumulador asociativo para paralelismo correcto. `mapToInt` evita boxing.

**Modelo mental.** Cinta transportadora: `filter/map` son estaciones; `collect/reduce` es la caja final que enciende la cinta.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-4 && cd ~/academia-java/modulo-4
```

`DemoStreams.java`:

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
            .filter(e -> e.salario() > 2000) // filter
            .map(Empleado::nombre)            // map
            .map(String::toUpperCase)         // map
            .sorted()
            .collect(Collectors.toList());    // collect
        System.out.println(nombres);

        int total = empleados.stream().mapToInt(Empleado::salario).sum();
        int max = empleados.stream().mapToInt(Empleado::salario).reduce(0, Integer::max); // reduce
        System.out.println(total);
        System.out.println(max);
    }
}
```

**Ejecución y salida real**

```bash
javac DemoStreams.java
java DemoStreams
```

```text
[ADA, GRACE]
8800
3000
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `stream has already been operated upon` | Reuso de stream | Crear nuevo stream |
| Nada pasa | Falta terminal | Agregar `collect/reduce/forEach` |
| Bug en paralelo con `reduce` | Función no asociativa/identidad mala | Respetar contrato de `reduce` |

**Verificación rápida:** cambia filtro a `>=2000` y confirma resultado.


### Tema 2: Optional — evitar null explícitamente · Intermedio · 35 min

**Caso guía**

Buscas usuario por email. Puede no existir. Devolver `null` obliga a recordar checks; olvidarlos produce NPE lejos del origen.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **`Optional<T>`** | Contenedor que puede tener o no un valor no nulo. | Modelar ausencia en retornos. | Búsquedas, lookups, APIs donde ausencia es normal. | Usarlo como campo/param everywhere. |
| **Evitar `null` explícitamente** | Reemplazar contrato implícito “puede ser null” por tipo explícito. | Hacer visible la ausencia en la firma. | Retornos de búsqueda. | Llamar `get()` sin verificar. |
| **`map/flatMap/filter`** | Transforman solo si hay valor. | Componer sin if-null anidados. | Pipelines seguros. | Usar `map` cuando la función ya devuelve Optional (usar `flatMap`). |
| **`orElse/orElseGet/orElseThrow`** | Extraen valor con default/eager/lazy/exception. | Definir política ante ausencia. | Default, cálculo diferido, error de dominio. | `orElse` ejecuta costo siempre; usar `orElseGet` si es caro. |

**Contrato / invariantes / reglas.** `Optional.of(null)` lanza NPE; `ofNullable` acepta null. `get()` en vacío lanza `NoSuchElementException`. No recomendado como campo serializable ni parámetro general. `orElse` evalúa argumento siempre; `orElseGet` solo si vacío.

**Modelo mental.** Caja etiquetada “puede haber algo”: te obliga a abrirla conscientemente.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-4 && cd ~/academia-java/modulo-4
```

`DemoOptional.java`:

```java
import java.util.*;
public class DemoOptional {
    record Usuario(String email, String nombre) {}
    static Optional<Usuario> buscar(String email, List<Usuario> usuarios) {
        return usuarios.stream().filter(u -> u.email().equalsIgnoreCase(email)).findFirst();
    }
    public static void main(String[] args) {
        List<Usuario> usuarios = List.of(new Usuario("ada@example.com","Ada"), new Usuario("linus@example.com","Linus"));
        String nombre = buscar("ada@example.com", usuarios).map(Usuario::nombre).orElse("DESCONOCIDO");
        System.out.println(nombre);
        String otro = buscar("nadie@example.com", usuarios).map(Usuario::nombre).orElseGet(() -> "DESCONOCIDO");
        System.out.println(otro);
        try { buscar("nadie@example.com", usuarios).orElseThrow(); }
        catch (NoSuchElementException e) { System.out.println("No encontrado"); }
    }
}
```

**Ejecución y salida real**

```bash
javac DemoOptional.java
java DemoOptional
```

```text
Ada
DESCONOCIDO
No encontrado
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `NoSuchElementException` | `get()` en vacío | `orElse/orElseThrow/map/ifPresent` |
| Costo innecesario | `orElse` evalúa siempre | `orElseGet` para lazy |
| Optional en todos lados | Sobreuso | Principalmente en retornos |

**Verificación rápida:** usa `orElseThrow(() -> new IllegalArgumentException("email no encontrado"))`.


### Tema 3: Stream Gatherers (Java 24) · Avanzado · 40 min

**Caso guía**

Necesitas agrupar un stream en ventanas deslizantes de 3 y lotes fijos de 2. Con `map/filter/reduce` puro es incómodo; Gatherers agrega operaciones intermedias personalizadas al pipeline.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Stream Gatherers (Java 24)** | API (`java.util.stream.Gatherer`, `Stream.gather`) para definir operaciones intermedias personalizadas que pueden emitir 0..N elementos por entrada. | Extender pipelines cuando `map/filter/flatMap` no expresan bien la operación. | Ventanas, lotes, scan, operaciones stateful controladas. | Usarlos para algo simple ya cubierto por API estándar. |
| **`windowSliding`** | Gatherer que emite ventanas deslizantes de tamaño n, compartiendo elementos entre ventanas consecutivas. | Análisis por ventana móvil (promedios, tendencias). | Series temporales, n-grams. | Esperar ventanas parciales si no las define el gatherer. |
| **`windowFixed`** | Gatherer que emite lotes fijos consecutivos sin solapamiento. | Procesamiento por bloques. | Batching, paginación en memoria. | Asumir que último lote siempre tiene tamaño completo. |
| **Operación intermedia personalizada** | Paso en pipeline que transforma flujo con estado/localidad controlada. | Encapsular patrones complejos reutilizables. | Cuando la lógica de flujo es la abstracción. | Estado mutable compartido inseguro en paralelo. |

**Contrato / invariantes / reglas.** Requiere JDK 24+ (API estándar en 24; antes preview). `gather(...)` es intermedia y perezosa. Gatherers integrados: `windowFixed`, `windowSliding`, `fold`, `scan`, `mapConcurrent` (según JDK). Para paralelismo, el gatherer debe cumplir contrato de combiner/estado; no todos son igual de paralelizables.

**Modelo mental.** Gatherer = estación custom en la cinta transportadora: recibe items, puede acumular y emitir paquetes según su regla.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-4 && cd ~/academia-java/modulo-4
```

> **Nota de verificación**: requiere JDK 24+. Confirma con `java -version`.

`DemoGatherers.java`:

```java
import java.util.List;
import java.util.stream.Gatherers;

public class DemoGatherers {
    public static void main(String[] args) {
        List<Integer> valores = List.of(1, 2, 3, 4, 5);

        var ventanas = valores.stream().gather(Gatherers.windowSliding(3)).toList();
        System.out.println(ventanas);

        var lotes = valores.stream().gather(Gatherers.windowFixed(2)).toList();
        System.out.println(lotes);
    }
}
```

**Desglose del código**

- **Gatherer**: `gather(...)` inserta operación intermedia custom.
- **windowSliding(3)**: solapa elementos: `[1,2,3],[2,3,4],[3,4,5]`.
- **windowFixed(2)**: lotes disjuntos: `[1,2],[3,4],[5]`.

**Ejecución y salida real**

```bash
javac DemoGatherers.java
java DemoGatherers
```

```text
[[1, 2, 3], [2, 3, 4], [3, 4, 5]]
[[1, 2], [3, 4], [5]]
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `cannot find symbol Gatherers` | JDK < 24 | Actualiza JDK o usa alternativa con bucle/colector |
| Usas gatherer para `map/filter` | Sobreingeniería | Prefiere operación estándar |
| Estado mutable inseguro | Gatherer custom mal diseñado | Respetar contrato de Gatherer |

**Verificación rápida**

```bash
javac DemoGatherers.java && java DemoGatherers
```


### Tema 4: Streams paralelos y referencias a métodos · Intermedio · 35 min

**Caso guía**

Tienes 1 millón de números y quieres sumarlos. ¿`parallelStream()` lo hace más rápido? Depende: hay que medir y mantener corrección.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Streams paralelos** | Stream que particiona trabajo en subtareas, por defecto sobre ForkJoinPool común. | Aprovechar varios núcleos en operaciones CPU-bound divisibles. | Grandes volúmenes, operaciones costosas, fuente divisible. | Usarlo por defecto en colecciones pequeñas/I/O bloqueante. |
| **Referencias a métodos** | Sintaxis compacta de lambda (`obj::met`, `Clase::met`, `Clase::new`). | Legibilidad cuando la firma coincide. | `map(Integer::longValue)`, `System.out::println`. | Forzar referencia cuando una lambda es más clara. |
| **Corrección en paralelo** | El resultado debe ser igual al secuencial; requiere no interferencia y funciones adecuadas. | Evitar race conditions. | Siempre validar antes de medir rendimiento. | Mutar estado compartido desde lambdas. |
| **Medición (no intuición)** | Comparar con medición real (JMH ideal; nanoTime como aproximación). | Decidir si paralelizar vale. | Antes de adoptar paralelo. | Creer que paralelo siempre es más rápido. |

**Contrato / invariantes / reglas.** Operaciones deben ser stateless/no interferentes o usar colectores concurrentes seguros. `reduce`/`collect` deben cumplir identidad/asociatividad/combiner según corresponda. `parallelStream()` comparte ForkJoinPool común: no bloquearlo con I/O. Orden de encuentro puede variar; usa `forEachOrdered` si necesitas orden (con costo).

**Modelo mental.** Paralelizar = dividir carga entre trabajadores; coordinar cuesta. Referencia a método = atajo legible a una lambda existente.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-4 && cd ~/academia-java/modulo-4
```

`DemoParallel.java`:

```java
import java.util.*;
import java.util.stream.*;

public class DemoParallel {
    public static void main(String[] args) {
        List<Integer> datos = IntStream.rangeClosed(1, 1_000_000).boxed().toList();

        long t1 = System.nanoTime();
        long sumaSec = datos.stream().mapToLong(Integer::longValue).sum(); // referencia a método
        long t2 = System.nanoTime();

        long t3 = System.nanoTime();
        long sumaPar = datos.parallelStream().mapToLong(Integer::longValue).sum();
        long t4 = System.nanoTime();

        System.out.println(sumaSec == sumaPar); // corrección primero
        System.out.println("sec ms: " + (t2 - t1) / 1_000_000);
        System.out.println("par ms: " + (t4 - t3) / 1_000_000);
    }
}
```

**Desglose del código**

- **Referencia a método**: `Integer::longValue` equivale a `x -> x.longValue()`.
- **Stream paralelo**: `parallelStream()` divide el trabajo.
- **Corrección**: compara sumas antes que tiempos.
- **Medición**: `nanoTime` aproximado; para serio usar JMH.

**Ejecución y salida real**

```bash
javac DemoParallel.java
java DemoParallel
```

```text
true
sec ms: 12
par ms: 8
```

(Tiempos varían por máquina/JVM/carga; lo importante es `true`).

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Resultado incorrecto | Estado mutable compartido | Elimina side effects; usa collectors seguros |
| Paralelo más lento | Overhead/datos pequeños/I/O | Mide; mantén secuencial si gana |
| Bloqueas sistema | I/O bloqueante en pool común | Usa ejecutor dedicado/virtual threads |

**Verificación rápida:** ejecuta varias veces; si paralelo no gana consistentemente, no lo uses.


## Cierre del módulo

Puedes transformar colecciones con streams, expresar ausencia con `Optional`, aplicar gatherers cuando el pipeline lo justifica y evaluar paralelismo con medición. El próximo módulo entra en concurrencia: hilos, virtual threads y coordinación segura de tareas.
