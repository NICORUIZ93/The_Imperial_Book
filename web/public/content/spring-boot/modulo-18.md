# Módulo 18: Seguridad avanzada

Este módulo profundiza la seguridad para escenarios enterprise: OIDC/OAuth2, autorización por recurso/método, SAML y hardening de secretos/configuración. La seguridad debe ser comprobable y por capas.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Spring Boot 3.5.0, Spring Security 6.x.

## Aprende construyendo

### Tema 1: OIDC/OAuth2 con Spring Security · Avanzado · 45 min

Caso guía: app delega login a un Identity Provider.

#### OAuth2/OIDC

**Definición formal.** OAuth2 es un framework de autorización; OpenID Connect agrega identidad sobre OAuth2. Spring Security soporta client y resource server.

**Error común.** Confundir access token con ID token. Corrección: usar cada token según su propósito y validar claims.

**Nota de verificación.** Requiere IdP (Keycloak/Auth0/etc.); lab con Docker factible.

### Tema 2: Autorización por recurso/método · Avanzado · 45 min

Caso guía: solo dueño o admin puede ver una guía.

#### Method security

**Definición formal.** Autorización declarativa en métodos (`@PreAuthorize`) o por reglas de request.

**Ejemplo mínimo.**

```java
@PreAuthorize("hasRole('ADMIN') or @authz.esDueno(#id, authentication)")
public GuiaDto get(String id) { ... }
```

**Error común.** Chequear rol en UI pero no en backend. Corrección: autorización en servidor.

### Tema 3: SAML y escenarios enterprise · Avanzado · 40 min

Caso guía: integración SSO legacy corporativo.

#### SAML

**Definición formal.** Protocolo XML para federación de identidad/SSO enterprise. Spring Security soporta SAML2 service provider.

**Error común.** Tratar SAML como “solo config”; requiere entender certificados, metadata y assertions. Corrección: validar metadata, expiración, firmas y clock skew.

### Tema 4: Hardening y secretos · Avanzado · 35 min

Caso guía: credencial DB en `application.yml` commiteada.

#### Secret management

**Definición formal.** Gestión de secretos mediante vault/secret manager/env inyectado, con rotación y mínimo privilegio.

**Reglas.** No commitear secretos; no loguearlos; rotarlos; usar TLS; limitar Actuator.

**Error común.** Poner secretos en repo “privado”. Corrección: secret manager + scanning + rotación.

## Cierre

Seguridad avanzada es identidad, autorización fina y hardening continuo. No hay una casilla única que marque “seguro”.

## Checklist

- Valido tokens/claims correctamente.
- Autorizo en backend por recurso/método.
- Manejo secretos fuera del repo.
- Hardening de endpoints y TLS.
