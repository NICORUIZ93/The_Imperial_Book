// Módulo 28 · F167 · ERROR COMÚN: calcular Lambda con el tiempo de CPU y olvidar que se paga el tiempo de RELOJ,
// incluida la espera a la base de datos o a otro servicio. Una dependencia lenta multiplica la factura de Lambda;
// en Fargate esa espera la absorbe la concurrencia de la tarea (si no se satura).
// Ejecuta: node f167-break-even/error-comun.js
import { costoLambda, breakEven, CARGA } from './breakeven.js';
import { usd } from '../comun/precios.js';

const n = 50_000_000;
for (const [nombre, duracionMs] of [['estimado (solo CPU)', 120], ['real (espera a pagos 280 ms)', 400]]) {
  const carga = { ...CARGA, duracionMs };
  console.log(`${nombre.padEnd(28)} ${String(duracionMs).padStart(3)} ms -> Lambda ${usd(costoLambda(n, carga)).padStart(10)} con 5e+7 pet/mes · break-even ${Math.round(breakEven(carga)).toLocaleString('en-US')} pet/mes`);
}
