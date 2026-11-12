# Módulo 18: HTTP, seguridad y backend con Java

## Aprende construyendo

Java estándar incluye un cliente HTTP moderno, pero un cliente seguro no equivale a un servidor seguro. En este módulo construirás una llamada saliente robusta y reconocerás cómo transportar credenciales sin confundir JWT con autorización.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** consulta un `/health` local con `HttpClient`, límite de conexión y límite total; prueba 200, 404 y timeout.
- **Caso RutaFlow:** consulta un proveedor de geocodificación con host configurado por entorno, allowlist, TLS, `X-Correlation-ID` y presupuesto total de tiempo. Un 503 puede reintentarse con backoff y jitter; un POST de liquidación no se reintenta sin una clave idempotente.

La prueba real debe incluir timeout, límite de intentos, respuesta inválida y rechazo de destino no permitido. La autenticación del proveedor no autoriza por sí sola a un usuario de RutaFlow para consultar el envío de otro tenant.

### Tema 1: HttpClient, REST, timeouts y fallos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás enviar un GET HTTP con `HttpClient`, timeout acotado, validación del estado y parseo separado de la respuesta. Requiere JDK 25+ y una API de prueba local o simulada. Comprueba `java -version` y crea la carpeta `mkdir -p java-http-t01/src`.
**Conocimiento previo:** Java M0 Temas 1–3 (clases, excepciones y métodos); no se necesita un servidor externo.
#### Paso 2 · Contexto y caso real

El servicio de envíos consulta una API externa para validar una dirección. Si esa API no responde, los hilos pueden quedar ocupados y acumular solicitudes.

#### Paso 3 · Teoría y modelo mental

`HttpClient` reutilizable administra conexiones; `HttpRequest` define destino, método, headers y timeout; `HttpResponse` contiene estado y cuerpo. Un timeout limita la espera, pero no crea un retry seguro. Reintenta solo fallos transitorios y operaciones idempotentes, con límite, espera creciente y jitter. No reintentes automáticamente un POST que podría haber sido aplicado aunque la respuesta se perdiera.

Piensa en el timeout como el tiempo máximo que mantienes abierta una llamada telefónica, no como una garantía de que el otro sistema no haya recibido el mensaje.
**Analogía:** llamar a un servicio remoto es como pedir algo por teléfono a otra oficina: a veces no contestan (timeout), a veces contestan tarde o con un "no" (fallo). El `HttpClient` es tu teléfono; poner un timeout es colgar si nadie responde en vez de esperar para siempre con el auricular en la oreja.
#### Paso 4 · Demostración guiada

En `src/main/java/academia/http/ConsultaDireccion.java`:

```java
package academia.http;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public final class ConsultaDireccion {
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(2))
        .followRedirects(HttpClient.Redirect.NEVER)
        .build();

    public String consultar(URI uri) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri)
            .timeout(Duration.ofSeconds(3))
            .header("Accept", "application/json")
            .GET()
            .build();
        HttpResponse<String> response =
            client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("API respondió HTTP " + response.statusCode());
        }
        return response.body();
    }
}
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Ejecuta un servidor local de prueba y llama a `consultar(URI.create("http://localhost:8080/health"))`; ejecuta tests con `./mvnw test`.

**Resultado esperado:** HTTP 200 devuelve el cuerpo; 404 y timeout aparecen como errores explícitos. **Fallo deliberado:** elimina el timeout del request y detén el servidor de prueba; observa la llamada bloqueada. Restaura el límite y verifica que el test termina acotadamente.

#### Paso 5 · Práctica guiada

Agrega manejo distinto para 4xx, 5xx y timeout. Implementa un retry de máximo dos intentos únicamente para GET ante 502/503/504, con backoff. El test debe verificar el máximo de intentos y que un 400 no se reintenta.
**Pista:** si el test cuenta más de dos llamadas para un 503, o ve que un 400 también se reintentó, la condición del retry está mal acotada: debe comprobar el código de estado (502/503/504) Y el método (solo GET) antes de reintentar, no solo uno de los dos.

#### Paso 6 · Práctica independiente

Consume un endpoint de RutaFlow con un DTO validado. Añade correlación de request, límite de tamaño de respuesta y una allowlist de hosts configurada por el servicio. No aceptes URLs arbitrarias del usuario.

#### Subtema 1.1: Consultar un health local · 10 min

**1. Contexto**

Prueba el cliente sin depender de internet ni cuentas externas.

**2. Hazlo tú**

Crea `java-http-t01/src/Salud.java`:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class Salud {
    public static void main(String[] args) throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/health", exchange -> {
            byte[] body = "ok".getBytes();
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/health");
            var request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(2)).GET().build();
            var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("HTTP " + response.statusCode() + ": " + response.body());
        } finally { server.stop(0); }
    }
}
```

