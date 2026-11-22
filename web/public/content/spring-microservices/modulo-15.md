# Módulo 15 · Proyecto final: capstone Spring microservicios

El capstone cierra el track: diseño, implementación, operación y defensa. El objetivo es demostrar criterio arquitectónico con evidencia, no solo código funcionando.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Docker 29.9.3. Los smokes son ejecutables con Java; infraestructura completa (Kafka/Keycloak/K8s/Gatling) queda con **Nota de verificación**.

## Aprende construyendo

### Tema 1: Diseño del sistema y límites · Experto · 360 min

Caso guía: RutaFlow con `orders`, `catalog`, `billing`, `notifications`.

#### Definición formal

El diseño del capstone define bounded contexts, contratos, ownership de datos, SLOs, riesgos y límites de consistencia. La arquitectura se documenta con C4/ADRs y se valida contra requisitos de negocio y operación.

#### Contrato / internals

- **Bounded context:** cada servicio posee su modelo y su base de datos.
- **Contratos:** REST/gRPC/eventos con versionado y compatibilidad.
- **SLO:** latencia, disponibilidad, freshness, error budget.
- **Riesgos:** acoplamiento temporal, consistencia eventual, costos operativos.
- **Límite:** microservicios solo si la autonomía/escala/organización lo justifican.

#### Cuándo usarlo / cuándo no

**Úsalo** antes de escribir infraestructura masiva. **No** empieces por Kubernetes o Kafka antes de definir límites, contratos y modos de fallo.

#### Ejemplo mínimo ejecutable

Crea el archivo `Design.java`:

```java
import java.util.*;
public class Design {
  public static void main(String[] args) {
    List<String> services = List.of("orders", "catalog", "billing", "notifications");
    System.out.println(services.size());
    System.out.println(!services.contains("shared-db"));
  }
}
```

```bash
javac Design.java
java Design
```

Salida esperada:

```text
4
true
```

#### Caso real

`orders` es dueño del estado del pedido; `billing` del cobro; `notifications` solo envía mensajes. No existe tabla compartida entre servicios.

#### Error común

**Síntoma.** 12 servicios para un MVP pequeño. **Causa.** sobre-descomposición. **Corrección.** pocos contextos claros, extraer solo cuando haya frontera real. **Señal observable.** cambios simples requieren coordinación entre muchos repos.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `4`, `true`.

**Nota de verificación:** el diseño real se valida con revisión ARB/ADR y walkthrough de escenarios.

### Tema 2: Contratos, idempotencia y saga/outbox · Experto · 360 min

Caso guía: crear pedido debe reservar stock, cobrar y notificar. Ningún paso puede duplicar efectos.

#### Definición formal

La consistencia práctica combina contratos versionados, outbox para publicar eventos confiablemente, idempotencia para tolerar duplicados y sagas para compensar procesos multi-servicio.

#### Contrato / internals

- **Contrato:** schema/API con versión y compatibilidad.
- **Outbox:** estado + evento en transacción local.
- **Idempotencia:** dedup por `eventId`/idempotency key.
- **Saga:** compensación semántica ante fallo.
- **Observabilidad:** traceId atraviesa HTTP y mensajería.

#### Cuándo usarlo / cuándo no

**Úsalo** en todo flujo distribuido crítico. **No** uses dual write ni confíes en exactly-once sin diseño end-to-end.

#### Ejemplo mínimo ejecutable

Crea el archivo `Flow.java`:

```java
import java.util.*;
public class Flow {
  static Set<String> seen = new HashSet<>();
  static String consume(String id) { return seen.add(id) ? "ok" : "dup"; }
  public static void main(String[] args) {
    System.out.println(consume("e1"));
    System.out.println(consume("e1"));
  }
}
```

```bash
javac Flow.java
java Flow
```

Salida esperada:

```text
ok
dup
```

#### Caso real

`orders-service` guarda pedido y outbox. `billing-service` consume `OrderCreated` con dedup por `eventId`; si cobra pero falla notificación, la saga compensa o reintenta según política.

#### Error común

**Síntoma.** doble cobro o doble email. **Causa.** retries/redelivery sin idempotencia. **Corrección.** outbox, dedup, idempotency keys y compensaciones. **Señal observable.** mismo `eventId` produce dos efectos.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `ok`, `dup`.

**Nota de verificación:** el flujo completo requiere Kafka/DB/servicios; verificar con Testcontainers o entorno de integración.

### Tema 3: Observabilidad, seguridad y despliegue · Experto · 240 min

