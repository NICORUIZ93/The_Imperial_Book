# Laboratorio · Módulo 9 · Seguridad

Lección: [`web/public/content/microservices/modulo-13.md`](../../../web/public/content/microservices/modulo-13.md)
(Fase 1, specs/018). Cada ficha trae su **antes (vulnerable)** y su **después (seguro)**.

| Carpeta | Ficha | Necesita |
|---|---|---|
| `jdk/CadenaDeFiltros.java` · `f061-filter-chain` | Spring Security: filter chain | — |
| `jdk/JwtFirmas.java` · `f062-jwt` | JWT: firmas simétricas vs asimétricas | — |
| `jdk/OAuthPkce.java` · `f063-oauth2-oidc` | OAuth2 y OIDC | Keycloak para el login real |
| `keycloak/tienda-realm.json` · `jdk/VerToken.java` · `f064-keycloak` | Keycloak | Keycloak |
| `jdk/RbacScopes.java` · `f065-rbac-scopes` | RBAC y Scopes | — |
| `jdk/IntercambioDeTokens.java` · `f066-token-exchange` | Token Exchange (RFC 8693) | Keycloak para el canje real |
| `jdk/generar-certs.sh` · `jdk/MtlsDemo.java` · `mtls-kind/` | mTLS con Service Mesh | kind + Istio para la malla |
| `vault/` · `jdk/VaultKv.java` · `f068-vault` | HashiCorp Vault | Vault |
| `f069-escaneo/` · `jdk/MiniEscaner.java` | Escaneo de vulnerabilidades: Trivy, Snyk | Docker (Trivy) · cuenta gratuita (Snyk) |

## Versiones

JDK 25 LTS (25.0.5) · Spring Boot 4.1.3 (Spring Security 7.1.3, Spring Framework 7.0.11) · Spring Cloud 2025.1.4
(Spring Cloud Vault) · Keycloak 26.8.2 (`quay.io/keycloak/keycloak:26.8.2`) · HashiCorp Vault 2.2.0
(`hashicorp/vault:2.2.0`) · Trivy 0.76.1 (`aquasec/trivy:0.76.1`) · Snyk CLI 1.1309.0 · Istio 1.32 · kind ·
Maven 3.10.1 por el wrapper · OpenSSL 3.

## Ejecutar

```bash
cd examples/microservicios/modulo-13
./verificar.sh --solo-jdk     # solo JDK 25 y openssl: las 7 demostraciones de jdk/
./verificar.sh                # + Keycloak, Vault, Trivy y los tests Maven
./verificar.sh --mtls         # + F067 con kind e Istio (tarda ~5 min la primera vez)
```

El script termina con `RESULTADO: OK · Módulo 9 (Seguridad) verificado`.

## Usuarios y clientes del realm `tienda` (solo desarrollo)

| Qué | Valor |
|---|---|
| Consola de Keycloak | http://localhost:8180 · `admin` / `admin-solo-dev` |
| Usuarios (contraseña `clave-demo`) | `ana` (rol `cliente`), `sofia` (`soporte`), `root` (`admin`) |
| `tienda-web` | cliente confidencial con Authorization Code + PKCE (F063), secreto `solo-dev-tienda-web` |
| `tienda-cli` | cliente público con *password grant* **solo para el laboratorio** (curl) |
| `pedidos` | cliente confidencial con *Standard token exchange* (F066), secreto `solo-dev-pedidos` |
| `pagos` | audiencia de los tokens canjeados |
| Vault | http://localhost:8200 · token raíz `root-solo-dev` (modo dev); la app usa el token con política de `vault/sembrar.sh` |

Todos los secretos de esta tabla existen solo para el laboratorio local. En producción vienen de Vault (F068).
