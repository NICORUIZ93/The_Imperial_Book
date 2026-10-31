# Módulo 18: HTTP, seguridad y backend con Java

**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

Java estándar incluye un cliente HTTP moderno, pero un cliente seguro no equivale a un servidor seguro. En este módulo construirás una llamada saliente robusta y reconocerás cómo transportar credenciales sin confundir JWT con autorización.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** consulta un `/health` local con `HttpClient`, límite de conexión y límite total; prueba 200, 404 y timeout.
- **Caso RutaFlow:** consulta un proveedor de geocodificación con host configurado por entorno, allowlist, TLS, `X-Correlation-ID` y presupuesto total de tiempo. Un 503 puede reintentarse con backoff y jitter; un POST de liquidación no se reintenta sin una clave idempotente.

La prueba real debe incluir timeout, límite de intentos, respuesta inválida y rechazo de destino no permitido. La autenticación del proveedor no autoriza por sí sola a un usuario de RutaFlow para consultar el envío de otro tenant.

### Tema 1: HttpClient, REST, timeouts y fallos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás enviar un GET HTTP con `HttpClient`, timeout acotado, validación del estado y parseo separado de la respuesta. Requiere JDK 25+ y una API de prueba local o simulada.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
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

**Ejecuta el ejemplo:**

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

#### Paso 7 · Cierre

Entrega tests de éxito, 404, 503 y timeout con número de intentos comprobado para el proyecto integrador de RutaFlow, usando el cliente para consultar un proveedor externo; como siguiente paso transporta una credencial de forma segura sobre ese mismo cliente. Errores comunes: no fijar un timeout explícito y dejar que una API externa caída bloquee hilos indefinidamente, reintentar automáticamente un POST no idempotente ante una respuesta perdida, y cargar un cuerpo de respuesta potencialmente enorme completo en memoria sin un `BodyHandler` de streaming. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html.
**¿Por qué es importante?** Porque un timeout explícito y un manejo de errores diferenciado por código de estado protegen la capacidad del propio servicio cuando una dependencia externa falla o no responde, en vez de acumular hilos bloqueados indefinidamente.
**Conceptos clave:** `HttpClient`, `HttpRequest`/`HttpResponse`, timeout, reintento idempotente con backoff y jitter.

**Cuándo no usarlo:** llamadas con cuerpo enorme no deben cargarse sin límite en memoria; usa un `BodyHandler` de streaming.

### Tema 2: Tokens, validación y límites de seguridad

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar y probar el transporte seguro de una credencial bearer, validar datos no confiables y distinguir autenticación de autorización. El ejercicio usa una API local de laboratorio; no implementes criptografía propia.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
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

**Ejecuta el ejemplo:**

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

#### Paso 7 · Cierre

Entrega pruebas del header, validación y denegación, sin incluir credenciales reales, como incremento del proyecto integrador de RutaFlow: cada consulta de envío debe comprobar la propiedad o el permiso además del rol; con esto cerrás el módulo. Errores comunes: registrar el token completo en logs o guardarlo en el código fuente, confundir un token válido (autenticación) con permiso sobre un recurso específico (autorización), y validar una URL externa solo con una expresión regular en vez de resolver DNS y bloquear rangos privados. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/java/net/http/HttpClient.html y https://cheatsheetseries.owasp.org/.
**¿Por qué es importante?** Porque la identidad (quién eres), los permisos sobre cada recurso específico (qué podés hacer con ESTE envío) y la protección de la credencial misma resuelven tres amenazas distintas; un token válido nunca implica por sí solo que su dueño pueda leer cualquier recurso.
**Conceptos clave:** JWT, OAuth 2.0, OpenID Connect, autenticación frente a autorización, SSRF.

**Cuándo no usarlo:** no guardes contraseñas dentro de JWT ni uses JWT como sustituto automático de sesiones; el servidor debe poder revocar o limitar tokens según el diseño.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
