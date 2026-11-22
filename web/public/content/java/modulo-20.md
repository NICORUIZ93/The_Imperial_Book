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

**Caso guía**

Necesitas filtrar envíos pesados, convertirlos en etiqueta, registrarlos y generar un turno. Son cuatro formas de comportamiento distintas; Java las modela con interfaces funcionales.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *interfaz funcional* tiene exactamente un método abstracto. `Predicate<T>` evalúa `T -> boolean`; `Function<T,R>` transforma `T -> R`; `Consumer<T>` consume `T -> void`; `Supplier<T>` produce `() -> T`. Una *lambda* es una implementación concisa de una interfaz funcional.

**Contrato / invariantes / reglas.** La lambda debe ser compatible con la firma del método abstracto. Las variables locales capturadas deben ser efectivamente finales. Las funciones deberían ser puras cuando sea posible; `Consumer` representa efecto por diseño. `null` como dato es un contrato peligroso: documenta o evita. El tipo objetivo de la lambda lo define el contexto.

**Modelo mental.** Son cuatro enchufes: preguntar (Predicate), transformar (Function), hacer algo (Consumer), proveer (Supplier).

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Formas.java`:
```java
import java.util.List;
import java.util.function.*;

public class Formas {
    record Envio(String guia, String destino, double pesoKg) {}

    public static void main(String[] args) {
        Predicate<Envio> revisar = e -> e.pesoKg() > 20;
        Function<Envio, String> etiqueta = e -> e.guia() + " -> " + e.destino();
        Consumer<String> registrar = texto -> System.out.println("[log] " + texto);
        Supplier<String> turno = () -> "Turno AM";

        List<Envio> envios = List.of(
            new Envio("ENV-1", "Bogotá", 5.5),
            new Envio("ENV-2", "Medellín", 32.0)
        );
        for (Envio e : envios) {
            if (revisar.test(e)) registrar.accept(turno.get() + " | " + etiqueta.apply(e));
        }
    }
}
```

**Desglose del código**

- `Predicate.test` devuelve boolean.
- `Function.apply` transforma el valor.
- `Consumer.accept` ejecuta un efecto.
- `Supplier.get` produce un valor sin entrada.

**Ejecución y salida real**

```bash
javac Formas.java
java Formas
```

```text
[log] Turno AM | ENV-2 -> Medellín
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Lambda no compila | Firma incompatible con interfaz funcional | Revisa tipo objetivo y parámetros |
| Captura de variable falla | Variable local no efectivamente final | No reasignes la variable capturada |
| Lógica opaca en lambda | Lambda hace demasiado | Extrae método con nombre claro |

**Verificación rápida**

Cambia el umbral a `20` por `30` y verifica qué envíos se registran.

### Tema 2: Function y BiFunction: transformar uno o dos datos · Básico · 35 min

**Caso guía**

Normalizas un texto con una `Function`, pero calcular un total requiere precio y cantidad: dos entradas, una salida. Ahí entra `BiFunction`.

**Fundamento técnico y modelo mental**

**Definición formal.** `Function<T,R>` modela una transformación unaria `T -> R`. `BiFunction<T,U,R>` modela una transformación binaria `(T,U) -> R`. Ambas son interfaces funcionales puras en contrato: reciben entrada y devuelven resultado.

**Contrato / invariantes / reglas.** Las funciones deben declarar claramente su dominio (entradas válidas) y codominio (resultado). Si el resultado depende de estado externo mutable, la función deja de ser pura. `BiFunction` no debe usarse para ocultar parámetros que deberían ser un objeto de dominio. Los tipos genéricos se validan en compilación.

**Modelo mental.** `Function` es una máquina con una tolva; `BiFunction` con dos tolvas; ambas entregan un producto.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Transformaciones.java`:
```java
import java.util.function.BiFunction;
import java.util.function.Function;

