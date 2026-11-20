// Módulo 0.4 · YAML: leer un archivo de configuración YAML y usarlo como datos.
// Requisitos: Node.js 26.13.1 LTS y la librería yaml 2.9.1 (npm install, ver package.json).
// Ejecuta (desde la carpeta yaml/):  npm install && node leer-config.js

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export function leerConfig(textoYaml) {
  return parse(textoYaml);
}

if (import.meta.main) {
  const config = leerConfig(readFileSync(new URL('./config.yaml', import.meta.url), 'utf8'));
  console.log(`Servicio: ${config.servicio.nombre} en el puerto ${config.servicio.puerto} (tipo ${typeof config.servicio.puerto})`);
  console.log(`Depuración: ${config.servicio.depuracion} (tipo ${typeof config.servicio.depuracion})`);
  console.log(`Países: ${config.paises_habilitados.join(', ')}`);
  console.log('Mismo contenido en JSON:', JSON.stringify(config));
}
