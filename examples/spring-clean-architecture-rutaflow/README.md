# Clean Architecture y DDD con Spring Boot

Una petición HTTP llega al adaptador web, pasa por el caso de uso, cruza el
puerto `DeliveryRepository` y termina en un adaptador en memoria. El agregado
`Delivery` protege la regla de que solo se puede asignar un destino una vez.
El dominio no importa Spring ni conoce el almacenamiento.

## Ejecutar pruebas y aplicación

Desde esta carpeta:

```bash
./mvnw -q test
./mvnw -q spring-boot:run
```

Prueba manual del endpoint:

```bash
curl -i -X POST http://localhost:8080/api/deliveries/D-17/assignment \
  -H 'Content-Type: application/json' \
  -d '{"destination":"Bogotá"}'
```

El primer envío devuelve `201` con estado `ASSIGNED`; repetir el mismo ID
devuelve `409`. Las pruebas de aplicación usan un repositorio falso sin iniciar
Spring. Las pruebas HTTP levantan el contexto y comprueban la ruta completa.

## Recorrido por archivos

- `domain/Delivery.java`: estado e invariante del agregado.
- `application/AssignDelivery.java`: caso de uso.
- `application/DeliveryRepository.java`: puerto requerido por el caso de uso.
- `infrastructure/InMemoryDeliveryRepository.java`: adaptador reemplazable.
- `web/DeliveryController.java`: traduce HTTP a la llamada de aplicación.

El repositorio en memoria se vacía al reiniciar; no hay JPA, seguridad ni
persistencia. Las capas muestran una dirección de dependencias y un corte
vertical mínimo, no certifican por sí solas que todo el diseño sea bueno.
