# Módulo 25: Spring Cloud Stream con Kafka y RabbitMQ

## Aprende construyendo

Usarás el modelo funcional de Spring Cloud Stream 5.0.4 con Spring Boot 4.0.9, Java 21 y Spring Cloud 2025.1.4. La tabla oficial de Spring Cloud indica que el tren 2025.1.x soporta Boot 4.0.x; el binder conecta el código con Kafka o RabbitMQ. No confundas la abstracción compartida con garantías idénticas entre brokers.

---

### Tema 1: bindings y destinations

#### Paso 1 · Objetivo y preparación
Al finalizar crearás una función que transforma un evento y configurarás sus bindings de entrada/salida con nombres claros. **Prerrequisitos:** Java 21, funciones `Consumer`/`Function`, JSON y el Módulo 21 (Kafka). Genera proyecto Maven desde Initializr con Boot 4.0.9, Java 21 y Web/Test.

**Ejemplo independiente:** descarga en carpeta vacía `stream-bindings-lab` desde `https://start.spring.io/starter.zip` con `bootVersion=4.0.9`, `javaVersion=21`, `dependencies=web,test`; agrega BOM Spring Cloud 2025.1.4, `spring-cloud-starter-stream-kafka` 5.0.4 y ejecuta `./mvnw test`.

#### Paso 2 · Contexto y caso real
`shipping` recibe `ShipmentCreated` y publica `RoutePlanningRequested`. El equipo quiere mantener el código de negocio estable y cambiar el destino de mensajería por configuración.

#### ¿Por qué es importante?
Bindings separan una función de nombres físicos de tópicos/colas. La abstracción reduce acoplamiento de API, pero cada binder decide provisioning, particiones, ack, DLQ y otros detalles específicos.

#### Paso 3 · Teoría, modelo mental y analogía
Una `Function<I,O>` recibe mensajes y emite mensajes. Spring deriva nombres de bindings como `planRoute-in-0` y `planRoute-out-0`; el `destination` los conecta a topic o exchange/cola. El `group` hace que instancias trabajen como grupo de consumidores en vez de recibir una copia independiente.

#### Paso 4 · Demostración guiada
Crea `src/main/java/dev/rutaflow/RouteFunctions.java`:

```java
package dev.rutaflow;

import java.util.function.Function;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

record ShipmentCreated(String shipmentId, String postalCode) {}
record RoutePlanningRequested(String shipmentId, String region) {}

@Configuration
class RouteFunctions {
    @Bean
    Function<ShipmentCreated, RoutePlanningRequested> planRoute() {
        return event -> new RoutePlanningRequested(
                event.shipmentId(), event.postalCode().substring(0, 2));
    }
}
```

Configura `src/main/resources/application.yml`:

```yaml
spring:
  cloud:
    function:
      definition: planRoute
    stream:
      bindings:
        planRoute-in-0:
          destination: shipments.created
          group: route-planner
        planRoute-out-0:
          destination: routes.requested
```

Ejecuta `./mvnw test`; el test binder del Tema 4 permitirá probar entrada/salida sin broker. Observa nombres lógicos y `destination` separado en el YAML.

#### Paso 5 · Práctica guiada
Agrega `region` al mensaje de salida y prueba un código postal inválido. **Pista:** el binding name se deriva del nombre de la función y la posición de entrada/salida; conserva el nombre cuando renombres la función o actualiza su configuración.

#### Paso 6 · Práctica independiente
Conecta la misma función a Kafka y Rabbit mediante perfiles separados con `spring.profiles.active`. Enumera qué configuras en YAML, qué añade el binder y qué debes aprovisionar/revisar en el broker.

#### Paso 7 · Cierre y evidencia
Entrega función, archivo YAML de cada perfil y test binder verde. El siguiente tema conecta destinos con broker y contrasta entrega real frente a in-memory.

**Fallo deliberado:** renombra `planRoute` sin cambiar el binding name; arranca el test y diagnostica el binding sin consumidor/productor asociado.

```bash
./mvnw test
```

