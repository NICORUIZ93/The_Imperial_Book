# Módulo 10: Mensajería con Kafka: eventos, errores, outbox y contratos

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria, verificado contra un broker real (`@EmbeddedKafka`, sin necesitar Docker), para que "el evento se publicó y se consumió" sea comprobable, no solo descrito. El laboratorio es `spring-kafka-rutaflow`. RabbitMQ, JMS y Spring Cloud Stream siguen en el Módulo 11.

## Aprende construyendo

### Tema 1: Producers y consumers con Spring Kafka · Intermedio · 35 min

**Duración estimada:** 35 min.
**¿Por qué es importante?** Un evento permite que quien registra un envío continúe sin llamar directamente a cada sistema que lo usa. Kafka conserva los mensajes y varios grupos pueden procesarlos por separado.
**Prerrequisitos:** Spring Boot M1 T1 y M2 T1. Proyecto continuo: enviar un evento de creación y permitir ruteo y notificaciones independientes.
**Laboratorio:** `spring-kafka-rutaflow`. Usa JDK 25, Spring Boot 4.1.2 y el Maven Wrapper incluido. El mismo proyecto contiene patrones de los temas posteriores (reintentos/DLT y outbox/inbox); en este Tema 1 practica solo los tres subtemas y sus pruebas dirigidas. Si quieres provocar los fallos, copia el directorio a `spring-kafka-practice` y cambia allí las líneas indicadas.

#### Subtema 1.1: Publica el evento con la clave del envío · 10 min

**1. Contexto**
El identificador del envío sirve de clave para mantener sus eventos relacionados en una misma partición de Kafka.

**2. Hazlo tú**
Abre el archivo completo EnvioEventPublisher.java. Confirma que publicar envía topic, clave y evento:

```java
public CompletableFuture<SendResult<String, EnvioCreado>> publicar(EnvioCreado evento) {
    return kafka.send(TOPIC, evento.envioId().toString(), evento);
}
```

El mensaje contiene dos identificadores distintos: `eventId` identifica este hecho; `envioId` agrupa todos los cambios del envío. El record real vive en el código de este tema:

```java
public record EnvioCreado(
        UUID eventId, UUID envioId, int version, Instant occurredAt, String referencia) {}
```

En el código de este tema, revisa los serializers y deserializers JSON que permiten escribir y leer EnvioCreado:

```yaml
spring:
  kafka:
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      properties:
        enable.idempotence: true
    consumer:
      group-id: rutaflow-ruteo
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.value.default.type: academia.rutaflow.event.EnvioCreado
        spring.json.trusted.packages: academia.rutaflow.event
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

**Resultado esperado:** la prueba confirma topic, clave, partición, offset y el mismo evento recibido por el consumidor.

**Fallo deliberado:** cambia la clave por el identificador del evento. **Error esperado:** la prueba informa que la clave recibida no coincide con el identificador del envío. **Diagnóstico:** el envío y sus eventos deben compartir una clave estable si el negocio requiere procesarlos en el mismo orden.

**3. Entiende**
KafkaTemplate devuelve un CompletableFuture<SendResult<...>>; publicar inicia una operación asíncrona. La clave no es el valor del evento: Kafka la usa para decidir la partición.

**4. Cierra**
Anota topic, clave y partición que devolvió la prueba. Verifica qué campo elegirías para conservar juntos los cambios de un mismo envío.

#### Subtema 1.2: Conecta dos grupos consumidores · 10 min

**1. Contexto**
Ruteo y notificaciones deben procesar el mismo hecho, cada grupo con su propio avance. `groupId` nombra al lector lógico; el `@KafkaListener` se suscribe al topic y recibe cada registro asignado a su grupo.

**2. Hazlo tú**
Lee los archivos completos:

- RuteoListener.java
- NotificacionListener.java

Compara el valor de `groupId` en ambos listeners. Este extracto real de `RuteoListener.java` muestra la suscripción y la key que llega en la cabecera:

```java
@KafkaListener(topics = EnvioEventPublisher.TOPIC, groupId = "rutaflow-ruteo")
public void alCrear(
        EnvioCreado evento,
        @Header(KafkaHeaders.RECEIVED_KEY) String key,
        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
        @Header(KafkaHeaders.OFFSET) long offset) {
    inbox.procesar(evento);
    recibidos.add(new Recibido(key, partition, offset, evento));
}
```

`NotificacionListener.java` usa el mismo topic y `groupId = "rutaflow-notificaciones"`. Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

**Resultado esperado:** ambos grupos reciben el mismo registro y cada listener pone su copia en una cola de prueba independiente. La prueba compara key, partición, offset y contenido; esas colas solo sincronizan el test, no son colas de Kafka.

**Fallo deliberado:** cambia el groupId de notificaciones por el de ruteo. **Error esperado:** la comprobación de la segunda cola queda sin mensaje y vence el timeout. **Diagnóstico:** dos consumidores en el mismo grupo reparten trabajo; dos grupos distintos reciben cada uno una copia lógica del registro.

**3. Entiende**
Un consumer group representa un lector lógico. Kafka distribuye cada partición entre los consumidores de un grupo; los offsets de grupos distintos son independientes. Un evento no llama un método Java del otro servicio.

**4. Cierra**
Escribe qué grupo atiende cada listener y por qué el publicador no tiene que conocer esos nombres.

#### Subtema 1.3: Comprueba orden y entrega con un broker · 15 min

**1. Contexto**
El envío al topic no implica que el listener ya haya terminado. Comprueba el recorrido con un broker embebido y espera a que el consumidor procese el evento.

**2. Hazlo tú**
Observa EnvioEventPublisherTest.java y. La prueba dirige el broker embebido a tres particiones y compara la metadata de Kafka con lo que recibió el consumidor:

```java
var primero = publisher.publicar(primerEvento).get(10, TimeUnit.SECONDS).getRecordMetadata();
var segundo = publisher.publicar(segundoEvento).get(10, TimeUnit.SECONDS).getRecordMetadata();

assertThat(primero.partition()).isEqualTo(segundo.partition());
assertThat(segundo.offset()).isGreaterThan(primero.offset());
assertThat(recibidoPrimero.evento()).isEqualTo(primerEvento);
assertThat(recibidoSegundo.evento()).isEqualTo(segundoEvento);
```

Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#conservaParticionYOrdenParaDosEventosDelMismoEnvio test
```

**Resultado esperado:** los dos eventos comparten partición, el segundo tiene un offset mayor y el listener los recibe en el mismo orden.

**Fallo deliberado:** en el publicador usa un UUID aleatorio como clave en vez de envioId. **Error esperado:** la prueba ya no puede confirmar una partición común para los dos eventos. **Diagnóstico:** el particionador recibe claves diferentes; genera la clave a partir del envío que define el orden del negocio.

