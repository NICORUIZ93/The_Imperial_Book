# Módulo 2: Colecciones y genéricos

Cuando un programa maneja más de unos pocos valores, los arreglos se quedan cortos: tamaño fijo, búsquedas manuales y poca expresividad. La biblioteca de colecciones de Java ofrece estructuras para listas, conjuntos, mapas, colas y pilas; los genéricos permiten usarlas con seguridad de tipos. Este módulo enseña a elegir la estructura correcta y a entender los contratos que la hacen funcionar.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Elegir entre `List`, `Set` y `Map` según el problema |
| 2 | Implementar correctamente `equals` y `hashCode` |
| 3 | Evitar el bug de claves mutables en `HashMap` |
| 4 | Escribir clases y métodos genéricos con wildcards |
| 5 | Ordenar con `Comparable` y `Comparator` |
| 6 | Usar colas, pilas y colas de prioridad |
| 7 | Aplicar colecciones en un pequeño repositorio de guías |

## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones · Intermedio · 40 min

**Caso guía**

Un registro de envíos necesita: (1) mantener orden de llegada, (2) evitar IDs duplicados, (3) buscar estado por código rápido. Una sola colección no resuelve bien los tres casos; necesitas elegir la interfaz e implementación correcta.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **List** | Secuencia ordenada que permite duplicados y acceso posicional (`get(i)`). | Mantener orden de inserción/índice. | Historial, cola simple, orden de llegada. | Usarla para búsquedas por clave en grandes volúmenes (O(n)). |
| **Set** | Colección sin duplicados según `equals/hashCode` (o comparador en sorted sets). | Garantizar unicidad. | IDs únicos, tags, membresía. | Asumir orden en `HashSet`. |
| **Map** | Asociación clave única → valor. | Búsqueda por clave. | Índices, cachés, estado por ID. | Usar clave mutable; asumir orden en `HashMap`. |
| **ArrayList** | `List` respaldada por arreglo redimensionable. | Acceso por índice rápido, append amortizado. | Lista general por defecto. | Muchas inserciones en medio (desplazamiento O(n)). |
| **HashSet/HashMap** | Implementaciones hash: buckets por `hashCode`, confirmación por `equals`. | Operaciones promedio O(1). | Búsqueda/unicidad por clave. | Mal `equals/hashCode`; orden no garantizado. |
| **LinkedHashMap/TreeMap** | `LinkedHashMap` conserva inserción; `TreeMap` ordena por clave (O(log n)). | Cuando importa orden. | LRU simple, reportes ordenados. | Usar `TreeMap` sin necesidad (más costo). |

**Contrato / invariantes / reglas.** Programa contra interfaces (`List/Set/Map`), instancia implementaciones. `Hash*` requiere contrato correcto de `equals/hashCode`. Orden: `ArrayList/LinkedHash*` preservan inserción; `Hash*` no garantiza; `Tree*` ordena. Generics dan seguridad en compilación (type erasure en runtime).

**Modelo mental.** `List` = fila numerada; `Set` = bolsa sin repetidos; `Map` = casillero etiquetado. La implementación es el “mecanismo interno” que define costo y garantías.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

Crea `ColeccionesBasicas.java`:

```java
import java.util.*;

public class ColeccionesBasicas {
    public static void main(String[] args) {
        // List: orden + duplicados
        List<String> llegada = new ArrayList<>();
        llegada.add("ENV-003");
        llegada.add("ENV-001");
        llegada.add("ENV-003");
        System.out.println("List: " + llegada);
        System.out.println("List[0]: " + llegada.get(0));

        // Set: unicidad
        Set<String> idsUnicos = new HashSet<>(llegada);
        System.out.println("Set contiene ENV-003: " + idsUnicos.contains("ENV-003"));
        System.out.println("Set size: " + idsUnicos.size());

        // Map: clave -> valor
        Map<String, String> estadoPorId = new HashMap<>();
        estadoPorId.put("ENV-001", "PENDIENTE");
        estadoPorId.put("ENV-003", "EN_RUTA");
        estadoPorId.put("ENV-001", "ENTREGADO"); // reemplaza
        System.out.println("Estado ENV-001: " + estadoPorId.get("ENV-001"));

        // Implementaciones con orden
        Map<String, Integer> ordenado = new LinkedHashMap<>();
        ordenado.put("b", 2); ordenado.put("a", 1);
        System.out.println("LinkedHashMap: " + ordenado);
        Map<String, Integer> tree = new TreeMap<>(ordenado);
        System.out.println("TreeMap: " + tree);
    }
}
```

