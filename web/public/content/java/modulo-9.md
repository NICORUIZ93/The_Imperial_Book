# Módulo 9: Pruebas con JUnit 5 (Jupiter), Mockito y calidad

Una prueba unitaria es una ejecución pequeña y aislada que compara el comportamiento observable de una unidad con un resultado esperado. Su mecanismo es una aserción: si la condición no se cumple, el test falla. Existe porque el cambio de código tiene un costo que crece con la incertidumbre; una suite rápida convierte esa incertidumbre en feedback inmediato sobre el diseño. Si un servicio necesita cinco dobles complicados, el problema suele ser el acoplamiento, no la falta de mocks.

La implicación es que las pruebas son código de proyecto: hay que elegir qué se aísla, qué se ejecuta realmente y qué se mide. La confusión habitual es confundir “se ejecutó código” con “se verificó comportamiento”, o confundir cobertura de líneas con cobertura de decisiones. En este módulo se construye `tienda-aurora-testing` en `/tmp/opencode/aurora-m9` y se usa JUnit Jupiter 5.13.4 (el BOM declarado en el build), Mockito 5.17.0, jqwik 1.9.2 y JaCoCo.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-9-testing.html`; regeneración: editar el HTML/SVG en esa ruta):** [JUnit, Mockito, tests parametrizados y propiedades](/visuals/temas/java/modulo-9-testing.html)

Lectura: Reglas unitarias, dobles para dependencias, tablas de casos y propiedades para invariantes.

## Proyecto verificado

Directorio: `/tmp/opencode/aurora-m9`. El build declara JUnit con `org.junit:junit-bom:5.13.4`; no hay JUnit 6 en este proyecto.

```text
/tmp/opencode/aurora-m9/
├── build.gradle.kts
├── settings.gradle.kts
├── src/main/java/com/aurora/testing/
│   ├── dominio/      Pedido.java, ResultadoPedido.java
│   └── servicio/     DescuentoService.java, PedidoService.java, puertos
└── src/test/
    ├── java/com/aurora/testing/servicio/   3 clases de test
    └── resources/mockito-extensions/       org.mockito.plugins.MockMaker
```

## Prerrequisitos

```bash
java -version
gradle --version
```

Entorno observado: JDK 27.0.1.0.2 (Temurin), Gradle 9.9.1, toolchain Java 25, macOS arm64. Se configuró `mock-maker-subclass` para compatibilidad con este runtime.

## Bootstrap

```bash
mkdir -p tienda-aurora-testing/src/main/java/com/aurora/testing/{dominio,servicio}
mkdir -p tienda-aurora-testing/src/test/java/com/aurora/testing/servicio
mkdir -p tienda-aurora-testing/src/test/resources/mockito-extensions
cd tienda-aurora-testing
gradle wrapper --gradle-version 9.9.1
```

## Código completo, archivo por archivo

Ruta base para este bloque: `/tmp/opencode/aurora-m9/`.

**`settings.gradle.kts`**

```kotlin
rootProject.name = "tienda-aurora-testing"
```

**`build.gradle.kts`**

```kotlin
plugins {
    java
    jacoco
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain { languageVersion = JavaLanguageVersion.of(25) }
}

