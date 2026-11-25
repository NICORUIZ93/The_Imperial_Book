# Módulo 6: Matemáticas discretas, lógica y probabilidad para software

**Entorno comprobado para esta edición (2026-11-24):** OpenJDK 25.0.5.1 en Linux x86_64; para la prueba basada en
propiedades, Gradle 8.14.3 con jqwik 1.9.2 y JUnit 5.13.4 (las bibliotecas se resolvieron desde una copia local de
Maven Central). Todas las salidas se obtuvieron ejecutando el código mostrado ese día, en la carpeta de práctica
`/home/estudiante/labs/discretas` (tu `~/labs/discretas`). Los resultados exactos (conteos, fracciones, tablas de verdad
y simulaciones con semilla) deben coincidir con los tuyos. Los **milisegundos** del Tema 4 cambian en cada máquina y en
cada ejecución: lo que se mantiene es la proporción entre ellos. Los comandos para Windows no se ejecutaron.

Las matemáticas de este módulo no son una colección de fórmulas para memorizar. Son un lenguaje para decir exactamente
qué debe ocurrir, detectar contradicciones, justificar algoritmos y distinguir una mejora real de una coincidencia.
Cada idea llega en tres formas: en español, en símbolos y en un programa de Java que la calcula o la comprueba.

#### Objetivos del módulo
Al terminar este módulo podrás:
- escribir reglas de negocio como proposiciones y especificaciones, y encontrar contraejemplos de forma automática;
- operar con conjuntos, clasificar relaciones y demostrar por inducción una propiedad de un algoritmo;
- contar casos con reglas de conteo, permutaciones y combinaciones sin tener que listarlos;
- modelar dependencias como un grafo dirigido, detectar ciclos y obtener un orden topológico;
- calcular probabilidades exactas, condicionales y esperanzas, y comprobarlas con una simulación reproducible;
- medir con percentiles y comunicar una conclusión sin falsear su precisión.

#### Esquema del módulo
1. Lógica para especificar antes de programar.
2. Conjuntos, relaciones, funciones e inducción.
3. Conteo, grafos y estructuras conectadas.
4. Probabilidad y evidencia para decisiones técnicas.
5. Proyecto 9: cuaderno de propiedades, grafos y evidencia.

**Qué necesitas saber antes:** caso de prueba, `assert` y excepción (Módulo 1, Tema 1); condiciones y bucles
(Módulo 1, Tema 3); métodos (Módulo 1, Tema 4); clases, records y enums (Módulo 1, Tema 6); `List`, `Map` y `Set`
(Módulo 2, Tema 1); precondición, postcondición e invariante de ciclo (Módulo 2, Tema 3); complejidad, recursión y
caso base (Módulo 2, Tema 4); grafos, lista de adyacencia y DFS (Módulo 2, Tema 7); proyectos Gradle con JUnit
(Módulo 4, Tema 2); streams con `filter`, `map` y `toList` (Módulo 4, Tema 1).

#### Cómo leer las fórmulas de este módulo
Las fórmulas son abreviaturas de frases. Cada símbolo se explica la primera vez que aparece. Esta tabla los reúne para
que vuelvas a ella cuando lo necesites.

| Símbolo | Se lee | En Java | Tema |
|---|---|---|---|
| ¬p | «no p» | `!p` | 1 |
| p ∧ q | «p y q» | `p && q` | 1 |
| p ∨ q | «p o q» (o las dos) | `p \|\| q` | 1 |
| p → q | «si p, entonces q» | `!p \|\| q` | 1 |
| p ↔ q | «p si y solo si q» | `p == q` (con `boolean`) | 1 |
| ∀x | «para todo x» | `stream().allMatch(...)` | 1 |
| ∃x | «existe al menos un x» | `stream().anyMatch(...)` | 1 |
| x ∈ A | «x pertenece a A» | `A.contains(x)` | 2 |
| A ⊆ B | «A es subconjunto de B» | `B.containsAll(A)` | 2 |
| A ∪ B, A ∩ B, A − B | unión, intersección, diferencia | `addAll`, `retainAll`, `removeAll` sobre una copia | 2 |
| A × B | producto cartesiano | dos `for` anidados | 2 |
| \|A\| | cardinal: cuántos elementos tiene A | `A.size()` | 2 |
| Σ | suma de varios términos | `stream().mapToInt(...).sum()` | 2 |
| n! | factorial de n | `factorial(n)`, escrito con `BigInteger` | 3 |
| C(n, k) | combinaciones de n en k | `combinaciones(n, k)` | 3 |
| P(A) | probabilidad del evento A | `Fraccion.de(casosA, casosTotal)` | 4 |
| P(A \| B) | probabilidad de A dado B | `pAmbos.dividir(pB)` | 4 |
| E[X] | esperanza (valor esperado) de X | suma de `x · P(x)` con `Fraccion` | 4 |


## Aprende construyendo


### Tema 1: Lógica para especificar antes de programar · Avanzado · 70 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- traducir una regla escrita en español a proposiciones unidas por conectivos, en símbolos y en Java;
- construir la tabla de verdad de una fórmula y decidir si dos fórmulas son equivalentes;
- escribir la precondición, la postcondición y el invariante de una operación como implicaciones verificables;
- encontrar un contraejemplo revisando todos los casos de un dominio pequeño y con jqwik.

**Conceptos clave:** proposición, conectivo lógico, tabla de verdad, implicación, equivalencia lógica, cuantificador, contraejemplo, invariante, prueba basada en propiedades

#### El problema
La bodega de RutaFlow tiene una regla escrita en un correo: «no se puede retirar más de lo que hay». Dos personas la
programan. Una revisa que haya stock; la otra, que el stock alcance para el pedido. Las dos dicen «funciona» porque
probaron un par de casos. ¿Cómo escribes la regla para que una máquina decida quién tiene razón, y cómo encuentras el
caso exacto que la rompe?

Este tema usa lo que ya conoces: **precondición** y **postcondición** tienen su ficha en el Módulo 2, Tema 3;
**assert** y **caso de prueba**, en el Módulo 1, Tema 1. Aquí no se redefinen.

#### Glosario del tema

**proposición**
- **Definición técnica:** enunciado que, en un contexto dado, es verdadero o falso, sin ambigüedad. Su valor de verdad se representa con `true` o `false`.
- **En palabras sencillas:** una frase a la que puedes contestar «es cierto» o «no es cierto».
- **Dónde se rompe la comparación:** «el stock está bajo» suena a proposición, pero no lo es hasta que defines «bajo»; `stock < 10` sí lo es.
- **Ejemplo:** \(p\): «la cantidad pedida no supera el stock». En Java, `cantidad <= stock` produce `true` o `false`.
- **Error típico:** tratar una pregunta o una orden («¿hay stock?», «retira 3») como proposición: no tienen valor de verdad.

**conectivo lógico**
- **Definición técnica:** operador que forma una proposición compuesta a partir de otras: negación \(\neg p\), conjunción \(p \land q\) y disyunción \(p \lor q\). En Java son `!`, `&&` y `||`.
- **En palabras sencillas:** las palabras «no», «y» y «o» del español, pero con un significado fijo que no depende del tono.
- **Dónde se rompe la comparación:** el «o» lógico es inclusivo: \(p \lor q\) es verdadera también cuando las dos lo son. En español, «café o té» suele excluir una opción.
- **Ejemplo:** `stock > 0 && cantidad <= stock` une dos proposiciones con «y».
- **Error típico:** escribir `estado.equals("creado") || "asignado"`, como se diría en voz alta. Java no compila: `error: bad operand types for binary operator '||'`. Cada lado debe ser una proposición: `estado.equals("creado") || estado.equals("asignado")`.

**tabla de verdad**
- **Definición técnica:** tabla que lista todas las combinaciones de valores de las proposiciones simples y el valor de la fórmula en cada una. Con \(n\) proposiciones tiene \(2^n\) filas.
- **En palabras sencillas:** probar la fórmula con todas las entradas posibles, sin saltarte ninguna.
- **Dónde se rompe la comparación:** solo es práctica con pocas proposiciones: con 30 tendría más de mil millones de filas.
- **Ejemplo:** con \(p\) y \(q\) hay \(2^2 = 4\) filas: verdadero-verdadero, verdadero-falso, falso-verdadero y falso-falso.
- **Error típico:** escribir las filas a mano y olvidar una; dos `for` anidados sobre `{true, false}` las generan todas.

**implicación**
- **Definición técnica:** conectivo \(p \to q\), «si \(p\), entonces \(q\)». Es falsa solo cuando \(p\) es verdadera y \(q\) es falsa; equivale a \(\neg p \lor q\). \(p\) se llama antecedente y \(q\), consecuente.
- **En palabras sencillas:** una promesa: «si llueve, llevo paraguas». Solo la rompes si llueve y no lo llevas.
- **Dónde se rompe la comparación:** en español, «si» sugiere causa. En lógica no: cuando \(p\) es falsa, \(p \to q\) es verdadera, pase lo que pase con \(q\).
- **Ejemplo:** «si el retiro se acepta, el stock nuevo es mayor o igual que 0» se escribe `!aceptado || stockNuevo >= 0`.
- **Error típico:** confundirla con su recíproca \(q \to p\). La tabla de verdad del Problema resuelto 1.1 muestra que no dicen lo mismo.

**equivalencia lógica**
- **Definición técnica:** dos fórmulas son lógicamente equivalentes (\(\equiv\)) si tienen el mismo valor de verdad en todas las filas de su tabla.
- **En palabras sencillas:** dos maneras distintas de decir exactamente lo mismo.
- **Dónde se rompe la comparación:** coincidir en algunas filas no basta; una sola fila distinta las hace diferentes.
- **Ejemplo:** la ley de De Morgan \(\neg(p \land q) \equiv \neg p \lor \neg q\) y la contrapositiva \(p \to q \equiv \neg q \to \neg p\).
- **Error típico:** negar `a && b` como `!a && !b`. Lo correcto, por De Morgan, es `!a || !b`.

**cuantificador**
- **Definición técnica:** símbolo que indica para cuántos elementos de un dominio vale una propiedad: el universal \(\forall x\) («para todo \(x\)») y el existencial \(\exists x\) («existe al menos un \(x\)»). En Java se evalúan con `allMatch` y `anyMatch` de un stream.
- **En palabras sencillas:** «todos cumplen» frente a «al menos uno cumple».
- **Dónde se rompe la comparación:** `allMatch` y `anyMatch` recorren una colección finita; un \(\forall\) sobre todos los enteros no se puede revisar caso por caso.
- **Ejemplo:** \(\forall s \in \{0, 1, \dots, 5\}: s \ge 0\) se escribe `IntStream.rangeClosed(0, 5).allMatch(s -> s >= 0)` y da `true`.
- **Error típico:** olvidar que `allMatch` sobre un stream vacío devuelve `true`. Si la lista llegó vacía por un error, la comprobación «pasa» sin revisar nada.

**contraejemplo**
- **Definición técnica:** elemento del dominio para el que la propiedad es falsa. Uno solo basta para refutar un \(\forall\).
- **En palabras sencillas:** el caso concreto que demuestra que «siempre» era falso.
- **Dónde se rompe la comparación:** no encontrar contraejemplos no demuestra la propiedad; quizá buscaste donde no estaban.
- **Ejemplo:** `stock=1, cantidad=2` refuta «todo retiro deja stock ≥ 0» en la versión con defecto de `retirar`.
- **Error típico:** descartarlo como «caso raro». Con miles de pedidos al día, los casos raros ocurren todos los días.

**invariante**
- **Definición técnica:** propiedad del estado de un sistema que se cumple antes y después de cada operación válida. Generaliza el invariante de ciclo del Módulo 2, Tema 3, de un bucle a todo el sistema.
- **En palabras sencillas:** una regla que nunca se rompe, haga lo que haga el programa.
- **Dónde se rompe la comparación:** dentro de una operación puede romperse un instante; lo que se exige es que vuelva a cumplirse al terminar.
- **Ejemplo:** «para todo producto, stock ≥ 0»: \(\forall x \in \text{Productos}: \text{stock}(x) \ge 0\).
- **Error típico:** comprobarlo solo al crear el objeto y no después de cada operación que lo modifica.

**prueba basada en propiedades**
- **Definición técnica:** prueba que afirma una propiedad para todas las entradas de un tipo y deja que una herramienta genere cientos de entradas buscando un contraejemplo. Si lo encuentra, lo reduce al más simple (*shrinking*). En Java la herramienta habitual es jqwik, que corre sobre la plataforma de JUnit.
- **En palabras sencillas:** en vez de inventar tú cinco casos, describes la regla y una máquina intenta romperla.
- **Dónde se rompe la comparación:** genera muchos casos, no todos. Que pase es evidencia fuerte, no una demostración.
- **Ejemplo:** `@ForAll @IntRange(min = 0, max = Integer.MAX_VALUE) int stock` le pide a jqwik enteros no negativos para `stock`.
- **Error típico:** escribir una propiedad que repite el código probado (`assertEquals(retirar(s, c), retirar(s, c))`): nunca falla y no prueba nada.

#### ► CÓMO FUNCIONA
Especificar es escribir la regla de forma que no admita dos lecturas. Lo haces en tres pasos.

**Paso 1: separa las proposiciones.** «No se puede retirar más de lo que hay» contiene dos ideas que se pueden
comprobar: \(a\): «el retiro se acepta» y \(c\): «la cantidad no supera el stock», es decir, \(\text{cantidad} \le \text{stock}\).

**Paso 2: únelas con conectivos.** La regla dice que se acepta exactamente cuando alcanza. Eso es un «si y solo si»:

\[ a \leftrightarrow c \]

Se lee «\(a\) si y solo si \(c\)». El símbolo \(\leftrightarrow\) significa \((a \to c) \land (c \to a)\): cada una implica
a la otra. Con `boolean`, en Java es `a == c`. La implicación \(p \to q\) es la pieza central. Su tabla:

| p | q | p → q | Por qué |
|---|---|---|---|
| V | V | V | Llovió y llevaste paraguas: cumpliste |
| V | F | F | Llovió y no lo llevaste: rompiste la promesa |
| F | V | V | No llovió: la promesa no se puso a prueba |
| F | F | V | No llovió: tampoco se puso a prueba |

Las dos últimas filas sorprenden. Una promesa sobre la lluvia no se rompe en un día seco.

