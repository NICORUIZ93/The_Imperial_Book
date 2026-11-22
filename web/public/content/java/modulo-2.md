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

## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones · Intermedio · 40 min

**Caso guía**

Estás construyendo un pequeño registro de envíos. Necesitas mantener el orden de llegada, evitar IDs duplicados y buscar rápidamente un envío por su código. Un solo tipo de colección no resuelve bien los tres casos.

**Concepto clave / modelo mental**

| Interfaz | Qué garantiza | Implementaciones comunes | Cuándo usarla |
|---|---|---|---|
| `List` | Orden e índices; permite duplicados | `ArrayList`, `LinkedList` | Cuando importa la posición o el orden de inserción |
| `Set` | No permite duplicados (según igualdad) | `HashSet`, `LinkedHashSet`, `TreeSet` | Cuando importa la pertenencia/únicidad |
| `Map` | Pares clave → valor; clave única | `HashMap`, `LinkedHashMap`, `TreeMap` | Cuando buscas por clave |

Regla rápida:

- ¿Necesitas índice o duplicados? `List`.
- ¿Necesitas saber si ya existe? `Set`.
- ¿Necesitas buscar por clave? `Map`.

**Implementación desde cero**

Crea `ColeccionesBasicas.java`:

```java
import java.util.*;

public class ColeccionesBasicas {
    public static void main(String[] args) {
        List<String> llegada = new ArrayList<>();
        llegada.add("ENV-003");
        llegada.add("ENV-001");
        llegada.add("ENV-003");
        System.out.println("List: " + llegada);

        Set<String> idsUnicos = new HashSet<>(llegada);
        System.out.println("Set: " + idsUnicos);

        Map<String, String> estadoPorId = new HashMap<>();
        estadoPorId.put("ENV-001", "PENDIENTE");
        estadoPorId.put("ENV-003", "EN_RUTA");
        estadoPorId.put("ENV-001", "ENTREGADO");

        System.out.println("Estado ENV-001: " + estadoPorId.get("ENV-001"));
        System.out.println("Mapa: " + estadoPorId);
    }
}
```

**Desglose del código**

- `ArrayList` conserva el orden de inserción y acepta duplicados: por eso `ENV-003` aparece dos veces.
- `HashSet` elimina duplicados según `equals/hashCode`. El orden no está garantizado.
- `HashMap.put` con una clave existente reemplaza el valor. Por eso `ENV-001` termina en `ENTREGADO`.
- Programar contra la interfaz (`List`, `Set`, `Map`) permite cambiar la implementación sin reescribir todo el código cliente.

**Ejecución y salida real**

```bash
javac ColeccionesBasicas.java
java ColeccionesBasicas
```

Salida posible (el orden de `HashSet` y `HashMap` puede variar):

```text
List: [ENV-003, ENV-001, ENV-003]
Set: [ENV-003, ENV-001]
Estado ENV-001: ENTREGADO
Mapa: {ENV-003=EN_RUTA, ENV-001=ENTREGADO}
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Duplicados inesperados en un registro de IDs | Usaste `List` donde necesitabas unicidad | Usa `Set` o valida antes de insertar |
| Búsqueda lenta por clave en una lista grande | Recorres la lista completa | Usa `Map` con la clave adecuada |
| Asumes orden en `HashSet`/`HashMap` | Su orden no está garantizado | Usa `LinkedHashSet/LinkedHashMap` o `TreeSet/TreeMap` |

**Verificación rápida**

```bash
javac ColeccionesBasicas.java && java ColeccionesBasicas
```

Cambia `HashSet` por `TreeSet` y observa que los IDs quedan ordenados. Cambia `HashMap` por `LinkedHashMap` si necesitas conservar orden de inserción.

### Tema 2: El contrato de equals y hashCode · Intermedio · 45 min

**Contexto y para qué sirve**

`HashSet` y `HashMap` no adivinan si dos objetos “son el mismo”. Usan `equals()` y `hashCode()`. Si implementas uno mal, o solo uno de los dos, las colecciones basadas en hash se comportan de forma incorrecta: duplicados aparentes, búsquedas que no encuentran, elementos imposibles de localizar.

**Concepto clave / modelo mental**

Contrato esencial:

1. Si `a.equals(b)` es `true`, entonces `a.hashCode() == b.hashCode()` debe ser `true`.
2. Si dos objetos tienen el mismo `hashCode`, **no** significa necesariamente que sean iguales (puede haber colisión).
3. `equals` debe ser reflexivo, simétrico, transitivo, consistente y devolver `false` ante `null`.
4. Los campos usados en `equals/hashCode` deberían ser los que definen la identidad lógica del objeto.

**Implementación desde cero**

Crea `Cliente.java`:

```java
import java.util.Objects;

