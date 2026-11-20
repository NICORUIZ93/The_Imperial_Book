// Módulo 29 · F169 · Ley de Conway medida sobre un historial de Git real.
// Idea: si cada cambio de negocio (un commit) toca archivos de varios equipos, la arquitectura obliga a coordinar
// a esos equipos. Comparamos la MISMA base de código con dos organizaciones: por capas y por flujo de negocio.
// Requisitos: Node.js 26.13.1 LTS y Git (cualquier 2.x). Sin dependencias de npm.
import { execFileSync } from 'node:child_process';

// Reglas de propiedad al estilo CODEOWNERS: [patrón, equipo]. El patrón es una expresión regular sobre la ruta.
// Como en CODEOWNERS de GitHub, si varias reglas coinciden, gana la ÚLTIMA.
export function propietario(ruta, reglas) {
  let dueno = 'sin-dueño';
  for (const [patron, equipo] of reglas) if (new RegExp(patron).test(ruta)) dueno = equipo;
  return dueno;
}

// Lee el historial: un objeto por commit con el autor y los archivos que tocó.
export function leerHistorial(dirRepo) {
  const salida = execFileSync('git', ['-C', dirRepo, 'log', '--reverse', '--format=@@%s', '--name-only'], {
    encoding: 'utf8',
  });
  const commits = [];
  for (const linea of salida.split('\n')) {
    if (linea.startsWith('@@')) commits.push({ mensaje: linea.slice(2), archivos: [] });
    else if (linea.trim()) commits.at(-1).archivos.push(linea.trim());
  }
  return commits;
}

// Para cada commit: qué equipos tuvo que tocar. Un commit con 3 equipos = 3 agendas que coordinar y 2 traspasos.
export function analizar(commits, reglas) {
  const porCommit = commits.map((c) => {
    const equipos = [...new Set(c.archivos.map((a) => propietario(a, reglas)))].sort();
    return { mensaje: c.mensaje, equipos, traspasos: equipos.length - 1 };
  });
  const cruzados = porCommit.filter((c) => c.equipos.length > 1).length;
  const traspasos = porCommit.reduce((s, c) => s + c.traspasos, 0);
  // Pares de equipos que cambian juntos: la «estructura de comunicación» que la base de código exige.
  const pares = new Map();
  for (const { equipos } of porCommit)
    for (let i = 0; i < equipos.length; i++)
      for (let j = i + 1; j < equipos.length; j++) {
        const clave = `${equipos[i]} ↔ ${equipos[j]}`;
        pares.set(clave, (pares.get(clave) ?? 0) + 1);
      }
  return {
    commits: porCommit.length,
    cruzados,
    porcentajeCruzados: Math.round((100 * cruzados) / porCommit.length),
    traspasos,
    pares: Object.fromEntries([...pares].sort((a, b) => b[1] - a[1])),
  };
}

// Las dos organizaciones que comparamos sobre el mismo código (carpetas capa/flujo, p. ej. web/pagos).
export const POR_CAPAS = [
  ['^web/', 'equipo-frontend'],
  ['^api/', 'equipo-backend'],
  ['^bd/', 'equipo-datos'],
];
export const POR_FLUJO = [
  ['/pagos/', 'equipo-pagos'],
  ['/catalogo/', 'equipo-catalogo'],
];
