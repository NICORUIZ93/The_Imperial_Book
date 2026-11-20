// Módulo 22 · F138 · Demo: el reembolso se ejecuta 3 veces (2 respuestas perdidas + 1 buena) y el dinero vuelve UNA vez.
// Ejecuta: node f138-compensaciones/demo.js
import { PagosService } from './pagos.js';
import { redQuePierde, compensarConReintentos } from './red.js';

const pagos = new PagosService();
pagos.cobrar('S-1', 'ana', 300);
console.log(`tras cobrar S-1: saldo de ana = ${pagos.saldo.get('ana')}`);

const remoto = redQuePierde(pagos, { perderRespuestas: 2 });
await compensarConReintentos(() => remoto.reembolsar('S-1'), { registro: (l) => console.log(`  reembolsar S-1 · ${l}`) });
console.log(`tras compensar S-1: saldo de ana = ${pagos.saldo.get('ana')} · movimientos: ${pagos.operaciones.join(' | ')}`);

// Orden invertido: la compensación de S-2 llega ANTES que su cobro (el cobro iba lento por la red).
console.log('reembolsar S-2 antes de cobrarlo →', JSON.stringify(pagos.reembolsar('S-2')));
console.log('cobrar S-2 tarde                  →', JSON.stringify(pagos.cobrar('S-2', 'ana', 200)));
console.log(`saldo final de ana = ${pagos.saldo.get('ana')}`);
