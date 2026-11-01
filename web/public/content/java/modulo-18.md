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

**Fuentes oficiales:** [HttpClient, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html) y [HttpServer, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html).

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

**Fuentes oficiales:** [HttpClient, JDK 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html), [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/), [OAuth 2.0](https://oauth.net/2/) y [OpenID Connect](https://openid.net/developers/how-connect-works/).

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
