// Módulo 15 · F102 · PostgreSQL con Sequelize 6.37.8 (ORM clásico: los modelos se definen en JavaScript).
// Requisitos: Node.js 26.13.1 LTS, sequelize 6.37.8, pg 8.23.1. PostgreSQL 18.7 con Docker Compose.
import { Sequelize, DataTypes } from 'sequelize';
import { pgUrl } from '../config.js';

export function conectar({ logging = false } = {}) {
  // Sequelize abre su propio pool de conexiones (aquí, máximo 5).
  const sequelize = new Sequelize(pgUrl('f102'), { logging, pool: { max: 5, idle: 10000 } });

  // Cada modelo dice a qué tabla y columnas corresponde. timestamps: false → no busca createdAt/updatedAt.
  const Cliente = sequelize.define('Cliente', {
    nombre: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  }, { tableName: 'clientes', timestamps: false });

  const Pedido = sequelize.define('Pedido', {
    total: { type: DataTypes.INTEGER, allowNull: false },
    estado: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'CREADO' },
    creadoEn: { type: DataTypes.DATE, field: 'creado_en', defaultValue: DataTypes.NOW },
    clienteId: { type: DataTypes.INTEGER, field: 'cliente_id', allowNull: false },
  }, { tableName: 'pedidos', timestamps: false });

  // La relación 1 → N: un cliente tiene muchos pedidos.
  Cliente.hasMany(Pedido, { as: 'pedidos', foreignKey: 'clienteId' });
  Pedido.belongsTo(Cliente, { as: 'cliente', foreignKey: 'clienteId' });

  return { sequelize, Cliente, Pedido };
}

// Crea el cliente y sus pedidos en UNA transacción: o se guardan todos o ninguno.
export function crearClienteConPedidos({ sequelize, Cliente, Pedido }, { nombre, email }, totales) {
  return sequelize.transaction(async (transaction) => {
    const cliente = await Cliente.create({ nombre, email }, { transaction });
    for (const total of totales) {
      await Pedido.create({ total, clienteId: cliente.id }, { transaction });
    }
    return cliente.id;
  }); // si el callback lanza, Sequelize hace ROLLBACK; si termina bien, COMMIT
}

// include = JOIN: trae el cliente y sus pedidos en UNA consulta.
export async function pedidosDe({ Cliente }, email) {
  const cliente = await Cliente.findOne({
    where: { email },
    include: { association: 'pedidos', attributes: ['total', 'estado'] },
    order: [['pedidos', 'id', 'ASC']],
  });
  if (!cliente) return null;
  const { nombre, pedidos } = cliente.toJSON();
  return { nombre, pedidos };
}

export async function totalVendido({ Pedido }) {
  return (await Pedido.sum('total')) ?? 0;
}
