# Módulo 4 · Arquitectura y límites de servicio en Tienda Aurora

Dividir un sistema en microservicios sin criterio crea un monolito distribuido: más latencia, más fallos, más coordinación y menos autonomía. Este módulo enseña a decidir límites con evidencia, usando Tienda Aurora como caso de estudio. Los temas son: monolito modular vs microservicios, DDD táctico, Spring Modulith, Strangler Fig y database-per-service.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los smokes ejecutan modelos de decisión, invariantes de agregados, reglas de dependencia modular, routing de migración y ownership de datos en Java puro. Spring Modulith real requiere dependencias Spring; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-architecture

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

### Estructura del proyecto

```text
tienda-aurora-architecture/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/aurora/architecture/
│   │   │   ├── ArchitectureApplication.java
│   │   │   ├── domain/
│   │   │   │   ├── Order.java
│   │   │   │   ├── OrderCreated.java
│   │   │   │   └── OrderAggregate.java
│   │   │   └── decision/
│   │   │       └── ArchitectureDecision.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/aurora/architecture/
│           └── ArchitectureTest.java
└── docker-compose.yml
```

### build.gradle.kts

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.modulith:spring-modulith-starter-core:1.3.0")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test:1.3.0")
    testImplementation("com.tngtech.archunit:archunit-junit5:1.3.0")
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-architecture"
```

### application.yml

```yaml
spring:
  application:
    name: architecture-service

server:
  port: 8080
```

### Tema 1: Monolito modular vs microservicios · Intermedio · 120 min

## Monolito modular vs microservicios: decidir con evidencia

El equipo de Tienda Aurora tiene 6 personas y un solo producto. Alguien propone "pasarnos a microservicios" porque es lo moderno. Tres meses después hay 9 repos, despliegues coordinados, trazas rotas y un bug que cruza 4 servicios. El tiempo de entrega subió y los incidentes también. El problema no fue la tecnología: fue dividir antes de tener límites claros.

Un monolito modular es como una casa con habitaciones bien separadas: una sola puerta de entrada, pero paredes claras. Los microservicios son edificios separados con calles entre ellos. Las calles dan autonomía, pero también tráfico, semáforos y accidentes. No construyes calles dentro de tu sala por estética.

La decisión de extraer un microservicio debe basarse en evidencia, no en moda. Las señales son: límites claros y estables, capacidad de despliegue independiente, equipos autónomos con ownership end-to-end, necesidad de escalado distinto, y dolor de coordinación alto. Si faltan estas señales, el monolito modular es la opción más responsable.

```java
package com.aurora.architecture.decision;

public class ArchitectureDecision {
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
        System.out.println("case-1=" + choose(new Signals(true, true, true, true, 8)));
        System.out.println("case-2=" + choose(new Signals(true, false, true, false, 3)));
    }
}
```

```bash
# Compilar y ejecutar
javac -d out src/main/java/com/aurora/architecture/decision/ArchitectureDecision.java
java -cp out com.aurora.architecture.decision.ArchitectureDecision
```

Salida esperada:

```text
case-1=microservice-candidate
case-2=modular-monolith
```

El primer caso tiene límites claros, equipos listos y alto dolor de coordinación: candidato a microservicio. El segundo tiene buen límite pero sin despliegue independiente ni escalado distinto: monolito modular. Tienda Aurora mantiene catálogo y pedidos en un monolito modular. Extrae billing cuando el dominio regula facturación, tiene otro ritmo de cambio y necesita escalado independiente.

El error más común es extraer microservicios prematuramente. El síntoma es más incidentes y despliegues coordinados. La causa es límites inmaduros y costo distribuido subestimado. La corrección es empezar modular, medir coordinación y extraer por evidencia.

### Tema 2: DDD: bounded contexts, aggregates y domain events · Avanzado · 180 min

## DDD: bounded contexts, aggregates y domain events

En el monolito, la clase `Order` hace de todo: calcula impuestos, reserva stock, cobra, envía email y guarda auditoría. Cualquier cambio en pagos rompe pedidos. Dos equipos tocan el mismo modelo con significados distintos de "cliente" y "estado".

Un bounded context es una frontera lingüística: la palabra "cuenta" significa algo distinto en contabilidad y en soporte técnico. Un aggregate es una pequeña fortaleza: dentro de ella las reglas se cumplen en cada transacción. Un domain event es un anuncio público: "algo importante pasó", sin exponer las tripas internas.

```java
package com.aurora.architecture.domain;

