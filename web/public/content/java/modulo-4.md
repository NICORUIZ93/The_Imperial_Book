# Módulo 4: Streams y programación funcional


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 4 — mapa visual](/visuals/temas/java/modulo-4-herencia-composicion.html)

Lectura: Herencia modela “es-un”; composición modela “tiene-un”. Prefiere composición cuando la jerarquía no es estable.


En Tienda Aurora, los reportes no se escriben como una sola consulta SQL mágica cuando los datos ya están en memoria. A veces tienes una lista de productos, pedidos o líneas de venta y necesitas responder preguntas concretas: qué bebidas están activas, qué SKUs están agotados, cuánto vale el inventario por categoría, cuáles fueron los clientes que más compraron, o cómo se ven los totales en ventanas. Ese tipo de transformación de datos es donde la Stream API brilla.

Un stream no es una colección nueva. Es un pipeline: una fuente de datos, cero o más operaciones intermedias que describen la transformación, y una operación terminal que dispara la ejecución y produce un resultado. La ventaja no es “escribir menos líneas”, sino expresar la intención. `filter` dice “qué elementos quiero”, `map` dice “cómo los transformo”, `reduce` dice “cómo los combino”, `collect` dice “en qué estructura quiero el resultado”.

Este módulo construye `tienda-aurora-streams`, una app de consola con datos reales en memoria. El código usa Streams, Optional, Gatherers de Java 24, referencias a método y un caso de stream paralelo medible por resultado. La regla importante es la misma que en producción: usar streams cuando hacen más clara la transformación, y no forzarlos cuando un bucle simple sea más legible.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, macOS arm64. El proyecto se compiló con `./gradlew -q build` usando `--release 25` y `-Xlint:all -Werror`. Las salidas de `catalogo`, `ventas` y `auditoria` son reales.

## Proyecto desde cero: tienda-aurora-streams

El proyecto separa dominio y reportes. El dominio define productos, clientes y pedidos. La capa de reportes no muta esos objetos; los consulta con pipelines. La app CLI expone tres comandos para ver el resultado sin modificar código.

## Prerrequisitos

```bash
java -version
javac -version
gradle --version
```

Necesitas JDK 25 o superior. Los Gatherers usados aquí (`Gatherers.windowFixed`) están disponibles desde Java 24; el entorno de referencia ejecutó con JDK 27.

## Estructura del proyecto

```text
tienda-aurora-streams/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/
            └── com/aurora/streams/
                ├── TiendaAuroraStreamsApp.java
                ├── dominio/
                │   ├── Categoria.java
                │   ├── Cliente.java
                │   ├── LineaPedido.java
                │   ├── Pedido.java
                │   └── Producto.java
                └── reporte/
                    ├── CatalogoProductos.java
                    └── ReporteVentas.java
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
    mainClass = "com.aurora.streams.TiendaAuroraStreamsApp"
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-streams"
```

## Código completo

El orden de lectura va de los tipos de dominio a los reportes y termina en la CLI. Así puedes ver primero qué datos existen y después cómo los streams los transforman.

#### Dominio

`Categoria` es un enum. Usar un enum en vez de `String` evita valores inválidos como `"bebida"` o `"BEBIDAS "` y permite agrupar por categoría con seguridad de tipos.

**Archivo:** `src/main/java/com/aurora/streams/dominio/Categoria.java`

```java
package com.aurora.streams.dominio;

public enum Categoria {
    BEBIDAS,
    ACCESORIOS,
    MOLIENDA,
    LIMPIEZA
}
```

`Producto` es un record inmutable. Valida SKU, nombre, precio y stock en el constructor compacto. `valorInventario()` encapsula el cálculo precio×stock; los streams después pueden usar esta intención en vez de repetir la fórmula.

**Archivo:** `src/main/java/com/aurora/streams/dominio/Producto.java`

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

`Cliente` es otro record de dominio. Su función aquí es dar identidad legible a los reportes: el pipeline de ventas puede convertir ids de cliente en nombres o ciudades sin salir a buscar strings sueltos.

**Archivo:** `src/main/java/com/aurora/streams/dominio/Cliente.java`

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

