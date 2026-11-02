# Módulo 4: Streams y programación funcional


**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

### Tema 1: Stream API — map, filter, reduce, collect · Básico · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Módulo 2 (colecciones) y lambdas; JDK 27 o posterior. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** comparar un bucle con un pipeline de `filter`/`map`/`collect`; usar `Collectors` y `reduce`; aprovechar streams primitivos; acotar un stream infinito; y explicar la pereza, el consumo único y la pureza.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** un reporte necesita enumerar las entregas activas y sumar tarifas. La implementación debe dejar claro qué elementos selecciona y qué calcula, sin esconder efectos secundarios en el pipeline.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** El estilo declarativo de Streams describe qué transformación se desea en vez de los detalles mecánicos de iteración manual, y su evaluación perezosa (solo disparada por la operación terminal) evita crear colecciones intermedias innecesarias entre cada paso de la cadena.

`filter`/`map` son operaciones intermedias perezosas; `collect`/`sum` son terminales y disparan la ejecución completa en una única pasada.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| pipeline declarativo frente a bucle | Núcleo | el mismo cálculo con `for` y con `stream()` |
| intermedias frente a terminales | Núcleo | `filter`/`map` no hacen nada sin una terminal |
| pereza y consumo único | Diagnóstico | reutilizar un stream lanza `IllegalStateException` |
| `Collectors` (`toList`/`groupingBy`/`joining`/`summingDouble`) | Variante | recolectar en lista, agrupar, unir y sumar |
| `reduce` con identidad | Variante | combinar en un valor con un acumulador asociativo |
| streams primitivos (`IntStream`) | Variante | `sum`/`summaryStatistics` sin boxing |
| `iterate`/`generate` + `limit` | Límite | acotar un stream potencialmente infinito |
| pureza y efectos secundarios | Diagnóstico | no mutar estado externo dentro de `map`/`filter` |

Cada fila tiene su explicación individual a continuación.

**Pipeline declarativo frente a bucle (núcleo).** Un stream expresa *qué* transformación quieres (`filter` → `map` → `collect`) en vez de *cómo* iterar y acumular. Comunica la intención, pero solo es más claro si no esconde efectos; para lógica con cortes a mitad o condiciones muy entrelazadas, un `for` puede seguir siendo mejor.

**Intermedias frente a terminales (núcleo).** `filter`, `map`, `sorted` son **intermedias**: devuelven otro stream y no ejecutan nada por sí solas. `collect`, `reduce`, `sum`, `count`, `forEach` son **terminales**: disparan el pipeline, procesando cada elemento una sola vez a través de toda la cadena (no se materializa una lista entre `filter` y `map`).

**Pereza y consumo único (diagnóstico).** Como las intermedias son perezosas, nada ocurre hasta la terminal. Además, un stream se consume **una sola vez**: volver a usarlo tras una operación terminal lanza `IllegalStateException: stream has already been operated upon or closed`. Si necesitas recorrer dos veces, crea dos streams desde la fuente.

**`Collectors` (variante).** `collect(...)` acepta recolectores reutilizables: `toList()`, `groupingBy(clasificador)` (con downstream como `mapping`/`counting`/`summingDouble`), `joining(sep, prefijo, sufijo)` para unir texto, `toMap(clave, valor)`. Son la forma estándar de transformar un stream en una estructura de datos concreta.

**`reduce` con identidad (variante).** `reduce(identidad, acumulador)` combina los elementos en un solo valor: `reduce(0.0, Double::sum)`. La **identidad** es el valor neutro (0 para sumar, 1 para multiplicar) y el acumulador debe ser **asociativo** para que el resultado sea el mismo en serie o en paralelo.

**Streams primitivos (variante).** `IntStream`/`LongStream`/`DoubleStream` evitan el boxing de los wrappers y ofrecen operaciones numéricas directas: `IntStream.rangeClosed(1,5).sum()`, `summaryStatistics()` (count/sum/min/max/average en una pasada). Usa `mapToInt`/`mapToDouble` para pasar de objetos a un stream primitivo.

**`iterate`/`generate` + `limit` (límite).** `Stream.iterate(semilla, f)` y `Stream.generate(sup)` producen streams **potencialmente infinitos**; debes acotarlos con `limit(n)` (o una condición en el `iterate` de 3 argumentos) o el pipeline no termina. Útil para generar secuencias.

