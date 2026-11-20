// Módulo 23 · Arranque y apagado ordenado del servicio «pedidos».
// En Kubernetes, al borrar un pod llega SIGTERM; el pod tiene terminationGracePeriodSeconds (30 s por defecto)
// antes de SIGKILL. Aquí: (1) dejamos de estar «listos», (2) esperamos a que el Service nos saque de sus Endpoints,
// (3) cerramos el servidor dejando terminar las peticiones en curso y (4) salimos con código 0.
import { crearApp, type Estado } from './app.js';

const puerto = Number(process.env.PORT ?? 8080);
const esperaDrenadoMs = Number(process.env.ESPERA_DRENADO_MS ?? 5000);
const estado: Estado = {
  listo: false,
  version: process.env.VERSION ?? 'dev',
  tasaError: Number(process.env.TASA_ERROR ?? 0),
};

const servidor = crearApp(estado).listen(puerto, () => {
  estado.listo = true;
  console.log(JSON.stringify({ msg: 'escuchando', puerto, version: estado.version, pid: process.pid }));
});

process.on('SIGTERM', () => {
  console.log(JSON.stringify({ msg: 'SIGTERM: dejo de estar lista y drenando', esperaDrenadoMs }));
  estado.listo = false;
  setTimeout(() => {
    servidor.close(() => {
      console.log(JSON.stringify({ msg: 'cerrado limpio', codigo: 0 }));
      process.exit(0);
    });
    servidor.closeIdleConnections();
  }, esperaDrenadoMs);
});
