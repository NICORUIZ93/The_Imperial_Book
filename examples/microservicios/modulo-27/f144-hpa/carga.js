// Módulo 23 · F144 · Generador de carga para ver escalar al HPA: N peticiones concurrentes a /trabajo durante S segundos.
// Requisitos: Node.js 26.13.1 LTS. Uso: node f144-hpa/carga.js http://127.0.0.1:8080 [concurrencia=20] [segundos=120]
const [base = 'http://127.0.0.1:8080', concurrencia = '20', segundos = '120'] = process.argv.slice(2);
const fin = Date.now() + Number(segundos) * 1000;
let ok = 0, errores = 0;
const versiones = new Map();

async function trabajador() {
  while (Date.now() < fin) {
    try {
      const r = await fetch(`${base}/trabajo?ms=50`, { signal: AbortSignal.timeout(5000) });
      const { version } = await r.json();
      r.ok ? ok++ : errores++;
      versiones.set(version, (versiones.get(version) ?? 0) + 1);
    } catch { errores++; }
  }
}
const reloj = setInterval(() => console.log(`${new Date().toISOString().slice(11, 19)} ok=${ok} errores=${errores}`), 10_000);
await Promise.all(Array.from({ length: Number(concurrencia) }, trabajador));
clearInterval(reloj);
console.log(`total ok=${ok} errores=${errores} versiones=${JSON.stringify(Object.fromEntries(versiones))}`);
