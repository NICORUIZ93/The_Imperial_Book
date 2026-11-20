// Módulo 22 · F138 · Error común: una compensación que aplica un DELTA y genera un id nuevo en cada intento.
// Con 2 respuestas perdidas, el coordinador reintenta 3 veces y el cliente recibe el dinero 3 veces.
// Ejecuta: node f138-compensaciones/error-comun.js
import { randomUUID } from 'node:crypto';
import { redQuePierde, compensarConReintentos } from './red.js';

export class PagosIngenuo {
  saldo = new Map([['ana', 700]]);   // ya se cobraron 300 de 1000
  reembolsos = new Map();
  reembolsar(_sagaId, cliente, monto) {
    const id = randomUUID();                                        // MAL: id nuevo en cada intento
    this.reembolsos.set(id, monto);
    this.saldo.set(cliente, this.saldo.get(cliente) + monto);       // MAL: delta, no estado
    return { reembolsoId: id };
  }
}

if (import.meta.main) {
  const pagos = new PagosIngenuo();
  const remoto = redQuePierde(pagos, { perderRespuestas: 2 });
  await compensarConReintentos(() => remoto.reembolsar('S-1', 'ana', 300), { registro: (l) => console.log(`  ${l}`) });
  console.log(`cobrados 300, reembolsados ${[...pagos.reembolsos.values()].reduce((a, b) => a + b, 0)} · saldo de ana = ${pagos.saldo.get('ana')} (debía quedar en 1000)`);
}