**Desglose del código**

- **List/ArrayList**: conserva orden e índices; permite duplicados.
- **Set/HashSet**: elimina duplicados; `contains` es rápido.
- **Map/HashMap**: clave única; `put` sobre misma clave reemplaza valor.
- **LinkedHashMap**: preserva inserción; **TreeMap**: ordena por clave.

**Ejecución y salida real**

```bash
javac ColeccionesBasicas.java
java ColeccionesBasicas
```

Salida (orden de HashSet/HashMap puede variar; LinkedHashMap/TreeMap son deterministas):

```text
List: [ENV-003, ENV-001, ENV-003]
List[0]: ENV-003
Set contiene ENV-003: true
Set size: 2
Estado ENV-001: ENTREGADO
LinkedHashMap: {b=2, a=1}
TreeMap: {a=1, b=2}
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Duplicados en IDs | Usaste `List` donde necesitabas unicidad | Usa `Set` o valida |
| Búsqueda lenta por clave | Recorres `List` | Usa `Map` |
| Orden inesperado | Asumiste orden en `Hash*` | Usa `LinkedHash*` o `Tree*` |
| `NullPointerException` en `TreeMap` con claves null | `TreeMap` no acepta claves null por orden natural | Usa `HashMap` o Comparator que maneje null |

**Verificación rápida**

```bash
javac ColeccionesBasicas.java && java ColeccionesBasicas
```

Confirma: List tiene 3 elementos, Set size 2, Map reemplaza ENV-001, TreeMap ordena por clave.


### Tema 2: El contrato de equals y hashCode · Intermedio · 45 min

**Caso guía**

Dos `Cliente` con mismo DNI deben contarse como el mismo en un `HashSet`. Si `equals/hashCode` están mal, `contains` falla o aparecen duplicados lógicos.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Regla clave | Error común |
|---|---|---|---|---|
| **Contrato de `equals`** | Relación de igualdad lógica: reflexiva, simétrica, transitiva, consistente, `x.equals(null)==false`. | Definir identidad lógica de objetos. | Usa los mismos campos de identidad de negocio. | Usar `==` para campos objeto o comparar campos mutables irrelevantes. |
| **Contrato de `hashCode`** | Entero para bucketizar en estructuras hash. | Permitir búsqueda O(1) promedio en `HashSet/HashMap`. | Si `equals` es true, `hashCode` debe ser igual. | Redefinir `equals` sin `hashCode`. |
| **Relación equals-hashCode** | `equals` true => mismo hash. Hash igual no implica equals. | Consistencia en estructuras hash. | Implementar ambos con los mismos campos. | Usar campos distintos en cada método. |
| **Buckets hash** | `HashMap/HashSet` usan hash para elegir bucket y `equals` para confirmar dentro. | Rendimiento y correctitud. | Claves inmutables respecto a campos hash. | Mutar campo usado en hash mientras está en el mapa. |

**Modelo mental.** `hashCode` elige el cajón; `equals` confirma la ficha exacta dentro del cajón.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

`Cliente.java`:

```java
import java.util.Objects;
public class Cliente {
    private final String dni;
    private final String nombre;
    public Cliente(String dni, String nombre) { this.dni = dni; this.nombre = nombre; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cliente c)) return false;
        return Objects.equals(dni, c.dni); // identidad por dni
    }
    @Override public int hashCode() { return Objects.hash(dni); } // mismos campos
    @Override public String toString() { return "Cliente{" + dni + "," + nombre + "}"; }
}
```

`DemoEqualsHash.java`:

```java
import java.util.*;
public class DemoEqualsHash {
    public static void main(String[] args) {
        Set<Cliente> clientes = new HashSet<>();
        clientes.add(new Cliente("A1", "Ada"));
        clientes.add(new Cliente("A1", "Ada Lovelace")); // duplicado lógico por dni
        clientes.add(new Cliente("B2", "Linus"));
        System.out.println(clientes.size());
        System.out.println(clientes.contains(new Cliente("A1", "Otra")));
    }
}
```

**Ejecución y salida real**

```bash
javac Cliente.java DemoEqualsHash.java
java DemoEqualsHash
```

```text
2
true
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `contains` false con objeto “igual” | Falta `hashCode` coherente | Implementa ambos con mismos campos |
| Duplicados en `HashSet` | `equals/hashCode` no reflejan identidad | Define identidad de negocio |
| Comportamiento raro tras mutar | Campo hash cambió dentro de estructura hash | Campos identidad inmutables |

