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
import java.util.List;

public class ColeccionesDemo {
    public static void main(String[] args) {
        List<String> guias = new ArrayList<>();
        guias.add("RF-101");
        guias.add("RF-102");
        guias.add(1, "RF-105");
        System.out.println(guias);
        System.out.println("primera=" + guias.get(0));
    }
}
```

Desde java-motor-colecciones/, ejecuta:

```bash
mkdir -p out
javac -d out src/ColeccionesDemo.java
java -cp out ColeccionesDemo
```

**Resultado esperado:** [RF-101, RF-105, RF-102] y primera=RF-101.

**Fallo deliberado:** cambia guias.get(0) por guias.get(3). **Error esperado:** IndexOutOfBoundsException. **Diagnóstico:** los índices empiezan en cero y esta lista tiene posiciones 0, 1 y 2.

**3. Entiende**
List conserva elementos repetidos y su orden. ArrayList suele ser una buena opción general cuando necesitas acceder por índice o agregar elementos al final; insertar en medio desplaza los siguientes.

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

**Transferencia al proyecto integrador:** almacena guías en una lista ordenada, usa un Set para rechazar importaciones duplicadas y conserva el estado actual en un Map por código.

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

**Transferencia al proyecto integrador:** implementa un repositorio genérico que use tipos concretos seguros y consulta con wildcards cuando el consumidor solo necesite leer o agregar datos.

### Tema 3: Comparable vs Comparator, e iteración

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar el orden natural de una clase con `Comparable` y ofrecer órdenes alternativos con `Comparator`, sin modificar la clase original. Prerrequisitos: JDK 25 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un listado de entregas necesita un orden natural único por antigüedad (`Comparable`) y, además, la posibilidad de reordenarlo puntualmente por destino o por peso sin tocar la clase `Entrega`.

#### Paso 3 · Teoría, modelo mental y analogía
`Comparable` define el único orden natural de una clase implementando `compareTo`; `Comparator` define órdenes alternativos externos sin modificar esa clase. La analogía: el orden oficial de un catálogo (por código de producto) frente a pedirle temporalmente que lo muestre ordenado por precio, sin alterar su orden oficial para nadie más.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-comparable-comparator
cd ejemplo-comparable-comparator
mkdir -p src/main/java/academia/orden
```
Crea `Entrega.java` implementando `Comparable<Entrega>` por antigüedad, y una clase `Main` que ordene una lista primero con `Collections.sort` (orden natural) y luego con `lista.sort(Comparator.comparing(Entrega::getDestino))`. Compila y ejecuta:
```bash
javac -d out src/main/java/academia/orden/Entrega.java
java -cp out academia.orden.Main
```

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente `implements Comparable<Entrega>` para provocar un fallo de compilación al llamar `Collections.sort(lista)` sin `Comparator`; restaura la interfaz y confirma que ambos órdenes (natural y alternativo) coexisten sin conflicto. Resultado esperado: dos salidas ordenadas de forma distinta a partir de la misma lista.

#### Paso 6 · Práctica independiente
Agrega un segundo `Comparator` por peso y encadénalos con `thenComparing`; recorre el resultado con un `Map<String, List<Entrega>>` agrupado por destino usando `entrySet()`.

#### Paso 7 · Cierre y evidencia
Guarda `Entrega`, ambos órdenes obtenidos y el error de compilación provocado; como siguiente paso estudia excepciones. Errores comunes: implementar `compareTo` con una resta de enteros (`this.valor - otro.valor`) que puede desbordar con valores extremos en vez de usar `Integer.compare`, modificar después de insertar el campo por el que un `TreeSet`/`TreeMap` ya ordenó un objeto (corrompe la estructura interna), y definir un `Comparable` inconsistente con `equals` sin documentarlo. Fuentes oficiales: https://dev.java/learn/api/collections-framework/ y https://docs.oracle.com/javase/tutorial/java/generics/.
**¿Por qué es importante?** Porque mezclar el único orden natural de una clase (`Comparable`) con necesidades de orden puntuales y alternativas (`Comparator`) en una sola implementación obliga a modificar la clase original cada vez que alguien necesita un criterio de orden distinto.
**Evidencia de aprendizaje:** entrega `Entrega` con su orden natural por `Comparable`, el orden alternativo por `Comparator.comparing`, y el error de compilación al quitar `implements Comparable<Entrega>` e intentar `Collections.sort` sin `Comparator`.
**Conceptos clave:** orden natural único frente a órdenes alternativos externos, `entrySet()`.

Definir el orden natural de cada entidad del proyecto integrador de este track (por fecha, por antigüedad) con `Comparable`, y reservar `Comparator` para vistas alternativas puntuales, evita mezclar ambas responsabilidades en una sola clase.

**Cuándo no usarlo:** implementar `Comparable` no tiene sentido para una clase que nunca se ordenará (una entidad puramente de referencia); y usar un `Comparator` externo para el único orden que la clase siempre necesitará agrega indirección donde `Comparable` sería más directo.

`Comparable<Persona>` (implementado directamente por la clase `Persona`, definiendo `compareTo`) establece el único orden "natural" de esa clase, apropiado cuando existe una forma canónica y única de ordenar objetos de ese tipo (por ejemplo, ordenar personas por edad como su criterio de orden natural más obvio y común); `Comparator` (una función o clase externa a `Persona`, pasada explícitamente a métodos de ordenamiento como `sort`) permite definir órdenes alternativos adicionales sin modificar la clase original (`personas.sort(Comparator.comparing(Persona::getNombre))`, ordenando por nombre sin tocar la implementación de `compareTo` que ya ordena por edad), apropiado cuando se necesitan múltiples criterios de orden distintos según el contexto específico de cada uso.

Recorrer un `Map` con for-each requiere iterar sobre `entrySet()` (`for (Map.Entry<String, Integer> entrada : edades.entrySet())`), que devuelve una vista del mapa como un conjunto de pares clave-valor, permitiendo acceder tanto a `entrada.getKey()` como a `entrada.getValue()` dentro de una única iteración, en vez de iterar únicamente sobre las claves (`keySet()`) y tener que consultar el valor correspondiente por separado en cada iteración, un patrón menos eficiente que recorrer directamente los pares ya emparejados de `entrySet()`.

**Analogía:** `Comparable` es como la forma oficial y única en que un catálogo ordena sus productos por defecto (por ejemplo, por código de producto); `Comparator` es como poder pedirle al mismo catálogo que, sin modificar su orden oficial, te lo muestre temporalmente ordenado de otra forma alternativa según tu necesidad puntual (por precio, por nombre), sin alterar el orden oficial del catálogo para nadie más.

**¿Por qué es importante?** `Comparable` define el único orden natural de una clase; `Comparator` permite múltiples órdenes alternativos externos sin modificar esa clase, siendo la elección correcta según si se necesita un único criterio canónico o múltiples criterios intercambiables.

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

---


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
