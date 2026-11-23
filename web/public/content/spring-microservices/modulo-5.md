# Módulo 5 · Comunicación síncrona y asíncrona en Tienda Aurora

Los microservicios no fallan por falta de endpoints: fallan por contratos ambiguos, timeouts ausentes, reintentos peligrosos y acoplamiento temporal. Este módulo enseña a elegir y construir comunicación REST, gRPC, mensajería con Spring Cloud Stream, HTTP Service Clients declarativos y RSocket, con idempotencia y criterio operativo. Tienda Aurora necesita consultar catálogo, procesar pagos, enviar notificaciones y transmitir telemetría: cada caso exige un estilo de comunicación distinto.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes ejecutan comportamiento real con JDK (`com.sun.net.httpserver.HttpServer`, `HttpClient`, codificación binaria Protobuf-like, colas/redelivery e `InvocationHandler`). Spring WebClient, gRPC starters, Spring Cloud Stream, Kafka/RabbitMQ y RSocket reales requieren dependencias/infra; se incluyen notas de verificación honestas.

### Tema 1: REST con Spring MVC y WebClient · Intermedio · 150 min

## REST con timeout real: proteger orders-service de catalog-service lento

`orders-service` necesita el precio actual desde `catalog-service`. El desarrollador hace una llamada HTTP sin timeout. Un día `catalog-service` se degrada y tarda 5 segundos por respuesta. Los hilos de `orders-service` quedan esperando, el pool se agota y el checkout deja de responder. Un servicio lento tumbó otro servicio sano. El síntoma no es un 500 inmediato: es un sistema que se queda "pensando" hasta colapsar.

Una llamada REST síncrona es como llamar por teléfono y quedarte en la línea. Si la otra persona no contesta, necesitas decidir cuánto esperar antes de colgar. El connect timeout es cuánto esperas a que contesten; el request/read timeout es cuánto esperas a que terminen de hablar. Colgar a tiempo es doloroso, pero mejor que bloquear toda la operación.

La construcción comienza con un cliente HTTP que falla rápido, usando `HttpServer` real del JDK para simular un servicio lento:

```java
import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class RestTimeoutSmoke {
  public static void main(String[] args) throws Exception {
    HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext("/slow", exchange -> {
      try { Thread.sleep(500); } catch (InterruptedException ignored) {}
      byte[] body = "{\"id\":\"A1\",\"price\":10}".getBytes();
      exchange.sendResponseHeaders(200, body.length);
      try (OutputStream os = exchange.getResponseBody()) { os.write(body); }
    });
    server.start();
    int port = server.getAddress().getPort();

    HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofMillis(200))
        .build();
    HttpRequest req = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/slow"))
        .timeout(Duration.ofMillis(100))
        .GET()
        .build();

    try {
      client.send(req, HttpResponse.BodyHandlers.ofString());
      System.out.println("ok");
    } catch (java.net.http.HttpTimeoutException e) {
      System.out.println("timeout");
    } finally {
      server.stop(0);
    }
  }
}
```

```bash
javac RestTimeoutSmoke.java
java RestTimeoutSmoke
```

Salida esperada:

```text
timeout
```

El servidor responde, pero tarde; el cliente corta por timeout. En Spring, WebClient/HttpClient deben configurar connect timeout, response timeout y manejo de errores. El timeout no arregla al servicio lento; protege tu servicio.

En Spring Boot, el cliente declarativo usa WebClient con timeout configurado:

```java
@Service
public class CatalogClient {
    private final WebClient webClient;

    public CatalogClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://catalog-service").build();
    }

    public Mono<ProductDto> getProduct(String id) {
        return webClient.get()
            .uri("/products/{id}", id)
            .retrieve()
            .onStatus(HttpStatusCode::isError,
                resp -> resp.createException().flatMap(Mono::error))
            .bodyToMono(ProductDto.class)
            .timeout(Duration.ofMillis(500));
    }
}
```

El error más común es llamar sin timeout. El síntoma son hilos colgados, pool agotado y p99 alto. La causa es dependencia lenta o caída parcial. La corrección es connect/response timeout, timeout budget, circuit breaker y observabilidad. La señal observable es thread dump con esperas en I/O.

### Tema 2: gRPC con Spring · Avanzado · 120 min

## gRPC para comunicación interna de alto volumen

Dos servicios internos de Tienda Aurora intercambian miles de mensajes por segundo. Los payloads JSON son grandes, el parsing consume CPU y un equipo cambió un campo sin coordinar, rompiendo consumidores en producción. No hubo contrato tipado ni regla de compatibilidad. Además, necesitan streaming de actualizaciones.

gRPC con Protobuf es como usar formularios impresos con casillas numeradas en vez de cartas escritas a mano. Ambos comunican, pero el formulario es compacto, tipado y tiene reglas claras sobre qué casilla significa qué. El costo es que ambos lados deben compartir el esquema. En Protobuf, el número de campo es parte del contrato binario. Reusar el tag 1 para otro significado rompe compatibilidad silenciosamente: el binario decodifica "bien" pero la semántica queda corrupta.