public class Transformaciones {
    public static void main(String[] args) {
        Function<String, String> normalizar = s -> s.trim().toUpperCase();
        BiFunction<Integer, Integer, Integer> total = (precio, cantidad) -> precio * cantidad;

        System.out.println(normalizar.apply("  g-1 "));
        System.out.println(total.apply(2000, 3));
    }
}
```

**Desglose del código**

- `normalizar` transforma una cadena.
- `total` combina dos enteros en un resultado.
- `apply` ejecuta la función.

**Ejecución y salida real**

```bash
javac Transformaciones.java
java Transformaciones
```

```text
G-1
6000
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Tipos no encajan | Genéricos mal declarados | Revisa `T,U,R` |
| `BiFunction` confusa | Demasiadas responsabilidades | Modela un objeto de entrada |
| NullPointerException | Entrada null no controlada | Valida contrato de entrada |

**Verificación rápida**

Cambia `cantidad` a `0` y confirma el resultado esperado.

### Tema 3: Componer sin anidar: andThen, compose, negate y reglas encadenadas · Intermedio · 40 min

**Caso guía**

Validas correo: primero limpias, luego validas. También quieres combinar reglas con AND/OR/NOT. Si anidas llamadas, el código se vuelve difícil de leer.

**Fundamento técnico y modelo mental**

**Definición formal.** La *composición de funciones* construye una nueva función aplicando funciones existentes en secuencia. `andThen` aplica `f` y luego `g`; `compose` aplica `g` y luego `f`. En `Predicate`, `and`, `or` y `negate` componen predicados booleanos.

**Contrato / invariantes / reglas.** En `f.andThen(g)`, la salida de `f` debe ser compatible con la entrada de `g`. La composición preserva el comportamiento de cada pieza; el orden importa. Los predicados compuestos deben ser legibles y sin efectos secundarios. Componer no debe ocultar reglas de negocio importantes: nombra las piezas.

**Modelo mental.** Es una línea de ensamblaje: cada estación hace una cosa; el orden de las estaciones cambia el producto.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Composicion.java`:
```java
import java.util.function.*;

public class Composicion {
    public static void main(String[] args) {
        Function<String, String> limpiar = s -> s.trim().toLowerCase();
        Predicate<String> tieneArroba = s -> s.contains("@");
        Predicate<String> noVacio = s -> !s.isBlank();
        Predicate<String> correoValido = noVacio.and(tieneArroba);

        Function<String, Boolean> flujo = limpiar.andThen(correoValido::test);
        System.out.println(flujo.apply(" ANA@RUTAFLOW.COM "));
        System.out.println(flujo.apply("   "));

        Predicate<String> empiezaCo = s -> s.startsWith("CO-");
        System.out.println(empiezaCo.negate().test("MX-1"));
    }
}
```

**Desglose del código**

- `limpiar.andThen(correoValido::test)` aplica limpieza antes de validar.
- `and` combina predicados; ambos deben ser true.
- `negate` invierte la condición.
- Nombrar cada pieza mejora legibilidad.

**Ejecución y salida real**

```bash
javac Composicion.java
java Composicion
```

```text
true
false
true
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Resultado inesperado | Orden de composición incorrecto | Dibuja el flujo de datos |
| NPE en predicado | Entrada null | Define contrato de null o usa filtro previo |
| Cadena ilegible | Demasiada composición inline | Extrae variables con nombres |

**Verificación rápida**

Cambia `andThen` por `compose` donde no corresponda y observa el error de tipos o de lógica.

### Tema 4: Streams como composición: pereza, orden y efectos que se esconden · Intermedio · 40 min

**Caso guía**

Creas un stream con `filter` y `map`, pero no ves salida. Agregas un `count()` y de pronto se ejecuta. Además, intentas reutilizar el stream y falla.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *Stream* es una secuencia de elementos que soporta operaciones agregadas. Las operaciones *intermedias* son lazy y devuelven otro stream; las *terminales* disparan la evaluación y consumen el stream. Un stream no es una estructura de datos: no almacena elementos como una colección.

