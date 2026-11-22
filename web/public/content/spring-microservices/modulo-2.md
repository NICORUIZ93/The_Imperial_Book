# Módulo 2 · Testing de microservicios Java

Los microservicios fallan en las fronteras: contratos, datos, red, configuración y arquitectura. El testing no busca “100% cobertura”, busca confianza con feedback rápido. Este módulo cubre pirámide de tests, dobles, integración realista, contratos, arquitectura y calidad estática.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0. Los ejemplos de lógica y contratos se ejecutan con Java puro. JUnit/Mockito/MockMvc/Testcontainers/Pact/ArchUnit/SonarQube requieren dependencias o infraestructura; se incluyen comandos y **Nota de verificación**.

## Aprende construyendo

### Tema 1: JUnit 5, Mockito y MockMvc · Intermedio · 180 min

Caso guía: probar un servicio sin levantar toda la infraestructura.

#### Unit y slice tests

**Definición formal.** JUnit 5 es el framework de tests para Java. Mockito crea dobles para aislar dependencias. MockMvc prueba la capa web de Spring MVC sin servidor HTTP real completo.

**Cuándo usarlo / cuándo no.** Úsalo para lógica y contratos web. No reemplaces toda integración con mocks.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm2-junit
cd sm2-junit
```

Crea el archivo `Calc.java`:

```java
class TaxService { double rate() { return 0.2; } }
class PriceService {
  private final TaxService tax;
  PriceService(TaxService tax) { this.tax = tax; }
  double total(double base) { return base * (1 + tax.rate()); }
}
public class Calc {
  public static void main(String[] args) {
    var svc = new PriceService(() -> 0.2);
    System.out.println(svc.total(100));
  }
}
```

```bash
javac Calc.java
java Calc
```

**Caso de uso real.** JUnit `@Test` + Mockito `when(repo.find).thenReturn(...)` + MockMvc `perform(get(...))`.

**Error común.** Mockear todo.

**Síntoma.** tests verdes pero producción falla. **Causa.** dobles no representan contratos reales. **Corrección.** usar dobles en fronteras, integración para DB/HTTP reales. **Señal observable.** alta cobertura con bugs de integración.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `120.0`. **Nota de verificación:** JUnit/Mockito/MockMvc reales requieren dependencias Maven/Gradle.

### Tema 2: Testcontainers · Intermedio · 180 min

Caso guía: probar repositorio contra PostgreSQL real efímero.

#### Integración realista

**Definición formal.** Testcontainers levanta dependencias reales en contenedores Docker durante tests, proporcionando aislamiento y realismo.

**Cuándo usarlo / cuándo no.** Úsalo para DB/broker/colas reales. No lo uses para cada unit test; es más lento.

**Ejemplo mínimo enfocado (ejecutable: contrato de test).**

```bash
mkdir -p sm2-tc
cd sm2-tc
```

Crea el archivo `Tc.java`:

```java
public class Tc {
  static boolean needsRealDb(String testType) { return testType.equals("integration"); }
  public static void main(String[] args) {
    System.out.println(needsRealDb("integration"));
    System.out.println(needsRealDb("unit"));
  }
}
```

```bash
javac Tc.java
java Tc
```

**Caso de uso real.** `@Testcontainers` + `PostgreSQLContainer` + Spring datasource dinámico.

**Error común.** Usar H2 para todo y asumir compatibilidad.

**Síntoma.** falla en prod por dialecto SQL. **Causa.** diferencias H2/Postgres. **Corrección.** Testcontainers con DB real. **Señal observable.** queries funcionan en test pero no en producción.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Testcontainers requiere Docker daemon; no se levantó contenedor aquí.

### Tema 3: Contract Testing con Pact · Avanzado · 180 min

Caso guía: `orders` consume `catalog`; un cambio en catalog no debe romper orders.

#### Contrato consumer-driven

**Definición formal.** Pact captura expectativas del consumidor como contrato; el provider verifica que las cumple. Pact Broker publica/versiona contratos.

**Cuándo usarlo / cuándo no.** Úsalo entre servicios con despliegue independiente. No reemplaza tests E2E ni unit tests.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm2-pact
cd sm2-pact
```

Crea el archivo `PactShape.java`:

```java
import java.util.*;
public class PactShape {
  static boolean valid(Map<String,Object> resp) {
    return resp.containsKey("id") && resp.containsKey("price");
  }
  public static void main(String[] args) {
    System.out.println(valid(Map.of("id","p1","price",10)));
    System.out.println(valid(Map.of("id","p1")));
  }
}
```

