# Módulo 11 · Consistencia distribuida en Spring

Cuando un proceso de negocio cruza servicios y bases de datos, no hay transacción ACID global simple. Este módulo cubre outbox, CDC, sagas, idempotencia real y por qué 2PC suele ser una mala elección en microservicios.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de outbox, saga, idempotencia y decisión 2PC ejecutados con Java puro. Debezium/Kafka Connect/Temporal requieren infraestructura; se incluyen notas de verificación honestas.

## Aprende construyendo

### Tema 1: Outbox y CDC con Debezium · Avanzado · 150 min

Caso guía: al crear un pedido debes guardar el estado en Postgres y publicar `OrderCreated` a Kafka. Si falla uno de los dos writes, el sistema queda inconsistente.

#### Definición formal

**Outbox pattern:** persiste el evento en una tabla `outbox` dentro de la misma transacción local que el cambio de negocio. **CDC (Change Data Capture):** lee cambios del log/tabla y los publica a otro sistema. Debezium es una plataforma CDC común para capturar outbox y emitir eventos.

#### Contrato / internals

- **Atomicidad local:** negocio + outbox se confirman en una misma transacción DB.
- **Relay/CDC:** publica filas outbox a Kafka y marca estado/enviado.
- **At-least-once:** el relay puede republicar; el consumidor debe ser idempotente.
- **Orden:** ordenar por agregado cuando importe.
- **Límite:** outbox agrega complejidad operativa y almacenamiento; vale la pena en flujos críticos.

#### Cuándo usarlo / cuándo no

**Úsalo** ante dual write DB+broker. **No** lo omitas cuando perder evento o publicar evento fantasma tenga costo de negocio.

#### Ejemplo mínimo ejecutable

Crea el archivo `Outbox.java`:

```java
import java.util.*;
public class Outbox {
  static List<String> orders = new ArrayList<>();
  static List<String> outbox = new ArrayList<>();
  static List<String> published = new ArrayList<>();
  static void create(String id) { orders.add(id); outbox.add("OrderCreated:" + id); }
  static void relay() { published.addAll(outbox); outbox.clear(); }
  public static void main(String[] args) {
    create("o1");
    System.out.println(outbox.size());
    relay();
    System.out.println(published.size());
    System.out.println(outbox.size());
  }
}
```

```bash
javac Outbox.java
java Outbox
```

Salida esperada:

```text
1
1
0
```

#### Caso real

`orders-service` inserta `orders` y `outbox_events` en la misma transacción. Debezium lee la tabla outbox y publica a Kafka; el consumidor actualiza `read model` idempotentemente.

#### Error común

**Síntoma.** pedido creado pero evento no publicado. **Causa.** dual write: commit DB ok, publish Kafka falla. **Corrección.** outbox transaccional + CDC/relay. **Señal observable.** discrepancia entre filas de DB y mensajes en topic.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `1`, `1`, `0`.

**Nota de verificación:** no se ejecutó Debezium/Kafka Connect real. Verificación propuesta: Postgres + Kafka + Debezium, insertar pedido y confirmar evento publicado desde outbox.

### Tema 2: Sagas orquestadas/coreografiadas · Avanzado · 180 min

Caso guía: crear pedido implica reservar inventario y cobrar pago. Si el pago falla, hay que compensar la reserva.

#### Definición formal

Una **saga** es una secuencia de transacciones locales donde cada paso tiene una compensación posible. En una saga **orquestada**, un coordinador decide el siguiente paso; en una **coreografiada**, los servicios reaccionan a eventos.

#### Contrato / internals

- **Transacción local:** cada servicio confirma su propia DB.
- **Compensación:** acción semántica inversa (liberar reserva, reembolsar), no siempre “rollback” técnico.
- **Idempotencia:** pasos y compensaciones deben tolerar reintentos.
- **Estado:** la orquestación requiere persistir estado del proceso.
- **Límite:** sagas no dan aislamiento ACID global; pueden verse estados intermedios.

#### Cuándo usarlo / cuándo no

**Úsala** en procesos multi-servicio de negocio. **No** la uses si una transacción local en un solo servicio resuelve el problema. Evita 2PC distribuido como default.

#### Ejemplo mínimo ejecutable

Crea el archivo `Saga.java`:

```java
public class Saga {
  static String run(boolean paymentOk) {
    boolean reserved = true;
    boolean paid = paymentOk;
    if (!paid) return "compensate-release";
    return "ok";
  }
  public static void main(String[] args) {
    System.out.println(run(false));
    System.out.println(run(true));
  }
}
```

```bash
javac Saga.java
java Saga
```

Salida esperada:

```text
compensate-release
ok
```

#### Caso real

Orquestador: crea pedido -> reserva inventario -> cobra pago. Si pago falla, emite compensación `ReleaseInventory`. Cada compensación es idempotente por `sagaId`.

#### Error común

**Síntoma.** reserva queda tomada sin pago. **Causa.** falta compensación o no es idempotente. **Corrección.** diseñar compensaciones, persistir estado y reintentar con seguridad. **Señal observable.** recursos huérfanos en estado “RESERVED”.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `compensate-release`, `ok`.

