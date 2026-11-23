# Módulo 0 · Java moderno y Spring Boot para Tienda Aurora

Antes de hablar de gateways, sagas o Kubernetes, un microservicio Spring necesita una base sólida: Java moderno, concurrencia, contenedor de dependencias, configuración y opciones de runtime. Este módulo va de cero a experto en esa base, usando Tienda Aurora como proyecto integrador. Los temas son: Java 21+, Virtual Threads, IoC/DI, auto-configuración, multi-módulo con Gradle, perfiles, CRaC y GraalVM Native Image.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los ejemplos Java puros se ejecutaron localmente. CRaC/GraalVM reales requieren toolchain específico; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-foundation

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

### Estructura del proyecto

```text
tienda-aurora-foundation/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── java/com/aurora/foundation/
            └── Main.java
```

### build.gradle.kts

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass.set("com.aurora.foundation.Main")
}

repositories {
    mavenCentral()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-foundation"
```

### Ejecutar

```bash
./gradlew run
```

### Tema 1: Java 21+: streams, lambdas, Optional, records, pattern matching · Intermedio · 45 min

## Java 21+: streams, lambdas, Optional, records y pattern matching

Tienda Aurora necesita normalizar pedidos entrantes: filtrar inválidos y producir DTOs inmutables. El código con bucles anidados y null checks dispersos es difícil de leer, probar y paralelizar. Java moderno reduce boilerplate y hace el contrato de datos explícito.

Streams expresan transformaciones lazy; Optional expresa ausencia; records modelan datos inmutables; pattern matching reduce casting frágil. La clave es que streams no son reutilizables: una vez consumidos, se cierran. Optional no debe usarse en campos de entidades JPA ni como parámetro general. Records no son para entidades mutables con identidad gestionada por ORM.

```java
import java.util.*;
import java.util.stream.*;

public class JavaModernExample {
    record Order(String sku, int qty) {}
    record OrderDto(String sku, int qty) {}

    public static void main(String[] args) {
        var validOrders = List.of(
            new Order("A1", 2), new Order("", 1), new Order("B2", 0), new Order("C3", 5))
        .stream()
        .filter(o -> !o.sku().isBlank() && o.qty() > 0)
        .map(o -> new OrderDto(o.sku(), o.qty()))
        .toList();
        System.out.println("valid-orders=" + validOrders);

        Optional<String> found = Optional.of("A");
        System.out.println("found=" + found.orElse("X"));
        System.out.println("empty=" + Optional.empty().orElse("X"));

        Object o = new Order("A1", 2);
        String label = switch (o) {
            case Order(String sku, int q) when q >= 5 -> sku + ":bulk";
            case Order(String sku, int q) -> sku + ":normal";
            default -> "other";
        };
        System.out.println("label=" + label);
    }
}
```

```bash
javac JavaModernExample.java
java JavaModernExample
```

Salida esperada:

```text
valid-orders=[OrderDto[sku=A1, qty=2], OrderDto[sku=C3, qty=5]]
found=A
empty=X
label=A1:normal
```

El error más común es usar streams con efectos secundarios ocultos. El síntoma son resultados difíciles de depurar o dependientes del orden. La causa es mutar estado externo desde `map/filter`. La corrección es mantener funciones puras.

### Tema 2: Virtual Threads (Project Loom) · Avanzado · 45 min

## Virtual Threads: concurrencia masiva para I/O-bound

`catalog-service` atiende 200 requests concurrentes. Cada request espera 200ms de DB. Con platform threads (pool de 50), las requests se encolan y la latencia sube a 1s. Agregar más threads consume memoria (1MB/stack). El sistema no escala en I/O.

Un virtual thread es como un ticket de atención: en vez de tener 50 cajeros ocupados esperando, tienes miles de tickets que se atienden cuando el recurso está listo. La JVM monta/desmonta el virtual thread del carrier thread cuando bloquea en I/O.

```java
import java.util.concurrent.*;

public class VirtualThreadExample {
    public static void main(String[] args) throws Exception {
        try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
            Future<String> f1 = ex.submit(() -> { Thread.sleep(50); return "vt-1"; });
            Future<String> f2 = ex.submit(() -> { Thread.sleep(50); return "vt-2"; });
            System.out.println(f1.get());
            System.out.println(f2.get());
        }
        System.out.println("main-is-virtual=" + Thread.currentThread().isVirtual());
    }
}
```

```bash
javac VirtualThreadExample.java
java VirtualThreadExample
```

Salida esperada:

```text
vt-1
vt-2
main-is-virtual=false
```

Virtual threads escalan I/O-bound con código simple, pero no aceleran CPU-bound. El pinning en `synchronized` largo es el riesgo principal.

### Tema 3: Spring IoC, DI, bean lifecycle y ApplicationContext · Intermedio · 60 min

## Spring IoC y DI: de `new` por todos lados a contenedor

`OrderService` crea `new OrderRepository()` internamente. Para testearlo, hay que modificar código o usar reflection. Las dependencias están ocultas, el grafo es invisible y el ciclo de vida nadie lo gestiona.

IoC es como contratar un gerente de oficina: tú dices "necesito un servicio de pedidos con repositorio y cliente de pago", y el gerente (contenedor) contrata, conecta y gestiona el ciclo de vida. Constructor injection es el empleado diciendo "estas son mis herramientas obligatorias".

```java
public class DependencyInjectionExample {
    interface Repo { String get(); }
    static class RepoImpl implements Repo { public String get() { return "order-1"; } }

