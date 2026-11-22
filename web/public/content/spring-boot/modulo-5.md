# Módulo 5: Spring Security I: cadena, JWT con resource server, CORS y SSRF

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria, verificado con `MockMvc` real contra un contexto de Spring real, para que cada código de estado HTTP (200/401/403) sea comprobable, no solo descrito. El JWT se valida con el **resource server** de Spring Security (`oauth2ResourceServer().jwt()`), no con un filtro escrito a mano: así el mismo código sirve cuando, en el Módulo 18, los tokens los emita un proveedor de identidad.

**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo


### Tema 1: SecurityFilterChain moderno · Intermedio · 30 min

**Caso guía**: `/public/health` abierto, `/api/**` autenticado.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `SecurityFilterChain` | Cadena de filtros de seguridad configurada como bean. | Autenticación/autorización HTTP. | Configuración declarativa moderna (no `WebSecurityConfigurerAdapter`). | Config antigua/deprecada. |
| `authorizeHttpRequests` | Reglas de autorización por matcher. | Control de acceso por ruta. | Reglas específicas antes de `anyRequest()`. | `anyRequest().permitAll()` accidental. |
| 401 vs 403 | 401 no autenticado; 403 autenticado sin permiso. | Semántica de seguridad. | Probar ambos casos. | Confundirlos en tests. |
| `httpBasic`/mecanismos auth | Cómo el cliente presenta credenciales. | Autenticación. | Elegir según cliente (browser, API, JWT). | Basic para SPA pública sin contexto. |

**Implementación desde cero** (`spring-boot-starter-security` + webmvc-test)
```java
@Configuration
public class SecurityConfig {
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
      .authorizeHttpRequests(auth -> auth.requestMatchers("/public/**").permitAll().anyRequest().authenticated())
      .httpBasic(Customizer.withDefaults())
      .build();
  }
}
```
```java
@RestController
class RutasController {
  @GetMapping("/public/health") String salud(){ return "OK"; }
  @GetMapping("/api/entregas") String entregas(){ return "entregas confidenciales"; }
}
```
**Ejecución real**
```bash
./mvnw -Dtest=RutasControllerSecurityTest test
```
Test con `@SpringBootTest @AutoConfigureMockMvc`: `/public/health` 200, `/api/entregas` sin auth 401, con auth 200. **Verificación**: cambia regla y observa cambio de status.

### Tema 2: JWT con el resource server de Spring Security y autorización por rol · Intermedio · 45 min

**Caso guía**: API stateless con Bearer token; ADMIN puede DELETE, USER no.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| JWT | Token firmado con claims (`sub`, `exp`, roles). | Auth stateless. | Firmar, validar exp, validar issuer/aud según caso. | Confiar en token sin validar firma. |
| Resource Server (`oauth2ResourceServer().jwt()`) | Spring Security valida Bearer JWT. | Integración estándar. | Usar soporte nativo, no filtro artesanal. | Filtro manual que olvida validaciones. |
| `JwtDecoder`/`JwtEncoder` | Decodifica/valida y emite JWT. | Emisión/validación. | Clave secreta fuerte en env/secret manager. | Clave hardcodeada en repo. |
| Autorización por rol | `ROLE_*` authorities + `@PreAuthorize`/matchers. | Control de permisos. | Mapear claim a authorities explícitamente. | Confundir rol de negocio con authority Spring. |

