// Módulo 16 · F106 · Supertest: la API se construye en una función que NO abre ningún puerto.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, supertest 7.3.2, jest 30.5.2, ts-jest 29.4.15.
import express, { type ErrorRequestHandler, type Express } from 'express';

export interface Producto {
  sku: string;
  nombre: string;
  precio: number;
}

// El repositorio llega como parámetro: el test pasa uno en memoria; producción, uno con base de datos.
export interface Repositorio {
  buscar(sku: string): Promise<Producto | undefined>;
  guardar(producto: Producto): Promise<void>;
}

export function repositorioEnMemoria(iniciales: Producto[] = []): Repositorio {
  const datos = new Map(iniciales.map((p) => [p.sku, p]));
  return {
    buscar: async (sku) => datos.get(sku),
    guardar: async (producto) => {
      datos.set(producto.sku, producto);
    },
  };
}

export function crearApp(repositorio: Repositorio): Express {
  const app = express();
  app.use(express.json());

  app.get('/productos/:sku', async (req, res) => {
    const producto = await repositorio.buscar(req.params.sku);
    if (!producto) return res.status(404).json({ error: `No existe el producto ${req.params.sku}` });
    res.json(producto);
  });

  app.post('/productos', async (req, res) => {
    if (req.get('x-api-key') !== 'clave-de-prueba') return res.status(401).json({ error: 'Falta la cabecera x-api-key' });
    const { sku, nombre, precio } = req.body ?? {};
    const errores: string[] = [];
    if (typeof sku !== 'string' || !/^[A-Z]{3}-\d{3}$/.test(sku)) errores.push('sku debe tener la forma ABC-123');
    if (typeof nombre !== 'string' || nombre.length < 3) errores.push('nombre debe tener al menos 3 letras');
    if (typeof precio !== 'number' || precio <= 0) errores.push('precio debe ser un número mayor que 0');
    if (errores.length > 0) return res.status(400).json({ errores });
    if (await repositorio.buscar(sku)) return res.status(409).json({ error: `Ya existe el producto ${sku}` });
    await repositorio.guardar({ sku, nombre, precio });
    res.status(201).location(`/productos/${sku}`).json({ sku, nombre, precio });
  });

  // Express 5 envía aquí los errores de los handlers async (por ejemplo, si el repositorio lanza).
  const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
    // express.json() marca así un cuerpo que no es JSON válido: es culpa del cliente (400), no del servidor.
    if (error?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON mal formado' });
    res.status(500).json({ error: 'Error interno' }); // nunca devuelvas el mensaje o la traza del error real
  };
  app.use(manejarErrores);

  return app;
}