Ejecuta `java --add-modules jdk.httpserver java-http-t01/src/Salud.java`.

**Resultado esperado:** `HTTP 200: ok`.

**Fallo deliberado**: cambia `/health` por `/healthz`. **Resultado del fallo:** el estado pasa a HTTP 404; el servidor devuelve su respuesta 404 por defecto. **Diagnóstico:** la ruta no coincide con la que registró el servidor local.

**3. Entiende**

El puerto 0 permite que el sistema elija uno libre; el programa consulta el puerto asignado.

**4. Cierra**

Guarda respuesta y estado HTTP observados.

#### Subtema 1.2: Mostrar el motivo de un 404 · 10 min

**1. Contexto**

una respuesta HTTP puede llegar bien y comunicar que el recurso no existe.

**2. Hazlo tú**

Crea `java-http-t01/src/NoExiste.java`:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class NoExiste {
    public static void main(String[] args) throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/envios/RT-404", e -> {
            byte[] body = "Guía no existe".getBytes();
            e.sendResponseHeaders(404, body.length);
            e.getResponseBody().write(body);
            e.close();
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/envios/RT-404");
            var request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(2)).GET().build();
            var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200)
                throw new IllegalStateException("API respondió HTTP " + response.statusCode() + ": " + response.body());
        } finally { server.stop(0); }
    }
}
```

Ejecuta `java --add-modules jdk.httpserver java-http-t01/src/NoExiste.java`.

**Resultado esperado:** `IllegalStateException: API respondió HTTP 404: Guía no existe`.

**Fallo deliberado**: acepta cualquier estado menor que 500. **Resultado del fallo:** el 404 pasa como si fuera éxito. **Diagnóstico:** la conexión contestó, pero no encontró el envío.

**3. Entiende**

Comprueba estado y cuerpo antes de entregar una respuesta como resultado válido.

**4. Cierra**

Conserva la respuesta 404 y el texto que diagnosticó la ruta.

#### Subtema 1.3: Limitar la espera con timeout · 10 min

**1. Contexto**

Si una dependencia tarda demasiado, el cliente debe dejar libre el hilo y reportar el timeout.

**2. Hazlo tú**

Crea `java-http-t01/src/Espera.java`:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.*;
import java.net.http.HttpTimeoutException;
import java.time.Duration;

public class Espera {
    public static void main(String[] args) throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/lento", e -> {
            try { Thread.sleep(800); } catch (InterruptedException x) { Thread.currentThread().interrupt(); }
            try { e.sendResponseHeaders(200, -1); } catch (Exception ignored) { }
            e.close();
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/lento");
            var request = HttpRequest.newBuilder(uri).timeout(Duration.ofMillis(100)).GET().build();
            try { HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString()); }
            catch (HttpTimeoutException e) { System.out.println("timeout: 100 ms"); }
        } finally { server.stop(0); }
    }
}
```

Ejecuta `java --add-modules jdk.httpserver java-http-t01/src/Espera.java`.

**Resultado esperado:** `timeout: 100 ms`.

**Fallo deliberado**: sube el timeout a 2 segundos. **Resultado del fallo:** el request acaba después de la demora y no informa timeout. **Diagnóstico:** el límite ahora es mayor que los 800 ms simulados.

**3. Entiende**

timeout limita cuánto espera el cliente; no demuestra que el servidor no recibiera el request.

**4. Cierra**

Anota el timeout configurado, el observado y por qué el servidor aún pudo recibir la petición.

#### Subtema 1.4: Reintentar un GET con un límite · 15 min

**1. Contexto**

 un 503 puede ser temporal; repetir indefinidamente aumenta la carga cuando el proveedor está caído.

**2. Hazlo tú**

