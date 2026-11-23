# Módulo 0: Sintaxis, tipos y el modelo de la JVM


## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-0-jvm-pipeline.html`; regeneración: editar el HTML/SVG en esa ruta):** [De .java a ejecución en JVM: compilación a bytecode, carga, verificación y ejecución](/visuals/temas/java/modulo-0-jvm-pipeline.html)

Lectura: El bytecode es el puente portable entre el código fuente y la JVM.


Tienda Aurora arranca como una aplicación de consola que cotiza pedidos. No hay Spring todavía, no hay base de datos, no hay HTTP: solo Java. Esa restricción es deliberada. Antes de repartir responsabilidades entre frameworks conviene entender qué hace el lenguaje por sí mismo, porque los errores más caros de un sistema grande —un total que no cuadra por un céntimo, una fecha que se guarda un día antes, un `==` que compara direcciones en lugar de valores— nacen en estas primeras decisiones y se propagan sin ruido hasta producción.

La aplicación que construimos en este módulo se llama `tienda-aurora-fundamentos` y tiene cuatro comandos reales: `catalogo` lista los productos con su stock, `cotizar` arma un pedido y emite el recibo, `interactivo` atiende a un cliente por teclado y `diagnostico` ejecuta una batería de comprobaciones sobre supuestos del lenguaje que afectan al dinero y a las fechas. Cada tema de este capítulo añade una pieza a ese mismo proyecto; no hay ejemplos sueltos que se tiran después. Al terminar tendrás una aplicación que compila con Gradle, se ejecuta desde la terminal y produce exactamente la salida que verás aquí.

**Entorno de referencia verificado (2026-11-23):** JDK 27.0.1.0.2 (`javac 27.0.1.0.2`), Gradle 9.9.1, macOS arm64, toolchain Java 25; las compilaciones a mano usan `--release 25`. Las salidas etiquetadas como «salida real» son transcripciones literales de ejecuciones en ese entorno. Dos avisos: los comandos que lean reloj o midan tiempo muestran la hora o el resultado de esa corrida, y `./gradlew -q test` no imprime nada cuando pasa (el resumen se lee en `build/test-results/test/`).

## Proyecto desde cero: tienda-aurora-fundamentos

Antes de escribir la primera línea conviene decidir qué representa cada cosa. Tienda Aurora vende productos identificados por un SKU, con un precio y un stock. Un pedido agrupa líneas de producto, aplica una política comercial de descuentos por tramo y calcula IVA. El recibo se imprime en caja y promete una fecha de entrega en días laborables.

De ahí salen cinco decisiones que el código materializa:

- El dinero se guarda en centavos con un `long`, no con `double`. Un precio de 34,90 € son 3490 centavos; tres unidades son 10470 centavos y el total es exactamente 104,70 €.
- El SKU es un objeto de valor que normaliza y valida en el constructor. `" caf_0001 "` y `"CAF-0001"` producen la misma identidad.
- El catálogo encapsula un arreglo y entrega copias defensivas. Nadie de fuera puede alterar su estado interno.
- El carrito calcula subtotal, descuento, base imponible, IVA y total a partir de las líneas, sin guardar totales que puedan desincronizarse.
- Las fechas usan `java.time`. La entrega se calcula sumando días laborables, no días naturales.

El proyecto completo ocupa alrededor de ochocientas líneas, comentarios incluidos, y sin embargo toca todos los temas del módulo: compilación, tipos, cadenas, control de flujo, arreglos, entrada por teclado y fechas.

## Prerrequisitos

Necesitas un JDK 25 o superior y Gradle 9. El JDK incluye el compilador (`javac`) y la máquina virtual (`java`); Gradle orquesta el build.

```bash
java -version
javac -version
gradle --version
```

En el entorno de referencia, esas órdenes responden:

```text
openjdk version "27.0.1.0.2" 2026-10-21
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1, mixed mode, sharing)
javac 27.0.1.0.2

------------------------------------------------------------
Gradle 9.9.1
------------------------------------------------------------
```

Si `javac` no existe pero `java` sí, tienes un runtime sin compilador: instala un JDK, no un JRE.

## Bootstrap

```bash
mkdir -p tienda-aurora-fundamentos/src/main/java/com/aurora/fundamentos/{catalogo,diagnostico,dominio,tiempo,venta}
mkdir -p tienda-aurora-fundamentos/scripts
cd tienda-aurora-fundamentos
gradle wrapper --gradle-version 9.9.1
```

El proyecto canónico usa Gradle wrapper. Más adelante, `scripts/Inventario.java` se ejecuta directamente con el lanzador de Java para mostrar compilación sin build tool.

## Estructura del proyecto

```text
tienda-aurora-fundamentos/
├── build.gradle.kts
├── settings.gradle.kts
├── scripts/
│   └── Inventario.java
└── src/
    └── main/
        └── java/
            └── com/aurora/fundamentos/
                ├── TiendaAuroraApp.java
                ├── catalogo/
                │   ├── Catalogo.java
                │   └── Sku.java
                ├── diagnostico/
                │   └── DiagnosticoTipos.java
                ├── dominio/
                │   ├── Dinero.java
                │   ├── LineaCarrito.java
                │   └── Producto.java
                ├── tiempo/
                │   └── CalendarioComercial.java
                └── venta/
                    ├── Carrito.java
                    ├── Pedido.java
                    └── Recibo.java
```

`src/main/java` es la raíz de fuentes que Gradle reconoce por convención. Los paquetes (`com.aurora.fundamentos.dominio`, etc.) se traducen a carpetas. `scripts/Inventario.java` queda fuera de esa raíz a propósito: es el archivo compacto del último tema y se ejecuta directamente con el lanzador de Java, sin pasar por Gradle. La versión verificada añade `src/test/java/com/aurora/fundamentos/FundamentosTest.java`, que se documenta completo en la sección `#### Test`.

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
    mainClass = "com.aurora.fundamentos.TiendaAuroraApp"
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}