```java
public class GrpcCompatibilitySmoke {
    static byte[] encodeVarintField(int fieldNumber, int value) {
        int tag = (fieldNumber << 3) | 0;
        return new byte[] { (byte) tag, (byte) value };
    }

    static Map<Integer, Integer> decodeMessage(byte[] payload) {
        Map<Integer, Integer> fields = new HashMap<>();
        for (int i = 0; i + 1 < payload.length; i += 2) {
            int field = (payload[i] & 0xFF) >> 3;
            int value = payload[i + 1] & 0xFF;
            fields.put(field, value);
        }
        return fields;
    }

    public static void main(String[] args) {
        byte[] oldPayload = encodeVarintField(1, 7);
        System.out.println((oldPayload[0] & 0xFF) >> 3);  // field number
        System.out.println(oldPayload[1] & 0xFF);          // value

        byte[] badReuse = encodeVarintField(1, 42); // reusar tag 1 con otro significado
        System.out.println(decodeMessage(badReuse).get(1)); // decodifica sin error pero semántica corrupta

        byte[] compatible = new byte[] { (byte) ((1 << 3) | 0), 7, (byte) ((2 << 3) | 0), 3 };
        Map<Integer, Integer> decoded = decodeMessage(compatible);
        System.out.println(decoded.get(1) + ":" + decoded.get(2));
    }
}
```

```bash
javac GrpcCompatibilitySmoke.java
java GrpcCompatibilitySmoke
```

Salida esperada:

```text
1
7
42
7:3
```

El valor `42` se decodifica sin error. Ese es el peligro: corrupción silenciosa, no excepción obvia. La regla real de Protobuf es: no reusar tags, no cambiar wire type incompatible, agregar campos nuevos con tags nuevos.

El error más común es reusar tag Protobuf. El síntoma es datos corruptos o comportamiento errático. La causa es que el consumidor interpreta el mismo tag con semántica nueva. La corrección es reservar tags eliminados, agregar campos nuevos con tags nuevos y usar CI de compatibilidad.

### Tema 3: Mensajería con Spring Cloud Stream · Avanzado · 150 min

## Mensajería con Spring Cloud Stream para desacoplar tiempo

Cuando un pedido se confirma en Tienda Aurora, `orders-service` llama sincrónicamente a email, analytics, inventario y facturación. Si analytics está caído, la confirmación de pedido falla. El usuario no recibe su pedido por culpa de un servicio secundario.

La mensajería asíncrona es como dejar un mensaje en un buzón. El remitente no necesita que el destinatario esté despierto en ese instante. El mensaje queda, se entrega cuando se pueda, y el remitente sigue. El costo: debes manejar duplicados, orden y fallos diferidos.

```java
import java.util.*;
import java.util.concurrent.*;

public class MessagingIdempotencySmoke {
    record OrderCreated(String eventId, String orderId, String email) {}

    static class IdempotentConsumer {
        private final Set<String> seen = ConcurrentHashMap.newKeySet();
        private final List<String> sideEffects = new CopyOnWriteArrayList<>();

        void consume(OrderCreated event) {
            if (!seen.add(event.eventId())) return;
            sideEffects.add("email:" + event.email() + ":" + event.orderId());
        }

        int sideEffectCount() { return sideEffects.size(); }
    }

    public static void main(String[] args) {
        IdempotentConsumer consumer = new IdempotentConsumer();
        OrderCreated event = new OrderCreated("evt-1", "ord-1", "ana@aurora.test");
        List<OrderCreated> redeliveries = List.of(event, event, event);
        for (OrderCreated e : redeliveries) consumer.consume(e);
        System.out.println(consumer.sideEffectCount());
        System.out.println(redeliveries.size());
    }
}
```

```bash
javac MessagingIdempotencySmoke.java
java MessagingIdempotencySmoke
```

Salida esperada:

```text
1
3
```

Tres entregas del broker, un solo efecto secundario. La clave es `eventId` estable y deduplicación transaccional/persistente en producción. En Spring Cloud Stream, el broker desacopla tiempo mediante bindings funcionales (`Supplier/Function/Consumer`). El consumidor debe ser idempotente porque la entrega típica es at-least-once.

El error más común es consumidor no idempotente. El síntoma son efectos duplicados. La causa es at-least-once delivery. La corrección es `eventId`, tabla de idempotencia/outbox, operaciones upsert. La señal observable es mismo `eventId` procesado múltiples veces.

### Tema 4: Sync vs async, timeouts e idempotencia · Avanzado · 120 min

## Sync vs async: criterio de decisión

El equipo convierte todo a REST síncrono porque "es más simple". Luego un pago tarda 15s y bloquea el checkout; reintentan el pago y duplican el cobro; una notificación no crítica tumba la operación crítica. La simplicidad inicial se volvió fragilidad.

