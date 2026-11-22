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

**Definición formal.** Una clave mutable es un objeto cuyo estado puede cambiar después de su creación. Es peligrosa como clave hash cuando los campos mutados participan en `equals`/`hashCode`.

**Para qué sirve entenderlo.** Permite evitar bugs donde `HashMap` o `HashSet` parecen “perder” elementos. La estructura hash calcula el bucket con el hash vigente al operar; si la identidad cambia, la búsqueda va al bucket equivocado.

**Cuándo usar/no usar.** No uses como clave hash un objeto cuyos campos de identidad puedan mutar mientras esté en la estructura. Usa claves inmutables (`String`, `Integer`, `record`, UUID) o campos `final`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t3-mutable && cd /tmp/java-m2-t3-mutable
```

```java
import java.util.*;
class K { String c; K(String c){this.c=c;} void setC(String c){this.c=c;}
  @Override public boolean equals(Object o){ return o instanceof K k && Objects.equals(c,k.c); }
  @Override public int hashCode(){ return Objects.hash(c); }
}
public class DemoMutable {
    public static void main(String[] args) {
        Map<K,String> m = new HashMap<>();
        K k = new K("A1"); m.put(k, "V");
        k.setC("B2");
        System.out.println(m.get(k));
    }
}
```

**Caso de uso real.** Una entidad de dominio mutable se usa accidentalmente como clave de caché; tras actualizar su ID/campo, la caché deja de encontrarla.

**Error común.** Agregar setter a campos usados en `equals/hashCode`. Síntoma: `get` devuelve `null` aunque “la clave está ahí”. Corrección: hacer la identidad inmutable.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoMutable.java
java DemoMutable
```

```text
null
```

#### El mapa que pierde entradas

**Definición formal.** Es el síntoma de una clave hash mutada: la entrada permanece en la estructura interna, pero no es localizable por el hash actual. Afecta `get`, `containsKey`, `remove`.

**Para qué sirve entenderlo.** Permite diagnosticar por qué una entrada aparece al iterar el mapa pero no se encuentra por clave.

**Cuándo ocurre / cómo evitarlo.** Ocurre tras mutar campos de identidad de una clave ya insertada. Evítalo eliminando antes de mutar y reinsertando después, o usando claves inmutables.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t3-perdido && cd /tmp/java-m2-t3-perdido
```

```java
import java.util.*;
class K2 { String c; K2(String c){this.c=c;} void setC(String c){this.c=c;}
  @Override public boolean equals(Object o){ return o instanceof K2 k && Objects.equals(c,k.c); }
  @Override public int hashCode(){ return Objects.hash(c); }
  @Override public String toString(){ return "K2{" + c + "}"; }
}
public class DemoPerdido {
    public static void main(String[] args) {
        Map<K2,String> m = new HashMap<>();
        K2 k = new K2("A1"); m.put(k, "V");
        k.setC("B2");
        System.out.println(m.get(new K2("A1")));
        System.out.println(m);
    }
}
```

**Caso de uso real.** Un bug de sesión donde el usuario sigue “logueado” en memoria pero no se encuentra por su clave actual.

**Error común.** Confiar en que `HashMap` se reorganiza solo. Síntoma: `containsKey` falso pero la entrada aparece en un dump/log. Corrección: no mutar la clave; si hay que cambiarla, remove+put.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoPerdido.java
java DemoPerdido
```

```text
null
{K2{B2}=V}
```

#### Identidad estable

**Definición formal.** La identidad estable significa que los campos usados por `equals` y `hashCode` no cambian mientras el objeto está en una estructura hash. Puede lograrse con inmutabilidad total o con campos de identidad `final`.

**Para qué sirve.** Mantiene el contrato de las estructuras hash y evita búsquedas imposibles.

