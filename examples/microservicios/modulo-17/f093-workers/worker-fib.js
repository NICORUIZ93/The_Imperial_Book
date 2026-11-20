// F093 · Código que corre DENTRO de un Worker Thread: mismo proceso, otro hilo, otro Event Loop y otro heap.
import { parentPort, workerData } from 'node:worker_threads';
import { fib } from './fibonacci.js';

parentPort.postMessage({ n: workerData.n, resultado: fib(workerData.n) });
