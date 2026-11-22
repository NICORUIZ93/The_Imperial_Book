# Módulo 2: Colecciones y genéricos

Cuando un programa maneja más de unos pocos valores, los arreglos se quedan cortos: tienen tamaño fijo, no expresan bien la intención y obligan a escribir lógica manual para buscar, eliminar o evitar duplicados. La biblioteca de colecciones de Java ofrece estructuras listas para estas tareas, y los genéricos permiten usarlas con seguridad de tipos. En este módulo veremos cómo elegir la estructura adecuada, qué contratos la hacen funcionar correctamente y cómo expresar tipos reutilizables sin perder comprobaciones en compilación.

**Entorno de referencia verificado en esta máquina (2026-05-22):**

```bash
java -version
javac -version
```

```text
openjdk version "27.0.1.0.2" 2026-09-15
javac 27.0.1.0.2
```

## Aprende construyendo

### Tema 1: List, Set, Map y sus implementaciones · Intermedio · 40 min

Imaginemos un registro de envíos. Necesitamos mantener el orden en que llegaron los paquetes, evitar IDs duplicados y consultar rápidamente el estado de un envío por su código. Ninguna estructura resuelve los tres problemas con la misma claridad. La elección correcta empieza por la interfaz, que expresa la intención, y continúa por la implementación, que define costos y garantías.

#### List

**Definición formal.** `List` es una colección ordenada que permite elementos duplicados y acceso posicional por índice. El orden es el definido por la lista, normalmente el de inserción.

**Para qué sirve.** Sirve cuando importa la secuencia, la posición o la presencia de duplicados, como historial, pasos o filas en orden.

**Cuándo usarla y cuándo no.** Úsala cuando necesites orden/acceso por índice. Evítala como mecanismo principal de búsqueda por clave única en grandes volúmenes; para eso conviene `Set` o `Map`. `ArrayList` es la implementación general por defecto: acceso por índice rápido y agregado al final amortizado; insertar/eliminar en medio cuesta por desplazamiento.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t1-list && cd /tmp/java-m2-t1-list
```

```java
import java.util.*;
public class DemoList {
    public static void main(String[] args) {
        List<String> llegada = new ArrayList<>();
        llegada.add("A"); llegada.add("B"); llegada.add("A");
        System.out.println(llegada);
        System.out.println(llegada.get(0));
    }
}
```

**Caso de uso real.** Historial de eventos de un pedido donde el orden de llegada importa y puede haber eventos repetidos.

**Error común.** Usar `List.contains` para validar unicidad en un flujo grande. Síntoma: lentitud por búsqueda lineal. Corrección: usar `Set` para membresía o `Map` para búsqueda por clave.

**Verificación.** Ejecutado en `/tmp/java-m2-pilot` (JDK 27, 2026-05-22): salida `[A, B, A]` y `A`.

#### Set

**Definición formal.** `Set` es una colección que no permite duplicados. La unicidad se determina por `equals/hashCode` en `HashSet` o por comparación/orden en `TreeSet`.

**Para qué sirve.** Sirve para representar membresía: ¿este ID ya existe?, ¿este permiso está presente?

**Cuándo usarla y cuándo no.** Úsala cuando la unicidad es central. No la uses si necesitas duplicados o acceso posicional. `HashSet` da operaciones promedio cercanas a O(1) pero no garantiza orden; si necesitas orden de inserción, `LinkedHashSet`; si necesitas orden ordenado, `TreeSet`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t1-set && cd /tmp/java-m2-t1-set
```

```java
import java.util.*;
public class DemoSet {
    public static void main(String[] args) {
        Set<String> s = new HashSet<>(List.of("A", "A", "B"));
        System.out.println(s.contains("A"));
        System.out.println(s.size());
    }
}
```

**Caso de uso real.** Conjunto de IDs de envíos ya procesados para evitar reprocesamiento.

**Error común.** Asumir que `HashSet` conserva orden. Síntoma: tests frágiles o salida cambiante. Corrección: usar `LinkedHashSet` o `TreeSet` si el orden es parte del contrato.

**Verificación.** Ejecutado en `/tmp/java-m2-pilot` (JDK 27, 2026-05-22): `true`, `2`.

#### Map

**Definición formal.** `Map` asocia claves únicas a valores. No es subinterfaz de `Collection`; modela pares clave-valor. Insertar una clave existente reemplaza el valor.

**Para qué sirve.** Sirve para búsqueda por clave: estado por ID, configuración por nombre, índice por código.

**Cuándo usarla y cuándo no.** Úsala cuando la pregunta natural es “dado esta clave, ¿qué valor tiene?”. `HashMap` es la opción general (O(1) promedio, sin orden). `LinkedHashMap` conserva orden de inserción. `TreeMap` mantiene claves ordenadas (O(log n)).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t1-map && cd /tmp/java-m2-t1-map
```

```java
import java.util.*;
public class DemoMap {
    public static void main(String[] args) {
        Map<String, String> m = new HashMap<>();
        m.put("ENV-1", "PENDIENTE");
        m.put("ENV-1", "ENTREGADO");
        System.out.println(m.get("ENV-1"));
        System.out.println(new TreeMap<>(Map.of("b", 2, "a", 1)));
    }
}
```

**Caso de uso real.** Índice en memoria de sesiones por token o de productos por SKU.

**Error común.** Elegir `HashMap` y asumir orden. Síntoma: salida no determinista. Corrección: `LinkedHashMap` para inserción, `TreeMap` para orden por clave.

**Verificación.** Ejecutado en `/tmp/java-m2-pilot` (JDK 27, 2026-05-22): `ENTREGADO` y `{a=1, b=2}`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m2-t1 && cd /tmp/java-m2-t1
```

