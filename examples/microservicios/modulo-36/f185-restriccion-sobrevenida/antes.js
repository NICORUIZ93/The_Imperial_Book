// Módulo 32 · F185 · ANTES: el proveedor anuncia 20 peticiones/s y el sistema sigue cobrando en cuanto llega la reserva.
// Pico de 60 reservas/s durante 5 s (el pico que midió Gatling). Ejecuta: node f185-restriccion-sobrevenida/antes.js
import { correr, imprimir } from './escenario.js';
imprimir('ANTES · cobro inmediato, 3 intentos con backoff de 100 ms:', await correr({ tasa: 60, segundos: 5, limiteRps: 20 }));