**Contrato / invariantes / reglas.** Sin operación terminal, el pipeline no ejecuta. Un stream no puede reutilizarse tras una operación terminal (`IllegalStateException`). Las operaciones deben ser no interferentes (no modificar la fuente durante el traversal) y, preferiblemente, sin estado/side effects. `peek` es para depuración, no para lógica de negocio.

**Modelo mental.** Un stream es una receta; la operación terminal es “cocinar”. Mientras no cocinas, no pasa nada.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `DemoStream.java`:
```java
import java.util.List;

public class DemoStream {
    public static void main(String[] args) {
        List<String> guias = List.of("G-1", "G-2", "X-1");
        long total = guias.stream()
            .filter(g -> g.startsWith("G-"))
            .peek(g -> System.out.println("viendo:" + g))
            .count();
        System.out.println("total=" + total);
    }
}
```

**Desglose del código**

- `filter` y `peek` son intermedias: no ejecutan solas.
- `count` es terminal: dispara el pipeline.
- `peek` muestra el paso, pero no debe usarse para mutar estado.

**Ejecución y salida real**

```bash
javac DemoStream.java
java DemoStream
```

```text
viendo:G-1
viendo:G-2
total=2
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Nada se ejecuta | Falta operación terminal | Agrega `collect`, `forEach`, `count`, etc. |
| `IllegalStateException: stream has already been operated upon` | Reutilizaste stream | Crea un nuevo stream desde la fuente |
| Bugs por efectos en `peek/map` | Side effects ocultos | Separa cálculo puro de efectos |

**Verificación rápida**

Guarda el stream en una variable, llámalo dos veces y observa la excepción.

### Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo · Intermedio · 35 min

**Caso guía**

Quieres normalizar un texto y obtener texto, o sumar dos totales y obtener total. La entrada y salida son del mismo tipo.

**Fundamento técnico y modelo mental**

**Definición formal.** `UnaryOperator<T>` es una especialización de `Function<T,T>`. `BinaryOperator<T>` es una especialización de `BiFunction<T,T,T>`. Expresan transformaciones cerradas sobre un tipo.

**Contrato / invariantes / reglas.** El operador debe respetar el tipo: no puede devolver otro tipo. En reducciones, `BinaryOperator` debe ser idealmente asociativo y sin efectos secundarios para resultados predecibles, especialmente en paralelismo. Usar operadores con mutación compartida causa bugs difíciles.

**Modelo mental.** Un operador es una prensa del mismo molde: entra pieza de tipo T, sale pieza de tipo T.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Operadores.java`:
```java
import java.util.function.*;

public class Operadores {
    public static void main(String[] args) {
        UnaryOperator<String> limpiar = s -> s.trim().toUpperCase();
        BinaryOperator<Integer> sumar = Integer::sum;

        System.out.println(limpiar.apply("  g-1 "));
        System.out.println(sumar.apply(10, 20));
    }
}
```

**Desglose del código**

- `UnaryOperator<String>` garantiza `String -> String`.
- `BinaryOperator<Integer>` garantiza `(Integer,Integer)->Integer`.
- `Integer::sum` es una referencia a método compatible.

**Ejecución y salida real**

```bash
javac Operadores.java
java Operadores
```

