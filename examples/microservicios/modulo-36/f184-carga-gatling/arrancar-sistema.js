// Módulo 32 · F184 · Arranca el sistema completo para el test de carga, en puertos fijos:
//   proveedor de pagos y reservas en puertos libres · gateway :8080 (50 peticiones/s por cliente, ráfaga de 100)
// LIMITE_RPS=20 activa la restricción sobrevenida del proveedor (F185). Al recibir SIGINT/SIGTERM imprime el resumen.
// Ejecuta: [LIMITE_RPS=20] [COBROS_POR_SEGUNDO=18] node f184-carga-gatling/arrancar-sistema.js
import { montarSistema } from '../f181-sistema-reservas/montaje.js';
import { crearGateway } from '../f183-gateway-rate-limit/gateway.js';
import { LimitadorMemoria } from '../f183-gateway-rate-limit/limitador.js';
import { limitarCobros } from '../f185-restriccion-sobrevenida/cola-cobros.js';

const limiteRps = process.env.LIMITE_RPS ? Number(process.env.LIMITE_RPS) : Infinity;
const cobrosPorSegundo = process.env.COBROS_POR_SEGUNDO ? Number(process.env.COBROS_POR_SEGUNDO) : 0;
const s = await montarSistema({ aforo: 1_000_000, proveedor: { limiteRps },
  envolverActividades: cobrosPorSegundo ? (a) => limitarCobros(a, cobrosPorSegundo) : (a) => a,
  politica: { intentos: 3, inicialMs: 100 } });
const gateway = crearGateway({ reservasUrl: s.reservasUrl, limitador: new LimitadorMemoria({ tasa: Number(process.env.TASA_GATEWAY ?? 50), capacidad: 100 }) });
gateway.listen(Number(process.env.PORT ?? 8080), '127.0.0.1', () =>
  console.log(`sistema listo: gateway :${gateway.address().port} · proveedor ${limiteRps === Infinity ? 'sin límite' : `limitado a ${limiteRps}/s`}${cobrosPorSegundo ? ` · cobros a ${cobrosPorSegundo}/s` : ''}`));

function resumen() {
  const t = s.repo.todas();
  const n = (e) => t.filter((r) => r.estado === e).length;
  console.log(`resumen: ${t.length} reservas · ${n('CONFIRMADA')} CONFIRMADA · ${n('CANCELADA')} CANCELADA · ${n('PENDIENTE')} PENDIENTE · 429 del proveedor: ${s.stats.rechazados429}`);
  process.exit(0);
}
process.on('SIGINT', resumen);
process.on('SIGTERM', resumen);
