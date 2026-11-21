# Módulo 4 · Arreglos y primeras colecciones

> Curso Java (JDK 25) · tramo **Fundamentos** · 6 temas · formato único (specs/021). Portada del curso:
> [CURSO.md](CURSO.md). Todo el código de este módulo se compiló con `javac --release 25` y se ejecutó con
> `java -Dstdout.encoding=UTF-8` sobre OpenJDK Temurin 27.0.1.0.2+1 (macOS, arm64), locale `es_CO`, el
> 2026-11-20. Las salidas están pegadas tal cual. **Aviso de proveniencia:** en esta máquina no hay JDK 25
> instalado, así que el *API* es la de la versión 25 (la que comprueba `--release 25`) pero el *ejecutable* es
> el 27. Ningún tema de este módulo usa funciones *preview*; lo que puede diferir entre los dos ejecutables
> está marcado en cada tema como «pendiente de reejecución en JDK 25», y en este módulo eso es casi siempre el
> **texto** de una excepción —que lo redacta la JVM— y nunca la regla de lenguaje que se enseña.

## Cabecera del módulo

| | |
|---|---|
| **Objetivo** | Escribir un programa que maneja **muchos** datos sabiendo qué tienes debajo en cada caso: las tres formas de crear un arreglo y qué hay dentro antes del primer `=`; cómo se ve una matriz por lo que es (un arreglo cuyos elementos son arreglos) y qué hace exactamente cada método de `Arrays`; por qué un `String[]` sí cabe en un `Object[]` y qué se rompe al escribir por esa puerta; el primer uso de `ArrayList` y `HashMap` con sus operaciones que sí están garantizadas; qué convierte el autoboxing, dónde está su trampa de identidad y dónde su `NullPointerException`; y dos algoritmos escritos a mano con el coste **contado**, no proclamado. |
| **Prerrequisitos** | [Módulo 3](modulo-3.md) completo —en especial su tema 3 (los cuatro lazos y el `for` con etiqueta, que es la forma en que se recorre cualquier arreglo de este módulo) y su tema 4 (parámetros de arreglo: se copia la referencia, medido allí)— y [Módulo 2](modulo-2.md) completo (`String.equals`, `substring`, `Integer.parseInt`: con eso se parten las guías antes de meterlas en un arreglo). Del [Módulo 0](modulo-0.md) se sigue usando `javap -c`. |
| **Duración** | 4 h 10 min (6 temas de 35 a 45 min) más 1 h de laboratorio. |
| **Versiones** | JDK 25 (`--release 25`) · Gradle 9.8.2 por wrapper · JUnit 6.0.3. Nada de este módulo depende de una función *preview*. Dos cosas que la gente cree borradas **siguen ahí** en la 25 y se miden: el constructor `new Integer(int)` (deprecado, no eliminado: `javac --release 25` emite una *Note*, medido en `tema-5/EncajarYDesencajar.java`) y la covarianza de arreglos (JLS §10.5), que es de 1996 y sigue colándose. |
| **Laboratorio** | [`laboratorios/modulo-4/`](laboratorios/modulo-4/README.md) (al publicar: `examples/java/modulo-4/`), con `verificar.sh`: **187 comprobaciones, 0 fallidas** ejecutadas aquí. |
| **Proyecto guía** | `rutaflow-nucleo`: el **manifiesto de carga**. Lee la misma tanda de guías dos veces —con arreglos (`gramos`, `suma`, `mayor`, `mayoresQue`, `sobreElTope`) y con colecciones (`gramosLista`, `mayoresQueLista`, `totalesPorZona`)— y exige que los dos caminos den los mismos números. Cada tema cierra una parte: guardar los pesos (T1), ordenarlos y copiarlos (T2), entender por qué `Object[]` no es una salida (T3), acumular por zona en un mapa (T4), no perder una suma por un `Integer` `null` (T5) y medir el coste del filtro (T6). |

### Mapa del módulo

```mermaid
flowchart LR
    T1["1 · Arreglos<br/>crear, recorrer, valores por defecto"] --> T2["2 · Matrices y Arrays<br/>ordenar, copiar, comparar, buscar"]
    T2 --> T3["3 · Covarianza<br/>Object[] y ArrayStoreException"]
    T3 --> T4["4 · ArrayList y HashMap<br/>primer uso"]
    T4 --> T5["5 · Wrappers y autoboxing<br/>cache de Integer"]
    T5 --> T6["6 · Algoritmos a mano<br/>coste contado"]
    T6 -.->|"guardar → ordenar → filtrar → acumular → medir"| P["rutaflow-nucleo<br/>manifiesto de carga"]
```

**Texto alternativo:** el módulo va de la casilla al programa. Primero el arreglo en sí: las tres formas de
crearlo, lo que contiene antes de escribir, y el `ArrayIndexOutOfBoundsException` en sus dos direcciones.
Después la matriz y la clase `Arrays`, que es la biblioteca que opera sobre arreglos —ordenar, copiar,
comparar, buscar— y cuyo abuso más caro (`binarySearch` sin ordenar) se ejecuta aquí. El tema 3 explica por qué
el arreglo, siendo rápido, es **demasiado flexible** para un tipo de referencia: la covarianza y su
`ArrayStoreException`, medida a medio escribir. Con esa experiencia entras en `ArrayList` y `HashMap` (T4), el
par que casi siempre vas a usar en lugar del arreglo suelto. El tema 5 es el peaje de las colecciones tipadas:
los envoltorios, su caché de `-128..127`, el `==` entre cajas y el `NullPointerException` que aparece en una
línea sin métodos. El tema 6 escribe a mano lo que las API hacen por ti y **cuenta** las comparaciones, para
que el resto del curso hable de coste con números y no con etiquetas.

**Convención del módulo.** Tres cosas se comprueban de tres formas distintas. Que el **lenguaje** hace lo que
se afirma se comprueba con `javap -c` sobre el `.class` generado con `javac --release 25` (`newarray`,
`multianewarray`, `aastore`, `Integer.valueOf:(I)Ljava/lang/Integer;`, `List.add:(Ljava/lang/Object;)Z`). Que
el **programa** hace lo que se afirma se comprueba ejecutándolo y pegando su salida. Y que una **frontera**
está donde se dice se comprueba midiendo el primer valor que ya no cumple, en las dos direcciones: el corte de
la caché de `Integer` salió `128` por arriba y `-129` por abajo; el de `Character`, `128` pero desde `0`. Hay
dos familias de datos que **no** se citan como si fueran del lenguaje porque no lo son: el orden interno de un
`HashMap` (se comprueba si `LinkedHashMap` conserva el de inserción y si `HashMap` no, nunca en qué orden
sale) y la caché configurable (`-Djava.lang.Integer.IntegerCache.high=5000` movió el corte a `5001` en esta
misma máquina). Ninguna comprobación de este módulo depende de `System.identityHashCode` de un arreglo, del
`toString` por defecto de una matriz ni de un número de línea dentro de `java.base`. La única excepción es
**declarada**: el hueco interno de `ArrayList` (tema 4) se lee por reflexión sobre el campo privado
`elementData` con `--add-opens java.base/java.util=ALL-UNNAMED`, o sea que es un detalle de esta JDK, no una
regla del lenguaje, y se cita siempre como «medido en Temurin» y nunca como «así crece Java».

---

### Tema 1: Arreglos: creación, valores por defecto, recorrido y `ArrayIndexOutOfBoundsException` · Básico · 40 min

#### 1. Ubicación y prerrequisitos

Curso Java · tramo Fundamentos · módulo 4 · primer tema. Antes: [Módulo 3 · tema 3](modulo-3.md) (los cuatro
lazos: el `for` con índice y el `for`-each que aquí se comparan sobre el mismo arreglo), [Módulo 3 · tema 4](modulo-3.md)
(cómo se pasa un arreglo a un método: se copia la referencia, no el contenido) y [Módulo 2 · tema 1](modulo-2.md)
(`String.length()` —que es un **método** y es justo lo que vas a confundir con el **campo** `length` del
arreglo). Después: el tema 2 aplica todo esto una dimensión más arriba (una matriz es un arreglo cuyos
elementos son arreglos) y añade la clase `Arrays`; el tema 4 sustituye el arreglo por `ArrayList` cuando hace
falta crecer. Versión: JDK 25.

#### 2. Objetivo

Al terminar sabes crear un arreglo de las tres formas que existen y decir cuál aplica en cada sitio (una de
las tres **no compila** fuera de una declaración); sabes qué valor hay en cada casilla de un arreglo recién
creado según su tipo de componente —`0`, `0L`, `0.0`, `false`, el carácter `\u0000` o `null`— y que esas son
seis formas distintas de «cero»; sabes recorrerlo con índice y con `for`-each y decir cuándo necesitas el
índice; sabes que `length` es un campo, que el arreglo es un objeto con clase `[I`, superclase `Object` y las
interfaces `Cloneable` y `Serializable`, y que `clone()` devuelve `Object`; y puedes reproducir los dos
`ArrayIndexOutOfBoundsException` (por arriba y por abajo) leyendo el mensaje, que ya trae el índice y la
longitud.

#### 3. Por qué importa

En `rutaflow-nucleo` el manifiesto de carga es una tanda de guías, y la tanda tiene un número **fijo** por
viaje: entran los pesos de las 6 guías del camión, se ordenan, se filtran por tope. Ese es el caso de uso del
arreglo: cantidad conocida en compilación o en lectura, y acceso por posición. El coste de no saber lo que hay
dentro de un arreglo nuevo es concreto: `new int[3]` suma `0` si lo sumas sin mirar (medido en
`tema-1/ValoresPorDefecto.java`: la suma tras escribir solo `gramos[1] = 3400` es `3400`), y `new String[2]`
no suma nada —lanza— porque sus casillas están en `null`. Y el fallo de recorrido más caro no es el obvio:
`i <= llegada.length` en vez de `i < llegada.length` no se nota en la salida, se nota en la traza, y la traza
dice el índice y la longitud exactos (`Index 5 out of bounds for length 5`), así que arreglarlo es leer, no
adivinar.

#### 4. Analogía

Una hilera de casilleros de gimnasio, **soldados al marco**. El cerrajero no puede añadir un casillero ni
quitar uno: el número de casilleros se decide cuando se suelda el marco, y ese número va grabado en la placa
del extremo (`length`). Cada casillero tiene un número grabado que empieza en `0`, y la llave no es una
bolsa: es una **fórmula** —`base + i × ancho`—, por eso abrir el casillero 4 cuesta lo mismo que abrir el 0.

- `new int[n]` es **soldar n casilleros vacíos**. Vacío no significa sin candado: significa con el valor por
  defecto del tipo del casillero. Casillero de `int` llega con `0` dentro; casillero de `String` llega con
  `null` (es decir: con *ninguna* mochila depositada).
- `new int[] {1250, 3400, 890}` es soldar y **depositar a la vez**.
- `{1250, 3400, 890}` a secas es la lista de depósito que el cerrajero entiende **solo en el momento de
  soldar** (en la declaración). Escrita suelta, sobre casilleros ya soldados, es papel mojado: `javac` la
  rechaza (`illegal start of expression`, medido).
- El `for` con índice es el cerrajero que va casillero por casillero con la fórmula; el `for`-each es el que
  solo mira el contenido. Los dos visitan lo mismo; solo uno puede **escribir**.

**Dónde se rompe la analogía:** los casilleros soldados miden todos lo mismo y están pegados; un arreglo de
`String` guarda **32 o 64 bits de dirección**, no mochilas de tamaño variable, y por eso un `String[]` y un
`int[]` son la misma cosa en estructura aunque muy distintos en contenido. Y sobre todo: la analogía no tiene
un guardia que revise la llave. Java sí: si calculas `i = 5` en una hilera de 5, el guardia corta antes de
abrir, con `ArrayIndexOutOfBoundsException`. En C no hay guardia, y ahí está la diferencia de seguridad que el
tema 3 explota.

#### 5. Diagrama

```mermaid
flowchart TB
    subgraph PILA["pila"]
        V["main: gramos (referencia)"]
    end
    subgraph HEAPI["heap"]
        H["cabecera: clase [I · length = 3"]
        C0["casilla 0 = 0"]
        C1["casilla 1 = 3400"]
        C2["casilla 2 = 0"]
    end
    V -->|"una copia de la referencia"| H
    H --> C0
    H --> C1
    H --> C2
    E1["i < length → i = 0, 1, 2"] -.->|"legal"| C1
    E2["i <= length → i = 3"] -.->|"el guardia corta antes de leer"| G["ArrayIndexOutOfBoundsException<br/>Index 3 out of bounds for length 3"]
```

**Texto alternativo:** `int[] gramos = new int[3]` deja una referencia en la pila y **un objeto** en el heap,
con una cabecera que guarda la clase (`[I`) y la longitud (`3`), y tres casillas con `0` —medido:
`int [3]: 0 0 0 · su clase es class [I`. Escribir `gramos[1] = 3400` no crea otro arreglo ni borra las
vecinas: las tres casillas siguen ahí y la suma da `3400`. El acceso con índice válido usa la fórmula
`base + i × ancho`; el acceso con `i == length` no «lee basura»: la JVM comprueba la cota y lanza, y el
mensaje incluye las dos cifras que necesitabas para encontrar el bug.

