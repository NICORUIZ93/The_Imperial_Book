# Módulo 4 · Arquitectura y límites de servicio en Tienda Aurora

Dividir un sistema en microservicios sin criterio crea un monolito distribuido: más latencia, más fallos, más coordinación y menos autonomía. Este módulo enseña a decidir límites con evidencia, usando Tienda Aurora como caso de estudio. Los temas son: monolito modular vs microservicios, DDD táctico, Spring Modulith, Strangler Fig y database-per-service.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes ejecutan modelos de decisión, invariantes de agregados, reglas de dependencia modular, routing de migración y ownership de datos en Java puro. Spring Modulith real requiere dependencias Spring; se incluye nota de verificación honesta.

### Tema 1: Monolito modular vs microservicios · Intermedio · 120 min

## Monolito modular vs microservicios

El equipo de Tienda Aurora tiene 6 personas y un solo producto. Alguien propone "pasarnos a microservicios" porque es lo moderno. Tres meses después hay 9 repos, despliegues coordinados, trazas rotas y un bug que cruza 4 servicios. El tiempo de entrega subió y los incidentes también. El problema no fue la tecnología: fue dividir antes de tener límites claros.

Un monolito modular es como una casa con habitaciones bien separadas: una sola puerta de entrada, pero paredes claras. Los microservicios son edificios separados con calles entre ellos. Las calles dan autonomía, pero también tráfico, semáforos y accidentes. No construyes calles dentro de tu sala por estética.

La decisión de extraer un microservicio debe basarse en evidencia, no en moda. Las señales son: límites claros y estables, capacidad de despliegue independiente, equipos autónomos con ownership end-to-end, necesidad de escalado distinto, y dolor de coordinación alto. Si faltan estas señales, el monolito modular es la opción más responsable.

```java
public class ArchitectureDecisionSmoke {
    record Signals(boolean clearBoundary, boolean independentDeploy, boolean teamReady,
                   boolean differentScaling, int coordinationPain) {}

    static String choose(Signals s) {
        int score = 0;
        if (s.clearBoundary()) score++;
        if (s.independentDeploy()) score++;
        if (s.teamReady()) score++;
        if (s.differentScaling()) score++;
        if (s.coordinationPain() >= 7) score++;
        return score >= 4 ? "microservice-candidate" : "modular-monolith";
    }

    public static void main(String[] args) {
        System.out.println(choose(new Signals(true, true, true, true, 8)));
        System.out.println(choose(new Signals(true, false, true, false, 3)));
    }
}
```

```bash
javac ArchitectureDecisionSmoke.java
java ArchitectureDecisionSmoke
```

Salida esperada:

```text
microservice-candidate
modular-monolith
```

El primer caso tiene límites claros, equipos listos y alto dolor de coordinación: candidato a microservicio. El segundo tiene buen límite pero sin despliegue independiente ni escalado distinto: monolito modular. La regla es: extraer solo cuando las señales lo justifiquen.

Tienda Aurora mantiene catálogo y pedidos en un monolito modular. Extrae billing cuando el dominio regula facturación, tiene otro ritmo de cambio y necesita escalado independiente. Billing es el primer candidato porque tiene frontera clara y requisitos distintos.

El error más común es extraer microservicios prematuramente. El síntoma es más incidentes y despliegues coordinados. La causa es límites inmaduros y costo distribuido subestimado. La corrección es empezar modular, medir coordinación y extraer por evidencia. La señal observable es que el lead time sube tras la división.

### Tema 2: DDD: bounded contexts, aggregates y domain events · Avanzado · 180 min

## DDD: bounded contexts, aggregates y domain events

En el monolito, la clase `Order` hace de todo: calcula impuestos, reserva stock, cobra, envía email y guarda auditoría. Cualquier cambio en pagos rompe pedidos. Dos equipos tocan el mismo modelo con significados distintos de "cliente" y "estado".

Un bounded context es una frontera lingüística: la palabra "cuenta" significa algo distinto en contabilidad y en soporte técnico. Un aggregate es una pequeña fortaleza: dentro de ella las reglas se cumplen en cada transacción. Un domain event es un anuncio público: "algo importante pasó", sin exponer las tripas internas.

