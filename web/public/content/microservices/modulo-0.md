# Curso Microservicios · Antes de distribuir: proceso, red y falacias

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

Usarás **JDK 27.0.1**. Comprueba `java --version`, `javac --version`, `curl --version` y crea `academia-labs/microservices/m0-t1/{src,evidence}`. Si no puedes distinguir un archivo `.java` de una JVM en ejecución, vuelve al curso Java, tema «Ejecutar el ciclo fuente-bytecode-proceso» antes de continuar.

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

Si fallas 2 o más puntos, vuelve al Paso 4 y repite desde una carpeta limpia. **Siguiente tema:** «Imponer un presupuesto temporal a una solicitud HTTP» (referencia interna M0 T2). Fuente primaria: [Java 27 `HttpServer`](https://docs.oracle.com/en/java/javase/27/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html).

### Tema 2: Imponer un presupuesto temporal a una solicitud HTTP · Aplicación · 45 min

**Prerrequisito:** tema «Ejecutar dos procesos Java y comprobar su socket HTTP» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T1).

**Al finalizar podrás:** medir por separado el tiempo de una respuesta saludable y una lenta, configurar límites para establecer una conexión y esperar una respuesta, identificar la excepción que corresponde a cada fase y explicar por qué abandonar la espera del cliente no cancela automáticamente el trabajo del servidor.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1** y dos terminales. Conserva `academia-labs/microservices/m0-t1` y crea `m0-t2/{src,out,evidence}`. Debes poder iniciar y detener conscientemente el servidor del tema «Ejecutar dos procesos Java y comprobar su socket HTTP»; si todavía resuelves un puerto ocupado cambiando números al azar, repite su fallo deliberado antes de continuar.

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

Si fallas 2 o más puntos, vuelve al Paso 4 y reproduce los tres resultados desde una carpeta limpia. **Siguiente tema:** «Propagar un deadline absoluto entre servicios HTTP» (referencia interna M0 T3). Fuentes primarias: [Java 27 `HttpClient`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpClient.html), [`HttpRequest.Builder.timeout`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html#timeout(java.time.Duration)) y [`HttpTimeoutException`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpTimeoutException.html).

**Errores comunes:** interpretar todo timeout como «el servidor no hizo nada», medir solo el promedio, usar el timeout de conexión como límite total o aumentar valores sin observar saturación. **Fuentes oficiales:** la API de Java 27 enlazada arriba define el alcance y las excepciones; la elección numérica sigue dependiendo del presupuesto y de mediciones propias.

### Tema 3: Propagar un deadline absoluto entre servicios HTTP · Aplicación · 45 min

**Prerrequisito:** tema «Imponer un presupuesto temporal a una solicitud HTTP» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T2).

**Al finalizar podrás:** convertir un presupuesto del cliente en un instante límite, propagar el mismo valor por un gateway, calcular el tiempo restante en cada salto, reservar margen para responder y rechazar trabajo que ya no puede terminar de forma útil.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**, tres terminales y los puertos locales 8082 y 8083. Crea una carpeta vacía `academia-labs/microservices/m0-t3/{src,out,evidence}`. Detén los procesos de T2 y verifica que ambos puertos estén libres antes de compilar; conserva la distinción entre timeout de una fase y presupuesto extremo a extremo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Si cada servicio recibe «500 ms nuevos», una cadena de cuatro saltos puede consumir dos segundos aunque el usuario sólo pudiera esperar medio segundo. El trabajo tardío ocupa capacidad y puede producir resultados que nadie utilizará.

RutaFlow recibe una solicitud de cotización con 1200 ms disponibles. El gateway necesita consultar tarifas y aún reservar tiempo para serializar y devolver la respuesta. En lugar de reiniciar una duración, el cliente calcula un instante límite; el gateway propaga exactamente ese valor y cada proceso resta su reloj actual. Una dependencia que recibe menos tiempo del necesario rechaza antes de iniciar trabajo costoso. El laboratorio hace visible la conservación del presupuesto, pero no resuelve por sí solo sincronización de relojes, cancelación de efectos ni reintentos.

#### Paso 3 · Teoría, modelo mental y analogía

**Mapa de subtemas críticos**

| Subtema | Papel | Explicación causal, límite y evidencia |
|---|---|---|
| Presupuesto | Prerrequisito | Es la duración disponible al inicio; disminuye mientras la operación avanza |
| Deadline absoluto | Núcleo | Es el instante final compartido; evita conceder una duración completa nueva en cada salto |
| Tiempo restante | Núcleo | Se recalcula como `deadline - ahora`; si no alcanza, el servicio rechaza antes de trabajar |
| Propagación | Núcleo | El gateway reenvía el mismo header, no un deadline reconstruido a partir de su timeout local |
| Reserva | Variante | El llamador descuenta margen para procesar la respuesta; reservar todo o nada también puede ser incorrecto |
| Relojes y confianza | Límite/seguridad | Un epoch presupone relojes razonablemente sincronizados y el servidor debe limitar valores absurdos enviados por clientes |
| Cancelación y efectos | Diagnóstico | Vencer el deadline no revierte una escritura iniciada; los efectos requieren idempotencia y reconciliación |