```text
G-1
30
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Quieres cambiar tipo | Usaste Operator cuando necesitabas Function | Usa `Function<T,R>` |
| Reducción inconsistente en paralelo | Operador no asociativo/con efectos | Hazlo asociativo y puro |
| Nulls inesperados | No definiste contrato | Valida o usa `Optional` donde corresponda |

**Verificación rápida**

Cambia `UnaryOperator<String>` a una lambda que devuelva `int`; el compilador debe rechazarla.

### Tema 6: Referencias a métodos: escribir la operación sin repetirla · Intermedio · 40 min

**Caso guía**

Tienes lambdas que solo llaman un método existente: `s -> s.trim()`, `System.out::println` es más claro. Las referencias a métodos son azúcar sintáctica con tipado.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *referencia a método* es una forma compacta de lambda que delega directamente a un método existente. Formas comunes: `Clase::metodoEstatico`, `obj::metodoInstancia`, `Clase::metodoInstancia`, `Clase::new`.

**Contrato / invariantes / reglas.** La referencia debe ser compatible con la interfaz funcional objetivo. `Clase::metodoInstancia` recibe la instancia como primer argumento implícito. `Clase::new` se usa como constructor compatible. No usar referencia a método si oculta parámetros o hace menos legible la intención.

**Modelo mental.** Es pasar la herramienta directamente en vez de envolverla en otra caja.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Referencias.java`:
```java
import java.util.*;
import java.util.function.*;

public class Referencias {
    static String etiqueta(String guia) { return "GUIA:" + guia; }

    public static void main(String[] args) {
        Function<String, String> f1 = Referencias::etiqueta;
        UnaryOperator<String> f2 = String::trim;
        Supplier<List<String>> nuevaLista = ArrayList::new;
        Consumer<String> out = System.out::println;

        List<String> lista = nuevaLista.get();
        lista.add(f1.apply(f2.apply(" g-1 ")));
        lista.forEach(out);
    }
}
```

**Desglose del código**

- `Referencias::etiqueta` referencia método estático.
- `String::trim` referencia método de instancia sobre el argumento.
- `ArrayList::new` referencia constructor.
- `System.out::println` referencia método de instancia en objeto específico.

**Ejecución y salida real**

```bash
javac Referencias.java
java Referencias
```

```text
GUIA:g-1
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| “invalid method reference” | Firma incompatible | Verifica interfaz funcional objetivo |
| Menos legible que lambda | Caso complejo | Usa lambda explícita |
| Confusión con `Clase::metodoInstancia` | No entiendes receptor | Recuerda que el primer parámetro puede ser el receptor |

**Verificación rápida**

Reemplaza una referencia por la lambda equivalente y confirma que el comportamiento es igual.

### Tema 7: Optional: buscar un envío que puede no existir · Intermedio · 35 min

**Caso guía**

Buscas una guía por número. Puede existir o no. Devolver `null` obliga a checks dispersos y olvidables.

**Fundamento técnico y modelo mental**

**Definición formal.** `Optional<T>` es un contenedor que puede contener un valor no nulo o estar vacío. Expresa ausencia en el tipo de retorno de forma explícita.

**Contrato / invariantes / reglas.** `Optional` es para retornos, no para campos/parametros en todas partes ni para serialización por defecto. Evita `get()` sin comprobar; usa `orElse`, `orElseGet`, `orElseThrow`, `map`, `ifPresent`. `orElse` evalúa el valor por defecto siempre; `orElseGet` lo evalúa perezosamente. No envolver colecciones en Optional: devuelve colección vacía.

**Modelo mental.** `Optional` es una caja etiquetada “puede estar vacía”: te obliga a decidir qué hacer si no hay nada.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `DemoOptional.java`:
```java
import java.util.*;

public class DemoOptional {
    static Optional<String> buscar(List<String> guias, String buscada) {
        for (String g : guias) if (g.equals(buscada)) return Optional.of(g);
        return Optional.empty();
    }

    public static void main(String[] args) {
        List<String> guias = List.of("G-1", "G-2");
        System.out.println(buscar(guias, "G-2").map(String::toLowerCase).orElse("no"));
        System.out.println(buscar(guias, "G-9").orElse("no"));
    }
}
```

**Desglose del código**

- `Optional.of` para valor presente no nulo; `Optional.empty` para ausencia.
- `map` transforma si hay valor.
- `orElse` provee fallback.

**Ejecución y salida real**

```bash
javac DemoOptional.java
java DemoOptional
```

```text
g-2
no
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `NoSuchElementException` | Usaste `get()` en vacío | Usa `orElseThrow` con mensaje o `orElse` |
| Coste innecesario | `orElse` crea objeto caro siempre | Usa `orElseGet` |
| Diseño raro | Optional en campos/params | Usa nullabilidad documentada u objetos de dominio |