```java
import java.util.*;

public class DddSmoke {
    record OrderCreated(String orderId) {}
    record OrderPaid(String orderId) {}

    static class OrderAggregate {
        private final String id;
        private String status = "NEW";
        private final List<Object> events = new ArrayList<>();

        OrderAggregate(String id) {
            this.id = id;
            events.add(new OrderCreated(id));
        }

        void pay() {
            if (!"NEW".equals(status)) throw new IllegalStateException("invalid-transition");
            status = "PAID";
            events.add(new OrderPaid(id));
        }

        String status() { return status; }
        List<Object> events() { return List.copyOf(events); }
    }

    public static void main(String[] args) {
        OrderAggregate order = new OrderAggregate("o1");
        order.pay();
        System.out.println(order.status());
        System.out.println(order.events().size());
        try { order.pay(); } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

```bash
javac DddSmoke.java
java DddSmoke
```

Salida esperada:

```text
PAID
2
invalid-transition
```

El aggregate protege la invariante de transición de estado. El evento `OrderPaid` comunica un hecho; no permite que otro contexto modifique tablas internas de Orders. El segundo `pay()` lanza `invalid-transition` porque el estado ya no es `NEW`.

El error más común es crear aggregates gigantes. El síntoma es contención, transacciones largas y merges dolorosos. La causa es meter invariantes no relacionadas en la misma raíz. La corrección es aggregates pequeños con consistencia eventual entre ellos. La señal observable es locks y latencia alta en writes.

DDD táctico sirve para dominios con reglas reales. En CRUD simple, agrega ceremonia. El valor está en límites claros e invariantes protegidas.

### Tema 3: Spring Modulith · Avanzado · 120 min

## Spring Modulith como paso intermedio

El monolito modular "en teoría" tiene módulos, pero en la práctica cualquier paquete importa cualquier clase interna. Cuando intentas extraer `billing`, descubres 47 dependencias ocultas. El límite existía en el diagrama, no en el código.

Spring Modulith es como poner puertas con tarjeta en una oficina. No basta con decir "esta área es de finanzas"; el sistema debe impedir que cualquiera entre por la puerta trasera. Los tests de módulos son el guardia que verifica las puertas.

```java
import java.util.*;

public class ModulithBoundarySmoke {
    record Dependency(String from, String to) {}

    static boolean allowed(Dependency dep) {
        if (dep.from().equals("orders") && dep.to().equals("billing.internal")) return false;
        return true;
    }

    public static void main(String[] args) {
        List<Dependency> deps = List.of(
            new Dependency("orders", "billing.api"),
            new Dependency("orders", "billing.internal")
        );
        for (Dependency dep : deps) {
            System.out.println(dep.to() + "=" + allowed(dep));
        }
    }
}
```

```bash
javac ModulithBoundarySmoke.java
java ModulithBoundarySmoke
```

Salida esperada:

```text
billing.api=true
billing.internal=false
```

La regla importante es permitir API pública y prohibir internals. Spring Modulith automatiza esta verificación sobre la estructura real de la app Spring. El test real en Spring Modulith es `ApplicationModules.of(AuroraApplication.class).verify()`.

El error más común es módulos sin test de frontera. El síntoma es acoplamiento invisible. La causa son imports cruzados no detectados. La corrección es verificar módulos en CI y exponer APIs. La señal observable es que un cambio pequeño rompe otro módulo.

**Nota de verificación:** no se ejecutó Spring Modulith real. Verificación propuesta: proyecto Spring Boot con dependencia `spring-modulith` y test `ApplicationModules.verify()`.

### Tema 4: Strangler Fig · Intermedio · 120 min

## Strangler Fig para migración incremental

El monolito de facturación tiene 8 años. Reescribirlo desde cero en 6 meses suena tentador. A los 4 meses, el nuevo sistema no cubre casos borde, el viejo sigue recibiendo cambios y nadie sabe cuál es la fuente de verdad. El big bang falla.

Strangler Fig es como renovar un edificio por pisos mientras la gente sigue viviendo ahí. No demueles todo el edificio; rediriges una capacidad a la parte nueva, verificas que funciona y recién después cierras la vieja. El router es la puerta temporal que decide a dónde va cada persona.

```java
import java.util.*;

