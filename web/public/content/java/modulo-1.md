# Módulo 1: Programación orientada a objetos


## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-1-poo.html"
    alt="Mapa de POO: clase base, herencia, records, interfaces y clases abstractas"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Objetos para dominio, interfaces para contratos, records para valores y validación antes de construir.</figcaption>
</figure>


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

Si vienes del módulo 0, el salto no es de sintaxis sino de organización. Antes tenías funciones y estructuras de datos; ahora decides qué objeto es dueño de cada dato, qué operaciones expone y qué invariantes protege. Cada término nuevo aparece en el momento en que hace falta: *clase* y *objeto* cuando definimos `Producto`, *interfaz* y *clase abstracta* cuando separamos descuentos y pagos, *record* cuando modelamos valores inmutables, y *constructor flexible* cuando Java 25 nos deja validar antes de `super(...)`. La idea es que puedas leer el código y entender por qué cada pieza está escrita así, no solo copiarla.

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

## Bootstrap

```bash
mkdir -p tienda-aurora-poo/src/main/java/com/aurora/poo/{dominio,catalogo,descuento,pago,servicio}
cd tienda-aurora-poo
gradle wrapper --gradle-version 9.9.1
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

Los archivos están agrupados por paquete y por responsabilidad. El paquete `dominio` contiene los valores y entidades que representan el negocio: dinero, SKU, productos, dirección, líneas y resultados. `descuento` y `pago` modelan las dos variaciones de precio como contratos separados. `catalogo` define los datos y las reglas de la tienda, `servicio` orquesta el cálculo del pedido, y `TiendaAuroraPooApp` es el punto de entrada de la aplicación de consola.

Puedes copiar los archivos tal cual, respetando la ruta de cada uno. El orden de lectura recomendado es el mismo en el que aparecen: primero los tipos base (`Dinero`, `Sku`), después la jerarquía de productos, luego los records, después los contratos de descuento y pago, y al final las reglas, servicios y la aplicación. Así cada archivo usa conceptos que ya viste en el anterior. Si prefieres escribirlo a mano, sigue ese orden y compila con `./gradlew classes` cuando tengas el dominio base para detectar errores temprano.

#### Dominio base: dinero y códigos

`Dinero` es un *value object*: un objeto que se identifica por su valor, no por una identidad propia. Dos importes de $12.50 son el mismo dinero aunque sean objetos distintos. Por eso es inmutable (`final`, sin setters) y tiene `equals`/`hashCode` por contenido. Internamente guarda centavos en un `long` para evitar los errores de redondeo de `double`; `BigDecimal` solo se usa en la fábrica `de(String)` para parsear texto con precisión. `Comparable<Dinero>` permite ordenar importes y compararlos con `compareTo`.

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

`Sku` es otro value object, pero con una regla de formato: tres letras, guion y cuatro dígitos (`AAA-0000`). La fábrica estática `de(String)` normaliza la entrada (recorta, pasa a mayúsculas, corrige espacios/guiones bajos) antes de validar con una expresión regular. Si el formato no coincide, lanza `IllegalArgumentException`. El constructor es privado para que nadie pueda crear un SKU sin pasar por la validación. Como `Dinero`, implementa `equals`/`hashCode` por valor para que pueda usarse como clave en mapas.

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

#### Jerarquía de productos

`Producto` es la clase base. Sus campos son `private final`: la encapsulación impide que el exterior o incluso una subclase los modifique directamente. Las subclases acceden por getters (`sku()`, `nombre()`, `precioBase()`) y pueden reutilizar `normalizarNombre`, que es `protected static` porque es una utilidad de construcción, no un comportamiento de instancia. El constructor valida el invariante completo antes de asignar; si algo falla, el objeto no llega a existir.

Los métodos `tipo()`, `descripcion()` y `costoEnvio()` son los puntos de extensión: una subclase los sobrescribe para especializar el comportamiento. `precioCon(int)` y `precioCon(int, Descuento)` son una sobrecarga: misma operación, distinta firma. Observa que `precioCon` con descuento delega en la versión simple y luego aplica el descuento; así no hay dos implementaciones del mismo cálculo.

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

`ProductoFisico` extiende `Producto` y añade un dato propio: `pesoGramos`. Su constructor es el ejemplo de constructor flexible de Java 25: antes de llamar a `super(...)` convierte el SKU de texto a `Sku`, normaliza el nombre y parsea el precio. Eso permite validar y preparar datos sin fábricas estáticas auxiliares. Sobrescribe `tipo()`, `descripcion()` y `costoEnvio()`; el costo de envío usa una regla simple por tramos de peso.

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

`ServicioDigital` es la otra rama de la jerarquía. No tiene peso ni envío físico; su dato propio es `diasLicencia`. También usa constructor flexible para normalizar antes de `super(...)`. Sobrescribe `costoEnvio()` devolviendo `Dinero.CERO`, lo que hace que el polimorfismo sea visible en el recibo: el mismo método produce resultados distintos según el tipo real del producto.

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

#### Records: valores inmutables

Los siguientes tipos no son entidades con identidad propia; son datos que se reemplazan completos. Por eso se modelan como `record`: el compilador genera constructor, accesores, `equals`, `hashCode` y `toString`.

`Direccion` normaliza sus tres componentes en un constructor compacto. Ese constructor se ejecuta antes de que el compilador asigne los campos, así que puede limpiar espacios y validar el formato del código postal.

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

`LineaPedido` combina un `Producto` y una cantidad. Es un record porque una línea no cambia: si cambia la cantidad, se crea otra línea. El método `subtotal()` es derivado; no se almacena, se calcula a partir de los componentes. `toString()` se sobrescribe para que el recibo sea legible.

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

`ResultadoPrecio` es el valor que devuelve la calculadora. Agrupa los importes del cálculo: subtotal, descuento aplicado, envío, recargo del medio de pago y total. Sus métodos `baseConDescuento()` y `baseConEnvio()` son cálculos derivados: no guardan estado extra, solo combinan componentes. Al ser un record, el objeto es una foto inmutable del resultado; si el cálculo cambia, se crea otro `ResultadoPrecio`.

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

#### Contratos de variación: descuentos y pagos

Aquí está la decisión de diseño central del módulo. Hay dos ejes que cambian: la regla de descuento y el medio de pago. Si metes ambos en `if/switch` dentro del pedido, cada regla nueva obliga a tocar el pedido. La alternativa es modelar cada eje como un tipo con comportamiento propio.

`Descuento` es una interfaz porque define solo un contrato: `aplicar(Dinero)` y `etiqueta()`. No tiene estado compartido ni algoritmo común. Cada implementación guarda lo que necesita (un porcentaje, un monto fijo, nada) y el llamador solo depende de la interfaz.

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

`DescuentoPorcentual` implementa el contrato con un porcentaje validado en el constructor. `aplicar` calcula el descuento sobre la base y lo resta; el resultado es un nuevo `Dinero` porque `Dinero` es inmutable. Guardar `nombre` y `porcentaje` como `private final` mantiene el objeto autocontenido.

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

`DescuentoFijo` tiene la misma forma pero distinta regla: resta un monto fijo y protege el caso borde donde el descuento supera la base, evitando totales negativos. Ese caso borde está en el código, no en un comentario.

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

`SinDescuento` implementa el patrón *null object*: en vez de devolver `null` y obligar a cada llamador a preguntar `if (descuento != null)`, hay un objeto real que representa “no aplicar descuento”. Su constructor es privado y expone una única instancia `INSTANCIA` porque no tiene estado; compartirla es seguro.

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

`MedioPago` es el otro eje, pero aquí sí hay estado compartido (`nombre`) y un algoritmo común (`total = base + recargo`). Por eso es una clase abstracta, no una interfaz. `total` es `final`: define el esqueleto y no permite que una subclase lo rompa. `recargo` es abstracto: cada medio define su regla. El constructor es `protected` porque solo las subclases concretas deben instanciar medios de pago.

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

Las cuatro implementaciones son pequeñas a propósito: cada una expresa solo lo que varía. `Efectivo` y `Transferencia` no cobran recargo; `TarjetaCredito` cobra 2%; `ContraReembolso` combina porcentaje más cargo fijo. El método `total` no se repite en ninguna de ellas porque está en la base.

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

#### Catálogo, reglas y servicios

`Catalogo` es el punto único donde se definen los productos disponibles. Devuelve una lista inmutable (`List.copyOf`) para que ningún llamador pueda agregar o quitar productos por accidente. También expone `buscarPorSku`, que lanza una excepción clara si el SKU no existe.

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

`ReglasDescuento` concentra la política de descuentos. `resolver` traduce un código de texto a una implementación de `Descuento`; si el código es `NINGUNO` devuelve `SinDescuento.INSTANCIA`. `todas()` expone las reglas disponibles para el comando `reglas`. El `switch` está aquí, en la capa de configuración, no disperso por el dominio.

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

`ReglasPago` hace lo mismo para medios de pago: convierte un nombre escrito en la línea de comandos (por ejemplo `TARJETA` o `EFECTIVO`) en un objeto `MedioPago`. Separar estas reglas del servicio de cálculo permite agregar un medio nuevo creando la clase y registrándola aquí, sin tocar la calculadora.

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

`CalculadoraPrecio` es el servicio que orquesta el cálculo. Recibe líneas, un `Descuento` y un `MedioPago`; no sabe qué implementación concreta llegó. Calcula subtotal, aplica descuento, suma envío, calcula recargo y arma el `ResultadoPrecio`. Las sobrecargas con menos parámetros delegan en la versión completa, usando `SinDescuento` y `Transferencia` como valores por defecto. `sumarSubtotales` es *package-private* (sin modificador de acceso): lo puede usar `Pedido` porque vive en el mismo paquete, pero no forma parte de la interfaz pública de la calculadora.

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
     * parte de la interfaz pública de la calculadora.
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

`Pedido` representa la operación de compra con identidad propia: número, dirección, líneas y medio de pago. A diferencia de los records, es una entidad mutable en un sentido controlado —se le pueden agregar líneas— y tiene identidad por `numero`. `agregar` valida y devuelve `this` para permitir encadenamiento. `total()` delega en la calculadora; el pedido no duplica la lógica de precio.

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

`TiendaAuroraPooApp` es la clase con el método `main`: el punto de entrada que ejecutas desde la terminal. No contiene reglas de negocio; lee los argumentos, resuelve objetos con las reglas del catálogo y delega en los servicios y el dominio. El `switch` sobre el comando solo selecciona el flujo. Los métodos privados como `imprimirCotizacion`, `diagnostico` y `comparar` formatean la salida para que los temas del módulo muestren comportamiento real sin meter lógica de negocio en `main`.

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

Conviene separar tres ideas que el lenguaje esconde bajo la misma palabra. Una clase es un tipo: declara qué estado y qué operaciones existen. Un objeto es una instancia concreta de ese tipo, con su propio estado en el heap. Una referencia es el valor que permite llegar a ese objeto; vive en una variable o en un campo y se copia al pasar de un método a otro. Cuando escribes `new Producto(...)`, la JVM reserva memoria para el objeto, ejecuta el constructor y devuelve la referencia. La variable no contiene el producto: contiene la dirección donde está. Por eso dos variables pueden apuntar al mismo objeto y por eso `==` entre objetos compara direcciones, no contenidos.

El constructor es el único punto de entrada legítimo a ese estado. Si el objeto nace válido y ningún método lo puede romper, el resto del sistema puede confiar en él sin repetir comprobaciones. Esa confianza es lo que se llama un invariante: una condición que se cumple desde que el objeto nace hasta que desaparece. En `Producto`, el invariante es que el SKU no es nulo, el nombre no está en blanco y el precio es estrictamente positivo. La comprobación se escribe una vez, en el constructor, y se asume en todos los demás métodos. Un `if (producto.precio() <= 0)` repartido por la aplicación es la señal de que el invariante no está donde debería.

`final` en los campos no es decorativo. Le dice al compilador que la asignación ocurre exactamente una vez, en el constructor, y le permite garantizar que ningún método de la clase puede cambiar la referencia después. En un objeto compartido entre hilos, un campo `final` correctamente construido además tiene garantías de visibilidad: cualquier hilo que vea la referencia ve los valores asignados en el constructor. Los campos mutables no tienen esa garantía y necesitan sincronización.

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

Hay una tercera distinción que suele morder al principio: identidad e igualdad no son lo mismo. `producto == otroProducto` pregunta si ambas referencias apuntan al mismo objeto. `producto.equals(otroProducto)` pregunta si representan el mismo valor. Para una entidad como un pedido, la identidad importa: dos pedidos con las mismas líneas siguen siendo pedidos distintos porque tienen número distinto. Para un objeto de valor como `Dinero`, la identidad no importa: dos instancias con 10470 centavos son el mismo importe. `Producto` cae en un terreno intermedio; en este módulo se compara por referencia porque no se guarda en colecciones, pero en el siguiente se convertirá en clave de mapa y necesitará una igualdad explícita.

`toString()` tampoco es un método de lógica. Su contrato dice que devuelve una representación legible, y por eso `Producto` lo usa para el catálogo y `Dinero` para el recibo. Nunca conviene parsear su salida ni comparar dos objetos a través de ella; para eso están `equals` y los accesores. Si un `toString` necesita formato estable, se le pasa un `Locale` explícito, como hace `Dinero` con `Locale.ROOT`.

Los métodos `static` pertenecen a la clase, no al objeto. `Producto.normalizarNombre` es `protected static` por dos razones: no necesita leer estado de la instancia y las subclases lo necesitan antes de llamar a `super(...)`. Un método `static` no puede usar `this` ni acceder a campos de instancia, y no participa del polimorfismo: si lo llamas a través de una referencia, el compilador decide con el tipo declarado, no con el objeto real. Esa diferencia se retoma en el tema de sobrecarga y sobreescritura.

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

Herencia significa que una clase declara ser un subtipo de otra y hereda sus miembros accesibles. `ProductoFisico` recibe de `Producto` el SKU, el nombre, el precio y los métodos que los leen; añade el peso y decide cómo se describe y cuánto cuesta enviarlo. `ServicioDigital` recibe lo mismo y añade la duración de la licencia. En ambos casos la relación es “es un”: un producto físico es un producto, un servicio digital es un producto. Si la frase no se sostiene —un descuento no es un producto— la herencia es la herramienta equivocada.

`super(...)` no es una llamada opcional ni un detalle de estilo: es la construcción de la parte base del objeto. La JVM no crea dos objetos, crea uno solo que contiene los campos de la base y los de la subclase. El orden de inicialización es fijo. Primero los campos toman su valor por defecto (cero, `false`, `null`). Después se ejecuta el constructor de la base, que asigna los campos heredados y valida sus invariantes. Luego se asignan los campos declarados en la subclase y se ejecuta el resto de su constructor. Por eso, cuando el constructor de la base termina, los campos propios de la subclase todavía valen cero: si la base llamara a un método sobrescrito desde su constructor, ese método vería el peso o la licencia sin inicializar. Es una de las razones por las que un constructor no debería invocar métodos que las subclases puedan sobrescribir.

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

Vale la pena entender cómo se elige el método en tiempo de ejecución, porque de ahí salen casi todas las sorpresas. Cada clase tiene una tabla de métodos virtuales; cuando la JVM ve `producto.descripcion()`, mira el tipo real del objeto, busca la entrada `descripcion` en su tabla y llama a la implementación de la clase más específica. El tipo declarado de la variable solo sirve para que el compilador valide que el método existe. Por eso una variable de tipo `Producto` puede ejecutar el código de `ProductoFisico` sin un cast. Y por eso los métodos `private`, `static` y `final` no son polimórficos: no entran en esa tabla, se resuelven en compilación.

Esa resolución dinámica es la que permite que el catálogo no sepa qué tipos existen. El bucle llama a `descripcion()` y `costoEnvio()` y obtiene la respuesta correcta para cada objeto. El acoplamiento va en una sola dirección: la subclase conoce la base, la base no conoce a sus subclases. Si mañana aparece `SuscripcionMensual`, se agrega una clase nueva y el bucle sigue igual; lo único que hay que revisar es si la nueva subclase respeta el contrato de la base.

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

La herencia tiene un costo que no aparece en los ejemplos pequeños: acopla la subclase a los detalles de la base. Si mañana `Producto` cambia el orden en que valida o agrega un campo obligatorio, todas las subclases se ven afectadas. Es lo que se conoce como clase base frágil. Por eso conviene mantener la base pequeña, documentar qué métodos están pensados para sobrescribirse y marcar `final` los que no. `ProductoFisico` y `ServicioDigital` son `final` porque no hay ninguna razón de negocio para especializarlos más; si alguien necesita otra variante, que cree otra clase.

También conviene distinguir herencia de composición. `Producto` no hereda de `Dinero`: contiene un `Dinero`. Esa composición es más flexible porque el precio se puede reemplazar sin arrastrar toda la jerarquía de `Dinero`, y evita el error clásico de “extender solo para reutilizar un método”. La regla práctica es preguntarse si la subclase puede sustituir a la base en cualquier lugar donde la base se use. Si la respuesta es no, la relación no es de herencia.

El error más común es usar herencia para reutilizar código que no representa una relación “es un”. `ProductoFisico` es un `Producto`; un `Descuento` no es un `Producto`. Cuando la relación es “usa” o “implementa un contrato”, la herramienta correcta es la composición o la interfaz, que es el siguiente tema.

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una · Intermedio · 45 min

En Tienda Aurora hay dos ejes de variación que se parecen pero no son iguales. Los descuentos son reglas sin estado: un porcentaje, un importe fijo, ninguno. Los medios de pago comparten estado (el nombre) y un algoritmo común (`total = base + recargo`). Modelar ambos con la misma herramienta sería forzar el diseño.

Una interfaz es un contrato de comportamiento. Declara métodos que un tipo promete implementar, pero no dice cómo. `Descuento` afirma que cualquier descuento sabe aplicarse a un importe y sabe etiquetarse; no afirma nada sobre su estado interno. Esa separación permite que `DescuentoPorcentual` guarde un porcentaje y `DescuentoFijo` guarde un importe sin que el carrito lo sepa. El carrito solo tiene una variable de tipo `Descuento` y llama a `aplicar`. El tipo de la variable es el contrato; el objeto real es la implementación.

Desde Java 8 una interfaz puede tener métodos `default` con implementación y métodos `static`; desde Java 9, métodos `private` para compartir código entre los `default`. Eso difumina un poco la frontera con las clases abstractas, pero no la elimina: una interfaz no tiene campos de instancia ni constructor, así que no puede guardar estado. Sus campos, si los hay, son constantes implícitas (`public static final`). Y una clase puede implementar varias interfaces, mientras que solo puede extender una clase. Esa es la razón por la que las capacidades transversales —`Comparable`, `Runnable`, `Descuento`— se modelan como interfaces.

Un contrato también tiene obligaciones no escritas. `Descuento.aplicar` no debería devolver un importe negativo, ni modificar el importe recibido, ni depender del orden en que se llame. Si una implementación lo hace, el carrito produce totales absurdos aunque el compilador no diga nada. Ese tipo de regla se documenta en el javadoc y se prueba; el compilador solo puede comprobar las firmas.

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

`MedioPago` es un ejemplo del patrón *template method*: `total` define el esqueleto del cálculo —sumar el recargo a la base— y deja un paso variable, `recargo`, en manos de la subclase. El método `total` es `final` para que nadie pueda romper el esqueleto; `recargo` es abstracto porque cada medio tiene su propia regla. El constructor es `protected` porque solo las subclases deben poder construir un medio de pago con nombre; no tiene sentido instanciar `MedioPago` directamente, y el compilador lo impide porque es abstracta.

Esa combinación de estado compartido más algoritmo fijo es exactamente lo que una interfaz no puede ofrecer. Si `MedioPago` fuera una interfaz, cada implementación tendría que repetir el campo `nombre` y la suma final, o delegar en una clase auxiliar. La clase abstracta concentra lo común y obliga a implementar solo lo que varía.

La regla de decisión es concreta. Usa una interfaz cuando quieras definir una capacidad que varias clases no relacionadas pueden implementar (`Comparable`, `Descuento`, `Runnable`). Usa una clase abstracta cuando varias clases comparten estado o un esqueleto de algoritmo y quieres evitar duplicarlo (`MedioPago`). Y puedes combinar: una clase abstracta puede implementar una interfaz y dejar métodos abstractos para las subclases.

Hay una prueba de evolución que ayuda a elegir. Si mañana hay que agregar un método al contrato, una interfaz abstracta rompe todas las implementaciones existentes; un método `default` las deja compilar, pero puede esconder un comportamiento incorrecto. En una clase abstracta el nuevo método puede tener una implementación por defecto o quedar abstracto, y el compilador obliga a las subclases a decidir. Cuanto más estable sea el contrato, más apropiada es la interfaz; cuanto más compartido sea el algoritmo, más apropiada es la clase abstracta.

`SinDescuento` merece una nota aparte porque suele generar dudas. Es una implementación sin estado, por eso puede existir una única instancia (`INSTANCIA`) y compartirse entre hilos sin sincronización: no hay campos que cambien. El constructor es `private` para que nadie cree otra. Ese patrón se llama *null object* y evita repartir `if (descuento != null)` por toda la aplicación. La alternativa —devolver `null`— obliga a cada llamador a recordar la comprobación, y el día que uno la olvida aparece un `NullPointerException` en el recibo.

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

La elección de sobrecarga ocurre en compilación y sigue un orden preciso. Primero se buscan métodos aplicables sin conversiones implícitas (coincidencia exacta o widening de primitivos). Si no hay, se permite boxing y unboxing. Si tampoco, se permiten varargs. Finalmente se elige el más específico: entre `f(int)` y `f(long)`, una llamada con `10` prefiere `f(int)` porque es más específico. Si dos candidatos quedan empatados, el compilador falla con “reference to f is ambiguous” en lugar de elegir uno al azar. Esa es una diferencia importante con la sobreescritura: aquí no hay objeto real que consultar, solo tipos declarados.

El tipo de retorno no participa de la sobrecarga. No puedes declarar `int calcular()` y `Dinero calcular()` en la misma clase: para el compilador ambas firmas son `calcular()`, y el cuerpo no se puede elegir por lo que el llamador espera recibir. Tampoco alcanza con cambiar los nombres de los parámetros: la firma son los tipos, no los nombres.

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

Hay una consecuencia de esta distinción que aparece en cuanto se usan genéricos. Cuando una subclase especializa un tipo genérico, el compilador puede generar un método *bridge*: una versión con la firma borrada que delega en la implementación real. `javap -p` los muestra como métodos extra con nombres como `compareTo(Object)`. No son código tuyo y no deberías llamarlos; existen para que el despacho dinámico siga funcionando después del borrado de tipos. En el módulo de colecciones se ve el mecanismo completo.

Los **modificadores de acceso** controlan quién puede ver cada miembro. El proyecto usa los cuatro:

- `private`: los campos de `Producto`, `Sku`, `Dinero`. Solo la propia clase los ve.
- `protected`: `Producto.normalizarNombre` y el constructor de `MedioPago`. Lo ven la clase, sus subclases y el paquete.
- `package-private` (sin modificador): `CalculadoraPrecio.sumarSubtotales`. Lo ve solo el paquete `servicio`, donde vive `Pedido`.
- `public`: la API que usa la aplicación (`precioBase()`, `calcular()`, `buscar()`).

La tabla completa aclara una confusión frecuente: `protected` no significa “solo subclases”, sino “subclases y mismo paquete”.

| Modificador | Misma clase | Mismo paquete | Subclase en otro paquete | Cualquier paquete |
| --- | --- | --- | --- | --- |
| `private` | sí | no | no | no |
| sin modificador | sí | sí | no | no |
| `protected` | sí | sí | sí | no |
| `public` | sí | sí | sí | sí |

Elegir visibilidad es diseñar la superficie del módulo. Un paquete no es solo una carpeta: es una unidad de encapsulación. `servicio` expone `CalculadoraPrecio` y `Pedido`, pero esconde cómo suma los subtotales. Si mañana ese cálculo cambia —por ejemplo, para aplicar redondeo por línea—, el cambio queda dentro del paquete y ningún cliente se entera. Esa libertad es la que se pierde cuando todo es `public` por comodidad.

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

`final` completa el control. `MedioPago.total` es `final` para que ninguna subclase altere la fórmula; `ProductoFisico` y `ServicioDigital` son `final` para que no se especialicen más. `final` en un método o clase es una promesa de estabilidad que el compilador hace cumplir. En un campo, `final` garantiza una única asignación; en un parámetro o variable local, permite usarlo dentro de una lambda sin que el compilador se queje de que “no es efectivamente final”.

No todo lo que parece sobrescritura lo es. Un método `private` no se hereda, así que una subclase que declara otro con el mismo nombre lo está ocultando, no sobrescribiendo: si alguien llama a través de la base, ejecuta el de la base. Un método `static` tampoco participa del despacho dinámico; se resuelve con el tipo declarado. La anotación `@Override` en cualquiera de esos casos produce un error de compilación, y esa es justamente su utilidad: convierte una falsa sobrescritura en un aviso inmediato.

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

Un record no es azúcar sobre una clase cualquiera. El compilador genera una clase `final` que extiende `java.lang.Record`, con un campo privado y final por componente, un constructor canónico con la lista completa de componentes, un accesor por componente y las implementaciones de `equals`, `hashCode` y `toString`. No puedes agregar campos de instancia: si necesitas estado adicional, no es un record. Sí puedes agregar campos `static`, métodos, constructores adicionales y implementar interfaces. Un constructor adicional está obligado a delegar en el canónico con `this(...)`, porque es el único que asigna los componentes.

El constructor compacto es una forma del canónico, no un constructor distinto. Su cuerpo se inserta al principio del constructor generado: primero se ejecuta tu validación y normalización, y después el compilador asigna los componentes ya transformados. Por eso `Direccion` puede rechazar un código postal inválido antes de que exista un objeto a medio construir. Si declaras un constructor canónico completo —con la lista de parámetros— pierdes la forma compacta, pero puedes hacer lo mismo escribiendo las asignaciones a mano.

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

La igualdad que genera el compilador es la que espera un objeto de valor: dos records del mismo tipo son iguales si todos sus componentes son iguales, usando `Objects.equals` para las referencias y `==` para los primitivos. `hashCode` combina los mismos componentes, de modo que se cumple el contrato que los mapas y conjuntos necesitan: si dos objetos son iguales, tienen el mismo hash. `toString` incluye el nombre del record y cada componente con su nombre, lo que hace legible un log sin escribir un método extra.

Esa igualdad tiene un límite que conviene conocer antes de usar records como claves. Si un componente es un arreglo, `equals` compara la referencia del arreglo, no su contenido, y dos records con arreglos equivalentes resultan distintos. Lo mismo pasa con cualquier componente mutable: el hash puede cambiar después de insertar el objeto en un `HashMap`, y la entrada se vuelve inencontrable. Por eso los componentes de un record que se usa como clave deben ser inmutables o, como mínimo, no cambiar mientras el objeto vive en la colección. En el módulo siguiente, `Sku` y `Producto` se usan como claves y esa regla deja de ser teórica.

Un record puede implementar interfaces, y eso incluye `Comparable`. Si el orden natural está bien definido, declararlo en el record evita comparadores repetidos: `Sku` podría implementar `Comparable<Sku>` y ordenar por su valor. La decisión de si el orden natural va en el tipo o en un comparador externo depende de si ese orden es una propiedad esencial del valor o una necesidad de una vista concreta.

Un record es inmutable en su capa superficial, no en profundidad. Si un componente es una lista mutable, el record guarda la referencia y la lista puede cambiar por fuera. Para valores realmente inmutables, el constructor compacto debe copiar los componentes mutables (`List.copyOf`, `Arrays.copyOf`) y el accesor debe devolver otra copia. En este proyecto, `Dinero` y `Producto` ya son inmutables en lo que importa, así que los records pueden compartirlos sin defensas adicionales.

Los records no sirven para todo. No pueden extender otra clase (sí implementar interfaces), no tienen setters y sus componentes son finales. Una entidad que cambia con el tiempo —un `Producto` cuyo stock baja con cada venta— no debería ser un record. Un objeto de valor que se reemplaza completo —una dirección, una línea, un resultado de precio— sí.

Tienen otra ventaja que se aprecia cuando el código crece: la deconstrucción por patrones. Desde Java 21, un `record` se puede desempaquetar en un `instanceof` o en un `switch` sin llamar a cada accesor:

```java
if (objeto instanceof Direccion(String calle, String ciudad, String codigoPostal)) {
    System.out.println(calle + " / " + ciudad + " / " + codigoPostal);
}
```

El compilador comprueba el tipo y extrae los componentes en una sola expresión. Esa forma de trabajar reemplaza muchos `instanceof` seguidos de casts y getters, y encaja con la idea de que el record es una estructura de datos con forma conocida.

El costo de un record está en su rigidez. Agregar un componente cambia el constructor canónico y rompe a todos los llamadores; no hay forma de darle un valor por defecto sin escribir otro constructor que delegue. Si el tipo va a evolucionar con frecuencia, una clase con constructor privado y fábricas estáticas puede ser más misericordiosa. Para valores pequeños y estables, el record gana por claridad y por igualdad correcta.

El error más común es usar un record para una entidad mutable y luego intentar “cambiar” un componente con un setter que no existe. La señal es un `record` con campos auxiliares mutables o con métodos que reconstruyen el objeto a mano. La corrección es elegir: si el valor cambia, usa una clase; si se reemplaza, usa un record y crea uno nuevo con el cambio.

### Tema 6: Constructores flexibles (Java 25): validar y preparar antes de super(...) · Avanzado · 45 min

Antes de Java 25, el constructor de una subclase tenía que empezar obligatoriamente con `super(...)` o `this(...)`. No podías normalizar un argumento, validarlo ni calcular nada antes de entregárselo a la clase base. Las soluciones eran incómodas: un método estático de fábrica, un constructor privado con parámetros ya normalizados o duplicar la validación en cada subclase.

El problema no era solo estético. Si querías que `ProductoFisico` recibiera un SKU en texto y lo convirtiera a `Sku`, tenías tres caminos, y los tres tenían costo. El primero era pedirle al llamador que construyera el `Sku`, con lo que la validación se escapaba de la clase. El segundo era un constructor privado que recibía el `Sku` ya validado y una fábrica estática que hacía la conversión; funcionaba, pero duplicaba la superficie de construcción y complicaba el uso desde frameworks. El tercero era aceptar el `String` en la base y validarlo allí, con lo que la base aprendía detalles de todas sus subclases. Java 25 elimina esa disyuntiva: permite sentencias antes de la invocación explícita al constructor, tanto en `super(...)` como en `this(...)`.

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

La zona previa a `super` se llama contexto de construcción temprana y tiene reglas precisas. Puedes leer y escribir parámetros, declarar variables locales, usar métodos y campos `static` de la clase, crear objetos y lanzar excepciones. No puedes leer ni escribir campos de instancia, llamar a métodos de instancia, usar `this` como valor —ni siquiera para pasarlo a un método— ni referirte a clases internas que capturen la instancia. La razón es que la parte base del objeto todavía no está construida: cualquier lectura de un campo vería el valor por defecto, y cualquier llamada a un método virtual podría ejecutar código de la subclase con el estado a medio inicializar.

Esa restricción convierte al compilador en un aliado. Un constructor que intenta leer `this.pesoGramos` antes de `super` no compila, en lugar de producir un objeto con peso cero y un bug intermitente. La regla es simple: antes de `super` solo existe lo que vino por parámetros y lo que es estático. Si necesitas más, es una señal de que la lógica debería vivir en un método estático de apoyo o en un objeto de valor que se construye primero.

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

Esa comprobación también define la estrategia de migración. Un proyecto que debe correr en Java 21 no puede adoptar estos constructores todavía, por más que el JDK local sea 25: el bytecode tiene que ser compatible con el runtime de producción. `--release` y el toolchain existen para que esa restricción se detecte en el build y no en el servidor. Si el proyecto puede subir a 25, la característica elimina una capa de fábricas y constructores auxiliares; si no, se sigue usando el patrón de fábrica estática, que sigue siendo válido.

Los constructores flexibles no eliminan todas las restricciones. Sigue estando prohibido leer `this` antes de `super`, porque el objeto base todavía no existe. Tampoco puedes asignar campos de la instancia antes de `super`; el compilador lo detecta como “variable might not have been initialized” o “cannot reference this before supertype constructor has been called”. La zona permitida es la de expresiones que solo dependen de los parámetros y de métodos estáticos.

La interacción con records es natural. Un constructor compacto ya permitía validar y normalizar; los constructores flexibles extienden esa comodidad a las clases con herencia. Juntos cubren los dos casos: valores inmutables con `record` y jerarquías con estado compartido y validación previa.

La misma libertad existe en el encadenamiento con `this(...)`. Un constructor puede calcular o validar antes de delegar en otro constructor de la misma clase, y ese otro puede a su vez delegar en `super(...)`. La regla se mantiene: la cadena termina en una invocación a la base, cada constructor de la cadena se ejecuta una sola vez y los campos de la instancia solo se asignan después de que la base esté construida. Eso permite tener un constructor público que recibe texto y delega en otro que recibe objetos de valor, sin duplicar la validación ni exponer la representación interna.

El error más común es usar un método de instancia (no estático) para preparar los argumentos antes de `super`. Ese método necesitaría `this`, y `this` todavía no es utilizable. La corrección es mover la lógica a un método `static` o a una clase auxiliar. El segundo error es olvidar que la validación debe cubrir también los parámetros que no se pasan a `super` (el peso, la licencia): si no se validan antes, el objeto puede construirse con datos incoherentes aunque la base sea válida.

## Verificación real

Re-verificado el 2026-11-23 en `/tmp/opencode/aurora-m1` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q classes
./gradlew -q test
./gradlew -q run --args="catalogo"
./gradlew -q run --args="cotizar --sku CAF-0001 --cantidad 3 --descuento BIENVENIDA --pago TARJETA"
./gradlew -q run --args="comparar --sku CAF-0001 --cantidad 3 --descuento BIENVENIDA"
./gradlew -q run --args="reglas"
./gradlew -q run --args="diagnostico"
```

Resultados observados (resumen):

- `classes` y `test`: compilación y suite sin fallas.
- `catalogo`: 4 productos (físicos/digital) con precio y envío.
- `cotizar`: total `$39.47` con descuento Bienvenida, envío y recargo de tarjeta; `comparar` muestra `$38.70` con efectivo/transferencia y `$41.36` con contra reembolso.
- `reglas` y `diagnostico`: ejecutan sin error; diagnostico confirma invariantes de construcción, normalización e igualdad de records.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `NullPointerException` por campo no inicializado | Constructor no valida invariantes | NPE en métodos | Validar en constructor/factory |
| Estado inconsistente | Campos mutables expuestos | Cambia desde afuera | Encapsular, devolver copias/inmutables |
| `equals/hashCode` inconsistente | Se sobreescribe uno solo | Fallos en `HashSet/Map` | Implementar contrato completo o usar `record` |
| Jerarquía rígida | Herencia por conveniencia | Cambios rompen subclases | Preferir composición/interfaces |
| `instanceof` por todos lados | Polimorfismo ausente | Switches repetidos | Mover comportamiento a tipo/polimorfismo |

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
