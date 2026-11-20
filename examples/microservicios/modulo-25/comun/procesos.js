// Módulo 21 · Utilidades de los tests: arrancar un programa Node en segundo plano y esperar a que imprima algo.
import { spawn } from 'node:child_process';

export function arrancar(args, env = {}) {
  const hijo = spawn(process.execPath, args, { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  hijo.salida = '';
  hijo.stdout.on('data', (d) => { hijo.salida += d; });
  hijo.stderr.on('data', (d) => { hijo.salida += d; });
  return hijo;
}

export async function esperarTexto(hijo, texto, ms = 10000) {
  const limite = Date.now() + ms;
  while (!hijo.salida.includes(texto)) {
    if (Date.now() > limite) throw new Error(`no apareció «${texto}» en:\n${hijo.salida}`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

export function detener(hijo) {
  return new Promise((resolver) => {
    if (hijo.exitCode !== null) return resolver();
    hijo.once('exit', resolver);
    hijo.kill('SIGTERM'); // telemetria.js vacía los spans pendientes al recibir SIGTERM
  });
}