public class StranglerSmoke {
    static String route(String capability, Set<String> migrated) {
        return migrated.contains(capability) ? "new" : "legacy";
    }

    static boolean safeCutover(boolean backfillDone, boolean checksumsMatch, boolean rollbackReady) {
        return backfillDone && checksumsMatch && rollbackReady;
    }

    public static void main(String[] args) {
        Set<String> migrated = new HashSet<>(Set.of("catalog"));
        System.out.println(route("catalog", migrated));
        System.out.println(route("billing", migrated));
        System.out.println(safeCutover(true, true, true));
        System.out.println(safeCutover(true, false, true));
    }
}
```

```bash
javac StranglerSmoke.java
java StranglerSmoke
```

Salida esperada:

```text
new
legacy
true
false
```

El routing por capacidad permite migrar incrementalmente. El cutover seguro requiere backfill completo, checksums coincidentes y rollback listo. Si falta alguno, el cutover es ciego.

El error más común es doble escritura sin estrategia. El síntoma son datos divergentes. La causa es no definir source of truth ni cutover. La corrección es CDC/outbox, backfill, reconciliación y rollback. La señal observable son conteos distintos entre sistemas.

### Tema 5: Database-per-service · Avanzado · 120 min

## Database-per-service para autonomía real

`orders-service` y `billing-service` comparten la misma base de datos. Un cambio de columna para billing rompe queries de orders en producción. Nadie puede desplegar de forma independiente porque el esquema es un punto de acoplamiento global.

Database-per-service es como tener tu propio cuaderno. Puedes escribir en tu cuaderno sin pedir permiso al equipo de al lado. Si necesitas información del otro, le preguntas o lees un aviso publicado, pero no le arrancas páginas a su cuaderno.

```java
import java.util.*;

public class DatabaseOwnershipSmoke {
    static boolean canWrite(String service, String tableOwner) {
        return service.equals(tableOwner);
    }

    static String readStrategy(String consumer, String owner) {
        return consumer.equals(owner) ? "LOCAL_QUERY" : "API_OR_EVENT_PROJECTION";
    }

    public static void main(String[] args) {
        System.out.println(canWrite("orders", "orders"));
        System.out.println(canWrite("billing", "orders"));
        System.out.println(readStrategy("billing", "orders"));
    }
}
```

```bash
javac DatabaseOwnershipSmoke.java
java DatabaseOwnershipSmoke
```

Salida esperada:

```text
true
false
API_OR_EVENT_PROJECTION
```

Escribir directo en tablas ajenas rompe autonomía. Leer datos ajenos se hace por API o proyección alimentada por eventos, aceptando consistencia eventual. El costo de database-per-service es complejidad: ya no hay joins cross-service ni transacciones ACID simples entre servicios.

El error más común es base de datos compartida entre servicios. El síntoma son despliegues coordinados por migración. La causa es acoplamiento por datos. La corrección es ownership, API/eventos y proyecciones. La señal observable es que un cambio de columna rompe otro servicio.

## Cierre

Los límites correctos son la decisión arquitectónica más cara de revertir. Monolito modular cuando no hay evidencia; DDD para dominios complejos; Spring Modulith para validar fronteras antes de extraer; Strangler Fig para migrar sin big bang; database-per-service para proteger la autonomía una vez que la división es real. Microservicios no son un objetivo; son un trade-off que se justifica con evidencia.

## Checklist

- Decisión modular vs microservicio basada en evidencia.
- Bounded contexts y aggregates con invariantes claras.
- Fronteras de módulo verificadas en CI.
- Migración incremental con source of truth y rollback.
- Sin acceso cross-service directo a base de datos.
- Verificación honesta cuando falta infraestructura.
