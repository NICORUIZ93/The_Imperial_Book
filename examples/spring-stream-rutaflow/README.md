# Laboratorio Spring Cloud Stream de RutaFlow

La misma función transforma `ShipmentCreated` en `RoutePlanningRequested`. Un perfil la conecta a Kafka; otro, a RabbitMQ.

## Probar función y mapping sin broker

Desde este directorio, ejecuta:

```bash
./mvnw test
```

Las pruebas usan el binder en memoria. Verifican el JSON de salida, el rechazo de un código postal corto y el rechazo de la zona `XX`. No demuestran conexión a Kafka o RabbitMQ.

## Probar cada broker local

Levanta Kafka y RabbitMQ:

```bash
docker compose up -d
```

Inicia el perfil que quieras inspeccionar:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=kafka
```

En otra terminal, envía un JSON válido al tópico `shipments.created` con el productor de consola de Kafka. La aplicación publica el resultado en `routes.requested`. Para RabbitMQ, reinicia la aplicación con perfil `rabbit`, publica el JSON en el exchange `shipments.created` desde la consola `http://localhost:15672` y revisa la cola `routes.requested`. Usuario y contraseña por defecto del contenedor son `guest`/`guest` solo para este laboratorio local.

Si el código postal empieza por `XX`, la función falla de forma repetible. El perfil Kafka configura tres intentos y DLQ; el perfil Rabbit configura tres intentos y dead-letter queue. Revisa el destino de error desde la consola del broker.

## Límites de la prueba

El test binder valida mapping dentro de la aplicación. Los perfiles con broker deben probarse por separado; una suite verde del binder no demuestra que el broker esté disponible ni que la topología se creó como se esperaba.
