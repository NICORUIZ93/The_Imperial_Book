# Módulo 0: Antes de distribuir — proceso, red y falacias

Este módulo no presupone que «microservicio» signifique Spring Boot, Docker o una API pequeña. Primero separas dos procesos y observas qué se pierde al cruzar la red: llamadas instantáneas, memoria compartida, resultado inequívoco y orden global.

## Aprende construyendo

El laboratorio crece de un servidor local a un flujo que hace visibles latencia, ambigüedad, orden y compatibilidad. Conserva cada evidencia: el objetivo no es completar comandos, sino poder explicar qué cambió y por qué.

## Entorno del módulo

Crea `academia-labs/microservices`, luego `src/` y `evidence/`. Comprueba `java --version`, `javac --version` y `curl --version`. Todos los comandos parten de esa carpeta. En Windows usa PowerShell para crear archivos y `Get-NetTCPConnection`; los ejemplos de shell siguientes presuponen macOS/Linux.

### Tema 1: Proceso, host, puerto, socket y DNS · Fundamentos · 70 min

**Prerrequisitos:** terminal, proceso Java básico y diferencia entre archivo y programa en ejecución.

**Al terminar podrás:** ejecutar cliente y servidor como procesos distintos, identificar cada extremo del socket y diagnosticar por separado nombre, ruta y puerto.

**¿Por qué es importante?** Si no distingues proceso, resolución, conexión y aplicación, cualquier incidente termina etiquetado como «la red» y se corrige por ensayo y error.

#### Aprende

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Proceso y PID | Prerrequisito | `jps -l` muestra dos JVM con memoria separada |
| Host e interfaz | Núcleo | `127.0.0.1` limita la escucha al equipo local |
| Puerto | Núcleo | `lsof -nP -iTCP:8081 -sTCP:LISTEN` muestra quién escucha |
| Socket y conexión | Núcleo | servidor registra dirección remota y local |
| DNS | Variante | `localhost` se resuelve antes de intentar TCP |
| Errores por fase | Diagnóstico | nombre inexistente y puerto cerrado producen fallos distintos |

**Proceso y PID.** Un proceso es una instancia en ejecución con espacio de memoria y recursos propios. Dos JVM no comparten objetos: pasar `Pedido` exige convertirlo en bytes y reconstruirlo. Error frecuente: dibujar dos cajas pero probar dos clases dentro de la misma JVM; eso no reproduce aislamiento.

**Host, interfaz y puerto.** El host identifica la máquina o dirección; el puerto identifica un punto de escucha dentro de ella. Escuchar en `127.0.0.1` no expone el servicio a otras interfaces; `0.0.0.0` solicita escuchar en todas las disponibles y amplía la superficie. Un puerto publicado no implica que la aplicación esté lista.

**Socket y conexión.** Un socket TCP conectado se identifica por protocolo, IP/puerto local e IP/puerto remoto. TCP entrega un flujo de bytes ordenado, no mensajes de negocio: debes delimitar peticiones y limitar tamaños. `accept()` exitoso tampoco confirma que la operación de negocio terminó.

**DNS y errores por fase.** DNS traduce un nombre a una o más direcciones; su éxito no garantiza que exista ruta, escucha o respuesta. `UnknownHostException` apunta a resolución; `ConnectException` suele indicar rechazo al conectar; `HttpTimeoutException` indica que la solicitud excedió su presupuesto. No los conviertas todos en «servicio caído».

#### Practica

