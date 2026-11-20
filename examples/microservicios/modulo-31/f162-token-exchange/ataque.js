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
