# Módulo 9 · Seguridad

**Fase 1 · Spring Boot de cero a experto** (semana 9 y mitad de la 10, de 12). **Duración:** 18 h (9 temas de 1,5–2,5 h).
**Dificultad:** 4 de 5. **Dependencias:** Módulo 2 (Spring MVC, filtros HTTP, `ProblemDetail`) y Módulo 7 (Spring Cloud
Gateway, configuración centralizada); para el tema de mTLS conviene haber visto contenedores (Módulo 0.5).
**Herramientas:**JDK 25 LTS (25.0.5)**, **Spring Boot 4.1.3** (Spring Security 7.1.3, Spring Framework 7.0.11),
**Spring Cloud 2025.1.4** (Spring Cloud Vault 5.0), **Keycloak 26.8.2**, **HashiCorp Vault 2.2.0**, **Trivy 0.76.1**,
**Snyk CLI 1.1309.0**, **Istio 1.32** sobre **kind**, OpenSSL 3 y `curl`.
(los comandos de verificación indicados corre las demostraciones con solo el JDK; los comandos de verificación indicados añade Keycloak, Vault, Trivy y
los tests de Spring; los comandos de verificación indicados monta la malla de servicios).

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

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar una SecurityFilterChain que deja pública una ruta, exige autenticación en el resto y el rol ADMIN en /admin/, insertar un filtro propio en la posición correcta y demostrarlo con 6 tests que distinguen 401 (no sé quién eres) de 403 (sé quién eres, pero no puedes).

#### ► LA IDEA EN UNA FRASE
**Configurar una SecurityFilterChain que deja pública una ruta, exige autenticación en el resto y el rol ADMIN en /admin/, insertar un filtro propio en la posición correcta y demostrarlo con 6 tests que distinguen 401 (no sé quién eres) de 403 (sé quién eres, pero no puedes).**

