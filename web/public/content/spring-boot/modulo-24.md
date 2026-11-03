# Módulo 24: Spring GraphQL para pedidos y entregas

## Aprende construyendo

Expondrás un contrato GraphQL con Spring Boot 4.0.9, Java 21 y Spring for GraphQL 2.0.6. Los schemas describen qué puede pedir el cliente; los data fetchers resuelven campos en el servidor. Las versiones se fijan para el laboratorio, no se presentan como la última versión universal.

---

### Tema 1: schema-first con tipos y consultas

#### Paso 1 · Objetivo y preparación
Al finalizar publicarás un esquema GraphQL para consultar una entrega y ejecutarás una petición HTTP con respuesta visible. **Prerrequisitos:** Java 21, DTOs y API HTTP de Spring Boot. Descarga una app de Spring Initializr con Boot 4.0.9, Java 21 y dependencias `graphql,web,test`.

**Ejemplo independiente:** crea una carpeta vacía `graphql-schema-lab`, descarga desde `https://start.spring.io/starter.zip` con `bootVersion=4.0.9`, `javaVersion=21`, `dependencies=graphql,web,test`, extrae y ejecuta `./mvnw test`.

#### Paso 2 · Contexto y caso real
Una pantalla de seguimiento necesita ID, estado y fecha estimada, mientras otra quiere solo ID/estado. REST puede resolverlo con endpoints distintos; GraphQL deja que el cliente solicite los campos declarados en un schema común.

#### ¿Por qué es importante?
El schema es contrato de tipos y operaciones, no una consulta directa sin límites a la base. Mantén autorización, validación, costo de consultas y ownership en los servicios del servidor.

#### Paso 3 · Teoría, modelo mental y analogía
En schema-first escribes primero `type Query` y los tipos de salida; cada campo tiene un resolver (data fetcher) o se lee de un objeto. Como un menú de restaurante, el cliente elige platos del menú publicado; no puede pedir una tabla privada que no esté en el schema.

#### Paso 4 · Demostración guiada desde cero
En `pom.xml`, verifica `spring-boot-starter-graphql` y `spring-boot-starter-web` con versiones gestionadas por Boot 4.0.9. Crea `src/main/resources/graphql/schema.graphqls`:

```graphql
type Query {
  shipment(id: ID!): Shipment
}

type Shipment {
  id: ID!
  status: String!
  estimatedArrival: String
}
```

Crea `src/main/java/dev/rutaflow/ShipmentController.java`:

```java
package dev.rutaflow;

import java.util.Map;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

record Shipment(String id, String status, String estimatedArrival) {}

@Controller
class ShipmentController {
    private final Map<String, Shipment> shipments = Map.of(
            "sh-42", new Shipment("sh-42", "IN_TRANSIT", "2026-11-04T15:00:00Z"));

    @QueryMapping
    Shipment shipment(@Argument String id) {
        return shipments.get(id);
    }
}
```

Ejecuta `./mvnw spring-boot:run`; en otra terminal consulta `curl -s http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{"query":"{ shipment(id: \"sh-42\") { id status estimatedArrival } }"}'`. Espera `data.shipment.status = IN_TRANSIT`.

#### Paso 5 · Práctica guiada
Agrega `deliveryAddress` al tipo y devuelve solo los últimos cuatro caracteres de un código ficticio en el laboratorio. **Pista:** valida primero el schema y la forma de la respuesta GraphQL; no expongas datos sensibles por comodidad.

#### Paso 6 · Práctica independiente
Agrega el caso ID desconocido y decide si la respuesta será `null` o error de negocio. Documenta el contrato y prueba ambos estados con comandos curl separados.

#### Paso 7 · Cierre y evidencia
Entrega schema, resolver, petición HTTP y salida exacta para encontrado/no encontrado. El siguiente tema resuelve campos anidados y evita consultas repetidas por fila.

**Fallo deliberado:** solicita deliberadamente el campo `trackingSecret` que no está en el schema; observa el error de validación GraphQL antes de llegar al resolver y quita el campo.

```bash
./mvnw test
```

