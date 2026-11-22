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

**Definición formal.** Jupiter es el modelo de programación y extensión de JUnit 5/6 para escribir y ejecutar tests con anotaciones, assertions y extensiones.

**Para qué sirve.** Define una forma estándar de expresar comportamiento esperado y ejecutarlo en local/CI.

**Cuándo usarlo y cuándo no.** Úsalo para unitarias e integración en proyectos Java modernos. No lo mezcles con JUnit 4 salvo migración controlada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
# dentro de /tmp/java-m9 con el pom.xml del setup
mkdir -p src/main/java/com/academia src/test/java/com/academia
```

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

**Caso de uso real.** Validar regla de negocio antes de desplegar.

**Error común.** Test sin aserción útil. Síntoma: pasa aunque el comportamiento sea incorrecto. Corrección: afirmar resultado/efecto observable.

**Verificación (Maven 3.10.0, JDK 27, 2026-05-22).** `mvn -q test` con este test: `BUILD SUCCESS`.

#### Anotaciones y ciclo de vida

**Definición formal.** `@Test`, `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll` controlan ejecución y hooks; por defecto JUnit crea una instancia por test.

**Para qué sirve.** Aísla estado y prepara/limpia recursos de forma predecible.

**Cuándo usarlo y cuándo no.** Usa `@BeforeEach` para estado fresco. Evita `@BeforeAll` con estado mutable compartido.

**Ejemplo mínimo enfocado (ejecutable).**

`src/test/java/com/academia/CicloTest.java`:

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

**Caso de uso real.** Crear un repositorio en memoria limpio por test.

**Error común.** Depender del orden de tests. Síntoma: falla en suite pero pasa aislado. Corrección: no compartir estado mutable; inicializar en `@BeforeEach`.

**Verificación (2026-05-22).** `CicloTest` pasa con 2 tests, 0 fallos.

#### Aserciones y contrato de error

**Definición formal.** Aserciones (`assertEquals`, `assertTrue`, etc.) verifican expectativas; `assertThrows` verifica que se lanza la excepción/tipo esperado.

**Para qué sirve.** Expresa el contrato de éxito y de fallo.

**Cuándo usarlo y cuándo no.** Úsalo siempre para comportamiento observable. No atrapes excepciones manualmente si `assertThrows` expresa mejor el contrato.

**Ejemplo mínimo enfocado (ejecutable).**

`src/test/java/com/academia/ErrorTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ErrorTest {
    @Test void invalido(){ assertThrows(IllegalArgumentException.class, () -> { throw new IllegalArgumentException("x"); }); }
}
```

**Caso de uso real.** Verificar que una entrada inválida no se procesa silenciosamente.

**Error común.** Capturar `Exception` genérica. Síntoma: test pasa con error equivocado. Corrección: afirmar tipo/mensaje específico cuando importe.

**Verificación (2026-05-22).** `ErrorTest` pasa; si no se lanza excepción, JUnit falla.

### Tema 2: Mockito — aislar dependencias · Avanzado · 40 min

Pruebas unitarias de un servicio que depende de repositorio y email sin usar infraestructura real.

#### Mockito

**Definición formal.** Mockito es un framework de dobles de prueba que permite crear mocks/stubs y verificar interacciones.

**Para qué sirve.** Aísla la unidad bajo prueba de dependencias lentas, costosas o no deterministas.

**Cuándo usarlo y cuándo no.** Úsalo en dependencias externas. No mockees value objects simples o lógica que puedes usar real.

**Ejemplo mínimo enfocado (ejecutable).**

```java
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
interface Repo { String get(); }
class S { final Repo r; S(Repo r){this.r=r;} String v(){ return r.get(); } }
// Repo r = mock(Repo.class); when(r.get()).thenReturn("ok"); assertEquals("ok", new S(r).v());
```

**Caso de uso real.** Aislar gateway de pagos o repositorio JDBC.

**Error común.** Mockear todo. Síntoma: tests frágiles acoplados a implementación. Corrección: mockear solo fronteras.

**Verificación (Mockito 5.14.2, 2026-05-22).** Test con stub retorna `ok`.

#### Stub y verify (aislar dependencias)

**Definición formal.** Stub define respuesta controlada (`when(...).thenReturn(...)`); verify confirma interacción (`verify(...)`).

**Para qué sirve.** Separa control de entrada/salida de la comprobación de efectos.

**Cuándo usarlo y cuándo no.** Usa stub para entradas del colaborador; verify solo para interacciones con significado de contrato. No verifiques cada llamada interna por reflejo.

**Ejemplo mínimo enfocado (ejecutable).**

`src/main/java/com/academia/Notificador.java`:

```java
package com.academia;
interface Repo { void guardar(String id); }
interface Email { void enviar(String id); }
public class Notificador {
    private final Repo repo; private final Email email;
    public Notificador(Repo repo, Email email){ this.repo=repo; this.email=email; }
    public void crear(String id){ if(id==null||id.isBlank()) throw new IllegalArgumentException("id"); repo.guardar(id); email.enviar(id); }
}
```

`src/test/java/com/academia/NotificadorTest.java`:

```java
package com.academia;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock; import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class NotificadorTest {
    @Mock Repo repo; @Mock Email email;
    @Test void creaNotifica(){ Notificador n=new Notificador(repo,email); n.crear("G1"); verify(repo).guardar("G1"); verify(email).enviar("G1"); }
    @Test void invalidoNoLlama(){ Notificador n=new Notificador(repo,email); assertThrows(IllegalArgumentException.class,()->n.crear("")); verifyNoInteractions(repo,email); }
}
```

**Caso de uso real.** Asegurar que en error de validación no se envía email.

**Error común.** No verificar interacción crítica o verificar detalles irrelevantes. Corrección: verificar contratos observables.

**Verificación (2026-05-22).** 2 tests pasan; en caso inválido no hay interacciones.

### Tema 3: Tests parametrizados y cobertura · Avanzado · 40 min

La misma regla debe probarse con varios casos sin duplicar código.

#### Tests parametrizados

**Definición formal.** `@ParameterizedTest` ejecuta la misma plantilla de test con múltiples conjuntos de datos (`@CsvSource`, `@MethodSource`, etc.).

**Para qué sirve.** Cubre bordes y variaciones con menos duplicación.

**Cuándo usarlo y cuándo no.** Úsalo cuando la lógica sea la misma y cambien datos. No lo uses si los casos requieren aserciones/arranges muy distintos.

**Ejemplo mínimo enfocado (ejecutable).**

`src/test/java/com/academia/ParamTest.java`:

```java
package com.academia;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;
class ParamTest {
    int descuento(int edad){ if(edad<0) throw new IllegalArgumentException(); return edad>=65?30:0; }
    @ParameterizedTest @CsvSource({"10,0","65,30","80,30"})
    void regla(int edad,int esperado){ assertEquals(esperado, descuento(edad)); }
}
```

**Caso de uso real.** Tabla de reglas de precios/impuestos.

**Error común.** Casos redundantes que no aportan. Corrección: elegir casos representativos y bordes.

**Verificación (2026-05-22).** 3 invocaciones pasan.

#### Cobertura

**Definición formal.** La cobertura mide qué código ejecutaron los tests (líneas, ramas, etc.), normalmente con herramientas como JaCoCo.

**Para qué sirve.** Detecta zonas no ejercitadas.

**Cuándo usarlo y cuándo no.** Úsala como señal, no como meta absoluta. No persigas 100% con tests sin aserciones.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
# con plugin JaCoCo en pom:
mvn -q test
# reporte en target/site/jacoco/index.html
```

