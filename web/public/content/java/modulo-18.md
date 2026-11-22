# Módulo 18: HTTP, seguridad y backend con Java

Java incluye un cliente HTTP moderno en la librería estándar (`java.net.http`). Pero llamar una API no es solo “hacer un GET”: hay timeouts, códigos de estado, validación, secretos, tokens y criptografía. Este módulo construye ese criterio desde el lado cliente y desde las fronteras de seguridad.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Usar `HttpClient` con timeouts, validación de estado y parseo separado |
| 2 | Transportar credenciales con cuidado y validar entrada no confiable |
| 3 | Aplicar JCA para hash, HMAC y cifrado autenticado sin inventar criptografía |

## Aprende construyendo

### Tema 1: HttpClient, REST, timeouts y fallos · Intermedio · 45 min

**Caso guía**: consumir API REST con timeouts y manejo de fallos.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `HttpClient` (Java 11+) | Cliente HTTP estándar (`java.net.http`). | Llamadas HTTP sync/async. | Configurar timeouts, versión, redirect. | Cliente sin timeout. |
| REST | Estilo de recursos sobre HTTP (métodos, códigos, representaciones). | Integrar servicios. | Respetar semántica HTTP. | Tratar todo 200/POST. |
| Timeouts | Límite de conexión/respuesta. | Evitar hilos colgados. | `connectTimeout`, request timeout. | Sin timeout en prod. |
| Manejo de fallos | Errores de red, 4xx/5xx, parsing. | Robustez. | Reintentos con backoff solo cuando idempotente; log con contexto. | Reintentar POST no idempotente. |

**Implementación desde cero**
```java
import java.net.*; import java.net.http.*; import java.time.Duration;
public class DemoHttp {
  public static void main(String[] args) throws Exception {
    HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    HttpRequest req = HttpRequest.newBuilder(URI.create("https://httpbin.org/get")).timeout(Duration.ofSeconds(5)).GET().build();
    HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
    System.out.println(res.statusCode());
  }
}
```
**Ejecución real**: `javac DemoHttp.java && java DemoHttp` → `200` (requiere red). **Verificación**: cambiar a dominio inválido y manejar `IOException/InterruptedException`. **Nota de verificación**: en entorno sin red, documentar y probar contra servidor local.


### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 45 min

**Caso guía**: API recibe token; debes validar formato, expiración y permisos sin confiar ciegamente.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Tokens | Credenciales portables (opaque/JWT). | Autenticación/autorización. | Validar firma, exp, aud/iss. | Confiar en payload sin verificar firma. |
| Validación | Comprobar input/claims contra reglas. | Evitar accesos indebidos. | Allowlist, tamaño, formato, tiempo. | Validación parcial. |
| Límites de seguridad | Controles: tamaño, rate, timeout, least privilege. | Reducir superficie. | Defensa en profundidad. | Un solo control como “seguridad total”. |
| Principio de mínimo privilegio | Conceder solo permisos necesarios. | Limitar impacto. | Scopes/roles acotados. | Token con permisos amplios. |

**Implementación desde cero (validación de claims simulados)**
```java
import java.time.Instant; import java.util.*;
record Token(String sub, Instant exp, Set<String> scopes) {
  static Token parseTrusted(String s){ // DEMO: en real verificar firma JWT/JWS
    return new Token("u1", Instant.now().plusSeconds(60), Set.of("guias:read"));
  }
}
public class DemoToken {
  static void validar(Token t, String scope){
    if (t.exp().isBefore(Instant.now())) throw new SecurityException("expirado");
    if (!t.scopes().contains(scope)) throw new SecurityException("sin scope");
  }
  public static void main(String[] args){ Token t=Token.parseTrusted("x"); validar(t,"guias:read"); System.out.println("ok"); }
}
```
**Ejecución real**: `javac DemoToken.java && java DemoToken` → `ok`. **Nota**: el parseo es demo; en producción verificar firma con librería probada (Nimbus, jjwt) y claves seguras.


### Tema 3: Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos · Avanzado · 45 min

**Caso guía**: hashear contenido, firmar mensaje y cifrar dato sensible correctamente.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| JCA/JCE | APIs criptográficas de Java (`MessageDigest`, `Mac`, `Cipher`). | Usar primitivas estándar. | No inventar algoritmos. | “Mi propio AES”. |
| SHA-256 | Hash criptográfico. | Integridad/huella. | No para passwords sin KDF/salt. | Usar SHA-256 plano para passwords. |
| HMAC | MAC con clave secreta (ej. HmacSHA256). | Integridad + autenticidad. | Clave secreta fuerte, comparar en tiempo constante. | Comparación vulnerable a timing. |
| AES-GCM | Cifrado autenticado AEAD. | Confidencialidad + integridad. | Nonce único por clave, gestionar claves/IV. | Reusar nonce con misma clave. |

**Implementación desde cero**
```java
import javax.crypto.*; import javax.crypto.spec.*; import java.security.*; import java.util.*;
public class DemoCrypto {
  static String hex(byte[] b){ StringBuilder s=new StringBuilder(); for(byte x:b) s.append(String.format("%02x",x)); return s.toString(); }
  public static void main(String[] args) throws Exception {
    MessageDigest sha = MessageDigest.getInstance("SHA-256");
    System.out.println(hex(sha.digest("hola".getBytes())).length());
    Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec("secret-key-123456".getBytes(), "HmacSHA256"));
    System.out.println(hex(mac.doFinal("msg".getBytes())).length());
    KeyGenerator kg = KeyGenerator.getInstance("AES"); kg.init(128); SecretKey key = kg.generateKey();
    byte[] iv = new byte[12]; SecureRandom.getInstanceStrong().nextBytes(iv);
    Cipher c = Cipher.getInstance("AES/GCM/NoPadding"); c.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
    byte[] ct = c.doFinal("secreto".getBytes());
    Cipher d = Cipher.getInstance("AES/GCM/NoPadding"); d.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
    System.out.println(new String(d.doFinal(ct)));
  }
}
```
**Ejecución real**: `javac DemoCrypto.java && java DemoCrypto` → `64`, `64`, `secreto`. **Verificación**: cambia 1 byte de ct y confirma `AEADBadTagException`.


## Cierre del módulo

HTTP seguro y criptografía correcta dependen de disciplina: timeouts, validación, manejo de secretos, primitivas estándar y verificación de fallos. Con esto estás listo para construir backends en Spring Boot con una base de seguridad más sólida.
