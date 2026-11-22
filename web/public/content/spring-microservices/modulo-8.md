# Módulo 8 · Seguridad en microservicios Spring

La seguridad distribuida debe ser por capas: identidad, autorización, transporte, secretos y dependencias. En Spring, Security filter chain, OAuth2/OIDC y gestión de secretos son la base; mTLS/Zero-Trust y mesh la refuerzan en service-to-service.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan smokes de JWT claims, RBAC y secretos con Java puro. Spring Security/Keycloak/Vault/mTLS requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Spring Security filter chain · Intermedio · 150 min

Caso guía: proteger `/orders/**` y dejar `/health` público.

#### Filter chain

**Definición formal.** Spring Security procesa requests mediante una cadena de filtros que autentican, autorizan y protegen contra ataques comunes.

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

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `200`, `401`, `200`.

### Tema 2: JWT y OAuth2/OIDC · Avanzado · 180 min

Caso guía: validar access token emitido por IdP.

#### Tokens

**Definición formal.** JWT es formato de token firmado/cifrado. OAuth2 delega autorización; OIDC agrega identidad sobre OAuth2. Access token autoriza; ID token identifica.

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

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Keycloak/OIDC real requiere IdP.

### Tema 3: RBAC, scopes y mTLS/Zero-Trust · Avanzado · 150 min

Caso guía: solo `admin` puede borrar; servicios internos usan mTLS.

#### Autorización y transporte

**Definición formal.** RBAC autoriza por roles; scopes por permisos delegados. mTLS autentica ambos extremos por certificados.

**Cuándo usarlo / cuándo no.** RBAC para permisos gruesos; ABAC/policies para fino. mTLS en service-to-service sensible.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm8-rbac
cd sm8-rbac
```

Crea el archivo `Rbac.java`:

```java
import java.util.*;
public class Rbac {
  static boolean canDelete(Set<String> roles){ return roles.contains("ADMIN"); }
  public static void main(String[] args){ System.out.println(canDelete(Set.of("USER"))); System.out.println(canDelete(Set.of("ADMIN"))); }
}
```

```bash
javac Rbac.java
java Rbac
```

**Error común.** Autorizar solo por estar autenticado.

**Síntoma.** escalamiento de privilegios. **Causa.** falta control por rol/scope/recurso. **Corrección.** least privilege, checks por recurso. **Señal observable.** usuario normal accede a admin.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `false`, `true`.

### Tema 4: Vault, gestión de secretos y SBOM y CVE scanning · Intermedio · 120 min

Caso guía: rotar DB password sin redeploy.

#### Secretos y dependencias

**Definición formal.** Secret managers almacenan y rotan secretos. CVE scanning detecta vulnerabilidades conocidas en dependencias/imágenes.

**Cuándo usarlo / cuándo no.** Siempre. No secretos en git; no ignorar CVEs críticas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm8-vault
cd sm8-vault
```

Crea el archivo `Vault.java`:

```java
public class Vault {
  static String getSecret(String name){ if(name==null||name.isBlank()) throw new IllegalArgumentException("missing"); return "***"; }
  public static void main(String[] args){ System.out.println(getSecret("db")); try{ getSecret(""); }catch(Exception e){ System.out.println(e.getMessage()); } }
}
```

```bash
javac Vault.java
java Vault
```

**Error común.** Secretos en repo.

**Síntoma.** filtración. **Causa.** mal manejo. **Corrección.** Vault/SM, scanning, rotación. **Señal observable.** alertas secret scanning.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `***`, `missing`. **Nota de verificación:** Vault/Keycloak/Trivy reales no ejecutados.

## Cierre

Seguridad en Spring es defense in depth: validar identidad, autorizar por recurso, proteger transporte, gestionar secretos y escanear dependencias.

## Checklist

- Valido JWT firma y claims.
- Autorizo por rol/scope/recurso.
- No hay secretos en git.
- CVEs críticas bloquean release.
