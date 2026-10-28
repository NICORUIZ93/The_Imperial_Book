# Módulo 4: Spring Security

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria, verificado con `MockMvc` real contra un contexto de Spring real, para que cada código de estado HTTP (200/401/403) sea comprobable, no solo descrito.


## Aprende construyendo

### Tema 1: SecurityFilterChain moderno

#### Paso 1 · Objetivo y preparación

Al finalizar podrás declarar un `SecurityFilterChain` como `@Bean` que permite rutas públicas y exige autenticación en el resto, y confirmar con `MockMvc` real los códigos 200 y 401 correspondientes.

**Conocimiento previo:** Spring Initializr y starters (Módulo 1); `@RestController` básico (Módulo 1).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Clientes, conductores y operadores consultan rutas distintas de una API de entregas; un endpoint de salud (`/public/health`) debe responder sin credencial para que un balanceador de carga lo consulte, mientras las rutas de negocio (`/api/**`) deben exigir identidad — confundir esta frontera expone datos y operaciones críticas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** configuración declarativa vía `@Bean`, reglas de autorización por ruta.

La configuración moderna de Spring Security (reemplazando el patrón anterior basado en extender `WebSecurityConfigurerAdapter`, ahora deprecado) declara la cadena de filtros directamente como un `@Bean`: `http.authorizeHttpRequests(auth -> auth.requestMatchers("/public/**").permitAll().anyRequest().authenticated())` configura de forma fluida qué rutas requieren autenticación y cuáles están explícitamente permitidas sin ella. Este enfoque basado en `@Bean` refleja la migración general de Spring hacia composición explícita mediante beans en vez de herencia de clases base configurables.

**Analogía:** el `SecurityFilterChain` es como una lista de control de acceso a la entrada de un edificio: especifica explícitamente qué áreas son de acceso público sin credencial, y cuáles requieren verificación de identidad antes de permitir el paso.

**Diagrama:**

```mermaid
flowchart LR
  A[petición entrante] --> B{"¿coincide con /public/**?"}
  B -->|sí| C[permitAll: 200 sin autenticación]
  B -->|no| D{"¿autenticada?"}
  D -->|sí| E[200: acceso concedido]
  D -->|no| F[401: no autenticado]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-spring`, o créala con `mkdir -p academia-spring` si es tu primera vez), genera el proyecto con Spring Initializr real (`web`, `security`) y crea `src/main/java/com/academia/seguridad/SecurityConfig.java` junto con un controlador mínimo:

```bash
mkdir -p academia-spring
cd academia-spring
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,security -d javaVersion=25 -d artifactId=academia-security -o app.zip
unzip -o app.zip
mkdir -p src/main/java/com/academia/seguridad
```

```java
// src/main/java/com/academia/seguridad/SecurityConfig.java
package com.academia.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // API stateless: sin sesiones basadas en cookies
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated())
            .httpBasic(httpBasic -> {}) // autenticación básica real para este tema; JWT llega en el Tema 2
            .build();
    }
}
```

```java
// src/main/java/com/academia/seguridad/RutasController.java
package com.academia.seguridad;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RutasController {

    @GetMapping("/public/health")
    public String salud() { return "OK"; }

    @GetMapping("/api/entregas")
    public String entregas() { return "entregas confidenciales"; }
}
```

**Explicación línea por línea:** `requestMatchers("/public/**").permitAll()` declara explícitamente qué rutas no requieren autenticación; `anyRequest().authenticated()` exige identidad para cualquier otra ruta no listada; `httpBasic(...)` habilita autenticación básica real (usuario/contraseña) como mecanismo concreto de este tema, reemplazado por el filtro JWT en el Tema 2.

Confirma con `MockMvc` real (levanta el contexto de seguridad completo, sin mockear la cadena de filtros) que `/public/health` responde sin credencial y `/api/entregas` exige autenticación:

```java
// src/test/java/com/academia/seguridad/SecurityFilterChainTest.java
package com.academia.seguridad;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rutaPublicaRespondeSinCredencial() throws Exception {
        mockMvc.perform(get("/public/health")).andExpect(status().isOk());
    }

    @Test
    void rutaProtegidaExigeAutenticacion() throws Exception {
        mockMvc.perform(get("/api/entregas")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void rutaProtegidaRespondeConUsuarioAutenticado() throws Exception {
        mockMvc.perform(get("/api/entregas")).andExpect(status().isOk());
    }
}
```