#### 6. Explicación

**Nivel 0 — las tres formas de crear un arreglo, y por qué una no vale.** Medido en
`tema-1/CrearYRecorrer.java`:

```text
llegada   : longitud 5 · primer indice 0 = 1250 · ultimo indice 4 = 250
porTamano(3): longitud 3 · su primer valor es 0
porExpresion: longitud 3
```

1. **Literal en la declaración:** `static final int[] LLEGADA = {1250, 3400, 890, 7600, 250};` Solo se puede
   escribir donde estás **declarando** la variable.
2. **Solo tamaño:** `new int[n]` — los huecos existen, el contenido es el valor por defecto. `porTamano(3)`
   devuelve un arreglo de longitud 3 cuyo primer valor es `0`.
3. **Tamaño y contenido como expresión:** `return new int[] {1250, 3400, 890};` Esto **sí** es una expresión:
   vale en un `return`, como argumento, o en una reasignación.

La forma 1 no es una expresión. Por eso el arreglo de arriba se reasigna con `new int[] {...}` y no con las
llaves solas, medido en la misma corrida:

```text
reasignado: empezo con length 5, ahora length 3 · [0] = 1250
```

Fíjate en lo que dice esa línea: `length` pasó de 5 a 3. Reasignar **no** encogió el arreglo original; apuntó
la variable a un arreglo **nuevo** de 3. Un arreglo soldado no se encoge jamás (tema 4: para eso está
`ArrayList`).

**Nivel 0 — `length` es un campo, el índice empieza en 0 y termina en `length - 1`.** Medido en la primera
línea de arriba: longitud 5, primer índice 0, último índice 4. Y el último elemento vale `250`, que es lo que
ocupa la casilla 4. No hay casilla 5 y la JVM lo hace visible con un mensaje que trae las dos cifras.

**Nivel 1 — qué hay dentro antes de escribir nada.** Medido en `tema-1/ValoresPorDefecto.java`, seis tipos,
seis «ceros» distintos:

```text
int    [3]: 0 0 0 · su clase es class [I
long   [2]: 0 0
double [2]: 0.0 0.0
boolean[2]: false false
char   [2]: u+000 (cero) · u+000 (cero)
String [2]: null · null · componente class java.lang.String
```

La regla es la de los campos de una clase (JLS §4.12.5, y la viste en M3): el arreglo **no inicializa** sus
casillas a «nada», las inicializa al valor por defecto del tipo de componente. Lo que hay que saber leer es
que esos valores no son todos iguales: `0` (entero), `0` (largo), `0.0` (decimal), `false` (booleano),
`\u0000` (el carácter **cero**, no el espacio) y `null` (ausencia de referencia). Y que dos de ellos son una
trampa:

```text
0 == false ? no compila; 0.0 == 0 ? true; null == null ? true
```

En Java el `0` **no** es `false` (no hay conversión implícita número↔booleano; eso fue el error del tema 1 de
M3). Pero `0.0 == 0` sí es `true` porque el `int` se promotiona a `double`, y `null == null` es `true`, así que
un `String[]` recién creado **compara igual** contra `null` en cada casilla: el programa sigue y revienta dos
líneas más tarde.

**Nivel 2 — el arreglo es un objeto, de una clase que no escribiste tú.** Medido en
`tema-1/por-dentro/FormaDeUnArreglo.java`:

```text
clase real de un int[]   : [I
clase real de un String[]: [Ljava.lang.String;
clase real de un int[][] : [[I
componente del int[]     : int
componente del String[]  : class java.lang.String
componente del int[][]   : [I
isArray                  : true · superclass: class java.lang.Object · interfaces: [interface java.lang.Cloneable, interface java.io.Serializable]
```

Tres consecuencias prácticas, todas medidas:

- **Se puede pasar como `Object` y se le puede clonar**, pero `clone()` devuelve `Object`:
  `clone devuelve Object    : original[0]=1250 copia[0]=9999` —hubo que escribir `(int[])` en la asignación.
- **No tiene métodos útiles.** Un arreglo no tiene `length()`, ni `add`, ni `equals` que compare contenido
  (eso llega con `Arrays`, tema 2). Su «API» son cuatro cosas: `length`, `clone()`, `getClass()` y lo que
  hacen los métodos estáticos de `java.util.Arrays` y `java.lang.reflect.Array` **sobre** él. Medido con
  reflexión: `reflect.Array.getLength  : 3 · y su elemento 1 es 3400` —la reflexión puede leer la casilla 1
  sin saber en compilación que es un arreglo de `int`, lo que será normal en M21.
- `getComponentType()` es la pregunta que hay que saber hacer: un `int[][]` no es «una matriz», es *un arreglo
  cuyo componente es otro arreglo* (`componente del int[][]   : [I`). Eso explica el tema 2 entero.

**Nivel 3 — lo que emite `javac`.** Medido con `javap -c` sobre `FormaDeUnArreglo.class`:

```text
newarray       int        // new int[4]
anewarray #7   // class java/lang/String   → new String[2]
iastore / iaload           // numericos[0] = 7 / numericos[0]
aastore / aaload           // nombres[1] = "envio" / nombres[1].length()
```

Cuatro instrucciones distintas según el tipo de componente: `newarray` lleva un **tipo básico** como operando
(`T_INT`), `anewarray` lleva una **referencia a clase**; para guardar hay `iastore` (entero) y `aastore`
(referencia), y para leer `iaload` y `aaload`. Nada de esto hace una llamada a método. El acceso a una casilla
es una instrucción de un solo operando implícito: la comprobación de cota y la aritmética están en la JVM. El
método auxiliar devuelve `12`, y eso es `7 + "envio".length()` —es decir, `iaload` y `aaload` en la misma
expresión.

**Los dos recorridos son el mismo recorrido.** Medido sobre `LLEGADA` (cinco pesos):

```text
suma con indice: 13390 · suma con for-each: 13390
```

El `for`-each sobre un arreglo **no copia** el arreglo: el compilador emite un índice escondido, igual que el
`for` clásico (en M3 · tema 3 se comparó el bytecode). Necesitas el índice en tres casos, y los tres aparecen
en este módulo: cuando **escribes** (`gramos[1] = 3400`), cuando comparas con la casilla anterior o siguiente
(tema 6: `ordenado[desde] <= tope`), y cuando recorres hacia atrás o desde en medio (`copyOfRange`).
`arreglo vacio: length 0 · la suma de sus elementos es 0` cierra el caso límite: los dos bucles hacen cero
vueltas sin preguntar.

**La cota existe, y es barata.** Medido en `tema-1/errores/`:

```text
java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5
java.lang.ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 3
```

El mensaje trae el índice y la longitud porque la JVM los tiene en el momento de la comprobación. La primera
es la errata de siempre (`i <= v.length`); la segunda recuerda que el agujero está en **los dos lados**, y que
no hace falta un bucle para caer: una resta (`int anterior = 0 - 1`) basta. Ninguna de las dos se puede
capturar «por si acaso» con sentido: si el índice está mal, el programa está mal; se arregla el límite, no se
añade un `try`.

#### 7. Código ejecutable

**Ejemplo mínimo** · archivo `tema-1/CrearYRecorrer.java` · ejecuta
`javac --release 25 -d out tema-1/CrearYRecorrer.java && java -Dstdout.encoding=UTF-8 -cp out CrearYRecorrer`

```java
// M4 · Tema 1 · Las tres formas de crear un arreglo y como se recorre cada una.
public class CrearYRecorrer {

    // 1. Literal, en la declaracion: solo funciona aqui, no como expresion suelta.
    static final int[] LLEGADA = {1250, 3400, 890, 7600, 250};

    // 2. Tamano primero: se crean los huecos, vacios de contenido.
    static int[] porTamano(int n) {
        return new int[n];
    }

    // 3. Tamano y contenido a la vez, con la expresion new int[] {...}.
    static int[] porExpresion() {
        return new int[] {1250, 3400, 890};
    }

    public static void main(String[] args) {
        System.out.println("llegada   : longitud " + LLEGADA.length + " · primer indice 0 = " + LLEGADA[0]
                + " · ultimo indice " + (LLEGADA.length - 1) + " = " + LLEGADA[LLEGADA.length - 1]);
        System.out.println("porTamano(3): longitud " + porTamano(3).length + " · su primer valor es " + porTamano(3)[0]);
        System.out.println("porExpresion: longitud " + porExpresion().length);

        int suma = 0;
        for (int i = 0; i < LLEGADA.length; i++) {
            suma += LLEGADA[i];
        }
        int sumaForEach = 0;
        for (int peso : LLEGADA) {
            sumaForEach += peso;
        }
        System.out.println("suma con indice: " + suma + " · suma con for-each: " + sumaForEach);

        // length es un campo, no un metodo: no lleva parentesis.
        int[] vacio = new int[0];
        System.out.println("arreglo vacio: length " + vacio.length + " · la suma de sus elementos es " + suma(vacio));

        // Reasignar un arreglo si se puede; lo que exige "new" es que no sea una declaracion.
        int[] salida = new int[5];
        salida = new int[] {1250, 3400, 890};
        System.out.println("reasignado: empezo con length 5, ahora length " + salida.length + " · [0] = " + salida[0]);
    }

    static int suma(int[] v) {
        int s = 0;
        for (int x : v) {
            s += x;
        }
        return s;
    }
}
```

Salida completa, pegada de la corrida:

```text
llegada   : longitud 5 · primer indice 0 = 1250 · ultimo indice 4 = 250
porTamano(3): longitud 3 · su primer valor es 0
porExpresion: longitud 3
suma con indice: 13390 · suma con for-each: 13390
arreglo vacio: length 0 · la suma de sus elementos es 0
reasignado: empezo con length 5, ahora length 3 · [0] = 1250
```

**Ejemplo de valores por defecto** · archivo `tema-1/ValoresPorDefecto.java` · ejecuta
`java -Dstdout.encoding=UTF-8 tema-1/ValoresPorDefecto.java`

```java
int[] gramos = new int[3];
long[] distancia = new long[2];
double[] importe = new double[2];
boolean[] urgente = new boolean[2];
char[] iniciales = new char[2];
String[] guias = new String[2];

System.out.println("int    [3]: " + gramos[0] + " " + gramos[1] + " " + gramos[2]
        + " · su clase es " + gramos.getClass());
// ... las otras cinco
System.out.println("0 == false ? no compila; 0.0 == 0 ? " + (0.0 == 0) + "; null == null ? " + (null == null));

gramos[1] = 3400;   // escribir en una casilla no toca las vecinas
System.out.println("tras gramos[1] = 3400: " + gramos[0] + " " + gramos[1] + " " + gramos[2]
        + " · suma " + (gramos[0] + gramos[1] + gramos[2]));
```

```text
int    [3]: 0 0 0 · su clase es class [I
long   [2]: 0 0
double [2]: 0.0 0.0
boolean[2]: false false
char   [2]: u+000 (cero) · u+000 (cero)
String [2]: null · null · componente class java.lang.String
0 == false ? no compila; 0.0 == 0 ? true; null == null ? true
tras gramos[1] = 3400: 0 3400 0 · suma 3400
```

El detalle que hay que no perderse: `pinta(char)` convierte el carácter a entero y lo imprime como `u+000
(cero)`. Si imprimieras `iniciales[0]` a secas no verías **nada** en la terminal —el carácter cero es
invisible—, y esa es la razón por la que un `char[]` «parece vacío» cuando en realidad está lleno de `\u0000`.

**Por dentro** · `tema-1/por-dentro/FormaDeUnArreglo.java` (`javap -c` incluido en las líneas de Nivel 3).
**Proyecto guía** · `src/main/java/rutaflow/nucleo/Manifiesto.java`, método `gramos(String[])`: crea
`new int[guias.length]` y rellena casilla por casilla —es la forma 2 con valores de la forma 3— y su salida
medida es `gramos leidos : [1250, 3400, -1, 890, 700, 2100]`, donde el `-1` es la guía malformada que **no**
es un peso sino el marcador que el programa acordó (M3 · tema 4).

#### 8. Mini-laboratorio

Escribe los archivos desde cero en `laboratorios/modulo-4/tema-1/` (no copies y pegues: el ejercicio es
predecir y comprobar).

1. Crea `MisCasilleros.java` con tres arreglos de 4 casillas: `int`, `double`, `String`. Imprime cada casilla
   **antes** de escribir en ninguna, y su `getClass().getName()`. Escribe en un comentario qué esperas ver en
   las cuatro de `String` antes de ejecutar. Ejecuta: si el comentario decía `""` está mal; son `null`, y la
   diferencia aparece en el paso 4.
2. En el mismo archivo, suma los cuatro `int` (esperarás `0`), luego escribe `= 1250` en la casilla 2 y vuelve
   a sumar. Imprime las cuatro casillas. Comprueba que las otras tres siguen intactas: eso es lo que significa
   que el arreglo sea memoria contigua con casillas independientes.