**Verificación rápida:** comenta `hashCode()`, recompila/ejecuta y observa el fallo lógico.


### Tema 3: Claves mutables y el mapa que pierde entradas · Intermedio · 35 min

**Caso guía**

Insertas un pedido en `HashMap` por clave objeto, luego mutas el campo usado en `hashCode`. `get` devuelve `null`, pero al iterar el elemento sigue allí.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve / impacto | Regla | Fix |
|---|---|---|---|---|
| **Claves mutables** | Objeto clave cuyo estado usado por `equals/hashCode` cambia tras inserción. | Rompe localización en estructuras hash. | No mutar campos de identidad en claves de `HashMap/HashSet`. | Hacer campo `final`, sin setter. |
| **HashMap pierde entradas** | La entrada queda en el bucket viejo; la búsqueda calcula bucket nuevo. | `get`/`containsKey` fallan aunque el valor exista. | Tratar como bug de contrato. | Eliminar, modificar fuera, reinsertar; o usar clave inmutable. |
| **Identidad estable** | Campos usados en `equals/hashCode` deben ser estables mientras el objeto está en estructura hash. | Mantener invariante del bucket. | Claves inmutables por defecto. | Usar `String`, `Integer`, record inmutable, o ID. |

**Modelo mental.** Cambiar la etiqueta del archivador después de guardarlo: el documento existe, pero lo buscas en el cajón equivocado.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

`ClaveMutable.java`:

```java
import java.util.Objects;
public class ClaveMutable {
    private String codigo; // mutable: peligroso como clave hash
    public ClaveMutable(String codigo) { this.codigo = codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    @Override public boolean equals(Object o) { return o instanceof ClaveMutable c && Objects.equals(codigo, c.codigo); }
    @Override public int hashCode() { return Objects.hash(codigo); }
    @Override public String toString() { return "ClaveMutable{" + codigo + "}"; }
}
```

`DemoMapaPerdido.java`:

```java
import java.util.*;
public class DemoMapaPerdido {
    public static void main(String[] args) {
        Map<ClaveMutable, String> pedidos = new HashMap<>();
        ClaveMutable clave = new ClaveMutable("A1");
        pedidos.put(clave, "Pedido-Ada");
        System.out.println("Antes: " + pedidos.get(clave));
        clave.setCodigo("B2"); // mutación peligrosa
        System.out.println("Despues get(clave): " + pedidos.get(clave));
        System.out.println("Despues get(new A1): " + pedidos.get(new ClaveMutable("A1")));
        System.out.println("Contenido real: " + pedidos);
    }
}
```

**Ejecución y salida real**

```bash
javac ClaveMutable.java DemoMapaPerdido.java
java DemoMapaPerdido
```

