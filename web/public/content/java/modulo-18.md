# Módulo 18: HTTP, seguridad y backend con Java

**Proyecto del módulo:** cada tema comienza en una carpeta vacía. Crearás manualmente los archivos indicados y los compilarás con las herramientas del JDK; no necesitas copiar código ni proyectos del repositorio de la academia.

## Aprende construyendo

Java estándar incluye un cliente HTTP moderno, pero un cliente seguro no equivale a un servidor seguro. Construirás una llamada saliente acotada y comprobarás cómo transportar credenciales sin confundir autenticación con autorización.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** consulta un `/health` local con `HttpClient`, límite de conexión y límite total; observa 200, 404 y timeout.
- **Caso RutaFlow:** consulta un proveedor de geocodificación con host permitido, TLS, `X-Correlation-ID` y presupuesto total de tiempo. Un 503 puede reintentarse con backoff y jitter; un POST de liquidación no se reintenta sin una clave idempotente.

La comprobación debe incluir timeout, límite de intentos, respuesta inválida y rechazo de destino no permitido. La autenticación del proveedor no autoriza por sí sola a un usuario de RutaFlow para consultar el envío de otro tenant.

### Tema 1: HttpClient, REST, timeouts y fallos · Intermedio · 2 h

#### Aprende

**Prerrequisitos:** JDK 27 o superior, dos terminales y conocimientos básicos de excepciones. Comprueba `java -version` y `javac -version`.

**Al terminar podrás:** escribir y ejecutar un GET con `HttpClient`, timeout de conexión y de solicitud, validación del estado y separación entre transporte y cuerpo; producirás y diagnosticarás respuestas 200, 404 y timeout.

**Por qué importa:** el servicio de envíos consulta una API externa para validar direcciones. Si esa API no responde, los hilos pueden quedar ocupados y acumular solicitudes. Un timeout protege tu capacidad, pero no garantiza que el otro sistema no haya procesado la operación.

`HttpClient` reutilizable administra conexiones; `HttpRequest` define destino, método, headers y timeout; `HttpResponse` contiene estado y cuerpo. Reintenta únicamente fallos transitorios de operaciones idempotentes, con límite, espera creciente y jitter. No reintentes automáticamente un POST que podría haber sido aplicado aunque su respuesta se perdiera.

**Analogía:** el timeout es el tiempo máximo que mantienes abierta una llamada telefónica. Colgar evita esperar para siempre, pero no demuestra que la otra oficina no haya anotado el pedido.

Comienza en una carpeta vacía y crea los directorios de trabajo:

```bash
mkdir java-http-acotado
cd java-http-acotado
mkdir src
```

