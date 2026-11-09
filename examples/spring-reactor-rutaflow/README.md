# Spring Reactor: Mono, Flux y demanda

Laboratorio de conceptos Reactor con Spring Boot 4.1.2 y Java 25. No necesita broker, base de datos ni servidor externo.

Desde esta carpeta ejecuta:

    ./mvnw clean test

`StepVerifier` se suscribe al publisher y comprueba valor, orden, finalización, error y demanda. Las pruebas usan publishers en memoria: validan el contrato de Reactor, no una consulta real a R2DBC ni el comportamiento HTTP de WebFlux.

Para comprobar demanda y `limitRate` sin levantar el servidor:

```bash
./mvnw -q -Dtest=BackpressureDemandTest test
```

`doOnRequest` registra las solicitudes vistas en ese punto del flujo. La prueba
de `limitRate(4, 0)` ve grupos solicitados al origen; otra posición del operador
puede observar la demanda desde el lado del suscriptor y producir otro patrón.

Para repetir solo un caso:

    ./mvnw -Dtest=MonoFluxTest#monoEntregaCeroOUnaGuia test
    ./mvnw -Dtest=MonoFluxTest#errorEsUnaSenalDistintaDeCompletarVacio test
    ./mvnw -Dtest=MonoFluxTest#deferEjecutaElCalculoUnaVezPorSuscripcion test
    ./mvnw -Dtest=MonoFluxTest#fluxRespetaLaDemandaYEmiteEnOrden test

En el curso, `demo-reactive` conecta estos tipos con `ReactiveCrudRepository`. Este laboratorio aislado facilita observar cada señal sin agregar persistencia ni latencia artificial.