Un **timeout** limita una espera local; un **deadline** expresa cuándo deja de ser útil toda la operación. El **tiempo restante** cambia en cada salto y la **reserva** evita que una dependencia consuma hasta el último milisegundo. Analogía: una entrega debe llegar antes de las 18:00; cada conductor consulta la misma hora límite. Entregar «30 minutos nuevos» en cada transbordo falsearía el compromiso original.

```text
Cliente: deadline D
   | X-Deadline=D
Gateway: restante=D-ahora; reserva 100 ms
   | X-Deadline=D (el mismo valor)
Dependencia: restante=D-ahora; trabajo 400 ms
   | 200 TARIFA o 504 SIN_PRESUPUESTO
```

Un deadline absoluto por epoch es didáctico y común en HTTP propio; gRPC puede convertir deadlines entre procesos para mitigar sesgo de reloj. Ningún formato autoriza confiar en plazos arbitrariamente largos enviados desde Internet.

#### Paso 4 · Demostración guiada desde cero

Crea `m0-t3/src/DependenciaDeadline.java`, `m0-t3/src/GatewayDeadline.java` y `m0-t3/src/ClienteDeadline.java`. También puedes copiarlos como ejemplo independiente desde `examples/professional-bridges/microservices/`. Este es el contenido completo de los tres archivos; los comentarios señalan dónde se conserva o consume el presupuesto.

`m0-t3/src/DependenciaDeadline.java`:

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class DependenciaDeadline {
  private DependenciaDeadline() { }
  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8083), 16);
    server.createContext("/tarifa", DependenciaDeadline::tarifa);
    server.start();
    System.out.println("DEPENDENCIA http://127.0.0.1:8083/tarifa");
  }
  private static void tarifa(HttpExchange exchange) throws IOException {
    String raw = exchange.getRequestHeaders().getFirst("X-Deadline-Epoch-Millis");
    if (raw == null) { respond(exchange, 400, "DEADLINE_REQUERIDO"); return; }
    long remaining;
    try { remaining = Long.parseLong(raw) - System.currentTimeMillis(); }
    catch (NumberFormatException error) { respond(exchange, 400, "DEADLINE_INVALIDO"); return; }
    // Los 50 ms extra evitan empezar si no queda margen sobre el trabajo de 400 ms.
    if (remaining < 450) { respond(exchange, 504, "SIN_PRESUPUESTO_DEPENDENCIA"); return; }
    try {
      Thread.sleep(400);
      respond(exchange, 200, "TARIFA=12000");
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      exchange.close();
    }
  }
  private static void respond(HttpExchange exchange, int status, String text) throws IOException {
    byte[] body = text.getBytes(StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status, body.length);
    try (var output = exchange.getResponseBody()) { output.write(body); }
  }
}
```

`m0-t3/src/GatewayDeadline.java`:

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public final class GatewayDeadline {
  private static final long RESERVE_MILLIS = 100;
  private static final HttpClient CLIENT = HttpClient.newHttpClient();
  private GatewayDeadline() { }
  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 8082), 16);
    server.createContext("/cotizar", GatewayDeadline::quote);
    server.start();
    System.out.println("GATEWAY http://127.0.0.1:8082/cotizar");
  }
  private static void quote(HttpExchange exchange) throws IOException {
    String raw = exchange.getRequestHeaders().getFirst("X-Deadline-Epoch-Millis");
    long deadline;
    try { deadline = Long.parseLong(raw == null ? "" : raw); }
    catch (NumberFormatException error) { respond(exchange, 400, "DEADLINE_INVALIDO"); return; }
    long remaining = deadline - System.currentTimeMillis();
    if (remaining <= RESERVE_MILLIS) { respond(exchange, 504, "SIN_PRESUPUESTO_GATEWAY"); return; }
    var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8083/tarifa"))
        // Se propaga el instante original; no se fabrica un presupuesto nuevo.
        .header("X-Deadline-Epoch-Millis", Long.toString(deadline))
        .timeout(Duration.ofMillis(remaining - RESERVE_MILLIS))
        .GET().build();
    try {
      var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
      respond(exchange, response.statusCode(), response.body());
    } catch (Exception error) {
      respond(exchange, 504, "DEPENDENCIA_NO_COMPLETO");
    }
  }
  private static void respond(HttpExchange exchange, int status, String text) throws IOException {
    byte[] body = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status, body.length);
    try (var output = exchange.getResponseBody()) { output.write(body); }
  }
}
```

