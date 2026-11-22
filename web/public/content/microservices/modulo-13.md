# Módulo 9 · Seguridad

**Fase 1 · Spring Boot de cero a experto** (semana 9 y mitad de la 10, de 12). **Duración:** 18 h (9 temas de 1,5–2,5 h).
**Dificultad:** 4 de 5. **Dependencias:** Módulo 2 (Spring MVC, filtros HTTP, `ProblemDetail`) y Módulo 7 (Spring Cloud
Gateway, configuración centralizada); para el tema de mTLS conviene haber visto contenedores (Módulo 0.5).
**Herramientas:**JDK 25 LTS (25.0.5)**, **Spring Boot 4.1.3** (Spring Security 7.1.3, Spring Framework 7.0.11),
**Spring Cloud 2025.1.4** (Spring Cloud Vault 5.0), **Keycloak 26.8.2**, **HashiCorp Vault 2.2.0**, **Trivy 0.76.1**,
**Snyk CLI 1.1309.0**, **Istio 1.32** sobre **kind**, OpenSSL 3 y `curl`. **Laboratorio:** `modulo-13`
(`./verificar.sh --solo-jdk` corre las demostraciones con solo el JDK; `./verificar.sh` añade Keycloak, Vault, Trivy y
los tests de Spring; `./verificar.sh --mtls` monta la malla de servicios).

Hasta ahora tus servicios confiaban en cualquiera que les hablara. Este módulo construye la seguridad por capas, de
afuera hacia adentro: quién eres (autenticación), qué puedes hacer (autorización), cómo viaja tu identidad entre
servicios sin regalarla, cómo se protege la red entre ellos, dónde viven los secretos y cómo detectas a tiempo una
librería con una vulnerabilidad conocida. **Todas las fichas traen el «antes» vulnerable y el «después» seguro, con código
de ambos**: aprenderás tanto a atacar tu propio servicio como a cerrarlo.

```mermaid
flowchart LR
    U["Usuario"] -->|"1 · login OIDC<br/>Authorization Code + PKCE"| KC["4 · Keycloak<br/>(OAuth2 / OIDC)"]
    KC -->|"2 · JWT firmado<br/>RS256"| GW["Spring Security<br/>1 · filter chain"]
    GW -->|"5 · RBAC y scopes"| PE["pedidos"]
    PE -->|"6 · Token Exchange<br/>RFC 8693"| KC
    PE ==>|"7 · mTLS<br/>(service mesh)"| PA["pagos"]
    V[("8 · Vault<br/>secretos")] -.-> PE
    V -.-> PA
    T["9 · Trivy / Snyk<br/>en CI"] -.->|"imágenes y<br/>dependencias"| PE
    T -.-> PA
```

**Texto alternativo:** mapa del módulo como recorrido de una petición. El usuario inicia sesión con OIDC (tema 3) en
Keycloak (tema 4), que emite un JWT firmado con RS256 (tema 2). La petición entra por la cadena de filtros de Spring
Security (tema 1), que aplica RBAC y scopes (tema 5) antes de llegar al servicio pedidos. Pedidos canjea el token en
Keycloak con Token Exchange (tema 6) y llama a pagos por un canal mTLS de la malla de servicios (tema 7, flecha gruesa).
Vault (tema 8) entrega secretos a ambos servicios y Trivy/Snyk (tema 9) escanean sus imágenes y dependencias en CI.

**Cómo usar el laboratorio.** Empieza cada tema con su demostración de `jdk/` (corre con `java Archivo.java`, sin
dependencias) para ver el ataque y la defensa en pocas líneas; después pasa al proyecto Spring `fNNN-*`, que hace lo
mismo con las piezas de producción. Para los temas 3 a 6 y 8 levanta la infraestructura una sola vez:
`docker compose up -d --wait` (Keycloak en `localhost:8180` con el realm `tienda` importado, y Vault en
`localhost:8200`). Los usuarios son `ana` (cliente), `sofia` (soporte) y `root` (admin), todos con la contraseña
`clave-demo`; las credenciales del laboratorio terminan en `-solo-dev` para que nunca las confundas con unas reales.

---
### Spring Security: filter chain

#### 1. UBICACIÓN

Módulo 9, Lección 1 de 9 · Fase 1 · 2 h
`f061-filter-chain`.

#### 2. PRERREQUISITOS

- Módulo 2, lección 1: `DispatcherServlet`, controladores y códigos 200/401/403/404.
- Módulo 0.4: cabeceras HTTP y `curl -u usuario:clave`.
- Módulo 1: beans, `@Configuration` y perfiles (`@Profile`).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** una `SecurityFilterChain` que deja pública una ruta, exige autenticación en el resto y el rol `ADMIN`
en `/admin/**`, **insertar** un filtro propio en la posición correcta y **demostrarlo** con 6 tests que distinguen
`401` (no sé quién eres) de `403` (sé quién eres, pero no puedes).

#### 4. ANALOGÍA VISUAL

El **control de un aeropuerto**. Antes de llegar a la puerta de embarque (el controlador) pasas por una **fila de
puestos en orden fijo**: el primero mira si ya traes una tarjeta de embarque (el contexto de seguridad), el segundo
revisa tu documento contra la base de datos (autenticación), otro anota quién pasó (auditoría) y el último, frente a la
sala VIP, compara tu tarjeta con la lista de quién puede entrar (autorización). Si no traes documento, te mandan al
mostrador a identificarte (**401** con un letrero «identifíquese»); si tu documento es válido pero tu tarjeta no es
VIP, te dicen «usted no puede pasar» (**403**). Los pasajeros que solo van a la cafetería pública ni siquiera hacen
fila. En el dibujo: una cinta con cinco cabinas numeradas, un pasajero sin documento devuelto en la cabina 2 con un
cartel «401» y otro con documento detenido en la cabina 5 con un cartel «403».

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant C as Cliente
    participant T as Tomcat
    participant DFP as DelegatingFilterProxy
    participant FCP as FilterChainProxy
    participant SCH as SecurityContextHolderFilter
    participant BA as BasicAuthenticationFilter
    participant ET as ExceptionTranslationFilter
    participant AU as AuditoriaFilter (propio)
    participant AZ as AuthorizationFilter
    participant DS as DispatcherServlet
    C->>T: GET /admin/panel (Authorization: Basic ...)
    T->>DFP: filtro del contenedor de servlets
    DFP->>FCP: delega en el bean "springSecurityFilterChain"
    FCP->>FCP: elige la primera SecurityFilterChain que coincide
    FCP->>SCH: 1
    SCH->>BA: 2 · comprueba usuario y contraseña
    BA->>ET: 3 · envuelve lo que sigue en try/catch
    ET->>AU: 4 · anota quién llama
    AU->>AZ: 5 · ¿hasRole("ADMIN")?
    alt sin identidad
        AZ-->>ET: AuthenticationException
        ET-->>C: 401 + WWW-Authenticate
    else identidad sin rol
        AZ-->>ET: AccessDeniedException
        ET-->>C: 403
    else permitido
        AZ->>DS: continúa la cadena
        DS-->>C: 200
    end
```

**Texto alternativo:** diagrama de secuencia. El cliente envía GET /admin/panel con credenciales Basic a Tomcat. El
filtro del contenedor DelegatingFilterProxy delega en el bean FilterChainProxy, que elige la primera SecurityFilterChain
que coincide con la petición. La petición recorre en orden SecurityContextHolderFilter, BasicAuthenticationFilter (que
comprueba la contraseña), ExceptionTranslationFilter (que envuelve el resto), el filtro propio AuditoriaFilter y
AuthorizationFilter. Si no hay identidad, AuthorizationFilter lanza AuthenticationException y ExceptionTranslationFilter
responde 401 con WWW-Authenticate; si hay identidad sin el rol, lanza AccessDeniedException y se responde 403; si está
permitido, la petición llega al DispatcherServlet y se responde 200.

#### 6. EXPLICACIÓN NIVEL 0

Un **filtro** es un trozo de código que mira cada petición **antes** de que llegue a tu controlador y decide si la deja
seguir, la modifica o la corta. Spring Security es, por dentro, **una lista ordenada de filtros**: uno lee la cabecera
`Authorization` y averigua quién eres, otro decide si puedes entrar a esa ruta, otro convierte los rechazos en
respuestas HTTP. Tú no escribes esos filtros: escribes **reglas** («`/publico/**` para todos», «`/admin/**` solo
`ADMIN`») y Spring arma la fila. Dos códigos que vas a ver todo el tiempo: **401 Unauthorized** significa «no sé quién
eres» (identifícate) y **403 Forbidden** significa «sé quién eres y no puedes».

#### 7. EXPLICACIÓN INTERMEDIA

- **Tres piezas encadenadas.** Tomcat solo conoce filtros de servlet; `DelegatingFilterProxy` es uno de ellos y delega
  en un bean de Spring, el `FilterChainProxy` (nombre `springSecurityFilterChain`). Este tiene una o varias
  `SecurityFilterChain` y usa **la primera que coincide** con la petición. Además limpia el `SecurityContext` al terminar
  cada petición y aplica el `HttpFirewall`.
- **Orden de los filtros.** Al arrancar, con `logging.level.org.springframework.security.web.DefaultSecurityFilterChain=DEBUG`,
  Spring imprime «`Will secure any request with [...]`» con la lista. Los importantes, en orden: `SecurityContextHolderFilter`
  (carga el contexto), `HeaderWriterFilter`, `CsrfFilter`, `LogoutFilter`, los de autenticación (`BasicAuthenticationFilter`,
  `UsernamePasswordAuthenticationFilter`, `BearerTokenAuthenticationFilter`…), `AnonymousAuthenticationFilter` (si nadie
  se identificó pone un usuario anónimo), `ExceptionTranslationFilter` y, al final, `AuthorizationFilter`.
- **El desafío Basic.** Sin credenciales (o con credenciales malas), Spring Security 7 responde `401` con
  `WWW-Authenticate: Basic realm="Realm", charset="UTF-8"`: `Realm` es el nombre por defecto (se cambia con
  `httpBasic(b -> b.realmName("tienda"))`) y `charset` avisa al cliente de que codifique usuario y contraseña en UTF-8.
- **`ExceptionTranslationFilter`** llama al resto de la cadena dentro de un `try`. Si sale una `AuthenticationException`
  (o el usuario es anónimo y le niegan el acceso) invoca el `AuthenticationEntryPoint` → `401` con `WWW-Authenticate`.
  Si sale una `AccessDeniedException` con un usuario autenticado invoca el `AccessDeniedHandler` → `403`.
- **Reglas.** `authorizeHttpRequests(r -> r.requestMatchers("/publico/**").permitAll()...)`: se evalúan **en orden** y
  gana la primera que coincide; por eso `anyRequest()` va al final. En Spring Security 7 los patrones usan
  `PathPatternRequestMatcher` (desaparecieron `AntPathRequestMatcher` y `MvcRequestMatcher`) y el DSL solo acepta lambdas
  (ya no existe `and()`).
- **Filtros propios.** `addFilterBefore(filtro, AuthorizationFilter.class)` lo coloca justo antes de la autorización,
  cuando ya se sabe quién llama. No lo anotes con `@Component`: Spring Boot registraría también el filtro en Tomcat y se
  ejecutaría dos veces (una fuera de la cadena de seguridad).
- **Contraseñas.** `PasswordEncoderFactories.createDelegatingPasswordEncoder()` guarda `{bcrypt}$2a$10$...`: el prefijo
  dice qué algoritmo usó, para poder migrar de algoritmo sin invalidar a todos los usuarios.

#### 8. EXPLICACIÓN MAESTRA

| Decisión | Opción A | Opción B | Cuándo cada una |
|---|---|---|---|
| Dónde autorizar | `authorizeHttpRequests` (por URL, en la cadena) | `@PreAuthorize` (por método, con `@EnableMethodSecurity`) | URL para reglas gruesas y uniformes; método para reglas que dependen del dominio («solo el dueño del pedido»). Lo habitual es combinar: `anyRequest().authenticated()` + `@PreAuthorize`. |
| Cuántas cadenas | Una sola cadena | Varias `SecurityFilterChain` con `securityMatcher` y `@Order` | Varias cuando conviven estilos: `/api/**` sin estado con JWT y `/admin/**` con sesión y formulario. Cada una se configura aislada. |
| Política por defecto | Lista de permitidos + `anyRequest().denyAll()` | `anyRequest().authenticated()` | `denyAll()` cierra lo que olvidaste declarar (más seguro, más fricción); `authenticated()` es razonable para APIs internas. |

**Trade-offs.** Cada filtro cuesta microsegundos; lo caro es lo que hacen (BCrypt tarda decenas de milisegundos a
propósito, por eso HTTP Basic con BCrypt en cada petición no escala y se usan tokens, F062). La cadena es **síncrona y
por hilo**: el `SecurityContextHolder` usa un `ThreadLocal`, así que si saltas a otro hilo (`@Async`, ejecutores) debes
propagarlo (`DelegatingSecurityContextExecutor`). En WebFlux la cadena es otra (`SecurityWebFilterChain`) y el contexto
viaja en el `Context` de Reactor.

**Alternativas:** autorizar en el API Gateway (Módulo 7) centraliza, pero cada servicio debe seguir validando (defensa
en profundidad: el tráfico interno también puede ser hostil, ver F067); un *sidecar* de autorización como OPA mueve las
reglas fuera del código, a costa de otra pieza que operar.

**Cuándo NO:** un servicio que solo consume colas no tiene peticiones HTTP que filtrar (la seguridad va en el broker:
usuarios y ACL de Kafka o RabbitMQ); y un *health check* público no necesita una cadena: decláralo `permitAll()` en
lugar de inventar excepciones en un filtro propio.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** JDK 25 LTS · Spring Boot 4.1.3 · `spring-boot-starter-security` (Spring Security 7.1.3) ·
`spring-boot-starter-webmvc` · `spring-boot-starter-security-test` y `spring-boot-starter-webmvc-test` para los tests.
La demostración de `jdk/` no necesita dependencias.

**Antes (vulnerable)** — en JDK puro, `jdk/CadenaDeFiltros.java` registra los controladores sin filtros; en Spring, la
cadena del perfil `antes` lo deja todo abierto:

```java
@Bean
@Profile("antes")
SecurityFilterChain cadenaVulnerable(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(reglas -> reglas.anyRequest().permitAll())   // cualquiera entra a /admin
        .build();
}
```

**Después (seguro)** — `modulo-13/f061-filter-chain/build.gradle.kts`:

```kotlin
// F061 · Spring Security: filter chain
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Spring MVC + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // Spring Security 7.1 (FilterChainProxy, SecurityFilterChain)
    implementation(libs.spring.boot.starter.security)
    // MockMvc, JUnit Jupiter 6, AssertJ
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // httpBasic(), jwt(), oidcLogin() para MockMvc
    testImplementation(libs.spring.boot.starter.security.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

> **Build con Gradle (y su equivalencia en Maven).** Este laboratorio se construye con **Gradle 9.9.2** y Kotlin DSL
> mediante el wrapper `./gradlew` (no instalas Gradle). `settings.gradle.kts` lista los subproyectos (en Maven,
> `<modules>` del POM agregador), cada carpeta tiene su `build.gradle.kts` (su `pom.xml`) y
> `gradle/libs.versions.toml` es el **catálogo de versiones** (las `<properties>` y el `dependencyManagement`): por eso
> las dependencias se escriben `libs.…`. Equivalencias: `./mvnw test` → `./gradlew test` ·
> `./mvnw package -DskipTests` → `./gradlew bootJar` · `./mvnw spring-boot:run` → `./gradlew bootRun` ·
> `-Dtest=Clase` → `--tests Clase` · `target/` → `build/` (el jar queda en `build/libs/`). Gradle escribe una línea
> `PASSED` por test y termina con `BUILD SUCCESSFUL` (Maven: `Tests run: N` y `BUILD SUCCESS`).

`modulo-13/settings.gradle.kts`:

```kotlin
// Módulo 9 (modulo-13) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todas las fichas con Spring.
// F068 necesita Vault encendido y VAULT_TOKEN (lo prepara verificar.sh). F067 (mTLS) no tiene build, y F069 conserva
// sus pom.xml porque son el material que leen Trivy, Snyk y MiniEscaner: ver README.
// Cada carpeta tiene su propio build.gradle.kts; las versiones viven en gradle/libs.versions.toml
// (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
// Sin esto, un alumno sin JDK 25 instalado ve el build morir en la configuración, antes de cualquier test.
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "modulo-13-laboratorios"

include(
    "f061-filter-chain",
    "f062-jwt",
    "f063-oauth2-oidc",
    "f064-keycloak",
    "f065-rbac-scopes",
    "f066-token-exchange",
    "f068-vault",
)
```

`modulo-13/gradle/libs.versions.toml`:

```toml
# Módulo 9 (modulo-13)
# Catálogo de versiones del laboratorio: una sola fuente para plugins y librerías.
# Las librerías SIN versión las fija el BOM de Spring Boot (spring-boot-dependencies) o el BOM que importe el proyecto.

[versions]
spring-boot = "4.1.3"
# Tren de Spring Cloud compatible con Spring Boot 4.1.x
spring-cloud = "2025.1.4"

[libraries]
spring-boot-starter-webmvc = { module = "org.springframework.boot:spring-boot-starter-webmvc" }
spring-boot-starter-security = { module = "org.springframework.boot:spring-boot-starter-security" }
spring-boot-starter-webmvc-test = { module = "org.springframework.boot:spring-boot-starter-webmvc-test" }
spring-boot-starter-security-test = { module = "org.springframework.boot:spring-boot-starter-security-test" }
junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
spring-boot-starter-security-oauth2-resource-server = { module = "org.springframework.boot:spring-boot-starter-security-oauth2-resource-server" }
spring-boot-starter-security-oauth2-resource-server-test = { module = "org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test" }
spring-boot-starter-security-oauth2-client = { module = "org.springframework.boot:spring-boot-starter-security-oauth2-client" }
spring-boot-starter-security-oauth2-client-test = { module = "org.springframework.boot:spring-boot-starter-security-oauth2-client-test" }
spring-boot-starter-restclient = { module = "org.springframework.boot:spring-boot-starter-restclient" }
spring-cloud-starter-vault-config = { module = "org.springframework.cloud:spring-cloud-starter-vault-config" }
spring-boot-starter-test = { module = "org.springframework.boot:spring-boot-starter-test" }

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
spring-dependency-management = { id = "io.spring.dependency-management", version = "1.1.7" }
```

`src/main/java/academia/seguridad/cadena/SeguridadConfig.java`:

```java
package academia.seguridad.cadena;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;

@Configuration
class SeguridadConfig {

    /** DESPUÉS (seguro): reglas explícitas, la última niega por defecto a quien no se identificó. */
    @Bean
    @Profile("!antes")
    SecurityFilterChain cadenaSegura(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(reglas -> reglas
                .requestMatchers("/publico/**").permitAll()            // la primera regla que coincide gana
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults())                     // añade BasicAuthenticationFilter
            .addFilterBefore(new AuditoriaFilter(), AuthorizationFilter.class)
            .build();
    }

    /** ANTES (vulnerable): una cadena que deja pasar todo; existe solo para compararla (perfil "antes"). */
    @Bean
    @Profile("antes")
    SecurityFilterChain cadenaVulnerable(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(reglas -> reglas.anyRequest().permitAll())
            .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();   // {bcrypt} por defecto
    }

    @Bean
    UserDetailsService usuarios(PasswordEncoder encoder) {
        // Solo para el laboratorio: en producción los usuarios viven en Keycloak (F064) o en una base.
        return new InMemoryUserDetailsManager(
            User.withUsername("ana").password(encoder.encode("clave-ana")).roles("USER").build(),
            User.withUsername("root").password(encoder.encode("clave-root")).roles("USER", "ADMIN").build());
    }
}
```

`src/main/java/academia/seguridad/cadena/AuditoriaFilter.java`:

```java
package academia.seguridad.cadena;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro propio que se inserta DESPUÉS de BasicAuthenticationFilter y ANTES de AuthorizationFilter:
 * ya sabe quién llama, pero aún no se decidió si puede pasar. No es un @Component a propósito:
 * si lo fuera, Spring Boot también lo registraría en Tomcat y se ejecutaría dos veces.
 */
class AuditoriaFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        String quien = a == null ? "anonimo" : a.getName();   // el AnonymousAuthenticationFilter ya puso "anonymousUser"
        log.info("auditoría: {} {} por {}", req.getMethod(), req.getRequestURI(), quien);
        res.setHeader("X-Auditado-Por", quien);
        chain.doFilter(req, res);
    }
}
```

`src/main/java/academia/seguridad/cadena/PanelController.java` y `CadenaApp.java`:

```java
package academia.seguridad.cadena;

import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PanelController {

    @GetMapping("/publico/hola")
    Map<String, String> hola() { return Map.of("mensaje", "hola, visitante"); }

    @GetMapping("/yo")
    Map<String, String> yo(Principal quien) { return Map.of("usuario", quien.getName()); }

    @GetMapping("/admin/panel")
    Map<String, String> panel() { return Map.of("panel", "ventas del día: 42"); }
}
```

```java
package academia.seguridad.cadena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CadenaApp {
    public static void main(String[] args) {
        SpringApplication.run(CadenaApp.class, args);
    }
}
```

`src/main/resources/application.properties`:

```properties
spring.application.name=f061-filter-chain
# Imprime al arrancar la lista de filtros: "Will secure any request with [...]"
logging.level.org.springframework.security.web.DefaultSecurityFilterChain=DEBUG
# Descomenta para ver cada filtro invocado en cada petición ("Invoking ... (n/m)"):
#logging.level.org.springframework.security=TRACE
```

La misma idea sin Spring está en `jdk/CadenaDeFiltros.java` (168 líneas): tres `com.sun.net.httpserver.Filter`
(`traduccionDeExcepciones`, `autenticacionBasica` con PBKDF2 y `autorizacion`) encadenados delante del handler, con
las excepciones `NoAutenticado` → 401 y `AccesoDenegado` → 403 que imitan a las de Spring.

#### 10. MINI-LABORATORIO

1. Ejecuta la demostración sin dependencias (ejecutada con JDK 25.0.5):

```bash
java CadenaDeFiltros.java
```

   **Output esperado:**

```text
ANTES (vulnerable): sin cadena de filtros
  GET /admin   anónimo      -> 200   <- cualquiera entra
DESPUÉS (seguro): ExceptionTranslation -> BasicAuthentication -> Authorization -> handler
  GET /publico  anónimo          -> 200
  GET /admin    anónimo          -> 401  WWW-Authenticate: Basic realm="tienda"
  GET /admin    ana:mala         -> 401  WWW-Authenticate: Basic realm="tienda"
  GET /admin    ana:clave-ana    -> 403
  GET /admin    root:clave-root  -> 200
