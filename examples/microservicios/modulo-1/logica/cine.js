// Módulo 0.2 · Lógica de programación
// Los 4 ladrillos de cualquier programa: variables, decisiones, repeticiones y funciones.
// Ejemplo: la taquilla de un cine decide quién entra y cuánto paga.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Sin dependencias.
// Ejecuta: node logica/cine.js

// FUNCIÓN + DECISIÓN: ¿puede entrar a una película para mayores de 18?
// Regla: entra si tiene boleto Y (es mayor de edad O va con un adulto).
export function puedeEntrar(edad, tieneBoleto, vaConAdulto) {
  return tieneBoleto && (edad >= 18 || vaConAdulto);
}

// DECISIÓN CON VARIAS RAMAS: el precio depende de la edad.
export function precioBoleto(edad) {
  if (edad < 0) {
    throw new Error('La edad no puede ser negativa');
  } else if (edad < 12) {
    return 8000; // niños
  } else if (edad >= 60) {
    return 7000; // adultos mayores
  } else {
    return 12000; // general
  }
}

// REPETICIÓN: recorre la fila y suma lo que paga cada persona.
export function cobrarFila(edades) {
  let total = 0; // VARIABLE: una caja con nombre cuyo contenido cambia
  for (const edad of edades) {
    total += precioBoleto(edad);
  }
  return total;
}

if (import.meta.main) {
  const fila = [8, 25, 67, 15];
  console.log(`Fila: ${fila.join(', ')} años`);
  for (const edad of fila) {
    console.log(`  ${edad} años -> paga ${precioBoleto(edad)}`);
  }
  console.log(`Total de la fila: ${cobrarFila(fila)}`);
  console.log(`¿Entra un chico de 15 con boleto y sin adulto? ${puedeEntrar(15, true, false)}`);
  console.log(`¿Entra un chico de 15 con boleto y con adulto? ${puedeEntrar(15, true, true)}`);
}