```bash
mvn test -Dtest=SecurityFilterChainTest           # Maven
./gradlew test --tests SecurityFilterChainTest    # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con los 3 tests en verde: `/public/health` responde `200` sin credencial, `/api/entregas` responde `401` sin autenticar, y responde `200` cuando `@WithMockUser` simula un usuario autenticado real dentro del contexto de seguridad.

**Fallo deliberado:** cambia `.anyRequest().authenticated()` por `.anyRequest().permitAll()` (permitiendo todo por error) y ejecuta de nuevo `mvn test -Dtest=SecurityFilterChainTest`. El test `rutaProtegidaExigeAutenticacion` FALLA con `expected: 401 but was: 200` — diagnostica confirmando con evidencia real, no una revisión visual del código, que esa única línea es la frontera completa entre una API protegida y una completamente abierta. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una segunda ruta pública (`/public/version`) y confirma con un test real que responde `200` sin credencial.
2. Cambia `/api/entregas` a `/api/entregas/**` y agrega un sub-recurso (`/api/entregas/1/detalle`) confirmando que también exige autenticación por estar bajo el mismo patrón.
3. Elimina temporalmente `requestMatchers("/public/**").permitAll()` por completo y confirma que ahora incluso `/public/health` responde `401` — deduce por qué el orden y la presencia explícita de cada regla importan.
4. Escribe de memoria (sin mirar) un `SecurityFilterChain` con una ruta pública y el resto autenticado, y un test que confirme ambos códigos.

**Pista:** las reglas de `authorizeHttpRequests` se evalúan en orden; una regla más específica debe declararse antes que una más general que la cubriría primero.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para que el resto de rutas exija autenticación:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/public/**").permitAll()
    .anyRequest().____())
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `SecurityFilterChain` con una ruta pública y el resto protegido, y un test `MockMvc` que confirme `200` y `401` respectivamente. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya declaras una frontera de seguridad explícita entre rutas públicas y protegidas, confirmada con `MockMvc` real contra el contexto de seguridad completo. El siguiente tema reemplaza la autenticación básica por un filtro JWT real. **Evidencia:** entrega el resultado de los 3 tests en verde, y el resultado del fallo deliberado mostrando `401` esperado vs `200` obtenido. Fuente oficial: [Spring Security — Authorize HTTP requests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html).

**Errores comunes:** usar `anyRequest().permitAll()` por error durante desarrollo y olvidar revertirlo; no probar explícitamente el caso sin autenticación, asumiendo que la configuración es correcta sin confirmarlo.

**Cuándo no usarlo:** para un prototipo interno de un solo desarrollador sin ningún dato sensible expuesto, una configuración de seguridad completa puede posponerse; sigue siendo buena práctica no exponerlo públicamente sin protección antes de manejar datos reales.

El `SecurityFilterChain` que configures aquí protege cada endpoint del proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 2: Filtro JWT y autorización por rol

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar un filtro que valida un JWT real en cada petición, y proteger un endpoint con `@PreAuthorize` según el rol contenido en ese token.

**Conocimiento previo:** Tema 1 de este módulo (SecurityFilterChain).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una API stateless (sin sesiones en el servidor) necesita identificar al usuario en cada petición sin mantener estado; un JWT firmado transporta esa identidad de forma verificable sin que el servidor necesite recordar nada entre peticiones, y el rol contenido en él determina qué operaciones puede realizar.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** validación de token en cada request, `SecurityContextHolder`, `@PreAuthorize`.

Un filtro que extiende `OncePerRequestFilter` (garantizando que se ejecute exactamente una vez por petición) extrae el token JWT del header `Authorization`, lo valida criptográficamente, y si es válido establece la identidad autenticada en el `SecurityContextHolder` — el mecanismo central que el resto de Spring Security consulta para saber quién es el usuario actual. `@PreAuthorize("hasRole('ADMIN')")` sobre un método de controller verifica, antes de ejecutarlo, que el usuario autenticado tenga el rol requerido, devolviendo `403` automáticamente si no lo tiene.

**Analogía:** el filtro JWT es un control de identidad en la entrada que verifica las credenciales de cada visitante y le entrega una etiqueta visible con su identidad verificada; `@PreAuthorize` es un letrero en la puerta de una sala específica que solo permite el paso a visitantes con cierta etiqueta, rechazando automáticamente a cualquiera sin ella.

**Diagrama:**

```mermaid
flowchart LR
  A["Authorization: Bearer <token>"] --> B[JwtFilter extrae y valida el token]
  B -->|válido| C[SecurityContextHolder: identidad establecida]
  B -->|inválido/ausente| D[SecurityContextHolder vacío -> 401 en ruta protegida]
  C --> E["@PreAuthorize verifica el rol -> 200 o 403"]
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez), agrega la dependencia real `io.jsonwebtoken:jjwt-api` (más `jjwt-impl` y `jjwt-jackson` en runtime) y crea `src/main/java/com/academia/seguridad/JwtService.java`:

```bash
mkdir -p academia-spring/src/main/java/com/academia/seguridad
cd academia-spring
```

```java
// src/main/java/com/academia/seguridad/JwtService.java
package com.academia.seguridad;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey clave = Keys.hmacShaKeyFor("clave-de-prueba-academia-floci-32-bytes-min".getBytes());

    public String generar(String usuario, String rol) {
        return Jwts.builder()
            .subject(usuario)
            .claim("rol", rol)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3_600_000))
            .signWith(clave)
            .compact();
    }

    public io.jsonwebtoken.Claims validar(String token) {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }
}
```

```java
// src/main/java/com/academia/seguridad/JwtFilter.java
package com.academia.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) { this.jwtService = jwtService; }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws jakarta.servlet.ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                var claims = jwtService.validar(header.substring(7));
                String rol = claims.get("rol", String.class);
                var auth = new UsernamePasswordAuthenticationToken(
                    claims.getSubject(), null, List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception tokenInvalido) {
                // token presente pero inválido: se deja sin autenticar, la ruta protegida rechazará con 401
            }
        }
        chain.doFilter(req, res);
    }
}
```

**Explicación línea por línea:** `JwtService.generar` firma un token real con una clave HMAC, incluyendo el rol como claim personalizado; `JwtFilter.doFilterInternal` extrae el token del header `Authorization`, lo valida con la MISMA clave, y si es válido construye una identidad autenticada con el rol como `GrantedAuthority` (`ROLE_` es el prefijo que Spring Security espera para `hasRole(...)`); un token ausente o inválido simplemente deja la petición sin autenticar, delegando el rechazo a las reglas de `authorizeHttpRequests` del Tema 1.

Agrega un endpoint protegido por rol y confirma con `MockMvc` real, usando tokens generados por el propio `JwtService`, los tres escenarios: sin token, con token de rol insuficiente, y con token del rol correcto:

```java
// src/main/java/com/academia/seguridad/AdminController.java (agregar al RutasController o en archivo nuevo)
package com.academia.seguridad;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/entregas/{id}")
    public void eliminar(@PathVariable Long id) { /* elimina la entrega */ }
}
```

```java
// src/test/java/com/academia/seguridad/JwtFilterTest.java
package com.academia.seguridad;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JwtFilterTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtService jwtService;

    @Test
    void sinTokenLaRutaProtegidaResponde401() throws Exception {
        mockMvc.perform(delete("/api/entregas/1")).andExpect(status().isUnauthorized());
    }

    @Test
    void conRolInsuficienteResponde403() throws Exception {
        String token = jwtService.generar("conductor1", "DRIVER");
        mockMvc.perform(delete("/api/entregas/1").header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void conRolAdminResponde200() throws Exception {
        String token = jwtService.generar("admin1", "ADMIN");
        mockMvc.perform(delete("/api/entregas/1").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }
}
```

```bash
mvn test -Dtest=JwtFilterTest           # Maven
./gradlew test --tests JwtFilterTest    # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con los 3 tests en verde: sin token, `401`; con un token real firmado pero de rol `DRIVER`, `403` (autenticado pero sin el rol requerido); con un token real de rol `ADMIN`, `200` — los tres casos usan tokens JWT genuinamente generados y validados por `JwtService`, no simulados.

**Fallo deliberado:** en `JwtFilterTest`, genera el token con `jwtService.generar("admin1", "ADMIN")` pero fírmalo con una clave distinta modificando temporalmente `JwtService` para usar `Keys.hmacShaKeyFor("otra-clave-completamente-diferente-32-bytes".getBytes())` solo en la generación (no en la validación). Ejecuta de nuevo `conRolAdminResponde200` — el test FALLA porque `jwtService.validar(...)` lanza una excepción real de firma inválida (`SignatureException`), y el filtro deja la petición sin autenticar, resultando en `401` en vez del `200` esperado — diagnostica confirmando que un JWT no es válido por su estructura o contenido, sino por estar firmado con la clave exacta que el servidor usa para verificarlo. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo rol (`OPERATOR`) al endpoint (`hasAnyRole('ADMIN', 'OPERATOR')`) y confirma con un token de cada rol que ambos obtienen `200`.
2. Genera un token con `JwtService.generar` pero con una fecha de expiración ya pasada (modifica temporalmente `expiration` a `new Date(System.currentTimeMillis() - 1000)`) y confirma que `validar(...)` lanza una excepción real de token expirado.
3. Agrega un segundo endpoint protegido con un rol distinto y confirma que un token válido de un rol no da acceso al endpoint del otro rol.
4. Escribe de memoria (sin mirar) un filtro que extraiga un header `Authorization`, valide un JWT, y establezca la identidad en `SecurityContextHolder`. Compara después contra el patrón del Paso 4.

**Pista:** un `403` significa "autenticado pero sin permiso"; un `401` significa "no autenticado en absoluto" — si tu test espera uno y obtiene el otro, el problema está en un lugar distinto del que asumías.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para exigir el rol `ADMIN` antes de ejecutar el método:

```java
@____("hasRole('ADMIN')")
@DeleteMapping("/api/entregas/{id}")
public void eliminar(@PathVariable Long id) { }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test `MockMvc` que confirme `401` sin token, `403` con rol insuficiente, y `200` con el rol correcto, usando un `JwtService` real. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya validas identidad mediante un JWT real firmado criptográficamente, y proteges endpoints por rol con `@PreAuthorize`, confirmando los tres códigos de estado relevantes con tokens genuinamente generados. El siguiente tema aborda dos protecciones adicionales específicas del navegador: CORS y CSRF. **Evidencia:** entrega el resultado de los 3 tests de `JwtFilterTest` en verde, y el resultado del fallo deliberado mostrando el rechazo por firma inválida. Fuente oficial: [Spring Security — JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html).

**Errores comunes:** guardar el JWT completo en logs de la aplicación, exponiendo el token de sesión de un usuario si esos logs se filtran; confundir `401` (no autenticado) con `403` (autenticado pero sin permiso) al diagnosticar un fallo de acceso.

**Cuándo no usarlo:** para una aplicación con sesiones tradicionales basadas en cookies del lado del servidor (no una API stateless consumida por múltiples clientes), la autenticación por sesión de Spring Security sin JWT es más simple y apropiada.

El filtro JWT y la autorización por rol de este tema son los que protegen el proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 3: CORS y CSRF

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar CORS para restringir qué orígenes de navegador consumen la API, y explicar por qué una API stateless con JWT generalmente no necesita protección CSRF.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un frontend servido desde un dominio distinto al de la API necesita permiso explícito del navegador para consumirla (CORS); un atacante no debería poder inducir peticiones no deseadas aprovechando cookies de sesión (CSRF) — dos protecciones distintas que se confunden con frecuencia.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** origen distinto del navegador (CORS), protección específica de sesiones basadas en cookies (CSRF).

CORS controla qué orígenes (protocolo + dominio + puerto) tienen permitido, desde el navegador del usuario, realizar peticiones hacia la API desde un origen distinto: `config.setAllowedOrigins(List.of("https://miapp.com"))` restringe explícitamente qué frontends pueden consumirla desde JavaScript en el navegador — no aplica a llamadas directas entre servidores. CSRF es un ataque relevante específicamente para aplicaciones con sesiones basadas en cookies: el navegador envía automáticamente las cookies de un dominio en cualquier petición hacia él, incluso iniciada desde un sitio malicioso. Una API stateless con JWT (Tema 2) generalmente no necesita esa protección, porque el token debe incluirse explícitamente en el header `Authorization` por el código cliente — algo que un atacante no puede forzar sin conocer el token de la víctima.

**Analogía:** CORS es una lista de invitados autorizados a acceder a un recurso desde direcciones externas específicas; CSRF aprovecha que alguien lleva puesta automáticamente una credencial visible (la cookie) que cualquier lugar reconoce sin verificación adicional, mientras un JWT es una credencial que debe presentarse explícitamente cada vez.

**Diagrama:**

```
┌── navegador en https://miapp.com ──┐
│  petición hacia https://api.miapp.com  │
└──────────┬───────────────────┘
           │ CORS: ¿https://miapp.com está en allowedOrigins?
           ▼
┌── sí: header Access-Control-Allow-Origin devuelto ──┐
│  no: navegador bloquea la respuesta del lado cliente   │
└─────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez) y crea `src/main/java/com/academia/seguridad/CorsConfig.java`:

```bash
mkdir -p academia-spring/src/main/java/com/academia/seguridad
cd academia-spring
```

```java
// src/main/java/com/academia/seguridad/CorsConfig.java
package com.academia.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://demo.academia.dev"));
        config.setAllowedMethods(List.of("GET", "POST", "DELETE"));

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

Registra `.cors(cors -> {})` en el `SecurityFilterChain` del Tema 1 para que Spring Security aplique esta configuración, y confirma con `MockMvc` real, enviando el header `Origin`, la diferencia entre un origen permitido y uno no permitido:

```java
// src/test/java/com/academia/seguridad/CorsConfigTest.java
package com.academia.seguridad;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void origenPermitidoRecibeElHeaderDeAutorizacionCors() throws Exception {
        mockMvc.perform(options("/public/health")
                .header("Origin", "https://demo.academia.dev")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "https://demo.academia.dev"));
    }

    @Test
    void origenNoPermitidoNoRecibeElHeaderDeAutorizacionCors() throws Exception {
        mockMvc.perform(options("/public/health")
                .header("Origin", "https://sitio-no-autorizado.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isForbidden());
    }
}
```

```bash
mvn test -Dtest=CorsConfigTest           # Maven
./gradlew test --tests CorsConfigTest    # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con ambos tests en verde: la petición preflight (`OPTIONS`) desde el origen permitido recibe `Access-Control-Allow-Origin: https://demo.academia.dev`, mientras la misma petición desde un origen no listado es rechazada por el propio filtro CORS de Spring Security antes de llegar al controller.

**Fallo deliberado:** cambia `config.setAllowedOrigins(List.of("https://demo.academia.dev"))` por `config.setAllowedOrigins(List.of("*"))` (permitiendo cualquier origen) y ejecuta de nuevo `origenNoPermitidoNoRecibeElHeaderDeAutorizacionCors`. El test FALLA porque ahora CUALQUIER origen, incluido `https://sitio-no-autorizado.com`, recibe el header de autorización — diagnostica confirmando por qué `allowedOrigins("*")` en producción es exactamente el error que la lista explícita de orígenes existe para prevenir. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo origen permitido (por ejemplo, un entorno de staging) a `allowedOrigins` y confirma con un test que ambos orígenes reciben el header correspondiente.
2. Restringe `allowedMethods` a solo `GET` y confirma que una petición preflight con `Access-Control-Request-Method: DELETE` desde el origen permitido es rechazada de todas formas.
3. Documenta en una frase, basándote en el Paso 3, por qué reactivar CSRF (`csrf(csrf -> {})` en vez de `csrf(csrf -> csrf.disable())`) en la API JWT de este módulo no sería necesario, mientras sí lo sería si la aplicación usara sesiones basadas en cookies.
4. Escribe de memoria (sin mirar) una configuración de CORS con un único origen permitido, y un test que confirme el rechazo de un origen distinto.

**Pista:** CORS se aplica del lado del NAVEGADOR del cliente; una herramienta como `curl` o Postman, al no ser un navegador, no aplica la política del mismo origen y puede recibir respuestas que un navegador real bloquearía — por eso este Tema se verifica con `MockMvc`, que sí simula fielmente el comportamiento de preflight que un navegador ejecutaría.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para restringir CORS a un único origen específico:

```java
config.setAllowedOrigins(List.of("____"));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una configuración de `CorsConfigurationSource` con un origen permitido, y explica en una frase por qué una API JWT stateless generalmente deshabilita CSRF. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya configuras CORS para restringir qué orígenes de navegador consumen la API, y explicas por qué CSRF es una protección específica de sesiones basadas en cookies que una API JWT stateless generalmente no necesita. Esto cierra el módulo de Spring Security; el siguiente módulo aborda cómo documentar y versionar esta misma API. **Evidencia:** entrega el resultado de ambos tests de `CorsConfigTest` en verde, y el resultado del fallo deliberado mostrando el rechazo esperado convertido en aceptación indebida. Fuente oficial: [Spring — CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html).

**Errores comunes:** desactivar CSRF sin entender el tipo de transporte de sesión que la aplicación realmente usa; configurar CORS con `allowedOrigins("*")` en producción, permitiendo que cualquier sitio consuma la API desde un navegador.

**Cuándo no usarlo:** para una API consumida exclusivamente por otros servicios backend (nunca desde JavaScript en un navegador), la configuración de CORS no tiene efecto alguno — esa protección es exclusivamente relevante para peticiones iniciadas desde un navegador.

**Transferencia al proyecto integrador «Backend profesional de entregas»:** Define los orígenes permitidos del frontend y la protección de las mutaciones según el transporte de sesión. Prueba un origen ajeno y una solicitud sin protección requerida, manteniendo autorización por guía en el servidor.

### Tema 4: Protección SSRF con InetAddressFilter (Spring Boot 4.1)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar un `InetAddressFilter` (Spring Boot 4.1) que bloquee las peticiones salientes de un cliente HTTP hacia direcciones de loopback, link-local y metadatos de nube, cerrando una vulnerabilidad SSRF real en un endpoint que acepta una URL del usuario.

**Conocimiento previo:** Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un endpoint que valida webhooks o genera miniaturas de imágenes a partir de una URL que el usuario proporciona, sin restringir a qué direcciones puede conectarse el cliente HTTP del servidor, permite que un atacante le pida al propio servidor que consulte `http://169.254.169.254/latest/meta-data/iam/security-credentials/` (el endpoint de metadatos de la nube) o un servicio interno sin autenticación, filtrando credenciales o datos que nunca deberían ser accesibles desde fuera.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** Server-Side Request Forgery (SSRF), rango de direcciones bloqueadas, egress controlado, validación de URL insuficiente por sí sola.

```java
@Bean
RestClient.Builder restClientBuilder() {
    HttpClientSettings settings = HttpClientSettings.defaults()
        .withInetAddressFilter(InetAddressFilter.externalAddresses());
    return RestClient.builder()
        .requestFactory(ClientHttpRequestFactoryBuilder.jdk().build(settings));
}
```

`InetAddressFilter` (agregado en Spring Boot 4.1) intercepta la resolución DNS/IP de cada petición saliente del cliente HTTP, antes de establecer la conexión, y rechaza cualquier destino que resuelva a loopback (127.0.0.1), link-local, rangos privados (10.0.0.0/8, 192.168.0.0/16) o el rango reservado de metadatos de nube — sin depender de que el código de la aplicación valide correctamente el string de la URL, una validación que un atacante puede evadir con redirects o DNS rebinding.

**Analogía:** validar el string de una URL antes de pedirle al cliente HTTP que la visite es como revisar el nombre escrito en un sobre antes de enviarlo, sin verificar la dirección real a la que viaja el cartero; `InetAddressFilter` es el control en la puerta del cartero mismo, que rechaza la entrega sin importar qué nombre diga el sobre si la dirección real resuelve a una zona prohibida.

**Diagrama:**

```mermaid
flowchart LR
  U["URL del usuario: http://amigo.com/imagen.jpg"] --> R[Resolución DNS]
  R --> F{"InetAddressFilter: IP pública?"}
  F -->|sí| C[Conexión permitida]
  F -->|no: loopback/privada/metadata| B["Bloqueado antes de conectar"]
```

#### Paso 4 · Demostración guiada desde cero
Requisitos: JDK 25 y Maven 3.9. Copia el laboratorio independiente con BOM Spring Boot 4.1.1, cliente y pruebas:
```bash
cp -R examples/spring-ssrf ejemplo-ssrf
cd ejemplo-ssrf
mvn test          # Maven
./gradlew test    # Gradle (equivalente)
```
Crea o inspecciona `src/main/java/com/academia/SafeClient.java`:
```java
package com.academia;

import java.time.Duration;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.HttpClientSettings;
import org.springframework.boot.http.client.HttpRedirects;
import org.springframework.boot.http.client.InetAddressFilter;
import org.springframework.web.client.RestClient;

public final class SafeClient {
    private SafeClient() {}
    public static RestClient create(InetAddressFilter allowedAddresses) {
        var settings = HttpClientSettings.defaults()
            .withConnectTimeout(Duration.ofSeconds(2))
            .withReadTimeout(Duration.ofSeconds(2))
            .withRedirects(HttpRedirects.DONT_FOLLOW)
            .withInetAddressFilter(allowedAddresses);
        return RestClient.builder()
            .requestFactory(ClientHttpRequestFactoryBuilder.jdk().build(settings))
            .build();
    }
    public static RestClient externalOnly() {
        return create(InetAddressFilter.externalAddresses());
    }
}
```
`externalAddresses()` describe las direcciones permitidas; el transporte rechaza las demás. No confundir una lista de permitidos con una lista de bloqueados. La configuración desactiva redirects y acota tiempos.

En `src/test/java/com/academia/SafeClientTest.java` la prueba inicia un servidor propio en loopback y puerto efímero. Con el filtro exige directamente `FilteredHostException` con el transporte JDK elegido y cero peticiones recibidas; un segundo cliente de control permite la IP local y debe recibir 200 e incrementar el contador. No se consulta ningún servicio de metadatos real.

**Resultado esperado:** dos pruebas verdes: bloqueo real del transporte con control positivo y clasificación de IP privadas/metadatos sin conexión. Un timeout genérico no satisface la primera prueba. La aplicación que use este cliente debe clasificar la causa de error; no traduzcas toda `ResourceAccessException` como rechazo por política.

#### Paso 5 · Práctica guiada
Pista: provoca el fallo deliberado reemplazando temporalmente `externalAddresses()` por `all()` SOLO en el laboratorio. `mvn test` falla porque la solicitud local ya no lanza `FilteredHostException`. El servidor efímero recibe la petición; restaura el filtro y comprueba el test verde. No pruebes este cambio contra URLs de terceros ni metadatos reales.

#### Paso 6 · Práctica independiente
Agrega casos para IPv6 privado y redirects, manteniendo el servidor de prueba local. Configura el cliente de tu proyecto integrador a través de una clase equivalente y confirma qué clientes pasan por él. Escribe de memoria una prueba con control positivo y negativo: ambos son necesarios para distinguir bloqueo de un servidor que nunca estuvo disponible.

#### Paso 7 · Cierre y evidencia

Ya cerrás una vulnerabilidad SSRF real configurando el cliente HTTP para rechazar destinos internos y de metadatos de nube, confirmado con un test local que comprueba el rechazo y un control positivo. Esto cierra el módulo de Spring Security; el siguiente módulo aborda cómo centralizar y validar la configuración del resto de la aplicación. **Evidencia:** entrega el test `SafeClientTest` en verde bloqueando loopback, y el control positivo contra el servidor local. Fuente oficial: [Spring Boot 4.1 Release Notes — InetAddressFilter](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.1-Release-Notes).

**Errores comunes:** confiar únicamente en una validación de string de la URL contra una allowlist, vulnerable a DNS rebinding; no probar explícitamente el rango de metadatos de nube (`169.254.169.254`), uno de los destinos más valiosos para un atacante en un entorno cloud real.

**Cuándo no usarlo:** para un cliente HTTP que SOLO consume URLs fijas y conocidas en tiempo de compilación (nunca una URL proporcionada por el usuario o un tercero), el riesgo de SSRF no existe en ese flujo específico y el filtro agrega restricción sin beneficio real ahí.

---

La configuración de CORS, CSRF e InetAddressFilter de este tema es la que necesitará el frontend y los webhooks que consuma el proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida

#### Paso 1 · Objetivo y preparación

Al finalizar podrás unir las piezas de los temas anteriores en un flujo real: un endpoint `POST /api/auth/login` que verifica credenciales y devuelve un JWT firmado por el `JwtService` (Tema 2), y un endpoint protegido `GET /api/usuarios` que solo responde cuando ese token viaja en `Authorization: Bearer`, todo confirmado con `MockMvc` real.

**Conocimiento previo:** Temas 1 (SecurityFilterChain) y 2 (filtro JWT) de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En los temas anteriores generaste tokens y protegiste rutas en ejemplos separados. En el backend real de RutaFlow, el panel operativo hace login una sola vez (`POST /api/auth/login`), recibe un token y lo adjunta en cada operación posterior. Ver ese recorrido completo —credenciales → token → petición protegida— es lo que une la seguridad en un sistema que de verdad funciona, no piezas aisladas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** endpoint de login, emisión de JWT tras verificar credenciales, header `Authorization: Bearer`, flujo stateless de punta a punta.

El flujo tiene tres momentos: (1) **login** — `POST /api/auth/login` recibe email y contraseña, verifica la contraseña contra el hash guardado (como en Node M6 Tema 1; en Spring con `PasswordEncoder`), y si coincide firma un JWT con `JwtService.generar(...)` (Tema 2); (2) **el cliente guarda el token**; (3) **uso** — cada petición a una ruta protegida lleva `Authorization: Bearer <token>`, que el `JwtFilter` (Tema 2) valida y convierte en una identidad en el `SecurityContextHolder` antes de que la ruta responda.

**Analogía:** `/api/auth/login` es la recepción del edificio donde muestras tu documento una vez y recibes una tarjeta temporal; el header `Authorization: Bearer` es pasar esa tarjeta por el lector de cada puerta; el `401` es la puerta que no se abre sin tarjeta válida.

**Diagrama:**

```mermaid
sequenceDiagram
  participant C as Cliente
  participant A as API (Spring)
  C->>A: POST /api/auth/login { email, password }
  A->>A: PasswordEncoder.matches + JwtService.generar (Tema 2)
  A-->>C: 200 { token }
  C->>A: GET /api/usuarios (sin token)
  A-->>C: 401 (SecurityFilterChain, Tema 1)
  C->>A: GET /api/usuarios + Authorization: Bearer <token>
  A->>A: JwtFilter valida y puebla SecurityContextHolder (Tema 2)
  A-->>C: 200 [ usuarios ]
```

**Diagrama interactivo:** [Flujo de login con JWT: de credenciales a ruta protegida](/visuals/temas/spring-boot/modulo-4-tema-5-login-jwt.html) — secuencia explorable con los tres momentos (login, sin token, con token) y la frontera de seguridad resaltada.

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo con `mkdir -p academia-spring` si es tu primera vez). Reutiliza el `JwtService` del Tema 2 y añade un controlador de login y uno de usuarios:

