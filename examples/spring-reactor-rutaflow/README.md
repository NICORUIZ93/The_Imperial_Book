# Spring Reactor: Mono, Flux y demanda

Laboratorio de conceptos Reactor con Spring Boot 4.1.2 y Java 25. No necesita broker, base de datos ni servidor externo.

Desde esta carpeta ejecuta:

    ./mvnw clean test

`StepVerifier` se suscribe al publisher y comprueba valor, orden, finalización, error y demanda. Las pruebas usan publishers en memoria: validan el contrato de Reactor, no una consulta real a R2DBC ni el comportamiento HTTP de WebFlux.

Para repetir solo un caso:

    ./mvnw -Dtest=MonoFluxTest#monoEntregaCeroOUnaGuia test
    ./mvnw -Dtest=MonoFluxTest#errorEsUnaSenalDistintaDeCompletarVacio test
    ./mvnw -Dtest=MonoFluxTest#deferEjecutaElCalculoUnaVezPorSuscripcion test
    ./mvnw -Dtest=MonoFluxTest#fluxRespetaLaDemandaYEmiteEnOrden test

En el curso, `demo-reactive` conecta estos tipos con `ReactiveCrudRepository`. Este laboratorio aislado facilita observar cada señal sin agregar persistencia ni latencia artificial.
