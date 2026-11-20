// ERROR COMÚN F102: el problema N+1. Ejecuta: node f102-prisma-sequelize/n-mas-1.js
// Cuenta las consultas SQL que emite Sequelize para listar 3 clientes con sus pedidos, mal y bien.
import { prepararEsquema } from './preparar.js';
import { conectar, crearClienteConPedidos } from './sequelize-repo.js';

await prepararEsquema();
let consultas = [];
const db = conectar({ logging: (sql) => consultas.push(sql.replace('Executing (default): ', '')) });
for (const nombre of ['Ana', 'Luis', 'Eva']) {
  await crearClienteConPedidos(db, { nombre, email: `${nombre.toLowerCase()}@correo.co` }, [10000, 20000]);
}

// MAL: 1 consulta para los clientes + 1 consulta POR CADA cliente para sus pedidos.
consultas = [];
const clientes = await db.Cliente.findAll({ order: [['id', 'ASC']] });
for (const cliente of clientes) {
  const pedidos = await db.Pedido.findAll({ where: { clienteId: cliente.id } });
  cliente.cantidad = pedidos.length;
}
console.log(`N+1: ${consultas.length} consultas para ${clientes.length} clientes`);
console.log('  ' + consultas[1]);

// BIEN: una sola consulta con JOIN (include).
consultas = [];
const conPedidos = await db.Cliente.findAll({ include: 'pedidos', order: [['id', 'ASC']] });
console.log(`include: ${consultas.length} consulta para ${conPedidos.length} clientes con ${conPedidos.flatMap((c) => c.pedidos).length} pedidos`);

await db.sequelize.close();
