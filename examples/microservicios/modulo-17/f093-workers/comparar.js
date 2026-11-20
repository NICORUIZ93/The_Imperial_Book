// Módulo 13 · F093 · Worker Threads vs Child Processes.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node f093-workers/comparar.js
import { Worker } from 'node:worker_threads';
import { fork, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fib } from './fibonacci.js';

const aqui = (archivo) => new URL(archivo, import.meta.url);

// Cuenta cuántas veces se ejecuta un setInterval de 10 ms mientras corre `trabajo`:
// si el hilo principal está bloqueado, el contador no avanza.
export async function latidosDurante(trabajo) {
  let latidos = 0;
  const intervalo = setInterval(() => latidos++, 10);
  const resultado = await trabajo();
  clearInterval(intervalo);
  return { latidos, resultado };
}

export const enHiloPrincipal = (n) => Promise.resolve().then(() => fib(n)); // bloquea el loop

export function enWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(aqui('./worker-fib.js'), { workerData: { n } });
    worker.once('message', ({ resultado }) => resolve(resultado));
    worker.once('error', reject); // una excepción dentro del worker llega aquí
  });
}

export function enProcesoHijo(n) {
  return new Promise((resolve, reject) => {
    const hijo = fork(aqui('./hijo-fib.js'));
    hijo.once('message', ({ resultado, pid }) => resolve({ resultado, pid }));
    hijo.once('error', reject);
    hijo.send({ n });
  });
}

// Child process también ejecuta OTROS programas (no solo Node): aquí, el propio binario de node.
export async function versionConExecFile() {
  const { stdout } = await promisify(execFile)(process.execPath, ['--version']);
  return stdout.trim();
}

if (import.meta.main) {
  const N = 36;
  for (const [nombre, fn] of [['hilo principal', enHiloPrincipal], ['worker thread', enWorker], ['proceso hijo', enProcesoHijo]]) {
    const inicio = performance.now();
    const { latidos, resultado } = await latidosDurante(() => fn(N));
    const valor = typeof resultado === 'object' ? `${resultado.resultado} (PID hijo ${resultado.pid === process.pid ? 'igual' : 'distinto'})` : resultado;
    console.log(`${nombre.padEnd(15)} fib(${N}) = ${valor} · ${Math.round(performance.now() - inicio)} ms · latidos del loop: ${latidos}`);
  }
  console.log(`execFile ejecutó: node ${await versionConExecFile()}`);
}
