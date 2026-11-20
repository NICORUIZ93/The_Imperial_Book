// Módulo 20 · F128 · El ataque: cinco pruebas, una por categoría, contra las dos versiones.
// Ejecuta: node f128-owasp/ataque.js
import { once } from 'node:events';
import { arrancarServicioInterno, caido } from './comun.js';
import { crearApp as crearAntes } from './antes.js';
import { crearApp as crearDespues } from './despues.js';

const interno = await arrancarServicioInterno();

async function atacar(nombre, crearApp) {
  const registros = [];
  const servidor = crearApp({ log: (linea) => registros.push(linea) }).listen(0);
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const comoAna = { authorization: 'Bearer token-ana' };
  const pedir = async (ruta, opciones = {}) => {
    const r = await fetch(`${base}${ruta}`, { headers: comoAna, ...opciones });
    const texto = (await r.text()).replace(/"incidente":"[^"]+"/, '"incidente":"<uuid>"').replace(/\(file:[^)]*\)/g, '(file://…)');
    return `${r.status} ${texto.length > 150 ? `${texto.slice(0, 150)}…` : texto}`;
  };
  console.log(`== ${nombre}`);
  console.log(`   A01 Ana pide la factura 2 (de Luis)        -> ${await pedir('/facturas/2')}`);
  console.log(`   A01 SSRF: vista previa del servicio interno -> ${await pedir(`/vista-previa?url=${encodeURIComponent(interno.url)}`)}`);
  console.log(`   A02 respuesta ante un error inesperado      -> ${await pedir('/fallo')}`);
  caido.valor = true;
  console.log(`   A10 exportar con el servicio de permisos caído -> ${await pedir('/exportar', { method: 'POST' })}`);
  caido.valor = false;
  await pedir('/admin');
  const denegados = registros.filter((linea) => linea.includes('acceso_denegado')).length;
  console.log(`   A09 eventos «acceso_denegado» registrados   -> ${denegados}${denegados ? ` (p. ej. ${registros.find((l) => l.includes('acceso_denegado')).replace(/"ip":"[^"]+"/, '"ip":"<ip>"')})` : ' (nadie se entera del intento)'}`);
  servidor.close();
}
await atacar('ANTES (vulnerable)', crearAntes);
await atacar('DESPUÉS (seguro)', crearDespues);
interno.cerrar();