OK: la cadena responde 401 sin identidad y 403 sin el rol
```

2. Arranca la versión Spring y mira la lista de filtros en el log:

```bash
cd ../f061-filter-chain
../gradlew -q bootRun
```

   **Output esperado:** una línea `DEBUG... o.s.s.web.DefaultSecurityFilterChain: Will secure any request with [...]`
   cuya lista empieza por `DisableEncodeUrlFilter, WebAsyncManagerIntegrationFilter, SecurityContextHolderFilter` y
   termina en `ExceptionTranslationFilter, AuditoriaFilter, AuthorizationFilter`, y después
   `Tomcat started on port 8080 (http)`.

3. En otra terminal, prueba los cuatro casos:

```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:8080/publico/hola
curl -s -o /dev/null -w "%{http_code} %header{www-authenticate}\n" localhost:8080/admin/panel
curl -s -o /dev/null -w "%{http_code}\n" -u ana:clave-ana localhost:8080/admin/panel
curl -s -w " %header{x-auditado-por}\n" -u root:clave-root localhost:8080/admin/panel
```

   **Output esperado:**

```text
200
401 Basic realm="Realm", charset="UTF-8"
403
{"panel":"ventas del día: 42"} root
```

   **Captura comentada:** en la terminal de la app aparece una línea `INFO... AuditoriaFilter: auditoría: GET /admin/panel
   por...` en las peticiones a `/admin/panel` (con `anonymousUser`, `ana` y `root`); la de `/publico/hola` también pasa
   por el filtro, porque la cadena se aplica a todas las rutas: `permitAll()` decide en `AuthorizationFilter`, no evita la
   cadena.

4. **Fallo deliberado:** detén la app y arráncala con el perfil vulnerable:
   `../gradlew -q bootRun --args='--spring.profiles.active=antes'`. Repite el segundo `curl`: ahora responde `200` sin
   credenciales. Vuelve a arrancar sin perfil.

#### 11. VERIFICACIÓN

`src/test/java/academia/seguridad/cadena/CadenaDeFiltrosTest.java`:

```java
package academia.seguridad.cadena;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class CadenaDeFiltrosTest {

    @Autowired MockMvc mvc;
    @Autowired FilterChainProxy filterChainProxy;

    @Test
    void lasRutasPublicasNoPidenCredenciales() throws Exception {
        mvc.perform(get("/publico/hola")).andExpect(status().isOk());
    }

    @Test
    void sinCredencialesResponde401ConDesafioBasic() throws Exception {
        mvc.perform(get("/admin/panel"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", "Basic realm=\"Realm\", charset=\"UTF-8\""));
    }

    @Test
    void autenticadoSinElRolResponde403() throws Exception {
        mvc.perform(get("/admin/panel").with(httpBasic("ana", "clave-ana")))
            .andExpect(status().isForbidden());
    }

    @Test
    void conElRolAdminPasaYElFiltroPropioAudita() throws Exception {
        mvc.perform(get("/admin/panel").with(httpBasic("root", "clave-root")))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Auditado-Por", "root"))
            .andExpect(jsonPath("$.panel").value("ventas del día: 42"));
    }

    @Test
    void elFiltroPropioQuedaEntreLaAutenticacionYLaAutorizacion() {
        List<String> filtros = filterChainProxy.getFilterChains().get(0).getFilters().stream()
            .map(f -> f.getClass().getSimpleName()).toList();
        assertThat(filtros).containsSubsequence(
            "SecurityContextHolderFilter", "CsrfFilter", "BasicAuthenticationFilter",
            "ExceptionTranslationFilter", "AuditoriaFilter", "AuthorizationFilter");
        assertThat(filtros.getLast()).isEqualTo("AuthorizationFilter");
    }
}
```

`CadenaVulnerableTest` (en la misma carpeta) activa `@ActiveProfiles("antes")` y comprueba que un anónimo recibe `200` en
`/admin/panel`: documenta el «antes» para que nadie lo reintroduzca sin darse cuenta.

```bash
../gradlew test
```

**Output esperado:** 6 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.

**Pregunta de comprobación:** si pides `/admin/panel` con la contraseña equivocada, ¿qué filtro corta la petición y qué
código recibes? ¿Y si la contraseña es correcta pero eres `ana`?

<details>
<summary>Respuesta</summary>

Con la contraseña equivocada la corta `BasicAuthenticationFilter`: la autenticación falla y su `AuthenticationEntryPoint`
responde `401` con `WWW-Authenticate: Basic realm="Realm", charset="UTF-8"`; la petición nunca llega a la autorización. Con `ana` la
autenticación funciona, `AuthorizationFilter` niega `hasRole("ADMIN")` lanzando `AccessDeniedException` y
`ExceptionTranslationFilter` la traduce en `403`.
</details>

#### 12. ERROR COMÚN

**Síntoma:** los `GET` funcionan con credenciales, pero todo `POST`, `PUT` o `DELETE` responde `403 Forbidden` aunque el
usuario tenga el rol correcto, y el controlador nunca se ejecuta.

**Cómo se ve:** con `logging.level.org.springframework.security=TRACE` el log muestra que la petición no pasó del
`CsrfFilter` (se ve `Invoking CsrfFilter (n/m)` y a continuación la línea de `Invalid CSRF token found for...`), y
`curl -i` muestra `HTTP/1.1 403` sin cuerpo.

**Diagnóstico:** la protección CSRF viene activada y exige un token en cada petición que cambia estado. Es correcta para
navegadores con cookies de sesión, pero una API sin sesión que recibe el token en la cabecera `Authorization` no es
vulnerable a CSRF (el navegador no adjunta esa cabecera solo).

**Arreglo:** para una API REST sin cookies, declara `.sessionManagement(s -> s.sessionCreationPolicy(STATELESS))` y
`.csrf(AbstractHttpConfigurer::disable)` **con un comentario que explique por qué** (como en F065). Para una aplicación web
con sesión, mantén CSRF y envía el token (`http.csrf(csrf -> csrf.spa())` en Spring Security 7 para SPAs).

#### 13. PREGUNTA DE ENTREVISTA

«Explica cómo llega una petición desde Tomcat hasta tu controlador cuando usas Spring Security y por qué a veces ves 401
y a veces 403.»

**Respuesta modelo:** Tomcat ejecuta sus filtros de servlet; uno es `DelegatingFilterProxy`, que delega en el bean
`FilterChainProxy`. Este elige la primera `SecurityFilterChain` cuyo `securityMatcher` coincide y ejecuta sus filtros en
orden fijo: carga del `SecurityContext`, cabeceras, CSRF, los filtros de autenticación (Basic, formulario, bearer),
anónimo, `ExceptionTranslationFilter` y `AuthorizationFilter`. Si tras la autenticación nadie se identificó y la regla
exige autenticación, `ExceptionTranslationFilter` llama al `AuthenticationEntryPoint` y responde 401 con
`WWW-Authenticate`; si hay un usuario autenticado sin el permiso, llama al `AccessDeniedHandler` y responde 403. Para
depurar, pongo `org.springframework.security` en TRACE y veo cada filtro invocado, o un *breakpoint* en
`FilterChainProxy`.

#### 14. ANTI-PATRÓN RELACIONADO

**Seguridad hecha a mano dentro del controlador:**

```java
@GetMapping("/admin/panel")
ResponseEntity<?> panel(@RequestHeader(value = "Authorization", required = false) String auth) {
    if (auth == null || !auth.equals("Basic " + Base64.getEncoder().encodeToString("root:1234".getBytes()))) {
        return ResponseEntity.status(401).build();      // contraseña en el código y comparada con equals()
    }
    return ResponseEntity.ok(panelService.datos());     // la próxima ruta nueva olvidará este if
}
```

Cada endpoint repite (o se olvida de repetir) el chequeo, la contraseña queda en el código fuente, `equals()` filtra
información por tiempo de respuesta y no hay un lugar único donde auditar las reglas. La seguridad va en la cadena de
filtros y en reglas declarativas; el controlador solo hace negocio.

---
### JWT: firmas simétricas vs asimétricas

#### 1. UBICACIÓN

Módulo 9, Lección 2 de 9 · Fase 1 · 2 h
`f062-jwt`.

#### 2. PRERREQUISITOS

- F061: cadena de filtros, 401 frente a 403.
- Módulo 0.4: JSON y codificación Base64.
- Idea básica de *hash*: una función que convierte cualquier texto en una huella de tamaño fijo.

#### 3. OBJETIVO DE APRENDIZAJE

**Diferenciar** HS256 de RS256 explicando quién puede emitir y quién puede verificar con cada una, **explotar** dos fallos
clásicos de un verificador ingenuo (`"alg":"none"` y confusión RS256→HS256) y **configurar** un resource server de
Spring que los rechaza junto con tokens vencidos o de otra audiencia (6 tests en verde).

#### 4. ANALOGÍA VISUAL

Dos formas de sellar un sobre. **Simétrica (HS256):** un **sello de lacre** idéntico que tienen el emisor y cada
receptor; con él se sella y se comprueba, así que cualquier receptor podría sellar sobres falsos. **Asimétrica
(RS256):** una **firma manuscrita** que solo el emisor sabe hacer (clave privada) y una **foto de esa firma pegada en
la pared** de cada oficina (clave pública) para compararla; mirando la foto nadie aprende a firmar. El dibujo: a la
izquierda, tres personas con el mismo sello y una de ellas sellando un sobre falso; a la derecha, un notario firmando y
tres oficinas que solo comparan contra una foto enmarcada. Abajo, un falsificador que entrega un sobre con la etiqueta
«sin sello, créame» (`alg: none`) a un empleado distraído que lo acepta.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    subgraph JWT["JWT = cabecera . claims . firma (Base64URL)"]
      H["{alg: RS256, kid: clave-2026-11}"] --- P["{iss, sub: ana, aud: pedidos, exp}"] --- S["firma"]
    end
    subgraph HS["HS256 · simétrica"]
      E1["Emisor<br/>secreto K"] -->|"HMAC-SHA256(K)"| T1["token"]
      T1 --> R1["Servicio A<br/>mismo secreto K"]
      T1 --> R2["Servicio B<br/>mismo secreto K<br/>(también puede emitir)"]
    end
    subgraph RS["RS256 · asimétrica"]
      E2["Emisor<br/>clave PRIVADA"] -->|"RSA-SHA256"| T2["token"]
      T2 --> R3["Servicio A<br/>clave pública"]
      T2 --> R4["Servicio B<br/>clave pública<br/>(solo verifica)"]
      J["JWKS /certs"] -.->|"publica las claves<br/>por kid"| R3
      J -.-> R4
    end
```

**Texto alternativo:** arriba, un JWT con sus tres partes separadas por puntos: cabecera con alg RS256 y kid, claims con
iss, sub ana, aud pedidos y exp, y la firma. Abajo a la izquierda, HS256: el emisor firma con un secreto K y los
servicios A y B verifican con el mismo K, por lo que B también podría emitir tokens. Abajo a la derecha, RS256: el
emisor firma con su clave privada y los servicios A y B verifican solo con la clave pública, que obtienen de un endpoint
JWKS que publica las claves por su identificador kid.

#### 6. EXPLICACIÓN NIVEL 0

Un **JWT** (JSON Web Token) es una credencial en texto: tres trozos separados por puntos. El primero dice cómo se firmó,
el segundo dice **quién eres y hasta cuándo vale** (los *claims*) y el tercero es la **firma**, que demuestra que nadie
cambió los dos primeros. Los dos primeros solo están codificados, **no cifrados**: cualquiera puede leerlos (por eso
nunca pongas datos secretos ahí). Hay dos maneras de firmar: con **un secreto compartido** (HS256: el mismo secreto
firma y verifica) o con **un par de claves** (RS256: la privada firma, la pública verifica).

#### 7. EXPLICACIÓN INTERMEDIA

- **Estructura.** `base64url(cabecera) + "." + base64url(claims) + "." + base64url(firma)`. La firma se calcula sobre los
  dos primeros trozos **tal como están escritos** (RFC 7515). Claims registrados (RFC 7519): `iss` (emisor), `sub`
  (sujeto), `aud` (para quién es), `exp` (vence), `iat` (emitido), `nbf` (no antes de), `jti` (identificador).
- **HS256** = HMAC con SHA-256: firma de 32 bytes. El secreto debe tener al menos 256 bits (32 bytes) para SHA-256 (RFC
  7518 §3.2); un secreto corto se adivina sin conexión probando un diccionario contra un token capturado.
- **RS256** = RSASSA-PKCS1-v1_5 con SHA-256: con RSA 2048 la firma mide 256 bytes. El emisor publica sus claves públicas
  en un **JWKS** (`/.well-known/jwks.json` o, en Keycloak, `/realms/<realm>/protocol/openid-connect/certs`) y la cabecera
  `kid` dice cuál usar; así puede **rotar** claves sin coordinar a todos los servicios. Alternativas modernas: ES256
  (ECDSA P-256, firmas de 64 bytes) y EdDSA.
- **Validar un JWT** es: (1) aceptar solo el algoritmo que **tú** esperas, nunca el que dice la cabecera; (2) verificar
  la firma; (3) comprobar `exp`/`nbf` (con un pequeño margen de reloj), `iss` y **`aud`**.
- **En Spring.** `NimbusJwtDecoder.withPublicKey(clave).signatureAlgorithm(RS256)` o `withSecretKey(k).macAlgorithm(HS256)`;
  `JwtValidators.createDefaultWithIssuer(iss)` añade `exp`/`nbf` + `iss`, y un `JwtClaimValidator` comprueba `aud`. El
  filtro `BearerTokenAuthenticationFilter` lee `Authorization: Bearer...` y, si falla, responde `401` con
  `WWW-Authenticate: Bearer error="invalid_token",...`. Por defecto `NimbusJwtDecoder` solo confía en RS256.

#### 8. EXPLICACIÓN MAESTRA

| Criterio | HS256 (simétrica) | RS256 / ES256 (asimétrica) |
|---|---|---|
| Quién puede emitir | Todo el que tenga el secreto | Solo quien tenga la clave privada |
| Distribución de la clave | Secreto en cada servicio (Vault, F068): un servicio comprometido puede **forjar** tokens para todos | Clave pública sin riesgo; JWKS con caché |
| Rotación | Coordinada: todos a la vez | Con `kid`: publicas la nueva, firmas con ella y retiras la vieja después de `exp` |
| Coste | Muy barato | Verificar RS256 es barato; firmar es más caro (lo hace solo el emisor). ES256 da firmas más cortas |
| Cuándo | Un único servicio que emite y verifica sus propios tokens (p. ej. enlaces firmados) | Cualquier sistema con varios servicios o un proveedor de identidad (Keycloak) |

**Por qué JWT y no sesiones.** Un JWT se verifica sin llamar a nadie (escala bien, funciona entre servicios), pero **no
se puede revocar** antes de `exp`: por eso los *access tokens* duran minutos (Keycloak: 5 min por defecto en este realm)
y se complementan con *refresh tokens*. Alternativas: **tokens opacos + introspección** (RFC 7662), revocables al
instante a costa de una llamada al servidor de autorización por petición (o caché); **sesiones** con cookie para
aplicaciones web monolíticas, más simples y revocables.

**Cuándo NO usar JWT:** para guardar el carrito o permisos que cambian cada minuto (el token crece y queda obsoleto);
para sesiones de navegador de larga duración guardadas en `localStorage` (cualquier XSS las roba: usa cookies
`HttpOnly` con el patrón BFF del Módulo 7). Y nunca «cifres» datos poniéndolos en un JWT firmado: firmado no es
cifrado (para eso existe JWE).

#### 9. CÓDIGO EJECUTABLE

**Versiones:** JDK 25 LTS (la demostración solo usa `javax.crypto` y `java.security`) · Spring Boot 4.1.3 ·
`spring-boot-starter-security-oauth2-resource-server` (Spring Security 7.1.3 con Nimbus JOSE + JWT) ·
`spring-boot-starter-webmvc`. Comprobación cruzada del token HS256 con PyJWT 2.15.0.

**Antes (vulnerable)** — `jdk/JwtFirmas.java`: el verificador lee el algoritmo **del propio token**:

```java
// ANTES (vulnerable): confía en el "alg" que manda el propio token.
static boolean verificadorIngenuo(String jwt, PublicKey publica) throws Exception {
    String[] p = jwt.split("\\.", -1);
    String alg = campo(texto(p[0]), "alg");
    String datos = p[0] + "." + p[1];
    return switch (alg) {
        case "none" -> true;                                              // ¡acepta sin firma!
        case "HS256" -> MessageDigest.isEqual(D64.decode(p[2]), hmac(publica.getEncoded(), datos)); // ¡clave pública como secreto!
        case "RS256" -> {
            Signature s = Signature.getInstance("SHA256withRSA");
            s.initVerify(publica);
            s.update(datos.getBytes(StandardCharsets.US_ASCII));
            yield s.verify(D64.decode(p[2]));
        }
        default -> false;
    };
}
```

La clave pública es pública: si el verificador acepta HS256 y usa esa clave como secreto HMAC, el atacante firma lo que
quiera con ella. Otro «antes» frecuente en Spring: leer los claims sin verificar, con
`JWTParser.parse(token).getJWTClaimsSet()` de Nimbus, «porque el gateway ya lo validó».

**Después (seguro)** — el algoritmo lo fija el servidor y se validan `iss`, `aud` y `exp`:

```java
// DESPUÉS (seguro): el algoritmo lo fija el servidor, no el token; luego valida iss, aud y exp.
static String verificadorSeguro(String jwt, PublicKey publica, String iss, String aud) throws Exception {
    String[] p = jwt.split("\\.", -1);
    if (p.length != 3) return "rechazado: formato";
    if (!"RS256".equals(campo(texto(p[0]), "alg"))) return "rechazado: alg no permitido";
    Signature s = Signature.getInstance("SHA256withRSA");
    s.initVerify(publica);
    s.update((p[0] + "." + p[1]).getBytes(StandardCharsets.US_ASCII));
    if (p[2].isEmpty() || !s.verify(D64.decode(p[2]))) return "rechazado: firma inválida";
    String claims = texto(p[1]);
    if (!iss.equals(campo(claims, "iss"))) return "rechazado: iss";
    if (!aud.equals(campo(claims, "aud"))) return "rechazado: aud";
    if (Long.parseLong(campo(claims, "exp")) < Instant.now().getEpochSecond()) return "rechazado: expirado";
    return "aceptado sub=" + campo(claims, "sub");
}
```

En Spring (`f062-jwt`), el mismo «después» con las piezas de producción. `f062-jwt/build.gradle.kts` (dependencias; el resto es igual
al de F061):

```kotlin
dependencies {
    // Spring MVC + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // Resource server: valida JWT con Nimbus
    implementation(libs.spring.boot.starter.security.oauth2.resource.server)
    // MockMvc, JUnit Jupiter 6, AssertJ
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // httpBasic(), jwt(), oidcLogin() para MockMvc
    testImplementation(libs.spring.boot.starter.security.test)
    // Pruebas del resource server
    testImplementation(libs.spring.boot.starter.security.oauth2.resource.server.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}
```

`src/main/java/academia/seguridad/jwt/JwtConfig.java`:

```java
package academia.seguridad.jwt;

import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class JwtConfig {

    static final String EMISOR = "https://auth.tienda.local";
    static final String AUDIENCIA = "pedidos";

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(r -> r.anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))   // usa el JwtDecoder de abajo
            .build();
    }

    /** Valida exp/nbf (por defecto), el emisor y que el token sea PARA este servicio. */
    static OAuth2TokenValidator<Jwt> validadores() {
        return new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(EMISOR),
            new JwtClaimValidator<List<String>>("aud", aud -> aud != null && aud.contains(AUDIENCIA)));
    }

    /** RS256 (asimétrica, por defecto): este servicio solo tiene la clave PÚBLICA; no puede emitir tokens. */
    @Bean
    @Profile("!hs256")
    JwtDecoder decoderRs256(@Value("${tienda.jwt.clave-publica}") RSAPublicKey publica) {
        NimbusJwtDecoder d = NimbusJwtDecoder.withPublicKey(publica)
            .signatureAlgorithm(SignatureAlgorithm.RS256)                 // alg fijo: "none" y HS256 se rechazan
            .build();
        d.setJwtValidator(validadores());
        return d;
    }

    /** HS256 (simétrica, perfil hs256): el MISMO secreto verifica y también podría emitir tokens. */
    @Bean
    @Profile("hs256")
    JwtDecoder decoderHs256(@Value("${tienda.jwt.secreto}") String secreto) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("tienda.jwt.secreto debe tener al menos 32 bytes para HS256 (tiene " + bytes.length + ")");
        }
        SecretKey clave = new SecretKeySpec(bytes, "HmacSHA256");
        NimbusJwtDecoder d = NimbusJwtDecoder.withSecretKey(clave).macAlgorithm(MacAlgorithm.HS256).build();
        d.setJwtValidator(validadores());
        return d;
    }
}
```

`src/main/java/academia/seguridad/jwt/PedidosController.java`:

```java
package academia.seguridad.jwt;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PedidosController {

    /** Llega aquí solo si el filtro BearerTokenAuthenticationFilter validó el JWT. */
    @GetMapping("/pedidos/mios")
    Map<String, Object> mios(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("sub", jwt.getSubject(), "alg", jwt.getHeaders().get("alg"), "pedidos", 3);
    }
}
```

`src/main/resources/application.properties` y `application-hs256.properties` (la clase `JwtApp` es la habitual con
`@SpringBootApplication`):

```properties
spring.application.name=f062-jwt
# Clave pública RS256 (formato PEM "BEGIN PUBLIC KEY"); Spring Security la convierte a RSAPublicKey.
tienda.jwt.clave-publica=classpath:claves/publica.pem
```

```properties
# El secreto llega por variable de entorno (Vault en F068); nunca escrito aquí.
tienda.jwt.secreto=${TIENDA_JWT_SECRETO}
```

El par de claves del laboratorio se generó con OpenSSL 3: `openssl genpkey -algorithm RSA -pkeyopt
rsa_keygen_bits:2048 -out privada-solo-pruebas.pem` y `openssl pkey -in privada-solo-pruebas.pem -pubout -out
publica.pem`. La privada vive **solo** en `src/test/resources` porque los tests hacen de emisor; un servicio real nunca
tiene la clave privada del servidor de autorización.

#### 10. MINI-LABORATORIO

1. Ejecuta la demostración (ejecutada con JDK 25.0.5; el par RSA se genera en cada ejecución, el token HS256 es fijo):

```bash
java JwtFirmas.java
```

   **Output esperado:**

```text
HS256 (43 bytes de secreto compartido)
  token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dGgudGllbmRhLmxvY2FsIiwic3ViIjoiYW5hIiwiYXVkIjoicGVkaWRvcyIsImV4cCI6NDEwMjQ0NDgwMH0.6tDsGdXB0_RDBVmFC3tZwoD1LY65ZJQCWZrum12Vf2s
  verificado con el mismo secreto: true
RS256 (RSA 2048, kid=clave-2026-11)
  longitud de la firma: 256 bytes (HS256: 32)
  verificado solo con la clave pública: aceptado sub=ana
ANTES (vulnerable): el verificador lee el alg del token
  alg=none                     -> ACEPTADO (sub=admin)
  HS256 con la clave pública   -> ACEPTADO (sub=admin)
  payload alterado             -> rechazado
DESPUÉS (seguro): alg fijo RS256 + iss + aud + exp
  alg=none                     -> rechazado: alg no permitido
  HS256 con la clave pública   -> rechazado: alg no permitido
  payload alterado             -> rechazado: firma inválida
  token válido para "pagos"    -> rechazado: aud
Secreto HS256 débil adivinado con un diccionario de 5 palabras: "secreto"
OK: HS256 y RS256 verifican; el verificador seguro rechaza los 4 ataques
```

2. Comprueba que el token HS256 es un JWT estándar verificándolo con otra implementación (PyJWT,
   `pip install pyjwt`):

```bash
python3 -c "
import jwt; t = open('target/hs256.jwt').read()
print(jwt.decode(t, 'un-secreto-de-al-menos-32-bytes-para-hs256!', algorithms=['HS256'],
                 audience='pedidos', issuer='https://auth.tienda.local'))"
```

   **Output esperado:** `{'iss': 'https://auth.tienda.local', 'sub': 'ana', 'aud': 'pedidos', 'exp': 4102444800}`.
   Con otro secreto PyJWT lanza `InvalidSignatureError: Signature verification failed`.

3. Lee el token sin verificarlo, para recordar que los claims **no** son secretos:

```bash
java VerToken.java "$(cat target/hs256.jwt)"
```

   **Output esperado:** `cabecera: {"alg":"HS256","typ":"JWT"}`, `sub: "ana"`, `aud: "pedidos"` y
   `exp: 2100-01-01T00:00:00Z (vence en... s)`.

4. **Fallo deliberado:** en `JwtFirmas.java` cambia en `verificadorSeguro` la condición del `alg` por
   `!List.of("RS256", "none").contains(campo(texto(p[0]), "alg"))`. Ejecuta: el programa termina con `FALLA: 1`
   porque `alg=none` llega a la verificación de firma; restaura la línea.

#### 11. VERIFICACIÓN

`f062-jwt/src/test/java/academia/seguridad/jwt/Rs256Test.java` (los tokens los emite `FabricaDeTokens`, con la clave
privada de prueba, `NimbusJwtEncoder` y dos tokens de ataque escritos a mano):

```java
package academia.seguridad.jwt;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.startsWith;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class Rs256Test {

    @Autowired MockMvc mvc;

    ResultActions pedir(String token) throws Exception {
        return mvc.perform(get("/pedidos/mios").header("Authorization", "Bearer " + token));
    }

    @Test
    void unTokenRs256ValidoPasa() throws Exception {
        pedir(FabricaDeTokens.rs256("pedidos", Instant.now().plusSeconds(300)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sub").value("ana"))
            .andExpect(jsonPath("$.alg").value("RS256"));
    }

    @Test
    void sinTokenResponde401() throws Exception {
        mvc.perform(get("/pedidos/mios"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", startsWith("Bearer")));
    }

    @Test
    void otraAudienciaResponde401() throws Exception {
        pedir(FabricaDeTokens.rs256("pagos", Instant.now().plusSeconds(300)))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", startsWith("Bearer error=\"invalid_token\"")));
    }

    @Test
    void tokenVencidoResponde401() throws Exception {
        pedir(FabricaDeTokens.rs256("pedidos", Instant.now().minusSeconds(120)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void algNoneSeRechaza() throws Exception {
        pedir(FabricaDeTokens.algNone()).andExpect(status().isUnauthorized());
    }

    @Test
    void confusionDeAlgoritmoSeRechaza() throws Exception {
        pedir(FabricaDeTokens.confusionHs256()).andExpect(status().isUnauthorized());
    }
}
```

