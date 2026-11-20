// Módulo 20 · F127 · DESPUÉS (seguro): toda entrada se valida con un esquema ANTES de tocar la base de datos, los
// filtros usan $eq explícito, la clave se comprueba con hash en la aplicación y el parser de query es el simple.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, zod 4.6.7 y mongodb 7.9.1.
// Ejecuta (con MongoDB arriba): node f127-nosql/despues.js   (:3227)
import express from 'express';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import * as z from 'zod';

// Esquemas: cada campo es un TEXTO con forma conocida. Un objeto ({"$ne":null}) o un campo extra no pasan.
const Credenciales = z.strictObject({
  usuario: z.string().regex(/^[a-z0-9_.-]{1,64}$/),
  clave: z.string().min(1).max(128),
});
const Consulta = z.strictObject({ categoria: z.enum(['perifericos', 'monitores']) });

/** Middleware genérico: valida `req[parte]` y deja el resultado limpio en req.validado. */
const validar = (esquema, parte) => (req, res, next) => {
  const resultado = esquema.safeParse(req[parte]);
  if (!resultado.success) {
    return res.status(400).json({ error: 'entrada inválida', campos: resultado.error.issues.map((i) => i.path.join('.') || '(raíz)') });
  }
  req.validado = resultado.data;
  next();
};

export function crearApp(db) {
  const app = express();
  // Parser de query por defecto de Express 5 («simple»): ?categoria[$ne]=x NO se convierte en objeto.
  app.use(express.json({ limit: '10kb' }));

  app.post('/login', validar(Credenciales, 'body'), async (req, res) => {
    const { usuario, clave } = req.validado;
    // $eq explícito: aunque alguien se saltara la validación, el valor se compara como dato, no como operador.
    const encontrado = await db.collection('usuarios').findOne({ usuario: { $eq: usuario } }, { projection: { usuario: 1, rol: 1, sal: 1, hash: 1 } });
    // La clave NUNCA forma parte del filtro: se calcula su hash y se compara en tiempo constante.
    const calculado = scryptSync(clave, encontrado?.sal ?? 'sal-inexistente', 32);
    const valido = encontrado != null && timingSafeEqual(calculado, Buffer.from(encontrado.hash, 'hex'));
    if (!valido) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ bienvenido: encontrado.usuario, rol: encontrado.rol });
  });

  app.get('/productos', validar(Consulta, 'query'), async (req, res) => {
    const productos = await db.collection('productos').find({ categoria: { $eq: req.validado.categoria } }, { projection: { _id: 0, nombre: 1 } }).toArray();
    res.json(productos.map((p) => p.nombre));
  });
  return app;
}

if (import.meta.main) {
  const { conectar, sembrar } = await import('./datos.js');
  const { db } = await conectar();
  await sembrar(db);
  crearApp(db).listen(3227, () => console.log('DESPUÉS (seguro) en :3227'));
}
