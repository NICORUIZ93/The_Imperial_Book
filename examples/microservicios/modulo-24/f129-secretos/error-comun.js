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
