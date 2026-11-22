# Módulo 14 · Anti-patrones, migración y evolución

Migrar a microservicios es fácil de empezar y difícil de sostener. Este módulo cubre anti-patrones, monolito distribuido, sobre-descomposición, Strangler Fig, DORA y deuda técnica.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan checks de smells, migración y métricas DORA con Java puro.

## Aprende construyendo

### Tema 1: Monolito distribuido y sobre-descomposición · Avanzado · 120 min

Caso guía: muchos servicios, pero todos deben desplegarse juntos.

#### Anti-patrones

**Definición formal.** Monolito distribuido: servicios separados en despliegue pero acoplados en datos/contratos/releases. Sobre-descomposición: dividir más de lo que el dominio/equipo justifica.

**Cuándo usarlo / cuándo no.** Usa esta lista para diagnosticar. No “arregles” agregando más servicios.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm14-smell
cd sm14-smell
```

Crea el archivo `Smell.java`:

```java
public class Smell {
  static int smells(boolean sharedDb, boolean lockstepDeploy, int syncChain){ int s=0; if(sharedDb)s++; if(lockstepDeploy)s++; if(syncChain>3)s++; return s; }
  public static void main(String[] args){ System.out.println(smells(true,true,5)); System.out.println(smells(false,false,1)); }
}
```

```bash
javac Smell.java
java Smell
```

**Error común.** Compartir DB.

**Síntoma.** cambios de esquema rompen todo. **Causa.** acoplamiento por datos. **Corrección.** database-per-service, contratos. **Señal observable.** migración coordinada.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `3`, `0`.

### Tema 2: Sagas innecesarias y acoplamiento temporal · Avanzado · 120 min

Caso guía: usar saga donde bastaba una transacción local.

#### Complejidad accidental

**Definición formal.** Una saga innecesaria introduce coordinación distribuida sin necesidad de negocio.

**Cuándo usarlo / cuándo no.** Usa saga solo cuando el proceso cruza límites de servicio/DB. Si está en un agregado, usa transacción local.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm14-saga
cd sm14-saga
```

Crea el archivo `Local.java`:

```java
public class Local {
  static String choose(boolean crossesServiceBoundary){ return crossesServiceBoundary ? "saga" : "local-tx"; }
  public static void main(String[] args){ System.out.println(choose(false)); System.out.println(choose(true)); }
}
```

```bash
javac Local.java
java Local
```

**Error común.** Saga por defecto.

**Síntoma.** complejidad y bugs de compensación. **Causa.** sobreingeniería. **Corrección.** transacción local primero. **Señal observable.** compensaciones para invariantes locales.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `local-tx`, `saga`.

### Tema 3: Strangler Fig y coexistencia de datos · Avanzado · 120 min

Caso guía: migrar billing sin big bang.

#### Migración

**Definición formal.** Strangler Fig migra por capacidades. Coexistencia de datos requiere estrategia de source of truth, backfill y cutover.

**Cuándo usarlo / cuándo no.** Úsalo en sistemas vivos. No hagas dual write sin reconciliación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm14-str
cd sm14-str
```

Crea el archivo `Mig.java`:

```java
import java.util.*;
public class Mig {
  public static void main(String[] args){ Set<String> migrated=Set.of("catalog"); System.out.println(migrated.contains("catalog")?"new":"legacy"); System.out.println(migrated.contains("billing")?"new":"legacy"); }
}
```

```bash
javac Mig.java
java Mig
```

**Error común.** Big bang.

**Síntoma.** rollback caótico. **Causa.** cambio masivo sin incrementalidad. **Corrección.** strangler, feature flags, backfill. **Señal observable.** corte único con muchos sistemas afectados.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `new`, `legacy`.

### Tema 4: Métricas DORA y deuda técnica · Intermedio · 90 min

Caso guía: demostrar que la migración mejoró delivery.

#### DORA

**Definición formal.** DORA mide deployment frequency, lead time, change failure rate y MTTR.

**Cuándo usarlo / cuándo no.** Úsalo para evaluar entrega. No uses una sola métrica aislada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm14-dora
cd sm14-dora
```

Crea el archivo `Dora.java`:

```java
public class Dora {
  static boolean healthy(double changeFailRate, int mttrHours){ return changeFailRate < 0.15 && mttrHours < 24; }
  public static void main(String[] args){ System.out.println(healthy(0.1,2)); System.out.println(healthy(0.3,30)); }
}
```

```bash
javac Dora.java
java Dora
```

**Error común.** Medir solo velocidad.

**Síntoma.** más deploys pero más incidentes. **Causa.** ignorar estabilidad. **Corrección.** balancear velocidad y estabilidad. **Señal observable.** CFR/MTTR empeoran.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

## Cierre

Evolucionar a microservicios requiere podar complejidad. El éxito se mide en autonomía, estabilidad y delivery, no en cantidad de servicios.

## Checklist

- Detecto monolito distribuido.
- Evito sagas innecesarias.
- Migro incrementalmente.
- Mido DORA antes/después.
