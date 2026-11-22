# Módulo 11 · Consistencia distribuida en Spring

Cuando un proceso de negocio cruza servicios y bases de datos, no hay transacción ACID global simple. Este módulo cubre outbox, CDC, sagas, idempotencia real y por qué 2PC suele ser una mala elección en microservicios.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan smokes de outbox, saga, compensación e idempotencia con Java puro. Debezium/Temporal/Kafka Connect requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Outbox y CDC con Debezium · Avanzado · 150 min

Caso guía: guardar pedido y publicar evento confiablemente.

#### Outbox

**Definición formal.** Outbox escribe estado de negocio y evento en la misma transacción local. CDC (Change Data Capture) o un relay publica el outbox al broker.

**Cuándo usarlo / cuándo no.** Úsalo ante dual write DB+broker. No lo omitas en flujos críticos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm11-outbox
cd sm11-outbox
```

Crea el archivo `Outbox.java`:

```java
import java.util.*;
public class Outbox {
  static List<String> orders=new ArrayList<>(), outbox=new ArrayList<>(), published=new ArrayList<>();
  static void create(String id){ orders.add(id); outbox.add("OrderCreated:"+id); }
  static void relay(){ published.addAll(outbox); outbox.clear(); }
  public static void main(String[] args){ create("o1"); System.out.println(outbox.size()); relay(); System.out.println(published.size()); System.out.println(outbox.size()); }
}
```

```bash
javac Outbox.java
java Outbox
```

**Error común.** Publicar antes de commit.

**Síntoma.** evento sin estado o estado sin evento. **Causa.** dual write. **Corrección.** outbox/CDC. **Señal observable.** inconsistencias ante crash.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `1`, `1`, `0`. **Nota de verificación:** Debezium real no ejecutado.

### Tema 2: Sagas orquestadas/coreografiadas · Avanzado · 180 min

Caso guía: pedido, pago, inventario.

#### Saga

**Definición formal.** Saga es secuencia de transacciones locales con compensaciones. Orquestada tiene coordinador; coreografiada reacciona a eventos.

**Cuándo usarlo / cuándo no.** Úsala en procesos multi-servicio. No uses 2PC distribuido como default.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm11-saga
cd sm11-saga
```

Crea el archivo `Saga.java`:

```java
public class Saga {
  static String run(boolean paymentOk){ boolean reserved=true; boolean paid=paymentOk; if(!paid) return "compensate-release"; return "ok"; }
  public static void main(String[] args){ System.out.println(run(false)); System.out.println(run(true)); }
}
```

```bash
javac Saga.java
java Saga
```

**Error común.** Sin compensación.

**Síntoma.** estado parcial permanente. **Causa.** fallos no revertidos. **Corrección.** compensaciones idempotentes. **Señal observable.** reservas huérfanas.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `compensate-release`, `ok`.

### Tema 3: Idempotencia real y exactly-once práctico · Avanzado · 120 min

Caso guía: reintentos de consumer Kafka.

#### Exactly-once práctico

**Definición formal.** Exactly-once end-to-end es raro; en la práctica se logra at-least-once + idempotencia + dedup + transacciones locales bien delimitadas.

**Cuándo usarlo / cuándo no.** Siempre en consumidores/commands críticos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm11-idem
cd sm11-idem
```

Crea el archivo `Idem.java`:

```java
import java.util.*;
public class Idem {
  static Set<String> seen=new HashSet<>();
  static String apply(String id){ return seen.add(id)?"applied":"duplicate"; }
  public static void main(String[] args){ System.out.println(apply("e1")); System.out.println(apply("e1")); }
}
```

```bash
javac Idem.java
java Idem
```

**Error común.** Confiar en “exactly-once” de Kafka sin diseño.

**Síntoma.** duplicados de negocio. **Causa.** semántica mal entendida. **Corrección.** idempotencia end-to-end. **Señal observable.** doble efecto con mismo ID.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `applied`, `duplicate`.

### Tema 4: Por qué evitar 2PC · Avanzado · 90 min

Caso guía: coordinar DB y broker con XA.

#### 2PC

**Definición formal.** Two-Phase Commit coordina transacción distribuida con prepare/commit. Es costoso, frágil y limita disponibilidad.

**Cuándo usarlo / cuándo no.** Evítalo en microservicios; prefiere consistencia eventual con outbox/sagas. Solo considera si el entorno y latencia lo justifican.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm11-2pc
cd sm11-2pc
```

Crea el archivo `TwoPc.java`:

```java
public class TwoPc {
  static String choose(boolean sameDb){ return sameDb ? "local-tx" : "outbox-saga"; }
  public static void main(String[] args){ System.out.println(choose(true)); System.out.println(choose(false)); }
}
```

```bash
javac TwoPc.java
java TwoPc
```

**Error común.** Usar 2PC por inercia.

**Síntoma.** latencia alta, bloqueos, baja disponibilidad. **Causa.** coordinación distribuida fuerte. **Corrección.** outbox/saga/idempotencia. **Señal observable.** timeouts en coordinator.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `local-tx`, `outbox-saga`.

## Cierre

La consistencia distribuida se diseña: outbox para publicar confiablemente, sagas para procesos largos, idempotencia para duplicados. 2PC rara vez es el trade-off correcto.

## Checklist

- Outbox/CDC para DB+broker.
- Sagas con compensaciones idempotentes.
- Consumidores idempotentes.
- Evito 2PC por defecto.