`Hs256Test` activa el perfil `hs256` con un secreto de 43 bytes y comprueba que un token firmado con ese secreto pasa
(`alg` = `HS256`) y que uno firmado con otro secreto recibe `401`.

```bash
cd ../f062-jwt && ../gradlew test
```

**Output esperado:** 8 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.

**Pregunta de comprobación:** el equipo de pagos pide «el secreto del JWT» para validar los tokens de usuarios. Si los
tokens son HS256, ¿qué riesgo nuevo aparece? ¿Y si fueran RS256?

<details>
<summary>Respuesta</summary>

Con HS256 pagos recibiría el mismo secreto que firma: si pagos se ve comprometido, el atacante puede **emitir** tokens
válidos para todos los servicios (por ejemplo `sub=admin`). Con RS256 solo hace falta la clave pública (o la URL del
JWKS): pagos puede verificar, pero no emitir.
</details>

#### 12. ERROR COMÚN

**Síntoma:** después de que el servidor de autorización **rota** su clave, todas las peticiones responden `401` durante
un rato, o el servicio no arranca con un secreto HS256 «de prueba».

**Cómo se ve:** en el primer caso, `curl -i` muestra `WWW-Authenticate: Bearer error="invalid_token",
error_description="An error occurred while attempting to decode the Jwt:..."` y el texto menciona que no hay una clave
que coincida con el `kid`. En el segundo, el arranque de `f062-jwt` con `TIENDA_JWT_SECRETO=secreto` y el perfil `hs256`
falla con `IllegalStateException: tienda.jwt.secreto debe tener al menos 32 bytes para HS256 (tiene 7)`; PyJWT avisa lo
mismo (ejecutado aquí): `InsecureKeyLengthWarning: The HMAC key is 7 bytes long, which is below the minimum recommended
length of 32 bytes for SHA256. See RFC 7518 Section 3.2.`

**Diagnóstico:** decodifica la cabecera del token (`java VerToken.java "$TOKEN"`) y compara su `kid` con los de la JWKS
(`curl -s.../certs | jq '.keys[].kid'`). Si el servicio tiene la clave pública **fija** (`public-key-location`), no se
entera de la rotación.

**Arreglo:** en producción usa `issuer-uri` o `jwk-set-uri` (Spring descarga y cachea la JWKS y la vuelve a pedir ante
un `kid` desconocido) y pide al emisor que publique la clave nueva **antes** de empezar a firmar con ella. Para HS256,
genera el secreto con `openssl rand -base64 48` y guárdalo en Vault.

#### 13. PREGUNTA DE ENTREVISTA

«¿HS256 o RS256 para los tokens de una plataforma de 30 microservicios? ¿Qué validas en cada servicio?»

**Respuesta modelo:** RS256 (o ES256). Con HS256 los 30 servicios tendrían el secreto que firma, así que cualquiera de
ellos comprometido podría forjar tokens para los demás, y rotarlo exige coordinar a todos. Con firmas asimétricas solo el
servidor de autorización tiene la clave privada; los servicios descargan la JWKS, la cachean y rotan por `kid` sin
coordinación. En cada servicio valido: algoritmo fijado por configuración (nunca el de la cabecera, para evitar `alg:
none` y la confusión RS→HS), firma, `exp`/`nbf` con poco margen de reloj, `iss` exacto y `aud` igual a mi servicio. No
guardo en el token datos sensibles ni que cambien a menudo, y mantengo los access tokens cortos porque no se pueden
revocar.

#### 14. ANTI-PATRÓN RELACIONADO

**Decodificar sin verificar «porque el gateway ya validó»:**

```java
@GetMapping("/pedidos/mios")
List<Pedido> mios(@RequestHeader("Authorization") String auth) throws Exception {
    // Lee los claims SIN comprobar firma, exp ni aud: cualquiera que llegue a este puerto es "ana"
    String sub = JWTParser.parse(auth.substring(7)).getJWTClaimsSet().getSubject();
    return repositorio.porCliente(sub);
}
```

Si alguien alcanza el servicio sin pasar por el gateway (otro pod, un puerto expuesto, una SSRF), le basta con escribir
un JSON con `"sub":"otro-cliente"`. Cada servicio valida su token completo (defensa en profundidad) con su
`JwtDecoder` configurado.

---
### OAuth2 y OIDC

#### 1. UBICACIÓN

Módulo 9, Lección 3 de 9 · Fase 1 · 2,5 h
`f063-oauth2-oidc`.

#### 2. PRERREQUISITOS

- F062: JWT, firma RS256, claims `iss`, `aud`, `exp`.
- Módulo 0.4: redirecciones HTTP (`302` + cabecera `Location`) y parámetros de *query string*.
- Idea de hash SHA-256 (F062).

#### 3. OBJETIVO DE APRENDIZAJE

**Distinguir** OAuth2 (autorización delegada: *access token* para una API) de OIDC (autenticación: *id_token* para el
cliente), **ejecutar** el flujo *Authorization Code* con PKCE paso a paso y **demostrar** que sin PKCE un `code`
interceptado da tokens al atacante y con PKCE no; después, **configurar** `oauth2Login` en Spring y comprobar con 3 tests
que la redirección lleva `state`, `nonce` y `code_challenge`.

#### 4. ANALOGÍA VISUAL

El **valet parking de un hotel**. No le das al aparcacoches la llave maestra de tu vida (tu contraseña): la recepción
(el servidor de autorización) le entrega una **llave de valet** que solo enciende el carro y no abre la guantera
(*access token* con *scopes*). Para recogerla, recepción no le da la llave directamente: le da un **tiquete numerado**
(`code`) que se canjea en el mostrador. **PKCE** es que, al pedir el tiquete, el aparcacoches dejó en recepción **la mitad
de una foto rota**; al canjear debe mostrar la **otra mitad**: si alguien le roba el tiquete por el camino, no tiene la
otra mitad. **OIDC** añade una **tarjeta de identidad** sellada por recepción (*id_token*) que le dice al hotel quién es
el huésped. El dibujo: huésped, recepción, aparcacoches con un tiquete y media foto, un ladrón con el tiquete pero sin la
otra mitad, rechazado en el mostrador.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant U as Navegador de ana
    participant C as Cliente (tienda-web, Spring)
    participant AS as Servidor de autorización (Keycloak)
    participant API as API pedidos
    U->>C: GET /yo
    C->>C: genera state, nonce, code_verifier<br/>code_challenge = BASE64URL(SHA256(verifier))
    C-->>U: 302 a /auth?response_type=code&client_id&redirect_uri<br/>&scope=openid&state&nonce&code_challenge&code_challenge_method=S256
    U->>AS: login + consentimiento
    AS-->>U: 302 a redirect_uri?code=...&state=...
    U->>C: GET /login/oauth2/code/keycloak?code&state
    C->>C: ¿state coincide?
    C->>AS: POST /token code + code_verifier + client_secret
    AS->>AS: SHA256(code_verifier) == code_challenge
    AS-->>C: access_token + id_token (+ refresh_token)
    C->>C: valida id_token: firma, iss, aud=tienda-web, exp, nonce
    C->>API: Authorization: Bearer access_token
```

**Texto alternativo:** diagrama de secuencia del flujo Authorization Code con PKCE y OIDC. El navegador de ana pide /yo
al cliente tienda-web. El cliente genera state, nonce y un code_verifier, calcula el code_challenge como el SHA-256 en
Base64URL del verifier y redirige al navegador al endpoint de autorización de Keycloak con esos parámetros. Ana inicia
sesión y Keycloak redirige de vuelta al cliente con un code y el mismo state. El cliente comprueba el state y canjea el
code en el endpoint de token enviando el code_verifier y su secreto; Keycloak comprueba que el hash del verifier coincide
con el challenge y responde con access_token e id_token. El cliente valida el id_token (firma, emisor, audiencia,
expiración y nonce) y usa el access_token para llamar a la API de pedidos.

#### 6. EXPLICACIÓN NIVEL 0

**OAuth2** resuelve esto: una aplicación quiere actuar en tu nombre (ver tus pedidos) **sin conocer tu contraseña**. Tú
inicias sesión en un servidor de confianza (Keycloak, Google…), aceptas lo que la app pide (los *scopes*, como
`pedidos:leer`) y ese servidor le entrega a la app un **access token**: una credencial temporal y limitada para llamar a
la API. **OIDC** (OpenID Connect) es una capa encima de OAuth2 que además le dice a la app **quién eres**, con un segundo
token, el **id_token**. Resumen: OAuth2 = «qué puede hacer esta app por ti»; OIDC = «quién eres».

#### 7. EXPLICACIÓN INTERMEDIA

- **Roles (RFC 6749):** *resource owner* (ana), *client* (la app `tienda-web`), *authorization server* (Keycloak) y
  *resource server* (la API que valida el access token, F062/F064).
- **Flujos (*grants*):** `authorization_code` (usuarios con navegador; el único recomendado para ellos),
  `client_credentials` (servicio a servicio, sin usuario), `refresh_token` (renovar sin volver a pedir login) y
  `urn:ietf:params:oauth:grant-type:token-exchange` (F066). El *implicit* (token en la URL) y el *password* (la app ve tu
  contraseña) están desaconsejados por las buenas prácticas de seguridad de OAuth 2.0 (RFC 9700); Spring Security 7
  eliminó el soporte del *password grant* en el cliente.
- **PKCE (RFC 7636):** el cliente inventa un `code_verifier` aleatorio (43–128 caracteres), envía su hash
  `code_challenge = BASE64URL(SHA256(verifier))` al pedir el `code` y el `verifier` al canjearlo. Quien robe el `code` (una
  app maliciosa con el mismo esquema de URL, un log de proxy) no puede canjearlo. Obligatorio para clientes públicos
  (SPA, móvil) y recomendado también para confidenciales.
- **`state`** une la respuesta con la petición que la originó (anti-CSRF del login). **`nonce`** viaja dentro del
  id_token y une el token con la sesión del navegador (anti-reproducción).
- **id_token (OIDC Core):** un JWT para el **cliente** (`aud` = `client_id`), con `sub`, `iss`, `exp`, `nonce` y datos
  del usuario (`preferred_username`, `email` si se pide el scope). El cliente lo valida; **no** se envía a las APIs. El
  access token sí va a las APIs (`aud` = la API).
- **Descubrimiento:** `GET {issuer}/.well-known/openid-configuration` devuelve los endpoints (`authorization_endpoint`,
  `token_endpoint`, `jwks_uri`, `userinfo_endpoint`). En Spring, `issuer-uri` lo usa.
- **En Spring:** `oauth2Login()` añade `OAuth2AuthorizationRequestRedirectFilter` (arma la redirección y guarda `state`,
  `nonce` y `code_verifier` en la sesión) y `OAuth2LoginAuthenticationFilter` (atiende `/login/oauth2/code/{id}`, canjea
  el code y valida el id_token). `OAuth2AuthorizationRequestCustomizers.withPkce()` fuerza PKCE en clientes confidenciales.

#### 8. EXPLICACIÓN MAESTRA

| Patrón para una SPA o app móvil | Ventajas | Riesgos | Cuándo |
|---|---|---|---|
| **BFF** (el backend es el cliente OAuth2 y guarda los tokens; el navegador solo tiene una cookie `HttpOnly`) | Los tokens nunca llegan a JavaScript; el secreto del cliente queda en el servidor | Un componente más con estado (sesión) | Recomendado para aplicaciones web (Módulo 7) |
| **Cliente público con PKCE** en el navegador | Sin backend propio | Tokens en memoria del navegador: un XSS los roba | SPAs sin backend, con access tokens muy cortos |
| **Cliente nativo con PKCE** + navegador del sistema | Estándar para móviles (RFC 8252) | Esquemas de URL interceptables (por eso PKCE) | Apps iOS/Android |

**OAuth2 no es autenticación.** Un access token prueba que *alguien* autorizó a *algún* cliente, no quién está frente a
la app. Usar «si tengo un access token, el usuario inició sesión» abre ataques de sustitución de token (un token emitido
para otra app y reutilizado en la tuya). Para iniciar sesión usa OIDC y valida el id_token con `aud` = tu `client_id`.

**Alternativas:** SAML 2.0 (XML, corporativo, solo navegador; Spring tiene `saml2Login`), sesiones locales con usuario y
contraseña (F061, sin federación) y *passkeys*/WebAuthn (sin contraseña; Keycloak 26 las soporta como factor de login, y
siguen terminando en un id_token).

**Cuándo NO:** una herramienta interna con cinco usuarios y un único servicio no necesita un servidor de autorización:
HTTP Basic sobre TLS o formulario con sesión (F061) bastan. OAuth2 compensa cuando hay varias aplicaciones, terceros o
inicio de sesión único.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** JDK 25 LTS (la demostración levanta un servidor de autorización mínimo con `com.sun.net.httpserver`) ·
Spring Boot 4.1.3 · `spring-boot-starter-security-oauth2-client` (Spring Security 7.1.3) · `spring-boot-starter-webmvc` ·
Keycloak 26.8.2 para el login real.

**Antes (vulnerable)** — `jdk/OAuthPkce.java`, cliente sin PKCE ni `state`: el `code` basta para obtener tokens:

```java
System.out.println("ANTES (vulnerable): Authorization Code sin PKCE ni state");
Map<String, String> vuelta = irAAutorizar(as, "response_type=code&client_id=" + cliente
        + "&redirect_uri=" + enc(redirect) + "&scope=openid");
String robado = vuelta.get("code");
System.out.println("  un atacante intercepta la redirección y lee code=" + robado.substring(0, 6) + "…");
var rob = canjear(as, "grant_type=authorization_code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
        + "&code=" + robado);
System.out.println("  el atacante canjea el code -> HTTP " + rob.statusCode() + " con access_token: "
        + (campo(rob.body(), "access_token") != null));
```

**Después (seguro)** — el mismo archivo con PKCE S256, `state` y `nonce`, y el servidor que comprueba el verifier:

```java
// Cliente: verifier aleatorio, challenge = BASE64URL(SHA-256(verifier))
String verifier = aleatorio(32), state = aleatorio(16), nonce = aleatorio(16);
String challenge = s256(verifier);
vuelta = irAAutorizar(as, "response_type=code&client_id=" + cliente + "&redirect_uri=" + enc(redirect)
        + "&scope=openid&state=" + enc(state) + "&nonce=" + enc(nonce)
        + "&code_challenge=" + challenge + "&code_challenge_method=S256");
boolean stateOk = state.equals(vuelta.get("state"));

// Servidor de autorización, endpoint /token: el code es de un solo uso y exige el verifier
Codigo c = codigos.remove(f.get("code"));
if (c == null) error = "invalid_grant";
else if (!c.redirectUri().equals(f.get("redirect_uri")) || !c.clientId().equals(f.get("client_id"))) error = "invalid_grant";
else if (c.challenge() != null && (f.get("code_verifier") == null
        || !c.challenge().equals(s256(f.get("code_verifier"))))) error = "invalid_grant";

// Cliente OIDC: valida el id_token antes de dar por iniciada la sesión
if (!ISS.equals(campo(c, "iss"))) return "iss inválido";
if (!clientId.equals(campo(c, "aud"))) return "aud inválido";
if (!nonce.equals(campo(c, "nonce"))) return "nonce inválido";
if (Long.parseLong(campo(c, "exp")) < Instant.now().getEpochSecond()) return "expirado";
```

En Spring (`f063-oauth2-oidc`), el cliente de producción. Dependencias del `build.gradle.kts`: `spring-boot-starter-webmvc`,
`spring-boot-starter-security-oauth2-client` y, para tests, `spring-boot-starter-webmvc-test`,
`spring-boot-starter-security-test` y `spring-boot-starter-security-oauth2-client-test` (padre
`spring-boot-starter-parent` 4.1.3, `java.version` 25).

`src/main/java/academia/seguridad/oidc/SeguridadWeb.java`:

```java
package academia.seguridad.oidc;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SeguridadWeb {

    @Bean
    SecurityFilterChain web(HttpSecurity http, ClientRegistrationRepository registros) throws Exception {
        // PKCE explícito también para el cliente confidencial (con secreto): defensa en profundidad.
        var resolver = new DefaultOAuth2AuthorizationRequestResolver(registros, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());
        return http
            .authorizeHttpRequests(r -> r
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated())
            .oauth2Login(login -> login.authorizationEndpoint(e -> e.authorizationRequestResolver(resolver)))
            .build();
    }
}
```

`src/main/java/academia/seguridad/oidc/CuentaController.java`:

```java
package academia.seguridad.oidc;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CuentaController {

    @GetMapping("/")
    Map<String, String> inicio() { return Map.of("mensaje", "tienda: entra en /yo para iniciar sesión"); }

    /** OIDC: quién inició sesión sale del id_token ya validado (firma, aud, exp, nonce; iss con el perfil keycloak). */
    @GetMapping("/yo")
    Map<String, Object> yo(@AuthenticationPrincipal OidcUser usuario) {
        return Map.of(
            "sub", usuario.getSubject(),
            "usuario", usuario.getPreferredUsername(),
            "emisor", usuario.getIssuer().toString());
    }
}
```

`src/main/resources/application.yml` (y `application-keycloak.yml`, que añade
`spring.security.oauth2.client.provider.keycloak.issuer-uri: ${tienda.realm}` para que Spring descubra los endpoints y
exija el `iss` exacto):

```yaml
spring:
  application:
    name: f063-oauth2-oidc
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: tienda-web
            client-secret: ${TIENDA_WEB_SECRETO:solo-dev-tienda-web}   # en producción: Vault (F068)
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope: openid,profile,pedidos:leer
        provider:
          keycloak:
            # Endpoints del realm "tienda" del laboratorio (Keycloak en :8180), escritos a mano.
            # Con issuer-uri Spring los descubriría en /.well-known/openid-configuration, pero
            # exigiría Keycloak encendido al arrancar (y en los tests).
            authorization-uri: ${tienda.realm}/protocol/openid-connect/auth
            token-uri: ${tienda.realm}/protocol/openid-connect/token
            jwk-set-uri: ${tienda.realm}/protocol/openid-connect/certs
            user-info-uri: ${tienda.realm}/protocol/openid-connect/userinfo
            user-name-attribute: preferred_username
