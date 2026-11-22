# Módulo 27 · Seguridad Zero-Trust

**Fase 3 · Nivel maestro: arquitectura avanzada** (una semana de 8). **Duración:** 8 h (4 temas de unos 90 min y 2 h
de laboratorio integrador). **Dificultad:** 5 de 5. **Dependencias:** Módulo 9 (JWT, OAuth2, Keycloak, el primer
Token Exchange, mTLS con Istio y Vault KV) o Módulo 20 (JWT, secretos y OWASP en Node), y Módulo 12 o 23 (Kubernetes).
**Herramientas:**Node.js 26.13.1 LTS** (módulos `node:tls`, `node:https` y `node:crypto`, sin librerías de
seguridad para que veas cada comprobación), **pg 8.23.1**, **OpenSSL 3** o el LibreSSL de macOS, **HashiCorp Vault
2.2.0** y **PostgreSQL 18.7** (solo con `--compose`), y para la malla real **Istio 1.32** o **Linkerd edge-26.11.2**
sobre **Kubernetes 1.37** en kind. 
tests y los cuatro ataques sin infraestructura; los comandos de verificación indicados añade Vault y PostgreSQL reales).

En el Módulo 9 pusiste candados: un token firmado, un canje de token, mTLS con Istio, un secreto en Vault. En este
módulo cambias la pregunta. Ya no es «¿cómo cierro la puerta?», sino **«¿qué pasa cuando el atacante ya está
dentro?»**. Zero-Trust parte de esa suposición: la red interna no es de confianza, cada llamada se autentica y se
autoriza en el **destino**, las credenciales viven minutos u horas y cada servicio puede hacer **solo lo que necesita**.
Los cuatro temas atacan lo mismo desde cuatro ángulos: un pod comprometido (`catalogo`) intenta cobrar, reutilizar un
token robado, usar una contraseña filtrada y saltarse el gateway.

```mermaid
flowchart LR
    T1["1 · mTLS con Istio/Linkerd<br/>¿QUIÉN llama? (identidad)"] --> T2["2 · Token Exchange (RFC 8693)<br/>¿en nombre de QUIÉN?"]
    T1 --> T4["4 · Service Mesh<br/>¿DÓNDE se decide?"]
    T3["3 · Vault<br/>¿con QUÉ credencial y cuánto vive?"] --> T4
    T2 --> T4
```

**Texto alternativo:** mapa del módulo. El tema 1 (mTLS con Istio o Linkerd) responde quién llama, con una identidad
criptográfica por servicio; lleva al tema 2 (Token Exchange, en nombre de qué usuario se llama) y al tema 4 (Service
Mesh, dónde se aplica la política). El tema 3 (Vault, con qué credencial y cuánto tiempo vive) también desemboca en el
tema 4, que junta las cuatro respuestas en la arquitectura de la malla.

**Regla del módulo:** cada tema trae **Antes (vulnerable)** y **Después (seguro)** con el código de ambos, y un
`ataque.js` que lanza el mismo ataque contra las dos versiones y enseña la diferencia con la salida real.

**Qué se ejecutó aquí y qué falta.** Todo el código Node.js, los 18 tests, la PKI con OpenSSL 3.0.13 y los cuatro
ataques se ejecutaron con Node 26.13.1 en Linux y sus salidas están pegadas tal cual. El SQL de Vault (crear un
usuario con `VALID UNTIL`, entrar, caducar, borrar) se ejecutó contra un **PostgreSQL 16 real** local. **No se pudieron
ejecutar aquí** (este entorno no llega a Docker Hub ni tiene kind) y están en `verificacion/microservicios/pendiente.md`:
el `docker-compose.yml` con Vault 2.2.0 y PostgreSQL 18.7, `vault/configurar.sh`, y los manifiestos de Istio y Linkerd
en kind. Sus salidas se describen, no se pegan.

**Cómo usar el laboratorio.** Con Node 26:

```bash
npm ci
  # PKI + 18 tests + 4 ataques ANTES/DESPUÉS (sin Docker) → «RESULTADO: OK»
los comandos de verificación indicados    # además Vault 2.2.0 y PostgreSQL 18.7 reales
```

`./pki/generar.sh`. Los archivos `antes.js` son vulnerables **a propósito**: no copies nada de ellos. El
`README.md` tiene el mapa de carpetas.

`package.json` del laboratorio (con `package-lock.json`; `npm audit --omit=dev` respondió `found 0 vulnerabilities` el
2026-11-20):

```json
{
  "name": "modulo-27-seguridad-zero-trust",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 27 (Fase 3): Seguridad Zero-Trust (mTLS con Istio/Linkerd, Token Exchange RFC 8693, Vault con secretos dinámicos y Service Mesh).",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "test": "node --test --test-concurrency=1 'f1*/*.test.js'"
  },
  "dependencies": {
    "pg": "8.23.1"
  }
}
```

La PKI que usan las fichas 1, 2 y 4 (`pki/generar.sh`): una CA de la malla y un certificado por servicio con su
identidad **SPIFFE** en el SAN, como los que emite `istiod`, con vida de **1 día**.

```bash
#!/usr/bin/env bash
# Módulo 27 · PKI mínima de una malla, como la que montan istiod o el identity de Linkerd:
#   - una CA «malla-ca» (en Istio, istiod; en Linkerd, el trust anchor + issuer),
#   - un certificado por servicio con su identidad SPIFFE en el SAN (URI) y vida de 1 día,
#   - un certificado «intruso» autofirmado que dice ser pedidos pero NO lo firmó la CA.
# Uso: ./pki/generar.sh [carpeta]   (por defecto pki/certs). Requiere openssl (OpenSSL 3 o LibreSSL de macOS).
# Claves RSA 2048 y extensiones por -extfile: funcionan igual en OpenSSL 3.x y en LibreSSL 3.x.
set -eu
dir="${1:-$(dirname "$0")/certs}"
mkdir -p "$dir"
cd "$dir"
if ! command -v openssl > /dev/null 2>&1; then
  echo "ERROR: falta openssl. En macOS viene instalado; en Linux: sudo apt-get install openssl" >&2
  exit 2
fi
rm -f ./*.crt ./*.key ./*.csr ./*.ext ./*.srl
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 30 -keyout ca.key -out ca.crt -subj "/O=tienda/CN=malla-ca" 2> /dev/null

emitir() { # emitir <nombre> <SAN> <uso: serverAuth | clientAuth | serverAuth,clientAuth>
  openssl req -newkey rsa:2048 -nodes -sha256 -keyout "$1.key" -out "$1.csr" -subj "/O=tienda/CN=$1" 2> /dev/null
  printf 'subjectAltName=%s\nextendedKeyUsage=%s\n' "$2" "$3" > "$1.ext"
  openssl x509 -req -sha256 -in "$1.csr" -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -out "$1.crt" -extfile "$1.ext" 2> /dev/null
  rm -f "$1.csr" "$1.ext"
}
TD="spiffe://cluster.local/ns/tienda/sa"
emitir pagos      "DNS:localhost,IP:127.0.0.1,URI:${TD}/pagos"      serverAuth,clientAuth
emitir sts        "DNS:localhost,IP:127.0.0.1,URI:${TD}/sts"        serverAuth
emitir inventario "DNS:localhost,IP:127.0.0.1,URI:${TD}/inventario" serverAuth
emitir pedidos    "URI:${TD}/pedidos"   clientAuth
emitir catalogo   "URI:${TD}/catalogo"  clientAuth
emitir antifraude "DNS:localhost,IP:127.0.0.1,URI:${TD}/antifraude" serverAuth
# Error común de F161: un certificado de servidor sin el SAN del nombre con el que lo llaman.
emitir sin-san    "URI:${TD}/pagos" serverAuth
# Intruso: autofirmado, mismo CN y mismo SAN que pedidos, pero fuera de la CA.
printf 'subjectAltName=URI:%s/pedidos\nextendedKeyUsage=clientAuth\n' "$TD" > intruso.ext
openssl req -newkey rsa:2048 -nodes -sha256 -keyout intruso.key -out intruso.csr -subj "/O=tienda/CN=pedidos" 2> /dev/null
openssl x509 -req -sha256 -in intruso.csr -signkey intruso.key -days 1 -out intruso.crt -extfile intruso.ext 2> /dev/null
rm -f intruso.csr intruso.ext
openssl verify -CAfile ca.crt pagos.crt pedidos.crt catalogo.crt
openssl verify -CAfile ca.crt intruso.crt > /dev/null 2>&1 && echo "intruso.crt: OK (¡no debería!)" || echo "intruso.crt: rechazado por la CA (correcto)"
```

Las dos utilidades comunes y un JWT ES256 escrito con

`comun/pki.js`: identidad SPIFFE y huella de certificado.

`comun/jwt.js`: JWT ES256 con
`node:crypto` para que veas cada comprobación (`comun/jwt.js`). En producción, una librería mantenida (`jose` o
`jsonwebtoken`, Módulo 20).

```javascript
// Módulo 27 · utilidades comunes: leer la PKI de pki/certs y sacar la identidad SPIFFE de un certificado.
// Node.js 26.13.1 LTS, sin dependencias (node:fs, node:crypto, node:path).
import { readFileSync, existsSync } from 'node:fs';
import { X509Certificate, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const DIR_CERTS = process.env.CERTS ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'pki', 'certs');

/** Devuelve { cert, key, ca } en PEM para el servicio pedido. Falla con un mensaje claro si no hay PKI. */
export function credenciales(nombre) {
  const ruta = (f) => join(DIR_CERTS, f);
  if (!existsSync(ruta('ca.crt'))) {
    throw new Error(`no hay PKI en ${DIR_CERTS}: ejecuta primero ./pki/generar.sh`);
  }
  return { cert: readFileSync(ruta(`${nombre}.crt`)), key: readFileSync(ruta(`${nombre}.key`)), ca: readFileSync(ruta('ca.crt')) };
}

/** Identidad SPIFFE del certificado (URI del SAN), p. ej. spiffe://cluster.local/ns/tienda/sa/pedidos. */
export function spiffeDe(certificado) {
  // getPeerCertificate() da subjectaltname como texto: 'URI:spiffe://..., DNS:localhost'
  const san = certificado?.subjectaltname ?? '';
  const uri = san.split(', ').find((s) => s.startsWith('URI:spiffe://'));
  return uri ? uri.slice(4) : null;
}

/** Huella RFC 8705 §3.1: base64url(SHA-256(DER del certificado)) -> claim cnf["x5t#S256"]. */
export function huellaX5tS256(certificadoDer) {
  return createHash('sha256').update(certificadoDer).digest('base64url');
}

/** Huella de un PEM (para el STS, que conoce el certificado del cliente por la conexión mTLS). */
export function huellaDePem(pem) {
  return huellaX5tS256(new X509Certificate(pem).raw);
}
```

