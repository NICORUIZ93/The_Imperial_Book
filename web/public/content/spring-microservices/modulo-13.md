# Módulo 13 · Gobernanza, FinOps y organización

Los microservicios no fallan solo por código; fallan por decisiones no registradas, costos invisibles y equipos mal alineados. Este módulo cubre ADRs, C4, fitness functions, FinOps y Team Topologies con un enfoque práctico y verificable.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de ADR, fitness functions, presupuesto y alineación de equipos ejecutados con Java puro. Herramientas FinOps/observabilidad reales quedan con nota de verificación.

## Aprende construyendo

### Tema 1: ADRs y C4 · Intermedio · 120 min

Caso guía: el equipo eligió Kafka para eventos de pedidos. Seis meses después nadie recuerda por qué no se usó RabbitMQ ni qué trade-offs se aceptaron.

#### Definición formal

- **ADR (Architecture Decision Record):** documento breve que registra una decisión arquitectónica: contexto, decisión, opciones consideradas, consecuencias y estado.
- **C4 model:** forma de comunicar arquitectura en cuatro niveles: Context, Containers, Components, Code.

#### Contrato / internals

- **ADR mínimo:** id, fecha, estado (proposed/accepted/superseded), contexto, decisión, consecuencias, alternativas.
- **Inmutabilidad práctica:** un ADR aceptado no se reescribe; se reemplaza por otro ADR que lo marca superseded.
- **C4:** cada nivel responde preguntas distintas; no dibujar todos los detalles en el mismo diagrama.
- **Límite:** documentación sin mantenimiento se vuelve mentira; ADRs deben ser cortos y de decisiones relevantes.

#### Cuándo usarlo / cuándo no

**Úsalo** para decisiones costosas de revertir: broker, DB, modelo de consistencia, frontera de servicio. **No** hagas ADR para cada cambio menor de código.

#### Ejemplo mínimo ejecutable

Crea el archivo `Adr.java`:

```java
import java.util.*;
public class Adr {
  public static void main(String[] args) {
    Map<String, String> adr = Map.of(
      "id", "ADR-001",
      "status", "accepted",
      "decision", "Kafka for events"
    );
    System.out.println(adr.get("status"));
    System.out.println(adr.containsKey("decision"));
  }
}
```

```bash
javac Adr.java
java Adr
```

Salida esperada:

```text
accepted
true
```

#### Caso real

`ADR-007` decide usar outbox + Kafka para eventos de dominio. Contexto: dual write previo causó inconsistencias. Consecuencias: más complejidad operativa, pero entrega confiable de eventos.

#### Error común

**Síntoma.** se repite la misma discusión arquitectónica cada trimestre. **Causa.** decisión sin ADR o ADR sin consecuencias/alternativas. **Corrección.** ADR corto con trade-offs y estado. **Señal observable.** decisiones contradictorias entre equipos.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `accepted`, `true`.

**Nota de verificación:** C4/ADR son artefactos de proceso; la verificación real es revisión por pares y que el ADR esté en el repo/versionado.

### Tema 2: Fitness functions y ATAM ligero · Avanzado · 120 min

Caso guía: la arquitectura define que `domain` no debe depender de `web`. Tres meses después, alguien importa un DTO web en el dominio.

#### Definición formal

Una **fitness function** es una prueba automatizada que verifica una característica arquitectónica (acoplamiento, dependencia, latencia, tamaño, etc.). **ATAM ligero** es una evaluación pragmática de trade-offs arquitectónicos usando escenarios y riesgos, sin el peso completo de un proceso formal largo.

#### Contrato / internals

- **Fitness function:** ejecutable en CI; falla ante regresión arquitectónica.
- **Herramientas:** ArchUnit, linters, tests de performance, políticas OPA.
- **ATAM ligero:** escenarios de calidad (latencia, seguridad, disponibilidad), decisiones, riesgos, trade-offs.
- **Límite:** automatizar reglas inestables crea ruido; elegir pocas reglas de alto valor.

#### Cuándo usarlo / cuándo no

**Úsalo** para invariantes arquitectónicos estables. **No** automatices todo; prioriza reglas que prevengan erosión costosa.

#### Ejemplo mínimo ejecutable

Crea el archivo `Fit.java`:

```java
public class Fit {
  static boolean noDomainToWeb(String from, String to) {
    return !(from.equals("domain") && to.equals("web"));
  }
  public static void main(String[] args) {
    System.out.println(noDomainToWeb("domain", "app"));
    System.out.println(noDomainToWeb("domain", "web"));
  }
}
```

```bash
javac Fit.java
java Fit
```

Salida esperada:

```text
true
false
```

#### Caso real

ArchUnit en CI bloquea imports `..web..` desde `..domain..`. Un ATAM ligero evalúa la decisión Kafka vs RabbitMQ con escenarios de throughput, replay y costo operativo.

#### Error común

