# Módulo 2: Colecciones y genéricos


## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones · Básico · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Módulo 1 de Java (clases, `equals`/`hashCode` heredados de `Object`), JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** elegir `List`/`Set`/`Map` y su implementación por coste y orden; explicar por qué `equals`/`hashCode` son el contrato de un `Set`/`Map`; usar colecciones inmutables; y eliminar durante la iteración sin provocar `ConcurrentModificationException`.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** al importar entregas hay que eliminar guías duplicadas; al procesar una secuencia también puede importar conservar el orden. Elegir `Set` o una implementación ordenada depende de esos requisitos observables, no de la costumbre.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Elegir `ArrayList` frente a `LinkedList` según si el patrón de acceso predominante es indexado o de inserción/eliminación frecuente en los extremos evita costos de rendimiento innecesarios; elegir `HashSet` frente a `TreeSet` según si se necesita o no orden automático evita el costo adicional de mantener ese orden cuando no es requerido.

`ArrayList` accede a cualquier índice al instante pero desplaza todo al insertar al inicio; `LinkedList` inserta al inicio sin desplazar nada pero debe recorrer nodo por nodo para acceder por índice.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `List` y sus implementaciones (`ArrayList`/`LinkedList`) | Núcleo | coste de insertar al inicio frente al final |
| complejidad (Big-O) de las operaciones | Fundamento | acceso `O(1)` frente a desplazamiento `O(n)` |
| `Set` y unicidad | Núcleo | `HashSet`/`LinkedHashSet`/`TreeSet` rechazan duplicados |
| `equals`/`hashCode` como contrato | Diagnóstico | sin ambos, un `Set` no detecta duplicados lógicos |
| orden de iteración por implementación | Variante | hash sin orden, inserción conservada, orden natural |
| `Map` y sus implementaciones | Núcleo | `HashMap`/`LinkedHashMap`/`TreeMap` asocian clave→valor |
| colecciones inmutables (`List.of`) | Límite | mutar una vista inmutable lanza `UnsupportedOperationException` |
| iteración y `ConcurrentModificationException` | Diagnóstico | modificar durante un for-each falla; `Iterator.remove` es la vía |
| medición informal frente a benchmark | Decisión | `nanoTime` observa patrón, no decide rendimiento real |

Cada fila tiene su explicación individual a continuación.

**`List` y sus implementaciones (núcleo).** `List` es una secuencia ordenada con índices y duplicados permitidos. `ArrayList` la respalda con un arreglo redimensionable; `LinkedList` con nodos doblemente enlazados. Ambas cumplen el mismo contrato `List`, pero con costes opuestos según la operación.

**Complejidad (Big-O) de las operaciones (fundamento).** `ArrayList`: acceso por índice `O(1)`, pero insertar/eliminar al inicio o en medio es `O(n)` porque desplaza los elementos siguientes. `LinkedList`: insertar/eliminar en un extremo es `O(1)` (reenlaza nodos), pero acceder por índice es `O(n)` (recorre desde un extremo). Big-O describe cómo crece el coste con el tamaño, no el tiempo absoluto; por eso la diferencia solo se nota con volumen.

**`Set` y unicidad (núcleo).** `Set` garantiza que no hay elementos repetidos. `HashSet` usa una tabla hash (rápido, sin orden), `LinkedHashSet` conserva el orden de inserción, `TreeSet` mantiene orden natural. La unicidad es la razón de usar un `Set` en vez de una `List`.

**`equals`/`hashCode` como contrato (diagnóstico).** Un `HashSet`/`HashMap` decide si dos objetos son "el mismo" usando `hashCode()` para agrupar y `equals()` para comparar. Si tu clase **no** los sobreescribe, dos objetos con los mismos datos se consideran distintos y el `Set` **no** detecta el duplicado (deja `size=2`). Deben implementarse **juntos y coherentes**: objetos iguales (`equals`) deben tener el mismo `hashCode`. Es el error silencioso más común con colecciones.

**Orden de iteración por implementación (variante).** No asumas orden en un `HashSet`/`HashMap`: puede parecer ordenado por casualidad del hashing y cambiar. Si necesitas orden de inserción usa `LinkedHashSet`/`LinkedHashMap`; si necesitas orden natural usa `TreeSet`/`TreeMap`.

**`Map` y sus implementaciones (núcleo).** `Map<K,V>` asocia claves únicas a valores (`edades.put("Ana", 28)`). `HashMap` es el común (rápido, sin orden), `LinkedHashMap` conserva inserción, `TreeMap` ordena por clave. La clave sigue el mismo contrato `equals`/`hashCode`; por eso **no** uses como clave un objeto mutable cuyo hash cambie tras insertarlo.

**Colecciones inmutables (`List.of`) (límite).** `List.of(...)`, `Set.of(...)`, `Map.of(...)` crean colecciones **inmutables**: intentar `add`/`put` lanza `UnsupportedOperationException`. Son ideales para constantes y para no exponer una colección interna mutable; si necesitas modificar, copia a una mutable (`new ArrayList<>(...)`).

**Iteración y `ConcurrentModificationException` (diagnóstico).** Modificar una colección (añadir/quitar) **durante** un for-each lanza `ConcurrentModificationException`. La forma correcta de eliminar mientras recorres es `Iterator.remove()`, o usar `removeIf(...)`. Es un fallo real y frecuente al "limpiar" una lista en un bucle.

**Medición informal frente a benchmark (decisión).** `System.nanoTime()` sirve para **observar** el patrón de coste (desplazar vs reenlazar), no para decidir rendimiento en producción: no controla calentamiento de la JVM, JIT ni ruido del sistema. Para comparar en serio usa JMH; para colecciones pequeñas, la diferencia rara vez justifica complejidad.

