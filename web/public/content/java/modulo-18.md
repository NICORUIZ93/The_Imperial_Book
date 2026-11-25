# Módulo 18: HTTP, seguridad y backend con Java

Un backend Java no solo “hace peticiones HTTP”. Llama servicios que pueden responder tarde, fallar, devolver 401/403, redirigir o entregar datos malformados. Debajo de `HttpClient` hay sockets TCP, y encima hay credenciales que deben validarse sin loguearse. Sin timeout la app se queda colgada; sin control de redirects un token puede viajar a otro host; sin reintento acotado un 503 transitorio se convierte en error de negocio.

Aquí construirás `tienda-aurora-java-m18`: cliente con `HttpClient`, flujo JWT HS256 firmado con JCA, endpoint con roles que devuelve 403, redirect sin seguir, reintento acotado, sockets TCP/UDP y primitivas `SHA-256`, `HMAC` y `AES-GCM`. Todo se ejecuta contra un `HttpServer` local: no hay dependencias nuevas ni servicios externos.

## Apertura del módulo

Al terminar este módulo podrás:
- llamar a un servicio HTTP con `HttpClient`, con timeouts, mapeo explícito de códigos de estado y política de redirección;
- reintentar solo operaciones idempotentes, con un límite y una espera creciente;
- emitir y validar un JWT HS256 y distinguir `401` de `403`;
- elegir entre SHA-256, HMAC-SHA256 y AES-GCM de la JCA según lo que necesites proteger;
- probar todo contra un `HttpServer` local, sin red externa ni dependencias.

**Esquema del módulo:** cliente HTTP, fallos y sockets (Tema 1); tokens, validación y roles (Tema 2); primitivas
criptográficas de la JCA (Tema 3). El borde ejecutable `App.java`, las pruebas y la verificación real van después de
los temas.

**Qué necesitas saber antes:** *HTTP*, *petición*, *respuesta*, *código de estado*, *cabecera*, *JSON* e
*idempotencia* (Fundamentos, Módulo 3, Tema 2); *puerto* y *localhost* (Fundamentos, Módulo 3, Tema 1);
*autenticación*, *autorización* y *hash criptográfico* (Seguridad, Módulo 0, Tema 2); *HMAC*, *cifrado simétrico* y
*TLS* (Seguridad, Módulo 0, Tema 3); excepciones y try-with-resources (Java, Módulo 3); `CompletableFuture` y timeouts
(Java, Módulo 5, Temas 2 y 7); `record` (Java, Módulo 1, Tema 5); Gradle (Java, Módulo 8).

**Entorno de las salidas.** Las salidas del proyecto se capturaron el 2026-11-23 en macOS arm64 con JDK 27.0.1.0.2,
toolchain Java 25 y Gradle 9.9.1 (sección «Verificación real»). Los programas de un solo archivo de los temas se
ejecutaron el 2026-11-24 con OpenJDK 25.0.5.1 en Linux x86_64 (`java Archivo.java`); con ese mismo JDK se recompiló el
proyecto y `App` reprodujo la misma salida.


## Visual del módulo

**Visual (animdiagram, animado con fallback estático; fuente `visuals/temas/java/modulo-18-httpclient.html`; regeneración: editar el HTML/SVG en esa ruta):** [HttpClient: petición, timeout y respuesta](/visuals/temas/java/modulo-18-httpclient.html)

Lectura: la app envía request con timeout; el servicio puede responder 200, error o agotar el tiempo. La animación solo resalta ida/vuelta y se desactiva con reduced motion.

## Prerrequisitos y bootstrap

```bash
java -version
gradle --version
mkdir -p tienda-aurora-java-m18/src/main/java/com/aurora/httpsec
mkdir -p tienda-aurora-java-m18/src/test/java/com/aurora/httpsec
cd tienda-aurora-java-m18
gradle wrapper --gradle-version 9.9.1
```

Estructura:

```text
tienda-aurora-java-m18/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/httpsec/
    │   ├── ApiCliente.java
    │   ├── ApiException.java
    │   ├── App.java
    │   ├── CryptoUtil.java
    │   ├── ServidorLocal.java
    │   ├── SocketsDemo.java
    │   └── TokenService.java
    └── test/java/com/aurora/httpsec/
        └── HttpSecTest.java
```

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m18"
```

#### `build.gradle.kts`

Solo JDK estándar + JUnit 5. Ni `HttpClient`, ni JCA, ni JWT necesitan dependencias externas.

```kotlin
plugins { java; application }
group = "com.aurora"; version = "1.0.0"
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
repositories { mavenCentral() }
dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
application { mainClass = "com.aurora.httpsec.App" }
tasks.test { useJUnitPlatform(); testLogging { events("passed","skipped","failed") } }
tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

### Tema 1: HttpClient, REST, timeouts y fallos · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- levantar un `HttpServer` local con handlers y llamarlo con `HttpClient`;
- poner un timeout de conexión y otro de petición, y leer la `HttpTimeoutException` que producen;
- convertir cada código de estado en una decisión explícita (200, 401, 403, 404, 503);
- decidir la política de redirección y reintentar solo un `GET` idempotente con backoff acotado.

**Conceptos clave:** `HttpClient`, `HttpRequest`, `HttpResponse`, `HttpServer`, handler, REST, redirección, reintento con backoff, socket

Ya los conoces y no se repiten: *HTTP*, *petición*, *método HTTP*, *cabecera*, *cuerpo*, *respuesta*, *código de
estado*, *JSON*, *API* e *idempotencia* (Fundamentos, Módulo 3, Tema 2); *puerto* y *localhost* (Fundamentos, Módulo 3,
Tema 1); *timeout* e `InterruptedException` (Java, Módulo 5, Tema 7); `CompletableFuture` (Java, Módulo 5, Tema 2);
try-with-resources (Java, Módulo 3, Tema 2); excepción personalizada y `serialVersionUID` (Java, Módulo 3, Tema 3).

#### El problema
Tienda Aurora consulta el estado de una guía en el servicio de un transportador. A veces responde en milisegundos;
a veces tarda minutos, devuelve `503` o redirige a otra dirección. Hoy el código hace la llamada y usa el cuerpo sin
mirar nada más. ¿Cómo llamas a un servicio HTTP desde Java sin quedarte colgado ni tratar un error como éxito?

#### Glosario del tema

**`HttpClient`**
- **Definición técnica:** clase de `java.net.http` (estándar desde Java 11) que envía peticiones HTTP/1.1 y HTTP/2; se configura una vez con un builder (timeout de conexión, redirecciones, versión) y se reutiliza.
- **En palabras sencillas:** el teléfono de la aplicación para hablar con otros servidores; lo configuras una vez y haces muchas llamadas.
- **Dónde se rompe la comparación:** un teléfono no decide nada; `HttpClient` puede seguir redirecciones solo o abandonar la conexión por timeout.
- **Ejemplo:** `HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()` en `ClienteGuias.java`.
- **Error típico:** crear un `HttpClient` nuevo en cada llamada: pierdes la reutilización de conexiones y multiplicas hilos internos.

**`HttpRequest`**
- **Definición técnica:** objeto inmutable que describe una petición: URI, método, cabeceras, cuerpo (`BodyPublisher`) y timeout propio.
- **En palabras sencillas:** el formulario lleno que entregas en ventanilla: a dónde va, qué pides y cuánto esperas.
- **Dónde se rompe la comparación:** un formulario se entrega una vez; el mismo `HttpRequest` se puede reenviar en un reintento.
- **Ejemplo:** `HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(1)).header("Accept", "application/json").GET().build()`.
- **Error típico:** olvidar `.timeout(...)`: sin él, la espera de la respuesta no tiene límite propio.

**`HttpResponse`**
- **Definición técnica:** resultado de `send`: código de estado, cabeceras y cuerpo, convertido por un `BodyHandler` (`ofString`, `discarding`, `ofInputStream`).
- **En palabras sencillas:** la respuesta de ventanilla: un número que dice cómo te fue y, a veces, un papel con datos.
- **Dónde se rompe la comparación:** que llegue una respuesta no significa éxito; un `404` también es una `HttpResponse`.
- **Ejemplo:** `res.statusCode()` devuelve `404` y `res.body()` devuelve `no encontrada` para `/guias/G9`.
- **Error típico:** usar `res.body()` sin mirar `statusCode()`: el texto de error termina tratado como dato.

**`HttpServer`**
- **Definición técnica:** servidor HTTP mínimo incluido en el JDK (`com.sun.net.httpserver`, módulo `jdk.httpserver`); asocia rutas («contextos») a handlers y escucha en una dirección y un puerto.
- **En palabras sencillas:** una ventanilla de prueba que montas en tu propio equipo para tener a quién llamar.
- **Dónde se rompe la comparación:** no es un servidor de producción como Tomcat o Netty: no trae seguridad, pools afinados ni métricas.
- **Ejemplo:** `HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0)`; el puerto `0` pide al sistema uno libre.
- **Error típico:** escuchar en `0.0.0.0` para una prueba: expones el servidor a toda la red en vez de solo a tu equipo.

**handler**
- **Definición técnica:** implementación de `HttpHandler` (un método `handle(HttpExchange)`) que lee la petición y escribe la respuesta con `sendResponseHeaders` y `getResponseBody`.
- **En palabras sencillas:** la persona detrás de la ventanilla que atiende un tipo concreto de trámite.
- **Dónde se rompe la comparación:** la persona siempre responde; si el handler olvida `sendResponseHeaders`, el cliente espera hasta su timeout.
- **Ejemplo:** `server.createContext("/guias/G9", ex -> responder(ex, 404, "no encontrada"))`.
- **Error típico:** no cerrar el cuerpo de la respuesta (`try-with-resources` sobre `getResponseBody()`): la conexión queda abierta.

**REST**
- **Definición técnica:** estilo de diseño de APIs sobre HTTP: recursos con URI propia (`/guias/G1`), métodos con significado (`GET` lee, `POST` crea) y códigos de estado estándar.
- **En palabras sencillas:** una forma ordenada de nombrar las cosas y las acciones para que cualquier cliente adivine cómo pedirlas.
- **Dónde se rompe la comparación:** no es un protocolo ni una librería; es una convención, y cada API la cumple a su manera.
- **Ejemplo:** `GET /guias/G1` devuelve la guía; `GET /guias/G9` devuelve `404` porque ese recurso no existe.
- **Error típico:** responder siempre `200` con `{"error": ...}` en el cuerpo: el cliente no puede decidir por el código de estado.

**redirección**
- **Definición técnica:** respuesta `3xx` (por ejemplo `302`) con la cabecera `Location`; `HttpClient.Redirect` decide si el cliente la sigue (`NEVER`, `NORMAL`, `ALWAYS`).
- **En palabras sencillas:** la ventanilla te dice «esto se atiende en otra oficina» y te da la dirección.
- **Dónde se rompe la comparación:** si el cliente la sigue solo, tú no ves a qué oficina fue ni qué papeles llevó.
- **Ejemplo:** con `NEVER`, `RedirectReintento.java` imprime `status=302` y la `Location`; con `ALWAYS`, llega `200` del otro servidor.
- **Error típico:** seguir redirecciones con credenciales en cabeceras propias (`X-Api-Key`): viajan al otro origen, como muestra la salida.

