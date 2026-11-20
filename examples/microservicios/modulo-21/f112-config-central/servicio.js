// Módulo 17 · F112 · Servicio «pedidos» que toma su configuración de Consul y la recarga EN CALIENTE.
// Ejecuta: node f112-config-central/servicio.js     (GET http://localhost:3120/config)
import { createServer } from 'node:http';
import { clienteConsul } from '../comun/consul.js';
import { combinar, leerConfig, observarConfig } from './config-central.js';

const consul = clienteConsul();
let inicial;
try {
  ({ config: inicial } = await leerConfig(consul));
  console.log('configuración inicial (Consul + entorno):', JSON.stringify(inicial));
} catch (error) {
  // Consul no responde al arrancar: se sigue con valores por defecto + entorno y se avisa.
  ({ config: inicial } = combinar([]));
  console.warn(`Consul no disponible (${error.message}); arranco con valores por defecto:`, JSON.stringify(inicial));
}

const observador = observarConfig(consul, { inicial });
observador.on('cambio', (config, claves) => console.log(`recargada en caliente [${claves.join(', ')}]:`, JSON.stringify(config)));
observador.on('rechazo', (motivo) => console.warn(`valor rechazado, conservo el anterior → ${motivo}`));
observador.on('sinConsul', (error) => console.warn(`sin conexión con Consul (${error.message}); sigo con la última configuración`));

const puerto = Number(process.env.PORT ?? 3120);
const servidor = createServer((req, res) => {
  if (req.url === '/config') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(observador.actual())); // cada petición lee la configuración VIGENTE
  }
  res.writeHead(404).end();
});
servidor.listen(puerto, () => console.log(`pedidos escuchando en :${puerto}`));
for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => { observador.detener(); servidor.close(() => process.exit(0)); });
}
