# Módulo 9: Testing con JUnit 6 (Jupiter) y Mockito


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 9 — mapa visual](/visuals/temas/java/modulo-9-streams.html)

Lectura: Un stream es lazy: las intermedias describen el pipeline y la terminal dispara la ejecución.


Un cambio en Tienda Aurora puede romper el cálculo de descuentos, saltarse una auditoría o guardar un pedido rechazado como aprobado. Sin tests, ese error se descubre tarde y lejos del cambio. Con tests, se descubre cerca, con un nombre claro y una señal repetible. El objetivo no es “tener cobertura”, sino proteger contratos importantes con pruebas rápidas y confiables.

Este módulo construye `tienda-aurora-testing`, un pequeño dominio de pedidos con una regla pura de descuento y un servicio que coordina inventario, persistencia y auditoría. Es el escenario justo para aprender la diferencia entre test unitario, mock y property-based test.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, JUnit Jupiter 5.13.4, Mockito 5.17.0, jqwik 1.9.2, macOS arm64. `./gradlew -q test` pasó con 11 tests, 0 fallas. Se configuró `mock-maker-subclass` para Mockito en este JDK.

## Proyecto desde cero: tienda-aurora-testing

## Prerrequisitos

```bash
java -version
gradle --version
```

## Estructura del proyecto

```text
tienda-aurora-testing/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/testing/
    │   ├── dominio/
    │   │   ├── Pedido.java
    │   │   └── ResultadoPedido.java
    │   └── servicio/
    │       ├── AuditoriaService.java
    │       ├── DescuentoService.java
    │       ├── InventarioClient.java
    │       ├── PedidoRepository.java
    │       └── PedidoService.java
    └── test/
        ├── java/com/aurora/testing/servicio/
        │   ├── DescuentoPropertyTest.java
        │   ├── DescuentoServiceTest.java
        │   └── PedidoServiceTest.java
        └── resources/mockito-extensions/
            └── org.mockito.plugins.MockMaker
```

## Código completo

Nombre del proyecto.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-testing"
```

Configura Java 25, JUnit Jupiter 5.13.4, Mockito 5.17.0 y jqwik 1.9.2. `useJUnitPlatform()` es necesario porque JUnit Jupiter corre sobre JUnit Platform. `mockito-extensions/org.mockito.plugins.MockMaker` con `mock-maker-subclass` se usa en el proyecto verificado para evitar problemas del inline mock maker en este JDK.

**Archivo:** `build.gradle.kts`

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

tasks.test {
    useJUnitPlatform()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Werror"))
}
```

Record de dominio con invariantes básicas. Los tests deben poder construir estados válidos fácilmente y fallar ante estados inválidos.

**Archivo:** `src/main/java/com/aurora/testing/dominio/Pedido.java`

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

Resultado explícito del procesamiento: id, total calculado y si fue aprobado.

**Archivo:** `src/main/java/com/aurora/testing/dominio/ResultadoPedido.java`

```java
package com.aurora.testing.dominio;
import java.math.BigDecimal;
public record ResultadoPedido(String pedidoId, BigDecimal total, boolean aprobado) {}
```

Regla de negocio pura: si hay 5 o más unidades aplica 10%. Al no depender de IO ni de repositorios, se prueba con tests unitarios rápidos.

**Archivo:** `src/main/java/com/aurora/testing/servicio/DescuentoService.java`

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

Puerto para consultar stock. En tests unitarios se reemplaza por un mock para no depender de red o base de datos.

**Archivo:** `src/main/java/com/aurora/testing/servicio/InventarioClient.java`

```java
package com.aurora.testing.servicio;
public interface InventarioClient {
    boolean hayStock(String clienteId, int unidades);
}
```

Puerto de persistencia. El servicio lo invoca; el test verifica esa interacción.

**Archivo:** `src/main/java/com/aurora/testing/servicio/PedidoRepository.java`

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.ResultadoPedido;
public interface PedidoRepository {
    void guardar(ResultadoPedido resultado);
}
```

Puerto de auditoría. Solo debe llamarse cuando el pedido se aprueba.

**Archivo:** `src/main/java/com/aurora/testing/servicio/AuditoriaService.java`

```java
package com.aurora.testing.servicio;
import com.aurora.testing.dominio.Pedido;
import java.math.BigDecimal;
public interface AuditoriaService {
    void registrarAprobado(Pedido pedido, BigDecimal total);
}
```

Orquesta la regla: consulta stock, calcula total con `DescuentoService`, guarda resultado y audita solo si fue aprobado. Es el caso ideal para Mockito: tiene dependencias externas y lógica de coordinación.

**Archivo:** `src/main/java/com/aurora/testing/servicio/PedidoService.java`

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

Tests unitarios con JUnit Jupiter. `@BeforeEach` crea el servicio antes de cada test. `@Test` cubre casos felices y de error. `@ParameterizedTest` con `@CsvSource` evita duplicar la misma prueba para varios datos.

**Archivo:** `src/test/java/com/aurora/testing/servicio/DescuentoServiceTest.java`

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

Tests con Mockito. `@ExtendWith(MockitoExtension.class)` inicializa mocks. `when(...)` define comportamiento del stub/mock. `verify(...)` comprueba interacciones. `never()` asegura que la auditoría no se llamó cuando el pedido no fue aprobado.

**Archivo:** `src/test/java/com/aurora/testing/servicio/PedidoServiceTest.java`

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

    @Mock
    private InventarioClient inventario;

    @Mock
    private PedidoRepository repository;

    @Mock
    private AuditoriaService auditoria;

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

Prueba basada en propiedades con jqwik. En vez de ejemplos sueltos, declara una regla: para cualquier subtotal positivo y unidades entre 1 y 100, el total no es negativo y no supera el subtotal. jqwik genera muchos casos automáticamente.

**Archivo:** `src/test/java/com/aurora/testing/servicio/DescuentoPropertyTest.java`

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

Configura Mockito para usar `mock-maker-subclass`. Es una decisión de compatibilidad del entorno verificado; se documenta porque afecta cómo corren los mocks.

**Archivo:** `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`

```text
mock-maker-subclass
```

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
```