**reintento con backoff**
- **Definición técnica:** repetir una petición fallida un número máximo de veces, esperando un tiempo creciente entre intentos; solo es seguro en operaciones idempotentes.
- **En palabras sencillas:** si la línea está ocupada, vuelves a marcar, cada vez esperando un poco más, y te rindes al tercer intento.
- **Dónde se rompe la comparación:** volver a marcar no tiene efectos; reenviar un `POST` de cobro puede cobrar dos veces.
- **Ejemplo:** `/falla` responde `503`, `503` y `200`; el bucle espera 10 ms y 20 ms y termina con `llamadas al servidor=3`.
- **Error típico:** reintentar sin límite o sin espera: conviertes una caída breve del servidor en una avalancha de peticiones.

**socket**
- **Definición técnica:** extremo de una comunicación de red identificado por dirección y puerto; en Java, `Socket`/`ServerSocket` usan TCP (flujo ordenado con conexión) y `DatagramSocket` usa UDP (datagramas sueltos sin conexión).
- **En palabras sencillas:** TCP es una llamada telefónica: primero se conecta y luego todo llega en orden; UDP son postales sueltas.
- **Dónde se rompe la comparación:** las postales se pierden a la vista; un datagrama UDP perdido desaparece sin aviso al emisor.
- **Ejemplo:** `SocketsDemo.demo()` (Paso 3) imprime `TCP=p->P/server=P,UDP=q`.
- **Error típico:** creer que HTTP es «otra cosa»: el `HttpClient` del JDK 25 viaja sobre TCP, y un servidor caído aparece como `ConnectException`.

#### ► CÓMO FUNCIONA
`java.net.http.HttpClient` es el cliente HTTP estándar desde Java 11. Resuelve HTTP/1.1, HTTP/2, timeouts, headers y body handlers síncronos/asíncronos sin añadir dependencias. El error más caro es no definir límites: un cliente sin timeout bloquea un hilo indefinidamente; un cliente que no interpreta status convierte un 401 o un 503 en un bug silencioso; un cliente que sigue redirects automáticos puede enviar credenciales a otro host.

El diseño mínimo sano tiene cinco piezas: timeout de conexión y de request, validación de entrada, mapeo explícito de status, política de redirect y reintento solo para operaciones idempotentes.

**Mecanismo.** `send` abre (o reutiliza) una conexión TCP dentro del `connectTimeout`. Después espera la respuesta
dentro del `timeout` de la petición. Si se pasa, lanza `HttpTimeoutException`. Con la respuesta en mano, tu código
decide por el código de estado, no por el cuerpo.

```mermaid
flowchart LR
  V["validar id<br/>(allowlist)"] --> C["conectar<br/>connectTimeout"]
  C --> E["esperar respuesta<br/>request.timeout"]
  E -->|"se pasa"| T["HttpTimeoutException"]
  E --> S{"código de estado"}
  S -->|"200"| OK["usar cuerpo"]
  S -->|"401 / 403 / 404"| X["ApiException"]
  S -->|"503 y GET"| R["esperar 10·i ms<br/>y reintentar"]
  S -->|"302"| L["leer Location<br/>sin seguir"]
  R --> E
```

**Por qué existe.** Un servicio remoto falla de formas que tu código no controla. Sin límites, un fallo ajeno se
convierte en un hilo bloqueado tuyo. El mapeo explícito hace que cada fallo tenga un nombre y una decisión.

**Implicación.** Necesitas un servidor que falle a voluntad para probar el cliente. El JDK trae `HttpServer`, así que
todo el módulo se prueba en `127.0.0.1` sin red externa ni dependencias.

#### Problema resuelto 1.1
Consulta tres rutas de un servidor local: una guía que existe, una que no existe y una ruta que tarda 3 segundos.
El cliente debe esperar como máximo 1 segundo por respuesta.

**Razonamiento:**
1. Un `HttpServer` con tres handlers simula los tres comportamientos; el puerto `0` evita choques.
2. El `HttpClient` lleva `connectTimeout`; cada `HttpRequest` lleva su propio `timeout` de 1 segundo.
3. Un `switch` sobre `statusCode()` decide qué hacer; el timeout se captura como `HttpTimeoutException`.

```java
// ClienteGuias.java — HttpServer local + HttpClient con timeout y mapeo de status
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class ClienteGuias {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/guias/G1", ex -> responder(ex, 200, "{\"id\":\"G1\",\"estado\":\"ENTREGADA\"}"));
        server.createContext("/guias/G9", ex -> responder(ex, 404, "no encontrada"));
        server.createContext("/lento", ex -> {
            try { Thread.sleep(3000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            responder(ex, 200, "tarde");
        });
        server.start();
        URI base = URI.create("http://127.0.0.1:" + server.getAddress().getPort());

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
        for (String ruta : new String[] {"/guias/G1", "/guias/G9", "/lento"}) {
            HttpRequest req = HttpRequest.newBuilder(base.resolve(ruta))
                    .timeout(Duration.ofSeconds(1))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            try {
                HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
                String resultado = switch (res.statusCode()) {
                    case 200 -> "OK " + res.body();
                    case 404 -> "NO EXISTE " + ruta;
                    default -> "ERROR " + res.statusCode();
                };
                System.out.println(ruta + " -> " + res.statusCode() + " " + resultado);
            } catch (HttpTimeoutException e) {
                System.out.println(ruta + " -> " + e);
            }
        }
        server.stop(0);
    }

    static void responder(HttpExchange ex, int status, String cuerpo) throws IOException {
        byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }
}
```

```text
$ java ClienteGuias.java
/guias/G1 -> 200 OK {"id":"G1","estado":"ENTREGADA"}
/guias/G9 -> 404 NO EXISTE /guias/G9
/lento -> java.net.http.HttpTimeoutException: request timed out
```

**Explicación por partes.**
- Líneas 17–24: el servidor registra tres contextos. `/lento` duerme 3 segundos antes de responder.
- Líneas 27–29: el cliente se crea una vez, con 2 segundos para conectar.
- Líneas 31–35: cada petición pide JSON y espera como máximo 1 segundo.
- Líneas 38–42: el código de estado decide el resultado; el `404` no se confunde con un dato.
- Líneas 44–45: `/lento` no responde a tiempo y `send` lanza `HttpTimeoutException: request timed out`.

#### Problema resuelto 1.2
Una ruta responde `302` hacia otro servidor y otra responde `503` dos veces antes de funcionar. Observa qué hace cada
política de redirección con las credenciales y reintenta el `GET` con un máximo de tres intentos.

**Razonamiento:**
1. Un segundo servidor en otro puerto es otro origen; imprime las credenciales que le lleguen.
2. Se envía la misma petición con `Redirect.NEVER` y con `Redirect.ALWAYS`, con `Authorization` y `X-Api-Key`.
3. El reintento solo aplica a `503` en un `GET`, con espera creciente y un límite fijo.

```java
// RedirectReintento.java — política de redirect y reintento acotado de un GET ante 503
import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

public class RedirectReintento {
    public static void main(String[] args) throws Exception {
        // Servidor "ajeno" (otro puerto = otro origen): imprime las credenciales que le llegan
        HttpServer ajeno = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        ajeno.createContext("/", ex -> {
            String auth = ex.getRequestHeaders().getFirst("Authorization");
            String clave = ex.getRequestHeaders().getFirst("X-Api-Key");
            System.out.println("  [ajeno] recibió Authorization=" + auth + " X-Api-Key=" + clave);
            ex.sendResponseHeaders(200, -1);
            ex.close();
        });
        ajeno.start();

        HttpServer api = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        api.createContext("/redirect", ex -> {
            ex.getResponseHeaders().add("Location", "http://127.0.0.1:" + ajeno.getAddress().getPort() + "/robar");
            ex.sendResponseHeaders(302, -1);
            ex.close();
        });
        AtomicInteger llamadas = new AtomicInteger();
        api.createContext("/falla", ex -> {
            int n = llamadas.incrementAndGet();
            byte[] cuerpo = (n <= 2 ? "temporal" : "{\"ok\":true}").getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(n <= 2 ? 503 : 200, cuerpo.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(cuerpo); }
        });
        api.start();
        URI base = URI.create("http://127.0.0.1:" + api.getAddress().getPort());

        for (HttpClient.Redirect politica : new HttpClient.Redirect[] {HttpClient.Redirect.NEVER, HttpClient.Redirect.ALWAYS}) {
            HttpClient client = HttpClient.newBuilder().followRedirects(politica).build();
            HttpRequest req = HttpRequest.newBuilder(base.resolve("/redirect"))
                    .header("Authorization", "Bearer secreto-123")
                    .header("X-Api-Key", "clave-456").GET().build();
            HttpResponse<Void> res = client.send(req, HttpResponse.BodyHandlers.discarding());
            System.out.println(politica + " -> status=" + res.statusCode()
                    + " location=" + res.headers().firstValue("Location").orElse("-"));
        }

        HttpClient client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
        HttpRequest get = HttpRequest.newBuilder(base.resolve("/falla")).timeout(Duration.ofSeconds(2)).GET().build();
        int maxIntentos = 3;
        for (int intento = 1; intento <= maxIntentos; intento++) {
            HttpResponse<String> res = client.send(get, HttpResponse.BodyHandlers.ofString());
            System.out.println("intento " + intento + " -> " + res.statusCode() + " " + res.body());
            if (res.statusCode() != 503) break;
            if (intento < maxIntentos) Thread.sleep(10L * intento);   // backoff: 10 ms, 20 ms
        }
        System.out.println("llamadas al servidor=" + llamadas.get());
        api.stop(0);
        ajeno.stop(0);
    }
}
```

```text
$ java RedirectReintento.java
NEVER -> status=302 location=http://127.0.0.1:38077/robar
  [ajeno] recibió Authorization=null X-Api-Key=clave-456
ALWAYS -> status=200 location=-
intento 1 -> 503 temporal
intento 2 -> 503 temporal
intento 3 -> 200 {"ok":true}
llamadas al servidor=3
```

**Explicación por partes.**
- Líneas 26–31: `/redirect` responde `302` con una `Location` absoluta hacia el servidor ajeno.
- Líneas 42–50: con `NEVER`, el cliente devuelve el `302` y puedes revisar el destino. Con `ALWAYS`, lo sigue y recibe `200`.
- Segunda línea de la salida: el JDK 25 no reenvió `Authorization` al otro origen, pero **sí** reenvió `X-Api-Key`.
- Líneas 54–60: tres intentos como máximo; espera 10 ms y 20 ms entre ellos. El servidor recibió exactamente 3 llamadas.
- El puerto de la `Location` cambia en cada ejecución porque lo asigna el sistema.

> **Error común.** Llamar sin timeout de petición y suponer que «si falla, lanza error». Con `.timeout(...)`, una
> respuesta lenta termina con `java.net.http.HttpTimeoutException: request timed out`; sin él, el hilo espera. Si nadie
> escucha en el puerto, el mensaje ni siquiera trae texto:

