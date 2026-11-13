# Módulo 2: Colecciones y genéricos


## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones

**Duración estimada:** 35 min.
**¿Por qué es importante?** Una colección organiza datos según cómo los vas a consultar: por posición, sin duplicados o mediante una clave.
**Prerrequisitos:** M0 T7 (arreglos y wrappers), M1 T1 (objetos). Proyecto continuo: guardar guías, evitar duplicados y buscar cada guía por su código.

**Mapa de subtemas críticos:** `List` e índices válidos (núcleo y diagnóstico, 1.1); igualdad de códigos y orden de inserción en `Set` (núcleo y límite, 1.2); reemplazo por clave, ausencia y valor `null` en `Map` (núcleo y diagnóstico, 1.3). La comparación de objetos de dominio mediante `equals/hashCode` se profundiza en M22; el orden de `TreeSet` se enseña en el Tema 3.

#### Subtema 1.1: Conserva el orden con una List · 10 min

**1. Contexto**
Una lista de entregas mantiene el orden recibido y permite consultar una guía por su posición.

**2. Hazlo tú**
Crea java-motor-colecciones/src/ColeccionesDemo.java:

```java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class ColeccionesDemo {
    public static void main(String[] args) {
        List<String> guias = new ArrayList<>();
        guias.add("RF-101");
        guias.add("RF-102");
        guias.add(1, "RF-105");
        System.out.println(guias);
        System.out.println("primera=" + guias.get(0));

        List<String> cola = new LinkedList<>(List.of("RF-101", "RF-102"));
        cola.add(0, "RF-105");
        System.out.println("cola=" + cola);
    }
}
```

Desde java-motor-colecciones/, ejecuta:

```bash
mkdir -p out
javac -d out src/ColeccionesDemo.java
java -cp out ColeccionesDemo
```

**Resultado esperado:** [RF-101, RF-105, RF-102], primera=RF-101 y cola=[RF-105, RF-101, RF-102].

**Fallo deliberado:** cambia guias.get(0) por guias.get(3). **Error esperado:** IndexOutOfBoundsException. **Diagnóstico:** los índices empiezan en cero y esta lista tiene posiciones 0, 1 y 2.

**3. Entiende**
List conserva elementos repetidos y su orden. ArrayList suele ser una buena opción general para acceder por índice o agregar al final; insertar al principio desplaza los elementos siguientes. LinkedList puede enlazar un nodo al principio sin desplazar los demás, pero encontrar una posición arbitraria todavía exige recorrer la lista.

**4. Cierra**
Anota qué posición tiene RF-105 después de insertarla y qué pasaría si la agregas al final.

#### Subtema 1.2: Evita duplicados con un Set · 10 min

**1. Contexto**
Al importar un lote pueden llegar guías repetidas. Aquí los códigos son `String`, cuya igualdad por contenido permite detectar un duplicado aunque llegue en otra instancia.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/ColeccionesDemo.java:

```java
import java.util.LinkedHashSet;
import java.util.Set;

public class ColeccionesDemo {
    public static void main(String[] args) {
        Set<String> ingreso = new LinkedHashSet<>();
        ingreso.add("RF-102");
        ingreso.add("RF-101");
        ingreso.add("RF-102");

        System.out.println("ingreso=" + ingreso);
        System.out.println("duplicada=" + ingreso.add(new String("RF-101")));
        System.out.println("cantidad=" + ingreso.size());
    }
}
```

Compila y ejecuta con los comandos del subtema 1.1.

**Resultado esperado:** ingreso=[RF-102, RF-101], duplicada=false y cantidad=2.

**Fallo deliberado:** sustituye solo la declaración por `java.util.List<String> ingreso = new java.util.ArrayList<>();` y ejecuta el mismo archivo. **Resultado erróneo esperado:** `ingreso=[RF-102, RF-101, RF-102]`, `duplicada=true` y `cantidad=4`. **Diagnóstico:** `List` conserva ambos códigos repetidos; usa `Set` cuando cada código de guía deba aparecer una sola vez.

