# Módulo 20: Java funcional — interfaces que componen comportamiento

Java permite programar en estilo funcional con lambdas, interfaces funcionales, `Optional`, streams y la Flow API. El objetivo no es “escribir todo con streams”, sino componer comportamiento con claridad, pureza donde convenga y evidencia cuando se use concurrencia o paralelismo.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Las cuatro formas: Predicate, Function, Consumer y Supplier · Básico · 30 min

Filtrar guías, convertirlas a etiquetas, imprimirlas y generar IDs con contratos claros.

#### `Predicate<T>`

**Definición formal.** `Predicate<T>` representa una función `T -> boolean` que evalúa una condición.

**Para qué sirve.** Filtros y reglas composables.

**Cuándo usarlo y cuándo no.** Úsalo para condiciones puras. Evita efectos secundarios ocultos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t1 && cd /tmp/j20-t1
cat > DemoPred.java << 'JAVA'
import java.util.function.*;
public class DemoPred { public static void main(String[] args){ Predicate<Integer> esPar = n -> n%2==0; System.out.println(esPar.test(4)); } }
JAVA
javac DemoPred.java && java DemoPred
```

**Caso de uso real.** Filtrar guías activas.

**Error común.** Predicado con side effects. Corrección: mantenerlo puro.

**Verificación (2026-05-22).** Salida: `true`.

#### `Function<T,R>`

**Definición formal.** `Function<T,R>` representa una transformación `T -> R`.

**Para qué sirve.** Mapear/convertir valores.

**Cuándo usarlo.** Transformaciones puras y claras.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t1
cat > DemoFn.java << 'JAVA'
import java.util.function.*;
public class DemoFn { public static void main(String[] args){ Function<String,Integer> largo=String::length; System.out.println(largo.apply("G-123")); } }
JAVA
javac DemoFn.java && java DemoFn
```

**Caso de uso real.** Convertir entidad a DTO.

**Error común.** Mutar input inesperadamente. Corrección: devolver nuevo valor.

**Verificación (2026-05-22).** Salida: `5`.

#### `Consumer<T>`

**Definición formal.** `Consumer<T>` representa una operación `T -> void` que consume un valor.

**Para qué sirve.** Efectos como logging o impresión.

**Cuándo usarlo.** En bordes de efectos. No metas lógica de negocio crítica oculta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t1
cat > DemoCons.java << 'JAVA'
import java.util.function.*;
public class DemoCons { public static void main(String[] args){ Consumer<String> c=System.out::println; c.accept("hola"); } }
JAVA
javac DemoCons.java && java DemoCons
```

**Caso de uso real.** Enviar evento/auditar.

**Error común.** Ocultar fallos de negocio en consumer. Corrección: hacer explícito el contrato.

**Verificación (2026-05-22).** Salida: `hola`.

#### `Supplier<T>`

**Definición formal.** `Supplier<T>` representa `() -> T`, una fábrica/lazy provider sin entrada.

**Para qué sirve.** Generar valores bajo demanda.

**Cuándo usarlo.** IDs, defaults, lazy init.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t1
cat > DemoSup.java << 'JAVA'
import java.util.function.*;
public class DemoSup { public static void main(String[] args){ Supplier<String> s=() -> "G-1"; System.out.println(s.get()); } }
JAVA
javac DemoSup.java && java DemoSup
```

**Caso de uso real.** Crear ID solo si se necesita.

**Error común.** Supplier costoso llamado repetidamente sin control. Corrección: cachear si corresponde.

**Verificación (2026-05-22).** Salida: `G-1`.

### Tema 2: Function y BiFunction: transformar uno o dos datos · Básico · 35 min

Calcular etiqueta desde guía, o costo desde peso y distancia.

#### `Function<T,R>` y `apply`

**Definición formal.** `Function<T,R>` transforma una entrada en salida; `apply` ejecuta la función.

**Para qué sirve.** Modelar transformaciones reutilizables.

