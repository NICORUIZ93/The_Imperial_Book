# Módulo 18: Autenticación y backend seguro con Spring Security

## Aprende construyendo

El resultado será una API Spring Boot que autentica requests con un proveedor OAuth 2.0/OIDC, autoriza por scope/rol y valida entradas. No se implementa una firma JWT artesanal: el laboratorio usa Spring Security Resource Server para validar tokens emitidos por un issuer de confianza.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** `/health` es público; `/api/envios` requiere identidad y `/api/admin/tarifas` exige autoridad admin. Prueba los resultados 200, 401 y 403 con MockMvc.
- **Caso RutaFlow:** dos usuarios del mismo rol consultan `/api/envios/{id}`. Solo el propietario o un permiso explícito del tenant puede ver ese envío; agrega pruebas para dueño, otro usuario, token expirado y solicitud sin credencial.

El rol permite entrar a una clase de operación; la comprobación de propiedad autoriza el objeto concreto. El caso aplicado no se considera listo solo porque el token tenga firma válida.

### Tema 1: SecurityFilterChain y autorización

#### Paso 1 · Objetivo y preparación

Al finalizar podrás proteger endpoints, distinguir 401 de 403 y probar reglas con MockMvc. Genera una app con `web`, `security`, `oauth2-resource-server` y `validation`; utiliza JDK 25+ y Maven.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Un operador autenticado puede consultar envíos, pero solo un rol de administración puede cambiar reglas de tarifas. Autenticación y autorización son decisiones diferentes.

**¿Por qué es importante?** Una política explícita de denegación por defecto evita que un endpoint nuevo quede público por accidente.

#### Paso 3 · Teoría y modelo mental

`SecurityFilterChain` declara cómo procesar requests. Un bearer token válido identifica claims; las reglas convierten claims en autoridades. 401 indica que falta o no es válida la autenticación; 403 significa que se autenticó, pero no tiene permiso.

Un JWT firmado no es necesariamente secreto. El resource server verifica emisor, firma, expiración y audiencia según la configuración; nunca aceptes un token solo por decodificar su payload.
**Analogía:** la `SecurityFilterChain` es el control de acceso de un edificio: una fila de puestos por los que pasa toda visita antes de entrar. La autenticación es el guardia que verifica quién eres; la autorización es la tarjeta que decide a qué pisos te deja subir el ascensor.
#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/seguridad/SeguridadConfig.java` con el contenido de este tema.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/main/java/academia/seguridad/SeguridadConfig.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.


En `src/main/java/academia/seguridad/SeguridadConfig.java`:

```java
@Configuration
@EnableMethodSecurity
public class SeguridadConfig {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
            .build();
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


En `src/main/resources/application.yml`, configura `spring.security.oauth2.resourceserver.jwt.issuer-uri: ${OIDC_ISSUER_URI}`. Agrega `/api/envios` y `/api/admin/tarifas`; no guardes tokens reales en el repositorio. En un test con MockMvc puedes fijar authorities sin depender del issuer:

```java
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

mockMvc.perform(get("/api/admin/tarifas")
        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
    .andExpect(status().isOk());
```

Prueba además `.with(jwt())` sin autoridad admin (403) y una petición sin `jwt()` (401). Ejecuta `./mvnw test`.

**Resultado esperado:** público 200; request sin credencial 401; usuario autenticado en ruta admin 403; autoridad necesaria 200. **Fallo deliberado:** cambia la regla general a `.anyRequest().permitAll()` y confirma que los tests de seguridad fallan; restaura denegación por defecto.

#### Paso 5 · Práctica guiada

Añade `@PreAuthorize` a una operación de negocio. Escribe pruebas para cada rol y revisa el mapeo claim→authority del issuer real. No dupliques en controller y servicio reglas incompatibles.
**Pista:** anota con `@PreAuthorize("hasRole('ADMIN')")` un método de servicio y llámalo en un test con `jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))`; si el método se ejecuta igual, revisa que `@EnableMethodSecurity` esté presente en la configuración y que el prefijo de la autoridad coincida con el que realmente mapeas desde el claim del issuer.
#### Paso 6 · Práctica independiente

Protege `GET /api/envios/{id}` comprobando también que el recurso pertenece al usuario o tenant. Un rol general no autoriza automáticamente cualquier objeto. Diseña tests para owner, otro usuario y operador.

#### Paso 7 · Cierre

Entrega configuración, matriz de permisos y tests para 401/403/permitido como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no deshabilites CSRF en una app que autentica con cookies solo porque es HTTP; en APIs stateless con bearer explícito la decisión es distinta. CORS no es autenticación.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** cambiar la regla general a `.anyRequest().permitAll()` "para probar más rápido" y olvidar restaurar la denegación por defecto, y duplicar la misma regla de autorización en `@PreAuthorize` del controller y en `SecurityFilterChain`, terminando con dos políticas que se contradicen.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
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
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/envios/CrearEnvioRequest.java` con el contenido de este tema.
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

#### Paso 7 · Cierre

En el proyecto integrador de RutaFlow, estos controles protegen creación de envíos y llamadas a proveedores de geocodificación. **Cuándo no usarlo:** no agregues retry a escrituras sin idempotency key; no uses validación de URL basada solo en regex.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** quitar `@Valid` del parámetro del controlador "para simplificar" y dejar que una entrada inválida llegue al servicio, y configurar CORS con origen `*` junto con credenciales habilitadas, algo que el navegador rechaza y que además expondría la API a cualquier origen.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).