`ArrayList` implementa `List` respaldado por un arreglo redimensionable internamente, ofreciendo acceso indexado rápido (`O(1)`, acceder a cualquier posición por su índice es prácticamente instantáneo) e inserción eficiente al final, pero inserción o eliminación costosa al inicio o en medio (`O(n)`, dado que todos los elementos posteriores deben desplazarse una posición); `LinkedList` implementa la misma interfaz `List` respaldada internamente por una lista doblemente enlazada de nodos, ofreciendo inserción y eliminación eficiente al inicio o en medio (sin necesidad de desplazar elementos, solo reenlazar referencias), a costa de acceso indexado más lento (`O(n)`, dado que acceder a una posición arbitraria requiere recorrer la lista nodo por nodo desde uno de los extremos).

`HashSet` implementa `Set` (una colección que garantiza ausencia de duplicados) respaldada por una tabla hash, ofreciendo operaciones de inserción y búsqueda extremadamente rápidas en promedio, pero sin ningún orden garantizado entre los elementos almacenados; `TreeSet` implementa la misma garantía de unicidad, pero manteniendo los elementos ordenados automáticamente según su orden natural (o un `Comparator` proporcionado, Tema 3), a costa de operaciones ligeramente más lentas que `HashSet` (`O(log n)` en vez de aproximadamente `O(1)`), dado que mantener el orden requiere una estructura interna de árbol balanceado en vez de una tabla hash simple.

`Map<K, V>` asocia claves únicas con valores (`edades.put("Ana", 28)`), con `HashMap` como la implementación más común (sin orden garantizado, acceso rápido) y alternativas como `LinkedHashMap` (que preserva el orden de inserción) o `TreeMap` (que ordena por clave, análogamente a `TreeSet`).

**Analogía:** `ArrayList` es como un estante numerado donde acceder a cualquier posición específica por su número es instantáneo, pero insertar un nuevo objeto al principio requiere renumerar y desplazar físicamente todos los demás objetos; `LinkedList` es como una cadena de personas tomadas de las manos, donde insertar a alguien nuevo en cualquier punto solo requiere que sus dos vecinos inmediatos se suelten y vuelvan a tomarse de la mano con la persona nueva, sin mover a nadie más, pero encontrar a la persona en la posición 500 requiere contar uno por uno desde el principio.

**Conceptos clave:** acceso indexado vs inserción eficiente, unicidad, orden.

**Código del ejemplo:**

```java
List<String> lista = new ArrayList<>();   // acceso indexado rápido, inserción al final eficiente
List<String> enlazada = new LinkedList<>(); // inserción/eliminación al inicio eficiente, acceso indexado lento

Set<String> unicos = new HashSet<>();      // sin duplicados, sin orden garantizado
Set<String> ordenado = new TreeSet<>();    // sin duplicados, ordenado automáticamente

Map<String, Integer> edades = new HashMap<>();
edades.put("Ana", 28);
```

Elegir la colección correcta según el patrón de acceso real (no por costumbre) es la misma decisión que tomarás para cada estructura de datos del proyecto integrador de este track.

**Cuándo no usarlo:** esta medición sencilla con `nanoTime()` sirve para observar el patrón de coste, no para tomar una decisión de rendimiento en producción: no controla calentamiento, pausas ni ruido del sistema. Para comparar implementaciones con rigor usa JMH; para colecciones diminutas la diferencia normalmente no justifica complejidad adicional.

**Implicación práctica:** Elegir la colección equivocada para el patrón de acceso real (inserción frecuente al inicio, necesidad de unicidad, necesidad de orden) convierte una operación que debería ser instantánea en una lenta, o permite silenciosamente duplicados que el negocio no toleraba.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-listas-rendimiento
cd ejemplo-listas-rendimiento
mkdir -p src/main/java/academia/colecciones
```

**Crea** `src/main/java/academia/colecciones/ComparacionListas.java`, que inserta 100 000 elementos al inicio de un `ArrayList` y de un `LinkedList` y mide el tiempo de cada uno con `System.nanoTime()`:

```java
package academia.colecciones;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public final class ComparacionListas {
    private static final int ELEMENTOS = 100_000;

    public static void main(String[] args) {
        medir("ArrayList", new ArrayList<>());
        medir("LinkedList", new LinkedList<>());
    }

    private static void medir(String nombre, List<Integer> lista) {
        long inicio = System.nanoTime();
        for (int i = 0; i < ELEMENTOS; i++) {
            lista.add(0, i);
        }
        long fin = System.nanoTime();
        System.out.printf("%s: %.1f ms%n", nombre, (fin - inicio) / 1_000_000.0);
    }
}
```

**Ejecuta el ejemplo** (compila y mide ambas inserciones):

```bash
javac -d out src/main/java/academia/colecciones/ComparacionListas.java
java -cp out academia.colecciones.ComparacionListas
```

**Resultado esperado:** ambos tiempos se imprimen. La estructura explica por qué insertar al inicio de `ArrayList` requiere desplazar elementos y por qué `LinkedList` solo reajusta enlaces; el tiempo observado puede variar y esta ejecución no es un benchmark fiable.

**Fallo deliberado:** reduce `ELEMENTOS` a 100 y vuelve a ejecutar. La diferencia se vuelve casi imperceptible, porque con pocos elementos el costo de desplazar el arreglo es demasiado pequeño para notarse; restaura 100 000 y confirma de nuevo la ventaja de `LinkedList` en inserciones al inicio.

**Pista:** la medición incluye el calentamiento de la JVM; si los primeros resultados parecen ruidosos, ejecuta cada medición más de una vez dentro del mismo programa. **Resultado esperado:** la diferencia de rendimiento solo se manifiesta con volumen suficiente.

**Si falla.** Si `javac` no encuentra el archivo, revisa la ruta y que el paquete coincida con la carpeta. Si el programa no imprime nada, confirma que el método `main` esté declarado exactamente como `public static void main(String[] args)`. Si `ArrayList` parece más rápido al inicio, estás midiendo inserciones al final o el tamaño es demasiado pequeño.

**Paso 5 · Práctica guiada**

Cambia la inserción de `lista.add(0, i)` a `lista.add(i)` para ambas colecciones. Antes de ejecutar, predice qué operación de `ArrayList` deja de desplazar los elementos existentes; registra los tiempos, pero no los uses como prueba universal de velocidad.

**Pista:** `add(i)` agrega al final. En un `ArrayList`, las inserciones al final suelen ser amortizadas constantes; el coste de desplazar todos los elementos desaparece de esta comparación.

Ahora cierra los subtemas de unicidad, orden e iteración con un laboratorio. Crea `src/main/java/academia/colecciones/Demo.java`:

```java
package academia.colecciones;
import java.util.*;

