# HTTP Interface, deadline y descubrimiento · RutaFlow

Ejemplo ejecutable con Spring Boot 4.1.2, Java 25 y Spring Cloud 2025.1.4.
`RouteClient` declara el contrato HTTP con `@HttpExchange`; Spring crea el
proxy sobre un `RestClient` con balanceo de carga y un timeout de conexión y
lectura. `SimpleDiscoveryClient` resuelve el nombre lógico `route-catalog`.

## Ejecutar

```bash
./mvnw -q clean test
```

Las pruebas levantan un servidor HTTP local real en un puerto libre. Una llamada
normal atraviesa el cliente declarativo y la resolución de servicio; otra espera
900 ms y confirma que el timeout de lectura interrumpe la espera antes de 750 ms.
No se necesita Docker, registro externo ni conexión de red.

## Sigue la llamada

1. `src/main/java/academia/rutaflow/http/RouteClient.java` describe
   `GET /routes/{id}`.
2. `RouteClientConfiguration.java` asigna `http://route-catalog` y los timeouts
   de conexión (300 ms) y lectura (350 ms).
3. `src/main/resources/application.yml` asocia `route-catalog` con la URI local
   predeterminada. El perfil `produccion` obtiene la URI del entorno mediante
   `RUTAFLOW_CATALOG_URL`.
4. `RouteClientDeadlineTest.java` arranca un backend HTTP, inyecta su URI en
   `SimpleDiscoveryClient` y mide el caso lento con `System.nanoTime()`.

## Fallo deliberado

En `RouteClientConfiguration.java`, elimina temporalmente `.withTimeouts(...)`
y vuelve a correr `./mvnw -q -Dtest=RouteClientDeadlineTest test`. La prueba del
caso lento debe fallar porque ya no se lanza `ResourceAccessException` antes
del límite esperado. Restaura la configuración después.

Los tiempos son valores didácticos para el backend local. Un timeout de lectura
no es automáticamente un deadline extremo a extremo: el tiempo total puede
incluir conexión, colas, reintentos y varias llamadas; coordina esos límites
con el presupuesto de latencia del producto.

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
