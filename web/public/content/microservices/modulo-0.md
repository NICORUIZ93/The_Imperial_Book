# Módulo 0: Antes de distribuir — proceso, red y falacias

Este módulo no presupone que «microservicio» signifique Spring Boot, Docker o una API pequeña. Primero separas dos procesos y observas qué se pierde al cruzar la red: llamadas instantáneas, memoria compartida, resultado inequívoco y orden global.

## Aprende construyendo

El laboratorio crece de un servidor local a un flujo que hace visibles latencia, ambigüedad, orden y compatibilidad. Conserva cada evidencia: el objetivo no es completar comandos, sino poder explicar qué cambió y por qué.

## Entorno del módulo

Crea `academia-labs/microservices`, luego `src/` y `evidence/`. Comprueba `java --version`, `javac --version` y `curl --version`. Todos los comandos parten de esa carpeta. En Windows usa PowerShell para crear archivos y `Get-NetTCPConnection`; los ejemplos de shell siguientes presuponen macOS/Linux.

### Tema 1: Ejecutar dos procesos Java y comprobar su socket HTTP · Fundamentos · 45 min

**Prerrequisito:** ninguno. Este es el primer tema del track.

**Al terminar podrás:** compilar y ejecutar un servidor Java en un proceso independiente, localizar su PID y comprobar qué dirección y puerto escucha antes de enviar una petición HTTP.

**¿Por qué es importante?** Un microservicio es, antes que nada, un proceso separado que escucha en una dirección de red: si no puedes comprobar qué PID atiende qué puerto, cualquier fallo posterior entre servicios se confunde con un error de código.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 25** porque es la LTS fijada para el laboratorio de Microservicios. Comprueba `java --version`, `javac --version`, `curl --version` y crea `academia-labs/microservices/m0-t1/{src,evidence}`. Si no puedes distinguir un archivo `.java` de una JVM en ejecución, vuelve a Java M0 T1 antes de continuar.

#### Paso 2 · Contexto y caso real

RutaFlow empieza como un proceso único. Antes de separar servicios, el equipo necesita comprobar qué cambia realmente cuando una capacidad vive tras una conexión. En un incidente, decir «el servidor está arriba» puede significar que existe un proceso, que un puerto escucha o que el endpoint responde correctamente: son evidencias distintas. Confundirlas prolonga el diagnóstico y puede hacer que infraestructura reinicie una aplicación saludable mientras el problema está en DNS, routing o lógica HTTP. En esta práctica se establece la primera frontera observable sin Docker ni Spring: una JVM escucha y otro proceso, `curl`, actúa como cliente.

#### Paso 3 · Teoría, modelo mental y analogía

**Mapa de subtemas críticos**

| Subtema | Papel | Explicación, límite y evidencia |
|---|---|---|
| Proceso y PID | Prerrequisito | Una JVM tiene memoria y recursos propios; `jps -l` demuestra su PID, pero no su salud HTTP |
| Host e interfaz | Núcleo | `127.0.0.1` solo acepta tráfico local; `0.0.0.0` amplía exposición y no es un destino de cliente |
| Puerto | Núcleo | Identifica el punto de escucha del proceso; un puerto libre no prueba que el protocolo sea correcto |
| Socket TCP | Núcleo | Combina protocolo, direcciones y puertos local/remoto; TCP transporta bytes, no objetos Java |
| Endpoint HTTP | Variante | `/health` añade semántica HTTP sobre TCP; `200 UP` es evidencia diferente de `LISTEN` |
| Puerto ocupado | Diagnóstico | Dos procesos no pueden escuchar el mismo par dirección/puerto sin una opción explícita de reutilización |

**Proceso** es una instancia ejecutándose; el archivo fuente no consume tráfico. **Host** señala una dirección de red y **puerto** selecciona un punto de comunicación. **Socket** es el extremo concreto que el sistema operativo mantiene. **HTTP** añade método, ruta, estado, headers y cuerpo sobre la conexión TCP.

**Analogía:** un edificio es el host, un local es el puerto, el negocio abierto es el proceso y la conversación en la puerta es la conexión. Ver luz en el local no demuestra que atienda correctamente tu solicitud.