**3. Entiende**
El orden está garantizado dentro de una partición, no entre todas las particiones del topic. Kafka aplica el particionador a la key; para el mismo topic y número de particiones, una key estable coloca los registros de ese envío juntos. `acks: all` e idempotencia ayudan al productor frente a fallos y reintentos; no hacen que el efecto de negocio del consumidor se ejecute una sola vez. Eso requiere diseño adicional y se estudia después.

**4. Cierra**
Entrega los resultados de ambas pruebas y describe qué esperarías si publicaras dos eventos del mismo envío con claves distintas.

**Hito del tema:**

- [ ] Publiqué un evento con KafkaTemplate y clave estable.
- [ ] Identifiqué los grupos independientes de ruteo y notificaciones.
- [ ] Verifiqué partición, offset y orden mediante un broker embebido.
- [ ] Reproduje un fallo por usar una clave incorrecta y lo diagnostiqué.

**Nota del laboratorio:** `@DirtiesContext` cierra el contexto Spring antes que el broker embebido; en la suite de 8 pruebas ya no aparece el error de `KafkaStorageException` al borrar el directorio temporal. Kafka 4.2.2 aún registra un `WARN` interno al cerrar un cliente que ya se había cerrado. La prueba de la DLT usa la sobrecarga vigente `KafkaTestUtils.consumerProps(broker, "verificador-dlt", false)`, disponible desde Spring Kafka 4.0.

