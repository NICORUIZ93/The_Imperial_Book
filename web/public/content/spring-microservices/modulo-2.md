# Módulo 2 · Testing de microservicios Java

Los microservicios fallan en las fronteras: contratos, datos, red, configuración y arquitectura. El testing no busca “100% cobertura”, busca confianza con feedback rápido. Este módulo cubre pirámide de tests, dobles, integración realista, contratos, arquitectura y calidad estática.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0. Los ejemplos de lógica y contratos se ejecutan con Java puro. JUnit/Mockito/MockMvc/Testcontainers/Pact/ArchUnit/SonarQube requieren dependencias o infraestructura; se incluyen comandos y **Nota de verificación**.

## Aprende construyendo

### Tema 1: JUnit 5, Mockito y MockMvc · Intermedio · 180 min

Caso guía: probar un servicio sin levantar toda la infraestructura.

#### Unit y slice tests

**Definición formal.** JUnit 5 es el framework de tests para Java. Mockito crea dobles para aislar dependencias. MockMvc prueba la capa web de Spring MVC sin servidor HTTP real completo.

**Contrato / internals.** JUnit 5: `@Test`, lifecycle `@BeforeEach`, extensiones. Mockito: `mock/when/verify`, dobles en fronteras. MockMvc: prueba capa web con DispatcherServlet simulado, sin servidor real completo. Aislar dependencias externas; no mockear el dominio.


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

**Contrato / internals.** Testcontainers levanta contenedores Docker efímeros para tests; JDBC URL dinámica/`@ServiceConnection` inyecta conexión. Ciclo: start antes de tests, stop al finalizar. Requiere Docker; en CI usar runner con Docker.


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

**Contrato / internals.** Pact consumer genera contrato (pact file) desde expectativas; provider verifica contra ese pacto. Detecta quiebres de compatibilidad antes de deploy; no reemplaza tests funcionales/E2E.


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

**Contrato / internals.** ArchUnit ejecuta reglas sobre bytecode/clases Java en tests JUnit. Reglas típicas: capas, dependencias prohibidas, naming, ciclos. Falla el build ante violación.


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

**Contrato / internals.** SonarQube/SonarCloud analiza código fuente, cobertura, smells, bugs, vulnerabilidades y quality gates. Se integra en CI; quality gate bloquea merge si no cumple umbrales.


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

**Contrato / internals.** Floci emula APIs cloud localmente (S3/SQS/SNS/etc.) en endpoint compatible; Testcontainers puede levantarlo para CI. Credenciales de prueba, sin cuenta cloud real; validar paridad de API según servicio.



Caso guía: un microservicio procesa archivos en S3 y publica mensajes en SQS. En CI no hay cuenta cloud real, pero necesitas validar integración con AWS SDK, serialización y manejo de errores.

#### Definición formal

Floci es un emulador local de servicios cloud compatible con APIs AWS. En Java se integra con Testcontainers mediante el módulo `io.floci:testcontainers-floci` (línea 1.x para Testcontainers 1.x/Spring Boot 3.x; línea 2.x para Testcontainers 2.x/Spring Boot 4.x). Permite ejecutar dependencias cloud-like en local/CI con endpoint HTTP controlado.

#### Contrato / internals

- **Endpoint:** el contenedor expone un endpoint local; el SDK debe apuntar a `endpointOverride`.
- **Credenciales:** credenciales de prueba (`test/test` o las configuradas); no son credenciales cloud reales.
- **Región:** el cliente debe configurarla explícitamente.
- **Paridad parcial:** emula comportamiento de API, no garantías completas de IAM real, cuotas, latencia, consistencia eventual específica ni todas las features.
- **Aislamiento:** cada test debe crear/limpiar recursos o usar nombres únicos.

#### Cuándo usarlo / cuándo no

**Úsalo** para integración local/CI rápida, determinista y sin costo cloud: crear bucket, publicar/leer cola, validar wiring de SDK. **No lo uses** como única evidencia para producción en AWS real: IAM fino, políticas, KMS, cuotas, throttling real, latencia de red y comportamiento regional pueden diferir.

#### Ejemplo mínimo ejecutable

El siguiente smoke modela el contrato de decisión que debe aplicar un test: si el endpoint es local/emulado se usa configuración de prueba; si es cloud real, no se deben usar credenciales dummy.

Crea el archivo `FlociConfig.java`:

```java
public class FlociConfig {
  record ClientCfg(String endpoint, String creds, String region) {}

  static ClientCfg cfg(boolean emulator) {
    if (emulator) return new ClientCfg("http://localhost:4566", "test/test", "us-east-1");
    return new ClientCfg("https://s3.amazonaws.com", "iam-role", "us-east-1");
  }

  public static void main(String[] args) {
    System.out.println(cfg(true));
    System.out.println(cfg(false).creds());
  }
}
```

```bash
javac FlociConfig.java
java FlociConfig
```

Salida esperada:

```text
ClientCfg[endpoint=http://localhost:4566, creds=test/test, region=us-east-1]
iam-role
```

#### Caso real

Un test JUnit 5 levanta `FlociContainer`, configura `S3Client` con `endpointOverride(floci.getEndpoint())`, crea un bucket, sube un objeto y verifica que el servicio lo lee. En CI corre sin cuenta AWS; nightly se ejecuta un smoke contra AWS real para validar IAM/políticas.

#### Error común

**Síntoma.** test pasa con Floci pero falla en AWS real. **Causa.** asumir paridad total del emulador con IAM/cuotas/latencia/features. **Corrección.** pirámide de verificación: emulador para feedback rápido + smoke selectivo en cloud real para riesgos críticos. **Señal observable.** `AccessDenied`, throttling o diferencias de semántica solo en entorno real.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): salida esperada `ClientCfg[endpoint=http://localhost:4566, creds=test/test, region=us-east-1]` y `iam-role`.

**Nota de verificación:** no se ejecutó Floci/Testcontainers en esta sesión porque requiere Docker y dependencia `io.floci:testcontainers-floci`. Verificación real propuesta:

```bash
# agregar dependencia test io.floci:testcontainers-floci (1.x o 2.x según stack)
./mvnw -Dtest=*FlociIT test
```

Resultado esperado: contenedor Floci inicia, el SDK opera contra `localhost:4566`, las aserciones pasan y no se usan credenciales cloud reales.

## Cierre

Testing en microservicios es economía de confianza: rápido en unit/slice, realista en integración, contractual en fronteras y automatizado en arquitectura/calidad.

## Checklist

- Distingues unit, slice, integration, contract, e2e.
- No mockeas lo que necesitas validar como integración.
- Contratos versionados para servicios independientes.
- Reglas de arquitectura en CI.
- Quality gate con señal útil.
