# Token Relay · Gateway RutaFlow

Este gateway inicia el login OIDC con Keycloak y reenvía el access token de la
sesión a la API Spring Security que ya corre en `localhost:8080`. Usa Spring
Boot 4.1.2, Spring Cloud 2025.1.4, WebFlux/Netty y
`spring-boot-starter-oauth2-client`.

## Recorrido local

1. Sigue `examples/spring-security-keycloak-rutaflow/README.md` para iniciar el
   realm local e importar el cliente `rutaflow-gateway`.
2. Inicia la API protegida en `localhost:8080`; para el pedido de Ana, configúrala
   con el `sub` que devuelve su token.
3. Desde esta carpeta ejecuta:

   ```bash
   ./mvnw spring-boot:run
   ```

4. Abre `http://localhost:8082/api/pedidos/p-ana` en el navegador e inicia sesión
   como Ana. El backend responde `Pedido p-ana para <sub>`.
5. Cambia la ruta para pedir `/api/pedidos/p-luis`. El gateway puede reenviar el
   token, pero el backend devuelve `403` porque el pedido pertenece a Luis.

En `src/main/resources/application.yml`, `TokenRelay=` toma el access token de
la sesión OIDC del usuario y lo incluye en la solicitud que el gateway reenvía.
La API sigue validando firma, issuer y autorización del recurso. Si quitas el
filtro, el backend recibe la llamada sin bearer token y responde `401`.

Esta ruta de login requiere navegador, Keycloak y la API levantada; no se incluye
como prueba automatizada en este proyecto. La documentación oficial confirma
que TokenRelay requiere el starter OAuth2 Client y que su almacén por defecto
es en memoria. Para varias instancias del gateway, configura almacenamiento
compartido de clientes autorizados.

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
