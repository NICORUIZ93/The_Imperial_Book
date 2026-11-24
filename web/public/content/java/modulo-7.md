# Módulo 7: Sealed classes y pattern matching

El modelado de dominio mejora cuando el tipo expresa las posibilidades reales. Un pago en Tienda Aurora no es “un objeto con muchos campos opcionales”; puede ser tarjeta, transferencia o efectivo. Si lo modelas con `if instanceof` sueltos y campos nulos, cada nuevo caso obliga a revisar código disperso. Las sealed classes e interfaces, junto con records y pattern matching, permiten cerrar el conjunto de variantes y hacer que el compilador ayude con exhaustividad.

## Visual del módulo

**Visual:** [Jerarquía sealed Pago con record patterns y switch exhaustivo](/visuals/temas/java/modulo-7-patterns.html)

Lectura: Sealed limita subtipos permitidos; el switch exhaustivo obliga a cubrir cada variante.

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-patterns/src/main/java/com/aurora/patterns/{dominio,servicio}
mkdir -p tienda-aurora-patterns/src/test/java/com/aurora/patterns
cd tienda-aurora-patterns
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-patterns"
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
    mainClass = "com.aurora.patterns.TiendaAuroraPatternsApp"
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "failed", "skipped")
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

#### Dominio

#### `Pago.java`

Interfaz sellada: solo los tipos permitidos pueden implementarla. Esto convierte la jerarquía en un conjunto cerrado, útil para `switch` exhaustivo.

```java
package com.aurora.patterns.dominio;

import java.math.BigDecimal;

public sealed interface Pago permits PagoTarjeta, PagoTransferencia, PagoEfectivo {
    String pedidoId();
    BigDecimal monto();
}
```

#### `PagoTarjeta.java`

Record inmutable: lleva `titular` y `ultimos4`, y valida ambos en el constructor compacto.

```java
package com.aurora.patterns.dominio;

import java.math.BigDecimal;
import java.util.Objects;

public record PagoTarjeta(String pedidoId, BigDecimal monto, String titular, String ultimos4) implements Pago {
    public PagoTarjeta {
        Objects.requireNonNull(pedidoId, "pedidoId");
        Objects.requireNonNull(monto, "monto");
        Objects.requireNonNull(titular, "titular");
        Objects.requireNonNull(ultimos4, "ultimos4");
        if (monto.signum() <= 0) throw new IllegalArgumentException("monto inválido");
        if (!ultimos4.matches("\\d{4}")) throw new IllegalArgumentException("ultimos4 inválido");
    }
}
```

#### `PagoTransferencia.java`

Record inmutable: lleva `banco` y `referencia`. La referencia no interesa en el procesamiento, por eso más adelante se ignora con `_`.

```java
package com.aurora.patterns.dominio;

import java.math.BigDecimal;
import java.util.Objects;

public record PagoTransferencia(String pedidoId, BigDecimal monto, String banco, String referencia) implements Pago {
    public PagoTransferencia {
        Objects.requireNonNull(pedidoId, "pedidoId");
        Objects.requireNonNull(monto, "monto");
        Objects.requireNonNull(banco, "banco");
        Objects.requireNonNull(referencia, "referencia");
        if (monto.signum() <= 0) throw new IllegalArgumentException("monto inválido");
    }
}
```

#### `PagoEfectivo.java`

Record inmutable: valida que el recibido cubra el monto y expone `vuelto()`.

```java
package com.aurora.patterns.dominio;

import java.math.BigDecimal;
import java.util.Objects;

public record PagoEfectivo(String pedidoId, BigDecimal monto, BigDecimal recibido) implements Pago {
    public PagoEfectivo {
        Objects.requireNonNull(pedidoId, "pedidoId");
        Objects.requireNonNull(monto, "monto");
        Objects.requireNonNull(recibido, "recibido");
        if (monto.signum() <= 0) throw new IllegalArgumentException("monto inválido");
        if (recibido.compareTo(monto) < 0) throw new IllegalArgumentException("recibido insuficiente");
    }

    public BigDecimal vuelto() {
        return recibido.subtract(monto);
    }
}
```

#### `ResultadoPago.java`

Otro sealed: el resultado también es un conjunto cerrado. Esto evita códigos mágicos y hace que el renderizado sea exhaustivo.