public final class Demo {
    record Guia(String id) {}                  // record: aporta equals/hashCode por valor
    public static void main(String[] args) {
        Set<Guia> set = new HashSet<>();
        set.add(new Guia("G1")); set.add(new Guia("G1"));
        System.out.println("duplicado logico size=" + set.size());   // 1 gracias a equals/hashCode

        List<String> datos = List.of("c", "a", "b", "a");
        System.out.println("HashSet=" + new HashSet<>(datos));
        System.out.println("LinkedHashSet=" + new LinkedHashSet<>(datos));
        System.out.println("TreeSet=" + new TreeSet<>(datos));

        try { datos.add("z"); }                 // datos es inmutable (List.of)
        catch (UnsupportedOperationException e) { System.out.println("List.of es inmutable"); }

        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
        try { for (Integer n : nums) if (n == 2) nums.remove(n); }  // mutar en for-each
        catch (ConcurrentModificationException e) { System.out.println("ConcurrentModificationException"); }
        nums.removeIf(n -> n == 2);             // forma correcta
        System.out.println("tras removeIf=" + nums);
    }
}
```

```bash
javac -d out src/main/java/academia/colecciones/Demo.java
java -cp out academia.colecciones.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
duplicado logico size=1
HashSet=[a, b, c]
LinkedHashSet=[c, a, b]
TreeSet=[a, b, c]
List.of es inmutable
ConcurrentModificationException
tras removeIf=[1, 3, 4]
```

Léela subtema por subtema: el `record Guia` aporta `equals`/`hashCode`, por eso el `Set` detecta el duplicado (`size=1`); `LinkedHashSet` conservó el orden de inserción (`[c,a,b]`) mientras `TreeSet` ordenó; `List.of` rechazó la mutación; y modificar en el for-each lanzó `ConcurrentModificationException`, resuelto con `removeIf`. **Fallo deliberado:** cambia `record Guia` por una `class` sin `equals`/`hashCode` y reejecuta: `size=2`, porque el `Set` ya no reconoce el duplicado lógico.

#### Aplica

**Paso 6 · Práctica independiente**

Construye un `Map<String,Integer>` que cuente cuántas veces aparece cada zona de entrega en una lista, usando `merge(zona, 1, Integer::sum)`. Después repite con `TreeMap` y explica en qué cambia el orden de las claves al iterar frente a `HashMap`.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `ComparacionListas.java` compila y, con 100 000 inserciones al inicio, `LinkedList` gana.
- [ ] Con 100 elementos, la diferencia se vuelve casi imperceptible.
- [ ] Con `equals`/`hashCode` el `Set` detecta el duplicado (`size=1`); sin ellos, no (`size=2`).
- [ ] `HashSet` no garantiza orden; `LinkedHashSet` conserva inserción; `TreeSet` ordena.
- [ ] Mutar `List.of(...)` lanza `UnsupportedOperationException`.
- [ ] Modificar en un for-each lanza `ConcurrentModificationException`; `removeIf` lo evita.

**Si falla.** Si el `Set` no detecta el duplicado, tu clase no sobreescribe `equals`/`hashCode` (un `record` los da por valor). Si `TreeSet` lanza `ClassCastException`, los elementos no son `Comparable`. Si no aparece `ConcurrentModificationException`, no estás modificando la misma lista que recorres.

Guarda el código de medición, los tiempos, la salida del `Demo` y la conclusión sobre cuándo gana cada estructura.

**Antes del siguiente tema:** explica qué garantiza `Set`, por qué `equals`/`hashCode` son su contrato, qué orden ofrece cada implementación y por qué `nanoTime()` no basta para decidir rendimiento.

**Errores comunes:** usar `List` cuando se necesita unicidad (debería ser `Set`); no sobreescribir `equals`/`hashCode` juntos; usar un objeto mutable como clave; modificar una colección dentro de un for-each; y asumir que `HashSet` conserva algún orden.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java: Collections Framework](https://dev.java/learn/api/collections-framework/), [`Object.equals`/`hashCode` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Object.html#hashCode()) y [JMH](https://openjdk.org/projects/code-tools/jmh/).

### Tema 2: Genéricos, wildcards y type erasure · Intermedio · 45 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Tema 1 de este módulo, JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** escribir clases y métodos genéricos con cotas; aplicar wildcards según PECS (`? extends`/`? super`); explicar el type erasure y sus límites (`instanceof`, `new T[]`); y evitar raw types.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** el sistema necesita almacenar temporalmente guías y paquetes con una estructura reutilizable, sin duplicar contenedores ni perder la verificación de tipos en compilación.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** Los genéricos proporcionan seguridad de tipos en tiempo de compilación sin necesidad de castear manualmente; el type erasure explica por qué esa información de tipo genérico no está disponible para inspección en tiempo de ejecución, una limitación relevante al usar reflexión o al diseñar ciertas APIs genéricas avanzadas.

`<T>` es un parámetro de tipo verificado en compilación; el type erasure borra esa información específica del bytecode final, dejando una única clase compartida en tiempo de ejecución.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| clase genérica `<T>` | Núcleo | `Caja<T>` guarda y devuelve sin cast |
| seguridad de tipos en compilación | Núcleo | guardar un `Integer` en `Caja<String>` no compila |
| método genérico | Variante | `<T> T maximo(List<T>)` infiere el tipo en la llamada |
| bounded type parameter (`<T extends ...>`) | Variante | exigir que `T` sea `Comparable` para poder compararlo |
| wildcard `? extends` (productor) | Núcleo | leer de una lista de subtipos |
| wildcard `? super` (consumidor) | Núcleo | escribir en una lista de supertipos (PECS) |
| type erasure | Límite | `Caja<String>` y `Caja<Integer>` son la misma clase |
| límites del erasure (`new T[]`, `instanceof`) | Diagnóstico | no se puede `instanceof List<String>` |
| raw types | Diagnóstico | perder la verificación y arriesgar `ClassCastException` |

Cada fila tiene su explicación individual a continuación.

**Clase genérica `<T>` (núcleo).** `<T>` es un parámetro de tipo: `Caja<T>` funciona con cualquier tipo concreto que elijas al instanciarla (`Caja<String>`). El compilador garantiza que solo guardes y recuperes ese tipo, y al leer `obtener()` no necesitas castear.

**Seguridad de tipos en compilación (núcleo).** El valor de los genéricos: el compilador rechaza `texto.guardar(42)` sobre una `Caja<String>`. El error aparece **al compilar**, no como un `ClassCastException` en producción.

**Método genérico (variante).** No solo las clases: un método puede declarar su propio parámetro de tipo antes del retorno, `static <T> T maximo(List<T> lista)`. El tipo se **infiere** de los argumentos en cada llamada, sin escribirlo.

**Bounded type parameter (variante).** `<T extends Comparable<T>>` **restringe** `T` a tipos que cumplen un contrato, aquí ser comparables. Así dentro del método puedes usar `x.compareTo(...)`; sin la cota, `T` sería tratado como `Object` y no tendría ese método.

**Wildcard `? extends` (productor, núcleo).** `List<? extends Number>` acepta una lista de `Number` **o cualquier subtipo** (`Integer`, `Double`). Sirve para **leer** (`n.doubleValue()`), porque sabes que todo elemento es al menos `Number`; pero **no** puedes añadir, porque no conoces el subtipo exacto.

**Wildcard `? super` (consumidor, núcleo).** `List<? super Integer>` acepta una lista de `Integer` **o cualquier supertipo** (`Number`, `Object`). Sirve para **escribir** `Integer`, porque cualquiera de esos tipos lo admite. La regla mnemotécnica es **PECS**: *Producer Extends, Consumer Super* — si la colección te da datos usa `extends`, si recibe datos usa `super`.

**Type erasure (límite).** La información genérica existe solo en compilación; el bytecode no la conserva. Por eso `Caja<String>` y `Caja<Integer>` son **la misma clase** `Caja` en ejecución (`getClass()` idéntico). Fue una decisión para mantener compatibilidad con el código anterior a los genéricos (Java 5).

**Límites del erasure (diagnóstico).** Como el tipo se borra, hay cosas que no puedes hacer: `new T[]` directamente, o `o instanceof List<String>` (no compila: `Object cannot be safely cast to List<String>`). Solo puedes comprobar el tipo crudo (`instanceof List<?>`). Es una limitación real al diseñar APIs que inspeccionan tipos.

**Raw types (diagnóstico).** Usar `List` sin parámetro (`List lista = new ArrayList();`) es un *raw type*: el compilador emite un warning `unchecked` y **pierdes toda la verificación**, de modo que puedes mezclar tipos y recibir un `ClassCastException` en runtime. Nunca uses raw types en código nuevo.

**Conceptos clave:** `<T>`, método genérico, bounded type, PECS, type erasure, raw types.

**Código del ejemplo:**

```java
class Caja<T> {
    private T contenido;
    void guardar(T valor) { this.contenido = valor; }
    T obtener() { return contenido; }
}
Caja<String> cajaTexto = new Caja<>();
```

Esta clase genérica `Caja<T>` puede almacenar y devolver un valor de cualquier tipo concreto que se especifique al instanciarla, con el compilador verificando en tiempo de compilación que solo se guarden y recuperen valores del tipo `String` para esa instancia específica, sin necesidad de castear manualmente el valor recuperado (como sí sería necesario si `Caja` almacenara internamente un `Object` genérico sin parametrizar).

Los wildcards (`List<? extends Number>`, aceptando una lista de `Number` o cualquier subtipo suyo, útil como parámetro de un método que solo lee elementos de la lista sin necesitar saber el tipo exacto) permiten mayor flexibilidad en las firmas de métodos que reciben colecciones genéricas, sin comprometer la seguridad de tipos. El type erasure es el mecanismo mediante el cual la información de tipo genérico (`<T>`, `<String>`, etc.) existe únicamente durante la compilación, para la verificación de tipos, pero se "borra" del bytecode final generado: en tiempo de ejecución, `Caja<String>` y `Caja<Integer>` son literalmente la misma clase `Caja` sin ninguna distinción de tipo genérico retenida, una decisión de diseño de Java tomada para preservar compatibilidad con código anterior a la introducción de genéricos (Java 5); `@SafeVarargs` suprime una advertencia del compilador relacionada específicamente con la combinación de varargs y genéricos, usada cuando el desarrollador garantiza manualmente que esa combinación específica es segura en ese caso concreto.

**Analogía:** los genéricos son como una plantilla de formulario que se ajusta automáticamente para verificar que solo se ingrese el tipo de dato correcto según el propósito específico de cada formulario concreto (uno para texto, otro para números); el type erasure es como que, una vez que el formulario ya fue completado y archivado, el archivo físico final no conserva ninguna etiqueta especial indicando para qué tipo de formulario fue diseñado originalmente, aunque esa verificación sí se aplicó estrictamente durante el proceso de llenado.

Escribir tipos genéricos propios como `Caja<T>` es la misma técnica que usarás para el repositorio genérico del proyecto integrador de este track.

**Cuándo no usarlo:** si la clase siempre va a contener el mismo tipo concreto y nunca necesitará una segunda variante, hacerla genérica agrega un parámetro de tipo sin beneficio real; resérvalo para cuando genuinamente necesites la misma estructura con más de un tipo de contenido.

**Implicación práctica:** El type erasure explica por qué `Caja<String>` y `Caja<Integer>` son la misma clase en tiempo de ejecución, una limitación real al diseñar APIs que necesiten inspeccionar tipos genéricos por reflexión, y una razón concreta para nunca usar raw types sin darse cuenta de que se pierde toda la verificación de tipos del compilador.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-genericos-caja
cd ejemplo-genericos-caja
mkdir -p src/main/java/academia/generico
```

