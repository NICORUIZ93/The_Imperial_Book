// F092 · Lee un .cpuprofile (generado con node --cpu-prof) y muestra las 5 funciones con más tiempo propio.
// Ejecuta: node f092-perf/resumir-perfil.js perfiles/*.cpuprofile
// Para verlo gráfico: abre el archivo en Chrome DevTools (pestaña Performance → Load profile) o en VS Code.
import { readFileSync } from 'node:fs';

export function topFunciones(perfil, n = 5) {
  const porId = new Map(perfil.nodes.map((nodo) => [nodo.id, nodo]));
  const muestras = new Map();
  for (const id of perfil.samples) muestras.set(id, (muestras.get(id) ?? 0) + 1);
  const porFuncion = new Map();
  for (const [id, cuenta] of muestras) {
    const { functionName, url, lineNumber } = porId.get(id).callFrame; // destructuring del marco de llamada
    const clave = `${functionName || '(anónima)'} ${url.split('/').pop()}:${lineNumber + 1}`;
    porFuncion.set(clave, (porFuncion.get(clave) ?? 0) + cuenta);
  }
  const total = perfil.samples.length;
  return [...porFuncion].sort((a, b) => b[1] - a[1]).slice(0, n).map(([f, c]) => ({ funcion: f, porcentaje: Math.round((c / total) * 100) }));
}

if (import.meta.main) {
  const archivo = process.argv[2];
  if (!archivo) throw new Error('Uso: node f092-perf/resumir-perfil.js <archivo.cpuprofile>');
  for (const { funcion, porcentaje } of topFunciones(JSON.parse(readFileSync(archivo, 'utf8')))) {
    console.log(`${String(porcentaje).padStart(3)} %  ${funcion}`);
  }
}