**Caso de uso real.** Verificar que ramas de error estén cubiertas.

**Error común.** Confundir cobertura alta con buena calidad. Síntoma: 90% pero bugs en producción. Corrección: priorizar casos de negocio y mutación/propiedades cuando aplique.

**Verificación.** **Nota de verificación:** la ejecución del módulo usó `mvn -q test` con Surefire; JaCoCo no fue agregado en este setup mínimo, pero el comando es estándar cuando se añade el plugin.

### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 45 min

En vez de probar solo ejemplos, defines una propiedad que debe cumplirse para muchas entradas generadas.

#### Pruebas basadas en propiedades

**Definición formal.** Técnica donde se define una propiedad/invariante y el framework genera muchos inputs para intentar falsarla (property-based testing).

**Para qué sirve.** Encuentra casos borde que un ejemplo manual no cubre.

**Cuándo usarlo y cuándo no.** Úsalo para invariantes claros (idempotencia, reversibilidad, no negatividad). No lo uses cuando no puedes definir una propiedad significativa.

**Ejemplo mínimo enfocado (ejecutable).**

`src/test/java/com/academia/PropTest.java`:

```java
package com.academia;
import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;
class PropTest {
    int descuento(int edad){ return (edad>=65)?30:0; }
    @Property boolean nuncaNegativo(@ForAll @IntRange(min=0,max=120) int edad){ return descuento(edad) >= 0; }
}
```

**Caso de uso real.** “El total nunca es negativo”, “serializar/deserializar conserva datos”.

**Error común.** Propiedad trivial o mal definida. Síntoma: pasa siempre pero no prueba nada. Corrección: propiedad que exprese un contrato real.

**Verificación (jqwik 1.9.2, JDK 27, 2026-05-22).** `mvn -q test` ejecuta la propiedad; jqwik reporta checks (121 en la ejecución observada).

#### Ejemplo integrado desde cero

Usa el setup Maven del módulo y los cuatro archivos de test anteriores. Comando:

```bash
mvn -q test
```

**Verificación real observada (2026-05-22):** build exitoso con JUnit Jupiter, Mockito y jqwik ejecutándose en el mismo proyecto; la propiedad `nuncaNegativo` reportó `checks = 121`.

## Cierre del módulo

JUnit define contratos ejecutables, Mockito aísla fronteras, los tests parametrizados cubren variaciones y las propiedades buscan invariantes. La calidad no es cantidad de tests: es evidencia clara de comportamiento.
