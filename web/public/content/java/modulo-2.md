# Módulo 2: Colecciones y genéricos

En el módulo anterior Tienda Aurora ya tenía productos, descuentos y pagos modelados como objetos. El siguiente problema aparece en cuanto la tienda crece: hay que guardar productos en orden de alta, evitar SKUs duplicados, consultar por etiqueta, atender pedidos por prioridad, paginar resultados y deshacer la última atención. Un arreglo no expresa ninguna de esas intenciones. Una `ArrayList` usada para todo tampoco: funciona al principio y después empiezan los bugs sutiles —duplicados silenciosos, búsquedas lineales por todas partes, claves que “desaparecen” de un mapa, comparaciones que no dicen qué orden significan.

Las colecciones de Java son estructuras de datos con contratos. Elegir una colección es elegir un comportamiento: ¿importa el orden? ¿se permiten duplicados? ¿se busca por posición o por clave? ¿la unicidad depende de `equals`? ¿el orden lo define la inserción, un orden natural o un comparador? Los genéricos completan la imagen: permiten que ese contrato se exprese con tipos reales (`Map<Sku, Producto>`) en lugar de `Object`, y dejan que el compilador detecte errores antes de ejecutar.

En este módulo construimos `tienda-aurora-colecciones`, una extensión de la tienda con catálogo indexado, cola de pedidos por prioridad, paginación genérica y una auditoría ejecutable que demuestra los contratos que más fallos causan en producción: `equals`/`hashCode`, claves mutables, borrado de tipos, comparadores y colas/pilas.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2 (`javac 27.0.1.0.2`), Gradle 9.9.1, macOS arm64. El proyecto se compiló con `--release 25` y se ejecutó; las salidas son transcripciones reales de `./gradlew -q run --args="..."`. La inspección de bytecode se hizo con `javap -private -s` del JDK 27 y el error de borrado de tipos se capturó con `javac` sobre un archivo de demostración aislado.

## Proyecto desde cero: tienda-aurora-colecciones

El proyecto tiene cinco comandos, cada uno asociado a una decisión de colección:

- `catalogo`: muestra productos en orden de alta con `LinkedHashMap` y los ordena por precio con `Comparator`.
- `etiquetas`: cuenta etiquetas con `TreeMap`/`TreeSet` y busca productos por una etiqueta normalizada.
- `pedidos`: atiende pedidos con `PriorityQueue`, deshace con `ArrayDeque` usado como pila y emite avisos con `ArrayDeque` usado como cola FIFO.
- `paginas`: pagina un repositorio genérico con `Pagina<T>` y transforma el resultado con `map(Function<? super T, ? extends R>)`.
- `auditoria`: ejecuta comprobaciones reales de `equals`/`hashCode`, claves mutables, borrado de tipos, comparadores y colas/pilas.

La regla de diseño es simple: el tipo de colección se elige por el comportamiento que el dominio necesita, no por costumbre.

## Prerrequisitos

Necesitas un JDK 25 o superior y Gradle 9.

```bash
java -version
javac -version
gradle --version
```

En el entorno de referencia:

```text
openjdk version "27.0.1.0.2" 2026-10-21
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1, mixed mode, sharing)
javac 27.0.1.0.2

------------------------------------------------------------
Gradle 9.9.1
------------------------------------------------------------
```

## Estructura del proyecto

```text
tienda-aurora-colecciones/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/
            └── com/aurora/colecciones/
                ├── TiendaAuroraColeccionesApp.java
                ├── Muestras.java
                ├── auditoria/
                │   └── AuditoriaColecciones.java
                ├── catalogo/
                │   └── Catalogo.java
                ├── comun/
                │   ├── Pagina.java
                │   ├── Repositorio.java
                │   └── RepositorioEnMemoria.java
                ├── dominio/
                │   ├── Dinero.java
                │   ├── LineaPedido.java
                │   ├── Pedido.java
                │   ├── Prioridad.java
                │   ├── Producto.java
                │   └── Sku.java
                ├── legado/
                │   └── CodigoLegado.java
                └── pedidos/
                    ├── ColaPedidos.java
                    └── Comparadores.java
```

## build.gradle.kts

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass = "com.aurora.colecciones.TiendaAuroraColeccionesApp"
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

El build es deliberadamente pequeño: no hay dependencias externas porque el objetivo del módulo es entender las colecciones del JDK. El toolchain fija Java 25 y `-Werror` evita que advertencias de tipos crudos o APIs obsoletas pasen desapercibidas.

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-colecciones"
```

## Código completo

Los archivos están organizados por responsabilidad. `dominio` define los valores que entran en colecciones: dinero, SKU, producto, línea y pedido. `comun` contiene piezas genéricas reutilizables (`Repositorio`, `RepositorioEnMemoria`, `Pagina`). `catalogo` y `pedidos` aplican colecciones concretas al problema de negocio. `legado` conserva una clave mutable a propósito para demostrar el fallo. `auditoria` ejecuta las comprobaciones. `Muestras` centraliza datos de prueba para que la app y la auditoría hablen del mismo catálogo.

Puedes copiar los archivos respetando la ruta. El orden de lectura recomendado es: dominio, común, catálogo/pedidos, muestras, auditoría y finalmente la app.

### Dominio: valores que pueden vivir en colecciones

`Dinero` es un value object inmutable en centavos. Implementa `Comparable<Dinero>` porque el precio necesita un orden natural. `equals` y `hashCode` se basan en el valor, no en la identidad del objeto.

**Archivo:** `src/main/java/com/aurora/colecciones/dominio/Dinero.java`

```java
package com.aurora.colecciones.dominio;

import java.math.BigDecimal;
import java.util.Locale;

/**
 * Importe monetario inmutable en centavos.
 */
public final class Dinero implements Comparable<Dinero> {

    public static final Dinero CERO = new Dinero(0L);

    private final long centavos;

    private Dinero(long centavos) {
        this.centavos = centavos;
    }

    public static Dinero de(String texto) {
        BigDecimal valor = new BigDecimal(texto);
        return new Dinero(valor.movePointRight(2).longValueExact());
    }

    public static Dinero deCentavos(long centavos) {
        return new Dinero(centavos);
    }

    public Dinero mas(Dinero otro) {
        return new Dinero(Math.addExact(this.centavos, otro.centavos));
    }

    public Dinero por(int cantidad) {
        if (cantidad < 0) {
            throw new IllegalArgumentException("cantidad negativa: " + cantidad);
        }
        return new Dinero(Math.multiplyExact(this.centavos, cantidad));
    }

    public long enCentavos() {
        return centavos;
    }

    @Override
    public int compareTo(Dinero otro) {
        return Long.compare(this.centavos, otro.centavos);
    }

    @Override
    public boolean equals(Object otro) {
        return otro instanceof Dinero dinero && this.centavos == dinero.centavos;
    }

    @Override
    public int hashCode() {
        return Long.hashCode(centavos);
    }

    @Override
    public String toString() {
        long absoluto = Math.abs(centavos);
        return String.format(Locale.ROOT, "%s$%d.%02d",
                centavos < 0 ? "-" : "", absoluto / 100, absoluto % 100);
    }
}
```

`Sku` es la clave natural del catálogo. Es un `record`, así que el compilador genera `equals`, `hashCode`, `toString` y accesores a partir del componente `valor`. El constructor compacto normaliza y valida antes de asignar. Implementar `Comparable<Sku>` le da un orden natural alfabético, útil cuando un `TreeSet` o un `sort` necesitan decidir empates.

**Archivo:** `src/main/java/com/aurora/colecciones/dominio/Sku.java`

```java
package com.aurora.colecciones.dominio;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Código de producto inmutable.
 *
 * Es un record porque se usa como clave de mapa: su igualdad y su hashCode se
 * calculan sobre el valor normalizado y no cambian nunca. Esa inmutabilidad es
 * la que evita que una entrada se pierda dentro de un HashMap.
 */
