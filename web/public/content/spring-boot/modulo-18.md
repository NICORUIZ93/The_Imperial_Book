# Módulo 18: Autenticación y backend seguro con Spring Security

## Aprende construyendo

El resultado será una API Spring Boot que autentica requests con un proveedor OAuth 2.0/OIDC, autoriza por scope/rol y valida entradas. No se implementa una firma JWT artesanal: el laboratorio usa Spring Security Resource Server para validar tokens emitidos por un issuer de confianza.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** `/health` es público; `/api/envios` requiere identidad y `/api/admin/tarifas` exige autoridad admin. Prueba los resultados 200, 401 y 403 con MockMvc.
- **Caso RutaFlow:** dos usuarios del mismo rol consultan `/api/envios/{id}`. Solo el propietario o un permiso explícito del tenant puede ver ese envío; agrega pruebas para dueño, otro usuario, token expirado y solicitud sin credencial.

El rol permite entrar a una clase de operación; la comprobación de propiedad autoriza el objeto concreto. El caso aplicado no se considera listo solo porque el token tenga firma válida.

### Tema 1: SecurityFilterChain y autorización

**Meta:** crear reglas de acceso explícitas, convertir roles del JWT en authorities de Spring y comprobar que el rol general no sustituye la autorización sobre el pedido concreto.

**¿Por qué es importante?** Una firma válida solo demuestra quién emitió el token. Todavía hay que decidir qué acción puede hacer la persona y sobre qué recurso.

**Evidencia final:** pruebas HTTP para token ausente, token sin rol, escritura permitida y lectura de pedido propio frente a pedido ajeno.

#### Subtema 18.1 · Define qué rutas acepta el filtro · 8 min

**Contexto:** cuando aparece un endpoint nuevo, no debe quedar accesible por accidente. El laboratorio da acceso solo a las rutas que nombra y niega las demás.

**Hazlo tú:** abre `examples/spring-security-keycloak-rutaflow/src/main/java/academia/rutaflow/security/ApiSecurity.java`. Observa las reglas:

```java
.requestMatchers(HttpMethod.POST, "/api/ubicaciones/**")
    .hasAuthority("ROLE_location:write")
.requestMatchers(HttpMethod.GET, "/api/pedidos/**").authenticated()
.anyRequest().denyAll()
```

Desde `examples/spring-security-keycloak-rutaflow`, ejecuta la prueba sin token:

```bash
./mvnw -Dtest=ApiSecurityTest#sinBearerTokenRecibe401 test
```

**Resultado esperado:** `GET /api/pedidos/p-ana` devuelve 401 si no presentas bearer token.

**Fallo deliberado:** cambia temporalmente el patrón GET de `"/api/pedidos/**"` a `"/api/pedidos-falsos/**"` y ejecuta `./mvnw -Dtest=ApiSecurityTest#tokenSoloLeePedidosDeSuSubject test`. **Diagnóstico:** la ruta propia cae en `denyAll` y Ana recibe 403 en vez de 200. Restaura el patrón.

**Entiende:** `SecurityFilterChain` hace pasar la petición por las reglas configuradas. `anyRequest().denyAll()` niega rutas que no se declararon; no agrega una ruta pública.

**Cierra:** di qué regla protege GET y qué regla niega una ruta no descrita.

#### Subtema 18.2 · Traduce un rol del JWT a una autoridad · 8 min

**Contexto:** Keycloak pone los roles del realm dentro de `realm_access.roles`; Spring Security necesita saber cómo convertirlos a authorities para que `hasAuthority` pueda compararlos.

**Hazlo tú:** revisa `realmRoleAuthorities()` en `examples/spring-security-keycloak-rutaflow/src/main/java/academia/rutaflow/security/ApiSecurity.java`. Sigue el prefijo `ROLE_` y ejecuta la prueba:

```bash
./mvnw -Dtest=ApiSecurityTest#rolDeEscrituraPermiteGuardarUbicacion test
```

**Resultado esperado:** el token de prueba de Ana incluye `location:write`, se convierte a `ROLE_location:write` y el POST devuelve 200.