```javascript
// Módulo 27 · JWT ES256 mínimo con node:crypto (sin dependencias), para que veas cada comprobación.
// En producción usa una librería mantenida (jose 6 o jsonwebtoken 9, Módulo 20); aquí todo es visible.
import { createSign, createVerify, generateKeyPairSync, randomUUID } from 'node:crypto';

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

export function nuevasClaves() {
  return generateKeyPairSync('ec', { namedCurve: 'P-256' });
}

/** Firma un JWT ES256. `claims` ya trae iss, sub, aud, scope…; aquí se añaden iat, exp y jti. */
export function firmar(claims, privateKey, { kid = 'sts-1', vidaSegundos = 60, ahora = Math.floor(Date.now() / 1000) } = {}) {
  const cabecera = { alg: 'ES256', typ: 'JWT', kid };
  const payload = { ...claims, iat: ahora, exp: ahora + vidaSegundos, jti: randomUUID() };
  const datos = `${b64(cabecera)}.${b64(payload)}`;
  const firma = createSign('SHA256').update(datos).sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${datos}.${firma.toString('base64url')}`;
}

export class TokenInvalido extends Error {}

/** Verifica firma, algoritmo, emisor, audiencia y caducidad. Devuelve el payload o lanza TokenInvalido. */
export function verificar(token, publicKey, { iss, aud, ahora = Math.floor(Date.now() / 1000) }) {
  const partes = String(token ?? '').split('.');
  if (partes.length !== 3) throw new TokenInvalido('formato');
  const [c, p, f] = partes;
  let cabecera, payload;
  try {
    cabecera = JSON.parse(Buffer.from(c, 'base64url'));
    payload = JSON.parse(Buffer.from(p, 'base64url'));
  } catch {
    throw new TokenInvalido('formato');
  }
  if (cabecera.alg !== 'ES256') throw new TokenInvalido(`alg ${cabecera.alg} no permitido`);
  const ok = createVerify('SHA256').update(`${c}.${p}`).verify({ key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(f, 'base64url'));
  if (!ok) throw new TokenInvalido('firma');
  if (payload.iss !== iss) throw new TokenInvalido(`iss=${payload.iss}`);
  const auds = [].concat(payload.aud ?? []);
  if (!auds.includes(aud)) throw new TokenInvalido(`aud=${auds.join(',')}`);
  if (typeof payload.exp !== 'number' || payload.exp <= ahora) throw new TokenInvalido('caducado');
  return payload;
}

/** Lee el payload SIN verificar: solo para mostrarlo en pantalla, nunca para autorizar. */
export function leerSinVerificar(token) {
  return JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url'));
}
```

El cliente HTTP de los ataques (`comun/cliente.js`) nunca lanza: devuelve el código de error de red o de TLS para
poder imprimirlo.

```javascript
// Módulo 27 · cliente HTTP/HTTPS de los ataques y los tests: devuelve { status, body } o { error: código }.
import http from 'node:http';
import https from 'node:https';

/**
 * llamar('https://127.0.0.1:4161/cobros', { metodo, cabeceras, cuerpo, tls: { cert, key, ca } })
 * Nunca lanza: los fallos de red o de TLS vuelven como { error: 'ERR_…' } para poder imprimirlos.
 */
export function llamar(url, { metodo = 'GET', cabeceras = {}, cuerpo, tls } = {}) {
  const u = new URL(url);
  const mod = u.protocol === 'https:' ? https : http;
  const datos = cuerpo === undefined ? undefined : JSON.stringify(cuerpo);
  return new Promise((resolve) => {
    const req = mod.request(u, {
      method: metodo,
      agent: false, // sin reutilizar conexiones: cada llamada hace su propio handshake
      headers: { ...(datos ? { 'content-type': 'application/json' } : {}), ...cabeceras },
      ...(tls ?? {}),
      servername: u.hostname === '127.0.0.1' ? 'localhost' : u.hostname,
      timeout: 3000,
    }, (res) => {
      let texto = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (texto += c));
      res.on('end', () => {
        let body = texto;
        try { body = JSON.parse(texto); } catch { /* texto plano */ }
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
    req.on('error', (e) => resolve({ error: e.code ?? e.message }));
    if (datos) req.write(datos);
    req.end();
  });
}

/** Lee el cuerpo JSON de una petición entrante. */
export function leerJson(req) {
  return new Promise((resolve) => {
    let t = '';
    req.setEncoding('utf8');
    req.on('data', (c) => (t += c));
    req.on('end', () => { try { resolve(t ? JSON.parse(t) : {}); } catch { resolve(null); } });
  });
}

export function responder(res, status, obj, cabeceras = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...cabeceras });
  res.end(JSON.stringify(obj));
}

/** Arranca un servidor en el puerto dado (0 = libre) y devuelve { servidor, puerto, cerrar }. */
export function escuchar(servidor, puerto = 0, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    servidor.once('error', reject);
    servidor.listen(puerto, host, () => resolve({
      servidor,
      puerto: servidor.address().port,
      cerrar: () => new Promise((r) => { servidor.closeAllConnections?.(); servidor.close(() => r()); }),
    }));
  });
}

/** Formatea el resultado de llamar() en una línea: «200 {...}» o «sin conexión: ERR_…». */
export function resumen(r) {
  if (r.error) return `rechazado en la conexión (${r.error})`;
  return `${r.status} ${typeof r.body === 'string' ? r.body : JSON.stringify(r.body)}`;
}
```

---


### mTLS con Istio/Linkerd

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Distinguir autenticación (mTLS: quién eres) de autorización (qué puedes hacer), implementar en Node un servidor que saca la identidad SPIFFE del certificado verificado y deniega por defecto, y escribir la misma política en Istio (PeerAuthentication + AuthorizationPolicy) y en Lin…

#### ► LA IDEA EN UNA FRASE
**Distinguir autenticación (mTLS: quién eres) de autorización (qué puedes hacer), implementar en Node un servidor que saca la identidad SPIFFE del certificado verificado y deniega por defecto, y escribir la misma política en Istio (PeerAuthentication + AuthorizationPolicy) y en Linkerd (Server + MeshTLSAuthentication + AuthorizationPolicy).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en mtls con istio/linkerd como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant C as catalogo (comprometido)<br/>cert SPIFFE .../sa/catalogo
    participant P as pedidos<br/>cert SPIFFE .../sa/pedidos
    participant S as sidecar de pagos<br/>(Envoy o linkerd-proxy)
    participant A as app pagos
    Note over S: PeerAuthentication STRICT<br/>AuthorizationPolicy: denegar todo<br/>+ ALLOW pedidos POST /cobros
    C->>S: handshake mTLS (cert válido de la malla)
    S->>S: identidad = URI SAN = .../sa/catalogo
    S-->>C: 403 RBAC: access denied
    P->>S: handshake mTLS + POST /cobros
    S->>S: identidad = .../sa/pedidos → regla ALLOW
    S->>A: POST /cobros (texto plano dentro del pod)
    A-->>P: 200
```

1. Cuando dos servicios hablan, el que recibe necesita saber **quién** le habla. Escribirlo en un papel («soy pedidos»)
2. **mTLS** es enseñarse **carnés** mutuamente al empezar la conversación. El carné (un **certificado**) lo firma una
3. Pero tener carné solo dice **quién eres**, no **qué puedes hacer**. Por eso, además, cada servicio tiene una lista:
4. Istio y Linkerd son programas que ponen ese torniquete y esa lista delante de cada servicio **sin cambiar su

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| mTLS con Istio/Linkerd se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar mTLS con Istio/Linkerd | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Confiar en la identidad que el llamante declara. Evita autorizar con cabeceras como x-servicio, x-user-id o x-forwarded-client que el propio llamante escribe, o con la IP de origen (en Kubernetes las IP de los pods cambian y se reutilizan).

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: mtls con istio/linkerd funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando dos servicios hablan, el que recibe necesita saber **quién** le habla. Escribirlo en un papel («soy pedidos»)
- **mTLS** es enseñarse **carnés** mutuamente al empezar la conversación. El carné (un **certificado**) lo firma una
- Pero tener carné solo dice **quién eres**, no **qué puedes hacer**. Por eso, además, cada servicio tiene una lista:
- Istio y Linkerd son programas que ponen ese torniquete y esa lista delante de cada servicio **sin cambiar su

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve mtls con istio/linkerd en tu contexto?
2. ¿Cómo sabrías que mtls con istio/linkerd no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar mtls con istio/linkerd?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
**Distinguir** autenticación (mTLS: quién eres) de autorización (qué puedes hacer), **implementar** en Node un servidor
que saca la identidad SPIFFE del certificado verificado y deniega por defecto, y **escribir** la misma política en Istio
(`PeerAuthentication` + `AuthorizationPolicy`) y en Linkerd (`Server` + `MeshTLSAuthentication` +
`AuthorizationPolicy`). Lo compruebas cuando `node --test f161-mtls/mtls.test.js` pasa 6 de 6 y `ataque.js` muestra que
el pod comprometido `catalogo` pasa de 200 a 403.

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS** (`node:https`, `node:tls`), certificados de `pki/generar.sh` (OpenSSL 3.0.13 aquí;
LibreSSL en macOS), **Istio 1.32** (`security.istio.io/v1`) y **Linkerd edge-26.11.2** (`policy.linkerd.io`).

**Antes (vulnerable)** — `f161-mtls/antes.js`: la identidad sale de una cabecera.