public record Sku(String valor) implements Comparable<Sku> {

    private static final Pattern FORMATO = Pattern.compile("[A-Z]{3}-\\d{4}");

    public Sku {
        Objects.requireNonNull(valor, "valor");
        String limpio = valor.strip()
                .toUpperCase(Locale.ROOT)
                .replace(" ", "")
                .replace("_", "-");
        if (!FORMATO.matcher(limpio).matches()) {
            throw new IllegalArgumentException("SKU inválido: '" + valor + "' (formato AAA-0000)");
        }
        valor = limpio;
    }

    public static Sku de(String crudo) {
        return new Sku(crudo);
    }

    @Override
    public int compareTo(Sku otro) {
        return valor.compareTo(otro.valor);
    }

    @Override
    public String toString() {
        return valor;
    }
}
```

`Producto` también es un record. Su componente `etiquetas` merece atención: recibe un `Set<String>` desde fuera, lo normaliza, lo guarda en un `TreeSet` para tener orden y sin duplicados, y lo expone como conjunto inmodificable. Esa copia defensiva evita que el llamador mutile el estado interno del producto después de construirlo.

**Archivo:** `src/main/java/com/aurora/colecciones/dominio/Producto.java`

```java
package com.aurora.colecciones.dominio;

import java.util.Collections;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

/**
 * Producto del catálogo. Sus etiquetas se normalizan y se guardan en un
 * conjunto ordenado e inmutable, de modo que dos productos con las mismas
 * etiquetas se comparan igual sin importar el orden de entrada.
 */
public record Producto(Sku sku, String nombre, Dinero precio, Set<String> etiquetas)
        implements Comparable<Producto> {

    public Producto {
        Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(precio, "precio");
        nombre = nombre == null ? "" : nombre.strip();
        if (nombre.isBlank()) {
            throw new IllegalArgumentException("el nombre es obligatorio");
        }
        if (precio.compareTo(Dinero.CERO) <= 0) {
            throw new IllegalArgumentException("el precio debe ser positivo");
        }
        TreeSet<String> limpias = new TreeSet<>();
        if (etiquetas != null) {
            for (String etiqueta : etiquetas) {
                if (etiqueta != null && !etiqueta.isBlank()) {
                    limpias.add(etiqueta.strip().toLowerCase(Locale.ROOT));
                }
            }
        }
        etiquetas = Collections.unmodifiableSet(limpias);
    }

    public boolean tieneEtiqueta(String etiqueta) {
        return etiqueta != null && etiquetas.contains(etiqueta.strip().toLowerCase(Locale.ROOT));
    }

    public Dinero valorInventario(int unidades) {
        return precio.por(unidades);
    }

    @Override
    public int compareTo(Producto otro) {
        return sku.compareTo(otro.sku);
    }
}
```

`LineaPedido` es un valor simple: producto y cantidad. Su subtotal es derivado. `Prioridad` es un `enum`; el orden de declaración importa porque `Enum.compareTo` usa ese orden, y la cola de pedidos lo aprovecha.

**Archivo:** `src/main/java/com/aurora/colecciones/dominio/LineaPedido.java`

```java
package com.aurora.colecciones.dominio;

/**
 * Línea de pedido. El subtotal se deriva del producto y la cantidad.
 */
public record LineaPedido(Producto producto, int cantidad) {

    public LineaPedido {
        if (producto == null) {
            throw new IllegalArgumentException("la línea necesita un producto");
        }
        if (cantidad <= 0) {
            throw new IllegalArgumentException("la cantidad debe ser mayor que cero");
        }
    }

    public Dinero subtotal() {
        return producto.precio().por(cantidad);
    }
}
```

**Archivo:** `src/main/java/com/aurora/colecciones/dominio/Prioridad.java`

```java
package com.aurora.colecciones.dominio;

/**
 * Prioridad de preparación. El orden del enum es el orden de atención: los
 * valores declarados primero se atienden antes.
 */
public enum Prioridad {
    EXPRESS,
    ESTANDAR,
    ECONOMICA
}
```

`Pedido` copia su lista de líneas con `List.copyOf`. Eso crea una vista inmodificable; si el código que construyó el pedido modifica su lista original después, el pedido no cambia. Es una defensa pequeña pero importante: las colecciones compartidas son una fuente común de bugs.

**Archivo:** `src/main/java/com/aurora/colecciones/dominio/Pedido.java`

```java
package com.aurora.colecciones.dominio;

import java.util.List;
import java.util.Objects;

/**
 * Pedido inmutable. Copia la lista de líneas para que nadie pueda modificarla
 * después de crear el pedido.
 */
public record Pedido(String numero, String cliente, Prioridad prioridad, List<LineaPedido> lineas) {

    public Pedido {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("el número de pedido es obligatorio");
        }
        if (cliente == null || cliente.isBlank()) {
            throw new IllegalArgumentException("el cliente es obligatorio");
        }
        Objects.requireNonNull(prioridad, "prioridad");
        if (lineas == null || lineas.isEmpty()) {
            throw new IllegalArgumentException("el pedido no tiene líneas");
        }
        numero = numero.strip();
        cliente = cliente.strip();
        lineas = List.copyOf(lineas);
    }

    public Dinero total() {
        Dinero total = Dinero.CERO;
        for (LineaPedido linea : lineas) {
            total = total.mas(linea.subtotal());
        }
        return total;
    }

    public int unidades() {
        int total = 0;
        for (LineaPedido linea : lineas) {
            total += linea.cantidad();
        }
        return total;
    }
}
```

### Infraestructura genérica: repositorio y página

`Repositorio<T, ID>` es una interfaz con dos parámetros de tipo. `T` es la entidad almacenada; `ID` es el tipo de su identificador. El contrato no sabe si guarda productos, pedidos o clientes. Ese es el valor práctico de los genéricos: el mismo diseño se reutiliza sin perder tipo.

**Archivo:** `src/main/java/com/aurora/colecciones/comun/Repositorio.java`

```java
package com.aurora.colecciones.comun;

import java.util.List;
import java.util.Optional;

/**
 * Contrato mínimo de persistencia en memoria. El tipo de la entidad y el de su
 * identificador son parámetros: el mismo contrato sirve para productos, pedidos
 * o cualquier otra entidad.
 */
public interface Repositorio<T, ID> {

    void guardar(ID id, T valor);

    Optional<T> buscar(ID id);

    List<T> todos();

    int tamano();
}
```

`RepositorioEnMemoria` usa `LinkedHashMap`. Elige ese mapa porque el catálogo necesita responder por clave y, además, conservar el orden de alta al listar. Devuelve `List.copyOf(datos.values())` para no exponer su estructura interna.

**Archivo:** `src/main/java/com/aurora/colecciones/comun/RepositorioEnMemoria.java`

```java
package com.aurora.colecciones.comun;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Implementación genérica sobre un LinkedHashMap. El mapa conserva el orden de
 * alta y devuelve las entradas en ese mismo orden.
 */
public final class RepositorioEnMemoria<T, ID> implements Repositorio<T, ID> {

    private final Map<ID, T> datos = new LinkedHashMap<>();

    @Override
    public void guardar(ID id, T valor) {
        datos.put(Objects.requireNonNull(id, "id"), Objects.requireNonNull(valor, "valor"));
    }

    @Override
    public Optional<T> buscar(ID id) {
        return Optional.ofNullable(datos.get(id));
    }

    @Override
    public List<T> todos() {
        return List.copyOf(datos.values());
    }

