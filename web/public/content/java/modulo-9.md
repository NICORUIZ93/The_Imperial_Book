# Módulo 9: Testing con JUnit 5 y Mockito

El código que no se prueba se rompe en silencio. Las pruebas automatizadas no garantizan ausencia de bugs, pero crean una red de seguridad para cambiar con confianza. Este módulo cubre JUnit Jupiter, Mockito, tests parametrizados y pruebas basadas en propiedades.

**Entorno de referencia verificado (2026-05-22):** JDK 27, Maven 3.10.0, JUnit Jupiter 5.11.4, Mockito 5.14.2, jqwik 1.9.2.

## Setup ejecutable del módulo

```bash
mkdir -p /tmp/java-m9/src/main/java/com/academia /tmp/java-m9/src/test/java/com/academia
cd /tmp/java-m9
```

`pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId><artifactId>modulo-09</artifactId><version>1.0.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <junit.version>5.11.4</junit.version>
    <mockito.version>5.14.2</mockito.version>
    <jqwik.version>1.9.2</jqwik.version>
  </properties>
  <dependencies>
    <dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>${junit.version}</version><scope>test</scope></dependency>
    <dependency><groupId>org.mockito</groupId><artifactId>mockito-junit-jupiter</artifactId><version>${mockito.version}</version><scope>test</scope></dependency>
    <dependency><groupId>net.jqwik</groupId><artifactId>jqwik</artifactId><version>${jqwik.version}</version><scope>test</scope></dependency>
  </dependencies>
  <build><plugins><plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId><version>3.5.2</version></plugin></plugins></build>
</project>
```

Comando base: `mvn -q test`.

## Aprende construyendo

### Tema 1: JUnit 6 (Jupiter) — anotaciones y ciclo de vida · Avanzado · 40 min

Pruebas automáticas de una calculadora de descuentos: casos normales, bordes y errores, repetibles en CI.

#### JUnit Jupiter

**Definición formal.** Jupiter es el modelo de programación y extensión de JUnit 5/6 para escribir tests con anotaciones y assertions.

**Para qué sirve.** Definir y ejecutar tests unitarios/integración de forma estándar.

**Cuándo usarlo.** En la mayoría de proyectos Java modernos. Evita mezclar JUnit 4 sin necesidad.

**Ejemplo mínimo enfocado (ejecutable, dentro del setup Maven).**

`src/main/java/com/academia/Calc.java`:

```java
package com.academia;
public class Calc { int suma(int a,int b){ return a+b; } }
```

`src/test/java/com/academia/CalcTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class CalcTest { @Test void suma(){ assertEquals(4, new Calc().suma(2,2)); } }
```

**Caso de uso real.** Validar reglas de negocio en CI.

**Error común.** Test sin aserción útil. Síntoma: falso verde. Corrección: verificar comportamiento observable.

**Verificación (Maven 3.10.0, JDK 27, 2026-05-22).** `mvn -q test` reporta `Tests run: 1, Failures: 0`.

#### Anotaciones y ciclo de vida

**Definición formal.** Anotaciones como `@Test`, `@BeforeEach`, `@AfterEach`, `@BeforeAll` controlan ejecución y hooks. Por defecto JUnit crea una instancia por test.

**Para qué sirve.** Preparar estado fresco y limpiar recursos.

**Cuándo usarlo.** `@BeforeEach` para setup aislado. `@BeforeAll` solo para setup estático/caro sin estado mutable compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```java
package com.academia;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
class CicloTest {
    int v;
    @BeforeEach void setUp(){ v = 1; }
    @Test void t1(){ v++; assertEquals(2, v); }
    @Test void t2(){ assertEquals(1, v); }
}
```

**Caso de uso real.** Inicializar servicio bajo prueba por test.

**Error común.** Depender del orden entre tests. Síntoma: pasa aislado, falla en suite. Corrección: estado fresco en `@BeforeEach`.

