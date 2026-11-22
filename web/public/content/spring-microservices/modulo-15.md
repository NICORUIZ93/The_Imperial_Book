# Módulo 15 · Proyecto final: capstone Spring microservicios

El capstone cierra el track: diseño, implementación, operación y defensa. El objetivo es demostrar criterio arquitectónico con evidencia, no solo código funcionando.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Docker 29.9.3. Los smokes son ejecutables con Java/Node; infraestructura completa (Kafka/Keycloak/K8s/Gatling) se trata con **Nota de verificación**.

## Aprende construyendo

### Tema 1: Diseño del sistema y límites · Experto · 360 min

Caso guía: RutaFlow con `orders`, `catalog`, `billing`, `notifications`.

#### Diseño

**Definición formal.** El diseño de capstone define bounded contexts, contratos, ownership de datos, SLOs y riesgos.

**Cuándo usarlo / cuándo no.** Siempre antes de implementar. No empieces por infraestructura.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm15-design
cd sm15-design
```

Crea el archivo `Design.java`:

```java
import java.util.*;
public class Design {
  public static void main(String[] args) {
    List<String> services = List.of("orders","catalog","billing","notifications");
    System.out.println(services.size());
    System.out.println(!services.contains("shared-db"));
  }
}
```

```bash
javac Design.java
java Design
```

**Error común.** Demasiados servicios.

**Síntoma.** coordinación domina. **Causa.** sobre-descomposición. **Corrección.** pocos contextos claros. **Señal observable.** cambios cruzan muchos repos.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `4`, `true`.

### Tema 2: Contratos, idempotencia y saga/outbox · Experto · 360 min

Caso guía: order crea, cobra y notifica sin dobles efectos.

#### Consistencia práctica

**Definición formal.** Contratos versionados, outbox para publicar, idempotencia para consumir y saga para compensar.

**Cuándo usarlo / cuándo no.** En todo flujo distribuido crítico.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm15-flow
cd sm15-flow
```

Crea el archivo `Flow.java`:

```java
import java.util.*;
public class Flow {
  static Set<String> seen=new HashSet<>();
  static String consume(String id){ return seen.add(id)?"ok":"dup"; }
  public static void main(String[] args){ System.out.println(consume("e1")); System.out.println(consume("e1")); }
}
```

```bash
javac Flow.java
java Flow
```

**Error común.** Sin idempotencia.

**Síntoma.** doble cobro/notificación. **Causa.** retries/duplicados. **Corrección.** dedup/outbox. **Señal observable.** mismos IDs repetidos.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `ok`, `dup`.

### Tema 3: Observabilidad, seguridad y despliegue · Experto · 240 min

Caso guía: operar el sistema con SLOs y seguridad base.

#### Operación

**Definición formal.** Actuator/Micrometer/OTel para observabilidad; OAuth2/JWT para seguridad; Docker/K8s/GitOps para entrega.

**Cuándo usarlo / cuándo no.** Antes de producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm15-ops
cd sm15-ops
```

Crea el archivo `Ops.java`:

```java
public class Ops {
  static boolean ready(boolean db, boolean broker){ return db && broker; }
  static boolean authorized(String role){ return "ADMIN".equals(role); }
  public static void main(String[] args){ System.out.println(ready(true,true)); System.out.println(authorized("USER")); }
}
```

```bash
javac Ops.java
java Ops
```

**Error común.** Readiness incorrecta.

**Síntoma.** tráfico a pods no listos o reinicios en cascada. **Causa.** probes mal definidas. **Corrección.** liveness/readiness separadas. **Señal observable.** 503 en deploy.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

### Tema 4: Carga, restricción sobrevenida y defensa ARB · Experto · 240 min

Caso guía: “reduce costo 30% sin romper p95 < 300ms”.

#### Defensa

**Definición formal.** Defensa ARB presenta decisión, evidencia, trade-offs, riesgos y respuesta a restricciones.

**Cuándo usarlo / cuándo no.** Al cerrar capstone. No sin evidencia.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm15-arb
cd sm15-arb
```

Crea el archivo `Arb.java`:

```java
public class Arb {
  static boolean pass(int p95, double err, double costDelta){ return p95 < 300 && err < 0.01 && costDelta <= 0; }
  public static void main(String[] args){ System.out.println(pass(180,0.002,-0.1)); System.out.println(pass(400,0.002,-0.1)); }
}
```

```bash
javac Arb.java
java Arb
```

**Error común.** Defender con opinión.

**Síntoma.** rechazo técnico. **Causa.** sin métricas. **Corrección.** p95/error/costo/trazas/ADRs. **Señal observable.** no hay números.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Gatling/k6/cluster real no ejecutados; se entrega criterio y smoke de evaluación.

## Cierre

El capstone Spring demuestra que puedes diseñar, operar y defender un sistema distribuido con evidencia. Microservicios es un medio, no el objetivo.

## Checklist

- Límites y ownership claros.
- Contratos, idempotencia y saga/outbox.
- Observabilidad, seguridad y entrega.
- ADR y defensa con métricas.
