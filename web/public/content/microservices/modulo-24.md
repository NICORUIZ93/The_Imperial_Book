# Módulo 20 · Seguridad

**Fase 2 · Node.js de cero a experto** (una semana de 12). **Duración:** 12 h (6 temas de unos 100 min y 2 h de
laboratorio integrador). **Dificultad:** 4 de 5. **Dependencias:** Módulo 14 (Express, middleware, validación con
Zod), Módulo 15 (MongoDB) y Módulo 19 (timeouts y fallbacks, para fallar cerrado). **Herramientas:**Node.js 26.13.1
LTS**, **express 5.3.0**, **jsonwebtoken 9.0.3**, **passport 0.7.0** con **passport-local 1.0.0** y **passport-jwt
4.0.1**, **helmet 8.3.0**, **cors 2.8.6**, **zod 4.6.7**, **mongodb 7.9.1** (driver) con **MongoDB 9.0.8**,
**@aws-sdk/client-secrets-manager 3.1173.0**, **node-vault 0.13.0** con **Vault 2.2.0**, **@azure/keyvault-secrets
4.12.0** y **@azure/identity 4.14.1**; emuladores **Floci 2.2.0** (AWS) y **Floci-Az 0.14.0** (Azure).

versiones; los comandos de verificación indicados añade MongoDB y los tres gestores de secretos).

La seguridad de un microservicio no es una capa que se pone al final: es **cada decisión** sobre quién entra, qué ve,
qué acepta y dónde guarda sus llaves. En este módulo atacas a propósito seis APIs vulnerables y las arreglas: tokens
JWT que cualquiera puede falsificar, un login que delata qué usuarios existen, un CORS que entrega tus datos a
cualquier web, una consulta a MongoDB que se salta la contraseña, cinco categorías del **OWASP Top 10:2025** y una
clave de base de datos escrita en el código.

```mermaid
flowchart LR
    T1["1 · JWT con<br/>jsonwebtoken"] --> T2["2 · Passport.js"]
    T3["3 · Helmet, CORS"]
    T4["4 · Prevención de<br/>inyecciones NoSQL"]
    T2 --> T5["5 · OWASP Top 10"]
    T3 --> T5
    T4 --> T5
    T5 --> T6["6 · Secretos: AWS Secrets Manager,<br/>Vault, Azure Key Vault"]
```

**Texto alternativo:** mapa del módulo. El tema 1 (JWT con jsonwebtoken) lleva al tema 2 (Passport.js). Los temas 2,
3 (Helmet y CORS) y 4 (inyecciones NoSQL) desembocan en el tema 5 (OWASP Top 10), que los ordena dentro de un marco
común. El tema 5 lleva al tema 6 (secretos con AWS Secrets Manager, Vault y Azure Key Vault).

**Regla del módulo:** cada tema trae **Antes (vulnerable)** y **Después (seguro)** con el código de ambos, y un script
`ataque.js` que lanza el mismo ataque contra las dos versiones y enseña la diferencia con la salida real.

**Cómo usar el laboratorio.** Con Node 26:

```bash
npm ci
  # 34 tests + ataques de las 6 fichas (sin Docker) → «RESULTADO: OK»
los comandos de verificación indicados    # además MongoDB 9.0.8, Floci, Floci-Az y Vault 2.2.0 con Docker Compose
```

archivos `antes.js` son vulnerables **a propósito**: no copies nada de ellos.

`package.json` del laboratorio (con `package-lock.json` que fija el árbol completo; `npm audit --omit=dev` respondió
`found 0 vulnerabilities` el 2026-11-19):

```json
{
  "name": "modulo-20-seguridad-node",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 20 (Fase 2): Seguridad en Node.js (JWT, Passport.js, Helmet y CORS, inyección NoSQL, OWASP Top 10:2025 y gestores de secretos).",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f1*/*.test.js'",
    "test:integracion": "node --test --test-concurrency=1 'f1*/*.integracion.js'"
  },
  "dependencies": {
    "@aws-sdk/client-secrets-manager": "3.1173.0",
    "@azure/identity": "4.14.1",
    "@azure/keyvault-secrets": "4.12.0",
    "cors": "2.8.6",
    "express": "5.3.0",
    "helmet": "8.3.0",
    "jsonwebtoken": "9.0.3",
    "mongodb": "7.9.1",
    "node-vault": "0.13.0",
    "passport": "0.7.0",
    "passport-jwt": "4.0.1",
    "passport-local": "1.0.0",
    "zod": "4.6.7"
  }
}
```

`docker-compose.yml` (solo lo usan las fichas 4 y 6):

```yaml
# Módulo 20 (modulo-24) · Seguridad en Node.js: MongoDB para la inyección NoSQL y tres gestores de secretos locales.
#   docker compose up -d --wait
#   node f129-secretos/sembrar.js          -> guarda el secreto tienda/bd en los tres gestores
#   docker compose down
# Emuladores (mismas imágenes que el docker-compose.yml de la raíz del repositorio):
#   aws-local   Floci     -> AWS Secrets Manager en http://localhost:4566   (credenciales test/test, región us-east-1)
#   azure-local Floci-Az  -> Azure Key Vault en  http://localhost:4577/devstoreaccount1-keyvault
#   vault       HashiCorp Vault en modo dev (en memoria, sin TLS, token «root»): SOLO para aprender.
# Si ya tienes arriba el compose de la raíz (usa los mismos puertos 4566 y 4577), levanta solo: mongo vault
services:
  mongo:
    image: mongo:9.0.8
    ports: ["27017:27017"]
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 3s
      timeout: 3s
      retries: 30
  aws-local:
    image: floci/floci:2.2.0
    ports: ["${AWS_LOCAL_PORT:-4566}:4566"]
    environment:
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - AWS_DEFAULT_REGION=us-east-1
  azure-local:
    image: floci/floci-az:0.14.0
    ports: ["${AZURE_LOCAL_PORT:-4577}:4577"]
  vault:
    image: hashicorp/vault:2.2.0
    cap_add: ["IPC_LOCK"]
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=root
      - VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200
    ports: ["8200:8200"]
    healthcheck:
      test: ["CMD", "vault", "status", "-address=http://127.0.0.1:8200"]
      interval: 3s
      timeout: 3s
      retries: 30
```

---

### JWT con jsonwebtoken

#### 1. UBICACIÓN

Módulo 20, Lección 1 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Cabeceras HTTP (`Authorization`) y códigos 401/403 (Módulo 0.4).
- JSON y Base64 (Módulo 0.4).
- Middleware de Express (Módulo 14).

#### 3. OBJETIVO DE APRENDIZAJE

**Emitir y verificar** tokens JWT con jsonwebtoken usando firma asimétrica (ES256), **restringir** algoritmo, emisor,
audiencia y caducidad, y **demostrar** que un token falsificado con `alg: none` o con el payload manipulado se rechaza.
Lo compruebas cuando `node --test f124-jwt/tokens.test.js` pasa 7 de 7.

#### 4. ANALOGÍA VISUAL

Dibuja una **pulsera de un festival** con tres partes: una **etiqueta** que dice qué tipo de pulsera es (la cabecera),
un **texto impreso** con tu nombre, tu zona («VIP» o «general») y la fecha de caducidad (el payload), y un **holograma**
que solo la organización puede fabricar (la firma). Cualquiera puede **leer** el texto: no es secreto. Lo que no puede
hacer nadie es **cambiar** «general» por «VIP» sin que el holograma deje de coincidir. Ahora dibuja dos guardias en la
puerta VIP: uno **solo lee** el texto (deja pasar a cualquiera que escriba VIP con un rotulador); el otro pasa la
pulsera por una **lámpara** que comprueba el holograma (verifica la firma). El primer guardia es `jwt.decode`; el
segundo, `jwt.verify`.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant U as cliente
    participant A as servicio de login<br/>(clave PRIVADA)
    participant P as servicio de pedidos<br/>(clave PÚBLICA)
    U->>A: POST /login {usuario, clave}
    A-->>U: token = cabecera.payload.firma (ES256, exp 15 min)
    U->>P: GET /admin/ventas<br/>Authorization: Bearer token
    Note over P: jwt.verify: firma con la clave pública del kid,<br/>algorithms [ES256], iss, aud, exp
    P-->>U: 200 si todo cuadra y el rol lo permite<br/>401 si el token no es válido · 403 si no tiene permiso
    A->>P: GET /.well-known/jwks.json (claves públicas)
```

**Texto alternativo:** diagrama de secuencia. El cliente envía usuario y clave al servicio de login, que tiene la clave
privada y devuelve un token de tres partes firmado con ES256 que caduca en 15 minutos. El cliente llama al servicio de
pedidos con la cabecera Authorization: Bearer y el token. Pedidos, que solo tiene la clave pública, verifica la firma
según el kid, la lista de algoritmos permitidos, el emisor, la audiencia y la caducidad, y responde 200 si todo cuadra y
el rol lo permite, 401 si el token no es válido y 403 si no tiene permiso. Las claves públicas se publican en
/.well-known/jwks.json.

#### 6. EXPLICACIÓN NIVEL 0

- Cuando inicias sesión, el servidor te da un **token**: un texto largo que demuestra quién eres. En cada petición lo
  envías y así no tienes que mandar tu contraseña cada vez.
- Un **JWT** (JSON Web Token) son tres trozos separados por puntos: qué tipo de token es, **tus datos** (quién eres,
  tu rol, cuándo caduca) y una **firma**.
- Los datos **se pueden leer** sin ninguna clave. La firma sirve para que **nadie pueda cambiarlos**: si alguien cambia
  «cliente» por «admin», la firma deja de coincidir.
- Por eso el servidor siempre debe **comprobar la firma**. Leer el token sin comprobarla es como creerse una pulsera
  pintada a mano.

#### 7. EXPLICACIÓN INTERMEDIA

- **Formato:** `base64url(cabecera).base64url(payload).base64url(firma)`. Cabecera: `alg` (algoritmo), `typ`, `kid`
  (qué clave firmó). Payload, con *claims* registrados: `sub` (sujeto), `iss` (emisor), `aud` (audiencia), `exp`
  (caducidad), `iat` (emitido), `jti` (id único).
- **`jwt.sign(payload, clave, opciones)`**: `algorithm`, `expiresIn`, `subject`, `issuer`, `audience`, `keyid`,
  `jwtid`. **`jwt.verify(token, clave, opciones)`**: comprueba firma y caducidad y, si se lo pides, `algorithms`,
  `issuer` y `audience`; lanza `JsonWebTokenError` o `TokenExpiredError`. **`jwt.decode`** solo decodifica: **nunca**
  lo uses para autorizar.
- **Simétrico (HS256)**: la misma clave firma y verifica; todo el que verifica puede emitir. **Asimétrico (RS256,
  ES256, EdDSA)**: firma la privada, verifica la pública; los demás servicios pueden verificar sin poder emitir.
  ES256 (curva P-256) da firmas cortas y es rápido.
- **`algorithms: ['ES256']`** es una lista blanca. Sin ella, un atacante podría elegir el algoritmo en la cabecera
  (`none`, o HS256 usando tu clave pública como «secreto»: la confusión de algoritmos). jsonwebtoken 9 ya rechaza esos
  casos con una clave asimétrica, pero la lista blanca lo deja explícito y no depende de la librería.
- **JWKS:** el emisor publica sus claves públicas en `/.well-known/jwks.json`; el `kid` del token dice cuál usar, lo
  que permite **rotar** claves sin cortar el servicio.
- **401 vs 403:** 401 = no sé quién eres (o el token no vale), con `WWW-Authenticate: Bearer`; 403 = sé quién eres y no
  puedes.

#### 8. EXPLICACIÓN MAESTRA

- **JWT vs sesión con identificador opaco.** *JWT:* cada servicio lo verifica solo, sin consultar a nadie (ideal entre
  microservicios); pero **no se puede revocar** antes de que caduque salvo con una lista de revocación (por `jti`), que
  devuelve el estado que querías evitar. *Sesión opaca* (un id aleatorio guardado en Redis): revocación inmediata y
  token pequeño, a cambio de una consulta en cada petición. *Introspección OAuth2* (RFC 7662): el servicio pregunta al
  servidor de autorización. Patrón habitual: token de acceso JWT **corto** (5–15 min) + *refresh token* opaco y
  revocable.
- **jsonwebtoken vs jose.** *jsonwebtoken*: la más usada, API de callbacks y claves `KeyObject`/PEM, solo Node. *jose*:
  sin dependencias, funciona en Node, navegador y edge, soporta JWE (tokens cifrados) y trae `createRemoteJWKSet` para
  descargar y cachear un JWKS. Para servicios que validan tokens de un proveedor externo (Keycloak, Entra ID, Cognito)
  `jose` ahorra código.
- **Dónde guardar el token en el navegador.** `localStorage` lo expone a cualquier XSS; una cookie `HttpOnly; Secure;
  SameSite` no la lee JavaScript, pero necesita protección CSRF. Entre servicios, cabecera `Authorization`.
- **Qué no poner en el payload:** datos personales o sensibles (está en Base64, no cifrado) ni permisos que cambian a
  menudo (quedan congelados hasta que caduca).
- **Cuándo NO usar JWT propio:** si ya tienes un proveedor de identidad (Keycloak, Módulo 9), deja que él emita y tú
  solo verifica; escribir tu propio servidor de login es reinventar OAuth2 con menos pruebas.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **jsonwebtoken 9.0.3** y **express 5.3.0**.

**Antes (vulnerable)** — `f124-jwt/antes.js`:

```javascript
// Módulo 20 · F124 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Fallos: (1) usa jwt.decode(), que NO comprueba la firma; (2) secreto débil y dentro del código;
// (3) tokens sin caducidad. Ejecuta: node f124-jwt/antes.js   (:3124)
import express from 'express';
import jwt from 'jsonwebtoken';

const SECRETO = 'secreto'; // (2) adivinable con un diccionario y visible en el repositorio
const USUARIOS = { ana: { id: 'u1', clave: 'ana123', rol: 'cliente' } };

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.post('/login', (req, res) => {
    const usuario = USUARIOS[req.body.usuario];
    if (!usuario || usuario.clave !== req.body.clave) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ token: jwt.sign({ sub: usuario.id, rol: usuario.rol }, SECRETO) }); // (3) sin expiresIn: vale para siempre
  });

  app.get('/admin/ventas', (req, res) => {
    const token = (req.get('authorization') ?? '').replace('Bearer ', '');
    const payload = jwt.decode(token); // (1) decode solo LEE el token: cualquiera puede fabricar uno
    if (payload?.rol !== 'admin') return res.status(403).json({ error: 'solo administradores' });
    res.json({ ventasDelMes: 184_500_000 });
  });
  return app;
}

if (import.meta.main) crearApp().listen(3124, () => console.log('ANTES (vulnerable) en :3124'));
```

**Después (seguro)** — `f124-jwt/tokens.js` (emitir, verificar y el middleware):

```javascript
// Módulo 20 · F124 · JWT con jsonwebtoken: emitir y verificar tokens firmados con clave asimétrica (ES256).
// Requisitos: Node.js 26.13.1 LTS y jsonwebtoken 9.0.3 (package.json del laboratorio).
import jwt from 'jsonwebtoken';
import { generateKeyPairSync, randomUUID } from 'node:crypto';

export const EMISOR = 'https://auth.tienda.example';
export const AUDIENCIA = 'api-pedidos';

/** Par de claves EC P-256. En producción la privada vive en un gestor de secretos (ficha «Secretos»), no en el código. */
export function generarClaves(kid = `clave-${new Date().toISOString().slice(0, 10)}`) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  return { kid, privateKey, publicKey };
}

/** Emite un token de acceso CORTO (15 min por defecto). Solo datos no sensibles: el payload se puede leer. */
export function emitir(claves, usuario, { expiraEn = '15m' } = {}) {
  return jwt.sign({ rol: usuario.rol }, claves.privateKey, {
    algorithm: 'ES256',   // firma asimétrica: quien verifica no puede emitir
    keyid: claves.kid,    // cabecera kid: permite rotar claves
    subject: usuario.id,  // sub
    issuer: EMISOR,       // iss
    audience: AUDIENCIA,  // aud
    expiresIn: expiraEn,  // exp
    jwtid: randomUUID(),  // jti: identificador único (para revocar)
  });
}

/**
 * Verifica firma, algoritmo, emisor, audiencia y caducidad. `clavesPublicas` es un Map kid -> clave pública.
 * Lanza JsonWebTokenError / TokenExpiredError si algo no cuadra.
 */
export function verificar(token, clavesPublicas) {
  const elegirClave = (cabecera, listo) => {
    const clave = clavesPublicas.get(cabecera.kid);
    listo(clave ? null : new jwt.JsonWebTokenError(`kid desconocido: ${cabecera.kid}`), clave);
  };
  return new Promise((ok, falla) => {
    jwt.verify(token, elegirClave, {
      algorithms: ['ES256'], // lista blanca: nunca aceptes «el algoritmo que diga el token»
      issuer: EMISOR,
      audience: AUDIENCIA,
      clockTolerance: 5,     // segundos de margen por relojes desajustados
    }, (error, payload) => (error ? falla(error) : ok(payload)));
  });
}

/** Middleware Express: exige `Authorization: Bearer <token>` válido y deja el payload en req.usuario. */
export function autenticar(clavesPublicas) {
  return async (req, res, next) => {
    const [esquema, token] = (req.get('authorization') ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
      return res.status(401).set('WWW-Authenticate', 'Bearer').json({ error: 'falta el token' });
    }
    try {
      req.usuario = await verificar(token, clavesPublicas);
      next();
    } catch (error) {
      const motivo = error.name === 'TokenExpiredError' ? 'token caducado' : 'token inválido';
      res.status(401).set('WWW-Authenticate', `Bearer error="invalid_token", error_description="${motivo}"`).json({ error: motivo });
    }
  };
}
```

`f124-jwt/despues.js` (la API con login, JWKS y rutas protegidas):

```javascript
// Módulo 20 · F124 · DESPUÉS (seguro): jwt.verify con lista blanca de algoritmos, ES256, caducidad de 15 min,
// emisor y audiencia comprobados, y la clave pública publicada como JWKS para otros servicios.
// Requisitos: Node.js 26.13.1 LTS, jsonwebtoken 9.0.3 y express 5.3.0. Ejecuta: node f124-jwt/despues.js   (:3224)
import express from 'express';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { autenticar, emitir, generarClaves } from './tokens.js';

const hash = (clave, sal) => scryptSync(clave, sal, 32);
const USUARIOS = { ana: { id: 'u1', rol: 'cliente', sal: 'sal-de-ana', hash: hash('ana123', 'sal-de-ana') } };

export function crearApp(claves = generarClaves()) {
  const clavesPublicas = new Map([[claves.kid, claves.publicKey]]);
  const app = express();
  app.use(express.json());

  app.post('/login', (req, res) => {
    const usuario = USUARIOS[req.body?.usuario];
    const valido = usuario && typeof req.body.clave === 'string' && timingSafeEqual(hash(req.body.clave, usuario.sal), usuario.hash);
    if (!valido) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ token: emitir(claves, usuario), tipo: 'Bearer', expiraEn: 900 });
  });

  // Otros microservicios verifican con la clave PÚBLICA: la descargan de aquí y no pueden emitir tokens.
  app.get('/.well-known/jwks.json', (_req, res) => {
    res.json({ keys: [...clavesPublicas].map(([kid, clave]) => ({ ...clave.export({ format: 'jwk' }), kid, use: 'sig', alg: 'ES256' })) });
  });

  app.get('/admin/ventas', autenticar(clavesPublicas), (req, res) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'solo administradores' });
    res.json({ ventasDelMes: 184_500_000 });
  });
  app.get('/mi-perfil', autenticar(clavesPublicas), (req, res) => res.json({ id: req.usuario.sub, rol: req.usuario.rol }));
  return app;
}

if (import.meta.main) crearApp().listen(3224, () => console.log('DESPUÉS (seguro) en :3224'));
```

#### 10. MINI-LABORATORIO

1. Lanza el ataque contra las dos versiones. `f124-jwt/ataque.js` fabrica un token con `alg: none` y rol admin sin
   conocer ninguna clave, prueba un diccionario de secretos y mira la caducidad:

```javascript
// Módulo 20 · F124 · El ataque: un cliente normal se fabrica un token de administrador sin conocer ninguna clave.
// Arranca las dos versiones en puertos libres y les envía lo mismo. Ejecuta: node f124-jwt/ataque.js
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const b64 = (objeto) => Buffer.from(JSON.stringify(objeto)).toString('base64url');
// Token «a mano»: cabecera con alg none, payload con rol admin y firma vacía.
const falsificado = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'u1', rol: 'admin' })}.`;
// Segundo intento: firmado con el secreto débil, que sale de un diccionario en segundos.
const DICCIONARIO = ['123456', 'password', 'admin', 'secreto', 'qwerty'];

async function atacar(nombre, crearApp) {
  const servidor = crearApp().listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const pedir = (token) => fetch(`${base}/admin/ventas`, { headers: { authorization: `Bearer ${token}` } }).then(async (r) => `${r.status} ${JSON.stringify(await r.json())}`);
  const login = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ usuario: 'ana', clave: 'ana123' }) }).then((r) => r.json());
  console.log(`== ${nombre}`);
  console.log(`   token legítimo de Ana (rol cliente)  -> ${await pedir(login.token)}`);
  console.log(`   token falsificado (alg none, admin)  -> ${await pedir(falsificado)}`);
  const secreto = DICCIONARIO.find((palabra) => { try { jwt.verify(login.token, palabra); return true; } catch { return false; } });
  console.log(`   secreto por diccionario              -> ${secreto ? `encontrado: "${secreto}"` : 'no aplica: el token está firmado con ES256 (no hay secreto compartido)'}`);
  const { exp } = jwt.decode(login.token);
  console.log(`   caducidad del token                  -> ${exp ? `${exp - jwt.decode(login.token).iat} s` : 'ninguna: vale para siempre'}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes);
await atacar('DESPUÉS (seguro)', crearDespues);
```

```bash
node f124-jwt/ataque.js
```

   **Output esperado:**

```text
== ANTES (vulnerable)
   token legítimo de Ana (rol cliente)  -> 403 {"error":"solo administradores"}
   token falsificado (alg none, admin)  -> 200 {"ventasDelMes":184500000}
   secreto por diccionario              -> encontrado: "secreto"
   caducidad del token                  -> ninguna: vale para siempre
== DESPUÉS (seguro)
   token legítimo de Ana (rol cliente)  -> 403 {"error":"solo administradores"}
   token falsificado (alg none, admin)  -> 401 {"error":"token inválido"}
   secreto por diccionario              -> no aplica: el token está firmado con ES256 (no hay secreto compartido)
   caducidad del token                  -> 900 s
