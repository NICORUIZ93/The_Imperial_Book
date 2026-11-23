# Módulo 14 · Anti-patrones y evolución de Tienda Aurora

Migrar a microservicios es fácil de empezar y difícil de sostener. Este módulo cubre anti-patrones, monolito distribuido, sobre-descomposición, sagas innecesarias, Strangler Fig y métricas DORA, usando Tienda Aurora como caso de estudio.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Examples de detección de smells, decisión local-vs-saga, routing de migración y DORA ejecutados con Java puro.

## Proyecto desde cero: tienda-aurora-evolution

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
```

### Estructura del proyecto

```text
tienda-aurora-evolution/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/aurora/evolution/
│   │   │   ├── EvolutionApplication.java
│   │   │   └── analysis/
│   │   │       ├── SmellDetector.java
│   │   │       └── DoraMetrics.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/aurora/evolution/
│           └── EvolutionExampleTest.java
└── docs/
    └── adr/
        └── 0010-migration-strategy.md
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
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-evolution"
```

### application.yml

```yaml
spring:
  application:
    name: evolution-service

server:
  port: 8080
```

### Tema 1: Monolito distribuido y sobre-descomposición · Avanzado · 120 min

## Monolito distribuido: cuando la división no da autonomía

El sistema de Tienda Aurora tiene 20 "microservicios", pero un cambio de esquema obliga a desplegar 8 servicios juntos y la base de datos es compartida. Los PRs coordinados son la norma. La latencia de un checkout cruza 7 hops. El equipo tiene más repos que antes y menos autonomía.

Un monolito distribuido es como una casa con paredes de papel: parece que hay habitaciones separadas, pero todo se oye y se siente. La sobre-descomposición es como dividir una pizza en 100 porciones: más piezas, más bordes, más desorden. El microservicio no es el objetivo; la autonomía con costo aceptable lo es.

```java
public class DistributedMonolithExample {
    static int smells(boolean sharedDb, boolean lockstepDeploy, int syncChain, boolean diffuseOwnership) {
        int s = 0;
        if (sharedDb) s++;
        if (lockstepDeploy) s++;
        if (syncChain > 3) s++;
        if (diffuseOwnership) s++;
        return s;
    }

    public static void main(String[] args) {
        System.out.println("smells-critical=" + smells(true, true, 5, true));
        System.out.println("smells-clean=" + smells(false, false, 1, false));
    }
}
```

```bash
javac DistributedMonolithExample.java
java DistributedMonolithExample
```

Salida esperada:

```text
smells-critical=4
smells-clean=0
```

El error más común es muchos repos con baja autonomía. El síntoma son PRs coordinados para un cambio simple. La causa es acoplamiento por DB o contratos implícitos. La corrección es database-per-service, contratos explícitos, Bounded Contexts y, a veces, recomponer un servicio.

### Tema 2: Sagas innecesarias y acoplamiento temporal · Avanzado · 120 min

## Sagas innecesarias y acoplamiento temporal

Un equipo de Tienda Aurora usa saga con compensaciones para actualizar dos tablas dentro del mismo servicio y misma base de datos. La complejidad se triplicó: estados intermedios, compensaciones, idempotencia, observabilidad. Todo para un problema que una transacción local resolvía.

Una saga innecesaria es como usar un convoy de camiones para mover una caja dentro de la misma habitación. La transacción local es recoger la caja y ponerla en el estante. La saga solo tiene sentido cuando el objeto debe cruzar fronteras (otro servicio, otra DB). El acoplamiento temporal es como una cadena de favores: si uno no está disponible, todos se bloquean.

```java
public class SagaNecessityExample {
    static String choose(boolean crossesServiceBoundary, boolean singleDatabase) {
        if (singleDatabase && !crossesServiceBoundary) return "local-transaction";
        if (crossesServiceBoundary) return "evaluate-saga";
        return "local-transaction";
    }

    static boolean temporalCoupling(int syncHops) { return syncHops > 3; }

