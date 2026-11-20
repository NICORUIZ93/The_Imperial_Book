// Módulo 20 · F127 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Fallos: (1) mete lo que llega del cliente DIRECTAMENTE en el filtro de MongoDB: si en vez de un texto llega un
// objeto como {"$ne": null}, MongoDB lo interpreta como operador; (2) busca por la clave en texto plano;
// (3) activa el parser «extended», que convierte ?categoria[$ne]=x en un objeto.
// Ejecuta (con MongoDB arriba): node f127-nosql/antes.js   (:3127)
import express from 'express';

export function crearApp(db) {
  const app = express();
  app.set('query parser', 'extended'); // (3) el valor por defecto de Express 4; en Express 5 es «simple»
  app.use(express.json());

  app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;
    const encontrado = await db.collection('usuarios').findOne({ usuario, clave }); // (1) (2)
    if (!encontrado) return res.status(401).json({ error: 'credenciales inválidas' });
    res.json({ bienvenido: encontrado.usuario, rol: encontrado.rol });
  });

  app.get('/productos', async (req, res) => {
    const productos = await db.collection('productos').find({ categoria: req.query.categoria }, {}).toArray(); // (1)
    res.json(productos.map((p) => p.nombre));
  });
  return app;
}

if (import.meta.main) {
  const { conectar, sembrar } = await import('./datos.js');
  const { db } = await conectar();
  await sembrar(db);
  crearApp(db).listen(3127, () => console.log('ANTES (vulnerable) en :3127'));
}
