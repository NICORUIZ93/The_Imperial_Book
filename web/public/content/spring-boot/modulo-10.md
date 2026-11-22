# Módulo 10: Mensajería con Kafka: eventos, errores, outbox y contratos

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria, verificado contra un broker real (`@EmbeddedKafka`, sin necesitar Docker), para que "el evento se publicó y se consumió" sea comprobable, no solo descrito. El laboratorio es `spring-kafka-rutaflow`. RabbitMQ, JMS y Spring Cloud Stream siguen en el Módulo 11.

## Aprende construyendo


### Tema 1: Producers y consumers con Spring Kafka · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por producers y consumers con spring kafka con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender producers y consumers con spring kafka te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en producers y consumers con spring kafka como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que producers y consumers con spring kafka resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Producers y consumers con Spring Kafka se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Producers y consumers con Spring Kafka | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses producers y consumers con spring kafka por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: producers y consumers con spring kafka funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Producers y consumers con Spring Kafka existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve producers y consumers con spring kafka en tu contexto?
2. ¿Cómo sabrías que producers y consumers con spring kafka no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar producers y consumers con spring kafka?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
public CompletableFuture<SendResult<String, EnvioCreado>> publicar(EnvioCreado evento) {
    return kafka.send(TOPIC, evento.envioId().toString(), evento);
}
```

```java
public record EnvioCreado(
        UUID eventId, UUID envioId, int version, Instant occurredAt, String referencia) {}
```

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

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

</details>

### Tema 2: Dead-letter queue · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por dead-letter queue con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender dead-letter queue te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dead-letter queue como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que dead-letter queue resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Dead-letter queue se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Dead-letter queue | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dead-letter queue por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dead-letter queue funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dead-letter queue existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dead-letter queue en tu contexto?
2. ¿Cómo sabrías que dead-letter queue no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dead-letter queue?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
@Bean
DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> kafka) {
    var recoverer = new DeadLetterPublishingRecoverer(kafka);
    return new DefaultErrorHandler(recoverer, new FixedBackOff(100L, 2));
}
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

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

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

</details>

### Tema 3: Transacciones Kafka y SQL: idempotencia y límites de exactly-once · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por transacciones kafka y sql: idempotencia y límites de exactly-once con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender transacciones kafka y sql: idempotencia y límites de exactly-once te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en transacciones kafka y sql: idempotencia y límites de exactly-once como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que transacciones kafka y sql: idempotencia y límites de exactly-once resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Transacciones Kafka y SQL: idempotencia y límites de exactly-once se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Transacciones Kafka y SQL: idempotencia y límites de exactly-once | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses transacciones kafka y sql: idempotencia y límites de exactly-once por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: transacciones kafka y sql: idempotencia y límites de exactly-once funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Transacciones Kafka y SQL: idempotencia y límites de exactly-once existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve transacciones kafka y sql: idempotencia y límites de exactly-once en tu contexto?
2. ¿Cómo sabrías que transacciones kafka y sql: idempotencia y límites de exactly-once no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar transacciones kafka y sql: idempotencia y límites de exactly-once?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```yaml
spring:
  kafka:
    producer:
      acks: all
      properties:
        enable.idempotence: true
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

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

```bash
./mvnw -Dtest=EnvioEventPublisherTest#guardaEnvioYOutboxEnLaMismaTransaccion test
```

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

```bash
./mvnw -Dtest=EnvioEventPublisherTest#inboxHaceIdempotenteElEfectoDeNegocio test
./mvnw -Dtest=EnvioEventPublisherTest#replayTrasFallarLaMarcaDespuesDelAckConservaUnaSolaProyeccion test
```

</details>