public class Cliente {
    private final String dni;
    private final String nombre;

    public Cliente(String dni, String nombre) {
        this.dni = dni;
        this.nombre = nombre;
    }

    public String getDni() { return dni; }
    public String getNombre() { return nombre; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cliente cliente)) return false;
        return Objects.equals(dni, cliente.dni);
    }

    @Override
    public int hashCode() {
        return Objects.hash(dni);
    }

    @Override
    public String toString() {
        return "Cliente{dni='" + dni + "', nombre='" + nombre + "'}";
    }
}
```

Crea `DemoEqualsHash.java`:

```java
import java.util.HashSet;
import java.util.Set;

public class DemoEqualsHash {
    public static void main(String[] args) {
        Set<Cliente> clientes = new HashSet<>();
        clientes.add(new Cliente("A1", "Ada"));
        clientes.add(new Cliente("A1", "Ada Lovelace"));
        clientes.add(new Cliente("B2", "Linus"));

        System.out.println(clientes.size());
        System.out.println(clientes.contains(new Cliente("A1", "Otra")));
        System.out.println(clientes);
    }
}
```

**Desglose del código**

- `equals` define identidad lógica por `dni`. Dos clientes con el mismo DNI se consideran el mismo cliente.
- `hashCode` usa el mismo campo (`dni`). Esto cumple el contrato.
- `HashSet` usa primero `hashCode` para ubicar el bucket y luego `equals` para confirmar. Si el hash es inconsistente, el objeto “se pierde”.
- `toString` no forma parte del contrato, pero facilita depurar.

**Ejecución y salida real**

```bash
javac Cliente.java DemoEqualsHash.java
java DemoEqualsHash
```

```text
2
true
[Cliente{dni='A1', nombre='Ada'}, Cliente{dni='B2', nombre='Linus'}]
```

El orden del set puede variar.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `contains` devuelve `false` aunque el objeto “igual” existe | Redefiniste `equals` pero no `hashCode` | Implementa ambos con los mismos campos |
| Duplicados lógicos en `HashSet` | `equals/hashCode` no reflejan la identidad real | Define qué campo(s) identifican al objeto |
| Comportamiento raro tras cambiar un campo usado en hash | Mutaste la clave/objeto dentro de una estructura hash | Usa campos inmutables para identidad |

**Verificación rápida**

```bash
javac Cliente.java DemoEqualsHash.java && java DemoEqualsHash
```

Comenta temporalmente `hashCode()` y vuelve a ejecutar: verás por qué el contrato roto rompe `HashSet`.

### Tema 3: Claves mutables y el mapa que pierde entradas · Intermedio · 35 min

**Caso guía**

Guardas pedidos en un `HashMap` usando un objeto como clave. Luego modificas un campo de esa clave. Cuando buscas el pedido, el mapa parece “olvidarlo”, aunque al iterar sigue allí. Este bug es real y difícil de ver si no entiendes cómo funcionan los hashes.

**Concepto clave / modelo mental**

`HashMap` calcula el bucket de una clave usando `hashCode()` en el momento de insertar/buscar. Si mutas un campo que participa en `hashCode/equals` después de insertar:

- el objeto sigue dentro del mapa;
- pero el mapa lo busca en otro bucket;
- `get` devuelve `null` o no lo encuentra.

Regla: las claves de `HashMap`/elementos de `HashSet` deben ser efectivamente inmutables respecto de su identidad hash.

**Implementación desde cero**

Crea `ClaveMutable.java`:

```java
import java.util.Objects;

