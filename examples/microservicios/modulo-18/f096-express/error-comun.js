// F096 · Error común: el «manejador de errores» tiene 3 parámetros, así que Express lo trata como un middleware
// normal, se lo salta cuando hay un error y responde con su página HTML por defecto (con el stack en desarrollo).
// Ejecuta: node f096-express/error-comun.js   y luego: curl -i localhost:3196/falla
import express from 'express';

const app = express();
app.get('/falla', async () => {
  throw new Error('la base de datos no responde');
});
app.use((err, req, res) => { // ❌ falta el cuarto parámetro `next`
  res.status(500).json({ error: err.message });
});
app.listen(3196, () => console.log('escuchando en 3196'));
