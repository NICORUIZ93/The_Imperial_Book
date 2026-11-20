// Módulo 13 · F091 · Event Loop: fases, microtasks y macrotasks.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node f091-event-loop/orden.js
import { readFile } from 'node:fs';

// Devuelve el orden en que Node ejecuta cada tipo de callback. Todo arranca DENTRO de un callback de I/O
// (fase "poll"), así el orden es determinista: después de poll viene "check" (setImmediate) y luego,
// en la siguiente vuelta, "timers" (setTimeout).
export function ordenDeEjecucion() {
  return new Promise((resolve) => {
    const orden = [];
    readFile(import.meta.filename, () => {
      orden.push('1 síncrono (callback de I/O, fase poll)');
      setTimeout(() => orden.push('6 setTimeout 0 (macrotask, fase timers)'), 0);
      setImmediate(() => {
        orden.push('5 setImmediate (macrotask, fase check)');
        Promise.resolve().then(() => orden.push('5b microtask creada en check: corre antes de pasar a la siguiente macrotask'));
      });
      Promise.resolve().then(() => orden.push('3 Promise.then (microtask)'));
      queueMicrotask(() => orden.push('4 queueMicrotask (microtask, misma cola que las promesas)'));
      process.nextTick(() => orden.push('2 process.nextTick (cola nextTick, antes que las promesas)'));
      orden.push('1b síncrono: sigue el mismo callback');
      setTimeout(() => resolve(orden), 20);
    });
  });
}

// Bloquear el hilo principal retrasa TODO lo demás (temporizadores incluidos).
export function retrasoDeUnTimer(msDeBloqueo) {
  return new Promise((resolve) => {
    const inicio = performance.now();
    setTimeout(() => resolve(Math.round(performance.now() - inicio)), 10); // pedimos 10 ms…
    const fin = inicio + msDeBloqueo;
    while (performance.now() < fin); // …pero este bucle síncrono no suelta el hilo
  });
}

if (import.meta.main) {
  for (const paso of await ordenDeEjecucion()) console.log(paso);
  console.log(`setTimeout(10) sin bloqueo llegó a los ~${await retrasoDeUnTimer(0)} ms`);
  console.log(`setTimeout(10) con 200 ms de bucle síncrono llegó a los ~${await retrasoDeUnTimer(200)} ms`);
}
