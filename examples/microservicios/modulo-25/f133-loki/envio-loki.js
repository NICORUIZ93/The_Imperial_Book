// Módulo 21 · F133 · Envía los logs JSON de Pino a Grafana Loki por su API HTTP de push (POST /loki/api/v1/push).
// Loki indexa SOLO las etiquetas (labels) de cada stream; el resto de la línea se guarda tal cual y se filtra al consultar.
// Requisitos: Node.js 26.13.1 LTS (fetch nativo), pino 10.4.0, Grafana Loki 3.7.9.
import { Writable } from 'node:stream';

// Etiquetas permitidas: pocas y con pocos valores posibles (baja cardinalidad). NUNCA ids de pedido o de usuario.
const ETIQUETAS = ['servicio', 'level'];

// Agrupa las entradas por conjunto de etiquetas: cada conjunto distinto es un «stream» en Loki.
export function aPayloadLoki(entradas, etiquetasFijas = {}) {
  const streams = new Map();
  for (const { linea, ns } of entradas) {
    const datos = JSON.parse(linea);
    const etiquetas = { ...etiquetasFijas };
    for (const e of ETIQUETAS) if (datos[e] !== undefined) etiquetas[e] = String(datos[e]);
    const clave = JSON.stringify(etiquetas);
    if (!streams.has(clave)) streams.set(clave, { stream: etiquetas, values: [] });
    // Marca de tiempo en NANOSEGUNDOS desde 1970, como STRING (no cabe en un número de JavaScript sin perder precisión).
    streams.get(clave).values.push([ns, linea]);
  }
  return { streams: [...streams.values()] };
}

// Stream de escritura para usar como destino de Pino: acumula líneas y las envía en lotes.
export class EnvioLoki extends Writable {
  constructor({ url, etiquetasFijas = { entorno: 'lab' }, lote = 100, cadaMs = 1000 }) {
    super();
    Object.assign(this, { url, etiquetasFijas, lote, pendientes: [], enviados: 0, fallidos: 0 });
    this.reloj = setInterval(() => this.vaciar(), cadaMs).unref(); // envía aunque el lote no esté lleno
  }
  _write(trozo, _codificacion, listo) {
    // process.hrtime.bigint() no es la hora del reloj; se combina Date.now() (ms) con un contador para no repetir.
    const ns = (BigInt(Date.now()) * 1_000_000n + BigInt(this.pendientes.length)).toString();
    for (const linea of trozo.toString().split('\n').filter(Boolean)) this.pendientes.push({ linea, ns });
    if (this.pendientes.length >= this.lote) this.vaciar().then(() => listo(), listo); else listo();
  }
  async vaciar() {
    if (this.pendientes.length === 0) return;
    const entradas = this.pendientes.splice(0); // vacía el buffer ANTES de enviar: lo nuevo va al siguiente lote
    try {
      const r = await fetch(`${this.url}/loki/api/v1/push`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(aPayloadLoki(entradas, this.etiquetasFijas)),
        signal: AbortSignal.timeout(3000),
      });
      if (!r.ok) throw new Error(`Loki respondió ${r.status}: ${await r.text()}`);
      this.enviados += entradas.length;
    } catch (error) {
      // Los logs NUNCA deben tumbar el servicio: se cuentan y se avisa por stderr.
      this.fallidos += entradas.length;
      process.stderr.write(`[envio-loki] ${entradas.length} líneas perdidas: ${error.message}\n`);
    }
  }
  _final(listo) { clearInterval(this.reloj); this.vaciar().then(() => listo(), listo); }
}
