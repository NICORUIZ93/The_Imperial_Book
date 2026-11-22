# Módulo 13 · Gobernanza, FinOps y organización

Los microservicios no fallan solo por código; fallan por decisiones no registradas, costos invisibles y equipos mal alineados. Este módulo cubre ADRs, C4, fitness functions, FinOps y Team Topologies.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan checks de ADR, fitness functions y costos con Java puro. Herramientas de FinOps/observabilidad reales son notas de verificación.

## Aprende construyendo

### Tema 1: ADRs y C4 · Intermedio · 120 min

Caso guía: documentar por qué se eligió Kafka.

#### ADR y C4

**Definición formal.** ADR registra decisión, contexto, opciones y consecuencias. C4 modela arquitectura en Context, Container, Component, Code.

**Cuándo usarlo / cuándo no.** ADR para decisiones costosas de revertir; C4 para comunicar arquitectura. No documentes todo al mismo nivel.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm13-adr
cd sm13-adr
```

Crea el archivo `Adr.java`:

```java
import java.util.*;
public class Adr {
  public static void main(String[] args) {
    Map<String,String> adr = Map.of("id","ADR-001","status","accepted","decision","Kafka for events");
    System.out.println(adr.get("status"));
    System.out.println(adr.containsKey("decision"));
  }
}
```

```bash
javac Adr.java
java Adr
```

**Error común.** ADR sin consecuencias.

**Síntoma.** decisiones repetidas. **Causa.** falta trade-off. **Corrección.** incluir consecuencias y estado. **Señal observable.** debates recurrentes.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `accepted`, `true`.

### Tema 2: Fitness functions y ATAM ligero · Avanzado · 120 min

Caso guía: evitar que domain dependa de web.

#### Fitness function

**Definición formal.** Prueba automatizada de una característica arquitectónica. ATAM ligero evalúa trade-offs con escenarios.

**Cuándo usarlo / cuándo no.** Úsalo para reglas estables. No automatices reglas volátiles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm13-fit
cd sm13-fit
```

Crea el archivo `Fit.java`:

```java
public class Fit {
  static boolean noDomainToWeb(String from,String to){ return !(from.equals("domain") && to.equals("web")); }
  public static void main(String[] args){ System.out.println(noDomainToWeb("domain","app")); System.out.println(noDomainToWeb("domain","web")); }
}
```

```bash
javac Fit.java
java Fit
```

**Error común.** Reglas solo en documentos.

**Síntoma.** erosión arquitectónica. **Causa.** sin enforcement. **Corrección.** ArchUnit/CI. **Señal observable.** imports indebidos.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

### Tema 3: FinOps: costo, right-sizing y observability tax · Intermedio · 120 min

Caso guía: controlar costo de logs, métricas y réplicas.

#### FinOps

**Definición formal.** Práctica de gestionar costo cloud con visibilidad, accountability y optimización.

**Cuándo usarlo / cuándo no.** Siempre en cloud. No optimices costo rompiendo SLO.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm13-fin
cd sm13-fin
```

Crea el archivo `Fin.java`:

```java
public class Fin {
  static boolean withinBudget(double cost, double budget){ return cost <= budget; }
  public static void main(String[] args){ System.out.println(withinBudget(80,100)); System.out.println(withinBudget(120,100)); }
}
```

```bash
javac Fin.java
java Fin
```

**Error común.** Observabilidad sin control de cardinalidad.

**Síntoma.** factura inesperada. **Causa.** labels/retención sin límites. **Corrección.** budgets, sampling, cardinalidad. **Señal observable.** costo de observabilidad crece rápido.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

### Tema 4: Ley de Conway y Team Topologies · Intermedio · 90 min

Caso guía: alinear equipos y servicios.

#### Organización

**Definición formal.** Ley de Conway: los sistemas reflejan la estructura de comunicación de la organización. Team Topologies propone stream-aligned, platform, enabling y complicated-subsystem teams.

**Cuándo usarlo / cuándo no.** Úsalo al definir ownership. No crees equipos por cada microservicio sin capacidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm13-team
cd sm13-team
```

Crea el archivo `Team.java`:

```java
public class Team {
  static boolean aligned(boolean ownsCode, boolean ownsOnCall){ return ownsCode && ownsOnCall; }
  public static void main(String[] args){ System.out.println(aligned(true,true)); System.out.println(aligned(true,false)); }
}
```

```bash
javac Team.java
java Team
```

**Error común.** Equipo sin ownership operativo.

**Síntoma.** handoffs y MTTR alto. **Causa.** “you build it, someone else runs it”. **Corrección.** ownership end-to-end. **Señal observable.** incidentes sin dueño claro.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

## Cierre

La gobernanza ligera evita caos: decisiones registradas, reglas automatizadas, costos visibles y equipos con ownership.

## Checklist

- ADRs con consecuencias.
- Fitness functions en CI.
- FinOps visible.
- Equipos alineados al ownership.
