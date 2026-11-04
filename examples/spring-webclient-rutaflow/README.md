# WebClient: llamadas dependientes, errores y timeout

Laboratorio con Spring Boot 4.1.2, Java 25, WebFlux y MockWebServer 5.3.0. El servidor de prueba abre un puerto local dinámico; no se necesita acceso a APIs externas ni un broker.

Desde esta carpeta ejecuta:

    ./mvnw clean test

Los tests verifican que WebClient envía dos peticiones reales en orden, convierte un estado HTTP 503 en error reactivo y cancela una respuesta que supera el timeout. Son pruebas locales de integración HTTP; no prueban la latencia ni la disponibilidad de un proveedor remoto, ni miden carga/concurrencia de producción.

`TarifaClient` recibe `tarifa.base-url` mediante `@Value`; Spring Boot entrega el `WebClient.Builder`. Los tests pasan la URL local del MockWebServer directamente para aislarse de configuración externa.

La prueba de timeout tiene límites explícitos para no esperar indefinidamente. Si una segunda respuesta no está encolada, el dispatcher de MockWebServer puede esperar a que se agregue una respuesta; por eso la verificación StepVerifier también establece un plazo y cierra el servidor en `@AfterEach`.
