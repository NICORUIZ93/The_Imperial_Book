// Módulo 24 · F151 · Fitness functions en producción: comprueban con métricas REALES que la arquitectura sigue
// cumpliendo lo que prometen los ADRs. Dos fuentes: (1) dos lecturas de /metrics del propio servicio y su diferencia
// (sin infraestructura), o (2) consultas PromQL a Prometheus (con --prometheus). Código de salida 1 si alguna falla:
// sirve como puerta de un canary o de un pipeline. Requisitos: Node.js 26.13.1 LTS.
// Uso: node f151-fitness/fitness.js --prometheus http://127.0.0.1:19090 --job pedidos-v1

/** Umbrales: cada uno sale de una decisión escrita (ADR, SLO). */
export const FUNCIONES = [
  { id: 'FF1', nombre: 'latencia p99 de /pedidos', limite: 0.3, unidad: 's', origen: 'SLO de checkout: p99 ≤ 300 ms' },
  { id: 'FF2', nombre: 'tasa de errores 5xx de /pedidos', limite: 0.001, unidad: '', origen: 'SLO de disponibilidad 99,9 %' },
  { id: 'FF3', nombre: 'dependencias síncronas de pedidos', limite: 1, unidad: '', origen: 'ADR-0003: pedidos solo llama en síncrono a inventario; pagos va por eventos' },
];

/** Formato de texto de Prometheus → [{nombre, etiquetas, valor}]. */
export function parsear(texto) {
  return texto.split('\n').filter((l) => l && !l.startsWith('#')).map((l) => {
    const m = l.match(/^([a-zA-Z_:][\w:]*)(?:\{(.*)\})? (\S+)$/);
    const etiquetas = Object.fromEntries([...(m[2] ?? '').matchAll(/(\w+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    return { nombre: m[1], etiquetas, valor: Number(m[3]) };
  });
}

/** Diferencia entre dos lecturas de contadores: lo que pasó DURANTE la ventana, no desde que arrancó el proceso. */
export function delta(antes, despues) {
  const clave = (s) => `${s.nombre}${JSON.stringify(s.etiquetas)}`;
  const previo = new Map(antes.map((s) => [clave(s), s.valor]));
  return despues.map((s) => ({ ...s, valor: s.valor - (previo.get(clave(s)) ?? 0) }));
}

/** Cuantil de un histograma acumulado, interpolando dentro del cubo como histogram_quantile de Prometheus. */
export function cuantil(q, cubos) {
  const ordenados = [...cubos].sort((a, b) => a.le - b.le);
  const total = ordenados.at(-1)?.cuenta ?? 0;
  if (total === 0) return NaN;
  const objetivo = q * total;
  let inferior = 0, cuentaInferior = 0;
  for (const { le, cuenta } of ordenados) {
    if (cuenta >= objetivo) {
      if (le === Infinity) return inferior;     // cae en +Inf: Prometheus devuelve el límite del cubo anterior
      return inferior + (le - inferior) * ((objetivo - cuentaInferior) / (cuenta - cuentaInferior));
    }
    inferior = le; cuentaInferior = cuenta;
  }
  return NaN;
}

/** Calcula los valores de FF1–FF3 a partir de muestras (ya restadas con delta). */
export function medir(muestras) {
  const cubos = muestras.filter((s) => s.nombre === 'http_request_duration_seconds_bucket' && s.etiquetas.ruta === '/pedidos')
    .map((s) => ({ le: s.etiquetas.le === '+Inf' ? Infinity : Number(s.etiquetas.le), cuenta: s.valor }));
  const resp = muestras.filter((s) => s.nombre === 'http_requests_total' && s.etiquetas.ruta === '/pedidos');
  const total = resp.reduce((a, s) => a + s.valor, 0);
  const errores = resp.filter((s) => s.etiquetas.codigo.startsWith('5')).reduce((a, s) => a + s.valor, 0);
  const destinos = muestras.filter((s) => s.nombre === 'dependencias_llamadas_total' && s.valor > 0).map((s) => s.etiquetas.destino);
  return { FF1: cuantil(0.99, cubos), FF2: total ? errores / total : 0, FF3: destinos.length, peticiones: total, destinos };
}

export function evaluar(valores) {
  return FUNCIONES.map((f) => ({ ...f, valor: valores[f.id], ok: valores[f.id] <= f.limite }));
}

export function imprimir(resultados, extra = '') {
  for (const r of resultados) {
    const v = r.unidad === 's' ? `${Math.round(r.valor * 1000)} ms` : r.id === 'FF2' ? `${(r.valor * 100).toFixed(2)} %` : String(r.valor);
    const l = r.unidad === 's' ? `${r.limite * 1000} ms` : r.id === 'FF2' ? `${r.limite * 100} %` : String(r.limite);
    console.log(`   ${r.ok ? '✔' : '✘'} ${r.id} ${r.nombre.padEnd(34)} ${v.padStart(8)} (límite ${l}) · ${r.origen}`);
  }
  if (extra) console.log(`   ${extra}`);
}

/** Fuente 2: Prometheus. Ventana de 5 minutos; cada consulta devuelve un único número para el job indicado. */
export function consultas(job) {
  const j = `job="${job}"`;
  return {
    FF1: `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{${j},ruta="/pedidos"}[5m])))`,
    FF2: `sum(rate(http_requests_total{${j},ruta="/pedidos",codigo=~"5.."}[5m])) / sum(rate(http_requests_total{${j},ruta="/pedidos"}[5m]))`,
    FF3: `count(sum by (destino) (rate(dependencias_llamadas_total{${j}}[5m])) > 0)`,
  };
}
export async function medirEnPrometheus(base, job) {
  const valores = {};
  for (const [id, q] of Object.entries(consultas(job))) {
    const r = await fetch(`${base}/api/v1/query?query=${encodeURIComponent(q)}`).then((x) => x.json());
    if (r.status !== 'success') throw new Error(`${id}: ${r.error}`);
    valores[id] = r.data.result.length ? Number(r.data.result[0].value[1]) : NaN;
  }
  return valores;
}

if (import.meta.main) {
  const arg = (nombre, defecto) => { const i = process.argv.indexOf(nombre); return i > 0 ? process.argv[i + 1] : defecto; };
  const base = arg('--prometheus', 'http://127.0.0.1:19090');
  const job = arg('--job', 'pedidos-v1');
  const resultados = evaluar(await medirEnPrometheus(base, job));
  console.log(`Fitness functions de ${job} contra ${base} (ventana 5 min):`);
  imprimir(resultados);
  process.exitCode = resultados.every((r) => r.ok) ? 0 : 1;
}
