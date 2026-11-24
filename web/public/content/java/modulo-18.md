# Módulo 18: HTTP, seguridad y backend con Java

Un backend Java no solo “hace peticiones HTTP”. Llama servicios que pueden responder tarde, fallar, devolver 401/403, redirigir o entregar datos malformados. Debajo de `HttpClient` hay sockets TCP/UDP, y encima hay credenciales que deben validarse sin loguearse. Sin timeout la app se queda colgada; sin control de redirects un token puede viajar a otro host; sin reintento acotado un 503 transitorio se convierte en error de negocio.

Aquí construirás `tienda-aurora-java-m18`: cliente con `HttpClient`, flujo JWT HS256 firmado con JCA, endpoint con roles que devuelve 403, redirect sin seguir, reintento acotado, sockets TCP/UDP y primitivas `SHA-256`, `HMAC` y `AES-GCM`. Todo se ejecuta contra un `HttpServer` local: no hay dependencias nuevas ni servicios externos.

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

`java.net.http.HttpClient` es el cliente HTTP estándar desde Java 11. Resuelve HTTP/1.1, HTTP/2, timeouts, headers y body handlers síncronos/asíncronos sin añadir dependencias. El error más caro es no definir límites: un cliente sin timeout bloquea un hilo indefinidamente; un cliente que no interpreta status convierte un 401 o un 503 en un bug silencioso; un cliente que sigue redirects automáticos puede enviar credenciales a otro host.

El diseño mínimo sano tiene cinco piezas: timeout de conexión y de request, validación de entrada, mapeo explícito de status, política de redirect y reintento solo para operaciones idempotentes.

#### `ApiException.java`

```java
package com.aurora.httpsec;
public class ApiException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final int status;
    public ApiException(int status, String message) { super(message); this.status = status; }
    public int status() { return status; }
}
```

#### `ApiCliente.java`

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
- `followRedirects(HttpClient.Redirect.NEVER)` evita que un `Authorization: Bearer ...` viaje a otro host. El servidor local responde `302` con `Location`; el cliente lo observa y no lo sigue.
- `getConReintento` reintenta solo `503` en un `GET`, con backoff `10 ms`, `20 ms`, y un máximo de intentos. No reintentes un `POST` que crea cobros.
- La allowlist de `id` (`[A-Za-z0-9_-]{1,32}`) rechaza `../admin` antes de tocar la red. El `switch` por status distingue 401, 403, 404 y error remoto.

#### Sockets debajo de HTTP: `SocketsDemo.java`

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

Salida verificada: `SOCKETS=TCP=p->P/server=P,UDP=q`.

### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 45 min

Un token es una credencial: no se loguea completo, se valida antes de usarse y se envía solo al destino esperado. Aquí el flujo es completo y local: `POST /login` devuelve un JWT HS256 firmado con HMAC-SHA256 de la JCA; `GET /guias/G1` exige token válido; `GET /admin/guias` exige rol `ADMIN` y responde `403` a un usuario con rol `LECTOR`.

**Visual:** [Seguridad básica HTTP: validar antes de llamar](/visuals/temas/java/modulo-18-seguridad-http.html)

Lectura: valida input y allowlist antes de llamar; aplica timeout; maneja status; reintenta solo si la operación es idempotente.

#### `CryptoUtil.java` (la firma del JWT usa `hmacSha256`)

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

#### `TokenService.java`

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

#### `ServidorLocal.java`

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

Resultados verificados: `LOGIN=3` (tres partes del JWT), `SIN_ROL=403`, `TOKEN_INVALIDO=401`, `ADMIN=ADMIN:OK`. Este JWT es deliberadamente mínimo: no implementa OAuth/OIDC, rotación de claves, `jti`, `aud` ni mTLS. Para un proveedor externo o una API multi-servicio, usa una librería revisada y un gestor de secretos; aquí se verifica el contrato completo de emisión, firma, caducidad y autorización contra un servidor local.

### Tema 3: Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos · Avanzado · 45 min

JCA es la API estándar de criptografía en Java. No inventes algoritmos, no implementes AES a mano, no uses MD5/SHA-1 para seguridad nueva y no reutilices IVs con la misma clave en AES-GCM. Cada primitiva tiene un propósito distinto:

- **SHA-256**: hash e integridad. No cifra y no es password hashing.
- **HMAC-SHA256**: autenticidad e integridad con clave compartida. Aquí firma cada JWT.
- **AES-GCM**: cifrado autenticado. Detecta manipulación del ciphertext con `AEADBadTagException`.

El código completo de `CryptoUtil.java` está en el Tema 2; es el mismo archivo que firma los tokens y cifra la liquidación del `main`. `SecureRandom` genera IVs de 12 bytes y claves de 32 bytes; el tag GCM es de 128 bits.

**Error común:** usar SHA-256 para guardar contraseñas. Para contraseñas usa algoritmos lentos con salt, como bcrypt/Argon2/PBKDF2; no un hash rápido puro.

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
| Token enviado a otro host tras 302 | Redirect automático | Inspeccionar `Location` y headers | `followRedirects(NEVER)` y revisar destino |
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
