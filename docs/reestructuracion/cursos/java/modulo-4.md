# Módulo 4 · Arreglos y primeras colecciones

> Curso Java (JDK 25) · tramo **Fundamentos** · 6 temas · formato único (specs/021). Portada del curso:
> [CURSO.md](CURSO.md). Todo el código de este módulo se compiló con `javac --release 25` y se ejecutó con
> `java -Dstdout.encoding=UTF-8` sobre OpenJDK Temurin 27.0.1.0.2+1 (macOS, arm64), locale `es_CO`, entre el
> 2026-11-20 y el 2026-11-21 (el tema 6 se cerró al día siguiente). Las salidas están pegadas tal cual.
> **Aviso de proveniencia:** en esta máquina no hay JDK 25
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
| **Laboratorio** | [`laboratorios/modulo-4/`](laboratorios/modulo-4/README.md) (al publicar: `examples/java/modulo-4/`), con `verificar.sh`: **188 comprobaciones, 0 fallidas** ejecutadas aquí. |
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

### Tema 4: `ArrayList` y `HashMap`: primer uso · Básico · 45 min

#### 1. Ubicación y prerrequisitos

Curso Java · tramo Fundamentos · módulo 4 · cuarto tema. Antes: [Tema 3](#tema-3-covarianza-de-arreglos-y-arraystoreexception-por-que-las-listas-son-mas-seguras)
—sin su explicación de por qué `List<String>` no cabe en `List<Object>` aquí no se entiende la frase «la
protección la pone `javac`, no la JVM»—, [Tema 2](#tema-2-arreglos-multidimensionales-y-la-clase-arrays-ordenar-copiar-comparar-y-buscar)
(`Arrays.sort` y `Arrays.equals`, que en el mundo de las colecciones se llaman `Collections.sort` y `equals`
comparando elementos: este tema midió las dos parejas) y
[Tema 1](#tema-1-arreglos-creacion-valores-por-defecto-recorrido-y-arrayindexoutofboundsexception) (el recorrido
con índice, que aquí se vuelve contra ti: `length` era un campo y ahora es `size()`). Del
[Módulo 3 · tema 3](modulo-3.md) vienes con el `ConcurrentModificationException` ya visto una vez —allí se
diagnosticó **por qué** aparece y por qué parece intermitente; aquí se escribe la alternativa correcta—, y del
[Módulo 3 · tema 4](modulo-3.md) la firma de métodos. Del [Módulo 2 · tema 6](modulo-2.md) viene el `split` que
parte una guía; de ahí sale el `String[]` que este tema mete en un `List<String>`. Después: el tema 5 explica por
qué `remove(1)` y `remove(Integer.valueOf(1))` son dos cosas distintas, el tema 6 mide el coste de `add` y de
`get`, M5 mete tus propias clases dentro de estas colecciones y M11 desarrolla los genéricos cuyo borrado se ve
aquí en el bytecode. El temario marca este tema como «está pero básico»: en el curso antiguo se entraba de golpe
a todas las implementaciones (`LinkedList`, `TreeMap`, `HashSet`, `PriorityQueue`); aquí el primer contacto es
**solo** `ArrayList` y `HashMap`, y las demás se nombran cuando aportan algo medible. Versión: JDK 25. Fuentes
del temario para este tema: *Cay Horstmann Java 25* cap. 5 · MOOC p. 8 · OCP 5 · YT-EN · 61B.

#### 2. Objetivo

Al terminar sabes crear y usar las dos colecciones que vas a tocar el 90 % del tiempo, y sabes decir **qué
garantiza cada operación** en lugar de adivinarlo: `add` al final y `add(i, x)` (desplaza, no sustituye —medido:
`add(1, ...) : [RF-000123, RF-000123B, RF-000124, RF-000125]`); los **dos** `remove` y su empate letal en
`List<Integer>` (`pesos.remove(1) : [10, 7] · quito la POSICION`, y para valor hay que empaquetar); que el `get`
de un mapa **no lanza nada** cuando la clave no está: devuelve `null` en silencio y el error aparece tres líneas
más tarde al desempaquetar (medido: `desempaquetar el null : NullPointerException`). Sabes elegir entre `put`,
`putIfAbsent`, `replace`, `merge` y `computeIfAbsent` según la decisión que quieras tomar
(`merge acumulando : {Cali=1000, Medellin=3000, Bogota=1000}` es un contador en una línea). Sabes que un `HashMap`
**no** conserva el orden de inserción y un `LinkedHashMap` sí (los dos medidos), que `List.of`/`Map.of` son fijas y
no admiten `null`, y que el remedio no es pelear con ellas sino **copiarlas** (`new ArrayList<>(fijas)`). Sabes
las cuatro formas legales de borrar mientras recorres y por qué la quinta revienta. Y sabes qué bytecode hay
debajo de `for (int p : pesos)` frente a `for (int i = 0; i < pesos.size(); i++)` —`List.iterator:()Ljava/util/Iterator;`
contra `List.get:(I)Ljava/lang/Object;` más un `checkcast`—, que la misma suma sale por los dos caminos
(`conIndice / conForEach : 5540 / 5540`) y que las dos rutas no son igual de rápidas sobre cualquier lista
(`ArrayList es RandomAccess : true`, `LinkedList es RandomAccess: false`).

#### 3. Por qué importa

En el manifiesto de carga del proyecto guía hay un requisito que con arreglos se escribe mal y con mapas se
escribe bien: «el total de gramos por zona». Con el tema 2 todavía abierto en la cabeza, la versión con arreglos
necesita dos arreglos paralelos (`zonas[]` y `totales[]`), buscar la zona de cada guía con un recorrido interno,
y acordarse de cuándo crecer: eso es O(guías × zonas) y tres oportunidades de equivocarse. Con `HashMap` es una
línea dentro del bucle, y es exactamente lo que está en `src/main/java/rutaflow/nucleo/Manifiesto.java:93`:

```java
totales.merge(zona, g, Integer::sum);
```

Ejecutado con el tope por defecto, el reporte del proyecto sale así (medido, sin argumentos):

```text
  totales por zona      : {CENTRO=2100, NORTE=1950, OCCIDENTE=3400, SUR=890}
las dos versiones cuadran: true
```

Y el detalle que justifica el tema entero está en la línea de arriba: `las dos versiones cuadran: true`. La
cantidad de guías por encima del tope la dan dos algoritmos distintos —`Arrays.sort` + `binarySearch` por un lado
(tema 2) y un filtro sobre `ArrayList` por otro— y los dos tienen que coincidir. Con un cliente de logística
delante, la diferencia entre el arreglo y el mapa no es «me gusta más»: es que con el arreglo tuviste que
inventarte el índice por zona y con el mapa el índice **es el dato**.

El segundo motivo es el fallo que este tema previene. Un servicio que suma topes por zona y usa
`mapa.get(zona)` sobre una zona que nunca llegó se cae con `NullPointerException` **en la línea de la suma**, sin
método alguno que señale. Medido en `tema-4/MapaDeZonas.java`: `get de ausente : null · getOrDefault: 0` y
`desempaquetar el null : NullPointerException`. Ese par de líneas es la diferencia entre un aviso de compilador
y un incidente a las 3 de la mañana, y es la razón de que el tema enseñe `getOrDefault` y `merge` en el mismo
bloque que `get`, no como detalle avanzado.

#### 4. Analogía

Un **casillero de consigna** y un **panel de llaves de hotel**.

- El casillero (`ArrayList`) es una fila de huecos numerados. Le entregas el paquete al conserje y él lo mete en
  el primer hueco libre: por eso «el orden de llegada» se conserva (`tras 3 add : [RF-000123, RF-000124, RF-000125]`).
  Si pides meter un paquete **en el hueco 1**, no tira el que estaba: lo empuja a la derecha junto con todos los
  de después —eso es `add(i, x)` y por eso la casilla que ocupaba el 2 ahora guarda otra cosa, medido
  `que habia en el 2? : RF-000124`—.
- Pedir la posición 0 de un casillero **vacío** no es «no está»: es «esa puerta no existe». El conserje protesta:
  `IndexOutOfBoundsException: Index 0 out of bounds for length 0` (medido en `errores/VaciaConIndice.java`).
- El panel del hotel (`HashMap`) no tiene números: tiene **etiquetas con nombre**. Pides «Cali» y te devuelve la
  llave; lo que no sabe el conserje es en qué orden las colgó (`HashMap conserva el orden de insercion? false`).
  Y aquí está la trampa: si pides «Quibd», que no está, el conserje **no protesta**. Te tiende la mano vacía.
  Eso es `null`. El problema no es la mano vacía: es que tú, sin mirar, intentas abrir la puerta con esa mano
  vacía —`leido * 2`— y entonces sí, el golpe (`NullPointerException`).
- `getOrDefault("Quibd", 0)` es la palmadita antes de usar la llave. `merge(zona, 1000, Integer::sum)` es el
  conserje que, si la casilla estaba vacía, mete el sobre nuevo; y si ya había algo, lo suma. Nunca te pregunta
  y nunca te deja la mano vacía.
- `List.of(...)` es una **vitrina sellada**: se ve, no se toca. Meter un paquete produce
  `UnsupportedOperationException` (medido, con mensaje `null`). El remedio no es forzar el cristal: es pedir un
  casillero normal y **copiar** el contenido dentro (`copia en ArrayList: [RF-000123, RF-000124, RF-000125]`
  mientras `original intacta : [RF-000123, RF-000124]`).

**Dónde se rompe la analogía:** un casillero físico tiene un número fijo de huecos; un `ArrayList` no —cuando se
llena, el conserje construye una fila **más larga y copia todos los paquetes** uno a uno, medido como hueco
`10 → 15 → 22`—. Esa copia es invisible para el programa y real para el coste (tema 6), y no existe en ningún
casillero de verdad. Segunda rotura: el panel del hotel tiene una posición física; las entradas de un `HashMap`
se colocan por el `hashCode` de la clave, así que «la posición 0» no significa nada y no hay `get(0)` que valga.

#### 5. Diagrama

```mermaid
flowchart TB
    subgraph AR["ArrayList&lt;String&gt;: posiciones"]
        ED["elementData (hueco)&lt;br/>medido: 10 → 15 → 22"]
        SIZE["size = 11 (elementos reales)"]
        A1["add(&quot;RF-000126&quot;)"] -->|"hueco lleno → copia a mas grande"| ED
        A2["add(1, x)"] -->|"empuja el resto a la derecha"| ED
        A3["remove(0)"] -->|"devuelve el elemento y corrije"| ED
        ED --- SIZE
    end
    subgraph HM["HashMap&lt;String, Integer&gt;: claves, sin orden"]
        C1["put(Cali, 25000)"] -->|"devuelve el 20000 anterior"| B
        C2["get(Quibd)"] -->|"clave ausente → null, NO lanza"| B
        C3["merge(zona, 1000, Integer::sum)"] -->|"falta: pone 1000 · existe: suma"| B
        B["entradas clave→valor repartidas por hash"]
    end
    ED -->|"por indice: List.get:(I) + checkcast"| L1["for (int i = 0; ...)"]
    B -->|"por clave: siempre O(1) esperado"| L2["for (Map.Entry&lt;K,V&gt; e : mapa.entrySet())"]
```

**Texto alternativo:** a la izquierda, una lista: un arreglo interno (`elementData`) que puede tener más huecos
que elementos, y un `size` que cuenta los ocupados. El hueco pasa de 10 a 15 y de 15 a 22 —eso se midió por
reflexión y es un detalle de esta JDK, declarado en la convención del módulo, no una regla del lenguaje—. A la
derecha, un mapa: no hay posiciones, hay entradas `clave -> valor`, colocadas por el hash de la clave, así que
`put` devuelve lo que había antes, `get` de una clave ausente devuelve `null` sin avisar, y `merge` decide sola si
tocaba poner o sumar. Abajo, los dos caminos de lectura: la lista se recorre pidiendo posiciones
(`List.get:(I)` seguido del `checkcast` que inserta `javac`) o pidiendo un iterador; el mapa se recorre por
`entrySet()`.

#### 6. Explicación

**Nivel 0 — se declara la interfaz, se instancia la clase.** Medido en `tema-4/ListaDeGuias.java`, primera línea
del programa:

```java
List<String> guias = new ArrayList<>();
System.out.println("vacia                    : size " + guias.size() + " · isEmpty " + guias.isEmpty());
```

```text
vacia                    : size 0 · isEmpty true
tras 3 add               : [RF-000123, RF-000124, RF-000125]
```

El tipo de la **variable** es `List`, el del **objeto** es `ArrayList`, y el `<>` de la derecha se completa solo
con el tipo de la izquierda (tema 3 midió qué pasa si intentas `List<Object> v = new ArrayList<String>()`:
`incompatible types: ArrayList<String> cannot be converted to List<Object>`). Declarar `List` no es un adorno de
estilo: es lo que te permite cambiar la implementación mañana sin tocar los métodos que reciben la lista, y es la
que hace que un parámetro diga «no me importa cómo estás guardada». `size 0` y `isEmpty true` son las dos formas
correctas de preguntar lo mismo; la tercera, `guias == null`, es un error de concepto: una lista vacía **existe**,
no está ausente.

**Nivel 0 — `add(i, x)` desplaza; el índice que crees conocer ya no apunta a lo que creías.**

```java
guias.add(1, "RF-000123B");                  // insertar desplaza, no sustituye
System.out.println("add(1, ...)              : " + guias);
System.out.println("que habia en el 2?       : " + guias.get(2));
```

```text
add(1, ...)              : [RF-000123, RF-000123B, RF-000124, RF-000125]
que habia en el 2?       : RF-000124
contiene / indexOf       : true / 3 · ausente -1
```

Compara con `Map.put`: poner una clave que ya existe **sustituye**; insertar en una posición que ya existe
**empuja**. Esa es la asimetría que más caro sale en un refactor: si después del `add(1, …)` alguien recorre con
`get(2)` esperando lo de antes, tiene otra cosa y ninguna excepción le avisa. `indexOf` es la versión de buscar
por valor: `RF-000125` está en la posición 3 —la lista tiene cuatro elementos después del insertar— y una guía
que no está devuelve `-1`, nunca un índice raro. Ese `-1` es la misma convención que `binarySearch` del tema 2
cuando no encuentra, pero invertida: allí el negativo codifica *dónde debería estar*; aquí significa simplemente
*no está*.

**Nivel 0 — hay dos `remove`, y el compilador no te avisa cuando eliges el malo.** Medido en el mismo archivo:

```java
String quitada = guias.remove(0);            // remove(int)  -> por posicion
boolean salio = guias.remove("RF-000124");   // remove(Object) -> por valor
```

```text
remove(0) por posicion   : devolvio RF-000123 · queda [RF-000123B, RF-000124, RF-000125]
remove("RF-000124")     : true · queda [RF-000123B, RF-000125]
```

Fíjate en los dos **retornos**, que son distintos a propósito: `remove(int)` devuelve **el elemento** (por eso lo
recoges en un `String`), `remove(Object)` devuelve **un boolean** diciendo si encontró algo (por eso va a un
`boolean`). Ahora el caso que muerde:

```java
List<Integer> pesos = new ArrayList<>();
pesos.add(10); pesos.add(1); pesos.add(7);
pesos.remove(1);                             // quita el 1 porque esta en la posicion 1
```

```text
pesos.remove(1)          : [10, 7] · quito la POSICION
remove(Integer.valueOf(7)): [10]
```

Con un `int` literal, `remove(1)` llama a `remove(int)`: borra la **posición** 1, que casualmente contenía el
valor `1`, y por eso el programa «funciona» en la demo y se cae en producción cuando el 1 esté en otra casilla.
La sobrecarga de `Object` solo se elige si el argumento **es** un objeto, y con `Integer` eso obliga a escribir
`Integer.valueOf(7)`. El tema 5 desarrolla por qué se escribe `valueOf` y no `new Integer(7)` —el constructor sigue
existiendo en la 25 pero `javac --release 25` lo marca con una *Note* de deprecación, medido en
`tema-5/EncajarYDesencajar.java`— y dónde está la trampa de identidad (`==` entre cajas) que este ejemplo acaba de
rozar. En un `List<String>` no hay ambigüedad posible: `String` no es
`int`, así que el bug **solo existe en colecciones de números** —que son las que produce un `parseInt` de M2—.

**Nivel 0 — el mapa no protesta cuando la clave no está, y ahí está el daño.**

```java
Integer leido = topePorZona.get("Quibd");
System.out.println("get de ausente           : " + leido + " · getOrDefault: " + topePorZona.getOrDefault("Quibd", 0));
try {
    int doble = leido * 2;                   // aqui llega el NullPointerException
}
```

```text
get de ausente           : null · getOrDefault: 0
desempaquetar el null    : NullPointerException
```

`leido * 2` no tiene ningún método que pueda fallar: lo que falla es el **desempaquetado automático** (tema 5). El
`get` de una clave ausente es la única operación de este tema que **no da ninguna señal** —no lanza, no avisa, no
deja rastro— y por eso merece dos remedios que sí se usan: `getOrDefault(k, 0)` si lo que quieres es un valor
neutro, y `merge`/`computeIfAbsent` si lo que quieres es *crear si falta*. Diagnosticado en la traza: un
`NullPointerException` cuya línea es una suma aritmética, sin método en medio, casi siempre es esto.

**Nivel 1 — los cinco verbos del mapa, cada uno con una decisión distinta.** Medido en `tema-4/MapaDeZonas.java`,
en el orden del programa:

```text
tres puestas             : {Cali=20000, Medellin=30000, Bogota=50000} · size 3
put repetido             : devolvio 20000 · queda 25000
putIfAbsent(Medellin)    : 30000 · sigue 30000
putIfAbsent(Pereira)     : null · ya esta 15000
replace de ausente       : null (null = no estaba)
merge acumulando         : {Cali=1000, Medellin=3000, Bogota=1000}
merge ordenado           : {Bogota=1000, Cali=1000, Medellin=3000}
computeIfAbsent          : {Pereira=500, Cali=1000, Medellin=3000, Bogota=1000}
computeIfAbsent ordenado : {Bogota=1000, Cali=1000, Medellin=3000, Pereira=500}
```

Cinco lecturas que hay que saber hacer de memoria:

1. `put` **siempre** escribe y **devuelve el valor anterior** (o `null` si la clave no estaba): `devolvio 20000 ·
   queda 25000`. Ese retorno es el que permite escribir «cambié el tope, guarda el viejo por si hay que
   deshacerlo» sin una segunda pasada.
2. `putIfAbsent(k, v)` **no pisa**: si la clave ya valía 30000, devuelve 30000 y deja 30000. Su nombre dice
   «pongo solo si falta», y su retorno dice qué había.
3. `replace(k, v)` es el espejo: **solo** escribe si la clave existe; de una clave ausente devuelve `null` y no
   crea nada (`replace de ausente : null (null = no estaba)`). Es la operación que quieres cuando un `put`
   escribiría una clave basura a partir de un identificador mal formateado.
4. `merge(k, v, fn)` decide sola: si falta, asocia `v`; si existe, aplica `fn(antiguo, v)`. El bucle de cinco
   zonas con 1000 g cada una deja `Medellin=3000` (tres apariciones), `Cali=1000`, `Bogota=1000`: **contador sin
   preguntar**, que es el reemplazo directo del `if (mapa.get(k) == null)` que casi todo el mundo escribe.
5. `computeIfAbsent(k, fn)` calcula **solo si falta**, y esto es lo que se comprueba en la salida: la segunda
   llamada es `computeIfAbsent("Medellin", z -> 999999)` y Medellin sigue en `3000`, no en 999999. La función no
   se ejecutó. Con `merge` habría sumado 999999; con `computeIfAbsent` no toca lo existente.

Y ahí están las dos líneas `… ordenado`, que no son decoración: son el **filtro del determinismo**. Compare
`merge acumulando : {Cali=1000, Medellin=3000, Bogota=1000}` con `merge ordenado : {Bogota=1000, Cali=1000,
Medellin=3000}`: mismo mapa, mismo `toString` en potencia, distinto orden, porque la segunda impresión pasa las
claves por un `ArrayList` + `Collections.sort` antes de leer el mapa. La convención del módulo dice que el orden
interno de un `HashMap` **no se cifra** en ninguna comprobación; cuando escribí las dos comprobaciones de este
bloque las cifré igualmente sin darme cuenta (pedían la cadena `{Cali=1000, Medellin=3000, …}` tal cual sale del
`HashMap`), así que el laboratorio se corrigió a sí mismo: hoy `verificar.sh` comprueba las dos líneas
`… ordenado`, que son estables, y las dos líneas crudas siguen imprimiéndose para que veas la diferencia. El
programa añade ese orden con el mismo patrón del proyecto guía:

```java
/** Imprime un mapa POR CLAVE ORDENADA: el orden del HashMap nunca entra en una comprobacion. */
static String porClave(Map<String, Integer> mapa) {
    java.util.List<String> claves = new java.util.ArrayList<>(mapa.keySet());
    java.util.Collections.sort(claves);
    StringBuilder sb = new StringBuilder("{");
    for (int i = 0; i < claves.size(); i++) {
        if (i > 0) sb.append(", ");
        sb.append(claves.get(i)).append('=').append(mapa.get(claves.get(i)));
    }
    return sb.append('}').toString();
}
```

Otra observación honesta sobre `{Cali=1000, Medellin=3000, Bogota=1000}`: el orden en que salen impresas las
claves **no** es el de inserción (`Medellin, Bogota, Cali`). El `println` de un mapa imprime en su orden interno,
así que en la documentación de este curso esa línea se cita por sus **pares** clave→valor y nunca por su
secuencia —y en `verificar.sh` directamente no está: la puerta compara texto literal, y el texto literal de un
`HashMap` es justo lo que no se puede prometer—.

**Nivel 1 — orden: `HashMap` no lo garantiza, `LinkedHashMap` sí, y eso se comprueba.**

```text
HashMap conserva el orden de insercion? false
LinkedHashMap si lo conserva: [Medellin, Bogota, Cali]
```

La comprobación está escrita de forma que solo pueda fallar en una dirección: se pregunta si las claves del
`HashMap` coinciden con la secuencia exacta que se insertó (`[Medellin, Bogota, Cali, Pereira]`) y se exige que la
respuesta sea `false`. Si alguna futura JDK tuviera la «suerte» de conservar el orden, la comprobación salta y
obligamos a mirar el tema; mientras tanto no ciframos en qué orden sale, porque ese orden es política de la
implementación y cambia con el `hashCode` y con la capacidad interna. `LinkedHashMap` sí es una garantía del
contrato —mantiene una lista enlazada sobre las entradas— y por eso ahí sí se cita la secuencia literal: las tres
claves del mapa de orden se insertaron en ese orden (`Medellin`, `Bogota`, `Cali`) y salen en ese orden.

Las tres vistas (`keySet()`, `values()`, `entrySet()`) no cambian la regla: cada una recorre el **mismo** mapa
interno, así que heredan su orden. Las dos líneas de abajo salen del `HashMap`, no del `LinkedHashMap`, y por eso
**no están en `verificar.sh`**: se imprimen para que las veas, y la puerta comprueba los `… ordenado`.

```text
claves                   : [Pereira, Cali, Medellin, Bogota]
valores                  : [15000, 25000, 30000, 50000]
entrada mayor a 25 kg     : Medellin -> 30000
entrada mayor a 25 kg     : Bogota -> 50000
```

Y aquí va la tentación que hay que nombrar porque este corrido la pone delante: los `valores` salieron ordenados
de menor a mayor, y las `claves` en el orden que hace esa secuencia creciente (Pereira 15 000, Cali 25 000,
Medellín 30 000, Bogotá 50 000). Es un accidente del `hashCode` de estas cuatro claves con esta capacidad, **no**
una propiedad de `HashMap`: `HashMap` no ordena ni por clave ni por valor. Por eso el filtro de la sección se
comprueba por el par `clave -> valor` (`Medellin -> 30000`) y no por la posición que ocupa en la impresión, y por
eso ninguna de estas cuatro líneas está en la puerta.

**Nivel 1 — `null`: una política para el mapa, otra para la vitrina.** Medido en `MapaDeZonas.java` y
`FijasYMutables.java`:

```text
clave null               : sin zona asignada · valor null: null · contiene clave true
HashMap con null  : null · la clave si esta: true
List.of + add     : UnsupportedOperationException · mensaje: null
Map.of + put      : UnsupportedOperationException · mensaje: null
List.of con null  : NullPointerException · sin mensaje
```

Un `HashMap` admite **una** clave `null` y cualquier cantidad de valores `null`: `put(null, "sin zona asignada")`
funciona, `get` de una clave con valor `null` devuelve `null` **y además** `containsKey` dice `true` —las dos cosas
a la vez es lo que prueba que `null` como valor es distinto de «clave ausente»—. `List.of` y `Map.of` hacen lo
contrario a propósito: rechazan `null` al construir (NPE) y rechazan cualquier escritura después
(`UnsupportedOperationException`). No es un capricho: una colección que va a viajar entre módulos sin copia no
puede tener huecos que alguien confunda con «dato ausente». Dos detalles de la salida que conviene registrar como
se ven: el mensaje de las dos `UnsupportedOperationException` es literalmente `null` (`mensaje: null`), y por eso
en el texto se cita la **clase** de la excepción y no su mensaje, y el programa que intenta `List.of("a", null)`
lo etiqueta como `sin mensaje` en vez de imprimir el objeto.

**Nivel 2 — borrar mientras recorres: el fallo ya lo viste en M3; aquí van las cuatro salidas.** El error
reproducible `tema-4/errores/IterarYBorrar.java` (medido, con la traza tal cual sale):

```text
visto: RF-000123
Exception in thread "main" java.util.ConcurrentModificationException
	at java.base/java.util.ArrayList$Itr.checkForComodification(ArrayList.java:1104)
	at java.base/java.util.ArrayList$Itr.next(ArrayList.java:1058)
	at IterarYBorrar.main(IterarYBorrar.java:10)
```

La explicación es la del [Módulo 3 · tema 3](modulo-3.md): el iterador lleva la cuenta de modificaciones esperada
y la compara en cada `next()`; si la lista cambió por fuera, protesta. Y el Javadoc de `ArrayList` lo dice en su
párrafo de *fail-fast*, que hay que leer entero porque la última frase es la que manda en un diagnóstico:

> «The iterators returned by this class's `iterator` and `listIterator` methods are *fail-fast*: if the list is
> structurally modified at any time after the iterator is created, in any way except through the iterator's own
> `remove` or `add` methods, the iterator will throw a `ConcurrentModificationException`. […] Note that the
> fail-fast behavior of an iterator cannot be guaranteed as it is, generally speaking, impossible to make any hard
> guarantees in the presence of unsynchronized concurrent modification. Fail-fast iterators throw
> `ConcurrentModificationException` on a best-effort basis. Therefore, it would be wrong to write a program that
> depended on this exception for its correctness: *the fail-fast behavior of iterators should be used only to
> detect bugs.*»

«On a best-effort basis» es exactamente la intermitencia que midió M3, y «only to detect bugs» es la razón de que la
regla del curso sea **no escribir código que dependa de que lance**: o borras por el iterador, o no borras mientras
recorres. Dos cosas más de la traza de arriba: el fallo llega en el `next()` **siguiente**, no en el `remove()`
—por eso viste `visto: RF-000123` antes del golpe—, y las tres líneas `at java.base/...` son del fuente de la JDK:
**ninguna comprobación de este curso mira esos números de línea**, porque cambian entre versiones de Temurin; lo que
es tuyo y sí se lee es `IterarYBorrar.java:10`. Las cuatro formas legales, medidas en
`tema-4/BorrarSinRomper.java` —cada una borra **una guía distinta**, por eso los cuatro resultados difieren y los
cuatro son correctos—:

```text
removeIf                 : [RF-000123, RF-000124, RF-000125]
iterator.remove          : visitados 4 · queda [RF-000123, RF-000125, RF-000900]
recorrer una copia       : [RF-000123, RF-000124, RF-000900]
for con indice al reves  : [RF-000124, RF-000125, RF-000900]
```

La parte de la izquierda dice qué se llevó: `removeIf` quita las que terminan en `900`; `iterator.remove` quita
`RF-000124` **después** de visitar las cuatro (por eso `visitados 4`); el bucle sobre una copia quita
`RF-000125`; y el `for` hacia atrás quita `RF-000123`. Que hacia atrás funcione es una consecuencia directa del
Tema 1: borrar en la posición `i` solo renumera las casillas de **después**, así que descendiendo nunca pisas una
posición que todavía no has mirado. Hacia adelante con índice sí la pisas, y además **te saltas** el vecino que
ocupó su lugar —eso no lanza excepción, simplemente se procesa de menos, que es peor—.

**Nivel 2 — qué hay realmente debajo de los dos `for`.** `tema-4/por-dentro/RecorridoEnBytecode.java` escribe la
misma suma de dos maneras y las ejecuta:

```java
static long conIndice(List<Integer> pesos) {
    long s = 0;
    for (int i = 0; i < pesos.size(); i++) { s += pesos.get(i); }
    return s;
}
static long conForEach(List<Integer> pesos) {
    long s = 0;
    for (int p : pesos) { s += p; }
    return s;
}
```

```text
conIndice / conForEach : 5540 / 5540
con iterator           : 2 vueltas
```

`javap -c` sobre el mismo `.class` (generado con `javac --release 25`) muestra la diferencia de forma:

```text
17: invokeinterface #13,  2   // InterfaceMethod java/util/List.get:(I)Ljava/lang/Object;
22: checkcast     #17         // class java/lang/Integer
```
```text
 3: invokeinterface #22,  1   // InterfaceMethod java/util/List.iterator:()Ljava/util/Iterator;
10: invokeinterface #26,  1   // InterfaceMethod java/util/Iterator.hasNext:()Z
19: invokeinterface #32,  1   // InterfaceMethod java/util/Iterator.next:()Ljava/lang/Object;
24: checkcast     #17         // class java/lang/Integer
```

Cuatro cosas se leen aquí. (1) El `for`-each sobre una `List` **es** un iterador: no hay segunda sintaxis secreta,
hay `List.iterator()` y luego `hasNext`/`next`. (2) Los dos caminos llevan un `checkcast Integer`: el tipo se
borró (tema 3) y la reconstrucción de la expectativa la hace `javac` en el punto de uso. (3) La suma sale **igual
por los dos caminos** (`5540 / 5540`), y eso es el argumento honesto para elegir por legibilidad, no por «creer que
uno es más rápido». (4) Este ejemplo no se inventó una comparación: son literalmente los dos bucles que el Javadoc
de `java.util.RandomAccess` (SE 25) usa como regla para decidir si una lista implementa la marca:

> «As a rule of thumb, a `List` implementation should implement this interface if, for typical instances of the
> class, this loop: `for (int i=0, n=list.size(); i < n; i++) list.get(i);` runs faster than this loop:
> `for (Iterator i=list.iterator(); i.hasNext(); ) i.next();`»

Y dice por qué la marca existe:

> «Marker interface used by `List` implementations to indicate that they support fast (generally constant time)
> random access. The primary purpose of this interface is to allow generic algorithms to alter their behavior to
> provide good performance when applied to either random or sequential access lists. The best algorithms for
> manipulating random access lists (such as `ArrayList`) can produce quadratic behavior when applied to sequential
> access lists (such as `LinkedList`).»

Medido en la propia ejecución: `ArrayList es RandomAccess : true`, `LinkedList es RandomAccess: false`. Es una
**marca vacía** —no aporta ningún método— y lo que informa es que pedir posiciones sueltas en una lista enlazada no
es gratis. El coste con números lo mide el tema 6; aquí te quedas con la regla de dedo del Javadoc: `for`-each si
no necesitas la posición, con índice solo sobre una lista que declare la marca.

Dos contrastes más del mismo archivo, que son confusiones reales con código real:

```text
arreglo.length / lista.size(): 3 / 3
equals de listas          : true · lista.equals(arreglo): false
```

`length` es un **campo** del arreglo (tema 1); `size()` es un **método** de la lista. El valor es el mismo; la
sintaxis no es intercambiable y el error de tipeo más común del primer proyecto es poner `lista.length` (no
compila: `cannot find symbol`) o `arreglo.size()` (tampoco). Y `equals`: dos listas con los mismos elementos en el
mismo orden son `equals` (`true`), mientras una lista **jamás** es `equals` a un arreglo con esos mismos números
(`false`) —los arreglos no redefinen `equals`, tema 2 midió `Arrays.equals` precisamente para eso—.

**Nivel 3 — cómo crece un `ArrayList`, medido por dentro y declarado como excepción.**
`tema-4/por-dentro/Crecimiento.java` lee el campo privado `elementData` por reflexión, así que exige
`java --add-opens java.base/java.util=ALL-UNNAMED`. Con la apertura, medido:

```text
recien creada : size 0 · hueco 0
tras 1 add    : size 1 · hueco 10
tras 10       : size 10 · hueco 10
tras 11       : size 11 · hueco 15
tras 16       : size 16 · hueco 22
los saltos    : 5 y 7 · cada salto es hueco viejo + hueco viejo/2
```

Cuatro hechos: una `ArrayList` recién creada tiene hueco **0** (no reserva los 10 hasta el primer `add`), el primer
`add` lo lleva a 10, el undécimo a 15 y el decimosexto a 22. La regla que reproduce los dos saltos es
«hueco viejo + hueco viejo / 2» (`10 + 5`, `15 + 7`). Hay que mirar esos cuatro números con las dos frases del
Javadoc de `java.util.ArrayList` (SE 25) delante, porque parecen contradicción y no lo son. El constructor sin
argumentos promete otra cosa de la que se ve por reflexión:

> «`ArrayList()` — Constructs an empty list with an initial capacity of ten.»

y la descripción de la clase dice literalmente:

> «Each `ArrayList` instance has a *capacity*. The capacity is the size of the array used to store the elements in
> the list. It is always at least as large as the list size. As elements are added to an ArrayList, its capacity
> grows automatically. **The details of the growth policy are not specified** beyond the fact that adding an element
> has constant amortized time cost.»

O sea: «capacidad inicial diez» es la capacidad **prometida**, y el arreglo que mide `elementData` tiene **0** hasta
el primer `add` porque la asignación es perezosa —`size 0 · hueco 0`, medido en la primera línea del ejemplo—; los
diez se materializan al escribir el primer elemento. Y «the details of the growth policy are not specified» es la
razón exacta de que en este curso el 10, el 15 y el 22 se citen como **medidos** y no como regla: lo que el contrato
sí fija es el coste (`add` en *amortized constant time*, o sea «adding n elements requires O(n) time»), no la
secuencia. El número sale del código de esta JDK; abrí el fuente empaquetado
(`$JAVA_HOME/lib/src.zip` de Temurin 27) y son `java.util.ArrayList:119` `DEFAULT_CAPACITY = 10`, el comentario de
`java.util.ArrayList:137` («*will be expanded to DEFAULT_CAPACITY when the first element is added*») y, en el método
que agranda, `java.util.ArrayList:235`:

```java
int newCapacity = ArraysSupport.newLength(oldCapacity,
        minCapacity - oldCapacity, /* minimum growth */
        oldCapacity >> 1           /* preferred growth */);
```

`oldCapacity >> 1` es literalmente «la mitad del hueco viejo», y de ahí salen los 5 y los 7 medidos. **Sin la
apertura el programa no finge**: imprime `sin la apertura no hay medida: InaccessibleObjectException · usa java
--add-opens java.base/java.util=ALL-UNNAMED` y sale con código **1** (medido). Eso es lo que hace honesta la
comprobación: o se mide, o el laboratorio falla.

**Nivel 3 — colecciones fijas: la solución es copiar, no pelear.** `tema-4/FijasYMutables.java`:

```java
List<String> fijas = List.of("RF-000123", "RF-000124");
Map<String, Integer> fijoMapa = Map.of("Medellin", 30000);
// La solucion no es pelear con la coleccion fija: es copiarla en una que si crece.
List<String> mutables = new ArrayList<>(fijas);
mutables.add("RF-000125");
```

```text
copia en ArrayList: [RF-000123, RF-000124, RF-000125]
original intacta  : [RF-000123, RF-000124]
recibida por un metodo: 200
copia de mapa fijo  : size 2 · el original sigue en 1
```

El constructor de copia es la pieza que une los dos mundos: `new ArrayList<>(cualquierCollection)` y
`new HashMap<>(cualquierMap)` aceptan fijas y devuelven editables, y el `original intacta`/`el original sigue en 1`
de las salidas demuestra que la copia es **de la estructura**, no de los elementos: los `String` y los `Integer`
son compartidos (son inmutables: M2 tema 1 y tema 5). Y `recibida por un metodo: 200` es el premio del diseño:
`totalDe(List<String>)` puede recibir la vitrina sellada sin miedo a que la modifique, porque no puede. Por eso
la recomendación del proyecto guía es la que es: **parámetros y valores de retorno como `List.of`/ colecciones no
editables cuando el llamador no debe tocar nada**, `ArrayList`/`HashMap` cuando sí hay que acumular.

**Qué declara realmente cada tipo (medido con `javap` sobre la propia JDK).**

```text
public class java.util.ArrayList<E> extends java.util.AbstractList<E> implements java.util.List<E>, java.util.RandomAccess, java.lang.Cloneable, java.io.Serializable {
public class java.util.HashMap<K, V> extends java.util.AbstractMap<K, V> implements java.util.Map<K, V>, java.lang.Cloneable, java.io.Serializable {
public class java.util.LinkedHashMap<K, V> extends java.util.HashMap<K, V> implements java.util.SequencedMap<K, V> {
```

Tres lecturas: `ArrayList` **sí** implementa `RandomAccess` —no es una convención de los programadores, es una
marca en la clase, y por eso `instanceof RandomAccess` es una pregunta válida en tiempo de ejecución—; `HashMap`
no la implementa (no tiene sentido: no hay posiciones), y `LinkedHashMap` **extiende** `HashMap` y añade
`SequencedMap`, que es la interfaz que desde JDK 21 formaliza «hay un primer y un último elemento definidos». Ese
es el punto donde la garantía de orden deja de ser folklore: no es que «suele salir en orden», es que la clase
que lo promete está declarada.

#### 7. Código ejecutable

**Ejemplo mínimo** · archivo `tema-4/ListaDeGuias.java` · ejecuta
`javac --release 25 -d out tema-4/ListaDeGuias.java && java -Dstdout.encoding=UTF-8 -cp out ListaDeGuias`

```java
import java.util.ArrayList;
import java.util.List;

public class ListaDeGuias {
    public static void main(String[] args) {
        List<String> guias = new ArrayList<>();
        System.out.println("vacia                    : size " + guias.size() + " · isEmpty " + guias.isEmpty());
        guias.add("RF-000123");
        guias.add("RF-000124");
        guias.add("RF-000125");
        guias.add(1, "RF-000123B");                  // insertar desplaza, no sustituye
        String quitada = guias.remove(0);            // remove(int)  -> por posicion
        boolean salio = guias.remove("RF-000124");   // remove(Object) -> por valor
        guias.addAll(java.util.List.of("RF-000200", "RF-000201"));
        guias.clear();
        System.out.println("clear                    : size " + guias.size() + " · isEmpty " + guias.isEmpty());
    }
}
```

Salida completa (11 líneas; nueve están citadas en la sección 6 y `addAll` y `clear` son las dos que cierran el
programa):

```text
vacia                    : size 0 · isEmpty true
tras 3 add               : [RF-000123, RF-000124, RF-000125]
add(1, ...)              : [RF-000123, RF-000123B, RF-000124, RF-000125]
que habia en el 2?       : RF-000124
contiene / indexOf       : true / 3 · ausente -1
remove(0) por posicion   : devolvio RF-000123 · queda [RF-000123B, RF-000124, RF-000125]
remove("RF-000124")     : true · queda [RF-000123B, RF-000125]
pesos.remove(1)          : [10, 7] · quito la POSICION
remove(Integer.valueOf(7)): [10]
addAll                   : size 4 · [RF-000123B, RF-000125, RF-000200, RF-000201]
clear                    : size 0 · isEmpty true
```

**El mapa** · `tema-4/MapaDeZonas.java`. El bloque que hay que copiar a mano (y que es el patrón que vas a usar
en el resto del curso):

```java
Map<String, Integer> pesosPorZona = new HashMap<>();
for (String zona : new String[] {"Medellin", "Bogota", "Medellin", "Cali", "Medellin"}) {
    pesosPorZona.merge(zona, 1000, Integer::sum);            // contador, sin preguntar si existe
}
System.out.println("merge acumulando         : " + pesosPorZona);
System.out.println("merge ordenado           : " + porClave(pesosPorZona));   // el orden SÍ citable
pesosPorZona.computeIfAbsent("Pereira", z -> 500);           // no estaba: se calcula y entra
pesosPorZona.computeIfAbsent("Medellin", z -> 999999);       // si estaba: la funcion NO se ejecuta
```

Salida completa: 18 líneas, **todas citadas en la sección 6**: dos en el nivel 0 (el `get` de la clave ausente y su
`NullPointerException`) y dieciséis en el nivel 1 (los cinco verbos del mapa con sus dos impresiones ordenadas,
las dos respuestas de orden, las cuatro líneas de vistas y filtro, y la fila del `null`).

**Borrar sin romper** · `tema-4/BorrarSinRomper.java`, las cuatro pasadas sobre la misma lista base
`[RF-000123, RF-000124, RF-000125, RF-000900]`:

```java
List<String> dos = new ArrayList<>(base);
Iterator<String> it = dos.iterator();
int visitados = 0;
while (it.hasNext()) {
    String guia = it.next();
    visitados++;
    if (guia.endsWith("24")) {
        it.remove();                         // legal: borra lo que el iterador acaba de entregar
    }
}
```

y la variante con índice, que funciona porque va **hacia atrás**:

```java
for (int i = cuatro.size() - 1; i >= 0; i--) {
    if (cuatro.get(i).endsWith("23")) { cuatro.remove(i); }
}
```

Salida: las cuatro líneas medidas de la sección 6 (nivel 2).

**Por dentro** · `tema-4/por-dentro/RecorridoEnBytecode.java` (los dos `for` y el `javap` pegado arriba) y
`tema-4/por-dentro/Crecimiento.java` (el hueco por reflexión). El segundo es el único ejemplo del módulo que
necesita una apertura de módulo; sin ella falla en vez de fingir:

```bash
javac --release 25 -d out tema-4/por-dentro/Crecimiento.java
java --add-opens java.base/java.util=ALL-UNNAMED -cp out Crecimiento   # mide
java -cp out Crecimiento                                               # sin la apertura: codigo 1
```

**Proyecto guía** · `src/main/java/rutaflow/nucleo/Manifiesto.java` usa las dos colecciones de este tema para la
mitad del programa: `gramosLista(String[])` devuelve `List<Integer>` construida con `add` (línea 78) y
`totalesPorZona(String[])` acumula con `merge` (línea 93). La tercera pieza que solo podía salir en colecciones es
`totalesOrdenados`, que copia las claves en una `ArrayList`, la ordena con `Collections.sort` y **luego** lee el
mapa por clave —es la forma correcta de imprimir un `HashMap` de manera determinista, y la usan las 9 pruebas del
proyecto para cuadrar las dos versiones:

```java
java.util.Map<String, Integer> crudos = totalesPorZona(guias);
List<String> claves = new ArrayList<>(crudos.keySet());
java.util.Collections.sort(claves);
```

Ejecutado sin argumentos (`java -cp out rutaflow.nucleo.Manifiesto`, medido con `javac --release 25`), el contraste
que demuestra que el orden es una **decisión** y no un accidente:

```text
  sobre el tope 1000  : [1250, 2100, 3400] · contando con binarySearch: 3
  sobre el tope 1000  : [1250, 3400, 2100] · cantidad: 3
```

La versión con arreglos ordena (porque `binarySearch` del tema 2 **exige** orden para valer); la versión con
colecciones conserva el orden de llegada (porque un filtro sobre `ArrayList` no ordena nada). Los dos conjuntos son
el mismo y los dos cuentan 3; las secuencias impresas son distintas. Eso es exactamente lo que la prueba
`lasDosVersionesDelReporteCuadran` no puede comprobar comparando textos, y por eso compara sumas y longitudes.

#### 8. Mini-laboratorio

Escribe los archivos desde cero en `laboratorios/modulo-4/tema-4/`. Antes de ejecutar cada uno, escribe en un
comentario qué crees que va a imprimir; la diferencia entre lo que escribiste y lo que salió **es** el ejercicio.

1. Crea `MiLista.java`: una `List<String>` de guías declarada con la interfaz, tres `add`, un `add(0, ...)` y
   luego imprime `size()`, `get(0)`, `get(1)` y `get(2)`. Predice los tres `get` antes de ejecutar. Si predijiste
   la misma guía dos veces, ya sabes qué hace `add(i, x)`.
2. Crea `DosRemove.java`: una `List<Integer>` con los valores `10, 1, 7` en ese orden; llama a `remove(1)`,
   imprime el resultado, y después llama a `remove(Integer.valueOf(1))` e imprime otra vez. Pega las dos salidas y
   escribe debajo, en comentario, **qué sobrecarga eligió cada línea y por qué el compilador no dijo nada**.
   Remata con una `List<String>` que intente `remove(0)`: aquí el compilador **sí** protesta, y esa asimetría es la
   prueba de que el bug anterior solo existe con números.
3. Crea `ContadorZonas.java`: recibe un `String[]` de guías formato `"RF-000123:1250"` (parte con `split` de M2),
   devuelve un `Map<String, Integer>` con el total de gramos por zona usando **solo** `merge`, e imprime el mapa.
   Después cambia `merge` por `totales.put(zona, g)` y vuelve a ejecutar: la segunda guía de una zona **borra** a
   la primera y el total se cae. Deja las dos salidas pegadas en comentario. (Este es el paso que reproduce el
   fallo que `verificar.sh` caza en el proyecto guía con `losTotalesPorZonaAcumulan`.)
4. Crea `NuloAlDesempacar.java`: un `Map<String, Integer>` con dos zonas, y tres líneas que lean una clave
   ausente: `get` suelto imprimir, `get` dentro de una suma (`int x = mapa.get("Quibd") + 1`) e `int y =
   mapa.getOrDefault("Quibd", 0) + 1`. Pega la traza del `NullPointerException` y anota **en qué columna** falla.
5. Crea `BorraYCamina.java`: parte de `["RF-000123", "RF-000124", "RF-000125", "RF-000900"]` y haz **cinco**
   pasadas: (a) `for`-each con `lista.remove(x)` dentro —pega la traza—, (b) `for` con índice **hacia adelante**
   borrando, (c) `for` con índice hacia atrás, (d) `iterator.remove()`, (e) `removeIf`. Las salidas de (a) y (b)
   cuentan la misma historia con dos síntomas distintos: una lanza, la otra **se salta un elemento en silencio**.
   Demuestra la segunda con un caso de dos coincidencias seguidas, y escribe el por qué en comentario.
6. Crea `FijaYCopia.java`: `List.of("a", "b")`, un `add` dentro de `try/catch` con el mensaje (verás que es
   `null`), un `List.of("a", null)` en otro `try/catch`, y la solución con `new ArrayList<>(fija)`. Termina
   imprimiendo las dos para que quede que la original sigue intacta.
7. Crea `OrdenDeMapa.java`: mete `"Medellin"`, `"Bogota"`, `"Cali"` en un `HashMap` y en un `LinkedHashMap` e
   imprime los dos `keySet()`. Después contesta por escrito: ¿cuál de las dos impresiones puedes citar en un test
   y cuál no, y por qué? (Pista: mira cómo lo resuelve `Manifiesto.totalesOrdenados`.)

**Listo cuando** puedas (1) decir qué devuelve cada una de `add`, `remove(int)`, `remove(Object)`, `put`,
`putIfAbsent`, `replace`, `merge` y `computeIfAbsent` sin abrir el Javadoc, (2) explicar por qué `pesos.remove(1)`
no da error de compilación **y** es un bug, (3) escribir de memoria las cuatro formas de borrar mientras recorres,
y (4) decir qué garantía de orden da `HashMap`, cuál da `LinkedHashMap` y qué hace el proyecto guía para que su
reporte sea determinista.

#### 9. Verificación

```bash
cd docs/reestructuracion/cursos/java/laboratorios/modulo-4
javac --release 25 -d /tmp/a tema-4/*.java && javac --release 25 -d /tmp/b tema-4/por-dentro/*.java
java -Dstdout.encoding=UTF-8 -cp /tmp/a ListaDeGuias        # «pesos.remove(1)          : [10, 7] · quito la POSICION»
java -Dstdout.encoding=UTF-8 -cp /tmp/a MapaDeZonas         # «merge ordenado           : {Bogota=1000, Cali=1000, Medellin=3000}»
java -Dstdout.encoding=UTF-8 -cp /tmp/a BorrarSinRomper     # «iterator.remove          : visitados 4 · queda […]»
java -Dstdout.encoding=UTF-8 -cp /tmp/a FijasYMutables      # «copia de mapa fijo  : size 2 · el original sigue en 1»
java -Dstdout.encoding=UTF-8 -cp /tmp/b RecorridoEnBytecode # «conIndice / conForEach : 5540 / 5540»
java -Dstdout.encoding=UTF-8 --add-opens java.base/java.util=ALL-UNNAMED -cp /tmp/b Crecimiento  # «tras 16       : size 16 · hueco 22»
java -Dstdout.encoding=UTF-8 -cp /tmp/b Crecimiento; echo "codigo=$?"     # sin la apertura: aviso y codigo 1
javac -d /tmp/c tema-4/por-dentro/RecorridoEnBytecode.java
javap -c -cp /tmp/c RecorridoEnBytecode | grep 'List.iterator:()Ljava/util/Iterator;'
javap -c -cp /tmp/c RecorridoEnBytecode | grep 'List.get:(I)Ljava/lang/Object;'
javac --release 25 -d /tmp/d tema-4/errores/IterarYBorrar.java
java -cp /tmp/d IterarYBorrar       # java.util.ConcurrentModificationException  (codigo distinto de 0)
java -cp /tmp/d VaciaConIndice      # IndexOutOfBoundsException: Index 0 out of bounds for length 0
java -cp /tmp/d ImmutablesNoCrecen  # java.lang.UnsupportedOperationException
```

Aquí las **43** comprobaciones del tema pasan con Temurin 27 y `--release 25`, y el total del laboratorio sigue en
**188 / 0 fallidas / 0 omitidas** (el reparto medido bloque a bloque: T1 25 · T2 35 · T3 30 · T4 43 · T5 29 ·
T6 22 · Gradle 4). Dentro de las 43 hay 38 de salida ejecutada, **2 de bytecode**
(`List.iterator:()Ljava/util/Iterator;` y `List.get:(I)Ljava/lang/Object;`, las dos parejas del mismo
`RecorridoEnBytecode`), 3 que exigen código ≠ 0 **y** el texto de la excepción, y 1 que exige el código **1** del
programa sin `--add-opens`. Las dos comprobaciones del contador por zona pedían antes la cadena tal como la imprime
un `HashMap`; hoy piden `merge ordenado` y `computeIfAbsent ordenado`, que son estables, así que el tema dejó de
depender del orden interno del mapa sin perder ni una comprobación.

*Pendiente de reejecución en JDK 25:* los cinco números del hueco (`0, 10, 15, 22` y los saltos `5` y `7`) y la
cadena `cada salto es hueco viejo + hueco viejo/2` son política de implementación de `java.util.ArrayList`; están
fijados en `verificar.sh` contra Temurin 27 y hay que volver a registrarlos con el ejecutable 25 (la *regla* salta
a la vista en la propia salida, así que si el número cambia se ve en la comprobación, no en producción). También es
pendiente el texto de las tres excepciones (`IndexOutOfBoundsException: Index 0 out of bounds for length 0`, el
`UnsupportedOperationException` con mensaje `null` y el `ConcurrentModificationException`), que lo redacta la JDK.
Lo que **no** depende de la versión: la existencia de los dos `remove`, la semántica de `merge`/`computeIfAbsent`,
que `get` de ausente sea `null`, que `LinkedHashMap` conserve el orden de inserción y que `ArrayList` sea
`RandomAccess` mientras `LinkedList` no.

#### 10. Error común y diagnóstico

**Síntoma 1 — `NullPointerException` en una línea que solo suma.** El caso `leido * 2`. No hay ningún método en
esa línea; lo que hubo fue un `get` que devolvió `null` y un desempaquetado automático. Medido:

```text
get de ausente           : null · getOrDefault: 0
desempaquetar el null    : NullPointerException
```

**Arreglo:** decidir **antes** de leer. `getOrDefault(k, 0)` si el neutro es un número; `merge(k, v, Integer::sum)`
si estás acumulando; `computeIfAbsent(k, ...)` si el valor por defecto es una colección nueva. **No arregla esto:**
`try/catch (NullPointerException)` alrededor de la suma —eso convierte un contrato mal pensado en un silencio—.

**Síntoma 2 — «borré un elemento y se fue otro».** `pesos.remove(1)` (medido: `[10, 7] · quito la POSICION`). El
diagnóstico es mirar el **tipo estático del argumento**: `int` → posición; cualquier cosa referencia → valor. Con
cajas hay que empaquetar a propósito: `remove(Integer.valueOf(7))` deja `[10]`. Un truco de revisión que funciona:
si ves `remove(` con un literal numérico dentro de una `List<Integer>`, es un candidato a bug y merece un test con
**tres** valores donde el buscado no esté en su propia posición.

**Síntoma 3 — `ConcurrentModificationException` «a veces».** El caso ya diagnosticado en M3 tema 3, aquí con la
salida escrita. Medido en `errores/IterarYBorrar.java`:

```text
Exception in thread "main" java.util.ConcurrentModificationException
```

con el recorrido partiendo por la mitad (`visto: RF-000123` y nunca llega a `nunca llega aqui`). **Arreglo:** una
de las cuatro que funcionan (`removeIf`, `iterator.remove()`, copiar y recorrer, índice hacia atrás). **Por qué
parece intermitente:** el iterador solo protesta si todavía cree que queda una vuelta; borrando la última posición
el `hasNext()` corta el bucle **sin comprobar** y la lista queda modificada sin ninguna excepción —eso lo midió el
[Módulo 3 · tema 3](modulo-3.md) con `BorraDetras.java`—. Un fallo que a veces lanza y a veces deja los datos
tocados es exactamente el que no aparece en las pruebas.

**Síntoma 4 — «mi servicio no crece: `UnsupportedOperationException`».** Medido dos veces:
`List.of + add : UnsupportedOperationException · mensaje: null` y en la traza de
`errores/ImmutablesNoCrecen.java`:

```text
Exception in thread "main" java.lang.UnsupportedOperationException
	at java.base/java.util.ImmutableCollections.uoe(ImmutableCollections.java:156)
	at java.base/java.util.ImmutableCollections$AbstractImmutableCollection.add(ImmutableCollections.java:161)
	at ImmutablesNoCrecen.main(ImmutablesNoCrecen.java:10)
```

**Causa:** alguien pasó una `List.of` por un parámetro que se usa para acumular. **Arreglo:** decidir en la
frontera, no dentro del método: si el método **acumula**, pide `List` y crea su propia copia; si el método **lee**,
recibe la fija sin miedo (medido: `recibida por un metodo: 200`). Y **no** parches el cristal del `List.of` con
`Collections.unmodifiableList` encima de un `ArrayList` editable que guardas en un campo: eso sigue siendo tuyo.

**Síntoma 5 — «el reporte sale en otro orden y el test falló».** Es `HashMap` cumpliendo su contrato, no
rompiéndolo. Medido: `HashMap conserva el orden de insercion? false`. **Arreglo:** si el orden es parte del
resultado, usa `LinkedHashMap` (que sí lo garantiza y cuya salida sí se puede fijar en un test:
`LinkedHashMap si lo conserva: [Medellin, Bogota, Cali]`) o ordena las claves explícitamente como hace
`Manifiesto.totalesOrdenados` con `Collections.sort`. Lo que nunca se hace es fijar en un test el orden en que sale
un `HashMap`: se pasa hoy y rompe mañana sin que hayas cambiado nada.

**Errores de ejecución reales** (medidos con `java` sobre `--release 25`; los tres **compilan**, que es el punto):

```text
java.util.ConcurrentModificationException                        (IterarYBorrar.java:10)
java.lang.IndexOutOfBoundsException: Index 0 out of bounds for length 0   (VaciaConIndice.java:11)
java.lang.UnsupportedOperationException                            (ImmutablesNoCrecen.java:10)
```

El del medio es el mismo error del tema 1 con otro nombre y otro mensaje: un arreglo dice
`ArrayIndexOutOfBoundsException` con `Index 5 out of bounds for length 5`; una lista dice
`IndexOutOfBoundsException` —la clase base— con `Index 0 out of bounds for length 0`. Que el mensaje sea de
`java.lang` y no de `java.util` es la señal de que vienes de `ArrayList`, que reutiliza las comprobaciones de
índice de la biblioteca.

#### 11. Pregunta con respuesta modelo

**Comprensión.** ¿Cuántas líneas de salida produce `System.out.println(mapa)` si el mapa tiene tres claves, y qué
pasa si le pides una cuarta que no existe?

**Respuesta modelo:** una sola línea con las tres entradas, en el orden interno del mapa —que **no** es el de
inserción, medido como `false`—; por eso el orden de esa línea no se puede usar como aserción. Pedir la cuarta no
produce ninguna excepción: `get` devuelve `null` y el fallo, si llega, llega después al usar ese `null`
(medido: `get de ausente : null · getOrDefault: 0` y luego `desempaquetar el null : NullPointerException`). Si lo
que quieres es el orden garantizado, la clase es `LinkedHashMap`; si lo que quieres es el orden *de mayor a menor
por clave* con coste de búsqueda logarítmico, la clase es `TreeMap` —ahí sí se cita la secuencia, porque el orden
por clave es contrato—, y ese mapa se trabaja en M12 · tema 3 (variantes `Hash`, `LinkedHash` y `Tree`, con
`NavigableMap` y consultas por rango). Si lo que quieres es
determinismo de impresión sobre un `HashMap`, copias `keySet()` a un `ArrayList`, la ordenas con
`Collections.sort` y lees el mapa por clave —eso es literalmente `totalesOrdenados` del proyecto guía—.

**Comprensión.** `List<String> fija = List.of("a", "b"); fija.add("c");` — ¿qué falla en qué momento: compilación o ejecución?

**Respuesta modelo:** en **ejecución**, con `UnsupportedOperationException` y mensaje `null` (ambos medidos). La
compilación no puede protestar porque `add` existe en `List`: la implementación devuelta por `List.of` simplemente
decide no soportarla, que es lo contrario de un arreglo de referencias con el `add` ausente por diseño —una colección
fija se parece a `String` más que a un arreglo—. El remedio no es capturar la excepción: es copiar
(`new ArrayList<>(fija)`), y la prueba de que la copia es superficial es que el original sigue
`[RF-000123, RF-000124]` mientras la copia llegó a tres.

**Comprensión.** ¿Qué hay escrito en el bytecode de un `for`-each sobre una `List` y qué hay en un `for` con
índice? ¿Por qué la suma da lo mismo?

**Respuesta modelo:** el `for`-each se compila a `List.iterator:()Ljava/util/Iterator;` y luego
`Iterator.hasNext:()Z` / `Iterator.next:()Ljava/lang/Object;` con un `checkcast` al tipo declarado; el `for` con
índice se compila a `List.get:(I)Ljava/lang/Object;` más su `checkcast`, llamado una vez por vuelta. La suma da lo
mismo (`5540 / 5540`) porque ambas rutas son semánticamente «recorrer en orden de posición»; se diferencian en el
**coste por vuelta**, que depende de la implementación: `ArrayList` implementa la marca `RandomAccess`, `LinkedList`
no (las dos respuestas, medidas con `instanceof`). El detalle de tipo importa porque ambos caminos desempaquetan y
ambos llevan `checkcast`: el borrado de tipos (tema 3) no desaparece por usar colecciones.

**Entrevista.** «¿Declaro `List<String>` o `ArrayList<String>`? ¿Y `Map` o `HashMap`? ¿Qué gana el `merge` frente a
un `if (get(k) == null)`?»

**Respuesta modelo:** se declara la **interfaz** y se instancia la clase, por tres razones concretas y no
retóricas: (1) permite cambiar la implementación sin tocar a los llamadores, (2) permite que un parámetro acepte
cualquiera (`Map<String, Integer> totales` recibe un `LinkedHashMap` sin que nadie reescriba la firma), (3) hace
que el código dependa de lo que el contrato promete, no de lo que `ArrayList` hace hoy —y «hoy» es justo lo que
falló al medir el hueco 10/15/22: eso es de la implementación y por eso va citado como medido en Temurin—. Sobre
`merge`: la versión con `if (mapa.get(k) == null) mapa.put(k, g); else mapa.put(k, mapa.get(k) + g);` hace dos
`get`, dos búsquedas, y es la que tiene la carrera clásica si alguien la paraleliza; `merge(zona, g, Integer::sum)`
es una sola operación y no tiene la rama mal escrita (la variante más reproducida en la vida real es
`put(k, g)` sin el `else`, que **sobrescribe**: medido en el proyecto guía como mutación, `losTotalesPorZonaAcumulan`
falla y `NORTE` pasa de 1950 a 700, y con ella también `lasDosVersionesDelReporteCuadran`). Bonus: el motivo por el
que `computeIfAbsent` es seguro con colecciones como valores —`computeIfAbsent(k, x -> new ArrayList<>())`— es que
la función **no se ejecuta** si la clave existe; medido con `z -> 999999`, Medellin siguió en 3000.

#### 12. Cuándo usarlo y cuándo no

| Úsalo | No lo uses |
|---|---|
| `ArrayList` cuando hay que recorrer en orden, añadir al final y, si hace falta, ir borrando por posición | `ArrayList` cuando lo que haces es buscar por un identificador: eso es un mapa (o `indexOf` en O(n) sin que nadie te avise) |
| `HashMap` cuando la clave **es** un dato (zona, guía, cliente) y el acceso es «dame el de esta clave» | `HashMap` cuando necesitas el orden: ahí es `LinkedHashMap` (orden de inserción) o `TreeMap` (orden por clave) |
| `merge(k, v, Integer::sum)` para contar o sumar por clave; `computeIfAbsent` cuando el valor ausente es una estructura nueva | `put` dentro de un bucle acumulador: sobrescribe la segunda aparición y no lanza nada |
| `List.of`/`Map.of` como parámetro de salida y como constante compartida, porque no admiten `null` ni escritura | `List.of` cuando vas a acumular después: el `UnsupportedOperationException` llega tarde y en otra capa |
| `getOrDefault`/`values`/`entrySet` con el par `clave -> valor` como unidad | Aserciones sobre el orden de impresión de un `HashMap`, y `System.out.println` de un `toString` de matriz (tema 1 y 2) |

**Costo y criterio.** Todo lo estructural de este tema es política de implementación y se citó como medido: el hueco
`10 → 15 → 22`, la regla `oldCapacity >> 1` (que es el código de `java.util.ArrayList` de esta JDK, no el Javadoc)
y el hecho de que el hueco de una lista vacía sea 0 hasta el primer `add`. Lo que sí puedes usar como criterio sin
medir es lo que cada operación **te obliga a preguntar**: sobre un arreglo necesitas saber la posición, sobre una
lista necesitas un iterador o un índice, sobre un mapa necesitas la clave. De ahí el criterio del curso, que se
va a repetir en M5 y en todos los servicios: **números en bloque y posiciones → arreglo; colección que crece y se
recorre → `ArrayList`; relación entre dos datos → `HashMap`; orden que forma parte del resultado → `LinkedHashMap`
o `TreeMap`; contrato que no se toca → `List.of`/`Map.of`**. Y la regla de tipo que une este tema con el anterior:
declara la interfaz, instancia la clase, porque la seguridad que ganaste en el tema 3 (el compilador no te deja
convertir `List<String>` en `List<Object>`) solo se mantiene si la firma dice `List`.

---

### Tema 5: Wrappers y autoboxing: caché de `Integer`, `==` y el `NullPointerException` al desempaquetar · Básico · 45 min

#### 1. Ubicación y prerrequisitos

Curso Java · tramo Fundamentos · módulo 4 · quinto tema. Antes: [Tema 4](#tema-4-arraylist-y-hashmap-primer-uso)
—dos de sus salidas son exactamente dos de las trampas de este tema: `desempaquetar el null : NullPointerException`
y el `remove(Integer.valueOf(7))` que te obliga a **fabricar una caja a propósito** para que el compilador elija
la sobrecarga de valor—, [Tema 3](#tema-3-covarianza-de-arreglos-y-arraystoreexception-por-que-las-listas-son-mas-seguras)
(el borrado de tipos explica por qué un `List<Integer>` está lleno de cajas: no existe `List<int>`),
[Tema 1](#tema-1-arreglos-creacion-valores-por-defecto-recorrido-y-arrayindexoutofboundsexception) (allí `int` vale
`0` por defecto; aquí verás que `Integer` vale `null`, y esa es la diferencia que rompe programas) y
[Tema 2](#tema-2-arreglos-multidimensionales-y-la-clase-arrays-ordenar-copiar-comparar-y-buscar) (`Arrays.equals`
compara elementos; el equivalente con cajas es `equals`, nunca `==`). Del
[Módulo 3 · tema 1](modulo-3.md) vienes con el operador ternario ya escrito varias veces; aquí se muestra que un
ternario que mezcla `int` y `Integer` **no es el mismo ternario**. Del [Módulo 2 · tema 6](modulo-2.md) y del
[Módulo 2 · tema 2](modulo-2.md) viene `Integer.parseInt`, que es el primo de `valueOf`: mismo `890`, dos tipos
distintos (los dos medidos en este tema). Después: en M5 tus propias clases entran en estas colecciones y
`equals`/`hashCode` dejan de ser curiosidad de un wrapper; en M11 los genéricos borran `T` a `Object`, que es la
razón de fondo por la que cualquier `List<T>` guarda referencias; en M12 se usan `Map<String, Integer>` con `merge`
a escala y ahí el `Integer::sum` de este tema es el acumulado. El temario marca este tema como
«está pero básico»: en el curso antiguo los wrappers **se nombraban**, sin reproducir ninguna de las tres trampas
(una en ejecución y dos en compilación); aquí las tres están ejecutadas y citadas con su salida. Versión: JDK 25.
Fuentes del temario para este tema: JLS §5.1 · Effective Java ítem 61 · CJ1 cap. 5 · entrevistas técnicas.

#### 2. Objetivo

Al terminar sabes decir, con la salida delante, que `Integer caja = 1250;` **no** ejecuta un `new`: ejecuta
`Integer.valueOf(1250)` (medido en el bytecode: `1: invokestatic  #7 // Method java/lang/Integer.valueOf:(I)Ljava/lang/Integer;`).
Que `valueOf` devuelve el **mismo objeto** entre −128 y 127 y objeto nuevo desde 128, y que el corte se puede medir
por los dos lados (`corte por arriba : 128 (el primero que ya no)` y `corte por abajo : -129 (el primero que ya no)`).
Que por eso `Integer a = 1000, b = 1000; a == b` es `false` (medido) pero `Integer x = 127, y = 127; x == y` es
`true` (medido) —y esa pareja de resultados es la que hace que un test con números chicos pase y el mismo código con
pesos reales reviente—. Que si un lado es primitivo, `==` **desempaca** y compara valor sin importar la caché
(medido: `int == Integer : true` con `890`, muy por encima de 127). Que un `get` de clave ausente no protesta y el
golpe llega tres líneas más tarde al desempaquetar, con un mensaje que dice el método que faltaba:
`Cannot invoke "java.lang.Integer.intValue()" because "<local5>" is null` (y `because "tope" is null` si compilas
con `-g`, medido las dos formas). Que `hayGuia ? 1250 : caja` se tipifica como `int` —porque las dos ramas son
*numeric expressions*— y por eso desempaca la caja `null`, mientras `hayGuia ? 1250 : null` compila y corre sin
tocar nada. Que `Long gramos = 100000;` no compila (`error: incompatible types: int cannot be converted to Long`) y
`Byte desbordado = 128;` tampoco, pero `Byte cajaChica = 120;` sí (medido), y que el primitivo protesta con un
mensaje **distinto** (`possible lossy conversion from int to byte`). Y que el límite de la caché no es del lenguaje:
con `-Djava.lang.Integer.IntegerCache.high=5000`, y también con `-XX:AutoBoxCacheMax=5000`, el mismo programa
reporta `corte por arriba : 5001` mientras `System.getProperty` sigue diciendo `propiedad visible : null`.

#### 3. Por qué importa

Tres motivos, en orden de daño.

**1. El `Map<String, Integer>` del tema 4 es una máquina de fabricar `NullPointerException` diferidos.** El
requisito de RutaFlow «gramos por zona» se escribe con valores empaquetados porque un `Map` no guarda `int`. En
cuanto alguien hace `acumulado += topePorZona.get(zona)` con una zona que no está, el fallo no aparece en la línea
del `get`: aparece en la de la suma, y en la traza el nombre de la variable que está `null` ni siquiera sale
(si compilas sin `-g`). Medido en `tema-5/errores/SumaCajaNula.java`: primero se imprime `zona Bogota trae null`
y **después** revienta. Es decir: el programa ya dijo en voz alta que traía `null` y nadie lo previno.

**2. La caché hace pasar tests que no prueban nada.** `Integer x = 127, y = 127` → `x == y` es `true`;
`Integer p = 128, q = 128` → `p == q` es `false`. Los dos medidos en `CacheDeInteger`, en la misma corrida. Un test
escrito con índices, conteos o «un caso de prueba» de valor `1` pasa comparando cajas con `==`; el mismo test con
`1250` gramos de una guía real falla. Y el fallo no es aleatorio ni depende de la máquina: depende del **valor**,
que es la peor dependencia posible, porque el valor lo ponen los datos.

**3. Cada caja es un objeto.** `suma con cajas : 5540 · clase Integer` cuesta dos `intValue` y un `valueOf` por
vuelta (medido en el bytecode de `sumaDos`: `1: invokevirtual ... intValue`, `5: invokevirtual ... intValue`,
`8: iadd`, `9: invokestatic ... valueOf`). En un lote de 30 000 guías eso son 30 000 objetos cortos. El Javadoc de
`Integer` lo dice con todas las letras, y por eso el constructor `Integer(int)` está deprecado desde Java 9
(medido: el `javac` de este tema imprime `Note: tema-5/EncajarYDesencajar.java uses or overrides a deprecated API.`).

#### 4. Analogía

**El mostrador de despachos con un cajón de etiquetas ya impresas.**

- En el almacén de RutaFlow los números viajan dentro de **cajas de cartón** (`Integer`). Todo lo que vive en una
  estantería —una lista, un mapa— guarda cajas: un número suelto, sin caja, no se puede estibar. Lo que tú escribes
  en la ventanilla sí puede ser un número suelto (`int`), y el mostrador hace dos cosas por ti sin avisar:
  **emetiendo** una caja cuando la guardas (`int → Integer`) y **abriéndola** cuando la usas (`Integer → int`). Eso
  es el autoboxing: no es azúcar para que el código se lea bonito, es cartón moviéndose.
- Las cajas con los números del −128 al 127 **no se fabrican**: hay un cajón con esas etiquetas ya impresas, y quien
  pide 127 recibe siempre **la misma etiqueta física** (`valueOf(127) misma caja : true`). Del 128 para arriba no
  hay cajón: el mostrador corta cartón nuevo cada vez, así que dos 128 son dos objetos distintos que dicen lo mismo
  (`valueOf(128) misma caja : false`).
- Comparar dos cajas con `==` es preguntar **si es la misma pieza de cartón**, no si dicen lo mismo. Con las
  etiquetas del cajón la respuesta es «sí» por accidente; con las recortadas es «no». «¿Dicen lo mismo?» es `equals`
  (medido: `equals no lo nota : true`), y «¿cuál va antes?» es `compareTo` (medido: `compareTo 0`).
- El `null` es el mostrador tendiéndote **la mano vacía**. Si solo la miras, no pasa nada: `zona Bogota trae null`
  se imprime tan tranquilo. El golpe llega cuando le pides el número de dentro —`acumulado += tope`—, porque abrir
  una mano vacía no tiene definición. El mensaje lo dice con la boca grande:
  `Cannot invoke "java.lang.Integer.intValue()"`.
- El ternario raro (`hayGuia ? 1250 : caja`) es el caso en que el reglamento del mostrador decide, **antes de
  mirar cuál rama se va a ejecutar**, que las dos salidas tienen que ser números sueltos. O sea: que hay que abrir
  una caja. Y si la rama elegida es la de la caja vacía, ya no hay a dónde abrir. Prueba de que son dos reglas
  distintas: `hayGuia ? 1250 : null` compila y corre, porque ahí ninguna de las dos ramas es un número suelto y el
  reglamento trata la expresión como condicional de referencias.
- `new Integer(30000)` es cortar el cartón en tu casa: el valor es idéntico (`valueOf vs new : false · equals true
  · hashCode igual: true`) pero el mostrador ya no lo hace solo —hay que pedirlo a mano— porque desde Java 9 está
  deprecado.

**Dónde se rompe la analogía:** el cajón de etiquetas impresas no es una propiedad del cartón, es una decisión del
mostrador, y el mostrador puede tener un cajón más grande: con la propiedad de JVM en 5000, el 128 también salió
del cajón y el corte se fue a `5001` (medido). Un almacén físico no cambia de tamaño según un flag; la JVM sí.
Segunda rotura: en el almacén abrir una caja siempre devuelve un número; en Java `intValue()` sobre `null` no
devuelve `0`, lanza. Ahí la metáfora de «la mano vacía» se queda corta: el problema no es no encontrar el número,
es que **no hay objeto** de donde sacarlo.

#### 5. Diagrama

```mermaid
flowchart TB
    subgraph BOX["int -> Integer: lo que javac emite, medido"]
        V["Integer caja = 1250"] -->|"invokestatic Integer.valueOf:(I)"| VO["valueOf(1250)"]
        VO --> Q{"-128 &lt;= v &lt;= high ?"}
        Q -->|"si (medido 127)"| CACHE["cache[i - low]<br/>mismo objeto"]
        Q -->|"no (medido 128)"| NUEVO["new Integer(i)<br/>otro objeto"]
        NUEVO -.->|"solo si TU escribes new"| MANO["constructor deprecado<br/>@Deprecated(since=&quot;9&quot;)"]
    end
    subgraph UNBOX["Integer -> int: lo que javac emite, medido"]
        U["int suelto = caja"] --> R{"caja == null ?"}
        R -->|"no"| IV["invokevirtual Integer.intValue:()I"]
        R -->|"si"| NPE["NullPointerException<br/>Cannot invoke intValue()"]
    end
    CACHE -->|"== entre cajas: identidad"| IDEM["autoboxing 127 == 127 : true<br/>autoboxing 128 == 128 : false"]
    IV --> ARIT["aritmetica y comparaciones con primitivo"]
    subgraph TERN["el ternario mixto: dos reglas"]
        T1["cond ? 1250 : null"] -->|"referencia (JLS 15.25.3)"| OK["Integer · corre · sin desempacar"]
        T2["cond ? 1250 : caja"] -->|"numerica (JLS 15.25.2)"| MAL["int · desempaca las dos ramas<br/>medido: NPE en la linea 8"]
    end
    MAL --> NPE
```

**Texto alternativo:** arriba a la izquierda, el camino de **encajar**. Un `int` asignado a una `Integer` no se
compila a `new`, se compila a `Integer.valueOf(int)`. `valueOf` mira si el valor cae dentro del cajón: entre −128 y
el `high` (127 por defecto) devuelve la caja que ya está en el arreglo `cache`, y fuera de él fabrica una nueva. El
`new` explícito solo aparece si tú escribes `new`, y ese constructor está deprecado desde Java 9. Abajo a la
izquierda, el camino de **desencajar**: `intValue()` sobre una caja que no es `null`; sobre `null` lanza el
`NullPointerException`. A la derecha, la consecuencia de la caché: `==` entre dos cajas pregunta por identidad, así
que `127 == 127` es `true` y `128 == 128` es `false` en la misma corrida. Y abajo, la bifurcación que confunde a
quien cree que un ternario es un ternario: con `null` en una rama la expresión es de referencia (no se desempaca);
con una caja en una rama y un literal en la otra es **numérica**, su tipo es `int`, y desempaca pase lo que pase.

#### 6. Explicación

**Nivel 0 — una caja es un objeto, y por eso puede no haber nada dentro.** Medido en `tema-5/EncajarYDesencajar.java`,
dos primeras líneas:

```java
Integer caja = 1250;                        // boxed: valueOf, no new
int suelto = caja;                          // unboxed: intValue
```

```text
caja / suelto          : 1250 / 1250
```

La primera línea crea **un objeto** `Integer` en el heap y guarda la referencia en `caja`. La segunda lee ese objeto
y saca el `int`. Nada de esto escribe `javac` por ti si no lo necesitas: `int` sigue siendo `int` en todas partes.
Los ocho tipos que tienen caja son `Boolean`, `Byte`, `Character`, `Short`, `Integer`, `Long`, `Float`, `Double`, y
se usan en tres situaciones y no en más: (1) dentro de una colección, porque un `List<Integer>` no puede guardar
`int` —medido: `lista de cajas : [1250, 3400] · suma 4650`—; (2) cuando el dato **puede estar ausente**, porque un
`int` nunca puede decir «no vino», y ahí la caja es el `null` que el tema 4 te dejó ver; (3) como tipo de un
parámetro genérico. Todo lo demás —calcular, acumular, comparar— quiere el primitivo.

**Nivel 0 — cuatro sitios donde el compilador encaja o desencaja solo, y los cuatro están medidos.**

```java
static double tarifaPorKilo(Integer gramos) { return gramos / 1000.0 * 8500; }  // entra caja, sale numero
static int redondea(Integer valor) { return valor; }                             // sale numero de una caja
```

```text
parametro int -> Integer: 28900.0
Integer -> int de vuelta: 1250
suma con cajas         : 5540 · clase Integer
```

Los cuatro sitios: **asignación** (`Integer caja = 1250;` y `int suelto = caja;`), **argumento**
(`tarifaPorKilo(3400)` —llamas con un `int` suelto a un parámetro declarado `Integer` y el `javac` mete el
`valueOf`; medido: `28900.0`, que es `3400 / 1000.0 * 8500`), **retorno** (`return valor;` desde un método
declarado `int`; medido: `1250`) y **aritmética y comparaciones** (`total += peso` con las dos variables declaradas
`Integer`: se desempaquetan las dos, se suma en `int`, y el resultado **vuelve a empaquetarse** porque `total` es
`Integer` —de ahí el `clase Integer` medido, no `clase int`). Lo que no es autoboxing: `Integer.parseInt("890")`,
que es un método normal que devuelve `int`, y `Integer.valueOf("890")`, que devuelve la caja. Los dos con el mismo
texto de entrada, medidos en la misma línea: `parseInt / valueOf : 890 · 890`.

**Nivel 1 — `==` tiene dos significados según qué haya a cada lado, y es la línea que más se confunde del tema.**

```text
int == Integer         : true · parseInt en contexto int: 891
1000 == 1000 con cajas : false · equals true · compareTo 0
```

El primer caso es `int desdeParse == Integer desdeValueOf` con el valor `890`, muy fuera de la caché. Da `true`
porque cuando **uno de los dos lados es primitivo** no hay identidad que valga: la caja se desempaqueta y la
comparación es numérica. El segundo caso es caja contra caja, y ahí `==` es referencia: `false` porque `valueOf(1000)`
no está en el cajón. En la misma línea salen las otras dos preguntas, que son las que sí contestan lo que la gente
cree estar preguntando con `==`: `equals` compara valor (`true`), `compareTo` compara orden (`0` = empate). La regla
práctica del curso, que se va a repetir en M5 y en todos los DTO: **entre objetos, `==` casi nunca es lo que
quieres**; si los dos lados son cajas numéricas y quieres valor, escribe `equals` o `compareTo`; si un lado es
primitivo, `==` ya compara valor y no necesitas nada más.

**Nivel 1 — dónde está exactamente el cajón, medido por los dos lados y por tipo.** El JLS §5.1.7 fija la regla de
identidad para *constant expressions*:

> If the value `p` being boxed is the result of evaluating a constant expression (§15.29) of type `boolean`, `byte`,
> `char`, `short`, `int`, or `long`, and the result is `true`, `false`, a character in the range `'\u0000'` to
> `'\u007f'` inclusive, or an integer in the range `-128` to `127` inclusive, then let `a` and `b` be the results of
> any two boxing conversions of `p`. It is always the case that `a` `==` `b`.

Y el Javadoc de `Integer.valueOf(int)` (línea 980 de `java.base/java/lang/Integer.java` de esta JDK) cómo se
implementa:

> This method will always cache values in the range -128 to 127, inclusive, and may cache other values outside of
> this range.

`CacheDeInteger` no cree el corte: lo **busca**, subiendo desde 100 y bajando desde −100 hasta que
`Integer.valueOf(v) != Integer.valueOf(v)`. Salida medida completa (14 líneas):

```text
propiedad visible      : null
valueOf(127) misma caja : true
valueOf(128) misma caja : false
primer 128 de mas       : 128 y el otro 128
corte por arriba        : 128 (el primero que ya no)
corte por abajo         : -129 (el primero que ya no)
equals no lo nota       : true · compareTo 0
autoboxing 127 == 127   : true
autoboxing 128 == 128   : false
Long        -128/127    : true / true · 128: false
Short       -128/127    : true / true · 128: false
Character        0/127  : true / true · 128: false
Byte   toda la gama     : true y true
Boolean constantes      : true · Double NO tiene cache: false
```

Cuatro lecturas de esas catorce líneas:

1. El corte por arriba es **128**, no 127: 127 es el último que comparte, 128 el primero que ya no. Y por abajo es
   **−129**. Los dos se pueden pedir en un test porque son observables desde el programa.
2. `equals no lo nota : true` — la caché **no cambia el valor**, solo la identidad. Un bug de `==` es invisible para
   `equals`, para `hashCode` (medido `hashCode igual: true`) y para cualquier aserción de valor.
3. `autoboxing 127 == 127 : true` / `autoboxing 128 == 128 : false`: como encajar **es** llamar a `valueOf`
   (se ve en el bytecode abajo), el autoboxing hereda el cajón tal cual. Aquí está la trampa del test que pasa.
4. Los cajones de los demás son distintos: `Long` y `Short` cortan en el mismo sitio (−128/127), `Character` guarda
   `0..127` —y por eso `Character.valueOf((char) 127)` es `true` y el 128 no—, `Byte` está **entero** en su caché
   porque toda su gama (−128 a 127) cabe dentro, y `Float`/`Double` no tienen: `Double.valueOf(1.0) == Double.valueOf(1.0)`
   es `false`. El JLS §5.1.7 insinúa que una implementación con memoria podría ir mucho más allá —

   > Less memory-limited implementations might, for example, cache all `char` and `short` values, as well as `int`
   > and `long` values in the range of -32K to +32K.

   —y en esta JVM eso no ocurre: `Long.valueOf(128) == Long.valueOf(128)` es `false` medido, pese a que 128 es un
   «otro valor» y la regla dice que compartir «está permitido pero no requerido» («This allows (but does not require)
   sharing of some or all of these references»).

**Nivel 2 — el corte es una propiedad de esta JVM, no una regla del lenguaje, y se puede mover.** Dos formas, ambas
medidas sobre el mismo `.class` de `CacheDeInteger`:

```text
java -Djava.lang.Integer.IntegerCache.high=5000 -cp /tmp/t5 CacheDeInteger
  corte por arriba        : 5001 (el primero que ya no)
java -XX:AutoBoxCacheMax=5000 -cp /tmp/t5 CacheDeInteger
  corte por arriba        : 5001 (el primero que ya no)
```

En la primera corrida con propiedad, las líneas `valueOf(128) misma caja : true` y `autoboxing 128 == 128 : true`
aparecen invertidas respecto del default, y `Long`/`Short`/`Character` **no cambian** (la propiedad es solo de
`Integer`). El comentario del `IntegerCache` interno (líneas 879-895 de `Integer.java`) es la fuente de las dos
opciones:

> Cache to support the object identity semantics of autoboxing for values between -128 and 127 (inclusive) as
> required by JLS. The cache is initialized on first usage. The size of the cache may be controlled by the
> {@code -XX:AutoBoxCacheMax=<size>} option.

Y en el propio código, `Integer.java:898` fija el suelo, `:938-939` recuerda el mandato del JLS, y `:988-991` es el
cuerpo de `valueOf`:

```java
static final int low = -128;                                   // Integer.java:898
// range [-128, 127] must be interned (JLS7 5.1.7)             // Integer.java:938
assert IntegerCache.high >= 127;                               // Integer.java:939

public static Integer valueOf(int i) {                         // Integer.java:988
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

Hay un detalle pedagógico en la primera línea de la salida: `propiedad visible : null`. `System.getProperty("java.lang.Integer.IntegerCache.high")`
sigue diciendo `null` **incluso cuando la propiedad se pasó y surtió efecto**. La JVM consume esa propiedad al
arrancar, al construir el cajón; después ya no está en las propiedades del sistema como algo legible. Que un getter
devuelva `null` no significa que la configuración no hiciera nada —mira `corte por arriba` en las dos corridas—, y
esa es la lección que se aplica a cualquier bandera de arranque. El tamaño real del cajón no tiene API pública: lo
único observable desde un programa es su **efecto**, que es justo lo que `corteArriba()` busca en lugar de recitar.

Consecuencia profesional: **un `==` entre cajas que hoy pasa puede dejar de pasar mañana**, y viceversa, sin que
nadie haya tocado el código —cambia el flag de arranque, cambia la JVM, cambia el valor de los datos—. El JLS lo dice
en la misma página: «For other values, the rule disallows any assumptions about the identity of the boxed values on
the programmer's part». Nota técnica sobre la línea 939: `assert IntegerCache.high >= 127` es una aserción, y las
aserciones no corren por defecto (`-ea`), así que tampoco es una garantía ejecutable.

**Nivel 2 — las dos trampas de desempaquetado: la suma y el ternario.** Las dos revientan con el mismo mensaje y
suceden en momentos distintos.

Trampa A — la aritmética sobre un `get` ausente. Medido en `tema-5/errores/SumaCajaNula.java` (sin `-g`):

```text
zona Medellin trae 30000
zona Bogota trae null
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local5>" is null
	at SumaCajaNula.main(SumaCajaNula.java:17)
```

La línea 15 (`Integer tope = topePorZona.get(zona);`) no falla. La línea 16 **imprime el `null` en la consola** y no
falla. La línea 17, `acumulado += tope;`, sí: el compuesto `+=` sobre `int` con derecha empaquetada desempaca, y el
JLS §5.1.8 no deja alternativa —«If `r` is `null`, unboxing conversion throws a `NullPointerException`»—. El
`<local5>` es el hueco de la pila donde vive la variable cuando el `.class` no trae la tabla de nombres; compilando
con `-g` la misma traza dice `because "tope" is null` (medido: `javac --release 25 -g -d out SumaCajaNula.java &&
java -cp out SumaCajaNula`). Es un diagnóstico útil en producción: si el mensaje tuyo dice `<localN>`, la
compilación del despliegue no lleva `-g`.

Trampa B — el ternario que parece inofensivo. Medido en `tema-5/errores/TernarioDesempacota.java`:

```java
Integer caja = hayGuia ? 1250 : null;     // condicional de REFERENCIA: null entra bien
int peso = hayGuia ? 1250 : caja;         // condicional NUMERICA: caja se desempaca
```

```text
con guia    : 1250
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local1>" is null
	at TernarioDesempacota.decide(TernarioDesempacota.java:8)
	at TernarioDesempacota.main(TernarioDesempacota.java:14)
```

La línea 7 se ejecuta con `hayGuia = false` y **no pasa nada**: `1250` es un `int` y `null` es el *null type*; no
son una pareja primitivo/caja, así que la expresión cae en §15.25.3 (reference conditional), cuya regla dice —«If
the type of one of the second and third operands is the null type, and the type of the other operand is a reference
type, then the type of the conditional expression is that reference type»—; el tipo sale `Integer`, y una `Integer`
con `null` dentro no hace daño mientras no se abra. La línea 8 es otra cosa: `1250` es una *numeric expression* y
`caja` (tipo `Integer`) también lo es, porque §15.25 cuenta como numérica cualquier expresión cuyo tipo es
convertible a un tipo numérico —y la conversión relevante es justamente el unboxing de §5.1.8—. Dos ramas numéricas
⇒ **numeric conditional expression**, y §15.25.2:

> If one of the second and third operands is of primitive type T, and the type of the other is the result of
> applying boxing conversion (§5.1.7) to T, then the type of the conditional expression is T.

…con su nota, que es el pie de la trampa: «Note that numeric promotion may include unboxing conversion (§5.1.8)».
El tipo de la expresión es `int`, se evalúa la rama de `false` (la caja `null`) y se desempaqueta. El `int peso` ya
no tiene adónde abrir. Es el único bug de este tema que **no se puede detectar leyendo la línea con error**: la
culpa está declarada dos líneas arriba, en el tipo de `caja`.

**Nivel 2 — el literal tiene que CABER en el primitivo antes de encajarse: dos errores de compilación medidos.**

```text
tema-5/errores/LongSinEle.java:6: error: incompatible types: int cannot be converted to Long
        Long gramos = 100000;                     // mal: 100000 es un int
tema-5/errores/BordeDeByte.java:7: error: incompatible types: int cannot be converted to Byte
        Byte desbordado = 128;                    // mal: 128 ya no cabe, ni encajado
```

Lo que sí compila, medido en el mismo archivo del nivel 0:

```text
constante que cabe     : 120 / 120 · Byte.valueOf(120) == cajaChica: true
```

Tres hechos, en este orden: (a) un literal sin sufijo es `int`, y `int → Long` **no existe** —no hay autoboxing que
salte de `int` a `Long`—; hay que escribir `100000L`, que es `long` **antes** de encajarlo. (b) Con `Byte` y `Short`
existe el atajo de la *narrowing conversion* de constantes (§5.2), así que `Byte cajaChica = 120;` compila porque
120 es una constante que cabe en `byte`; `128` no cabe y el `javac` protesta. (c) La línea `Byte.valueOf((byte) 120)
== cajaChica: true` demuestra que detrás del literal hubo un estrechamiento **y luego** un encajado, y que el
resultado cayó en el cajón de `Byte` (que, como se midió, es toda la gama). Contraste **medido aparte**, en un
archivo de dos líneas que no forma parte del laboratorio —puedes copiarlo y correrlo—:

```java
public class B { public static void main(String[] a){ byte x = 128; Byte y = 128; } }
```

```text
/tmp/B.java:1: error: incompatible types: possible lossy conversion from int to byte
/tmp/B.java:1: error: incompatible types: int cannot be converted to Byte
```

Dos mensajes distintos para el mismo `128`. El primitivo recibe «posible conversión con pérdida» (sí sabe estrechar,
pero no con ese valor); la caja recibe «int cannot be converted to Long/Byte», que **no habla de pérdida** sino de
que la conversión no existe. Por eso el mensaje «int cannot be converted to Byte» despista a quien cree que está
encajando: no está encajando nada, está intentando una asignación de `int` a una clase que no es `Integer`.

**Nivel 3 — qué emite `javac`: ni un `new`, dos `intValue` y un `valueOf`.** Medido con
`javap -c -p` sobre `tema-5/por-dentro/AutoboxingEnBytecode.class`:

```text
static java.lang.Integer empaca(int);
       0: iload_0
       1: invokestatic  #7    // Method java/lang/Integer.valueOf:(I)Ljava/lang/Integer;

static int saca(java.lang.Integer);
       0: aload_0
       1: invokevirtual #13   // Method java/lang/Integer.intValue:()I

static java.lang.Integer sumaDos(java.lang.Integer, java.lang.Integer);
       1: invokevirtual #13   // Method java/lang/Integer.intValue:()I
       5: invokevirtual #13   // Method java/lang/Integer.intValue:()I
       8: iadd
       9: invokestatic  #7    // Method java/lang/Integer.valueOf:(I)Ljava/lang/Integer;

static java.lang.Integer forzadoNuevo(int);
       0: new           #8    // class java/lang/Integer
       3: dup
       4: iload_0
       5: invokespecial #17   // Method java/lang/Integer."<init>":(I)V
```

Cuatro consecuencias, todas verificables en ese volcado. Que el `Integer caja = v;` **no** contiene `new`: la
palabra `new` en el constante pool aparece únicamente en `forzadoNuevo`, donde el programista la escribió. Que
desencajar es una **invocación virtual** (`invokevirtual intValue:()I`), o sea un despacho normal: si el receptor es
`null`, no hay a quién invocar —y el §5.1.8 lanza el NPE con el nombre del método, que es literalmente lo que dice
el mensaje: `Cannot invoke "java.lang.Integer.intValue()"`. Que la suma de dos cajas cuesta **tres operaciones
además del `iadd`** (dos desempaquetados y un re-empaquetado), y por eso `new Integer(v)` / cajas en un bucle grande
son un problema de memoria y no de corrección. Y que `valueOf` está marcado `@IntrinsicCandidate` en el fuente
(`Integer.java:987`), que es la razón por la que la JIT puede plegar encajados en bucles calientes —es decir: lo que
mides en `javap` no es siempre lo que ejecutas—.

El mismo volcado muestra el literal encajado: `127` sale como `bipush 127` + `invokestatic valueOf`, y `128` como
`sipush 128` + `invokestatic valueOf` —un byte contra dos bytes en el código, misma llamada—. La diferencia de
objeto no la decide el bytecode, la decide `valueOf`.

Salida medida del programa completo (5 líneas):

```text
empaca(127)  es caja   : 127 · misma que valueOf: true
empaca(128)  es caja   : 128 · misma que valueOf: false
saca(valueOf)          : 3400
sumaDos(1250, 3400)    : 4650
new Integer(30)        : 30 · NO es la cache: false
```

`new Integer(30)` es `false` contra `Integer.valueOf(30)` **aunque 30 está dentro del cajón**: el `new` nunca mira el
arreglo de caché, y por eso el Javadoc desaconseja el constructor —

> It is rarely appropriate to use this constructor. The static factory {@link #valueOf(int)} is generally a better
> choice, as it is likely to yield significantly better space and time performance.

—anotado `@Deprecated(since="9")` sobre `public Integer(int value)` (`Integer.java:1013-1014`). El aviso del
compilador, medido: `Note: tema-5/EncajarYDesencajar.java uses or overrides a deprecated API.`

**Nivel 3 — lo que no se mide pero hay que saber: el coste puede ser un error.** El mismo §5.1.7 cierra con:

> A boxing conversion may result in an `OutOfMemoryError` if a new instance of one of the wrapper classes (`Boolean`,
> `Byte`, `Character`, `Short`, `Integer`, `Long`, `Float`, or `Double`) needs to be allocated and insufficient
> storage is available.

Que es la versión formal del punto 3 de «por qué importa». Y la regla del curso, que también es la regla de
Effective Java ítem 61: **primitivos para calcular, cajas solo cuando la ausencia es un dato**. Un `Integer` en un
DTO que viene de un JSON con campos opcionales está bien; un `int` acumulado en un `for` dentro de `Integer` está
mal; y una aserción `assertSame`/`==` sobre valores fuera del cajón está rota aunque hoy pase.

#### 7. Código ejecutable

**Encajar y desencajar** · archivo `tema-5/EncajarYDesencajar.java` · ejecuta
`javac --release 25 -d out tema-5/EncajarYDesencajar.java && java -Dstdout.encoding=UTF-8 -cp out EncajarYDesencajar`

```java
Integer caja = 1250;                        // boxed: valueOf, no new
int suelto = caja;                          // unboxed: intValue
System.out.println("caja / suelto          : " + caja + " / " + suelto);

static double tarifaPorKilo(Integer gramos) { return gramos / 1000.0 * 8500; }
System.out.println("parametro int -> Integer: " + tarifaPorKilo(3400));

Integer total = 0;
for (Integer peso : List.of(1250, 3400, 890)) { total += peso; }
System.out.println("suma con cajas         : " + total + " · clase " + total.getClass().getSimpleName());

Integer porValueOf = Integer.valueOf(30000);
Integer porNew = new Integer(30000);        // deprecado: el compilador lo avisa
System.out.println("valueOf vs new         : " + (porValueOf == porNew) + " · equals "
        + porValueOf.equals(porNew) + " · hashCode igual: " + (porValueOf.hashCode() == porNew.hashCode()));

byte sueltoChico = 120;
Byte cajaChica = 120;
System.out.println("constante que cabe     : " + sueltoChico + " / " + cajaChica
        + " · Byte.valueOf(120) == cajaChica: " + (Byte.valueOf((byte) 120) == cajaChica));
```

Salida completa (10 líneas; nueve citadas en la sección 6 —seis en el nivel 0, dos en el nivel 1 y una en el nivel
2— y la décima, `valueOf vs new`, citada en la analogía):

```text
caja / suelto          : 1250 / 1250
parametro int -> Integer: 28900.0
Integer -> int de vuelta: 1250
suma con cajas         : 5540 · clase Integer
valueOf vs new         : false · equals true · hashCode igual: true
lista de cajas         : [1250, 3400] · suma 4650
parseInt / valueOf     : 890 · 890
int == Integer         : true · parseInt en contexto int: 891
1000 == 1000 con cajas : false · equals true · compareTo 0
constante que cabe     : 120 / 120 · Byte.valueOf(120) == cajaChica: true
```

`5540` es `1250 + 3400 + 890`; `4650` es `1250 + 3400`; `28900.0` es `3400 / 1000.0 * 8500`.

**La caché, buscada por el programa** · `tema-5/CacheDeInteger.java`. El bloque que hay que copiar a mano (y que es
el patrón de «medir un límite en vez de recitarlo»):

```java
static int corteArriba() {
    for (int v = 100; v < 100000; v++) {
        if (Integer.valueOf(v) != Integer.valueOf(v)) {
            return v;
        }
    }
    return -1;
}
```

Salida completa: las 14 líneas de la sección 6, y la misma corrida con la propiedad de JVM puesta, que es la que
convierte el «así funciona Java» en «así funciona esta JVM» (citada literalmente arriba: `corte por arriba : 5001`,
con `propiedad visible : null` sin cambiar).

**Por dentro** · `tema-5/por-dentro/AutoboxingEnBytecode.java` · 5 líneas de salida y el volcado `javap -c -p`
completo de los cuatro métodos, ambos en la sección 6. Ejecución:
`javac --release 25 -d out tema-5/por-dentro/AutoboxingEnBytecode.java && java -Dstdout.encoding=UTF-8 -cp out AutoboxingEnBytecode`.

**Los cuatro errores** · `tema-5/errores/`. Dos revientan al ejecutar y dos no compilan, y **esa es la lección**:
las trampas de las cajas se reparten entre las dos mitades del ciclo de vida del programa.

```text
SumaCajaNula.java          -> se imprime "zona Bogota trae null" y luego
                              java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local5>" is null
                              (line 17; con -g: because "tope" is null)
TernarioDesempacota.java   -> se imprime "con guia    : 1250" y luego el mismo NPE
                              (decide, linea 8, llamado desde main, linea 14)
LongSinEle.java            -> error: incompatible types: int cannot be converted to Long (linea 6)
BordeDeByte.java           -> error: incompatible types: int cannot be converted to Byte (linea 7)
```

#### 8. Mini-laboratorio

Escribe los archivos desde cero en `laboratorios/modulo-4/tema-5/`. Antes de ejecutar cada uno, escribe en un
comentario qué crees que va a imprimir; la diferencia entre lo que escribiste y lo que salió **es** el ejercicio.
Este tema no se entiende leyéndolo: se entiende prediciendo cuatro números y fallándote en dos.

1. Crea `ComparaCajas.java`: declara `Integer a = 127, b = 127, c = 128, d = 128; int e = 128;` e imprime
   `a == b`, `c == d`, `c.equals(d)`, `e == c` y `c == (int) e`. Predice las cinco **antes** de ejecutar. Después
   responde en comentario: ¿por qué dos de las cinco son `true` «por accidente» y una es `true` **siempre**? ¿Cuál
   de ellas cambiaría con `-XX:AutoBoxCacheMax=5000`? (Pista: solo una de las cinco depende del cajón.)
2. Crea `CortaLaCache.java`: un bucle que recorra desde 100 hacia arriba y devuelva el primer `v` con
   `Integer.valueOf(v) != Integer.valueOf(v)`, y otro que baje desde −100. Ejecuta el programa tres veces: normal,
   con `-Djava.lang.Integer.IntegerCache.high=5000` y con `-XX:AutoBoxCacheMax=5000`. Pega las tres salidas y
   escribe al lado qué dice `System.getProperty` de la primera propiedad en las tres corridas. (Aquí es donde se ve
   que «el getter devuelve null» **no** significa «la bandera no hizo nada».)
3. Crea `SumaQueRevienta.java`: copia la forma de `errores/SumaCajaNula.java` con tus propias claves (dos zonas,
   una de ellas ausente), ejecuta con `javac --release 25 -g` y otra vez sin `-g`, y pega las dos trazas. Escribe
   debajo qué cambia entre ellas y qué significa. Remata con las dos reparaciones (`getOrDefault` y `merge`) y
   demuestra que la suma ya no lanza: `System.out.println` del acumulado y ninguna traza.
4. Crea `TernarioMixto.java`: tres variables, todas con `boolean` de control. (a) `Object x = cond ? "a" : null;`
   (b) `Integer y = cond ? 1250 : null;` (c) `int z = cond ? 1250 : y;`. Ejecuta con `cond = false`. Pega la salida
   de (a) y (b), que corren, y la traza de (c), que no. **Después**, sin borrar nada, cambia la firma de la (c) a
   `Integer z = ...` y vuelve a ejecutar. Explica en comentario por qué la misma rama `null` era letal en un caso e
   inofensiva en el otro, citando las dos secciones del JLS que se nombran en la sección 6.
5. Crea `CuatroMensajes.java`: cuatro líneas, cada una **mal a propósito**, y pega los cuatro mensajes de `javac`:
   `Long l = 100000;`, `Short s = 40000;`, `Byte b = 128;`, `byte p = 128;`. Ordena los resultados en una tabla con
   dos columnas: «el destino es primitivo» / «el destino es una caja». Hay un solo mensaje que menciona la palabra
   *lossy*. Explica por qué.
6. Crea `BytecodeDeCajas.java`: dos métodos, `static Integer empaca(int v) { return v; }` y
   `static Integer forzado(int v) { return new Integer(v); }`. Compila, ejecuta `javap -c -p` y pega los dos cuerpos.
   Cuéntale a un compañero, señalando el volcado, por qué el primero no tiene la palabra `new` y qué instrucción la
   sustituye. Después agrega un tercer método `static int suma(Integer a, Integer b) { return a + b; }` y cuenta las
   `invokevirtual` de su cuerpo.
7. Crea `AusenciaComoDato.java`: una `List<Integer>` de pesos de guía donde un valor ausente **es** información
   («no se pesó»). Llenar con `null` en dos posiciones, imprimir la lista, y hacer dos lecturas: una con
   `if (peso == null)` (segura) y una con `total += peso` (no). Pega la traza. Cierra respondiendo por escrito:
   ¿aquí la caja estaba bien usada o mal usada? (No hay una respuesta única; hay que argumentarla con la salida.)

**Listo cuando** puedas (1) decir de memoria el rango exacto en que `Integer.valueOf` devuelve el mismo objeto y por
qué es un rango y no una garantía, (2) explicar por qué `int == Integer` da `true` con 890 y `Integer == Integer` da
`false` con 1000, sin invocar «la caché» para la segunda, (3) escribir la traza del `NullPointerException` de un
`get` ausente señalando la línea **donde se originó** el `null`, que no es la que aparece en la traza, (4) decir qué
tipo tiene `cond ? 1250 : null` y qué tipo tiene `cond ? 1250 : cajaInteger`, y cuál de las dos rompe, y (5)
predecir si `Byte chiquito = 120;` compila y si `Long grande = 120;` compila —y justificar que los dos casos con el
mismo literal tengan resultados opuestos—.

#### 9. Verificación

```bash
cd docs/reestructuracion/cursos/java/laboratorios/modulo-4
javac --release 25 -d /tmp/a tema-5/*.java && javac --release 25 -d /tmp/b tema-5/por-dentro/*.java
java -Dstdout.encoding=UTF-8 -cp /tmp/a EncajarYDesencajar   # «1000 == 1000 con cajas : false · equals true · compareTo 0»
java -Dstdout.encoding=UTF-8 -cp /tmp/a CacheDeInteger       # «corte por arriba        : 128 (el primero que ya no)»
java -Djava.lang.Integer.IntegerCache.high=5000 -Dstdout.encoding=UTF-8 -cp /tmp/a CacheDeInteger  # «corte por arriba        : 5001 (el primero que ya no)»
java -Dstdout.encoding=UTF-8 -cp /tmp/b AutoboxingEnBytecode # «empaca(128)  es caja   : 128 · misma que valueOf: false»
javap -c -p -cp /tmp/b AutoboxingEnBytecode | grep 'Integer.valueOf:(I)Ljava/lang/Integer;'
javap -c -p -cp /tmp/b AutoboxingEnBytecode | grep 'Integer.intValue:()I'
java -Dstdout.encoding=UTF-8 tema-5/errores/SumaCajaNula.java        # NPE: Cannot invoke "java.lang.Integer.intValue()" (codigo distinto de 0)
java -Dstdout.encoding=UTF-8 tema-5/errores/TernarioDesempacota.java # mismo NPE en decide():8 (codigo distinto de 0)
javac --release 25 -d /tmp/e tema-5/errores/LongSinEle.java   # int cannot be converted to Long (codigo distinto de 0)
javac --release 25 -d /tmp/e tema-5/errores/BordeDeByte.java  # int cannot be converted to Byte (codigo distinto de 0)
```

Aquí las **29** comprobaciones del tema pasan con Temurin 27 y `--release 25`, y el total del laboratorio sube a
**188 / 0 fallidas / 0 omitidas** (el reparto medido bloque a bloque: T1 25 · T2 35 · T3 30 · T4 43 · T5 29 ·
T6 22 · Gradle 4). Dentro de las 29 hay 23 de salida ejecutada —nueve de `EncajarYDesencajar`, diez de
`CacheDeInteger`, una del `javac` deprecado, una de la corrida con `IntegerCache.high=5000` y dos de
`AutoboxingEnBytecode`—, **2 de bytecode** (`Integer.valueOf:(I)Ljava/lang/Integer;` y `Integer.intValue:()I`, las
dos parejas del mismo `.class`), 2 que exigen código ≠ 0 **y** el texto de la excepción, y 2 que exigen que el
`javac` falle con el mensaje del tipo. La comprobación 9 del bloque (`un literal que cabe se estrecha y se encaja`)
se añadió en esta pasada: sin ella el caso `byte sueltoChico = 120; Byte cajaChica = 120;` quedaba afirmado pero no
ejecutado, y es el único que demuestra que el estrechamiento de constantes **precede** al encajado.

*Pendiente de reejecución en JDK 25:* los números del cajón (`128`, `-129`, y el `5001` de la corrida con propiedad)
son política de `IntegerCache` de esta implementación, no del JLS; el texto exacto de los dos mensajes
(`Cannot invoke "java.lang.Integer.intValue()" because "<local5>" is null` y `because "<local1>" is null`), que lo
redacta la JVM; el aviso `Note: ... uses or overrides a deprecated API.` y su remate `Recompile with
-Xlint:deprecation for details.`; los nombres de las dos banderas (`-Djava.lang.Integer.IntegerCache.high` y
`-XX:AutoBoxCacheMax`) y el hecho de que sigan existiendo; los índices del constante pool (`#7`, `#13`, `#17`) que
sale en el volcado `javap`, que son numeración interna de esta compilación; y la forma del `incompatible types:
int cannot be converted to Long/Byte`, que la redacta `javac`.

*Lo que no depende de la versión:* que encajar sea `valueOf` y no `new` (es la regla del lenguaje, no de la
biblioteca); la existencia del rango −128..127 como identidad garantizada para constant expressions (§5.1.7); que
desempaquetar `null` lance `NullPointerException` (§5.1.8, sin margen de implementación); que un ternario
primitivo/caja sea una condicional numérica y un ternario `null`/caja sea de referencia (§15.25.2 y §15.25.3); que
`Float`/`Double` no tengan caché; y que `long` requiera `L` antes de encajarse.

#### 10. Error común y diagnóstico

**Síntoma 1 — «funciona en los tests y revienta en producción», con `==` en el medio.** El test comparó `Integer`
con `Integer` usando valores chicos; producción comparó con valores grandes. Medido en la misma corrida:
`autoboxing 127 == 127 : true` y `autoboxing 128 == 128 : false`. **Arreglo:** `equals` para valor, `compareTo(...) == 0`
si además quieres el contrato de `Comparable`, y primitivo a la izquierda si lo que tienes es un primitivo.
**Detección en revisión:** cualquier `==` entre dos expresiones cuyo tipo está declarado como wrapper es un
comentario de código pendiente. **No arregla esto:** agrandar el cajón con `-XX:AutoBoxCacheMax`. Hace pasar el test
por la misma razón que lo rompía: sigue siendo identidad, y ahora además depende de un flag de arranque.

**Síntoma 2 — `NullPointerException` en una línea de aritmética sin ninguna llamada.** La traza dice
`Cannot invoke "java.lang.Integer.intValue()"` y el archivo señala una línea con un `+=`, un `*` o un `==` —nunca
una línea con un `get`—. Medido: la falla es `SumaCajaNula.java:17` pero el `null` se originó en `:15`
(`zona Bogota trae null` se imprimió antes). **Arreglo:** decidir el neutro en el punto de lectura: `getOrDefault(k, 0)`
si es un número, `merge(k, v, Integer::sum)` si estás acumulando (las dos, del tema 4). **Diagnóstico fino:** si el
mensaje dice `because "<local5>" is null` estás ante una compilación sin `-g`; vuelve a compilar con `-g` y el
mensaje dirá el nombre real (`because "tope" is null`, medido).

**Síntoma 3 — el mismo bug, pero con el tipo decidido dos líneas antes.** `int peso = hayGuia ? 1250 : caja;`. El
programa **imprime la rama buena** (`con guia    : 1250`) y revienta en la otra, y como la traza apunta a la línea
del ternario nadie mira la declaración de `caja`. **Arreglo:** si una rama puede ser `null`, el destino tiene que
ser la caja y el uso tiene que abrir la caja **dentro de un `if`**, no en la asignación: `Integer peso = hayGuia ?
1250 : caja;` seguido de `if (peso == null) ...`. **Regla derivada de lo medido:** en un ternario, si los dos
operandos son cajas o los dos son primitivos, estás en una condicional homogénea y no hay sorpresa; en cuanto los
mezclas, el tipo lo gana el primitivo y el `null` se convierte en un fallo en tiempo de ejecución.

**Síntoma 4 — «pero si el número entra, ¿por qué no compila?».** `Long gramos = 100000;` → `error: incompatible
types: int cannot be converted to Long` (medido, línea 6 de `LongSinEle.java`). Es el error de los literales: el
`100000` escrito sin `L` es un `int`, y `int → Long` no es una conversión que el lenguaje defina. **Arreglo:** la
`L` antes de encajar —`Long bien = 100000L;`, medido en la misma línea del archivo, que sí compila—; y con `Byte` y
`Short`, acordarse de que el atajo de estrechamiento solo vale para **constantes que caben**: `Byte cajaChica = 120;`
sí (medido), `Byte desbordado = 128;` no (medido). **Y ojo con el mensaje del primitivo**, que es otro:
`byte p = 128;` dice `possible lossy conversion from int to byte` —dos mensajes para el mismo literal, contrastados
arriba—.

**Síntoma 5 — memoria y CPU inexplicables en un bucle de acumulados.** `suma con cajas : 5540 · clase Integer` es
correcto y cuesta dos `intValue` + un `valueOf` por vuelta (medido en `sumaDos`). Si el bucle es de 30 000 guías, son
30 000 objetos que mueren jóvenes. **Arreglo:** `int total = 0;` con `for (Integer peso : lista) total += peso;`
—la caja se abre y no se vuelve a cerrar—, o un `mapToInt` cuando vienes de streams (M13). **No lo arregles con**
`Integer.valueOf` «para aprovechar la caché»: 1250 no está en el cajón, y aunque estuviera, la operación que quieres
evitar no es la asignación de memoria del arreglo, es el objeto nuevo.

**Errores de ejecución reales** (medidos con `--release 25` sobre Temurin 27; los dos primeros **compilan** y
fallan al correr, los dos siguientes ni compilan):

```text
java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local5>" is null   (SumaCajaNula.java:17)
java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local1>" is null   (TernarioDesempacota.java:8)
error: incompatible types: int cannot be converted to Long   (LongSinEle.java:6)
error: incompatible types: int cannot be converted to Byte   (BordeDeByte.java:7)
```

El de la primera línea es el mismo `NullPointerException` del tema 4 con un **mensaje que sí dice qué método se
intentó invocar**: eso es el *helpful NullPointerException* de la JVM, y es la razón por la que este bug se diagnostica
en diez segundos si lees el mensaje entero y en media hora si solo lees la primera palabra.

#### 11. Pregunta con respuesta modelo

**Comprensión.** Tengo `Integer a = 128, b = 128;`. `a == b` da `false`. ¿Es un bug de Java, y qué pasa con
`a == b` si pongo `-XX:AutoBoxCacheMax=5000`?

**Respuesta modelo:** no es un bug: es el contrato. §5.1.7 garantiza identidad **solo** para constant expressions en
−128..127 y para `true`/`false` y `'\u0000'`..`'\u007f'`; fuera de eso, «the rule disallows any assumptions about the
identity of the boxed values on the programmer's part». Con el flag, en esta JVM, la corrida medida dice
`corte por arriba : 5001`, así que `a == b` pasaría a ser `true` —y esto es exactamente lo que hace el flag peligroso
como «arreglo»—: el programa cambia de comportamiento según una bandera de arranque, y cualquier código que dependa
de `==` entre cajas pasa a depender de cómo se levantó la JVM. Lo correcto era `a.equals(b)` (medido: `equals no lo
nota : true`) o comparar como primitivos. Bonus medido: el cajón de `Integer` es el único que se mueve con esa
propiedad —`Long`/`Short`/`Character` reportaron lo mismo en las dos corridas—, y `Double` no tiene cajón
(`Double NO tiene cache: false`).

**Comprensión.** ¿Por qué `int == Integer` con 890 da `true` y `Integer == Integer` con 1000 da `false`, si 890 y
1000 están ambos fuera del cajón?

**Respuesta modelo:** porque son dos preguntas distintas. Con un lado primitivo, `==` es una comparación numérica: la
caja se desempaca con `intValue` y se comparan los `int` —la caché no tiene nada que decir, y el §5.1.7 no aplica
porque no estamos comparando dos cajas—; medido: `int == Integer : true`. Con las dos cajas, `==` compara
referencias, y `valueOf(1000)` cae fuera del cajón, así que son dos objetos: medido `1000 == 1000 con cajas : false`.
La trampa práctica es que alguien «arregla» el segundo caso metiendo un cast a `int` en un lado y entonces la
comparación **sí** se vuelve numérica; pero con `null` en ese lado, el cast lo convierte en el NPE del nivel 2.

**Comprensión.** `Integer caja = cond ? 1250 : null;` compila y corre. `int peso = cond ? 1250 : caja;` revienta con
`cond = false`. ¿Qué regla se aplicó en cada línea?

**Respuesta modelo:** en la primera, los operandos son `int` y el *null type*: no es una condicional numérica (el
`null` no es una *numeric expression*), así que cae en §15.25.3 y la regla «if the type of one of the second and
third operands is the null type, and the type of the other operand is a reference type, then the type of the
conditional expression is that reference type» → tipo `Integer`, y meter un `null` en una `Integer` no hace nada.
En la segunda, `1250` y `caja` son ambas *numeric expressions*, así que es condicional numérica, y §15.25.2 dice que
si un operando es `T` primitivo y el otro es el resultado de encajar `T`, el tipo es `T` = `int`; y el propio JLS
advierte «numeric promotion may include unboxing conversion (§5.1.8)». Se evalúa la rama `false`, que es la caja
`null`, se desempaca, y §5.1.8: «If `r` is `null`, unboxing conversion throws a `NullPointerException`». Medido:
traza en `TernarioDesempacota.java:8` con `con guia : 1250` impreso antes. El detalle didáctico: el tipo de la
expresión se decide **en compilación**, antes de saber qué rama se ejecuta.

**Entrevista.** «¿Cuándo uso `Integer` en lugar de `int`? Dime un caso en que la caja sea correcta y uno en que sea
un bug.»

**Respuesta modelo:** la caja es correcta cuando la **ausencia** es un dato que el negocio reconoce: un peso de guía
que no se pesó, un `Map<String, Integer>` de totales por zona, un campo JSON opcional, y siempre que entre en una
colección o en un tipo de parámetro —un `List<int>` no existe y el borrado de tipos de M11 convierte cualquier
`List<T>` en referencias—. Es un bug en tres formas concretas: (1) en un bucle de cálculo, porque cada `+=` sobre una
caja abre y vuelve a cerrar un objeto (medido el bytecode: dos `intValue`, un `iadd`, un `valueOf`); (2) en una
comparación con `==`, porque fuera del cajón estás preguntando identidad sin quererlo; (3) en el tipo de retorno de
un método que se declara `Integer` y se usa como `int` en todas partes: se pone al llamador en la obligación de
manejar un `null` que nadie pensó, y eso es exactamente el `Cannot invoke "java.lang.Integer.intValue()"` de
`SumaCajaNula`. La regla que se cita en entrevistas y que este tema verificó de punta a punta: **primitivos para
calcular, cajas para los datos que pueden no existir**, y nunca `==` entre dos cajas. Bonus de seniority: si ves en un
`pull request` un `new Integer(x)`, se cambia a `Integer.valueOf(x)` —el constructor está deprecado desde Java 9 con
la justificación literal de espacio y tiempo, y el compilador lo avisa, medido como `Note: ... uses or overrides a
deprecated API.`—.

#### 12. Cuándo usarlo y cuándo no

| Úsalo | No lo uses |
|---|---|
| `Integer`/`Long` cuando la **ausencia** es información (campo opcional de JSON, clave de mapa sin valor aún, «no se pesó») | `Integer` para acumular o calcular en un bucle: ahí el bytecode paga dos `intValue` y un `valueOf` por vuelta (medido) |
| `equals` entre dos cajas, `compareTo` si quieres orden, `int` en alguno de los lados si lo que comparas es valor | `==` entre dos cajas fuera del rango −128..127: pregunta identidad y depende de la caché (medido: `128 == 128` es `false`) |
| `Integer.valueOf(v)` siempre que necesites fabricar una caja a propósito (por ejemplo el `remove(Integer.valueOf(7))` del tema 4) | `new Integer(v)`, deprecado desde Java 9 y con aviso del compilador (medido el `Note:`) |
| `getOrDefault(k, 0)` / `merge(k, v, Integer::sum)` para que un `get` ausente nunca llegue a desempaquetarse | `+= mapa.get(k)` sin decidir el ausente: medido, el programa imprime `trae null` y revienta dos líneas después |
| `long`/`int` y **después** encajar (`Long bien = 100000L`), con literales que **quepan** (`Byte cajaChica = 120`) | `Long gramos = 100000;` ni `Byte desbordado = 128;`: `int cannot be converted to Long/Byte`, los dos medidos |
| La caché como **dato observable** (medir el corte en un experimento, citarlo como «en esta JVM») | La caché como **contrato** en código de producción o en una aserción, y `-XX:AutoBoxCacheMax` como arreglo de un `==` |

**Costo y criterio.** Lo estructural de este tema se midió y se citó como medido: el corte en 128 y en −129, el
`5001` con las dos banderas, que `Long`/`Short`/`Character` no se muevan, que `Byte` esté entero en su cajón, que
`Double` no tenga, y los tres textos de error. Lo que sí puedes usar como criterio sin medir es lo que cada camino
**te obliga a preguntar**: si es `int`, no hay ausencia y hay que definir un centinela; si es `Integer`, hay
`null` y hay que abrirlo dentro de una guarda; si son dos cajas, `==` no es tu pregunta. De ahí la regla del curso
para los próximos módulos: **declara primitivo todo lo que calcula; declara caja solo lo que puede faltar; compara
valor con `equals`/`compareTo` o con un primitivo en alguno de los lados; y si una firma devuelve `Integer`, ese
`null` es parte del contrato y se documenta o se elimina.** En M5 esto se multiplica: cuando tus clases tengan
`equals`/`hashCode`, la misma trampa de `==` reaparece pero sin red de seguridad —nada comparable al cajón de
−128..127—, y el `NullPointerException` por desempaquetar pasa a ser `NullPointerException` por invocar un método
tuyo sobre una referencia ausente. Y en M12, cuando el `Map<String, Integer>` se use con `merge` y con `get`
encadenados, la regla del neutro (nivel 2, trampa A) es lo que separa un contador que funciona de uno que tira el
lote entero.
### Tema 6: Algoritmos a mano y coste: búsqueda lineal y binaria, ordenación y notación O · Básico · 40 min

#### 1. Ubicación y prerrequisitos

Curso Java · tramo Fundamentos · módulo 4 · sexto tema y cierre del módulo. Antes:
[Tema 2](#tema-2-arreglos-multidimensionales-y-la-clase-arrays-ordenar-copiar-comparar-y-buscar) —aquí se ejecuta
la misma búsqueda sobre el mismo arreglo ordenado, y la cuenta que aquel tema dejó abierta («`binarySearch` sobre un
arreglo desordenado no es solo ineficiente: es falso», medido allí con `2` para 1250 y `-1` para 890) es exactamente
la precondición que este tema escribe a mano—, [Tema 1](#tema-1-arreglos-creacion-valores-por-defecto-recorrido-y-arrayindexoutofboundsexception)
(`v.length` como frontera y el `Index 5 out of bounds for length 5` que aquí reaparece como `Index 4 out of bounds for
length 4`, esta vez por un `<=` mal puesto), [Tema 4](#tema-4-arraylist-y-hashmap-primer-uso) (todo lo que aquí se
escribe a mano es lo que `Collections.sort` y un mapa hacen por ti; el `15997` contra `31996000` es la razón por la
que en M21 se estudia el interior de esas llamadas), [Tema 5](#tema-5-wrappers-y-autoboxing-cache-de-integer-y-el-nullpointerexception-al-desempaquetar)
(y el contraste deliberado: en este tema **todo es `int`**, porque un contador en un lazo cuadrático con cajas paga
tres llamadas por vuelta además de las que estás contando) y del [Módulo 3 · tema 3](modulo-3.md) vienes con los
cuatro lazos —el `for` anidado de la burbuja y el `while` con `break` de la inserción ya los escribiste allí—, del
[Módulo 3 · tema 4](modulo-3.md) con que Java devuelve **un** valor (por eso el contador de este tema viaja en un
`int[1]`, medido en `BuscarYOrdenarAMano`), y del [Módulo 1 · tema 1](modulo-1.md) con el desbordamiento silencioso
de `int` y sus métodos exactos: `Math.multiplyExact(camiones, gramosPorCamion)` dejó allí la salida
`multiplyExact dice:  integer overflow`, y aquí se reusa sobre `100000 * 99999` (medido en la sección 6). Después:
el temario es explícito con el techo de este tema —`docs/temarios/java-objetivo.md`, sección de descartes, decisión
D6—: «Estructuras de datos y algoritmos completos (árboles B, grafos, caminos mínimos, ordenación avanzada) … Java
enseña el uso y el interior de las colecciones (M4 T6, M21). El curso completo de algoritmos no existe en la
academia». Así que aquí se para la cuenta: cuatro algoritmos, comparaciones medidas y la notación para hablar de
ellas; los árboles y los grafos son de otro curso. En M5 tus objetos entran en esas colecciones, en M11 los genéricos
permiten escribir `binaria` una vez y usarla con cualquier tipo con `Comparable`, y en M21 se abre el `ArrayList` y
el `HashMap` por dentro con el mismo instrumento que aquí se afina: contar. Versión: JDK 25. Fuentes del temario
para este tema: CS61B (UC Berkeley) · MOOC de Helsinki parte 12 · roadmap de java-journey. Estado frente al curso
antiguo, según `docs/temarios/java-objetivo.md`: **falta** —no es un tema «está pero básico»; en el curso viejo la
notación O se nombraba en una tabla de colecciones sin que nadie contara una comparación, y ningún algoritmo estaba
escrito—.

#### 2. Objetivo

Al terminar sabes escribir y explicar, con la salida delante, estos cuatro programas y sus números:

- Búsqueda **lineal**: sobre `{7600, 250, 1250, 890, 3400, 45, 18000}` devuelve
  `lineal 890 : indice 3 · comparaciones 4`, y cuando el dato no está,
  `lineal 999 : indice -1 · comparaciones 7 (repaso los 7 porque no estaba)`. Es decir: **n** en el peor caso, con
  `n = 7` medido en la propia línea.
- Búsqueda **binaria**: sobre el mismo arreglo ya ordenado, `binaria 890: indice 2 · comparaciones 3` y
  `binaria 999: indice -1 · comparaciones 3` —el mismo coste found y not found, y 3 en lugar de 7—. Y que el
  resultado coincide con la biblioteca en el caso que acierta
  (`mismo resultado que Arrays.binarySearch: true`) pero **no** en el que falla: medido en esta sesión, para el 999
  tu función dice `-1` y `Arrays.binarySearch` dice `-4`, porque la API devuelve `-(punto de inserción + 1)`.
- Ordenación por **inserción** y por **burbuja** sobre el mismo dato de 7 elementos:
  `insercion  : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 14` contra
  `burbuja    : [...] · comparaciones 21`, y `21` es exactamente `7·6/2`.
- Cómo **crece** cada una, medido en la tabla de `Crecimiento`: al pasar `n` de 1000 a 8000, la lineal pasa de
  1000 a 8000 (×8), la binaria de 10 a 13 (+1 por cada duplicado) y la columna cuadrática de 499500 a 31996000
  (×64,06, medido). Y el extrapolo con la misma función del laboratorio: `n = 1 000 000` → 20 comparaciones;
  `n = 1 000 000 000` → 30.
- Que dos algoritmos de la **misma familia** no son la misma cosa según el dato: sobre 8000 elementos invertidos
  empatan exactos (`invertido 8000   : insercion 31996000 · burbuja 31996000`), pero sobre 8000 casi ordenados la
  inserción hace `15997` y la burbuja sigue haciendo `31996000`; el programa imprime el ratio como
  `ratio burbuja/insercion en casi ordenado: 2000` —que es una división entera truncada: el valor real es
  2000,125—. Y sabes por qué `15997` es `2n-3` (medido en 4, 8, 16 y 8000: 5, 13, 29, 15997).
- Los tres fallos que **no lanzan excepción** (`OrdenRoto`): `[3400, 3400, 890] · perdió el 1250`,
  `medio peligroso   : -1` frente a `medio seguro      : 2147483646` y `sin rescatar      : [7600, 7600, 7600]`.
- Que el **contador también es código**: `100000*(99999)/2 : long 4999950000 · int 704982704`, y sabes reconstruir
  el número malo paso a paso.
- Y qué cuesta realmente un intercambio de tres líneas: `2 iaload` y `2 iastore` (offsets 2, 8, 9 y 13 del
  volcado), y dónde queda el `arraylength` según escribas `i < v.length` o `i < n` (offset 6 dentro del lazo contra
  offset 3 fuera, medidos con `javap -c -p`).

Lo que **no** es objetivo de este tema y lo dejo dicho: no se mide tiempo de ejecución ni se compara
micro-arquitectura. Todo número de coste que aparece aquí es **comparaciones contadas por el propio programa**, que
es un entero exacto y repetible; un cronómetro no lo es.

#### 3. Por qué importa

**1. Es el único tema del módulo donde un programa incorrecto imprime un resultado plausible.** En los temas 1 a 5
el error se anuncia: un índice fuera de rango, un `ArrayStoreException`, un `NullPointerException`. Aquí no.
`intercambioRoto` compila, corre, no lanza nada y deja `[3400, 3400, 890]`: se perdió el `1250`.
`insercionSinRescate` compila, corre y devuelve `[7600, 7600, 7600]` en vez de `[250, 1250, 7600]` —y el seguimiento
casilla a casilla (medido en esta sesión) muestra que el 250 desaparece en `i=1` y el 1250 en `i=2`—. Un manifiesto
de carga con esa ordenación no revienta: **ordena mal en silencio**, y el error lo paga alguien tres capas más
lejos. Por eso `verificar.sh` comprueba estas cuatro líneas de texto: son la única evidencia de que el programa
está roto.

**2. La precondición de la binaria no la vigila nadie.** `Arrays.binarySearch` no comprueba el orden: el tema 2 lo
midió (devuelve `2` para 1250 en un arreglo desordenado —acierto casual— y `-1` para 890 que sí estaba en el índice
3). Escribir la binaria a mano una vez es lo que convierte esa trampa en algo que puedes **predecir**: cada vuelta
descarta la mitad en función del orden, así que con el orden roto lo que descarta es información falsa, no trabajo.

**3. El vocabulario de coste del resto del curso se paga aquí.** Cuando en M21 se lea el crecimiento del hueco de
`ArrayList` (`0 → 10 → 15 → 22`, medido en el tema 4) o en M12 se justifique un `HashMap` frente a un filtro, la
frase que se usa es «lineal», «logarítmico» o «cuadrático». Aquí esas palabras tienen detrás una tabla de enteros
contados por un programa escrito por ti, no una etiqueta copiada. Y el descarte D6 del temario deja claro hasta
dónde llega la academia con esto: el curso de algoritmos completos no existe; lo que existe es la capacidad de
contar y de dudar de una cifra que no se midió.

**4. El contador es código con sus propios errores.** `int mal = nGrande * (nGrande - 1) / 2;` en
`Crecimiento.java:101` produce `704982704` para `n = 100000`. Nadie lanza nada. Si ese contador es un total de
gramos, un costo o una métrica de negocio, el número malo se publica.

#### 4. Analogía

**El archivador de la central de RutaFlow, un mostrador con la tanda sin ordenar y dos aprendices ordenando.**

- **Lineal = repasar el mostrador con el dedo.** Llegan 7 guías tiradas en cualquier orden y buscas la RF-000890:
  miras la primera, la segunda… Cuatro miradas y aparece (`comparaciones 4`). Si la guía no está, repasas las 7
  igual (`repaso los 7 porque no estaba`): el método no sabe cuándo parar antes, porque nada le dice que ya recorrió
  todo lo posible. Ese es el precio de no tener orden: **cada elemento vale una mirada**.
- **Binaria = el archivador ordenado doblado por la mitad.** El archivador de 7 cajones está ordenado por peso.
  Metes el dedo en el del medio (peso 1250, índice 3), dices «890 va antes», y **tiras la mitad derecha entera**.
  Vuelta 2: rango 0..2, miras el índice 1 (250) → «después». Vuelta 3: rango 2..2, índice 2 (890) → es. Tres
  miradas en vez de cuatro para el mismo dato, y las mismas tres para una guía que no existe: el archivador doblado
  se agota en log₂, no en n. **Si alguien metió una guía fuera de lugar, doblar ya no sirve**: el aprendiz tira la
  mitad equivocada con total seguridad, y eso es lo que el tema 2 midió devolviendo `-1` para un elemento presente.
- **Inserción = ordenar naipes en la mano.** Tomas el siguiente, lo deslizas hacia atrás hasta encontrar uno más
  pequeño y lo sueltas. Con la mano casi ordenada, cada naipe nuevo se desliza **dos miradas** (la del vecino grande
  y la del pequeño que frena el deslizamiento): por eso `15997 = 2n-3` en el dato casi ordenado, medido. Con la mano
  invertida, cada naipe recorre toda la mano: `31996000`.
- **Burbuja = pasar el dedo por la hilera comparando vecinos, ida y vuelta, siempre hasta el final.** El aprendiz
  **no sabe mirar si ya quedó ordenada**, así que hace las `n(n-1)/2` comparaciones con la mano invertida y con la
  mano casi ordenada: `31996000` en los dos casos, medido. Ese es el punto fino: burbuja e inserción son de la misma
  familia cuadrática, pero una **responde al dato** y la otra no.
- **Intercambio sin variable temporal = trasvasar entre dos jarros sin tener un tercero.** Pasas el vino del jarro A
  al B, y luego «el del B al A» —pero el B ya tiene el vino de A: lo que trasvasiás es la misma cantidad dos veces y
  el A original se perdió (`[3400, 3400, 890] · perdió el 1250`). El tercer jarro (`int temporal = v[i];`) no es
  pedantería, es la única forma de que exista el dato que vas a pisar.
- **El contador en `int` = un odómetro que se da la vuelta.** El camión recorrió 9 999 900 000 unidades y el aparato
  tiene cinco cifras: muestra 704 982 704 y sigue contando contento.

**Dónde se rompe la analogía.** En el archivo, «mirar un cajón» tiene un coste fijo; en una máquina no: mirar el
elemento 2 de un arreglo y el 1 000 000 cuesta lo mismo (acceso directo, tema 1), mientras en una lista enlazada
cada mirada obliga a avanzar desde el principio —que es, precisamente, por lo que la binaria no se aplica a una
`LinkedList` y sí a un `ArrayList`, tema 4—. Segunda rotura: las miradas de esta analogía son **comparaciones**, y
el programa real también ejecuta accesos, sumas y saltos; el `javap` del nivel 3 cuenta 4 accesos al arreglo por
intercambio, que en la analogía serían «agarrar el jarro», y nadie los está contando en la tabla. Tercera: el
aprendiz puede mirar y decidir parar; la burbuja del laboratorio **no tiene guarda de parada escrita**, y por eso su
cifra no cambia con el dato —una burbuja con bandera sí la cambiaría, y se deja como ejercicio en la sección 8—.

#### 5. Diagrama

```mermaid
flowchart TB
    IN["tanda de guías: 7600, 250, 1250, 890, 3400, 45, 18000"] --> P1{"¿qué necesito?"}
    P1 -->|"encontrar un valor"| ORD{"¿está ordenado?"}
    P1 -->|"ordenar la tanda"| DAT{"¿cómo viene el dato?"}
    ORD -->|"sí"| BIN["binaria<br/>log2(n) · medido 3 para n=7<br/>10 · 11 · 12 · 13 al duplicar"]
    ORD -->|"no, y busco una sola vez"| LIN["lineal<br/>n en el peor caso<br/>medido 7 para n=7"]
    ORD -->|"no, y busco muchas"| SORT["ordenar primero (Arrays.sort)<br/>y después binaria<br/>tema 2: buscar sin ordenar MIENTE"]
    DAT -->|"casi ordenado"| INS["inserción<br/>2n-3 · medido 15997 con n=8000"]
    DAT -->|"invertido"| AMB["cuadrático de todos modos<br/>medido 31996000 para las dos"]
    DAT -->|"toda la vida igual"| BUB["burbuja<br/>n(n-1)/2 · 21 con n=7<br/>no mira si ya está ordenado"]
    BIN -.->|"cada vuelta descarta la mitad"| HAL["rango 0..6 → 0..2 → 2..2"]
    HAL -.->|"un mal medio mata el lazo"| MED["bajo + (alto - bajo) / 2<br/>(bajo + alto) / 2 → -1 medido"]
```

**Texto alternativo.** El diagrama es el árbol de decisión real de este tema. Entrada: la misma tanda de 7 pesos.
Rama de búsqueda: si el arreglo está ordenado, la binaria cuesta 3 miradas con `n = 7`, 10 con 1000, 13 con 8000;
si no está ordenado y buscas una sola vez, la lineal con `n` miradas es igual de barata que pararse a ordenar; y si
buscas muchas, ordenas primero —con la advertencia del tema 2, donde `binarySearch` devolvió `-1` para un elemento
que sí estaba. Rama de ordenación: la inserción responde al dato (2n−3 casi ordenado, cuadrática invertida), la
burbuja no (n(n−1)/2 siempre). Debajo, la arista que conecta la binaria con `OrdenRoto`: doblar el rango exige un
punto medio, y `(bajo + alto) / 2` se desborda a `-1` medido, mientras `bajo + (alto - bajo) / 2` da `2147483646`.

#### 6. Explicación

**Nivel 0 — las cuatro funciones y cómo se cuenta sin romper Java.**

Lo primero es un problema de lenguaje, no de algoritmos: una función de búsqueda quiere devolver **dos** cosas, el
índice y cuántas comparaciones hizo. Java devuelve un valor. En `BuscarYOrdenarAMano.java` se resuelve con un
arreglo de una casilla que se pasa como parámetro (`tema-6/BuscarYOrdenarAMano.java:8-17`):

```java
// Lineal: mira uno por uno. El PEOR caso es n comparaciones.
static int lineal(int[] v, int objetivo, int[] contadas) {
    contadas[0] = 0;
    for (int i = 0; i < v.length; i++) {
        contadas[0]++;
        if (v[i] == objetivo) {
            return i;
        }
    }
    return -1;
}
```

Es el mismo truco del módulo 3 tema 4: **lo que se copia es la referencia**, así que la función no puede cambiar el
`int` del llamador pero sí la casilla `contadas[0]` del arreglo que le prestaron. (Alternativas legítimas que se
mencionan para que no parezca la única: un campo, un `record Resultado(int indice, int comparaciones)` o dos
funciones. La casilla prestada es la más corta y la que menos ruido hace en un laboratorio.)

La binaria (`:20-35`) es la misma forma con la guarda de la que nadie se acuerda:

```java
static int binaria(int[] v, int objetivo, int[] contadas) {
    contadas[0] = 0;
    int bajo = 0, alto = v.length - 1;
    while (bajo <= alto) {
        contadas[0]++;
        int medio = bajo + (alto - bajo) / 2;       // asi se evita el desbordamiento de (bajo+alto)/2
        if (v[medio] == objetivo) {
            return medio;
        } else if (v[medio] < objetivo) {
            bajo = medio + 1;
        } else {
            alto = medio - 1;
        }
    }
    return -1;
}
```

Tres cosas están ahí sin decoración, y las tres se pueden medir. `bajo <= alto`: con `<` se deja de comprobar la
última casilla —medido en esta sesión con un arreglo de un solo elemento `{890}`, la versión con `<` devuelve `-1` y
la con `<=` devuelve `0`; y sobre los siete ordenados, buscando el último (`18000`) la versión con `<` también dice
`-1` contra `6`—. `bajo = medio + 1`: el medio ya se miró, y volver a mirarlo es el bucle infinito del nivel 3. Y
`bajo + (alto - bajo) / 2`: el desbordamiento del nivel 2. Salida literal:

```text
arreglo    : [7600, 250, 1250, 890, 3400, 45, 18000]
lineal 890 : indice 3 · comparaciones 4
lineal 999 : indice -1 · comparaciones 7 (repaso los 7 porque no estaba)
ordenado   : [45, 250, 890, 1250, 3400, 7600, 18000]
binaria 890: indice 2 · comparaciones 3
binaria 999: indice -1 · comparaciones 3
mismo resultado que Arrays.binarySearch: true
insercion  : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 14
burbuja    : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 21
```

Lectura, línea a línea:

| Línea | Qué dice el número |
|---|---|
| `lineal 890 : indice 3 · comparaciones 4` | El índice es 3 y las miradas 4: se mira la casilla 0, 1, 2 y 3. En la lineal, «encontrarlo» cuesta `índice + 1`. |
| `lineal 999 : indice -1 · comparaciones 7` | No está. Cuesta **n**, y el programa lo comenta por su cuenta: `repaso los 7 porque no estaba`. Ese es el peor caso que se usa en la tabla del nivel 1. |
| `binaria 890: indice 2 · comparaciones 3` | Mismo arreglo, ahora ordenado: 3 miradas. La secuencia exacta (medida en esta sesión con la misma función): rango `0..6` → miro `3` (1250) → a la izquierda; rango `0..2` → miro `1` (250) → a la derecha; rango `2..2` → miro `2` (890) → es. |
| `binaria 999: indice -1 · comparaciones 3` | Y aquí está la diferencia de verdad: **el caso negativo no cuesta más**. Las tres miradas se agotan solas. |
| `mismo resultado que Arrays.binarySearch: true` | Compara el caso que acierta: ambos `2`. |
| `insercion … comparaciones 14` / `burbuja … comparaciones 21` | Mismo dato de salida, misma respuesta ordenada, distinto trabajo. `21` es `7·6/2` exacto. |

Sobre esa última pareja hay un detalle que conviene no tragarse sin comprobar: la igualdad con la biblioteca solo
vale **cuando encuentra**. Medido en esta sesión sobre `[45, 250, 890, 1250, 3400, 7600, 18000]` buscando 999:

```text
binaria propia 999 = -1 · Arrays.binarySearch 999 = -4
binaria propia 890 = 2 · Arrays.binarySearch 890 = 2
```

`-4` no es un `-1` con otro humor: `Arrays.binarySearch` devuelve `-(punto de inserción + 1)`, y el 999 iría en la
casilla 3 (delante del 1250), así que `-(3+1) = -4`. Tu función devuelve `-1` y está **invertido el contrato**: si
en el laboratorio de verdad te pidiera «en qué casilla debería estar», tendrías que recorrerla otra vez. Se deja
como ejercicio 2 de la sección 8 precisamente porque la comprobación del laboratorio (`… true`) no cubre ese caso.

---

**Nivel 1 — cómo crece cada una, en enteros contados.**

`Crecimiento.java` no cronometra: **formula y cuenta**. Las dos funciones de búsqueda se invocan sobre tamaños
crecientes y las dos ordenaciones corren de verdad sobre 8000 elementos. Salida literal:

```text
n      lineal  binaria   n*(n-1)/2
1000   1000    10       499500
2000   2000    11       1999000
4000   4000    12       7998000
8000   8000    13       31996000
binaria: al duplicar n solo suma 1 comparacion (8 -> 1000, 16 -> 2000)
invertido 8000   : insercion 31996000 · burbuja 31996000
casi ordenado 8000: insercion 15997 · burbuja 31996000
  ratio burbuja/insercion en casi ordenado: 2000
100000*(99999)/2 : long 4999950000 · int 704982704
```

Cuatro lecturas:

1. **Columna lineal.** `comparacionesLineal(n)` devuelve `n` (`Crecimiento.java:5-7`) porque el peor caso de la
   lineal es «el objetivo no está». 1000 → 1000, 8000 → 8000: la relación es ×1, por eso se llama lineal.
2. **Columna binaria.** `comparacionesBinaria(n)` (`:9-20`) recorre el peor camino posible —siempre a la derecha—
   y cuenta vueltas hasta que `bajo > alto`. Sale 10, 11, 12, 13. Es ⌊log₂ n⌋ + 1: 2¹⁰ = 1024 ≥ 1000. La línea
   `al duplicar n solo suma 1 comparacion (8 -> 1000, 16 -> 2000)` es la traducción en prosa de esa columna.
   Repitiendo el mismo bucle con `n` mayores (medido en esta sesión con la misma función): 1 000 000 → **20**,
   1 000 000 000 → **30**. Mil millones de elementos y treinta comparaciones: ese es el argumento completo de la
   binaria, y no hay que creérselo —se puede ejecutar—.
3. **Cuarta columna, la cuadrática.** `499500`, `1999000`, `7998000`, `31996000` son `n(n-1)/2` literales
   (`(long) n * (n - 1) / 2`, `:79`). Al multiplicar `n` por 8 (de 1000 a 8000), el coste se multiplica por
   64,06 —medido: `31996000 / 499500 = 64.056056`—, no por 64 exacto porque la fórmula real tiene el `-1`. Ahí está
   la diferencia entre «O(n²)» y la fórmula: la notación dice *qué orden de magnitud* crece, la fórmula dice
   *cuántas*. Y el exceso sobre 64 se encoge solo, que es exactamente lo que la notación declara despreciable
   (medido, comparando `n` con `8n` en la misma fórmula): `n = 1 000` da `64.056056`, `n = 100 000` da `64.000560`,
   `n = 10 000 000` da `64.000006`. Dos cifras menos cada vez que `n` gana tres ceros.
4. **El encabezado y las cifras no están alineadas del todo**, y eso también es observable: `499500` cae en la
   columna 24 y el texto `n*(n-1)/2` del encabezado empieza en la 25 (medido con `indexOf`). El encabezado es un
   `System.out.println` escrito a mano; las filas salen de
   `String.format("%-6d %-7d %-8d %d", …)` (`:78-79`), que no tiene ancho para la última columna. Lección de
   laboratorio, no de algoritmos: un encabezado tecleado **no garantiza** alineación, y si alguien compara estas
   filas con un `grep` de espacios, el que falla es el `grep`.

**Qué significa la O y qué no.** `O(f(n))` responde «¿qué término se queda cuando n crece?», y por eso la lineal y
la binaria están en familias distintas (n vs log n) mientras inserción y burbuja están en la misma (n²). Lo que
**no** dice la notación: que dos algoritmos de la misma familia den el mismo número en tu dato. Eso se mide, y es el
nivel 2.

---

**Nivel 2 — el mismo dato, dos destinos: la inserción responde, la burbuja no.**

`Crecimiento.java` genera dos arreglos de 8000: `invertido(n)` (`:56-62`) y `casiOrdenado(n)` (`:64-73`, un arreglo
ordenado al que se le mueve el último elemento al principio con `System.arraycopy`). Los dos se ordenan con las dos
funciones y se leen los contadores:

```text
invertido 8000   : insercion 31996000 · burbuja 31996000
casi ordenado 8000: insercion 15997 · burbuja 31996000
  ratio burbuja/insercion en casi ordenado: 2000
```

- **En el peor caso empatan exactos.** No «más o menos»: los dos `31996000`. Y se entiende sin fe: con el arreglo
  invertido, la inserción para el elemento `i` recorre las `i` casillas anteriores todas mayores que él, así que suma
  `1 + 2 + … + 7999 = 7999·8000/2 = 31996000`; la burbuja, como no tiene guarda de parada, suma `1 + 2 + … + 7999`
  por construcción (`:43-51`). Las dos cuadráticas coinciden en el peor caso porque el peor caso de la inserción
  **es** la burbuja en número de comparaciones.
- **En casi ordenado se separan 2000 veces.** La inserción hace `15997`. El porqué se puede ver, no solo citarlo:
  con `n = 8000` el dato generado es `[7999, 0, 1, 2, …, 7998]`. El primer naipe (valor 0) recorre hasta el fondo
  porque solo hay un vecino y es mayor → 1 comparación. A partir de ahí, cada valor `k` necesita **dos**: la del
  7999 que sigue desplazándose y la del vecino pequeño que frena el deslizamiento. Total `1 + 2·7998 = 15997`.
  Medido con una versión que imprime el conteo por `i` (`i=1 → 1`, `i=2 → 2`, `i=3 → 2`, `i=4 → 2`) y contrastado
  contra `2n-3` en `n = 4, 8, 16, 8000` → `5, 13, 29, 15997`, clavados. La burbuja, mientras, `31996000` otra vez:
  **el dato no le llega a entrar**.
- **El `2000` impreso es una división entera.** `:96` hace `dBub / cCas` con los dos como `long`, así que
  `31996000 / 15997` da `2000`; el valor real es `2000.1250234418953` (medido). No es un error del laboratorio —es
  lo que el programa pidió—, pero hay que saber que el ratio de la salida está truncado, porque la frase
  «2000 veces menos» leída al pie de la letra sugiere exactitud donde hay piso.
- **Y el contador tiene su propio fallo, que es el más fácil de pasar por alto.** `:99-102`:

```java
int nGrande = 100000;
long bien = (long) nGrande * (nGrande - 1) / 2;
int mal = nGrande * (nGrande - 1) / 2;
System.out.println("100000*(99999)/2 : long " + bien + " · int " + mal);
```

```text
100000*(99999)/2 : long 4999950000 · int 704982704
```

  El `int` no lanza nada y muestra una cifra **positiva** más pequeña, que es peor que un número raro. La
  reconstrucción, medida paso a paso en esta sesión: `100000 * 99999` como `int` vale `1409965408` (el producto real
  es `9999900000`; `9999900000 − 2·2³² = 1409965408`), y al dividir entre 2 sale `704982704`. Es decir: el desbordamiento
  ocurrió **antes** de la división, que es lo que hace inútil escribir `/ 2` confiado. El JLS lo define, no lo
  desaprueba —§15.17.1: «If an integer multiplication overflows, then the result is the low-order bits of the
  mathematical product as represented in some sufficiently large two's-complement format. As a result, if overflow
  occurs, then the sign of the result may not be the same as the sign of the mathematical product of the two operand
  values.»— y por eso el cast tiene que estar en el operando (`(long) nGrande * …`), no en el resultado: poner
  `(long) (nGrande * (nGrande - 1)) / 2` ya no arregla nada, porque lo que se ensancha es el daño. Las dos vías
  limpias son las del módulo 1: `long` desde el principio, o `Math.multiplyExact`, que **sí** avisa (medido en esta
  sesión: `multiplyExact(int,int) -> java.lang.ArithmeticException: integer overflow`, y sobre `long` da
  `9999900000` sin problema; `Math.toIntExact(4999950000L)` también lanza).

**Los tres fallos silenciosos de `OrdenRoto.java`.** Salida literal completa:

```text
intercambio roto  : [3400, 3400, 890] · perdió el 1250
intercambio bien  : [3400, 1250, 890]
medio peligroso   : -1
medio seguro      : 2147483646
sin rescatar      : [7600, 7600, 7600] · esperado [250, 1250, 7600]
con Arrays.sort   : [250, 1250, 7600]
```

1. **`intercambioRoto` (`:8-11`)**: dos líneas que parecen un intercambio y no lo son.

   ```java
   v[i] = v[j];
   v[j] = v[i];                    // mal: v[i] ya vale v[j], así que no se recupera nada
   ```

   El segundo paso lee `v[i]`, pero el primer paso ya lo pisó. Resultado medido: `[3400, 3400, 890]` con el `1250`
   fuera. Sin excepción, sin aviso, sin `assert` que lo pille. El arreglo bien hecho, con `int temporal`, sale
   `[3400, 1250, 890]`. **La variante «inteligente» sin temporal tampoco sirve** (medido en esta sesión sobre
   `[1250, 3400, 890]`):

   ```text
   xor con i!=j : [3400, 1250, 890]
   xor con i==j : [1250, 0, 890]
   ```

   Con `i != j` el truco `v[i] ^= v[j]; v[j] ^= v[i]; v[i] ^= v[j]` funciona. Con `i == j` —que en burbuja y en
   inserción **nunca** pasa, pero en un `intercambio(v, i, i)` escrito por un humano o generado por un filtro sí—
   borra la casilla y deja `0`. El tercer jarro no es folklore: es lo que hace que la función sea segura para
   cualquier par de índices.
2. **`puntoMedioPeligroso` (`:20-22`)**: `(bajo + alto) / 2` con `bajo = Integer.MAX_VALUE - 1` y
   `alto = Integer.MAX_VALUE` imprime `-1`, mientras la resta por el medio (`:24-26`) imprime `2147483646`. Medido
   el paso intermedio, que es el que explica todo: la suma **como `int`** vale `-3`, y `-3 / 2` es `-1` porque la
   división entera trunca hacia cero (eso ya estaba en el [Módulo 1 · tema 1](modulo-1.md): `-7 / 2` es −3). Medido
   también el vecino inmediato, para que se vea que el signo no es broma: con `bajo = Integer.MAX_VALUE - 2` y el
   mismo `alto`, la suma da `-4` y el cociente `-2`. La consecuencia directa dentro de `binaria` sería `v[-1]`, y eso
   sí lanza (medido): `java.lang.ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 3`.

   Hay una **tercera** forma, y es la que usa la biblioteca (leída en el código fuente de esta JDK,
   `java.base/java/util/Arrays.java:1703-1713`, dentro de `binarySearch0(int[], int, int, int)`):

   ```java
   while (low <= high) {
       int mid = (low + high) >>> 1;
       int midVal = a[mid];
       if (midVal < key)
           low = mid + 1;
       ...
   }
   return -(low + 1);  // key not found.
   ```

   Medido con los mismos dos extremos: `(bajo + alto) >>> 1` da `2147483646`, o sea **lo mismo que la resta por el
   medio**, aunque la suma siga valiendo `-3`. Funciona porque `>>>` reinterpreta los 32 bits como entero **sin
   signo**, y para índices de arreglo eso es legítimo: los dos sumandos son no negativos y su suma máxima es
   `MAX_VALUE + MAX_VALUE = 4294967294`, que es `2³² − 2` (medido) y por tanto **cabe** en la interpretación sin
   signo. La división con `/` no puede hacer eso porque su tipo es `int` con signo.

   Ahora bien, hay que decirlo con precisión, porque es la anécdota más exagerada de la literatura Java: **ningún
   arreglo real llega a `Integer.MAX_VALUE` de longitud** —el límite de longitud es `int`, así que un arreglo de
   2 147 483 647 casillas de `int` necesitaría más de 8 GB de heap, y `alto` solo se acerca a eso cuando el `int`
   viene de otro sitio: un rango de base de datos, un desplazamiento dentro de un archivo, una cota leída de un
   fichero de configuración—. Y las dos reparaciones tienen alcances distintos: `(low + high) >>> 1` está bien **mientras los dos
   extremos sean índices no negativos**, y `bajo + (alto - bajo) / 2` está bien para cualquier par de `int`. El fallo
   que se enseña no es «tus arreglos se van a desbordar»: es que **la fórmula del medio es un `int` como cualquier
   otro**, que la versión correcta se escribe en una línea, que la biblioteca eligió la suya por un motivo que se
   puede leer en el fuente, y que quien escribe `(a + b) / 2` en un *code review* está pidiendo un motivo para
   creerle.
3. **`insercionSinRescate` (`:29-38`)**: es la inserción de nivel 0 con el `while` y **sin** la línea final
   `v[j + 1] = valor;` (el archivo lo marca: `// falta: v[j + 1] = valor;`). Sobre `[7600, 250, 1250]` deja
   `[7600, 7600, 7600]` contra el esperado `[250, 1250, 7600]`. El seguimiento casilla a casilla, medido con una
   versión instrumentada:

   ```text
   i=1 -> [7600, 7600, 1250]
   i=2 -> [7600, 7600, 7600]
   ```

   Es decir: el `250` desaparece en la primera vuelta (se desplaza sobre sí mismo y nadie lo devuelve al hueco) y el
   `1250` en la segunda. Y hay **un segundo bug dentro del mismo método**: la condición del `while` compara contra
   `v[i]`, que es una casilla que el propio desplazamiento va escribiendo. En el código correcto se rescata el valor
   en un local **antes** de mover nada (`BuscarYOrdenarAMano.java:41`: `int valor = v[i];`). Ese par de líneas de
   diferencia es la razón de que este tema se escriba a mano: son los dos fallos que no se ven en la salida de
   `Arrays.sort`, porque `Arrays.sort` no los tiene.

---

**Nivel 3 — por dentro: qué cuesta cada línea y qué pasa cuando el lazo no cierra.**

`CosteEnBytecode.java` da dos cosas que la analogía de las «miradas» ocultaba. Salida ejecutada:

```text
intercambio        : [1250, 250, 7600]
sumaVista/sumaGuardada: 9100 / 9100
```

(el intercambio de `[7600, 250, 1250]` con índices 0 y 2, y `1250 + 250 + 7600 = 9100` por las dos vías). El
`javap -c -p` de los tres métodos, extracto textual del volcado tomado en esta sesión:

```text
static void intercambioDeTresPaso(int[], int, int);
   0: aload_0
   1: iload_1
   2: iaload            <- acceso 1: lee v[i]
   3: istore_3          <-    el temporal vive en la variable local 3
   4: aload_0
   5: iload_1
   6: aload_0
   7: iload_2
   8: iaload            <- acceso 2: lee v[j]
   9: iastore           <- acceso 3: escribe v[i]
  10: aload_0
  11: iload_2
  12: iload_3
  13: iastore           <- acceso 4: escribe v[j]
  14: return

static long sumaVista(int[]);
   4: iload_3
   5: aload_0
   6: arraylength       <- dentro del lazo
   7: if_icmpge     23
  10: ... iaload / i2l / ladd
  17: iinc          3, 1
  20: goto          4   <- retaguardia: el 6 se vuelve a ejecutar

static long sumaGuardada(int[]);
   2: aload_0
   3: arraylength       <- fuera del lazo
   4: istore_3
   5: iconst_0
   6: istore        4
   8: iload         4
  10: iload_3
  11: if_icmpge     28
  ...
  22: iinc          4, 1
  25: goto          8
```

Tres hechos, y el criterio para no pedir más de los que sostienen:

1. **Tres líneas de intercambio son cuatro accesos al arreglo** (`2 iaload` + `2 iastore`), no tres. Y el
   `int temporal` no cuesta un acceso extra: cuesta un `istore_3` sobre una variable local, que es más barato que
   tocar el heap. Por eso el intercambio «en dos líneas» del nivel 2 no es una optimización: es un acceso menos y un
   dato menos.
2. **La longitud se lee donde la escribís.** `i < v.length` mete el `arraylength` dentro del cuerpo del lazo
   (offset 6, con la retaguardia `goto 4` que vuelve a pasar por él); `int n = v.length` lo saca (offset 3, ejecutado
   una vez). Lo que **no** afirma este tema es que la segunda sea más rápida: no se midió tiempo, y en un lazo tan
   simple el JIT puede hacer lo que le dé la gana con la primera. La afirmación que sí se sostiene con el volcado es
   estructural y de legibilidad: el bytecode de `sumaVista` **re-ejecuta la lectura de longitud por vuelta**, y en un
   arreglo que no cambia eso es información redundante que además enmascara el caso donde sí cambiaría (un lazo sobre
   una `List` que crece, tema 4). `iinc 3, 1` / `iinc 4, 1` son el `i++`, `goto` es la vuelta de la condición, y con
   eso el lazo completo está visto: comparación, acceso, suma, incremento, salto.
3. En el `main` del mismo volcado, los literales `7600`, `250` y `1250` salen como `sipush` (offsets 5, 11 y 17) y
   el arreglo se crea con `iconst_3` + `newarray int` + tres pares `dup`/`iastore`. Es el mismo `newarray` del tema 1
   visto desde el otro lado: tres casillas, tres escrituras, en orden.

**Los tres errores reproducibles**, que son la otra mitad del nivel 3 porque enseñan lo que el compilador **sí**
detiene y lo que solo se ve ejecutando. Salidas literales de esta corrida:

- `errores/BurbujaFueraDeRango.java` — la burbuja correcta con el límite interior `j <= i` (línea 8) en lugar de
  `j < i`. Primera vuelta con `i = 3`: cuando `j` llega a 3, `pesos[j + 1]` es `pesos[4]` sobre un arreglo de 4:

  ```text
  Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4
      at BurbujaFueraDeRango.main(BurbujaFueraDeRango.java:9)
  ```

  Nótese el parentesco con el tema 1 (`Index 5 out of bounds for length 5`): mismo mensaje, y aquí generado por un
  `<=` en el bucle **anidado**, que es donde la gente lo escribe.
- `errores/BusquedaQueNoTermina.java` — la binaria con `bajo = medio` (línea 16) en lugar de `medio + 1`. Imprime
  primero la buena y después se detiene gracias a una guarda que el propio programa se puso:

  ```text
  bien  : 890 en el indice 1
  Exception in thread "main" java.lang.IllegalStateException: no converge: 1001 vueltas, sigue en 2..3
      at BusquedaQueNoTermina.mal(BusquedaQueNoTermina.java:10)
      at BusquedaQueNoTermina.main(BusquedaQueNoTermina.java:42)
  ```

  Sobre `[250, 890, 1250, 3400]` buscando 3400, el rango se achica `0..3` → `1..3` → `2..3` y ahí se queda:
  `medio` calcado sobre `bajo` es `2`, y asignar `bajo = medio` **no descarta nada**. El mensaje lo dice con las
  dos variables: `sigue en 2..3`. La lección didáctica vale tanto como la del bug: ante la sospecha de que un lazo
  no cierra, se instrumenta con un tope y un `IllegalStateException` con estado dentro (`++vueltas > 1000`), se
  ejecuta, y se lee. Sin esa guarda tendrías un proceso clavado y un `jstack`.
- `errores/ComparaConMenorQue.java` — `<` entre dos `String` (línea 8). No compila:

  ```text
  errores/ComparaConMenorQue.java:8: error: bad operand types for binary operator '<'
          if (a < b) {                              // mal: < solo va con numeros
                ^
    first type:  String
    second type: String
  1 error
  ```

  Es el error de quien viene de Python o de JS. La reparación está en el propio archivo como comentario:
  `// bien: if (a.compareTo(b) < 0) ...`, que es `String.compareTo` del módulo 2 y, a la vez, la razón de que el
  orden de `Arrays.sort` sobre cadenas no sea el de `+`. Y aquí es donde la binaria de este tema se vuelve
  transferible: `binaria` exige un `<` que signifique «va antes», y con objetos ese `<` es `compareTo` —que en M11
  se generaliza con `<T extends Comparable<T>>` para escribir la función una sola vez—.

#### 7. Código ejecutable

**Las cuatro funciones con contador** · archivo `tema-6/BuscarYOrdenarAMano.java` · ejecuta
`javac --release 25 -d out tema-6/BuscarYOrdenarAMano.java && java -Dstdout.encoding=UTF-8 -cp out BuscarYOrdenarAMano`

```java
// Binaria: divide por la mitad. Requiere el arreglo ORDENADO.
static int binaria(int[] v, int objetivo, int[] contadas) {
    contadas[0] = 0;
    int bajo = 0, alto = v.length - 1;
    while (bajo <= alto) {
        contadas[0]++;
        int medio = bajo + (alto - bajo) / 2;       // asi se evita el desbordamiento de (bajo+alto)/2
        if (v[medio] == objetivo) {
            return medio;
        } else if (v[medio] < objetivo) {
            bajo = medio + 1;
        } else {
            alto = medio - 1;
        }
    }
    return -1;
}

// Insercion: mete cada elemento en su lugar. Barato en casi-ordenado, caro en invertido.
static void insercion(int[] v, int[] contadas) {
    int c = 0;
    for (int i = 1; i < v.length; i++) {
        int valor = v[i];
        int j = i - 1;
        while (j >= 0) {
            c++;
            if (v[j] > valor) {
                v[j + 1] = v[j];
                j--;
            } else {
                break;
            }
        }
        v[j + 1] = valor;
    }
    contadas[0] = c;
}

// Burbuja: va intercambiando vecinos. Mas comparaciones que insercion en el mismo dato.
static void burbuja(int[] v, int[] contadas) {
    int c = 0;
    for (int i = v.length - 1; i > 0; i--) {
        for (int j = 0; j < i; j++) {
            c++;
            if (v[j] > v[j + 1]) {
                int temporal = v[j];
                v[j] = v[j + 1];
                v[j + 1] = temporal;
            }
        }
    }
    contadas[0] = c;
}
```

Salida completa (9 líneas). Las nueve están citadas tal cual en la sección 6: todas dentro del nivel 0, en el bloque
de `:215-223`, y cinco de ellas (`lineal 890`, `lineal 999`, `binaria 890`, `binaria 999` y la de
`Arrays.binarySearch`) vuelven a aparecer fila a fila en la tabla de `:230-234`. Las de `insercion` y `burbuja`
se retoman en el nivel 2 **por sus cifras** (14 y 21 comparaciones sobre 7 elementos), no por el texto de la línea:

```text
arreglo    : [7600, 250, 1250, 890, 3400, 45, 18000]
lineal 890 : indice 3 · comparaciones 4
lineal 999 : indice -1 · comparaciones 7 (repaso los 7 porque no estaba)
ordenado   : [45, 250, 890, 1250, 3400, 7600, 18000]
binaria 890: indice 2 · comparaciones 3
binaria 999: indice -1 · comparaciones 3
mismo resultado que Arrays.binarySearch: true
insercion  : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 14
burbuja    : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 21
```

**El crecimiento medido** · `tema-6/Crecimiento.java` · 10 líneas de salida, todas en la sección 6. El bloque que
hay que escribir a mano y que es el corazón del tema (las otras funciones son las del tema anterior con un contador
pegado):

```java
int[] c = casiOrdenado(8000);
long cCas = insercion(c)[0];
int[] d = casiOrdenado(8000);
long dBub = burbuja(d)[0];
System.out.println("casi ordenado 8000: insercion " + cCas + " · burbuja " + dBub);
System.out.println("  ratio burbuja/insercion en casi ordenado: " + (dBub / cCas));

int nGrande = 100000;
long bien = (long) nGrande * (nGrande - 1) / 2;
int mal = nGrande * (nGrande - 1) / 2;
System.out.println("100000*(99999)/2 : long " + bien + " · int " + mal);
```

Obsérvese el `casiOrdenado(8000)` llamado **dos veces**: las dos funciones ordenan el arreglo que reciben, así que
compartir una sola copia contaminaría la segunda medición con la salida de la primera. Es el mismo «los datos se
mutan» del tema 1, aplicado al experimento de coste.

**Tres fallos sin excepción** · `tema-6/OrdenRoto.java` · salida de 6 líneas citada entera en el nivel 2:

```text
intercambio roto  : [3400, 3400, 890] · perdió el 1250
intercambio bien  : [3400, 1250, 890]
medio peligroso   : -1
medio seguro      : 2147483646
sin rescatar      : [7600, 7600, 7600] · esperado [250, 1250, 7600]
con Arrays.sort   : [250, 1250, 7600]
```

**Por dentro** · `tema-6/por-dentro/CosteEnBytecode.java` · 2 líneas de salida y los tres cuerpos del `javap`
arriba. Compilar y ejecutar:
`javac --release 25 -d out tema-6/por-dentro/CosteEnBytecode.java && java -Dstdout.encoding=UTF-8 -cp out CosteEnBytecode`;
volcado de instrucciones: `javap -c -p -cp out CosteEnBytecode`.

**Los tres errores** · `tema-6/errores/`. Dos revientan al ejecutar con mensaje de la biblioteca, uno no compila:

```text
BurbujaFueraDeRango.java   -> java.lang.ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4 (linea 9)
BusquedaQueNoTermina.java  -> imprime "bien  : 890 en el indice 1" y luego
                              java.lang.IllegalStateException: no converge: 1001 vueltas, sigue en 2..3 (linea 10, llamada desde 42)
ComparaConMenorQue.java    -> error: bad operand types for binary operator '<' (linea 8, first/second type: String)
```

#### 8. Mini-laboratorio

Escribe los archivos desde cero en `laboratorios/modulo-4/tema-6/`. La regla del módulo se repite aquí con más
razón que nunca: **predice el número antes de ejecutar**, y la diferencia entre tu predicción y la salida es el
ejercicio. En este tema no hay una sola excepción que te avise si te equivocas en el razonamiento; el resultado malo
se parece mucho al bueno.

1. Crea `MisCuatroFunciones.java`: escribe `lineal`, `binaria`, `insercion` y `burbuja` sin mirar el laboratorio,
   sobre un arreglo tuyo de **11** elementos. Antes de compilar, escribe en comentarios cuatro números: las
   comparaciones que crees que hará la lineal para un valor que está en la posición 9, las que hará para uno que no
   está, las de la binaria para un valor presente y las de la burbuja. Ejecuta y pega la salida al lado. ¿Cuántos
   de tus cuatro pronósticos eran correctos? ¿Cuál falló y por qué? (La respuesta del cuarto está en
   `n(n-1)/2` y no depende del dato.)
2. Crea `ContratoDeBinarySearch.java`: implementa tu binaria devolviendo `-1` cuando no está y otra que devuelva el
   punto de inserción firmado igual que la biblioteca (`-(punto + 1)`). Mide las dos sobre `[45, 250, 890, 1250,
   3400, 7600, 18000]` con objetivos 890, 999 y 5. Pega las seis cifras y explica en comentario por qué tu `-1`
   obliga a un segundo recorrido y el `-4` de la API no. (Medido en la sección 6: `Arrays.binarySearch(…, 999)` =
   `-4`, punto de inserción 3.)
3. Crea `OrdenSinOrden.java`: toma el arreglo **desordenado** `int[] v = {1250, 3400, 890, 7600, 250}` y corre tu
   binaria para cada uno de los cinco valores, sin ordenar. Pega los cinco índices y cuenta cuántos son correctos.
   Compara con `Arrays.binarySearch` sobre el mismo arreglo y pega lo que devuelva. **No arregles nada**: responde
   por escrito qué tuvo que pasar para que una búsqueda «rápida» te dijera con seguridad que 890 no estaba.
4. Crea `CasiOrdenadoAMano.java`: genera el dato `[n-1, 0, 1, …, n-2]` para `n = 4, 8, 16, 64` y para 8000, ejecuta
   la inserción con contador y pega las cuatro cifras pequeñas y la grande. Comprueba que la fórmula `2n-3` te
   explica las cuatro primeras antes de citar la quinta. Después agrega una **bandera de parada** a la burbuja
   (`if (!huboIntercambioEnEstaVuelta) break;`) y vuelve a medir los 8000 casi ordenados: pega las dos burbujas
   (sin bandera: `31996000`; con bandera: lo que salga) y explica por qué la burbuja del laboratorio no la tiene y
   qué le cuesta a cambio.
5. Crea `IntercambioSeguro.java`: implementa el intercambio de tres líneas, el de dos líneas (`OrdenRoto`) y el XOR
   de tres, y llámalos con `i != j` **y** con `i == j` sobre `[1250, 3400, 890]`. Pega los nueve resultados. ¿Cuál
   de los tres borra datos en más casos y cómo lo ves sin imprimir el arreglo entero? (Medido aquí: el XOR con
   `i == j` deja `[1250, 0, 890]`.)
6. Crea `CuentaQueSeDaVuelta.java`: calcula `n(n-1)/2` para `n = 100000` de cuatro formas: `int`, `long`,
   `(long) n * (n-1) / 2` y `Math.multiplyExact(n, n-1)`. Pega las cuatro salidas, incluida la traza del
   `ArithmeticException` (medido: `java.lang.ArithmeticException: integer overflow`). Escribe debajo en qué orden
   ocurren desbordar y dividir, con la reconstrucción aritmética de `704982704` que aparece en la sección 6.
7. Crea `InstrumentaElLazo.java`: copia la binaria rota (`bajo = medio`) y ponle la guarda de vueltas tú mismo, con
   un tope de 20 en lugar de 1000. Ejecuta, pega el mensaje con el rango en el que se quedó, y responde por escrito
   dos cosas: por qué la condición debe ser `bajo <= alto` y no `bajo < alto` (mídelo con un arreglo de 1 elemento),
   y qué cambia entre `bajo = medio` y `bajo = medio + 1` dicho en términos del elemento que se descarta.
8. Crea `MirameElBytecode.java`: escribe dos sumas de arreglo como en `por-dentro/CosteEnBytecode.java` (una con
   `v.length` en la condición, otra guardado), compila, ejecuta `javap -c -p` y pega los dos cuerpos. Marca con un
   comentario en el volcado la línea del `arraylength` de cada uno y a qué salta la retaguardia del lazo. Cuéntale a
   un compañero, señalando el volcado, por qué aquí **no** puedes afirmar que una sea más rápida que la otra.

**Listo cuando** puedas (1) decir, sin calcularlo, cuántas comparaciones hace tu burbuja con `n = 11` y cuántas la
lineal en el peor caso —y por qué una respuesta no depende del dato y la otra tampoco—, (2) explicar por qué la
binaria cuesta lo mismo encontrando que no encontrando, con la secuencia de rangos `0..6 → 0..2 → 2..2` en la mano,
(3) justificar `15997` para 8000 casi ordenados sin invocar «O(n)»: tiene que salirte `2n-3` y el porqué de las dos
miradas por naipe, (4) escribir de memoria la forma segura del punto medio y decir qué mide exactamente `-1` en
`medio peligroso`, y (5) reconocer los tres fallos silenciosos en código ajeno: el intercambio de dos líneas, el
`while` sin rescate final y el contador en `int` de un acumulado que puede crecer.

#### 9. Verificación

```bash
cd docs/reestructuracion/cursos/java/laboratorios/modulo-4
javac --release 25 -d /tmp/a tema-6/*.java && javac --release 25 -d /tmp/b tema-6/por-dentro/*.java
java -Dstdout.encoding=UTF-8 -cp /tmp/a BuscarYOrdenarAMano   # «burbuja    : [...] · comparaciones 21»
java -Dstdout.encoding=UTF-8 -cp /tmp/a OrdenRoto             # «medio peligroso   : -1»
java -Dstdout.encoding=UTF-8 -cp /tmp/a Crecimiento           # «casi ordenado 8000: insercion 15997 · burbuja 31996000»
java -Dstdout.encoding=UTF-8 -cp /tmp/b CosteEnBytecode       # «sumaVista/sumaGuardada: 9100 / 9100»
javap -c -p -cp /tmp/b CosteEnBytecode | grep -E 'iastore|arraylength|iinc'
java -Dstdout.encoding=UTF-8 -cp /tmp/e BurbujaFueraDeRango   # ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4
java -Dstdout.encoding=UTF-8 -cp /tmp/e BusquedaQueNoTermina  # IllegalStateException: no converge: 1001 vueltas, sigue en 2..3
javac --release 25 -d /tmp/e tema-6/errores/ComparaConMenorQue.java  # bad operand types for binary operator '<'
```

Aquí las **22** comprobaciones del tema pasan con Temurin 27 y `--release 25`, y el total del laboratorio del módulo
es **188 / 0 fallidas / 0 omitidas** (el reparto medido bloque a bloque: T1 25 · T2 35 · T3 30 · T4 43 · T5 29 ·
**T6 22** · Gradle 4). Dentro de las 22: **16** de salida ejecutada —seis de `BuscarYOrdenarAMano`, cuatro de
`Crecimiento`, cuatro de `OrdenRoto` y dos de `CosteEnBytecode`—, **3 de bytecode** (`iastore`, `arraylength`,
`iinc`, las tres sobre el mismo `.class`), **2** que exigen código ≠ 0 **y** el texto de la excepción
(`Index 4 out of bounds for length 4` y `no converge: 1001 vueltas`) y **1** que exige que el `javac` falle con
`bad operand types for binary operator`. Las cuatro cifras que sostienen el tema —`14`, `21`, `15997`,
`31996000`— están cada una en su propia comprobación, pero no con la misma fuerza: `14` (inserción sobre los 7
elementos), `21` (burbuja sobre los mismos 7) e `15997` (inserción sobre los 8000 casi ordenados) aparecen una sola
vez, mientras que `31996000` aparece en **tres** —la fila `8000` de la tabla, el invertido y el casi-ordenado—, así
que si alguien cambia un límite de bucle en `Crecimiento.java` se rompen tres puertas en vez de una.

*Pendiente de reejecución en JDK 25:* el **texto** de los tres mensajes (`Index 4 out of bounds for length 4`,
`no converge: 1001 vueltas, sigue en 2..3` —que lo redacta el propio programa, así que solo el formato es de la
JVM—, y `bad operand types for binary operator '<'` con `first type: String`, que lo redacta `javac`), la traza
`java.lang.ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 3` citada en el nivel 2 y
`java.lang.ArithmeticException: integer overflow` citada en el nivel 3, los **offsets e índices del constante pool**
del volcado (`2: iaload`, `13: iastore`, `6: arraylength`, `#7`, `#13`), que son numeración interna de esta
compilación, y el detalle de formato del encabezado de `Crecimiento` (columna 25 contra 24). Nada de eso es una
regla que se enseñe.

*Lo que no depende de la versión:* que la lineal en el peor caso haga `n` comparaciones y la burbuja
`n(n-1)/2` **sea cual sea el dato** —es aritmética del lazo, no política de una biblioteca—; que la binaria haga
⌊log₂ n⌋+1; que `15997 = 2n-3` para el arreglo casi ordenado construido así; que el ordenamiento por inserción sea
lineal en datos casi ordenados; que `(bajo + alto)` se desborde y `bajo + (alto - bajo)` no —el JLS define el
recorte de los bits bajos en §15.17.1 sin margen de implementación—; que `Math.multiplyExact` lance
`ArithmeticException` en lugar de recortar; que el intercambio sin variable temporal pierda un dato; que
`Arrays.binarySearch` devuelva `-(punto de inserción + 1)` (es contrato publicado de la API); y que `<` entre
`String` no compile, por la regla de tipos de §15.20.1: «The type of each of the operands of a numerical comparison
operator must be a type that is convertible (§5.1.8) to a primitive numeric type, or a compile-time error occurs».
`String` no es convertible a un numérico primitivo, así que el error es la regla y el mensaje de `javac` citado
arriba es su consecuencia.

#### 10. Error común y diagnóstico

**Síntoma 1 — «ordené la tanda y el reporte sale raro», sin ninguna traza.** El manifiesto se imprimió entero, con
los pesos en un orden que *casi* cuadra. `sin rescatar      : [7600, 7600, 7600]` es ese bug: dos elementos
convertidos en dos copias del mayor y uno desaparecido. **Detección:** una ordenación propia tiene que conservar el
**multiconjunto** de entrada. Escribe la prueba antes que el algoritmo: copia el arreglo, ordénalo y compara las dos
copias ordenadas de menor a mayor, o suma los valores antes y después (`9100` antes, `9100` después —medido en
`CosteEnBytecode` que las dos sumas dan igual). Si el total cambió, perdiste o duplicaste un dato. **Arreglo:** la
línea que falta, `v[j + 1] = valor;`, con el valor rescatado en un local **antes** de desplazar.

**Síntoma 2 — el intercambio de dos líneas.** `[3400, 3400, 890]`. **Diagnóstico rápido:** busca en el método un
índice que se escriba dos veces y se lea después de la segunda escritura. **Arreglo:** variable temporal. **No
arregla esto:** el truco XOR (medido: `[1250, 0, 890]` cuando `i == j`), que cambia un fallo obvio por uno que
depende de si el llamador pasa índices distintos.

**Síntoma 3 — un lazo que no termina y un proceso que hay que matar.** Antes de sospechar de la JVM, instrumenta:
`if (++vueltas > 1000) throw new IllegalStateException("no converge: " + vueltas + " vueltas, sigue en " + bajo +
".." + alto);` sale en 200 ms y te dice el estado (`sigue en 2..3`, medido). **Las dos causas típicas de no
convergencia en binaria** son `bajo = medio` (no descarta el medio, 1001 vueltas) y `bajo < alto` con un rango de
una casilla que nunca se comprueba. **Regla que se deriva de lo medido:** cada vuelta tiene que **reducir** el rango
en por lo menos una casilla; `medio + 1` y `medio - 1` lo hacen porque el `medio` ya fue mirado.

**Síntoma 4 — «`binarySearch` me dice que no está, pero está».** No es la biblioteca: es el orden (`Index 4` del
tema 2: `-1` para un 890 que sí estaba). **Diagnóstico:** pregunta «¿quién garantizó el orden de este arreglo?» Si la
respuesta es «lo llené yo en el orden en que llegaban los mensajes», la binaria está prohibida. **Tres salidas:**
lineal si es una consulta suelta, ordenar una vez y buscar muchas, o moverse a un `TreeMap`/estructura que mantenga el
orden por ti (M21). **Y ojo con la cifra que se cita:** «binaria es más rápida» es cierto en comparación con lineal
sobre **arreglo ordenado**; si hay que ordenar para cada búsqueda, la comparación correcta es lineal × k contra
`n(n-1)/2` + k·log n, y ahí el coste de ordenar entra en la cuenta.

**Síntoma 5 — un número de coste que nadie puede repetir.** «Esto es O(n²) así que será lento» no es una medida; y
«tardó 340 ms» tampoco es repetible en otra máquina. **Arreglo:** contar una operación **elegida por adelantado**
(comparaciones, accesos, escrituras) y publicar la fórmula con la que se genera el número. Aquí la operación elegida
son las comparaciones, por eso `burbuja` da 21 y 31996000 sin importar la máquina. **Y cuidado con lo que se cuenta
en el denominador:** `dBub / cCas` imprimió `2000` cuando el valor real era `2000.125` —división entera truncada—;
un ratio publicado sin decir si es entero es una cifra a medias.

#### 11. Pregunta con respuesta modelo

**Comprensión.** Sobre 7 elementos, tu lineal hace 4 comparaciones para encontrar un valor y 7 para no encontrarlo.
Tu binaria hace 3 en los dos casos. ¿Por qué la binaria no «se pone más cara» cuando el elemento no está?

**Respuesta modelo:** porque su coste no depende de encontrar: depende de **cuántas veces se puede doblar el rango**
hasta que quede vacío. `bajo <= alto` se cumple mientras queden casillas por descartar, y cada vuelta descarta
mitad, así que el número de vueltas acotado por ⌊log₂ n⌋+1 tanto si aciertas como si no. Medido: `binaria 890:
indice 2 · comparaciones 3` y `binaria 999: indice -1 · comparaciones 3`, y la traza de sondas de esta sesión es
`0..6 → 0..2 → 2..2` en ambos casos. La lineal sí depende del dato, porque su única forma de saber que no está es
haberse comido las `n` casillas: medido `comparaciones 7 (repaso los 7 porque no estaba)`. El detalle que delata al
que nunca lo escribió: la lineal tiene dos casos (encontrar, no encontrar) y la binaria uno.

**Comprensión.** Burbuja e inserción dan `31996000` las dos con 8000 elementos invertidos, pero con 8000 casi
ordenados la inserción hace `15997` y la burbuja `31996000`. ¿Qué tiene la burbuja que la hace inmune al dato?

**Respuesta modelo:** que **no mira si ya está ordenado**: sus dos `for` anidados (`:60-61` de la versión con
contador) recorren todas las parejas `j, j+1` con una sola cuenta regresiva de `i`, así que el número de
comparaciones es `n(n-1)/2` **por construcción**, ni un `if` que se salte vueltas. La inserción en cambio tiene una
guarda natural: `while (j >= 0)` con `break` en cuanto encuentra un vecino menor o igual, así que su coste es
`n − 1 + (desplazamientos)`. Con el dato `[7999, 0, 1, …]` cada elemento después del primero cuesta 2 miradas y sale
`1 + 2·7998 = 15997` (medido, y verificado contra `2n-3` en `n = 4, 8, 16`). Por eso son «la misma O(n²)» y no «el
mismo algoritmo»: la notación describe el **peor caso**, y la diferencia entre los dos está en el mejor y el típico.
Bonus: la burbuja con bandera de parada arregla esto en el casi-ordenado y **no** lo arregla en el invertido.

**Análisis.** `int mal = nGrande * (nGrande - 1) / 2;` con `nGrande = 100000` muestra `704982704`. ¿Dónde está el
error y por qué poner `(long)` al final no lo arregla?

**Respuesta modelo:** el error está en la multiplicación, no en la división. `100000 * 99999` son `9999900000`, que
no cabe en `int`; según JLS §15.17.1 el resultado es la parte baja del producto en complemento a dos, y medido eso
vale `1409965408` (`9999900000 − 2·2³²`). Después `/ 2` da `704982704`, que es exactamente lo impreso. Si ensanchas
al final —`(long) (nGrande * (nGrande - 1)) / 2`— el daño ya está hecho dentro del paréntesis y el cast solo
ensancha el número equivocado. Las dos formas correctas, ambas medidas: el cast **en el operando**
(`(long) nGrande * (nGrande - 1) / 2` → `4999950000`) o declarar el contador `long` desde el principio; y si
quieres que el programa grite en lugar de mostrar una cifra plausible, `Math.multiplyExact(100000, 99999)` →
`java.lang.ArithmeticException: integer overflow`. Y el punto de fondo: el número malo es **positivo y verosímil**,
que es la peor clase de resultado silencioso.

**Entrevista.** «Dime en qué caso usarías inserción en lugar de `Arrays.sort`, y cuándo la lineal en lugar de la
binaria.»

**Respuesta modelo:** en producción, casi nunca: la inserción solo gana a una ordenación eficiente en datos
*sustancialmente* casi ordenados y pequeños, y las implementaciones de `Arrays.sort` (dual-pivot para primitivos,
mergesort estable para objetos) ya tienen entradas baratas para ese caso; pero saber que la inserción hace `2n-3` en
casi-ordenado frente a los `n(n-1)/2` de una burbuja sin bandera **es lo que te deja leer** por qué una librería
elige una u otra, y ese análisis es del M21. En la entrevista lo que se evalúa es la segunda parte: la lineal gana
cuando (a) el arreglo **no** está ordenado y buscas una vez —ordener cuesta cuadrático o `n log n` y una lineal
cuesta `n`, medido `7`—, (b) el arreglo está ordenado pero es tan chico que el doblar no paga, o (c) la colección no
es de acceso aleatorio, donde la binaria está prohibida: no puedes «abrir el archivador por la mitad» si para ver la
mitad tienes que caminar desde el principio. Y el cierre que separa la respuesta senior de la memorizada: cualquier
elección de coste en Java se justifica **contando una operación definida**, no citando una etiqueta; y si no se puede
contar, se dice «esto es una estimación» y no se convierte en un requisito.

#### 12. Cuándo usarlo y cuándo no

| Úsalo | No lo uses |
|---|---|
| Lineal sobre un arreglo tal como llega, cuando buscas **una vez**: `n` comparaciones, sin precondiciones (medido: 7 con `n = 7`) | Lineal «porque es fácil» dentro de un bucle que itera sobre la misma tanda: eso es `n²` sin decirlo, y la binaria con un `Arrays.sort` previo casi siempre gana |
| Binaria **sobre arreglo ordenado** y de acceso aleatorio: log₂ medido 3 con 7 elementos, 20 con un millón | Binaria sobre lo que no está ordenado (tema 2: `-1` para un presente) ni sobre una lista enlazada, donde no puedes doblar sin caminar |
| `Arrays.sort` + `Arrays.binarySearch` en código de trabajo; la versión de contrato firmado `-(punto+1)` si necesitas saber **dónde** iría | Tu `-1` propio como si fuera el de la API: medido, para 999 la biblioteca dice `-4` y la tuya `-1`, y quien lo lea buscará el punto de inserción en el índice −1 |
| Inserción cuando **sabes** que el dato viene casi ordenado y es chico (`2n-3`, medido) | Burbuja en producción: sin bandera de parada hace `n(n-1)/2` gaste lo que gaste el dato (medido: `31996000` en los dos arreglos de 8000), y con bandera sigue sin ganar a lo que trae la biblioteca |
| `long` o `Math.multiplyExact` para cualquier contador que pueda crecer con `n` | `int` en `n * (n - 1) / 2` o en un acumulado de lotes: medido, `704982704` y ni una traza |

**Costo y criterio.** Lo medido de este tema es exacto y repetible porque **son conteos, no tiempos**: `4`, `7`,
`3`, `14`, `21`, `10/11/12/13`, `20`, `30`, `31996000`, `15997` y `704982704` salen de ejecutar el programa, no de
una tabla; y las tres cosas que dependen de la implementación se marcaron como pendientes (los textos de `javac` y
de las excepciones, los offsets del `javap` y el truncado del ratio). Lo que se puede usar como criterio sin medir:
la precondición de cada algoritmo, que es lo que realmente decide. Buscar sin orden ⇒ lineal; buscar con orden
garantizado ⇒ binaria, y la garantía tiene un **dueño** (quien ordenó o quien mantiene la estructura); ordenar ⇒ la
biblioteca, y el ejercicio a mano existe para que puedas leer lo que la biblioteca hace; acumular con `n` grande ⇒
`long` y, si el neutro importa, `*Exact`. Y la regla que cierra el módulo y se cita en M21: **toda afirmación de
coste que no puedas convertir en una operación contada es una opinión**, y una opinión no entra en un requisito de
RutaFlow. En el laboratorio de este módulo el manifiesto se resuelve «con arreglos» y «con colecciones» y las dos
versiones tienen que cuadrar (README del laboratorio); este tema es el que le pone número a la palabra *cuadrar*: `sobreElTope`
usa `Arrays.sort` + `Arrays.binarySearch` y su coste es `n log n` una vez más `log n` por consulta, no `n` por
consulta.

---

## Cierre del módulo

### Resumen

- Un arreglo se crea de tres formas y **vacío no significa `null`**: `new int[3]` trae ceros, `new int[3][]` trae
  **tres filas `null`** (medido: el primer `porFila[i].length` lanza `NullPointerException`), y el inicializador
  `{1250, 3400}` fija la longitud para siempre. `length` es un campo, no un método: `ConfundeParentesisConLength`
  no compila, y el recorrido fuera de rango sale en las dos direcciones —`Index 5 out of bounds for length 5` hacia
  arriba y `Index -1 out of bounds for length 3` hacia abajo, los dos medidos en `tema-1/errores/`—.
- Una matriz es **un arreglo cuyos elementos son arreglos**: `[[I` es la clase real de un `int[][]` (medido), las
  filas pueden tener longitudes distintas y la clase `Arrays` es la biblioteca que opera sobre eso —`sort`,
  `equals`, `toString`, `copyOf`, `fill`, `binarySearch`—. El abuso caro: `binarySearch` sin ordenar **miente**, y se
  midió (`2` para 1250, `-1` para 890 que sí estaba). Y `Arrays.asList` es una **vista**: `set` muta el arreglo,
  `add` lanza `UnsupportedOperationException`, y pasarle un `int[]` da una lista de **un** elemento.
- La covarianza de arreglos sigue viva: `Object[] vista = new String[3]` es legal (misma identidad, sin copia), pero
  la escritura ilegal deja el arreglo **a medio escribir** con `ArrayStoreException`, el cast de vuelta falla **al
  leer** con `ClassCastException`, y en `Object[][]` la guarda es contra el componente (`String[]`), así que
  `vista[0] = new Integer[1]` también se rechaza (medido en `MatrizCovariante`). Las listas no son covariantes y por
  eso son más seguras: `List<Object>` a partir de `List<String>` no compila.
- `ArrayList` y `HashMap` son el par que casi siempre se usa en lugar del arreglo: `add`/`get`/`size`, el `put` que
  devuelve el valor anterior, `merge(k, v, Integer::sum)` para acumular —`put` en un lazo acumulador sobrescribe y no
  avisa: medido, NORTE pasó de 1950 a 700—, el `remove(1)` que borra la **posición** y no el valor, la
  `ConcurrentModificationException` con su dependencia del dato, `List.of` inmutable (`UnsupportedOperationException`
  tardío y en otra capa) y el `HashMap` que **no** garantiza el orden de inserción mientras `LinkedHashMap` sí
  (medido: `LinkedHashMap si lo conserva: [Medellin, Bogota, Cali]`; con esas cuatro claves el `HashMap` imprimió el
  mismo orden por accidente del `hashCode` y de su capacidad, no por contrato). El hueco interno medido por reflexión
  pasa `0 → 10 → 15 → 22`.
- Los envoltorios son cartón: encajar es `Integer.valueOf`, **no** `new` (medido en el bytecode), y el cajón de
  identidad −128..127 hace que `127 == 127` sea `true` y `128 == 128` sea `false` —los dos en la misma corrida—. El
  corte se puede mover con `-Djava.lang.Integer.IntegerCache.high=5000` o `-XX:AutoBoxCacheMax=5000` (medido:
  `5001`) pero **no** es contrato; `System.getProperty` sigue diciendo `null`. Desencajar `null` lanza
  `NullPointerException` con mensaje de «a qué método se intentó llamar» y el ternario que mezcla `int` con `Integer`
  se tipifica como `int`, o sea que desempaca la rama `null`.
- Y este tema: **cuánto trabajo hace cada cosa, contado por el propio programa**. Lineal `n` (medido 7 con `n = 7`),
  binaria ⌊log₂ n⌋+1 (medido 3, y 10→13 al duplicar, 20 con un millón, 30 con mil millones), inserción y burbuja
  `n(n-1)/2` en el peor caso (`31996000` para 8000, las dos empatadas) pero `2n-3` (`15997`) para la inserción con
  dato casi ordenado, mientras la burbuja sin bandera no se entera. Tres fallos que no lanzan excepción
  (`[3400, 3400, 890]`, `medio peligroso : -1`, `[7600, 7600, 7600]`), un contador que se desborda en `int`
  (`704982704`) y un intercambio que cuesta cuatro accesos, no tres.

### Autoevaluación

1. `new int[3][]` y luego leer `porFila[0].length`: ¿qué pasa?
   **Respuesta:** `NullPointerException`. Las filas hay que crearlas; el arreglo exterior trae tres `null`. Medido en
   el tema 2 con `tema-2/errores/FilaNula.java`, cuyo mensaje es
   `Cannot read the array length because "porFila[i]" is null`.
2. ¿`Arrays.asList(numeros)` donde `numeros` es `int[]` da una lista de enteros?
   **Respuesta:** da una lista de **un** elemento, y ese elemento es el arreglo (firma `[I`). Con `Integer[]` salen
   los tres. Medido en el tema 2, y es la diferencia entre el autoboxing de elementos (que no ocurre sobre un
   primitivo) y el encajado del arreglo entero.
3. ¿Por qué `ArrayStoreException` no se puede evitar con un `try` bien puesto?
   **Respuesta:** se puede capturar, pero no se evita: la guarda corre en tiempo de ejecución sobre el **componente**
   real del arreglo, y lo que deja atrás es un arreglo a medio escribir. Medido dos veces y de dos formas distintas:
   en `tema-3/por-dentro/MatrizCovariante.java` la escritura ilegal no tocó nada (la casilla 0 «sigue siendo `null`»
   mientras la fila de al lado sí quedó `[ok]`), y en `tema-3/EscribeEnObject.java` la excepción llegó **después** de
   cambiar la casilla 0 (`si-es-string`) y dejar las demás con su valor viejo (`RF-0001`, `RF-0002`). No hay dos
   casos iguales: el tuyo puede quedarse a medias. La respuesta estructural es no abrir la puerta: declara `List`, no
   `Object[]`.
4. `pesos.remove(1)` sobre una `List<Integer>` que vale `[10, 1, 7]`: ¿qué queda?
   **Respuesta:** `[10, 7]`: borra la **posición**. Por valor hay que escribir `remove(Integer.valueOf(7))` —y ahí se
   ve por qué a veces hay que **fabricar una caja a propósito**, tema 5—.
5. ¿Por qué `totales.put(zona, g)` dentro de un lazo acumulador no lanza nada y sale mal?
   **Respuesta:** porque `put` reemplaza. Medido: NORTE pasó de 1950 a 700 al llegar la segunda guía. La operación
   de acumular es `merge(k, v, Integer::sum)` (o `getOrDefault` + `put`).
6. `Integer a = 1000, b = 1000; System.out.println(a == b);`. ¿Y con 127?
   **Respuesta:** `false` con 1000, `true` con 127, ambos medidos en la misma corrida. 1000 cae fuera del cajón de
   `valueOf` y son dos objetos; 127 está dentro. Con un lado `int`, el resultado es `true` aunque el valor sea 890,
   porque se desempaca y se comparan números.
7. ¿Qué línea de la inserción de `OrdenRoto` falta y qué hace que aparezca `[7600, 7600, 7600]`?
   **Respuesta:** falta `v[j + 1] = valor;` después del `while`. Sin ella, los desplazamientos van escribiendo el
   mayor sobre las casillas siguientes y nadie devuelve el valor rescatado al hueco. Medido casilla a casilla:
   `i=1 -> [7600, 7600, 1250]`, `i=2 -> [7600, 7600, 7600]`.
8. Con 8000 elementos casi ordenados: ¿por qué la inserción hace 15997 comparaciones y la burbuja 31996000?
   **Respuesta:** porque la inserción tiene guarda de salida (`break` en cuanto el vecino es menor o igual) y el dato
   hace que cada elemento cueste 2 miradas salvo el primero: `1 + 2·7998 = 15997 = 2n-3`. La burbuja recorre todas
   las parejas por construcción, con `n(n-1)/2 = 31996000`, y **no** tiene bandera de parada escrita.
9. ¿Cuántas comparaciones en el peor caso para `n = 1 000 000` con binaria, y cómo lo comprobarías tú?
   **Respuesta:** 20 (⌊log₂ 10⁶⌋ + 1). No se cita de memoria: se ejecuta el lazo de `comparacionesBinaria` con ese
   `n` y se lee el contador —medido aquí, y también 30 para mil millones—.
10. `int mal = 100000 * 99999 / 2;` → `704982704`. ¿Dónde se perdió la información?
    **Respuesta:** en la multiplicación. El producto real es `9999900000`, y §15.17.1 deja la parte baja de 32 bits:
    `1409965408` (medido), que entre 2 da `704982704`. El cast al final no salva nada; se ensancha el operando o se
    declara `long`, o se usa `Math.multiplyExact` y se ve `ArithmeticException: integer overflow`.
11. ¿Por qué `(bajo + alto) / 2` da `-1` y cuál es la versión correcta?
    **Respuesta:** porque la suma de los dos `int` más grandes que hay desborda y se vuelve negativa (medido: `-1`
    con `MAX_VALUE-1` y `MAX_VALUE`; `-2` con `MAX_VALUE-2`). La correcta es `bajo + (alto - bajo) / 2`, que da
    `2147483646` porque la resta nunca sale del rango. Ningún arreglo real llega tan lejos, pero la fórmula segura
    cuesta lo mismo escribirla.
12. En `por-dentro/CosteEnBytecode`, ¿qué diferencia hay entre `sumaVista` y `sumaGuardada` y qué **no** puedes
    afirmar con esa diferencia?
    **Respuesta:** en la primera el `arraylength` está dentro del lazo (offset 6, con `goto 4` que vuelve a
    ejecutarlo); en la segunda está fuera (offset 3, una vez). Lo que no puedes afirmar es que la segunda sea más
    rápida: no se midió tiempo y el JIT hace lo que quiere con un lazo tan simple. Lo que sí afirmas es qué ejecuta
    cada vuelta según lo que escribiste.
13. Un compañero dice «mi búsqueda no encontró 890». Tú sabes que el arreglo no estaba ordenado. ¿Qué le muestras?
    **Respuesta:** el medido del tema 2 (`binarySearch` devolvió `-1` para 890, que estaba en el índice 3, y `2` para
    1250 por casualidad) y la traza de sondas de este tema: cada vuelta de la binaria **tira la mitad** basándose en
    el orden; con el orden roto tira la mitad correcta. La pregunta que hay que hacerle no es «¿por qué falla?» sino
    «quién garantizó el orden de ese arreglo».

### Siguiente módulo

Módulo 5 · Objetos y clases ([temario en `docs/temarios/java-objetivo.md`](../../../temarios/java-objetivo.md),
tramo Fundamentos, 7 temas: clases, campos, métodos y `this`; constructores con `this(...)`, bloques de
inicialización y su orden exacto; encapsulación y modificadores de acceso; `static`; paquetes e importaciones
—incluido `import module`, JEP 511, definitivo en JDK 25—; los métodos de `Object` (`toString`, `equals`,
`hashCode`); y objetos inmutables con `record`. Ninguno está escrito todavía: `static` figura como **falta**,
cuatro como **está pero básico** y los de `this` y `Object` como **ya está**, pero redactados en M0, M1 y M2 del
curso antiguo): aquí dejaste
los datos en arreglos y colecciones de `int` y `String`; ahí entran tus propias clases, y tres cosas de este módulo
vuelven a cobrarse el día uno. La primera es `equals` (Tema 5): cuando tus objetos estén en un `HashMap` como claves,
la trampa de `==` deja de tener red de seguridad. La segunda es la covarianza (Tema 3): un `Guia[]` dentro de una
`List<Guia>` se comporta distinto, y hay que saber por qué. La tercera es el conteo de este tema: cuando en M21 se
abra el `ArrayList` por dentro, la única forma de discutir lo que se ve es contar, y eso ya se practica aquí. En el
laboratorio el proyecto `rutaflow-nucleo` pasa de `Manifiesto` a un modelo con clases: la tanda de guías deja de ser
un arreglo de `String` con guiones y pasa a ser un objeto con `peso` y `zona`.