**Verificación rápida**

Cambia `orElse` por `get()` en el caso ausente y observa la excepción.

### Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar · Intermedio · 40 min

**Caso guía**

Tienes envíos con etiquetas; necesitas filtrar por peso, extraer destinos, aplanar listas y ordenar resultados.

**Fundamento técnico y modelo mental**

**Definición formal.** Las operaciones intermedias de Stream transforman un stream en otro stream. Son lazy: no procesan hasta una operación terminal. Ejemplos: `filter`, `map`, `flatMap`, `sorted`, `distinct`, `limit`.

**Contrato / invariantes / reglas.** Deben ser no interferentes y preferiblemente stateless. `sorted` es stateful y puede requerir ver todo el stream. `flatMap` aplana `Stream<Stream<T>>` conceptual a `Stream<T>`. El orden depende de la fuente y de operaciones; en paralelo puede cambiar si no se cuida. No mutar la fuente dentro del pipeline.

**Modelo mental.** Son estaciones de una cinta transportadora: cada una modifica el flujo, pero la cinta solo se mueve cuando alguien recoge al final.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Intermedias.java`:
```java
import java.util.*;
import java.util.stream.*;

public class Intermedias {
    public static void main(String[] args) {
        List<List<String>> lotes = List.of(List.of("BOG", "MED"), List.of("CALI", "BOG"));
        List<String> destinos = lotes.stream()
            .flatMap(List::stream)
            .filter(d -> !d.isBlank())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        System.out.println(destinos);
    }
}
```

**Desglose del código**

- `flatMap` aplana los lotes.
- `distinct` elimina duplicados.
- `sorted` ordena.
- `collect` es terminal.

**Ejecución y salida real**

```bash
javac Intermedias.java
java Intermedias
```

```text
[BOG, CALI, MED]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Stream<Stream<T>>` inesperado | Usaste `map` donde era `flatMap` | Usa `flatMap` |
| Orden perdido en paralelo | Operación no estable o suposiciones | Usa `forEachOrdered` o reconsidera paralelo |
| Pipeline lento | `sorted/distinct` en grandes volúmenes | Mide y evalúa estructura de datos |

**Verificación rápida**

Cambia `flatMap` por `map` y observa el cambio de tipo/resultado.

### Tema 9: Streams terminales: encontrar, contar y combinar resultados · Intermedio · 40 min

**Caso guía**

Tras filtrar envíos, quieres saber cuántos hay, si alguno es urgente, obtener el primero o reducir a un total.

**Fundamento técnico y modelo mental**

**Definición formal.** Una operación terminal produce un resultado o efecto secundario y consume el stream. Ejemplos: `forEach`, `collect`, `reduce`, `count`, `findFirst`, `findAny`, `anyMatch`, `allMatch`, `noneMatch`.

**Contrato / invariantes / reglas.** Tras la terminal, el stream queda consumido. `findAny` puede devolver cualquiera en paralelo; `findFirst` respeta encuentro. `reduce` requiere operación asociativa y función identidad adecuada para paralelismo. `forEach` en paralelo no garantiza orden; `forEachOrdered` sí.

**Modelo mental.** La terminal es la caja registradora: cierra el flujo y entrega resultado.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Terminales.java`:
```java
import java.util.*;

public class Terminales {
    public static void main(String[] args) {
        List<Integer> pesos = List.of(2, 5, 30, 12);
        System.out.println(pesos.stream().filter(p -> p > 20).count());
        System.out.println(pesos.stream().anyMatch(p -> p > 25));
        System.out.println(pesos.stream().reduce(0, Integer::sum));
        System.out.println(pesos.stream().filter(p -> p > 10).findFirst().orElse(-1));
    }
}
```