```text
Antes: Pedido-Ada
Despues get(clave): null
Despues get(new A1): null
Contenido real: {ClaveMutable{B2}=Pedido-Ada}
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `get` null pero itera | Clave mutada | Clave inmutable / no mutar campos hash |
| Duplicados en `HashSet` | Mutación tras insert | Remover, mutar fuera, reinsertar |

**Verificación rápida:** haz `codigo` `final` y elimina setter; el compilador te obliga al diseño seguro.


### Tema 4: Genéricos, wildcards y type erasure · Intermedio · 45 min

**Caso guía**

Quieres una `Caja<T>` que almacene cualquier tipo con seguridad de compilación, y un método que sume `List<Integer>` o `List<Double>` sin duplicar código ni usar `Object` + casts.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error/riesgo común |
|---|---|---|---|---|
| **Genéricos** | Parametrización de tipos/métodos (`class Caja<T>`, `<T> T id(T x)`). | Seguridad de tipos en compilación, reutilización. | APIs de colecciones, repos, utilidades. | Usar raw types (`List` sin `<T>`). |
| **Wildcards `?`** | Tipo desconocido. `? extends T` (límite superior), `? super T` (inferior), `?`. | Flexibilidad en APIs que leen/escriben genéricos. | Métodos que aceptan familias de tipos. | Confundir extends/super y no poder leer/escribir. |
| **Type erasure** | El compilador borra genéricos en bytecode e inserta checks/casts. | Compatibilidad binaria con Java pre-genéricos. | Entender limitaciones runtime. | `new T()`, `instanceof List<String>`, arrays genéricos. |
| **PECS** | Producer Extends, Consumer Super. | Regla práctica para wildcards. | Diseñar firmas de método. | Usar `extends` cuando necesitas escribir. |

**Contrato / invariantes / reglas.** Genéricos son invariantes: `List<Integer>` no es `List<Number>`. `? extends Number` permite leer como `Number`, no agregar (salvo null). `? super Integer` permite agregar `Integer`, leer como `Object`. Erasure: no `new T[]`, no `T.class` genérico directo, no `instanceof` con parámetro concreto.

**Modelo mental.** Genérico = molde con tipo; wildcard = “algún tipo compatible”; erasure = la etiqueta de tipo se usa en compilación y se borra en runtime.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

`Caja.java`:

```java
public class Caja<T> {
    private T valor;
    public Caja(T valor) { this.valor = valor; }
    public T getValor() { return valor; }
    public void setValor(T valor) { this.valor = valor; }
}
```

`DemoGenericos.java`:

```java
import java.util.*;
public class DemoGenericos {
    static double suma(List<? extends Number> numeros) { // producer: lee
        double total = 0;
        for (Number n : numeros) total += n.doubleValue();
        return total;
    }
    static void agregarUnoADos(List<? super Integer> destino) { // consumer: escribe
        destino.add(1); destino.add(2);
    }
    public static void main(String[] args) {
        Caja<String> texto = new Caja<>("Hola");
        Caja<Integer> numero = new Caja<>(42);
        System.out.println(texto.getValor());
        System.out.println(numero.getValor());
        System.out.println(suma(List.of(1, 2, 3)));
        System.out.println(suma(List.of(1.5, 2.5)));
        List<Number> destino = new ArrayList<>();
        agregarUnoADos(destino);
        System.out.println(destino);
    }
}
```

**Ejecución y salida real**

```bash
javac Caja.java DemoGenericos.java
java DemoGenericos
```

```text
Hola
42
6.0
4.0
[1, 2]
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| No puedo agregar a `List<? extends Number>` | Producer, tipo concreto desconocido | Usa `? super` si vas a escribir |
| Al leer `? super Integer` obtengo `Object` | Consumer, solo garantiza Integer al escribir | Usa `? extends` para leer |
| Raw type warnings | `List` sin tipo | Parametriza `List<T>` |
| `Cannot create generic array` | Erasure | Usa `List<T>` o `@SuppressWarnings` con cuidado |

**Verificación rápida:** intenta `numeros.add(1)` dentro de `suma` y confirma error de compilación.


### Tema 5: Comparable vs Comparator, e iteración · Intermedio · 40 min

**Caso guía**

`Persona` se ordena por edad por defecto, pero en una vista se ordena por nombre. Además, recorres un `Map` y necesitas iterar sin romper la colección.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Comparable** | Interfaz `compareTo(T)` que define orden natural del tipo. | Orden por defecto (`Collections.sort`, `TreeSet`). | Cuando hay un orden natural obvio y estable. | Orden inconsistente con `equals`. |
| **Comparator** | Interfaz `compare(a,b)` para orden externo. | Múltiples criterios sin modificar la clase. | Vistas/reportes con orden contextual. | Comparadores con overflow en resta de enteros; usa `Integer.compare`. |
| **Iteración** | Recorrer elementos (`for-each`, `Iterator`, `entrySet`). | Procesar colecciones. | Lectura, transformación, búsqueda. | Modificar estructura en for-each. |
| **`ConcurrentModificationException`** | Falla rápida en muchas colecciones cuando se modifican estructuralmente durante iteración. | Detectar bug temprano. | Al eliminar mientras iteras. | Usar `list.remove` en for-each; usa `Iterator.remove()`. |

**Contrato / invariantes / reglas.** `compareTo/compare`: negativo menor, 0 igual, positivo mayor; transitivo. Consistencia con `equals` recomendada. `Comparator.comparing(...).thenComparing(...)` compone criterios. Fail-fast no está garantizado en todos los casos concurrentes; es mecanismo de detección de bug.

**Modelo mental.** `Comparable` = cómo se ordena “por nacimiento”; `Comparator` = regla de orden para una ocasión.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

`Persona.java`:

```java
public class Persona implements Comparable<Persona> {
    private final String nombre; private final int edad;
    public Persona(String nombre, int edad) { this.nombre = nombre; this.edad = edad; }
    public String getNombre() { return nombre; } public int getEdad() { return edad; }
    @Override public int compareTo(Persona o) { return Integer.compare(this.edad, o.edad); }
    @Override public String toString() { return nombre + "(" + edad + ")"; }
}
```