    @Override
    public int tamano() {
        return datos.size();
    }
}
```

`Pagina<T>` es un record genérico. Su método `map` declara `Function<? super T, ? extends R>`. Esa firma es PECS aplicado a una transformación: la función puede consumir `T` o un supertipo de `T`, y puede producir `R` o un subtipo de `R`. El llamador gana flexibilidad sin perder seguridad de tipos.

**Archivo:** `src/main/java/com/aurora/colecciones/comun/Pagina.java`

```java
package com.aurora.colecciones.comun;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 * Página de resultados genérica.
 *
 * map acepta Function<? super T, ? extends R>: puede consumir T o cualquiera de
 * sus supertipos y producir R o cualquiera de sus subtipos. Es la forma
 * habitual de escribir transformaciones que no atan el llamador a un tipo
 * concreto.
 */
public record Pagina<T>(List<T> items, int numero, int tamanoPagina, int tamanoTotal) {

    public Pagina {
        items = List.copyOf(items);
    }

    public static <T> Pagina<T> de(List<T> todos, int numero, int tamano) {
        if (numero < 1) {
            throw new IllegalArgumentException("la página empieza en 1: " + numero);
        }
        if (tamano < 1) {
            throw new IllegalArgumentException("el tamaño debe ser positivo: " + tamano);
        }
        int desde = (numero - 1) * tamano;
        if (desde >= todos.size()) {
            return new Pagina<>(List.of(), numero, tamano, todos.size());
        }
        int hasta = Math.min(desde + tamano, todos.size());
        return new Pagina<>(todos.subList(desde, hasta), numero, tamano, todos.size());
    }

    public int totalPaginas() {
        return (tamanoTotal + tamanoPagina - 1) / tamanoPagina;
    }

    public boolean haySiguiente() {
        return numero < totalPaginas();
    }

    public <R> Pagina<R> map(Function<? super T, ? extends R> funcion) {
        List<R> mapeados = new ArrayList<>(items.size());
        for (T item : items) {
            mapeados.add(funcion.apply(item));
        }
        return new Pagina<>(mapeados, numero, tamanoPagina, tamanoTotal);
    }
}
```

### Catálogo indexado

`Catalogo` combina varias colecciones porque responde preguntas distintas. `LinkedHashMap<Sku, Producto>` conserva el orden de alta y da búsqueda por SKU. `TreeMap<String, Set<Sku>>` ordena las etiquetas alfabéticamente. Cada etiqueta apunta a un `TreeSet<Sku>` para mantener SKUs únicos y ordenados. La estructura interna no se expone: los métodos devuelven copias o vistas inmodificables.

**Archivo:** `src/main/java/com/aurora/colecciones/catalogo/Catalogo.java`

```java
package com.aurora.colecciones.catalogo;

import com.aurora.colecciones.dominio.Dinero;
import com.aurora.colecciones.dominio.Producto;
import com.aurora.colecciones.dominio.Sku;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Catálogo indexado por SKU y por etiqueta.
 *
 * LinkedHashMap conserva el orden de inserción, TreeMap ordena las etiquetas y
 * TreeSet mantiene los SKU de cada etiqueta en orden. Cada accesor devuelve una
 * vista inmutable o una copia: el índice interno no se entrega nunca.
 */
public final class Catalogo {

    private final Map<Sku, Producto> porSku = new LinkedHashMap<>();
    private final Map<String, Set<Sku>> porEtiqueta = new TreeMap<>();

    public Catalogo(List<Producto> productos) {
        for (Producto producto : productos) {
            agregar(producto);
        }
    }

    public void agregar(Producto producto) {
        Producto anterior = porSku.putIfAbsent(producto.sku(), producto);
        if (anterior != null) {
            throw new IllegalStateException("SKU duplicado: " + producto.sku());
        }
        for (String etiqueta : producto.etiquetas()) {
            porEtiqueta.computeIfAbsent(etiqueta, clave -> new TreeSet<>()).add(producto.sku());
        }
    }

    public Optional<Producto> buscar(Sku sku) {
        return Optional.ofNullable(porSku.get(sku));
    }

    public List<Producto> todos() {
        return List.copyOf(porSku.values());
    }

    public List<Producto> ordenados(Comparator<Producto> orden) {
        List<Producto> copia = new ArrayList<>(porSku.values());
        copia.sort(orden);
        return List.copyOf(copia);
    }

    public List<Producto> conEtiqueta(String etiqueta) {
        Set<Sku> skus = porEtiqueta.getOrDefault(etiqueta.toLowerCase(Locale.ROOT), Set.of());
        List<Producto> resultado = new ArrayList<>(skus.size());
        for (Sku sku : skus) {
            resultado.add(porSku.get(sku));
        }
        return List.copyOf(resultado);
    }

    public Set<String> etiquetas() {
        return Collections.unmodifiableSet(porEtiqueta.keySet());
    }

    public Map<String, Integer> conteoPorEtiqueta() {
        Map<String, Integer> conteo = new TreeMap<>();
        for (Map.Entry<String, Set<Sku>> entrada : porEtiqueta.entrySet()) {
            conteo.put(entrada.getKey(), entrada.getValue().size());
        }
        return Collections.unmodifiableMap(conteo);
    }

    public int tamano() {
        return porSku.size();
    }

    /** Acepta cualquier lista de subtipos de producto: PECS en lectura. */
    public static Dinero valorDe(List<? extends Producto> productos) {
        Dinero total = Dinero.CERO;
        for (Producto producto : productos) {
            total = total.mas(producto.precio());
        }
        return total;
    }
}
```

### Pedidos, prioridad y deshacer

`Comparadores` centraliza los criterios de orden. Tenerlos en un solo lugar evita que cada pantalla invente su propia comparación y que dos órdenes “por precio” se comporten distinto ante empates.

**Archivo:** `src/main/java/com/aurora/colecciones/pedidos/Comparadores.java`

```java
package com.aurora.colecciones.pedidos;

import com.aurora.colecciones.dominio.Pedido;
import com.aurora.colecciones.dominio.Producto;

import java.util.Comparator;

/**
 * Comparadores reutilizables. Cada uno es una función pura: no modifica la
 * lista que recibe, solo define un orden.
 */
public final class Comparadores {

    public static final Comparator<Producto> POR_PRECIO =
            Comparator.comparing(Producto::precio).thenComparing(Producto::sku);

    public static final Comparator<Producto> POR_NOMBRE =
            Comparator.comparing(Producto::nombre, String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(Producto::sku);

    public static final Comparator<Pedido> POR_PRIORIDAD =
            Comparator.comparing(Pedido::prioridad).thenComparing(Pedido::numero);

    private Comparadores() {
    }
}
```

`ColaPedidos` usa tres estructuras con roles distintos. `PriorityQueue` mantiene los pendientes y entrega primero el de mayor prioridad según el comparador. `ArrayDeque` como pila (`push`/`poll`) guarda el historial de atenciones para poder deshacer. Otro `ArrayDeque` como cola (`addLast`/`pollFirst`) guarda avisos para el mostrador. La misma clase `ArrayDeque` sirve para dos contratos porque permite operar por ambos extremos; lo que cambia es la disciplina de uso.

**Archivo:** `src/main/java/com/aurora/colecciones/pedidos/ColaPedidos.java`

```java
package com.aurora.colecciones.pedidos;

import com.aurora.colecciones.dominio.Pedido;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.List;
import java.util.Optional;
import java.util.PriorityQueue;
import java.util.Queue;

/**
 * Mesa de preparación de pedidos.
 *
 * Los pedidos esperan en una PriorityQueue: se atiende primero el EXPRESS y,
 * dentro de la misma prioridad, el número más bajo. El historial es un Deque
 * usado como pila para deshacer la última atención, y los avisos son otro Deque
 * usado como cola FIFO hacia el mostrador.
 */
public final class ColaPedidos {

    private final Queue<Pedido> pendientes;
    private final Deque<Pedido> historial = new ArrayDeque<>();
    private final Deque<String> avisos = new ArrayDeque<>();

    public ColaPedidos() {
        this(Comparadores.POR_PRIORIDAD);
    }

    public ColaPedidos(Comparator<Pedido> orden) {
        this.pendientes = new PriorityQueue<>(orden);
    }

