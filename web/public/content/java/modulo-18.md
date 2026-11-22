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

**Caso guía**

Tu servicio debe consultar una API externa para obtener el estado de una guía. Si la API tarda demasiado, responde 500 o devuelve JSON inesperado, tu servicio no puede quedarse colgado ni asumir éxito.

**Fundamento técnico y modelo mental**

**Definición formal.** `HttpClient` (Java 11+) es el cliente HTTP estándar de la plataforma. Un request HTTP tiene método, URI, headers y opcionalmente body; una response tiene status code, headers y body. REST es un estilo arquitectónico basado en recursos y semántica HTTP, no un requisito impuesto por `HttpClient`.

**Contrato / invariantes / reglas.** Toda llamada remota puede fallar por red, timeout, DNS, TLS o respuesta inválida. El cliente debe configurar timeout de conexión/solicitud, validar el status code antes de parsear como éxito y separar transporte de parseo de dominio. `send` lanza `IOException`/`InterruptedException` (o variantes en async). Reintentos deben ser idempotentes y con backoff; nunca reintentar ciegamente operaciones no idempotentes. No loguear cuerpos o headers con secretos.

**Modelo mental.** Una llamada HTTP es una llamada telefónica a otro edificio: puede no contestar, contestar tarde o contestar algo que no esperabas. Tu código debe manejar los tres casos.

**Implementación desde cero**

```java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class ClienteGuias {
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(2))
        .build();

    public String consultar(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(3))
            .header("Accept", "application/json")
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("HTTP inesperado: " + response.statusCode());
        }
        return response.body();
    }

    public static void main(String[] args) throws Exception {
        ClienteGuias cliente = new ClienteGuias();
        System.out.println("Cliente listo: " + (cliente.client != null));
    }
}
```

**Desglose del código**

- `connectTimeout` limita el tiempo para establecer conexión.
- `request.timeout(...)` limita el tiempo total de la solicitud.
- `Accept: application/json` declara el formato esperado.
- Validar rango 2xx evita tratar errores HTTP como éxito.
- El parseo JSON se haría en otra capa; aquí se separa transporte.

**Ejecución y salida real**

```bash
javac ClienteGuias.java
java ClienteGuias
```

```text
Cliente listo: true
```

Para una prueba real, apunta `url` a un endpoint local o de test y verifica status/timeout.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La app se queda colgada | Sin timeout | Configura connect/request timeout |
| `200` asumido pero body es error | No validaste status | Verifica rango 2xx |
| `InterruptedException` ignorada | Manejo incompleto | Restablece interrupción o propaga con contexto |

**Verificación rápida**

Compila y ejecuta. Luego prueba con una URL inválida o un servidor lento para observar el manejo de fallo.

### Tema 2: Tokens, validación y límites de seguridad · Avanzado · 45 min

**Caso guía**

Debes llamar una API con un token Bearer. Además, recibes datos de usuarios y debes validarlos antes de usarlos. Un token mal manejado o una validación débil se convierte en incidente de seguridad.

**Fundamento técnico y modelo mental**

**Definición formal.** *Autenticación* verifica identidad; *autorización* verifica permisos. Un *token Bearer* es una credencial que, si se presenta, otorga acceso según el servidor. La *validación de entrada* es la verificación de que datos no confiables cumplen forma, rango y semántica esperada antes de procesarlos.

**Contrato / invariantes / reglas.** Los secretos/tokens no deben hardcodearse, loguearse ni commitearse; se obtienen de entorno, vault o gestor de secretos. El transporte debe ser HTTPS en redes no confiables. Un token es credencial: quien lo posee puede usarlo mientras sea válido. Validar entrada no sustituye autorización en servidor. `Authorization: Bearer <token>` es un mecanismo de transporte; no decide por sí mismo qué puede hacer el usuario.

**Modelo mental.** El token es una llave temporal: no la dejas pegada en la puerta (código/logs), no la envías por una postal abierta (HTTP sin TLS) y no asumes que tener llave permite entrar a cualquier cuarto (autorización).

**Implementación desde cero**

```java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class ClienteSeguro {
    static String tokenDesdeEntorno() {
        String token = System.getenv("ACADEMIA_API_TOKEN");
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Falta ACADEMIA_API_TOKEN");
        }
        return token;
    }

    static void validarGuia(String guia) {
        if (guia == null || !guia.matches("[A-Z0-9\\-]{3,20}")) {
            throw new IllegalArgumentException("guia invalida");
        }
    }

    public static void main(String[] args) throws Exception {
        validarGuia("G-123");
        String token = "demo"; // en real: tokenDesdeEntorno()
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.invalid/guias/G-123"))
            .timeout(Duration.ofSeconds(3))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();
        System.out.println(request.headers().firstValue("Authorization").orElse("").startsWith("Bearer "));
    }
}
```

**Desglose del código**

