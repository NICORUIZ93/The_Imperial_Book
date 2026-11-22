# Módulo 8 · Seguridad en microservicios Spring

La seguridad distribuida debe ser por capas: identidad, autorización, transporte, secretos y dependencias. En Spring, Security filter chain, OAuth2/OIDC y gestión de secretos son la base; mTLS/Zero-Trust y mesh la refuerzan en service-to-service.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan smokes de JWT claims, RBAC y secretos con Java puro. Spring Security/Keycloak/Vault/mTLS requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Spring Security filter chain · Intermedio · 150 min

Caso guía: proteger `/orders/**` y dejar `/health` público.

#### Filter chain

**Definición formal.** Spring Security procesa requests mediante una cadena de filtros que autentican, autorizan y protegen contra ataques comunes.

**Contrato / internals.** Spring Security usa cadena de filtros Servlet; cada request pasa por autenticación, autorización y manejo de excepciones de seguridad. Configurar `SecurityFilterChain` explícita y stateless para APIs.


**Cuándo usarlo / cuándo no.** Úsalo en todo endpoint. No deshabilites seguridad por comodidad en prod.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm8-sec
cd sm8-sec
```

Crea el archivo `Sec.java`:

```java
public class Sec {
  static int status(String path, boolean auth){ if(path.equals("/health")) return 200; return auth ? 200 : 401; }
  public static void main(String[] args){ System.out.println(status("/health",false)); System.out.println(status("/orders",false)); System.out.println(status("/orders",true)); }
}
```

```bash
javac Sec.java
java Sec
```

**Error común.** Confiar en seguridad solo en frontend.

**Síntoma.** acceso directo a API sin auth. **Causa.** falta control backend. **Corrección.** authZ/authN en backend. **Señal observable.** 200 en endpoint protegido sin token.

**Caso real.** Tienda Aurora protege `/api/pedidos/**` con JWT y deja `/actuator/health` público para probes.


**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `200`, `401`, `200`.

### Tema 2: JWT y OAuth2/OIDC · Avanzado · 180 min

Caso guía: validar access token emitido por IdP.

#### Tokens

**Definición formal.** JWT es formato de token firmado/cifrado. OAuth2 delega autorización; OIDC agrega identidad sobre OAuth2. Access token autoriza; ID token identifica.

**Contrato / internals.** OAuth2 delega autorización; OIDC añade identidad. Access token autoriza API; ID token identifica usuario. Validar issuer, audience, firma, expiración y scopes/roles.


**Cuándo usarlo / cuándo no.** Úsalo con expiración corta y validación completa. No aceptes tokens sin validar firma/aud/iss/exp.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm8-jwt
cd sm8-jwt
```

Crea el archivo `Jwt.java`:

```java
import java.util.*;
public class Jwt {
  static boolean valid(Map<String,Object> claims, String aud){ return "iss1".equals(claims.get("iss")) && aud.equals(claims.get("aud")) && (int)claims.get("exp") > 100; }
  public static void main(String[] args){ System.out.println(valid(Map.of("iss","iss1","aud","orders","exp",200),"orders")); System.out.println(valid(Map.of("iss","bad","aud","orders","exp",200),"orders")); }
}
```

```bash
javac Jwt.java
java Jwt
```

**Error común.** Solo decodificar JWT.

**Síntoma.** token forjado aceptado. **Causa.** no validar firma/claims. **Corrección.** validar firma, iss, aud, exp, alg permitido. **Señal observable.** tokens alterados pasan.

**Caso real.** Gateway valida JWT emitido por Keycloak; servicios internos confían en claims propagados y aplican RBAC por recurso.


**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Keycloak/OIDC real requiere IdP.

### Tema 3: RBAC, scopes y mTLS/Zero-Trust · Avanzado · 150 min

Caso guía: `DELETE /orders/{id}` solo lo puede ejecutar un admin; además, `orders-service` solo debe aceptar llamadas internas de `billing-service` autenticadas por certificado.

#### Definición formal

- **RBAC (Role-Based Access Control):** autorización basada en roles asignados a identidades.
- **Scopes/permisos:** autorización granular, común en OAuth2, sobre acciones delegadas.
- **mTLS:** TLS mutuo; cliente y servidor presentan certificados y se autentican ambos.
- **Zero-Trust:** modelo donde ninguna red/llamada se considera confiable por defecto; cada request se autentica, autoriza y observa.

#### Contrato / internals

- **Autenticación != autorización:** token válido no implica permiso para toda operación.
- **RBAC:** roles como `ADMIN`, `USER`; útil para permisos gruesos.
- **ABAC/policies:** cuando la decisión depende de atributos (owner, tenant, horario, sensibilidad).
- **mTLS:** identidad de workload por certificado; rotación y CA interna son parte del contrato operativo.
- **Zero-Trust:** combina identidad fuerte, least privilege, segmentación, cifrado en tránsito y auditoría.

#### Cuándo usarlo / cuándo no

**RBAC/scopes:** úsalos siempre para control de acceso. **No** uses solo autenticación. **mTLS/Zero-Trust:** úsalos en comunicación service-to-service sensible o entornos regulados. **No** asumas que la red privada es suficiente protección.

#### Ejemplo mínimo ejecutable

Crea el archivo `Rbac.java`:

```java
import java.util.*;
public class Rbac {
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
javac Rbac.java
java Rbac
```

Salida esperada:

```text
false
true
true
false
```

#### Caso real

En Spring Security, un endpoint admin exige `ROLE_ADMIN`; otro endpoint valida ownership por `order.userId`. Entre servicios, mTLS garantiza identidad de workload y la policy solo permite `billing` a `POST /payments/capture`.

#### Error común

**Síntoma.** usuario autenticado borra recursos ajenos. **Causa.** solo se validó login, no rol/recurso. **Corrección.** checks por rol/scope y por ownership/atributo. **Señal observable.** auditoría muestra acciones admin realizadas por rol `USER`.

**Síntoma.** servicio interno falso llama a endpoint interno. **Causa.** confiar en red plana. **Corrección.** mTLS/identidad de workload + autorización. **Señal observable.** requests internos sin identidad de certificado/policy válida.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `false`, `true`, `true`, `false`.

**Nota de verificación:** no se ejecutó mTLS/Keycloak/mesh en esta sesión. Verificación propuesta: configurar Spring Security Resource Server + policy por recurso y mTLS entre dos servicios; pruebas deben dar 200/401/403 según identidad y rol.

### Tema 4: Vault, gestión de secretos, SBOM y CVE scanning · Intermedio · 120 min

Caso guía: la password de DB debe rotarse sin redeploy. Además, una dependencia tiene CVE crítica y el pipeline debe bloquear el release.

#### Definición formal

- **Secret manager (Vault/SM):** sistema para almacenar, entregar, rotar y auditar secretos.
- **SBOM (Software Bill of Materials):** inventario de componentes/dependencias de un artefacto.
- **CVE scanning:** análisis de dependencias/imágenes contra vulnerabilidades conocidas.

#### Contrato / internals

- **Secretos:** no en git, no en logs, no hardcodeados. Se entregan en runtime por mecanismo seguro.
- **Rotación:** el servicio debe tolerar cambio de credencial sin caída prolongada.
- **SBOM:** identifica qué contiene exactamente la imagen/JAR.
- **CVE scan:** compara SBOM/deps con bases de vulnerabilidad; la política define severidades que bloquean.
- **Límite:** “sin CVEs conocidas” no significa seguro; es control necesario, no suficiente.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre en CI/CD y runtime. **No** ignores CVEs críticas por ruido; clasifica con alcance y remediación. **No** uses secretos de prueba en producción.

#### Ejemplo mínimo ejecutable

Crea el archivo `Vault.java`:

```java
public class Vault {
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
javac Vault.java
java Vault
```

Salida esperada:

```text
***
missing
true
```

#### Caso real

Vault entrega credenciales DB con TTL; la app renueva antes de expirar. En CI, Syft genera SBOM y Trivy/Grype escanean; una CVE crítica bloquea el release.

#### Error común

**Síntoma.** secreto filtrado en repositorio. **Causa.** `.env` o YAML commiteado. **Corrección.** secret manager, pre-commit scanning, rotación inmediata. **Señal observable.** alerta de secret scanning o credencial usada desde IP desconocida.

**Síntoma.** vulnerabilidad crítica en producción. **Causa.** no hay gate de CVE/SBOM. **Corrección.** SBOM + scan en CI + política de severidad. **Señal observable.** reporte de dependencia vulnerable sin remediación.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `***`, `missing`, `true`.

**Nota de verificación:** no se ejecutó Vault, Syft, Trivy o Grype en esta sesión. Verificación propuesta:

```bash
syft dir:. -o cyclonedx-json > sbom.json
grype sbom:sbom.json
```

Resultado esperado: SBOM generado y gate falla ante CVE crítica según política.

## Cierre

Seguridad en Spring es defense in depth: validar identidad, autorizar por recurso, proteger transporte, gestionar secretos y escanear dependencias.

## Checklist

- Valido JWT firma y claims.
- Autorizo por rol/scope/recurso.
- No hay secretos en git.
- CVEs críticas bloquean release.
