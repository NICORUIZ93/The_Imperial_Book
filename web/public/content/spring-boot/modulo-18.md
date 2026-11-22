# Módulo 18: Autenticación y backend seguro con Spring Security

## Aprende construyendo

El resultado será una API Spring Boot que autentica requests con un proveedor OAuth 2.0/OIDC, autoriza por scope/rol y valida entradas. No se implementa una firma JWT artesanal: el laboratorio usa Spring Security Resource Server para validar tokens emitidos por un issuer de confianza.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** `/health` es público; `/api/envios` requiere identidad y `/api/admin/tarifas` exige autoridad admin. Prueba los resultados 200, 401 y 403 con MockMvc.
- **Caso RutaFlow:** dos usuarios del mismo rol consultan `/api/envios/{id}`. Solo el propietario o un permiso explícito del tenant puede ver ese envío; agrega pruebas para dueño, otro usuario, token expirado y solicitud sin credencial.

El rol permite entrar a una clase de operación; la comprobación de propiedad autoriza el objeto concreto. El caso aplicado no se considera listo solo porque el token tenga firma válida.

### Tema 1: SecurityFilterChain y autorización · Avanzado · 35 min

**Meta:** crear reglas de acceso explícitas, convertir roles del JWT en authorities de Spring y comprobar que el rol general no sustituye la autorización sobre el pedido concreto.

**¿Por qué es importante?** Una firma válida solo demuestra quién emitió el token. Todavía hay que decidir qué acción puede hacer la persona y sobre qué recurso.

**Evidencia final:** pruebas HTTP para token ausente, token sin rol, escritura permitida y lectura de pedido propio frente a pedido ajeno.

#### Subtema 1.1 · Define qué rutas acepta el filtro · 8 min

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

#### Subtema 1.2 · Traduce un rol del JWT a una autoridad · 8 min

**Contexto:** Keycloak pone los roles del realm dentro de `realm_access.roles`; Spring Security necesita saber cómo convertirlos a authorities para que `hasAuthority` pueda compararlos.

**Hazlo tú:** revisa `realmRoleAuthorities()` en `examples/spring-security-keycloak-rutaflow/src/main/java/academia/rutaflow/security/ApiSecurity.java`. Sigue el prefijo `ROLE_` y ejecuta la prueba:

```bash
./mvnw -Dtest=ApiSecurityTest#rolDeEscrituraPermiteGuardarUbicacion test
```

**Resultado esperado:** el token de prueba de Ana incluye `location:write`, se convierte a `ROLE_location:write` y el POST devuelve 200.

**Fallo deliberado:** cambia el prefijo `ROLE_` por `SCOPE_`. **Diagnóstico:** la authority ya no coincide con `hasAuthority("ROLE_location:write")` y el POST de Ana recibe 403. Restaura `ROLE_`.

**Entiende:** `JwtAuthenticationConverter` convierte claims en permisos que consume Spring. Los nombres y prefijos deben coincidir exactamente entre conversor y regla.

**Cierra:** escribe la transformación del claim hasta el texto que verifica `hasAuthority`.

#### Subtema 1.3 · Distingue identidad de permiso · 8 min

**Contexto:** una persona puede estar identificada correctamente y aun así no tener permiso para una acción.

**Hazlo tú:** desde `examples/spring-security-keycloak-rutaflow`, compara los dos tests de `ApiSecurityTest.java`:

```bash
./mvnw -Dtest=ApiSecurityTest#sinBearerTokenRecibe401+tokenSinRolDeEscrituraRecibe403 test
```

**Resultado esperado:** la petición sin token da 401; el token válido de Luis, que carece de `location:write`, da 403. Ana, con el rol correcto, puede pasar el filtro.

**Fallo deliberado:** cambia `hasAuthority("ROLE_location:write")` por `hasAuthority("ROLE_admin")` y ejecuta `rolDeEscrituraPermiteGuardarUbicacion`. **Diagnóstico:** el token sí autentica a Ana, pero no contiene `ROLE_admin`, así que el test recibe 403. Restaura la regla.

**Entiende:** 401 significa que la petición no tiene autenticación válida; 403 significa que se identificó al usuario y la política le negó la acción. No trates los dos resultados como sinónimos.