**Cuándo usarla y cuándo no.** Úsala siempre para claves de `HashMap`/elementos de `HashSet`. Si el objeto de dominio debe mutar, usa como clave un identificador inmutable separado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t3-estable && cd /tmp/java-m2-t3-estable
```

```java
import java.util.*;
record K3(String c) {}
public class DemoEstable {
    public static void main(String[] args) {
        Map<K3,String> m = new HashMap<>();
        m.put(new K3("A1"), "V");
        System.out.println(m.get(new K3("A1")));
    }
}
```

**Caso de uso real.** Usar un `record` o un `String` ID como clave de caché en vez de la entidad mutable completa.

**Error común.** Usar entidad JPA mutable como clave hash. Síntoma: comportamiento inconsistente tras cambios de estado. Corrección: usar ID inmutable.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoEstable.java
java DemoEstable
```

```text
V
```

#### Ejemplo integrado desde cero

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

`ClaveMutable` usa `codigo` en `equals/hashCode`, pero también lo expone con setter. Tras insertar, la entrada queda en el bucket de `A1`. Al mutar a `B2`, las consultas van al bucket de `B2`, por eso `get` devuelve `null`. La iteración muestra que la entrada sigue en la estructura, con la clave ya mutada.

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

Mutar campos de identidad hash mientras el objeto está en `HashMap/HashSet`. Corrección: identidad inmutable.

Intentar “arreglar” consultando de otra forma sin reinsertar. Corrección: remove, mutar, put; o evitar la mutación.

#### Verificación

Ejecutar el integrado y confirmar la contradicción: `get` da `null` pero el contenido real contiene la entrada. Hacer `codigo` `final` elimina el riesgo en compilación.

### Tema 4: Genéricos, wildcards y type erasure · Intermedio · 45 min

Antes de los genéricos, las colecciones guardaban `Object`. Eso permitía mezclar tipos y solo descubríamos el error en tiempo de ejecución, al hacer un cast inválido. Los genéricos mueven ese error a la compilación. Al mismo tiempo, introducen reglas propias: invariancia, wildcards y borrado de tipos.

#### Genéricos

**Definición formal.** Los genéricos parametrizan clases, interfaces y métodos con tipos (`class Caja<T>`, `<T> T id(T x)`). El tipo concreto se especifica al usar la API.

**Para qué sirve.** Dan seguridad de tipos en compilación y reutilización sin casts manuales.

**Cuándo usarlo y cuándo no.** Úsalo en colecciones, contenedores, repositorios y utilidades. No uses raw types (`List` sin `<T>`), porque desactivan verificación de tipos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t4-genericos && cd /tmp/java-m2-t4-genericos
```

```java
class Caja<T> {
    private T valor;
    Caja(T valor) { this.valor = valor; }
    T getValor() { return valor; }
}
public class DemoGenericos {
    public static void main(String[] args) {
        System.out.println(new Caja<String>("Hola").getValor());
        System.out.println(new Caja<Integer>(42).getValor());
    }
}
```

**Caso de uso real.** `Repositorio<Usuario, Long>` o respuestas `ApiResponse<T>` evitan casts y errores de tipo.

**Error común.** Usar `List` raw. Síntoma: `ClassCastException` en runtime. Corrección: parametrizar siempre (`List<String>`).

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoGenericos.java
java DemoGenericos
```

```text
Hola
42
```

#### Wildcards

**Definición formal.** Un wildcard `?` representa un tipo desconocido. `? extends T` acepta `T` o subtipos (lectura como `T`). `? super T` acepta `T` o supertipos (escritura de `T`).

**Para qué sirve.** Permite APIs flexibles sobre jerarquías de tipos. La regla PECS guía: Producer Extends, Consumer Super.