**Pureza y efectos secundarios (diagnóstico).** Las funciones de `map`/`filter` deben ser **puras**: no mutar una variable externa ni producir efectos observables. Hacerlo (acumular en una lista de fuera, escribir en consola dentro de `map`) rompe la pereza y falla en paralelo. Para "acumular", usa `collect`/`reduce`, no un efecto lateral.

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

**Paso 4 · Demostración guiada desde cero**

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

**Paso 5 · Práctica guiada**

**Fallo deliberado:** elimina `.filter(Entrega::activa)` del pipeline y ejecuta de nuevo. La lista ahora incluye `E-002`, aunque el reporte pide entregas activas; restaura el filtro y confirma que ambas implementaciones usan la misma condición.

**Pista:** el resultado de `filter` no se materializa en una lista hasta que el pipeline encuentra su operación terminal; si colocas un punto de interrupción en el `filter`, verás que no se ejecuta hasta llegar a `collect` o `sum`.

Ahora cierra los subtemas de `Collectors`, `reduce`, streams primitivos y consumo único. Crea `src/main/java/academia/streams/Demo.java`:

```java
package academia.streams;
import java.util.*;
import java.util.stream.*;

public final class Demo {
    record Entrega(String id, boolean activa, double tarifa, String zona) {}
    public static void main(String[] args) {
        List<Entrega> e = List.of(
            new Entrega("E1", true, 12.5, "Norte"),
            new Entrega("E2", false, 8.0, "Sur"),
            new Entrega("E3", true, 15.75, "Norte"));

        var porEstado = e.stream().collect(Collectors.groupingBy(
            Entrega::activa, Collectors.mapping(Entrega::id, Collectors.toList())));
        System.out.println("groupingBy=" + porEstado);
        System.out.println("joining=" + e.stream().map(Entrega::id).collect(Collectors.joining(", ", "[", "]")));
        System.out.println("summingDouble=" + e.stream().collect(
            Collectors.groupingBy(Entrega::zona, Collectors.summingDouble(Entrega::tarifa))));
        System.out.println("reduce=" + e.stream().map(Entrega::tarifa).reduce(0.0, Double::sum));
        System.out.println("IntStream.sum=" + IntStream.rangeClosed(1, 5).sum());
        System.out.println("iterate+limit=" + Stream.iterate(0, n -> n + 2).limit(4).toList());

        var s = e.stream();
        s.count();
        try { s.count(); }
        catch (IllegalStateException ex) { System.out.println("consumo unico: IllegalStateException"); }
    }
}
```

```bash
javac -d out src/main/java/academia/streams/Demo.java
java -cp out academia.streams.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
groupingBy={false=[E2], true=[E1, E3]}
joining=[E1, E2, E3]
summingDouble={Sur=8.0, Norte=28.25}
reduce=36.25
IntStream.sum=15
iterate+limit=[0, 2, 4, 6]
consumo unico: IllegalStateException
```

`groupingBy` con downstream `mapping` agrupó por estado; `joining` unió con separador y corchetes; `summingDouble` sumó por zona; `reduce(0.0, Double::sum)` igualó el total; `IntStream` sumó sin boxing; `iterate(...).limit(4)` acotó un stream infinito; y reutilizar el stream lanzó `IllegalStateException`.

**Si falla.** Si las dos versiones del `for`/stream muestran listas distintas, el predicado no coincide. Si reutilizar el stream no falla, lo estás recreando desde la fuente. Si `iterate` no termina, falta el `limit`. Si `Collectors` no resuelve, importa `java.util.stream.Collectors`.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega `Collectors.groupingBy` para agrupar las entregas por estado, y `reduce` para calcular el total de tarifas sin usar `sum()`; confirma que el resultado de `reduce` coincide con el de `mapToDouble().sum()`.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `ReporteEntregas.java` compila; bucle y stream imprimen la misma lista de activas y el mismo total.
- [ ] `groupingBy` separa activas de inactivas; `joining` y `summingDouble` producen su salida.
- [ ] `reduce(0.0, Double::sum)` coincide con `mapToDouble().sum()`.
- [ ] `IntStream.rangeClosed(1,5).sum()` da `15` sin boxing.
- [ ] `Stream.iterate(...).limit(4)` acota el stream infinito a `[0, 2, 4, 6]`.
- [ ] Reutilizar un stream ya consumido lanza `IllegalStateException`.

