# Módulo 8 · Seguridad en microservicios de Tienda Aurora

La seguridad en sistemas distribuidos no es una feature: es una propiedad del sistema. Cada request cruza redes, servicios e identidades; asumir confianza por "estar adentro" es el camino rápido al incidente. Este módulo construye defensa en profundidad con Spring Security, OAuth2/OIDC, RBAC, mTLS/Zero-Trust, secretos y cadena de suministro, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los smokes ejecutan lógica de autenticación/autorización, validación de claims, RBAC/ownership y gates de secretos/CVE en Java puro. Spring Security, Keycloak, Vault, mTLS y herramientas SBOM/CVE reales requieren infraestructura; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-security

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
docker --version  # Docker 24+ (para Keycloak/Vault si se usan)
```

### Estructura del proyecto

```text
tienda-aurora-security/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/aurora/security/
│   │   │   ├── SecurityApplication.java
│   │   │   ├── config/SecurityConfig.java
│   │   │   ├── controller/OrderController.java
│   │   │   └── service/OrderService.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/aurora/security/
│           └── SecuritySmokeTest.java
└── docker-compose.yml
```

### build.gradle.kts

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-security"
```

### application.yml

```yaml
spring:
  application:
    name: security-service
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://idp.tienda-aurora.local/realms/aurora

server:
  port: 8080
```

### docker-compose.yml (Keycloak)

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8180:8080"
    command: start-dev
```

### Tema 1: Spring Security filter chain · Intermedio · 150 min

## Spring Security filter chain: control explícito

Tienda Aurora expone `/api/orders` para clientes y `/actuator/health` para el orquestador. Un desarrollador, apurado, deshabilita seguridad para "probar rápido" y olvida reactivarla. A la semana, alguien descubre el endpoint y crea pedidos sin autenticación. El frontend tenía un botón oculto, pero la API no tenía control. El síntoma es un 200 donde debía haber 401. La causa es confundir interfaz con seguridad.

Piensa en un edificio con recepcionista, torniquete y guardias por piso. No importa que la puerta lateral "no esté en el mapa": cada acceso pasa por controles. La filter chain de Spring Security es esa secuencia de controles: cada request entra por la cadena y puede ser autenticada, autorizada o rechazada antes de tocar tu lógica de negocio.

```java
public class SecurityExample {
    static int status(String path, boolean auth) {
        if (path.equals("/health")) return 200;
        return auth ? 200 : 401;
    }

    public static void main(String[] args) {
        System.out.println("health-no-auth=" + status("/health", false));
        System.out.println("orders-no-auth=" + status("/orders", false));
        System.out.println("orders-with-auth=" + status("/orders", true));
    }
}
```

```bash
javac SecurityExample.java
java SecurityExample
```

Salida esperada:

```text
health-no-auth=200
orders-no-auth=401
orders-with-auth=200
```

En Spring Boot, la configuración explícita es:

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers("/api/orders/**").authenticated()
            .anyRequest().denyAll())
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
        .build();
}
```

El error más común es confiar en seguridad solo en frontend. El síntoma es acceso directo a API sin auth. La causa es falta de control backend. La corrección es authN/authZ en backend, default deny, pruebas de autorización.

### Tema 2: JWT y OAuth2/OIDC · Avanzado · 180 min

## JWT y OAuth2/OIDC: de token opaco a prueba criptográfica

El equipo implementó login y genera un JWT. Un atacante copia el token, cambia el campo `role` a `ADMIN` en el payload base64, y la API lo acepta porque solo decodifica el JSON, no valida la firma. Otro token expirado hace días sigue funcionando porque nadie revisa `exp`.

Un JWT es como un pase de backstage firmado. Mirar el pase no basta: hay que verificar la firma, quién lo emitió, para qué evento sirve y si ya venció. OAuth2 es el sistema que delega autorización; OIDC agrega identidad sobre OAuth2. El access token autoriza; el ID token identifica.

```java
import java.util.*;

public class JwtExample {
    static boolean valid(Map<String, Object> claims, String aud) {
        return "iss1".equals(claims.get("iss"))
            && aud.equals(claims.get("aud"))
            && (int) claims.get("exp") > 100;
    }

    public static void main(String[] args) {
        System.out.println("valid-token=" + valid(Map.of("iss", "iss1", "aud", "orders", "exp", 200), "orders"));
        System.out.println("bad-issuer=" + valid(Map.of("iss", "bad", "aud", "orders", "exp", 200), "orders"));
    }
}
```

```bash
javac JwtExample.java
java JwtExample
```

Salida esperada:

```text
valid-token=true
bad-issuer=false
```