### Tema 4: Outbox transaccional y flujo de negocio · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por outbox transaccional y flujo de negocio con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender outbox transaccional y flujo de negocio te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en outbox transaccional y flujo de negocio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que outbox transaccional y flujo de negocio resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Outbox transaccional y flujo de negocio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Outbox transaccional y flujo de negocio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses outbox transaccional y flujo de negocio por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: outbox transaccional y flujo de negocio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Outbox transaccional y flujo de negocio existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve outbox transaccional y flujo de negocio en tu contexto?
2. ¿Cómo sabrías que outbox transaccional y flujo de negocio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar outbox transaccional y flujo de negocio?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
./mvnw -Dtest=EnvioEventPublisherTest#guardaEnvioYOutboxEnLaMismaTransaccion test
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#dispatcherPublicaYMarcaSoloDespuesDelAck test
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#replayTrasAckConservaUnaSolaProyeccion test
```

</details>

### Tema 5: Rebalanceo de consumer groups y asignación de particiones · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por rebalanceo de consumer groups y asignación de particiones con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender rebalanceo de consumer groups y asignación de particiones te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rebalanceo de consumer groups y asignación de particiones como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que rebalanceo de consumer groups y asignación de particiones resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Rebalanceo de consumer groups y asignación de particiones se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Rebalanceo de consumer groups y asignación de particiones | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses rebalanceo de consumer groups y asignación de particiones por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rebalanceo de consumer groups y asignación de particiones funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Rebalanceo de consumer groups y asignación de particiones existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rebalanceo de consumer groups y asignación de particiones en tu contexto?
2. ¿Cómo sabrías que rebalanceo de consumer groups y asignación de particiones no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rebalanceo de consumer groups y asignación de particiones?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
./mvnw -Dtest=EnvioEventPublisherTest#unSegundoConsumidorProvocaRebalanceoYActualizaAsignaciones test
```

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

```bash
./mvnw -q test
```

```bash
./mvnw -Dtest=EnvioEventPublisherTest#unSegundoConsumidorProvocaRebalanceoYActualizaAsignaciones test
```

```bash
./mvnw -q test
```

```yaml
spring:
  kafka:
    consumer:
      properties:
        group.instance.id: rutaflow-consumer-0
```

</details>

### Tema 6: Kafka Streams con Spring para transformar eventos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por kafka streams con spring para transformar eventos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender kafka streams con spring para transformar eventos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en kafka streams con spring para transformar eventos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que kafka streams con spring para transformar eventos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Kafka Streams con Spring para transformar eventos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Kafka Streams con Spring para transformar eventos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses kafka streams con spring para transformar eventos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: kafka streams con spring para transformar eventos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Kafka Streams con Spring para transformar eventos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve kafka streams con spring para transformar eventos en tu contexto?
2. ¿Cómo sabrías que kafka streams con spring para transformar eventos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar kafka streams con spring para transformar eventos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```text
dispatched
        .groupBy((pedidoId, estado) -> estado,
                Grouped.with(Serdes.String(), Serdes.String()))
        .windowedBy(TimeWindows.ofSizeAndGrace(
                Duration.ofMinutes(1), Duration.ofSeconds(10)))
        .count(Materialized.as("conteo-despachados-por-minuto"))
```

```bash
./mvnw -Dtest=PedidosTopologyTest#actualizaConteoPorVentanaConTiempoControlado test
```

```bash
./mvnw -q test
```

```bash
./mvnw clean test
```

</details>

### Tema 7: Avro y Schema Registry para contratos de eventos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por avro y schema registry para contratos de eventos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender avro y schema registry para contratos de eventos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en avro y schema registry para contratos de eventos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que avro y schema registry para contratos de eventos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Avro y Schema Registry para contratos de eventos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Avro y Schema Registry para contratos de eventos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses avro y schema registry para contratos de eventos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: avro y schema registry para contratos de eventos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Avro y Schema Registry para contratos de eventos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve avro y schema registry para contratos de eventos en tu contexto?
2. ¿Cómo sabrías que avro y schema registry para contratos de eventos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar avro y schema registry para contratos de eventos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -Dtest=PedidoSchemaEvolutionTest#lectorV2RellenaElCampoAusenteConSuDefault test
```

```json
{"name": "zonaEntrega", "type": ["null", "string"], "default": null}
```

```bash
./mvnw -Dtest=PedidoSchemaEvolutionTest#lectorV2RellenaElCampoAusenteConSuDefault test
```

```bash
./mvnw -Dtest=PedidoSchemaEvolutionTest#lectorNoPuedeExigirUnCampoQueNoExisteEnElRegistroAntiguo test
```

```bash
./mvnw -Dtest=SchemaRegistrySerdeTest test
```

</details>