```text
curl (proceso cliente) ── TCP 127.0.0.1:puerto-efímero → 127.0.0.1:8081 ── Servidor (JVM/PID)
                                  GET /health → HTTP 200 + "UP"
```

#### Paso 4 · Demostración guiada desde cero

**Paso 4.1 — Setup.**

```bash
mkdir -p academia-labs/microservices/m0-t1/{src,evidence}
cd academia-labs/microservices/m0-t1
java --version
```

**Paso 4.2 — Código.** Crea `src/Servidor.java` completo:

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class Servidor {
  private static final String HOST = "127.0.0.1";
  private static final int PUERTO = 8081;

  private Servidor() { }

  public static void main(String[] args) throws IOException {
    // La dirección fija evita exponer el laboratorio fuera del equipo.
    var direccion = new InetSocketAddress(HOST, PUERTO);
    var servidor = HttpServer.create(direccion, 16);

    // El handler siempre cierra el body para liberar la conexión.
    servidor.createContext("/health", Servidor::responderSalud);
    servidor.start();

    long pid = ProcessHandle.current().pid();
    System.out.printf("LISTEN http://%s:%d/health pid=%d%n", HOST, PUERTO, pid);
  }

  private static void responderSalud(HttpExchange intercambio) throws IOException {
    byte[] cuerpo = "UP".getBytes(StandardCharsets.UTF_8);
    intercambio.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
    intercambio.sendResponseHeaders(200, cuerpo.length);
    try (var salida = intercambio.getResponseBody()) {
      salida.write(cuerpo);
    }
  }
}
```

**Paso 4.3 — Verificación.** En la primera terminal:

```bash
javac -d out src/Servidor.java
java -cp out Servidor
# Esperado: LISTEN http://127.0.0.1:8081/health pid=<número>
```

En otra terminal:

```bash
curl -i http://127.0.0.1:8081/health
# Esperado: HTTP/1.1 200 OK ... Content-type: text/plain; charset=utf-8 ... UP
jps -l
lsof -nP -iTCP:8081 -sTCP:LISTEN  # Linux: ss -ltnp 'sport = :8081'
```

**Fallo deliberado:** sin detener el primer servidor, ejecuta `java -cp out Servidor` en una tercera terminal → **Error esperado:** `java.net.BindException: Address already in use` (Windows puede mostrar `Address already in use: bind`) → **Diagnóstico:** el primer PID ya posee `127.0.0.1:8081`; cambiar el puerto ocultaría el diagnóstico, por lo que primero localiza y detén conscientemente el proceso duplicado.

#### Paso 5 · Práctica guiada

1. **Reproducción:** cambia el cuerpo a `READY`, recompila y predice el `Content-length`. Pista: cuenta bytes UTF-8.
2. **Variación:** usa el puerto `8082`; confirma con `lsof`/`ss` que `8081` queda libre. Pista: modifica una sola constante.
3. **Diagnóstico:** solicita `/no-existe` y explica por qué recibir HTTP `404` demuestra más conectividad que un rechazo TCP. Pista: la JVM sí respondió.
4. **Integración:** guarda PID, URL, estado y cuerpo en `evidence/tema-1.txt`. Pista: combina `jps`, `curl -i` y la salida del servidor.
5. **Diseño:** decide si RutaFlow debe escuchar en `127.0.0.1` o `0.0.0.0` durante desarrollo compartido y escribe riesgo, mitigación y condición de uso.

#### Paso 6 · Práctica independiente

Sin copiar el ejemplo, crea `src/ServidorVersion.java` que escuche en `127.0.0.1:8083` y responda exactamente `RutaFlow m0-t1` en `/version`. Entrega el código, la salida de compilación, el PID, el socket en escucha y una petición que demuestre estado, `Content-Type` y cuerpo. No uses Spring, Docker ni dependencias externas.

#### Paso 7 · Cierre

- [ ] Distingo archivo fuente, clase compilada y proceso con PID.
- [ ] Puedo explicar host, puerto y socket sin llamarlos «la URL».
- [ ] Compruebo por separado escucha TCP y respuesta HTTP.
- [ ] Reproduzco y diagnostico el puerto ocupado sin cambiarlo al azar.
- [ ] Entrego evidencia en `evidence/tema-1.txt`.

Si fallas 2 o más puntos, vuelve al Paso 4 y repite desde una carpeta limpia. **Prerrequisito de:** M0 T2 (diagnosticar DNS, conexión y ruta HTTP). Fuente primaria: [Java 25 `HttpServer`](https://docs.oracle.com/en/java/javase/25/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html).

### Tema 2: Imponer un presupuesto temporal a una solicitud HTTP · Aplicación · 45 min

**Prerrequisito:** M0 T1 (ejecutar dos procesos Java y comprobar su socket HTTP).

**Al finalizar podrás:** medir por separado el tiempo de una respuesta saludable y una lenta, configurar límites para establecer una conexión y esperar una respuesta, identificar la excepción que corresponde a cada fase y explicar por qué abandonar la espera del cliente no cancela automáticamente el trabajo del servidor.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1** y dos terminales. Conserva `academia-labs/microservices/m0-t1` y crea `m0-t2/{src,out,evidence}`. Debes poder iniciar y detener conscientemente el servidor de M0 T1; si todavía resuelves un puerto ocupado cambiando números al azar, repite su fallo deliberado antes de continuar.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un timeout mal ubicado permite que una dependencia lenta retenga recursos o fabrica fallos y reintentos innecesarios. Distinguir la fase que agotó el presupuesto evita diagnosticar como caída del servidor lo que realmente fue rechazo TCP, respuesta tardía o un límite demasiado agresivo.

RutaFlow consulta una tarifa antes de confirmar un envío. El servidor de tarifas puede aceptar TCP inmediatamente y tardar segundos en responder porque espera su base de datos. Si el cliente configura únicamente el tiempo de conexión, la petición permanece ocupando un hilo, memoria y una conexión aunque la respuesta ya no tenga valor para quien espera. Bajo carga, muchas esperas largas agotan recursos y convierten una dependencia lenta en una caída en cascada. Para diagnosticar correctamente debes separar cuatro hechos: cuánto tardó la operación completa, si TCP llegó a conectarse, si HTTP entregó una respuesta y si el servidor continuó trabajando después de que el cliente abandonó.

#### Paso 3 · Teoría, modelo mental y analogía

**Mapa de subtemas críticos**

| Subtema | Papel | Explicación causal, límite y evidencia |
|---|---|---|
| Latencia observada | Núcleo | Mide tiempo extremo a extremo e incluye conexión, colas, ejecución y transporte; una cifra aislada no identifica la fase lenta |
| Timeout de conexión | Núcleo | Limita crear una conexión TCP nueva; una conexión reutilizada puede omitir esta fase, por lo que no limita toda la petición |
| Timeout de solicitud | Núcleo | Limita cuánto espera esa petición por la respuesta y produce `HttpTimeoutException` cuando `/lento` supera 500 ms |
| Rechazo frente a espera | Diagnóstico | Un puerto local sin escucha suele fallar inmediatamente con `ConnectException`; no demuestra que venció el timeout configurado |
| Cancelación local | Límite | El cliente deja de esperar, pero el handler puede terminar después; limitar espera no revierte efectos ni interrumpe trabajo remoto |
| Selección del límite | Decisión | Debe derivarse del presupuesto extremo a extremo y percentiles medidos; demasiado corto crea falsos fallos y demasiado largo consume capacidad |

La **latencia** es una medición; un **timeout** es una decisión que termina una espera al superar una duración. `HttpClient.Builder.connectTimeout` gobierna el establecimiento de una conexión nueva. `HttpRequest.Builder.timeout` gobierna la espera de una solicitud completa. No son intercambiables: conectarse rápido a un servidor lento satisface el primero y puede incumplir el segundo.

##### Medir la latencia observada

Mide desde antes de enviar hasta recibir o fallar. Ese total permite comparar experiencias, pero no atribuir por sí solo la demora: resolución, conexión, cola, cómputo y descarga pueden contribuir. Conserva fase, resultado y unidad; un promedio sin percentiles oculta las peticiones lentas.

##### Limitar la conexión y la solicitud

El timeout de conexión protege únicamente una conexión nueva. El timeout de solicitud protege la espera completa que ve el cliente. Debes configurar ambos porque una conexión aceptada no garantiza una respuesta oportuna, y la reutilización puede hacer que una petición ni siquiera ejecute una conexión nueva.

##### Diagnosticar rechazo y respuesta tardía

`ConnectException` significa que no se estableció la conexión en este experimento; `HttpTimeoutException` significa que la solicitud excedió su límite. Un estado HTTP 500 es distinto: hubo conexión y respuesta HTTP. Esta clasificación decide si inspeccionas escucha/ruta, saturación/latencia o lógica de aplicación.

##### Reconocer el límite de la cancelación local

Abandonar la espera libera recursos del cliente, pero no constituye una transacción distribuida ni revierte efectos. El servidor necesita su propio mecanismo de deadline o cancelación cooperativa. Por eso no debes reintentar una escritura solo porque el cliente recibió un timeout.

##### Decidir el presupuesto profesional

Parte del objetivo extremo a extremo, reserva margen al llamador y contrasta percentiles bajo carga. Un límite demasiado corto fabrica fallos y reintentos; uno demasiado largo retiene capacidad. Registra duración, fase y resultado, evitando identificadores sensibles como etiquetas métricas de alta cardinalidad.

Piensa en una llamada telefónica: el tiempo de conexión limita cuánto esperas a que contesten; el tiempo de solicitud limita cuánto permaneces en la conversación esperando el dato. Colgar libera tu teléfono, pero no obliga a la otra persona a dejar de preparar el informe. Del mismo modo, un timeout del cliente no prueba que el servidor no produjo un efecto.

```text
Cliente                 TCP                  Servidor
  |--- connect --------->| aceptado             |
  |--- GET /lento ------------------------------>|
  |         espera 500 ms                        | duerme 1500 ms
  |--- HttpTimeoutException                      |
  | deja de esperar                              | intenta responder después