```java
// SinServidor.java — llamar a un puerto donde nadie escucha
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class SinServidor {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
        HttpRequest req = HttpRequest.newBuilder(URI.create("http://127.0.0.1:9/guias/G1")).GET().build();
        client.send(req, HttpResponse.BodyHandlers.ofString());
    }
}
```

```text
$ java SinServidor.java
Exception in thread "main" java.net.ConnectException
	at java.net.http/jdk.internal.net.http.HttpClientImpl.send(HttpClientImpl.java:923)
	at java.net.http/jdk.internal.net.http.HttpClientFacade.send(HttpClientFacade.java:133)
	at SinServidor.main(SinServidor.java:12)
Caused by: java.net.ConnectException
```

> Lee la causa (`Caused by`), no solo el mensaje vacío: `ConnectException` significa que no hubo conexión TCP.
> Revisa host, puerto y que el servidor esté arriba antes de revisar tu lógica.

> **Buena práctica.** Crea un `HttpClient` por servicio remoto y reutilízalo. Pon `connectTimeout` en el cliente y
> `timeout` en cada petición: el primero acota la conexión; el segundo, la espera de la respuesta.

> **Prevenir errores.** Con `Redirect.NEVER`, tu código decide a dónde va cada credencial. La salida del Problema
> resuelto 1.2 muestra que el filtro del JDK protege `Authorization`, pero no las cabeceras propias como `X-Api-Key`.

#### Checkpoint 1.1
En `ClienteGuias.java` cambias el timeout de la petición a 5 segundos. ¿Qué imprime la línea de `/lento`?

Respuesta: `/lento -> 200 OK tarde`. El handler responde a los 3 segundos, antes de que se cumpla el límite de 5.

#### Checkpoint 1.2
¿Por qué el bucle de reintento no reintenta un `404`?

Respuesta: porque `404` no es transitorio: el recurso no existe y repetir la petición dará lo mismo. Solo `503` (y
fallos de red) justifican esperar y repetir un `GET`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea `ApiException.java`
En `tienda-aurora-java-m18`, la excepción lleva el código de estado para que quien llama decida por número:

```java
package com.aurora.httpsec;
public class ApiException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final int status;
    public ApiException(int status, String message) { super(message); this.status = status; }
    public int status() { return status; }
}
```

#### Paso 2 · Crea `ApiCliente.java`
El cliente del proyecto junta las cinco piezas del diseño: timeouts, validación, status, redirect y reintento.

```java
package com.aurora.httpsec;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** Cliente HTTP con timeout, validación, status explícito, sin redirects y reintento acotado. */
public class ApiCliente {
    public record Respuesta(int status, String location) {}

    private final HttpClient client;
    private final URI base;

    public ApiCliente(URI base) {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        this.base = base;
    }

    public String login(String usuario, String clave) throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder(base.resolve("/login"))
                .timeout(Duration.ofSeconds(2))
                .header("Content-Type", "text/plain; charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(usuario + ":" + clave))
                .build();
        return interpretar(client.send(req, HttpResponse.BodyHandlers.ofString()));
    }

    public String getGuia(String id, String token) throws IOException, InterruptedException {
        validarId(id);
        HttpRequest req = autorizado("/guias/" + id, token).GET().build();
        return interpretar(client.send(req, HttpResponse.BodyHandlers.ofString()));
    }

    public String getAdmin(String token) throws IOException, InterruptedException {
        HttpRequest req = autorizado("/admin/guias", token).GET().build();
        return interpretar(client.send(req, HttpResponse.BodyHandlers.ofString()));
    }

    public Respuesta getSinRedirect(String ruta) throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder(base.resolve(ruta))
                .timeout(Duration.ofSeconds(2))
                .GET()
                .build();
        HttpResponse<Void> res = client.send(req, HttpResponse.BodyHandlers.discarding());
        return new Respuesta(res.statusCode(), res.headers().firstValue("Location").orElse("-"));
    }

    public String getConReintento(String ruta, String token, int intentos) throws IOException, InterruptedException {
        if (intentos < 1) throw new IllegalArgumentException("intentos debe ser >= 1");
        HttpRequest req = autorizado(ruta, token).GET().build();
        for (int i = 1; i <= intentos; i++) {
            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() == 503 && i < intentos) {
                Thread.sleep(10L * i); // backoff acotado; solo GET idempotente
                continue;
            }
            if (res.statusCode() == 200) return res.body();
            throw new ApiException(res.statusCode(), "error remoto: " + res.statusCode());
        }
        throw new AssertionError("inalcanzable");
    }

    private HttpRequest.Builder autorizado(String ruta, String token) {
        validarToken(token);
        return HttpRequest.newBuilder(base.resolve(ruta))
                .timeout(Duration.ofSeconds(2))
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + token);
    }

    private static String interpretar(HttpResponse<String> res) {
        return switch (res.statusCode()) {
            case 200 -> res.body();
            case 401 -> throw new ApiException(401, "no autenticado");
            case 403 -> throw new ApiException(403, "sin permiso (403)");
            case 404 -> throw new ApiException(404, "no encontrado");
            default -> throw new ApiException(res.statusCode(), "error remoto: " + res.statusCode());
        };
    }

    static void validarId(String id) {
        if (id == null || !id.matches("[A-Za-z0-9_-]{1,32}")) {
            throw new IllegalArgumentException("id inválido");
        }
    }

    static void validarToken(String token) {
        if (token == null || token.isBlank() || token.length() > 512) {
            throw new IllegalArgumentException("token inválido");
        }
    }
}
```

Puntos importantes:

- `connectTimeout` y `request.timeout(...)` son límites distintos: uno acota establecer la conexión; el otro, esperar la respuesta.
- `followRedirects(HttpClient.Redirect.NEVER)` evita que una credencial viaje a otro host sin que lo decidas. El servidor local responde `302` con `Location`; el cliente lo observa y no lo sigue.
- `getConReintento` reintenta solo `503` en un `GET`, con backoff `10 ms`, `20 ms`, y un máximo de intentos. No reintentes un `POST` que crea cobros.
- La allowlist de `id` (`[A-Za-z0-9_-]{1,32}`) rechaza `../admin` antes de tocar la red. Es una expresión regular que `matches` compara con todo el texto; el Módulo 19, Tema 2, la explica a fondo. El `switch` por status distingue 401, 403, 404 y error remoto.

#### Paso 3 · Mira los sockets debajo de HTTP: `SocketsDemo.java`
`HttpClient` usa TCP para HTTP/1.1 y HTTP/2. UDP no es HTTP, pero conviene ver la diferencia de contrato: flujo de bytes con conexión frente a datagramas sin conexión. El demo usa loopback y un `CompletableFuture` para que el servidor TCP acepte en otro hilo sin dormir.

```java
package com.aurora.httpsec;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/** Bajo HttpClient hay sockets: TCP (flujo de bytes) y UDP (datagramas). */
public final class SocketsDemo {
    private SocketsDemo() {}

    public static String demo() throws Exception {
        return "TCP=" + tcp() + ",UDP=" + udp();
    }

    private static String tcp() throws Exception {
        try (ServerSocket servidor = new ServerSocket(0, 1, InetAddress.getLoopbackAddress())) {
            CompletableFuture<String> eco = CompletableFuture.supplyAsync(() -> {
                try (Socket conexion = servidor.accept();
                     InputStream in = conexion.getInputStream();
                     OutputStream out = conexion.getOutputStream()) {
                    int leido = in.read();
                    char mayuscula = Character.toUpperCase((char) leido);
                    out.write(mayuscula);
                    out.flush();
                    return Character.toString(mayuscula);
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
            try (Socket cliente = new Socket(InetAddress.getLoopbackAddress(), servidor.getLocalPort());
                 OutputStream out = cliente.getOutputStream();
                 InputStream in = cliente.getInputStream()) {
                out.write('p');
                out.flush();
                char respuesta = (char) in.read();
                return "p->" + respuesta + "/server=" + eco.get(2, TimeUnit.SECONDS);
            }
        }
    }

    private static String udp() throws IOException {
        try (DatagramSocket socket = new DatagramSocket(0, InetAddress.getLoopbackAddress())) {
            byte[] enviado = "q".getBytes(StandardCharsets.UTF_8);
            socket.send(new DatagramPacket(enviado, enviado.length,
                    InetAddress.getLoopbackAddress(), socket.getLocalPort()));
            DatagramPacket recibido = new DatagramPacket(new byte[16], 16);
            socket.receive(recibido);
            return new String(recibido.getData(), recibido.getOffset(), recibido.getLength(),
                    StandardCharsets.UTF_8);
        }
    }
}
```

Salida verificada (línea `SOCKETS=` de `./gradlew -q run`):

```text
SOCKETS=TCP=p->P/server=P,UDP=q
```

#### Paso 4 · Ejecuta los dos programas del tema
En `~/labs/aurora-m18`, ejecuta `java ClienteGuias.java` y `java RedirectReintento.java`. Comprueba que `/lento`
termina en timeout y que el servidor de `/falla` recibe 3 llamadas.

#### Resumen
- **`HttpClient`** se configura una vez (timeout de conexión, redirecciones) y envía **`HttpRequest`** inmutables.
- Una **`HttpResponse`** con `404` o `503` sigue siendo respuesta: el código de estado decide, no el cuerpo.
- **`HttpServer`** y sus **handlers** dan un servidor local para probar éxitos, errores y lentitud sin red externa.
- **REST** nombra recursos con URI y usa los códigos de estado estándar para comunicar el resultado.
- Una **redirección** se sigue o no según `HttpClient.Redirect`; con `NEVER` revisas `Location` antes de enviar credenciales.
- El **reintento con backoff** se limita a operaciones idempotentes y a fallos transitorios.
- Debajo de HTTP hay un **socket** TCP; `ConnectException` significa que no hubo conexión.

#### Ejercicio verificable 1
Básico. Agrega a `ClienteGuias.java` la ruta `/guias/G2` con un handler que responda `401`. ¿Qué imprime su línea?

Respuesta esperada: `/guias/G2 -> 401 ERROR 401`. El `switch` no tiene caso `401`, así que cae en `default`.

#### Ejercicio verificable 2
Intermedio. En `RedirectReintento.java`, cambia la política a `Redirect.NORMAL`. ¿Qué status ves y llega `X-Api-Key` al servidor ajeno?

Respuesta esperada: `status=200` y sí llega `X-Api-Key=clave-456`. `NORMAL` sigue redirecciones salvo de HTTPS a HTTP;
aquí las dos URI son HTTP, así que la sigue igual que `ALWAYS`.

#### Ejercicio verificable 3
Reto. Cambia `maxIntentos` a 2 sin tocar el servidor. ¿Qué imprime el programa en la parte de reintento?

Respuesta esperada: `intento 1 -> 503 temporal`, `intento 2 -> 503 temporal` y `llamadas al servidor=2`. El límite se
agota antes del `200`; en `ApiCliente.getConReintento` ese caso termina en `ApiException` con status `503`.

#### En el trabajo
Todo servicio que consume APIs de terceros (pagos, transportadoras, mensajería) aplica estas reglas. En Spring Boot
las verás en `RestClient` o `WebClient`, y en librerías de resiliencia como Resilience4j (reintentos, circuit breaker).
Las revisiones de seguridad preguntan siempre por timeouts, redirecciones y qué credencial viaja a dónde.