Crea `java-http-t01/src/Reintento.java`:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Reintento {
    public static void main(String[] args) throws Exception {
        var llamadas = new AtomicInteger();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/cotizacion", e -> {
            int status = llamadas.incrementAndGet() == 1 ? 503 : 200;
            byte[] body = (status == 200 ? "ok" : "temporal").getBytes();
            e.sendResponseHeaders(status, body.length);
            e.getResponseBody().write(body);
            e.close();
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/cotizacion");
            for (int intento = 1; intento <= 2; intento++) {
                var request = HttpRequest.newBuilder(uri).GET().build();
                var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
                System.out.println("intento=" + intento + " HTTP " + response.statusCode());
                if (response.statusCode() != 503) break;
                Thread.sleep(50);
            }
            System.out.println("llamadas=" + llamadas.get());
        } finally { server.stop(0); }
    }
}
```

Ejecuta `java --add-modules jdk.httpserver java-http-t01/src/Reintento.java`.

**Resultado esperado:** `intento=1 HTTP 503`, `intento=2 HTTP 200`, `llamadas=2`.

**Fallo deliberado**: cambia GET por un POST que liquida un pago y conserva el retry. **Resultado del fallo:** el pago podría enviarse dos veces. **Diagnóstico:** un POST de escritura necesita idempotencia y una política acordada antes de repetirlo.

**3. Entiende**

Limita intentos y espera; decide qué operación se puede repetir antes de automatizar el retry.

#### Paso 7 · Cierre y evidencia

Entrega tests de éxito, 404, 503 y timeout con número de intentos comprobado para el proyecto integrador de RutaFlow, usando el cliente para consultar un proveedor externo; como siguiente paso transporta una credencial de forma segura sobre ese mismo cliente. Errores comunes: no fijar un timeout explícito y dejar que una API externa caída bloquee hilos indefinidamente, reintentar automáticamente un POST no idempotente ante una respuesta perdida, y cargar un cuerpo de respuesta potencialmente enorme completo en memoria sin un `BodyHandler` de streaming. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html.
**¿Por qué es importante?** Porque un timeout explícito y un manejo de errores diferenciado por código de estado protegen la capacidad del propio servicio cuando una dependencia externa falla o no responde, en vez de acumular hilos bloqueados indefinidamente.
**Evidencia de aprendizaje:** entrega los tests de éxito (200), error de cliente (404) y timeout, junto con el reintento acotado verificado solo para operaciones idempotentes.
**Conceptos clave:** `HttpClient`, `HttpRequest`/`HttpResponse`, timeout, reintento idempotente con backoff y jitter.

**Cuándo no usarlo:** llamadas con cuerpo enorme no deben cargarse sin límite en memoria; usa un `BodyHandler` de streaming.

**4. Cierra**

Guarda secuencia de respuestas y cantidad de intentos.

### Tema 2: Tokens, validación y límites de seguridad

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar y probar el transporte seguro de una credencial bearer, validar datos no confiables y distinguir autenticación de autorización. El ejercicio usa una API local de laboratorio; no implementes criptografía propia. Crea la carpeta `mkdir -p java-http-t02/src`.
**Conocimiento previo:** Java M18 Tema 1 (cliente HTTP y estados de respuesta) y Java M0 Temas 1–3; usa credenciales ficticias del laboratorio.
#### Paso 2 · Contexto y caso real

El cliente móvil envía el token de un usuario junto a una solicitud de consulta. Un token válido confirma una identidad, pero no demuestra que ese usuario pueda leer cualquier envío.

#### Paso 3 · Teoría y modelo mental

JWT es un formato de claims firmado, no necesariamente cifrado: quien lo obtiene puede leer sus claims. OAuth 2.0 es un marco de autorización; OpenID Connect añade una capa de identidad. Un cliente Java normalmente obtiene un token de un proveedor confiable y lo envía por HTTPS como `Authorization: Bearer ...`; el servidor valida firma, emisor, audiencia, expiración y permisos. No registres tokens ni los guardes en el código fuente.

Valida longitud, formato, rangos y reglas de negocio en cada frontera. Las consultas parametrizadas evitan inyección SQL, pero no reemplazan autorización por objeto. Para SSRF, valida esquema/host, resuelve DNS y bloquea rangos privados/no enrutable también en la conexión; una comprobación textual de URL no es suficiente.
**Analogía:** un token es como la pulsera de un festival: demuestra que pagaste la entrada sin tener que mostrar el DNI en cada puesto. Validarlo es revisar que la pulsera sea auténtica y no haya caducado; el límite de seguridad es que la pulsera de la zona general no te abre el backstage.
#### Paso 4 · Demostración guiada

En el cliente del tema anterior, añade una credencial cargada desde una variable de entorno y evita imprimirla:

```java
String token = System.getenv("ACADEMIA_API_TOKEN");
if (token == null || token.isBlank()) {
    throw new IllegalStateException("Falta ACADEMIA_API_TOKEN");
}