```

Este tema no propaga un presupuesto entre servicios ni diseña reintentos: esas evidencias requieren objetivos propios y aparecen después.

#### Paso 4 · Demostración guiada desde cero

Crea `m0-t2/src/ServidorLatencia.java`:

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class ServidorLatencia {
  private ServidorLatencia() { }

  public static void main(String[] args) throws IOException {
    var servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", 8082), 16);
    servidor.createContext("/health", intercambio -> responder(intercambio, "UP"));
    servidor.createContext("/lento", intercambio -> {
      try {
        Thread.sleep(1500);
        responder(intercambio, "TARIFA=12000");
        System.out.println("SERVIDOR_TERMINO_LENTO");
      } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
        intercambio.close();
      }
    });
    servidor.start();
    System.out.println("LISTEN http://127.0.0.1:8082");
  }

  private static void responder(HttpExchange intercambio, String texto) throws IOException {
    byte[] cuerpo = texto.getBytes(StandardCharsets.UTF_8);
    intercambio.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
    intercambio.sendResponseHeaders(200, cuerpo.length);
    try (var salida = intercambio.getResponseBody()) {
      salida.write(cuerpo);
    }
  }
}
```

Crea `m0-t2/src/ClienteTimeout.java`:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;

public final class ClienteTimeout {
  private ClienteTimeout() { }

