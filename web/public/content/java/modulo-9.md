# Módulo 9: Pruebas con JUnit, Mockito y calidad

El código que no se puede probar con confianza se vuelve caro de cambiar. Las pruebas no son un ritual después de programar: son feedback sobre el diseño. Si un servicio necesita cinco mocks difíciles de configurar, el diseño probablemente tiene demasiadas responsabilidades o acoplamientos. Si una regla de negocio se puede probar con un input y un output, el dominio está bien aislado.

Este módulo construye `tienda-aurora-testing`: un servicio de pedidos con descuento, inventario externo, repositorio y auditoría. El dominio se prueba con JUnit 5, las dependencias se aíslan con Mockito, los casos repetitivos usan tests parametrizados y una regla simple se verifica con pruebas basadas en propiedades usando jqwik.

## Visual del módulo

<figure class="lesson-figure">
  <img
    src="/visuals/temas/java/modulo-9-testing.html"
    alt="JUnit, Mockito, tests parametrizados y propiedades"
    loading="lazy"
    style="width:100%;max-width:980px;border:1px solid #d7dbe2;border-radius:12px;background:#fbfaf7"
  />
  <figcaption>Reglas unitarias, dobles para dependencias, tablas de casos y propiedades para invariantes.</figcaption>
</figure>

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap

```bash
mkdir -p tienda-aurora-testing/src/main/java/com/aurora/testing/{dominio,servicio}
mkdir -p tienda-aurora-testing/src/test/java/com/aurora/testing/servicio
mkdir -p tienda-aurora-testing/src/test/resources/mockito-extensions
cd tienda-aurora-testing
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4, Mockito 5.17.0, jqwik 1.9.2. Se usó `mock-maker-subclass` para compatibilidad en este runtime.

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-testing"
```

#### `build.gradle.kts`

