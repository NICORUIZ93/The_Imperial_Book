# Módulo 10: Microservicios con Spring Cloud


## Aprende construyendo

Cada tema demuestra un patrón de Spring Cloud con verificación real: config server nativo servido por HTTP, `SimpleDiscoveryClient` real de Spring Cloud Commons, Gateway enrutando de verdad contra un backend embebido, un `CircuitBreaker` de Resilience4j abriéndose por conteo real de fallos, seguridad de recurso probada con el post-processor oficial de `spring-security-test`, y un deadline HTTP real medido en milisegundos. Continúa sobre el proyecto `demo-cloud`.

### Tema 1: Config Server y service discovery

**Duración estimada:** 35 min.
**¿Por qué es importante?** Un Config Server entrega valores por aplicación y perfil; un DiscoveryClient resuelve nombres de servicio a direcciones sin fijar la URL en cada consumidor.
**Prerrequisitos:** Spring Boot M0 T1 y saber iniciar una app web. El laboratorio usa Boot 4.1.2, Java 25 y Spring Cloud 2025.1.4; Spring Cloud requiere la versión 2025.1.2 o posterior para Boot 4.1.x. Si generas otra versión, revisa la matriz antes de mezclar dependencias.
**Proyecto continuo:** crear un servicio de pedidos que obtiene su configuración y resuelve una instancia de catálogo.

#### Subtema 1.1: Sirve configuración desde archivos · 15 min

**1. Contexto**
Un servicio de pedidos debe obtener un valor compartido por HTTP para que puedas cambiarlo sin editar su código fuente.

**2. Hazlo tú**
Crea el proyecto `demo-config-server` con Spring Initializr, Java 25 y las dependencias web y `cloud-config-server`. Spring Initializr selecciona el BOM compatible. Para ejecutar la versión comprobada que acompaña este curso, usa `examples/spring-cloud-config-discovery-rutaflow/` desde la raíz del repositorio:

```bash
cd examples/spring-cloud-config-discovery-rutaflow
./mvnw -q clean test
```

Inspecciona `src/main/resources/application.yml`. Esta es la configuración completa del laboratorio; `accept-empty: false` permite distinguir una app sin archivos con un 404:

```yaml
server:
  port: 8888
spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        native:
          search-locations: classpath:/config
  profiles:
    active: native
```

Crea src/main/resources/config/servicio-pedidos.yml:

```yaml
pedidos:
  descuento-maximo: 15
```

Reemplaza src/main/java/com/example/democonfigserver/DemoConfigServerApplication.java por:

```java
package com.example.democonfigserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class DemoConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoConfigServerApplication.class, args);
    }
}
```

Desde la carpeta del laboratorio, arranca la aplicación:

```bash
./mvnw spring-boot:run
```

En otra terminal, consulta el perfil default:

```bash
curl -i http://localhost:8888/servicio-pedidos/default
```

**Resultado esperado:** las pruebas pasan y HTTP devuelve 200 con un Environment que incluye `descuento-maximo` con valor 15. Para ver el JSON, ejecuta `./mvnw spring-boot:run` y en otra terminal repite el `curl`.

**Fallo deliberado:** cambia `search-locations` a `classpath:/configs` y ejecuta otra vez `./mvnw -q test`. **Error esperado:** falla la prueba HTTP porque el servidor no encuentra el YAML. **Diagnóstico:** el archivo está en `src/main/resources/config`, pero el servidor busca `configs`; restaura `classpath:/config`.

**3. Entiende**
El perfil native permite leer archivos del classpath o del sistema de archivos sin un remoto Git. La ruta HTTP combina el nombre de aplicación y el perfil para construir el Environment que recibe el cliente.

**4. Cierra**
Guarda la respuesta de curl y señala la propiedad que leyó el servidor.

#### Subtema 1.2: Separa configuración por perfil y diagnostica una app desconocida · 10 min

**1. Contexto**
El descuento permitido puede cambiar entre desarrollo y producción; un nombre de aplicación mal escrito debe diagnosticarse mirando el Environment que devolvió el servidor.

**2. Hazlo tú**
Abre `src/main/resources/config/servicio-pedidos-produccion.yml`, que ya contiene esta configuración, y compárala con `servicio-pedidos.yml`:

```yaml
pedidos:
  descuento-maximo: 5
```

Consulta las dos rutas:

```bash
curl -s http://localhost:8888/servicio-pedidos/default
curl -s http://localhost:8888/servicio-pedidos/produccion
curl -i http://localhost:8888/servicio-inexistente/default
```

**Resultado esperado:** default informa 15 y produccion informa 5. Con la configuración predeterminada, el nombre inexistente puede responder 200 con un Environment sin propertySources útiles.

En este laboratorio, `accept-empty: false` hace que la ruta de aplicación desconocida devuelva 404; `sirveConfiguracionDefaultYProduccionPorHttp` prueba los dos perfiles y `rechazaUnNombreDeAplicacionQueNoTieneArchivo` comprueba ese caso.

**Fallo deliberado:** cambia la ruta del perfil `produccion` a `producion`. **Resultado erróneo esperado:** la propiedad no toma el valor 5. **Diagnóstico:** compara el nombre escrito en la URL con el sufijo del archivo; restaura `produccion`. En el laboratorio el nombre desconocido devuelve 404 por `spring.cloud.config.server.accept-empty: false`.

**3. Entiende**
El perfil corresponde al sufijo del archivo, por ejemplo `servicio-pedidos-produccion.yml`. El Config Server puede aceptar una configuración vacía; para que el cliente detecte un ID no encontrado, este laboratorio establece `accept-empty: false`.

**4. Cierra**
Entrega las dos respuestas válidas y explica por qué la respuesta de una app desconocida debe inspeccionarse.

#### Subtema 1.3: Resuelve una instancia por nombre lógico · 10 min

**1. Contexto**
El servicio de pedidos debe encontrar catálogo mediante su nombre de servicio y una dirección configurada, sin guardar esa URL dentro de su código.

**2. Hazlo tú**
Abre `src/test/java/academia/rutaflow/cloud/ConfigServerAndDiscoveryTest.java` y localiza `resuelveInstanciaCatalogoConSimpleDiscoveryClient`. Ejecuta el test desde la carpeta del laboratorio:

```java
package com.example.democonfigserver;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties =
    "spring.cloud.discovery.client.simple.instances.catalogo[0].uri=http://localhost:8081")
class DiscoveryClientTest {
    @Autowired
    private DiscoveryClient discoveryClient;

    @Test
    void encuentraLaInstanciaConfiguradaPorNombre() {
        List<ServiceInstance> instancias = discoveryClient.getInstances("catalogo");

        assertThat(instancias).hasSize(1);
        assertThat(instancias.get(0).getUri().toString())
            .isEqualTo("http://localhost:8081");
    }
}
```

Desde la raíz del proyecto, ejecuta:

```bash
./mvnw -q -Dtest=ConfigServerAndDiscoveryTest#resuelveInstanciaCatalogoConSimpleDiscoveryClient test
```

**Resultado esperado:** BUILD SUCCESS y una instancia cuyo URI es http://localhost:8081.

**Fallo deliberado:** cambia `getInstances("catalogo")` por `getInstances("pedidos")` y ejecuta el test de nuevo. **Error esperado:** la aserción falla porque no existe una instancia con ese nombre lógico. **Diagnóstico:** el ID consultado debe coincidir con la clave `catalogo` en `spring.cloud.discovery.client.simple.instances` de `application.yml`.

**3. Entiende**
SimpleDiscoveryClient obtiene instancias desde propiedades y permite probar el contrato DiscoveryClient sin operar un registro como Eureka o Consul. En producción el mecanismo de registro se selecciona según las necesidades de despliegue; este laboratorio solo demuestra la resolución por nombre.

**4. Cierra**
Entrega el resultado de la prueba y escribe el nombre lógico y la URI que resolvió.

**Hito del tema:**

- [ ] Levanté un Config Server native y serví un YAML por HTTP.
- [ ] Comparé configuración default y de producción.
- [ ] Diagnostiqué el resultado vacío para una aplicación inexistente.
- [ ] Resolví una URI mediante DiscoveryClient y SimpleDiscoveryClient.

**Diagrama del flujo:**

```mermaid
flowchart LR
  C[Cliente pide config] -->|GET /servicio-pedidos/default| S[Config Server]
  S -->|lee| F[classpath:/config/servicio-pedidos.yml]
  D[Cliente pide instancias] -->|getInstances catalogo| DC[SimpleDiscoveryClient]
  DC -->|resuelve| U[URI configurada]
```