Crea `src/Servidor.java`:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Servidor {
  public static void main(String[] args) throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8081), 16);
    server.createContext("/health", exchange -> {
      byte[] body = "UP".getBytes(StandardCharsets.UTF_8);
      exchange.sendResponseHeaders(200, body.length);
      try (var out = exchange.getResponseBody()) { out.write(body); }
    });
    server.start();
    System.out.println("LISTEN 127.0.0.1:8081 pid=" + ProcessHandle.current().pid());
  }
}
```

Ejecuta:

```bash
javac -d out src/Servidor.java
java -cp out Servidor
curl -i http://localhost:8081/health
```

En otra terminal ejecuta `jps -l` y `lsof -nP -iTCP:8081 -sTCP:LISTEN` (Linux: `ss -ltnp 'sport = :8081'`). Debes observar `HTTP/1.1 200 OK`, cuerpo `UP`, un PID Java y el socket en escucha.

**Fallo deliberado:** prueba `curl http://nombre-que-no-existe.invalid:8081/health` y, después de detener Java, `curl http://127.0.0.1:8081/health`. Guarda ambos errores en `evidence/tema-1.txt` y explica qué fase falló. **Transferencia al proyecto integrador RutaFlow Distribuido:** cambia la escucha a `0.0.0.0`, verifica las interfaces y vuelve a `127.0.0.1`; no dejes exposición innecesaria.

### Tema 2: Latencia, deadline y timeouts por fase · Aplicación · 80 min

**Al terminar podrás:** imponer un presupuesto total, distinguir conexión de respuesta y cancelar trabajo que ya perdió utilidad.

**¿Por qué es importante?** Una dependencia lenta retiene threads, conexiones y memoria; sin límites, un fallo local se convierte en agotamiento en cascada.

#### Aprende

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Latencia | Núcleo | `/lento` tarda más que `/health` |
| Timeout de conexión | Variante | cliente falla si no establece conexión a tiempo |
| Timeout de solicitud | Núcleo | respuesta tardía produce `HttpTimeoutException` |
| Deadline | Profundización | llamadas encadenadas consumen un presupuesto común |
| Cancelación | Límite | cliente abandona, pero servidor debe detener su propio trabajo |
| Presupuesto y fan-out | Decisión | el máximo no es la suma simple cuando llamadas son paralelas |

**Latencia** es tiempo transcurrido; no es solo «red»: incluye colas, serialización, ejecución y dependencias. **Timeout** es una duración configurada para una fase. **Deadline** es el instante límite de toda la operación. Si cada salto recibe cinco segundos nuevos, una cadena puede exceder ampliamente el objetivo original.

El `connectTimeout` de `HttpClient` limita establecer una conexión nueva; `HttpRequest.timeout` limita recibir la respuesta de esa solicitud. Una conexión reutilizada puede no pasar por la primera fase. Error profesional: configurar solo conexión y dejar que una respuesta espere indefinidamente.

Cancelar al cliente libera su espera, no revierte automáticamente el servidor. El servidor debe observar cancelación o deadline antes de iniciar efectos costosos. En fan-out paralelo, reserva margen para agregación y degradación; no asignes el SLO entero a cada dependencia.

#### Practica

Agrega al servidor un contexto `/lento` que ejecute `Thread.sleep(1500)` antes de responder. Crea `src/Cliente.java`:

```java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class Cliente {
  public static void main(String[] args) throws Exception {
    try (var client = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(300)).build()) {
      var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8081/lento"))
          .timeout(Duration.ofMillis(500)).build();
      try { client.send(request, HttpResponse.BodyHandlers.ofString()); }
      catch (HttpTimeoutException e) { System.out.println("TIMEOUT_SOLICITUD"); }
    }
  }
}
```

Compila y ejecuta:

```bash
javac -d out src/Servidor.java src/Cliente.java
java -cp out Cliente
```

**Resultado esperado:** debes observar `TIMEOUT_SOLICITUD` cerca de 500 ms, no 1500 ms. Mide también con `time java -cp out Cliente`.

**Límite:** el ejemplo no simula pérdida, colas ni una red real; solo hace observable el presupuesto. **Transferencia al proyecto integrador RutaFlow Distribuido:** recibe un header `X-Deadline-Epoch-Millis`, calcula tiempo restante antes de dormir y responde `504` si ya no alcanza. Prueba 100 ms y 2000 ms. Documenta por qué propagar tiempo restante es más seguro que reiniciar el timeout.

