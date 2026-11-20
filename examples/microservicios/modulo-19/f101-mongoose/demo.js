// Ejecuta: node f101-mongoose/demo.js   (desde examples/microservicios/modulo-19, con `docker compose up -d --wait`)
import mongoose from 'mongoose';
import { MONGO_URL } from '../config.js';
import { Producto } from './modelo.js';
import { crear, porEtiqueta, descontarStock, vaciar } from './repositorio.js';

await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 3000, maxPoolSize: 10 });
console.log('Conectado a', mongoose.connection.name, '· estado', mongoose.connection.readyState);
await Producto.init(); // espera a que los índices (sku único, etiquetas+precio) estén creados
await vaciar();

await crear({ sku: 'tec-001', nombre: 'Teclado mecánico', precio: 120000, stock: 5, etiquetas: ['oficina', 'gamer'], proveedor: { nombre: 'Andina' } });
await crear({ sku: 'mou-001', nombre: 'Mouse óptico', precio: 50000, stock: 2, etiquetas: ['oficina'], proveedor: { nombre: 'Andina' } });
await crear({ sku: 'sil-001', nombre: 'Silla ergonómica', precio: 800000, stock: 1, etiquetas: ['oficina'], proveedor: { nombre: 'Sur', pais: 'PE' } });
console.log('Documentos:', await Producto.countDocuments());

console.log('Oficina hasta 200000:', await porEtiqueta('oficina', 200000));

const trasVenta = await descontarStock('MOU-001', 2);
console.log('Venta de 2 mouse → stock', trasVenta.stock);
console.log('Otra venta de 1 mouse →', await descontarStock('MOU-001', 1));

try {
  await crear({ sku: 'x', nombre: 'TV', precio: -1, proveedor: { nombre: 'Sur' } });
} catch (error) {
  console.log(error.name, '→', Object.keys(error.errors).sort().join(', '));
}
try {
  await crear({ sku: 'tec-001', nombre: 'Teclado repetido', precio: 1, proveedor: { nombre: 'Sur' } });
} catch (error) {
  console.log(error.name, error.code, '→ clave duplicada', JSON.stringify(error.keyValue));
}

await mongoose.disconnect();
console.log('Desconectado · estado', mongoose.connection.readyState);