**Cuándo usarlo.** Cuando la conversión tiene nombre y contrato claro.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t2 && cd /tmp/j20-t2
cat > DemoApply.java << 'JAVA'
import java.util.function.*;
public class DemoApply { public static void main(String[] args){ Function<String,Integer> largo=String::length; System.out.println(largo.apply("G-123")); } }
JAVA
javac DemoApply.java && java DemoApply
```

**Caso de uso real.** Normalizar texto.

**Error común.** Lambda larga opaca. Corrección: extraer método nombrado.

**Verificación (2026-05-22).** Salida: `5`.

#### `BiFunction<T,U,R>`

**Definición formal.** `BiFunction<T,U,R>` transforma dos entradas `(T,U)` en `R`.

**Para qué sirve.** Combinar dos valores sin crear clase auxiliar inmediata.

**Cuándo usarlo y cuándo no.** Úsalo para dos parámetros claros. Si hay más, crea un objeto de entrada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t2
cat > DemoBi.java << 'JAVA'
import java.util.function.*;
public class DemoBi { public static void main(String[] args){ BiFunction<Double,Double,Double> costo=(peso,km)->10+peso*2+km*0.1; System.out.println(costo.apply(2.0,50.0)); } }
JAVA
javac DemoBi.java && java DemoBi
```

**Caso de uso real.** Calcular tarifa por peso y distancia.

**Error común.** Demasiados parámetros en BiFunction encadenadas. Corrección: modelar request object.

**Verificación (2026-05-22).** Salida: `19.0`.

### Tema 3: Componer sin anidar: andThen, compose, negate y reglas encadenadas · Intermedio · 40 min

Combinar validaciones y transformaciones sin ifs anidados.

#### `andThen` y `compose`

**Definición formal.** `andThen` aplica la función actual y luego la siguiente; `compose` aplica primero la función pasada y luego la actual.

**Para qué sirve.** Pipelines legibles.

**Cuándo usarlo.** Transformaciones pequeñas y puras.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t3 && cd /tmp/j20-t3
cat > DemoComp.java << 'JAVA'
import java.util.function.*;
public class DemoComp { public static void main(String[] args){ Function<Integer,Integer> doble=x->x*2, masUno=x->x+1; System.out.println(doble.andThen(masUno).apply(3)); System.out.println(doble.compose(masUno).apply(3)); } }
JAVA
javac DemoComp.java && java DemoComp
```

**Caso de uso real.** Normalizar y luego validar.

**Error común.** Confundir orden de `compose`. Corrección: probar con ejemplo pequeño.

**Verificación (2026-05-22).** Salida: `7`, `8`.

#### `Predicate.and/or/negate`

**Definición formal.** Combinadores lógicos que crean nuevos predicados a partir de otros.

**Para qué sirve.** Reglas declarativas.

**Cuándo usarlo.** Validaciones compuestas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t3
cat > DemoPredComp.java << 'JAVA'
import java.util.function.*;
public class DemoPredComp { public static void main(String[] args){ Predicate<String> noVacio=s->!s.isBlank(); Predicate<String> empiezaG=s->s.startsWith("G"); System.out.println(noVacio.and(empiezaG).test("G-1")); System.out.println(noVacio.and(empiezaG).negate().test("X-1")); } }
JAVA
javac DemoPredComp.java && java DemoPredComp
```

**Caso de uso real.** Filtros de búsqueda.

**Error común.** Lambdas inline complejas. Corrección: nombrar predicados.

**Verificación (2026-05-22).** Salida: `true`, `true`.

### Tema 4: Streams como composición: pereza, orden y efectos que se esconden · Intermedio · 40 min

Entender cuándo se ejecuta un pipeline.

#### Stream y pereza

**Definición formal.** Un `Stream` es un pipeline de operaciones sobre datos; las intermedias son lazy y se ejecutan al invocar una terminal.

**Para qué sirve.** Procesamiento declarativo y posible fusión de operaciones.

**Cuándo usarlo.** Transformaciones/filtros/colecciones. No reutilices un stream consumido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t4 && cd /tmp/j20-t4
cat > DemoLazy.java << 'JAVA'
import java.util.*;
public class DemoLazy { public static void main(String[] args){ var s=List.of(1,2,3).stream().map(x->{ System.out.println("map"+x); return x*2; }); System.out.println("antes"); s.forEach(x->{}); } }
JAVA
javac DemoLazy.java && java DemoLazy
```

**Caso de uso real.** Evitar trabajo innecesario con `findFirst`.

**Error común.** Esperar ejecución sin terminal. Corrección: agregar operación terminal.

**Verificación (2026-05-22).** Imprime `antes` antes de los `map...`.

#### Orden y efectos secundarios

**Definición formal.** El orden de evaluación depende del pipeline/fuente; efectos secundarios son mutaciones de estado externo durante operaciones.

**Para qué sirve.** Razonar sobre corrección.

**Cuándo evitar efectos.** En `map/filter` preferir pureza.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t4
cat > DemoSide.java << 'JAVA'
import java.util.*; import java.util.stream.*;
public class DemoSide { public static void main(String[] args){ List<Integer> out = List.of(1,2,3).stream().map(x->x*2).collect(Collectors.toList()); System.out.println(out); } }
JAVA
javac DemoSide.java && java DemoSide
```