    static class Service {
        private final Repo repo;
        Service(Repo repo) { this.repo = repo; }
        String run() { return repo.get(); }
    }

    public static void main(String[] args) {
        Service s = new Service(new RepoImpl());
        System.out.println("result=" + s.run());
    }
}
```

```bash
javac DependencyInjectionExample.java
java DependencyInjectionExample
```

Salida esperada:

```text
result=order-1
```

El error más común es field injection. El síntoma son tests difíciles, dependencias ocultas, NPE. La causa es dependencia no visible. La corrección es constructor injection, final fields.

En Spring Boot, la inyección por constructor es el default cuando hay un solo constructor:

```java
@Service
public class OrderService {
    private final OrderRepository repo;
    private final PaymentClient payment;

    public OrderService(OrderRepository repo, PaymentClient payment) {
        this.repo = repo;
        this.payment = payment;
    }
}
```

### Tema 4: Auto-configuración condicional, @Conditional y starters · Intermedio · 45 min

## Auto-configuración condicional y starters

El equipo agrega una dependencia y "mágicamente" aparece un bean. Nadie sabe por qué. Cuando falta, nadie sabe cómo activarlo. La auto-configuración parece magia hasta que falla.

La auto-configuración es como un electricista inteligente: si detecta que hay cable de red, instala el router; si no, no. Las condiciones (`@ConditionalOnClass`, `@ConditionalOnProperty`, `@ConditionalOnMissingBean`) son los sensores. Starters son los kits que traen todas las piezas compatibles.

```java
public class ConditionalConfigExample {
    static boolean enabled(String propertyValue, boolean classPresent, boolean beanMissing) {
        return "true".equalsIgnoreCase(propertyValue) && classPresent && beanMissing;
    }

    public static void main(String[] args) {
        System.out.println("all-conditions-met=" + enabled("true", true, true));
        System.out.println("property-false=" + enabled("false", true, true));
        System.out.println("class-missing=" + enabled("true", false, true));
    }
}
```

```bash
javac ConditionalConfigExample.java
java ConditionalConfigExample
```

Salida esperada:

```text
all-conditions-met=true
property-false=false
class-missing=false
```

El error más común es no entender por qué un bean existe/no existe. La corrección es usar `--debug` o Actuator `/conditions`.

### Tema 5: Multi-module Spring Boot projects · Intermedio · 45 min

## Multi-módulo con Gradle

Tienda Aurora usa un proyecto multi-módulo con Gradle. Cada servicio es un módulo independiente con su propio `build.gradle.kts`. El módulo `:shared` contiene contratos (DTOs, eventos) que todos los servicios consumen.

```kotlin
// settings.gradle.kts
rootProject.name = "tienda-aurora"
include("shared", "catalog-service", "orders-service", "billing-service")
```

```kotlin
// build.gradle.kts (raíz)
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
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }
}
```

```java
import java.util.*;

public class ModuleGraphExample {
    static boolean hasCycle(Map<String, List<String>> g) {
        return g.getOrDefault("domain", List.of()).contains("api")
            || g.getOrDefault("domain", List.of()).contains("web");
    }

    public static void main(String[] args) {
        var g = Map.of(
            "api", List.of("application"),
            "application", List.of("domain"),
            "domain", List.<String>of(),
            "infrastructure", List.of("domain")
        );
        System.out.println("acyclic=" + !hasCycle(g));
        System.out.println("api-deps=" + g.get("api"));
    }
}
```

```bash
javac ModuleGraphExample.java
java ModuleGraphExample
```

Salida esperada:

```text
acyclic=true
api-deps=[application]
```

El error más común es ciclos entre módulos. La causa es dependencia bidireccional. La corrección es grafo acíclico, dependencias hacia dentro.

### Tema 6: Perfiles y configuración externalizada · Intermedio · 45 min

## Perfiles y configuración externalizada

El equipo commitea `application-prod.yml` con password de DB. Un fork accidental expone la credencial. Además, `dev` y `prod` tienen comportamientos distintos no documentados porque los perfiles esconden lógica de negocio.

Los perfiles son como los trajes de un actor: el mismo actor (app) se viste distinto según la obra (entorno). Pero el actor no cambia de personalidad: la lógica de negocio es la misma. La configuración externalizada es como el guion fuera del escenario: los valores viven fuera del código.

```java
public class ProfileExample {
    static String db(String profile) { return "prod".equals(profile) ? "postgres" : "h2"; }
    static String secretSource(boolean prod) { return prod ? "vault" : "local-dev"; }

