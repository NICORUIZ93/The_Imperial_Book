// Ejecuta: node f089-es6/demo.js   (desde examples/microservicios/modulo-17)
import { calcularTotal, nombresEnSerie, nombresEnParalelo, informe, conCiudad, buscarCliente } from './pedidos.js';

const pedido = { items: [{ precio: 10000, cantidad: 2 }, { precio: 5000, cantidad: 1 }], descuento: 0.1 };
console.log('Total con IVA:', calcularTotal(pedido));

let t = performance.now();
console.log('En serie:', await nombresEnSerie(['c1', 'c2', 'c1']), `${Math.round((performance.now() - t) / 100) * 100} ms aprox.`);
t = performance.now();
console.log('En paralelo:', await nombresEnParalelo(['c1', 'c2', 'c1']), `${Math.round((performance.now() - t) / 100) * 100} ms aprox.`);

console.log('allSettled:', await informe(['c1', 'zz']));

try {
  await nombresEnParalelo(['c1', 'zz']);
} catch (error) {
  console.log('Promise.all rechazada:', error.message);
}

const ana = await buscarCliente('c1');
const anaEnMedellin = conCiudad(ana, 'Medellín');
console.log('Copia:', anaEnMedellin, '| original intacto:', ana.ciudad);
