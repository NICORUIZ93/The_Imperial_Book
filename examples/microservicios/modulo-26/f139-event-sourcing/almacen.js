// Módulo 22 · F139 · Elige el almacén: ALMACEN=memoria (sin Docker) o MongoDB en MONGO_URL (por defecto).
import { MongoClient } from 'mongodb';
import { MONGO_URL } from '../comun/config.js';
import { AlmacenEventosMongo } from './almacen-mongo.js';
import { AlmacenEventosMemoria } from './almacen-memoria.js';

export async function abrirAlmacen({ tipo = process.env.ALMACEN ?? 'mongo', basedatos = 'modulo26' } = {}) {
  if (tipo === 'memoria') return { almacen: new AlmacenEventosMemoria(), cerrar: async () => {} };
  const cliente = await new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 3000 }).connect();
  const db = cliente.db(basedatos);
  const almacen = new AlmacenEventosMongo(db);
  await almacen.preparar();
  return { almacen, db, cerrar: () => cliente.close() };
}