Salida esperada: el build termina sin fallos. En la verificación real se ejecutaron 11 tests (5 unitarios parametrizados/casos, 2 con Mockito, 1 property con 1000 intentos reportados por jqwik) y todos pasaron.

## Conceptos cubiertos

### Tema 1: JUnit 6 (Jupiter) — anotaciones y ciclo de vida · Avanzado · 40 min

JUnit Jupiter es la API de programación y extensión de JUnit 5/6. Un test es un método que verifica un contrato. `@Test` marca el método. `@BeforeEach` ejecuta preparación antes de cada test, lo que evita compartir estado mutable entre pruebas. `assertEquals`, `assertTrue` y `assertThrows` expresan lo que esperas.

En `DescuentoServiceTest`, la regla se prueba sin base de datos ni HTTP:

```java
@BeforeEach
void setUp() {
    service = new DescuentoService();
}

@Test
void aplicaDiezPorCientoDesdeCincoUnidades() {
    BigDecimal total = service.aplicar(new BigDecimal("100.00"), 5);
    assertEquals(new BigDecimal("90.00"), total);
}
```

La ventaja de este test es que es barato y preciso. Si falla, el problema está en la regla de descuento, no en la red. `assertThrows` también importa: no solo prueba el “camino feliz”, sino el contrato de error.

### Tema 2: Mockito — aislar dependencias · Avanzado · 45 min

Mockito sirve para aislar la unidad bajo prueba cuando tiene dependencias. `PedidoService` necesita inventario, repositorio y auditoría. En un unit test no queremos una base real ni un servicio externo; queremos controlar esas dependencias y observar cómo interactúa el servicio.

```java
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
        verify(repository).guardar(resultado);
        verify(auditoria).registrarAprobado(pedido, new BigDecimal("90.00")); 
    }
}
```

`when(...).thenReturn(...)` define el comportamiento del doble. `verify(...)` comprueba que ocurrió una interacción. `never()` comprueba que no ocurrió. Un mock no es magia: es un objeto controlado para observar colaboraciones. No lo uses para reemplazar la lógica que realmente quieres probar; úsalo en las fronteras.

**Nota de verificación:** Mockito 5.17.0 funcionó en este entorno con JDK 25 usando `mock-maker-subclass` en `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`. Sin esa configuración, el inline mock maker falló al crear mocks de interfaces en el JDK verificado. Documenta siempre este tipo de ajuste de runtime de test.

### Tema 3: Tests parametrizados y cobertura · Intermedio · 35 min

Un test parametrizado ejecuta la misma lógica con varios datos. Evita copiar/pegar cinco tests casi iguales. En `DescuentoServiceTest`, `@ParameterizedTest` y `@CsvSource` declaran entradas y salidas esperadas:

```java
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
```

La cobertura (JaCoCo, por ejemplo) mide qué líneas o ramas ejecutaron los tests. Es útil para encontrar zonas ciegas, pero una cobertura alta no garantiza buen testing. Puedes ejecutar una línea sin afirmar nada importante. Usa cobertura como radar, no como objetivo absoluto.

### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 40 min

Los tests basados en ejemplos dicen “para este input, este output”. Las pruebas basadas en propiedades dicen “para todos los inputs de este dominio, esta regla debe cumplirse”. jqwik genera muchos valores y busca contraejemplos.

```java
@Property
void totalNuncaEsNegativoNiMayorQueSubtotal(
        @ForAll @Positive double subtotalRaw,
        @ForAll @IntRange(min = 1, max = 100) int unidades) {
    BigDecimal subtotal = BigDecimal.valueOf(subtotalRaw);
    BigDecimal total = service.aplicar(subtotal, unidades);
    assertTrue(total.signum() >= 0);
    assertTrue(total.compareTo(subtotal.setScale(2, java.math.RoundingMode.HALF_UP)) <= 0);
}
```

Esta propiedad no reemplaza los ejemplos concretos; los complementa. Los ejemplos son fáciles de leer y depurar. Las propiedades cubren mucho más terreno. En la ejecución verificada, jqwik reportó `tries = 1000, checks = 1000`.

## Cierre

Un buen suite de tests mezcla niveles: unitarios rápidos para reglas puras, tests con mocks para coordinación entre componentes, parametrizados para tablas de casos y propiedades para invariantes. La clave es que cada test tenga un motivo claro y falle por una razón útil.

## Checklist

- Cada test tiene un nombre que describe el contrato o comportamiento.
- Uso `@BeforeEach` para estado común, sin compartir estado mutable entre tests.
- Uso mocks en fronteras; no mockeo la lógica que estoy probando.
- Uso tests parametrizados para evitar duplicación de casos.
- Uso cobertura como indicador, no como meta vacía.
- Considero property-based tests cuando hay invariantes que deben valer para muchos inputs.
