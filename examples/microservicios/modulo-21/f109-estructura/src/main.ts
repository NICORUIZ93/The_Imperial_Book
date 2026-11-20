// Módulo 17 · F109 · Estructura de carpetas escalable.
// Requisitos: Node.js 26.13.1 LTS (ejecuta TypeScript quitando los tipos). Ejecuta: node f109-estructura/src/main.ts
// main.ts es el punto de entrada: lee la configuración, arma la app, escucha y apaga con orden.
import { crearApp } from './app.ts';
import { leerConfig } from './config/config.ts';

const config = leerConfig();
const servidor = crearApp(config);
servidor.listen(config.puerto, () => console.log(`${config.servicio} escuchando en http://localhost:${config.puerto}`));

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