**Implementación desde cero**
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId></dependency>
```
```properties
security.jwt.secret-base64=${JWT_SECRET_BASE64}
```
```java
@Service
public class JwtService {
  private final JwtEncoder encoder; private final JwtDecoder decoder;
  public JwtService(@Value("${security.jwt.secret-base64}") String secretBase64){
    SecretKey key = new SecretKeySpec(Base64.getDecoder().decode(secretBase64), "HmacSHA256");
    this.encoder = NimbusJwtEncoder.withSecretKey(key).algorithm(MacAlgorithm.HS256).build();
    this.decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
  }
  public String generar(String usuario, String rol){
    Instant ahora = Instant.now();
    var claims = JwtClaimsSet.builder().subject(usuario).claim("rol", rol).issuedAt(ahora).expiresAt(ahora.plusSeconds(900)).build();
    return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
  }
  public JwtDecoder decoder(){ return decoder; }
}
```
```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt) throws Exception {
  return http.csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth.requestMatchers("/public/**","/api/auth/**").permitAll().requestMatchers(HttpMethod.DELETE,"/api/**").hasRole("ADMIN").anyRequest().authenticated())
    .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.decoder(jwtServiceDecoder())))
    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .build();
}
```
> Nota: configura `JwtAuthenticationConverter` para mapear claim `rol` a `ROLE_*`.

**Ejecución real**: `JWT_SECRET_BASE64=$(openssl rand -base64 32) ./mvnw -Dtest=JwtServiceTest test`. **Verificación**: token sin firma/expirado => 401; USER en DELETE => 403; ADMIN => 200.

### Tema 3: CORS y CSRF · Intermedio · 30 min

**Caso guía**: SPA en otro origen llama API con Bearer; preflight OPTIONS debe pasar.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| CORS | Política de navegador para requests cross-origin. | Permitir frontends legítimos. | Allowlist de orígenes/métodos/headers. | `*` con credenciales. |
| Preflight `OPTIONS` | Request previo del navegador. | Verificar permisos CORS. | Responder correctamente antes de auth compleja. | Bloquear OPTIONS con auth. |
| CSRF | Ataque que abusa cookies automáticas del navegador. | Proteger sesiones cookie. | Para APIs stateless Bearer, usualmente `csrf.disable()`; para cookie/session, habilitar token CSRF. | Deshabilitar CSRF en app con cookies de sesión. |
| Credenciales/cookies | `allowCredentials` y cookies. | Sesiones cross-site. | Usar con origen específico. | Combinar credenciales y origen wildcard. |

**Implementación desde cero**
```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
  var config = new CorsConfiguration();
  config.setAllowedOrigins(List.of("https://web.academia.dev"));
  config.setAllowedMethods(List.of("GET","POST","DELETE"));
  config.setAllowedHeaders(List.of("Authorization","Content-Type"));
  config.setAllowCredentials(false);
  var source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/api/**", config);
  return source;
}
```
En `SecurityFilterChain`: `.cors(Customizer.withDefaults())`.

**Ejecución real**: `./mvnw -Dtest=CorsConfigTest test` con MockMvc OPTIONS. **Verificación**: origen permitido 200 con headers CORS; origen ajeno 403/sin allow-origin.

### Tema 4: Reducir SSRF en clientes HTTP con InetAddressFilter · Avanzado · 30 min

**Caso guía**: endpoint recibe URL de usuario; atacante apunta a `http://169.254.169.254/` o localhost.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| SSRF | Server-Side Request Forgery: servidor hace request a destino elegido por atacante. | Vector de ataque interno. | Validar/filtrar destino antes de conectar. | Hacer GET a cualquier URL del usuario. |
| `InetAddressFilter` / validación IP | Filtro que bloquea rangos internos/metadata. | Reducir SSRF. | Bloquear loopback, private, link-local, metadata. | Validar solo string hostname. |
| DNS rebinding/redirects | Resolución o redirect puede llevar a IP interna. | Bypass comunes. | Revalidar tras resolución y controlar redirects. | Seguir redirects ciegamente. |
| Defensa en profundidad | Allowlist de hosts, egress firewall, timeouts. | Reducir riesgo residual. | No confiar en un solo check. | “Ya validé el host, listo”. |

**Implementación desde cero** (concepto; requiere soporte HTTP client/filter)
```java
// Pseudocódigo: antes de conectar, resolver host y rechazar IPs internas/metadata
InetAddress addr = InetAddress.getByName(uri.getHost());
if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress()) throw new IllegalArgumentException("destino no permitido");
```
**Ejecución real**: test bloquea `localhost`, `127.0.0.1`, `169.254.169.254`; permite host público permitido. **Verificación**: no se realiza conexión a IP interna.

### Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida · Avanzado · 30 min

**Caso guía**: usuario envía credenciales, recibe JWT, accede a `/api/usuarios`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Login endpoint | Endpoint que autentica credenciales y emite token. | Inicio de sesión. | `permitAll` pero con rate limit/validación. | Exponer sin protección ante brute force. |
| `PasswordEncoder` (BCrypt) | Hash seguro de contraseña. | No guardar passwords en claro. | `BCryptPasswordEncoder`, matches. | SHA-256 plano o texto claro. |
| Flujo Bearer | Cliente envía `Authorization: Bearer <jwt>`. | Acceso stateless. | HTTPS, expiración corta. | Token largo sin expiración. |
| Principal/Authentication | Identidad autenticada en SecurityContext. | Saber quién llama. | Obtener de `Authentication`, no confiar en body. | Tomar userId del request body. |

**Implementación desde cero**
```java
@Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

@PostMapping("/api/auth/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
  if (!emailDemo.equals(req.email()) || !passwordEncoder.matches(req.password(), hashDemo))
    return ResponseEntity.status(401).body(Map.of("error","Credenciales inválidas"));
  return ResponseEntity.ok(Map.of("token", jwtService.generar(req.email(), "ADMIN")));
}
@GetMapping("/api/usuarios")
public Map<String,String> yo(Authentication auth){
  return Map.of("email", auth.getName(), "rol", auth.getAuthorities().iterator().next().getAuthority());
}
```
**Ejecución real**
```bash
curl -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"ana@rutaflow.dev","password":"clave-larga-segura"}'
curl localhost:8080/api/usuarios -H 'Authorization: Bearer <token>'
```
**Salida esperada**: login 200 con token; sin token 401; con token 200 con email/rol. **Verificación**: contraseña mala 401.