**Desglose del código**

- `count` devuelve cantidad.
- `anyMatch` hace short-circuit si encuentra.
- `reduce` combina elementos.
- `findFirst` devuelve Optional.

**Ejecución y salida real**

```bash
javac Terminales.java
java Terminales
```

```text
1
true
49
30
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `reduce` da resultado raro en paralelo | Función no asociativa/identidad mala | Usa identidad correcta y operación asociativa |
| Orden inesperado | `findAny` o `forEach` en paralelo | Usa `findFirst`/`forEachOrdered` |
| Reutilizas stream | Dos terminales | Crea nuevo stream |

**Verificación rápida**

Cambia `findFirst` por `findAny` en paralelo y observa que el contrato permite otro resultado.

### Tema 10: Collectors: formar listas, mapas, grupos y texto · Intermedio · 40 min

**Caso guía**

Necesitas agrupar envíos por ciudad, contar por estado o construir un string separado por comas. `Collectors` cubre estos casos comunes.

**Fundamento técnico y modelo mental**

**Definición formal.** Un `Collector` define cómo acumular elementos de un stream en un resultado final. `Collectors` provee implementaciones comunes: `toList`, `toSet`, `toMap`, `groupingBy`, `joining`, `counting`, etc.

**Contrato / invariantes / reglas.** `toMap` falla si hay claves duplicadas salvo que proveas merge function. Los collectors pueden ser mutables internamente pero el resultado debe usarse según su contrato. `groupingBy` crea mapa de clave a lista por defecto. Elegir la estructura de salida correcta importa más que “usar stream”.

**Modelo mental.** Los collectors son moldes de salida: el mismo stream puede terminar en lista, mapa, grupo o texto según el molde.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `DemoCollectors.java`:
```java
import java.util.*;
import java.util.stream.*;

public class DemoCollectors {
    record Envio(String ciudad, String estado) {}

    public static void main(String[] args) {
        List<Envio> envios = List.of(
            new Envio("BOG", "OK"),
            new Envio("MED", "OK"),
            new Envio("BOG", "FAIL")
        );
        Map<String, Long> porCiudad = envios.stream()
            .collect(Collectors.groupingBy(Envio::ciudad, Collectors.counting()));
        String ciudades = envios.stream().map(Envio::ciudad).distinct().sorted().collect(Collectors.joining(","));
        System.out.println(porCiudad.get("BOG"));
        System.out.println(ciudades);
    }
}
```

**Desglose del código**

- `groupingBy` + `counting` agrupa y cuenta.
- `joining` construye texto.
- `distinct().sorted()` estabiliza el resultado.

**Ejecución y salida real**

```bash
javac DemoCollectors.java
java DemoCollectors
```

```text
2
BOG,MED
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `IllegalStateException: Duplicate key` | `toMap` con claves repetidas | Provee merge function |
| Resultado mutable inesperado | Modificas la colección resultante | Copia si necesitas inmutabilidad |
| Collector complejo ilegible | Todo inline | Extrae collector o usa pasos claros |

**Verificación rápida**

Convierte la lista a `toMap(Envio::ciudad, e -> e)` sin merge y observa el fallo por duplicado.

### Tema 11: Streams paralelos: comparar antes de acelerarlos · Intermedio · 40 min

**Caso guía**

Tienes una operación costosa por elemento y piensas “lo pongo en parallelStream y ya”. A veces mejora, a veces empeora o da resultados desordenados.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *stream paralelo* divide el trabajo en subtareas ejecutadas en el common ForkJoinPool (por defecto). Puede mejorar throughput en cargas CPU-bound, grandes y dividibles, pero introduce overhead de coordinación.

