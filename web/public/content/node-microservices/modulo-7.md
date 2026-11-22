# Módulo 7 · Seguridad en Node.js

La seguridad en microservicios Node se aplica en capas: identidad, autorización, validación de input, hardening HTTP, secretos y dependencias. Una API “funcional” pero insegura convierte bugs en incidentes. Este módulo cubre controles prácticos con verificación y notas honestas.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Se verifican contratos/lógica con Node; `jsonwebtoken`, Passport, Helmet, librerías OWASP/secret managers requieren dependencias/infra y se marcan con **Nota de verificación**.

## Aprende construyendo

### Tema 1: JWT con jsonwebtoken · Intermedio · 120 min

Caso guía: propagar identidad entre gateway y servicio interno.

#### JWT

**Definición formal.** JSON Web Token es un formato de token firmado (JWS) o cifrado (JWE). En su forma común lleva header, payload y firma; la firma garantiza integridad y autenticidad del emisor con la clave correspondiente.

**Para qué sirve.** Transmitir claims de identidad/autorización entre componentes.

**Cuándo usarlo / cuándo no.** Úsalo para access tokens de corta vida. No lo uses como sesión opaca revocable sin estrategia; no metas secretos en payload; no confíes en `alg` enviado por el cliente.

**Contrato mínimo.** `iss`, `sub`, `aud`, `exp`, `iat`, `jti` según caso; algoritmo esperado; clave/secreto; validación en backend.

**Ejemplo mínimo enfocado (ejecutable, HS256 con Node crypto).**

```bash
mkdir -p nm7-jwt
cd nm7-jwt
```

Crea el archivo `jwt.mjs`:

```js
import { createHmac } from 'node:crypto';
function b64url(obj) { return Buffer.from(JSON.stringify(obj)).toString('base64url'); }
function sign(payload, secret) {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url(payload);
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}
function verify(token, secret) {
  const [h,b,s] = token.split('.');
  const expected = createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url');
  if (s !== expected) return { ok: false };
  const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
  if (payload.exp < Math.floor(Date.now()/1000)) return { ok: false, reason: 'expired' };
  return { ok: true, sub: payload.sub };
}
const token = sign({ sub: 'u1', exp: Math.floor(Date.now()/1000)+60 }, 'secret');
console.log(verify(token, 'secret').ok);
console.log(verify(token, 'wrong').ok);
```

```bash
node jwt.mjs
```

**Caso de uso real.** Gateway valida JWT y pasa identidad a servicios; servicios validan firma/aud/exp.

**Error común.** Confiar en JWT sin validar firma/claims.

**Síntoma.** suplantación de usuario o aceptación de tokens expirados. **Causa.** solo decodificar base64 o no validar `exp/aud/iss`. **Corrección.** verificar firma con algoritmo permitido, validar claims y expiración. **Señal observable.** requests con tokens alterados aceptados en tests de seguridad.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** `jsonwebtoken` real `npm i jsonwebtoken`; no usar `alg:none`.

### Tema 2: Passport.js · Intermedio · 120 min

Caso guía: soportar múltiples estrategias de autenticación.

#### Passport

**Definición formal.** Passport.js es middleware de autenticación para Node/Express con estrategias pluggables (local, JWT, OAuth, etc.).

**Para qué sirve.** Unificar flujo de autenticación y desacoplar estrategia.

**Cuándo usarlo / cuándo no.** Úsalo en Express cuando necesitas varias estrategias. No lo uses como sustituto de autorización; no metas reglas de negocio complejas en estrategias.

**Ejemplo mínimo enfocado (ejecutable, estrategia simplificada).**

```bash
mkdir -p nm7-passport
cd nm7-passport
```

Crea el archivo `strategy.mjs`:

```js
function localStrategy(username, password) {
  if (username === 'ada' && password === 'secret') return { ok: true, user: { id: 1, name: 'ada' } };
  return { ok: false };
}
console.log(localStrategy('ada','secret').ok);
console.log(localStrategy('ada','bad').ok);
```

```bash
node strategy.mjs
```

**Caso de uso real.** Login local + JWT para APIs + OAuth para SSO.

**Error común.** Confundir autenticación con autorización.

**Síntoma.** usuario autenticado accede a recursos ajenos. **Causa.** falta check de roles/permisos. **Corrección.** autenticar identidad y luego autorizar por policy/rol/scope. **Señal observable.** 200 en endpoint que debería dar 403.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Passport real `npm i passport passport-local`.

### Tema 3: Helmet, CORS · Intermedio · 90 min

Caso guía: endurecer headers HTTP y controlar orígenes.

#### Helmet y CORS

**Definición formal.** Helmet configura headers HTTP de seguridad. CORS (Cross-Origin Resource Sharing) define qué orígenes del navegador pueden leer respuestas de otro origen.

**Para qué sirve.** Reducir superficie de ataque en navegador y controlar exposición cross-origin.

**Cuándo usarlo / cuándo no.** Úsalo en APIs web. No uses `origin: *` con credenciales; no dependas solo de CORS como control de seguridad server-side.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm7-cors
cd nm7-cors
```

Crea el archivo `cors.mjs`:

```js
const allowed = new Set(['https://app.example.com']);
function corsHeader(origin) {
  if (allowed.has(origin)) return { 'access-control-allow-origin': origin };
  return {};
}
console.log(corsHeader('https://app.example.com')['access-control-allow-origin']);
console.log(corsHeader('https://evil.example.com')['access-control-allow-origin'] === undefined);
```

```bash
node cors.mjs
```

**Caso de uso real.** Helmet en Express y CORS allowlist por entorno.

**Error común.** Configurar CORS abierto por comodidad.

**Síntoma.** cualquier origen puede leer respuestas desde navegador. **Causa.** `*` o reflejar origen sin validación. **Corrección.** allowlist explícita, métodos/headers mínimos. **Señal observable.** preflight permite origen no esperado.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `https://app.example.com`, `true`. **Nota de verificación:** Helmet/CORS reales `npm i helmet cors`.

