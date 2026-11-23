# Módulo 7: Sealed classes y pattern matching


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 7 — mapa visual](/visuals/temas/java/modulo-7-excepciones.html)

Lectura: Lanza con contexto, propaga cuando no puedes decidir y maneja en el borde con una respuesta útil.


En Tienda Aurora, un pago no es “un monto y ya”. Puede ser tarjeta, transferencia o efectivo. Cada variante tiene datos distintos y reglas distintas. Si lo modelas con una clase llena de campos opcionales y `if (tipo == ...)`, el código acepta estados imposibles y cada nuevo tipo obliga a cazar condiciones dispersas por el sistema.

Las sealed classes y el pattern matching moderno de Java permiten modelar ese dominio como un conjunto cerrado de casos. Un record expresa datos inmutables con poco ruido. Una sealed interface dice qué subtipos existen. Un `switch` exhaustivo obliga al compilador a avisarte cuando falta un caso. El resultado es un modelo más seguro, no solo más bonito.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, macOS arm64. El proyecto se compiló con `./gradlew -q build`. Las salidas de `demo` y `record` son reales.

## Proyecto desde cero: tienda-aurora-patterns

## Prerrequisitos

```bash
java -version
gradle --version
```

## Estructura del proyecto

```text
tienda-aurora-patterns/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/
            └── com/aurora/patterns/
                ├── TiendaAuroraPatternsApp.java
                ├── dominio/
                │   ├── Pago.java
                │   ├── PagoEfectivo.java
                │   ├── PagoTarjeta.java
                │   ├── PagoTransferencia.java
                │   └── ResultadoPago.java
                └── servicio/
                    └── ProcesadorPagos.java
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
    mainClass = "com.aurora.patterns.TiendaAuroraPatternsApp"
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
rootProject.name = "tienda-aurora-patterns"
```

## Código completo

Nombre del proyecto.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-patterns"
```

Build Java 25 sin dependencias externas. Sealed classes, records y pattern matching son características del lenguaje/JDK, no requieren librerías.

**Archivo:** `build.gradle.kts`

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

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

`Pago` es una interfaz sellada. `sealed` indica que solo las clases listadas en `permits` pueden implementarla. Esto convierte la jerarquía en cerrada: el compilador conoce todos los casos posibles.

**Archivo:** `src/main/java/com/aurora/patterns/dominio/Pago.java`

```java
package com.aurora.patterns.dominio;

import java.math.BigDecimal;

public sealed interface Pago permits PagoTarjeta, PagoTransferencia, PagoEfectivo {
    String pedidoId();
    BigDecimal monto();
}
```

`PagoTarjeta` es un record que implementa `Pago`. Un record es un portador inmutable de datos: el compilador genera constructor, accesores, `equals`, `hashCode` y `toString`. La validación en el constructor compacto protege invariantes como monto positivo y últimos 4 dígitos.

**Archivo:** `src/main/java/com/aurora/patterns/dominio/PagoTarjeta.java`

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

`PagoTransferencia` modela un pago pendiente de confirmación bancaria. Tenerlo como tipo separado evita campos opcionales confusos en una sola clase “Pago genérico”.

**Archivo:** `src/main/java/com/aurora/patterns/dominio/PagoTransferencia.java`

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

`PagoEfectivo` incluye `recibido` y calcula `vuelto()`. El modelo hace imposible representar efectivo recibido menor al monto porque el constructor lo rechaza.

**Archivo:** `src/main/java/com/aurora/patterns/dominio/PagoEfectivo.java`

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

`ResultadoPago` también es sellado. Modela el resultado como estados explícitos: aprobado, rechazado o pendiente. Es una alternativa más segura que devolver strings mágicos o códigos numéricos.

**Archivo:** `src/main/java/com/aurora/patterns/dominio/ResultadoPago.java`

```java
package com.aurora.patterns.dominio;

public sealed interface ResultadoPago permits ResultadoPago.Aprobado, ResultadoPago.Rechazado, ResultadoPago.Pendiente {
    String pedidoId();

    record Aprobado(String pedidoId, String mensaje) implements ResultadoPago {}
    record Rechazado(String pedidoId, String motivo) implements ResultadoPago {}
    record Pendiente(String pedidoId, String seguimiento) implements ResultadoPago {}
}
```

`ProcesadorPagos` usa switch con pattern matching sobre la jerarquía sellada. No hay `default`: si mañana agregas un nuevo tipo de `Pago` y lo declaras en `permits`, el compilador obligará a actualizar este switch. También usa record patterns y `_` para descartar componentes no usados.

**Archivo:** `src/main/java/com/aurora/patterns/servicio/ProcesadorPagos.java`

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

CLI de demostración. Procesa pagos, genera etiquetas de auditoría y muestra la igualdad/toString generados por un record.

**Archivo:** `src/main/java/com/aurora/patterns/TiendaAuroraPatternsApp.java`

```java
package com.aurora.patterns;