**Contrato / invariantes / reglas.** Solo usar paralelo con operaciones puras, asociativas/no dependientes de orden cuando corresponda, y sin estado compartido mutable. Medir antes y después. El origen de datos, el tamaño, el costo por elemento y el costo de combinación determinan el beneficio. `forEachOrdered`/`findFirst` pueden reducir beneficio por restricciones de orden.

**Modelo mental.** Paralelizar es poner más cocineros: ayuda si la cocina es grande y las tareas se pueden partir; si la olla es pequeña, se estorban.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `DemoParalelo.java`:
```java
import java.util.stream.*;

public class DemoParalelo {
    static long cpu(int n) {
        long x = n;
        for (int i = 0; i < 2000; i++) x = (x * 1103515245 + 12345) & Integer.MAX_VALUE;
        return x;
    }

    public static void main(String[] args) {
        int n = 200_000;
        long t1 = System.nanoTime();
        long a = IntStream.range(0, n).mapToLong(DemoParalelo::cpu).sum();
        long t2 = System.nanoTime();
        long b = IntStream.range(0, n).parallel().mapToLong(DemoParalelo::cpu).sum();
        long t3 = System.nanoTime();
        System.out.println(a == b);
        System.out.println((t2 - t1) > 0);
        System.out.println((t3 - t2) > 0);
    }
}
```

**Desglose del código**

- La misma operación se ejecuta secuencial y en paralelo.
- `cpu` simula trabajo CPU-bound.
- Se compara corrección (`a==b`) y se miden tiempos.
- No asumas que paralelo siempre gana.

**Ejecución y salida real**

```bash
javac DemoParalelo.java
java DemoParalelo
```

```text
true
true
true
```

Los tiempos varían; la igualdad de resultado es lo estable.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Más lento en paralelo | Overhead mayor que trabajo | Mide y mantén secuencial |
| Resultado incorrecto | Estado compartido mutable | Elimina estado compartido o usa reducción segura |
| Contención global | Uso del common pool en carga sensible | Considera pool dedicado o otro modelo |

**Verificación rápida**

Baja `n` a un valor pequeño; el paralelo puede volverse peor por overhead.

### Tema 12: Pureza y efectos: calcular separado de guardar o imprimir · Intermedio · 40 min

**Caso guía**

Un `map` que escribe en BD o imprime logs hace el pipeline difícil de razonar y testear. Quieres separar cálculo puro de efectos.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *función pura* devuelve el mismo resultado para los mismos argumentos y no produce efectos secundarios observables. Un *efecto secundario* es cualquier interacción observable fuera del valor devuelto: I/O, mutación, logging, red, tiempo.

**Contrato / invariantes / reglas.** El cálculo puro es fácil de testear y paralelizar. Los efectos deben estar en bordes explícitos (terminales, servicios de infraestructura). Mezclar efectos en lambdas intermedias rompe transparencia referencial y puede duplicarse o perderse según el stream. No es dogma absoluto: a veces un efecto controlado es necesario, pero debe ser deliberado.

**Modelo mental.** Primero cocina en cocina limpia (cálculo); luego sirve en la mesa (efecto). No sirvas mientras estás calculando la receta en medio de la olla.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `Pureza.java`:
```java
import java.util.*;
import java.util.stream.*;

public class Pureza {
    record Envio(String guia, int peso) {}
    record Etiqueta(String guia, String tipo) {}

    static Etiqueta etiquetar(Envio e) {
        return new Etiqueta(e.guia(), e.peso() > 20 ? "PESADO" : "NORMAL");
    }

    static void guardar(Etiqueta e) {
        System.out.println("guardar:" + e.guia() + "=" + e.tipo());
    }

    public static void main(String[] args) {
        List<Envio> envios = List.of(new Envio("G-1", 10), new Envio("G-2", 30));
        List<Etiqueta> etiquetas = envios.stream().map(Pureza::etiquetar).collect(Collectors.toList()); // puro
        etiquetas.forEach(Pureza::guardar); // efecto en borde
    }
}
```