import java.util.*;

public class OrderAggregate {
    public record OrderCreated(String orderId) {}
    public record OrderPaid(String orderId) {}

    private final String id;
    private String status = "NEW";
    private final List<Object> events = new ArrayList<>();

    public OrderAggregate(String id) {
        this.id = id;
        events.add(new OrderCreated(id));
    }

    public void pay() {
        if (!"NEW".equals(status)) throw new IllegalStateException("invalid-transition");
        status = "PAID";
        events.add(new OrderPaid(id));
    }

    public String status() { return status; }
    public List<Object> events() { return List.copyOf(events); }
}
```

```java
package com.aurora.architecture;

import com.aurora.architecture.domain.OrderAggregate;

public class DddExample {
    public static void main(String[] args) {
        OrderAggregate order = new OrderAggregate("o1");
        order.pay();
        System.out.println("status=" + order.status());
        System.out.println("events=" + order.events().size());
        try { order.pay(); } catch (IllegalStateException e) {
            System.out.println("second-pay=" + e.getMessage());
        }
    }
}
```

```bash
# Compilar
javac -d out src/main/java/com/aurora/architecture/domain/OrderAggregate.java
javac -cp out -d out src/main/java/com/aurora/architecture/DddExample.java
# Ejecutar
java -cp out com.aurora.architecture.DddExample
```

Salida esperada:

```text
status=PAID
events=2
second-pay=invalid-transition
```

El aggregate protege la invariante de transición de estado. El evento `OrderPaid` comunica un hecho; no permite que otro contexto modifique tablas internas de Orders. El segundo `pay()` lanza `invalid-transition` porque el estado ya no es `NEW`.

El error más común es crear aggregates gigantes. El síntoma es contención, transacciones largas y merges dolorosos. La causa es meter invariantes no relacionadas en la misma raíz. La corrección es aggregates pequeños con consistencia eventual entre ellos.

### Tema 3: Spring Modulith · Avanzado · 120 min

## Spring Modulith: validar fronteras antes de extraer

El monolito modular "en teoría" tiene módulos, pero en la práctica cualquier paquete importa cualquier clase interna. Cuando intentas extraer `billing`, descubres 47 dependencias ocultas. El límite existía en el diagrama, no en el código.

Spring Modulith es como poner puertas con tarjeta en una oficina. No basta con decir "esta área es de finanzas"; el sistema debe impedir que cualquiera entre por la puerta trasera. Los tests de módulos son el guardia que verifica las puertas.

```java
package com.aurora.architecture;

import java.util.*;

public class ModulithBoundaryExample {
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
javac -d out src/main/java/com/aurora/architecture/ModulithBoundaryExample.java
java -cp out com.aurora.architecture.ModulithBoundaryExample
```

Salida esperada:

```text
billing.api=true
billing.internal=false
```

La regla importante es permitir API pública y prohibir internals. En Spring Modulith real, el test es `ApplicationModules.of(AuroraApplication.class).verify()`.

**Nota de verificación:** no se ejecutó Spring Modulith real. Verificación propuesta: proyecto Spring Boot con dependencia `spring-modulith` y test `ApplicationModules.verify()`.

### Tema 4: Strangler Fig · Intermedio · 120 min

## Strangler Fig: migración sin big bang

El monolito de facturación de Tienda Aurora tiene 8 años. Reescribirlo desde cero en 6 meses suena tentador. A los 4 meses, el nuevo sistema no cubre casos borde, el viejo sigue recibiendo cambios y nadie sabe cuál es la fuente de verdad. El big bang falla.

Strangler Fig es como renovar un edificio por pisos mientras la gente sigue viviendo ahí. No demueles todo; rediriges una capacidad a la parte nueva, verificas que funciona y recién después cierras la vieja.

```java
import java.util.*;

public class StranglerExample {
    static String route(String capability, Set<String> migrated) {
        return migrated.contains(capability) ? "new" : "legacy";
    }