`DemoOrden.java`:

```java
import java.util.*;
public class DemoOrden {
    public static void main(String[] args) {
        List<Persona> personas = new ArrayList<>(List.of(new Persona("Linus",55), new Persona("Ada",36), new Persona("Grace",85)));
        Collections.sort(personas); // Comparable
        System.out.println("Edad: " + personas);
        personas.sort(Comparator.comparing(Persona::getNombre)); // Comparator
        System.out.println("Nombre: " + personas);

        Map<String,Integer> stock = new HashMap<>(); stock.put("A",2); stock.put("B",3);
        for (Map.Entry<String,Integer> e : stock.entrySet()) System.out.println(e.getKey()+"="+e.getValue());

        List<Integer> nums = new ArrayList<>(List.of(1,2,3,4));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) { if (it.next() % 2 == 0) it.remove(); } // seguro
        System.out.println(nums);
    }
}
```

**Ejecución y salida real**

```bash
javac Persona.java DemoOrden.java
java DemoOrden
```

```text
Edad: [Ada(36), Linus(55), Grace(85)]
Nombre: [Ada(36), Grace(85), Linus(55)]
A=2
B=3
[1, 3]
```

(orden del Map puede variar)

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `ClassCastException` al sort | Sin Comparable ni Comparator | Implementa/provee Comparator |
| `ConcurrentModificationException` | `remove` en for-each | `Iterator.remove()` |
| Orden inconsistente | `compareTo` contradice `equals` | Alinear o documentar |

**Verificación rápida:** agrega `.reversed()` al comparator y confirma inversión.


### Tema 6: Colas y pilas: Queue, Deque, ArrayDeque y PriorityQueue · Intermedio · 40 min

**Caso guía**

Atención de tickets: FIFO normal, deshacer última acción (LIFO), y tickets urgentes por prioridad. Cada estructura expresa una intención distinta.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Queue** | Colección para procesamiento, típicamente FIFO. | Colas de trabajo/tickets. | Procesamiento en orden de llegada. | Usar `remove()` en cola vacía sin control. |
| **Deque** | Doble extremo: inserta/extrae por cabeza y cola. | Pila (LIFO) o cola (FIFO). | Undo/redo, BFS, ventanas. | Usar `Stack` legacy en vez de `ArrayDeque`. |
| **ArrayDeque** | Implementación de `Deque` basada en arreglo redimensionable, sin `null`. | Pila/cola eficiente. | Casi siempre para pila/cola en memoria. | Insertar `null` (lanza NPE). |
| **PriorityQueue** | Cola basada en heap; `poll()` entrega el menor/mayor según prioridad. | Atención por prioridad. | Schedulers, top-k, urgencias. | Asumir que iterar da orden ordenado. |

**Contrato / invariantes / reglas.** `offer/poll/peek` devuelven valor especial (false/null) en caso extremo; `add/remove/element` lanzan excepción. `PriorityQueue` no ordena al iterar, solo al extraer con `poll()`. `ArrayDeque` no permite null y suele ser más rápida que `LinkedList` para pila/cola.

**Modelo mental.** Queue = fila; Deque/pila = platos; PriorityQueue = urgencias (prioridad, no llegada).

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

`ColasYPilas.java`:

```java
import java.util.*;
public class ColasYPilas {
    public static void main(String[] args) {
        Queue<String> cola = new ArrayDeque<>();
        cola.offer("ticket-1"); cola.offer("ticket-2"); cola.offer("ticket-3");
        System.out.println("Atiendo: " + cola.poll());
        System.out.println("Siguiente: " + cola.peek());
        System.out.println("Cola: " + cola);

        Deque<String> pila = new ArrayDeque<>();
        pila.push("editar"); pila.push("borrar"); pila.push("mover");
        System.out.println("Deshacer: " + pila.pop());
        System.out.println("Pila: " + pila);

        PriorityQueue<Integer> prioridad = new PriorityQueue<>(); // min-heap por defecto
        prioridad.offer(5); prioridad.offer(1); prioridad.offer(3);
        System.out.println("Prioridad poll: " + prioridad.poll());
        System.out.println("Prioridad poll: " + prioridad.poll());
        System.out.println("Resto: " + prioridad);
    }
}
```

**Ejecución y salida real**