tasks.jar {
    manifest {
        attributes["Main-Class"] = application.mainClass.get()
    }
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test { useJUnitPlatform() }
```

El bloque `toolchain` fija Java 25 aunque tu `java` del sistema sea más nuevo. Gradle busca un JDK 25 instalado y, si no lo encuentra, lo descarga. Eso elimina la diferencia entre la máquina del estudiante y el CI. Los argumentos `-Xlint:all -Werror` convierten cualquier advertencia del compilador en un fallo del build: es incómodo al principio y evita clases de bugs enteras después. El plugin `application` genera el script de arranque y permite `gradle run`; el manifiesto del JAR permite ejecutar el artefacto con `java -jar`.

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-fundamentos"
```

## Código completo

**Archivo:** `src/main/java/com/aurora/fundamentos/dominio/Dinero.java`

```java
package com.aurora.fundamentos.dominio;

import java.math.BigDecimal;
import java.util.Locale;

/**
 * Importe monetario inmutable.
 *
 * Se guarda como un long de centavos, nunca como double: así el total de un
 * pedido coincide siempre con la suma de sus líneas y no aparecen residuos
 * binarios como 104.69999999999999.
 */
public final class Dinero implements Comparable<Dinero> {

    public static final Dinero CERO = new Dinero(0L);

    private final long centavos;

    private Dinero(long centavos) {
        this.centavos = centavos;
    }

    /** Acepta texto decimal con punto, por ejemplo "12.50". */
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

    public Dinero menos(Dinero otro) {
        return new Dinero(Math.subtractExact(this.centavos, otro.centavos));
    }

    public Dinero negado() {
        return new Dinero(Math.negateExact(this.centavos));
    }

    public Dinero por(int cantidad) {
        if (cantidad < 0) {
            throw new IllegalArgumentException("cantidad negativa: " + cantidad);
        }
        return new Dinero(Math.multiplyExact(this.centavos, cantidad));
    }

    /** Porcentaje con redondeo half-up entero: no pasa por double. */
    public Dinero porcentaje(int porcentaje) {
        long bruto = Math.multiplyExact(this.centavos, porcentaje);
        return new Dinero(Math.floorDiv(bruto + 50, 100));
    }

    public boolean esCero() {
        return centavos == 0;
    }

    public long enCentavos() {
        return centavos;
    }

    public String formateado() {
        long absoluto = Math.abs(centavos);
        return String.format(Locale.ROOT, "%s%d.%02d",
                centavos < 0 ? "-" : "", absoluto / 100, absoluto % 100);
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

**Archivo:** `src/main/java/com/aurora/fundamentos/catalogo/Sku.java`

```java
package com.aurora.fundamentos.catalogo;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Código de producto de Tienda Aurora: tres letras, guion y cuatro dígitos.
 *
 * Normaliza la entrada del usuario (espacios, minúsculas) antes de validar,
 * de modo que " caf-0001 " y "CAF-0001" son el mismo producto.
 */
public final class Sku {

    private static final Pattern FORMATO = Pattern.compile("[A-Z]{3}-\\d{4}");

    private final String valor;

    private Sku(String valor) {
        this.valor = valor;
    }

    public static Sku de(String crudo) {
        Objects.requireNonNull(crudo, "sku");
        String limpio = crudo.strip()
                .toUpperCase(Locale.ROOT)
                .replace(" ", "")
                .replace("_", "-");
        if (!FORMATO.matcher(limpio).matches()) {
            throw new IllegalArgumentException("SKU inválido: '" + crudo + "' (formato AAA-0000)");
        }
        return new Sku(limpio);
    }

    public String valor() {
        return valor;
    }

    @Override
    public String toString() {
        return valor;
    }

    @Override
    public boolean equals(Object otro) {
        return otro instanceof Sku sku && valor.equals(sku.valor);
    }

    @Override
    public int hashCode() {
        return valor.hashCode();
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/dominio/Producto.java`

```java
package com.aurora.fundamentos.dominio;

import com.aurora.fundamentos.catalogo.Sku;

import java.util.Locale;
import java.util.Objects;

/**
 * Producto del catálogo. La identidad (sku) y el precio son inmutables;
 * el stock cambia con cada venta, por eso es el único campo mutable.
 */
public final class Producto {

    private final Sku sku;
    private final String nombre;
    private final Dinero precio;
    private int stock;

    public Producto(Sku sku, String nombre, Dinero precio, int stock) {
        this.sku = Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(precio, "precio");
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("nombre obligatorio");
        }
        if (precio.compareTo(Dinero.CERO) <= 0) {
            throw new IllegalArgumentException("precio debe ser mayor que cero");
        }
        if (stock < 0) {
            throw new IllegalArgumentException("stock no puede ser negativo");
        }
        this.nombre = nombre.strip();
        this.precio = precio;
        this.stock = stock;
    }

    public Sku sku() {
        return sku;
    }

    public String nombre() {
        return nombre;
    }

    public Dinero precio() {
        return precio;
    }

    public int stock() {
        return stock;
    }

    public boolean hayStock(int cantidad) {
        return cantidad > 0 && stock >= cantidad;
    }

    public void descontar(int cantidad) {
        if (!hayStock(cantidad)) {
            throw new IllegalStateException(
                    "stock insuficiente para " + sku + ": pedido " + cantidad + ", disponible " + stock);
        }
        stock -= cantidad;
    }

    @Override
    public String toString() {
        return String.format(Locale.ROOT, "%s %-16s %8s  stock=%3d", sku, nombre, precio, stock);
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/dominio/LineaCarrito.java`

```java
package com.aurora.fundamentos.dominio;

/**
 * Una línea del carrito: un producto y una cantidad.
 * El subtotal se calcula, no se guarda: así nunca queda desincronizado.
 */
public final class LineaCarrito {

    private final Producto producto;
    private final int cantidad;

    public LineaCarrito(Producto producto, int cantidad) {
        if (producto == null) {
            throw new IllegalArgumentException("producto obligatorio");
        }
        if (cantidad <= 0) {
            throw new IllegalArgumentException("cantidad debe ser mayor que cero");
        }
        this.producto = producto;
        this.cantidad = cantidad;
    }

    public Producto producto() {
        return producto;
    }

    public int cantidad() {
        return cantidad;
    }

    public Dinero subtotal() {
        return producto.precio().por(cantidad);
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/catalogo/Catalogo.java`

```java
package com.aurora.fundamentos.catalogo;

import com.aurora.fundamentos.dominio.Producto;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

/**
 * Catálogo inmutable respaldado por un arreglo.
 *
 * El constructor y el accesor copian el arreglo: quien recibe el catálogo no
 * puede modificar por accidente el estado interno del servicio.
 */
public final class Catalogo {

    private final Producto[] productos;

    public Catalogo(Producto[] productos) {
        Objects.requireNonNull(productos, "productos");
        this.productos = Arrays.copyOf(productos, productos.length);
    }

    public Producto[] productos() {
        return Arrays.copyOf(productos, productos.length);
    }

    public int tamano() {
        return productos.length;
    }

    /** Búsqueda lineal: adecuada para un catálogo pequeño en memoria. */
    public Optional<Producto> buscar(Sku sku) {
        for (Producto producto : productos) {
            if (producto.sku().equals(sku)) {
                return Optional.of(producto);
            }
        }
        return Optional.empty();
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/venta/Carrito.java`

```java
package com.aurora.fundamentos.venta;

import com.aurora.fundamentos.dominio.Dinero;
import com.aurora.fundamentos.dominio.LineaCarrito;
import com.aurora.fundamentos.dominio.Producto;

import java.util.ArrayList;
import java.util.List;

/**
 * Carrito de la tienda. Aplica la política comercial de Tienda Aurora:
 *
 * <ul>
 *   <li>subtotal ≥ 50: 5 % de descuento</li>
 *   <li>subtotal ≥ 100: 10 % de descuento</li>
 *   <li>sobre la base con descuento se aplica un IVA del 21 %</li>
 * </ul>
 */
public final class Carrito {

    private static final Dinero UMBRAL_PLATA = Dinero.de("50.00");
    private static final Dinero UMBRAL_ORO = Dinero.de("100.00");

    private final List<LineaCarrito> lineas = new ArrayList<>();

    public void agregar(Producto producto, int cantidad) {
        if (!producto.hayStock(cantidad)) {
            throw new IllegalStateException("stock insuficiente para " + producto.sku());
        }
        lineas.add(new LineaCarrito(producto, cantidad));
    }

    public List<LineaCarrito> lineas() {
        return List.copyOf(lineas);
    }

    public int unidades() {
        int unidades = 0;
        for (LineaCarrito linea : lineas) {
            unidades += linea.cantidad();
        }
        return unidades;
    }

    public Dinero subtotal() {
        Dinero total = Dinero.CERO;
        for (LineaCarrito linea : lineas) {
            total = total.mas(linea.subtotal());
        }
        return total;
    }

    public Dinero descuento() {
        int porcentaje = switch (tramo(subtotal())) {
            case BASE -> 0;
            case PLATA -> 5;
            case ORO -> 10;
        };
        return subtotal().porcentaje(porcentaje);
    }

    public Dinero baseImponible() {
        return subtotal().menos(descuento());
    }

    public Dinero iva() {
        return baseImponible().porcentaje(21);
    }

    public Dinero total() {
        return baseImponible().mas(iva());
    }

    private Tramo tramo(Dinero importe) {
        if (importe.compareTo(UMBRAL_ORO) >= 0) {
            return Tramo.ORO;
        }
        if (importe.compareTo(UMBRAL_PLATA) >= 0) {
            return Tramo.PLATA;
        }
        return Tramo.BASE;
    }

    private enum Tramo {
        BASE, PLATA, ORO
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/venta/Pedido.java`

```java
package com.aurora.fundamentos.venta;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Objects;

/**
 * Pedido creado en una fecha concreta. Guarda la hora local de la tienda
 * y expone el instante UTC para integraciones (pagos, logística).
 */
public final class Pedido {

    private final String numero;
    private final LocalDateTime creadoEn;
    private final Carrito carrito;

    public Pedido(String numero, LocalDateTime creadoEn, Carrito carrito) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("número de pedido obligatorio");
        }
        this.numero = numero;
        this.creadoEn = Objects.requireNonNull(creadoEn, "creadoEn");
        this.carrito = Objects.requireNonNull(carrito, "carrito");
    }

    public String numero() {
        return numero;
    }

    public LocalDateTime creadoEn() {
        return creadoEn;
    }

    public Carrito carrito() {
        return carrito;
    }

    public long timestampUtc() {
        return creadoEn.toInstant(ZoneOffset.UTC).toEpochMilli();
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/tiempo/CalendarioComercial.java`

```java
package com.aurora.fundamentos.tiempo;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Calendario comercial de Tienda Aurora: cuenta días laborables de lunes a
 * viernes y formatea fechas de forma estable, independiente del locale.
 */
public final class CalendarioComercial {

    private static final DateTimeFormatter FECHA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ROOT);

    private CalendarioComercial() {
    }

    public static boolean esLaborable(LocalDate fecha) {
        DayOfWeek dia = fecha.getDayOfWeek();
        return dia != DayOfWeek.SATURDAY && dia != DayOfWeek.SUNDAY;
    }

    public static LocalDate sumarDiasLaborables(LocalDate desde, int dias) {
        if (dias < 0) {
            throw new IllegalArgumentException("días negativos: " + dias);
        }
        LocalDate fecha = desde;
        int restantes = dias;
        while (restantes > 0) {
            fecha = fecha.plusDays(1);
            if (esLaborable(fecha)) {
                restantes--;
            }
        }
        return fecha;
    }

    public static String formatear(LocalDate fecha) {
        return fecha.format(FECHA);
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/venta/Recibo.java`

```java
package com.aurora.fundamentos.venta;

import com.aurora.fundamentos.dominio.Dinero;
import com.aurora.fundamentos.dominio.LineaCarrito;
import com.aurora.fundamentos.tiempo.CalendarioComercial;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Genera el texto del recibo que se imprime en caja.
 *
 * Usa StringBuilder porque concatena decenas de fragmentos en un bucle; con
 * el operador + cada vuelta crearía un String nuevo.
 */
public final class Recibo {

    private static final DateTimeFormatter FECHA_HORA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ROOT);
    private static final String LINEA = "==========================================\n";

    public String generar(Pedido pedido) {
        Carrito carrito = pedido.carrito();
        StringBuilder texto = new StringBuilder(512);

        texto.append(LINEA);
        texto.append(" TIENDA AURORA - RECIBO ").append(pedido.numero()).append('\n');
        texto.append(" Fecha: ").append(pedido.creadoEn().format(FECHA_HORA)).append('\n');
        texto.append(LINEA);

        for (LineaCarrito linea : carrito.lineas()) {
            texto.append(String.format(Locale.ROOT, " %-7s %-14s %5d x %8s = %9s%n",
                    linea.producto().sku(),
                    linea.producto().nombre(),
                    linea.cantidad(),
                    linea.producto().precio(),
                    linea.subtotal()));
        }

        texto.append("------------------------------------------\n");
        alinear(texto, "Subtotal", carrito.subtotal());
        alinear(texto, "Descuento", carrito.descuento().negado());
        alinear(texto, "Base imponible", carrito.baseImponible());
        alinear(texto, "IVA 21%", carrito.iva());
        alinear(texto, "TOTAL", carrito.total());
        texto.append("------------------------------------------\n");
        texto.append(" Entrega estimada: ")
                .append(CalendarioComercial.formatear(
                        CalendarioComercial.sumarDiasLaborables(pedido.creadoEn().toLocalDate(), 3)))
                .append('\n');
        texto.append(LINEA);

        return texto.toString();
    }

    private void alinear(StringBuilder texto, String etiqueta, Dinero importe) {
        texto.append(String.format(Locale.ROOT, " %-18s %20s%n", etiqueta, importe));
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/diagnostico/DiagnosticoTipos.java`

```java
package com.aurora.fundamentos.diagnostico;

import com.aurora.fundamentos.catalogo.Catalogo;
import com.aurora.fundamentos.catalogo.Sku;
import com.aurora.fundamentos.dominio.Dinero;
import com.aurora.fundamentos.dominio.Producto;

import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.Objects;

/**
 * Comprobaciones que Tienda Aurora ejecuta en CI para documentar supuestos
 * del lenguaje que afectan al dinero, a las comparaciones y a las fechas.
 *
 * Se invoca con `./gradlew -q run --args="diagnostico"`.
 */
public final class DiagnosticoTipos {

    public void ejecutar() {
        seccion("1. double frente a Dinero");
        doubleFrenteADinero();

        seccion("2. Desbordamiento de primitivos");
        desbordamiento();

        seccion("3. == frente a equals en objetos");
        igualdadDeReferencias();

        seccion("4. Caché de Integer y comparación de wrappers");
        cacheDeWrappers();

        seccion("5. Copia defensiva de arreglos");
        copiaDefensiva();

        seccion("6. Date y Calendar heredados");
        fechasHeredadas();
    }

    private void doubleFrenteADinero() {
        double precio = 34.90;
        int unidades = 3;
        double totalDouble = precio * unidades;
        Dinero totalDinero = Dinero.de("34.90").por(unidades);

        System.out.printf(Locale.ROOT, "  double : %.17f%n", totalDouble);
        System.out.println("  Dinero : " + totalDinero + " (" + totalDinero.enCentavos() + " centavos)");
        System.out.println("  totalDouble == 104.70 -> " + (totalDouble == 104.70));
        System.out.println("  totalDinero.equals(Dinero.de(\"104.70\")) -> "
                + totalDinero.equals(Dinero.de("104.70")));
    }

    private void desbordamiento() {
        int unidades = 1_000_000;
        int centavosUnitarios = 3_490;
        int totalInt = unidades * centavosUnitarios;
        long totalLong = (long) unidades * centavosUnitarios;

        System.out.println("  int  -> " + totalInt);
        System.out.println("  long -> " + totalLong);
        try {
            Dinero.deCentavos(Long.MAX_VALUE).por(2);
        } catch (ArithmeticException e) {
            System.out.println("  Dinero falla rápido -> " + e.getMessage());
        }
    }

    private void igualdadDeReferencias() {
        Dinero a = Dinero.de("10.00");
        Dinero b = Dinero.de("10.00");
        System.out.println("  a == b      -> " + (a == b));
        System.out.println("  a.equals(b) -> " + a.equals(b));

        String s1 = new String("CAF-0001");
        String s2 = new String("CAF-0001");
        System.out.println("  s1 == s2      -> " + (s1 == s2));
        System.out.println("  s1.equals(s2) -> " + s1.equals(s2));
    }

    private void cacheDeWrappers() {
        Integer pequeno1 = 127;
        Integer pequeno2 = 127;
        Integer grande1 = 128;
        Integer grande2 = 128;
        System.out.println("  127 == 127 -> " + (pequeno1 == pequeno2));
        System.out.println("  128 == 128 -> " + (grande1 == grande2));
        System.out.println("  Objects.equals(128, 128) -> " + Objects.equals(grande1, grande2));
    }

    private void copiaDefensiva() {
        Producto[] original = {
                new Producto(Sku.de("CAF-0001"), "Café Aurora", Dinero.de("12.50"), 40)
        };
        Catalogo catalogo = new Catalogo(original);

        original[0] = null;

        System.out.println("  catálogo sigue con " + catalogo.tamano() + " producto(s)");
        System.out.println("  primer SKU -> " + catalogo.productos()[0].sku());
        System.out.println("  arreglo original mutado -> " + (original[0] == null));
    }

    @SuppressWarnings("deprecation")
    private void fechasHeredadas() {
        System.out.println("  Calendar.JANUARY -> " + Calendar.JANUARY);

        Date fecha = new Date(0L);
        fecha.setTime(86_400_000L);
        System.out.println("  Date mutable -> " + fecha.getTime());
        System.out.println("  Date.getMonth() (0 = enero) -> " + fecha.getMonth());
    }

    private void seccion(String titulo) {
        System.out.println();
        System.out.println(titulo);
    }
}
```

**Archivo:** `src/main/java/com/aurora/fundamentos/TiendaAuroraApp.java`

```java
package com.aurora.fundamentos;

import com.aurora.fundamentos.catalogo.Catalogo;
import com.aurora.fundamentos.catalogo.Sku;
import com.aurora.fundamentos.diagnostico.DiagnosticoTipos;
import com.aurora.fundamentos.dominio.Dinero;
import com.aurora.fundamentos.dominio.Producto;
import com.aurora.fundamentos.venta.Carrito;
import com.aurora.fundamentos.venta.Pedido;
import com.aurora.fundamentos.venta.Recibo;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Scanner;

/**
 * Punto de entrada de la aplicación de consola de Tienda Aurora.
 *
 * <pre>
 * ./gradlew -q run --args="catalogo"
 * ./gradlew -q run --args="cotizar --sku CAF-0001 --cantidad 3"
 * </pre>
 */
public final class TiendaAuroraApp {

    private static final ZoneId ZONA_TIENDA = ZoneId.of("Europe/Madrid");

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        if (args.length == 0) {
            imprimirAyuda();
            return;
        }

        String comando = args[0];
        switch (comando) {
            case "catalogo" -> imprimirCatalogo(construirCatalogo());
            case "cotizar" -> cotizar(args);
            case "interactivo" -> interactivo();
            case "diagnostico" -> new DiagnosticoTipos().ejecutar();
            default -> {
                System.err.println("Comando desconocido: " + comando);
                imprimirAyuda();
                System.exit(2);
            }
        }
    }

    private static void imprimirAyuda() {
        System.out.println("""
                Tienda Aurora - fundamentos de Java

                Uso:
                  catalogo
                  cotizar --sku CAF-0001 [--cantidad 2] [--fecha 2026-11-22T10:30]
                  interactivo
                  diagnostico
                """);
    }

    private static void imprimirCatalogo(Catalogo catalogo) {
        System.out.println("Catálogo Tienda Aurora (" + catalogo.tamano() + " productos)");
        for (Producto producto : catalogo.productos()) {
            System.out.println("  " + producto);
        }
    }

    private static void cotizar(String[] args) {
        String skuCrudo = valorDe(args, "--sku");
        if (skuCrudo == null || skuCrudo.isBlank()) {
            System.err.println("Falta --sku");
            System.exit(2);
            return;
        }

        int cantidad = enteroPositivo(valorDe(args, "--cantidad", "1"));
        String fechaIso = valorDe(args, "--fecha");

        Catalogo catalogo = construirCatalogo();
        Sku sku = Sku.de(skuCrudo);
        Producto producto = catalogo.buscar(sku)
                .orElseThrow(() -> new IllegalArgumentException("SKU no existe: " + sku));

        Carrito carrito = new Carrito();
        carrito.agregar(producto, cantidad);

        LocalDateTime creadoEn = fechaIso == null
                ? LocalDateTime.now(ZONA_TIENDA)
                : LocalDateTime.parse(fechaIso);
        Pedido pedido = new Pedido("AUR-2026-0001", creadoEn, carrito);

        System.out.print(new Recibo().generar(pedido));
        System.out.println(" timestampUtc=" + pedido.timestampUtc());
    }

    private static void interactivo() {
        Catalogo catalogo = construirCatalogo();
        Carrito carrito = new Carrito();

        try (Scanner scanner = new Scanner(System.in)) {
            while (true) {
                System.out.print("SKU (fin para terminar): ");
                if (!scanner.hasNextLine()) {
                    break;
                }
                String entrada = scanner.nextLine().strip();
                if (entrada.equalsIgnoreCase("fin")) {
                    break;
                }

                Producto producto;
                try {
                    producto = catalogo.buscar(Sku.de(entrada)).orElse(null);
                } catch (IllegalArgumentException e) {
                    System.out.println("  " + e.getMessage());
                    continue;
                }
                if (producto == null) {
                    System.out.println("  No existe el SKU " + entrada);
                    continue;
                }

                int cantidad = leerEntero(scanner, "Cantidad: ");
                if (!producto.hayStock(cantidad)) {
                    System.out.println("  Solo quedan " + producto.stock() + " unidades");
                    continue;
                }
                carrito.agregar(producto, cantidad);
                System.out.println("  Agregado: " + producto.nombre() + " x" + cantidad);
            }
        }

        if (carrito.lineas().isEmpty()) {
            System.out.println("Carrito vacío");
            return;
        }
        Pedido pedido = new Pedido("AUR-2026-0001", LocalDateTime.now(ZONA_TIENDA), carrito);
        System.out.print(new Recibo().generar(pedido));
    }

    private static int leerEntero(Scanner scanner, String mensaje) {
        while (true) {
            System.out.print(mensaje);
            String linea = scanner.nextLine().strip();
            try {
                int valor = Integer.parseInt(linea);
                if (valor <= 0) {
                    System.out.println("  Debe ser mayor que cero");
                    continue;
                }
                return valor;
            } catch (NumberFormatException e) {
                System.out.println("  '" + linea + "' no es un entero válido");
            }
        }
    }

    private static int enteroPositivo(String texto) {
        try {
            int valor = Integer.parseInt(texto);
            if (valor <= 0) {
                throw new IllegalArgumentException("cantidad debe ser mayor que cero: " + texto);
            }
            return valor;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("cantidad no numérica: " + texto, e);
        }
    }

    private static String valorDe(String[] args, String nombre) {
        return valorDe(args, nombre, null);
    }

    private static String valorDe(String[] args, String nombre, String porDefecto) {
        for (int i = 1; i < args.length - 1; i++) {
            if (args[i].equals(nombre)) {
                return args[i + 1];
            }
        }
        return porDefecto;
    }

    static Catalogo construirCatalogo() {
        return new Catalogo(new Producto[] {
                new Producto(Sku.de("caf-0001"), "Café Aurora", Dinero.de("12.50"), 40),
                new Producto(Sku.de("taz-0002"), "Taza Aurora", Dinero.de("8.00"), 25),
                new Producto(Sku.de("mol-0003"), "Molino manual", Dinero.de("34.90"), 10),
                new Producto(Sku.de("fil-0004"), "Filtros x100", Dinero.de("4.75"), 120)
        });
    }
}
```

**Archivo:** `scripts/Inventario.java`

```java
import module java.base;

void main(String[] args) {
    var productos = List.of(
            new Producto("CAF-0001", "Café Aurora", 1250, 40),
            new Producto("TAZ-0002", "Taza Aurora", 800, 25),
            new Producto("MOL-0003", "Molino manual", 3490, 10));

    long valorCentavos = 0;
    for (Producto producto : productos) {
        valorCentavos += producto.centavos() * producto.stock();
    }

    IO.println("Productos en inventario: " + productos.size());
    for (Producto producto : productos) {
        IO.println("  " + producto.sku() + " " + producto.nombre()
                + " -> " + producto.stock() + " unidades");
    }
    IO.println("Valor total: "
            + (valorCentavos / 100) + "." + String.format("%02d", valorCentavos % 100));
}

record Producto(String sku, String nombre, long centavos, int stock) {
}
```

#### Test

**Archivo:** `src/test/java/com/aurora/fundamentos/FundamentosTest.java` (ruta real en `/tmp/opencode/aurora-m0`). Dependencias JUnit 5 en `build.gradle.kts` (`junit-bom:5.13.4`, `junit-jupiter` y `junit-platform-launcher`) y `tasks.test { useJUnitPlatform() }`. Siete casos sobre el dominio real del módulo.

```java
package com.aurora.fundamentos;

import com.aurora.fundamentos.catalogo.Catalogo;
import com.aurora.fundamentos.catalogo.Sku;
import com.aurora.fundamentos.dominio.Dinero;
import com.aurora.fundamentos.dominio.LineaCarrito;
import com.aurora.fundamentos.dominio.Producto;
import com.aurora.fundamentos.tiempo.CalendarioComercial;
import com.aurora.fundamentos.venta.Carrito;
import com.aurora.fundamentos.venta.Pedido;
import com.aurora.fundamentos.venta.Recibo;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FundamentosTest {

    @Test
    void dineroEsExactoYSeFormateaSinDouble() {
        Dinero total = Dinero.de("34.90").por(3);
        assertAll(
                () -> assertEquals(10470L, total.enCentavos()),
                () -> assertEquals(Dinero.de("104.70"), total),
                () -> assertEquals("104.70", total.formateado()),
                () -> assertEquals("$104.70", total.toString()),
                () -> assertEquals(Dinero.de("104.70"), Dinero.de("100.00").mas(Dinero.de("4.70"))),
                () -> assertThrows(ArithmeticException.class,
                        () -> Dinero.deCentavos(Long.MAX_VALUE).por(2))
        );
    }

    @Test
    void skuNormalizaYSeComparaPorValor() {
        Sku sucio = Sku.de(" caf_0001 ");
        Sku limpio = Sku.de("CAF-0001");
        assertAll(
                () -> assertEquals("CAF-0001", sucio.valor()),
                () -> assertEquals(limpio, sucio),
                () -> assertEquals(limpio.hashCode(), sucio.hashCode()),
                () -> assertEquals("SKU inválido: 'cafe' (formato AAA-0000)",
                        assertThrows(IllegalArgumentException.class, () -> Sku.de("cafe")).getMessage())
        );
    }

    @Test
    void catalogoNoExponeSuArregloInterno() {
        Producto[] productos = {
                new Producto(Sku.de("CAF-0001"), "Café Aurora", Dinero.de("12.50"), 40)
        };
        Catalogo catalogo = new Catalogo(productos);
        productos[0] = null;
        Producto[] entregados = catalogo.productos();
        entregados[0] = null;

        assertAll(
                () -> assertEquals(1, catalogo.tamano()),
                () -> assertEquals(Sku.de("CAF-0001"), catalogo.productos()[0].sku()),
                () -> assertTrue(catalogo.buscar(Sku.de("CAF-0001")).isPresent()),
                () -> assertFalse(catalogo.buscar(Sku.de("NOE-0001")).isPresent())
        );
    }

    @Test
    void carritoAplicaDescuentosPorTramoEIva() {
        Producto cafe = new Producto(Sku.de("CAF-0001"), "Café Aurora", Dinero.de("12.50"), 40);
        Carrito plata = new Carrito();
        plata.agregar(cafe, 4);

        Producto molino = new Producto(Sku.de("MOL-0003"), "Molino manual", Dinero.de("34.90"), 10);
        Carrito oro = new Carrito();
        oro.agregar(molino, 3);

        assertAll(
                () -> assertEquals(4, plata.unidades()),
                () -> assertEquals(Dinero.de("50.00"), plata.subtotal()),
                () -> assertEquals(Dinero.de("2.50"), plata.descuento()),
                () -> assertEquals(Dinero.de("47.50"), plata.baseImponible()),
                () -> assertEquals(Dinero.de("9.98"), plata.iva()),
                () -> assertEquals(Dinero.de("57.48"), plata.total()),
                () -> assertEquals(Dinero.de("10.47"), oro.descuento()),
                () -> assertEquals(Dinero.de("114.02"), oro.total())
        );
    }

    @Test
    void calendarioComercialCuentaSoloDiasLaborables() {
        LocalDate viernes = LocalDate.of(2026, 11, 20);
        assertAll(
                () -> assertTrue(CalendarioComercial.esLaborable(viernes)),
                () -> assertFalse(CalendarioComercial.esLaborable(viernes.plusDays(1))),
                () -> assertEquals(LocalDate.of(2026, 11, 25),
                        CalendarioComercial.sumarDiasLaborables(viernes, 3)),
                () -> assertEquals("25/11/2026",
                        CalendarioComercial.formatear(LocalDate.of(2026, 11, 25))),
                () -> assertThrows(IllegalArgumentException.class,
                        () -> CalendarioComercial.sumarDiasLaborables(viernes, -1))
        );
    }

    @Test
    void pedidoYReciboUsanFechaFijaYTotalDerivado() {
        Carrito carrito = new Carrito();
        carrito.agregar(new Producto(Sku.de("CAF-0001"), "Café Aurora", Dinero.de("12.50"), 40), 2);
        Pedido pedido = new Pedido("AUR-2026-0001", LocalDateTime.of(2026, 11, 22, 10, 30), carrito);
        String recibo = new Recibo().generar(pedido);

        assertAll(
                () -> assertEquals(1795343400000L, pedido.timestampUtc()),
                () -> assertTrue(recibo.contains("22/11/2026 10:30")),
                () -> assertTrue(recibo.contains("$30.25")),
                () -> assertTrue(recibo.contains("Entrega estimada: 25/11/2026"))
        );
    }

    @Test
    void lineaCarritoRechazaCantidadesInvalidas() {
        Producto producto = new Producto(Sku.de("TAZ-0002"), "Taza Aurora", Dinero.de("8.00"), 25);
        assertAll(
                () -> assertEquals(Dinero.de("16.00"), new LineaCarrito(producto, 2).subtotal()),
                () -> assertThrows(IllegalArgumentException.class, () -> new LineaCarrito(producto, 0)),
                () -> assertThrows(IllegalStateException.class, () -> producto.descontar(26))
        );
    }
}
```

Salida observada: `./gradlew -q clean test` termina con código de salida 0 y no escribe nada en stdout; el resumen XML que Gradle deja en `build/test-results/test/` confirma los siete casos:

```text
<testsuite name="com.aurora.fundamentos.FundamentosTest" tests="7" skipped="0" failures="0" errors="0" timestamp="2026-11-23T08:27:29.814Z" hostname="MacBook-Pro-de-Nicolas.local" time="0.021">
```

Los siete casos fallaron primero al escribir las aserciones y se corrigieron hasta que la suite quedó en verde; el XML mostrado corresponde a la última corrida limpia.

## Ejecutar

La forma recomendada es generar el wrapper una vez y usarlo siempre. El wrapper fija la versión de Gradle del proyecto, de modo que dos personas con Gradle distinto compilan igual.

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q run --args="catalogo"
```

Salida real:

```text
Catálogo Tienda Aurora (4 productos)
  CAF-0001 Café Aurora        $12.50  stock= 40
  TAZ-0002 Taza Aurora         $8.00  stock= 25
  MOL-0003 Molino manual      $34.90  stock= 10
  FIL-0004 Filtros x100        $4.75  stock=120
```

Una cotización con fecha fija, para que el recibo sea reproducible:

```bash
./gradlew -q run --args="cotizar --sku CAF-0001 --cantidad 2 --fecha 2026-11-22T10:30"
```

```text
==========================================
 TIENDA AURORA - RECIBO AUR-2026-0001
 Fecha: 22/11/2026 10:30
==========================================
 CAF-0001 Café Aurora        2 x   $12.50 =    $25.00
------------------------------------------
 Subtotal                         $25.00
 Descuento                         $0.00
 Base imponible                   $25.00
 IVA 21%                           $5.25
 TOTAL                            $30.25
------------------------------------------
 Entrega estimada: 25/11/2026
==========================================
 timestampUtc=1795343400000
```

Si prefieres compilar sin Gradle, el camino directo es:

```bash
mkdir -p out
javac --release 25 -encoding UTF-8 -d out $(find src/main/java -name '*.java')
java -cp out com.aurora.fundamentos.TiendaAuroraApp catalogo
```

Ambos caminos producen el mismo resultado porque el build de Gradle termina invocando a `javac`.

### Tema 1: Del código fuente a la JVM · Básico · 40 min

En el IDE aprietas “Run” y aparece la salida. No ves que se creó un archivo nuevo, ni dónde quedó, ni qué contiene. Cuando el mismo programa falla en el servidor de integración, no tienes modelo mental para diagnosticar: no sabes si el problema es el código, el compilador, la versión del runtime o el classpath.

El ciclo real tiene tres pasos. `javac` lee los archivos `.java` y produce bytecode en archivos `.class`. Cada clase pública genera un `.class` con su nombre. La JVM (`java`) carga ese bytecode y lo ejecuta. El IDE no elimina ninguno de los pasos: los automatiza y los esconde.

Compila el proyecto a mano una vez:

```bash
mkdir -p out
javac --release 25 -encoding UTF-8 -d out $(find src/main/java -name '*.java')
```

La opción `-d out` indica el directorio de salida. `--release 25` compila contra la API de Java 25 aunque tu JDK sea 27: el bytecode resultante declara la versión 69 y corre en cualquier JVM 25 o superior. `-encoding UTF-8` evita que los acentos de “Café” dependan del locale de la máquina.

Mira lo que se generó:

```bash
find out -name '*.class' | sort
```

```text
out/com/aurora/fundamentos/TiendaAuroraApp.class
out/com/aurora/fundamentos/catalogo/Catalogo.class
out/com/aurora/fundamentos/catalogo/Sku.class
out/com/aurora/fundamentos/diagnostico/DiagnosticoTipos.class
out/com/aurora/fundamentos/dominio/Dinero.class
out/com/aurora/fundamentos/dominio/LineaCarrito.class
out/com/aurora/fundamentos/dominio/Producto.class
out/com/aurora/fundamentos/tiempo/CalendarioComercial.class
out/com/aurora/fundamentos/venta/Carrito$Tramo.class
out/com/aurora/fundamentos/venta/Carrito.class
out/com/aurora/fundamentos/venta/Pedido.class
out/com/aurora/fundamentos/venta/Recibo.class
```

Hay dos detalles que conviene leer. El paquete se convirtió en carpetas: `com.aurora.fundamentos.dominio` vive en `out/com/aurora/fundamentos/dominio`. Y el enum anidado `Tramo` produjo `Carrito$Tramo.class`: el símbolo `$` separa la clase externa de la interna.

El bytecode no es código máquina ni texto: es un lenguaje intermedio con instrucciones como `aload_0`, `getfield` o `lreturn`. Puedes inspeccionarlo con `javap`. Primero las firmas:

```bash
javap -p out/com/aurora/fundamentos/catalogo/Sku.class
```

```text
Compiled from "Sku.java"
public final class com.aurora.fundamentos.catalogo.Sku {
  private static final java.util.regex.Pattern FORMATO;
  private final java.lang.String valor;
  private com.aurora.fundamentos.catalogo.Sku(java.lang.String);
  public static com.aurora.fundamentos.catalogo.Sku de(java.lang.String);
  public java.lang.String valor();
  public java.lang.String toString();
  public boolean equals(java.lang.Object);
  public int hashCode();
  static {};
}
```

Y ahora el cuerpo de un método pequeño, `Dinero.enCentavos()`, para ver la forma de las instrucciones:

```bash
javap -c -p out/com/aurora/fundamentos/dominio/Dinero.class | grep -A8 'public long enCentavos'
```

```text
  public long enCentavos();
    Code:
         0: aload_0
         1: getfield      #7                  // Field centavos:J
         4: lreturn
```

`aload_0` carga `this`; `getfield` lee el campo `centavos` de tipo `long` (`J`); `lreturn` devuelve ese `long`. No hay magia: el método que escribiste como `return centavos;` se convirtió en tres instrucciones.

El error clásico de esta etapa es `UnsupportedClassVersionError`. Significa que compilaste con un JDK más nuevo del que ejecuta. La causa es haber usado el `javac` del sistema (por ejemplo, 27) y desplegado en un runtime 21. La corrección es fijar `--release` o el toolchain de Gradle, no “recompilar a ver si pasa”. En Tienda Aurora, `build.gradle.kts` fija `JavaLanguageVersion.of(25)` justamente para que el bytecode y el runtime esperado coincidan en local y en CI.

### Tema 2: JDK, JRE y JVM · Básico · 30 min

“Instalé Java” es una frase ambigua. Un JDK contiene el compilador, las herramientas y el runtime. Un JRE contiene solo lo necesario para ejecutar. La JVM es el motor dentro de ambos. Si tienes un JRE y ejecutas `javac`, el sistema responde `command not found`; si tienes dos JDK instalados, `java` y `javac` pueden apuntar a versiones distintas.

Comprueba siempre las dos caras:

```bash
java -version
javac -version
```

```text
openjdk version "27.0.1.0.2" 2026-10-21
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1, mixed mode, sharing)
javac 27.0.1.0.2
```

Si ambos números coinciden, `java` y `javac` pertenecen al mismo JDK. Si no, tu `PATH` está mezclando instalaciones. Para ver de dónde sale el runtime:

```bash
java -XshowSettings:properties -version 2>&1 | grep -E 'java.home|java.version|java.vendor.version'
```

```text
    java.home = /Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home
    java.vendor.version = Temurin-27.0.1.0.2+1
    java.version = 27.0.1.0.2
```

`java.home` es la raíz de la instalación que se está ejecutando. Ese dato resuelve la mitad de los problemas de “funciona en mi máquina”: permite comparar la instalación local con la del servidor.

Gradle añade una capa útil: los toolchains. En lugar de depender del `java` del `PATH`, el build declara qué versión de lenguaje necesita y Gradle busca un JDK que la cumpla. En este proyecto, la declaración es `JavaLanguageVersion.of(25)`. Puedes ver qué encontró:

```bash
gradle -q javaToolchains
```

```text
 + Options
     | Auto-detection:     Enabled
     | Auto-download:      Enabled

 + Eclipse Temurin JDK 25 (25.0.5.1+2-LTS)
     | Location:           /Users/nicolasruiz/.gradle/jdks/eclipse_adoptium-25-aarch64-os_x.2/jdk-25.0.5.1+2/Contents/Home
     | Language Version:   25
     | Vendor:             Eclipse Temurin
     | Architecture:       aarch64
     | Is JDK:             true
     | Detected by:        Auto-provisioned by Gradle
```

En esa máquina hay JDK 25, 26 y 27 instalados. El build usa el 25 porque el toolchain lo pide, aunque el `java` del `PATH` sea el 27. Esa separación entre “lo que ejecuta mi terminal” y “lo que usa el build” es la que hace reproducibles los pipelines. (La salida completa de `javaToolchains` lista también los JDK 26 y 27 detectados; aquí se reproduce el bloque del JDK que el build selecciona.)

Desde Java 11 ya no se distribuye un JRE separado. Si necesitas una imagen de runtime mínima para producción, se genera con `jlink` a partir del JDK, incluyendo solo los módulos que la aplicación usa. Para Tienda Aurora, el comando sería:

```bash
jlink --add-modules java.base --output build/runtime-aurora
```

No hace falta ejecutarlo ahora; basta con entender que “JRE” hoy es una imagen construida, no un instalador que se descarga.

El error típico de este tema es tener `JAVA_HOME` apuntando a un JDK y el `PATH` a otro. La señal es que `java -version` y `javac -version` discrepan, o que Gradle compila con una versión y la terminal ejecuta con otra. La corrección es alinear `JAVA_HOME`, `PATH` y el toolchain del build; no basta con reinstalar.

### Tema 3: public static void main — qué significa cada palabra · Básico · 40 min

`public static void main(String[] args)` se memoriza en el primer día y se entiende mucho después. Cada palabra existe por una razón concreta, y todas se ven en el punto de entrada real de Tienda Aurora:

```java
public static void main(String[] args) {
    Locale.setDefault(Locale.ROOT);
    if (args.length == 0) {
        imprimirAyuda();
        return;
    }

    String comando = args[0];
    switch (comando) {
        case "catalogo" -> imprimirCatalogo(construirCatalogo());
        case "cotizar" -> cotizar(args);
        case "interactivo" -> interactivo();
        case "diagnostico" -> new DiagnosticoTipos().ejecutar();
        default -> {
            System.err.println("Comando desconocido: " + comando);
            imprimirAyuda();
            System.exit(2);
        }
    }
}
```

`public` significa que la JVM puede invocarlo desde fuera de la clase. `static` significa que no necesita una instancia: la JVM llama al método antes de que exista ningún objeto. `void` significa que no devuelve valor al sistema operativo; para comunicar éxito o fallo se usa el código de salida (`System.exit`). `main` es el nombre que el lanzador busca por convención. `String[] args` es un arreglo con las palabras que escribiste después del nombre de la clase.

Prueba esa última parte:

```bash
java -cp out com.aurora.fundamentos.TiendaAuroraApp catalogo
```

Aquí `args` tiene un elemento: `"catalogo"`. `args[0]` selecciona el comando. Si el comando es `cotizar`, el arreglo completo es `["cotizar", "--sku", "CAF-0001", "--cantidad", "2"]`, y el método `valorDe` lo recorre buscando pares clave-valor. Esa es la forma más simple de parsear argumentos sin dependencias; en módulos posteriores se reemplaza por una librería, pero el modelo mental es el mismo.

Los códigos de salida importan en CI y en scripts. Un comando desconocido imprime la ayuda y termina con código 2:

```bash
java -cp out com.aurora.fundamentos.TiendaAuroraApp desconocido
echo $?
```

```text
Comando desconocido: desconocido
Tienda Aurora - fundamentos de Java

Uso:
  catalogo
  cotizar --sku CAF-0001 [--cantidad 2] [--fecha 2026-11-22T10:30]
  interactivo
  diagnostico

2
```

Si intentas ejecutar una clase que no declara `main`, el lanzador lo dice con precisión:

```bash
java -cp out com.aurora.fundamentos.dominio.Dinero
```

```text
Error: Main method not found in class com.aurora.fundamentos.dominio.Dinero, please define the main method as:
   public static void main(String[] args)
or a JavaFX application class must extend javafx.application.Application
```

El error más común es que el nombre del archivo no coincida con la clase pública, o que el método esté declarado como `public void main(...)` sin `static`. La JVM busca exactamente la firma `public static void main(String[])`; cualquier variación produce el mensaje anterior. Otro error frecuente es olvidar el paquete al ejecutar: `java TiendaAuroraApp` desde otra carpeta falla con `ClassNotFoundException` porque el nombre completo es `com.aurora.fundamentos.TiendaAuroraApp`.

### Tema 4: Tipos primitivos vs referencias · Básico · 50 min

Java tiene ocho tipos primitivos y todos los demás son referencias a objetos. La diferencia no es cosmética: los primitivos guardan el valor en la variable; las referencias guardan la dirección de un objeto en el heap. Esa distinción decide qué se copia al pasar un argumento, qué puede ser `null` y dónde aparecen los errores de precisión.

| Tipo | Tamaño | Rango o uso | En Tienda Aurora |
| --- | --- | --- | --- |
| `byte` | 8 bits | −128 a 127 | banderas compactas |
| `short` | 16 bits | −32 768 a 32 767 | poco usado |
| `int` | 32 bits | ±2 147 483 647 | stock, cantidades |
| `long` | 64 bits | ±9,22 × 10¹⁸ | centavos de dinero |
| `float` | 32 bits | decimal aproximado | nunca para dinero |
| `double` | 64 bits | decimal aproximado | medidas, no importes |
| `char` | 16 bits | un carácter Unicode | iniciales, separadores |
| `boolean` | JVM-dependiente | `true` / `false` | condiciones |

La decisión más importante del proyecto es representar el dinero con `long` de centavos. Un `double` no puede representar 34,90 exactamente: guarda la fracción binaria más cercana. Multiplicar esa aproximación por tres produce un valor que se ve como 104,70 al imprimir con dos decimales, pero que no es igual al `double` de 104,70. El método `DiagnosticoTipos.doubleFrenteADinero` lo demuestra con el precio real del molino:

```java
double precio = 34.90;
int unidades = 3;
double totalDouble = precio * unidades;
Dinero totalDinero = Dinero.de("34.90").por(unidades);

System.out.printf(Locale.ROOT, "  double : %.17f%n", totalDouble);
System.out.println("  Dinero : " + totalDinero + " (" + totalDinero.enCentavos() + " centavos)");
System.out.println("  totalDouble == 104.70 -> " + (totalDouble == 104.70));
System.out.println("  totalDinero.equals(Dinero.de(\"104.70\")) -> "
        + totalDinero.equals(Dinero.de("104.70")));
```

Al ejecutar `./gradlew -q run --args="diagnostico"`, la primera sección imprime:

```text
1. double frente a Dinero
  double : 104.69999999999999000
  Dinero : $104.70 (10470 centavos)
  totalDouble == 104.70 -> false
  totalDinero.equals(Dinero.de("104.70")) -> true
```

El total “correcto” en pantalla es una ilusión del formateo. La comparación demuestra que el valor binario no es 104,70. En un carrito con cientos de líneas, ese residuo se acumula y aparece como un céntimo de diferencia en la contabilidad. `Dinero` evita el problema porque nunca convierte a punto flotante: `Dinero.de("34.90")` produce `3490`, y `por(3)` produce `10470` con `Math.multiplyExact`.

Los primitivos también desbordan en silencio. Si acumulas un millón de unidades a 3490 centavos en un `int`, el resultado no cabe y se vuelve negativo:

```text
2. Desbordamiento de primitivos
  int  -> -804967296
  long -> 3490000000
  Dinero falla rápido -> long overflow
```

`int` tiene 32 bits y el producto 3 490 000 000 supera su máximo. Java no lanza una excepción: da la vuelta al signo. `long` sí lo contiene. Y `Dinero` usa `Math.multiplyExact`, que lanza `ArithmeticException` en lugar de devolver un número incorrecto. Esa es la diferencia entre un bug silencioso y un fallo inmediato y localizable.

Las conversiones siguen una regla simple. De un tipo más pequeño a uno más grande (`int` a `long`, `int` a `double`) hay widening y el compilador lo acepta sin ceremonia. Al revés hay narrowing y exige un cast explícito, porque puede perder información: `(int) 3.9` da `3`, no `4`. Para dinero, cualquier conversión a `float` o `double` es una señal de alarma.

Las referencias se comportan distinto. `Producto` es un objeto: la variable guarda una dirección. Asignar `Producto otro = producto` no copia el producto, copia la referencia; ambos nombres apuntan al mismo objeto y `otro.descontar(1)` cambia el stock que ves por `producto`. Los primitivos, en cambio, se copian por valor. Esa diferencia explica por qué `Catalogo` necesita copias defensivas en el tema de arreglos y por qué comparar objetos con `==` casi nunca es lo que quieres.

### Tema 5: Variables, conversiones y `String` · Básico · 45 min

Un SKU llega del usuario con espacios, mayúsculas mezcladas y guiones bajos. Si el catálogo compara cadenas sin normalizar, el mismo producto se comporta como dos. `Sku` resuelve el problema en un único punto:

```java
public static Sku de(String crudo) {
    Objects.requireNonNull(crudo, "sku");
    String limpio = crudo.strip()
            .toUpperCase(Locale.ROOT)
            .replace(" ", "")
            .replace("_", "-");
    if (!FORMATO.matcher(limpio).matches()) {
        throw new IllegalArgumentException("SKU inválido: '" + crudo + "' (formato AAA-0000)");
    }
    return new Sku(limpio);
}
```

`strip()` elimina espacios al inicio y al final, incluidos los Unicode que `trim()` no cubre. `toUpperCase(Locale.ROOT)` evita el bug clásico de turco: en ese locale, la “i” minúscula se convierte en “İ” con punto y el SKU deja de coincidir. `replace` encadena transformaciones porque cada una devuelve un `String` nuevo: los `String` son inmutables, no se modifican in situ.

La inmutabilidad tiene una consecuencia de rendimiento. `s = s + "x"` dentro de un bucle crea un objeto nuevo por vuelta y copia el contenido anterior. Para tres iteraciones da igual; para cincuenta mil líneas de recibo, no. `Recibo` usa `StringBuilder`, que mantiene un búfer mutable y crece cuando hace falta:

```java
StringBuilder texto = new StringBuilder(512);
texto.append(LINEA);
texto.append(" TIENDA AURORA - RECIBO ").append(pedido.numero()).append('\n');
```

La capacidad inicial de 512 es una estimación, no un límite: si el recibo crece, el búfer se amplía. `StringBuilder` no es thread-safe; para texto compartido entre hilos existe `StringBuffer`, pero en la práctica se prefiere construir el texto en un solo hilo y publicarlo ya inmutable con `toString()`.

Los textos largos de ayuda usan un text block, que evita concatenar saltos de línea:

```java
System.out.println("""
        Tienda Aurora - fundamentos de Java

        Uso:
          catalogo
          cotizar --sku CAF-0001 [--cantidad 2] [--fecha 2026-11-22T10:30]
          interactivo
          diagnostico
        """);
```

El text block conserva los saltos y elimina la indentación común. Es útil para mensajes de ayuda, SQL y JSON de prueba; no cambia la semántica de `String`.

La normalización se puede comprobar desde la terminal con una entrada deliberadamente sucia:

```bash
java -cp out com.aurora.fundamentos.TiendaAuroraApp cotizar --sku ' caf_0001 ' --cantidad 1 --fecha 2026-11-22T10:30
```

```text
==========================================
 TIENDA AURORA - RECIBO AUR-2026-0001
 Fecha: 22/11/2026 10:30
==========================================
 CAF-0001 Café Aurora        1 x   $12.50 =    $12.50
------------------------------------------
 Subtotal                         $12.50
 Descuento                         $0.00
```

El recibo muestra `CAF-0001`, no la entrada original. La normalización ocurrió una vez, en el constructor del objeto de valor, y el resto del sistema ya trabaja con la forma canónica.

El error más común con cadenas es comparar con `==`. `==` compara referencias, no contenido. El diagnóstico del proyecto lo hace explícito:

```text
3. == frente a equals en objetos
  a == b      -> false
  a.equals(b) -> true
  s1 == s2      -> false
  s1.equals(s2) -> true
```

Dos `String` con el mismo texto pueden ser objetos distintos. Por eso `Catalogo.buscar` usa `producto.sku().equals(sku)` y `Sku.equals` compara `valor`, nunca `==`. La única excepción legítima es comparar con literales internados, y aun así es una optimización que no debería formar parte de la lógica de negocio.

### Tema 6: Operadores, precedencia y control de flujo · Básico · 40 min

La política comercial de Tienda Aurora tiene dos umbrales: a partir de 50 € se aplica un 5 % de descuento y a partir de 100 € un 10 %. Escribir esa regla con `if` anidados es posible; expresarla con un `switch` sobre un enum deja claro que los tramos son exhaustivos:

```java
public Dinero descuento() {
    int porcentaje = switch (tramo(subtotal())) {
        case BASE -> 0;
        case PLATA -> 5;
        case ORO -> 10;
    };
    return subtotal().porcentaje(porcentaje);
}

private Tramo tramo(Dinero importe) {
    if (importe.compareTo(UMBRAL_ORO) >= 0) {
        return Tramo.ORO;
    }
    if (importe.compareTo(UMBRAL_PLATA) >= 0) {
        return Tramo.PLATA;
    }
    return Tramo.BASE;
}
```

El `switch` con flechas no tiene *fall-through*: cada rama termina sola y el compilador exige cubrir todos los casos o un `default`. En un `switch` clásico, olvidar un `break` hace que la ejecución continúe en la rama siguiente y aplique un descuento que no corresponde. La forma moderna elimina esa clase de error.

La precedencia importa en el cálculo del porcentaje:

```java
public Dinero porcentaje(int porcentaje) {
    long bruto = Math.multiplyExact(this.centavos, porcentaje);
    return new Dinero(Math.floorDiv(bruto + 50, 100));
}
```

Primero se multiplica por el porcentaje, luego se suma 50 y por último se divide entre 100. Ese `+50` implementa el redondeo *half-up* para valores positivos: 2555 centavos al 5 % dan 127,75, que debe redondear a 128. Sin el 50, la división entera truncaría a 127. El orden no es arbitrario: `(bruto + 50) / 100` produce un resultado distinto de `bruto + 50 / 100`, y el compilador no avisa porque ambas expresiones son válidas.

Los tres tramos se ven ejecutando la misma cotización con cantidades distintas:

```bash
./gradlew -q run --args="cotizar --sku TAZ-0002 --cantidad 2 --fecha 2026-11-22T10:30"
```

```text
 Subtotal                         $16.00
 Descuento                         $0.00
 Base imponible                   $16.00
 IVA 21%                           $3.36
 TOTAL                            $19.36
```

```bash
./gradlew -q run --args="cotizar --sku TAZ-0002 --cantidad 7 --fecha 2026-11-22T10:30"
```

```text
 Subtotal                         $56.00
 Descuento                        -$2.80
 Base imponible                   $53.20
 IVA 21%                          $11.17
 TOTAL                            $64.37
```

```bash
./gradlew -q run --args="cotizar --sku MOL-0003 --cantidad 3 --fecha 2026-11-22T10:30"
```

```text
 Subtotal                        $104.70
 Descuento                       -$10.47
 Base imponible                   $94.23
 IVA 21%                          $19.79
 TOTAL                          $114.02
```

Dieciséis euros no alcanzan el umbral; cincuenta y seis cruzan el 5 %; ciento cuatro con setenta cruzan el 10 %. El IVA se calcula sobre la base ya descontada, no sobre el subtotal, y eso se ve en la secuencia de líneas.

El cortocircuito también es una decisión de control de flujo. `Producto.hayStock` usa `&&`:

```java
public boolean hayStock(int cantidad) {
    return cantidad > 0 && stock >= cantidad;
}
```

Si `cantidad` es cero o negativa, la segunda comparación no se evalúa. Con `&` (bit a bit) sí se evaluaría, y en una condición con una llamada costosa o con efectos secundarios el comportamiento cambiaría. La regla práctica es usar `&&` y `||` para lógica booleana y reservar `&`/`|` para máscaras de bits.

Los bucles aparecen donde el número de iteraciones no se conoce de antemano. `CalendarioComercial` avanza día a día hasta completar los laborables pedidos:

```java
LocalDate fecha = desde;
int restantes = dias;
while (restantes > 0) {
    fecha = fecha.plusDays(1);
    if (esLaborable(fecha)) {
        restantes--;
    }
}
```

Un `for` con índice no serviría porque los fines de semana no cuentan. El `while` expresa la condición real: “sigue hasta que no queden días laborables”. Los errores típicos son el *off-by-one* (contar el día de inicio o el de llegada) y el bucle infinito (olvidar decrementar `restantes`); ambos se detectan con una prueba de borde, no leyendo el código.

### Tema 7: Arreglos, wrappers y paso de argumentos · Básico · 55 min

Un arreglo es un bloque contiguo de elementos del mismo tipo, con longitud fija. `Catalogo` lo usa porque el catálogo de esta primera versión no cambia de tamaño en caliente. El detalle importante no es el arreglo sino su frontera:

```java
public Catalogo(Producto[] productos) {
    Objects.requireNonNull(productos, "productos");
    this.productos = Arrays.copyOf(productos, productos.length);
}

public Producto[] productos() {
    return Arrays.copyOf(productos, productos.length);
}
```

El constructor copia y el accesor también. Sin la primera copia, quien construye el catálogo conserva una referencia al arreglo interno y puede reemplazar un producto por `null`; sin la segunda, cualquiera que lea `productos()` puede mutar el estado del servicio. La copia defensiva cuesta memoria y se acepta porque el catálogo es pequeño y la alternativa es un bug de concurrencia difícil de reproducir.

El diagnóstico lo comprueba con un arreglo de un solo producto:

```text
5. Copia defensiva de arreglos
  catálogo sigue con 1 producto(s)
  primer SKU -> CAF-0001
  arreglo original mutado -> true
```

El arreglo original quedó con `null`, pero el catálogo sigue apuntando a su propia copia. Esa es la diferencia entre compartir estado y compartir una instantánea.

Pasar un arreglo a un método pasa la referencia por valor: el método recibe una copia de la dirección, no una copia del arreglo. Si el método escribe `arr[0] = 99`, el cambio es visible desde fuera; si reasigna `arr = new int[]{...}`, el cambio no sale del método. La misma regla aplica a los objetos: `Producto` se pasa por referencia, y `descontar` modifica el stock del objeto original.

Los wrappers (`Integer`, `Long`, `Boolean`, etc.) permiten usar primitivos donde se espera un objeto: en colecciones genéricas, en `Optional` o como valores anulables. El boxing convierte automáticamente entre `int` e `Integer`. Esa comodidad tiene dos trampas. La primera es `null`: un `Integer` sin valor lanza `NullPointerException` al unboxing. La segunda es la caché de valores pequeños:

```text
4. Caché de Integer y comparación de wrappers
  127 == 127 -> true
  128 == 128 -> false
  Objects.equals(128, 128) -> true
```

La JVM cachea los `Integer` de −128 a 127. Por eso dos `127` autoboxeados son el mismo objeto y `==` devuelve `true`; dos `128` son objetos distintos y devuelve `false`. El resultado no es una regla del lenguaje que convenga memorizar, sino una optimización de implementación. La conclusión práctica es simple: para wrappers, usar `equals` o `Objects.equals`, nunca `==`.

Para arreglos, la comparación correcta es `Arrays.equals`, que compara contenido elemento por elemento. `==` compara la referencia y da `false` aunque los elementos coincidan. Para copiar, `Arrays.copyOf`; para ordenar, `Arrays.sort`; para convertir a texto legible, `Arrays.toString`. Son utilidades de `java.util.Arrays`, no métodos del arreglo.

El error más común de este tema es mutar un arreglo compartido y descubrirlo tres capas más arriba. La señal es un dato que cambia “solo” después de llamar a un método que en teoría no debía tocarlo. La corrección es definir en la frontera si el arreglo se comparte o se copia, y documentarlo. En Tienda Aurora, la frontera es explícita: `Catalogo` copia en ambos sentidos.

### Tema 8: Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`) · Básico · 55 min

El comando `interactivo` atiende a un cliente por teclado. Lee un SKU, valida que exista, lee una cantidad y repite hasta que el cliente escribe `fin`. La entrada nunca es confiable, así que el bucle de lectura no avanza hasta obtener un entero positivo:

```java
private static int leerEntero(Scanner scanner, String mensaje) {
    while (true) {
        System.out.print(mensaje);
        String linea = scanner.nextLine().strip();
        try {
            int valor = Integer.parseInt(linea);
            if (valor <= 0) {
                System.out.println("  Debe ser mayor que cero");
                continue;
            }
            return valor;
        } catch (NumberFormatException e) {
            System.out.println("  '" + linea + "' no es un entero válido");
        }
    }
}
```

Una sesión real, alimentada por tubería para que sea reproducible, muestra las validaciones en acción:

```bash
printf 'caf-0001\n3\nxxx\n2\nfil-0004\n0\n2\nfin\n' \
  | java -cp out com.aurora.fundamentos.TiendaAuroraApp interactivo
```

```text
SKU (fin para terminar): Cantidad:   Agregado: Café Aurora x3
SKU (fin para terminar):   SKU inválido: 'xxx' (formato AAA-0000)
SKU (fin para terminar):   SKU inválido: '2' (formato AAA-0000)
SKU (fin para terminar): Cantidad:   Debe ser mayor que cero
Cantidad:   Agregado: Filtros x100 x2
SKU (fin para terminar): ==========================================
 TIENDA AURORA - RECIBO AUR-2026-0001
 Fecha: 23/11/2026 03:35
==========================================
 CAF-0001 Café Aurora        3 x   $12.50 =    $37.50
 FIL-0004 Filtros x100       2 x    $4.75 =     $9.50
------------------------------------------
 Subtotal                         $47.00
 Descuento                         $0.00
 Base imponible                   $47.00
 IVA 21%                           $9.87
 TOTAL                            $56.87
------------------------------------------
 Entrega estimada: 26/11/2026
==========================================
```

La fecha del recibo sale del reloj de la máquina porque el modo interactivo no recibe `--fecha`. Para las pruebas se usa la variante con fecha fija, que sí es determinista.

`java.time` separa tres conceptos que `Date` mezclaba: `LocalDate` es una fecha sin hora ni zona; `LocalDateTime` es fecha y hora locales; `Instant` es un punto absoluto en UTC. Tienda Aurora guarda la hora local de la tienda en `Pedido` y expone el instante UTC para integraciones:

```java
public long timestampUtc() {
    return creadoEn.toInstant(ZoneOffset.UTC).toEpochMilli();
}
```

La entrega se calcula con `CalendarioComercial`. Para un pedido del viernes 20/11/2026, tres días laborables son miércoles 25/11/2026: el sábado y el domingo no cuentan. La salida real de una cotización con esa fecha lo confirma:

```text
 Entrega estimada: 25/11/2026
```

`LocalDate` es inmutable: `plusDays` devuelve una fecha nueva y la original no cambia. Esa propiedad es la que permite pasar fechas entre métodos sin miedo a que alguien las modifique por el camino.

Las APIs heredadas tienen problemas difíciles de justificar hoy. `Calendar.JANUARY` vale 0, no 1; `Date.getMonth()` también es base cero. `Date` es mutable: cualquier método que reciba una fecha puede cambiarla. `SimpleDateFormat` no es thread-safe y compartirlo entre hilos produce fechas corruptas. El diagnóstico lo resume:

```text
6. Date y Calendar heredados
  Calendar.JANUARY -> 0
  Date mutable -> 86400000
  Date.getMonth() (0 = enero) -> 0
```

No es que `Date` esté roto: es que su modelo (un instante con meses base cero y mutabilidad) no coincide con el modelo mental de una fecha comercial. `java.time` lo reemplaza con tipos explícitos y seguros.

El error más común es usar `LocalDateTime` para representar un instante global. Un `LocalDateTime` no sabe de zona horaria: las 10:30 en Madrid y las 10:30 en Ciudad de México son el mismo valor para el tipo, pero no para el negocio. Si el dato viaja entre sistemas, usa `Instant` o `OffsetDateTime`. Si es una fecha de calendario local (una entrega, un feriado), usa `LocalDate`. Y formatea siempre con un `Locale` explícito: `DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ROOT)` evita que el formato cambie según la configuración de la máquina.

### Tema 9: Java 25 para programas pequeños: `IO`, archivos compactos e `import module` · Básico · 35 min

No todo programa Java es una aplicación de varios módulos. Un script de inventario, una migración puntual o una utilidad de línea de comandos no debería exigir una clase pública, un `package` y cinco imports. Java 25 incorpora tres piezas que reducen esa ceremonia: archivos compactos, métodos `main` de instancia y `java.io.IO`.

`scripts/Inventario.java` es un archivo completo y ejecutable:

```java
import module java.base;

void main(String[] args) {
    var productos = List.of(
            new Producto("CAF-0001", "Café Aurora", 1250, 40),
            new Producto("TAZ-0002", "Taza Aurora", 800, 25),
            new Producto("MOL-0003", "Molino manual", 3490, 10));

    long valorCentavos = 0;
    for (Producto producto : productos) {
        valorCentavos += producto.centavos() * producto.stock();
    }

    IO.println("Productos en inventario: " + productos.size());
    for (Producto producto : productos) {
        IO.println("  " + producto.sku() + " " + producto.nombre()
                + " -> " + producto.stock() + " unidades");
    }
    IO.println("Valor total: "
            + (valorCentavos / 100) + "." + String.format("%02d", valorCentavos % 100));
}

record Producto(String sku, String nombre, long centavos, int stock) {
}
```

No hay `public class Inventario`, no hay `public static void main`. El lanzador reconoce un archivo compacto y crea implícitamente la clase. `void main(String[] args)` es un método de instancia: la JVM crea la instancia y lo invoca. `import module java.base` importa de una vez todos los tipos públicos exportados por `java.base`, que incluye `List`, `String`, `System` y la propia clase `IO`. `IO.println` evita el `System.out.println` para el caso de scripts.

Se ejecuta directamente, sin compilar a un directorio:

```bash
java scripts/Inventario.java
```

```text
Productos en inventario: 3
  CAF-0001 Café Aurora -> 40 unidades
  TAZ-0002 Taza Aurora -> 25 unidades
  MOL-0003 Molino manual -> 10 unidades
Valor total: 1049.00
```

El cálculo usa centavos otra vez: 1250 × 40 + 800 × 25 + 3490 × 10 = 104 900 centavos, es decir, 1049,00 €. El resultado es exacto porque no hay `double` en la cadena.

El archivo también se puede compilar:

```bash
javac scripts/Inventario.java
java -cp scripts Inventario
```

`javac` genera `Inventario.class` y `Inventario$Producto.class`. La clase implícita es `final` y su `main` es de instancia, como muestra `javap`:

```text
Compiled from "Inventario.java"
final class Inventario {
  Inventario();
  void main(java.lang.String[]);
}
```

Esta forma es ideal para utilidades pequeñas y para enseñar, pero no reemplaza la estructura de una aplicación. Un proyecto con pruebas, dependencias y varios paquetes sigue necesitando `src/main/java`, un build y clases explícitas. La regla práctica: si el archivo cabe en una pantalla y no se va a importar desde otro código, un archivo compacto es razonable; si va a crecer, empieza con la estructura normal.

El error más común es ejecutar un archivo compacto con un JDK anterior a 25. La característica no existe y el lanzador no reconoce el archivo como código Java. La corrección es verificar `java -version` y, si el entorno es antiguo, convertir el archivo a la forma clásica con `public class` y `public static void main`. Otra confusión frecuente es creer que `import module` importa dependencias de Maven: solo importa módulos del propio JDK.

## Verificación real

Re-verificado el 2026-11-23 en `/tmp/opencode/aurora-m0` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q classes
./gradlew -q test
./gradlew -q run --args="catalogo"
./gradlew -q run --args="cotizar --sku CAF-0001 --cantidad 3 --fecha 2026-11-22T10:30"
./gradlew -q run --args="diagnostico"
```

Resultados observados (resumen):

- `classes` y `test`: compilación y suite sin fallas.
- `catalogo`: lista 4 productos con SKU, nombre, precio y stock.
- `cotizar`: genera recibo `AUR-2026-0001`, total `$45.38`, entrega `25/11/2026`, `timestampUtc=1795343400000`.
- `diagnostico`: confirma diferencias `double` vs `Dinero`, desbordamiento `int`/`long`/`Math.multiplyExact`, `==` vs `equals`, caché `Integer`, copia defensiva de arreglos y comportamiento heredado de `Date/Calendar`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `javac`/`java` no encontrados | JDK no instalado o PATH mal | `java -version` falla | Instalar JDK y configurar PATH/JAVA_HOME |
| `class X is public, should be declared in a file named X.java` | Nombre archivo/clase no coincide | Error de compilación | Renombrar archivo o clase |
| `NoSuchMethodError: main` | Firma/ubicación de `main` incorrecta | Ejecutar con `java` falla | Usar `public static void main(String[] args)` |
| Error de encoding/caracteres raros | Encoding distinto | Salida ilegible | Compilar/guardar en UTF-8 |
| Dependencias no resuelven | Build mal configurado | Gradle falla al resolver | Revisar `build.gradle.kts`, repos, wrapper |

## Cierre

Tienda Aurora ya tiene una aplicación real que compila, se ejecuta y produce recibos correctos. El recorrido no fue una lista de características del lenguaje: cada tema resolvió un problema del mismo producto. El dinero se volvió un `long` de centavos porque `double` no cuadra. El SKU se volvió un objeto de valor porque la entrada del usuario es sucia. El catálogo copia sus arreglos porque compartir estado interno termina en bugs. El carrito expresa los tramos con un `switch` exhaustivo porque las reglas comerciales cambian y el compilador debe avisar si falta un caso. Las fechas usan `java.time` porque `Date` mezcla instantes, zonas y meses base cero.

Los hábitos que quedan son más valiosos que la sintaxis. Compilar a mano al menos una vez para saber qué genera el IDE. Verificar `java` y `javac` antes de culpar al código. Elegir el tipo por lo que representa, no por lo que ocupa. Comparar contenido con `equals` y referencias solo cuando la identidad sea el objetivo. Formatear con un `Locale` explícito. Y ejecutar lo que se escribe: una salida que no se vio correr es una hipótesis, no un resultado.

El siguiente módulo convierte estas piezas sueltas en un modelo orientado a objetos. `Producto` dejará de ser un contenedor de datos y ganará comportamiento; aparecerán interfaces, clases abstractas, `record` y constructores flexibles. La aplicación de consola seguirá siendo el mismo proyecto, ahora con un diseño que soporta cambios sin reescribir todo.

## Checklist

- Compilé el proyecto con `javac` y localicé los `.class` generados.
- Inspeccioné bytecode con `javap` y reconocí instrucciones básicas.
- Verifiqué que `java` y `javac` pertenecen al mismo JDK.
- Entiendo qué significa cada palabra de `public static void main`.
- Representé dinero con `long` de centavos y evité `double`.
- Detecté desbordamiento de `int` y usé `Math.*Exact` para fallar rápido.
- Normalicé cadenas de entrada con `strip`, `toUpperCase(Locale.ROOT)` y validación.
- Usé `StringBuilder` para construir texto en bucles.
- Comparé cadenas y objetos con `equals`, no con `==`.
- Expresé reglas de negocio con `switch` exhaustivo y cortocircuito con `&&`.
- Copié arreglos en las fronteras del catálogo.
- Leí entrada con `Scanner` validando el caso inválido.
- Calculé fechas con `java.time` y días laborables.
- Ejecuté un archivo compacto con `java Archivo.java` en JDK 25+.
