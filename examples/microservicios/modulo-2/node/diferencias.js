// Módulo 0.3 · Java y Node.js lado a lado: tipos, errores y concurrencia
// Las mismas tres ideas que java/Diferencias.java, en Node.js.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta (desde la carpeta node/):  node diferencias.js

import { setTimeout as esperar } from 'node:timers/promises';

// 1. TIPOS DINÁMICOS: nadie revisa los tipos antes de ejecutar.
//    sumar('2', 2) SÍ corre, y da '22' (une textos en vez de sumar).
export function sumar(a, b) {
  return a + b;
}

// 2. ERRORES: Number('cuarenta') no lanza error; devuelve NaN ("no es un número").
//    Hay que comprobarlo a mano.
export function convertir(texto) {
  const n = Number(texto);
  if (Number.isNaN(n)) {
    return `error: '${texto}' no es un número`;
  }
  return `número ${n}`;
}

// 3. CONCURRENCIA: Node tiene UN solo hilo para tu código, pero no se queda bloqueado
//    esperando: con async/await deja la espera "en pausa" y atiende otra cosa (el event loop).
export async function tresTareasEnParalelo() {
  const inicio = Date.now();
  const tarea = async (n) => {
    await esperar(1000); // simula esperar a una base de datos
    return `tarea ${n}`;
  };
  await Promise.all([tarea(1), tarea(2), tarea(3)]);
  return Date.now() - inicio;
}

if (import.meta.main) {
  console.log(`1) sumar(2, 2) = ${sumar(2, 2)} | sumar('2', 2) = ${sumar('2', 2)}`);
  console.log(`2) ${convertir('42')} | ${convertir('cuarenta')}`);
  const ms = await tresTareasEnParalelo();
  console.log(`3) tres tareas de 1 s con async/await tardaron menos de 1.5 s: ${ms < 1500}`);
}