```javascript
// Módulo 27 · F161 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// «pagos» confía en la red interna: HTTP plano y la identidad del llamante sale de una cabecera
// (x-servicio) que cualquiera puede escribir. Es lo que pasa con mTLS en PERMISSIVE y sin autorización.
// Ejecuta: node f161-mtls/antes.js   (http://127.0.0.1:3161)
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { escuchar, responder } from '../comun/cliente.js';

export function crearPagosAntes() {
  return http.createServer((req, res) => {
    const quien = req.headers['x-servicio'] ?? 'anónimo'; // ✘ identidad declarada, no demostrada
    if (req.method === 'POST' && req.url === '/cobros') {
      if (quien !== 'pedidos') return responder(res, 403, { error: 'solo pedidos cobra', quien });
      return responder(res, 200, { cobrado: true, quien });
    }
    responder(res, 404, { error: 'no existe' });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { puerto } = await escuchar(crearPagosAntes(), 3161);
  console.log(`pagos ANTES en http://127.0.0.1:${puerto} (identidad por cabecera x-servicio)`);
}
```

**Después (seguro)** — `f161-mtls/despues.js`: mTLS estricto, identidad del certificado y denegar por defecto.

`comun/pki.js`: utilidades de PKI compartidas.

```javascript
// Módulo 27 · F161 · DESPUÉS (seguro). Lo que hace el sidecar de Istio/Linkerd, escrito a mano en Node:
//   1. mTLS ESTRICTO: sin certificado firmado por la CA de la malla no hay conexión (requestCert + rejectUnauthorized).
//   2. La identidad es la URI SPIFFE del certificado verificado; las cabeceras no cuentan.
//   3. Autorización por identidad, denegar por defecto: solo pedidos puede POST /cobros
//      (el equivalente de una AuthorizationPolicy de Istio o de una MeshTLSAuthentication de Linkerd).
// Ejecuta: ./pki/generar.sh && node f161-mtls/despues.js   (https://127.0.0.1:4161)
import https from 'node:https';
import { pathToFileURL } from 'node:url';
import { credenciales, spiffeDe } from '../comun/pki.js';
import { escuchar, responder } from '../comun/cliente.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';
// Reglas: método + ruta -> identidades permitidas. Lo que no está aquí, se deniega.
export const REGLAS = [{ metodo: 'POST', ruta: '/cobros', permitidos: [`${TD}/pedidos`] }];

export function autorizar(identidad, metodo, ruta, reglas = REGLAS) {
  const regla = reglas.find((r) => r.metodo === metodo && r.ruta === ruta);
  return Boolean(regla && identidad && regla.permitidos.includes(identidad));
}

export function crearPagosDespues({ reglas = REGLAS } = {}) {
  const { cert, key, ca } = credenciales('pagos');
  return https.createServer({
    cert, key, ca,
    requestCert: true,          // pide certificado al cliente…
    rejectUnauthorized: true,   // …y corta el handshake si no lo trae o no lo firmó la CA
    minVersion: 'TLSv1.3',
  }, (req, res) => {
    const identidad = spiffeDe(req.socket.getPeerCertificate()); // la cabecera x-servicio se ignora
    if (!autorizar(identidad, req.method, req.url, reglas)) {
      return responder(res, 403, { error: 'RBAC: access denied', identidad });
    }
    responder(res, 200, { cobrado: true, identidad });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { puerto } = await escuchar(crearPagosDespues(), 4161);
  console.log(`pagos DESPUÉS en https://127.0.0.1:${puerto} (mTLS estricto + autorización por identidad SPIFFE)`);
}
```

Lo mismo, declarado en la malla. **Antes (vulnerable)** en Istio — `f161-mtls/k8s/istio/antes.yaml`:

```yaml
# Módulo 27 · F161 · ANTES (vulnerable): mTLS PERMISSIVE (acepta texto plano) y ninguna AuthorizationPolicy.
# Sin políticas ALLOW, Istio permite todo: cualquier pod del clúster puede llamar a pagos.
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: tienda
spec:
  mtls:
    mode: PERMISSIVE
```

**Después (seguro)** en Istio — `f161-mtls/k8s/istio/despues.yaml`:

```yaml
# Módulo 27 · F161 · DESPUÉS con Istio 1.32 (API security.istio.io/v1).
# 1) mTLS estricto en el namespace tienda; 2) denegar todo por defecto; 3) solo pedidos puede POST /cobros en pagos.
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: tienda
spec:
  mtls:
    mode: STRICT
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: denegar-todo        # spec vacío = «allow nothing»: deniega todo en el namespace
  namespace: tienda
spec: {}
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: pagos-solo-pedidos
  namespace: tienda
spec:
  selector:
    matchLabels:
      app: pagos
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/tienda/sa/pedidos"]
    to:
    - operation:
        methods: ["POST"]
        paths: ["/cobros"]
```

**Después (seguro)** en Linkerd — `f161-mtls/k8s/linkerd/despues.yaml`:

```yaml
# Módulo 27 · F161 · DESPUÉS con Linkerd (edge-26.11.2): lo mismo que k8s/istio/despues.yaml.
# El namespace lleva la anotación config.linkerd.io/default-inbound-policy: deny (denegar por defecto).
apiVersion: v1
kind: Namespace
metadata:
  name: tienda
  annotations:
    linkerd.io/inject: enabled
    config.linkerd.io/default-inbound-policy: deny
---
apiVersion: policy.linkerd.io/v1beta1
kind: Server
metadata:
  name: pagos-http
  namespace: tienda
spec:
  podSelector:
    matchLabels:
      app: pagos
  port: http
  proxyProtocol: HTTP/1
---
apiVersion: policy.linkerd.io/v1alpha1
kind: MeshTLSAuthentication
metadata:
  name: solo-pedidos
  namespace: tienda
spec:
  identities:
    - "pedidos.tienda.serviceaccount.identity.linkerd.cluster.local"
---
apiVersion: policy.linkerd.io/v1alpha1
kind: AuthorizationPolicy
metadata:
  name: pagos-solo-pedidos
  namespace: tienda
spec:
  targetRef:
    group: policy.linkerd.io
    kind: Server
    name: pagos-http
  requiredAuthenticationRefs:
    - name: solo-pedidos
      kind: MeshTLSAuthentication
      group: policy.linkerd.io
```

</details>

### Token Exchange (RFC 8693)

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir un STS que canjea tokens con la delegación de RFC 8693 (act anidado y may_act) autenticando al cliente por mTLS, ligar el token emitido al certificado del servicio que lo pidió (cnf["x5t#S256"], RFC 8705) y demostrar que un token robado de un log ya no sirve desde otro…

#### ► LA IDEA EN UNA FRASE
**Construir un STS que canjea tokens con la delegación de RFC 8693 (act anidado y may_act) autenticando al cliente por mTLS, ligar el token emitido al certificado del servicio que lo pidió (cnf["x5t#S256"], RFC 8705) y demostrar que un token robado de un log ya no sirve desde otro pod.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en token exchange (rfc 8693) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant P as pedidos (cert .../sa/pedidos)
    participant S as STS (mTLS)
    participant G as pagos
    participant F as antifraude
    P->>S: POST /token · grant_type=...:token-exchange<br/>subject_token=T0 (sub=ana, aud=pedidos, may_act=pedidos)<br/>audience=pagos · scope=pagos:cobrar
    S-->>P: T1: sub=ana · aud=pagos · scope=pagos:cobrar · exp 60 s<br/>act={sub:pedidos} · cnf.x5t#S256=huella(cert pedidos)
    P->>G: POST /cobros · Bearer T1 (por mTLS con cert pedidos)
    G->>G: aud, scope, act.sub=pedidos y huella(cert de la conexión)=cnf
    G->>S: canje de T1 · audience=antifraude (cert pagos)
    S-->>G: T2: act={sub:pagos, act:{sub:pedidos}}
    G->>F: POST /evaluar · Bearer T2
    F-->>G: 200 riesgo bajo · cadena pagos ← pedidos
    Note over G: catalogo con T1 robado y SU certificado → 401: cnf no coincide
```

1. Cuando un servicio llama a otro **en nombre de una persona**, tiene que demostrar dos cosas: qué persona es y que
2. Reenviar la «llave» de la persona tal cual es peligroso: abre todas las puertas y cualquiera que la copie la usa.
3. **Token Exchange** es ir a una ventanilla oficial y cambiar la llave grande por una pequeña: sirve para **una**
4. Si además la llave lleva la **huella** del servicio que la pidió, una copia robada no abre nada en otras manos.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Token Exchange (RFC 8693) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Token Exchange (RFC 8693) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El «token dios» interno: un token con aud de todos los servicios y scopes de todo, que viaja por toda la cadena de llamadas y vive una hora.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: token exchange (rfc 8693) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando un servicio llama a otro **en nombre de una persona**, tiene que demostrar dos cosas: qué persona es y que
- Reenviar la «llave» de la persona tal cual es peligroso: abre todas las puertas y cualquiera que la copie la usa.
- **Token Exchange** es ir a una ventanilla oficial y cambiar la llave grande por una pequeña: sirve para **una**
- Si además la llave lleva la **huella** del servicio que la pidió, una copia robada no abre nada en otras manos.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve token exchange (rfc 8693) en tu contexto?
2. ¿Cómo sabrías que token exchange (rfc 8693) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar token exchange (rfc 8693)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
    participant P as pedidos (cert .../sa/pedidos)
    participant S as STS (mTLS)
    participant G as pagos
    participant F as antifraude
    P->>S: POST /token · grant_type=...:token-exchange<br/>subject_token=T0 (sub=ana, aud=pedidos, may_act=pedidos)<br/>audience=pagos · scope=pagos:cobrar
    S-->>P: T1: sub=ana · aud=pagos · scope=pagos:cobrar · exp 60 s<br/>act={sub:pedidos} · cnf.x5t#S256=huella(cert pedidos)
    P->>G: POST /cobros · Bearer T1 (por mTLS con cert pedidos)
    G->>G: aud, scope, act.sub=pedidos y huella(cert de la conexión)=cnf
    G->>S: canje de T1 · audience=antifraude (cert pagos)
    S-->>G: T2: act={sub:pagos, act:{sub:pedidos}}
    G->>F: POST /evaluar · Bearer T2
    F-->>G: 200 riesgo bajo · cadena pagos ← pedidos
    Note over G: catalogo con T1 robado y SU certificado → 401: cnf no coincide
```

```javascript
// Módulo 27 · F162 · STS (Security Token Service) mínimo con Token Exchange RFC 8693 + tokens ligados a certificado (RFC 8705).
//   - El cliente se autentica con mTLS: su identidad es la URI SPIFFE del certificado (sin secretos compartidos).
//   - Canjea subject_token (token del usuario) por uno nuevo: aud = un solo destino, scope mínimo, vida 60 s.
//   - Delegación: el token nuevo lleva act.sub = quien canjea; si el subject_token ya traía act, se anida (cadena).
//   - may_act: si el subject_token lo trae, solo ese actor puede canjearlo.
//   - cnf["x5t#S256"]: huella del certificado del que canjea; el destino exige ver ESE certificado en la conexión.
import https from 'node:https';
import { credenciales, spiffeDe, huellaX5tS256 } from '../comun/pki.js';
import { firmar, verificar, leerSinVerificar, TokenInvalido } from '../comun/jwt.js';
import { responder } from '../comun/cliente.js';

export const GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange';
export const ACCESS_TOKEN = 'urn:ietf:params:oauth:token-type:access_token';
export const ISS_IDP = 'https://idp.tienda.local';
export const ISS_STS = 'https://sts.tienda.local';
const TD = 'spiffe://cluster.local/ns/tienda/sa';
const nombre = (spiffe) => spiffe?.split('/').pop();

// Política del STS: quién puede pedir qué audiencia y con qué scopes como máximo. Lo que no está, se niega.
export const POLITICA = {
  [`${TD}/pedidos`]: { pagos: ['pagos:cobrar'] },
  [`${TD}/pagos`]: { antifraude: ['antifraude:evaluar'] },
};

function leerFormulario(req) {
  return new Promise((resolve) => {
    let t = '';
    req.setEncoding('utf8');
    req.on('data', (c) => (t += c));
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(t))));
  });
}

