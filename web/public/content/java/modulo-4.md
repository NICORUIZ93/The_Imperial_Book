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

Tienes una lista de empleados y necesitas obtener los nombres de los que ganan más de 2000, en mayúsculas, ordenados. Con bucles se puede, pero la intención queda mezclada con la mecánica de iteración.

**Concepto clave / modelo mental**

Un stream es una tubería de datos: fuente → operaciones intermedias → operación terminal.

| Tipo | Ejemplos | Efecto |
|---|---|---|
| Intermedia | `filter`, `map`, `sorted`, `distinct` | Devuelve otro stream; es perezosa |
| Terminal | `collect`, `reduce`, `forEach`, `count` | Produce resultado; ejecuta la tubería |

Las operaciones intermedias no se ejecutan hasta que hay una terminal. No reutilices un stream ya consumido.

**Implementación desde cero**

```java
import java.util.*;
import java.util.stream.*;

public class DemoStreams {
    record Empleado(String nombre, int salario) {}

    public static void main(String[] args) {
        List<Empleado> empleados = List.of(
            new Empleado("Ada", 3000),
            new Empleado("Linus", 1800),
            new Empleado("Grace", 2500),
            new Empleado("Ken", 1500)
        );

        List<String> nombres = empleados.stream()
            .filter(e -> e.salario() > 2000)
            .map(Empleado::nombre)
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.toList());
        System.out.println(nombres);

        int total = empleados.stream()
            .mapToInt(Empleado::salario)
            .sum();
        System.out.println(total);

        int max = empleados.stream()
            .mapToInt(Empleado::salario)
            .reduce(0, Integer::max);
        System.out.println(max);
    }
}
```

**Desglose del código**

- `filter` conserva elementos que cumplen el predicado.
- `map` transforma cada elemento; `Empleado::nombre` es una referencia a método.
- `collect(Collectors.toList())` materializa el resultado. En Java 16+ también puedes usar `toList()` (lista inmutable).
- `mapToInt` evita boxing/unboxing en operaciones numéricas.
- `reduce(0, Integer::max)` acumula un resultado; el primer argumento es la identidad.

**Ejecución y salida real**

```text
[ADA, GRACE]
8800
3000
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `IllegalStateException: stream has already been operated upon` | Reutilizaste un stream | Crea un nuevo stream desde la fuente |
| Pipeline sin resultado | Falta operación terminal | Agrega `collect`, `forEach`, `reduce`, etc. |
| Código difícil de leer en lambdas grandes | Metiste demasiada lógica en la lambda | Extrae un método con nombre claro |

**Verificación rápida**

```bash
javac DemoStreams.java && java DemoStreams
```

Cambia el filtro a `salario >= 2000` y verifica que la salida incluya los casos límite esperados.

### Tema 2: Optional — evitar null explícitamente · Intermedio · 35 min

**Caso guía**

Buscas un usuario por email. A veces existe, a veces no. Devolver `null` obliga a cada llamador a recordar la comprobación; olvidarla produce `NullPointerException` en otro lugar, lejos del origen.

**Concepto clave / modelo mental**

`Optional<T>` representa “puede haber un valor o no”. No es un reemplazo para todos los nulls; úsalo principalmente como tipo de retorno cuando la ausencia es un resultado esperado.

Métodos clave:

| Método | Uso |
|---|---|
| `Optional.of(value)` | Valor no nulo |
| `Optional.ofNullable(value)` | Valor que puede ser nulo |
| `Optional.empty()` | Ausencia |
| `orElse(default)` | Valor por defecto |
| `orElseThrow()` | Falla si no hay valor |
| `map/flatMap/filter` | Transformar si hay valor |

**Implementación desde cero**

```java
import java.util.*;

public class DemoOptional {
    record Usuario(String email, String nombre) {}

    static Optional<Usuario> buscar(String email, List<Usuario> usuarios) {
        return usuarios.stream()
            .filter(u -> u.email().equalsIgnoreCase(email))
            .findFirst();
    }

    public static void main(String[] args) {
        List<Usuario> usuarios = List.of(
            new Usuario("ada@example.com", "Ada"),
            new Usuario("linus@example.com", "Linus")
        );

        String nombre = buscar("ada@example.com", usuarios)
            .map(Usuario::nombre)
            .orElse("DESCONOCIDO");
        System.out.println(nombre);

        String otro = buscar("nadie@example.com", usuarios)
            .map(Usuario::nombre)
            .orElse("DESCONOCIDO");
        System.out.println(otro);

        try {
            buscar("nadie@example.com", usuarios).orElseThrow();
        } catch (NoSuchElementException e) {
            System.out.println("No encontrado");
        }
    }
}
```

**Desglose del código**

- `findFirst()` ya devuelve `Optional`; encaja natural con búsquedas.
- `map` transforma solo si hay valor; si está vacío, sigue vacío.
- `orElse` da un valor por defecto. `orElseThrow` hace explícito que la ausencia es excepcional en ese contexto.
- Evita `Optional.get()` sin comprobar; pierde el beneficio del tipo.

**Ejecución y salida real**

```text
Ada
DESCONOCIDO
No encontrado
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `NoSuchElementException` con `get()` | Llamaste `get()` sin verificar | Usa `orElse`, `orElseThrow`, `ifPresent` o `map` |
| `Optional` como campo/parametro por todas partes | Sobreuso | Úsalo principalmente en retornos; evalúa el caso |
| `orElse` ejecuta código costoso siempre | `orElse` evalúa el argumento | Usa `orElseGet` para cálculo perezoso |

**Verificación rápida**

```bash
javac DemoOptional.java && java DemoOptional
```

Prueba `orElseThrow(() -> new IllegalArgumentException("Email no encontrado"))` para dar un error de dominio más claro.