**Caso de uso real.** Acumular resultado con collector, no con `map` mutante.

**Error común.** `map(x -> {lista.add(x); return x;})`. Corrección: usar `collect`.

**Verificación (2026-05-22).** Salida: `[2, 4, 6]`.

### Tema 5: UnaryOperator y BinaryOperator · Intermedio · 35 min

La salida conserva el tipo.

#### `UnaryOperator<T>`

**Definición formal.** Especialización de `Function<T,T>` donde entrada y salida son del mismo tipo.

**Para qué sirve.** Transformaciones del mismo tipo: normalizar, incrementar, limpiar.

**Cuándo usarlo.** Cuando el tipo no cambia.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t5 && cd /tmp/j20-t5
cat > DemoUnary.java << 'JAVA'
import java.util.function.*;
public class DemoUnary { public static void main(String[] args){ UnaryOperator<String> trim=String::trim; System.out.println(trim.apply(" a ")); } }
JAVA
javac DemoUnary.java && java DemoUnary
```

**Caso de uso real.** Normalizar strings.

**Error común.** Usar `Function<String,String>` cuando `UnaryOperator` comunica mejor intención. Corrección: usar la especialización.

**Verificación (2026-05-22).** Salida: `a`.

#### `BinaryOperator<T>`

**Definición formal.** Especialización de `BiFunction<T,T,T>`: combina dos valores del mismo tipo en uno del mismo tipo.

**Para qué sirve.** Reducciones/merge.

**Cuándo usarlo.** `reduce`, acumulación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t5
cat > DemoBinary.java << 'JAVA'
import java.util.function.*; import java.util.*;
public class DemoBinary { public static void main(String[] args){ BinaryOperator<Integer> suma=Integer::sum; System.out.println(List.of(1,2,3).stream().reduce(0,suma)); } }
JAVA
javac DemoBinary.java && java DemoBinary
```

**Caso de uso real.** Sumar totales.

**Error común.** Reducir sin identidad apropiada. Corrección: elegir identidad neutra correcta.

**Verificación (2026-05-22).** Salida: `6`.


### Tema 6: Referencias a métodos: escribir la operación sin repetirla · Intermedio · 40 min

Usar referencias a métodos cuando mejoran claridad.

#### Referencias a métodos

**Definición formal.** Sintaxis `Clase::metodo`, `obj::metodo`, `Clase::new` para referir un método/constructor existente compatible con una interfaz funcional.

**Para qué sirve.** Código más legible que lambdas triviales.

**Cuándo usarlo y cuándo no.** Úsalo cuando el nombre comunica intención. Si la lambda es más clara, usa lambda.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t6 && cd /tmp/j20-t6
cat > DemoRef.java << 'JAVA'
import java.util.*;
public class DemoRef { public static void main(String[] args){ List.of("a","b").forEach(System.out::println); } }
JAVA
javac DemoRef.java && java DemoRef
```

**Caso de uso real.** `String::trim`, `Guia::getId`.

**Error común.** Forzar method reference ilegible. Corrección: priorizar legibilidad.

**Verificación (2026-05-22).** Salida: `a`, `b`.

#### Referencia a constructor

**Definición formal.** `Tipo::new` crea una instancia usando un constructor compatible con la interfaz funcional.

**Para qué sirve.** Fábricas simples.

**Cuándo usarlo.** Creación directa sin lógica adicional.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t6
cat > DemoCtor.java << 'JAVA'
import java.util.function.*;
class G { String id; G(String id){ this.id=id; } }
public class DemoCtor { public static void main(String[] args){ Function<String,G> f=G::new; System.out.println(f.apply("G1").id); } }
JAVA
javac DemoCtor.java && java DemoCtor
```

**Caso de uso real.** Mapear IDs a objetos.

**Error común.** Usar constructor ref cuando se necesita validación compleja. Corrección: lambda/fábrica explícita.

**Verificación (2026-05-22).** Salida: `G1`.

### Tema 7: Optional: buscar un envío que puede no existir · Intermedio · 35 min