**Resultado esperado:** el schema compila, el query válido devuelve el ID/estado y un campo inexistente se rechaza. **Errores comunes:** usar entidad JPA como contrato público, confundir HTTP 200 con una operación GraphQL sin errores y dejar el endpoint sin autenticación. Fuentes oficiales: [Spring GraphQL Boot starter](https://docs.spring.io/spring-graphql/reference/boot-starter.html), [controladores anotados](https://docs.spring.io/spring-graphql/reference/controllers.html).

**Proyecto propio:** `src/main/resources/graphql/schema.graphqls`. **Cuándo usar GraphQL:** cuando clientes necesitan seleccionar conjuntos de campos con un contrato compartido; un endpoint REST sencillo sigue siendo una buena opción si el contrato es fijo. Evidencia de aprendizaje: entrega query válido, rechazo de campo desconocido y explicación.

---

### Tema 2: data fetchers, relaciones y problema N+1

#### Paso 1 · Objetivo y preparación
Al finalizar implementarás resolver anidado para paradas de una entrega y agruparás la carga de conductores en lotes. **Prerrequisitos:** Tema 1, relaciones y consultas SQL básicas. Crea proyecto independiente `graphql-fetcher-lab` con Boot 4.0.9/Java 21/GraphQL/Web/Test.

**Ejemplo independiente:** desde carpeta vacía genera `graphql-fetcher-lab` con Spring Initializr; incluye schema, modelos y controlador de esta lección y ejecuta `./mvnw test`.

#### Paso 2 · Contexto y caso real
`query { shipments { stops { address } } }` puede causar una consulta por entrega y otra por cada parada. Con 100 entregas, un fetcher ingenuo podría disparar cientos de consultas aunque el JSON sea pequeño.

#### ¿Por qué es importante?
Un query GraphQL representa un grafo de campos; resolver cada nodo de forma independiente puede multiplicar llamadas a base, servicios o API externas. Mide SQL/cantidad de llamadas y usa batching con límites.

#### Paso 3 · Teoría, modelo mental y analogía
`@QueryMapping` resuelve un campo raíz, `@SchemaMapping` un campo de un tipo padre, y `@BatchMapping` junta padres para resolver el campo en lote. Un data fetcher es como un encargado que trae el dato bajo demanda; si cada persona hace un viaje separado, se pierde tiempo.

#### Paso 4 · Demostración guiada
En `src/main/resources/graphql/schema.graphqls` agrega `type Shipment { id: ID! driver: Driver stops: [Stop!]! }` y define `Driver`/`Stop`. Crea `src/main/java/dev/rutaflow/ShipmentFields.java`:

```java
package dev.rutaflow;

import java.util.List;
import java.util.Map;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

record Driver(String id, String name) {}
record Stop(String id, String address) {}
record Shipment(String id, String status, String estimatedArrival) {}

@Controller
class ShipmentFields {
    private final DriverService drivers;
    private final Map<String, List<Stop>> stopsByShipment = Map.of(
            "sh-42", List.of(new Stop("stop-1", "Calle 10")));
    ShipmentFields(DriverService drivers) { this.drivers = drivers; }

    @BatchMapping(typeName = "Shipment", field = "driver")
    Map<Shipment, Driver> driver(List<Shipment> shipments) {
        // Una búsqueda por los IDs reunidos, no una búsqueda por cada Shipment.
        return drivers.findForShipments(shipments);
    }

    @SchemaMapping(typeName = "Shipment", field = "stops")
    List<Stop> stops(Shipment shipment) {
        return stopsByShipment.getOrDefault(shipment.id(), List.of());
    }
}
```

Implementa `DriverService.findForShipments` con un fake de laboratorio que devuelva un mapa por shipment. Ejecuta `./mvnw test` y registra llamadas del servicio para query de 1 y 20 entregas.

#### Paso 5 · Práctica guiada
Convierte un resolver que hace `findByShipmentId` dentro de un bucle en `@BatchMapping`. **Pista:** retorna cada clave `Shipment` que entró al lote; prueba lista vacía y un shipment sin conductor.

#### Paso 6 · Práctica independiente
Agrega un límite máximo de 50 entregas por petición y test que cuente llamadas al servicio. Compara el número antes/después y anota por qué batching no resuelve automáticamente todos los N+1 remotos.

#### Paso 7 · Cierre y evidencia
Entrega respuesta GraphQL, conteo de llamadas y prueba de campo ausente. El siguiente tema añade escritura y actualización en vivo con límites del transporte.

**Fallo deliberado:** restaura deliberadamente el fetcher que llama al servicio por cada fila y haz que el test falle al detectar más de una llamada para el lote.

```bash
./mvnw test
```

**Resultado esperado:** una consulta de varias entregas ejecuta una carga por lote; los campos opcionales respetan el contrato. **Errores comunes:** asumir que `@BatchMapping` fija cardinalidad, retornar mapa sin claves y no limitar profundidad/cantidad de resultados. Fuente oficial: [batch mappings](https://docs.spring.io/spring-graphql/reference/controllers.html#controllers.schema-mapping.batch).

**Proyecto propio:** `src/main/java/dev/rutaflow/ShipmentFields.java`. **Cuándo añadir batching:** cuando el perfil muestre repetición de fetches y se pueda agrupar la lectura. Evidencia de aprendizaje: entrega salida de test y medición de llamadas.

---

### Tema 3: mutations y subscriptions

#### Paso 1 · Objetivo y preparación
Al finalizar cambiarás el estado de una entrega y emitirás eventos a un cliente conectado por WebSocket. **Prerrequisitos:** Temas 1–2, records Java y nociones de Reactor. Crea `graphql-live-lab` desde cero con Boot 4.0.9, Java 21, `graphql,web,websocket,test`.

**Ejemplo independiente:** genera `graphql-live-lab` en carpeta vacía y agrega solo schema, controller y pruebas de esta lección; arranca con `./mvnw spring-boot:run`.

#### Paso 2 · Contexto y caso real
El operador confirma “entregado” con una mutation; la pantalla del cliente se suscribe para recibir cambios de estado. La respuesta GraphQL puede ser inmediata para la escritura y un flujo WebSocket para notificaciones posteriores.

#### ¿Por qué es importante?
Subscriptions no son un WebSocket genérico ni un broker durable. La implementación reactiva local sirve para aprender; varias instancias, reconexión y replay requieren infraestructura, autorización y cursor/offset definidos.

#### Paso 3 · Teoría, modelo mental y analogía
`@MutationMapping` resuelve una operación que modifica estado. `@SubscriptionMapping` devuelve `Publisher`/`Flux` de resultados; el transporte WebSocket entrega eventos al cliente. Como suscribirse a avisos de una ruta, cada conexión solo recibe los cambios que cubra la política del sistema.

#### Paso 4 · Demostración guiada
Extiende el schema:

```graphql
type Mutation { markDelivered(id: ID!): Shipment! }
type Subscription { shipmentChanged(id: ID!): Shipment! }
```

Crea `src/main/java/dev/rutaflow/ShipmentLiveController.java`:

```java
package dev.rutaflow;

import java.util.concurrent.ConcurrentHashMap;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Controller
class ShipmentLiveController {
    private final ShipmentService service;
    private final ConcurrentHashMap<String, Sinks.Many<Shipment>> updates = new ConcurrentHashMap<>();
    ShipmentLiveController(ShipmentService service) { this.service = service; }

    @MutationMapping
    Shipment markDelivered(@Argument String id) {
        Shipment changed = service.markDelivered(id);
        updates.computeIfAbsent(id, key -> Sinks.many().multicast().onBackpressureBuffer())
                .tryEmitNext(changed);
        return changed;
    }

    @SubscriptionMapping
    Flux<Shipment> shipmentChanged(@Argument String id) {
        return updates.computeIfAbsent(id, key -> Sinks.many().multicast().onBackpressureBuffer()).asFlux();
    }
}
```

Añade `spring.graphql.websocket.path=/graphql` en `application.yml`; conecta un cliente compatible por WebSocket y observa el cambio. Explica que el sink local vive en una instancia, no persiste y debe retirarse al cerrar conexiones en una app real.

#### Paso 5 · Práctica guiada
Haz que la mutation requiera una clave idempotente de operación y que un estado inválido no emita evento. **Pista:** valida transición antes de publicar y separa error de negocio de fallo de transporte.

#### Paso 6 · Práctica independiente
Diseña una prueba con dos cambios y cliente reconectado; documenta cómo Kafka/Rabbit/outbox y una versión/cursor resolverían el replay fuera del proceso único.

#### Paso 7 · Cierre y evidencia
Entrega petición mutation, secuencia subscription y una limitación documentada del sink local. El siguiente tema automatiza queries/mutations con `GraphQlTester`.

**Fallo deliberado:** intenta deliberadamente marcar como entregado una parada cancelada; verifica que no se modifica el estado ni se emite una notificación.

```bash
./mvnw test
```

**Resultado esperado:** la mutation válida devuelve estado actualizado y el cliente ya suscrito recibe el nuevo evento; transición inválida queda rechazada. **Errores comunes:** tratar eventos en memoria como durable, no autenticar subscriptions y olvidar backpressure/limpieza de sinks. Fuentes oficiales: [controladores anotados](https://docs.spring.io/spring-graphql/reference/controllers.html), [transporte WebSocket](https://docs.spring.io/spring-graphql/reference/transports.html).

**Proyecto propio:** `src/main/java/dev/rutaflow/ShipmentLiveController.java`. **Cuándo usar subscription:** cuando el cliente necesita actualizaciones empujadas y la app define sesión, autorización, reintento y escala. Evidencia: entrega la secuencia y un test de transición inválida.

---

### Tema 4: pruebas GraphQL con GraphQlTester

#### Paso 1 · Objetivo y preparación
Al finalizar probarás schema, respuesta, error y mutation sin depender de una base real. **Prerrequisitos:** Temas 1–3 y JUnit. Crea `graphql-test-lab` con Spring Initializr; agrega GraphQL, Web y Test.

**Ejemplo independiente:** genera el proyecto Spring Boot 4.0.9/Java 21 en una carpeta vacía; crea controller y schema mínimos, añade `spring-graphql-test` y `spring-boot-graphql-test` en scope test y ejecuta `./mvnw test`.

#### Paso 2 · Contexto y caso real
Un controller puede compilar y aun así dejar schema sin resolver, devolver null para campo no nulo o cambiar la forma del JSON. Un test de contrato detecta estas fallas antes de que Flutter o web consuman la API.

#### ¿Por qué es importante?
`GraphQlTester` mantiene una API común para probar ejecución directa, HTTP, WebSocket o RSocket. Cada modo prueba un límite distinto: ejecución directa no prueba sockets ni red.

#### Paso 3 · Teoría, modelo mental y analogía
El test envía un documento GraphQL, selecciona una ruta JSON con `path`, compara valores y exige que no queden errores. Como probar un formulario, comprueba campos y mensajes, no solo que la página cargue.

#### Paso 4 · Demostración guiada
Agrega `spring-graphql-test` y `spring-boot-graphql-test` en scope test, con versiones gestionadas por Boot. Crea `src/test/java/dev/rutaflow/ShipmentGraphQlTest.java`:

```java
package dev.rutaflow;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.graphql.test.autoconfigure.GraphQlTest;
import org.springframework.graphql.test.tester.GraphQlTester;

@GraphQlTest(ShipmentController.class)
class ShipmentGraphQlTest {
    @Autowired GraphQlTester graphQlTester;

    @Test
    void returnsRequestedShipmentFields() {
        graphQlTester.document("{ shipment(id: \"sh-42\") { id status } }")
                .execute()
                .path("shipment.id").entity(String.class).isEqualTo("sh-42")
                .path("shipment.status").entity(String.class).isEqualTo("IN_TRANSIT")
                .path("errors").doesNotExist();
    }
}
```

Si el controller requiere `ShipmentService`, agrega un `@MockitoBean` fake (o un test slice con bean de prueba) que devuelva un resultado conocido. Corre `./mvnw -Dtest=ShipmentGraphQlTest test`.

#### Paso 5 · Práctica guiada
Agrega query de ID inexistente y verifica su contrato; prueba una mutation válida. **Pista:** usa `errors().verify()` para dejar claro si el caso debe fallar en GraphQL o responder una carga con error esperado.

#### Paso 6 · Práctica independiente
Prueba que solicitar `trackingSecret` produce error de validación, y una prueba de permisos para otro usuario. Marca aparte las pruebas HTTP/WebSocket que no haya ejecutado este slice.

#### Paso 7 · Cierre y evidencia
Entrega salida de tests, documento de operación usado y límites de la prueba slice. El siguiente tema de la ruta es Spring Cloud Stream para mensajería entre procesos.

**Fallo deliberado:** renombra `status` en el resolver pero no en el schema; corre el test y sigue el error hasta campo sin data fetcher/property compatible.

```bash
./mvnw -Dtest=ShipmentGraphQlTest test
```

**Resultado esperado:** query válida compara `sh-42`/`IN_TRANSIT`; campo inexistente o error inesperado hace fallar el test. **Errores comunes:** tratar status HTTP 200 como éxito, ocultar errores con filtros generales y decir “WebSocket probado” tras ejecutar un test slice. Fuentes oficiales: [GraphQlTester](https://docs.spring.io/spring-graphql/reference/testing.html), [testing de Spring Boot GraphQL](https://docs.spring.io/spring-boot/reference/web/spring-graphql.html).

**Proyecto propio:** `src/test/java/dev/rutaflow/ShipmentGraphQlTest.java`. **Cuándo usar HTTP/WS tester:** cuando quieras verificar el transporte además de la ejecución de schema. Evidencia de aprendizaje: entrega el test y una matriz de unidad/slice/HTTP/WS.

---

## Referencias oficiales consultadas

- [Spring GraphQL 2.0.6](https://docs.spring.io/spring-graphql/reference/)
- [Spring Boot 4.0 requisitos](https://docs.spring.io/spring-boot/4.0/system-requirements.html)
- [Boot starter y transports](https://docs.spring.io/spring-graphql/reference/boot-starter.html)
- [Controllers, Query/Mutation/Subscription](https://docs.spring.io/spring-graphql/reference/controllers.html)
- [GraphQlTester](https://docs.spring.io/spring-graphql/reference/testing.html)