public class ClaveMutable {
    private String codigo;

    public ClaveMutable(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ClaveMutable that)) return false;
        return Objects.equals(codigo, that.codigo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(codigo);
    }

    @Override
    public String toString() {
        return "ClaveMutable{codigo='" + codigo + "'}";
    }
}
```

Crea `DemoMapaPerdido.java`:

```java
import java.util.HashMap;
import java.util.Map;

public class DemoMapaPerdido {
    public static void main(String[] args) {
        Map<ClaveMutable, String> pedidos = new HashMap<>();
        ClaveMutable clave = new ClaveMutable("A1");
        pedidos.put(clave, "Pedido-Ada");

        System.out.println("Antes: " + pedidos.get(clave));

        clave.setCodigo("B2"); // mutación peligrosa
        System.out.println("Después get(clave): " + pedidos.get(clave));
        System.out.println("Después get(new A1): " + pedidos.get(new ClaveMutable("A1")));
        System.out.println("Contenido real: " + pedidos);
    }
}
```

**Desglose del código**

- Al insertar, `HashMap` usa el hash de `"A1"`.
- `clave.setCodigo("B2")` cambia el campo que alimenta `hashCode()`.
- El mapa sigue buscando con el nuevo hash; la entrada quedó ubicada según el hash viejo.
- Iterar el mapa puede mostrar la entrada, pero el acceso por clave está roto.

**Ejecución y salida real**

```bash
javac ClaveMutable.java DemoMapaPerdido.java
java DemoMapaPerdido
```

```text
Antes: Pedido-Ada
Después get(clave): null
Después get(new A1): null
Contenido real: {ClaveMutable{codigo='B2'}=Pedido-Ada}
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `get` devuelve `null` pero el elemento aparece al iterar | Mutaste una clave usada en hash | No mutes campos de identidad; usa claves inmutables |
| Duplicados o pérdidas en `HashSet` | Mutaste el objeto tras insertarlo | Elimina, modifica fuera de la estructura, vuelve a insertar |
| Usas entidad JPA mutable como clave | Identidad/ciclo de vida complejo | Prefiere ID inmutable o clave de negocio estable |

**Verificación rápida**

```bash
javac ClaveMutable.java DemoMapaPerdido.java && java DemoMapaPerdido
```

La corrección de diseño es hacer `codigo` `final` y eliminar el setter. Si la clave debe cambiar, usa otro objeto clave.

### Tema 4: Genéricos, wildcards y type erasure · Intermedio · 45 min

**Caso guía**

Quieres una caja que almacene un valor de cualquier tipo sin perder seguridad en compilación. También quieres un método que pueda imprimir una lista de números, ya sean `Integer` o `Double`. Los genéricos resuelven esto sin caer en `Object` y casts por todas partes.

**Concepto clave / modelo mental**

- **Genérico**: parametriza tipos (`Caja<T>`). El compilador verifica el tipo.
- **Wildcard `? extends T`**: acepta `T` o subtipos. Útil para leer (productor).
- **Wildcard `? super T`**: acepta `T` o supertipos. Útil para escribir (consumidor).
- **Type erasure**: en runtime, los genéricos se borran en gran parte. `List<String>` y `List<Integer>` son `List` en bytecode; la seguridad se aplica principalmente en compilación.

**Implementación desde cero**

Crea `Caja.java`:

```java
public class Caja<T> {
    private T valor;

    public Caja(T valor) {
        this.valor = valor;
    }

    public T getValor() { return valor; }
    public void setValor(T valor) { this.valor = valor; }
}
```

Crea `DemoGenericos.java`:

```java
import java.util.*;

public class DemoGenericos {
    public static void main(String[] args) {
        Caja<String> texto = new Caja<>("Hola");
        Caja<Integer> numero = new Caja<>(42);
        System.out.println(texto.getValor());
        System.out.println(numero.getValor());

        List<Integer> enteros = List.of(1, 2, 3);
        List<Double> decimales = List.of(1.5, 2.5);
        System.out.println(suma(enteros));
        System.out.println(suma(decimales));

        List<Number> destino = new ArrayList<>();
        agregarUnoADiez(destino);
        System.out.println(destino);
    }

    static double suma(List<? extends Number> numeros) {
        double total = 0;
        for (Number n : numeros) {
            total += n.doubleValue();
        }
        return total;
    }

    static void agregarUnoADiez(List<? super Integer> destino) {
        for (int i = 1; i <= 3; i++) {
            destino.add(i);
        }
    }
}
```

**Desglose del código**

- `Caja<T>` permite reutilizar la misma clase con tipos distintos, manteniendo chequeo en compilación.
- `List<? extends Number>` acepta listas de `Integer`, `Double`, etc. Puedes leer elementos como `Number`, pero no puedes agregar cualquier `Number` porque el tipo concreto exacto es desconocido.
- `List<? super Integer>` acepta `List<Integer>`, `List<Number>` o `List<Object>`. Puedes agregar `Integer`, pero al leer obtienes `Object`.
- El borrado de tipos explica por qué no puedes hacer `new T()` o `instanceof List<String>` directamente.

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
[1, 2, 3]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `incompatible types` al leer de `List<? super Integer>` | El compilador solo garantiza `Object` | Usa `? extends` para leer tipos específicos |
| No puedes agregar a `List<? extends Number>` | No se conoce el subtipo concreto | Usa `? super` si necesitas escribir |
| Uso excesivo de `List<Object>` y casts | Perdiste seguridad de tipos | Introduce genéricos en la API |

**Verificación rápida**

```bash
javac Caja.java DemoGenericos.java && java DemoGenericos
```

Intenta agregar un `Double` a `List<? extends Number>` dentro de `suma`: el compilador debe rechazarlo. Ese error es el genérico protegiéndote.

### Tema 5: Comparable vs Comparator, e iteración · Intermedio · 40 min

**Caso guía**

Tienes personas que normalmente se ordenan por edad, pero en una pantalla quieres ordenarlas por nombre. No puedes tener un solo “orden natural” para todos los casos. Necesitas separar el orden natural del orden contextual.

**Concepto clave / modelo mental**

| Interfaz | Dónde se implementa | Propósito | Ejemplo |
|---|---|---|---|
| `Comparable<T>` | Dentro de la clase | Orden natural | Persona por edad |
| `Comparator<T>` | Clase/objeto externo | Orden alternativo | Persona por nombre |

- `compareTo` devuelve negativo, cero o positivo.
- `Comparator.comparing(...)` crea comparadores legibles.
- Iteración: `for-each`, `Iterator`, `forEach`. Usa `Iterator.remove()` si necesitas eliminar mientras iteras.

**Implementación desde cero**

Crea `Persona.java`:

```java
public class Persona implements Comparable<Persona> {
    private final String nombre;
    private final int edad;

    public Persona(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }

    public String getNombre() { return nombre; }
    public int getEdad() { return edad; }

    @Override
    public int compareTo(Persona otra) {
        return Integer.compare(this.edad, otra.edad);
    }

    @Override
    public String toString() {
        return nombre + "(" + edad + ")";
    }
}
```

Crea `DemoOrden.java`:

```java
import java.util.*;

public class DemoOrden {
    public static void main(String[] args) {
        List<Persona> personas = new ArrayList<>(List.of(
            new Persona("Linus", 55),
            new Persona("Ada", 36),
            new Persona("Grace", 85)
        ));

        Collections.sort(personas);
        System.out.println("Por edad: " + personas);

        personas.sort(Comparator.comparing(Persona::getNombre));
        System.out.println("Por nombre: " + personas);

        Map<String, Integer> stock = new HashMap<>();
        stock.put("A", 2);
        stock.put("B", 3);
        for (Map.Entry<String, Integer> entry : stock.entrySet()) {
            System.out.println(entry.getKey() + "=" + entry.getValue());
        }
    }
}
```