HttpRequest request = HttpRequest.newBuilder(uri)
    .timeout(Duration.ofSeconds(3))
    .header("Authorization", "Bearer " + token)
    .GET()
    .build();
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Ejecuta con `ACADEMIA_API_TOKEN=token-de-prueba ./mvnw test` (en PowerShell, configura `$env:ACADEMIA_API_TOKEN` antes). Un test con servidor stub debe comprobar el header sin escribir el valor en logs.

**Resultado esperado:** el servidor de laboratorio recibe el bearer; no hay secreto en el repositorio. **Fallo deliberado:** usa HTTP plano contra una máquina externa o registra el header completo. Identifica exposición en tránsito/logs y retira ambas prácticas; no uses tokens reales.

#### Paso 5 · Práctica guiada

Prueba valores vacíos, excesivamente largos y con formato inválido antes de construir el request. A continuación intenta consultar una IP privada con una URL configurada externamente: debe rechazarse por política, no por una expresión regular improvisada.
**Pista:** si tu validación solo revisa el texto de la URL (por ejemplo, rechazar "localhost" con una expresión regular), una URL que resuelve por DNS a `127.0.0.1` la esquiva igual; resuelve el host primero y bloquea el rango de IP resultante, no solo el string original.
#### Paso 6 · Práctica independiente

Diseña una matriz de autorización para `envio:leer`, `envio:asignar` y `envio:liquidar`. Escribe pruebas de acceso permitido/denegado y agrega expiración corta al token de test. Explica por qué TLS, expiración, audience y autorización de propiedad resuelven problemas diferentes.

#### Subtema 2.1: Enviar un bearer local sin imprimir el secreto · 10 min

**1. Contexto**

El servidor debe recibir una credencial ficticia sin que el programa la escriba en la terminal.

**2. Hazlo tú**

Crea `java-http-t02/src/BearerLocal.java`:

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.*;

public class BearerLocal {
    public static void main(String[] args) throws Exception {
        String token = System.getenv("ACADEMIA_API_TOKEN");
        if (token == null || token.isBlank()) throw new IllegalStateException("Falta ACADEMIA_API_TOKEN");
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/privado", e -> {
            boolean presente = ("Bearer " + token).equals(e.getRequestHeaders().getFirst("Authorization"));
            byte[] body = (presente ? "credencial presente" : "credencial ausente").getBytes();
            e.sendResponseHeaders(presente ? 200 : 401, body.length);
            e.getResponseBody().write(body);
            e.close();
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/privado");
            var request = HttpRequest.newBuilder(uri).header("Authorization", "Bearer " + token).GET().build();
            var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("HTTP " + response.statusCode() + ": " + response.body());
        } finally { server.stop(0); }
    }
}
```

Ejecuta `ACADEMIA_API_TOKEN=prueba-local java --add-modules jdk.httpserver java-http-t02/src/BearerLocal.java` (PowerShell: `$env:ACADEMIA_API_TOKEN='prueba-local'; java --add-modules jdk.httpserver java-http-t02/src/BearerLocal.java`).

**Resultado esperado:** `HTTP 200: credencial presente`; la salida nunca muestra el token.

**Fallo deliberado**: agrega `System.out.println(token)`. **Resultado del fallo:** se expone el valor ficticio en la terminal. **Diagnóstico:** registra si hay credencial, nunca su contenido; en producción usa un secreto real solo desde un gestor de secretos y HTTPS.

**3. Entiende**

El laboratorio usa token inventado y loopback; no pegues secretos reales en comandos o código.

**4. Cierra**

Conserva prueba válida, faltante y token ficticio sin copiar el secreto.

#### Subtema 2.2: Rechazar destinos fuera de una lista permitida · 10 min

**1. Contexto**

no permitas que una URL externa apunte a una consola o base de datos interna.

**2. Hazlo tú**

Crea `java-http-t02/src/DestinoSeguro.java`:

```java
import java.net.URI;
import java.util.Set;

public class DestinoSeguro {
    static URI validar(String valor) {
        URI uri = URI.create(valor);
        if (!"https".equalsIgnoreCase(uri.getScheme())) throw new IllegalArgumentException("Se requiere HTTPS");
        if (!Set.of("api.rutaflow.example").contains(uri.getHost()))
            throw new IllegalArgumentException("Host fuera de allowlist");
        if (uri.getUserInfo() != null) throw new IllegalArgumentException("No se permite userinfo");
        return uri;
    }
    public static void main(String[] args) {
        try { validar("http://127.0.0.1/admin"); }
        catch (IllegalArgumentException e) { System.out.println("rechazada: " + e.getMessage()); }
    }
}
```

Ejecuta `java java-http-t02/src/DestinoSeguro.java`.

**Resultado esperado:** `rechazada: Se requiere HTTPS`.

**Fallo deliberado**: quita la comprobación del host y prueba `https://127.0.0.1/admin`. **Resultado del fallo:** el destino privado pasa el chequeo de esquema. **Diagnóstico:** HTTPS cifra el canal, no restringe el destino; en producción combina allowlist con bloqueo de rangos privados en red y revisión de DNS/redirecciones.