### Tema 4: Prevención de inyecciones NoSQL · Intermedio · 120 min

Caso guía: login MongoDB vulnerable por objetos en query.

#### Inyección NoSQL

**Definición formal.** Ocurre cuando input no confiable altera la estructura/semántica de una consulta NoSQL, por ejemplo enviando operadores como `$ne`.

**Para qué sirve.** Entender por qué validar tipo/forma del input es obligatorio.

**Cuándo usarlo / cuándo no.** Aplica siempre en queries con input externo. No pases `req.body` directo a filtros.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm7-nosql
cd nm7-nosql
```

Crea el archivo `nosql.mjs`:

```js
function safeLoginInput(body) {
  return typeof body.user === 'string' && typeof body.password === 'string';
}
console.log(safeLoginInput({ user: 'ada', password: 'secret' }));
console.log(safeLoginInput({ user: 'ada', password: { $ne: null } }));
```

```bash
node nosql.mjs
```

**Caso de uso real.** Validar con Zod/Joi antes de consultar Mongo.

**Error común.** Aceptar objetos donde se espera string.

**Síntoma.** bypass de autenticación o consultas inesperadas. **Causa.** falta de validación de tipo. **Corrección.** schema runtime, sanitizar operadores, least privilege DB. **Señal observable.** logs muestran query con `$ne/$gt` proveniente de input.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `false`.

### Tema 5: OWASP Top 10 · Intermedio · 120 min

Caso guía: checklist mínimo antes de exponer un servicio.

#### OWASP Top 10

**Definición formal.** OWASP Top 10 es una lista de categorías de riesgos de seguridad web ampliamente reconocida; sirve como base de priorización, no como checklist exhaustivo.

**Para qué sirve.** Priorizar controles comunes: control de acceso, mala configuración, componentes vulnerables, logging insuficiente, etc.

**Cuándo usarlo / cuándo no.** Úsalo como baseline de revisión. No lo trates como cumplimiento completo.

**Ejemplo mínimo enfocado (ejecutable: gate simple).**

```bash
mkdir -p nm7-owasp
cd nm7-owasp
```

Crea el archivo `gate.mjs`:

```js
const checks = { authz: true, inputValidation: true, secrets: false, logging: true };
const failed = Object.entries(checks).filter(([,ok]) => !ok).map(([k]) => k);
console.log(failed.length);
console.log(failed[0]);
```

```bash
node gate.mjs
```

**Caso de uso real.** Checklist de PR/release con evidencia.

**Error común.** Tratar seguridad como una pasada final.

**Síntoma.** hallazgos graves cerca de release. **Causa.** no integrar seguridad en desarrollo/CI. **Corrección.** threat modeling ligero, revisiones, SAST/dep scan, tests. **Señal observable.** issues recurrentes de misma categoría.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `1`, `secrets`.

### Tema 6: Secretos: AWS Secrets Manager, Vault, Azure Key Vault · Intermedio · 120 min

Caso guía: rotar credenciales de DB sin redeployar código.

#### Gestión de secretos

**Definición formal.** Un secret manager almacena, controla acceso, audita y rota secretos (passwords, API keys, certificados). AWS Secrets Manager, HashiCorp Vault y Azure Key Vault son opciones comunes.

**Para qué sirve.** Evitar secretos hardcodeados y facilitar rotación/auditoría.

**Cuándo usarlo / cuándo no.** Úsalo en todo entorno real. No guardes secretos en git, logs, ni en frontend. No uses el mismo secreto en todos los entornos.

**Ejemplo mínimo enfocado (ejecutable: contrato de lectura).**

```bash
mkdir -p nm7-secrets
cd nm7-secrets
```

Crea el archivo `secrets.mjs`:

```js
async function getSecret(name, provider) {
  if (!name) throw new Error('missing_name');
  return { name, provider, value: '***' };
}
console.log((await getSecret('db/password', 'vault')).provider);
try { await getSecret('', 'vault'); } catch (e) { console.log(e.message); }
```

```bash
node secrets.mjs
```

**Caso de uso real.** App obtiene credencial DB al arrancar o por renovación controlada; IAM/RBAC limita acceso.

**Error común.** Secretos en `.env` commiteado.

**Síntoma.** credenciales filtradas en repo/CI logs. **Causa.** mala gestión de secretos. **Corrección.** secret manager, `.env.example`, scanning, rotación. **Señal observable.** alertas de secret scanning o incidentes de acceso no autorizado.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `vault`, `missing_name`. **Nota de verificación:** integración real requiere credenciales/IAM y SDK/CLI del proveedor.

## Cierre

Seguridad Node es disciplina de defaults: validar input, verificar identidad, autorizar por recurso, endurecer headers, manejar secretos y monitorear. Ningún control aislado basta.

## Checklist

- Valido JWT firma y claims.
- Autentico y autorizo por separado.
- Aplico Helmet/CORS con allowlist.
- Valido tipos para prevenir NoSQL injection.
- Uso secret manager y no commiteo secretos.