**Fuentes oficiales:** [envío con KafkaTemplate](https://docs.spring.io/spring-kafka/reference/kafka/sending-messages.html), [recepción con listeners](https://docs.spring.io/spring-kafka/reference/kafka/receiving-messages.html), [pruebas con broker embebido](https://docs.spring.io/spring-kafka/reference/4.0/testing.html) y [KafkaTestUtils 4.0](https://docs.spring.io/spring-kafka/docs/4.0.x/api/org/springframework/kafka/test/utils/KafkaTestUtils.html).

**Transferencia al proyecto integrador:** conecta el evento de envío con consumidores independientes y conserva el identificador del envío como clave para el procesamiento ordenado por partición.

### Tema 2: Dead-letter queue · Intermedio · 35 min

**Duración estimada:** 35 min.
**¿Por qué es importante?** Si el consumidor rechaza un mensaje cada vez, los reintentos deben tener un límite y el mensaje requiere un destino donde el equipo pueda investigarlo.
**Prerrequisitos:** M10 T1. Proyecto continuo: apartar eventos de envío que no pasan la validación del listener.
**Laboratorio:** `spring-kafka-rutaflow`. Continúa en `spring-kafka-practice`, la copia que preparaste en el Tema 1; allí prueba cambios deliberados sin alterar la versión base.

#### Subtema 2.1: Configura reintentos limitados y DLT · 10 min

**1. Contexto**
Kafka no crea un DLT de aplicación automáticamente. El listener informa el fallo; un manejador decide si vuelve a ejecutar el listener y dónde deja el registro que sigue fallando.

**2. Hazlo tú**
Observa KafkaLabConfiguration.java y estudia el bean completo errorHandler:

```java
@Bean
DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> kafka) {
    var recoverer = new DeadLetterPublishingRecoverer(kafka);
    return new DefaultErrorHandler(recoverer, new FixedBackOff(100L, 2));
}
```

En la misma clase confirma que se crean `rutaflow.envio.creado` y `rutaflow.envio.creado-dlt`, ambos con tres particiones. `FixedBackOff(100L, 2)` define 100 ms entre reintentos y dos reintentos adicionales después del primer intento. Desde la raíz de la copia ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

**Resultado esperado:** Maven termina con BUILD SUCCESS y la prueba encuentra el evento fallido en rutaflow.envio.creado-dlt.

**Fallo deliberado:** comenta el bean errorHandler en la copia del laboratorio y vuelve a ejecutar. **Error esperado:** la prueba no encuentra el registro en la DLT y vence su espera. **Diagnóstico:** sin recoverer configurado no hay una regla que publique el registro fallido en el destino esperado.

**3. Entiende**
`DefaultErrorHandler` coordina los fallos del listener; `FixedBackOff` define el intervalo y el máximo de reintentos. `DeadLetterPublishingRecoverer` publica en otro topic cuando se agota la política. Sin un DLT configurado, la aplicación necesita otra estrategia explícita para los mensajes irrecuperables.

**4. Cierra**
Señala dónde se crea el topic original, dónde se crea el DLT y qué bean conecta el fallo con la recuperación.

#### Subtema 2.2: Provoca un mensaje inválido y comprueba los intentos · 10 min

**1. Contexto**
Una clave que no coincide con el envío hace que el listener falle siempre. Ese error repetible permite observar cada reintento y comprobar que el mensaje no desaparece.

**2. Hazlo tú**
Observa EnvioEventPublisherTest.java y ejecuta el test reintentaYPublicaEnDltCuandoLaKeyNoCoincide:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

Localiza en la prueba el envío con key incorrecta, la espera por tres intentos y la lectura desde el topic DLT. Este fragmento toma la metadata del topic original y comprueba la key, partición y contenido que recuperó el consumer:

```java
var origen = kafka.send(EnvioEventPublisher.TOPIC, "key-incorrecta", evento)
        .get(10, TimeUnit.SECONDS).getRecordMetadata();
await().atMost(Duration.ofSeconds(5))
        .untilAsserted(() -> assertThat(ruteoListener.intentos()).isEqualTo(3));
ConsumerRecord<String, String> deadLetter = KafkaTestUtils.getSingleRecord(
        consumer, EnvioEventPublisher.TOPIC + "-dlt", Duration.ofSeconds(10));

assertThat(deadLetter.key()).isEqualTo("key-incorrecta");
assertThat(deadLetter.partition()).isEqualTo(origen.partition());
assertThat(deadLetter.value()).contains("RT-DLT");
```

**Resultado esperado:** el test confirma tres entregas fallidas del listener y encuentra el JSON del envío en `rutaflow.envio.creado-dlt`, con la key y partición originales.

**Fallo deliberado:** cambia la key incorrecta del test por envioId.toString(). **Resultado esperado:** la ruta de ruteo acepta el mensaje y la condición de tres fallos vence. **Diagnóstico:** el caso deja de ser inválido; restaura una key que no coincida para que el test ejercite el error y la recuperación.

**3. Entiende**
FixedBackOff(100L, 2) significa un intento inicial y hasta dos reintentos adicionales: tres entregas al listener en total. El evento que llega al DLT queda disponible para inspección y reproceso controlado.

**4. Cierra**
Anota el total de intentos, el topic de origen y el DLT donde quedó el registro.

#### Subtema 2.3: Ajusta la política y atiende los mensajes recuperados · 15 min

**1. Contexto**
El número de reintentos y el tiempo de espera dependen del fallo. Un dato definitivamente inválido no mejora por esperar; un problema temporal sí podría resolverse con otro intento.

**2. Hazlo tú**
En `spring-kafka-practice/src/main/java/academia/rutaflow/KafkaLabConfiguration.java`, cambia `FixedBackOff(100L, 2)` por `FixedBackOff(100L, 0)`. En `spring-kafka-practice/src/test/java/academia/rutaflow/event/EnvioEventPublisherTest.java`, cambia la expectativa de `intentos()` de `3` a `1`; vuelve a ejecutar el test:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

**Resultado esperado:** con cero reintentos adicionales, el primer fallo se recupera y el mensaje llega a rutaflow.envio.creado-dlt.

**Fallo deliberado:** en esa prueba cambia las dos lecturas de `EnvioEventPublisher.TOPIC + "-dlt"` por `EnvioEventPublisher.TOPIC + "-dlt-mal"`. **Error esperado:** el consumidor agota los diez segundos y la prueba falla porque el topic alternativo no recibió el mensaje. **Diagnóstico:** el recoverer usa el sufijo `-dlt`; restaura la misma ruta en la escucha y en la lectura.

**3. Entiende**
El recoverer de esta práctica usa por defecto el topic original más el sufijo `-dlt`, y conserva key y partición si el topic destino tiene esa partición. El test lo comprueba comparando la metadata del envío original y el registro recuperado. El DLT requiere monitoreo y responsable; acumular mensajes sin revisarlos solo traslada el problema.

**4. Cierra**
Restaura la configuración del proyecto a FixedBackOff(100L, 2), conserva la salida correcta y explica cuándo dejarías de reintentar un error de validación.

**Hito del tema:**

- [ ] Configuré DefaultErrorHandler y DeadLetterPublishingRecoverer.
- [ ] Comprobé el intento inicial y los dos reintentos configurados.
- [ ] Encontré el registro fallido en el topic terminado en -dlt.
- [ ] Cambié temporalmente a cero reintentos y restauré el laboratorio.

**Fuentes oficiales:** [manejo de excepciones y reintentos en Spring Kafka](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html) y [publicación en dead-letter topics](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html#publishing-dead-letter-records).

**Transferencia al proyecto integrador:** define reintentos según el tipo de fallo y envía los eventos irrecuperables a un DLT monitoreado con un procedimiento de revisión.

### Tema 3: Transacciones Kafka y SQL: idempotencia y límites de exactly-once · Avanzado · 45 min

**Duración estimada:** 50 min.
**¿Por qué es importante?** Un productor puede repetir un envío y un consumidor puede volver a recibir un evento. Evita duplicar el efecto y distingue la transacción del broker de la transacción de la base de datos.
**Prerrequisitos:** M10 T1 y M10 T2. Proyecto continuo: guardar un envío, publicar su evento y procesarlo sin duplicar la proyección.
**Laboratorio:** `spring-kafka-rutaflow`. Usa la copia de M10 T1. El test usa Kafka embebido y H2; comprueba estas fronteras en una sola máquina, no sustituye pruebas con PostgreSQL ni con un clúster Kafka de producción.

#### Subtema 3.1 · Reintentar el productor sin duplicar registros de Kafka · 10 min

**1. Contexto**
Si el productor pierde una confirmación, puede repetir el envío. La idempotencia permite que Kafka reconozca ese reintento de la misma sesión del productor. No deduplica dos llamadas de negocio que crean dos envíos.

**2. Hazlo tú**
Revisa `spring.kafka.producer` en el código de este tema:

```yaml
spring:
  kafka:
    producer:
      acks: all
      properties:
        enable.idempotence: true
```

Ejecuta la prueba de publicación:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

**Resultado esperado:** La prueba verifica envío, partición, key y recepción. La suite completa también pasa si cambias temporalmente `enable.idempotence` a `false`; no simula perder el ACK del productor y reintentar el mismo envío.

**Fallo deliberado:** en la copia apaga la idempotencia y ejecuta la suite. **Diagnóstico:** que la suite siga pasando significa que este test no mide reintentos internos del cliente. Restaura `true`; no presentes esta prueba como evidencia directa de la garantía.

**3. Entiende**
Idempotencia de productor reduce duplicados que Kafka recibiría por retries de una misma sesión. Dos llamadas separadas siguen siendo dos registros posibles; el efecto de negocio requiere su propia clave idempotente.

**4. Cierra**
Separa en dos frases qué duplicado resuelve Kafka y cuál debe resolver la aplicación.

#### Subtema 3.2 · Guardar envío y evento en la misma transacción SQL · 15 min

**1. Contexto**
PostgreSQL y Kafka no comparten una transacción local. Si guardas primero el envío y falla el proceso antes de publicar, el evento se perdería sin un registro pendiente durable.

**2. Hazlo tú**
Observa CrearEnvioService.java y. En `crear`, la transacción cubre ambas escrituras:

```java
@Transactional
public EnvioCreado crear(String referencia) {
    UUID envioId = UUID.randomUUID();
    EnvioCreado evento = new EnvioCreado(
            UUID.randomUUID(), envioId, 1, clock.instant(), referencia);
    try {
        String payload = json.writeValueAsString(evento);
        jdbc.update("INSERT INTO envio (envio_id, referencia) VALUES (?, ?)", envioId, referencia);
        jdbc.update("""
                INSERT INTO outbox_event
                    (event_id, aggregate_id, event_type, payload, created_at)
                VALUES (?, ?, ?, ?, ?)
                """, evento.eventId(), envioId, "EnvioCreado", payload, evento.occurredAt());
        return evento;
    } catch (JsonProcessingException error) {
        throw new IllegalStateException("No se pudo serializar EnvioCreado", error);
    }
}
```

Este es el flujo real: serializa el evento, inserta el envío y luego outbox dentro de la misma transacción. Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#guardaEnvioYOutboxEnLaMismaTransaccion test
```

**Resultado esperado:** El test hace fallar el `INSERT` de outbox con una restricción SQL. Al salir de `crear`, no queda ni el envío ni el evento parcial.

**Fallo deliberado:** en la copia quita `@Transactional` de `crear` y repite el test. **Diagnóstico:** con autocommit, la primera escritura SQL ya se confirmó y queda una fila `envio` aunque falle outbox. Restaura la anotación.

**3. Entiende**
La outbox guarda el evento pendiente junto con el cambio de negocio en una transacción de la base de datos. Un dispatcher publica después y marca la fila solo tras recibir el ACK; entre el ACK y esa marca puede haber replay. Este dispatcher de laboratorio no reclama filas con lease: no lo ejecutes en varias instancias.

**4. Cierra**
Describe qué dato pendiente permite al dispatcher recuperar la publicación si Kafka está temporalmente fuera de servicio.

#### Subtema 3.3 · Procesar un `eventId` repetido sin duplicar el efecto · 15 min

**1. Contexto**
El dispatcher puede publicar dos veces el mismo evento si Kafka confirmó, pero el proceso no alcanzó a guardar `published_at`. El consumidor registra `eventId` en inbox junto a la proyección, dentro de una transacción.

**2. Hazlo tú**
Observa InboxProcessor.java y. Fíjate en el retorno temprano y en la transacción que contiene el registro y el efecto:

```java
@Transactional
public boolean procesar(EnvioCreado evento) {
    Integer existente = jdbc.queryForObject(
            "SELECT COUNT(*) FROM evento_procesado WHERE event_id = ?",
            Integer.class, evento.eventId());
    if (existente != null && existente > 0) {
        return false;
    }
    jdbc.update("INSERT INTO evento_procesado (event_id, processed_at) VALUES (?, ?)",
            evento.eventId(), clock.instant());
    int actualizados = jdbc.update("""
            UPDATE route_projection
            SET referencia = ?, updated_at = ?
            WHERE envio_id = ?
            """, evento.referencia(), clock.instant(), evento.envioId());
    if (actualizados == 0) {
        jdbc.update("""
                INSERT INTO route_projection (envio_id, referencia, updated_at)
                VALUES (?, ?, ?)
                """, evento.envioId(), evento.referencia(), clock.instant());
    }
    return true;
}
```

Ejecuta las pruebas de duplicado y de replay tras fallar la marca SQL después del ACK:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#inboxHaceIdempotenteElEfectoDeNegocio test
./mvnw -Dtest=EnvioEventPublisherTest#replayTrasFallarLaMarcaDespuesDelAckConservaUnaSolaProyeccion test
```

La segunda prueba agrega una restricción temporal que impide marcar una fila concreta como publicada; Kafka ya confirmó el primer registro. Al quitar la restricción, el dispatcher lo reenvía y el listener recibe dos mensajes con el mismo `eventId`.

**Resultado esperado:** El primer `procesar` devuelve `true`, el duplicado `false`; tras los dos mensajes hay una fila inbox y una sola proyección. La fila de outbox queda pendiente si falla la marca y se cierra después del replay correcto.

**Fallo deliberado:** en la copia quita el `SELECT`/retorno temprano que evita procesar un `eventId` existente. **Diagnóstico:** la segunda inserción choca con la clave primaria de inbox en vez de devolver `false`; restaura la comprobación.

**3. Entiende**
Outbox evita perder el evento entre el commit SQL y la publicación; inbox hace seguro repetir su efecto SQL. La consulta seguida del insert de este ejemplo se prueba secuencialmente; con consumidores concurrentes hay que manejar el conflicto de unicidad de forma explícita.

**4. Cierra**
Explica por qué el dispatcher puede publicar al menos una vez y cómo inbox evita que eso duplique la proyección.

#### Subtema 3.4 · Leer solo registros confirmados de una transacción Kafka · 10 min

**1. Contexto**
Una transacción de Kafka agrupa registros del broker. El consumidor `read_committed` oculta los registros abortados; `read_uncommitted` también puede observarlos. Esto no hace que una base SQL forme parte de la transacción Kafka.

**2. Hazlo tú**
En el código de este tema, estudia `transaccionKafkaAbortadaSoloEsVisibleConReadUncommitted`. El test crea un topic único, un `KafkaTemplate` transaccional y dos consumidores con distinto `isolation.level`. `DefaultKafkaProducerFactory` necesita un prefijo transaccional único:

```java
producerFactory.setTransactionIdPrefix("rutaflow-tx-" + UUID.randomUUID() + "-");
var transactionalTemplate = new KafkaTemplate<>(producerFactory);
```

El envío se confirma dentro de la transacción local y luego se provoca el rollback:

```java
transactionalTemplate.executeInTransaction(template -> {
    try {
        template.send(topic, "envio-1", "registro-abortado").get(10, TimeUnit.SECONDS);
    } catch (Exception error) {
        throw new IllegalStateException("falló el envío de prueba", error);
    }
    throw new IllegalStateException("aborto intencional de la transacción");
});
```

Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#transaccionKafkaAbortadaSoloEsVisibleConReadUncommitted test
```

**Resultado esperado:** El consumer `read_committed` no recibe el registro; `read_uncommitted` sí observa el valor `registro-abortado`. Ver ambas salidas evita que el test pase solo porque el productor no hubiera enviado nada.

**Fallo deliberado:** en el test cambia temporalmente la configuración del consumidor `committedProps` a `read_uncommitted`. **Diagnóstico:** su aserción de vacío falla porque ahora ve el registro abortado. Restaura `read_committed` y repite el método.

**3. Entiende**
Esta prueba verifica visibilidad de una transacción de productor abortada; no comprueba por sí sola el flujo completo de lectura, procesamiento y offsets. En Spring Kafka, EOS para ese flujo requiere una transacción de listener que incluya los mensajes producidos y offsets consumidos. Ninguna de estas transacciones incorpora automáticamente PostgreSQL; outbox e inbox cubren esa otra frontera.

**4. Cierra**
Identifica qué fila ve cada nivel de aislamiento y di qué parte de la garantía de exactly-once no prueba este laboratorio.

**Hito del tema:**

- [ ] Diferencié reintentos internos del productor de otra llamada de negocio.
- [ ] Comprobé el rollback conjunto de envío y outbox.
- [ ] Reproduje un fallo de marca posterior al ACK y una sola proyección tras replay.
- [ ] Comparé `read_committed` y `read_uncommitted` ante un registro abortado.
- [ ] Expliqué por qué Kafka EOS no hace partícipe a la base de datos SQL.

**Fuentes oficiales:** [idempotencia del productor Kafka](https://kafka.apache.org/41/configuration/producer-configs/), [Exactly Once Semantics en Spring Kafka 4.0](https://docs.spring.io/spring-kafka/reference/4.0/kafka/exactly-once.html), [transacciones con `KafkaTemplate`](https://docs.spring.io/spring-kafka/reference/4.0/kafka/transactions.html) y [diseño y semántica de Kafka](https://kafka.apache.org/28/design/design/).

**Transferencia al proyecto integrador:** conserva eventos pendientes en outbox, publica con clave estable y protege cada `eventId` en inbox. Describe la garantía y sus límites por cada frontera; no llames exactly-once a la operación total sin una transacción que cubra su entrada y salida.

### Tema 4: Outbox transaccional y flujo de negocio · Avanzado · 30 min

**Duración estimada:** 30 min.
**¿Por qué es importante?** Outbox permite recuperar el evento si la aplicación cae entre guardar el envío y publicarlo.

**Prerrequisitos:** Spring Boot M10 T2 y Spring Boot M4 T4 (transacciones y migraciones).

#### Subtema 4.1 · Guarda envío y evento en una transacción · 10 min

**1. Contexto**
PostgreSQL y Kafka confirman por separado. Si guardas el envío y el proceso cae antes de publicar, necesitas conservar el evento pendiente.

**2. Hazlo tú**
Abre `CrearEnvioService.java` y `V1__envio_outbox_inbox.sql`. Ejecuta la prueba de rollback:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#guardaEnvioYOutboxEnLaMismaTransaccion test
```

**Salida esperada:** `BUILD SUCCESS`; al provocar rollback no queda ni envío ni fila outbox.

**Fallo deliberado:** mueve la inserción outbox fuera de `@Transactional`. **Resultado esperado:** la prueba detecta una fila fuera del rollback. **Diagnóstico:** envío y evento deben escribirse en la misma transacción de PostgreSQL.

**3. Entiende**
Outbox cierra la ventana entre guardar el negocio y publicar. No hace un commit atómico compartido entre Kafka y PostgreSQL.

**4. Cierra**
Guarda la prueba y localiza las dos inserciones que participan en la transacción.

#### Subtema 4.2 · Publica y marca después del ack · 10 min

**1. Contexto**
El dispatcher publica filas pendientes. Solo las marca publicadas después de que Kafka confirme el envío.

**2. Hazlo tú**
Abre `OutboxDispatcher.java` y ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#dispatcherPublicaYMarcaSoloDespuesDelAck test
```

**Salida esperada:** `BUILD SUCCESS`; `published_at` queda lleno para el evento confirmado.

**Fallo deliberado:** mueve el `UPDATE published_at` antes de `kafka.send(...).get(...)`. **Resultado esperado:** un fallo de envío deja la fila marcada aunque Kafka no la aceptó. **Diagnóstico:** espera el ack antes de guardar la marca.

**3. Entiende**
El dispatcher no mantiene una transacción SQL abierta mientras espera al broker. Si cae después del ack y antes de marcar, el evento se publicará otra vez.

**4. Cierra**
Explica qué estado observa el siguiente arranque si Kafka falla antes del ack.

#### Subtema 4.3 · Reproduce el envío y comprueba deduplicación · 10 min

**1. Contexto**
Después del ack, una caída antes de guardar `published_at` puede causar una publicación repetida. La inbox hace seguro ese replay.

**2. Hazlo tú**
Abre `src/test/java/academia/rutaflow/event/EnvioEventPublisherTest.java` y ejecuta la prueba que vuelve a dejar pendiente una fila ya publicada y la entrega de nuevo:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#replayTrasAckConservaUnaSolaProyeccion test
```

**Salida esperada:** se reciben dos publicaciones del mismo `eventId`, pero queda una fila de inbox y una proyección.

**Fallo deliberado:** quita la deduplicación del consumidor y ejecuta la prueba. **Resultado esperado:** el test encuentra más de un efecto o la clave única falla. **Diagnóstico:** conservar el `eventId` permite reconocer la repetición.

**3. Entiende**
Outbox permite recuperar publicaciones; inbox protege el efecto del consumidor. En este laboratorio el dispatcher no reclama filas con lease, así que no ejecutes varias instancias a la vez.

**4. Cierra**
Guarda el resultado y explica por qué el replay puede duplicar mensajes, pero no la proyección.

**Hito del tema — marca los cuatro solo después de ejecutar:**

- [ ] Envío y outbox revierten juntos.
- [ ] El dispatcher marca después del ack.
- [ ] La prueba reproduce una publicación repetida.
- [ ] Inbox deja una sola proyección y anoté el límite de una instancia.

**Fuente:** [Spring Framework: transacciones declarativas](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html) y [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html).

**Aplicación y decisión:** En el proyecto integrador, guarda envío e intención outbox en una misma transacción y permite que el consumidor deduplique reenvíos. No atribuyas atomicidad entre SQL y Kafka a la anotación local del servicio.

### Tema 5: Rebalanceo de consumer groups y asignación de particiones · Avanzado · 45 min

**Duración estimada:** 45 min.

**Resultado:** observa cómo cambia la propiedad de las particiones cuando entra otro consumer, mantiene correcto el estado local con los callbacks y decide cuándo sirve la membresía estática.
**¿Por qué es importante?** Un estado local desactualizado puede hacer que una instancia procese datos de una partición que ya pertenece a otro miembro.

**Necesitas:** M10 T1 y un clon del laboratorio `spring-kafka-rutaflow`. Prueba el comando desde esa carpeta.

#### Subtema 5.1 · Una partición pertenece a un consumer del grupo · 10 min

**1. Contexto**

Kafka reparte las particiones suscritas entre los miembros de un mismo grupo. Dos grupos distintos pueden leer el mismo tópico; dentro de un grupo, una partición se asigna a un solo miembro a la vez. El resultado exacto depende del protocolo y del asignador.

**2. Hazlo tú**

Abre `src/test/java/academia/rutaflow/event/EnvioEventPublisherTest.java`. El laboratorio crea un tópico de prueba con dos particiones y consumer group identificable. Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#unSegundoConsumidorProvocaRebalanceoYActualizaAsignaciones test
```

Al inicio solo está activo el consumer A. El test espera a que su callback registre dos particiones antes de arrancar B.

**Resultado esperado:** Antes de arrancar B, A tiene dos asignaciones. Tras unirse B, el test espera hasta que cada uno tenga una partición.

**Fallo deliberado:** Cambia la creación del tópico de dos particiones a una. **Diagnóstico:** el test deja de poder afirmar una partición por consumer; con una partición no se pueden mantener ocupados dos consumers del mismo grupo.

**3. Entiende**

El número de consumers útiles de un grupo no puede superar el número de particiones del tópico que consumen. Tener más consumers puede ayudar con varios tópicos o asignaciones, pero uno de ellos puede quedarse sin particiones.

**4. Cierra**

Explica por qué el segundo consumer recibe trabajo al unirse y qué cambia si el tópico solo tiene una partición.

#### Subtema 5.2 · Mantener el estado local con callbacks reales · 10 min

**1. Contexto**

Cuando una partición deja de pertenecer a esta instancia, una caché o un contador local deben dejar de tratarla como propia. Kafka llama al listener antes de retirar asignaciones y después de asignar las nuevas.

**2. Hazlo tú**

En la clase de prueba `SeguimientoAsignaciones`, localiza los dos callbacks. El listener usa un conjunto concurrente porque los callbacks ocurren en el hilo del consumer:

```java
@Override
public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
    asignadas.removeAll(partitions);
    revocaciones.incrementAndGet();
}

@Override
public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
    asignadas.addAll(partitions);
}
```

Busca `containerProps.setConsumerRebalanceListener(rebalanceListener)`: ahí Spring entrega el listener al contenedor. Ejecuta el mismo test focalizado de 4.1.

Para comprobar «Mantener el estado local con callbacks reales», observa el código de este tema. Desde el código de este tema repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Al entrar B, A recibe revocación; ambos reciben callbacks de asignación con la distribución final.

**Fallo deliberado:** En una copia, elimina `asignadas.removeAll(partitions)` y repite la prueba. **Diagnóstico:** el conjunto de A conserva la partición revocada y la suma temporal/final de asignaciones deja de coincidir con las dos particiones reales.

**3. Entiende**

El callback actualiza conocimiento local; no cambia la propiedad en el broker. La asignación del broker es la autoridad. En aplicaciones reales, usa la revocación para guardar progreso o limpiar estado que dependa de esas particiones.

**4. Cierra**

Di qué debe limpiarse en `onPartitionsRevoked` y qué error aparece si la instancia conserva una partición que ya perdió.

#### Subtema 5.3 · Ver el rebalanceo al entrar el segundo consumer · 15 min

**1. Contexto**

Un rebalanceo redistribuye asignaciones cuando cambia el grupo o su suscripción. No significa siempre que todas las particiones se quiten y vuelvan a asignarse: el alcance depende del protocolo de grupo y del asignador. La prueba usa dos particiones y consumers dinámicos para observar una redistribución concreta.

**2. Hazlo tú**

Lee `unSegundoConsumidorProvocaRebalanceoYActualizaAsignaciones` en el mismo archivo. El test crea un tópico único, espera la asignación inicial de A, arranca B y comprueba callback de revocación y una partición final por instancia.

```bash
./mvnw -Dtest=EnvioEventPublisherTest#unSegundoConsumidorProvocaRebalanceoYActualizaAsignaciones test
```

Para comprobar «Ver el rebalanceo al entrar el segundo consumer», observa el código de este tema. Desde el código de este tema repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** El broker procesa el nuevo miembro, A recibe una revocación y al estabilizarse el grupo la asignación es una partición para A y una para B. Es una prueba de integración con Kafka embebido, no una medición de pausas, latencia o disponibilidad de producción.

**Fallo deliberado:** En una copia, elimina la limpieza de particiones revocadas o cambia la aserción a esperar dos particiones en A después del rebalanceo. **Diagnóstico:** la prueba falla porque el estado local o la expectativa ya no coincide con la asignación final.

**3. Entiende**

El rebalanceo puede pausar consumo mientras se estabiliza el grupo, y su impacto depende del tamaño del grupo, el protocolo, el asignador y la carga de trabajo. Mide esos tiempos con métricas y pruebas de carga del despliegue; este test solo demuestra callbacks y propiedad final.

**4. Cierra**

Describe la secuencia observada: asignación inicial, entrada de B, revocación y nueva asignación.

#### Subtema 5.4 · Usar membresía estática solo para reinicios breves · 10 min

**1. Contexto**

`group.instance.id` identifica de forma estable un miembro estático. Kafka permite que una indisponibilidad transitoria no desencadene la misma respuesta inmediata que la salida de un miembro dinámico; el broker espera el timeout de sesión antes de recuperar sus particiones. No elimina rebalanceos ni debe compartirse entre dos instancias activas.

**2. Hazlo tú**

En un perfil de despliegue, revisa esta propiedad y compárala con la guía oficial de Consumer Configs:

```yaml
spring:
  kafka:
    consumer:
      properties:
        group.instance.id: rutaflow-consumer-0
