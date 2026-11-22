# Módulo 18: Spring Security II: OIDC, autorización por recurso y SAML

Seguridad avanzada: OIDC/OAuth2, autorización por recurso, SAML y hardening.

**Entorno (2026-05-22):** JDK 27. Requiere IdP/configuración externa para verificación completa.

## Aprende construyendo

### Tema 1: OIDC/OAuth2 con Spring Security · Avanzado · 45 min
#### OIDC
**Definición formal.** Capa de identidad sobre OAuth 2.0 que provee ID Token y claims de usuario.
**Para qué sirve.** Login federado y SSO.
**Cuándo usarlo.** Apps con IdP (Keycloak, Entra, Okta).
**Ejemplo mínimo enfocado (Spring).** `spring-boot-starter-oauth2-client` / resource server.
**Caso de uso real.** SSO corporativo.
**Error común.** Confundir OAuth2 (autorización) con OIDC (identidad). Corrección: usar OIDC cuando necesitas identidad.
**Verificación.** **Nota:** requiere IdP.

### Tema 2: Autorización por recurso/método · Avanzado · 45 min
#### `@PreAuthorize`
**Definición formal.** Anotación para evaluar expresiones de autorización antes de ejecutar un método.
**Para qué sirve.** Reglas finas por método/recurso.
**Cuándo usarlo.** Cuando URL rules no bastan.
**Ejemplo mínimo enfocado (Spring).** `@PreAuthorize("hasRole('ADMIN') or #id == authentication.name")`
**Caso de uso real.** Usuario solo ve su recurso.
**Error común.** Confiar en ocultar botón UI. Corrección: autorizar en backend.
**Verificación.** **Nota:** requiere contexto Security.

### Tema 3: SAML y escenarios enterprise · Avanzado · 40 min
#### SAML
**Definición formal.** Estándar XML para federación de identidad/autenticación enterprise.
**Para qué sirve.** SSO con IdPs enterprise legacy.
**Cuándo usarlo.** Cuando el IdP/organización lo exige.
**Ejemplo mínimo enfocado (conceptual).** Spring Security SAML2 service provider.
**Caso de uso real.** Integración con IdP corporativo SAML.
**Error común.** Tratar SAML como JWT simple. Corrección: entender metadata, assertions, certificados.
**Verificación.** **Nota:** requiere IdP SAML.

### Tema 4: Hardening y secretos · Avanzado · 35 min
#### Hardening
**Definición formal.** Aplicar configuraciones seguras por defecto, mínima exposición y gestión de secretos.
**Para qué sirve.** Reducir superficie de ataque.
**Cuándo usarlo.** Siempre.
**Ejemplo mínimo enfocado (ejecutable checklist).**
```bash
echo "HTTPS, headers, secretos fuera de git, least privilege, deps actualizadas"
```
**Caso de uso real.** Rotar secretos y deshabilitar endpoints innecesarios.
**Error común.** Secretos en `application.yml` commiteado. Corrección: vault/env/secret manager.
**Verificación (2026-05-22).** Checklist emitido.

## Cierre
Security avanzada es identidad federada + autorización fina + hardening operativo. Verifica con tokens reales y pruebas negativas.