tienda:
  realm: ${KEYCLOAK_REALM_URL:http://localhost:8180/realms/tienda}
server:
  port: 8080
```

#### 10. MINI-LABORATORIO

1. Recorre el flujo completo en memoria (ejecutado con JDK 25.0.5; el `code` y el `code_challenge` son aleatorios en
   cada ejecución):

```bash
java OAuthPkce.java
```

   **Output esperado:**

```text
ANTES (vulnerable): Authorization Code sin PKCE ni state
  un atacante intercepta la redirección y lee code=kr1i0l…
  el atacante canjea el code -> HTTP 200 con access_token: true
DESPUÉS (seguro): PKCE S256 + state + nonce + validación del id_token
  S256 coincide con el vector de prueba del RFC 7636 (apéndice B): true
  code_verifier (secreto del cliente, 43 caracteres) -> code_challenge=c70FHFZON3…
  state devuelto coincide: true
  atacante con el code pero sin el verifier -> HTTP 400 {"error":"invalid_grant"}
  cliente legítimo con el verifier -> HTTP 200
  id_token (OIDC, para el cliente): válido: sub=ana name=Ana Ruiz
  mismo id_token en otra sesión: nonce inválido
  access_token (OAuth2, para la API): aud=api-pedidos scope="openid pedidos:leer"
OK: sin PKCE el code robado sirve; con PKCE no, y el id_token se valida
```

2. Levanta Keycloak y mira el documento de descubrimiento del realm:

```bash
docker compose up -d --wait keycloak
curl -s localhost:8180/realms/tienda/.well-known/openid-configuration \
  | jq '{issuer, authorization_endpoint, token_endpoint, jwks_uri, code_challenge_methods_supported}'
```

   **Output esperado:** `issuer` = `http://localhost:8180/realms/tienda`, los endpoints bajo
   `/realms/tienda/protocol/openid-connect/` (`auth`, `token`, `certs`) y una lista de métodos PKCE que incluye `"S256"`.

3. Inicia sesión de verdad con Spring:

```bash
cd f063-oauth2-oidc
../gradlew -q bootRun --args='--spring.profiles.active=keycloak'
```

   Abre `http://localhost:8080/yo` en el navegador, entra con `ana` / `clave-demo`.

   **Output esperado:** el navegador muestra `{"sub":"<uuid de ana>","usuario":"ana","emisor":"http://localhost:8180/realms/tienda"}`.

   **Captura comentada:** en las herramientas de desarrollo (pestaña Red, «Conservar registro») verás tres saltos: `302`
   de `/yo` a `/oauth2/authorization/keycloak`, `302` a `localhost:8180/.../auth?response_type=code&...&code_challenge=...`
   y, tras el login, `302` de Keycloak a `/login/oauth2/code/keycloak?state=...&code=...`. El `code` aparece en la URL;
   los tokens, nunca.

4. **Fallo deliberado:** en `OAuthPkce.java` cambia `validarIdToken(..., cliente, nonce)` por
   `validarIdToken(..., "otra-app", nonce)`: el programa imprime `id_token (OIDC, para el cliente): aud inválido` y termina
   con `FALLA: 1`. Es el ataque de sustitución: un id_token emitido para otra aplicación.

#### 11. VERIFICACIÓN

`f063-oauth2-oidc/src/test/java/academia/seguridad/oidc/OidcLoginTest.java` (no necesita Keycloak: los endpoints están en
`application.yml` y el test no los llama):

```java
package academia.seguridad.oidc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.test.web.servlet.MockMvc;

/** No necesita Keycloak: los endpoints del proveedor están escritos en application.yml y aquí no se llaman. */
@SpringBootTest
@AutoConfigureMockMvc
class OidcLoginTest {

    @Autowired MockMvc mvc;

    @Test
    void sinSesionTeMandaAlProveedor() throws Exception {
        mvc.perform(get("/yo"))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("/oauth2/authorization/keycloak"));
    }

    @Test
    void laRedireccionAlProveedorLlevaStateNonceYPkce() throws Exception {
        String destino = mvc.perform(get("/oauth2/authorization/keycloak"))
            .andExpect(status().isFound())
            .andReturn().getResponse().getRedirectedUrl();
        Map<String, String> q = UriComponentsBuilder.fromUriString(destino).build().getQueryParams().toSingleValueMap();
        assertThat(destino).startsWith("http://localhost:8180/realms/tienda/protocol/openid-connect/auth");
        assertThat(q).containsEntry("response_type", "code")
            .containsEntry("client_id", "tienda-web")
            .containsEntry("code_challenge_method", "S256")
            .containsKeys("state", "nonce", "code_challenge");
        assertThat(q.get("scope")).contains("openid");
    }

    @Test
    void conSesionOidcDevuelveLaIdentidadDelIdToken() throws Exception {
        mvc.perform(get("/yo").with(oidcLogin().idToken(t -> t
                .subject("1b9e-ana").claim("preferred_username", "ana").issuer("http://localhost:8180/realms/tienda"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario").value("ana"))
            .andExpect(jsonPath("$.sub").value("1b9e-ana"));
    }
}
```

```bash
../gradlew test
```

**Output esperado:** 3 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.

**Pregunta de comprobación:** ¿qué token envía la app `tienda-web` a la API de pedidos y cuál usa para saber que quien
inició sesión es ana? ¿Por qué no al revés?

<details>
<summary>Respuesta</summary>

A la API le envía el **access token** (su `aud` es la API y lleva los scopes). Para saber quién inició sesión usa el
**id_token**, cuyo `aud` es `tienda-web` y que trae el `nonce` de esta sesión. Al revés fallaría la validación de `aud`
(o, peor, una API que aceptara id_tokens aceptaría tokens emitidos para cualquier cliente).
</details>

#### 12. ERROR COMÚN

**Síntoma:** después de iniciar sesión en Keycloak, el navegador muestra una página de error de Keycloak en lugar de
volver a la aplicación.

**Cómo se ve:** Keycloak responde con la pantalla «We are sorry... Invalid parameter: redirect_uri» y en su log
(`docker compose logs keycloak`) aparece un `WARN` de tipo `LOGIN_ERROR` con `error="invalid_redirect_uri"` y el
`redirect_uri` recibido.

**Diagnóstico:** el `redirect_uri` que envía Spring (`{baseUrl}/login/oauth2/code/{registrationId}`) debe coincidir
**exactamente** con uno de los `redirectUris` del cliente en Keycloak. Diferencias típicas: `127.0.0.1` frente a
`localhost`, otro puerto, `http` frente a `https` detrás de un proxy, o un `registrationId` distinto de `keycloak`.

**Arreglo:** compara el parámetro `redirect_uri` de la URL de autorización (pestaña Red) con
`keycloak/tienda-realm.json` → `"redirectUris": ["http://localhost:8080/login/oauth2/code/keycloak"]`. Detrás de un proxy
TLS configura `server.forward-headers-strategy=framework` para que `{baseUrl}` salga con `https`. Nunca uses comodines
amplios (`*`) en `redirectUris`: convierten el servidor en un redirector abierto que entrega `code` a cualquiera.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué diferencia hay entre OAuth2 y OpenID Connect, y por qué se recomienda PKCE incluso para clientes con secreto?»

**Respuesta modelo:** OAuth2 es un marco de autorización delegada: un cliente obtiene un access token con scopes para
llamar a una API en nombre del usuario, sin conocer su contraseña. No define cómo saber quién es el usuario. OIDC añade
autenticación: el id_token, un JWT para el cliente con `sub`, `iss`, `aud` igual al `client_id` y `nonce`, más el
descubrimiento y el endpoint `userinfo`. PKCE liga el canje del `code` a quien inició el flujo mediante un verifier
secreto y su hash: protege contra la interceptación del `code` y contra la inyección de un `code` robado en otra sesión.
Un secreto de cliente no evita la inyección de código, por eso las buenas prácticas actuales (RFC 9700) recomiendan
PKCE para todos los clientes, además de `state` y `nonce`.

#### 14. ANTI-PATRÓN RELACIONADO

**Flujo implícito con el token en la URL y guardado en `localStorage`:**

```javascript
// Antiguo "implicit flow": el access token vuelve en el fragmento de la URL
location.href = `${keycloak}/auth?response_type=token&client_id=spa&redirect_uri=${origen}`;
// ...y al volver:
const token = new URLSearchParams(location.hash.slice(1)).get("access_token");
localStorage.setItem("token", token);   // cualquier script inyectado (XSS) lo lee y lo envía fuera
```

El token queda en el historial del navegador, en extensiones y en `localStorage`, sin PKCE ni posibilidad de cliente
confidencial. Usa *Authorization Code* + PKCE y, en aplicaciones web, el patrón BFF: los tokens se quedan en el servidor
y el navegador solo recibe una cookie `HttpOnly; Secure; SameSite`.

---
### Keycloak

#### 1. UBICACIÓN

Módulo 9, Lección 4 de 9 · Fase 1 · 2 h
`VerToken.java` y `f064-keycloak`.

#### 2. PRERREQUISITOS

- F062 (JWT, JWKS, `kid`) y F063 (OAuth2, OIDC, clientes públicos y confidenciales).
- Módulo 0.5: Docker Compose (`up -d --wait`, `logs`, `down`).
- F061: `hasRole`, 401 frente a 403.

#### 3. OBJETIVO DE APRENDIZAJE

**Levantar** Keycloak 26.8.2 con un realm versionado en JSON (roles, clientes, scopes y usuarios), **obtener** un token
real con `curl`, **leer** sus claims (`iss`, `aud`, `realm_access.roles`) y **conectar** un resource server de Spring que
convierte esos roles en autoridades, comprobado con 6 tests y con `curl` contra el Keycloak real (`200`, `403`, `401`).

#### 4. ANALOGÍA VISUAL

La **oficina de pasaportes** de una ciudad. Cada país es un **realm** con sus propias leyes: sus ciudadanos (usuarios),
sus cargos (roles) y la lista de **embajadas autorizadas** a pedir pasaportes (clientes). La oficina tiene un **sello
oficial** cuya forma se publica en un cartel a la entrada (JWKS) para que cualquier frontera compruebe los pasaportes
sin llamar a la oficina. En el dibujo: un edificio con el letrero «realm tienda», ventanillas para ana, sofía y root,
un cartel con el sello público y, a lo lejos, un puesto fronterizo (el servicio Spring) comparando el sello del
pasaporte con la foto del cartel y leyendo el cargo escrito en la página de «roles».

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    subgraph KC["Keycloak 26.8.2 · realm tienda (:8180)"]
      U["Usuarios<br/>ana · sofia · root"] --- R["Roles del realm<br/>cliente · soporte · admin"]
      C["Clientes<br/>tienda-web · tienda-cli<br/>pedidos · pagos"] --- S["Client scopes<br/>basic · profile · roles<br/>pedidos:leer ... (mapper aud)"]
      K["Claves RS256<br/>/protocol/openid-connect/certs"]
    end
    CLI["curl (tienda-cli)"] -->|"POST /token"| KC
    KC -->|"access_token<br/>iss, aud=pedidos,<br/>realm_access.roles"| CLI
    CLI -->|"Bearer"| API["f064-keycloak (:8081)<br/>RolesDeKeycloak → ROLE_cliente"]
    API -.->|"1ª petición: descubre<br/>y cachea la JWKS"| K
```

**Texto alternativo:** a la izquierda, Keycloak 26.8.2 con el realm tienda en el puerto 8180: usuarios ana, sofia y root
asociados a los roles del realm cliente, soporte y admin; clientes tienda-web, tienda-cli, pedidos y pagos asociados a
client scopes (basic, profile, roles y los scopes de pedidos con un mapper de audiencia), y las claves RS256 publicadas en
el endpoint certs. curl, como cliente tienda-cli, pide un token en /token y recibe un access token con iss, aud pedidos y
realm_access.roles. curl llama con ese token al servicio f064-keycloak en el puerto 8081, que convierte los roles en
ROLE_cliente; en la primera petición el servicio descubre y cachea la JWKS de Keycloak.

#### 6. EXPLICACIÓN NIVEL 0

**Keycloak** es un programa gratuito (de la CNCF) que hace de **servidor de identidad**: guarda los usuarios y sus
contraseñas, muestra la pantalla de login, emite los tokens de F062/F063 y publica las claves para verificarlos. Así tus
microservicios **no guardan contraseñas** ni tienen pantallas de login: solo comprueban tokens. Todo se organiza en
**realms** (espacios separados, como «tienda»), y dentro de cada uno defines **usuarios**, **roles** y **clientes** (las
aplicaciones que pueden pedir tokens).

#### 7. EXPLICACIÓN INTERMEDIA

- **Arranque en desarrollo:** `start-dev` usa una base H2 en memoria, HTTP sin TLS y caché local; `--import-realm` lee
  los JSON de `/opt/keycloak/data/import/` al iniciar. El administrador inicial se crea con
  `KC_BOOTSTRAP_ADMIN_USERNAME`/`KC_BOOTSTRAP_ADMIN_PASSWORD`. `--health-enabled=true` publica `/health/ready` en el
  puerto de gestión **9000**.
- **Endpoints del realm** (`/realms/tienda/protocol/openid-connect/...`): `auth`, `token`, `certs` (JWKS), `userinfo`,
  `logout`; y `/realms/tienda/.well-known/openid-configuration`.
- **Clientes:** confidencial (con secreto: `tienda-web`, `pedidos`) o público (sin secreto: `tienda-cli`). Se activa por
  cliente cada flujo: *standard flow* (authorization code), *direct access grants* (password, **solo laboratorio**),
  *service accounts* (client credentials) y *standard token exchange* (F066).
- **Client scopes y mappers:** deciden qué claims lleva el token. En este realm, `basic` añade `sub`, `profile` añade
  `preferred_username`, `roles` añade `realm_access.roles` y cada `pedidos:*` añade `pedidos` al `aud` (mapper
  `oidc-audience-mapper`). Un scope por defecto va siempre; uno opcional, solo si el cliente lo pide en `scope=`.
- **`iss`:** en `start-dev` sin `hostname`, Keycloak arma el emisor con la URL por la que lo llamaste; si los servicios
  validan `http://localhost:8180/realms/tienda`, pide los tokens por esa misma URL (en producción fija `--hostname`).
- **En Spring:** `spring.security.oauth2.resourceserver.jwt.issuer-uri` hace que Spring descubra la JWKS **la primera vez
  que la necesita** (el servicio arranca aunque Keycloak esté apagado) y valide `iss`; `...jwt.audiences=pedidos` añade la
  validación de `aud`. Los roles de Keycloak no están en `scope`, así que hace falta un conversor propio.

#### 8. EXPLICACIÓN MAESTRA

| Opción | A favor | En contra | Cuándo |
|---|---|---|---|
| **Keycloak** (autoalojado, Apache 2.0) | Gratis, OIDC/SAML completos, federación LDAP, token exchange, personalizable | Lo operas tú: base de datos, alta disponibilidad, actualizaciones | Plataformas propias, requisitos de residencia de datos |
| **IdP gestionado** (Auth0/Okta, Entra ID, Cognito) | Sin operación, cumplimiento listo | Coste por usuario activo, dependencia del proveedor | Productos B2C/B2B sin equipo de plataforma |
| **Spring Authorization Server** | Embebido en Spring, total control | Construyes login, MFA, administración | Necesidades muy específicas o productos que *son* un IdP |

**Producción:** `start` (no `start-dev`) con PostgreSQL, `--hostname` fijo, TLS, al menos dos réplicas con caché
distribuida, el realm como código (este JSON o `keycloak-config-cli`) y copias de seguridad. Mantén los access tokens
cortos (5 min aquí) y los roles **gruesos**; los permisos finos de negocio (dueño del pedido) van en el servicio.

**Cuándo NO:** si solo necesitas que tus propios servicios se reconozcan entre sí, usa mTLS de la malla (F067) o
client credentials de un IdP gestionado; montar Keycloak para un único servicio interno es operar una pieza crítica sin
necesidad.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** Keycloak 26.8.2 (`quay.io/keycloak/keycloak:26.8.2`) · JDK 25 LTS · Spring Boot 4.1.3 ·
`spring-boot-starter-security-oauth2-resource-server` (Spring Security 7.1.3) · Docker Compose v5.

**Antes (vulnerable)** — cada servicio con su tabla de usuarios y su propio login, contraseñas en texto plano y roles
consultados en la base en cada petición:

```java
// ANTES: login propio en cada microservicio
@PostMapping("/login")
Map<String, String> login(@RequestParam String usuario, @RequestParam String clave) {
    var u = jdbc.queryForMap("SELECT clave, rol FROM usuarios WHERE nombre = ?", usuario);
    if (!clave.equals(u.get("clave"))) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);  // texto plano
    return Map.of("token", Base64.getEncoder().encodeToString((usuario + ":" + u.get("rol")).getBytes())); // sin firma
}
```

**Después (seguro)** — identidad centralizada en Keycloak y servicios que solo validan. `docker-compose.yml` del
laboratorio (extracto):

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.8.2
    command: ["start-dev", "--import-realm", "--health-enabled=true"]
    environment:
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin-solo-dev
    ports: ["8180:8080"]
    volumes:
      - ./keycloak/tienda-realm.json:/opt/keycloak/data/import/tienda-realm.json:ro
    healthcheck:
      # La imagen no trae curl: se usa /dev/tcp de bash contra el puerto de gestión 9000.
      test: ["CMD-SHELL", "exec 3<>/dev/tcp/127.0.0.1/9000 && printf 'GET /health/ready HTTP/1.1\\r\\nHost: localhost\\r\\nConnection: close\\r\\n\\r\\n' >&3 && grep -q UP <&3"]
      interval: 5s
      timeout: 5s
      retries: 40
```

`keycloak/tienda-realm.json` (extracto: un client scope con su mapper de audiencia, el cliente de laboratorio y un
usuario; el archivo completo define también `basic`, `profile`, `roles`, los clientes `tienda-web`, `pedidos` y `pagos`
y los usuarios `sofia` y `root`):

```json
{
  "realm": "tienda",
  "enabled": true,
  "accessTokenLifespan": 300,
  "roles": { "realm": [ { "name": "cliente" }, { "name": "soporte" }, { "name": "admin" } ] },
  "clientScopes": [
    {
      "name": "pedidos:leer",
      "protocol": "openid-connect",
      "attributes": { "include.in.token.scope": "true", "display.on.consent.screen": "false" },
      "protocolMappers": [
        {
          "name": "aud pedidos",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-audience-mapper",
          "consentRequired": false,
          "config": { "included.client.audience": "pedidos", "id.token.claim": "false",
                      "access.token.claim": "true", "introspection.token.claim": "true" }
        }
      ]
    }
  ],
  "defaultDefaultClientScopes": [ "basic", "profile", "roles" ],
  "clients": [
    {
      "clientId": "tienda-cli",
      "name": "Cliente de laboratorio (solo dev: password grant)",
      "enabled": true,
      "protocol": "openid-connect",
      "publicClient": true,
      "standardFlowEnabled": false,
      "directAccessGrantsEnabled": true,
      "defaultClientScopes": [ "basic", "profile", "roles" ],
      "optionalClientScopes": [ "pedidos:leer", "pedidos:crear", "pedidos:reembolsar", "pedidos:borrar" ]
    }
  ],
  "users": [
    {
      "username": "ana", "enabled": true, "emailVerified": true,
      "firstName": "Ana", "lastName": "Demo", "email": "ana@tienda.local",
      "credentials": [ { "type": "password", "value": "clave-demo", "temporary": false } ],
      "realmRoles": [ "cliente" ]
    }
  ]
}
```

`f064-keycloak/src/main/java/academia/seguridad/keycloak/RolesDeKeycloak.java`:

```java
package academia.seguridad.keycloak;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Keycloak pone los roles del realm en {"realm_access":{"roles":[...]}} (mapper "realm roles" del
 * client scope "roles"). Spring Security solo lee "scope"/"scp": sin este conversor, hasRole() nunca coincide.
 */
class RolesDeKeycloak implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null || !(realmAccess.get("roles") instanceof Collection<?> roles)) {
            return List.of();
        }
        return roles.stream()
            .filter(String.class::isInstance)
            .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
            .toList();
    }
}
```

`SeguridadApi.java`:

```java
package academia.seguridad.keycloak;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SeguridadApi {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        var conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(new RolesDeKeycloak());
        conversor.setPrincipalClaimName("preferred_username");      // getName() = "ana" en vez del UUID de sub
        return http
            .authorizeHttpRequests(r -> r
                .requestMatchers("/admin/**").hasRole("admin")
                .requestMatchers("/pedidos/**").hasAnyRole("cliente", "soporte", "admin")
                .anyRequest().denyAll())                                // lo no declarado, cerrado
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(conversor)))
            .build();
    }
}
```

`PedidosController.java` (`GET /pedidos` devuelve `{"usuario": <nombre>, "pedidos": 3}` y `GET /admin/reportes`
devuelve `{"ventas": 42}`) y `application.properties`:

```properties
spring.application.name=f064-keycloak
server.port=8081
# Spring descubre la JWKS del realm (".../protocol/openid-connect/certs") en la primera petición
# y comprueba que el "iss" de cada token sea exactamente este valor.
spring.security.oauth2.resourceserver.jwt.issuer-uri=${KEYCLOAK_REALM_URL:http://localhost:8180/realms/tienda}
spring.security.oauth2.resourceserver.jwt.audiences=pedidos
```

#### 10. MINI-LABORATORIO

1. Levanta Keycloak con el realm importado:

```bash
docker compose up -d --wait keycloak
docker compose logs keycloak | grep -iE "import|started in"
```

   **Output esperado:** `docker compose up` termina con `Container modulo-13-keycloak-1  Healthy` y el log contiene una
   línea de importación del realm `tienda` y otra `Keycloak 26.8.2 on JVM (powered by Quarkus...) started in...s`.
   **Captura comentada:** en `http://localhost:8180` (usuario `admin`, clave `admin-solo-dev`) el selector de realms
   muestra `tienda`, y en *Clients* aparecen `tienda-web`, `tienda-cli`, `pedidos` y `pagos`.

2. Pide un token para ana y léelo:

```bash
TOKEN=$(curl -s localhost:8180/realms/tienda/protocol/openid-connect/token \
  -d grant_type=password -d client_id=tienda-cli -d username=ana -d password=clave-demo \
  -d scope="openid pedidos:leer" | jq -r .access_token)
java jdk/VerToken.java "$TOKEN"
```

   **Output esperado** (el `kid`, el `sub` y las fechas cambian):

```text
cabecera: {"alg":"RS256","typ":"JWT","kid":"..."}
iss:                "http://localhost:8180/realms/tienda"
sub:                "<uuid de ana>"
aud:                "pedidos"
azp:                "tienda-cli"
scope:              "openid profile pedidos:leer"
preferred_username: "ana"
realm_access:       {"roles":["cliente"]}
act:                (no está)
exp:                2026-...Z (vence en 299 s)
```

3. Llama al resource server con el token real:

```bash
cd f064-keycloak && ../gradlew -q bootRun &
sleep 15
curl -s -H "Authorization: Bearer $TOKEN" localhost:8081/pedidos; echo
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" localhost:8081/admin/reportes
curl -s -o /dev/null -w "%{http_code}\n" localhost:8081/pedidos
```

   **Output esperado:**

```text
{"usuario":"ana","pedidos":3}
403
401
```

4. **Fallo deliberado:** pide el token por `127.0.0.1` en vez de `localhost`
   (`curl -s 127.0.0.1:8180/realms/tienda/...`) y repite la primera llamada: responde `401` porque el `iss` del token es
   `http://127.0.0.1:8180/realms/tienda` y el servicio exige `http://localhost:8180/realms/tienda`. Mira la cabecera con
   `curl -i`: `WWW-Authenticate: Bearer error="invalid_token", error_description="...iss..."`.

#### 11. VERIFICACIÓN

`f064-keycloak/src/test/java/academia/seguridad/keycloak/ResourceServerKeycloakTest.java`. No necesita Keycloak:
`TokensDePrueba` registra un `JwtDecoder` que convierte `token-ana`, `token-root` y `token-sin-roles` en JWT con la misma
forma que los de Keycloak (`realm_access.roles`, `preferred_username`), así el test recorre la cadena real, conversor
incluido:

```java
package academia.seguridad.keycloak;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TokensDePrueba.class)
class ResourceServerKeycloakTest {

    @Autowired MockMvc mvc;

    @Test
    void anaConRolClienteVeSusPedidosConSuNombre() throws Exception {
        mvc.perform(get("/pedidos").header("Authorization", "Bearer token-ana"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario").value("ana"));
    }

    @Test
    void anaNoEntraAAdmin() throws Exception {
        mvc.perform(get("/admin/reportes").header("Authorization", "Bearer token-ana"))
            .andExpect(status().isForbidden());
    }

    @Test
    void rootConRolAdminEntraAAdmin() throws Exception {
        mvc.perform(get("/admin/reportes").header("Authorization", "Bearer token-root"))
            .andExpect(status().isOk());
    }

    @Test
    void sinRolesDelRealmNoHayAcceso() throws Exception {
        mvc.perform(get("/pedidos").header("Authorization", "Bearer token-sin-roles"))
            .andExpect(status().isForbidden());
    }

    @Test
    void tokenDesconocidoEs401() throws Exception {
        mvc.perform(get("/pedidos").header("Authorization", "Bearer inventado"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void elConversorLeeRealmAccessRoles() {
        Jwt jwt = Jwt.withTokenValue("t").header("alg", "RS256").subject("x")
            .claim("realm_access", Map.of("roles", List.of("cliente", "soporte")))
            .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        assertThat(new RolesDeKeycloak().convert(jwt))
            .extracting(Object::toString)
            .containsExactlyInAnyOrder("ROLE_cliente", "ROLE_soporte");
    }
}
```

```bash
../gradlew test
```

**Output esperado:** 6 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*. El paso 3 del laboratorio
es la verificación de extremo a extremo contra el Keycloak real; `./verificar.sh` la repite y exige `200-403-401`.

**Pregunta de comprobación:** quitas el client scope `roles` de los *default client scopes* de `tienda-cli`. ¿Qué cambia
en el token y qué responde `GET /pedidos` con el token de ana?

<details>
<summary>Respuesta</summary>

El token deja de traer `realm_access` (lo añadía el mapper de ese scope). `RolesDeKeycloak` devuelve una lista vacía y
`hasAnyRole(...)` falla: la respuesta es `403` aunque la firma, `iss` y `aud` sean correctos.
</details>

#### 12. ERROR COMÚN

**Síntoma:** el token es válido, ana tiene el rol `cliente` en Keycloak, pero `GET /pedidos` responde `403`.

**Cómo se ve:** con `logging.level.org.springframework.security=DEBUG` el servicio registra la autenticación de ana con
`Granted Authorities=[SCOPE_openid, SCOPE_profile, SCOPE_pedidos:leer]`: ningún `ROLE_`.

**Diagnóstico:** el `JwtAuthenticationConverter` por defecto solo convierte el claim `scope` en `SCOPE_*`. Los roles de
Keycloak viven en `realm_access.roles` (y los de cliente en `resource_access.<cliente>.roles`), que Spring no lee solo.

**Arreglo:** registra un conversor como `RolesDeKeycloak` (o combina scopes y roles, F065). Comprueba con `VerToken.java`
que el claim existe; si no está, falta el client scope `roles` en el cliente que pidió el token.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo integras Keycloak con 20 microservicios Spring y qué pasa si Keycloak se cae?»

**Respuesta modelo:** cada servicio es un resource server con `issuer-uri` del realm y `audiences` con su propio nombre;
valida localmente la firma con la JWKS que descarga y cachea, así que una caída de Keycloak **no** afecta a las
peticiones con tokens ya emitidos hasta que expiran (minutos). Lo que se cae es el login y la renovación, por eso
Keycloak va en alta disponibilidad (dos o más réplicas, PostgreSQL, caché distribuida) y los servicios no lo llaman en
cada petición. Los roles gruesos van en el token con un conversor de `realm_access`; los permisos de negocio se deciden
en el servicio. El realm se versiona como código y se importa en cada entorno.

#### 14. ANTI-PATRÓN RELACIONADO

**Llamar a Keycloak en cada petición «para estar seguros»:**

```java
@GetMapping("/pedidos")
List<Pedido> pedidos(@RequestHeader("Authorization") String auth) {
    // Una llamada HTTP a Keycloak por petición: latencia extra y Keycloak como punto único de fallo
    Map<?, ?> info = rest.get().uri(keycloak + "/protocol/openid-connect/userinfo")
        .header("Authorization", auth).retrieve().body(Map.class);
    return repositorio.porCliente((String) info.get("sub"));
}
```

Con 20 servicios y miles de peticiones por segundo, el IdP se convierte en el cuello de botella y en la caída de todo el
sistema. Valida el JWT localmente con la JWKS cacheada; si necesitas revocación inmediata, usa tokens cortos o
introspección con caché solo donde haga falta.

---
### RBAC y Scopes

#### 1. UBICACIÓN

Módulo 9, Lección 5 de 9 · Fase 1 · 2 h
`f065-rbac-scopes`.

#### 2. PRERREQUISITOS

- F061 (reglas y `@PreAuthorize` mencionado), F063 (scopes que el usuario concede a un cliente) y F064 (roles del realm
  en `realm_access.roles`).

#### 3. OBJETIVO DE APRENDIZAJE

**Explicar** la diferencia entre lo que un **usuario** puede hacer (roles, RBAC) y lo que una **aplicación** puede hacer
en su nombre (scopes), **implementar** la regla «permiso del rol ∩ scope del token» con `@PreAuthorize` y **verificar**
una matriz de 12 decisiones (401/200/201/204/403) con un test parametrizado.

#### 4. ANALOGÍA VISUAL

Un **edificio de oficinas con tarjetas**. Tu **cargo** (rol) define a qué pisos podrías entrar: la gerente puede a todos,
el de soporte al 3 y al 4. Cuando le prestas tu tarjeta a un mensajero para que recoja un paquete, la recepción le entrega
una **copia limitada** que solo abre el piso 3 (scope), aunque tu cargo abra más. La puerta se abre solo si **las dos
cosas** coinciden: el cargo del dueño permite ese piso **y** la copia lo incluye. El dibujo: una tabla de pisos con
candados de dos cerrojos (uno con el icono de un maletín —rol— y otro con el de una llave recortada —scope—), y un
mensajero frente al piso 5 con la copia que no abre ese cerrojo.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    T["JWT de Keycloak<br/>scope: pedidos:leer pedidos:crear<br/>realm_access.roles: [cliente]"] --> C["AutoridadesDelToken"]
    C --> A1["SCOPE_pedidos:leer<br/>SCOPE_pedidos:crear"]
    C --> A2["ROLE_cliente"]
    A1 --> D{"@permisos.puede(auth, 'pedidos:borrar')"}
    A2 --> D
    M["Tabla rol → permisos<br/>cliente: leer, crear<br/>soporte: leer, reembolsar<br/>admin: todos"] --> D
    D -->|"rol lo concede Y scope presente"| OK["200 / 201 / 204"]
    D -->|"falta uno"| NO["403"]
```

**Texto alternativo:** un JWT de Keycloak con scope «pedidos:leer pedidos:crear» y el rol cliente pasa por el conversor
AutoridadesDelToken, que produce dos autoridades SCOPE_ y una ROLE_cliente. Esas autoridades y una tabla que asigna
permisos a cada rol (cliente: leer y crear; soporte: leer y reembolsar; admin: todos) alimentan la decisión
@permisos.puede para un permiso concreto, por ejemplo pedidos:borrar. Si el rol concede el permiso y el scope está
presente, la respuesta es 200, 201 o 204; si falta cualquiera de los dos, 403.

#### 6. EXPLICACIÓN NIVEL 0

**Autorizar** es decidir si alguien que ya sabemos quién es puede hacer una acción concreta. **RBAC** (control de acceso
basado en roles) agrupa permisos en **roles** —«cliente», «soporte», «admin»— y le asigna roles a cada persona; así no
configuras permisos persona por persona. Los **scopes** son otra cosa: cuando una aplicación actúa en tu nombre, solo
recibe **una parte** de lo que tú puedes hacer (por ejemplo, un widget que solo lee pedidos). Una petición pasa si tu
rol lo permite **y** la aplicación recibió ese scope.

#### 7. EXPLICACIÓN INTERMEDIA

- **En Spring todo son `GrantedAuthority`:** `hasRole("admin")` busca la autoridad `ROLE_admin`; `hasAuthority("SCOPE_x")`
  busca `SCOPE_x` exacta. El `JwtGrantedAuthoritiesConverter` estándar convierte el claim `scope` (o `scp`) en `SCOPE_*`;
  los roles de Keycloak necesitan un conversor (F064). `AutoridadesDelToken` produce ambos.
- **Dónde se decide:** `authorizeHttpRequests` para reglas por URL; `@EnableMethodSecurity` + `@PreAuthorize("...")`
  para reglas por método, con SpEL. `@permisos.puede(authentication, 'pedidos:borrar')` llama a un bean: la tabla
  rol → permisos queda en **un** lugar y se puede probar sola.
- **Combinación:** el permiso se concede si `algún rol del usuario lo incluye` **y** `el token trae SCOPE_<permiso>`. El
  scope **reduce**, nunca amplía: sofía (soporte) con un token que trae `pedidos:borrar` sigue sin poder borrar.
- **CSRF en APIs con token:** un resource server sin cookies desactiva CSRF (`csrf.disable()`), si no los `POST` y
  `DELETE` responden 403 (F061, error común).
- **Jerarquías:** si `admin` debe implicar `soporte`, Spring ofrece `RoleHierarchy` (`RoleHierarchyImpl.fromHierarchy("ROLE_admin > ROLE_soporte")`);
  aquí se modela explícitamente en la tabla para que se lea sin magia.

#### 8. EXPLICACIÓN MAESTRA

| Modelo | Qué decide | Fortalezas | Límites | Ejemplo |
|---|---|---|---|---|
| **RBAC** | Rol del usuario | Simple, auditable | Explosión de roles cuando aparecen excepciones | `admin`, `soporte` |
| **Scopes OAuth2** | Lo que el cliente puede hacer en nombre del usuario | Mínimo privilegio para apps de terceros | No sustituyen a los roles: los limitan | `pedidos:leer` |
| **ABAC / políticas** | Atributos del sujeto, recurso y contexto | Reglas finas («solo el dueño», «en horario») | Más difícil de auditar; necesita un motor | OPA, Cedar, `@PreAuthorize("#p.dueno == authentication.name")` |
| **ReBAC** | Relaciones (usuario ↔ recurso) | Compartir documentos, organizaciones | Infraestructura específica | OpenFGA, SpiceDB (modelo Zanzibar) |

**Diseño de scopes:** granularidad por recurso y verbo (`pedidos:leer`), no por pantalla; pocos scopes estables (los
clientes los piden en su configuración). **Diseño de roles:** roles de negocio gruesos en el IdP; la regla de propiedad
(«solo tus pedidos») nunca en un rol, sino en el servicio, comparando `sub` con el dueño del recurso. Evita poner cientos
de permisos en el token: crece, se desactualiza y viaja en cada petición.

**Cuándo NO:** si tu sistema no tiene clientes de terceros ni apps con permisos reducidos, los scopes añaden
configuración sin aportar; bastan roles. Y si la regla depende de datos (dueño, monto), ni roles ni scopes alcanzan:
necesitas una comprobación en el dominio.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** JDK 25 LTS · Spring Boot 4.1.3 · `spring-boot-starter-security-oauth2-resource-server` (Spring Security
7.1.3, `@EnableMethodSecurity`) · JUnit Jupiter 6 (`@ParameterizedTest`).

**Antes (vulnerable)** — `jdk/RbacScopes.java`: el rol llega en una cabecera que el propio cliente escribe y no se mira
el scope:

```java
// ANTES (vulnerable): mira solo el rol y lo toma de una cabecera que manda el cliente.
static int antes(Map<String, String> cabeceras, String metodo, String ruta) {
    String rol = cabeceras.getOrDefault("X-Rol", "cliente");
    Regla r = regla(metodo, ruta);
    return PERMISOS_POR_ROL.getOrDefault(rol, Set.of()).contains(r.permiso()) ? 200 : 403;
}
```

**Después (seguro)** — roles y scopes vienen del token firmado y se exige la intersección:

```java
// DESPUÉS (seguro): roles y scopes vienen del token firmado; se exige la intersección.
static int despues(Token t, String metodo, String ruta) {
    if (t == null) return 401;
    Regla r = regla(metodo, ruta);
    Set<String> delRol = t.roles().stream().flatMap(x -> PERMISOS_POR_ROL.getOrDefault(x, Set.of()).stream())
            .collect(Collectors.toSet());
    boolean porRol = delRol.contains(r.permiso());
    boolean porScope = t.scopes().contains(r.permiso());
    return porRol && porScope ? 200 : 403;
}
```

En Spring (`f065-rbac-scopes`, mismas dependencias que F064). `Permisos.java`:

```java
package academia.seguridad.rbac;

import java.util.Map;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Decisión RBAC + scopes en un solo lugar:
 *   permiso concedido  <=>  algún ROL del usuario lo incluye  Y  el token trae el SCOPE con ese nombre.
 * Se usa desde @PreAuthorize("@permisos.puede(authentication, 'pedidos:leer')").
 */
@Component("permisos")
public class Permisos {

    static final Map<String, Set<String>> POR_ROL = Map.of(
        "cliente", Set.of("pedidos:leer", "pedidos:crear"),
        "soporte", Set.of("pedidos:leer", "pedidos:reembolsar"),
        "admin", Set.of("pedidos:leer", "pedidos:crear", "pedidos:reembolsar", "pedidos:borrar"));

    public boolean puede(Authentication auth, String permiso) {
        boolean porRol = false, porScope = false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            String nombre = a.getAuthority();
            if (nombre.startsWith("ROLE_") && POR_ROL.getOrDefault(nombre.substring(5), Set.of()).contains(permiso)) porRol = true;
            if (nombre.equals("SCOPE_" + permiso)) porScope = true;
        }
        return porRol && porScope;
    }
}
```

`AutoridadesDelToken.java`:

```java
package academia.seguridad.rbac;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