3. Recorre `int[] pesos = {1250, 3400, 890, 7600, 250}` de cuatro formas: `for` con índice ascendente, `for`
   con índice descendente, `for`-each, y `while` con un contador fuera. Las cuatro deben imprimir `13390`.
   Después cambia **una sola** letra del primer bucle (`<` por `<=`) y ejecuta: copia el mensaje exacto en un
   comentario y anota la línea que lo produce. Devuelve la letra.
4. Crea `TrampaNull.java` con `String[] guias = new String[3];` y un `for`-each que imprima
   `guia.length()`. Compila (no hay error) y ejecuta: anota qué dice el mensaje y por qué el compilador no te
   avisó. Contrasta con el paso 1: la casilla «vacía» de un arreglo de referencias no es una cadena vacía.
5. Crea `NoCompilan.java` y escribe, de uno en uno, los dos casos que el tema dice que son ilegales:
   `int[] x = new int[5]; x = {1, 2, 3};` y `System.out.println(x.length());` sobre un arreglo. Pega en un
   comentario el mensaje de `javac` de cada uno y escribe por qué el primero es un error de **sintaxis** y el
   segundo de **resolución de símbolos**.

**Listo cuando** el paso 3 produzca `13390` en las cuatro formas; cuando sepas decir, sin ejecutar, el valor
por defecto de `long[]`, `char[]` y `Thread[]` (`0`, `\u0000`, `null`); y cuando el paso 5 te dé dos mensajes
distintos de `javac` que no confundas: `illegal start of expression` es estructura,
`cannot find symbol · method length()` es que estás buscando un método que no existe.

#### 9. Verificación

```bash
cd docs/reestructuracion/cursos/java/laboratorios/modulo-4
javac --release 25 -encoding UTF-8 -d out tema-1/*.java
java -Dstdout.encoding=UTF-8 -cp out CrearYRecorrer        # «suma con indice: 13390 · suma con for-each: 13390»
java -Dstdout.encoding=UTF-8 -cp out ValoresPorDefecto     # seis ceros distintos y «suma 3400»
java -Dstdout.encoding=UTF-8 tema-1/errores/IndiceHastaLength.java     # Index 5 out of bounds for length 5
java -Dstdout.encoding=UTF-8 tema-1/errores/IndiceNegativo.java        # Index -1 out of bounds for length 3
javac --release 25 -d /tmp/m4e tema-1/errores/ConfundeParentesisConLength.java    # cannot find symbol
javac --release 25 -d /tmp/m4e tema-1/errores/InicializadorFueraDeDeclaracion.java # illegal start of expression
javac -d /tmp/m4b tema-1/por-dentro/FormaDeUnArreglo.java && javap -c -cp /tmp/m4b FormaDeUnArreglo  # newarray, iastore
```

O, todo el módulo de una vez: `GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts"
./verificar.sh`. Aquí esas **25** comprobaciones del tema pasan con Temurin 27 y `--release 25`; con JDK 25 en
el `PATH` basta `./verificar.sh`.

*Pendiente de reejecución en JDK 25:* el texto de `ArrayIndexOutOfBoundsException` («Index 5 out of bounds for
length 5») lo construye la JVM; la **redacción** la fijó el cambio que añadió las dos cifras, pero conviene
confirmar con el ejecutable 25 que sigue igual que aquí. Lo que **no** cambia entre los dos ejecutables: los
valores por defecto, las firmas `[I` y `[Ljava.lang.String;`, las instrucciones `newarray`/`anewarray`/
`iastore`/`aastore` y la existencia del campo `length`.

#### 10. Error común y diagnóstico

**Síntoma 1 — «el arreglo tiene 5 elementos pero el bucle revienta en el quinto».** Es el límite mal escrito.
Salida real de `tema-1/errores/IndiceHastaLength.java`:

```text
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5
	at IndiceHastaLength.main(IndiceHastaLength.java:9)
```

**Causa:** `for (int i = 0; i <= llegada.length; i++)`. Con `<=` el bucle da `length + 1` vueltas: la última
pide la casilla que no existe. **Arreglo:** `<`, o mejor, `for (int peso : llegada)` si no escribes. Y si
necesitas el índice y el recorrido es raro, escribe el rango como comentario (`// i = 0..length-1`) antes del
bucle: es lo que hace `tema-1/errores/IndiceNegativo.java` con `// bien: 2, 1, 0. nunca -1`.

**Síntoma 2 — `cannot find symbol` sobre algo que sí existe.** Salida real de
`tema-1/errores/ConfundeParentesisConLength.java`:

```text
ConfundeParentesisConLength.java:9: error: cannot find symbol
        System.out.println("arreglo: " + llegada.length()); // mal: el arreglo tiene campo, no metodo
                                                ^
  symbol:   method length()
  location: variable llegada of type int[]
```

**Causa:** copiar el hábito de `String`. El mensaje es un buen mensaje: dice **qué** buscaba (`method
length()`), **dónde** (`variable llegada of type int[]`) y por tanto **qué tiene** en su lugar. **Arreglo:**
`llegada.length`. Y si de verdad querías saber cuántos caracteres tiene un elemento, `llegada[0]` es un `int`:
no tiene caracteres.

**Síntoma 3 — «sí puse las llaves, ¿por qué ni siquiera compila?». Salida real de
`tema-1/errores/InicializadorFueraDeDeclaracion.java`:**

```text
InicializadorFueraDeDeclaracion.java:7: error: illegal start of expression
        llegada = {1250, 3400, 890};   // mal: las llaves sin "new" solo van en la declaracion
                  ^
InicializadorFueraDeDeclaracion.java:7: error: not a statement
InicializadorFueraDeDeclaracion.java:7: error: ';' expected
```

**Causa:** el inicializador con llaves **sin `new`** solo es válido en una declaración. En una asignación suelta
la gramática no tiene ninguna producción para una llave, así que `javac` emite tres errores del mismo sitio: no
son tres bugs, es uno. **Arreglo:** `llegada = new int[] {1250, 3400, 890};` —o `System.arraycopy` /
`Arrays.copyOf` si querías escribir **dentro** del arreglo existente y no sustituirlo (eso es el tema 2). El
detalle pedagógico: si reasignas, `llegada.length` pasa a `3` y el arreglo de 5 casillas queda para el
recolector. Medido en `CrearYRecorrer`: `empezo con length 5, ahora length 3`.

**Error de ejecución silencioso (no está en `errores/` porque no falla).** Un arreglo de `String` recién
creado y recorrido con `for`-each imprime `null` y **no** lanza; el `NullPointerException` llega cuando alguien
llama a un método en esa casilla. `ValoresPorDefecto` lo muestra sin trampa:
`String [2]: null · null`. La prevención es de tipo de datos, no de bucle: si puede faltar una guía, el modelo
es `Optional` o un centinela explícito (`-1` para los pesos, como hace el proyecto guía), nunca «ya veré el
`null` al recorrer».

#### 11. Pregunta con respuesta modelo

**Comprensión.** `int[] a = new int[3];` — ¿cuánto vale `a[0]` y qué se imprimiría con
`System.out.println(a[0] == false)`?

**Respuesta modelo:** vale `0`, medido (`int    [3]: 0 0 0`). Lo segundo **no compila**: `int` y `boolean` no
se comparan en Java, así que la comparación `a[0] == false` es el mismo error que `if (n = 6)` del tema 1 de
M3. Sí se puede comprobar lo otro: `0.0 == 0` da `true` (promoción a `double`) y `null == null` da `true`, y
eso es lo que hace peligroso un `String[]` nuevo: sus casillas comparan iguales a `null` sin que nada avise.

**Comprensión.** ¿Qué es `[[I`?

**Respuesta modelo:** el nombre de la clase de un `int[][]`, medido en `FormaDeUnArreglo`. Cada `[` es una
dimensión de arreglo, y la letra final es el tipo de la **última** casilla (`I` = `int`, `L` = referencia,
seguida del nombre). La consecuencia que importa: `getComponentType()` de `int[][]` es `[I`, es decir, un
arreglo de `int` —por eso una «matriz» de Java es un arreglo de arreglos y no un bloque rectangular, y por eso
puede ser irregular (tema 2).

**Entrevista.** Te pasan este código y te piden decir qué imprime y qué está mal:

```java
String[] guias = new String[3];
for (String g : guias) System.out.println(g.length());
```

**Respuesta modelo:** compila y lanza. `new String[3]` deja tres `null`, no tres `""` (medido:
`String [2]: null · null`), así que la primera vuelta da `NullPointerException` al llamar `length()`. Y hay un
segundo problema oculto en la pregunta: aunque las casillas trajeran cadenas, el `for`-each **no puede
escribir** —para rellenar un arreglo nuevo necesitas el índice. El arreglo de referencias tiene dos estados
distintos de «vacío» (`null` y `""`) y un programa que no los distinga es el que revienta en producción. El
tercer detalle, si te lo preguntan: `String.length()` es un **método** y `arreglo.length` es un **campo**, y
eso es otra diferencia.

#### 12. Cuándo usarlo y cuándo no

| Úsalo | No lo uses |
|---|---|
| Cantidad de elementos conocida y fija (los pesos de **un** manifiesto leído) | Elementos que llegan y se van: `ArrayList` (tema 4) |
| Acceso por posición y recorridos con salto o hacia atrás | Búsqueda por contenido: un mapa o una lista, no un `for` a mano |
| Tipos primitivos en bloque, sin cajas (`int[]`, `double[]`) | Colección de `int` con `add`/`remove`: `List<Integer>` paga el autoboxing (tema 5) |
| Interop con API que devuelve arreglos (`Arrays.copyOf`, `split`, `args`) | Como tipo de campo expuesto de una clase: devuelves la memoria viva, y quien llama escribe en tus casillas (M3 · tema 4 midió que mudar una casilla **sí** se ve fuera) |

**Costo:** el arreglo no tiene sobrescritura por elemento —acceder es una instrucción (`iaload`/`aaload`) con
una comprobación de cota—, y por eso `new int[n]` seguido de un recorrido es la forma barata. Lo que cuesta es
la **rigidez**: la longitud va en la cabecera del objeto y no cambia nunca (medido: reasignar da otro arreglo,
`length 3`), así que «añadir» un elemento es crear otro arreglo y copiar (tema 2: `Arrays.copyOf`) o cambiar de
estructura (tema 4). Y cuesta la **falsa seguridad** del tipo: un arreglo de referencias acepta `null` sin
preguntar, y eso se arregla en el tema 3 cuando veamos lo que `Object[]` **sí** rechaza, que es otra cosa.

---

### Tema 2: Arreglos multidimensionales y la clase `Arrays`: ordenar, copiar, comparar y buscar · Básico · 45 min

#### 1. Ubicación y prerrequisitos