```java
// src/main/java/com/academia/seguridad/AuthController.java
package com.academia.seguridad;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtService jwtService;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    // Usuario de ejemplo: la contraseña se guarda HASHEADA, nunca en texto plano.
    private final String emailValido = "ana@rutaflow.dev";
    private final String hashGuardado = encoder.encode("clave-larga-segura");

    public AuthController(JwtService jwtService) { this.jwtService = jwtService; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");
        // Respuesta idéntica ante email inexistente o contraseña incorrecta.
        if (!email.equals(emailValido) || !encoder.matches(password, hashGuardado)) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
        String token = jwtService.generar(email, "ADMIN");
        return ResponseEntity.ok(Map.of("token", token));
    }
}
```

```java
// src/main/java/com/academia/seguridad/UsuariosController.java
package com.academia.seguridad;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class UsuariosController {

    @GetMapping("/api/usuarios")
    public List<Map<String, String>> listar() {
        // Nunca se devuelve el hash de la contraseña.
        return List.of(Map.of("email", "ana@rutaflow.dev", "rol", "ADMIN"));
    }
}
```

Asegúrate de que el `SecurityFilterChain` (Tema 1) permita `/api/auth/**` sin autenticar y exija token en `/api/usuarios`:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**", "/public/**").permitAll()
    .anyRequest().authenticated())
```

Confirma el flujo completo con `MockMvc` real, encadenando login → extraer token → usarlo:

```java
// src/test/java/com/academia/seguridad/LoginFlowTest.java
package com.academia.seguridad;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LoginFlowTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void flujoCompletoLoginYRutaProtegida() throws Exception {
        // 1. Login devuelve un token
        String respuesta = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ana@rutaflow.dev\",\"password\":\"clave-larga-segura\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode token = mapper.readTree(respuesta).get("token");

        // 2. Sin token -> 401
        mockMvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());

        // 3. Con token -> 200
        mockMvc.perform(get("/api/usuarios")
                .header("Authorization", "Bearer " + token.asText()))
            .andExpect(status().isOk());
    }

    @Test
    void credencialesInvalidasResponde401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ana@rutaflow.dev\",\"password\":\"incorrecta\"}"))
            .andExpect(status().isUnauthorized());
    }
}
```

```bash
mvn test -Dtest=LoginFlowTest           # Maven
./gradlew test --tests LoginFlowTest    # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con los 2 tests en verde: el flujo completo obtiene un token en el login, recibe `401` sin él y `200` con `Authorization: Bearer`; y las credenciales incorrectas responden `401` sin emitir token. **Fallo deliberado:** cambia en `AuthController` la verificación a `encoder.matches("otra", hashGuardado)` (siempre falsa) y ejecuta `flujoCompletoLoginYRutaProtegida` — el test FALLA en el login con `401` en vez de `200`, confirmando que sin credenciales válidas no se emite token y el resto del flujo no puede continuar. Revierte el cambio.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Añade a `/api/usuarios` la anotación `@PreAuthorize("hasRole('ADMIN')")` y confirma que un token con rol `DRIVER` recibe `403` mientras el de `ADMIN` recibe `200`.
2. Devuelve también el `sub` (email) dentro de la respuesta protegida leyéndolo del `SecurityContextHolder`, y confirma que coincide con el usuario que hizo login.
3. Haz que el login responda lo mismo (`401`, mismo cuerpo) ante un email inexistente y ante una contraseña incorrecta; confirma con dos tests que ningún mensaje revela cuál de los dos falló.
4. Escribe de memoria (sin mirar) el test que encadena login → token → petición protegida.

**Pista:** extrae el token del JSON de respuesta con un `ObjectMapper`; no lo hardcodees, porque cada login genera un token distinto con una marca de tiempo nueva.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para que el login solo emita token cuando la contraseña coincide con el hash:

```java
if (!email.equals(emailValido) || !encoder.____(password, hashGuardado)) {
    return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
}
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `AuthController` con `POST /api/auth/login` que verifique credenciales y emita un JWT, más un test `MockMvc` que confirme el flujo login → `401` sin token → `200` con token. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya tienes el flujo de autenticación completo de punta a punta en Spring: `/api/auth/login` verifica credenciales y emite el JWT, y `/api/usuarios` lo exige vía `Authorization: Bearer`, confirmado con `MockMvc` real encadenando los tres pasos. Es el mismo recorrido que protege el proyecto integrador (microservicio productivo, Módulo 12). **Evidencia:** entrega los 2 tests de `LoginFlowTest` en verde y el resultado del fallo deliberado mostrando el login rechazado. Fuente oficial: [Spring Security — Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/index.html).

**Errores comunes:** devolver el hash de la contraseña en la respuesta de `/api/usuarios`; responder distinto ante email inexistente vs contraseña incorrecta (filtra qué correos existen); olvidar permitir `/api/auth/**` en el `SecurityFilterChain` (el propio login quedaría bloqueado con `401`).

**Cuándo no usarlo:** si delegás la autenticación a un proveedor externo (Keycloak/OIDC, Módulo 10), no implementas el login tú mismo: el proveedor emite el token y tu API solo lo valida como resource server.

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una API protegida con JWT y rutas con autorización por rol.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Configurar el `SecurityFilterChain` | Ver Tema 1 | `/api/**` autenticado, `/public/**` permitido |
| 2 | Implementar el filtro JWT | Ver Tema 2 | Valida el token real en cada request |
| 3 | Agregar `@PreAuthorize("hasRole('ADMIN')")` | Ver Tema 2 | Verifica el 403 real sin ese rol |
| 4 | Configurar CORS para el frontend | Ver Tema 3 | Solo el origen esperado, no `"*"` |
| 5 | Documentar cuándo CSRF es relevante | Ver Tema 3 | Y por qué se deshabilita en esta API |
| 6 | Configurar `InetAddressFilter` en el cliente HTTP | Ver Tema 4 | Bloquea SSRF hacia metadatos de nube y rangos internos |

**Verificación:** el laboratorio se considera exitoso si un usuario sin el rol requerido recibe `403` real al intentar acceder a un endpoint protegido, si el filtro JWT rechaza correctamente peticiones con un token inválido o ausente hacia rutas autenticadas, y si una petición saliente hacia la IP de metadatos de nube es bloqueada antes de conectarse, todo confirmado con `MockMvc`.

**Errores comunes y soluciones**

- **Deshabilitar CSRF en una aplicación que usa sesiones basadas en cookies.** CSRF sigue siendo relevante en ese caso; solo deshabilítalo en APIs stateless con JWT.
- **Configurar CORS con `allowedOrigins("*")` en producción.** Restringe explícitamente a los orígenes reales esperados.
- **Olvidar `OncePerRequestFilter` para el filtro JWT.** Sin él, el filtro podría ejecutarse más de una vez por petición en ciertas configuraciones de servlets anidados.
- **Confiar solo en validar el string de una URL de usuario sin `InetAddressFilter`.** Esa validación es evadible con DNS rebinding; el filtro bloquea en la capa de red real.

---
