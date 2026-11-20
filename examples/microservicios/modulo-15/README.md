# Laboratorio · Módulo 11 · Mensajería avanzada

Lección: [`web/public/content/microservices/modulo-15.md`](../../../web/public/content/microservices/modulo-15.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un proyecto Maven autónomo con el código y los tests de una ficha.

| Carpeta | Ficha | Necesita |
|---|---|---|
| `jdk/Particionador.java` | Simulador de murmur2 y RangeAssignor (F075) | solo JDK 25 |
| `f075-kafka-particiones` | Kafka profundo: particionamiento, consumer groups (3 tests) | Kafka |
| `f076-exactly-once` | Exactly-Once Semantics (2 tests) | Kafka |
| `f077-schema-registry-avro` | Schema Registry y Avro (2 tests sin infraestructura + 3 con registro) | Kafka + Schema Registry |
| `f078-dead-letter-topics` | Dead Letter Topics (1 test) | Kafka |
| `f079-rabbitmq-confirms-dlq` | RabbitMQ: publisher confirms, DLQ (4 tests) | RabbitMQ |
| `f080-nats` | NATS: core, queue groups, request-reply y JetStream (4 tests) | NATS con `-js` |

## Versiones

JDK 25 LTS · Spring Boot 4.1.3 (Spring for Apache Kafka 4.1.3, kafka-clients 4.2.2, Spring AMQP 4.1.3, JUnit
Jupiter 6.0.3; todo gestionado por el BOM) · Avro 1.12.2 · `kafka-avro-serializer` 8.4.1 (repositorio de Confluent)
· jnats 2.26.4 · imágenes `apache/kafka:4.4.0`, `confluentinc/cp-schema-registry:8.4.1`, `rabbitmq:4.4.1-management`
y `nats:2.15.3-alpine` · Maven por el wrapper (`.mvn/wrapper/maven-wrapper.properties`).

## Ejecutar

```bash
cd examples/microservicios/modulo-15
./verificar.sh              # simulador, brokers, los tests de las 6 fichas y comprobaciones con las CLI
./verificar.sh --conservar  # igual, pero deja los brokers encendidos
```

Termina con `RESULTADO: OK · Módulo 11 (Mensajería avanzada) verificado`. Si un paso falla, el guion sigue con los
demás y al final los lista con ✘. Toda la salida queda en `logs/verificar-<fecha>.log`.

A mano, ficha por ficha:

```bash
java jdk/Particionador.java                              # F075 sin Kafka
docker compose up -d --wait                              # los 4 brokers
./mvnw -pl f075-kafka-particiones test                   # F075
./mvnw -pl f076-exactly-once test                        # F076
./mvnw -pl f077-schema-registry-avro test                # F077
./mvnw -pl f078-dead-letter-topics test                  # F078
./mvnw -pl f079-rabbitmq-confirms-dlq test               # F079 · consola: http://localhost:15672 (academia/academia)
./mvnw -pl f080-nats test                                # F080 · monitoreo: http://localhost:8222/jsz?streams=true
docker compose down
```

Si los puertos 9092, 5672 o 4222 están ocupados por el laboratorio de otro módulo, haz `docker compose down` allí.

## Estado de verificación

Ver [`verificacion/microservicios/pendiente.md`](../../../verificacion/microservicios/pendiente.md): en el entorno
donde se escribió no hay Maven Central ni Docker Hub. Sí se ejecutaron el simulador (JDK 25.0.5), la comprobación de
murmur2 contra `kafka-python`, la codificación Avro con `fastavro`, la topología de F079 en RabbitMQ 3.12.1 y la de
F080 en nats-server 2.10.7.
