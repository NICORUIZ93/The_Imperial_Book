# Módulo 11 · Consistencia distribuida en Tienda Aurora

Cuando un proceso de negocio cruza servicios y bases de datos, no hay transacción ACID global simple. Tienda Aurora necesita crear un pedido que reserve stock, cobre el pago y notifique al cliente. Si el pago falla después de reservar, hay que compensar. Este módulo cubre outbox, CDC, sagas, idempotencia real y por qué 2PC suele ser una mala elección en microservicios.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Smokes de outbox, saga, idempotencia y decisión 2PC ejecutados con Java puro. Debezium/Kafka Connect/Temporal requieren infraestructura; se incluyen notas de verificación honestas.

### Tema 1: Outbox y CDC con Debezium · Avanzado · 150 min

## Outbox y CDC: publicar eventos sin dual write

Al crear un pedido en Tienda Aurora, `orders-service` debe guardar el estado en PostgreSQL y publicar `OrderCreated` a Kafka. El equipo hace dual write: primero `INSERT orders`, luego `kafka.send()`. Un día Kafka está lento: el INSERT commita, el send falla. El pedido existe, pero nadie se entera. Al día siguiente, el send se reintenta y publica un evento fantasma de un pedido que ya fue cancelado. Inconsistencia en ambas direcciones.

El outbox es como dejar una nota en la misma bandeja de salida del pedido: si el pedido se guardó, la nota también se guardó, porque están en la misma transacción. Un relay (CDC/Debezium) lee esa bandeja y la envía al broker. Si el broker falla, la nota sigue en la bandeja para reintentar. El consumidor debe ser idempotente porque el relay puede reenviar.

```java
import java.util.*;

public class OutboxSmoke {
    static class Db {
        final List<String> orders = new ArrayList<>();
        final List<String> outbox = new ArrayList<>();
    }

    static void createOrder(Db db, String orderId) {
        db.orders.add(orderId);
        db.outbox.add("OrderCreated:" + orderId);
    }

    static int relay(Db db, List<String> published) {
        published.addAll(db.outbox);
        int n = db.outbox.size();
        db.outbox.clear();
        return n;
    }

    public static void main(String[] args) {
        Db db = new Db();
        List<String> published = new ArrayList<>();
        createOrder(db, "o1");
        System.out.println("outbox-before-relay=" + db.outbox.size());
        System.out.println("relay-sent=" + relay(db, published));
        System.out.println("outbox-after-relay=" + db.outbox.size());
        System.out.println("published=" + published);
    }
}
```

```bash
javac OutboxSmoke.java
java OutboxSmoke
```

Salida esperada:

```text
outbox-before-relay=1
relay-sent=1
outbox-after-relay=0
published=[OrderCreated:o1]
```

El error más común es dual write sin outbox. El síntoma es pedido creado pero evento no publicado (o viceversa). La causa es dos sistemas sin transacción compartida. La corrección es outbox transaccional + relay/CDC.

### Tema 2: Sagas orquestadas/coreografiadas · Avanzado · 180 min

## Sagas: coordinar pedidos entre servicios

Crear un pedido en Tienda Aurora implica reservar inventario y cobrar pago. Si el pago falla después de reservar, la reserva queda tomada y el stock se pierde. No hay transacción ACID global; el equipo no sabe cómo compensar.

Una saga es como un viaje con escalas: cada escala (transacción local) se confirma por separado, y si una falla, tomas el vuelo de regreso (compensación). No es un rollback de base de datos; es una acción de negocio que deshace el efecto. La orquestación es como un director de orquesta que indica quién toca; la coreografía es como músicos que escuchan al anterior y saben cuándo entrar.

```java
public class SagaSmoke {
    static String run(boolean paymentOk, boolean inventoryReserved) {
        if (!inventoryReserved) return "fail: no inventory";
        if (!paymentOk) return "compensate: release inventory";
        return "ok: order confirmed";
    }

    static boolean compensationIdempotent(int attempts) {
        return attempts >= 1;
    }

    public static void main(String[] args) {
        System.out.println(run(false, true));
        System.out.println(run(true, true));
        System.out.println(run(true, false));
        System.out.println(compensationIdempotent(3));
    }
}
```

```bash
javac SagaSmoke.java
java SagaSmoke
```