**3. Entiende**

 una URL con esquema seguro aún puede apuntar a una dirección prohibida.

**4. Cierra**

Guarda los dos destinos permitidos y el rechazado.

#### Subtema 2.3: Comprobar quién puede leer cada envío · 10 min

**1. Contexto**

 autenticar a Ana no significa que pueda leer los envíos de otras personas.

**2. Hazlo tú**

Crea `java-http-t02/src/Propiedad.java`:

```java
public class Propiedad {
    record Envio(String guia, String propietario) {}
    static boolean puedeLeer(String usuario, Envio envio) {
        return usuario.equals(envio.propietario());
    }
    public static void main(String[] args) {
        var envio = new Envio("RT-8", "ana");
        System.out.println("ana=" + puedeLeer("ana", envio));
        System.out.println("leo=" + puedeLeer("leo", envio));
    }
}
```

Ejecuta `java java-http-t02/src/Propiedad.java`.

**Resultado esperado:** `ana=true` y `leo=false`.

**Fallo deliberado**: haz que `puedeLeer` siempre devuelva `true`. **Resultado del fallo:** Leo obtiene acceso al envío de Ana. **Diagnóstico:** comprobar el rol general no comprueba la propiedad de este objeto.

**3. Entiende**

Decide el permiso para cada envío y acción, además de validar la identidad.

**4. Cierra**

Conserva una autorización permitida y otra denegada.

#### Subtema 2.4: Rechazar identificadores con formato inválido · 10 min

**1. Contexto**

 valida una guía antes de pasarla a SQL o a otro servicio.

**2. Hazlo tú**

Crea `java-http-t02/src/ValidarGuia.java`:

```java
public class ValidarGuia {
    static String validar(String guia) {
        if (guia == null || !guia.matches("RT-[0-9]{1,6}"))
            throw new IllegalArgumentException("Guía inválida");
        return guia;
    }
    public static void main(String[] args) {
        System.out.println(validar("RT-82"));
        try { System.out.println(validar("RT-82 OR 1=1")); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

Ejecuta `java java-http-t02/src/ValidarGuia.java`.

**Resultado esperado:** `RT-82` y después `Guía inválida`.

**Fallo deliberado**: reemplaza la expresión completa por `guia.startsWith("RT-")`. **Resultado del fallo:** `RT-82 OR 1=1` pasa. **Diagnóstico:** un prefijo no valida toda la entrada; comprueba el formato completo y usa consultas parametrizadas en la capa de datos.

**3. Entiende**

Formato, autorización y parametrización SQL resuelven problemas distintos.

#### Paso 7 · Cierre y evidencia

Entrega pruebas del header, validación y denegación, sin incluir credenciales reales, como incremento del proyecto integrador de RutaFlow: cada consulta de envío debe comprobar la propiedad o el permiso además del rol; con esto cerrás el módulo. Errores comunes: registrar el token completo en logs o guardarlo en el código fuente, confundir un token válido (autenticación) con permiso sobre un recurso específico (autorización), y validar una URL externa solo con una expresión regular en vez de resolver DNS y bloquear rangos privados. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html y https://cheatsheetseries.owasp.org/.
**¿Por qué es importante?** Porque la identidad (quién eres), los permisos sobre cada recurso específico (qué podés hacer con ESTE envío) y la protección de la credencial misma resuelven tres amenazas distintas; un token válido nunca implica por sí solo que su dueño pueda leer cualquier recurso.
**Evidencia de aprendizaje:** entrega la prueba del header `Authorization: Bearer` sin exponerlo en logs, la validación de entradas hostiles, y el rechazo de una URL con IP privada por política explícita.
**Conceptos clave:** JWT, OAuth 2.0, OpenID Connect, autenticación frente a autorización, SSRF.

**Cuándo no usarlo:** no guardes contraseñas dentro de JWT ni uses JWT como sustituto automático de sesiones; el servidor debe poder revocar o limitar tokens según el diseño.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**4. Cierra**

Guarda entrada válida, inválida y la regla que la rechazó.
