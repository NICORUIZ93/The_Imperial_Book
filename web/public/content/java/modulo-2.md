# Módulo 2: Colecciones y genéricos


## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones

**Duración estimada:** 35 min.
**¿Por qué es importante?** Una colección organiza datos según cómo los vas a consultar: por posición, sin duplicados o mediante una clave.
**Prerrequisitos:** M1 T1. Proyecto continuo: guardar guías, evitar duplicados y buscar cada guía por su código.

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
Al importar un lote pueden llegar guías repetidas. Una colección Set mantiene solo un ejemplar según equals y hashCode.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/ColeccionesDemo.java:

```java
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.TreeSet;

public class ColeccionesDemo {
    public static void main(String[] args) {
        Set<String> ingreso = new LinkedHashSet<>();
        ingreso.add("RF-102");
        ingreso.add("RF-101");
        ingreso.add("RF-102");

        Set<String> ordenadas = new TreeSet<>(ingreso);
        System.out.println("ingreso=" + ingreso);
        System.out.println("ordenadas=" + ordenadas);
        System.out.println("nuevas=" + ingreso.add("RF-101"));
    }
}
```

Compila y ejecuta con los comandos del subtema 1.1.

**Resultado esperado:** ingreso=[RF-102, RF-101], ordenadas=[RF-101, RF-102] y nuevas=false.

**Fallo deliberado:** reemplaza LinkedHashSet por HashSet y exige como salida fija el orden RF-102, RF-101. **Resultado no garantizado:** el orden puede variar. **Diagnóstico:** HashSet no promete orden de iteración; usa LinkedHashSet para conservar inserción o TreeSet para ordenar.

**3. Entiende**
Set impide duplicados de acuerdo con la igualdad de sus elementos. LinkedHashSet conserva el orden de inserción; TreeSet itera en orden natural o según un Comparator.