**Crea** `src/main/java/academia/generico/Caja.java` con la clase genérica del ejemplo y un `Main` que instancie `Caja<String>` y `Caja<Integer>` e imprima `getClass()` de ambas:

```java
package academia.generico;

class Caja<T> {
    private T contenido;
    void guardar(T valor) { this.contenido = valor; }
    T obtener() { return contenido; }
}

final class Main {
    public static void main(String[] args) {
        Caja<String> texto = new Caja<>();
        Caja<Integer> numero = new Caja<>();
        texto.guardar("RF-1");
        numero.guardar(42);
        System.out.println(texto.obtener());
        System.out.println(numero.obtener());
        System.out.println(texto.getClass().getName());
        System.out.println(numero.getClass().getName());
        System.out.println(texto.getClass() == numero.getClass());
    }
}
```

**Ejecuta el ejemplo** (compila y compara las clases de ambas cajas):

```bash
javac -d out src/main/java/academia/generico/Caja.java
java -cp out academia.generico.Main
```

**Resultado esperado:** `RF-1`, `42`, dos veces `academia.generico.Caja` y `true`: ambas instancias comparten la misma clase en tiempo de ejecución.

**Paso 5 · Práctica guiada**

**Fallo deliberado:** agrega `texto.guardar(42);` en `main` y recompila. El compilador lo rechaza con un error de tipos incompatibles (`Integer` no se convierte a `String`), aunque en tiempo de ejecución ambas cajas sean la misma clase `Caja`; elimina la línea después de leer el error.

