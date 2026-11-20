// Módulo 0.3 · Java y Node.js lado a lado: sintaxis y ejecución
// El MISMO programa que java/Tienda.java, escrito en JavaScript para Node.js.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta (desde la carpeta node/):  node tienda.js

// En JavaScript no hace falta una clase: las funciones viven sueltas en el archivo.
// Un objeto { } cumple el papel del record de Java, pero sin tipos declarados.
export function subtotal(p) {
  return p.precio * p.cantidad;
}

export function total(carrito) {
  let suma = 0; // let = variable que puede cambiar; no declara tipo
  for (const p of carrito) {
    suma += subtotal(p);
  }
  return suma;
}

export function envio(total) {
  if (total >= 50000) {
    return 'gratis';
  }
  return '5000';
}

// No hay método main: Node ejecuta el archivo de arriba abajo.
// import.meta.main es true solo cuando ejecutas este archivo directamente.
if (import.meta.main) {
  const carrito = [
    { nombre: 'Cuaderno', precio: 6000, cantidad: 3 },
    { nombre: 'Lápiz', precio: 1500, cantidad: 4 },
    { nombre: 'Mochila', precio: 32000, cantidad: 1 },
  ];
  for (const p of carrito) {
    console.log(`${p.nombre.padEnd(9)} x${p.cantidad} = ${subtotal(p)}`);
  }
  const t = total(carrito);
  console.log('Total: ' + t);
  console.log('Envío: ' + envio(t));
}