**4. Cierra**
Explica cuál colección usarías para deduplicar sin cambiar el orden del archivo importado y cuál para mostrar los códigos ordenados.

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
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
javac -d out src/ColeccionesDemo.java
java -cp out ColeccionesDemo
```

**Resultado esperado:** EN_REPARTO, DESCONOCIDA y guias=2.

**Fallo deliberado:** cambia la segunda búsqueda por estados.get("RF-999").toUpperCase(). **Error esperado:** NullPointerException. **Diagnóstico:** get devuelve null si la clave no existe; comprueba el resultado o usa getOrDefault.

**3. Entiende**
Map relaciona una clave única con su valor. Al insertar otra vez RF-101, se reemplazó su estado y no se añadió una tercera entrada. LinkedHashMap conserva el orden de inserción; HashMap no lo garantiza.

**4. Cierra**
Agrega la guía RF-999, conserva la salida y explica qué significa que una clave no exista.

**Hito del tema:**

- [ ] Usé List para conservar posiciones y repetir valores.
- [ ] Eliminé duplicados y diferencié orden de inserción de orden natural.
- [ ] Consulté y actualicé un estado con una clave de Map.
- [ ] Manejé una clave ausente sin provocar un error accidental.

**Fuentes oficiales:** [Collections Framework en dev.java](https://dev.java/learn/api/collections-framework/) y [interfaces de colecciones de Java](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html).

**Transferencia al proyecto integrador:** almacena guías en una lista ordenada, usa un Set para rechazar importaciones duplicadas y conserva el estado actual en un Map por código. **Límite:** usa `ArrayList` cuando el orden de llegada importa y habrá lecturas frecuentes por índice; usa `HashSet` solo para descartar duplicados sin importar el orden; si necesitas orden de inserción y descarte de duplicados a la vez, usa `LinkedHashSet` en vez de combinar las dos estructuras a mano. **Práctica:** modifica `ColeccionesDemo.java` para usar `getOrDefault("RF-999", "SIN_REGISTRO")` en vez de `get`, y confirma que ya no se produce `NullPointerException`.

### Tema 2: Genéricos, wildcards y type erasure

**Duración estimada:** 40 min.
**¿Por qué es importante?** Los genéricos hacen que el compilador detecte mezclas de tipos antes de ejecutar; los wildcards dejan aceptar familias de tipos sin perder esa seguridad.
**Prerrequisitos:** M2 T1. Proyecto continuo: construir herramientas reutilizables para almacenar y procesar guías de distintos tipos.

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
T es un parámetro de tipo. Al escribir Caja<String>, el compilador comprueba que obtienes y guardas texto sin casts.

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
El límite extends Number acepta listas de Number y de sus subtipos. Como el método solo lee esos valores, los trata como Number de forma segura.

**4. Cierra**
Prueba una lista de Long y explica por qué el método no requiere una nueva sobrecarga.

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

**Fallo deliberado:** cambia el parámetro a List<? super String> y llama agregarCodigos con List<Integer>. **Error esperado:** incompatible types. **Diagnóstico:** el límite de super Integer acepta Integer o un supertipo suyo, como Number u Object; String no pertenece a esa familia.

**3. Entiende**
? super Integer permite agregar Integer con seguridad. Cuando lees elementos de esa lista, el tipo útil común es Object; el wildcard se elige según si el método principalmente lee o agrega.

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

**Fallo deliberado:** intenta escribir texto instanceof Caja<String>. **Error esperado:** el compilador indica que no puede comprobar una instancia parametrizada de ese modo. **Diagnóstico:** la clase concreta no conserva String o Integer como una distinción de runtime para esa prueba; usa instanceof Caja<?> y valida el contenido si hace falta.

**3. Entiende**
El borrado de tipos hace que Caja<String> y Caja<Integer> compartan la clase Caja en ejecución. Java mantiene cierta información genérica en firmas declaradas para herramientas de reflexión, pero no puedes inspeccionar el parámetro de tipo de un objeto común como si fuera una clase distinta.

**4. Cierra**
Entrega las tres líneas de salida y explica qué dato sí conserva el objeto, y qué parámetro genérico no se puede probar con instanceof.

**Hito del tema:**

- [ ] Construí Caja<T> y el compilador rechazó un valor de tipo equivocado.
- [ ] Leí números de List<? extends Number>.
- [ ] Agregué enteros a List<? super Integer> sin perder seguridad de tipos.
- [ ] Comprobé que dos variantes de Caja comparten la clase en runtime.

**Fuentes oficiales:** [genéricos en dev.java](https://dev.java/learn/generics/) y [genéricos en la especificación del lenguaje Java](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6).

**Transferencia al proyecto integrador:** implementa un repositorio genérico que use tipos concretos seguros y consulta con wildcards cuando el consumidor solo necesite leer o agregar datos. **Práctica:** agrega un segundo tipo de parámetro a `Caja<T>` (por ejemplo una etiqueta `Caja<T, E>`) y confirma con `instanceof Caja<?, ?>` que ambos parámetros siguen borrados en tiempo de ejecución.

### Tema 3: Comparable vs Comparator, e iteración

**Duración estimada:** 35 min.
**¿Por qué es importante?** El orden natural sirve cuando una clase tiene un criterio principal; un Comparator permite cambiarlo para una vista concreta. La iteración permite procesar colecciones sin depender de su implementación.
**Prerrequisitos:** M2 T1 y M1 T2. Proyecto continuo: ordenar guías por código o destino y retirar entregas completadas con seguridad.

#### Subtema 3.1: Define el orden natural con Comparable · 10 min

**1. Contexto**
Cuando el motor muestre sus guías, el orden estable por código ayuda a localizar una entrada repetidamente.

**2. Hazlo tú**
Crea java-motor-colecciones/src/OrdenDemo.java:

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
mkdir -p out
javac -d out src/OrdenDemo.java
java -cp out OrdenDemo
```

**Resultado esperado:** [RF-101, RF-102, RF-103].

**Fallo deliberado:** elimina implements Comparable<Guia> y la anotación @Override de compareTo; luego ejecuta Collections.sort(guias). **Error esperado:** el compilador no puede inferir un orden para Guia. **Diagnóstico:** el orden natural requiere que Guia implemente Comparable o que la llamada reciba un Comparator.

