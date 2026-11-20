// Módulo 19 · F119 · El mismo circuito con cockatiel 4.0.0, en TypeScript (políticas componibles y tipadas).
// Requisitos: Node.js 26.13.1 LTS (ejecuta .ts quitando los tipos) y TypeScript 6.0.3 para comprobarlos (npm run tipos).
// Ejecuta con la infraestructura arriba: node f119-circuit-breaker/cockatiel.ts
import {
  BrokenCircuitError, CircuitState, ConsecutiveBreaker, circuitBreaker, handleWhen, timeout, TimeoutStrategy, wrap,
  type IPolicy,
} from 'cockatiel';
import { apagar, encender, sanar, dormir, INVENTARIO_URL } from '../comun/toxiproxy.js';

interface Stock { sku: string; stock: number }
class ErrorDeNegocio extends Error {}

// Política 1: límite de tiempo de 500 ms. «Aggressive» rechaza al vencer y aborta la señal que recibe la función.
const limite = timeout(500, TimeoutStrategy.Aggressive);
// Política 2: el circuito. Se abre con 3 fallos SEGUIDOS y prueba de nuevo tras 1 s.
// handleWhen decide qué errores cuentan: los de negocio (4xx) no.
const circuito = circuitBreaker(handleWhen((error) => !(error instanceof ErrorDeNegocio)), {
  halfOpenAfter: 1000,
  breaker: new ConsecutiveBreaker(3),
});
// wrap compone de fuera hacia dentro: primero el circuito, dentro el límite de tiempo.
const politica: IPolicy = wrap(circuito, limite);

const cambios: string[] = []; // los eventos llegan durante la llamada: se muestran después de su línea
circuito.onBreak(() => cambios.push('Open'));
circuito.onHalfOpen(() => cambios.push('HalfOpen (llamada de prueba)'));
circuito.onReset(() => cambios.push('Closed'));

const NOMBRE = { [CircuitState.Closed]: 'Closed', [CircuitState.Open]: 'Open', [CircuitState.HalfOpen]: 'HalfOpen', [CircuitState.Isolated]: 'Isolated' };

async function consultarStock(sku: string): Promise<Stock> {
  return politica.execute(async ({ signal }) => {
    const r = await fetch(`${INVENTARIO_URL}/stock/${sku}`, { signal });
    if (r.status >= 500) throw new Error(`inventario respondió ${r.status}`);
    if (!r.ok) throw new ErrorDeNegocio(`sku ${sku} desconocido`);
    return (await r.json()) as Stock;
  });
}

async function llamar(n: number): Promise<void> {
  const antes = NOMBRE[circuito.state];
  try {
    console.log(`llamada ${n} [${antes}] OK ${JSON.stringify(await consultarStock('7'))}`);
  } catch (error) {
    const texto = error instanceof BrokenCircuitError ? 'RECHAZADA (BrokenCircuitError)' : `FALLO ${(error as { cause?: { code?: string } }).cause?.code ?? (error as Error).name}`;
    console.log(`llamada ${n} [${antes}] ${texto}`);
  }
  while (cambios.length > 0) console.log(`   -> el circuito pasa a ${cambios.shift()}`);
}

await sanar();
await llamar(1);
await apagar('inventario'); // fallo inyectado con Toxiproxy
for (let n = 2; n <= 5; n += 1) await llamar(n);
await encender('inventario');
await dormir(1100);
await llamar(6);
await llamar(7);
if (circuito.state !== CircuitState.Closed) throw new Error('el circuito debía terminar cerrado');
console.log('OK: cockatiel abrió con 3 fallos seguidos, rechazó y se cerró al volver el inventario');