Curso Java · tramo Fundamentos · módulo 4 · segundo tema. Antes: [Tema 1](#tema-1-arreglos-creacion-valores-por-defecto-recorrido-y-arrayindexoutofboundsexception)
de este módulo (crear, recorrer y los valores por defecto: aquí `new int[3][]` es exactamente ese tema aplicado
dos veces) y [Módulo 3 · tema 3](modulo-3.md) (bucle anidado y `break`/`continue`). Después: el tema 3 usa la
idea de «componente» para explicar la covarianza; el tema 4 usa `Arrays.asList` como puente hacia
`ArrayList`; el tema 6 usa `Arrays.sort` y `Arrays.binarySearch` como la referencia contra la que se miden
los algoritmos escritos a mano. Versión: JDK 25.

#### 2. Objetivo

Al terminar sabes decir qué es realmente una matriz en Java (un arreglo cuyo componente es otro arreglo, y por
eso puede ser irregular) y recorrerla con las dos escrituras sin escribir fuera de una fila; sabes para qué
sirve cada método de `Arrays` que vas a usar a diario (`sort`, `binarySearch`, `copyOf`, `copyOfRange`,
`fill`, `equals`, `mismatch`, `toString`, `deepToString`, `asList`) y qué significa el negativo que devuelve
`binarySearch`; sabes por qué `Arrays.toString` de una matriz no sirve y qué hace `deepToString`; y puedes
reproducir los tres fallos típicos: llamar `pesos.sort()`, dejar las filas en `null`, y esperar una lista de
números de `Arrays.asList(int[])`.

#### 3. Por qué importa

El manifiesto de carga de `rutaflow-nucleo` deja de ser un vector cuando el camión tiene **varias paradas**: lo
que tienes es un arreglo por parada, y eso es una matriz. Si crees que una matriz es un bloque rectangular,
escribes el bucle interno con la longitud de la matriz (`POR_FILA.length` en vez de `POR_FILA[fila].length`) y
el programa se cae en la segunda fila. El dato medido de este tema es justo ese: la misma variable `POR_FILA`
imprime `2 filas`, `3 columnas`, `3 columnas`, y la irregular `filas 3 · longitudes 2 1 4`.
Y la segunda parte —`Arrays`— importa porque es la diferencia entre contar 21 comparaciones o 14 (tema 6) y
entre **ordenar** o buscar en lo desordenado: medido aquí, `binarySearch` sobre un arreglo desordenado dice
que 890 **no está** cuando está en el índice 3. Eso no es lento: es mentira, y llega a producción como un
paquete que no se factura.

#### 4. Analogía

Un **edificio de trasteros** con portales independientes. La «matriz» es la lista de portales: un arreglo
cuyos elementos son otros arreglos (los trasteros de ese portal). No hay un plano único: el conserje solo
tiene una lista de llaveros, y cada llavero tiene su número de huecos. Por eso el portal 1 puede tener 2
trasteros y el portal 3 tener 4 —el edificio no se entera ni se tuerce.

- `Arrays.sort` es **reordenar los llaveros dentro de un llavero**. No pregunta: ordena. `Arrays.binarySearch`
  es la **bibliotecaria** que busca por la mitad: funciona solo si el estante ya está ordenado, y si le das un
  estante desordenado no te dice «no sé»: te dice una posición o te dice que no está. A veces acierta (medido:
  1250 cae en el índice 2 por casualidad) y a veces miente (890 sale `-1`).
- El negativo de `binarySearch` es un **número de calle con dos informaciones**: `-(punto de inserción) - 1`.
  Medido: buscar 1000 en `[250, 890, 1250, 3400, 7600]` devuelve `-3`, y `-(-3) - 1 = 2` es el hueco donde
  tendría que estar.
- `Arrays.copyOf(pesos, 7)` es **cambiar el llavero por uno más largo** y copiar las llaves: el sobrante sale
  con el valor por defecto (`0`), medido: `[250, 890, 1250, 3400, 7600, 0, 0]`. El llavero viejo no crece.
- `Arrays.asList(zonas)` es **un estuche transparente encima del llavero**: ves las mismas llaves, puedes
  cambiarlas de sitio, pero no meter una sexta.

**Dónde se rompe la analogía:** la bibliotecaria de verdad se da cuenta de que el estante está desordenado;
`binarySearch` no hace **ninguna** comprobación de orden (su firma es `binarySearch(int[], int)` y no recibe
criterio). Y el estuche transparente de `asList` es más agresivo de lo parece: no es solo lectura —`set`
escribe **en el arreglo original**, medido: tras `vista.set(0, "Envigado")` el arreglo `zonas` pasa a
`[Envigado, Bogota, Cali]`.

#### 5. Diagrama

```mermaid
flowchart TB
    subgraph HEAPI["heap"]
        M["cabecera int[][] · length = 2"]
        M -->|"casilla 0"| F0["cabecera int[] · length = 3"]
        M -->|"casilla 1"| F1["cabecera int[] · length = 3"]
        F0 --> A0["1250"]
        F0 --> A1["3400"]
        F0 --> A2["890"]
        F1 --> B0["7600"]
        F1 --> B1["250"]
        F1 --> B2["100"]
    end
    S["Arrays.sort(pesos)"] -->|"int[] → DualPivotQuicksort.sort (invokestatic, medido)"| Q["orden in-place<br/>[250, 890, 1250, 3400, 7600]"]
    Q --> SB["Arrays.binarySearch(1000)"]
    SB -->|"no está"| NEG["devuelve -3<br/>-(punto de inserción) - 1 → 2"]
```

**Texto alternativo:** arriba, la matriz real: **un** objeto `int[][]` con dos casillas que apuntan a **dos**
objetos `int[]` distintos, cada uno con su `length`. Nada es contiguo entre filas, y por eso el bucle interno
usa la longitud de la fila. Abajo, la biblioteca: `sort` de `int[]` no llama a ningún comparador —el bytecode
de `java.util.Arrays` muestra `invokestatic java/util/DualPivotQuicksort.sort:([IIII)V`— y deja el arreglo
ordenado en el sitio; sobre ese arreglo ordenado `binarySearch(1000)` devuelve `-3`, que es la fórmula del
hueco, no un error.

#### 6. Explicación

**Nivel 0 — una matriz es un arreglo de arreglos.** Medido en `tema-2/Matrices.java`:

```text
longitud de la matriz : 2 filas
longitud de la fila 0 : 3 columnas
longitud de la fila 1 : 3 columnas
elemento [1][0]       : 7600
```

`POR_FILA.length` responde cuántas **filas**; `POR_FILA[0].length` cuántas columnas tiene *esa* fila. Son dos
campos `length` de dos objetos distintos. `POR_FILA[1][0]` son dos accesos encadenados: primero la casilla 1
(que es una referencia a un `int[]`), luego la casilla 0 de ese arreglo.

**Nivel 0 — el recorrido correcto y por qué el otro no.** El bucle anidado de `Matrices` escribe el límite
interior con la longitud **de la fila**, y hay un error entero (`tema-6/errores/BurbujaFueraDeRango.java` es
ese mismo bug en otro sitio) que se paga con `Index 4 out of bounds for length 4`. Salida medida de los dos
recorridos:

```text
recorrido con dos indices:
  fila 0 suma 5540
  fila 1 suma 7950
recorrido con for-each anidado:
  fila de 3 columnas suma 5540
  fila de 3 columnas suma 7950
```

Nótese qué dice la segunda forma: `for (int[] fila : POR_FILA)` recorre **arreglos**, no enteros. El tipo de la
variable del `for`-each es el **componente** de la matriz. Si te parece raro, es porque el tema 1 ya te dijo
`componente del int[][] : [I`.

**Nivel 1 — irregular es normal.** Medido: `irregular: filas 3 · longitudes 2 1 4`. Se construye en dos pasos:
`new int[3][]` fija las filas y deja las referencias de fila en `null` (¡el valor por defecto del tema 1!);
luego cada `m[i] = new int[] {...}` crea una fila del tamaño que toque. El fallo `errores/FilaNula.java` hace
exactamente eso y olvida el segundo paso:

```text
fila 0: null
recorro las tres filas:
  fila 0 tiene 2 columnas
Exception in thread "main" java.lang.NullPointerException: Cannot read the array length because "porFila[i]" is null
```

El mensaje es el de la JVM con `-g` activado (la variable se nombra): la casilla 0 sí tenía fila porque el
programa la asignó; la casilla 1 nunca se creó, y lo que revienta no es el índice sino **leer `length` de un
`null`**. No es un `ArrayIndexOutOfBoundsException`: es un `NullPointerException`, y esa diferencia es el
diagnóstico.

**Nivel 1 — `final` no significa «inmutable» (tercera vez en el curso, y aquí duele).** `POR_FILA` es
`static final`, y el programa escribe `POR_FILA[0][0] = 9999` sin quejarse:
`tras POR_FILA[0][0] = 9999 -> fila 0: 9999 · fila 1: 7600`. Lo congelado es la referencia a la matriz; las
casillas de las filas son memoria libre. Y `clone()` sobre una matriz es **superficial**, medido:

```text
clone es superficial: original[0][0]=1 · copia[0][0]=1 (misma fila: true)
```

La copia tiene sus propias casillas de fila, pero esas casillas apuntan a **las mismas filas**. `copiado[0] ==
POR_FILA[0]` es `true`, así que escribir en la copia se ve en el original. Copia profunda: bucle explícito o
`Arrays.setAll` (M12), nunca `clone`.

**Nivel 2 — la clase `Arrays` es estática porque los arreglos no tienen métodos.** El error
`errores/SinMetodosPropios.java` es la prueba:

```text
errores/SinMetodosPropios.java:9: error: cannot find symbol
        pesos.sort();                        // mal: int[] no tiene metodo sort
             ^
  symbol:   method sort()
  location: variable pesos of type int[]
```

Medidas, las operaciones del día a día (`tema-2/UsosDeArrays.java`):

```text
antes  : [7600, 250, 1250, 890, 3400]
ordenado: [250, 890, 1250, 3400, 7600]
binarySearch(890)  : 1
binarySearch(1250) : 2
binarySearch(1000) : -3 · deberia ir en el indice 2
copyOf(...,7)      : [250, 890, 1250, 3400, 7600, 0, 0]
copyOfRange(1,3)   : [890, 1250] · length 2
fill(5,7,42)       : [250, 890, 1250, 3400, 7600, 42, 42]
igualdad: == false · equals true · equals del propio true
primeros 2 iguales: true
mismatch           : -1 ( -1 = no difiere en nada)
```

Cuatro lecturas de esa salida:

1. `sort` es **en el sitio**: no devuelve nada, muta el arreglo que le pasas (por eso `antes`/`ordenado` usan
   la misma variable).
2. `binarySearch(1000)` = `-3`. La regla es `-(insersión) - 1`, y el `-1` extra existe para que «debería ir en
   el índice 0» no se confunda con «encontrado en el índice 0» (esos dos son `-1` y `0`).
3. `copyOf` alargar **rellena con el valor por defecto** (`0, 0`): es la misma promesa del tema 1.
   `copyOfRange(1,3)` es el intervalo `[1, 3)`: dos elementos, `length 2` —el extremo derecho no entra, como
   en `substring` de M2.
4. `equals` compara contenido, `==` compara identidad (`== false · equals true`). `mismatch` dice **en qué
   índice** empiezan a diferir y devuelve `-1` cuando no difieren en nada, que es el camino inverso de la
   convención de `binarySearch` —aquí `-1` sí es buena noticia. Compara rangos: `Arrays.equals(pesos, 0, 2,
   gemelo, 0, 2)` da `true`.

**Nivel 2 — con matrices, la capa de `Arrays` se queda arriba.** Medido con `int[][] m = {{1, 2}, {3, 4}}`:

```text
toString            : empieza '[[I' y tiene '@' si · 2 trozos
deepToString        : [[1, 2], [3, 4]]
equals / deepEquals : false / true
```

`Arrays.toString(m)` llama al `toString` de cada **fila**, y un arreglo no tiene `toString` útil: sale
`[[I@610455d6, [[I@5119fb47]`. Por eso el documento no imprime esas direcciones (son *hash de identidad* y
cambian en cada corrida): lo que se comprueba es que **empieza** con `[[I`, que **contiene** `@`, y que corta
en **2 trozos** por la coma —tres hechos deterministas en lugar de una cifra que nadie puede reproducir.
`deepToString` sí baja: `[[1, 2], [3, 4]]`. Y `Arrays.equals(m, n)` es `false` con dos matrices de idéntico
contenido porque compara las filas **por referencia**; `deepEquals` recorre y da `true`. Regla práctica: en
dos dimensiones, todo el que no lleve `deep` compara direcciones.

**Nivel 2 — `asList` es una vista, y esa vista escribe.** Medido:

```text
tras vista.set(0)   : arreglo [Envigado, Bogota, Cali] · vista [Envigado, Bogota, Cali]
```

`Arrays.asList` devuelve una `List` **respaldada** por el arreglo: `set` escribe en el arreglo, y cambiar el
arreglo se ve en la lista. Su longitud es la del arreglo, así que `add` no tiene dónde ir:
`errores/AnadeAAsList.java` lanza `java.lang.UnsupportedOperationException` desde
`java.base/java.util.AbstractList.add(AbstractList.java:155)`. (El número de línea de la biblioteca no es un
dato del curso: lo que se comprueba aquí es el tipo de excepción y que la vista tiene `size 3` antes de fallar.)
Y la trampa del mismo método, medido en `tema-2/UnaListaDeUnArreglo.java`:

```text
List<int[]>  : size 1
               su UNICO elemento es de clase [I
List<Integer>: size 3 · suma 5540
```

`Arrays.asList(int[])` **no** es una lista de números: el parámetro es `T...`, un `int[]` no se convierte en
`Integer[]`, así que `T` se infiere `int[]` y la lista tiene **un** elemento. Con `Integer[]` salen tres. El
mismo error, escrito como asignación a `List<Integer>`, ni siquiera compila
(`errores/AsListDePrimitivos.java`):

```text
error: incompatible types: inference variable T has incompatible bounds
    equality constraints: Integer
    lower bounds: int[]
```

**Nivel 3 — cómo se crea una matriz en bytecode.** Medido con `javap -c` sobre
`tema-2/por-dentro/FormaDeUnaMatriz.class`: `new int[2][3]` es **una sola** instrucción,
`multianewarray #7, 2 // class "[[I"` (el `2` son las dimensiones), mientras que crear fila por fila emite
`anewarray #9 // class "[I"` para el contenedor y luego **un `newarray int` por fila**. Y las dos matrices
«son la misma clase» —medido: `misma clase? : true`—: `[[I` no dice nada de la rectangularidad. Lo rectangular
es una convención tuya, no una propiedad del objeto.

Salida completa de `FormaDeUnaMatriz`:

```text
clase de int[][]     : [[I · filas 2
clase de una fila    : [I · columnas 3
componente del entero: [I
componente de la fila: int
misma clase?         : true
cambiar la fila fuera: r[0][0] = 9999
irregular en columnas: 3 y 7 · misma clase: true
```

**Nivel 3 — y qué elige la biblioteca al ordenar.** No es una etiqueta de manual: `javap -c -p
java.util.Arrays` muestra que `sort(int[])` termina en `invokestatic java/util/DualPivotQuicksort.sort:([IIII)V`
y que `sort(Object[])` mira un flag (`Arrays$LegacyMergeSort.userRequested`) y si no está activado llama a
`invokestatic java/util/ComparableTimSort.sort:...`. Es decir: para primitivos, *quicksort* de dos pivotes *in
place* (no puede usar `compareTo`, no hay objetos que comparar); para referencias, ordenación **estable**
(Timsort), porque aquí sí importa que dos elementos iguales conserven su orden relativo. Esto se usa en serio
en el tema 6 y en M21.

#### 7. Código ejecutable

**Ejemplo mínimo** · archivo `tema-2/Matrices.java` · ejecuta
`javac --release 25 -d out tema-2/Matrices.java && java -Dstdout.encoding=UTF-8 -cp out Matrices`

```java
public class Matrices {
    static final int[][] POR_FILA = {
        {1250, 3400, 890},     // Medellin
        {7600, 250, 100}       // Bogota
    };

    static int[][] irregular() {
        int[][] m = new int[3][];     // solo se fijan las FILAS; las columnas quedan null
        m[0] = new int[] {1250, 3400};
        m[1] = new int[] {890};
        m[2] = new int[] {7600, 250, 100, 45};
        return m;
    }

    public static void main(String[] args) {
        System.out.println("longitud de la matriz : " + POR_FILA.length + " filas");
        System.out.println("longitud de la fila 0 : " + POR_FILA[0].length + " columnas");
        System.out.println("elemento [1][0]       : " + POR_FILA[1][0]);

        for (int fila = 0; fila < POR_FILA.length; fila++) {
            int suma = 0;
            for (int col = 0; col < POR_FILA[fila].length; col++) {   // la longitud DE LA FILA, no la de la matriz
                suma += POR_FILA[fila][col];
            }
            System.out.println("  fila " + fila + " suma " + suma);
        }
        // ... for-each anidado, irregular(), final + mutación, y clone() superficial
    }
}
```

Salida completa medida (las líneas que faltan en el recorte están todas en la sección 6):

```text
longitud de la matriz : 2 filas
longitud de la fila 0 : 3 columnas
longitud de la fila 1 : 3 columnas
elemento [1][0]       : 7600
recorrido con dos indices:
  fila 0 suma 5540
  fila 1 suma 7950
recorrido con for-each anidado:
  fila de 3 columnas suma 5540
  fila de 3 columnas suma 7950
irregular: filas 3 · longitudes 2 1 4
tras POR_FILA[0][0] = 9999 -> fila 0: 9999 · fila 1: 7600
clone es superficial: original[0][0]=1 · copia[0][0]=1 (misma fila: true)
```

**Ejemplo de biblioteca** · `tema-2/UsosDeArrays.java` (todo lo de Nivel 2 anterior, ejecutado). Su salida
íntegra son las 12 líneas citadas más las 3 de la matriz y la del `asList`.

**El fallo silencioso** · `tema-2/BuscaSinOrdenar.java` · salida completa medida:

```text
desordenado: [7600, 250, 1250, 890, 3400]
  binarySearch(1250) = 2 · adivina el indice 2 por casualidad
  binarySearch(890)  = -1 · dice que no esta, y SI esta en el indice 3
ordenado   : [250, 890, 1250, 3400, 7600]
  binarySearch(1250) = 2
  binarySearch(890)  = 1
busco 9999 (no esta) en el desordenado: -6
busco 9999 (no esta) en el ordenado   : -6
```

Las dos últimas líneas son las que hay que leer despacio: **el mismo resultado para los dos arreglos**, cuando
uno está ordenado y el otro no. `binarySearch` no puede decirte que lo usaste mal; `-6` aquí salió por
casividad en el caso desordenado. En cambio `-1` para el 890 presente es un falso negativo con consecuencias:
cualquier `if (buscado < 0) { /* no existe */ }` sobre un arreglo desordenado decide con datos inventados.

**Proyecto guía** · `src/main/java/rutaflow/nucleo/Manifiesto.java`, `mayoresQue(int[], int)`: filtra con
`sinMalformados`, **clona** antes de ordenar (no muta el arreglo del llamador), ordena con `Arrays.sort` y
corta con `Arrays.copyOfRange`. Salida medida con `run`: `sobre el tope 1000 : [1250, 2100, 3400]`, donde el
corte vino después de ordenar y el `copyOfRange` es el `[desde, length)` de este tema.

#### 8. Mini-laboratorio

Escribe los archivos desde cero en `laboratorios/modulo-4/tema-2/`.

1. Crea `MiParada.java` con `int[][] paradas` de **tres** paradas y longitudes 2, 4 y 1 (declárala con el
   inicializador de llaves). Suma por parada con `for` de dos índices y con `for`-each anidado. Imprime las
   tres longitudes. Antes de ejecutar escribe qué imprime `paradas.length` y qué imprime `paradas[1].length`
   (son 3 y 4; si pusiste 4 y 4, confundes las dos preguntas).
2. Crea `OrdenYBusqueda.java` con `int[] pesos = {7600, 250, 1250, 890, 3400}`. Sin ordenar, busca 890 e
   imprime el resultado. Ordena. Vuelve a buscar las cuatro cifras `890`, `1250`, `1000`, `9999` y **predice**
   los cuatro resultados antes de ejecutar; imprime también `-r - 1` para los negativos. Pega la salida en un
   comentario.
3. Crea `CopiasYVistas.java`: haz `int[] original = {1250, 3400, 890}`, `int[] crecido =
   Arrays.copyOf(original, 5)`, `int[] trozo = Arrays.copyOfRange(original, 1, 3)` y `int[] gemelo =
   original.clone()`. Imprime las cuatro longitudes y luego responde con `Arrays.equals`: ¿`crecido` es igual a
   `original`? ¿y `gemelo`? ¿por qué uno da `true` y el otro también, siendo cosas distintas? (Uno es igual
   **en contenido**, el otro es igual **y además** es otra copia del mismo contenido; `==` los separa.)
4. Crea `LaVistaEscribe.java` con `String[] zonas = {"Medellin", "Bogota", "Cali"}`, saca la vista con
   `Arrays.asList`, cambia la casilla 0 de la **vista**, y luego cambia la casilla 1 del **arreglo**. Imprime
   los dos después de cada paso. Termina con `vista.add("Manizales")` en comentario, y anota el tipo exacto de
   excepción que produce al quitar el comentario.
5. Crea `MatrizProfunda.java` con `int[][] m = {{1, 2}, {3, 4}}` y `int[][] n` con el mismo contenido. Imprime
   `Arrays.equals(m, n)` y `Arrays.deepEquals(m, n)`, luego `Arrays.toString(m)` y `Arrays.deepToString(m)`.
   Escribe en un comentario por qué la primera comparación da `false` **siendo iguales** y qué tienen que ver
   las filas con eso.

**Listo cuando** el paso 2 acierte los cuatro resultados antes de ejecutar (o corrijas el comentario); cuando
en el paso 4 sepas decir sin dudar qué dos operaciones escriben en el arreglo original (`set` de la vista y
escribir en el arreglo) y cuál no existe (`add`); y cuando el paso 5 te deje explicando `equals` de matrices
como «compara referencias de fila».

#### 9. Verificación

```bash
cd docs/reestructuracion/cursos/java/laboratorios/modulo-4
java -Dstdout.encoding=UTF-8 tema-2/Matrices.java          # «fila 0 suma 5540», «longitudes 2 1 4», clone superficial
java -Dstdout.encoding=UTF-8 tema-2/UsosDeArrays.java      # «ordenado: [250, 890, 1250, 3400, 7600]», «binarySearch(1000) : -3»
java -Dstdout.encoding=UTF-8 tema-2/BuscaSinOrdenar.java   # «dice que no esta, y SI esta en el indice 3»
java -Dstdout.encoding=UTF-8 tema-2/UnaListaDeUnArreglo.java # «List<int[]> : size 1», «de clase [I»
java -Dstdout.encoding=UTF-8 tema-2/por-dentro/FormaDeUnaMatriz.java
javap -c -cp /tmp/m4b FormaDeUnaMatriz | grep -E 'multianewarray|anewarray'   # una vs. N instrucciones
javac --release 25 -d /tmp/m4e tema-2/errores/SinMetodosPropios.java   # symbol: method sort()
javac --release 25 -d /tmp/m4e tema-2/errores/AsListDePrimitivos.java  # inference variable T has incompatible bounds
java -Dstdout.encoding=UTF-8 tema-2/errores/FilaNula.java              # Cannot read the array length because "porFila[i]" is null
java -Dstdout.encoding=UTF-8 tema-2/errores/AnadeAAsList.java          # UnsupportedOperationException
```

Aquí esas **35** comprobaciones del tema pasan con Temurin 27 y `--release 25`, incluidas las dos de `javap`
(`multianewarray`, `anewarray`) y la que compara el `NullPointerException` **con** y **sin** `-g`: con `-g` el
mensaje nombra la expresión (`because "porFila[i]" is null`), sin ella nombra un registro local
(`because "<local1>[<local2>]" is null`). Es el mismo fenómeno de líneas `Unknown Source` que viste en M3 ·
tema 6, y de la misma causa: información de depuración que no viene en el `.class` por defecto.

*Pendiente de reejecución en JDK 25:* el **texto** del `UnsupportedOperationException` y su marco
`java.base/java.util.AbstractList.add(AbstractList.java:155)` —medido aquí, con los dos marcos de `java.base`
por delante del tuyo—; el tipo de excepción, el `size 1` de `List<int[]>` y el `equals`/`deepEquals` de
matrices son regla del lenguaje (un arreglo primitivo no es `Object[]`, y `equals` de `Arrays` compara
referencias de fila) y no cambian entre los dos ejecutables.

#### 10. Error común y diagnóstico

**Síntoma 1 — «ordeno y luego busco, y a veces no encuentra lo que sí está».** No es *a veces*: es siempre que
el arreglo estaba desordenado y la mitad por la que empezó la búsqueda no era la que tocaba. Medido:

```text
binarySearch(890)  = -1 · dice que no esta, y SI esta en el indice 3
```

**Diagnóstico:** imprime el arreglo **antes** de buscar, o parte la duda: `Arrays.equals(ordenado,
ordenadoAnterior)` no sirve para saber si está ordenado (no hay método «¿está ordenado?» en la biblioteca),
así que la comprobación honesta es tu propia pasada: `for (int i = 1; i < v.length; i++) if (v[i-1] > v[i])
{ ... }`. **Arreglo:** ordenar antes de buscar (y si el arreglo es del llamador, `clone()` primero, como hace
`Manifiesto.mayoresQue`), o no buscar: `linearSearch` del tema 6 no necesita orden y cuesta lo que dice.

**Síntoma 2 — `NullPointerException` al recorrer una matriz, en una línea que sí tiene un índice válido.**
Salida real de `tema-2/errores/FilaNula.java`:

```text
Exception in thread "main" java.lang.NullPointerException: Cannot read the array length because "porFila[i]" is null
```

**Causa:** `new int[3][]` crea **una** arreglo de 3 referencias, todas `null`. Los `new int[n]` de las filas
son otra operación. **Arreglo:** o `new int[3][4]` (rectangular, todas las filas creadas), o el bucle que las
crea. Y si la irregularidad es del dominio (paradas con distinto número de guías), el recorrido debe usar
`porFila[i].length`, nunca un `int columnas` global.

**Síntoma 3 — «`Arrays.asList` me da una lista y no puedo añadir».** No puedes porque la lista **es** el
arreglo con otra cara. Medido: `tamano de la vista: 3` y después `java.lang.UnsupportedOperationException`.
**Arreglo:** `new ArrayList<>(Arrays.asList(zonas))` si quieres una lista que crezca (tema 4), o
`Arrays.copyOf` si quieres un arreglo más largo —y recuerda que el sobrante de `copyOf` son `0`, medido en
`copyOf(...,7) : [..., 0, 0]`, no `null` en un arreglo de primitivos.

**Síntoma 4 — «una lista de los pesos» que imprime `size 1`.** Medido: `List<int[]> : size 1` y `su UNICO
elemento es de clase [I`. **Causa:** `asList` con un arreglo **de primitivos**; `T...` no puede partir un
`int[]`. **Arreglo:** `Integer[]` (con el coste del autoboxing que verás en el tema 5), o mejor: recorre el
arreglo y `add` a una lista (lo que hace `Manifiesto.gramosLista`). Y si intentaste asignar la lista de un
arreglo primitivo a `List<Integer>`, ni compila:

```text
error: incompatible types: inference variable T has incompatible bounds
```

**Errores de compilación reales** (medidos con `javac --release 25`):

```text
SinMetodosPropios.java:9: error: cannot find symbol   · symbol: method sort() · location: variable pesos of type int[]
AsListDePrimitivos.java:10: error: incompatible types: inference variable T has incompatible bounds
```

**El tercero que no es un error de este tema pero aparece aquí:** `Arrays.toString` de una matriz. No lanza, no
avisa, imprime `[[I@610455d6, [[I@5119fb47]`. Si ves un `@` en una salida de logs, alguien está imprimiendo
referencias de arreglo creyendo que imprime datos: `deepToString` existe para eso.

#### 11. Pregunta con respuesta modelo

**Comprensión.** `int[][] m = new int[2][];` — ¿cuánto vale `m[0].length`? ¿Y `m.length`?

**Respuesta modelo:** la primera **lanza**; la segunda vale `2`. `m.length` es la cantidad de casillas de
referencia (2), y `m[0]` es `null` porque nadie creó la fila: medido en `FilaNula.java`, el fallo es
`NullPointerException: Cannot read the array length because "porFila[i]" is null`, no un
`ArrayIndexOutOfBoundsException`. La diferencia de tipo de excepción te está diciendo qué falta: cotas o
creación de filas.

**Comprensión.** `Arrays.binarySearch(v, x)` devuelve `-4`. ¿Qué sabes?

**Respuesta modelo:** que en **ese instante** `x` no está en `v`, si `v` está ordenado —y nada más. El índice
de inserción es `-(-4) - 1 = 3`, medido con `-3 → 2`. Y si `v` **no** está ordenado, no sabes ni una cosa ni la
otra: `BuscaSinOrdenar.java` devuelve `-1` para un valor que está en la casilla 3 y `2` para otro que también
está, pero por casualidad.

**Entrevista.** Te piden «copiar una matriz de tarifas». Escribes `int[][] copia = original.clone();`. ¿Qué
respondes cuando el revisor pregunta qué pasa si alguien modifica `copia`?

**Respuesta modelo:** que la copia es superficial y la modificación se ve en el original, y lo defiendo con el
dato medido: `clone es superficial: original[0][0]=1 · copia[0][0]=1 (misma fila: true)`. El arreglo exterior
es nuevo (sus casillas de fila son copiables sin afectar al original), pero las filas son los mismos objetos.
Copia profunda: `int[][] c = new int[original.length][];` y por fila `original[i].clone()`, o
`Arrays.setAll`. Y la segunda parte de la respuesta, que suele faltar: si el requisito era «inmutable»,
ninguna de las dos sirve —hay que devolver una copia por cada acceso, o una estructura inmutable (tema 4:
`List.of`/`Map.of`, que sí se niegan a crecer).

#### 12. Cuándo usarlo y cuándo no

| Úsalo | No lo uses |
|---|---|
| `Arrays.sort` + `binarySearch` juntos, sobre una **copia** ordenada | `binarySearch` sobre un arreglo que no ordenaste tú y no verificaste |
| `Arrays.copyOf` / `copyOfRange` para cambiar la longitud o extraer un trozo | Para «vaciar» un arreglo: no hay vacío que valga, hay otro arreglo |
| Matrices cuando la segunda dimensión **significa** algo (parada × guía) | Matrices cuando solo necesitas «muchos valores»: un arreglo plano con índice compuesto es más barato y se recorre igual |
| `deepToString` / `deepEquals` en dos o más dimensiones | `toString` / `equals` de `Arrays` sobre matrices, salvo que quieras comparar **filas por identidad** (caso real, pero es la excepción) |
| `asList` como vista barata para leer o `set` | `asList` cuando el código de al lado va a llamar a `add`, o cuando esperas una copia: no lo es |

**Costo:** las cuatro operaciones de biblioteca que más vas a usar son `sort` (dual-pivot *quicksort* para
primitivos, Timsort estable para referencias, ambas medidas en el bytecode de `java.util.Arrays`),
`binarySearch` (log₂, tema 6 lo cuenta), `copyOf`/`copyOfRange` (una copia O(n) y, si alargas, casillas con el
valor por defecto del tema 1) y `asList` (una envoltura O(1), sin copia). El arreglo bidimensional no te da
continuidad: dos niveles de puntero y **una** comprobación de cota por nivel. Cuando eso empiece a doler
(coherencia de caché, matrices grandes), el curso lo trata en M21; en este módulo el requisito es que
recorras la matriz con la longitud de cada fila y que no le pidas a `Arrays.toString` lo que solo
`deepToString` puede darte.

---

### Tema 3: Covarianza de arreglos y `ArrayStoreException`: por qué las listas son más seguras · Básico · 35 min

#### 1. Ubicación y prerrequisitos

Curso Java · tramo Fundamentos · módulo 4 · tercer tema. Antes: [Tema 1](#tema-1-arreglos-creacion-valores-por-defecto-recorrido-y-arrayindexoutofboundsexception)
(la **clase real** del arreglo: `[Ljava.lang.String;`, y sin esa idea aquí no hay nada que explicar) y
[Tema 2](#tema-2-arreglos-multidimensionales-y-la-clase-arrays-ordenar-copiar-comparar-y-buscar) (el
componente como tipo, y `asList` como primera envoltura de referencia). Del [Módulo 3 · tema 4](modulo-3.md)
viene lo que este tema usa sin repetir: pasar un arreglo a un método copia la **referencia**, así que el método
`etiquetaTodo(Object[], String)` puede estar escribiendo en tu arreglo de fuera. Después: el tema 4 usa
`ArrayList` y `HashMap` (la alternativa práctica), el tema 5 paga el precio de meter `int` en una colección
(`Integer`, autoboxing) y M11 desarrolla los genéricos cuya ausencia se ve aquí en el bytecode. Versión:
JDK 25. Fuentes del temario para este tema: JLS §10.5 y *Effective Java* item 28 («Prefer lists to arrays»).

#### 2. Objetivo

Al terminar sabes qué es la covarianza de arreglos (JLS §4.10.3: si `String` es subtipo de `Object`, `String[]`
es subtipo de `Object[]`), y sabes que la asignación no copia ni convierte nada: es la **misma** memoria. Sabes
qué comprueba la JVM en cada escritura (`aastore`) y qué pasa cuando la comprueba falla: un
`ArrayStoreException` **a medio escribir**, con las casillas anteriores tocadas y las siguientes intactas. Sabes
que la misma guarda se hace **una capa más abajo** (`Object[][] vista = new String[2][]` rechaza un `Integer[]`
con mensaje `[Ljava.lang.Integer;`, medido en `por-dentro/MatrizCovariante.java`). Sabes
que el `ClassCastException` de un arreglo aparece al **leer**, y que el cast en sentido inverso compila y
revienta al ejecutar. Y sabes decir por qué un `List<String>` no se puede asignar a `List<Object>`
(`incompatible types: List<String> cannot be converted to List<Object>`, medido), dónde está la protección real
de las colecciones (en `javac`) y dónde su punto ciego (el erasure: si engañas al compilador, la comprobación
queda en un `checkcast` que él insertó en la lectura).

#### 3. Por qué importa

El método de utilidad más peligroso de un proyecto pequeño es el que dice «paso por aquí todas las casillas»,
porque su firma natural es `Object[]`. En el proyecto guía de M3 (`Despachador`, tema 4) la firma honesta era
`String[]`, y aquí ves qué pasa si alguien «la generaliza». Medido en `tema-3/EscribeEnObject.java`: el método
`etiquetaTodo(Object[], String)` funciona **perfecto** con un `String[]` de fuera
(`afuera, ya convertido : [RF-0000, RF-0001, RF-0002]`) y con un `Object[]`
(`dentro del metodo ve un : [Ljava.lang.Object;`). El fallo no está en el método que **rellena**: está en el que
**mezcla**. `escribeMezcla` escribe un `String` válido, luego un `Integer` ilegal, y el arreglo queda
**partido**: la casilla 0 cambió, la 1 y la 2 no, y la excepción llegó en la 1. Eso es exactamente lo que un
servicio de facturación no puede permitirse: un lote a medio etiquetar que nadie puede saber hasta dónde está
etiquetado. La alternativa del tema 4 (`List<Guia>`) no es más rápida ni más corta: es **imposible de llamar
mal**, porque el compilador no te deja convertir `List<String>` en `List<Object>`.

#### 4. Analogía

Una caja de mudanza estampada **VAJILLA**. En el almacén hay una norma: *«todo lo que dice VAJILLA puede
tratarse como si dijera FRÁGIL»*. Por eso el operario puede tomar la caja por el lado que dice FRÁGIL y seguir
manipulándola —no ha cambiado nada: la caja sigue teniendo la etiqueta VAJILLA pegada en el cartón.

- Pasar `String[]` a `Object[]` es **leer la caja por la etiqueta genérica**. No se fabrica otra caja
  (medido: `misma identidad? : true`), y el estampado real no se borra
  (`la clase real NO cambia: [Ljava.lang.String;`).
- Escribir un `String` por esa etiqueta es legal: una taza **es** frágil.
- Escribir un `Integer` es lo que la analogía llama **el golpe en la puerta**: la caja sabe lo que es, y se
  niega en el momento de entrar (`ArrayStoreException`). No espera a que alguien lo saque.
- Sacar lo que hay dentro creyendo que es una taza es lo que la caja **no** puede controlar: si entró algo por
  una abertura que sí aceptaba ese objeto, al sacarlo te llevas lo que hay y el error aparece **en tus manos**
  (`ClassCastException`, medido: aparece al leer, no al escribir).

**Dónde se rompe la analogía:** una caja de cartón no revisa cada objeto al meterlo; la instrucción `aastore`
sí, porque JLS §10.5 dice literalmente que «an assignment to a component of the array is checked at run time to
ensure that the value being assigned is assignable to the component», y si el tipo del valor no es
*assignment-compatible* (§5.2) con el tipo del componente se lanza el `ArrayStoreException`. Y al revés: una caja
**etiquetada con rotulador** por el cliente no se autocomprueba —
eso son las colecciones después del *erasure*, donde la única guarda real es el aviso de `javac` (medido en
`tema-3/por-dentro/ListaSinGuarda.java`: meter un `Integer` en lo que declaraste `List<String>` no lanza
nada, y el error aparece cuando otro método lo lee).

#### 5. Diagrama

```mermaid
flowchart TB
    subgraph HEAPI["heap: un SOLO objeto"]
        R["cabecera: clase [Ljava.lang.String; · length = 3"]
        R --> K0["casilla 0"]
        R --> K1["casilla 1"]
        R --> K2["casilla 2"]
    end
    A["String[] guias"] -->|"misma referencia"| B["Object[] comoObjeto"]
    B --> R
    W1["comoObjeto[0] = &quot;RF-000123&quot;"] -->|"aastore: String es String → pasa"| K0
    W2["comoObjeto[1] = 42"] -->|"aastore: Integer NO es String"| G["ArrayStoreException<br/>la escritura se rechaza"]
    G -.->|"K0 ya quedó cambiada<br/>K1 y K2 intactas"| K1
    L1["((String[]) comoObjeto)[i]"] -->|"checkcast al leer"| C["ClassCastException<br/>si el elemento no es String"]
```

**Texto alternativo:** arriba, un solo objeto en el heap con dos nombres encima: la variable tipada `String[]`
y la asignada a `Object[]` —mismo `identityHashCode`, medido como `true`—. La escritura pasa por `aastore`, que
compara el tipo del **objeto** con el **componente real** de la caja: si no encaja, rechaza esa escritura y
deja las anteriores hechas (medido: `el indice 0 SI cambio : si-es-string`, `el resto quedo viejo : RF-0001 ·
RF-0002`). La lectura con cast es otro fallo, en otro momento, y con otra excepción.

#### 6. Explicación

**Nivel 0 — la asignación hacia arriba es gratis y no toca la memoria.** Medido en
`tema-3/Covarianza.java`:

```text
la clase real NO cambia: [Ljava.lang.String;
misma identidad?         : true
por la vista Object      : RF-000123
por el arreglo original  : RF-000123
```

`Object[] comoObjeto = guias;` no convierte un elemento, no copia: es la **regla de subtipo de arreglos**
(JLS §4.10.3, que hace de `String[]` un subtipo de `Object[]` cuando `String` lo es de `Object`; JLS §10.5 es la
parte que se ejecuta). Lo que sí cambia es lo que el compilador te deja **escribir**: por `comoObjeto` puedes
intentar meter cualquier objeto, y la veracidad de la casilla la defiende la JVM, no `javac`.

**Nivel 0 — el arreglo sabe lo que es, y lo dice en el momento de escribir.** `etiquetaTodo(Object[] destino,
String prefijo)` imprime `destino.getClass().getName()` y ve la verdad:

```text
  dentro del metodo ve un  : [Ljava.lang.String;
afuera, ya convertido     : [RF-0000, RF-0001, RF-0002]
  dentro del metodo ve un  : [Ljava.lang.Object;
```

La firma dice `Object[]` en los dos casos; la **cabecera del objeto** dice una cosa distinta, y esa cabecera es
la que manda. De ahí la segunda parte, medida en `escribeMezcla`:

```text
arreglo a medio escribir  : ArrayStoreException · java.lang.Integer
  el indice 0 SI cambio   : si-es-string
  el resto quedo viejo    : RF-0001 · RF-0002
```

Tres lecturas que hay que saber hacer: (1) la excepción **escribe el nombre de la clase rechazada** en el
mensaje (`java.lang.Integer`), (2) el arreglo queda **parcialmente modificado** —la escritura ilegal se
rechaza, las legales ya se hicieron—, y (3) por eso este bug es peor de lo que parece: no es «el método no
hizo nada», es «el método hizo la mitad». El remedio no es capturar la excepción y continuar: es que la firma
no admita el objeto equivocado (tema 4: `List<Guia>`), o validar antes de tocar nada.

Y si el elemento **sí** cabía en la caja pero la lectura esperaba otra cosa, la excepción cambia de sitio.
Medido:

```text
Object[] con un Integer   : 7 de Integer
  el error aparece al leer  : ClassCastException · class java.lang.Integer cannot be cast to class java.lang.String (java.lang.Integer and java.lang.String are in module java.base of loader 'bootstrap')
```

`mixto[1] = 7` fue completamente legal —`Object[]` acepta cualquier cosa— y la mentira aparece tres líneas más
tarde, cuando alguien hace `(String) mixto[1]`. Este es el patrón exacto del dato que entra por un
`Object[]`/`List<Object>` genérico y revienta en un módulo distinto del que lo metió.

**Nivel 1 — el cast hacia abajo compila, y puede ser mentira.** `errores/CastInvalido.java`:

```java
Object[] cajas = new Object[2];
String[] guias = (String[]) cajas;        // compila
System.out.println("esto no se imprime: " + guias.length);
```

```text
Exception in thread "main" java.lang.ClassCastException: class [Ljava.lang.Object; cannot be cast to class [Ljava.lang.String; ([Ljava.lang.Object; and [Ljava.lang.String; are in module java.base of loader 'bootstrap')
	at CastInvalido.main(CastInvalido.java:7)
```

La cast de arreglo se comprueba **contra la clase real del objeto**, igual que `instanceof`. O sea: `String[]`
es subtipo de `Object[]` (hacia arriba, siempre válido), pero `Object[]` **no** es subtipo de `String[]`: solo
se puede castear si lo que hay debajo era un `String[]`. El caso `Covarianza.java` lo hace bien y por eso pasa:
`cast de vuelta : hueco · RF-000124` —`((String[]) comoObjeto)` es legal porque el objeto sigue siendo
`[Ljava.lang.String;`. Fíjate en el detalle medido del programa: `hueco` para la casilla 1 **en el momento de
la línea**, porque `guias[1] = "RF-000124"` se escribe después; es la demostración de que la cast no copia:
ambas variables miran la misma casilla.

**Nivel 1 — los arreglos de primitivos están fuera del juego.** `int[]` no es subtipo de `Object[]`
(`errores/PrimitivosNoSonObjectArray.java`, medido):

```text
errores/PrimitivosNoSonObjectArray.java:7: error: incompatible types: int[] cannot be converted to Object[]
```

pero `int[]` **sí** es un `Object` (el arreglo es un objeto, tema 1): `int[] asignado a Object : [I`. Esa asimetría
es la que hace que `List<int[]>` tenga un elemento y `List<Integer>` tenga tres (tema 2 midió el primero).

**Nivel 1 — la guarda baja de capa: una matriz también es covariante.** `por-dentro/MatrizCovariante.java`
declara `Object[][] vista = new String[2][]`, o sea una matriz cuyo **componente real** es `String[]`:

```text
clase de la vista      : [[Ljava.lang.String; · componente real: [Ljava.lang.String;
rechaza una capa abajo  : ArrayStoreException · [Ljava.lang.Integer;
casilla 1 admitida     : [ok]
casilla 0 sigue siendo : null
```

Lo que se intenta escribir en la casilla 0 no es un `Integer` suelto sino un `Integer[1]` entero, y el
componente de `vista` es `String[]`: la regla de §4.10.3 («si S y T son tipos referencia, `S[]` es supertipo
directo de `T[]` si y solo si S es supertipo directo de T») no alcanza para `Integer[]` frente a `String[]`, así
que §10.5 hace lo único que puede hacer y lanza. El mensaje lo dice con el nombre interno del objeto rechazado
(`[Ljava.lang.Integer;`), no con el de la casilla. Y las dos últimas líneas son la misma lección de antes: la
escritura ilegal no deja nada escrito (`casilla 0 sigue siendo : null`) mientras la legal de la fila de al lado
sí entró (`[ok]`). §10.5 no habla de dimensiones porque no le falta: la comprobación es siempre «el valor debe
ser asignable al **componente**», y en una matriz el componente es otro arreglo.

**Nivel 2 — por qué «las listas son más seguras», dicho con precisión.** La regla de subtipos de
genéricos es **invariante**: `List<String>` no es subtipo de `List<Object>` ni al revés. Medido en
`errores/ListaNoCovariante.java`:

```text
errores/ListaNoCovariante.java:13: error: incompatible types: List<String> cannot be converted to List<Object>
        List<Object> vista = guias;                  // listas: NO pasa, y ese es el punto
```

El arreglo falla **en ejecución** y te deja memoria a medio cambiar; la lista falla **en compilación** y no
llega a pasar nada. Y la razón de fondo se ve en `tema-3/por-dentro/UnaInstruccionParaGuardar.java`: el
bytecode de `guias.add("RF-000123")` es

```text
11: invokeinterface #12, 2   // InterfaceMethod java/util/List.add:(Ljava/lang/Object;)Z
```

sin ninguna mención a `String`. `add` recibe `Object` en tiempo de ejecución (el tipo se borró), así que **no
puede** existir un «`ArrayStoreException` de las listas»: no hay cabecera con el tipo de componente que
comprobar. La protección no la pone la JVM; la pone `javac`. Eso es lo que hace la asignación invariante la
elección correcta: convierte un accidente en tiempo de ejecución en un error de compilación.

**Nivel 3 — y el punto ciego, medido.** `tema-3/por-dentro/ListaSinGuarda.java` engaña al compilador con dos
casteos (`(List<String>) (List<?>) objetos`, anotado con `@SuppressWarnings("unchecked")`) y pasa todo:

```text
anadido sin excepcion   : 1 elementos · un Integer
la trampa compila       : true
mismo objeto en las dos : true
revienta al leer        : ClassCastException
  nombra los dos tipos  : true
```

Nadie protestó al `add`, y `objetos.get(0) == trampa.get(0)` es `true`: **la misma caja**, dos etiquetas. El
`javap` de `primero(List<String>)` enseña dónde vive la única guarda que queda:

```text
 2: invokeinterface  // InterfaceMethod java/util/List.get:(I)Ljava/lang/Object;
 7: checkcast     #13   // class java/lang/String
```

es decir: `get` devuelve `Object`, y `javac` inserta un `checkcast` en el punto de uso. Ese `checkcast` es lo
que lanza. Con `-Xlint:unchecked` y sin la anotación, `javac` avisa del cast (*warning: [unchecked] unchecked
cast*) pero **no lo impide**: en este punto la seguridad es tuya. El contraste pedagógico con el arreglo es
exacto y medido: el arreglo **impide** la escritura (`ArrayStoreException`), la lista **advierte** y luego
confía. De ahí el item 28 de *Effective Java* que el temario cita para este tema: si vas a exponer una
colección con tipo, es la forma en la que el compilador trabaja contigo; si vas a pasar posiciones, el arreglo
es más rápido pero menos expresivo.

**Nivel 3 — lo que hace cada instrucción.** Medido en `por-dentro/UnaInstruccionParaGuardar.class`:
`guardaReferencia` termina en `3: aastore` y `guardaPrimitivo` en `3: iastore`. `aastore` **no lleva tipo**
en el bytecode —el tipo está en la **cabecera del objeto** y se compara con el del valor apilado: por eso
puede lanzar—, mientras que `iastore` no tiene nada que comprobar (`int[]` solo admite `int`, y eso lo decide
`javac`). Salida de los dos métodos juntos:

```text
guardado legal         : RF-000001
guardado ilegal        : ArrayStoreException
primitivo guardado     : 1250
lista declarada String : 2 elementos
clase de la lista      : java.util.ArrayList
```

#### 7. Código ejecutable

**Ejemplo mínimo** · archivo `tema-3/Covarianza.java` · ejecuta
`javac --release 25 -d out tema-3/Covarianza.java && java -Dstdout.encoding=UTF-8 -cp out Covarianza`

```java
public class Covarianza {
    public static void main(String[] args) {
        String[] guias = new String[3];
        Object[] comoObjeto = guias;                 // compila: String[] es subtipo de Object[]

        System.out.println("la clase real NO cambia: " + comoObjeto.getClass().getName());
        System.out.println("misma identidad?         : " + (comoObjeto == guias));

        comoObjeto[0] = "RF-000123";                 // legal: un String SI es un Object
        System.out.println("por la vista Object      : " + comoObjeto[0]);
        System.out.println("por el arreglo original  : " + guias[0]);

        // Y al reves: leer como String funciona mientras el elemento lo sea.
        String leido = ((String[]) comoObjeto)[1] == null ? "hueco" : "relleno";
        guias[1] = "RF-000124";
        System.out.println("cast de vuelta           : " + leido + " · " + ((String[]) comoObjeto)[1]);

        int[] pesos = {1250, 3400};
        Object unObjeto = pesos;                     // esto si vale: el arreglo ES un objeto
        System.out.println("int[] asignado a Object  : " + unObjeto.getClass().getName());
        // y esto NO compila: Object[] comoArregloDeObjetos = pesos;
    }
}
```

Salida completa:

```text
la clase real NO cambia: [Ljava.lang.String;
misma identidad?         : true
por la vista Object      : RF-000123
por el arreglo original  : RF-000123
cast de vuelta           : hueco · RF-000124
estado final             : [RF-000123, RF-000124, null]
int[] asignado a Object  : [I
```

**El método generalizado** · `tema-3/EscribeEnObject.java`. Las dos firmas que importan:

```java
static void etiquetaTodo(Object[] destino, String prefijo) {   // peligrosa solo si quien llama no sabe
    for (int i = 0; i < destino.length; i++) {                 // que esta vista escribe EN su arreglo
        destino[i] = prefijo + i;
    }
    System.out.println("  dentro del metodo ve un  : " + destino.getClass().getName());
}

static void escribeMezcla(Object[] destino) {
    destino[0] = "si-es-string";                 // este SI entra en un String[]
    destino[1] = 42;                             // este NO: ArrayStoreException
    destino[2] = "tampoco llega";
}
```

y el bloque que hay que leer dos veces:

```java
try {
    escribeMezcla(guias);
} catch (ArrayStoreException e) {
    System.out.println("arreglo a medio escribir  : " + e.getClass().getSimpleName()
            + " · " + e.getMessage());
    System.out.println("  el indice 0 SI cambio   : " + guias[0]);
    System.out.println("  el resto quedo viejo    : " + guias[1] + " · " + guias[2]);
}
```

Salida completa medida (7 líneas, todas citadas en la sección 6).

**Por dentro** · `tema-3/por-dentro/UnaInstruccionParaGuardar.java`,
`tema-3/por-dentro/ListaSinGuarda.java` y `tema-3/por-dentro/MatrizCovariante.java`, con los `javap` pegados
arriba. El tercero es el que más sorprende a quien cree que la covarianza «solo vale para la primera fila»:

```java
Object[][] vista = new String[2][];                 // component type real: String[]
System.out.println("clase de la vista      : " + vista.getClass().getName()
        + " · componente real: " + vista.getClass().getComponentType().getName());
try {
    vista[0] = new Integer[1];                      // un Integer[] NO es un String[]
} catch (ArrayStoreException e) {
    System.out.println("rechaza una capa abajo  : ArrayStoreException · " + e.getMessage());
}
vista[1] = new String[] {"ok"};                     // esto si: String[] si es String[]
```

`getComponentType()` es la API que necesitas si quieres **validar antes de escribir**, porque devuelve
exactamente el dato con el que §10.5 compara el valor. Ejecuta el segundo con el aviso activado para ver la
diferencia entre «no compila», «compila con aviso» y «compila y miente»:

```bash
sed 's/@SuppressWarnings("unchecked")//' tema-3/por-dentro/ListaSinGuarda.java > /tmp/ListaSinGuarda.java
javac -Xlint:unchecked --release 25 -d /tmp/lsg /tmp/ListaSinGuarda.java   # warning: [unchecked] unchecked cast
```

**Proyecto guía** · el `Manifiesto` de este módulo **no** expone `Object[]` en ninguna firma: `gramos(String[])`,
`mayoresQue(int[], int)` y `totalesPorZona(String[])` usan el tipo concreto. Es la decisión del item 28 aplicada
al revés: aquí lo que se comparte son **primitivos**, y un arreglo de primitivos no puede contaminarse (nivel 1)
—por eso `int[]` es la firma correcta para los pesos y `Map<String, Integer>` para los totales—.

#### 8. Mini-laboratorio

Escribe los archivos desde cero en `laboratorios/modulo-4/tema-3/`.

1. Crea `MismaCaja.java`: un `String[3]`, una variable `Object[]` apuntando a él, y tres impresiones:
   `getClass().getName()` de las dos, `a == b`, y el contenido con `Arrays.toString` después de escribir por
   **la vista**. Predice las tres antes de ejecutar. Si predijiste `[Ljava.lang.Object;` en la primera, ya sabes
   qué error ibas a cometer en el trabajo real.
2. Crea `MedioLleno.java` con un método `static void pinta(Object[] caja)` que escriba en la casilla 0 un
   `String`, en la 1 un `Integer` y en la 2 un `String`. Llámalo con un `String[3]` dentro de un `try`/`catch`
   y, en el `catch`, **imprime las tres casillas**. Comprueba que la 2 no cambió: eso es «a medio escribir».
   Escribe debajo, en comentario, qué harías en un servicio real: ¿reintentar, abortar el lote, o no tener
   nunca esa firma?
3. Crea `LeeTarde.java`: crea un `Object[2]`, guarda un `Integer` en la casilla 0 (legal), castea la casilla a
   `String` y captura el `ClassCastException`. Imprime el mensaje. Compara con el paso 2: **dos escrituras
   distintas, dos excepciones distintas, dos momentos distintos**.
4. Crea `ColeccionesDicen.java` y escribe tres líneas, una por vez, comentando la respuesta de `javac`:
   `List<Object> v = new ArrayList<String>();`, `List<String> v2 = new ArrayList<Object>();` y
   `List<String> v3 = new ArrayList<>();`. Las dos primeras no compilan y los dos mensajes son **simétricos**,
   medidos: `incompatible types: ArrayList<String> cannot be converted to List<Object>` y `incompatible types:
   ArrayList<Object> cannot be converted to List<String>`. Fíjate en que `javac` nombra el tipo del `new`, no el
   de la variable, y no usa la palabra «covarianza»: para él simplemente no existe esa conversión. La tercera
   compila, y esa es la única forma de escribirlo bien.
5. Crea `MatrizVista.java`: declara `Object[][] m = new String[2][]` e imprime `m.getClass().getName()` y
   `m.getClass().getComponentType().getName()`. **Predice los dos** antes de ejecutar. Después intenta
   `m[0] = new Integer[1]` dentro de un `try/catch` e imprime el mensaje de la excepción, y por último
   `m[1] = new String[]{"ok"}`. Si el mensaje te sorprende por parecer «otro arreglo», es porque la guarda se
   hizo contra `String[]`, el componente, y no contra `Object`.
6. Crea `EnganaAlCompilador.java` con el patrón de `ListaSinGuarda`: una `List<Object>` con un `Integer`, el
   doble cast `(List<String>) (List<?>)`, y un método `static String primero(List<String>)`. Ejecuta sin
   `-Xlint`, luego con `-Xlint:unchecked` y la anotación quitada. Pega el *warning* y la traza del
   `ClassCastException`. Remata con `javap -c` y señala el `checkcast`: **esa línea es el único guardián que
   tenías**.

**Listo cuando** puedas decir, para cada una de las tres excepciones del tema (`ArrayStoreException`,
`ClassCastException` y el error de `javac` de `List<String>`→`List<Object>`), **en qué momento** aparece y
**qué deja tocado** en la memoria.

#### 9. Verificación

```bash
cd docs/reestructuracion/cursos/java/laboratorios/modulo-4
java -Dstdout.encoding=UTF-8 tema-3/Covarianza.java                  # «[Ljava.lang.String;», «misma identidad? : true»
java -Dstdout.encoding=UTF-8 tema-3/EscribeEnObject.java             # «ArrayStoreException · java.lang.Integer», «el resto quedo viejo : RF-0001 · RF-0002»
java -Dstdout.encoding=UTF-8 tema-3/por-dentro/UnaInstruccionParaGuardar.java
java -Dstdout.encoding=UTF-8 tema-3/por-dentro/ListaSinGuarda.java    # «revienta al leer : ClassCastException»
java -Dstdout.encoding=UTF-8 tema-3/por-dentro/MatrizCovariante.java   # «componente real: [Ljava.lang.String;», «ArrayStoreException · [Ljava.lang.Integer;»
java -Dstdout.encoding=UTF-8 tema-3/errores/CastInvalido.java         # class [Ljava.lang.Object; cannot be cast to class [Ljava.lang.String;
javac --release 25 -d /tmp/m4e tema-3/errores/ListaNoCovariante.java        # List<String> cannot be converted to List<Object>
javac --release 25 -d /tmp/m4e tema-3/errores/PrimitivosNoSonObjectArray.java # int[] cannot be converted to Object[]
javac -d /tmp/m4b tema-3/por-dentro/ListaSinGuarda.java && javap -c -cp /tmp/m4b ListaSinGuarda | grep checkcast
```

Aquí las **30** comprobaciones del tema pasan con Temurin 27 y `--release 25`, incluidas las dos de `javap`
(`aastore` / `List.add:(Ljava/lang/Object;)Z` en `UnaInstruccionParaGuardar`, `checkcast` /
`List.get:(I)Ljava/lang/Object;` en `ListaSinGuarda`) y la del aviso: se copia el archivo **sin** la anotación,
se compila con `-Xlint:unchecked` y se comprueba que salga la cadena `unchecked cast`.

*Pendiente de reejecución en JDK 25:* el texto del `ClassCastException` (la coletilla
`… are in module java.base of loader 'bootstrap'`) lo arma la JVM con los nombres de módulo y cargador; conviene
confirmarlo con el ejecutable 25. La regla de covarianza (JLS §10.5), el `ArrayStoreException` y el hecho de que
`add` se borre a `(Ljava/lang/Object;)Z` no cambian entre ejecutables.

#### 10. Error común y diagnóstico

**Síntoma 1 — «el método recibió mi arreglo y ahora tiene números dentro».** Es el caso `mixto[1] = 7`: una
escritura **legal** en `Object[]`. El diagnóstico es leer la excepción con orden: `ClassCastException` al leer
significa que el objeto **entró** por una puerta que lo admitía; `ArrayStoreException` al escribir significa que
alguien intentó meter por la puerta equivocada **otro** objeto. Salida medida de las dos:

```text
Object[] con un Integer   : 7 de Integer
  el error aparece al leer  : ClassCastException · class java.lang.Integer cannot be cast to class java.lang.String …
arreglo a medio escribir  : ArrayStoreException · java.lang.Integer
```

**Arreglo:** si el método solo sabe escribir **un** tipo, decláralo con ese tipo (`String[]`, `Guia[]`) o,
mejor, con la colección tipada del tema 4. Un parámetro `Object[]` solo es honesto cuando se documenta que
**acepta lo que quepa en el arreglo del llamador** —y eso casi nadie lo quiere.

**Síntoma 2 — el lote queda a medio procesar y nadie sabe dónde.** Consecuencia directa de `aastore`: la
comprobación es **por casilla**, así que un `ArrayStoreException` deja escritas las anteriores. Medido:
`el indice 0 SI cambio : si-es-string` y `el resto quedo viejo : RF-0001 · RF-0002`. **Diagnóstico:** imprimir
`getClass().getName()` del arreglo **antes** de tocarlo (es lo que hace el `println` dentro del método) y
validar el tipo con `instanceof` por fuera, o trabajar sobre una copia y sustituir al final (el patrón de
`Manifiesto.mayoresQue`: `clone` + ordenar la copia, nunca el arreglo del llamador). **No arregla esto:**
envolver todo en `try/catch (Exception e)` y seguir; con un arreglo partido, seguir es el daño.

**Síntoma 3 — «en las listas pasa lo mismo, pero sin excepción».** Pasa **peor**: no hay excepción al
escribir. Medido: `anadido sin excepcion : 1 elementos · un Integer` y el fallo aparece en `primero(trampa)`
con `revienta al leer : ClassCastException`. Y la causa de que no exista un «`ArrayStoreException` de listas»
es visible: `invokeinterface … List.add:(Ljava/lang/Object;)Z` —no hay tipo que comprobar en tiempo de
ejecución. **Arreglo:** no hagas el cast de dos pasos salvo que estés escribiendo código de *framework* y
sepas por qué es seguro; si lo haces, quita `@SuppressWarnings` y compila con `-Xlint:unchecked` en el build
para que el aviso no se pierda (eso se configura de serie en M17).

**Errores de compilación reales** (medidos con `javac --release 25`):

```text
errores/ListaNoCovariante.java:13: error: incompatible types: List<String> cannot be converted to List<Object>
errores/PrimitivosNoSonObjectArray.java:7: error: incompatible types: int[] cannot be converted to Object[]
```

El primero **es el arreglo funcionando bien**: Java te está impidiendo escribir el código que en C# (antes de
2007) y en Java con arreglos se convierte en un fallo de producción. El segundo recuerda que la covarianza
existe solo entre arreglos de **referencia**.

#### 11. Pregunta con respuesta modelo

**Comprensión.** Tienes `String[] guias` y escribes `Object[] vista = guias;`. ¿Cuántos arreglos hay en memoria
y qué imprime `vista.getClass().getName()`?

**Respuesta modelo:** **uno**, y el nombre es el original: `[Ljava.lang.String;` (ambos medidos; `==` entre las
dos variables da `true`). La asignación no copia ni re-etiqueta el objeto: la cabecera del arreglo guarda su
clase real y esa clase es la que se comprueba en cada escritura. Lo único que cambia es lo que `javac` te deja
**intentar** escribir.

**Comprensión.** ¿En qué se diferencia `ArrayStoreException` de `ClassCastException` en este contexto?

**Respuesta modelo:** en el momento y en el efecto. `ArrayStoreException` se produce en la **instrucción de
escritura** (`aastore`), la escritura **no ocurre** y las casillas anteriores quedan modificadas
(medido: índice 0 cambiado, 1 y 2 intactos). `ClassCastException` se produce en la **lectura con cast** (o en
el `checkcast` que `javac` insertó después de un `get`), y no deja la memoria en un estado nuevo: te dice que
la suposición del programa sobre el contenido era falsa desde el principio. Las dos son *unchecked*: `javap
java.lang.ArrayStoreException java.lang.ClassCastException` muestra que ambas `extends java.lang.RuntimeException`,
así que ningún método necesita declararlas. Son señales opuestas —una dice «intentaste meter lo que no cabe», la
otra «estabas sacando lo que no esperabas».

**Entrevista.** «¿Por qué los arreglos son covariantes y las listas invariantes? ¿Cuál es mejor?»

**Respuesta modelo:** los arreglos son covariantes por decisión histórica: `Object[]` era la única forma de
escribir código genérico antes de 2004, y el coste fue necesitar una comprobación en ejecución por escritura
(JLS §10.5, y el `ArrayStoreException` que la acompaña). Las listas nacieron con genéricos y **borrado de
tipos**: `List<String>` y `List<Object>` son la misma clase en ejecución, así que Java eligió la invariancia y
dejar la comprobación entera en `javac`. «Mejor» depende de lo que quieras que falle: con la lista, el error de
diseño se ve **antes de ejecutar** (medido: `List<String> cannot be converted to List<Object>`); con el arreglo,
el programa **arranca** y revienta con datos concretos en producción. Por eso el criterio práctico es: tipo de
elemento en el contrato → colección; posición y primitivos en bloque → arreglo; y nunca un `Object[]` público
(sin validar) en el límite de un módulo. Bonus que casi nadie dice: la invariancia de `List` **no** protege si
engañas al compilador; lo que protege es el `checkcast` que `javac` pone en la lectura, y eso es un parche, no
un contrato.

#### 12. Cuándo usarlo y cuándo no

| Úsalo | No lo uses |
|---|---|
| Un parámetro `Object[]` **cuando** vas a leer sin suponer el tipo (`Arrays.toString`, `equals`) | Un parámetro `Object[]` donde el método **escribe** o castea al leer: eso es `escribeMezcla` |
| `instanceof` en el límite de entrada (un payload llega como `Object[]`) para decidir antes de tocar | `catch (ArrayStoreException)` como estrategia: la casilla ya está tocada |
| Colección tipada (`List<Guia>`) cuando el tipo es parte del contrato | `List<Object>` como «acepto cualquier cosa»: eso es un arreglo de referencias con más verbosidad |
| Arreglos de primitivos cuando lo que guardas son números: son **inmunes** a todo este tema | Convertir un arreglo de primitivos a colección tipada «para que sea más seguro»: con `asList` te llevas un elemento (tema 2), y con `List<Integer>` pagas el boxing (tema 5) |

**Costo:** §10.5 dice que la escritura en un arreglo de tipos referencia «is checked at run time», y esa
comprobación es la que hace `aastore`. En una matriz lo que se
compara es el **componente**, que en `Object[][]` es `String[]` —medido en `MatrizCovariante`, el rechazo llega
igual y con el nombre interno del arreglo rechazado—. `List.add` no comprueba nada en ejecución porque no tiene
con qué: §10.5 solo puede existir porque el arreglo guarda un tipo de componente *reifiable* en su cabecera,
mientras que el borrado de tipos deja la firma en `(Ljava/lang/Object;)Z` —medido arriba en
`UnaInstruccionParaGuardar`—. A cambio, la vista covariante no convierte ni copia nada: las dos variables miran
el mismo objeto (medido: `misma identidad? : true`), así que leer por ella es leer por el arreglo original. El
coste real aquí es **de diseño**: una firma
con `Object[]` en la interfaz pública de un módulo convierte un error de tipeo en un incidente con datos
parcialmente modificados.

---