    public void recibir(Pedido pedido) {
        pendientes.add(pedido);
        avisos.addLast("Recibido " + pedido.numero() + " (" + pedido.prioridad() + ")");
    }

    public Optional<Pedido> atender() {
        Pedido pedido = pendientes.poll();
        if (pedido == null) {
            return Optional.empty();
        }
        historial.push(pedido);
        avisos.addLast("Atendido " + pedido.numero() + " de " + pedido.cliente());
        return Optional.of(pedido);
    }

    public Optional<Pedido> deshacer() {
        Pedido pedido = historial.poll();
        if (pedido == null) {
            return Optional.empty();
        }
        pendientes.add(pedido);
        avisos.addFirst("Reabierto " + pedido.numero());
        return Optional.of(pedido);
    }

    public List<Pedido> pendientes() {
        List<Pedido> copia = new ArrayList<>(pendientes);
        copia.sort(Comparadores.POR_PRIORIDAD);
        return List.copyOf(copia);
    }

    public Optional<String> siguienteAviso() {
        return Optional.ofNullable(avisos.pollFirst());
    }

    public List<String> avisosPendientes() {
        return List.copyOf(avisos);
    }

    public int enEspera() {
        return pendientes.size();
    }
}
```

### Auditoría, legado y datos de muestra

`CodigoLegado` es una clase deliberadamente peligrosa: su `hashCode` depende de un campo mutable. Sirve para demostrar, con un caso realista, por qué una clave mutable rompe un `HashMap`. No es un patrón a copiar; es un anti-patrón controlado.

**Archivo:** `src/main/java/com/aurora/colecciones/legado/CodigoLegado.java`

```java
package com.aurora.colecciones.legado;

/**
 * Código heredado de la integración con el proveedor antiguo.
 *
 * Es mutable y su hashCode depende del valor actual: usarlo como clave de un
 * HashMap funciona hasta que alguien lo reasigna. La auditoría del catálogo lo
 * conserva justamente para documentar el fallo y justificar la migración a Sku.
 */
public final class CodigoLegado {

    private String valor;

    public CodigoLegado(String valor) {
        this.valor = valor;
    }

    public String valor() {
        return valor;
    }

    public void reasignar(String valor) {
        this.valor = valor;
    }

    @Override
    public boolean equals(Object otro) {
        return otro instanceof CodigoLegado codigo && valor.equals(codigo.valor);
    }

    @Override
    public int hashCode() {
        return valor.hashCode();
    }

    @Override
    public String toString() {
        return valor;
    }
}
```

`Muestras` centraliza los datos que usan la app y la auditoría. Así la salida documentada en el módulo corresponde al mismo catálogo y a los mismos pedidos.

**Archivo:** `src/main/java/com/aurora/colecciones/Muestras.java`

```java
package com.aurora.colecciones;

import com.aurora.colecciones.catalogo.Catalogo;
import com.aurora.colecciones.dominio.Dinero;
import com.aurora.colecciones.dominio.LineaPedido;
import com.aurora.colecciones.dominio.Pedido;
import com.aurora.colecciones.dominio.Prioridad;
import com.aurora.colecciones.dominio.Producto;
import com.aurora.colecciones.dominio.Sku;

import java.util.List;
import java.util.Set;

/**
 * Datos de la tienda que comparten la aplicación y la auditoría.
 */
public final class Muestras {

    private Muestras() {
    }

    public static List<Producto> productos() {
        return List.of(
                new Producto(Sku.de("caf-0001"), "Café Aurora", Dinero.de("12.50"),
                        Set.of("cafe", "bebida", "destacado")),
                new Producto(Sku.de("mol-0003"), "Molino manual", Dinero.de("34.90"),
                        Set.of("equipo", "cafe")),
                new Producto(Sku.de("taz-0002"), "Taza Aurora", Dinero.de("8.00"),
                        Set.of("equipo", "regalo")),
                new Producto(Sku.de("fil-0004"), "Filtros x100", Dinero.de("4.75"),
                        Set.of("consumible", "cafe")),
                new Producto(Sku.de("cur-0100"), "Curso de barismo", Dinero.de("49.00"),
                        Set.of("digital", "formacion")));
    }

    public static Catalogo catalogo() {
        return new Catalogo(productos());
    }

    public static List<Pedido> pedidos() {
        Catalogo catalogo = catalogo();
        return List.of(
                new Pedido("AUR-1001", "Marta", Prioridad.ECONOMICA, List.of(
                        linea(catalogo, "CAF-0001", 2),
                        linea(catalogo, "FIL-0004", 1))),
                new Pedido("AUR-1002", "Luis", Prioridad.EXPRESS, List.of(
                        linea(catalogo, "MOL-0003", 1))),
                new Pedido("AUR-1003", "Ana", Prioridad.ESTANDAR, List.of(
                        linea(catalogo, "TAZ-0002", 4))),
                new Pedido("AUR-1004", "Pablo", Prioridad.EXPRESS, List.of(
                        linea(catalogo, "CUR-0100", 1))),
                new Pedido("AUR-1005", "Elena", Prioridad.ESTANDAR, List.of(
                        linea(catalogo, "CAF-0001", 3))));
    }

    private static LineaPedido linea(Catalogo catalogo, String sku, int cantidad) {
        Producto producto = catalogo.buscar(Sku.de(sku))
                .orElseThrow(() -> new IllegalArgumentException("no existe " + sku));
        return new LineaPedido(producto, cantidad);
    }
}
```

`AuditoriaColecciones` es código ejecutable, no una lista de afirmaciones. Cada método imprime una observación que puedes reproducir. La auditoría no reemplaza los tests formales, pero en un módulo didáctico hace visible el contrato: ves el resultado del `HashSet`, ves el `null` después de mutar la clave y ves que `List<String>` y `List<Integer>` comparten clase en runtime.

**Archivo:** `src/main/java/com/aurora/colecciones/auditoria/AuditoriaColecciones.java`

```java
package com.aurora.colecciones.auditoria;

import com.aurora.colecciones.Muestras;
import com.aurora.colecciones.catalogo.Catalogo;
import com.aurora.colecciones.dominio.Pedido;
import com.aurora.colecciones.dominio.Producto;
import com.aurora.colecciones.dominio.Sku;
import com.aurora.colecciones.legado.CodigoLegado;
import com.aurora.colecciones.pedidos.ColaPedidos;
import com.aurora.colecciones.pedidos.Comparadores;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Comprobaciones que la tienda ejecuta para documentar el comportamiento de
 * las colecciones que sostienen el catálogo.
 */
public final class AuditoriaColecciones {

    public void ejecutar() {
        equalsYHashCode();
        claveMutable();
        borradoDeTipos();
        comparadores();
        colasYPilas();
    }

    private void equalsYHashCode() {
        seccion("1. Contrato de equals y hashCode");
        Sku a = Sku.de("caf-0001");
        Sku b = Sku.de(" CAF_0001 ");
        Set<Sku> conjunto = new HashSet<>();
        conjunto.add(a);
        conjunto.add(b);

        System.out.println("  a           -> " + a);
        System.out.println("  b           -> " + b);
        System.out.println("  a.equals(b) -> " + a.equals(b));
        System.out.println("  hash igual  -> " + (a.hashCode() == b.hashCode()));
        System.out.println("  HashSet     -> " + conjunto.size() + " elemento(s)");
    }

    private void claveMutable() {
        seccion("2. Clave mutable en un HashMap");
        Map<CodigoLegado, String> indice = new HashMap<>();
        CodigoLegado clave = new CodigoLegado("PROV-001");
        indice.put(clave, "Café Aurora");

        System.out.println("  antes de mutar  -> " + indice.get(new CodigoLegado("PROV-001")));
        clave.reasignar("PROV-999");
        System.out.println("  después de mutar -> " + indice.get(new CodigoLegado("PROV-001")));
        System.out.println("  tamaño del mapa -> " + indice.size());
        System.out.println("  la entrada sigue al recorrer -> " + indice.values());

        Map<Sku, String> seguro = new HashMap<>();
        Sku sku = Sku.de("CAF-0001");
        seguro.put(sku, "Café Aurora");
        System.out.println("  con Sku inmutable -> " + seguro.get(Sku.de("caf-0001")));
    }