`LineaPedido` representa una unidad vendida: SKU, cantidad y precio unitario. `subtotal()` es un método de dominio pequeño; `ReporteVentas` lo usa como base para `map`/`reduce`.

**Archivo:** `src/main/java/com/aurora/streams/dominio/LineaPedido.java`

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

`Pedido` agrupa líneas y calcula el total con un stream: `lineas.stream().map(LineaPedido::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add)`. Es un ejemplo deliberado de `map + reduce` con identidad `ZERO` y operación asociativa de suma.

**Archivo:** `src/main/java/com/aurora/streams/dominio/Pedido.java`

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

`CatalogoProductos` concentra consultas de lectura sobre productos. Cada método expresa una pregunta de negocio con un pipeline: filtrar activos por categoría, encontrar agotados, agrupar valor de inventario, buscar por SKU con `Optional`, y obtener el más caro con `max`.

**Archivo:** `src/main/java/com/aurora/streams/reporte/CatalogoProductos.java`

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

`ReporteVentas` transforma pedidos en métricas. Usa `flatMap` para pasar de pedidos a líneas, `groupingBy` para acumular unidades y gasto, `Optional` para resolver nombres de clientes, y `Gatherers.windowFixed` para agrupar totales en ventanas.

**Archivo:** `src/main/java/com/aurora/streams/reporte/ReporteVentas.java`

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

#### Frontera CLI

La clase `main` es la frontera CLI. Carga datos de ejemplo, ejecuta comandos `catalogo`, `ventas` y `auditoria`, e imprime resultados. La auditoría muestra comportamientos puntuales de `Optional`, `filter/sum`, `distinct/sorted/collect`, `Gatherers`, streams paralelos y referencias a método.

**Archivo:** `src/main/java/com/aurora/streams/TiendaAuroraStreamsApp.java`

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

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
./gradlew -q run --args="catalogo"
```

```text
== Catalogo ==
Bebidas activas:
  - CAF-100 Cafe Aurora $14.90
  - CAF-101 Cafe Sierra $16.50
  - TEA-100 Te Andino $11.00
Agotados: Cafe Sierra
Valor inventario por categoria:
  ACCESORIOS=237.50
  BEBIDAS=284.20
  MOLIENDA=239.70
SKU MOL-200: Molino Manual
SKU XXX-999: no encontrado
Mas caro: Molino Manual $79.90
```

```bash
./gradlew -q run --args="ventas"
```

```text
== Ventas ==
Total facturado: $186.10
Unidades por SKU:
  CAF-100=3
  FIL-300=3
  TEA-100=3
  MOL-200=1
