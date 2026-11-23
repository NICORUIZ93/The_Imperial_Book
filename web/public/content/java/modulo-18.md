# Módulo 18: HTTP, seguridad y backend con Java

Un backend Java no solo “hace peticiones HTTP”. Llama servicios que pueden responder tarde, fallar, devolver 401, o entregar datos malformados. También maneja secretos, tokens y datos sensibles. Si el cliente HTTP no tiene timeout, la app se queda colgada; si concatena ids en URLs sin validar, abre rutas inesperadas; si implementa criptografía “a mano”, crea vulnerabilidades.

En este módulo construirás `tienda-aurora-java-m18`: un cliente HTTP con `java.net.http.HttpClient`, validación de entrada, manejo explícito de códigos de estado, y utilidades criptográficas usando JCA (`MessageDigest`, `Mac`, `Cipher` AES-GCM). Para que todo sea verificable sin internet, el test y el `main` levantan un `com.sun.net.httpserver.HttpServer` local.

## Visual del módulo

**Herramienta (animdiagram, animado con fallback estático):** [HttpClient: petición, timeout y respuesta](/visuals/temas/java/modulo-18-httpclient.html)

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
    │   └── CryptoUtil.java
    └── test/java/com/aurora/httpsec/
        └── HttpSecTest.java
```

## Build desde cero

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m18"
```

#### `build.gradle.kts`

Solo JDK estándar + JUnit 5. No se necesita dependencia externa para `HttpClient` ni JCA.

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

`java.net.http.HttpClient` es el cliente HTTP estándar desde Java 11. Resuelve lo básico bien: HTTP/1.1, HTTP/2, timeouts, headers, body handlers síncronos y asíncronos. Para la mayoría de integraciones internas, evita agregar una dependencia solo para hacer GET/POST.

El error más caro es no definir límites. Un cliente sin timeout puede bloquear un hilo indefinidamente cuando el servicio remoto no responde. Un cliente que no interpreta códigos de estado convierte un 401 o 503 en un bug silencioso. Un cliente que acepta cualquier id y lo concatena en la ruta permite path traversal o llamadas inesperadas.

El diseño mínimo sano tiene cuatro piezas: timeout de conexión/solicitud, validación de entrada, mapeo explícito de status, y error con contexto.

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

public class ApiCliente {
    private final HttpClient client;
    private final URI base;

    public ApiCliente(HttpClient client, URI base) {
        this.client = client;
        this.base = base;
    }

