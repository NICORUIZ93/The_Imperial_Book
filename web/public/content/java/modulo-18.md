# Módulo 18: HTTP, seguridad y backend con Java

Java incluye un cliente HTTP moderno en la librería estándar (`java.net.http`). Llamar una API no es solo “hacer un GET”: hay timeouts, códigos de estado, validación, secretos, tokens y criptografía. Este módulo construye ese criterio con ejemplos ejecutables.

**Entorno de referencia verificado (2026-05-22):** JDK 27. Los ejemplos HTTP externos dependen de red; se incluyen alternativas locales/nota honesta.

## Aprende construyendo

### Tema 1: HttpClient, REST, timeouts y fallos · Intermedio · 45 min

Consumir una API REST con timeouts y manejo de fallos.

#### `HttpClient` (Java 11+)

**Definición formal.** `java.net.http.HttpClient` es el cliente HTTP estándar de Java para enviar requests y recibir responses de forma síncrona o asíncrona.

**Para qué sirve.** Integrarse con APIs HTTP sin dependencias externas.

**Cuándo usarlo y cuándo no.** Úsalo para clientes HTTP estándar. No uses configuración por defecto sin timeouts en producción.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m18-t1 && cd /tmp/java-m18-t1
cat > DemoHttp.java << 'JAVA'
import java.net.*; import java.net.http.*; import java.time.Duration;
import com.sun.net.httpserver.*;
import java.io.*;
public class DemoHttp {
  public static void main(String[] args) throws Exception {
    HttpServer s = HttpServer.create(new InetSocketAddress(0),0);
    s.createContext("/ok", ex -> { byte[] b="hola".getBytes(); ex.sendResponseHeaders(200,b.length); ex.getResponseBody().write(b); ex.close(); });
    s.start();
    HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
    HttpRequest req = HttpRequest.newBuilder(URI.create("http://localhost:"+s.getAddress().getPort()+"/ok")).timeout(Duration.ofSeconds(2)).GET().build();
    HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
    System.out.println(res.statusCode());
    System.out.println(res.body());
    s.stop(0);
  }
}
JAVA
javac DemoHttp.java && java DemoHttp
```

**Caso de uso real.** Consumir API interna de catálogo.

**Error común.** Sin timeouts. Síntoma: hilos colgados. Corrección: `connectTimeout` y `request.timeout`.

**Verificación (JDK 27, 2026-05-22).** Salida: `200` y `hola`.

#### REST y códigos de estado

**Definición formal.** REST es un estilo arquitectónico sobre HTTP donde recursos se representan y se manipulan con métodos y códigos de estado con semántica.

**Para qué sirve.** Contratos interoperables y predecibles.

**Cuándo usarlo.** APIs recurso-orientadas. No trates todo como `200`.

**Ejemplo mínimo enfocado (ejecutable).**

```java
if (res.statusCode() >= 200 && res.statusCode() < 300) { /* ok */ }
else if (res.statusCode() == 404) { /* no encontrado */ }
else if (res.statusCode() >= 500) { /* fallo servidor */ }
```

**Caso de uso real.** Distinguir 404 de 500 para decidir reintento.

**Error común.** Reintentar errores 4xx de validación. Corrección: reintentar solo fallos transitorios/idempotentes.

**Verificación.** En el ejemplo local, `statusCode()` es 200.

#### Timeouts y manejo de fallos

**Definición formal.** Timeout es un límite de espera; manejo de fallos es la estrategia ante red caída, timeout, 4xx/5xx o parseo inválido.

**Para qué sirve.** Robustez y protección de recursos.

**Cuándo usarlo.** Siempre en llamadas remotas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/java-m18-t1
cat > DemoFail.java << 'JAVA'
import java.net.*; import java.net.http.*; import java.time.Duration;
public class DemoFail {
  public static void main(String[] args) {
    try {
      HttpClient c = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(200)).build();
      HttpRequest r = HttpRequest.newBuilder(URI.create("http://127.0.0.1:1")).timeout(Duration.ofMillis(200)).GET().build();
      c.send(r, HttpResponse.BodyHandlers.discarding());
    } catch (Exception e) { System.out.println("fallo"); }
  }
}
JAVA
javac DemoFail.java && java DemoFail
```