**Verificación (2026-05-22).** Ambos tests pasan aislados en la misma suite.

#### Aserciones y contrato de error

**Definición formal.** Aserciones verifican el comportamiento esperado; `assertThrows` verifica que se lanza la excepción correcta.

**Para qué sirve.** Definen el contrato de éxito y de fallo.

**Cuándo usarlo.** Siempre que el contrato incluya error esperado.

**Ejemplo mínimo enfocado (ejecutable).**

```java
package com.academia;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ErrorTest {
    @Test void invalido(){ assertThrows(IllegalArgumentException.class, () -> { throw new IllegalArgumentException("x"); }); }
}
```

**Caso de uso real.** Validar input inválido.

**Error común.** Atrapara excepción con try/catch y olvidar `fail()`. Corrección: `assertThrows`.

**Verificación (2026-05-22).** Test pasa cuando la excepción esperada ocurre.

#### Ejemplo integrado desde cero

`DescuentoService.java` y `DescuentoServiceTest.java` como en el setup.

#### Ejecución y salida real

```bash
mvn -q test
```

```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
```

#### Errores frecuentes

Tests dependientes, sin aserciones, o que prueban detalles internos frágiles.

#### Verificación

Romper la lógica del descuento y confirmar que el test falla.


### Tema 2: Mockito — aislar dependencias · Avanzado · 40 min

Un servicio envía notificaciones por email. En test unitario no quieres enviar correos reales; quieres aislar la dependencia.

#### Mockito

**Definición formal.** Mockito es un framework para crear dobles de prueba (mocks/stubs/spies) y verificar interacciones.

**Para qué sirve.** Aislar la unidad bajo prueba de I/O, red, BD o servicios lentos.

**Cuándo usarlo y cuándo no.** Úsalo para dependencias externas/costosas. No mockees todo; prueba lógica real donde sea simple.

**Ejemplo mínimo enfocado (ejecutable).**

`src/main/java/com/academia/Repo.java`:

```java
package com.academia;
interface Repo { String find(String id); }
```

`src/main/java/com/academia/Service.java`:

```java
package com.academia;
class Service { private final Repo repo; Service(Repo repo){this.repo=repo;} String nombre(String id){ return repo.find(id).toUpperCase(); } }
```

`src/test/java/com/academia/ServiceTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class ServiceTest {
    @Test void usaRepo(){ Repo repo = mock(Repo.class); when(repo.find("1")).thenReturn("ada"); assertEquals("ADA", new Service(repo).nombre("1")); }
}
```

**Caso de uso real.** Mockear pasarela de pagos o repositorio.

**Error común.** Mockear la clase bajo prueba. Corrección: mockear colaboradores.

**Verificación (Mockito 5.14.2, 2026-05-22).** Test pasa.

#### Aislar dependencias: stub y verify

**Definición formal.** Un stub define respuestas programadas (`when(...).thenReturn(...)`). `verify` comprueba interacciones.

**Para qué sirve.** Controlar entradas y confirmar efectos en colaboradores.