**Síntoma.** la arquitectura “documentada” no coincide con el código. **Causa.** reglas solo en wiki. **Corrección.** fitness functions en CI para reglas críticas. **Señal observable.** dependencias prohibidas aparecen en PRs sin bloqueo.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó ArchUnit real. Verificación propuesta: regla ArchUnit en `src/test/java` y `./mvnw test`.

### Tema 3: FinOps: costo, right-sizing y observability tax · Intermedio · 120 min

Caso guía: la factura cloud crece 40% tras agregar tracing, logs detallados y réplicas por defecto.

#### Definición formal

FinOps es la práctica de gestionar el costo de cloud con visibilidad, accountability y optimización continua. Right-sizing ajusta recursos al uso real. Observability tax es el costo de métricas, logs, traces y retención.

#### Contrato / internals

- **Visibilidad:** atribuir costo por servicio/equipo/entorno.
- **Budgets/alertas:** detectar desvíos antes de fin de mes.
- **Cardinalidad:** labels con IDs únicos disparan costo de métricas.
- **Retención/sampling:** ajustar logs/traces al valor operativo.
- **Trade-off:** ahorrar costo no debe romper SLOs ni capacidad de diagnóstico.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre en cloud. **No** optimices costo eliminando observabilidad crítica ni bajando recursos por debajo del SLO.

#### Ejemplo mínimo ejecutable

Crea el archivo `Fin.java`:

```java
public class Fin {
  static boolean withinBudget(double cost, double budget) {
    return cost <= budget;
  }
  public static void main(String[] args) {
    System.out.println(withinBudget(80, 100));
    System.out.println(withinBudget(120, 100));
  }
}
```

```bash
javac Fin.java
java Fin
```

Salida esperada:

```text
true
false
```

#### Caso real

Se detecta que un label `userId` en métricas genera alta cardinalidad. Se mueve a logs/traces con sampling; se define budget por servicio y alerta al 80%.

#### Error común

**Síntoma.** factura de observabilidad supera el costo del servicio. **Causa.** alta cardinalidad, retención excesiva, logs debug en prod. **Corrección.** budgets, sampling, cardinalidad controlada, retención por valor. **Señal observable.** costo por GB/log/serie crece sin mejora en MTTR.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** no se ejecutó herramienta FinOps/cloud billing real. Verificación propuesta: dashboard de costo por servicio y alerta de budget en el proveedor cloud.

### Tema 4: Ley de Conway y Team Topologies · Intermedio · 90 min

Caso guía: dos equipos comparten un servicio crítico; los incidentes no tienen dueño claro y los cambios requieren coordinación constante.

#### Definición formal

**Ley de Conway:** las organizaciones diseñan sistemas que reflejan sus estructuras de comunicación. **Team Topologies** define tipos de equipo: stream-aligned, platform, enabling, complicated-subsystem, y modos de interacción (collaboration, X-as-a-service, facilitating).

#### Contrato / internals

- **Ownership:** el equipo que construye el servicio lo opera (you build it, you run it).
- **Cognitive load:** un equipo no debe poseer más servicios de los que puede operar bien.
- **Interfaces de equipo:** APIs, plataformas, SLOs y contratos reducen acoplamiento organizacional.
- **Límite:** reorganizar equipos no arregla un mal dominio; dominio y organización deben alinearse.

#### Cuándo usarlo / cuándo no

**Úsalo** al definir ownership de servicios y plataformas. **No** crees un microservicio por cada persona ni un equipo por cada repo sin capacidad operativa.

#### Ejemplo mínimo ejecutable

Crea el archivo `Team.java`:

```java
public class Team {
  static boolean aligned(boolean ownsCode, boolean ownsOnCall) {
    return ownsCode && ownsOnCall;
  }
  public static void main(String[] args) {
    System.out.println(aligned(true, true));
    System.out.println(aligned(true, false));
  }
}
```

```bash
javac Team.java
java Team
```

Salida esperada:

```text
true
false
```

#### Caso real

El equipo `checkout` es stream-aligned y dueño de `checkout-service`, incluyendo on-call, SLO y backlog. El equipo platform provee Kubernetes/observabilidad como servicio interno.

#### Error común

**Síntoma.** incidentes rebotan entre equipos. **Causa.** ownership difuso, sin on-call claro. **Corrección.** ownership end-to-end por servicio/capacidad. **Señal observable.** MTTR alto y “no es mío” en incidentes.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** Team Topologies es un modelo organizacional; se verifica por claridad de ownership, on-call y métricas DORA/MTTR, no por un test unitario.

## Cierre

La gobernanza ligera evita caos: decisiones registradas, reglas automatizadas, costos visibles y equipos con ownership. En microservicios, la arquitectura también es organización y economía operativa.

## Checklist

- ADRs con consecuencias y estado.
- Fitness functions en CI para invariantes clave.
- FinOps visible por servicio/equipo.
- Ownership end-to-end y cognitive load controlado.
- Notas honestas cuando la verificación es organizacional/herramienta externa.