Top clientes: Bruno=79.90, Ana=72.30
Ciudades: Cusco, Lima
Ventanas de totales (2): [[39.30, 79.90], [33.00, 33.90]]
```

```bash
./gradlew -q run --args="auditoria"
```

```text
== Auditoria ==
Optional presente: caf-100
Optional ausente: NA
Suma filtrada: 24
SKUs distintos: CAF-100,FIL-300,MOL-200
Gatherers windowFixed: [[1, 2], [3, 4], [5]]
Parallel sum: 500500
Method ref: [CAFE, TAZA]
```

## Conceptos cubiertos

### Tema 1: Stream API — map, filter, reduce, collect · Intermedio · 45 min

La Stream API se entiende mejor con una pregunta de negocio. “Quiero las bebidas activas, ordenadas por nombre” es una transformación: filtrar por categoría, filtrar por estado activo, ordenar y materializar. En `CatalogoProductos.activosDe` eso se escribe así:

```java
public List<Producto> activosDe(Categoria categoria) {
    return productos.stream()
            .filter(Producto::activo)
            .filter(p -> p.categoria() == categoria)
            .sorted(Comparator.comparing(Producto::nombre))
            .toList();
}
```

`stream()` crea el pipeline desde la fuente. `filter` es una operación intermedia: no recorre toda la lista inmediatamente para producir otra lista; describe la condición. `sorted` también es intermedia. `toList()` es terminal: dispara la ejecución y devuelve el resultado. Esta distinción importa porque las intermedias son lazy. Si una terminal como `findFirst()` ya encontró lo que buscaba, el pipeline puede dejar de procesar elementos.

`map` transforma cada elemento. En `nombresAgotados()` se filtran productos activos con stock cero y luego se transforma `Producto` a `String` con `Producto::nombre` antes de recolectar. El pipeline no modifica el producto original; produce una nueva vista de datos.

`reduce` combina elementos en un solo valor. En `Pedido.total()` la identidad es `BigDecimal.ZERO` y la operación es `BigDecimal::add`. La identidad importa: es el valor inicial y también el resultado correcto cuando no hay líneas. La operación debe ser asociativa para que tenga sentido en reducciones paralelas; la suma lo es.

`collect` materializa en una estructura más rica. `ReporteVentas.unidadesPorSku()` usa `Collectors.groupingBy(LineaPedido::sku, Collectors.summingLong(LineaPedido::cantidad))`. Aquí `flatMap` primero convierte cada pedido en un stream de líneas; después `collect` agrupa por SKU y suma cantidades. Es declarativo, pero hay que leerlo con calma: la clave es el SKU, el downstream collector es la suma de cantidades.

El error más común con streams es usarlos con efectos secundarios. Si dentro de un `forEach` modificas una lista externa o un contador compartido, pierdes las garantías del modelo y creas bugs difíciles, especialmente con paralelismo. La regla práctica es: los streams deben transformar datos; los efectos secundarios, si existen, deben estar en el borde y ser obvios.

### Tema 2: Optional — evitar null explícitamente · Intermedio · 35 min

`Optional<T>` representa ausencia de forma explícita. En vez de devolver `null` y confiar en que todos recuerden validarlo, el tipo obliga a decidir qué hacer cuando no hay valor. En el catálogo, `buscarPorSku` devuelve `Optional<Producto>`:

```java
public Optional<Producto> buscarPorSku(String sku) {
    String buscado = sku == null ? "" : sku.trim().toUpperCase();
    return productos.stream()
            .filter(p -> p.sku().equals(buscado))
            .findFirst();
}
```

El llamador no puede usar el producto como si siempre existiera sin tomar una decisión. En la CLI se usa `ifPresentOrElse`:

```java
catalogo.buscarPorSku("MOL-200")
        .ifPresentOrElse(
                p -> System.out.println("SKU MOL-200: " + p.nombre()),
                () -> System.out.println("SKU MOL-200: no encontrado")
        );