**3. Entiende**
`LinkedHashSet` conserva el primer código y su posición de inserción; `add` devuelve `false` cuando un código ya existe. Para `String`, el contenido se compara mediante `equals` y `hashCode`, por eso `new String("RF-101")` no crea una tercera entrada. `HashSet` también descarta duplicados, pero no garantiza un orden de iteración. Un conjunto ordenado usa además una regla de comparación; verás su contrato en el Tema 3.

**4. Cierra**
Agrega `RF-103` dos veces y predice el booleano de cada `add`, el tamaño y la posición del código. Explica por qué `HashSet` no sirve si debes conservar el orden del archivo importado.

#### Subtema 1.3: Busca una guía por su clave con Map · 15 min

**1. Contexto**
Un operador necesita buscar rápidamente el estado de una guía por su identificador sin recorrer toda la lista.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/ColeccionesDemo.java:

```java
import java.util.LinkedHashMap;
import java.util.Map;

public class ColeccionesDemo {
    public static void main(String[] args) {
        Map<String, String> estados = new LinkedHashMap<>();
        estados.put("RF-101", "EN_RUTA");
        estados.put("RF-102", "ENTREGADA");
        estados.put("RF-101", "EN_REPARTO");

        System.out.println(estados.get("RF-101"));
        System.out.println(estados.getOrDefault("RF-999", "DESCONOCIDA"));
        System.out.println("guias=" + estados.size());
        estados.put("RF-103", null);
        System.out.println("registrada=" + estados.containsKey("RF-103"));
        System.out.println("valor=" + estados.getOrDefault("RF-103", "DESCONOCIDA"));
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
javac -d out src/ColeccionesDemo.java
java -cp out ColeccionesDemo
```

**Resultado esperado:** EN_REPARTO, DESCONOCIDA, guias=2, registrada=true y valor=null, en ese orden.

**Fallo deliberado:** cambia la segunda búsqueda por estados.get("RF-999").toUpperCase(). **Error esperado:** NullPointerException. **Diagnóstico:** get devuelve null si la clave no existe; comprueba el resultado o usa getOrDefault.

**3. Entiende**
`Map` relaciona una clave única con su valor. Al insertar otra vez RF-101, se reemplazó su estado y no se añadió una tercera entrada. `get` devuelve `null` tanto para una clave ausente como para una clave asociada explícitamente a `null` en este `LinkedHashMap`; `containsKey` distingue ambos casos. `getOrDefault` solo usa el valor alternativo cuando falta la clave: si existe con valor `null`, devuelve `null`. Evita guardar `null` como estado de negocio si necesitas distinguirlo de «no registrada» sin esa comprobación adicional. `LinkedHashMap` conserva el orden de inserción; `HashMap` no lo garantiza.

**4. Cierra**
Agrega la guía RF-999 con estado `EN_RUTA`, observa qué devuelve `getOrDefault` antes y después, y usa `containsKey` para explicar la diferencia con RF-103.

**Hito del tema:**

- [ ] Usé List para conservar posiciones y repetir valores.
- [ ] Eliminé duplicados y conservé el orden de inserción.
- [ ] Consulté y actualicé un estado con una clave de Map.
- [ ] Distinguí una clave ausente de una clave asociada a `null`.

