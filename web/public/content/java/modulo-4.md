# Módulo 4: Streams y programación funcional

Cuando el módulo 2 te dejó con colecciones y el módulo 3 con errores controlados, el siguiente problema práctico es transformar datos sin escribir bucles imperativos por todos lados. Tienda Aurora necesita responder preguntas como: qué productos activos hay en una categoría, cuál es el valor de inventario por categoría, cuánto facturó un conjunto de pedidos, quiénes son los mejores clientes, o qué ciudades fueron atendidas. Se puede resolver con `for`, acumuladores y mapas mutables; Java Streams permite expresar la intención como un pipeline de transformación.

Un stream no es una colección. Es una secuencia de elementos que se consume una vez, con operaciones intermedias perezosas (`filter`, `map`, `sorted`) y una operación terminal (`collect`, `reduce`, `forEach`, `toList`) que dispara la ejecución. La ventaja no es “menos líneas”, sino separar qué quieres calcular de cómo iterar. El costo es que un pipeline opaco también puede ser difícil de leer; el criterio es usar streams cuando aclaran la transformación, no por moda.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-4-streams.html"
    alt="Pipeline de Java Streams con fuente, operaciones intermedias, gather, terminal y Optional"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Fuente → operaciones intermedias perezosas → terminal. Optional hace explícita la ausencia.</figcaption>
</figure>

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-streams/src/main/java/com/aurora/streams/{dominio,reporte}
mkdir -p tienda-aurora-streams/src/test/java/com/aurora/streams
cd tienda-aurora-streams
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-streams"
```

#### `build.gradle.kts`

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
    mainClass = "com.aurora.streams.TiendaAuroraStreamsApp"
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test { useJUnitPlatform() }

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

#### Dominio

Los records hacen el dominio pequeño e inmutable. Las validaciones fallan temprano y evitan que un pipeline procese datos ambiguos.

#### `Categoria.java`

```java
package com.aurora.streams.dominio;

public enum Categoria {
    BEBIDAS,
    ACCESORIOS,
    MOLIENDA,
    LIMPIEZA
}
```

#### `Cliente.java`

```java
package com.aurora.streams.dominio;

import java.util.Objects;

