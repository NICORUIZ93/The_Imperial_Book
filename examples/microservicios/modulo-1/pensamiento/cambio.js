// Módulo 0.2 · Pensamiento computacional
// Problema: una caja registradora debe devolver el cambio con la menor cantidad de billetes/monedas.
// Las 4 herramientas del pensamiento computacional aplicadas:
//   1. Descomposición: "dar cambio" = calcular el vuelto + elegir piezas + contar piezas.
//   2. Patrones: siempre se repite lo mismo: "toma la pieza más grande que quepa".
//   3. Abstracción: no importa si son pesos o dólares; solo importan los valores de las piezas.
//   4. Algoritmo: los pasos exactos, en orden, que escribimos abajo.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node pensamiento/cambio.js

// Paso de la descomposición 1: calcular el vuelto.
export function calcularVuelto(precio, pagado) {
  if (pagado < precio) throw new Error(`Faltan ${precio - pagado} para pagar`);
  return pagado - precio;
}

// Pasos 2 y 3: elegir piezas (patrón repetido) usando valores abstractos.
export function darCambio(monto, piezas = [50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100]) {
  const ordenadas = [...piezas].sort((a, b) => b - a); // de la más grande a la más pequeña
  const resultado = {};
  let restante = monto;
  for (const pieza of ordenadas) {
    const cuantas = Math.floor(restante / pieza); // ¿cuántas veces cabe esta pieza?
    if (cuantas > 0) {
      resultado[pieza] = cuantas;
      restante -= cuantas * pieza;
    }
  }
  if (restante !== 0) throw new Error(`No se puede dar exacto: sobran ${restante}`);
  return resultado;
}

export function contarPiezas(cambio) {
  return Object.values(cambio).reduce((suma, n) => suma + n, 0);
}

if (import.meta.main) {
  const vuelto = calcularVuelto(13700, 50000);
  const cambio = darCambio(vuelto);
  console.log(`Precio 13700, pagan con 50000 -> vuelto ${vuelto}`);
  for (const [pieza, cuantas] of Object.entries(cambio).sort((a, b) => b[0] - a[0])) {
    console.log(`  ${cuantas} x ${pieza}`);
  }
  console.log(`Piezas entregadas: ${contarPiezas(cambio)}`);
}
