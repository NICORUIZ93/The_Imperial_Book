// Módulo 15 · F101 · Operaciones del catálogo. Cada función es UNA operación atómica de MongoDB.
import { Producto } from './modelo.js';

export async function crear(datos) {
  const producto = await Producto.create(datos); // valida con el esquema y hace insertOne
  return producto.toObject();
}

// lean() devuelve objetos planos (sin la «envoltura» de Mongoose): más rápido y suficiente para responder JSON.
export function porEtiqueta(etiqueta, precioMaximo = Infinity) {
  return Producto.find({ etiquetas: etiqueta, precio: { $lte: precioMaximo } })
    .sort({ precio: 1 })
    .select('sku nombre precio -_id')
    .lean();
}

// Descuenta stock SIN leer primero: el filtro (stock >= cantidad) y el cambio ($inc) viajan en la misma operación,
// así dos compras simultáneas no pueden dejar el stock en negativo. Devuelve null si no alcanzó.
export function descontarStock(sku, cantidad) {
  return Producto.findOneAndUpdate(
    { sku, stock: { $gte: cantidad } },
    { $inc: { stock: -cantidad } },
    { returnDocument: 'after', runValidators: true },
  ).lean();
}

export function vaciar() {
  return Producto.deleteMany({});
}