```

2. Mira un token por dentro. Arranca `node f124-jwt/despues.js` y, en otra terminal:

```bash
TOKEN=$(curl -s -X POST localhost:3224/login -H 'content-type: application/json' -d '{"usuario":"ana","clave":"ana123"}' | jq -r .token)
node -p "process.argv[1].split('.').slice(0, 2).map((p) => Buffer.from(p, 'base64url').toString()).join('\n')" "$TOKEN"
curl -s -w ' [%{http_code}]\n' localhost:3224/mi-perfil -H "authorization: Bearer $TOKEN"
curl -s -w ' [%{http_code}]\n' localhost:3224/mi-perfil -H "authorization: Bearer ${TOKEN}x"
curl -s -w ' [%{http_code}]\n' localhost:3224/admin/ventas -H "authorization: Bearer $TOKEN"
curl -s localhost:3224/.well-known/jwks.json | jq -c '.keys[0] | {kty, crv, kid, use, alg}'
```

   **Output esperado** (`kid`, `iat`, `exp` y `jti` cambian):

```text
{"alg":"ES256","typ":"JWT","kid":"clave-2026-11-20"}
{"rol":"cliente","iat":1795148263,"exp":1795149163,"aud":"api-pedidos","iss":"https://auth.tienda.example","sub":"u1","jti":"8a89b061-ac8e-473a-9f29-8fc2bd001ebd"}
{"id":"u1","rol":"cliente"} [200]
{"error":"token inválido"} [401]
{"error":"solo administradores"} [403]
{"kty":"EC","crv":"P-256","kid":"clave-2026-11-20","use":"sig","alg":"ES256"}
```

   **Captura comentada:** las dos primeras líneas son la cabecera y el payload **en claro**: cualquiera los lee. Añadir
   una sola letra al token (`${TOKEN}x`) rompe la firma y da 401. Ana tiene un token válido, pero es cliente: 403 en la
   ruta de administración. El JWKS publica la clave pública (`kty`, `crv`, `x`, `y`) y nunca la privada (`d`).

#### 11. VERIFICACIÓN

Test que debes ejecutar:

```javascript
// Módulo 20 · F124 · Tests de emisión y verificación de JWT. Ejecuta: node --test f124-jwt/tokens.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import { AUDIENCIA, EMISOR, emitir, generarClaves, verificar } from './tokens.js';
import { crearApp } from './despues.js';

const claves = generarClaves('k1');
const publicas = new Map([['k1', claves.publicKey]]);
const ana = { id: 'u1', rol: 'cliente' };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

test('un token recién emitido se verifica y trae sub, rol, iss, aud, exp y jti', async () => {
  const payload = await verificar(emitir(claves, ana), publicas);
  assert.equal(payload.sub, 'u1');
  assert.equal(payload.rol, 'cliente');
  assert.equal(payload.iss, EMISOR);
  assert.equal(payload.aud, AUDIENCIA);
  assert.equal(payload.exp - payload.iat, 900);
  assert.match(payload.jti, /^[0-9a-f-]{36}$/);
});

test('rechaza un token con alg none', async () => {
  const falso = `${b64({ alg: 'none', typ: 'JWT', kid: 'k1' })}.${b64({ sub: 'u1', rol: 'admin', iss: EMISOR, aud: AUDIENCIA })}.`;
  await assert.rejects(verificar(falso, publicas), { name: 'JsonWebTokenError' });
});

test('rechaza un payload manipulado (la firma ya no coincide)', async () => {
  const [cabecera, , firma] = emitir(claves, ana).split('.');
  const manipulado = `${cabecera}.${b64({ sub: 'u1', rol: 'admin', iss: EMISOR, aud: AUDIENCIA, exp: 9999999999 })}.${firma}`;
  await assert.rejects(verificar(manipulado, publicas), { name: 'JsonWebTokenError', message: 'invalid signature' });
});

test('rechaza un token caducado', async () => {
  await assert.rejects(verificar(emitir(claves, ana, { expiraEn: -10 }), publicas), { name: 'TokenExpiredError' });
});

test('rechaza un token firmado con HS256 usando la clave pública como secreto (confusión de algoritmos)', async () => {
  const pem = claves.publicKey.export({ type: 'spki', format: 'pem' });
  const confuso = jwt.sign({ sub: 'u1', rol: 'admin' }, pem, { algorithm: 'HS256', keyid: 'k1', issuer: EMISOR, audience: AUDIENCIA });
  await assert.rejects(verificar(confuso, publicas), { name: 'JsonWebTokenError', message: 'invalid algorithm' });
});

test('rechaza otra audiencia, otro emisor y un kid desconocido', async () => {
  const firmar = (opciones) => jwt.sign({ rol: 'cliente' }, claves.privateKey, { algorithm: 'ES256', keyid: 'k1', issuer: EMISOR, audience: AUDIENCIA, ...opciones });
  await assert.rejects(verificar(firmar({ audience: 'api-pagos' }), publicas), /jwt audience invalid/);
  await assert.rejects(verificar(firmar({ issuer: 'https://otro.example' }), publicas), /jwt issuer invalid/);
  await assert.rejects(verificar(firmar({ keyid: 'k9' }), publicas), /kid desconocido: k9/);
});

test('API: sin token 401, cliente en ruta de admin 403, y el JWKS publica solo la parte pública', async () => {
  const servidor = crearApp(claves).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const sinToken = await fetch(`${base}/admin/ventas`);
  assert.equal(sinToken.status, 401);
  assert.equal(sinToken.headers.get('www-authenticate'), 'Bearer');
  const { token } = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"usuario":"ana","clave":"ana123"}' }).then((r) => r.json());
  assert.equal((await fetch(`${base}/admin/ventas`, { headers: { authorization: `Bearer ${token}` } })).status, 403);
  assert.deepEqual(await fetch(`${base}/mi-perfil`, { headers: { authorization: `Bearer ${token}` } }).then((r) => r.json()), { id: 'u1', rol: 'cliente' });
  const jwks = await fetch(`${base}/.well-known/jwks.json`).then((r) => r.json());
  assert.deepEqual(Object.keys(jwks.keys[0]).sort(), ['alg', 'crv', 'kid', 'kty', 'use', 'x', 'y']); // sin «d» (la privada)
  servidor.close();
});
```

```bash
node --test f124-jwt/tokens.test.js
```

Resultado esperado:

```text
✔ un token recién emitido se verifica y trae sub, rol, iss, aud, exp y jti
✔ rechaza un token con alg none
✔ rechaza un payload manipulado (la firma ya no coincide)
✔ rechaza un token caducado
✔ rechaza un token firmado con HS256 usando la clave pública como secreto (confusión de algoritmos)
✔ rechaza otra audiencia, otro emisor y un kid desconocido
✔ API: sin token 401, cliente en ruta de admin 403, y el JWKS publica solo la parte pública
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

**Pregunta de comprobación:** ¿por qué el servicio de pedidos solo necesita la clave **pública**? *(Porque verificar
una firma ES256 solo requiere la pública; así un servicio comprometido puede leer tokens, pero no fabricarlos.)*

#### 12. ERROR COMÚN

**Síntoma:** en una auditoría aparece el correo y la tarjeta de los clientes en los logs del gateway, aunque «los
tokens están firmados». **Causa:** se cree que firmar es cifrar y se meten datos sensibles en el payload.
`f124-jwt/error-comun.js`:

```javascript
// Módulo 20 · F124 · ERROR COMÚN: creer que el payload de un JWT está cifrado. Está FIRMADO, no cifrado:
// cualquiera que tenga el token lee su contenido con un decodificador base64.
// Ejecuta: node f124-jwt/error-comun.js
import jwt from 'jsonwebtoken';
import { generarClaves } from './tokens.js';

const { privateKey } = generarClaves();
console.log('== MAL: datos sensibles dentro del token');
const token = jwt.sign({ sub: 'u1', email: 'ana@correo.co', tarjeta: '4111 1111 1111 1111' }, privateKey, { algorithm: 'ES256', expiresIn: '15m' });
const [, payload] = token.split('.');
console.log(`   segunda parte del token: ${payload.slice(0, 40)}…`);
console.log(`   decodificada sin ninguna clave: ${Buffer.from(payload, 'base64url').toString()}`);
console.log('== BIEN: solo identificadores; el resto se consulta en el servidor con el sub');
const minimo = jwt.sign({ rol: 'cliente' }, privateKey, { algorithm: 'ES256', expiresIn: '15m', subject: 'u1', noTimestamp: true });
console.log(`   decodificada: ${Buffer.from(minimo.split('.')[1], 'base64url').toString().replace(/"exp":\d+/, '"exp":<epoch>')}`);
```

Salida real de `node f124-jwt/error-comun.js`:

```text
== MAL: datos sensibles dentro del token
   segunda parte del token: eyJzdWIiOiJ1MSIsImVtYWlsIjoiYW5hQGNvcnJl…
   decodificada sin ninguna clave: {"sub":"u1","email":"ana@correo.co","tarjeta":"4111 1111 1111 1111","iat":1795147884,"exp":1795148784}
== BIEN: solo identificadores; el resto se consulta en el servidor con el sub
   decodificada: {"rol":"cliente","exp":<epoch>,"sub":"u1"}
```

**Diagnóstico visual:** pega cualquier token de tu sistema en un decodificador local (`node -p` como en el paso 2) y
lee el payload: si ves algo que no publicarías, está expuesto en cada log, proxy e historial de navegador por el que
pase. **Arreglo:** en el token, solo identificadores (`sub`) y datos poco sensibles y estables (`rol`); el resto lo
consulta el servidor. Si de verdad necesitas confidencialidad, JWE (token cifrado) con `jose`.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué compruebas al validar un JWT y qué ataques evitas con cada comprobación?**

**Respuesta modelo:** primero, que lo verifico de verdad con `jwt.verify` y nunca autorizo con `decode`. La **firma**
evita que alguien cambie el payload. La **lista blanca de algoritmos** evita `alg: none` y la confusión entre HS256 y
RS256/ES256, en la que el atacante firma con mi clave pública como si fuera un secreto. La **caducidad** (`exp`, con un
pequeño margen de reloj) limita el daño de un token robado; uso tokens de acceso de 5 a 15 minutos y un refresh token
revocable. El **emisor** (`iss`) evita aceptar tokens de otro proveedor y la **audiencia** (`aud`) evita que un token
emitido para el servicio de pagos me sirva en pedidos. El **`kid`** lo resuelvo contra mi JWKS de confianza, no contra
una URL que venga en el token. Entre microservicios prefiero firma asimétrica: solo el emisor tiene la privada, los
demás verifican con la pública y no pueden emitir. Y no pongo datos sensibles en el payload, porque está codificado,
no cifrado.

#### 14. ANTI-PATRÓN RELACIONADO

**El mismo secreto HS256 compartido por todos los microservicios.** Evita repartir un secreto simétrico a los diez
servicios que verifican tokens: cualquiera de ellos, si lo comprometen, puede **emitir** tokens de administrador para
todos los demás, y rotarlo exige desplegar los diez a la vez.

```javascript
// MAL: los 10 servicios tienen JWT_SECRETO; el de recomendaciones (el menos cuidado) puede fabricar un admin.
const token = jwt.sign({ sub: 'u2', rol: 'admin' }, process.env.JWT_SECRETO);

// BIEN: solo el emisor tiene la privada; los demás verifican con la pública del JWKS (tokens.js y despues.js).
const payload = await verificar(token, clavesPublicasDelJwks);
```

En un diagrama se ve como una única llave dibujada dentro de cada caja de servicio, frente a un candado (pública) en
cada caja y una sola llave (privada) en el emisor.

---

### Passport.js

#### 1. UBICACIÓN

Módulo 20, Lección 2 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- JWT con jsonwebtoken (ficha 1 de este módulo).
- Middleware de Express y su orden (Módulo 14).
- Qué es un hash y por qué una contraseña no se guarda en claro (Módulo 9 en la Fase 1; aquí se explica lo necesario).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** Passport.js con una estrategia local (usuario y clave con scrypt) y una estrategia JWT sin sesiones,
**separar** autenticación (quién eres) de autorización (qué puedes) y **comprobar** que un login no permite enumerar
usuarios. Lo compruebas cuando `node --test f125-passport/passport.test.js` pasa 7 de 7.

#### 4. ANALOGÍA VISUAL

Dibuja la **recepción de un edificio de oficinas** con un mostrador lleno de **enchufes intercambiables**: uno para
**tarjeta de empleado**, otro para **huella**, otro para **código QR de visita**. Cada enchufe es una **estrategia** y
el recepcionista (Passport) no sabe ni le importa cómo funciona cada uno: conecta el que toca y recibe un «sí, es
Fulano» o un «no». Ya dentro, en la puerta de la sala de servidores, hay **otro** control distinto: una lista de quién
puede entrar ahí (autorización). Dibuja también qué **no** hace la recepción: no dice «ese nombre no existe» o «la
clave está mal» por separado; siempre responde lo mismo, «no puedo dejarte pasar».

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    L["POST /login<br/>{usuario, clave}"] --> SL["passport.authenticate('local',<br/>{session: false})"]
    SL --> V1{"scrypt(clave, sal)<br/>timingSafeEqual"}
    V1 -- "no / no existe" --> R401["401 (mismo texto)"]
    V1 -- "sí" --> TOK["jwt.sign(sub, 15 min)"]
    P["GET /mis-pedidos<br/>Bearer token"] --> SJ["passport.authenticate('jwt',<br/>{session: false})"]
    SJ --> V2{"firma, alg, iss, exp<br/>+ usuario existe"}
    V2 -- "no" --> R401b["401"]
    V2 -- "sí: req.user {id, rol}" --> RG{"soloRol('admin')"}
    RG -- "no" --> R403["403"]
    RG -- "sí" --> H["handler"]
```

**Texto alternativo:** dos flujos. El login pasa por la estrategia local de Passport sin sesión, que calcula scrypt con
la sal del usuario y compara en tiempo constante: si no coincide o el usuario no existe responde 401 con el mismo
texto; si coincide emite un JWT de 15 minutos. Una petición protegida con token Bearer pasa por la estrategia jwt sin
sesión, que comprueba firma, algoritmo, emisor, caducidad y que el usuario exista: si falla, 401; si no, deja en
req.user el id y el rol, y el guard soloRol('admin') decide entre 403 y el handler.

#### 6. EXPLICACIÓN NIVEL 0

- **Autenticar** es comprobar **quién eres** (usuario y contraseña, un token, un certificado). **Autorizar** es
  decidir **qué puedes hacer**. Son dos pasos distintos y los dos son necesarios.
- **Passport.js** es una librería para Express que organiza la autenticación en **estrategias** intercambiables: una
  para usuario y contraseña, otra para tokens JWT, otra para «iniciar sesión con Google»… hay cientos.
- Las contraseñas **nunca** se guardan tal cual: se guarda un **hash**, un resumen que no se puede deshacer, calculado
  con un algoritmo lento a propósito para que adivinarlas sea carísimo.
- Y el login no debe dar pistas: si dice «ese usuario no existe», un atacante ya sabe a quién atacar.

#### 7. EXPLICACIÓN INTERMEDIA

- **Registrar estrategias:** `autenticador.use(new EstrategiaLocal(opciones, verificar))`. La función `verificar`
  llama a `listo(null, usuario)` si es válido, `listo(null, false)` si no y `listo(error)` si algo falló.
- **Usarlas:** `autenticador.authenticate('local', { session: false })` es un middleware; si la estrategia acepta,
  deja el usuario en `req.user` y sigue; si no, responde **401 `Unauthorized`** (texto plano) por su cuenta.
- **`passport-local`** lee por defecto `username` y `password` del cuerpo; con `usernameField`/`passwordField` cambias
  los nombres. Necesita `express.json()` antes.
- **`passport-jwt`**: `jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()`, `secretOrKey` (o
  `secretOrKeyProvider` para JWKS), `algorithms`, `issuer`, `audience`. Usa jsonwebtoken por dentro.
- **Sin sesiones.** Passport nació para webs con `express-session`; en una API con tokens pasa `{ session: false }`
  siempre. Instancia propia (`new passport.Passport()`) en vez del singleton global para no compartir estado.
- **Hash de contraseñas en Node sin dependencias:** `crypto.scryptSync(clave, sal, 32)` con una sal aleatoria por
  usuario y `crypto.timingSafeEqual` para comparar en tiempo constante. Si el usuario no existe, se calcula igual con
  una sal falsa: así el tiempo de respuesta tampoco delata nada.
- **Autorización:** un middleware después de la autenticación (`soloRol('admin')`) que mira `req.user.rol`, leído
  del **servidor**, no del token ni de una cabecera.

#### 8. EXPLICACIÓN MAESTRA

- **Passport vs alternativas.** *Passport:* enorme catálogo de estrategias (OAuth2, OIDC, SAML, LDAP) con la misma
  interfaz, pero API de callbacks, mantenimiento lento (0.7.0 es de 2023) y pensado para sesiones. *Middleware propio
  con jose/jsonwebtoken:* 20 líneas, sin magia, ideal si solo validas JWT (ficha 1). *`@nestjs/passport`:* Passport
  envuelto en guards de NestJS. *Proveedor gestionado* (Keycloak, Auth0, Cognito, Entra ID): no tocas contraseñas;
  tu servicio solo valida tokens. En microservicios, lo habitual es que **un** servicio (o el proveedor) haga el login
  y el resto solo verifique JWT.
- **scrypt vs bcrypt vs argon2.** *bcrypt*: veterano, limitado a 72 bytes de contraseña, necesita módulo nativo.
  *scrypt*: en `node:crypto`, resistente a GPU por memoria. *argon2id*: lo que recomienda OWASP en primer lugar, pero
  necesita un paquete nativo. Para un curso sin dependencias nativas, scrypt; en producción, argon2id si tu plataforma
  lo compila sin problemas.
- **Enumeración de usuarios.** No solo el mensaje: también el **tiempo** (si el usuario no existe y respondes sin
  calcular el hash, eres más rápido) y otros endpoints («recuperar contraseña», «registro: ese correo ya existe»).
- **Fuerza bruta.** Passport no limita intentos; combina con un rate limit por usuario e IP en Redis (Módulo 19, ficha
  3) que **falle cerrado**.
- **Cuándo NO usar Passport:** si tu servicio solo recibe JWT de un proveedor externo (un middleware con `jose` es más
  simple y moderno) o si usas NestJS y prefieres sus guards nativos.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **passport 0.7.0**, **passport-local 1.0.0**, **passport-jwt 4.0.1**,
**jsonwebtoken 9.0.3** y **express 5.3.0**.

**Antes (vulnerable)** — `f125-passport/antes.js`:

```javascript
// Módulo 20 · F125 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Fallos: (1) claves en texto plano comparadas con ===; (2) mensajes distintos que revelan qué usuarios existen;
// (3) la «sesión» es una cabecera x-usuario que escribe el propio cliente; (4) /admin no comprueba el rol.
// Ejecuta: node f125-passport/antes.js   (:3125)
import express from 'express';

const USUARIOS = { ana: { clave: 'ana123', rol: 'cliente' }, root: { clave: 'S3gura!2026', rol: 'admin' } };

export function crearApp() {
  const app = express();
  app.use(express.json());

  app.post('/login', (req, res) => {
    const usuario = USUARIOS[req.body.usuario];
    if (!usuario) return res.status(404).json({ error: 'el usuario no existe' });       // (2)
    if (usuario.clave !== req.body.clave) return res.status(401).json({ error: 'clave incorrecta' }); // (1) (2)
    res.json({ mensaje: 'bienvenido', usa: `x-usuario: ${req.body.usuario}` });           // (3)
  });

  const identificado = (req, res, next) => {
    req.usuario = USUARIOS[req.get('x-usuario')];                                         // (3) confía en el cliente
    if (!req.usuario) return res.status(401).json({ error: 'identifícate' });
    next();
  };
  app.get('/mis-pedidos', identificado, (req, res) => res.json({ pedidos: [1, 2] }));
  app.delete('/admin/usuarios/:id', identificado, (req, res) => res.json({ borrado: req.params.id })); // (4)
  return app;
}

if (import.meta.main) crearApp().listen(3125, () => console.log('ANTES (vulnerable) en :3125'));
```

**Después (seguro)** — `f125-passport/despues.js`:

```javascript
// Módulo 20 · F125 · DESPUÉS (seguro) con Passport.js: estrategia «local» para el login (scrypt + comparación en
// tiempo constante) y estrategia «jwt» para cada petición, sin sesiones en el servidor, más un guard de roles.
// Requisitos: Node.js 26.13.1 LTS, passport 0.7.0, passport-local 1.0.0, passport-jwt 4.0.1, jsonwebtoken 9.0.3.
// Ejecuta: JWT_SECRETO=$(openssl rand -hex 32) node f125-passport/despues.js   (:3225)
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as EstrategiaJwt } from 'passport-jwt';
import { Strategy as EstrategiaLocal } from 'passport-local';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Nunca guardes la clave: guarda sal + hash lento (scrypt). Cada usuario tiene su propia sal.
function crearUsuario(id, nombre, clave, rol) {
  const sal = randomBytes(16);
  return { id, nombre, rol, sal, hash: scryptSync(clave, sal, 32) };
}
const USUARIOS = new Map([
  ['ana', crearUsuario('u1', 'ana', 'ana123', 'cliente')],
  ['root', crearUsuario('u2', 'root', 'S3gura!2026', 'admin')],
]);
const SAL_FALSA = randomBytes(16); // para gastar el mismo tiempo cuando el usuario no existe