/** Lógica pura del canje (sin HTTP) para poder probarla: devuelve { status, body }. */
export function canjear(params, { clienteSpiffe, clienteDer, clavesIdp, clavesSts, politica = POLITICA, ahora }) {
  const error = (status, e, desc) => ({ status, body: { error: e, error_description: desc } });
  if (!clienteSpiffe) return error(401, 'invalid_client', 'se exige certificado de cliente de la malla');
  if (params.grant_type !== GRANT) return error(400, 'unsupported_grant_type', params.grant_type);
  if (!params.subject_token || params.subject_token_type !== ACCESS_TOKEN) return error(400, 'invalid_request', 'subject_token y subject_token_type=access_token son obligatorios');
  let sujeto;
  try {
    // El subject_token puede venir del IdP (primer salto) o del propio STS (saltos siguientes).
    // El iss sin verificar solo elige la clave; después se verifica TODO (firma, iss, aud, exp) con esa clave.
    const delSts = leerSinVerificar(params.subject_token).iss === ISS_STS;
    sujeto = verificar(params.subject_token, (delSts ? clavesSts : clavesIdp).publicKey,
      { iss: delSts ? ISS_STS : ISS_IDP, aud: nombre(clienteSpiffe), ahora });
  } catch (e) {
    return error(400, 'invalid_grant', `subject_token no válido para ${nombre(clienteSpiffe)}: ${e.message}`);
  }
  if (sujeto.may_act && sujeto.may_act.sub !== clienteSpiffe) return error(400, 'invalid_grant', `may_act no permite a ${nombre(clienteSpiffe)}`);
  const permitido = politica[clienteSpiffe]?.[params.audience];
  if (!permitido) return error(400, 'invalid_target', `${nombre(clienteSpiffe)} no puede pedir audience=${params.audience}`);
  const pedidos = (params.scope ?? '').split(' ').filter(Boolean);
  const scopes = pedidos.filter((s) => permitido.includes(s));
  if (scopes.length === 0) return error(400, 'invalid_scope', `ninguno de [${pedidos.join(' ')}] está permitido`);
  const act = sujeto.act ? { sub: clienteSpiffe, act: sujeto.act } : { sub: clienteSpiffe }; // cadena de delegación
  const token = firmar({
    iss: ISS_STS, sub: sujeto.sub, aud: params.audience, scope: scopes.join(' '), act,
    cnf: { 'x5t#S256': huellaX5tS256(clienteDer) },
  }, clavesSts.privateKey, { vidaSegundos: 60, ahora });
  return { status: 200, body: { access_token: token, issued_token_type: ACCESS_TOKEN, token_type: 'Bearer', expires_in: 60, scope: scopes.join(' ') } };
}

export function crearSts({ clavesIdp, clavesSts, politica }) {
  const { cert, key, ca } = credenciales('sts');
  return https.createServer({ cert, key, ca, requestCert: true, rejectUnauthorized: true }, async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/token') return responder(res, 404, { error: 'no existe' });
    const peer = req.socket.getPeerCertificate();
    const r = canjear(await leerFormulario(req), { clienteSpiffe: spiffeDe(peer), clienteDer: peer.raw, clavesIdp, clavesSts, politica });
    responder(res, r.status, r.body, { 'cache-control': 'no-store' });
  });
}

export { TokenInvalido };
```

```javascript
// Módulo 27 · F162 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// pedidos reenvía a pagos el token del usuario tal cual (passthrough). El token tiene aud amplia
// (pedidos, pagos, inventario), vida de 1 h y es «al portador»: quien lo tenga, lo usa.
// pagos solo comprueba firma, emisor, audiencia y scope. Un token robado de un log sirve desde cualquier sitio.
import http from 'node:http';
import { verificar } from '../comun/jwt.js';
import { responder } from '../comun/cliente.js';
import { ISS_IDP } from './sts.js';

export function crearPagosAntes({ clavesIdp }) {
  return http.createServer((req, res) => {
    const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
    try {
      const t = verificar(token, clavesIdp.publicKey, { iss: ISS_IDP, aud: 'pagos' });
      if (!String(t.scope).split(' ').includes('pagos:cobrar')) return responder(res, 403, { error: 'insufficient_scope' });
      responder(res, 200, { cobrado: true, sub: t.sub });
    } catch (e) {
      responder(res, 401, { error: 'invalid_token', detalle: e.message });
    }
  });
}
```

```javascript
// Módulo 27 · F162 · DESPUÉS (seguro). pagos (y antifraude) como servidores de recursos Zero-Trust:
//   1. mTLS estricto (la conexión dice QUÉ servicio llama).
//   2. El token lo emitió el STS para ESTE destino (aud), con el scope exacto y caducidad de 60 s.
//   3. El actor actual (act.sub, el más externo) está autorizado a actuar aquí.
//   4. Prueba de posesión RFC 8705: cnf["x5t#S256"] == huella del certificado de la conexión.
//      Un token robado no sirve sin la clave privada del servicio al que se emitió.
import https from 'node:https';
import { credenciales, spiffeDe, huellaX5tS256 } from '../comun/pki.js';
import { verificar } from '../comun/jwt.js';
import { responder } from '../comun/cliente.js';
import { ISS_STS } from './sts.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';

/** Cadena de delegación legible: «pagos ← pedidos» (actor actual primero). */
export function cadena(act) {
  const nombres = [];
  for (let a = act; a; a = a.act) nombres.push(a.sub.split('/').pop());
  return nombres.join(' ← ');
}

export function validarPeticion({ token, peer, clavesSts, aud, scope, actores }) {
  const t = verificar(token, clavesSts.publicKey, { iss: ISS_STS, aud });
  if (!String(t.scope).split(' ').includes(scope)) return { status: 403, body: { error: 'insufficient_scope' } };
  if (!actores.includes(t.act?.sub)) return { status: 403, body: { error: 'actor no autorizado', act: t.act?.sub ?? null } };
  const huella = huellaX5tS256(peer.raw);
  if (t.cnf?.['x5t#S256'] !== huella) {
    return { status: 401, body: { error: 'invalid_token', detalle: `cnf no coincide con el certificado de ${spiffeDe(peer)?.split('/').pop()}` } };
  }
  return { status: 200, t };
}

function servidorDeRecursos(nombre, { clavesSts, aud, scope, actores, alAceptar }) {
  const { cert, key, ca } = credenciales(nombre);
  return https.createServer({ cert, key, ca, requestCert: true, rejectUnauthorized: true }, async (req, res) => {
    const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
    try {
      const r = validarPeticion({ token, peer: req.socket.getPeerCertificate(), clavesSts, aud, scope, actores });
      if (r.status !== 200) return responder(res, r.status, r.body);
      responder(res, 200, await alAceptar(r.t, token));
    } catch (e) {
      responder(res, 401, { error: 'invalid_token', detalle: e.message });
    }
  });
}

/** pagos: acepta tokens del STS con aud=pagos, scope pagos:cobrar y actor pedidos. */
export function crearPagosDespues({ clavesSts, alCobrar = async (t) => ({ cobrado: true, sub: t.sub, cadena: cadena(t.act) }) }) {
  return servidorDeRecursos('pagos', { clavesSts, aud: 'pagos', scope: 'pagos:cobrar', actores: [`${TD}/pedidos`], alAceptar: alCobrar });
}

/** antifraude: acepta tokens con aud=antifraude y actor pagos (cadena pagos ← pedidos). */
export function crearAntifraude({ clavesSts }) {
  return servidorDeRecursos('antifraude', {
    clavesSts, aud: 'antifraude', scope: 'antifraude:evaluar', actores: [`${TD}/pagos`],
    alAceptar: async (t) => ({ riesgo: 'bajo', sub: t.sub, cadena: cadena(t.act) }),
  });
}
```

```javascript
// Módulo 27 · F162 · el mismo robo de token contra ANTES (passthrough) y DESPUÉS (RFC 8693 + RFC 8705).
// Escenario: el atacante controla catalogo y encuentra en un log el token que pedidos usó para cobrar.
// Ejecuta: ./pki/generar.sh && node f162-token-exchange/ataque.js
import https from 'node:https';
import { nuevasClaves, firmar, leerSinVerificar } from '../comun/jwt.js';
import { credenciales } from '../comun/pki.js';
import { escuchar, llamar, resumen } from '../comun/cliente.js';
import { crearSts, GRANT, ACCESS_TOKEN, ISS_IDP } from './sts.js';
import { crearPagosAntes } from './antes.js';
import { crearPagosDespues, crearAntifraude, cadena } from './despues.js';

const TD = 'spiffe://cluster.local/ns/tienda/sa';
const clavesIdp = nuevasClaves();
const clavesSts = nuevasClaves();
const pedidos = credenciales('pedidos');
const pagosCli = credenciales('pagos');
const catalogo = credenciales('catalogo');

const sts = await escuchar(crearSts({ clavesIdp, clavesSts }));
const antifraude = await escuchar(crearAntifraude({ clavesSts }));
const STS = `https://127.0.0.1:${sts.puerto}/token`;
const canje = (tls, subject_token, audience, scope) =>
  formPost(tls, { grant_type: GRANT, subject_token, subject_token_type: ACCESS_TOKEN, audience, scope });

// POST application/x-www-form-urlencoded (RFC 8693 §2.1) con el cliente autenticado por mTLS.
function formPost(tls, campos) {
  const datos = new URLSearchParams(campos).toString();
  return new Promise((resolve) => {
    const req = https.request(STS, { method: 'POST', agent: false, servername: 'localhost', ...tls,
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'content-length': Buffer.byteLength(datos) } }, (res) => {
      let t = ''; res.on('data', (c) => (t += c)); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(t) }));
    });
    req.on('error', (e) => resolve({ error: e.code }));
    req.end(datos);
  });
}

// pagos DESPUÉS: al cobrar, canjea el token por uno para antifraude (segundo salto de la cadena).
const pagosDespues = await escuchar(crearPagosDespues({
  clavesSts,
  alCobrar: async (t, token) => {
    const c = await formPost(pagosCli, { grant_type: GRANT, subject_token: token, subject_token_type: ACCESS_TOKEN, audience: 'antifraude', scope: 'antifraude:evaluar' });
    const r = await llamar(`https://127.0.0.1:${antifraude.puerto}/evaluar`, { metodo: 'POST', tls: pagosCli, cabeceras: { authorization: `Bearer ${c.body.access_token}` } });
    return { cobrado: true, sub: t.sub, antifraude: r.body };
  },
}));
const pagosAntes = await escuchar(crearPagosAntes({ clavesIdp }));