Creamos `ColeccionesBasicas.java`:

```java
import java.util.*;

public class ColeccionesBasicas {
    public static void main(String[] args) {
        List<String> llegada = new ArrayList<>();
        llegada.add("ENV-003");
        llegada.add("ENV-001");
        llegada.add("ENV-003");
        System.out.println("List: " + llegada);
        System.out.println("List[0]: " + llegada.get(0));

        Set<String> idsUnicos = new HashSet<>(llegada);
        System.out.println("Set contiene ENV-003: " + idsUnicos.contains("ENV-003"));
        System.out.println("Set size: " + idsUnicos.size());

        Map<String, String> estadoPorId = new HashMap<>();
        estadoPorId.put("ENV-001", "PENDIENTE");
        estadoPorId.put("ENV-003", "EN_RUTA");
        estadoPorId.put("ENV-001", "ENTREGADO");
        System.out.println("Estado ENV-001: " + estadoPorId.get("ENV-001"));

        Map<String, Integer> ordenado = new LinkedHashMap<>();
        ordenado.put("b", 2);
        ordenado.put("a", 1);
        System.out.println("LinkedHashMap: " + ordenado);

        Map<String, Integer> tree = new TreeMap<>(ordenado);
        System.out.println("TreeMap: " + tree);
    }
}
```

#### Recorrido del código

`ArrayList` conserva orden y duplicados. `HashSet` elimina duplicados por igualdad. `HashMap` reemplaza valor para la misma clave. `LinkedHashMap` conserva inserción; `TreeMap` ordena por clave. Cada estructura expresa una intención distinta.

#### Ejecución y salida real

```bash
javac ColeccionesBasicas.java
java ColeccionesBasicas
```

Salida real observada (JDK 27, 2026-05-22):

```text
List: [ENV-003, ENV-001, ENV-003]
List[0]: ENV-003
Set contiene ENV-003: true
Set size: 2
Estado ENV-001: ENTREGADO
LinkedHashMap: {b=2, a=1}
TreeMap: {a=1, b=2}
```

#### Errores frecuentes

Usar la estructura equivocada encarece o confunde el código: `List` para membresía, `HashMap` cuando el orden importa, `TreeMap` sin necesidad de orden. Elegir por contrato primero, por implementación después.

#### Verificación

La verificación mínima es ejecutar el integrado y confirmar duplicados en `List`, unicidad en `Set`, reemplazo en `Map` y orden en `LinkedHashMap/TreeMap`.

### Tema 2: El contrato de equals y hashCode · Intermedio · 45 min

Dos objetos `Cliente` con el mismo DNI representan, para el negocio, al mismo cliente. Si Java no conoce esa regla, dos instancias distintas serán distintas aunque tengan el mismo DNI. Esto se vuelve visible en estructuras hash como `HashSet` o `HashMap`: un `contains` puede devolver `false` o aparecer duplicados lógicos.

#### `equals`

**Definición formal.** `equals` define la igualdad lógica entre objetos. Su contrato exige que sea reflexivo, simétrico, transitivo y consistente, y que `x.equals(null)` devuelva `false` cuando `x` no es nulo.

**Para qué sirve.** Expresa qué significa que dos objetos representen lo mismo en el dominio. Se implementa cuando la identidad por referencia (`==`) no es suficiente.

**Cuándo usarlo y cuándo no.** Úsalo cuando el dominio tenga identidad lógica (DNI, email, código). No incluyas campos irrelevantes o mutables que no formen parte de la identidad. Compara campos de referencia con `Objects.equals`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t2-equals && cd /tmp/java-m2-t2-equals
```

```java
import java.util.Objects;
class ClienteE {
    final String dni; final String nombre;
    ClienteE(String dni, String nombre) { this.dni = dni; this.nombre = nombre; }
    @Override public boolean equals(Object o) {
        return o instanceof ClienteE c && Objects.equals(dni, c.dni);
    }
    @Override public int hashCode() { return Objects.hash(dni); }
}
public class DemoEquals {
    public static void main(String[] args) {
        System.out.println(new ClienteE("A1", "Ada").equals(new ClienteE("A1", "Otra")));
    }
}
```

**Caso de uso real.** Dos registros de cliente cargados desde fuentes distintas se consideran el mismo cliente si comparten DNI.

**Error común.** Usar `==` para comparar `String` o incluir campos no identitarios. Síntoma: duplicados lógicos o igualdad inesperada. Corrección: comparar solo campos de identidad con `Objects.equals`.

**Verificación.** Ejecutado en `/tmp/java-m2-t2p` (JDK 27, 2026-05-22): `new ClienteE("A1","Ada").equals(new ClienteE("A1","Otra"))` devuelve `true`.

#### `hashCode`

**Definición formal.** `hashCode` devuelve un entero usado por estructuras hash para ubicar objetos en buckets. Si dos objetos son iguales según `equals`, deben devolver el mismo `hashCode`.

**Para qué sirve.** Permite a `HashMap`/`HashSet` localizar candidatos rápido antes de confirmar con `equals`.

**Cuándo usarlo y cuándo no.** Siempre que sobreescribas `equals`, sobreescribe `hashCode` con los mismos campos de identidad. No uses campos distintos a los de `equals`. Colisiones (mismo hash, objetos no iguales) son aceptables; hashes distintos para objetos iguales no.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t2-hash && cd /tmp/java-m2-t2-hash
```