/** SCOPE_x desde "scope" (conversor estándar) + ROLE_x desde "realm_access.roles" (Keycloak). */
class AutoridadesDelToken implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        List<GrantedAuthority> todas = new ArrayList<>(scopes.convert(jwt));
        Map<String, Object> realm = jwt.getClaimAsMap("realm_access");
        if (realm != null && realm.get("roles") instanceof Collection<?> roles) {
            roles.stream().filter(String.class::isInstance).forEach(r -> todas.add(new SimpleGrantedAuthority("ROLE_" + r)));
        }
        return todas;
    }
}
```

`SeguridadRbac.java` y `PedidosController.java`:

```java
package academia.seguridad.rbac;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity            // activa @PreAuthorize
class SeguridadRbac {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        var conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(new AutoridadesDelToken());
        return http
            .authorizeHttpRequests(r -> r.anyRequest().authenticated())   // grano grueso aquí, fino en @PreAuthorize
            .csrf(AbstractHttpConfigurer::disable)      // API sin cookies: el token va en la cabecera, no hay CSRF que explotar
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(conversor)))
            .build();
    }
}
```

```java
package academia.seguridad.rbac;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pedidos")
class PedidosController {

    @GetMapping
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:leer')")
    Map<String, Object> listar() { return Map.of("pedidos", 3); }

    @PostMapping
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:crear')")
    ResponseEntity<Void> crear() { return ResponseEntity.status(201).build(); }

    @PostMapping("/{id}/reembolso")
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:reembolsar')")
    Map<String, Object> reembolsar(@PathVariable long id) { return Map.of("pedido", id, "reembolsado", true); }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permisos.puede(authentication, 'pedidos:borrar')")
    ResponseEntity<Void> borrar(@PathVariable long id) { return ResponseEntity.noContent().build(); }
}
```

`application.properties`: `server.port=8082`, `issuer-uri` del realm `tienda` y `audiences=pedidos` (igual que F064).

#### 10. MINI-LABORATORIO

1. Ejecuta la matriz sin dependencias (ejecutado con JDK 25.0.5):

```bash
java RbacScopes.java
```

   **Output esperado:**

```text
ANTES (vulnerable): rol leído de la cabecera X-Rol
  ana (cliente) envía X-Rol: admin y DELETE /pedidos -> 200   <- escalada de privilegios
DESPUÉS (seguro): permiso del rol ∩ scope del token
                     GET /pedidos  POST /pedidos  POST /pedidos/reembolso  DELETE /pedidos
  anónimo            401           401            401                      401
  ana · app web      200           200            403                      403
  ana · widget       200           403            403                      403
  sofia · soporte    200           403            200                      403
  root · admin       200           200            200                      200
  (sofia tiene el scope pedidos:borrar, pero su rol no lo concede: 403)
OK: 20 decisiones coinciden con la tabla esperada
```

2. Repite la matriz con tokens reales de Keycloak (`docker compose up -d --wait keycloak` y la app con
   `cd../f065-rbac-scopes &&../gradlew -q bootRun`):

```bash
tok() { curl -s localhost:8180/realms/tienda/protocol/openid-connect/token -d grant_type=password \
  -d client_id=tienda-cli -d username=$1 -d password=clave-demo -d scope="$2" | jq -r .access_token; }
WEB=$(tok ana "pedidos:leer pedidos:crear"); WIDGET=$(tok ana "pedidos:leer")
SOFIA=$(tok sofia "pedidos:leer pedidos:reembolsar pedidos:borrar")
for par in "WEB:$WEB" "WIDGET:$WIDGET" "SOFIA:$SOFIA"; do
  n=${par%%:*}; t=${par#*:}
  printf "%-7s POST /pedidos -> %s · DELETE /pedidos/7 -> %s\n" "$n" \
    "$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $t" localhost:8082/pedidos)" \
    "$(curl -s -o /dev/null -w "%{http_code}" -X DELETE -H "Authorization: Bearer $t" localhost:8082/pedidos/7)"
done
```

   **Output esperado:**

```text
WEB     POST /pedidos -> 201 · DELETE /pedidos/7 -> 403
WIDGET  POST /pedidos -> 403 · DELETE /pedidos/7 -> 403
SOFIA   POST /pedidos -> 403 · DELETE /pedidos/7 -> 403
```

   **Captura comentada:** el token de sofía sí trae `pedidos:borrar` en `scope` (compruébalo con `java../jdk/VerToken.java
   "$SOFIA"`), porque `tienda-cli` puede pedirlo; el rol `soporte` no lo concede y por eso el `DELETE` es 403.

3. **Fallo deliberado:** en `Permisos.puede` cambia `return porRol && porScope;` por `return porRol || porScope;`.
   Ejecuta `../gradlew test`: falla la fila `DELETE, /pedidos/7, sofia, 403` (ahora da 204). Restaura el `&&`.

#### 11. VERIFICACIÓN

`f065-rbac-scopes/src/test/java/academia/seguridad/rbac/MatrizDeAutorizacionTest.java` (con `TokensDePrueba`, un
`JwtDecoder` de prueba que devuelve JWT con `scope` y `realm_access.roles` como los de Keycloak):

```java
package academia.seguridad.rbac;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** La tabla esperada es la misma que imprime jdk/RbacScopes.java. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TokensDePrueba.class)
class MatrizDeAutorizacionTest {

    @Autowired MockMvc mvc;

    @ParameterizedTest(name = "{0} {1} con {2} -> {3}")
    @CsvSource({
        "GET,    /pedidos,             ,           401",
        "GET,    /pedidos,             ana-web,    200",
        "POST,   /pedidos,             ana-web,    201",
        "POST,   /pedidos/7/reembolso, ana-web,    403",
        "DELETE, /pedidos/7,           ana-web,    403",
        "GET,    /pedidos,             ana-widget, 200",
        "POST,   /pedidos,             ana-widget, 403",
        "GET,    /pedidos,             sofia,      200",
        "POST,   /pedidos,             sofia,      403",
        "POST,   /pedidos/7/reembolso, sofia,      200",
        "DELETE, /pedidos/7,           sofia,      403",
        "DELETE, /pedidos/7,           root,       204",
    })
    void decide(String metodo, String ruta, String token, int esperado) throws Exception {
        MockHttpServletRequestBuilder req = request(HttpMethod.valueOf(metodo), ruta);
        if (token != null) req.header("Authorization", "Bearer " + token);
        mvc.perform(req).andExpect(status().is(esperado));
    }
}
```

```bash
cd ../f065-rbac-scopes && ../gradlew test
```

**Output esperado:** 12 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.

**Pregunta de comprobación:** un cliente de terceros pide a ana el scope `pedidos:borrar`. Ana acepta. ¿Puede borrar?

<details>
<summary>Respuesta</summary>

No. El rol `cliente` no incluye `pedidos:borrar`; el scope solo puede **restringir** lo que el rol permite, nunca
ampliarlo. Si Keycloak se configura bien, ni siquiera debería ofrecer ese scope a ese cliente.
</details>

#### 12. ERROR COMÚN

**Síntoma:** `@PreAuthorize("hasRole('SCOPE_pedidos:leer')")` o `hasAuthority('admin')` nunca coinciden: todo es `403`.

**Cómo se ve:** en DEBUG, la autenticación muestra `Granted Authorities=[SCOPE_pedidos:leer, ROLE_cliente]`, pero la
decisión registra `AuthorizationDecision [granted=false]` para el método.

**Diagnóstico:** `hasRole('x')` añade el prefijo y busca `ROLE_x`; `hasAuthority('x')` busca `x` tal cual. Mezclar
prefijos (`hasRole('ROLE_admin')` → busca `ROLE_ROLE_admin`) o usar el nombre sin prefijo con `hasAuthority` falla en
silencio.

**Arreglo:** roles con `hasRole('admin')`; scopes con `hasAuthority('SCOPE_pedidos:leer')`. Mejor aún, centraliza la
decisión en un bean (`@permisos.puede`) y pruébala con una matriz como la de este tema.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué diferencia hay entre un rol y un scope, y cómo los combinas en un resource server?»

**Respuesta modelo:** el rol describe lo que el **usuario** puede hacer en el sistema (RBAC, asignado por la
organización); el scope describe lo que una **aplicación cliente** puede hacer en nombre de ese usuario (concedido en el
consentimiento OAuth2). En el resource server convierto ambos en autoridades (`ROLE_*` desde el claim de roles del IdP y
`SCOPE_*` desde `scope`) y concedo una operación solo si el rol la permite y el token trae el scope; así un cliente con
permisos reducidos no puede hacer más que su scope ni más que el rol del usuario. Las reglas de propiedad o de importe no
van en roles ni scopes: las compruebo en el dominio.

#### 14. ANTI-PATRÓN RELACIONADO

**Explosión de roles** para expresar excepciones:

```text
ROLE_soporte, ROLE_soporte_reembolsos, ROLE_soporte_reembolsos_bogota,
ROLE_soporte_reembolsos_bogota_hasta_500k, ROLE_soporte_reembolsos_bogota_hasta_500k_fines_de_semana ...
```

Cada regla nueva se convierte en otro rol; nadie sabe qué permite cada uno y el token crece. Los roles se mantienen
gruesos; las condiciones de datos (ciudad, monto, horario) se expresan como reglas sobre atributos (ABAC) en el servicio
o en un motor de políticas.

---
### Token Exchange (RFC 8693)

#### 1. UBICACIÓN

Módulo 9, Lección 6 de 9 · Fase 1 · 2 h
`f066-token-exchange`.

#### 2. PRERREQUISITOS

- F062 (`aud`, `exp`), F063 (endpoint `/token`, clientes confidenciales), F064 (realm `tienda`) y F065 (scopes).
- Módulo 6: un servicio que llama a otro con `RestClient`.

#### 3. OBJETIVO DE APRENDIZAJE

**Explicar** por qué reenviar el token del usuario entre servicios es peligroso, **ejecutar** un canje RFC 8693 contra
Keycloak que produce un token con `aud=pagos` y scope reducido, e **implementar** en Spring un servicio que canjea antes
de llamar a otro, verificado con 2 tests que inspeccionan lo que recibe el STS y lo que recibe pagos.

#### 4. ANALOGÍA VISUAL

La **pulsera de un festival**. Ana entra con una pulsera general (su token para `pedidos`). Para ir a la zona de
camerinos (pagos), su acompañante del staff (el servicio pedidos) no le presta su pulsera al guardia de camerinos ni le
pone a ana una pulsera «para todo»: va a la **taquilla** (el STS), muestra la pulsera de ana y su credencial de staff, y
recibe una **pulsera nueva** que dice «Ana, acompañada por pedidos, solo camerinos, válida 1 minuto». Si alguien la
roba, no abre el escenario ni el bar. El dibujo: una taquilla con un letrero «RFC 8693», una pulsera azul entrando y una
roja más corta saliendo con las etiquetas `aud=pagos`, `act=pedidos`, `60 s`.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant A as App de ana
    participant P as pedidos (resource server + cliente confidencial)
    participant K as Keycloak (STS)
    participant G as pagos (aud=pagos)
    A->>P: POST /pedidos/7/pagar · Bearer T1 (aud=pedidos)
    P->>P: valida T1 (firma, iss, aud=pedidos)
    P->>K: POST /token (Basic pedidos:secreto)<br/>grant_type=urn:ietf:params:oauth:grant-type:token-exchange<br/>subject_token=T1 · subject_token_type=...:access_token<br/>audience=pagos · scope=pagos:cobrar
    K->>K: ¿cliente autenticado? ¿T1 válido y con pedidos en aud?<br/>¿pagos permitido? ¿scope permitido?
    K-->>P: access_token T2 (sub=ana, aud=pagos, scope=pagos:cobrar)<br/>issued_token_type=...:access_token
    P->>G: POST /cobros · Bearer T2
    G->>G: valida T2: aud=pagos y SCOPE_pagos:cobrar
    G-->>P: 200 cobrado
    P-->>A: 200
```

**Texto alternativo:** diagrama de secuencia. La app de ana llama a pedidos con el token T1, cuya audiencia es pedidos.
Pedidos lo valida y hace un POST al endpoint de token de Keycloak autenticándose con su secreto, con grant_type de token
exchange, T1 como subject_token, audience pagos y scope pagos:cobrar. Keycloak comprueba el cliente, que T1 sea válido y
tenga a pedidos en su audiencia, y que la audiencia y el scope pedidos estén permitidos; responde con un token T2 con sub
ana, audiencia pagos y scope pagos:cobrar. Pedidos llama a pagos con T2; pagos comprueba audiencia y scope y responde
cobrado.

#### 6. EXPLICACIÓN NIVEL 0

Cuando un servicio necesita llamar a otro **en nombre del usuario**, la tentación es reenviar el mismo token. El problema:
ese token se vuelve una **llave maestra** que sirve en muchos servicios, y si se filtra en un solo log, abre todo.
**Token Exchange** (el estándar RFC 8693) es pedirle al servidor de identidad: «cámbiame este token por uno nuevo, solo
para este otro servicio, con menos permisos y por poco tiempo». El token nuevo sigue diciendo que es ana, pero solo
sirve donde hace falta.

#### 7. EXPLICACIÓN INTERMEDIA

- **Petición (RFC 8693 §2.1)** al endpoint de token, con el cliente autenticado: `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`,
  `subject_token` (el token de ana), `subject_token_type=urn:ietf:params:oauth:token-type:access_token` y, opcionalmente,
  `audience`, `resource`, `scope`, `requested_token_type` y `actor_token` (para delegación).
- **Respuesta (§2.2.1):** `access_token`, `issued_token_type`, `token_type` (`Bearer`) y `expires_in`. Errores OAuth2:
  `invalid_request`, `invalid_client`, `invalid_grant`, `invalid_scope` e `invalid_target` (audiencia no permitida, §2.2.2).
- **Suplantación frente a delegación:** en *impersonation* el token nuevo es indistinguible de uno de ana; en
  *delegation* lleva el claim `act` (§4.1) con quién actúa en su nombre (`"act":{"sub":"pedidos"}`), útil para auditoría.
- **Keycloak 26:** el *standard token exchange* (feature `token-exchange-standard:v2`) viene activado; se habilita por
  cliente con el interruptor **Standard token exchange** (atributo `standard.token.exchange.enabled` en el JSON del
  realm). El cliente que canjea debe ser **confidencial**, ambos clientes en el mismo realm, el `subject_token` debe
  incluir al cliente que canjea en su `aud`, solo se aceptan access tokens como `subject_token_type`, `audience` **filtra**
  (no añade) audiencias, `scope` pide scopes opcionales del cliente que canjea y el parámetro `resource` no se admite. La
  suplantación de otro usuario no está implementada en esta versión del canje estándar.
- **En Spring:** aquí se hace con `RestClient` para ver cada parámetro. Spring Security trae también
  `TokenExchangeOAuth2AuthorizedClientProvider`, que integra el canje en el `OAuth2AuthorizedClientManager` (con caché del
  token canjeado).

#### 8. EXPLICACIÓN MAESTRA

| Estrategia entre servicios | Seguridad | Coste | Cuándo |
|---|---|---|---|
| **Reenviar el token** (*passthrough*) | Débil: token con audiencias amplias, reutilizable en cualquier servicio | Nulo | Nunca entre dominios de confianza distintos; tolerable solo dentro de un mismo servicio lógico |
| **Token Exchange** | Fuerte: audiencia y scope mínimos, vida corta, trazabilidad con `act` | Una llamada al STS por destino (cacheable hasta `exp`) | Llamadas en nombre del usuario que cruzan fronteras de confianza |
| **Client credentials** del servicio | Identifica al servicio, pierde al usuario | Una llamada por token, cacheable | Procesos sin usuario (jobs, eventos) |
| **mTLS + identidad del servicio** (F067) | Autentica la conexión, no al usuario | Malla de servicios | Complemento de las anteriores (Zero-Trust, Módulo 27) |

**Trade-offs:** cada canje añade latencia (~ms) y carga al IdP: cachea el token canjeado por `(usuario, audiencia)`
hasta poco antes de su `exp`; si el STS no responde, falla cerrado (502), nunca reenvíes el token original como
«plan B». Un gateway puede hacer el canje en el borde (el token externo nunca entra a la red interna) y cada servicio
recibe uno con su audiencia.

**Cuándo NO:** si el servicio de destino no necesita saber **qué usuario** pidió la operación (por ejemplo, un servicio
de catálogo público), usa client credentials; canjear tokens de usuario para eso añade latencia y acoplamiento al IdP.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** JDK 25 LTS · Spring Boot 4.1.3 · `spring-boot-starter-security-oauth2-resource-server` y
`spring-boot-starter-restclient` · Keycloak 26.8.2 con el cliente `pedidos` y `standard.token.exchange.enabled=true`.

**Antes (vulnerable)** — `pedidos` reenvía el token de ana tal cual; para que funcione, el token se emite con todas las
audiencias:

```java
// ANTES: token passthrough
@PostMapping("/pedidos/{id}/pagar")
Map<?, ?> pagar(@PathVariable long id, @AuthenticationPrincipal Jwt usuario) {
    return pagos.post().uri("/cobros")
        .headers(h -> h.setBearerAuth(usuario.getTokenValue()))   // el mismo token abre pedidos, pagos, inventario...
        .body(Map.of("pedido", id)).retrieve().body(Map.class);
}
```

