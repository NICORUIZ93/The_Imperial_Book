# Lab M08-L02 — Circuit Breaker desde cero (Resilience4j)

## Qué se construyó
Servicio Spring Boot mínimo con `InventoryClient` protegido por `@CircuitBreaker`, fallback degradado y prueba que fuerza fallos para observar apertura del circuito.

## Prerrequisitos
- JDK 21+, Maven 3.9+.

## Cómo compilar/ejecutar tests
```bash
mvn test
```

## Output esperado
```text
BUILD SUCCESS
```
Y la prueba confirma fallback y estado OPEN/HALF_OPEN.

## Cómo verificar
```bash
./verify.sh
```

## Qué modificar para experimentar
Cambia `failureRateThreshold` en `src/main/resources/application.yml` de 50 a 90 y ajusta el test para observar que tarda más en abrirse.

## Error común
Falta `spring-boot-starter-aop`: la anotación `@CircuitBreaker` no se intercepta y el circuito no cambia de estado.