**Cuándo usarlo.** Stub para datos de entrada; verify para acciones sin retorno relevante.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import static org.mockito.Mockito.*;
interface Mail { void send(String to); }
class Notifier { private final Mail mail; Notifier(Mail m){mail=m;} void avisar(String to){ mail.send(to); } }
// test: Mail mail=mock(Mail.class); new Notifier(mail).avisar("a@b"); verify(mail).send("a@b");
```

**Caso de uso real.** Verificar que se envió email de bienvenida.

**Error común.** `verify` en exceso sobre detalles internos. Síntoma: tests frágiles. Corrección: verificar comportamiento significativo.

**Verificación (2026-05-22).** `verify` pasa solo si la interacción ocurrió.

#### Ejemplo integrado desde cero

`EmailSender`, `PedidoService`, `PedidoServiceTest` con `mock`, `verify`, `never`.

```bash
mvn -q test
```

Salida real observada:

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

### Tema 3: Tests parametrizados y cobertura · Avanzado · 40 min

Mismo comportamiento, muchos inputs. No quieres copiar-pegar tests.

#### Tests parametrizados

**Definición formal.** Tests que ejecutan la misma lógica con múltiples conjuntos de datos (`@ParameterizedTest`, `@CsvSource`, etc.).

**Para qué sirve.** Cubrir variaciones de entrada con menos duplicación.

**Cuándo usarlo.** Reglas puras con varios casos. No lo uses cuando los casos requieren lógica muy distinta.

**Ejemplo mínimo enfocado (ejecutable).**

```java
package com.academia;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;
class ParamTest {
    @ParameterizedTest
    @CsvSource({"100,10,90","200,50,100","50,0,50"})
    void descuento(int precio,int pct,int esperado){ assertEquals(esperado, precio - (precio*pct/100)); }
}
```

**Caso de uso real.** Validar reglas de cálculo con tabla de casos.

**Error común.** Parametrizar casos no comparables. Corrección: separar escenarios con semántica distinta.

**Verificación (JUnit 5.11.4, 2026-05-22).** 3 ejecuciones, 0 fallos.

#### Cobertura

**Definición formal.** Medida de qué código fue ejecutado por tests (líneas, ramas, etc.).

**Para qué sirve.** Detectar zonas no ejercitadas.

**Cuándo usarlo.** Como señal, no como objetivo absoluto. Alta cobertura no implica buenos tests.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
# con plugin jacoco configurado
mvn -q test
```

**Caso de uso real.** Detectar rama de error sin test.

**Error común.** Perseguir 100% con aserciones vacías. Corrección: priorizar invariantes y riesgos.

**Verificación.** JaCoCo genera reporte; interpretar con criterio.

#### Ejemplo integrado desde cero

Agregar `@ParameterizedTest` al `DescuentoServiceTest`. Ejecutar `mvn -q test`.

### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 45 min

Los tests por ejemplo cubren casos elegidos por el autor. Las propiedades definen reglas que deben cumplirse para muchos inputs generados.

#### Pruebas basadas en propiedades

**Definición formal.** Técnica donde se define una propiedad invariante y el framework genera muchos inputs para intentar falsarla.

**Para qué sirve.** Encontrar casos borde que no pensaste.

**Cuándo usarlo y cuándo no.** Úsalo para invariantes claros (reversibilidad, idempotencia, límites). No lo uses si no puedes definir una propiedad válida.

**Ejemplo mínimo enfocado (ejecutable, jqwik).**

```java
package com.academia;
import net.jqwik.api.*;
import net.jqwik.api.constraints.*;
import static org.assertj.core.api.Assertions.*;
class PropTest {
    @Property
    void descuentoNuncaNegativo(@ForAll @Int(min=0,max=100000) int precio, @ForAll @Int(min=0,max=100) int pct) {
        int r = precio - (precio*pct/100);
        assertThat(r).isBetween(0, precio);
    }
}
```

**Caso de uso real.** Serializar/deserializar, encode/decode, invariantes de dinero.

**Error común.** Propiedad vaga o falsa. Síntoma: test flaky o inútil. Corrección: propiedad precisa y dominio de entrada controlado.

**Verificación (jqwik 1.9.2, Maven 3.10.0, 2026-05-22).** Property pasa con inputs generados.

#### Ejemplo integrado desde cero

Agrega jqwik al `pom.xml` y crea `DescuentoPropertyTest`.

```bash
mvn -q test
```

Salida real observada: incluye ejecuciones de JUnit y jqwik sin fallos.

## Cierre del módulo

Puedes escribir tests unitarios claros, aislar dependencias con Mockito, parametrizar casos y usar propiedades para invariantes. El siguiente paso es medir calidad de código con SonarQube y estándares de equipo.