**Cuándo usarlo y cuándo no.** Usa `extends` cuando el método lee; `super` cuando escribe. No intentes agregar a `List<? extends Number>`: el tipo concreto es desconocido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t4-wildcards && cd /tmp/java-m2-t4-wildcards
```

```java
import java.util.*;
public class DemoWildcards {
    static double suma(List<? extends Number> nums) {
        double t = 0;
        for (Number n : nums) t += n.doubleValue();
        return t;
    }
    static void agregar(List<? super Integer> dst) { dst.add(1); }
    public static void main(String[] args) {
        System.out.println(suma(List.of(1, 2, 3)));
        List<Number> dst = new ArrayList<>();
        agregar(dst);
        System.out.println(dst);
    }
}
```

**Caso de uso real.** Un método de agregación acepta `List<Integer>` o `List<Double>` sin duplicar código.

**Error común.** Confundir `extends`/`super`. Síntoma: el compilador rechaza `add` o obliga a leer como `Object`. Corrección: aplicar PECS.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoWildcards.java
java DemoWildcards
```

```text
6.0
[1]
```

#### Type erasure

**Definición formal.** Type erasure es el borrado de información genérica en tiempo de ejecución. El compilador inserta checks/casts; en runtime, `List<String>` y `List<Integer>` comparten la misma clase `List`.

**Para qué sirve.** Mantiene compatibilidad binaria con Java anterior a genéricos.

**Cuándo tenerlo en cuenta.** Al diseñar APIs: no puedes hacer `new T()`, `new T[]`, ni `instanceof List<String>`. Los genéricos son principalmente una garantía de compilación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t4-erasure && cd /tmp/java-m2-t4-erasure
```

```java
import java.util.*;
public class DemoErasure {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>();
        List<Integer> b = new ArrayList<>();
        System.out.println(a.getClass() == b.getClass());
    }
}
```

**Caso de uso real.** Al depurar o usar reflexión, recordar que el tipo parametrizado no está disponible como tal en runtime.

**Error común.** Esperar `instanceof List<String>`. Síntoma: error de compilación. Corrección: diseñar sin depender del parámetro genérico en runtime, o pasar `Class<T>`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoErasure.java
java DemoErasure
```

```text
true
```

#### Ejemplo integrado desde cero

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
        for (Number n : numeros) total += n.doubleValue();
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

`Caja<T>` demuestra genéricos: el mismo tipo `T` fluye por constructor, campo y getter. `suma` usa `? extends Number` porque solo lee. `agregarUnoADos` usa `? super Integer` porque escribe enteros. En runtime, el borrado elimina los parámetros de tipo.

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

Usar raw types pierde seguridad de compilación. Confundir PECS causa errores de compilación o APIs rígidas. Asumir que el genérico existe en runtime lleva a diseños imposibles.

#### Verificación

Compilar y ejecutar el integrado; confirmar las salidas. Probar que `numeros.add(1)` dentro de `suma` no compila.

### Tema 5: Comparable vs Comparator, e iteración · Intermedio · 40 min

Ordenar objetos parece simple hasta que aparece una segunda necesidad: a veces una persona debe ordenarse por edad, otras por nombre. Además, recorrer una colección mientras se modifica puede producir errores. Este tema cubre los contratos de ordenación e iteración segura.

#### Comparable

**Definición formal.** `Comparable<T>` define el orden natural de un tipo mediante `compareTo(T)`. Devuelve negativo, cero o positivo según si el objeto actual es menor, igual o mayor en ese criterio.

**Para qué sirve.** Da un orden por defecto al tipo, útil para `Collections.sort`, `TreeSet` o `TreeMap`.

**Cuándo usarlo y cuándo no.** Úsalo cuando exista un orden natural obvio y estable. No fuerces múltiples órdenes en `compareTo`; para eso usa `Comparator`. Evita restar enteros por riesgo de overflow; usa `Integer.compare`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t5-comparable && cd /tmp/java-m2-t5-comparable
```

```java
import java.util.*;
class Persona implements Comparable<Persona> {
    final String nombre; final int edad;
    Persona(String nombre, int edad) { this.nombre = nombre; this.edad = edad; }
    @Override public int compareTo(Persona o) { return Integer.compare(this.edad, o.edad); }
    @Override public String toString() { return nombre + "(" + edad + ")"; }
}
public class DemoComparable {
    public static void main(String[] args) {
        List<Persona> p = new ArrayList<>(List.of(new Persona("Linus",55), new Persona("Ada",36)));
        Collections.sort(p);
        System.out.println(p);
    }
}
```

**Caso de uso real.** `LocalDate`, `Integer` y `String` tienen orden natural; entidades de dominio pueden definir uno si es claro.

**Error común.** Usar resta `a - b` en `compareTo`. Síntoma: overflow en enteros extremos. Corrección: `Integer.compare(a,b)`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoComparable.java
java DemoComparable
```