**Si falla.** Si `groupingBy` da claves inesperadas, la función de clasificación devuelve el objeto, no `activa()`. Si reutilizar el stream no falla, lo recreas desde la fuente. Si `iterate` no termina, falta `limit`.

Guarda ambas versiones (bucle y stream), la comparación de resultados y el agrupamiento por estado.

**Antes del siguiente tema:** explica por qué las operaciones intermedias no se ejecutan hasta que hay una terminal y cuándo un bucle explícito sería más fácil de entender.

**Errores comunes:** mutar una variable externa al stream desde dentro de un `map`/`forEach` (efecto secundario oculto), reutilizar el mismo stream dos veces (lanza `IllegalStateException`, un stream solo se consume una vez), y usar `forEach` con lógica compleja cuando `collect`/`reduce` expresarían mejor la intención.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: Streams](https://dev.java/learn/api/streams/), [`Stream` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/stream/Stream.html) y [`Collectors` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/stream/Collectors.html).

---

### Tema 2: Optional — evitar null explícitamente · Intermedio · 40 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Tema 1 de este módulo (Streams), lambdas y excepciones; JDK 27 o posterior. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** representar la ausencia con `Optional` como retorno; crearlo con `of`/`ofNullable`; transformarlo con `map`/`filter`; distinguir `orElse` de `orElseGet`; y evitar `get()` sin comprobar.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** buscar una entrega por id puede no encontrar coincidencia. El contrato de retorno debe hacer visible esa ausencia para que cada consumidor decida si mostrarla, usar un valor alternativo o tratarla como error.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** `Optional` obliga, en el propio tipo de retorno, a que el código que llama considere explícitamente el caso de ausencia de valor, reemplazando con ventaja la práctica de devolver `null` directamente y confiar en que se verifique manualmente sin ninguna garantía del compilador.

`Optional<T>` como tipo de retorno obliga, en el propio sistema de tipos, a considerar el caso "no hay valor" antes de compilar.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `Optional` como tipo de retorno | Núcleo | hace visible la ausencia en la firma |
| creación (`of`/`ofNullable`/`empty`) | Fundamento | `of` no admite null; `ofNullable` sí |
| `map`/`flatMap`/`filter` | Variante | transformar sin desenvolver manualmente |
| `orElse` frente a `orElseGet` | Diagnóstico | `orElse` evalúa siempre; `orElseGet` solo si vacío |
| `orElseThrow` / `ifPresent` | Núcleo | decidir explícitamente ante la ausencia |
| `get()` sin comprobar | Diagnóstico | lanza `NoSuchElementException` si está vacío |
| dónde NO usar `Optional` | Decisión | no como campo ni parámetro |

Cada fila tiene su explicación individual a continuación.

**`Optional` como tipo de retorno (núcleo).** Devolver `Optional<T>` en vez de `T` (que podría ser `null`) hace que la **ausencia sea parte del contrato**: quien llama ve en la firma que puede no haber valor y el compilador lo empuja a decidir, en lugar de descubrirlo con un `NullPointerException` en producción.

**Creación (fundamento).** `Optional.of(x)` envuelve un valor **no nulo** (lanza `NullPointerException` si le pasas `null`); `Optional.ofNullable(x)` acepta `null` y produce un vacío; `Optional.empty()` es el vacío explícito. Usa `ofNullable` al envolver un valor que podría faltar.

**`map`/`flatMap`/`filter` (variante).** Transformas el contenido **sin** desenvolverlo: `opt.map(Persona::email)` devuelve `Optional<String>`; `filter` lo vacía si no cumple un predicado; `flatMap` se usa cuando la función ya devuelve otro `Optional` (evita `Optional<Optional<...>>`). Encadenar es más seguro que `if (opt.isPresent()) opt.get()...`.

**`orElse` frente a `orElseGet` (diagnóstico).** Diferencia sutil y real: `orElse(valor)` **evalúa su argumento siempre**, incluso si el Optional tiene valor (trabajo desperdiciado si construir el default es caro); `orElseGet(() -> ...)` solo invoca el supplier **cuando está vacío**. Para un default costoso o con efectos, usa `orElseGet`.

**`orElseThrow` / `ifPresent` (núcleo).** `orElseThrow(() -> new ...)` lanza una excepción clara si falta el valor; `ifPresent(v -> ...)` ejecuta una acción solo si hay valor. Son las formas de **decidir explícitamente** qué hacer ante la ausencia, frente a confiar en un chequeo manual de `null`.

**`get()` sin comprobar (diagnóstico).** `opt.get()` devuelve el valor, pero si el Optional está vacío lanza `NoSuchElementException`. Llamar `get()` sin haber comprobado `isPresent()` reintroduce el mismo problema que el `null`: evítalo, usa `orElse*`/`ifPresent`/`map`.

**Dónde NO usar `Optional` (decisión).** `Optional` está diseñado para **tipos de retorno**. Usarlo como **campo** de una clase o como **parámetro** de un método es un antipatrón (añade envoltura y no aporta): para un parámetro opcional, usa sobrecargas o `@Nullable`; para un campo ausente, modela el dominio.

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

**Paso 4 · Demostración guiada desde cero**

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

**Paso 5 · Práctica guiada**

**Fallo deliberado:** cambia deliberadamente la firma a que devuelva `Entrega` directamente (pudiendo ser `null`); invoca un método sobre el resultado sin verificar y observa el `NullPointerException`.

**Pista:** el compilador no distingue entre un `Entrega` válido y uno `null`; solo `Optional` obliga a escribir qué hacer cuando no hay valor.

Ahora cierra los subtemas de creación, `map`/`filter`, el antipatrón `get()` y la diferencia `orElse`/`orElseGet`. Crea `src/main/java/academia/busqueda/Demo.java`:

```java
package academia.busqueda;
import java.util.*;

public final class Demo {
    static String calcular(String quien) { System.out.println("  [calcular invocado por " + quien + "]"); return "default"; }
    public static void main(String[] args) {
        System.out.println("of=" + Optional.of("x"));
        System.out.println("ofNullable(null)=" + Optional.ofNullable(null));
        System.out.println("map=" + Optional.of("a@x.com").map(String::toUpperCase).orElse("-"));
        System.out.println("filter=" + Optional.of("a@x.com").filter(s -> s.endsWith(".org")).isPresent());

        Optional<String> presente = Optional.of("valor-real");
        System.out.println("orElse=" + presente.orElse(calcular("orElse")));          // evalúa aunque haya valor
        System.out.println("orElseGet=" + presente.orElseGet(() -> calcular("orElseGet"))); // NO invoca

        try { Optional.empty().get(); }
        catch (NoSuchElementException e) { System.out.println("get() vacio: NoSuchElementException"); }
    }
}
```

```bash
javac -d out src/main/java/academia/busqueda/Demo.java
java -cp out academia.busqueda.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
of=Optional[x]
ofNullable(null)=Optional.empty
map=A@X.COM
filter=false
  [calcular invocado por orElse]
orElse=valor-real
orElseGet=valor-real
get() vacio: NoSuchElementException
```

Fíjate en el punto clave: **aunque `presente` tiene valor**, `orElse(calcular(...))` **sí invocó** `calcular` (se ve el mensaje `[calcular invocado por orElse]`), mientras `orElseGet(() -> ...)` **no lo invocó**. Esa es la diferencia: `orElse` evalúa su argumento siempre; `orElseGet` solo si está vacío. Y `get()` sobre un vacío reintrodujo el problema del `null` como `NoSuchElementException`.

**Si falla.** Si no ves `[calcular invocado por orElse]`, tu Optional estaba vacío (usa uno presente). Si `get()` no lanza, el Optional tenía valor. Si `ofNullable(null)` lanza, confundiste `of` con `ofNullable`.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega `orElse(entregaPorDefecto)` y `orElseGet(() -> calcularAlternativa())` como dos formas adicionales de manejar la ausencia, y explica en qué caso usarías cada una de las tres.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `RepositorioEntregas.java` compila; un id existente devuelve su entrega y uno inexistente se maneja.
- [ ] `of` rechaza `null` y `ofNullable(null)` produce `Optional.empty`.
- [ ] `map`/`filter` transforman sin desenvolver manualmente.
- [ ] Con un Optional **presente**, `orElse(...)` evalúa su argumento y `orElseGet(...)` no.
- [ ] `get()` sobre un vacío lanza `NoSuchElementException`.
- [ ] Explicas por qué `Optional` no debería usarse como campo ni parámetro.

**Si falla.** Si no ves la diferencia `orElse`/`orElseGet`, usa un Optional con valor. Si `get()` no lanza, el Optional tenía valor. Si `ofNullable(null)` lanza, confundiste `of` con `ofNullable`.

Guarda el repositorio, las tres formas de manejar ausencia y el `NullPointerException` provocado al usar `null`.

**Antes del siguiente tema:** diferencia una búsqueda única opcional de una búsqueda con varios resultados y explica qué decisión debe tomar quien llama.

**Errores comunes:** llamar `.get()` sobre un `Optional` sin verificar `isPresent()` antes (lanza `NoSuchElementException` igual que un `null` no verificado lanzaría `NullPointerException`), usar `Optional` como tipo de un campo o parámetro en vez de como tipo de retorno, y envolver en `Optional` un valor que en realidad nunca debería estar ausente.

**Fuentes oficiales revisadas el 2026-11-01:** [`Optional` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/Optional.html) y [dev.java: Optional](https://dev.java/learn/api/optional/).

---

### Tema 3: Streams paralelos y referencias a métodos · Intermedio · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Temas 1–2 de este módulo (Streams); JDK 27 o posterior. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** comparar resultado secuencial y paralelo exigiendo igualdad antes que velocidad; explicar el overhead y las condiciones de carrera; y medir el costo en tu equipo sin asumir que paralelo siempre gana.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (experimento aislado para RutaFlow):** un cálculo de clasificación por lotes es CPU-intensivo y no modifica estado compartido. Antes de incorporarlo al servicio hay que comprobar resultados equivalentes y medir en el entorno objetivo.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Un stream paralelo solo mejora el rendimiento con datasets grandes y operaciones CPU-intensivas sin efectos secundarios compartidos; usarlo indiscriminadamente en casos pequeños o simples puede empeorar el rendimiento por el overhead de coordinación.

`parallelStream()` divide el trabajo entre varios hilos gestionados por `ForkJoinPool.commonPool()`; el overhead de dividir y recombinar solo se justifica con datasets grandes y operaciones CPU-intensivas.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `parallelStream()` y `ForkJoinPool` | Núcleo | divide el trabajo en el pool común |
| correctitud antes que velocidad | Diagnóstico | los conteos secuencial y paralelo deben coincidir |
| overhead de paralelización | Límite | con datos pequeños, paralelo suele ser más lento |
| estado compartido y condiciones de carrera | Diagnóstico | mutar estado compartido en paralelo corrompe el resultado |
| referencias a métodos | Variante | `Clase::metodo` como lambda que solo delega |
| medición informal frente a JMH | Decisión | `nanoTime` observa; no decide rendimiento |

Cada fila tiene su explicación individual a continuación.

**`parallelStream()` y `ForkJoinPool` (núcleo).** `parallelStream()` (o `.parallel()` sobre un stream) reparte los elementos entre varios hilos del `ForkJoinPool.commonPool()`, procesa en paralelo y recombina. El número de hilos depende de los núcleos disponibles (y de los límites del contenedor).

**Correctitud antes que velocidad (diagnóstico).** La regla de oro: **primero** verifica que el resultado paralelo es **idéntico** al secuencial; solo entonces compara tiempos. Si los conteos difieren, hay un bug (operación no asociativa, estado compartido), no una optimización.

**Overhead de paralelización (límite).** Dividir, coordinar hilos y recombinar tiene un coste fijo. Para colecciones pequeñas o operaciones baratas, ese coste supera cualquier ganancia y el paralelo resulta **más lento**. Solo compensa con datasets grandes y trabajo por elemento genuinamente caro (CPU-bound).

**Estado compartido y condiciones de carrera (diagnóstico).** Si el pipeline muta estado compartido mutable (acumular en una lista externa, un contador), en paralelo aparecen **condiciones de carrera** y resultados corruptos o no deterministas. Las operaciones deben ser sin efectos; para acumular usa `collect`/`reduce` con combinador asociativo (concurrencia en detalle en el Módulo 5).

**Referencias a métodos (variante).** `ContarPrimos::esPrimo` es la lambda `n -> ContarPrimos.esPrimo(n)` cuando solo delega en un método existente; más legible. No cambia el rendimiento, solo la expresividad (las cuatro clases de referencia se vieron a fondo en el Módulo 20).

**Medición informal frente a JMH (decisión).** `System.nanoTime()` sirve para **observar** órdenes de magnitud, pero no controla calentamiento de la JVM, JIT ni ruido; no decide rendimiento. Para una conclusión fiable usa JMH, y repite varias veces antes de concluir.

`numeros.parallelStream().filter(this::esPrimo).count()` divide el procesamiento del stream entre múltiples hilos automáticamente gestionados por el framework de streams (usando internamente el mismo pool de hilos compartido `ForkJoinPool.commonPool()`), apropiado específicamente para datasets grandes combinados con operaciones genuinamente intensivas en CPU y sin efectos secundarios compartidos entre los elementos procesados (dado que la paralelización introduce el riesgo de condiciones de carrera si las operaciones del stream modifican estado compartido mutable, Módulo 5).

Para colecciones pequeñas, o para operaciones simples y rápidas, el overhead de coordinar la división del trabajo entre múltiples hilos y de recombinar los resultados parciales al final supera cualquier ganancia teórica de paralelización, resultando frecuentemente en un rendimiento peor que el equivalente secuencial (`stream()`, sin paralelizar); medir con datos reales del caso específico (en vez de asumir que "paralelo siempre es más rápido") es la única forma confiable de determinar si `parallelStream()` efectivamente aporta un beneficio neto en una situación concreta.

Las referencias a métodos (`Persona::getNombre`, equivalente exacto a la lambda `p -> p.getNombre()`) son una forma más concisa de expresar una lambda que simplemente invoca un método existente sobre su argumento, sin agregar ninguna lógica adicional propia, siendo preferibles por legibilidad en ese caso específico frente a escribir la lambda completa de forma explícita.

**Analogía:** un stream paralelo es como dividir una tarea grande entre varios trabajadores que luego deben coordinarse para combinar sus resultados parciales; para una tarea pequeña, el tiempo de organizar esa división y coordinación entre trabajadores puede superar fácilmente el tiempo que hubiera tomado simplemente completar la tarea uno mismo sin ayuda adicional.

**Conceptos clave:** `parallelStream()`, overhead de paralelización, `Clase::metodo`.

**Código del ejemplo:**

```java
long conteo = numeros.parallelStream()
    .filter(ContarPrimos::esPrimo)
    .count();

List<String> nombres = personas.stream()
    .map(Persona::getNombre) // equivalente a .map(persona -> persona.getNombre())
    .toList();
```

Antes de paralelizar cualquier procesamiento pesado del proyecto integrador de este track, medirás igual que aquí si el dataset y la operación justifican el overhead de `parallelStream()`.

**Cuándo no usarlo:** `parallelStream()` no aporta nada (y puede empeorar el rendimiento) para colecciones pequeñas, operaciones rápidas, o pipelines con efectos secundarios sobre estado compartido mutable — en ese último caso además introduce condiciones de carrera reales (Módulo 5).

**Implicación práctica:** El beneficio de `parallelStream()` depende del tamaño real del dataset y del costo de la operación, nunca es automático — medir con datos reales es la única forma confiable de saber si realmente ayuda en un caso concreto.

#### Practica

**Paso 4 · Demostración guiada desde cero**

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

**Resultado esperado:** ambos conteos son iguales (`148 933` primos hasta 2 000 000). El tiempo puede ser mayor o menor según hardware, carga, calentamiento y límites del proceso; esta medición didáctica no sustituye un benchmark con JMH.

**Paso 5 · Práctica guiada**

Repite la comparación con el rango 2 a 100 y contrasta primero los conteos y luego los tiempos. Registra el resultado real de tu equipo, sin asumir cuál variante ganará.

**Pista:** el tiempo de la primera ejecución incluye la inicialización de la JVM; ejecuta el programa dos o tres veces antes de sacar conclusiones de la comparación.

**Fallo deliberado:** cambia el límite inferior solo en la llamada paralela, de `desde` a `desde + 1`. Los conteos ya no coincidirán. Diagnostica el error comparando primero los argumentos de ambas llamadas y restáuralos antes de medir rendimiento.

**Si falla.** Si los dos conteos difieren, el predicado o el rango cambian entre llamadas. Si `parallelStream` siempre tarda más incluso con 2 000 000, comprueba cuántos núcleos tiene la máquina y si el contenedor limita el paralelismo. Si la compilación falla en `LongStream.rangeClosed`, revisa que el import sea `java.util.stream.LongStream`.

#### Aplica

**Paso 6 · Práctica independiente**

Reemplaza `ContarPrimos::esPrimo` temporalmente por la lambda `n -> ContarPrimos.esPrimo(n)` y vuelve a la referencia de método. Confirma que el conteo no cambia; no esperes una diferencia de rendimiento medible por este cambio de sintaxis.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `ContarPrimos.java` compila y se ejecuta con `javac` y `java -cp out`.
- [ ] Los conteos secuencial y paralelo coinciden.
- [ ] La medición usa `System.nanoTime()` y reporta milisegundos.
- [ ] Repetiste la medición con el rango 2 a 100 y observaste la diferencia.
- [ ] `this::esPrimo` sustituye la lambda sin cambiar el resultado.
- [ ] Explicas por qué el tamaño del dataset decide si conviene paralelizar.

**Si falla.** Si `this::esPrimo` no compila desde `main`, recuerda que `esPrimo` es estático y la referencia correcta es `ContarPrimos::esPrimo`. Si el tiempo varía demasiado entre ejecuciones, repite la medición y compara el orden de magnitud, no el milisegundo exacto.

Guarda ambos conteos, las mediciones repetidas (rango grande y pequeño) y la conclusión limitada a tu equipo y condiciones de ejecución.

**Antes del siguiente tema:** explica por qué la igualdad del resultado es requisito antes de comparar tiempo y qué limitaciones tiene esta medición con `System.nanoTime()`.

**Errores comunes:** asumir que `parallelStream()` siempre es más rápido sin medir, paralelizar un pipeline con efectos secundarios sobre estado compartido mutable (introduce condiciones de carrera reales), y paralelizar una colección pequeña donde el overhead de coordinación supera cualquier beneficio.

**Fuentes oficiales revisadas el 2026-11-01:** [`Stream` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/stream/Stream.html), [`ForkJoinPool` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/concurrent/ForkJoinPool.html) y [OpenJDK JMH](https://openjdk.org/projects/code-tools/jmh/).

---

### Tema 4: Stream Gatherers (Java 24) · Avanzado · 50 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Temas 1–3 de este módulo (Streams); JDK 24 o posterior (verificado con JDK 27). Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** usar `Stream.gather()` con `Gatherers.windowSliding(3)` para detectar tres entregas atrasadas consecutivas; distinguir `windowSliding` de `windowFixed`; y explicar por qué un filtro elemento a elemento no expresa esa relación.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** un monitor de lotes debe alertar tras tres entregas consecutivas atrasadas, no por tres elementos aislados. El orden de llegada forma parte de la regla.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Porque una transformación declarativa puede hacer visible la regla, pero solo si la operación elegida puede expresar genuinamente la relación entre elementos que el caso real requiere.

`Stream.gather()` (finalizado en Java 24, disponible en Java 27) permite definir operaciones intermedias personalizadas con estado entre elementos. `map` y `filter` transforman o seleccionan cada elemento por separado; `reduce` puede acumular estado, pero es una operación terminal y no emite una secuencia de ventanas para continuar el pipeline. `Gatherers.windowSliding(n)` emite ventanas consecutivas de tamaño `n`.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| límite de `map`/`filter` (sin memoria) | Prerrequisito | no expresan relación entre vecinos |
| `Stream.gather()` | Núcleo | operación intermedia con estado |
| `Gatherers.windowSliding(n)` | Núcleo | ventanas deslizantes solapadas |
| `Gatherers.windowFixed(n)` | Variante | ventanas no superpuestas (última parcial) |
| gatherer frente a `reduce` | Decisión | intermedio que sigue el pipeline vs terminal |
| cuándo basta `map`/`filter` | Límite | si no hay relación de vecindad, no uses gatherer |

Cada fila tiene su explicación individual a continuación.

**Límite de `map`/`filter` (prerrequisito).** `map`/`filter` miran cada elemento **aislado**, sin memoria de los anteriores. Una regla como "tres atrasos **consecutivos**" depende de la relación entre vecinos, y no se puede expresar con un filtro elemento a elemento sin hacks con estado externo (que rompe la pereza y el paralelo).

**`Stream.gather()` (núcleo).** Es una operación **intermedia** que puede mantener **estado entre elementos** y emitir cero, uno o varios resultados por elemento, siguiendo el pipeline. Acepta un `Gatherer` (propio o de la clase `Gatherers`). Llena el hueco entre `map`/`filter` (sin estado) y `reduce`/`collect` (terminales).

**`Gatherers.windowSliding(n)` (núcleo).** Emite **ventanas deslizantes** de tamaño `n` que avanzan de uno en uno y se **solapan**: para `[E1..E5]` con `n=3` produce `[E1,E2,E3]`, `[E2,E3,E4]`, `[E3,E4,E5]`. Filtrar esas ventanas con `allMatch(estaAtrasada)` detecta la racha consecutiva.

**`Gatherers.windowFixed(n)` (variante).** Divide en ventanas **no superpuestas** de tamaño `n`: `[1..5]` con `n=2` da `[1,2]`, `[3,4]`, `[5]` (la última parcial). Útil para procesar en lotes de tamaño fijo, a diferencia del solape de `windowSliding`.

**Gatherer frente a `reduce` (decisión).** `reduce`/`collect` producen un **único valor terminal** y cierran el stream; un gatherer produce una **secuencia intermedia** que sigue alimentando el pipeline (puedes `filter`/`map` las ventanas después). Usa gatherer cuando necesites seguir transformando; `reduce` cuando solo quieras el agregado final.

**Cuándo basta `map`/`filter` (límite).** Si la transformación es elemento a elemento sin relación de orden o vecindad, `map`/`filter` son más simples y claros. No introduzcas un gatherer donde no hay estado entre elementos que justifique su complejidad.

`Gatherers` (la clase utilitaria con implementaciones estándar) incluye `windowSliding(n)` para ventanas deslizantes de tamaño fijo, `windowFixed(n)` para ventanas no superpuestas y `fold` para acumular estado dentro de una operación intermedia. Elige la operación según si necesitas producir resultados intermedios que sigan alimentando el pipeline o solo un valor final.

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

**Implicación práctica:** `Stream.gather()` permite producir ventanas intermedias que continúan por el pipeline. Aunque `reduce` puede acumular estado para calcular un resultado terminal, no reemplaza esa salida de ventanas como operación intermedia.

#### Practica

**Paso 4 · Demostración guiada desde cero**

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

**Paso 5 · Práctica guiada**

Cambia la última entrega `E5` de puntual a atrasada y ejecuta de nuevo. Predice cuántas ventanas consecutivas cumplen la regla y cuáles son sus ids; luego compara con la salida.

**Pista:** las ventanas se solapan y cada una avanza una posición. Con `E2`, `E3`, `E4` y `E5` atrasadas, hay dos ventanas de tres: `[E2, E3, E4]` y `[E3, E4, E5]`.

**Fallo deliberado:** reemplaza `gather(Gatherers.windowSliding(3))` por un simple `filter(Entrega::estaAtrasada)`. El pipeline devuelve elementos atrasados sueltos, no ventanas; si el consumidor los interpreta como rachas, clasifica incorrectamente incluso atrasos aislados.

**Pista:** con la secuencia `E1 a tiempo, E2–E4 atrasadas, E5 a tiempo`, el pipeline correcto devuelve una ventana; el `filter` simplificado devuelve tres entregas individuales y pierde la noción de racha.

**Si falla.** Si `Gatherers` no se resuelve, estás compilando con un JDK anterior a 24. Si la ventana esperada no aparece, comprueba que las tres entregas consecutivas tengan `atrasada` en `true` y que el orden de la lista sea el de llegada. Si el `record` no compila, revisa que el archivo se llame como la clase pública y que el JDK sea 17 o superior.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega una prueba con una secuencia mixta (a tiempo, atrasada, a tiempo, atrasada, atrasada, atrasada) y confirma que solo se detecta la ventana correspondiente a las tres últimas entregas; conserva el orden de entrada.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `DetectorAtrasos.java` compila con JDK 24 o superior.
- [ ] La secuencia `E1–E5` imprime solo la ventana `[E2, E3, E4]`.
- [ ] El `filter` simplificado detecta atrasos aislados y pierde la racha.
- [ ] La secuencia mixta detecta solo las tres últimas entregas consecutivas.
- [ ] El diagrama de ventanas deslizantes se abre y coincide con la salida.
- [ ] Explicas qué lógica de vecindad no pueden expresar `filter`/`map`.

**Si falla.** Si la secuencia mixta produce más de una ventana, revisa que `allMatch` exija las tres entregas atrasadas y no solo una. Si el diagrama no carga, verifica la ruta `../../visuals/temas/java/modulo-4-tema-4-gatherers-window-sliding.html` desde el módulo.

Entrega el pipeline con `Gatherers.windowSliding`, las ventanas solapadas cuando la racha tiene cuatro elementos y la prueba con secuencia mixta; explica por qué un gatherer intermedio puede emitir ventanas y `reduce` solo devuelve la agregación final.

**Antes del siguiente tema:** explica qué aporta la ventana deslizante, cuál es el requisito de versión del JDK y cuándo `filter`/`map` son suficientes.

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
