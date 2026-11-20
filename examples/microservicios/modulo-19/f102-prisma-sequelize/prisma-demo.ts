// Ejecuta: npm run generate && npx tsx f102-prisma-sequelize/prisma-demo.ts   (desde examples/microservicios/modulo-19)
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './prisma-repo.ts';

await prepararEsquema();
const prisma = conectar();

const id = await crearClienteConPedidos(prisma, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
console.log('Cliente creado con id', id);
console.log('Pedidos de Ana:', JSON.stringify(await pedidosDe(prisma, 'ana@correo.co')));
console.log('Total vendido:', await totalVendido(prisma));

try {
  // El segundo pedido viola CHECK (total > 0): la transacción entera se deshace, Luis tampoco queda guardado.
  await crearClienteConPedidos(prisma, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]);
} catch {
  console.log('Transacción deshecha');
}
console.log('¿Existe Luis?', await pedidosDe(prisma, 'luis@correo.co'));

try {
  await crearClienteConPedidos(prisma, { nombre: 'Otra Ana', email: 'ana@correo.co' }, []);
} catch (error) {
  console.log('Email repetido: código', (error as { code?: string }).code);
}

await prisma.$disconnect();
