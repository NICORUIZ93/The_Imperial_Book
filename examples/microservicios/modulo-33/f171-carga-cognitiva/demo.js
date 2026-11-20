// Módulo 29 · F171 · Ejecuta: node f171-carga-cognitiva/demo.js
import { evaluar, proponer } from './carga.js';

const checkout = {
  nombre: 'checkout',
  dominios: [
    { nombre: 'pagos', complejidad: 'complejo' },
    { nombre: 'impuestos', complejidad: 'complicado' },
    { nombre: 'cupones', complejidad: 'simple' },
  ],
  tecnologias: ['Java', 'Node.js', 'PostgreSQL', 'Kafka', 'Redis', 'Terraform'],
  pasosManuales: 7,
  alertasSemana: 25,
  encuesta: [2, 3, 2, 2, 3, 2],
};

const antes = evaluar(checkout);
console.log(`Antes: ${antes.avisos.length} avisos · encuesta ${antes.encuesta}/5`);
for (const a of antes.avisos) console.log(`   - ${a}`);
console.log(`Propuesta: ${proponer(checkout).map((e) => `${e.nombre} [${e.dominios.join(', ')}]`).join(' · ')}`);

// Después: un equipo por dominio difícil y la plataforma absorbe despliegue y alertas (lo extrínseco).
const pagos = { ...checkout, nombre: 'checkout-pagos', dominios: checkout.dominios.filter((d) => d.nombre !== 'impuestos'),
  tecnologias: ['Java', 'PostgreSQL', 'Kafka'], pasosManuales: 0, alertasSemana: 4, encuesta: [4, 4, 3, 4, 4] };
const despues = evaluar(pagos);
console.log(`Después (checkout-pagos): ${despues.avisos.length} avisos · encuesta ${despues.encuesta}/5`);