**Desglose del código**

- `Comparable` define el orden natural en la propia clase.
- `Collections.sort(personas)` usa `compareTo`.
- `personas.sort(Comparator.comparing(Persona::getNombre))` aplica un orden alternativo sin modificar la clase.
- `entrySet()` es la forma eficiente de recorrer clave y valor en un `Map`.

**Ejecución y salida real**

```bash
javac Persona.java DemoOrden.java
java DemoOrden
```

Salida (el orden del último `Map` puede variar):

```text
Por edad: [Ada(36), Linus(55), Grace(85)]
Por nombre: [Ada(36), Grace(85), Linus(55)]
A=2
B=3
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `ClassCastException` al ordenar | Elementos no comparables y sin `Comparator` | Implementa `Comparable` o pasa `Comparator` |
| Orden inconsistente con `equals` | `compareTo` contradice la identidad lógica | Diseña coherencia entre comparación e igualdad |
| `ConcurrentModificationException` al eliminar en for-each | Modificaste la colección durante la iteración | Usa `Iterator.remove()` |

**Verificación rápida**

```bash
javac Persona.java DemoOrden.java && java DemoOrden
```

Agrega `.reversed()` al comparador por nombre y confirma que el orden se invierte.

### Tema 6: Colas y pilas: Queue, Deque, ArrayDeque y PriorityQueue · Intermedio · 40 min

**Caso guía**

En un sistema de atención, algunos tickets entran por orden normal y otros por prioridad. Además, necesitas deshacer la última acción. Una lista sola puede hacerlo, pero una cola/pila expresa mejor la intención y evita errores.

**Concepto clave / modelo mental**

| Estructura | Comportamiento | Implementación típica | Uso |
|---|---|---|---|
| Cola (`Queue`) | FIFO: primero en entrar, primero en salir | `ArrayDeque`, `LinkedList` | Tareas en orden |
| Pila (`Deque` como stack) | LIFO: último en entrar, primero en salir | `ArrayDeque` | Deshacer/retroceso |
| Cola de prioridad | Sale el elemento “más importante” | `PriorityQueue` | Tickets urgentes, scheduling |

`ArrayDeque` es generalmente preferible a `Stack` y suele ser mejor que `LinkedList` para pila/cola.

**Implementación desde cero**

Crea `ColasYPilas.java`:

```java
import java.util.*;