Caso guía: el sistema debe ser operable en producción: saber si está sano, quién llamó, y desplegar sin downtime.

#### Definición formal

La operación productiva combina observabilidad (logs/métricas/trazas), seguridad (authn/authz/secretos) y entrega segura (contenedores, probes, rollout, GitOps).

#### Contrato / internals

- **Observabilidad:** health, métricas RED/USE, traces con propagación, SLOs.
- **Seguridad:** OAuth2/JWT, RBAC/scopes, secretos fuera de git, CVE scan.
- **Despliegue:** imagen reproducible, readiness/liveness, rollout progresivo.
- **Límite:** un servicio “funcional” sin observabilidad ni seguridad no está listo para producción.

#### Cuándo usarlo / cuándo no

**Úsalo** antes de exponer a usuarios reales. **No** pospongas seguridad/observabilidad al “final”.

#### Ejemplo mínimo ejecutable

Crea el archivo `Ops.java`:

```java
public class Ops {
  static boolean ready(boolean db, boolean broker) { return db && broker; }
  static boolean authorized(String role) { return "ADMIN".equals(role); }
  public static void main(String[] args) {
    System.out.println(ready(true, true));
    System.out.println(authorized("USER"));
  }
}
```

```bash
javac Ops.java
java Ops
```

Salida esperada:

```text
true
false
```

#### Caso real

Readiness solo es UP cuando DB y broker están disponibles. Endpoint admin exige `ROLE_ADMIN`. Despliegue canary con rollback por SLO.

#### Error común

**Síntoma.** downtime en deploy o incidentes sin diagnóstico. **Causa.** probes mal definidas, sin trazas, sin authz por recurso. **Corrección.** liveness/readiness separadas, OTel, RBAC, runbooks. **Señal observable.** 503 en rollout o incidentes sin traceId.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó K8s/Keycloak/OTel stack completo. Verificación propuesta: deploy en cluster de prueba con probes, SLO y auth OIDC.

### Tema 4: Carga, restricción sobrevenida y defensa ARB · Experto · 240 min

Caso guía: el ARB pide “reduce costo 30% sin romper p95 < 300ms ni error rate < 1%”.

#### Definición formal

La defensa ARB (Architecture Review Board) es la presentación técnica de una decisión: contexto, alternativas, trade-offs, evidencia, riesgos y respuesta a restricciones. No es opinión; es evidencia.

#### Contrato / internals

- **Métricas:** p95/p99, error rate, throughput, costo, saturación.
- **Evidencia:** load tests, traces, dashboards, ADRs, postmortems.
- **Restricción sobrevenida:** cambio de requisito en la defensa; se responde con trade-offs y datos.
- **Límite:** sin números no hay defensa; sin trade-offs no hay arquitectura.

#### Cuándo usarlo / cuándo no

**Úsalo** al cerrar el capstone o justificar una decisión mayor. **No** defiendas con “funciona en mi máquina” o solo con diapositivas.

#### Ejemplo mínimo ejecutable

Crea el archivo `Arb.java`:

```java
public class Arb {
  static boolean pass(int p95, double err, double costDelta) {
    return p95 < 300 && err < 0.01 && costDelta <= 0;
  }
  public static void main(String[] args) {
    System.out.println(pass(180, 0.002, -0.1));
    System.out.println(pass(400, 0.002, -0.1));
  }
}
```

```bash
javac Arb.java
java Arb
```

Salida esperada:

```text
true
false
```

#### Caso real

Se presenta ADR de caching: reduce costo 20% y p95 de 420ms a 210ms, con riesgo de stale data mitigado por invalidación por evento. Ante “reduce 30%”, se propone right-sizing adicional y sampling de traces, con impacto medido.

#### Error común

**Síntoma.** rechazo en ARB. **Causa.** claims sin métricas ni trade-offs. **Corrección.** llevar p95/error/costo, trazas, alternativas y riesgos. **Señal observable.** preguntas básicas sin respuesta cuantitativa.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó Gatling/k6 ni cluster real. Verificación propuesta: prueba de carga reproducible, dashboard de SLO/costo y ADR con resultados.

## Cierre

El capstone Spring demuestra que puedes diseñar, operar y defender un sistema distribuido con evidencia. Microservicios es un medio, no el objetivo.

## Checklist

- Límites y ownership claros.
- Contratos, idempotencia y saga/outbox.
- Observabilidad, seguridad y entrega.
- ADR y defensa con métricas.
- Verificación honesta de lo ejecutado vs no ejecutado.