**Pista:** si el compilador no rechaza el `Integer`, estás usando un raw type (`Caja` sin `<String>`), que pierde toda la verificación. **Resultado esperado:** confirmas que `getClass()` de `Caja<String>` y `Caja<Integer>` imprime el mismo nombre de clase.

Ahora cierra los subtemas de método genérico, cota y PECS con un laboratorio. Crea `src/main/java/academia/generico/Demo.java`:

```java
package academia.generico;
import java.util.*;

public final class Demo {
    static <T extends Comparable<T>> T maximo(List<T> lista) {   // método genérico + cota
        T m = lista.get(0);
        for (T x : lista) if (x.compareTo(m) > 0) m = x;
        return m;
    }
    static double sumar(List<? extends Number> nums) {           // productor: extends (lee)
        double t = 0; for (Number n : nums) t += n.doubleValue(); return t;
    }
    static void agregarCeros(List<? super Integer> dest) {       // consumidor: super (escribe)
        dest.add(0); dest.add(0);
    }
    public static void main(String[] args) {
        System.out.println("maximo=" + maximo(List.of(3, 9, 2)));
        System.out.println("suma=" + sumar(List.of(1, 2.5, 3)));
        List<Number> destino = new ArrayList<>();
        agregarCeros(destino);
        System.out.println("tras agregarCeros=" + destino);
    }
}
```

```bash
javac -d out src/main/java/academia/generico/Demo.java
java -cp out academia.generico.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
maximo=9
suma=6.5
tras agregarCeros=[0, 0]
```

`maximo` usó la cota `<T extends Comparable<T>>` para poder llamar `compareTo`; `sumar` leyó de `? extends Number`; y `agregarCeros` escribió en `? super Integer` (PECS). **Fallo deliberado 1 — raw type:** declara `List lista = new ArrayList();`, añade un `String` y un `Integer`, y castea el `Integer` a `String`: compila con warning `unchecked` y revienta en runtime con `ClassCastException`. **Fallo deliberado 2 — erasure:** intenta `o instanceof List<String>`; no compila (`Object cannot be safely cast to List<String>`), porque el tipo se borró. Usa `instanceof List<?>`.

#### Aplica

**Paso 6 · Práctica independiente**