  public static void main(String[] args) throws Exception {
    try (var cliente = HttpClient.newBuilder()
        .connectTimeout(Duration.ofMillis(300))
        .build()) {
      var solicitud = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8082/lento"))
          .timeout(Duration.ofMillis(500))
          .GET()
          .build();
      try {
        var respuesta = cliente.send(solicitud, HttpResponse.BodyHandlers.ofString());
        System.out.printf("HTTP_%d %s%n", respuesta.statusCode(), respuesta.body());
      } catch (HttpTimeoutException error) {
        System.out.println("TIMEOUT_SOLICITUD HttpTimeoutException");
      }
    }
  }
}
```

Desde una **carpeta vacía**, crea el ejemplo independiente con `mkdir -p academia-labs/microservices/m0-t2/{src,out,evidence}`, guarda ambos archivos y ejecuta:

```bash
javac --release 27 -d out src/ServidorLatencia.java src/ClienteTimeout.java
java -cp out ServidorLatencia
# En la segunda terminal:
curl -fsS http://127.0.0.1:8082/health
java -cp out ClienteTimeout
```

**Resultado esperado — salida exacta del cliente:**

```text
UP
TIMEOUT_SOLICITUD HttpTimeoutException
```

Aproximadamente un segundo después, la terminal del servidor imprime `SERVIDOR_TERMINO_LENTO`: esa línea demuestra que el timeout liberó al cliente, pero no canceló el handler.

**Fallo deliberado:** cambia la URI del cliente a `http://127.0.0.1:65534/lento`, verifica antes que el puerto no tenga escucha y ejecuta → **Error esperado:** termina con `java.net.ConnectException` en vez de `HttpTimeoutException` → **Diagnóstico:** el sistema operativo rechazó la conexión; un rechazo inmediato no ejercita el timeout de respuesta ni demuestra una red que descarta paquetes.