    static boolean safeCutover(boolean backfillDone, boolean checksumsMatch, boolean rollbackReady) {
        return backfillDone && checksumsMatch && rollbackReady;
    }

    public static void main(String[] args) {
        Set<String> migrated = new HashSet<>(Set.of("catalog"));
        System.out.println("catalog=" + route("catalog", migrated));
        System.out.println("billing=" + route("billing", migrated));
        System.out.println("cutover-safe=" + safeCutover(true, true, true));
        System.out.println("cutover-unsafe=" + safeCutover(true, false, true));
    }
}
```

```bash
javac -d out src/main/java/com/aurora/architecture/StranglerExample.java
java -cp out com.aurora.architecture.StranglerExample
```

Salida esperada:

```text
catalog=new
billing=legacy
cutover-safe=true
cutover-unsafe=false
```

El error más común es rollback imposible. El síntoma es caída masiva tras migración. La causa es big bang sin ruta incremental. La corrección es Strangler Fig, feature flags, backfill, reconciliación y rollback plan.

### Tema 5: Database-per-service · Avanzado · 120 min

## Database-per-service: autonomía real

`orders-service` y `billing-service` comparten la misma base de datos. Un cambio de columna para billing rompe queries de orders en producción. Nadie puede desplegar de forma independiente porque el esquema es un punto de acoplamiento global.

Database-per-service es como tener tu propio cuaderno. Puedes escribir en tu cuaderno sin pedir permiso al equipo de al lado. Si necesitas información del otro, le preguntas o lees un aviso publicado, pero no le arrancas páginas a su cuaderno.

```java
import java.util.*;

public class DatabaseOwnershipExample {
    static boolean canWrite(String service, String tableOwner) {
        return service.equals(tableOwner);
    }

    static String readStrategy(String consumer, String owner) {
        return consumer.equals(owner) ? "LOCAL_QUERY" : "API_OR_EVENT_PROJECTION";
    }

    public static void main(String[] args) {
        System.out.println("orders-writes-orders=" + canWrite("orders", "orders"));
        System.out.println("billing-writes-orders=" + canWrite("billing", "orders"));
        System.out.println("billing-reads-orders=" + readStrategy("billing", "orders"));
    }
}
```

```bash
javac -d out src/main/java/com/aurora/architecture/DatabaseOwnershipExample.java
java -cp out com.aurora.architecture.DatabaseOwnershipExample
```

Salida esperada:

```text
orders-writes-orders=true
billing-writes-orders=false
billing-reads-orders=API_OR_EVENT_PROJECTION
```

Escribir directo en tablas ajenas rompe autonomía. Leer datos ajenos se hace por API o proyección alimentada por eventos, aceptando consistencia eventual. El costo de database-per-service es complejidad: ya no hay joins cross-service ni transacciones ACID simples entre servicios.

## Cierre

Los límites correctos son la decisión arquitectónica más cara de revertir. Monolito modular cuando no hay evidencia; DDD para dominios complejos; Spring Modulith para validar fronteras antes de extraer; Strangler Fig para migrar sin big bang; database-per-service para proteger la autonomía una vez que la división es real. Microservicios no son un objetivo; son un trade-off que se justifica con evidencia. Tienda Aurora se diseña con bounded contexts, se implementa con contratos y idempotencia, y se defiende con métricas y ADRs.

## Checklist

- Decisión modular vs microservicio basada en evidencia.
- Bounded contexts y aggregates con invariantes claras.
- Fronteras de módulo verificadas en CI.
- Migración incremental con source of truth y rollback.
- Sin acceso cross-service directo a base de datos.
- Verificación honesta cuando falta infraestructura.