**Cierra:** explica cuál de las dos respuestas corresponde a token ausente y cuál a rol insuficiente.

#### Subtema 1.4 · Autoriza el pedido que pertenece a la persona · 10 min

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

### Tema 2: DTO validation, CORS, JWT/OIDC y clientes HTTP · Avanzado · 40 min

**Meta:** validar datos antes de guardar, limitar qué páginas web leen la API, confiar en un emisor OIDC identificado y filtrar destinos de llamadas HTTP salientes.

**¿Por qué es importante?** Cada frontera recibe datos o identidad de otra parte. Revisar solo el JWT no valida el cuerpo, CORS no autentica, y una llamada saliente también puede alcanzar servicios internos si sigue una URL sin control.

**Evidencia final:** tests de petición inválida, preflight CORS permitido/rechazado, configuración del issuer documentada y bloqueo de direcciones locales del cliente.

```mermaid
flowchart LR
  Web[Web] -->|JSON + token| API[API Spring]
  API -->|issuer + firma| IdP[Keycloak]
  API -->|URL externa filtrada| Geo[Servicio externo]
```

**Límite:** CORS decide qué páginas pueden leer respuestas desde el navegador; no valida identidad. El filtro IP limita destinos resueltos, pero no sustituye una lista de hosts permitidos.

#### Subtema 2.1 · Valida la petición en la entrada · 8 min

**Contexto:** una entrega con destinatario vacío no debe llegar al servicio ni quedar guardada en PostgreSQL.

**Hazlo tú:** abre `examples/spring-boot-integrador-rutaflow/src/main/java/academia/rutaflow/integrador/entrega/CrearEntregaRequest.java`:

```java
public record CrearEntregaRequest(@NotBlank @Size(max = 200) String destinatario) {}
```

Abre `EntregaController.java` y comprueba que el body lleva `@Valid`. Ejecuta desde `examples/spring-boot-integrador-rutaflow`:

```bash
./scripts/verify-integration.sh
```

**Resultado esperado:** pasan 7 pruebas con PostgreSQL efímero; destinatario en blanco responde 400 y el conteo de entregas no aumenta.

**Fallo deliberado:** quita `@Valid` del `@RequestBody` y repite. **Diagnóstico:** el test deja de recibir 400 y la solicitud vacía alcanza el resto del flujo. Restaura `@Valid`.

**Entiende:** las anotaciones describen qué valores son válidos; `@Valid` pide a Spring MVC comprobarlas antes de invocar el método. Si la entrada no cumple, no guardes una entidad y luego intentes corregirla.

**Cierra:** anota qué regla rechaza el destinatario y cuál test comprueba que no se persiste. Lleva el mismo contrato al proyecto integrador RutaFlow.

#### Subtema 2.2 · Configura CORS para el origen necesario · 8 min

**Contexto:** una aplicación web de desarrollo necesita leer respuestas desde `localhost:4200`; no por eso cualquier sitio debe poder leer la API.

**Hazlo tú:** abre `examples/spring-security-keycloak-rutaflow/src/main/java/academia/rutaflow/security/ApiSecurity.java`. La `CorsConfigurationSource` permite un origen, métodos y headers concretos; `ApiSecurityTest` manda una solicitud preflight:

```bash
cd examples/spring-security-keycloak-rutaflow
./mvnw -Dtest=ApiSecurityTest#corsPermiteOrigenLocalDeclaradoYRechazaOtroOrigen test
```

**Resultado esperado:** el preflight de `http://localhost:4200` recibe `Access-Control-Allow-Origin`; `https://sitio-ajeno.example` recibe 403. El header de credenciales no aparece.

**Fallo deliberado:** cambia el origen permitido a `https://sitio-ajeno.example` y ejecuta el mismo test. **Diagnóstico:** el navegador de desarrollo ya no aparece en `Access-Control-Allow-Origin`, y el test encuentra el origen equivocado. Restaura `http://localhost:4200`.

**Entiende:** CORS es una regla del navegador sobre qué origen puede leer una respuesta. No es una barrera para `curl`, no reemplaza autenticación y las solicitudes preflight deben procesarse antes de exigir credenciales.

**Cierra:** explica por qué permites un origen y mantienes `allowCredentials=false` en este laboratorio.

