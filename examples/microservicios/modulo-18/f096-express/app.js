// Módulo 14 · F096 · Express: routing, middleware, error handling.
// Requisitos: Node.js 26.13.1 LTS y express 5.3.0 (package.json del laboratorio). Ejecuta: node f096-express/app.js
import express from 'express';
import { randomUUID } from 'node:crypto';

// Error de dominio con su código HTTP: el manejador de errores lo traduce a la respuesta.
export class ErrorHttp extends Error {
  constructor(status, titulo, detalle) {
    super(detalle);
    this.status = status;
    this.titulo = titulo;
  }
}

// ---------- MIDDLEWARE: funciones (req, res, next) que se ejecutan en orden, como una cadena. ----------
function idDePeticion(req, res, next) {
  req.id = req.get('x-request-id') ?? randomUUID(); // propaga el id si viene de otro servicio
  res.set('x-request-id', req.id);
  next(); // ¡sin next() la petición se queda colgada!
}

function registro(log) {
  return (req, res, next) => {
    const inicio = performance.now();
    res.on('finish', () => log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(performance.now() - inicio)}ms`));
    next();
  };
}

function soloAdmin(req, _res, next) {
  if (req.get('x-rol') !== 'admin') return next(new ErrorHttp(403, 'Prohibido', 'Se necesita el rol admin'));
  next();
}

// ---------- ROUTING: un Router agrupa las rutas de un recurso y se monta bajo un prefijo. ----------
function rutasDeProductos(repo) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const max = Number(req.query.max ?? 100); // query string: /productos?max=1
    res.json([...repo.values()].slice(0, max));
  });

  router.get('/:id', async (req, res) => {
    // Express 5: si una función async lanza o su promesa se rechaza, el error va solo al manejador de errores.
    const producto = repo.get(req.params.id);
    if (!producto) throw new ErrorHttp(404, 'No encontrado', `No existe el producto ${req.params.id}`);
    res.json(producto);
  });

  router.post('/', soloAdmin, (req, res) => { // middleware solo para esta ruta
    const { nombre, precio } = req.body ?? {};
    if (typeof nombre !== 'string' || typeof precio !== 'number') {
      throw new ErrorHttp(400, 'Petición inválida', 'nombre (texto) y precio (número) son obligatorios');
    }
    const producto = { id: String(repo.size + 1), nombre, precio };
    repo.set(producto.id, producto);
    res.status(201).location(`/productos/${producto.id}`).json(producto);
  });

  return router;
}

export function crearApp({ log = console.log } = {}) {
  const repo = new Map([['1', { id: '1', nombre: 'Teclado', precio: 120000 }]]);
  const app = express();
  app.use(idDePeticion);          // 1. todas las peticiones
  app.use(registro(log));         // 2. log al terminar
  app.use(express.json({ limit: '10kb' })); // 3. parsea JSON (400 si viene roto, 413 si es enorme)

  app.get('/salud', (_req, res) => res.json({ estado: 'ok' }));
  app.use('/productos', rutasDeProductos(repo));

  // 404: ninguna ruta respondió. Va DESPUÉS de todas las rutas.
  app.use((req, _res, next) => next(new ErrorHttp(404, 'No encontrado', `No existe ${req.method} ${req.path}`)));

  // MANEJADOR DE ERRORES: Express lo reconoce porque tiene 4 parámetros. Va AL FINAL.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500; // express.json() usa err.status = 400 / 413
    const desconocido = status >= 500;
    if (desconocido) log(`ERROR ${req.id}: ${err.stack}`); // el detalle va al log, no al cliente
    res.status(status).type('application/problem+json').json({
      type: 'about:blank',
      title: err.titulo ?? (desconocido ? 'Error interno' : 'Petición inválida'),
      status,
      detail: desconocido ? 'Ocurrió un error inesperado' : err.message,
      instance: req.originalUrl,
      requestId: req.id,
    });
  });
  return app;
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3096);
  crearApp().listen(puerto, () => console.log(`API Express en http://localhost:${puerto}`));
}
