# Módulo 3: Excepciones y manejo de recursos

Tienda Aurora ya puede vender, pero el mundo real no le entrega datos perfectos. Un CSV llega con columnas rotas, un operador pide reservar más stock del disponible, un archivo no existe, o un campo numérico trae texto. Si el sistema responde mal a esos casos, el fallo es peor que una excepción: puede quedar un estado inconsistente, ocultar el error original o darle al operador un mensaje inútil.

Las excepciones en Java son el mecanismo para separar el flujo normal del flujo de error. No son “eventos malos” genéricos; son objetos con tipo, mensaje, causa y traza. El tipo comunica qué clase de problema ocurrió. El mensaje comunica el contexto. La causa conserva el error de más bajo nivel que lo originó. La traza dice por dónde pasó. Un buen diseño de excepciones no intenta atrapar todo lo antes posible: decide dónde un error se puede recuperar, dónde debe traducirse y dónde debe subir con contexto.

En este módulo construimos `tienda-aurora-excepciones`, una pequeña app de línea de comandos que importa productos desde CSV y reserva stock. El proyecto es deliberadamente pequeño, pero toca las decisiones que importan: qué excepción es checked y cuál unchecked, cómo cerrar recursos con `try-with-resources`, cómo crear excepciones propias con contexto, y por qué “tragarse” una excepción es una forma de corromper el diagnóstico.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-3-excepciones.html`; regeneración: editar el HTML/SVG en esa ruta):** [Mapa de excepciones Java: checked, unchecked, try-with-resources y preservación de causa](/visuals/temas/java/modulo-3-excepciones.html)

Lectura: El tipo define el contrato, el mensaje da contexto, la causa preserva el origen y try-with-resources garantiza el cierre.

## Prerrequisitos

Necesitas un JDK 25 o superior y Gradle 9.

```bash
java -version
javac -version
gradle --version
```

## Bootstrap

Desde un directorio de trabajo vacío:

```bash
mkdir -p tienda-aurora-excepciones/src/main/java/com/aurora/excepciones/{dominio,importacion,servicio}
cd tienda-aurora-excepciones
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

## Estructura final

```text
tienda-aurora-excepciones/
├── build.gradle.kts
├── settings.gradle.kts
├── productos.csv
├── productos-buenos.csv
└── src/main/java/com/aurora/excepciones/
    ├── TiendaAuroraExcepcionesApp.java
    ├── dominio/
    │   ├── DatoInvalidoException.java
    │   ├── Dinero.java
    │   ├── Producto.java
    │   ├── ProductoNoEncontradoException.java
    │   ├── Sku.java
    │   └── StockInsuficienteException.java
    ├── importacion/
    │   ├── ImportacionException.java
    │   ├── ImportadorProductos.java
    │   ├── LineaInvalidaException.java
    │   └── ResultadoImportacion.java
    └── servicio/
        ├── Catalogo.java
        └── ServicioPedidos.java
```

## Código completo, archivo por archivo

##### `build.gradle.kts`

Configura Java 25 por toolchain, la aplicación CLI y compilación estricta. `-Werror` evita que warnings se acumulen como deuda silenciosa.

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
    mainClass = "com.aurora.excepciones.TiendaAuroraExcepcionesApp"
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

##### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-excepciones"
```

##### Datos de prueba

`productos.csv` incluye filas válidas e inválidas para observar rechazos sin abortar toda la importación:

```csv
sku;nombre;precio;stock
CAF-0001;Café Aurora;12.50;3
MOL-0003;Molino manual;34.90;1
BAD-0001;;8.00;2
TAZ-0002;Taza Aurora;precio;2
FIL-0004;Filtros x100;4.75;10
```

`productos-buenos.csv` contiene solo datos válidos para la demo de reserva:

```csv
sku;nombre;precio;stock
CAF-0001;Café Aurora;12.50;3
FIL-0004;Filtros x100;4.75;10
```

## Dominio

El dominio modela reglas de negocio. Sus errores indican contratos violados o estados de negocio que la capa superior debe presentar con claridad. Aquí conviven excepciones unchecked: si llegan, normalmente el llamador pasó datos inválidos o pidió una operación imposible según el estado actual.

##### `Sku.java`

`Sku` valida formato `AAA-0000` en el constructor. La normalización (`strip`, mayúsculas, reemplazo de espacio/guion bajo) ocurre antes de validar. Si el dato es inválido, lanza `DatoInvalidoException` con el valor recibido. Esto evita que un SKU mal formado circule por el sistema.

```java
package com.aurora.excepciones.dominio;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

public record Sku(String valor) {

    private static final Pattern FORMATO = Pattern.compile("[A-Z]{3}-\\d{4}");

    public Sku {
        Objects.requireNonNull(valor, "valor");
        String limpio = valor.strip()
                .toUpperCase(Locale.ROOT)
                .replace(" ", "")
                .replace("_", "-");
        if (!FORMATO.matcher(limpio).matches()) {
            throw new DatoInvalidoException("SKU inválido: '" + valor + "' (formato AAA-0000)");
        }
        valor = limpio;
    }