    private void borradoDeTipos() {
        seccion("3. Borrado de tipos");
        List<String> nombres = new ArrayList<>(List.of("Café"));
        List<Integer> numeros = new ArrayList<>(List.of(1));
        System.out.println("  List<String> y List<Integer> comparten clase -> "
                + (nombres.getClass() == numeros.getClass()));
        System.out.println("  clase en ejecución -> " + nombres.getClass().getSimpleName());

        List<Producto> productos = Muestras.productos();
        List<? extends Producto> vista = productos;
        System.out.println("  valor con List<Producto> -> " + Catalogo.valorDe(productos));
        System.out.println("  valor con List<? extends Producto> -> " + Catalogo.valorDe(vista));
    }

    private void comparadores() {
        seccion("4. Comparable y Comparator");
        Catalogo catalogo = Muestras.catalogo();
        System.out.println("  orden por precio:");
        for (Producto producto : catalogo.ordenados(Comparadores.POR_PRECIO)) {
            System.out.printf("    %-9s %-18s %s%n", producto.sku(), producto.nombre(), producto.precio());
        }
        System.out.println("  orden por nombre:");
        for (Producto producto : catalogo.ordenados(Comparadores.POR_NOMBRE)) {
            System.out.printf("    %-18s %s%n", producto.nombre(), producto.precio());
        }
    }

    private void colasYPilas() {
        seccion("5. Queue, Deque y PriorityQueue");
        ColaPedidos cola = new ColaPedidos();
        for (Pedido pedido : Muestras.pedidos()) {
            cola.recibir(pedido);
        }
        System.out.println("  en espera -> " + cola.enEspera());
        System.out.println("  primer aviso -> " + cola.siguienteAviso().orElse("-"));
        System.out.println("  siguiente a atender -> " + cola.pendientes().get(0).numero());
        System.out.println("  se atiende -> " + cola.atender().orElseThrow().numero());
        System.out.println("  se deshace -> " + cola.deshacer().orElseThrow().numero());
        System.out.println("  vuelve a la cabeza -> " + cola.pendientes().get(0).numero());

        Set<String> sinDuplicados = new LinkedHashSet<>(List.of("cafe", "equipo", "cafe", "digital"));
        System.out.println("  LinkedHashSet -> " + sinDuplicados);
    }

    private void seccion(String titulo) {
        System.out.println();
        System.out.println(titulo);
    }
}
```

### Aplicación de consola

`TiendaAuroraColeccionesApp` solo conecta comandos con casos de uso. No implementa reglas de colección; las delega en `Catalogo`, `ColaPedidos`, `RepositorioEnMemoria`, `Pagina` y `AuditoriaColecciones`. Ese reparto es importante: la CLI es una interfaz, no el lugar donde vive el conocimiento del dominio.

**Archivo:** `src/main/java/com/aurora/colecciones/TiendaAuroraColeccionesApp.java`

```java
package com.aurora.colecciones;

import com.aurora.colecciones.auditoria.AuditoriaColecciones;
import com.aurora.colecciones.catalogo.Catalogo;
import com.aurora.colecciones.comun.Pagina;
import com.aurora.colecciones.comun.Repositorio;
import com.aurora.colecciones.comun.RepositorioEnMemoria;
import com.aurora.colecciones.dominio.Pedido;
import com.aurora.colecciones.dominio.Producto;
import com.aurora.colecciones.dominio.Sku;
import com.aurora.colecciones.pedidos.ColaPedidos;
import com.aurora.colecciones.pedidos.Comparadores;

import java.util.Locale;
import java.util.Map;

/**
 * Aplicación de consola de Tienda Aurora para el módulo de colecciones.
 */
public final class TiendaAuroraColeccionesApp {

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        if (args.length == 0) {
            ayuda();
            return;
        }
        switch (args[0]) {
            case "catalogo" -> catalogo();
            case "etiquetas" -> etiquetas();
            case "pedidos" -> pedidos();
            case "paginas" -> paginas();
            case "auditoria" -> new AuditoriaColecciones().ejecutar();
            default -> {
                System.err.println("Comando desconocido: " + args[0]);
                ayuda();
                System.exit(2);
            }
        }
    }

    private static void ayuda() {
        System.out.println("""
                Tienda Aurora - colecciones y genéricos

                Uso:
                  catalogo
                  etiquetas
                  pedidos
                  paginas
                  auditoria
                """);
    }

    private static void catalogo() {
        Catalogo catalogo = Muestras.catalogo();
        System.out.println("Catálogo en orden de alta (" + catalogo.tamano() + " productos)");
        for (Producto producto : catalogo.todos()) {
            System.out.printf(Locale.ROOT, "  %-9s %-18s %7s  %s%n",
                    producto.sku(), producto.nombre(), producto.precio(), producto.etiquetas());
        }
        System.out.println();
        System.out.println("Por precio ascendente");
        for (Producto producto : catalogo.ordenados(Comparadores.POR_PRECIO)) {
            System.out.printf(Locale.ROOT, "  %7s  %s%n", producto.precio(), producto.nombre());
        }
    }

    private static void etiquetas() {
        Catalogo catalogo = Muestras.catalogo();
        System.out.println("Conteo por etiqueta");
        for (Map.Entry<String, Integer> entrada : catalogo.conteoPorEtiqueta().entrySet()) {
            System.out.printf(Locale.ROOT, "  %-12s %d%n", entrada.getKey(), entrada.getValue());
        }
        System.out.println();
        System.out.println("Productos con la etiqueta 'cafe'");
        for (Producto producto : catalogo.conEtiqueta("CAFE")) {
            System.out.printf(Locale.ROOT, "  %-9s %s%n", producto.sku(), producto.nombre());
        }
    }

    private static void pedidos() {
        ColaPedidos cola = new ColaPedidos();
        for (Pedido pedido : Muestras.pedidos()) {
            cola.recibir(pedido);
        }

        System.out.println("Espera ordenada por prioridad:");
        for (Pedido pedido : cola.pendientes()) {
            System.out.printf(Locale.ROOT, "  %-9s %-9s %-7s %7s%n",
                    pedido.numero(), pedido.prioridad(), pedido.cliente(), pedido.total());
        }
        System.out.println();
        System.out.println("Atención:");
        while (!cola.pendientes().isEmpty()) {
            Pedido pedido = cola.atender().orElseThrow();
            System.out.printf(Locale.ROOT, "  atendido %-9s %-9s %7s%n",
                    pedido.numero(), pedido.prioridad(), pedido.total());
        }
        System.out.println();
        System.out.println("Deshacer la última atención:");
        Pedido reabierto = cola.deshacer().orElseThrow();
        System.out.println("  reabierto " + reabierto.numero() + " -> en espera " + cola.enEspera());

        System.out.println();
        System.out.println("Avisos al mostrador:");
        cola.siguienteAviso().ifPresent(aviso -> System.out.println("  " + aviso));
        System.out.println("  quedan " + cola.avisosPendientes().size() + " avisos en cola");
    }