```java
package com.aurora.patterns.dominio;

public sealed interface ResultadoPago permits ResultadoPago.Aprobado, ResultadoPago.Rechazado, ResultadoPago.Pendiente {
    String pedidoId();

    record Aprobado(String pedidoId, String mensaje) implements ResultadoPago {}
    record Rechazado(String pedidoId, String motivo) implements ResultadoPago {}
    record Pendiente(String pedidoId, String seguimiento) implements ResultadoPago {}
}
```

#### `ProcesadorPagos.java`

Usa switch con record patterns. En transferencia y efectivo, `_` ignora componentes que no se usan, haciendo explícita la intención. El switch sobre `ResultadoPago` es exhaustivo: si agregas un nuevo resultado, el compilador obliga a manejarlo.

```java
package com.aurora.patterns.servicio;

import com.aurora.patterns.dominio.Pago;
import com.aurora.patterns.dominio.PagoEfectivo;
import com.aurora.patterns.dominio.PagoTarjeta;
import com.aurora.patterns.dominio.PagoTransferencia;
import com.aurora.patterns.dominio.ResultadoPago;

public final class ProcesadorPagos {

    public ResultadoPago procesar(Pago pago) {
        return switch (pago) {
            case PagoTarjeta(var pedidoId, var monto, var titular, var ultimos4) ->
                    new ResultadoPago.Aprobado(pedidoId,
                            "Tarjeta ****" + ultimos4 + " de " + titular + " por " + monto);
            case PagoTransferencia(var pedidoId, var monto, var banco, _) ->
                    new ResultadoPago.Pendiente(pedidoId,
                            "Transferencia en " + banco + " por " + monto + " en verificación");
            case PagoEfectivo efectivo when efectivo.vuelto().signum() > 0 ->
                    new ResultadoPago.Aprobado(efectivo.pedidoId(),
                            "Efectivo recibido, vuelto " + efectivo.vuelto());
            case PagoEfectivo(var pedidoId, _, _) ->
                    new ResultadoPago.Aprobado(pedidoId, "Efectivo exacto");
        };
    }

    public String etiquetaAuditoria(Object valor) {
        if (valor instanceof PagoTarjeta(var pedidoId, _, _, var ultimos4)) {
            return "tarjeta pedido=" + pedidoId + " ****" + ultimos4;
        }
        if (valor instanceof PagoTransferencia(var pedidoId, _, var banco, _)) {
            return "transferencia pedido=" + pedidoId + " banco=" + banco;
        }
        if (valor instanceof PagoEfectivo(var pedidoId, _, _)) {
            return "efectivo pedido=" + pedidoId;
        }
        return "desconocido";
    }

    public String resumen(ResultadoPago resultado) {
        return switch (resultado) {
            case ResultadoPago.Aprobado(var pedidoId, var mensaje) -> "OK " + pedidoId + " - " + mensaje;
            case ResultadoPago.Rechazado(var pedidoId, var motivo) -> "RECHAZADO " + pedidoId + " - " + motivo;
            case ResultadoPago.Pendiente(var pedidoId, var seguimiento) -> "PENDIENTE " + pedidoId + " - " + seguimiento;
        };
    }
}
```

#### `ReciboTexto.java`

Comprobante con text block y `formatted()`: la indentación se elimina respecto de la comilla de cierre.

```java
package com.aurora.patterns.servicio;

public final class ReciboTexto {

    private ReciboTexto() {
    }

    public static String recibo(String pedidoId, String mensaje) {
        return """
                Aurora - comprobante
                Pedido: %s
                Resultado: %s
                """.formatted(pedidoId, mensaje);
    }
}
```

#### `TiendaAuroraPatternsApp.java`