repositories { mavenCentral() }

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.mockito:mockito-core:5.17.0")
    testImplementation("org.mockito:mockito-junit-jupiter:5.17.0")
    testImplementation("net.jqwik:jqwik:1.9.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

El plugin `jacoco` instrumenta las clases durante la ejecución de tests y `jacocoTestReport` convierte los datos binarios en XML y HTML. `finalizedBy` garantiza que el reporte se genere incluso cuando la tarea `test` ya estaba al día.

**`src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`**

```text
mock-maker-subclass
```

#### Dominio y puertos

**`src/main/java/com/aurora/testing/dominio/Pedido.java`**

```java
package com.aurora.testing.dominio;
import java.math.BigDecimal;
import java.util.Objects;
public record Pedido(String id, String clienteId, BigDecimal subtotal, int unidades) {
    public Pedido {
        Objects.requireNonNull(id); Objects.requireNonNull(clienteId); Objects.requireNonNull(subtotal);
        if (subtotal.signum() < 0) throw new IllegalArgumentException("subtotal negativo");
        if (unidades <= 0) throw new IllegalArgumentException("unidades inválidas");
    }
}
```

**`src/main/java/com/aurora/testing/dominio/ResultadoPedido.java`**

```java
package com.aurora.testing.dominio;
import java.math.BigDecimal;
public record ResultadoPedido(String pedidoId, BigDecimal total, boolean aprobado) {}
```

**`src/main/java/com/aurora/testing/servicio/InventarioClient.java`**

```java
package com.aurora.testing.servicio;
public interface InventarioClient { boolean hayStock(String clienteId, int unidades); }
```

**`src/main/java/com/aurora/testing/servicio/PedidoRepository.java`**

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.ResultadoPedido;
public interface PedidoRepository { void guardar(ResultadoPedido resultado); }
```

**`src/main/java/com/aurora/testing/servicio/AuditoriaService.java`**

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.Pedido;
import java.math.BigDecimal;
public interface AuditoriaService { void registrarAprobado(Pedido pedido, BigDecimal total); }
```

Las interfaces son puertos: en producción las implementaría una base de datos o un servicio remoto; en tests las reemplaza un doble.

#### Servicios

**`src/main/java/com/aurora/testing/servicio/DescuentoService.java`**

```java
package com.aurora.testing.servicio;
import java.math.BigDecimal;
import java.math.RoundingMode;
public final class DescuentoService {
    public BigDecimal aplicar(BigDecimal subtotal, int unidades) {
        if (subtotal == null || subtotal.signum() < 0) throw new IllegalArgumentException("subtotal inválido");
        if (unidades <= 0) throw new IllegalArgumentException("unidades inválidas");
        BigDecimal porcentaje = unidades >= 5 ? new BigDecimal("0.10") : BigDecimal.ZERO;
        BigDecimal descuento = subtotal.multiply(porcentaje);
        return subtotal.subtract(descuento).setScale(2, RoundingMode.HALF_UP);
    }
}
```

Es una regla pura: no necesita mocks. Las líneas 6 y 7 contienen validaciones; más adelante se comprueba con JaCoCo que no todas sus ramas están cubiertas.

**`src/main/java/com/aurora/testing/servicio/PedidoService.java`**

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.Pedido;
import com.aurora.testing.dominio.ResultadoPedido;
import java.math.BigDecimal;
import java.util.Objects;
public final class PedidoService {
    private final DescuentoService descuentoService;
    private final InventarioClient inventario;
    private final PedidoRepository repository;
    private final AuditoriaService auditoria;
    public PedidoService(DescuentoService descuentoService, InventarioClient inventario, PedidoRepository repository, AuditoriaService auditoria) {
        this.descuentoService = Objects.requireNonNull(descuentoService);
        this.inventario = Objects.requireNonNull(inventario);
        this.repository = Objects.requireNonNull(repository);
        this.auditoria = Objects.requireNonNull(auditoria);
    }
    public ResultadoPedido procesar(Pedido pedido) {
        Objects.requireNonNull(pedido, "pedido");
        boolean aprobado = inventario.hayStock(pedido.clienteId(), pedido.unidades());
        BigDecimal total = descuentoService.aplicar(pedido.subtotal(), pedido.unidades());
        ResultadoPedido resultado = new ResultadoPedido(pedido.id(), total, aprobado);
        repository.guardar(resultado);
        if (aprobado) {
            auditoria.registrarAprobado(pedido, total);
        }
        return resultado;
    }
}
```

#### Tests

**`src/test/java/com/aurora/testing/servicio/DescuentoServiceTest.java`**

```java
package com.aurora.testing.servicio;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class DescuentoServiceTest {

    private DescuentoService service;

    @BeforeEach
    void setUp() {
        service = new DescuentoService();
    }

    @Test
    void sinDescuentoParaPocasUnidades() {
        BigDecimal total = service.aplicar(new BigDecimal("100.00"), 2);
        assertEquals(new BigDecimal("100.00"), total);
    }

    @Test
    void aplicaDiezPorCientoDesdeCincoUnidades() {
        BigDecimal total = service.aplicar(new BigDecimal("100.00"), 5);
        assertEquals(new BigDecimal("90.00"), total);
    }

    @Test
    void rechazaSubtotalInvalido() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> service.aplicar(new BigDecimal("-1"), 1));
        assertEquals("subtotal inválido", error.getMessage());
    }

    @ParameterizedTest
    @CsvSource({
            "100.00,1,100.00",
            "100.00,4,100.00",
            "100.00,5,90.00",
            "50.00,6,45.00",
            "19.99,5,17.99"
    })
    void calculaTotalesEsperados(String subtotal, int unidades, String esperado) {
        assertEquals(new BigDecimal(esperado), service.aplicar(new BigDecimal(subtotal), unidades));
    }
}
```

**`src/test/java/com/aurora/testing/servicio/PedidoServiceTest.java`**

```java
package com.aurora.testing.servicio;

