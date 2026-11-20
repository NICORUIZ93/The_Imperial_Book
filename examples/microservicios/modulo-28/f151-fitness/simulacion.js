// Módulo 24 · F151 · Simulación sin infraestructura: arranca la versión sana y la degradada del servicio, les envía
// 1000 pedidos y evalúa las fitness functions sobre la DIFERENCIA de dos lecturas de /metrics.
// Requisitos: Node.js 26.13.1 LTS y prom-client 15.1.3. Ejecuta: node f151-fitness/simulacion.js
import { spawn } from 'node:child_process';
import { delta, evaluar, imprimir, medir, parsear } from './fitness.js';

async function version(nombre, entorno, puerto) {
  const p = spawn(process.execPath, ['f151-fitness/servicio.js'], { env: { ...process.env, ...entorno, PORT: String(puerto) }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((ok) => p.stdout.on('data', (t) => String(t).includes('escuchando') && ok()));
  const base = `http://127.0.0.1:${puerto}`;
  const leer = async () => parsear(await fetch(`${base}/metrics`).then((r) => r.text()));
  await fetch(`${base}/pedidos/calentamiento`);                 // tráfico ANTES de la ventana: no debe contar
  const antes = await leer();
  for (let lote = 0; lote < 10; lote++) {                       // 1000 pedidos, de 100 en 100 en paralelo
    await Promise.all(Array.from({ length: 100 }, (_, i) => fetch(`${base}/pedidos/p${lote * 100 + i}`).then((r) => r.text())));
  }
  const valores = medir(delta(antes, await leer()));
  p.kill();
  const resultados = evaluar(valores);
  console.log(`== ${nombre}: ${valores.peticiones} peticiones en la ventana · dependencias: ${valores.destinos.join(', ')}`);
  imprimir(resultados);
  console.log(`   ${resultados.every((r) => r.ok) ? 'APTA: la arquitectura sigue cumpliendo' : 'NO APTA: bloquea el despliegue y revisa el ADR'}`);
}

await version('v1 (sana)', { PCT_LENTAS: '0', TASA_ERROR: '0', DEPENDENCIAS: 'inventario' }, 3151);
await version('v2 (degradada)', { PCT_LENTAS: '2', LENTA_MS: '450', TASA_ERROR: '0.01', DEPENDENCIAS: 'inventario,pagos' }, 3152);