    public static void main(String[] args) {
        System.out.println("same-service=" + choose(false, true));
        System.out.println("cross-boundary=" + choose(true, false));
        System.out.println("temporal-coupling=" + temporalCoupling(5));
    }
}
```

```bash
javac SagaNecessityExample.java
java SagaNecessityExample
```

Salida esperada:

```text
same-service=local-transaction
cross-boundary=evaluate-saga
temporal-coupling=true
```

El error más común es saga innecesaria. El síntoma son bugs de compensación en flujos simples. La causa es saga aplicada sin necesidad. La corrección es preferir transacción local y límites de agregado claros.

### Tema 3: Strangler Fig y coexistencia de datos · Avanzado · 120 min

## Strangler Fig: migración sin big bang

El monolito legacy de facturación de Tienda Aurora tiene 8 años. Reescribirlo desde cero en 6 meses suena tentador. A los 4 meses, el nuevo sistema no cubre casos borde, el viejo sigue recibiendo cambios y nadie sabe cuál es la fuente de verdad. El big bang falla.

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
javac StranglerExample.java
java StranglerExample
```

Salida esperada:

```text
catalog=new
billing=legacy
cutover-safe=true
cutover-unsafe=false
```

El error más común es rollback imposible. El síntoma es caída masiva tras migración. La causa es big bang sin ruta incremental. La corrección es Strangler Fig, feature flags, backfill, reconciliación y rollback plan.

### Tema 4: Métricas DORA y deuda técnica · Intermedio · 90 min

## DORA y deuda técnica: medir si la migración mejoró

Tras migrar Tienda Aurora a microservicios, el equipo despliega más (DF sube), pero también rompe más (CFR sube). El MTTR empeora porque hay más servicios que diagnosticar. Nadie mide si la migración mejoró realmente la entrega. La deuda técnica se acumula porque "funciona" y nadie la prioriza.

DORA metrics son como el tablero de un hospital: deployment frequency es cuántas operaciones se hacen, lead time es cuánto tarda una desde que se agenda, change failure rate es cuántas salen mal, MTTR es cuánto tarda en recuperarse. Si solo miras "cuántas operaciones", puedes celebrar mientras la mortalidad sube.

```java
public class DoraExample {
    record DoraMetrics(double changeFailRate, int mttrHours, double deployFreqPerWeek) {}

    static boolean healthy(DoraMetrics m) {
        return m.changeFailRate() < 0.15 && m.mttrHours() < 24;
    }

    static String assessment(DoraMetrics before, DoraMetrics after) {
        if (after.deployFreqPerWeek() > before.deployFreqPerWeek()
            && after.changeFailRate() < before.changeFailRate()
            && after.mttrHours() < before.mttrHours()) return "improved";
        if (after.deployFreqPerWeek() > before.deployFreqPerWeek()
            && (after.changeFailRate() >= before.changeFailRate()
                || after.mttrHours() >= before.mttrHours())) return "worse-or-mixed";
        return "neutral";
    }

    public static void main(String[] args) {
        System.out.println("healthy-good=" + healthy(new DoraMetrics(0.1, 2, 10)));
        System.out.println("healthy-bad=" + healthy(new DoraMetrics(0.3, 30, 15)));
        DoraMetrics before = new DoraMetrics(0.2, 12, 2);
        DoraMetrics after = new DoraMetrics(0.08, 4, 8);
        System.out.println("assessment=" + assessment(before, after));
    }
}
```

```bash
javac DoraExample.java
java DoraExample
```

Salida esperada:

```text
healthy-good=true
healthy-bad=false
assessment=improved
```

DORA metrics miden si la evolución mejoró la entrega. La deuda técnica necesita dueño y plan. Sin medición, la migración es un acto de fe. El error más común es medir solo velocidad: más despliegues, más incidentes. La causa es ignorar CFR/MTTR. La corrección es balancear las 4 métricas y pagar deuda técnica.

## Cierre

Evolucionar a microservicios requiere podar complejidad. El éxito se mide en autonomía, estabilidad y delivery, no en cantidad de servicios. Tienda Aurora se evalúa con DORA antes y después de cada extracción de servicio, y la deuda técnica tiene dueño y plan. Gradle coordina el build multi-módulo con dependencias por servicio.

## Checklist

- Detecto monolito distribuido.
- Evito sagas innecesarias.
- Migro incrementalmente con Strangler Fig.
- Mido DORA antes/después.
- La deuda técnica tiene dueño y plan.
