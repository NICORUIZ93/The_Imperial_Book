# Módulo 14 · Anti-patrones, migración y evolución

Migrar a microservicios es fácil de empezar y difícil de sostener. Este módulo cubre anti-patrones, monolito distribuido, sobre-descomposición, Strangler Fig, DORA y deuda técnica.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de detección de smells, decisión local-vs-saga, routing de migración y DORA ejecutados con Java puro.

## Aprende construyendo

### Tema 1: Monolito distribuido y sobre-descomposición · Avanzado · 120 min

Caso guía: el sistema tiene 20 “microservicios”, pero un cambio de esquema obliga a desplegar 8 servicios juntos y la base de datos es compartida.

#### Definición formal

- **Monolito distribuido:** sistema dividido en procesos/servicios desplegables, pero acoplado por datos, contratos, releases o llamadas síncronas en cadena.
- **Sobre-descomposición:** partir el sistema en demasiados servicios sin límites de dominio claros ni capacidad operativa, aumentando coordinación y latencia.

#### Contrato / internals

- **Smells:** base de datos compartida, deploy lockstep, cambios cross-service frecuentes, cadenas síncronas largas, ownership difuso.
- **Costo:** cada servicio agrega CI/CD, observabilidad, seguridad, red, on-call y consistencia eventual.
- **Límite:** “microservicio” no es objetivo; es trade-off. El límite correcto es el que maximiza autonomía con costo aceptable.

#### Cuándo usarlo / cuándo no

**Usa estos criterios** para diagnosticar. **No** resuelvas acoplamiento creando más servicios. No extraigas un servicio sin frontera de dominio y contrato claro.

#### Ejemplo mínimo ejecutable

Crea el archivo `Smell.java`:

```java
public class Smell {
  static int smells(boolean sharedDb, boolean lockstepDeploy, int syncChain) {
    int s = 0;
    if (sharedDb) s++;
    if (lockstepDeploy) s++;
    if (syncChain > 3) s++;
    return s;
  }
  public static void main(String[] args) {
    System.out.println(smells(true, true, 5));
    System.out.println(smells(false, false, 1));
  }
}
```

```bash
javac Smell.java
java Smell
```

Salida esperada:

```text
3
0
```

#### Caso real

Tres servicios leen/escriben la misma tabla `orders`. Cualquier migración requiere coordinar deploys y genera incidentes por cambios incompatibles.

#### Error común

**Síntoma.** muchos repos/servicios pero baja autonomía. **Causa.** acoplamiento por DB o contratos implícitos. **Corrección.** database-per-service, contratos explícitos, Bounded Contexts, y a veces recomponer un servicio. **Señal observable.** PRs coordinados en múltiples repos para un cambio simple.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `3`, `0`.

**Nota de verificación:** es un heurístico. La verificación real requiere revisar acoplamiento de deploy, esquema, incidentes y lead time.

### Tema 2: Sagas innecesarias y acoplamiento temporal · Avanzado · 120 min

Caso guía: un equipo usa saga con compensaciones para actualizar dos tablas dentro del mismo servicio y misma base de datos.

#### Definición formal

Una **saga innecesaria** es la aplicación de coordinación distribuida a un problema que puede resolverse con una transacción local. El **acoplamiento temporal** ocurre cuando un flujo requiere que múltiples servicios estén disponibles al mismo tiempo para completar una operación.

#### Contrato / internals

- **Transacción local:** ACID dentro de una DB/servicio; simple y fuerte.
- **Saga:** solo cuando cruza límites de servicio/DB y no hay transacción local viable.
- **Acoplamiento temporal:** cadenas síncronas A->B->C aumentan latencia y fallos en cascada.
- **Límite:** saga agrega compensaciones, estados intermedios, idempotencia y observabilidad.

#### Cuándo usarlo / cuándo no

**Usa transacción local** si la invariante vive dentro de un servicio/DB. **Usa saga** solo cuando el proceso cruza límites reales. **No** conviertas invariantes locales en flujos distribuidos.

#### Ejemplo mínimo ejecutable

Crea el archivo `Local.java`:

```java
public class Local {
  static String choose(boolean crossesServiceBoundary) {
    return crossesServiceBoundary ? "saga" : "local-tx";
  }
  public static void main(String[] args) {
    System.out.println(choose(false));
    System.out.println(choose(true));
  }
}
```

```bash
javac Local.java
java Local
```

Salida esperada:

```text
local-tx
saga
```

#### Caso real

`orders-service` actualiza pedido y outbox en la misma DB: transacción local. Si también debe reservar inventario en `inventory-service`, ahí sí se evalúa saga.

#### Error común

**Síntoma.** bugs de compensación en flujos simples. **Causa.** saga aplicada sin necesidad. **Corrección.** preferir transacción local y límites de agregado claros. **Señal observable.** compensaciones para operaciones que podrían ser ACID locales.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `local-tx`, `saga`.

