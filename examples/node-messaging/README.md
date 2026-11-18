# Laboratorio Node, Kafka y RabbitMQ

Requiere Node.js 24+ y Docker Compose. `npm ci` fija las versiones del cliente Kafka y `amqplib`.

## Kafka

Desde la raíz del repositorio, inicia el broker KRaft incluido en el laboratorio Spring:

```bash
docker compose -f examples/spring-kafka-rutaflow/compose.yaml up -d
docker compose -f examples/spring-kafka-rutaflow/compose.yaml exec kafka /opt/kafka/bin/kafka-topics.sh --create --if-not-exists --topic pedidos --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
cd examples/node-messaging
npm ci
npm run kafka:consumer
```

En otra terminal ejecuta `npm run kafka:producer`. El consumidor imprime clave, partición y offset. Pulsa Ctrl+C para cerrar el consumidor.

## RabbitMQ

Desde `examples/node-messaging/`:

```bash
npm ci
docker compose -f compose.rabbit.yaml up -d --wait
npm run rabbit:worker
```

En otra terminal ejecuta `npm run rabbit:producer`. Abre `http://localhost:15672` con usuario y contraseña `guest` para observar `envios` y `envios.dlq`. El productor espera la confirmación del broker; el worker usa ack manual y `prefetch(5)`.

## Pruebas locales

`npm test` prueba el código independiente del broker. El laboratorio necesita Docker para validar el flujo real con Kafka/RabbitMQ. El `Set` del worker solo ilustra duplicados durante una ejecución: reemplázalo con una tabla inbox persistente y clave única antes de usarlo en producción.
