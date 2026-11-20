// Módulo 13 · F089 · ES6+: async/await, Promises, destructuring, modules.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Este archivo es un MÓDULO ES: exporta con `export` y se importa con `import` (package.json: "type": "module").

export const IVA = 0.19; // export con nombre

// Destructuring en los parámetros: sacamos `items` y `descuento` del objeto (con valor por defecto 0).
export function calcularTotal({ items, descuento = 0 }) {
  // Destructuring dentro del callback: de cada item solo nos interesan precio y cantidad.
  const subtotal = items.reduce((acc, { precio, cantidad }) => acc + precio * cantidad, 0);
  return Math.round(subtotal * (1 - descuento) * (1 + IVA));
}

// Simula un servicio remoto: devuelve una PROMESA que se cumple (resolve) o se rechaza (reject) tras `ms`.
const clientes = { c1: { id: 'c1', nombre: 'Ana', ciudad: 'Bogotá' }, c2: { id: 'c2', nombre: 'Luis', ciudad: 'Lima' } };
export function buscarCliente(id, ms = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cliente = clientes[id];
      if (cliente) resolve(cliente);
      else reject(new Error(`Cliente ${id} no existe`));
    }, ms);
  });
}

// async/await en SECUENCIA: cada await espera al anterior (3 llamadas de 100 ms ≈ 300 ms).
export async function nombresEnSerie(ids) {
  const nombres = [];
  for (const id of ids) {
    const { nombre } = await buscarCliente(id); // destructuring del resultado
    nombres.push(nombre);
  }
  return nombres;
}

// async/await en PARALELO: Promise.all lanza todas a la vez y espera a todas (≈ 100 ms).
// Si UNA se rechaza, Promise.all se rechaza con ese error.
export async function nombresEnParalelo(ids) {
  const clientesEncontrados = await Promise.all(ids.map((id) => buscarCliente(id)));
  return clientesEncontrados.map(({ nombre }) => nombre);
}

// Promise.allSettled nunca se rechaza: devuelve el estado de cada promesa.
export async function informe(ids) {
  const resultados = await Promise.allSettled(ids.map((id) => buscarCliente(id, 10)));
  return resultados.map((r, i) => (r.status === 'fulfilled' ? `${ids[i]}: ${r.value.nombre}` : `${ids[i]}: ERROR ${r.reason.message}`));
}

// Spread y rest: copiar sin mutar el original.
export function conCiudad(cliente, ciudad) {
  const { id, ...resto } = cliente; // rest: todo menos id
  return { id, ...resto, ciudad }; // spread: copia y sobrescribe ciudad
}