**Resultado esperado:** el test transforma shipment a región y ambas direcciones usan destinos declarados. **Errores comunes:** omitir consumer group, confundir nombre binding con nombre de topic/queue y esperar que config de Kafka aplique a Rabbit. Fuentes oficiales: [modelo funcional](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/functional-binding-names.html), [abstracción binder](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/overview-binder-abstraction.html), [compatibilidad Spring Cloud](https://docs.spring.io/spring-cloud-release/reference/index.html).

**Proyecto propio:** `src/main/resources/application.yml`. **Cuándo usar Stream:** cuando el servicio encaja en bindings/funciones; para controlar features específicas, evalúa directamente Spring Kafka/Spring AMQP. Evidencia de aprendizaje: entrega configuración y salida de test por destino.

---

### Tema 2: binder Kafka y binder RabbitMQ

#### Paso 1 · Objetivo y preparación
Al finalizar ejecutarás la misma función con Kafka y RabbitMQ, comparando broker y destinos observados. **Prerrequisitos:** Tema 1, Kafka M21 y RabbitMQ M8. Crea `stream-brokers-lab` desde cero, Java 21, Boot 4.0.9 y dependencias Stream Kafka/Rabbit 5.0.4 gestionadas por Cloud 2025.1.4.

**Ejemplo independiente:** genera un proyecto limpio con `web,test`, agrega dos binders, y define perfiles `application-kafka.yml` y `application-rabbit.yml`; ejecuta `./mvnw test` antes de conectar brokers.

#### Paso 2 · Contexto y caso real
El planificador publica rutas para que otros consumidores las reciban. Kafka guarda registros en topics/particiones y los grupos leen offsets; RabbitMQ enruta publicaciones a exchanges y colas con acknowledgements. El código función puede ser el mismo; semántica/operación no lo es.

#### ¿Por qué es importante?
Una abstracción puede ocultar detalles repetidos, no debe borrar cómo se conserva el mensaje, se confirma, se reintenta o se reprocesa. La decisión afecta replay, orden, retención y operación.

#### Paso 3 · Teoría, modelo mental y analogía
El binder implementa el enlace entre aplicación y sistema de mensajes. Kafka se parece a un registro particionado con offsets; RabbitMQ, a un cartero que enruta a colas. Usa perfiles para seleccionar binder y broker; nunca cargues un test binder como evidencia de conectividad real.

#### Paso 4 · Demostración guiada
Agrega en `pom.xml` `spring-cloud-starter-stream-kafka` y `spring-cloud-starter-stream-rabbit` con versiones gestionadas. En `application-kafka.yml` usa:

```yaml
spring:
  config:
    activate:
      on-profile: kafka
  kafka:
    bootstrap-servers: localhost:9092
  cloud:
    stream:
      default-binder: kafka
```

En `application-rabbit.yml` configura `spring.rabbitmq.host=localhost`, puerto `5672`, usuario/clave solo desde variables de entorno y `spring.cloud.stream.default-binder=rabbit`. Levanta cada broker con su documentación oficial, arranca `./mvnw spring-boot:run -Dspring-boot.run.profiles=kafka` y repite con `rabbit`. Publica un evento y observa el topic Kafka o exchange/queue Rabbit en sus herramientas de inspección.

#### Paso 5 · Práctica guiada
Registra el mismo evento en ambos perfiles y compara nombre/destino, grupo, ack/replay disponible y herramienta usada para inspeccionar. **Pista:** solo marca “broker probado” cuando existe evidencia del broker y el proceso recibió/publicó el mensaje.

#### Paso 6 · Práctica independiente
Desconecta temporalmente un broker y registra el mensaje observable, logs y comportamiento de reintento de conexión. Haz una tabla con retención/offset en Kafka y acknowledgements/cola en Rabbit; no asumas que una propiedad se mapea igual.

#### Paso 7 · Cierre y evidencia
Entrega ambos perfiles, salida de inicio y captura/log de un mensaje por cada broker. El siguiente tema configura errores/DLQ según el binder.

**Fallo deliberado:** pon deliberadamente puerto incorrecto (`9093` o `5673`) y diagnostica connection refused; corrige host/puerto sin cambiar el código de función.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=kafka
./mvnw spring-boot:run -Dspring-boot.run.profiles=rabbit
```

**Resultado esperado:** el mensaje llega al destino físico del broker elegido y el perfil equivocado falla con conexión observable. **Errores comunes:** publicar contraseñas, atribuir durable semantics al binder genérico y declarar broker comprobado solo por compilar. Fuentes oficiales: [Kafka binder](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/), [Rabbit binder](https://docs.spring.io/spring-cloud-stream/reference/rabbit/rabbit_overview.html).

**Proyecto propio:** `application-kafka.yml` y `application-rabbit.yml`. **Cuándo escoger:** pesa replay/retención y particiones en Kafka frente a routing/ack y colas en Rabbit, además de experiencia operativa. Evidencia de aprendizaje: entrega las dos trazas observadas y la comparación.

---

### Tema 3: reintentos, error handler y dead-letter

#### Paso 1 · Objetivo y preparación
Al finalizar separarás error transitorio de permanente y enviarás a DLQ con límites explícitos para Kafka y RabbitMQ. **Prerrequisitos:** Tema 2 y M21/M8. Crea `stream-retry-lab` con Boot 4.0.9/Java 21 y binder de tu broker de laboratorio.

**Ejemplo independiente:** descarga un proyecto limpio a `stream-retry-lab`, agrega función, binder y `application.yml`; configura límite de intentos y corre `./mvnw test` usando test binder.

#### Paso 2 · Contexto y caso real
Si el servicio de geocodificación está caído, reintentar poco tiempo puede funcionar. Si el payload siempre tiene región inválida, repetirlo infinitamente no lo arreglará. DLQ conserva el fallo para investigar o reconciliar.

#### ¿Por qué es importante?
Reintento sin límite puede bloquear particiones, aumentar cola y repetir efectos. DLQ no significa “mensaje arreglado”: un proceso/operador debe revisar, corregir o reprocesar con idempotencia.

#### Paso 3 · Teoría, modelo mental y analogía
Spring Cloud Stream puede volver a invocar el handler con `max-attempts`; tras fallar, cada binder configura su propio destino DLQ. Kafka requiere group explícito y `enable-dlq`; Rabbit usa `auto-bind-dlq`. Los soportes y headers difieren por binder.

#### Paso 4 · Demostración guiada
Para Kafka, en `application-kafka.yml` agrega:

```yaml
spring:
  cloud:
    stream:
      bindings:
        planRoute-in-0:
          group: route-planner
          consumer:
            max-attempts: 3
      kafka:
        bindings:
          planRoute-in-0:
            consumer:
              enable-dlq: true
```

Para Rabbit configura `spring.cloud.stream.rabbit.bindings.planRoute-in-0.consumer.auto-bind-dlq=true`; conserva `group` para nombre/consumo del destino y consulta las opciones específicas de republish. Haz que `planRoute` lance `IllegalArgumentException` solo para una región `XX`; observa intentos y el destino DLQ en el broker.

#### Paso 5 · Práctica guiada
Crea un fallo transitorio que desaparezca en un intento y un error permanente que termine en DLQ. **Pista:** no reintentes errores de validación; idempotencia controla que un reintento tras timeout no aplique dos veces el negocio.

#### Paso 6 · Práctica independiente
Define runbook con responsable, alerta, inspección de payload, redacción de datos personales, corrección/replay y clave de deduplicación. Prueba mensaje válido, error que se recupera y fallo que queda en DLQ.

#### Paso 7 · Cierre y evidencia
Entrega YAML por broker, conteo de reintentos y evidencia de DLQ. El siguiente tema prueba función con test binder sin confundirlo con broker real.

**Fallo deliberado:** desactiva deliberadamente DLQ y provoca fallo permanente; observa la conducta del binder, vuelve a activarla y confirma el mensaje en el destino de error.

```bash
./mvnw test
```

**Resultado esperado:** transitorio se recupera antes del límite; permanente se envía a DLQ configurada y se registra el motivo sin exponer secreto. **Errores comunes:** no definir group para Kafka DLQ, asumir propiedades idénticas en Rabbit y Kafka, y hacer replay sin validar idempotencia. Fuentes oficiales: [error handling](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/overview-error-handling.html), [Kafka DLQ](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/dlq.html), [Rabbit binder](https://docs.spring.io/spring-cloud-stream/reference/rabbit/rabbit_overview.html).

**Proyecto propio:** `docs/stream-dlq-runbook.md`. **Cuándo enviar a DLQ:** tras la política de retry acordada y antes de perder/reprocesar sin control. Evidencia de aprendizaje: entrega trazas transitorio/permanente y runbook.

---

### Tema 4: test binder y límites de la prueba

#### Paso 1 · Objetivo y preparación
Al finalizar probarás `planRoute` con el binder in-memory y distinguirás el resultado de una prueba con Kafka/Rabbit real. **Prerrequisitos:** Temas 1–3, JUnit. Crea `stream-test-lab` con Spring Boot 4.0.9/Java 21.

**Ejemplo independiente:** genera en carpeta vacía un proyecto con `web,test`, BOM Cloud 2025.1.4, test binder en scope test y función; corre `./mvnw test`.

#### Paso 2 · Contexto y caso real
La suite local debe correr sin docker/broker para probar mapping y lógica. Antes del release, se necesita otra capa que arranque el broker real y pruebe el binder, serialización, provisionamiento y recuperación.

#### ¿Por qué es importante?
El test binder es broker en memoria basado en Spring Integration; no valida conexión, protocolo, topología física ni durabilidad real.

#### Paso 3 · Teoría, modelo mental y analogía
`@EnableTestBinder`, `InputDestination` y `OutputDestination` conectan prueba a función con payloads. Es como probar el circuito con fuente de laboratorio: detecta cables lógicos, no garantiza que la planta eléctrica del proveedor esté disponible.

#### Paso 4 · Demostración guiada
Agrega dependencia test `org.springframework.cloud:spring-cloud-stream-test-binder`. Crea `src/test/java/dev/rutaflow/RouteFunctionsTest.java`:

```java
package dev.rutaflow;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.stream.binder.test.EnableTestBinder;
import org.springframework.cloud.stream.binder.test.InputDestination;
import org.springframework.cloud.stream.binder.test.OutputDestination;
import org.springframework.messaging.support.GenericMessage;

@SpringBootTest
@EnableTestBinder
class RouteFunctionsTest {
    @Autowired InputDestination input;
    @Autowired OutputDestination output;

    @Test
    void mapsShipmentIntoPlanningRequest() {
        input.send(new GenericMessage<>("{\"shipmentId\":\"sh-42\",\"postalCode\":\"10ABC\"}".getBytes()),
                "planRoute-in-0");
        var message = output.receive(1_000, "planRoute-out-0");
        assertThat(message).isNotNull();
        assertThat(new String((byte[]) message.getPayload())).contains("sh-42", "10");
    }
}
```

Corre `./mvnw -Dtest=RouteFunctionsTest test`. Luego crea una prueba de integración separada con Kafka Testcontainers o RabbitMQ Testcontainers cuando Docker esté disponible y comprueba que el test binder no esté reemplazando al binder real.

#### Paso 5 · Práctica guiada
Envía un JSON inválido y verifica el error de conversión. **Pista:** separa la prueba del mapper/handler de la prueba del binder; revisa payload y content-type antes de cambiar el código de negocio.

#### Paso 6 · Práctica independiente
Completa matriz `unit/test binder/broker real/contrato`: qué valida, qué recurso requiere y evidencia. Ejecuta únicamente las capas con herramientas disponibles y marca otras como pendientes.

#### Paso 7 · Cierre y evidencia
Entrega test binder verde y matriz con lo ejecutado/no ejecutado. El próximo paso de la ruta es el capstone de sistema distribuido de entregas, integrando contratos, persistencia, broker, operación y pruebas.

**Fallo deliberado:** cambia `planRoute-out-0` por un binding inexistente y observa que no llega salida; restaura el nombre derivado de la función.

```bash
./mvnw -Dtest=RouteFunctionsTest test
```

**Resultado esperado:** el test in-memory obtiene `sh-42` y la región `10`; JSON inválido o binding distinto falla de forma visible. **Errores comunes:** presentar test binder como prueba de broker, incluir test binder en runtime y asumir compatibilidad entre distintos destinos por compilar la función. Fuente oficial: [testing con Spring Integration test binder](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/spring_integration_test_binder.html).

**Proyecto propio:** `src/test/java/dev/rutaflow/RouteFunctionsTest.java`. **Cuándo declarar broker probado:** solo tras ejecutar la misma operación contra el broker y binder reales. Evidencia de aprendizaje: entrega matriz, test y resultado de capa real o pendiente.

---

## Referencias oficiales consultadas

- [Spring Cloud Release 2025.1.4](https://docs.spring.io/spring-cloud-release/reference/index.html)
- [Spring Cloud Stream](https://docs.spring.io/spring-cloud-stream/reference/)
- [Functional binding names](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/functional-binding-names.html)
- [Kafka binder](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/)
- [RabbitMQ binder](https://docs.spring.io/spring-cloud-stream/reference/rabbit/rabbit_overview.html)
- [Error handling](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/overview-error-handling.html)
- [Test binder](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/spring_integration_test_binder.html)