```text
[Ada(36), Linus(55)]
```

#### Comparator

**Definición formal.** `Comparator<T>` define un orden externo mediante `compare(a,b)`. Se puede crear con lambdas o `Comparator.comparing(...)`, y componer con `thenComparing`.

**Para qué sirve.** Permite ordenar el mismo tipo por distintos criterios sin modificar la clase.

**Cuándo usarlo y cuándo no.** Úsalo cuando el orden depende del contexto (UI, reporte, API). No dupliques lógica de comparación compleja si la API de composición la expresa claramente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t5-comparator && cd /tmp/java-m2-t5-comparator
```

```java
import java.util.*;
class P {
    final String nombre; final int edad;
    P(String nombre, int edad) { this.nombre = nombre; this.edad = edad; }
    String getNombre() { return nombre; }
    @Override public String toString() { return nombre; }
}
public class DemoComparator {
    public static void main(String[] args) {
        List<P> p = new ArrayList<>(List.of(new P("Linus",55), new P("Ada",36)));
        p.sort(Comparator.comparing(P::getNombre));
        System.out.println(p);
    }
}
```

**Caso de uso real.** Ordenar productos por precio en una vista y por nombre en otra, usando el mismo modelo.

**Error común.** Escribir un `Comparator` que contradice la igualdad lógica esperada por `TreeSet/TreeMap`. Síntoma: elementos “desaparecen” por considerarse iguales. Corrección: revisar consistencia del criterio.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoComparator.java
java DemoComparator
```

```text
[Ada, Linus]
```

#### Iteración e Iterator

**Definición formal.** La iteración recorre una colección. `Iterator` permite recorrer y eliminar el elemento actual con `remove()`. `for-each` es azúcar para lectura simple.

**Para qué sirve.** `Iterator.remove()` permite modificar la colección durante el recorrido de forma segura.

**Cuándo usarlo y cuándo no.** Usa `for-each` para lectura. Usa `Iterator` cuando necesites eliminar durante la iteración. No uses `collection.remove(...)` dentro de `for-each` sobre la misma colección.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t5-iterator && cd /tmp/java-m2-t5-iterator
```

```java
import java.util.*;
public class DemoIteracion {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1,2,3,4));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) it.remove();
        }
        System.out.println(nums);
    }
}
```

**Caso de uso real.** Limpiar elementos inválidos de una lista en memoria antes de persistirlos.

**Error común.** Modificar la colección en `for-each`. Síntoma: `ConcurrentModificationException`. Corrección: `Iterator.remove()` o recopilar cambios.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoIteracion.java
java DemoIteracion
```

```text
[1, 3]
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m2-t5 && cd /tmp/java-m2-t5
```

Creamos `Persona.java`:

```java
public class Persona implements Comparable<Persona> {
    private final String nombre;
    private final int edad;
    public Persona(String nombre, int edad) { this.nombre = nombre; this.edad = edad; }
    public String getNombre() { return nombre; }
    public int getEdad() { return edad; }
    @Override public int compareTo(Persona o) { return Integer.compare(this.edad, o.edad); }
    @Override public String toString() { return nombre + "(" + edad + ")"; }
}
```

Y `DemoOrden.java`:

```java
import java.util.*;
public class DemoOrden {
    public static void main(String[] args) {
        List<Persona> personas = new ArrayList<>(List.of(
            new Persona("Linus", 55), new Persona("Ada", 36), new Persona("Grace", 85)));
        Collections.sort(personas);
        System.out.println("Edad: " + personas);
        personas.sort(Comparator.comparing(Persona::getNombre));
        System.out.println("Nombre: " + personas);
        List<Integer> nums = new ArrayList<>(List.of(1,2,3,4));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) { if (it.next() % 2 == 0) it.remove(); }
        System.out.println(nums);
    }
}
```