import com.aurora.testing.dominio.Pedido;
import com.aurora.testing.dominio.ResultadoPedido;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock private InventarioClient inventario;
    @Mock private PedidoRepository repository;
    @Mock private AuditoriaService auditoria;

    @Test
    void apruebaPedidoCuandoHayStock() {
        Pedido pedido = new Pedido("PED-1", "CLI-1", new BigDecimal("100.00"), 5);
        when(inventario.hayStock("CLI-1", 5)).thenReturn(true);
        PedidoService service = new PedidoService(new DescuentoService(), inventario, repository, auditoria);

        ResultadoPedido resultado = service.procesar(pedido);

        assertTrue(resultado.aprobado());
        assertEquals(new BigDecimal("90.00"), resultado.total());
        verify(inventario).hayStock("CLI-1", 5);
        verify(repository).guardar(resultado);
        verify(auditoria).registrarAprobado(pedido, new BigDecimal("90.00"));
        verifyNoMoreInteractions(auditoria);
    }

    @Test
    void rechazaPedidoSinAuditoriaCuandoNoHayStock() {
        Pedido pedido = new Pedido("PED-2", "CLI-2", new BigDecimal("50.00"), 1);
        when(inventario.hayStock("CLI-2", 1)).thenReturn(false);
        PedidoService service = new PedidoService(new DescuentoService(), inventario, repository, auditoria);

        ResultadoPedido resultado = service.procesar(pedido);

        assertFalse(resultado.aprobado());
        assertEquals(new BigDecimal("50.00"), resultado.total());
        verify(repository).guardar(resultado);
        verify(auditoria, never()).registrarAprobado(any(), any());
    }
}
```

**`src/test/java/com/aurora/testing/servicio/DescuentoPropertyTest.java`**

```java
package com.aurora.testing.servicio;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.IntRange;
import net.jqwik.api.constraints.Positive;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class DescuentoPropertyTest {

    private final DescuentoService service = new DescuentoService();

    @Property
    void totalNuncaEsNegativoNiMayorQueSubtotal(
            @ForAll @Positive double subtotalRaw,
            @ForAll @IntRange(min = 1, max = 100) int unidades) {
        BigDecimal subtotal = BigDecimal.valueOf(subtotalRaw);
        BigDecimal total = service.aplicar(subtotal, unidades);
        assertTrue(total.signum() >= 0);
        assertTrue(total.compareTo(subtotal.setScale(2, java.math.RoundingMode.HALF_UP)) <= 0);
    }
}
```

## Comandos ejecutados y salida observada

```bash
cd /tmp/opencode/aurora-m9
./gradlew -q test --rerun-tasks
```

La ejecución terminó con exit 0. Los XML de `build/test-results/test/` registran:

```text
<testsuite name="com.aurora.testing.servicio.DescuentoPropertyTest" tests="1" skipped="0" failures="0" errors="0" time="0.101">
<testsuite name="com.aurora.testing.servicio.DescuentoServiceTest" tests="8" skipped="0" failures="0" errors="0" time="0.047">
<testsuite name="com.aurora.testing.servicio.PedidoServiceTest" tests="2" skipped="0" failures="0" errors="0" time="0.276">
```

Son 11 tests JUnit, 0 fallas. La salida de jqwik incluida en el XML de la propiedad indica:

```text
tries = 1000                  | # of calls to property
checks = 1000                 | # of not rejected calls
```

El reporte se generó en `build/reports/jacoco/test/html/index.html` y `build/reports/jacoco/test/jacocoTestReport.xml`. La fila `Total` del HTML muestra:

```text
Total  15 of 156  90%  4 of 14  71%  4  13  0  26  0  6  0  4
```

Los contadores del XML, que dan el mismo resultado con más detalle:

```text
INSTRUCTION  missed 15  covered 141
BRANCH       missed 4   covered 10
LINE         missed 0   covered 26
METHOD       missed 0   covered 6
CLASS        missed 0   covered 4
```

Las líneas con branches sin cubrir, según el reporte generado, son:

```text
DescuentoService.java  line 6  instr missed/covered 0 10  branch missed/covered 1 3
DescuentoService.java  line 7  instr missed/covered 5 2   branch missed/covered 1 1
Pedido.java            line 7  instr missed/covered 5 3   branch missed/covered 1 1
Pedido.java            line 8  instr missed/covered 5 2   branch missed/covered 1 1
```

La rama de `DescuentoService` en la línea 7 (`if (unidades <= 0)`) nunca entra: ningún test pasa `unidades` igual a 0 o negativo. En `Pedido`, las líneas 7 y 8 corresponden a `subtotal negativo` y `unidades inválidas`; la primera validación se ejecuta, la segunda no. Coinciden con el código transcrito más arriba.

## Conceptos cubiertos

### Tema 1: JUnit Jupiter 5.13.4 — anotaciones y ciclo de vida · Básico · 35 min

El build usa JUnit Jupiter **5.13.4** mediante `org.junit:junit-bom`. Jupiter es el modelo de programación: `@Test` marca un método ejecutable, `@BeforeEach` y `@AfterEach` envuelven cada test, `@BeforeAll` y `@AfterAll` el conjunto, y `@DisplayName`, `@Disabled` y `@Nested` organizan la suite. Las aserciones (`assertEquals`, `assertThrows`, `assertTrue`, `assertAll`) convierten la expectativa en una condición verificable.

**Mecanismo.** El motor de JUnit descubre tests anotados, crea una instancia nueva de la clase por método (ciclo de vida por defecto) y ejecuta los callbacks de ciclo de vida antes y después de cada uno. JUnit Platform es la capa que permite que motores distintos —Jupiter, jqwik— convivan en la misma ejecución; por eso `testRuntimeOnly("org.junit.platform:junit-platform-launcher")` pertenece al classpath de ejecución.

**Por qué existe.** El aislamiento entre instancias evita que un test modifique el estado que recibe el siguiente. Los callbacks centralizan preparación y limpieza sin repetir código en cada método.

**Implicaciones.** `@BeforeEach` debe ser simple y determinista. `@BeforeAll` introduce estado compartido y acoplamiento entre tests. Un test con varias responsabilidades falla sin indicar cuál se rompió; un test sin aserciones útiles puede pasar aunque el comportamiento sea incorrecto.

**Confusión común.** Suponer la versión de JUnit por el nombre comercial del producto. La versión ejecutada se lee en el build: aquí `org.junit:junit-bom:5.13.4`; las clases importadas son `org.junit.jupiter.api.*`.

### Tema 2: Mockito — aislar dependencias · Intermedio · 45 min

**Mecanismo.** Un doble de prueba sustituye una dependencia. `@Mock` crea el objeto, `@ExtendWith(MockitoExtension.class)` integra su ciclo de vida con JUnit, `when(...).thenReturn(...)` define el comportamiento del doble y `verify(...)` comprueba las interacciones. `never()` y `verifyNoMoreInteractions(...)` restringen qué llamadas se permiten.

**Por qué existe.** Probar `PedidoService` no debería exigir una base de datos ni un inventario remoto. El mock representa el contrato del puerto: devuelve `true` o `false` para `hayStock` y deja que la regla de descuento real se ejecute.

**Implicaciones.** Los mocks hacen el test rápido y determinista, pero solo verifican lo que el test declara. Un mock con un contrato mal asumido produce un test verde y una falla en producción; por eso los contratos de integración reales necesitan pruebas de integración o de contrato además de mocks. El archivo `mock-maker-subclass` se añadió para que la creación de dobles funcione en este JDK 27.

**Confusión común.** Mockear todo, incluida `DescuentoService`, que es pura y barata. Eso duplica la lógica en el test y hace que un refactor interno rompa pruebas aunque el comportamiento observable siga correcto.

### Tema 3: Tests parametrizados y cobertura · Intermedio · 35 min

**Mecanismo.** `@ParameterizedTest` ejecuta un mismo cuerpo con datos de una fuente. `@CsvSource` convierte cada fila en argumentos; el resultado son 8 ejecuciones dentro de `DescuentoServiceTest` sin duplicar código. JaCoCo, por su parte, instrumenta bytecode y cuenta instrucciones, ramas, líneas, métodos y clases ejecutadas.

**Por qué existe.** Las tablas de casos hacen explícitos los bordes (1, 4, 5 y 6 unidades; `19.99`). La cobertura señala zonas que ningún test visita; es una señal de dónde mirar, no una medida de calidad de las aserciones.

**Implicaciones medidas en este proyecto.** Las líneas están al 100% (26 de 26), pero las ramas están al 71% (10 de 14). Esa diferencia es la prueba de que “todas las líneas ejecutadas” no implica “todas las decisiones probadas”: la línea `if (unidades <= 0)` se ejecuta, pero su rama `throw` no. La cobertura de instrucciones es 90% (141 de 156) y la de ramas 71%. Si se quiere cerrar esa brecha, el siguiente test a escribir es `assertThrows` con `unidades = 0`.

**Confusión común.** Fijar 100% de cobertura de líneas como objetivo. Se alcanza ejecutando sentencias sin aseverar nada. Un objetivo útil es cubrir ramas de reglas de negocio y de error, y revisar qué significan los números: aquí 0 líneas perdidas conviven con 4 ramas perdidas.

### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 35 min

**Mecanismo.** Una propiedad describe un invariante y un generador produce entradas. jqwik ejecutó 1000 intentos sobre `@Positive double subtotalRaw` y `@IntRange(min = 1, max = 100) int unidades`, verificando que el total no es negativo ni supera el subtotal. Si aparece un contraejemplo, el shrinking reduce el caso mínimo que falla.

**Por qué existe.** Los tests de ejemplo documentan casos concretos; las propiedades exploran el espacio de entradas que una persona no escribiría a mano. Encuentran casos límite inesperados sin multiplicar líneas de test.

**Implicaciones.** La propiedad depende de los generadores: acotar `unidades` a 1..100 y exigir `subtotalRaw` positivo define el dominio válido. Permitir NaN, infinitos o escalas absurdas probaría un contrato distinto. Las propiedades complementan, no reemplazan, los tests de ejemplo.

**Confusión común.** Creer que una propiedad con 1000 intentos sustituye la cobertura de ramas. En este proyecto la propiedad se ejecuta y aporta confianza sobre el invariante, pero JaCoCo sigue marcando las ramas de validación de `DescuentoService` como no cubiertas porque el generador nunca produce valores inválidos.

## Verificación real

Ejecutado el 2026-11-23 en `/tmp/opencode/aurora-m9` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, JUnit Jupiter 5.13.4, Mockito 5.17.0, jqwik 1.9.2, JaCoCo incluido en Gradle).

| Comando (desde `/tmp/opencode/aurora-m9`) | Resultado observado |
|---|---|
| `./gradlew -q test --rerun-tasks` | exit 0; 3 suites, 11 tests, 0 fallas, 0 errores, 0 omitidos |
| Lectura de `build/test-results/test/TEST-*.xml` | `DescuentoServiceTest` 8, `PedidoServiceTest` 2, `DescuentoPropertyTest` 1 |
| jqwik en el XML de la propiedad | `tries = 1000`, `checks = 1000` |
| `jacocoTestReport` (vía `finalizedBy`) | `build/reports/jacoco/test/jacocoTestReport.xml` y HTML generados |
| Contadores JaCoCo | ramas 10/14 (71%), líneas 26/26 (100%), instrucciones 141/156 (90%) |

No se ejecutó mutation testing ni un umbral de cobertura automático; los números transcritos son los del reporte generado en esa corrida.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Test flaky | Dependencia de tiempo, orden, IO o red | Falla intermitente entre corridas | Aislar, fijar reloj, limpiar estado, evitar sleeps |
| Mock oculta un bug real | Mockear demasiado o asumir mal el contrato | Pasa el test, falla en integración | Usar el objeto real cuando sea barato; añadir tests de contrato |
| Cobertura alta, poca confianza | Aserciones débiles o solo cobertura de líneas | 100% de líneas con 71% de ramas en este proyecto | Aserciones sobre comportamiento y tests de ramas de error |
| Ramas sin cubrir tras parametrizar | Las fuentes solo producen entradas válidas | Reporte JaCoCo por línea | Añadir casos inválidos explícitos, por ejemplo `unidades = 0` |
| `MockitoException` al crear dobles | Mock maker incompatible con el JDK | Falla al inicializar `@Mock` | `mock-maker-subclass` en `src/test/resources/mockito-extensions/` |
| Propiedad sin sentido | Generador fuera del contrato | Contraejemplos con NaN/infinitos/escalas extremas | Restringir con `@Positive`, `@IntRange` y conversiones controladas |
| `@BeforeEach` ilegible | Setup complejo compartido | El test no se entiende sin leer la configuración | Arrange explícito dentro del test y helpers con nombre claro |

## Cierre

Una suite útil es rápida, legible y sensible a regresiones reales. JUnit da estructura, Mockito aísla bordes, los parametrizados cubren tablas de casos, jqwik explora invariantes y JaCoCo muestra qué zonas no se ejecutaron. El criterio sigue siendo probar comportamiento que importe y leer los números con precisión.

## Checklist

- Escribo tests con Arrange/Act/Assert claro.
- Mockeo dependencias externas, no reglas puras simples.
- Uso parametrizados para tablas de casos.
- Uso propiedades para invariantes generales con generadores acotados al contrato.
- Genero y leo el reporte JaCoCo, distinguiendo cobertura de líneas y de ramas.