    private static void paginas() {
        Repositorio<Producto, Sku> repositorio = new RepositorioEnMemoria<>();
        for (Producto producto : Muestras.productos()) {
            repositorio.guardar(producto.sku(), producto);
        }
        System.out.println("Repositorio con " + repositorio.tamano() + " productos");

        Pagina<Producto> primera = Pagina.de(repositorio.todos(), 1, 2);
        Pagina<String> nombres = primera.map(producto -> producto.sku() + " " + producto.nombre());
        System.out.println("Página 1 de " + primera.totalPaginas()
                + " (siguiente: " + primera.haySiguiente() + ")");
        nombres.items().forEach(linea -> System.out.println("  " + linea));

        Pagina<Producto> segunda = Pagina.de(repositorio.todos(), 2, 2);
        System.out.println("Página 2 de " + segunda.totalPaginas());
        segunda.items().forEach(producto ->
                System.out.println("  " + producto.sku() + " " + producto.nombre()));

        Pagina<Producto> fuera = Pagina.de(repositorio.todos(), 9, 2);
        System.out.println("Página 9 -> " + fuera.items().size() + " elementos");
    }
}
```

## Ejecutar

Genera el wrapper y compila:

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
```

`BUILD SUCCESSFUL` confirma que los 20 archivos Java compilan con `-Xlint:all -Werror`.

El catálogo muestra el orden de alta y después un orden por precio. Son la misma colección de productos vista con dos criterios distintos:

```bash
./gradlew -q run --args="catalogo"
```

```text
Catálogo en orden de alta (5 productos)
  CAF-0001  Café Aurora          $12.50  [bebida, cafe, destacado]
  MOL-0003  Molino manual        $34.90  [cafe, equipo]
  TAZ-0002  Taza Aurora           $8.00  [equipo, regalo]
  FIL-0004  Filtros x100          $4.75  [cafe, consumible]
  CUR-0100  Curso de barismo     $49.00  [digital, formacion]

Por precio ascendente
    $4.75  Filtros x100
    $8.00  Taza Aurora
   $12.50  Café Aurora
   $34.90  Molino manual
   $49.00  Curso de barismo
```

Las etiquetas muestran el índice ordenado por nombre de etiqueta y la búsqueda normalizada:

```bash
./gradlew -q run --args="etiquetas"
```

```text
Conteo por etiqueta
  bebida       1
  cafe         3
  consumible   1
  destacado    1
  digital      1
  equipo       2
  formacion    1
  regalo       1

Productos con la etiqueta 'cafe'
  CAF-0001  Café Aurora
  FIL-0004  Filtros x100
  MOL-0003  Molino manual
```

La cola de pedidos muestra prioridad, atención, deshacer y avisos:

```bash
./gradlew -q run --args="pedidos"
```

```text
Espera ordenada por prioridad:
  AUR-1002  EXPRESS   Luis     $34.90
  AUR-1004  EXPRESS   Pablo    $49.00
  AUR-1003  ESTANDAR  Ana      $32.00
  AUR-1005  ESTANDAR  Elena    $37.50
  AUR-1001  ECONOMICA Marta    $29.75

Atención:
  atendido AUR-1002  EXPRESS   $34.90
  atendido AUR-1004  EXPRESS   $49.00
  atendido AUR-1003  ESTANDAR  $32.00
  atendido AUR-1005  ESTANDAR  $37.50
  atendido AUR-1001  ECONOMICA $29.75

Deshacer la última atención:
  reabierto AUR-1001 -> en espera 1

Avisos al mostrador:
  Recibido AUR-1001 (ECONOMICA)
  quedan 10 avisos en cola
```

La paginación usa el repositorio genérico y transforma la página a otro tipo con `map`:

```bash
./gradlew -q run --args="paginas"
```

```text
Repositorio con 5 productos
Página 1 de 3 (siguiente: true)
  CAF-0001 Café Aurora
  MOL-0003 Molino manual
Página 2 de 3
  TAZ-0002 Taza Aurora
  FIL-0004 Filtros x100
Página 9 -> 0 elementos
```

La auditoría concentra las comprobaciones de contrato:

```bash
./gradlew -q run --args="auditoria"
```

```text
1. Contrato de equals y hashCode
  a           -> CAF-0001
  b           -> CAF-0001
  a.equals(b) -> true
  hash igual  -> true
  HashSet     -> 1 elemento(s)

2. Clave mutable en un HashMap
  antes de mutar  -> Café Aurora
  después de mutar -> null
  tamaño del mapa -> 1
  la entrada sigue al recorrer -> [Café Aurora]
  con Sku inmutable -> Café Aurora

3. Borrado de tipos
  List<String> y List<Integer> comparten clase -> true
  clase en ejecución -> ArrayList
  valor con List<Producto> -> $109.15
  valor con List<? extends Producto> -> $109.15

4. Comparable y Comparator
  orden por precio:
    FIL-0004  Filtros x100       $4.75
    TAZ-0002  Taza Aurora        $8.00
    CAF-0001  Café Aurora        $12.50
    MOL-0003  Molino manual      $34.90
    CUR-0100  Curso de barismo   $49.00
  orden por nombre:
    Café Aurora        $12.50
    Curso de barismo   $49.00
    Filtros x100       $4.75
    Molino manual      $34.90
    Taza Aurora        $8.00

5. Queue, Deque y PriorityQueue
  en espera -> 5
  primer aviso -> Recibido AUR-1001 (ECONOMICA)
  siguiente a atender -> AUR-1002
  se atiende -> AUR-1002
  se deshace -> AUR-1002
  vuelve a la cabeza -> AUR-1002
  LinkedHashSet -> [cafe, equipo, digital]
```

## Conceptos cubiertos

### Tema 1: List, Set, Map y sus implementaciones · Intermedio · 40 min

Una colección es una estructura que guarda elementos bajo un contrato. El contrato responde tres preguntas antes de escribir código: si importa el orden, si se permiten duplicados y cómo se va a buscar. Si la respuesta es “por posición y puede haber repetidos”, la estructura es una `List`. Si la respuesta es “no quiero duplicados y me importa pertenencia”, es un `Set`. Si la respuesta es “quiero encontrar un valor por una clave”, es un `Map`.

`List<E>` modela una secuencia. Mantiene un orden y permite acceder por índice. `ArrayList` está respaldada por un arreglo que crece; leer por índice es barato, insertar en el medio cuesta desplazar elementos porque el arreglo tiene que hacer hueco. `LinkedList` es una lista doblemente enlazada; insertar o quitar en extremos es barato, pero acceder por índice implica recorrer nodos desde un extremo. En la práctica de negocio, `ArrayList` es la opción por defecto y `LinkedList` solo se justifica con un motivo medido. Cuando dudes entre ambas, piensa en la operación dominante: si vas a leer por posición o recorrer en orden, `ArrayList` suele ganar; si vas a hacer muchas inserciones y eliminaciones en el medio con un iterador ya posicionado, la lista enlazada tiene sentido, pero ese caso es menos común de lo que parece.

`Set<E>` modela unicidad. `HashSet` usa una tabla hash: no garantiza orden, pero `add`, `contains` y `remove` son O(1) en promedio siempre que `hashCode` distribuya bien. `LinkedHashSet` conserva el orden de inserción. `TreeSet` mantiene los elementos ordenados por su orden natural o por un `Comparator`, con operaciones O(log n). La unicidad en `HashSet` no es magia: depende de `equals` y `hashCode`. La unicidad en `TreeSet` depende del comparador; si el comparador dice que dos elementos son equivalentes, el set solo guarda uno.

`Map<K, V>` asocia claves con valores. No es una `Collection`, aunque se relaciona con ellas: `keySet()` devuelve un `Set`, `values()` una colección y `entrySet()` un conjunto de pares. `HashMap` es la implementación general: rápida, sin orden. `LinkedHashMap` conserva orden de inserción o de acceso. `TreeMap` ordena por clave. `put` sobre una clave existente reemplaza el valor; por eso el catálogo usa `putIfAbsent` cuando quiere rechazar duplicados.

En Tienda Aurora el catálogo usa varias a la vez porque cada pregunta tiene una forma natural. `LinkedHashMap<Sku, Producto>` responde “dame el producto por SKU” y además conserva el orden de alta, que es el que ve el operador en `catalogo`. `TreeMap<String, Set<Sku>>` responde “dame las etiquetas ordenadas alfabéticamente”. `TreeSet<Sku>` responde “dame los SKUs de esta etiqueta sin duplicados y en orden”.

