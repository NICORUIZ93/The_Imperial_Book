# Módulo 3: Excepciones y manejo de recursos

Tienda Aurora ya puede vender, pero el mundo real no le entrega datos perfectos. Un CSV llega con columnas rotas, un operador pide reservar más stock del disponible, un archivo no existe, o un campo numérico trae texto. Si el sistema responde mal a esos casos, el fallo es peor que una excepción: puede quedar un estado inconsistente, ocultar el error original o darle al operador un mensaje inútil.

Las excepciones en Java son el mecanismo para separar el flujo normal del flujo de error. No son “eventos malos” genéricos; son objetos con tipo, mensaje, causa y traza. El tipo comunica qué clase de problema ocurrió. El mensaje comunica el contexto. La causa conserva el error de más bajo nivel que lo originó. La traza dice por dónde pasó. Un buen diseño de excepciones no intenta atrapar todo lo antes posible: decide dónde un error se puede recuperar, dónde debe traducirse y dónde debe subir con contexto.

En este módulo construimos `tienda-aurora-excepciones`, una pequeña aplicación que importa productos desde CSV y reserva stock. El mismo proyecto muestra los tres casos que un desarrollador Java necesita distinguir: fallos externos que el llamador debe decidir cómo manejar, violaciones de datos o reglas de dominio que deben expresarse con precisión, y recursos que deben cerrarse incluso cuando algo sale mal.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2 (`javac 27.0.1.0.2`), Gradle 9.9.1, macOS arm64. El proyecto se compiló con `./gradlew -q build` usando `--release 25` y `-Xlint:all -Werror`. Las salidas de `importar`, `reservar` y `auditoria` son transcripciones reales de la ejecución local.

## Proyecto desde cero: tienda-aurora-excepciones

El proyecto tiene tres comandos. `importar` lee un CSV, acepta las filas válidas y reporta las filas rechazadas sin tumbar toda la importación. `reservar` carga un catálogo desde CSV y aplica una reserva, respondiendo con una excepción de dominio cuando el dato o el stock no son válidos. `auditoria` ejecuta casos controlados para mostrar el comportamiento de checked exceptions, unchecked exceptions, `try-with-resources`, excepciones suprimidas, preservación de causa y propagación correcta.

La decisión de diseño central es la frontera. El dominio y el importador no imprimen ni silencian errores por su cuenta; lanzan excepciones con significado. La CLI, que es la frontera con el usuario, decide cómo presentarlas.

## Prerrequisitos

Necesitas un JDK 25 o superior y Gradle 9.

```bash
java -version
javac -version
gradle --version
```

## Estructura del proyecto

```text
tienda-aurora-excepciones/
├── build.gradle.kts
├── settings.gradle.kts
├── productos.csv
├── productos-buenos.csv
└── src/
    └── main/
        └── java/
            └── com/aurora/excepciones/
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

El build usa Java 25, aplicación de consola y compilación estricta. No hay dependencias externas: el objetivo es entender el modelo de excepciones del JDK y la forma de estructurar errores en código propio.

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-excepciones"

```

## Archivos de datos

El módulo usa dos CSV para que los comandos sean reproducibles sin editar código. `productos.csv` contiene filas válidas y filas rotas a propósito; `productos-buenos.csv` contiene solo filas válidas para el flujo de reserva.

**Archivo:** `productos.csv`

```csv
sku;nombre;precio;stock
CAF-0001;Café Aurora;12.50;3
MOL-0003;Molino manual;34.90;1
BAD-0001;;8.00;2
TAZ-0002;Taza Aurora;precio;2
FIL-0004;Filtros x100;4.75;10
```

**Archivo:** `productos-buenos.csv`

```csv
sku;nombre;precio;stock
CAF-0001;Café Aurora;12.50;3
FIL-0004;Filtros x100;4.75;10
```

## Código completo

El código se lee mejor desde el dominio hacia afuera. Primero están los tipos y las excepciones que describen el problema. Después la importación, que traduce fallos de E/S y de formato. Luego el servicio, que aplica reglas sin atrapar errores prematuramente. Al final está la CLI, que es donde los errores se convierten en mensajes para el usuario.

### Dominio