```

Define un ID estable y único por réplica (por ejemplo, ordinal de StatefulSet). No uses el mismo literal fijo para todas las réplicas de un Deployment. Este laboratorio no simula reinicios ni mide el timeout; no cambies la configuración general de pruebas.

Para comprobar «Usar membresía estática solo para reinicios breves», observa el código de este tema. Desde el código de este tema repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Puedes explicar cuándo el ID reduce cambios por una interrupción corta y por qué la sesión todavía puede expirar y reasignar particiones.

**Fallo deliberado:** Escribe el mismo `group.instance.id` en dos réplicas activas en una copia de configuración. **Diagnóstico:** la identidad no es única; Kafka puede cercar una de las instancias y el despliegue deja de representar dos miembros independientes. Restaura IDs distintos.

**3. Entiende**

Membresía estática y asignación cooperativa son mecanismos diferentes: la primera conserva identidad entre reinicios; un asignador cooperativo puede reducir cuántas particiones cambian de dueño durante un rebalanceo. Ninguno sustituye idempotencia, manejo de revocaciones ni pruebas operativas.

**4. Cierra**

Anota una situación apropiada para membresía estática, el costo de un timeout más largo y una señal que vigilarías en producción.

**Transferencia al proyecto integrador:** ejecuta el test con dos consumers y explica quién es dueño de cada partición tras el rebalanceo. Para producción, verifica unicidad de `group.instance.id`, duración del rebalanceo, mensajes repetidos y limpieza de recursos por partición.

**Fuentes oficiales:** [Rebalance listeners en Spring Kafka 4.0](https://docs.spring.io/spring-kafka/reference/4.0/kafka/receiving-messages/rebalance-listeners.html), [configuración de consumidores Apache Kafka 4.2](https://kafka.apache.org/42/generated/consumer_config.html) y [protocolo de rebalanceo Apache Kafka 4.3](https://kafka.apache.org/43/operations/consumer-rebalance-protocol/).

### Tema 6: Kafka Streams con Spring para transformar eventos · Avanzado · 45 min

**Duración estimada:** 50 min.
**Resultado:** filtras eventos, conservas su clave, agregas por ventana y ejecutas la topología con Spring.
**¿Por qué es importante?** Una salida de prueba en memoria no comprueba despliegue ni restauración de estado en un clúster.
**Laboratorio:**. Requiere Java 25.

#### Subtema 6.1 · Filtrar sin cambiar la clave del pedido · 10 min

**1. Contexto**

KStream procesa registros nuevos de un tópico. La key es el ID del pedido y el value su estado; solo DESPACHADO debe salir.

**2. Hazlo tú**

Abre src/main/java/academia/rutaflow/streams/PedidosTopology.java:

```text
KStream<String, String> input = builder.stream(
        INPUT, Consumed.with(Serdes.String(), Serdes.String()));
