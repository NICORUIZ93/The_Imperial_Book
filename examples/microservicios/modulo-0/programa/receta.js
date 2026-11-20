// Módulo 0.1 · Qué es un programa
// Un programa es una lista de instrucciones que la computadora sigue en orden.
// Este programa hace lo mismo que harías tú con papel y lápiz:
// sumar el precio de una lista de compras y decir si alcanza el dinero.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node programa/receta.js

// 1. DATOS: lo que el programa recibe (los ingredientes de la receta).
const listaDeCompras = [
  { producto: 'Arroz', precio: 4500 },
  { producto: 'Huevos', precio: 12000 },
  { producto: 'Tomates', precio: 3500 },
];
const dineroEnLaBilletera = 20000;

// 2. INSTRUCCIONES: una función es una receta con nombre que se puede repetir.
export function calcularTotal(lista) {
  let total = 0; // empezamos en cero
  for (const item of lista) { // repetimos para cada producto...
    total = total + item.precio; // ...y sumamos su precio
  }
  return total; // devolvemos el resultado
}

export function alcanzaElDinero(total, dinero) {
  return total <= dinero; // true (sí) o false (no)
}

// 3. RESULTADO: lo que el programa muestra al terminar.
// import.meta.main es true solo cuando ejecutas este archivo directamente
// (no cuando el test lo importa).
if (import.meta.main) {
  const total = calcularTotal(listaDeCompras);
  console.log(`Productos: ${listaDeCompras.length}`);
  console.log(`Total a pagar: ${total}`);
  console.log(`¿Alcanza con ${dineroEnLaBilletera}? ${alcanzaElDinero(total, dineroEnLaBilletera) ? 'Sí' : 'No'}`);
}
