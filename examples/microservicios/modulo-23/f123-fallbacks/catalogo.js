// Módulo 19 · F123 · Fallback strategies: qué responder cuando el inventario no contesta.
// Tres estrategias en orden: (1) último valor bueno en caché, (2) valor por defecto degradado, (3) fallar rápido.
// Requisitos: Node.js 26.13.1 LTS, opossum 10.0.0 y express 5.3.0. Ejecuta: node f123-fallbacks/catalogo.js (:3123)
import express from 'express';
import CircuitBreaker from 'opossum';

const INVENTARIO_URL = process.env.INVENTARIO_URL ?? 'http://127.0.0.1:21212';
const NOMBRES = { 7: 'Teclado', 8: 'Mouse', 9: 'Monitor' };

export function crearCatalogo({ urlInventario = INVENTARIO_URL, edadMaximaMs = 60_000, log = console.log } = {}) {
  const ultimoBueno = new Map(); // sku -> { stock, guardado }  (en producción: Redis, con TTL)
  const metricas = { inventario: 0, cache: 0, defecto: 0 }; // cuántas respuestas salieron de cada fuente

  async function consultar(sku) {
    const r = await fetch(`${urlInventario}/stock/${sku}`, { signal: AbortSignal.timeout(500) });
    if (!r.ok) throw new Error(`inventario respondió ${r.status}`);
    const { stock } = await r.json();
    ultimoBueno.set(sku, { stock, guardado: Date.now() }); // cada éxito alimenta el fallback
    return { stock, fuente: 'inventario', degradado: false };
  }

  const circuito = new CircuitBreaker(consultar, { name: 'inventario', timeout: false, volumeThreshold: 4, resetTimeout: 1000 });
  // El fallback se ejecuta cuando la acción falla O cuando el circuito está abierto. Recibe los mismos argumentos + el error.
  circuito.fallback((sku, error) => {
    const guardado = ultimoBueno.get(sku);
    if (guardado && Date.now() - guardado.guardado <= edadMaximaMs) {
      // Estrategia 1: último valor bueno. Sirve para LEER; se marca como degradado y con su edad.
      return { stock: guardado.stock, fuente: 'cache', degradado: true, edadMs: Date.now() - guardado.guardado };
    }
    // Estrategia 2: valor por defecto HONESTO. «No sé» (null), nunca un 0 inventado que diría «agotado».
    return { stock: null, fuente: 'defecto', degradado: true, motivo: error?.code ?? error?.cause?.code ?? error?.name };
  });
  // Un fallback silencioso esconde la caída: cuenta y registra cada uno.
  circuito.on('success', (resultado) => { metricas[resultado.fuente] += 1; });
  circuito.on('fallback', (resultado, error) => {
    metricas[resultado.fuente] += 1;
    log(`[fallback] fuente=${resultado.fuente} causa=${error?.code ?? error?.cause?.code ?? error?.name}`);
  });

  const app = express();
  app.use(express.json());

  // LECTURA: admite degradarse. El cliente ve `degradado` y puede mostrar «disponibilidad por confirmar».
  app.get('/catalogo/:sku', async (req, res) => {
    const { sku } = req.params;
    if (!NOMBRES[sku]) return res.status(404).json({ error: 'producto desconocido' });
    const stock = await circuito.fire(sku); // nunca lanza: siempre hay fallback
    if (stock.degradado) res.set('Warning', '110 - "respuesta degradada"');
    res.json({ sku, nombre: NOMBRES[sku], ...stock });
  });

  // ESCRITURA: Estrategia 3, fallar rápido. No se vende con un stock supuesto: 503 y que el cliente reintente.
  app.post('/compras', async (req, res) => {
    const sku = String(req.body?.sku);
    try {
      const { stock } = await consultar(sku); // sin fallback a propósito
      if (stock < 1) return res.status(409).json({ error: 'sin stock' });
      res.status(201).json({ compra: 'aceptada', sku });
    } catch {
      res.set('Retry-After', '5');
      res.status(503).json({ error: 'no podemos confirmar el stock ahora; inténtalo en unos segundos' });
    }
  });

  app.get('/metricas', (_req, res) => res.json({ ...metricas, circuito: circuito.opened ? 'ABIERTO' : 'CERRADO' }));
  return { app, circuito, metricas };
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3123);
  crearCatalogo().app.listen(puerto, () => console.log(`catálogo (F123) en :${puerto} -> inventario ${INVENTARIO_URL}`));
}