`Dinero` sigue siendo un value object inmutable en centavos. La novedad de este módulo está en el borde: cuando el texto no representa un importe válido, `de(String)` no deja escapar un `NumberFormatException` crudo; lo traduce a `DatoInvalidoException` preservando la causa. Así el dominio habla el idioma del problema de entrada, y el diagnóstico conserva la excepción técnica original.

**Archivo:** `src/main/java/com/aurora/excepciones/dominio/Dinero.java`

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

`Sku` valida el formato en el constructor compacto del record. Si el SKU es inválido, lanza una excepción de dominio unchecked. Es una precondición: el llamador debe entregar un dato con forma válida, y si no lo hace, el error debe ser visible de inmediato.

**Archivo:** `src/main/java/com/aurora/excepciones/dominio/Sku.java`

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

`Producto` agrupa las invariantes del catálogo: nombre no vacío, precio positivo, stock no negativo. El método `reservar` devuelve un nuevo `Producto` con el stock actualizado; si la cantidad es inválida o no hay stock suficiente, lanza excepciones de dominio distintas. Esa diferencia importa porque el llamador puede responder distinto a un dato mal formado que a una regla de negocio insatisfecha.

**Archivo:** `src/main/java/com/aurora/excepciones/dominio/Producto.java`

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

`DatoInvalidoException` es unchecked. Hereda de `RuntimeException` porque representa una violación de precondición o dato inválido: algo que el código llamador puede prevenir. Lleva mensaje y, cuando envuelve otra excepción, la causa original.

**Archivo:** `src/main/java/com/aurora/excepciones/dominio/DatoInvalidoException.java`

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

`ProductoNoEncontradoException` también es unchecked en este diseño, porque se usa cuando el flujo asumía o pedía un producto que debe existir; incluye el `Sku` para que el mensaje sea accionable. La marca `transient` en el campo `Sku` evita una advertencia de serialización porque `Sku` es un record no serializable; el detalle importante aquí es el dato de dominio que porta la excepción.

**Archivo:** `src/main/java/com/aurora/excepciones/dominio/ProductoNoEncontradoException.java`

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

`StockInsuficienteException` modela una regla de negocio: la cantidad solicitada supera el stock disponible. No es un bug del programador ni un fallo de disco; es un estado válido del dominio que hay que comunicar con precisión. Incluir `sku`, `disponible` y `solicitado` permite decidir en la UI, API o log sin parsear el mensaje.

**Archivo:** `src/main/java/com/aurora/excepciones/dominio/StockInsuficienteException.java`

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

    public Sku sku() {
        return sku;
    }

    public int disponible() {
        return disponible;
    }

    public int solicitado() {
        return solicitado;
    }
}
```

### Importación


`ImportacionException` es checked (`extends Exception`). Representa un fallo externo al leer el archivo: el llamador puede elegir otro archivo, avisar al operador o abortar la importación. El compilador obliga a tratarla, lo que hace visible esa decisión en la firma.

**Archivo:** `src/main/java/com/aurora/excepciones/importacion/ImportacionException.java`

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

`LineaInvalidaException` es checked y se usa dentro de la importación para representar una fila que no se puede convertir en `Producto`. Guarda número de línea y contenido original; esa información es oro en diagnóstico porque permite corregir el CSV sin adivinar.

**Archivo:** `src/main/java/com/aurora/excepciones/importacion/LineaInvalidaException.java`

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

    public int numeroLinea() {
        return numeroLinea;
    }

    public String contenido() {
        return contenido;
    }
}
```

`ResultadoImportacion` separa dos resultados posibles de la misma operación: productos importados y rechazos. Es un record inmutable con copias defensivas. Esta estructura evita el antipatrón de “todo o nada” cuando el negocio tolera rechazos parciales.

**Archivo:** `src/main/java/com/aurora/excepciones/importacion/ResultadoImportacion.java`

```java
package com.aurora.excepciones.importacion;

import com.aurora.excepciones.dominio.Producto;

import java.util.List;

public record ResultadoImportacion(List<Producto> productos, List<String> rechazos) {

    public ResultadoImportacion {
        productos = List.copyOf(productos);
        rechazos = List.copyOf(rechazos);
    }

    public int importados() {
        return productos.size();
    }

    public int rechazados() {
        return rechazos.size();
    }
}
```

