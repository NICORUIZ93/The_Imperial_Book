# Módulo 15 · Capstone: Tienda Aurora en producción

El capstone cierra el track: diseño, implementación, operación y defensa. El objetivo es demostrar criterio arquitectónico con evidencia, no solo código funcionando. Tienda Aurora evoluciona desde monolito modular hasta sistema distribuido operado en producción.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los smokes son ejecutables con Java; infraestructura completa (Kafka/Keycloak/K8s/Gatling) queda con nota de verificación honesta.

## Proyecto desde cero: tienda-aurora-capstone

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
docker --version  # Docker 24+
```

### Estructura del proyecto

```text
tienda-aurora-capstone/
├── build.gradle.kts
├── settings.gradle.kts
├── docker-compose.yml
├── catalog-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/catalog/
│       ├── CatalogApplication.java
│       └── service/ProductService.java
├── orders-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/orders/
│       ├── OrdersApplication.java
│       └── service/OrderService.java
├── billing-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/billing/
│       ├── BillingApplication.java
│       └── service/PaymentService.java
└── notifications-service/
    ├── build.gradle.kts
    └── src/main/java/com/aurora/notifications/
        ├── NotificationsApplication.java
        └── service/NotificationService.java
```

### build.gradle.kts (raíz)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
}

subprojects {
    apply(plugin = "java")
    java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
    repositories { mavenCentral() }
    dependencies {
        implementation("org.springframework.boot:spring-boot-starter-web")
        implementation("org.springframework.boot:spring-boot-starter-actuator")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-capstone"
include("catalog-service", "orders-service", "billing-service", "notifications-service")
```

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: aurora
      POSTGRES_USER: aurora
      POSTGRES_PASSWORD: aurora
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
```

### Tema 1: Diseño del sistema y límites · Experto · 360 min

## Diseño del sistema y límites

El equipo empieza el capstone creando repos, pipelines y clusters antes de definir qué servicios existen y por qué. Tres semanas después, un cambio de requisito obliga a reestructurar 4 servicios porque los límites eran arbitrarios. El diseño llegó después de la infraestructura.

Diseñar límites es como dibujar el plano de una casa antes de construir. Si empiezas por los cimientos sin plano, cada habitación queda mal ubicada. Los bounded contexts son las habitaciones: cada una tiene una función clara, puertas definidas y un dueño.

```java
import java.util.*;

public class CapstoneDesignExample {
    record Service(String name, String owner, String db) {}

    static boolean validDesign(List<Service> services) {
        Set<String> dbs = new HashSet<>();
        for (Service s : services) dbs.add(s.db());
        if (dbs.size() != services.size()) return false;
        return services.stream().allMatch(s -> !s.owner().isBlank());
    }

    public static void main(String[] args) {
        List<Service> services = List.of(
            new Service("orders", "team-orders", "orders_db"),
            new Service("catalog", "team-catalog", "catalog_db"),
            new Service("billing", "team-billing", "billing_db"),
            new Service("notifications", "team-notifications", "notifications_db")
        );
        System.out.println("services=" + services.size());
        System.out.println("valid-design=" + validDesign(services));
        System.out.println("no-shared-db=" + !services.stream().map(Service::db).toList().contains("shared-db"));
    }
}
```

```bash
javac CapstoneDesignExample.java
java CapstoneDesignExample
```

Salida esperada:

```text
services=4
valid-design=true
no-shared-db=true
```

El error más común es sobre-descomposición: 12 servicios para un MVP pequeño. La causa es dividir sin frontera real. La corrección es pocos contextos claros, extraer solo cuando haya frontera real.

### Tema 2: Contratos, idempotencia y saga/outbox · Experto · 360 min

## Contratos, idempotencia y saga/outbox

El capstone tiene 4 servicios y 3 flujos críticos. En el primer test de integración, un reintento de red duplica el cobro y el email se envía dos veces. El equipo asume que "el broker entrega una vez". No fue así.

Los contratos son como los planos eléctricos del edificio: cada servicio sabe qué cable conectar. La idempotencia es como el número de ticket: aunque te atiendan dos veces, el trámite se procesa una. El outbox es el buzón de salida del pedido. La saga es el plan de contingencia cuando un paso falla.

```java
import java.util.*;

public class CapstoneFlowExample {
    record Event(String eventId, String orderId) {}

    static class IdempotentProcessor {
        private final Set<String> seen = new HashSet<>();
        private final List<String> effects = new ArrayList<>();

        String process(Event e, String effect) {
            if (!seen.add(e.eventId())) return "duplicate-ignored";
            effects.add(effect + ":" + e.orderId());
            return "processed";
        }

