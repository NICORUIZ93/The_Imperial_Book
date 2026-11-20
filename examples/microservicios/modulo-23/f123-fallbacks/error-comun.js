// Módulo 19 · F123 · ERROR COMÚN: un fallback que inventa un valor «normal» (stock: 0) y no avisa a nadie.
// El inventario está caído, pero la tienda muestra «agotado» en todos los productos y ninguna alerta salta.
// Requisitos: infraestructura arriba. Ejecuta: node f123-fallbacks/error-comun.js
import { apagar, sanar, INVENTARIO_URL } from '../comun/toxiproxy.js';

async function stockMal(sku) {
  try {
    const r = await fetch(`${INVENTARIO_URL}/stock/${sku}`, { signal: AbortSignal.timeout(500) });
    return (await r.json()).stock;
  } catch {
    return 0; // «por si acaso»: sin log, sin métrica, y 0 significa otra cosa
  }
}
async function stockBien(sku) {
  try {
    const r = await fetch(`${INVENTARIO_URL}/stock/${sku}`, { signal: AbortSignal.timeout(500) });
    return { stock: (await r.json()).stock, degradado: false };
  } catch (error) {
    console.log(`   [fallback] inventario sin respuesta: ${error.cause?.code ?? error.name}`); // + contador para la alerta
    return { stock: null, degradado: true };
  }
}
const etiqueta = (r) => (r.degradado ? 'Disponibilidad por confirmar' : r.stock > 0 ? `Quedan ${r.stock}` : 'Agotado');

await sanar();
await apagar('inventario');
console.log('== MAL: el fallback devuelve 0');
console.log(`   la tienda muestra: "${(await stockMal('7')) > 0 ? 'Disponible' : 'Agotado'}"   <- falso: hay 12 unidades, y nadie se entera de la caída`);
console.log('== BIEN: el fallback dice «no sé» y deja rastro');
console.log(`   la tienda muestra: "${etiqueta(await stockBien('7'))}"`);
await sanar();
