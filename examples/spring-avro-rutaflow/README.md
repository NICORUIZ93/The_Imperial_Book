# Laboratorio Avro y Schema Registry

Requiere Java 25 y Maven Wrapper. Los esquemas están en src/main/avro/: v1 contiene pedidoId y estado; v2 agrega zonaEntrega como unión que permite null y tiene default null.

## Pruebas locales, sin broker

Desde este directorio ejecuta:

    ./mvnw clean test

Las pruebas de evolución de Avro codifican con el esquema escritor v1 y leen con v2, o verifican que un lector que exige un campo ausente falla. Una tercera prueba de serde usa MockSchemaRegistry: prueba el serializer/deserializer Confluent en memoria, no una instancia remota ni Kafka.

## Compatibilidad con un Schema Registry local

Si Docker está disponible, combina el broker Kafka del laboratorio Spring con el overlay de Registry:

    docker compose -f ../spring-kafka-rutaflow/compose.yaml -f compose.registry.yaml up -d
    curl http://localhost:18081/config

Fija compatibilidad backward para el subject del valor y prepara las solicitudes JSON desde los esquemas versionados:

    curl -X PUT -H 'Content-Type: application/vnd.schemaregistry.v1+json' --data '{"compatibility":"BACKWARD"}' http://localhost:18081/config/pedidos-value

    python3 - <<'PYTHON'
    import json
    from pathlib import Path
    for version, name in [('v1', 'PedidoDespachado-v1.avsc'), ('v2', 'PedidoDespachado-v2.avsc'), ('bad', 'PedidoDespachado-incompatible.avsc')]:
        schema = Path('src/main/avro', name).read_text()
        Path(f'/tmp/pedido-{version}.json').write_text(json.dumps({'schema': schema}))
    PYTHON

Registra v1, consulta v2 antes de registrarlo y verifica que el cambio incompatible no pasa:

    curl -X POST -H 'Content-Type: application/vnd.schemaregistry.v1+json' --data-binary @/tmp/pedido-v1.json http://localhost:18081/subjects/pedidos-value/versions

    curl -X POST -H 'Content-Type: application/vnd.schemaregistry.v1+json' --data-binary @/tmp/pedido-v2.json 'http://localhost:18081/compatibility/subjects/pedidos-value/versions/latest?verbose=true'

    curl -X POST -H 'Content-Type: application/vnd.schemaregistry.v1+json' --data-binary @/tmp/pedido-v2.json http://localhost:18081/subjects/pedidos-value/versions

    curl -X POST -H 'Content-Type: application/vnd.schemaregistry.v1+json' --data-binary @/tmp/pedido-bad.json 'http://localhost:18081/compatibility/subjects/pedidos-value/versions/latest?verbose=true'

La API debe indicar compatibilidad para v2 y is_compatible: false para el campo requerido sin default. No registres el esquema incompatible durante esta práctica. El Registry guarda sus metadatos en Kafka; usa esta topología local solo para aprendizaje.

Confluent Platform 7.9 se alinea con Kafka 3.9.x; el compose existente fija Kafka 3.9.1 y el overlay Schema Registry 7.9.0. El laboratorio no publica aún eventos Avro en un tópico Kafka real: la prueba serde usa el mock y la práctica REST verifica registro/compatibilidad en el Registry.