`ImportadorProductos` es el centro del módulo. Usa `try-with-resources` para abrir el `BufferedReader`; si la lectura falla, envuelve el `IOException` en `ImportacionException` y preserva la causa. Cada línea se parsea por separado: una línea inválida se convierte en rechazo y la importación continúa. Aquí se ve la diferencia práctica entre un fallo externo (archivo ilegible) y un dato inválido recuperable por fila.

**Archivo:** `src/main/java/com/aurora/excepciones/importacion/ImportadorProductos.java`

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

### Servicio


`Catalogo` es un repositorio en memoria simple. `obtener` lanza `ProductoNoEncontradoException` cuando el SKU no existe. Usar una excepción de dominio evita que el servicio tenga que devolver `null` o códigos especiales.

**Archivo:** `src/main/java/com/aurora/excepciones/servicio/Catalogo.java`

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

`ServicioPedidos` orquesta la reserva. Traduce el SKU crudo, obtiene el producto, pide al dominio que reserve y actualiza el catálogo. No atrapa excepciones aquí porque no puede tomar una decisión útil; las deja subir a la frontera que sabe cómo reportarlas.

**Archivo:** `src/main/java/com/aurora/excepciones/servicio/ServicioPedidos.java`

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

### Frontera CLI


`TiendaAuroraExcepcionesApp` es la frontera CLI. Aquí sí hay manejo de excepciones: captura las de dominio para mostrar un error claro al usuario, y el comando `auditoria` ejecuta casos controlados que demuestran checked, unchecked, `try-with-resources`, excepciones suprimidas, causa preservada y propagación correcta.

**Archivo:** `src/main/java/com/aurora/excepciones/TiendaAuroraExcepcionesApp.java`

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

## Ejecutar

Compila el proyecto:

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
```

Importa el CSV con filas válidas y filas rotas:

```bash
./gradlew -q run --args="importar --archivo productos.csv"
```

```text
Importados: 3
Rechazados: 2
  CAF-0001  Café Aurora         $12.50 stock=3
  MOL-0003  Molino manual       $34.90 stock=1
  FIL-0004  Filtros x100         $4.75 stock=10
  RECHAZO línea 4 inválida: datos inválidos | contenido=BAD-0001;;8.00;2
  RECHAZO línea 5 inválida: datos inválidos | contenido=TAZ-0002;Taza Aurora;precio;2
```

Reserva stock válido:

```bash
./gradlew -q run --args="reservar --archivo productos-buenos.csv --sku CAF-0001 --cantidad 2"
```

```text
Reserva OK: CAF-0001 x2 total=$25.00
Stock restante: 1
```

Reserva más stock del disponible:

```bash
./gradlew -q run --args="reservar --archivo productos-buenos.csv --sku CAF-0001 --cantidad 99"
```

```text
ERROR_NEGOCIO: StockInsuficienteException
mensaje: stock insuficiente para CAF-0001: disponible=3, solicitado=99
```

Ejecuta la auditoría de comportamientos:

```bash
./gradlew -q run --args="auditoria"
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

## Conceptos cubiertos

### Tema 1: Checked vs unchecked exceptions · Básico · 35 min

La primera decisión ante una falla no es “¿la atrapo?”, sino “¿qué tipo de falla es y quién puede hacer algo útil con ella?”. Java distingue dos grandes familias dentro de `Exception`: las checked exceptions, que heredan de `Exception` pero no de `RuntimeException`, y las unchecked exceptions, que heredan de `RuntimeException`.

Una checked exception representa un problema que el llamador razonablemente puede anticipar y manejar. Leer un archivo puede fallar porque el archivo no existe, no hay permisos o el disco falló. Ese no es un bug de lógica del programa; es una condición externa. Por eso `Files.newBufferedReader` declara `IOException`. El compilador obliga a capturarla o declararla con `throws`. Esa obligación no es burocracia: hace visible el contrato. Si un método firma `throws ImportacionException`, quien lo llama sabe que debe tomar una decisión.

En Tienda Aurora, `ImportadorProductos.importar` traduce `IOException` a `ImportacionException`:

```java
try (BufferedReader lector = Files.newBufferedReader(ruta, StandardCharsets.UTF_8)) {
    // parseo por linea
} catch (IOException e) {
    throw new ImportacionException("no se pudo leer el archivo " + ruta, e);
}
```