**Nota de verificación:** la decisión real requiere revisar límites de servicio, propiedad de datos e invariantes de negocio.

### Tema 3: Strangler Fig y coexistencia de datos · Avanzado · 120 min

Caso guía: un monolito legacy maneja billing. Quieres extraerlo sin un corte big-bang.

#### Definición formal

**Strangler Fig** es una estrategia de migración incremental donde nuevas capacidades se implementan en el nuevo sistema y el tráfico/funcionalidad legacy se desvía gradualmente hasta retirar lo viejo. La **coexistencia de datos** gestiona source of truth, sincronización, backfill y cutover.

#### Contrato / internals

- **Ruteo:** gateway/proxy/feature flag decide legacy vs nuevo.
- **Source of truth:** definir qué sistema es autoritativo por dato/capacidad.
- **Backfill:** migrar datos históricos con verificación.
- **Cutover:** cambio controlado y reversible.
- **Límite:** dual write sin reconciliación genera inconsistencia.

#### Cuándo usarlo / cuándo no

**Úsalo** en sistemas vivos con riesgo alto de big bang. **No** hagas dual write indefinido sin reconciliación, métricas y plan de retiro.

#### Ejemplo mínimo ejecutable

Crea el archivo `Mig.java`:

```java
import java.util.*;
public class Mig {
  public static void main(String[] args) {
    Set<String> migrated = Set.of("catalog");
    System.out.println(migrated.contains("catalog") ? "new" : "legacy");
    System.out.println(migrated.contains("billing") ? "new" : "legacy");
  }
}
```

```bash
javac Mig.java
java Mig
```

Salida esperada:

```text
new
legacy
```

#### Caso real

El gateway enruta `/catalog` al nuevo servicio y `/billing` al monolito. Se hace backfill de catálogo, se compara por checksums y luego se corta el tráfico.

#### Error común

**Síntoma.** rollback imposible tras migración. **Causa.** big bang sin ruta incremental. **Corrección.** Strangler Fig, feature flags, backfill, reconciliación y rollback plan. **Señal observable.** cutover único con caída masiva y sin camino de retorno.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `new`, `legacy`.

**Nota de verificación:** migración real requiere pruebas de reconciliación de datos, carga y rollback.

### Tema 4: Métricas DORA y deuda técnica · Intermedio · 90 min

Caso guía: tras migrar a microservicios, el equipo despliega más, pero también rompe más. Necesitas medir si la entrega mejoró.

#### Definición formal

**DORA metrics:** Deployment Frequency, Lead Time for Changes, Change Failure Rate, Mean Time to Restore. Son métricas de desempeño de entrega de software. La **deuda técnica** es el costo futuro de decisiones de diseño/código que aceleran ahora pero dificultan cambios seguros después.

#### Contrato / internals

- **DF:** frecuencia de despliegues a producción.
- **LT:** tiempo desde commit a producción.
- **CFR:** porcentaje de cambios que causan fallo/rollback/hotfix.
- **MTTR:** tiempo para restaurar servicio.
- **Límite:** optimizar una métrica aislada puede empeorar el sistema; se balancea velocidad y estabilidad.

#### Cuándo usarlo / cuándo no

**Úsalo** para evaluar evolución arquitectónica y entrega. **No** uses solo DF o solo cantidad de microservicios como indicador de éxito.

#### Ejemplo mínimo ejecutable

Crea el archivo `Dora.java`:

```java
public class Dora {
  static boolean healthy(double changeFailRate, int mttrHours) {
    return changeFailRate < 0.15 && mttrHours < 24;
  }
  public static void main(String[] args) {
    System.out.println(healthy(0.1, 2));
    System.out.println(healthy(0.3, 30));
  }
}
```

```bash
javac Dora.java
java Dora
```

Salida esperada:

```text
true
false
```

#### Caso real

Después de introducir outbox y CI con contract tests, DF sube, CFR baja y MTTR mejora. Sin esas prácticas, la migración solo aumentó la complejidad.

#### Error común

**Síntoma.** más despliegues, más incidentes. **Causa.** medir velocidad sin estabilidad. **Corrección.** balancear DORA y pagar deuda técnica con tests, observabilidad y automatización. **Señal observable.** CFR/MTTR suben mientras DF sube.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `true`, `false`.

**Nota de verificación:** DORA real se calcula con datos de CI/CD/incidentes. Este smoke solo valida la regla de evaluación.

## Cierre

Evolucionar a microservicios requiere podar complejidad. El éxito se mide en autonomía, estabilidad y delivery, no en cantidad de servicios.

## Checklist

- Detecto monolito distribuido.
- Evito sagas innecesarias.
- Migro incrementalmente con Strangler Fig.
- Mido DORA antes/después.
- La deuda técnica tiene dueño y plan.