La salida de `catalogo` muestra el orden de alta tal cual se insertó en el `LinkedHashMap`:

```text
Catálogo en orden de alta (5 productos)
  CAF-0001  Café Aurora          $12.50  [bebida, cafe, destacado]
  MOL-0003  Molino manual        $34.90  [cafe, equipo]
  TAZ-0002  Taza Aurora           $8.00  [equipo, regalo]
  FIL-0004  Filtros x100          $4.75  [cafe, consumible]
  CUR-0100  Curso de barismo     $49.00  [digital, formacion]
```

Y la salida de `etiquetas` muestra el `TreeMap` ordenado y el `TreeSet` de SKUs dentro de `cafe`:

```text
Conteo por etiqueta
  bebida       1
  cafe         3
  consumible   1
  destacado    1
  digital      1
  equipo       2
  formacion    1
  regalo       1

Productos con la etiqueta 'cafe'
  CAF-0001  Café Aurora
  FIL-0004  Filtros x100
  MOL-0003  Molino manual
```

La decisión práctica no es memorizar una tabla de complejidades, aunque ayuda. La decisión es declarar la intención en el tipo y en la implementación. Si usas `List` para búsquedas por clave, el código funciona con diez elementos y se degrada con diez mil. Si usas `HashSet` y asumes orden, el código funciona hoy y falla mañana con otra versión de JVM o con otro patrón de inserciones. El tipo correcto hace que el comportamiento sea parte del contrato.

### Tema 2: El contrato de equals y hashCode · Intermedio · 45 min

Las colecciones hash no buscan comparando un elemento con todos los demás. Primero calculan el `hashCode()` de la clave, lo convierten en un índice de bucket y solo después usan `equals()` dentro de ese bucket para distinguir colisiones. Ese atajo es la razón de su velocidad y también la razón de su fragilidad: si `equals` y `hashCode` no están de acuerdo, la estructura se comporta de forma incorrecta sin lanzar una excepción.

El contrato es preciso. Si dos objetos son iguales según `equals`, deben devolver el mismo `hashCode`. Si dos objetos tienen el mismo `hashCode`, no tienen que ser iguales: eso es una colisión y `equals` la resuelve. `equals` debe ser reflexivo (`x.equals(x)`), simétrico, transitivo, consistente y devolver `false` ante `null`. `hashCode` debe ser consistente mientras no cambien los campos usados por `equals`.

En Tienda Aurora, `Sku` se usa como clave. Dos SKUs escritos distinto pero equivalentes tras normalizar deben comportarse como el mismo valor. El record genera `equals` y `hashCode` a partir de `valor`, y el constructor compacto normaliza antes de asignar. Por eso `"caf-0001"` y `" CAF_0001 "` terminan en el mismo objeto lógico.

La auditoría lo demuestra con un `HashSet`:

```text
1. Contrato de equals y hashCode
  a           -> CAF-0001
  b           -> CAF-0001
  a.equals(b) -> true
  hash igual  -> true
  HashSet     -> 1 elemento(s)
```

Si `Sku` tuviera `equals` correcto pero `hashCode` mal implementado —por ejemplo, devolviendo `System.identityHashCode(this)`— los dos objetos iguales podrían caer en buckets distintos y el `HashSet` guardaría dos elementos. El bug no se ve como una excepción; se ve como un duplicado lógico que rompe inventario, facturación o reportes.

La regla de implementación es conservadora: usa los mismos campos en `equals` y en `hashCode`. Para records, el compilador ya lo hace. Para clases manuales, `Objects.equals` y `Objects.hash` reducen errores. No incluyas campos mutables ni campos que no participen de la identidad lógica. Y si sobrescribes uno, sobrescribe el otro: es un contrato de pareja, no dos métodos independientes.

### Tema 3: Claves mutables y el mapa que pierde entradas · Intermedio · 40 min

El contrato de `equals`/`hashCode` tiene una consecuencia que muchos bugs de producción ignoran: el hash se calcula cuando la clave entra a la estructura. Si después mutas un campo que participa en `equals`/`hashCode`, el objeto sigue guardado en el bucket viejo, pero la próxima búsqueda calcula un hash nuevo y mira en otro bucket. El mapa no perdió la entrada por corrupción de memoria; la perdió porque la clave dejó de ser la misma clave.

Tienda Aurora conserva `CodigoLegado` para mostrar este caso. Es una clase mutable con `equals`/`hashCode` basados en `valor`. La auditoría inserta la clave, la muta y luego la busca:

```text
2. Clave mutable en un HashMap
  antes de mutar  -> Café Aurora
  después de mutar -> null
  tamaño del mapa -> 1
  la entrada sigue al recorrer -> [Café Aurora]
  con Sku inmutable -> Café Aurora
```

Hay tres observaciones importantes en esa salida. `get` devuelve `null` aunque el mapa sigue teniendo tamaño 1. La entrada no desapareció: está en el bucket equivocado. Y al recorrer los valores, aparece `Café Aurora`, porque la iteración no depende de buscar por hash de la clave mutada. Ese comportamiento es especialmente dañino porque el sistema parece “medio funcionar”.

La corrección no es “tener cuidado al mutar”. La corrección es hacer que la clave no pueda mutar. `Sku` es un record con un componente final; una vez normalizado, no hay API para cambiarlo. Si un dominio necesita una clave con estado cambiante, usa un identificador inmutable como clave y guarda el estado mutable como valor. Para entidades JPA o modelos persistidos, la clave del mapa suele ser el ID, no la entidad completa.

También conviene evitar usar arreglos o colecciones mutables como componentes de claves hash. Un record con un `List` mutable puede ser técnicamente “modificable” a través de la lista. `List.copyOf` y `Collections.unmodifiableSet`, como usa `Pedido` y `Producto`, cierran esa puerta.

### Tema 4: Genéricos, wildcards y type erasure · Intermedio · 45 min

Los genéricos permiten parametrizar tipos. `Repositorio<T, ID>` no sabe qué es `T`; sabe que `guardar` recibe un `ID` y un `T`, y que `buscar` devuelve un `Optional<T>`. El llamador concreta el contrato: `Repositorio<Producto, Sku>`. El compilador comprueba que no guardes un `Pedido` donde se esperan productos y que no trates el resultado como si fuera otra cosa. Sin genéricos, el mismo repositorio devolvería `Object` y los errores aparecerían como `ClassCastException` en runtime.

Los wildcards expresan flexibilidad controlada. `? extends Producto` significa “algún subtipo desconocido de `Producto`”. Puedes leer elementos como `Producto`, pero no puedes agregar un `Producto` cualquiera porque el tipo real podría ser una lista de `ProductoFisico`. `? super Producto` significa “algún supertipo desconocido de `Producto`”. Puedes escribir un `Producto`, pero al leer solo obtienes `Object`. La regla práctica se conoce como PECS: *Producer Extends, Consumer Super*. Si el parámetro produce valores que vas a leer, usa `extends`. Si consume valores que vas a escribir, usa `super`.

En el proyecto, `Catalogo.valorDe(List<? extends Producto> productos)` usa `extends` porque solo lee productos para sumar precios. Eso permite pasar una `List<Producto>` sin problemas, y también permitiría pasar una lista de un subtipo. `Pagina.map` usa `Function<? super T, ? extends R>` por el mismo motivo: acepta funciones más flexibles que la firma mínima.

El borrado de tipos (*type erasure*) es la contrapartida. El compilador usa los genéricos para verificar tipos, pero en bytecode la mayoría de esa información parametrizada se borra. `List<String>` y `List<Integer>` son dos tipos distintos para el compilador; en runtime, ambos son `ArrayList`. La auditoría lo muestra:

```text
3. Borrado de tipos
  List<String> y List<Integer> comparten clase -> true
  clase en ejecución -> ArrayList
  valor con List<Producto> -> $109.15
  valor con List<? extends Producto> -> $109.15
```

El borrado explica varias restricciones. No puedes hacer `new T()` porque en runtime `T` no existe. No puedes hacer `instanceof List<String>` por la misma razón. No puedes crear `new List<String>[10]`. Y no puedes sobrecargar dos métodos que solo difieran en el parámetro genérico, porque después del borrado tendrían la misma firma. El error real capturado con `javac` es:

```text
ErasureInvalido.java:4: error: name clash: procesar(List<Integer>) and procesar(List<String>) have the same erasure
    void procesar(List<Integer> valores) {
         ^
1 error
```

El borrado no significa que los genéricos “no existan”. Existen en compilación, existen en firmas y metadatos de reflexión (`Signature` en `javap`), y existen para que el compilador inserte casts seguros. Significa que el runtime no conoce el argumento de tipo de una instancia concreta de `ArrayList`. Diseñar con esa realidad evita trucos frágiles.

### Tema 5: Comparable vs Comparator, e iteración · Intermedio · 35 min

Ordenar una colección requiere responder una pregunta: ¿quién define el orden? Si el orden es natural al objeto, va en el objeto. Si el orden depende del caso de uso, va fuera.

`Comparable<T>` define el orden natural. `Sku implements Comparable<Sku>` dice que un SKU sabe compararse con otro SKU. `Producto implements Comparable<Producto>` delega en el SKU. `Dinero implements Comparable<Dinero>` compara centavos. El contrato de `compareTo` devuelve un negativo si `this` va antes, cero si son equivalentes en ese orden y un positivo si va después. Debe ser consistente con `equals` siempre que sea posible: si `compareTo` devuelve 0 pero `equals` devuelve `false`, estructuras ordenadas como `TreeSet` pueden considerar dos objetos equivalentes y descartar uno.

`Comparator<T>` define un orden externo. `Comparadores.POR_PRECIO` ordena por precio y desempata por SKU. `POR_NOMBRE` usa `String.CASE_INSENSITIVE_ORDER` y desempata por SKU. `POR_PRIORIDAD` ordena por la prioridad del enum y después por número de pedido. Ninguno de estos órdenes es “el” orden natural de producto o pedido; son vistas.

La salida de la auditoría muestra los dos comparadores sobre el mismo catálogo:

```text
4. Comparable y Comparator
  orden por precio:
    FIL-0004  Filtros x100       $4.75
    TAZ-0002  Taza Aurora        $8.00
    CAF-0001  Café Aurora        $12.50
    MOL-0003  Molino manual      $34.90
    CUR-0100  Curso de barismo   $49.00
  orden por nombre:
    Café Aurora        $12.50
    Curso de barismo   $49.00
    Filtros x100       $4.75
    Molino manual      $34.90
    Taza Aurora        $8.00
```

La iteración es la otra mitad del problema. Recorrer una colección mientras la modificas con la API equivocada produce `ConcurrentModificationException` o comportamiento inesperado. La regla simple es: para eliminar durante el recorrido, usa `Iterator.remove()`, `removeIf(...)` o construye una nueva colección. No hagas `lista.remove(...)` dentro de un `for-each` sobre la misma lista. En el código de este módulo, la paginación y los reportes recorren colecciones sin modificarlas, y cuando `ColaPedidos` necesita exponer pendientes ordenados crea una copia antes de ordenar.

### Tema 6: Colas y pilas: Queue, Deque, ArrayDeque y PriorityQueue · Intermedio · 40 min

Una cola modela espera. Una pila modela deshacer. La interfaz `Queue<E>` define operaciones de cola: `offer`/`add` para encolar, `poll`/`remove` para desencolar, `peek`/`element` para mirar el frente. La interfaz `Deque<E>` es una cola de doble extremo: permite insertar y quitar por ambos lados, así que puede comportarse como cola FIFO o como pila LIFO.

`ArrayDeque` es la implementación moderna de uso general para pilas y colas en memoria. Es más eficiente que la vieja clase `Stack`, que hereda de `Vector` y sincroniza métodos. También suele ser mejor opción que `LinkedList` como cola pura, porque no crea nodos por elemento. Para usarla como pila, usa `push` y `pop` (o `addFirst`/`removeFirst`). Para usarla como cola, usa `addLast`/`offerLast` y `pollFirst`/`removeFirst`.

`PriorityQueue` es otra cosa: no entrega por orden de llegada, sino por prioridad. Internamente es un heap. El elemento que sale con `poll()` es el menor según el `Comparator` o el orden natural. Eso es perfecto para “atiende primero lo más urgente”, pero tiene una trampa: iterar la `PriorityQueue` no recorre en orden ordenado. Si necesitas mostrar los pendientes en orden, crea una copia y ordénala, como hace `ColaPedidos.pendientes()`.

En Tienda Aurora, la mesa de preparación recibe cinco pedidos con prioridades mezcladas. La prioridad se define en `Comparadores.POR_PRIORIDAD`: primero el enum `Prioridad` (EXPRESS, ESTANDAR, ECONOMICA) y después el número de pedido. El resultado visible es que EXPRESS sale antes aunque haya llegado después:

```text
Espera ordenada por prioridad:
  AUR-1002  EXPRESS   Luis     $34.90
  AUR-1004  EXPRESS   Pablo    $49.00
  AUR-1003  ESTANDAR  Ana      $32.00
  AUR-1005  ESTANDAR  Elena    $37.50
  AUR-1001  ECONOMICA Marta    $29.75
```

El deshacer usa una pila. Cuando se atiende un pedido, se saca de la `PriorityQueue` y se hace `push` al historial. Cuando se deshace, se hace `poll` del historial y se vuelve a insertar en la cola de prioridad. La salida lo confirma: se atiende hasta vaciar, se deshace `AUR-1001` y vuelve a quedar en espera.

Los avisos usan la misma clase `ArrayDeque`, pero con disciplina FIFO. `addLast` encola un aviso nuevo; `pollFirst` entrega el más antiguo. En la salida, el primer aviso consumido es `Recibido AUR-1001 (ECONOMICA)` y quedan 10 avisos pendientes. Esta es una lección útil: la estructura de datos ofrece capacidades; el nombre del método que eliges documenta el contrato que estás aplicando.

## Cierre

Las colecciones no son contenedores intercambiables. Una `List` expresa secuencia, un `Set` expresa unicidad, un `Map` expresa acceso por clave, una `PriorityQueue` expresa urgencia y un `Deque` puede expresar fila o pila según cómo lo uses. Los genéricos hacen que esos contratos sean comprobables por el compilador, y `equals`/`hashCode` hacen que las colecciones hash sean confiables.

El criterio de diseño que conviene llevarse de este módulo es concreto: antes de crear una colección, escribe en una frase qué pregunta debe responder. Esa frase te dice qué interfaz usar. Después elige la implementación por orden, costo y semántica de unicidad. Si la clave puede mutar, no es una clave. Si el orden importa, decláralo. Si el tipo se borra en runtime, no diseñes como si estuviera ahí.

## Checklist

- Elegí `List`, `Set`, `Map`, `Queue` o `Deque` según la pregunta que el código necesita responder.
- Implementé `equals` y `hashCode` con los mismos campos y mantuve inmutables las claves usadas en estructuras hash.
- No expuse colecciones internas mutables; devolví copias o vistas inmodificables.
- Usé genéricos y wildcards para expresar contratos reutilizables sin caer en `raw types`.
- Distinguí `Comparable` (orden natural) de `Comparator` (orden contextual).
- Usé `ArrayDeque` para pila/cola en memoria y `PriorityQueue` cuando la prioridad importa más que el orden de llegada.
- Pude explicar el efecto del borrado de tipos y por qué no se pueden sobrecargar métodos que solo difieren en genéricos.