Crea manualmente `src/ServidorSalud.java`:

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class ServidorSalud {
    public static void main(String[] args) throws IOException {
        HttpServer servidor = HttpServer.create(new InetSocketAddress(8080), 0);
        servidor.createContext("/health", intercambio ->
            responder(intercambio, 200, "{\"estado\":\"ok\"}"));
        servidor.createContext("/missing", intercambio ->
            responder(intercambio, 404, "{\"error\":\"no existe\"}"));
        servidor.createContext("/slow", intercambio -> {
            try {
                Thread.sleep(5_000);
                responder(intercambio, 200, "{\"estado\":\"tarde\"}");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        servidor.start();
        System.out.println("Servidor en http://localhost:8080");
    }

    private static void responder(HttpExchange intercambio, int estado, String cuerpo)
            throws IOException {
        byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
        intercambio.getResponseHeaders().set("Content-Type", "application/json");
        intercambio.sendResponseHeaders(estado, bytes.length);
        try (var salida = intercambio.getResponseBody()) {
            salida.write(bytes);
        }
    }
}
```

Crea manualmente `src/ConsultaDireccion.java`:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;

public final class ConsultaDireccion {
    private static final HttpClient CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(2))
        .followRedirects(HttpClient.Redirect.NEVER)
        .build();

    static String consultar(URI uri) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(1))
            .header("Accept", "application/json")
            .GET()
            .build();
        HttpResponse<String> response =
            CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("API respondió HTTP " + response.statusCode());
        }
        return response.body();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("health: " + consultar(URI.create("http://localhost:8080/health")));
        try {
            consultar(URI.create("http://localhost:8080/missing"));
        } catch (IllegalStateException e) {
            System.out.println("missing: " + e.getMessage());
        }
        try {
            consultar(URI.create("http://localhost:8080/slow"));
        } catch (HttpTimeoutException e) {
            System.out.println("slow: timeout acotado");
        }
    }
}
```

Compila en una terminal:

```bash
javac --add-modules jdk.httpserver -d out src/ServidorSalud.java src/ConsultaDireccion.java
```

En esa misma terminal, inicia el servidor:

```bash
java --add-modules jdk.httpserver -cp out ServidorSalud
```

En la segunda terminal, situada en `java-http-acotado`, ejecuta:

```bash
java -cp out ConsultaDireccion
```

**Resultado esperado en el cliente:**

```text
health: {"estado":"ok"}
missing: API respondió HTTP 404
slow: timeout acotado
```

**Fallo deliberado y corrección:** elimina `.timeout(Duration.ofSeconds(1))`, vuelve a compilar y ejecuta. `/slow` espera unos cinco segundos y devuelve `{"estado":"tarde"}` en lugar de lanzar timeout. El límite de conexión no limita toda la respuesta. Restaura el timeout de la solicitud, recompila y comprueba de nuevo `slow: timeout acotado`.

#### Practica

**Práctica guiada:** crea `src/ClienteReintentos.java`, reutilizando únicamente lo que acabas de escribir en este tema. Clasifica 4xx como errores no reintentables y 502/503/504 como transitorios. Implementa como máximo dos intentos solo para GET, con backoff creciente y jitter. Añade al servidor una ruta que devuelva 503 la primera vez y 200 la segunda, y otra que devuelva siempre 400; registra el número de llamadas por ruta.

```bash
javac --add-modules jdk.httpserver -d out src/*.java
java --add-modules jdk.httpserver -cp out ServidorSalud
# En la otra terminal:
java -cp out ClienteReintentos
```

**Resultado esperado:** la ruta transitoria recibe exactamente dos llamadas y termina en 200; la ruta 400 recibe una sola. Un POST simulado no se reintenta aunque reciba 503.

**Ejercicio independiente:** crea `src/ClienteGeocodificacion.java` y `src/Ubicacion.java`. Consume una respuesta JSON de laboratorio con un DTO validado, `X-Correlation-ID`, allowlist de hosts y límite de bytes antes de convertir el cuerpo a `String`. No aceptes URLs arbitrarias del usuario ni reintentes POST sin idempotencia. Ejecuta casos de host rechazado, cuerpo excesivo, JSON inválido y 503.

**Resultado esperado:** cada caso termina con un diagnóstico distinto, el conteo de intentos no supera dos y ningún destino fuera de la allowlist abre una conexión.

#### Aplica

Lleva el cliente al **[Proyecto integrador: proveedor externo de RutaFlow](#proyecto-18-cliente-http-seguro-para-rutaflow)**. La consulta de geocodificación debe tener timeout, correlación, allowlist y reintentos solo para GET; la liquidación POST debe permanecer sin reintento automático.

**Checklist de salida**

- [ ] Creaste los archivos manualmente en una carpeta inicialmente vacía.
- [ ] `HttpClient` limita tanto la conexión como la solicitud completa.
- [ ] 200, 404 y timeout producen resultados observables y diferentes.
- [ ] Los reintentos se limitan a GET y a 502/503/504, con máximo dos intentos.
- [ ] Un cuerpo grande o un host no permitido se rechaza antes de procesarlo.
- [ ] Puedes explicar por qué un timeout no vuelve seguro reintentar un POST.

**Errores comunes:** omitir timeout, cargar respuestas sin límite en memoria y reintentar operaciones no idempotentes. Para cuerpos grandes usa un `BodyHandler` de streaming con una política de tamaño.

**Fuentes oficiales revisadas el 2026-11-01:** [`HttpClient` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpClient.html) y [`HttpServer` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html).

### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 2 h

#### Aprende

**Prerrequisitos:** fundamentos de HTTP y excepciones. No necesitas archivos del tema anterior ni ninguna credencial real.

**Al terminar podrás:** construir un cliente y un servidor locales que transporten un bearer sin registrarlo, validar entrada no confiable y demostrar que una identidad autenticada puede recibir 403 al pedir un recurso de otro tenant.

**Por qué importa:** un token válido confirma una identidad, pero no demuestra que ese usuario pueda leer cualquier envío. TLS, autenticación y autorización por objeto resuelven amenazas diferentes.

JWT es un formato de claims firmado, no necesariamente cifrado. OAuth 2.0 es un marco de autorización y OpenID Connect añade identidad. En producción, un servidor valida firma, emisor, audiencia, expiración y permisos con componentes confiables; este laboratorio usa un token fijo exclusivamente para hacer visible el header, no para enseñar criptografía propia.

Valida longitud, formato, rangos y reglas de negocio en cada frontera. Las consultas parametrizadas evitan inyección SQL, pero no reemplazan autorización por objeto. Contra SSRF, valida esquema y host, resuelve DNS y bloquea rangos privados o no enrutables también al conectar; una expresión regular sobre la URL no basta.

**Analogía:** un token es la pulsera de un festival. Revisar autenticidad y caducidad demuestra que puedes entrar; la pulsera de zona general sigue sin abrir el backstage.

Empieza en otra carpeta vacía:

```bash
mkdir java-bearer-autorizacion
cd java-bearer-autorizacion
mkdir src
```

Crea manualmente `src/ServidorEnvios.java`:

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class ServidorEnvios {
    public static void main(String[] args) throws IOException {
        HttpServer servidor = HttpServer.create(new InetSocketAddress(8081), 0);
        servidor.createContext("/envios/", ServidorEnvios::consultar);
        servidor.start();
        System.out.println("Servidor de laboratorio en http://localhost:8081");
    }

    private static void consultar(HttpExchange intercambio) throws IOException {
        String autorizacion = intercambio.getRequestHeaders().getFirst("Authorization");
        if (!"Bearer token-de-prueba".equals(autorizacion)) {
            responder(intercambio, 401, "credencial ausente o inválida");
            return;
        }
        String guia = intercambio.getRequestURI().getPath().substring("/envios/".length());
        if (!guia.matches("ENV-[0-9]+")) {
            responder(intercambio, 400, "guía inválida");
            return;
        }
        String tenantDelUsuario = intercambio.getRequestHeaders().getFirst("X-Tenant");
        String tenantDelRecurso = "A";
        if (!tenantDelRecurso.equals(tenantDelUsuario)) {
            responder(intercambio, 403, "el envío pertenece a otro tenant");
            return;
        }
        responder(intercambio, 200, "guía=" + guia + ", destino=Cali");
    }

    private static void responder(HttpExchange intercambio, int estado, String cuerpo)
            throws IOException {
        byte[] bytes = cuerpo.getBytes(StandardCharsets.UTF_8);
        intercambio.sendResponseHeaders(estado, bytes.length);
        try (var salida = intercambio.getResponseBody()) {
            salida.write(bytes);
        }
    }
}
```

Crea manualmente `src/ClienteAutenticado.java`:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

public final class ClienteAutenticado {
    public static void main(String[] args) throws Exception {
        String token = System.getenv("ACADEMIA_API_TOKEN");
        if (token == null || token.isBlank() || token.length() > 2048
                || token.chars().anyMatch(Character::isWhitespace)) {
            throw new IllegalArgumentException("ACADEMIA_API_TOKEN ausente o inválido");
        }
        String tenant = args.length == 1 ? args[0] : "A";
        URI uri = URI.create("http://localhost:8081/envios/ENV-1");
        HttpClient cliente = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();
        HttpRequest request = HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(2))
            .header("Authorization", "Bearer " + token)
            .header("X-Tenant", tenant)
            .header("X-Correlation-ID", UUID.randomUUID().toString())
            .GET()
            .build();
        HttpResponse<String> response =
            cliente.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("tenant=" + tenant + ", HTTP " + response.statusCode()
            + ": " + response.body());
    }
}
```

El HTTP plano está permitido aquí únicamente porque cliente y servidor son locales y el token es ficticio. Fuera de loopback exige HTTPS y un proveedor de identidad real.

Compila y arranca el servidor en una terminal:

```bash
javac --add-modules jdk.httpserver -d out src/*.java
java --add-modules jdk.httpserver -cp out ServidorEnvios
```

En otra terminal de la misma carpeta, ejecuta las dos consultas:

```bash
ACADEMIA_API_TOKEN=token-de-prueba java -cp out ClienteAutenticado A
ACADEMIA_API_TOKEN=token-de-prueba java -cp out ClienteAutenticado B
```

En PowerShell, asigna primero `$env:ACADEMIA_API_TOKEN="token-de-prueba"` y ejecuta después los mismos comandos `java`.

**Resultado esperado:**

```text
tenant=A, HTTP 200: guía=ENV-1, destino=Cali
tenant=B, HTTP 403: el envío pertenece a otro tenant
```

**Fallo deliberado y corrección:** sustituye temporalmente la comprobación de tenant por `if (false)`. La misma credencial obtiene 200 para el tenant B: la autenticación sigue funcionando, pero la autorización por objeto desapareció. Restaura `if (!tenantDelRecurso.equals(tenantDelUsuario))`, recompila y confirma el 403. Añadir después un log del header completo sería otro fallo: expone el secreto; no lo hagas con credenciales reales.

#### Practica

**Práctica guiada:** crea `src/ValidadorSolicitud.java` con un `main` que pruebe tokens vacíos, de más de 2048 caracteres, con espacios y guías con formato incorrecto. Añade `src/PoliticaDestino.java`: resuelve con `InetAddress.getAllByName` cada host configurado y rechaza direcciones loopback, link-local, site-local, multicast o no enrutables cuando el destino sea externo. No uses una regex de nombres como sustituto de DNS.

```bash
javac -d out src/ValidadorSolicitud.java src/PoliticaDestino.java
java -cp out ValidadorSolicitud
java -cp out PoliticaDestino
```

**Resultado esperado:** cada entrada inválida se rechaza antes de construir un request; un hostname que resuelve a una dirección prohibida se rechaza aunque su texto parezca legítimo.

**Ejercicio independiente:** crea `src/PruebasAcceso.java` con una matriz para `envio:leer`, `envio:asignar` y `envio:liquidar`, usuarios de dos tenants y un token de prueba expirado. Escribe un ejecutable sin frameworks que compruebe permitido/denegado y explique en su salida qué regla decidió. Incluye casos de audiencia incorrecta y propiedad correcta sin permiso suficiente.

**Resultado esperado:** la matriz distingue 401 de identidad inválida o expirada y 403 de identidad válida sin permiso o sin propiedad; no imprime tokens.

#### Aplica

Completa el **[Proyecto integrador: autorización por envío de RutaFlow](#proyecto-18-cliente-http-seguro-para-rutaflow)**. Cada consulta debe validar credencial, permiso y tenant del recurso; los destinos de proveedores deben pasar una política SSRF y ningún log puede contener el bearer.

**Checklist de salida**

- [ ] El laboratorio se construyó desde una carpeta vacía y usa solo un token ficticio.
- [ ] El bearer viaja en `Authorization` y nunca aparece en la salida.
- [ ] Una credencial válida para el tenant equivocado recibe 403.
- [ ] Tokens y guías inválidos se rechazan antes de llamar al servidor.
- [ ] La política de destino evalúa las IP resueltas, no solo el texto de la URL.
- [ ] Puedes distinguir TLS, autenticación, audiencia/expiración y autorización por objeto.

**Errores comunes:** guardar secretos en código, registrar tokens, confundir JWT con cifrado y tratar autenticación como permiso universal. No guardes contraseñas en JWT ni uses un token como sustituto automático de un diseño de revocación.

**Fuentes oficiales revisadas el 2026-11-01:** [`HttpClient` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.net.http/java/net/http/HttpClient.html), [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/), [OAuth 2.0](https://oauth.net/2/) y [OpenID Connect](https://openid.net/developers/how-connect-works/).

### Tema 3: Sockets TCP y UDP — la red que hay debajo de HttpClient · Avanzado · 2 h

#### Aprende

**Prerrequisitos:** Temas 1–2 de este módulo, excepciones y try-with-resources; JDK 27 o superior y dos terminales. Comprueba `java -version` y `javac -version`.

**Al terminar podrás:** abrir un servidor TCP con `ServerSocket`, conectar un cliente con `Socket`, intercambiar líneas por los streams, enviar y recibir datagramas UDP con `DatagramSocket`, aplicar timeouts de lectura, y explicar por qué HTTP se apoya en TCP y el tracking en tiempo real puede usar UDP.

**Por qué importa:** `HttpClient` (Tema 1) es cómodo, pero esconde la red. RutaFlow rastrea vehículos en tiempo real: entender el socket que hay debajo permite decidir entre una conexión fiable y ordenada (TCP) y un envío ligero sin garantía de entrega (UDP), diagnosticar un puerto ocupado o un cliente que no cierra, y aplicar timeouts para no colgar un hilo indefinidamente.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| modelo cliente/servidor y puertos | Prerrequisito | un servidor escucha en un puerto; el cliente conecta a host:puerto |
| `ServerSocket` y `accept()` | Núcleo | `accept()` bloquea hasta que llega una conexión |
| `Socket` y los streams de I/O | Núcleo | leer/escribir líneas por `getInputStream`/`getOutputStream` |
| TCP: fiable, ordenado, orientado a conexión | Núcleo | el eco llega íntegro y en orden |
| UDP: `DatagramSocket` y `DatagramPacket` | Variante | datagrama sin conexión ni garantía de entrega |
| TCP frente a UDP (decisión) | Decisión | fiabilidad frente a latencia/overhead |
| timeouts de socket (`setSoTimeout`) | Diagnóstico | una lectura sin datos lanza `SocketTimeoutException` |
| cierre de recursos y puerto ocupado | Límite | no cerrar deja el puerto o la conexión colgados |
| un cliente por hilo frente a virtual threads | Decisión | `accept()` en bucle; un virtual thread por conexión |

Cada fila tiene su explicación individual a continuación.

**Modelo cliente/servidor y puertos (prerrequisito).** Un **servidor** se queda escuchando en un **puerto** (un número de 0 a 65535) de una interfaz de red; un **cliente** inicia la comunicación conectándose a `host:puerto`. El puerto 0 pide al sistema uno **efímero** libre (útil en pruebas). Dos procesos no pueden escuchar el mismo puerto a la vez.

**`ServerSocket` y `accept()` (núcleo).** `new ServerSocket(puerto)` abre el punto de escucha. `server.accept()` **bloquea** el hilo hasta que un cliente se conecta y entonces devuelve un `Socket` ya conectado a ese cliente. Un servidor real llama `accept()` en un bucle para atender muchas conexiones.

**`Socket` y los streams de I/O (núcleo).** Un `Socket` conectado expone `getInputStream()` y `getOutputStream()`: la red se lee y escribe como cualquier flujo de bytes. Para texto se envuelven en `BufferedReader`/`PrintWriter` con un **charset explícito** (`UTF_8`); así `readLine()`/`println()` intercambian líneas. Define siempre el charset: el por defecto de la plataforma causa bugs entre máquinas.

**TCP: fiable, ordenado, orientado a conexión (núcleo).** TCP establece una conexión y garantiza que los bytes llegan **completos, sin duplicados y en orden**, retransmitiendo lo que se pierde. Por eso HTTP, bases de datos y la mayoría de protocolos de aplicación van sobre TCP. El coste: el establecimiento de conexión (handshake) y el control de flujo añaden latencia y overhead.

**UDP: `DatagramSocket` y `DatagramPacket` (variante).** UDP envía **datagramas** sueltos sin conexión previa: `DatagramSocket` para enviar/recibir y `DatagramPacket` para empaquetar los bytes con destino `host:puerto`. **No garantiza** entrega, orden ni unicidad: un datagrama puede perderse, llegar duplicado o desordenado. A cambio es ligero y de baja latencia.

**TCP frente a UDP (decisión).** Usa **TCP** cuando no puedes perder ni desordenar datos (una liquidación, un pedido): la fiabilidad es obligatoria. Usa **UDP** cuando prefieres velocidad y toleras pérdidas (telemetría de posición GPS que se actualiza constantemente: si se pierde un ping, el siguiente lo corrige). La decisión no es "cuál es mejor", sino qué garantiza el dominio.

**Timeouts de socket (diagnóstico).** `socket.setSoTimeout(ms)` limita cuánto bloquea una **lectura**: si no llegan datos en ese plazo, lanza `SocketTimeoutException` en vez de colgar el hilo para siempre. Es imprescindible en red real, donde el otro extremo puede no responder nunca. Sin timeout, un `accept()`/`read()`/`receive()` bloquea indefinidamente.

**Cierre de recursos y puerto ocupado (límite).** Los sockets son recursos del sistema: ciérralos con try-with-resources (`Socket`, `ServerSocket` y `DatagramSocket` son `AutoCloseable`). No cerrar deja conexiones y puertos ocupados; reintentar `new ServerSocket(mismoPuerto)` sin liberar el anterior da `BindException: Address already in use`.

**Un cliente por hilo frente a virtual threads (decisión).** El patrón clásico es: `accept()` en bucle y atender cada conexión en su propio hilo para no bloquear a los demás. Con **virtual threads** (Módulo 5) puedes lanzar un hilo por conexión de forma barata (`Thread.ofVirtual().start(...)` o un executor de virtual threads), ideal para muchas conexiones de I/O bloqueante sin agotar hilos de plataforma.

**Analogía (con su límite):** TCP es una llamada telefónica (estableces la línea, hablas en orden y sabes si se cortó); UDP es echar postales al buzón (van ligeras, pero alguna puede perderse o llegar desordenada). La analogía explica la fiabilidad; no explica puertos, timeouts ni el manejo de streams, que son mecanismos concretos del socket.

Comienza en una carpeta vacía:

```bash
mkdir java-sockets
cd java-sockets
mkdir src
```

Crea manualmente `src/DemoSockets.java` (servidor y cliente en el mismo programa para una demostración autocontenida; en un caso real irían en procesos separados):

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class DemoSockets {
    public static void main(String[] args) throws Exception {
        // ---- TCP: servidor eco en un virtual thread, cliente en el main ----
        ServerSocket server = new ServerSocket(0);           // puerto efímero libre
        int puertoTcp = server.getLocalPort();
        Thread servidor = Thread.ofVirtual().start(() -> {
            try (Socket cliente = server.accept();            // bloquea hasta conexión
                 var in = new BufferedReader(new InputStreamReader(cliente.getInputStream(), StandardCharsets.UTF_8));
                 var out = new PrintWriter(new OutputStreamWriter(cliente.getOutputStream(), StandardCharsets.UTF_8), true)) {
                out.println("ECO:" + in.readLine());
            } catch (IOException e) { throw new UncheckedIOException(e); }
        });
        try (Socket s = new Socket("localhost", puertoTcp);
             var out = new PrintWriter(new OutputStreamWriter(s.getOutputStream(), StandardCharsets.UTF_8), true);
             var in = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8))) {
            out.println("GUIA ENV-1");
            System.out.println("TCP respuesta=" + in.readLine());
        }
        servidor.join();
        server.close();

        // ---- UDP: datagrama sin conexión (telemetría ligera) ----
        DatagramSocket receptor = new DatagramSocket(0);
        int puertoUdp = receptor.getLocalPort();
        Thread rx = Thread.ofVirtual().start(() -> {
            try {
                byte[] buf = new byte[256];
                DatagramPacket p = new DatagramPacket(buf, buf.length);
                receptor.receive(p);                          // bloquea hasta datagrama
                System.out.println("UDP recibido=" + new String(p.getData(), 0, p.getLength(), StandardCharsets.UTF_8));
            } catch (IOException e) { throw new UncheckedIOException(e); }
        });
        try (DatagramSocket emisor = new DatagramSocket()) {
            byte[] datos = "ping-gps".getBytes(StandardCharsets.UTF_8);
            emisor.send(new DatagramPacket(datos, datos.length, InetAddress.getLoopbackAddress(), puertoUdp));
        }
        rx.join();
        receptor.close();

        // ---- timeout de lectura ----
        try (DatagramSocket conTimeout = new DatagramSocket()) {
            conTimeout.setSoTimeout(300);                     // ms
            try { conTimeout.receive(new DatagramPacket(new byte[16], 16)); }
            catch (SocketTimeoutException e) { System.out.println("UDP timeout: SocketTimeoutException"); }
        }
    }
}
```

Compila y ejecuta:

```bash
javac -d out src/DemoSockets.java
java -cp out DemoSockets
```

**Resultado esperado (verificado con Temurin 27.0.1):**

```text
TCP respuesta=ECO:GUIA ENV-1
UDP recibido=ping-gps
UDP timeout: SocketTimeoutException
```

Léelo subtema por subtema: el servidor TCP esperó en `accept()`, recibió la línea íntegra y respondió el eco (fiable y ordenado); el datagrama UDP llegó sin conexión previa (`ping-gps`); y un `receive()` con `setSoTimeout(300)` sin datos lanzó `SocketTimeoutException` en vez de colgar.

**Fallo deliberado — puerto ocupado:** abre dos `ServerSocket` en el **mismo** puerto fijo (por ejemplo `new ServerSocket(9099)` dos veces sin cerrar el primero). El segundo lanza:

```text
java.net.BindException: Address already in use
```

Es el diagnóstico típico de "el servidor ya está corriendo" o "no cerré el anterior". Ciérralo con try-with-resources o usa el puerto 0 para uno efímero.

#### Practica

**Práctica guiada:** convierte el servidor TCP en uno que atienda **varias** conexiones: pon `accept()` en un bucle y atiende cada `Socket` en su propio virtual thread (`Thread.ofVirtual().start(...)`). Lanza tres clientes que envíen líneas distintas y comprueba que las tres reciben su eco sin bloquearse entre sí. Añade `setSoTimeout` al socket del cliente y provoca un timeout conectando a un servidor que no responde.

**Ejercicio independiente:** implementa un **receptor UDP de telemetría GPS** para RutaFlow: un `DatagramSocket` que reciba en bucle datagramas `vehiculoId;lat;lon`, los valide (formato y rangos de coordenadas) y descarte los malformados sin caerse. Un emisor envía 10 datagramas, uno de ellos corrupto. Confirma que el receptor procesa los válidos e ignora el corrupto, y explica por qué con UDP debes tolerar pérdidas y datagramas fuera de orden en vez de asumir que todos llegan.

#### Aplica

Integra ambos en el **[Proyecto integrador de RutaFlow](#proyecto-18-cliente-http-seguro-para-rutaflow)**: justifica por qué la liquidación y la consulta de envíos van sobre TCP/HTTP (no pueden perderse) y por qué el flujo de posiciones de los vehículos puede ir sobre UDP (tolera pérdidas, prioriza latencia). Documenta los timeouts de cada socket.

**Checklist de salida**

- [ ] `DemoSockets.java` imprime el eco TCP, el datagrama UDP y el timeout.
- [ ] El servidor TCP usa `accept()` y atiende al cliente por los streams con charset explícito.
- [ ] El eco TCP llega íntegro y en orden; el datagrama UDP llega sin conexión previa.
- [ ] `setSoTimeout` provoca `SocketTimeoutException` ante una lectura sin datos.
- [ ] Reusar un puerto ocupado produce `BindException: Address already in use`.
- [ ] Justificas TCP para datos que no pueden perderse y UDP para telemetría tolerante a pérdidas.

**Errores comunes:** olvidar el charset explícito en los streams (bugs entre plataformas); no cerrar sockets (puertos y conexiones colgados); no poner timeout (hilos bloqueados para siempre); asumir que UDP garantiza entrega u orden; y usar un hilo de plataforma por conexión cuando hay muchas conexiones de I/O (usa virtual threads).

**Fuentes oficiales revisadas el 2026-11-01:** [`Socket` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/net/Socket.html), [`ServerSocket` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/net/ServerSocket.html) y [`DatagramSocket` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/net/DatagramSocket.html).

### Tema 4: Seguridad defensiva — hash, HMAC, firma y cifrado · Avanzado · 2 h 30 min

#### Aprende

**Prerrequisitos:** Temas 1–3 de este módulo, arreglos de bytes y excepciones; JDK 27 o superior. Comprueba `java -version`. Enfoque **defensivo y autorizado**: proteger datos propios, nunca atacar sistemas de terceros ni implementar criptografía casera en producción.

**Al terminar podrás:** calcular un hash con `MessageDigest`, autenticar un mensaje con `Mac` (HMAC), firmar y verificar con un par de claves (`Signature`), cifrar y descifrar con AES-GCM (`Cipher`), y decidir cuál usar según necesites integridad, autenticidad, no repudio o confidencialidad.

**Por qué importa:** RutaFlow transporta liquidaciones y datos personales. Confundir "hash" con "cifrado", o usar hash para contraseñas, o un IV repetido en cifrado, son errores que comprometen datos reales. Las APIs del JDK (`java.security`, `javax.crypto`) implementan primitivas probadas; tu trabajo es **elegirlas y combinarlas bien**, no reinventarlas.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| hash criptográfico (`MessageDigest`) | Núcleo | SHA-256 determinista y de una vía |
| comparación en tiempo constante | Diagnóstico | `MessageDigest.isEqual` frente a `==`/`equals` |
| hash NO sirve para contraseñas | Límite | contraseñas: Argon2/bcrypt con sal, no SHA directo |
| HMAC (`Mac`) | Variante | integridad + autenticidad con clave compartida |
| firma digital (`Signature`, par de claves) | Núcleo | no repudio; se verifica con la clave pública |
| cifrado simétrico AES-GCM (`Cipher`) | Núcleo | confidencialidad + detección de manipulación |
| IV/nonce único y gestión de claves | Diagnóstico | reusar IV o hardcodear clave rompe el cifrado |
| hash vs HMAC vs firma vs cifrado | Decisión | qué propiedad resuelve cada uno |

Cada fila tiene su explicación individual a continuación.

**Hash criptográfico (núcleo).** `MessageDigest.getInstance("SHA-256").digest(bytes)` produce un resumen de tamaño fijo (32 bytes) de cualquier entrada. Es **determinista** (misma entrada → mismo hash) y de **una sola vía** (no se puede revertir al original). Sirve para **integridad**: comprobar que unos datos no cambiaron. No uses MD5 ni SHA-1, rotos para uso criptográfico.

**Comparación en tiempo constante (diagnóstico).** Para comparar dos hashes o tags, usa `MessageDigest.isEqual(a, b)`, **no** `Arrays.equals` ni `==`: `isEqual` compara en **tiempo constante** y evita filtrar información por el tiempo de respuesta (timing attack). Es un detalle pequeño con impacto real en seguridad.

**El hash NO sirve para contraseñas (límite).** Un error grave: guardar `SHA-256(contraseña)`. Los hashes rápidos permiten probar miles de millones por segundo. Para contraseñas se usa un algoritmo **lento y con sal** diseñado a propósito (Argon2, bcrypt, PBKDF2), que el JDK ofrece como `PBKDF2WithHmacSHA256` o librerías dedicadas. El hash simple es para integridad de datos, no para credenciales.

**HMAC (variante).** `Mac.getInstance("HmacSHA256")` con una **clave compartida** produce un tag que prueba a la vez **integridad y autenticidad**: solo quien tiene la clave pudo generarlo. Se usa para verificar que un mensaje viene de quien dice y no fue alterado (webhooks firmados, tokens). A diferencia del hash puro, requiere una clave secreta.

**Firma digital (núcleo).** Con un **par de claves** (privada/pública), `Signature` firma con la **privada** y cualquiera verifica con la **pública**. Aporta **no repudio**: solo el dueño de la privada pudo firmar, y la verificación falla si el mensaje cambió un solo byte. Es la base de JWT firmados, certificados TLS y actualizaciones firmadas.

**Cifrado simétrico AES-GCM (núcleo).** `Cipher.getInstance("AES/GCM/NoPadding")` cifra con una clave AES para lograr **confidencialidad** (nadie sin la clave lee el dato). GCM es un modo **autenticado** (AEAD): además de ocultar, **detecta manipulación** del texto cifrado. Es el modo recomendado hoy; evita modos sin autenticación como ECB (filtra patrones) o CBC sin MAC.

**IV/nonce único y gestión de claves (diagnóstico).** AES-GCM necesita un **IV (nonce)** que debe ser **único por cada cifrado con la misma clave** (genéralo con `SecureRandom`); reutilizar un IV rompe la seguridad de GCM por completo. Y la **clave nunca se hardcodea** en el código ni se mete en el repositorio: va en un gestor de secretos o variable de entorno protegida. El IV sí puede viajar junto al texto cifrado (no es secreto), pero no repetirse.

**Hash vs HMAC vs firma vs cifrado (decisión).** Cada primitiva resuelve una propiedad distinta: **hash** = integridad (¿cambió?); **HMAC** = integridad + autenticidad con secreto compartido; **firma** = integridad + autenticidad + no repudio con clave pública; **cifrado** = confidencialidad (+ integridad en GCM). Elegir la equivocada (cifrar cuando querías firmar, hashear una contraseña) es el error de diseño más común.

**Analogía (con su límite):** el hash es el precinto de un paquete (si está roto, alguien lo abrió); la firma es la firma notariada (demuestra quién la hizo); el cifrado es la caja fuerte (nadie ve el contenido sin la llave). La analogía ayuda a elegir; no explica el IV único, el tiempo constante ni por qué el hash no vale para contraseñas, que son reglas concretas del uso correcto.

Comienza en una carpeta vacía:

```bash
mkdir java-seguridad
cd java-seguridad
mkdir src
```

Crea manualmente `src/DemoSeguridad.java`:

```java
import java.security.*;
import javax.crypto.*;
import javax.crypto.spec.*;

public class DemoSeguridad {
    public static void main(String[] args) throws Exception {
        byte[] msg = "guia ENV-1".getBytes();

        // 1) hash SHA-256: integridad (determinista, de una vía)
        byte[] h = MessageDigest.getInstance("SHA-256").digest(msg);
        System.out.println("sha256(len)=" + h.length);
        boolean igual = MessageDigest.isEqual(h, MessageDigest.getInstance("SHA-256").digest(msg));
        System.out.println("hash determinista=" + igual);   // comparación en tiempo constante

        // 2) HMAC: integridad + autenticidad con clave compartida
        SecretKey macKey = KeyGenerator.getInstance("HmacSHA256").generateKey();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(macKey);
        System.out.println("hmac(len)=" + mac.doFinal(msg).length);

        // 3) firma digital: no repudio con par de claves
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(256);
        KeyPair par = kpg.generateKeyPair();
        Signature firmar = Signature.getInstance("SHA256withECDSA");
        firmar.initSign(par.getPrivate());
        firmar.update(msg);
        byte[] firma = firmar.sign();
        Signature verificar = Signature.getInstance("SHA256withECDSA");
        verificar.initVerify(par.getPublic());
        verificar.update(msg);
        System.out.println("firma valida=" + verificar.verify(firma));
        Signature v2 = Signature.getInstance("SHA256withECDSA");
        v2.initVerify(par.getPublic());
        v2.update("guia ENV-2".getBytes());                  // mensaje alterado
        System.out.println("firma de msg alterado=" + v2.verify(firma));

        // 4) cifrado AES-GCM: confidencialidad + detección de manipulación
        KeyGenerator aesKg = KeyGenerator.getInstance("AES");
        aesKg.init(256);
        SecretKey aesKey = aesKg.generateKey();
        byte[] iv = new byte[12];
        SecureRandom.getInstanceStrong().nextBytes(iv);      // IV único por cifrado
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, aesKey, new GCMParameterSpec(128, iv));
        byte[] cifrado = c.doFinal(msg);
        Cipher d = Cipher.getInstance("AES/GCM/NoPadding");
        d.init(Cipher.DECRYPT_MODE, aesKey, new GCMParameterSpec(128, iv));
        System.out.println("descifrado=" + new String(d.doFinal(cifrado)));
        cifrado[0] ^= 1;                                     // manipular un byte
        try {
            Cipher d2 = Cipher.getInstance("AES/GCM/NoPadding");
            d2.init(Cipher.DECRYPT_MODE, aesKey, new GCMParameterSpec(128, iv));
            d2.doFinal(cifrado);
        } catch (AEADBadTagException e) {
            System.out.println("GCM detecto manipulacion: AEADBadTagException");
        }
    }
}
```

Nota: la clave AES se genera con `KeyGenerator.getInstance("AES")` inicializado a 256 bits (`init(256)`); no la hardcodees. Compila y ejecuta:

```bash
javac -d out src/DemoSeguridad.java
java -cp out DemoSeguridad
```

**Resultado esperado (verificado con Temurin 27.0.1):**

```text
sha256(len)=32
hash determinista=true
hmac(len)=32
firma valida=true
firma de msg alterado=false
descifrado=guia ENV-1
GCM detecto manipulacion: AEADBadTagException
```

Léelo subtema por subtema: el hash es determinista y de 32 bytes; el HMAC autentica con clave compartida; la firma es **válida con el mensaje original y falsa si cambia un byte** (`firma de msg alterado=false`); y AES-GCM descifra bien pero **detecta la manipulación** de un byte con `AEADBadTagException`.

**Fallo deliberado — IV reutilizado:** cifra **dos** mensajes distintos con la **misma** clave y el **mismo** IV. GCM no lanza error, pero reutilizar el nonce rompe su seguridad (permite recuperar información). El código "funciona" pero es inseguro: por eso el IV debe generarse nuevo con `SecureRandom` en cada cifrado. Es un fallo silencioso que solo la revisión detecta.

#### Practica

**Práctica guiada:** crea `src/VerificadorIntegridad.java` que reciba un archivo, calcule su SHA-256 y lo compare con un hash esperado usando `MessageDigest.isEqual`. Provoca una comparación con `Arrays.equals` y explica por qué `isEqual` (tiempo constante) es preferible para datos sensibles. Después modifica un byte del archivo y confirma que el hash cambia por completo (efecto avalancha).

**Ejercicio independiente:** implementa `src/SobreSeguro.java` para RutaFlow: cifra una liquidación con AES-GCM (IV aleatorio por mensaje, guardado junto al texto cifrado) **y** fírmala con ECDSA. El receptor verifica la firma y descifra; comprueba que una firma inválida o un texto manipulado se rechazan. Explica qué propiedad aporta cada primitiva y por qué cifrar sin firmar deja abierto el repudio.

#### Aplica

En el **[Proyecto integrador de RutaFlow](#proyecto-18-cliente-http-seguro-para-rutaflow)**: protege la liquidación con cifrado AES-GCM y firma ECDSA, verifica la integridad de un artefacto descargado con SHA-256, y documenta de dónde sale cada clave (gestor de secretos / entorno), nunca del código. No implementes tu propio algoritmo criptográfico.

**Checklist de salida**

- [ ] `DemoSeguridad.java` imprime el hash, el HMAC, la firma válida/inválida y el descifrado.
- [ ] La firma falla al cambiar un byte del mensaje (no repudio real).
- [ ] AES-GCM descifra correctamente y lanza `AEADBadTagException` si se manipula el cifrado.
- [ ] Usas `MessageDigest.isEqual` en vez de `==`/`Arrays.equals` para comparar hashes.
- [ ] Generas un IV nuevo con `SecureRandom` en cada cifrado y no hardcodeas claves.
- [ ] Distingues hash (integridad), HMAC (autenticidad compartida), firma (no repudio) y cifrado (confidencialidad).

**Errores comunes:** hashear contraseñas con SHA directo en vez de Argon2/bcrypt/PBKDF2; reutilizar el IV de AES-GCM; comparar hashes con `==`; confundir cifrar con firmar; hardcodear claves en el código o el repositorio; y usar MD5/SHA-1 o AES-ECB. Nunca implementes criptografía propia para producción.

**Fuentes oficiales revisadas el 2026-11-01:** [`MessageDigest` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/security/MessageDigest.html), [`Cipher` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/javax/crypto/Cipher.html), [`Signature` (API Java SE 27)](https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/security/Signature.html) y [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

## Laboratorio del capítulo

### Proyecto 18: cliente HTTP seguro para RutaFlow

Desde una carpeta vacía crea `cliente-rutaflow/` y escribe manualmente un proyecto JDK con un servidor stub y un cliente. No copies los proyectos anteriores: implementa aquí las clases necesarias.

1. Un GET de geocodificación con timeouts, correlación, allowlist y límite de respuesta.
2. Reintentos acotados con backoff y jitter solo para GET y 502/503/504.
3. Un POST de liquidación sin reintento automático.
4. Bearer ficticio cargado por entorno, sin aparición en logs.
5. Autorización por permiso y tenant además de autenticación.
6. Casos ejecutables para 200, 400, 401, 403, 503, timeout, host rechazado y cuerpo excesivo.

**Verificación:** el 400 no se reintenta; el 503 agota como máximo dos intentos; el POST se ejecuta una sola vez; un token válido no cruza tenants; el verificador termina incluso cuando el servidor deja de responder.