</details>

### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- emitir un JWT HS256 y leer sus tres partes en Base64url;
- validar firma, caducidad y rol, en ese orden, y devolver 401 o 403 según el caso;
- comparar firmas en tiempo constante con `MessageDigest.isEqual`;
- reconocer los errores `ArrayIndexOutOfBoundsException` e `Illegal base64 character` al partir y decodificar un token.

**Conceptos clave:** token de acceso, esquema Bearer, JWT, Base64url, claim, HS256, comparación en tiempo constante, caducidad

Ya los conoces y no se repiten: *autenticación*, *autorización*, *sesión* y *control de acceso por roles* (Seguridad, Módulo 0, Tema 2); *HMAC*, *clave criptográfica* y *ataque de repetición* (Seguridad, Módulo 0, Tema 3); `HttpServer`,
handler y `HttpClient` (Tema 1 de este módulo).

#### El problema
La API de Tienda Aurora ya responde guías. Ahora solo deben verlas usuarios identificados, y solo un administrador
puede listar todas. El servidor no guarda sesiones: cada petición debe traer la prueba de quién es y qué puede hacer.
¿Cómo comprueba el servidor esa prueba sin consultar una base de datos en cada llamada?

#### Glosario del tema

**token de acceso**
- **Definición técnica:** credencial que el servidor entrega tras autenticar al usuario y que el cliente presenta en cada petición posterior.
- **En palabras sencillas:** la manilla de un evento: te la ponen en la entrada y luego la muestras en cada zona.
- **Dónde se rompe la comparación:** una manilla se ve de lejos; un token copiado de un log sirve igual a quien lo robe.
- **Ejemplo:** `POST /login` con `ana:clave` devuelve el token; `LOGIN=3` confirma que tiene tres partes.
- **Error típico:** imprimir el token completo en los logs: cualquiera con acceso a los logs puede usarlo hasta que caduque.

**esquema Bearer**
- **Definición técnica:** forma estándar (RFC 6750) de enviar un token en la cabecera `Authorization: Bearer <token>`; quien lo porta queda autorizado.
- **En palabras sencillas:** «al portador», como un billete: no importa quién lo entrega, sino que sea válido.
- **Dónde se rompe la comparación:** un billete no caduca; un token sí, y el servidor puede rechazarlo antes.
- **Ejemplo:** `ServidorLocal.autorizar` exige que la cabecera empiece por `"Bearer "` y toma `auth.substring(7)`.
- **Error típico:** enviar el token en la URL (`?token=...`): queda guardado en historiales, proxies y logs de acceso.

**JWT**
- **Definición técnica:** JSON Web Token (RFC 7519): tres partes Base64url separadas por punto, `header.payload.firma`; header y payload son JSON.
- **En palabras sencillas:** un sobre con tres secciones: qué sello usa, qué dice, y el sello que prueba que nadie lo cambió.
- **Dónde se rompe la comparación:** el sobre no es secreto; cualquiera puede leer el payload, solo no puede cambiarlo.
- **Ejemplo:** `JwtPasoAPaso.java` imprime `payload = {"sub":"ana","rol":"LECTOR","exp":4102444800}` sin conocer la clave.
- **Error típico:** guardar datos sensibles en el payload creyendo que va cifrado.

**Base64url**
- **Definición técnica:** variante de Base64 (RFC 4648) que usa `-` y `_` en vez de `+` y `/`, segura dentro de URL y cabeceras; en JWT va sin relleno `=`.
- **En palabras sencillas:** una forma de escribir bytes cualesquiera usando solo letras, números y dos signos.
- **Dónde se rompe la comparación:** no oculta nada: es un cambio de alfabeto, no un cifrado.
- **Ejemplo:** `Base64.getUrlEncoder().withoutPadding()` produce `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`.
- **Error típico:** decodificar con `Base64.getDecoder()`: un `-` en la firma produce `Illegal base64 character 2d`.

**claim**
- **Definición técnica:** par nombre-valor del payload de un JWT; `sub` (sujeto), `exp` (caducidad en segundos epoch) y propios como `rol`.
- **En palabras sencillas:** cada dato escrito en la manilla: tu nombre, tu zona y la hora en que vence.
- **Dónde se rompe la comparación:** un claim solo vale si la firma es válida; antes de verificarla es una afirmación sin prueba.
- **Ejemplo:** `TokenService.Claims(String sub, String rol, long exp)`.
- **Error típico:** leer `rol` del payload y autorizar antes de verificar la firma.

**HS256**
- **Definición técnica:** algoritmo de firma de JWT que calcula HMAC-SHA256 sobre `header.payload` con una clave compartida por emisor y verificador.
- **En palabras sencillas:** un sello que solo puede poner quien tiene la clave, y que solo puede revisar quien también la tiene.
- **Dónde se rompe la comparación:** si diez servicios verifican, los diez tienen la clave y cualquiera podría emitir tokens.
- **Ejemplo:** `Mac.getInstance("HmacSHA256")` con una clave de 32 bytes, en `JwtPasoAPaso.hmac`.
- **Error típico:** usar una clave corta como `"secreto"`; `TokenService` rechaza claves de menos de 32 bytes.

**comparación en tiempo constante**
- **Definición técnica:** comparación de bytes que tarda lo mismo sin importar en qué posición difieren; en Java, `MessageDigest.isEqual`.
- **En palabras sencillas:** revisar todo el código de la caja fuerte antes de decir «no», en vez de parar en el primer dígito malo.
- **Dónde se rompe la comparación:** la diferencia de tiempo es de nanosegundos; un atacante la mide con miles de intentos.
- **Ejemplo:** `MessageDigest.isEqual(esperada, recibida)` en `TokenService.verificar`.
- **Error típico:** comparar firmas con `Arrays.equals` o con `String.equals`, que salen en el primer byte distinto.

**caducidad**
- **Definición técnica:** instante a partir del cual el token deja de aceptarse; en JWT es el claim `exp` y se compara con el reloj en cada validación.
- **En palabras sencillas:** la fecha de vencimiento impresa en la manilla.
- **Dónde se rompe la comparación:** un token caducado sigue teniendo firma válida; solo el chequeo de `exp` lo rechaza.
- **Ejemplo:** con el reloj en `4_102_444_801` (año 2100), `verificar` devuelve `401 token expirado`.
- **Error típico:** emitir tokens sin `exp` o con validez de meses: un token robado sirve todo ese tiempo.

#### ► CÓMO FUNCIONA
Un token es una credencial: no se loguea completo, se valida antes de usarse y se envía solo al destino esperado. Aquí el flujo es completo y local: `POST /login` devuelve un JWT HS256 firmado con HMAC-SHA256 de la JCA; `GET /guias/G1` exige token válido; `GET /admin/guias` exige rol `ADMIN` y responde `403` a un usuario con rol `LECTOR`.

**Visual:** [Seguridad básica HTTP: validar antes de llamar](/visuals/temas/java/modulo-18-seguridad-http.html)

Lectura: valida input y allowlist antes de llamar; aplica timeout; maneja status; reintenta solo si la operación es idempotente.

**Mecanismo.** El servidor valida en un orden fijo. Primero la forma (tres partes); después la firma; después la
caducidad; al final el rol. Los tres primeros fallos dicen «no sé quién eres» (`401`). El último dice «sé quién eres,
pero no puedes» (`403`).

```mermaid
flowchart LR
  P["Authorization:<br/>Bearer token"] --> F{"¿3 partes?"}
  F -->|no| A1["401"]
  F -->|sí| S{"HMAC(header.payload)<br/>isEqual firma"}
  S -->|no| A2["401 firma inválida"]
  S -->|sí| E{"exp > ahora"}
  E -->|no| A3["401 token expirado"]
  E -->|sí| R{"rol permitido"}
  R -->|no| B["403"]
  R -->|sí| OK["200"]
```

**Por qué existe.** Con la firma, el servidor confía en el payload sin guardar sesiones: cualquier instancia con la
clave puede validar. Por eso la firma va antes que cualquier lectura de claims.

**Implicación.** Un token emitido no se puede «cerrar» antes de `exp` sin una lista de revocación. Por eso la validez
es corta (5 minutos en `ServidorLocal.login`).

#### Problema resuelto 2.1
Emite un JWT para `ana` con rol `LECTOR`. Léelo sin la clave, intenta subirle el rol a `ADMIN`, valídalo en el año
2100 y decide si puede entrar a `/admin`.

**Razonamiento:**
1. Header y payload son JSON codificado en Base64url; la firma es el HMAC de `header.payload`.
2. Para manipularlo, basta cambiar el payload y conservar la firma vieja.
3. La validación sigue el orden del diagrama: forma, firma, caducidad y rol. El reloj se pasa como parámetro para probar `exp`.

```java
// JwtPasoAPaso.java — emitir, leer, manipular y validar un JWT HS256 con la JCA
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class JwtPasoAPaso {
    static final byte[] CLAVE = "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8);
    static final Base64.Encoder URL = Base64.getUrlEncoder().withoutPadding();
    static final Base64.Decoder DEC = Base64.getUrlDecoder();

    public static void main(String[] args) throws Exception {
        String header = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = b64("{\"sub\":\"ana\",\"rol\":\"LECTOR\",\"exp\":4102444800}");
        String token = header + "." + payload + "." + URL.encodeToString(hmac(header + "." + payload));
        System.out.println("token   = " + token);

        String[] partes = token.split("\\.");
        System.out.println("partes  = " + partes.length);
        System.out.println("header  = " + texto(partes[0]));
        System.out.println("payload = " + texto(partes[1]));
        System.out.println("valido  = " + verificar(token, 1_800_000_000L));

        String falso = b64("{\"sub\":\"ana\",\"rol\":\"ADMIN\",\"exp\":4102444800}");
        String manipulado = partes[0] + "." + falso + "." + partes[2];
        System.out.println("manipulado (rol ADMIN) = " + verificar(manipulado, 1_800_000_000L));
        System.out.println("en el año 2100         = " + verificar(token, 4_102_444_801L));
        System.out.println("rol para /admin        = " + (texto(partes[1]).contains("\"rol\":\"ADMIN\"") ? 200 : 403));
    }

    static String verificar(String token, long ahoraEpoch) throws Exception {
        String[] p = token.split("\\.", -1);
        if (p.length != 3) return "401 formato inválido";
        byte[] esperada = hmac(p[0] + "." + p[1]);
        if (!MessageDigest.isEqual(esperada, DEC.decode(p[2]))) return "401 firma inválida";
        String json = texto(p[1]);
        long exp = Long.parseLong(json.substring(json.indexOf("\"exp\":") + 6, json.length() - 1));
        if (exp <= ahoraEpoch) return "401 token expirado";
        return "OK";
    }

    static byte[] hmac(String datos) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(CLAVE, "HmacSHA256"));
        return mac.doFinal(datos.getBytes(StandardCharsets.UTF_8));
    }

    static String b64(String json) { return URL.encodeToString(json.getBytes(StandardCharsets.UTF_8)); }

    static String texto(String parte) { return new String(DEC.decode(parte), StandardCharsets.UTF_8); }
}
```

