// Módulo 20 · F127 · Conexión a MongoDB y datos de prueba para las dos versiones (antes y después).
// Requisitos: Node.js 26.13.1 LTS, mongodb (driver) 7.9.1 y MongoDB 9.0.8 del docker-compose.yml del laboratorio.
import { MongoClient } from 'mongodb';
import { scryptSync } from 'node:crypto';

export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017';

export async function conectar(nombreBd = 'tienda_f127') {
  const cliente = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 2000 });
  await cliente.connect();
  return { cliente, db: cliente.db(nombreBd) };
}

export const hashDe = (clave, sal) => scryptSync(clave, sal, 32).toString('hex');

/** Deja la base con 2 usuarios y 3 productos (uno interno que no debería ver nadie). */
export async function sembrar(db) {
  await db.collection('usuarios').deleteMany({});
  await db.collection('productos').deleteMany({});
  await db.collection('usuarios').insertMany([
    // `clave` en texto plano solo existe para la versión vulnerable; la segura usa sal + hash.
    { usuario: 'ana', clave: 'ana123', sal: 'sal-ana', hash: hashDe('ana123', 'sal-ana'), rol: 'cliente' },
    { usuario: 'root', clave: 'S3gura!2026', sal: 'sal-root', hash: hashDe('S3gura!2026', 'sal-root'), rol: 'admin' },
  ]);
  await db.collection('productos').insertMany([
    { sku: '7', nombre: 'Teclado', categoria: 'perifericos' },
    { sku: '8', nombre: 'Mouse', categoria: 'perifericos' },
    { sku: 'X1', nombre: 'Prototipo secreto', categoria: 'interno' },
  ]);
}
