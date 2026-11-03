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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escribir una clase genérica propia (`Caja<T>`) y explicar por qué su información de tipo desaparece en tiempo de ejecución. Prerrequisitos: JDK 25 y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un almacén temporal necesita guardar y devolver un valor de cualquier tipo (una guía, un paquete, un conductor) sin duplicar la misma clase contenedora para cada tipo distinto, y sin perder verificación de tipos en tiempo de compilación.

#### Paso 3 · Teoría, modelo mental y analogía
`<T>` es un parámetro de tipo verificado en compilación; el type erasure borra esa información específica del bytecode final, dejando una única clase compartida en tiempo de ejecución. La analogía: una plantilla de formulario que se ajusta según el tipo de dato durante el llenado, pero el archivo final guardado no conserva ninguna etiqueta indicando para qué tipo fue diseñada.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-genericos-caja
cd ejemplo-genericos-caja
mkdir -p src/main/java/academia/generico
```
Crea `Caja.java` con la clase genérica `Caja<T>` (código en "Código del ejemplo") y una clase `Main` que instancie `Caja<String>` y `Caja<Integer>`, imprimiendo `getClass()` de ambas instancias. Compila y ejecuta:
```bash
javac -d out src/main/java/academia/generico/Caja.java
java -cp out academia.generico.Main
```

#### Paso 5 · Práctica guiada
Pista: intenta guardar un `Integer` en una `Caja<String>` para provocar un fallo deliberado de compilación; el compilador lo rechaza aunque en tiempo de ejecución ambas cajas sean la misma clase `Caja`. Resultado esperado: confirmas que `getClass()` de `Caja<String>` y `Caja<Integer>` imprime el mismo nombre de clase.

#### Paso 6 · Práctica independiente
Escribe un método `mostrarTodos(List<? extends Number> lista)` usando un wildcard, y prueba que acepta tanto `List<Integer>` como `List<Double>` sin necesitar sobrecargas separadas para cada tipo.

#### Paso 7 · Cierre y evidencia
Guarda `Caja`, la prueba de `getClass()` idéntico y el error de compilación provocado; como siguiente paso estudia Comparable y Comparator. Errores comunes: usar raw types (`Caja` sin `<T>`) perdiendo toda verificación de tipos, y asumir que la información genérica está disponible por reflexión en runtime. Fuentes oficiales: https://dev.java/learn/api/collections-framework/ y https://docs.oracle.com/javase/tutorial/java/generics/.
**¿Por qué es importante?** Porque el type erasure explica por qué `Caja<String>` y `Caja<Integer>` son la misma clase en tiempo de ejecución, una limitación real al diseñar APIs que necesiten inspeccionar tipos genéricos por reflexión, y una razón concreta para nunca usar raw types sin darse cuenta de que se pierde toda la verificación de tipos del compilador.
**Evidencia de aprendizaje:** entrega `Caja<T>` genérica, la prueba de que `getClass()` imprime el mismo nombre para `Caja<String>` y `Caja<Integer>`, y el error de compilación al intentar guardar un `Integer` en una `Caja<String>`.
**Conceptos clave:** `<T>`, seguridad de tipos en compilación, borrado de tipos en tiempo de ejecución.

Escribir tipos genéricos propios como `Caja<T>` es la misma técnica que usarás para el repositorio genérico del proyecto integrador de este track.

**Cuándo no usarlo:** si la clase siempre va a contener el mismo tipo concreto y nunca necesitará una segunda variante, hacerla genérica agrega un parámetro de tipo sin beneficio real; resérvalo para cuando genuinamente necesites la misma estructura con más de un tipo de contenido.

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

**¿Por qué es importante?** Los genéricos proporcionan seguridad de tipos en tiempo de compilación sin necesidad de castear manualmente; el type erasure explica por qué esa información de tipo genérico no está disponible para inspección en tiempo de ejecución, una limitación relevante al usar reflexión o al diseñar ciertas APIs genéricas avanzadas.

**Código del ejemplo:**

```java
class Caja<T> {
    private T contenido;
    void guardar(T valor) { this.contenido = valor; }
    T obtener() { return contenido; }
}
Caja<String> cajaTexto = new Caja<>();
// En tiempo de ejecución: type erasure borra <String>, solo queda Caja
```

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