En producción, Spring Security valida firma con JWKS del issuer, `iss`, `aud`, `exp`, `nbf` y algoritmo permitido. Nunca aceptes `alg=none`. El error más común es solo decodificar JWT: el síntoma es token forjado o expirado aceptado.

### Tema 3: RBAC, scopes y mTLS/Zero-Trust · Avanzado · 150 min

## RBAC, scopes y mTLS/Zero-Trust

Un usuario autenticado descubre que puede borrar pedidos ajenos cambiando el ID en la URL. El token era válido, pero la API solo verificó login. En otro incidente, un servicio interno falso en la red llama a un endpoint interno porque "la red es privada".

Autenticación sin autorización es media cerradura. Red privada sin identidad es confianza ciega. RBAC es la llave que abre solo ciertas puertas según tu rol. Ownership es la regla adicional: puedes entrar a tu habitación, no a la del vecino. mTLS es pedir identificación a ambos lados. Zero-Trust es la política: nadie entra solo por estar dentro del edificio.

```java
import java.util.*;

public class RbacExample {
    static boolean canDelete(Set<String> roles) { return roles.contains("ADMIN"); }
    static boolean canRead(String owner, String userId) { return owner.equals(userId); }

    public static void main(String[] args) {
        System.out.println("user-delete=" + canDelete(Set.of("USER")));
        System.out.println("admin-delete=" + canDelete(Set.of("ADMIN")));
        System.out.println("owner-read=" + canRead("u1", "u1"));
        System.out.println("other-read=" + canRead("u1", "u2"));
    }
}
```

```bash
javac RbacExample.java
java RbacExample
```

Salida esperada:

```text
user-delete=false
admin-delete=true
owner-read=true
other-read=false
```

RBAC cubre permisos gruesos. Ownership/ABAC cubre reglas por recurso. mTLS autentica workloads. Zero-Trust combina identidad, least privilege, cifrado y observabilidad.

El error más común es solo validar login. El síntoma es usuario autenticado que borra recursos ajenos. La causa es falta de authZ por rol/ownership. La corrección es checks por rol/scope y por recurso.

### Tema 4: Vault, gestión de secretos, SBOM y CVE scanning · Intermedio · 120 min

## Vault, secretos, SBOM y CVE scanning

La contraseña de base de datos está en `application-prod.yml` dentro del repositorio. Alguien hace fork por error y el secreto queda expuesto. En paralelo, una dependencia con CVE crítica entra por una actualización menor y nadie lo detecta antes del release.

Un secreto es como la llave maestra: no se deja pegada en la pared del pasillo. Se guarda en una caja fuerte con acceso auditado. El SBOM es la lista de ingredientes del producto; el CVE scan es revisar si algún ingrediente tiene retiro sanitario.

```java
public class VaultExample {
    static String getSecret(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("missing");
        return "***";
    }
    static boolean releaseBlocked(int criticalCves) { return criticalCves > 0; }

    public static void main(String[] args) {
        System.out.println("secret=" + getSecret("db"));
        try { getSecret(""); } catch (Exception e) { System.out.println("error=" + e.getMessage()); }
        System.out.println("release-blocked=" + releaseBlocked(1));
    }
}
```

```bash
javac VaultExample.java
java VaultExample
```

Salida esperada:

```text
secret=***
error=missing
release-blocked=true
```

Vault entrega credenciales DB con TTL. En CI, Syft genera SBOM y Trivy/Grype escanean. Una CVE crítica bloquea el release. El secreto se inyecta en runtime, nunca en Git.

El error más común es secreto en repositorio. El síntoma es credencial filtrada. La causa es `.env` o YAML commiteado. La corrección es secret manager, pre-commit scanning, rotación inmediata.

## Cierre

La seguridad distribuida se construye en capas: identidad, autorización, transporte, secretos y cadena de suministro. Ninguna capa reemplaza a otra. El objetivo no es "estar seguro", sino reducir riesgo, detectar fallos rápido y limitar el impacto cuando algo sale mal. Tienda Aurora se protege con Spring Security + OAuth2/OIDC, RBAC por recurso, mTLS entre servicios, Vault para secretos y SBOM/CVE scan en CI.

## Checklist

- Filtro de seguridad explícito y default deny.
- JWT validado por firma, `iss`, `aud`, `exp` y `alg`.
- Autorización por rol/scope y por recurso.
- mTLS/Zero-Trust donde la comunicación interna sea sensible.
- Secretos fuera de Git; rotación y auditoría.
- SBOM y CVE scan con gate por severidad.
- Nota de verificación honesta cuando falta infraestructura.
