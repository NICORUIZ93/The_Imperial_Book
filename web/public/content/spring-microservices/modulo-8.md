# Módulo 8 · Seguridad en microservicios de Tienda Aurora

La seguridad en sistemas distribuidos no es una feature: es una propiedad del sistema. Cada request cruza redes, servicios e identidades; asumir confianza por "estar adentro" es el camino rápido al incidente. Este módulo construye defensa en profundidad con Spring Security, OAuth2/OIDC, RBAC, mTLS/Zero-Trust, secretos y cadena de suministro, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes ejecutan lógica de autenticación/autorización, validación de claims, RBAC/ownership y gates de secretos/CVE en Java puro. Spring Security, Keycloak, Vault, mTLS y herramientas SBOM/CVE reales requieren infraestructura; se incluyen notas de verificación honestas.

### Tema 1: Spring Security filter chain · Intermedio · 150 min

## Spring Security filter chain: de la puerta lateral al control explícito

Tienda Aurora expone `/api/orders` para clientes y `/actuator/health` para el orquestador. Un desarrollador, apurado, deshabilita seguridad para "probar rápido" y olvida reactivarla. A la semana, alguien descubre el endpoint y crea pedidos sin autenticación. El frontend tenía un botón oculto, pero la API no tenía control. El síntoma es un 200 donde debía haber 401. La causa es confundir interfaz con seguridad.

Piensa en un edificio con recepcionista, torniquete y guardias por piso. No importa que la puerta lateral "no esté en el mapa": cada acceso pasa por controles. La filter chain de Spring Security es esa secuencia de controles: cada request entra por la cadena y puede ser autenticada, autorizada o rechazada antes de tocar tu lógica de negocio.

La construcción comienza con la regla mínima de acceso y la cadena explícita en Spring Boot:

```java
public class SecuritySmoke {
    static int status(String path, boolean auth) {
        if (path.equals("/health")) return 200;
        return auth ? 200 : 401;
    }

    public static void main(String[] args) {
        System.out.println(status("/health", false));
        System.out.println(status("/orders", false));
        System.out.println(status("/orders", true));
    }
}
```

```bash
javac SecuritySmoke.java
java SecuritySmoke
```

Salida esperada:

```text
200
401
200
```

En Spring Boot 3/4, la configuración explícita es:

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

public class JwtSmoke {
    static boolean valid(Map<String, Object> claims, String aud) {
        return "iss1".equals(claims.get("iss"))
            && aud.equals(claims.get("aud"))
            && (int) claims.get("exp") > 100;
    }

    public static void main(String[] args) {
        System.out.println(valid(Map.of("iss", "iss1", "aud", "orders", "exp", 200), "orders"));
        System.out.println(valid(Map.of("iss", "bad", "aud", "orders", "exp", 200), "orders"));
    }
}
```

```bash
javac JwtSmoke.java
java JwtSmoke
```

Salida esperada:

```text
true
false
```

El primer token tiene issuer correcto y expiración futura. El segundo tiene issuer incorrecto. En producción, Spring Security valida firma con JWKS del issuer, `iss`, `aud`, `exp`, `nbf` y algoritmo permitido. Nunca aceptes `alg=none`.

El error más común es solo decodificar JWT. El síntoma es token forjado o expirado aceptado. La causa es no validar firma/claims. La corrección es validar firma JWKS, `iss`, `aud`, `exp`, `nbf`, `alg` permitido.

### Tema 3: RBAC, scopes y mTLS/Zero-Trust · Avanzado · 150 min

## RBAC, scopes y mTLS/Zero-Trust: de autenticación a autorización real

Un usuario autenticado descubre que puede borrar pedidos ajenos cambiando el ID en la URL. El token era válido, pero la API solo verificó login. En otro incidente, un servicio interno falso en la red llama a un endpoint interno porque "la red es privada".

Autenticación sin autorización es media cerradura. Red privada sin identidad es confianza ciega. RBAC es la llave que abre solo ciertas puertas según tu rol. Ownership es la regla adicional: puedes entrar a tu habitación, no a la del vecino. mTLS es pedir identificación a ambos lados. Zero-Trust es la política: nadie entra solo por estar dentro del edificio.

```java
import java.util.*;

public class RbacSmoke {
    static boolean canDelete(Set<String> roles) { return roles.contains("ADMIN"); }
    static boolean canRead(String owner, String userId) { return owner.equals(userId); }

    public static void main(String[] args) {
        System.out.println(canDelete(Set.of("USER")));
        System.out.println(canDelete(Set.of("ADMIN")));
        System.out.println(canRead("u1", "u1"));
        System.out.println(canRead("u1", "u2"));
    }
}
```

```bash
javac RbacSmoke.java
java RbacSmoke
```

Salida esperada:

```text
false
true
true
false
```

RBAC cubre permisos gruesos. Ownership/ABAC cubre reglas por recurso. mTLS autentica workloads. Zero-Trust combina identidad, least privilege, cifrado y observabilidad.

El error más común es solo validar login. El síntoma es usuario autenticado que borra recursos ajenos. La causa es falta de authZ por rol/ownership. La corrección es checks por rol/scope y por recurso.

### Tema 4: Vault, gestión de secretos, SBOM y CVE scanning · Intermedio · 120 min

## Vault, secretos, SBOM y CVE scanning: de secreto en Git a cadena de suministro segura

La contraseña de base de datos está en `application-prod.yml` dentro del repositorio. Alguien hace fork por error y el secreto queda expuesto. En paralelo, una dependencia con CVE crítica entra por una actualización menor y nadie lo detecta antes del release.

Un secreto es como la llave maestra: no se deja pegada en la pared del pasillo. Se guarda en una caja fuerte con acceso auditado. El SBOM es la lista de ingredientes del producto; el CVE scan es revisar si algún ingrediente tiene retiro sanitario.

```java
public class VaultSmoke {
    static String getSecret(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("missing");
        return "***";
    }
    static boolean releaseBlocked(int criticalCves) { return criticalCves > 0; }

    public static void main(String[] args) {
        System.out.println(getSecret("db"));
        try { getSecret(""); } catch (Exception e) { System.out.println(e.getMessage()); }
        System.out.println(releaseBlocked(1));
    }
}
```

```bash
javac VaultSmoke.java
java VaultSmoke
```

Salida esperada:

```text
***
missing
true
```

Vault entrega credenciales DB con TTL. En CI, Syft genera SBOM y Trivy/Grype escanean. Una CVE crítica bloquea el release. El secreto se inyecta en runtime, nunca en Git.

El error más común es secreto en repositorio. El síntoma es credencial filtrada. La causa es `.env` o YAML commiteado. La corrección es secret manager, pre-commit scanning, rotación inmediata.

## Cierre

La seguridad distribuida se construye en capas: identidad, autorización, transporte, secretos y cadena de suministro. Ninguna capa reemplaza a otra. El objetivo no es "estar seguro", sino reducir riesgo, detectar fallos rápido y limitar el impacto cuando algo sale mal.

## Checklist

- Filtro de seguridad explícito y default deny.
- JWT validado por firma, `iss`, `aud`, `exp` y `alg`.
- Autorización por rol/scope y por recurso.
- mTLS/Zero-Trust donde la comunicación interna sea sensible.
- Secretos fuera de Git; rotación y auditoría.
- SBOM y CVE scan con gate por severidad.
- Nota de verificación honesta cuando falta infraestructura.
