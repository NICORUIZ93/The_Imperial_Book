# Módulo 5: Spring Security I: cadena, JWT con resource server, CORS y SSRF

Este módulo cubre seguridad web base en Spring Security: cadena de filtros, autorización, JWT como resource server, CORS/CSRF y SSRF. La seguridad se verifica por comportamiento observable (401/403/200, CORS headers), no por “parece seguro”.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0. Ejemplos Security requieren contexto Spring Boot; conceptos de authz/CORS/SSRF se ilustran con mínimos ejecutables o notas verificables.

## Aprende construyendo

### Tema 1: SecurityFilterChain moderno · Intermedio · 30 min

Caso guía: proteger `/pedidos/**` y dejar `/publico/**` abierto.

#### `SecurityFilterChain`

**Definición formal.** Bean que configura la cadena de filtros de seguridad para requests HTTP, definiendo reglas de autorización, autenticación, CSRF, CORS, etc.

**Para qué sirve.** Define política de seguridad explícita.

**Cuándo usarlo.** Siempre en Spring Security moderno (estilo lambda DSL). Evita extender clases obsoletas del modelo antiguo.

**Ejemplo mínimo enfocado (Spring).**

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  return http.authorizeHttpRequests(a -> a.requestMatchers("/publico/**").permitAll().anyRequest().authenticated())
             .httpBasic(Customizer.withDefaults()).build();
}
```

**Caso de uso real.** API con rutas públicas y privadas.

**Error común.** Orden incorrecto de matchers. Corrección: reglas más específicas primero.

**Verificación.** **Nota:** requiere app Boot; `curl` debe dar 200 en público y 401 en protegido.

#### Autenticación vs autorización

**Definición formal.** Autenticación verifica identidad; autorización verifica permisos sobre un recurso/acción.

**Para qué sirve.** Separar “quién eres” de “qué puedes hacer”.

**Cuándo usarlo.** Siempre al diseñar seguridad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb5-authz && cd /tmp/sb5-authz
cat > DemoAuthz.java << 'JAVA'
public class DemoAuthz { static String check(boolean auth, boolean admin){ if(!auth) return "401"; return admin?"200":"403"; }
  public static void main(String[] args){ System.out.println(check(false,false)); System.out.println(check(true,false)); System.out.println(check(true,true)); } }
JAVA
javac DemoAuthz.java && java DemoAuthz
```

**Caso de uso real.** Usuario autenticado sin rol admin recibe 403.

**Error común.** Confundir 401 y 403. Corrección: 401 no autenticado, 403 autenticado sin permiso.

**Verificación (JDK 27, 2026-05-22).** Salida: `401`, `403`, `200`.

### Tema 2: JWT con el resource server de Spring Security y autorización por rol · Intermedio · 45 min

Caso guía: API stateless que valida JWT Bearer.

#### JWT Resource Server

**Definición formal.** Configuración donde la app valida tokens JWT entrantes (firma, claims, expiración) y construye autenticación.

**Para qué sirve.** APIs stateless entre servicios/frontends.

**Cuándo usarlo.** Cuando el token lo emite un IdP o servicio de auth. No inventes tu propia criptografía.

**Ejemplo mínimo enfocado (Spring).**

```java
http.oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
```

**Caso de uso real.** SPA envía `Authorization: Bearer <jwt>`.

**Error común.** No validar `iss`, `aud`, `exp` o aceptar alg inseguro. Corrección: configurar issuer/aud y validadores.

**Verificación.** **Nota:** requiere claves/issuer y app Boot; evidencia: token válido 200, inválido/expirado 401.

#### Autorización por rol/claim

**Definición formal.** Regla que concede acceso según roles/authorities/claims extraídos del token.

**Para qué sirve.** Control de acceso por función.

**Cuándo usarlo.** Cuando hay permisos diferenciados.

**Ejemplo mínimo enfocado (Spring).**

```java
http.authorizeHttpRequests(a -> a.requestMatchers("/admin/**").hasRole("ADMIN").anyRequest().authenticated());
```

**Caso de uso real.** Solo admin puede borrar.

**Error común.** Confiar en rol enviado por cliente sin validar token. Corrección: derivar roles de claims validados.

**Verificación.** **Nota:** requiere JWT con claims; 403 observable.

### Tema 3: CORS y CSRF · Intermedio · 30 min

Caso guía: frontend en otro origen llama API; formularios con cookies necesitan CSRF.