Modelar ausencia sin `null`.

#### `Optional`

**Definición formal.** `Optional<T>` es un contenedor que puede contener un valor o estar vacío.

**Para qué sirve.** Hacer explícita la ausencia en retornos.

**Cuándo usarlo y cuándo no.** Úsalo en retornos de búsqueda. No lo uses para campos de entidad/JPA o parámetros por todos lados.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t7 && cd /tmp/j20-t7
cat > DemoOpt.java << 'JAVA'
import java.util.*;
public class DemoOpt { static Optional<String> buscar(boolean ok){ return ok?Optional.of("G1"):Optional.empty(); }
  public static void main(String[] args){ System.out.println(buscar(true).orElse("NA")); System.out.println(buscar(false).orElse("NA")); }
}
JAVA
javac DemoOpt.java && java DemoOpt
```

**Caso de uso real.** Buscar por ID.

**Error común.** `optional.get()` sin comprobar. Corrección: `orElse`, `orElseThrow`, `ifPresent`, `map`.

**Verificación (2026-05-22).** Salida: `G1`, `NA`.

#### `map/flatMap/orElseThrow`

**Definición formal.** `map` transforma valor si existe; `flatMap` evita `Optional<Optional<T>>`; `orElseThrow` falla explícitamente si está vacío.

**Para qué sirve.** Componer flujos con ausencia.

**Cuándo usarlo.** Encadenar transformaciones seguras.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t7
cat > DemoOpt2.java << 'JAVA'
import java.util.*;
public class DemoOpt2 { public static void main(String[] args){ Optional<String> o=Optional.of("g1"); System.out.println(o.map(String::toUpperCase).orElse("NA")); } }
JAVA
javac DemoOpt2.java && java DemoOpt2
```

**Caso de uso real.** Mapear entidad opcional a DTO.

**Error común.** `orElse` con cómputo costoso siempre evaluado. Corrección: `orElseGet`.

**Verificación (2026-05-22).** Salida: `G1`.

### Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar · Intermedio · 40 min

Construir pipelines de datos.

#### `filter` y `map`

**Definición formal.** `filter` conserva elementos que cumplen un predicado; `map` transforma cada elemento.

**Para qué sirve.** Seleccionar y convertir datos.

**Cuándo usarlo.** Pipelines declarativos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t8 && cd /tmp/j20-t8
cat > DemoFM.java << 'JAVA'
import java.util.*;
public class DemoFM { public static void main(String[] args){ System.out.println(List.of(1,2,3,4).stream().filter(x->x%2==0).map(x->x*10).toList()); } }
JAVA
javac DemoFM.java && java DemoFM
```

**Caso de uso real.** Filtrar activos y mapear IDs.

**Error común.** Orden confuso de operaciones. Corrección: leer pipeline paso a paso.

**Verificación (2026-05-22).** Salida: `[20, 40]`.

#### `flatMap` y `sorted`

**Definición formal.** `flatMap` aplana streams anidados; `sorted` ordena elementos (natural o por comparator).

**Para qué sirve.** Normalizar estructuras y ordenar salida.

**Cuándo usarlo.** Listas de listas, etiquetas, relaciones 1:N.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t8
cat > DemoFlat.java << 'JAVA'
import java.util.*;
public class DemoFlat { public static void main(String[] args){ System.out.println(List.of(List.of(1,2),List.of(3)).stream().flatMap(List::stream).sorted((a,b)->b-a).toList()); } }
JAVA
javac DemoFlat.java && java DemoFlat
```

**Caso de uso real.** Aplanar ítems de pedidos.

**Error común.** Usar `map` cuando se necesita `flatMap`. Corrección: si cada elemento produce múltiples valores, `flatMap`.

**Verificación (2026-05-22).** Salida: `[3, 2, 1]`.

### Tema 9: Streams terminales: encontrar, contar y combinar resultados · Intermedio · 40 min

Cerrar el pipeline con una operación terminal.

#### Terminales básicas (`forEach`, `count`, `findFirst`)

**Definición formal.** Operaciones terminales consumen el stream y producen resultado o efecto final.

**Para qué sirve.** Obtener resultado final.

