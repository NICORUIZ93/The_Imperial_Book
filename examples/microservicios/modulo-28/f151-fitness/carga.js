// Módulo 24 · F151 · Carga constante contra las dos versiones del compose (v1 :13151, v2 :13152) para que Prometheus
// tenga datos. Requisitos: Node.js 26.13.1 LTS. Uso: node f151-fitness/carga.js [minutos=3]
const fin = Date.now() + Number(process.argv[2] ?? 3) * 60_000;
let n = 0;
while (Date.now() < fin) {
  await Promise.all([13151, 13152].flatMap((p) => Array.from({ length: 20 }, (_, i) => fetch(`http://127.0.0.1:${p}/pedidos/c${n + i}`).then((r) => r.text(), () => null))));
  n += 20;
  if (n % 2000 === 0) console.log(`${new Date().toISOString().slice(11, 19)} ${n} pedidos por versión`);
}
console.log(`total: ${n} pedidos por versión`);