En `jdk/IntercambioDeTokens.java` el «antes» muestra el efecto: un token con `aud: ["pedidos","pagos","inventario"]`
aceptado por pagos **y** por inventario.

**Después (seguro)** — `f066-token-exchange/src/main/java/academia/seguridad/intercambio/ClienteSts.java`:

```java
package academia.seguridad.intercambio;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/** Pide al servidor de autorización (Keycloak) un token nuevo para otra audiencia: RFC 8693 §2.1. */
@Component
class ClienteSts {

    static final String GRANT = "urn:ietf:params:oauth:grant-type:token-exchange";
    static final String ACCESS_TOKEN = "urn:ietf:params:oauth:token-type:access_token";

    private final RestClient http;
    private final String tokenUri;

    ClienteSts(RestClient.Builder builder,
               @Value("${tienda.sts.token-uri}") String tokenUri,
               @Value("${tienda.sts.client-id}") String clientId,
               @Value("${tienda.sts.client-secret}") String clientSecret) {
        this.http = builder.defaultHeaders(h -> h.setBasicAuth(clientId, clientSecret)).build();  // cliente confidencial
        this.tokenUri = tokenUri;
    }

    String canjear(String tokenDelUsuario, String audiencia, String scope) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", GRANT);
        form.add("subject_token", tokenDelUsuario);
        form.add("subject_token_type", ACCESS_TOKEN);
        form.add("requested_token_type", ACCESS_TOKEN);
        form.add("audience", audiencia);
        form.add("scope", scope);
        Map<?, ?> respuesta = http.post().uri(tokenUri)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(Map.class);
        return (String) respuesta.get("access_token");
    }
}
```

`PagarController.java`:

```java
package academia.seguridad.intercambio;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@RestController
class PagarController {

    private final ClienteSts sts;
    private final RestClient pagos;

    PagarController(ClienteSts sts, RestClient.Builder builder, @Value("${tienda.pagos.url}") String urlPagos) {
        this.sts = sts;
        this.pagos = builder.baseUrl(urlPagos).build();
    }

    /** DESPUÉS (seguro): canjea el token de ana por uno solo para pagos y llama con ese. */
    @PostMapping("/pedidos/{id}/pagar")
    Map<?, ?> pagar(@PathVariable long id, @AuthenticationPrincipal Jwt usuario) {
        try {
            String paraPagos = sts.canjear(usuario.getTokenValue(), "pagos", "pagos:cobrar");
            return pagos.post().uri("/cobros")
                .headers(h -> h.setBearerAuth(paraPagos))
                .body(Map.of("pedido", id))
                .retrieve()
                .body(Map.class);
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "no se pudo cobrar: " + e.getStatusCode());
        }
    }
}
```

`application.properties` (la cadena de seguridad, `SeguridadPedidos`, es un resource server sin estado con CSRF
desactivado como en F065):

```properties
spring.application.name=f066-token-exchange
server.port=8083
# pedidos acepta solo tokens emitidos para él (aud=pedidos).
spring.security.oauth2.resourceserver.jwt.issuer-uri=${KEYCLOAK_REALM_URL:http://localhost:8180/realms/tienda}
spring.security.oauth2.resourceserver.jwt.audiences=pedidos
# Credenciales del cliente confidencial "pedidos" ante el STS (en producción, desde Vault: F068).
tienda.sts.token-uri=${KEYCLOAK_REALM_URL:http://localhost:8180/realms/tienda}/protocol/openid-connect/token
tienda.sts.client-id=pedidos
tienda.sts.client-secret=${PEDIDOS_SECRETO:solo-dev-pedidos}
tienda.pagos.url=${PAGOS_URL:http://localhost:8084}
```

El cliente `pedidos` en `keycloak/tienda-realm.json`:

```json
{
  "clientId": "pedidos",
  "publicClient": false,
  "clientAuthenticatorType": "client-secret",
  "secret": "solo-dev-pedidos",
  "standardFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "attributes": { "standard.token.exchange.enabled": "true" },
  "defaultClientScopes": [ "basic", "roles" ],
  "optionalClientScopes": [ "pagos:cobrar" ]
}
```

#### 10. MINI-LABORATORIO

1. Mira el canje y sus rechazos en un STS mínimo (ejecutado con JDK 25.0.5):

```bash
java IntercambioDeTokens.java
```

   **Output esperado:**

```text
ANTES (vulnerable): token de ana con aud amplia, reenviado tal cual
  pagos acepta el token reenviado por pedidos -> 200 sub=ana
  inventario acepta el token reenviado por pedidos -> 200 sub=ana
  si ese token se filtra en un log de pedidos, abre pagos E inventario durante 5 minutos
DESPUÉS (seguro): RFC 8693 en el STS
  POST /token (client pedidos) grant_type=urn:ietf:params:oauth:grant-type:token-exchange
    audience=pagos scope="pagos:cobrar pagos:reembolsar" subject_token=<token de ana>
  respuesta: issued_token_type=urn:ietf:params:oauth:token-type:access_token token_type=Bearer expires_in=60
  claims nuevos: sub=ana aud=pagos scope="pagos:cobrar" act={"sub":"pedidos"}
  pagos con el token canjeado      -> 200 sub=ana
  inventario con el token canjeado -> 401 (aud=pagos)
  pagos con el token original      -> 401 (aud=pedidos)
  peticiones que el STS rechaza:
    secreto de cliente incorrecto        -> invalid_client
    audience no permitida (inventario)   -> invalid_target
    subject_token emitido para facturas  -> invalid_grant
    solo scopes no permitidos            -> invalid_scope
OK: el token canjeado solo sirve en pagos, con pagos:cobrar y act.sub=pedidos
```

2. Haz el mismo canje contra Keycloak (`docker compose up -d --wait keycloak`):

```bash
cd ..
ANA=$(curl -s localhost:8180/realms/tienda/protocol/openid-connect/token -d grant_type=password \
  -d client_id=tienda-cli -d username=ana -d password=clave-demo -d scope="pedidos:crear" | jq -r .access_token)
curl -s -u pedidos:solo-dev-pedidos localhost:8180/realms/tienda/protocol/openid-connect/token \
  -d grant_type=urn:ietf:params:oauth:grant-type:token-exchange \
  -d subject_token="$ANA" -d subject_token_type=urn:ietf:params:oauth:token-type:access_token \
  -d audience=pagos -d scope=pagos:cobrar > target/canje.json
jq '{issued_token_type, token_type, expires_in}' target/canje.json
java jdk/VerToken.java "$(jq -r .access_token target/canje.json)" | grep -E "^(aud|azp|scope|preferred_username):"
```

   **Output esperado:**

```text
{
  "issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "token_type": "Bearer",
  "expires_in": 300
}
aud:                "pagos"
azp:                "pedidos"
scope:              "pagos:cobrar"
preferred_username: (no está)
```

   **Captura comentada:** el token nuevo sigue siendo de ana (`sub` igual al del token original) pero lo pidió
   `pedidos` (`azp`) y solo sirve en `pagos`. `preferred_username` no aparece porque el cliente `pedidos` no tiene el
   scope `profile`: el canje solo emite lo que el cliente que canjea tiene permitido.

3. **Fallo deliberado:** repite el canje con `-d audience=inventario`. Keycloak responde `400` con un `error` de OAuth2
   (el cliente `pedidos` no tiene ningún scope que produzca la audiencia `inventario`). Ahora quita `pedidos:crear` del
   `scope` al pedir el token de ana: el canje falla porque `pedidos` ya no está en el `aud` del `subject_token`.

#### 11. VERIFICACIÓN

`f066-token-exchange/src/test/java/academia/seguridad/intercambio/IntercambioTest.java`: un `HttpServer` del JDK hace de
STS (`/token`) y de pagos (`/cobros`) y anota lo que recibe; el `JwtDecoder` de prueba acepta cualquier token como de ana.

```java
@Test
void canjeaElTokenYLlamaAPagosConElNuevo() throws Exception {
    mvc.perform(post("/pedidos/7/pagar").header("Authorization", "Bearer token-de-ana"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.estado").value("cobrado"));

    assertThat(form(visto.get("sts.form")))
        .containsEntry("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange")
        .containsEntry("subject_token", "token-de-ana")
        .containsEntry("subject_token_type", "urn:ietf:params:oauth:token-type:access_token")
        .containsEntry("audience", "pagos")
        .containsEntry("scope", "pagos:cobrar");
    assertThat(visto.get("sts.auth"))
        .isEqualTo("Basic " + Base64.getEncoder().encodeToString("pedidos:solo-dev-pedidos".getBytes(StandardCharsets.UTF_8)));
    assertThat(visto.get("pagos.auth")).isEqualTo("Bearer token-canjeado-pagos");   // nunca el de ana
}

@Test
void siElStsRechazaRespondes502SinLlamarAPagos() throws Exception {
    codigoSts = 400;
    mvc.perform(post("/pedidos/7/pagar").header("Authorization", "Bearer token-de-ana"))
        .andExpect(status().isBadGateway());
    assertThat(visto).doesNotContainKey("pagos.auth");
}
```

(El archivo completo, con el `HttpServer` falso, `@DynamicPropertySource` para las URL y el decoder de prueba, está en
el laboratorio.)

```bash
cd f066-token-exchange && ../gradlew test
```

**Output esperado:** 2 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.

**Pregunta de comprobación:** el STS no responde. ¿Debe `pedidos` llamar a pagos con el token original para no fallar?

<details>
<summary>Respuesta</summary>

No: falla cerrado (502 en este laboratorio, el segundo test). Reenviar el token original reintroduce el *passthrough*
justo cuando algo va mal, y además pagos lo rechazaría por `aud=pedidos` si está bien configurado.
</details>

#### 12. ERROR COMÚN

**Síntoma:** el canje contra Keycloak responde `400` o `403` aunque el secreto del cliente es correcto.

**Cómo se ve:** `{"error":"...","error_description":"..."}`; las causas típicas son el `subject_token` sin el cliente
que canjea en su `aud`, el interruptor *Standard token exchange* apagado en ese cliente o un cliente público.

**Diagnóstico:** lee el `subject_token` con `VerToken.java` y comprueba que `aud` contiene `pedidos`; en la consola de
Keycloak, *Clients → pedidos → Settings*, revisa que sea confidencial (*Client authentication* activado) y que *Standard
token exchange* esté marcado; en `docker compose logs keycloak` busca el evento `TOKEN_EXCHANGE_ERROR` con su motivo.

**Arreglo:** añade la audiencia `pedidos` al token de origen (en este realm, con el mapper de los scopes `pedidos:*`),
activa el canje en el cliente y pide solo `audience` y `scope` que ese cliente tenga permitidos.

#### 13. PREGUNTA DE ENTREVISTA

«Tu servicio de pedidos necesita llamar a pagos en nombre del usuario. ¿Reenvías el token? ¿Qué propones?»

**Respuesta modelo:** no reenvío el token del usuario: tendría que llevar todas las audiencias y cualquier servicio que
lo vea podría usarlo contra los demás. Uso Token Exchange (RFC 8693): pedidos, como cliente confidencial, envía el token
del usuario como `subject_token` al endpoint de token con `audience=pagos` y el scope mínimo; el IdP valida que el token
iba para pedidos y que pedidos puede pedir esa audiencia, y emite un token corto con `aud=pagos`, idealmente con `act`
para auditar quién actuó. Pagos valida `aud` y scope. Cacheo el token canjeado hasta su expiración, fallo cerrado si el
IdP no responde y, si la llamada no necesita al usuario, uso client credentials.

#### 14. ANTI-PATRÓN RELACIONADO

**El «token de Dios»:** un único token con todas las audiencias y scopes del sistema que viaja por cada salto:

```json
{
  "sub": "ana",
  "aud": ["gateway", "pedidos", "pagos", "inventario", "envios", "admin-api"],
  "scope": "pedidos:* pagos:* inventario:* envios:* admin:*",
  "exp": 1798761600
}
```

Cualquier servicio comprometido o cualquier log con cabeceras se convierte en acceso total durante horas. Cada salto
debe recibir un token con su propia audiencia y lo justo de scope, con vida de minutos.

---
### mTLS con Service Mesh

#### 1. UBICACIÓN

Módulo 9, Lección 7 de 9 · Fase 1 · 2,5 h
`generar-certs.sh` y `mtls-kind` (kind + Istio).

#### 2. PRERREQUISITOS

- F062: firma con clave privada y verificación con clave pública.
- Módulo 0.5: contenedores; Módulo 12 se estudia después, así que aquí se dan los comandos de Kubernetes justos
  (`kubectl apply`, `kubectl exec`).
- Idea de HTTPS: el candado del navegador.

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** a mano un canal mTLS (CA, certificado de servidor, certificado de cliente con identidad SPIFFE) y
**demostrar** que un espía lee el token en HTTP plano y no en mTLS; después, **activar** mTLS estricto en una malla Istio
con `PeerAuthentication` y **comprobar** que un pod sin sidecar pasa de `200` a ser rechazado (`000`, código 56).

#### 4. ANALOGÍA VISUAL

Una **reunión de espías en un parque**. Con TLS normal solo el que espera **muestra su credencial** (el servidor); el que
llega podría ser cualquiera. Con **mTLS** los dos se muestran credenciales emitidas por **la misma agencia** (la CA) y
solo entonces hablan, en un idioma cifrado que el que escucha desde el banco de al lado no entiende. En una malla de
servicios, cada servicio tiene un **guardaespaldas** pegado (el *sidecar*) que hace todo eso por él: muestra la
credencial, comprueba la del otro y cifra la conversación; el servicio ni se entera. El dibujo: dos personajes con
guardaespaldas intercambiando placas con el mismo escudo, un tercero sin guardaespaldas rechazado, y un curioso en un
banco con un audífono que solo oye ruido.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    subgraph T["namespace tienda (istio-injection=enabled)"]
      subgraph P1["pod curl"]
        A["curl"] --> E1["Envoy<br/>cert SPIFFE<br/>ns/tienda/sa/curl"]
      end
      subgraph P2["pod httpbin"]
        E2["Envoy<br/>PeerAuthentication STRICT"] --> B["httpbin :8080"]
      end
    end
    subgraph L["namespace legado (sin sidecar)"]
      C["curl sin Envoy"]
    end
    I["istiod<br/>CA de la malla"] -.->|"emite y rota<br/>certificados"| E1
    I -.-> E2
    E1 ==>|"mTLS (TLS 1.3)<br/>ambos presentan certificado"| E2
    C -->|"HTTP plano"| E2
    E2 -->|"rechaza: 000<br/>exit code 56"| C
```

**Texto alternativo:** en el espacio de nombres tienda, con inyección de Istio, el pod curl tiene un Envoy con
certificado SPIFFE de la cuenta de servicio curl, y el pod httpbin tiene un Envoy con PeerAuthentication en modo STRICT
delante de httpbin. Istiod actúa como CA de la malla y emite y rota los certificados de ambos Envoy. El tráfico de curl a
httpbin viaja por mTLS con TLS 1.3, presentando ambos su certificado. En el espacio legado, un curl sin Envoy envía HTTP
plano al Envoy de httpbin, que lo rechaza; curl obtiene el código 000 y termina con exit code 56.

#### 6. EXPLICACIÓN NIVEL 0

Cuando dos servicios hablan por la red de la empresa, cualquiera que logre meterse en esa red puede **escuchar** (leer
tokens y datos) o **hacerse pasar** por un servicio. **TLS** cifra la conversación y demuestra la identidad del
servidor; **mTLS** («TLS mutuo») hace que **los dos** lados demuestren quiénes son con un certificado. Configurarlo a
mano en 50 servicios es mucho trabajo, así que una **malla de servicios** (*service mesh*, como Istio o Linkerd) pone un
pequeño proxy al lado de cada servicio que lo hace automáticamente, incluida la renovación de certificados.

#### 7. EXPLICACIÓN INTERMEDIA

- **Certificados:** una CA firma el certificado de cada servicio; cada lado confía solo en esa CA (*truststore*). En el
  *handshake* TLS 1.3 el servidor pide certificado de cliente (`CertificateRequest`) y, si el cliente no envía uno
  válido, corta con la alerta `certificate_required`. En Java: `SSLParameters.setNeedClientAuth(true)`.
- **Identidad SPIFFE:** el certificado no lleva una IP sino una identidad de carga de trabajo en el SAN tipo URI:
  `spiffe://cluster.local/ns/<namespace>/sa/<serviceaccount>`. Es lo que Istio pone en cada certificado y lo que
  `AuthorizationPolicy` usa en `principals`.
- **Istio (modo sidecar):** etiquetar el namespace con `istio-injection=enabled` hace que cada pod nuevo reciba un Envoy;
  `istiod` actúa de CA y rota los certificados (por defecto de vida corta, 24 h). `PeerAuthentication` decide qué acepta
  el lado servidor: `PERMISSIVE` (por defecto: mTLS o texto plano, para migrar), `STRICT` (solo mTLS) o `DISABLE`. El
  lado cliente usa mTLS automáticamente cuando el destino tiene sidecar.
- **Autorización por identidad:** con mTLS el servidor sabe quién llama; `AuthorizationPolicy` permite, por ejemplo, que
  a httpbin solo llegue `cluster.local/ns/tienda/sa/curl`.
- **Lo que mTLS no hace:** no sabe qué **usuario** originó la petición; eso sigue siendo el JWT (F062–F066). mTLS
  autentica servicios; el JWT, personas.

#### 8. EXPLICACIÓN MAESTRA

| Opción | Cómo | A favor | En contra |
|---|---|---|---|
| **mTLS en la aplicación** (Spring con `server.ssl.client-auth=need` y SSL bundles) | Cada servicio gestiona keystore y truststore | Sin infraestructura extra | Rotación y distribución de certificados a mano en cada servicio y lenguaje |
| **Istio sidecar** | Envoy por pod, `istiod` como CA | Funciones completas (políticas L7, telemetría, reintentos) | Memoria y latencia por pod, operación compleja |
| **Istio ambient** | `ztunnel` por nodo para mTLS (L4) y *waypoints* opcionales para L7 | Sin sidecar por pod, menos recursos | Modelo más nuevo; L7 requiere waypoints |
| **Linkerd** | Proxy propio en Rust, mTLS por defecto | Simple y ligero | Menos funciones; la estable la distribuye un proveedor (la edge es gratuita) |

**Migración:** empieza en `PERMISSIVE`, mira en la telemetría qué tráfico aún llega en texto plano, inyecta sidecars en
los clientes y pasa a `STRICT` por namespace; luego `AuthorizationPolicy` con denegación por defecto. **Cuidado** con
*health checks* y tráfico de nodos o de fuera de la malla (Istio reescribe las *probes* de Kubernetes para que pasen).

**Cuándo NO:** con dos o tres servicios en una sola máquina o una red privada sin terceros, el coste operativo de una
malla supera el beneficio; usa TLS en el balanceador y JWT entre servicios. Tampoco la necesitas si tu plataforma ya cifra
y autentica el tráfico entre cargas (algunas nubes lo ofrecen a nivel de red).

#### 9. CÓDIGO EJECUTABLE

**Versiones:** JDK 25 LTS (TLS 1.3 de JSSE, `com.sun.net.httpserver.HttpsServer`) · OpenSSL 3 y `keytool` de JDK 25 para
la PKI · kind con Kubernetes 1.37 · Istio 1.32 (`PeerAuthentication` y `AuthorizationPolicy` en `security.istio.io/v1`).

**Antes (vulnerable)** — `jdk/MtlsDemo.java`, HTTP plano entre servicios con un espía TCP en medio:

```java
// ---------- ANTES (vulnerable): HTTP plano entre servicios ----------
HttpServer plano = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
plano.createContext("/cobros", ex -> {
    byte[] b = "cobro aceptado".getBytes(StandardCharsets.UTF_8);
    ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close();
});
plano.start();
try (Espia espia = new Espia(plano.getAddress().getPort())) {
    String r = pedir(HttpClient.newHttpClient(), "http://127.0.0.1:" + espia.puerto() + "/cobros");
    String capturado = new String(espia.bytes(), StandardCharsets.ISO_8859_1);
    String linea = capturado.lines().filter(l -> l.startsWith("Authorization")).findFirst().orElse("(nada)");
    System.out.println("  el espía de la red lee: " + linea);
}
```

Y en la malla, `mtls-kind/k8s/antes-permissive.yaml`:

```yaml
# ANTES (vulnerable a texto plano): PERMISSIVE acepta mTLS de quien tenga sidecar Y texto plano de quien no.
# Es el modo por defecto de Istio; sirve para migrar, no para quedarse.
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: tienda
spec:
  mtls:
    mode: PERMISSIVE
```

**Después (seguro)** — `jdk/generar-certs.sh` crea la CA `malla-ca` y certificados con identidad SPIFFE:

```bash
#!/usr/bin/env bash
# F067 · Genera la PKI mínima de una malla: una CA, el certificado de "pagos" (servidor),
# el de "pedidos" (cliente) y uno autofirmado de un "intruso". Cada certificado de servicio
# lleva su identidad SPIFFE en el SAN, como los que emite istiod.
# Uso: ./generar-certs.sh [carpeta]   (por defecto target/certs; requiere openssl y keytool)
set -euo pipefail
dir="${1:-target/certs}"
mkdir -p "$dir" && cd "$dir"
clave=cambiala
openssl req -x509 -newkey rsa:2048 -nodes -days 30 -keyout ca.key -out ca.crt -subj "/O=tienda/CN=malla-ca" 2>/dev/null
emitir() { # $1 = nombre, $2 = SAN, $3 = uso (serverAuth|clientAuth)
  openssl req -newkey rsa:2048 -nodes -keyout "$1.key" -out "$1.csr" -subj "/O=tienda/CN=$1" 2>/dev/null
  printf 'subjectAltName=%s\nextendedKeyUsage=%s\n' "$2" "$3" > "$1.ext"
  openssl x509 -req -in "$1.csr" -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -out "$1.crt" -extfile "$1.ext" 2>/dev/null
  openssl pkcs12 -export -in "$1.crt" -inkey "$1.key" -name "$1" -out "$1.p12" -passout pass:$clave
}
emitir pagos "DNS:localhost,IP:127.0.0.1,URI:spiffe://cluster.local/ns/tienda/sa/pagos" serverAuth
emitir pedidos "URI:spiffe://cluster.local/ns/tienda/sa/pedidos" clientAuth
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -keyout intruso.key -out intruso.crt -subj "/O=tienda/CN=pedidos" \
  -addext "subjectAltName=URI:spiffe://cluster.local/ns/tienda/sa/pedidos" -addext "extendedKeyUsage=clientAuth" 2>/dev/null
openssl pkcs12 -export -in intruso.crt -inkey intruso.key -name intruso -out intruso.p12 -passout pass:$clave
rm -f confianza.p12
keytool -importcert -noprompt -alias malla-ca -file ca.crt -keystore confianza.p12 -storetype PKCS12 -storepass $clave >/dev/null 2>&1
openssl verify -CAfile ca.crt pagos.crt pedidos.crt
openssl verify -CAfile ca.crt intruso.crt 2>&1 | grep -m1 "^error" || true
```

y `jdk/MtlsDemo.java` exige certificado de cliente y lee la identidad SPIFFE del que llama:

```java
static SSLContext contexto(String identidad) throws Exception {
    KeyManagerFactory kmf = null;
    if (identidad != null) {
        kmf = KeyManagerFactory.getInstance("PKIX");
        kmf.init(almacen(identidad), CLAVE);
    }
    TrustManagerFactory tmf = TrustManagerFactory.getInstance("PKIX");
    tmf.init(almacen("confianza.p12"));                       // solo confío en la CA de la malla
    SSLContext ctx = SSLContext.getInstance("TLSv1.3");
    ctx.init(kmf == null ? null : kmf.getKeyManagers(), tmf.getTrustManagers(), null);
    return ctx;
}

// en main(): el servidor pagos
HttpsServer pagos = HttpsServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
pagos.setHttpsConfigurator(new HttpsConfigurator(contexto("pagos.p12")) {
    @Override public void configure(HttpsParameters p) {
        SSLParameters sp = getSSLContext().getDefaultSSLParameters();
        sp.setNeedClientAuth(true);                         // la "M" de mTLS: el cliente también se identifica
        sp.setProtocols(new String[] {"TLSv1.3"});
        p.setSSLParameters(sp);
    }
});
pagos.createContext("/cobros", ex -> {
    X509Certificate cliente = (X509Certificate) ((HttpsExchange) ex).getSSLSession().getPeerCertificates()[0];
    String spiffe = "";
    try {
        for (List<?> san : cliente.getSubjectAlternativeNames()) if ((Integer) san.get(0) == 6) spiffe = (String) san.get(1);
    } catch (Exception ignorada) { }
    byte[] b = ("cobro aceptado para " + spiffe).getBytes(StandardCharsets.UTF_8);
    ex.sendResponseHeaders(200, b.length); ex.getResponseBody().write(b); ex.close();
});
```