console.log('== ANTES (vulnerable): passthrough del token del usuario');
const amplio = firmar({ iss: ISS_IDP, sub: 'ana', aud: ['pedidos', 'pagos', 'inventario'], scope: 'pedidos:crear pagos:cobrar inventario:leer' }, clavesIdp.privateKey, { vidaSegundos: 3600 });
const pa = leerSinVerificar(amplio);
console.log(`token de ana: aud=${pa.aud.join(',')} scope="${pa.scope}" vida=${pa.exp - pa.iat} s, sin cnf`);
const A = `http://127.0.0.1:${pagosAntes.puerto}/cobros`;
console.log(`  pedidos  -> pagos con el token reenviado      : ${resumen(await llamar(A, { metodo: 'POST', cabeceras: { authorization: `Bearer ${amplio}` } }))}`);
console.log(`  catalogo -> pagos con el MISMO token robado   : ${resumen(await llamar(A, { metodo: 'POST', cabeceras: { authorization: `Bearer ${amplio}` } }))}`);

console.log('== DESPUÉS (seguro): Token Exchange RFC 8693 + token ligado al certificado (RFC 8705)');
const deAna = firmar({ iss: ISS_IDP, sub: 'ana', aud: 'pedidos', scope: 'pedidos:crear', may_act: { sub: `${TD}/pedidos` } }, clavesIdp.privateKey, { vidaSegundos: 300 });
const c1 = await canje(pedidos, deAna, 'pagos', 'pagos:cobrar pagos:reembolsar');
const t1 = leerSinVerificar(c1.body.access_token);
console.log(`  STS (cliente pedidos por mTLS) -> ${c1.status} issued_token_type=${c1.body.issued_token_type} expires_in=${c1.body.expires_in}`);
console.log(`    claims: sub=${t1.sub} aud=${t1.aud} scope="${t1.scope}" act=${cadena(t1.act)} cnf.x5t#S256=${t1.cnf['x5t#S256'].slice(0, 12)}…`);
const D = `https://127.0.0.1:${pagosDespues.puerto}/cobros`;
const ok = await llamar(D, { metodo: 'POST', tls: pedidos, cabeceras: { authorization: `Bearer ${c1.body.access_token}` } });
console.log(`  pedidos  -> pagos con su token canjeado       : ${resumen(ok)}`);
console.log(`  catalogo -> pagos con el token canjeado robado: ${resumen(await llamar(D, { metodo: 'POST', tls: catalogo, cabeceras: { authorization: `Bearer ${c1.body.access_token}` } }))}`);
console.log(`  catalogo -> pagos con el token de ana robado  : ${resumen(await llamar(D, { metodo: 'POST', tls: catalogo, cabeceras: { authorization: `Bearer ${deAna}` } }))}`);
const r1 = await canje(catalogo, deAna, 'pagos', 'pagos:cobrar');
console.log(`  catalogo -> STS canjea el token de ana robado : ${r1.status} ${r1.body.error}: ${r1.body.error_description}`);
const propio = firmar({ iss: ISS_IDP, sub: 'ana', aud: 'catalogo', scope: 'catalogo:leer' }, clavesIdp.privateKey);
const r2 = await canje(catalogo, propio, 'pagos', 'pagos:cobrar');
console.log(`  catalogo -> STS pide audience=pagos           : ${r2.status} ${r2.body.error}: ${r2.body.error_description}`);

for (const s of [sts, antifraude, pagosAntes, pagosDespues]) await s.cerrar();
```

```bash
node f162-token-exchange/ataque.js
```

</details>

### Vault

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Sustituir una contraseña de base de datos estática y compartida por credenciales dinámicas del motor database de Vault (un usuario por instancia, 1 h de vida, renovables y revocables), implementar el cliente que las pide, renueva y revoca, y demostrar con un PostgreSQL real que u…

#### ► LA IDEA EN UNA FRASE
**Sustituir una contraseña de base de datos estática y compartida por credenciales dinámicas del motor database de Vault (un usuario por instancia, 1 h de vida, renovables y revocables), implementar el cliente que las pide, renueva y revoca, y demostrar con un PostgreSQL real que una credencial caducada o revocada ya no entra.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en vault como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant I as instancia de pedidos
    participant V as Vault (motor database)
    participant B as PostgreSQL
    I->>V: GET /v1/database/creds/pedidos (X-Vault-Token)
    V->>B: CREATE ROLE "v-pedidos-…" LOGIN PASSWORD '…' VALID UNTIL '+1 h'
    V-->>I: lease_id, lease_duration=3600, data{username,password}
    I->>B: conecta con su usuario propio
    loop a los 2/3 del lease
        I->>V: POST /v1/sys/leases/renew
    end
    I->>V: al apagarse: POST /v1/sys/leases/revoke
    V->>B: REVOKE … ; DROP ROLE "v-pedidos-…"
    Note over V,B: si nadie renueva, al caducar el lease Vault revoca solo
```

1. Un servicio necesita una contraseña para entrar en su base de datos. Si esa contraseña es **siempre la misma** y la
2. **Vault** puede **inventar** una contraseña nueva para cada copia del servicio cada vez que arranca, y le pone fecha
3. Si el servicio sigue vivo, pide «una hora más». Si se apaga, Vault borra el usuario. Si alguien roba la contraseña,
4. Y como cada copia tiene su propio usuario, si ves un acceso raro en la base de datos sabes **de dónde** vino.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Vault se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Vault | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
«Secret zero» en el código: sacar la contraseña de la base de datos del repositorio y meter en su lugar el token de Vault, fijo y con permisos amplios. Solo has movido el problema.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: vault funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un servicio necesita una contraseña para entrar en su base de datos. Si esa contraseña es **siempre la misma** y la
- **Vault** puede **inventar** una contraseña nueva para cada copia del servicio cada vez que arranca, y le pone fecha
- Si el servicio sigue vivo, pide «una hora más». Si se apaga, Vault borra el usuario. Si alguien roba la contraseña,
- Y como cada copia tiene su propio usuario, si ves un acceso raro en la base de datos sabes **de dónde** vino.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve vault en tu contexto?
2. ¿Cómo sabrías que vault no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar vault?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. La misma filtración contra las dos versiones, con un reloj simulado (`f163-vault/ataque.js`):