**Fallo deliberado:** cambia el prefijo `ROLE_` por `SCOPE_`. **Diagnóstico:** la authority ya no coincide con `hasAuthority("ROLE_location:write")` y el POST de Ana recibe 403. Restaura `ROLE_`.

**Entiende:** `JwtAuthenticationConverter` convierte claims en permisos que consume Spring. Los nombres y prefijos deben coincidir exactamente entre conversor y regla.

**Cierra:** escribe la transformación del claim hasta el texto que verifica `hasAuthority`.

#### Subtema 18.3 · Distingue identidad de permiso · 8 min

**Contexto:** una persona puede estar identificada correctamente y aun así no tener permiso para una acción.

**Hazlo tú:** desde `examples/spring-security-keycloak-rutaflow`, compara los dos tests de `ApiSecurityTest.java`:

```bash
./mvnw -Dtest=ApiSecurityTest#sinBearerTokenRecibe401+tokenSinRolDeEscrituraRecibe403 test
```

**Resultado esperado:** la petición sin token da 401; el token válido de Luis, que carece de `location:write`, da 403. Ana, con el rol correcto, puede pasar el filtro.

**Fallo deliberado:** cambia `hasAuthority("ROLE_location:write")` por `hasAuthority("ROLE_admin")` y ejecuta `rolDeEscrituraPermiteGuardarUbicacion`. **Diagnóstico:** el token sí autentica a Ana, pero no contiene `ROLE_admin`, así que el test recibe 403. Restaura la regla.

**Entiende:** 401 significa que la petición no tiene autenticación válida; 403 significa que se identificó al usuario y la política le negó la acción. No trates los dos resultados como sinónimos.

**Cierra:** explica cuál de las dos respuestas corresponde a token ausente y cuál a rol insuficiente.

#### Subtema 18.4 · Autoriza el pedido que pertenece a la persona · 10 min

**Contexto:** un rol puede permitir consultar pedidos, pero no revela si la persona puede consultar cualquier pedido. La propiedad del recurso es una comprobación separada.

**Hazlo tú:** abre `examples/spring-security-keycloak-rutaflow/src/main/java/academia/rutaflow/security/RutaflowApiController.java` y sigue `jwt.getSubject()` hasta `PedidoOwnership.requireOwner`. Ejecuta:

```bash
./mvnw -Dtest=ApiSecurityTest#tokenSoloLeePedidosDeSuSubject test
```

**Resultado esperado:** Ana recibe 200 para `p-ana` y 403 para `p-luis`; ambos pedidos requieren una identidad válida.

**Fallo deliberado:** comenta `pedidoOwnership.requireOwner(jwt.getSubject(), id)`. **Diagnóstico:** la prueba deja de recibir 403 al solicitar el pedido ajeno. Restaura la verificación de propietario.

**Entiende:** el filtro decide si la identidad puede entrar a la operación; el servicio de dominio decide si esa identidad puede ver ese pedido específico. Un rol general no reemplaza esa comprobación.

**Cierra:** en el proyecto integrador de RutaFlow, prueba dueño, otra persona y recurso inexistente. Anota qué autoridad permite entrar y qué dato del dominio demuestra la propiedad.

Las pruebas anteriores usan un `JwtDecoder` simulado: comprueban reglas y ownership, no la firma ni la expiración del token. Para probar el issuer real, el laboratorio incluye Keycloak y su realm local; sigue `examples/spring-security-keycloak-rutaflow/README.md` y ejecuta el recorrido con Docker.

**Fuentes primarias:** [Spring Security: autorización de peticiones HTTP](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html); [Spring Security: Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html).
### Tema 2: DTO validation, CORS, JWT/OIDC y clientes HTTP

#### Paso 1 · Objetivo y preparación

Al finalizar podrás rechazar datos inválidos antes de ejecutar lógica de negocio y configurar de forma deliberada los límites de una API.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Una solicitud de envío contiene peso negativo y una dirección excesivamente larga. Si se persiste sin validar, el problema se propaga al cálculo y al proceso de entrega.

