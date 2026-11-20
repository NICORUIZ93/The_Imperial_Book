// Módulo 20 · F126 · ANTI-PATRÓN: validar el origen «más o menos» (endsWith, includes, regex sin anclar).
// Ejecuta: node f126-helmet-cors/anti-patron.js
const flojas = {
  "endsWith('tienda.example')": (o) => o.endsWith('tienda.example'),
  "includes('tienda.example')": (o) => o.includes('tienda.example'),
  '/tienda\\.example/.test()': (o) => /tienda\.example/.test(o),
};
const exacta = (o) => new Set(['https://tienda.example', 'https://admin.tienda.example']).has(o);
const atacantes = ['https://sitio-malotienda.example', 'https://tienda.example.sitio-malo.example', 'http://tienda.example'];

for (const [nombre, valida] of Object.entries(flojas)) {
  console.log(`${nombre.padEnd(28)} acepta: ${atacantes.filter(valida).join(', ') || '(ninguno)'}`);
}
console.log(`${'Set.has() (igualdad exacta)'.padEnd(28)} acepta: ${atacantes.filter(exacta).join(', ') || '(ninguno)'}`);