```text
$ java JwtPasoAPaso.java
token   = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmEiLCJyb2wiOiJMRUNUT1IiLCJleHAiOjQxMDI0NDQ4MDB9.oEqzS81g0CwadohP72b9mLrsRtSgvpHacZB0OW4-jBw
partes  = 3
header  = {"alg":"HS256","typ":"JWT"}
payload = {"sub":"ana","rol":"LECTOR","exp":4102444800}
valido  = OK
manipulado (rol ADMIN) = 401 firma inválida
en el año 2100         = 401 token expirado
rol para /admin        = 403
```

**Explicación por partes.**
- Líneas 14–16: el token es `header.payload.firma`; la firma se calcula sobre los dos primeros trozos unidos por punto.
- Líneas 19–22: `split("\\.")` parte el token, y `texto` muestra el JSON. No hizo falta la clave para leerlo.
- Líneas 25–27: el payload falso dice `ADMIN`, pero la firma vieja ya no coincide: `401 firma inválida`.
- Línea 36: `MessageDigest.isEqual` compara en tiempo constante.
- Líneas 38–39: con el reloj en el año 2100, el mismo token válido queda `401 token expirado`.
- Línea 29: el token es auténtico, pero su rol es `LECTOR`: la decisión es `403`.

> **Error común.** Partir el token con `split(".")`. El argumento de `split` es una expresión regular y `.` significa
> «cualquier carácter»: todas las partes quedan vacías y se descartan.

```java
// ErrorSplit.java — partir un JWT con split(".")
public class ErrorSplit {
    public static void main(String[] args) {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbmEifQ.oEqzS81g0CwadohP72b9mLrsRtSgvpHacZB0OW4-jBw";
        String[] partes = token.split(".");
        System.out.println("partes=" + partes.length);
        System.out.println("header=" + partes[0]);
    }
}
```

```text
$ java ErrorSplit.java
partes=0
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 0 out of bounds for length 0
	at ErrorSplit.main(ErrorSplit.java:7)
```

> Escapa el punto: `split("\\.")`. Para validar, usa además `split("\\.", -1)`, que conserva partes vacías y deja ver
> un token como `a..c`.

> **Error común.** Decodificar la firma con el Base64 estándar. La firma de este token tiene un `-`, que solo existe
> en el alfabeto Base64url:

```java
// ErrorBase64.java — decodificar la firma de un JWT con el decodificador Base64 estándar
import java.util.Base64;

public class ErrorBase64 {
    public static void main(String[] args) {
        String firma = "oEqzS81g0CwadohP72b9mLrsRtSgvpHacZB0OW4-jBw";
        System.out.println("url: " + Base64.getUrlDecoder().decode(firma).length + " bytes");
        System.out.println("estándar: " + Base64.getDecoder().decode(firma).length + " bytes");
    }
}
```

```text
$ java ErrorBase64.java
url: 32 bytes
Exception in thread "main" java.lang.IllegalArgumentException: Illegal base64 character 2d
```

> `2d` es el código hexadecimal de `-`. Usa `Base64.getUrlDecoder()` para todas las partes de un JWT.

> **Buena práctica.** Responde `401` cuando no sabes quién es el usuario y `403` cuando lo sabes y no tiene permiso. El
> cliente reacciona distinto: con `401` vuelve a iniciar sesión; con `403` no tiene sentido reintentar.

> **Prevenir errores.** Este JWT es deliberadamente mínimo: no implementa OAuth/OIDC, rotación de claves, `jti`, `aud`
> ni mTLS. Para un proveedor externo o una API multi-servicio, usa una librería revisada y un gestor de secretos.

#### Checkpoint 2.1
Un atacante cambia el payload y también recalcula la firma con HMAC-SHA256, pero con la clave `"otra"`. ¿Qué responde el servidor?

Respuesta: `401 firma inválida`. La firma esperada se calcula con la clave del servidor; sin ella no se puede producir
una firma que coincida.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea `CryptoUtil.java` (la firma del JWT usa `hmacSha256`)
El mismo archivo sirve al Tema 3 para hash y cifrado:

```java
package com.aurora.httpsec;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;

/** Primitivas JCA: hash, HMAC y cifrado autenticado. Ningún algoritmo inventado. */
public final class CryptoUtil {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    private CryptoUtil() {}

    public static String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HEX.formatHex(md.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static byte[] hmacSha256(byte[] key, String mensaje) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(mensaje.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static String hmacSha256Hex(byte[] key, String mensaje) {
        return HEX.formatHex(hmacSha256(key, mensaje));
    }

    public static byte[] randomBytes(int n) {
        byte[] b = new byte[n];
        RANDOM.nextBytes(b);
        return b;
    }

    public static byte[] aesGcmEncrypt(byte[] key, byte[] iv, byte[] plain) {
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
            return cipher.doFinal(plain);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static byte[] aesGcmDecrypt(byte[] key, byte[] iv, byte[] cipherText) {
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
            return cipher.doFinal(cipherText);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
```

#### Paso 2 · Crea `TokenService.java`

```java
package com.aurora.httpsec;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/**
 * JWT HS256 firmado con HMAC-SHA256 de la JCA: header.payload.firma en Base64url.
 * Solo para un backend propio: en producción usa una librería revisada y gestión de claves.
 */
public final class TokenService {
    public record Claims(String sub, String rol, long exp) {}

    private static final Base64.Encoder URL = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DEC = Base64.getUrlDecoder();

    private final byte[] clave;

    public TokenService(byte[] clave) {
        if (clave == null || clave.length < 32) {
            throw new IllegalArgumentException("clave HMAC de al menos 32 bytes");
        }
        this.clave = clave.clone();
    }

    public String emitir(String usuario, String rol, Duration validez) {
        if (!usuario.matches("[A-Za-z0-9_-]{1,32}") || !rol.matches("[A-Za-z0-9_-]{1,32}")) {
            throw new IllegalArgumentException("claim inválido");
        }
        String header = codificar("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        long exp = Instant.now().plus(validez).getEpochSecond();
        String payload = codificar("{\"sub\":\"" + usuario + "\",\"rol\":\"" + rol + "\",\"exp\":" + exp + "}");
        String firmado = header + "." + payload;
        return firmado + "." + URL.encodeToString(CryptoUtil.hmacSha256(clave, firmado));
    }

    public Claims verificar(String token) {
        if (token == null) throw new ApiException(401, "token ausente");
        String[] partes = token.split("\\.", -1);
        if (partes.length != 3 || partes[0].isBlank() || partes[1].isBlank() || partes[2].isBlank()) {
            throw new ApiException(401, "formato de token inválido");
        }
        byte[] esperada = CryptoUtil.hmacSha256(clave, partes[0] + "." + partes[1]);
        byte[] recibida;
        try {
            recibida = DEC.decode(partes[2]);
        } catch (IllegalArgumentException e) {
            throw new ApiException(401, "firma inválida");
        }
        if (!MessageDigest.isEqual(esperada, recibida)) {
            throw new ApiException(401, "firma inválida");
        }
        String json = new String(DEC.decode(partes[1]), StandardCharsets.UTF_8);
        Claims claims = new Claims(texto(json, "sub"), texto(json, "rol"), numero(json, "exp"));
        if (claims.exp() <= Instant.now().getEpochSecond()) {
            throw new ApiException(401, "token expirado");
        }
        return claims;
    }

    private static String codificar(String json) {
        return URL.encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    // Lector mínimo de los claims que emite esta propia clase; no es un parser JSON general.
    private static String texto(String json, String nombre) {
        String marca = "\"" + nombre + "\":\"";
        int inicio = json.indexOf(marca);
        if (inicio < 0) throw new ApiException(401, "claim ausente: " + nombre);
        int desde = inicio + marca.length();
        int fin = json.indexOf('"', desde);
        if (fin < 0) throw new ApiException(401, "claim malformado: " + nombre);
        return json.substring(desde, fin);
    }

    private static long numero(String json, String nombre) {
        String marca = "\"" + nombre + "\":";
        int inicio = json.indexOf(marca);
        if (inicio < 0) throw new ApiException(401, "claim ausente: " + nombre);
        int desde = inicio + marca.length();
        int fin = desde;
        while (fin < json.length() && Character.isDigit(json.charAt(fin))) fin++;
        if (fin == desde) throw new ApiException(401, "claim malformado: " + nombre);
        try {
            return Long.parseLong(json.substring(desde, fin));
        } catch (NumberFormatException e) {
            throw new ApiException(401, "claim malformado: " + nombre);
        }
    }
}
```

La firma se compara con `MessageDigest.isEqual` (comparación en tiempo constante) y `exp` se comprueba en cada validación. Los claims `sub` y `rol` usan allowlist para que el lector mínimo de JSON no necesite escapar caracteres. Un token manipulado cambia la firma y produce `401`; un token con rol insuficiente produce `403`.

#### Paso 3 · Crea `ServidorLocal.java`

```java
package com.aurora.httpsec;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

/** Servidor local: login JWT, endpoint con roles, redirect y fallo transitorio. */
public final class ServidorLocal implements AutoCloseable {
    private final HttpServer server;
    private final TokenService tokens;
    private final AtomicInteger llamadasFalla = new AtomicInteger();

    public ServidorLocal(TokenService tokens) throws IOException {
        this.tokens = tokens;
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/login", this::login);
        server.createContext("/guias/", this::guia);
        server.createContext("/admin/guias", this::admin);
        server.createContext("/redirect", ex -> {
            ex.getResponseHeaders().add("Location", "/guias/G1");
            responder(ex, 302, new byte[0]);
        });
        server.createContext("/falla", ex -> {
            int n = llamadasFalla.incrementAndGet();
            if (n <= 2) responder(ex, 503, "temporal".getBytes(StandardCharsets.UTF_8));
            else responder(ex, 200, "{\"ok\":true}".getBytes(StandardCharsets.UTF_8));
        });
        server.start();
    }

    public URI base() {
        return URI.create("http://127.0.0.1:" + server.getAddress().getPort());
    }

    public void reiniciarFallos() {
        llamadasFalla.set(0);
    }

    public int llamadasFalla() {
        return llamadasFalla.get();
    }

    private void login(HttpExchange ex) throws IOException {
        String body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        String rol = switch (body) {
            case "ana:clave" -> "LECTOR";
            case "root:clave" -> "ADMIN";
            default -> null;
        };
        if (rol == null) {
            responder(ex, 401, "credenciales inválidas".getBytes(StandardCharsets.UTF_8));
            return;
        }
        String usuario = body.substring(0, body.indexOf(':'));
        responder(ex, 200, tokens.emitir(usuario, rol, Duration.ofMinutes(5)).getBytes(StandardCharsets.UTF_8));
    }

    private void guia(HttpExchange ex) throws IOException {
        try {
            TokenService.Claims claims = autorizar(ex);
            String id = ex.getRequestURI().getPath().substring("/guias/".length());
            if (!"G1".equals(id)) {
                responder(ex, 404, "no encontrada".getBytes(StandardCharsets.UTF_8));
                return;
            }
            String json = "{\"id\":\"" + id + "\",\"estado\":\"ENTREGADA\",\"rol\":\"" + claims.rol() + "\"}";
            responder(ex, 200, json.getBytes(StandardCharsets.UTF_8));
        } catch (ApiException e) {
            responder(ex, e.status(), e.getMessage().getBytes(StandardCharsets.UTF_8));
        }
    }

    private void admin(HttpExchange ex) throws IOException {
        try {
            TokenService.Claims claims = autorizar(ex);
            if (!"ADMIN".equals(claims.rol())) {
                responder(ex, 403, "rol ADMIN requerido".getBytes(StandardCharsets.UTF_8));
                return;
            }
            responder(ex, 200, "ADMIN:OK".getBytes(StandardCharsets.UTF_8));
        } catch (ApiException e) {
            responder(ex, e.status(), e.getMessage().getBytes(StandardCharsets.UTF_8));
        }
    }

    private TokenService.Claims autorizar(HttpExchange ex) {
        String auth = ex.getRequestHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new ApiException(401, "autorización requerida");
        }
        return tokens.verificar(auth.substring(7));
    }

    private static void responder(HttpExchange ex, int status, byte[] body) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
        ex.sendResponseHeaders(status, body.length == 0 ? -1 : body.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(body);
        }
    }

    @Override
    public void close() {
        server.stop(0);
    }
}
```