public class ColasYPilas {
    public static void main(String[] args) {
        Queue<String> cola = new ArrayDeque<>();
        cola.add("ticket-1");
        cola.add("ticket-2");
        cola.add("ticket-3");
        System.out.println("Atiendo: " + cola.poll());
        System.out.println("Siguiente: " + cola.peek());
        System.out.println("Cola: " + cola);

        Deque<String> pila = new ArrayDeque<>();
        pila.push("editar");
        pila.push("borrar");
        pila.push("mover");
        System.out.println("Deshacer: " + pila.pop());
        System.out.println("Pila: " + pila);

        PriorityQueue<Integer> prioridad = new PriorityQueue<>();
        prioridad.add(5);
        prioridad.add(1);
        prioridad.add(3);
        System.out.println("Prioridad poll: " + prioridad.poll());
        System.out.println("Prioridad poll: " + prioridad.poll());
        System.out.println("Prioridad restante: " + prioridad);
    }
}
```

**Desglose del código**

- `Queue` con `add/poll/peek`: inserta, extrae cabeza, inspecciona cabeza.
- `Deque` como pila con `push/pop`: LIFO.
- `PriorityQueue` no garantiza orden al iterar; garantiza que `poll()` entrega el menor elemento según el orden natural o comparador.
- `poll()` devuelve `null` si la estructura está vacía; `remove/pop` pueden lanzar excepción según el caso.

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
Prioridad restante: [5]
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `PriorityQueue` parece desordenada al imprimir | Iterar no respeta prioridad | Usa `poll()` en bucle para extraer en orden |
| `NoSuchElementException` en pila/cola vacía | Usaste `pop/remove` sin verificar | Usa `poll()` o comprueba `isEmpty()` |
| Usas `Stack` por costumbre | API antigua y sincronizada | Prefiere `ArrayDeque` |

**Verificación rápida**

```bash
javac ColasYPilas.java && java ColasYPilas
```

Extrae todos los elementos de `PriorityQueue` con `while (!prioridad.isEmpty()) System.out.println(prioridad.poll());` para ver el orden real.

## Cierre del módulo

Ya sabes elegir la colección según el problema, implementar identidad lógica con `equals/hashCode`, evitar claves mutables en mapas, usar genéricos para seguridad de tipos y aplicar colas/pilas/prioridades. El siguiente módulo trata un problema transversal: qué hacer cuando algo falla, cómo modelar errores y cómo liberar recursos correctamente.

### Tema 7: Incremento del proyecto: preparar guías asignables · Intermedio · 25 min

**Caso guía**

En el proyecto integrador de la ruta Java, las guías llegan con datos sueltos y necesitas guardarlas, evitar duplicados por ID y consultarlas rápido por código. Este incremento conecta colecciones con un dominio pequeño y real.

**Concepto clave / modelo mental**

- Usa `List` cuando el orden de llegada importa.
- Usa `Set` o un `Map` con clave por ID cuando la identidad debe ser única.
- Encapsula la colección dentro de una clase de repositorio; no expongas la lista mutable directamente.

**Implementación desde cero**

Crea `Guia.java`:

```java
import java.util.Objects;

public class Guia {
    private final String id;
    private final String destino;

    public Guia(String id, String destino) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("id obligatorio");
        this.id = id;
        this.destino = destino;
    }

    public String getId() { return id; }
    public String getDestino() { return destino; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Guia guia)) return false;
        return Objects.equals(id, guia.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() { return "Guia{id='" + id + "', destino='" + destino + "'}"; }
}
```

Crea `RepositorioGuias.java`:

```java
import java.util.*;

public class RepositorioGuias {
    private final Map<String, Guia> porId = new LinkedHashMap<>();

    public void agregar(Guia guia) {
        if (porId.containsKey(guia.getId())) {
            throw new IllegalArgumentException("ID duplicado: " + guia.getId());
        }
        porId.put(guia.getId(), guia);
    }

    public Optional<Guia> buscar(String id) {
        return Optional.ofNullable(porId.get(id));
    }

    public List<Guia> todas() {
        return List.copyOf(porId.values());
    }
}
```

**Desglose del código**

- `equals/hashCode` por `id` definen la identidad de la guía.
- `LinkedHashMap` conserva orden de inserción y da búsqueda por clave.
- `Optional` evita devolver `null` al buscar.
- `List.copyOf` expone una vista inmutable hacia afuera.

**Ejecución y salida real**

```java
public class DemoRepoGuias {
    public static void main(String[] args) {
        RepositorioGuias repo = new RepositorioGuias();
        repo.agregar(new Guia("G-1", "Madrid"));
        repo.agregar(new Guia("G-2", "Bogotá"));
        System.out.println(repo.buscar("G-1").orElseThrow());
        System.out.println(repo.todas().size());
    }
}
```

```text
Guia{id='G-1', destino='Madrid'}
2
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Duplicados con mismo ID | Usaste `List` sin validar | Usa `Map` por ID o valida existencia |
| Código externo modifica la colección interna | Expones la colección mutable | Devuelve copia inmutable o vista no modificable |
| `NullPointerException` al buscar | Devuelves `null` | Usa `Optional` o documenta contrato |

**Verificación rápida**

```bash
javac Guia.java RepositorioGuias.java DemoRepoGuias.java
java DemoRepoGuias
```

Prueba agregar dos guías con el mismo ID: debe lanzar `IllegalArgumentException`.