export function crearApp({ secreto = process.env.JWT_SECRETO } = {}) {
  if (!secreto || secreto.length < 32) throw new Error('JWT_SECRETO debe tener al menos 32 caracteres aleatorios');
  const autenticador = new passport.Passport(); // instancia propia: no comparte estado global entre apps ni tests

  // ESTRATEGIA LOCAL: usuario + clave -> usuario o false. El mismo resultado (false) si no existe o si la clave falla.
  autenticador.use(new EstrategiaLocal({ usernameField: 'usuario', passwordField: 'clave' }, (nombre, clave, listo) => {
    const usuario = USUARIOS.get(nombre);
    const calculado = scryptSync(clave, usuario?.sal ?? SAL_FALSA, 32);
    const valido = usuario !== undefined && timingSafeEqual(calculado, usuario.hash);
    listo(null, valido ? usuario : false);
  }));

  // ESTRATEGIA JWT: saca el token de Authorization: Bearer, verifica firma, algoritmo, emisor y caducidad.
  autenticador.use(new EstrategiaJwt({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secreto,
    algorithms: ['HS256'],
    issuer: 'pedidos',
  }, (payload, listo) => {
    const usuario = [...USUARIOS.values()].find((u) => u.id === payload.sub);
    listo(null, usuario ? { id: usuario.id, rol: usuario.rol } : false); // el rol sale del SERVIDOR, no del cliente
  }));

  const conClave = autenticador.authenticate('local', { session: false });
  const conToken = autenticador.authenticate('jwt', { session: false });
  // AUTORIZACIÓN: estar identificado no basta; además hay que tener el rol.
  const soloRol = (rol) => (req, res, next) => (req.user.rol === rol ? next() : res.status(403).json({ error: 'no tienes permiso' }));

  const app = express();
  app.use(express.json());
  app.post('/login', conClave, (req, res) => {
    const token = jwt.sign({}, secreto, { algorithm: 'HS256', subject: req.user.id, issuer: 'pedidos', expiresIn: '15m' });
    res.json({ token, tipo: 'Bearer', expiraEn: 900 });
  });
  app.get('/mis-pedidos', conToken, (req, res) => res.json({ pedidos: [1, 2], de: req.user.id }));
  app.delete('/admin/usuarios/:id', conToken, soloRol('admin'), (req, res) => res.json({ borrado: req.params.id }));
  return app;
}

if (import.meta.main) crearApp().listen(3225, () => console.log('DESPUÉS (seguro) en :3225'));
```

#### 10. MINI-LABORATORIO

1. Lanza el ataque contra las dos versiones (`f125-passport/ataque.js`: enumerar usuarios, suplantar con la cabecera
   `x-usuario` y borrar como cliente):

```javascript
// Módulo 20 · F125 · El ataque: enumerar usuarios, suplantar con una cabecera y borrar como si fueras admin.
// Arranca las dos versiones y les envía lo mismo. Ejecuta: node f125-passport/ataque.js
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

async function atacar(nombre, app) {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const pedir = async (metodo, ruta, { cabeceras = {}, cuerpo } = {}) => {
    const r = await fetch(`${base}${ruta}`, { method: metodo, headers: { 'content-type': 'application/json', ...cabeceras }, body: cuerpo && JSON.stringify(cuerpo) });
    const texto = await r.text();
    return `${r.status} ${texto.replace(/"token":"[^"]+"/, '"token":"<jwt>"')}`;
  };
  console.log(`== ${nombre}`);
  console.log(`   login usuario inexistente        -> ${await pedir('POST', '/login', { cuerpo: { usuario: 'zzz', clave: 'x' } })}`);
  console.log(`   login usuario real, clave mala   -> ${await pedir('POST', '/login', { cuerpo: { usuario: 'root', clave: 'x' } })}`);
  console.log(`   x-usuario: root (sin clave)      -> ${await pedir('GET', '/mis-pedidos', { cabeceras: { 'x-usuario': 'root' } })}`);
  const login = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ usuario: 'ana', clave: 'ana123' }) }).then((r) => r.json());
  const comoAna = login.token ? { authorization: `Bearer ${login.token}` } : { 'x-usuario': 'ana' };
  console.log(`   Ana (cliente) borra un usuario   -> ${await pedir('DELETE', '/admin/usuarios/u2', { cabeceras: comoAna })}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes());
await atacar('DESPUÉS (seguro)', crearDespues({ secreto: randomBytes(32).toString('hex') }));
```

```bash
node f125-passport/ataque.js
```

   **Output esperado:**

```text
== ANTES (vulnerable)
   login usuario inexistente        -> 404 {"error":"el usuario no existe"}
   login usuario real, clave mala   -> 401 {"error":"clave incorrecta"}
   x-usuario: root (sin clave)      -> 200 {"pedidos":[1,2]}
   Ana (cliente) borra un usuario   -> 200 {"borrado":"u2"}
== DESPUÉS (seguro)
   login usuario inexistente        -> 401 Unauthorized
   login usuario real, clave mala   -> 401 Unauthorized
   x-usuario: root (sin clave)      -> 401 Unauthorized
   Ana (cliente) borra un usuario   -> 403 {"error":"no tienes permiso"}
```

2. A mano, con un secreto de verdad. En una terminal:

```bash
JWT_SECRETO=$(openssl rand -hex 32) node f125-passport/despues.js
```

   En otra:

```bash
TOKEN=$(curl -s -X POST localhost:3225/login -H 'content-type: application/json' -d '{"usuario":"ana","clave":"ana123"}' | jq -r .token)
curl -s -w ' [%{http_code}]\n' localhost:3225/mis-pedidos -H "authorization: Bearer $TOKEN"
curl -s -w ' [%{http_code}]\n' -X DELETE localhost:3225/admin/usuarios/u2 -H "authorization: Bearer $TOKEN"
curl -s -w ' [%{http_code}]\n' localhost:3225/mis-pedidos
```

   **Output esperado:**

```text
{"pedidos":[1,2],"de":"u1"} [200]
{"error":"no tienes permiso"} [403]
Unauthorized [401]
```

   **Captura comentada:** el primer 200 trae `de: "u1"`, que salió del token verificado, no del cuerpo. El 403 es
   autorización (Ana es quien dice ser, pero no es admin). El 401 final es de Passport sin token: texto `Unauthorized`.
   Arranca ahora sin `JWT_SECRETO`: el proceso termina al instante con `Error: JWT_SECRETO debe tener al menos 32
   caracteres aleatorios`, mejor que arrancar con un secreto vacío.

#### 11. VERIFICACIÓN

Test que debes ejecutar:

```javascript
// Módulo 20 · F125 · Tests de la API protegida con Passport.js. Ejecuta: node --test f125-passport/passport.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { crearApp } from './despues.js';

const secreto = randomBytes(32).toString('hex');
let servidor; let base;
before(async () => { servidor = crearApp({ secreto }).listen(0); await once(servidor, 'listening'); base = `http://127.0.0.1:${servidor.address().port}`; });
after(() => servidor.close());
const json = { 'content-type': 'application/json' };
const login = (usuario, clave) => fetch(`${base}/login`, { method: 'POST', headers: json, body: JSON.stringify({ usuario, clave }) });
const tokenDe = async (usuario, clave) => (await (await login(usuario, clave)).json()).token;

test('login correcto devuelve un JWT de 15 minutos con sub e iss', async () => {
  const payload = jwt.verify(await tokenDe('ana', 'ana123'), secreto, { algorithms: ['HS256'] });
  assert.equal(payload.sub, 'u1');
  assert.equal(payload.iss, 'pedidos');
  assert.equal(payload.exp - payload.iat, 900);
});

test('usuario inexistente y clave incorrecta responden EXACTAMENTE igual (no se pueden enumerar usuarios)', async () => {
  const [noExiste, claveMala] = [await login('zzz', 'x'), await login('root', 'x')];
  assert.equal(noExiste.status, 401);
  assert.equal(claveMala.status, 401);
  assert.equal(await noExiste.text(), await claveMala.text());
});

test('la cabecera x-usuario ya no identifica a nadie: sin token 401', async () => {
  assert.equal((await fetch(`${base}/mis-pedidos`, { headers: { 'x-usuario': 'root' } })).status, 401);
});

test('con token válido entra a sus pedidos', async () => {
  const r = await fetch(`${base}/mis-pedidos`, { headers: { authorization: `Bearer ${await tokenDe('ana', 'ana123')}` } });
  assert.deepEqual(await r.json(), { pedidos: [1, 2], de: 'u1' });
});

test('autorización: un cliente recibe 403 en la ruta de admin y un admin 200', async () => {
  const borrar = async (token) => (await fetch(`${base}/admin/usuarios/u9`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })).status;
  assert.equal(await borrar(await tokenDe('ana', 'ana123')), 403);
  assert.equal(await borrar(await tokenDe('root', 'S3gura!2026')), 200);
});

test('un token firmado con otro secreto o que dice rol admin en el payload no sirve', async () => {
  const otroSecreto = jwt.sign({ rol: 'admin' }, 'x'.repeat(32), { subject: 'u2', issuer: 'pedidos' });
  assert.equal((await fetch(`${base}/mis-pedidos`, { headers: { authorization: `Bearer ${otroSecreto}` } })).status, 401);
  const rolFalso = jwt.sign({ rol: 'admin' }, secreto, { subject: 'u1', issuer: 'pedidos', expiresIn: '5m' }); // aun firmado bien…
  const r = await fetch(`${base}/admin/usuarios/u9`, { method: 'DELETE', headers: { authorization: `Bearer ${rolFalso}` } });
  assert.equal(r.status, 403, '…el rol se lee del servidor, no del token');
});

test('arrancar sin un secreto largo falla de inmediato', () => {
  assert.throws(() => crearApp({ secreto: 'corto' }), /al menos 32 caracteres/);
});
```

```bash
node --test f125-passport/passport.test.js
```

Resultado esperado:

```text
✔ login correcto devuelve un JWT de 15 minutos con sub e iss
✔ usuario inexistente y clave incorrecta responden EXACTAMENTE igual (no se pueden enumerar usuarios)
✔ la cabecera x-usuario ya no identifica a nadie: sin token 401
✔ con token válido entra a sus pedidos
✔ autorización: un cliente recibe 403 en la ruta de admin y un admin 200
✔ un token firmado con otro secreto o que dice rol admin en el payload no sirve
✔ arrancar sin un secreto largo falla de inmediato
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

**Pregunta de comprobación:** un token válido de Ana trae en el payload `"rol": "admin"` porque alguien lo firmó con el
secreto correcto. ¿Por qué el test sigue dando 403? *(Porque la estrategia JWT solo usa `sub` del token y lee el rol
del almacén de usuarios del servidor; lo que diga el token sobre permisos no se cree.)*

#### 12. ERROR COMÚN

**Síntoma:** el login con credenciales correctas responde **500** y el log dice `Login sessions require session
support. Did you forget to use express-session middleware?`. **Causa:** falta `{ session: false }` en una API sin
sesiones; Passport intenta guardar el usuario en `req.session`, que no existe. `f125-passport/error-comun.js`:

```javascript
// Módulo 20 · F125 · ERROR COMÚN: olvidar { session: false } en una API sin sesiones. Passport intenta guardar el
// usuario en req.session, que no existe, y el login correcto responde 500.
// Ejecuta: node f125-passport/error-comun.js
import express from 'express';
import passport from 'passport';
import { Strategy as EstrategiaLocal } from 'passport-local';
import { once } from 'node:events';

const autenticador = new passport.Passport();
autenticador.use(new EstrategiaLocal((usuario, clave, listo) => listo(null, usuario === 'ana' && clave === 'ana123' ? { id: 'u1' } : false)));

const app = express();
app.use(express.json());
app.post('/mal/login', autenticador.authenticate('local'), (req, res) => res.json({ ok: true }));                    // falta session: false
app.post('/bien/login', autenticador.authenticate('local', { session: false }), (req, res) => res.json({ ok: true }));
app.use((error, _req, res, _next) => res.status(500).json({ error: error.message }));

const servidor = app.listen(0);
await once(servidor, 'listening');
for (const ruta of ['/mal/login', '/bien/login']) {
  const r = await fetch(`http://127.0.0.1:${servidor.address().port}${ruta}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"username":"ana","password":"ana123"}' });
  console.log(`POST ${ruta.padEnd(11)} -> ${r.status} ${await r.text()}`);
}
servidor.close();
```

Salida real de `node f125-passport/error-comun.js`:

```text
POST /mal/login  -> 500 {"error":"Login sessions require session support. Did you forget to use `express-session` middleware?"}
POST /bien/login -> 200 {"ok":true}
```

**Diagnóstico visual:** las credenciales malas dan 401 (la estrategia nunca llega a guardar sesión) y las buenas dan
500: el fallo aparece **solo cuando el login funciona**, por eso se escapa en pruebas que solo prueban el caso
negativo. **Arreglo:** `authenticate('local', { session: false })` en cada uso; no instales `express-session` «para que
funcione».

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué aporta Passport.js y cómo lo usarías en una API de microservicios sin estado?**

**Respuesta modelo:** Passport separa el *cómo* te autenticas del resto de la aplicación: cada mecanismo es una
estrategia (local, JWT, OAuth2, OIDC, SAML) con la misma interfaz, y la ruta solo dice `authenticate('nombre')`. En una
API sin estado lo uso siempre con `{ session: false }`: la estrategia local solo en el servicio de login, comparando un
hash scrypt o argon2id con `timingSafeEqual` y respondiendo igual si el usuario no existe que si la clave es incorrecta,
para no permitir enumerar usuarios; y la estrategia JWT en el resto, con lista blanca de algoritmos, emisor y
caducidad. La autenticación solo responde quién eres; la autorización va en un middleware aparte que lee el rol del
servidor, nunca de una cabecera ni de lo que traiga el token. Y le pongo un rate limit al login. Si el servicio solo
valida tokens de un proveedor externo, me ahorro Passport y uso un middleware con `jose`.

#### 14. ANTI-PATRÓN RELACIONADO

**Confiar en la identidad que dice el cliente.** Evita cualquier «sesión» que el propio cliente pueda escribir: una
cabecera `x-usuario`, un `?userId=` en la URL, un campo `rol` en el cuerpo o una cookie sin firmar. Es lo que hace
`antes.js`, y el ataque lo explota con un `curl`.

```javascript
// MAL: la identidad viene del cliente. «Soy root», y el servidor se lo cree.
req.usuario = USUARIOS[req.get('x-usuario')];

// BIEN: la identidad sale de una credencial verificada; los permisos, del servidor (despues.js).
app.get('/mis-pedidos', conToken, (req, res) => res.json({ de: req.user.id }));
```

En un diagrama se ve como una flecha que va del cliente directamente a «identidad» sin pasar por ninguna caja de
verificación.

---

### Helmet, CORS

#### 1. UBICACIÓN

Módulo 20, Lección 3 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Cabeceras HTTP de respuesta y el método `OPTIONS` (Módulo 0.4).
- Middleware de Express (Módulo 14).
- Qué es un origen: esquema + host + puerto (`https://tienda.example`) (se explica aquí).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** Helmet para enviar las cabeceras de seguridad de una API y **restringir** CORS a una lista exacta de
orígenes con credenciales, y **explicar** qué protege CORS y qué no. Lo compruebas cuando
`node --test f126-helmet-cors/cabeceras.test.js` pasa 4 de 4.

#### 4. ANALOGÍA VISUAL

Dibuja un **edificio con conserje** (el navegador) y muchos inquilinos (las webs abiertas en pestañas). Una web,
`sitio-malo.example`, le pide al conserje: «tráeme el extracto bancario de la vecina del 3.º» (leer tu API con tus
cookies). El conserje **sí va** al banco y el banco **sí le da** el sobre, pero antes de entregarlo mira el sello del
banco (la cabecera `Access-Control-Allow-Origin`): si dice «solo para tienda.example», **no se lo entrega** al inquilino
malo. Dibuja también al banco **reflejando** cualquier nombre en el sello («para quien lo pida»): el conserje lo
entrega. Y en otra viñeta, las **pegatinas de seguridad** que el banco pega en cada sobre: «no abrir dentro de un marco
ajeno», «no adivinar el contenido», «solo por correo certificado» (las cabeceras de Helmet).

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant W as página de sitio-malo.example
    participant N as navegador de la víctima
    participant A as API (Express + helmet + cors)
    W->>N: fetch('https://api/perfil', {credentials: 'include'})
    N->>A: GET /api/perfil<br/>Origin: https://sitio-malo.example + cookie
    A-->>N: 200 {datos}<br/>sin Access-Control-Allow-Origin
    N--xW: bloquea: la respuesta NO llega al script
    Note over N,A: con Origin: https://tienda.example →<br/>Allow-Origin: https://tienda.example, Allow-Credentials: true → la entrega
    Note over A: Helmet añade siempre: CSP, HSTS, nosniff,<br/>X-Frame-Options, Referrer-Policy… y quita X-Powered-By
```

**Texto alternativo:** diagrama de secuencia. Una página de sitio-malo.example hace fetch a la API con credenciales. El
navegador de la víctima envía GET /api/perfil con la cabecera Origin del sitio malo y la cookie. La API responde 200 con
los datos pero sin Access-Control-Allow-Origin, así que el navegador bloquea la respuesta y no llega al script. Una nota
indica que con Origin https://tienda.example la API responde Allow-Origin con ese origen y Allow-Credentials true, y el
navegador la entrega. Otra nota indica que Helmet añade siempre CSP, HSTS, nosniff, X-Frame-Options y Referrer-Policy, y
quita X-Powered-By.

#### 6. EXPLICACIÓN NIVEL 0

- Los navegadores tienen una regla de oro: el código de una web **no puede leer** las respuestas de otra web (la
  **política del mismo origen**). Por eso una página cualquiera no puede leer tu correo aunque estés conectado.
- **CORS** es la forma en que tu API dice «a esta otra web sí le dejo leer mis respuestas». Si lo configuras mal,
  le das permiso a **todas**.
- **Helmet** es un middleware que añade a cada respuesta unas cabeceras de seguridad: pequeñas instrucciones para el
  navegador del tipo «no me metas dentro de un marco», «usa siempre HTTPS», «no adivines qué tipo de archivo es».
- Las dos cosas son **instrucciones para el navegador**. No protegen de alguien que llama a tu API con `curl`.

#### 7. EXPLICACIÓN INTERMEDIA

- **Petición simple vs preflight.** Un `GET` o un `POST` con tipos de contenido básicos se envía directo con la
  cabecera `Origin`. Si usas otro método (`DELETE`), cabeceras propias (`Authorization`) o `Content-Type:
  application/json`, el navegador manda antes un **`OPTIONS`** (preflight) preguntando si puede.
- **Cabeceras de respuesta CORS:** `Access-Control-Allow-Origin` (un origen o `*`), `Access-Control-Allow-Credentials:
  true` (permite cookies y `Authorization`; prohibido combinarlo con `*`), `-Allow-Methods`, `-Allow-Headers`,
  `-Max-Age` (cuánto se cachea el preflight) y `Vary: Origin` (para que una caché no sirva la respuesta de un origen a
  otro).
- **Paquete `cors`:** `origin` acepta `true` (refleja el que venga: peligroso), un string, un array, una **regex** (expresión regular para comparar texto) o una
  función `(origen, listo) => listo(null, permitido)`. La función con un `Set` y comparación exacta es lo más claro.
- **Helmet 8** activa por defecto: `Content-Security-Policy`, `Cross-Origin-Opener-Policy`,
  `Cross-Origin-Resource-Policy`, `Origin-Agent-Cluster`, `Referrer-Policy`, `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `X-Download-Options`, `X-Frame-Options: SAMEORIGIN`,
  `X-Permitted-Cross-Domain-Policies`, `X-XSS-Protection: 0`, y quita `X-Powered-By`.
- **Para una API JSON** la CSP puede ser máxima (`default-src 'none'; frame-ancestors 'none'`): no sirve HTML, así que
  no necesita cargar nada.
- **HSTS** solo tiene efecto sobre HTTPS; una vez enviado con `max-age` de un año, el navegador no volverá a usar HTTP
  con ese dominio. Ponlo cuando todo el dominio tenga HTTPS.

#### 8. EXPLICACIÓN MAESTRA

- **Dónde ponerlo.** En la **aplicación** (helmet + cors): viaja con el código y se prueba con tests. En el **gateway
  o el CDN**: una sola configuración para todos los servicios, pero un servicio puede olvidarse si alguien lo expone
  directo. Recomendación: CORS en un único sitio (normalmente el gateway o el BFF, porque los microservicios internos
  no hablan con navegadores) y cabeceras de seguridad en ambos.
- **Microservicios internos no necesitan CORS.** Si un servicio solo recibe llamadas de otros servicios, no habilites
  CORS: sin cabeceras CORS, ningún navegador puede leerlo, que es justo lo que quieres.
- **CORS no sustituye a CSRF.** CORS controla quién **lee** la respuesta; una petición `POST` simple con cookie puede
  **ejecutarse** igual. Para APIs con cookies: `SameSite=Lax/Strict`, tokens anti-CSRF o exigir `Content-Type:
  application/json` (fuerza preflight).
- **`Origin: null`.** Lo envían iframes con sandbox, archivos locales y algunas redirecciones. Jamás lo pongas en la
  lista blanca: cualquiera puede fabricarlo.
- **Orígenes dinámicos** (subdominios de clientes, entornos de vista previa): genera la lista desde configuración o
  compara el host parseado con `new URL(origen)` contra un conjunto exacto; nunca con `endsWith` o regex sin anclar.
- **Cuándo NO usar Helmet tal cual:** si sirves HTML con scripts de terceros, la CSP por defecto romperá cosas;
  empieza en modo `reportOnly` y ajusta. Y no sustituye a corregir un XSS: solo reduce su impacto.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **express 5.3.0**, **helmet 8.3.0** y **cors 2.8.6**.

**Antes (vulnerable)** — `f126-helmet-cors/antes.js`:

```javascript
// Módulo 20 · F126 · ANTES (vulnerable). NO copies este archivo: existe para compararlo con despues.js.
// Fallos: (1) sin cabeceras de seguridad y anunciando «X-Powered-By: Express»; (2) CORS que refleja CUALQUIER
// origen y además permite credenciales: cualquier web puede leer la respuesta con la cookie de la víctima.
// Ejecuta: node f126-helmet-cors/antes.js   (:3126)
import cors from 'cors';
import express from 'express';

export function crearApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true })); // (2) origin: true = «copia el Origin que venga»
  app.get('/api/perfil', (_req, res) => res.json({ nombre: 'Ana', saldo: 250_000 }));
  return app;
}

if (import.meta.main) crearApp().listen(3126, () => console.log('ANTES (vulnerable) en :3126'));
```

**Después (seguro)** — `f126-helmet-cors/despues.js`:

```javascript
// Módulo 20 · F126 · DESPUÉS (seguro): Helmet pone las cabeceras de seguridad y CORS solo admite una lista de orígenes.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, helmet 8.3.0 y cors 2.8.6.
// Ejecuta: ORIGENES=https://tienda.example,https://admin.tienda.example node f126-helmet-cors/despues.js   (:3226)
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

export function crearApp({ origenes = (process.env.ORIGENES ?? 'https://tienda.example').split(',') } = {}) {
  const permitidos = new Set(origenes); // comparación EXACTA de cadenas: nada de includes(), endsWith() ni regex flojas
  const app = express();
  app.disable('x-powered-by');          // no anuncies qué framework usas (Helmet también la quita)

  // Helmet agrupa una docena de middlewares pequeños, uno por cabecera. Para una API JSON: CSP que no deja cargar nada y el resto por defecto.
  app.use(helmet({
    contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    strictTransportSecurity: { maxAge: 31_536_000, includeSubDomains: true }, // HSTS: 1 año, solo HTTPS
  }));

  app.use(cors({
    // Sin cabecera Origin (curl, otro servicio, navegación directa) no hay nada que decidir.
    // Origen en la lista -> se devuelve ESE origen. Cualquier otro -> ninguna cabecera CORS.
    origin: (origen, listo) => listo(null, origen !== undefined && permitidos.has(origen)),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // solo tiene sentido con lista blanca; jamás con «*» ni reflejando el origen
    maxAge: 600,       // el navegador recuerda el preflight 10 minutos
  }));

  app.get('/api/perfil', (_req, res) => res.json({ nombre: 'Ana', saldo: 250_000 }));
  return app;
}

if (import.meta.main) crearApp().listen(3226, () => console.log('DESPUÉS (seguro) en :3226'));
```