#### Paso 4 · Verifica el flujo completo
Ejecuta `./gradlew -q run` (el `main` está en «Borde ejecutable: `App.java`»). Resultados verificados: `LOGIN=3`
(tres partes del JWT), `SIN_ROL=403`, `TOKEN_INVALIDO=401`, `ADMIN=ADMIN:OK`. Aquí se verifica el contrato completo de
emisión, firma, caducidad y autorización contra un servidor local.

#### Resumen
- Un **token de acceso** se obtiene al autenticarse y se envía en cada petición con el **esquema Bearer**.
- Un **JWT** tiene tres partes en **Base64url**: header, payload con **claims** y firma. Leerlo no requiere clave.
- **HS256** firma `header.payload` con HMAC-SHA256 y una clave compartida de al menos 32 bytes.
- La firma se compara con **comparación en tiempo constante** (`MessageDigest.isEqual`).
- La **caducidad** (`exp`) se revisa en cada validación; una firma válida no basta.
- Fallos de forma, firma o caducidad dan `401`; rol insuficiente da `403`.

#### Ejercicio verificable 1
Básico. En `JwtPasoAPaso.java`, ¿qué imprime `verificar("a.b", 0)`?

Respuesta esperada: `401 formato inválido`. `split("\\.", -1)` produce 2 partes y la línea 34 exige 3.

#### Ejercicio verificable 2
Intermedio. Emite el token con rol `ADMIN` desde el principio (línea 15). ¿Qué imprimen las líneas `valido` y `rol para /admin`?

Respuesta esperada: `valido  = OK` y `rol para /admin        = 200`. El token es auténtico y su rol cumple.

#### Ejercicio verificable 3
Reto. En `HttpSecTest`, escribe una prueba que llame a `getGuia("G1", ...)` con un token emitido por otro
`TokenService` con una clave distinta de 32 bytes. ¿Qué status lleva la `ApiException`?

Respuesta esperada: status `401` con mensaje `no autenticado`. El servidor recalcula la firma con su propia clave,
`MessageDigest.isEqual` devuelve `false` y responde `401`; `ApiCliente.interpretar` traduce ese `401` a su mensaje.

#### En el trabajo
Spring Security valida JWT con un `JwtDecoder` y traduce los rechazos a `401` y `403` exactamente en este orden. En
producción se prefiere RS256 o ES256 (firma asimétrica): solo el emisor tiene la clave privada y los demás servicios
verifican con la pública. La revisión de seguridad pide siempre: validez corta, clave fuera del código y nada sensible en el payload.

</details>

### Tema 3: Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- pedir a la JCA un `MessageDigest`, un `Mac` y un `Cipher` por nombre de algoritmo;
- elegir entre SHA-256, HMAC-SHA256 y AES-GCM según si necesitas huella, autenticidad o secreto;
- cifrar y descifrar con AES-GCM usando un IV único y detectar la manipulación con `AEADBadTagException`;
- explicar por qué SHA-256 no sirve para contraseñas y qué usar en su lugar.

**Conceptos clave:** JCA, proveedor, `MessageDigest`, `Mac`, `Cipher`, AES-GCM, IV, tag de autenticación, `SecureRandom`

Ya los conoces y no se repiten: *hash criptográfico*, *sal* y *función de derivación de claves* (Seguridad, Módulo 0, Tema 2); *cifrado simétrico*, *clave criptográfica*, *HMAC*, *nonce* y *TLS* (Seguridad, Módulo 0, Tema 3); HS256
(Tema 2 de este módulo).

#### El problema
Tienda Aurora guarda la liquidación de cada repartidor en un archivo que viaja entre sistemas. Necesita tres cosas:
saber si el archivo cambió, saber que lo generó su propio backend y que nadie más pueda leer el monto. ¿Qué
herramienta del JDK resuelve cada necesidad sin escribir un algoritmo propio?

#### Glosario del tema

**JCA**
- **Definición técnica:** Java Cryptography Architecture: API estándar (`java.security`, `javax.crypto`) que entrega implementaciones de algoritmos por nombre mediante `getInstance("...")`.
- **En palabras sencillas:** un mostrador donde pides «SHA-256» o «AES/GCM» y te entregan la herramienta lista.
- **Dónde se rompe la comparación:** el mostrador no te avisa si pides algo inseguro; `MD5` también se entrega.
- **Ejemplo:** `MessageDigest.getInstance("SHA-256")` en `CriptoJca.java`.
- **Error típico:** escribir mal el nombre: `getInstance("SHA3")` lanza `NoSuchAlgorithmException` (el nombre es `SHA3-256`).

**proveedor**
- **Definición técnica:** paquete de implementaciones registrado en la JCA (`SUN`, `SunJCE`, `SunEC`…); `getInstance` elige el primero que soporta el algoritmo pedido.
- **En palabras sencillas:** la marca del fabricante detrás del mostrador.
- **Dónde se rompe la comparación:** puedes cambiar de fabricante (por ejemplo, un módulo de hardware) sin cambiar tu código.
- **Ejemplo:** `sha.getProvider().getName()` imprime `SUN`.
- **Error típico:** fijar un proveedor externo en el código sin necesidad: el programa falla donde ese proveedor no está instalado.

**`MessageDigest`**
- **Definición técnica:** clase de la JCA que calcula un hash criptográfico; `digest(bytes)` devuelve la huella de tamaño fijo (32 bytes en SHA-256).
- **En palabras sencillas:** una máquina que convierte cualquier texto en una huella digital corta.
- **Dónde se rompe la comparación:** cualquiera puede calcular la huella; no prueba quién la hizo.
- **Ejemplo:** `SHA-256("Aurora")` empieza por `e9de098c7733` y mide 32 bytes.
- **Error típico:** usarla para contraseñas: es rápida a propósito, y eso ayuda a quien prueba millones de claves.

**`Mac`**
- **Definición técnica:** clase de la JCA para códigos de autenticación de mensajes; con `HmacSHA256` y una clave produce un HMAC.
- **En palabras sencillas:** la máquina de huellas, pero con una llave: solo quien tiene la llave produce la misma huella.
- **Dónde se rompe la comparación:** la llave es compartida; quien verifica también podría firmar.
- **Ejemplo:** `HMAC(clave, mensaje)` empieza por `17e8847a8463`; es la misma primitiva que firma los JWT del Tema 2.
- **Error típico:** llamar a `doFinal` sin `init`: lanza `java.lang.IllegalStateException: MAC not initialized`.

**`Cipher`**
- **Definición técnica:** clase de la JCA que cifra o descifra; se pide con una transformación `algoritmo/modo/relleno` y se inicializa con modo, clave y parámetros.
- **En palabras sencillas:** la máquina que mete el mensaje en una caja con candado o lo saca.
- **Dónde se rompe la comparación:** la misma máquina sirve para cerrar y abrir; lo decide `ENCRYPT_MODE` o `DECRYPT_MODE`.
- **Ejemplo:** `Cipher.getInstance("AES/GCM/NoPadding")`.
- **Error típico:** pedir solo `"AES"`: el proveedor elige ECB, un modo que revela patrones del texto.

**AES-GCM**
- **Definición técnica:** cifrado simétrico AES en modo Galois/Counter: cifra y autentica a la vez (AEAD); agrega un tag al final del cifrado.
- **En palabras sencillas:** una caja con candado y precinto: nadie la abre sin la llave y cualquier golpe se nota.
- **Dónde se rompe la comparación:** el precinto se revisa al abrir; un cifrado alterado no avisa hasta que intentas descifrarlo.
- **Ejemplo:** 18 bytes de texto producen 34 bytes cifrados: 18 de datos y 16 de tag.
- **Error típico:** reutilizar el mismo IV con la misma clave; la salida de `IvRepetido.java` muestra lo que se filtra.

**IV**
- **Definición técnica:** vector de inicialización: nonce de 12 bytes que GCM combina con la clave; debe ser único por cada cifrado con la misma clave, no secreto.
- **En palabras sencillas:** un número de serie que cada caja lleva por fuera.
- **Dónde se rompe la comparación:** un número de serie repetido es un descuido; un IV repetido en GCM revela relaciones entre los textos.
- **Ejemplo:** `random.nextBytes(iv)` con `iv = new byte[12]`; se guarda junto al cifrado para poder descifrar.
- **Error típico:** usar un IV fijo (`new byte[12]`) para todos los cifrados.

**tag de autenticación**
- **Definición técnica:** valor de 128 bits que GCM calcula sobre el cifrado y lo verifica al descifrar; si no coincide, lanza `AEADBadTagException` y no devuelve texto.
- **En palabras sencillas:** el precinto de la caja.
- **Dónde se rompe la comparación:** un precinto roto deja ver el contenido dañado; GCM no entrega nada.
- **Ejemplo:** cambiar un bit (`cifrado[0] ^= 1`) produce `javax.crypto.AEADBadTagException: Tag mismatch`.
- **Error típico:** capturar la excepción y seguir con datos vacíos; un tag inválido es un ataque o un dato corrupto.

**`SecureRandom`**
- **Definición técnica:** generador de números aleatorios criptográficamente fuerte, alimentado por el sistema operativo; se usa para claves, IV y sales.
- **En palabras sencillas:** un dado que nadie puede predecir, ni conociendo los resultados anteriores.
- **Dónde se rompe la comparación:** `java.util.Random` también parece un dado, pero sus resultados se pueden predecir.
- **Ejemplo:** `random.nextBytes(clave)` llena 32 bytes para una clave AES-256.
- **Error típico:** generar claves con `new Random()` o con `Math.random()`.

#### ► CÓMO FUNCIONA
JCA es la API estándar de criptografía en Java. No inventes algoritmos, no implementes AES a mano, no uses MD5/SHA-1 para seguridad nueva y no reutilices IVs con la misma clave en AES-GCM. Cada primitiva tiene un propósito distinto:

- **SHA-256**: hash e integridad. No cifra y no es password hashing.
- **HMAC-SHA256**: autenticidad e integridad con clave compartida. Aquí firma cada JWT.
- **AES-GCM**: cifrado autenticado. Detecta manipulación del ciphertext con `AEADBadTagException`.

