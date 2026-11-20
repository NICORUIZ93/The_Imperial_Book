// F098 · Error común: usar .parse() (que LANZA) en vez de .safeParse() y no capturar el error.
// El cliente recibe un 500 en vez de un 400 y el log se llena de ZodError.
// Ejecuta: node f098-validacion/error-comun.js   y luego: curl -s -X POST localhost:3199/clientes -H 'content-type: application/json' -d '{"edad":15}'
import express from 'express';
import { ClienteNuevo } from './zod-express.js';

const app = express();
app.use(express.json());
app.post('/clientes', (req, res) => {
  const cliente = ClienteNuevo.parse(req.body); // ❌ lanza ZodError → Express responde 500
  res.status(201).json(cliente);
});
app.listen(3199, () => console.log('escuchando en 3199'));
