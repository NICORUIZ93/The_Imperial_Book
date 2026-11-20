// ERROR COMÚN F101: consultar sin haber conectado (o con la URL equivocada).
// Ejecuta: node f101-mongoose/error-buffering.js   (no necesita MongoDB: justamente falla porque no hay conexión)
import mongoose from 'mongoose';
import { Producto } from './modelo.js';

mongoose.set('bufferTimeoutMS', 2000); // por defecto son 10000 ms; lo bajamos para no esperar tanto

// 1) Nadie llamó a mongoose.connect(): Mongoose guarda la consulta en una cola («buffering») esperando la conexión.
try {
  await Producto.find();
} catch (error) {
  console.log('1)', error.name + ':', error.message);
}

// 2) La URL apunta a un puerto donde no hay MongoDB.
try {
  await mongoose.connect('mongodb://localhost:27999/tienda', { serverSelectionTimeoutMS: 1500 });
} catch (error) {
  console.log('2)', error.name + ':', error.message);
}
await mongoose.disconnect();