**Mecanismo.** Pides el algoritmo por nombre, inicializas con la clave cuando hace falta y procesas bytes. La JCA
busca un proveedor que lo implemente.

```mermaid
flowchart TB
  N{"¿Qué necesitas?"} -->|"saber si cambió"| H["MessageDigest<br/>SHA-256"]
  N -->|"saber quién lo hizo"| M["Mac<br/>HmacSHA256 + clave"]
  N -->|"que nadie lo lea<br/>ni lo altere"| C["Cipher<br/>AES/GCM/NoPadding<br/>clave + IV único"]
  N -->|"guardar contraseñas"| P["SecretKeyFactory<br/>PBKDF2 + sal + iteraciones"]
  C --> T["cifrado || tag 16 bytes"]
  T -->|"1 bit cambiado"| X["AEADBadTagException"]
```

**Por qué existe.** Implementar criptografía a mano falla en detalles invisibles. La JCA trae implementaciones
revisadas y te deja cambiar de proveedor sin tocar el código.

**Implicación.** Tu trabajo es elegir la primitiva correcta y manejar bien claves e IV. Por eso el diagrama empieza
por la pregunta, no por el algoritmo.

#### Problema resuelto 3.1
Calcula la huella de `"Aurora"`, el HMAC de `"mensaje"` con la clave `"clave"`, cifra una liquidación con AES-GCM,
descífrala y prueba qué pasa si alguien cambia un bit.

**Razonamiento:**
1. La huella no necesita clave: `MessageDigest`.
2. La autenticidad necesita clave compartida: `Mac` con `HmacSHA256`.
3. El secreto con detección de cambios: `Cipher` AES-GCM con clave de 32 bytes e IV de 12 bytes de `SecureRandom`.
4. Para la prueba de manipulación, se cambia un bit del cifrado y se intenta descifrar.

```java
// CriptoJca.java — SHA-256, HMAC-SHA256 y AES-GCM con la JCA, y qué detecta cada uno
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class CriptoJca {
    public static void main(String[] args) throws Exception {
        HexFormat hex = HexFormat.of();
        byte[] datos = "Aurora".getBytes(StandardCharsets.UTF_8);

        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] huella = sha.digest(datos);
        System.out.println("SHA-256(Aurora)  = " + hex.formatHex(huella).substring(0, 12) + "… (" + huella.length + " bytes)");
        System.out.println("proveedor        = " + sha.getProvider().getName());

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("clave".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        System.out.println("HMAC(clave, mensaje) = " + hex.formatHex(mac.doFinal("mensaje".getBytes(StandardCharsets.UTF_8))).substring(0, 12) + "…");

        SecureRandom random = new SecureRandom();
        byte[] clave = new byte[32];
        byte[] iv = new byte[12];
        random.nextBytes(clave);
        random.nextBytes(iv);
        SecretKeySpec aes = new SecretKeySpec(clave, "AES");

        Cipher cifrador = Cipher.getInstance("AES/GCM/NoPadding");
        cifrador.init(Cipher.ENCRYPT_MODE, aes, new GCMParameterSpec(128, iv));
        byte[] cifrado = cifrador.doFinal("liquidación 23.80".getBytes(StandardCharsets.UTF_8));
        System.out.println("texto 18 bytes -> cifrado " + cifrado.length + " bytes (18 + 16 de tag)");

        Cipher descifrador = Cipher.getInstance("AES/GCM/NoPadding");
        descifrador.init(Cipher.DECRYPT_MODE, aes, new GCMParameterSpec(128, iv));
        System.out.println("descifrado       = " + new String(descifrador.doFinal(cifrado), StandardCharsets.UTF_8));

        cifrado[0] ^= 1;   // un atacante cambia un bit
        try {
            descifrador.init(Cipher.DECRYPT_MODE, aes, new GCMParameterSpec(128, iv));
            descifrador.doFinal(cifrado);
        } catch (AEADBadTagException e) {
            System.out.println("manipulado       = " + e);
        }
    }
}
```

```text
$ java CriptoJca.java
SHA-256(Aurora)  = e9de098c7733… (32 bytes)
proveedor        = SUN
HMAC(clave, mensaje) = 17e8847a8463…
texto 18 bytes -> cifrado 34 bytes (18 + 16 de tag)
descifrado       = liquidación 23.80
manipulado       = javax.crypto.AEADBadTagException: Tag mismatch
```

**Explicación por partes.**
- Líneas 17–20: la huella mide 32 bytes y la entrega el proveedor `SUN`.
- Líneas 22–24: el HMAC coincide con la línea `HMAC=17e8847a8463` del proyecto.
- Líneas 26–31: clave e IV salen de `SecureRandom`; cambian en cada ejecución.
- Líneas 33–36: el cifrado suma 16 bytes de tag a los 18 del texto.
- Líneas 42–47: un bit cambiado basta para `Tag mismatch`; no se devuelve ningún texto.

#### Problema resuelto 3.2
Comprueba qué pierde un sistema que cifra dos pagos con la misma clave y el mismo IV.

**Razonamiento:**
1. GCM cifra con XOR contra un flujo que depende solo de clave e IV.
2. Si clave e IV se repiten, el flujo se repite, y el XOR de los dos cifrados elimina el flujo.
3. Comparar el XOR de los cifrados con el XOR de los textos lo demuestra.

```java
// IvRepetido.java — qué se filtra al reutilizar el IV con la misma clave en AES-GCM
import java.nio.charset.StandardCharsets;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class IvRepetido {
    public static void main(String[] args) throws Exception {
        SecretKeySpec clave = new SecretKeySpec(new byte[32], "AES");   // solo para la demo: clave de ceros
        byte[] iv = new byte[12];                                       // mismo IV dos veces: el error
        byte[] a = "PAGO 100000".getBytes(StandardCharsets.UTF_8);
        byte[] b = "PAGO 999999".getBytes(StandardCharsets.UTF_8);
        byte[] ca = cifrar(clave, iv, a);
        byte[] cb = cifrar(clave, iv, b);

        StringBuilder xorCifrados = new StringBuilder();
        StringBuilder xorTextos = new StringBuilder();
        for (int i = 0; i < a.length; i++) {
            xorCifrados.append(ca[i] ^ cb[i]).append(' ');
            xorTextos.append(a[i] ^ b[i]).append(' ');
        }
        System.out.println("XOR cifrados = " + xorCifrados.toString().trim());
        System.out.println("XOR textos   = " + xorTextos.toString().trim());
        System.out.println("iguales      = " + xorCifrados.toString().equals(xorTextos.toString()));

        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, clave, new GCMParameterSpec(128, iv));
        c.doFinal(a);
        c.init(Cipher.ENCRYPT_MODE, clave, new GCMParameterSpec(128, iv));   // la JCA lo impide en el mismo Cipher
    }

    static byte[] cifrar(SecretKeySpec clave, byte[] iv, byte[] texto) throws Exception {
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, clave, new GCMParameterSpec(128, iv));
        return c.doFinal(texto);
    }
}
```

```text
$ java IvRepetido.java
XOR cifrados = 0 0 0 0 0 8 9 9 9 9 9
XOR textos   = 0 0 0 0 0 8 9 9 9 9 9
iguales      = true
Exception in thread "main" java.security.InvalidAlgorithmParameterException: Cannot reuse iv for GCM encryption
	at java.base/com.sun.crypto.provider.GaloisCounterMode.init(GaloisCounterMode.java:147)
```

**Explicación por partes.**
- Líneas 9–14: misma clave y mismo IV para dos pagos distintos.
- Líneas 16–24: el XOR de los cifrados es igual al XOR de los textos. Quien conozca un pago deduce el otro.
- Líneas 26–29: la JCA bloquea reutilizar el IV en el mismo `Cipher` con `Cannot reuse iv for GCM encryption`, pero no
  puede detectarlo entre dos objetos `Cipher` distintos (líneas 13–14).

> **Error común.** Escribir el nombre del algoritmo de memoria. La JCA no adivina:

```java
// ErrorAlgoritmo.java — pedir un algoritmo con el nombre mal escrito (el correcto es "SHA3-256")
import java.security.MessageDigest;

public class ErrorAlgoritmo {
    public static void main(String[] args) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA3");
        System.out.println(md.getAlgorithm());
    }
}
```

```text
$ java ErrorAlgoritmo.java
Exception in thread "main" java.security.NoSuchAlgorithmException: SHA3 MessageDigest not available
	at java.base/sun.security.jca.GetInstance.getInstance(GetInstance.java:147)
```

> Copia el nombre de la documentación de nombres estándar de la JCA: `SHA-256`, `SHA3-256`, `HmacSHA256`,
> `AES/GCM/NoPadding`, `PBKDF2WithHmacSHA256`.

> **Error común.** Usar SHA-256 para guardar contraseñas. Para contraseñas usa algoritmos lentos con salt, como
> bcrypt/Argon2/PBKDF2; no un hash rápido puro. El JDK trae PBKDF2:

```java
// Pbkdf2.java — derivar un hash de contraseña lento y con sal
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class Pbkdf2 {
    public static void main(String[] args) throws Exception {
        byte[] sal = "sal-fija-solo-demo".getBytes(StandardCharsets.UTF_8);
        SecretKeyFactory f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        for (int iteraciones : new int[] {1, 600_000}) {
            long t0 = System.nanoTime();
            byte[] hash = f.generateSecret(new PBEKeySpec("clave123".toCharArray(), sal, iteraciones, 256)).getEncoded();
            long ms = (System.nanoTime() - t0) / 1_000_000;
            System.out.println("iteraciones=" + iteraciones + " hash=" + HexFormat.of().formatHex(hash).substring(0, 12) + "… ms=" + ms);
        }
    }
}
```

```text
$ java Pbkdf2.java
iteraciones=1 hash=fc094cfd57a1… ms=6
iteraciones=600000 hash=5502f97dbe9f… ms=516
```

> Los milisegundos cambian en cada equipo; la proporción es lo que importa. Cada intento de un atacante cuesta lo mismo
> que a ti, multiplicado por millones de contraseñas probadas.

> **Buena práctica.** Guarda el IV junto al cifrado (por ejemplo, `iv || cifrado`) y genera uno nuevo con
> `SecureRandom` en cada llamada a `ENCRYPT_MODE`. El IV no es secreto; la clave sí.

> **Prevenir errores.** La clave nunca va en el código fuente. En el proyecto sale de `CryptoUtil.randomBytes(32)`;
> en producción viene de un gestor de secretos y se rota.

#### Checkpoint 3.1
Necesitas comprobar que un archivo descargado es el mismo que publicó el proveedor, que ya te dio su huella SHA-256. ¿Qué clase usas y necesitas clave?

Respuesta: `MessageDigest` con `SHA-256`, sin clave. Calculas la huella del archivo y la comparas con la publicada.
Si también quieres saber quién lo publicó, la huella debe llegar por un canal confiable o firmada.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Reusa `CryptoUtil.java`
El código completo de `CryptoUtil.java` está en el Tema 2, Paso 1; es el mismo archivo que firma los tokens y cifra la liquidación del `main`. `SecureRandom` genera IVs de 12 bytes y claves de 32 bytes; el tag GCM es de 128 bits.