**Nota de verificación:** no se ejecutó orquestador Temporal/Camunda ni saga coreografiada con broker real. Verificación propuesta: simular fallo en paso 2 y confirmar compensación aplicada una sola vez.

### Tema 3: Idempotencia real y exactly-once práctico · Avanzado · 120 min

Caso guía: un consumer recibe el mismo evento de pago dos veces. No debe aplicar el pago dos veces.

#### Definición formal

**Exactly-once** end-to-end es difícil en sistemas distribuidos heterogéneos. En práctica se usa **at-least-once delivery + idempotencia + deduplicación + transacciones locales**. El efecto final se aplica una vez, aunque la entrega ocurra más de una vez.

#### Contrato / internals

- **Dedup store:** tabla con unique constraint por `eventId`.
- **Orden de operaciones:** registrar dedup y aplicar efecto en transacción local cuando sea posible.
- **Idempotency key:** para llamadas a APIs externas.
- **Reintentos:** deben ser seguros; no reintentar efectos no idempotentes sin protección.
- **Límite:** Kafka puede ofrecer garantías en su ecosistema, pero no convierte automáticamente un sistema externo en exactly-once.

#### Cuándo usarlo / cuándo no

**Úsalo** en todo consumidor/command handler crítico. **No** afirmes “exactly-once” sin acotar el alcance técnico real.

#### Ejemplo mínimo ejecutable

Crea el archivo `Idem.java`:

```java
import java.util.*;
public class Idem {
  static Set<String> seen = new HashSet<>();
  static String apply(String id) { return seen.add(id) ? "applied" : "duplicate"; }
  public static void main(String[] args) {
    System.out.println(apply("e1"));
    System.out.println(apply("e1"));
  }
}
```

```bash
javac Idem.java
java Idem
```

Salida esperada:

```text
applied
duplicate
```

#### Caso real

`PaymentApplied` con `eventId=e1` se procesa; el segundo intento detecta unique constraint y termina como no-op, confirmando el mensaje.

#### Error común

**Síntoma.** doble cargo o doble reserva. **Causa.** asumir exactly-once del broker/SDK. **Corrección.** idempotencia end-to-end con dedup y claves de negocio. **Señal observable.** dos filas de efecto con mismo `eventId`.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `applied`, `duplicate`.

**Nota de verificación:** no se ejecutó flujo Kafka+DB real. Verificación propuesta: redelivery del mismo evento y assertion de un único efecto persistido.

### Tema 4: Por qué evitar 2PC · Avanzado · 90 min

Caso guía: el equipo propone XA/2PC para “garantizar consistencia” entre DB y broker.

#### Definición formal

Two-Phase Commit (2PC) es un protocolo de transacción distribuida con fases de preparación y commit coordinadas por un transaction coordinator. Busca atomicidad global entre participantes.

#### Contrato / internals

- **Fase 1 prepare:** participantes prometen poder commitear.
- **Fase 2 commit/rollback:** coordinador decide.
- **Costo:** locks más largos, mayor latencia, dependencia del coordinador.
- **Fallo:** particiones y caídas complican la recuperación; puede bloquear recursos.
- **Límite:** no encaja bien con microservicios autónomos y alta disponibilidad.

#### Cuándo usarlo / cuándo no

**Evítalo por defecto** en microservicios. **Considera** solo en entornos controlados, participantes compatibles y requerimientos que realmente exijan atomicidad distribuida fuerte. Prefiere transacción local + outbox/saga.

#### Ejemplo mínimo ejecutable

Crea el archivo `TwoPc.java`:

```java
public class TwoPc {
  static String choose(boolean sameDb) {
    return sameDb ? "local-tx" : "outbox-saga";
  }
  public static void main(String[] args) {
    System.out.println(choose(true));
    System.out.println(choose(false));
  }
}
```

```bash
javac TwoPc.java
java TwoPc
```

Salida esperada:

```text
local-tx
outbox-saga
```

#### Caso real

Si todo está en la misma DB, usa transacción local. Si cruza DB y Kafka, usa outbox; si cruza múltiples servicios, usa saga con compensaciones.

#### Error común

**Síntoma.** latencia alta y bloqueos en operaciones distribuidas. **Causa.** coordinación 2PC/XA con locks largos. **Corrección.** modelar consistencia eventual con outbox/saga e idempotencia. **Señal observable.** timeouts del coordinator y transacciones en prepare prolongadas.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `local-tx`, `outbox-saga`.

**Nota de verificación:** no se ejecutó XA/2PC real. Verificación propuesta: comparar latencia y comportamiento ante fallo de coordinator en un laboratorio XA vs outbox/saga.

## Cierre

La consistencia distribuida se diseña: outbox para publicar confiablemente, sagas para procesos largos, idempotencia para duplicados. 2PC rara vez es el trade-off correcto.

## Checklist

- Outbox/CDC para DB+broker.
- Sagas con compensaciones idempotentes.
- Consumidores idempotentes.
- Evito 2PC por defecto.
- Verificación honesta ante falta de infraestructura distribuida.
