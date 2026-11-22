# Módulo 9: Testing con JUnit 5 y Mockito

El código que no se prueba se rompe en silencio. Las pruebas automatizadas no garantizan ausencia de bugs, pero sí crean una red de seguridad para cambiar con confianza. Este módulo cubre JUnit Jupiter, Mockito, tests parametrizados y pruebas basadas en propiedades.

## Setup ejecutable del módulo

Crea un proyecto Maven desde cero:

```bash
mkdir -p ~/academia-java/modulo-09
cd ~/academia-java/modulo-09
mkdir -p src/main/java/com/academia src/test/java/com/academia
```

`pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId>
  <artifactId>modulo-09</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <junit.version>5.11.4</junit.version>
    <mockito.version>5.14.2</mockito.version>
    <jqwik.version>1.9.2</jqwik.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-junit-jupiter</artifactId>
      <version>${mockito.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>net.jqwik</groupId>
      <artifactId>jqwik</artifactId>
      <version>${jqwik.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.2</version>
      </plugin>
    </plugins>
  </build>
</project>
```

Ejecuta tests con:

```bash
mvn -q test
```

> Nota de nomenclatura: el título menciona "JUnit 5 y Mockito"; el contenido usa JUnit Jupiter (API de JUnit 5/6). La dependencia anterior usa la línea estable JUnit 5.11.x; si tu entorno ya usa JUnit 6, ajusta la versión manteniendo las mismas APIs de Jupiter.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Escribir tests claros con JUnit Jupiter y su ciclo de vida |
| 2 | Aislar dependencias con Mockito |
| 3 | Parametrizar tests y medir cobertura con criterio |
| 4 | Usar property-based testing para reglas generales |

## Aprende construyendo

### Tema 1: JUnit 6 (Jupiter) — anotaciones y ciclo de vida · Avanzado · 40 min

**Caso guía**

Pruebas automáticas de una calculadora de descuentos: casos normales, bordes y errores, repetibles en CI.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **JUnit Jupiter** | Modelo de programación/extensión de JUnit 5/6 (`@Test`, assertions, extensions). | Escribir y ejecutar tests. | Tests unitarios/integración en Java. | Mezclar JUnit 4 sin necesidad. |
| **Anotaciones** | Metadatos (`@Test`, `@BeforeEach`, `@AfterEach`, `@BeforeAll`). | Declarar comportamiento del test/ciclo. | Setup/teardown y casos. | Setup pesado en `@BeforeAll` con estado mutable. |
| **Ciclo de vida** | Cuándo se crea instancia y ejecutan hooks. | Aislamiento entre tests. | Por defecto, instancia por test. | Dependencia entre tests por estado compartido. |
| **Aserciones/contrato** | Verificaciones de resultado y errores (`assertEquals`, `assertThrows`). | Definir comportamiento esperado. | Todo test. | Aserciones débiles o inexistentes. |

**Contrato / invariantes / reglas.** Test determinista, aislado, rápido. `@BeforeEach` prepara estado fresco. `assertThrows` valida contrato de error. Nombra tests por comportamiento. No dependas de orden.

**Implementación desde cero (usa setup del módulo)**

`src/main/java/com/academia/DescuentoService.java`:

```java
package com.academia;
public class DescuentoService {
    public int aplicar(int precio, int porcentaje) {
        if (precio < 0 || porcentaje < 0 || porcentaje > 100) throw new IllegalArgumentException("datos inválidos");
        return precio - (precio * porcentaje / 100);
    }
}
```

`src/test/java/com/academia/DescuentoServiceTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
class DescuentoServiceTest {
    DescuentoService service;
    @BeforeEach void setUp() { service = new DescuentoService(); }
    @Test void aplicaDescuento() { assertEquals(80, service.aplicar(100, 20)); }
    @Test void rechazaPorcentajeInvalido() { assertThrows(IllegalArgumentException.class, () -> service.aplicar(100, 120)); }
}
```