**Desglose del código**

- `etiquetar` es pura: depende solo de la entrada.
- `collect` produce resultado.
- `guardar` concentra el efecto.

**Ejecución y salida real**

```bash
javac Pureza.java
java Pureza
```

```text
guardar:G-1=NORMAL
guardar:G-2=PESADO
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Test difícil de stream | Efectos en `map/filter` | Separa cálculo de I/O |
| Duplicación de efectos | Stream reejecutado o paralelo mal usado | Haz efectos idempotentes o en etapa controlada |
| Código “funcional” confuso | Side effects ocultos | Nombra y aísla efectos |

**Verificación rápida**

Mueve `guardar` dentro de `map` y observa que el pipeline mezcla responsabilidad; revierte a borde.

### Tema 13: Flow API: publicar datos con demanda y cierre · Intermedio · 40 min

**Caso guía**

Quieres procesar eventos a medida que llegan, sin que el productor inunde al consumidor. La Flow API implementa Reactive Streams en la JDK.

**Fundamento técnico y modelo mental**

**Definición formal.** `java.util.concurrent.Flow` define interfaces `Publisher`, `Subscriber`, `Subscription`, `Processor` para procesamiento reactivo con *backpressure*: el consumidor solicita (`request(n)`) cuántos elementos puede manejar.

**Contrato / invariantes / reglas.** El publisher no debe enviar más de lo solicitado. El subscriber debe pedir demanda (`request`). `onNext`, `onError`, `onComplete` siguen el contrato de señales: después de `onComplete` o `onError` no debe haber más `onNext`. `SubmissionPublisher` es una implementación útil para ejemplos y casos simples. Backpressure no es magia: si el consumidor es lento, hay que definir política de buffer/bloqueo/drop.

**Modelo mental.** Es una manguera con válvula: el receptor abre la válvula solo cuando puede recibir.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-20 && cd ~/academia-java/modulo-20
```

Crea `DemoFlow.java`:
```java
import java.util.concurrent.*;
import java.util.concurrent.Flow.*;

public class DemoFlow {
    public static void main(String[] args) throws Exception {
        try (SubmissionPublisher<String> publisher = new SubmissionPublisher<>()) {
            Subscriber<String> sub = new Subscriber<>() {
                private Subscription sub;
                public void onSubscribe(Subscription s) { sub = s; sub.request(2); }
                public void onNext(String item) { System.out.println(item); sub.request(1); }
                public void onError(Throwable t) { t.printStackTrace(); }
                public void onComplete() { System.out.println("done"); }
            };
            publisher.subscribe(sub);
            publisher.submit("E-1");
            publisher.submit("E-2");
            publisher.submit("E-3");
            Thread.sleep(200);
        }
    }
}
```

**Desglose del código**

- `SubmissionPublisher` publica items.
- `onSubscribe` recibe la `Subscription` y pide demanda inicial.
- `onNext` procesa y solicita más.
- `close()` al final del try-with-resources señala cierre.

**Ejecución y salida real**

```bash
javac DemoFlow.java
java DemoFlow
```

```text
E-1
E-2
E-3
```

`done` puede aparecer según timing/cierre; lo importante es que se respetan señales y demanda.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| No llega nada | No llamaste `request(n)` | Solicita demanda en `onSubscribe/onNext` |
| Productor desborda consumidor | Sin backpressure/política | Usa Flow con `request` y política de buffer |
| Señales inválidas | Violaste contrato Reactive Streams | Respeta `onNext* (onError|onComplete)?` |

**Verificación rápida**

Quita `request` y observa que el subscriber no recibe elementos.

## Cierre del módulo

El estilo funcional en Java sirve cuando hace el código más claro: transforma, filtra, compone y separa efectos. Cuando agrega indirección o se vuelve un acertijo, vuelve al estilo imperativo simple. La calidad se mide por legibilidad, corrección y evidencia.
