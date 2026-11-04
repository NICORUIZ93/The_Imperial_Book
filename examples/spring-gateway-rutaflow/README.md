# Spring Cloud Gateway · RutaFlow

Una ruta WebFlux recibe `/api/pedidos/**`, quita el segmento `api` y reenvía la
petición a un backend HTTP local. El proyecto usa Boot 4.1.2, Java 25 y Spring
Cloud 2025.1.4.

## Ejecutar las pruebas

Desde esta carpeta:

```bash
./mvnw -q clean test
```

La prueba inicia un backend HTTP local en un puerto libre y el gateway en otro.
Comprueba el cuerpo y el path transformado `/pedidos/1`; también solicita una
ruta que no coincide y verifica que no llegue al backend. No requiere Docker,
Python ni un servicio externo.

## Ver el gateway manualmente

Terminal 1, levanta un servicio compatible en el puerto 8081. El tema ofrece un
servidor de ejemplo en Python. Luego, desde esta carpeta, terminal 2:

```bash
./mvnw spring-boot:run
```

Terminal 3:

```bash
curl -i http://localhost:8080/api/pedidos/1
```

`src/main/resources/application.yml` dirige la ruta a la dirección de
`rutaflow.backend.uri` (por defecto `http://localhost:8081`), la empareja con
`Path=/api/pedidos/**` y aplica `StripPrefix=1`.

## Fallos para diagnosticar

1. Cambia el filtro a `StripPrefix=2` y ejecuta
   `./mvnw -q -Dtest=GatewayRoutingTest#quitaApiYReenviaLaPeticionAlBackend test`.
   La prueba falla: el backend ve `/1` y su respuesta es 404.
2. Cambia el predicado a `Path=/api/entregas/**` y ejecuta
   `./mvnw -q -Dtest=GatewayRoutingTest#unaRutaQueNoCoincideNoLlegaAlBackend test`.
   La ruta de prueba ya no representa el caso esperado; restaura el predicado y
   compara también si aumentó el contador del backend.

Un 404 por sí solo no dice quién lo produjo: comprueba el path recibido y el
contador del servicio. Gateway WebFlux requiere el runtime Netty; no funciona
como aplicación Servlet/WAR. En producción, el gateway ayuda con entrada y
enrutamiento, pero el servicio conserva autorización sobre sus propios datos.
