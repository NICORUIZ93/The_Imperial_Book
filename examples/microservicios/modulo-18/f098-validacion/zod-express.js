// Módulo 14 · F098 · Validación con Zod (en Express).
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0 y zod 4.6.7. Ejecuta: node f098-validacion/zod-express.js
import express from 'express';
import * as z from 'zod';

// 1. El ESQUEMA describe la forma válida de los datos. Es código: se puede probar, reutilizar y componer.
export const ClienteNuevo = z.object({
  nombre: z.string().trim().min(2, 'mínimo 2 caracteres'),
  email: z.email('email inválido'),
  edad: z.coerce.number().int().min(18, 'debe ser mayor de edad'), // coerce: "30" → 30
  plan: z.enum(['basico', 'pro']).default('basico'),
}).strict(); // .strict(): rechaza campos que no están en el esquema (p. ej. "rol")

// 2. El TIPO de TypeScript sale del esquema: una sola fuente de verdad (útil si usas TS).
/** @typedef {z.infer<typeof ClienteNuevo>} ClienteNuevoTipo */

// 3. Middleware reutilizable: valida req.body y lo REEMPLAZA por los datos limpios (con defaults y coerciones).
export const validar = (esquema) => (req, res, next) => {
  const resultado = esquema.safeParse(req.body ?? {}); // safeParse no lanza: devuelve { success, data | error }
  if (!resultado.success) {
    return res.status(400).type('application/problem+json').json({
      title: 'Datos inválidos',
      status: 400,
      errores: z.flattenError(resultado.error).fieldErrors, // { campo: [mensajes] }
      desconocidos: resultado.error.issues.filter((i) => i.code === 'unrecognized_keys').flatMap((i) => i.keys),
    });
  }
  req.body = resultado.data;
  next();
};

export function crearApp() {
  const app = express();
  app.use(express.json());
  app.post('/clientes', validar(ClienteNuevo), (req, res) => res.status(201).json(req.body));
  return app;
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3098);
  crearApp().listen(puerto, () => console.log(`API con Zod en http://localhost:${puerto}`));
}