(el archivo completo, de 162 líneas, incluye el proxy `Espia` y los tres clientes). En la malla, el «después» es
`mtls-kind/k8s/despues-strict.yaml`:

```yaml
# DESPUÉS (seguro): STRICT solo acepta conexiones mTLS con un certificado emitido por istiod.
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: tienda
spec:
  mtls:
    mode: STRICT
```

más, como paso siguiente, `mtls-kind/k8s/solo-pedidos.yaml`, una `AuthorizationPolicy` que solo deja entrar a
`principals: ["cluster.local/ns/tienda/sa/curl"]`.

#### 10. MINI-LABORATORIO

1. Genera la PKI y ejecuta la demostración (ejecutado con OpenSSL 3.0.13 y JDK 25.0.5):

```bash
./generar-certs.sh
java MtlsDemo.java
```

   **Output esperado** (primero `generar-certs.sh`, que comprueba la cadena de cada certificado; el autofirmado del
   intruso no la tiene):

```text
pagos.crt: OK
pedidos.crt: OK
error 18 at 0 depth lookup: self-signed certificate
```

   y después `MtlsDemo.java`:

```text
ANTES (vulnerable): HTTP plano pedidos -> pagos: 200 cobro aceptado
  el espía de la red lee: Authorization: Bearer tok-ana-123
DESPUÉS (seguro): mTLS (TLSv1.3, certificados de la CA malla-ca)
  pedidos con certificado de la malla -> 200 cobro aceptado para spiffe://cluster.local/ns/tienda/sa/pedidos
  cliente sin certificado             -> conexión rechazada: SSLHandshakeException: (certificate_required) Received fatal alert: certificate_required
  intruso con certificado autofirmado -> conexión rechazada: SSLHandshakeException: (certificate_required) Received fatal alert: certificate_required
  el espía ve un registro TLS (primer byte 0x16 = handshake) y "tok-ana-123" legible: false
OK: solo el cliente con certificado de la malla habla con pagos y nadie lee el tráfico
```

   **Captura comentada:** el intruso recibe `certificate_required` igual que el cliente sin certificado: en TLS 1.3 el
   servidor anuncia qué CA acepta y el `KeyManager` del cliente solo ofrece certificados emitidos por ellas; el
   autofirmado no califica y el cliente no envía ninguno.

2. Mira la identidad dentro del certificado:

```bash
openssl x509 -in target/certs/pedidos.crt -noout -ext subjectAltName,extendedKeyUsage
```

   **Output esperado:**

```text
X509v3 Subject Alternative Name:
    URI:spiffe://cluster.local/ns/tienda/sa/pedidos
X509v3 Extended Key Usage:
    TLS Web Client Authentication
```

3. Monta la malla en kind (necesita Docker Desktop con 8 GB, `kind`, `kubectl` e Internet):

```bash
cd ../mtls-kind
./instalar.sh
./verificar-mtls.sh
```

   **Output esperado** (de `verificar-mtls.sh`; el patrón es el de la tarea oficial de migración a mTLS de Istio):

```text
== ANTES: PeerAuthentication PERMISSIVE
curl.tienda -> httpbin.tienda: 200
curl.legado -> httpbin.tienda: 200
== DESPUÉS: PeerAuthentication STRICT
curl.tienda -> httpbin.tienda: 200
curl.legado -> httpbin.tienda: 000command terminated with exit code 56
RESULTADO: OK · F067 mTLS STRICT rechaza al cliente sin sidecar
```

   **Captura comentada:** `instalar.sh` termina mostrando los pods de `tienda` con dos contenedores (`httpbin,istio-proxy`
   y `curl,istio-proxy`) y el de `legado` con uno (`curl`). El `000` es el código HTTP que `curl` imprime cuando no hubo
   respuesta; el 56 es «fallo al recibir datos»: Envoy cerró la conexión en texto plano.

4. **Fallo deliberado:** aplica `kubectl apply -f k8s/solo-pedidos.yaml` y repite `./verificar-mtls.sh`: la línea de
   `curl.tienda` sigue en `200`. Ahora cambia el principal a `cluster.local/ns/tienda/sa/otro` y aplica de nuevo:
   `curl.tienda` recibe `403` (`RBAC: access denied`), porque mTLS identifica al llamante y la política no lo incluye.
   Borra la política con `kubectl delete -f k8s/solo-pedidos.yaml`.

#### 11. VERIFICACIÓN

El test es el propio `MtlsDemo.java` (termina con código 0 solo si se cumplen las cinco condiciones) y, en la malla,
`mtls-kind/verificar-mtls.sh`, que termina en `RESULTADO: OK` o con código 1:

```bash
./verificar.sh --solo-jdk        # incluye generar-certs.sh y MtlsDemo.java
./verificar.sh --mtls            # además, kind + Istio
```

```java
// condiciones que comprueba MtlsDemo.java antes de imprimir OK
if (!conCert.startsWith("200") || !sinCert.startsWith("conexión rechazada")
        || !intruso.startsWith("conexión rechazada") || capturado.contains("tok-ana-123") || b[0] != 0x16) fallos++;
```

**Output esperado:** `OK: solo el cliente con certificado de la malla habla con pagos y nadie lee el tráfico` y, con
`--mtls`, `RESULTADO: OK · F067 mTLS STRICT rechaza al cliente sin sidecar`.

**Pregunta de comprobación:** con `STRICT` activo, ¿puede un pod de `tienda` con sidecar pero comprometido llamar a
httpbin? ¿Qué añadirías?

<details>
<summary>Respuesta</summary>

Sí: tiene un certificado válido de la malla, así que mTLS lo deja pasar. mTLS autentica, no autoriza. Añadiría una
`AuthorizationPolicy` que solo permita los `principals` que deben llamar (y, para el usuario final, la validación del JWT
en el servicio).
</details>

#### 12. ERROR COMÚN

**Síntoma:** tras pasar a `STRICT`, los *health checks* o un servicio fuera de la malla empiezan a fallar con
«connection reset by peer» o `upstream connect error or disconnect/reset before headers`.

**Cómo se ve:** `kubectl get pods` muestra reinicios, o el cliente externo recibe `curl: (56) Recv failure: Connection
reset by peer`; el mismo patrón que la línea `000... exit code 56` del laboratorio.

**Diagnóstico:** el cliente no tiene sidecar (otro namespace sin inyección, un *job* creado antes de etiquetar el
namespace, un servicio en una VM). `istioctl x describe pod <pod>` y `kubectl get pod <pod> -o jsonpath='{.spec.containers[*].name}'`
muestran si tiene `istio-proxy`.

**Arreglo:** inyecta el sidecar al cliente (etiqueta el namespace y **reinicia** los pods: la inyección ocurre al
crearlos), o declara una excepción explícita por puerto con `portLevelMtls` mientras migras. No vuelvas todo el mesh a
`PERMISSIVE`.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué aporta mTLS en una malla de servicios y qué no resuelve?»

**Respuesta modelo:** cifra todo el tráfico entre servicios y autentica a ambos extremos con certificados de vida corta
que la malla emite y rota sola, con identidades SPIFFE por cuenta de servicio; eso elimina el «confío porque estás en mi
red» y permite políticas de autorización por identidad de servicio (`AuthorizationPolicy`). En Istio se activa con
`PeerAuthentication` en `STRICT` tras una fase `PERMISSIVE`. No resuelve la identidad del **usuario** (eso es el JWT),
no protege de un servicio legítimo comprometido sin políticas de autorización, no reemplaza la validación de entrada y
añade coste: un proxy por pod (o `ztunnel` por nodo en modo ambient), latencia y operación.

#### 14. ANTI-PATRÓN RELACIONADO

**«La red interna es segura»:** el tráfico entre servicios en HTTP plano, protegido solo por el firewall perimetral:

```yaml
# Ingress con TLS hacia fuera... y todo lo de dentro en texto plano y sin identidad
spec:
  tls: [{ hosts: [tienda.example.com], secretName: tls-externo }]
---
env:
  - name: PAGOS_URL
    value: http://pagos.tienda.svc:8080      # cualquiera dentro del clúster lee y suplanta
```

Una vez dentro (un pod vulnerable, una credencial filtrada), el atacante lee tokens y llama a cualquier servicio. El
principio *Zero-Trust* (Módulo 27) exige cifrar y autenticar cada salto.

---
### HashiCorp Vault

#### 1. UBICACIÓN

Módulo 9, Lección 8 de 9 · Fase 1 · 2 h
`VaultKv.java` y `f068-vault`.

#### 2. PRERREQUISITOS

- Módulo 1: perfiles y configuración externalizada (`spring.config.import`, variables de entorno).
- Módulo 7: Config Server (configuración centralizada).
- Módulo 0.4: variables de entorno y `git log`.

#### 3. OBJETIVO DE APRENDIZAJE

**Sacar** un secreto del repositorio y **servirlo** desde Vault (motor KV v2) a una aplicación Spring Boot con Spring
Cloud Vault, **restringir** el acceso con una política de solo lectura y un token de vida corta, y **verificar** con 2
tests que el secreto llega desde Vault y nunca se expone por la API.

#### 4. ANALOGÍA VISUAL

La **caja de seguridad de un banco** frente a la **llave debajo del tapete**. Escribir la contraseña en
`application.properties` es dejar la llave bajo el tapete: cualquiera que pase por la puerta (quien clone el repositorio,
quien vea un *backup*, quien lea el historial de git) la tiene para siempre. Vault es la caja del banco: la llave está
dentro, el banco anota **quién abrió qué y cuándo** (auditoría), cada cliente tiene una **tarjeta que solo abre su caja**
(política) y que **caduca** (token con TTL), y puede incluso **fabricar una llave nueva para cada visita** que se
destruye al salir (secretos dinámicos). El dibujo: a la izquierda una puerta con una llave asomando bajo el tapete y
varias personas copiándola; a la derecha una bóveda con un libro de registro y casilleros con nombre.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant Op as Operador / CI
    participant V as Vault 2.2.0 (KV v2 en secret/)
    participant App as f068-pagos (Spring Cloud Vault)
    Op->>V: vault kv put secret/f068-pagos tienda.pagos.api-key=...
    Op->>V: vault policy write f068-pagos (read en secret/data/f068-pagos)
    Op->>V: vault token create -policy=f068-pagos -ttl=1h
    V-->>Op: token hvs.... (solo esa política)
    Op->>App: arranca con VAULT_TOKEN=hvs....
    App->>V: GET /v1/secret/data/f068-pagos (X-Vault-Token)
    V->>V: ¿la política permite read? registra en auditoría
    V-->>App: {"data":{"data":{"tienda.pagos.api-key":"..."},"metadata":{"version":1}}}
    App->>App: PropertySource "vault" → @Value("${tienda.pagos.api-key}")
    Note over App: GET /config/pagos solo devuelve una huella SHA-256
```

**Texto alternativo:** diagrama de secuencia. El operador o el sistema de CI guarda el secreto en Vault con vault kv put
en la ruta secret/f068-pagos, escribe una política de solo lectura y crea un token con esa política y una hora de vida.
La aplicación f068-pagos arranca con ese token y, con Spring Cloud Vault, pide GET /v1/secret/data/f068-pagos. Vault
comprueba la política, registra el acceso y responde con los datos y la versión del secreto. Spring lo añade como fuente
de propiedades y la aplicación lo inyecta con @Value; el endpoint de la aplicación solo devuelve una huella SHA-256.

#### 6. EXPLICACIÓN NIVEL 0

Un **secreto** es cualquier dato que da acceso: contraseñas de bases de datos, claves de APIs de pago, certificados.
Si lo escribes en el código o en un archivo del repositorio, queda copiado en cada computador y en el historial de git
**para siempre**. **Vault** es un programa que guarda los secretos cifrados, solo los entrega a quien tiene permiso,
registra quién los pidió y puede cambiarlos sin tocar el código. Tu aplicación, al arrancar, le pide a Vault lo que
necesita en lugar de leerlo de un archivo.

#### 7. EXPLICACIÓN INTERMEDIA

- **Motores (*secrets engines*):**KV v2** guarda pares clave-valor con versiones (en modo dev viene montado en
  `secret/`; la API añade `data/`: se lee en `GET /v1/secret/data/<ruta>`); **database** genera usuarios de base de
  datos temporales (secretos dinámicos con *lease*); **transit** cifra datos sin entregar la clave; **pki** emite
  certificados.
- **Autenticación:** el token es la credencial final. Se obtiene con un método de autenticación: `token` (estático, solo
  laboratorio), **AppRole** (role_id + secret_id para CI), **Kubernetes** (la cuenta de servicio del pod), **JWT/OIDC**
  y los de cada nube. Los tokens tienen **TTL** y se pueden revocar.
- **Políticas (HCL):** deniegan por defecto; cada `path` concede capacidades (`read`, `create`, `update`, `delete`,
  `list`). En KV v2 la ruta de la política incluye `data/`.
- **Sellado:** un Vault de producción arranca **sellado** y se desella con claves de Shamir o *auto-unseal* (KMS de la
  nube); el modo `-dev` arranca desellado, en memoria y con un token raíz conocido: **nunca** en producción.
- **Spring Cloud Vault 5.0:** `spring.config.import=vault://` monta Vault como `PropertySource` con todos los motores
  activos (KV por defecto); con `spring.application.name=f068-pagos` lee `secret/f068-pagos` y `secret/application`
  (y `secret/f068-pagos/<perfil>` con perfiles). El motor de bases de datos se activa con `spring.cloud.vault.database.*`
  y rellena `spring.datasource.username`/`password` con credenciales temporales.

#### 8. EXPLICACIÓN MAESTRA

| Opción | A favor | En contra | Cuándo |
|---|---|---|---|
| **Variables de entorno** del orquestador | Simple, 12-Factor | Se ven en `docker inspect`/`ps e`, sin rotación ni auditoría | Secretos de bajo riesgo, entornos pequeños |
| **Kubernetes Secrets** | Nativo, montaje como archivo | Base64, no cifrado por defecto en etcd (activa *encryption at rest*), RBAC grueso | Con cifrado en reposo y External Secrets Operator |
| **Vault** (autoalojado; desde la 1.14 con licencia BSL) | Secretos dinámicos, cifrado como servicio, auditoría, multi-nube | Operación crítica: HA, desellado, copias | Plataformas con muchos servicios y requisitos de auditoría |
| **OpenBao** (bifurcación de Vault con licencia MPL) | API compatible, abierta | Comunidad más joven | Si la licencia BSL es un problema |
| **Gestor de la nube** (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) | Gestionado, IAM nativo | Atado a un proveedor | Todo en una sola nube |

**Secretos dinámicos:** en vez de una contraseña de base de datos compartida y eterna, Vault crea un usuario por
instancia con *lease* de, por ejemplo, 1 h y lo borra al vencer; si se filtra, caduca solo y la auditoría dice qué pod lo
tenía. **Rotación:** un secreto KV cambiado no llega solo a la app: necesitas reinicio, `@RefreshScope` o leases.

**Cuándo NO:** para un prototipo local o un servicio con un único secreto en una nube que ya ofrece un gestor nativo,
operar Vault (alta disponibilidad, desellado, actualizaciones) cuesta más de lo que protege; usa el gestor de la nube o
variables del orquestador con cifrado en reposo.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** HashiCorp Vault 2.2.0 (`hashicorp/vault:2.2.0`) · Spring Boot 4.1.3 · Spring Cloud 2025.1.4 con
`spring-cloud-starter-vault-config` (Spring Cloud Vault 5.0) · JDK 25 LTS.

**Antes (vulnerable)** — `f068-vault/src/main/resources/application-antes.properties`:

```properties
# ANTES (vulnerable): el secreto vive en el repositorio, en texto plano, en cada copia y en el historial de git.
spring.config.import=
spring.cloud.vault.enabled=false
tienda.pagos.api-key=clave-de-pagos-en-texto-plano
```

Aunque luego lo borres, sigue en el historial: `git log -p -S "clave-de-pagos" -- '*.properties'` lo encuentra.

**Después (seguro)** — `f068-vault/build.gradle.kts`:

```kotlin
// F068 · HashiCorp Vault: secretos con Spring Cloud Vault
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${libs.versions.spring.cloud.get()}")
    }
}

dependencies {
    // Spring MVC + Tomcat 11 + Jackson 3
    implementation(libs.spring.boot.starter.webmvc)
    // Spring Cloud Vault 5.0 (spring.config.import=vault://)
    implementation(libs.spring.cloud.starter.vault.config)
    // JUnit Jupiter 6, AssertJ, Mockito
    testImplementation(libs.spring.boot.starter.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

`src/main/resources/application.properties`:

```properties
# DESPUÉS (seguro): el secreto no está en el repositorio; se lee de Vault al arrancar.
spring.application.name=f068-pagos
spring.config.import=vault://
spring.cloud.vault.uri=${VAULT_ADDR:http://127.0.0.1:8200}
# Token estático: solo para el laboratorio. En Kubernetes usa spring.cloud.vault.authentication=KUBERNETES.
spring.cloud.vault.token=${VAULT_TOKEN}
# Motor KV v2 montado en "secret": se lee secret/f068-pagos y secret/application.
spring.cloud.vault.kv.enabled=true
spring.cloud.vault.kv.backend=secret
spring.cloud.vault.kv.backend-version=2
server.port=8085
```

`src/main/java/academia/seguridad/vault/ConfigPagosController.java`:

```java
package academia.seguridad.vault;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ConfigPagosController {

    private final String apiKey;
    private final String origen;

    ConfigPagosController(@Value("${tienda.pagos.api-key}") String apiKey,
                          @Value("${spring.cloud.vault.enabled:true}") boolean conVault) {
        this.apiKey = apiKey;
        this.origen = conVault ? "vault" : "archivo de propiedades";
    }

    /** Nunca devuelvas ni registres el secreto: una huella basta para comprobar cuál se cargó. */
    @GetMapping("/config/pagos")
    Map<String, String> config() throws Exception {
        byte[] h = MessageDigest.getInstance("SHA-256").digest(apiKey.getBytes(StandardCharsets.UTF_8));
        return Map.of("origen", origen, "huella", "sha256:" + HexFormat.of().formatHex(h).substring(0, 12));
    }
}
```

`vault/f068-pagos.hcl` (política) y `vault/sembrar.sh` (guarda el secreto y emite un token con esa política):

```hcl
# Política de mínimo privilegio para el servicio de pagos (F068): solo LEER sus secretos.
# En KV v2 la API añade "data/" a la ruta: secret/f068-pagos se lee en secret/data/f068-pagos.
path "secret/data/f068-pagos" {
  capabilities = ["read"]
}
path "secret/data/application" {
  capabilities = ["read"]
}
```

```bash
#!/usr/bin/env bash
# F068 · Guarda el secreto de pagos en Vault, crea la política de solo lectura y emite un token
# con esa política (válido 1 h). Imprime SOLO el token, para usarlo así:
#   export VAULT_TOKEN=$(./vault/sembrar.sh)
set -euo pipefail
cd "$(dirname "$0")/.."
v() { docker compose exec -T -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN=root-solo-dev vault vault "$@"; }
v kv put secret/f068-pagos tienda.pagos.api-key=clave-de-pagos-desde-vault >/dev/null
v policy write f068-pagos - < vault/f068-pagos.hcl >/dev/null
v token create -policy=f068-pagos -ttl=1h -field=token
```

El servicio de Vault en `docker-compose.yml`:

```yaml
  vault:
    image: hashicorp/vault:2.2.0
    # Modo dev: en memoria, desellado y con KV v2 montado en secret/. NUNCA en producción.
    cap_add: [IPC_LOCK]
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: root-solo-dev
      VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
    ports: ["8200:8200"]
    healthcheck:
      test: ["CMD", "vault", "status", "-address=http://127.0.0.1:8200"]
      interval: 2s
      timeout: 3s
      retries: 30
```

`jdk/VaultKv.java` hace la misma lectura que Spring con `java.net.http` (útil para entender la API y diagnosticar):
`GET {VAULT_ADDR}/v1/secret/data/f068-pagos` con la cabecera `X-Vault-Token`, y muestra las claves con los valores
ocultos y la versión del secreto.

#### 10. MINI-LABORATORIO

1. Levanta Vault, siembra el secreto y obtén un token restringido:

```bash
docker compose up -d --wait vault
export VAULT_TOKEN=$(./vault/sembrar.sh)
echo "${VAULT_TOKEN:0:4}…"
```

   **Output esperado:** `docker compose` termina con `Container modulo-13-vault-1  Healthy` y el `echo` muestra
   `hvs.…` (los tokens de servicio de Vault empiezan por `hvs.`).

2. Léelo con la API HTTP:

```bash
VAULT_ADDR=http://127.0.0.1:8200 java jdk/VaultKv.java secret f068-pagos
```

   **Output esperado:**

```text
HTTP 200
claves (valores ocultos): {"tienda.pagos.api-key":"****"}
versión del secreto: 1
```

3. Comprueba que la política es de **solo lectura** y **solo de esa ruta**:

```bash
docker compose exec -T -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN="$VAULT_TOKEN" vault \
  vault kv put secret/f068-pagos tienda.pagos.api-key=otra
VAULT_ADDR=http://127.0.0.1:8200 java jdk/VaultKv.java secret otra-app
```

   **Output esperado:** el primer comando falla con `Code: 403. Errors:` y `* permission denied`; el segundo imprime
   `HTTP 403` y `{"errors":["permission denied"]}`.

4. Arranca la app y pide la huella:

```bash
cd f068-vault && ../gradlew -q bootRun &
sleep 15 && curl -s localhost:8085/config/pagos; echo
```

   **Output esperado:** `{"origen":"vault","huella":"sha256:4cf1a3d364d5"}` (las claves del JSON pueden salir en otro
   orden). La huella es la de `clave-de-pagos-desde-vault`, calculada aquí con
   `printf 'clave-de-pagos-desde-vault' | sha256sum | cut -c1-12`. Con el perfil `antes`
   (`--args='--spring.profiles.active=antes'`) responde `{"origen":"archivo de propiedades","huella":"sha256:f061fd53677a"}`.

5. **Fallo deliberado:** detén la app, `unset VAULT_TOKEN` y vuelve a arrancarla: el arranque falla porque no se puede
   resolver `${VAULT_TOKEN}`. Exporta un token inventado (`export VAULT_TOKEN=hvs.falso`): ahora falla al leer Vault con un
   `403` (`permission denied`). En ambos casos la app **no arranca sin su secreto**, que es lo que quieres.

#### 11. VERIFICACIÓN

`f068-vault/src/test/java/academia/seguridad/vault/SecretoDesdeVaultTest.java` (necesita el Vault del laboratorio
sembrado y `VAULT_TOKEN` exportado; `./verificar.sh` lo prepara):

```java
package academia.seguridad.vault;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Necesita el Vault del laboratorio sembrado:
 *   docker compose up -d --wait vault && export VAULT_TOKEN=$(./vault/sembrar.sh)
 */
@SpringBootTest
class SecretoDesdeVaultTest {

    @Value("${tienda.pagos.api-key}") String apiKey;
    @Autowired ConfigPagosController controller;

    @Test
    void elSecretoLlegaDesdeVault() {
        assertThat(apiKey).isEqualTo("clave-de-pagos-desde-vault");
    }

    @Test
    void elEndpointSoloMuestraUnaHuella() throws Exception {
        Map<String, String> r = controller.config();
        String esperado = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
            .digest("clave-de-pagos-desde-vault".getBytes(StandardCharsets.UTF_8))).substring(0, 12);
        assertThat(r).containsEntry("origen", "vault").containsEntry("huella", "sha256:" + esperado);
        assertThat(r.values()).noneMatch(v -> v.contains("clave-de-pagos"));
    }
}
```

```bash
export VAULT_TOKEN=$(./vault/sembrar.sh)
cd f068-vault && ../gradlew test
```

**Output esperado:** 2 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.

**Pregunta de comprobación:** ¿por qué la política dice `secret/data/f068-pagos` y no `secret/f068-pagos`, y qué pasa si
el token de la app intenta escribir?

<details>
<summary>Respuesta</summary>

En KV v2 la API real del secreto es `/v1/secret/data/<ruta>` (los metadatos están en `secret/metadata/<ruta>`); la
política se escribe sobre la ruta de la API. El token solo tiene `read`: cualquier escritura responde `403 permission
denied` (paso 3).
</details>

#### 12. ERROR COMÚN

**Síntoma:** la aplicación arranca, pero la propiedad sale vacía o falla con `Could not resolve placeholder
'tienda.pagos.api-key'`, aunque `vault kv get secret/f068-pagos` sí la muestra.

**Cómo se ve:** el contexto de Spring no arranca con ese mensaje; si Vault no está levantado, `VaultKv.java` muestra
`Exception in thread "main" java.net.ConnectException` (ejecutado aquí sin Vault).

**Diagnóstico:** revisa, en este orden: (1) `spring.application.name` debe coincidir con la ruta (`f068-pagos`); (2) la
política debe incluir `data/` en KV v2; (3) el token debe ser el de la app, no uno caducado (`vault token lookup`); (4)
`spring.config.import=vault://` debe estar presente. Lee con `VaultKv.java` usando el mismo token para separar «Vault
niega» de «Spring no lo busca ahí».

