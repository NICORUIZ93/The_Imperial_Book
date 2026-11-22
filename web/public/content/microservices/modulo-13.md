# Módulo 9 · Seguridad en microservicios

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, OpenSSL 3.x disponible en sistema, Docker 29.9.3. Se verifican conceptos con JWT HMAC, RBAC, scopes y chequeos básicos. Spring Security, OAuth2/OIDC, Keycloak, Vault, mTLS mesh, Trivy/Snyk requieren infra/servicios; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Spring Security: filter chain · Intermedio · 150 min

Caso guía: permitir `/public` y proteger `/admin`.

#### Security filter chain

**Definición formal.** Cadena de filtros Servlet que intercepta requests para autenticación, autorización y protecciones.

**Para qué sirve.** Aplica seguridad transversal antes del controlador.

**Cuándo usarlo y cuándo no.** Úsalo en apps Spring. No implementes seguridad ad hoc en cada controller.

**Ejemplo mínimo enfocado (ejecutable, simulación).**

```bash
node -e "function allow(path,role){ if(path.startsWith('/public')) return 200; if(path.startsWith('/admin')&&role==='ADMIN') return 200; return 403; } console.log(allow('/public',''), allow('/admin','USER'), allow('/admin','ADMIN'));"
```

**Caso de uso real.** Spring Security `SecurityFilterChain`.

**Error común.** Orden de reglas incorrecto. Corrección: reglas específicas primero.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200 403 200`. **Nota:** Spring Security real requiere contexto Spring.

### Tema 2: JWT: firmas simétricas vs asimétricas · Intermedio · 150 min

Caso guía: validar token emitido por auth server.

#### JWT

**Definición formal.** JSON Web Token es un formato compacto de claims firmado (JWS) y/o cifrado (JWE).

**Para qué sirve.** Propagar identidad/claims entre servicios.

**Cuándo usarlo y cuándo no.** Úsalo para claims de corta vida. No metas secretos en payload; no uses tokens largos sin expiración.

**Ejemplo mínimo enfocado (ejecutable, HS256).**

```bash
node -e "const crypto=require('crypto'); function b64u(o){return Buffer.from(JSON.stringify(o)).toString('base64url')} const h=b64u({alg:'HS256',typ:'JWT'}); const p=b64u({sub:'1',exp:9999999999}); const s=crypto.createHmac('sha256','secret').update(h+'.'+p).digest('base64url'); console.log((h+'.'+p+'.'+s).split('.').length)"
```

**Caso de uso real.** Access token Bearer.

**Error común.** No validar `exp/aud/iss`. Corrección: validar claims completos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `3`.

#### Simétrica vs asimétrica

**Definición formal.** HS256 usa secreto compartido; RS256/ES256 usan clave privada para firmar y pública para verificar.

**Para qué sirve.** Asimétrica evita compartir secreto de firma con verificadores.

**Cuándo usarlo y cuándo no.** Asimétrica en ecosistemas distribuidos; simétrica en contextos controlados simples.

**Ejemplo mínimo enfocado (conceptual).**

```text
HS256: mismo secret firma/verifica
RS256: private key firma, public key verifica
```

**Caso de uso real.** IdP firma RS256, APIs verifican con JWKS.

**Error común.** Algoritmo `none` o confusión de algoritmo. Corrección: whitelist de algoritmos.

**Verificación.** **Nota de verificación:** verificación RS256/JWKS real requiere librería JOSE/IdP.

### Tema 3: OAuth2 y OIDC · Avanzado · 180 min

Caso guía: login de usuario y acceso a API.

#### OAuth2

**Definición formal.** Framework de autorización que permite a un cliente obtener acceso limitado a recursos mediante tokens.

**Para qué sirve.** Delegar autorización sin compartir credenciales del usuario.

**Cuándo usarlo y cuándo no.** Úsalo para autorización delegada. No lo uses como protocolo de autenticación puro sin OIDC.

**Ejemplo mínimo enfocado (conceptual).**

```text
Authorization Code + PKCE: browser -> auth server -> code -> token
```

**Caso de uso real.** SPA usa Authorization Code con PKCE.

**Error común.** Usar Implicit flow legacy. Corrección: Authorization Code + PKCE.

**Verificación.** **Nota de verificación:** requiere IdP/OAuth2 provider.

#### OIDC

**Definición formal.** OpenID Connect es una capa de identidad sobre OAuth2 que provee ID Token y claims de usuario.

**Para qué sirve.** Autenticación interoperable.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesitas identidad del usuario. No confundas ID token con access token.

**Ejemplo mínimo enfocado (ejecutable, claim simulado).**

```bash
node -e "console.log(JSON.stringify({iss:'idp',sub:'u1',aud:'app',exp:9999999999}))"
```

**Caso de uso real.** Login con Keycloak/Google.

**Error común.** Usar access token donde se requiere ID token. Corrección: usar token según propósito.

**Verificación (Node 24.18.0, 2026-05-22).** Salida JSON de claims.

### Tema 4: Keycloak · Intermedio · 120 min

Caso guía: IdP para gestionar usuarios/roles.

#### Keycloak

**Definición formal.** Keycloak es un IAM open source que implementa OAuth2/OIDC/SAML, gestión de usuarios, roles y federación.

**Para qué sirve.** Centraliza autenticación/autorización empresarial.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesitas IAM completo. No si un proveedor gestionado simple basta.

**Ejemplo mínimo enfocado (Docker conceptual).**

```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.0 start-dev
```

**Caso de uso real.** Realm con roles y clientes OIDC.

**Error común.** Configurar clientes públicos con secretos mal entendidos. Corrección: entender tipos de cliente y flujos.

**Verificación.** **Nota de verificación:** requiere contenedor Keycloak y navegador; no ejecutado aquí.

### Tema 5: RBAC y Scopes · Intermedio · 120 min

Caso guía: solo admin borra usuarios; scope `read:products`.

#### RBAC

**Definición formal.** Role-Based Access Control otorga permisos según roles asignados.

**Para qué sirve.** Simplifica autorización administrativa.

**Cuándo usarlo y cuándo no.** Úsalo cuando los permisos se agrupan bien por rol. No si necesitas decisiones muy dinámicas por atributo (considerar ABAC).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "function can(role,act){ return role==='ADMIN' && act==='delete' } console.log(can('ADMIN','delete'), can('USER','delete'));"
```