```javascript
// Módulo 27 · F163 · la misma credencial filtrada contra ANTES (estática) y DESPUÉS (dinámica de Vault).
// Línea de tiempo simulada con un reloj: el día 0 una credencial acaba en un log que el atacante lee.
// Sin Docker usa BdMemoria + el doble de Vault; con PGURL=postgres://… usa PostgreSQL real para el login.
// Ejecuta: node f163-vault/ataque.js
import { BdMemoria } from './bd.js';
import { crearDobleVault } from './doble-vault.js';
import { ClienteVault, CredencialesDinamicas } from './despues.js';
import { conectarAntes, SQL_ANTES, CONFIG_ANTES } from './antes.js';
import { ROL_PEDIDOS } from './rol.js';
import { escuchar } from '../comun/cliente.js';

const HORA = 3600_000, DIA = 24 * HORA;
let ahora = Date.parse('2026-11-20T09:00:00Z');
const reloj = () => ahora;
const marca = () => `día ${Math.floor((ahora - Date.parse('2026-11-20T09:00:00Z')) / DIA)} ${new Date(ahora).toISOString().slice(11, 16)}`;

console.log('== ANTES (vulnerable): una credencial estática compartida');
const bdA = new BdMemoria();
await bdA.ejecutar(SQL_ANTES);
console.log(`${marca()}  pedidos y pagos usan ${CONFIG_ANTES.usuario}/${'*'.repeat(CONFIG_ANTES.clave.length)}; se filtra en un log`);
for (const [desc, salto] of [['el atacante la prueba', 0], ['una hora después', HORA], ['30 días después', 30 * DIA - HORA]]) {
  ahora += salto;
  const r = await conectarAntes(bdA, 'atacante', ahora);
  console.log(`${marca().padEnd(13)} ${desc.padEnd(34)} -> login ${r.ok ? 'ACEPTADO' : 'rechazado'} como ${r.usuario}`);
}

console.log('   ¿qué servicio la filtró? imposible saberlo: todos usan el mismo usuario');

console.log('== DESPUÉS (seguro): credenciales dinámicas de Vault, 1 h por instancia');
ahora = Date.parse('2026-11-20T09:00:00Z');
const bd = new BdMemoria();
const doble = crearDobleVault({ bd, reloj });
const v = await escuchar(doble);
const vault = new ClienteVault({ direccion: `http://127.0.0.1:${v.puerto}`, token: 'root' });
await fetch(`http://127.0.0.1:${v.puerto}/v1/database/roles/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' }, body: JSON.stringify(ROL_PEDIDOS) });
const p1 = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
const p2 = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
console.log(`${marca()}  instancia 1 -> ${p1.usuario} (lease ${p1.duracion} s) · instancia 2 -> ${p2.usuario}`);
console.log(`${marca()}  se filtra la de la instancia 1 en un log`);
console.log(`${marca()}  el atacante la prueba               -> login ${(await bd.login(p1.usuario, p1.clave, ahora)) ? 'ACEPTADO' : 'rechazado'} (sigue viva: vida máxima 1 h)`);
ahora += HORA;
await doble.caducar();
console.log(`${marca()}  una hora después (lease caducado)   -> login ${(await bd.login(p1.usuario, p1.clave, ahora)) ? 'ACEPTADO' : 'rechazado'} · rol borrado: ${!bd.roles.has(p1.usuario)}`);
ahora = Date.parse('2026-11-20T09:05:00Z');
console.log('-- otro día, otro incidente: se revoca todo lo emitido para el rol pedidos');
const p3 = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
await fetch(`http://127.0.0.1:${v.puerto}/v1/sys/leases/revoke-prefix/database/creds/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' } });
console.log(`${marca()}  incidente: revoke-prefix database/creds/pedidos -> login de ${p3.usuario}: ${(await bd.login(p3.usuario, p3.clave, ahora)) ? 'ACEPTADO' : 'rechazado'} · leases vivos: ${doble.leases.size}`);
for (const p of [p1, p2, p3]) clearTimeout(p.temporizador);
await v.cerrar();
```

```bash
node f163-vault/ataque.js
```

   **Output esperado** (los sufijos `v-pedidos-…` cambian en cada ejecución):

```text
== ANTES (vulnerable): una credencial estática compartida
día 0 09:00  pedidos y pagos usan tienda/************; se filtra en un log
día 0 09:00   el atacante la prueba              -> login ACEPTADO como tienda
día 0 10:00   una hora después                   -> login ACEPTADO como tienda
día 30 09:00  30 días después                    -> login ACEPTADO como tienda
   ¿qué servicio la filtró? imposible saberlo: todos usan el mismo usuario
== DESPUÉS (seguro): credenciales dinámicas de Vault, 1 h por instancia
día 0 09:00  instancia 1 -> v-pedidos-5a38f5e5 (lease 3600 s) · instancia 2 -> v-pedidos-bd80e196
día 0 09:00  se filtra la de la instancia 1 en un log
día 0 09:00  el atacante la prueba               -> login ACEPTADO (sigue viva: vida máxima 1 h)
día 0 10:00  una hora después (lease caducado)   -> login rechazado · rol borrado: true
-- otro día, otro incidente: se revoca todo lo emitido para el rol pedidos
día 0 09:05  incidente: revoke-prefix database/creds/pedidos -> login de v-pedidos-1f4d298b: rechazado · leases vivos: 0
```

   **Captura comentada:** la contraseña estática sirve 30 días después y nadie sabe qué servicio la filtró. La
   dinámica **sigue viva** recién filtrada (Zero-Trust no hace milagros: reduce la ventana), pero una hora después el
   rol ya no existe; y un `revoke-prefix` deja la base de datos sin ningún usuario de `pedidos` emitido por Vault.

2. Con Docker (en tu Mac): Vault y PostgreSQL reales.

```bash
docker compose up -d --wait
./f163-vault/vault/configurar.sh
node f163-vault/real.js
docker compose exec vault vault lease revoke -prefix database/creds/pedidos   # con VAULT_TOKEN=root y VAULT_ADDR
docker compose down -v
```

   **Output esperado** (no ejecutado en este entorno, está en `pendiente.md`): `configurar.sh` termina con la tabla de
   `vault read database/creds/pedidos` (`lease_id` que empieza por `database/creds/pedidos/`, `lease_duration 1h`,
   `lease_renewable true`, `password` y un `username` que empieza por `v-`); `real.js` imprime `login con la credencial
   dinámica  -> {"ok":true}` y, tras revocar, `{"ok":false,"error":"password authentication failed for user …"}`.

#### Código de referencia / ejecutable
Versiones: **Node.js 26.13.1 LTS** (`fetch` nativo), **pg 8.23.1**, **HashiCorp Vault 2.2.0** y **PostgreSQL 18.7**
(con `--compose`). Sin Docker, `despues.js` habla con `doble-vault.js`, que imita las mismas rutas de la API.

**Antes (vulnerable)** — `f163-vault/antes.js`:

```javascript
// Módulo 27 · F163 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Una sola credencial de base de datos, estática, compartida por todos los servicios y sin caducidad.
// Aunque viniera de un gestor de secretos (Módulo 9, KV v2), si se filtra sirve hasta que alguien la cambie a mano,
// y nadie sabe qué servicio la filtró porque todos usan la misma.
export const CONFIG_ANTES = { usuario: 'tienda', clave: 'Tienda-2019!' }; // ✘ estática, compartida, sin caducidad

export const SQL_ANTES = `CREATE ROLE "${CONFIG_ANTES.usuario}" WITH LOGIN PASSWORD '${CONFIG_ANTES.clave}'`;

export async function conectarAntes(bd, servicio, ahora) {
  const ok = await bd.login(CONFIG_ANTES.usuario, CONFIG_ANTES.clave, ahora);
  return { servicio, usuario: CONFIG_ANTES.usuario, ok };
}
```

**Después (seguro)** — `f163-vault/despues.js` (cliente de la API HTTP de Vault con renovación y revocación):

```javascript
// Módulo 27 · F163 · DESPUÉS (seguro): secretos DINÁMICOS de Vault (motor database).
// Cada instancia pide a Vault su propio usuario de PostgreSQL al arrancar (vida 1 h, máximo 24 h),
// lo renueva mientras vive y lo revoca al apagarse. Si se filtra: caduca solo, se puede revocar por prefijo
// y el nombre (v-pedidos-…) dice de qué rol salió. Habla con la API HTTP de Vault (fetch nativo de Node 26).
// Uso real: VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=… node f163-vault/despues.js
import { pathToFileURL } from 'node:url';

export class ClienteVault {
  constructor({ direccion = process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200', token = process.env.VAULT_TOKEN } = {}) {
    if (!token) throw new Error('falta VAULT_TOKEN (en producción: AppRole o Kubernetes auth, nunca un token raíz)');
    this.direccion = direccion;
    this.token = token;
  }
  async #api(metodo, ruta, cuerpo) {
    const r = await fetch(`${this.direccion}/v1/${ruta}`, {
      method: metodo,
      headers: { 'X-Vault-Token': this.token, ...(cuerpo ? { 'content-type': 'application/json' } : {}) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    if (!r.ok) throw new Error(`Vault ${metodo} ${ruta} -> ${r.status} ${await r.text()}`);
    return r.status === 204 ? null : r.json();
  }
  credenciales(rol) { return this.#api('GET', `database/creds/${rol}`); }
  renovar(leaseId, incremento) { return this.#api('POST', 'sys/leases/renew', { lease_id: leaseId, increment: incremento }); }
  revocar(leaseId) { return this.#api('POST', 'sys/leases/revoke', { lease_id: leaseId }); }
}

/** Credenciales de una instancia: pedir, renovar a los 2/3 del lease, revocar al apagar. */
export class CredencialesDinamicas {
  constructor(vault, rol) { this.vault = vault; this.rol = rol; this.temporizador = null; }
  async iniciar() {
    const s = await this.vault.credenciales(this.rol);
    this.leaseId = s.lease_id;
    this.usuario = s.data.username;
    this.clave = s.data.password;
    this.duracion = s.lease_duration;
    this.#programar(s.lease_duration);
    return this;
  }
  #programar(segundos) {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(async () => {
      const r = await this.vault.renovar(this.leaseId, this.duracion).catch(() => null);
      if (r) this.#programar(r.lease_duration); // si ya no renueva (max_ttl), toca iniciar() de nuevo
    }, Math.max(1, segundos * 2 / 3) * 1000).unref();
  }
  async cerrar() { clearTimeout(this.temporizador); await this.vault.revocar(this.leaseId); }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cred = await new CredencialesDinamicas(new ClienteVault(), process.argv[2] ?? 'pedidos').iniciar();
  console.log(`usuario=${cred.usuario} lease=${cred.leaseId} lease_duration=${cred.duracion}`);
  await cred.cerrar();
  console.log('lease revocado al apagar');
}
```

El rol de Vault (`f163-vault/rol.js`) y la misma configuración contra el Vault real (`f163-vault/vault/configurar.sh`):

```javascript
// Módulo 27 · F163 · el rol de Vault «pedidos», igual que en vault/configurar.sh (documentación del motor database).
export const ROL_PEDIDOS = {
  db_name: 'tienda',
  creation_statements: `CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO "{{name}}"`,
  revocation_statements: `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM "{{name}}"; DROP ROLE IF EXISTS "{{name}}"`,
  default_ttl: '1h',
  max_ttl: '24h',
};
```

```bash
#!/usr/bin/env bash
# Módulo 27 · F163 · configura el motor database del Vault REAL del docker-compose.yml (hashicorp/vault:2.2.0, modo dev)
# contra postgres:18.7. Comandos de https://developer.hashicorp.com/vault/docs/secrets/databases/postgresql
set -eu
v() { docker compose exec -T -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN=root vault vault "$@"; }
v secrets enable database || true   # si ya estaba habilitado, sigue
v write database/config/tienda \
  plugin_name=postgresql-database-plugin \
  connection_url='postgresql://{{username}}:{{password}}@postgres:5432/tienda?sslmode=disable' \
  allowed_roles=pedidos \
  username=vault_admin password=solo-dev-vault
v write database/roles/pedidos \
  db_name=tienda \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  revocation_statements="REVOKE ALL ON ALL TABLES IN SCHEMA public FROM \"{{name}}\"; DROP ROLE IF EXISTS \"{{name}}\";" \
  default_ttl=1h max_ttl=24h
v read database/creds/pedidos
```

`docker-compose.yml` del laboratorio (solo esta ficha lo usa):

```yaml
# Módulo 27 (modulo-31) · Seguridad Zero-Trust: solo la ficha F163 necesita infraestructura.
#   docker compose up -d --wait
#   ./f163-vault/vault/configurar.sh     -> motor database de Vault apuntando a PostgreSQL
#   node f163-vault/real.js              -> credencial dinámica real: login OK, revocar, login rechazado
#   docker compose down -v
# Vault en modo dev (en memoria, sin TLS, token «root»): SOLO para aprender. Puertos 18200 y 15432 para no chocar
# con un Vault o un PostgreSQL que ya tengas.
services:
  postgres:
    image: postgres:18.7
    environment:
      POSTGRES_USER: vault_admin
      POSTGRES_PASSWORD: solo-dev-vault
      POSTGRES_DB: tienda
    ports: ["15432:5432"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "vault_admin", "-d", "tienda"]
      interval: 3s
      timeout: 3s
      retries: 30
  vault:
    image: hashicorp/vault:2.2.0
    cap_add: ["IPC_LOCK"]
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: root
      VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
    ports: ["18200:8200"]
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "vault", "status", "-address=http://127.0.0.1:8200"]
      interval: 3s
      timeout: 3s
      retries: 30
```

Las dos bases de datos del laboratorio (`f163-vault/bd.js`) y el doble de Vault (`f163-vault/doble-vault.js`):

```javascript
// Módulo 27 · F163 · las dos bases de datos del laboratorio, con la misma interfaz:
//   ejecutar(sentenciasSql)       -> ejecuta lo que Vault manda (creation_statements / revocation_statements)
//   login(usuario, clave, ahora)  -> true si PostgreSQL dejaría entrar
// BdMemoria entiende SOLO las dos formas de SQL de este laboratorio y respeta VALID UNTIL con un reloj inyectable,
// para poder simular 30 días en un segundo. BdPostgres ejecuta el SQL de verdad (pg 8.23.1).
import pg from 'pg';