#### Recorrido del código

`Comparable` define el orden natural por edad. `Comparator.comparing` aplica un orden externo por nombre. `Iterator.remove()` elimina pares sin `ConcurrentModificationException`.

#### Ejecución y salida real

```bash
javac Persona.java DemoOrden.java
java DemoOrden
```

Salida real observada (JDK 27, 2026-05-22):

```text
Edad: [Ada(36), Linus(55), Grace(85)]
Nombre: [Ada(36), Grace(85), Linus(55)]
[1, 3]
```

#### Errores frecuentes

Confundir orden natural con orden contextual. Usar `for-each` para eliminar. Escribir `compareTo` con resta de enteros.

#### Verificación

Ejecutar el integrado y confirmar los dos órdenes y la lista `[1, 3]`.

### Tema 6: Colas y pilas: Queue, Deque, ArrayDeque y PriorityQueue · Intermedio · 40 min

No todas las colecciones se usan igual. A veces el primer elemento en entrar debe salir primero; otras, el último en entrar sale primero; en otros casos importa la prioridad. Java modela estos comportamientos con `Queue`, `Deque` y `PriorityQueue`.

#### Queue

**Definición formal.** `Queue` representa una cola, normalmente FIFO. Operaciones típicas: `offer` (agrega), `poll` (extrae cabeza o `null`), `peek` (consulta cabeza o `null`).

**Para qué sirve.** Procesar elementos en orden de llegada: tareas, mensajes, eventos.

**Cuándo usarla y cuándo no.** Úsala cuando el orden de procesamiento sea de llegada. No la uses si necesitas prioridad o acceso por ambos extremos. Prefiere `offer/poll/peek` sobre `add/remove/element` cuando la cola vacía es un caso normal.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t6-queue && cd /tmp/java-m2-t6-queue
```

```java
import java.util.*;
public class DemoQueue {
    public static void main(String[] args) {
        Queue<String> q = new ArrayDeque<>();
        q.offer("A"); q.offer("B");
        System.out.println(q.poll());
        System.out.println(q.peek());
    }
}
```

**Caso de uso real.** Cola de trabajos en memoria para procesar pedidos en orden de llegada.

**Error común.** Usar `remove()` en cola vacía. Síntoma: `NoSuchElementException`. Corrección: `poll()` y manejo de `null`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoQueue.java
java DemoQueue
```

```text
A
B
```

#### Deque y ArrayDeque

**Definición formal.** `Deque` es una cola doble: permite insertar y extraer por ambos extremos. `ArrayDeque` es una implementación de arreglo redimensionable, eficiente y normalmente preferida para pilas/colas en memoria.

**Para qué sirve.** Como cola FIFO o como pila LIFO (`push/pop/peek`). Es la alternativa moderna a `Stack`.

**Cuándo usarlo y cuándo no.** Úsalo para pilas y colas de un solo hilo. No inserta `null`. No lo uses si necesitas concurrencia bloqueante (ahí aplica `BlockingQueue`/`BlockingDeque`).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t6-deque && cd /tmp/java-m2-t6-deque
```

```java
import java.util.*;
public class DemoDeque {
    public static void main(String[] args) {
        Deque<String> pila = new ArrayDeque<>();
        pila.push("uno"); pila.push("dos");
        System.out.println(pila.pop());
        System.out.println(pila.peek());
    }
}
```

**Caso de uso real.** Pila de deshacer/rehacer o evaluación de expresiones.

**Error común.** Usar `Stack` por hábito. Síntoma: sincronización innecesaria y API antigua. Corrección: `ArrayDeque`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoDeque.java
java DemoDeque
```

```text
dos
uno
```

#### PriorityQueue

**Definición formal.** `PriorityQueue` es una cola cuya cabeza es el elemento con mayor prioridad según orden natural o `Comparator`. No es FIFO. La iteración no garantiza orden ordenado.