Escribe un método `copiar(List<? extends Number> origen, List<? super Number> destino)` que aplique PECS en una sola firma, y comprueba que acepta copiar de `List<Integer>` a `List<Object>`. Explica por qué el origen usa `extends` y el destino `super`.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Caja.java` compila; `Caja<String>` y `Caja<Integer>` imprimen el mismo nombre de clase.
- [ ] Guardar un `Integer` en una `Caja<String>` no compila.
- [ ] `maximo` usa `<T extends Comparable<T>>` y devuelve `9`.
- [ ] `sumar` (`? extends Number`) lee y `agregarCeros` (`? super Integer`) escribe (PECS).
- [ ] Un raw type compila con warning `unchecked` y puede fallar con `ClassCastException`.
- [ ] `instanceof List<String>` no compila; `instanceof List<?>` sí.

**Si falla.** Si `maximo` no compila, falta la cota `extends Comparable<T>`. Si no puedes añadir a un `? extends`, es lo correcto (usa `? super` para escribir). Si el raw type no da warning, compila con `-Xlint:unchecked`. Si `instanceof List<String>` compila, revisa tu versión de Java.

Guarda `Caja`, la salida del `Demo`, el `getClass()` idéntico, el `ClassCastException` del raw type y el error de `instanceof` parametrizado.

**Antes del siguiente tema:** explica qué verifica el compilador en `Caja<String>`, cuándo usar `? extends` frente a `? super`, y qué información borra el erasure.

**Errores comunes:** usar raw types perdiendo la verificación; invertir PECS (escribir en `? extends`); asumir que la información genérica está en runtime; e intentar `new T[]` o `instanceof` parametrizado.

**Fuentes oficiales revisadas el 2026-11-01:** [The Java Tutorials: Generics](https://docs.oracle.com/javase/tutorial/java/generics/), [Wildcards y PECS](https://docs.oracle.com/javase/tutorial/java/generics/wildcardGuidelines.html) y [dev.java: generics](https://dev.java/learn/generics/).

### Tema 3: Comparable vs Comparator, e iteración · Intermedio · 50 min

**Paso 1 · Objetivo y preparación**

**Prerrequisito:** Temas 1–2 de este módulo, JDK 27 o posterior y un editor. Comprueba `java --version` y `javac --version`.

**Al finalizar podrás:** implementar un orden natural correcto con `Comparable` (sin el bug de la resta); construir y encadenar `Comparator` (`comparing`/`thenComparing`/`reversed`/`nullsFirst`); y recorrer un `Map` con `entrySet()`.

#### Aprende

**Paso 2 · Contexto y caso profesional**

**Caso profesional (escenario de RutaFlow):** el listado de entregas necesita un orden canónico por antigüedad y órdenes alternativos por destino o peso. Cambiar una vista no debe alterar la clase de dominio ni el criterio que usan otras partes.

**Paso 3 · Teoría, modelo mental y analogía**

**¿Por qué es importante?** `Comparable` define el único orden natural de una clase; `Comparator` permite múltiples órdenes alternativos externos sin modificar esa clase, siendo la elección correcta según si se necesita un único criterio canónico o múltiples criterios intercambiables.

`Comparable` define el único orden natural de una clase implementando `compareTo`; `Comparator` define órdenes alternativos externos sin modificar esa clase.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `Comparable` y orden natural | Núcleo | `compareTo` define el único orden canónico |
| contrato de `compareTo` | Diagnóstico | signo negativo/cero/positivo, transitividad y consistencia |
| el bug de la resta (`a - b`) | Límite | `MIN_VALUE - 1` desborda; usa `Integer.compare` |
| `Comparator` externo | Núcleo | ordenar sin modificar la clase |
| `Comparator.comparing` y key extractor | Variante | construir un comparador desde un getter |
| encadenar: `thenComparing`, `reversed` | Variante | desempatar y revertir un criterio |
| orden con nulos (`nullsFirst`) | Límite | ubicar `null` sin lanzar excepción |
| consistencia `compareTo`/`equals` | Diagnóstico | un `TreeSet` descarta "iguales" según `compareTo` |
| iterar un `Map` con `entrySet()` | Integración | recorrer clave y valor en una sola pasada |

Cada fila tiene su explicación individual a continuación.

**`Comparable` y orden natural (núcleo).** Una clase que implementa `Comparable<T>` define su **único** orden natural en `compareTo`. Es el que usan `Collections.sort(lista)`, `TreeSet` y `TreeMap` sin pedir nada más. Reserva `Comparable` para el orden canónico que la entidad "siempre" tiene (por fecha, por antigüedad).

**Contrato de `compareTo` (diagnóstico).** `compareTo` devuelve negativo si `this` va antes, `0` si son equivalentes en el orden, y positivo si va después. Debe ser **transitivo** y **antisimétrico**; idealmente **consistente con `equals`**. Romper el contrato produce ordenaciones erráticas o elementos "perdidos" en estructuras ordenadas.

**El bug de la resta (límite).** `return this.edad - otra.edad;` parece inofensivo, pero **desborda**: `Integer.MIN_VALUE - 1` no es negativo sino `2147483647` (positivo), así que el orden se invierte en casos extremos. Usa siempre `Integer.compare(a, b)` (o `Long.compare`, etc.), que no desborda. Es un error real y silencioso.

**`Comparator` externo (núcleo).** `Comparator<T>` define órdenes **alternativos** sin tocar la clase: `lista.sort(comparador)`. Úsalo cuando necesites varios criterios según el contexto (por destino, por peso) que no deben vivir dentro del dominio.

**`Comparator.comparing` y key extractor (variante).** Construyes un comparador desde un getter: `Comparator.comparing(Entrega::destino)`. Para primitivos usa las variantes sin boxing `comparingInt`/`comparingDouble`. Es la forma legible de declarar "ordena por este campo".

**Encadenar: `thenComparing`, `reversed` (variante).** Compones criterios: `comparing(Entrega::destino).thenComparing(comparingInt(Entrega::peso).reversed())` ordena por destino y, dentro de cada destino, por peso descendente. `thenComparing` desempata; `reversed` invierte un criterio.

**Orden con nulos (límite).** Un `Comparator` natural lanza `NullPointerException` ante un `null`. `Comparator.nullsFirst(naturalOrder())` (o `nullsLast`) ubica los `null` al principio o al final sin fallar. Útil cuando los datos reales pueden traer ausencias.

**Consistencia `compareTo`/`equals` (diagnóstico).** Un `TreeSet`/`TreeMap` decide duplicados por `compareTo` (cuando devuelve `0`), **no** por `equals`. Si `compareTo` considera "iguales" a dos objetos que `equals` distingue, el `TreeSet` descartará uno. Mantén ambos coherentes para evitar elementos que "desaparecen".

**Iterar un `Map` con `entrySet()` (integración).** Para recorrer clave y valor en una sola pasada usa `for (var e : mapa.entrySet())` con `e.getKey()`/`e.getValue()`, en vez de iterar `keySet()` y volver a consultar el valor (menos eficiente). establece el único orden "natural" de esa clase, apropiado cuando existe una forma canónica y única de ordenar objetos de ese tipo (por ejemplo, ordenar personas por edad como su criterio de orden natural más obvio y común); `Comparator` (una función o clase externa a `Persona`, pasada explícitamente a métodos de ordenamiento como `sort`) permite definir órdenes alternativos adicionales sin modificar la clase original (`personas.sort(Comparator.comparing(Persona::getNombre))`, ordenando por nombre sin tocar la implementación de `compareTo` que ya ordena por edad), apropiado cuando se necesitan múltiples criterios de orden distintos según el contexto específico de cada uso.

Recorrer un `Map` con for-each requiere iterar sobre `entrySet()` (`for (Map.Entry<String, Integer> entrada : edades.entrySet())`), que devuelve una vista del mapa como un conjunto de pares clave-valor, permitiendo acceder tanto a `entrada.getKey()` como a `entrada.getValue()` dentro de una única iteración, en vez de iterar únicamente sobre las claves (`keySet()`) y tener que consultar el valor correspondiente por separado en cada iteración, un patrón menos eficiente que recorrer directamente los pares ya emparejados de `entrySet()`.

**Analogía:** `Comparable` es como la forma oficial y única en que un catálogo ordena sus productos por defecto (por ejemplo, por código de producto); `Comparator` es como poder pedirle al mismo catálogo que, sin modificar su orden oficial, te lo muestre temporalmente ordenado de otra forma alternativa según tu necesidad puntual (por precio, por nombre), sin alterar el orden oficial del catálogo para nadie más.

**Conceptos clave:** orden natural único frente a órdenes alternativos externos, `entrySet()`.

**Código del ejemplo:**

```java
class Persona implements Comparable<Persona> {
    public int compareTo(Persona otra) { return this.edad - otra.edad; } // orden "natural"
}
personas.sort(Comparator.comparing(Persona::getNombre)); // orden alternativo, sin modificar la clase