**Cuándo usarlo.** Al final del pipeline.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t9 && cd /tmp/j20-t9
cat > DemoTerm.java << 'JAVA'
import java.util.*;
public class DemoTerm { public static void main(String[] args){ var s=List.of(1,2,3); System.out.println(s.stream().count()); System.out.println(s.stream().findFirst().orElse(-1)); } }
JAVA
javac DemoTerm.java && java DemoTerm
```

**Caso de uso real.** Contar registros filtrados.

**Error común.** Reutilizar stream tras terminal. Corrección: crear nuevo stream.

**Verificación (2026-05-22).** Salida: `3`, `1`.

#### `reduce`

**Definición formal.** `reduce` combina elementos en un solo resultado usando una función asociativa acumuladora.

**Para qué sirve.** Sumas, máximos, agregaciones custom.

**Cuándo usarlo.** Cuando no basta con collector simple.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t9
cat > DemoReduce.java << 'JAVA'
import java.util.*;
public class DemoReduce { public static void main(String[] args){ System.out.println(List.of(1,2,3).stream().reduce(0,Integer::sum)); } }
JAVA
javac DemoReduce.java && java DemoReduce
```

**Caso de uso real.** Totalizar importe.

**Error común.** Reducir con operación no asociativa en paralelo. Corrección: asegurar asociatividad.

**Verificación (2026-05-22).** Salida: `6`.

### Tema 10: Collectors: formar listas, mapas, grupos y texto · Intermedio · 40 min

Materializar resultados.

#### `Collectors.toList/toMap`

**Definición formal.** Collectors acumulan elementos de un stream en estructuras finales.

**Para qué sirve.** Construir listas, mapas, sets.

**Cuándo usarlo.** Al final del pipeline.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t10 && cd /tmp/j20-t10
cat > DemoColl.java << 'JAVA'
import java.util.*; import java.util.stream.*;
public class DemoColl { public static void main(String[] args){ System.out.println(List.of("a","b").stream().collect(Collectors.joining(","))); } }
JAVA
javac DemoColl.java && java DemoColl
```

**Caso de uso real.** CSV simple, mapa por ID.

**Error común.** `toMap` con claves duplicadas sin merge. Corrección: proveer función de merge.

**Verificación (2026-05-22).** Salida: `a,b`.

#### `groupingBy` y `joining`

**Definición formal.** `groupingBy` agrupa por clave; `joining` concatena strings.

**Para qué sirve.** Reportes y agregaciones.

**Cuándo usarlo.** Agrupar resultados por categoría.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t10
cat > DemoGroup.java << 'JAVA'
import java.util.*; import java.util.stream.*;
public class DemoGroup { public static void main(String[] args){ Map<Integer,List<String>> m = Stream.of("a","bb","cc").collect(Collectors.groupingBy(String::length)); System.out.println(m.get(2)); } }
JAVA
javac DemoGroup.java && java DemoGroup
```

**Caso de uso real.** Agrupar guías por estado.

**Error común.** Asumir orden en grupos sin especificarlo. Corrección: usar collectors/estructuras con orden si se requiere.

**Verificación (2026-05-22).** Salida: `[bb, cc]`.

### Tema 11: Streams paralelos · Intermedio · 40 min

Comparar antes de acelerar.

#### `parallelStream`

**Definición formal.** Ejecuta pipeline sobre el ForkJoinPool común para procesar en paralelo.

**Para qué sirve.** Potencial speedup en cargas CPU-bound grandes.

**Cuándo usarlo y cuándo no.** Úsalo solo con datos grandes, operaciones puras, y tras medir. No en I/O bloqueante o colecciones pequeñas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t11 && cd /tmp/j20-t11
cat > DemoPar.java << 'JAVA'
import java.util.stream.*;
public class DemoPar { public static void main(String[] args){ System.out.println(IntStream.range(0,1000).parallel().sum()); } }
JAVA
javac DemoPar.java && java DemoPar
```

**Caso de uso real.** Agregación CPU-bound sobre dataset grande.

**Error común.** Usar parallel por defecto. Corrección: medir.

**Verificación (2026-05-22).** Salida: `499500`.

#### Medición y seguridad

**Definición formal.** Evaluar rendimiento y corrección (race conditions, orden, overhead) antes de adoptar paralelismo.

**Para qué sirve.** Evitar regresiones.

**Cuándo usarlo.** Siempre antes de dejar parallel.

**Ejemplo mínimo enfocado (ejecutable).**

```java
long t1=System.nanoTime(); /* secuencial */ long t2=System.nanoTime(); /* paralelo */ // comparar con dataset realista
```

**Caso de uso real.** Benchmark con JMH.

**Error común.** Estado compartido mutable dentro de parallel stream. Corrección: collectors thread-safe/pureza.

**Verificación.** **Nota:** microbenchmark casero no concluyente; usar JMH para decisiones.

### Tema 12: Pureza y efectos · Intermedio · 40 min

Calcular separado de guardar o imprimir.

#### Funciones puras

**Definición formal.** Una función pura devuelve el mismo resultado para mismos inputs y no tiene efectos secundarios observables.

**Para qué sirve.** Testabilidad y razonamiento.

**Cuándo usarlo.** Núcleo de cálculo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t12 && cd /tmp/j20-t12
cat > DemoPure.java << 'JAVA'
public class DemoPure { static int doble(int x){ return x*2; } public static void main(String[] args){ System.out.println(doble(2)); System.out.println(doble(2)); } }
JAVA
javac DemoPure.java && java DemoPure
```