### Tema 3: Stream Gatherers (Java 24) · Avanzado · 40 min

**Caso guía**

Necesitas ventanas deslizantes de 3 elementos para detectar picos, o agrupar por lotes fijos. Con `map/filter/reduce` puro puedes hacerlo, pero el código queda retorcido. Los gatherers añaden operaciones intermedias personalizadas al pipeline.

> **Nota de versión:** `Stream.gather()` y `Gatherers` son características de Java 24+. Verifica con `javac -version`.

**Concepto clave / modelo mental**

Un gatherer es una operación intermedia personalizada. Java incluye gatherers útiles en `java.util.stream.Gatherers`:

| Gatherer | Qué hace |
|---|---|
| `windowFixed(n)` | Agrupa en ventanas fijas de tamaño `n` |
| `windowSliding(n)` | Ventanas deslizantes de tamaño `n` |
| `fold(...)` | Acumulación con estado |
| `scan(...)` | Acumulación emitiendo estados intermedios |
| `mapConcurrent(...)` | Mapeo concurrente con límite |

**Implementación desde cero**

```java
import java.util.List;
import java.util.stream.Gatherers;

public class DemoGatherers {
    public static void main(String[] args) {
        List<Integer> valores = List.of(1, 2, 3, 4, 5);

        var ventanas = valores.stream()
            .gather(Gatherers.windowSliding(3))
            .toList();
        System.out.println(ventanas);

        var lotes = valores.stream()
            .gather(Gatherers.windowFixed(2))
            .toList();
        System.out.println(lotes);
    }
}
```

**Desglose del código**

- `windowSliding(3)` produce `[1,2,3], [2,3,4], [3,4,5]`.
- `windowFixed(2)` produce `[1,2], [3,4], [5]`.
- `gather(...)` se integra en el pipeline como cualquier operación intermedia.
- Si tu JDK es anterior a 24, esta API no existe; la alternativa es implementar la lógica con un colector personalizado o bucle explícito.

**Ejecución y salida real**

En JDK 24+:

```text
[[1, 2, 3], [2, 3, 4], [3, 4, 5]]
[[1, 2], [3, 4], [5]]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `cannot find symbol Gatherers` | JDK < 24 | Actualiza JDK o usa alternativa con bucle/colector |
| Ventana más grande que el stream | Resultado vacío o menor al esperado, según gatherer | Valida tamaño de entrada |
| Usas gatherer para algo que `map/filter` resuelve | Sobreingeniería | Prefiere operaciones estándar cuando alcancen |

**Verificación rápida**

```bash
javac DemoGatherers.java && java DemoGatherers
```

Si no tienes JDK 24+, valida la lógica equivalente con bucles y deja el gatherer como versión objetivo.

### Tema 4: Streams paralelos y referencias a métodos · Intermedio · 35 min

**Contexto y para qué sirve**

`parallelStream()` promete usar varios núcleos, pero no siempre mejora el rendimiento. En colecciones pequeñas, operaciones baratas o fuentes difíciles de dividir, el overhead puede hacerla más lenta. La regla es medir.

**Concepto clave / modelo mental**

Un stream paralelo divide el trabajo en subtareas y las ejecuta en el ForkJoinPool común. Funciona mejor cuando:

- hay muchos datos;
- cada operación es costosa;
- la fuente se divide bien (`ArrayList`, arrays);
- no hay estado mutable compartido.

Evítalo cuando hay I/O bloqueante, orden estricto importante o colecciones pequeñas.

**Implementación desde cero**

```java
import java.util.*;
import java.util.stream.*;

public class DemoParallel {
    public static void main(String[] args) {
        List<Integer> datos = IntStream.rangeClosed(1, 1_000_000)
            .boxed().toList();

        long t1 = System.nanoTime();
        long sumaSec = datos.stream().mapToLong(Integer::longValue).sum();
        long t2 = System.nanoTime();

        long t3 = System.nanoTime();
        long sumaPar = datos.parallelStream().mapToLong(Integer::longValue).sum();
        long t4 = System.nanoTime();

        System.out.println(sumaSec == sumaPar);
        System.out.println("sec ms: " + (t2 - t1) / 1_000_000);
        System.out.println("par ms: " + (t4 - t3) / 1_000_000);
    }
}
```

**Desglose del código**

- `Integer::longValue` es una referencia a método; equivalente a `x -> x.longValue()`.
- Comparamos el resultado, no solo el tiempo: la paralelización no debe cambiar la corrección.
- La medición simple con `nanoTime` es orientativa. Para benchmarks serios usa JMH.
- `parallelStream()` usa el pool común; tareas bloqueantes pueden afectar otras partes del proceso.

**Ejecución y salida real**

```text
true
sec ms: 12
par ms: 8
```

Los tiempos varían por máquina, carga y calentamiento de JVM.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Resultado incorrecto en paralelo | Estado mutable compartido | Evita mutar estado externo; usa collectors thread-safe |
| Paralelo más lento | Overhead mayor que el trabajo | Mide y mantén secuencial si gana |
| Bloqueas otras tareas | Uso de ForkJoinPool común con I/O bloqueante | Usa otro mecanismo de concurrencia |

**Verificación rápida**

```bash
javac DemoParallel.java && java DemoParallel
```

Ejecuta varias veces. Si el paralelo no gana consistentemente, no lo uses: la simplicidad secuencial es mejor.

## Cierre del módulo

Puedes transformar colecciones con streams, expresar ausencia con `Optional`, aplicar gatherers cuando el pipeline lo justifica y evaluar paralelismo con medición. El próximo módulo entra en concurrencia: hilos, virtual threads y coordinación segura de tareas.