**¿Por qué es importante?** Validar y limitar la entrada en el borde de la API reduce errores de dominio y superficie de ataque antes de tocar persistencia o servicios externos.

#### Paso 3 · Teoría y modelo mental

Bean Validation declara restricciones de entrada (`@NotBlank`, `@Positive`, `@Size`) y `@Valid` activa su evaluación. DTOs protegen el contrato HTTP de cambios internos de las entidades. CORS controla qué orígenes web pueden leer respuestas desde un navegador; no bloquea clientes no-browser. CSRF importa cuando el navegador adjunta credenciales automáticamente, especialmente cookies.

OAuth 2.0 y OIDC deben delegar emisión/rotación de credenciales a un proveedor confiable. `HttpClient` saliente necesita timeout, allowlist y protección SSRF; no sigas redirecciones arbitrarias a destinos internos.
**Analogía:** validar el DTO es revisar el formulario de aduana antes de dejar pasar la mercancía; CORS es la lista de países desde los que se aceptan envíos; el JWT/OIDC es el pasaporte sellado que acredita al viajero; y el cliente HTTP es el mensajero que lleva y trae esos paquetes entre oficinas.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/main/java/academia/envios/CrearEnvioRequest.java` dentro.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```


En `src/main/java/academia/envios/CrearEnvioRequest.java`:

```java
public record CrearEnvioRequest(
    @NotBlank @Size(max = 80) String referencia,
    @Positive BigDecimal pesoKg
) {}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


El controlador recibe `@Valid @RequestBody CrearEnvioRequest request`. Ejecuta `./mvnw test` con `MockMvc`: una referencia válida crea 201; peso negativo devuelve 400 con cuerpo de error estable. Configura CORS con origen exacto de desarrollo, no `*` combinado con credenciales.

**Resultado esperado:** los datos inválidos se rechazan antes de invocar el servicio. **Fallo deliberado:** quita `@Valid`; verifica que una entrada inválida alcanza al controlador/servicio. Restaura la validación y comprueba 400.

#### Paso 5 · Práctica guiada

Implementa cliente HTTP de servicio a servicio con timeout y host allowlisted. Trata 4xx como fallo funcional, 5xx como potencialmente transitorio y reintenta solo operación idempotente. Añade una prueba de intento de acceder a `169.254.169.254`; debe ser bloqueado por política de red y aplicación.
**Pista:** apunta el cliente HTTP directamente a `http://169.254.169.254/` en el test y ejecútalo; si la petición sale sin que tu allowlist de hosts la rechace, el control de SSRF no está aplicado en el código del cliente — debe bloquear el destino antes de abrir la conexión, no solo estar documentado como riesgo.
#### Paso 6 · Práctica independiente

Entrega una API con Problem Details para errores, validación de campos, límites de payload configurados y CORS específico. Escribe tabla con riesgo, control y prueba para token expirado, payload inválido, usuario ajeno, SSRF y repetición de request.

#### Paso 7 · Cierre y evidencia

En el proyecto integrador de RutaFlow, estos controles protegen creación de envíos y llamadas a proveedores de geocodificación. **Cuándo no usarlo:** no agregues retry a escrituras sin idempotency key; no uses validación de URL basada solo en regex. **Evidencia:** tests de validación, autorización, timeout y rechazo de destino no permitido. Referencia: [Spring Security Reference](https://docs.spring.io/spring-security/reference/).
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** quitar `@Valid` del parámetro del controlador "para simplificar" y dejar que una entrada inválida llegue al servicio, y configurar CORS con origen `*` junto con credenciales habilitadas, algo que el navegador rechaza y que además expondría la API a cualquier origen.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
**Evidencia de aprendizaje:** entrega la salida de `./mvnw test` con el caso de peso negativo devolviendo 400, el fallo observado al quitar `@Valid` (la entrada inválida llega al servicio), y el resultado de la prueba que bloquea el acceso a `169.254.169.254` desde el cliente HTTP.