**Para qué sirve.** Procesar primero lo más urgente/importante, no lo más antiguo.

**Cuándo usarla y cuándo no.** Úsala cuando la extracción por prioridad sea el requisito. No la iteres esperando orden total; usa `poll()` para consumir en orden de prioridad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t6-priority && cd /tmp/java-m2-t6-priority
```

```java
import java.util.*;
public class DemoPriority {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(30); pq.offer(10); pq.offer(20);
        System.out.println(pq.poll());
        System.out.println(pq.poll());
        System.out.println(pq.poll());
    }
}
```

**Caso de uso real.** Planificador donde tareas con menor deadline o mayor prioridad se atienden primero.

**Error común.** Iterar `PriorityQueue` y asumir orden. Síntoma: resultados aparentemente desordenados. Corrección: extraer con `poll()`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoPriority.java
java DemoPriority
```

```text
10
20
30
```

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m2-t6 && cd /tmp/java-m2-t6
```

Creamos `DemoColas.java`:

```java
import java.util.*;

public class DemoColas {
    public static void main(String[] args) {
        Queue<String> cola = new ArrayDeque<>();
        cola.offer("A"); cola.offer("B"); cola.offer("C");
        System.out.println(cola.poll());
        System.out.println(cola.peek());

        Deque<String> pila = new ArrayDeque<>();
        pila.push("uno"); pila.push("dos"); pila.push("tres");
        System.out.println(pila.pop());
        System.out.println(pila.peek());

        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(30); pq.offer(10); pq.offer(20);
        System.out.println(pq.poll());
        System.out.println(pq.poll());
        System.out.println(pq.poll());
    }
}
```

#### Recorrido del código

La cola usa FIFO con `offer/poll/peek`. La pila usa LIFO con `push/pop/peek` sobre `ArrayDeque`. La `PriorityQueue` extrae por orden natural, no por llegada.

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

Usar la estructura equivocada cambia la semántica del sistema. `Stack` es legado; `ArrayDeque` es la opción moderna. `PriorityQueue` no garantiza orden al iterar.

#### Verificación

Ejecutar el integrado y confirmar FIFO, LIFO y orden por prioridad.

### Tema 7: Incremento del proyecto: preparar guías asignables · Intermedio · 25 min

Los conceptos de colecciones se consolidan cuando se usan juntos. Necesitamos un repositorio en memoria de guías de envío: conservar historial de alta, evitar códigos duplicados y buscar rápido por código. El problema obliga a combinar `List`, `Set` y `Map`.

#### Repositorio en memoria con varias colecciones

**Definición formal.** Un repositorio en memoria guarda datos durante la ejecución del proceso, sin persistencia externa. Puede combinar estructuras según el contrato requerido.

**Para qué sirve.** Permite prototipos, tests y capas simples antes de introducir base de datos. Cada colección aporta una garantía: `List` historial, `Set` unicidad, `Map` búsqueda por clave.

**Cuándo usarlo y cuándo no.** Úsalo cuando los datos son temporales o el alcance es didáctico/local. No lo uses como persistencia durable o compartida entre procesos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t7-repo && cd /tmp/java-m2-t7-repo
```

```java
import java.util.*;
public class DemoRepo {
    public static void main(String[] args) {
        List<String> historial = new ArrayList<>();
        Set<String> codigos = new HashSet<>();
        Map<String, String> porCodigo = new HashMap<>();
        String id = "G1";
        if (codigos.add(id)) { historial.add(id); porCodigo.put(id, "CREADA"); }
        System.out.println(historial);
        System.out.println(porCodigo.get("G1"));
    }
}
```

**Caso de uso real.** Caché local de entidades durante una importación por lotes, con índice por ID.