**3. Entiende**
compareTo devuelve un valor negativo, cero o positivo para indicar menor, igual o mayor. Comparar Strings directamente evita restar números y no tiene el riesgo de desbordamiento de restar enteros.

**4. Cierra**
Cambia los valores de entrada y confirma que el orden natural sigue comparando por código.

#### Subtema 3.2: Cambia el criterio con Comparator · 10 min

**1. Contexto**
Una pantalla de despacho puede necesitar ordenar por destino sin reemplazar el orden natural de la clase.

**2. Hazlo tú**
Reemplaza java-motor-colecciones/src/OrdenDemo.java por este archivo completo:

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

record Guia(String codigo, String destino) { }

public class OrdenDemo {
    public static void main(String[] args) {
        List<Guia> guias = new ArrayList<>(List.of(
            new Guia("RF-103", "Cali"),
            new Guia("RF-101", "Bogota"),
            new Guia("RF-102", "Bogota")));

        guias.sort(Comparator.comparing(Guia::destino)
                             .thenComparing(Guia::codigo));
        guias.forEach(System.out::println);
    }
}
```

Compila y ejecuta con los comandos del subtema 3.1.

**Resultado esperado:** Guia[codigo=RF-101, destino=Bogota], Guia[codigo=RF-102, destino=Bogota] y Guia[codigo=RF-103, destino=Cali].

**Fallo deliberado:** elimina thenComparing y cambia el orden de entrada para poner RF-102 antes que RF-101, aunque ambos tengan el mismo destino. **Resultado observado:** ese orden de entrada se conserva porque el comparator no desempata por código. **Diagnóstico:** si quieres una salida estable por código independientemente del orden inicial, agrega una segunda clave.

**3. Entiende**
Comparator define un criterio externo al objeto. comparing elige el destino y thenComparing completa el desempate por código; la clase no necesita cambiar su orden natural.

**4. Cierra**
Agrega un criterio por destino invertido y explica qué parte del orden cambió.

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

        estados.forEach((codigo, estado) ->
            System.out.println(codigo + "=" + estado));
    }
}
```

Desde java-motor-colecciones/, compila y ejecuta:

```bash
javac -d out src/OrdenDemo.java
java -cp out OrdenDemo
```

**Resultado esperado:** RF-102=EN_RUTA.

**Fallo deliberado:** cambia equals por ==. **Resultado erróneo esperado:** también aparece RF-101=ENTREGADA. **Diagnóstico:** == compara si son la misma instancia String, no si contienen el mismo texto; usa equals para comparar estados.

**3. Entiende**
entrySet entrega pares clave-valor para recorrer el Map. Iterator permite quitar el elemento actual mediante su método remove; no llames estados.remove desde el mismo ciclo. Para comparar texto, equals evalúa el contenido.

**4. Cierra**
Guarda el mapa antes y después, e identifica la entrada que quitó el iterador.

**Hito del tema:**

- [ ] Ordené Guia por su criterio natural con Comparable.
- [ ] Creé un orden alternativo por destino y un desempate con Comparator.
- [ ] Recorrí pares de un Map mediante entrySet.
- [ ] Eliminé la entrada actual con Iterator y corregí una comparación de String con ==.

**Fuentes oficiales:** [Collections Framework en dev.java](https://dev.java/learn/api/collections-framework/), [ordenación de colecciones](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)) y [contrato Comparable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Comparable.html).

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

**Errores comunes y soluciones**

- **Elegir `LinkedList` solo porque “insertar es rápido”.** Insertar cerca del inicio o de un iterador puede evitar desplazamientos; encontrar una posición arbitraria todavía requiere recorrer la lista.
- **Asumir orden en un `HashSet`.** Usa `TreeSet` o `LinkedHashSet` si el orden importa.
- **Confundir cuándo usar `Comparable` frente a `Comparator`.** Usa `Comparable` para el único orden natural de la clase; `Comparator` para órdenes alternativos externos.

---