KStream<String, String> dispatched = input
        .filter((pedidoId, estado) -> "DESPACHADO".equals(estado));
dispatched.to(OUTPUT, Produced.with(Serdes.String(), Serdes.String()));
```

```bash
./mvnw -Dtest=PedidosTopologyTest#filtraEstadosYConservaLaClaveEnLaSalida test
```

**Resultado esperado:** PENDIENTE no aparece; DESPACHADO conserva key y value.

**Fallo deliberado:** En una copia, cambia el filtro para aceptar PENDIENTE. **Diagnóstico:** La prueba falla porque recibe el registro que esperaba descartar.

**3. Entiende**

filter descarta registros que no cumplen el predicado; no cambia el registro que pasa ni sustituye su key.

**4. Cierra**

Di cuál es la key, cuál el value y qué estado permite la salida.

#### Subtema 6.2 · Contar por estado dentro de una ventana · 15 min

**1. Contexto**

Una agregación necesita una clave de agrupación y estado local. Aquí los despachos se agrupan por estado en ventanas de un minuto con diez segundos de gracia.

**2. Hazlo tú**

En PedidosTopology.pedidosDespachados localiza:

```text
dispatched
        .groupBy((pedidoId, estado) -> estado,
                Grouped.with(Serdes.String(), Serdes.String()))
        .windowedBy(TimeWindows.ofSizeAndGrace(
                Duration.ofMinutes(1), Duration.ofSeconds(10)))
        .count(Materialized.as("conteo-despachados-por-minuto"))