#### CORS

**Definición formal.** Cross-Origin Resource Sharing: mecanismo del navegador que controla si un origen puede leer respuestas de otro origen.

**Para qué sirve.** Permitir frontends legítimos en otros orígenes.

**Cuándo usarlo.** APIs llamadas desde navegador con distinto origen. No es control de autenticación.

**Ejemplo mínimo enfocado (Spring).**

```java
@Bean CorsConfigurationSource cors() { var c=new CorsConfiguration(); c.setAllowedOrigins(List.of("https://app.ejemplo")); c.setAllowedMethods(List.of("GET","POST")); var s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**", c); return s; }
```

**Caso de uso real.** SPA en `app.ejemplo` consumiendo `api.ejemplo`.

**Error común.** `allowedOrigins("*")` con credenciales. Corrección: allowlist explícita.

**Verificación.** **Nota:** evidencia con preflight OPTIONS y headers `Access-Control-Allow-Origin`.

#### CSRF

**Definición formal.** Cross-Site Request Forgery: ataque donde navegador víctima envía request autenticada por cookies a otro sitio; la protección CSRF exige token/prueba no reproducible por el sitio atacante.

**Para qué sirve.** Proteger flujos basados en cookies/sesión.

**Cuándo usarlo.** Apps con sesión/cookies. En APIs stateless Bearer, usualmente se deshabilita con cuidado.

**Ejemplo mínimo enfocado (conceptual).**

```java
http.csrf(csrf -> csrf.disable()); // solo en API stateless sin cookies; justificar
```

**Caso de uso real.** Form HTML con cookie de sesión necesita token CSRF.

**Error común.** Deshabilitar CSRF por defecto en app con cookies. Corrección: mantener CSRF o usar Bearer stateless correctamente.

**Verificación.** **Nota:** requiere escenario con cookies/sesión; evidencia por 403 ante falta de token.

### Tema 4: Reducir SSRF en clientes HTTP con InetAddressFilter · Avanzado · 30 min

Caso guía: endpoint recibe URL y backend la descarga.

#### SSRF

**Definición formal.** Server-Side Request Forgery: atacante induce al servidor a hacer requests a destinos internos/no deseados.

**Para qué sirve.** Entenderlo permite diseñar controles.

**Cuándo mitigarlo.** Siempre que el servidor haga HTTP basado en input.

**Ejemplo mínimo enfocado (ejecutable, validación simple).**

```bash
mkdir -p /tmp/sb5-ssrf && cd /tmp/sb5-ssrf
cat > DemoSsrf.java << 'JAVA'
import java.net.*;
public class DemoSsrf { static boolean permitido(String url) throws Exception { URI u=new URI(url); if(!u.getScheme().equals("https")) return false; return u.getHost().equals("api.ejemplo.com"); }
  public static void main(String[] args) throws Exception { System.out.println(permitido("https://api.ejemplo.com/x")); System.out.println(permitido("http://127.0.0.1:8080")); } }
JAVA
javac DemoSsrf.java && java DemoSsrf
```

**Caso de uso real.** Webhook fetcher.

**Error común.** Validar solo el string, no el IP resuelto/DNS rebinding. Corrección: allowlist, resolver IP, bloquear rangos privados, no seguir redirects ciegos.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`, `false`.

### Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida · Avanzado · 30 min

Caso guía: autenticarse y acceder recurso protegido.

#### Flujo login-token-acceso

**Definición formal.** Secuencia: credenciales -> autenticación -> emisión de token/sesión -> cliente envía credencial en requests posteriores -> resource server/filters autorizan.

**Para qué sirve.** Comprender el ciclo real de autenticación.

**Cuándo usarlo.** Al implementar auth en APIs.

**Ejemplo mínimo enfocado (conceptual).**

```bash
curl -X POST /api/auth/login -d '{"u":"a","p":"b"}'
# -> {"token":"..."}
curl -H "Authorization: Bearer ..." /api/pedidos
```

**Caso de uso real.** Login de SPA.

**Error común.** Loguear contraseñas/tokens. Corrección: no registrar secretos; usar HTTPS; tokens con expiración.

**Verificación.** **Nota:** requiere app completa; evidencia por 401 sin token y 200 con token válido.

## Cierre del módulo

Security en Spring se diseña por capas: cadena de filtros, identidad, autorización, CORS/CSRF según tipo de cliente y protección SSRF en salidas. Cada control debe verificarse con requests reales.
