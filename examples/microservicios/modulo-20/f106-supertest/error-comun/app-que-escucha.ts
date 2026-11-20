// ERROR COMÚN F106: el mismo archivo crea la app Y abre el puerto. Cada archivo de test que lo importe intentará abrir el 3106.
import express from 'express';

export const app = express();
app.get('/salud', (_req, res) => res.json({ ok: true }));
app.listen(3106);