#### ► POR QUÉ EXISTE ESTO
Un filtro es un trozo de código que mira cada petición antes de que llegue a tu controlador y decide si la deja seguir, la modifica o la corta. Spring Security es, por dentro, una lista ordenada de filtros: uno lee la cabecera Authorization y averigua quién eres, otro decide si puedes entrar a esa ruta, otro convierte los rechazos en respuestas HTTP. Tú no escribes esos filtros: escribes reglas («/publico/ para todos…

#### ► LA ANALOGÍA
Piensa en spring security: filter chain como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un filtro es un trozo de código que mira cada petición antes de que llegue a tu controlador y decide si la deja seguir, la modifica o la corta.
2. Spring Security es, por dentro, una lista ordenada de filtros: uno lee la cabecera Authorization y averigua quién eres, otro decide si puedes entrar a esa ruta, otro convierte los rechazos en respuestas HTTP.
3. Tú no escribes esos filtros: escribes reglas («/publico/ para todos», «/admin/ solo ADMIN») y Spring arma la fila.
4. Dos códigos que vas a ver todo e…

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Spring Security: filter chain se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Spring Security: filter chain | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Seguridad hecha a mano dentro del controlador:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: spring security: filter chain funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un filtro es un trozo de código que mira cada petición antes de que llegue a tu controlador y decide si la deja seguir, la modifica o la corta.
- Spring Security es, por dentro, una lista ordenada de filtros: uno lee la cabecera Authorization y averigua quién eres, otro decide si puedes entrar a esa ruta, otro convierte los rechazos en respuestas HTTP.
- Tú no escribes esos filtros: escribes reglas («/publico/ para todos», «/admin/ solo ADMIN») y Spring arma la fila.
- Dos códigos que vas a ver todo e…

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve spring security: filter chain en tu contexto?
2. ¿Cómo sabrías que spring security: filter chain no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar spring security: filter chain?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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
// F068 necesita Vault encendido y VAULT_TOKEN (prepáralos antes de ejecutar el ejemplo). F067 (mTLS) no tiene build, y F069 conserva
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

#### Verificación
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

</details>

### JWT: firmas simétricas vs asimétricas

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Diferenciar HS256 de RS256 explicando quién puede emitir y quién puede verificar con cada una, explotar dos fallos clásicos de un verificador ingenuo ("alg":"none" y confusión RS256→HS256) y configurar un resource server de Spring que los rechaza junto con tokens vencidos o de ot…

#### ► LA IDEA EN UNA FRASE
**Diferenciar HS256 de RS256 explicando quién puede emitir y quién puede verificar con cada una, explotar dos fallos clásicos de un verificador ingenuo ("alg":"none" y confusión RS256→HS256) y configurar un resource server de Spring que los rechaza junto con tokens vencidos o de otra audiencia (6 tests en verde).**

#### ► POR QUÉ EXISTE ESTO
Un JWT (JSON Web Token) es una credencial en texto: tres trozos separados por puntos. El primero dice cómo se firmó, el segundo dice quién eres y hasta cuándo vale (los *claims*) y el tercero es la firma, que demuestra que nadie cambió los dos primeros. Los dos primeros solo están codificados, no cifrados: cualquiera puede leerlos (por eso nunca pongas datos secretos ahí). Hay dos maneras de firmar: con un secreto co…

#### ► LA ANALOGÍA
Piensa en jwt: firmas simétricas vs asimétricas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un JWT (JSON Web Token) es una credencial en texto: tres trozos separados por puntos.
2. El primero dice cómo se firmó, el segundo dice quién eres y hasta cuándo vale (los *claims*) y el tercero es la firma, que demuestra que nadie cambió los dos primeros.
3. Los dos primeros solo están codificados, no cifrados: cualquiera puede leerlos (por eso nunca pongas datos secretos ahí).
4. Hay dos maneras de firmar: con un secreto compartido (HS256: el mismo secreto firma y verifica) o con un par de claves (RS25…

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| JWT: firmas simétricas vs asimétricas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar JWT: firmas simétricas vs asimétricas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Decodificar sin verificar «porque el gateway ya validó»:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: jwt: firmas simétricas vs asimétricas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un JWT (JSON Web Token) es una credencial en texto: tres trozos separados por puntos.
- El primero dice cómo se firmó, el segundo dice quién eres y hasta cuándo vale (los *claims*) y el tercero es la firma, que demuestra que nadie cambió los dos primeros.
- Los dos primeros solo están codificados, no cifrados: cualquiera puede leerlos (por eso nunca pongas datos secretos ahí).
- Hay dos maneras de firmar: con un secreto compartido (HS256: el mismo secreto firma y verifica) o con un par de claves (RS25…

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve jwt: firmas simétricas vs asimétricas en tu contexto?
2. ¿Cómo sabrías que jwt: firmas simétricas vs asimétricas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar jwt: firmas simétricas vs asimétricas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### OAuth2 y OIDC

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Distinguir OAuth2 (autorización delegada: *access token* para una API) de OIDC (autenticación: *id_token* para el cliente), ejecutar el flujo *Authorization Code* con PKCE paso a paso y demostrar que sin PKCE un code interceptado da tokens al atacante y con PKCE no; después, conf…

#### ► LA IDEA EN UNA FRASE
**Distinguir OAuth2 (autorización delegada: *access token* para una API) de OIDC (autenticación: *id_token* para el cliente), ejecutar el flujo *Authorization Code* con PKCE paso a paso y demostrar que sin PKCE un code interceptado da tokens al atacante y con PKCE no; después, configurar oauth2Login en Spring y comprobar con 3 tests que la redirección lleva state, nonce y code_challenge.**

#### ► POR QUÉ EXISTE ESTO
OAuth2 resuelve esto: una aplicación quiere actuar en tu nombre (ver tus pedidos) sin conocer tu contraseña. Tú inicias sesión en un servidor de confianza (Keycloak, Google…), aceptas lo que la app pide (los *scopes*, como pedidos:leer) y ese servidor le entrega a la app un access token: una credencial temporal y limitada para llamar a la API. OIDC (OpenID Connect) es una capa encima de OAuth2 que además le dice a la…

#### ► LA ANALOGÍA
Piensa en oauth2 y oidc como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. OAuth2 resuelve esto: una aplicación quiere actuar en tu nombre (ver tus pedidos) sin conocer tu contraseña.
2. Tú inicias sesión en un servidor de confianza (Keycloak, Google…), aceptas lo que la app pide (los *scopes*, como pedidos:leer) y ese servidor le entrega a la app un access token: una credencial temporal y limitada para llamar a la API.
3. OIDC (OpenID Connect) es una capa encima de OAuth2 que además le dice a la app quién eres, con un segundo token, el id_token.
4. Resumen: OAuth2 = «qué puede…

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| OAuth2 y OIDC se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar OAuth2 y OIDC | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Flujo implícito con el token en la URL y guardado en localStorage:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: oauth2 y oidc funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- OAuth2 resuelve esto: una aplicación quiere actuar en tu nombre (ver tus pedidos) sin conocer tu contraseña.
- Tú inicias sesión en un servidor de confianza (Keycloak, Google…), aceptas lo que la app pide (los *scopes*, como pedidos:leer) y ese servidor le entrega a la app un access token: una credencial temporal y limitada para llamar a la API.
- OIDC (OpenID Connect) es una capa encima de OAuth2 que además le dice a la app quién eres, con un segundo token, el id_token.
- Resumen: OAuth2 = «qué puede…

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve oauth2 y oidc en tu contexto?
2. ¿Cómo sabrías que oauth2 y oidc no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar oauth2 y oidc?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Keycloak

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Levantar Keycloak 26.8.2 con un realm versionado en JSON (roles, clientes, scopes y usuarios), obtener un token real con curl, leer sus claims (iss, aud, realm_access.roles) y conectar un resource server de Spring que convierte esos roles en autoridades, comprobado con 6 tests y…

#### ► LA IDEA EN UNA FRASE
**Levantar Keycloak 26.8.2 con un realm versionado en JSON (roles, clientes, scopes y usuarios), obtener un token real con curl, leer sus claims (iss, aud, realm_access.roles) y conectar un resource server de Spring que convierte esos roles en autoridades, comprobado con 6 tests y con curl contra el Keycloak real (200, 403, 401).**

#### ► POR QUÉ EXISTE ESTO
Keycloak es un programa gratuito (de la CNCF) que hace de servidor de identidad: guarda los usuarios y sus contraseñas, muestra la pantalla de login, emite los tokens de F062/F063 y publica las claves para verificarlos. Así tus microservicios no guardan contraseñas ni tienen pantallas de login: solo comprueban tokens. Todo se organiza en realms (espacios separados, como «tienda»), y dentro de cada uno defines usuario…

#### ► LA ANALOGÍA
Piensa en keycloak como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Keycloak es un programa gratuito (de la CNCF) que hace de servidor de identidad: guarda los usuarios y sus contraseñas, muestra la pantalla de login, emite los tokens de F062/F063 y publica las claves para verificarlos.
2. Así tus microservicios no guardan contraseñas ni tienen pantallas de login: solo comprueban tokens.
3. Todo se organiza en realms (espacios separados, como «tienda»), y dentro de cada uno defines usuarios, roles y clientes (las aplicaciones que pueden pedir tokens).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Keycloak se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Keycloak | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Llamar a Keycloak en cada petición «para estar seguros»:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: keycloak funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Keycloak es un programa gratuito (de la CNCF) que hace de servidor de identidad: guarda los usuarios y sus contraseñas, muestra la pantalla de login, emite los tokens de F062/F063 y publica las claves para verificarlos.
- Así tus microservicios no guardan contraseñas ni tienen pantallas de login: solo comprueban tokens.
- Todo se organiza en realms (espacios separados, como «tienda»), y dentro de cada uno defines usuarios, roles y clientes (las aplicaciones que pueden pedir tokens).

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve keycloak en tu contexto?
2. ¿Cómo sabrías que keycloak no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar keycloak?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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
es la verificación de extremo a extremo contra el Keycloak real; los comandos de verificación indicados la repite y exige `200-403-401`.

**Pregunta de comprobación:** quitas el client scope `roles` de los *default client scopes* de `tienda-cli`. ¿Qué cambia
en el token y qué responde `GET /pedidos` con el token de ana?

<details>
<summary>Respuesta</summary>

El token deja de traer `realm_access` (lo añadía el mapper de ese scope). `RolesDeKeycloak` devuelve una lista vacía y
`hasAnyRole(...)` falla: la respuesta es `403` aunque la firma, `iss` y `aud` sean correctos.
</details>

</details>

### RBAC y Scopes

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Explicar la diferencia entre lo que un usuario puede hacer (roles, RBAC) y lo que una aplicación puede hacer en su nombre (scopes), implementar la regla «permiso del rol ∩ scope del token» con @PreAuthorize y verificar una matriz de 12 decisiones (401/200/201/204/403) con un test…

#### ► LA IDEA EN UNA FRASE
**Explicar la diferencia entre lo que un usuario puede hacer (roles, RBAC) y lo que una aplicación puede hacer en su nombre (scopes), implementar la regla «permiso del rol ∩ scope del token» con @PreAuthorize y verificar una matriz de 12 decisiones (401/200/201/204/403) con un test parametrizado.**

#### ► POR QUÉ EXISTE ESTO
Autorizar es decidir si alguien que ya sabemos quién es puede hacer una acción concreta. RBAC (control de acceso basado en roles) agrupa permisos en roles —«cliente», «soporte», «admin»— y le asigna roles a cada persona; así no configuras permisos persona por persona. Los scopes son otra cosa: cuando una aplicación actúa en tu nombre, solo recibe una parte de lo que tú puedes hacer (por ejemplo, un widget que solo le…

#### ► LA ANALOGÍA
Piensa en rbac y scopes como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Autorizar es decidir si alguien que ya sabemos quién es puede hacer una acción concreta.
2. RBAC (control de acceso basado en roles) agrupa permisos en roles —«cliente», «soporte», «admin»— y le asigna roles a cada persona; así no configuras permisos persona por persona.
3. Los scopes son otra cosa: cuando una aplicación actúa en tu nombre, solo recibe una parte de lo que tú puedes hacer (por ejemplo, un widget que solo lee pedidos).
4. Una petición pasa si tu rol lo permite y la aplicación recibió ese s…

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| RBAC y Scopes se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar RBAC y Scopes | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Explosión de roles para expresar excepciones:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rbac y scopes funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Autorizar es decidir si alguien que ya sabemos quién es puede hacer una acción concreta.
- RBAC (control de acceso basado en roles) agrupa permisos en roles —«cliente», «soporte», «admin»— y le asigna roles a cada persona; así no configuras permisos persona por persona.
- Los scopes son otra cosa: cuando una aplicación actúa en tu nombre, solo recibe una parte de lo que tú puedes hacer (por ejemplo, un widget que solo lee pedidos).
- Una petición pasa si tu rol lo permite y la aplicación recibió ese s…

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rbac y scopes en tu contexto?
2. ¿Cómo sabrías que rbac y scopes no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rbac y scopes?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Token Exchange (RFC 8693)

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Explicar por qué reenviar el token del usuario entre servicios es peligroso, ejecutar un canje RFC 8693 contra Keycloak que produce un token con aud=pagos y scope reducido, e implementar en Spring un servicio que canjea antes de llamar a otro, verificado con 2 tests que inspeccio…

#### ► LA IDEA EN UNA FRASE
**Explicar por qué reenviar el token del usuario entre servicios es peligroso, ejecutar un canje RFC 8693 contra Keycloak que produce un token con aud=pagos y scope reducido, e implementar en Spring un servicio que canjea antes de llamar a otro, verificado con 2 tests que inspeccionan lo que recibe el STS y lo que recibe pagos.**

#### ► POR QUÉ EXISTE ESTO
Cuando un servicio necesita llamar a otro en nombre del usuario, la tentación es reenviar el mismo token. El problema: ese token se vuelve una llave maestra que sirve en muchos servicios, y si se filtra en un solo log, abre todo. Token Exchange (el estándar RFC 8693) es pedirle al servidor de identidad: «cámbiame este token por uno nuevo, solo para este otro servicio, con menos permisos y por poco tiempo». El token n…

#### ► LA ANALOGÍA
Piensa en token exchange (rfc 8693) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Cuando un servicio necesita llamar a otro en nombre del usuario, la tentación es reenviar el mismo token.
2. El problema: ese token se vuelve una llave maestra que sirve en muchos servicios, y si se filtra en un solo log, abre todo.
3. Token Exchange (el estándar RFC 8693) es pedirle al servidor de identidad: «cámbiame este token por uno nuevo, solo para este otro servicio, con menos permisos y por poco tiempo».
4. El token nuevo sigue diciendo que es ana, pero solo sirve donde hace falta.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Token Exchange (RFC 8693) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Token Exchange (RFC 8693) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El «token de Dios»: un único token con todas las audiencias y scopes del sistema que viaja por cada salto:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: token exchange (rfc 8693) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando un servicio necesita llamar a otro en nombre del usuario, la tentación es reenviar el mismo token.
- El problema: ese token se vuelve una llave maestra que sirve en muchos servicios, y si se filtra en un solo log, abre todo.
- Token Exchange (el estándar RFC 8693) es pedirle al servidor de identidad: «cámbiame este token por uno nuevo, solo para este otro servicio, con menos permisos y por poco tiempo».
- El token nuevo sigue diciendo que es ana, pero solo sirve donde hace falta.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve token exchange (rfc 8693) en tu contexto?
2. ¿Cómo sabrías que token exchange (rfc 8693) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar token exchange (rfc 8693)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### mTLS con Service Mesh

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir a mano un canal mTLS (CA, certificado de servidor, certificado de cliente con identidad SPIFFE) y demostrar que un espía lee el token en HTTP plano y no en mTLS; después, activar mTLS estricto en una malla Istio con PeerAuthentication y comprobar que un pod sin sidecar…

#### ► LA IDEA EN UNA FRASE
**Construir a mano un canal mTLS (CA, certificado de servidor, certificado de cliente con identidad SPIFFE) y demostrar que un espía lee el token en HTTP plano y no en mTLS; después, activar mTLS estricto en una malla Istio con PeerAuthentication y comprobar que un pod sin sidecar pasa de 200 a ser rechazado (000, código 56).**

#### ► POR QUÉ EXISTE ESTO
Cuando dos servicios hablan por la red de la empresa, cualquiera que logre meterse en esa red puede escuchar (leer tokens y datos) o hacerse pasar por un servicio. TLS cifra la conversación y demuestra la identidad del servidor; mTLS («TLS mutuo») hace que los dos lados demuestren quiénes son con un certificado. Configurarlo a mano en 50 servicios es mucho trabajo, así que una malla de servicios (*service mesh*, como…

#### ► LA ANALOGÍA
Piensa en mtls con service mesh como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Cuando dos servicios hablan por la red de la empresa, cualquiera que logre meterse en esa red puede escuchar (leer tokens y datos) o hacerse pasar por un servicio.
2. TLS cifra la conversación y demuestra la identidad del servidor; mTLS («TLS mutuo») hace que los dos lados demuestren quiénes son con un certificado.
3. Configurarlo a mano en 50 servicios es mucho trabajo, así que una malla de servicios (*service mesh*, como Istio o Linkerd) pone un pequeño proxy al lado de cada servicio que lo hace aut…

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| mTLS con Service Mesh se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar mTLS con Service Mesh | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
«La red interna es segura»: el tráfico entre servicios en HTTP plano, protegido solo por el firewall perimetral:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: mtls con service mesh funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando dos servicios hablan por la red de la empresa, cualquiera que logre meterse en esa red puede escuchar (leer tokens y datos) o hacerse pasar por un servicio.
- TLS cifra la conversación y demuestra la identidad del servidor; mTLS («TLS mutuo») hace que los dos lados demuestren quiénes son con un certificado.
- Configurarlo a mano en 50 servicios es mucho trabajo, así que una malla de servicios (*service mesh*, como Istio o Linkerd) pone un pequeño proxy al lado de cada servicio que lo hace aut…

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve mtls con service mesh en tu contexto?
2. ¿Cómo sabrías que mtls con service mesh no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar mtls con service mesh?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

</details>

### HashiCorp Vault

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Sacar un secreto del repositorio y servirlo desde Vault (motor KV v2) a una aplicación Spring Boot con Spring Cloud Vault, restringir el acceso con una política de solo lectura y un token de vida corta, y verificar con 2 tests que el secreto llega desde Vault y nunca se expone po…

#### ► LA IDEA EN UNA FRASE
**Sacar un secreto del repositorio y servirlo desde Vault (motor KV v2) a una aplicación Spring Boot con Spring Cloud Vault, restringir el acceso con una política de solo lectura y un token de vida corta, y verificar con 2 tests que el secreto llega desde Vault y nunca se expone por la API.**

#### ► POR QUÉ EXISTE ESTO
Un secreto es cualquier dato que da acceso: contraseñas de bases de datos, claves de APIs de pago, certificados. Si lo escribes en el código o en un archivo del repositorio, queda copiado en cada computador y en el historial de git para siempre. Vault es un programa que guarda los secretos cifrados, solo los entrega a quien tiene permiso, registra quién los pidió y puede cambiarlos sin tocar el código. Tu aplicación,…

#### ► LA ANALOGÍA
Piensa en hashicorp vault como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un secreto es cualquier dato que da acceso: contraseñas de bases de datos, claves de APIs de pago, certificados.
2. Si lo escribes en el código o en un archivo del repositorio, queda copiado en cada computador y en el historial de git para siempre.
3. Vault es un programa que guarda los secretos cifrados, solo los entrega a quien tiene permiso, registra quién los pidió y puede cambiarlos sin tocar el código.
4. Tu aplicación, al arrancar, le pide a Vault lo que necesita en lugar de leerlo de un archivo.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| HashiCorp Vault se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar HashiCorp Vault | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El secreto «escondido» en Base64 o en una variable de entorno impresa:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: hashicorp vault funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un secreto es cualquier dato que da acceso: contraseñas de bases de datos, claves de APIs de pago, certificados.
- Si lo escribes en el código o en un archivo del repositorio, queda copiado en cada computador y en el historial de git para siempre.
- Vault es un programa que guarda los secretos cifrados, solo los entrega a quien tiene permiso, registra quién los pidió y puede cambiarlos sin tocar el código.
- Tu aplicación, al arrancar, le pide a Vault lo que necesita en lugar de leerlo de un archivo.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve hashicorp vault en tu contexto?
2. ¿Cómo sabrías que hashicorp vault no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar hashicorp vault?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
`f068-vault/src/test/java/academia/seguridad/vault/SecretoDesdeVaultTest.java` (necesita el Vault del laboratorio
sembrado y `VAULT_TOKEN` exportado; los comandos de verificación indicados lo prepara):

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

</details>

### Escaneo de vulnerabilidades: Trivy, Snyk

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Detectar dependencias con vulnerabilidades conocidas (CVE) y errores de configuración en un Dockerfile con Trivy y Snyk, interpretar el informe (paquete, versión instalada, CVE, severidad, versión corregida) y romper el build cuando aparezca algo HIGH o CRITICAL, comprobándolo co…

#### ► LA IDEA EN UNA FRASE
**Detectar dependencias con vulnerabilidades conocidas (CVE) y errores de configuración en un Dockerfile con Trivy y Snyk, interpretar el informe (paquete, versión instalada, CVE, severidad, versión corregida) y romper el build cuando aparezca algo HIGH o CRITICAL, comprobándolo con códigos de salida (1 en el «antes», 0 en el «después»).**

#### ► POR QUÉ EXISTE ESTO
Tu servicio usa decenas de librerías escritas por otras personas, y cada imagen Docker trae un sistema operativo con cientos de paquetes. Cuando alguien descubre un fallo de seguridad en una de ellas, se publica con un identificador (CVE, como CVE-2021-44228) y una gravedad. Un escáner lee qué versiones usas y te avisa si alguna está en la lista. Trivy es gratuito y de código abierto; Snyk tiene un plan gratuito con…

#### ► LA ANALOGÍA
Piensa en escaneo de vulnerabilidades: trivy, snyk como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Tu servicio usa decenas de librerías escritas por otras personas, y cada imagen Docker trae un sistema operativo con cientos de paquetes.
2. Cuando alguien descubre un fallo de seguridad en una de ellas, se publica con un identificador (CVE, como CVE-2021-44228) y una gravedad.
3. Un escáner lee qué versiones usas y te avisa si alguna está en la lista.
4. Trivy es gratuito y de código abierto; Snyk tiene un plan gratuito con cuenta.
5. Los dos se ejecutan en tu computador y en CI para que una librería pelig…

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Escaneo de vulnerabilidades: Trivy, Snyk se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Escaneo de vulnerabilidades: Trivy, Snyk | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Silenciar el escáner para que pase el build:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: escaneo de vulnerabilidades: trivy, snyk funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Tu servicio usa decenas de librerías escritas por otras personas, y cada imagen Docker trae un sistema operativo con cientos de paquetes.
- Cuando alguien descubre un fallo de seguridad en una de ellas, se publica con un identificador (CVE, como CVE-2021-44228) y una gravedad.
- Un escáner lee qué versiones usas y te avisa si alguna está en la lista.
- Trivy es gratuito y de código abierto; Snyk tiene un plan gratuito con cuenta.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve escaneo de vulnerabilidades: trivy, snyk en tu contexto?
2. ¿Cómo sabrías que escaneo de vulnerabilidades: trivy, snyk no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar escaneo de vulnerabilidades: trivy, snyk?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Verificación
El test es el código de salida, igual que en CI. Puedes comprobarlo así:

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

**Output esperado:** con los comandos de verificación indicados, ninguna línea `FALLA:` en el bloque de Trivy (el «antes» sale con 1 y el
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

</details>