```java
import java.util.*; import java.util.Objects;
class ClienteH {
    final String dni;
    ClienteH(String dni) { this.dni = dni; }
    @Override public boolean equals(Object o) { return o instanceof ClienteH c && Objects.equals(dni, c.dni); }
    @Override public int hashCode() { return Objects.hash(dni); }
}
public class DemoHash {
    public static void main(String[] args) {
        Set<ClienteH> s = new HashSet<>();
        s.add(new ClienteH("A1"));
        System.out.println(s.contains(new ClienteH("A1")));
    }
}
```

**Caso de uso real.** Un `HashSet<Cliente>` evita duplicados por DNI y responde `contains` en tiempo promedio cercano a O(1).

**Error común.** Sobreescribir `equals` sin `hashCode`. Síntoma: `contains` devuelve `false` o hay duplicados en `HashSet`. Corrección: implementar ambos con los mismos campos.

**Verificación.** Ejecutado en `/tmp/java-m2-t2p` (JDK 27, 2026-05-22): `HashSet` con `ClienteH("A1")` responde `contains(new ClienteH("A1")) == true`.

#### Relación entre `equals` y `hashCode`

**Definición formal.** Contrato combinado: `equals` true implica mismo `hashCode`; mismo `hashCode` no implica `equals`. Las estructuras hash usan `hashCode` para elegir bucket y `equals` para confirmar dentro del bucket.

**Para qué sirve.** Garantiza correctitud en `HashMap`, `HashSet` y cualquier estructura basada en hash.

**Cuándo usarlo y cuándo no.** Aplica siempre que un objeto se use como clave de `HashMap` o elemento de `HashSet`. No bases `equals` y `hashCode` en campos distintos. No uses campos mutables en la identidad mientras el objeto esté en una estructura hash.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t2-contrato && cd /tmp/java-m2-t2-contrato
```

```java
import java.util.Objects;
class ClienteC {
    final String dni;
    ClienteC(String dni) { this.dni = dni; }
    @Override public boolean equals(Object o) { return o instanceof ClienteC c && Objects.equals(dni, c.dni); }
    @Override public int hashCode() { return Objects.hash(dni); }
}
public class DemoContrato {
    public static void main(String[] args) {
        ClienteC a = new ClienteC("A1"), b = new ClienteC("A1");
        System.out.println(a.equals(b));
        System.out.println(a.hashCode() == b.hashCode());
    }
}
```

**Caso de uso real.** Caché en memoria por ID de entidad: la clave debe ser igual y tener mismo hash para recuperar el valor.

**Error común.** Campos mutables en identidad hash. Síntoma: el mapa “pierde” entradas después de mutar la clave. Corrección: usar campos inmutables o no mutarlos mientras estén en la estructura.

**Verificación.** Ejecutado en `/tmp/java-m2-t2p` (JDK 27, 2026-05-22): `true`, `true`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m2-t2 && cd /tmp/java-m2-t2
```

Creamos `Cliente.java`:

```java
import java.util.Objects;

public class Cliente {
    private final String dni;
    private final String nombre;

    public Cliente(String dni, String nombre) {
        this.dni = dni;
        this.nombre = nombre;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cliente c)) return false;
        return Objects.equals(dni, c.dni);
    }

    @Override
    public int hashCode() {
        return Objects.hash(dni);
    }

    @Override
    public String toString() {
        return "Cliente{" + dni + "," + nombre + "}";
    }
}
```

Y `DemoEqualsHash.java`:

```java
import java.util.*;

public class DemoEqualsHash {
    public static void main(String[] args) {
        Set<Cliente> clientes = new HashSet<>();
        clientes.add(new Cliente("A1", "Ada"));
        clientes.add(new Cliente("A1", "Ada Lovelace"));
        clientes.add(new Cliente("B2", "Linus"));
        System.out.println(clientes.size());
        System.out.println(clientes.contains(new Cliente("A1", "Otra")));
    }
}
```

#### Recorrido del código

`equals` compara solo `dni`, la identidad de negocio. `hashCode` usa el mismo campo. El segundo `add` no aumenta el tamaño porque el `HashSet` detecta el duplicado lógico: mismo hash, luego `equals` true. `contains` con una instancia distinta pero mismo DNI devuelve `true`.

#### Ejecución y salida real

```bash
javac Cliente.java DemoEqualsHash.java
java DemoEqualsHash
```

Salida real observada (JDK 27, 2026-05-22):

```text
2
true
```

#### Errores frecuentes

Omitir `hashCode` rompe estructuras hash. Usar campos distintos en ambos métodos rompe el contrato. Usar campos mutables como identidad puede “perder” entradas en `HashMap`/`HashSet`.

#### Verificación

Ejecutar el integrado y confirmar `2` y `true`. Prueba adicional: comentar `hashCode()`, recompilar y observar comportamiento incorrecto.

### Tema 3: Claves mutables y el mapa que pierde entradas · Intermedio · 35 min

