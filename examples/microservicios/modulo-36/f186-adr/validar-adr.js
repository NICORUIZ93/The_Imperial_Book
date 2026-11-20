// Módulo 32 · F186 · Valida que un ADR tiene lo que exige el curso (plantilla de docs/microservicios/07-plantillas.md):
// estado y fecha, contexto CON NÚMEROS, al menos 3 opciones (la elegida + 2 alternativas) con trade-offs, decisión,
// consecuencias negativas, fitness function y condición de revisión.
// Uso: node f186-adr/validar-adr.js f186-adr/adr/*.md
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SECCIONES = ['Contexto', 'Opciones consideradas', 'Decisión', 'Consecuencias', 'Fitness function', 'Cuándo revisar esta decisión'];

export function validarAdr(texto) {
  const faltas = [];
  if (!/^# ADR-\d{4}: .+/m.test(texto)) faltas.push('título «# ADR-NNNN: decisión en una frase»');
  for (const campo of ['Estado', 'Fecha']) if (!new RegExp(`\\*\\*${campo}:\\*\\* \\S`).test(texto)) faltas.push(`campo ${campo}`);
  const seccion = (n) => (texto.split(new RegExp(`^## ${n}\\s*$`, 'm'))[1] ?? '').split(/^## /m)[0];
  for (const s of SECCIONES) if (!new RegExp(`^## ${s}\\s*$`, 'm').test(texto)) faltas.push(`sección «${s}»`);
  if (!/\d/.test(seccion('Contexto'))) faltas.push('números en el contexto (carga, latencia, límite, coste)');
  const opciones = seccion('Opciones consideradas').split('\n').filter((l) => /^\| [A-Z]\. /.test(l));
  if (opciones.length < 3) faltas.push(`3 opciones o más (hay ${opciones.length}): la elegida y 2 alternativas`);
  if (!/Negativas/.test(seccion('Consecuencias'))) faltas.push('consecuencias negativas (el trade-off aceptado)');
  return faltas;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let mal = 0;
  for (const ruta of process.argv.slice(2)) {
    const faltas = validarAdr(readFileSync(ruta, 'utf8'));
    console.log(faltas.length ? `✘ ${ruta}: falta ${faltas.join('; ')}` : `✔ ${ruta}`);
    if (faltas.length) mal++;
  }
  process.exitCode = mal ? 1 : 0;
}