#### Subtema 2.3 · Confía en el issuer OIDC, no en un JWT decodificado · 10 min

**Contexto:** base64 permite leer un payload, pero no verificar quién firmó el JWT ni si sigue vigente. El Resource Server debe consultar las claves del emisor que tu aplicación decidió confiar.

**Hazlo tú:** abre `examples/spring-security-keycloak-rutaflow/src/main/resources/application.yml`. Localiza `issuer-uri`; debe coincidir exactamente con el `iss` de los tokens del realm. Para recorrer la configuración real, sigue `examples/spring-security-keycloak-rutaflow/README.md`:

```bash
cd examples/spring-security-keycloak-rutaflow
docker compose up -d
curl -fsS http://localhost:8081/realms/rutaflow/.well-known/openid-configuration
```

**Resultado esperado:** el documento OIDC publica issuer y `jwks_uri` del realm `rutaflow`. Con un token real de ese issuer, las rutas respetan rol y propietario; al terminar, apaga el servicio con `docker compose down`.

**Fallo deliberado:** cambia temporalmente `issuer-uri` a `http://localhost:8081/realms/otro` y llama con un token de `rutaflow`. **Diagnóstico:** el token no coincide con el issuer configurado y la API responde 401. Restaura la URI.

**Entiende:** `issuer-uri` señala quién emite tokens de confianza. Spring Resource Server descubre las claves públicas y valida firma, expiración e issuer. Los tests `ApiSecurityTest` usan un decoder simulado para probar permisos; por sí solos no verifican firma, expiración ni conexión con Keycloak.

**Cierra:** apunta el issuer y `jwks_uri` de la salida local y distingue esa comprobación del test con token simulado.

#### Subtema 2.4 · Bloquea destinos internos en el cliente saliente · 10 min

**Contexto:** un endpoint que recibe una URL puede ser usado para pedir datos a servicios locales, a rangos privados o al endpoint de metadata. Controla el destino antes de abrir la conexión.

**Hazlo tú:** abre `examples/spring-ssrf/src/main/java/com/academia/SafeClient.java`. Observa timeout, redirecciones deshabilitadas y `InetAddressFilter.externalAddresses()`. Ejecuta desde `examples/spring-ssrf`:

```bash
./mvnw test
```

**Resultado esperado:** pasan tres pruebas: loopback se bloquea antes de llegar al servidor local, se filtran `169.254.169.254` y rangos internos, y un redirect no alcanza su destino. Un servidor efímero permitido sirve de control positivo.

**Fallo deliberado:** quita `.withInetAddressFilter(allowedAddresses)` de `SafeClient.create` y ejecuta `blocksBeforeRequestAndControlReallyReachesServer`. **Diagnóstico:** la petición local llega al servidor y el test ve un hit en vez de `FilteredHostException`. Restaura el filtro.

**Entiende:** el filtro restringe direcciones IP de llamadas que salen de este proceso. No reemplaza una allowlist de hosts ni controles de red; no reintentes escrituras sin clave de idempotencia.

**Cierra:** para el cliente de geocodificación de RutaFlow, registra hosts permitidos, timeout, política de redirect y la prueba que impide llegar a una IP interna.

