# Spring AMQP: routing, confirm, ack y prefetch

Laboratorio pequeño con Spring Boot 4.1.2 y Java 25. Requiere Docker para las prácticas de broker; las pruebas JUnit no necesitan RabbitMQ.

## Ejecutar pruebas locales

Desde esta carpeta:

    ./mvnw clean test

Las pruebas inspeccionan declaraciones de exchange/colas/bindings y verifican la decisión de ack/nack con un canal simulado. No prueban conexión, publisher confirms, returns, entrega real, requeue, DLQ del broker ni prefetch.

## Iniciar RabbitMQ

    docker compose up -d --wait

Management está en <http://localhost:15672> (`guest` / `guest`). La aplicación se conecta a `localhost:5672`.

Publica un mensaje válido:

    ./mvnw spring-boot:run -Dspring-boot.run.arguments="--tracking-code=RF-1200"

Publica uno inválido para observar el rechazo a la DLQ:

    ./mvnw spring-boot:run -Dspring-boot.run.arguments="--tracking-code=sin-formato"

Cada ejecución arranca un listener y publica una guía. El listener solo escribe a consola; no guarda en una base de datos. Por eso el laboratorio no demuestra idempotencia frente a redelivery ni una garantía de negocio durable.

## Observar prefetch

1. Ejecuta RabbitMQ y la app.
2. Coloca un breakpoint en `DispatchListener.receive`, en la línea anterior a `channel.basicAck`.
3. Con el consumidor detenido, publica varios mensajes desde otra terminal o vuelve a iniciar una segunda instancia productora.
4. En Management, abre `dispatch.requested` y mira `Ready`, `Unacknowledged` y el prefetch del consumidor.
5. Repite con `spring.rabbitmq.listener.simple.prefetch: 1` y compara. Vuelve a 5 al terminar.

El breakpoint solo sirve para observar el límite; no representa tiempo de procesamiento real. Para un valor de producción mide tasa de entrada, latencia, memoria, concurrencia y equidad entre consumidores.

## Detener

    docker compose down

No hay volumen persistente en este compose de práctica; detener y recrear el contenedor borra los datos locales.
