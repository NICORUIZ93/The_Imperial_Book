# GraphQL RutaFlow · contrato y ejecución local

Java 25, Boot 4.1.2. Desde esta carpeta: `./mvnw -q clean test`.
Cuatro pruebas pasan por schema, data fetchers, batching, mutation y subscription
con ExecutionGraphQlServiceTester. Ese tester no abre HTTP ni WebSocket.

Para HTTP: `./mvnw spring-boot:run` y en otra terminal:

```bash
curl -s http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{"query":"{ entrega(id: \"ENV-1\") { id estado } }"}'
```

Datos y Sinks están en memoria. No hay autenticación, base SQL ni durabilidad;
no desplegar como servicio productivo. BatchMapping cuenta una invocación para
dos padres, no consultas SQL. Emisión local no prueba entrega recuperable ni
protocolo WebSocket. El retorno de tryEmitNext no equivale a confirmación de cliente.

Fuente: https://docs.spring.io/spring-graphql/reference/testing.html