**Fuentes oficiales:** [matriz de compatibilidad de Spring Cloud](https://spring.io/projects/spring-cloud), [backend nativo de Config Server](https://docs.spring.io/spring-cloud-config/reference/server/environment-repository/file-system-backend.html), [Environment y perfiles](https://docs.spring.io/spring-cloud-config/reference/server/environment-repository.html) y [SimpleDiscoveryClient](https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/common-abstractions.html).

**Transferencia al proyecto integrador:** carga el descuento desde configuración externa y resuelve por nombre la instancia del servicio que administra catálogo.

### Tema 2: Spring Cloud Gateway

El gateway recibe una petición y la reenvía al servicio elegido. En este tema vas a levantar dos procesos locales y comprobarlo con `curl`.

**¿Por qué es importante?** Con un gateway puedes ofrecer una dirección de entrada estable aunque los servicios vivan en procesos distintos. Cada petición debe llegar al servicio correcto y el servicio debe seguir autorizando sus propios datos.

**Prerrequisitos:** M10 T1 y saber iniciar una app Spring Boot. El ejemplo verificado usa Java 25, Boot 4.1.2 y Cloud 2025.1.4; para Boot 4.1.x la matriz de Spring Cloud pide la línea 2025.1.2 o posterior. Gateway WebFlux necesita Netty y WebFlux, no una app Servlet.
**Laboratorio del tema:** `examples/spring-gateway-rutaflow/`. Ejecuta sus pruebas desde esa carpeta con `./mvnw -q clean test`; las rutas y el servicio HTTP local se comprueban sin instalar otro servicio.

#### Subtema 2.1: Crea una ruta para pedidos · 15 min

**1. Contexto**

Piensa en el gateway como una recepción: mira la dirección solicitada y decide a qué servicio entregarla. Aquí `/api/pedidos/**` se envía al servicio que escucha en el puerto `8081`.

**2. Hazlo tú**

Crea un proyecto Spring Boot con el starter oficial `org.springframework.cloud:spring-cloud-starter-gateway-server-webflux` y el Spring Cloud BOM compatible con Boot. En `src/main/resources/application.yml`, escribe:

```yaml
server:
  port: 8080
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: pedidos
              uri: http://localhost:8081
              predicates:
                - Path=/api/pedidos/**
```

En `backend.py`, crea un backend pequeño para ver qué petición recibe:

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Pedidos(BaseHTTPRequestHandler):
    def do_GET(self):
        print("Ruta recibida:", self.path)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"id":1,"estado":"EN_RUTA"}')

HTTPServer(("localhost", 8081), Pedidos).serve_forever()
```

Ejecuta el backend con `python3 backend.py`; en otra terminal ejecuta `./mvnw spring-boot:run` desde el proyecto del gateway. Envía `curl -i http://localhost:8080/api/pedidos/1`.

**Resultado esperado:** la respuesta es `200` con `{"id":1,"estado":"EN_RUTA"}` y el backend imprime `/api/pedidos/1`.

**Fallo deliberado:** en `src/main/resources/application.yml`, cambia `uri` a `http://localhost:8082` y repite el `curl`. **Resultado esperado:** recibes `5xx` y no aparece una petición en el backend del puerto `8081`. **Diagnóstico:** la ruta coincidió, pero el destino no escucha en ese puerto; restaura `8081`.

**3. Entiende**

`Path` decide si la ruta coincide; `uri` indica el destino. El gateway reenvía el mismo path porque todavía no configuramos ningún filtro para cambiarlo.

**4. Cierra**

Guarda la respuesta de `curl` y la línea del backend como evidencia. Esas dos señales confirman que la respuesta atravesó ambos procesos.

#### Subtema 2.2: Cambia el path que recibe el servicio · 10 min

**1. Contexto**

El cliente puede usar `/api/pedidos/1` mientras que el servicio espera `/pedidos/1`. El filtro `StripPrefix=1` quita el primer segmento (`api`) antes de reenviar.

**2. Hazlo tú**

En `src/main/resources/application.yml`, agrega el filtro dentro de la misma ruta:

```yaml
              filters:
                - StripPrefix=1
```

Haz que `backend.py` responda solo cuando recibe `/pedidos/1`; para cualquier otro path responde `404`:

```python
        if self.path != "/pedidos/1":
            self.send_error(404)
            return
```

Reinicia el backend y prueba `curl -i http://localhost:8080/api/pedidos/1`.

**Resultado esperado:** `curl` recibe `200`; el backend imprime `/pedidos/1`. Si llamas al backend directamente con `/api/pedidos/1`, devuelve `404`.

**Fallo deliberado:** en `src/main/resources/application.yml`, cambia temporalmente `StripPrefix=1` por `StripPrefix=2`. Repite el `curl`. **Resultado esperado:** el backend imprime `/1` y devuelve `404`. **Diagnóstico:** el filtro quitó dos segmentos y el backend espera `/pedidos/1`; restablece `StripPrefix=1`.

**3. Entiende**

El filtro solo transforma el path en el salto del gateway al servicio. El cliente sigue usando `/api/pedidos/1`; el contrato interno del backend puede ser distinto.

**4. Cierra**

Anota ambos paths y explica en una frase dónde se quitó `api`: el registro del backend debe mostrar `/pedidos/1`.

#### Subtema 2.3: Diagnostica una ruta que no coincide · 10 min

**1. Contexto**

Una letra distinta en el predicado puede hacer que la petición no llegue al backend. Primero separa “no hubo ruta” de “el backend respondió con error”.

**2. Hazlo tú**

En `src/main/resources/application.yml`, cambia temporalmente `Path=/api/pedidos/**` por `Path=/api/entregas/**`. Ejecuta:

```bash
curl -i http://localhost:8080/api/pedidos/1
```

Mira si aparece una nueva línea en la terminal del backend. Luego revierte el cambio y repite.

**Resultado esperado:** con el path desalineado el gateway devuelve `404` y el backend no imprime una petición nueva; al restaurar `/api/pedidos/**`, llega al backend y vuelve `200`.

**Fallo deliberado:** deja configurado `Path=/api/entregas/**` e intenta diagnosticar solo mirando el `404`, sin mirar la terminal del backend. **Diagnóstico:** la respuesta por sí sola no identifica quién la produjo; comprueba si el backend recibió una petición y luego restaura el path de pedidos.

**3. Entiende**

Un `404` puede venir del gateway o del servicio. La línea del backend te ayuda a saber si la petición alcanzó el servicio. En producción, el gateway puede centralizar autenticación de entrada y trazas, pero cada servicio debe autorizar el acceso a los datos que posee.

**4. Cierra**

Conserva dos evidencias: respuesta y log del caso correcto; respuesta y ausencia de log del fallo deliberado. El siguiente tema protege llamadas entre servicios cuando el destino falla.