Hay dos detalles importantes en ese bloque. Primero, el método no se queda con el `IOException` crudo: lo envuelve en una excepción de su propio dominio de importación. Eso evita que detalles de bajo nivel se filtren por toda la aplicación. Segundo, pasa `e` como causa. Si mañana alguien ve el error en un log, puede seguir la cadena hasta el `NoSuchFileException` original. Perder la causa es perder la explicación.

Una unchecked exception representa otra clase de problema: una precondición violada, un dato inválido o una regla que el llamador debió respetar. `DatoInvalidoException` y `StockInsuficienteException` son unchecked en este proyecto. El compilador no obliga a capturarlas en cada llamada, porque obligar a hacerlo produciría código defensivo ruidoso en todos los niveles. Lo correcto es dejarlas subir hasta una frontera donde tenga sentido responder: una CLI, un controlador HTTP, un job, una cola.

La auditoría muestra las dos familias en ejecución:

```text
== checked ==
ImportacionException
causa: NoSuchFileException

== unchecked ==
StockInsuficienteException
stock insuficiente para CAF-0001: disponible=3, solicitado=99
```

La diferencia no es “grave vs leve”. Un archivo faltante puede ser grave. La diferencia es el tipo de contrato. La checked exception dice “este fallo externo puede pasar; decide”. La unchecked dice “este estado o dato no cumple el contrato; corrige el uso o maneja la regla en la frontera adecuada”. Usar checked para todo vuelve el código inmanejable; usar unchecked para todo esconde fallos recuperables que deberían ser explícitos.

También conviene evitar el extremo de capturar `Exception` o `RuntimeException` “por si acaso”. Ese tipo de catch grande suele borrar la señal. Si capturas, hazlo porque sabes qué harás con ese caso: recuperar, convertir, reintentar con límite, registrar con contexto o devolver un error de negocio. Si no sabes qué hacer, normalmente es mejor dejar que suba.

### Tema 2: try-with-resources · Básico · 40 min

Un recurso externo —archivo, socket, conexión JDBC, stream— debe cerrarse aunque ocurra un error. Antes de Java 7, esto se hacía con `try/finally` manual y era fácil equivocarse: cerrar en el lugar equivocado, olvidar el cierre en una rama, o pisar la excepción original con la excepción del `close()`.

`try-with-resources` resuelve ese problema con un contrato simple: si un objeto implementa `AutoCloseable`, puedes declararlo en la cabecera del `try` y Java lo cerrará al salir del bloque, tanto si el cuerpo termina normal como si lanza excepción.

En el importador, el recurso es un `BufferedReader`:

```java
try (BufferedReader lector = Files.newBufferedReader(ruta, StandardCharsets.UTF_8)) {
    String linea;
    int numeroLinea = 0;
    while ((linea = lector.readLine()) != null) {
        // parseo por linea
    }
} catch (IOException e) {
    throw new ImportacionException("no se pudo leer el archivo " + ruta, e);
}
```

El lector se cierra aunque `readLine()` falle, aunque una línea provoque una excepción no capturada dentro del bloque, o aunque el método retorne antes. No hace falta un `finally` con `if (lector != null) lector.close()`; el compilador genera el cierre correcto.

El caso interesante es cuando fallan dos cosas a la vez: el cuerpo del `try` y el `close()`. Java no puede lanzar dos excepciones principales al mismo tiempo. Conserva la excepción del cuerpo como principal y adjunta la del cierre como *suppressed exception*. Eso es lo correcto porque la causa raíz suele estar en el cuerpo; el fallo al cerrar es contexto adicional.

La auditoría lo demuestra con un recurso ruidoso:

```text
== suprimida ==
recurso abierto
principal: falló el cuerpo
suprimidas: 1
suprimida: falló el cierre
```

Ese detalle importa en diagnóstico. Si el cierre reemplazara la excepción principal, verías “falló el cierre” y perderías la razón real por la que el trabajo falló. `Throwable.getSuppressed()` existe precisamente para inspeccionar esas excepciones secundarias. No necesitas usarlo todos los días, pero debes saber que try-with-resources las preserva.

La regla práctica es directa: todo `AutoCloseable` que abras debe vivir en un try-with-resources o ser cerrado por un dueño claramente definido. No confíes en el garbage collector para liberar archivos, sockets o conexiones. El GC libera memoria; no garantiza cuándo se ejecuta un cierre externo.

### Tema 3: Excepciones personalizadas y no tragar excepciones · Intermedio · 35 min

