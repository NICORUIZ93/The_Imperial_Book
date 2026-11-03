# Laboratorio Spring Kafka de RutaFlow

Este proyecto demuestra publicación JSON con `KafkaTemplate`, `envioId` como key y recepción con `@KafkaListener`. Su prueba inicia un broker Kafka embebido; no requiere Docker.

## Requisitos y ejecución

- JDK 25 (`java -version`)
- Maven Wrapper incluido (`./mvnw`)

Desde esta carpeta:

```bash
./mvnw test
```

La prueba confirma tópico, partición, offset y key; comprueba que los grupos `rutaflow-ruteo` y `rutaflow-notificaciones` reciban el mismo evento. La aplicación también se puede ejecutar contra el broker KRaft del archivo `compose.yaml` con `./mvnw spring-boot:run`.

## Alcance

El broker embebido verifica el recorrido productor-consumidor y el contrato básico. No prueba tolerancia a fallos entre Kafka y PostgreSQL, reintentos/DLT de producción ni el patrón outbox; esos ejercicios necesitan pruebas separadas y permanecen como parte posterior del laboratorio.

En este entorno la prueba termina con código 0, aunque Kafka 4.2.2 advierte que el directorio de logs temporal queda fuera de línea durante el cierre del broker embebido. El recorrido de mensajes sí fue comprobado; el cierre limpio del broker queda pendiente de corregir.