    public static void main(String[] args) {
        System.out.println("dev-db=" + db("dev"));
        System.out.println("prod-db=" + db("prod"));
        System.out.println("prod-secret-source=" + secretSource(true));
    }
}
```

```bash
javac ProfileExample.java
java ProfileExample
```

Salida esperada:

```text
dev-db=h2
prod-db=postgres
prod-secret-source=vault
```

El error más común es secretos en `application-prod.yml`. El síntoma es credenciales filtradas. La causa es configuración sensible versionada. La corrección es env vars/secret manager, `.env.example`, secret scanning.

### Tema 7: CRaC (Coordinated Restore at Checkpoint) · Avanzado · 45 min

## CRaC: arranque casi instantáneo

Un servicio serverless de Tienda Aurora tarda 4 segundos en arrancar. En scale-to-zero, cada invocación paga ese costo. El equipo activa CRaC sin validar sockets, conexiones DB y secretos. El restore falla porque el estado no fue coordinado.

CRaC es como congelar un plato de comida y recalentarlo: el plato (JVM) se guarda con todo su estado, y al recalentar (restore) vuelve a estar listo rápido. Pero si el plato tenía hielo (conexiones abiertas) que se derritió al congelar, al recalentar está podrido. Por eso hay que coordinar: cerrar recursos antes del checkpoint y reabrirlos después del restore.

```java
public class CracExample {
    static String lifecycle(boolean checkpointed, boolean resourcesValid) {
        if (!checkpointed) return "cold-start";
        return resourcesValid ? "restore-ok" : "restore-failed";
    }

    public static void main(String[] args) {
        System.out.println("no-checkpoint=" + lifecycle(false, false));
        System.out.println("restore-ok=" + lifecycle(true, true));
        System.out.println("restore-failed=" + lifecycle(true, false));
    }
}
```

```bash
javac CracExample.java
java CracExample
```

Salida esperada:

```text
no-checkpoint=cold-start
restore-ok=restore-ok
restore-failed=restore-failed
```

El error más común es restaurar con recursos stale. El síntoma son conexiones rotas, secretos viejos, tiempo incorrecto. La causa es no coordinar recursos en checkpoint/restore.

**Nota de verificación:** CRaC real requiere JDK con soporte CRaC y configuración de sistema; no se ejecutó checkpoint/restore real.

### Tema 8: GraalVM Native Image · Avanzado · 45 min

## GraalVM Native Image: arranque en milisegundos

El equipo compila a native para "ser más rápido". El binario arranca en 50ms, pero un endpoint falla en producción por reflexión no registrada. El throughput en carga sostenida es peor que JVM. Native no fue una mejora; fue una apuesta sin medición.

Native Image es como traducir un libro a otro idioma de forma anticipada: el resultado es rápido de leer (arranque), pero si el libro tiene páginas que se escriben en tiempo real (reflexión dinámica), la traducción no las incluye.

```java
public class NativeDecisionExample {
    static String choose(boolean fastStartupCritical, boolean heavyReflection, boolean measured) {
        if (!measured) return "stay-jvm-measure-first";
        if (fastStartupCritical && !heavyReflection) return "consider-native";
        return "stay-jvm";
    }

    public static void main(String[] args) {
        System.out.println("measured-compatible=" + choose(true, false, true));
        System.out.println("heavy-reflection=" + choose(true, true, true));
        System.out.println("not-measured=" + choose(true, false, false));
    }
}
```

```bash
javac NativeDecisionExample.java
java NativeDecisionExample
```

Salida esperada:

```text
measured-compatible=consider-native
heavy-reflection=stay-jvm
not-measured=stay-jvm-measure-first
```

El error más común es asumir que toda app Spring funciona igual en native. El síntoma son fallos en runtime por reflexión/recursos. La causa es metadata de reachability incompleta.

**Nota de verificación:** build native real requiere GraalVM/toolchain. Comando típico: `./gradlew nativeCompile`.

## Cierre

La base Java/Spring no es "tema preliminar": define cómo Tienda Aurora modela datos, maneja concurrencia, se configura y arranca. Virtual threads, CRaC y Native Image son opciones con trade-offs medibles, no upgrades automáticos. Gradle coordina el build multi-módulo con dependencias explícitas por servicio.

## Checklist

- Uso streams/Optional/records con criterio.
- Sé cuándo virtual threads ayudan y cuándo no.
- Aplico DI por constructor y entiendo autoconfig.
- Mantengo config/secretos fuera del código.
- Evalúo CRaC/Native con evidencia, no por moda.
- Uso Gradle para builds reproducibles multi-módulo.