```kotlin
plugins { java }

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

tasks.test { useJUnitPlatform() }

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

#### `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`

```text
mock-maker-subclass
```

## Dominio y puertos

#### `Pedido.java`

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

#### `ResultadoPedido.java`

```java
package com.aurora.testing.dominio;
import java.math.BigDecimal;
public record ResultadoPedido(String pedidoId, BigDecimal total, boolean aprobado) {}
```

#### Puertos: `InventarioClient`, `PedidoRepository`, `AuditoriaService`

Las interfaces definen dependencias externas. En tests, Mockito las dobla; en producción, una implementación real hablaría con BD o servicio remoto.

```java
package com.aurora.testing.servicio;
public interface InventarioClient { boolean hayStock(String clienteId, int unidades); }
```

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.ResultadoPedido;
public interface PedidoRepository { void guardar(ResultadoPedido resultado); }
```

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.Pedido;
import java.math.BigDecimal;
public interface AuditoriaService { void registrarAprobado(Pedido pedido, BigDecimal total); }
```

## Servicios

#### `DescuentoService.java`

Regla pura: fácil de probar sin mocks. 10% desde 5 unidades.

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

#### `PedidoService.java`

Orquesta dependencias. El test debe verificar comportamiento: guarda resultado, y solo audita cuando aprueba.

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

## Tests

#### `DescuentoServiceTest.java`

JUnit 5: `@BeforeEach` crea estado limpio, `@Test` cubre casos puntuales, `@ParameterizedTest` + `@CsvSource` cubre tabla de casos sin duplicar código.

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

#### `PedidoServiceTest.java`

Mockito aísla dependencias externas. `when` define comportamiento del doble; `verify` confirma interacciones relevantes. No se mockea `DescuentoService` porque es simple y determinista: usar el real da más confianza.

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

#### `DescuentoPropertyTest.java`

jqwik genera muchas entradas y verifica una propiedad: el total nunca es negativo ni mayor que el subtotal. No reemplaza tests de ejemplo; los complementa.

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

### Tema 1: JUnit 6 (Jupiter) — anotaciones y ciclo de vida · Básico · 35 min

JUnit Jupiter es el modelo de programación y ejecución moderno de JUnit. Las anotaciones principales son `@Test`, `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll`, `@DisplayName`, `@Disabled`, `@Nested`. El ciclo de vida por defecto crea una instancia nueva de la clase de test por cada método de test, lo que evita que un test contamine estado de otro.

`@BeforeEach` prepara un estado fresco; debe ser simple. `@AfterEach` limpia recursos externos. `@BeforeAll/@AfterAll` son para setup costoso compartido y deben usarse con cuidado porque introducen acoplamiento entre tests. Las assertions (`assertEquals`, `assertThrows`, `assertTrue`, `assertAll`) expresan el comportamiento esperado. Un buen test tiene Arrange, Act, Assert claros.

**Confusión común:** un test sin assertions útiles. Si solo ejecuta código, puede pasar aunque el comportamiento esté mal. Otro error es probar demasiadas cosas en un test; cuando falla, no sabes por qué.

### Tema 2: Mockito — aislar dependencias · Intermedio · 45 min

Mockito crea dobles de prueba: objetos que simulan dependencias. `@Mock` crea el doble, `@ExtendWith(MockitoExtension.class)` integra el ciclo de vida. `when(...).thenReturn(...)` define comportamiento; `verify(...)` verifica interacciones. `never()` y `verifyNoMoreInteractions()` son útiles, pero no deben usarse por reflejo en cada test porque vuelven la prueba frágil.

El límite de Mockito es conceptual: no mockees lo que puedes usar real. `DescuentoService` es puro y barato; mockearlo solo duplica la implementación en el test. Mockea puertos lentos o externos: BD, HTTP, colas, reloj, filesystem si conviene. El mock debe representar el contrato de la dependencia, no detalles internos.

**Confusión común:** sobre-mockear convierte el test en un espejo de la implementación. El refactor cambia internals y los tests fallan aunque el comportamiento observable sea correcto.

### Tema 3: Tests parametrizados y cobertura · Intermedio · 35 min

`@ParameterizedTest` ejecuta el mismo test con múltiples entradas. `@CsvSource`, `@MethodSource`, `@ValueSource` y `@EnumSource` son fuentes comunes. Sirven para bordes y tablas de decisión: 1, 4, 5, 6 unidades; subtotal válido/inválido; casos límite.

La cobertura de código mide líneas/ramas ejecutadas, no calidad. 100% de cobertura puede coexistir con assertions débiles. Úsala como señal de zonas no probadas, no como objetivo aislado. Prioriza cobertura de reglas de negocio, ramas de error y casos borde.

### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 35 min

Una prueba basada en propiedades define un invariante que debe cumplirse para muchas entradas generadas. En vez de “para 100.00 y 5 unidades espero 90.00”, dices “para cualquier subtotal positivo y cantidad válida, el total no es negativo ni mayor que el subtotal”. jqwik genera valores, encuentra contraejemplos y puede hacer shrinking para reducir el caso mínimo que falla.

Las propiedades buenas son generales pero no triviales. Ejemplos: serializar/deserializar devuelve equivalente, ordenar es idempotente, total nunca negativo, aplicar descuento no supera subtotal. Las propiedades no eliminan tests de ejemplo; los ejemplos documentan casos concretos, las propiedades exploran el espacio.

**Nota honesta:** el generador depende de restricciones. Si permites NaN, infinitos o escalas absurdas, puedes probar algo distinto a tu dominio. Acota los generadores al contrato real.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m9` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4, Mockito 5.17.0, jqwik 1.9.2).

```bash
./gradlew -q test
```

Resultado observado:

- `test`: 0 fallas. Incluye tests JUnit, parametrizados, Mockito y propiedad jqwik.

**Nota honesta:** se configuró `mock-maker-subclass` para compatibilidad del runtime. En entornos con agente Mockito/Byte Buddy soportado, puede no ser necesario.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Test flaky | Dependencia de tiempo/orden/IO/red | Falla intermitente | Aislar, fijar clock, limpiar estado, evitar sleeps |
| Mock oculta bug real | Mockear demasiado o contrato mal asumido | Pasa test, falla en prod | Usar tests de integración/contrato donde importe |
| Cobertura alta, poca confianza | Tests sin assertions útiles | Mutation testing/revisión | Aserciones sobre comportamiento, casos borde |
| Test lento | Levanta contexto pesado innecesario | Tiempo suite | Unit puro para dominio, integración acotada |
| `@BeforeEach` con estado oculto | Setup complejo compartido | Dificultad para leer test | Arrange explícito, helpers claros |

## Cierre

Una suite de pruebas útil es rápida, legible y sensible a regresiones reales. JUnit da estructura, Mockito aísla bordes, los parametrizados cubren tablas, y las propiedades buscan invariantes. El criterio es siempre el mismo: probar comportamiento que importe.

## Checklist

- [ ] Escribo tests con Arrange/Act/Assert claro.
- [ ] Mockeo dependencias externas, no reglas puras simples.
- [ ] Uso parametrizados para tablas de casos.
- [ ] Uso propiedades para invariantes generales.
- [ ] No confundo cobertura con confianza.
