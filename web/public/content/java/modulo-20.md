# Módulo 20: Java funcional — interfaces que componen comportamiento

Java permite programar en estilo funcional con lambdas, interfaces funcionales, `Optional`, streams y la Flow API. El objetivo no es “escribir todo con streams”, sino componer comportamiento con claridad, pureza donde convenga y evidencia cuando se use concurrencia o paralelismo.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Usar `Predicate`, `Function`, `Consumer`, `Supplier` |
| 2 | Transformar datos con `Function` y `BiFunction` |
| 3 | Componer comportamiento con `andThen`, `compose`, `negate` |
| 4 | Entender laziness, orden y consumo único de Streams |
| 5 | Usar `UnaryOperator` y `BinaryOperator` |
| 6 | Usar referencias a métodos con criterio |
| 7 | Modelar ausencia con `Optional` |
| 8 | Aplicar operaciones intermedias de Stream |
| 9 | Aplicar operaciones terminales de Stream |
| 10 | Coleccionar resultados con `Collectors` |
| 11 | Evaluar streams paralelos con medición |
| 12 | Separar cálculo puro de efectos secundarios |
| 13 | Usar Flow API con backpressure básico |

## Aprende construyendo

### Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier · Básico · 30 min

**Caso guía**: filtrar guías, convertirlas a etiquetas, imprimirlas y generar IDs con contratos claros.

| Concepto | Definición | Firma mental | Cuándo | Error |
|---|---|---|---|---|
| `Predicate<T>` | Función que evalúa condición booleana. | `T -> boolean` | Filtros, reglas. | Efectos secundarios ocultos. |
| `Function<T,R>` | Transforma entrada en salida. | `T -> R` | Mapeos. | Mutar input inesperadamente. |
| `Consumer<T>` | Consume valor, no retorna resultado útil. | `T -> void` | Logging, efectos. | Poner lógica de negocio crítica solo en consumer. |
| `Supplier<T>` | Provee valor sin entrada. | `() -> T` | Lazy creation/IDs/defaults. | Supplier costoso no controlado. |

**Implementación desde cero** (`mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20`)
```java
import java.util.function.*; import java.util.*;
public class DemoFuncBasics {
  public static void main(String[] args) {
    Predicate<Integer> esPar = n -> n % 2 == 0;
    Function<Integer,String> etiqueta = n -> "N=" + n;
    Consumer<String> imprimir = System.out::println;
    Supplier<String> id = () -> "G-" + UUID.randomUUID().toString().substring(0,4);
    List.of(1,2,3,4).stream().filter(esPar).map(etiqueta).forEach(imprimir);
    System.out.println(id.get().startsWith("G-"));
  }
}
```
**Ejecución real**: `javac DemoFuncBasics.java && java DemoFuncBasics` → `N=2`, `N=4`, `true`. **Verificación**: cambia predicado a `n>2`.

### Tema 2: Function y BiFunction: transformar uno o dos datos · Básico · 35 min

**Caso guía**: calcular etiqueta desde guía, o costo desde peso y distancia.

| Concepto | Definición | Firma | Regla | Error |
|---|---|---|---|---|
| `Function<T,R>` | Transformación de un valor. | `T->R` | Pura cuando sea posible. | Nulls sin contrato. |
| `BiFunction<T,U,R>` | Transformación con dos entradas. | `(T,U)->R` | Útil para combinar. | Demasiados parámetros: crear objeto. |
| `apply` | Método que ejecuta la función. | llamada explícita | Componer para claridad. | Lógica opaca en lambda larga. |
| Tipado genérico | Tipos de entrada/salida en compile time. | `Function<String,Integer>` | Dejar que el compilador ayude. | Casts innecesarios. |