**Fuentes primarias:** [Spring Framework MVC Validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html); [CORS en Spring Security](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html); [Spring Security Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html); [Spring Boot HTTP clients y filtros de direcciones](https://docs.spring.io/spring-boot/reference/io/rest-client.html).

### Tema 3: SAML 2.0 con Spring Security: iniciar sesión con el proveedor de identidad de una empresa · Avanzado · 45 min

**Prerrequisito:** tema «DTO validation, CORS, JWT/OIDC y cliente» de este módulo.

**Al finalizar podrás:** configurar una aplicación Spring Boot como proveedor de servicio (SP) SAML 2.0, iniciar sesión contra un proveedor de identidad (IdP) de prueba y leer los atributos del usuario.

**¿Por qué es importante?** Muchas empresas grandes usan SAML para el inicio de sesión único de sus empleados. Si RutaFlow vende su panel a esas empresas, tiene que aceptar su IdP aunque el resto del sistema use OIDC.

#### Paso 1 · Objetivo y preparación

Usa Spring Boot 4.1.2 con JDK 25 en `academia-spring` (paquete `com.example.demo`) y agrega `spring-boot-starter-security-saml2`: desde Spring Boot 4.0 la autoconfiguración de SAML vive en ese starter, que incluye Spring Security y `spring-security-saml2-service-provider`. Necesitas un IdP de prueba: Keycloak en Docker (`docker run -p 8180:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak start-dev`).

Prepara Keycloak en la consola `http://localhost:8180` (usuario `admin`, contraseña `admin`):

1. Crea el realm `rutaflow`.
2. En **Clients → Create client**, elige **Client type: SAML** y escribe **Client ID** `rutaflow-panel`; debe coincidir con el `entity-id` que el SP envía como emisor. En **Valid redirect URIs** pon `http://localhost:8080/*` y en **Master SAML Processing URL** `http://localhost:8080/login/saml2/sso/empresa`.
3. En la pestaña **Keys** del cliente, desactiva **Client signature required**: en este tema la aplicación no firma sus `AuthnRequest`.
4. En **Client scopes → rutaflow-panel-dedicated**, agrega un mapper **User Property** con propiedad `email` y nombre de atributo SAML `email`.
5. En **Users**, crea `operadora1` con correo `operadora1@empresa.co` y asígnale una contraseña en **Credentials** (sin marcarla como temporal).

#### Paso 2 · Contexto y caso real

Un cliente corporativo de RutaFlow exige que sus operadores entren al panel con la cuenta de la empresa, a través de su IdP SAML. Si un empleado deja la empresa, su acceso al panel debe terminar el mismo día, sin que RutaFlow gestione contraseñas.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** SAML 2.0, proveedor de identidad (IdP), proveedor de servicio (SP), aserción firmada, metadatos, ACS (*Assertion Consumer Service*), `Saml2AuthenticatedPrincipal`.

En SAML hay dos partes:

- El **IdP** autentica al usuario y emite una **aserción**: un XML firmado que dice quién es y sus atributos (correo, grupos).
- El **SP** (tu aplicación) confía en el IdP, verifica la firma y crea la sesión.

El intercambio usa el navegador: el SP redirige al IdP, el usuario inicia sesión allá y el IdP envía la aserción por POST a la URL **ACS** del SP (`/login/saml2/sso/{registrationId}`).

Para configurarlo, el SP necesita los **metadatos** del IdP (su URL, su certificado). Spring Security los descarga de `metadata-uri`. El IdP necesita los del SP, que Spring publica en `/saml2/service-provider-metadata/{registrationId}`.

| SAML | OIDC |
|---|---|
| XML firmado, habitual en empresas | JSON y JWT, habitual en apps modernas |
| flujo por el navegador | también para APIs y móviles |

**Analogía:** la aserción SAML es una carta de recomendación sellada por la empresa: el panel no conoce al empleado, pero sí reconoce el sello. La analogía falla en que el sello caduca en minutos y la carta sirve para un solo destinatario.

**Límite de uso:** SAML no sirve para proteger APIs llamadas por apps móviles: para eso usa OIDC y tokens. Valida siempre la firma y la audiencia; nunca desactives esas verificaciones para «probar».

```mermaid
sequenceDiagram
    participant U as Navegador
    participant SP as Panel RutaFlow (SP)
    participant IdP as IdP de la empresa
    U->>SP: GET /panel
    SP-->>U: redirección con AuthnRequest
    U->>IdP: inicia sesión
    IdP-->>U: formulario con aserción firmada
    U->>SP: POST /login/saml2/sso/empresa
    SP->>SP: verifica firma y audiencia, crea sesión
```

#### Paso 4 · Demostración guiada desde cero

Archivo `academia-spring/src/main/resources/application.yml`:

```yaml
spring:
  security:
    saml2:
      relyingparty:
        registration:
          empresa:
            assertingparty:
              metadata-uri: http://localhost:8180/realms/rutaflow/protocol/saml/descriptor
            entity-id: rutaflow-panel
```

Archivo `academia-spring/src/main/java/com/example/demo/seguridad/SamlConfig.java` (dentro de `com.example.demo`, para que el escaneo lo registre):

```java
package com.example.demo.seguridad;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SamlConfig {
    @Bean
    SecurityFilterChain panel(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .saml2Login(withDefaults())   // redirige al IdP y recibe la aserción
            .saml2Metadata(withDefaults()) // publica los metadatos del SP
            .build();
    }
}
```

Archivo `academia-spring/src/main/java/com/example/demo/seguridad/YoController.java`:

```java
package com.example.demo.seguridad;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class YoController {
    @GetMapping("/yo")
    Map<String, Object> yo(@AuthenticationPrincipal Saml2AuthenticatedPrincipal usuario) {
        return Map.of(
            "nombre", usuario.getName(),
            "correo", String.valueOf(usuario.getFirstAttribute("email")),
            "idp", usuario.getRelyingPartyRegistrationId());
    }
}
```

Ejecútalo:

```bash
./mvnw spring-boot:run
curl -s localhost:8080/saml2/service-provider-metadata/empresa | head -c 300
# en el navegador: http://localhost:8080/yo  -> redirige a Keycloak -> vuelve con la sesión
```

**Explicación por bloques:** En `application.yml`, el registro `empresa` apunta a los metadatos del IdP (Keycloak) y define el `entity-id` del SP, que debe coincidir con el cliente SAML creado en Keycloak. `SamlConfig` exige autenticación, activa el inicio de sesión SAML y publica los metadatos del SP para dárselos al IdP. `YoController` recibe el usuario autenticado como `Saml2AuthenticatedPrincipal` y devuelve su nombre, su correo (un atributo de la aserción) y el IdP que lo autenticó.

**Resultado esperado:**

```text
/saml2/service-provider-metadata/empresa devuelve XML que empieza con <md:EntityDescriptor ... entityID="rutaflow-panel">.
Al abrir /yo sin sesión, el navegador va a la página de inicio de sesión de Keycloak.
Después de iniciar sesión, /yo devuelve {"nombre":"operadora1","correo":"operadora1@empresa.co","idp":"empresa"}.
```

**Fallo deliberado:** cambia `entity-id` a `rutaflow-otro` sin cambiarlo en Keycloak. **Error esperado:** Keycloak responde «Invalid requester» o Spring rechaza la aserción por audiencia inválida. **Diagnóstico:** el IdP emite la aserción para un destinatario concreto; si el SP se presenta con otro nombre, no coincide. Usa el mismo `entity-id` en los dos lados.

#### Paso 5 · Práctica guiada

1. **Reproducción:** descarga los metadatos del SP y encuentra la URL ACS.
2. **Variación:** agrega en Keycloak un mapeador que envíe el atributo `email` y comprueba que llega a `/yo`.
3. **Diagnóstico:** reproduce el fallo deliberado del `entity-id`.
4. **Integración:** convierte un atributo `grupos` en autoridades de Spring con un `ResponseAuthenticationConverter` y protege `/admin` con `hasAuthority`.
5. **Diseño:** escribe qué pasa con la sesión del panel cuando la empresa desactiva a un empleado, y cómo reducir ese tiempo.

**Pista:** casi todos los errores de SAML son de configuración: compara `entity-id`, URL ACS y certificado en los dos lados.

#### Paso 6 · Práctica independiente

Registra un segundo IdP (`empresa2`) en el mismo `application.yml` y comprueba que `/saml2/authenticate/empresa2` lleva al otro proveedor.

#### Paso 7 · Cierre

- [ ] Explicas los papeles de IdP y SP.
- [ ] Iniciaste sesión con el IdP de prueba y `/yo` muestra los atributos.
- [ ] Reprodujiste el error de audiencia.
- [ ] Sabes cuándo usar SAML y cuándo OIDC.

Si fallas dos o más, vuelve al Paso 3. **Errores comunes:** desactivar la validación de firmas, usar SAML para proteger APIs y mezclar `entity-id` entre ambientes. **Siguiente paso:** el módulo 16 integra OIDC con Keycloak y Token Relay para los servicios internos.

**Transferencia al proyecto integrador «RutaFlow»:** permite que los operadores del cliente corporativo de RutaFlow entren al panel con su IdP SAML y mapea sus grupos a roles del panel.

**Fuente oficial:** [Spring Security — SAML 2.0 Login](https://docs.spring.io/spring-security/reference/servlet/saml2/login/overview.html) y [Keycloak — SAML clients](https://www.keycloak.org/docs/latest/server_admin/#_client-saml-configuration).