```bash
javac PactShape.java
java PactShape
```

**Caso de uso real.** Consumer genera pact; provider CI verifica contra Pact Broker.

**Error común.** Contratos demasiado estrictos.

**Síntoma.** fallos por campos irrelevantes. **Causa.** sobre-especificar. **Corrección.** verificar lo que el consumidor necesita. **Señal observable.** rupturas por campos no usados.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Pact/Pact Broker reales requieren librerías/infra.

### Tema 4: ArchUnit · Intermedio · 120 min

Caso guía: impedir que `domain` dependa de `spring-web`.

#### Fitness function arquitectónica

**Definición formal.** ArchUnit ejecuta reglas de arquitectura como tests JUnit sobre el bytecode/clases.

**Cuándo usarlo / cuándo no.** Úsalo para reglas estables. No codifiques reglas volátiles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm2-arch
cd sm2-arch
```

Crea el archivo `Arch.java`:

```java
import java.util.*;
public class Arch {
  static boolean allowed(String from, String to) {
    if (from.equals("domain") && to.startsWith("spring")) return false;
    return true;
  }
  public static void main(String[] args) {
    System.out.println(allowed("domain","java.util"));
    System.out.println(allowed("domain","spring.web"));
  }
}
```

```bash
javac Arch.java
java Arch
```

**Caso de uso real.** `noClasses().that().resideInPackage("..domain..").should().dependOnClassesThat().resideInPackage("..web..")`.

**Error común.** Reglas arquitectónicas solo en wiki.

**Síntoma.** erosión arquitectónica gradual. **Causa.** sin enforcement automático. **Corrección.** ArchUnit en CI. **Señal observable.** imports indebidos en PR.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** ArchUnit real requiere dependencia.

### Tema 5: SonarQube · Intermedio · 120 min

Caso guía: detectar smells, bugs y deuda técnica en CI.

#### Calidad estática

**Definición formal.** SonarQube analiza código para bugs, vulnerabilidades, code smells y cobertura, aplicando quality gates.

**Cuándo usarlo / cuándo no.** Úsalo como guardrail en CI. No persigas el número sin entender hallazgos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm2-sonar
cd sm2-sonar
```

Crea el archivo `Quality.java`:

```java
public class Quality {
  static boolean gate(boolean testsPass, int criticalBugs) { return testsPass && criticalBugs == 0; }
  public static void main(String[] args) {
    System.out.println(gate(true, 0));
    System.out.println(gate(true, 1));
  }
}
```

```bash
javac Quality.java
java Quality
```

**Caso de uso real.** Quality gate en PR: cobertura mínima, 0 bugs críticos.

**Error común.** Ignorar quality gate.

**Síntoma.** deuda crece. **Causa.** no bloquear merges. **Corrección.** gate razonable y gradual. **Señal observable.** tendencia creciente de issues.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** SonarQube requiere servidor/scanner.

### Tema 6: Floci para emular dependencias cloud en tests/CI · Avanzado · 120 min

Caso guía: un microservicio publica a S3/SQS; necesitas pruebas de integración deterministas en CI sin cuenta cloud real.

#### Definición formal

Floci es un emulador local cloud; en Java se integra con Testcontainers y, en Spring Boot, puede usarse para configurar clientes AWS vía endpoint local. Permite validar integraciones de control/data plane emulado en local.

#### Contrato mínimo

Endpoint local, credenciales de prueba, región, clientes SDK con endpoint override, y suite que diferencie lo que valida el emulador vs lo que requiere cloud real.

#### Cuándo usarlo / cuándo no

**Úsalo** para tests de integración rápidos, CI y reproducibilidad. **No lo uses** como garantía completa de comportamiento cloud real (IAM avanzado, cuotas, latencia, fallas regionales).

#### Error común

**Síntoma.** verde en CI, falla en AWS real. **Causa.** paridad parcial. **Corrección.** pruebas contractuales locales + smoke en entorno cloud controlado. **Señal observable.** errores de permisos/cuotas solo en real.

**Nota de verificación (2026-05-22).** No ejecutado aquí; requiere Docker/imagen Floci y dependencias test. Comando esperado: `./mvnw test` con `FlociContainer` y aserciones sobre recurso creado.

## Cierre

Testing en microservicios es economía de confianza: rápido en unit/slice, realista en integración, contractual en fronteras y automatizado en arquitectura/calidad.

## Checklist

- Distingues unit, slice, integration, contract, e2e.
- No mockeas lo que necesitas validar como integración.
- Contratos versionados para servicios independientes.
- Reglas de arquitectura en CI.
- Quality gate con señal útil.