**Error común.** Usar solo `List` y recorrer para todo. Síntoma: código lento y confuso. Corrección: elegir colecciones por contrato.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoRepo.java
java DemoRepo
```

```text
[G1]
CREADA
```

#### Invariantes y consistencia

**Definición formal.** Un invariante es una condición que debe mantenerse siempre verdadera. Aquí: historial en orden de alta, sin códigos duplicados, búsqueda por código coherente.

**Para qué sirve.** Evita estados parciales: si una operación de alta modifica solo una estructura, el repositorio queda inconsistente.

**Cuándo aplicarlo.** En toda operación que muta estado. La operación debe ser atómica a nivel lógico: agregar a todas o a ninguna.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t7-invariante && cd /tmp/java-m2-t7-invariante
```

```java
import java.util.*;
public class DemoInvariante {
    public static void main(String[] args) {
        Set<String> codigos = new HashSet<>();
        List<String> historial = new ArrayList<>();
        System.out.println(codigos.add("G1"));
        if (codigos.add("G1") == false) System.out.println("duplicado");
        else historial.add("G1");
        System.out.println(historial.size());
    }
}
```

**Caso de uso real.** Evitar doble alta de guía por reintento de red.

**Error común.** Actualizar `Map` pero olvidar `Set` o `List`. Síntoma: duplicados o búsquedas inconsistentes. Corrección: centralizar la mutación en un solo método.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoInvariante.java
java DemoInvariante
```

```text
true
duplicado
1
```

#### Encapsulación de la colección

**Definición formal.** Encapsular la colección interna significa no exponerla directamente para modificación externa. `List.copyOf` o `Collections.unmodifiableList` protegen la representación interna.

**Para qué sirve.** Preserva invariantes y evita que clientes alteren el estado sin pasar por reglas.

**Cuándo usarlo.** Siempre que expongas colecciones internas de un objeto de dominio/repositorio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m2-t7-encapsula && cd /tmp/java-m2-t7-encapsula
```

```java
import java.util.*;
public class DemoEncapsula {
    public static void main(String[] args) {
        List<String> interna = new ArrayList<>(List.of("G1"));
        List<String> vista = List.copyOf(interna);
        try { vista.add("G2"); }
        catch (UnsupportedOperationException e) { System.out.println("inmodificable"); }
    }
}
```

**Caso de uso real.** Un repositorio devuelve historial solo lectura a la capa de UI/servicio.

**Error común.** Retornar la lista interna mutable. Síntoma: clientes pueden `clear()` o `add()` sin validación. Corrección: copia inmodificable o vista no modificable.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac DemoEncapsula.java
java DemoEncapsula
```

```text
inmodificable
```

#### Ejemplo integrado desde cero

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
        if (!codigos.add(guia.codigo())) return false;
        historial.add(guia);
        porCodigo.put(guia.codigo(), guia);
        return true;
    }

    List<Guia> historial() { return List.copyOf(historial); }
    Optional<Guia> buscar(String codigo) { return Optional.ofNullable(porCodigo.get(codigo)); }
    int totalUnicos() { return codigos.size(); }
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

`Guia` es un record de valor. `agregar` usa `codigos.add` como guardia de unicidad; solo si es nuevo actualiza `historial` y `porCodigo`. `historial()` devuelve copia inmodificable. `buscar` expone ausencia con `Optional`.

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

Actualizar solo parte de las estructuras rompe invariantes. Exponer la lista interna permite mutaciones externas. Usar `List` para todo oculta la intención de unicidad y búsqueda.

#### Verificación

Ejecutar el integrado y confirmar el rechazo del duplicado, total 2, búsqueda por `G2` y tamaño de historial 2.

## Cierre del módulo

Este módulo mostró que elegir una colección es elegir un contrato. `List`, `Set` y `Map` expresan intenciones distintas; `equals` y `hashCode` sostienen el comportamiento de las estructuras hash; las claves mutables pueden romper un `HashMap`; los genéricos y wildcards permiten APIs seguras y flexibles; `Comparable` y `Comparator` separan orden natural de orden contextual; y `Queue`, `Deque` y `PriorityQueue` modelan formas distintas de consumo. El criterio final no es memorizar clases, sino saber qué garantía necesita el problema.