```java
package com.aurora.patterns;

import com.aurora.patterns.dominio.Pago;
import com.aurora.patterns.dominio.PagoEfectivo;
import com.aurora.patterns.dominio.PagoTarjeta;
import com.aurora.patterns.dominio.PagoTransferencia;
import com.aurora.patterns.servicio.ProcesadorPagos;
import com.aurora.patterns.servicio.ReciboTexto;

import java.math.BigDecimal;
import java.util.List;

public final class TiendaAuroraPatternsApp {

    public static void main(String[] args) {
        String comando = args.length == 0 ? "demo" : args[0];
        ProcesadorPagos procesador = new ProcesadorPagos();
        List<Pago> pagos = List.of(
                new PagoTarjeta("PED-100", new BigDecimal("39.90"), "Ana", "4242"),
                new PagoTransferencia("PED-101", new BigDecimal("79.90"), "Banco Aurora", "TR-7788"),
                new PagoEfectivo("PED-102", new BigDecimal("20.00"), new BigDecimal("50.00")),
                new PagoEfectivo("PED-103", new BigDecimal("15.00"), new BigDecimal("15.00"))
        );

        switch (comando) {
            case "procesar" -> pagos.stream()
                    .map(procesador::procesar)
                    .map(procesador::resumen)
                    .forEach(System.out::println);
            case "auditoria" -> pagos.stream()
                    .map(procesador::etiquetaAuditoria)
                    .forEach(System.out::println);
            case "record" -> {
                PagoTarjeta a = new PagoTarjeta("PED-1", new BigDecimal("10.00"), "Ana", "4242");
                PagoTarjeta b = new PagoTarjeta("PED-1", new BigDecimal("10.00"), "Ana", "4242");
                System.out.println("equals=" + a.equals(b));
                System.out.println("toString=" + a);
            }
            case "recibo" -> System.out.print(ReciboTexto.recibo("PED-100", "Aprobado por tarjeta"));
            case "demo" -> {
                System.out.println("== procesar ==");
                pagos.stream().map(procesador::procesar).map(procesador::resumen).forEach(System.out::println);
                System.out.println("== auditoria ==");
                pagos.stream().map(procesador::etiquetaAuditoria).forEach(System.out::println);
            }
            default -> {
                System.err.println("Comando desconocido: " + comando);
                System.exit(2);
            }
        }
    }
}
```

### Tema 1: sealed — jerarquías cerradas y exhaustividad · Intermedio · 40 min

Una clase o interfaz `sealed` restringe qué tipos pueden extenderla o implementarla. Se declara con `sealed` y `permits`, y los subtipos permitidos deben ser `final`, `sealed` o `non-sealed`. Esto crea una jerarquía cerrada: el compilador conoce todas las variantes posibles.

La ventaja principal es la exhaustividad. En un `switch` sobre un sealed, el compilador puede verificar que cubriste todos los casos. Si mañana agregas `PagoCrypto` a `permits`, todos los switches exhaustivos sobre `Pago` fallarán al compilar hasta que los actualices. Ese fallo es bueno: te obliga a decidir.

Usa `sealed` cuando el dominio tiene un conjunto cerrado de variantes conocidas. No lo uses cuando la extensión abierta es parte del diseño, como un plugin de terceros. `non-sealed` existe para abrir un punto específico de la jerarquía, pero debe ser una decisión consciente.

Snippet ejecutable (de `ProcesadorPagosTest.java`):

```java
assertEquals(3, Pago.class.getPermittedSubclasses().length);
assertEquals("OK PED-1 - aprobado",
        procesador.resumen(new ResultadoPago.Aprobado("PED-1", "aprobado")));
```

Comprobación concreta: los tests `sealedPagoDeclaraTresVariantes` y `resumenEsExhaustivoSobreResultadoPago` pasan. El primero confirma los três tipos de `permits`; el segundo cubre los tres subtipos de `ResultadoPago`. `resumen` no tiene `default`: si agregas una cuarta variante permitida, el `switch` deja de compilar hasta que la manejes.

### Tema 2: Pattern matching exhaustivo y para instanceof · Intermedio · 40 min

Pattern matching permite probar una forma y extraer datos en el mismo paso. `instanceof` con patrón (`if (valor instanceof PagoTarjeta(var pedidoId, _, _, var ultimos4))`) evita el casteo manual. El record pattern desestructura componentes por posición.

En `switch`, el pattern matching se vuelve aún más potente: cada `case` puede ser un tipo, un record pattern, o incluir un `when` guard. El guard `case PagoEfectivo efectivo when efectivo.vuelto().signum() > 0` agrega una condición; debes asegurar que los casos sigan siendo exhaustivos y que el orden no oculte casos más específicos.

**Confusión común:** poner `default` en todo. En jerarquías sealed, `default` puede ocultar un caso nuevo que deberías manejar. Prefiere exhaustividad real cuando el modelo está cerrado.

Snippet ejecutable (de `ProcesadorPagos.java`):

```java
case PagoEfectivo efectivo when efectivo.vuelto().signum() > 0 ->
        new ResultadoPago.Aprobado(efectivo.pedidoId(),
                "Efectivo recibido, vuelto " + efectivo.vuelto());
case PagoEfectivo(var pedidoId, _, _) ->
        new ResultadoPago.Aprobado(pedidoId, "Efectivo exacto");
```

Comprobación concreta: el test `guardWhenDistingueVueltoDeEfectivoExacto` pasa. Con `./gradlew -q run`, las dos ramas se distinguen en la salida:

```text
OK PED-102 - Efectivo recibido, vuelto 30.00
OK PED-103 - Efectivo exacto
```

### Tema 3: Unnamed variables y patterns (_, Java 22) · Intermedio · 30 min

`_` se usa como variable o patrón sin nombre cuando el valor es deliberadamente ignorado. En un record pattern, `PagoTransferencia(var pedidoId, var monto, var banco, _)` comunica que la referencia no importa en esa rama. Es mejor que llamar la variable `ignored` o `ref` y no usarla, porque el compilador y el lector entienden la intención.

También sirve en lambdas, catch y asignaciones en contextos soportados. No lo uses para ocultar datos que sí deberían validarse. Ignorar es una decisión de diseño; si el componente es relevante para la regla, debe nombrarse y usarse.

Snippet ejecutable (de `ProcesadorPagos.java` y `ProcesadorPagosTest.java`):

```java
case PagoTransferencia(var pedidoId, _, var banco, _) ->
        new ResultadoPago.Pendiente(pedidoId, "Transferencia en " + banco + " en verificación");

assertEquals("transferencia pedido=PED-2 banco=Banco Aurora", procesador.etiquetaAuditoria(
        new PagoTransferencia("PED-2", new BigDecimal("20.00"), "Banco Aurora", "TR-1")));
```

Comprobación concreta: el test `unnamedPatternIgnoraComponentesEnAuditoria` pasa; con `./gradlew -q run`, la auditoria imprime `transferencia pedido=PED-101 banco=Banco Aurora`. La referencia `TR-1` se ignora con `_` en ambas ramas.

#### Texto del comprobante: text block y `formatted()`

Snippet ejecutable (de `ReciboTexto.java`):

```java
return """
        Aurora - comprobante
        Pedido: %s
        Resultado: %s
        """.formatted(pedidoId, mensaje);
```

Comprobación concreta: `./gradlew -q run --args="recibo"` imprime:

```text
Aurora - comprobante
Pedido: PED-100
Resultado: Aprobado por tarjeta
```

El test `textBlockFormateaComprobante` compara la cadena completa, incluido el salto de línea final.

## Verificación real

Verificado el 2026-11-23 en `~/labs/aurora-m7` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, JUnit 5.13.4).

```bash
cd ~/labs/aurora-m7
./gradlew test --rerun-tasks --console=plain
./gradlew -q run
./gradlew -q run --args="recibo"
```

Salida observada de `./gradlew test --rerun-tasks --console=plain` (5 tests, 0 fallas):

```text
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses

> Task :test

ProcesadorPagosTest > unnamedPatternIgnoraComponentesEnAuditoria() PASSED

ProcesadorPagosTest > guardWhenDistingueVueltoDeEfectivoExacto() PASSED

ProcesadorPagosTest > sealedPagoDeclaraTresVariantes() PASSED

ProcesadorPagosTest > textBlockFormateaComprobante() PASSED

ProcesadorPagosTest > resumenEsExhaustivoSobreResultadoPago() PASSED

[Incubating] Problems report is available at: file:///Users/tu-usuario/labs/aurora-m7/build/reports/problems/problems-report.html

Deprecated Gradle features were used in this build, making it incompatible with Gradle 10.

You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.

For more on this, please refer to https://docs.gradle.org/9.9.1/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.

BUILD SUCCESSFUL in 1s
3 actionable tasks: 3 executed
Consider enabling configuration cache to speed up this build: https://docs.gradle.org/9.9.1/userguide/configuration_cache_enabling.html
```

Salida observada de `./gradlew -q run`:

```text
== procesar ==
OK PED-100 - Tarjeta ****4242 de Ana por 39.90
PENDIENTE PED-101 - Transferencia en Banco Aurora por 79.90 en verificación
OK PED-102 - Efectivo recibido, vuelto 30.00
OK PED-103 - Efectivo exacto
== auditoria ==
tarjeta pedido=PED-100 ****4242
transferencia pedido=PED-101 banco=Banco Aurora
efectivo pedido=PED-102
efectivo pedido=PED-103
```

Salida observada de `./gradlew -q run --args="recibo"`:

```text
Aurora - comprobante
Pedido: PED-100
Resultado: Aprobado por tarjeta
```

Archivo de test completo: `~/labs/aurora-m7/src/test/java/com/aurora/patterns/ProcesadorPagosTest.java`