#### Paso 2 · Comprueba las primitivas desde `App`
Ejecuta `./gradlew -q run` y localiza las tres últimas líneas: `SHA256=e9de098c7733`, `AES=secreto` y
`HMAC=17e8847a8463`. Las dos huellas coinciden con `CriptoJca.java` porque son deterministas.

#### Paso 3 · Comprueba la detección de manipulación
La prueba `cryptoRoundtripYManipulacionDetectada` de `HttpSecTest` cambia el último byte del cifrado y espera
`IllegalStateException`: `CryptoUtil` envuelve la `AEADBadTagException` de la JCA.

#### Resumen
- La **JCA** entrega algoritmos por nombre; el **proveedor** (`SUN`, `SunJCE`) los implementa.
- **`MessageDigest`** da una huella sin clave; **`Mac`** da una huella con clave (HMAC).
- **`Cipher`** con **AES-GCM** cifra y autentica; el **tag de autenticación** de 16 bytes detecta cualquier cambio.
- El **IV** de 12 bytes es único por cifrado con la misma clave; repetirlo filtra el XOR de los textos.
- **`SecureRandom`** genera claves, IV y sales; `Random` no sirve para eso.
- Las contraseñas se guardan con una función lenta con sal (PBKDF2, bcrypt, Argon2), no con SHA-256.

#### Ejercicio verificable 1
Básico. En `CriptoJca.java`, cambia el texto a `"secreto"` (7 bytes). ¿Cuántos bytes mide el cifrado?

Respuesta esperada: 23 bytes: 7 del texto más 16 del tag. GCM no agrega relleno.

#### Ejercicio verificable 2
Intermedio. En `CriptoJca.java`, en vez de cambiar un bit, descifra con otro IV de 12 bytes. ¿Qué excepción aparece?

Respuesta esperada: `javax.crypto.AEADBadTagException: Tag mismatch`. Con otro IV el tag calculado no coincide; GCM no
distingue entre «IV equivocado» y «datos alterados».

#### Ejercicio verificable 3
Reto. En `Pbkdf2.java`, cambia la sal a `"otra-sal"` y deja la clave `clave123` con 1 iteración. ¿El hash empieza por `fc094cfd57a1`?

Respuesta esperada: no. La sal entra en el cálculo, así que la misma contraseña produce otro hash. Por eso dos usuarios
con la misma contraseña no comparten hash si cada uno tiene su propia sal.

#### En el trabajo
Cifrar un campo sensible antes de guardarlo (número de documento, cuenta bancaria) se hace así, con la clave en un KMS
como AWS KMS o HashiCorp Vault. Spring Security trae `Pbkdf2PasswordEncoder` y `BCryptPasswordEncoder` para
contraseñas. TLS usa AES-GCM por debajo: la misma primitiva protege cada petición HTTPS.

</details>

## Borde ejecutable: `App.java`

```java
package com.aurora.httpsec;

import java.nio.charset.StandardCharsets;

/** Borde ejecutable: login JWT, roles, redirect/reintento, sockets y JCA. */
public final class App {
    public static void main(String[] args) throws Exception {
        TokenService tokens = new TokenService(CryptoUtil.randomBytes(32));
        try (ServidorLocal servidor = new ServidorLocal(tokens)) {
            ApiCliente api = new ApiCliente(servidor.base());
            String lector = api.login("ana", "clave");
            String admin = api.login("root", "clave");
            System.out.println("LOGIN=" + lector.split("\\.").length);

            System.out.println("GUIA=" + api.getGuia("G1", lector));
            try {
                api.getAdmin(lector);
            } catch (ApiException e) {
                System.out.println("SIN_ROL=" + e.status());
            }
            System.out.println("ADMIN=" + api.getAdmin(admin));
            try {
                api.getGuia("G1", "falso");
            } catch (ApiException e) {
                System.out.println("TOKEN_INVALIDO=" + e.status());
            }

            ApiCliente.Respuesta redirect = api.getSinRedirect("/redirect");
            System.out.println("SIN_REDIRECT=" + redirect.status() + ":" + redirect.location());
            servidor.reiniciarFallos();
            System.out.println("REINTENTO=" + api.getConReintento("/falla", lector, 3)
                    + ":llamadas=" + servidor.llamadasFalla());

            System.out.println("SOCKETS=" + SocketsDemo.demo());

            String hash = CryptoUtil.sha256Hex("Aurora");
            System.out.println("SHA256=" + hash.substring(0, 12));
            byte[] key = CryptoUtil.randomBytes(32);
            byte[] iv = CryptoUtil.randomBytes(12);
            byte[] cipher = CryptoUtil.aesGcmEncrypt(key, iv, "secreto".getBytes(StandardCharsets.UTF_8));
            byte[] plain = CryptoUtil.aesGcmDecrypt(key, iv, cipher);
            System.out.println("AES=" + new String(plain, StandardCharsets.UTF_8));
            String mac = CryptoUtil.hmacSha256Hex("clave".getBytes(StandardCharsets.UTF_8), "mensaje");
            System.out.println("HMAC=" + mac.substring(0, 12));
        }
    }
}
```

## Pruebas: `HttpSecTest.java`

```java
package com.aurora.httpsec;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class HttpSecTest {
    private ServidorLocal servidor;
    private ApiCliente api;

    @BeforeEach
    void setUp() throws Exception {
        TokenService tokens = new TokenService(
                "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8));
        servidor = new ServidorLocal(tokens);
        api = new ApiCliente(servidor.base());
    }

    @AfterEach
    void tearDown() {
        servidor.close();
    }

    @Test
    void loginEmitesJwtYGuiaResponde() throws Exception {
        String token = api.login("ana", "clave");
        assertEquals(3, token.split("\\.", -1).length);
        assertTrue(api.getGuia("G1", token).contains("LECTOR"));
    }

    @Test
    void usuarioSinRolAdminRecibe403() throws Exception {
        String lector = api.login("ana", "clave");
        ApiException e = assertThrows(ApiException.class, () -> api.getAdmin(lector));
        assertEquals(403, e.status());
        assertTrue(api.getAdmin(api.login("root", "clave")).contains("ADMIN"));
    }

    @Test
    void tokenManipuladoRecibe401() throws Exception {
        String token = api.login("ana", "clave");
        String manipulado = token.substring(0, token.length() - 1)
                + (token.endsWith("A") ? "B" : "A");
        ApiException e = assertThrows(ApiException.class, () -> api.getGuia("G1", manipulado));
        assertEquals(401, e.status());
    }

    @Test
    void idInvalidoSeRechazaAntesDeLlamar() {
        assertThrows(IllegalArgumentException.class, () -> ApiCliente.validarId("../admin"));
    }

    @Test
    void redirectNoSeSigue() throws Exception {
        ApiCliente.Respuesta r = api.getSinRedirect("/redirect");
        assertEquals(302, r.status());
        assertEquals("/guias/G1", r.location());
    }

    @Test
    void reintentoAcotadoLlegaARespuesta() throws Exception {
        String token = api.login("ana", "clave");
        servidor.reiniciarFallos();
        assertTrue(api.getConReintento("/falla", token, 3).contains("ok"));
        assertEquals(3, servidor.llamadasFalla());
    }

    @Test
    void socketsTcpYUdpResponden() throws Exception {
        String salida = SocketsDemo.demo();
        assertTrue(salida.contains("TCP=p->P/server=P"), salida);
        assertTrue(salida.contains("UDP=q"), salida);
    }

    @Test
    void cryptoRoundtripYManipulacionDetectada() {
        byte[] key = CryptoUtil.randomBytes(32);
        byte[] iv = CryptoUtil.randomBytes(12);
        byte[] c = CryptoUtil.aesGcmEncrypt(key, iv, "hola".getBytes(StandardCharsets.UTF_8));
        assertEquals("hola", new String(CryptoUtil.aesGcmDecrypt(key, iv, c), StandardCharsets.UTF_8));
        c[c.length - 1] ^= 1;
        assertThrows(IllegalStateException.class, () -> CryptoUtil.aesGcmDecrypt(key, iv, c));
        assertEquals(64, CryptoUtil.sha256Hex("x").length());
        assertEquals(64, CryptoUtil.hmacSha256Hex(key, "msg").length());
    }
}
```

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m18` (macOS arm64, JDK 27.0.1.0.2 con toolchain Java 25, Gradle 9.9.1):

```bash
./gradlew -q test
./gradlew -q run
```

`./gradlew -q test`: **8 tests, 0 fallas** (`build/test-results/test/TEST-com.aurora.httpsec.HttpSecTest.xml`).

Salida real de `./gradlew -q run`:

```text
LOGIN=3
GUIA={"id":"G1","estado":"ENTREGADA","rol":"LECTOR"}
SIN_ROL=403
ADMIN=ADMIN:OK
TOKEN_INVALIDO=401
SIN_REDIRECT=302:/guias/G1
REINTENTO={"ok":true}:llamadas=3
SOCKETS=TCP=p->P/server=P,UDP=q
SHA256=e9de098c7733
AES=secreto
HMAC=17e8847a8463
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| La app se cuelga esperando respuesta | Sin timeout | Hilos bloqueados, thread dump | `connectTimeout` y `request.timeout(...)` |
| 401 tratado como éxito | No validar status | Revisar parsing/respuesta | Switch por status, errores explícitos |
| Token manipulado aceptado | Firma no verificada o comparación insegura | Cambiar un carácter del JWT | Recalcular HMAC y comparar con `MessageDigest.isEqual` |
| Usuario sin permiso recibe 200 | Falta filtro de rol en el endpoint | Revisar claims y handler | Comparar `rol` del token y responder `403` |
| Credencial enviada a otro host tras 302 | Redirect automático; el JDK 25 quita `Authorization` entre orígenes, pero no cabeceras propias como `X-Api-Key` | Inspeccionar `Location` y headers | `followRedirects(NEVER)` y revisar destino |
| Reintento duplica cobros | Reintentar POST no idempotente | Revisar método y código status | Reintentar solo GET/PUT idempotente ante 503 con backoff |
| `AEADBadTagException` | Clave/IV/ciphertext alterados o IV reutilizado | Revisar manejo de IV y almacenamiento | IV único por cifrado, clave correcta |
| Contraseñas con SHA-256 | Confundir hash rápido con password hashing | Revisar esquema de auth | bcrypt/Argon2/PBKDF2 con salt y costo |

## Checklist de cierre

- [ ] El cliente HTTP tiene timeout, política de redirect y manejo explícito de status.
- [ ] La entrada se valida antes de llamar al servicio; el reintento es acotado e idempotente.
- [ ] El flujo JWT emite, firma, valida caducidad y distingue 401 de 403.
- [ ] Los tokens no se exponen en logs ni se envían sin control.
- [ ] Uso JCA para hash/HMAC/cifrado, sin inventar algoritmos.
- [ ] Probé TCP, UDP y el flujo HTTP completo con servidor local y tests.

Siguiente paso natural: **Módulo 19 — reflexión, regex, dinero, contratos, plugins e i18n**, donde el foco vuelve a APIs estándar del JDK que suelen usarse mal cuando no se entienden sus límites.
