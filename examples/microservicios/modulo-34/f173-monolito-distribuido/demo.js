// Módulo 30 · F173 · Ejecuta: node f173-monolito-distribuido/demo.js
import { obtener } from '../comun/http.js';
import { crearSistema, diagnosticar, disponibilidadCompuesta } from './sistema.js';

const s = await crearSistema();
const pedir = () => obtener(`${s.pedidos.url}/pedidos/simular?sku=TEC-1&cantidad=2`).then(
  (r) => `200 ${JSON.stringify(r)}`, (e) => `error: ${e.message}`);
console.log(`1. Los 4 servicios arriba      → ${await pedir()}`);
await s.impuestos.cerrar(); // se cae el servicio más «pequeño» y lejano
console.log(`2. Cae impuestos (a 2 saltos)  → ${await pedir()}`);
await s.cerrar();

const a = disponibilidadCompuesta([0.995, 0.995, 0.995, 0.995]);
console.log(`3. Disponibilidad: 4 servicios al 99,5 % en cadena → ${(a * 100).toFixed(2)} % (≈ ${Math.round((1 - a) * 30 * 24)} h caídas al mes)`);

const d = diagnosticar({
  servicios: [
    { nombre: 'pedidos', bd: 'tienda', llama: ['inventario', 'precios'], libreriasDeDominio: ['tienda-modelos'] },
    { nombre: 'inventario', bd: 'tienda', llama: [], libreriasDeDominio: ['tienda-modelos'] },
    { nombre: 'precios', bd: 'precios', llama: ['impuestos'], libreriasDeDominio: ['tienda-modelos'] },
    { nombre: 'impuestos', bd: 'impuestos', llama: [] },
  ],
  despliegues: [['pedidos', 'precios'], ['pedidos', 'inventario', 'precios'], ['impuestos'], ['pedidos', 'precios']],
});
console.log(`4. Diagnóstico: ${d.veredicto}`);
for (const x of d.sintomas) console.log(`   - ${x}`);
