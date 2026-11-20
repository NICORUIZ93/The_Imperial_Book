// Módulo 0.4 · JSON: convertir texto JSON en datos (parse) y datos en texto JSON (stringify).
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). JSON viene incluido en JavaScript.
// Ejecuta: node json/json.js

// Así llega un pedido por la red: es TEXTO, aunque parezca un objeto.
const texto = '{"cliente":"Ana","items":[{"plato":"Arepa","cantidad":2}],"pagado":false,"nota":null}';

// parse: texto -> datos que el programa puede usar
export function leerPedido(textoJson) {
  try {
    return { ok: true, datos: JSON.parse(textoJson) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// stringify: datos -> texto para enviar o guardar (con sangría de 2 espacios para leerlo)
export function escribirPedido(pedido) {
  return JSON.stringify(pedido, null, 2);
}

if (import.meta.main) {
  const { datos } = leerPedido(texto);
  console.log(`typeof texto = ${typeof texto}, typeof datos = ${typeof datos}`);
  console.log(`Cliente: ${datos.cliente}, primer plato: ${datos.items[0].plato} x${datos.items[0].cantidad}`);
  datos.pagado = true;
  console.log(escribirPedido(datos));
  // JSON inválido: comillas simples y coma final NO están permitidas en JSON.
  console.log(leerPedido("{'cliente':'Ana',}"));
}
