# WebFlux, R2DBC y aislamiento de llamadas bloqueantes

Laboratorio con Spring Boot 4.1.2, Java 25, WebFlux, `DatabaseClient` y H2 mediante R2DBC. No requiere Docker ni una base de datos externa.

Desde esta carpeta ejecuta:

    ./mvnw clean test

Pruebas de interés:

    ./mvnw -Dtest=DecisionApplicationTest#r2dbcReadsAnExistingDelivery test
    ./mvnw -Dtest=DecisionApplicationTest#blockInsideNettyEventLoopIsRejected test
    ./mvnw -Dtest=DecisionApplicationTest#unavoidableBlockingCallCanBeIsolatedOnBoundedElastic test

`/deliveries/RF-001` consulta H2 a través de `DatabaseClient`. `/demo/block` usa `Mono.delay(...).block()` y recibe 500 al intentar esperar en el event loop. `/demo/legacy` representa con una pausa corta una llamada bloqueante; el test verifica que se ejecuta en un thread `boundedElastic`.

El laboratorio verifica funcionalidad y el scheduler. No compara rendimiento de WebFlux y MVC, no valida H2 frente a un servidor SQL real y no demuestra que cualquier operación lenta será detectada por Reactor. Para elegir arquitectura, mide ambas alternativas con carga y dependencias comparables.

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
