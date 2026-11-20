// Ejecuta: node f102-prisma-sequelize/sequelize-demo.js   (desde examples/microservicios/modulo-19)
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos, pedidosDe, totalVendido } from './sequelize-repo.js';

await prepararEsquema();
const db = conectar();

const id = await crearClienteConPedidos(db, { nombre: 'Ana', email: 'ana@correo.co' }, [120000, 50000]);
console.log('Cliente creado con id', id);
console.log('Pedidos de Ana:', JSON.stringify(await pedidosDe(db, 'ana@correo.co')));
console.log('Total vendido:', await totalVendido(db));

try {
  // El segundo pedido viola CHECK (total > 0): la transacción entera se deshace, Luis tampoco queda guardado.
  await crearClienteConPedidos(db, { nombre: 'Luis', email: 'luis@correo.co' }, [80000, -5]);
} catch (error) {
  console.log('Transacción deshecha:', error.name);
}
console.log('¿Existe Luis?', await pedidosDe(db, 'luis@correo.co'));

try {
  await crearClienteConPedidos(db, { nombre: 'Otra Ana', email: 'ana@correo.co' }, []);
} catch (error) {
  console.log('Email repetido:', error.name);
}

await db.sequelize.close();