Salida esperada:

```text
compensate: release inventory
ok: order confirmed
fail: no inventory
true
```

La compensación debe ser idempotente porque puede ejecutarse más de una vez. El error más común es falta de compensación o no idempotente: la reserva queda tomada sin pago.

### Tema 3: Idempotencia real y exactly-once práctico · Avanzado · 120 min

## Idempotencia real y exactly-once

El equipo afirma "usamos exactly-once de Kafka, así que no hay duplicados". En producción, un consumer se reinicia a mitad del procesamiento y el mismo evento se vuelve a entregar. El pago se aplica dos veces. La garantía del broker no cubrió el efecto en la base de datos ni en la pasarela externa.

Exactly-once end-to-end es como prometer que un paquete llega una sola vez en un sistema de correos imperfecto. La solución práctica no es "un correo perfecto", sino "el destinatario firma un recibo y no procesa el mismo paquete dos veces". Ese recibo es el dedup store.

```java
import java.util.*;

public class ExactlyOnceSmoke {
    record PaymentEvent(String eventId, String orderId, int amount) {}

    static class PaymentProcessor {
        private final Set<String> dedup = new HashSet<>();
        private final List<String> ledger = new ArrayList<>();

        String process(PaymentEvent e) {
            if (!dedup.add(e.eventId())) return "duplicate-ignored";
            ledger.add("charge:" + e.orderId() + ":" + e.amount());
            return "applied";
        }

        int ledgerSize() { return ledger.size(); }
    }

    public static void main(String[] args) {
        PaymentProcessor p = new PaymentProcessor();
        PaymentEvent e = new PaymentEvent("evt-1", "ord-1", 100);
        System.out.println(p.process(e));
        System.out.println(p.process(e));
        System.out.println("ledger=" + p.ledgerSize());
    }
}
```

```bash
javac ExactlyOnceSmoke.java
java ExactlyOnceSmoke
```

Salida esperada:

```text
applied
duplicate-ignored
ledger=1
```

Exactly-once end-to-end es un objetivo, no una garantía mágica. La práctica es at-least-once + idempotencia + dedup + transacciones locales. El error más común es asumir exactly-once del broker: doble cargo o reserva.

### Tema 4: Por qué evitar 2PC · Avanzado · 90 min

## Por qué evitar 2PC

El equipo propone XA/2PC para "garantizar consistencia" entre la DB de orders y Kafka. En el primer load test, la latencia se triplica y los locks duran segundos. Cuando el coordinator falla, los recursos quedan bloqueados y nadie puede procesar nuevas órdenes.

2PC es como una votación donde todos deben levantar la mano antes de que el presidente diga "aprobado". Si alguien no responde, todos quedan con la mano levantada esperando. En microservicios, esa espera bloquea recursos, aumenta latencia y crea un punto único de falla.

```java
public class TwoPcDecisionSmoke {
    static String choose(boolean sameDatabase, boolean needsGlobalAtomicity) {
        if (sameDatabase) return "local-transaction";
        if (needsGlobalAtomicity) return "evaluate-2pc-with-caution";
        return "outbox-or-saga";
    }

    public static void main(String[] args) {
        System.out.println(choose(true, true));
        System.out.println(choose(false, false));
        System.out.println(choose(false, true));
    }
}
```

```bash
javac TwoPcDecisionSmoke.java
java TwoPcDecisionSmoke
```

Salida esperada:

```text
local-transaction
outbox-or-saga
evaluate-2pc-with-caution
```

2PC busca atomicidad global a costa de latencia, locks y disponibilidad. En microservicios, outbox + saga + idempotencia suelen ser el trade-off correcto.

## Cierre

La consistencia distribuida se diseña: outbox para publicar confiablemente, sagas para procesos largos, idempotencia para duplicados. 2PC rara vez es el trade-off correcto en microservicios. Para Tienda Aurora, esto significa que cuando un pedido se confirma, el stock se reserva, el pago se procesa y la notificación se envía, todo con compensaciones si algo falla, sin bloquear el sistema entero.

## Checklist

- Outbox/CDC para DB+broker.
- Sagas con compensaciones idempotentes.
- Consumidores idempotentes con dedup persistente.
- Evito 2PC por defecto.
- Verificación honesta ante falta de infraestructura distribuida.