for (Map.Entry<String, Integer> entrada : edades.entrySet()) {
    System.out.println(entrada.getKey() + ": " + entrada.getValue());
}
```

Definir el orden natural de cada entidad del proyecto integrador de este track (por fecha, por antigüedad) con `Comparable`, y reservar `Comparator` para vistas alternativas puntuales, evita mezclar ambas responsabilidades en una sola clase.

**Cuándo no usarlo:** implementar `Comparable` no tiene sentido para una clase que nunca se ordenará (una entidad puramente de referencia); y usar un `Comparator` externo para el único orden que la clase siempre necesitará agrega indirección donde `Comparable` sería más directo.

**Implicación práctica:** Mezclar el único orden natural de una clase (`Comparable`) con necesidades de orden puntuales y alternativas (`Comparator`) en una sola implementación obliga a modificar la clase original cada vez que alguien necesita un criterio de orden distinto.

#### Practica

**Paso 4 · Demostración guiada desde cero**

**Desde cero:** parte de una carpeta vacía y prepara la estructura.

```bash
mkdir ejemplo-comparable-comparator
cd ejemplo-comparable-comparator
mkdir -p src/main/java/academia/orden
```

**Crea** `src/main/java/academia/orden/Entrega.java` con la entidad que implementa `Comparable<Entrega>` por antigüedad y un `Main` que la ordene primero de forma natural y luego por destino:

```java
package academia.orden;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

class Entrega implements Comparable<Entrega> {
    private final String numero;
    private final int antiguedadDias;
    private final String destino;
    private final double pesoKg;

    Entrega(String numero, int antiguedadDias, String destino, double pesoKg) {
        this.numero = numero;
        this.antiguedadDias = antiguedadDias;
        this.destino = destino;
        this.pesoKg = pesoKg;
    }

    public int compareTo(Entrega otra) {
        return Integer.compare(this.antiguedadDias, otra.antiguedadDias);
    }

    String getDestino() { return destino; }
    double getPesoKg() { return pesoKg; }

    @Override
    public String toString() {
        return numero + " (" + destino + ", " + antiguedadDias + " días, " + pesoKg + " kg)";
    }
}

final class Main {
    public static void main(String[] args) {
        List<Entrega> entregas = new ArrayList<>(List.of(
            new Entrega("RF-3", 2, "Lima", 8.5),
            new Entrega("RF-1", 5, "Arequipa", 3.0),
            new Entrega("RF-2", 1, "Lima", 12.0)
        ));
        Collections.sort(entregas);
        System.out.println("Natural: " + entregas);
        entregas.sort(Comparator.comparing(Entrega::getDestino));
        System.out.println("Por destino: " + entregas);
    }
}
```

**Ejecuta el ejemplo** (ordena la misma lista con dos criterios):

```bash
javac -d out src/main/java/academia/orden/Entrega.java
java -cp out academia.orden.Main
```

**Resultado esperado:** el primer listado queda ordenado por antigüedad (`RF-2`, `RF-3`, `RF-1`) y el segundo por destino (`Arequipa` primero y luego las dos de `Lima`, conservando entre ellas el orden natural porque el ordenamiento es estable).

**Paso 5 · Práctica guiada**

**Fallo deliberado:** elimina `implements Comparable<Entrega>` de la clase y recompila. `Collections.sort(entregas)` deja de compilar porque la lista no conoce un orden natural; restaura la interfaz y confirma que ambos órdenes coexisten sin conflicto.

**Pista:** si el compilador acepta el código sin `Comparable`, la lista se está ordenando con un `Comparator` explícito en esa llamada. **Resultado esperado:** dos salidas ordenadas de forma distinta a partir de la misma lista.

Ahora cierra los subtemas de comparador encadenado, nulos y el bug de la resta. Crea `src/main/java/academia/orden/Demo.java`:

```java
package academia.orden;
import java.util.*;

