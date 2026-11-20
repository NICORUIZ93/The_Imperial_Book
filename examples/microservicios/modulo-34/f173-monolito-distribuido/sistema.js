// Módulo 30 · F173 · Un «monolito distribuido» de verdad: cuatro servicios HTTP (node:http) que solo funcionan juntos.
// pedidos → inventario, pedidos → precios → impuestos, todo síncrono y con el mismo DTO (campo `precio`).
// Requisitos: Node.js 26.13.1 LTS. Sin dependencias de npm.
import { obtener, servicio } from '../comun/http.js';

// versionPrecios: 1 (campo `precio`), 2 (solo `valor`) o 'compatible' (los dos).
export async function crearSistema({ versionPrecios = 1 } = {}) {
  const impuestos = await servicio('impuestos', async () => ({ estado: 200, cuerpo: { iva: 0.19 } }));
  const precios = await servicio('precios', async (req) => {
    const sku = req.url.split('/').pop();
    const { iva } = await obtener(`${impuestos.url}/impuestos/${sku}`);
    const base = 100;
    const valor = base * (1 + iva);
    // v2 renombra `precio` → `valor`: un cambio «interno» que rompe a quien comparte el DTO.
    // 'compatible' = expandir y contraer: publica los dos campos hasta que ningún consumidor lea `precio`.
    const cuerpo = { 1: { sku, precio: valor }, 2: { sku, valor }, compatible: { sku, valor, precio: valor } }[versionPrecios];
    return { estado: 200, cuerpo };
  });
  const inventario = await servicio('inventario', async () => ({ estado: 200, cuerpo: { disponible: 5 } }));
  const pedidos = await servicio('pedidos', async (req) => {
    const url = new URL(req.url, 'http://x');
    const sku = url.searchParams.get('sku');
    const cantidad = Number(url.searchParams.get('cantidad'));
    const { disponible } = await obtener(`${inventario.url}/stock/${sku}`);
    if (disponible < cantidad) return { estado: 409, cuerpo: { error: 'sin stock' } };
    const { precio } = await obtener(`${precios.url}/precios/${sku}`);
    return { estado: 200, cuerpo: { sku, cantidad, total: precio * cantidad } }; // NaN → null en JSON
  });
  const todos = { pedidos, inventario, precios, impuestos };
  return { ...todos, cerrar: () => Promise.all(Object.values(todos).map((s) => s.cerrar())) };
}

// Disponibilidad de una petición que necesita a TODOS los servicios de la cadena: el producto de cada una.
export const disponibilidadCompuesta = (lista) => lista.reduce((p, a) => p * a, 1);

// Síntomas de monolito distribuido a partir de una descripción del sistema.
export function diagnosticar({ servicios, despliegues }) {
  const sintomas = [];
  const porBd = new Map();
  for (const s of servicios) porBd.set(s.bd, [...(porBd.get(s.bd) ?? []), s.nombre]);
  for (const [bd, nombres] of porBd) if (nombres.length > 1) sintomas.push(`base de datos compartida «${bd}»: ${nombres.join(', ')}`);
  const juntos = despliegues.filter((d) => d.length > 1).length;
  if (juntos / despliegues.length > 0.5)
    sintomas.push(`despliegue en bloque: ${juntos}/${despliegues.length} despliegues llevan varios servicios a la vez`);
  const profundidad = (nombre, visto = new Set()) => {
    if (visto.has(nombre)) return Infinity; // ciclo de llamadas síncronas
    const s = servicios.find((x) => x.nombre === nombre);
    const hijos = s?.llama ?? [];
    return hijos.length ? 1 + Math.max(...hijos.map((h) => profundidad(h, new Set([...visto, nombre])))) : 0;
  };
  const maxima = Math.max(...servicios.map((s) => profundidad(s.nombre)));
  if (maxima > 1) sintomas.push(`cadena síncrona de profundidad ${maxima === Infinity ? '∞ (ciclo)' : maxima}`);
  const libs = new Map();
  for (const s of servicios) for (const l of s.libreriasDeDominio ?? []) libs.set(l, [...(libs.get(l) ?? []), s.nombre]);
  for (const [l, nombres] of libs) if (nombres.length > 1) sintomas.push(`librería de modelos compartida «${l}»: ${nombres.join(', ')}`);
  return { sintomas, veredicto: sintomas.length >= 2 ? 'monolito distribuido' : 'servicios independientes' };
}