import com.aurora.patterns.dominio.Pago;
import com.aurora.patterns.dominio.PagoEfectivo;
import com.aurora.patterns.dominio.PagoTarjeta;
import com.aurora.patterns.dominio.PagoTransferencia;
import com.aurora.patterns.dominio.ResultadoPago;
import com.aurora.patterns.servicio.ProcesadorPagos;

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

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q build
./gradlew -q run --args="demo"
```

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

```bash
./gradlew -q run --args="record"
```

```text
equals=true
toString=PagoTarjeta[pedidoId=PED-1, monto=10.00, titular=Ana, ultimos4=4242]
```

## Conceptos cubiertos

### Tema 1: sealed — jerarquías cerradas y exhaustividad · Intermedio · 35 min

Una jerarquía sellada declara sus subtipos permitidos. En `Pago`, la declaración es:

```java
public sealed interface Pago permits PagoTarjeta, PagoTransferencia, PagoEfectivo {
    String pedidoId();
    BigDecimal monto();
}
```

`sealed` significa que no cualquier clase puede implementar `Pago`. Solo las permitidas. `permits` lista esos casos. Cada subtipo debe ser `final`, `sealed` o `non-sealed`; los records son implícitamente final, por eso encajan bien.

La ventaja es el conocimiento en compilación. Cuando `ProcesadorPagos` hace `switch (pago)`, el compilador sabe que solo existen tres casos. Si mañana agregas `PagoCripto` en `permits`, el switch deja de ser exhaustivo y el compilador lo señala. Eso convierte un cambio de dominio en un error de compilación localizado, no en un bug olvidado en producción.

Esto es distinto de una clase base abierta. Una jerarquía abierta permite extensiones desconocidas; es útil para plugins. Una jerarquía sellada es útil para dominios donde los casos son finitos y quieres exhaustividad. Pagos, resultados, eventos de dominio y estados de workflow suelen ser buenos candidatos.

### Tema 2: Pattern matching exhaustivo y para instanceof · Intermedio · 40 min

El pattern matching permite inspeccionar un valor y extraer sus partes con seguridad de tipos. En el método `procesar`, el switch no solo selecciona por tipo; también desestructura records:

```java
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
```

Aquí hay varias cosas importantes. `case PagoTarjeta(...)` es un record pattern: extrae componentes directamente. `when` agrega una guardia para el caso de efectivo con vuelto. No hay `default` porque la jerarquía está sellada y todos los casos están cubiertos. Si quitas un caso, el código no compila.

El pattern matching para `instanceof` aparece en `etiquetaAuditoria`. La forma antigua era:

```java
if (valor instanceof PagoTarjeta) {
    PagoTarjeta tarjeta = (PagoTarjeta) valor;
    ...
}
```

La forma moderna elimina el casteo manual y hace visible el alcance de la variable de patrón. Además, puede desestructurar el record en el mismo lugar. Eso reduce ruido y evita errores de casteo.

### Tema 3: Unnamed variables y patterns (_, Java 22) · Intermedio · 30 min

A veces necesitas aceptar una estructura pero no todos sus campos. Antes se usaban nombres como `ignored`, `unused` o `__`, que son ambiguos: ¿lo ignoraste a propósito o olvidaste usarlo? Java 22 introdujo `_` como unnamed pattern/variable para indicar explícitamente que el valor se descarta.

En `ProcesadorPagos` se ve en dos lugares:

```java
case PagoTransferencia(var pedidoId, var monto, var banco, _) -> ...
case PagoEfectivo(var pedidoId, _, _) -> ...
```

En la transferencia, la referencia no se usa en ese mensaje; en el efectivo exacto, monto y recibido no se necesitan porque el caso ya está cubierto por la guardia anterior. `_` deja clara la intención: el componente existe, pero no importa en esta rama.

Esto mejora la lectura y también ayuda al mantenimiento. Si alguien ve una variable nombrada `referencia` que nunca se usa, puede pensar que falta lógica. Si ve `_`, sabe que la omisión es deliberada. Es un detalle pequeño, pero en switches exhaustivos con record patterns hace el código más honesto.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m7` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25).

```bash
./gradlew -q test
./gradlew -q run --args="demo"
```

Resultados observados (resumen):

- `test`: 0 fallas.
- `demo`: procesa pedidos con `switch`/pattern matching sobre pagos sellados y genera auditoría por tipo.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `ClassCastException` en patrón | Suposición de tipo incorrecta | Revisar switch/pattern | Usar sealed + pattern matching exhaustivo |
| Switch no exhaustivo | Falta caso sealed/enum | Error compilación Java moderno | Cubrir todos los casos o default justificado |
| Record mutable por campo mutable | Lista/objeto interno mutable | Mutación externa | Copia defensiva/`List.copyOf` |
| `NullPointerException` al desestructurar | Componente null no esperado | Validar en constructor compacto | Validar invariantes al construir |
| Texto block/formato confuso | Escapes/indentación | Salida inesperada | Usar text blocks y `formatted` con cuidado |

## Cierre

Sealed classes, records y pattern matching se complementan. Los records modelan datos inmutables; las sealed interfaces modelan conjuntos cerrados de casos; el pattern matching permite procesarlos de forma segura y expresiva. Cuando el dominio tiene variantes finitas, esta combinación reduce estados inválidos y convierte muchos errores de mantenimiento en errores de compilación.

## Checklist

- Uso `sealed` cuando el conjunto de subtipos es finito y quiero exhaustividad.
- Uso records para datos inmutables con validación en el constructor compacto.
- Prefiero switches exhaustivos sin `default` cuando la jerarquía sellada lo permite.
- Uso pattern matching para `instanceof` y record patterns para evitar casteos manuales.
- Uso `_` para marcar explícitamente componentes o variables descartadas.
