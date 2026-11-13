# Módulo 4: Streams y programación funcional


## Aprende construyendo

### Tema 1: Stream API — map, filter, reduce, collect

**¿Por qué es importante?** Un reporte con filtros y totales se vuelve más fácil de revisar cuando cada paso expresa una operación concreta. **Modelo mental:** el stream es una cinta que deja pasar, transforma y reúne piezas.

**Proyecto integrador:** lista guías activas y suma sus tarifas. **Límite:** no reutilices un stream después de una operación terminal. **Práctica:** modifica el filtro y compara el resultado.

```bash
javac -d out src/Reporte.java
java -cp out Reporte
```

#### Subtema 1.1: Filtra y transforma envíos · 10 min

**1. Contexto**

El reporte debe mostrar las guías activas, sin imprimir las canceladas.

**2. Hazlo tú**

Crea `src/Reporte.java`:

```java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Reporte {
    record Envio(String guia, boolean activo) {}

    public static void main(String[] args) {
        var envios = List.of(new Envio("RT-1", true), new Envio("RT-2", false));
        var activas = envios.stream()
            .filter(Envio::activo)
            .map(Envio::guia)
            .toList();
        System.out.println(activas);
        var editables = envios.stream()
            .filter(Envio::activo)
            .map(Envio::guia)
            .collect(Collectors.toCollection(ArrayList::new));
        editables.add("RT-3");
        System.out.println(editables);
    }
}
```

Desde la carpeta del proyecto ejecuta `javac -d out src/Reporte.java` y `java -cp out Reporte`.

**Resultado esperado:** `[RT-1]` y luego `[RT-1, RT-3]`. La segunda lista se puede ampliar porque elegiste explícitamente `ArrayList`; agregar `RT-3` no modifica los envíos originales.

**Fallo deliberado:** cambia `filter(Envio::activo)` por `filter(envio -> !envio.activo())`. **Diagnóstico:** el filtro ahora conserva las inactivas; revisa la condición y restáurala.

**3. Entiende**

`filter` decide qué elementos siguen; `map` convierte cada elemento en otro valor. Ambas tuberías vuelven a leer la colección original: un stream ya consumido no se reutiliza. `toList()` termina la primera tubería y devuelve una lista no modificable; `collect(Collectors.toCollection(ArrayList::new))` termina la segunda y construye una lista modificable cuando ese es el contrato que necesitas. `Collectors.toList()` no promete que su resultado sea modificable.

**4. Cierra**

Explica qué datos recibe y produce cada operación.

#### Subtema 1.2: Suma sin llevar un acumulador externo · 10 min

**1. Contexto**

El cierre diario necesita el total de las tarifas cobradas. Conserva importes en centavos enteros para que la suma no dependa de redondeos de `double`.

**2. Hazlo tú**

Reemplaza `src/Reporte.java` por:

```java
import java.util.List;

public class Reporte {
    record Envio(String guia, long centavos) {}

    public static void main(String[] args) {
        var envios = List.of(new Envio("RT-1", 250), new Envio("RT-2", 300));
        long total = envios.stream()
            .map(Envio::centavos)
            .reduce(0L, Long::sum);
        long totalPrimitivo = envios.stream()
            .mapToLong(Envio::centavos)
            .sum();
        System.out.println("totalCentavos=" + total);
        System.out.println("coinciden=" + (total == totalPrimitivo));
    }
}
```

Compila y ejecuta `javac -d out src/Reporte.java` y `java -cp out Reporte`.

**Resultado esperado:** `totalCentavos=550` y `coinciden=true`: 250 + 300 centavos son 5,50 unidades monetarias.

**Fallo deliberado:** cambia el valor inicial de `reduce` de `0L` a `100L`, recompila y ejecuta. **Resultado observado:** `totalCentavos=650` y `coinciden=false`. **Diagnóstico:** el valor inicial debe ser la identidad de la suma, cero; restáuralo y vuelve a comparar.

**3. Entiende**

`map` extrae centavos de cada envío y `reduce` combina los valores con una identidad y una operación. `Long::sum` suma dos `Long`; `0L` no cambia el resultado y también define el resultado vacío. `mapToLong` crea un stream primitivo que evita envolver cada importe en `Long`; su `sum()` expresa directamente la misma operación. `long` aún puede desbordarse: fija límites del dominio o usa una estrategia de suma exacta si los importes lo requieren.

**4. Cierra**