**Caso de uso real.** Falla de downstream.

**Error común.** Tragar excepción sin contexto. Corrección: log con operación, URL, timeout, status; propagar o degradar.

**Verificación (2026-05-22).** Salida: `fallo`.

### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 45 min

Una API recibe token; debes validar claims y aplicar límites sin confiar ciegamente.

#### Tokens

**Definición formal.** Token es una credencial portable que representa identidad/atributos o acceso (opaque o auto-contenido como JWT).

**Para qué sirve.** Autenticación/autorización entre servicios.

**Cuándo usarlo.** APIs stateless o delegadas. Siempre validar firma y claims.

**Ejemplo mínimo enfocado (ejecutable, validación de claims simulados).**

```bash
mkdir -p /tmp/java-m18-t2 && cd /tmp/java-m18-t2
cat > DemoToken.java << 'JAVA'
import java.time.Instant; import java.util.*;
record Token(String sub, Instant exp, Set<String> scopes) {}
public class DemoToken {
  static void validar(Token t, String scope){
    if (t.exp().isBefore(Instant.now())) throw new SecurityException("expirado");
    if (!t.scopes().contains(scope)) throw new SecurityException("sin scope");
  }
  public static void main(String[] args){ validar(new Token("u1", Instant.now().plusSeconds(60), Set.of("guias:read")), "guias:read"); System.out.println("ok"); }
}
JAVA
javac DemoToken.java && java DemoToken
```

**Caso de uso real.** Validar `exp` y scope antes de ejecutar acción.

**Error común.** Confiar en payload JWT sin verificar firma. Corrección: verificar firma con librería probada y claves gestionadas.

**Verificación (2026-05-22).** Salida: `ok`. **Nota:** no implementa firma JWT; es validación de claims.

#### Validación y allowlist

**Definición formal.** Validar es comprobar entrada/claims contra reglas explícitas; allowlist acepta solo valores permitidos.

**Para qué sirve.** Reduce superficie de ataque.

**Cuándo usarlo.** Toda entrada externa.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/java-m18-t2
cat > DemoAllow.java << 'JAVA'
import java.util.*;
public class DemoAllow {
  static void validarScope(String s){ if(!Set.of("guias:read","guias:write").contains(s)) throw new IllegalArgumentException("scope"); }
  public static void main(String[] args){ try { validarScope("admin:*"); } catch(Exception e){ System.out.println("rechazado"); } }
}
JAVA
javac DemoAllow.java && java DemoAllow
```

**Caso de uso real.** Rechazar scope inesperado.

**Error común.** Blocklist incompleta. Corrección: allowlist.

**Verificación (2026-05-22).** Salida: `rechazado`.

#### Mínimo privilegio y límites

**Definición formal.** Mínimo privilegio otorga solo permisos necesarios; límites de seguridad acotan tamaño, tasa, tiempo y alcance.

**Para qué sirve.** Limita impacto de compromiso o abuso.

**Cuándo usarlo.** Siempre en diseño de tokens y endpoints.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/java-m18-t2
cat > DemoLeast.java << 'JAVA'
import java.util.*;
public class DemoLeast { public static void main(String[] args){ Set<String> scopes=Set.of("guias:read"); System.out.println(scopes.contains("guias:write")); } }
JAVA
javac DemoLeast.java && java DemoLeast
```

**Caso de uso real.** Token de lectura no puede escribir.

**Error común.** Token “admin” para todo. Corrección: scopes/roles acotados y expiración corta.

**Verificación (2026-05-22).** Salida: `false`.

### Tema 3: Criptografía con la JCA: SHA-256, HMAC y AES-GCM · Avanzado · 45 min

Hashear, firmar y cifrar con primitivas estándar sin inventar algoritmos.

#### JCA/JCE

**Definición formal.** Java Cryptography Architecture/Extension provee APIs como `MessageDigest`, `Mac`, `Cipher`, `KeyGenerator`.

**Para qué sirve.** Usar criptografía estándar del JDK/proveedor.