**Caso de uso real.** `ROLE_ADMIN` puede borrar.

**Error común.** Hardcodear roles dispersos. Corrección: centralizar política.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true false`.

#### Scopes

**Definición formal.** Scopes son permisos concedidos a un token/cliente para limitar acceso a recursos.

**Para qué sirve.** Principio de menor privilegio en OAuth2.

**Cuándo usarlo y cuándo no.** Úsalo para delimitar permisos por cliente. No los confundas con roles de usuario.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const scopes=['read:products']; console.log(scopes.includes('read:products'), scopes.includes('write:products'));"
```

**Caso de uso real.** Token con `read:products`.

**Error común.** Scopes demasiado amplios. Corrección: mínimos necesarios.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true false`.

### Tema 6: Token Exchange (RFC 8693) · Avanzado · 90 min

Caso guía: servicio intermedio cambia token por uno con audiencia adecuada.

#### Token Exchange

**Definición formal.** RFC 8693 define un mecanismo para intercambiar un token por otro en el authorization server.

**Para qué sirve.** Delegación segura entre servicios y ajuste de audience/scope.

**Cuándo usarlo y cuándo no.** Úsalo en cadenas service-to-service. No reenvíes tokens de usuario sin control.

**Ejemplo mínimo enfocado (conceptual).**

```text
POST /token grant_type=urn:ietf:params:oauth:grant-type:token-exchange
subject_token=...
audience=downstream-api
```

**Caso de uso real.** Gateway intercambia token para servicio interno.

**Error común.** Token con audience incorrecta aceptado. Corrección: validar `aud`.

**Verificación.** **Nota de verificación:** requiere IdP con soporte RFC 8693.

### Tema 7: mTLS con Service Mesh · Avanzado · 120 min

Caso guía: cifrar y autenticar tráfico service-to-service.

#### mTLS

**Definición formal.** Mutual TLS autentica ambas partes de una conexión TLS mediante certificados cliente y servidor.

**Para qué sirve.** Confidencialidad, integridad e identidad de workload.

**Cuándo usarlo y cuándo no.** Úsalo para tráfico interno sensible. No sin gestión de certificados/rotación.

**Ejemplo mínimo enfocado (conceptual).**

```text
client cert -> verifies server cert
server cert -> verifies client cert
```

**Caso de uso real.** Istio/Linkerd inyectan sidecars con mTLS.

**Error común.** Certificados expirados no rotados. Corrección: automatizar rotación.

**Verificación.** **Nota de verificación:** requiere mesh/certs; no ejecutado.

### Tema 8: HashiCorp Vault · Intermedio · 120 min

Caso guía: obtener secretos dinámicos.

#### Vault

**Definición formal.** Vault es un sistema de gestión de secretos, cifrado y credenciales dinámicas.

**Para qué sirve.** Centraliza secretos y reduce exposición.

**Cuándo usarlo y cuándo no.** Úsalo cuando hay secretos distribuidos o credenciales dinámicas. No hardcodees secretos en config.

**Ejemplo mínimo enfocado (conceptual).**

```bash
vault kv get secret/catalog
```

**Caso de uso real.** App obtiene credenciales DB de corta vida.

**Error común.** Token Vault con permisos excesivos. Corrección: políticas mínimas.

**Verificación.** **Nota de verificación:** requiere Vault server y auth; no ejecutado.

### Tema 9: Escaneo de vulnerabilidades: Trivy, Snyk · Intermedio · 90 min

Caso guía: detectar CVEs en imagen y dependencias.

#### Escaneo de vulnerabilidades

**Definición formal.** Análisis automatizado de dependencias/imágenes/config para detectar vulnerabilidades conocidas.

**Para qué sirve.** Reduce riesgo de componentes vulnerables.

**Cuándo usarlo y cuándo no.** Úsalo en CI y registro. No ignores severidades altas sin justificación.

**Ejemplo mínimo enfocado (conceptual).**

```bash
trivy image myapp:1.0.0
snyk test
```

**Caso de uso real.** CI falla ante CVE crítica.

**Error común.** Escanear solo en local. Corrección: gate en CI y política de remediación.

**Verificación.** **Nota de verificación:** requiere Trivy/Snyk instalados y autenticación según caso.

## Cierre del módulo

La seguridad en microservicios es defensa en profundidad: identidad (OAuth2/OIDC/JWT), autorización (RBAC/scopes), secreto/certificado (Vault/mTLS), y supply chain (escaneo). Las notas honestas indican donde se requiere infraestructura real para validar.