#### Paso 5 · Práctica guiada

1. **Reproducción:** ejecuta `/health` y `/lento`; predice cuál supera 500 ms y conserva ambas salidas en `evidence/tema-2.txt`. Pista: el sueño ocurre solo en un handler.
2. **Variación:** aumenta el timeout de solicitud a 2000 ms. Predice y confirma `HTTP_200 TARIFA=12000`. Pista: no cambies la latencia del servidor.
3. **Diagnóstico:** detén el servidor y ejecuta el cliente. Clasifica `ConnectException` como rechazo de conexión, no como respuesta HTTP lenta. Pista: busca si existe un PID escuchando en 8082.
4. **Integración:** mide cinco llamadas con `curl -o /dev/null -sS -w '%{time_total}\n'`; registra mínimo, máximo y limitación de la muestra. Pista: cinco observaciones no forman un SLO.
5. **Diseño:** para un presupuesto total de 1000 ms, asigna conexión, respuesta y margen del llamador. Justifica qué señal revisarías antes de reducir el límite; no copies 300/500 ms sin evidencia.

**Conexión con el proyecto integrador RutaFlow Distribuido:** conserva en `evidence/tema-2.txt` los tres resultados, la medición y la asignación de presupuesto. Esa evidencia fijará después el timeout de la consulta de tarifas del proyecto real; todavía no autoriza reintentos ni efectos de negocio.

#### Paso 6 · Práctica independiente

Crea un endpoint `/variable?ms=N` que acepte únicamente valores entre 0 y 2000, y un cliente con timeout de 700 ms. Entrega tres ejecuciones: 200 ms con HTTP 200, 900 ms con `HttpTimeoutException` y una entrada inválida con HTTP 400. Explica por qué ninguna de esas pruebas demuestra todavía cancelación cooperativa del trabajo remoto.

#### Paso 7 · Cierre

- [ ] Distingo latencia medida de timeout configurado.
- [ ] Explico qué fase limita `connectTimeout` y cuál limita `HttpRequest.timeout`.
- [ ] Diferencio `ConnectException`, `HttpTimeoutException` y una respuesta HTTP de error.
- [ ] Demuestro que el servidor puede continuar después del abandono del cliente.
- [ ] Justifico un límite mediante presupuesto y mediciones, no por intuición.

Si fallas 2 o más puntos, vuelve al Paso 4 y reproduce los tres resultados desde una carpeta limpia. **Siguiente tema y prerrequisito de:** M0 T3 (propagar un deadline sin reiniciar el presupuesto). Fuentes primarias: [Java 27 `HttpClient`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpClient.html), [`HttpRequest.Builder.timeout`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html#timeout(java.time.Duration)) y [`HttpTimeoutException`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpTimeoutException.html).

**Errores comunes:** interpretar todo timeout como «el servidor no hizo nada», medir solo el promedio, usar el timeout de conexión como límite total o aumentar valores sin observar saturación. **Fuentes oficiales:** la API de Java 27 enlazada arriba define el alcance y las excepciones; la elección numérica sigue dependiendo del presupuesto y de mediciones propias.

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
