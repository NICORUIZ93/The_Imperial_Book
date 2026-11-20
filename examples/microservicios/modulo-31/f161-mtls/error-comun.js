// Módulo 27 · F161 · ERROR COMÚN: certificado de servidor sin el nombre con el que lo llaman en el SAN.
// pki/certs/sin-san.crt solo lleva la URI SPIFFE (sin DNS:localhost ni IP:127.0.0.1). El cliente verifica el nombre
// y corta: ERR_TLS_CERT_ALTNAME_INVALID. Arreglo: emitir el certificado con el SAN correcto (o, en una malla,
// dejar que el sidecar verifique la identidad SPIFFE en lugar del nombre DNS).
// Ejecuta: node f161-mtls/error-comun.js
import https from 'node:https';
import { credenciales } from '../comun/pki.js';
import { escuchar, llamar, resumen, responder } from '../comun/cliente.js';

const malo = credenciales('sin-san');
const bueno = credenciales('pagos');
const cliente = credenciales('pedidos');
for (const [nombre, c] of [['sin-san.crt (solo URI SPIFFE)', malo], ['pagos.crt (DNS, IP y URI)', bueno]]) {
  const srv = await escuchar(https.createServer({ cert: c.cert, key: c.key, ca: c.ca, requestCert: true, rejectUnauthorized: true },
    (req, res) => responder(res, 200, { ok: true })));
  const r = await llamar(`https://127.0.0.1:${srv.puerto}/`, { tls: cliente });
  console.log(`${nombre.padEnd(30)} -> ${resumen(r)}`);
  await srv.cerrar();
}