export class BdMemoria {
  constructor() { this.roles = new Map(); }
  async ejecutar(sql) {
    for (const s of sql.split(';').map((x) => x.trim()).filter(Boolean)) {
      let m = s.match(/^CREATE ROLE "([^"]+)" WITH LOGIN PASSWORD '([^']+)'(?: VALID UNTIL '([^']+)')?$/i);
      if (m) { this.roles.set(m[1], { clave: m[2], hasta: m[3] ? Date.parse(m[3]) : Infinity }); continue; }
      m = s.match(/^DROP ROLE(?: IF EXISTS)? "([^"]+)"$/i);
      if (m) { this.roles.delete(m[1]); continue; }
      if (/^(GRANT .+ TO|REVOKE .+ FROM) "[^"]+"$/i.test(s)) continue; // los permisos no cambian el login
      throw new Error(`BdMemoria no entiende: ${s}`);
    }
  }
  async login(usuario, clave, ahora = Date.now()) {
    const r = this.roles.get(usuario);
    return Boolean(r && r.clave === clave && ahora < r.hasta);
  }
}

export class BdPostgres {
  /** url del administrador que usa Vault (connection_url), p. ej. postgres://vault-admin:…@127.0.0.1:5432/postgres */
  constructor(url) { this.url = new URL(url); }
  async ejecutar(sql) {
    const c = new pg.Client({ connectionString: this.url.href });
    await c.connect();
    try { await c.query(sql); } finally { await c.end(); }
  }
  async login(usuario, clave) { return (await this.intentar(usuario, clave)).ok; }
  /** Como login(), pero devuelve el mensaje real de PostgreSQL si falla. */
  async intentar(usuario, clave) {
    const u = new URL(this.url.href);
    u.username = encodeURIComponent(usuario);
    u.password = encodeURIComponent(clave);
    const c = new pg.Client({ connectionString: u.href, connectionTimeoutMillis: 3000 });
    try { await c.connect(); await c.query('select 1'); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; } finally { await c.end().catch(() => {}); }
  }
}
```

```javascript
// Módulo 27 · F163 · DOBLE de la API HTTP de Vault (motor «database»), para correr el laboratorio sin Docker.
// Implementa solo lo que usa despues.js, con las mismas rutas que Vault 2.2.0:
//   POST /v1/database/roles/:rol      {db_name, creation_statements, revocation_statements, default_ttl, max_ttl}
//   GET  /v1/database/creds/:rol      -> {lease_id, lease_duration, renewable, data:{username,password}}
//   POST /v1/sys/leases/renew         {lease_id, increment}
//   POST /v1/sys/leases/revoke        {lease_id}            (y /v1/sys/leases/revoke-prefix/:prefijo)
// Con --compose, despues.js habla con el Vault real (hashicorp/vault:2.2.0) y nada de este archivo se usa.
import http from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { leerJson, responder } from '../comun/cliente.js';

const segundos = (v) => (typeof v === 'number' ? v : Number(String(v).replace(/h$/, '')) * (String(v).endsWith('h') ? 3600 : 1));

export function crearDobleVault({ bd, token = 'root', reloj = () => Date.now() }) {
  const roles = new Map();
  const leases = new Map(); // lease_id -> { rol, usuario, vence }

  async function revocar(id) {
    const l = leases.get(id);
    if (!l) return;
    const sql = roles.get(l.rol).revocation_statements.replaceAll('{{name}}', l.usuario);
    await bd.ejecutar(sql);
    leases.delete(id);
  }

  const servidor = http.createServer(async (req, res) => {
    if (req.headers['x-vault-token'] !== token) return responder(res, 403, { errors: ['permission denied'] });
    const url = new URL(req.url, 'http://x');
    let m;
    if (req.method === 'POST' && (m = url.pathname.match(/^\/v1\/database\/roles\/([\w-]+)$/))) {
      roles.set(m[1], await leerJson(req));
      return res.writeHead(204).end();
    }
    if (req.method === 'GET' && (m = url.pathname.match(/^\/v1\/database\/creds\/([\w-]+)$/))) {
      const rol = roles.get(m[1]);
      if (!rol) return responder(res, 400, { errors: [`unknown role: ${m[1]}`] });
      const ttl = segundos(rol.default_ttl);
      const usuario = `v-${m[1]}-${randomBytes(4).toString('hex')}`;
      const clave = randomBytes(18).toString('base64url');
      const vence = reloj() + ttl * 1000;
      const sql = rol.creation_statements.replaceAll('{{name}}', usuario).replaceAll('{{password}}', clave)
        .replaceAll('{{expiration}}', new Date(vence).toISOString());
      await bd.ejecutar(sql);
      const lease_id = `database/creds/${m[1]}/${randomUUID()}`;
      leases.set(lease_id, { rol: m[1], usuario, vence, max: reloj() + segundos(rol.max_ttl) * 1000 });
      return responder(res, 200, { lease_id, lease_duration: ttl, renewable: true, data: { username: usuario, password: clave } });
    }
    if (req.method === 'POST' && url.pathname === '/v1/sys/leases/renew') {
      const { lease_id, increment = 0 } = await leerJson(req);
      const l = leases.get(lease_id);
      if (!l) return responder(res, 400, { errors: ['lease not found'] });
      l.vence = Math.min(reloj() + segundos(increment || roles.get(l.rol).default_ttl) * 1000, l.max);
      return responder(res, 200, { lease_id, renewable: true, lease_duration: Math.round((l.vence - reloj()) / 1000) });
    }
    if (req.method === 'POST' && url.pathname === '/v1/sys/leases/revoke') {
      await revocar((await leerJson(req)).lease_id);
      return res.writeHead(204).end();
    }
    if (req.method === 'POST' && (m = url.pathname.match(/^\/v1\/sys\/leases\/revoke-prefix\/(.+)$/))) {
      for (const id of [...leases.keys()]) if (id.startsWith(m[1])) await revocar(id);
      return res.writeHead(204).end();
    }
    responder(res, 404, { errors: [] });
  });
  /** Vault revoca solo lo que caduca; aquí se dispara a mano tras mover el reloj. */
  servidor.caducar = async () => { for (const [id, l] of [...leases]) if (l.vence <= reloj()) await revocar(id); };
  servidor.leases = leases;
  return servidor;
}
```

#### Verificación
Test que debes ejecutar (`f163-vault/vault.test.js`); el quinto usa PostgreSQL real si defines `PGURL`:

```javascript
// Módulo 27 · F163 · tests: node --test f163-vault/vault.test.js
// Sin variables usa BdMemoria. Con PGURL=postgres://vault_admin:solo-dev-vault@127.0.0.1:5432/tienda ejecuta además el
// SQL de verdad en PostgreSQL (CREATE ROLE … VALID UNTIL, login real, DROP ROLE) con un lease de 2 s.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as esperar } from 'node:timers/promises';
import { BdMemoria, BdPostgres } from './bd.js';
import { crearDobleVault } from './doble-vault.js';
import { ClienteVault, CredencialesDinamicas } from './despues.js';
import { conectarAntes, SQL_ANTES } from './antes.js';
import { ROL_PEDIDOS } from './rol.js';
import { escuchar } from '../comun/cliente.js';

async function montar(bd, rol = ROL_PEDIDOS, reloj) {
  const doble = crearDobleVault({ bd, reloj });
  const v = await escuchar(doble);
  await fetch(`http://127.0.0.1:${v.puerto}/v1/database/roles/pedidos`, { method: 'POST', headers: { 'X-Vault-Token': 'root' }, body: JSON.stringify(rol) });
  return { doble, v, vault: new ClienteVault({ direccion: `http://127.0.0.1:${v.puerto}`, token: 'root' }) };
}

test('ANTES: la credencial estática filtrada sigue sirviendo 30 días después', async () => {
  const bd = new BdMemoria();
  await bd.ejecutar(SQL_ANTES);
  assert.equal((await conectarAntes(bd, 'atacante', Date.now() + 30 * 86400_000)).ok, true);
});

test('DESPUÉS: cada instancia recibe un usuario distinto con lease de 1 h', async () => {
  const { v, vault } = await montar(new BdMemoria());
  const a = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  const b = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  assert.notEqual(a.usuario, b.usuario);
  assert.match(a.usuario, /^v-pedidos-/);
  assert.equal(a.duracion, 3600);
  await a.cerrar(); await b.cerrar(); await v.cerrar();
});

test('DESPUÉS: al caducar el lease el login falla y el rol desaparece', async () => {
  let ahora = Date.now();
  const bd = new BdMemoria();
  const { doble, v, vault } = await montar(bd, ROL_PEDIDOS, () => ahora);
  const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  assert.equal(await bd.login(c.usuario, c.clave, ahora), true);
  ahora += 3600_000;
  await doble.caducar();
  assert.equal(await bd.login(c.usuario, c.clave, ahora), false);
  clearTimeout(c.temporizador); await v.cerrar();
});

test('DESPUÉS: revocar el lease corta la credencial al momento', async () => {
  const bd = new BdMemoria();
  const { v, vault } = await montar(bd);
  const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  await c.cerrar();
  assert.equal(await bd.login(c.usuario, c.clave), false);
  await v.cerrar();
});

test('PostgreSQL real (PGURL): VALID UNTIL corta el login y la revocación borra el rol', { skip: !process.env.PGURL && 'sin PGURL: solo BdMemoria' }, async () => {
  const bd = new BdPostgres(process.env.PGURL);
  const { v, vault } = await montar(bd, { ...ROL_PEDIDOS, default_ttl: 2 });
  const c = await new CredencialesDinamicas(vault, 'pedidos').iniciar();
  clearTimeout(c.temporizador); // sin renovar: que caduque
  assert.equal(await bd.login(c.usuario, c.clave), true, 'recién creada debe entrar');
  await esperar(3000);
  assert.equal(await bd.login(c.usuario, c.clave), false, 'pasado VALID UNTIL PostgreSQL debe rechazarla');
  await vault.revocar(c.leaseId);
  await v.cerrar();
});
```

```bash
PGURL=postgres://vault_admin:solo-dev-vault@127.0.0.1:5432/tienda node --test f163-vault/vault.test.js
```

Salida real contra el PostgreSQL 16 local de este entorno:

```text
✔ ANTES: la credencial estática filtrada sigue sirviendo 30 días después
✔ DESPUÉS: cada instancia recibe un usuario distinto con lease de 1 h
✔ DESPUÉS: al caducar el lease el login falla y el rol desaparece
✔ DESPUÉS: revocar el lease corta la credencial al momento
✔ PostgreSQL real (PGURL): VALID UNTIL corta el login y la revocación borra el rol
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms …
```

**Pregunta de comprobación:** si el servicio se cae sin revocar su lease, ¿cuánto tiempo sigue existiendo su usuario en
PostgreSQL? (Hasta que caduque el lease: `default_ttl`, 1 h, o lo que quede tras la última renovación. Y aunque Vault no
lo borrase, `VALID UNTIL` impide entrar con contraseña después de esa hora.)

</details>

### Service Mesh

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Explicar qué aporta una malla de servicios a Zero-Trust (identidad, cifrado y política aplicada en el destino, sin tocar el código), comparar el modo sidecar con el modo ambient de Istio (ztunnel L4 + waypoint L7), y demostrar con un sidecar escrito en Node que la seguridad de pe…

#### ► LA IDEA EN UNA FRASE
**Explicar qué aporta una malla de servicios a Zero-Trust (identidad, cifrado y política aplicada en el destino, sin tocar el código), comparar el modo sidecar con el modo ambient de Istio (ztunnel L4 + waypoint L7), y demostrar con un sidecar escrito en Node que la seguridad de perímetro se salta llamando directamente al servicio mientras que la política en el destino no.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en service mesh como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    subgraph ANTES["ANTES · perímetro"]
        GW1["gateway del borde<br/>(política aquí)"] --> APP1["inventario :puerto TCP"]
        CAT1["catalogo comprometido"] -- "POST /admin/ajustes directo" --> APP1
    end
    subgraph DESPUES["DESPUÉS · malla (política en el destino)"]
        CAT2["catalogo<br/>cert .../sa/catalogo"] -- "mTLS" --> SC["sidecar de inventario<br/>politica.json · denegar por defecto"]
        PED["pedidos<br/>cert .../sa/pedidos"] -- "mTLS" --> SC
        SC -- "socket local del pod" --> APP2["inventario"]
    end
    subgraph AMBIENT["Istio ambient"]
        ZT["ztunnel por nodo<br/>L4: identidad, puerto"] --> WP["waypoint (opcional)<br/>L7: método, ruta"]
    end
```

