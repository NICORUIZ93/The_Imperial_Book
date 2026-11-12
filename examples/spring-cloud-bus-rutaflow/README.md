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
Si `podman compose` crea un volumen anónimo con permisos incompatibles y el log
indica `Error when reading /var/lib/rabbitmq/.erlang.cookie: eacces`, retira solo
los recursos de este laboratorio (`podman compose down -v`) y arranca un broker
efímero sin ese volumen:

```bash
podman run --rm -d --name rutaflow-bus-rabbit \
  --tmpfs /var/lib/rabbitmq:rw,size=256m \
  -p 5672:5672 -p 15672:15672 rabbitmq:4-management
podman exec rutaflow-bus-rabbit rabbitmq-diagnostics -q ping
```

Espera `Ping succeeded` antes de iniciar las aplicaciones. Al finalizar, usa
`podman stop rutaflow-bus-rabbit`. El almacenamiento de este broker es temporal;
no conserva mensajes tras detenerlo.

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
Con Gradle puedes iniciar las mismas fuentes con `./gradlew bootRun
--args='--server.port=8081'` y cambiar a `8082` en la segunda terminal.

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
Si `/actuator/busenv` responde 500 y el log muestra `Connection refused`,
comprueba primero el estado de RabbitMQ y el puerto 5672; el endpoint no puede
difundir el cambio sin broker. Esta comprobación se ejecutó con dos procesos:
ambos pasaron de `{"maxPedidos":3}` a `{"maxPedidos":9}`.

El ejemplo expone endpoints de operación sin autenticación solo para localhost.
No copies esta exposición a producción: limita red, autenticación, autorización,
trazas de cambios y valores aceptados. `busrefresh` vuelve a cargar beans con
`@RefreshScope` desde su fuente de configuración; `busenv` inyecta un cambio
operacional temporal. Ninguno convierte el cambio en una configuración duradera.

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