**Fuentes oficiales:** [matriz de compatibilidad Spring Cloud](https://spring.io/projects/spring-cloud), [starter y requisitos de Gateway WebFlux](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webflux/starter.html), [rutas y configuración](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webflux/configuration.html).

**Cuándo usarlo:** cuando varios servicios necesitan un punto de entrada con rutas compartidas. Si solo publicas un servicio sencillo, añade el gateway cuando exista una necesidad concreta de enrutamiento o políticas transversales.

### Tema 3: Circuit breaker con Resilience4j

**Duración:** 30 min. **Prerrequisitos:** Java `Supplier`, excepciones y códigos HTTP; M10 T1 da el contexto del servicio, pero Gateway no es requisito para comprender el circuito. El laboratorio usa Resilience4j 2.4.0 con Java 21+.
**Proyecto continuo:** RutaFlow protege la consulta HTTP de pedidos cuando el servicio responde con error.

**¿Por qué es importante?** Si cada petición espera hasta el timeout de un servicio caído, las llamadas pendientes consumen recursos y el fallo se propaga. El laboratorio usa un servicio HTTP local que responde 503 o 200; el circuito cuenta solicitudes HTTP, no solo excepciones inventadas en memoria.

#### Subtema 3.1: Abre el circuito después de cuatro fallos · 10 min

**1. Contexto**
El circuito mide resultados. No se abre por un solo fallo si todavía no alcanza el mínimo de llamadas configurado.

**2. Hazlo tú**
Abre `examples/spring-resilience-rutaflow/src/main/java/academia/rutaflow/resilience/CircuitBreakerConfiguration.java` y lee los dos límites `slidingWindowSize` y `minimumNumberOfCalls`. Ejecuta desde `examples/spring-resilience-rutaflow/`:

```bash
./mvnw -Dtest=CircuitBreakerBehaviorTest#abreDespuesDeCuatroFallosYBloqueaLaQuintaLlamada test
```

**Resultado esperado:** cuatro respuestas HTTP 503 medidas ponen el estado en `OPEN`; la prueba muestra cuatro solicitudes recibidas por el servicio local.

**Fallo deliberado:** en `newCircuitBreaker()`, cambia ambos valores `slidingWindowSize(4)` y `minimumNumberOfCalls(4)` a `10`, y vuelve a ejecutar la prueba. **Resultado esperado:** falla la expectativa `OPEN`, porque cuatro respuestas no llenan la ventana de diez. **Diagnóstico:** para una ventana por cantidad, Resilience4j limita el mínimo al tamaño de la ventana; si solo cambias el mínimo a 10 y la ventana sigue en 4, el mínimo efectivo sigue siendo 4. Restaura los dos valores a 4.

**3. Entiende**
La ventana guarda resultados recientes. El mínimo indica cuántos resultados hacen falta antes de decidir si el circuito abre.

**4. Cierra**
Anota el umbral, tamaño de ventana y cantidad mínima de llamadas.

#### Subtema 3.2: Comprueba que OPEN detiene llamadas reales · 10 min

**1. Contexto**
El circuito debe rechazar rápido cuando está abierto, sin volver a invocar el servicio que ya está fallando.

**2. Hazlo tú**
Abre `examples/spring-resilience-rutaflow/src/main/java/academia/rutaflow/resilience/PedidosClient.java` y localiza `executeSupplier`. Ejecuta desde `examples/spring-resilience-rutaflow/`:

```bash
./mvnw -Dtest=CircuitBreakerBehaviorTest#openImpideLaQuintaPeticionHttpAlBackend test
```

**Resultado esperado:** la quinta llamada lanza `CallNotPermittedException` y el contador permanece en `4`.

**Fallo deliberado:** en `PedidosClient.consultarPedido()`, cambia `return circuitBreaker.executeSupplier(this::solicitarPedido);` por `return solicitarPedido();`. **Resultado esperado:** la quinta solicitud también alcanza el backend y el contador llega a `5`; la prueba falla porque esperaba el mensaje de circuito abierto y solo cuatro visitas al backend. **Diagnóstico:** retiraste el circuito de la llamada; restaura `executeSupplier`.

**3. Entiende**
`OPEN` no repara el servicio remoto. Deja de enviarle llamadas y protege recursos locales; se puede combinar con timeout y fallback. La prueba cuenta solicitudes HTTP a un servidor local; no es una prueba distribuida ni de carga.

**4. Cierra**
Conserva el error de llamada bloqueada y explica qué valor comprobó el contador.

#### Subtema 3.3: Prueba recuperación en HALF_OPEN · 10 min

**1. Contexto**
Tras una pausa, el circuito permite unas pocas llamadas de prueba para saber si el servicio ya se recuperó.

**2. Hazlo tú**
Abre `examples/spring-resilience-rutaflow/src/test/java/academia/rutaflow/resilience/CircuitBreakerBehaviorTest.java` y ejecuta desde `examples/spring-resilience-rutaflow/`:

```bash
./mvnw -Dtest=CircuitBreakerBehaviorTest#vuelveACerradoCuandoLasDosLlamadasDePruebaTienenExito test
```

En esta prueba, `transitionToHalfOpenState()` fuerza la transición para no esperar el minuto configurado. La prueba verifica las solicitudes de recuperación, no el temporizador automático.

**Resultado esperado:** la prueba fuerza `HALF_OPEN`; dos respuestas correctas devuelven el estado a `CLOSED`.

**Fallo deliberado:** en `CircuitBreakerBehaviorTest.java`, después de la primera solicitud HTTP correcta, agrega `respuestaBackend = 503;` antes de la segunda. **Resultado esperado:** la segunda llamada falla y el circuito vuelve a abrir; falla la expectativa de respuesta 200 y de estado `CLOSED`. **Diagnóstico:** las dos llamadas permitidas durante HALF_OPEN deben tener éxito; elimina la línea añadida.

**3. Entiende**
La secuencia es `CLOSED → OPEN → HALF_OPEN → CLOSED` cuando la recuperación tiene éxito. En producción el temporizador y las métricas observan esos cambios.

**4. Cierra**
Dibuja los estados y registra cuántas llamadas se permiten en la prueba de recuperación.

**Hito del tema:**

- [ ] Cuatro fallos medidos abren el circuito.
- [ ] `OPEN` bloquea la quinta llamada antes de llegar al servicio.
- [ ] Dos llamadas de prueba exitosas cierran el circuito.
- [ ] Expliqué que el circuito limita fallos, no repara el servicio.

**Proyecto integrador:** protege la consulta de pedidos de RutaFlow y registra el fallback que verá la persona usuaria cuando el circuito esté abierto.

**Fuentes oficiales:** [Resilience4j CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker), [configuración de Resilience4j 2.4.0](https://github.com/resilience4j/resilience4j/blob/v2.4.0/resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/CircuitBreakerConfig.java) y [Spring Cloud CircuitBreaker con Resilience4j](https://docs.spring.io/spring-cloud-circuitbreaker/reference/spring-cloud-circuitbreaker-resilience4j.html). El laboratorio integra el núcleo de Resilience4j como bean Spring; no usa el starter de Spring Cloud CircuitBreaker.

### Tema 4: OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización

**Duración:** 45 min. **Prerrequisitos:** Spring Boot M4 de este track (Spring Security), métodos HTTP y lectura básica de JSON; M10 T2 se necesita para el cuarto subtema.

**¿Por qué es importante?** El Resource Server valida el token, pero el servicio debe decidir además qué acción y qué registro puede usar esa persona. Pasar por un gateway no sustituye esta decisión.

**Laboratorio:** `examples/spring-security-keycloak-rutaflow/`. El proyecto trae una app Boot, pruebas con tokens simulados, un realm importable y comandos para verificar tokens reales de Keycloak.

#### Subtema 4.1: Valida el emisor del token · 15 min

**1. Contexto**

Una firma válida no basta si el token lo emitió otro proveedor. El `issuer-uri` conecta el Resource Server con el documento OIDC y las claves públicas del realm que acepta.

**2. Hazlo tú**

Desde `examples/spring-security-keycloak-rutaflow/`, ejecuta las pruebas y revisa `src/main/resources/application.yml`:

```bash
./mvnw -q clean test
```

Para comprobar un issuer real, sigue en `README.md` las instrucciones para iniciar el realm local de Keycloak, solicitar el token de Ana y ejecutar la API. Sin bearer token, consulta `GET /api/pedidos/p-ana`; luego repite con el token.

**Resultado esperado:** las pruebas locales distinguen petición sin token (`401`) y token firmado por el realm (acceso permitido según las reglas). Con Keycloak levantado, Spring descubre el issuer y la API acepta la firma, vigencia y emisor del access token.

**Fallo deliberado:** cambia `http://localhost:8081/realms/rutaflow` por `/realms/realm-inexistente` en `application.yml`, inicia una petición con el token de Ana y observa el resultado. **Resultado esperado:** `401`; el decoder no puede validar el token contra el issuer indicado. Spring Security puede diferir la búsqueda OIDC hasta que recibe un bearer token, así que la app no necesariamente falla al iniciar. **Diagnóstico:** compara `iss` del token con `issuer-uri` y restaura el realm `rutaflow`.

**3. Entiende**

Spring Security obtiene metadatos y claves del issuer y valida la firma, expiración y claim `iss`. El test local usa un decoder simulado para probar autorización, así que no sustituye la llamada real a Keycloak.

**4. Cierra**

Guarda la respuesta sin token, la respuesta autenticada y el issuer exacto. Si Docker no está disponible, anota la verificación de Keycloak como pendiente; no marques la firma real como probada.

#### Subtema 4.2: Separa token válido de permiso de escritura · 10 min

**1. Contexto**

Luis puede presentar un token válido y aun así no tener permiso para guardar ubicaciones. El endpoint responde `403` porque identifica a Luis, pero su token no contiene el rol requerido.

**2. Hazlo tú**

Inspecciona `src/main/java/academia/rutaflow/security/ApiSecurity.java` y el realm `keycloak/rutaflow-realm.json`. Ejecuta cada prueba desde la carpeta del laboratorio:

```bash
./mvnw -q -Dtest=ApiSecurityTest#tokenSinRolDeEscrituraRecibe403 test
./mvnw -q -Dtest=ApiSecurityTest#rolDeEscrituraPermiteGuardarUbicacion test
```

La primera usa el bearer de prueba `luis`; la segunda usa `ana`, quien tiene el rol realm `location:write`.

**Resultado esperado:** Luis recibe `403`; Ana recibe `200`. La configuración convierte `realm_access.roles` de Keycloak en una autoridad Spring `ROLE_location:write` y la compara con la regla del POST.

**Fallo deliberado:** cambia `.hasAuthority("ROLE_location:write")` por `.permitAll()` y ejecuta la prueba de Luis. **Resultado esperado:** falla, porque ahora puede escribir. **Diagnóstico:** autenticar a una persona no le concede el rol; restaura la regla de autoridad.

**3. Entiende**

`401` indica que falta un token aceptado; `403` indica que el token fue aceptado, pero no cumple la regla de permiso. Este ejemplo usa un rol realm de Keycloak; scopes OAuth y roles son claims distintos.

**4. Cierra**

Registra el usuario, el claim/rol y la respuesta HTTP de ambos casos.

#### Subtema 4.3: Comprueba que el pedido pertenece al sujeto del token · 10 min

**1. Contexto**

El rol permite consultar pedidos, pero no todos los pedidos. El servicio debe comparar el sujeto autenticado con el propietario del registro antes de devolverlo.

**2. Hazlo tú**

Lee `PedidoOwnership.java` y `RutaflowApiController.java`. Ejecuta desde la carpeta del laboratorio:

```bash
./mvnw -q -Dtest=ApiSecurityTest#tokenSoloLeePedidosDeSuSubject test
```

La prueba usa `sub=ana`: `p-ana` pertenece a Ana y `p-luis` a otra persona. En una llamada real, sigue el README para configurar el `sub` de Ana que Keycloak emitió.

**Resultado esperado:** Ana obtiene `200` para `p-ana` y `403` para `p-luis`.

**Fallo deliberado:** comenta `pedidoOwnership.requireOwner(jwt.getSubject(), id)` y ejecuta el test. **Resultado esperado:** Ana también recibe `200` para `p-luis`; la prueba falla. **Diagnóstico:** autenticación y rol no prueban propiedad del registro; restaura la comprobación antes de responder.

**3. Entiende**

`sub` identifica al sujeto del token; no uses un nombre visible como clave permanente de propiedad. En el laboratorio los pedidos son datos en memoria para hacer visible la regla; una API real consulta el dueño persistido en su almacén.

**4. Cierra**

Entrega las dos respuestas y explica qué comprobación produce el 403 por propietario. Las pruebas automáticas usan un decoder de mentira controlada; solo el recorrido de README con Keycloak verifica firma e issuer reales.

#### Subtema 4.4: Reenvía el access token desde el Gateway · 10 min

**1. Contexto**

Tras iniciar sesión en el gateway, este puede pasar el access token a la API que protege sus propios recursos. El gateway no convierte ese token en autorización para todos los pedidos.

**2. Hazlo tú**

Abre `examples/spring-token-relay-rutaflow/src/main/resources/application.yml` y busca el filtro `TokenRelay=`. Revisa también el starter OAuth2 Client en su `pom.xml`. Levanta Keycloak y la API según `examples/spring-security-keycloak-rutaflow/README.md`; luego inicia Gateway desde `examples/spring-token-relay-rutaflow/`:

```bash
./mvnw spring-boot:run
```

Abre `http://localhost:8082/api/pedidos/p-ana`, inicia sesión como Ana y después solicita `/api/pedidos/p-luis`.

**Resultado esperado:** Ana entra y la API responde por `p-ana`; la API devuelve `403` para `p-luis`, aunque el token haya pasado por el gateway.

**Fallo deliberado:** elimina temporalmente `- TokenRelay=` y repite la primera petición. **Resultado esperado:** Gateway completa el login, pero la API recibe la solicitud sin bearer token y devuelve `401`. **Diagnóstico:** la sesión del gateway no agrega por sí sola el token a la petición saliente; restaura el filtro.

**3. Entiende**

`TokenRelay` obtiene el access token de la sesión OAuth2 autorizada y lo coloca en la llamada al backend. La API vuelve a validar el issuer y firma, y decide el acceso al pedido.

**4. Cierra**

Guarda el resultado del pedido propio y ajeno. Este recorrido manual requiere Keycloak, navegador y API local; el repositorio documenta los pasos, pero esta sesión no pudo ejecutarlo sin Docker.

**Hito del tema:**

- [ ] Diferencié 401, 403 y permiso sobre un recurso propio.
- [ ] Vi que el rol realm llega bajo `realm_access.roles`.
- [ ] Validé la petición real con el issuer local, o dejé explícita esa comprobación pendiente.
- [ ] Expliqué por qué un gateway no reemplaza los permisos del servicio.
- [ ] Vi que Token Relay entrega un token, pero la API conserva la autorización del recurso.

**Fuentes oficiales:** [Resource Server JWT de Spring Security](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html), [administración de roles y tokens de Keycloak](https://www.keycloak.org/docs/26.8.1/server_admin/), [contenedor e importación de realms](https://www.keycloak.org/server/containers) y [TokenRelay de Spring Cloud Gateway](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webflux/gatewayfilter-factories/tokenrelay-factory.html).

### Tema 5: HTTP Interfaces, deadlines y descubrimiento según el entorno

**Duración:** 40 min. **Prerrequisitos:** Módulo 9 (WebClient), Tema 1 de este módulo (service discovery).

**Meta observable:** declara un cliente con `@HttpExchange`, llama a un servicio por su nombre lógico y demuestra con una medición que el timeout corta una respuesta lenta.

**¿Por qué es importante?** Una dependencia lenta puede retener recursos y retrasar una entrega; saber a qué instancia llamar y cuánto esperar permite reaccionar con límites explícitos.

**Laboratorio:** `examples/spring-http-deadline-rutaflow/`. No necesita Docker ni un servicio externo.

```mermaid
sequenceDiagram
  participant L as RouteClient
  participant D as SimpleDiscoveryClient
  participant B as Backend RutaFlow
  L->>D: busca route-catalog
  D-->>L: URI local o de producción
  L->>B: GET /routes/RF-001
  Note over L,B: conexión 300 ms · lectura 350 ms
  B-->>L: ruta o timeout
```

#### Subtema 5.1: Declara el contrato HTTP · 10 min

**1. Contexto**

La interfaz deja visible qué operación llama RutaFlow; Spring construye el cliente que ejecuta la petición.

**2. Hazlo tú**

Desde la carpeta del laboratorio, ejecuta:

```bash
./mvnw -q -Dtest=RouteClientDeadlineTest#interfaceHttpLlegaAlServicioEncontradoPorElNombre test
```

Después abre `src/main/java/academia/rutaflow/http/RouteClient.java`:

```java
@HttpExchange("/routes")
public interface RouteClient {
    @GetExchange("/{id}")
    String find(@PathVariable("id") String id);
}
```

**Resultado esperado:** prueba en verde y texto `ruta RF-001` recibido desde el servidor HTTP local.

**3. Entiende**

La interfaz es el contrato. La prueba verifica el proxy real y el cuerpo HTTP; no simula el método cliente.

**4. Cierra**

Di qué URL completa corresponde a `find("RF-001")`.

#### Subtema 5.2: Corta la espera de una respuesta lenta · 15 min

**1. Contexto**

El tiempo de conexión y el de lectura cubren momentos diferentes: abrir comunicación con el servidor y esperar los datos.

**2. Hazlo tú**

Inspecciona `RouteClientConfiguration.java`. Ejecuta:

```bash
./mvnw -q -Dtest=RouteClientDeadlineTest#timeoutDeLecturaCortaLaRespuestaLenta test
```

```java
HttpClientSettings.defaults()
    .withTimeouts(Duration.ofMillis(300), Duration.ofMillis(350));
```

**Resultado esperado:** el backend tarda 900 ms; el cliente recibe `ResourceAccessException` y la medición con `System.nanoTime()` queda bajo 750 ms.

**Fallo deliberado:** elimina `.withTimeouts(...)` y repite el test. Debe fallar: el backend responde antes de que el test alcance el límite esperado. Restaura el timeout.

**3. Entiende**

`HttpClientSettings` forma parte de `spring-boot-http-client` en el laboratorio. Un timeout de lectura limita la espera de respuesta; no equivale por sí solo a un presupuesto extremo a extremo para varias llamadas y reintentos.

**4. Cierra**

Anota el timeout configurado y el tiempo observado. No copies esos valores de demostración a producción sin medir el servicio.

#### Subtema 5.3: Resuelve el nombre del servicio por entorno · 10 min

**1. Contexto**

El cliente usa `route-catalog`; la ubicación física puede cambiar entre desarrollo y producción.

**2. Hazlo tú**

Lee `src/main/resources/application.yml` y ejecuta la prueba de `RouteClientDeadlineTest` que llama al nombre lógico. La prueba asigna al `SimpleDiscoveryClient` la URI del servidor local; el `RestClient` lleva `@LoadBalanced`.

**Resultado esperado:** `http://route-catalog/routes/RF-001` termina en el servidor local y devuelve `ruta RF-001`.

**Fallo deliberado:** cambia `route-catalog` en `RouteClientConfiguration.java` por `catalogo-inexistente`. La prueba debe fallar al no encontrar una instancia. Restaura el ID.

**3. Entiende**

`SimpleDiscoveryClient` lee instancias declaradas en configuración; no es un registro que detecta servicios automáticamente. El perfil `produccion` requiere `RUTAFLOW_CATALOG_URL`.

**4. Cierra**

**Analogía:** `route-catalog` es como un nombre en la agenda; discovery busca su dirección actual y el cliente llama ahí.

Escribe el nombre lógico y la URI física que resolvió el test. Explica qué componente elegiría otra instancia si configuraras varias.

#### Subtema 5.4: Ajusta el cliente al presupuesto de la operación · 5 min

**1. Contexto**

Un timeout excesivo mantiene recursos ocupados; uno demasiado corto corta respuestas válidas.

**2. Hazlo tú**

Como práctica independiente, añade un endpoint lento a la prueba y propone tiempos según el presupuesto de respuesta de una consulta de RutaFlow. Ejecuta:

```bash
./mvnw -q clean test
```

**Resultado esperado:** ambas pruebas pasan; registra el tiempo del caso lento y explica qué evidencia usarías para ajustar el límite en un servicio real.

**3. Entiende**

No agregues reintentos en varias capas sin calcular la latencia acumulada. Si la llamada no es idempotente, un reintento también puede repetir una operación.

**4. Cierra**

Entrega las dos pruebas en verde, el nombre lógico resuelto y el resultado del fallo deliberado restaurado.

**Fuentes oficiales:** [Spring HTTP Service Clients](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#rest-http-interface), [Spring Boot 4.1: clientes y timeouts](https://docs.spring.io/spring-boot/reference/io/rest-client.html), [HttpClientSettings 4.1.2](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/http/client/HttpClientSettings.html) y [Spring Cloud Discovery y LoadBalancer](https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/common-abstractions.html).

Los límites de espera son una pieza del presupuesto de latencia del proyecto integrador; se deben ajustar con observaciones del servicio, no por intuición.

### Tema 6: Spring gRPC, contrato HTTP/2 y evolución segura

**Duración:** 40 min. **Prerrequisito:** Tema 5 de este módulo. **Meta observable:** genera Java desde un `.proto`, publica un servicio Spring gRPC y llama al stub por un canal TCP local.

**¿Por qué es importante?** Dos servicios necesitan acordar sus mensajes y cómo cambian con el tiempo. El contrato generado reduce conversiones manuales; un cambio inseguro puede romper clientes que se despliegan después.

**Laboratorio:** `examples/spring-grpc-rutaflow/`. No mide rendimiento relativo contra REST/JSON.

```mermaid
sequenceDiagram
  participant C as Stub cliente
  participant S as Spring gRPC
  C->>S: TarifaRequest (HTTP/2)
  S->>C: TarifaResponse
  Note over C,S: ambos usan clases generadas desde tarifa.proto
```

#### Subtema 6.1: Define el mensaje y el método remoto · 10 min

**1. Contexto**

`.proto` describe los mensajes y el nombre del método; el compilador crea las clases Java para leer y escribir esos mensajes.

**2. Hazlo tú**

Abre `src/main/proto/tarifa.proto` y ejecuta desde la carpeta del laboratorio:

```bash
./mvnw -q generate-sources
```

La operación y sus mensajes se declaran así:

```protobuf
service TarifaService {
  rpc Calcular (TarifaRequest) returns (TarifaResponse);
}
message TarifaRequest { double distancia_km = 1; }
message TarifaResponse { double monto = 1; }
```

**Resultado esperado:** aparecen `TarifaRequest`, `TarifaResponse` y `TarifaServiceGrpc` bajo `target/generated-sources/`.

**Fallo deliberado:** cambia el nombre del método a `Cotizar` en el `.proto` sin cambiar la implementación. Regenera; la compilación del servicio falla porque el stub nuevo ya no ofrece `calcular`.

**3. Entiende**

El `.proto` es el acuerdo compartido. Los números de campo se envían por la red; los nombres ayudan a leer el código.

**4. Cierra**

Señala cuál archivo es fuente y cuál genera Java. Restaura `Calcular`.

#### Subtema 6.2: Expón la implementación en Spring · 10 min

**1. Contexto**

El servicio recibe distancia en kilómetros y devuelve el cálculo de demostración.

**2. Hazlo tú**

Lee `src/main/java/academia/rutaflow/grpc/TarifaServiceImpl.java` y sigue el `StreamObserver`: `onNext` envía el resultado y `onCompleted` cierra la respuesta.

```java
@GrpcService
class TarifaServiceImpl extends TarifaServiceGrpc.TarifaServiceImplBase {
    public void calcular(TarifaRequest req, StreamObserver<TarifaResponse> out) {
        out.onNext(TarifaResponse.newBuilder().setMonto(req.getDistanciaKm() * 1500).build());
        out.onCompleted();
    }
}
```

**Resultado esperado:** el bean `@GrpcService` implementa la clase base generada y calcula `10 × 1500 = 15000`.

**3. Entiende**

Spring Boot 4.1 aporta starters y autoconfiguración gRPC; usa Netty por defecto. La anotación registra el servicio generado como bean disponible para gRPC.

**4. Cierra**

Explica en una frase qué hace `onCompleted`. El precio del ejemplo es fijo y no representa una regla real de tarifas.

#### Subtema 6.3: Llama el stub por el canal · 10 min

**1. Contexto**

Compilar el contrato no demuestra que el servidor reciba la llamada. El test configura un cliente separado y un servidor en puerto TCP local.

**2. Hazlo tú**

Ejecuta:

```bash
./mvnw -q -Dtest=TarifaGrpcTest test
```

Abre `src/test/java/academia/rutaflow/grpc/TarifaGrpcTest.java`; el stub se importa con `@ImportGrpcClients` y el servidor escucha en un puerto libre.

**Resultado esperado:** el cliente gRPC recibe `monto=15000` para `distancia_km=10`.

**Fallo deliberado:** cambia el target del canal a otro puerto y ejecuta el test. Debe fallar al no poder conectar; restaura el target dinámico para evitar depender de un puerto ocupado.

**3. Entiende**

Esta prueba demuestra una llamada cliente-servidor por TCP local. No es un benchmark, no despliega dos procesos ni prueba un clúster.

**4. Cierra**

Entrega el resultado y explica qué parte demuestra generación y cuál demuestra transporte.

#### Subtema 6.4: Cambia el contrato sin romper datos · 10 min

**1. Contexto**

Un servicio móvil o retrasado puede conservar una versión anterior del cliente.

**2. Hazlo tú**

En una copia de `tarifa.proto`, cambia el significado de `distancia_km = 1` por millas manteniendo el tag 1. Predice qué leerá un cliente viejo y no publiques ese cambio. Luego añade un campo nuevo con tag 2.

**Resultado esperado:** el tag 1 conserva su significado; el cliente viejo puede ignorar el campo nuevo. Cuando elimines un campo, el `.proto` debe reservar su tag y su nombre.

**3. Entiende**

El wire format identifica campos por número. Reutilizar un tag puede hacer que un sistema viejo interprete el dato con el significado anterior y no detectar el error de negocio.

**4. Cierra**

Entrega `./mvnw -q clean test` en verde y una propuesta de evolución con `reserved`. La compatibilidad entre dos versiones de clientes debe validarse con contratos/versiones concretos.

**Cuándo conviene:** usa gRPC si el equipo necesita contratos tipados y llamadas internas en streaming o HTTP/2; mide carga y latencia antes de afirmar que es más rápido que HTTP/JSON. Para navegador o terceros que esperan REST, conserva una API HTTP adecuada.

**Proyecto integrador RutaFlow:** evalúa gRPC para la consulta interna de tarifas y compara latencia y costo operativo con el cliente HTTP del Tema 5 antes de adoptarlo.

**Fuentes oficiales:** [Spring Boot gRPC 4.1](https://docs.spring.io/spring-boot/reference/io/grpc.html), [Spring gRPC](https://docs.spring.io/spring-grpc/reference/) y [Protocol Buffers: evolución de mensajes](https://protobuf.dev/programming-guides/proto3/#updating).
### Tema 7: DDD para decidir límites y propiedad de datos

**Duración:** 35 min. **Prerrequisito:** Módulo 3 de este track (entidades y JPA). **Meta observable:** protege una regla de negocio dentro de un agregado y explica qué contexto es dueño de esos datos.

**¿Por qué es importante?** Separar tablas en servicios antes de entender el negocio produce llamadas circulares y cambios coordinados. Primero aclara las reglas y la propiedad; luego decide si realmente necesitas desplegar los módulos por separado.

**Laboratorio:** `examples/spring-ddd-rutaflow/`. Las pruebas no necesitan Spring, Kafka, HTTP ni base de datos.

```mermaid
flowchart LR
  M[App móvil] --> O[Operaciones: dueño de Journey]
  O --> OD[(Datos de jornada)]
  O -. evento futuro .-> B[Facturación]
  B --> BD[(Datos de facturación)]
  B -. sin acceso directo .-> OD
```

El diagrama representa límites conceptuales; el laboratorio no publica eventos ni implementa esas bases de datos.

#### Subtema 7.1: Encuentra quién es dueño de la regla · 10 min

**1. Contexto**

Solo Operaciones decide si una jornada acepta nuevas posiciones. Facturación no debe editar la jornada para aplicar sus propias reglas.

**2. Hazlo tú**

Abre `src/main/java/academia/rutaflow/operations/Journey.java` y sigue `status`, `positions` y `record`.

```java
public void record(Position position) {
    if (status == JourneyStatus.CLOSED) throw new JourneyAlreadyClosed();
    positions.add(Objects.requireNonNull(position));
}
```

**Resultado esperado:** la regla está en `Journey`, junto a los datos que protege.

**3. Entiende**

Un agregado conserva consistencia en una frontera pequeña. El contexto delimitado define vocabulario y propiedad; no equivale a una tabla o paquete cualquiera.

**Analogía:** cada contexto cuida su propio archivador. Otro equipo puede recibir una copia acordada, pero no entrar a cambiar sus expedientes.

**4. Cierra**

Nombra el contexto dueño y la operación que protege la invariante.

#### Subtema 7.2: Prueba la invariante sin infraestructura · 10 min

**1. Contexto**

Una regla útil sigue siendo verificable sin arrancar servicios ni una base de datos.

**2. Hazlo tú**

Desde `examples/spring-ddd-rutaflow/`, ejecuta:

```bash
./mvnw -q -Dtest=JourneyTest#unaJornadaCerradaRechazaNuevasPosiciones test
```

Lee `src/test/java/academia/rutaflow/operations/JourneyTest.java`.

**Resultado esperado:** la jornada conserva una posición y el segundo registro lanza `JourneyAlreadyClosed`.

**Fallo deliberado:** quita la comprobación de `status` en `Journey.record` y repite el test. Falla porque el agregado deja registrar una posición luego del cierre. Restáurala.

**3. Entiende**

El test verifica el resultado observable de la regla, no el nombre de un método ni una descripción en un documento.

**4. Cierra**

Entrega el test en verde y la excepción que se esperaba antes de la mutación.

#### Subtema 7.3: Evita compartir almacenamiento entre contextos · 5 min

**1. Contexto**

Una foreign key de Facturación hacia la tabla de Operaciones acopla despliegues y datos aunque las aplicaciones estén separadas.

**2. Hazlo tú**

Ejecuta `./mvnw -q -Dtest=JourneyTest#laListaExpuestaNoPermiteModificarElAgregado test` y revisa que `positions()` devuelve `List.copyOf`.

**Resultado esperado:** modificar la lista recibida lanza `UnsupportedOperationException`; el agregado conserva su estado.

**3. Entiende**

Para colaborar, define un contrato o evento versionado con los datos que el otro contexto necesita. El laboratorio solo demuestra la propiedad dentro del agregado; no implementa publicación confiable ni persistencia.

**4. Cierra**

Escribe qué datos posee Operaciones y cuál copia mínima podría necesitar Facturación.

#### Subtema 7.4: Decide si separar el despliegue · 10 min

**1. Contexto**

Un límite de dominio no obliga por sí solo a crear otro proceso o servicio.

**2. Hazlo tú**

Como práctica independiente, añade una regla para una jornada vacía o valida rangos de latitud y longitud en `Position.java`; agrega un test y ejecuta la suite completa:

```bash
./mvnw -q clean test
```

**Resultado esperado:** las tres pruebas existentes y tu nueva prueba pasan.

**3. Entiende**

Mantén un monolito modular mientras los límites o los equipos sean inciertos. Extrae un servicio cuando propiedad de datos, despliegue, escala o autonomía de equipos compensen el costo de red y operación.

**4. Cierra**

Entrega los tests y una decisión explicada sobre qué módulo sería dueño de `Journey` en el proyecto integrador RutaFlow.

**Fuentes:** [Fowler — Aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html) y el laboratorio ejecutable enlazado arriba.

### Tema 8: Orquestar pedidos con Temporal y Spring Boot

**Objetivo observable:** ejecutar un Workflow que reserva inventario, asigna repartidor, cobra y notifica; comprobar reintentos limitados y compensaciones en orden inverso ante un fallo final.

**¿Por qué es importante?** Si un pedido cruza inventario, asignación y pagos, una caída a mitad puede dejar recursos o dinero en un estado incorrecto. Temporal conserva el proceso y permite definir reintentos y acciones de compensación observables.

**Prerrequisitos:** clases e interfaces Java, excepciones, pruebas JUnit y beans de Spring. La Saga distribuida retoma el concepto del track; aquí se ejecuta en código.

**Evidencia del tema:** tres pruebas del [laboratorio de Temporal](../../../../examples/spring-temporal-rutaflow/): un fallo temporal que se recupera, un cobro rechazado tras agotar intentos y una notificación fallida después del cobro.

```mermaid
sequenceDiagram
  participant W as Workflow pedido
  participant T as Temporal Service
  participant A as Activities
  W->>T: inicia procesar(pedidoId)
  W->>A: reservar y asignar
  A-->>T: resultados registrados
  W->>A: cobrar (hasta 3 intentos)
  alt cobro rechazado
    W->>A: liberar repartidor y luego inventario
  else cobro confirmado
    W->>A: notificar
    alt notificación falla
      W->>A: devolver cobro, liberar repartidor e inventario
    end
  end
```

#### Subtema 8.1: Separa el plan de los efectos · 10 min

**1. Contexto**

Un Workflow conserva el orden del proceso. Una Activity realiza una tarea que puede tocar otro servicio, base de datos o proveedor de pagos. El Workflow debe ser determinista: no pongas dentro del plan llamadas HTTP, `Thread.sleep`, reloj del sistema ni estado mutable global.

**2. Hazlo tú**

Desde `examples/spring-temporal-rutaflow/`, abre `src/main/java/academia/rutaflow/temporal/PedidoWorkflow.java` y `PedidoActivities.java`. Ejecuta:

```bash
./mvnw -q -DskipTests package
```

Revisa el contrato: `PedidoWorkflow.procesar` devuelve el resultado de negocio; cada operación externa está declarada en `PedidoActivities`.

**Resultado esperado:** Maven termina con código 0 y compila ambos contratos.

**Fallo deliberado:** en `PedidoActivities.java`, cambia la declaración por `void reservarInventario(String pedidoId);` sin actualizar su implementación. El compilador debe señalar que la implementación ya no cumple la interfaz. Diagnóstico: la interfaz es el contrato entre el plan y el código que ejecuta el efecto.

**3. Entiende**

Temporal registra el historial de decisiones y resultados de Activities. Si un Worker reinicia, el servicio de Temporal puede reproducir el Workflow a partir del historial. Eso no guarda por arte de magia la base de datos de cada servicio: la durabilidad requiere un Temporal Service operativo y los efectos externos requieren sus propias garantías.

**4. Cierra**

Señala qué llamadas del proceso RutaFlow deben ser Activities y cuál es la decisión de orden que pertenece al Workflow.

#### Subtema 8.2: Registra Workers y código Spring · 10 min

**1. Contexto**

Una Task Queue es la cola lógica donde Temporal entrega trabajo. En esta integración, `workers` en las anotaciones identifica el nombre del Worker configurado; el `task-queue` del YAML determina qué cola atiende.

**2. Hazlo tú**

Revisa `PedidoWorkflowImpl.java`, `PedidoActivitiesImpl.java` y `src/main/resources/application.yml`. La configuración ejecutable del Worker es:

```yaml
spring:
  temporal:
    connection:
      target: local
    workers-auto-discovery:
      packages:
        - academia.rutaflow.temporal
    workers:
      - name: pedidos
        task-queue: pedidos
```

Las implementaciones marcan el mismo Worker, `@WorkflowImpl(workers = "pedidos")` y `@ActivityImpl(workers = "pedidos")`; la Activity es además un bean `@Component`. Para correr la aplicación completa necesitas un Temporal Server en `localhost:7233`.

**Resultado esperado:** al iniciar el Worker aparecen registros del Workflow y las Activities en la cola `pedidos`.

**Fallo deliberado:** quita `workers` del YAML y ejecuta `./mvnw test`. Spring indica que no encuentra el Worker llamado `pedidos`. **Diagnóstico:** la anotación referencia un nombre que debe estar definido como Worker; restaura la configuración y vuelve a ejecutar.

**3. Entiende**

Auto-discovery encuentra implementaciones dentro de los paquetes indicados; las anotaciones las relacionan con un Worker. Auto-discovery no crea el servidor de Temporal ni sustituye la definición de su cola.

**4. Cierra**

Escribe en una línea qué valor debe coincidir entre anotaciones y `name`, y qué valor configura la cola que escucha.

#### Subtema 8.3: Reintenta un error transitorio · 10 min

**1. Contexto**

Una API puede fallar temporalmente por red o límite de uso. Temporal puede reintentar una Activity con una política acotada; `maximumAttempts(3)` significa tres intentos totales, incluido el primero.

**2. Hazlo tú**

En `PedidoWorkflowImpl.java` observa `RetryOptions` y en `PedidoWorkflowTest.java` ejecuta solo la prueba de retry:

```bash
./mvnw -q -Dtest='PedidoWorkflowTest#retriesTransientFailureAndCompletes' test
```

`ActivityRecorder` hace fallar el primer cobro y deja pasar el segundo.

**Resultado esperado:** la respuesta comienza con `CONFIRMADO`, el cobro ocurre dos veces y la notificación se ejecuta; no hay compensaciones.

**Fallo deliberado:** cambia `setMaximumAttempts(3)` por `setMaximumAttempts(1)` y repite la prueba. Fallará porque se esperaba que el segundo intento completara el pago. **Diagnóstico:** inspecciona el resultado de `retriesTransientFailureAndCompletes`; el cobro terminó en el primer fallo al no quedar intentos disponibles. Restaura el límite de tres intentos.

**3. Entiende**

El límite evita reintentos infinitos, pero no garantiza que repetir un cobro sea seguro. Una Activity puede haber cobrado y perder la respuesta; el siguiente intento no sabe por sí solo si ocurrió el efecto. Envía una clave idempotente, por ejemplo `pedidoId`, al proveedor y consulta su resultado antes de repetir.

**4. Cierra**

Anota el número de intentos observado y una clave que haría idempotente una llamada real a pagos.

#### Subtema 8.4: Compensa solo lo que ya ocurrió · 15 min

**1. Contexto**

Una Saga no revierte automáticamente servicios externos. Cada compensación es una operación de negocio explícita, que también puede fallar y debe admitir repetición segura.

**2. Hazlo tú**

En `PedidoWorkflowImpl.java`, observa el orden: tras cada Activity exitosa se registra su compensación. Ejecuta las dos pruebas de fallo:

```bash
./mvnw -q -Dtest='PedidoWorkflowTest#permanentChargeFailureCompensatesInReverseOrder+notificationFailureAlsoRefundsTheSuccessfulCharge' test
```

La primera rechaza todos los intentos de cobro. La segunda permite cobrar pero hace fallar la notificación.

**Resultado esperado:** si el cobro no termina, se libera repartidor y luego inventario. Si falla la notificación tras cobrar, se devuelve el cobro, se libera repartidor y se libera inventario. Las verificaciones comparan el orden real registrado.

**Fallo deliberado:** mueve `saga.addCompensation(activities::devolverCobro, pedidoId, centavos)` antes de `cobrar`. Repite la prueba de cobro rechazado: verás que intentaría devolver un pago que nunca ocurrió. **Diagnóstico:** compara los eventos `cobrar` y `devolver-cobro` de la aserción; restaura el registro después del cobro exitoso.

**3. Entiende**

Se registra la compensación después de confirmar el efecto, antes del paso siguiente. Si una Activity produce un efecto externo y su respuesta se pierde, el Workflow puede reintentarla; por eso la operación original y su compensación deben usar identificadores idempotentes. La prueba usa el servidor de Temporal en memoria: valida el Workflow y el Worker, no tolerancia a caída del servidor ni llamadas reales de pago.

**4. Cierra**

Ejecuta toda la suite con `./mvnw -q clean test`. Entrega el código de salida y explica qué quedó compensado en cada escenario. Para producción, documenta cómo confirmar el estado del cobro y hacer idempotentes tanto el cargo como el reembolso.

**Proyecto integrador RutaFlow:** adapta el Workflow para cancelar un pedido antes del cobro. Cambia `PedidoWorkflowImpl.java`, añade el estado observable en `ActivityRecorder.java` y una prueba en `PedidoWorkflowTest.java`; verifica que al cancelar no se ejecute el cobro y se liberen solo los recursos ya reservados.

**Fuentes:** [Integración oficial de Temporal con Spring Boot](https://docs.temporal.io/develop/java/integrations/spring-boot-integration), [pruebas del SDK Java](https://docs.temporal.io/develop/java/best-practices/testing-suite), [definición determinista de Workflows](https://docs.temporal.io/workflow-definition) y [patrones de diseño, incluida Saga](https://docs.temporal.io/design-patterns). Versión fijada del starter: `1.40.0`, contrastada con [Maven Central](https://central.sonatype.com/artifact/io.temporal/temporal-spring-boot-starter).

**Cuándo usarlo:** un proceso largo con estado, pasos coordinados o compensaciones explícitas. Para una operación local de una base de datos, una transacción puede bastar. Kafka entrega eventos y desacopla consumidores; Temporal conduce el estado y el orden de un proceso. Pueden convivir. El laboratorio no implementa una pasarela de pagos ni prueba despliegue de varios servicios.

---

### Tema 9: Comprueba módulos antes de separar servicios

**Objetivo observable:** verificar que Pedidos y Notificaciones no tengan ciclos ni accedan a paquetes internos, publicar `PedidoCreado` y observar que el módulo dependiente lo recibe.

**¿Por qué es importante?** Un paquete separado no garantiza una frontera real. Si Notificaciones importa la implementación privada de Pedidos, extraerlos luego obliga a coordinar cambios o expone datos que pertenecen al otro módulo.

**Prerrequisitos:** paquetes Java, beans Spring, publicación de eventos y las decisiones de límites del Tema 7. El [laboratorio Spring Modulith](../../../../examples/spring-modulith-rutaflow/) usa Spring Boot 4.1.2 y Modulith 2.1.1.

#### Subtema 9.1: Traza las dependencias de paquetes · 10 min

**1. Contexto**

Spring Modulith interpreta los paquetes directos bajo el paquete raíz como módulos de aplicación. Los tipos en el paquete del módulo sirven como API por defecto; los subpaquetes, como `pedidos.internal`, son implementación interna.

**2. Hazlo tú**

Desde `examples/spring-modulith-rutaflow/`, revisa `RutaFlowModulithApplication.java`, `pedidos/PedidosService.java` y `pedidos/internal/PedidoInterno.java`. Ejecuta:

```bash
./mvnw -q -DskipTests package
```

**Resultado esperado:** compila la app con los paquetes `pedidos` y `notificaciones`.

**Fallo deliberado:** cambia el `package` de `PedidosService.java` a `academia.rutaflow.modulith.pedidos.internal` sin actualizar sus consumidores. **Diagnóstico:** la compilación señala que el tipo dejó de estar en la API del módulo; restáuralo al paquete `pedidos`.

**3. Entiende**

Un módulo puede tener paquetes internos sin volverse otro módulo. Mantén sus reglas y persistencia dentro del dueño; publica solo el contrato mínimo que los demás necesitan.

**4. Cierra**

Dibuja qué módulo posee la clase `PedidoInterno` y qué dato mínimo expone `PedidoCreado`.

#### Subtema 9.2: Haz que la arquitectura falle cuando se cruza un límite · 10 min

**1. Contexto**

Una revisión manual no detecta de forma confiable un ciclo de dependencias o una importación interna que alguien añadió meses después.

**2. Hazlo tú**

Abre `src/test/java/academia/rutaflow/modulith/ArquitecturaModularTest.java` y ejecuta:

```bash
./mvnw -q -Dtest=ArquitecturaModularTest test
```

El test llama a `ApplicationModules.of(RutaFlowModulithApplication.class).verify()`.

**Resultado esperado:** el proceso termina con código 0 cuando los módulos respetan los límites.

**Fallo deliberado:** en `NotificacionListener.java`, cambia el tipo de evento `PedidoCreado` por `PedidoInterno`. Ejecuta el test otra vez. **Diagnóstico:** el reporte debe señalar el acceso de Notificaciones al paquete interno de Pedidos; restaura el contrato `PedidoCreado`.

**3. Entiende**

`verify()` comprueba ciclos y acceso a paquetes internos. Puede verificar también dependencias permitidas si se declaran. No comprueba límites de bases de datos, permisos en producción ni contratos de red.

**4. Cierra**

Guarda el resultado verde después de restaurar el contrato. Explica qué infracción bloquea este test antes de crear otro proceso.

#### Subtema 9.3: Define el evento público del módulo · 10 min

**1. Contexto**

Pedidos necesita avisar que creó un pedido; no necesita conocer el formato de una notificación ni llamar directamente a Notificaciones.

**2. Hazlo tú**

Abre `pedidos/PedidoCreado.java`, `pedidos/PedidosService.java` y `notificaciones/NotificacionListener.java`. El productor publica un evento pequeño:

```java
public record PedidoCreado(String pedidoId) {}

public void crear(String pedidoId) {
    events.publishEvent(new PedidoCreado(pedidoId));
}
```

El consumidor escucha el mismo tipo:

```java
@ApplicationModuleListener
void on(PedidoCreado event) {
    bandeja.agregar(event.pedidoId());
}
```

Ejecuta `./mvnw -q -Dtest=PedidosModuleTest test`.

**Resultado esperado:** `PublishedEvents` contiene un único `PedidoCreado` con ID `RF-205`.

**Fallo deliberado:** renombra `pedidoId` a `id` en el record sin actualizar el listener ni la prueba. **Diagnóstico:** el compilador marca los accesos al método anterior; restaura ambos lados del contrato.

**3. Entiende**

Los módulos comparten un objeto de evento tipado, no una llamada directa a la implementación receptora. El starter JDBC registra publicaciones transaccionales; la configuración del test las escribe en H2 en memoria. Un registro en memoria se pierde al cerrar el proceso.

**4. Cierra**

Anota los campos del evento y elimina cualquier dato que Notificaciones no necesite.

#### Subtema 9.4: Comprueba la interacción entre módulos · 15 min

**1. Contexto**

Verificar paquetes no comprueba que un evento real llegue al código receptor. Para esa evidencia hay que ejecutar los dos módulos en el mismo contexto de Spring.

**2. Hazlo tú**

Desde la carpeta del laboratorio ejecuta:

```bash
./mvnw -q -Dtest=NotificacionesModuleTest test
./mvnw -q clean test
```

La prueba inicia Spring, crea `RF-204` dentro de una transacción y espera a que el listener añada un aviso a la bandeja.

**Resultado esperado:** aparece `Pedido recibido: RF-204`; las tres pruebas de arquitectura, publicación y consumo quedan verdes.

**Fallo deliberado:** comenta `@ApplicationModuleListener` y repite `NotificacionesModuleTest`. **Diagnóstico:** el evento queda registrado pero la bandeja no cambia antes del límite de espera; restaura la anotación.

**3. Entiende**

`ApplicationModuleTest` inicia el módulo bajo prueba con alcance acotado; `NotificacionesModuleTest` usa `@SpringBootTest` para verificar la interacción entre ambos módulos. Las pruebas son locales a una JVM. No prueban dos despliegues, un broker ni la recuperación de H2 al reiniciar.

**4. Cierra**

Entrega el resultado de `verify()` y de las pruebas de evento. Si necesitas garantía ante reinicios, configura una base de datos persistente y prueba la republicación de eventos pendientes; el registro transaccional no convierte cualquier evento en una entrega externa garantizada.

**Proyecto integrador RutaFlow:** añade un tercer módulo de Facturación que consuma solo `PedidoCreado`. Define el dato de contrato, comprueba `ApplicationModules.verify()` y prueba la publicación y recepción sin importar repositorios de Pedidos.

**Fuentes:** [verificación de módulos](https://docs.spring.io/spring-modulith/reference/verification.html), [eventos de aplicación y registro de publicaciones](https://docs.spring.io/spring-modulith/reference/events.html), [pruebas de módulos](https://docs.spring.io/spring-modulith/reference/testing.html), [API de `ApplicationModuleTest`](https://docs.spring.io/spring-modulith/docs/current/api/org/springframework/modulith/test/ApplicationModuleTest.html) y [starter 2.1.1](https://central.sonatype.com/artifact/org.springframework.modulith/spring-modulith-starter-test).

**Cuándo conviene:** cuando un monolito necesita fronteras que el compilador y la integración continua puedan revisar. No convierte paquetes en servicios, no impone una base por módulo y no prueba compatibilidad HTTP entre despliegues. Extrae servicios cuando autonomía de datos, equipo, despliegue o escala justifique operar la red.

---

### Tema 10: Spring Cloud Bus para propagar cambios de configuración

#### Paso 1 · Objetivo y preparación

Al finalizar enviarás una actualización de configuración a varias instancias mediante un broker y medirás cuál cambió. **Prerrequisitos:** Spring Cloud Config, Actuator y RabbitMQ o Kafka operativo. Utiliza dependencias del mismo release train que el proyecto.

#### Paso 2 · Contexto y caso real

Se modifica el límite de concurrencia del servicio de entregas. Reiniciar una por una las réplicas deja un periodo con configuraciones distintas; llamar solo al endpoint local actualiza una instancia y no al grupo.

#### Paso 3 · Teoría y analogía

Spring Cloud Bus distribuye eventos de cambio entre instancias conectadas a un broker. `busrefresh` limpia el caché de RefreshScope y vuelve a enlazar `@ConfigurationProperties`; `busenv` puede modificar propiedades distribuidas. La aplicación sigue necesitando una fuente de configuración y clases refrescables. Es un anuncio por altavoz con destinatarios: hace llegar el cambio, pero no valida por sí solo que el nuevo valor sea correcto ni que todas las instancias estén listas.

```mermaid
flowchart LR
  O[Operador autenticado] -->|POST busrefresh| A[Instancia A]
  A --> B[Broker Bus]
  B --> C[Instancia B]
  B --> D[Instancia C]
  C --> R[Rebind propiedades]
  D --> R
```

#### Paso 4 · Demostración guiada

Añade `spring-cloud-starter-bus-amqp` (o el starter Kafka), Actuator y una propiedad en `src/main/resources/application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,busrefresh
```

Inyecta `@RefreshScope` en el bean de demostración, levanta dos instancias con IDs distintos y actualiza la fuente Config Server. Ejecuta `curl -X POST http://localhost:8080/actuator/busrefresh`. **Resultado esperado:** ambas instancias observan la nueva configuración sin reinicio completo. En producción no expongas este endpoint públicamente: protégelo con autorización de operador y red administrativa.

#### Paso 5 · Práctica guiada

**Fallo deliberado:** inicia una réplica con el mismo `spring.cloud.bus.id` que otra. **Pista:** los IDs deben identificar instancias; los duplicados pueden causar filtrado o procesamiento incorrecto. Revisa logs, ID y disponibilidad del broker. Corrige la identidad antes de repetir el refresh.

#### Paso 6 · Práctica independiente

Actualiza una propiedad a un valor inválido y mide cómo reacciona el bean, cómo lo detecta readiness y cómo se revierte el cambio. Compara un refresh global con destino dirigido a una instancia. Documenta una alternativa de reinicio gradual si la propiedad no es refrescable o si requiere recrear conexiones.

#### Paso 7 · Cierre y evidencia

Entrega trazas del evento, versión de propiedad observada en ambas instancias y el fallo de ID duplicado diagnosticado. **Proyecto integrador RutaFlow:** usa Bus para cambios operacionales limitados; conserva versionado, auditoría y rollback en Config Server. Errores comunes: asumir que todos los beans se actualizan, usar `busenv` como almacén de configuración permanente y dejar endpoint sin autorización. Siguiente paso: trazar una solicitud entre servicios con un identificador común. Fuentes oficiales: [Spring Cloud Bus](https://docs.spring.io/spring-cloud-bus/reference/), [bus refresh](https://docs.spring.io/spring-cloud-bus/reference/spring-cloud-bus/bus-endpoints.html) y [Actuator](https://docs.spring.io/spring-boot/reference/actuator/).

**¿Por qué es importante?** Una flota de réplicas debe cambiar de forma coordinada y comprobable.
**Evidencia de aprendizaje:** demuestra el cambio en dos instancias y el rollback del valor inválido.
**Cuándo no usarlo:** no agregues Bus si un despliegue gradual reiniciable es más simple y cumple el tiempo de actualización requerido.

### Tema 11: Micrometer Tracing entre servicios

#### Paso 1 · Objetivo y preparación

Al finalizar propagarás una traza desde una petición HTTP hasta otro servicio y localizarás el tramo que aumenta la latencia. **Prerrequisitos:** Actuator, cliente HTTP y al menos dos servicios locales. Levanta un receptor OTLP o Zipkin de desarrollo.

#### Paso 2 · Contexto y caso real

El endpoint de despacho tarda cuatro segundos, pero sus logs locales no muestran si esperó Gateway, inventario o geolocalización. Un `traceId` común permite inspeccionar los spans de esa solicitud.

#### Paso 3 · Teoría y analogía

Micrometer Tracing conecta las observaciones de Spring con un tracer como OpenTelemetry y exporta spans a un backend. Cada span mide una operación dentro de una traza. Para propagar contexto HTTP usa builders autoconfigurados de Spring, no clientes creados manualmente fuera de ellos. El `traceId` es el número de expediente que cruza departamentos; cada span es un sello de tiempo de una operación. Sampling controla cuánto se registra y debe ajustarse al tráfico y costo.

#### Paso 4 · Demostración guiada

Añade Actuator y el bridge/exporter compatible con el backend de desarrollo. En `application.yml` configura endpoint OTLP y sampling del perfil local. Crea `src/main/java/academia/entregas/ClienteInventario.java` usando el builder inyectado:

```java
@Bean
RestClient inventarioClient(RestClient.Builder builder) {
    return builder.baseUrl("http://localhost:8082").build();
}
```

Envía una petición a entregas, que llama inventario, y revisa ambos spans en el backend. Ejecuta `./mvnw test -Dtest=TrazaDistribuidaTest` y luego la app con el exporter activo. **Resultado esperado:** spans de entrada y salida comparten `traceId`, y los logs muestran correlación en el MDC.

#### Paso 5 · Práctica guiada

**Fallo deliberado:** construye `new RestClient()` directamente en vez de usar el builder de Boot. **Pista:** el cliente creado al margen puede no propagar el contexto de trace. Compara spans; vuelve al builder y diagnostica el encabezado de propagación ausente.

#### Paso 6 · Práctica independiente

Añade una observación de negocio para `reserva-conductor`, con tags de baja cardinalidad como `resultado=aprobado/rechazado`; evita agregar `pedidoId` como etiqueta métrica. Fuerza timeout en inventario, encuentra el span que espera y compara error con latencia total. Ajusta sampling solo en desarrollo para pruebas exhaustivas; documenta el valor de producción y el costo esperado.

#### Paso 7 · Cierre y evidencia

Entrega captura/exportación de una traza completa, el fallo sin contexto y el tiempo del span lento. **Proyecto integrador RutaFlow:** conserva propagación por HTTP y mensajería y vincula traces con logs sin poner datos privados en atributos. Errores comunes: crear clientes fuera de auto-configuración, poner IDs únicos como tags y muestrear 100% de tráfico de alto volumen indefinidamente. Siguiente paso: fijar contratos que permitan desplegar proveedor y consumidor por separado. Fuentes oficiales: [Spring Boot: tracing](https://docs.spring.io/spring-boot/reference/actuator/tracing.html), [observabilidad](https://docs.spring.io/spring-boot/reference/actuator/observability.html) y [métricas](https://docs.spring.io/spring-boot/reference/actuator/metrics.html).

**¿Por qué es importante?** La traza cruza procesos y hace visible dónde se gasta el tiempo de extremo a extremo.
**Evidencia de aprendizaje:** entrega la traza que cruza dos servicios y el span que explica la demora.
**Cuándo no usarlo:** no exportes todos los eventos o atributos a una etiqueta métrica; las trazas y métricas tienen límites distintos.

### Tema 12: Contract testing entre productor y consumidor

#### Paso 1 · Objetivo y preparación

Al finalizar escribirás un contrato HTTP de consumidor y comprobarás que el productor genera un stub compatible. **Prerrequisitos:** API REST, pruebas Spring y dos servicios con despliegues independientes. Alinea Spring Cloud Contract con el release train elegido.

#### Paso 2 · Contexto y caso real

Pedidos necesita consultar disponibilidad de Conductores. Una prueba unitaria con mock local no detecta que el productor cambió `conductorId` a `driverId` y desplegó primero, rompiendo al consumidor.

#### Paso 3 · Teoría y analogía

El contract test declara una interacción requerida: solicitud y respuesta que productor y consumidor acuerdan. Spring Cloud Contract puede generar pruebas para validar el productor y stubs para el consumidor. El contrato no implementa toda la lógica de negocio ni prueba producción; verifica el borde compartido. Es como un enchufe: ambos aparatos pueden cambiar internamente siempre que respeten forma y voltaje del conector.

```mermaid
flowchart LR
  C[Contrato pedido-disponibilidad] --> P[Test generado en productor]
  C --> S[Stub consumido por Pedidos]
  P --> V[Validar proveedor]
  S --> T[Test de consumidor sin red real]
```

#### Paso 4 · Demostración guiada

Crea `src/test/resources/contracts/conductores/disponibilidad.yml`:

```yaml
request:
  method: GET
  url: /conductores/c-12/disponibilidad
response:
  status: 200
  headers:
    Content-Type: application/json
  body:
    disponible: true
```

Configura plugin/dependencia de Spring Cloud Contract y la base de test del productor; genera el test del proveedor. En el consumidor agrega Stub Runner apuntando al artefacto del productor y llama el cliente HTTP contra el stub. Ejecuta `./mvnw clean verify`. **Resultado esperado:** el proveedor satisface el contrato y el consumidor recibe la respuesta esperada desde el stub sin levantar Conductores real.

#### Paso 5 · Práctica guiada

**Fallo deliberado:** cambia el productor a `disponibleAhora` y ejecuta el test generado. **Pista:** el contrato describe el JSON observado por el consumidor; el cambio rompe compatibilidad aun si el endpoint devuelve 200. Restaura el nombre o versiona explícitamente el contrato y despliega una transición compatible.

#### Paso 6 · Práctica independiente

Agrega caso 404 para conductor inexistente y una regla que acepte campos adicionales si el consumidor no depende de ellos. Corre contrato en CI del productor y stub test en CI del consumidor. Registra quién aprueba cambios, cómo se publica el artefacto de stubs y cómo se limpia una versión vieja. Combina contract tests con pruebas de integración, no intentes que un solo contrato sustituya casos de negocio completos.

#### Paso 7 · Cierre y evidencia

Entrega el contrato, test de proveedor generado, prueba de consumidor con stub y fallo por campo renombrado. **Proyecto integrador RutaFlow:** valida contratos antes de promover cada servicio y define política de compatibilidad durante despliegues graduales. Errores comunes: escribir contratos desde el proveedor sin confirmar necesidades reales del consumidor, poner lógica de negocio completa dentro del contrato y asumir que la prueba garantiza disponibilidad de red o base de datos. Siguiente paso: lleva la versión y el resultado del contrato al pipeline de despliegue. Fuentes oficiales: [Spring Cloud Contract](https://docs.spring.io/spring-cloud-contract/reference/), [contratos DSL](https://docs.spring.io/spring-cloud-contract/reference/project-features-contract.html) y [stubs](https://docs.spring.io/spring-cloud-contract/reference/project-features-stubrunner/).

**¿Por qué es importante?** Los equipos necesitan detectar incompatibilidades antes de que un cambio llegue al servicio consumidor.
**Evidencia de aprendizaje:** entrega test de proveedor, stub, prueba de consumidor y cambio incompatible reproducido.
**Cuándo no usarlo:** para dos componentes que siempre se despliegan juntos y no comparten contrato de red, una prueba de integración en el mismo módulo puede ser suficiente.