**Caso de uso real.** Cálculo de impuesto.

**Error común.** Esconder I/O en función “de cálculo”. Corrección: separar bordes.

**Verificación (2026-05-22).** Salida: `4`, `4`.

#### Efectos en el borde

**Definición formal.** Efectos (I/O, BD, logs) se ejecutan en capas de borde, no en el núcleo puro.

**Para qué sirve.** Arquitectura testeable.

**Cuándo usarlo.** Siempre que mezcles cálculo y persistencia.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j20-t12
cat > DemoBorde.java << 'JAVA'
public class DemoBorde { static int calc(int x){ return x+1; } static void guardar(int x){ System.out.println("save:"+x); } public static void main(String[] args){ int r=calc(1); guardar(r); } }
JAVA
javac DemoBorde.java && java DemoBorde
```

**Caso de uso real.** Service calcula, repository guarda.

**Error común.** Mezclar cálculo y JDBC en el mismo método. Corrección: separar responsabilidades.

**Verificación (2026-05-22).** Salida: `save:2`.

### Tema 13: Flow API: publicar datos con demanda y cierre · Intermedio · 40 min

Publicar datos con backpressure básico.

#### Flow API

**Definición formal.** `java.util.concurrent.Flow` define interfaces `Publisher`, `Subscriber`, `Subscription`, `Processor` para reactive streams con backpressure.

**Para qué sirve.** Procesar flujos asíncronos con control de demanda.

**Cuándo usarlo.** Streams de eventos/datos con productor más rápido que consumidor. Para casos simples, usa APIs de más alto nivel.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j20-t13 && cd /tmp/j20-t13
cat > DemoFlow.java << 'JAVA'
import java.util.concurrent.*;
public class DemoFlow {
  public static void main(String[] args) throws Exception {
    SubmissionPublisher<String> pub = new SubmissionPublisher<>();
    pub.subscribe(new Flow.Subscriber<>() {
      Flow.Subscription sub;
      public void onSubscribe(Flow.Subscription s){ sub=s; s.request(1); }
      public void onNext(String item){ System.out.println(item); sub.request(1); }
      public void onError(Throwable t){ t.printStackTrace(); }
      public void onComplete(){ System.out.println("done"); }
    });
    pub.submit("A"); pub.submit("B"); pub.close();
    Thread.sleep(200);
  }
}
JAVA
javac DemoFlow.java && java DemoFlow
```

**Caso de uso real.** Flujo de eventos con control de demanda.

**Error común.** No llamar `request(n)`. Síntoma: no consume. Corrección: solicitar demanda.

**Verificación (2026-05-22).** Salida: `A`, `B`, `done`.

#### Backpressure

**Definición formal.** Mecanismo donde el consumidor señala cuántos elementos puede procesar (`request(n)`), evitando sobrecarga.

**Para qué sirve.** Estabilidad ante productores rápidos.

**Cuándo usarlo.** Pipelines asíncronos.

**Ejemplo mínimo enfocado (ejecutable).** En `DemoFlow`, `request(1)` controla la demanda.

**Caso de uso real.** Ingesta de telemetría.

**Error común.** `request(Long.MAX_VALUE)` sin control. Corrección: demanda acotada.

**Verificación (2026-05-22).** Observada por ejecución de `DemoFlow`.

## Cierre del módulo

La programación funcional en Java es una caja de herramientas: interfaces funcionales, composición, streams, Optional y Flow. Úsala para claridad y corrección; evita convertirla en dogma cuando un bucle simple sea más legible.
