# Módulo 7 · Seguridad

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

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Emitir y verificar tokens JWT con jsonwebtoken usando firma asimétrica (ES256), restringir algoritmo, emisor, audiencia y caducidad, y demostrar que un token falsificado con alg: none o con el payload manipulado se rechaza. Lo compruebas cuando node --test f124-jwt/tokens.test.js…

#### ► LA IDEA EN UNA FRASE
**Emitir y verificar tokens JWT con jsonwebtoken usando firma asimétrica (ES256), restringir algoritmo, emisor, audiencia y caducidad, y demostrar que un token falsificado con alg: none o con el payload manipulado se rechaza.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en jwt con jsonwebtoken como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Cuando inicias sesión, el servidor te da un **token**: un texto largo que demuestra quién eres. En cada petición lo
2. Un **JWT** (JSON Web Token) son tres trozos separados por puntos: qué tipo de token es, **tus datos** (quién eres,
3. Los datos **se pueden leer** sin ninguna clave. La firma sirve para que **nadie pueda cambiarlos**: si alguien cambia
4. Por eso el servidor siempre debe **comprobar la firma**. Leer el token sin comprobarla es como creerse una pulsera

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| JWT con jsonwebtoken se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar JWT con jsonwebtoken | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El mismo secreto HS256 compartido por todos los microservicios. Evita repartir un secreto simétrico a los diez servicios que verifican tokens: cualquiera de ellos, si lo comprometen, puede emitir tokens de administrador para todos los demás, y rotarlo exige desplegar los diez a la vez.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: jwt con jsonwebtoken funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando inicias sesión, el servidor te da un **token**: un texto largo que demuestra quién eres. En cada petición lo
- Un **JWT** (JSON Web Token) son tres trozos separados por puntos: qué tipo de token es, **tus datos** (quién eres,
- Los datos **se pueden leer** sin ninguna clave. La firma sirve para que **nadie pueda cambiarlos**: si alguien cambia
- Por eso el servidor siempre debe **comprobar la firma**. Leer el token sin comprobarla es como creerse una pulsera

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve jwt con jsonwebtoken en tu contexto?
2. ¿Cómo sabrías que jwt con jsonwebtoken no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar jwt con jsonwebtoken?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

</details>

### Passport.js

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar Passport.js con una estrategia local (usuario y clave con scrypt) y una estrategia JWT sin sesiones, separar autenticación (quién eres) de autorización (qué puedes) y comprobar que un login no permite enumerar usuarios. Lo compruebas cuando node --test f125-passport/pa…

#### ► LA IDEA EN UNA FRASE
**Configurar Passport.js con una estrategia local (usuario y clave con scrypt) y una estrategia JWT sin sesiones, separar autenticación (quién eres) de autorización (qué puedes) y comprobar que un login no permite enumerar usuarios.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en passport.js como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. **Autenticar** es comprobar **quién eres** (usuario y contraseña, un token, un certificado). **Autorizar** es
2. **Passport.js** es una librería para Express que organiza la autenticación en **estrategias** intercambiables: una
3. Las contraseñas **nunca** se guardan tal cual: se guarda un **hash**, un resumen que no se puede deshacer, calculado
4. Y el login no debe dar pistas: si dice «ese usuario no existe», un atacante ya sabe a quién atacar.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Passport.js se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Passport.js | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Confiar en la identidad que dice el cliente. Evita cualquier «sesión» que el propio cliente pueda escribir: una cabecera x-usuario, un ?userId= en la URL, un campo rol en el cuerpo o una cookie sin firmar. Es lo que hace antes.js, y el ataque lo explota con un curl.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: passport.js funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **Autenticar** es comprobar **quién eres** (usuario y contraseña, un token, un certificado). **Autorizar** es
- **Passport.js** es una librería para Express que organiza la autenticación en **estrategias** intercambiables: una
- Las contraseñas **nunca** se guardan tal cual: se guarda un **hash**, un resumen que no se puede deshacer, calculado
- Y el login no debe dar pistas: si dice «ese usuario no existe», un atacante ya sabe a quién atacar.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve passport.js en tu contexto?
2. ¿Cómo sabrías que passport.js no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar passport.js?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

</details>

### Helmet, CORS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar Helmet para enviar las cabeceras de seguridad de una API y restringir CORS a una lista exacta de orígenes con credenciales, y explicar qué protege CORS y qué no. Lo compruebas cuando node --test f126-helmet-cors/cabeceras.test.js pasa 4 de 4.

#### ► LA IDEA EN UNA FRASE
**Configurar Helmet para enviar las cabeceras de seguridad de una API y restringir CORS a una lista exacta de orígenes con credenciales, y explicar qué protege CORS y qué no.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en helmet, cors como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Los navegadores tienen una regla de oro: el código de una web **no puede leer** las respuestas de otra web (la
2. **CORS** es la forma en que tu API dice «a esta otra web sí le dejo leer mis respuestas». Si lo configuras mal,
3. **Helmet** es un middleware que añade a cada respuesta unas cabeceras de seguridad: pequeñas instrucciones para el
4. Las dos cosas son **instrucciones para el navegador**. No protegen de alguien que llama a tu API con `curl`.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Helmet, CORS se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Helmet, CORS | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Validar el origen «más o menos». Evita comprobar el origen con endsWith, includes o una regex sin ^ y $: el atacante registra un dominio que la cumple. f126-helmet-cors/anti-patron.js lo mide:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: helmet, cors funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Los navegadores tienen una regla de oro: el código de una web **no puede leer** las respuestas de otra web (la
- **CORS** es la forma en que tu API dice «a esta otra web sí le dejo leer mis respuestas». Si lo configuras mal,
- **Helmet** es un middleware que añade a cada respuesta unas cabeceras de seguridad: pequeñas instrucciones para el
- Las dos cosas son **instrucciones para el navegador**. No protegen de alguien que llama a tu API con `curl`.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve helmet, cors en tu contexto?
2. ¿Cómo sabrías que helmet, cors no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar helmet, cors?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

</details>

### Prevención de inyecciones NoSQL

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Explicar cómo un objeto JSON se convierte en un operador de MongoDB, explotar un login vulnerable con {"$ne": null} y prevenirlo validando el tipo de cada campo con un esquema, usando $eq explícito y sacando la contraseña del filtro. Lo compruebas cuando node --test f127-nosql/fi…

#### ► LA IDEA EN UNA FRASE
**Explicar cómo un objeto JSON se convierte en un operador de MongoDB, explotar un login vulnerable con {"$ne": null} y prevenirlo validando el tipo de cada campo con un esquema, usando $eq explícito y sacando la contraseña del filtro.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en prevención de inyecciones nosql como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["cuerpo JSON<br/>{usuario: 'root', clave: {$ne: null}}"] --> V{"¿esquema zod?<br/>clave: string"}
    V -- "ANTES: sin validar" --> Q1["findOne({usuario: 'root',<br/>clave: {$ne: null}})"]
    Q1 --> R1["MongoDB: «clave distinta de null»<br/>→ devuelve root → 200"]
    V -- "DESPUÉS: no es string" --> R2["400 campos: [clave]<br/>MongoDB ni se consulta"]
    V -- "DESPUÉS: válido" --> Q2["findOne({usuario: {$eq: 'root'}})"]
    Q2 --> H["scrypt + timingSafeEqual<br/>en la aplicación"]
```

1. Una **inyección** ocurre cuando lo que escribe el usuario deja de ser un **dato** y pasa a ser una **orden** para la
2. En MongoDB las consultas son objetos: `{ usuario: 'ana' }` significa «usuario igual a ana». Pero
3. Si tu API mete en la consulta lo que llega en el JSON **sin mirar qué es**, el atacante puede enviar un objeto en
4. La defensa es comprobar **qué forma** tiene cada dato antes de usarlo: si esperas un texto, que sea un texto.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Prevención de inyecciones NoSQL se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Prevención de inyecciones NoSQL | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Pasar el cuerpo o la query enteros como filtro. Evita el atajo de usar req.body o req.query directamente como objeto de consulta «porque los nombres coinciden»: el cliente decide los campos y los operadores.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: prevención de inyecciones nosql funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una **inyección** ocurre cuando lo que escribe el usuario deja de ser un **dato** y pasa a ser una **orden** para la
- En MongoDB las consultas son objetos: `{ usuario: 'ana' }` significa «usuario igual a ana». Pero
- Si tu API mete en la consulta lo que llega en el JSON **sin mirar qué es**, el atacante puede enviar un objeto en
- La defensa es comprobar **qué forma** tiene cada dato antes de usarlo: si esperas un texto, que sea un texto.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve prevención de inyecciones nosql en tu contexto?
2. ¿Cómo sabrías que prevención de inyecciones nosql no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar prevención de inyecciones nosql?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

</details>

### OWASP Top 10

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Identificar las diez categorías del OWASP Top 10:2025 y corregir en una API Express cinco fallos concretos (A01 control de acceso con IDOR y SSRF, A02 configuración, A09 registro y alertas, A10 manejo de condiciones excepcionales), con un test por categoría. Lo compruebas cuando…

#### ► LA IDEA EN UNA FRASE
**Identificar las diez categorías del OWASP Top 10:2025 y corregir en una API Express cinco fallos concretos (A01 control de acceso con IDOR y SSRF, A02 configuración, A09 registro y alertas, A10 manejo de condiciones excepcionales), con un test por categoría.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en owasp top 10 como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. **OWASP** es una fundación abierta que estudia la seguridad de las aplicaciones web. Su **Top 10** es la lista de los
2. La edición vigente es la **2025** (la página oficial, top10.owasp.org, dice «The most current released version is
3. No es una lista de ataques, sino de **categorías de errores**: «comprobar mal quién puede ver qué» agrupa cientos de
4. Sirve como **idioma común**: cuando alguien dice «A01» todo el equipo sabe de qué se habla, y como lista para

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| OWASP Top 10 se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar OWASP Top 10 | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
«El gateway ya lo comprobó». Evita los microservicios internos que confían en cualquier petición porque «solo les llega tráfico del gateway»: no autentican, no autorizan por objeto y aceptan cabeceras como x-user-id sin verificar. Un SSRF en cualquier servicio, un pod comprometido o un error de red convierten toda la red interna en pública.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: owasp top 10 funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **OWASP** es una fundación abierta que estudia la seguridad de las aplicaciones web. Su **Top 10** es la lista de los
- La edición vigente es la **2025** (la página oficial, top10.owasp.org, dice «The most current released version is
- No es una lista de ataques, sino de **categorías de errores**: «comprobar mal quién puede ver qué» agrupa cientos de
- Sirve como **idioma común**: cuando alguien dice «A01» todo el equipo sabe de qué se habla, y como lista para

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve owasp top 10 en tu contexto?
2. ¿Cómo sabrías que owasp top 10 no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar owasp top 10?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

</details>

### Secretos: AWS Secrets Manager, Vault, Azure Key Vault

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Leer un secreto desde AWS Secrets Manager, HashiCorp Vault y Azure Key Vault con una interfaz común, cachearlo con caducidad y recargarlo tras una rotación sin reiniciar el servicio, y explicar qué cambia entre los emuladores locales y la nube real. Lo compruebas cuando node --te…

#### ► LA IDEA EN UNA FRASE
**Leer un secreto desde AWS Secrets Manager, HashiCorp Vault y Azure Key Vault con una interfaz común, cachearlo con caducidad y recargarlo tras una rotación sin reiniciar el servicio, y explicar qué cambia entre los emuladores locales y la nube real.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en secretos: aws secrets manager, vault, azure key vault como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un **secreto** es cualquier dato que da acceso: la contraseña de la base de datos, la clave de una API de pagos, la
2. Escribirlo en el código es un error grave: el código se copia, se sube a Git y se comparte; **todo** el que vea el
3. Un **gestor de secretos** es una caja fuerte en la nube (o en tu centro de datos): guarda los secretos cifrados,
4. Tu servicio, al arrancar, se identifica ante la caja fuerte y pide el secreto. Nunca lo escribe en un log ni lo

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Secretos: AWS Secrets Manager, Vault, Azure Key Vault se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Secretos: AWS Secrets Manager, Vault, Azure Key Vault | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El .env de producción en el repositorio (o en la imagen). Evita commitear un .env «solo de staging», copiarlo con COPY.. dentro de la imagen Docker o pasarlo con ENV en el Dockerfile: queda en el historial de Git y en cada capa de la imagen, y borrarlo después no lo borra del historial.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: secretos: aws secrets manager, vault, azure key vault funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un **secreto** es cualquier dato que da acceso: la contraseña de la base de datos, la clave de una API de pagos, la
- Escribirlo en el código es un error grave: el código se copia, se sube a Git y se comparte; **todo** el que vea el
- Un **gestor de secretos** es una caja fuerte en la nube (o en tu centro de datos): guarda los secretos cifrados,
- Tu servicio, al arrancar, se identifica ante la caja fuerte y pide el secreto. Nunca lo escribe en un log ni lo

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve secretos: aws secrets manager, vault, azure key vault en tu contexto?
2. ¿Cómo sabrías que secretos: aws secrets manager, vault, azure key vault no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar secretos: aws secrets manager, vault, azure key vault?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>