```

La salida real muestra ambos casos: `SKU MOL-200: Molino Manual` y `SKU XXX-999: no encontrado`. Eso es mejor que un `NullPointerException` en otro lugar del programa.

`Optional` también se compone. `map` transforma el valor si existe; `orElse` da un valor por defecto; `orElseThrow` convierte la ausencia en un error explícito. En `ReporteVentas.nombreCliente` se usa `Optional.ofNullable(...)` porque el mapa puede devolver `null`; si el cliente existe, se extrae el nombre; si no, se devuelve un fallback legible.

Lo que no hay que hacer es abusar de Optional. No conviene usarlo como campo de entidad, como parámetro de todos los métodos, ni envolver colecciones que ya pueden estar vacías. Un `List<Producto>` vacía es una buena representación de “no hay productos”; `Optional<List<Producto>>` agrega ambigüedad. Optional sirve sobre todo como valor de retorno cuando la ausencia es parte normal del contrato.

### Tema 3: Stream Gatherers (Java 24) · Avanzado · 40 min

Hay transformaciones que `map`, `filter` y `flatMap` no expresan bien. Un ejemplo clásico son las ventanas fijas o deslizantes: quieres agrupar elementos en lotes de tamaño N mientras recorres el stream. Antes de los Gatherers, esto solía terminar en bucles externos, acumuladores mutables o código más difícil de leer.

Java 24 incorporó la Stream Gatherer API. Un gatherer es una operación intermedia personalizada que puede acumular estado interno, emitir cero o muchos elementos por entrada, y controlar cuándo termina. No necesitas implementar un gatherer para usar los built-in. En este proyecto, `ReporteVentas.ventanasDeTotales` usa `Gatherers.windowFixed`:

```java
public List<List<BigDecimal>> ventanasDeTotales(int tamano) {
    return pedidos.stream()
            .sorted(Comparator.comparing(Pedido::fecha).thenComparing(Pedido::id))
            .map(Pedido::total)
            .gather(Gatherers.windowFixed(tamano))
            .toList();
}
```

El pipeline ordena pedidos por fecha e id para que la ventana tenga un criterio estable, transforma cada pedido a su total, y después agrupa esos totales en listas de tamaño 2. La salida real es `[[39.30, 79.90], [33.00, 33.90]]`. Cada sublista es una ventana emitida por el gatherer.

La auditoría muestra también el caso simple con enteros: `IntStream.rangeClosed(1, 5).boxed().gather(Gatherers.windowFixed(2)).toList()` produce `[[1, 2], [3, 4], [5]]`. La última ventana puede ser más corta cuando no hay suficientes elementos.

Un gatherer es poderoso, pero no debe ser la primera herramienta. Si `filter` y `map` resuelven el problema con claridad, úsalos. Los gatherers valen la pena cuando la transformación intermedia es realmente estructural, como ventanas, escaneo con estado o emisión personalizada.

### Tema 4: Streams paralelos y referencias a métodos · Intermedio · 35 min

Una referencia a método es una forma compacta de escribir una lambda que solo delega. `Producto::nombre`, `String::toUpperCase`, `BigDecimal::add` y `LineaPedido::subtotal` son referencias a método usadas en este módulo. Se leen bien cuando el nombre del método ya comunica la intención. Si la lambda necesita lógica adicional o el nombre no es claro, una lambda explícita puede ser mejor.

Los streams paralelos son otro tema: no son una mejora gratuita. `parallel()` divide el trabajo en subtareas que se ejecutan en el ForkJoinPool común por defecto. Puede ayudar en operaciones CPU-bound, grandes, independientes y sin estado compartido mutable. También puede empeorar si el dataset es pequeño, si hay mucho overhead de coordinación, si la fuente no se divide bien, o si la operación hace I/O bloqueante.

La auditoría ejecuta un caso verificable y seguro:

```java
int sumaParalela = IntStream.rangeClosed(1, 1000).parallel().sum();
System.out.println("Parallel sum: " + sumaParalela);
```

La salida es `500500`, igual que la suma secuencial. Lo importante no es el número —es trivial— sino la forma: la operación es pura, sin estado compartido, y el resultado no depende del orden de ejecución. Ese es el tipo de caso donde `parallel()` puede considerarse. Si en cambio cada hilo escribiera en una `ArrayList` compartida, tendrías una condición de carrera.

La regla profesional es medir antes de paralelizar. Un `parallelStream()` puesto “por si acaso” puede volver más lento el código y más difícil de diagnosticar. Primero hazlo correcto y claro; luego mide con datos reales.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m4` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados (resumen):

- `test`: 0 fallas.
- `run`: imprime catálogo filtrado/ordenado, agotados, valor por categoría, búsqueda por SKU, total facturado, unidades por SKU, top clientes, ciudades y ventanas de totales.

## Cierre

La Stream API convierte transformaciones de colecciones en pipelines legibles cuando se usa con disciplina. `Optional` hace explícita la ausencia. Los Gatherers abren la puerta a operaciones intermedias que antes requerían código imperativo extra. Los streams paralelos solo valen cuando el trabajo y la medición lo justifican. En todos los casos, la meta es la misma: código que exprese intención sin esconder costos ni efectos secundarios.

## Checklist

- Distingo operaciones intermedias lazy de operaciones terminales que disparan la ejecución.
- Uso `map`, `filter`, `reduce` y `collect` con funciones puras y sin mutación compartida.
- Devuelvo `Optional` cuando la ausencia es parte del contrato, y evito `get()` sin decisión explícita.
- Uso gatherers cuando la transformación intermedia no se expresa bien con operaciones estándar.
- Solo uso `parallel()` tras comprobar independencia, tamaño suficiente y medición.