        int effectCount() { return effects.size(); }
    }

    public static void main(String[] args) {
        IdempotentProcessor p = new IdempotentProcessor();
        Event e = new Event("evt-1", "ord-1");
        System.out.println("first=" + p.process(e, "charge"));
        System.out.println("retry=" + p.process(e, "charge"));
        System.out.println("effects=" + p.effectCount());
    }
}
```

```bash
javac CapstoneFlowExample.java
java CapstoneFlowExample
```

Salida esperada:

```text
first=processed
retry=duplicate-ignored
effects=1
```

El error más común es doble cobro o doble email. La causa son retries/redelivery sin idempotencia. La corrección es outbox, dedup, idempotency keys y compensaciones.

### Tema 3: Observabilidad, seguridad y despliegue · Experto · 240 min

## Observabilidad, seguridad y despliegue

El capstone "funciona en local". En producción, un deploy causa downtime porque no hay readiness probe. Un incidente ocurre y nadie puede reconstruir la request porque no hay traceId. Un endpoint admin está expuesto sin auth. El sistema funcional no es operable.

La operación productiva es como el sistema de soporte vital de un hospital: no es la cirugía (el código), pero sin él el paciente no sobrevive. Observabilidad es el monitor, seguridad es el control de acceso, despliegue es la anestesia que permite operar sin dolor.

```java
public class CapstoneOpsExample {
    static boolean ready(boolean db, boolean broker, boolean cache) {
        return db && broker && cache;
    }

    static boolean authorized(String role, String action) {
        if ("ADMIN".equals(role)) return true;
        return "USER".equals(role) && "read".equals(action);
    }

    public static void main(String[] args) {
        System.out.println("ready-all-up=" + ready(true, true, true));
        System.out.println("ready-broker-down=" + ready(true, false, true));
        System.out.println("user-delete=" + authorized("USER", "delete"));
    }
}
```

```bash
javac CapstoneOpsExample.java
java CapstoneOpsExample
```

Salida esperada:

```text
ready-all-up=true
ready-broker-down=false
user-delete=false
```

El error más común es downtime en deploy. El síntoma es 503 en rollout. La causa son probes mal definidas o sin graceful shutdown. La corrección es readiness/liveness separadas, graceful shutdown, canary.

### Tema 4: Carga, restricción sobrevenida y defensa ARB · Experto · 240 min

## Carga, restricción sobrevenida y defensa ARB

El ARB pide "reduce costo 30% sin romper p95 < 300ms ni error rate < 1%". El equipo no tiene métricas, no tiene load test y no tiene ADR. La defensa se convierte en opinión. El ARB rechaza.

La defensa ARB es como un juicio: necesitas evidencia, no opiniones. p95 es el testigo experto, el error rate es el informe de daños, el costo es el presupuesto. Sin números, la defensa es "creo que funciona". Con números, es "aquí está la evidencia".

```java
public class CapstoneArbExample {
    record Constraints(int p95Ms, double errorRate, double costDelta) {}

    static boolean pass(Constraints c) {
        return c.p95Ms() < 300 && c.errorRate() < 0.01 && c.costDelta() <= 0;
    }

    static String defense(Constraints c) {
        if (pass(c)) return "approved";
        if (c.p95Ms() >= 300) return "fail: p95 too high";
        if (c.errorRate() >= 0.01) return "fail: error rate too high";
        return "fail: cost not reduced";
    }

    public static void main(String[] args) {
        System.out.println(defense(new Constraints(180, 0.002, -0.1)));
        System.out.println(defense(new Constraints(400, 0.002, -0.1)));
        System.out.println(defense(new Constraints(180, 0.02, -0.1)));
    }
}
```

```bash
javac CapstoneArbExample.java
java CapstoneArbExample
```

Salida esperada:

```text
approved
fail: p95 too high
fail: error rate too high
```

El error más común es claims sin métricas. El síntoma es rechazo en ARB. La causa es sin números ni trade-offs. La corrección es llevar p95/error/costo, trazas, alternativas y riesgos.

## Cierre

El capstone Spring demuestra que puedes diseñar, operar y defender un sistema distribuido con evidencia. Microservicios es un medio, no el objetivo. Tienda Aurora se diseña con bounded contexts, se implementa con contratos y idempotencia, se opera con observabilidad y seguridad, y se defiende con métricas y ADRs. Gradle coordina el build multi-módulo con dependencias por servicio.

## Checklist

- Límites y ownership claros.
- Contratos, idempotencia y saga/outbox.
- Observabilidad, seguridad y entrega.
- ADR y defensa con métricas.
- Verificación honesta de lo ejecutado vs no ejecutado.