    public static Sku de(String crudo) {
        return new Sku(crudo);
    }

    @Override
    public String toString() {
        return valor;
    }
}
```

##### `DatoInvalidoException.java`

Excepción unchecked de base para datos/precondiciones inválidas. Extiende `RuntimeException` porque representa un problema que el llamador puede evitar pasando datos correctos; obligar a declararla en todos los métodos volvería ruidoso el código sin añadir recuperabilidad real. Incluye constructor con causa para preservar el error técnico original cuando se traduce.

```java
package com.aurora.excepciones.dominio;

/**
 * Violación de datos o precondición. Es unchecked porque el llamador puede y
 * debe evitarla pasando datos válidos; si llega a ocurrir, es un error de uso
 * o de entrada que debe corregirse, no una condición externa recuperable.
 */
public class DatoInvalidoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public DatoInvalidoException(String mensaje) {
        super(mensaje);
    }

    public DatoInvalidoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
```

##### `Dinero.java`

Value object inmutable en centavos. El punto clave del módulo es `de(String)`: si `BigDecimal` falla por formato o escala, captura `NumberFormatException | ArithmeticException` y lanza `DatoInvalidoException` con la causa. Así el dominio no filtra detalles técnicos sin contexto, pero tampoco pierde el diagnóstico.

```java
package com.aurora.excepciones.dominio;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Objects;

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
        try {
            BigDecimal valor = new BigDecimal(texto);
            return new Dinero(valor.movePointRight(2).longValueExact());
        } catch (NumberFormatException | ArithmeticException e) {
            throw new DatoInvalidoException("importe inválido: '" + texto + "'", e);
        }
    }

    public static Dinero deCentavos(long centavos) {
        return new Dinero(centavos);
    }

    public Dinero mas(Dinero otro) {
        Objects.requireNonNull(otro, "otro");
        return new Dinero(Math.addExact(this.centavos, otro.centavos));
    }

    public Dinero por(int cantidad) {
        if (cantidad < 0) {
            throw new DatoInvalidoException("cantidad negativa: " + cantidad);
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

##### `ProductoNoEncontradoException.java` y `StockInsuficienteException.java`

Excepciones de dominio con contexto de negocio. `ProductoNoEncontradoException` lleva el `Sku`; `StockInsuficienteException` lleva SKU, disponible y solicitado. Eso permite a la CLI o a una API responder con precisión sin parsear strings.

```java
package com.aurora.excepciones.dominio;

public final class ProductoNoEncontradoException extends RuntimeException {

    private static final long serialVersionUID = 1L;
    private final transient Sku sku;

    public ProductoNoEncontradoException(Sku sku) {
        super("no existe el producto " + sku);
        this.sku = sku;
    }

    public Sku sku() {
        return sku;
    }
}
```

```java
package com.aurora.excepciones.dominio;

public final class StockInsuficienteException extends RuntimeException {

    private static final long serialVersionUID = 1L;
    private final transient Sku sku;
    private final int disponible;
    private final int solicitado;

    public StockInsuficienteException(Sku sku, int disponible, int solicitado) {
        super("stock insuficiente para " + sku + ": disponible=" + disponible + ", solicitado=" + solicitado);
        this.sku = sku;
        this.disponible = disponible;
        this.solicitado = solicitado;
    }

    public Sku sku() { return sku; }
    public int disponible() { return disponible; }
    public int solicitado() { return solicitado; }
}
```

##### `Producto.java`

Record con validación compacta. El método `reservar` no modifica el objeto existente: devuelve un nuevo `Producto` con stock reducido. Si la cantidad es inválida, usa `DatoInvalidoException`; si no hay stock suficiente, usa `StockInsuficienteException`. El llamador no recibe un booleano ambiguo; recibe éxito o una excepción con significado.

```java
package com.aurora.excepciones.dominio;

import java.util.Objects;

public record Producto(Sku sku, String nombre, Dinero precio, int stock) {

    public Producto {
        Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(precio, "precio");
        nombre = nombre == null ? "" : nombre.strip();
        if (nombre.isBlank()) {
            throw new DatoInvalidoException("el nombre del producto es obligatorio");
        }
        if (precio.compareTo(Dinero.CERO) <= 0) {
            throw new DatoInvalidoException("el precio debe ser positivo: " + precio);
        }
        if (stock < 0) {
            throw new DatoInvalidoException("el stock no puede ser negativo: " + stock);
        }
    }

    public Producto reservar(int cantidad) {
        if (cantidad <= 0) {
            throw new DatoInvalidoException("la cantidad debe ser mayor que cero: " + cantidad);
        }
        if (cantidad > stock) {
            throw new StockInsuficienteException(sku, stock, cantidad);
        }
        return new Producto(sku, nombre, precio, stock - cantidad);
    }
}
```

## Importación

La importación es una frontera de I/O. Leer un archivo puede fallar porque el archivo no existe, no hay permisos o el disco falla. Esos fallos son externos al dominio y a menudo recuperables a nivel de operación: el usuario puede elegir otro archivo. Por eso la capa de importación usa excepciones checked en su contrato público.

##### `ImportacionException.java`

```java
package com.aurora.excepciones.importacion;

/**
 * Falla al leer o interpretar un archivo de importación.
 *
 * Es checked porque representa un fallo externo/recuperable en la frontera: el
 * llamador puede decidir reintentar, usar otro archivo, reportar el problema o
 * abortar la operación. La causa original se preserva para diagnóstico.
 */
public final class ImportacionException extends Exception {

    private static final long serialVersionUID = 1L;

    public ImportacionException(String mensaje) {
        super(mensaje);
    }

    public ImportacionException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
```

##### `LineaInvalidaException.java`

Excepción checked interna de la importación para una línea concreta. Lleva número de línea y contenido original. El importador la captura por fila, la convierte en rechazo legible y sigue con la siguiente línea. No aborta el archivo completo por una fila mala: esa es una decisión de política de importación.

```java
package com.aurora.excepciones.importacion;

public final class LineaInvalidaException extends Exception {

    private static final long serialVersionUID = 1L;
    private final int numeroLinea;
    private final String contenido;

    public LineaInvalidaException(int numeroLinea, String contenido, String motivo) {
        super("línea " + numeroLinea + " inválida: " + motivo);
        this.numeroLinea = numeroLinea;
        this.contenido = contenido;
    }

    public LineaInvalidaException(int numeroLinea, String contenido, String motivo, Throwable causa) {
        super("línea " + numeroLinea + " inválida: " + motivo, causa);
        this.numeroLinea = numeroLinea;
        this.contenido = contenido;
    }

    public int numeroLinea() { return numeroLinea; }
    public String contenido() { return contenido; }
}
```

##### `ResultadoImportacion.java`

Objeto de resultado inmutable: productos válidos y rechazos. Es preferible a imprimir desde el importador o a lanzar por cada fila mala. La importación puede tener éxito parcial; el resultado lo hace explícito.

```java
package com.aurora.excepciones.importacion;

import com.aurora.excepciones.dominio.Producto;
import java.util.List;

public record ResultadoImportacion(List<Producto> productos, List<String> rechazos) {

    public ResultadoImportacion {
        productos = List.copyOf(productos);
        rechazos = List.copyOf(rechazos);
    }

    public int importados() { return productos.size(); }
    public int rechazados() { return rechazos.size(); }
}
```

##### `ImportadorProductos.java`

Aquí aparecen dos decisiones importantes. Primero, `try-with-resources` abre el `BufferedReader` y garantiza el cierre aunque haya excepción. Segundo, `IOException` se traduce a `ImportacionException` preservando la causa: el llamador ve un error de importación con contexto del archivo, y el diagnóstico conserva la excepción original de I/O.

```java
package com.aurora.excepciones.importacion;

import com.aurora.excepciones.dominio.DatoInvalidoException;
import com.aurora.excepciones.dominio.Dinero;
import com.aurora.excepciones.dominio.Producto;
import com.aurora.excepciones.dominio.Sku;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Importa productos desde un CSV simple con formato:
 * sku;nombre;precio;stock
 */
public final class ImportadorProductos {

    public ResultadoImportacion importar(Path ruta) throws ImportacionException {
        List<Producto> productos = new ArrayList<>();
        List<String> rechazos = new ArrayList<>();

        try (BufferedReader lector = Files.newBufferedReader(ruta, StandardCharsets.UTF_8)) {
            String linea;
            int numeroLinea = 0;
            while ((linea = lector.readLine()) != null) {
                numeroLinea++;
                if (numeroLinea == 1 && linea.toLowerCase().startsWith("sku;")) {
                    continue;
                }
                if (linea.isBlank()) {
                    continue;
                }
                try {
                    productos.add(parsearLinea(numeroLinea, linea));
                } catch (LineaInvalidaException e) {
                    rechazos.add(e.getMessage() + " | contenido=" + e.contenido());
                }
            }
        } catch (IOException e) {
            throw new ImportacionException("no se pudo leer el archivo " + ruta, e);
        }

        return new ResultadoImportacion(productos, rechazos);
    }

    private Producto parsearLinea(int numeroLinea, String linea) throws LineaInvalidaException {
        String[] partes = linea.split(";", -1);
        if (partes.length != 4) {
            throw new LineaInvalidaException(numeroLinea, linea,
                    "se esperaban 4 columnas sku;nombre;precio;stock");
        }
        try {
            Sku sku = Sku.de(partes[0]);
            String nombre = partes[1];
            Dinero precio = Dinero.de(partes[2]);
            int stock = Integer.parseInt(partes[3].strip());
            return new Producto(sku, nombre, precio, stock);
        } catch (DatoInvalidoException | NumberFormatException e) {
            throw new LineaInvalidaException(numeroLinea, linea, "datos inválidos", e);
        }
    }
}
```

## Servicio y CLI

##### `Catalogo.java`

Almacén en memoria. `obtener` lanza `ProductoNoEncontradoException` si el SKU no existe; `actualizar` también valida existencia. No atrapa excepciones para devolver `null`: el contrato es explícito.

```java
package com.aurora.excepciones.servicio;

import com.aurora.excepciones.dominio.Producto;
import com.aurora.excepciones.dominio.ProductoNoEncontradoException;
import com.aurora.excepciones.dominio.Sku;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class Catalogo {

    private final Map<Sku, Producto> productos = new LinkedHashMap<>();

    public void registrar(Producto producto) {
        productos.put(producto.sku(), producto);
    }

    public Optional<Producto> buscar(Sku sku) {
        return Optional.ofNullable(productos.get(sku));
    }

    public Producto obtener(Sku sku) {
        return buscar(sku).orElseThrow(() -> new ProductoNoEncontradoException(sku));
    }

    public void actualizar(Producto producto) {
        if (!productos.containsKey(producto.sku())) {
            throw new ProductoNoEncontradoException(producto.sku());
        }
        productos.put(producto.sku(), producto);
    }

    public List<Producto> todos() {
        return List.copyOf(productos.values());
    }

    public int tamano() {
        return productos.size();
    }
}
```

##### `ServicioPedidos.java`

Caso de uso pequeño: normaliza SKU, obtiene producto, reserva y actualiza. No tiene `try/catch` porque aquí no hay una recuperación útil; traducir o reportar corresponde a la frontera CLI/API.

```java
package com.aurora.excepciones.servicio;

import com.aurora.excepciones.dominio.Dinero;
import com.aurora.excepciones.dominio.Producto;
import com.aurora.excepciones.dominio.Sku;

public final class ServicioPedidos {

    private final Catalogo catalogo;

    public ServicioPedidos(Catalogo catalogo) {
        this.catalogo = catalogo;
    }

    public Dinero reservar(String skuCrudo, int cantidad) {
        Sku sku = Sku.de(skuCrudo);
        Producto producto = catalogo.obtener(sku);
        Producto actualizado = producto.reservar(cantidad);
        catalogo.actualizar(actualizado);
        return actualizado.precio().por(cantidad);
    }
}
```

##### `TiendaAuroraExcepcionesApp.java`

La CLI es la frontera. Aquí se decide qué se imprime al usuario, qué código de salida se usa y dónde se captura una excepción de negocio. El comando `auditoria` ejecuta escenarios controlados para mostrar checked, unchecked, try-with-resources, excepción suprimida, causa preservada y la corrección de un catch que no debe tragar.

```java
package com.aurora.excepciones;

import com.aurora.excepciones.dominio.DatoInvalidoException;
import com.aurora.excepciones.dominio.Dinero;
import com.aurora.excepciones.dominio.Producto;
import com.aurora.excepciones.dominio.ProductoNoEncontradoException;
import com.aurora.excepciones.dominio.StockInsuficienteException;
import com.aurora.excepciones.importacion.ImportacionException;
import com.aurora.excepciones.importacion.ImportadorProductos;
import com.aurora.excepciones.importacion.ResultadoImportacion;
import com.aurora.excepciones.servicio.Catalogo;
import com.aurora.excepciones.servicio.ServicioPedidos;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

public final class TiendaAuroraExcepcionesApp {

    public static void main(String[] args) throws Exception {
        Locale.setDefault(Locale.ROOT);
        if (args.length == 0) {
            ayuda();
            return;
        }
        switch (args[0]) {
            case "importar" -> ejecutarImportar(argumento(args, "--archivo"));
            case "reservar" -> ejecutarReservar(
                    argumento(args, "--archivo"),
                    argumento(args, "--sku"),
                    Integer.parseInt(argumento(args, "--cantidad")));
            case "auditoria" -> auditoria();
            default -> {
                System.err.println("Comando desconocido: " + args[0]);
                ayuda();
                System.exit(2);
            }
        }
    }

    private static void ejecutarImportar(String ruta) throws ImportacionException {
        ResultadoImportacion resultado = new ImportadorProductos().importar(Path.of(ruta));
        System.out.println("Importados: " + resultado.importados());
        System.out.println("Rechazados: " + resultado.rechazados());
        for (Producto producto : resultado.productos()) {
            System.out.printf(Locale.ROOT, "  %-9s %-18s %7s stock=%d%n",
                    producto.sku(), producto.nombre(), producto.precio(), producto.stock());
        }
        for (String rechazo : resultado.rechazos()) {
            System.out.println("  RECHAZO " + rechazo);
        }
    }

    private static void ejecutarReservar(String ruta, String sku, int cantidad) throws ImportacionException {
        Catalogo catalogo = cargarCatalogo(ruta);
        ServicioPedidos servicio = new ServicioPedidos(catalogo);
        try {
            Dinero total = servicio.reservar(sku, cantidad);
            System.out.println("Reserva OK: " + sku + " x" + cantidad + " total=" + total);
            System.out.println("Stock restante: " + catalogo.obtener(com.aurora.excepciones.dominio.Sku.de(sku)).stock());
        } catch (DatoInvalidoException | ProductoNoEncontradoException | StockInsuficienteException e) {
            System.out.println("ERROR_NEGOCIO: " + e.getClass().getSimpleName());
            System.out.println("mensaje: " + e.getMessage());
        }
    }

    private static Catalogo cargarCatalogo(String ruta) throws ImportacionException {
        ResultadoImportacion resultado = new ImportadorProductos().importar(Path.of(ruta));
        Catalogo catalogo = new Catalogo();
        for (Producto producto : resultado.productos()) {
            catalogo.registrar(producto);
        }
        return catalogo;
    }

    private static void auditoria() throws Exception {
        Path temporal = Files.createTempFile("aurora-m3-", ".csv");
        try {
            Files.writeString(temporal, """
                    sku;nombre;precio;stock
                    CAF-0001;Café Aurora;12.50;3
                    """, StandardCharsets.UTF_8);

            System.out.println("== checked ==");
            try {
                new ImportadorProductos().importar(Path.of("no-existe.csv"));
            } catch (ImportacionException e) {
                System.out.println(e.getClass().getSimpleName());
                System.out.println("causa: " + e.getCause().getClass().getSimpleName());
            }

            System.out.println("== unchecked ==");
            try {
                new ServicioPedidos(cargarCatalogo(temporal.toString())).reservar("CAF-0001", 99);
            } catch (StockInsuficienteException e) {
                System.out.println(e.getClass().getSimpleName());
                System.out.println(e.getMessage());
            }

            System.out.println("== try-with-resources ==");
            System.out.println(leerPrimeraLinea(temporal));

            System.out.println("== suprimida ==");
            try {
                lanzarCuerpoYCierre();
            } catch (RuntimeException e) {
                System.out.println("principal: " + e.getMessage());
                System.out.println("suprimidas: " + e.getSuppressed().length);
                System.out.println("suprimida: " + e.getSuppressed()[0].getMessage());
            }

            System.out.println("== causa preservada ==");
            try {
                parsearCantidad("x");
            } catch (DatoInvalidoException e) {
                System.out.println(e.getMessage());
                System.out.println("causa: " + e.getCause().getClass().getSimpleName());
            }

            System.out.println("== no tragar ==");
            try {
                importarSilenciosoIncorrecto(Path.of("no-existe.csv"));
                System.out.println("INESPERADO");
            } catch (ImportacionException e) {
                System.out.println("propagada: " + e.getClass().getSimpleName());
            }
        } finally {
            Files.deleteIfExists(temporal);
        }
    }

    private static String leerPrimeraLinea(Path ruta) throws IOException {
        try (BufferedReader lector = Files.newBufferedReader(ruta, StandardCharsets.UTF_8)) {
            return lector.readLine();
        }
    }

    private static void lanzarCuerpoYCierre() {
        try (RecursoRuidoso recurso = new RecursoRuidoso()) {
            recurso.usar();
            throw new RuntimeException("falló el cuerpo");
        }
    }

    private static int parsearCantidad(String texto) {
        try {
            return Integer.parseInt(texto);
        } catch (NumberFormatException e) {
            throw new DatoInvalidoException("cantidad inválida: '" + texto + "'", e);
        }
    }

    private static void importarSilenciosoIncorrecto(Path ruta) throws ImportacionException {
        try {
            new ImportadorProductos().importar(ruta);
        } catch (ImportacionException e) {
            // Antipatrón: tragar la excepción. Aquí lo corregimos propagando.
            throw e;
        }
    }

    private static String argumento(String[] args, String nombre) {
        for (int i = 1; i < args.length - 1; i++) {
            if (nombre.equals(args[i])) {
                return args[i + 1];
            }
        }
        throw new DatoInvalidoException("falta el argumento " + nombre);
    }

    private static void ayuda() {
        System.out.println("""
                Tienda Aurora - excepciones y recursos

                Uso:
                  importar --archivo <ruta.csv>
                  reservar --archivo <ruta.csv> --sku <SKU> --cantidad <n>
                  auditoria
                """);
    }

    private static final class RecursoRuidoso implements AutoCloseable {
        void usar() {
            System.out.println("recurso abierto");
        }

        @Override
        public void close() {
            throw new RuntimeException("falló el cierre");
        }
    }
}
```

#### Test

**Archivo:** `src/test/java/com/aurora/excepciones/ExcepcionesTest.java` (ruta real en `/tmp/opencode/aurora-m3`). Dependencias JUnit 5 en `build.gradle.kts` (`junit-bom:5.13.4`, `junit-jupiter` y `junit-platform-launcher`) y `tasks.test { useJUnitPlatform() }`. Siete casos sobre el dominio real del módulo.

```java
package com.aurora.excepciones;

import com.aurora.excepciones.dominio.DatoInvalidoException;
import com.aurora.excepciones.dominio.Dinero;
import com.aurora.excepciones.dominio.Producto;
import com.aurora.excepciones.dominio.ProductoNoEncontradoException;
import com.aurora.excepciones.dominio.Sku;
import com.aurora.excepciones.dominio.StockInsuficienteException;
import com.aurora.excepciones.importacion.ImportacionException;
import com.aurora.excepciones.importacion.ImportadorProductos;
import com.aurora.excepciones.servicio.Catalogo;
import com.aurora.excepciones.servicio.ServicioPedidos;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExcepcionesTest {

    @TempDir
    Path temporal;

    @Test
    void importadorAceptaFilasValidasYRechazaLasDemasSinAbortar()
            throws IOException, ImportacionException {
        Path csv = temporal.resolve("productos.csv");
        Files.writeString(csv, """
                sku;nombre;precio;stock
                CAF-0001;Café Aurora;12.50;3
                MAL-0001;;8.00;2
                TAZ-0002;Taza Aurora;precio;2
                FIL-0004;Filtros x100;4.75;10
                FALTAN;columnas
                """, StandardCharsets.UTF_8);

        var resultado = new ImportadorProductos().importar(csv);

        assertAll(
                () -> assertEquals(2, resultado.importados()),
                () -> assertEquals(3, resultado.rechazados()),
                () -> assertEquals(Sku.de("CAF-0001"), resultado.productos().getFirst().sku()),
                () -> assertEquals(3, resultado.productos().getFirst().stock()),
                () -> assertTrue(resultado.rechazos().getFirst().contains("línea 3 inválida")),
                () -> assertTrue(resultado.rechazos().getLast().contains("se esperaban 4 columnas"))
        );
    }

    @Test
    void falloDeLecturaEsCheckedYConservaLaCausa() {
        ImportacionException error = assertThrows(ImportacionException.class,
                () -> new ImportadorProductos().importar(temporal.resolve("no-existe.csv")));

        assertAll(
                () -> assertTrue(error.getMessage().contains("no se pudo leer el archivo")),
                () -> assertInstanceOf(NoSuchFileException.class, error.getCause())
        );
    }

    @Test
    void reservarDescuentaStockYDevuelveElImporte() {
        Catalogo catalogo = new Catalogo();
        catalogo.registrar(new Producto(Sku.de("CAF-0001"), "Café Aurora", Dinero.de("12.50"), 3));

        Dinero total = new ServicioPedidos(catalogo).reservar("caf-0001", 2);

        assertAll(
                () -> assertEquals(Dinero.de("25.00"), total),
                () -> assertEquals(1, catalogo.obtener(Sku.de("CAF-0001")).stock())
        );
    }

    @Test
    void erroresDeNegocioLlevanContextoYSonUnchecked() {
        Catalogo catalogo = new Catalogo();
        catalogo.registrar(new Producto(Sku.de("CAF-0001"), "Café Aurora", Dinero.de("12.50"), 3));
        ServicioPedidos servicio = new ServicioPedidos(catalogo);

        StockInsuficienteException sinStock = assertThrows(StockInsuficienteException.class,
                () -> servicio.reservar("CAF-0001", 99));
        ProductoNoEncontradoException ausente = assertThrows(ProductoNoEncontradoException.class,
                () -> servicio.reservar("TAZ-0002", 1));
        DatoInvalidoException cantidad = assertThrows(DatoInvalidoException.class,
                () -> servicio.reservar("CAF-0001", 0));

        assertAll(
                () -> assertEquals(Sku.de("CAF-0001"), sinStock.sku()),
                () -> assertEquals(3, sinStock.disponible()),
                () -> assertEquals(99, sinStock.solicitado()),
                () -> assertEquals(Sku.de("TAZ-0002"), ausente.sku()),
                () -> assertTrue(cantidad.getMessage().contains("mayor que cero"))
        );
    }

    @Test
    void importeInvalidoTraduceLaCausaDeBajoNivel() {
        DatoInvalidoException texto = assertThrows(DatoInvalidoException.class,
                () -> Dinero.de("abc"));
        DatoInvalidoException escala = assertThrows(DatoInvalidoException.class,
                () -> Dinero.de("1.234"));

        assertAll(
                () -> assertInstanceOf(NumberFormatException.class, texto.getCause()),
                () -> assertInstanceOf(ArithmeticException.class, escala.getCause()),
                () -> assertTrue(texto.getMessage().contains("importe inválido"))
        );
    }

    @Test
    void tryWithResourcesConservaLaExcepcionSuprimida() {
        IllegalStateException principal = assertThrows(IllegalStateException.class,
                () -> {
                    try (RecursoRuidoso recurso = new RecursoRuidoso()) {
                        recurso.usar();
                        throw new IllegalStateException("falló el cuerpo");
                    }
                });

        assertAll(
                () -> assertEquals("falló el cuerpo", principal.getMessage()),
                () -> assertEquals(1, principal.getSuppressed().length),
                () -> assertEquals("falló el cierre", principal.getSuppressed()[0].getMessage())
        );
    }

    @Test
    void skuInvalidoSeRechazaEnLaFronteraDelDominio() {
        assertAll(
                () -> assertEquals(Sku.de("CAF-0001"), Sku.de(" caf_0001 ")),
                () -> assertThrows(DatoInvalidoException.class, () -> Sku.de("cafe"))
        );
    }

    private static final class RecursoRuidoso implements AutoCloseable {

        void usar() {
            // El cuerpo usa el recurso antes de fallar.
        }

        @Override
        public void close() {
            throw new IllegalStateException("falló el cierre");
        }
    }
}
```

Salida observada: `./gradlew -q clean test` termina con código de salida 0 y no escribe nada en stdout; el resumen XML que Gradle deja en `build/test-results/test/` confirma los siete casos:

```text
<testsuite name="com.aurora.excepciones.ExcepcionesTest" tests="7" skipped="0" failures="0" errors="0" timestamp="2026-11-23T08:27:38.945Z" hostname="MacBook-Pro-de-Nicolas.local" time="0.032">
```

Los siete casos se corrigieron hasta que la suite quedó en verde; el XML mostrado corresponde a la última corrida limpia.

### Tema 1: Checked vs unchecked exceptions · Básico · 35 min

Una excepción checked es aquella que el compilador obliga a declarar o manejar si puede salir de un método. En Java, esto aplica a las subclases de `Exception` que no son `RuntimeException`. Existe para hacer visible una condición externa o recuperable en el contrato del método: leer un archivo puede fallar por I/O, parsear una fuente externa puede fallar por formato, una llamada remota puede fallar por red. El llamador debería decidir si reintenta, usa un fallback, pide otro input o reporta el error.

Una excepción unchecked es una `RuntimeException` o `Error`. El compilador no obliga a declararla. Se usa cuando el problema normalmente representa un bug de programación, una violación de precondición o un estado que el llamador debió evitar: índice fuera de rango, argumento nulo, estado inválido, SKU mal formado. Obligar a capturarla en todas partes suele generar ruido y `catch` vacíos.

La decisión no es dogmática. Pregunta: “¿el llamador inmediato tiene una acción razonable de recuperación?”. Si la respuesta es sí y el fallo es externo/esperable, una checked puede ser apropiada en la frontera. Si la respuesta es no, o es un contrato violado, unchecked es más clara. En el proyecto, `ImportacionException` es checked porque importar desde archivo es una operación de frontera; `DatoInvalidoException` y `StockInsuficienteException` son unchecked porque expresan violación de contrato o regla de negocio que la capa superior debe manejar de forma consciente, no por obligación sintáctica en cada llamada.

**Confusión común:** “checked es más segura”. No automáticamente. Un checked mal usada produce `catch (Exception e) {}` o `throws Exception` por todos lados, que es peor que una unchecked bien ubicada. La seguridad viene de decidir bien el punto de manejo.

### Tema 2: try-with-resources · Básico · 40 min

`try-with-resources` es la forma segura de manejar recursos que deben cerrarse: archivos, streams, conexiones JDBC, sockets, locks con `AutoCloseable`. Un recurso que implementa `AutoCloseable` o `Closeable` se declara en la cabecera del `try`; Java llama a `close()` al salir del bloque, tanto si termina normal como si lanza excepción.

El mecanismo importa porque el cierre manual con `finally` es fácil de hacer mal: hay que cuidar nulls, no perder la excepción original si el cierre también falla, y no olvidar el cierre en ramas tempranas. `try-with-resources` hace esto correctamente. Si el cuerpo lanza una excepción y `close()` lanza otra, la excepción del cuerpo se mantiene como principal y la del cierre se adjunta como *suppressed*. Puedes verla con `Throwable.getSuppressed()`.

En `ImportadorProductos`, el `BufferedReader` se abre en el try-with-resources. Si la lectura falla a mitad de archivo, el reader se cierra igual. En `auditoria()`, `RecursoRuidoso` demuestra la excepción suprimida: el cuerpo lanza “falló el cuerpo” y el cierre lanza “falló el cierre”; la principal es la del cuerpo, la secundaria queda suprimida.

**Confusión común:** “try-with-resources atrapa excepciones”. No. Solo garantiza cierre. Las excepciones siguen propagándose a menos que las captures. También no reemplaza decisiones de diseño: cerrar el recurso no significa que el error ya esté manejado.

### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 35 min

Una excepción personalizada tiene sentido cuando el tipo comunica algo que las excepciones estándar no comunican bien, o cuando necesitas transportar contexto estructurado. `StockInsuficienteException` lleva SKU, disponible y solicitado; eso es más útil que un `IllegalStateException` con un string genérico. Pero no se crean clases por crear: si `IllegalArgumentException` con buen mensaje basta, úsala.

Una buena excepción personalizada define: tipo correcto (checked/unchecked), mensaje claro con contexto, causa cuando traduce otro error, y solo los campos necesarios. No debe exponer secretos ni datos sensibles en mensajes que puedan terminar en logs públicos.

“No tragar excepciones” significa no hacer esto:

```java
try {
    importar(ruta);
} catch (Exception e) {
    // nada
}
```

Ese catch elimina la señal de fallo. El sistema sigue como si nada, pero el estado puede estar incompleto. Tampoco es correcto solo loguear y continuar cuando el fallo invalida la operación. Las respuestas válidas son: manejar realmente (fallback, reintento, valor por defecto justificado), traducir y relanzar con causa, o dejar propagar. En `importarSilenciosoIncorrecto` del demo, el catch incorrecto se corrige propagando; en producción, la decisión depende del contrato.

**Confusión común:** “loguear es manejar”. Loguear es observabilidad. Manejar es tomar una decisión que mantiene el contrato del sistema. A veces se loguea y se relanza; a veces se loguea y se responde al usuario; casi nunca se loguea y se sigue como si hubiera salido bien.

## Ejecutar

Desde la raíz de `tienda-aurora-excepciones`:

```bash
./gradlew -q run --args="importar --archivo productos.csv"
./gradlew -q run --args="reservar --archivo productos-buenos.csv --sku CAF-0001 --cantidad 2"
./gradlew -q run --args="auditoria"
./gradlew -q test
```

## Verificación real

Re-verificado el 2026-11-23 en `/tmp/opencode/aurora-m3` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

Desde la raíz del proyecto:

```bash
cd /tmp/opencode/aurora-m3
./gradlew -q test
./gradlew -q run --args="importar --archivo productos.csv"
./gradlew -q run --args="auditoria"
```

Resultados observados (salida literal, recortada donde se indica):

```text
Importados: 3
Rechazados: 2
  CAF-0001  Café Aurora         $12.50 stock=3
  MOL-0003  Molino manual       $34.90 stock=1
  FIL-0004  Filtros x100         $4.75 stock=10
  RECHAZO línea 4 inválida: datos inválidos | contenido=BAD-0001;;8.00;2
  RECHAZO línea 5 inválida: datos inválidos | contenido=TAZ-0002;Taza Aurora;precio;2
```

```text
== checked ==
ImportacionException
causa: NoSuchFileException
== unchecked ==
StockInsuficienteException
stock insuficiente para CAF-0001: disponible=3, solicitado=99
== try-with-resources ==
sku;nombre;precio;stock
== suprimida ==
recurso abierto
principal: falló el cuerpo
suprimidas: 1
suprimida: falló el cierre
== causa preservada ==
cantidad inválida: 'x'
causa: NumberFormatException
== no tragar ==
propagada: ImportacionException
```

`./gradlew -q test` terminó sin fallos. La salida confirma que la traducción de la checked exception conserva la causa, que el recurso se cierra con try-with-resources, que la excepción suprimida aparece con `suprimidas: 1` y que un `catch` que decide propagar no pierde el tipo original.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Se traga el error y sigue | `catch` vacío o solo log sin decisión | Revisar catches sin rethrow/retorno | Manejar, traducir con causa o propagar |
| Se pierde la causa original | `throw new ...()` sin `cause` | Falta stack/cause en logs | `new XException(msg, e)` |
| Recurso queda abierto | No usar try-with-resources | FDs/locks crecen, tests flaky | `try (var r = ...)` o cerrar en `finally` seguro |
| Checked exception por todos lados | Usar checked para errores de programación | API difícil de usar | Checked en frontera recuperable; unchecked para bug/contrato |
| Mensaje inútil | "error" sin contexto | Logs no permiten reproducir | Incluir archivo/línea/SKU/operación, sin secretos |

## Cierre

Manejar excepciones bien no es “poner try/catch”. Es diseñar contratos de fallo: qué puede fallar, quién puede recuperarse, qué contexto se conserva y qué recursos se liberan. En el siguiente módulo ese mismo criterio se aplica a colecciones y streams, donde muchos errores aparecen por mutar datos compartidos o asumir formas que no se cumplen.

## Checklist

- [ ] Distingo cuándo usar checked y cuándo unchecked según recuperabilidad y contrato.
- [ ] Uso `try-with-resources` para todo `AutoCloseable`.
- [ ] Preservo la causa al traducir excepciones.
- [ ] No trago excepciones; manejo, traduzco o propago.
- [ ] Mis excepciones personalizadas llevan contexto útil y no datos sensibles.
