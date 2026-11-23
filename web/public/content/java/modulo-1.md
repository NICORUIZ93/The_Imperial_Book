# Módulo 1: Programación orientada a objetos

La aplicación de Tienda Aurora del módulo anterior funciona, pero su diseño es procedural. Un producto es un contenedor de datos y toda la lógica vive en métodos que preguntan de qué tipo es cada cosa. Mientras solo hay productos físicos, el `if` es manejable. Cuando la tienda empieza a vender cursos digitales, tarjetas regalo y suscripciones, cada nueva variante obliga a tocar el catálogo, el carrito, el recibo y la factura. Ese es el síntoma clásico de un modelo que no representa el dominio: el código sabe demasiado y cambia en todos lados a la vez.

La programación orientada a objetos no es “usar clases”. Es distribuir responsabilidades para que cada pieza proteja sus invariantes y el sistema pueda crecer agregando tipos, no reescribiendo condicionales. En este módulo construimos `tienda-aurora-poo`, una evolución del proyecto anterior donde `Producto` encapsula su estado, `ProductoFisico` y `ServicioDigital` especializan el comportamiento, `Descuento` y `MedioPago` representan dos formas distintas de variación, y `Direccion`, `LineaPedido` y `ResultadoPrecio` se modelan como `record`.

El proyecto tiene cinco comandos reales: `catalogo` lista productos con su tipo y costo de envío, `reglas` muestra las reglas de descuento y los medios de pago, `diagnostico` comprueba invariantes y la semántica de los records, `cotizar` calcula un pedido completo y `comparar` enfrenta los medios de pago para el mismo pedido. Cada tema añade o explica una pieza de ese mismo código.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2 (`javac 27.0.1.0.2`), Gradle 9.9.1, macOS arm64. El proyecto se compiló con `--release 25` y se ejecutó; las salidas son transcripciones reales. La comprobación de constructores flexibles se hizo además con `--release 21`, que rechaza el código, y con `--release 25`, que lo acepta.

## Proyecto desde cero: tienda-aurora-poo

El punto de partida es una decisión de diseño: ¿qué varía y por qué? En Tienda Aurora varían los productos (físicos, digitales, y mañana suscripciones) y varían las reglas comerciales (descuentos, medios de pago). Son dos ejes distintos y conviene modelarlos con herramientas distintas.

- `Producto` es una clase con estado encapsulado y comportamiento común. Las subclases añaden datos y sobrescriben lo que cambia: la descripción y el costo de envío.
- `Descuento` es una interfaz: un contrato sin estado que distintas reglas implementan. El carrito no necesita saber si el descuento es un porcentaje, un importe fijo o ninguno.
- `MedioPago` es una clase abstracta: comparte el nombre y el algoritmo `total = base + recargo`, y deja a cada subclase decidir el recargo.
- `Direccion`, `LineaPedido` y `ResultadoPrecio` son `record`: valores inmutables con igualdad por contenido, sin getters, `equals`, `hashCode` ni `toString` escritos a mano.
- Los constructores de `ProductoFisico` y `ServicioDigital` usan constructores flexibles de Java 25 para normalizar y validar antes de llamar a `super(...)`.

El resultado es un motor de cotización pequeño pero realista: subtotal, descuento, envío, recargo del pago y total, con cada regla aislada en su tipo.

## Prerrequisitos

Necesitas un JDK 25 o superior (por los constructores flexibles) y Gradle 9.

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
tienda-aurora-poo/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/
            └── com/aurora/poo/
                ├── TiendaAuroraPooApp.java
                ├── catalogo/
                │   ├── Catalogo.java
                │   ├── ReglasDescuento.java
                │   ├── ReglasPago.java
                │   └── Sku.java
                ├── descuento/
                │   ├── Descuento.java
                │   ├── DescuentoFijo.java
                │   ├── DescuentoPorcentual.java
                │   └── SinDescuento.java
                ├── dominio/
                │   ├── Dinero.java
                │   ├── Direccion.java
                │   ├── LineaPedido.java
                │   ├── Producto.java
                │   ├── ProductoFisico.java
                │   ├── ResultadoPrecio.java
                │   └── ServicioDigital.java
                ├── pago/
                │   ├── ContraReembolso.java
                │   ├── Efectivo.java
                │   ├── MedioPago.java
                │   ├── TarjetaCredito.java
                │   └── Transferencia.java
                └── servicio/
                    ├── CalculadoraPrecio.java
                    └── Pedido.java
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
    mainClass = "com.aurora.poo.TiendaAuroraPooApp"
}