Un `HashMap` puede parecer defectuoso cuando se inserta un valor, luego se consulta con la misma clave y devuelve `null`. En muchos casos el mapa no está roto: lo que se rompió fue el contrato de la clave. Si un objeto usado como clave cambia los campos que participan en `equals` y `hashCode` después de ser insertado, el mapa lo busca en el bucket equivocado.

#### Claves mutables

Una **clave mutable** es un objeto cuyo estado puede cambiar después de su creación. La mutabilidad no es mala por sí misma; muchos objetos de dominio necesitan cambiar. El problema aparece cuando un objeto mutable se usa como clave en una estructura hash y los campos mutados participan en `equals` o `hashCode`.

`HashMap` calcula el hash de la clave al insertar para decidir en qué bucket colocar la entrada. Al consultar, vuelve a calcular el hash de la clave buscada. Si el hash cambió, la búsqueda va a otro bucket. El objeto puede seguir dentro del mapa, pero se volvió difícil de encontrar por la vía normal. El error común es agregar un setter a un campo que forma parte de la identidad hash. La verificación es mutar la clave después de insertar y observar el resultado de `get`.

#### El mapa que pierde entradas

La expresión “el mapa pierde entradas” describe el síntoma: la entrada parece desaparecer. En realidad, la entrada sigue presente en la estructura interna, pero la clave ya no es localizable por su nuevo hash. Esto afecta `get`, `containsKey` y `remove`. Iterar el mapa puede mostrar la entrada, lo que vuelve el bug todavía más confuso.

La regla es clara: mientras un objeto actúe como clave en `HashMap` o elemento en `HashSet`, los campos usados por `equals` y `hashCode` no deben cambiar. La solución práctica es usar claves inmutables: `String`, `Integer`, records inmutables u objetos cuyo identificador no cambie. Si se necesita mutar, hay que eliminar la entrada, modificar el objeto fuera de la estructura y volver a insertarlo.

#### Identidad estable

La **identidad estable** significa que los campos que definen igualdad y hash no cambian mientras el objeto participa en una estructura hash. No es necesario que todo el objeto sea inmutable, pero sí que la parte usada como identidad sea estable. En el caso de claves compuestas, conviene ser especialmente cuidadoso.

El riesgo de ignorar esta regla es un bug difícil de reproducir: depende del momento en que se muta la clave y de la operación realizada. La verificación consiste en hacer `final` el campo de identidad o eliminar el setter, de modo que el compilador impida la mutación peligrosa.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m2-t3 && cd /tmp/java-m2-t3
```

Creamos `ClaveMutable.java`:

```java
import java.util.Objects;

public class ClaveMutable {
    private String codigo;

