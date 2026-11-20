// Módulo 23 · F142 · Revisor estático de Dockerfiles: lee las instrucciones y aplica 7 reglas del módulo.
// No necesita Docker. Uso: node f142-dockerfile/revisar.js f142-dockerfile/Dockerfile [otro…]
import { readFileSync } from 'node:fs';

/** Convierte el Dockerfile en instrucciones {op, args, etapa}, uniendo líneas terminadas en «\». */
export function instrucciones(texto) {
  const lineas = texto.replace(/\\\r?\n/g, ' ').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const res = [];
  let etapa = -1;
  for (const linea of lineas) {
    const [op, ...resto] = linea.split(/\s+/);
    const OP = op.toUpperCase();
    if (OP === 'FROM') etapa += 1;
    res.push({ op: OP, args: resto.join(' '), etapa });
  }
  return res;
}

export const REGLAS = [
  ['varias etapas (multi-stage)', (ins) => ins.filter((i) => i.op === 'FROM').length >= 2],
  ['imagen base con versión exacta (nada de :latest ni sin etiqueta)', (ins) => ins.filter((i) => i.op === 'FROM').every((i) => {
    const imagen = i.args.split(/\s+/)[0];
    return imagen.includes('@sha256:') || (/:[^:]+$/.test(imagen) && !imagen.endsWith(':latest')) || !imagen.includes('/') && !imagen.includes(':') && ins.some((x) => x.op === 'FROM' && x.args.endsWith(`AS ${imagen}`));
  })],
  ['la imagen final no corre como root (USER)', (ins) => {
    const ultima = Math.max(...ins.map((i) => i.etapa));
    const users = ins.filter((i) => i.op === 'USER' && i.etapa === ultima);
    return users.length > 0 && !/^(root|0)(:|$)/.test(users.at(-1).args);
  }],
  ['instala con npm ci (respeta el lockfile)', (ins) => ins.some((i) => i.op === 'RUN' && /npm ci\b/.test(i.args)) && !ins.some((i) => i.op === 'RUN' && /npm install\b/.test(i.args))],
  ['la etapa final no instala devDependencies', (ins) => {
    const ultima = Math.max(...ins.map((i) => i.etapa));
    const final = ins.filter((i) => i.etapa === ultima);
    return !final.some((i) => i.op === 'RUN' && /npm (ci|install)\b/.test(i.args) && !/--omit=dev/.test(i.args));
  }],
  ['no copia todo el contexto con «COPY . .»', (ins) => !ins.some((i) => i.op === 'COPY' && /^(--\S+\s+)*\.\s+\.$/.test(i.args))],
  ['CMD en forma exec y con node (no npm)', (ins) => {
    const cmd = ins.filter((i) => i.op === 'CMD').at(-1);
    return Boolean(cmd) && cmd.args.startsWith('[') && JSON.parse(cmd.args)[0] === 'node';
  }],
];

export function revisar(texto) {
  const ins = instrucciones(texto);
  return REGLAS.map(([regla, cumple]) => ({ regla, ok: cumple(ins) }));
}

if (import.meta.main) {
  let fallos = 0;
  for (const archivo of process.argv.slice(2)) {
    console.log(`== ${archivo}`);
    for (const { regla, ok } of revisar(readFileSync(archivo, 'utf8'))) {
      console.log(`   ${ok ? '✔' : '✘'} ${regla}`);
      if (!ok) fallos += 1;
    }
  }
  console.log(`reglas incumplidas: ${fallos}`);
}