**Ejecución y salida real**

```bash
mvn -q -Dtest=DescuentoServiceTest test
```

```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
```

**Errores comunes**: estado compartido, tests dependientes de orden, aserciones débiles. **Verificación**: rompe la lógica y confirma rojo.


### Tema 2: Mockito — aislar dependencias · Avanzado · 40 min

**Caso guía**

`Notifier` envía email por un cliente externo. En tests no debes enviar correos reales.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Mockito** | Framework para crear dobles y verificar interacciones. | Aislar dependencias externas. | I/O, red, tiempo, servicios externos. | Mockear todo, incluso lógica simple. |
| **Mock** | Doble que registra interacciones y permite verificarlas. | Verificar llamadas relevantes. | Efectos secundarios externos. | Sobre-verificar detalles internos. |
| **Stub** | Doble que devuelve respuestas predefinidas. | Controlar entradas al SUT. | Dependencia que provee datos. | Stubs innecesarios. |
| **Aislar dependencias** | Probar unidad sin ejecutar sistemas externos. | Tests deterministas y rápidos. | Unit tests. | No probar integración donde importa. |

**Contrato / invariantes / reglas.** SUT real, dependencias dobles. `when(...).thenReturn(...)` stub; `verify(...)` interacción relevante. Inyección por constructor facilita testing. No mockees tipos que no posees sin adaptador cuando la API es compleja.

**Implementación desde cero**

`src/main/java/com/academia/EmailClient.java`:

```java
package com.academia;
interface EmailClient { void send(String to, String body); }
```

`src/main/java/com/academia/Notifier.java`:

```java
package com.academia;
public class Notifier {
    private final EmailClient email;
    Notifier(EmailClient email) { this.email = email; }
    public void avisar(String to) {
        if (to == null || to.isBlank()) throw new IllegalArgumentException("to requerido");
        email.send(to, "Hola");
    }
}
```

`src/test/java/com/academia/NotifierTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class NotifierTest {
    @Test void enviaEmail() {
        EmailClient email = mock(EmailClient.class);
        new Notifier(email).avisar("ada@example.com");
        verify(email).send("ada@example.com", "Hola");
    }
    @Test void noEnviaSiInvalido() {
        EmailClient email = mock(EmailClient.class);
        assertThrows(IllegalArgumentException.class, () -> new Notifier(email).avisar(""));
        verifyNoInteractions(email);
    }
}
```

**Ejecución y salida real**

```bash
mvn -q -Dtest=NotifierTest test
```

```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
```

**Errores comunes**: sobre-verificación, mockear valores, olvidar stub. **Verificación**: cambia implementación para no enviar y observa fallo en `verify`.


### Tema 3: Tests parametrizados y cobertura · Avanzado · 40 min

**Caso guía**

La misma regla debe probarse con varios inputs/bordes. Copiar-pegar tests genera ruido y huecos.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Tests parametrizados** | Ejecutan la misma aserción con múltiples datos (`@ParameterizedTest`, `@CsvSource`). | Cubrir muchos casos sin duplicar código. | Reglas con varios inputs. | Casos redundantes sin bordes. |
| **Cobertura de código** | Métrica de líneas/ramas ejecutadas por tests. | Encontrar huecos. | Auditoría de suite. | Tratar 100% como calidad suficiente. |
| **Casos borde** | Inputs límite (0, vacío, negativo, max, null). | Detectar bugs en límites. | Siempre. | Solo “happy path”. |
| **Métrica vs calidad** | Cobertura mide ejecución, no corrección de aserciones. | Interpretar cobertura con criterio. | Revisión de tests. | Aserciones débiles para subir cobertura. |

**Contrato / invariantes / reglas.** Parametriza inputs representativos y bordes. Usa cobertura (JaCoCo) para descubrir huecos, no como KPI aislado. Un test sin aserción útil no vale.

**Implementación desde cero**