`m0-t3/src/ClienteDeadline.java`:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public final class ClienteDeadline {
  private ClienteDeadline() { }
  public static void main(String[] args) throws Exception {
    long budget = Long.parseLong(args[0]);
    // El presupuesto se convierte en deadline una sola vez, en el origen.
    long deadline = System.currentTimeMillis() + budget;
    var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:8082/cotizar"))
        .header("X-Deadline-Epoch-Millis", Long.toString(deadline)).GET().build();
    try (var client = HttpClient.newHttpClient()) {
      var response = client.send(request, HttpResponse.BodyHandlers.ofString());
      System.out.printf("HTTP_%d %s%n", response.statusCode(), response.body());
    }
  }
}
```

```bash
mkdir -p academia-labs/microservices/m0-t3/{src,out,evidence}
cp examples/professional-bridges/microservices/{DependenciaDeadline,GatewayDeadline,ClienteDeadline}.java academia-labs/microservices/m0-t3/src/
cd academia-labs/microservices/m0-t3
javac --release 27 -d out src/*.java
java -cp out DependenciaDeadline  # terminal 1
java -cp out GatewayDeadline      # terminal 2
java -cp out ClienteDeadline 1200 # terminal 3
java -cp out ClienteDeadline 250
```

**Resultado esperado — salida exacta del cliente:**

```text
HTTP_200 TARIFA=12000
HTTP_504 SIN_PRESUPUESTO_DEPENDENCIA
```

**Fallo deliberado:** en `GatewayDeadline.java`, reemplaza el header reenviado por `Long.toString(System.currentTimeMillis() + 1200)` y ejecuta el cliente con 250 ms → **Error esperado:** aparece `HTTP_200 TARIFA=12000` aunque el presupuesto original no alcanzaba → **Diagnóstico:** el gateway reinició el reloj y violó el compromiso extremo a extremo; restaura la propagación de `deadline`.

#### Paso 5 · Práctica guiada

1. **Reproducción:** ejecuta 1200 y 250 ms; conserva ambas salidas. Pista: el gateway no cambia el header.
2. **Variación:** usa 700 ms y predice el resultado antes de medir. Pista: considera trabajo y reserva, no sólo 400 ms.
3. **Diagnóstico:** omite el header con `curl`; confirma HTTP 400 y explica por qué no debe inventarse un presupuesto. Pista: diferencia contrato inválido de plazo vencido.
4. **Integración:** registra presupuesto inicial, restante al entrar en cada proceso y estado final en `evidence/tema-3.txt`. Pista: no registres datos sensibles.
5. **Diseño:** fija máximo aceptable de deadline externo y estrategia ante sesgo de reloj. Pista: un cliente no debe reservar recursos indefinidamente.

**Conexión con el proyecto integrador RutaFlow Distribuido:** usa el mismo contrato en la consulta de tarifas y conserva el reparto cliente/gateway/dependencia. Este tema decide cuándo no iniciar trabajo; el siguiente determinará qué hacer cuando el resultado de un efecto ya iniciado sea desconocido.

#### Paso 6 · Práctica independiente

Añade una segunda dependencia de 200 ms después de tarifas sin cambiar el deadline original. Diseña dos presupuestos iniciales: uno que complete ambos saltos y otro que obligue al gateway a omitir el segundo. Entrega salidas, tiempos restantes y una justificación de la reserva; no reinicies duraciones ni conviertas HTTP 504 en éxito vacío.

#### Paso 7 · Cierre

- [ ] Distingo presupuesto, timeout, deadline y tiempo restante.
- [ ] Propago exactamente el mismo instante límite entre procesos.
- [ ] Rechazo trabajo cuando el restante no cubre ejecución y reserva.
- [ ] Explico el límite de reloj, confianza y cancelación de efectos.
- [ ] Reproduzco el fallo de reiniciar el presupuesto y lo diagnostico.

Si fallas 2 o más puntos, vuelve al Paso 4. **Siguiente tema:** «Clasificar un resultado desconocido antes de reintentar» (referencia interna M0 T4). **Errores comunes:** renovar el deadline, confundir 504 con prueba de ausencia de efectos, aceptar plazos ilimitados y omitir margen. **Fuentes oficiales:** [gRPC deadlines](https://grpc.io/docs/guides/deadlines/) y [Java 27 `HttpRequest.timeout`](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html#timeout(java.time.Duration)).

### Tema 4: Clasificar un resultado desconocido antes de reintentar · Integración · 45 min

**Prerrequisito:** tema «Propagar un deadline absoluto entre servicios HTTP» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T3).

**Al finalizar podrás:** distinguir éxito, fallo y resultado desconocido; demostrar que un timeout puede ocultar un efecto confirmado; reconciliar mediante el mismo identificador y decidir si existe evidencia suficiente antes de reintentar.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**, `curl` y dos terminales. Crea una carpeta vacía `academia-labs/microservices/resultado-desconocido/{src,out,evidence}` y libera el puerto 8084. Debes comprender que un timeout describe lo observado por el cliente, no el estado final del servidor.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Repetir una operación cuyo resultado es desconocido puede duplicar cobros, reservas o envíos; no repetirla puede abandonar una intención válida.

RutaFlow confirma un envío y persiste `CONFIRMADO`, pero responde después de que el cliente abandona. El cliente no puede afirmar «falló»: sólo sabe que no recibió confirmación. El identificador `ENV-001` permite reconciliar mediante una lectura posterior. Este tema clasifica la incertidumbre; «Evitar efectos duplicados con una clave idempotente» enseñará después cómo proteger un reintento necesario.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación, límite y evidencia |
|---|---|---|
| Fallo parcial | Núcleo | Cliente y servidor terminan con observaciones distintas aunque sólo falle la comunicación |
| Punto de compromiso | Núcleo | Después del commit el efecto existe aunque la respuesta se pierda |
| Resultado desconocido | Núcleo | Es conocimiento insuficiente del cliente, no un estado del negocio |
| Identificador estable | Prerrequisito | Permite consultar la misma intención; un ID nuevo representa otra operación |
| Reconciliación | Diagnóstico | Una lectura posterior transforma incertidumbre en estado observable |
| Reintento | Variante | Sólo es seguro si no hubo efecto o existe protección contra duplicados |
| Réplica atrasada | Límite | Un 404 temporal puede no demostrar ausencia en sistemas eventualmente consistentes |

Un **fallo parcial** permite que una parte complete y otra pierda la evidencia. El **punto de compromiso** separa «sin efecto» de «efecto aceptado». Un **resultado desconocido** exige reconciliación, no una conclusión inventada. Analogía: entregas un paquete en recepción y se corta la llamada antes del comprobante; llevar otro paquete no aclara el primero, pero consultar el número de guía sí.

```text
cliente          servidor             estado
 POST ENV-001 ---> commit -----------> CONFIRMADO
 timeout <-------- respuesta tardía
 GET ENV-001 ------------------------> ENV-001 CONFIRMADO
```

#### Paso 4 · Demostración guiada desde cero

Crea `resultado-desconocido/src/ServidorResultadoDesconocido.java`. El archivo completo está en `examples/professional-bridges/microservices/ServidorResultadoDesconocido.java`; contiene un `ConcurrentHashMap`, confirma antes de dormir 900 ms y permite reconciliar por `GET`.

```java
// Fragmento causal del archivo completo: el efecto sucede antes de responder.
ENVIOS.put(id, "CONFIRMADO");
System.out.println("EFECTO_CONFIRMADO " + id);
Thread.sleep(900);
respond(exchange, 201, id + " CONFIRMADO");
```

```bash
mkdir -p academia-labs/microservices/resultado-desconocido/{src,out,evidence}
cp examples/professional-bridges/microservices/ServidorResultadoDesconocido.java academia-labs/microservices/resultado-desconocido/src/
cd academia-labs/microservices/resultado-desconocido
javac --release 27 -d out src/ServidorResultadoDesconocido.java
java -cp out ServidorResultadoDesconocido
# Segunda terminal:
curl --max-time 0.3 -X POST http://127.0.0.1:8084/envios/ENV-001
curl -sS http://127.0.0.1:8084/envios/ENV-001
```

**Resultado esperado:** `curl` termina con código 28; el servidor imprime `EFECTO_CONFIRMADO ENV-001`; la consulta imprime exactamente `ENV-001 CONFIRMADO`.

**Fallo deliberado:** interpreta el código 28 como ausencia y repite con `ENV-002` → **Error esperado:** aparecen efectos para `ENV-001` y `ENV-002` → **Diagnóstico:** cambiaste el identificador y creaste otra intención; primero reconcilia `ENV-001`.

#### Paso 5 · Práctica guiada

1. **Reproducción:** provoca el timeout y consulta `ENV-001`. Pista: mira primero el servidor.
2. **Variación:** usa timeout de 1.2 s y clasifica HTTP 201 como éxito confirmado.
3. **Diagnóstico:** consulta `ENV-999`; explica el 404 y el límite de una réplica atrasada.
4. **Integración:** registra ID, observación, estado reconciliado y decisión en `evidence/resultado.txt`.
5. **Diseño:** define `PENDING`, `SUCCEEDED`, `FAILED` y `UNKNOWN`; decide cuál requiere reconciliación.

**Conexión con el proyecto integrador RutaFlow Distribuido:** incorpora consulta por ID y bitácora de reconciliación. No automatices aún el reintento: el mapa se pierde al reiniciar y no protege concurrencia.

#### Paso 6 · Práctica independiente

Añade `fallar-antes`, que responde 503 sin escribir, y `fallar-despues`, que escribe y cierra sin responder. Entrega observación, estado real, clasificación y acción segura para ambos y para el camino exitoso.

#### Paso 7 · Cierre

- [ ] Distingo fallo confirmado de resultado desconocido.
- [ ] Identifico el punto de compromiso.
- [ ] Reconcilio usando el mismo identificador.
- [ ] No genero un ID nuevo para una operación incierta.
- [ ] Explico el límite de una réplica atrasada.

Si fallas 2 o más puntos, vuelve a la demostración. **Siguiente tema:** «Evitar efectos duplicados con una clave idempotente» (referencia interna M0 T5). **Errores comunes:** equiparar timeout con rollback y reconciliar otro ID. **Fuentes oficiales:** [Azure Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry) y [AWS Builders' Library — retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).

### Tema 5: Evitar efectos duplicados con una clave idempotente · Integración · 45 min

**Prerrequisito:** tema «Clasificar un resultado desconocido antes de reintentar» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T4).

**Al finalizar podrás:** asociar una clave estable con la huella y el resultado de una intención, devolver la respuesta original ante una repetición concurrente, rechazar la misma clave con otro payload y explicar qué almacenamiento, ámbito y vencimiento necesita una implementación durable.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**, `curl` y el puerto 8085. Crea `academia-labs/microservices/idempotencia/{src,out,evidence}` desde una carpeta vacía. Debes haber reproducido un resultado desconocido; una clave idempotente no elimina timeouts, sino que limita el efecto de repetir la misma intención.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Después de un resultado desconocido, RutaFlow necesita repetir una confirmación sin crear dos envíos. Deducir duplicados sólo por payload confunde intenciones legítimamente iguales; deducirlos sólo por una clave sin comparar payload permite reutilización accidental o maliciosa.

El cliente genera `OP-001` una vez y la conserva en todos los intentos. El servidor guarda clave, huella normalizada, estado HTTP y cuerpo. Una repetición idéntica recibe el resultado almacenado; la misma clave con otra huella recibe 409. El mapa de este laboratorio hace visible la operación atómica, pero se pierde al reiniciar y no coordina réplicas: producción necesita una restricción única y transacción durable.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación, límite y evidencia |
|---|---|---|
| Intención y clave | Núcleo | La clave identifica la operación de negocio, no cada intento de transporte |
| Huella canónica | Núcleo | Detecta reutilización con contenido distinto; exige normalización estable |
| Reserva atómica | Núcleo | Dos solicitudes concurrentes deben crear un solo registro y un solo efecto |
| Respuesta almacenada | Núcleo | La repetición devuelve estado y cuerpo originales, no vuelve a ejecutar |
| Estados de proceso | Variante | `PROCESSING/SUCCEEDED/FAILED` permiten recuperar trabajo huérfano |
| Ámbito y autorización | Seguridad | La clave debe ligarse a actor y operación para impedir lectura cruzada |
| TTL | Límite | Debe cubrir la ventana máxima de reintento sin conservar datos indefinidamente |
| Durabilidad | Profundización | Un mapa demuestra el algoritmo, pero reinicios y múltiples réplicas requieren base compartida |

La **idempotencia** hace que repetir una intención produzca un efecto equivalente a ejecutarla una vez. Analogía: el número de comprobante de una transferencia permite volver a pedir la confirmación; no autoriza cambiar monto y beneficiario conservando el número. `compute` reserva atómicamente dentro de este proceso, pero no sustituye `UNIQUE(actor_id, operation, key)` y una transacción en una base durable.

##### Identificar una intención y comprobar su huella

La clave nace en el cliente cuando nace la intención y se reutiliza en cada intento. El servidor calcula o recibe una huella canónica del método, recurso y payload relevante. Si la clave existe con otra huella, responde conflicto: reproducir el resultado anterior aplicaría una respuesta a datos diferentes.

##### Reservar y reproducir de forma atómica

La comprobación y la creación del registro forman una sola operación. `ConcurrentHashMap.compute` lo demuestra dentro de una JVM; una base usa una restricción única y transacción. Después del éxito se conserva código, headers relevantes y cuerpo para que el retry observe la misma decisión sin repetir el efecto.

##### Recuperar estados incompletos

Una caída puede dejar `PROCESSING` sin respuesta final. El registro necesita propietario, lease o versión, instante de actualización y una política que distinga recuperar de volver a ejecutar ciegamente. Si el efecto externo no es consultable ni idempotente, la recuperación requiere reconciliación manual.

##### Limitar ámbito, conservación y exposición

La clave se busca dentro del actor y operación autorizados; no es un secreto ni debe permitir consultar resultados de otro usuario. El TTL cubre el máximo de retries y reconciliación. Borrarla antes reabre duplicados; conservarla sin límite acumula datos y puede violar políticas de privacidad.

```text
OP-001 + huella A -> reservar -> efecto #1 -> guardar 201/cuerpo
OP-001 + huella A -> reproducir 201/cuerpo (sin efecto)
OP-001 + huella B -> 409 conflicto
```

#### Paso 4 · Demostración guiada desde cero

Crea `idempotencia/src/ServidorIdempotente.java` copiando `examples/professional-bridges/microservices/ServidorIdempotente.java`. Este es el archivo completo:

```java
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public final class ServidorIdempotente {
  record Record(String fingerprint, int status, String body) { }
  private static final ConcurrentHashMap<String,Record> RECORDS = new ConcurrentHashMap<>();
  private static final AtomicInteger EFFECTS = new AtomicInteger();
  private ServidorIdempotente() { }
  public static void main(String[] args) throws IOException {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1",8085),16);
    server.createContext("/envios", ServidorIdempotente::create);
    server.createContext("/metricas", e -> respond(e,200,"efectos=" + EFFECTS.get()));
    server.start();
    System.out.println("LISTEN http://127.0.0.1:8085");
  }
  private static void create(HttpExchange exchange) throws IOException {
    if (!exchange.getRequestMethod().equals("POST")) { respond(exchange,405,"METODO_NO_PERMITIDO"); return; }
    String key = exchange.getRequestHeaders().getFirst("Idempotency-Key");
    String fingerprint = exchange.getRequestHeaders().getFirst("X-Payload-Fingerprint");
    if (key == null || fingerprint == null) { respond(exchange,400,"CLAVE_Y_HUELLA_REQUERIDAS"); return; }
    var created = new boolean[1];
    Record record = RECORDS.compute(key, (ignored, existing) -> {
      if (existing != null) return existing;
      created[0] = true;
      int number = EFFECTS.incrementAndGet();
      return new Record(fingerprint,201,"ENVIO_CREADO numero=" + number);
    });
    if (!record.fingerprint().equals(fingerprint)) {
      respond(exchange,409,"CLAVE_REUTILIZADA_CON_OTRO_PAYLOAD");
      return;
    }
    exchange.getResponseHeaders().set("Idempotency-Replayed",Boolean.toString(!created[0]));
    respond(exchange,record.status(),record.body());
  }
  private static void respond(HttpExchange exchange,int status,String text) throws IOException {
    byte[] body = text.getBytes(StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(status,body.length);
    try (var output = exchange.getResponseBody()) { output.write(body); }
  }
}
```

```bash
mkdir -p academia-labs/microservices/idempotencia/{src,out,evidence}
cp examples/professional-bridges/microservices/ServidorIdempotente.java academia-labs/microservices/idempotencia/src/
cd academia-labs/microservices/idempotencia
javac --release 27 -d out src/ServidorIdempotente.java
java -cp out ServidorIdempotente
curl -i -X POST -H 'Idempotency-Key: OP-001' -H 'X-Payload-Fingerprint: ciudad=Bogota' http://127.0.0.1:8085/envios
curl -i -X POST -H 'Idempotency-Key: OP-001' -H 'X-Payload-Fingerprint: ciudad=Bogota' http://127.0.0.1:8085/envios
curl -i -X POST -H 'Idempotency-Key: OP-001' -H 'X-Payload-Fingerprint: ciudad=Cali' http://127.0.0.1:8085/envios
curl -sS http://127.0.0.1:8085/metricas
```

**Resultado esperado:** ambas respuestas válidas contienen `ENVIO_CREADO numero=1`; la segunda añade `Idempotency-Replayed: true`; el payload distinto devuelve HTTP 409 y `CLAVE_REUTILIZADA_CON_OTRO_PAYLOAD`; la métrica termina exactamente en `efectos=1`.

**Fallo deliberado:** cambia `compute` por `get` seguido de `put` y lanza dos solicitudes simultáneas → **Error esperado:** la métrica puede terminar en `efectos=2` → **Diagnóstico:** comprobar y escribir en pasos separados abre una carrera; restaura la reserva atómica y, en producción, una restricción única transaccional.

#### Paso 5 · Práctica guiada

1. **Reproducción:** repite `OP-001` con la misma huella y confirma `efectos=1`.
2. **Variación:** usa `OP-002`; predice `numero=2`. Pista: es otra intención.
3. **Diagnóstico:** omite la huella y explica el HTTP 400. Pista: la clave sola no detecta payload distinto.
4. **Integración:** ejecuta dos `curl` en paralelo y conserva headers, cuerpos y métrica en `evidence/idempotencia.txt`.
5. **Diseño:** propone tabla, restricción única, estados, TTL y ámbito por usuario; explica cómo recuperas `PROCESSING` huérfano.

**Conexión con el proyecto integrador RutaFlow Distribuido:** aplica la clave a `POST /envios`, conserva la respuesta original y añade una consulta de reconciliación. No uses este mapa en producción ni guardes secretos en la clave.

#### Paso 6 · Práctica independiente

Implementa `PROCESSING`, `SUCCEEDED` y `FAILED` con un fallo después de reservar pero antes de guardar la respuesta. Define quién puede recuperar el registro, cuándo, y cómo evitas que dos recuperadores ejecuten el efecto. Entrega pruebas para repetición idéntica, conflicto de huella y reserva huérfana.

#### Paso 7 · Cierre

- [ ] Distingo intención de intento HTTP.
- [ ] Comparo la huella antes de reproducir una respuesta.
- [ ] Reservo la clave de forma atómica.
- [ ] Devuelvo estado y cuerpo originales sin repetir el efecto.
- [ ] Defino ámbito, TTL, durabilidad y recuperación.

Si fallas 2 o más puntos, vuelve al Paso 4. **Siguiente tema:** «Preservar orden causal por agregado» (referencia interna M0 T6). **Errores comunes:** generar clave nueva en cada retry, aceptar otra huella, usar `get`+`put` y confiar en memoria local. **Fuentes oficiales:** [AWS Powertools — idempotency](https://docs.aws.amazon.com/powertools/java/latest/utilities/idempotency/) y [Azure Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry).

### Tema 6: Seleccionar un reloj según la evidencia temporal · Integración · 40 min

**Prerrequisito:** tema «Evitar efectos duplicados con una clave idempotente» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T5).

**Al finalizar podrás:** usar un reloj de pared para fechas auditables y uno monotónico para duraciones locales, explicar por qué ninguno establece por sí solo causalidad distribuida y diseñar pruebas con un `Clock` inyectable sin comparar valores `nanoTime` entre procesos.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**. Crea `academia-labs/microservices/relojes/{src,out,evidence}` desde una carpeta vacía. Debes distinguir «cuándo ocurrió según este host» de «cuánto tardó dentro de este proceso»; si aún usas un timeout como prueba de resultado, vuelve al tema «Clasificar un resultado desconocido antes de reintentar».

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un ajuste NTP, una zona horaria o dos hosts desincronizados pueden hacer que marcas de pared parezcan retroceder. Usarlas para medir duración o decidir el orden del negocio genera latencias negativas y sobrescrituras incorrectas.

RutaFlow necesita registrar la fecha de confirmación y medir cuánto tarda una consulta. `Instant` responde la primera pregunta y `System.nanoTime()` la segunda. La fecha se comparte, pero puede ajustarse; el contador monotónico no retrocede dentro del proceso, pero su origen es arbitrario y no puede enviarse a otro host. La causalidad se modelará en el tema siguiente mediante versión del agregado, no mediante «el timestamp más grande gana».

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación, límite y evidencia |
|---|---|---|
| Reloj de pared | Núcleo | `Instant` representa fecha UTC; ajustes y sesgo impiden usarlo como cronómetro infalible |
| Reloj monotónico | Núcleo | `nanoTime` mide intervalos locales; su origen no representa una fecha ni es portable |
| Zona y calendario | Variante | `ZonedDateTime` presenta reglas humanas; no sustituye `Instant` para intercambio |
| Clock inyectable | Prueba | Permite fijar y desplazar el tiempo sin dormir ni depender del reloj real |
| Precisión y exactitud | Límite | Más dígitos no significan un reloj mejor sincronizado |
| Causalidad | Decisión | Dos timestamps no prueban que un evento influyó en otro |

Analogía: el reloj de pared es la fecha escrita en un recibo; el cronómetro mide una carrera. Un cronómetro con «12345» no dice qué día es, y dos recibos de relojes distintos no prueban cuál acción causó la otra.

```text
fecha/auditoría -> Clock/Instant -> compartible, sujeto a sesgo
duración local  -> nanoTime      -> monotónico, origen privado
orden negocio   -> versión/causa -> no se deduce de los anteriores
```

#### Paso 4 · Demostración guiada desde cero

Crea `relojes/src/RelojesDistribuidos.java` copiando el archivo completo de `examples/professional-bridges/microservices/RelojesDistribuidos.java`:

```java
import java.time.*;
public final class RelojesDistribuidos {
  private RelojesDistribuidos() { }
  public static void main(String[] args) throws Exception {
    Clock pared = Clock.systemUTC();
    Instant inicioPared = pared.instant();
    long inicioMonotono = System.nanoTime();
    Thread.sleep(120);
    Instant finPared = pared.instant();
    long transcurridoMs = (System.nanoTime() - inicioMonotono) / 1_000_000;
    System.out.println("pared_ordenable=" + !finPared.isBefore(inicioPared));
    System.out.println("monotono_entre_100_y_500_ms=" + (transcurridoMs >= 100 && transcurridoMs <= 500));
    System.out.println("nanoTime_no_es_fecha=true");
  }
}
```

```bash
mkdir -p academia-labs/microservices/relojes/{src,out,evidence}
cp examples/professional-bridges/microservices/RelojesDistribuidos.java academia-labs/microservices/relojes/src/
cd academia-labs/microservices/relojes
javac --release 27 -d out src/RelojesDistribuidos.java
java -cp out RelojesDistribuidos
```

**Resultado esperado:** tres líneas terminan en `true`. **Fallo deliberado:** convierte `System.nanoTime()` a `Instant.ofEpochMilli(...)` → **Error esperado:** obtienes una fecha sin significado real → **Diagnóstico:** el origen de `nanoTime` es arbitrario; sólo las diferencias dentro de la misma JVM son válidas.

#### Paso 5 · Práctica guiada

1. **Reproducción:** ejecuta y explica las tres afirmaciones. Pista: no compares el valor absoluto de `nanoTime`.
2. **Variación:** usa `Clock.fixed` para una fecha repetible sin cambiar el cronómetro.
3. **Diagnóstico:** registra inicio con `currentTimeMillis` y fin con `nanoTime`; explica por qué la resta no tiene unidad común.
4. **Integración:** guarda fecha UTC y duración local de una cotización en `evidence/relojes.txt`.
5. **Diseño:** elige tipo de reloj para auditoría, TTL, timeout y orden de estados; justifica cada elección.

**Conexión con el proyecto integrador RutaFlow Distribuido:** registra `occurredAt` como fecha de observabilidad y duración monotónica como métrica; no uses ninguno como versión del envío.

#### Paso 6 · Práctica independiente

Crea una política de vencimiento que reciba `Clock` y expire una reserva tras 30 minutos. Pruébala con `Clock.fixed` y `Clock.offset`, sin `sleep`. Explica por qué esa prueba no valida sincronización entre hosts.

#### Paso 7 · Cierre

- [ ] Uso `Instant` para fecha y `nanoTime` para duración local.
- [ ] No convierto el valor absoluto de `nanoTime` en fecha.
- [ ] Inyecto `Clock` para probar políticas temporales.
- [ ] Distingo precisión, exactitud y sincronización.
- [ ] No deduzco causalidad sólo por timestamps.

Si fallas 2 o más puntos, vuelve al Paso 4. **Siguiente tema:** «Preservar el orden de eventos por versión del agregado» (referencia interna M0 T7). **Errores comunes:** medir duración con pared, comparar `nanoTime` entre JVM y ordenar negocio por fecha. **Fuentes oficiales:** [Java 27 `Clock`](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/time/Clock.html) y [`System.nanoTime`](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/lang/System.html#nanoTime()).

### Tema 7: Preservar el orden de eventos por versión del agregado · Integración · 45 min

**Prerrequisito:** tema «Seleccionar un reloj según la evidencia temporal» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T6).

**Al finalizar podrás:** clasificar un evento como aplicable, duplicado/obsoleto o hueco mediante ID y versión del agregado; impedir que una llegada tardía sobrescriba estado nuevo y decidir cuándo reconciliar, aparcar o rechazar.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1** y una proyección en memoria. Crea `academia-labs/microservices/orden-agregado/{src,out,evidence}`. Debes saber que timestamps describen relojes y que una versión expresa la secuencia aceptada por el dominio.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Brokers, retries y redes pueden entregar duplicados o eventos fuera de orden. Aplicar «lo último que llegó» puede devolver un envío de `ENTREGADO` a `EN_RUTA`.

RutaFlow necesita orden por envío, no un orden global de toda la empresa. Cada evento lleva `aggregateId` y `aggregateVersion`. La proyección acepta exactamente la versión siguiente, ignora versiones ya aplicadas y detecta huecos. La llegada de versión 3 antes de versión 2 no autoriza aplicar 3 ni descartar 2; exige buffer acotado, relectura o cuarentena según el contrato.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación, límite y evidencia |
|---|---|---|
| Agregado | Prerrequisito | Define la unidad cuya invariante necesita secuencia propia |
| Versión | Núcleo | Aumenta al aceptar una transición; no es timestamp ni offset del broker |
| Duplicado/obsoleto | Diagnóstico | Versión menor o igual ya no debe cambiar la proyección |
| Hueco | Diagnóstico | Versión mayor que la siguiente señala evento faltante |
| Concurrencia de escritores | Límite | Dos escritores pueden proponer la misma versión; la escritura necesita compare-and-set |
| Buffer/cuarentena | Variante | Retiene temporalmente o aparta huecos con límite, alerta y reconciliación |

Analogía: cada envío tiene páginas numeradas. Recibir la página 3 después de la 1 revela que falta la 2; la fecha impresa no repara el libro. El orden global tampoco es necesario: las páginas de otro envío forman otro libro.

```text
ENV-1 v1 -> APLICADO
ENV-1 v3 -> HUECO, esperaba v2
ENV-1 v2 -> APLICADO
ENV-1 v2 -> OBSOLETO_O_DUPLICADO
```

#### Paso 4 · Demostración guiada desde cero

Crea `orden-agregado/src/ProyeccionOrden.java` copiando el archivo completo desde `examples/professional-bridges/microservices/ProyeccionOrden.java`.

```java
import java.util.HashMap;
import java.util.List;
public final class ProyeccionOrden {
  record Evento(String id, long version) { }
  private ProyeccionOrden() { }
  public static void main(String[] args) {
    var ultima = new HashMap<String,Long>();
    var eventos = List.of(new Evento("ENV-1",1),new Evento("ENV-1",3),
        new Evento("ENV-1",2),new Evento("ENV-1",2),new Evento("ENV-2",1));
    for (var evento : eventos) {
      long actual = ultima.getOrDefault(evento.id(),0L);
      String resultado;
      if (evento.version() == actual + 1) {
        ultima.put(evento.id(),evento.version());
        resultado = "APLICADO";
      } else if (evento.version() <= actual) {
        resultado = "OBSOLETO_O_DUPLICADO";
      } else {
        resultado = "HUECO_ESPERABA_v" + (actual + 1);
      }
      System.out.printf("%s %s:v%d%n",resultado,evento.id(),evento.version());
    }
  }
}
```

```bash
mkdir -p academia-labs/microservices/orden-agregado/{src,out,evidence}
cp examples/professional-bridges/microservices/ProyeccionOrden.java academia-labs/microservices/orden-agregado/src/
cd academia-labs/microservices/orden-agregado
javac --release 27 -d out src/ProyeccionOrden.java
java -cp out ProyeccionOrden
```

**Resultado esperado:** `APLICADO ENV-1:v1`, `HUECO_ESPERABA_v2 ENV-1:v3`, `APLICADO ENV-1:v2`, `OBSOLETO_O_DUPLICADO ENV-1:v2` y `APLICADO ENV-2:v1`.

**Fallo deliberado:** aplica siempre el evento con timestamp mayor → **Error esperado:** una versión 3 puede ocultar el hueco y una versión 2 tardía puede sobrescribirla → **Diagnóstico:** la fecha no representa la secuencia del agregado; restaura `version == actual + 1`.

#### Paso 5 · Práctica guiada

1. **Reproducción:** ejecuta la secuencia y explica cada clasificación. Pista: conserva `actual` por ID.
2. **Variación:** agrega `ENV-2:v3`; confirma que el hueco es independiente de ENV-1. Pista: no existe versión global.
3. **Diagnóstico:** procesa dos veces v1 y distingue duplicado exacto de evento obsoleto con distinto `eventId`. Pista: versión y evento responden preguntas distintas.
4. **Integración:** registra esperado, recibido y decisión en `evidence/orden.txt`. Pista: incluye agregado y correlation ID.
5. **Diseño:** fija tamaño/tiempo del buffer, alerta y procedimiento de reconciliación. Pista: una cuarentena sin responsable no resuelve el hueco.

**Conexión con el proyecto integrador RutaFlow Distribuido:** añade versión a eventos de envío y compare-and-set al escritor; no uses offset del broker como versión del dominio.

#### Paso 6 · Práctica independiente

Implementa un buffer acotado que reciba v1, v3 y v2, aplique v1, espere v2 y luego drene v2/v3. Cuando falte una versión más de cinco eventos, envía el agregado a cuarentena con razón verificable.

#### Paso 7 · Cierre

- [ ] Ordeno por agregado, no globalmente.
- [ ] Aplico sólo la versión siguiente.
- [ ] Distingo duplicado, obsoleto y hueco.
- [ ] Limito buffer y defino reconciliación.
- [ ] Protejo escritores con compare-and-set.

Si fallas 2 o más puntos, repite la secuencia. **Siguiente tema:** «Evolucionar contratos serializados sin romper consumidores» (referencia interna M0 T8). **Errores comunes:** ordenar por timestamp, usar offset como versión y acumular huecos sin límite. **Fuentes oficiales:** [Azure Sequential Convoy](https://learn.microsoft.com/en-us/azure/architecture/patterns/sequential-convoy) y [OpenTelemetry Context](https://opentelemetry.io/docs/specs/otel/context/).

### Tema 8: Serialización, evolución y falacias distribuidas · Experto · 100 min

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
