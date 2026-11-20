// Módulo 32 · F185 · ERROR COMÚN: «arreglar» los 429 subiendo los reintentos sin backoff (y sin mirar Retry-After).
// Más intentos inmediatos = tormenta de reintentos: el proveedor recibe muchas más peticiones y sigue rechazando.
// Ejecuta: node f185-restriccion-sobrevenida/error-comun.js
import { correr, imprimir } from './escenario.js';
imprimir('ERROR · 10 intentos inmediatos, sin backoff:', await correr({ tasa: 60, segundos: 5, limiteRps: 20,
  politica: { intentos: 10, inicialMs: 0, coeficiente: 1 } }));