Prueba una lista vacía y verifica que ambos totales sean cero; explica por qué `100L` altera hasta ese caso. Fuente oficial: [Stream.reduce](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(T,java.util.function.BinaryOperator)) y [LongStream.sum](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/LongStream.html#sum()).

#### Subtema 1.3: No reutilices un stream consumido · 10 min

**1. Contexto**

Una consulta tiene una sola ejecución; después de una operación terminal no puedes pedirle otra salida al mismo stream.

**2. Hazlo tú**

En `src/UnaVez.java`, guarda el stream en una variable, llama `count()` y luego intenta llamar `toList()` sobre esa misma variable.

```java
import java.util.List;
import java.util.stream.Stream;

public class UnaVez {
    public static void main(String[] args) {
        Stream<String> guias = List.of("RT-1", "RT-2").stream();
        System.out.println(guias.count());
        System.out.println(guias.toList());
    }
}
```

Compila y ejecuta `javac -d out src/UnaVez.java` y `java -cp out UnaVez`.

**Resultado esperado:** la primera salida muestra `2`; la segunda operación falla con `IllegalStateException`.

**Fallo deliberado:** mantén la segunda operación `guias.toList()` y observa el `IllegalStateException` después de imprimir `2`. **Diagnóstico:** `count()` ya consumió ese stream; para obtener otra salida, crea un stream nuevo desde la lista original en vez de reutilizar `guias`.

**3. Entiende**

Las operaciones intermedias son perezosas; la terminal dispara el trabajo y consume el stream.

**4. Cierra**

Explica cuál llamada fue terminal y por qué la segunda no se puede ejecutar. Fuente oficial: [Stream API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html).

### Tema 2: Optional — evitar null explícitamente

**¿Por qué es importante?** Buscar una guía puede no producir resultado y el código debe mostrar qué hará en ese caso. **Modelo mental:** Optional es una caja que puede estar vacía o contener un valor.

**Proyecto integrador:** muestra un mensaje de no encontrada sin usar null. **Límite:** Optional ayuda como retorno; no hace falta envolver cada variable local. **Práctica:** prueba búsqueda encontrada, ausente y entrada nula.

```bash
javac -d out src/Buscar.java
java -cp out Buscar RT-9
```

#### Subtema 2.1: Representa que una búsqueda puede no encontrar guía · 10 min

**1. Contexto**

Buscar una guía puede devolver un resultado o no encontrar nada.

**2. Hazlo tú**

Crea `src/Buscar.java`:

```java
import java.util.List;
import java.util.Optional;

public class Buscar {
    public static void main(String[] args) {
        Optional<String> resultado = List.of("RT-1", "RT-2").stream()
            .filter(guia -> guia.equals(args[0]))
            .findFirst();
        System.out.println(resultado);
    }
}
```

Compila y ejecuta `javac -d out src/Buscar.java` y `java -cp out Buscar RT-2`; repite con `RT-9`.

**Resultado esperado:** el primer caso muestra un Optional con `RT-2` y el segundo `Optional.empty`.

**Fallo deliberado:** llama `resultado.get()` cuando no hay coincidencia. **Diagnóstico:** `get` falla si el Optional está vacío; decide cómo representar la ausencia antes de extraer el valor.

**3. Entiende**

`Optional<T>` representa un valor presente o ausente. Úsalo especialmente en retornos que pueden no producir resultado.

**4. Cierra**

Guarda las dos salidas y explica cuál representa la búsqueda sin coincidencia.

#### Subtema 2.2: Transforma o usa un valor alternativo · 10 min

**1. Contexto**

Si la guía no existe, la pantalla necesita un mensaje claro en vez de un `null`.

**2. Hazlo tú**

Reemplaza `src/Buscar.java` por:

```java
import java.util.List;

public class Buscar {
    public static void main(String[] args) {
        String destino = List.of("RT-1", "RT-2").stream()
            .filter(guia -> guia.equals(args[0]))
            .findFirst()
            .map(guia -> "Encontrada: " + guia)
            .orElse("Guía no encontrada");
        System.out.println(destino);
    }
}
```

Desde la carpeta del proyecto, recompila el archivo reemplazado y luego ejecuta:

```bash
javac -d out src/Buscar.java
java -cp out Buscar RT-9
```

**Resultado esperado:** imprime `Guía no encontrada`.

**Fallo deliberado:** cambia `orElse` por `orElseThrow` sin argumento. **Diagnóstico:** el programa ahora lanza una excepción cuando no hay resultado; restaura el mensaje alternativo si la ausencia es normal para esta pantalla.

**3. Entiende**

`map` transforma el dato solo cuando existe. `orElse` decide qué devolver si está ausente.

**4. Cierra**

Añade una prueba manual para una guía encontrada y conserva ambas salidas.

#### Subtema 2.3: No envuelvas un valor que puede ser null · 10 min

**1. Contexto**

Un dato de una API heredada puede seguir llegando como `null`. `Optional.of` exige que el valor exista.

**2. Hazlo tú**

Crea `src/OptionalSeguro.java`:

```java
import java.util.Optional;

public class OptionalSeguro {
    static Optional<String> normalizar(String guia) {
        return Optional.ofNullable(guia).map(String::trim);
    }

    public static void main(String[] args) {
        System.out.println(normalizar(null));
        System.out.println(normalizar(" RT-8 "));
    }
}
```

Compila y ejecuta `javac -d out src/OptionalSeguro.java` y `java -cp out OptionalSeguro`.

**Resultado esperado:** muestra `Optional.empty` y `Optional[RT-8]`.

**Fallo deliberado:** cambia `ofNullable` por `of`. **Diagnóstico:** la primera llamada ahora lanza `NullPointerException`; para una entrada posiblemente nula usa `ofNullable`.

**3. Entiende**

`Optional.of` declara que el valor debe existir; `ofNullable` adapta una fuente que puede contener null.

**4. Cierra**

Explica por qué `ofNullable` es adecuado en esta frontera. Fuente oficial: [Optional API](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html).

### Tema 3: Streams paralelos y referencias a métodos

**¿Por qué es importante?** Paralelizar sin medir puede empeorar el reporte y mezclar el orden que espera la persona usuaria. **Modelo mental:** varios trabajadores avanzan a la vez, pero después deben coordinarse.

**Proyecto integrador:** compara el total secuencial y paralelo antes de elegir uno. **Límite:** evita efectos compartidos y no infieras rendimiento con una sola corrida. **Práctica:** cambia forEachOrdered por forEach y observa el contrato que se pierde.

```bash
javac -d out src/Comparar.java
java -cp out Comparar
```

#### Subtema 3.1: Reemplaza una lambda por referencia a método · 10 min

**1. Contexto**

Si una lambda solo llama a un método, una referencia puede mostrar la misma intención con menos texto.

**2. Hazlo tú**

Crea `src/Referencias.java`:

```java
import java.util.List;

public class Referencias {
    public static void main(String[] args) {
        List<String> guias = List.of("rt-1", "rt-2");
        guias.stream().map(String::toUpperCase).forEach(System.out::println);
    }
}
```

Compila y ejecuta `javac -d out src/Referencias.java` y `java -cp out Referencias`.

**Resultado esperado:** `RT-1` y `RT-2`, una por línea.

**Fallo deliberado:** reemplaza `String::toUpperCase` por `String::trim` y repite. **Diagnóstico:** el código sigue compilando, pero ahora conserva minúsculas; el método elegido no hace la transformación deseada.

**3. Entiende**

`String::toUpperCase` equivale a `texto -> texto.toUpperCase()`. Una referencia mejora brevedad si no oculta la intención.

**4. Cierra**

Escribe la lambda equivalente a `System.out::println`.

#### Subtema 3.2: Compara una suma secuencial y paralela · 10 min

**1. Contexto**

Dividir trabajo puede ayudar en una colección grande, pero añade coordinación. No supongas que la versión paralela siempre gana.

**2. Hazlo tú**

Crea `src/Comparar.java`:

```java
import java.util.stream.LongStream;

public class Comparar {
    public static void main(String[] args) {
        long secuencial = LongStream.rangeClosed(1, 1_000_000).sum();
        long paralelo = LongStream.rangeClosed(1, 1_000_000).parallel().sum();
        System.out.println(secuencial);
        System.out.println(paralelo);
    }
}
```

Compila y ejecuta `javac -d out src/Comparar.java` y `java -cp out Comparar`.

**Resultado esperado:** ambos totales son iguales. El tiempo puede variar por equipo; esta salida sola no demuestra cuál es más rápido.

**Fallo deliberado:** cambia la suma paralela por una variable compartida incrementada desde `forEach`. **Diagnóstico:** varias tareas modificarían el mismo dato sin coordinación; conserva `sum`, que combina resultados de forma segura.

**3. Entiende**

Las operaciones paralelas necesitan ser seguras al dividir y combinar. Para medir rendimiento hace falta calentar la JVM y usar una herramienta de benchmark; una sola ejecución cronometrada engaña.

**4. Cierra**

Guarda ambos totales y explica por qué igualdad del resultado no prueba una mejora de velocidad.

#### Subtema 3.3: Conserva el orden cuando lo necesitas · 10 min

**1. Contexto**

Un reporte debe presentar guías en el orden de entrada aunque el stream use trabajo paralelo.

**2. Hazlo tú**

Crea `src/Orden.java`:

```java
import java.util.List;

public class Orden {
    public static void main(String[] args) {
        List.of("RT-1", "RT-2", "RT-3").parallelStream()
            .map(String::toUpperCase)
            .forEachOrdered(System.out::println);
    }
}
```

Compila y ejecuta `javac -d out src/Orden.java` y `java -cp out Orden`.

**Resultado esperado:** aparecen `RT-1`, `RT-2` y `RT-3` en ese orden.

**Fallo deliberado:** cambia `forEachOrdered` por `forEach`. **Diagnóstico:** no exijas orden de salida en un terminal paralelo que no lo promete; restaura `forEachOrdered` si el orden es un requisito visible.

**3. Entiende**

El paralelismo no es gratis y puede cambiar el orden de efectos laterales. Evita usarlo solo por tener muchos elementos.

**4. Cierra**

Anota si tu reporte necesita orden y por qué. Fuente oficial: [parallel streams](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html).

### Tema 4: Stream Gatherers (Java 24)

**¿Por qué es importante?** Algunas alertas dependen de varios eventos vecinos, algo que un filtro por elemento no puede expresar. **Modelo mental:** una ventana móvil compara los últimos datos juntos.

**Proyecto integrador:** detecta tres entregas atrasadas consecutivas. **Límite:** Gatherers requiere Java 24 o posterior; usa filter si los elementos son independientes. **Práctica:** cambia la secuencia y compara windowSliding con windowFixed.

```bash
javac -d out src/Rachas.java
java -cp out Rachas
```

#### Subtema 4.1: Agrupa elementos consecutivos en ventanas · 10 min

**1. Contexto**

Una alerta debe detectar una racha de tres entregas atrasadas seguidas, no tres atrasos separados.

**2. Hazlo tú**

Crea `src/Rachas.java` con `Gatherers.windowSliding(3)`:

```java
import java.util.List;
import java.util.stream.Gatherers;

public class Rachas {
    public static void main(String[] args) {
        List<Boolean> atrasadas = List.of(true, true, true, false, true);
        var ventanas = atrasadas.stream()
            .gather(Gatherers.windowSliding(3))
            .filter(ventana -> ventana.stream().allMatch(Boolean::booleanValue))
            .toList();
        System.out.println(ventanas);
    }
}
```

Con JDK 24 o posterior, desde el proyecto ejecuta `javac -d out src/Rachas.java` y `java -cp out Rachas`.

**Resultado esperado:** solo aparece la ventana `[true, true, true]`.

**Fallo deliberado:** reemplaza `windowSliding(3)` por `windowSliding(2)`, recompila y ejecuta. **Resultado observado:** aparecen dos ventanas `[true, true]`, formadas por las posiciones 1–2 y 2–3; la pareja final es `[false, true]` y no pasa el filtro. **Diagnóstico:** cambiaste la regla de tres atrasos seguidos por una de dos y contaste dos ventanas solapadas; restablece el tamaño tres.

**3. Entiende**

`windowSliding` guarda una ventana móvil de elementos vecinos y la desplaza una posición a la vez.

**4. Cierra**

Dibuja las tres ventanas de tamaño tres que se forman con los cinco valores.

#### Subtema 4.2: Compara ventana móvil y grupos separados · 10 min

**1. Contexto**

Una ventana móvil comparte elementos entre grupos vecinos; una ventana fija forma bloques que no se solapan.

**2. Hazlo tú**

En `src/Rachas.java`, conserva la lista del ejercicio anterior y calcula también:

```java
var bloques = atrasadas.stream()
    .gather(Gatherers.windowFixed(2))
    .toList();
System.out.println(bloques);
```

Compila y ejecuta el archivo. Al pegarlo, coloca estas líneas dentro de `main` y usa el mismo `atrasadas`.

**Resultado esperado:** `[[true, true], [true, false], [true]]`: para cinco valores se forman dos bloques completos de dos y un bloque final de uno.

**Fallo deliberado:** interpreta el último bloque parcial como si tuviera dos datos. **Diagnóstico:** el stream terminó con un elemento sin pareja; comprueba el tamaño antes de acceder a posiciones.

**3. Entiende**

`windowFixed` crea grupos consecutivos sin solaparlos. La ventana final puede ser más corta si queda una cantidad incompleta.

**4. Cierra**

Registra cuántos elementos comparte una ventana móvil y cuántos comparte un bloque fijo.

#### Subtema 4.3: Elige la herramienta según la relación entre datos · 10 min

**1. Contexto**

Un filtro mira cada evento por separado; una ventana sirve cuando la regla compara elementos vecinos.

**2. Hazlo tú**

Reemplaza `src/Rachas.java` por este archivo completo. Compara una secuencia con tres atrasos seguidos y otra con tres atrasos separados por entregas a tiempo:

```java
import java.util.List;
import java.util.stream.Gatherers;

public class Rachas {
    static List<List<Boolean>> detectar(List<Boolean> valores) {
        return valores.stream()
            .gather(Gatherers.windowSliding(3))
            .filter(ventana -> ventana.size() == 3
                && ventana.stream().allMatch(Boolean::booleanValue))
            .toList();
    }

    public static void main(String[] args) {
        List<Boolean> consecutivas = List.of(true, true, true, false, true);
        List<Boolean> separadas = List.of(true, false, true, false, true);
        List<Boolean> insuficientes = List.of(true, true);
        System.out.println("individuales=" + separadas.stream()
            .filter(Boolean::booleanValue).count());
        System.out.println("separadas=" + detectar(separadas));
        System.out.println("consecutivas=" + detectar(consecutivas));
        System.out.println("insuficientes=" + detectar(insuficientes));
    }
}
```

Con JDK 24 o posterior, desde la carpeta del proyecto ejecuta:

```bash
javac -d out src/Rachas.java
java -cp out Rachas
```

**Resultado esperado:** `individuales=3`, `separadas=[]`, `consecutivas=[[true, true, true]]` e `insuficientes=[]`, en ese orden. La primera cifra cuenta eventos aislados, no rachas.

**Fallo deliberado:** elimina `ventana.size() == 3 &&`, recompila y usa `insuficientes`. **Resultado observado:** aparece `[[true, true]]` como si hubiera tres atrasos. **Diagnóstico:** si el stream tiene menos elementos que el tamaño solicitado, `windowSliding` emite una única ventana corta; exige tres elementos antes de comprobar que todos sean atrasos.

**3. Entiende**

Gatherers extiende los pipelines con operaciones intermedias con estado. Úsalo cuando la regla dependa de una secuencia; para filtrar elementos independientes, `filter` es más sencillo. `allMatch` por sí solo comprueba los valores presentes, no que haya suficientes observaciones para cumplir la regla.

**4. Cierra**

Explica en una frase por qué un simple filtro no conserva la consecutividad. Fuente oficial: [Stream Gatherers](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un pipeline de procesamiento de datos con Streams que reemplace loops manuales.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Filtrar y transformar con `filter`/`map`; elegir `toList` o `collect` | Ver Tema 1 | Conserva la misma lista de guías activas y decide si la salida debe ser modificable |
| 2 | Sumar centavos con `reduce` y `mapToLong().sum()` | Ver Tema 1 | Comprueba identidad cero y equivalencia con el recorrido manual |
| 3 | Reemplazar un método que devuelve `null` por `Optional` | Ver Tema 2 | Maneja el caso vacío con `orElseThrow` |
| 4 | Comparar suma secuencial y paralela con los mismos datos | Ver Tema 3 | Comprueba igualdad; el ejemplo no mide rendimiento |
| 5 | Reemplazar lambdas verbosas por referencias a métodos | Ver Tema 3 | Donde aplique directamente |
| 6 | Detectar una racha con `Gatherers.windowSliding` | Ver Tema 4 | Lógica que `filter`/`map` no pueden expresar |

**Verificación:** el laboratorio se considera exitoso si el pipeline con Streams produce el mismo resultado que un recorrido manual equivalente, las dos sumas coinciden con identidad cero, la suma paralela conserva el valor y el gatherer detecta una racha real de tres elementos pero rechaza dos atrasos seguidos. Para afirmar una mejora de velocidad hace falta un benchmark aparte, con calentamiento de JVM y datos representativos.

**Errores comunes y soluciones**

- **Usar `parallelStream()` para colecciones pequeñas.** El overhead de coordinación puede superar cualquier ganancia; mide con datos reales.
- **Seguir devolviendo `null` en vez de `Optional`.** Cambia la firma del método para forzar el manejo explícito del caso vacío.
- **Usar lambdas verbosas donde una referencia a método sería más clara.** Prefiere `Clase::metodo` cuando la lambda simplemente invoca ese método.
- **Intentar resolver lógica de ventana/vecindad con `filter`/`map` puro.** Esas operaciones no ven elementos vecinos; usa un gatherer como `windowSliding`.

---