**Decisión profesional:** calcula el valor desde mediciones de latencia y el presupuesto extremo a extremo, no desde un número copiado. Un timeout demasiado corto crea falsos fallos y reintentos; uno demasiado largo consume capacidad. Registra duración, deadline restante y resultado sin convertir identificadores sensibles en etiquetas métricas de alta cardinalidad. Fuente: [gRPC — deadlines](https://grpc.io/docs/guides/deadlines/) y [Java 25 `HttpClient`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html).

### Tema 3: Fallo parcial, resultado desconocido e idempotencia · Integración · 90 min

**Al terminar podrás:** distinguir rechazo, fallo confirmado y resultado desconocido, y diseñar un reintento que no duplique el negocio.

**¿Por qué es importante?** Los sistemas reales no pueden confundir una respuesta perdida con una operación no ejecutada: esa confusión duplica cobros, envíos o reservas.

#### Aprende

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Fallo parcial | Núcleo | cliente falla mientras servidor sigue vivo |
| Ambigüedad del timeout | Núcleo | efecto puede ocurrir aunque no llegue respuesta |
| Reintento | Variante | segundo intento repite transporte |
| Clave idempotente | Núcleo | mismo identificador produce un solo efecto |
| Estado durable | Límite | mapa en memoria pierde deduplicación al reiniciar |
| Reconciliación | Diagnóstico | consulta posterior decide qué ocurrió |

Un fallo total detiene todo el sistema; uno parcial deja componentes con visiones distintas. Si el servidor confirma en su base y la conexión cae antes de responder, el cliente ve un error pero el efecto existe. Por eso «timeout = operación fallida» es falso.

Reintentar mejora disponibilidad solo cuando el efecto es seguro o idempotente. Una clave idempotente identifica la intención de negocio, no el intento HTTP. El servidor guarda clave, huella de la petición y resultado; la misma clave con payload diferente debe rechazarse. Guardarla en memoria no sobrevive a reinicios y solo sirve para demostrar el mecanismo.

La reconciliación consulta el estado por un identificador estable después de un resultado desconocido. Error frecuente: generar una clave nueva en cada retry; así cada intento parece una operación distinta.

#### Practica

Crea `src/ServidorIdempotente.java` con un endpoint `POST /envios` que exija `Idempotency-Key`, incremente un contador solo si la clave no existe y guarde la respuesta en un `ConcurrentHashMap`. Antes de devolver la primera respuesta, duerme 900 ms. Ejecuta dos veces con timeout de 300 ms usando la **misma** clave y luego consulta `GET /envios/{clave}`.

```bash
curl --max-time 0.3 -X POST -H 'Idempotency-Key: ENV-001' http://127.0.0.1:8081/envios
curl --max-time 0.3 -X POST -H 'Idempotency-Key: ENV-001' http://127.0.0.1:8081/envios
curl http://127.0.0.1:8081/envios/ENV-001
```

**Resultado esperado:** las dos llamadas pueden expirar, pero la consulta debe mostrar un solo envío. **Fallo deliberado:** usa `ENV-002` en el retry y observa dos efectos; corrige reutilizando la intención original. **Transferencia al proyecto integrador RutaFlow Distribuido:** reemplaza el mapa por una tabla con `UNIQUE(idempotency_key)`, guarda estado `PROCESSING/SUCCEEDED/FAILED` y explica cómo recuperas un `PROCESSING` huérfano.

**Decisión profesional:** conserva la deduplicación al menos durante la ventana máxima de reintentos y devuelve la respuesta original, no una segunda ejecución. La clave debe estar ligada a identidad/operación para que otro usuario no pueda consultar el resultado. Los errores de validación deterministas pueden almacenarse; un fallo transitorio anterior al efecto requiere una política diferente. Fuente: [Azure Architecture Center — Retry](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) e [Idempotent Consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html).

### Tema 4: Relojes, causalidad, concurrencia y orden · Integración · 80 min

**Al terminar podrás:** evitar decisiones de negocio basadas en un reloj global inexistente y preservar orden donde realmente importa.

**¿Por qué es importante?** Los eventos concurrentes y tardíos pueden corromper una proyección si el sistema usa timestamps como si probaran causalidad.

#### Aprende

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Reloj de pared | Prerrequisito | dos timestamps pueden retroceder o diferir |
| Reloj monotónico | Variante | `nanoTime` mide duración, no fecha |
| Causalidad | Núcleo | respuesta ocurre después de petición aunque los relojes discrepen |
| Concurrencia | Núcleo | dos eventos no tienen relación causal demostrada |
| Orden por agregado | Decisión | versión 3 no puede ser reemplazada por versión 2 |
| Duplicado y tardío | Diagnóstico | consumidor ignora versión ya aplicada |

`Instant.now()` sirve para registrar fecha, pero sincronización imperfecta y ajustes impiden usarlo como único orden de negocio. `System.nanoTime()` sirve para duraciones dentro de un proceso; su origen no es compartible. Causalidad significa «A pudo influir en B»; concurrencia significa que no se conoce tal relación.

No necesitas orden global para todo. Kafka, por ejemplo, solo puede preservar orden dentro de la unidad que su contrato defina; el dominio suele necesitar orden por agregado. Incluye `aggregateId` y `aggregateVersion`: aplica una transición solo si la versión sigue a la última confirmada. Un timestamp más reciente no rescata una secuencia inválida.

#### Practica

Crea `src/Proyeccion.java` con `ultimaVersion` por envío:

```java
import java.util.*;
public class Proyeccion {
  record Evento(String id, long version) {}
  public static void main(String[] args) {
    var ultima = new HashMap<String, Long>();
    var eventos = List.of(new Evento("ENV-1",1), new Evento("ENV-1",3),
        new Evento("ENV-1",2), new Evento("ENV-2",1));
    for (var e : eventos) {
      long actual = ultima.getOrDefault(e.id(), 0L);
      String resultado = e.version() == actual + 1 ? "APLICADO" : e.version() <= actual ? "OBSOLETO" : "HUECO";
      if (resultado.equals("APLICADO")) ultima.put(e.id(), e.version());
      System.out.printf("%s %s:v%d%n", resultado, e.id(), e.version());
    }
  }
}
```

```bash
javac -d out src/Proyeccion.java
java -cp out Proyeccion
```

**Resultado esperado:** imprime `APLICADO ENV-1:v1`, `HUECO ENV-1:v3`, `APLICADO ENV-1:v2` y `APLICADO ENV-2:v1`. **Error:** ordenar toda la lista por timestamp oculta que `v2` llegó tarde y puede sobrescribir `v3`. **Transferencia al proyecto integrador RutaFlow Distribuido:** añade un buffer acotado para huecos; si falta una versión pasado el deadline, envía a cuarentena y dispara reconciliación. Decide el límite para no retener memoria sin fin.

**Interacciones profesionales.** Una versión detecta orden por agregado, pero no resuelve conflictos entre escritores que aceptaron la misma versión base; la escritura necesita compare-and-set, bloqueo optimista o un único propietario. Tampoco uses el offset del broker como versión del dominio: describe posición dentro de una partición, no la validez de la transición. Si replicas entre regiones, declara qué conflictos pueden ocurrir y qué actor decide; «última escritura gana» puede perder una confirmación válida.

**Diagnóstico y seguridad.** Registra `eventId`, agregado, versión esperada/recibida y correlation ID, evitando payloads sensibles. Distingue duplicado exacto, evento obsoleto y hueco: requieren ignorar, reconciliar o aparcar, respectivamente. Una cola de cuarentena sin alerta ni procedimiento solo es almacenamiento de deuda. Fuente: [OpenTelemetry — contexto](https://opentelemetry.io/docs/specs/otel/context/) y [Azure Architecture Center — Sequential Convoy](https://learn.microsoft.com/en-us/azure/architecture/patterns/sequential-convoy).

### Tema 5: Serialización, evolución y falacias distribuidas · Experto · 100 min

**Al terminar podrás:** evolucionar un mensaje compatible, limitar su costo y convertir una falacia distribuida en una prueba reproducible.

**¿Por qué es importante?** Un contrato cambia mientras productores y consumidores se despliegan en momentos distintos; sin compatibilidad y límites, una mejora rompe el sistema o agota recursos.

#### Aprende

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Serialización y framing | Núcleo | objeto se convierte en bytes delimitados |
| Compatibilidad atrás/adelante | Núcleo | consumidor anterior tolera campo nuevo |
| Campos obligatorios y defaults | Variante | ausencia produce valor explícito o error versionado |
| Tamaño y límites | Seguridad | payload excesivo se rechaza antes de reservar memoria sin control |
| Versionado semántico | Decisión | cambio incompatible usa contrato/migración explícitos |
| Falacias distribuidas | Diagnóstico | cada supuesto se conecta a fallo y mitigación |

Serializar pierde identidad de objeto, métodos y tipos que el formato no representa. El receptor solo conoce bytes y contrato. Delimita mensajes y fija tamaño máximo antes de leerlos completos. Agregar un campo opcional con default suele ser compatible; renombrar, reutilizar significado o cambiar tipo puede romper consumidores aunque el JSON siga siendo válido.

Compatibilidad hacia atrás permite que el productor nuevo sea leído por consumidor anterior; hacia adelante permite que consumidor nuevo lea mensajes anteriores. Debes probar ambas direcciones con artefactos reales. «Tenemos `/v2`» no explica convivencia, deprecación ni migración.

Las falacias son supuestos que debes negar con diseño: red confiable → timeout/retry/reconciliación; latencia cero → presupuesto y medición; ancho infinito → límites/compresión; red segura → autenticación/cifrado/autorización; topología estable → descubrimiento; un administrador → políticas auditables; transporte sin costo → batching con límites; sistema homogéneo → contratos evolutivos; observabilidad posterior → contexto y señales desde el primer flujo.

#### Practica

Guarda `evidence/envio-v1.json` y `evidence/envio-v2.json`:

```json
{"id":"ENV-1","estado":"CREADO"}
```

```json
{"id":"ENV-1","estado":"CREADO","ciudadDestino":"Bogotá"}
```

Crea `src/Compatibilidad.java`: lee cada archivo, verifica `id` y `estado`, ignora claves desconocidas y usa `DESCONOCIDA` cuando no exista `ciudadDestino`. Para este laboratorio acotado puedes comprobar presencia con texto; en producción usa un parser con límite de bytes y esquema.

```java
import java.nio.file.*;
public class Compatibilidad {
  public static void main(String[] args) throws Exception {
    for (String archivo : args) {
      byte[] bytes = Files.readAllBytes(Path.of(archivo));
      if (bytes.length > 1_048_576) throw new IllegalArgumentException("PAYLOAD_EXCESIVO");
      String json = new String(bytes);
      if (!json.contains("\"id\"") || !json.contains("\"estado\"")) throw new IllegalArgumentException("CONTRATO_INVALIDO");
      String ciudad = json.contains("ciudadDestino") ? "PRESENTE" : "DESCONOCIDA";
      System.out.println(archivo + " ciudad=" + ciudad);
    }
  }
}
```

```bash
javac -d out src/Compatibilidad.java
java -cp out Compatibilidad evidence/envio-v1.json evidence/envio-v2.json
```

**Resultado esperado:** V1 produce `ciudad=DESCONOCIDA` y V2 `ciudad=PRESENTE`; ambos conservan `id` y `estado`. Después genera un body mayor de 1 MiB y verifica `PAYLOAD_EXCESIVO` antes de interpretar su contenido.

**Fallo deliberado:** cambia `estado` de texto a objeto conservando el mismo nombre; la prueba de compatibilidad debe fallar. No «arregles» el consumidor con un cast inseguro: publica migración o adaptador. **Transferencia final al proyecto integrador RutaFlow Distribuido:** elige una falacia, crea `evidence/falacia.md` con supuesto, experimento, salida, impacto y mitigación. La evidencia mínima del módulo es: dos procesos, timeout medido, resultado ambiguo reconciliado, evento tardío diagnosticado y compatibilidad en ambas direcciones.

**Fuentes primarias y de arquitectura:** [Java 25 `HttpClient`](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html), [gRPC — deadlines y propagación](https://grpc.io/docs/guides/deadlines/), [OpenTelemetry — contexto](https://opentelemetry.io/docs/specs/otel/context/) y [Azure Architecture Center — falacias y patrones distribuidos](https://learn.microsoft.com/en-us/azure/architecture/patterns).
