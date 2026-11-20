// Módulo 32 · F185 · DESPUÉS (ADR-0007): los cobros salen por una cola a 18/s. Mismo pico de 60 reservas/s durante 5 s.
// Ejecuta: node f185-restriccion-sobrevenida/despues.js
import { correr, imprimir } from './escenario.js';
imprimir('DESPUÉS · cola de cobros a 18/s:', await correr({ tasa: 60, segundos: 5, limiteRps: 20, cobrosPorSegundo: 18 }));