public record Cliente(String id, String nombre, String ciudad) {
    public Cliente {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(nombre, "nombre");
        Objects.requireNonNull(ciudad, "ciudad");
        id = id.trim();
        nombre = nombre.trim();
        ciudad = ciudad.trim();
        if (id.isBlank()) throw new IllegalArgumentException("id vacío");
        if (nombre.isBlank()) throw new IllegalArgumentException("nombre vacío");
        if (ciudad.isBlank()) throw new IllegalArgumentException("ciudad vacío");
    }
}
```

#### `Producto.java`

```java
package com.aurora.streams.dominio;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record Producto(
        String sku,
        String nombre,
        Categoria categoria,
        BigDecimal precio,
        int stock,
        boolean activo
) {
    public Producto {
        Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(nombre, "nombre");
        Objects.requireNonNull(categoria, "categoria");
        Objects.requireNonNull(precio, "precio");
        sku = sku.trim().toUpperCase();
        nombre = nombre.trim();
        if (sku.isBlank()) throw new IllegalArgumentException("sku vacío");
        if (nombre.isBlank()) throw new IllegalArgumentException("nombre vacío");
        if (precio.signum() <= 0) throw new IllegalArgumentException("precio inválido: " + precio);
        if (stock < 0) throw new IllegalArgumentException("stock negativo: " + stock);
        precio = precio.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal valorInventario() {
        return precio.multiply(BigDecimal.valueOf(stock));
    }
}
```

#### `LineaPedido.java`

```java
package com.aurora.streams.dominio;

import java.math.BigDecimal;
import java.util.Objects;

public record LineaPedido(String sku, int cantidad, BigDecimal precioUnitario) {
    public LineaPedido {
        Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(precioUnitario, "precioUnitario");
        sku = sku.trim().toUpperCase();
        if (sku.isBlank()) throw new IllegalArgumentException("sku vacío");
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad inválida: " + cantidad);
        if (precioUnitario.signum() <= 0) throw new IllegalArgumentException("precio inválido");
    }

    public BigDecimal subtotal() {
        return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}
```

#### `Pedido.java`

`total()` usa `stream().map(...).reduce(...)`: un ejemplo pequeño de pipeline dentro del dominio. Es aceptable aquí porque la intención es clara; si el cálculo creciera, podría extraerse.

```java
package com.aurora.streams.dominio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

public record Pedido(String id, String clienteId, LocalDate fecha, List<LineaPedido> lineas) {
    public Pedido {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(clienteId, "clienteId");
        Objects.requireNonNull(fecha, "fecha");
        Objects.requireNonNull(lineas, "lineas");
        id = id.trim();
        clienteId = clienteId.trim();
        if (id.isBlank()) throw new IllegalArgumentException("id vacío");
        if (clienteId.isBlank()) throw new IllegalArgumentException("clienteId vacío");
        lineas = List.copyOf(lineas);
    }

    public BigDecimal total() {
        return lineas.stream()
                .map(LineaPedido::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

#### Reportes

#### `CatalogoProductos.java`

Muestra filtros, mapeos, ordenamiento, collectors y `Optional`. `activosDe` filtra por activo y categoría, luego ordena por nombre. `valorInventarioPorCategoria` agrupa y reduce con `Collectors.groupingBy` + `reducing`. `buscarPorSku` devuelve `Optional<Producto>`: la ausencia es parte del contrato.

```java
package com.aurora.streams.reporte;

import com.aurora.streams.dominio.Categoria;
import com.aurora.streams.dominio.Producto;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class CatalogoProductos {

    private final List<Producto> productos;

    public CatalogoProductos(List<Producto> productos) {
        this.productos = List.copyOf(productos);
    }

    public List<Producto> activosDe(Categoria categoria) {
        return productos.stream()
                .filter(Producto::activo)
                .filter(p -> p.categoria() == categoria)
                .sorted(Comparator.comparing(Producto::nombre))
                .toList();
    }

    public List<String> nombresAgotados() {
        return productos.stream()
                .filter(Producto::activo)
                .filter(p -> p.stock() == 0)
                .map(Producto::nombre)
                .sorted()
                .toList();
    }

    public Map<Categoria, BigDecimal> valorInventarioPorCategoria() {
        return productos.stream()
                .filter(Producto::activo)
                .collect(Collectors.groupingBy(
                        Producto::categoria,
                        Collectors.reducing(BigDecimal.ZERO, Producto::valorInventario, BigDecimal::add)
                ));
    }

    public Optional<Producto> buscarPorSku(String sku) {
        String buscado = sku == null ? "" : sku.trim().toUpperCase();
        return productos.stream()
                .filter(p -> p.sku().equals(buscado))
                .findFirst();
    }

    public Optional<Producto> masCaro() {
        return productos.stream()
                .filter(Producto::activo)
                .max(Comparator.comparing(Producto::precio));
    }

    public List<Producto> todos() {
        return productos;
    }
}
```

#### `ReporteVentas.java`

Combina `flatMap` para desarmar líneas de pedido, `groupingBy` para sumar unidades, y `Gatherers.windowFixed` para ventanas de totales. También muestra la resolución segura de ausencia con `Optional.ofNullable`.

```java
package com.aurora.streams.reporte;

import com.aurora.streams.dominio.Cliente;
import com.aurora.streams.dominio.LineaPedido;
import com.aurora.streams.dominio.Pedido;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Gatherers;

public final class ReporteVentas {

    private final List<Pedido> pedidos;
    private final Map<String, Cliente> clientesPorId;

    public ReporteVentas(List<Pedido> pedidos, List<Cliente> clientes) {
        this.pedidos = List.copyOf(pedidos);
        this.clientesPorId = clientes.stream()
                .collect(Collectors.toUnmodifiableMap(Cliente::id, c -> c));
    }

    public BigDecimal totalFacturado() {
        return pedidos.stream()
                .map(Pedido::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Map<String, Long> unidadesPorSku() {
        return pedidos.stream()
                .flatMap(p -> p.lineas().stream())
                .collect(Collectors.groupingBy(LineaPedido::sku, Collectors.summingLong(LineaPedido::cantidad)));
    }

    public List<String> topClientesPorGasto(int limite) {
        Map<String, BigDecimal> gastoPorCliente = pedidos.stream()
                .collect(Collectors.groupingBy(
                        Pedido::clienteId,
                        Collectors.reducing(BigDecimal.ZERO, Pedido::total, BigDecimal::add)
                ));
        return gastoPorCliente.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(limite)
                .map(e -> nombreCliente(e.getKey()) + "=" + e.getValue())
                .toList();
    }

    public String nombreCliente(String clienteId) {
        return java.util.Optional.ofNullable(clientesPorId.get(clienteId))
                .map(Cliente::nombre)
                .orElse("Cliente " + clienteId);
    }

    public List<String> ciudadesAtendidas() {
        Set<String> idsClientes = pedidos.stream()
                .map(Pedido::clienteId)
                .collect(Collectors.toSet());
        return idsClientes.stream()
                .map(clientesPorId::get)
                .filter(java.util.Objects::nonNull)
                .map(Cliente::ciudad)
                .distinct()
                .sorted()
                .toList();
    }

    public List<List<BigDecimal>> ventanasDeTotales(int tamano) {
        return pedidos.stream()
                .sorted(Comparator.comparing(Pedido::fecha).thenComparing(Pedido::id))
                .map(Pedido::total)
                .gather(Gatherers.windowFixed(tamano))
                .toList();
    }
}
```

#### `TiendaAuroraStreamsApp.java`

CLI mínima para ejecutar los reportes y una auditoría de operaciones de stream/Optional/gather/parallel.

```java
package com.aurora.streams;

import com.aurora.streams.dominio.Categoria;
import com.aurora.streams.dominio.Cliente;
import com.aurora.streams.dominio.LineaPedido;
import com.aurora.streams.dominio.Pedido;
import com.aurora.streams.dominio.Producto;
import com.aurora.streams.reporte.CatalogoProductos;
import com.aurora.streams.reporte.ReporteVentas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.IntStream;

public final class TiendaAuroraStreamsApp {

    public static void main(String[] args) {
        String comando = args.length == 0 ? "demo" : args[0];
        switch (comando) {
            case "catalogo" -> mostrarCatalogo();
            case "ventas" -> mostrarVentas();
            case "auditoria" -> auditoria();
            case "demo" -> {
                mostrarCatalogo();
                System.out.println();
                mostrarVentas();
            }
            default -> {
                System.err.println("Comando desconocido: " + comando);
                System.err.println("Usa: catalogo | ventas | auditoria");
                System.exit(2);
            }
        }
    }

    private static void mostrarCatalogo() {
        CatalogoProductos catalogo = cargarCatalogo();
        System.out.println("== Catalogo ==");
        System.out.println("Bebidas activas:");
        catalogo.activosDe(Categoria.BEBIDAS)
                .forEach(p -> System.out.println("  - " + p.sku() + " " + p.nombre() + " $" + p.precio()));

        System.out.println("Agotados: " + String.join(", ", catalogo.nombresAgotados()));

        System.out.println("Valor inventario por categoria:");
        catalogo.valorInventarioPorCategoria().entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.comparing(Enum::name)))
                .forEach(e -> System.out.println("  " + e.getKey() + "=" + e.getValue()));

        catalogo.buscarPorSku("MOL-200")
                .ifPresentOrElse(
                        p -> System.out.println("SKU MOL-200: " + p.nombre()),
                        () -> System.out.println("SKU MOL-200: no encontrado")
                );
        catalogo.buscarPorSku("XXX-999")
                .ifPresentOrElse(
                        p -> System.out.println("SKU XXX-999: " + p.nombre()),
                        () -> System.out.println("SKU XXX-999: no encontrado")
                );

        catalogo.masCaro().ifPresent(p -> System.out.println("Mas caro: " + p.nombre() + " $" + p.precio()));
    }

    private static void mostrarVentas() {
        ReporteVentas reporte = cargarReporte();
        System.out.println("== Ventas ==");
        System.out.println("Total facturado: $" + reporte.totalFacturado());
        System.out.println("Unidades por SKU:");
        reporte.unidadesPorSku().entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry::getKey))
                .forEach(e -> System.out.println("  " + e.getKey() + "=" + e.getValue()));
        System.out.println("Top clientes: " + String.join(", ", reporte.topClientesPorGasto(2)));
        System.out.println("Ciudades: " + String.join(", ", reporte.ciudadesAtendidas()));
        System.out.println("Ventanas de totales (2): " + reporte.ventanasDeTotales(2));
    }

    private static void auditoria() {
        System.out.println("== Auditoria ==");
        Optional<String> presente = Optional.of("CAF-100");
        Optional<String> ausente = Optional.empty();
        System.out.println("Optional presente: " + presente.map(String::toLowerCase).orElse("NA"));
        System.out.println("Optional ausente: " + ausente.map(String::toLowerCase).orElse("NA"));

        List<Integer> pesos = List.of(1, 6, 3, 8, 2, 10);
        int totalPesados = pesos.stream().filter(p -> p > 5).mapToInt(Integer::intValue).sum();
        System.out.println("Suma filtrada: " + totalPesados);

        List<String> skus = List.of("CAF-100", "CAF-100", "MOL-200", "FIL-300");
        String distintos = skus.stream().distinct().sorted().collect(java.util.stream.Collectors.joining(","));
        System.out.println("SKUs distintos: " + distintos);

        List<List<Integer>> ventanas = IntStream.rangeClosed(1, 5)
                .boxed()
                .gather(java.util.stream.Gatherers.windowFixed(2))
                .toList();
        System.out.println("Gatherers windowFixed: " + ventanas);

        int sumaParalela = IntStream.rangeClosed(1, 1000).parallel().sum();
        System.out.println("Parallel sum: " + sumaParalela);

        String refs = List.of("cafe", "taza").stream().map(String::toUpperCase).toList().toString();
        System.out.println("Method ref: " + refs);
    }

    private static CatalogoProductos cargarCatalogo() {
        return new CatalogoProductos(List.of(
                new Producto("CAF-100", "Cafe Aurora", Categoria.BEBIDAS, bd("14.90"), 8, true),
                new Producto("CAF-101", "Cafe Sierra", Categoria.BEBIDAS, bd("16.50"), 0, true),
                new Producto("TEA-100", "Te Andino", Categoria.BEBIDAS, bd("11.00"), 15, true),
                new Producto("MOL-200", "Molino Manual", Categoria.MOLIENDA, bd("79.90"), 3, true),
                new Producto("FIL-300", "Filtros V60", Categoria.ACCESORIOS, bd("9.50"), 25, true),
                new Producto("OLD-999", "Producto Retirado", Categoria.LIMPIEZA, bd("5.00"), 4, false)
        ));
    }

    private static ReporteVentas cargarReporte() {
        List<Cliente> clientes = List.of(
                new Cliente("C1", "Ana", "Lima"),
                new Cliente("C2", "Bruno", "Cusco"),
                new Cliente("C3", "Carla", "Lima")
        );
        List<Pedido> pedidos = List.of(
                new Pedido("P-001", "C1", LocalDate.of(2026, 11, 1), List.of(
                        new LineaPedido("CAF-100", 2, bd("14.90")),
                        new LineaPedido("FIL-300", 1, bd("9.50"))
                )),
                new Pedido("P-002", "C2", LocalDate.of(2026, 11, 2), List.of(
                        new LineaPedido("MOL-200", 1, bd("79.90"))
                )),
                new Pedido("P-003", "C1", LocalDate.of(2026, 11, 3), List.of(
                        new LineaPedido("TEA-100", 3, bd("11.00"))
                )),
                new Pedido("P-004", "C3", LocalDate.of(2026, 11, 4), List.of(
                        new LineaPedido("CAF-100", 1, bd("14.90")),
                        new LineaPedido("FIL-300", 2, bd("9.50"))
                ))
        );
        return new ReporteVentas(pedidos, clientes);
    }

    private static BigDecimal bd(String valor) {
        return new BigDecimal(valor);
    }
}
```

#### Test

```java
package com.aurora.streams;

import com.aurora.streams.dominio.*;
import com.aurora.streams.reporte.CatalogoProductos;
import com.aurora.streams.reporte.ReporteVentas;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ReporteVentasTest {
    @Test
    void totalYTop() {
        var clientes = List.of(new Cliente("C1","Ana","Lima"), new Cliente("C2","Bruno","Cusco"));
        var pedidos = List.of(
            new Pedido("P1","C1",LocalDate.of(2026,11,1), List.of(new LineaPedido("CAF-100",2,new BigDecimal("10.00")))),
            new Pedido("P2","C2",LocalDate.of(2026,11,2), List.of(new LineaPedido("MOL-200",1,new BigDecimal("50.00"))))
        );
        var r = new ReporteVentas(pedidos, clientes);
        assertEquals(new BigDecimal("70.00"), r.totalFacturado());
        assertEquals(List.of("Bruno=50.00","Ana=20.00"), r.topClientesPorGasto(2));
    }

    @Test
    void optionalYCatalogo() {
        var c = new CatalogoProductos(List.of(new Producto("CAF-100","Cafe",Categoria.BEBIDAS,new BigDecimal("10.00"),1,true)));
        assertTrue(c.buscarPorSku("CAF-100").isPresent());
        assertTrue(c.buscarPorSku("NOPE").isEmpty());
    }
}
```

### Tema 1: Stream API — map, filter, reduce, collect · Intermedio · 40 min

Un stream no es una colección ni un hilo: es una secuencia de valores sobre la que se construye un pipeline. El mecanismo tiene tres piezas. La **fuente** produce elementos (`lista.stream()`, `Stream.of(...)`, un generador, un archivo). Las **operaciones intermedias** (`filter`, `map`, `flatMap`, `sorted`, `distinct`, `limit`, `skip`) devuelven otro stream y son perezosas: registran una transformación, pero no recorren datos. La **operación terminal** (`collect`, `reduce`, `forEach`, `findFirst`, `count`, `toList`, `anyMatch`) consume el pipeline, dispara el trabajo y produce un valor o un efecto. Después de la terminal, el stream queda consumido: intentar reutilizarlo lanza `IllegalStateException`.

**Por qué existe:** en lugar de escribir cómo avanza un `for` —índice, acumulador, bandera— describes qué transformación quieres. Eso hace que el código se lea como una cadena de decisiones de negocio y permita cambiar la estrategia de ejecución sin reescribir la lógica. La ganancia no es “menos líneas”: es separar la intención (`filtrar activos`, `agrupar por categoría`, `sumar unidades`) del mecanismo de iteración.

**Implicación práctica:** la pereza importa. En `productos.stream().filter(...).map(...).toList()`, ni `filter` ni `map` hacen trabajo hasta que `toList()` lo pide. Eso permite que `findFirst()` o `limit(2)` corten el recorrido antes de procesar toda la fuente. Pero `sorted()` es una operación intermedia *stateful*: necesita ver todos los elementos antes de emitir el primero. Saber esto evita sorpresas de rendimiento.

En Tienda Aurora, `Pedido.total()` muestra un pipeline mínimo y legible:

```java
public BigDecimal total() {
    return lineas.stream()
            .map(LineaPedido::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
}
```

Cada línea se transforma en su subtotal (`map`, uno a uno) y todos los subtotales se combinan (`reduce`). La identidad `BigDecimal.ZERO` responde “¿qué vale la suma de cero líneas?”. `BigDecimal::add` es asociativo: `(a + b) + c == a + (b + c)`. Sin esas dos propiedades, el resultado podría cambiar si el stream se ejecuta en paralelo.

`map` y `flatMap` no son intercambiables. `map` produce un resultado por elemento de entrada. `flatMap` produce cero, uno o muchos elementos y los aplana en un solo stream. En `ReporteVentas.unidadesPorSku()`, cada pedido contiene varias líneas:

```java
public Map<String, Long> unidadesPorSku() {
    return pedidos.stream()
            .flatMap(p -> p.lineas().stream())
            .collect(Collectors.groupingBy(
                    LineaPedido::sku,
                    Collectors.summingLong(LineaPedido::cantidad)));
}
```

Si ahí usaras `map(p -> p.lineas().stream())`, tendrías un `Stream<Stream<LineaPedido>>`: un stream de streams, no un stream de líneas. `flatMap` es la herramienta correcta cuando la entrada es un contenedor y lo que quieres es su contenido.

`reduce` condensa todo el stream en un único valor. Es la elección natural para sumas, máximos o concatenaciones simples. `collect` es más general: delega en un `Collector`, que describe cómo crear un contenedor, cómo acumular, cómo combinar particiones y cómo entregar el resultado. Por eso `groupingBy`, `joining`, `summingLong` y `toUnmodifiableMap` viven en `collect`, no en `reduce`.

En `CatalogoProductos.valorInventarioPorCategoria()` se ve un collector con downstream:

```java
public Map<Categoria, BigDecimal> valorInventarioPorCategoria() {
    return productos.stream()
            .filter(Producto::activo)
            .collect(Collectors.groupingBy(
                    Producto::categoria,
                    Collectors.reducing(BigDecimal.ZERO, Producto::valorInventario, BigDecimal::add)
            ));
}
```

El `groupingBy` crea un mapa por categoría; el segundo collector decide qué se acumula dentro de cada grupo. Es una composición: primero filtrar, después agrupar, después sumar. La salida verificada de `demo` confirma el resultado:

```text
Valor inventario por categoria:
  ACCESORIOS=237.50
  BEBIDAS=284.20
  MOLIENDA=239.70
```

Y el `flatMap` de ventas produce:

```text
Unidades por SKU:
  CAF-100=3
  FIL-300=3
  TEA-100=3
  MOL-200=1
```

**Confusión común 1:** “stream es para todo”. Un `for` con dos variables, dos índices o una dependencia fuerte entre iteraciones suele ser más claro. Usa streams cuando el pipeline expresa una transformación; usa bucles cuando el algoritmo es imperativo por naturaleza.

**Confusión común 2:** mutar estado externo desde una lambda. `lista.forEach(x -> total += x)` compila en ciertos contextos, pero es frágil, pero oscurece la intención y rompe la corrección en paralelo. El pipeline debe producir valores, no esconder efectos.

**Confusión común 3:** confundir `reduce` con `collect`. `reduce` entrega un valor; `collect` construye un resultado estructurado. Para juntar elementos en una lista usa `toList()`, no un `reduce` con concatenación.

**Confusión común 4:** reutilizar un stream. Los streams son de un solo uso. Si necesitas recorrer dos veces la misma fuente, crea dos streams desde la colección o materializa el primero con `toList()`.

### Tema 2: Optional — evitar null explícitamente · Básico · 30 min

`Optional<T>` es un contenedor de cero o un valor. No es una colección de muchos elementos ni una caja mágica que elimina la ausencia: hace que la ausencia aparezca en la firma del método. El mecanismo es simple. `Optional.of(valor)` exige un valor no nulo; `Optional.ofNullable(valor)` produce `empty` si recibe `null`; `Optional.empty()` representa ausencia explícita. Sobre esa caja se aplican transformaciones (`map`, `flatMap`, `filter`) y se cierra con una operación que decide qué hacer si no hay valor (`orElse`, `orElseGet`, `orElseThrow`, `ifPresentOrElse`).

**Por qué existe:** con `null`, la ausencia es invisible. El compilador no obliga a comprobarla y el fallo aparece como `NullPointerException` en un punto lejano al origen. Con `Optional<Producto>` como retorno, el contrato dice: “puede no haber producto; decide qué hacer”. La decisión se traslada al llamador, donde está el contexto de negocio.

**Implicación práctica:** `map` transforma el valor solo si está presente. `buscarPorSku("MOL-200").map(Producto::nombre)` produce `Optional<String>`; si el SKU no existe, sigue siendo `empty` sin lanzar. `flatMap` se usa cuando la función de mapeo ya devuelve `Optional`: evita terminar con `Optional<Optional<X>>`. `filter` conserva el valor solo si cumple una condición. Todas estas operaciones son perezosas en el sentido de que no producen efectos fuera de la cadena; el valor final se obtiene al cerrar con una terminal.

En `CatalogoProductos` la ausencia es parte del contrato:

```java
public Optional<Producto> buscarPorSku(String sku) {
    String buscado = sku == null ? "" : sku.trim().toUpperCase();
    return productos.stream()
            .filter(p -> p.sku().equals(buscado))
            .findFirst();
}
```

`findFirst()` devuelve `Optional<Producto>` porque un stream puede estar vacío. El método no devuelve `null` ni lanza una excepción de negocio: entrega la ausencia al llamador. En el `main`, `ifPresentOrElse` hace explícitas las dos ramas:

```java
catalogo.buscarPorSku("MOL-200")
        .ifPresentOrElse(
                p -> System.out.println("SKU MOL-200: " + p.nombre()),
                () -> System.out.println("SKU MOL-200: no encontrado")
        );
```

Salida real del proyecto verificado:

```text
SKU MOL-200: Molino Manual
SKU XXX-999: no encontrado
```

La auditoría muestra el cierre con `map` y `orElse`:

```java
Optional<String> presente = Optional.of("CAF-100");
Optional<String> ausente = Optional.empty();
System.out.println("Optional presente: " + presente.map(String::toLowerCase).orElse("NA"));
System.out.println("Optional ausente: " + ausente.map(String::toLowerCase).orElse("NA"));
```

Resultado observado:

```text
Optional presente: caf-100
Optional ausente: NA
```

**`orElse` frente a `orElseGet`:** `orElse(valor)` recibe un valor ya calculado, por lo que la expresión se evalúa siempre, incluso cuando el `Optional` está presente. `orElseGet(() -> calcular())` recibe un `Supplier` y solo lo ejecuta si falta el valor. Usa `orElse` para defaults baratos —como una cadena literal— y `orElseGet` para costosos —consultar BD, leer archivo, construir objeto grande—. Para ausencias que son error, `orElseThrow(...)` convierte la falta en una excepción con mensaje de dominio.

**Por qué no `get()`:** `get()` lanza `NoSuchElementException` si el contenedor está vacío. Es equivalente a decir “sé que aquí hay valor” sin demostrarlo. Si esa certeza es real, `orElseThrow` la documenta mejor; si no lo es, `map`/`ifPresentOrElse` obligan a manejar el caso vacío.

**Confusión común 1:** usar `Optional` en campos, parámetros o DTOs por defecto. Su propósito principal es ser valor de retorno. En campos agrega una capa que hay que desempaquetar; en parámetros obligatorios, un `Optional` puede recibir `null` y empeorar el contrato. Para serialización JSON, un `Optional` suele ruidar el esquema; modela la ausencia con el campo ausente o con un valor de dominio explícito.

**Confusión común 2:** crear `Optional` solo para evitar un `if`. Si la ausencia es imposible o el flujo debe fallar, usa un tipo normal y valida. `Optional` no sustituye a los invariantes ni a las excepciones de dominio.

**Confusión común 3:** `Optional.of(null)`. Lanza `NullPointerException` inmediatamente; para valores que pueden ser nulos usa `ofNullable`. La idea no es esconder `null`, sino hacerlo imposible de propagar accidentalmente dentro del contenedor.

### Tema 3: Stream Gatherers (Java 24) · Avanzado · 35 min

Los gatherers extienden la Stream API con operaciones intermedias personalizadas cuando `map/filter/reduce` no alcanzan. `Stream.gather(Gatherer)` permite mantener estado local durante el procesamiento y emitir cero, uno o varios elementos por entrada. Java 24 incorpora gatherers integrados como `Gatherers.windowFixed`, `windowSliding`, `fold` y `scan`.

En `ReporteVentas.ventanasDeTotales`, `windowFixed(2)` agrupa totales en ventanas de tamaño fijo. Es más claro que mantener índices manuales. El gatherer es intermedio y perezoso, igual que `map`.

**Nota de versión:** Gatherers son de Java 24+. En este proyecto se verificó con JDK 27.0.1.0.2, donde funcionan. Si tu runtime es Java 21, no compilará este código; debes usar un JDK 24+ o reemplazar por lógica manual.

### Tema 4: Streams paralelos y referencias a métodos · Intermedio · 30 min

Una referencia a método (`Producto::nombre`, `String::toUpperCase`) es azúcar para una lambda que solo llama a un método existente. Mejora legibilidad cuando el nombre comunica bien la intención. No la fuerces si oscurece.

`parallelStream()` o `stream().parallel()` divide el trabajo entre hilos del ForkJoinPool común. Puede mejorar rendimiento en colecciones grandes, operaciones CPU-bound e independientes. También puede empeorar: overhead de partición, contención, boxing, orden, y fuente difícil de dividir. Nunca asumas; mide. Y nunca uses paralelo con estado mutable compartido.

En `auditoria()`, `IntStream.rangeClosed(1,1000).parallel().sum()` es seguro porque la reducción es independiente y asociativa. En datos pequeños, secuencial suele ser mejor.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m4` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run
./gradlew -q run --args="auditoria"
```

Resultados observados:

- `test`: 2 pruebas, 0 fallas.
- `run`: catálogo activo, agotados, valor por categoría, SKU presente/ausente con Optional, más caro, total facturado, unidades por SKU, top clientes, ciudades y ventanas de totales `[[39.30, 79.90], [33.00, 33.90]]`.
- `auditoria`: `Optional presente: caf-100`, `Optional ausente: NA`, `Suma filtrada: 24`, `SKUs distintos: CAF-100,FIL-300,MOL-200`, `Gatherers windowFixed: [[1, 2], [3, 4], [5]]`, `Parallel sum: 500500`, `Method ref: [CAFE, TAZA]`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `NullPointerException` en stream | Fuente o mapper retorna null | Revisar pipeline y datos | Filtrar/validar, usar `Optional` donde corresponda |
| Resultado inesperado en stream paralelo | Estado mutable compartido | Race en collectors/lambdas | Evitar side effects, usar collectors thread-safe |
| `IllegalStateException: stream has already been operated upon` | Reusar stream | Stack trace en segunda terminal op | Crear nuevo stream |
| Optional mal usado | `get()` sin verificar, campos Optional | NPE/ruido | `orElseThrow/orElse/map`; no usar Optional en campos/params salvo criterio |
| Collector lento/memoria alta | Materializar innecesariamente | Perfil, tamaño colección | Usar streams con criterio, no por moda |

## Cierre

Streams no reemplazan el pensamiento de colecciones; lo complementan. Un buen pipeline es legible, no muta estado externo y termina en una operación que expresa el resultado. En el siguiente módulo, el foco pasa a concurrencia: cuando varias tareas compiten por CPU, I/O y estado compartido, la claridad del pipeline no basta si el modelo de ejecución es incorrecto.

## Checklist

- [ ] Distingo operación intermedia perezosa de terminal.
- [ ] Uso `flatMap` cuando necesito aplanar.
- [ ] Uso `Optional` como contrato de ausencia, sin `get()` ciego.
- [ ] Sé cuándo un gatherer aporta claridad.
- [ ] No uso `parallelStream()` sin medir y sin asegurar independencia.