**Implementación desde cero**
```java
import java.util.function.*;
public class DemoFunction {
  public static void main(String[] args) {
    Function<String,Integer> largo = String::length;
    BiFunction<Double,Double,Double> costo = (peso,km) -> 10 + peso*2 + km*0.1;
    System.out.println(largo.apply("G-123"));
    System.out.println(costo.apply(2.0, 50.0));
  }
}
```
**Ejecución real**: `javac DemoFunction.java && java DemoFunction` → `5`, `19.0`.

### Tema 3: Componer sin anidar: andThen, compose, negate y reglas encadenadas · Intermedio · 40 min

**Caso guía**: combinar validaciones y transformaciones sin ifs anidados.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `andThen` | Ejecuta esta función y luego otra. | Pipeline legible. | Orden importa. | Confundir con compose. |
| `compose` | Ejecuta primero la otra y luego esta. | Reutilizar preprocesamiento. | Leer de derecha a izquierda mentalmente. | Orden invertido. |
| `Predicate.and/or/negate` | Combina reglas booleanas. | Validaciones declarativas. | Nombrar predicados. | Lambdas complejas inline. |
| Composición | Construir comportamiento combinando funciones pequeñas. | Legibilidad/reuso. | Pequeñas y puras. | Sobre-composición oscura. |

**Implementación desde cero**
```java
import java.util.function.*;
public class DemoCompose {
  public static void main(String[] args) {
    Function<Integer,Integer> doble = x -> x*2;
    Function<Integer,Integer> masUno = x -> x+1;
    System.out.println(doble.andThen(masUno).apply(3)); // 7
    System.out.println(doble.compose(masUno).apply(3)); // 8
    Predicate<String> noVacio = s -> !s.isBlank();
    Predicate<String> empiezaG = s -> s.startsWith("G");
    System.out.println(noVacio.and(empiezaG).test("G-1"));
    System.out.println(noVacio.and(empiezaG).negate().test("X-1"));
  }
}
```
**Ejecución real**: `7`, `8`, `true`, `true`.

### Tema 4: Streams como composición: pereza, orden y efectos que se esconden · Intermedio · 40 min

**Caso guía**: pipeline que filtra y transforma; entender cuándo se ejecuta.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Stream | Secuencia de elementos con operaciones de pipeline. | Procesar colecciones declarativamente. | No reutilizar stream consumido. | Reusar stream. |
| Pereza (lazy) | Operaciones intermedias no ejecutan hasta terminal. | Optimización/fusión. | Necesitas operación terminal. | Esperar ejecución sin terminal. |
| Orden de evaluación | Encadenamiento por elemento en muchos casos. | Razonar sobre efectos. | Evitar side effects en intermedias. | Depender de orden con parallel sin cuidado. |
| Efectos secundarios | Mutar estado externo en map/filter. | Evitar. | Preferir pureza; collector para mutación controlada. | `map(x -> {list.add(x); return x;})`. |

**Implementación desde cero**
```java
import java.util.*;
public class DemoLazy {
  public static void main(String[] args) {
    List<Integer> nums = List.of(1,2,3,4);
    var s = nums.stream().filter(n -> { System.out.println("f"+n); return n%2==0; }).map(n -> { System.out.println("m"+n); return n*10; });
    System.out.println("antes terminal");
    s.forEach(System.out::println);
  }
}
```
**Ejecución real**: muestra `antes terminal` antes de `f1..m4..20`; demuestra pereza.

### Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo · Intermedio · 35 min

**Caso guía**: normalizar texto o combinar dos valores del mismo tipo.

| Concepto | Definición | Firma | Regla | Error |
|---|---|---|---|---|
| `UnaryOperator<T>` | `Function<T,T>`. | mismo tipo in/out | Transformaciones in-place conceptuales. | Cambiar tipo sin querer. |
| `BinaryOperator<T>` | `BiFunction<T,T,T>`. | combina dos T | `reduce`, comparadores. | No asociativo en reduce paralelo. |
| `IntUnaryOperator` etc. | Versiones primitivas. | evita boxing | Usar en hot paths numéricos. | Boxing innecesario. |
| Identidad/asociatividad | Propiedades útiles en reducción. | reduce seguro. | En paralelo, operador asociativo. | Operador dependiente de orden. |

