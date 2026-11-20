// Módulo 19 · F120 · La misma política con cockatiel 4.0.0: retry + backoff exponencial con jitter.
// Requisitos: Node.js 26.13.1 LTS, cockatiel 4.0.0 e infraestructura arriba. Ejecuta: node f120-retry/con-cockatiel.js
import { ExponentialBackoff, handleWhen, retry } from 'cockatiel';
import { apagar, encender, sanar, INVENTARIO_URL } from '../comun/toxiproxy.js';

class ErrorNoReintentable extends Error {}

// ExponentialBackoff usa por defecto «decorrelated jitter»: cada espera es aleatoria y depende de la anterior.
const politica = retry(handleWhen((error) => !(error instanceof ErrorNoReintentable)), {
  maxAttempts: 4, // reintentos DESPUÉS del primer intento: 5 intentos en total
  backoff: new ExponentialBackoff({ initialDelay: 100, maxDelay: 2000 }),
});
politica.onRetry(({ attempt, delay }) => console.log(`   reintento ${attempt} en ${Math.round(delay)} ms`));
politica.onGiveUp(() => console.log('   se acabaron los reintentos'));

await sanar();
await apagar('inventario');                       // fallo inyectado
setTimeout(() => encender('inventario'), 250);    // el inventario «vuelve» a los 250 ms
const stock = await politica.execute(async ({ attempt, signal }) => {
  console.log(`intento ${attempt + 1}`);
  const r = await fetch(`${INVENTARIO_URL}/stock/7`, { signal });
  if (r.status >= 500) throw new Error(`HTTP ${r.status}`);
  if (!r.ok) throw new ErrorNoReintentable(`HTTP ${r.status}`);
  return r.json();
});
console.log(`OK ${JSON.stringify(stock)}`);