    public ClaveMutable(String codigo) { this.codigo = codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    @Override
    public boolean equals(Object o) {
        return o instanceof ClaveMutable c && Objects.equals(codigo, c.codigo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(codigo);
    }

    @Override
    public String toString() {
        return "ClaveMutable{" + codigo + "}";
    }
}
```

Y `DemoMapaPerdido.java`:

```java
import java.util.*;

public class DemoMapaPerdido {
    public static void main(String[] args) {
        Map<ClaveMutable, String> pedidos = new HashMap<>();
        ClaveMutable clave = new ClaveMutable("A1");
        pedidos.put(clave, "Pedido-Ada");
        System.out.println("Antes: " + pedidos.get(clave));

        clave.setCodigo("B2");
        System.out.println("Despues get(clave): " + pedidos.get(clave));
        System.out.println("Despues get(new A1): " + pedidos.get(new ClaveMutable("A1")));
        System.out.println("Contenido real: " + pedidos);
    }
}
```

#### Recorrido del código

`ClaveMutable` usa `codigo` tanto en `equals` como en `hashCode`. Al principio, la clave `A1` se inserta correctamente y `get` devuelve `Pedido-Ada`. Después, `setCodigo("B2")` cambia el estado que define el hash. El mapa no se reorganiza automáticamente: la entrada quedó en el bucket correspondiente a `A1`.

Cuando se consulta con la misma instancia, el mapa calcula el hash actual, que ahora corresponde a `B2`, y busca en el bucket equivocado. Cuando se consulta con `new ClaveMutable("A1")`, también falla porque la entrada ya no está en el bucket de `A1`. Sin embargo, al iterar el contenido del mapa, la entrada aparece con la clave ya mutada a `B2`.

#### Ejecución y salida real

```bash
javac ClaveMutable.java DemoMapaPerdido.java
java DemoMapaPerdido
```

Salida real observada (JDK 27, 2026-05-22):

```text
Antes: Pedido-Ada
Despues get(clave): null
Despues get(new A1): null
Contenido real: {ClaveMutable{B2}=Pedido-Ada}
```

#### Errores frecuentes

El error más común es exponer setters sobre campos que participan en la identidad hash. La corrección es hacer esos campos `final` o evitar usarlos como claves.

Otro error es intentar “arreglar” el mapa después de la mutación. La forma segura es eliminar la entrada antes de mutar la clave y volver a insertarla después, o mejor, no mutar la clave.

Usar objetos de negocio ricos como claves sin revisar su `equals/hashCode` también es riesgoso. Muchas veces una clave simple e inmutable, como un ID `String` o `Long`, es más segura.

#### Verificación

La verificación consiste en ejecutar el ejemplo y observar la contradicción: `get` devuelve `null`, pero el contenido real muestra la entrada. La corrección se verifica haciendo `codigo` final y eliminando el setter; el compilador impide la mutación.


### Tema 4: Genéricos, wildcards y type erasure · Intermedio · 45 min

Antes de los genéricos, las colecciones guardaban `Object`. Eso permitía mezclar tipos y solo descubríamos el error en tiempo de ejecución, al hacer un cast inválido. Los genéricos mueven ese error a la compilación. Al mismo tiempo, introducen reglas propias: invariancia, wildcards y borrado de tipos. Entenderlas evita tanto los avisos de raw types como las firmas de métodos imposibles de usar.

#### Genéricos

Los **genéricos** permiten parametrizar clases, interfaces y métodos con tipos. Una clase `Caja<T>` no guarda “cualquier cosa”, sino un valor de un tipo `T` que se concreta al usarla: `Caja<String>`, `Caja<Integer>`. Su propósito es dar seguridad de tipos y reutilización sin casts manuales.

Se usan en colecciones, repositorios, contenedores y utilidades. No conviene usar raw types, como `List` sin parámetro, porque desactivan la verificación de tipos y vuelven a los problemas de Java pre-genéricos. El error común es mezclar tipos en una colección raw y recibir `ClassCastException` lejos del origen. La verificación es intentar agregar un tipo incompatible a `List<String>` y comprobar que el compilador lo rechaza.

#### Wildcards

Un **wildcard** (`?`) representa un tipo desconocido. Se usa en firmas donde se quiere flexibilidad. `? extends Number` significa “algún tipo que es Number o subclase de Number”: permite leer elementos como `Number`, pero no permite agregar elementos nuevos, porque el tipo concreto es desconocido. `? super Integer` significa “algún tipo que es Integer o superclase de Integer”: permite agregar `Integer`, pero al leer solo se puede asumir `Object`.

La regla práctica es PECS: *Producer Extends, Consumer Super*. Si el método lee datos de la estructura, usa `extends`; si escribe datos en la estructura, usa `super`. No usar esta regla lleva a firmas que compilan mal o a APIs incómodas. El error común es intentar `numeros.add(1)` en una `List<? extends Number>`. La verificación es comprobar que el compilador rechaza esa operación.

#### Type erasure

El **type erasure** o borrado de tipos es el mecanismo por el cual el compilador elimina la información genérica en tiempo de ejecución e inserta comprobaciones/casts necesarios. Esto permitió compatibilidad con código anterior a los genéricos. La consecuencia es que en runtime no existe `List<String>` como tipo distinto de `List<Integer>`; ambos son `List`.

Por eso hay limitaciones: no se puede hacer `new T()`, no se puede crear `new T[]`, y no se puede usar `instanceof List<String>`. Los genéricos son principalmente una herramienta de compilación. El error común es esperar que el tipo genérico esté disponible como si fuera una clase normal en runtime. La verificación es intentar escribir `if (obj instanceof List<String>)` y ver el error de compilación.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m2-t4 && cd /tmp/java-m2-t4
```

Creamos `Caja.java`:

```java
public class Caja<T> {
    private T valor;

    public Caja(T valor) { this.valor = valor; }
    public T getValor() { return valor; }
    public void setValor(T valor) { this.valor = valor; }
}
```

Y `DemoGenericos.java`:

```java
import java.util.*;

public class DemoGenericos {
    static double suma(List<? extends Number> numeros) {
        double total = 0;
        for (Number n : numeros) {
            total += n.doubleValue();
        }
        return total;
    }

    static void agregarUnoADos(List<? super Integer> destino) {
        destino.add(1);
        destino.add(2);
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

#### Recorrido del código

`Caja<T>` es una clase genérica. El campo `valor`, el parámetro del constructor y el retorno de `getValor` usan el mismo tipo `T`. Al crear `Caja<String>`, el compilador garantiza que solo se guarden cadenas. No hay cast en el código cliente.

El método `suma` recibe `List<? extends Number>`. Puede aceptar `List<Integer>`, `List<Double>` u otras listas de subtipos de `Number`. Dentro del método, los elementos se leen como `Number`, lo que permite llamar `doubleValue()`. No se pueden agregar elementos, porque la lista concreta podría ser una `List<Double>` y agregar un `Integer` rompería su tipo.

El método `agregarUnoADos` recibe `List<? super Integer>`. Puede aceptar `List<Integer>`, `List<Number>` o `List<Object>`. Como la lista garantiza que acepta `Integer`, se pueden agregar 1 y 2. En cambio, al leer solo se puede asumir `Object`.

#### Ejecución y salida real

```bash
javac Caja.java DemoGenericos.java
java DemoGenericos
```

Salida real observada (JDK 27, 2026-05-22):

```text
Hola
42
6.0
4.0
[1, 2]
```

#### Errores frecuentes

Usar raw types elimina la seguridad de compilación. La corrección es parametrizar siempre las colecciones y tipos genéricos.

Confundir `extends` y `super` produce errores de compilación o APIs rígidas. La regla PECS ayuda: si produce/lee, `extends`; si consume/escribe, `super`.

Intentar crear arreglos genéricos o usar `instanceof` con parámetros concretos choca con type erasure. En esos casos, suele ser mejor usar `List<T>` o diseñar la API para no depender del tipo genérico en runtime.

#### Verificación

La verificación consiste en compilar y ejecutar el ejemplo. Como prueba adicional, se puede intentar agregar `numeros.add(1)` dentro de `suma` y confirmar que el compilador lo rechaza.


### Tema 5: Comparable vs Comparator, e iteración · Intermedio · 40 min

Ordenar objetos parece simple hasta que aparece una segunda necesidad: a veces una persona debe ordenarse por edad, otras por nombre, otras por apellido y edad. Además, recorrer una colección mientras se modifica puede producir errores difíciles de ver. Este tema cubre los dos contratos de ordenación más comunes y las reglas básicas de iteración segura.

#### Comparable

**Comparable** es una interfaz que define el orden natural de un tipo mediante `compareTo(T)`. Se implementa cuando existe un orden obvio y estable para el objeto. Por ejemplo, si `Persona` se ordena por edad por defecto, la clase puede implementar `Comparable<Persona>`.

El método `compareTo` devuelve un valor negativo si el objeto actual es menor, cero si son iguales en ese criterio, y positivo si es mayor. No es necesario devolver -1 o 1 exactamente; basta con respetar el signo. Se debe evitar la resta directa de enteros cuando puede haber overflow; `Integer.compare` es más segura. El error común es definir un orden inconsistente con `equals` sin documentarlo. La verificación es ordenar una lista y comprobar el resultado.

#### Comparator

**Comparator** define un orden externo mediante `compare(a, b)`. Sirve cuando el orden no pertenece naturalmente al objeto o cuando hay varios criterios posibles. A diferencia de `Comparable`, no obliga a modificar la clase. Se puede crear un comparador con `Comparator.comparing(Persona::getNombre)` y componer criterios con `thenComparing`.

Se usa en reportes, vistas, tablas y casos donde el mismo tipo se ordena de formas distintas. No conviene forzar todos los ordenes posibles dentro de `compareTo`; eso vuelve rígida la clase. El error común es escribir comparadores complejos y frágiles cuando la API de composición ya expresa la intención. La verificación es ordenar la misma lista con dos comparadores y observar resultados distintos.

#### Iteración

La **iteración** es el recorrido de los elementos de una colección. `for-each` es claro para leer. `Iterator` permite recorrer y, además, eliminar el elemento actual de forma segura. En mapas, iterar sobre `entrySet()` es útil cuando se necesitan clave y valor.

Se usa `for-each` para lectura simple. Se usa `Iterator` cuando hay que eliminar durante el recorrido. El error común es modificar estructuralmente la colección con `remove` dentro de un `for-each`, lo que puede lanzar `ConcurrentModificationException`. La verificación es eliminar pares con `Iterator.remove()` y confirmar la colección final.

#### Fail-fast y `ConcurrentModificationException`

Muchas colecciones de Java son **fail-fast**: detectan modificaciones estructurales durante una iteración y lanzan `ConcurrentModificationException`. Este comportamiento no es una garantía absoluta en concurrencia, sino un mecanismo de detección temprana de errores. Su propósito es hacer visible un uso incorrecto.

No se debe capturar esta excepción para “seguir igual”. La corrección es cambiar la forma de iterar: usar `Iterator.remove()`, usar una colección concurrente adecuada o recopilar cambios para aplicarlos después. La verificación es provocar la excepción en una prueba controlada y luego corregirla con `Iterator`.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m2-t5 && cd /tmp/java-m2-t5
```

Creamos `Persona.java`:

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
    public int compareTo(Persona o) {
        return Integer.compare(this.edad, o.edad);
    }

    @Override
    public String toString() {
        return nombre + "(" + edad + ")";
    }
}
```

Y `DemoOrden.java`:

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
        System.out.println("Edad: " + personas);

        personas.sort(Comparator.comparing(Persona::getNombre));
        System.out.println("Nombre: " + personas);

        Map<String, Integer> stock = new HashMap<>();
        stock.put("A", 2);
        stock.put("B", 3);
        for (Map.Entry<String, Integer> e : new TreeMap<>(stock).entrySet()) {
            System.out.println(e.getKey() + "=" + e.getValue());
        }

        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) {
                it.remove();
            }
        }
        System.out.println(nums);
    }
}
```

#### Recorrido del código

`Persona` implementa `Comparable<Persona>` y define su orden natural por edad. `Collections.sort(personas)` usa ese orden. Después, `personas.sort(Comparator.comparing(Persona::getNombre))` aplica un orden externo por nombre sin modificar la clase.

El `TreeMap` se usa solo para imprimir el mapa en orden determinista por clave. El punto de iteración importante está en la lista `nums`: se recorre con `Iterator` y se eliminan los pares con `it.remove()`. Esta es la forma segura de eliminar durante la iteración.

#### Ejecución y salida real

```bash
javac Persona.java DemoOrden.java
java DemoOrden
```

Salida real observada (JDK 27, 2026-05-22):

```text
Edad: [Ada(36), Linus(55), Grace(85)]
Nombre: [Ada(36), Grace(85), Linus(55)]
A=2
B=3
[1, 3]
```

#### Errores frecuentes

Usar `list.remove(...)` dentro de un `for-each` suele provocar `ConcurrentModificationException`. La corrección es usar `Iterator.remove()`.

Implementar `compareTo` con resta de enteros puede fallar por overflow. `Integer.compare` evita ese problema.

Definir un orden natural que contradice la igualdad lógica puede causar comportamientos inesperados en colecciones ordenadas. Si se hace, debe ser una decisión consciente y documentada.

#### Verificación

La verificación consiste en ejecutar el ejemplo y confirmar los dos órdenes y la lista final `[1, 3]`. Como prueba adicional, se puede agregar `.reversed()` al comparador de nombres.


### Tema 6: Colas y pilas: Queue, Deque, ArrayDeque y PriorityQueue · Intermedio · 40 min

No todas las colecciones se usan de la misma manera. A veces el primer elemento que entra debe ser el primero en salir; otras veces, el último en entrar debe salir primero. En otros casos, lo importante no es el orden de llegada sino la prioridad. Java modela estos comportamientos con `Queue`, `Deque` y `PriorityQueue`.

#### Queue

Una **Queue** es una cola: normalmente sigue la política FIFO, *first in, first out*. Sirve para procesar elementos en orden de llegada, como tareas pendientes, mensajes o eventos. La interfaz `Queue` define operaciones como `offer`, `poll` y `peek`. `offer` intenta agregar un elemento; `poll` extrae y elimina la cabeza, devolviendo `null` si la cola está vacía; `peek` consulta la cabeza sin eliminarla.

Se usa cuando el orden de procesamiento es el de llegada. No conviene usarla si el problema requiere prioridad o acceso por ambos extremos. El error común es usar `remove` o `element` sin considerar que lanzan excepción cuando la cola está vacía, mientras que `poll` y `peek` ofrecen un comportamiento más seguro.

#### Deque y ArrayDeque

Un **Deque** es una cola doble: permite insertar y extraer por ambos extremos. Puede comportarse como cola FIFO o como pila LIFO. **ArrayDeque** es una implementación eficiente de `Deque`, basada en arreglo redimensionable. Es la opción recomendada en Java moderno para pilas y colas de uso general en memoria.

Como pila, `ArrayDeque` usa `push`, `pop` y `peek`. Como cola, puede usar `offerLast`/`pollFirst` o las operaciones de `Queue`. No permite elementos `null`, porque `null` se usa en algunas operaciones para indicar ausencia. El error común es usar `Stack`, una clase antigua sincronizada, cuando `ArrayDeque` es más adecuada para la mayoría de casos de un solo hilo.

#### PriorityQueue

Una **PriorityQueue** es una cola donde el elemento extraído primero es el de mayor prioridad según el orden natural o un `Comparator`. No es FIFO. Internamente se implementa como heap, por lo que obtener la cabeza tiene costo bajo, pero la iteración no devuelve los elementos ordenados.

Se usa cuando lo importante es procesar primero el elemento más urgente, menor, mayor o con mayor prioridad. No conviene usarla cuando se espera recorrerla y obtener orden total; para eso se debe extraer con `poll` o usar una lista ordenada. El error común es iterar la `PriorityQueue` y asumir que el orden de iteración es el orden de prioridad. La verificación es extraer elementos con `poll` y observar el orden real.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m2-t6 && cd /tmp/java-m2-t6
```

Creamos `DemoColas.java`:

```java
import java.util.*;

public class DemoColas {
    public static void main(String[] args) {
        Queue<String> cola = new ArrayDeque<>();
        cola.offer("A");
        cola.offer("B");
        cola.offer("C");
        System.out.println(cola.poll());
        System.out.println(cola.peek());

        Deque<String> pila = new ArrayDeque<>();
        pila.push("uno");
        pila.push("dos");
        pila.push("tres");
        System.out.println(pila.pop());
        System.out.println(pila.peek());

        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(30);
        pq.offer(10);
        pq.offer(20);
        System.out.println(pq.poll());
        System.out.println(pq.poll());
        System.out.println(pq.poll());
    }
}
```

#### Recorrido del código

La primera estructura se usa como `Queue`. Se agregan `A`, `B` y `C`; `poll()` extrae `A`, que fue el primero en entrar. `peek()` muestra `B`, que ahora es la cabeza, sin eliminarla.

La segunda estructura es la misma clase `ArrayDeque`, pero usada como pila. `push` coloca elementos en la cima. Al hacer `pop()`, sale `tres`, el último que entró. `peek()` muestra `dos`.

La `PriorityQueue` recibe 30, 10 y 20. Al extraer con `poll()`, devuelve 10, luego 20 y luego 30, porque el orden natural de los enteros define la prioridad más baja primero. Si se necesitara la prioridad inversa, se pasaría `Comparator.reverseOrder()`.

#### Ejecución y salida real

```bash
javac DemoColas.java
java DemoColas
```

Salida real observada (JDK 27, 2026-05-22):

```text
A
B
tres
dos
10
20
30
```

#### Errores frecuentes

Usar `Stack` por hábito en código nuevo suele ser innecesario. `ArrayDeque` es más adecuada para pilas y colas en un solo hilo.

Asumir que `PriorityQueue` está ordenada al iterarla es un error. El orden garantizado es el de extracción por `poll()`.

Usar `remove()` sobre una cola vacía puede lanzar excepción. Si el caso vacío es normal, `poll()` es más seguro.

#### Verificación

La verificación consiste en ejecutar el ejemplo y confirmar el orden FIFO de la cola, LIFO de la pila y por prioridad de la `PriorityQueue`.

### Tema 7: Incremento del proyecto: preparar guías asignables · Intermedio · 25 min

Los conceptos de colecciones se consolidan cuando se usan juntos para resolver un problema pequeño pero real. Supongamos que necesitamos un repositorio en memoria de guías de envío. Debe conservar el historial de inserción, evitar códigos duplicados y permitir búsqueda rápida por código. Este problema obliga a combinar `List`, `Set` y `Map`.

#### Diseño con varias colecciones

El **repositorio en memoria** es una estructura que guarda datos durante la ejecución del programa, sin persistencia externa. Sirve para prototipos, pruebas, ejercicios y capas simples antes de introducir una base de datos. Su límite es claro: al terminar el proceso, los datos se pierden.

Usar una sola colección obliga a compromisos. Una `List` conserva historial, pero detectar duplicados o buscar por código requiere recorrido. Un `Set` evita duplicados, pero no asocia estado completo ni conserva el modelo que queremos. Un `Map` busca rápido por código, pero por sí solo no expresa el historial de inserción como lista. La solución es usar cada estructura por su fortaleza, manteniendo la coherencia entre ellas.

#### Invariantes del repositorio

El repositorio tiene tres invariantes: el historial conserva el orden de alta; no se aceptan dos guías con el mismo código; y la búsqueda por código devuelve la guía registrada. Cualquier operación de alta debe actualizar todas las estructuras involucradas. Si solo se actualiza una, el repositorio queda inconsistente.

También conviene exponer el historial como copia inmodificable con `List.copyOf(...)`. Así, quien consulta no puede alterar la estructura interna por accidente. El error común es devolver la lista interna directamente y permitir modificaciones externas.

#### Ejemplo desde cero

```bash
mkdir -p /tmp/java-m2-t7 && cd /tmp/java-m2-t7
```

Creamos `RepoGuias.java`:

```java
import java.util.*;

record Guia(String codigo, String estado) {}

class GuiaRepository {
    private final List<Guia> historial = new ArrayList<>();
    private final Set<String> codigos = new HashSet<>();
    private final Map<String, Guia> porCodigo = new HashMap<>();