#### 10. MINI-LABORATORIO

1. `f126-helmet-cors/ataque.js` envía lo que enviaría un navegador desde `sitio-malo.example` y desde la tienda, un
   preflight y una petición normal, y aplica la regla del navegador para decir si entregaría la respuesta:

```javascript
// Módulo 20 · F126 · El ataque: una página en https://sitio-malo.example intenta leer /api/perfil con las credenciales
// de la víctima. El navegador solo entrega la respuesta al script si el servidor contesta con
// Access-Control-Allow-Origin igual a ese origen (y Allow-Credentials: true). Ejecuta: node f126-helmet-cors/ataque.js
import { once } from 'node:events';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const SEGURIDAD = ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'cross-origin-resource-policy', 'x-powered-by'];

async function probar(nombre, app) {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const url = `http://127.0.0.1:${servidor.address().port}/api/perfil`;
  console.log(`== ${nombre}`);
  for (const origen of ['https://sitio-malo.example', 'https://tienda.example']) {
    const r = await fetch(url, { headers: { origin: origen } });
    const acao = r.headers.get('access-control-allow-origin');
    const lee = acao === origen && r.headers.get('access-control-allow-credentials') === 'true';
    console.log(`   Origin ${origen.padEnd(27)} -> Allow-Origin: ${(acao ?? '(no está)').padEnd(27)} · el navegador ${lee ? 'ENTREGA' : 'BLOQUEA'} la respuesta al script`);
  }
  const pre = await fetch(url, { method: 'OPTIONS', headers: { origin: 'https://tienda.example', 'access-control-request-method': 'DELETE', 'access-control-request-headers': 'authorization' } });
  console.log(`   preflight DELETE desde la tienda  -> ${pre.status} métodos=${pre.headers.get('access-control-allow-methods')} max-age=${pre.headers.get('access-control-max-age')}`);
  const r = await fetch(url);
  console.log('   cabeceras de seguridad:');
  for (const cabecera of SEGURIDAD) console.log(`     ${cabecera}: ${r.headers.get(cabecera) ?? '(no está)'}`);
  servidor.close();
}
await probar('ANTES (vulnerable)', crearAntes());
await probar('DESPUÉS (seguro)', crearDespues());
```

```bash
node f126-helmet-cors/ataque.js
```

   **Output esperado:**

```text
== ANTES (vulnerable)
   Origin https://sitio-malo.example  -> Allow-Origin: https://sitio-malo.example  · el navegador ENTREGA la respuesta al script
   Origin https://tienda.example      -> Allow-Origin: https://tienda.example      · el navegador ENTREGA la respuesta al script
   preflight DELETE desde la tienda  -> 204 métodos=GET,HEAD,PUT,PATCH,POST,DELETE max-age=null
   cabeceras de seguridad:
     content-security-policy: (no está)
     strict-transport-security: (no está)
     x-content-type-options: (no está)
     x-frame-options: (no está)
     referrer-policy: (no está)
     cross-origin-resource-policy: (no está)
     x-powered-by: Express
== DESPUÉS (seguro)
   Origin https://sitio-malo.example  -> Allow-Origin: (no está)                   · el navegador BLOQUEA la respuesta al script
   Origin https://tienda.example      -> Allow-Origin: https://tienda.example      · el navegador ENTREGA la respuesta al script
   preflight DELETE desde la tienda  -> 204 métodos=GET,POST,PUT,DELETE max-age=600
   cabeceras de seguridad:
     content-security-policy: default-src 'none';frame-ancestors 'none'
     strict-transport-security: max-age=31536000; includeSubDomains
     x-content-type-options: nosniff
     x-frame-options: SAMEORIGIN
     referrer-policy: no-referrer
     cross-origin-resource-policy: same-origin
     x-powered-by: (no está)
```

2. Mira todas las cabeceras de la versión segura. Arranca `node f126-helmet-cors/despues.js` y:

```bash
curl -s -i localhost:3226/api/perfil -H 'Origin: https://tienda.example'
```

   **Output esperado** (sin las cabeceras `Date`, `ETag`, `Connection` y `Keep-Alive`, que varían):

```text
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'none';frame-ancestors 'none'
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Access-Control-Allow-Origin: https://tienda.example
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 31

{"nombre":"Ana","saldo":250000}
```

   **Captura comentada:** doce cabeceras de Helmet arriba; abajo las tres de CORS (`Allow-Origin` con el origen exacto,
   `Vary: Origin` y `Allow-Credentials`). Repite el `curl` con `-H 'Origin: https://sitio-malo.example'`: las de Helmet
   siguen, las de CORS desaparecen, y el **cuerpo llega igual** (paso siguiente).

#### 11. VERIFICACIÓN

Test que debes ejecutar:

```javascript
// Módulo 20 · F126 · Tests de cabeceras de seguridad y CORS. Ejecuta: node --test f126-helmet-cors/cabeceras.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { crearApp } from './despues.js';

let servidor; let url;
before(async () => {
  servidor = crearApp({ origenes: ['https://tienda.example', 'https://admin.tienda.example'] }).listen(0);
  await once(servidor, 'listening');
  url = `http://127.0.0.1:${servidor.address().port}/api/perfil`;
});
after(() => servidor.close());

test('Helmet añade las cabeceras de seguridad y quita X-Powered-By', async () => {
  const c = (await fetch(url)).headers;
  assert.equal(c.get('x-powered-by'), null);
  assert.equal(c.get('x-content-type-options'), 'nosniff');
  assert.equal(c.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(c.get('strict-transport-security'), 'max-age=31536000; includeSubDomains');
  assert.equal(c.get('content-security-policy'), "default-src 'none';frame-ancestors 'none'");
  assert.equal(c.get('referrer-policy'), 'no-referrer');
});

test('un origen de la lista recibe Allow-Origin con SU origen y Vary: Origin', async () => {
  const c = (await fetch(url, { headers: { origin: 'https://admin.tienda.example' } })).headers;
  assert.equal(c.get('access-control-allow-origin'), 'https://admin.tienda.example');
  assert.equal(c.get('access-control-allow-credentials'), 'true');
  assert.match(c.get('vary'), /Origin/);
});

test('un origen fuera de la lista no recibe ninguna cabecera CORS', async () => {
  for (const origen of ['https://sitio-malo.example', 'https://tienda.example.sitio-malo.example', 'http://tienda.example', 'null']) {
    const c = (await fetch(url, { headers: { origin: origen } })).headers;
    assert.equal(c.get('access-control-allow-origin'), null, origen);
    assert.equal(c.get('access-control-allow-credentials'), null, origen);
  }
});

test('el preflight responde 204 con métodos, cabeceras permitidas y max-age', async () => {
  const r = await fetch(url, { method: 'OPTIONS', headers: { origin: 'https://tienda.example', 'access-control-request-method': 'DELETE' } });
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('access-control-allow-methods'), 'GET,POST,PUT,DELETE');
  assert.equal(r.headers.get('access-control-allow-headers'), 'Content-Type,Authorization');
  assert.equal(r.headers.get('access-control-max-age'), '600');
});
```

```bash
node --test f126-helmet-cors/cabeceras.test.js
```

Resultado esperado:

```text
✔ Helmet añade las cabeceras de seguridad y quita X-Powered-By
✔ un origen de la lista recibe Allow-Origin con SU origen y Vary: Origin
✔ un origen fuera de la lista no recibe ninguna cabecera CORS
✔ el preflight responde 204 con métodos, cabeceras permitidas y max-age
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

**Pregunta de comprobación:** ¿por qué `origin: '*'` con `credentials: true` no es una opción? *(La especificación lo
prohíbe y el navegador rechaza esa respuesta; quien «lo arregla» reflejando el origen con `origin: true` acaba
autorizando a cualquier web a leer con las cookies del usuario, que es peor.)*

#### 12. ERROR COMÚN

**Síntoma:** «configuramos CORS y aun así el pentester leyó los datos con `curl`». **Causa:** creer que CORS es control
de acceso del servidor. CORS solo le dice al **navegador** si entrega la respuesta a un script; la petición se atiende
igual. `f126-helmet-cors/error-comun.js`:

```javascript
// Módulo 20 · F126 · ERROR COMÚN: creer que CORS «bloquea» peticiones. CORS solo le dice al NAVEGADOR si puede
// entregar la respuesta a un script de otro origen. El servidor atiende la petición igual, y curl o cualquier
// programa leen la respuesta sin problema. CORS no sustituye a la autenticación.
// Ejecuta: node f126-helmet-cors/error-comun.js
import { once } from 'node:events';
import { crearApp } from './despues.js';

const servidor = crearApp().listen(0);
await once(servidor, 'listening');
const r = await fetch(`http://127.0.0.1:${servidor.address().port}/api/perfil`, { headers: { origin: 'https://sitio-malo.example' } });
console.log(`petición con Origin no permitido, fuera de un navegador -> ${r.status} ${await r.text()}`);
console.log(`Access-Control-Allow-Origin: ${r.headers.get('access-control-allow-origin') ?? '(no está)'}   <- esto solo detiene al JavaScript de un navegador`);
servidor.close();
```

Salida real de `node f126-helmet-cors/error-comun.js`:

```text
petición con Origin no permitido, fuera de un navegador -> 200 {"nombre":"Ana","saldo":250000}
Access-Control-Allow-Origin: (no está)   <- esto solo detiene al JavaScript de un navegador
```

**Diagnóstico visual:** en el log del servidor la petición del origen no permitido aparece como un **200** normal. Si
esperabas verla rechazada, estás usando CORS como autenticación. **Arreglo:** la protección de los datos es
autenticación y autorización (fichas 1 y 2); CORS solo decide qué webs de navegador pueden leer respuestas que el
usuario ya tenía derecho a ver.

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué es CORS, qué ataque evita y cómo lo configuras en una API que usa cookies?**

**Respuesta modelo:** CORS es el mecanismo por el que un servidor relaja la política del mismo origen del navegador y
le dice qué otros orígenes pueden leer sus respuestas desde JavaScript. Evita que una web maliciosa que la víctima
visita lea, con las cookies de la víctima, datos de mi API. Con cookies configuro una lista blanca exacta de orígenes,
comparo por igualdad (nunca con `endsWith` ni regex sin anclar), devuelvo el origen concreto y no `*`, añado `Vary:
Origin`, `Allow-Credentials: true` solo en ese caso, limito métodos y cabeceras y cacheo el preflight con `Max-Age`.
Nunca reflejo el `Origin` que llega ni acepto `null`. Tengo claro lo que no hace: no bloquea peticiones fuera del
navegador ni evita que una petición simple se ejecute, así que no sustituye a la autenticación ni a la protección
CSRF (`SameSite`, tokens). Los microservicios internos ni siquiera llevan CORS. Y lo acompaño de Helmet, que añade
CSP, HSTS, `nosniff`, `X-Frame-Options` y quita `X-Powered-By`.

#### 14. ANTI-PATRÓN RELACIONADO

**Validar el origen «más o menos».** Evita comprobar el origen con `endsWith`, `includes` o una regex sin `^` y `$`:
el atacante registra un dominio que la cumple. `f126-helmet-cors/anti-patron.js` lo mide:

```javascript
// Módulo 20 · F126 · ANTI-PATRÓN: validar el origen «más o menos» (endsWith, includes, regex sin anclar).
// Ejecuta: node f126-helmet-cors/anti-patron.js
const flojas = {
  "endsWith('tienda.example')": (o) => o.endsWith('tienda.example'),
  "includes('tienda.example')": (o) => o.includes('tienda.example'),
  '/tienda\\.example/.test()': (o) => /tienda\.example/.test(o),
};
const exacta = (o) => new Set(['https://tienda.example', 'https://admin.tienda.example']).has(o);
const atacantes = ['https://sitio-malotienda.example', 'https://tienda.example.sitio-malo.example', 'http://tienda.example'];

for (const [nombre, valida] of Object.entries(flojas)) {
  console.log(`${nombre.padEnd(28)} acepta: ${atacantes.filter(valida).join(', ') || '(ninguno)'}`);
}
console.log(`${'Set.has() (igualdad exacta)'.padEnd(28)} acepta: ${atacantes.filter(exacta).join(', ') || '(ninguno)'}`);
```

Salida real de `node f126-helmet-cors/anti-patron.js`:

```text
endsWith('tienda.example')   acepta: https://sitio-malotienda.example, http://tienda.example
includes('tienda.example')   acepta: https://sitio-malotienda.example, https://tienda.example.sitio-malo.example, http://tienda.example
/tienda\.example/.test()     acepta: https://sitio-malotienda.example, https://tienda.example.sitio-malo.example, http://tienda.example
Set.has() (igualdad exacta)  acepta: (ninguno)
```

Cómo se ve en el código: cualquier `origin:` de `cors()` que no sea una lista o un `Set.has()` con orígenes completos
(esquema incluido) merece una revisión.

---

### Prevención de inyecciones NoSQL

#### 1. UBICACIÓN

Módulo 20, Lección 4 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- MongoDB y el driver de Node: `findOne`, `find`, filtros con operadores (`$eq`, `$ne`, `$gt`, `$regex`) (Módulo 15).
- Validación con Zod (Módulo 14, ficha «Validación con Zod o class-validator»).
- `express.json()` y `req.query` (Módulo 14).

#### 3. OBJETIVO DE APRENDIZAJE

**Explicar** cómo un objeto JSON se convierte en un operador de MongoDB, **explotar** un login vulnerable con
`{"$ne": null}` y **prevenirlo** validando el tipo de cada campo con un esquema, usando `$eq` explícito y sacando la
contraseña del filtro. Lo compruebas cuando `node --test f127-nosql/filtros.test.js` pasa 5 de 5 (y, con Docker,
`nosql.integracion.js` 2 de 2).

#### 4. ANALOGÍA VISUAL

Dibuja un **formulario en papel** en la ventanilla de un banco: «Nombre: ____ Clave: ____». El empleado busca en el
archivo una ficha que coincida **exactamente** con lo que escribiste. Ahora un tramposo, en la casilla de la clave, no
escribe una palabra: pega una **notita con una instrucción** para el empleado: «cualquiera que NO esté vacía». El
empleado, que obedece todo lo que hay en las casillas, saca la ficha de root. Dibuja la versión segura: la casilla
tiene un **molde** (solo admite letras, una línea, como mucho 128) y la notita no cabe; y además la clave no se busca
en el archivo: el empleado saca la ficha por nombre y compara la clave él mismo.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    A["cuerpo JSON<br/>{usuario: 'root', clave: {$ne: null}}"] --> V{"¿esquema zod?<br/>clave: string"}
    V -- "ANTES: sin validar" --> Q1["findOne({usuario: 'root',<br/>clave: {$ne: null}})"]
    Q1 --> R1["MongoDB: «clave distinta de null»<br/>→ devuelve root → 200"]
    V -- "DESPUÉS: no es string" --> R2["400 campos: [clave]<br/>MongoDB ni se consulta"]
    V -- "DESPUÉS: válido" --> Q2["findOne({usuario: {$eq: 'root'}})"]
    Q2 --> H["scrypt + timingSafeEqual<br/>en la aplicación"]
```

**Texto alternativo:** un cuerpo JSON con usuario root y clave igual al objeto {$ne: null} llega a la API. Antes, sin
validar, se construye findOne con usuario root y clave $ne null; MongoDB lo interpreta como «la clave es distinta de
null», devuelve a root y la API responde 200. Después, el esquema zod exige que clave sea un string: si no lo es,
responde 400 indicando el campo clave y MongoDB ni se consulta; si es válido, busca solo por usuario con $eq y la
contraseña se comprueba en la aplicación con scrypt y comparación en tiempo constante.

#### 6. EXPLICACIÓN NIVEL 0

- Una **inyección** ocurre cuando lo que escribe el usuario deja de ser un **dato** y pasa a ser una **orden** para la
  base de datos.
- En MongoDB las consultas son objetos: `{ usuario: 'ana' }` significa «usuario igual a ana». Pero
  `{ clave: { $ne: null } }` significa «clave **distinta de** vacío», y eso lo cumplen todas.
- Si tu API mete en la consulta lo que llega en el JSON **sin mirar qué es**, el atacante puede enviar un objeto en
  lugar de un texto y cambiar el sentido de la búsqueda.
- La defensa es comprobar **qué forma** tiene cada dato antes de usarlo: si esperas un texto, que sea un texto.

#### 7. EXPLICACIÓN INTERMEDIA

- **Vías de entrada de objetos:** `express.json()` convierte `{"clave":{"$ne":null}}` en un objeto. En la URL, el
  parser **extended** (`qs`) convierte `?categoria[$ne]=x` en `{ categoria: { $ne: 'x' } }`. **Express 5** usa el parser
  **simple** por defecto (comprobado: da `{"categoria[$ne]":"x"}`); Express 4 usaba extended.
- **Operadores peligrosos:** `$ne`, `$gt`/`$gte` (`{"$gt": ""}` coincide con cualquier texto), `$regex` (permite
  **extraer** una clave carácter a carácter: «¿empieza por S?»), `$in`, `$exists`, y `$where`/`$function` (ejecutan
  JavaScript en el servidor; desactívalos).
- **Defensa 1, validar el tipo:** un esquema Zod con `z.strictObject` (rechaza campos de más) y `z.string()` con
  límites. Un objeto o un array en lugar de un texto da 400 antes de tocar la base.
- **Defensa 2, `$eq` explícito:** `{ usuario: { $eq: valor } }` compara como dato aunque `valor` fuera un objeto.
  Es la red de seguridad por si algún día alguien se salta la validación.
- **Defensa 3, la clave fuera del filtro:** se busca por usuario y se compara el hash en la aplicación. Además de
  evitar la inyección, obliga a guardar hashes en lugar de contraseñas.
- **Mongoose** aplica casting según el esquema y tiene la opción `sanitizeFilter`, que envuelve en `$eq` los objetos
  con claves `$`; ayuda, pero no sustituye a validar la entrada.

#### 8. EXPLICACIÓN MAESTRA

- **Lista blanca vs lista negra.** *Esquema (lista blanca):* dices qué es válido y todo lo demás se rechaza; cubre
  operadores que aún no existen. *Sanitizar (lista negra):* borrar claves que empiezan por `$` (paquetes tipo
  `express-mongo-sanitize`); útil como capa extra, pero frágil (ver el error común) y además ese paquete concreto
  reescribe `req.query`, que en Express 5 es de solo lectura. *`sanitizeFilter` de Mongoose:* buena red, solo cubre
  filtros de Mongoose.
- **No solo logins.** Cualquier filtro construido con entrada del usuario: búsquedas, ordenaciones (`sort` con objetos
  arbitrarios), proyecciones (`projection` que pide `hash: 1`), y pipelines de agregación (`$lookup` a otra colección).
  Construye esos objetos tú, a partir de valores validados de una lista (`z.enum`).
- **ReDoS.** Aunque no haya inyección, aceptar una regex del usuario para buscar (`$regex: entrada`) permite
  expresiones catastróficas que bloquean el servidor; escapa la entrada o usa índices de texto.
- **Mínimo privilegio en la base de datos.** El usuario de MongoDB del servicio solo con `readWrite` en su base; sin
  `$where` (`security.javascriptEnabled: false`). Si algo se cuela, el daño es menor.
- **Cuándo una validación en el gateway NO basta:** el esquema debe estar en el servicio que construye la consulta;
  un gateway valida contratos generales, no sabe qué campo acaba dentro de un `findOne`.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **express 5.3.0**, **zod 4.6.7**, **mongodb 7.9.1** (driver) y **MongoDB 9.0.8**
(imagen `mongo:9.0.8` del `docker-compose.yml`).

`f127-nosql/datos.js` (conexión y datos de prueba):

```javascript
// Módulo 20 · F127 · Conexión a MongoDB y datos de prueba para las dos versiones (antes y después).
// Requisitos: Node.js 26.13.1 LTS, mongodb (driver) 7.9.1 y MongoDB 9.0.8 del docker-compose.yml del laboratorio.
import { MongoClient } from 'mongodb';
import { scryptSync } from 'node:crypto';

export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017';

export async function conectar(nombreBd = 'tienda_f127') {
  const cliente = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 2000 });
  await cliente.connect();
  return { cliente, db: cliente.db(nombreBd) };
}

export const hashDe = (clave, sal) => scryptSync(clave, sal, 32).toString('hex');

/** Deja la base con 2 usuarios y 3 productos (uno interno que no debería ver nadie). */
export async function sembrar(db) {
  await db.collection('usuarios').deleteMany({});
  await db.collection('productos').deleteMany({});
  await db.collection('usuarios').insertMany([
    // `clave` en texto plano solo existe para la versión vulnerable; la segura usa sal + hash.
    { usuario: 'ana', clave: 'ana123', sal: 'sal-ana', hash: hashDe('ana123', 'sal-ana'), rol: 'cliente' },
    { usuario: 'root', clave: 'S3gura!2026', sal: 'sal-root', hash: hashDe('S3gura!2026', 'sal-root'), rol: 'admin' },
  ]);
  await db.collection('productos').insertMany([
    { sku: '7', nombre: 'Teclado', categoria: 'perifericos' },
    { sku: '8', nombre: 'Mouse', categoria: 'perifericos' },
    { sku: 'X1', nombre: 'Prototipo secreto', categoria: 'interno' },
  ]);
}
```

**Antes (vulnerable)** — `f127-nosql/antes.js`:

```javascript
// Módulo 20 · F127 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Fallos: (1) mete lo que llega del cliente DIRECTAMENTE en el filtro de MongoDB: si en vez de un texto llega un
// objeto como {"$ne": null}, MongoDB lo interpreta como operador; (2) busca por la clave en texto plano;
// (3) activa el parser «extended», que convierte ?categoria[$ne]=x en un objeto.
// Ejecuta (con MongoDB arriba): node f127-nosql/antes.js   (:3127)
import express from 'express';

export function crearApp(db) {
  const app = express();
  app.set('query parser', 'extended'); // (3) el valor por defecto de Express 4; en Express 5 es «simple»
  app.use(express.json());

  app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;
    const encontrado = await db.collection('usuarios').findOne({ usuario, clave }); // (1) (2)
    if (!encontrado) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ bienvenido: encontrado.usuario, rol: encontrado.rol });
  });

  app.get('/productos', async (req, res) => {
    const productos = await db.collection('productos').find({ categoria: req.query.categoria }, {}).toArray(); // (1)
    res.json(productos.map((p) => p.nombre));
  });
  return app;
}

if (import.meta.main) {
  const { conectar, sembrar } = await import('./datos.js');
  const { db } = await conectar();
  await sembrar(db);
  crearApp(db).listen(3127, () => console.log('ANTES (vulnerable) en :3127'));
}
```

**Después (seguro)** — `f127-nosql/despues.js`:

```javascript
// Módulo 20 · F127 · DESPUÉS (seguro): toda entrada se valida con un esquema ANTES de tocar la base de datos, los
// filtros usan $eq explícito, la clave se comprueba con hash en la aplicación y el parser de query es el simple.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, zod 4.6.7 y mongodb 7.9.1.
// Ejecuta (con MongoDB arriba): node f127-nosql/despues.js   (:3227)
import express from 'express';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import * as z from 'zod';

// Esquemas: cada campo es un TEXTO con forma conocida. Un objeto ({"$ne":null}) o un campo extra no pasan.
const Credenciales = z.strictObject({
  usuario: z.string().regex(/^[a-z0-9_.-]{1,64}$/),
  clave: z.string().min(1).max(128),
});
const Consulta = z.strictObject({ categoria: z.enum(['perifericos', 'monitores']) });

/** Middleware genérico: valida `req[parte]` y deja el resultado limpio en req.validado. */
const validar = (esquema, parte) => (req, res, next) => {
  const resultado = esquema.safeParse(req[parte]);
  if (!resultado.success) {
    return res.status(400).json({ error: 'entrada inválida', campos: resultado.error.issues.map((i) => i.path.join('.') || '(raíz)') });
  }
  req.validado = resultado.data;
  next();
};

export function crearApp(db) {
  const app = express();
  // Parser de query por defecto de Express 5 («simple»): ?categoria[$ne]=x NO se convierte en objeto.
  app.use(express.json({ limit: '10kb' }));

  app.post('/login', validar(Credenciales, 'body'), async (req, res) => {
    const { usuario, clave } = req.validado;
    // $eq explícito: aunque alguien se saltara la validación, el valor se compara como dato, no como operador.
    const encontrado = await db.collection('usuarios').findOne({ usuario: { $eq: usuario } }, { projection: { usuario: 1, rol: 1, sal: 1, hash: 1 } });
    // La clave NUNCA forma parte del filtro: se calcula su hash y se compara en tiempo constante.
    const calculado = scryptSync(clave, encontrado?.sal ?? 'sal-inexistente', 32);
    const valido = encontrado != null && timingSafeEqual(calculado, Buffer.from(encontrado.hash, 'hex'));
    if (!valido) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ bienvenido: encontrado.usuario, rol: encontrado.rol });
  });

  app.get('/productos', validar(Consulta, 'query'), async (req, res) => {
    const productos = await db.collection('productos').find({ categoria: { $eq: req.validado.categoria } }, { projection: { _id: 0, nombre: 1 } }).toArray();
    res.json(productos.map((p) => p.nombre));
  });
  return app;
}

if (import.meta.main) {
  const { conectar, sembrar } = await import('./datos.js');
  const { db } = await conectar();
  await sembrar(db);
  crearApp(db).listen(3227, () => console.log('DESPUÉS (seguro) en :3227'));
}
```

#### 10. MINI-LABORATORIO

1. Sin base de datos: comprueba qué filtro le llegaría a MongoDB con cada versión (ver el test de la sección 11) y qué
   responde la versión segura a los ataques. Con una base falsa que no devuelve nada, `despues.js` responde:

```text
{"usuario":"root","clave":{"$ne":null}}     -> 400 {"error":"entrada inválida","campos":["clave"]}
{"usuario":"root","clave":{"$regex":"^S"}}  -> 400 {"error":"entrada inválida","campos":["clave"]}
GET /productos?categoria[$ne]=x             -> 400 {"error":"entrada inválida","campos":["categoria","(raíz)"]}
GET /productos?categoria=interno            -> 400 {"error":"entrada inválida","campos":["categoria"]}
```

   El tercero marca dos problemas: falta `categoria` y sobra la clave literal `categoria[$ne]` (el parser simple no la
   convirtió en objeto y `z.strictObject` rechaza la clave desconocida, que aparece en la raíz).

2. Con MongoDB de verdad. `f127-nosql/ataque.js` siembra la base y ataca las dos versiones: entrar como root sin su
   clave, adivinarla con `$regex` y listar productos ocultos:

```javascript
// Módulo 20 · F127 · El ataque contra MongoDB de verdad: entrar como root sin su clave, adivinarla letra a letra y
// listar productos ocultos. Requisitos: docker compose up -d --wait (MongoDB 9.0.8). Ejecuta: node f127-nosql/ataque.js
import { once } from 'node:events';
import { conectar, sembrar } from './datos.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const { cliente, db } = await conectar();
await sembrar(db);

async function atacar(nombre, app) {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const login = async (cuerpo) => {
    const r = await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
    return `${r.status} ${await r.text()}`;
  };
  console.log(`== ${nombre}`);
  console.log(`   login normal (ana / ana123)                 -> ${await login({ usuario: 'ana', clave: 'ana123' })}`);
  console.log(`   {"usuario":"root","clave":{"$ne":null}}     -> ${await login({ usuario: 'root', clave: { $ne: null } })}`);
  // Extracción a ciegas: ¿la clave de root empieza por…? Cada 200 confirma un carácter más.
  for (const prefijo of ['^A', '^S', '^S3']) {
    console.log(`   {"clave":{"$regex":"${prefijo}"}}`.padEnd(47) + `-> ${(await login({ usuario: 'root', clave: { $regex: prefijo } })).slice(0, 3)}`);
  }
  const productos = async (query) => { const r = await fetch(`${base}/productos?${query}`); return `${r.status} ${await r.text()}`; };
  console.log(`   GET /productos?categoria=perifericos        -> ${await productos('categoria=perifericos')}`);
  console.log(`   GET /productos?categoria[$ne]=x             -> ${await productos('categoria[$ne]=x')}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes(db));
await atacar('DESPUÉS (seguro)', crearDespues(db));
await cliente.close();
```

```bash
docker compose up -d --wait mongo
node f127-nosql/ataque.js
```

   **Output esperado** (las líneas que comprobarías con la verificación del entorno; este paso no se pudo ejecutar en el entorno
   de redacción, sin acceso a Docker Hub, y está anotado en `verificacion/microservicios/pendiente.md`):

```text
== ANTES (vulnerable)
   login normal (ana / ana123)                 -> 200 {"bienvenido":"ana","rol":"cliente"}
   {"usuario":"root","clave":{"$ne":null}}     -> 200 {"bienvenido":"root","rol":"admin"}
   {"clave":{"$regex":"^A"}}                   -> 401
   {"clave":{"$regex":"^S"}}                   -> 200
   {"clave":{"$regex":"^S3"}}                  -> 200
   GET /productos?categoria=perifericos        -> 200 ["Teclado","Mouse"]
   GET /productos?categoria[$ne]=x             -> 200 ["Teclado","Mouse","Prototipo secreto"]
== DESPUÉS (seguro)
   login normal (ana / ana123)                 -> 200 {"bienvenido":"ana","rol":"cliente"}
   {"usuario":"root","clave":{"$ne":null}}     -> 400 {"error":"entrada inválida","campos":["clave"]}
   {"clave":{"$regex":"^A"}}                   -> 400
   {"clave":{"$regex":"^S"}}                   -> 400
   {"clave":{"$regex":"^S3"}}                  -> 400
   GET /productos?categoria=perifericos        -> 200 ["Teclado","Mouse"]
   GET /productos?categoria[$ne]=x             -> 400 {"error":"entrada inválida","campos":["categoria","(raíz)"]}
```

   **Captura comentada:** en la versión vulnerable, el `$regex` funciona como un oráculo: cada 200 confirma un
   carácter más de la clave de root (`S`, `S3`…), así que el atacante la extrae entera sin ver nunca la base. Y la
   consulta con `$ne` devuelve el producto interno. En la versión segura, todo lo que no es un texto con la forma
   esperada se queda en la puerta con 400.

3. Abre `mongosh` (`docker compose exec mongo mongosh tienda_f127`) y ejecuta `db.usuarios.findOne({ usuario: 'root',
   clave: { $ne: null } })`: verás el documento completo de root. Es exactamente la consulta que construyó `antes.js`.

#### 11. VERIFICACIÓN

Test que debes ejecutar (sin base de datos: una colección falsa registra el filtro que recibiría MongoDB):

```javascript
// Módulo 20 · F127 · Tests SIN base de datos: una colección falsa apunta qué filtro recibiría MongoDB.
// Demuestran dónde está el fallo: en «antes» el operador del atacante llega al filtro; en «después» no llega nada.
// Ejecuta: node --test f127-nosql/filtros.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

function baseFalsa() {
  const filtros = [];
  const coleccion = {
    findOne: async (filtro) => { filtros.push(filtro); return null; },
    find: (filtro) => { filtros.push(filtro); return { toArray: async () => [] }; },
  };
  return { filtros, db: { collection: () => coleccion } };
}
async function conApp(crearApp, prueba) {
  const { filtros, db } = baseFalsa();
  const servidor = crearApp(db).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const login = (cuerpo) => fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  try { await prueba({ base, login, filtros }); } finally { servidor.close(); }
}

test('ANTES: el operador {"$ne":null} del atacante llega tal cual al filtro de MongoDB', async () => {
  await conApp(crearAntes, async ({ login, filtros }) => {
    await login({ usuario: 'root', clave: { $ne: null } });
    assert.deepEqual(filtros, [{ usuario: 'root', clave: { $ne: null } }]);
  });
});

test('ANTES: con el parser extended, ?categoria[$ne]=x también llega como operador', async () => {
  await conApp(crearAntes, async ({ base, filtros }) => {
    await fetch(`${base}/productos?categoria[$ne]=x`);
    assert.deepEqual(filtros, [{ categoria: { $ne: 'x' } }]);
  });
});

test('DESPUÉS: un objeto en vez de texto se rechaza con 400 y la base de datos ni se consulta', async () => {
  await conApp(crearDespues, async ({ login, filtros }) => {
    for (const clave of [{ $ne: null }, { $regex: '^S' }, { $gt: '' }, ['a'], 123, null]) {
      const r = await login({ usuario: 'root', clave });
      assert.equal(r.status, 400, JSON.stringify(clave));
      assert.deepEqual((await r.json()).campos, ['clave']);
    }
    assert.equal((await login({ usuario: { $ne: null }, clave: 'x' })).status, 400);
    assert.equal((await login({ usuario: 'root', clave: 'x', rol: 'admin' })).status, 400, 'campos extra tampoco');
    assert.deepEqual(filtros, []);
  });
});

test('DESPUÉS: una entrada válida produce un filtro con $eq y sin la clave', async () => {
  await conApp(crearDespues, async ({ login, filtros }) => {
    assert.equal((await login({ usuario: 'root', clave: 'S3gura!2026' })).status, 401); // la base falsa no tiene usuarios
    assert.deepEqual(filtros, [{ usuario: { $eq: 'root' } }]);
  });
});

test('DESPUÉS: la query solo admite categorías conocidas; los corchetes ya no crean objetos', async () => {
  await conApp(crearDespues, async ({ base, filtros }) => {
    assert.equal((await fetch(`${base}/productos?categoria[$ne]=x`)).status, 400);
    assert.equal((await fetch(`${base}/productos?categoria=interno`)).status, 400);
    assert.equal((await fetch(`${base}/productos?categoria=perifericos`)).status, 200);
    assert.deepEqual(filtros, [{ categoria: { $eq: 'perifericos' } }]);
  });
});
```

```bash
node --test f127-nosql/filtros.test.js
```

Resultado esperado:

```text
✔ ANTES: el operador {"$ne":null} del atacante llega tal cual al filtro de MongoDB
✔ ANTES: con el parser extended, ?categoria[$ne]=x también llega como operador
✔ DESPUÉS: un objeto en vez de texto se rechaza con 400 y la base de datos ni se consulta
✔ DESPUÉS: una entrada válida produce un filtro con $eq y sin la clave
✔ DESPUÉS: la query solo admite categorías conocidas; los corchetes ya no crean objetos
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

Y, con MongoDB arriba, el test de integración `node --test f127-nosql/nosql.integracion.js` (2 tests: el ataque
entra en «antes» y se rechaza en «después»):

```javascript
// Módulo 20 · F127 · Test de integración contra MongoDB 9.0.8 (docker compose up -d --wait).
// Ejecuta: node --test f127-nosql/nosql.integracion.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { conectar, sembrar } from './datos.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

let cliente; let db;
before(async () => { ({ cliente, db } = await conectar('tienda_f127_test')); await sembrar(db); });
after(async () => { await db.dropDatabase(); await cliente.close(); });

async function loginEn(crearApp, cuerpo) {
  const servidor = crearApp(db).listen(0);
  await once(servidor, 'listening');
  const r = await fetch(`http://127.0.0.1:${servidor.address().port}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
  servidor.close();
  return { status: r.status, cuerpo: await r.json() };
}

test('ANTES: {"$ne":null} entra como root sin conocer la clave', async () => {
  const r = await loginEn(crearAntes, { usuario: 'root', clave: { $ne: null } });
  assert.deepEqual(r, { status: 200, cuerpo: { bienvenido: 'root', rol: 'admin' } });
});

test('DESPUÉS: el mismo ataque recibe 400 y la clave correcta sigue entrando', async () => {
  assert.equal((await loginEn(crearDespues, { usuario: 'root', clave: { $ne: null } })).status, 400);
  assert.equal((await loginEn(crearDespues, { usuario: 'root', clave: 'incorrecta' })).status, 401);
  assert.deepEqual(await loginEn(crearDespues, { usuario: 'root', clave: 'S3gura!2026' }), { status: 200, cuerpo: { bienvenido: 'root', rol: 'admin' } });
});
```

**Pregunta de comprobación:** ¿por qué `{ usuario: { $eq: entrada } }` es seguro aunque `entrada` sea `{ "$ne": null }`?
*(Porque `$eq` compara el valor tal cual: busca un usuario cuyo campo sea literalmente el objeto `{ $ne: null }`, que no
existe. El objeto deja de ser un operador.)*

#### 12. ERROR COMÚN

**Síntoma:** «ya sanitizamos la entrada» y aun así el pentest entra con `$ne`. **Causa:** un filtro casero que borra
las claves que empiezan por `$`, pero solo en el **primer nivel** del objeto; el operador va un nivel más abajo
(dentro de `clave`). `f127-nosql/error-comun.js`:

```javascript
// Módulo 20 · F127 · ERROR COMÚN: «limpiar» la entrada borrando los $ con un replace en vez de validar el tipo.
// El filtro casero revisa solo el primer nivel, así que un operador anidado pasa intacto.
// Ejecuta: node f127-nosql/error-comun.js
import * as z from 'zod';

// MAL: lista negra casera, solo mira las claves del primer nivel.
function limpiarMal(cuerpo) {
  const limpio = {};
  for (const [campo, valor] of Object.entries(cuerpo)) if (!campo.startsWith('$')) limpio[campo] = valor;
  return limpio;
}
// BIEN: lista blanca con esquema; lo que no sea exactamente texto se rechaza.
const Credenciales = z.strictObject({ usuario: z.string().max(64), clave: z.string().max(128) });

const ataque = { usuario: 'root', clave: { $ne: null } };
console.log('entrada del atacante :', JSON.stringify(ataque));
console.log('MAL  (lista negra)   :', JSON.stringify(limpiarMal(ataque)), '<- el operador sigue ahí, un nivel más abajo');
const resultado = Credenciales.safeParse(ataque);
console.log('BIEN (esquema zod)   :', resultado.success ? 'aceptada' : `rechazada: ${resultado.error.issues[0].path.join('.')} -> ${resultado.error.issues[0].message}`);
```

Salida real de `node f127-nosql/error-comun.js`:

```text
entrada del atacante : {"usuario":"root","clave":{"$ne":null}}
MAL  (lista negra)   : {"usuario":"root","clave":{"$ne":null}} <- el operador sigue ahí, un nivel más abajo
BIEN (esquema zod)   : rechazada: clave -> Invalid input: expected string, received object
```

**Diagnóstico visual:** registra (en desarrollo) el **filtro final** que se envía a MongoDB, no la entrada. Si en ese
filtro ves un objeto donde esperabas un texto, hay inyección posible. El test `filtros.test.js` hace justo eso.
**Arreglo:** lista blanca con esquema (tipo, longitud, formato, sin campos extra) y `$eq` explícito.

#### 13. PREGUNTA DE ENTREVISTA

**MongoDB no usa SQL. ¿Puede haber inyección? ¿Cómo la previenes en una API Node?**

**Respuesta modelo:** sí. En MongoDB la consulta es un objeto, y si la construyo con lo que me manda el cliente sin
comprobar su tipo, el cliente puede mandar un objeto con operadores en lugar de un valor. El ejemplo clásico es un login
con `{"clave": {"$ne": null}}`, que entra sin conocer la contraseña, y con `$regex` se puede extraer la clave carácter
a carácter. Llega por el cuerpo JSON y por la query string si el parser convierte corchetes en objetos. Lo prevengo en
capas: valido cada entrada con un esquema de lista blanca (Zod con `strictObject`, `z.string()` con límites, `z.enum`
para valores cerrados) antes de tocar la base; construyo los filtros con `$eq` explícito; no meto la contraseña en el
filtro, sino que busco por usuario y comparo el hash en la aplicación; uso el parser de query simple de Express 5;
nunca acepto `$where` ni regex del usuario sin escapar; y el usuario de la base tiene el mínimo privilegio. Y lo pruebo:
un test que comprueba qué filtro llega a la base con entradas maliciosas.

#### 14. ANTI-PATRÓN RELACIONADO

**Pasar el cuerpo o la query enteros como filtro.** Evita el atajo de usar `req.body` o `req.query` directamente como
objeto de consulta «porque los nombres coinciden»: el cliente decide los campos **y** los operadores.

```javascript
// MAL: el cliente controla todo el filtro. ?rol[$ne]=x lista a todos; {"$where": "..."} ejecuta JavaScript.
app.get('/usuarios', async (req, res) => res.json(await db.collection('usuarios').find(req.query).toArray()));

