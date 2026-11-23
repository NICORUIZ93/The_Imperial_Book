# Módulo 13 · Gobernanza, FinOps y organización en Tienda Aurora

Los microservicios no fallan solo por código; fallan por decisiones no registradas, costos invisibles y equipos mal alineados. Este módulo cubre ADRs, C4, fitness functions, FinOps y Team Topologies con un enfoque práctico y verificable, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de ADR, fitness functions, presupuesto y alineación de equipos ejecutados con Java puro. Herramientas FinOps/observabilidad reales quedan con nota de verificación.

### Tema 1: ADRs y C4 · Intermedio · 120 min

## ADRs y C4: decisiones que no se repiten

El equipo eligió Kafka para eventos de pedidos en Tienda Aurora. Seis meses después nadie recuerda por qué no se usó RabbitMQ ni qué trade-offs se aceptaron. Un nuevo integrante propone cambiar a RabbitMQ "porque es más simple". La discusión se repite desde cero porque la decisión nunca se registró.

Un ADR es como el acta de una reunión importante: registra qué se decidió, por qué, qué alternativas se consideraron y qué consecuencias se aceptaron. No es documentación exhaustiva; es memoria institucional. C4 es como un mapa a distintas escalas: desde la ciudad (contexto) hasta el edificio (componentes).

```java
import java.util.*;

public class AdrSmoke {
    record Adr(String id, String status, String decision, List<String> consequences) {}

    public static void main(String[] args) {
        Adr adr = new Adr("ADR-001", "accepted", "Kafka for events",
            List.of("replay capability", "operational complexity"));
        System.out.println("status=" + adr.status());
        System.out.println("consequences=" + adr.consequences().size());
        System.out.println("id=" + adr.id() + " decision=" + adr.decision());
    }
}
```

```bash
javac AdrSmoke.java
java AdrSmoke
```

Salida esperada:

```text
status=accepted
consequences=2
id=ADR-001 decision=Kafka for events
```

El error más común es decisiones sin ADR. El síntoma es que se repite la misma discusión arquitectónica cada trimestre. La causa es decisión sin ADR o ADR sin consecuencias/alternativas. La corrección es ADR corto con trade-offs y estado.

### Tema 2: Fitness functions y ATAM ligero · Avanzado · 120 min

## Fitness functions: arquitectura ejecutable

La arquitectura de Tienda Aurora documenta que `domain` no debe depender de `web`. Tres meses después, alguien importa un DTO web en el dominio. Nadie se da cuenta hasta un refactor. La regla era humana, no ejecutable.

Una fitness function es como una alarma en la puerta: si alguien intenta entrar por la puerta prohibida, la alarma suena en CI, no en producción. ATAM ligero es una revisión pragmática de trade-offs con escenarios y riesgos, sin el peso de un proceso formal largo.

```java
public class FitnessSmoke {
    static boolean noDomainToWeb(String from, String to) {
        return !(from.equals("domain") && to.equals("web"));
    }

    public static void main(String[] args) {
        System.out.println("domain->app=" + noDomainToWeb("domain", "app"));
        System.out.println("domain->web=" + noDomainToWeb("domain", "web"));
    }
}
```

```bash
javac FitnessSmoke.java
java FitnessSmoke
```

Salida esperada:

```text
domain->app=true
domain->web=false
```

El error más común es reglas solo en wiki. El síntoma es la arquitectura documentada no coincide con el código. La causa es sin enforcement automático. La corrección es fitness functions en CI para reglas críticas.

### Tema 3: FinOps: costo, right-sizing y observability tax · Intermedio · 120 min

## FinOps: costo visible y controlado

La factura cloud de Tienda Aurora crece 40% tras agregar tracing, logs detallados y réplicas por defecto. Nadie sabe qué servicio cuesta más. El equipo de observabilidad no tiene budget. El CFO pregunta "¿cuánto cuesta un pedido?" y nadie puede responder.

FinOps es como el medidor de agua de un edificio: si no mides por apartamento, nadie ahorra. Right-sizing es ajustar el tamaño del apartamento al número de personas. El observability tax es el costo de medir: si mides todo con la máxima resolución, el medidor cuesta más que el agua.

```java
public class FinOpsSmoke {
    static boolean withinBudget(double cost, double budget) { return cost <= budget; }
    static int rightSize(int actualCpu, int requestedCpu) {
        if (actualCpu < requestedCpu / 2) return requestedCpu / 2;
        return requestedCpu;
    }

    public static void main(String[] args) {
        System.out.println("within-budget-80=" + withinBudget(80, 100));
        System.out.println("within-budget-120=" + withinBudget(120, 100));
        System.out.println("right-size=" + rightSize(20, 100));
    }
}
```

```bash
javac FinOpsSmoke.java
java FinOpsSmoke
```

Salida esperada:

```text
within-budget-80=true
within-budget-120=false
right-size=50
```

El error más común es factura de observabilidad supera el servicio. El síntoma es costo por GB/log/serie crece. La causa es alta cardinalidad, retención excesiva, debug en prod. La corrección es budgets, sampling, cardinalidad controlada, retención por valor.

### Tema 4: Ley de Conway y Team Topologies · Intermedio · 90 min

## Team Topologies: ownership que reduce fricción

Dos equipos comparten un servicio crítico en Tienda Aurora. Los incidentes rebotan entre ellos: "no es mío". Los cambios requieren coordinación constante. El MTTR es alto porque nadie es dueño completo. La arquitectura refleja la organización disfuncional.

La Ley de Conway dice que el sistema refleja la estructura de comunicación de la organización. Team Topologies propone equipos stream-aligned (dueños de un flujo de valor), platform (servicios internos), enabling (ayudan a otros) y complicated-subsystem (especialistas). La regla: you build it, you run it.

```java
public class TeamTopologySmoke {
    static boolean aligned(boolean ownsCode, boolean ownsOnCall, boolean ownsSlo) {
        return ownsCode && ownsOnCall && ownsSlo;
    }

    public static void main(String[] args) {
        System.out.println("aligned-full=" + aligned(true, true, true));
        System.out.println("aligned-no-oncall=" + aligned(true, false, true));
    }
}
```

```bash
javac TeamTopologySmoke.java
java TeamTopologySmoke
```

Salida esperada:

```text
aligned-full=true
aligned-no-oncall=false
```

El error más común es ownership difuso. El síntoma es incidentes rebotan, MTTR alto. La causa es sin on-call claro, equipos compartiendo servicio. La corrección es ownership end-to-end por servicio/capacidad.

## Cierre

La gobernanza ligera evita caos: decisiones registradas, reglas automatizadas, costos visibles y equipos con ownership. En microservicios, la arquitectura también es organización y economía operativa. Tienda Aurora se gobierna con ADRs en el repo, fitness functions en CI, FinOps visible por servicio y ownership end-to-end.

## Checklist

- ADRs con consecuencias y estado.
- Fitness functions en CI para invariantes clave.
- FinOps visible por servicio/equipo.
- Ownership end-to-end y cognitive load controlado.
- Nota de verificación honesta cuando la verificación es organizacional.