**Implementación desde cero**
```java
import java.util.function.*; import java.util.*;
public class DemoOperators {
  public static void main(String[] args) {
    UnaryOperator<String> trimUpper = s -> s.trim().toUpperCase();
    BinaryOperator<Integer> suma = Integer::sum;
    System.out.println(trimUpper.apply("  ada "));
    System.out.println(List.of(1,2,3,4).stream().reduce(0, suma));
  }
}
```
**Ejecución real**: `ADA`, `10`.

### Tema 6: Referencias a métodos: escribir la operación sin repetirla · Intermedio · 40 min

**Caso guía**: reemplazar lambdas simples por referencias legibles.

| Concepto | Definición | Forma | Regla | Error |
|---|---|---|---|---|
| Referencia a método estático | `Clase::metodo` | `Integer::parseInt` | Usar cuando lambda solo delega. | Forzar referencia si pierde claridad. |
| Referencia a instancia | `obj::metodo` o `Clase::metodoInstancia` | `System.out::println` | Saber quién recibe el parámetro. | Confundir forma. |
| Referencia a constructor | `Clase::new` | `ArrayList::new` | Útil en factories/suppliers. | Constructor ambiguo por sobrecarga. |
| Legibilidad | Objetivo principal. | - | Si es más claro lambda, usa lambda. | Dogma. |

**Implementación desde cero**
```java
import java.util.*; import java.util.function.*;
public class DemoMethodRef {
  public static void main(String[] args) {
    Function<String,Integer> parse = Integer::parseInt;
    Supplier<List<String>> nueva = ArrayList::new;
    List<String> l = nueva.get(); l.add("a");
    System.out.println(parse.apply("42"));
    System.out.println(l);
  }
}
```
**Ejecución real**: `42`, `[a]`.

### Tema 7: Optional: buscar un envío que puede no existir · Intermedio · 35 min

**Caso guía**: buscar guía por ID; puede no existir.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `Optional<T>` | Contenedor que puede tener valor o vacío. | Modelar ausencia explícita. | Retornar en APIs de búsqueda. | Usar como campo/param en todo. |
| `map/flatMap/filter` | Transformar valor si existe. | Composición segura. | Evitar `get()` sin chequear. | `optional.get()` a ciegas. |
| `orElse/orElseGet/orElseThrow` | Extraer con fallback. | Valor por defecto o error. | `orElseGet` si fallback es costoso. | `orElse` ejecuta argumento igual. |
| Evitar null | Ausencia explícita. | Contratos claros. | No envolver y luego llamar `get`. | `Optional.ofNullable(x).get()`. |

**Implementación desde cero**
```java
import java.util.*;
public class DemoOptional {
  static Optional<String> buscar(boolean ok){ return ok ? Optional.of("G-1") : Optional.empty(); }
  public static void main(String[] args) {
    System.out.println(buscar(true).map(String::toLowerCase).orElse("NA"));
    System.out.println(buscar(false).orElseGet(() -> "NA"));
    try { buscar(false).orElseThrow(); } catch (Exception e) { System.out.println("vacio"); }
  }
}
```
**Ejecución real**: `g-1`, `NA`, `vacio`.

### Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar · Intermedio · 40 min

**Caso guía**: procesar pedidos con items anidados.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `filter` | Mantiene elementos que cumplen predicado. | Selección. | Predicado puro. | Side effects. |
| `map` | Transforma 1 a 1. | Proyección. | No mutar origen. | Retornar nulls sin manejar. |
| `flatMap` | Transforma 1 a muchos y aplana. | Listas anidadas. | Devolver stream. | Usar map cuando necesitas flatMap. |
| `sorted/distinct/limit` | Ordena, dedup, acota. | Control de flujo. | `sorted` requiere comparable/comparator y puede costar. | `distinct` con objetos sin equals/hashCode correcto. |