1. En una empresa con muchos servicios, si la seguridad está **solo en la puerta de entrada**, cualquier servicio de
2. Una **malla de servicios** (service mesh) pone un pequeño programa (un **proxy**) junto a cada servicio. Todo el
3. Lo bueno: los equipos **no tocan su código**; las reglas se escriben una vez, en un archivo, y se aplican igual en
4. Lo que cuesta: más piezas que operar, algo más de latencia y de memoria, y aprender a depurar «por qué la malla me

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Service Mesh se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Service Mesh | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El castillo con foso: toda la seguridad en el API Gateway y la red interna como zona de confianza («si llegó hasta aquí, es de los nuestros»).

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: service mesh funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- En una empresa con muchos servicios, si la seguridad está **solo en la puerta de entrada**, cualquier servicio de
- Una **malla de servicios** (service mesh) pone un pequeño programa (un **proxy**) junto a cada servicio. Todo el
- Lo bueno: los equipos **no tocan su código**; las reglas se escriben una vez, en un archivo, y se aplican igual en
- Lo que cuesta: más piezas que operar, algo más de latencia y de memoria, y aprender a depurar «por qué la malla me

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve service mesh en tu contexto?
2. ¿Cómo sabrías que service mesh no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar service mesh?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    subgraph ANTES["ANTES · perímetro"]
        GW1["gateway del borde<br/>(política aquí)"] --> APP1["inventario :puerto TCP"]
        CAT1["catalogo comprometido"] -- "POST /admin/ajustes directo" --> APP1
    end
    subgraph DESPUES["DESPUÉS · malla (política en el destino)"]
        CAT2["catalogo<br/>cert .../sa/catalogo"] -- "mTLS" --> SC["sidecar de inventario<br/>politica.json · denegar por defecto"]
        PED["pedidos<br/>cert .../sa/pedidos"] -- "mTLS" --> SC
        SC -- "socket local del pod" --> APP2["inventario"]
    end
    subgraph AMBIENT["Istio ambient"]
        ZT["ztunnel por nodo<br/>L4: identidad, puerto"] --> WP["waypoint (opcional)<br/>L7: método, ruta"]
    end
```

```javascript
// Módulo 27 · F164 · la aplicación «inventario», idéntica antes y después: NO sabe nada de seguridad.
// Tiene un endpoint administrativo peligroso (POST /admin/ajustes) que nadie debería alcanzar desde la red.
import http from 'node:http';
import { responder } from '../comun/cliente.js';

export function crearInventario() {
  let stock = 10;
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/stock') return responder(res, 200, { stock });
    if (req.method === 'POST' && req.url === '/reservas') { stock -= 1; return responder(res, 200, { reservado: true, stock }); }
    if (req.method === 'POST' && req.url === '/admin/ajustes') { stock = 0; return responder(res, 200, { ajustado: true, stock }); }
    responder(res, 404, { error: 'no existe' });
  });
}
```

```javascript
// Módulo 27 · F164 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Seguridad de PERÍMETRO: un gateway en el borde aplica la política, y dentro de la red todo se confía.
// inventario escucha en un puerto TCP de la red interna, así que cualquier servicio de dentro (o un pod
// comprometido) puede llamarlo directamente y saltarse el gateway.
import http from 'node:http';
import { escuchar, responder } from '../comun/cliente.js';
import { crearInventario } from './app.js';

export async function arrancarAntes() {
  const app = await escuchar(crearInventario()); // ✘ puerto TCP alcanzable desde toda la red interna
  const gateway = http.createServer((req, res) => {
    // El gateway del borde solo deja pasar GET /stock desde fuera.
    if (!(req.method === 'GET' && req.url === '/stock')) return responder(res, 403, { error: 'gateway: prohibido' });
    const p = http.request({ host: '127.0.0.1', port: app.puerto, path: req.url, method: req.method, headers: req.headers }, (r) => {
      res.writeHead(r.statusCode, r.headers); r.pipe(res);
    });
    req.pipe(p);
  });
  const gw = await escuchar(gateway);
  return { app, gw, cerrar: async () => { await gw.cerrar(); await app.cerrar(); } };
}
```

```json
{
  "comentario": "Módulo 27 · F164 · política de la malla para inventario, con la semántica de una AuthorizationPolicy ALLOW de Istio: si ninguna regla coincide, se deniega (denegar por defecto).",
  "servicio": "inventario",
  "reglas": [
    {
      "de": ["spiffe://cluster.local/ns/tienda/sa/pedidos", "spiffe://cluster.local/ns/tienda/sa/catalogo"],
      "a": { "metodos": ["GET"], "rutas": ["/stock"] }
    },
    {
      "de": ["spiffe://cluster.local/ns/tienda/sa/pedidos"],
      "a": { "metodos": ["POST"], "rutas": ["/reservas"] }
    }
  ]
}
```

```javascript
// Módulo 27 · F164 · DESPUÉS (seguro): un «sidecar» por servicio, como el Envoy de Istio (o el proxy de Linkerd):
//   - la app escucha SOLO en un socket local del pod (aquí, un socket Unix): no hay puerto de la app en la red;
//   - el sidecar es el único punto de entrada: mTLS estricto, identidad SPIFFE del certificado;
//   - la política (politica.json) se aplica en el DESTINO y deniega por defecto;
//   - capa 'L7' (sidecar o waypoint) ve método y ruta; capa 'L4' (ztunnel de Istio ambient) solo ve identidad y puerto:
//     una regla ALLOW con métodos o rutas NUNCA coincide en L4 (así lo documenta Istio), y se deniega.
import http from 'node:http';
import https from 'node:https';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { credenciales, spiffeDe } from '../comun/pki.js';
import { escuchar, responder } from '../comun/cliente.js';
import { crearInventario } from './app.js';

export const POLITICA = JSON.parse(readFileSync(new URL('./politica.json', import.meta.url)));

/** Evalúa la política: true si alguna regla ALLOW coincide. En L4 las reglas con métodos/rutas no coinciden nunca. */
export function permitido(politica, { identidad, metodo, ruta, capa = 'L7' }) {
  return politica.reglas.some((r) => {
    if (!r.de.includes(identidad)) return false;
    const tieneL7 = Boolean(r.a?.metodos || r.a?.rutas);
    if (tieneL7 && capa === 'L4') return false;
    return (!r.a?.metodos || r.a.metodos.includes(metodo)) && (!r.a?.rutas || r.a.rutas.includes(ruta));
  });
}

export async function arrancarDespues({ politica = POLITICA, capa = 'L7' } = {}) {
  const socket = join(mkdtempSync(join(tmpdir(), 'pod-inventario-')), 'app.sock');
  const app = crearInventario();
  await new Promise((r) => app.listen(socket, r)); // ✔ solo dentro del «pod»
  const { cert, key, ca } = credenciales('inventario');
  const sidecar = https.createServer({ cert, key, ca, requestCert: true, rejectUnauthorized: true }, (req, res) => {
    const identidad = spiffeDe(req.socket.getPeerCertificate());
    if (!permitido(politica, { identidad, metodo: req.method, ruta: req.url, capa })) {
      if (capa === 'L4') return req.socket.destroy(); // ztunnel deniega cortando la conexión
      return responder(res, 403, { error: 'RBAC: access denied', identidad });
    }
    const p = http.request({ socketPath: socket, path: req.url, method: req.method, headers: req.headers }, (r) => {
      res.writeHead(r.statusCode, r.headers); r.pipe(res);
    });
    req.pipe(p);
  });
  const sc = await escuchar(sidecar);
  return { sidecar: sc, socket, cerrar: async () => { await sc.cerrar(); await new Promise((r) => app.close(r)); } };
}
```

```yaml
# Módulo 27 · F164 · DESPUÉS en Istio 1.32 modo ambient (sin sidecars): ztunnel por nodo (L4) + waypoint (L7).
# Antes de aplicar: istioctl install --set profile=ambient --skip-confirmation
#                   kubectl label namespace tienda istio.io/dataplane-mode=ambient
#                   istioctl waypoint apply -n tienda --enroll-namespace
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: denegar-todo            # spec vacío: no permite nada (denegar por defecto en el namespace)
  namespace: tienda
spec: {}
---
# L4 (la aplica ztunnel): solo identidades, sin métodos ni rutas. Deja entrar al waypoint del namespace,
# a pedidos y a catalogo hacia inventario.
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: inventario-l4
  namespace: tienda
spec:
  selector:
    matchLabels:
      app: inventario
  action: ALLOW
  rules:
  - from:
    - source:
        principals:
        - "cluster.local/ns/tienda/sa/waypoint"
        - "cluster.local/ns/tienda/sa/pedidos"
        - "cluster.local/ns/tienda/sa/catalogo"
---
# L7 (la aplica el waypoint): métodos y rutas. Se enlaza al Service con targetRefs, no con selector.
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: inventario-l7
  namespace: tienda
spec:
  targetRefs:
  - kind: Service
    group: ""
    name: inventario
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/tienda/sa/pedidos", "cluster.local/ns/tienda/sa/catalogo"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/stock"]
  - from:
    - source:
        principals: ["cluster.local/ns/tienda/sa/pedidos"]
    to:
    - operation:
        methods: ["POST"]
        paths: ["/reservas"]
```

</details>