**Fuentes oficiales:** [Collections Framework en dev.java](https://dev.java/learn/api/collections-framework/), [LinkedHashSet](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashSet.html) y [contrato de Map.getOrDefault](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html#getOrDefault(java.lang.Object,V)).

**Transferencia al proyecto integrador:** almacena guías en una lista ordenada, usa un Set para rechazar importaciones duplicadas y conserva el estado actual en un Map por código. **Límite:** usa `ArrayList` cuando el orden de llegada importa y habrá lecturas frecuentes por índice; usa `HashSet` solo para descartar duplicados sin importar el orden; si necesitas orden de inserción y descarte de duplicados a la vez, usa `LinkedHashSet` en vez de combinar las dos estructuras a mano. **Práctica:** modifica `ColeccionesDemo.java` para usar `getOrDefault("RF-999", "SIN_REGISTRO")` en vez de `get`, y confirma que ya no se produce `NullPointerException`.

### Tema 2: Genéricos, wildcards y type erasure

**Duración estimada:** 40 min.
**¿Por qué es importante?** Los genéricos hacen que el compilador detecte mezclas de tipos antes de ejecutar; los wildcards dejan aceptar familias de tipos sin perder esa seguridad.
**Prerrequisitos:** M2 T1. Proyecto continuo: construir herramientas reutilizables para almacenar y procesar guías de distintos tipos.

**Mapa de subtemas críticos:** parámetro de tipo e inferencia del diamante (núcleo, 2.1); invariancia y lectura mediante `? extends` (prerrequisito y núcleo, 2.2); escritura mediante `? super` y límite de lectura (variante, 2.3); borrado de tipos, prueba con `instanceof` y riesgo de tipos raw (límite y diagnóstico, 2.4). Cada mecanismo tiene un resultado compilado o un error reproducible y una práctica de transferencia.

#### Subtema 2.1: Crea una clase genérica segura · 10 min

**1. Contexto**
El motor puede guardar una guía o su peso temporalmente sin copiar una clase contenedora para cada tipo.

**2. Hazlo tú**
Crea java-motor-colecciones/src/GenericosDemo.java:

```java
final class Caja<T> {
    private final T contenido;

    Caja(T contenido) { this.contenido = contenido; }

    T obtener() { return contenido; }
}

public class GenericosDemo {
    public static void main(String[] args) {
        Caja<String> guia = new Caja<>("RF-401");
        Caja<Integer> peso = new Caja<>(12);
        System.out.println(guia.obtener());
        System.out.println(peso.obtener() + " kg");
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
mkdir -p out
javac -d out src/GenericosDemo.java
java -cp out GenericosDemo
```

**Resultado esperado:** RF-401 y 12 kg.

**Fallo deliberado:** cambia el argumento new Caja<>("RF-401") por new Caja<>(12) y deja la variable como Caja<String>. **Error esperado:** incompatible types o inference variable T has incompatible bounds. **Diagnóstico:** una Caja<String> solo puede contener texto; conserva el tipo de la variable y el del valor alineados.

**3. Entiende**
`T` es un parámetro de tipo. Al escribir `Caja<String>`, el compilador comprueba que obtienes y guardas texto sin casts. El diamante `<>` de `new Caja<>(...)` infiere aquí `String` desde el tipo declarado de `guia`; no crea una clase nueva llamada `Caja<String>` en ejecución. Por eso `new Caja<>(12)` no puede satisfacer una variable `Caja<String>`.

**4. Cierra**
Agrega una Caja<Double> para una tarifa y explica qué verifica el compilador.

#### Subtema 2.2: Lee una familia de tipos con extends · 10 min

**1. Contexto**
Un reporte de peso acepta valores enteros o decimales; el método no necesita conocer qué tipo exacto de Number recibe.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/GenericosDemo.java:

```java
import java.util.List;

public class GenericosDemo {
    static double sumarPesos(List<? extends Number> pesos) {
        double total = 0;
        for (Number peso : pesos) {
            total += peso.doubleValue();
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sumarPesos(List.of(2, 3, 4)));
        System.out.println(sumarPesos(List.of(1.5, 2.5)));
    }
}
```

Compila y ejecuta con los comandos del subtema 2.1.

**Resultado esperado:** 9.0 y 4.0.

**Fallo deliberado:** dentro del ciclo, intenta pesos.add(5). **Error esperado:** el compilador rechaza el argumento porque no conoce el subtipo concreto de la lista. **Diagnóstico:** ? extends Number permite leer elementos como Number; no agregar valores arbitrarios.

**3. Entiende**
Una `List<Integer>` no es una `List<Number>`: si esa asignación se permitiera, otra parte del programa podría agregar un `Double` a la lista de enteros. Compruébalo en una copia del archivo: declara `List<Integer> enteros = List.of(2, 3);` y luego `List<Number> numeros = enteros;`; `javac` rechaza la segunda línea por tipos incompatibles. El comodín `? extends Number` permite recibir la lista sin prometer que se le puedan agregar números de cualquier subtipo. Como `sumarPesos` solo lee, puede tratar cada valor como `Number`. El límite no convierte los enteros en otro tipo ni copia la lista.

**4. Cierra**
Prueba una lista de `Long` y explica por qué el método no requiere una nueva sobrecarga. Predice además si `List<Number> numeros = List.of(1, 2);` y `List<Number> numeros = enteros;` tienen la misma validez; compila ambos casos para comprobarlo.

#### Subtema 2.3: Escribe con super y conserva seguridad · 10 min

**1. Contexto**
El motor genera códigos enteros para agregarlos a una colección que puede guardar Integer o alguno de sus tipos base.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/GenericosDemo.java:

```java
import java.util.ArrayList;
import java.util.List;

public class GenericosDemo {
    static void agregarCodigos(List<? super Integer> destino) {
        destino.add(401);
        destino.add(402);
    }

    public static void main(String[] args) {
        List<Integer> codigos = new ArrayList<>();
        List<Number> numeros = new ArrayList<>();
        agregarCodigos(codigos);
        agregarCodigos(numeros);
        System.out.println(codigos);
        System.out.println(numeros);
    }
}
```

Compila y ejecuta con los comandos del subtema 2.1.

**Resultado esperado:** [401, 402] en ambas líneas.

**Fallo deliberado:** deja la firma intacta y añade en `main` `List<Double> decimales = new ArrayList<>(); agregarCodigos(decimales);`. **Error esperado:** `List<Double>` no se puede convertir a `List<? super Integer>`. **Diagnóstico:** el límite acepta `Integer` o un supertipo suyo, como `Number` u `Object`; `Double` es otro subtipo de `Number`, no un supertipo de `Integer`.

**3. Entiende**
`? super Integer` permite agregar `Integer` con seguridad. Dentro de `agregarCodigos`, una lectura de `destino.get(0)` solo se puede asignar a `Object`: la lista real podría ser `List<Integer>`, `List<Number>` o `List<Object>`, y el compilador no sabe cuál. Este límite sirve cuando el método produce enteros para un destino; no convierte una `List<Double>` en una lista de enteros.

**4. Cierra**
Escribe qué tipo de lista es válido para el parámetro y por qué no acepta List<Double>.

#### Subtema 2.4: Observa qué conserva type erasure · 10 min

**1. Contexto**
En ejecución, las variantes parametrizadas de Caja comparten la misma clase. Reconoce esta limitación antes de diseñar lógica que dependa de inspeccionar el tipo T.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/GenericosDemo.java:

```java
final class Caja<T> {
    private final T contenido;
    Caja(T contenido) { this.contenido = contenido; }
    T obtener() { return contenido; }
}

public class GenericosDemo {
    public static void main(String[] args) {
        Caja<String> texto = new Caja<>("RF-401");
        Caja<Integer> numero = new Caja<>(401);
        System.out.println(texto.getClass() == numero.getClass());
        System.out.println(texto.obtener().getClass().getSimpleName());
        System.out.println(numero.obtener().getClass().getSimpleName());
    }
}
```

Compila y ejecuta con los comandos del subtema 2.1.

**Resultado esperado:** true, String y Integer.

**Fallo deliberado:** declara `Object desconocido = texto;` e intenta `System.out.println(desconocido instanceof Caja<String>);`. **Error esperado:** el compilador rechaza la prueba de un tipo parametrizado no reificable. **Diagnóstico:** desde una referencia `Object` no se puede comprobar en ejecución si la caja era `Caja<String>`; usa `desconocido instanceof Caja<?>` y valida el contenido por separado si hace falta. La expresión `texto instanceof Caja<String>` sí puede compilar porque el tipo estático de `texto` ya es `Caja<String>`; no demuestra que la JVM haya conservado `String`.

**3. Entiende**
El borrado de tipos hace que Caja<String> y Caja<Integer> compartan la clase Caja en ejecución. Java mantiene cierta información genérica en firmas declaradas para herramientas de reflexión, pero no puedes inspeccionar el parámetro de tipo de un objeto común como si fuera una clase distinta.

Para observar el riesgo profesional del borrado, agrega antes del cierre de `main` estas tres líneas, sin quitar las salidas anteriores:

```java
Caja sinTipo = numero;
Caja<String> contaminada = sinTipo;
System.out.println(contaminada.obtener().length());
```

Compila desde `java-motor-colecciones/` con `javac -Xlint:unchecked -d out src/GenericosDemo.java` y ejecuta `java -cp out GenericosDemo`. **Resultado observable:** el compilador avisa de una conversión `unchecked` en la asignación a `Caja<String>`; tras las tres salidas iniciales, la llamada a `length()` falla con `ClassCastException` porque el contenido era un `Integer`. Un tipo raw evita la comprobación genérica en el límite y desplaza el fallo a quien lee. **Límite:** `@SuppressWarnings` ocultaría el aviso, no volvería segura la conversión. Restaura el archivo original después del diagnóstico.

**4. Cierra**
Entrega las tres líneas de salida y explica qué dato sí conserva el objeto, y qué parámetro genérico no se puede probar con `instanceof`. Después de reproducir el fallo raw, cambia `Caja sinTipo` por `Caja<?> sinTipo` y predice qué asignación dejará de compilar; compruébalo antes de restaurar el archivo.

**Hito del tema:**

- [ ] Construí Caja<T> y el compilador rechazó un valor de tipo equivocado.
- [ ] Leí números de List<? extends Number>.
- [ ] Agregué enteros a List<? super Integer> sin perder seguridad de tipos.
- [ ] Comprobé que dos variantes de Caja comparten la clase en runtime.
- [ ] Reproduje una advertencia `unchecked` y su `ClassCastException` posterior al mezclar un tipo raw con uno parametrizado.

**Fuentes oficiales:** [genéricos en dev.java](https://dev.java/learn/generics/), [wildcards](https://dev.java/learn/generics/wildcards/), [tipos raw y advertencias unchecked](https://docs.oracle.com/javase/tutorial/java/generics/rawTypes.html) y [borrado de tipos en la especificación Java](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6).

**Transferencia al proyecto integrador:** implementa un repositorio genérico que use tipos concretos seguros y consulta con wildcards cuando el consumidor solo necesite leer o agregar datos. **Práctica:** agrega un segundo tipo de parámetro a `Caja<T>` (por ejemplo una etiqueta `Caja<T, E>`) y confirma con `instanceof Caja<?, ?>` que ambos parámetros siguen borrados en tiempo de ejecución.

### Tema 3: Comparable vs Comparator, e iteración

**Duración estimada:** 35 min.
**¿Por qué es importante?** El orden natural sirve cuando una clase tiene un criterio principal; un Comparator permite cambiarlo para una vista concreta. La iteración permite procesar colecciones sin depender de su implementación.
**Prerrequisitos:** M2 T1 (colecciones) y M1 T3 (interfaces). Proyecto continuo: ordenar guías por código o destino y retirar entregas completadas con seguridad.

**Mapa de subtemas críticos:** `Comparable` y el criterio de equivalencia por código (núcleo, subtema 3.1); `Comparator` externo, desempate y estabilidad del resultado (variante y límite, subtema 3.2); recorrido de `entrySet`, contrato de `Iterator.remove` y modificación estructural indebida (núcleo y diagnóstico, subtema 3.3). Cada bloque muestra una salida, un fallo comprobable y una transferencia distinta.

#### Subtema 3.1: Define el orden natural con Comparable · 10 min

**1. Contexto**
Cuando el motor muestre sus guías, el orden estable por código ayuda a localizar una entrada repetidamente.

**2. Hazlo tú**
Crea java-motor-colecciones/src/OrdenDemo.java:

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;

class Guia implements Comparable<Guia> {
    private final String codigo;

    Guia(String codigo) { this.codigo = codigo; }
    String codigo() { return codigo; }

    @Override
    public int compareTo(Guia otra) {
        return codigo.compareTo(otra.codigo);
    }

    @Override
    public String toString() { return codigo; }
}

public class OrdenDemo {
    public static void main(String[] args) {
        List<Guia> guias = new ArrayList<>(List.of(
            new Guia("RF-103"), new Guia("RF-101"), new Guia("RF-102")));
        Collections.sort(guias);
        System.out.println(guias);
        TreeSet<Guia> unicasPorCodigo = new TreeSet<>(guias);
        System.out.println("agrega mismo codigo=" + unicasPorCodigo.add(new Guia("RF-101")));
        System.out.println("codigos distintos=" + unicasPorCodigo.size());
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
mkdir -p out
javac -d out src/OrdenDemo.java
java -cp out OrdenDemo
```

**Resultado esperado:** [RF-101, RF-102, RF-103], agrega mismo codigo=false y codigos distintos=3.

**Fallo deliberado:** elimina implements Comparable<Guia> y la anotación @Override de compareTo; luego ejecuta Collections.sort(guias). **Error esperado:** el compilador no puede inferir un orden para Guia. **Diagnóstico:** el orden natural requiere que Guia implemente Comparable o que la llamada reciba un Comparator.

**3. Entiende**
`compareTo` devuelve un valor negativo, cero o positivo para indicar menor, igual o mayor. Debe ser coherente al invertir los operandos y transitivo: si `RF-101 < RF-102` y `RF-102 < RF-103`, también `RF-101 < RF-103`. Comparar `String` directamente da ese orden y evita el desbordamiento de restar enteros. En `TreeSet`, `compareTo` igual a cero significa que el segundo objeto ocupa la misma posición lógica y no se agrega, aunque sea otra instancia. Aquí dos guías con código `RF-101` cuentan como una. Esta clase didáctica aún hereda `equals` por identidad: un `HashSet` trataría esas dos instancias como distintas. No uses esta clase tal cual como modelo de dominio; antes de combinar conjuntos ordenados y conjuntos basados en hash, alinea `compareTo`, `equals` y `hashCode` con la misma identidad de guía. El contrato completo de igualdad se desarrolla en el módulo 22.

**4. Cierra**
Cambia los valores de entrada y confirma que el orden natural sigue comparando por código. Comprueba con tres instancias las relaciones `RF-101 < RF-102`, `RF-102 < RF-103` y `RF-101 < RF-103`; luego agrega una segunda instancia con código `RF-102` al `TreeSet` y predice el valor de `add` y el tamaño final antes de ejecutar.

#### Subtema 3.2: Cambia el criterio con Comparator · 10 min

**1. Contexto**
Una pantalla de despacho puede necesitar ordenar por destino sin reemplazar el orden natural de la clase.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/OrdenDemo.java por este archivo completo:

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Guia {
    private final String codigo;
    private final String destino;

    Guia(String codigo, String destino) {
        this.codigo = codigo;
        this.destino = destino;
    }

    String codigo() { return codigo; }
    String destino() { return destino; }

    @Override
    public String toString() {
        return "Guia[codigo=" + codigo + ", destino=" + destino + "]";
    }
}

class PorDestinoYCodigo implements Comparator<Guia> {
    @Override
    public int compare(Guia primera, Guia segunda) {
        int destino = primera.destino().compareTo(segunda.destino());
        if (destino != 0) return destino;
        return primera.codigo().compareTo(segunda.codigo());
    }
}

public class OrdenDemo {
    public static void main(String[] args) {
        List<Guia> guias = new ArrayList<>(List.of(
            new Guia("RF-103", "Cali"),
            new Guia("RF-101", "Bogota"),
            new Guia("RF-102", "Bogota")));

        guias.sort(new PorDestinoYCodigo());
        for (Guia guia : guias) {
            System.out.println(guia);
        }
    }
}
```

Compila y ejecuta con los comandos del subtema 3.1.

**Resultado esperado:** Guia[codigo=RF-101, destino=Bogota], Guia[codigo=RF-102, destino=Bogota] y Guia[codigo=RF-103, destino=Cali].

**Fallo deliberado:** elimina las dos líneas que comparan `codigo` y devuelve `0` cuando los destinos coinciden; coloca `RF-102` antes de `RF-101` en la entrada. **Resultado observado:** ambas guías de Bogota conservan ese orden de entrada en esta ordenación estable, en vez de ordenarse por código. **Diagnóstico:** el comparador ya no distingue los códigos de un mismo destino; restaura el segundo criterio. Si usas ese comparador en un `TreeSet`, los dos códigos pasarían a considerarse equivalentes y solo se conservaría uno.

**3. Entiende**
`Comparator<Guia>` define un criterio externo al objeto. Su método `compare` recibe dos guías: primero compara destinos; solo si son iguales compara códigos. Así obtiene un orden total para este ejemplo sin cambiar la clase `Guia` ni depender de lambdas o referencias a métodos, que se estudian más adelante. Un resultado `0` debe reservarse para guías que este criterio considere equivalentes. `List.sort` conserva el orden previo de elementos que el comparador considera iguales, pero `TreeSet` conservaría solo uno de ellos. Los campos usados para ordenar deben conservar su valor mientras el objeto permanezca en una colección ordenada. Si `destino` es `null`, `String.compareTo` lanza `NullPointerException`: valida ese dato en el constructor antes de ordenar guías reales.

**4. Cierra**
Cambia solo la comparación del destino a `segunda.destino().compareTo(primera.destino())`; predice qué ciudad aparecerá primero y comprueba que los códigos dentro de Bogota siguen ascendentes. Explica por qué no conviene restar números para implementar `compare`.

#### Subtema 3.3: Recorre entradas y elimina con Iterator · 15 min

**1. Contexto**
El proceso de cierre debe recorrer estados de guías y quitar las entregas ya completadas sin modificar una colección a escondidas durante un for-each.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/OrdenDemo.java:

```java
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

public class OrdenDemo {
    public static void main(String[] args) {
        Map<String, String> estados = new LinkedHashMap<>();
        estados.put("RF-101", new String("ENTREGADA"));
        estados.put("RF-102", "EN_RUTA");

        Iterator<Map.Entry<String, String>> iterador =
            estados.entrySet().iterator();
        while (iterador.hasNext()) {
            Map.Entry<String, String> entrada = iterador.next();
            if (entrada.getValue().equals("ENTREGADA")) {
                iterador.remove();
            }
        }

        for (Map.Entry<String, String> entrada : estados.entrySet()) {
            System.out.println(entrada.getKey() + "=" + entrada.getValue());
        }
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
javac -d out src/OrdenDemo.java
java -cp out OrdenDemo
```

**Resultado esperado:** RF-102=EN_RUTA.

**Fallo deliberado:** reemplaza `iterador.remove()` por `estados.remove(entrada.getKey())` y deja el resto del ciclo intacto. **Error esperado en este `LinkedHashMap`:** al pedir el siguiente elemento aparece `ConcurrentModificationException`. **Diagnóstico:** se modificó estructuralmente el mapa fuera del iterador que lo recorre; restaura `iterador.remove()`. La detección de modificaciones concurrentes es un mecanismo de diagnóstico de mejor esfuerzo, no una estrategia para controlar concurrencia.

**3. Entiende**
`entrySet` entrega pares clave-valor para recorrer el `Map`. `hasNext` consulta si queda una entrada y `next` avanza a ella; `remove` quita exactamente la última entrada entregada por `next`, y no se puede llamar dos veces seguidas sin otro `next`. No llames `estados.remove` desde el mismo recorrido. La comparación del estado usa `equals` para leer contenido: el `new String("ENTREGADA")` del ejemplo impide que una comparación accidental con `==` parezca funcionar por compartir una instancia.

**4. Cierra**
Guarda el mapa antes y después, e identifica la entrada que quitó el iterador. Añade una segunda guía entregada, predice cuáles permanecen y compruébalo; luego intenta llamar `iterador.remove()` dos veces consecutivas e identifica la excepción.

**Hito del tema:**

- [ ] Ordené Guia por su criterio natural con Comparable.
- [ ] Creé un orden alternativo por destino y un desempate con Comparator.
- [ ] Recorrí pares de un Map mediante entrySet.
- [ ] Eliminé la entrada actual con `Iterator.remove` y reproduje el fallo al modificar el mapa directamente durante el recorrido.

**Fuentes oficiales:** [Collections Framework en dev.java](https://dev.java/learn/api/collections-framework/), [ordenación estable de listas](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)), [contrato Comparable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html), [contrato de Iterator.remove](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html#remove()) y [límites de fail-fast en LinkedHashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html).

**Transferencia al proyecto integrador:** ordena las guías por el criterio natural acordado, agrega vistas alternativas con Comparator y elimina del registro entradas completadas durante su recorrido seguro. **Límite:** implementa `Comparable` solo cuando la clase tiene un único orden natural y obvio (por ejemplo el código de guía); si necesitas varios criterios de orden distintos según la pantalla o el reporte, usa `Comparator` externos en vez de forzar varios "órdenes naturales" en la misma clase.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** organizar guías por posición, eliminar duplicados, buscar por clave, ordenar entregas y conservar seguridad de tipos.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Organizar guías con `List`, `Set` y `Map` | Ver Tema 1 | Conserva orden, deduplica y consulta estados |
| 2 | Crear `Caja<T>` y procesar wildcards | Ver Tema 2 | Verifica tipos, límites `extends` y `super` |
| 3 | Ordenar por código y destino | Ver Tema 3 | Compara orden natural y criterio alternativo |
| 4 | Recorrer entradas y eliminar con `Iterator` | Ver Tema 3 | Evita modificar el mapa fuera del iterador |

**Verificación:** el laboratorio se considera exitoso si las colecciones producen las salidas esperadas, el compilador rechaza un tipo incorrecto y el orden alternativo conserva la clase sin cambios.

### Incremento del proyecto: preparar guías asignables

Conserva `java-motor-poo/src/modelo/Guia.java` del M1 T4.3: el proyecto ya tiene una clase `Guia` con constructor público y método `numero()`. Los archivos `java-motor-colecciones/` de este módulo son experimentos aislados; ahora aplica sus decisiones al motor que empezaste en M1. Crea `java-motor-poo/src/MotorAsignacion.java` con este contenido completo:

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import modelo.Guia;

public class MotorAsignacion {
    static class PorNumero implements Comparator<Guia> {
        @Override
        public int compare(Guia primera, Guia segunda) {
            return primera.numero().compareTo(segunda.numero());
        }
    }

    public static void main(String[] args) {
        List<Guia> recibidas = List.of(
            new Guia("RF-103"), new Guia("RF-101"),
            new Guia("RF-102"), new Guia("RF-101"));
        Map<String, Guia> unicas = new LinkedHashMap<>();
        Set<String> duplicadas = new LinkedHashSet<>();

        for (Guia guia : recibidas) {
            if (unicas.containsKey(guia.numero())) {
                duplicadas.add(guia.numero());
            } else {
                unicas.put(guia.numero(), guia);
            }
        }

        Iterator<Map.Entry<String, Guia>> iterador =
            unicas.entrySet().iterator();
        while (iterador.hasNext()) {
            if (iterador.next().getKey().equals("RF-103")) {
                iterador.remove(); // cancelación conocida antes de asignar
            }
        }

        List<Guia> asignables = new ArrayList<>(unicas.values());
        asignables.sort(new PorNumero());
        System.out.println("duplicadas=" + duplicadas);
        for (Guia guia : asignables) {
            System.out.println("asignable=" + guia.numero());
        }
    }
}
```

Desde `java-motor-poo/` ejecuta:

```bash
mkdir -p out
javac -d out src/modelo/Guia.java src/MotorAsignacion.java
java -cp out MotorAsignacion
```

**Resultado esperado:** `duplicadas=[RF-101]`, `asignable=RF-101` y `asignable=RF-102`, en tres líneas. La clave `String` evita depender del `equals` aún no definido para objetos `Guia`; `LinkedHashMap` conserva la primera instancia de cada código y `PorNumero` ordena la vista asignable. La lista `recibidas` no se modifica. **Fallo diagnosticado:** reemplaza `iterador.remove()` por `unicas.remove("RF-103")`; en esta ejecución, el siguiente avance del iterador lanza `ConcurrentModificationException`. Restaura la eliminación mediante el iterador. **Práctica de transferencia:** agrega `RF-104` dos veces y cambia el código cancelado a `RF-102`; predice la lista de duplicadas y el orden asignable, ejecuta y explica por qué el resultado no depende de la identidad de cada objeto `Guia`.

**Errores comunes y soluciones**

- **Elegir `LinkedList` solo porque “insertar es rápido”.** Insertar cerca del inicio o de un iterador puede evitar desplazamientos; encontrar una posición arbitraria todavía requiere recorrer la lista.
- **Asumir orden en un `HashSet`.** Usa `TreeSet` o `LinkedHashSet` si el orden importa.
- **Confundir cuándo usar `Comparable` frente a `Comparator`.** Usa `Comparable` para el único orden natural de la clase; `Comparator` para órdenes alternativos externos.

---