**Implementación desde cero**
```java
import java.util.*; import java.util.stream.*;
public class DemoIntermedias {
  public static void main(String[] args) {
    List<List<String>> lotes = List.of(List.of("a","b"), List.of("b","c"));
    List<String> r = lotes.stream().flatMap(List::stream).distinct().sorted().collect(Collectors.toList());
    System.out.println(r);
  }
}
```
**Ejecución real**: `[a, b, c]`.

### Tema 9: Streams terminales: encontrar, contar y combinar resultados · Intermedio · 40 min

**Caso guía**: obtener total, existencia o primer match.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `collect` | Materializa resultado con Collector. | Listas, mapas, grupos. | Elegir collector adecuado. | Collect cuando basta `count/anyMatch`. |
| `reduce` | Combina elementos en uno. | Sumas, agregación. | Operador asociativo. | Reduce mutable incorrecto. |
| `findFirst/findAny` | Obtiene elemento opcional. | Búsqueda. | `findAny` útil en parallel. | Asumir orden en parallel con findAny. |
| `count/anyMatch/allMatch` | Agregaciones/chequeos. | Verificaciones rápidas. | Cortocircuito en match. | Recorrer todo innecesariamente. |

**Implementación desde cero**
```java
import java.util.*;
public class DemoTerminales {
  public static void main(String[] args) {
    List<Integer> ns = List.of(1,2,3,4);
    System.out.println(ns.stream().count());
    System.out.println(ns.stream().anyMatch(n -> n>3));
    System.out.println(ns.stream().reduce(0, Integer::sum));
    System.out.println(ns.stream().filter(n->n%2==0).findFirst().orElse(-1));
  }
}
```
**Ejecución real**: `4`, `true`, `10`, `2`.

### Tema 10: Collectors: formar listas, mapas, grupos y texto · Intermedio · 40 min

**Caso guía**: agrupar guías por estado y construir reporte.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `Collectors.toList/toSet` | Colecciona en colección. | Materializar. | Saber mutabilidad/implementación según versión. | Asumir lista mutable específica. |
| `toMap` | Construye mapa por clave/valor. | Índice. | Manejar claves duplicadas. | `IllegalStateException` por clave duplicada. |
| `groupingBy` | Agrupa por clasificador. | Reportes. | Definir downstream. | Agrupar con clave null sin pensar. |
| `joining` | Concatena strings. | Reportes/texto. | Definir delimitador. | Unir sin separador claro. |

**Implementación desde cero**
```java
import java.util.*; import java.util.stream.*;
public class DemoCollectors {
  public static void main(String[] args) {
    record Guia(String id,String estado){}
    var guias = List.of(new Guia("G1","CREADA"), new Guia("G2","ENVIADA"), new Guia("G3","CREADA"));
    Map<String,List<Guia>> porEstado = guias.stream().collect(Collectors.groupingBy(Guia::estado));
    String ids = guias.stream().map(Guia::id).collect(Collectors.joining(","));
    System.out.println(porEstado.get("CREADA").size());
    System.out.println(ids);
  }
}
```
**Ejecución real**: `2`, `G1,G2,G3`.

### Tema 11: Streams paralelos: comparar antes de acelerarlos · Intermedio · 40 min

**Caso guía**: acelerar cálculo CPU-bound grande; evitarlo en IO pequeño.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `parallelStream()` | Stream que puede dividir trabajo en common pool. | CPU-bound grande. | Medir antes. | Paralelizar todo. |
| Common ForkJoinPool | Pool compartido por defecto. | Ejecución paralela. | Evitar blocking IO ahí. | Bloquear pool común. |
| Correctitud | Resultado debe ser igual/aceptable. | Confiabilidad. | Operaciones sin estado/associativas. | Race por side effect. |
| Medición | Comparar secuencial vs paralelo. | Decisión basada en datos. | JMH/mediciones repetidas. | Creer que paralelo siempre es más rápido. |