Elegir sync vs async es elegir si esperas en la ventanilla o si tomas un ticket. Si necesitas la respuesta para continuar, esperas. Si puedes continuar y procesar después, tomas ticket. Pero en ambos casos necesitas reglas: cuánto esperar, qué pasa si te atienden dos veces, y cómo rastrear el ticket.

```java
import java.util.*;
import java.util.concurrent.*;

public class SyncAsyncIdempotencySmoke {
    record PaymentRequest(String idempotencyKey, String orderId, int amount) {}

    static class PaymentService {
        private final Map<String, String> processed = new ConcurrentHashMap<>();
        synchronized String charge(PaymentRequest req) {
            return processed.computeIfAbsent(req.idempotencyKey(),
                k -> "charged:" + req.orderId() + ":" + req.amount());
        }
    }

    static String syncWithTimeoutBudget(int budgetMs, int remoteMs) {
        return remoteMs <= budgetMs ? "ok" : "timeout";
    }

    static String asyncEnqueue(Queue<String> queue, String event) {
        queue.add(event);
        return "accepted";
    }

    public static void main(String[] args) {
        PaymentService payments = new PaymentService();
        PaymentRequest req = new PaymentRequest("idem-1", "ord-1", 100);
        System.out.println(payments.charge(req));
        System.out.println(payments.charge(req)); // retry seguro

        System.out.println(syncWithTimeoutBudget(300, 200));
        System.out.println(syncWithTimeoutBudget(300, 800));

        Queue<String> queue = new ArrayDeque<>();
        System.out.println(asyncEnqueue(queue, "OrderCreated:ord-1"));
        System.out.println(queue.poll());
    }
}
```

```bash
javac SyncAsyncIdempotencySmoke.java
java SyncAsyncIdempotencySmoke
```

Salida esperada:

```text
charged:ord-1:100
charged:ord-1:100
ok
timeout
accepted
OrderCreated:ord-1
```

El mismo `idempotencyKey` produce un solo cobro. El budget de timeout decide rápido cuando una dependencia no cumple. El async acepta y encola trabajo diferible. Sync y async no compiten: se combinan. El checkout puede ser sync en lo crítico y async en lo secundario.

### Tema 5: HTTP Service Clients declarativos y RSocket · Avanzado · 120 min

## HTTP Service Clients declarativos y RSocket

`orders-service` tiene 15 llamadas HTTP a otros servicios. Cada una repite el mismo boilerplate: URL, headers, timeout, parseo, manejo de errores. Un cambio de path obliga a buscar strings en múltiples clases. En paralelo, un canal interno necesita streaming de eventos con backpressure y REST se siente forzado.

Un cliente HTTP declarativo es como definir un contrato en una interfaz: dices "qué operación existe" y el runtime se encarga de ejecutar la llamada. RSocket es otro idioma de comunicación: sirve cuando la conversación no es solo request-response, sino stream o canal bidireccional. No reemplaza a REST; cubre otro tipo de conversación.

```java
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@interface HttpExchange { String value(); }
@Retention(RetentionPolicy.RUNTIME)
@interface GetExchange { String value(); }

@HttpExchange("/orders")
interface OrdersApi {
    @GetExchange("/{id}")
    String byId(String id);
}

public class DeclarativeClientSmoke {
    static <T> T create(Class<T> type, Map<String, String> routes) {
        InvocationHandler h = (proxy, method, args) -> {
            GetExchange get = method.getAnnotation(GetExchange.class);
            HttpExchange base = type.getAnnotation(HttpExchange.class);
            String route = base.value() + get.value();
            String resolved = route.replace("{id}", String.valueOf(args[0]));
            return routes.get(resolved);
        };
        return type.cast(Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, h));
    }

    public static void main(String[] args) {
        OrdersApi api = create(OrdersApi.class, Map.of("/orders/A1", "order:A1"));
        System.out.println(api.byId("A1"));
        System.out.println(OrdersApi.class.getAnnotation(HttpExchange.class).value());
    }
}
```

```bash
javac DeclarativeClientSmoke.java
java DeclarativeClientSmoke
```

Salida esperada:

```text
order:A1
/orders
```

La interfaz es el contrato. Spring crea el proxy. RSocket entra cuando necesitas streaming/backpressure/interacción reactiva, no para CRUD simple. El error más común es elegir RSocket por novedad: más complejidad operativa y debugging difícil sin beneficio real.

## Cierre

La comunicación entre microservicios de Tienda Aurora es un diseño de contratos bajo fallo. REST da simplicidad para consultas síncronas. gRPC da eficiencia y tipos para comunicación interna de alto volumen. Mensajería desacopla tiempo para eventos y tareas diferibles. HTTP Interfaces reducen boilerplate. RSocket cubre streams reactivos. La calidad no está en la herramienta, sino en timeouts, idempotencia, compatibilidad y observabilidad.

## Checklist

- Toda llamada remota tiene timeout y budget.
- Operaciones reintentables son idempotentes.
- Contratos Protobuf/HTTP versionados y compatibles.
- Consumidores async idempotentes con DLQ.
- Cliente declarativo no reemplaza resiliencia.
- Verificación honesta cuando falta infraestructura.
