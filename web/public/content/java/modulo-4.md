# Módulo 4: Streams y programación funcional


**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

### Tema 1: Stream API — map, filter, reduce, collect · Básico · 45 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** reemplazar un bucle manual con acumulador por un pipeline declarativo de `filter`/`map`/`collect`.

#### Aprende

Un reporte necesita los nombres de todas las entregas activas de una lista, y el total de tarifas cobradas; escribirlo con bucles manuales y variables acumuladoras oculta la intención detrás de la mecánica de iteración.

**¿Por qué es importante?** El estilo declarativo de Streams describe qué transformación se desea en vez de los detalles mecánicos de iteración manual, y su evaluación perezosa (solo disparada por la operación terminal) evita crear colecciones intermedias innecesarias entre cada paso de la cadena.

`filter`/`map` son operaciones intermedias perezosas; `collect`/`sum` son terminales y disparan la ejecución completa en una única pasada.

Un stream describe una secuencia de operaciones a aplicar sobre una colección de forma declarativa: `personas.stream().filter(p -> p.getEdad() >= 18).map(Persona::getNombre).collect(Collectors.toList())` expresa directamente "filtra las personas mayores de edad, transforma cada una a su nombre, y recolecta el resultado en una lista", en vez de escribir manualmente un bucle imperativo con una lista auxiliar acumulando resultados paso a paso, un estilo que se enfoca en describir qué transformación se desea, no en los detalles mecánicos de cómo iterar y acumular.

`filter` y `map` son operaciones intermedias: no ejecutan nada por sí solas, sino que describen un paso de la cadena, devolviendo un nuevo stream sobre el que se puede seguir encadenando más operaciones; `collect` (o `reduce`, `sum`, `count`, y similares) es una operación terminal, la que efectivamente dispara la ejecución de todo el pipeline completo de operaciones intermedias descritas previamente, procesando cada elemento de la colección original una única vez a través de toda la cadena, en vez de crear colecciones intermedias completas entre cada paso (`filter` no produce una lista filtrada completa antes de que `map` empiece; ambas operaciones se aplican elemento por elemento en una única pasada perezosa, disparada únicamente por la operación terminal final). `reduce()` (`empleados.stream().mapToDouble(Empleado::getSalario).sum()`) combina todos los elementos del stream en un único resultado acumulado, apropiado para agregaciones como sumas, máximos, o concatenaciones.

**Analogía:** un pipeline de streams es como una línea de ensamblaje donde cada estación (`filter`, `map`) realiza su transformación específica sobre cada pieza a medida que pasa, sin necesidad de esperar a que todas las piezas completen una estación antes de que la siguiente estación comience a trabajar con las primeras piezas ya procesadas; la operación terminal es la que efectivamente enciende la línea de ensamblaje completa.

**Conceptos clave:** pipeline declarativo, operaciones intermedias vs terminales.

**Código del ejemplo:**

```java
List<String> nombresMayores = personas.stream()
    .filter(p -> p.getEdad() >= 18)
    .map(Persona::getNombre)
    .collect(Collectors.toList());

double totalSalarios = empleados.stream()
    .mapToDouble(Empleado::getSalario)
    .sum();
```

Reemplazar bucles manuales por pipelines de Streams es el estilo que usarás en cada reporte o agregación del proyecto integrador de este track.

**Cuándo no usarlo:** un pipeline de Streams con varios `map`/`filter` encadenados puede ser más difícil de depurar paso a paso que un bucle explícito; para lógica con múltiples condiciones interdependientes o que necesita romper la iteración a mitad de camino, un bucle `for` tradicional puede seguir siendo más claro.

**Implicación práctica:** Un pipeline declarativo solo es más claro que un bucle manual si de verdad describe la transformación sin ocultar efectos secundarios dentro de un `map` o `filter` que debería ser una función pura.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-stream-pipeline
cd ejemplo-stream-pipeline
mkdir -p src/main/java/academia/streams
```

**Crea** `src/main/java/academia/streams/ReporteEntregas.java` con una lista de entregas (activa/inactiva, con tarifa) y dos versiones del mismo cálculo: una con bucle `for` manual y acumulador, otra con `stream().filter().map().collect()`:

```java
package academia.streams;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