**Implementación desde cero**
```java
import java.util.stream.*;
public class DemoParallel {
  public static void main(String[] args) {
    long s1 = IntStream.rangeClosed(1,1_000_000).asLongStream().sum();
    long s2 = IntStream.rangeClosed(1,1_000_000).parallel().asLongStream().sum();
    System.out.println(s1==s2);
    System.out.println(s1);
  }
}
```
**Ejecución real**: `true`, `500000500000`. **Verificación**: medir tiempos con datasets grandes; para pequeño, secuencial puede ganar.

### Tema 12: Pureza y efectos: calcular separado de guardar o imprimir · Intermedio · 40 min

**Caso guía**: calcular total y aparte persistir/loggear.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Función pura | Mismo input => mismo output, sin efectos observables. | Testabilidad/razonamiento. | Aislar cálculo. | Esconder IO en `map`. |
| Efecto secundario | IO, mutación, tiempo, red. | Necesario en bordes. | Hacerlo en boundary explícito. | Mezclar cálculo con persistencia. |
| Separación cálculo/efecto | Arquitectura de funciones. | Código mantenible. | Core puro, shell impuro. | “Todo en un stream”. |
| Testabilidad | Facilidad de probar. | Confianza. | Probar pureza sin mocks. | Mockear cálculos simples. |

**Implementación desde cero**
```java
import java.util.*;
public class DemoPureza {
  static int total(List<Integer> xs){ return xs.stream().mapToInt(Integer::intValue).sum(); } // pura
  static void guardar(int t){ System.out.println("guardar:"+t); } // efecto
  public static void main(String[] args){ int t = total(List.of(1,2,3)); guardar(t); }
}
```
**Ejecución real**: `guardar:6`.

### Tema 13: Flow API: publicar datos con demanda y cierre · Intermedio · 40 min

**Caso guía**: productor emite eventos y consumidor controla demanda (backpressure).

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `Flow` API | Interfaces reactivas de JDK (`Publisher/Subscriber/Subscription/Processor`). | Streams asincrónicos con backpressure. | Respetar contrato de demanda. | Llamar `onNext` sin request. |
| Backpressure | Consumidor señala cuánto puede procesar. | Evitar sobrecarga. | `subscription.request(n)`. | Productor sin límite. |
| `SubmissionPublisher` | Implementación simple de Publisher. | Demos/prototipos. | Cerrar publisher. | No cerrar, fuga recursos. |
| Contrato reactivo | onSubscribe -> onNext* -> (onError|onComplete). | Interoperabilidad. | No violar secuencia. | Doble onComplete/onError mal manejado. |

**Implementación desde cero**
```java
import java.util.concurrent.*; import java.util.concurrent.Flow.*;
public class DemoFlow {
  public static void main(String[] args) throws Exception {
    SubmissionPublisher<String> pub = new SubmissionPublisher<>();
    pub.subscribe(new Subscriber<>() {
      private Subscription sub;
      public void onSubscribe(Subscription s){ sub=s; sub.request(2); }
      public void onNext(String item){ System.out.println(item); }
      public void onError(Throwable t){ t.printStackTrace(); }
      public void onComplete(){ System.out.println("done"); }
    });
    pub.submit("A"); pub.submit("B"); pub.close();
    Thread.sleep(200);
  }
}
```
**Ejecución real**: `A`, `B`, `done`.


## Cierre del módulo

El estilo funcional en Java sirve cuando hace el código más claro: transforma, filtra, compone y separa efectos. Cuando agrega indirección o se vuelve un acertijo, vuelve al estilo imperativo simple. La calidad se mide por legibilidad, corrección y evidencia.
