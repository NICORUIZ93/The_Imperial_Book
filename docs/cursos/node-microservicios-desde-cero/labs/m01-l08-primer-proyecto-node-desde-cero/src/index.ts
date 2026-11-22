export function saludo(nombre: string): string {
  return `Hola, ${nombre}. Proyecto Node listo.`;
}

if (require.main === module) {
  console.log(saludo("estudiante"));
}