```

Ejecuta el test con timestamps controlados:

```bash
./mvnw -Dtest=PedidosTopologyTest#actualizaConteoPorVentanaConTiempoControlado test
```

Para comprobar «Contar por estado dentro de una ventana», observa el código de este tema. Desde el código de este tema repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Dos despachos en la misma ventana producen conteos 1 y 2 para DESPACHADO.

**Fallo deliberado:** En una copia, agrupa por pedidoId en vez de estado. **Diagnóstico:** El test deja de observar el segundo valor 2 porque cada pedido queda en su propio grupo.

**3. Entiende**

El resultado de una agregación es estado actualizado, no una lista de eventos originales. Kafka Streams guarda el store y usa un changelog para reconstruirlo; este test no prueba recuperación de un broker real.

**4. Cierra**

Explica qué representa la key del conteo y qué cambiarías para medir otra ventana.

#### Subtema 6.3 · Probar la topología sin confundirla con el clúster · 10 min

**1. Contexto**

TopologyTestDriver ejecuta el grafo dentro del proceso. Acepta entradas con timestamps controlados, pero no abre conexión a Kafka ni prueba ACL, particiones, ni el arranque de Spring.

**2. Hazlo tú**

Abre src/test/java/academia/rutaflow/streams/PedidosTopologyTest.java. Comprueba que el test construye PedidosTopology, fija application.id y usa pipeInput. Ejecuta:

```bash
./mvnw clean test
```

**Resultado esperado:** Pasan dos pruebas: filtro/key y conteo por ventana. La suite no comprueba que los tópicos existan en el broker.

**Fallo deliberado:** Anota ACL, particiones y creación de tópicos como requisitos que el test driver no verifica. **Diagnóstico:** Explica cómo comprobarías cada uno con el broker real.

**3. Entiende**

El test rápido valida lógica determinista; la topología necesita además una prueba con el clúster y las políticas que operará.

**4. Cierra**

Enumera qué verifica TopologyTestDriver y dos cosas que requieren Kafka real.

#### Subtema 6.4 · Configurar Spring y el application.id · 15 min

**1. Contexto**

Spring crea y administra la topología cuando kafka-streams está en el classpath y se activa EnableKafkaStreams. application.id identifica la aplicación y su grupo lógico.

**2. Hazlo tú**

Compara la anotación EnableKafkaStreams en PedidosTopology.java, la dependencia kafka-streams en pom.xml y spring.kafka.streams.application-id en src/main/resources/application.yml. El README del laboratorio incluye comandos para levantar Kafka, crear tópicos, publicar tres registros y observar las salidas.

```bash
./mvnw spring-boot:run
```

**Resultado esperado:** Con Kafka disponible, la aplicación procesa pedidos y publica los valores filtrados y el conteo. Si el broker no está disponible, el arranque no prueba integración.

**Fallo deliberado:** En una copia cambia el nombre del tópico INPUT pero publica al nombre anterior. **Diagnóstico:** No llega salida; compara el nombre configurado y el destino de entrada.

**3. Entiende**

application.id, bootstrap servers, SerDes y estado local son decisiones de operación. En producción define particiones, permisos, retención de changelogs y almacenamiento local.

**4. Cierra**

Enumera los tópicos visibles y explica por qué una aplicación aislada necesita un application.id propio.

**Fuentes oficiales:** [Kafka Streams en Spring Boot 4.1](https://docs.spring.io/spring-boot/4.1/reference/messaging/kafka.html), [integración Kafka Streams de Spring Kafka](https://docs.spring.io/spring-kafka/reference/streams.html), [DSL Kafka Streams 4.2](https://kafka.apache.org/42/documentation/streams/developer-guide/dsl-api/) y [TopologyTestDriver](https://kafka.apache.org/42/streams/developer-guide/testing/).

**Transferencia al proyecto integrador:** conserva una key estable por pedido, separa evento original de proyección agregada y registra application.id, SerDes, tópicos internos y política de estado.

**Aplicación y decisión:** Límite del test driver: observa registros y estado con tiempo controlado, sin broker, rebalanceo o ACL. Usa el conteo por ventana en el proyecto integrador solo después de definir tiempo de evento, retención y política para llegadas tardías.

### Tema 7: Avro y Schema Registry para contratos de eventos · Avanzado · 45 min

**Duración estimada:** 50 min.
**Resultado:** lees datos Avro con un esquema escritor y otro lector, pruebas una evolución y compruebas compatibilidad en Schema Registry.
**¿Por qué es importante?** Un cambio de campos puede romper consumidores que siguen leyendo eventos creados con una versión anterior.
**Laboratorio:**. Para Registry real se requiere Docker.

#### Subtema 7.1 · Definir el evento en un archivo Avro · 10 min

**1. Contexto**

Avro describe el nombre del record y sus campos en un esquema. Los bytes Avro no incluyen nombres de campos: para leerlos se necesita el esquema que los escribió.

**2. Hazlo tú**

Abre src/main/avro/PedidoDespachado-v1.avsc:

```json
{
  "type": "record",
  "name": "PedidoDespachado",
  "namespace": "academia.eventos",
  "fields": [
    {"name": "pedidoId", "type": "string"},
    {"name": "estado", "type": "string"}
  ]
}
```

Ejecuta la prueba que escribe con v1 y lee con v2:

```bash
./mvnw -Dtest=PedidoSchemaEvolutionTest#lectorV2RellenaElCampoAusenteConSuDefault test
```

**Resultado esperado:** Se conservan pedidoId y estado; el campo nuevo se completa con null según el esquema lector.

**Fallo deliberado:** Cambia en una copia el nombre del record o namespace solo en el esquema lector. **Diagnóstico:** Avro no puede reconciliar los records y la prueba de lectura falla.

**3. Entiende**

El esquema no es un comentario al lado del JSON: determina cómo interpretar el dato binario y resolver campos del escritor frente al lector.

**4. Cierra**

Identifica el namespace, nombre y campos del evento v1.

#### Subtema 7.2 · Añadir un campo compatible con registros anteriores · 15 min

**1. Contexto**

Al desplegar productores por etapas, algunos eventos antiguos no contienen los campos nuevos. Un default del lector permite completar un campo ausente durante la resolución.

**2. Hazlo tú**

Compara src/main/avro/PedidoDespachado-v1.avsc con v2:

```json
{"name": "zonaEntrega", "type": ["null", "string"], "default": null}
```

Ejecuta la prueba:

```bash
./mvnw -Dtest=PedidoSchemaEvolutionTest#lectorV2RellenaElCampoAusenteConSuDefault test
```

Luego ejecuta el caso que muestra qué pasa cuando el lector exige el campo sin default:

```bash
./mvnw -Dtest=PedidoSchemaEvolutionTest#lectorNoPuedeExigirUnCampoQueNoExisteEnElRegistroAntiguo test
```

**Resultado esperado:** v2 lee el registro escrito por v1 y usa zonaEntrega=null. El esquema incompatible produce AvroTypeException en lectura.

**Fallo deliberado:** En una copia quita default y deja zonaEntrega como string requerido. **Diagnóstico:** La primera prueba deja de poder leer el registro viejo. Restaura v2 nullable con default null.

**3. Entiende**

Avro usa el default del esquema lector cuando el escritor no tenía ese campo. En este ejemplo se usa `["null", "string"]` y default `null`. En Avro 1.12 el default debe corresponder a un miembro de la unión; no es una regla universal que ese miembro deba ser el primero. Revisa también qué admiten las herramientas de los consumidores. El default ayuda a leer; no hace que el campo desaparezca de registros escritos con v2.

**4. Cierra**

Explica qué esquema escribió el dato, cuál lo leyó y de dónde salió null.

#### Subtema 7.3 · Serializar usando un Registry de prueba en memoria · 10 min

**1. Contexto**

El serializer de Confluent registra o recupera el esquema y escribe un identificador junto al payload Avro. El deserializer usa ese identificador para encontrar el esquema escritor. El test de este laboratorio usa un Registry simulado en memoria.

**2. Hazlo tú**

Abre src/test/java/academia/rutaflow/avro/SchemaRegistrySerdeTest.java. Localiza schema.registry.url con mock://, KafkaAvroSerializer y KafkaAvroDeserializer. Ejecuta:

```bash
./mvnw -Dtest=SchemaRegistrySerdeTest test
```

**Resultado esperado:** El serializer y deserializer recuperan pedidoId y estado, y el payload usa el encabezado de wire format de Confluent.

**Fallo deliberado:** En una copia usa URLs mock distintas para serializer y deserializer. **Diagnóstico:** el deserializer no encuentra el esquema registrado y falla. Restaura el mismo scope.

**3. Entiende**

El mock prueba la biblioteca de serde y el encuadre del payload, pero no prueba HTTP, almacenamiento en _schemas ni compatibilidad configurada en un Schema Registry desplegado.

**4. Cierra**

Nombra qué identificador incluye el wire format y qué servicio resuelve ese ID al leer.

#### Subtema 7.4 · Registrar versiones y consultar compatibilidad real · 15 min

**1. Contexto**

Schema Registry guarda versiones por subject y aplica el nivel de compatibilidad configurado para ese subject o el valor global. Un test con MockSchemaRegistry no prueba esas políticas del servidor.

**2. Hazlo tú**

Desde el código de este tema sigue README.md para iniciar el overlay de Schema Registry local y preparar los archivos JSON para la API. Configura el subject pedidos-value como BACKWARD, registra v1, consulta v2 con el endpoint de compatibilidad, regístralo y consulta el esquema incompatible. No publiques la variante incompatible.

```bash
docker compose -f ../spring-kafka-rutaflow/compose.yaml -f compose.registry.yaml up -d
curl http://localhost:18081/config
```

**Resultado esperado:** v2 con zonaEntrega nullable/default se informa compatible; el campo string requerido sin default se informa incompatible. El README separa la verificación REST del test de serde mock.

**Fallo deliberado:** Envía el payload v2 como esquema v1 o consulta otro subject. **Diagnóstico:** compatibilidad se evalúa por subject y contra la versión configurada; verifica pedidos-value y el cuerpo enviado.

**3. Entiende**

La respuesta de compatibilidad no certifica que todos los consumidores tengan código correcto. También prueba lectura cruzada con datos viejos y valida la integración de los serializadores con el Registry real.

**4. Cierra**

Entrega las versiones v1/v2, respuesta de compatibilidad y el resultado local de lectura Avro.

**Fuentes oficiales:** [especificación Avro 1.12: defaults y resolución lector/escritor](https://avro.apache.org/docs/1.12.0/specification/), [API de Schema Registry](https://docs.confluent.io/platform/current/schema-registry/develop/api.html), [evolución y compatibilidad](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html), [Avro SerDe de Confluent](https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/serdes-avro.html) y [compatibilidad Kafka/Confluent 7.9](https://docs.confluent.io/platform/7.9/installation/versions-interoperability.html).

**Transferencia al proyecto integrador:** versiona el.avsc con el código, acuerda subject y compatibilidad con los consumidores, ejecuta lectura cruzada y registra la respuesta de Registry antes de desplegar un productor nuevo.

**Aplicación y decisión:** En el proyecto integrador, versiona el esquema del evento antes de desplegar un productor nuevo y prueba lectura de datos antiguos. Separa el test de resolución Avro del Registry HTTP real; aprobar el primero no acredita compatibilidad configurada por subject.

## Capstone del módulo — Eventos con Spring Kafka

**Cuándo no usar Kafka:** si el servicio necesita una respuesta inmediata de una única llamada interna, empieza con HTTP. Kafka añade retención, grupos, offsets y operación.

**Fuentes oficiales:** [Spring Boot Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html), [Spring Kafka: errores y dead-letter](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html), [Apache Kafka](https://kafka.apache.org/documentation/).
