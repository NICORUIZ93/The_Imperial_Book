# Spring Cloud Bus: propagar un valor a dos instancias

Ejemplo con Spring Boot 4.1.2, Spring Cloud 2025.1.4 y RabbitMQ. El release train
2025.1.x es compatible con Boot 4.1.x. `busenv` es una actualización en el
Environment; no reemplaza el servidor central ni guarda el valor de forma
permanente.

## 1. Inicia RabbitMQ

Desde esta carpeta, usa Docker Compose o un proveedor compatible con Compose:

```bash
docker compose up -d
```

Espera que el servicio `rabbitmq` esté saludable.

## 2. Inicia dos instancias

En dos terminales separadas, desde esta carpeta:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments='--server.port=8081'
```

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments='--server.port=8082'
```

Cada ID Bus usa el puerto, así que las instancias se distinguen. El bean usa 3
como valor por defecto; la clave no está fijada en `application.yml`, para que el
Environment pueda recibir la actualización. Comprueba `curl -s
http://localhost:8081/config` y el puerto `8082`; ambos deben devolver
`{"maxPedidos":3}`.

## 3. Propaga el cambio y comprueba las dos respuestas

```bash
./scripts/verify-bus.sh
```

El script envía `ruta.max-pedidos=9` a `/actuator/busenv` de la instancia A,
solicita `/actuator/busrefresh` y espera hasta 10 segundos a que ambas respuestas
`/config` devuelvan 9. `busenv` distribuye el cambio temporal al Environment;
`busrefresh` vacía la caché de `@RefreshScope` para reconstruir el bean. Cambia
`INSTANCE_A_URL`, `INSTANCE_B_URL` o `NEW_LIMIT` para probar otros puertos/valores.
El script espera el estado inicial `3`; para repetirlo, detén y vuelve a iniciar
ambas instancias para borrar los overrides temporales de memoria.

El ejemplo expone endpoints de operación sin autenticación solo para localhost.
No copies esta exposición a producción: limita red, autenticación, autorización,
trazas de cambios y valores aceptados. `busrefresh` vuelve a cargar beans con
`@RefreshScope` desde su fuente de configuración; `busenv` inyecta un cambio
operacional temporal. Ninguno convierte el cambio en una configuración duradera.
