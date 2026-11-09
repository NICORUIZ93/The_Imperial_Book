# Laboratorio Spring Boot y Resilience4j · RutaFlow

Una API Spring Boot recibe `GET /api/pedidos/1` y consulta un backend HTTP local
a través de un `CircuitBreaker` gestionado como bean Spring. El backend de prueba
puede responder 503 o 200.

El proyecto usa Spring Boot 4.1.2, Java 21 o posterior y Resilience4j 2.4.0.
Integra el núcleo de Resilience4j directamente; no usa el starter de Spring
Cloud CircuitBreaker ni levanta un registro de servicios.

También prueba `resilience4j-bulkhead` y `resilience4j-ratelimiter`. El test del
Bulkhead ocupa sus dos espacios con tareas coordinadas por `CountDownLatch` y
comprueba que una tercera recibe `BulkheadFullException`; el test del
RateLimiter obtiene dos permisos y rechaza el tercero en el mismo período. Son
pruebas locales de las primitivas: no modelan una cuota compartida entre
réplicas ni una dependencia externa real. El Bulkhead de semáforo limita
concurrencia, pero no crea un pool separado de hilos.

## Ejecutar las pruebas

Desde esta carpeta:

```bash
./mvnw -q clean test
```

Las pruebas inician la app Spring Boot en un puerto temporal y el backend en otro
puerto libre. Comprueban cuatro 503 que abren el circuito, una quinta llamada
que devuelve 503 sin llegar al backend y dos respuestas 200 que devuelven el
estado a `CLOSED`. Las pruebas de Bulkhead y RateLimiter no abren puertos. Para
que la suite sea rápida, la prueba de CircuitBreaker fuerza
`HALF_OPEN`; no espera el temporizador de un minuto ni valida su programación.

## Archivos para inspeccionar

- `src/main/java/academia/rutaflow/resilience/CircuitBreakerConfiguration.java`:
  configura la ventana, el umbral y el estado HALF_OPEN.
- `PedidosClient.java`: envuelve la solicitud HTTP con `executeSupplier`.
- `PedidosController.java`: responde con el pedido o un 503 controlado.
- `src/test/java/academia/rutaflow/resilience/CircuitBreakerBehaviorTest.java`:
  inicia ambos procesos HTTP y cuenta las solicitudes que llegan al backend.

Las pruebas verifican comportamiento local de la aplicación y la máquina de
estados. No demuestran tolerancia a fallos de red distribuida, capacidad,
observabilidad en producción ni fallback de negocio completo.