public final class Demo {
    public static void main(String[] args) {
        List<Entrega> lista = new ArrayList<>(List.of(
            new Entrega("RF-3", 3, "Norte", 10),
            new Entrega("RF-1", 1, "Sur", 5),
            new Entrega("RF-2", 2, "Norte", 2)));

        // encadenado: por destino, y dentro por peso descendente
        lista.sort(Comparator.comparing(Entrega::getDestino)
                             .thenComparing(Comparator.comparingDouble(Entrega::getPesoKg).reversed()));
        System.out.println("encadenado=" + lista);

        // orden con nulos sin lanzar
        List<String> conNull = new ArrayList<>(Arrays.asList("b", null, "a"));
        conNull.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println("nullsFirst=" + conNull);

        // el bug de la resta frente a Integer.compare
        int a = Integer.MIN_VALUE, b = 1;
        System.out.println("resta=" + (a - b) + "  Integer.compare=" + Integer.compare(a, b));
    }
}
```

```bash
javac -d out src/main/java/academia/orden/Demo.java
java -cp out academia.orden.Demo
```

**Salida esperada (verificada con Temurin 27.0.1):**

```text
encadenado=[RF-3 (Norte, 3 días, 10.0 kg), RF-2 (Norte, 2 días, 2.0 kg), RF-1 (Sur, 1 días, 5.0 kg)]
nullsFirst=[null, a, b]
resta=2147483647  Integer.compare=-1
```

`thenComparing(...reversed())` agrupó por destino y, dentro de `Norte`, puso primero el peso mayor; `nullsFirst` ubicó el `null` sin lanzar; y la última línea prueba por qué `a - b` es peligroso: `MIN_VALUE - 1` **desborda a positivo** (`2147483647`) mientras `Integer.compare` devuelve el `-1` correcto.

**Si falla.** Si `javac` no encuentra `Entrega`, revisa el paquete. Si el encadenado no desempata por peso, el segundo criterio no se aplicó. Si `nullsFirst` lanza `NullPointerException`, no envolviste el comparador natural. Si `resta` no da positivo, no partiste de `Integer.MIN_VALUE`.

#### Aplica

**Paso 6 · Práctica independiente**

Agrega un segundo `Comparator` por peso y encadénalos con `thenComparing`; recorre el resultado con un `Map<String, List<Entrega>>` agrupado por destino usando `entrySet()`.

**Paso 7 · Cierre**

**Checklist de salida.**

- [ ] `Entrega.java` compila; el orden natural produce `RF-2`, `RF-3`, `RF-1`.
- [ ] Sin `Comparable`, `Collections.sort(lista)` no compila y explicas por qué.
- [ ] `thenComparing(...reversed())` desempata por peso descendente dentro de cada destino.
- [ ] `Comparator.nullsFirst` ordena una lista con `null` sin lanzar excepción.
- [ ] `MIN_VALUE - 1` desborda a positivo, mientras `Integer.compare` da el signo correcto.
- [ ] Recorres un `Map` con `entrySet()` accediendo a clave y valor en una pasada.

**Si falla.** Si `thenComparing` no compila, los comparadores deben ser del mismo tipo. Si `nullsFirst` lanza `NullPointerException`, no envolviste el comparador natural. Si el `compareTo` con resta "parece" funcionar, prueba con `Integer.MIN_VALUE`. Si un `TreeSet` descarta un elemento, `compareTo` lo considera igual a otro.

Guarda `Entrega`, ambos órdenes, el comparador encadenado, el caso de nulos y la demostración del desbordamiento de la resta.

**Antes del siguiente tema:** explica cuándo el orden natural pertenece a la entidad, por qué `Integer.compare` en vez de la resta, y cómo encadenar criterios con `thenComparing`.

**Errores comunes:** implementar `compareTo` con una resta que desborda; mutar el campo de orden tras insertar en un `TreeSet`; definir un `Comparable` inconsistente con `equals`; y olvidar `nullsFirst`/`nullsLast` cuando los datos traen nulos.

**Fuentes oficiales revisadas el 2026-11-01:** [`Comparator` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/Comparator.html), [`Comparable` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/Comparable.html) y [dev.java: Collections Framework](https://dev.java/learn/api/collections-framework/).

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una estructura de datos genérica propia con tests, comparando el rendimiento de distintas implementaciones de colecciones.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Comparar `ArrayList` vs `LinkedList` insertando al inicio | Ver Tema 1 | Mide el tiempo con 100,000 elementos |
| 2 | Usar `HashSet` y `TreeSet` para eliminar duplicados | Ver Tema 1 | Compara la presencia de orden |
| 3 | Crear `Caja<T>` genérica | Ver Tema 2 | Verifica la seguridad de tipos en compilación |
| 4 | Implementar `Comparable` y un `Comparator` externo | Ver Tema 3 | Compara ambos criterios de orden |
| 5 | Recorrer un `Map` con `entrySet()` | Ver Tema 3 | Verifica acceso a clave y valor |

**Verificación:** el laboratorio se considera exitoso si la comparación de rendimiento entre `ArrayList` y `LinkedList` muestra la diferencia esperada al insertar al inicio, y si la estructura de datos genérica propia funciona correctamente con al menos dos tipos concretos distintos.

**Errores comunes y soluciones**

- **Usar `ArrayList` para inserciones frecuentes al inicio de una lista grande.** Considera `LinkedList` para ese patrón de acceso específico.
- **Asumir orden en un `HashSet`.** Usa `TreeSet` o `LinkedHashSet` si el orden importa.
- **Confundir cuándo usar `Comparable` frente a `Comparator`.** Usa `Comparable` para el único orden natural de la clase; `Comparator` para órdenes alternativos externos.

---