// BIEN: el filtro lo construye el servidor con valores validados (despues.js).
const { categoria } = Consulta.parse(req.query);
await db.collection('productos').find({ categoria: { $eq: categoria } }, { projection: { _id: 0, nombre: 1 } }).toArray();
```

En una revisión de código se ve como un `find(`, `findOne(`, `updateMany(` o `aggregate(` cuyo primer argumento es una
variable que viene de `req` sin pasar por un esquema.

---

### OWASP Top 10

#### 1. UBICACIÓN

Módulo 20, Lección 5 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Fichas 1 a 4 de este módulo (autenticación, cabeceras, inyección).
- Fallbacks y «fallar cerrado» (Módulo 19, ficha 5).
- Logs estructurados en JSON (los profundizarás en el Módulo 21).

#### 3. OBJETIVO DE APRENDIZAJE

**Identificar** las diez categorías del **OWASP Top 10:2025** y **corregir** en una API Express cinco fallos concretos
(A01 control de acceso con IDOR y SSRF, A02 configuración, A09 registro y alertas, A10 manejo de condiciones
excepcionales), con un test por categoría. Lo compruebas cuando `node --test f128-owasp/owasp.test.js` pasa 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja la **lista de comprobación de un inspector de edificios**: diez casillas, ordenadas de lo que más accidentes
causa a lo que menos. En lo alto, «puertas que abren a quien no deben»; luego «instalaciones mal configuradas»,
«materiales de proveedores sin certificar», «cerraduras débiles», «agua que se filtra por donde no debe»… y al final,
nueva este año, «qué pasa cuando se va la luz: ¿las puertas quedan abiertas o cerradas?». El inspector no inventa la
lista: la publica un organismo (OWASP) a partir de miles de inspecciones. Dibuja al inspector recorriendo **tu**
edificio y marcando en rojo cinco casillas.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    subgraph T["OWASP Top 10:2025"]
      A01["A01 Broken Access Control<br/>(incluye SSRF)"]
      A02["A02 Security Misconfiguration"]
      A03["A03 Software Supply Chain Failures"]
      A04["A04 Cryptographic Failures"]
      A05["A05 Injection"]
      A06["A06 Insecure Design"]
      A07["A07 Authentication Failures"]
      A08["A08 Software or Data Integrity Failures"]
      A09["A09 Security Logging and Alerting Failures"]
      A10["A10 Mishandling of Exceptional Conditions"]
    end
    A01 -.-> L1["esta ficha: IDOR + SSRF"]
    A02 -.-> L2["esta ficha: errores sin detalle"]
    A09 -.-> L3["esta ficha: eventos de seguridad"]
    A10 -.-> L4["esta ficha: fallar cerrado"]
    A05 -.-> F4["ficha 4 (NoSQL)"]
    A07 -.-> F12["fichas 1 y 2 (JWT, Passport)"]
    A03 -.-> NPM["npm ci + lockfile + npm audit"]
    A04 -.-> F6["ficha 6 (secretos) y scrypt"]
```

**Texto alternativo:** las diez categorías del OWASP Top 10:2025 en orden: A01 Broken Access Control (que incluye
SSRF), A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06
Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting
Failures y A10 Mishandling of Exceptional Conditions. Con líneas punteadas: esta ficha practica A01 (IDOR y SSRF), A02
(errores sin detalle), A09 (eventos de seguridad) y A10 (fallar cerrado); A05 se trabaja en la ficha 4, A07 en las
fichas 1 y 2, A03 con npm ci, el lockfile y npm audit, y A04 en la ficha 6 y con scrypt.

#### 6. EXPLICACIÓN NIVEL 0

- **OWASP** es una fundación abierta que estudia la seguridad de las aplicaciones web. Su **Top 10** es la lista de los
  diez tipos de fallo más importantes, hecha con datos de miles de aplicaciones y una encuesta a profesionales.
- La edición vigente es la **2025** (la página oficial, top10.owasp.org, dice «The most current released version is
  the OWASP Top 10 2025», consultada el 2026-11-19). Reemplaza a la de 2021.
- No es una lista de ataques, sino de **categorías de errores**: «comprobar mal quién puede ver qué» agrupa cientos de
  bugs distintos.
- Sirve como **idioma común**: cuando alguien dice «A01» todo el equipo sabe de qué se habla, y como lista para
  revisar tu servicio antes de publicarlo.

#### 7. EXPLICACIÓN INTERMEDIA

Las diez categorías de 2025 (nombres oficiales, en inglés) y su relación con 2021, según la introducción oficial
(`https://top10.owasp.org/2025/0x00_2025-Introduction/`):

| 2025 | Categoría | En 2021 | Qué es, en una línea |
|---|---|---|---|
| A01 | Broken Access Control | #1 | Usuarios que hacen o ven lo que no deben. **SSRF se integra aquí.** |
| A02 | Security Misconfiguration | #5 | Valores por defecto, errores con detalles, cabeceras ausentes. |
| A03 | Software Supply Chain Failures | amplía «Vulnerable and Outdated Components» | Dependencias, builds y repositorios comprometidos o sin mantener. |
| A04 | Cryptographic Failures | #2 | Datos sin cifrar, algoritmos débiles, claves mal guardadas. |
| A05 | Injection | #3 | SQL, NoSQL, comandos, XSS: datos que se ejecutan como código. |
| A06 | Insecure Design | #4 | Fallos de diseño que ningún parche de código arregla. |
| A07 | Authentication Failures | #7 (antes «Identification and Authentication Failures») | Logins débiles, sesiones mal gestionadas. |
| A08 | Software or Data Integrity Failures | #8 | Confiar en datos o artefactos sin comprobar su integridad. |
| A09 | Security Logging and Alerting Failures | #9 (antes «…Monitoring…») | Ataques que nadie registra ni nadie ve. |
| A10 | Mishandling of Exceptional Conditions | nueva | Errores mal manejados, lógica que «falla abierta». |

- **IDOR** (Insecure Direct Object Reference, A01): comprobar que el usuario está identificado pero no que el recurso
  `/facturas/2` es **suyo**. Arreglo: el dueño forma parte de la consulta; si no es suyo, 404.
- **SSRF** (A01 en 2025): el servidor descarga una URL que elige el cliente y alcanza servicios internos o el endpoint
  de metadatos de la nube (`169.254.169.254`). Arreglo: lista blanca de hosts, solo `https`, sin seguir redirecciones.
- **A02:** al cliente, mensaje genérico y un id de incidente; el detalle y la pila, al log.
- **A09:** eventos de seguridad estructurados (acceso denegado, destino no permitido, error no controlado) con quién,
  qué y desde dónde, y una alerta sobre su frecuencia.
- **A10:** si la comprobación de permisos lanza una excepción, la respuesta es **negar** (503), nunca conceder.

#### 8. EXPLICACIÓN MAESTRA

- **Qué es y qué no es el Top 10.** Es un documento de **concienciación**, no un estándar verificable. Para requisitos
  comprobables existe el **OWASP ASVS** (Application Security Verification Standard), y para APIs, el **OWASP API
  Security Top 10** (cuya última edición es de 2023), más específico para microservicios (por ejemplo, autorización a
  nivel de objeto y de propiedad).
- **Herramientas por categoría.** *SAST* (análisis del código: Semgrep, CodeQL) detecta inyecciones y patrones
  peligrosos; *DAST* (atacar la aplicación corriendo: OWASP ZAP) encuentra configuración y cabeceras; *SCA* (`npm
  audit`, Snyk, Trivy, Módulo 9) cubre A03; las pruebas de **autorización** (A01) casi siempre son tests propios como
  los de esta ficha, porque una herramienta no sabe qué factura es de quién.
- **A03 en Node.** `npm ci` con `package-lock.json` (versiones exactas y hash de integridad), `npm audit` en CI,
  dependencias mínimas, revisar paquetes nuevos o con un único mantenedor, y `--ignore-scripts` donde no necesites
  scripts de instalación.
- **A10 y resiliencia.** Lo que en el Módulo 19 era «fallback», aquí tiene un límite: para decisiones de seguridad, el
  fallback es denegar. Un `catch` que devuelve `true` o un `default:` que permite son vulnerabilidades.
- **Microservicios multiplican A01.** Cada servicio debe autorizar por sí mismo (no confiar en que «el gateway ya lo
  comprobó»): un atacante que llega a la red interna, o un SSRF, salta el gateway. Es la base del Zero-Trust
  (Módulo 27).
- **Cuándo NO basta con la lista:** el Top 10 cubre lo más frecuente; un análisis de amenazas propio del dominio
  (STRIDE, abuso de la lógica de negocio) encuentra lo que la lista no puede saber.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** y **express 5.3.0**.

`f128-owasp/comun.js` (datos, identificación simulada, servicio de permisos y un servicio interno):

```javascript
// Módulo 20 · F128 · Datos y piezas compartidas por las dos versiones (antes y después).
// La identificación está SIMULADA con tokens fijos para centrar la ficha en el Top 10; la de verdad es F124 y F125.
import http from 'node:http';
import { once } from 'node:events';

export const USUARIOS = { 'token-ana': { id: 'ana', rol: 'cliente' }, 'token-luis': { id: 'luis', rol: 'cliente' } };
export const FACTURAS = { 1: { id: 1, de: 'ana', total: 120_000 }, 2: { id: 2, de: 'luis', total: 990_000 } };

export function identificar(req, res, next) {
  req.usuario = USUARIOS[(req.get('authorization') ?? '').replace('Bearer ', '')];
  if (!req.usuario) return res.status(401).json({ error: 'identifícate' });
  next();
}

/** Servicio de permisos externo. `caido.valor = true` simula que no responde (excepción). */
export const caido = { valor: false };
export async function consultarPermiso(usuario, accion) {
  if (caido.valor) throw new Error('servicio de permisos: ETIMEDOUT');
  return usuario.rol === 'admin' && accion === 'exportar';
}

/** Servicio INTERNO que jamás debería verse desde fuera (como el endpoint de metadatos de una nube). */
export async function arrancarServicioInterno() {
  const servidor = http.createServer((_req, res) => res.end(JSON.stringify({ claveDeAcceso: 'AKIA-INTERNA-NO-PUBLICAR' }))).listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  return { url: `http://127.0.0.1:${servidor.address().port}/credenciales`, cerrar: () => servidor.close() };
}
```

**Antes (vulnerable)** — `f128-owasp/antes.js`:

```javascript
// Módulo 20 · F128 · ANTES (vulnerable): cinco fallos del OWASP Top 10:2025 en una API pequeña.
// NO copies este archivo: existe para atacarlo con ataque.js. Ejecuta: node f128-owasp/antes.js   (:3128)
import express from 'express';
import { consultarPermiso, FACTURAS, identificar } from './comun.js';

export function crearApp() {
  const app = express();
  app.use(express.json());

  // A01 Broken Access Control (IDOR): comprueba QUIÉN eres, pero no si la factura es TUYA.
  app.get('/facturas/:id', identificar, (req, res) => {
    const factura = FACTURAS[req.params.id];
    if (!factura) return res.status(404).json({ error: 'no existe' });
    res.json(factura);
  });

  // A01 (SSRF, que en 2025 forma parte de A01): el servidor descarga CUALQUIER URL que le pidan.
  app.get('/vista-previa', identificar, async (req, res) => {
    const r = await fetch(req.query.url);
    res.type('text/plain').send(await r.text());
  });

  // A10 Mishandling of Exceptional Conditions: si el servicio de permisos falla… se deja pasar («fail open»).
  app.post('/exportar', identificar, async (req, res) => {
    let permitido;
    try { permitido = await consultarPermiso(req.usuario, 'exportar'); } catch { permitido = true; }
    if (!permitido) return res.status(403).json({ error: 'no tienes permiso' });
    res.json({ exportadas: Object.keys(FACTURAS).length });
  });

  // A09 Security Logging and Alerting Failures: un acceso denegado no deja ningún rastro.
  app.get('/admin', identificar, (req, res) => res.status(403).json({ error: 'solo administradores' }));

  app.get('/fallo', () => { throw new Error('conexión a postgres://app:Cl4ve@10.0.0.5/tienda rechazada'); });

  // A02 Security Misconfiguration: el error llega al cliente con mensaje interno y pila de llamadas.
  app.use((error, _req, res, _next) => res.status(500).json({ error: error.message, pila: error.stack.split('\n').slice(0, 3) }));
  return app;
}

if (import.meta.main) crearApp().listen(3128, () => console.log('ANTES (vulnerable) en :3128'));
```

**Después (seguro)** — `f128-owasp/despues.js`:

```javascript
// Módulo 20 · F128 · DESPUÉS (seguro): los mismos cinco puntos del OWASP Top 10:2025, corregidos.
// Requisitos: Node.js 26.13.1 LTS y express 5.3.0. Ejecuta: node f128-owasp/despues.js   (:3228)
import express from 'express';
import { randomUUID } from 'node:crypto';
import { consultarPermiso, FACTURAS, identificar } from './comun.js';

const DESTINOS_PERMITIDOS = new Set(['imagenes.tienda.example']); // lista blanca de hosts para /vista-previa

export function crearApp({ log = console.log, descargar = fetch } = {}) {
  // A09: eventos de seguridad como JSON estructurado; un sistema de alertas cuenta los «acceso_denegado».
  const evento = (tipo, req, extra = {}) => log(JSON.stringify({ tipo, usuario: req.usuario?.id ?? null, ruta: req.path, ip: req.ip, ...extra }));
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // A01: la consulta incluye al dueño. Si no es tuya responde 404 (igual que si no existiera: no revela nada).
  app.get('/facturas/:id', identificar, (req, res) => {
    const factura = FACTURAS[req.params.id];
    if (!factura || factura.de !== req.usuario.id) {
      if (factura) evento('acceso_denegado', req, { recurso: `factura:${factura.id}` });
      return res.status(404).json({ error: 'no existe' });
    }
    res.json(factura);
  });

  // A01 (SSRF): solo https, solo hosts de la lista y sin seguir redirecciones (un 302 podría llevar dentro de la red).
  app.get('/vista-previa', identificar, async (req, res) => {
    let destino;
    try { destino = new URL(String(req.query.url)); } catch { return res.status(400).json({ error: 'url inválida' }); }
    if (destino.protocol !== 'https:' || !DESTINOS_PERMITIDOS.has(destino.hostname)) {
      evento('destino_no_permitido', req, { destino: destino.host });
      return res.status(400).json({ error: 'destino no permitido' });
    }
    const r = await descargar(destino, { redirect: 'error', signal: AbortSignal.timeout(2000) });
    res.type('text/plain').send(await r.text());
  });

  // A10: ante una excepción se NIEGA («fail closed») y se responde 503: el fallo no regala permisos.
  app.post('/exportar', identificar, async (req, res) => {
    let permitido;
    try {
      permitido = await consultarPermiso(req.usuario, 'exportar');
    } catch (error) {
      evento('permisos_no_disponibles', req, { causa: error.message });
      return res.status(503).json({ error: 'no se pudo comprobar el permiso; inténtalo más tarde' });
    }
    if (!permitido) { evento('acceso_denegado', req, { accion: 'exportar' }); return res.status(403).json({ error: 'no tienes permiso' }); }
    res.json({ exportadas: Object.keys(FACTURAS).length });
  });

  app.get('/admin', identificar, (req, res) => { evento('acceso_denegado', req); res.status(403).json({ error: 'solo administradores' }); });

  app.get('/fallo', () => { throw new Error('conexión a postgres://app:Cl4ve@10.0.0.5/tienda rechazada'); });

  // A02: al cliente, un mensaje genérico y un id para soporte; el detalle se queda en el log del servidor.
  app.use((error, req, res, _next) => {
    const incidente = randomUUID();
    evento('error_no_controlado', req, { incidente, detalle: error.message });
    res.status(500).json({ error: 'error interno', incidente });
  });
  return app;
}

if (import.meta.main) crearApp().listen(3228, () => console.log('DESPUÉS (seguro) en :3228'));
```

#### 10. MINI-LABORATORIO

1. `f128-owasp/ataque.js` lanza una prueba por categoría contra las dos versiones (con un servicio interno real
   escuchando en `127.0.0.1` para el SSRF):

```javascript
// Módulo 20 · F128 · El ataque: cinco pruebas, una por categoría, contra las dos versiones.
// Ejecuta: node f128-owasp/ataque.js
import { once } from 'node:events';
import { arrancarServicioInterno, caido } from './comun.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const interno = await arrancarServicioInterno();

async function atacar(nombre, crearApp) {
  const registros = [];
  const servidor = crearApp({ log: (linea) => registros.push(linea) }).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const comoAna = { authorization: 'Bearer token-ana' };
  const pedir = async (ruta, opciones = {}) => {
    const r = await fetch(`${base}${ruta}`, { headers: comoAna, ...opciones });
    const texto = (await r.text()).replace(/"incidente":"[^"]+"/, '"incidente":"<uuid>"').replace(/\(file:[^)]*\)/g, '(file://…)');
    return `${r.status} ${texto.length > 150 ? `${texto.slice(0, 150)}…` : texto}`;
  };
  console.log(`== ${nombre}`);
  console.log(`   A01 Ana pide la factura 2 (de Luis)        -> ${await pedir('/facturas/2')}`);
  console.log(`   A01 SSRF: vista previa del servicio interno -> ${await pedir(`/vista-previa?url=${encodeURIComponent(interno.url)}`)}`);
  console.log(`   A02 respuesta ante un error inesperado      -> ${await pedir('/fallo')}`);
  caido.valor = true;
  console.log(`   A10 exportar con el servicio de permisos caído -> ${await pedir('/exportar', { method: 'POST' })}`);
  caido.valor = false;
  await pedir('/admin');
  const denegados = registros.filter((linea) => linea.includes('acceso_denegado')).length;
  console.log(`   A09 eventos «acceso_denegado» registrados   -> ${denegados}${denegados ? ` (p. ej. ${registros.find((l) => l.includes('acceso_denegado')).replace(/"ip":"[^"]+"/, '"ip":"<ip>"')})` : ' (nadie se entera del intento)'}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes);
await atacar('DESPUÉS (seguro)', crearDespues);
interno.cerrar();
```

```bash
node f128-owasp/ataque.js
```

   **Output esperado** (la línea A02 de «antes» se corta a 150 caracteres):

```text
== ANTES (vulnerable)
   A01 Ana pide la factura 2 (de Luis)        -> 200 {"id":2,"de":"luis","total":990000}
   A01 SSRF: vista previa del servicio interno -> 200 {"claveDeAcceso":"AKIA-INTERNA-NO-PUBLICAR"}
   A02 respuesta ante un error inesperado      -> 500 {"error":"conexión a postgres://app:Cl4ve@10.0.0.5/tienda rechazada","pila":["Error: conexión a postgres://app:Cl4ve@10.0.0.5/tienda rechazada","    a…
   A10 exportar con el servicio de permisos caído -> 200 {"exportadas":2}
   A09 eventos «acceso_denegado» registrados   -> 0 (nadie se entera del intento)
== DESPUÉS (seguro)
   A01 Ana pide la factura 2 (de Luis)        -> 404 {"error":"no existe"}
   A01 SSRF: vista previa del servicio interno -> 400 {"error":"destino no permitido"}
   A02 respuesta ante un error inesperado      -> 500 {"error":"error interno","incidente":"<uuid>"}
   A10 exportar con el servicio de permisos caído -> 503 {"error":"no se pudo comprobar el permiso; inténtalo más tarde"}
   A09 eventos «acceso_denegado» registrados   -> 2 (p. ej. {"tipo":"acceso_denegado","usuario":"ana","ruta":"/facturas/2","ip":"<ip>","recurso":"factura:2"})
```

   **Captura comentada:** cinco filas, cinco fallos y cinco arreglos. A01: Ana lee la factura de Luis; después, 404
   (ni siquiera confirma que exista). SSRF: la API vulnerable entrega la credencial del servicio interno; la segura
   rechaza el destino. A02: el error con la cadena de conexión y la pila llega al cliente; después, solo un id. A10:
   con el servicio de permisos caído, la vulnerable **concede**; la segura responde 503. A09: cero rastros frente a
   dos eventos JSON con usuario, ruta, IP y recurso.

2. Supply chain (A03) en tu propio laboratorio:

```bash
npm ci --no-audit && npm audit --omit=dev
```

   **Output esperado** (el 2026-11-19, con el `package-lock.json` del laboratorio): `found 0 vulnerabilities`. Si un
   día sale algo, `npm audit` dice qué paquete, por qué cadena llega y si hay arreglo.

#### 11. VERIFICACIÓN

Test que debes ejecutar (un test por categoría corregida):

```javascript
// Módulo 20 · F128 · Un test por categoría corregida. Ejecuta: node --test f128-owasp/owasp.test.js
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { caido } from './comun.js';
import { crearApp } from './despues.js';

let servidor; let base; const registros = []; const descargas = [];
before(async () => {
  const descargar = async (url) => { descargas.push(String(url)); return new Response('imagen'); };
  servidor = crearApp({ log: (linea) => registros.push(JSON.parse(linea)), descargar }).listen(0);
  await once(servidor, 'listening');
  base = `http://127.0.0.1:${servidor.address().port}`;
});
beforeEach(() => { registros.length = 0; descargas.length = 0; caido.valor = false; });
after(() => servidor.close());
const comoAna = { headers: { authorization: 'Bearer token-ana' } };

test('A01: Ana ve su factura y recibe 404 con la de Luis (y queda registrado)', async () => {
  assert.equal((await fetch(`${base}/facturas/1`, comoAna)).status, 200);
  const ajena = await fetch(`${base}/facturas/2`, comoAna);
  assert.equal(ajena.status, 404);
  assert.deepEqual(await ajena.json(), { error: 'no existe' });
  assert.equal(registros[0].tipo, 'acceso_denegado');
  assert.equal(registros[0].recurso, 'factura:2');
});

test('A01 (SSRF): solo se descarga de hosts permitidos por https', async () => {
  const destinos = ['http://127.0.0.1:9000/credenciales', 'http://169.254.169.254/latest/meta-data/', 'https://sitio-malo.example/x', 'http://imagenes.tienda.example/a.png', 'file:///etc/passwd', 'no-es-una-url'];
  for (const destino of destinos) {
    assert.equal((await fetch(`${base}/vista-previa?url=${encodeURIComponent(destino)}`, comoAna)).status, 400, destino);
  }
  assert.deepEqual(descargas, [], 'ninguna de esas URL llega a descargarse');
  assert.equal((await fetch(`${base}/vista-previa?url=${encodeURIComponent('https://imagenes.tienda.example/a.png')}`, comoAna)).status, 200);
  assert.deepEqual(descargas, ['https://imagenes.tienda.example/a.png']);
});

test('A02: un error inesperado no filtra el mensaje interno ni la pila', async () => {
  const r = await fetch(`${base}/fallo`);
  const texto = await r.text();
  assert.equal(r.status, 500);
  assert.doesNotMatch(texto, /postgres|Cl4ve|at file/);
  assert.equal(r.headers.get('x-powered-by'), null);
  assert.equal(JSON.parse(texto).incidente, registros[0].incidente, 'el id del cliente permite encontrar el detalle en el log');
  assert.match(registros[0].detalle, /postgres/);
});

test('A10: si el servicio de permisos falla, se niega (503), no se concede', async () => {
  caido.valor = true;
  assert.equal((await fetch(`${base}/exportar`, { method: 'POST', ...comoAna })).status, 503);
  assert.equal(registros[0].tipo, 'permisos_no_disponibles');
  caido.valor = false;
  assert.equal((await fetch(`${base}/exportar`, { method: 'POST', ...comoAna })).status, 403);
});

test('A09: cada acceso denegado deja un evento con usuario, ruta e ip', async () => {
  await fetch(`${base}/admin`, comoAna);
  assert.deepEqual(Object.keys(registros[0]), ['tipo', 'usuario', 'ruta', 'ip']);
  assert.deepEqual([registros[0].tipo, registros[0].usuario, registros[0].ruta], ['acceso_denegado', 'ana', '/admin']);
});
```

```bash
node --test f128-owasp/owasp.test.js
```

Resultado esperado:

```text
✔ A01: Ana ve su factura y recibe 404 con la de Luis (y queda registrado)
✔ A01 (SSRF): solo se descarga de hosts permitidos por https
✔ A02: un error inesperado no filtra el mensaje interno ni la pila
✔ A10: si el servicio de permisos falla, se niega (503), no se concede
✔ A09: cada acceso denegado deja un evento con usuario, ruta e ip
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

**Pregunta de comprobación:** ¿en qué categoría de 2025 está SSRF, que en 2021 tenía la suya propia (A10:2021)? *(En
A01 Broken Access Control: el servidor accede a un recurso al que el cliente no debería llegar.)*

#### 12. ERROR COMÚN

**Síntoma:** el pentest encuentra que un cliente lee pedidos ajenos cambiando el número en la URL, aunque «todas las
rutas tienen autenticación». **Causa:** confundir autenticación con autorización. El middleware comprueba que hay un
usuario válido; nadie comprueba que el recurso es **suyo**. Es el fallo A01 de `antes.js`:

```javascript
// Autenticado: sí. Autorizado para ESTA factura: nadie lo mira.
app.get('/facturas/:id', identificar, (req, res) => res.json(FACTURAS[req.params.id]));
```

**Diagnóstico visual:** en los logs de acceso, un mismo usuario pidiendo ids **consecutivos** (`/facturas/1`, `/2`,
`/3`…) en pocos segundos; y en una revisión, cualquier handler que busque por un id de la URL sin incluir al usuario en
la condición. La salida del paso 1 (`-> 200 {"id":2,"de":"luis",…}` para Ana) es exactamente ese fallo. **Arreglo:**
la condición incluye al dueño (`factura.de === req.usuario.id`), se responde 404 y se registra el intento; y un test
por endpoint que pruebe con el usuario equivocado (el primero de `owasp.test.js`).

#### 13. PREGUNTA DE ENTREVISTA

**¿Qué cambió en el OWASP Top 10:2025 respecto a 2021 y cómo lo aplicas a un microservicio Node?**

**Respuesta modelo:** A01 Broken Access Control sigue primero y ahora incluye SSRF; Security Misconfiguration sube al
segundo puesto; aparece A03 Software Supply Chain Failures, que amplía la categoría de componentes vulnerables a todo
el ecosistema (dependencias, builds, distribución); Cryptographic Failures baja al cuarto e Injection al quinto;
Authentication Failures y Security Logging and Alerting Failures cambian de nombre (este último pone el acento en
alertar, no solo en registrar), y hay una categoría nueva, A10 Mishandling of Exceptional Conditions, sobre errores mal
manejados y lógica que falla abierta. En un servicio Node lo aplico así: autorización por objeto en cada servicio, no
solo en el gateway, con tests que usan el usuario equivocado; lista blanca de destinos para cualquier petición saliente
con URL del usuario; Helmet y errores genéricos con id de incidente; `npm ci` con lockfile y `npm audit` en CI;
validación de entrada con esquemas; eventos de seguridad estructurados con alertas; y en cualquier `catch` de una
decisión de seguridad, denegar. El Top 10 es concienciación; para verificar uso ASVS y el API Security Top 10.

#### 14. ANTI-PATRÓN RELACIONADO

**«El gateway ya lo comprobó».** Evita los microservicios internos que confían en cualquier petición porque «solo les
llega tráfico del gateway»: no autentican, no autorizan por objeto y aceptan cabeceras como `x-user-id` sin verificar.
Un SSRF en cualquier servicio, un pod comprometido o un error de red convierten toda la red interna en pública.

```javascript
// MAL: servicio interno que cree lo que le digan.
app.get('/facturas/:id', (req, res) => res.json(buscar(req.params.id, req.get('x-user-id'))));

// BIEN: verifica el token propagado (ficha 1) y autoriza por objeto, aunque venga del gateway (despues.js).
app.get('/facturas/:id', autenticar(clavesPublicas), (req, res) => { /* factura.de === req.usuario.sub */ });
```

En un diagrama se ve como un candado solo en la puerta exterior del edificio y todas las puertas interiores abiertas.

---

### Secretos: AWS Secrets Manager, Vault, Azure Key Vault

#### 1. UBICACIÓN

Módulo 20, Lección 6 de 6 · Fase 2.

#### 2. PRERREQUISITOS

- Variables de entorno y por qué no se suben a Git (Módulo 0.4).
- Configuración centralizada (Módulo 17).
- Docker Compose (Módulo 0.5) para los emuladores.

#### 3. OBJETIVO DE APRENDIZAJE

**Leer** un secreto desde AWS Secrets Manager, HashiCorp Vault y Azure Key Vault con una interfaz común, **cachearlo**
con caducidad y **recargarlo** tras una rotación sin reiniciar el servicio, y **explicar** qué cambia entre los
emuladores locales y la nube real. Lo compruebas cuando `node --test f129-secretos/secretos.test.js` pasa 6 de 6 (y,
con Docker, `secretos.integracion.js` 3 de 3).

#### 4. ANALOGÍA VISUAL

Dibuja un **hotel**. **Antes:** la llave maestra está pegada con cinta debajo del mostrador (el código), hay una
fotocopia en el tablón de anuncios (el log) y cualquiera que pregunte en recepción por «la configuración» se la lleva
(el endpoint de debug). Cuando el hotel cambia las cerraduras, nadie puede entrar hasta que alguien reimprime las
llaves (redespliegue). **Después:** las llaves están en una **caja fuerte con registro** (el gestor de secretos). Cada
empleado se identifica con su **credencial de empleado** (la identidad del servicio), saca la llave al empezar el
turno y la devuelve cada cierto tiempo; la caja anota quién sacó qué. Cuando se cambian las cerraduras, la caja ya
tiene las llaves nuevas: el empleado que nota que su llave no abre vuelve a la caja y se lleva la nueva.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    S["servicio pedidos"] -- "1 · identidad<br/>(rol IAM / identidad administrada / AppRole)" --> G{"gestor de secretos"}
    G --> AWS["AWS Secrets Manager<br/>GetSecretValue (AWSCURRENT)"]
    G --> V["HashiCorp Vault<br/>KV v2: secret/data/tienda/bd"]
    G --> AZ["Azure Key Vault<br/>GET /secrets/tienda-bd"]
    G -- "2 · valor + versión" --> C["caché en memoria<br/>TTL 5 min"]
    C -- "3 · credenciales" --> BD[("base de datos")]
    BD -. "4 · 'password authentication failed'<br/>(clave rotada)" .-> R["obtener(nombre, forzar: true)"]
    R -.-> G
```

**Texto alternativo:** el servicio pedidos se identifica ante el gestor de secretos con su identidad (rol IAM,
identidad administrada o AppRole). El gestor puede ser AWS Secrets Manager con GetSecretValue de la versión AWSCURRENT,
HashiCorp Vault con el motor KV versión 2 en la ruta secret/data/tienda/bd, o Azure Key Vault con GET
/secrets/tienda-bd. El gestor devuelve valor y versión, que se guardan en una caché en memoria de 5 minutos, y la caché
entrega las credenciales a la base de datos. Con líneas punteadas: si la base responde que la autenticación falló
porque la clave se rotó, el servicio llama a obtener con forzar true y vuelve al gestor por la versión nueva.

#### 6. EXPLICACIÓN NIVEL 0

- Un **secreto** es cualquier dato que da acceso: la contraseña de la base de datos, la clave de una API de pagos, la
  clave privada que firma los JWT.
- Escribirlo en el código es un error grave: el código se copia, se sube a Git y se comparte; **todo** el que vea el
  repositorio, hoy o dentro de cinco años, tiene la clave.
- Un **gestor de secretos** es una caja fuerte en la nube (o en tu centro de datos): guarda los secretos cifrados,
  decide **quién** puede leer cada uno, apunta cada lectura y permite **cambiarlos** (rotarlos) sin tocar el código.
- Tu servicio, al arrancar, se identifica ante la caja fuerte y pide el secreto. Nunca lo escribe en un log ni lo
  devuelve en una respuesta.

#### 7. EXPLICACIÓN INTERMEDIA

- **AWS Secrets Manager.** Cliente `SecretsManagerClient` del SDK v3 y `GetSecretValueCommand({ SecretId })`; el valor
  llega en `SecretString` (aquí un JSON) y la versión en `VersionId`. Las versiones tienen etiquetas (`AWSCURRENT`,
  `AWSPREVIOUS`, `AWSPENDING`) que usa la rotación automática. Crear: `CreateSecretCommand`; nueva versión:
  `PutSecretValueCommand`.
- **HashiCorp Vault.** Servidor propio (o HCP Vault). El motor **KV v2** guarda versiones; con `node-vault` lees
  `secret/data/<ruta>` y el valor está en `data.data` (y la versión en `data.metadata.version`). Además de secretos
  estáticos, Vault puede generar **credenciales dinámicas** de base de datos que caducan solas.
- **Azure Key Vault.** `SecretClient` de `@azure/keyvault-secrets` con una credencial de `@azure/identity`
  (`DefaultAzureCredential` prueba identidad administrada, variables de entorno, Azure CLI…). Los nombres solo admiten
  letras, números y guiones (`tienda-bd`). `getSecret` devuelve `value` y `properties.version`.
- **Interfaz común.** `leer(nombre) → { valor, version }`: el código de negocio no sabe qué gestor hay detrás; se elige
  por configuración (`SECRETOS=aws|vault|azure`).
- **Caché con TTL.** Llamar al gestor en cada petición cuesta latencia y dinero (Secrets Manager cobra por llamada a
  la API) y te deja sin servicio si el gestor falla. Se cachea unos minutos y se **fuerza** la recarga cuando la base
  rechaza la clave.
- **Emuladores locales** (`docker-compose.yml`): **Floci** (`floci/floci:2.2.0`, el mismo del compose de la raíz del
  repositorio) emula Secrets Manager en `:4566` y acepta credenciales `test/test`; **Floci-Az** (`floci/floci-az:0.14.0`)
  emula Key Vault en `http://localhost:4577/<cuenta>-keyvault` por HTTP; **Vault 2.2.0** en **modo dev** (en memoria,
  sin TLS, token `root`). Según su documentación, el SDK de Key Vault exige una URL `https` y un token, así que en
  local se le da un token de mentira y una política que reescribe la URL a `http` (`clienteAzure` en `secretos.js`).

**Qué cambia en la nube real** (lo que hace el código con `emulador`/`endpoint` y lo que no debe llegar a producción):

| | Emulador local (este laboratorio) | Nube real |
|---|---|---|
| AWS Secrets Manager | `endpoint: http://localhost:4566`, credenciales `test/test` | Sin `endpoint` ni credenciales: el SDK usa el **rol IAM** de la tarea ECS, el pod de EKS (IRSA o Pod Identity) o la Lambda. Política IAM con `secretsmanager:GetSecretValue` solo sobre ese ARN. Cifrado con KMS, rotación automática con una Lambda, coste por secreto y por cada 10 000 llamadas. |
| HashiCorp Vault | Modo dev: en memoria, HTTP, token `root`, se borra al reiniciar | Clúster con almacenamiento persistente (Raft), **TLS**, *unseal* (manual o automático con KMS), auditoría activada; el servicio se autentica con **AppRole** o con su cuenta de servicio de **Kubernetes** y recibe un token corto con una política de solo lectura sobre su ruta. Nunca el token root. |
| Azure Key Vault | `http://localhost:4577/devstoreaccount1-keyvault`, token falso, cliente HTTP que cambia a `http` solo en el último eslabón | `https://<tu-vault>.vault.azure.net` y `DefaultAzureCredential` con **identidad administrada**; permisos con Azure RBAC (rol *Key Vault Secrets User*), soft-delete y protección de purga, red privada (Private Endpoint). Sin ese cliente HTTP ni `disableChallengeResourceVerification`. |

#### 8. EXPLICACIÓN MAESTRA

- **¿Cuál elegir?** *AWS Secrets Manager:* cero operación si estás en AWS, rotación integrada para RDS, integración con
  IAM; te ata a AWS y cobra por secreto. *Azure Key Vault:* lo mismo en Azure, y además guarda claves y certificados
  con HSM. *Vault:* multi-nube y on-premise, credenciales **dinámicas** (cada pod recibe su propio usuario de base de
  datos que caduca), cifrado como servicio (motor Transit); a cambio, lo operas tú (alta disponibilidad, unseal,
  actualizaciones) o pagas HCP. Alternativas más simples: *Kubernetes Secrets* (Base64 en etcd: cifra etcd en reposo y
  limita RBAC), *SSM Parameter Store* (más barato, menos funciones) o *External Secrets Operator*, que sincroniza
  cualquiera de los gestores con Secrets de Kubernetes.
- **El problema del secreto cero.** Para pedir un secreto necesitas una credencial… que también es un secreto. La
  salida es la **identidad de la plataforma**: rol IAM, identidad administrada, cuenta de servicio de Kubernetes. La
  plataforma la entrega, rota y revoca; tu código no guarda nada.
- **Leer al arrancar vs inyectar vs leer en caliente.** *Variable de entorno inyectada por la plataforma* (ECS,
  Kubernetes): simple, pero solo cambia al reiniciar y aparece en `/proc/<pid>/environ` y en volcados. *Archivo montado*
  (Vault Agent, CSI driver): se actualiza solo. *SDK en el código con caché* (esta ficha): recarga sin reinicio, a
  cambio de depender del gestor y de su SDK.
- **Rotación sin cortes.** Durante la rotación conviven dos claves válidas (la base acepta la vieja y la nueva un rato;
  Secrets Manager usa `AWSPENDING` → `AWSCURRENT`). El servicio que recibe un error de autenticación recarga **una vez**
  y reintenta; si vuelve a fallar, no insiste (alerta).
- **Fugas típicas además del código:** logs (incluido el log de errores del driver, que a veces imprime la cadena de
  conexión), endpoints de diagnóstico, variables en la salida de CI, capas de imágenes Docker (`ENV` y `COPY.env`),
  historial de Git. Herramientas como gitleaks o el *push protection* de GitHub detectan secretos antes de que entren.
- **Cuándo NO usar un gestor externo:** un proyecto personal sin nube puede vivir con `--env-file` (Node 26) fuera del
  repositorio; lo que nunca es aceptable es el secreto dentro del código.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **@aws-sdk/client-secrets-manager 3.1173.0**, **node-vault 0.13.0**,
**@azure/keyvault-secrets 4.12.0**, **@azure/identity 4.14.1** y **express 5.3.0**; emuladores **Floci 2.2.0**,
**Floci-Az 0.14.0** y **Vault 2.2.0**.

`f129-secretos/comun.js` (una base de datos simulada que exige la clave vigente):

```javascript
// Módulo 20 · F129 · Piezas compartidas: una «base de datos» simulada que exige la clave vigente, y el nombre del secreto.
// (La base es falsa a propósito: la ficha trata de DÓNDE vive la clave, no de PostgreSQL.)
export const SECRETO_BD = 'tienda/bd'; // nombre lógico; cada proveedor lo traduce a su formato

export class ErrorDeAutenticacion extends Error {}

export function crearBaseDeDatos(claveInicial) {
  const estado = { clave: claveInicial };
  return {
    /** Lo que haría el DBA al rotar la clave. */
    rotar: (nueva) => { estado.clave = nueva; },
    consultar: (credenciales) => {
      if (credenciales.usuario !== 'app' || credenciales.clave !== estado.clave) throw new ErrorDeAutenticacion('password authentication failed for user "app"');
      return [{ pedido: 1, total: 120_000 }];
    },
  };
}
```

`f129-secretos/secretos.js` (los tres proveedores y la caché):

```javascript
// Módulo 20 · F129 · Secretos: una interfaz común y tres proveedores (AWS Secrets Manager, HashiCorp Vault y
// Azure Key Vault), más una caché con caducidad para no llamar al gestor en cada petición.
// Requisitos: Node.js 26.13.1 LTS, @aws-sdk/client-secrets-manager 3.1173.0, node-vault 0.13.0,
// @azure/keyvault-secrets 4.12.0 y @azure/identity 4.14.1 (package.json del laboratorio).
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { createDefaultHttpClient } from '@azure/core-rest-pipeline';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import vault from 'node-vault';

// Todos los proveedores cumplen el mismo contrato:  leer(nombre) -> { valor: objeto, version: string }

/**
 * AWS Secrets Manager. Con `endpoint` apunta al emulador local (Floci, :4566) con credenciales de mentira.
 * En la nube real NO pases endpoint ni credenciales: el SDK usa el rol IAM de la tarea o del pod.
 */
export function proveedorAws({ endpoint = process.env.AWS_ENDPOINT_URL, region = process.env.AWS_REGION ?? 'us-east-1' } = {}) {
  const local = endpoint ? { endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } } : {};
  const cliente = new SecretsManagerClient({ region, ...local });
  return {
    nombre: 'aws',
    async leer(nombre) {
      const r = await cliente.send(new GetSecretValueCommand({ SecretId: nombre })); // por defecto, la versión AWSCURRENT
      return { valor: JSON.parse(r.SecretString), version: r.VersionId };
    },
  };
}

/**
 * HashiCorp Vault, motor KV versión 2 montado en `secret/`. En local: servidor en modo dev y token «root».
 * En producción: TLS, y el token se obtiene con AppRole o con la identidad del pod (auth de Kubernetes), nunca fijo.
 */
export function proveedorVault({ endpoint = process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200', token = process.env.VAULT_TOKEN } = {}) {
  const cliente = vault({ apiVersion: 'v1', endpoint, token });
  return {
    nombre: 'vault',
    async leer(nombre) {
      const r = await cliente.read(`secret/data/${nombre}`); // KV v2: la ruta lleva «data/» y la respuesta viene en data.data
      return { valor: r.data.data, version: String(r.data.metadata.version) };
    },
  };
}

/**
 * Azure Key Vault. Los nombres solo admiten letras, números y guiones: «tienda/bd» se guarda como «tienda-bd».
 * En local (Floci-Az, :4577) el SDK exige una URL https y un token: se le da un token de mentira y una política
 * que reescribe la petición a http. En Azure real: https://<tu-vault>.vault.azure.net y DefaultAzureCredential
 * (identidad administrada), sin nada de eso.
 */
export function clienteAzure({ url = process.env.AZURE_KEYVAULT_URL, emulador = process.env.AZURE_EMULADOR === 'si' } = {}) {
  if (!emulador) return new SecretClient(url, new DefaultAzureCredential());
  const credencialLocal = { getToken: async () => ({ token: 'token-local', expiresOnTimestamp: Date.now() + 3_600_000 }) };
  // El SDK solo acepta URLs https: su política de «challenge» (401 + WWW-Authenticate) comprueba el esquema
  // DESPUÉS de las políticas añadidas, así que una política no basta. El cambio a http se hace en el
  // cliente HTTP, el último eslabón, justo antes de salir a la red. Solo para el emulador local.
  const red = createDefaultHttpClient();
  const httpClient = {
    // Una copia: el SDK reutiliza la misma petición tras el 401 y debe seguir viendo https.
    sendRequest(peticion) {
      return red.sendRequest({ ...peticion, url: peticion.url.replace(/^https:/, 'http:'), allowInsecureConnection: true });
    },
  };
  return new SecretClient(url.replace(/^http:/, 'https:'), credencialLocal, {
    disableChallengeResourceVerification: true,
    httpClient,
  });
}

export function proveedorAzure(opciones) {
  const cliente = clienteAzure(opciones);
  return {
    nombre: 'azure',
    async leer(nombre) {
      const r = await cliente.getSecret(nombre.replaceAll('/', '-'));
      return { valor: JSON.parse(r.value), version: r.properties.version };
    },
  };
}

/** Elige proveedor por variable de entorno: el código de negocio no sabe cuál hay detrás. */
export function proveedorDesdeEntorno(nombre = process.env.SECRETOS ?? 'aws') {
  const fabricas = { aws: proveedorAws, vault: proveedorVault, azure: proveedorAzure };
  if (!fabricas[nombre]) throw new Error(`SECRETOS debe ser aws, vault o azure (recibido: ${nombre})`);
  return fabricas[nombre]();
}

/**
 * Caché con caducidad: guarda cada secreto `ttlMs` y después lo vuelve a pedir, así una rotación se recoge sola.
 * `obtener(nombre, { forzar: true })` salta la caché (para cuando la base de datos rechaza la clave guardada).
 */
export class SecretosConCache {
  #proveedor; #ttlMs; #ahora; #guardados = new Map();
  constructor(proveedor, { ttlMs = 300_000, ahora = Date.now } = {}) {
    this.#proveedor = proveedor; this.#ttlMs = ttlMs; this.#ahora = ahora;
  }

  async obtener(nombre, { forzar = false } = {}) {
    const guardado = this.#guardados.get(nombre);
    if (!forzar && guardado && this.#ahora() - guardado.leido < this.#ttlMs) return guardado.valor;
    const { valor, version } = await this.#proveedor.leer(nombre);
    this.#guardados.set(nombre, { valor, version, leido: this.#ahora() });
    return valor;
  }

  /** Para un endpoint de salud: qué hay en caché, SIN los valores. */
  estado() {
    return [...this.#guardados].map(([nombre, g]) => ({ nombre, proveedor: this.#proveedor.nombre, version: g.version, edadS: Math.round((this.#ahora() - g.leido) / 1000) }));
  }
}
```

**Antes (vulnerable)** — `f129-secretos/antes.js`:

```javascript
// Módulo 20 · F129 · ANTES (vulnerable). NO copies este archivo: existe para compararlo con despues.js.
// Fallos: (1) la clave de la base de datos está escrita en el código (y por tanto en Git, para siempre);
// (2) se imprime en el log al arrancar; (3) un endpoint de «debug» la devuelve junto con todo process.env;
// (4) si el DBA rota la clave, hay que cambiar el código y desplegar. Ejecuta: node f129-secretos/antes.js   (:3129)
import express from 'express';

const BD = { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' }; // (1)

export function crearApp(baseDeDatos, { log = console.log } = {}) {
  log(`conectando a la base de datos con ${JSON.stringify(BD)}`); // (2)
  const app = express();
  app.get('/pedidos', (_req, res) => {
    try { res.json(baseDeDatos.consultar(BD)); } catch (error) { res.status(500).json({ error: error.message }); } // (4)
  });
  app.get('/debug/config', (_req, res) => res.json({ bd: BD, entorno: process.env })); // (3)
  return app;
}

if (import.meta.main) {
  const { crearBaseDeDatos } = await import('./comun.js');
  crearApp(crearBaseDeDatos('Cl4ve-Pr0d-2026')).listen(3129, () => console.log('ANTES (vulnerable) en :3129'));
}
```

**Después (seguro)** — `f129-secretos/despues.js`:

```javascript
// Módulo 20 · F129 · DESPUÉS (seguro): la clave vive en un gestor de secretos; el servicio la pide al arrancar con su
// identidad, la guarda 5 minutos en memoria, nunca la escribe en logs ni respuestas y sobrevive a una rotación.
// Requisitos: Node.js 26.13.1 LTS y los emuladores del docker-compose.yml (o la nube real).
// Ejecuta: SECRETOS=aws AWS_ENDPOINT_URL=http://127.0.0.1:4566 node f129-secretos/despues.js   (:3229)
import express from 'express';
import { ErrorDeAutenticacion, SECRETO_BD } from './comun.js';

export async function crearApp(baseDeDatos, secretos, { log = console.log } = {}) {
  await secretos.obtener(SECRETO_BD); // falla al ARRANCAR si no hay acceso al secreto (mejor que en la primera petición)
  log(`secreto ${SECRETO_BD} cargado (${JSON.stringify(secretos.estado()[0])})`); // nombre y versión; jamás el valor

  const app = express();
  app.disable('x-powered-by');

  app.get('/pedidos', async (_req, res) => {
    try {
      res.json(baseDeDatos.consultar(await secretos.obtener(SECRETO_BD)));
    } catch (error) {
      if (!(error instanceof ErrorDeAutenticacion)) throw error;
      // ¿La base rechazó la clave? Quizá la rotaron: pide la versión nueva UNA vez y reintenta.
      log(`la base de datos rechazó la clave en caché; recargando ${SECRETO_BD}`);
      res.json(baseDeDatos.consultar(await secretos.obtener(SECRETO_BD, { forzar: true })));
    }
  });

  app.get('/salud/secretos', (_req, res) => res.json(secretos.estado())); // metadatos, sin valores
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'error interno' })); // nunca el detalle
  return app;
}

if (import.meta.main) {
  const { crearBaseDeDatos } = await import('./comun.js');
  const { proveedorDesdeEntorno, SecretosConCache } = await import('./secretos.js');
  const secretos = new SecretosConCache(proveedorDesdeEntorno());
  const app = await crearApp(crearBaseDeDatos((await secretos.obtener(SECRETO_BD)).clave), secretos);
  app.listen(3229, () => console.log(`DESPUÉS (seguro) en :3229 con SECRETOS=${process.env.SECRETOS ?? 'aws'}`));
}
```

`f129-secretos/sembrar.js` (guarda o rota el secreto en los tres emuladores):

```javascript
// Módulo 20 · F129 · Guarda (o rota) el secreto «tienda/bd» en los tres gestores locales del docker-compose.yml:
// Floci (AWS Secrets Manager, :4566), Vault en modo dev (:8200) y Floci-Az (Azure Key Vault, :4577).
// Ejecuta: node f129-secretos/sembrar.js [clave]        (clave por defecto: Cl4ve-Pr0d-2026)
import { CreateSecretCommand, PutSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import vault from 'node-vault';
import { clienteAzure } from './secretos.js';

export const LOCAL = {
  aws: process.env.AWS_ENDPOINT_URL ?? 'http://127.0.0.1:4566',
  vault: process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200',
  vaultToken: process.env.VAULT_TOKEN ?? 'root',
  azure: process.env.AZURE_KEYVAULT_URL ?? 'http://127.0.0.1:4577/devstoreaccount1-keyvault',
};

export async function sembrar(clave = 'Cl4ve-Pr0d-2026') {
  const valor = { usuario: 'app', clave };
  const texto = JSON.stringify(valor);

  // AWS: CreateSecret la primera vez; PutSecretValue crea una versión nueva (la rotación).
  const aws = new SecretsManagerClient({ region: 'us-east-1', endpoint: LOCAL.aws, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });
  try {
    await aws.send(new CreateSecretCommand({ Name: 'tienda/bd', SecretString: texto }));
  } catch (error) {
    if (error.name !== 'ResourceExistsException') throw error;
    await aws.send(new PutSecretValueCommand({ SecretId: 'tienda/bd', SecretString: texto }));
  }

  // Vault KV v2: cada escritura en secret/data/<ruta> crea una versión.
  await vault({ apiVersion: 'v1', endpoint: LOCAL.vault, token: LOCAL.vaultToken }).write('secret/data/tienda/bd', { data: valor });

  // Azure Key Vault: setSecret crea una versión nueva del secreto «tienda-bd».
  await clienteAzure({ url: LOCAL.azure, emulador: true }).setSecret('tienda-bd', texto, { contentType: 'application/json' });
  return valor;
}

if (import.meta.main) {
  const valor = await sembrar(process.argv[2]);
  console.log(`secreto tienda/bd guardado en AWS (${LOCAL.aws}), Vault (${LOCAL.vault}) y Azure (${LOCAL.azure}) · usuario=${valor.usuario} clave=<oculta>`);
}
```

#### 10. MINI-LABORATORIO

1. Sin Docker: dónde aparece la clave en cada versión y qué pasa al rotarla. `f129-secretos/ataque.js` usa un gestor
   en memoria:

```javascript
// Módulo 20 · F129 · La fuga: dónde aparece la clave en cada versión (código, logs, endpoint de debug) y qué pasa
// cuando el DBA la rota. Usa un proveedor en memoria para no necesitar Docker. Ejecuta: node f129-secretos/ataque.js
import { readFileSync } from 'node:fs';
import { once } from 'node:events';
import { crearBaseDeDatos } from './comun.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';
import { SecretosConCache } from './secretos.js';

const CLAVE = 'Cl4ve-Pr0d-2026';
const NUEVA = 'Rotada-2026-11';
// Hace de gestor de secretos: guarda el valor fuera del código y sabe rotarlo.
const gestor = { nombre: 'memoria', version: 1, valor: { usuario: 'app', clave: CLAVE }, async leer() { return { valor: this.valor, version: String(this.version) }; } };

async function revisar(nombre, archivo, crear) {
  const baseDeDatos = crearBaseDeDatos(CLAVE);
  const lineasDeLog = [];
  const servidor = (await crear(baseDeDatos, (linea) => lineasDeLog.push(linea))).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const debug = await fetch(`${base}/debug/config`);
  const contiene = (texto) => (texto.includes(CLAVE) ? 'SÍ' : 'no');
  console.log(`== ${nombre}`);
  console.log(`   ¿la clave está en el código (${archivo})?  ${contiene(readFileSync(new URL(archivo, import.meta.url), 'utf8'))}`);
  console.log(`   ¿la clave sale en el log de arranque?        ${contiene(lineasDeLog.join('\n'))}   log: ${lineasDeLog[0]}`);
  console.log(`   GET /debug/config                            ${debug.status}${debug.ok ? ` y la respuesta contiene la clave: ${contiene(await debug.text())}` : ''}`);
  console.log(`   GET /pedidos                                 ${(await fetch(`${base}/pedidos`)).status}`);
  baseDeDatos.rotar(NUEVA); gestor.valor = { usuario: 'app', clave: NUEVA }; gestor.version += 1; // el DBA rota la clave
  const tras = await fetch(`${base}/pedidos`);
  console.log(`   GET /pedidos tras rotar la clave             ${tras.status} ${tras.ok ? '(recargó el secreto solo)' : await tras.text()}`);
  servidor.close();
  gestor.valor = { usuario: 'app', clave: CLAVE }; gestor.version = 1; // deja el gestor como al principio
}
await revisar('ANTES (vulnerable)', './antes.js', (bd, log) => crearAntes(bd, { log }));
await revisar('DESPUÉS (seguro)', './despues.js', (bd, log) => crearDespues(bd, new SecretosConCache(gestor), { log }));
```

```bash
node f129-secretos/ataque.js
```

   **Output esperado:**

```text
== ANTES (vulnerable)
   ¿la clave está en el código (./antes.js)?  SÍ
   ¿la clave sale en el log de arranque?        SÍ   log: conectando a la base de datos con {"usuario":"app","clave":"Cl4ve-Pr0d-2026"}
   GET /debug/config                            200 y la respuesta contiene la clave: SÍ
   GET /pedidos                                 200
   GET /pedidos tras rotar la clave             500 {"error":"password authentication failed for user \"app\""}
== DESPUÉS (seguro)
   ¿la clave está en el código (./despues.js)?  no
   ¿la clave sale en el log de arranque?        no   log: secreto tienda/bd cargado ({"nombre":"tienda/bd","proveedor":"memoria","version":"1","edadS":0})
   GET /debug/config                            404
   GET /pedidos                                 200
   GET /pedidos tras rotar la clave             200 (recargó el secreto solo)
```

2. Con los emuladores. Levanta la infraestructura y siembra el secreto en los tres gestores:

```bash
docker compose up -d --wait
node f129-secretos/sembrar.js
```

   **Output esperado:** `secreto tienda/bd guardado en AWS (http://127.0.0.1:4566), Vault (http://127.0.0.1:8200) y
   Azure (http://127.0.0.1:4577/devstoreaccount1-keyvault) · usuario=app clave=<oculta>`.

3. Arranca la versión segura con cada proveedor y consulta. Por ejemplo, con Vault:

```bash
SECRETOS=vault VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root node f129-secretos/despues.js
# en otra terminal:
curl -s localhost:3229/pedidos; echo
curl -s localhost:3229/salud/secretos; echo
```

   **Output esperado:** `[{"pedido":1,"total":120000}]` y `[{"nombre":"tienda/bd","proveedor":"vault","version":"1",
   "edadS":0}]` (la versión y la edad dependen de cuántas veces sembraste y cuándo consultas). Para AWS usa
   `SECRETOS=aws AWS_ENDPOINT_URL=http://127.0.0.1:4566`; para Azure, `SECRETOS=azure AZURE_EMULADOR=si
   AZURE_KEYVAULT_URL=http://127.0.0.1:4577/devstoreaccount1-keyvault`. **Captura comentada:** la terminal del
   servicio muestra `secreto tienda/bd cargado ({"nombre":"tienda/bd","proveedor":"vault",…})` y **ninguna** clave.

4. Rota mientras el servicio corre: `node f129-secretos/sembrar.js Rotada-2026-11`. La base simulada del servicio
   sigue con la clave antigua (es un proceso aparte), así que aquí lo que verás es que `/salud/secretos` mantiene la
   versión en caché hasta 5 minutos: la recarga forzada ante un error de autenticación la demuestran el test de la
   sección 11 y el paso 1.

   Los pasos 2 a 4 no se pudieron ejecutar en el entorno de redacción (sin acceso a Docker Hub ni a las descargas de
   los emuladores) y están anotados en `verificacion/microservicios/pendiente.md`; los comandos de verificación indicados los
   comprueba en el Mac.

#### 11. VERIFICACIÓN

Test que debes ejecutar (sin Docker: la caché con un gestor en memoria y cada adaptador contra un doble local que habla
el protocolo HTTP de su servicio):

```javascript
// Módulo 20 · F129 · Tests sin Docker: la caché con un proveedor en memoria, y cada adaptador contra un DOBLE local
// que habla el protocolo HTTP de su servicio (los emuladores de verdad se prueban en secretos.integracion.js).
// Ejecuta: node --test f129-secretos/secretos.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { crearBaseDeDatos, SECRETO_BD } from './comun.js';
import { crearApp } from './despues.js';
import { proveedorAws, proveedorAzure, proveedorVault, SecretosConCache } from './secretos.js';

const SECRETO = { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' };

function gestorEnMemoria() {
  const g = { nombre: 'memoria', lecturas: 0, version: 1, valor: { ...SECRETO }, async leer() { g.lecturas += 1; return { valor: g.valor, version: String(g.version) }; } };
  return g;
}
/** Levanta un servidor HTTP de usar y tirar; `responder(req, cuerpo)` devuelve [status, json]. */
async function doble(responder) {
  const vistas = [];
  const servidor = http.createServer(async (req, res) => {
    let cuerpo = ''; for await (const trozo of req) cuerpo += trozo;
    vistas.push({ metodo: req.method, ruta: req.url, cabeceras: req.headers, cuerpo });
    const [status, json, tipo = 'application/json'] = responder(req, cuerpo);
    res.writeHead(status, { 'content-type': tipo }); res.end(JSON.stringify(json));
  }).listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  return { url: `http://127.0.0.1:${servidor.address().port}`, vistas, cerrar: () => { servidor.close(); servidor.closeAllConnections(); } };
}

test('caché: dentro del TTL no vuelve a llamar al gestor; al vencer, sí', async () => {
  let reloj = 0;
  const gestor = gestorEnMemoria();
  const secretos = new SecretosConCache(gestor, { ttlMs: 1000, ahora: () => reloj });
  await secretos.obtener(SECRETO_BD); await secretos.obtener(SECRETO_BD); reloj = 999; await secretos.obtener(SECRETO_BD);
  assert.equal(gestor.lecturas, 1);
  reloj = 1000;
  await secretos.obtener(SECRETO_BD);
  assert.equal(gestor.lecturas, 2);
});

test('caché: estado() informa nombre, proveedor, versión y edad, pero nunca el valor', async () => {
  const secretos = new SecretosConCache(gestorEnMemoria());
  await secretos.obtener(SECRETO_BD);
  assert.deepEqual(secretos.estado(), [{ nombre: 'tienda/bd', proveedor: 'memoria', version: '1', edadS: 0 }]);
  assert.doesNotMatch(JSON.stringify(secretos.estado()), /Cl4ve/);
});

test('API: tras una rotación, la primera petición recarga el secreto y responde 200', async () => {
  const gestor = gestorEnMemoria();
  const baseDeDatos = crearBaseDeDatos(SECRETO.clave);
  const registros = [];
  const servidor = (await crearApp(baseDeDatos, new SecretosConCache(gestor), { log: (l) => registros.push(l) })).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  assert.equal((await fetch(`${base}/pedidos`)).status, 200);
  baseDeDatos.rotar('Rotada-2026-11'); gestor.valor = { usuario: 'app', clave: 'Rotada-2026-11' }; gestor.version = 2;
  assert.equal((await fetch(`${base}/pedidos`)).status, 200);
  assert.equal((await fetch(`${base}/salud/secretos`).then((r) => r.json()))[0].version, '2');
  assert.doesNotMatch(registros.join('\n'), /Cl4ve|Rotada/, 'ninguna clave en los logs');
  assert.equal((await fetch(`${base}/debug/config`)).status, 404);
  servidor.close(); servidor.closeAllConnections();
});

test('adaptador AWS: envía GetSecretValue firmado y lee SecretString y VersionId', async (t) => {
  const aws = await doble(() => [200, { Name: 'tienda/bd', SecretString: JSON.stringify(SECRETO), VersionId: 'v-aws-1' }, 'application/x-amz-json-1.1']);
  t.after(aws.cerrar);
  assert.deepEqual(await proveedorAws({ endpoint: aws.url }).leer('tienda/bd'), { valor: SECRETO, version: 'v-aws-1' });
  assert.equal(aws.vistas[0].cabeceras['x-amz-target'], 'secretsmanager.GetSecretValue');
  assert.deepEqual(JSON.parse(aws.vistas[0].cuerpo), { SecretId: 'tienda/bd' });
  assert.match(aws.vistas[0].cabeceras.authorization, /^AWS4-HMAC-SHA256 Credential=test\//);
});

test('adaptador Vault: lee secret/data/<nombre> con X-Vault-Token y devuelve data.data', async (t) => {
  const servidorVault = await doble(() => [200, { data: { data: SECRETO, metadata: { version: 3 } } }]);
  t.after(servidorVault.cerrar);
  assert.deepEqual(await proveedorVault({ endpoint: servidorVault.url, token: 'root' }).leer('tienda/bd'), { valor: SECRETO, version: '3' });
  assert.equal(servidorVault.vistas[0].ruta, '/v1/secret/data/tienda/bd');
  assert.equal(servidorVault.vistas[0].cabeceras['x-vault-token'], 'root');
});

test('adaptador Azure (modo emulador): pide /secrets/tienda-bd por http y lee value y la versión del id', async (t) => {
  const azure = await doble((req) => [200, { value: JSON.stringify(SECRETO), id: `https://${req.headers.host}/secrets/tienda-bd/0123456789abcdef0123456789abcdef`, attributes: { enabled: true } }]);
  t.after(azure.cerrar);
  assert.deepEqual(await proveedorAzure({ url: azure.url, emulador: true }).leer('tienda/bd'), { valor: SECRETO, version: '0123456789abcdef0123456789abcdef' });
  assert.match(azure.vistas.at(-1).ruta, /^\/secrets\/tienda-bd\/?\?api(-|%2D)version=/);
});
```

```bash
node --test f129-secretos/secretos.test.js
```

Resultado esperado:

```text
✔ caché: dentro del TTL no vuelve a llamar al gestor; al vencer, sí
✔ caché: estado() informa nombre, proveedor, versión y edad, pero nunca el valor
✔ API: tras una rotación, la primera petición recarga el secreto y responde 200
✔ adaptador AWS: envía GetSecretValue firmado y lee SecretString y VersionId
✔ adaptador Vault: lee secret/data/<nombre> con X-Vault-Token y devuelve data.data
✔ adaptador Azure (modo emulador): pide /secrets/tienda-bd por http y lee value y la versión del id
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

Con los emuladores arriba, el test de integración lee el mismo secreto por los tres proveedores y comprueba que una
rotación se recoge al forzar la recarga (`node --test f129-secretos/secretos.integracion.js`, 3 tests):

```javascript
// Módulo 20 · F129 · Test de integración contra los emuladores (docker compose up -d --wait):
// el mismo secreto se lee igual por los tres proveedores y una rotación se ve al saltar la caché.
// Ejecuta: node --test f129-secretos/secretos.integracion.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECRETO_BD } from './comun.js';
import { proveedorAws, proveedorAzure, proveedorVault, SecretosConCache } from './secretos.js';
import { LOCAL, sembrar } from './sembrar.js';

const proveedores = {
  aws: () => proveedorAws({ endpoint: LOCAL.aws }),
  vault: () => proveedorVault({ endpoint: LOCAL.vault, token: LOCAL.vaultToken }),
  azure: () => proveedorAzure({ url: LOCAL.azure, emulador: true }),
};

for (const [nombre, crear] of Object.entries(proveedores)) {
  test(`${nombre}: lee el secreto sembrado y recoge la rotación con { forzar: true }`, async () => {
    await sembrar('Cl4ve-Pr0d-2026');
    const proveedor = crear();
    const primera = await proveedor.leer(SECRETO_BD);
    assert.deepEqual(primera.valor, { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' });

    const secretos = new SecretosConCache(proveedor);
    assert.equal((await secretos.obtener(SECRETO_BD)).clave, 'Cl4ve-Pr0d-2026');
    await sembrar('Rotada-2026-11');                                                       // rotación
    assert.equal((await secretos.obtener(SECRETO_BD)).clave, 'Cl4ve-Pr0d-2026', 'dentro del TTL sigue la de caché');
    assert.equal((await secretos.obtener(SECRETO_BD, { forzar: true })).clave, 'Rotada-2026-11');
    assert.notEqual(secretos.estado()[0].version, primera.version, 'la versión cambia con la rotación');
  });
}
```

**Pregunta de comprobación:** en AWS real, ¿qué credenciales le pasas a `SecretsManagerClient`? *(Ninguna: el SDK las
toma del rol IAM que la plataforma asigna a la tarea o al pod. Si ves `accessKeyId` en el código de un servicio
desplegado, es un secreto más que gestionar mal.)*

#### 12. ERROR COMÚN

**Síntoma:** el equipo de seguridad rota la clave de la base de datos un martes a las 10:00 y, desde ese minuto, todas
las peticiones fallan con `password authentication failed for user "app"` hasta que alguien reinicia los pods.
**Causa:** el secreto se lee una vez al arrancar y se guarda en una constante para siempre. `f129-secretos/error-comun.js`:

```javascript
// Módulo 20 · F129 · ERROR COMÚN: leer el secreto UNA vez al arrancar y guardarlo para siempre. El día que se rota
// la clave, todas las peticiones fallan hasta que alguien reinicia el servicio.
// Ejecuta: node f129-secretos/error-comun.js
import { crearBaseDeDatos, ErrorDeAutenticacion, SECRETO_BD } from './comun.js';
import { SecretosConCache } from './secretos.js';

const gestor = { nombre: 'memoria', version: 1, valor: { usuario: 'app', clave: 'Cl4ve-Pr0d-2026' }, async leer() { return { valor: this.valor, version: String(this.version) }; } };
const baseDeDatos = crearBaseDeDatos('Cl4ve-Pr0d-2026');
const intentar = async (fn) => { try { await fn(); return 'OK'; } catch (error) { return `FALLA (${error.message})`; } };

// MAL: una constante de módulo, leída al arrancar.
const { valor: alArrancar } = await gestor.leer(SECRETO_BD);
const consultarMal = async () => baseDeDatos.consultar(alArrancar);

// BIEN: caché con TTL + recarga cuando la base rechaza la clave.
const secretos = new SecretosConCache(gestor, { ttlMs: 300_000 });
const consultarBien = async () => {
  try { return baseDeDatos.consultar(await secretos.obtener(SECRETO_BD)); } catch (error) {
    if (!(error instanceof ErrorDeAutenticacion)) throw error;
    return baseDeDatos.consultar(await secretos.obtener(SECRETO_BD, { forzar: true }));
  }
};

console.log(`antes de rotar   · MAL: ${await intentar(consultarMal)} · BIEN: ${await intentar(consultarBien)}`);
baseDeDatos.rotar('Rotada-2026-11'); gestor.valor = { usuario: 'app', clave: 'Rotada-2026-11' }; gestor.version = 2;
console.log('-- el equipo de seguridad rota la clave --');
for (let i = 1; i <= 2; i += 1) console.log(`petición ${i} después · MAL: ${await intentar(consultarMal)} · BIEN: ${await intentar(consultarBien)}`);
```

Salida real de `node f129-secretos/error-comun.js`:

```text
antes de rotar   · MAL: OK · BIEN: OK
-- el equipo de seguridad rota la clave --
petición 1 después · MAL: FALLA (password authentication failed for user "app") · BIEN: OK
petición 2 después · MAL: FALLA (password authentication failed for user "app") · BIEN: OK
```

**Diagnóstico visual:** en la gráfica de errores, un escalón al 100 % que empieza **exactamente** a la hora de la
rotación y termina con el reinicio; en el log, errores de autenticación de la base y ningún acceso al gestor desde el
arranque. **Arreglo:** caché con TTL, recarga forzada ante un error de autenticación y una ventana en la que conviven
las dos claves.

**Otro error real (visto en el Mac con Floci-Az):** `Error: The request URL must use HTTPS.` desde
`@azure/keyvault-common`. El emulador responde primero `401` con `WWW-Authenticate` y la política de *challenge*
del SDK comprueba que la URL sea `https` **después** de las políticas añadidas con `additionalPolicies`; por eso
cambiar a `http` en una política no sirve. La solución del laboratorio es pasar un `httpClient` propio que envía
una **copia** de la petición con `http` (el SDK reutiliza la original tras el 401 y debe seguir viendo `https`).
En Azure real no hace falta nada de esto: la URL ya es `https://<tu-vault>.vault.azure.net`.

#### 13. PREGUNTA DE ENTREVISTA

**¿Cómo gestionas la contraseña de la base de datos de un microservicio desplegado en la nube?**

**Respuesta modelo:** nunca en el código, ni en la imagen, ni en el repositorio. La guardo en un gestor de secretos:
Secrets Manager en AWS, Key Vault en Azure o Vault si soy multi-nube u on-premise. El servicio no tiene ninguna
credencial para leerla: se identifica con la identidad de la plataforma (rol IAM con IRSA, identidad administrada,
cuenta de servicio de Kubernetes con Vault) y una política de mínimo privilegio que solo le deja leer ese secreto. La
lee al arrancar, para fallar pronto si no tiene acceso, y la cachea unos minutos; si la base rechaza la clave, fuerza
una recarga una vez, lo que me permite rotar sin reiniciar, con una ventana en la que las dos claves son válidas. No la
escribo en logs ni la expongo en endpoints de diagnóstico: solo nombre y versión. Si puedo, uso credenciales dinámicas
de Vault, que caducan solas, y activo la auditoría del gestor para saber quién leyó qué. En local uso emuladores
(Floci, Floci-Az, Vault en modo dev) con el mismo código, cambiando solo endpoint y credencial por configuración.

#### 14. ANTI-PATRÓN RELACIONADO

**El `.env` de producción en el repositorio (o en la imagen).** Evita commitear un `.env` «solo de staging», copiarlo
con `COPY..` dentro de la imagen Docker o pasarlo con `ENV` en el Dockerfile: queda en el historial de Git y en cada
capa de la imagen, y borrarlo después no lo borra del historial.

```dockerfile
# MAL: la clave queda en una capa de la imagen; cualquiera con acceso al registro la lee con docker history.
ENV DB_PASSWORD=Cl4ve-Pr0d-2026
COPY .env /app/.env

# BIEN: la imagen no lleva secretos; el contenedor obtiene su identidad de la plataforma y lee el gestor (despues.js).
ENV SECRETOS=aws
```

Cómo se detecta: `git log -p -S 'Cl4ve'` encuentra el commit que la introdujo aunque ya no esté en el árbol, y
`docker history --no-trunc <imagen>` muestra los `ENV` de cada capa. Si una clave llegó a Git, se rota: borrarla no
basta.