repositories {
    mavenCentral()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

El toolchain fija Java 25. Ese detalle no es decorativo en este módulo: los constructores flexibles son una característica de Java 25 y el build debe compilar con esa versión aunque la terminal ejecute un JDK más nuevo. `-Xlint:all -Werror` obliga a resolver advertencias como métodos que sobrescriben sin `@Override` o accesos que reducen visibilidad.

## settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-poo"
```

## Código completo

**Archivo:** `src/main/java/com/aurora/poo/dominio/Dinero.java`

```java
package com.aurora.poo.dominio;

import java.math.BigDecimal;
import java.util.Locale;

/**
 * Importe monetario inmutable en centavos.
 *
 * Es la misma pieza que Tienda Aurora usa desde el módulo 0: nunca pasa por
 * double, de modo que los totales cuadran al céntimo.
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

**Archivo:** `src/main/java/com/aurora/poo/catalogo/Sku.java`

```java
package com.aurora.poo.catalogo;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Código de producto: tres letras, guion y cuatro dígitos.
 * Normaliza la entrada antes de validar.
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

**Archivo:** `src/main/java/com/aurora/poo/dominio/Producto.java`

```java
package com.aurora.poo.dominio;

import com.aurora.poo.catalogo.Sku;
import com.aurora.poo.descuento.Descuento;

import java.util.Locale;
import java.util.Objects;

/**
 * Producto vendible de Tienda Aurora.
 *
 * Encapsula su estado: el SKU, el nombre y el precio base solo se leen; las
 * subclases añaden datos propios sin exponer los campos internos.
 */
public class Producto {

    private final Sku sku;
    private final String nombre;
    private final Dinero precioBase;

    public Producto(Sku sku, String nombre, Dinero precioBase) {
        this.sku = Objects.requireNonNull(sku, "sku");
        this.nombre = normalizarNombre(nombre);
        this.precioBase = Objects.requireNonNull(precioBase, "precioBase");
        if (precioBase.compareTo(Dinero.CERO) <= 0) {
            throw new IllegalArgumentException("el precio base debe ser positivo");
        }
    }

    /** Reutilizable por las subclases antes de llamar a super(...). */
    protected static String normalizarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("el nombre es obligatorio");
        }
        return nombre.strip();
    }

    public Sku sku() {
        return sku;
    }

    public String nombre() {
        return nombre;
    }

    public Dinero precioBase() {
        return precioBase;
    }

    /** Cada subclase declara su naturaleza; el base es un producto genérico. */
    public String tipo() {
        return "genérico";
    }

    public String descripcion() {
        return nombre + " (" + tipo() + ")";
    }

    /** Un producto genérico no genera envío; las subclases deciden. */
    public Dinero costoEnvio() {
        return Dinero.CERO;
    }

    public Dinero precioCon(int cantidad) {
        return precioBase.por(cantidad);
    }

    /** Sobrecarga: la misma operación con una regla de descuento opcional. */
    public Dinero precioCon(int cantidad, Descuento descuento) {
        return descuento.aplicar(precioCon(cantidad));
    }

    @Override
    public String toString() {
        return String.format(Locale.ROOT, "%s %-18s %8s", sku, nombre, precioBase);
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/dominio/ProductoFisico.java`

```java
package com.aurora.poo.dominio;

import com.aurora.poo.catalogo.Sku;

/**
 * Producto que se envía: añade peso y calcula el costo de envío.
 *
 * El constructor demuestra las constructoras flexibles de Java 25: normaliza
 * y valida antes de llamar a super(...), algo que antes era imposible.
 */
public final class ProductoFisico extends Producto {

    private final int pesoGramos;

    public ProductoFisico(String skuCrudo, String nombreCrudo, String precioCrudo, int pesoGramos) {
        var sku = Sku.de(skuCrudo);
        var nombre = normalizarNombre(nombreCrudo);
        var precio = Dinero.de(precioCrudo);
        if (pesoGramos <= 0) {
            throw new IllegalArgumentException("el peso debe ser mayor que cero");
        }
        super(sku, nombre, precio);
        this.pesoGramos = pesoGramos;
    }

    public int pesoGramos() {
        return pesoGramos;
    }

    @Override
    public String tipo() {
        return "físico";
    }

    @Override
    public String descripcion() {
        return super.descripcion() + ", " + pesoGramos + " g";
    }

    @Override
    public Dinero costoEnvio() {
        if (pesoGramos <= 500) {
            return Dinero.de("4.95");
        }
        if (pesoGramos <= 2000) {
            return Dinero.de("7.95");
        }
        return Dinero.de("12.95");
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/dominio/ServicioDigital.java`

```java
package com.aurora.poo.dominio;

import com.aurora.poo.catalogo.Sku;

/**
 * Servicio con licencia temporal: no se envía y no cobra envío.
 */
public final class ServicioDigital extends Producto {

    private final int diasLicencia;

    public ServicioDigital(String skuCrudo, String nombreCrudo, String precioCrudo, int diasLicencia) {
        var sku = Sku.de(skuCrudo);
        var nombre = normalizarNombre(nombreCrudo);
        var precio = Dinero.de(precioCrudo);
        if (diasLicencia <= 0) {
            throw new IllegalArgumentException("la licencia debe durar al menos un día");
        }
        super(sku, nombre, precio);
        this.diasLicencia = diasLicencia;
    }

    public int diasLicencia() {
        return diasLicencia;
    }

    @Override
    public String tipo() {
        return "digital";
    }

    @Override
    public String descripcion() {
        return super.descripcion() + ", licencia de " + diasLicencia + " días";
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/dominio/Direccion.java`

```java
package com.aurora.poo.dominio;

/**
 * Dirección de entrega inmutable.
 *
 * El constructor compacto normaliza los componentes y valida el código postal
 * antes de que el record exista, de modo que un valor inválido nunca se
 * construye.
 */
public record Direccion(String calle, String ciudad, String codigoPostal) {

    public Direccion {
        calle = calle == null ? "" : calle.strip();
        ciudad = ciudad == null ? "" : ciudad.strip();
        codigoPostal = codigoPostal == null ? "" : codigoPostal.strip();
        if (calle.isBlank() || ciudad.isBlank()) {
            throw new IllegalArgumentException("la dirección necesita calle y ciudad");
        }
        if (!codigoPostal.matches("\\d{4,5}")) {
            throw new IllegalArgumentException("código postal inválido: " + codigoPostal);
        }
    }

    public String formateada() {
        return calle + ", " + ciudad + " " + codigoPostal;
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/dominio/LineaPedido.java`

```java
package com.aurora.poo.dominio;

/**
 * Línea de un pedido. El subtotal y el envío se derivan del producto; no se
 * almacenan para que no puedan quedar desincronizados.
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
        return producto.precioCon(cantidad);
    }

    public Dinero envio() {
        return producto.costoEnvio();
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/dominio/ResultadoPrecio.java`

```java
package com.aurora.poo.dominio;

import java.util.Objects;

/**
 * Resultado completo de una cotización. Al ser un record, es inmutable y sus
 * componentes se leen con accesores generados: subtotal(), descuento(), etc.
 */
public record ResultadoPrecio(
        Dinero subtotal,
        Dinero descuento,
        Dinero envio,
        Dinero recargoPago,
        Dinero total) {

    public ResultadoPrecio {
        Objects.requireNonNull(subtotal, "subtotal");
        Objects.requireNonNull(descuento, "descuento");
        Objects.requireNonNull(envio, "envio");
        Objects.requireNonNull(recargoPago, "recargoPago");
        Objects.requireNonNull(total, "total");
    }

    public Dinero baseConDescuento() {
        return subtotal.menos(descuento);
    }

    public Dinero baseConEnvio() {
        return baseConDescuento().mas(envio);
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/descuento/Descuento.java`

```java
package com.aurora.poo.descuento;

import com.aurora.poo.dominio.Dinero;

/**
 * Regla de descuento: un contrato sin estado compartido.
 *
 * Cada implementación decide cómo transformar el importe. El carrito no
 * necesita saber si el descuento es porcentual, fijo o nulo.
 */
public interface Descuento {

    /** Devuelve el importe final después de aplicar la regla. */
    Dinero aplicar(Dinero base);

    /** Texto legible para el recibo. */
    String etiqueta();
}
```

**Archivo:** `src/main/java/com/aurora/poo/descuento/DescuentoPorcentual.java`

```java
package com.aurora.poo.descuento;

import com.aurora.poo.dominio.Dinero;

import java.util.Objects;

/**
 * Descuento de un porcentaje sobre el importe base.
 */
public final class DescuentoPorcentual implements Descuento {

    private final String nombre;
    private final int porcentaje;

    public DescuentoPorcentual(String nombre, int porcentaje) {
        if (porcentaje < 0 || porcentaje > 100) {
            throw new IllegalArgumentException("porcentaje fuera de rango: " + porcentaje);
        }
        this.nombre = Objects.requireNonNull(nombre, "nombre").strip();
        this.porcentaje = porcentaje;
    }

    public int porcentaje() {
        return porcentaje;
    }

    @Override
    public Dinero aplicar(Dinero base) {
        return base.menos(base.porcentaje(porcentaje));
    }

    @Override
    public String etiqueta() {
        return nombre + " (-" + porcentaje + "%)";
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/descuento/DescuentoFijo.java`

```java
package com.aurora.poo.descuento;

import com.aurora.poo.dominio.Dinero;

import java.util.Objects;

/**
 * Descuento de un importe fijo. Nunca deja el precio por debajo de cero.
 */
public final class DescuentoFijo implements Descuento {

    private final String nombre;
    private final Dinero monto;

    public DescuentoFijo(String nombre, Dinero monto) {
        Objects.requireNonNull(monto, "monto");
        if (monto.compareTo(Dinero.CERO) <= 0) {
            throw new IllegalArgumentException("el descuento debe ser positivo");
        }
        this.nombre = Objects.requireNonNull(nombre, "nombre").strip();
        this.monto = monto;
    }

    public Dinero monto() {
        return monto;
    }

    @Override
    public Dinero aplicar(Dinero base) {
        Dinero resultado = base.menos(monto);
        return resultado.compareTo(Dinero.CERO) < 0 ? Dinero.CERO : resultado;
    }

    @Override
    public String etiqueta() {
        return nombre + " (-" + monto + ")";
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/descuento/SinDescuento.java`

```java
package com.aurora.poo.descuento;

import com.aurora.poo.dominio.Dinero;

/**
 * Implementación nula del contrato: no cambia el importe.
 *
 * Existe para que el carrito nunca tenga que comprobar si hay descuento con
 * un if; siempre hay un objeto Descuento con el que trabajar.
 */
public final class SinDescuento implements Descuento {

    public static final SinDescuento INSTANCIA = new SinDescuento();

    private SinDescuento() {
    }

    @Override
    public Dinero aplicar(Dinero base) {
        return base;
    }

    @Override
    public String etiqueta() {
        return "Sin descuento";
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/pago/MedioPago.java`

```java
package com.aurora.poo.pago;

import com.aurora.poo.dominio.Dinero;

import java.util.Objects;

/**
 * Forma de pago. Es una clase abstracta, no una interfaz, porque comparte
 * estado (el nombre) y un algoritmo fijo (total = base + recargo).
 */
public abstract class MedioPago {

    private final String nombre;

    protected MedioPago(String nombre) {
        this.nombre = Objects.requireNonNull(nombre, "nombre").strip();
    }

    public final String nombre() {
        return nombre;
    }

    /** Cada medio decide su recargo. */
    public abstract Dinero recargo(Dinero base);

    /** Plantilla común: el recargo siempre se suma igual. */
    public final Dinero total(Dinero base) {
        return base.mas(recargo(base));
    }

    @Override
    public String toString() {
        return nombre;
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/pago/Efectivo.java`

```java
package com.aurora.poo.pago;

import com.aurora.poo.dominio.Dinero;

/**
 * Pago en efectivo en tienda: sin recargo.
 */
public final class Efectivo extends MedioPago {

    public Efectivo() {
        super("Efectivo");
    }

    @Override
    public Dinero recargo(Dinero base) {
        return Dinero.CERO;
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/pago/Transferencia.java`

```java
package com.aurora.poo.pago;

import com.aurora.poo.dominio.Dinero;

/**
 * Transferencia bancaria: sin recargo.
 */
public final class Transferencia extends MedioPago {

    public Transferencia() {
        super("Transferencia");
    }

    @Override
    public Dinero recargo(Dinero base) {
        return Dinero.CERO;
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/pago/TarjetaCredito.java`

```java
package com.aurora.poo.pago;

import com.aurora.poo.dominio.Dinero;

/**
 * Tarjeta de crédito: recargo del 2 % por comisión de la pasarela.
 */
public final class TarjetaCredito extends MedioPago {

    public TarjetaCredito() {
        super("Tarjeta");
    }

    @Override
    public Dinero recargo(Dinero base) {
        return base.porcentaje(2);
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/pago/ContraReembolso.java`

```java
package com.aurora.poo.pago;

import com.aurora.poo.dominio.Dinero;

/**
 * Contra reembolso: 3 % más un cargo fijo de gestión.
 */
public final class ContraReembolso extends MedioPago {

    public ContraReembolso() {
        super("Contra reembolso");
    }

    @Override
    public Dinero recargo(Dinero base) {
        return base.porcentaje(3).mas(Dinero.de("1.50"));
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/catalogo/Catalogo.java`

```java
package com.aurora.poo.catalogo;

import com.aurora.poo.dominio.Producto;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

/**
 * Catálogo de productos respaldado por un arreglo con copia defensiva.
 */
public final class Catalogo {

    private final Producto[] productos;

    public Catalogo(Producto... productos) {
        Objects.requireNonNull(productos, "productos");
        this.productos = Arrays.copyOf(productos, productos.length);
    }

    public Producto[] productos() {
        return Arrays.copyOf(productos, productos.length);
    }

    public int tamano() {
        return productos.length;
    }

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

**Archivo:** `src/main/java/com/aurora/poo/catalogo/ReglasDescuento.java`

```java
package com.aurora.poo.catalogo;

import com.aurora.poo.descuento.Descuento;
import com.aurora.poo.descuento.DescuentoFijo;
import com.aurora.poo.descuento.DescuentoPorcentual;
import com.aurora.poo.descuento.SinDescuento;
import com.aurora.poo.dominio.Dinero;

/**
 * Registro de reglas de descuento disponibles en la tienda.
 *
 * El arreglo permite recorrerlas sin conocer sus clases concretas: todas son
 * Descuento y responden a aplicar/etiqueta.
 */
public final class ReglasDescuento {

    private final String[] codigos;
    private final Descuento[] reglas;

    public ReglasDescuento() {
        this.codigos = new String[] {"NINGUNO", "BIENVENIDA", "CAFE5"};
        this.reglas = new Descuento[] {
                SinDescuento.INSTANCIA,
                new DescuentoPorcentual("Bienvenida", 10),
                new DescuentoFijo("Café de bienvenida", Dinero.de("5.00"))
        };
    }

    public Descuento buscar(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return SinDescuento.INSTANCIA;
        }
        for (int i = 0; i < codigos.length; i++) {
            if (codigos[i].equalsIgnoreCase(codigo.strip())) {
                return reglas[i];
            }
        }
        throw new IllegalArgumentException("descuento desconocido: " + codigo);
    }

    public String[] codigos() {
        return codigos.clone();
    }

    public Descuento[] reglas() {
        return reglas.clone();
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/catalogo/ReglasPago.java`

```java
package com.aurora.poo.catalogo;

import com.aurora.poo.pago.ContraReembolso;
import com.aurora.poo.pago.Efectivo;
import com.aurora.poo.pago.MedioPago;
import com.aurora.poo.pago.TarjetaCredito;
import com.aurora.poo.pago.Transferencia;

/**
 * Registro de medios de pago. Todos comparten la clase abstracta MedioPago,
 * así que el código de la tienda los trata de forma uniforme.
 */
public final class ReglasPago {

    private final String[] codigos;
    private final MedioPago[] medios;

    public ReglasPago() {
        this.codigos = new String[] {"EFECTIVO", "TRANSFERENCIA", "TARJETA", "CONTRA"};
        this.medios = new MedioPago[] {
                new Efectivo(),
                new Transferencia(),
                new TarjetaCredito(),
                new ContraReembolso()
        };
    }

    public MedioPago buscar(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return new Transferencia();
        }
        for (int i = 0; i < codigos.length; i++) {
            if (codigos[i].equalsIgnoreCase(codigo.strip())) {
                return medios[i];
            }
        }
        throw new IllegalArgumentException("medio de pago desconocido: " + codigo);
    }

    public String[] codigos() {
        return codigos.clone();
    }

    public MedioPago[] medios() {
        return medios.clone();
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/servicio/CalculadoraPrecio.java`

```java
package com.aurora.poo.servicio;

import com.aurora.poo.descuento.Descuento;
import com.aurora.poo.descuento.SinDescuento;
import com.aurora.poo.dominio.Dinero;
import com.aurora.poo.dominio.LineaPedido;
import com.aurora.poo.dominio.ResultadoPrecio;
import com.aurora.poo.pago.MedioPago;
import com.aurora.poo.pago.Transferencia;

import java.util.List;

/**
 * Calcula el precio final de un pedido aplicando, en orden:
 * subtotal, descuento, envío y recargo del medio de pago.
 */
public final class CalculadoraPrecio {

    public ResultadoPrecio calcular(List<LineaPedido> lineas) {
        return calcular(lineas, SinDescuento.INSTANCIA, new Transferencia());
    }

    public ResultadoPrecio calcular(List<LineaPedido> lineas, Descuento descuento) {
        return calcular(lineas, descuento, new Transferencia());
    }

    public ResultadoPrecio calcular(List<LineaPedido> lineas, Descuento descuento, MedioPago medioPago) {
        if (lineas == null || lineas.isEmpty()) {
            throw new IllegalArgumentException("el pedido no tiene líneas");
        }
        if (descuento == null) {
            throw new IllegalArgumentException("descuento obligatorio");
        }
        if (medioPago == null) {
            throw new IllegalArgumentException("medio de pago obligatorio");
        }

        Dinero subtotal = sumarSubtotales(lineas);
        Dinero conDescuento = descuento.aplicar(subtotal);
        Dinero descuentoAplicado = subtotal.menos(conDescuento);
        Dinero envio = mayorEnvio(lineas);
        Dinero base = conDescuento.mas(envio);
        Dinero recargo = medioPago.recargo(base);

        return new ResultadoPrecio(subtotal, descuentoAplicado, envio, recargo, base.mas(recargo));
    }

    /**
     * Visible solo dentro del paquete servicio: es un detalle de cálculo, no
     * parte de la API pública de la calculadora.
     */
    static Dinero sumarSubtotales(List<LineaPedido> lineas) {
        Dinero total = Dinero.CERO;
        for (LineaPedido linea : lineas) {
            total = total.mas(linea.subtotal());
        }
        return total;
    }

    private Dinero mayorEnvio(List<LineaPedido> lineas) {
        Dinero mayor = Dinero.CERO;
        for (LineaPedido linea : lineas) {
            Dinero envio = linea.envio();
            if (envio.compareTo(mayor) > 0) {
                mayor = envio;
            }
        }
        return mayor;
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/servicio/Pedido.java`

```java
package com.aurora.poo.servicio;

import com.aurora.poo.dominio.Dinero;
import com.aurora.poo.dominio.Direccion;
import com.aurora.poo.dominio.LineaPedido;

import java.util.List;
import java.util.Objects;

/**
 * Pedido de Tienda Aurora: número, dirección y líneas.
 *
 * Usa el método package-private de CalculadoraPrecio para sumar subtotales:
 * ambos viven en el mismo paquete y comparten ese detalle.
 */
public final class Pedido {

    private final String numero;
    private final Direccion direccion;
    private final List<LineaPedido> lineas;

    public Pedido(String numero, Direccion direccion, List<LineaPedido> lineas) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("el número de pedido es obligatorio");
        }
        if (lineas == null || lineas.isEmpty()) {
            throw new IllegalArgumentException("el pedido no tiene líneas");
        }
        this.numero = numero.strip();
        this.direccion = Objects.requireNonNull(direccion, "direccion");
        this.lineas = List.copyOf(lineas);
    }

    public String numero() {
        return numero;
    }

    public Direccion direccion() {
        return direccion;
    }

    public List<LineaPedido> lineas() {
        return lineas;
    }

    public int unidades() {
        int total = 0;
        for (LineaPedido linea : lineas) {
            total += linea.cantidad();
        }
        return total;
    }

    public Dinero subtotal() {
        return CalculadoraPrecio.sumarSubtotales(lineas);
    }
}
```

**Archivo:** `src/main/java/com/aurora/poo/TiendaAuroraPooApp.java`

```java
package com.aurora.poo;

import com.aurora.poo.catalogo.Catalogo;
import com.aurora.poo.catalogo.ReglasDescuento;
import com.aurora.poo.catalogo.ReglasPago;
import com.aurora.poo.catalogo.Sku;
import com.aurora.poo.descuento.Descuento;
import com.aurora.poo.dominio.Dinero;
import com.aurora.poo.dominio.Direccion;
import com.aurora.poo.dominio.LineaPedido;
import com.aurora.poo.dominio.Producto;
import com.aurora.poo.dominio.ProductoFisico;
import com.aurora.poo.dominio.ResultadoPrecio;
import com.aurora.poo.dominio.ServicioDigital;
import com.aurora.poo.pago.MedioPago;
import com.aurora.poo.servicio.CalculadoraPrecio;
import com.aurora.poo.servicio.Pedido;

import java.util.List;
import java.util.Locale;

/**
 * Aplicación de consola de Tienda Aurora para el módulo de POO.
 */
public final class TiendaAuroraPooApp {

    private static final Direccion DIRECCION_TIENDA =
            new Direccion("Calle Mayor 12", "Madrid", "28013");

    public static void main(String[] args) {
        Locale.setDefault(Locale.ROOT);
        if (args.length == 0) {
            ayuda();
            return;
        }
        switch (args[0]) {
            case "catalogo" -> catalogo();
            case "reglas" -> reglas();
            case "diagnostico" -> diagnostico();
            case "cotizar" -> cotizar(args);
            case "comparar" -> comparar(args);
            default -> {
                System.err.println("Comando desconocido: " + args[0]);
                ayuda();
                System.exit(2);
            }
        }
    }

    private static void ayuda() {
        System.out.println("""
                Tienda Aurora - programación orientada a objetos

                Uso:
                  catalogo
                  reglas
                  diagnostico
                  cotizar --sku CAF-0001 [--cantidad 3] [--descuento BIENVENIDA] [--pago TARJETA]
                  comparar --sku CAF-0001 [--cantidad 3] [--descuento BIENVENIDA]
                """);
    }

    private static void catalogo() {
        Catalogo catalogo = catalogoTienda();
        System.out.println("Catálogo Tienda Aurora (" + catalogo.tamano() + " productos)");
        for (Producto producto : catalogo.productos()) {
            System.out.printf(Locale.ROOT, "  %-52s %8s  envío %s%n",
                    producto.descripcion(), producto.precioBase(), producto.costoEnvio());
        }
    }

    private static void reglas() {
        ReglasDescuento descuentos = new ReglasDescuento();
        System.out.println("Descuentos:");
        String[] codigosDescuento = descuentos.codigos();
        Descuento[] reglas = descuentos.reglas();
        for (int i = 0; i < codigosDescuento.length; i++) {
            System.out.printf(Locale.ROOT, "  %-12s %s%n", codigosDescuento[i], reglas[i].etiqueta());
        }

        System.out.println();
        System.out.println("Medios de pago (recargo sobre $100.00):");
        ReglasPago pagos = new ReglasPago();
        String[] codigosPago = pagos.codigos();
        MedioPago[] medios = pagos.medios();
        for (int i = 0; i < codigosPago.length; i++) {
            System.out.printf(Locale.ROOT, "  %-14s %-18s %8s%n",
                    codigosPago[i], medios[i].nombre(), medios[i].recargo(Dinero.de("100.00")));
        }
    }

    private static void diagnostico() {
        System.out.println("1. Invariantes de construcción");
        intentar("precio negativo", () -> new ProductoFisico("caf-0001", "Café", "-1.00", 100));
        intentar("peso cero", () -> new ProductoFisico("caf-0001", "Café", "10.00", 0));
        intentar("sku inválido", () -> new ProductoFisico("cafe", "Café", "10.00", 100));
        intentar("dirección sin ciudad", () -> new Direccion("Calle 1", " ", "28013"));
        intentar("línea con cantidad cero",
                () -> new LineaPedido(new ProductoFisico("caf-0001", "Café", "10.00", 100), 0));

        System.out.println();
        System.out.println("2. Records: normalización e igualdad");
        Direccion a = new Direccion("  Calle Mayor 12  ", " Madrid ", " 28013 ");
        Direccion b = new Direccion("Calle Mayor 12", "Madrid", "28013");
        System.out.println("  normalizada -> " + a.formateada());
        System.out.println("  equals -> " + a.equals(b));
        System.out.println("  hashCode igual -> " + (a.hashCode() == b.hashCode()));
    }

    private static void intentar(String caso, Runnable accion) {
        try {
            accion.run();
            System.out.println("  " + caso + " -> no falló");
        } catch (RuntimeException e) {
            System.out.println("  " + caso + " -> " + e.getClass().getSimpleName()
                    + ": " + e.getMessage());
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
        Descuento descuento = new ReglasDescuento().buscar(valorDe(args, "--descuento", "NINGUNO"));
        MedioPago medioPago = new ReglasPago().buscar(valorDe(args, "--pago", "TRANSFERENCIA"));

        Producto producto = catalogoTienda().buscar(Sku.de(skuCrudo))
                .orElseThrow(() -> new IllegalArgumentException("SKU no existe: " + skuCrudo));

        LineaPedido linea = new LineaPedido(producto, cantidad);
        Pedido pedido = new Pedido("AUR-2026-0001", DIRECCION_TIENDA, List.of(linea));
        ResultadoPrecio resultado = new CalculadoraPrecio().calcular(pedido.lineas(), descuento, medioPago);

        imprimirCotizacion(pedido, linea, resultado, descuento, medioPago);
    }

    private static void comparar(String[] args) {
        String skuCrudo = valorDe(args, "--sku");
        if (skuCrudo == null || skuCrudo.isBlank()) {
            System.err.println("Falta --sku");
            System.exit(2);
            return;
        }

        int cantidad = enteroPositivo(valorDe(args, "--cantidad", "1"));
        Descuento descuento = new ReglasDescuento().buscar(valorDe(args, "--descuento", "NINGUNO"));
        Producto producto = catalogoTienda().buscar(Sku.de(skuCrudo))
                .orElseThrow(() -> new IllegalArgumentException("SKU no existe: " + skuCrudo));

        LineaPedido linea = new LineaPedido(producto, cantidad);
        Pedido pedido = new Pedido("AUR-2026-0001", DIRECCION_TIENDA, List.of(linea));

        System.out.printf(Locale.ROOT, "Comparativa de pago para %d x %s (%s)%n",
                cantidad, producto.nombre(), descuento.etiqueta());
        for (MedioPago medio : new ReglasPago().medios()) {
            ResultadoPrecio resultado = new CalculadoraPrecio()
                    .calcular(pedido.lineas(), descuento, medio);
            System.out.printf(Locale.ROOT, "  %-18s %12s%n", medio.nombre(), resultado.total());
        }
    }

    private static void imprimirCotizacion(Pedido pedido, LineaPedido linea,
                                           ResultadoPrecio resultado,
                                           Descuento descuento, MedioPago medioPago) {
        StringBuilder texto = new StringBuilder(512);
        texto.append("==========================================\n");
        texto.append(" TIENDA AURORA - COTIZACION ").append(pedido.numero()).append('\n');
        texto.append("==========================================\n");
        texto.append(' ').append(linea.producto().descripcion()).append('\n');
        texto.append(String.format(Locale.ROOT, "   %d x %s = %s%n",
                linea.cantidad(), linea.producto().precioBase(), linea.subtotal()));
        texto.append(String.format(Locale.ROOT, "   envío: %s%n", linea.envio()));
        texto.append("------------------------------------------\n");
        alinear(texto, "Subtotal", resultado.subtotal(), "");
        alinear(texto, "Descuento", resultado.descuento().negado(), descuento.etiqueta());
        alinear(texto, "Envío", resultado.envio(), "");
        alinear(texto, "Recargo pago", resultado.recargoPago(), medioPago.nombre());
        alinear(texto, "TOTAL", resultado.total(), "");
        texto.append("==========================================\n");
        texto.append(" Entrega: ").append(pedido.direccion().formateada()).append('\n');
        System.out.print(texto);
    }

    private static void alinear(StringBuilder texto, String etiqueta, Dinero importe, String nota) {
        if (nota == null || nota.isBlank()) {
            texto.append(String.format(Locale.ROOT, " %-18s %12s%n", etiqueta, importe));
        } else {
            texto.append(String.format(Locale.ROOT, " %-18s %12s  %s%n", etiqueta, importe, nota));
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

    private static String valorDe(String[] args, String nombre, String porDefecto) {
        for (int i = 1; i < args.length - 1; i++) {
            if (args[i].equals(nombre)) {
                return args[i + 1];
            }
        }
        return porDefecto;
    }

    private static String valorDe(String[] args, String nombre) {
        return valorDe(args, nombre, null);
    }

    private static Catalogo catalogoTienda() {
        return new Catalogo(
                new ProductoFisico("caf-0001", "Café Aurora", "12.50", 340),
                new ProductoFisico("mol-0003", "Molino manual", "34.90", 1200),
                new ProductoFisico("taz-0002", "Taza Aurora", "8.00", 450),
                new ServicioDigital("cur-0100", "Curso de barismo", "49.00", 365)
        );
    }
}
```

## Ejecutar

Genera el wrapper una vez y ejecuta el catálogo:

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q run --args="catalogo"
```

```text
Catálogo Tienda Aurora (4 productos)
  Café Aurora (físico), 340 g                            $12.50  envío $4.95
  Molino manual (físico), 1200 g                         $34.90  envío $7.95
  Taza Aurora (físico), 450 g                             $8.00  envío $4.95
  Curso de barismo (digital), licencia de 365 días       $49.00  envío $0.00
```

Una cotización con descuento y pago con tarjeta:

```bash
./gradlew -q run --args="cotizar --sku CAF-0001 --cantidad 3 --descuento BIENVENIDA --pago TARJETA"
```

```text
==========================================
 TIENDA AURORA - COTIZACION AUR-2026-0001
==========================================
 Café Aurora (físico), 340 g
   3 x $12.50 = $37.50
   envío: $4.95
------------------------------------------
 Subtotal                 $37.50
 Descuento                -$3.75  Bienvenida (-10%)
 Envío                     $4.95
 Recargo pago              $0.77  Tarjeta
 TOTAL                    $39.47
==========================================
 Entrega: Calle Mayor 12, Madrid 28013
```

El resto de comandos se usa en los temas: `reglas` para ver las implementaciones de los dos contratos, `diagnostico` para comprobar invariantes y records, y `comparar` para ver el polimorfismo de los medios de pago en una sola tabla.

### Tema 1: Clases, objetos, constructores y encapsulación · Básico · 40 min

El primer diseño de un producto suele ser una clase con campos públicos:

```java
public class Producto {
    public String sku;
    public String nombre;
    public double precio;
}
```

Funciona hasta que alguien escribe `producto.precio = -10` o `producto.nombre = null`. En ese momento el objeto deja de representar un producto y pasa a representar un error que se propaga hasta la factura. La encapsulación no es “poner getters”: es impedir que el objeto exista en un estado inválido.

En Tienda Aurora, `Producto` protege sus tres datos y valida en el constructor:

```java
public class Producto {

    private final Sku sku;
    private final String nombre;
    private final Dinero precioBase;

    public Producto(Sku sku, String nombre, Dinero precioBase) {
        this.sku = Objects.requireNonNull(sku, "sku");
        this.nombre = normalizarNombre(nombre);
        this.precioBase = Objects.requireNonNull(precioBase, "precioBase");
        if (precioBase.compareTo(Dinero.CERO) <= 0) {
            throw new IllegalArgumentException("el precio base debe ser positivo");
        }
    }

    protected static String normalizarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("el nombre es obligatorio");
        }
        return nombre.strip();
    }

    public Sku sku() {
        return sku;
    }

    public String nombre() {
        return nombre;
    }

    public Dinero precioBase() {
        return precioBase;
    }
}
```

Los campos son `private final`: nadie de fuera los lee directamente y nadie los reasigna después de construir el objeto. Los accesores (`sku()`, `nombre()`, `precioBase()`) son la API de lectura. No hay setters porque el SKU, el nombre y el precio base no deberían cambiar en la vida de un producto; si cambian, se crea otro objeto. Esa inmutabilidad elimina una clase entera de errores: no hay forma de que un pedido vea un precio distinto del que se validó al agregarlo.

La diferencia entre clase y objeto es la misma que entre plano y edificio. La clase describe qué datos y comportamientos tendrá un producto; el objeto es cada producto concreto en memoria. `new Producto(...)` reserva espacio en el heap, ejecuta el constructor y devuelve una referencia. Dos productos con el mismo SKU son dos objetos distintos; si quieres compararlos por identidad de negocio, implementas `equals` y `hashCode`, como hace `Sku`.

El compilador confirma que la encapsulación es real. `javap -p` muestra las firmas privadas y públicas:

```bash
javap -p out/com/aurora/poo/dominio/Producto.class
```

```text
Compiled from "Producto.java"
public class com.aurora.poo.dominio.Producto {
  private final com.aurora.poo.catalogo.Sku sku;
  private final java.lang.String nombre;
  private final com.aurora.poo.dominio.Dinero precioBase;
  public com.aurora.poo.dominio.Producto(com.aurora.poo.catalogo.Sku, java.lang.String, com.aurora.poo.dominio.Dinero);
  protected static java.lang.String normalizarNombre(java.lang.String);
  public com.aurora.poo.catalogo.Sku sku();
  public java.lang.String nombre();
  public com.aurora.poo.dominio.Dinero precioBase();
  public java.lang.String tipo();
  public java.lang.String descripcion();
  public com.aurora.poo.dominio.Dinero costoEnvio();
  public com.aurora.poo.dominio.Dinero precioCon(int);
  public com.aurora.poo.dominio.Dinero precioCon(int, com.aurora.poo.descuento.Descuento);
  public java.lang.String toString();
}
```

Los tres campos aparecen como `private final`. No hay un `setPrecio` ni un `setSku`. Esa es la garantía que el resto del sistema puede asumir.

La validación no se queda en la teoría. El comando `diagnostico` intenta construir objetos inválidos y muestra el mensaje de dominio:

```bash
./gradlew -q run --args="diagnostico"
```

```text
1. Invariantes de construcción
  precio negativo -> IllegalArgumentException: el precio base debe ser positivo
  peso cero -> IllegalArgumentException: el peso debe ser mayor que cero
  sku inválido -> IllegalArgumentException: SKU inválido: 'cafe' (formato AAA-0000)
  dirección sin ciudad -> IllegalArgumentException: la dirección necesita calle y ciudad
  línea con cantidad cero -> IllegalArgumentException: la cantidad debe ser mayor que cero
```

Cada mensaje dice qué regla se rompió, no “error de validación”. Esa diferencia ahorra horas de depuración cuando el fallo llega desde una importación de datos o una API.

El error más común de este tema es crear el objeto validado y luego abrirlo con setters que no validan. La señal es un `Producto` con precio cero que llegó a la base de datos. La corrección es decidir qué campos son inmutables y no exponer mutadores para ellos; si un campo debe cambiar (el stock, por ejemplo), el mutador debe validar y el objeto debe asumir esa responsabilidad.

### Tema 2: Herencia y sobreescritura · Básico · 40 min

Cuando la tienda solo vendía café, el catálogo tenía un `tipo` y un `if` en cada método. Al añadir cursos digitales, el cálculo de envío necesitó otro `if`; al añadir suscripciones, otro más. La herencia reemplaza esa escalera de condicionales por polimorfismo: cada subclase sabe cómo comportarse y el código que la usa solo conoce el contrato de la base.

`ProductoFisico` extiende `Producto` y añade el peso:

```java
public final class ProductoFisico extends Producto {

    private final int pesoGramos;

    public ProductoFisico(String skuCrudo, String nombreCrudo, String precioCrudo, int pesoGramos) {
        var sku = Sku.de(skuCrudo);
        var nombre = normalizarNombre(nombreCrudo);
        var precio = Dinero.de(precioCrudo);
        if (pesoGramos <= 0) {
            throw new IllegalArgumentException("el peso debe ser mayor que cero");
        }
        super(sku, nombre, precio);
        this.pesoGramos = pesoGramos;
    }

    @Override
    public String tipo() {
        return "físico";
    }

    @Override
    public String descripcion() {
        return super.descripcion() + ", " + pesoGramos + " g";
    }

    @Override
    public Dinero costoEnvio() {
        if (pesoGramos <= 500) {
            return Dinero.de("4.95");
        }
        if (pesoGramos <= 2000) {
            return Dinero.de("7.95");
        }
        return Dinero.de("12.95");
    }
}
```

`ServicioDigital` también extiende `Producto`, pero no cobra envío:

```java
public final class ServicioDigital extends Producto {

    private final int diasLicencia;

    public ServicioDigital(String skuCrudo, String nombreCrudo, String precioCrudo, int diasLicencia) {
        var sku = Sku.de(skuCrudo);
        var nombre = normalizarNombre(nombreCrudo);
        var precio = Dinero.de(precioCrudo);
        if (diasLicencia <= 0) {
            throw new IllegalArgumentException("la licencia debe durar al menos un día");
        }
        super(sku, nombre, precio);
        this.diasLicencia = diasLicencia;
    }

    @Override
    public String tipo() {
        return "digital";
    }

    @Override
    public String descripcion() {
        return super.descripcion() + ", licencia de " + diasLicencia + " días";
    }
}
```

`ServicioDigital` no sobrescribe `costoEnvio()`: hereda la implementación de `Producto`, que devuelve `Dinero.CERO`. Esa es la primera ventaja de la herencia bien usada: el comportamiento por defecto vive en la base y solo se especializa lo que realmente cambia.

La anotación `@Override` no es obligatoria para que Java sobrescriba, pero sí para que el compilador verifique que estás sobrescribiendo algo. Si escribes `descripcion()` con un parámetro distinto por error, sin `@Override` crearías una sobrecarga silenciosa y el método original seguiría ejecutándose. Con `@Override`, el compilador falla y el bug no llega a producción.

El polimorfismo se ve en el catálogo, que trata todos los productos igual:

```text
Catálogo Tienda Aurora (4 productos)
  Café Aurora (físico), 340 g                            $12.50  envío $4.95
  Molino manual (físico), 1200 g                         $34.90  envío $7.95
  Taza Aurora (físico), 450 g                             $8.00  envío $4.95
  Curso de barismo (digital), licencia de 365 días       $49.00  envío $0.00
```

El bucle de `catalogo()` no tiene ningún `if`. Llama a `descripcion()` y `costoEnvio()` sobre una variable de tipo `Producto`; la JVM decide en tiempo de ejecución qué implementación corresponde. Si mañana se agrega `SuscripcionMensual`, el bucle no cambia.

La diferencia también aparece en una cotización digital:

```bash
./gradlew -q run --args="cotizar --sku CUR-0100 --cantidad 1 --pago TARJETA"
```

```text
==========================================
 TIENDA AURORA - COTIZACION AUR-2026-0001
==========================================
 Curso de barismo (digital), licencia de 365 días
   1 x $49.00 = $49.00
   envío: $0.00
------------------------------------------
 Subtotal                 $49.00
 Descuento                 $0.00  Sin descuento
 Envío                     $0.00
 Recargo pago              $0.98  Tarjeta
 TOTAL                    $49.98
==========================================
 Entrega: Calle Mayor 12, Madrid 28013
```

El envío es cero porque `Producto.costoEnvio()` devuelve cero y `ServicioDigital` no lo sobrescribe. No hay un `if (tipo == DIGITAL)` en la calculadora.

La herencia tiene reglas. Una subclase debe poder sustituir a su base sin romper el programa (principio de sustitución de Liskov): si `Producto` promete un precio positivo, `ProductoFisico` no puede aceptar uno negativo. Por eso los constructores validan antes de llamar a `super`. También conviene marcar las subclases como `final` si no están diseñadas para ser extendidas: `ProductoFisico` y `ServicioDigital` lo son, porque nadie debería especializar un producto físico concreto.

El error más común es usar herencia para reutilizar código que no representa una relación “es un”. `ProductoFisico` es un `Producto`; un `Descuento` no es un `Producto`. Cuando la relación es “usa” o “implementa un contrato”, la herramienta correcta es la composición o la interfaz, que es el siguiente tema.

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una · Intermedio · 45 min

En Tienda Aurora hay dos ejes de variación que se parecen pero no son iguales. Los descuentos son reglas sin estado: un porcentaje, un importe fijo, ninguno. Los medios de pago comparten estado (el nombre) y un algoritmo común (`total = base + recargo`). Modelar ambos con la misma herramienta sería forzar el diseño.

`Descuento` es una interfaz porque solo define un contrato:

```java
public interface Descuento {

    Dinero aplicar(Dinero base);

    String etiqueta();
}
```

No tiene campos, no tiene constructor, no tiene estado. Cualquier clase puede implementarlo sin heredar de nada más. `DescuentoPorcentual` y `DescuentoFijo` son implementaciones concretas:

```java
public final class DescuentoPorcentual implements Descuento {

    private final String nombre;
    private final int porcentaje;

    public DescuentoPorcentual(String nombre, int porcentaje) {
        if (porcentaje < 0 || porcentaje > 100) {
            throw new IllegalArgumentException("porcentaje fuera de rango: " + porcentaje);
        }
        this.nombre = Objects.requireNonNull(nombre, "nombre").strip();
        this.porcentaje = porcentaje;
    }

    @Override
    public Dinero aplicar(Dinero base) {
        return base.menos(base.porcentaje(porcentaje));
    }

    @Override
    public String etiqueta() {
        return nombre + " (-" + porcentaje + "%)";
    }
}
```

```java
public final class DescuentoFijo implements Descuento {

    private final String nombre;
    private final Dinero monto;

    public DescuentoFijo(String nombre, Dinero monto) {
        Objects.requireNonNull(monto, "monto");
        if (monto.compareTo(Dinero.CERO) <= 0) {
            throw new IllegalArgumentException("el descuento debe ser positivo");
        }
        this.nombre = Objects.requireNonNull(nombre, "nombre").strip();
        this.monto = monto;
    }

    @Override
    public Dinero aplicar(Dinero base) {
        Dinero resultado = base.menos(monto);
        return resultado.compareTo(Dinero.CERO) < 0 ? Dinero.CERO : resultado;
    }

    @Override
    public String etiqueta() {
        return nombre + " (-" + monto + ")";
    }
}
```

`SinDescuento` completa el conjunto con el patrón *null object*: en lugar de devolver `null` y obligar a cada llamador a comprobar si hay descuento, existe un objeto que no cambia el importe.

```java
public final class SinDescuento implements Descuento {

    public static final SinDescuento INSTANCIA = new SinDescuento();

    private SinDescuento() {
    }

    @Override
    public Dinero aplicar(Dinero base) {
        return base;
    }

    @Override
    public String etiqueta() {
        return "Sin descuento";
    }
}
```

`MedioPago` es una clase abstracta porque comparte estado y algoritmo:

```java
public abstract class MedioPago {

    private final String nombre;

    protected MedioPago(String nombre) {
        this.nombre = Objects.requireNonNull(nombre, "nombre").strip();
    }

    public final String nombre() {
        return nombre;
    }

    public abstract Dinero recargo(Dinero base);

    public final Dinero total(Dinero base) {
        return base.mas(recargo(base));
    }
}
```

Las subclases solo implementan `recargo`; el nombre y la suma final se heredan. `TarjetaCredito` cobra un 2 %, `ContraReembolso` un 3 % más un cargo fijo, y `Efectivo`/`Transferencia` no cobran:

```java
public final class TarjetaCredito extends MedioPago {

    public TarjetaCredito() {
        super("Tarjeta");
    }

    @Override
    public Dinero recargo(Dinero base) {
        return base.porcentaje(2);
    }
}
```

La regla de decisión es concreta. Usa una interfaz cuando quieras definir una capacidad que varias clases no relacionadas pueden implementar (`Comparable`, `Descuento`, `Runnable`). Usa una clase abstracta cuando varias clases comparten estado o un esqueleto de algoritmo y quieres evitar duplicarlo (`MedioPago`). Y puedes combinar: una clase abstracta puede implementar una interfaz y dejar métodos abstractos para las subclases.

El comando `reglas` muestra las dos familias juntas:

```bash
./gradlew -q run --args="reglas"
```

```text
Descuentos:
  NINGUNO      Sin descuento
  BIENVENIDA   Bienvenida (-10%)
  CAFE5        Café de bienvenida (-$5.00)

Medios de pago (recargo sobre $100.00):
  EFECTIVO       Efectivo              $0.00
  TRANSFERENCIA  Transferencia         $0.00
  TARJETA        Tarjeta               $2.00
  CONTRA         Contra reembolso      $4.50
```

El código que imprime esa tabla recorre un arreglo de `Descuento` y otro de `MedioPago`. No conoce las clases concretas; solo llama a `etiqueta()`, `nombre()` y `recargo()`.

El polimorfismo se vuelve evidente en `comparar`:

```bash
./gradlew -q run --args="comparar --sku CAF-0001 --cantidad 3 --descuento BIENVENIDA"
```

```text
Comparativa de pago para 3 x Café Aurora (Bienvenida (-10%))
  Efectivo                 $38.70
  Transferencia            $38.70
  Tarjeta                  $39.47
  Contra reembolso         $41.36
```

La misma base (`$38.70`) produce cuatro totales distintos porque cada `MedioPago` calcula su recargo. La calculadora no tiene un `switch` por medio de pago.

El error más común es crear una clase abstracta sin estado ni código compartido: si todos los métodos son abstractos, probablemente sea una interfaz. El error opuesto es crear una interfaz “gorda” con diez métodos que obligan a implementar cosas que no aplican. La señal es una implementación con métodos vacíos o que lanzan `UnsupportedOperationException`; la corrección es dividir el contrato.

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso · Intermedio · 40 min

Estas dos ideas se confunden porque ambas usan el mismo nombre de método. La diferencia está en dónde se resuelve la llamada y qué firma se compara.

La **sobrecarga** ocurre en la misma clase (o en una jerarquía) cuando hay varios métodos con el mismo nombre y distinta lista de parámetros. El compilador elige cuál llamar según los argumentos. En `Producto`:

```java
public Dinero precioCon(int cantidad) {
    return precioBase.por(cantidad);
}

public Dinero precioCon(int cantidad, Descuento descuento) {
    return descuento.aplicar(precioCon(cantidad));
}
```

Y en `CalculadoraPrecio` hay tres versiones de `calcular`:

```java
public ResultadoPrecio calcular(List<LineaPedido> lineas) {
    return calcular(lineas, SinDescuento.INSTANCIA, new Transferencia());
}

public ResultadoPrecio calcular(List<LineaPedido> lineas, Descuento descuento) {
    return calcular(lineas, descuento, new Transferencia());
}

public ResultadoPrecio calcular(List<LineaPedido> lineas, Descuento descuento, MedioPago medioPago) {
    // ...
}
```

Las tres delegan en la más completa. El llamador elige el nivel de detalle que necesita y no repite la lógica. `javap -p` muestra las dos firmas de `precioCon` en el mismo `.class`:

```text
  public com.aurora.poo.dominio.Dinero precioCon(int);
  public com.aurora.poo.dominio.Dinero precioCon(int, com.aurora.poo.descuento.Descuento);
```

La **sobreescritura** ocurre entre una clase base y una subclase, con la misma firma exacta. La llamada se resuelve en tiempo de ejecución según el objeto real. `ProductoFisico` sobrescribe `descripcion()` y `costoEnvio()`:

```text
Compiled from "ProductoFisico.java"
public final class com.aurora.poo.dominio.ProductoFisico extends com.aurora.poo.dominio.Producto {
  private final int pesoGramos;
  public com.aurora.poo.dominio.ProductoFisico(java.lang.String, java.lang.String, java.lang.String, int);
  public int pesoGramos();
  public java.lang.String tipo();
  public java.lang.String descripcion();
  public com.aurora.poo.dominio.Dinero costoEnvio();
}
```

`javap` no dice qué métodos son `@Override`, pero la lista coincide con la base salvo por los métodos nuevos (`pesoGramos`). Esa es la firma de una especialización correcta: mismos contratos, datos adicionales.

La diferencia práctica: si llamas a un método sobrecargado, el compilador decide con el tipo declarado del argumento; si llamas a uno sobrescrito, la JVM decide con el tipo real del objeto. Un error típico es creer que una sobrecarga “gana” por el tipo en tiempo de ejecución; no es así. Otra confusión es cambiar solo el tipo de retorno: eso no es sobrecarga ni sobreescritura, es un error de compilación.

Los **modificadores de acceso** controlan quién puede ver cada miembro. El proyecto usa los cuatro:

- `private`: los campos de `Producto`, `Sku`, `Dinero`. Solo la propia clase los ve.
- `protected`: `Producto.normalizarNombre` y el constructor de `MedioPago`. Lo ven la clase, sus subclases y el paquete.
- `package-private` (sin modificador): `CalculadoraPrecio.sumarSubtotales`. Lo ve solo el paquete `servicio`, donde vive `Pedido`.
- `public`: la API que usa la aplicación (`precioBase()`, `calcular()`, `buscar()`).

El caso package-private es deliberado. `Pedido` necesita sumar subtotales, pero ese cálculo no debería formar parte de la API pública de la calculadora. Si otro paquete intenta usarlo, el compilador lo rechaza:

```java
package com.aurora.poo.otro;

import com.aurora.poo.dominio.LineaPedido;
import com.aurora.poo.servicio.CalculadoraPrecio;
import java.util.List;

public final class PruebaAcceso {
    public static void main(String[] args) {
        System.out.println(CalculadoraPrecio.sumarSubtotales(List.<LineaPedido>of()));
    }
}
```

```text
src/main/java/com/aurora/poo/otro/PruebaAcceso.java:9: error: sumarSubtotales(List<LineaPedido>) is not public in CalculadoraPrecio; cannot be accessed from outside package
        System.out.println(CalculadoraPrecio.sumarSubtotales(List.<LineaPedido>of()));
                                            ^
1 error
```

Ese error es una frontera de diseño, no un obstáculo. Si el método fuera público, cualquier cliente podría usarlo y quedaría atado a él; al mantenerlo package-private, la calculadora puede cambiarlo sin romper a nadie.

`final` completa el control. `MedioPago.total` es `final` para que ninguna subclase altere la fórmula; `ProductoFisico` y `ServicioDigital` son `final` para que no se especialicen más. `final` en un método o clase es una promesa de estabilidad que el compilador hace cumplir.

El error más común es reducir la visibilidad al sobrescribir (por ejemplo, `protected` en la base y `private` en la subclase): el compilador lo rechaza porque rompe el contrato. El otro es exponer campos con getters que devuelven referencias mutables; en este proyecto, `Catalogo.productos()` devuelve una copia y `ReglasDescuento.codigos()` clona el arreglo por la misma razón.

### Tema 5: record — modelos inmutables sin boilerplate · Intermedio · 40 min

Antes de los records, una clase de valor exigía constructor, getters, `equals`, `hashCode` y `toString`. Treinta líneas para transportar tres datos, y una invitación constante a olvidar uno de los métodos. Un `record` declara los componentes y el compilador genera todo eso con una semántica correcta: igualdad por contenido y representación legible.

`Direccion` es un record con validación en el constructor compacto:

```java
public record Direccion(String calle, String ciudad, String codigoPostal) {

    public Direccion {
        calle = calle == null ? "" : calle.strip();
        ciudad = ciudad == null ? "" : ciudad.strip();
        codigoPostal = codigoPostal == null ? "" : codigoPostal.strip();
        if (calle.isBlank() || ciudad.isBlank()) {
            throw new IllegalArgumentException("la dirección necesita calle y ciudad");
        }
        if (!codigoPostal.matches("\\d{4,5}")) {
            throw new IllegalArgumentException("código postal inválido: " + codigoPostal);
        }
    }

    public String formateada() {
        return calle + ", " + ciudad + " " + codigoPostal;
    }
}
```

El constructor compacto no repite la lista de parámetros. Puede reasignar los parámetros antes de que el compilador los asigne a los campos; por eso `new Direccion("  Calle Mayor 12  ", ...)` guarda el valor normalizado. Los componentes son `private final` y solo se leen con `calle()`, `ciudad()` y `codigoPostal()`.

`LineaPedido` muestra que un record puede tener métodos derivados:

```java
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
        return producto.precioCon(cantidad);
    }

    public Dinero envio() {
        return producto.costoEnvio();
    }
}
```

`subtotal()` y `envio()` no son componentes: no participan en `equals` ni en `toString`, y no se guardan. Se calculan cada vez, de modo que no pueden quedar desincronizados con el producto o la cantidad.

`ResultadoPrecio` agrupa el resultado completo de una cotización:

```java
public record ResultadoPrecio(
        Dinero subtotal,
        Dinero descuento,
        Dinero envio,
        Dinero recargoPago,
        Dinero total) {

    public ResultadoPrecio {
        Objects.requireNonNull(subtotal, "subtotal");
        Objects.requireNonNull(descuento, "descuento");
        Objects.requireNonNull(envio, "envio");
        Objects.requireNonNull(recargoPago, "recargoPago");
        Objects.requireNonNull(total, "total");
    }

    public Dinero baseConDescuento() {
        return subtotal.menos(descuento);
    }

    public Dinero baseConEnvio() {
        return baseConDescuento().mas(envio);
    }
}
```

El compilador genera `subtotal()`, `descuento()`, etc., además de `equals`, `hashCode` y `toString`. `javap -p` lo confirma:

```text
Compiled from "Direccion.java"
public final class com.aurora.poo.dominio.Direccion extends java.lang.Record {
  private final java.lang.String calle;
  private final java.lang.String ciudad;
  private final java.lang.String codigoPostal;
  public com.aurora.poo.dominio.Direccion(java.lang.String, java.lang.String, java.lang.String);
  public java.lang.String formateada();
  public final java.lang.String toString();
  public final int hashCode();
  public final boolean equals(java.lang.Object);
  public java.lang.String calle();
  public java.lang.String ciudad();
  public java.lang.String codigoPostal();
}
```

La línea `extends java.lang.Record` y los métodos `final` no los escribiste tú: los generó el compilador. La igualdad por contenido se ve en el diagnóstico:

```text
2. Records: normalización e igualdad
  normalizada -> Calle Mayor 12, Madrid 28013
  equals -> true
  hashCode igual -> true
```

Dos direcciones creadas con espacios distintos son iguales porque el constructor compacto las normalizó. Sin esa normalización, `equals` compararía `"  Calle Mayor 12  "` con `"Calle Mayor 12"` y daría `false`.

Un record es inmutable en su capa superficial, no en profundidad. Si un componente es una lista mutable, el record guarda la referencia y la lista puede cambiar por fuera. Para valores realmente inmutables, el constructor compacto debe copiar los componentes mutables (`List.copyOf`, `Arrays.copyOf`) y el accesor debe devolver otra copia. En este proyecto, `Dinero` y `Producto` ya son inmutables en lo que importa, así que los records pueden compartirlos sin defensas adicionales.

Los records no sirven para todo. No pueden extender otra clase (sí implementar interfaces), no tienen setters y sus componentes son finales. Una entidad que cambia con el tiempo —un `Producto` cuyo stock baja con cada venta— no debería ser un record. Un objeto de valor que se reemplaza completo —una dirección, una línea, un resultado de precio— sí.

El error más común es usar un record para una entidad mutable y luego intentar “cambiar” un componente con un setter que no existe. La señal es un `record` con campos auxiliares mutables o con métodos que reconstruyen el objeto a mano. La corrección es elegir: si el valor cambia, usa una clase; si se reemplaza, usa un record y crea uno nuevo con el cambio.

### Tema 6: Constructores flexibles (Java 25): validar y preparar antes de super(...) · Avanzado · 45 min

Antes de Java 25, el constructor de una subclase tenía que empezar obligatoriamente con `super(...)` o `this(...)`. No podías normalizar un argumento, validarlo ni calcular nada antes de entregárselo a la clase base. Las soluciones eran incómodas: un método estático de fábrica, un constructor privado con parámetros ya normalizados o duplicar la validación en cada subclase.

`ProductoFisico` necesita tres cosas antes de llamar a `super`: convertir el SKU crudo en un `Sku` válido, normalizar el nombre y convertir el precio de texto a `Dinero`. Con Java 25 puede hacerlo en el propio constructor:

```java
public ProductoFisico(String skuCrudo, String nombreCrudo, String precioCrudo, int pesoGramos) {
    var sku = Sku.de(skuCrudo);
    var nombre = normalizarNombre(nombreCrudo);
    var precio = Dinero.de(precioCrudo);
    if (pesoGramos <= 0) {
        throw new IllegalArgumentException("el peso debe ser mayor que cero");
    }
    super(sku, nombre, precio);
    this.pesoGramos = pesoGramos;
}
```

Las sentencias antes de `super` son válidas siempre que no lean `this` ni asignen campos de la instancia. Se permiten variables locales, llamadas a métodos estáticos, validaciones y creación de objetos auxiliares. El compilador comprueba que `super` se llame exactamente una vez y que todos los campos queden asignados al final.

La ventaja no es cosmética. Si `skuCrudo` es inválido, el constructor falla con `SKU inválido: ...` antes de que la clase base reciba un `null` o un objeto a medio construir. El mensaje es de dominio y aparece en el punto donde se cometió el error, no tres capas después.

`ServicioDigital` usa la misma técnica:

```java
public ServicioDigital(String skuCrudo, String nombreCrudo, String precioCrudo, int diasLicencia) {
    var sku = Sku.de(skuCrudo);
    var nombre = normalizarNombre(nombreCrudo);
    var precio = Dinero.de(precioCrudo);
    if (diasLicencia <= 0) {
        throw new IllegalArgumentException("la licencia debe durar al menos un día");
    }
    super(sku, nombre, precio);
    this.diasLicencia = diasLicencia;
}
```

La característica es de Java 25 y el build lo hace explícito. Si compilas el mismo código con `--release 21`, el compilador lo rechaza:

```bash
javac --release 21 -encoding UTF-8 -d out21 $(find src/main/java -name '*.java')
```

```text
src/main/java/com/aurora/poo/dominio/ServicioDigital.java:19: error: flexible constructors is not supported in -source 21
        super(sku, nombre, precio);
             ^
  (use -source 25 or higher to enable flexible constructors)
src/main/java/com/aurora/poo/dominio/ProductoFisico.java:22: error: flexible constructors is not supported in -source 21
        super(sku, nombre, precio);
             ^
  (use -source 25 or higher to enable flexible constructors)
2 errors
```

Con `--release 25` o el toolchain del proyecto, compila sin advertencias. Esa diferencia es la prueba de que el código no está usando una característica antigua disfrazada: depende de una regla nueva del lenguaje.

Los constructores flexibles no eliminan todas las restricciones. Sigue estando prohibido leer `this` antes de `super`, porque el objeto base todavía no existe. Tampoco puedes asignar campos de la instancia antes de `super`; el compilador lo detecta como “variable might not have been initialized” o “cannot reference this before supertype constructor has been called”. La zona permitida es la de expresiones que solo dependen de los parámetros y de métodos estáticos.

La interacción con records es natural. Un constructor compacto ya permitía validar y normalizar; los constructores flexibles extienden esa comodidad a las clases con herencia. Juntos cubren los dos casos: valores inmutables con `record` y jerarquías con estado compartido y validación previa.

El error más común es usar un método de instancia (no estático) para preparar los argumentos antes de `super`. Ese método necesitaría `this`, y `this` todavía no es utilizable. La corrección es mover la lógica a un método `static` o a una clase auxiliar. El segundo error es olvidar que la validación debe cubrir también los parámetros que no se pasan a `super` (el peso, la licencia): si no se validan antes, el objeto puede construirse con datos incoherentes aunque la base sea válida.

## Cierre

Tienda Aurora pasó de un montón de datos y condicionales a un modelo donde cada tipo protege sus reglas. `Producto` encapsula y valida; `ProductoFisico` y `ServicioDigital` especializan sin duplicar; `Descuento` y `MedioPago` representan dos formas de variación con la herramienta adecuada; los records eliminan el boilerplate de los valores; y los constructores flexibles permiten que la validación ocurra antes de construir la base.

Las decisiones importantes no fueron de sintaxis sino de diseño. Cuándo usar herencia y cuándo composición. Cuándo una interfaz y cuándo una clase abstracta. Qué debe ser inmutable y qué puede cambiar. Dónde poner la frontera de acceso para que el resto del sistema no dependa de detalles internos. Esas decisiones son las que permiten agregar una suscripción mensual o un nuevo medio de pago sin tocar la calculadora.

El siguiente módulo entra en las colecciones y los genéricos. El catálogo dejará de ser un arreglo fijo y aparecerán `List`, `Set` y `Map`, junto con el contrato de `equals`/`hashCode` que este módulo ya empezó a usar en `Sku` y en los records.

## Checklist

- Encapsulé el estado de `Producto` con campos `private final` y validación en el constructor.
- Diferencié clase, objeto y referencia.
- Usé herencia solo cuando existe una relación “es un”.
- Sobrescribí métodos con `@Override` y llamé a `super` cuando hacía falta.
- Elegí interfaz para `Descuento` y clase abstracta para `MedioPago` con criterio.
- Implementé el patrón null object con `SinDescuento`.
- Distinguí sobrecarga (compilación) de sobreescritura (ejecución).
- Apliqué `private`, `protected`, package-private y `public` deliberadamente.
- Modelé valores con `record` y validé en el constructor compacto.
- Entendí la inmutabilidad superficial de un record.
- Escribí constructores flexibles de Java 25 que validan antes de `super(...)`.
- Comprobé el rechazo del código con `--release 21`.