    public String getGuia(String id, String token) throws IOException, InterruptedException {
        validarId(id);
        validarToken(token);
        HttpRequest req = HttpRequest.newBuilder(base.resolve("/guias/" + id))
                .timeout(Duration.ofSeconds(2))
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        return switch (res.statusCode()) {
            case 200 -> res.body();
            case 401, 403 -> throw new ApiException(res.statusCode(), "no autorizado");
            case 404 -> throw new ApiException(404, "guía no encontrada: " + id);
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

- `timeout` en la request evita esperas indefinidas. También configura `connectTimeout` al construir el cliente.
- La allowlist de `id` (`[A-Za-z0-9_-]{1,32}`) rechaza `../admin`, espacios o payloads raros antes de tocar la red.
- El `switch` por status hace visible el contrato. Un 401 no es lo mismo que un 404 ni que un 500.
- `IOException` y `InterruptedException` se propagan: la capa superior decide reintentar, traducir o fallar.

**Cuándo reintentar:** solo operaciones idempotentes (GET, PUT con idempotencia, etc.) y ante fallos transitorios (timeouts, 503) con backoff. No reintentes ciegamente un POST que crea cobros.

### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 45 min

Un token es una credencial. Tratarlo como string decorativo es un error común: se loguea completo, se concatena sin validar, se acepta con longitud arbitraria, o se envía a dominios no confiables.

La regla práctica es defensa en capas. Valida formato/tamaño antes de usar el token. Envia el token solo al destino esperado. No lo escribas en logs. Maneja 401/403 como fallo de autenticación/autorización, no como “reintenta hasta que funcione”. Limita la superficie de entrada: ids, headers y cuerpos tienen forma y tamaño.

**Diagrama (diagram-design, estático):** [Seguridad básica HTTP: validar antes de llamar](/visuals/temas/java/modulo-18-seguridad-http.html)

Lectura: valida input y allowlist antes de llamar; aplica timeout; maneja status; reintenta solo si la operación es idempotente.

En `ApiCliente`, la validación ocurre antes de construir el request. Eso evita trabajo inútil y reduce superficie. El token se coloca en `Authorization: Bearer ...` solo para el `base` URI controlado por el código que construye el cliente. No hay logging del token; los errores exponen status, no credenciales.

Caso de borde: un token muy largo o con caracteres de control puede causar problemas en headers o en logs. El límite de longitud es una defensa simple. Otra defensa real es no aceptar redirects automáticos hacia otros hosts cuando envías credenciales; si usas `HttpClient`, revisa la política de redirect y el destino final.

**Nota de verificación honesta:** este módulo no implementa OAuth/OIDC completo, ni rotación de tokens, ni mTLS. Esos flujos requieren proveedor/infra; aquí se verifica el patrón de uso seguro básico con servidor local.

### Tema 3: Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos · Avanzado · 45 min

JCA (Java Cryptography Architecture) es la API estándar de criptografía en Java. La regla de oro es: no inventes algoritmos, no implementes AES a mano, no uses MD5/SHA-1 para seguridad nueva, y no reutilices IVs con la misma clave en AES-GCM.

Cada primitiva tiene propósito distinto:

- **SHA-256**: hash. Útil para integridad/huellas. No cifra y no es contraseña segura por sí solo.
- **HMAC-SHA256**: autenticidad e integridad con clave compartida. Sirve para firmar mensajes.
- **AES-GCM**: cifrado autenticado. Protege confidencialidad y detecta manipulación.

#### `CryptoUtil.java`

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

    public static String hmacSha256Hex(byte[] key, String mensaje) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return HEX.formatHex(mac.doFinal(mensaje.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
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

Detalles de seguridad:

- `SecureRandom` genera IVs/claves aleatorias. No uses `Random`.
- AES-GCM necesita IV único por clave. Reutilizar IV con la misma clave rompe garantías.
- La clave debe tener tamaño adecuado (16/24/32 bytes para AES-128/192/256). Aquí usamos 32 bytes.
- GCM usa tag de autenticación (128 bits aquí). Si el ciphertext se altera, `doFinal` falla.

**Error común:** usar SHA-256 para guardar contraseñas. Para contraseñas usa algoritmos lentos con salt, como bcrypt/Argon2/PBKDF2; no un hash rápido puro.

## Borde ejecutable: `App.java`

```java
package com.aurora.httpsec;

import com.sun.net.httpserver.HttpServer;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public final class App {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/guias/G1", exchange -> {
            String auth = exchange.getRequestHeaders().getFirst("Authorization");
            if (!"Bearer token-demo".equals(auth)) {
                exchange.sendResponseHeaders(401, -1);
                exchange.close();
                return;
            }
            byte[] body = "{\"id\":\"G1\",\"estado\":\"ENTREGADA\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) { os.write(body); }
        });
        server.start();
        try {
            int port = server.getAddress().getPort();
            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
            ApiCliente api = new ApiCliente(client, URI.create("http://localhost:" + port));
            System.out.println("RESP=" + api.getGuia("G1", "token-demo"));
            try {
                api.getGuia("G1", "malo");
            } catch (ApiException e) {
                System.out.println("AUTH=" + e.status());
            }

            String hash = CryptoUtil.sha256Hex("Aurora");
            System.out.println("SHA256=" + hash.substring(0, 12));
            byte[] key = CryptoUtil.randomBytes(32);
            byte[] iv = CryptoUtil.randomBytes(12);
            byte[] cipher = CryptoUtil.aesGcmEncrypt(key, iv, "secreto".getBytes(StandardCharsets.UTF_8));
            byte[] plain = CryptoUtil.aesGcmDecrypt(key, iv, cipher);
            System.out.println("AES=" + new String(plain, StandardCharsets.UTF_8));
            String mac = CryptoUtil.hmacSha256Hex("clave".getBytes(StandardCharsets.UTF_8), "mensaje");
            System.out.println("HMAC=" + mac.substring(0, 12));
        } finally {
            server.stop(0);
        }
    }
}
```

## Pruebas: `HttpSecTest.java`

```java
package com.aurora.httpsec;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class HttpSecTest {
    private HttpServer server;
    private ApiCliente api;

    @BeforeEach
    void setUp() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/guias/G1", ex -> {
            String auth = ex.getRequestHeaders().getFirst("Authorization");
            if (!"Bearer ok".equals(auth)) { ex.sendResponseHeaders(401, -1); ex.close(); return; }
            byte[] body = "{\"id\":\"G1\"}".getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(200, body.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(body); }
        });
        server.start();
        api = new ApiCliente(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build(),
                URI.create("http://localhost:" + server.getAddress().getPort()));
    }

    @AfterEach
    void tearDown() { server.stop(0); }

    @Test
    void getValido() throws Exception {
        assertEquals("{\"id\":\"G1\"}", api.getGuia("G1", "ok"));
    }

    @Test
    void tokenInvalidoDa401() {
        ApiException e = assertThrows(ApiException.class, () -> api.getGuia("G1", "malo"));
        assertEquals(401, e.status());
    }

    @Test
    void idInvalidoSeRechazaAntesDeLlamar() {
        assertThrows(IllegalArgumentException.class, () -> api.getGuia("../admin", "ok"));
    }

    @Test
    void cryptoRoundtrip() {
        byte[] key = CryptoUtil.randomBytes(32);
        byte[] iv = CryptoUtil.randomBytes(12);
        byte[] c = CryptoUtil.aesGcmEncrypt(key, iv, "hola".getBytes(StandardCharsets.UTF_8));
        assertEquals("hola", new String(CryptoUtil.aesGcmDecrypt(key, iv, c), StandardCharsets.UTF_8));
        assertEquals(64, CryptoUtil.sha256Hex("x").length());
        assertEquals(64, CryptoUtil.hmacSha256Hex(key, "msg").length());
    }
}
```

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m18` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

`./gradlew -q test`: **4 tests, 0 fallas**.

Salida real de `./gradlew -q run`:

```text
RESP={"id":"G1","estado":"ENTREGADA"}
AUTH=401
SHA256=e9de098c7733
AES=secreto
HMAC=17e8847a8463
```

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| La app se cuelga esperando respuesta | Sin timeout | Hilos bloqueados, thread dump | `connectTimeout` y `request.timeout(...)` |
| 401 tratado como éxito | No validar status | Revisar parsing/respuesta | Switch por status, errores explícitos |
| Token filtrado en logs | Logging ingenuo | Buscar headers en logs | Enmascarar secretos, nunca loguear token completo |
| `AEADBadTagException` | Clave/IV/ciphertext alterados o IV reutilizado mal | Revisar manejo de IV y almacenamiento | IV único por cifrado, clave correcta, no reutilizar IV+clave |
| Contraseñas con SHA-256 | Confundir hash rápido con password hashing | Revisar esquema de auth | bcrypt/Argon2/PBKDF2 con salt y costo |

## Checklist de cierre

- [ ] El cliente HTTP tiene timeout y manejo explícito de status.
- [ ] La entrada se valida antes de llamar al servicio.
- [ ] Los tokens no se exponen en logs ni se envían sin control.
- [ ] Uso JCA para hash/HMAC/cifrado, sin inventar algoritmos.
- [ ] Probé el flujo con servidor local y tests.

Siguiente paso natural: **Módulo 19 — reflexión, regex, dinero, contratos, plugins e i18n**, donde el foco vuelve a APIs estándar del JDK que suelen usarse mal cuando no se entienden sus límites.