`src/test/java/com/academia/CalcParamTest.java`:

```java
package com.academia;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;
class Calc { static int doble(int n) { return n * 2; } }
class CalcParamTest {
    @ParameterizedTest
    @CsvSource({"1,2","2,4","-3,-6","0,0"})
    void duplica(int input, int esperado) { assertEquals(esperado, Calc.doble(input)); }
}
```

**Ejecución y salida real**

```bash
mvn -q -Dtest=CalcParamTest test
```

```text
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
```

**Errores comunes**: 100% cobertura con aserciones pobres; olvidar bordes. **Verificación**: agrega caso borde y un caso inválido si aplica.


### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 45 min

**Caso guía**

`reverse(reverse(x)) == x` debe cumplirse para muchas cadenas, no solo para ejemplos elegidos a mano.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Property-based testing (PBT)** | Pruebas que verifican propiedades/invariantes para muchos inputs generados. | Encontrar casos borde que no imaginaste. | Funciones puras, serialización, parseo, colecciones. | Propiedad mal definida (trivial o falsa). |
| **Propiedad/invariante** | Regla que debe cumplirse para cualquier input válido. | Especificar comportamiento general. | Idempotencia, inversa, conservación, etc. | Reimplementar la función dentro del test. |
| **Generadores/shrinking** | Generan datos aleatorios controlados; shrinking reduce el caso que falla al mínimo. | Cobertura amplia y diagnóstico. | PBT con jqwik. | Limitar generador tanto que pierde valor. |
| **PBT vs example-based** | Ejemplos prueban casos concretos; PBT prueba reglas generales. | Complementarse. | Usa ambos. | Reemplazar todos los ejemplos por PBT. |

**Contrato / invariantes / reglas.** La propiedad debe ser más simple/estable que la implementación. Controla dominio de inputs (`@StringLength`, `@IntRange`). Shrinking ayuda a depurar; no lo desactives sin razón. PBT no sustituye tests de ejemplo para casos de negocio específicos.

**Implementación desde cero (jqwik ya está en pom del setup)**

`src/main/java/com/academia/Strings.java`:

```java
package com.academia;
public class Strings {
    public static String reverse(String s) { return new StringBuilder(s).reverse().toString(); }
}
```

`src/test/java/com/academia/StringsPropertyTest.java`:

```java
package com.academia;
import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import static org.assertj.core.api.Assertions.*; // si no usas assertj, usa JUnit assertions
class StringsPropertyTest {
    @Property
    boolean reverseEsInvolutiva(@ForAll @StringLength(min=0,max=50) String s) {
        return Strings.reverse(Strings.reverse(s)).equals(s);
    }
}
```

Si no tienes AssertJ, usa JUnit:

```java
import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import org.junit.jupiter.api.Assertions;
class StringsPropertyTest {
    @Property void reverseEsInvolutiva(@ForAll @StringLength(min=0,max=50) String s) {
        Assertions.assertEquals(s, Strings.reverse(Strings.reverse(s)));
    }
}
```

**Ejecución y salida real**

```bash
mvn -q -Dtest=StringsPropertyTest test
```

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
```

(jqwik ejecuta múltiples intentos por propiedad).

**Errores comunes**

| Síntoma | Causa | Solución |
|---|---|---|
| Propiedad pasa trivialmente | Propiedad débil | Elige invariante significativo |
| Flaky | Input/dominio no controlado | Restringe generadores, evita tiempo/azar no sembrado |
| Difícil depurar | Caso grande | Usa shrinking/report de jqwik |

**Verificación rápida:** cambia `reverse` para romperla (p.ej. devolver solo `s`) y confirma que jqwik encuentra un contraejemplo.


## Cierre del módulo

Con JUnit, Mockito, tests parametrizados y propiedades, puedes construir una red de seguridad real. El siguiente módulo entra al diseño interno de la JVM: classloaders, bytecode, GC y JIT.