Una excepción personalizada vale la pena cuando su tipo comunica algo que el tipo genérico no comunica, o cuando lleva datos que el llamador necesita. `StockInsuficienteException` no existe solo por estética: permite distinguir “no hay stock” de “el SKU no existe” o “la cantidad es inválida”. En una API, esos casos pueden mapearse a respuestas distintas; en una CLI, a mensajes distintos; en un job, a reintentos o a descarte.

Una buena excepción de dominio tiene tres propiedades. El nombre dice qué pasó. El mensaje incluye contexto útil: qué SKU, qué cantidad, qué línea, qué archivo. La causa preserva el error técnico cuando la excepción es una traducción. `DatoInvalidoException("cantidad inválida: 'x'", e)` es mejor que `RuntimeException("error")` porque no borra ni el dato ni la causa.

La preservación de causa es una disciplina pequeña con mucho impacto. La auditoría muestra este caso:

```text
== causa preservada ==
cantidad inválida: 'x'
causa: NumberFormatException
```

El método `parsearCantidad` captura `NumberFormatException`, que es una excepción técnica del JDK, y lanza `DatoInvalidoException`, que es un error con significado en el dominio de entrada. Quien recibe la excepción de dominio entiende el problema; quien depura puede inspeccionar la causa y ver el detalle técnico original. Es una traducción, no un borrado.

El antipatrón opuesto es tragar excepciones. Tragar una excepción es capturarla y no hacer nada útil: ni registrarla, ni devolver un valor documentado, ni traducirla, ni relanzarla. El caso más dañino es el catch vacío:

```java
try {
    importar(ruta);
} catch (Exception e) {
    // nada
}
```

Ese código convierte un fallo en silencio. El sistema sigue como si todo hubiera salido bien, pero el archivo no se importó, el stock no se actualizó o el dato quedó incompleto. El bug aparece después, lejos del origen, y no hay traza útil. En producción, un catch vacío es una deuda que se cobra con horas de diagnóstico.

La corrección depende del contexto. Si estás en una frontera, puedes registrar y responder con un error claro. Si estás en una capa intermedia sin capacidad de decisión, normalmente debes propagar. Si el fallo es recuperable por elemento, como una fila CSV inválida, puedes acumular el rechazo y seguir con las demás filas. Eso es lo que hace `ImportadorProductos`: no traga la línea mala, la convierte en un rechazo con número de línea, contenido y motivo.

La salida de `importar` muestra esa decisión:

```text
Importados: 3
Rechazados: 2
  CAF-0001  Café Aurora         $12.50 stock=3
  MOL-0003  Molino manual       $34.90 stock=1
  FIL-0004  Filtros x100         $4.75 stock=10
  RECHAZO línea 4 inválida: datos inválidos | contenido=BAD-0001;;8.00;2
  RECHAZO línea 5 inválida: datos inválidos | contenido=TAZ-0002;Taza Aurora;precio;2
```

No se perdió la información del error, no se cayó toda la importación y tampoco se fingió éxito. El resultado es explícito. Esa es la diferencia entre manejar una excepción y esconderla.

## Cierre

Las excepciones bien diseñadas hacen visible el mapa de fallos del sistema. Las checked exceptions fuerzan a decidir ante condiciones externas recuperables. Las unchecked expresan precondiciones rotas o reglas de dominio que deben subir hasta una frontera competente. `try-with-resources` garantiza el cierre de recursos y preserva la excepción principal cuando el cierre también falla. Las excepciones personalizadas dan nombre y contexto; preservar la causa da diagnóstico.

La regla de oro es simple: si capturas una excepción, haz algo útil con ella. Si no puedes hacer algo útil, no la captures ahí. Y si la traduces, no le borres la causa.

## Checklist

- Distingo fallos externos recuperables de violaciones de precondición o reglas de dominio antes de elegir checked o unchecked.
- Uso `try-with-resources` para todo `AutoCloseable` y entiendo el comportamiento de excepciones suprimidas.
- Preservo la causa original cuando traduzco una excepción técnica a una excepción de dominio.
- No trago excepciones: registro, traduzco, recupero con criterio o propago.
- Diseño excepciones personalizadas solo cuando aportan significado, contexto o una decisión distinta al llamador.
- Devuelvo errores observables: mensaje claro, datos relevantes y, cuando aplica, línea/contenido/identificador.
