// F093 · Código que corre en un PROCESO HIJO (fork): otro proceso, otro PID, memoria totalmente separada.
// Se comunica con el padre por IPC (process.send / process.on('message')), serializando los mensajes.
import { fib } from './fibonacci.js';

process.on('message', ({ n }) => {
  process.send({ n, resultado: fib(n), pid: process.pid });
  process.disconnect(); // cerramos el canal: el hijo termina cuando no le queda nada pendiente
});