```java
package com.aurora.patterns;

import com.aurora.patterns.dominio.Pago;
import com.aurora.patterns.dominio.PagoEfectivo;
import com.aurora.patterns.dominio.PagoTarjeta;
import com.aurora.patterns.dominio.PagoTransferencia;
import com.aurora.patterns.dominio.ResultadoPago;
import com.aurora.patterns.servicio.ProcesadorPagos;
import com.aurora.patterns.servicio.ReciboTexto;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProcesadorPagosTest {

    private final ProcesadorPagos procesador = new ProcesadorPagos();

    @Test
    void sealedPagoDeclaraTresVariantes() {
        assertEquals(3, Pago.class.getPermittedSubclasses().length);
        assertEquals(Arrays.toString(new Class<?>[]{
                        PagoTarjeta.class, PagoTransferencia.class, PagoEfectivo.class}),
                Arrays.toString(Pago.class.getPermittedSubclasses()));
    }

    @Test
    void resumenEsExhaustivoSobreResultadoPago() {
        assertEquals("OK PED-1 - aprobado",
                procesador.resumen(new ResultadoPago.Aprobado("PED-1", "aprobado")));
        assertEquals("RECHAZADO PED-2 - sin fondos",
                procesador.resumen(new ResultadoPago.Rechazado("PED-2", "sin fondos")));
        assertEquals("PENDIENTE PED-3 - TR-1",
                procesador.resumen(new ResultadoPago.Pendiente("PED-3", "TR-1")));
    }

    @Test
    void guardWhenDistingueVueltoDeEfectivoExacto() {
        String conVuelto = procesador.resumen(procesador.procesar(
                new PagoEfectivo("PED-1", new BigDecimal("20.00"), new BigDecimal("50.00"))));
        String exacto = procesador.resumen(procesador.procesar(
                new PagoEfectivo("PED-2", new BigDecimal("15.00"), new BigDecimal("15.00"))));

        assertEquals("OK PED-1 - Efectivo recibido, vuelto 30.00", conVuelto);
        assertEquals("OK PED-2 - Efectivo exacto", exacto);
    }

    @Test
    void unnamedPatternIgnoraComponentesEnAuditoria() {
        assertEquals("tarjeta pedido=PED-1 ****4242", procesador.etiquetaAuditoria(
                new PagoTarjeta("PED-1", new BigDecimal("10.00"), "Ana", "4242")));
        assertEquals("transferencia pedido=PED-2 banco=Banco Aurora", procesador.etiquetaAuditoria(
                new PagoTransferencia("PED-2", new BigDecimal("20.00"), "Banco Aurora", "TR-1")));
        assertEquals("efectivo pedido=PED-3", procesador.etiquetaAuditoria(
                new PagoEfectivo("PED-3", new BigDecimal("5.00"), new BigDecimal("5.00"))));
    }

    @Test
    void textBlockFormateaComprobante() {
        assertEquals("Aurora - comprobante\nPedido: PED-100\nResultado: Aprobado por tarjeta\n",
                ReciboTexto.recibo("PED-100", "Aprobado por tarjeta"));
    }
}
```

Cada rama del `sealed Pago` aparece una vez en `procesar`, y el patrón `_` de `auditoria` absorbe los componentes que no aportan a ese reporte. La exhaustividad compilada se comprueba con los tests `sealedPagoDeclaraTresVariantes` y `resumenEsExhaustivoSobreResultadoPago`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `ClassCastException` en patrón | Suposición de tipo incorrecta | Revisar switch/pattern | Usar sealed + pattern matching exhaustivo |
| Switch no exhaustivo | Falta caso sealed/enum | Error compilación Java moderno | Cubrir todos los casos o default justificado |
| Record mutable por campo mutable | Lista/objeto interno mutable | Mutación externa | Copia defensiva/`List.copyOf` |
| `NullPointerException` al desestructurar | Componente null no esperado | Validar en constructor compacto | Validar invariantes al construir |
| Texto block/formato confuso | Escapes/indentación | Salida inesperada | Usar text blocks y `formatted` con cuidado |

## Cierre

Sealed types y pattern matching no son azúcar sintáctica: son herramientas de modelado. Permiten que el dominio exprese sus variantes reales y que el compilador detecte casos faltantes. El resultado es código más directo, con menos casteos defensivos y menos estados imposibles.

## Checklist

- [ ] Uso `sealed` cuando el conjunto de variantes está cerrado.
- [ ] Uso records para variantes inmutables de datos.
- [ ] Prefiero switch exhaustivo sobre sealed antes que `default` ciego.
- [ ] Uso `_` solo para valores deliberadamente ignorados.
- [ ] Valido invariantes en constructores compactos de records.