record Entrega(String id, boolean activa, double tarifa) {}

public final class ReporteEntregas {
    public static void main(String[] args) {
        List<Entrega> entregas = List.of(
            new Entrega("E-001", true, 12.5),
            new Entrega("E-002", false, 8.0),
            new Entrega("E-003", true, 15.75),
            new Entrega("E-004", true, -3.0));

        List<String> activasBucle = new ArrayList<>();
        double totalBucle = 0;
        for (Entrega entrega : entregas) {
            if (entrega.activa()) {
                activasBucle.add(entrega.id());
            }
            totalBucle += entrega.tarifa();
        }

        List<String> activasStream = entregas.stream()
            .filter(Entrega::activa)
            .map(Entrega::id)
            .collect(Collectors.toList());

        double totalStream = entregas.stream()
            .mapToDouble(Entrega::tarifa)
            .sum();

        System.out.println("Activas (bucle):  " + activasBucle);
        System.out.println("Activas (stream): " + activasStream);
        System.out.println("Total (bucle):    " + totalBucle);
        System.out.println("Total (stream):   " + totalStream);
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/streams/ReporteEntregas.java
java -cp out academia.streams.ReporteEntregas
```

**Resultado esperado:** las dos versiones imprimen la misma lista de entregas activas (`E-001`, `E-003`, `E-004`) y el mismo total (`33.25`); la tarifa negativa aparece sumada en ambos casos.

**Fallo deliberado:** agrega deliberadamente un elemento con tarifa negativa para provocar un fallo de expectativa en el total; confirma que ambas versiones (bucle y stream) lo suman igual, y decide si el filtro debería excluir tarifas inválidas.

**Pista:** el resultado de `filter` no se materializa en una lista hasta que el pipeline encuentra su operación terminal; si colocas un punto de interrupción en el `filter`, verás que no se ejecuta hasta llegar a `collect` o `sum`.

**Si falla.** Si las dos versiones muestran listas distintas, el predicado del stream no coincide con la condición del `for`. Si `Collectors` no se resuelve, falta `import java.util.stream.Collectors;`. Si el total del stream difiere del bucle, revisa que `mapToDouble` recorra la misma lista completa y no solo las activas.

#### Aplica

Agrega `Collectors.groupingBy` para agrupar las entregas por estado, y `reduce` para calcular el total de tarifas sin usar `sum()`; confirma que el resultado de `reduce` coincide con el de `mapToDouble().sum()`.

**Checklist de salida.**

- [ ] `ReporteEntregas.java` compila sin advertencias con `javac -d out`.
- [ ] La versión con bucle y la versión con stream imprimen la misma lista de activas.
- [ ] Los dos totales coinciden, incluida la tarifa negativa.
- [ ] `groupingBy` separa las entregas activas de las inactivas.
- [ ] `reduce` produce el mismo total que `mapToDouble().sum()`.
- [ ] Explicas por qué el pipeline no crea una lista intermedia entre `filter` y `map`.

**Si falla.** Si `groupingBy` devuelve un mapa con claves inesperadas, revisa que la función de clasificación devuelva `entrega.activa()` y no el objeto completo. Si `reduce` da un tipo distinto de `Double`, usa `reduce(0.0, Double::sum)` como forma explícita.

Guarda ambas versiones (bucle y stream), la comparación de resultados y el agrupamiento por estado.

**Errores comunes:** mutar una variable externa al stream desde dentro de un `map`/`forEach` (efecto secundario oculto), reutilizar el mismo stream dos veces (lanza `IllegalStateException`, un stream solo se consume una vez), y usar `forEach` con lógica compleja cuando `collect`/`reduce` expresarían mejor la intención.

**Fuente oficial:** [dev.java: Streams](https://dev.java/learn/api/streams/) y [Java API: Stream](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html).

---

### Tema 2: Optional — evitar null explícitamente · Intermedio · 40 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** reemplazar un método que devuelve `null` por uno que devuelve `Optional`, forzando al llamador a decidir explícitamente qué hacer ante la ausencia.

#### Aprende

Buscar una entrega por id en una lista puede no encontrar ninguna coincidencia; devolver `null` en ese caso deja que cualquier consumidor olvide verificarlo y provoque un `NullPointerException` mucho más adelante, lejos de la causa real.

**¿Por qué es importante?** `Optional` obliga, en el propio tipo de retorno, a que el código que llama considere explícitamente el caso de ausencia de valor, reemplazando con ventaja la práctica de devolver `null` directamente y confiar en que se verifique manualmente sin ninguna garantía del compilador.

`Optional<T>` como tipo de retorno obliga, en el propio sistema de tipos, a considerar el caso "no hay valor" antes de compilar.

`Optional<Persona> buscarPorId(int id) { return personas.stream().filter(p -> p.getId() == id).findFirst(); }` devuelve un `Optional<Persona>` en vez de devolver directamente `Persona` (que podría ser `null` si no se encuentra ningún resultado): esta diferencia en el tipo de retorno obliga, en el propio sistema de tipos, a que cualquier código que invoque este método considere explícitamente el caso "no hay valor", en vez de descubrir esa ausencia únicamente en producción mediante un `NullPointerException` inesperado al intentar usar un valor que resultó ser `null` sin haberlo verificado previamente.

`buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"))` es una de las formas explícitas de manejar el caso vacío de un `Optional`, lanzando una excepción con un mensaje claro y específico si efectivamente no hay valor presente; otras alternativas incluyen `orElse(valorPorDefecto)` (proporcionar un valor de reemplazo), `orElseGet(() -> calcular())` (calcular un valor de reemplazo solo si es necesario, de forma perezosa), o `ifPresent(valor -> usar(valor))` (ejecutar una acción solo si hay un valor presente, sin lanzar ninguna excepción). Cualquiera de estas formas obliga a una decisión explícita sobre qué hacer ante la ausencia de valor, en contraste con simplemente devolver `null` y confiar (sin ninguna garantía del compilador) en que quien llama recuerde verificarlo antes de usarlo.

**Analogía:** `Optional` es como una caja que explícitamente puede estar vacía o contener un objeto, obligando a quien la recibe a abrir la caja y verificar su contenido antes de intentar usarlo; devolver `null` directamente es como entregar algo que podría ser el objeto real o simplemente nada, sin ninguna indicación visible de cuál de los dos casos es, hasta que se intenta usar y potencialmente falla.

**Conceptos clave:** ausencia de valor explícita en el tipo, `orElseThrow`.

**Código del ejemplo:**

```java
Optional<Persona> buscarPorId(int id) {
    return personas.stream().filter(p -> p.getId() == id).findFirst();
}
Persona persona = buscarPorId(5).orElseThrow(() -> new NoSuchElementException("No encontrado"));
```

Cada búsqueda que puede no encontrar resultado en el proyecto integrador de este track (`buscarPorId`, `buscarPorEmail`) debería devolver `Optional`, nunca `null`.

**Cuándo no usarlo:** usar `Optional` como tipo de un campo de una clase o como parámetro de un método (en vez de como tipo de retorno) es un uso desaconsejado que la propia documentación de Java señala; su diseño está pensado específicamente para valores de retorno que pueden estar ausentes.

**Implicación práctica:** `Optional` como tipo de retorno obliga, en el propio sistema de tipos, a que el código que llama considere explícitamente el caso de ausencia antes de compilar, en vez de descubrirlo en producción con un `NullPointerException`.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-optional-busqueda
cd ejemplo-optional-busqueda
mkdir -p src/main/java/academia/busqueda
```

**Crea** `src/main/java/academia/busqueda/RepositorioEntregas.java` con un método `buscarPorId(int id)` que devuelva `Optional<Entrega>`, y un `Main` que lo consuma con `orElseThrow`:

```java
package academia.busqueda;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

record Entrega(int id, String destino) {}

public final class RepositorioEntregas {
    private final List<Entrega> entregas = List.of(
        new Entrega(1, "Centro"),
        new Entrega(2, "Norte"));

    Optional<Entrega> buscarPorId(int id) {
        return entregas.stream().filter(entrega -> entrega.id() == id).findFirst();
    }
}

final class Main {
    public static void main(String[] args) {
        RepositorioEntregas repositorio = new RepositorioEntregas();

        System.out.println("Id 1: " + repositorio.buscarPorId(1)
            .orElseThrow(() -> new NoSuchElementException("No encontrado")));

        try {
            repositorio.buscarPorId(99)
                .orElseThrow(() -> new NoSuchElementException("No encontrado"));
        } catch (NoSuchElementException e) {
            System.out.println("Id 99: " + e.getMessage());
        }
    }
}
```

**Ejecuta el ejemplo** con un id existente y uno inexistente:

```bash
javac -d out src/main/java/academia/busqueda/RepositorioEntregas.java
java -cp out academia.busqueda.Main
```

**Resultado esperado:** el id 1 imprime la entrega con destino `Centro`; el id 99 imprime `Id 99: No encontrado` desde el `catch`, sin terminar el programa con una traza.

**Fallo deliberado:** cambia deliberadamente la firma a que devuelva `Entrega` directamente (pudiendo ser `null`); invoca un método sobre el resultado sin verificar y observa el `NullPointerException`.

**Pista:** el compilador no distingue entre un `Entrega` válido y uno `null`; solo `Optional` obliga a escribir qué hacer cuando no hay valor.

**Si falla.** Si `buscarPorId(1)` lanza `NoSuchElementException`, compara el id buscado con el que guarda el registro. Si el `catch` no se ejecuta para el id 99, revisa que la búsqueda realmente no encuentre coincidencias. Si el compilador rechaza `orElseThrow` con un proveedor, confirma que el lambda devuelve una excepción y no un valor.

#### Aplica

Agrega `orElse(entregaPorDefecto)` y `orElseGet(() -> calcularAlternativa())` como dos formas adicionales de manejar la ausencia, y explica en qué caso usarías cada una de las tres.

**Checklist de salida.**

- [ ] `RepositorioEntregas.java` compila y se ejecuta con `java -cp out academia.busqueda.Main`.
- [ ] Un id existente devuelve la entrega correspondiente sin excepción.
- [ ] Un id inexistente se maneja de forma explícita con un mensaje claro.
- [ ] `orElse` y `orElseGet` están implementados y producen el valor esperado.
- [ ] Provocaste el `NullPointerException` al devolver `null` directamente.
- [ ] Explicas por qué `Optional` no debería usarse como tipo de campo.

**Si falla.** Si `orElseGet` se evalúa aunque el valor esté presente, revisa que reciba un `Supplier` y no una llamada ya ejecutada. Si el `NullPointerException` no aparece al devolver `null`, estás usando todavía la versión con `Optional`.

Guarda el repositorio, las tres formas de manejar ausencia y el `NullPointerException` provocado al usar `null`.

**Errores comunes:** llamar `.get()` sobre un `Optional` sin verificar `isPresent()` antes (lanza `NoSuchElementException` igual que un `null` no verificado lanzaría `NullPointerException`), usar `Optional` como tipo de un campo o parámetro en vez de como tipo de retorno, y envolver en `Optional` un valor que en realidad nunca debería estar ausente.

**Fuente oficial:** [dev.java: Streams](https://dev.java/learn/api/streams/) y [Java API: Stream](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html).

---

### Tema 3: Streams paralelos y referencias a métodos · Intermedio · 45 min

**Prerrequisito:** JDK 27 y un editor. Comprueba `java --version`.

**Al terminar podrás:** medir si `parallelStream()` realmente mejora el rendimiento frente a `stream()` en un caso concreto, en vez de asumirlo.

#### Aprende

Verificar si un número grande es primo para una lista de un millón de candidatos es CPU-intensivo y sin efectos secundarios compartidos; es exactamente el tipo de operación donde vale la pena medir si paralelizar realmente ayuda.

**¿Por qué es importante?** Un stream paralelo solo mejora el rendimiento con datasets grandes y operaciones CPU-intensivas sin efectos secundarios compartidos; usarlo indiscriminadamente en casos pequeños o simples puede empeorar el rendimiento por el overhead de coordinación.

`parallelStream()` divide el trabajo entre varios hilos gestionados por `ForkJoinPool.commonPool()`; el overhead de dividir y recombinar solo se justifica con datasets grandes y operaciones CPU-intensivas.

`numeros.parallelStream().filter(this::esPrimo).count()` divide el procesamiento del stream entre múltiples hilos automáticamente gestionados por el framework de streams (usando internamente el mismo pool de hilos compartido `ForkJoinPool.commonPool()`), apropiado específicamente para datasets grandes combinados con operaciones genuinamente intensivas en CPU y sin efectos secundarios compartidos entre los elementos procesados (dado que la paralelización introduce el riesgo de condiciones de carrera si las operaciones del stream modifican estado compartido mutable, Módulo 5).

Para colecciones pequeñas, o para operaciones simples y rápidas, el overhead de coordinar la división del trabajo entre múltiples hilos y de recombinar los resultados parciales al final supera cualquier ganancia teórica de paralelización, resultando frecuentemente en un rendimiento peor que el equivalente secuencial (`stream()`, sin paralelizar); medir con datos reales del caso específico (en vez de asumir que "paralelo siempre es más rápido") es la única forma confiable de determinar si `parallelStream()` efectivamente aporta un beneficio neto en una situación concreta.

Las referencias a métodos (`Persona::getNombre`, equivalente exacto a la lambda `p -> p.getNombre()`) son una forma más concisa de expresar una lambda que simplemente invoca un método existente sobre su argumento, sin agregar ninguna lógica adicional propia, siendo preferibles por legibilidad en ese caso específico frente a escribir la lambda completa de forma explícita.

**Analogía:** un stream paralelo es como dividir una tarea grande entre varios trabajadores que luego deben coordinarse para combinar sus resultados parciales; para una tarea pequeña, el tiempo de organizar esa división y coordinación entre trabajadores puede superar fácilmente el tiempo que hubiera tomado simplemente completar la tarea uno mismo sin ayuda adicional.

**Conceptos clave:** `parallelStream()`, overhead de paralelización, `Clase::metodo`.

**Código del ejemplo:**

```java
long conteo = numeros.parallelStream().filter(this::esPrimo).count();
// Útil solo para datasets grandes y operaciones CPU-intensivas sin efectos secundarios

.map(Persona::getNombre)   // equivalente a .map(p -> p.getNombre())
```

Antes de paralelizar cualquier procesamiento pesado del proyecto integrador de este track, medirás igual que aquí si el dataset y la operación justifican el overhead de `parallelStream()`.

**Cuándo no usarlo:** `parallelStream()` no aporta nada (y puede empeorar el rendimiento) para colecciones pequeñas, operaciones rápidas, o pipelines con efectos secundarios sobre estado compartido mutable — en ese último caso además introduce condiciones de carrera reales (Módulo 5).

**Implicación práctica:** El beneficio de `parallelStream()` depende del tamaño real del dataset y del costo de la operación, nunca es automático — medir con datos reales es la única forma confiable de saber si realmente ayuda en un caso concreto.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-parallel-stream
cd ejemplo-parallel-stream
mkdir -p src/main/java/academia/paralelo
```

**Crea** `src/main/java/academia/paralelo/ContarPrimos.java` con un método `esPrimo(long n)` y mide, con `System.nanoTime()`, cuánto tarda contar los primos entre 2 y 2 000 000 usando `stream()` frente a `parallelStream()`:

```java
package academia.paralelo;

import java.util.stream.LongStream;

public final class ContarPrimos {
    static boolean esPrimo(long n) {
        if (n < 2) {
            return false;
        }
        for (long divisor = 2; divisor * divisor <= n; divisor++) {
            if (n % divisor == 0) {
                return false;
            }
        }
        return true;
    }

    static long contar(long desde, long hasta, boolean paralelo) {
        LongStream rango = LongStream.rangeClosed(desde, hasta);
        return (paralelo ? rango.parallel() : rango)
            .filter(ContarPrimos::esPrimo)
            .count();
    }

    public static void main(String[] args) {
        long desde = 2;
        long hasta = 2_000_000;

        long inicioSecuencial = System.nanoTime();
        long primosSecuencial = contar(desde, hasta, false);
        long finSecuencial = System.nanoTime();

        long inicioParalelo = System.nanoTime();
        long primosParalelo = contar(desde, hasta, true);
        long finParalelo = System.nanoTime();

        System.out.printf("stream:         %d primos en %.0f ms%n",
            primosSecuencial, (finSecuencial - inicioSecuencial) / 1_000_000.0);
        System.out.printf("parallelStream: %d primos en %.0f ms%n",
            primosParalelo, (finParalelo - inicioParalelo) / 1_000_000.0);
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/paralelo/ContarPrimos.java
java -cp out academia.paralelo.ContarPrimos
```

**Resultado esperado:** ambos conteos son iguales (`148 933` primos hasta 2 000 000) y, en una máquina con varios núcleos, la línea `parallelStream` suele mostrar un tiempo menor que `stream`; la diferencia exacta depende del hardware.

**Fallo deliberado:** repite la misma medición con un rango pequeño (2 a 100) para provocar un fallo de expectativa; en ese caso `parallelStream()` puede ser igual de lento o más lento que `stream()`.

**Pista:** el tiempo de la primera ejecución incluye la inicialización de la JVM; ejecuta el programa dos o tres veces antes de sacar conclusiones de la comparación.

**Si falla.** Si los dos conteos difieren, el predicado o el rango cambian entre llamadas. Si `parallelStream` siempre tarda más incluso con 2 000 000, comprueba cuántos núcleos tiene la máquina y si el contenedor limita el paralelismo. Si la compilación falla en `LongStream.rangeClosed`, revisa que el import sea `java.util.stream.LongStream`.

#### Aplica

Reemplaza las lambdas `n -> esPrimo(n)` por la referencia a método `this::esPrimo`, y confirma que el comportamiento y el tiempo medido no cambian, solo la legibilidad del código.

**Checklist de salida.**

- [ ] `ContarPrimos.java` compila y se ejecuta con `javac` y `java -cp out`.
- [ ] Los conteos secuencial y paralelo coinciden.
- [ ] La medición usa `System.nanoTime()` y reporta milisegundos.
- [ ] Repetiste la medición con el rango 2 a 100 y observaste la diferencia.
- [ ] `this::esPrimo` sustituye la lambda sin cambiar el resultado.
- [ ] Explicas por qué el tamaño del dataset decide si conviene paralelizar.

**Si falla.** Si `this::esPrimo` no compila desde `main`, recuerda que `esPrimo` es estático y la referencia correcta es `ContarPrimos::esPrimo`. Si el tiempo varía demasiado entre ejecuciones, repite la medición y compara el orden de magnitud, no el milisegundo exacto.

Guarda ambas mediciones (rango grande y pequeño) y la conclusión sobre cuándo paraleliza realmente.

**Errores comunes:** asumir que `parallelStream()` siempre es más rápido sin medir, paralelizar un pipeline con efectos secundarios sobre estado compartido mutable (introduce condiciones de carrera reales), y paralelizar una colección pequeña donde el overhead de coordinación supera cualquier beneficio.

**Fuente oficial:** [dev.java: Streams](https://dev.java/learn/api/streams/) y [Java API: Stream](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html).

---

### Tema 4: Stream Gatherers (Java 24) · Avanzado · 50 min

**Prerrequisito:** JDK 24+ y el Tema 1 de este módulo. Comprueba `java --version`.

**Al terminar podrás:** usar `Stream.gather()` con `Gatherers.windowSliding(3)` para detectar 3 entregas consecutivas atrasadas en un stream de registros de entrega, algo que `filter`/`map` no pueden expresar porque solo ven un elemento a la vez.

#### Aprende

El equipo quiere alertar cuando un conductor acumula 3 entregas atrasadas consecutivas (no 3 atrasadas en cualquier orden); `filter(this::estaAtrasada)` solo puede filtrar elementos individuales, perdiendo por completo la relación de orden/vecindad entre ellos.

**¿Por qué es importante?** Porque una transformación declarativa puede hacer visible la regla, pero solo si la operación elegida puede expresar genuinamente la relación entre elementos que el caso real requiere.

`Stream.gather()` (finalizado en Java 24) permite definir operaciones intermedias personalizadas con estado propio entre elementos, algo que `map`/`filter`/`reduce` no permiten porque procesan cada elemento de forma aislada; `Gatherers.windowSliding(n)` agrupa cada `n` elementos consecutivos en una ventana deslizante.

`Stream.gather()` completa la API de Streams agregando la capacidad de definir operaciones intermedias con estado propio entre elementos consecutivos; `Gatherers` (la clase utilitaria con implementaciones estándar) incluye `windowSliding(n)` para ventanas deslizantes de tamaño fijo, `windowFixed(n)` para ventanas no superpuestas, y `fold` para una reducción con estado acumulado explícito paso a paso.

**Analogía:** procesar un stream con `filter`/`map` es como revisar una fila de personas de una en una sin memoria de quién pasó antes; un gatherer como `windowSliding` es como mirar siempre a las últimas 3 personas juntas, permitiendo detectar un patrón que depende genuinamente de la relación entre elementos vecinos.

**Conceptos clave:** Stream.gather(), Gatherers.windowSliding, estado entre elementos vecinos, operación intermedia personalizada.

**Código del ejemplo:**

```java
List<List<Entrega>> ventanas = entregas.stream()
    .gather(Gatherers.windowSliding(3))
    .filter(ventana -> ventana.stream().allMatch(Entrega::estaAtrasada))
    .toList();
```

Cada regla de negocio del proyecto integrador de este track que dependa de la relación entre elementos consecutivos (ej. detectar una racha de reintentos fallidos) se beneficia de un gatherer en vez de intentar forzarla con filter/map puro.

**Cuándo no usarlo:** para una transformación elemento por elemento sin ninguna relación de vecindad u orden entre ellos, `map`/`filter` siguen siendo más simples y claros que definir o usar un gatherer.

**Diagrama:** [Ventanas deslizantes con Stream Gatherers](../../visuals/temas/java/modulo-4-tema-4-gatherers-window-sliding.html)

**Implicación práctica:** `Stream.gather()` permite expresar declarativamente operaciones que dependen de la relación entre elementos consecutivos, algo que `map`/`filter`/`reduce` no pueden expresar por sí solos.

#### Practica

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-gatherers
cd ejemplo-gatherers
mkdir -p src/main/java/academia/streams
```

**Crea** `src/main/java/academia/streams/DetectorAtrasos.java`:

```java
package academia.streams;

import java.util.List;
import java.util.stream.Gatherers;

record Entrega(String id, boolean atrasada) {
    boolean estaAtrasada() {
        return atrasada;
    }
}

public final class DetectorAtrasos {
    public static void main(String[] args) {
        List<Entrega> entregas = List.of(
            new Entrega("E1", false),
            new Entrega("E2", true),
            new Entrega("E3", true),
            new Entrega("E4", true),
            new Entrega("E5", false));

        List<List<Entrega>> ventanas = entregas.stream()
            .gather(Gatherers.windowSliding(3))
            .filter(ventana -> ventana.stream().allMatch(Entrega::estaAtrasada))
            .toList();

        ventanas.forEach(ventana ->
            System.out.println(ventana.stream().map(Entrega::id).toList()));
    }
}
```

**Ejecuta el ejemplo:**

```bash
javac -d out src/main/java/academia/streams/DetectorAtrasos.java
java -cp out academia.streams.DetectorAtrasos
```

**Resultado esperado:** se imprime una única ventana, `[E2, E3, E4]`: las tres entregas atrasadas consecutivas. La racha no incluye `E1` ni `E5`, que están a tiempo.

**Alternativa con Maven o Gradle:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

**Fallo deliberado:** reemplaza `gather(Gatherers.windowSliding(3))` por un simple `filter(Entrega::estaAtrasada)` "para simplificar". Ahora el pipeline detecta cualquier entrega atrasada individual, sin importar si forma parte de una racha consecutiva o es un caso aislado entre entregas a tiempo, generando alertas de "racha de 3 atrasos" para conductores que en realidad tuvieron un solo atraso ocasional.

**Pista:** con la secuencia `E1 a tiempo, E2–E4 atrasadas, E5 a tiempo`, el pipeline correcto devuelve una sola ventana; el `filter` simplificado devuelve tres elementos sueltos y pierde la noción de racha.

**Si falla.** Si `Gatherers` no se resuelve, estás compilando con un JDK anterior a 24. Si la ventana esperada no aparece, comprueba que las tres entregas consecutivas tengan `atrasada` en `true` y que el orden de la lista sea el de llegada. Si el `record` no compila, revisa que el archivo se llame como la clase pública y que el JDK sea 17 o superior.

#### Aplica

Corrige el paso anterior restaurando `gather(Gatherers.windowSliding(3))`, y agrega una prueba con una secuencia mixta (a tiempo, atrasada, a tiempo, atrasada, atrasada, atrasada) confirmando que solo se detecta la racha real de 3 consecutivas al final.

**Checklist de salida.**

- [ ] `DetectorAtrasos.java` compila con JDK 24 o superior.
- [ ] La secuencia `E1–E5` imprime solo la ventana `[E2, E3, E4]`.
- [ ] El `filter` simplificado detecta atrasos aislados y pierde la racha.
- [ ] La secuencia mixta detecta solo las tres últimas entregas consecutivas.
- [ ] El diagrama de ventanas deslizantes se abre y coincide con la salida.
- [ ] Explicas qué lógica de vecindad no pueden expresar `filter`/`map`.

**Si falla.** Si la secuencia mixta produce más de una ventana, revisa que `allMatch` exija las tres entregas atrasadas y no solo una. Si el diagrama no carga, verifica la ruta `../../visuals/temas/java/modulo-4-tema-4-gatherers-window-sliding.html` desde el módulo.

Entrega el pipeline con `Gatherers.windowSliding` del paso de práctica, la detección de atrasos aislados sin relación de orden del fallo deliberado, y la prueba con secuencia mixta; explica qué tipo de lógica (que depende de la relación entre elementos vecinos) `filter`/`map` no pueden expresar pero un gatherer sí.

**Errores comunes:** intentar resolver lógica de ventana/vecindad con filter/map puro, usar gather() para transformaciones simples que map ya resuelve, y no considerar el costo de materializar cada ventana como una lista nueva.

**Fuente oficial:** [JEP 485: Stream Gatherers](https://openjdk.org/jeps/485) y [Java Core Libraries: Stream Gatherers](https://docs.oracle.com/en/java/javase/24/core/stream-gatherers.html).

---

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un pipeline de procesamiento de datos con Streams que reemplace loops manuales.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Filtrar y transformar con `filter`/`map`/`collect` | Ver Tema 1 | Reemplaza un loop manual equivalente |
| 2 | Sumar con `reduce`/`mapToDouble().sum()` | Ver Tema 1 | Agregación declarativa |
| 3 | Reemplazar un método que devuelve `null` por `Optional` | Ver Tema 2 | Maneja el caso vacío con `orElseThrow` |
| 4 | Comparar `stream()` vs `parallelStream()` con datos grandes | Ver Tema 3 | Mide el tiempo real, no asumas |
| 5 | Reemplazar lambdas verbosas por referencias a métodos | Ver Tema 3 | Donde aplique directamente |
| 6 | Detectar una racha con `Gatherers.windowSliding` | Ver Tema 4 | Lógica que `filter`/`map` no pueden expresar |

**Verificación:** el laboratorio se considera exitoso si el pipeline con Streams produce el mismo resultado que el loop manual equivalente, si la comparación de `stream()` vs `parallelStream()` incluye una medición real de tiempo, y si el gatherer detecta correctamente solo las rachas reales de 3 elementos consecutivos.

**Errores comunes y soluciones**

- **Usar `parallelStream()` para colecciones pequeñas.** El overhead de coordinación puede superar cualquier ganancia; mide con datos reales.
- **Seguir devolviendo `null` en vez de `Optional`.** Cambia la firma del método para forzar el manejo explícito del caso vacío.
- **Usar lambdas verbosas donde una referencia a método sería más clara.** Prefiere `Clase::metodo` cuando la lambda simplemente invoca ese método.
- **Intentar resolver lógica de ventana/vecindad con `filter`/`map` puro.** Esas operaciones no ven elementos vecinos; usa un gatherer como `windowSliding`.

---
