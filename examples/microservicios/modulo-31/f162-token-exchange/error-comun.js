// Módulo 27 · F162 · ERROR COMÚN: reutilizar el token canjeado para pagos en otro destino (antifraude).
// Síntoma: 401 invalid_token con «aud=pagos». Diagnóstico: decodifica el token y mira aud y act.
// Arreglo: un canje por destino (audience=antifraude), hecho por quien llama (pagos), no por pedidos.
// Ejecuta: node f162-token-exchange/error-comun.js
import { nuevasClaves, firmar, leerSinVerificar } from '../comun/jwt.js';
import { credenciales } from '../comun/pki.js';
import { escuchar, llamar, resumen } from '../comun/cliente.js';
import { canjear, ISS_IDP } from './sts.js';
import { crearAntifraude } from './despues.js';
import { X509Certificate } from 'node:crypto';

const clavesIdp = nuevasClaves();
const clavesSts = nuevasClaves();
const pedidos = credenciales('pedidos');
const deAna = firmar({ iss: ISS_IDP, sub: 'ana', aud: 'pedidos' }, clavesIdp.privateKey);
const r = canjear(
  { grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange', subject_token: deAna,
    subject_token_type: 'urn:ietf:params:oauth:token-type:access_token', audience: 'pagos', scope: 'pagos:cobrar' },
  { clienteSpiffe: 'spiffe://cluster.local/ns/tienda/sa/pedidos', clienteDer: new X509Certificate(pedidos.cert).raw, clavesIdp, clavesSts },
);
const antifraude = await escuchar(crearAntifraude({ clavesSts }));
const resp = await llamar(`https://127.0.0.1:${antifraude.puerto}/evaluar`, { metodo: 'POST', tls: pedidos, cabeceras: { authorization: `Bearer ${r.body.access_token}` } });
console.log(`pedidos -> antifraude con el token canjeado para pagos: ${resumen(resp)}`);
const t = leerSinVerificar(r.body.access_token);
console.log(`diagnóstico (payload decodificado): aud=${t.aud} act.sub=${t.act.sub.split('/').pop()} scope="${t.scope}"`);
await antifraude.cerrar();