    boolean agregar(Guia guia) {
        if (!codigos.add(guia.codigo())) {
            return false;
        }
        historial.add(guia);
        porCodigo.put(guia.codigo(), guia);
        return true;
    }

    List<Guia> historial() {
        return List.copyOf(historial);
    }

    Optional<Guia> buscar(String codigo) {
        return Optional.ofNullable(porCodigo.get(codigo));
    }

    int totalUnicos() {
        return codigos.size();
    }
}

public class RepoGuias {
    public static void main(String[] args) {
        GuiaRepository repo = new GuiaRepository();
        System.out.println(repo.agregar(new Guia("G1", "CREADA")));
        System.out.println(repo.agregar(new Guia("G2", "EN_RUTA")));
        System.out.println(repo.agregar(new Guia("G1", "DUPLICADA")));
        System.out.println(repo.totalUnicos());
        System.out.println(repo.buscar("G2").orElseThrow());
        System.out.println(repo.historial().size());
    }
}
```

#### Recorrido del código

`Guia` es un record porque representa un dato simple. El repositorio mantiene tres estructuras: `historial` en una `ArrayList` para conservar el orden, `codigos` en un `HashSet` para detectar duplicados con eficiencia, y `porCodigo` en un `HashMap` para buscar por código.

El método `agregar` usa `codigos.add(...)` como guardia. `Set.add` devuelve `false` si el elemento ya existía. En ese caso, el método termina sin modificar las otras estructuras. Si el código es nuevo, se agrega al historial y al mapa. Así se preservan los invariantes.

`historial()` devuelve `List.copyOf(historial)`, evitando que el exterior modifique la lista interna. `buscar` devuelve `Optional<Guia>` para hacer explícita la posibilidad de ausencia.

#### Ejecución y salida real

```bash
javac --release 21 RepoGuias.java
java RepoGuias
```

Salida real observada (JDK 27, 2026-05-22):

```text
true
true
false
2
Guia[codigo=G2, estado=EN_RUTA]
2
```

#### Errores frecuentes

Actualizar solo una de las estructuras deja el repositorio inconsistente. Toda alta exitosa debe tocar historial, set y mapa.

Devolver la lista interna permite que código externo haga `repo.historial().clear()` o agregue elementos sin pasar por las reglas. `List.copyOf` evita ese problema.

Usar solo `List` y recorrer para detectar duplicados funciona en ejemplos pequeños, pero expresa mal la intención y escala peor. El `Set` hace explícita la regla de unicidad.

#### Verificación

La verificación consiste en ejecutar el ejemplo y confirmar que el tercer alta devuelve `false`, que el total de únicos es 2 y que la búsqueda por `G2` devuelve la guía correcta.

## Cierre del módulo

Este módulo mostró que elegir una colección es elegir un contrato. `List`, `Set` y `Map` expresan intenciones distintas; `equals` y `hashCode` sostienen el comportamiento de las estructuras hash; las claves mutables pueden romper un `HashMap`; los genéricos y wildcards permiten APIs seguras y flexibles; `Comparable` y `Comparator` separan orden natural de orden contextual; y `Queue`, `Deque` y `PriorityQueue` modelan formas distintas de consumo. El criterio final no es memorizar clases, sino saber qué garantía necesita el problema.