**Paso 3: cuantifica.** Una especificación habla de **todas** las entradas válidas. Con \(s\) para el stock, \(k\) para
la cantidad y \(s'\) («ese prima») para el stock después del retiro:

\[ \forall s \ge 0,\ \forall k \ge 1:\quad a \to s' \ge 0 \]

Se lee: «para todo stock \(s\) mayor o igual que 0 y toda cantidad \(k\) mayor o igual que 1, si el retiro se acepta,
el stock nuevo no es negativo». La coma separa los cuantificadores; los dos puntos significan «se cumple que».

La forma general de una especificación es: **precondición → postcondición**, y el **invariante** se conserva antes y
después. En texto plano, para `retirar` y para el cambio de estado de un envío:

```text
Pre: cantidad > 0 y producto existe
Transición: stock_nuevo = stock_anterior - cantidad
Post: retiro aceptado implica stock_nuevo >= 0
Invariante global: para todo producto, stock >= 0
```

Para refutar un \(\forall\) basta un contraejemplo. Por eso la negación de «para todo» es «existe uno que no»:

\[ \neg\,\forall x: P(x) \;\equiv\; \exists x: \neg P(x) \]

Tienes dos formas de buscar ese \(x\). Si el dominio es pequeño, lo recorres entero con `allMatch` y `anyMatch`. Si es enorme,
como todos los enteros, dejas que jqwik genere ejemplos y reduzca el fallo al caso mínimo.

```mermaid
flowchart LR
    PRE["entrada cumple precondición"] --> OP["operación"] --> POST["postcondición"]
    INV["invariante"] -. "antes y después" .-> PRE
    INV -. "debe conservarse" .-> POST
    POST -->|"falla en un caso"| CE["contraejemplo"]
```

#### Problema resuelto 1.1
Construye con Java la tabla de verdad de los conectivos y de la implicación. Luego decide tres preguntas: ¿\(p \to q\)
equivale a su recíproca \(q \to p\)? ¿Y a su contrapositiva \(\neg q \to \neg p\)? ¿Se cumple De Morgan?

**Razonamiento:**
1. Java no tiene operador de implicación; lo defines como método con su equivalencia \(\neg p \lor q\).
2. Dos `for` anidados sobre `{true, false}` generan las \(2^2 = 4\) filas sin olvidar ninguna.
3. Dos fórmulas son equivalentes si coinciden en **todas** las filas: eso es un `allMatch` sobre las cuatro.

```java
// TablaVerdad.java — tablas de verdad de los conectivos y de la implicación
boolean implica(boolean p, boolean q) {
    return !p || q;
}

String celda(boolean valor) {
    return String.format("%-5s", valor);
}

void main() {
    boolean[] valores = {true, false};
    List<boolean[]> casos = new ArrayList<>();
    for (boolean p : valores) {
        for (boolean q : valores) {
            casos.add(new boolean[] {p, q});
        }
    }
    IO.println("p     q     | no p   p y q  p o q  p→q");
    for (boolean[] c : casos) {
        boolean p = c[0], q = c[1];
        IO.println(celda(p) + " " + celda(q) + " | " + celda(!p) + "  " + celda(p && q) + "  "
                + celda(p || q) + "  " + implica(p, q));
    }
    IO.println("p→q equivale a q→p: " + casos.stream().allMatch(c -> implica(c[0], c[1]) == implica(c[1], c[0])));
    IO.println("p→q equivale a no q → no p: " + casos.stream().allMatch(c -> implica(c[0], c[1]) == implica(!c[1], !c[0])));
    IO.println("no (p y q) equivale a (no p) o (no q): " + casos.stream().allMatch(c -> !(c[0] && c[1]) == (!c[0] || !c[1])));
}
```

```text
$ java TablaVerdad.java
p     q     | no p   p y q  p o q  p→q
true  true  | false  true   true   true
true  false | false  false  true   false
false true  | true   false  true   true
false false | true   false  false  true
p→q equivale a q→p: false
p→q equivale a no q → no p: true
no (p y q) equivale a (no p) o (no q): true
```

**Explicación por partes.**
- Líneas 2–4: `implica` traduce \(p \to q \equiv \neg p \lor q\). Solo devuelve `false` cuando `p` es `true` y `q` es `false`.
- Líneas 6–8: `%-5s` escribe el valor alineado a la izquierda en 5 espacios, para que las columnas queden derechas.
- Líneas 11–17: los dos `for` anidados llenan la lista con las cuatro filas; cada fila es un arreglo `{p, q}`.
- Líneas 19–23: cada fila calcula cuatro columnas. En la salida, la columna `p→q` solo tiene `false` en la fila `true false`: la promesa rota.
- Línea 24: la recíproca da `false`; en la fila `false true`, \(p \to q\) es verdadera y \(q \to p\) es falsa.
- Líneas 25–26: la contrapositiva y De Morgan coinciden en las cuatro filas: son equivalencias.

> **Error común.** Escribir la implicación con una flecha, como en matemáticas: `IO.println(p -> q)`. En Java, `->`
> escribe una lambda (Módulo 2, Proyecto), así que el compilador responde `error: no suitable method found for println((p)->q)`.
> Java no tiene operador de implicación; escribe `!p || q`.

> **Buena práctica.** Cuando una condición tenga más de dos conectivos, comprueba tu simplificación con una tabla de
> verdad generada por código antes de cambiar el `if`. Veinte líneas de Java evitan un error que nadie ve en revisión.

#### Problema resuelto 1.2
Esta es la versión de `retirar` que «funciona» según quien la escribió. Comprueba la especificación \(a \leftrightarrow c\)
y \(a \to s' \ge 0\): primero en todos los casos de un dominio pequeño y después con jqwik.

```java
// Inventario.java — retiro de cajas (versión con defecto)
class Inventario {
    record Resultado(boolean aceptado, int stock) {}

    static Resultado retirar(int stock, int cantidad) {
        if (stock > 0) {
            return new Resultado(true, stock - cantidad);
        }
        return new Resultado(false, stock);
    }
}
```

**Razonamiento:**
1. La especificación tiene dos partes; cada una es una proposición que la función `cumple` evalúa.
2. Dominio pequeño: stock de 0 a 5 y cantidad de 1 a 5. Son \(6 \cdot 5 = 30\) casos; se revisan todos con `allMatch` y `anyMatch`.
3. Dominio enorme: todos los enteros válidos. Ahí jqwik genera ejemplos y reduce el fallo al más simple.
4. Si aparece un contraejemplo, se corrige la función y se ejecutan las dos comprobaciones otra vez.

```java
// ParaTodo.java — comprueba la especificación en TODOS los casos de un dominio pequeño
boolean cumple(int stock, int cantidad) {
    Inventario.Resultado r = Inventario.retirar(stock, cantidad);
    boolean post1 = !r.aceptado() || r.stock() >= 0;           // aceptado → stock nuevo ≥ 0
    boolean post2 = r.aceptado() == (cantidad <= stock);        // aceptado ↔ cantidad ≤ stock
    return post1 && post2;
}

void main() {
    List<int[]> dominio = new ArrayList<>();
    for (int s = 0; s <= 5; s++) {
        for (int c = 1; c <= 5; c++) {
            dominio.add(new int[] {s, c});
        }
    }
    List<String> contraejemplos = dominio.stream()
            .filter(caso -> !cumple(caso[0], caso[1]))
            .map(caso -> "(" + caso[0] + ", " + caso[1] + ")")
            .toList();
    IO.println("casos revisados: " + dominio.size());
    IO.println("¿se cumple para todo caso? " + dominio.stream().allMatch(caso -> cumple(caso[0], caso[1])));
    IO.println("¿existe un contraejemplo? " + dominio.stream().anyMatch(caso -> !cumple(caso[0], caso[1])));
    IO.println("primeros contraejemplos: " + contraejemplos.subList(0, Math.min(3, contraejemplos.size())));
}
```

```text
$ java ParaTodo.java
casos revisados: 30
¿se cumple para todo caso? false
¿existe un contraejemplo? true
primeros contraejemplos: [(1, 2), (1, 3), (1, 4)]
```

Ahora la prueba basada en propiedades. jqwik es una biblioteca, así que va en un proyecto Gradle como el del Módulo 4,
Tema 2: `~/labs/discretas/propiedades`, con `Inventario.java` en `src/main/java` (con `public` en la clase, el record y
el método) y la prueba en `src/test/java`.

```kotlin
plugins {
    java
}

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("net.jqwik:jqwik:1.9.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "failed", "skipped")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        showStackTraces = false
        showStandardStreams = true
    }
}

tasks.withType<JavaCompile> {
    options.compilerArgs.add("-parameters")
}
```

```java
// InventarioPropiedadesTest.java — jqwik busca un contraejemplo por ti
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.IntRange;

class InventarioPropiedadesTest {
    @Property
    void retirarPreservaStockNoNegativo(
            @ForAll @IntRange(min = 0, max = Integer.MAX_VALUE) int stock,
            @ForAll @IntRange(min = 1, max = Integer.MAX_VALUE) int cantidad) {
        Inventario.Resultado resultado = Inventario.retirar(stock, cantidad);
        assertTrue(resultado.stock() >= 0, "stock negativo: " + resultado.stock());
        assertEquals(cantidad <= stock, resultado.aceptado());
    }
}
```

```text
$ gradle test
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses

> Task :test FAILED

InventarioPropiedadesTest > retirarPreservaStockNoNegativo STANDARD_OUT
    timestamp = 2026-11-24T18:55:59.678977005, InventarioPropiedadesTest:retirarPreservaStockNoNegativo = 
      org.opentest4j.AssertionFailedError:
        stock negativo: -1 ==> expected: <true> but was: <false>

                                  |-----------------------jqwik-----------------------
    tries = 5                     | # of calls to property
    checks = 5                    | # of not rejected calls
    generation = RANDOMIZED       | parameters are randomly generated
    after-failure = SAMPLE_FIRST  | try previously failed sample, then previous seed
    when-fixed-seed = ALLOW       | fixing the random seed is allowed
    edge-cases#mode = MIXIN       | edge cases are mixed in
    edge-cases#total = 20         | # of all combined edge cases
    edge-cases#tried = 0          | # of edge cases tried in current run
    seed = -6104831610984117893   | random seed to reproduce generated values

    Shrunk Sample (2 steps)
    -----------------------
      stock: 1
      cantidad: 2

    Original Sample
    ---------------
      stock: 466
      cantidad: 912712

      Original Error
      --------------
      org.opentest4j.AssertionFailedError:
        stock negativo: -912246 ==> expected: <true> but was: <false>



InventarioPropiedadesTest > retirarPreservaStockNoNegativo FAILED
    org.opentest4j.AssertionFailedError: stock negativo: -1 ==> expected: <true> but was: <false>

1 test completed, 1 failed

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':test'.
> There were failing tests. See the report at: file:///home/estudiante/labs/discretas/propiedades/build/reports/tests/test/index.html

* Try:
> Run with --scan to get full insights.

BUILD FAILED in 3s
3 actionable tasks: 3 executed
```

jqwik encontró `stock=466, cantidad=912712` y lo **redujo** en 2 pasos al caso mínimo `stock=1, cantidad=2`: hay stock,
así que la versión con defecto acepta, y deja el stock en \(-1\). La corrección cambia la condición de la línea 6 por
la proposición \(c\) de la especificación:

```java
// Inventario.java — retiro de cajas (corregido)
class Inventario {
    record Resultado(boolean aceptado, int stock) {}

    static Resultado retirar(int stock, int cantidad) {
        if (cantidad <= stock) {             // acepta solo si el stock alcanza
            return new Resultado(true, stock - cantidad);
        }
        return new Resultado(false, stock);
    }
}
```

```text
$ java ParaTodo.java
casos revisados: 30
¿se cumple para todo caso? true
¿existe un contraejemplo? false
primeros contraejemplos: []
```

```text
$ gradle test
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses

> Task :test

InventarioPropiedadesTest > retirarPreservaStockNoNegativo STANDARD_ERROR
    Nov 24, 2026 6:56:09 PM net.jqwik.engine.execution.AfterFailureParametersGenerator logAfterFailureHandling
    INFO: After Failure Handling: SAMPLE_FIRST, Previous Generation: <GenerationInfo(-6104831610984117893, 5, [size=4])>

InventarioPropiedadesTest > retirarPreservaStockNoNegativo STANDARD_OUT
    timestamp = 2026-11-24T18:56:09.936857621, InventarioPropiedadesTest:retirarPreservaStockNoNegativo = 
                                  |-----------------------jqwik-----------------------
    tries = 1000                  | # of calls to property
    checks = 1000                 | # of not rejected calls
    generation = RANDOMIZED       | parameters are randomly generated
    after-failure = SAMPLE_FIRST  | try previously failed sample, then previous seed
    when-fixed-seed = ALLOW       | fixing the random seed is allowed
    edge-cases#mode = MIXIN       | edge cases are mixed in
    edge-cases#total = 20         | # of all combined edge cases
    edge-cases#tried = 20         | # of edge cases tried in current run
    seed = -6104831610984117893   | random seed to reproduce generated values



InventarioPropiedadesTest > retirarPreservaStockNoNegativo PASSED

BUILD SUCCESSFUL in 3s
3 actionable tasks: 3 executed
```

**Explicación por partes.**
- `Inventario.java`, línea 3: un record anidado guarda las dos partes del resultado; sus campos no cambian después de crearlo.
- `Inventario.java`, línea 6: la versión con defecto pregunta \(s > 0\) («hay stock»); la especificación pide \(k \le s\) («alcanza»).
- `ParaTodo.java`, línea 4: \(a \to s' \ge 0\) escrita como \(\neg a \lor s' \ge 0\).
- `ParaTodo.java`, línea 5: \(a \leftrightarrow c\) escrita como `==` entre dos `boolean`.
- `ParaTodo.java`, líneas 21–22: `allMatch` es \(\forall\) y `anyMatch` es \(\exists\). Una es la negación de la otra: si no todos cumplen, existe uno que no.
- `build.gradle.kts`: jqwik 1.9.2 corre sobre la plataforma de JUnit 5 (de ahí el BOM 5.13.4). `showStandardStreams` muestra el informe de jqwik y `-parameters` hace que el informe nombre `stock` y `cantidad` en vez de `arg0` y `arg1`.
- Prueba, líneas 10–13: `@Property` reemplaza a `@Test`; cada `@ForAll` describe el dominio de un parámetro y `@IntRange` deja la precondición dentro del dominio.
- En la salida con defecto, `tries = 5`: bastaron 5 intentos. `Original Sample` es el primer caso que falló y `Shrunk Sample`, el mismo fallo reducido.
- En la salida corregida, `tries = 1000`: jqwik generó mil parejas, incluidos 20 casos extremos (`edge-cases`) como 0 y `Integer.MAX_VALUE`. La línea `INFO: After Failure Handling: SAMPLE_FIRST` dice que primero repitió el caso que había fallado antes: jqwik lo guarda en el archivo `.jqwik-database` del proyecto.

> **Error común.** Olvidar la dependencia de jqwik en `build.gradle.kts`. La compilación de las pruebas se detiene con
> `error: package net.jqwik.api does not exist`. Agrega `testImplementation("net.jqwik:jqwik:1.9.2")` y vuelve a ejecutar.

> **Prevenir errores.** Imprime siempre cuántos casos revisaste, como la línea 20 de `ParaTodo.java`. Si ves
> `casos revisados: 0`, sabes que `allMatch` dio `true` sobre una lista vacía y la comprobación no vale nada.

#### Checkpoint 1.1
La regla es «si un envío está entregado, entonces tiene firma». Un envío está pendiente y no tiene firma. ¿Ese envío
rompe la regla?

Respuesta: no. El antecedente «está entregado» es falso, y una implicación con antecedente falso es verdadera. La regla
solo se rompe con un envío entregado sin firma.

#### Checkpoint 1.2
Escribe la negación de «todo retiro aceptado deja stock mayor o igual que 0».

Respuesta: «existe un retiro aceptado que deja stock menor que 0». La negación de \(\forall\) es \(\exists\) con la
propiedad negada, y \(\neg(a \to s' \ge 0) \equiv a \land s' < 0\). El caso `stock=1, cantidad=2` es un ejemplo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara las carpetas
Crea `~/labs/discretas/logica` para los programas sueltos y `~/labs/discretas/propiedades` para el proyecto Gradle con
jqwik, con `src/main/java` y `src/test/java`, como en el Módulo 4.

#### Paso 2 · Genera tablas de verdad
Entra en `logica`, escribe `TablaVerdad.java` y ejecútalo. La salida debe coincidir con la del Problema resuelto 1.1.
Agrega una columna para \(p \leftrightarrow q\) (`p == q`) y comprueba que solo es `true` en las filas `true true` y
`false false`.

#### Paso 3 · Encuentra el contraejemplo y corrige
Escribe `Inventario.java` con el defecto y `ParaTodo.java` en `logica`, y el proyecto `propiedades` con su prueba.
Ejecuta `java ParaTodo.java` y `gradle test`, y confirma el contraejemplo `stock=1, cantidad=2`. Corrige la línea 6 en
las dos copias de `Inventario.java` y ejecútalos otra vez hasta ver los dos resultados de éxito.

#### Paso 4 · Especifica `transition()`
Los envíos de RutaFlow cambian de estado con `transition`. Su especificación en texto plano es esta:

```text
Pre: current es un ShipmentStatus válido; requested es un ShipmentStatus válido
Transición: si requested ∈ ALLOWED_TRANSITIONS[current], devuelve requested; si no, lanza IllegalArgumentException
Post: transition(current, requested) == requested implica requested ∈ ALLOWED_TRANSITIONS[current]
Invariante: ningún envío llega a DELIVERED sin haber pasado por ASSIGNED y OUT_FOR_DELIVERY en orden
```

Escribe `ShipmentStatus.java`, que usarás también en los Temas 2 y 3. Un `enum` de Java es una clase con un número
fijo de valores; cada uno guarda aquí su texto en minúsculas:

```java
// ShipmentStatus.java — estados de un envío de RutaFlow y transiciones permitidas
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

enum ShipmentStatus {
    CREATED("created"),
    ASSIGNED("assigned"),
    OUT_FOR_DELIVERY("out_for_delivery"),
    DELIVERED("delivered");

    final String valor;

    ShipmentStatus(String valor) {
        this.valor = valor;
    }

    static final Map<ShipmentStatus, Set<ShipmentStatus>> ALLOWED_TRANSITIONS = Map.of(
            CREATED, EnumSet.of(ASSIGNED),
            ASSIGNED, EnumSet.of(OUT_FOR_DELIVERY),
            OUT_FOR_DELIVERY, EnumSet.of(DELIVERED),
            DELIVERED, EnumSet.noneOf(ShipmentStatus.class));

    static ShipmentStatus transition(ShipmentStatus current, ShipmentStatus requested) {
        if (!ALLOWED_TRANSITIONS.get(current).contains(requested)) {
            throw new IllegalArgumentException(
                    "invalid shipment transition: " + current.valor + " -> " + requested.valor);
        }
        return requested;
    }
}
```

Con solo 4 estados hay \(4 \cdot 4 = 16\) pares (actual, pedido). Son pocos: puedes comprobar la postcondición en
**todos**, como un \(\forall\) exacto y no una muestra. Escribe `Transiciones.java`:

```java
// Transiciones.java — verifica la postcondición de transition() en los 16 pares posibles
void main() {
    List<ShipmentStatus[]> aceptadas = new ArrayList<>();
    int rechazadas = 0;
    for (ShipmentStatus actual : ShipmentStatus.values()) {
        for (ShipmentStatus pedido : ShipmentStatus.values()) {
            try {
                ShipmentStatus.transition(actual, pedido);
                aceptadas.add(new ShipmentStatus[] {actual, pedido});
            } catch (IllegalArgumentException error) {
                rechazadas++;
            }
        }
    }
    // Post: aceptada → pedido ∈ ALLOWED_TRANSITIONS[actual]
    boolean post = aceptadas.stream().allMatch(par -> ShipmentStatus.ALLOWED_TRANSITIONS.get(par[0]).contains(par[1]));
    IO.println("pares revisados: " + (aceptadas.size() + rechazadas));
    IO.println("aceptadas: " + aceptadas.stream().map(par -> "(" + par[0].valor + ", " + par[1].valor + ")").toList());
    IO.println("rechazadas: " + rechazadas);
    IO.println("postcondición para todo par: " + post);
    try {
        ShipmentStatus.transition(ShipmentStatus.CREATED, ShipmentStatus.DELIVERED);
    } catch (IllegalArgumentException error) {
        IO.println("ejemplo de rechazo: " + error.getMessage());
    }
}
```

```text
$ java Transiciones.java
pares revisados: 16
aceptadas: [(created, assigned), (assigned, out_for_delivery), (out_for_delivery, delivered)]
rechazadas: 13
postcondición para todo par: true
ejemplo de rechazo: invalid shipment transition: created -> delivered
```

Las líneas 5–14 recorren los 16 pares; la 16 evalúa la implicación «aceptada → permitida» sobre los aceptados.
`ShipmentStatus.values()` devuelve los estados en el orden en que se declararon. El invariante de la última línea de
la especificación se demuestra en el Tema 3, recorriendo los caminos del grafo.

#### Resumen
- Una **proposición** es verdadera o falsa; los **conectivos lógicos** `!`, `&&`, `||` forman proposiciones compuestas.
- Una **tabla de verdad** revisa las \(2^n\) combinaciones; dos fórmulas son **lógicamente equivalentes** si coinciden en todas.
- La **implicación** \(p \to q\) solo es falsa con \(p\) verdadera y \(q\) falsa; no equivale a su recíproca.
- Los **cuantificadores** \(\forall\) y \(\exists\) se evalúan con `allMatch` y `anyMatch` en dominios finitos.
- Un **contraejemplo** refuta un \(\forall\); no encontrarlo no demuestra nada.
- Un **invariante** se conserva antes y después de cada operación; la especificación es precondición → postcondición.
- La **prueba basada en propiedades** (jqwik) busca contraejemplos en dominios enormes y los reduce al caso mínimo.

#### Ejercicio verificable 1
Básico. Agrega a `TablaVerdad.java` una columna con \(\neg p \lor q\) y compárala con la columna `p→q`. Antes de
ejecutar, predice los cuatro valores.

Respuesta esperada: `true`, `false`, `true`, `true`, en el orden de las filas del programa. Es idéntica a `p→q` porque
\(p \to q \equiv \neg p \lor q\).

#### Ejercicio verificable 2
Intermedio. La regla es «un envío urgente se despacha antes de las 10 o se cancela». Escríbela con \(u\) (urgente),
\(d\) (despachado antes de las 10) y \(c\) (cancelado). Escribe su negación y compruébala con una tabla de 8 filas.

Respuesta esperada: la regla es \(u \to (d \lor c)\). Su negación es \(u \land \neg d \land \neg c\): un envío urgente
que ni se despachó a tiempo ni se canceló. Con tres `for` anidados sobre `{true, false}`, la comparación
`!implica(u, d || c) == (u && !d && !c)` da `true` en las 8 filas.

#### Ejercicio verificable 3
Reto. Agrega a `InventarioPropiedadesTest.java` una segunda prueba con dos propiedades: «si se acepta, stock nuevo más cantidad
es el stock anterior» y «si se rechaza, el stock no cambia». Ejecútala con la versión con defecto. ¿Encuentra el fallo?

Respuesta esperada: las aserciones son `assertTrue(!r.aceptado() || r.stock() + cantidad == stock)` y
`assertTrue(r.aceptado() || r.stock() == stock)`. Con la versión con defecto, la prueba **pasa**: las dos propiedades se
cumplen aunque el stock quede negativo. La lección: cada propiedad vigila una parte de la regla; ninguna sola basta.

#### En el trabajo
En un equipo, la especificación aparece como criterios de aceptación de un ticket. Escritos como implicaciones («si
el pago se rechaza, el pedido queda pendiente»), se convierten en pruebas sin discusión. Las pruebas basadas en
propiedades son comunes en sistemas de pagos, inventarios y lectores de formatos. Los invariantes también viven en la
base de datos, como la restricción `CHECK (stock >= 0)` del Módulo 4.

</details>

### Tema 2: Conjuntos, relaciones, funciones e inducción · Avanzado · 75 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- operar con conjuntos (pertenencia, subconjunto, unión, intersección, diferencia y producto cartesiano) en símbolos y en Java;
- decidir si una relación es reflexiva, simétrica, antisimétrica o transitiva, y si es un orden parcial o una equivalencia;
- reconocer cuándo una relación es una función matemática;
- demostrar por inducción una propiedad de un algoritmo recursivo y escribir sus supuestos.

**Conceptos clave:** subconjunto, operaciones de conjuntos, producto cartesiano, relación, propiedades de una relación, orden parcial, relación de equivalencia, función matemática, inducción matemática

#### El problema
En RutaFlow aparecen tres discusiones a la vez. Permisos decide «a ojo» si un rol puede hacer una tarea. Un ticket
dice que `ALLOWED_TRANSITIONS` «es un orden» y otro, que «es como una equivalencia». Y la función recursiva `suma`
pasó cinco pruebas: ¿funciona para **toda** lista? Necesitas un lenguaje para decidir las tres cosas con certeza.

El **conjunto** (`Set`) de Java tiene su ficha en el Módulo 2, Tema 1; **recursión** y **caso base**, en el Módulo 2,
Tema 4. Aquí se usa la notación matemática de los conjuntos, que se explica en «Cómo funciona».

#### Glosario del tema

**subconjunto**
- **Definición técnica:** \(A \subseteq B\) si todo elemento de \(A\) también pertenece a \(B\): \(\forall x: x \in A \to x \in B\). En Java, `B.containsAll(A)`.
- **En palabras sencillas:** \(A\) cabe completo dentro de \(B\); no le sobra nada por fuera.
- **Dónde se rompe la comparación:** todo conjunto es subconjunto de sí mismo, y el conjunto vacío \(\varnothing\) es subconjunto de cualquiera.
- **Ejemplo:** `Set.of("leer", "editar", "exportar").containsAll(Set.of("leer", "editar"))` da `true`.
- **Error típico:** confundir \(\subseteq\) con el subconjunto propio (que exige además \(A \ne B\)) y negar permiso a quien tiene exactamente los requeridos.

**operaciones de conjuntos (∪, ∩, −)**
- **Definición técnica:** la unión \(A \cup B\) reúne los elementos que están en \(A\) o en \(B\); la intersección \(A \cap B\), los que están en ambos; la diferencia \(A - B\), los de \(A\) que no están en \(B\). En Java se calculan sobre una copia: `addAll`, `retainAll` y `removeAll`, que modifican el conjunto sobre el que se llaman.
- **En palabras sencillas:** juntar todo, quedarte con lo común y ver lo que sobra.
- **Dónde se rompe la comparación:** la diferencia no es simétrica: \(A - B\) y \(B - A\) casi nunca coinciden.
- **Ejemplo:** una copia de `{leer, editar}` con `removeAll(Set.of("leer"))` queda en `[editar]`: el permiso que le falta al auditor.
- **Error típico:** llamar `removeAll` directamente sobre un conjunto creado con `Set.of(...)`. Es inmutable y falla con `java.lang.UnsupportedOperationException`. Copia primero: `new TreeSet<>(a)`.

**producto cartesiano**
- **Definición técnica:** \(A \times B = \{(a, b) : a \in A,\ b \in B\}\), el conjunto de todos los pares ordenados con primer elemento en \(A\) y segundo en \(B\). Tiene \(\lvert A \rvert \cdot \lvert B \rvert\) elementos.
- **En palabras sencillas:** todas las combinaciones de «una cosa de cada lista», como las casillas de una tabla de filas por columnas.
- **Dónde se rompe la comparación:** en un par el orden importa: \((a, b)\) y \((b, a)\) son pares distintos.
- **Ejemplo:** 2 roles × 3 acciones dan \(2 \cdot 3 = 6\) pares; dos `for` anidados los generan.
- **Error típico:** confundirlo con la unión: \(\{1, 2\} \cup \{3\}\) tiene 3 elementos, pero \(\{1, 2\} \times \{3\}\) tiene 2 pares.

**relación**
- **Definición técnica:** una relación binaria \(R\) sobre un conjunto \(S\) es un subconjunto de \(S \times S\). Se escribe \(a \mathrel{R} b\) cuando \((a, b) \in R\).
- **En palabras sencillas:** una lista de parejas «conectadas» según alguna regla.
- **Dónde se rompe la comparación:** la relación no dice por qué dos elementos se conectan; solo registra que lo están.
- **Ejemplo:** las transiciones de RutaFlow forman \(R\) con 3 pares de los 16 posibles, como `("created", "assigned")`.
- **Error típico:** olvidar la dirección: \((\text{created}, \text{assigned}) \in R\) no implica \((\text{assigned}, \text{created}) \in R\).

**propiedades de una relación**
- **Definición técnica:** \(R\) es **reflexiva** si \(\forall a: a \mathrel{R} a\); **simétrica** si \(a \mathrel{R} b \to b \mathrel{R} a\); **antisimétrica** si \((a \mathrel{R} b \land b \mathrel{R} a) \to a = b\); **transitiva** si \((a \mathrel{R} b \land b \mathrel{R} c) \to a \mathrel{R} c\).
- **En palabras sencillas:** cuatro preguntas: ¿cada uno se conecta consigo mismo? ¿la conexión va en los dos sentidos? ¿nunca hay ida y vuelta entre distintos? ¿se puede encadenar?
- **Dónde se rompe la comparación:** antisimétrica no es «lo contrario» de simétrica. Una relación vacía es las dos cosas a la vez.
- **Ejemplo:** \(R\) es antisimétrica pero no transitiva: hay created → assigned → out_for_delivery, pero no created → out_for_delivery.
- **Error típico:** revisar la transitividad con un solo encadenamiento; hay que revisar todos los pares \((a, b)\), \((b, c)\).

**orden parcial**
- **Definición técnica:** relación reflexiva, antisimétrica y transitiva. Se suele escribir \(a \preceq b\): «\(a\) va antes que \(b\) o es igual».
- **En palabras sencillas:** una forma consistente de decir «esto va antes que aquello», sin vueltas atrás.
- **Dónde se rompe la comparación:** «parcial» significa que puede haber pares que no se comparan. \(\{\text{leer}\}\) y \(\{\text{editar}\}\) no son subconjunto uno del otro.
- **Ejemplo:** «puede llegar a», el cierre de las transiciones de RutaFlow, es un orden parcial.
- **Error típico:** llamar orden a la relación de un solo paso \(R\): sin su cierre no es reflexiva ni transitiva.

**relación de equivalencia**
- **Definición técnica:** relación reflexiva, simétrica y transitiva. Divide el conjunto en **clases de equivalencia**: grupos cuyos elementos se relacionan todos entre sí.
- **En palabras sencillas:** «es del mismo grupo que».
- **Dónde se rompe la comparación:** en una equivalencia todo va en los dos sentidos; un flujo de estados que avanza nunca lo cumple.
- **Ejemplo:** «tiene el mismo estado que» entre envíos; o «da el mismo resto al dividir entre 7» entre números.
- **Error típico:** tratar como equivalencia una relación no transitiva, como «está a menos de 1 km de»: A cerca de B y B cerca de C no implica A cerca de C.

**función matemática**
- **Definición técnica:** relación \(f \subseteq A \times B\) en la que cada \(a \in A\) se relaciona con **exactamente un** \(b \in B\). Se escribe \(f: A \to B\) y \(f(a) = b\).
- **En palabras sencillas:** una máquina que, para cada entrada válida, da una y solo una salida.
- **Dónde se rompe la comparación:** un método de Java puede dar resultados distintos con la misma entrada, por ejemplo si lee la hora; una función matemática, nunca.
- **Ejemplo:** \(R\) no es función de \(S\) en \(S\): `delivered` no tiene sucesor. Sin `delivered` en el dominio, sí lo sería.
- **Error típico:** creer que dos entradas no pueden dar la misma salida. Eso sí se permite; lo prohibido es una entrada con dos salidas.

**inducción matemática**
- **Definición técnica:** método para demostrar \(\forall n \ge 0: P(n)\). Se prueba el **caso base** \(P(0)\) y el **paso inductivo**: para todo \(n\), si \(P(n)\) es verdadera, entonces \(P(n+1)\) también. La suposición \(P(n)\) se llama **hipótesis inductiva**.
- **En palabras sencillas:** una fila de fichas de dominó: si cae la primera y cada una tumba a la siguiente, caen todas.
- **Dónde se rompe la comparación:** la fila de dominó es finita; la inducción cubre infinitos valores de \(n\) sin probarlos uno a uno.
- **Ejemplo:** \(1 + 2 + \dots + n = \frac{n(n+1)}{2}\) para todo \(n \ge 0\).
- **Error típico:** probar solo el paso inductivo y olvidar el caso base. Sin la primera ficha, nada cae.

#### ► CÓMO FUNCIONA
**Notación de conjuntos.** Un conjunto se escribe entre llaves: \(A = \{\text{leer}, \text{editar}\}\). \(x \in A\) se
lee «\(x\) pertenece a \(A\)» y \(x \notin A\), «no pertenece». \(\lvert A \rvert\) es el **cardinal**: cuántos
elementos tiene, como `A.size()`. \(\varnothing\) es el conjunto vacío. Los elementos no se repiten ni tienen orden.

**De conjuntos a relaciones.** Con los estados \(S\) de un envío, \(S \times S\) tiene \(4 \cdot 4 = 16\) pares. Una
relación elige algunos: \(R\) elige 3. Para saber si \(R\) es un orden o una equivalencia, revisas sus cuatro
propiedades con `all`, igual que un \(\forall\) del Tema 1.

**Del paso a la alcanzabilidad.** \(R\) habla de un solo paso. «Puede llegar a, en cero o más pasos» se obtiene con
el **cierre reflexivo y transitivo** \(R^*\): agregas cada par \((a, a)\) y, mientras haya cadenas
\((a, b), (b, c)\) sin su atajo \((a, c)\), lo agregas. Cuando no aparece ningún par nuevo, terminaste.

**Inducción, paso a paso.** El símbolo \(\sum_{i=1}^{n} i\) se lee «suma de \(i\), desde \(i = 1\) hasta \(n\)»:
\(1 + 2 + \dots + n\). La \(i\) es la variable que cambia; el 1 de abajo y la \(n\) de arriba son los límites. Se
quiere demostrar:

\[ P(n):\quad \sum_{i=1}^{n} i = \frac{n(n+1)}{2} \]

- **Caso base** \(n = 0\): la suma no tiene términos y vale 0; la fórmula da \(\frac{0 \cdot 1}{2} = 0\). Coinciden.
- **Hipótesis inductiva:** supones \(P(n)\) verdadera para un \(n\) cualquiera.
- **Paso inductivo:** la suma hasta \(n+1\) es la suma hasta \(n\) más el término \(n+1\). Usas la hipótesis y sacas factor común \((n+1)\):

\[ \sum_{i=1}^{n+1} i = \frac{n(n+1)}{2} + (n+1) = \frac{n(n+1) + 2(n+1)}{2} = \frac{(n+1)(n+2)}{2} \]

El resultado es la fórmula con \(n+1\) en lugar de \(n\): eso es \(P(n+1)\). Caso base más paso dan \(P(n)\) para todo
\(n\). La misma técnica demuestra que un algoritmo recursivo es correcto: el caso base del código es el caso base de la
demostración, y la llamada recursiva es la hipótesis inductiva.

```mermaid
flowchart TD
    R["R = leer, editar"] --> CHECK{"R ⊆ A"}
    A["A = leer, editar, exportar"] --> CHECK
    CHECK -->|"sí"| AUTH["autorizado"]
    CHECK -->|"no: falta un permiso"| DENY["no autorizado"]
    BASE["caso base P(0)"] --> STEP["P(n) implica P(n+1)"] --> ALL["P(n) para todo natural"]
```

#### Problema resuelto 2.1
Una tarea requiere los permisos `leer` y `editar`. Decide con conjuntos si la coordinadora y el auditor pueden hacerla,
qué le falta al auditor y cuántas combinaciones rol-acción existen.

**Razonamiento:**
1. «Puede hacer la tarea» es \(\text{requeridos} \subseteq \text{asignados}\): todo permiso requerido está asignado.
2. «Qué le falta» es la diferencia \(\text{requeridos} - \text{asignados}\).
3. Las combinaciones rol-acción son el producto cartesiano, con dos `for` anidados; su tamaño es \(\lvert \text{roles} \rvert \cdot \lvert \text{acciones} \rvert\).

```java
// Permisos.java — conjuntos para decidir si una persona puede hacer una tarea
Set<String> union(Set<String> a, Set<String> b) {
    Set<String> resultado = new TreeSet<>(a);
    resultado.addAll(b);
    return resultado;
}

Set<String> interseccion(Set<String> a, Set<String> b) {
    Set<String> resultado = new TreeSet<>(a);
    resultado.retainAll(b);
    return resultado;
}

Set<String> diferencia(Set<String> a, Set<String> b) {
    Set<String> resultado = new TreeSet<>(a);
    resultado.removeAll(b);
    return resultado;
}

void main() {
    Set<String> requeridos = Set.of("leer", "editar");
    Set<String> coordinadora = Set.of("leer", "editar", "exportar");
    Set<String> auditor = Set.of("leer");

    IO.println("'exportar' ∈ coordinadora: " + coordinadora.contains("exportar"));
    IO.println("requeridos ⊆ coordinadora: " + coordinadora.containsAll(requeridos));
    IO.println("requeridos ⊆ auditor: " + auditor.containsAll(requeridos));
    IO.println("faltan al auditor (requeridos − auditor): " + diferencia(requeridos, auditor));
    IO.println("coordinadora ∪ auditor: " + union(coordinadora, auditor));
    IO.println("coordinadora ∩ auditor: " + interseccion(coordinadora, auditor));

    List<String> roles = List.of("auditor", "coordinadora");
    List<String> acciones = List.of("editar", "exportar", "leer");
    List<List<String>> pares = new ArrayList<>();
    for (String rol : roles) {
        for (String accion : acciones) {
            pares.add(List.of(rol, accion));
        }
    }
    IO.println("roles × acciones tiene " + pares.size() + " pares; el primero es " + pares.getFirst());
}
```

```text
$ java Permisos.java
'exportar' ∈ coordinadora: true
requeridos ⊆ coordinadora: true
requeridos ⊆ auditor: false
faltan al auditor (requeridos − auditor): [editar]
coordinadora ∪ auditor: [editar, exportar, leer]
coordinadora ∩ auditor: [leer]
roles × acciones tiene 6 pares; el primero es [auditor, editar]
```

**Explicación por partes.**
- Líneas 2–18: unión, intersección y diferencia copian el primer conjunto en un `TreeSet`, que guarda los elementos ordenados, y lo modifican con `addAll`, `retainAll` o `removeAll`.
- Líneas 21–23: `Set.of` crea conjuntos inmutables; el orden en que escribes los elementos no importa.
- Línea 25: `contains` es \(\in\). Línea 26: `containsAll` es \(\subseteq\), leído al revés: «la coordinadora contiene todos los requeridos».
- Líneas 27–28: el auditor no cumple \(\subseteq\), y la diferencia dice exactamente por qué: le falta `editar`.
- Líneas 34–39: los dos `for` generan los \(2 \cdot 3 = 6\) pares; el primero es `[auditor, editar]`.

> **Error común.** Crear el conjunto de permisos con `Set.of("leer")` y luego llamar `permisos.add("editar")`. El
> programa se detiene con `Exception in thread "main" java.lang.UnsupportedOperationException`: `Set.of` no se puede
> modificar. Si el conjunto va a cambiar, créalo con `new HashSet<>()` o `new TreeSet<>()`.

#### Problema resuelto 2.2
Decide si la relación de transiciones \(R\) es un orden parcial o una equivalencia. Haz lo mismo con «puede llegar a»
(\(R^*\)) y responde si \(R\) es una función de \(S\) en \(S\). Usa `ShipmentStatus.java` del Tema 1, Paso 4.

```mermaid
flowchart LR
    C["created"] -->|R| A["assigned"] -->|R| O["out_for_delivery"] -->|R| D["delivered"]
    C -. "R*: atajo agregado" .-> O
```

**Razonamiento:**
1. \(S\) son los 4 estados y \(R\), los pares de `ALLOWED_TRANSITIONS`.
2. Cada propiedad es un \(\forall\) sobre pares; se escribe con `allMatch`.
3. El cierre agrega pares hasta que no aparezca ninguno nuevo; luego se revisan sus propiedades.
4. Para ser función, cada estado debe tener exactamente un sucesor.

```java
// Relacion.java — propiedades de la relación de transiciones de RutaFlow
record Par(String a, String b) {}

final List<String> S = Arrays.stream(ShipmentStatus.values()).map(e -> e.valor).toList();

Map<String, Boolean> propiedades(Set<Par> rel) {
    Map<String, Boolean> p = new LinkedHashMap<>();
    p.put("reflexiva", S.stream().allMatch(a -> rel.contains(new Par(a, a))));
    p.put("simétrica", rel.stream().allMatch(x -> rel.contains(new Par(x.b(), x.a()))));
    p.put("antisimétrica", rel.stream().filter(x -> !x.a().equals(x.b()))
            .allMatch(x -> !rel.contains(new Par(x.b(), x.a()))));
    p.put("transitiva", rel.stream().allMatch(x -> rel.stream()
            .filter(y -> x.b().equals(y.a()))
            .allMatch(y -> rel.contains(new Par(x.a(), y.b())))));
    return p;
}

Set<Par> cierreReflexivoTransitivo(Set<Par> rel) {
    Set<Par> cierre = new HashSet<>(rel);
    for (String a : S) cierre.add(new Par(a, a));
    while (true) {
        Set<Par> nuevos = new HashSet<>();
        for (Par x : cierre) {
            for (Par y : cierre) {
                if (x.b().equals(y.a())) nuevos.add(new Par(x.a(), y.b()));
            }
        }
        nuevos.removeAll(cierre);
        if (nuevos.isEmpty()) return cierre;
        cierre.addAll(nuevos);
    }
}

void main() {
    Set<Par> R = new HashSet<>();
    ShipmentStatus.ALLOWED_TRANSITIONS.forEach((a, destinos) -> destinos.forEach(b -> R.add(new Par(a.valor, b.valor))));

    IO.println("R tiene " + R.size() + " pares de " + S.size() * S.size() + " posibles en S × S");
    IO.println("R: " + propiedades(R));
    Set<Par> alcanza = cierreReflexivoTransitivo(R);
    IO.println("«puede llegar a» tiene " + alcanza.size() + " pares");
    Map<String, Boolean> p = propiedades(alcanza);
    IO.println("«puede llegar a»: " + p);
    IO.println("¿orden parcial? " + (p.get("reflexiva") && p.get("antisimétrica") && p.get("transitiva")));
    IO.println("¿equivalencia? " + (p.get("reflexiva") && p.get("simétrica") && p.get("transitiva")));
    IO.println("¿R es función de S en S? " + S.stream()
            .allMatch(a -> R.stream().filter(x -> x.a().equals(a)).count() == 1));
}
```

```text
$ java Relacion.java
R tiene 3 pares de 16 posibles en S × S
R: {reflexiva=false, simétrica=false, antisimétrica=true, transitiva=false}
«puede llegar a» tiene 10 pares
«puede llegar a»: {reflexiva=true, simétrica=false, antisimétrica=true, transitiva=true}
¿orden parcial? true
¿equivalencia? false
¿R es función de S en S? false
```

**Explicación por partes.**
- Línea 2: un record `Par` es un par ordenado \((a, b)\); dos pares con los mismos campos son iguales, así que funcionan dentro de un `Set`.
- Línea 4: `S` son los textos de los cuatro estados, en el orden del enum.
- Líneas 8–14: cada propiedad del glosario, escrita con `allMatch`. La implicación de la antisimetría vive en el `filter` de la línea 10.
- Línea 20: agrega los pares reflexivos \((a, a)\).
- Líneas 21–30: `nuevos` son los atajos \((a, d)\) que faltan. Cuando queda vacío, el cierre está completo.
- Línea 36: `forEach` recorre el mapa de transiciones y convierte cada flecha en un `Par` con el texto de cada estado.
- Salida: \(R\) solo es antisimétrica; \(R^*\) tiene 10 pares (4 reflexivos, 3 de un paso, 2 de dos pasos y 1 de tres) y es un orden parcial.
- Líneas 46–47: cuenta los sucesores de cada estado; `delivered` tiene 0, así que \(R\) no es función.

> **Error común.** Revisar la transitividad solo con `R` y concluir «no es un orden». El ticket hablaba de «poder
> llegar», que es \(R^*\). Antes de afirmar una propiedad, escribe sobre qué relación exacta la afirmas.

> **Buena práctica.** Cuando un ticket diga «esto es un orden» o «esto es equivalente», pídele la relación exacta y
> compruébala con las cuatro propiedades. Una discusión de media hora se vuelve una ejecución de un segundo.

#### Problema resuelto 2.3
Demuestra por inducción que la función recursiva `suma` devuelve la suma de los elementos de cualquier lista de
enteros. Escribe los supuestos y compara la demostración con comprobar casos.

**Razonamiento:**
1. \(P(k)\): «para toda lista de longitud \(k\), `suma` devuelve la suma de sus elementos».
2. Caso base \(k = 0\): la lista vacía; las líneas 3–5 devuelven 0, que es la suma de ningún número.
3. Paso inductivo: una lista de longitud \(k + 1\) tiene un primer elemento y un resto `valores.subList(1, size)` de
   longitud \(k\). Por la hipótesis inductiva, la suma del resto es correcta; la línea 6 le suma el primero. Resultado correcto.
4. Supuestos: los elementos son enteros, la suma cabe en un `long`, y la lista no es enorme, porque cada llamada ocupa
   un lugar en la pila de Java.
5. Comprobar 501 casos da evidencia; la inducción cubre todos.

```java
// Induccion.java — comprueba casos de dos propiedades que se demuestran por inducción
long suma(List<Integer> valores) {
    if (valores.isEmpty()) {             // caso base
        return 0;
    }
    return valores.getFirst() + suma(valores.subList(1, valores.size()));
}

long gauss(long n) {
    return n * (n + 1) / 2;
}

List<Integer> deUnoA(int n) {
    return IntStream.rangeClosed(1, n).boxed().toList();
}

void main() {
    for (int n = 0; n <= 5; n++) {
        List<Integer> lista = deUnoA(n);
        long conStream = lista.stream().mapToLong(Integer::longValue).sum();
        IO.println(String.format("n=%d  suma=%2d  gauss=%2d  stream=%2d", n, suma(lista), gauss(n), conStream));
    }
    boolean coinciden = IntStream.rangeClosed(0, 500).allMatch(n -> suma(deUnoA(n)) == gauss(n));
    IO.println("¿coinciden para n de 0 a 500? " + coinciden);
}
```

```text
$ java Induccion.java
n=0  suma= 0  gauss= 0  stream= 0
n=1  suma= 1  gauss= 1  stream= 1
n=2  suma= 3  gauss= 3  stream= 3
n=3  suma= 6  gauss= 6  stream= 6
n=4  suma=10  gauss=10  stream=10
n=5  suma=15  gauss=15  stream=15
¿coinciden para n de 0 a 500? true
```

**Explicación por partes.**
- Líneas 3–5: el caso base del código es el caso base de la demostración.
- Línea 6: `subList(1, size)` es la lista sin su primer elemento; la llamada recursiva es la hipótesis inductiva en acción.
- Líneas 9–11: `gauss` aplica \(\frac{n(n+1)}{2}\); `/` entre `long` es división entera y aquí es exacta, porque \(n(n+1)\) siempre es par.
- Líneas 13–15: `deUnoA(n)` construye la lista `[1, 2, …, n]` con un `IntStream`.
- Líneas 18–22: para \(n\) de 0 a 5, la recursión, la fórmula y la suma con streams coinciden.
- Líneas 23–24: 501 casos coinciden. Es evidencia, no demostración: la demostración es la del razonamiento.

> **Error común.** Olvidar el supuesto de tamaño. Con una lista de 5000 enteros, `suma` responde bien (`12497500`);
> con una de 100 000 termina con `java.lang.StackOverflowError`. La demostración es correcta para enteros matemáticos;
> el programa real tiene una pila de tamaño fijo. Por eso los supuestos se escriben junto a la demostración.

> **Ingeniería de software.** `subList` no copia: devuelve una vista sobre la lista original, así que esta `suma` es
> \(O(n)\) en tiempo. Si la escribieras copiando el resto en cada llamada (`new ArrayList<>(...)`), serían \(O(n^2)\)
> copias (Módulo 2, Tema 4), y la demostración seguiría siendo la misma: prueba que el resultado es correcto, no que
> sea eficiente; son preguntas distintas.

#### Checkpoint 2.1
Entre los envíos de un día, la relación «tiene el mismo estado que». ¿Es un orden parcial o una equivalencia?

Respuesta: una equivalencia. Es reflexiva (cada envío tiene su mismo estado), simétrica y transitiva. No es
antisimétrica: dos envíos distintos pendientes se relacionan en los dos sentidos. Sus clases son los cuatro estados.

#### Checkpoint 2.2
¿Cuál es la diferencia entre probar muchos casos y demostrar una propiedad?

Respuesta: probar casos revisa una cantidad finita, como los 501 de `Induccion.java`; un caso no revisado puede fallar.
Una demostración, como la inducción, justifica la propiedad para **todo** \(n\) a partir del caso base y el paso.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/discretas/conjuntos`, entra y copia ahí `ShipmentStatus.java` del Tema 1. Escribe `Permisos.java` y
comprueba que la salida coincide con la del Problema resuelto 2.1.

#### Paso 2 · Clasifica la relación
Escribe `Relacion.java` y ejecútalo. Dibuja en papel los 4 estados y las 3 flechas de \(R\). Luego agrega, en otro
color, los 7 pares que el cierre suma, y cuenta: deben ser 10 en total.

#### Paso 3 · Demuestra y comprueba
Escribe `Induccion.java` y ejecútalo. En un archivo `demostracion.txt`, escribe con tus palabras el caso base, la
hipótesis inductiva y el paso inductivo de `suma`, y una línea con los supuestos.

#### Paso 4 · Rompe un supuesto
Cambia el `main` de `Induccion.java` para que imprima `suma(IntStream.range(0, 100_000).boxed().toList())`. Confirma que
termina con `java.lang.StackOverflowError` y anótalo en `demostracion.txt` como supuesto comprobado.

#### Resumen
- Un **subconjunto** \(A \subseteq B\) cabe dentro de \(B\); en Java, `B.containsAll(A)`.
- Las **operaciones de conjuntos** \(\cup\), \(\cap\), \(-\) se calculan con `addAll`, `retainAll` y `removeAll` sobre una copia; `Set.of` no se puede modificar.
- El **producto cartesiano** \(A \times B\) tiene \(\lvert A \rvert \cdot \lvert B \rvert\) pares ordenados.
- Una **relación** es un subconjunto de \(S \times S\); sus **propiedades** se revisan con `allMatch`.
- Un **orden parcial** es reflexivo, antisimétrico y transitivo; una **relación de equivalencia**, reflexiva, simétrica y transitiva.
- Una **función matemática** asigna a cada entrada exactamente una salida.
- La **inducción matemática** demuestra \(P(n)\) para todo \(n\) con un caso base y un paso inductivo; los supuestos del programa se escriben aparte.

#### Ejercicio verificable 1
Básico. Con \(A = \{\text{leer}, \text{editar}, \text{exportar}\}\) y \(B = \{\text{leer}, \text{borrar}\}\), calcula a
mano \(A \cup B\), \(A \cap B\), \(A - B\), \(B - A\) y \(\lvert A \times B \rvert\). Comprueba con Java.

Respuesta esperada: \(A \cup B = \{\text{borrar}, \text{editar}, \text{exportar}, \text{leer}\}\);
\(A \cap B = \{\text{leer}\}\); \(A - B = \{\text{editar}, \text{exportar}\}\); \(B - A = \{\text{borrar}\}\);
\(\lvert A \times B \rvert = 3 \cdot 2 = 6\).

#### Ejercicio verificable 2
Intermedio. Sobre \(S = \{0, 1, \dots, 13\}\), define \(a \mathrel{E} b\) si `a % 7 == b % 7`. Adapta `propiedades`
de `Relacion.java` para revisarla. ¿Es equivalencia? ¿Cuántos pares tiene y cuántas clases?

Respuesta esperada: es reflexiva, simétrica y transitiva: una equivalencia. Tiene 28 pares (cada resto agrupa 2
números y da \(2 \cdot 2 = 4\) pares; \(7 \cdot 4 = 28\)) y 7 clases, una por resto: \(\{0, 7\}, \{1, 8\}, \dots, \{6, 13\}\).

#### Ejercicio verificable 3
Reto. Demuestra por inducción que \(\sum_{i=1}^{n} (2i - 1) = n^2\): la suma de los primeros \(n\) impares es \(n^2\).
Comprueba después los casos de 0 a 100 con `allMatch`.

Respuesta esperada: caso base \(n = 0\): \(0 = 0^2\). Paso: suponiendo \(\sum_{i=1}^{n} (2i - 1) = n^2\), se suma el
término \(2(n+1) - 1 = 2n + 1\) y queda \(n^2 + 2n + 1 = (n+1)^2\). La expresión
`IntStream.rangeClosed(0, 100).allMatch(n -> IntStream.rangeClosed(1, n).map(i -> 2 * i - 1).sum() == n * n)` devuelve `true`.

#### En el trabajo
Los sistemas de permisos (RBAC) son conjuntos: un rol es un conjunto de permisos y autorizar es comprobar \(\subseteq\).
Los flujos de estado de pedidos, pagos o tickets son relaciones, y el cierre dice qué estados se pueden alcanzar. Las
demostraciones por inducción aparecen al revisar algoritmos recursivos y migraciones por lotes: «si el lote \(n\) deja
la tabla consistente, el lote \(n + 1\) también».

</details>

### Tema 3: Conteo, grafos y estructuras conectadas · Avanzado · 70 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- contar casos con la regla del producto y la regla de la suma, sin listarlos;
- distinguir permutaciones de combinaciones y calcularlas con fórmulas y comprobarlas generando las listas en Java;
- tratar `ALLOWED_TRANSITIONS` como un grafo dirigido, detectar ciclos y enumerar caminos;
- obtener un orden topológico con el algoritmo de Kahn y leer el ciclo que reporta cuando no existe orden.

**Conceptos clave:** regla del producto, regla de la suma, factorial, permutación, combinación, grafo dirigido, ciclo, grafo acíclico dirigido, orden topológico

#### El problema
RutaFlow quiere tres respuestas. ¿Cuántos números de guía distintos admite el formato `RF-dddd`? ¿Por qué no se
prueban todas las rutas posibles para 20 paradas y se elige la mejor? Y el equipo de arquitectura sospecha que un
cambio creó una dependencia circular entre capas del código. Contar a mano y revisar flechas a ojo no escala.

**Grafo**, **vértice**, **arista**, **lista de adyacencia** y **DFS** tienen su ficha en el Módulo 2, Tema 7;
**relación** y **producto cartesiano**, en el Tema 2 de este módulo. Aquí no se redefinen.

#### Glosario del tema

**regla del producto**
- **Definición técnica:** si una tarea se hace en \(k\) pasos sucesivos con \(n_1, n_2, \dots, n_k\) opciones cada uno, y las opciones de un paso no dependen de lo elegido antes, hay \(n_1 \cdot n_2 \cdots n_k\) maneras de hacerla.
- **En palabras sencillas:** un menú con 3 entradas y 4 platos fuertes da \(3 \cdot 4 = 12\) almuerzos distintos.
- **Dónde se rompe la comparación:** si lo que eliges en un paso cambia las opciones del siguiente (no repetir), multiplicas números distintos: eso lleva a las permutaciones.
- **Ejemplo:** una guía `RF-dddd` tiene 4 dígitos con 10 opciones cada uno: \(10 \cdot 10 \cdot 10 \cdot 10 = 10^4 = 10\,000\).
- **Error típico:** sumar en vez de multiplicar: \(10 + 10 + 10 + 10 = 40\) cuenta dígitos sueltos, no guías.

**regla de la suma**
- **Definición técnica:** si algo se elige de un grupo \(A\) **o** de un grupo \(B\), y los grupos no comparten elementos, hay \(\lvert A \rvert + \lvert B \rvert\) maneras.
- **En palabras sencillas:** tomas un camino u otro; las opciones de cada camino se suman.
- **Dónde se rompe la comparación:** si los grupos se solapan, lo común se cuenta dos veces: \(\lvert A \cup B \rvert = \lvert A \rvert + \lvert B \rvert - \lvert A \cap B \rvert\).
- **Ejemplo:** guías `RF-dddd` o `EX-ddd`: \(10^4 + 10^3 = 11\,000\).
- **Error típico:** sumar grupos que comparten elementos, como «envíos urgentes» y «envíos de Bogotá».

**factorial**
- **Definición técnica:** \(n! = n \cdot (n-1) \cdots 2 \cdot 1\) para \(n \ge 1\), y \(0! = 1\). Se lee «\(n\) factorial».
- **En palabras sencillas:** el número de maneras de poner \(n\) cosas distintas en fila.
- **Dónde se rompe la comparación:** crece más rápido que cualquier potencia fija: \(20!\) ya tiene 19 cifras.
- **Ejemplo:** \(4! = 4 \cdot 3 \cdot 2 \cdot 1 = 24\). Java no trae un método `factorial`; en este tema lo escribes con `BigInteger`.
- **Error típico:** calcularlo con `long`. \(21!\) ya no cabe: el producto se desborda en silencio y da `-4249290049419214848`. Usa `BigInteger`.

**permutación**
- **Definición técnica:** secuencia ordenada de \(k\) elementos distintos tomados de \(n\). Su número es \(P(n, k) = \frac{n!}{(n-k)!}\); con \(k = n\), \(n!\). En este tema: `permutaciones` y `perm` de `Conteo.java`.
- **En palabras sencillas:** cuántas filas distintas puedes armar cuando el orden importa.
- **Dónde se rompe la comparación:** cuenta como distintas «Ana conduce, Beto ayuda» y «Beto conduce, Ana ayuda»; si los papeles no importan, sobra.
- **Ejemplo:** conductor y ayudante entre 6 mensajeros: \(P(6, 2) = 6 \cdot 5 = 30\).
- **Error típico:** usar permutaciones cuando el orden no importa: cada grupo se cuenta \(k!\) veces.

**combinación**
- **Definición técnica:** subconjunto de \(k\) elementos tomados de \(n\), sin orden. Su número es \(C(n, k) = \binom{n}{k} = \frac{n!}{k!\,(n-k)!}\), que se lee «\(n\) en \(k\)». En este tema: `combinaciones` y `comb` de `Conteo.java`.
- **En palabras sencillas:** cuántos grupos distintos puedes formar cuando el orden no importa.
- **Dónde se rompe la comparación:** \(C(n, k) = P(n, k) / k!\): divides entre las \(k!\) maneras de ordenar el mismo grupo.
- **Ejemplo:** parejas de turno entre 6 mensajeros: \(C(6, 2) = \frac{30}{2} = 15\).
- **Error típico:** olvidar el caso \(k > n\). No hay grupos de 5 entre 3, así que `comb(3, 5)` debe dar `0`; con la fórmula de factoriales pedirías \((3-5)!\) y el programa fallaría.

**grafo dirigido**
- **Definición técnica:** grafo cuyas aristas tienen dirección: la arista \((u, v)\) va de \(u\) a \(v\), y no al revés. Es lo mismo que una relación sobre los vértices (Tema 2).
- **En palabras sencillas:** un mapa de calles de una sola vía.
- **Dónde se rompe la comparación:** en un mapa siempre puedes dar la vuelta a la manzana; en un grafo dirigido, a veces no hay camino de regreso.
- **Ejemplo:** `ALLOWED_TRANSITIONS` tiene 4 vértices y 3 aristas: created → assigned → out_for_delivery → delivered.
- **Error típico:** recorrerlo como si no fuera dirigido y «encontrar» caminos que no existen, como delivered → out_for_delivery.

**ciclo**
- **Definición técnica:** camino \(v_0 \to v_1 \to \dots \to v_k\) con \(k \ge 1\) y \(v_k = v_0\): termina donde empezó.
- **En palabras sencillas:** una vuelta que regresa al punto de partida.
- **Dónde se rompe la comparación:** en un grafo de dependencias, la «vuelta» significa que nada puede construirse primero.
- **Ejemplo:** aplicación → infraestructura → dominio → aplicación.
- **Error típico:** detectarlo con un solo conjunto `visitados`. En un rombo (A → B, A → C, B → D, C → D), D se ve dos veces y se reporta un ciclo falso.

**grafo acíclico dirigido (DAG)**
- **Definición técnica:** grafo dirigido sin ciclos. En inglés, *directed acyclic graph*, de ahí la sigla DAG.
- **En palabras sencillas:** un flujo que siempre avanza y nunca vuelve atrás.
- **Dónde se rompe la comparación:** «sin ciclos» no significa «una sola línea»: un DAG puede ramificarse y volver a juntarse, como el rombo.
- **Ejemplo:** las transiciones de RutaFlow y las capas dominio → aplicación → infraestructura son DAG.
- **Error típico:** asumir que un grafo es DAG porque «así se diseñó»; un cambio de una línea puede crear un ciclo.

**orden topológico**
- **Definición técnica:** lista de todos los vértices de un DAG en la que, para cada arista \(u \to v\), \(u\) aparece antes que \(v\). Existe si y solo si el grafo no tiene ciclos. Java no lo trae en la biblioteca estándar; en este tema lo escribes con el algoritmo de Kahn.
- **En palabras sencillas:** un orden de trabajo que respeta todas las dependencias: nada se construye antes de lo que necesita.
- **Dónde se rompe la comparación:** puede haber varios órdenes válidos; la herramienta devuelve uno.
- **Ejemplo:** `[dominio, aplicación, infraestructura, pruebas]`.
- **Error típico:** pedir el orden de un grafo con ciclo y no enterarse: el `ordenTopologico` de este tema lanza `IllegalStateException` y muestra el ciclo.

#### ► CÓMO FUNCIONA
**Contar sin listar.** Primero preguntas: ¿la tarea se hace por pasos (multiplica) o por caminos alternativos (suma)?
Después: ¿importa el orden? ¿se puede repetir? Estas dos preguntas eligen la fórmula.

| ¿Importa el orden? | ¿Se repite? | Fórmula | Ejemplo |
|---|---|---|---|
| Sí | Sí | \(n^k\) | guías de 4 dígitos: \(10^4\) |
| Sí | No | \(P(n, k) = \frac{n!}{(n-k)!}\) | conductor y ayudante: \(P(6, 2) = 30\) |
| No | No | \(C(n, k) = \frac{n!}{k!\,(n-k)!}\) | parejas de turno: \(C(6, 2) = 15\) |

Para ordenar \(n\) paradas hay \(n!\) rutas. Con 20 paradas son más de \(2 \times 10^{18}\): aunque revisaras mil
millones por segundo, tardarías más de 70 años. Por eso RutaFlow usa una heurística como el vecino más cercano.

**Detectar ciclos con DFS.** `tieneCiclo` recorre el grafo en profundidad y marca cada vértice en uno de tres estados:

1. **No visitado:** todavía no lo tocas.
2. **Activo:** estás dentro de él; su recorrido no ha terminado. Está en el conjunto `activos`.
3. **Terminado:** ya revisaste todo lo que alcanza. Está en `visitados`.

Si desde un vértice activo llegas a otro vértice **activo**, encontraste una arista que regresa al camino actual: un
ciclo. Llegar a un vértice **terminado** no es ciclo: solo es otro camino hacia algo ya revisado, como D en el rombo.

**Orden topológico.** Si no hay ciclos, siempre existe un vértice sin dependencias pendientes. Lo sacas, lo pones en la
lista y repites. Si en algún momento todos los que quedan esperan a otro, hay un ciclo. Este procedimiento se llama
**algoritmo de Kahn**.

```mermaid
flowchart LR
    DOMAIN["dominio"] --> APP["aplicación"] --> INFRA["infraestructura"]
    DOMAIN --> TESTS["pruebas"]
    APP --> TESTS
    A["A"] --> B["B"] --> C["C"] --> A
```

#### Problema resuelto 3.1
Cuenta los números de guía posibles, las rutas de 4 paradas, las parejas y los equipos ordenados de mensajeros.
Compara la fórmula con la lista completa que generan los métodos del programa, y mira cómo crece \(n!\).

**Razonamiento:**
1. Guía: 4 pasos con 10 opciones, el orden importa y se repite: \(10^4\). Agregar el formato `EX-ddd` es regla de la suma.
2. Rutas: ordenar 4 paradas distintas es \(4!\).
3. Parejas sin papel: \(C(6, 2)\). Conductor y ayudante: \(P(6, 2)\).
4. Listar solo sirve para comprobar números pequeños; para 20 paradas solo se puede calcular.

```java
// Conteo.java — contar sin listar y comprobar listando
import java.math.BigInteger;

BigInteger factorial(int n) {
    if (n < 0) throw new IllegalArgumentException("factorial no definido para negativos: " + n);
    BigInteger r = BigInteger.ONE;
    for (int i = 2; i <= n; i++) r = r.multiply(BigInteger.valueOf(i));
    return r;
}

long perm(int n, int k) {
    if (k > n) return 0;
    long r = 1;
    for (int i = 0; i < k; i++) r *= n - i;
    return r;
}

long comb(int n, int k) {
    return perm(n, k) / perm(k, k);
}

List<String> producto(List<String> simbolos, int k) {
    if (k == 0) return List.of("");
    List<String> r = new ArrayList<>();
    for (String s : simbolos) for (String resto : producto(simbolos, k - 1)) r.add(s + resto);
    return r;
}

List<List<String>> permutaciones(List<String> xs, int k) {
    if (k == 0) return List.of(List.of());
    List<List<String>> r = new ArrayList<>();
    for (String x : xs) {
        List<String> resto = new ArrayList<>(xs);
        resto.remove(x);
        for (List<String> p : permutaciones(resto, k - 1)) {
            List<String> fila = new ArrayList<>(List.of(x));
            fila.addAll(p);
            r.add(fila);
        }
    }
    return r;
}

List<List<String>> combinaciones(List<String> xs, int k) {
    if (k == 0) return List.of(List.of());
    if (xs.size() < k) return List.of();
    List<List<String>> r = new ArrayList<>();
    for (List<String> c : combinaciones(xs.subList(1, xs.size()), k - 1)) {
        List<String> grupo = new ArrayList<>(List.of(xs.getFirst()));
        grupo.addAll(c);
        r.add(grupo);
    }
    r.addAll(combinaciones(xs.subList(1, xs.size()), k));
    return r;
}

void main() {
    List<String> digitos = List.of("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
    IO.println("guías RF-dddd: " + producto(digitos, 4).size() + " = " + (int) Math.pow(10, 4));
    IO.println("guías RF- o EX-ddd: " + (10_000 + 1_000));

    List<String> paradas = List.of("A", "B", "C", "D");
    List<List<String>> ordenes = permutaciones(paradas, 4);
    IO.println("órdenes de 4 paradas: " + ordenes.size() + " = 4! = " + factorial(4));
    IO.println("los tres primeros: " + ordenes.subList(0, 3).stream().map(o -> String.join("", o)).toList());

    List<String> mensajeros = List.of("Ana", "Beto", "Caro", "Dani", "Eva", "Fede");
    IO.println("parejas de 6 mensajeros: " + combinaciones(mensajeros, 2).size() + " = C(6,2) = " + comb(6, 2));
    IO.println("conductor y ayudante: " + permutaciones(mensajeros, 2).size() + " = P(6,2) = " + perm(6, 2));

    for (int n : new int[] {5, 10, 15, 20}) {
        IO.println(String.format(Locale.ROOT, "%d paradas → %,d órdenes posibles", n, factorial(n)));
    }
}
```

```text
$ java Conteo.java
guías RF-dddd: 10000 = 10000
guías RF- o EX-ddd: 11000
órdenes de 4 paradas: 24 = 4! = 24
los tres primeros: [ABCD, ABDC, ACBD]
parejas de 6 mensajeros: 15 = C(6,2) = 15
conductor y ayudante: 30 = P(6,2) = 30
5 paradas → 120 órdenes posibles
10 paradas → 3,628,800 órdenes posibles
15 paradas → 1,307,674,368,000 órdenes posibles
20 paradas → 2,432,902,008,176,640,000 órdenes posibles
```

**Explicación por partes.**
- Líneas 4–9: `factorial` valida \(n \ge 0\) y multiplica con `BigInteger`, que no se desborda.
- Líneas 11–20: `perm` multiplica \(n (n-1) \cdots (n-k+1)\) sin calcular factoriales; `comb` divide entre \(k! = P(k, k)\).
- Líneas 22–27: `producto` es la regla del producto escrita como recursión: cada símbolo seguido de cada lista de \(k-1\) símbolos.
- Líneas 29–42: `permutaciones` elige el primero y permuta el resto sin él. Líneas 44–55: `combinaciones` decide si el primero entra o no al grupo.
- Línea 59: las 10 000 guías salen de la lista; la regla del producto lo predice. Línea 60: regla de la suma, porque los dos formatos no comparten guías.
- Líneas 63–65: 24 filas; `ABCD` y `ABDC` difieren solo en el orden de las dos últimas.
- Líneas 68–69: las 30 permutaciones de 2 son exactamente el doble de las 15 combinaciones: \(C(6, 2) = P(6, 2) / 2!\).
- Líneas 71–73: `%,d` separa los miles; `Locale.ROOT` fija la coma para que la salida no cambie con el idioma del sistema. De 10 a 20 paradas, las rutas pasan de 3 millones a 2 trillones.

> **Error común.** Pasar a `factorial` un número calculado que resultó negativo, por ejemplo `factorial(paradas - 5)`
> con 3 paradas. El programa se detiene con
> `java.lang.IllegalArgumentException: factorial no definido para negativos: -2`. Sin la validación de la línea 5, el
> `for` no haría ninguna vuelta y devolvería 1 en silencio, que es peor. Valida la precondición \(n \ge 0\).

#### Problema resuelto 3.2
Comprueba que `ALLOWED_TRANSITIONS` es un DAG y demuestra el invariante del Tema 1: «ningún envío llega a delivered sin
pasar por assigned y out_for_delivery». Después detecta el ciclo que crea un cambio en las capas del código y obtén el
orden de construcción.

**Razonamiento:**
1. Convierte el mapa de estados en una lista de adyacencia con texto: \(\{\text{estado}: \{\text{destinos}\}\}\).
2. `tieneCiclo` (DFS con `activos` y `visitados`) responde si es DAG.
3. En un DAG finito, los caminos entre dos vértices son finitos: puedes listarlos todos. Si todos pasan por assigned y out_for_delivery, el invariante está demostrado.
4. Para las capas, la flecha \(u \to v\) significa «\(v\) depende de \(u\)»: \(u\) se construye antes.

```java
// Grafo.java — ciclos y caminos en grafos dirigidos
boolean tieneCiclo(Map<String, Set<String>> grafo) {
    Set<String> visitados = new HashSet<>(), activos = new HashSet<>();
    for (String n : grafo.keySet()) if (visitar(grafo, n, visitados, activos)) return true;
    return false;
}

boolean visitar(Map<String, Set<String>> grafo, String nodo, Set<String> visitados, Set<String> activos) {
    if (activos.contains(nodo)) return true;
    if (visitados.contains(nodo)) return false;
    activos.add(nodo);
    for (String vecino : grafo.getOrDefault(nodo, Set.of())) {
        if (visitar(grafo, vecino, visitados, activos)) return true;
    }
    activos.remove(nodo);
    visitados.add(nodo);
    return false;
}

List<List<String>> caminos(Map<String, Set<String>> grafo, String origen, String destino) {
    if (origen.equals(destino)) return List.of(List.of(destino));
    List<List<String>> r = new ArrayList<>();
    for (String vecino : new TreeSet<>(grafo.getOrDefault(origen, Set.of()))) {
        for (List<String> resto : caminos(grafo, vecino, destino)) {
            List<String> camino = new ArrayList<>(List.of(origen));
            camino.addAll(resto);
            r.add(camino);
        }
    }
    return r;
}

void main() {
    Map<String, Set<String>> estados = new TreeMap<>();
    ShipmentStatus.ALLOWED_TRANSITIONS.forEach((a, destinos) -> estados.put(a.valor,
            destinos.stream().map(b -> b.valor).collect(Collectors.toCollection(TreeSet::new))));
    int aristas = estados.values().stream().mapToInt(Set::size).sum();
    IO.println("estados: " + estados.size() + " aristas: " + aristas);
    IO.println("¿ciclo en transiciones? " + tieneCiclo(estados));
    IO.println("caminos created → delivered: " + caminos(estados, "created", "delivered"));

    Map<String, Set<String>> capas = new LinkedHashMap<>();
    capas.put("dominio", new TreeSet<>(Set.of("aplicación", "pruebas")));
    capas.put("aplicación", new TreeSet<>(Set.of("infraestructura", "pruebas")));
    capas.put("infraestructura", new TreeSet<>());
    capas.put("pruebas", new TreeSet<>());
    IO.println("¿ciclo en capas? " + tieneCiclo(capas));
    capas.get("infraestructura").add("dominio");
    IO.println("tras infraestructura → dominio: " + tieneCiclo(capas));
}
```

```text
$ java Grafo.java
estados: 4 aristas: 3
¿ciclo en transiciones? false
caminos created → delivered: [[created, assigned, out_for_delivery, delivered]]
¿ciclo en capas? false
tras infraestructura → dominio: true
```

Hay un único camino de created a delivered y pasa por los dos estados intermedios, en orden: el invariante se cumple
para todo envío. Ahora el orden de construcción, antes y después del cambio que crea el ciclo. Java no trae un orden topológico en su
biblioteca estándar, así que `Orden.java` implementa el algoritmo de Kahn:

```java
// Orden.java — orden topológico (algoritmo de Kahn) que nombra el ciclo si lo hay
List<String> ordenTopologico(Map<String, Set<String>> dependeDe) {
    Map<String, Set<String>> pendientes = new TreeMap<>();
    dependeDe.forEach((v, deps) -> {
        pendientes.computeIfAbsent(v, x -> new TreeSet<>()).addAll(deps);
        for (String d : deps) pendientes.computeIfAbsent(d, x -> new TreeSet<>());
    });
    List<String> orden = new ArrayList<>();
    while (!pendientes.isEmpty()) {
        String libre = pendientes.keySet().stream()
                .filter(v -> pendientes.get(v).isEmpty()).findFirst().orElse(null);
        if (libre == null) throw new IllegalStateException("hay un ciclo: " + ciclo(pendientes));
        pendientes.remove(libre);
        pendientes.values().forEach(deps -> deps.remove(libre));
        orden.add(libre);
    }
    return orden;
}

List<String> ciclo(Map<String, Set<String>> pendientes) {
    List<String> camino = new ArrayList<>();
    String v = pendientes.keySet().iterator().next();
    while (!camino.contains(v)) {
        camino.add(v);
        v = pendientes.get(v).iterator().next();
    }
    List<String> vuelta = new ArrayList<>(camino.subList(camino.indexOf(v), camino.size()));
    vuelta.add(v);
    return vuelta.reversed();
}

void main() {
    // cada clave depende de los elementos de su conjunto
    Map<String, Set<String>> dependeDe = new HashMap<>();
    dependeDe.put("aplicación", Set.of("dominio"));
    dependeDe.put("infraestructura", Set.of("aplicación"));
    dependeDe.put("pruebas", Set.of("dominio", "aplicación"));
    IO.println("orden de construcción: " + ordenTopologico(dependeDe));

    dependeDe.put("dominio", Set.of("infraestructura"));
    IO.println(ordenTopologico(dependeDe));
}
```

```text
$ java Orden.java
orden de construcción: [dominio, aplicación, infraestructura, pruebas]
Exception in thread "main" java.lang.IllegalStateException: hay un ciclo: [aplicación, infraestructura, dominio, aplicación]
	at Orden.ordenTopologico(Orden.java:12)
	at Orden.main(Orden.java:41)
```

**Explicación por partes.**
- `Grafo.java`, línea 9: llegar a un vértice **activo** es volver al camino actual: ciclo.
- `Grafo.java`, línea 10: llegar a uno **terminado** no es ciclo; se descarta sin repetir trabajo.
- `Grafo.java`, líneas 15–16: al terminar un vértice, sale de `activos` y entra en `visitados`.
- `Grafo.java`, líneas 20–31: `caminos` es recursiva. Su caso base es llegar al destino; termina porque el grafo no tiene ciclos.
- `Grafo.java`, línea 48: una sola arista nueva, infraestructura → dominio, convierte el DAG en un grafo con ciclo.
- `Orden.java`, líneas 3–7: `pendientes` guarda, para cada vértice, las dependencias que aún no se han construido.
- `Orden.java`, líneas 10–15: toma el primer vértice sin pendientes, lo agrega al orden y lo borra de los pendientes de los demás.
- `Orden.java`, línea 12: si ninguno queda libre, hay un ciclo. Líneas 20–30: `ciclo` sigue dependencias hasta repetir un vértice y devuelve la vuelta en el sentido «cada uno depende del anterior».

> **Error común.** Pedir un orden topológico sin revisar ciclos. El programa termina con
> `java.lang.IllegalStateException: hay un ciclo: [aplicación, infraestructura, dominio, aplicación]`. Lee la lista de
> izquierda a derecha: cada elemento depende del anterior, y el último repite el primero. Una versión de Kahn que solo
> sale del `while` cuando no encuentra vértice libre devolvería un orden incompleto sin avisar.

> **Prevenir errores.** Agrega `tieneCiclo` (u `ordenTopologico`) como prueba automática del grafo de
> dependencias. Así el ciclo aparece en la integración continua, no meses después en una compilación que nadie entiende.

#### Checkpoint 3.1
Si RutaFlow agrega un quinto estado, `cancelled`, ¿cuántos pares (actual, pedido) debe revisar `Transiciones.java`?

Respuesta: \(5 \cdot 5 = 25\). Es el producto cartesiano \(S \times S\) con \(\lvert S \rvert = 5\), por la regla del producto.

#### Checkpoint 3.2
¿Cómo ayuda un grafo a detectar un ciclo de dependencias?

Respuesta: cada módulo es un vértice y cada dependencia, una arista dirigida. Un ciclo de dependencias es un ciclo del
grafo, y un DFS lo encuentra cuando llega a un vértice que sigue activo en el camino actual.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/discretas/grafos`, entra y copia ahí `ShipmentStatus.java` del Tema 1.

#### Paso 2 · Cuenta y comprueba
Escribe `Conteo.java` y ejecútalo. Antes de cada línea de la salida, escribe en papel tu predicción con la fórmula de
la tabla de «Cómo funciona».

#### Paso 3 · Detecta el ciclo
Escribe `Grafo.java` y ejecútalo. Luego agrega `estados.get("delivered").add("created");` antes de la línea 39 y vuelve
a ejecutarlo: `¿ciclo en transiciones?` debe pasar a `true`. Quita esa línea al terminar.

#### Paso 4 · Ordena la construcción
Escribe `Orden.java` y ejecútalo. Confirma que la primera línea muestra el orden y que la excepción final nombra el ciclo
`aplicación → infraestructura → dominio → aplicación`.

#### Resumen
- La **regla del producto** multiplica las opciones de pasos sucesivos; la **regla de la suma** suma caminos sin solapamiento.
- El **factorial** \(n!\) cuenta las filas de \(n\) elementos; crece tan rápido que probar todas las rutas es imposible.
- La **permutación** \(P(n, k)\) cuenta con orden; la **combinación** \(C(n, k)\), sin orden: \(C(n, k) = P(n, k) / k!\).
- Un **grafo dirigido** es una relación con dirección; un **ciclo** vuelve a su punto de partida.
- Un **grafo acíclico dirigido** no tiene ciclos; en él los caminos son finitos y se pueden enumerar.
- El DFS detecta un ciclo al llegar a un vértice activo; llegar a uno terminado no es ciclo.
- Un **orden topológico** existe solo en un DAG; el algoritmo de Kahn lo construye o descubre el ciclo.

#### Ejercicio verificable 1
Básico. Los casilleros de una bodega se nombran con 2 letras (26 opciones cada una) y 3 dígitos. ¿Cuántos nombres
distintos hay? Comprueba con Java.

Respuesta esperada: \(26^2 \cdot 10^3 = 676\,000\), por la regla del producto. En Java, `26 * 26 * 1000` da `676000`.

#### Ejercicio verificable 2
Intermedio. De 8 paradas pendientes, un mensajero lleva 3 en la primera ronda. ¿Cuántos grupos de 3 hay? ¿Y cuántas
maneras de elegir 3 y además ordenarlas?

Respuesta esperada: grupos: \(C(8, 3) = 56\). Grupos ordenados: \(P(8, 3) = 8 \cdot 7 \cdot 6 = 336\). Se cumple
\(336 = 56 \cdot 3!\). `comb(8, 3)` y `perm(8, 3)` de `Conteo.java` lo confirman.

#### Ejercicio verificable 3
Reto. Escribe `cicloIngenuo(grafo)`, un DFS con un solo conjunto `visitados` que devuelve `true` al llegar a un vértice
ya visitado. Ejecútalo con el rombo A → {B, C}, B → {D}, C → {D}, D → {} y compáralo con `tieneCiclo`.

Respuesta esperada: `cicloIngenuo` devuelve `true` y `tieneCiclo` devuelve `false`. El rombo no tiene ciclos: D se
alcanza por dos caminos, pero ninguno vuelve atrás. Sin el estado «activo», la función confunde «ya lo vi» con «estoy dentro».

#### En el trabajo
Los gestores de paquetes y de compilación (Maven, Gradle, `npm`), los sistemas de compilación y los orquestadores de tareas como Airflow
modelan dependencias como DAG y ejecutan en orden topológico. Cuando reportan una «dependencia circular», es un
ciclo como el que reporta `Orden.java`. El conteo aparece al dimensionar: cuántos casos de prueba requiere una
combinación de opciones, o cuántos identificadores admite un formato antes de agotarse.

</details>

### Tema 4: Probabilidad y evidencia para decisiones técnicas · Avanzado · 80 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- calcular probabilidades exactas contando casos de un espacio muestral, y comprobarlas con una simulación con semilla;
- aplicar la independencia, la probabilidad condicional y la esperanza a datos de entregas;
- medir la distribución de tiempos de `nearestNeighborRoute` con mediana y percentil 95 en varios tamaños;
- distinguir correlación de causalidad y reconocer el sesgo de selección antes de concluir.

**Conceptos clave:** espacio muestral, evento, probabilidad, independencia, probabilidad condicional, esperanza, percentil, semilla, sesgo de selección, correlación

#### El problema
En RutaFlow cada envío se entrega en el primer intento 9 de cada 10 veces. ¿Qué tan probable es que una ruta de 3
envíos salga perfecta? Además, alguien propone «contratar más mensajeros porque los días con más pedidos hay más
retrasos», y otro afirma que la ruta «tarda 0.2 ms» tras medirla una vez. Necesitas números que separen evidencia de
intuición.

**Complejidad** \(O(n^2)\) y **`System.nanoTime`** tienen su ficha en el Módulo 2, Temas 4 y 2. **Conjunto**,
**subconjunto** e **intersección** vienen del Tema 2 de este módulo; **producto cartesiano** y **regla del producto**,
de los Temas 2 y 3.

#### Glosario del tema

**espacio muestral**
- **Definición técnica:** conjunto \(\Omega\) («omega») de todos los resultados posibles de un experimento aleatorio, es decir, de un proceso cuyo resultado no se conoce de antemano.
- **En palabras sencillas:** la lista completa de lo que puede pasar.
- **Dónde se rompe la comparación:** en la vida real casi nunca puedes listarlo entero; por eso se simula o se mide.
- **Ejemplo:** lanzar dos dados: \(\Omega = \{1, \dots, 6\} \times \{1, \dots, 6\}\), con \(\lvert \Omega \rvert = 36\) pares.
- **Error típico:** contar (1, 6) y (6, 1) como un solo resultado; entonces los resultados ya no son igual de probables.

**evento**
- **Definición técnica:** subconjunto \(A \subseteq \Omega\) de resultados. Se dice que \(A\) ocurre si el resultado obtenido pertenece a \(A\).
- **En palabras sencillas:** una pregunta de sí o no sobre el resultado, como «¿los dados suman 7?».
- **Dónde se rompe la comparación:** un evento no es un resultado: «suma 7» agrupa 6 resultados distintos.
- **Ejemplo:** \(A = \{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\}\), con \(\lvert A \rvert = 6\).
- **Error típico:** escribir un evento que no es subconjunto de \(\Omega\), como «suma 13» con dos dados: es el vacío y su probabilidad es 0.

**probabilidad**
- **Definición técnica:** función \(P\) que asigna a cada evento un número entre 0 y 1, con \(P(\Omega) = 1\) y \(P(A \cup B) = P(A) + P(B)\) si \(A \cap B = \varnothing\). Si todos los resultados son igual de probables, \(P(A) = \frac{\lvert A \rvert}{\lvert \Omega \rvert}\).
- **En palabras sencillas:** la fracción de las veces que algo ocurriría si repitieras el experimento muchísimas veces.
- **Dónde se rompe la comparación:** «casos favorables entre casos posibles» solo vale si los resultados son igual de probables. Ganar la lotería tiene dos resultados y no vale 1/2.
- **Ejemplo:** \(P(\text{suma } 7) = \frac{6}{36} = \frac{1}{6}\). Y el complemento: \(P(\text{no } A) = 1 - P(A)\).
- **Error típico:** calcular con decimales y comparar: `0.1 + 0.2 == 0.3` da `false`. La `Fraccion` de este tema da resultados exactos.

**independencia**
- **Definición técnica:** los eventos \(A\) y \(B\) son independientes si \(P(A \cap B) = P(A) \cdot P(B)\).
- **En palabras sencillas:** saber que ocurrió uno no cambia la probabilidad del otro.
- **Dónde se rompe la comparación:** independiente no es «sin relación visible», ni lo mismo que disjunto. Dos eventos disjuntos con probabilidad positiva nunca son independientes.
- **Ejemplo:** 3 envíos independientes con \(P = \frac{9}{10}\) cada uno: \(\left(\frac{9}{10}\right)^3 = \frac{729}{1000}\).
- **Error típico:** multiplicar probabilidades de eventos dependientes, como lluvia y retraso.

**probabilidad condicional**
- **Definición técnica:** \(P(A \mid B) = \frac{P(A \cap B)}{P(B)}\), con \(P(B) > 0\). Se lee «probabilidad de \(A\) dado \(B\)».
- **En palabras sencillas:** la probabilidad recalculada sabiendo que \(B\) ocurrió: miras solo los casos donde pasó \(B\).
- **Dónde se rompe la comparación:** el orden importa: \(P(A \mid B)\) y \(P(B \mid A)\) casi nunca son iguales.
- **Ejemplo:** \(P(\text{retraso} \mid \text{lluvia}) = \frac{60}{200} = \frac{3}{10}\).
- **Error típico:** invertirla. \(P(\text{lluvia} \mid \text{retraso}) = \frac{60}{140} = \frac{3}{7}\) responde otra pregunta.

**esperanza**
- **Definición técnica:** para una variable aleatoria \(X\) (un número que depende del resultado), \(E[X] = \sum_x x \cdot P(X = x)\): el promedio de sus valores, cada uno pesado por su probabilidad.
- **En palabras sencillas:** el promedio que verías a la larga si repitieras el experimento muchas veces.
- **Dónde se rompe la comparación:** puede no ser un valor posible: se esperan 0.3 fallos por ruta, aunque nunca falla «0.3 envíos».
- **Ejemplo:** con 3 envíos y \(P(\text{fallo}) = \frac{1}{10}\), \(E[\text{fallos}] = 3 \cdot \frac{1}{10} = \frac{3}{10}\).
- **Error típico:** resumir datos de cola larga solo con la media; unos pocos valores enormes la arrastran hacia arriba.

**percentil**
- **Definición técnica:** el percentil \(q\) es un valor que deja por debajo aproximadamente el \(q\,\%\) de los datos. El percentil 50 (p50) es la mediana. Java no trae percentiles en su biblioteca estándar; `Estadistica.percentil(datos, q)` de este tema los calcula por interpolación.
- **En palabras sencillas:** «el 95 % de las peticiones tardó menos que esto».
- **Dónde se rompe la comparación:** con pocos datos es una estimación muy inestable; el p95 de 20 mediciones depende de una o dos.
- **Ejemplo:** `Estadistica.percentil(latencias, 95)` es el p95 de las latencias.
- **Error típico:** tomar el elemento en la posición 95 de la lista ordenada como «el p95» sin interpolar; con 100 datos ese elemento es el 96.º y queda por encima del p95.

**semilla**
- **Definición técnica:** valor inicial de un generador de números pseudoaleatorios; con la misma semilla produce la misma secuencia. En Java, `new Random(2026)`.
- **En palabras sencillas:** el número de una receta: misma semilla, mismos «dados».
- **Dónde se rompe la comparación:** los números no son aleatorios de verdad; no sirven para contraseñas ni tokens (para eso, `java.security.SecureRandom`).
- **Ejemplo:** `Latencias.java` muestra el mismo `p95` en cada ejecución porque fija la semilla en la línea 3.
- **Error típico:** no fijarla y luego no poder repetir el resultado raro que viste una vez.

**sesgo de selección**
- **Definición técnica:** error sistemático que aparece cuando la **muestra** (los datos que mides) no representa a la **población** (todos los casos que te interesan) por la forma en que se eligió.
- **En palabras sencillas:** preguntar por la calidad del servicio solo a los clientes que volvieron a comprar.
- **Dónde se rompe la comparación:** no desaparece midiendo más: mil mediciones sesgadas siguen sesgadas.
- **Ejemplo:** medir la ruta solo con 50 paradas y concluir que «tarda 0.2 ms» para cualquier ruta.
- **Error típico:** medir solo de noche, con el servidor libre, y prometer esos tiempos en hora pico.

**correlación**
- **Definición técnica:** el coeficiente de Pearson \(r\), entre \(-1\) y \(1\), mide qué tan bien una recta describe la relación entre dos variables. En este tema la calcula `correlacion(x, y)`, escrita a mano.
- **En palabras sencillas:** si una variable sube, ¿la otra tiende a subir (\(r\) cerca de 1), a bajar (cerca de −1) o ninguna (cerca de 0)?
- **Dónde se rompe la comparación:** correlación no implica causalidad: las dos pueden depender de una tercera variable.
- **Ejemplo:** pedidos y retraso tienen \(r = 0.95\), pero dentro de un mismo nivel de tráfico \(r = 0.27\).
- **Error típico:** calcularla con una lista constante: la fórmula divide 0 entre 0 y devuelve `NaN` sin avisar.

#### ► CÓMO FUNCIONA
Hay tres caminos hacia un número, del más exacto al más realista:

1. **Contar:** si puedes listar \(\Omega\) y los resultados son igual de probables, \(P(A) = \lvert A \rvert / \lvert \Omega \rvert\).
2. **Simular:** si contar es difícil, repites el experimento con un generador con semilla y mides la frecuencia.
3. **Medir:** con datos reales, la probabilidad se estima con frecuencias de una muestra, que puede estar sesgada.

**Reglas que usarás.** Para eventos independientes, «y» multiplica: \(P(A \cap B) = P(A) \cdot P(B)\). Para «al menos
uno», usa el complemento: \(P(\text{al menos un fallo}) = 1 - P(\text{ningún fallo})\). La barra vertical \(\mid\) se lee
«dado»: \(P(R \mid L)\) es la probabilidad de \(R\) mirando solo los casos con \(L\).

Para 3 envíos independientes, cada uno con \(P(\text{entrega}) = \frac{9}{10}\):

\[ P(\text{los 3 entregados}) = \frac{9}{10} \cdot \frac{9}{10} \cdot \frac{9}{10} = \frac{729}{1000} = 0.729 \]

**Medir tiempos.** Una distribución de tiempos casi nunca es simétrica: la mayoría son rápidos y unos pocos, muy
lentos (cola larga). La media se va hacia la cola; la mediana (p50) describe el caso típico y el p95, el peor caso
frecuente. Una conclusión honesta dice tamaño de muestra, condiciones y dispersión, no solo un número.

```mermaid
flowchart LR
    POP["población"] --> DESIGN["diseño de muestreo"] --> SAMPLE["muestra"] --> STAT["estadístico"]
    STAT --> CONCLUSION["conclusión con incertidumbre"]
    BIAS["sesgo de selección"] -. "no desaparece aumentando n" .-> SAMPLE
```

#### Problema resuelto 4.1
Calcula la probabilidad exacta de que dos dados sumen 7. Luego, para una ruta de 3 envíos independientes con
probabilidad \(\frac{9}{10}\) de entrega cada uno, calcula: que salga perfecta, que tenga al menos un fallo y cuántos
fallos se esperan. Compara con una simulación de 100 000 rutas.

**Razonamiento:**
1. \(\Omega\) de dos dados es el producto cartesiano de \(\{1, \dots, 6\}\) consigo mismo; el evento se filtra con una condición.
2. Cada ruta es un arreglo de 3 booleanos: \(2^3 = 8\) resultados. No son igual de probables, así que se multiplica la probabilidad de cada envío.
3. \(E[\text{fallos}] = \sum (\text{fallos de la ruta}) \cdot P(\text{ruta})\) sobre las 8 rutas.
4. `Fraccion` mantiene las fracciones exactas; la simulación con semilla da una frecuencia cercana y repetible.

`Fraccion.java` es un record que guarda numerador y denominador como `BigInteger` y se simplifica al crearse:

```java
// Fraccion.java — fracción exacta, siempre simplificada y con denominador positivo
import java.math.BigInteger;

record Fraccion(BigInteger num, BigInteger den) {
    Fraccion {
        if (den.signum() == 0) throw new ArithmeticException("denominador cero");
        if (den.signum() < 0) {
            num = num.negate();
            den = den.negate();
        }
        BigInteger mcd = num.gcd(den);
        if (!mcd.equals(BigInteger.ONE) && mcd.signum() != 0) {
            num = num.divide(mcd);
            den = den.divide(mcd);
        }
    }

    static Fraccion of(long num, long den) {
        return new Fraccion(BigInteger.valueOf(num), BigInteger.valueOf(den));
    }

    Fraccion mas(Fraccion o) {
        return new Fraccion(num.multiply(o.den).add(o.num.multiply(den)), den.multiply(o.den));
    }

    Fraccion menos(Fraccion o) {
        return mas(new Fraccion(o.num.negate(), o.den));
    }

    Fraccion por(Fraccion o) {
        return new Fraccion(num.multiply(o.num), den.multiply(o.den));
    }

    Fraccion entre(Fraccion o) {
        return new Fraccion(num.multiply(o.den), den.multiply(o.num));
    }

    double aDouble() {
        return num.doubleValue() / den.doubleValue();
    }

    @Override
    public String toString() {
        return den.equals(BigInteger.ONE) ? num.toString() : num + "/" + den;
    }
}
```

```java
// Probabilidad.java — probabilidad exacta contando casos y comprobación por simulación
void main() {
    // 1. Dos dados: espacio muestral y un evento
    List<int[]> omega = new ArrayList<>();
    for (int a = 1; a <= 6; a++) for (int b = 1; b <= 6; b++) omega.add(new int[] {a, b});
    long sumaSiete = omega.stream().filter(r -> r[0] + r[1] == 7).count();
    IO.println("|Ω| = " + omega.size() + "  |A| = " + sumaSiete + "  P(A) = " + Fraccion.of(sumaSiete, omega.size()));

    // 2. Ruta de 3 envíos; cada uno se entrega con probabilidad 9/10, de forma independiente
    Fraccion pOk = Fraccion.of(9, 10);
    Map<Boolean, Fraccion> prob = Map.of(true, pOk, false, Fraccion.of(1, 1).menos(pOk));
    List<boolean[]> rutas = new ArrayList<>();
    for (boolean a : new boolean[] {true, false})
        for (boolean b : new boolean[] {true, false})
            for (boolean c : new boolean[] {true, false}) rutas.add(new boolean[] {a, b, c});
    Fraccion pTodos = Fraccion.of(0, 1), esperanza = Fraccion.of(0, 1);
    for (boolean[] r : rutas) {
        Fraccion p = prob.get(r[0]).por(prob.get(r[1])).por(prob.get(r[2]));
        int fallos = (r[0] ? 0 : 1) + (r[1] ? 0 : 1) + (r[2] ? 0 : 1);
        if (fallos == 0) pTodos = pTodos.mas(p);
        esperanza = esperanza.mas(p.por(Fraccion.of(fallos, 1)));
    }
    IO.println("resultados posibles: " + rutas.size());
    IO.println("P(los 3 entregados) = " + pTodos + " = " + pTodos.aDouble());
    IO.println("P(al menos un fallo) = " + Fraccion.of(1, 1).menos(pTodos));
    IO.println("E[fallos por ruta] = " + esperanza);

    // 3. Simulación con semilla: la frecuencia se acerca a la probabilidad
    Random random = new Random(2026);
    int n = 100_000, exitos = 0;
    for (int i = 0; i < n; i++) {
        if (random.nextDouble() < 0.9 && random.nextDouble() < 0.9 && random.nextDouble() < 0.9) exitos++;
    }
    IO.println("frecuencia simulada: " + (double) exitos / n);
}
```

```text
$ java Probabilidad.java
|Ω| = 36  |A| = 6  P(A) = 1/6
resultados posibles: 8
P(los 3 entregados) = 729/1000 = 0.729
P(al menos un fallo) = 271/1000
E[fallos por ruta] = 3/10
frecuencia simulada: 0.72651
```

**Explicación por partes.**
- `Fraccion.java`, líneas 5–15: el constructor compacto pasa el signo al numerador y divide ambos entre su máximo común divisor (`gcd`), así que `Fraccion.of(6, 36)` queda `1/6`.
- `Fraccion.java`, líneas 41–44: `toString` muestra `a/b`, o solo `a` si el denominador es 1. Como es un record, `equals` compara numerador y denominador ya simplificados.
- `Probabilidad.java`, línea 5: dos `for` construyen los 36 pares de \(\Omega\). Línea 6: el evento se filtra con una condición.
- Línea 11: `prob.get(true)` es \(\frac{9}{10}\) y `prob.get(false)`, su complemento \(\frac{1}{10}\).
- Líneas 13–15: las 8 rutas, como producto cartesiano de \(\{\text{true}, \text{false}\}\) tres veces.
- Líneas 18–20: la probabilidad de cada ruta es el producto, por independencia; solo la ruta sin fallos suma a `pTodos`.
- Línea 21: cada ruta aporta su número de fallos por su probabilidad; la suma es \(E[X] = \frac{3}{10}\).
- Líneas 29–34: con la semilla 2026, 72 651 de 100 000 rutas simuladas salieron perfectas: 0.72651, cerca de 0.729. La semilla fija la secuencia de este generador (`java.util.Random`); otro generador con la misma semilla daría otra.

> **Error común.** Calcular con decimales y comparar con `==`. `0.1 + 0.2 == 0.3` da `false` por el error de redondeo
> del punto flotante (Módulo 1, Tema 5). Con `Fraccion.of(1, 10).mas(Fraccion.of(2, 10)).equals(Fraccion.of(3, 10))`
> obtienes `true`.

> **Buena práctica.** Cuando puedas, calcula el valor exacto **y** simula. Si la simulación se aleja mucho del cálculo,
> uno de los dos tiene un error. Es la misma idea de la prueba basada en propiedades: dos caminos que deben coincidir.

#### Problema resuelto 4.2
El registro del trimestre tiene 1000 entregas clasificadas por clima y resultado. Calcula \(P(R \mid L)\) (retraso dado
lluvia) y decide si lluvia y retraso son independientes. Después revisa la propuesta: «más pedidos causan más retrasos».

**Razonamiento:**
1. Cada probabilidad es una frecuencia: casos del evento entre 1000.
2. \(P(R \mid L) = P(R \cap L) / P(L)\): mira solo las 200 entregas con lluvia.
3. Independencia: comparar \(P(R \cap L)\) con \(P(R) \cdot P(L)\).
4. Para la propuesta, calcula la correlación entre pedidos y retraso, y luego dentro de un nivel fijo de tráfico.

```java
// Condicional.java — probabilidad condicional e independencia con un registro histórico
// 1000 entregas del último trimestre, contadas por clima y resultado
final Map<List<String>, Integer> conteo = Map.of(
        List.of("lluvia", "retraso"), 60, List.of("lluvia", "a tiempo"), 140,
        List.of("seco", "retraso"), 80, List.of("seco", "a tiempo"), 720);
final int total = conteo.values().stream().mapToInt(Integer::intValue).sum();

Fraccion p(Predicate<List<String>> condicion) {
    int casos = conteo.entrySet().stream().filter(e -> condicion.test(e.getKey()))
            .mapToInt(Map.Entry::getValue).sum();
    return Fraccion.of(casos, total);
}

void main() {
    Fraccion pLluvia = p(k -> k.get(0).equals("lluvia"));
    Fraccion pRetraso = p(k -> k.get(1).equals("retraso"));
    Fraccion pAmbos = p(k -> k.equals(List.of("lluvia", "retraso")));
    IO.println("P(L) = " + pLluvia + "  P(R) = " + pRetraso + "  P(R ∩ L) = " + pAmbos);
    IO.println("P(R | L) = " + pAmbos.entre(pLluvia));
    IO.println("P(R | no L) = " + p(k -> k.equals(List.of("seco", "retraso"))).entre(Fraccion.of(1, 1).menos(pLluvia)));
    IO.println("P(R) · P(L) = " + pRetraso.por(pLluvia));
    IO.println("¿independientes? " + pAmbos.equals(pRetraso.por(pLluvia)));
}
```

```text
$ java Condicional.java
P(L) = 1/5  P(R) = 7/50  P(R ∩ L) = 3/50
P(R | L) = 3/10
P(R | no L) = 1/10
P(R) · P(L) = 7/250
¿independientes? false
```

Con lluvia, el retraso es 3 veces más probable (\(\frac{3}{10}\) frente a \(\frac{1}{10}\)). \(P(R \cap L) = \frac{3}{50}\)
no es \(P(R) \cdot P(L) = \frac{7}{250}\): no son independientes. Ahora la propuesta de los pedidos, con datos simulados
en los que el tráfico causa las dos cosas:

```java
// Correlacion.java — dos variables correlacionadas por una causa común
double correlacion(List<Double> x, List<Double> y) {
    double mx = x.stream().mapToDouble(v -> v).average().orElseThrow();
    double my = y.stream().mapToDouble(v -> v).average().orElseThrow();
    double sxy = 0, sxx = 0, syy = 0;
    for (int i = 0; i < x.size(); i++) {
        sxy += (x.get(i) - mx) * (y.get(i) - my);
        sxx += (x.get(i) - mx) * (x.get(i) - mx);
        syy += (y.get(i) - my) * (y.get(i) - my);
    }
    return sxy / Math.sqrt(sxx * syy);
}

void main() {
    Random random = new Random(7);
    List<Double> trafico = new ArrayList<>(), pedidos = new ArrayList<>(), retraso = new ArrayList<>();
    for (int i = 0; i < 500; i++) {
        double t = random.nextDouble(0, 10);                 // congestión de la ciudad, de 0 a 10
        trafico.add(t);
        pedidos.add(20 + 3 * t + 2 * random.nextGaussian()); // la hora pico trae más pedidos
        retraso.add(5 + 4 * t + 3 * random.nextGaussian());  // y también más minutos de retraso
    }
    IO.println("correlación pedidos–retraso: %.2f".formatted(correlacion(pedidos, retraso)));
    List<Integer> franja = IntStream.range(0, 500).filter(i -> trafico.get(i) >= 4 && trafico.get(i) < 5).boxed().toList();
    IO.println("en la franja de tráfico 4–5: %d observaciones, correlación %.2f".formatted(franja.size(),
            correlacion(franja.stream().map(pedidos::get).toList(), franja.stream().map(retraso::get).toList())));
}
```

```text
$ java Correlacion.java
correlación pedidos–retraso: 0.95
en la franja de tráfico 4–5: 51 observaciones, correlación 0.27
```

**Explicación por partes.**
- `Condicional.java`, líneas 3–5: cada clave es una lista inmutable (clima, resultado); `List.of` compara por contenido, así que sirve como clave de un mapa.
- `Condicional.java`, líneas 8–12: `p` recibe una condición (`Predicate`) y suma los conteos de las claves que la cumplen.
- `Condicional.java`, líneas 15–17: `k -> ...` es una lambda (Módulo 2, Tema 8); `k` es la clave (clima, resultado).
- `Condicional.java`, línea 19: dividir dos `Fraccion` aplica la fórmula de la probabilidad condicional sin redondeo.
- `Correlacion.java`, líneas 2–12: el coeficiente de Pearson: covarianza dividida entre el producto de las desviaciones.
- `Correlacion.java`, líneas 18–21: el tráfico `t` sube los pedidos y el retraso; los pedidos **no** aparecen en la fórmula del retraso.
- `Correlacion.java`, línea 23: aun así, la correlación es 0.95.
- `Correlacion.java`, líneas 24–26: al fijar el tráfico entre 4 y 5, la correlación cae a 0.27: casi toda la relación venía del tráfico.

> **Error común.** Calcular la correlación de una variable que no cambia, por ejemplo los pedidos de días con cupo fijo.
> `correlacion(List.of(30.0, 30.0, 30.0), List.of(12.0, 15.0, 9.0))` devuelve `NaN` («no es un número») sin ningún
> aviso: `sxx` vale 0 y la línea 11 divide 0 entre 0. Sin variación no hay nada que relacionar; revisa que ninguna
> lista sea constante antes de calcular.

#### Problema resuelto 4.3
El equipo afirma que la ruta «tarda 0.2 ms». Primero compara media, mediana y p95 de una muestra de latencias con cola
larga. Después mide la distribución real de `nearestNeighborRoute` con 50, 100, 200 y 400 paradas.

**Razonamiento:**
1. Con una muestra de cola larga, la media y la mediana se separan; el p95 muestra la cola.
2. Una sola medición no tiene dispersión. Se repite 30 veces cada tamaño y se reportan p50, p95 y máximo.
   En Java, además, se calienta la JVM antes de medir.
3. Medir varios tamaños evita el sesgo de selección de probar solo el caso pequeño.
4. La heurística es \(O(n^2)\) (Módulo 2, Tema 4): al duplicar \(n\), el tiempo debería multiplicarse por cerca de 4.

`Estadistica.java` reúne la media, la mediana y el percentil; la usan `Latencias.java` y `Medir.java`:

```java
// Estadistica.java — media, mediana y percentiles de una muestra
import java.util.List;

final class Estadistica {
    private Estadistica() {}

    static double media(List<Double> datos) {
        return datos.stream().mapToDouble(Double::doubleValue).average().orElseThrow();
    }

    static double mediana(List<Double> datos) {
        List<Double> d = datos.stream().sorted().toList();
        int m = d.size() / 2;
        return d.size() % 2 == 1 ? d.get(m) : (d.get(m - 1) + d.get(m)) / 2;
    }

    /** Percentil q (1 a 99) por interpolación lineal, con el método «exclusivo». */
    static double percentil(List<Double> datos, int q) {
        if (datos.size() < 2) throw new IllegalArgumentException("se necesitan al menos 2 datos, hay " + datos.size());
        List<Double> d = datos.stream().sorted().toList();
        int m = d.size() + 1;
        int j = Math.clamp(q * m / 100, 1, d.size() - 1);
        int delta = q * m - j * 100;
        return (d.get(j - 1) * (100 - delta) + d.get(j) * delta) / 100;
    }
}
```

```java
// Latencias.java — media, mediana y percentil 95 de una muestra con cola larga
void main() {
    Random random = new Random(2026); // misma muestra en cada ejecución
    // latencias simuladas en ms, con cola larga a la derecha (distribución lognormal)
    List<Double> latencias = new ArrayList<>();
    for (int i = 0; i < 100; i++) latencias.add(Math.exp(4.6 + 0.4 * random.nextGaussian()));
    double p50 = Estadistica.mediana(latencias);
    double p95 = Estadistica.percentil(latencias, 95);
    IO.println(String.format(Locale.ROOT, "n=%d  media=%.1f  p50=%.1f  p95=%.1f",
            latencias.size(), Estadistica.media(latencias), p50, p95));
    IO.println(String.format(Locale.ROOT, "mínimo: %.1f  máximo: %.1f",
            Collections.min(latencias), Collections.max(latencias)));
    IO.println("por encima de p95: " + latencias.stream().filter(x -> x > p95).count() + " de " + latencias.size());
}
```

```text
$ java Latencias.java
n=100  media=108.2  p50=93.7  p95=207.5
mínimo: 27.9  máximo: 334.5
por encima de p95: 5 de 100
```

La media (108.2) supera a la mediana (93.7) porque la cola larga la arrastra. Exactamente 5 de 100 valores superan el
p95. Ahora la heurística de rutas, en `Stop.java` y `Ruta.java` dentro de `probabilidad`:

```java
// Stop.java — parada de una ruta de RutaFlow
record Stop(String shipmentId, double latitude, double longitude) {}
```

```java
// Ruta.java — heurística de ruta de RutaFlow
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

final class Ruta {
    private Ruta() {}

    /** Heurística educativa O(n²); no afirma encontrar la ruta óptima. */
    static List<Stop> nearestNeighborRoute(double[] origin, List<Stop> stops) {
        List<Stop> remaining = new ArrayList<>(stops);
        List<Stop> ordered = new ArrayList<>();
        double[] position = origin;
        while (!remaining.isEmpty()) {
            double[] p = position;
            Stop selected = remaining.stream().min(Comparator.comparingDouble(
                    stop -> Math.hypot(stop.latitude() - p[0], stop.longitude() - p[1]))).orElseThrow();
            ordered.add(selected);
            remaining.remove(selected);
            position = new double[] {selected.latitude(), selected.longitude()};
        }
        return ordered;
    }
}
```

```java
// Medir.java — distribución de tiempos de nearestNeighborRoute por tamaño de entrada
List<Stop> paradas(int tamano) {
    List<Stop> r = new ArrayList<>();
    for (int i = 0; i < tamano; i++) r.add(new Stop("RF-" + i, i % 7, i % 5));
    return r;
}

void main() {
    // calentamiento: el compilador JIT optimiza el código mientras se usa; no se mide
    for (int r = 0; r < 200; r++) Ruta.nearestNeighborRoute(new double[] {0, 0}, paradas(400));

    for (int tamano : new int[] {50, 100, 200, 400}) {
        List<Stop> paradas = paradas(tamano);
        List<Double> tiemposMs = new ArrayList<>();
        for (int r = 0; r < 30; r++) {
            long inicio = System.nanoTime();
            Ruta.nearestNeighborRoute(new double[] {0, 0}, paradas);
            tiemposMs.add((System.nanoTime() - inicio) / 1e6);
        }
        IO.println(String.format(Locale.ROOT, "n=%3d  p50=%7.3f ms  p95=%7.3f ms  máx=%7.3f ms", tamano,
                Estadistica.mediana(tiemposMs), Estadistica.percentil(tiemposMs, 95), Collections.max(tiemposMs)));
    }
}
```

```text
$ java Medir.java
n= 50  p50=  0.026 ms  p95=  0.278 ms  máx=  0.535 ms
n=100  p50=  0.220 ms  p95=  0.414 ms  máx=  0.500 ms
n=200  p50=  0.742 ms  p95=  2.138 ms  máx=  2.281 ms
n=400  p50=  2.821 ms  p95=  4.004 ms  máx=  4.251 ms
```

Tus milisegundos serán otros. Lo estable es la proporción: de 100 a 200 paradas el p50 se multiplicó por 3.4, y de
200 a 400, por 3.8 (0.220 → 0.742 → 2.821), cerca del 4 que predice \(O(n^2)\). Con 50 paradas el tiempo es tan
pequeño que el ruido de la máquina pesa más que el algoritmo: por eso se miden varios tamaños.

**Explicación por partes.**
- `Estadistica.java`, líneas 11–15: la mediana ordena una copia; con cantidad par promedia los dos del centro.
- `Estadistica.java`, líneas 18–25: el percentil ubica la posición \(q \cdot (n+1) / 100\) en la lista ordenada e interpola entre los dos vecinos. `delta` es la parte fraccionaria, en centésimas. Es el método llamado «exclusivo», uno de varios que usan las herramientas de estadística.
- `Latencias.java`, línea 3: la semilla hace que la muestra sea idéntica en cada ejecución.
- `Latencias.java`, línea 6: \(e^{4.6 + 0.4 Z}\), con \(Z\) normal (`nextGaussian`), es una distribución lognormal: valores positivos con cola larga a la derecha, como las latencias reales.
- `Ruta.java`, líneas 16–17: en cada vuelta, `min` revisa todas las paradas restantes; \(n\) vueltas de hasta \(n\) revisiones dan \(O(n^2)\).
- `Medir.java`, línea 10: el calentamiento ejecuta la ruta 200 veces sin medir, para que el compilador JIT de la JVM ya haya optimizado el código.
- `Medir.java`, líneas 15–19: 30 repeticiones por tamaño, con `System.nanoTime` (Módulo 2, Tema 2), convertidas a milisegundos.
- `Medir.java`, líneas 20–21: p50, p95 y máximo resumen la distribución; el máximo muestra el peor caso observado.

> **Error común.** Medir sin calentar. Sin la línea 10, la primera fila de una ejecución salió así:
> `n= 50  p50=   0.21 ms  p95=  53.84 ms  máx= 114.47 ms`. Ese p95 no mide la ruta: mide a la JVM cargando clases y
> compilando el método mientras corre. Calienta primero o descarta las primeras repeticiones.

> **Error común.** Calcular un percentil con una sola medición. `Estadistica.percentil(List.of(12.5), 95)` se detiene
> con `java.lang.IllegalArgumentException: se necesitan al menos 2 datos, hay 1`, por la validación de la línea 19. Una
> versión que devolviera `12.5` como «p95» no avisaría de nada. Reporta siempre el tamaño de la muestra junto al percentil.

> **Rendimiento.** Reporta el p95 junto al p50. Un usuario que hace 20 peticiones por sesión tiene una probabilidad de
> \(1 - 0.95^{20} \approx 0.64\) de sufrir al menos una petición más lenta que el p95.

#### Checkpoint 4.1
Si cada envío se entrega con probabilidad 0.9, de forma independiente, ¿cuál es la probabilidad de al menos un fallo
en una ruta de 10 envíos?

Respuesta: \(1 - 0.9^{10} \approx 0.651\). Es más probable tener al menos un fallo que no tenerlo. Se usa el complemento
porque «ningún fallo» es un solo caso fácil de calcular.

#### Checkpoint 4.2
¿Por qué correlación no implica causalidad?

Respuesta: porque dos variables pueden moverse juntas porque ambas dependen de una tercera. En `Correlacion.java`,
pedidos y retraso tienen \(r = 0.95\), pero el tráfico causa los dos; con el tráfico fijo, la correlación cae a 0.27.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/discretas/probabilidad` y entra. Todos los programas de este tema usan solo la biblioteca estándar de Java.

#### Paso 2 · Cuenta y simula
Escribe `Fraccion.java` y `Probabilidad.java`, y ejecuta `java Probabilidad.java`; las fracciones deben coincidir
exactamente. Cambia la semilla a 1 y ejecuta otra vez: la frecuencia simulada cambia un poco, pero sigue cerca de 0.729.

#### Paso 3 · Condiciona y busca la causa común
Escribe `Condicional.java` y `Correlacion.java` y ejecútalos. Agrega a `Condicional.java` el cálculo de
\(P(L \mid R)\) y confirma que da `3/7`, distinto de \(P(R \mid L)\).

#### Paso 4 · Mide con percentiles
Escribe `Estadistica.java`, `Latencias.java`, `Stop.java`, `Ruta.java` y `Medir.java`, y ejecuta `java Medir.java` dos veces. Anota cuánto cambian tus p95 entre
ejecuciones: esa variación es parte de la evidencia y va en el informe.

#### Resumen
- El **espacio muestral** \(\Omega\) reúne todos los resultados; un **evento** es un subconjunto de \(\Omega\).
- Con resultados igual de probables, la **probabilidad** es \(\lvert A \rvert / \lvert \Omega \rvert\); `Fraccion` la calcula exacta.
- Con **independencia**, «y» multiplica; para «al menos uno», usa el complemento.
- La **probabilidad condicional** \(P(A \mid B)\) mira solo los casos de \(B\) y no es igual a \(P(B \mid A)\).
- La **esperanza** es el promedio pesado por probabilidad; puede no ser un valor posible.
- Un **percentil** describe la cola mejor que la media; la **semilla** hace reproducible una simulación.
- El **sesgo de selección** no se corrige con más datos, y la **correlación** no prueba causalidad.

#### Ejercicio verificable 1
Básico. Con dos dados, calcula \(P(\text{suma} \ge 10)\) contando casos. Comprueba con `Probabilidad.java`.

Respuesta esperada: los casos son (4, 6), (5, 5), (6, 4), (5, 6), (6, 5) y (6, 6): 6 de 36. \(P = \frac{6}{36} = \frac{1}{6}\),
y `Fraccion.of(6, 36)` muestra `1/6`.

#### Ejercicio verificable 2
Intermedio. Con la tabla de `Condicional.java`, calcula \(P(L \mid R)\): la probabilidad de que haya llovido sabiendo
que la entrega se retrasó. Explica por qué no es \(\frac{3}{10}\).

Respuesta esperada: \(P(L \mid R) = \frac{60}{140} = \frac{3}{7} \approx 0.43\). Mira las 140 entregas retrasadas, no las
200 con lluvia. \(P(R \mid L) = \frac{3}{10}\) responde otra pregunta: cuántas de las entregas con lluvia se retrasaron.

#### Ejercicio verificable 3
Reto. Cambia `Medir.java` para repetir 100 veces cada tamaño y para imprimir, al final, el cociente
`p50(400) / p50(200)`. Ejecútalo dos veces y escribe una conclusión de dos líneas con tamaño de muestra y dispersión.

Respuesta esperada: el cociente queda cerca de 4, por la complejidad \(O(n^2)\); en la máquina de referencia, tres
ejecuciones dieron 3.35, 3.53 y 3.40. Por lo general queda entre 3 y 4.5. Una
conclusión válida dice, por ejemplo: «con 100 repeticiones por tamaño en esta máquina, el p50 con 400 paradas fue
unas 4 veces el de 200; el p95 varió entre ejecuciones». No promete tiempos fijos para otra máquina.

#### En el trabajo
Los equipos de operaciones definen objetivos con percentiles («p95 menor que 300 ms»), no con promedios. Las pruebas
A/B de producto son probabilidad condicional y control de sesgos: si solo miras a quienes completaron la compra,
concluyes cualquier cosa. Antes de aprobar «contratar más mensajeros», una analista pregunta qué otra variable podría
explicar la correlación.

</details>

### Proyecto 9: cuaderno de propiedades, grafos y evidencia

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

El proyecto une los cuatro temas en un cuaderno reproducible del inventario de RutaFlow: especificaciones lógicas,
pruebas generativas, análisis de grafos y un experimento probabilístico. No hay técnicas nuevas: cada entrega remite al
tema donde se explicó. Puede ser una carpeta con programas de Java y un archivo de texto que los explique.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Entregables
1. **Especificación.** Pre, post e invariante de dos operaciones del inventario, en texto plano y en símbolos, con una tabla de verdad de al menos una regla compuesta (Tema 1).
2. **Contraejemplo automático.** Una prueba con jqwik que encontró un defecto real o sembrado, su contraejemplo mínimo y la corrección (Tema 1).
3. **Demostración.** Una prueba por inducción de una propiedad de una función recursiva del inventario, con sus supuestos escritos y uno de ellos comprobado (Tema 2).
4. **Grafo.** Las dependencias del inventario como grafo dirigido, con `tieneCiclo`, un orden topológico y un ejemplo de ciclo provocado, reportado y explicado (Tema 3).
5. **Experimento.** Una medición con semilla o repeticiones, en varios tamaños, que reporte n, p50 y p95, y una conclusión que nombre sus límites y posibles sesgos (Tema 4).

#### Criterio de terminado
Otra persona clona la carpeta, ejecuta `./gradlew test` (que descarga jqwik) y cada programa con `java`. Obtiene las
mismas salidas exactas, salvo los tiempos, y puede seguir cada conclusión desde el dato que la respalda.

</details>