```bash
javac ColasYPilas.java
java ColasYPilas
```

```text
Atiendo: ticket-1
Siguiente: ticket-2
Cola: [ticket-2, ticket-3]
Deshacer: mover
Pila: [borrar, editar]
Prioridad poll: 1
Prioridad poll: 3
Resto: [5]
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| `PriorityQueue` “desordenada” al imprimir | Iteración no es orden de prioridad | Extrae con `poll()` en bucle |
| Excepción en cola vacía | Usaste `remove/pop/element` | Usa `poll/peek` o chequea `isEmpty()` |
| `NullPointerException` en `ArrayDeque` | Insertaste null | No uses null; usa valor centinela/Optional fuera |

**Verificación rápida:** extrae toda la `PriorityQueue` con `while(!q.isEmpty())` para ver orden real.


### Tema 7: Incremento del proyecto: preparar guías asignables · Intermedio · 25 min

**Caso guía**

Necesitas un repositorio en memoria de guías: agregar sin duplicar ID, buscar por ID rápido y listar sin exponer la estructura interna.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Regla | Error común |
|---|---|---|---|---|
| **Repositorio en memoria** | Abstracción que encapsula almacenamiento/consulta de entidades. | Separar dominio de estructura de datos. | No exponer colección interna mutable. | Devolver `Map` interno directamente. |
| **Guías asignables** | Entidades de dominio con identidad estable (`id`) y datos consultables. | Base del proyecto integrador. | Validar invariantes (id no vacío, no duplicado). | Permitir IDs duplicados. |
| **Búsqueda por ID (Map)** | `Map<String,Guia>` por clave de identidad. | Consulta promedio O(1). | Clave estable/inmutable. | Usar `List` y recorrer todo. |
| **`Optional` + copia inmutable** | `Optional` expresa ausencia; `List.copyOf` protege estado interno. | API clara y encapsulada. | Retornar `Optional`/copia, no null/estructura interna. | `NullPointerException` o mutación externa. |

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-2 && cd ~/academia-java/modulo-2
```

`Guia.java`:

```java
import java.util.Objects;
public class Guia {
    private final String id; private final String destino;
    public Guia(String id, String destino) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("id obligatorio");
        this.id = id; this.destino = destino;
    }
    public String getId() { return id; } public String getDestino() { return destino; }
    @Override public boolean equals(Object o){ return o instanceof Guia g && Objects.equals(id,g.id); }
    @Override public int hashCode(){ return Objects.hash(id); }
    @Override public String toString(){ return "Guia{id='"+id+"', destino='"+destino+"'}"; }
}
```

`RepositorioGuias.java`:

```java
import java.util.*;
public class RepositorioGuias {
    private final Map<String, Guia> porId = new LinkedHashMap<>();
    public void agregar(Guia guia) {
        if (porId.containsKey(guia.getId())) throw new IllegalArgumentException("ID duplicado: " + guia.getId());
        porId.put(guia.getId(), guia);
    }
    public Optional<Guia> buscar(String id) { return Optional.ofNullable(porId.get(id)); }
    public List<Guia> todas() { return List.copyOf(porId.values()); }
}
```

`DemoRepoGuias.java`:

```java
public class DemoRepoGuias {
    public static void main(String[] args) {
        RepositorioGuias repo = new RepositorioGuias();
        repo.agregar(new Guia("G-1","Madrid"));
        repo.agregar(new Guia("G-2","Bogotá"));
        System.out.println(repo.buscar("G-1").orElseThrow());
        System.out.println(repo.todas().size());
    }
}
```

**Ejecución y salida real**

```bash
javac Guia.java RepositorioGuias.java DemoRepoGuias.java
java DemoRepoGuias
```

```text
Guia{id='G-1', destino='Madrid'}
2
```

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Duplicados por ID | `List` sin validación | `Map` por ID + check |
| Código externo muta interno | Expones colección mutable | `List.copyOf` / vista no modificable |
| `null` al buscar | Contrato ambiguo | `Optional<Guia>` |

**Verificación rápida:** agregar mismo ID dos veces debe lanzar `IllegalArgumentException`.


## Cierre del módulo

Ya sabes elegir la colección según el problema, implementar identidad lógica con `equals/hashCode`, evitar claves mutables en mapas, usar genéricos para seguridad de tipos y aplicar colas/pilas/prioridades. El siguiente módulo trata un problema transversal: qué hacer cuando algo falla, cómo modelar errores y cómo liberar recursos correctamente.