**Arreglo:** corrige el nombre o fija la ruta con `spring.cloud.vault.kv.application-name`, ajusta la política y emite
un token nuevo. Nunca «arregles» volviendo a poner el secreto en el archivo.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo gestionas las credenciales de base de datos de 40 microservicios en Kubernetes?»

**Respuesta modelo:** fuera del repositorio y sin credenciales compartidas eternas. Uso Vault con el método de
autenticación de Kubernetes: cada pod se autentica con su cuenta de servicio y recibe un token con una política de
mínimo privilegio. Para la base de datos uso el motor `database` con secretos dinámicos: cada instancia obtiene un
usuario propio con *lease* corto que Vault revoca al vencer; Spring Cloud Vault lo inyecta en `spring.datasource.*` y
renueva el lease. Activo auditoría, Vault en alta disponibilidad con auto-unseal, y escaneo de secretos en CI (por
ejemplo, el escáner de secretos de Trivy) para que nada vuelva al repositorio. Si todo está en una nube, el gestor de
secretos nativo con External Secrets es una alternativa con menos operación.

#### 14. ANTI-PATRÓN RELACIONADO

**El secreto «escondido» en Base64 o en una variable de entorno impresa:**

```yaml
# kubernetes: "lo pusimos en un Secret", pero el manifiesto con el valor está en git
apiVersion: v1
kind: Secret
metadata: { name: pagos }
data:
  api-key: Y2xhdmUtZGUtcGFnb3MtZW4tdGV4dG8tcGxhbm8=   # base64 no es cifrado: echo ... | base64 -d
```

```java
log.info("Arrancando con configuración: {}", System.getenv());   // imprime todos los secretos en los logs
```

Base64 es una codificación reversible y los logs se copian a muchos sistemas. Los secretos se leen de un gestor en
tiempo de ejecución, nunca se registran y, si una aplicación necesita demostrar cuál cargó, muestra una huella.

---
### Escaneo de vulnerabilidades: Trivy, Snyk

#### 1. UBICACIÓN

Módulo 9, Lección 9 de 9 · Fase 1 · 1,5 h
`MiniEscaner.java`.

#### 2. PRERREQUISITOS

- Módulo 1: dependencias declaradas en el archivo de build. Aquí leerás un `pom.xml` de Maven: cada dependencia es un
  `<dependency>` con `groupId`, `artifactId` y `version`.
- Módulo 0.5: `Dockerfile` y `docker run`.
- Idea de versión semántica (`2.14.1` < `2.15.0`).

#### 3. OBJETIVO DE APRENDIZAJE

**Detectar** dependencias con vulnerabilidades conocidas (CVE) y errores de configuración en un `Dockerfile` con Trivy y
Snyk, **interpretar** el informe (paquete, versión instalada, CVE, severidad, versión corregida) y **romper el build**
cuando aparezca algo HIGH o CRITICAL, comprobándolo con códigos de salida (`1` en el «antes», `0` en el «después»).

#### 4. ANALOGÍA VISUAL

El **control de calidad de una fábrica de alimentos** que revisa **cada ingrediente contra la lista de lotes retirados**
que publica el ministerio de salud. Tu servicio es el plato; las librerías son los ingredientes, que tú no cocinaste. La
lista de retirados es la base de datos de vulnerabilidades (CVE/GHSA). El inspector (Trivy o Snyk) lee la etiqueta de cada
ingrediente (nombre y versión), la compara con la lista y, si encuentra un lote retirado, detiene la línea antes de
empaquetar. El dibujo: una cinta transportadora con frascos etiquetados `log4j-core 2.14.1` y `snakeyaml 1.33`, un
inspector con una lista roja y una palanca de «parar línea» bajada.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    subgraph CI["Pipeline de CI (cada PR y cada noche)"]
      B["mvn package"] --> TF["trivy fs<br/>pom.xml / jars"]
      B --> D["docker build"] --> TI["trivy image<br/>paquetes del SO + jars"]
      D --> TC["trivy config<br/>Dockerfile, manifiestos"]
      B --> SN["snyk test<br/>árbol de dependencias"]
    end
    DB[("Bases de avisos<br/>NVD · GitHub Advisory<br/>avisos de distribuciones")] -.-> TF
    DB -.-> TI
    SDB[("Base de Snyk")] -.-> SN
    TF --> G{"¿HIGH o CRITICAL?"}
    TI --> G
    TC --> G
    SN --> G
    G -->|"sí: exit 1"| X["Build rojo<br/>actualiza o justifica"]
    G -->|"no: exit 0"| R["Publica la imagen"]
```

**Texto alternativo:** pipeline de integración continua. Tras mvn package, trivy fs escanea el pom.xml y los jars; tras
docker build, trivy image escanea los paquetes del sistema operativo y los jars de la imagen y trivy config revisa el
Dockerfile y los manifiestos; snyk test revisa el árbol de dependencias. Trivy consulta bases de avisos como NVD, GitHub
Advisory y los avisos de cada distribución; Snyk usa su propia base. Todos alimentan una decisión: si hay hallazgos HIGH o
CRITICAL el comando sale con código 1 y el build se pone rojo; si no, sale con 0 y se publica la imagen.

#### 6. EXPLICACIÓN NIVEL 0

Tu servicio usa decenas de **librerías** escritas por otras personas, y cada imagen Docker trae un sistema operativo con
cientos de paquetes. Cuando alguien descubre un fallo de seguridad en una de ellas, se publica con un identificador
(**CVE**, como `CVE-2021-44228`) y una gravedad. Un **escáner** lee qué versiones usas y te avisa si alguna está en la
lista. **Trivy** es gratuito y de código abierto; **Snyk** tiene un plan gratuito con cuenta. Los dos se ejecutan en tu
computador y en CI para que una librería peligrosa no llegue a producción.

#### 7. EXPLICACIÓN INTERMEDIA

- **Qué escanea Trivy:** `trivy fs <carpeta>` (manifiestos como `pom.xml`, `package-lock.json`, y jars), `trivy image
  <imagen>` (paquetes del SO + dependencias de la aplicación dentro de la imagen), `trivy config` (errores de
  configuración en `Dockerfile`, Kubernetes, Terraform) y `trivy k8s` (un clúster). `--scanners vuln,secret,misconfig`
  elige qué buscar; el escáner de **secretos** encuentra claves pegadas en el código (F068).
- **Cómo decide:** compara nombre y versión con bases de avisos (para Java, sobre todo GitHub Advisory Database; para el
  SO, los avisos de cada distribución). `--severity HIGH,CRITICAL` filtra; `--exit-code 1` hace que el comando falle si
  encuentra algo; `--ignore-unfixed` oculta lo que aún no tiene corrección; `.trivyignore` documenta excepciones
  aceptadas. `--format sarif` o `cyclonedx` genera informes o un SBOM.
- **Qué escanea Snyk:** `snyk test` (dependencias, resuelve el árbol con Maven), `snyk container test <imagen>`,
  `snyk iac test` y `snyk code test` (análisis estático del código). Requiere `snyk auth` (cuenta gratuita). Códigos de
  salida: `0` sin hallazgos, `1` con hallazgos, `2` error, `3` sin proyecto soportado. `--severity-threshold=high`
  equivale al filtro de Trivy; `snyk monitor` sube una foto del proyecto para recibir alertas de CVE nuevos.
- **Transitivas:** casi todas las vulnerabilidades vienen por dependencias que no declaraste. Los dos escáneres muestran
  la ruta («introducido por»); en Maven se corrige subiendo la directa, con `<dependencyManagement>` o dejando que el BOM
  de Spring Boot gestione la versión.

#### 8. EXPLICACIÓN MAESTRA

| Herramienta | Licencia y coste | Fortalezas | Límites |
|---|---|---|---|
| **Trivy** | Apache 2.0, gratis | Un binario para dependencias, imágenes, IaC, secretos y SBOM; sin cuenta | Base de datos que se descarga (cachéala en CI); menos contexto de explotabilidad |
| **Snyk** | Plan gratuito con límite de pruebas; planes de pago | Asesoría de corrección, PR automáticos, priorización, monitoreo continuo | Necesita cuenta y envía metadatos del proyecto a su servicio |
| **OWASP Dependency-Check** | Apache 2.0 | Plugin de Maven, solo Java/.NET | Lento la primera vez; más falsos positivos |
| **Grype** (+ Syft para SBOM) | Apache 2.0 | Rápido, buen soporte de SBOM | Solo vulnerabilidades |
| **Dependabot / Renovate** | Gratis en GitHub / abierto | Abren PR con la actualización | No sustituyen el escaneo de la imagen final |

**Estrategia:** escanea en tres momentos: en el PR (rompe el build en HIGH/CRITICAL con corrección disponible), en el
registro de imágenes cada noche (aparecen CVE nuevos en imágenes ya publicadas) y en el clúster. Reduce superficie
(imágenes `-jre`, *distroless* o *chiseled*, Módulo 12) antes de ajustar filtros. Una vulnerabilidad no corregible se
documenta en `.trivyignore`/`.snyk` con fecha de revisión, nunca se silencia sin explicación.

**Cuándo NO romper el build:** en ramas de exploración o en vulnerabilidades sin corrección disponible y no explotables
en tu contexto (documentadas); romperlo siempre por LOW/MEDIUM entrena al equipo a ignorar el escáner.

#### 9. CÓDIGO EJECUTABLE

**Versiones:** Trivy 0.76.1 (`aquasec/trivy:0.76.1`) · Snyk CLI 1.1309.0 (`npx snyk@1.1309.0`) · JDK 25 LTS para
`MiniEscaner.java` · avisos consultados en GitHub Advisory Database: GHSA-jfh8-c2jp-5v3q (CVE-2021-44228, CRITICAL 10.0,
corregido en 2.15.0 para la rama 2.13+) y GHSA-mjmj-j48q-9wg2 (CVE-2022-1471, HIGH 8.3, afecta a snakeyaml ≤ 1.33,
corregido en 2.0).

> **Por qué aquí sigue habiendo `pom.xml`.** El resto del curso se construye con Gradle, pero `f069-escaneo/antes` y
> `f069-escaneo/despues` no se compilan: son el material que leen `trivy fs`, `snyk test` y `jdk/MiniEscaner.java`, y
> un `pom.xml` declara las versiones en un formato que los tres entienden sin ejecutar nada. Para escanear un
> proyecto Gradle, Trivy necesita el archivo de bloqueo `gradle.lockfile` (lo genera el *dependency locking* de
> Gradle) y Snyk ejecuta Gradle para resolver el árbol *(detalle de Trivy y Snyk con Gradle pendiente de verificación
> en el Mac)*.

**Antes (vulnerable)** — `f069-escaneo/antes/pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- F069 · ANTES (vulnerable): log4j-core 2.14.1 (Log4Shell) y snakeyaml 1.33.
     Proyecto solo para escanear: trivy fs, snyk test y java ../../jdk/MiniEscaner.java lo leen. -->
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia.microservicios</groupId>
  <artifactId>f069-escaneo-antes</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.release>25</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.apache.logging.log4j</groupId>
      <artifactId>log4j-core</artifactId>
      <version>2.14.1</version>
    </dependency>
    <dependency>
      <groupId>org.yaml</groupId>
      <artifactId>snakeyaml</artifactId>
      <version>1.33</version>
    </dependency>
  </dependencies>
</project>
```

y `f069-escaneo/antes/Dockerfile`:

```dockerfile
# F069 · ANTES (vulnerable): imagen completa, sin usuario propio (corre como root) y etiqueta móvil.
FROM eclipse-temurin:latest
COPY target/app.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Después (seguro)** — `f069-escaneo/despues/pom.xml` es idéntico salvo las versiones: `log4j-core` **2.24.3** y
`snakeyaml` **2.4** (en un proyecto Spring Boot, mejor aún: sin `<version>`, gestionadas por el BOM). Y
`f069-escaneo/despues/Dockerfile`:

```dockerfile
# F069 · DESPUÉS (seguro): versión fijada, solo el JRE, usuario sin privilegios y healthcheck.
FROM eclipse-temurin:25-jre
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app app
COPY --chown=app:app target/app.jar /app/app.jar
USER 10001
HEALTHCHECK --interval=30s --timeout=3s CMD ["java", "-version"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Para entender qué hace un escáner por dentro, `jdk/MiniEscaner.java` lee el `pom.xml`, compara versiones con dos avisos
reales y sale con código 1 si hay HIGH/CRITICAL:

```java
// F069 · Escaneo de vulnerabilidades — qué hace por dentro Trivy/Snyk con tus dependencias, en JDK 25.
// 1) Lee las dependencias declaradas en un pom.xml.  2) Las cruza con una base de avisos (aquí, 2
// avisos reales copiados de GitHub Advisory Database; Trivy y Snyk descargan miles).  3) Si encuentra
// algo de severidad HIGH o CRITICAL termina con código 1, como "trivy --exit-code 1".
// Uso:  java MiniEscaner.java ../f069-escaneo/antes/pom.xml
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MiniEscaner {

    record Dependencia(String grupo, String artefacto, String version) { }
    // Rango simplificado "versión < corregida". El aviso de Log4Shell tiene tres rangos
    // (2.0-beta9 a <2.3.1, 2.4 a <2.12.2 y 2.13.0 a <2.15.0); para 2.13+ basta con este.
    record Aviso(String id, String ghsa, String paquete, String corregida, String severidad, double cvss, String titulo) { }

    static final List<Aviso> AVISOS = List.of(
            new Aviso("CVE-2021-44228", "GHSA-jfh8-c2jp-5v3q", "org.apache.logging.log4j:log4j-core", "2.15.0",
                    "CRITICAL", 10.0, "Log4Shell: ejecución remota de código vía JNDI en mensajes de log"),
            new Aviso("CVE-2022-1471", "GHSA-mjmj-j48q-9wg2", "org.yaml:snakeyaml", "2.0",
                    "HIGH", 8.3, "El Constructor de SnakeYAML permite deserializar clases arbitrarias"));

    // Compara versiones numéricas por partes: 2.14.1 < 2.15.0, 1.33 < 2.0.
    static int comparar(String a, String b) {
        String[] x = a.split("[.-]"), y = b.split("[.-]");
        for (int i = 0; i < Math.max(x.length, y.length); i++) {
            int p = i < x.length && x[i].matches("\\d+") ? Integer.parseInt(x[i]) : 0;
            int q = i < y.length && y[i].matches("\\d+") ? Integer.parseInt(y[i]) : 0;
            if (p != q) return Integer.compare(p, q);
        }
        return 0;
    }

    public static void main(String[] args) throws Exception {
        String pom = Files.readString(Path.of(args[0]));
        Matcher m = Pattern.compile("<dependency>\\s*<groupId>([^<]+)</groupId>\\s*<artifactId>([^<]+)</artifactId>\\s*"
                + "<version>([^<]+)</version>").matcher(pom);
        int graves = 0, total = 0;
        System.out.println(args[0]);
        System.out.printf("%-36s %-9s %-15s %-13s %-9s%n", "Librería", "Instalada", "Vulnerabilidad", "Severidad", "Corregida");
        while (m.find()) {
            Dependencia d = new Dependencia(m.group(1), m.group(2), m.group(3));
            total++;
            for (Aviso a : AVISOS) {
                if (a.paquete().equals(d.grupo() + ":" + d.artefacto()) && comparar(d.version(), a.corregida()) < 0) {
                    System.out.printf("%-36s %-9s %-15s %-13s %-9s %s%n", a.paquete(), d.version(), a.id(),
                            a.severidad() + " " + a.cvss(), a.corregida(), a.titulo());
                    graves++;
                }
            }
        }
        System.out.println("Dependencias revisadas: " + total + " · HIGH/CRITICAL: " + graves);
        System.exit(graves > 0 ? 1 : 0);
    }
}
```

#### 10. MINI-LABORATORIO

1. Ejecuta el mini escáner sobre el «antes» y el «después» (ejecutado con JDK 25.0.5):

```bash
java MiniEscaner.java ../f069-escaneo/antes/pom.xml; echo "código de salida: $?"
java MiniEscaner.java ../f069-escaneo/despues/pom.xml; echo "código de salida: $?"
```

   **Output esperado:**

```text
../f069-escaneo/antes/pom.xml
Librería                             Instalada Vulnerabilidad  Severidad     Corregida
org.apache.logging.log4j:log4j-core  2.14.1    CVE-2021-44228  CRITICAL 10.0 2.15.0    Log4Shell: ejecución remota de código vía JNDI en mensajes de log
org.yaml:snakeyaml                   1.33      CVE-2022-1471   HIGH 8.3      2.0       El Constructor de SnakeYAML permite deserializar clases arbitrarias
Dependencias revisadas: 2 · HIGH/CRITICAL: 2
código de salida: 1
../f069-escaneo/despues/pom.xml
Librería                             Instalada Vulnerabilidad  Severidad     Corregida
Dependencias revisadas: 2 · HIGH/CRITICAL: 0
código de salida: 0
```

2. Escanea lo mismo con Trivy (la primera vez descarga su base de datos):

```bash
cd ../f069-escaneo
docker run --rm -v academia-trivy-cache:/root/.cache/ -v "$PWD":/src:ro aquasec/trivy:0.76.1 \
  fs --scanners vuln --severity HIGH,CRITICAL --exit-code 1 /src/antes; echo "código de salida: $?"
```

   **Output esperado:** una tabla para `pom.xml (pom)` con un total de hallazgos HIGH/CRITICAL mayor que cero (más que
   los dos del mini escáner: Trivy conoce también CVE-2021-45046 y otros avisos de esas versiones), filas con
   `org.apache.logging.log4j:log4j-core │ CVE-2021-44228 │ CRITICAL │ fixed │ 2.14.1 │ 2.15.0, 2.3.1, 2.12.2` y
   `org.yaml:snakeyaml │ CVE-2022-1471 │ HIGH │... │ 1.33 │ 2.0`, y `código de salida: 1`. El mismo comando con
   `/src/despues` termina con `código de salida: 0`.

3. Revisa los `Dockerfile`:

```bash
docker run --rm -v "$PWD":/src:ro aquasec/trivy:0.76.1 config --severity HIGH,CRITICAL --exit-code 1 /src/antes
echo "código de salida: $?"
```

   **Output esperado:** un hallazgo HIGH en `Dockerfile` del tipo «Image user should not be 'root'» (falta la
   instrucción `USER`) y `código de salida: 1`; con `/src/despues`, `código de salida: 0`.

4. (Opcional, con cuenta gratuita de Snyk) compara con Snyk:

```bash
npx snyk@1.1309.0 auth                      # abre el navegador una vez
cd antes && npx snyk@1.1309.0 test --severity-threshold=high; echo "código de salida: $?"
```

   **Output esperado:** `Tested 2 dependencies for known issues` (o más, si cuenta transitivas), entradas `✗... [Critical
   Severity]` para log4j-core con la ruta «introduced by» y `código de salida: 1`. Snyk necesita Maven en el `PATH`
   para resolver el árbol: si no lo tienes instalado, usa `brew install maven`.

5. **Fallo deliberado:** en `despues/pom.xml` vuelve a poner `log4j-core` en `2.14.1` y repite el paso 2 con
   `/src/despues`: el código de salida pasa a `1`. Restaura `2.24.3`.

#### 11. VERIFICACIÓN

El test es el código de salida, igual que en CI. `verificar.sh` lo comprueba así:

```bash
java jdk/MiniEscaner.java f069-escaneo/antes/pom.xml > /dev/null 2>&1; [ $? -eq 1 ] || falla "MiniEscaner antes"
java jdk/MiniEscaner.java f069-escaneo/despues/pom.xml > /dev/null 2>&1 || falla "MiniEscaner después"
# ~/.m2 montado: Trivy resuelve los POM padre sin pedirlos a Maven Central (evita su 429)
trivy() { docker run --rm -v academia-trivy-cache:/root/.cache/ -v "$HOME/.m2":/root/.m2:ro \
  -v "$PWD/f069-escaneo":/src:ro aquasec/trivy:0.76.1 fs --scanners vuln --severity HIGH,CRITICAL --exit-code 1 --quiet "/src/$1"; }
trivy antes; [ $? -eq 1 ] || falla "Trivy no detectó las vulnerabilidades de antes/"
trivy despues || falla "Trivy encontró HIGH/CRITICAL en despues/"
```

Y en un pipeline de GitHub Actions (Módulo 23) el paso equivalente es:

```yaml
- name: Trivy (dependencias)
  run: docker run --rm -v "$PWD":/src aquasec/trivy:0.76.1 fs --scanners vuln --severity HIGH,CRITICAL --exit-code 1 /src
```

**Output esperado:** con `./verificar.sh`, ninguna línea `FALLA:` en el bloque de Trivy (el «antes» sale con 1 y el
«después» con 0).

**Pregunta de comprobación:** Trivy marca CRITICAL en `jackson-databind` y tú nunca declaraste esa librería. ¿De dónde
viene y cómo la corriges en un proyecto Spring Boot?

<details>
<summary>Respuesta</summary>

Es una dependencia **transitiva** (la trae otro starter o librería). Trivy y Snyk muestran la ruta. En Spring Boot lo
correcto es subir la versión de Spring Boot (su BOM gestiona la de Jackson) o, si hay urgencia, fijarla con la propiedad
del BOM (en Gradle, `extra["jackson-bom.version"] = "…"` con el plugin `io.spring.dependency-management`; en Maven,
`<jackson-bom.version>` o `<dependencyManagement>`), y retirar el ajuste cuando Boot la incluya.
</details>

#### 12. ERROR COMÚN

**Síntoma:** el escaneo pasa en verde en el portátil pero el mismo commit sale rojo en CI (o al revés), o el job tarda
minutos y a veces falla por red.

**Cómo se ve:** en CI aparece la descarga de la base de datos en cada ejecución (líneas `Downloading vulnerability DB...`)
y, a veces, un error de límite de peticiones del registro de la base; los resultados difieren entre máquinas.

**Diagnóstico:** la base de vulnerabilidades cambia a diario: dos ejecuciones con días de diferencia ven CVE distintos.
Sin caché, cada job descarga la base y queda expuesto a límites de la red.

**Arreglo:** cachea `~/.cache/trivy` (en el laboratorio, el volumen `academia-trivy-cache`), fija la versión de Trivy
(`aquasec/trivy:0.76.1`, nunca `latest`) y acepta que un build pueda ponerse rojo sin cambios de código: es la señal de
que apareció un CVE nuevo. Escanea también cada noche para enterarte antes del siguiente PR.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo integrarías el escaneo de vulnerabilidades en el ciclo de vida de 30 microservicios sin frenar al equipo?»

**Respuesta modelo:** en tres puntos: en cada PR escaneo dependencias y `Dockerfile` (Trivy `fs` y `config`, o Snyk) y
rompo el build solo por HIGH/CRITICAL con corrección disponible; tras construir la imagen la escaneo (`trivy image`) y
genero un SBOM; y cada noche re-escaneo las imágenes publicadas porque aparecen CVE nuevos sobre código que no cambió.
Reduzco ruido con imágenes mínimas y BOMs actualizados (Renovate o Dependabot abren los PR), documento excepciones con
fecha de revisión en `.trivyignore` y mido el tiempo de corrección por severidad. Snyk me aporta asesoría y monitoreo;
Trivy, cobertura amplia sin cuenta.

#### 14. ANTI-PATRÓN RELACIONADO

**Silenciar el escáner para que pase el build:**

```yaml
- run: trivy image --exit-code 0 --severity CRITICAL miapp:latest || true   # nunca falla, nadie lo mira
```

```text
# .trivyignore
CVE-2021-44228
CVE-2022-1471
```

`--exit-code 0`, `|| true` y una lista de ignorados sin motivo ni fecha convierten el escáner en decoración. Cada
excepción lleva comentario, responsable y fecha de revisión, y el job falla por defecto.