- `tokenDesdeEntorno` evita hardcodear secretos.
- `validarGuia` aplica una whitelist de formato antes de usar el dato.
- `Authorization: Bearer ...` transporta la credencial.
- En producción, usa `tokenDesdeEntorno()` y HTTPS; aquí se imprime solo una comprobación booleana.

**Ejecución y salida real**

```bash
javac ClienteSeguro.java
java ClienteSeguro
```

```text
true
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Token filtrado en repo/logs | Hardcode o logging | Usa variables de entorno/vault y redacta logs |
| Confías en datos del cliente | Falta validación/autorización | Valida input y verifica permisos en servidor |
| Usas HTTP en red no confiable | Transporte sin cifrar | Usa HTTPS/TLS |

**Verificación rápida**

Ejecuta con `ACADEMIA_API_TOKEN` ausente usando `tokenDesdeEntorno()` y verifica que falla con mensaje claro.

### Tema 3: Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos · Avanzado · 45 min

**Caso guía**

Necesitas verificar integridad de un mensaje, autenticar que viene de un socio con clave compartida y cifrar datos sensibles. La tentación de “inventar” un algoritmo es peligrosa: debes usar primitivas estándar.

**Fundamento técnico y modelo mental**

**Definición formal.** JCA/JCE (Java Cryptography Architecture/Extension) es la API criptográfica de Java. Un *hash* (SHA-256) produce una huella de integridad, no confidencialidad. Un *MAC* (HMAC) autentica integridad con clave compartida. *AES-GCM* es cifrado autenticado (AEAD): provee confidencialidad e integridad/autenticidad del ciphertext y AAD.

**Contrato / invariantes / reglas.** No inventar algoritmos ni modos propios. Usar `SecureRandom` para IVs/claves cuando corresponda. En AES-GCM, el IV/nonce no debe reutilizarse con la misma clave. La clave debe tener tamaño adecuado y almacenarse de forma segura. `AEADBadTagException` indica autenticidad/integridad fallida: no aceptar el plaintext. Hash != cifrado != firma; cada primitiva resuelve un problema distinto.

**Modelo mental.** Hash es huella digital; HMAC es huella con sello compartido; AES-GCM es un sobre cerrado con sello de seguridad que se rompe si lo alteran.

**Implementación desde cero**

```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class DemoCripto {
    public static void main(String[] args) throws Exception {
        byte[] datos = "guia=G-1;estado=OK".getBytes();

        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] hash = sha.digest(datos);
        System.out.println("sha256=" + Base64.getEncoder().encodeToString(hash).substring(0, 12));

        KeyGenerator kgH = KeyGenerator.getInstance("HmacSHA256");
        SecretKey claveHmac = kgH.generateKey();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(claveHmac);
        System.out.println("hmac=" + Base64.getEncoder().encodeToString(mac.doFinal(datos)).substring(0, 12));

        KeyGenerator kgA = KeyGenerator.getInstance("AES");
        kgA.init(256);
        SecretKey claveAes = kgA.generateKey();
        byte[] iv = new byte[12];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, claveAes, new GCMParameterSpec(128, iv));
        byte[] cifrado = cipher.doFinal(datos);

        Cipher dec = Cipher.getInstance("AES/GCM/NoPadding");
        dec.init(Cipher.DECRYPT_MODE, claveAes, new GCMParameterSpec(128, iv));
        byte[] claro = dec.doFinal(cifrado);
        System.out.println(new String(claro));
    }
}
```

**Desglose del código**

- `SHA-256` genera una huella; el mismo input produce la misma huella.
- `HmacSHA256` requiere clave compartida; valida integridad y origen compartido.
- `AES/GCM/NoPadding` cifra y autentica. El tag GCM detecta alteraciones.
- El IV de 12 bytes se genera aleatorio por cifrado; nunca se reutiliza con la misma clave.

**Ejecución y salida real**

```bash
javac DemoCripto.java
java DemoCripto
```

Salida esperada (prefijos varían por aleatoriedad):

```text
sha256=...
hmac=...
guia=G-1;estado=OK
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Reutilizaste IV en AES-GCM | Rompe seguridad gravemente | Genera IV nuevo con `SecureRandom` por cifrado |
| Usas hash para confidencialidad | Mal uso de primitiva | Usa cifrado autenticado (AES-GCM) |
| Inventas tu algoritmo | Vulnerabilidad casi segura | Usa JCA y primitivas estándar |

**Verificación rápida**

```bash
javac DemoCripto.java && java DemoCripto
```

Modifica un byte del `cifrado` antes de descifrar en un experimento: debe fallar con `AEADBadTagException`.

## Cierre del módulo

HTTP seguro y criptografía correcta dependen de disciplina: timeouts, validación, manejo de secretos, primitivas estándar y verificación de fallos. Con esto estás listo para construir backends en Spring Boot con una base de seguridad más sólida.