**Cuándo usarlo.** Siempre que necesites primitivas criptográficas. No inventes algoritmos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m18-t3 && cd /tmp/java-m18-t3
cat > DemoJca.java << 'JAVA'
import java.security.*;
public class DemoJca { public static void main(String[] args) throws Exception { System.out.println(MessageDigest.getInstance("SHA-256").getAlgorithm()); } }
JAVA
javac DemoJca.java && java DemoJca
```

**Caso de uso real.** Elegir algoritmo estándar soportado.

**Error común.** Usar algoritmos obsoletos o modos inseguros. Corrección: primitivas modernas y revisadas.

**Verificación (2026-05-22).** Salida: `SHA-256`.

#### SHA-256

**Definición formal.** SHA-256 es una función hash criptográfica que produce un digest de 256 bits.

**Para qué sirve.** Integridad/huella de contenido.

**Cuándo usarlo.** Huellas y firmas de contenido. No para passwords sin KDF + salt.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/java-m18-t3
cat > DemoSha.java << 'JAVA'
import java.security.*; import java.util.*;
public class DemoSha { static String hex(byte[] b){ StringBuilder s=new StringBuilder(); for(byte x:b) s.append(String.format("%02x",x)); return s.toString(); }
  public static void main(String[] args) throws Exception { System.out.println(hex(MessageDigest.getInstance("SHA-256").digest("hola".getBytes())).length()); }
}
JAVA
javac DemoSha.java && java DemoSha
```

**Caso de uso real.** Detectar cambio en archivo.

**Error común.** SHA-256 plano para passwords. Corrección: bcrypt/scrypt/Argon2/PBKDF2 con parámetros adecuados.

**Verificación (2026-05-22).** Salida: `64`.

#### HMAC

**Definición formal.** HMAC es un Message Authentication Code basado en hash y clave secreta (ej. HmacSHA256).

**Para qué sirve.** Integridad y autenticidad de mensaje entre partes con clave compartida.

**Cuándo usarlo.** Firmar webhooks/payloads internos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/java-m18-t3
cat > DemoHmac.java << 'JAVA'
import javax.crypto.*; import javax.crypto.spec.*;
public class DemoHmac { static String hex(byte[] b){ StringBuilder s=new StringBuilder(); for(byte x:b) s.append(String.format("%02x",x)); return s.toString(); }
  public static void main(String[] args) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec("secret-key-123456".getBytes(), "HmacSHA256"));
    System.out.println(hex(mac.doFinal("msg".getBytes())).length());
  }
}
JAVA
javac DemoHmac.java && java DemoHmac
```

**Caso de uso real.** Validar firma de webhook.

**Error común.** Comparar firma con `equals` vulnerable a timing en contextos sensibles. Corrección: comparación en tiempo constante.

**Verificación (2026-05-22).** Salida: `64`.

#### AES-GCM

**Definición formal.** AES-GCM es un modo de cifrado autenticado (AEAD) que provee confidencialidad e integridad.

**Para qué sirve.** Cifrar datos sensibles con detección de manipulación.

**Cuándo usarlo.** Cifrado simétrico moderno. Nunca reutilices nonce con la misma clave.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/java-m18-t3
cat > DemoAes.java << 'JAVA'
import javax.crypto.*; import javax.crypto.spec.*; import java.security.*;
public class DemoAes {
  public static void main(String[] args) throws Exception {
    KeyGenerator kg = KeyGenerator.getInstance("AES"); kg.init(128); SecretKey key = kg.generateKey();
    byte[] iv = new byte[12]; new SecureRandom().nextBytes(iv);
    Cipher c = Cipher.getInstance("AES/GCM/NoPadding"); c.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
    byte[] ct = c.doFinal("secreto".getBytes());
    Cipher d = Cipher.getInstance("AES/GCM/NoPadding"); d.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
    System.out.println(new String(d.doFinal(ct)));
  }
}
JAVA
javac DemoAes.java && java DemoAes
```

**Caso de uso real.** Cifrar campo sensible en reposo.

**Error común.** Reusar nonce/IV con misma clave. Corrección: nonce único por cifrado y gestión segura de claves.

**Verificación (2026-05-22).** Salida: `secreto`.

## Cierre del módulo

HTTP y criptografía requieren disciplina: timeouts, validación, allowlists, mínimo privilegio y primitivas estándar. No inventes criptografía; usa JCA correctamente y verifica fallos.
