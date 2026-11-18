# Laboratorio Kafka Streams de RutaFlow

Requiere Java 25 y Maven Wrapper. La topología Spring lee `pedidos`, publica solo estados `DESPACHADO` en `pedidos-despachados` y mantiene un conteo por ventana de un minuto.

## Comprobar la topología sin broker

Desde este directorio:

```bash
./mvnw clean test
```

`TopologyTestDriver` comprueba filtro, key, salida y conteos usando tiempo controlado. Estas pruebas no conectan a Kafka, no comprueban permisos/tópicos del clúster y no miden restauración de estado entre reinicios.

## Conectar a Kafka local

Si Docker está disponible, usa el broker Kafka del laboratorio vecino:

```bash
docker compose -f ../spring-kafka-rutaflow/compose.yaml up -d
./mvnw spring-boot:run
```

En otra terminal, desde esta carpeta, crea los tres tópicos en el broker local:

```bash
docker compose -f ../spring-kafka-rutaflow/compose.yaml exec -T kafka /opt/kafka/bin/kafka-topics.sh --create --if-not-exists --topic pedidos --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker compose -f ../spring-kafka-rutaflow/compose.yaml exec -T kafka /opt/kafka/bin/kafka-topics.sh --create --if-not-exists --topic pedidos-despachados --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker compose -f ../spring-kafka-rutaflow/compose.yaml exec -T kafka /opt/kafka/bin/kafka-topics.sh --create --if-not-exists --topic conteos-despachados-por-minuto --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

Publica tres valores con key:

```bash
docker compose -f ../spring-kafka-rutaflow/compose.yaml exec -T kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic pedidos --property parse.key=true --property key.separator=:
```

Escribe `pedido-7:DESPACHADO`, `pedido-8:PENDIENTE` y `pedido-9:DESPACHADO`, cada uno en una línea. En otras terminales observa las salidas:

```bash
docker compose -f ../spring-kafka-rutaflow/compose.yaml exec -T kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic pedidos-despachados --from-beginning --property print.key=true --property key.separator=:
docker compose -f ../spring-kafka-rutaflow/compose.yaml exec -T kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic conteos-despachados-por-minuto --from-beginning --property print.key=true --property key.separator=:
```

Solo deben salir los dos pedidos despachados; el conteo sube dentro de la ventana.

La app usa `spring.kafka.streams.application-id=rutaflow-pedidos-streams-v1`; cambia ese ID para una nueva aplicación lógica o para un ejercicio aislado. No limpies el estado ni reutilices un ID de producción para experimentar.

El conteo usa store `conteo-despachados-por-minuto` y ventana de un minuto con 10 segundos de gracia. Los tópicos internos de estado requieren configuración de retención y replicación apropiada en producción; este broker local de un nodo solo sirve para aprendizaje.

## Alternativa Gradle

Desde esta misma carpeta, con JDK 25:

```bash
./gradlew clean classes test
```

Usa las mismas fuentes y pruebas del laboratorio. Consulta la [guía del curso](../../docs/SPRING-BOOT-GRADLE.md)
para perfiles, filtros de tests, procesadores y tareas especiales. Los resultados
JUnit de Gradle están en `build/test-results/`; una compilación sin tests no
acredita el escenario de integración. Los scripts que llaman a `mvnw` siguen
usando Maven y su carpeta `target/`.
